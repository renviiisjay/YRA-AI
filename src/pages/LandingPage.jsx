import React from 'react';
import { useYraApp } from '../context/AppContext';
import { YraEmblem } from '../components/YraLogo';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  Layers,
  ChevronRight,
  Lock,
  Cpu,
} from 'lucide-react';

export const LandingPage = () => {
  const { navigateTo } = useYraApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 96, paddingBottom: 64 }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          paddingTop: 64,
          paddingBottom: 48,
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {/* Atmospheric mist backdrop */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '550px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167, 220, 199, 0.35) 0%, rgba(229, 243, 236, 0.15) 50%, rgba(247, 250, 247, 0) 75%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div className="app-container" style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
          {/* Tag pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-pale-sage)',
              border: '1px solid var(--color-mint)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-forest)',
              marginBottom: 28,
            }}
          >
            <Sparkles size={14} color="var(--color-emerald)" />
            <span>Introducing YRA 2.0 — Grounded AI Agent Architecture</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(36px, 5.5vw, 64px)',
              lineHeight: 1.12,
              fontWeight: 700,
              color: 'var(--color-forest)',
              marginBottom: 24,
            }}
          >
            Your story deserves to be <span style={{ color: 'var(--color-emerald)', fontStyle: 'italic' }}>understood.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              lineHeight: 1.6,
              color: 'var(--color-text-secondary)',
              maxWidth: 720,
              margin: '0 auto 36px auto',
            }}
          >
            YRA is a dedicated personal interviewer agent that reads your resume, analyzes application questions, conducts targeted conversational interviews to uncover your true depth, and crafts verifiable, publication-ready responses.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <button
              onClick={() => navigateTo('resume')}
              className="btn btn-primary btn-lg"
              style={{ minWidth: 210 }}
            >
              <span>Start with your resume</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigateTo('workspace')}
              className="btn btn-secondary btn-lg"
              style={{ minWidth: 190 }}
            >
              <span>Explore workspace</span>
            </button>
          </div>

          {/* Real Interactive Agent Preview Card */}
          <div
            style={{
              marginTop: 64,
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
              padding: 24,
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--color-border-subtle)',
                paddingBottom: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <YraEmblem size={28} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-forest)' }}>
                  YRA Interview Engine • Active Question Analysis
                </span>
              </div>
              <span className="badge badge-emerald">Evidence Verification Live</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div
                style={{
                  backgroundColor: 'var(--color-warm-ivory)',
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-emerald)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Target Question
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  "Describe a critical obstacle you resolved during an engineering rollout."
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-pale-sage-light)',
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-mint)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-forest)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Agent Probing Logic
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-forest)' }}>
                  "Your resume highlights the 99.95% reliability gain, but what was the specific root-cause bottleneck before your intervention?"
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Systematic Workflow */}
      <section className="app-container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, marginBottom: 12 }}>How YRA Operates</h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            A rigorous, multi-stage pipeline guaranteeing that every word is grounded in your lived accomplishments.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 28,
          }}
        >
          {/* Step 1 */}
          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              01
            </div>
            <h3 style={{ fontSize: 20 }}>Document & Gaps Ingestion</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Upload your resume (PDF, DOCX, TXT) and target application form. YRA extracts factual milestones and immediately maps question requirements against known evidence.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              02
            </div>
            <h3 style={{ fontSize: 20 }}>Adaptive Personal Interview</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              No scripted forms. YRA asks intelligent, targeted follow-ups only where details are missing. Once your real impact is confirmed, it stops probing immediately.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              03
            </div>
            <h3 style={{ fontSize: 20 }}>Grounded Synthesis & Review</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Receive eloquent drafts strictly linked to resume claims and interview testimony. Edit, inspect source citations, approve, and export with zero fear of hallucinations.
            </p>
          </div>
        </div>
      </section>

      {/* Trust, Privacy & Integrity Section */}
      <section className="app-container">
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '48px 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 40,
            alignItems: 'center',
          }}
        >
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: 16 }}>
              Architectural Guarantee
            </span>
            <h2 style={{ fontSize: 28, marginBottom: 16 }}>Built for Authenticity, Not Shortcuts</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
              Generic chatbots guess dates and exaggerate accomplishments. YRA is architected to honor your actual voice. Every statement in every response ties back to verifiable candidate proof.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--color-forest)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="var(--color-emerald)" />
                <span>Zero fabricated employers, metrics, or credentials</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="var(--color-emerald)" />
                <span>Human-in-the-loop review before any export</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="var(--color-emerald)" />
                <span>Local browser-safe storage with instant deletion controls</span>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-warm-ivory)',
              padding: 28,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Lock size={18} color="var(--color-forest)" />
              <h4 style={{ fontSize: 15 }}>Security & Data Boundary</h4>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              Your documents are parsed client-side or through your private configured endpoint. Credentials remain strictly server-side and voice interactions require manual activation.
            </p>
            <button
              onClick={() => navigateTo('settings')}
              className="btn btn-secondary btn-sm"
            >
              Configure privacy settings
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
