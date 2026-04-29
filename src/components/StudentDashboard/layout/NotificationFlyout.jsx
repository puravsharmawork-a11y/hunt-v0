// src/components/StudentDashboard/layout/NotificationFlyout.jsx
import React from 'react';
import { Bell, X } from 'lucide-react';

export function NotificationFlyout({ notifications, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
          background: 'rgba(0,0,0,0.18)',
        }}
      />

      {/* Right-side panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 380,
          height: '100vh',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--ink)',
          boxShadow: '-6px 0 0 0 var(--ink)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          animation: 'hunt-slide-in-right 0.18s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--border-mid)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={14} style={{ color: 'var(--text-dim)' }} />
            <p className="hunt-kicker hunt-kicker-ink" style={{ margin: 0 }}>
              ▲ notifications
            </p>
            {notifications.length > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 18,
                  height: 18,
                  background: 'var(--red)',
                  color: '#fff',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  padding: '0 4px',
                }}
              >
                {notifications.length}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {notifications.length > 0 && (
              <span
                className="hunt-mono"
                style={{
                  fontSize: 9.5,
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'underline',
                  textDecorationStyle: 'dotted',
                }}
              >
                Mark all read
              </span>
            )}
            <button
              onClick={onClose}
              title="Close"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                background: 'transparent',
                border: '1px solid var(--border-mid)',
                cursor: 'pointer',
                color: 'var(--text-dim)',
                padding: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-subtle)';
                e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-dim)';
              }}
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div
              style={{
                padding: '60px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Bell
                size={28}
                style={{ color: 'var(--text-dim)', opacity: 0.4 }}
              />
              <p
                className="hunt-serif"
                style={{ fontSize: 20, color: 'var(--text)', margin: 0 }}
              >
                All clear.
              </p>
              <p
                className="hunt-mono"
                style={{
                  fontSize: 10,
                  color: 'var(--text-dim)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                no notifications right now
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((n, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background = 'var(--bg-subtle)')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  {/* Unread square dot */}
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      background: n.read ? 'transparent' : 'var(--red)',
                      border: n.read
                        ? '1px solid var(--border-mid)'
                        : 'none',
                      flexShrink: 0,
                      marginTop: 5,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: n.read ? 'var(--text-mid)' : 'var(--text)',
                        marginBottom: 4,
                        lineHeight: 1.45,
                        fontWeight: n.read ? 400 : 600,
                      }}
                    >
                      {n.text}
                    </p>
                    <p
                      className="hunt-mono"
                      style={{
                        fontSize: 9.5,
                        color: 'var(--text-dim)',
                        letterSpacing: '0.06em',
                        margin: 0,
                      }}
                    >
                      {n.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-mid)',
            flexShrink: 0,
          }}
        >
          <p
            className="hunt-mono"
            style={{
              fontSize: 9,
              color: 'var(--text-dim)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: 0,
              textAlign: 'center',
            }}
          >
            only signal · no noise
          </p>
        </div>
      </div>

      <style>{`
        @keyframes hunt-slide-in-right {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </>
  );
}
