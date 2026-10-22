/**
 * Serverless API Function for YRA AI Agent
 * Endpoint: POST /api/interview
 * 
 * Securely executes AI reasoning server-side so API keys are never exposed in browser bundles.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const {
    question,
    candidateProfile,
    conversationHistory = [],
    latestUserAnswer = '',
  } = req.body || {};

  if (!question || !candidateProfile) {
    return res.status(400).json({ error: 'Missing required question or candidateProfile parameters.' });
  }

  // Retrieve server-side API keys from environment
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  const systemPrompt = `You are YRA, an elite Personal Interviewer Agent.
Your mandate:
1. Interview the candidate to gather authentic, verifiable evidence for the application question: "${question.prompt}".
2. Target word limit: ${question.wordLimit} words.
3. Candidate Context:
- Name: ${candidateProfile.fullName}
- Skills: ${candidateProfile.skills?.slice(0, 8).join(', ')}
- Roles: ${candidateProfile.experience?.map(e => e.roleTitle).slice(0, 2).join('; ')}
- Projects: ${candidateProfile.projects?.map(p => p.title).slice(0, 2).join('; ')}

Analyze the candidate's latest response.
Determine if:
- The answer is complete and rich with specific actions, root causes, and outcomes (set isComplete: true).
- Or if it needs a targeted, respectful follow-up to clarify an ambiguous point, probe for root cause, or ask for metrics/ownership (set isComplete: false and provide interviewQuestion).

Respond ONLY with valid JSON:
{
  "isComplete": boolean,
  "interviewQuestion": "one concise targeted follow up or null if complete",
  "missingAspect": "what was missing if probing",
  "feedback": "rationale for decision"
}`;

  // If OpenAI API key is configured server-side
  if (openaiApiKey) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(m => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.content })),
        { role: 'user', content: latestUserAnswer || 'Please ask the opening interview question.' }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.3,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return res.status(200).json(parsed);
    } catch (err) {
      console.error('Server-side AI call failed, falling back:', err.message);
    }
  }

  // Built-in intelligent deterministic semantic fallback if no external keys configured
  const words = (latestUserAnswer || '').trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const answerLower = (latestUserAnswer || '').toLowerCase();

  if (!latestUserAnswer || conversationHistory.length === 0) {
    const projectRef = candidateProfile.projects?.[0]?.title;
    const starterQuestion = question.prompt.toLowerCase().includes('challenge')
      ? (projectRef ? `In your work on "${projectRef}", what was the most difficult technical or strategic obstacle you faced, and what specific action did you take to resolve it?` : `Can you walk me through a specific situation where you hit a roadblock, the core problem you identified, and the steps you took to overcome it?`)
      : `To craft an authentic answer for "${question.prompt}", could you share a concrete example from your direct experience?`;

    return res.status(200).json({
      isComplete: false,
      interviewQuestion: starterQuestion,
      missingAspect: 'Core challenge and methodology',
      feedback: 'Initial opening inquiry grounded in your background.'
    });
  }

  if (wordCount < 12) {
    return res.status(200).json({
      isComplete: false,
      interviewQuestion: 'Could you expand on that with the specific actions you personally took and any tools or methodologies you leveraged?',
      missingAspect: 'Specific candidate actions and methodology',
      feedback: 'Probing for direct ownership.'
    });
  }

  const hasImpact = /\d+%|\d+x|\$\d+|\bscale\b|\bmetric\b|\breduced\b|\bincreased\b|\baccelerated\b|\bresult\b|\bimpact\b/i.test(answerLower);
  if (!hasImpact && conversationHistory.length < 2) {
    return res.status(200).json({
      isComplete: false,
      interviewQuestion: 'What was the tangible outcome or result of that decision for the team or project?',
      missingAspect: 'Tangible outcome and metrics',
      feedback: 'Probing for outcome and impact.'
    });
  }

  return res.status(200).json({
    isComplete: true,
    interviewQuestion: null,
    feedback: 'Evidence collection complete. Ready to synthesize response.'
  });
}
