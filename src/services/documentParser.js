import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure pdfjs worker using unpkg or local bundle
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/**
 * Extracts raw text from File (PDF, DOCX, TXT)
 */
export async function extractTextFromFile(file) {
  const fileType = file.name.split('.').pop().toLowerCase();

  if (fileType === 'txt') {
    return await file.text();
  }

  if (fileType === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  }

  if (fileType === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        fullText += `--- Page ${i} ---\n` + pageText + '\n\n';
      }
      return fullText.trim();
    } catch (err) {
      console.warn('PDF.js worker/canvas parse fallback:', err);
      // Fallback: read as text representation
      return await file.text();
    }
  }

  throw new Error(`Unsupported file type .${fileType}. Please upload PDF, DOCX, or TXT.`);
}

/**
 * Analyzes resume raw text and parses into a structured Candidate Profile
 * with Skills, Work Experience, Education, Projects, Certifications, and Evidence References.
 */
export function parseResumeContent(rawText) {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Profile data structure
  const profile = {
    fullName: '',
    email: '',
    phone: '',
    title: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    evidenceReferences: [],
    rawText: rawText,
  };

  // 1. Extract contact details
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/i;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

  const emailMatch = rawText.match(emailRegex);
  if (emailMatch) profile.email = emailMatch[0];

  const phoneMatch = rawText.match(phoneRegex);
  if (phoneMatch) profile.phone = phoneMatch[0];

  // 2. Identify candidate name from top lines
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (line.length > 2 && line.length < 40 && !line.includes('@') && !line.includes('http') && !line.toLowerCase().includes('resume') && !line.toLowerCase().includes('curriculum')) {
      profile.fullName = line.replace(/---.*---/, '').trim();
      break;
    }
  }
  if (!profile.fullName) profile.fullName = 'Candidate Profile';

  // 3. Section Segmentation
  let currentSection = 'summary';
  const sections = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
  };

  const sectionKeywords = [
    { key: 'skills', regex: /^(technical\s+)?skills|technologies|tools|competencies/i },
    { key: 'experience', regex: /^(work\s+)?experience|employment|work\s+history|professional\s+experience/i },
    { key: 'education', regex: /^education|academic\s+background|degrees/i },
    { key: 'projects', regex: /^projects|key\s+projects|portfolio|personal\s+projects/i },
    { key: 'certifications', regex: /^certifications|licenses|courses|awards|achievements/i },
    { key: 'summary', regex: /^summary|professional\s+summary|profile|about\s+me/i },
  ];

  for (const line of lines) {
    let matched = false;
    for (const sec of sectionKeywords) {
      if (sec.regex.test(line) && line.length < 45) {
        currentSection = sec.key;
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (sections[currentSection]) {
        sections[currentSection].push(line);
      }
    }
  }

  // 4. Parse Skills
  const skillsText = sections.skills.join(', ');
  const commonDelimiters = /[,•|;\n\/]+/;
  const rawSkills = skillsText
    .split(commonDelimiters)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 35 && !/skills|languages|tools/i.test(s));
  
  profile.skills = Array.from(new Set(rawSkills));

  // If skills list was empty from section header, scan for typical engineering keywords
  if (profile.skills.length === 0) {
    const knownSkills = [
      'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js', 'SQL', 'PostgreSQL',
      'Docker', 'AWS', 'Git', 'Machine Learning', 'AI', 'FastAPI', 'HTML', 'CSS', 'Tailwind',
      'MongoDB', 'REST APIs', 'GraphQL', 'Data Analysis', 'Figma', 'System Design'
    ];
    for (const skill of knownSkills) {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(rawText)) {
        profile.skills.push(skill);
      }
    }
  }

  // 5. Parse Experience Items
  const expLines = sections.experience;
  let currentExp = null;

  for (const line of expLines) {
    // Detect company or title pattern (e.g. contains dates or role words)
    const hasYear = /\b(19\d\d|20\d\d)\b/.test(line) || /present|current/i.test(line);
    if ((hasYear || line.includes(' - ') || line.includes(' | ')) && !line.startsWith('•') && !line.startsWith('-')) {
      if (currentExp) profile.experience.push(currentExp);
      currentExp = {
        roleTitle: line.slice(0, 80),
        company: '',
        period: '',
        bullets: [],
        evidenceSnippet: line,
      };
    } else if (currentExp) {
      currentExp.bullets.push(line.replace(/^[•\-\*]\s*/, ''));
    }
  }
  if (currentExp) profile.experience.push(currentExp);

  // If no formal experience sections detected, group paragraph blocks
  if (profile.experience.length === 0 && expLines.length > 0) {
    profile.experience.push({
      roleTitle: 'Professional Experience',
      company: 'Extracted from Resume',
      period: 'Recorded',
      bullets: expLines.slice(0, 6),
      evidenceSnippet: expLines.slice(0, 2).join(' '),
    });
  }

  // 6. Parse Education
  const eduLines = sections.education;
  let currentEdu = null;
  for (const line of eduLines) {
    if (/(university|college|institute|bachelor|master|b\.tech|m\.tech|b\.s\.|b\.a\.|phd|degree)/i.test(line)) {
      if (currentEdu) profile.education.push(currentEdu);
      currentEdu = {
        institution: line.slice(0, 100),
        degree: '',
        year: '',
        details: [],
      };
    } else if (currentEdu) {
      currentEdu.details.push(line);
    }
  }
  if (currentEdu) profile.education.push(currentEdu);

  // 7. Parse Projects
  const projLines = sections.projects;
  let currentProj = null;
  for (const line of projLines) {
    if (!line.startsWith('•') && !line.startsWith('-') && line.length < 75 && line.length > 3) {
      if (currentProj) profile.projects.push(currentProj);
      currentProj = {
        title: line,
        description: '',
        points: [],
      };
    } else if (currentProj) {
      currentProj.points.push(line.replace(/^[•\-\*]\s*/, ''));
    }
  }
  if (currentProj) profile.projects.push(currentProj);

  // 8. Extract Summary / Title
  if (sections.summary.length > 0) {
    profile.summary = sections.summary.slice(0, 4).join(' ');
  } else {
    // Generate a factual summary preview
    const skillsPreview = profile.skills.slice(0, 5).join(', ');
    profile.summary = `Experienced professional with verified competencies in ${skillsPreview || 'key domain areas'}.`;
  }

  // 9. Generate Evidence Snippets
  profile.evidenceReferences = [
    { section: 'Skills', snippet: profile.skills.slice(0, 8).join(', ') },
    { section: 'Experience', snippet: profile.experience.length > 0 ? profile.experience[0].roleTitle : 'Parsed from document body' },
    { section: 'Education', snippet: profile.education.length > 0 ? profile.education[0].institution : 'Parsed from document records' },
  ];

  return profile;
}

/**
 * Extracts and structures Application Questions from uploaded forms or pasted prompts
 */
export function parseApplicationQuestions(rawInput) {
  const lines = rawInput.split('\n').map((l) => l.trim()).filter(Boolean);
  const questions = [];

  let qIndex = 1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check if line looks like a question or prompt
    const isNumbered = /^(question\s*\d+|q\d+|[0-9]{1,2}[\.\)])/i.test(line);
    const endsWithQuestion = line.endsWith('?');
    const isPrompt = /^(describe|explain|why|how|tell us|what|share|discuss|provide)/i.test(line);

    if (isNumbered || endsWithQuestion || (isPrompt && line.length > 20)) {
      // Look ahead for word count limit mentions (e.g., "Max 300 words" or "(250 words)")
      const limitMatch = line.match(/(?:max|limit|around|approx)?\s*(\d{2,4})\s*(?:words|characters|chars)/i);
      const wordLimit = limitMatch ? parseInt(limitMatch[1], 10) : 250;

      questions.push({
        id: `q_${qIndex++}`,
        prompt: line.replace(/^(question\s*\d+[:.]?|q\d+[:.]?|[0-9]{1,2}[\.\)])\s*/i, '').trim(),
        originalText: line,
        required: true,
        wordLimit: wordLimit,
        category: categorizeQuestion(line),
        status: 'pending', // 'pending' | 'in_interview' | 'answered' | 'verified'
      });
    }
  }

  // Fallback if no explicit numbered/question marks found: treat substantial paragraphs as prompts
  if (questions.length === 0 && lines.length > 0) {
    lines.forEach((l, idx) => {
      if (l.length > 15) {
        questions.push({
          id: `q_${idx + 1}`,
          prompt: l,
          originalText: l,
          required: true,
          wordLimit: 250,
          category: categorizeQuestion(l),
          status: 'pending',
        });
      }
    });
  }

  return questions;
}

function categorizeQuestion(text) {
  const t = text.toLowerCase();
  if (t.includes('challenge') || t.includes('difficult') || t.includes('obstacle') || t.includes('failure')) return 'Challenge & Problem Solving';
  if (t.includes('why') || t.includes('interest') || t.includes('motivation') || t.includes('values')) return 'Motivation & Fit';
  if (t.includes('leadership') || t.includes('lead') || t.includes('team') || t.includes('conflict')) return 'Leadership & Collaboration';
  if (t.includes('project') || t.includes('technical') || t.includes('architecture') || t.includes('code')) return 'Technical & Project Deep Dive';
  return 'General Application Question';
}
