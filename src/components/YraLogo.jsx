import React from 'react';

/**
 * YRA Ribbon Emblem & Brand Logo
 * Features:
 * - Fluid ribbon-inspired 'Y' geometry
 * - Precision emerald, forest green, and mint gradients
 * - Editorial typography with "YOUR INTENT. UNDERSTOOD."
 * - Variants: 'full' (emblem + wordmark + tagline), 'compact' (emblem + wordmark), 'symbol' (emblem icon only)
 */

export const YraEmblem = ({ size = 48, className = '', glow = false }) => {
  return (
    <div
      className={`yra-emblem-wrap ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: glow ? 'drop-shadow(0 0 16px rgba(40, 122, 104, 0.45))' : 'none',
        transition: 'filter 0.3s ease',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* Main ribbon emerald gradient */}
          <linearGradient id="yraEmeraldRibbon" x1="15%" y1="10%" x2="90%" y2="95%">
            <stop offset="0%" stopColor="#A7DCC7" />
            <stop offset="35%" stopColor="#349680" />
            <stop offset="70%" stopColor="#287A68" />
            <stop offset="100%" stopColor="#123C35" />
          </linearGradient>

          {/* Left ribbon loop */}
          <linearGradient id="yraLeftArm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9EFE0" />
            <stop offset="50%" stopColor="#349680" />
            <stop offset="100%" stopColor="#123C35" />
          </linearGradient>

          {/* Right ribbon loop */}
          <linearGradient id="yraRightArm" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A7DCC7" />
            <stop offset="45%" stopColor="#287A68" />
            <stop offset="100%" stopColor="#0B2621" />
          </linearGradient>

          {/* Central stem */}
          <linearGradient id="yraStem" x1="50%" y1="30%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#287A68" />
            <stop offset="60%" stopColor="#123C35" />
            <stop offset="100%" stopColor="#071916" />
          </linearGradient>

          {/* Atmospheric glow filter */}
          <filter id="yraSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer subtle aura */}
        <circle cx="60" cy="60" r="54" fill="url(#yraEmeraldRibbon)" opacity="0.06" />

        {/* Stylized Ribbon 'Y' Symbol */}
        {/* Left Arm of the Y Ribbon */}
        <path
          d="M 28 26 C 36 24 50 34 58 54 C 52 42 42 32 30 30 C 26 29 25 27 28 26 Z"
          fill="url(#yraLeftArm)"
          opacity="0.9"
        />

        {/* Main Ribbon Body: Left branch flowing down to center stem */}
        <path
          d="M 24 32 C 34 32 48 48 58 64 C 58 64 56 82 56 100 C 56 104 64 104 64 100 C 64 82 62 64 62 64 C 72 48 86 32 96 32 C 102 32 92 44 80 58 C 68 72 65 84 65 100 C 65 106 55 106 55 100 C 55 80 50 66 38 52 C 28 40 20 32 24 32 Z"
          fill="url(#yraEmeraldRibbon)"
        />

        {/* Right branch highlight ribbon */}
        <path
          d="M 96 32 C 86 32 74 46 64 62 C 67 52 76 38 88 32 C 94 28 98 30 96 32 Z"
          fill="url(#yraRightArm)"
          opacity="0.95"
        />

        {/* Central Core Ribbon Loop overlay giving 3D woven knot effect */}
        <path
          d="M 46 44 C 54 58 60 68 60 76 C 60 68 66 58 74 44 C 68 40 52 40 46 44 Z"
          fill="url(#yraStem)"
          opacity="0.85"
        />

        {/* Luminous Core Pearl Accent */}
        <circle cx="60" cy="60" r="3.5" fill="#E5F3EC" opacity="0.9" filter="url(#yraSoftGlow)" />
        <circle cx="60" cy="60" r="1.8" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export const YraLogo = ({
  variant = 'compact', // 'full' | 'compact' | 'symbol'
  size = 40,
  dark = false,
  className = '',
  glow = false,
}) => {
  const textColor = dark ? '#FFFFFF' : 'var(--color-forest)';
  const subColor = dark ? '#A7DCC7' : 'var(--color-text-secondary)';

  if (variant === 'symbol') {
    return <YraEmblem size={size} className={className} glow={glow} />;
  }

  return (
    <div
      className={`yra-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size > 48 ? 16 : 12,
        userSelect: 'none',
      }}
    >
      <YraEmblem size={size} glow={glow} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: size > 48 ? 32 : size > 32 ? 22 : 18,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: textColor,
            lineHeight: 1,
          }}
        >
          YRA
        </div>
        {variant === 'full' && (
          <div
            style={{
              fontSize: size > 48 ? 11 : 9,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: subColor,
              marginTop: 5,
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
            }}
          >
            Your Intent. Understood.
          </div>
        )}
      </div>
    </div>
  );
};
