import React, { useState } from 'react';
import { useYraApp } from '../context/AppContext';
import { extractTextFromFile, parseResumeContent } from '../services/documentParser';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Award,
  Briefcase,
  GraduationCap,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const ResumeIntelligence = () => {
  const { candidateProfile, setCandidateProfile, navigateTo } = useYraApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Handle Drag & Drop / File Input
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsProcessing(true);
    setUploadSuccess(false);

    try {
      const rawText = await extractTextFromFile(file);
      if (!rawText || rawText.trim().length === 0) {
        throw new Error('Could not extract text. If this is a scanned document/image, standard text extraction cannot read the layers. Please upload a standard text PDF or DOCX.');
      }

      const structured = parseResumeContent(rawText);
      structured.sourceFileName = file.name;
      structured.fileSize = `${(file.size / 1024).toFixed(1)} KB`;
      structured.parsedAt = new Date().toISOString();

      setCandidateProfile(structured);
      setUploadSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to parse resume document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setCandidateProfile({
      ...candidateProfile,
      skills: [...candidateProfile.skills, newSkill.trim()],
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setCandidateProfile({
      ...candidateProfile,
      skills: candidateProfile.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleClearResume = () => {
    if (window.confirm('Are you sure you want to clear your current resume profile?')) {
      setCandidateProfile({
        fullName: 'New Candidate',
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
        rawText: '',
      });
      setUploadSuccess(false);
    }
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
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Resume Intelligence</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Upload real resumes (PDF, DOCX, TXT) to extract verifiable skills, experience, and grounded evidence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-secondary btn-sm"
          >
            <Edit2 size={14} />
            <span>{isEditing ? 'Done Editing' : 'Edit Fields'}</span>
          </button>
          <button
            onClick={handleClearResume}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--color-danger)' }}
          >
            <Trash2 size={14} />
            <span>Clear Profile</span>
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        style={{
          border: '2px dashed var(--color-mint)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-white)',
          padding: '40px 24px',
          textAlign: 'center',
          marginBottom: 32,
          position: 'relative',
          transition: 'all var(--transition-base)',
        }}
      >
        <input
          type="file"
          id="resume-file-input"
          accept=".pdf,.docx,.txt"
          onChange={handleFileUpload}
          disabled={isProcessing}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: isProcessing ? 'wait' : 'pointer',
            width: '100%',
            height: '100%',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'var(--color-pale-sage)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-forest)',
            }}
          >
            {isProcessing ? (
              <RefreshCw size={24} className="animate-pulse-subtle" />
            ) : (
              <Upload size={24} />
            )}
          </div>

          <div>
            <h3 style={{ fontSize: 18, marginBottom: 4 }}>
              {isProcessing ? 'Extracting Resume Facts...' : 'Drop your resume file here or click to browse'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Supports real PDF, DOCX, and TXT parsing. Documents are parsed directly into structured evidence records.
            </p>
          </div>

          {candidateProfile.sourceFileName && (
            <div className="badge badge-emerald">
              Active Source: {candidateProfile.sourceFileName} {candidateProfile.fileSize && `(${candidateProfile.fileSize})`}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
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

      {uploadSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            fontSize: 13,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} />
            <span>Resume parsed successfully! Extracted {candidateProfile.skills.length} skills and {candidateProfile.experience.length} experience entries.</span>
          </div>
          <button
            onClick={() => navigateTo('applications_new')}
            className="btn btn-primary btn-sm"
          >
            <span>Proceed to Application Studio</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Extracted Profile Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Candidate Identity Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <FileText size={20} color="var(--color-forest)" />
            <h3 style={{ fontSize: 18 }}>Candidate Identity</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>FULL NAME</label>
              {isEditing ? (
                <input
                  type="text"
                  value={candidateProfile.fullName}
                  onChange={(e) => setCandidateProfile({ ...candidateProfile, fullName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', marginTop: 4, borderRadius: 6, border: '1px solid var(--color-border)' }}
                />
              ) : (
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-forest)' }}>{candidateProfile.fullName}</div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>EMAIL ADDRESS</label>
              <div style={{ fontSize: 14 }}>{candidateProfile.email || 'None detected'}</div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>CONTACT PHONE</label>
              <div style={{ fontSize: 14 }}>{candidateProfile.phone || 'None detected'}</div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>SUMMARY OVERVIEW</label>
              {isEditing ? (
                <textarea
                  value={candidateProfile.summary}
                  onChange={(e) => setCandidateProfile({ ...candidateProfile, summary: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '8px 12px', marginTop: 4, borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 13 }}
                />
              ) : (
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{candidateProfile.summary}</div>
              )}
            </div>
          </div>
        </div>

        {/* Verified Skills Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Award size={20} color="var(--color-forest)" />
              <h3 style={{ fontSize: 18 }}>Skills & Competencies ({candidateProfile.skills.length})</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {candidateProfile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="badge badge-emerald"
                style={{ fontSize: 12, padding: '4px 10px' }}
              >
                <span>{skill}</span>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-forest)', marginLeft: 4 }}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>

          {isEditing && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Add custom skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                style={{ flex: 1, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
              <button onClick={handleAddSkill} className="btn btn-secondary btn-sm">
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          )}
        </div>

        {/* Experience Card */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Briefcase size={20} color="var(--color-forest)" />
            <h3 style={{ fontSize: 18 }}>Work Experience ({candidateProfile.experience.length})</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {candidateProfile.experience.map((exp, idx) => (
              <div
                key={idx}
                style={{
                  padding: 14,
                  backgroundColor: 'var(--color-warm-ivory)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-forest)' }}>
                  {exp.roleTitle}
                </div>
                {exp.period && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{exp.period}</div>}
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {exp.bullets.map((b, bi) => (
                      <li key={bi}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education & Projects Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <GraduationCap size={20} color="var(--color-forest)" />
            <h3 style={{ fontSize: 18 }}>Education & Key Projects</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {candidateProfile.education.map((edu, idx) => (
              <div key={idx} style={{ padding: 12, backgroundColor: 'var(--color-warm-ivory)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{edu.institution}</div>
                {edu.degree && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{edu.degree}</div>}
              </div>
            ))}

            {candidateProfile.projects.map((proj, idx) => (
              <div key={idx} style={{ padding: 12, backgroundColor: 'var(--color-warm-ivory)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-forest)' }}>Project: {proj.title}</div>
                {proj.description && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{proj.description}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
