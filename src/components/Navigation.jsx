import React, { useState } from 'react';
import { useYraApp } from '../context/AppContext';
import { YraLogo } from './YraLogo';
import {
  FileText,
  Briefcase,
  Layers,
  Settings,
  History,
  MessageSquare,
  CheckCircle2,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';

export const NavigationHeader = () => {
  const { currentRoute, navigateTo, candidateProfile, questions, sessionAnswers } = useYraApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate quick stats
  const answeredCount = Object.values(sessionAnswers).filter((a) => a.approved).length;

  const navLinks = [
    { id: 'landing', label: 'Overview' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'resume', label: 'Resume' },
    { id: 'applications_new', label: 'Application Studio' },
    { id: 'interview', label: 'AI Interview' },
    { id: 'review', label: 'Answer Review' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
  ];

  const handleNav = (id) => {
    navigateTo(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(247, 250, 247, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 72,
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => handleNav('landing')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <YraLogo variant="compact" size={36} />
        </div>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 6,
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                style={{
                  background: isActive ? 'var(--color-pale-sage)' : 'transparent',
                  color: isActive ? 'var(--color-forest)' : 'var(--color-text-secondary)',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Quick Action / Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => handleNav('interview')}
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-pale-sage-light)',
              border: '1px solid var(--color-mint)',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--color-forest)',
              cursor: 'pointer',
            }}
            className="header-cta"
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: 'var(--color-emerald)',
              }}
            />
            <span>Agent Active</span>
          </div>

          <button
            onClick={() => handleNav('workspace')}
            className="btn btn-primary btn-sm"
          >
            <span>Launch Studio</span>
            <ArrowRight size={14} />
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: 6,
              cursor: 'pointer',
              color: 'var(--color-forest)',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            borderBottom: '1px solid var(--color-border)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {navLinks.map((link) => {
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                style={{
                  textAlign: 'left',
                  background: isActive ? 'var(--color-pale-sage)' : 'transparent',
                  color: isActive ? 'var(--color-forest)' : 'var(--color-text-secondary)',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                }}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Global CSS responsive adjustments */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .header-cta { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export const Footer = () => {
  const { navigateTo } = useYraApp();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        backgroundColor: '#F3F7F4',
        padding: '56px 0 32px 0',
        marginTop: 64,
      }}
    >
      <div className="app-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 40,
            marginBottom: 40,
          }}
        >
          <div>
            <YraLogo variant="full" size={38} />
            <p
              style={{
                marginTop: 14,
                fontSize: 13,
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                maxWidth: 280,
              }}
            >
              The intelligent AI agent platform bridging authentic candidate experience with verified application responses.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              Product Journey
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <span style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => navigateTo('resume')}>
                Resume Intelligence
              </span>
              <span style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => navigateTo('applications_new')}>
                Application Studio
              </span>
              <span style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => navigateTo('interview')}>
                AI Interview Room
              </span>
              <span style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => navigateTo('review')}>
                Answer Review & Export
              </span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              Ethical AI & Trust
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)' }}>
                <ShieldCheck size={14} color="var(--color-emerald)" />
                <span>Zero Hallucination Guarantee</span>
              </div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Human-in-the-Loop Approval</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>Local & Server Privacy Sandbox</span>
              <span style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => navigateTo('settings')}>
                Data & Storage Controls
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            fontSize: 12,
            color: 'var(--color-text-muted)',
          }}
        >
          <div>© {new Date().getFullYear()} YRA — Your Intent. Understood. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span>Privacy Policy</span>
            <span>Security Statement</span>
            <span>API Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
