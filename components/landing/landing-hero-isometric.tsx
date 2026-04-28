"use client";
import { BrandLockup } from "../branding/brand-lockup";
import "./landing-hero-isometric.css";

function AiPanel() {
  const barData = [38, 28, 46, 36, 51, 41, 58, 44, 50, 34, 48];
  const sparkPoints = barData
    .map((h, i) => `${215 + i * 16},${146 - h}`)
    .join(" ");

  return (
    <g filter="url(#hero-shadow)">
      <rect
        x={194}
        y={44}
        width={212}
        height={128}
        rx={14}
        fill="url(#hero-glass-bg)"
        stroke="#10b981"
        strokeWidth={1.2}
        strokeOpacity={0.45}
      />
      <rect
        x={194}
        y={44}
        width={212}
        height={128}
        rx={14}
        fill="url(#hero-glass-shine)"
      />

      <rect x={194} y={44} width={212} height={30} rx={14} fill="#0a2b1c" />
      <rect x={194} y={58} width={212} height={16} fill="#0a2b1c" />

      <rect
        x={241}
        y={50}
        width={118}
        height={18}
        rx={5}
        fill="#064e3b"
        stroke="#34d399"
        strokeWidth={0.8}
        strokeOpacity={0.5}
      />
      <foreignObject x={241} y={50} width={118} height={18}>
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-md">
          <div
            className="pointer-events-none origin-center select-none"
            style={{ transform: "translateY(0.5px) scale(0.34)" }}
          >
            <BrandLockup
              variant="landing"
              hideIcon
              finansClassName="text-emerald-100 dark:text-emerald-100"
            />
          </div>
        </div>
      </foreignObject>

      <g opacity={0.9}>
        {barData.map((h, i) => (
          <rect
            key={i}
            x={210 + i * 16}
            y={146 - h}
            width={10}
            height={h}
            rx={2}
            fill="url(#hero-bar-grad)"
            opacity={0.7 + (i % 3) * 0.1}
          />
        ))}
      </g>

      <polyline
        points={sparkPoints}
        stroke="#6ee7b7"
        strokeWidth={1.4}
        fill="none"
        opacity={0.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect x={206} y={152} width={188} height={12} rx={4} fill="#042814" />
      <g clipPath="url(#hero-status-clip)">
        <rect
          x={206}
          y={152}
          width={118}
          height={12}
          rx={4}
          fill="url(#hero-ai-core)"
          opacity={0.95}
          className="hero-ld"
        />
      </g>
      <circle cx={214} cy={158} r={3} fill="#ecfdf5" className="hero-bl" />
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <radialGradient id="hero-bg-glow" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
        <stop offset="60%" stopColor="#059669" stopOpacity={0.06} />
        <stop offset="100%" stopColor="#000" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="hero-floor-glow" cx="50%" cy="100%" r="55%">
        <stop offset="0%" stopColor="#064e3b" stopOpacity={0.5} />
        <stop offset="100%" stopColor="#000" stopOpacity={0} />
      </radialGradient>

      <linearGradient id="hero-glass-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0d2e1f" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#071a12" stopOpacity={0.98} />
      </linearGradient>
      <linearGradient id="hero-glass-shine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fff" stopOpacity={0.08} />
        <stop offset="100%" stopColor="#fff" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="hero-bar-grad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#065f46" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#6ee7b7" />
      </linearGradient>
      <linearGradient id="hero-ai-core" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#064e3b" />
        <stop offset="40%" stopColor="#059669" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>

      <linearGradient id="hero-spark-fill" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
        <stop offset="70%" stopColor="#059669" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#022c22" stopOpacity="0.55" />
      </linearGradient>

      <linearGradient id="hero-gold-face" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef9c3" />
        <stop offset="50%" stopColor="#fcd34d" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="hero-gold-bottom" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#78350f" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>
      <radialGradient id="hero-hex-grad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#c4b5fd" />
        <stop offset="50%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#2e1065" />
      </radialGradient>
      <linearGradient id="hero-candle-up" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#065f46" />
        <stop offset="100%" stopColor="#4ade80" />
      </linearGradient>
      <linearGradient id="hero-candle-dn" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#7f1d1d" />
        <stop offset="100%" stopColor="#fca5a5" />
      </linearGradient>

      <clipPath id="hero-panel-clip">
        <rect x={194} y={44} width={212} height={128} rx={14} />
      </clipPath>
      <clipPath id="hero-panel-body-clip">
        <rect x={194} y={74} width={212} height={98} />
      </clipPath>
      <clipPath id="hero-status-clip">
        <rect x={206} y={152} width={188} height={12} rx={4} />
      </clipPath>

      <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx={0}
          dy={8}
          stdDeviation={10}
          floodColor="#000"
          floodOpacity={0.5}
        />
      </filter>
      <filter id="hero-glow-sm" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation={4} result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="hero-glow-xs" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={2.5} result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

export function LandingHeroIsometricIllustration() {
  return (
    <div
      className="relative mt-5 mx-auto w-full max-w-sm sm:max-w-md lg:mx-0 lg:mt-0 lg:max-w-104"
      aria-hidden
    >
      <div
        className="relative w-full overflow-hidden rounded-xl aspect-3/2"
        role="img"
        aria-label="AI-powered finance dashboard with candlestick and area charts, coins, gold and crypto"
      >
        <svg
          viewBox="184 34 232 148"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          aria-hidden
        >
          <Defs />
          <AiPanel />
        </svg>
      </div>
    </div>
  );
}
