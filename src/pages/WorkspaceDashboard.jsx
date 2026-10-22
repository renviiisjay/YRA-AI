import React from 'react';
import { useYraApp } from '../context/AppContext';
import {
  PlusCircle,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
} from 'lucide-react';

export const WorkspaceDashboard = () => {
  const {
    navigateTo,
    candidateProfile,
    questions,
    sessionAnswers,
    savedSessions,
  } = useYraApp();

  // Compute live real metrics
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(sessionAnswers).length;
  const approvedCount = Object.values(sessionAnswers).filter((a) => a.approved).length;
  const skillsCount = candidateProfile?.skills?.length || 0;
  const expCount = candidateProfile?.experience?.length || 0;

  return (
    <div className="app-container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Welcome & Top Actions Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 36,
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>
            Welcome back, {candidateProfile.fullName || 'Candidate'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Personal Workspace • Track live interview sessions, document parsing, and answer verification.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigateTo('applications_new')}
            className="btn btn-primary"
          >
            <PlusCircle size={16} />
            <span>Start New Application</span>
          </button>
          <button
            onClick={() => navigateTo('resume')}
            className="btn btn-secondary"
          >
            <FileText size={16} />
            <span>Manage Resume</span>
          </button>
        </div>
      </div>

      {/* Real Metric Highlights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginBottom: 36,
        }}
      >
        {/* Metric 1 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Active Form Questions
            </span>
            <FileText size={18} color="var(--color-emerald)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-forest)' }}>
            {totalQuestions}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Extracted from current application
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Interview Progress
            </span>
            <MessageSquare size={18} color="var(--color-emerald)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-forest)' }}>
            {answeredQuestions} / {totalQuestions}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Questions explored with agent
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Approved Drafts
            </span>
            <CheckCircle size={18} color="var(--color-emerald)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-forest)' }}>
            {approvedCount}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Human-verified & ready to export
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Resume Evidence
            </span>
            <Award size={18} color="var(--color-emerald)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-forest)' }}>
            {skillsCount} Skills • {expCount} Roles
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Fully parsed candidate facts
          </div>
        </div>
      </div>

      {/* Main Grid: Active Session Workflow & Resume Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
        {/* Left Column: Active Application Workflow */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 18 }}>Current Application Workflow</h2>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Target question queue and live verification status.
              </p>
            </div>
            <span className="badge badge-emerald">Ready to Continue</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {questions.map((q, idx) => {
              const sessionState = sessionAnswers[q.id];
              const isApproved = sessionState?.approved;
              const hasDraft = sessionState?.draft;

              return (
                <div
                  key={q.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: isApproved ? 'var(--color-pale-sage-light)' : 'var(--color-warm-ivory)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--color-forest)',
                        minWidth: 20,
                        marginTop: 2,
                      }}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {q.prompt.length > 70 ? q.prompt.slice(0, 70) + '...' : q.prompt}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {q.category} • Max {q.wordLimit} words
                      </div>
                    </div>
                  </div>

                  <div>
                    {isApproved ? (
                      <span className="badge badge-emerald">Approved</span>
                    ) : hasDraft ? (
                      <span className="badge badge-mint">Draft Ready</span>
                    ) : (
                      <button
                        onClick={() => navigateTo('interview')}
                        className="btn btn-secondary btn-sm"
                      >
                        Interview
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => navigateTo('interview')}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <span>Enter AI Interview Room</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigateTo('review')}
              className="btn btn-secondary"
            >
              <span>Review Drafts</span>
            </button>
          </div>
        </div>

        {/* Right Column: Candidate Fact Profile Snapshot */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 18 }}>Active Candidate Intelligence</h2>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Extracted facts currently grounding the agent.
              </p>
            </div>
            <button
              onClick={() => navigateTo('resume')}
              className="btn btn-ghost btn-sm"
            >
              Edit Facts
            </button>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-forest)', marginBottom: 8 }}>
              VERIFIED SKILLS ({candidateProfile.skills.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {candidateProfile.skills.map((skill, i) => (
                <span key={i} className="badge badge-neutral" style={{ fontSize: 11 }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-forest)', marginBottom: 8 }}>
              CORE WORK EXPERIENCE
            </div>
            {candidateProfile.experience.slice(0, 2).map((exp, i) => (
              <div
                key={i}
                style={{
                  fontSize: 13,
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-warm-ivory)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 8,
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                  {exp.roleTitle} {exp.company ? `— ${exp.company}` : ''}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {exp.bullets?.[0] || 'Direct verified employment experience.'}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: 14,
              backgroundColor: 'var(--color-pale-sage-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-mint)',
              fontSize: 12,
              color: 'var(--color-forest)',
              lineHeight: 1.5,
            }}
          >
            <strong>Zero Hallucination Anchor:</strong> The interview agent is restricted to generating assertions supported by this active profile and the answers you provide in the interview.
          </div>
        </div>
      </div>
    </div>
  );
};
