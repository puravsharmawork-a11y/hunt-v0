// src/components/StudentDashboard/shared/WelcomeCard.jsx
import React from 'react';
import { X } from 'lucide-react';

export function WelcomeCard({ name, completeness, onDismiss }) {
  const firstName = name?.split(' ')[0] || 'there';

  return (
    <div
      className="hunt-card"
      style={{
        padding: '24px 28px 24px 0',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        gap: 24,
        alignItems: 'stretch',
      }}
    >
      {/* Left: pixel-art ink column */}
      <div
        style={{
          flexShrink: 0,
          width: 120,
          background: 'var(--ink)',
          position: 'relative',
          overflow: 'hidden',
          alignSelf: 'stretch',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridTemplateRows: 'repeat(12, 1fr)',
            gap: 2,
          }}
        >
          {Array.from({ length: 96 }).map((_, i) => {
            const on = ((i * 7) % 13) < 4 || i % 17 === 0;
            return (
              <div
                key={i}
                style={{ background: on ? 'var(--blue)' : 'transparent' }}
              />
            );
          })}
        </div>
      </div>

      {/* Right: copy */}
      <div style={{ flex: 1, paddingRight: 32, paddingTop: 4 }}>
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-dim)',
            padding: 6,
          }}
        >
          <X size={14} />
        </button>

        <div
          className="hunt-kicker hunt-kicker-blue"
          style={{ marginBottom: 8 }}
        >
          ▲ Welcome to HUNT
        </div>

        <h2
          className="hunt-serif"
          style={{
            fontSize: 28,
            color: 'var(--text)',
            marginBottom: 10,
            lineHeight: 1.05,
            maxWidth: 520,
          }}
        >
          Hey {firstName}, let's find <em>your first internship.</em>
        </h2>

        <p
          style={{
            fontSize: 13.5,
            color: 'var(--text-mid)',
            lineHeight: 1.55,
            maxWidth: 540,
            marginBottom: 18,
          }}
        >
          HUNT matches you on skills — not your college name. Five applies a week, make 'em count.
        </p>

        {/* Profile completeness — flat bar, no rounded ends */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 200,
              height: 4,
              background: 'var(--border-mid)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${completeness}%`,
                background:
                  completeness >= 80 ? 'var(--blue)' : 'var(--amber)',
                transition: 'width 0.6s',
              }}
            />
          </div>
          <span
            className="hunt-mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}
          >
            profile {completeness}% complete
          </span>
        </div>
      </div>
    </div>
  );
}
