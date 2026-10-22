import React, { useState, useEffect } from 'react';
import { YraEmblem } from './YraLogo';
import { ArrowRight, Sparkles, Volume2, X } from 'lucide-react';

/**
 * Cinematic Opening Experience for YRA
 * Phases:
 * PHASE 1 — QUIET ARRIVAL (Warm ivory canvas, gentle mist & atmospheric particles)
 * PHASE 2 — THE FLOATING EMBLEM (Ribbon Y symbol floats with emerald/mint light)
 * PHASE 3 — THE BRAND REVEAL ("YRA" and "YOUR INTENT. UNDERSTOOD.")
 * PHASE 4 — ENTER THE PLATFORM (Smooth transition into main app)
 */

export const CinematicIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState(1);
  const [skipHover, setSkipHover] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Sequence timing
    const t1 = setTimeout(() => setPhase(2), 700);   // Emblem emerges
    const t2 = setTimeout(() => setPhase(3), 2200);  // Typography reveals
    const t3 = setTimeout(() => setPhase(4), 4200);  // Prepare smooth enter
    const t4 = setTimeout(() => onComplete(), 5400); // Complete & reveal platform

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#F7FAF7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: phase === 4 ? 0 : 1,
        pointerEvents: phase === 4 ? 'none' : 'auto',
      }}
    >
      {/* Delicate drifting mist layers */}
      <div
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167, 220, 199, 0.45) 0%, rgba(229, 243, 236, 0.25) 50%, rgba(247, 250, 247, 0) 75%)',
          filter: 'blur(60px)',
          animation: 'mistDrift 14s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(40, 122, 104, 0.2) 0%, rgba(18, 60, 53, 0.05) 60%, rgba(247, 250, 247, 0) 80%)',
          filter: 'blur(70px)',
          animation: 'mistDrift 18s ease-in-out infinite alternate-reverse',
          pointerEvents: 'none',
        }}
      />

      {/* Floating Emblem Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: phase >= 2 ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.92)',
          opacity: phase >= 2 ? 1 : 0,
          transition: 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease',
          zIndex: 10,
        }}
      >
        <div className="animate-float" style={{ position: 'relative' }}>
          <YraEmblem size={110} glow={phase >= 2} />
        </div>

        {/* Wordmark and Tagline Reveal */}
        <div
          style={{
            marginTop: 32,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '46px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'var(--color-forest)',
              lineHeight: 1,
              margin: 0,
            }}
          >
            YRA
          </h1>

          <p
            style={{
              marginTop: 14,
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              letterSpacing: '0.3em',
              fontWeight: 500,
              color: 'var(--color-emerald)',
              textTransform: 'uppercase',
            }}
          >
            Your Intent. Understood.
          </p>

          <div
            style={{
              marginTop: 18,
              width: 48,
              height: 1.5,
              backgroundColor: 'var(--color-mint)',
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={onComplete}
        onMouseEnter={() => setSkipHover(true)}
        onMouseLeave={() => setSkipHover(false)}
        style={{
          position: 'absolute',
          bottom: 36,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 18px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: skipHover ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          zIndex: 20,
        }}
      >
        <span>Skip Introduction</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
};
