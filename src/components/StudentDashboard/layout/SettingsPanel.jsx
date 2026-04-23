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
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 200 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '440px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 28px rgba(0,0,0,0.1)', animation: 'hunt-slide-in 0.2s ease' }}>
        <style>{`@keyframes hunt-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        {/* Panel header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>Settings</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>
        {/* Settings tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {['account', 'preferences', 'privacy'].map(t => (
            <button key={t} onClick={() => setSettingsTab(t)} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: settingsTab === t ? 600 : 400, color: settingsTab === t ? 'var(--text)' : 'var(--text-dim)', borderBottom: settingsTab === t ? '2px solid var(--text)' : '2px solid transparent', marginBottom: '-1px', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>
        {/* Settings content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {settingsTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', borderRadius: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--green-tint)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>{initials}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{studentProfile?.full_name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px' }}>{studentProfile?.email}</p>
                  <label style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-mid)', background: 'var(--bg-card)' }}>
                    Change avatar
                    <input type="file" accept="image/*" style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              {/* Change email */}
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Email address</p>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '10px' }}>Update your login email address.</p>
                <input defaultValue={studentProfile?.email || ''} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }} placeholder="you@example.com" />
                <button style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Save email</button>
              </div>
              {/* Delete account */}
              <div style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--red)', background: 'var(--red-tint)' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--red)', marginBottom: '3px' }}>Delete account</p>
                <p style={{ fontSize: '11px', color: 'var(--red)', opacity: 0.8, marginBottom: '10px' }}>Permanently delete your account and all data. This cannot be undone.</p>
                <button style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid var(--red)', background: 'transparent', color: 'var(--red)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Delete account</button>
              </div>
            </div>
          )}
          {settingsTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Theme */}
              <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Appearance</p>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px' }}>Choose your preferred theme.</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['light', 'dark'].map(t => (
                    <button key={t} onClick={() => setTheme(t)} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: `1.5px solid ${theme === t ? 'var(--text)' : 'var(--border)'}`, background: theme === t ? 'var(--bg-card)' : 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: theme === t ? 600 : 400, color: 'var(--text)', textTransform: 'capitalize' }}>
                      {t === 'light' ? '☀️' : '🌙'} {t}
                    </button>
                  ))}
                </div>
              </div>
              {/* Notifications pref */}
              <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>Email notifications</p>
                {[
                  { label: 'New job matches', sub: 'When a new job matches your skills' },
                  { label: 'Application updates', sub: 'When a recruiter views your profile' },
                  { label: 'Weekly digest', sub: 'Summary of activity every Monday' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '1px' }}>{item.label}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{item.sub}</p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--green)', width: '16px', height: '16px', cursor: 'pointer' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {settingsTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { title: 'Profile visibility', sub: 'Allow recruiters to find you in search results', checked: true },
                { title: 'Show college name', sub: 'Display your college name on your profile', checked: true },
                { title: 'Show match scores', sub: 'Let other students see your match score badges', checked: false },
                { title: 'Activity status', sub: 'Show when you were last active on HUNT', checked: false },
              ].map(item => (
                <div key={item.title} style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{item.title}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{item.sub}</p>
                  </div>
                  <input type="checkbox" defaultChecked={item.checked} style={{ accentColor: 'var(--green)', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
