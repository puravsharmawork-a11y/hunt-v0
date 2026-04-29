// src/components/StudentDashboard/shared/QuickGuideCard.jsx
import React from 'react';
import { X, BookOpen } from 'lucide-react';

export function QuickGuideCard({ onDismiss }) {
  const steps = [
    { n: '01', t: 'Build profile',     d: 'Skills + projects = your signal.' },
    { n: '02', t: 'Explore matches',   d: '5 applies/week — make them count.' },
    { n: '03', t: 'Apply with intent', d: 'See your match % before you apply.' },
    { n: '04', t: 'Get shortlisted',   d: 'Recruiters see only the top 20.' },
  ];

  return (
    <div
      className="hunt-card"
      style={{
        padding: '20px 24px',
        marginBottom: 20,
        position: 'relative',
      }}
    >
      <button
        onClick={onDismiss}
        className="hunt-mono"
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-dim)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        <span>Skip</span>
        <X size={12} />
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <BookOpen size={13} style={{ color: 'var(--blue)' }} />
        <p className="hunt-kicker hunt-kicker-ink">▲ how HUNT works</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
      >
        {steps.map(s => (
          <div
            key={s.n}
            style={{
              padding: 14,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              position: 'relative',
            }}
          >
            <span
              className="hunt-mono"
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--blue)',
                display: 'block',
                marginBottom: 4,
                letterSpacing: '0.08em',
              }}
            >
              {s.n}
            </span>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: 4,
                fontFamily: "'Instrument Serif', serif",
              }}
            >
              {s.t}
            </p>
            <p
              style={{
                fontSize: 11,
                color: 'var(--text-dim)',
                lineHeight: 1.45,
              }}
            >
              {s.d}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
