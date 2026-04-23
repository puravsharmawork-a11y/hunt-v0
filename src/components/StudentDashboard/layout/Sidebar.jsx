// src/components/StudentDashboard/layout/Sidebar.jsx
import React from 'react';
import { Compass, Home, Users, User, Bell, Sun, Moon } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'home',    label: 'Home',    icon: Home },
  { id: 'network', label: 'Network', icon: Users },
  { id: 'profile', label: 'Profile', icon: User },
];

export function Sidebar({
  activeTab, setActiveTab,
  remainingApplications,
  notifications,
  showNotifications, setShowNotifications,
  theme, setTheme,
  studentProfile, initials,
  showAccountMenu, setShowAccountMenu,
  setShowSettings,
  handleSignOut,
}) {
  return (
    <aside style={{ width: '210px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0, borderRight: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--text)' }}>HUNT</span>
      </div>

      <nav style={{ padding: '10px 8px', flex: 1 }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} className="hn-item" onClick={() => setActiveTab(id)}
              style={{ display: 'flex', alignItems: 'center', gap: '9px', width: '100%', padding: '9px 11px', borderRadius: '7px', border: 'none', cursor: 'pointer', marginBottom: '1px', background: active ? 'var(--bg-subtle)' : 'transparent', color: active ? 'var(--text)' : 'var(--text-dim)', fontSize: '13px', fontWeight: active ? 600 : 400, textAlign: 'left', transition: 'background 0.12s' }}>
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
        {/* Applies left bar */}
        <div style={{ padding: '9px 11px', borderRadius: '7px', background: 'var(--bg-subtle)', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Applies left</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--green)' }}>{remainingApplications}/5</span>
          </div>
          <div style={{ height: '3px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--green)', width: `${(remainingApplications / 5) * 100}%`, borderRadius: '999px' }} />
          </div>
        </div>

        {/* Icon row: Bell + Theme toggle */}
        <div style={{ display: 'flex', gap: '4px', padding: '0 2px', marginBottom: '6px' }}>
          {/* Bell with notification dot */}
          <button onClick={() => setShowNotifications(p => !p)} style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: showNotifications ? 'var(--bg-subtle)' : 'none', border: 'none', cursor: 'pointer', padding: '7px', borderRadius: '6px', color: notifications.length > 0 ? 'var(--text)' : 'var(--text-dim)' }}
            className="hn-item">
            <Bell size={13} />
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: '5px', right: '5px', width: '6px', height: '6px', borderRadius: '50%', background: '#E53E3E', border: '1.5px solid var(--bg-card)' }} />
            )}
          </button>
          {/* Theme toggle */}
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '7px', borderRadius: '6px', color: 'var(--text-dim)' }}
            className="hn-item">
            {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          </button>
        </div>

        {/* Account pill — opens account dropdown */}
        <div onClick={() => setShowAccountMenu(p => !p)} className="hn-item" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 11px', borderRadius: '7px', cursor: 'pointer', transition: 'background 0.12s', position: 'relative' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, background: 'var(--green-tint)', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--green)' }}>{initials}</div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{studentProfile?.full_name}</p>
            <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Student</p>
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" style={{ flexShrink: 0, transform: showAccountMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        {/* Account dropdown */}
        {showAccountMenu && (
          <div style={{ margin: '4px 2px 0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '1px' }}>Signed in as</p>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--green)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{studentProfile?.email || studentProfile?.full_name}</p>
            </div>
            {[
              { label: 'Profile', action: () => { setActiveTab('profile'); setShowAccountMenu(false); } },
              { label: 'Settings', action: () => { setShowSettings(true); setShowAccountMenu(false); } },
              { label: 'Support', action: () => { window.open('mailto:support@hunt.so'); setShowAccountMenu(false); } },
            ].map(item => (
              <button key={item.label} onClick={item.action} className="hn-item" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: '12px', color: 'var(--text-mid)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {item.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={handleSignOut} className="hn-item" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: '12px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
