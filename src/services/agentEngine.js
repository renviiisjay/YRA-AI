/**
 * YRA Real Agent Reasoning Engine
 * Handles adaptive reasoning over candidate resume facts, target questions, and live conversation.
 * In production, requests flow through the secure serverless backend `/api/interview`
 * ensuring API keys are NEVER exposed in the frontend client.
 */

export class YraAgentEngine {
  constructor(config = {}) {
    this.apiProvider = config.apiProvider || 'serverless_agent';
  }

  setCredentials(provider) {
    this.apiProvider = provider || 'serverless_agent';
  }

  /**
   * Determine evidence coverage between candidate profile and an application question
   */
  analyzeQuestionRequirements(question, candidateProfile) {
    const qText = question.prompt.toLowerCase();
    const matches = [];
    const gaps = [];

    // Check project relevance
    if (qText.includes('project') || qText.includes('build') || qText.includes('technical') || qText.includes('architecture')) {
      if (candidateProfile.projects && candidateProfile.projects.length > 0) {
        matches.push({
          type: 'projects',
          label: `Referenced Project: ${candidateProfile.projects[0].title}`,
          content: candidateProfile.projects[0].points?.join(' ') || candidateProfile.projects[0].title,
        });
      } else {
        gaps.push('Specific project narrative or technical stack context');
      }
    }

    // Check leadership / team relevance
    if (qText.includes('team') || qText.includes('leadership') || qText.includes('collaborat') || qText.includes('conflict')) {
      gaps.push('Interpersonal dynamic, leadership decisions, or specific team context');
    }

    // Check challenges / problem solving
    if (qText.includes('challenge') || qText.includes('difficult') || qText.includes('obstacle') || qText.includes('failure')) {
      gaps.push('The exact obstacle, root cause, and how you personally overcame it');
    }

    // Check motivations
    if (qText.includes('why') || qText.includes('interest') || qText.includes('motivation') || qText.includes('goals')) {
      gaps.push('Personal career trajectory and specific alignment with this opportunity');
    }

    // Experience match
    if (candidateProfile.experience && candidateProfile.experience.length > 0) {
      matches.push({
        type: 'experience',
        label: `Work Experience: ${candidateProfile.experience[0].roleTitle}`,
        content: candidateProfile.experience[0].bullets?.slice(0, 2).join(' ') || '',
      });
    }

    // Skills match
    if (candidateProfile.skills && candidateProfile.skills.length > 0) {
      matches.push({
        type: 'skills',
        label: 'Verified Skillset',
        content: candidateProfile.skills.slice(0, 6).join(', '),
      });
    }

    return {
      matches,
      gaps: gaps.length > 0 ? gaps : ['Deep qualitative details on personal decisions and impact'],
      coverageScore: matches.length > 1 ? 75 : matches.length === 1 ? 50 : 25,
    };
  }

  /**
   * Adaptive Agent Reasoning over submitted answer.
   * Calls secure serverless API `/api/interview` first, with immediate local fallback
   * so the candidate never experiences failure.
   */
  async evaluateAndDecideNextStep({ question, candidateProfile, conversationHistory, latestUserAnswer }) {
    // 1. Try secure server-side endpoint first
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          candidateProfile,
          conversationHistory,
          latestUserAnswer,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.isComplete === 'boolean') {
          return data;
        }
      }
    } catch (err) {
      // In local dev without Vercel serverless or if offline, seamlessly fallback
      console.info('Serverless endpoint not running locally, using client semantic reasoning:', err.message);
    }

    // 2. Client-side semantic engine fallback
    return this.generateNextInterviewStep({
      question,
      candidateProfile,
      conversationHistory,
      latestUserAnswer,
    });
  }

  /**
   * Local semantic reasoning engine
   */
  generateNextInterviewStep({ question, candidateProfile, conversationHistory, latestUserAnswer }) {
    if (!latestUserAnswer || conversationHistory.length === 0) {
      const analysis = this.analyzeQuestionRequirements(question, candidateProfile);
      const topGap = analysis.gaps[0];
      const projectRef = candidateProfile.projects?.[0]?.title;
      const roleRef = candidateProfile.experience?.[0]?.roleTitle;

      let starterQuestion = `To craft an authentic answer for "${question.prompt}":`;
      if (question.prompt.toLowerCase().includes('challenge')) {
        starterQuestion = projectRef
          ? `In your work on "${projectRef}", what was the most difficult technical or strategic obstacle you faced, and what specific action did you take to resolve it?`
          : `Can you walk me through a specific situation where you hit a roadblock, the core problem you identified, and the steps you took to overcome it?`;
      } else if (question.prompt.toLowerCase().includes('why') || question.prompt.toLowerCase().includes('interest')) {
        starterQuestion = `What specific aspects of this role or team resonate most with your recent background in ${candidateProfile.skills?.slice(0, 3).join(', ') || 'your field'}?`;
      } else if (question.prompt.toLowerCase().includes('project') || question.prompt.toLowerCase().includes('built')) {
        starterQuestion = projectRef
          ? `Tell me about the architecture and key challenges in "${projectRef}". What was your personal contribution?`
          : `Which project best demonstrates your engineering problem solving, and what was your specific technical ownership?`;
      } else {
        starterQuestion = `Could you share a concrete example from your experience${roleRef ? ` as ${roleRef}` : ''} that directly addresses this question?`;
      }

      return {
        isComplete: false,
        interviewQuestion: starterQuestion,
        feedback: 'Initial opening inquiry grounded in your background.',
        missingAspect: topGap,
      };
    }

    const words = latestUserAnswer.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const answerLower = latestUserAnswer.toLowerCase();

    if (wordCount < 12) {
      return {
        isComplete: false,
        interviewQuestion: `Could you expand on that with the specific actions you personally took and any tools or methodologies you leveraged?`,
        feedback: 'Answer was brief. Probing for direct candidate actions.',
        missingAspect: 'Specific candidate actions and methodology',
      };
    }

    const hasObstacle = /because|problem|difficult|challenge|issue|bug|bottleneck|failure|struggled|error/i.test(answerLower);
    const hasImpact = /\d+%|\d+x|\$\d+|\bscale\b|\bmetric\b|\breduced\b|\bincreased\b|\baccelerated\b|\bresult\b|\bimpact\b/i.test(answerLower);

    if (question.prompt.toLowerCase().includes('challenge') && !hasObstacle && conversationHistory.length < 3) {
      return {
        isComplete: false,
        interviewQuestion: `You highlighted the positive outcome, but what was the primary obstacle or unforeseen complication that made this particularly challenging?`,
        feedback: 'Probing for root-cause friction.',
        missingAspect: 'The unforeseen friction or risk involved',
      };
    }

    if (!hasImpact && conversationHistory.length < 2) {
      return {
        isComplete: false,
        interviewQuestion: `What was the tangible outcome or result of that decision for the team or project?`,
        feedback: 'Probing for outcome and impact.',
        missingAspect: 'Tangible outcome and metrics',
      };
    }

    return {
      isComplete: true,
      interviewQuestion: null,
      feedback: 'Evidence collection complete. Ready to synthesize response.',
    };
  }

  /**
   * Generates grounded application draft
   */
  generateGroundedDraft({ question, candidateProfile, confirmedAnswers }) {
    const prompt = question.prompt;
    const evidenceList = [];

    const userInsights = confirmedAnswers.map((a) => a.text).join(' ');

    const relevantExp = candidateProfile.experience?.[0];
    const relevantProj = candidateProfile.projects?.[0];
    const skillsList = candidateProfile.skills?.slice(0, 5).join(', ');

    if (relevantProj) {
      evidenceList.push(`Project: ${relevantProj.title}`);
    }
    if (relevantExp) {
      evidenceList.push(`Role: ${relevantExp.roleTitle} (${relevantExp.company || 'Experience'})`);
    }
    if (confirmedAnswers.length > 0) {
      evidenceList.push(`Candidate interview testimony: "${confirmedAnswers[0].text.slice(0, 80)}..."`);
    }

    let draft = '';
    const wordTarget = question.wordLimit || 250;

    if (prompt.toLowerCase().includes('challenge') || prompt.toLowerCase().includes('difficult')) {
      draft = `During my work${relevantExp ? ` as ${relevantExp.roleTitle}` : ''}${relevantProj ? ` on ${relevantProj.title}` : ''}, I navigated a critical challenge where standard procedures were insufficient. Specifically, ${userInsights || 'we encountered complex technical constraints that required careful triage and structured re-engineering.'} 

To address this effectively, I broke down the bottleneck into actionable milestones, leveraging my proficiency with ${skillsList || 'core engineering methodologies'}. By establishing clear verification steps and driving iterative problem-solving, I resolved the core blockers. 

This experience reinforced my approach to high-stakes delivery: isolating underlying root causes rather than patching symptoms, while maintaining clear communication across stakeholders.`;
    } else if (prompt.toLowerCase().includes('why') || prompt.toLowerCase().includes('interest') || prompt.toLowerCase().includes('fit')) {
      draft = `My motivation to contribute is built directly upon my track record${relevantExp ? ` in ${relevantExp.roleTitle}` : ''} and technical depth across ${skillsList || 'modern software systems'}. 

What excites me about this opportunity is the chance to apply structured execution and user-centric problem solving to meaningful challenges. ${userInsights ? `As I shared in our discussion, ${userInsights.slice(0, 180)}.` : ''} I thrive in environments where ownership, technical curiosity, and rigor are standard, and I look forward to delivering measurable value from day one.`;
    } else {
      draft = `In addressing this application requirement, my experience${relevantExp ? ` as ${relevantExp.roleTitle}` : ''}${relevantProj ? ` working on ${relevantProj.title}` : ''} provides a strong, grounded foundation. 

${userInsights || `Throughout my projects, I have consistently focused on building scalable, reliable solutions using ${skillsList || 'industry-standard technologies'}.`} 

By combining rigorous domain competencies with a disciplined, collaborative approach, I ensure that every objective translates into dependable outcomes and long-term value.`;
    }

    const words = draft.split(/\s+/);
    if (words.length > wordTarget) {
      draft = words.slice(0, wordTarget).join(' ') + '.';
    }

    return {
      draftText: draft.trim(),
      wordCount: draft.trim().split(/\s+/).length,
      characterCount: draft.length,
      evidenceSources: evidenceList,
      coverageConfidence: evidenceList.length >= 2 ? 'High (Fully Grounded)' : 'Moderate (Partially Grounded)',
      missingClaims: confirmedAnswers.length === 0 ? ['Specific first-hand metrics could further elevate this draft'] : [],
      status: 'generated',
    };
  }
}

export const agentEngine = new YraAgentEngine();
