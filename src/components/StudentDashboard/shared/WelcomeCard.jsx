// src/components/StudentDashboard/shared/WelcomeCard.jsx
import React from 'react';
import { X, Play, ArrowRight } from 'lucide-react';

export function WelcomeCard({ name, completeness, onDismiss, onTour }) {
  const firstName = name?.split(' ')[0] || 'there';

  return (
    <div
      className="hunt-card"
      style={{
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        gap: 0,
        alignItems: 'stretch',
      }}
    >
      {/* Left: pixel-art ink column */}
      <div
        style={{
          flexShrink: 0,
          width: 110,
          background: 'var(--ink)',
          position: 'relative',
          overflow: 'hidden',
          alignSelf: 'stretch',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 16,
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
      <div style={{ flex: 1, padding: '22px 40px 22px 24px' }}>
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-dim)',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={13} />
        </button>

        <div
          className="hunt-kicker hunt-kicker-blue"
          style={{ marginBottom: 6 }}
        >
          ▲ Welcome to HUNT
        </div>

        <h2
          className="hunt-serif"
          style={{
            fontSize: 24,
            color: 'var(--text)',
            marginBottom: 8,
            lineHeight: 1.1,
            maxWidth: 480,
          }}
        >
          Hey {firstName}, let's find <em>your first shot.</em>
        </h2>

        <p
          style={{
            fontSize: 13,
            color: 'var(--text-mid)',
            lineHeight: 1.5,
            maxWidth: 500,
            marginBottom: 16,
          }}
        >
          HUNT strips hiring down to the parts that matter — skills on skills. No college filter. No resume-screen. Five applies a week, make 'em count.
        </p>

        {/* Profile completeness bar */}
        {completeness < 100 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 180,
                height: 3,
                background: 'var(--border-mid)',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${completeness}%`,
                  background: completeness >= 80 ? 'var(--blue)' : 'var(--amber)',
                  transition: 'width 0.6s',
                }}
              />
            </div>
            <span
              className="hunt-mono"
              style={{
                fontSize: 9.5,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-dim)',
              }}
            >
              profile {completeness}% complete
            </span>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {completeness < 100 && (
            <button
              className="hunt-btn hunt-btn-primary hunt-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              complete profile <ArrowRight size={11} />
            </button>
          )}
          <button
            onClick={onTour}
            className="hunt-btn hunt-btn-sm hunt-btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Play size={10} /> watch 60-sec tour
          </button>
        </div>
      </div>
    </div>
  );
}
