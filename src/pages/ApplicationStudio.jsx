import React, { useState } from 'react';
import { useYraApp } from '../context/AppContext';
import { extractTextFromFile, parseApplicationQuestions } from '../services/documentParser';
import {
  Upload,
  FileCheck2,
  Plus,
  Trash2,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  FileText,
  Sliders,
} from 'lucide-react';

export const ApplicationStudio = () => {
  const { questions, setQuestions, navigateTo } = useYraApp();
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [newQuestionPrompt, setNewQuestionPrompt] = useState('');
  const [newWordLimit, setNewWordLimit] = useState(250);

  // File upload of application questionnaire
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsProcessing(true);

    try {
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length === 0) {
        throw new Error('Unable to extract questions from document. Please ensure file contains digital text or paste prompts directly.');
      }
      const parsedQuestions = parseApplicationQuestions(text);
      if (parsedQuestions.length === 0) {
        throw new Error('No distinct questions detected in this document. Try pasting prompts below.');
      }
      setQuestions(parsedQuestions);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error parsing application document.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Parsing pasted questionnaire
  const handleParsePasted = () => {
    if (!pastedText.trim()) return;
    const parsedQuestions = parseApplicationQuestions(pastedText);
    if (parsedQuestions.length === 0) {
      setErrorMsg('No questions detected in pasted text. Add a question mark or numbers.');
      return;
    }
    setQuestions(parsedQuestions);
    setPastedText('');
    setErrorMsg('');
  };

  // Manual question addition
  const handleAddManual = () => {
    if (!newQuestionPrompt.trim()) return;
    const newQ = {
      id: `q_${Date.now()}`,
      prompt: newQuestionPrompt.trim(),
      originalText: newQuestionPrompt.trim(),
      required: true,
      wordLimit: parseInt(newWordLimit, 10) || 250,
      category: 'General Application Question',
      status: 'pending',
    };
    setQuestions([...questions, newQ]);
    setNewQuestionPrompt('');
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleUpdateLimit = (id, newLimit) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, wordLimit: parseInt(newLimit, 10) || 250 } : q))
    );
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
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Application Studio</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Ingest application forms, questionnaires, or behavioral essay prompts to extract required questions.
          </p>
        </div>

        <button
          onClick={() => navigateTo('interview')}
          className="btn btn-primary"
          disabled={questions.length === 0}
        >
          <span>Launch AI Interview</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {errorMsg && (
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
            marginBottom: 24,
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Methods: Split into File Upload & Direct Paste */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 36 }}>
        {/* Option A: Upload Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Upload size={20} color="var(--color-forest)" />
            <h3 style={{ fontSize: 18 }}>Upload Application Form</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Upload PDF, DOCX, or TXT forms containing application essay prompts.
          </p>

          <label
            style={{
              border: '2px dashed var(--color-mint)',
              borderRadius: 'var(--radius-md)',
              padding: '28px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--color-warm-ivory)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isProcessing}
              style={{ display: 'none' }}
            />
            <FileText size={24} color="var(--color-emerald)" />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-forest)' }}>
              {isProcessing ? 'Analyzing document...' : 'Select Application File'}
            </span>
          </label>
        </div>

        {/* Option B: Direct Paste */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileCheck2 size={20} color="var(--color-forest)" />
            <h3 style={{ fontSize: 18 }}>Paste Prompts Directly</h3>
          </div>

          <textarea
            placeholder="Paste numbered questions or application essay prompts here... e.g.:&#10;1. Describe a time you demonstrated leadership under pressure. (Max 250 words)&#10;2. Why are you interested in our team?"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: 13,
              fontFamily: 'inherit',
            }}
          />

          <button onClick={handleParsePasted} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
            <span>Extract Questions From Paste</span>
          </button>
        </div>
      </div>

      {/* Review Extracted Questions List */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 20 }}>Target Application Questions ({questions.length})</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Review, edit word limits, or add specific questions before entering the interview room.
            </p>
          </div>

          <div style={{ fontSize: 12, color: 'var(--color-emerald)', fontWeight: 600 }}>
            Ready for Adaptive Interview
          </div>
        </div>

        {/* Questions Table / List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions.map((q, idx) => (
            <div
              key={q.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warm-ivory)',
                border: '1px solid var(--color-border)',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 260 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-forest)', minWidth: 24, marginTop: 2 }}>
                  Q{idx + 1}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {q.prompt}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                      {q.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Limit:</span>
                  <input
                    type="number"
                    value={q.wordLimit}
                    onChange={(e) => handleUpdateLimit(q.id, e.target.value)}
                    style={{
                      width: 70,
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: '1px solid var(--color-border)',
                      fontSize: 12,
                      textAlign: 'center',
                    }}
                  />
                  <span style={{ color: 'var(--color-text-muted)' }}>words</span>
                </div>

                <button
                  onClick={() => handleRemoveQuestion(q.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                  title="Remove question"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Question Manually */}
        <div
          style={{
            marginTop: 12,
            paddingTop: 16,
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Type a custom application question..."
            value={newQuestionPrompt}
            onChange={(e) => setNewQuestionPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
            style={{
              flex: 1,
              minWidth: 240,
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: 13,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Limit:</span>
            <input
              type="number"
              value={newWordLimit}
              onChange={(e) => setNewWordLimit(e.target.value)}
              style={{
                width: 70,
                padding: '6px 8px',
                borderRadius: 4,
                border: '1px solid var(--color-border)',
                fontSize: 12,
                textAlign: 'center',
              }}
            />
          </div>
          <button onClick={handleAddManual} className="btn btn-secondary btn-sm">
            <Plus size={14} />
            <span>Add Question</span>
          </button>
        </div>
      </div>
    </div>
  );
};
