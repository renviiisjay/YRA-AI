import React from 'react';
import { useYraApp } from '../context/AppContext';
import {
  History,
  FileText,
  Clock,
  ArrowRight,
  Trash2,
  CheckCircle2,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';

export const HistoryPage = () => {
  const { savedSessions, setSavedSessions, navigateTo } = useYraApp();

  const handleDeleteSession = (id) => {
    if (window.confirm('Delete this saved application session?')) {
      setSavedSessions(savedSessions.filter((s) => s.id !== id));
    }
  };

  const handleReopenSession = (sessionId) => {
    navigateTo('interview', sessionId);
  };

  return (
    <div className="app-container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Activity & History</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Access saved interview records, resume sessions, and verified application packages.
          </p>
        </div>

        <button
          onClick={() => navigateTo('applications_new')}
          className="btn btn-primary"
        >
          <PlusCircle size={16} />
          <span>New Session</span>
        </button>
      </div>

      {/* Sessions Grid */}
      {savedSessions.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            backgroundColor: 'var(--color-white)',
          }}
        >
          <History size={40} color="var(--color-mint)" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: 18, marginBottom: 6 }}>No Historical Sessions Saved</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', maxWidth: 400, margin: '0 auto 20px auto' }}>
            Sessions created in the Application Studio are automatically recorded here for continuous review and updating.
          </p>
          <button
            onClick={() => navigateTo('applications_new')}
            className="btn btn-primary btn-sm"
          >
            Start First Application
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {savedSessions.map((session) => (
            <div
              key={session.id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-pale-sage)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-forest)',
                  }}
                >
                  <FileText size={22} />
                </div>

                <div>
                  <h3 style={{ fontSize: 16, color: 'var(--color-forest)', marginBottom: 4 }}>
                    {session.title}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    <span>Source: {session.resumeName}</span>
                    <span>•</span>
                    <span>
                      {session.completedCount} of {session.questionsCount} Questions Verified
                    </span>
                    <span>•</span>
                    <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => handleReopenSession(session.id)}
                  className="btn btn-primary btn-sm"
                >
                  <span>Reopen Interview</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                  title="Delete record"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
