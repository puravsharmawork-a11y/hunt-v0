// src/components/StudentOnboarding.jsx
// ─── HUNT brutalist onboarding (cream/ink/electric-blue) ──────────────────────
// Faithful port of the brutalist HUNT onboarding reference design:
//   • two-column layout (form + sticky Signal Strength sidebar)
//   • brutalist card with ink corner ticks
//   • dotted-bar progress with square ticks all visible
//   • top brutalist marquee with blue dots
//   • blinking pixel-dot kicker on every step header
//   • SectionHead with horizontal rule + label
//   • brutalist .btn / .input / .card / .chip / .kicker classes injected globally
//   • completion view with big blue check + serif "Welcome, <em>{firstName}.</em>"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Plus, X, Github, Loader, Sun, Moon,
  AlertCircle, Upload,
} from 'lucide-react';
import { createStudentProfile, uploadResume } from '../services/supabase';
import { importFromGitHub, isValidGitHubUsername } from '../services/github';
import { useNavigate } from 'react-router-dom';

// ─── Design tokens — brutalist cream / ink / electric-blue ────────────────────
// Var names map to the reference CSS so styles like `var(--blue)`, `var(--ink)`
// just work. We also alias --green to --blue (same as the dashboard) for back-
// compat with older code that referenced --green.
const tokens = {
  light: {
    '--cream':      '#F2F0E8',
    '--cream-2':    '#E8E5DA',
    '--cream-3':    '#DDD9CB',
    '--paper':      '#FAF8F0',
    '--ink':        '#14130E',
    '--ink-2':      '#3A362A',
    '--ink-3':      '#6E6955',
    '--ink-4':      '#A8A28C',
    '--line':       '#1413180E',
    '--line-mid':   '#14130E22',
    '--rule':       '#14130E',
    '--blue':       '#1A35E8',
    '--blue-tint':  '#E3E7FB',
    '--blue-deep':  '#0B1BA0',
    '--amber':      '#B85C00',
    '--amber-tint': '#F7E7D2',
    '--red':        '#B8281C',
    '--red-tint':   '#F7D9D4',
    /* derived */
    '--bg':         '#F2F0E8',
    '--bg-card':    '#FAF8F0',
    '--bg-subtle':  '#E8E5DA',
    '--border':     '#0000001A',
    '--border-mid': '#00000033',
    '--text':       '#14130E',
    '--text-mid':   '#3A362A',
    '--text-dim':   '#6E6955',
    '--text-faint': '#A8A28C',
    /* legacy alias */
    '--green':      '#1A35E8',
    '--green-tint': '#E3E7FB',
    '--green-text': '#0B1BA0',
    '--focus':      '#14130E',
  },
  dark: {
    '--cream':      '#0E0E0C',
    '--cream-2':    '#16150F',
    '--cream-3':    '#1E1C17',
    '--paper':      '#16150F',
    '--ink':        '#F2F0E8',
    '--ink-2':      '#C9C5B4',
    '--ink-3':      '#8A8572',
    '--ink-4':      '#5A5646',
    '--line':       '#F2F0E812',
    '--line-mid':   '#F2F0E828',
    '--rule':       '#F2F0E8',
    '--blue':       '#6B82F7',
    '--blue-tint':  '#1E2448',
    '--blue-deep':  '#C0CAFB',
    '--amber':      '#E9B25A',
    '--amber-tint': '#2E2413',
    '--red':        '#E5726A',
    '--red-tint':   '#301814',
    '--bg':         '#0E0E0C',
    '--bg-card':    '#16150F',
    '--bg-subtle':  '#1C1B15',
    '--border':     '#ffffff12',
    '--border-mid': '#ffffff22',
    '--text':       '#F2F0E8',
    '--text-mid':   '#C9C5B4',
    '--text-dim':   '#8A8572',
    '--text-faint': '#5A5646',
    '--green':      '#6B82F7',
    '--green-tint': '#1E2448',
    '--green-text': '#C0CAFB',
    '--focus':      '#F2F0E8',
  },
};

// ─── One-time global stylesheet injection ─────────────────────────────────────
// Brutalist utility classes copied verbatim from the reference styles.css.
// We inject once into <head> so the onboarding component is self-contained.
let _globalsInjected = false;
function injectGlobals() {
  if (_globalsInjected || typeof document === 'undefined') return;
  const tag = document.createElement('style');
  tag.id = 'hunt-onb-globals';
  tag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap');

    /* ─── Type primitives ─── */
    .hunt-mono   { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; font-feature-settings: 'zero' 1; }
    .hunt-serif  { font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif; }
    .hunt-display-serif { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; letter-spacing: -0.01em; line-height: 1.02; }
    .hunt-kicker {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px; font-weight: 500;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--text-dim);
    }
    .hunt-kicker-ink  { color: var(--text); }
    .hunt-kicker-blue { color: var(--blue); }

    /* ─── Bitmap / pixel accents ─── */
    .hunt-pixel-dot {
      display: inline-block; width: 6px; height: 6px;
      background: var(--blue); image-rendering: pixelated;
    }
    .hunt-bitmap-bg {
      background-image:
        linear-gradient(to right, rgba(20,19,14,0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(20,19,14,0.04) 1px, transparent 1px);
      background-size: 28px 28px;
    }
    [data-theme="dark"] .hunt-bitmap-bg {
      background-image:
        linear-gradient(to right, rgba(242,240,232,0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(242,240,232,0.04) 1px, transparent 1px);
    }

    /* ─── Card with ink corner ticks (4 black squares at corners) ─── */
    .hunt-card {
      background: var(--bg-card);
      border: 1px solid var(--border-mid);
      border-radius: 0;
      position: relative;
    }
    .hunt-corner-tick { position: relative; }
    .hunt-corner-tick::before, .hunt-corner-tick::after {
      content: ''; position: absolute; width: 6px; height: 6px;
      background: var(--ink); z-index: 2;
    }
    .hunt-corner-tick::before { top: -1px; left: -1px; }
    .hunt-corner-tick::after  { bottom: -1px; right: -1px; }
    /* extra two corners via children spans */
    .hunt-corner-tick > .hunt-tick-tr, .hunt-corner-tick > .hunt-tick-bl {
      position: absolute; width: 6px; height: 6px;
      background: var(--ink); z-index: 2;
    }
    .hunt-corner-tick > .hunt-tick-tr { top: -1px; right: -1px; }
    .hunt-corner-tick > .hunt-tick-bl { bottom: -1px; left: -1px; }

    /* ─── Brutalist button ─── */
    .hunt-btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px; letter-spacing: 0.1em;
      text-transform: uppercase; font-weight: 500;
      padding: 10px 16px;
      border: 1px solid var(--ink);
      background: transparent; color: var(--ink);
      border-radius: 0; cursor: pointer;
      transition: transform 0.08s ease, box-shadow 0.08s ease,
                  background 0.12s, color 0.12s;
    }
    .hunt-btn:hover:not(:disabled) { background: var(--ink); color: var(--cream); }
    .hunt-btn-primary {
      background: var(--blue); color: #fff; border-color: var(--blue);
      box-shadow: 3px 3px 0 0 var(--ink);
    }
    .hunt-btn-primary:hover:not(:disabled) {
      background: var(--blue-deep); color: #fff;
      transform: translate(-1px,-1px); box-shadow: 4px 4px 0 0 var(--ink);
    }
    .hunt-btn-primary:active:not(:disabled) {
      transform: translate(2px,2px); box-shadow: 1px 1px 0 0 var(--ink);
    }
    .hunt-btn-dark { background: var(--ink); color: var(--cream); border-color: var(--ink); }
    .hunt-btn-dark:hover:not(:disabled) { background: var(--ink-2); color: var(--cream); }
    .hunt-btn-ghost { border-color: var(--border-mid); }
    .hunt-btn-sm { padding: 6px 10px; font-size: 10.5px; }
    .hunt-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ─── Input ─── */
    .hunt-input {
      font-family: 'Inter', sans-serif;
      font-size: 13px; padding: 10px 12px;
      border: 1px solid var(--border-mid);
      background: var(--bg-card);
      border-radius: 0; color: var(--text); width: 100%;
      box-sizing: border-box; outline: none;
      transition: border-color 0.12s;
    }
    .hunt-input:focus { border-color: var(--ink); }
    select.hunt-input {
      appearance: none;
      background-image:
        linear-gradient(45deg, transparent 50%, var(--text-dim) 50%),
        linear-gradient(135deg, var(--text-dim) 50%, transparent 50%);
      background-position: calc(100% - 14px) 50%, calc(100% - 10px) 50%;
      background-size: 4px 4px, 4px 4px;
      background-repeat: no-repeat;
      padding-right: 28px;
    }
    input[type="date"].hunt-input::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }

    /* ─── Chip ─── */
    .hunt-chip {
      display: inline-flex; align-items: center; gap: 5px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px; letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 3px 8px; border: 1px solid var(--border-mid);
      color: var(--text-mid); background: transparent;
      border-radius: 0; white-space: nowrap;
    }
    .hunt-chip-blue-tint { background: var(--blue-tint); color: var(--blue-deep); border-color: var(--blue); }
    .hunt-chip-red { background: var(--red-tint); color: var(--red); border-color: var(--red); }

    /* ─── Marquee ─── */
    @keyframes hunt-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    .hunt-marquee-track { display: flex; gap: 36px; align-items: center; animation: hunt-marquee 40s linear infinite; width: max-content; }
    .hunt-marquee-track > span { display: flex; align-items: center; gap: 16px; }

    /* ─── Blink for pixel dot ─── */
    @keyframes hunt-blink { 0%, 70% { opacity: 1; } 71%, 100% { opacity: 0.1; } }
    .hunt-blink { animation: hunt-blink 1.2s steps(2, end) infinite; }

    /* ─── Spin ─── */
    @keyframes hunt-spin { to { transform: rotate(360deg); } }
    .hunt-spin { animation: hunt-spin 0.9s linear infinite; }

    /* ─── Hatched track for progress bar ─── */
    .hunt-hatch {
      background-image: linear-gradient(to right, var(--rule) 50%, transparent 50%);
      background-size: 6px 2px; background-repeat: repeat-x; opacity: 0.25;
    }

    /* ─── Mobile: stack the two-column layout ─── */
    @media (max-width: 900px) {
      .hunt-onb-grid { grid-template-columns: 1fr !important; }
      .hunt-onb-grid aside { display: none !important; }
    }

    /* ─── Scrollbar ─── */
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 0; }
    ::-webkit-scrollbar-thumb:hover { background: var(--text-faint); }
  `;
  document.head.appendChild(tag);
  _globalsInjected = true;
}

function applyTokens(theme) {
  injectGlobals();
  const root = document.documentElement;
  root.dataset.theme = theme;
  Object.entries(tokens[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
}

// ─── 5x5 Pixel HUNT mark (brand signature) ───────────────────────────────────
const PixelMark = ({ size = 18, color = 'var(--blue)' }) => {
  const on = [
    1,0,0,0,1,
    1,0,0,0,1,
    1,1,1,1,1,
    1,0,0,0,1,
    1,0,0,0,1,
  ];
  const px = Math.max(2, Math.floor(size / 6));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(5, ${px}px)`, gridAutoRows: `${px}px`, gap: 1 }}>
      {on.map((v, i) => <div key={i} style={{ background: v ? color : 'transparent' }} />)}
    </div>
  );
};

// ─── Brand SVG logos for coding platforms ─────────────────────────────────────
const LinkedInLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2" style={{ flexShrink: 0 }}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const GitHubLogo = ({ theme }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={theme === 'dark' ? '#FAFAF8' : '#0A0A0A'} style={{ flexShrink: 0 }}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);
const LeetCodeLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFA116" style={{ flexShrink: 0 }}>
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H19.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
  </svg>
);
const CodeChefLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#5B4638" style={{ flexShrink: 0 }}>
    <path d="M11.257.004C5.858-.114 1.83 4.33 1.945 9.728c-.014 2.76 1.202 5.205 3.15 6.87L4.4 18.45l1.967 2.307.87-1.02c1.54 1.024 3.394 1.615 5.396 1.615 2.003 0 3.856-.59 5.397-1.614l.87 1.02 1.966-2.308-.696-1.852c1.948-1.666 3.164-4.11 3.15-6.87.115-5.398-3.913-9.842-9.313-9.724h.25z"/>
  </svg>
);
const CodeForcesLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#1F8ACB" style={{ flexShrink: 0 }}>
    <path d="M4.5 7.5A1.5 1.5 0 0 1 6 9v10.5A1.5 1.5 0 0 1 4.5 21h-3A1.5 1.5 0 0 1 0 19.5V9a1.5 1.5 0 0 1 1.5-1.5h3zm9-4.5A1.5 1.5 0 0 1 15 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 19.5v-15A1.5 1.5 0 0 1 10.5 3h3zm9 7.5A1.5 1.5 0 0 1 24 12v7.5A1.5 1.5 0 0 1 22.5 21h-3a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5h3z"/>
  </svg>
);
const KaggleLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#20BEFF" style={{ flexShrink: 0 }}>
    <path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .237.05.285.14.046.094.034.2-.038.32l-6.321 6.025 6.495 8.076c.086.104.1.208.073.3z"/>
  </svg>
);
const HackerRankLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#00EA64" style={{ flexShrink: 0 }}>
    <path d="M12 0c1.285 0 9.75 4.886 10.392 6 .645 1.115.645 11.885 0 13-.642 1.114-9.107 6-10.392 6-1.284 0-9.75-4.886-10.392-6C.963 17.885.963 7.115 1.608 6 2.25 4.886 10.715 0 12 0z"/>
  </svg>
);
const CodingNinjaLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F97316" style={{ flexShrink: 0 }}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 14.5v-9l7 4.5-7 4.5z"/>
  </svg>
);
const GeeksForGeeksLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#2F8D46" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);
const CodeStudioLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F97316" style={{ flexShrink: 0 }}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const SKILL_OPTIONS = [
  { id: 'sk-001', name: 'JavaScript', category: 'Language' },
  { id: 'sk-002', name: 'Python', category: 'Language' },
  { id: 'sk-003', name: 'Java', category: 'Language' },
  { id: 'sk-004', name: 'TypeScript', category: 'Language' },
  { id: 'sk-005', name: 'C / C++', category: 'Language' },
  { id: 'sk-006', name: 'Golang', category: 'Language' },
  { id: 'sk-007', name: 'Rust', category: 'Language' },
  { id: 'sk-008', name: 'SQL', category: 'Language' },
  { id: 'sk-013', name: 'React', category: 'Frontend' },
  { id: 'sk-014', name: 'React Native', category: 'Frontend' },
  { id: 'sk-015', name: 'Next.js', category: 'Frontend' },
  { id: 'sk-019', name: 'Tailwind CSS', category: 'Frontend' },
  { id: 'sk-021', name: 'AngularJS', category: 'Frontend' },
  { id: 'sk-022', name: 'Redux', category: 'Frontend' },
  { id: 'sk-023', name: 'Flutter', category: 'Mobile' },
  { id: 'sk-050', name: 'Android Dev', category: 'Mobile' },
  { id: 'sk-051', name: 'iOS Dev', category: 'Mobile' },
  { id: 'sk-024', name: 'Node.js', category: 'Backend' },
  { id: 'sk-025', name: 'Express.js', category: 'Backend' },
  { id: 'sk-027', name: 'Django', category: 'Backend' },
  { id: 'sk-028', name: 'Flask', category: 'Backend' },
  { id: 'sk-029', name: 'FastAPI', category: 'Backend' },
  { id: 'sk-031', name: 'REST API', category: 'Backend' },
  { id: 'sk-032', name: 'GraphQL', category: 'Backend' },
  { id: 'sk-035', name: 'MySQL', category: 'Database' },
  { id: 'sk-036', name: 'PostgreSQL', category: 'Database' },
  { id: 'sk-037', name: 'MongoDB', category: 'Database' },
  { id: 'sk-038', name: 'Firebase', category: 'Database' },
  { id: 'sk-039', name: 'Redis', category: 'Database' },
  { id: 'sk-041', name: 'Machine Learning', category: 'Data Science' },
  { id: 'sk-043', name: 'Data Analysis', category: 'Data Science' },
  { id: 'sk-045', name: 'TensorFlow', category: 'Data Science' },
  { id: 'sk-046', name: 'PyTorch', category: 'Data Science' },
  { id: 'sk-047', name: 'Pandas', category: 'Data Science' },
  { id: 'sk-053', name: 'Docker', category: 'DevOps' },
  { id: 'sk-055', name: 'Linux', category: 'DevOps' },
  { id: 'sk-056', name: 'AWS', category: 'DevOps' },
  { id: 'sk-057', name: 'CI/CD', category: 'DevOps' },
  { id: 'sk-054', name: 'Git', category: 'Tools' },
  { id: 'sk-070', name: 'Figma', category: 'Design' },
  { id: 'sk-072', name: 'SEO', category: 'Marketing' },
  { id: 'sk-064', name: 'Ethical Hacking', category: 'Security' },
  { id: 'sk-066', name: 'Embedded Systems', category: 'Embedded' },
  { id: 'sk-075', name: 'Blockchain', category: 'Emerging' },
  { id: 'sk-079', name: 'Prompt Engineering', category: 'Emerging' },
  { id: 'sk-080', name: 'LangChain', category: 'Emerging' },
  { id: 'sk-081', name: 'Shopify', category: 'E-commerce' },
  { id: 'sk-082', name: 'Amazon Seller', category: 'E-commerce' },
  { id: 'sk-083', name: 'WooCommerce', category: 'E-commerce' },
  { id: 'sk-084', name: 'Product Listing', category: 'E-commerce' },
  { id: 'sk-085', name: 'Email Marketing', category: 'Marketing' },
  { id: 'sk-086', name: 'Social Media Marketing', category: 'Marketing' },
  { id: 'sk-087', name: 'Google Ads', category: 'Marketing' },
  { id: 'sk-088', name: 'Meta Ads', category: 'Marketing' },
  { id: 'sk-089', name: 'Competitor Research', category: 'Marketing' },
  { id: 'sk-090', name: 'Content Writing', category: 'Marketing' },
  { id: 'sk-091', name: 'Google Analytics', category: 'Analytics' },
  { id: 'sk-092', name: 'Sales Analysis', category: 'Analytics' },
  { id: 'sk-093', name: 'Excel / Google Sheets', category: 'Tools' },
  { id: 'sk-094', name: 'Google Workspace', category: 'Tools' },
  { id: 'sk-095', name: 'MS Office', category: 'Tools' },
  { id: 'sk-096', name: 'Canva', category: 'Design' },
  { id: 'sk-097', name: 'Scikit-learn', category: 'Data Science' },
  { id: 'sk-098', name: 'Jupyter Notebook', category: 'Tools' },
  { id: 'sk-099', name: 'Data Science', category: 'Data Science' },
  { id: 'sk-100', name: 'NLP', category: 'Data Science' },
  { id: 'sk-101', name: 'Customer Service', category: 'Operations' },
  { id: 'sk-102', name: 'Operations Management', category: 'Operations' },
  { id: 'sk-103', name: 'Inventory Management', category: 'Operations' },
];
const SKILL_CATEGORIES = [...new Set(SKILL_OPTIONS.map(s => s.category))];
const ROLE_OPTIONS = [
  'Full Stack Developer', 'Backend Developer', 'Frontend Developer',
  'Mobile Developer', 'DevOps Engineer', 'Data Analyst',
  'ML Engineer', 'UI/UX Designer', 'Security / Pen Tester',
  'Embedded Systems Engineer', 'QA / Testing Engineer',
  'E-commerce Executive', 'Digital Marketing Intern',
];
const LEVEL_LABELS = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];
// Step labels match the brutalist reference exactly: Basics, Signals, Evidence,
// Authorization, History, Preferences (rendered as `01·BASICS` under bar)
const STEPS = [
  { num: 1, label: 'Basics' },
  { num: 2, label: 'Signals' },
  { num: 3, label: 'Evidence' },
  { num: 4, label: 'Authorization' },
  { num: 5, label: 'History' },
  { num: 6, label: 'Preferences' },
];

// ─── StepHeader: pixel-dot blink + kicker label + serif title + sub ───────────
function StepHeader({ label, title, sub }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span className="hunt-pixel-dot hunt-blink" />
        <span className="hunt-kicker hunt-kicker-ink">{label}</span>
      </div>
      <h2 className="hunt-display-serif" style={{
        fontSize: 'clamp(36px, 5vw, 44px)',
        lineHeight: 0.96, marginBottom: 14, letterSpacing: '-0.02em',
      }}>
        {title}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-mid)', maxWidth: 460, lineHeight: 1.55 }}>
        {sub}
      </p>
    </div>
  );
}

// ─── FieldLabel — blue * for required, red "— important" for warn ─────────────
function FieldLabel({ children, required, warn }) {
  return (
    <label className="hunt-kicker" style={{
      display: 'flex', alignItems: 'center', gap: 6,
      marginBottom: 8, color: 'var(--text)',
    }}>
      {children}
      {required && <span style={{ color: 'var(--blue)' }}>*</span>}
      {warn && (
        <span style={{
          color: 'var(--red)',
          textTransform: 'none',
          letterSpacing: 0,
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
        }}>
          — important
        </span>
      )}
    </label>
  );
}

// ─── SectionHead — kicker + horizontal rule ───────────────────────────────────
function SectionHead({ label, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 16, marginTop: 4,
    }}>
      <span className="hunt-kicker" style={{ color: 'var(--text)' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--line-mid)' }} />
      {right}
    </div>
  );
}

// ─── StepProgress — square ticks all visible, hatched track + filled bar ──────
function StepProgress({ currentStep, totalSteps, steps, onGoto }) {
  const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;
  return (
    <div>
      {/* Top: kicker label + fraction */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <span className="hunt-kicker hunt-kicker-ink">
          Step {String(currentStep).padStart(2, '0')} · {steps[currentStep - 1]?.label}
        </span>
        <span className="hunt-kicker hunt-mono">
          {String(currentStep).padStart(2, '0')}{' '}
          <span style={{ opacity: 0.4 }}>/</span>{' '}
          {String(totalSteps).padStart(2, '0')}
        </span>
      </div>

      {/* Track + ticks */}
      <div style={{ position: 'relative', height: 14 }}>
        {/* Hatched (dashed) base track */}
        <div className="hunt-hatch" style={{
          position: 'absolute', top: 6, left: 0, right: 0, height: 2,
        }} />
        {/* Filled blue */}
        <div style={{
          position: 'absolute', top: 6, left: 0, height: 2,
          width: `${pct}%`, background: 'var(--blue)',
          transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
        }} />
        {/* Square ticks (all clickable for done steps) */}
        {steps.map(s => {
          const tickPct = ((s.num - 1) / (totalSteps - 1)) * 100;
          const done = currentStep > s.num;
          const active = currentStep === s.num;
          return (
            <button
              key={s.num}
              onClick={() => onGoto && onGoto(s.num)}
              title={`Step ${s.num} — ${s.label}`}
              style={{
                position: 'absolute', top: '50%', left: `${tickPct}%`,
                transform: 'translate(-50%,-50%)',
                width: active ? 14 : 10, height: active ? 14 : 10,
                background: active ? 'var(--blue)' : done ? 'var(--ink)' : 'var(--bg-card)',
                border: '1.5px solid var(--ink)',
                cursor: done ? 'pointer' : 'default',
                padding: 0, zIndex: 2,
                imageRendering: 'pixelated',
              }}
            />
          );
        })}
      </div>

      {/* All step labels under bar — `01·BASICS`, `02·SIGNALS`, … */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        {steps.map(s => {
          const done = currentStep > s.num;
          const active = currentStep === s.num;
          return (
            <span key={s.num} className="hunt-kicker" style={{
              color: active ? 'var(--ink)' : done ? 'var(--text-mid)' : 'var(--text-faint)',
              fontWeight: active ? 600 : 400,
              fontSize: 9.5,
            }}>
              {String(s.num).padStart(2, '0')}·{s.label.toUpperCase()}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentOnboarding() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [githubImporting, setGithubImporting] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [activeCategory, setActiveCategory] = useState(SKILL_CATEGORIES[0]);
  const [extraLinks, setExtraLinks] = useState(['']);
  // Which platform profile rows are currently shown (user can remove rows)
  const ALL_PROFILES = ['leetcodeUsername','codechefUsername','codeforcesUsername','kaggleUsername','hackerrankUsername','codingninjaUsername','gfgUsername','codestudioUsername'];
  const [visibleProfiles, setVisibleProfiles] = useState(ALL_PROFILES);
  const [step2Attempted, setStep2Attempted] = useState(false);
  const [workAuthError, setWorkAuthError] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showSubmitted, setShowSubmitted] = useState(false);
  // Tracks if the profile has already been created in Supabase. Once true,
  // pressing "Complete profile" again (after Edit profile) just navigates,
  // it does NOT re-insert (which would fail with a duplicate-email error).
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '',
    linkedinUrl: '', githubUrl: '', portfolioUrl: '',
    leetcodeUsername: '', codechefUsername: '', codeforcesUsername: '', kaggleUsername: '',
    hackerrankUsername: '', codingninjaUsername: '', gfgUsername: '', codestudioUsername: '',
    skills: [], projects: [],
    dob: '', state: '', city: '', pincode: '',
    workFromDifferentCountry: false, confirmWorkAuth: false, confirmStayInIndia: false,
    signatureName: '', signatureText: '',
    education: [{ school: '', degree: '', major: '', gpa: '', startYear: '', endYear: '' }],
    workExperience: [{ company: '', role: '', startYear: '', endYear: '', city: '', description: '' }],
    preferredRoles: [], availability: 'Immediate', workPreference: 'remote',
    resume: null, noResume: false,
  });
  const [newProject, setNewProject] = useState({ title: '', description: '', techStack: '', projectUrl: '', githubUrl: '' });

  useEffect(() => { applyTokens(theme); }, [theme]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentStep]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const hi = useCallback((field, value) => setFormData(prev => ({ ...prev, [field]: value })), []);

  const handleGitHubImport = async () => {
    if (!githubUsername.trim() || !isValidGitHubUsername(githubUsername)) { alert('Enter a valid GitHub username'); return; }
    setGithubImporting(true);
    try {
      const result = await importFromGitHub(githubUsername);
      if (!result.success) { alert(result.error || 'Import failed'); return; }
      const { data } = result;
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || data.name,
        skills: [...prev.skills, ...data.skills.map((s, i) => ({ ...s, id: Date.now() + i }))],
        projects: [...prev.projects, ...data.projects.map((p, i) => ({ ...p, id: Date.now() + i }))],
        githubUrl: prev.githubUrl || data.githubUrl,
      }));
      setGithubUsername('');
    } catch (e) { alert('Error: ' + e.message); }
    finally { setGithubImporting(false); }
  };

  const addSkill = useCallback((skill) => {
    setFormData(prev => {
      if (prev.skills.find(s => s.name === skill.name)) return prev;
      return { ...prev, skills: [...prev.skills, { id: Date.now(), name: skill.name, level: 3, category: skill.category }] };
    });
  }, []);
  const removeSkill = useCallback((id) => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) })), []);
  const updateLevel = useCallback((id, level) => setFormData(prev => ({ ...prev, skills: prev.skills.map(s => s.id === id ? { ...s, level } : s) })), []);

  const addProject = () => {
    if (!newProject.title || !newProject.techStack) return;
    setFormData(prev => ({ ...prev, projects: [...prev.projects, { ...newProject, techStack: newProject.techStack.split(',').map(t => t.trim()), id: Date.now() }] }));
    setNewProject({ title: '', description: '', techStack: '', projectUrl: '', githubUrl: '' });
  };
  const removeProject = (id) => setFormData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));

  const updateEducation = (idx, field, value) => { const u = [...formData.education]; u[idx] = { ...u[idx], [field]: value }; hi('education', u); };
  const addEducation = () => hi('education', [...formData.education, { school: '', degree: '', major: '', gpa: '', startYear: '', endYear: '' }]);
  const removeEducation = (idx) => hi('education', formData.education.filter((_, i) => i !== idx));

  const updateWorkExp = (idx, field, value) => { const u = [...formData.workExperience]; u[idx] = { ...u[idx], [field]: value }; hi('workExperience', u); };
  const addWorkExp = () => hi('workExperience', [...formData.workExperience, { company: '', role: '', startYear: '', endYear: '', city: '', description: '' }]);
  const removeWorkExp = (idx) => hi('workExperience', formData.workExperience.filter((_, i) => i !== idx));

  const toggleRole = (role) => setFormData(prev => ({
    ...prev, preferredRoles: prev.preferredRoles.includes(role) ? prev.preferredRoles.filter(r => r !== role) : [...prev.preferredRoles, role],
  }));

  const addExtraLink = useCallback(() => setExtraLinks(prev => [...prev, '']), []);
  const updateExtraLink = useCallback((idx, val) => setExtraLinks(prev => { const u = [...prev]; u[idx] = val; return u; }), []);
  const removeExtraLink = useCallback((idx) => setExtraLinks(prev => prev.filter((_, i) => i !== idx)), []);

  const handleNext = () => {
    if (currentStep === 1 && !formData.fullName) { alert('Please enter your name'); return; }
    if (currentStep === 2) setStep2Attempted(true);
    if (currentStep === 4 && (!formData.confirmWorkAuth || !formData.confirmStayInIndia)) {
      setWorkAuthError(true); return;
    }
    setWorkAuthError(false);
    if (currentStep < STEPS.length) setCurrentStep(s => s + 1);
  };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') hi('resume', file);
  };

  const calculateCompleteness = () => {
    let s = 0;
    if (formData.fullName) s += 10; if (formData.email) s += 5; if (formData.phone) s += 5;
    if (formData.linkedinUrl) s += 8; if (formData.githubUrl) s += 7;
    if (formData.skills.length >= 3) s += 20; if (formData.projects.length >= 1) s += 15;
    if (formData.preferredRoles.length > 0) s += 10;
    if (formData.education[0]?.school) s += 10;
    if (formData.resume) s += 5; if (formData.portfolioUrl) s += 5;
    return Math.min(s, 100);
  };

  const handleSubmit = async () => {
    // If the profile was already created (user clicked Edit profile then came
    // back), don't try to insert again — Supabase has a unique constraint on
    // email and would reject it with "duplicate key value violates unique
    // constraint students_email_key". Just show the completion screen again.
    if (hasSubmitted) {
      setShowSubmitted(true);
      return;
    }
    setIsSubmitting(true);
    try {
      let resumeUrl = null;
      if (formData.resume) resumeUrl = await uploadResume(formData.resume);
      await createStudentProfile({
        full_name: formData.fullName, email: formData.email, phone: formData.phone,
        skills: formData.skills, projects: formData.projects, preferred_roles: formData.preferredRoles,
        availability: formData.availability, work_preference: formData.workPreference,
        github_url: formData.githubUrl, linkedin_url: formData.linkedinUrl, portfolio_url: formData.portfolioUrl,
        education: formData.education, work_experience: formData.workExperience,
        work_auth: { dob: formData.dob, state: formData.state, city: formData.city, pincode: formData.pincode, confirmed: formData.confirmWorkAuth },
        resume_url: resumeUrl, profile_completeness: calculateCompleteness(),
      });
      setHasSubmitted(true);
      setShowSubmitted(true);
    } catch (e) {
      // If the error indicates a duplicate (email already exists in DB) we
      // treat it as success — the profile is already there from a previous
      // run. This handles edge cases like a refresh after a successful submit.
      const msg = (e && e.message) || '';
      if (/duplicate key|unique constraint|students_email_key|already exists/i.test(msg)) {
        setHasSubmitted(true);
        setShowSubmitted(true);
      } else {
        alert('Failed: ' + msg);
      }
    }
    finally { setIsSubmitting(false); }
  };
  const handleStartSwiping = () => {
    const pendingSlug = localStorage.getItem('apply_after_login');
    if (pendingSlug) { localStorage.removeItem('apply_after_login'); navigate(`/apply/${pendingSlug}`); }
    else navigate('/swipe');
  };

  const completeness = calculateCompleteness();
  const catSkills = SKILL_OPTIONS.filter(s => s.category === activeCategory);
  const showLinkedinWarn = step2Attempted && !formData.linkedinUrl;
  const showGithubWarn = step2Attempted && !formData.githubUrl;

  // ── Step renderers — kept inside parent so they share state via closure ──

  const Step1 = () => (
    <div>
      <StepHeader
        label="01 — Basics"
        title={<>Tell us who <em className="hunt-serif" style={{ fontStyle: 'italic' }}>you are.</em></>}
        sub="We only show recruiters what matters — your work, not your college name."
      />
      <SectionHead label="Identity" />
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <FieldLabel required>Full Name</FieldLabel>
          <input className="hunt-input" value={formData.fullName} onChange={e => hi('fullName', e.target.value)} placeholder="Priya Sharma" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <FieldLabel required>Email</FieldLabel>
            <input className="hunt-input" type="email" value={formData.email} onChange={e => hi('email', e.target.value)} placeholder="priya@email.com" />
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
            <input className="hunt-input" type="tel" value={formData.phone} onChange={e => hi('phone', e.target.value)} placeholder="+91 98765 43210" />
          </div>
        </div>
      </div>
      {/* Privacy note */}
      <div style={{
        marginTop: 28, padding: 14,
        border: '1px solid var(--border-mid)', background: 'var(--bg-subtle)',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span className="hunt-pixel-dot" style={{ marginTop: 6 }} />
          <div>
            <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 6 }}>Privacy Note</p>
            <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.55 }}>
              Your email is never shared publicly. Recruiters see your work and signals first — contact info unlocks only after you swipe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const Step2 = () => {
    const PROFILE_META = {
      leetcodeUsername:    { label: 'LeetCode',     placeholder: 'LeetCode username',    Logo: LeetCodeLogo },
      codechefUsername:    { label: 'CodeChef',     placeholder: 'CodeChef username',    Logo: CodeChefLogo },
      codeforcesUsername:  { label: 'Codeforces',   placeholder: 'Codeforces username',  Logo: CodeForcesLogo },
      kaggleUsername:      { label: 'Kaggle',       placeholder: 'Kaggle username',      Logo: KaggleLogo },
      hackerrankUsername:  { label: 'HackerRank',   placeholder: 'HackerRank username',  Logo: HackerRankLogo },
      codingninjaUsername: { label: 'Coding Ninjas', placeholder: 'Coding Ninjas username', Logo: CodingNinjaLogo },
      gfgUsername:         { label: 'GeeksForGeeks', placeholder: 'GeeksForGeeks username', Logo: GeeksForGeeksLogo },
      codestudioUsername:  { label: 'CodeStudio',   placeholder: 'CodeStudio username',  Logo: CodeStudioLogo },
    };
    return (
      <div>
        <StepHeader
          label="02 — Signals"
          title={<>Your online <em style={{ fontStyle: 'italic' }}>presence.</em></>}
          sub="LinkedIn and GitHub are essential — they're how recruiters verify real work."
        />
        <SectionHead label="Primary Profiles" />
        <div style={{ display: 'grid', gap: 16, marginBottom: 28 }}>
          <div>
            <FieldLabel required warn={showLinkedinWarn}>
              <LinkedInLogo /> LinkedIn URL
            </FieldLabel>
            <input
              className="hunt-input" type="url"
              value={formData.linkedinUrl} onChange={e => hi('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/in/…"
              style={showLinkedinWarn ? { borderColor: 'var(--red)', background: 'var(--red-tint)' } : {}}
            />
            {showLinkedinWarn && (
              <p style={{ marginTop: 6, fontSize: 11.5, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertCircle style={{ width: 12, height: 12 }} /> Recruiters check this first. Add it to raise match score.
              </p>
            )}
          </div>
          <div>
            <FieldLabel required warn={showGithubWarn}>
              <GitHubLogo theme={theme} /> GitHub URL
            </FieldLabel>
            <input
              className="hunt-input" type="url"
              value={formData.githubUrl} onChange={e => hi('githubUrl', e.target.value)}
              placeholder="https://github.com/yourname"
              style={showGithubWarn ? { borderColor: 'var(--red)', background: 'var(--red-tint)' } : {}}
            />
            {showGithubWarn && (
              <p style={{ marginTop: 6, fontSize: 11.5, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertCircle style={{ width: 12, height: 12 }} /> Your GitHub shows real proof of work. Don't skip this.
              </p>
            )}
          </div>
          <div>
            <FieldLabel>Portfolio</FieldLabel>
            <input className="hunt-input" type="url" value={formData.portfolioUrl}
              onChange={e => hi('portfolioUrl', e.target.value)} placeholder="https://yourportfolio.com" />
          </div>
          <div>
            <FieldLabel>Other Links</FieldLabel>
            <div style={{ display: 'grid', gap: 8 }}>
              {extraLinks.map((link, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8 }}>
                  <input className="hunt-input" type="url" value={link} onChange={e => updateExtraLink(idx, e.target.value)} placeholder="https://example.com" />
                  {extraLinks.length > 1 && (
                    <button onClick={() => removeExtraLink(idx)} className="hunt-btn hunt-btn-ghost hunt-btn-sm" style={{ padding: '0 12px' }}>
                      <X style={{ width: 12, height: 12 }} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addExtraLink} className="hunt-mono" style={{
                fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--text-dim)', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: 500,
              }}>
                <Plus style={{ width: 12, height: 12 }} /> Add link
              </button>
            </div>
          </div>
        </div>

        <SectionHead label="Coding Platforms" right={
          <span className="hunt-kicker" style={{ fontSize: 9.5 }}>optional — shows proof of work</span>
        } />
        <div style={{ display: 'grid', gap: 10 }}>
          {visibleProfiles.map(field => {
            const meta = PROFILE_META[field];
            if (!meta) return null;
            const { label, placeholder, Logo } = meta;
            return (
              <div key={field} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                border: '1px solid var(--border-mid)',
                background: 'var(--bg-card)',
              }}>
                <Logo />
                <span className="hunt-kicker" style={{ width: 110, fontSize: 10, color: 'var(--text-mid)' }}>
                  {label}
                </span>
                <input
                  type="text" value={formData[field]}
                  onChange={e => hi(field, e.target.value)}
                  placeholder={placeholder}
                  style={{
                    flex: 1, background: 'transparent', outline: 'none',
                    fontSize: 13, color: 'var(--text)', border: 'none',
                  }}
                />
                <button
                  onClick={() => { hi(field, ''); setVisibleProfiles(prev => prev.filter(f => f !== field)); }}
                  style={{ color: 'var(--text-dim)', flexShrink: 0, padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}
                  title="Remove"
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            );
          })}
          {visibleProfiles.length === 0 && (
            <p className="hunt-mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              All platform rows removed.
            </p>
          )}
        </div>
      </div>
    );
  };

  const Step3 = () => (
    <div>
      <StepHeader
        label="03 — Evidence"
        title={<>What can you <em style={{ fontStyle: 'italic' }}>build & show?</em></>}
        sub="Add skills and the projects that prove them. This is your signal."
      />
      {step2Attempted && (showLinkedinWarn || showGithubWarn) && (
        <div style={{
          marginBottom: 24, padding: 14,
          border: '1px solid var(--red)', background: 'var(--red-tint)',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--red)', marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
              {showLinkedinWarn && showGithubWarn ? 'LinkedIn and GitHub missing' : showLinkedinWarn ? 'LinkedIn missing' : 'GitHub missing'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              Top recruiter signal.{' '}
              <button onClick={() => setCurrentStep(2)} style={{ color: 'var(--text-mid)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12 }}>
                Go back & add.
              </button>
            </p>
          </div>
        </div>
      )}
      <SectionHead label="Import from GitHub" right={
        <span className="hunt-kicker" style={{ fontSize: 9.5 }}>auto-fill skills + projects</span>
      } />
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <input className="hunt-input" type="text" value={githubUsername} onChange={e => setGithubUsername(e.target.value)} placeholder="github-username" />
        <button onClick={handleGitHubImport} disabled={githubImporting} className="hunt-btn hunt-btn-dark">
          {githubImporting ? <><Loader className="hunt-spin" style={{ width: 13, height: 13 }} /> Importing…</> : 'Import'}
        </button>
      </div>

      <SectionHead label="Skills" right={
        <span className="hunt-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
          {String(formData.skills.length).padStart(2, '0')} selected
        </span>
      } />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {SKILL_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className="hunt-mono" style={{
            padding: '5px 10px',
            border: '1px solid ' + (activeCategory === cat ? 'var(--ink)' : 'var(--border-mid)'),
            background: activeCategory === cat ? 'var(--ink)' : 'transparent',
            color: activeCategory === cat ? 'var(--cream)' : 'var(--text-mid)',
            fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            {cat}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
        {catSkills.map(skill => {
          const added = formData.skills.some(s => s.name === skill.name);
          return (
            <button key={skill.id} onClick={() => addSkill(skill)} style={{
              padding: '6px 10px', fontSize: 12,
              border: '1px solid ' + (added ? 'var(--blue)' : 'var(--border-mid)'),
              background: added ? 'var(--blue-tint)' : 'transparent',
              color: added ? 'var(--blue-deep)' : 'var(--text-mid)',
              cursor: added ? 'default' : 'pointer',
            }}>
              {skill.name}{added && ' ✓'}
            </button>
          );
        })}
      </div>
      {formData.skills.length > 0 && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 28 }}>
          {formData.skills.map(skill => (
            <div key={skill.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              border: '1px solid var(--border-mid)', background: 'var(--bg-subtle)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{skill.name}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(lv => (
                  <button key={lv} onClick={() => updateLevel(skill.id, lv)} className="hunt-mono" style={{
                    width: 26, height: 26, fontSize: 11, fontWeight: 600,
                    background: skill.level >= lv ? 'var(--blue)' : 'var(--bg-card)',
                    color: skill.level >= lv ? '#fff' : 'var(--text-dim)',
                    border: skill.level >= lv ? '1px solid var(--blue)' : '1px solid var(--border-mid)',
                    cursor: 'pointer',
                  }}>{lv}</button>
                ))}
              </div>
              <span className="hunt-mono" style={{ fontSize: 10, color: 'var(--text-dim)', width: 80, textAlign: 'right', letterSpacing: '0.04em' }}>
                {LEVEL_LABELS[skill.level]}
              </span>
              <button onClick={() => removeSkill(skill.id)} style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ))}
        </div>
      )}

      <SectionHead label="Projects" right={
        <span className="hunt-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
          {String(formData.projects.length).padStart(2, '0')} added
        </span>
      } />
      <div style={{ padding: 16, border: '1px solid var(--border-mid)', background: 'var(--bg-subtle)', display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <FieldLabel required>Project title</FieldLabel>
            <input className="hunt-input" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} placeholder="E-commerce Dashboard" />
          </div>
          <div>
            <FieldLabel required>Tech stack</FieldLabel>
            <input className="hunt-input" value={newProject.techStack} onChange={e => setNewProject({ ...newProject, techStack: e.target.value })} placeholder="React, Node.js, PostgreSQL" />
          </div>
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea className="hunt-input" rows={2} value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} placeholder="What does it do?" style={{ resize: 'none' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <FieldLabel>Live URL</FieldLabel>
            <input className="hunt-input" type="url" value={newProject.projectUrl} onChange={e => setNewProject({ ...newProject, projectUrl: e.target.value })} placeholder="https://" />
          </div>
          <div>
            <FieldLabel>GitHub URL</FieldLabel>
            <input className="hunt-input" type="url" value={newProject.githubUrl} onChange={e => setNewProject({ ...newProject, githubUrl: e.target.value })} placeholder="https://github.com/…" />
          </div>
        </div>
        <button onClick={addProject} className="hunt-btn hunt-btn-dark" style={{ width: '100%' }}>
          <Plus style={{ width: 13, height: 13 }} /> Add project
        </button>
      </div>
      {formData.projects.length > 0 && (
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {formData.projects.map(p => (
            <div key={p.id} style={{ padding: 14, border: '1px solid var(--border-mid)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.title || p.name}</span>
                <button onClick={() => removeProject(p.id)} style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
              {p.description && <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>{p.description}</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {(Array.isArray(p.techStack) ? p.techStack : [p.techStack]).map((t, i) => (
                  <span key={i} className="hunt-chip" style={{ fontSize: 10, padding: '2px 6px' }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const Step4 = () => (
    <div>
      <StepHeader
        label="04 — Authorization"
        title={<>Your work <em style={{ fontStyle: 'italic' }}>eligibility.</em></>}
        sub="Ensure you meet local employment requirements. Accurate info helps recruiters move fast."
      />
      <SectionHead label="Personal" />
      <div style={{ marginBottom: 24 }}>
        <FieldLabel required>Date of Birth</FieldLabel>
        <input className="hunt-input" type="date" value={formData.dob} onChange={e => hi('dob', e.target.value)} style={{ maxWidth: 220 }} />
      </div>

      <SectionHead label="Location of Residence" right={
        <span className="hunt-kicker" style={{ fontSize: 9.5 }}>where you work from most of the year</span>
      } />
      <div style={{ display: 'grid', gap: 14, marginBottom: 18 }}>
        <div>
          <FieldLabel>Country</FieldLabel>
          <input className="hunt-input" value="India" disabled style={{ opacity: 0.6 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <FieldLabel required>State</FieldLabel>
            <select className="hunt-input" value={formData.state} onChange={e => hi('state', e.target.value)}>
              <option value="">Select</option>
              {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel required>City</FieldLabel>
            <input className="hunt-input" value={formData.city} onChange={e => hi('city', e.target.value)} placeholder="Mumbai" />
          </div>
          <div>
            <FieldLabel required>Pincode</FieldLabel>
            <input className="hunt-input" value={formData.pincode} onChange={e => hi('pincode', e.target.value)} placeholder="400001" />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={formData.workFromDifferentCountry}
            onChange={e => hi('workFromDifferentCountry', e.target.checked)}
            style={{ marginTop: 2, accentColor: 'var(--blue)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--text-mid)' }}>
            I will be physically working from a different country while performing services through HUNT.
          </span>
        </label>
      </div>

      <SectionHead label="Declaration" />
      {workAuthError && (
        <div style={{
          padding: 12, marginBottom: 12,
          border: '1px solid var(--red)', background: 'var(--red-tint)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertCircle style={{ width: 14, height: 14, color: 'var(--red)' }} />
          <p style={{ fontSize: 12.5, color: 'var(--red)' }}>Confirm both authorizations below to continue.</p>
        </div>
      )}
      <div style={{ display: 'grid', gap: 12 }}>
        <label style={{
          padding: 14,
          border: '1px solid ' + (workAuthError && !formData.confirmWorkAuth ? 'var(--red)' : 'var(--border-mid)'),
          display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
        }}>
          <input type="checkbox" checked={formData.confirmWorkAuth}
            onChange={e => { hi('confirmWorkAuth', e.target.checked); if (e.target.checked && formData.confirmStayInIndia) setWorkAuthError(false); }}
            style={{ marginTop: 2, accentColor: 'var(--blue)' }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
              I am legally authorized to work from India. <span style={{ color: 'var(--blue)' }}>*</span>
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.55 }}>
              You confirm all necessary permits and rights to work from your indicated country, and agree to hold HUNT harmless from liability arising from failure to maintain proper authorization.
            </p>
          </div>
        </label>
        <label style={{
          padding: 14,
          border: '1px solid ' + (workAuthError && !formData.confirmStayInIndia ? 'var(--red)' : 'var(--border-mid)'),
          display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
        }}>
          <input type="checkbox" checked={formData.confirmStayInIndia}
            onChange={e => { hi('confirmStayInIndia', e.target.checked); if (e.target.checked && formData.confirmWorkAuth) setWorkAuthError(false); }}
            style={{ marginTop: 2, accentColor: 'var(--blue)' }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
              I will notify HUNT in writing before any change in working country. <span style={{ color: 'var(--blue)' }}>*</span>
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.55 }}>
              You agree to work only from the specified country unless prior written notice is given, and to maintain proper work authorization for any future country.
            </p>
          </div>
        </label>
      </div>

      <div style={{ marginTop: 24 }}>
        <SectionHead label="Digital Signature" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <FieldLabel required>Full Name</FieldLabel>
            <input className="hunt-input" value={formData.signatureName} onChange={e => hi('signatureName', e.target.value)} placeholder={formData.fullName || 'Your name'} />
          </div>
          <div>
            <FieldLabel required>Signature</FieldLabel>
            <input className="hunt-input hunt-serif" style={{ fontStyle: 'italic', fontSize: 16 }}
              value={formData.signatureText} onChange={e => hi('signatureText', e.target.value)} placeholder="Priya Sharma" />
          </div>
          <div>
            <FieldLabel>Date</FieldLabel>
            <input className="hunt-input" value={new Date().toLocaleDateString('en-GB')} disabled style={{ opacity: 0.6 }} />
          </div>
        </div>
      </div>
    </div>
  );

  const Step5 = () => {
    const yearOptions = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
    return (
      <div>
        <StepHeader
          label="05 — History"
          title={<>Your education <em style={{ fontStyle: 'italic' }}>& experience.</em></>}
          sub="Review your details. Projects you added in the Skills step are attached automatically."
        />
        <SectionHead label="Education" right={
          <button onClick={addEducation} className="hunt-btn hunt-btn-ghost hunt-btn-sm">
            <Plus style={{ width: 11, height: 11 }} /> Add
          </button>
        } />
        <div style={{ display: 'grid', gap: 14 }}>
          {formData.education.map((edu, idx) => (
            <div key={idx} style={{ position: 'relative', padding: 14, border: '1px solid var(--border-mid)', background: 'var(--bg-subtle)' }}>
              <span className="hunt-mono" style={{
                position: 'absolute', top: 0, left: 0,
                background: 'var(--ink)', color: 'var(--cream)',
                padding: '2px 8px', fontSize: 10, letterSpacing: '0.08em',
              }}>{String(idx + 1).padStart(2, '0')}</span>
              {formData.education.length > 1 && (
                <button onClick={() => removeEducation(idx)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                <div><FieldLabel>School</FieldLabel><input className="hunt-input" value={edu.school} onChange={e => updateEducation(idx, 'school', e.target.value)} placeholder="VJTI Mumbai" /></div>
                <div><FieldLabel>Degree</FieldLabel><input className="hunt-input" value={edu.degree} onChange={e => updateEducation(idx, 'degree', e.target.value)} placeholder="B.Tech CS" /></div>
                <div><FieldLabel>Start Year</FieldLabel><select className="hunt-input" value={edu.startYear} onChange={e => updateEducation(idx, 'startYear', e.target.value)}><option value="">—</option>{yearOptions.map(y => <option key={y}>{y}</option>)}</select></div>
                <div><FieldLabel>End Year</FieldLabel><select className="hunt-input" value={edu.endYear} onChange={e => updateEducation(idx, 'endYear', e.target.value)}><option value="">—</option>{yearOptions.map(y => <option key={y}>{y}</option>)}</select></div>
                <div><FieldLabel>Major</FieldLabel><input className="hunt-input" value={edu.major} onChange={e => updateEducation(idx, 'major', e.target.value)} placeholder="Computer Science" /></div>
                <div><FieldLabel>GPA / CGPA</FieldLabel><input className="hunt-input" value={edu.gpa} onChange={e => updateEducation(idx, 'gpa', e.target.value)} placeholder="8.5 / 10" /></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <SectionHead label="Work Experience" right={
            <button onClick={addWorkExp} className="hunt-btn hunt-btn-ghost hunt-btn-sm">
              <Plus style={{ width: 11, height: 11 }} /> Add
            </button>
          } />
          <div style={{ display: 'grid', gap: 14 }}>
            {formData.workExperience.map((exp, idx) => (
              <div key={idx} style={{ position: 'relative', padding: 14, border: '1px solid var(--border-mid)', background: 'var(--bg-subtle)' }}>
                <span className="hunt-mono" style={{
                  position: 'absolute', top: 0, left: 0,
                  background: 'var(--ink)', color: 'var(--cream)',
                  padding: '2px 8px', fontSize: 10, letterSpacing: '0.08em',
                }}>{String(idx + 1).padStart(2, '0')}</span>
                {formData.workExperience.length > 1 && (
                  <button onClick={() => removeWorkExp(idx)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                  <div><FieldLabel>Company</FieldLabel><input className="hunt-input" value={exp.company} onChange={e => updateWorkExp(idx, 'company', e.target.value)} placeholder="Razorpay" /></div>
                  <div><FieldLabel>Role</FieldLabel><input className="hunt-input" value={exp.role} onChange={e => updateWorkExp(idx, 'role', e.target.value)} placeholder="Software Intern" /></div>
                  <div><FieldLabel>Start Year</FieldLabel><select className="hunt-input" value={exp.startYear} onChange={e => updateWorkExp(idx, 'startYear', e.target.value)}><option value="">—</option>{yearOptions.map(y => <option key={y}>{y}</option>)}</select></div>
                  <div><FieldLabel>End Year</FieldLabel><select className="hunt-input" value={exp.endYear} onChange={e => updateWorkExp(idx, 'endYear', e.target.value)}><option value="">—</option>{yearOptions.map(y => <option key={y}>{y}</option>)}</select></div>
                  <div style={{ gridColumn: 'span 2' }}><FieldLabel>City</FieldLabel><input className="hunt-input" value={exp.city} onChange={e => updateWorkExp(idx, 'city', e.target.value)} placeholder="Bangalore" /></div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <FieldLabel>Description</FieldLabel>
                  <textarea className="hunt-input" rows={3} value={exp.description}
                    onChange={e => updateWorkExp(idx, 'description', e.target.value)}
                    placeholder="Built REST APIs for payment gateway processing 10k+ transactions/day..."
                    style={{ resize: 'none' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Step6 = () => (
    <div>
      <StepHeader
        label="06 — Preferences"
        title={<>Almost there. <em style={{ fontStyle: 'italic' }}>Set preferences.</em></>}
        sub="What kind of roles and setup works best for you?"
      />
      <SectionHead label="Preferred Roles" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
        {ROLE_OPTIONS.map(role => {
          const sel = formData.preferredRoles.includes(role);
          return (
            <button key={role} onClick={() => toggleRole(role)} style={{
              padding: '10px 14px', textAlign: 'left', fontSize: 13,
              border: '1px solid ' + (sel ? 'var(--blue)' : 'var(--border-mid)'),
              background: sel ? 'var(--blue-tint)' : 'transparent',
              color: sel ? 'var(--blue-deep)' : 'var(--text-mid)',
              fontWeight: sel ? 500 : 400, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {sel && <span style={{ width: 8, height: 8, background: 'var(--blue)' }} />}
              {role}
            </button>
          );
        })}
      </div>

      <SectionHead label="Availability & Setup" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div>
          <FieldLabel>Availability</FieldLabel>
          <select className="hunt-input" value={formData.availability} onChange={e => hi('availability', e.target.value)}>
            <option value="Immediate">Immediate</option>
            <option value="After exams">After exams</option>
            <option value="Next semester">Next semester</option>
          </select>
        </div>
        <div>
          <FieldLabel>Work preference</FieldLabel>
          <select className="hunt-input" value={formData.workPreference} onChange={e => hi('workPreference', e.target.value)}>
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="any">Any</option>
          </select>
        </div>
      </div>

      <SectionHead label="Resume" right={
        <span className="hunt-kicker" style={{ fontSize: 9.5 }}>pdf · max 3mb</span>
      } />
      {/* Tip */}
      <div className="hunt-mono" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 10px', marginBottom: 14,
        border: '1px solid var(--blue)', background: 'var(--blue-tint)',
        color: 'var(--blue-deep)',
        fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        <span style={{ width: 5, height: 5, background: 'var(--blue)' }} />
        Tip — Recruiters reach out 3× more when a resume is attached
      </div>
      {!formData.resume ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          style={{
            cursor: 'pointer',
            border: '2px dashed ' + (dragOver ? 'var(--blue)' : 'var(--border-mid)'),
            background: dragOver ? 'var(--blue-tint)' : 'var(--bg-subtle)',
            padding: '40px 20px', textAlign: 'center',
            transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: 48, height: 48,
            background: 'var(--ink)', color: 'var(--cream)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Upload style={{ width: 18, height: 18 }} />
          </div>
          <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 6 }}>
            Drop your resume here
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--text-mid)' }}>
            or <span style={{ color: 'var(--blue)', textDecoration: 'underline' }}>browse files</span> on your computer
          </p>
          <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.[0]) hi('resume', e.target.files[0]); }} />
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px',
          border: '1px solid var(--blue)', background: 'var(--blue-tint)',
        }}>
          <CheckCircle2 style={{ width: 18, height: 18, color: 'var(--blue)', flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{formData.resume.name}</span>
          <button onClick={() => hi('resume', null)} style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, cursor: 'pointer' }}>
        <input type="checkbox" checked={formData.noResume} onChange={e => hi('noResume', e.target.checked)} style={{ accentColor: 'var(--blue)' }} />
        <span style={{ fontSize: 12.5, color: 'var(--text-mid)' }}>I don't have a resume yet.</span>
      </label>

      {/* Profile completeness preview */}
      <div style={{
        marginTop: 24, padding: 16,
        border: '1px solid var(--border-mid)', background: 'var(--bg-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="hunt-kicker hunt-kicker-ink">Profile Completeness</span>
          <span className="hunt-display-serif" style={{ fontSize: 28, color: 'var(--blue)', lineHeight: 1 }}>
            {completeness}<span style={{ fontSize: 14 }}>%</span>
          </span>
        </div>
        <div style={{ height: 4, background: 'var(--border-mid)', position: 'relative', marginBottom: 10 }}>
          <div style={{ position: 'absolute', inset: 0, width: `${completeness}%`, background: 'var(--blue)', transition: 'width 0.5s' }} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-mid)' }}>
          {completeness >= 80 ? 'Strong profile — ready to start swiping.' : 'Add more info to boost your match score.'}
        </p>
      </div>
    </div>
  );

  // Call the step renderer as a plain function, NOT as a component (`<Step1/>`).
  // Defining the steps inside the parent then mounting them via JSX makes React
  // treat each keystroke's re-render as a brand-new component → unmounts the
  // input → focus is lost after every character. Calling as a function returns
  // the same JSX inline, so React reconciles normally and inputs keep focus.
  const stepRenderers = [Step1, Step2, Step3, Step4, Step5, Step6];
  const renderCurrentStep = stepRenderers[currentStep - 1];

  // ── Once submitted, show the brutalist completion screen ──
  if (showSubmitted) {
    return (
      <SubmittedView
        formData={formData}
        completeness={completeness}
        onStartSwiping={handleStartSwiping}
        onEditProfile={() => setShowSubmitted(false)}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* ── Top Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
        borderBottom: '1px solid var(--border-mid)',
        background: 'var(--bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PixelMark size={18} />
          <span className="hunt-kicker hunt-kicker-ink" style={{ fontSize: 11, letterSpacing: '0.18em' }}>HUNT</span>
          <span style={{ height: 16, width: 1, background: 'var(--border-mid)' }} />
          <span className="hunt-kicker">Candidate Profile Setup</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="hunt-kicker" style={{ fontSize: 9.5 }}>v2.1 · beta</span>
          <button onClick={toggleTheme} className="hunt-btn hunt-btn-ghost hunt-btn-sm"
            style={{ width: 32, height: 32, padding: 0 }}>
            {theme === 'light' ? <Moon style={{ width: 13, height: 13 }} /> : <Sun style={{ width: 13, height: 13 }} />}
          </button>
        </div>
      </nav>

      {/* ── Progress sticky ── */}
      <div style={{
        position: 'sticky', top: 57, zIndex: 40,
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        padding: '14px 32px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <StepProgress
            currentStep={currentStep}
            totalSteps={STEPS.length}
            steps={STEPS}
            onGoto={(n) => n < currentStep && setCurrentStep(n)}
          />
        </div>
      </div>

      {/* ── Brutalist marquee band ── */}
      <div style={{
        borderBottom: '1px solid var(--border-mid)',
        background: 'var(--ink)', color: 'var(--cream)',
        padding: '8px 0', overflow: 'hidden',
      }}>
        <div className="hunt-marquee-track hunt-mono" style={{
          fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>
          {Array(6).fill(0).map((_, i) => (
            <span key={i}>
              <span>Building HUNT profile</span>
              <span style={{ color: 'var(--blue)' }}>●</span>
              <span>Projects &gt; Pedigree</span>
              <span style={{ color: 'var(--blue)' }}>●</span>
              <span>Show don't tell</span>
              <span style={{ color: 'var(--blue)' }}>●</span>
              <span>Evidence over résumés</span>
              <span style={{ color: 'var(--blue)' }}>●</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Body: two-column ── */}
      <div className="hunt-onb-grid" style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '40px 32px 80px',
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px',
        gap: 32,
      }}>
        <div>
          <div className="hunt-card hunt-corner-tick" style={{ padding: '36px 40px' }}>
            <span className="hunt-tick-tr" />
            <span className="hunt-tick-bl" />
            {renderCurrentStep()}
          </div>
          {/* Nav controls */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 24, gap: 12,
          }}>
            <button onClick={handleBack} disabled={currentStep === 1} className="hunt-btn hunt-btn-ghost">
              <ArrowLeft style={{ width: 13, height: 13 }} /> Back
            </button>
            <span className="hunt-kicker hunt-mono" style={{ fontSize: 10 }}>
              {String(currentStep).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')} — {STEPS[currentStep - 1].label}
            </span>
            {currentStep < STEPS.length ? (
              <button onClick={handleNext} className="hunt-btn hunt-btn-primary">
                Continue <ArrowRight style={{ width: 13, height: 13 }} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} className="hunt-btn hunt-btn-primary">
                {isSubmitting
                  ? <><Loader className="hunt-spin" style={{ width: 13, height: 13 }} /> Creating…</>
                  : <><CheckCircle2 style={{ width: 13, height: 13 }} /> Complete Profile</>}
              </button>
            )}
          </div>
        </div>

        {/* Side panel */}
        <SidePanel formData={formData} completeness={completeness} currentStep={currentStep} totalSteps={STEPS.length} />
      </div>
    </div>
  );
}

// ─── Side panel: Signal Strength + Recruiter View + meta ──────────────────────
function SidePanel({ formData, completeness, currentStep, totalSteps }) {
  const checklist = [
    { label: 'Name',       done: !!formData.fullName },
    { label: 'LinkedIn',   done: !!formData.linkedinUrl },
    { label: 'GitHub',     done: !!formData.githubUrl },
    { label: 'Skills ≥3',  done: formData.skills.length >= 3 },
    { label: 'Project ≥1', done: formData.projects.length >= 1 },
    { label: 'Roles',      done: formData.preferredRoles.length > 0 },
    { label: 'Education',  done: !!formData.education[0]?.school },
    { label: 'Resume',     done: !!formData.resume || formData.noResume },
  ];
  const topSkills = formData.skills.slice().sort((a, b) => b.level - a.level).slice(0, 4);

  return (
    <aside style={{
      position: 'sticky', top: 180, alignSelf: 'flex-start',
      display: 'grid', gap: 18,
    }}>
      {/* Signal Strength card */}
      <div className="hunt-card hunt-corner-tick" style={{ padding: 16 }}>
        <span className="hunt-tick-tr" />
        <span className="hunt-tick-bl" />
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="hunt-kicker hunt-kicker-ink">Signal Strength</span>
          <span className="hunt-display-serif" style={{ fontSize: 24, color: 'var(--blue)', lineHeight: 1 }}>
            {completeness}<span style={{ fontSize: 11, color: 'var(--text-dim)' }}>%</span>
          </span>
        </div>
        <div style={{ height: 4, background: 'var(--border-mid)', marginBottom: 14, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, width: `${completeness}%`, background: 'var(--blue)', transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'grid', gap: 5 }}>
          {checklist.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 11.5, color: c.done ? 'var(--text)' : 'var(--text-dim)',
            }}>
              <span style={{
                width: 12, height: 12, border: '1px solid var(--border-mid)',
                background: c.done ? 'var(--blue)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {c.done && <CheckCircle2 style={{ width: 8, height: 8, color: '#fff', strokeWidth: 4 }} />}
              </span>
              <span style={{ flex: 1 }}>{c.label}</span>
              {c.done && <span className="hunt-mono" style={{ fontSize: 9, color: 'var(--blue)', letterSpacing: '0.08em' }}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Recruiter View live preview */}
      <div className="hunt-card hunt-corner-tick" style={{ padding: 16 }}>
        <span className="hunt-tick-tr" />
        <span className="hunt-tick-bl" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 6, height: 6, background: 'var(--ink)', display: 'inline-block' }} />
          <span className="hunt-kicker hunt-kicker-ink">Recruiter View</span>
        </div>
        <div style={{ padding: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div className="hunt-display-serif" style={{ fontSize: 18, marginBottom: 2, color: 'var(--text)' }}>
            {formData.fullName || 'Your Name'}
          </div>
          <div className="hunt-mono" style={{
            marginBottom: 10, fontSize: 9.5, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--text-dim)',
          }}>
            {formData.city || '—'}{formData.state && `, ${formData.state}`}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10, minHeight: 22 }}>
            {topSkills.length > 0 ? topSkills.map(s => (
              <span key={s.id} className="hunt-mono" style={{
                fontSize: 9, padding: '2px 6px',
                background: 'var(--blue-tint)', color: 'var(--blue-deep)',
                border: '1px solid var(--blue)',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>{s.name}</span>
            )) : (
              <span className="hunt-mono" style={{
                fontSize: 9, color: 'var(--text-dim)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Add skills to preview
              </span>
            )}
          </div>
          <div className="hunt-mono" style={{
            fontSize: 10, color: 'var(--text-dim)',
            display: 'flex', justifyContent: 'space-between',
            paddingTop: 8, borderTop: '1px dashed var(--border-mid)',
          }}>
            <span>{formData.projects.length.toString().padStart(2, '0')} projects</span>
            <span>{formData.skills.length.toString().padStart(2, '0')} skills</span>
            <span>{formData.preferredRoles.length.toString().padStart(2, '0')} roles</span>
          </div>
        </div>
      </div>

      {/* Footer meta */}
      <div className="hunt-mono" style={{
        padding: '10px 0', fontSize: 10.5, color: 'var(--text-dim)', lineHeight: 1.6,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Step</span><span>{String(currentStep).padStart(2, '0')}/{String(totalSteps).padStart(2, '0')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Saved</span><span>Auto</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Secure</span><span style={{ color: 'var(--blue)' }}>● TLS 1.3</span>
        </div>
      </div>
    </aside>
  );
}

// ─── Submitted view: brutalist completion screen ──────────────────────────────
function SubmittedView({ formData, completeness, onStartSwiping, onEditProfile }) {
  const firstName = formData.fullName?.split(' ')[0] || 'there';
  return (
    <div className="hunt-bitmap-bg" style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32,
    }}>
      <div className="hunt-card hunt-corner-tick" style={{
        padding: '56px 48px', maxWidth: 560, width: '100%', textAlign: 'center',
      }}>
        <span className="hunt-tick-tr" />
        <span className="hunt-tick-bl" />

        {/* Big blue checkbox with ink border */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{
            width: 60, height: 60,
            border: '2px solid var(--ink)',
            background: 'var(--blue)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle2 style={{ width: 28, height: 28, strokeWidth: 3 }} />
          </div>
        </div>

        <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 14, fontSize: 11 }}>
          Profile — Complete
        </p>

        <h1 className="hunt-display-serif" style={{ fontSize: 48, lineHeight: 1, marginBottom: 14 }}>
          Welcome, <em style={{ fontStyle: 'italic' }}>{firstName}.</em>
        </h1>

        <p style={{
          fontSize: 14, color: 'var(--text-mid)',
          marginBottom: 28, lineHeight: 1.55,
        }}>
          Your profile is live. Recruiters see {completeness}% signal strength.
          Start swiping on roles that match your evidence.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={onStartSwiping} className="hunt-btn hunt-btn-primary">
            Start swiping <ArrowRight style={{ width: 13, height: 13 }} />
          </button>
          <button onClick={onEditProfile} className="hunt-btn hunt-btn-ghost">
            Edit profile
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          paddingTop: 20, borderTop: '1px dashed var(--border-mid)',
          display: 'flex', justifyContent: 'space-around',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5,
          color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          <div>
            <div className="hunt-display-serif" style={{ fontSize: 24, color: 'var(--text)', lineHeight: 1, marginBottom: 4 }}>
              {formData.skills.length}
            </div>
            Skills
          </div>
          <div>
            <div className="hunt-display-serif" style={{ fontSize: 24, color: 'var(--text)', lineHeight: 1, marginBottom: 4 }}>
              {formData.projects.length}
            </div>
            Projects
          </div>
          <div>
            <div className="hunt-display-serif" style={{ fontSize: 24, color: 'var(--text)', lineHeight: 1, marginBottom: 4 }}>
              {formData.preferredRoles.length}
            </div>
            Roles
          </div>
        </div>
      </div>
    </div>
  );
}
