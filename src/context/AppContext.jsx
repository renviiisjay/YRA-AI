import React, { createContext, useContext, useState, useEffect } from 'react';

const YraAppContext = createContext(null);

const DEFAULT_PROFILE = {
  fullName: 'Alex Vance',
  email: 'alex.vance@example.com',
  phone: '+1 (555) 234-5678',
  title: 'Full Stack AI Engineer',
  summary: 'Product-focused software engineer specialized in reactive web interfaces, distributed systems, and real-time agent workflows.',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'AI Agents'],
  experience: [
    {
      roleTitle: 'Senior Software Engineer',
      company: 'Aura Systems',
      period: '2023 - Present',
      bullets: [
        'Architected real-time streaming interfaces serving over 120k monthly active users.',
        'Engineered resilient fallback mechanisms that improved system reliability to 99.95%.',
      ],
      evidenceSnippet: 'Aura Systems — Senior Software Engineer (2023 - Present)',
    },
    {
      roleTitle: 'Software Engineer',
      company: 'Nexus Labs',
      period: '2021 - 2023',
      bullets: [
        'Built full-stack analytics dashboards with sub-second query latency.',
        'Collaborated with design and product teams on customer-driven features.',
      ],
      evidenceSnippet: 'Nexus Labs — Software Engineer (2021 - 2023)',
    },
  ],
  education: [
    {
      institution: 'State University of Technology',
      degree: 'B.S. in Computer Science',
      year: '2021',
      details: ['Magna Cum Laude', 'Algorithms, Distributed Computing'],
    },
  ],
  projects: [
    {
      title: 'Distributed Inference Mesh',
      description: 'A low-latency orchestration framework for local and cloud LLM execution.',
      points: [
        'Reduced model latency by 34% using adaptive queue scheduling.',
        'Open-source repository with over 1.4k stars.',
      ],
    },
    {
      title: 'Contextual Document Synthesizer',
      description: 'End-to-end PDF parser with semantic chunking and verified evidence linking.',
      points: ['Implemented zero-hallucination source citation mapping.'],
    },
  ],
  certifications: ['AWS Certified Solutions Architect', 'Deep Learning Specialization'],
  evidenceReferences: [
    { section: 'Skills', snippet: 'React, TypeScript, Python, Node.js, AI Agents' },
    { section: 'Experience', snippet: 'Aura Systems: Senior Software Engineer' },
  ],
  rawText: '',
  isLoaded: true,
};

const DEFAULT_QUESTIONS = [
  {
    id: 'q_1',
    prompt: 'Describe a complex technical challenge you overcame. What was the obstacle and how did you resolve it?',
    originalText: '1. Describe a complex technical challenge you overcame. What was the obstacle and how did you resolve it? (Max 250 words)',
    required: true,
    wordLimit: 250,
    category: 'Challenge & Problem Solving',
    status: 'pending',
  },
  {
    id: 'q_2',
    prompt: 'Why are you drawn to this specific role and team, and how does your background position you to succeed?',
    originalText: '2. Why are you drawn to this specific role and team, and how does your background position you to succeed? (Max 200 words)',
    required: true,
    wordLimit: 200,
    category: 'Motivation & Fit',
    status: 'pending',
  },
  {
    id: 'q_3',
    prompt: 'Discuss a time you had to lead an ambiguous initiative or align cross-functional stakeholders.',
    originalText: '3. Discuss a time you had to lead an ambiguous initiative or align cross-functional stakeholders. (Max 250 words)',
    required: true,
    wordLimit: 250,
    category: 'Leadership & Collaboration',
    status: 'pending',
  },
];

export const AppProvider = ({ children }) => {
  // Current page routing: 'landing', 'workspace', 'resume', 'applications_new', 'interview', 'review', 'history', 'settings'
  const [currentRoute, setCurrentRoute] = useState('landing');
  const [activeSessionId, setActiveSessionId] = useState('session_default');

  // Candidate Profile State
  const [candidateProfile, setCandidateProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('yra_candidate_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Questions for the current session
  const [questions, setQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('yra_questions');
      return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
    } catch {
      return DEFAULT_QUESTIONS;
    }
  });

  // Confirmed interview conversations and answers
  // Structure: { [questionId]: { messages: [], draft: null, approved: false, userNotes: '' } }
  const [sessionAnswers, setSessionAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('yra_session_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Saved application sessions history
  const [savedSessions, setSavedSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('yra_saved_sessions');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'session_demo_01',
              title: 'Senior AI Engineer — Frontier Systems',
              createdAt: '2026-10-16T14:30:00Z',
              resumeName: 'Alex_Vance_Resume_2026.pdf',
              questionsCount: 3,
              completedCount: 2,
              status: 'in_progress',
            },
          ];
    } catch {
      return [];
    }
  });

  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('yra_settings');
      return saved
        ? JSON.parse(saved)
        : {
            hasSeenIntro: false,
            voiceEnabled: true,
            apiKey: '',
            apiProvider: 'local_agent',
            autoTTS: false,
          };
    } catch {
      return {
        hasSeenIntro: false,
        voiceEnabled: true,
        apiKey: '',
        apiProvider: 'local_agent',
        autoTTS: false,
      };
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('yra_candidate_profile', JSON.stringify(candidateProfile));
    } catch (e) {
      console.warn(e);
    }
  }, [candidateProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('yra_questions', JSON.stringify(questions));
    } catch (e) {
      console.warn(e);
    }
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem('yra_session_answers', JSON.stringify(sessionAnswers));
    } catch (e) {
      console.warn(e);
    }
  }, [sessionAnswers]);

  useEffect(() => {
    try {
      localStorage.setItem('yra_saved_sessions', JSON.stringify(savedSessions));
    } catch (e) {
      console.warn(e);
    }
  }, [savedSessions]);

  useEffect(() => {
    try {
      localStorage.setItem('yra_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn(e);
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const navigateTo = (route, sessionId = null) => {
    if (sessionId) setActiveSessionId(sessionId);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAllData = () => {
    setCandidateProfile(DEFAULT_PROFILE);
    setQuestions(DEFAULT_QUESTIONS);
    setSessionAnswers({});
    localStorage.removeItem('yra_candidate_profile');
    localStorage.removeItem('yra_questions');
    localStorage.removeItem('yra_session_answers');
  };

  return (
    <YraAppContext.Provider
      value={{
        currentRoute,
        navigateTo,
        activeSessionId,
        setActiveSessionId,
        candidateProfile,
        setCandidateProfile,
        questions,
        setQuestions,
        sessionAnswers,
        setSessionAnswers,
        savedSessions,
        setSavedSessions,
        settings,
        updateSetting,
        resetAllData,
      }}
    >
      {children}
    </YraAppContext.Provider>
  );
};

export const useYraApp = () => {
  const context = useContext(YraAppContext);
  if (!context) {
    throw new Error('useYraApp must be used within an AppProvider');
  }
  return context;
};
