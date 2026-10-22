import React, { useState, useEffect, useRef } from 'react';
import { useYraApp } from '../context/AppContext';
import { agentEngine } from '../services/agentEngine';
import { YraEmblem } from '../components/YraLogo';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  SkipForward,
  RotateCcw,
  Sparkles,
  CheckCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Pause,
  Play,
  RefreshCw,
  Edit2,
  Check,
} from 'lucide-react';

export const AIInterviewRoom = () => {
  const {
    candidateProfile,
    questions,
    sessionAnswers,
    setSessionAnswers,
    navigateTo,
    settings,
  } = useYraApp();

  // Selected question index in queue
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const activeQuestion = questions[currentQIndex] || questions[0];

  // Conversation history for active question
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [isInterviewCompleteForQ, setIsInterviewCompleteForQ] = useState(false);
  const [currentGroundedDraft, setCurrentGroundedDraft] = useState(null);

  // Voice Interaction State Machine: 'ready' | 'speaking' | 'listening' | 'processing' | 'paused'
  const [voiceStatus, setVoiceStatus] = useState('ready');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(settings.voiceEnabled ?? true);
  const [isPaused, setIsPaused] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Web Speech API & Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = 'en-US';

        recog.onstart = () => {
          setVoiceStatus('listening');
          setMicPermissionDenied(false);
        };

        recog.onresult = (event) => {
          let interim = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          const textToAdd = finalTranscript || interim;
          if (textToAdd) {
            setUserInput((prev) => {
              const base = prev.trim();
              return base ? `${base} ${textToAdd}` : textToAdd;
            });
          }
        };

        recog.onerror = (e) => {
          console.warn('Speech recognition warning/error:', e.error);
          if (e.error === 'not-allowed') {
            setMicPermissionDenied(true);
          }
          setVoiceStatus('ready');
        };

        recog.onend = () => {
          setVoiceStatus((prev) => (prev === 'listening' ? 'ready' : prev));
        };

        recognitionRef.current = recog;
      }
    }

    return () => {
      // Clean up speech synthesis and mic on unmount
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Speak agent message using Web Speech Synthesis with collision avoidance
  const speakQuestion = (text) => {
    if (!ttsEnabled || typeof window === 'undefined' || !synthRef.current) return;

    // Halt recognition before speaking to prevent agent hearing its own voice
    if (recognitionRef.current && voiceStatus === 'listening') {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    synthRef.current.cancel();
    setVoiceStatus('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setVoiceStatus('ready');
    };

    utterance.onerror = () => {
      setVoiceStatus('ready');
    };

    synthRef.current.speak(utterance);
  };

  // Toggle voice recognition start / stop
  const handleToggleListening = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use standard text input.');
      return;
    }

    // Stop speaking if agent is currently speaking
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    if (voiceStatus === 'listening') {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setVoiceStatus('ready');
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Recognition start exception:', err);
        setVoiceStatus('ready');
      }
    }
  };

  // Repeat current question action
  const handleRepeatQuestion = () => {
    const lastAgentMsg = [...messages].reverse().find((m) => m.role === 'agent');
    if (lastAgentMsg) {
      speakQuestion(lastAgentMsg.content);
    }
  };

  // Pause / Resume Session
  const handleTogglePause = () => {
    if (!isPaused) {
      if (synthRef.current) synthRef.current.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsPaused(true);
      setVoiceStatus('paused');
    } else {
      setIsPaused(false);
      setVoiceStatus('ready');
    }
  };

  // Load existing session history or trigger opening probe
  useEffect(() => {
    if (!activeQuestion) return;

    const existing = sessionAnswers[activeQuestion.id];
    if (existing && existing.messages && existing.messages.length > 0) {
      setMessages(existing.messages);
      setIsInterviewCompleteForQ(existing.isComplete || false);
      setCurrentGroundedDraft(existing.draft || null);
    } else {
      setIsAgentThinking(true);
      setVoiceStatus('processing');

      const timer = setTimeout(async () => {
        const step = await agentEngine.evaluateAndDecideNextStep({
          question: activeQuestion,
          candidateProfile,
          conversationHistory: [],
          latestUserAnswer: '',
          apiKey: settings.apiKey,
          apiProvider: settings.apiProvider,
        });

        const initialMsg = {
          role: 'agent',
          content: step.interviewQuestion,
          missingAspect: step.missingAspect,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([initialMsg]);
        setIsAgentThinking(false);
        setVoiceStatus('ready');
        speakQuestion(step.interviewQuestion);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentQIndex, activeQuestion?.id]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentThinking]);

  // Submit Answer (Spoken or Typed)
  const handleSendMessage = async () => {
    if (!userInput.trim() || isAgentThinking || isPaused) return;

    // If mic is running, stop it
    if (recognitionRef.current && voiceStatus === 'listening') {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const userMsg = {
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setUserInput('');
    setIsAgentThinking(true);
    setVoiceStatus('processing');

    const userAnswers = updatedHistory
      .filter((m) => m.role === 'user')
      .map((m) => ({ text: m.content }));

    try {
      const nextStep = await agentEngine.evaluateAndDecideNextStep({
        question: activeQuestion,
        candidateProfile,
        conversationHistory: updatedHistory,
        latestUserAnswer: userMsg.content,
        apiKey: settings.apiKey,
        apiProvider: settings.apiProvider,
      });

      if (nextStep.isComplete) {
        // Grounded synthesis strictly from confirmed candidate testimony + resume
        const draft = agentEngine.generateGroundedDraft({
          question: activeQuestion,
          candidateProfile,
          confirmedAnswers: userAnswers,
        });

        const completeMsg = {
          role: 'agent',
          content: `I've collected sufficient verified details to craft a completely grounded answer for this requirement. Your authentic draft is ready for review.`,
          isFinal: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const finalHistory = [...updatedHistory, completeMsg];
        setMessages(finalHistory);
        setIsInterviewCompleteForQ(true);
        setCurrentGroundedDraft(draft);

        setSessionAnswers((prev) => ({
          ...prev,
          [activeQuestion.id]: {
            messages: finalHistory,
            draft: draft,
            isComplete: true,
            approved: false,
            confirmedAnswers: userAnswers,
          },
        }));

        setVoiceStatus('ready');
        speakQuestion(completeMsg.content);
      } else {
        // Targeted follow-up
        const followUpMsg = {
          role: 'agent',
          content: nextStep.interviewQuestion,
          missingAspect: nextStep.missingAspect,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const finalHistory = [...updatedHistory, followUpMsg];
        setMessages(finalHistory);

        setSessionAnswers((prev) => ({
          ...prev,
          [activeQuestion.id]: {
            messages: finalHistory,
            draft: null,
            isComplete: false,
            approved: false,
            confirmedAnswers: userAnswers,
          },
        }));

        setVoiceStatus('ready');
        speakQuestion(nextStep.interviewQuestion);
      }
    } catch (err) {
      console.error('Agent evaluation error:', err);
    } finally {
      setIsAgentThinking(false);
    }
  };

  const handleSkipQuestion = () => {
    if (synthRef.current) synthRef.current.cancel();
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (synthRef.current) synthRef.current.cancel();
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  return (
    <div className="app-container" style={{ paddingTop: 24, paddingBottom: 64 }}>
      {/* Top Header & Breadcrumb */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => {
              if (synthRef.current) synthRef.current.cancel();
              navigateTo('workspace');
            }}
            className="btn btn-ghost btn-sm"
          >
            <ChevronLeft size={16} />
            <span>Workspace</span>
          </button>
          <div style={{ width: 1, height: 16, backgroundColor: 'var(--color-border)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-forest)' }}>
            Speaking AI Interviewer • Question {currentQIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Global Interview Room Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Pause / Resume */}
          <button
            onClick={handleTogglePause}
            className="btn btn-secondary btn-sm"
            title={isPaused ? 'Resume Interview' : 'Pause Interview'}
          >
            {isPaused ? <Play size={14} color="var(--color-emerald)" /> : <Pause size={14} />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Repeat Question */}
          <button
            onClick={handleRepeatQuestion}
            className="btn btn-secondary btn-sm"
            title="Repeat current question aloud"
          >
            <RotateCcw size={14} />
            <span>Repeat Question</span>
          </button>

          {/* Voice Toggle */}
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="btn btn-secondary btn-sm"
            title={ttsEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
          >
            {ttsEnabled ? <Volume2 size={14} color="var(--color-emerald)" /> : <VolumeX size={14} />}
            <span>Voice: {ttsEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            onClick={() => {
              if (synthRef.current) synthRef.current.cancel();
              navigateTo('review');
            }}
            className="btn btn-primary btn-sm"
          >
            <span>Review Drafts</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Mic Permission Warning Banner */}
      {micPermissionDenied && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          <AlertCircle size={18} />
          <span>
            Microphone access was denied. You can continue seamlessly using text input, or enable microphone permissions in your browser address bar.
          </span>
        </div>
      )}

      {/* Main Studio Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Left Column: Context & Grounding */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Target Application Requirement Card */}
          <div className="card" style={{ borderLeft: '4px solid var(--color-emerald)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-emerald)', textTransform: 'uppercase', marginBottom: 6 }}>
              Target Application Requirement
            </div>
            <h2 style={{ fontSize: 17, lineHeight: 1.4, color: 'var(--color-forest)', marginBottom: 12 }}>
              {activeQuestion?.prompt}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'var(--color-text-secondary)' }}>
              <span className="badge badge-neutral">{activeQuestion?.category}</span>
              <span className="badge badge-neutral">Limit: {activeQuestion?.wordLimit} words</span>
            </div>
          </div>

          {/* Verified Candidate Grounding Anchors */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ShieldCheck size={18} color="var(--color-emerald)" />
              <h3 style={{ fontSize: 15 }}>Verified Candidate Anchors</h3>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              Resume facts used by the agent to anchor questions and verify claims:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-warm-ivory)', borderRadius: 6 }}>
                <strong>Role:</strong> {candidateProfile.experience?.[0]?.roleTitle || 'Professional Experience'}
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-warm-ivory)', borderRadius: 6 }}>
                <strong>Project:</strong> {candidateProfile.projects?.[0]?.title || 'Key Engineering Project'}
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-warm-ivory)', borderRadius: 6 }}>
                <strong>Verified Skills:</strong> {candidateProfile.skills.slice(0, 4).join(', ')}
              </div>
            </div>
          </div>

          {/* Question Stepper */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQIndex === 0}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              Previous Question
            </button>
            <button
              onClick={handleSkipQuestion}
              disabled={currentQIndex === questions.length - 1}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              <span>Next Question</span>
              <SkipForward size={14} />
            </button>
          </div>
        </div>

        {/* Right Column: Speaking AI Interview Room */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '640px',
            padding: 0,
            overflow: 'hidden',
          }}
        >
          {/* Header of the Interview Room with Dynamic Agent States */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-pale-sage-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <YraEmblem size={26} glow={voiceStatus === 'speaking' || voiceStatus === 'listening'} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-forest)' }}>
                  YRA Speaking Interviewer
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {isPaused
                    ? 'Interview paused'
                    : voiceStatus === 'speaking'
                    ? 'Agent speaking question...'
                    : voiceStatus === 'listening'
                    ? 'Listening... speak clearly'
                    : voiceStatus === 'processing'
                    ? 'Agent evaluating response...'
                    : 'Ready for candidate response'}
                </div>
              </div>
            </div>

            {/* Voice Status Badge */}
            <div>
              {isPaused ? (
                <span className="badge badge-neutral">Paused</span>
              ) : voiceStatus === 'speaking' ? (
                <span className="badge badge-emerald" style={{ animation: 'pulseSubtle 1.5s infinite' }}>
                  Speaking Aloud
                </span>
              ) : voiceStatus === 'listening' ? (
                <span className="badge badge-mint" style={{ animation: 'pulseSubtle 1.2s infinite' }}>
                  Microphone Active
                </span>
              ) : voiceStatus === 'processing' ? (
                <span className="badge badge-neutral">Reasoning...</span>
              ) : (
                <span className="badge badge-neutral">Ready</span>
              )}
            </div>
          </div>

          {/* Dialogue Transcript Container */}
          <div
            style={{
              flex: 1,
              padding: 20,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              backgroundColor: '#FAFCFA',
            }}
          >
            {messages.map((msg, idx) => {
              const isAgent = msg.role === 'agent';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAgent ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    alignSelf: isAgent ? 'flex-start' : 'flex-end',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: isAgent ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      backgroundColor: isAgent ? 'var(--color-white)' : 'var(--color-forest)',
                      color: isAgent ? 'var(--color-text-primary)' : 'var(--color-white)',
                      border: isAgent ? '1px solid var(--color-border)' : 'none',
                      boxShadow: 'var(--shadow-sm)',
                      fontSize: 14,
                      lineHeight: 1.55,
                    }}
                  >
                    {msg.content}

                    {msg.missingAspect && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: '6px 10px',
                          borderRadius: 4,
                          backgroundColor: 'var(--color-pale-sage)',
                          color: 'var(--color-forest)',
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      >
                        Intent probe: {msg.missingAspect}
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, padding: '0 4px' }}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isAgentThinking && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  width: 'fit-content',
                }}
              >
                <RefreshCw size={14} className="animate-pulse-subtle" color="var(--color-forest)" />
                <span style={{ fontSize: 13, color: 'var(--color-forest)', fontWeight: 500 }}>
                  Agent reasoning over evidence & gaps...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Draft Completion Banner */}
          {isInterviewCompleteForQ && currentGroundedDraft && (
            <div
              style={{
                backgroundColor: 'var(--color-pale-sage)',
                padding: '12px 20px',
                borderTop: '1px solid var(--color-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} color="var(--color-emerald)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-forest)' }}>
                  Draft synthesized ({currentGroundedDraft.wordCount} words)
                </span>
              </div>
              <button
                onClick={() => {
                  if (synthRef.current) synthRef.current.cancel();
                  navigateTo('review');
                }}
                className="btn btn-primary btn-sm"
              >
                <span>View & Verify Draft</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Conversational Answer Area with Transcript Review / Editing before submission */}
          <div
            style={{
              padding: 16,
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-white)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Live voice feedback indicator if listening */}
            {voiceStatus === 'listening' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 12px',
                  backgroundColor: 'var(--color-pale-sage-light)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  color: 'var(--color-forest)',
                }}
              >
                <span>Speech is transcribing into the box below. You can edit text before submitting.</span>
                <button
                  onClick={handleToggleListening}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--color-emerald)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Done Speaking
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              {/* Mic Control Button */}
              <button
                onClick={handleToggleListening}
                disabled={isPaused}
                className={`btn ${voiceStatus === 'listening' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: voiceStatus === 'listening' ? 'var(--color-emerald)' : '',
                }}
                title={voiceStatus === 'listening' ? 'Stop listening' : 'Start voice dictation'}
              >
                {voiceStatus === 'listening' ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Editable User Input (Spoken Transcript or Typed) */}
              <textarea
                placeholder={
                  isPaused
                    ? 'Interview is paused. Click Resume to continue...'
                    : 'Speak using the microphone or type your response here (you can edit anytime before sending)...'
                }
                value={userInput}
                disabled={isPaused}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: 14,
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.4,
                  fontFamily: 'inherit',
                }}
              />

              {/* Submit Answer Button */}
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isAgentThinking || isPaused}
                className="btn btn-primary"
                style={{ padding: '12px 18px' }}
                title="Submit answer for agent reasoning"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
