// src/components/StudentDashboard/layout/SettingsPanel.jsx
import React from 'react';
import { X } from 'lucide-react';

export function SettingsPanel({
  onClose,
  settingsTab, setSettingsTab,
  studentProfile, initials,
  theme, setTheme,
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 200,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 460,
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--ink)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          animation: 'hunt-slide-in 0.2s ease',
        }}
      >
        <style>{`@keyframes hunt-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-mid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 4 }}>▲ settings</p>
            <p
              className="hunt-serif"
              style={{
                fontSize: 22,
                color: 'var(--text)',
              }}
            >
              Account & preferences
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              padding: 6,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-mid)',
            flexShrink: 0,
          }}
        >
          {['account', 'preferences', 'privacy'].map(t => {
            const active = settingsTab === t;
            return (
              <button
                key={t}
                onClick={() => setSettingsTab(t)}
                style={{
                  flex: 1,
                  padding: '12px 10px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${active ? 'var(--blue)' : 'transparent'}`,
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--text)' : 'var(--text-dim)',
                  marginBottom: -1,
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
          }}
        >
          {settingsTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Avatar block */}
              <div
                className="hunt-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    background: 'var(--blue-tint)',
                    border: '1px solid var(--blue)',
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--blue-deep)',
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    {studentProfile?.full_name}
                  </p>
                  <p
                    className="hunt-mono"
                    style={{
                      fontSize: 10,
                      color: 'var(--text-dim)',
                      marginBottom: 10,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {studentProfile?.email}
                  </p>
                  <label className="hunt-btn hunt-btn-sm hunt-btn-ghost">
                    Change avatar
                    <input type="file" accept="image/*" style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Email */}
              <div>
                <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 6 }}>▲ email address</p>
                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    marginBottom: 10,
                  }}
                >
                  Update your login email address.
                </p>
                <input
                  defaultValue={studentProfile?.email || ''}
                  className="hunt-input"
                  style={{ marginBottom: 10 }}
                  placeholder="you@example.com"
                />
                <button className="hunt-btn hunt-btn-primary">
                  Save email
                </button>
              </div>

              {/* Delete account */}
              <div
                style={{
                  padding: '14px 16px',
                  border: '1px solid var(--red)',
                  background: 'var(--red-tint)',
                }}
              >
                <p className="hunt-kicker" style={{ color: 'var(--red)', marginBottom: 4 }}>▲ delete account</p>
                <p style={{ fontSize: 11, color: 'var(--red)', opacity: 0.85, marginBottom: 12, lineHeight: 1.5 }}>
                  Permanently delete your account and all data. This cannot be undone.
                </p>
                <button
                  className="hunt-btn hunt-btn-sm"
                  style={{
                    color: 'var(--red)',
                    borderColor: 'var(--red)',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--red)'; }}
                >
                  Delete account
                </button>
              </div>
            </div>
          )}

          {settingsTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Theme */}
              <div
                className="hunt-card"
                style={{ padding: 16 }}
              >
                <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 4 }}>▲ appearance</p>
                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    marginBottom: 12,
                  }}
                >
                  Choose your preferred theme.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['light', 'dark'].map(t => {
                    const active = theme === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: `1px solid ${active ? 'var(--ink)' : 'var(--border-mid)'}`,
                          background: active ? 'var(--bg)' : 'transparent',
                          cursor: 'pointer',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          fontWeight: active ? 600 : 500,
                          color: 'var(--text)',
                          boxShadow: active ? '2px 2px 0 0 var(--ink)' : 'none',
                          transition: 'all 0.12s',
                        }}
                      >
                        {t === 'light' ? '☀️ light' : '🌙 dark'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notifications pref */}
              <div className="hunt-card" style={{ padding: 16 }}>
                <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 12 }}>▲ email notifications</p>
                {[
                  { label: 'New job matches',  sub: 'When a new job matches your skills' },
                  { label: 'Application updates', sub: 'When a recruiter views your profile' },
                  { label: 'Weekly digest',    sub: 'Summary of activity every Monday' },
                ].map(item => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--text)', marginBottom: 1 }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                        {item.sub}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{
                        accentColor: 'var(--blue)',
                        width: 16,
                        height: 16,
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {settingsTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { title: 'Profile visibility', sub: 'Allow recruiters to find you in search results', checked: true },
                { title: 'Show college name',  sub: 'Display your college name on your profile', checked: true },
                { title: 'Show match scores',  sub: 'Let other students see your match score badges', checked: false },
                { title: 'Activity status',    sub: 'Show when you were last active on HUNT', checked: false },
              ].map(item => (
                <div
                  key={item.title}
                  className="hunt-card"
                  style={{
                    padding: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      {item.sub}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={item.checked}
                    style={{
                      accentColor: 'var(--blue)',
                      width: 16,
                      height: 16,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
