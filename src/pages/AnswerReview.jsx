import React, { useState } from 'react';
import { useYraApp } from '../context/AppContext';
import { agentEngine } from '../services/agentEngine';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Copy,
  Download,
  RotateCcw,
  ShieldCheck,
  Edit3,
  ExternalLink,
  AlertTriangle,
  FileText,
  Sparkles,
} from 'lucide-react';

export const AnswerReview = () => {
  const { questions, sessionAnswers, setSessionAnswers, candidateProfile, navigateTo } = useYraApp();
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState('');

  // Handle regenerating grounded draft
  const handleRegenerate = (q) => {
    const session = sessionAnswers[q.id];
    const confirmed = session?.confirmedAnswers || [];
    const newDraft = agentEngine.generateGroundedDraft({
      question: q,
      candidateProfile,
      confirmedAnswers: confirmed,
    });

    setSessionAnswers((prev) => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        draft: newDraft,
        approved: false,
      },
    }));
  };

  // Handle approving response
  const handleApprove = (qId) => {
    setSessionAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        approved: true,
      },
    }));

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#287A68', '#A7DCC7', '#123C35'],
      });
    } catch (e) {
      // Ignore if unavailable
    }
  };

  // Start manual edit
  const handleStartEdit = (qId, currentText) => {
    setEditingId(qId);
    setEditedText(currentText);
  };

  // Save manual edit
  const handleSaveEdit = (qId) => {
    const current = sessionAnswers[qId];
    if (current?.draft) {
      const words = editedText.trim().split(/\s+/).filter(Boolean);
      setSessionAnswers((prev) => ({
        ...prev,
        [qId]: {
          ...prev[qId],
          draft: {
            ...prev[qId].draft,
            draftText: editedText.trim(),
            wordCount: words.length,
            characterCount: editedText.length,
          },
        },
      }));
    }
    setEditingId(null);
  };

  // Copy answer to clipboard
  const handleCopy = (qId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(qId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export all answers as Markdown or JSON
  const handleExportAll = () => {
    let doc = `# YRA Application Submission Package\n`;
    doc += `Candidate: ${candidateProfile.fullName}\n`;
    doc += `Email: ${candidateProfile.email}\n`;
    doc += `Date: ${new Date().toLocaleDateString()}\n\n---\n\n`;

    questions.forEach((q, idx) => {
      const session = sessionAnswers[q.id];
      const draft = session?.draft?.draftText || '[No approved response generated yet]';
      doc += `### Question ${idx + 1}: ${q.prompt}\n`;
      doc += `Word Count: ${draft.split(/\s+/).filter(Boolean).length} / ${q.wordLimit}\n\n`;
      doc += `${draft}\n\n---\n\n`;
    });

    const blob = new Blob([doc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `YRA_${candidateProfile.fullName.replace(/\s+/g, '_')}_Application_Responses.md`;
    a.click();
    URL.revokeObjectURL(url);
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
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Answer Review & Verification</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Verify evidence-grounded drafts, inspect source citations, make final edits, and approve for export.
          </p>
        </div>

        <button
          onClick={handleExportAll}
          className="btn btn-primary"
        >
          <Download size={16} />
          <span>Export All Approved Answers</span>
        </button>
      </div>

      {/* Questions Review Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {questions.map((q, idx) => {
          const session = sessionAnswers[q.id];
          const draft = session?.draft;
          const isApproved = session?.approved;

          return (
            <div
              key={q.id}
              className="card"
              style={{
                borderLeft: isApproved ? '4px solid var(--color-emerald)' : '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {/* Question Top Header */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-forest)' }}>
                      Question {idx + 1}
                    </span>
                    <span className="badge badge-neutral">{q.category}</span>
                    {isApproved ? (
                      <span className="badge badge-emerald">Approved</span>
                    ) : (
                      <span className="badge badge-neutral">Draft Pending Approval</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 17, marginTop: 6, color: 'var(--color-text-primary)' }}>
                    {q.prompt}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleRegenerate(q)}
                    className="btn btn-secondary btn-sm"
                    title="Regenerate from confirmed evidence"
                  >
                    <RotateCcw size={14} />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={() => navigateTo('interview')}
                    className="btn btn-ghost btn-sm"
                  >
                    Return to Interview
                  </button>
                </div>
              </div>

              {/* Draft Content & Editor */}
              {draft ? (
                <div>
                  {editingId === q.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={6}
                        style={{
                          width: '100%',
                          padding: 14,
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-forest)',
                          fontSize: 14,
                          lineHeight: 1.6,
                          fontFamily: 'inherit',
                        }}
                      />
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm">
                          Cancel
                        </button>
                        <button onClick={() => handleSaveEdit(q.id)} className="btn btn-primary btn-sm">
                          Save Edits
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: 20,
                        backgroundColor: 'var(--color-warm-ivory)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {draft.draftText}
                    </div>
                  )}

                  {/* Word Count & Evidence Citation Panel */}
                  <div
                    style={{
                      marginTop: 14,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text-secondary)' }}>
                      <span>
                        <strong>Word Count:</strong> {draft.wordCount} / {q.wordLimit} words
                      </span>
                      <span>•</span>
                      <span style={{ color: 'var(--color-forest)', fontWeight: 500 }}>
                        {draft.coverageConfidence}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => handleStartEdit(q.id, draft.draftText)}
                        className="btn btn-ghost btn-sm"
                      >
                        <Edit3 size={14} />
                        <span>Edit Text</span>
                      </button>

                      <button
                        onClick={() => handleCopy(q.id, draft.draftText)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Copy size={14} />
                        <span>{copiedId === q.id ? 'Copied!' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => handleApprove(q.id)}
                        className={`btn ${isApproved ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                      >
                        <CheckCircle2 size={14} />
                        <span>{isApproved ? 'Approved ✓' : 'Approve Draft'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Grounded Evidence Sources */}
                  {draft.evidenceSources && draft.evidenceSources.length > 0 && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: '10px 14px',
                        backgroundColor: 'var(--color-pale-sage-light)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 12,
                        color: 'var(--color-forest)',
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Supporting Evidence References:</div>
                      <ul style={{ paddingLeft: 16, margin: 0, lineHeight: 1.5 }}>
                        {draft.evidenceSources.map((ev, ei) => (
                          <li key={ei}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    padding: 24,
                    textAlign: 'center',
                    backgroundColor: 'var(--color-warm-ivory)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--color-border)',
                  }}
                >
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                    No draft has been generated for this question yet.
                  </p>
                  <button
                    onClick={() => navigateTo('interview')}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Conduct Interview for Q{idx + 1}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
