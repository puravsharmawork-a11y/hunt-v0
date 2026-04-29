// src/components/StudentDashboard/layout/NotificationFlyout.jsx
import React from 'react';
import { Bell } from 'lucide-react';

export function NotificationFlyout({ notifications, onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 90 }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 130,
          left: 228,
          width: 320,
          background: 'var(--bg-card)',
          border: '1px solid var(--ink)',
          boxShadow: '4px 4px 0 0 var(--ink)',
          zIndex: 100,
          overflow: 'hidden',
          animation: 'hunt-fade-in 0.15s ease',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-mid)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p className="hunt-kicker hunt-kicker-ink">▲ notifications</p>
          {notifications.length > 0 && (
            <span
              className="hunt-mono"
              style={{
                fontSize: 9.5,
                color: 'var(--text-dim)',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Mark all read
            </span>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{ padding: '34px 16px', textAlign: 'center' }}>
            <Bell
              size={20}
              style={{
                color: 'var(--text-dim)',
                display: 'block',
                margin: '0 auto 12px',
              }}
            />
            <p
              className="hunt-serif"
              style={{
                fontSize: 18,
                color: 'var(--text)',
                marginBottom: 4,
              }}
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
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    background: 'var(--blue)',
                    flexShrink: 0,
                    marginTop: 5,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text)',
                      marginBottom: 2,
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
    </>
  );
}
