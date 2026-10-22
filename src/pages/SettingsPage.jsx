import React, { useState } from 'react';
import { useYraApp } from '../context/AppContext';
import {
  Settings,
  Shield,
  Key,
  Volume2,
  Trash2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage = ({ onReplayIntro }) => {
  const { settings, updateSetting, resetAllData } = useYraApp();
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey || '');
  const [saveNotif, setSaveNotif] = useState(false);

  const handleSaveApi = () => {
    updateSetting('apiKey', apiKeyInput);
    setSaveNotif(true);
    setTimeout(() => setSaveNotif(false), 2500);
  };

  const handleClearAll = () => {
    if (window.confirm('This will wipe all locally stored candidate facts, interview messages, and drafts. Continue?')) {
      resetAllData();
      alert('Local workspace reset successfully.');
    }
  };

  return (
    <div className="app-container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Platform Settings & Privacy</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
          Manage AI runtime credentials, voice synthesizers, intro sequences, and local session memory.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
        {/* Card 1: Experience & Motion Controls */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={20} color="var(--color-forest)" />
            <h2 style={{ fontSize: 18 }}>Experience & Cinematic Motion</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Replay Cinematic Intro
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  Experience the full ribbon emblem floating sequence.
                </div>
              </div>
              <button onClick={onReplayIntro} className="btn btn-secondary btn-sm">
                Play Intro
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Agent Voice Synthesis (TTS)
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  Speak adaptive interview questions automatically.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoTTS}
                onChange={(e) => updateSetting('autoTTS', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--color-forest)', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: AI Provider & Endpoint Setup */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Key size={20} color="var(--color-forest)" />
            <h2 style={{ fontSize: 18 }}>AI Provider Configuration</h2>
          </div>

          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            YRA runs out-of-the-box with its built-in deterministic semantic interviewer. To connect external large language models directly:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                ACTIVE ENGINE
              </label>
              <select
                value={settings.apiProvider}
                onChange={(e) => updateSetting('apiProvider', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--color-border)',
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                <option value="local_agent">Built-in Semantic Interviewer (Zero Setup Required)</option>
                <option value="openai">OpenAI (GPT-4o / gpt-4o-mini)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="gemini">Google Gemini 2.0 Flash</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                OPTIONAL API KEY
              </label>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--color-border)',
                  fontSize: 13,
                  marginTop: 4,
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Keys are retained only in browser memory.
              </span>
              <button onClick={handleSaveApi} className="btn btn-primary btn-sm">
                Save Key
              </button>
            </div>

            {saveNotif && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-emerald)', fontSize: 12 }}>
                <CheckCircle2 size={14} />
                <span>Provider settings saved!</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Privacy & Data Sandbox */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Shield size={20} color="var(--color-forest)" />
            <h2 style={{ fontSize: 18 }}>Data & Privacy Controls</h2>
          </div>

          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
            YRA never sells or shares your uploaded resumes, questions, or conversational transcripts. Everything is stored locally on this machine.
          </p>

          <button
            onClick={handleClearAll}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-border)' }}
          >
            <Trash2 size={14} />
            <span>Reset Local Database & Wipe Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
