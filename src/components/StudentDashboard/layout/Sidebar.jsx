// src/components/StudentDashboard/layout/Sidebar.jsx
// ─── Brutalist sidebar — same props/state as before, new visual language ─────
import React, { useState, useRef, useEffect } from 'react';
import {
  Compass, Home, Users, User, Bell, Sun, Moon,
  PanelLeftClose, PanelLeftOpen, LogOut, Settings, LifeBuoy, UserCircle,
} from 'lucide-react';
import { HuntLogo, PixelMark } from '../shared/HuntLogo';

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
  collapsed: collapsedProp,
  setCollapsed: setCollapsedProp,
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = collapsedProp ?? internalCollapsed;
  const setCollapsed = setCollapsedProp ?? setInternalCollapsed;

  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const accountWrapRef = useRef(null);
  const SIDEBAR_W = collapsed ? 72 : 220;

  // Close account menu when clicking outside
  useEffect(() => {
    if (!showAccountMenu) return;
    const onDocClick = (e) => {
      if (accountWrapRef.current && !accountWrapRef.current.contains(e.target)) {
        setShowAccountMenu(false);
        setConfirmingSignOut(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showAccountMenu, setShowAccountMenu]);

  useEffect(() => {
    if (!showAccountMenu) setConfirmingSignOut(false);
  }, [showAccountMenu]);

  useEffect(() => {
    if (collapsed) {
      setShowAccountMenu(false);
      setShowNotifications(false);
    }
  }, [collapsed]); // eslint-disable-line react-hooks/exhaustive-deps

  const fillPct = Math.max(0, Math.min(100, (remainingApplications / 5) * 100));

  return (
    <aside
      style={{
        width: `${SIDEBAR_W}px`,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid var(--border-mid)',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.18s ease',
      }}
    >
      {/* ── Logo block ── */}
      <div
        style={{
          padding: collapsed ? '20px 0 16px' : '22px 18px 18px',
          borderBottom: '1px solid var(--border-mid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 8,
        }}
      >
        {collapsed ? (
          <PixelMark size={20} />
        ) : (
          <>
            <HuntLogo size={18} />
            <span
              className="hunt-mono"
              style={{
                fontSize: 9,
                letterSpacing: '0.12em',
                color: 'var(--text-dim)',
              }}
            >
              v0.4·BETA
            </span>
          </>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              padding: 0,
              marginLeft: 'auto',
            }}
          >
            <PanelLeftClose size={14} />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            style={{
              position: 'absolute',
              top: 14,
              right: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              padding: 0,
            }}
          >
            <PanelLeftOpen size={12} />
          </button>
        )}
      </div>

      {/* ── Profile snippet (only when expanded) ── */}
      {!collapsed && studentProfile && (
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: 'var(--ink)',
                color: 'var(--cream)',
                display: 'grid',
                placeItems: 'center',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'var(--text)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {studentProfile?.full_name}
              </div>
              <div
                className="hunt-mono"
                style={{
                  fontSize: 9.5,
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {studentProfile?.college || 'Student'}
              </div>
            </div>
          </div>
          {studentProfile?.profile_completeness != null && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <span className="hunt-kicker">Profile</span>
                <span
                  className="hunt-mono"
                  style={{ fontSize: 10, color: 'var(--text)' }}
                >
                  {studentProfile.profile_completeness}%
                </span>
              </div>
              <div className="hunt-match-bar-track">
                <div
                  className="hunt-match-bar-fill"
                  style={{ width: `${studentProfile.profile_completeness}%` }}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Nav ── */}
      <nav
        style={{
          flex: 1,
          padding: '8px 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              title={collapsed ? label : undefined}
              aria-label={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 12,
                justifyContent: collapsed ? 'center' : 'flex-start',
                width: '100%',
                padding: collapsed ? '12px 0' : '10px 14px',
                border: 'none',
                borderLeft: `2px solid ${active && !collapsed ? 'var(--blue)' : 'transparent'}`,
                cursor: 'pointer',
                background: active ? 'var(--bg-subtle)' : 'transparent',
                color: active ? 'var(--ink)' : 'var(--text-dim)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11.5,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textAlign: 'left',
                transition: 'background 0.12s, color 0.12s, border-color 0.12s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--bg-subtle)';
                  e.currentTarget.style.color = 'var(--text)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-dim)';
                }
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </button>
          );
        })}
      </nav>

      {/* ── Weekly applies quota ── */}
      <div
        style={{
          padding: collapsed ? '12px 8px' : '14px 18px',
          borderTop: '1px solid var(--border-mid)',
        }}
      >
        {!collapsed ? (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 8,
              }}
            >
              <span className="hunt-kicker">applies left</span>
              <span
                className="hunt-mono"
                style={{ fontSize: 10, color: 'var(--text)' }}
              >
                {remainingApplications}/5
              </span>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={
                    'hunt-apply-pill ' + (i < remainingApplications ? 'used' : 'free')
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <div
            title={`${remainingApplications}/5 applies left`}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <div
              style={{
                width: 24,
                height: 4,
                background: 'var(--border-mid)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'var(--blue)',
                  width: `${fillPct}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Footer controls: bell / theme / account ── */}
      <div style={{ borderTop: '1px solid var(--border-mid)' }}>
        {/* Bell + theme toggle row */}
        <div style={{ display: 'flex' }}>
          <button
            onClick={() => setShowNotifications(p => !p)}
            title={collapsed ? 'Notifications' : undefined}
            aria-label="Notifications"
            style={{
              flex: 1,
              padding: '14px 0',
              display: 'grid',
              placeItems: 'center',
              background: showNotifications ? 'var(--bg-subtle)' : 'transparent',
              border: 'none',
              borderRight: '1px solid var(--border-mid)',
              cursor: 'pointer',
              color: notifications.length > 0 ? 'var(--text)' : 'var(--text-dim)',
              position: 'relative',
            }}
          >
            <Bell size={14} />
            {notifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 10,
                  right: collapsed ? 18 : '38%',
                  width: 6,
                  height: 6,
                  background: 'var(--red)',
                }}
              />
            )}
          </button>
          <button
            onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
            title={collapsed ? (theme === 'light' ? 'Dark mode' : 'Light mode') : undefined}
            aria-label="Toggle theme"
            style={{
              flex: 1,
              padding: '14px 0',
              display: 'grid',
              placeItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
            }}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>

        {/* Account pill */}
        <div ref={accountWrapRef} style={{ position: 'relative', borderTop: '1px solid var(--border-mid)' }}>
          <div
            onClick={() => setShowAccountMenu(p => !p)}
            title={collapsed ? studentProfile?.full_name : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '12px 0' : '12px 18px',
              cursor: 'pointer',
              transition: 'background 0.12s',
              background: showAccountMenu ? 'var(--bg-subtle)' : 'transparent',
            }}
            onMouseEnter={e => { if (!showAccountMenu) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
            onMouseLeave={e => { if (!showAccountMenu) e.currentTarget.style.background = 'transparent'; }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                flexShrink: 0,
                background: 'var(--blue-tint)',
                border: '1px solid var(--blue)',
                display: 'grid',
                placeItems: 'center',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--blue-deep)',
              }}
            >
              {initials}
            </div>
            {!collapsed && (
              <>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {studentProfile?.full_name}
                  </p>
                  <p
                    className="hunt-mono"
                    style={{
                      fontSize: 9,
                      color: 'var(--text-dim)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    student
                  </p>
                </div>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-dim)"
                  strokeWidth="2"
                  style={{
                    flexShrink: 0,
                    transform: showAccountMenu ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.15s',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </>
            )}
          </div>

          {/* Floating account menu — brutalist sharp-corner card */}
          {showAccountMenu && (
            <div
              role="menu"
              style={{
                position: 'fixed',
                left: `${SIDEBAR_W + 8}px`,
                bottom: 14,
                width: 232,
                background: 'var(--bg-card)',
                border: '1px solid var(--ink)',
                boxShadow: '4px 4px 0 0 var(--ink)',
                zIndex: 60,
              }}
            >
              {/* Identity header */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-mid)' }}>
                <p className="hunt-kicker" style={{ marginBottom: 2 }}>
                  Signed in as
                </p>
                <p
                  className="hunt-mono"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--blue)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {studentProfile?.email || studentProfile?.full_name}
                </p>
              </div>

              {/* Safe actions */}
              <div style={{ padding: 4 }}>
                {[
                  {
                    label: 'Profile',
                    icon: UserCircle,
                    action: () => { setActiveTab('profile'); setShowAccountMenu(false); },
                  },
                  {
                    label: 'Settings',
                    icon: Settings,
                    action: () => { setShowSettings(true); setShowAccountMenu(false); },
                  },
                  {
                    label: 'Support',
                    icon: LifeBuoy,
                    action: () => { window.open('mailto:support@hunt.so'); setShowAccountMenu(false); },
                  },
                ].map(({ label, icon: Icon, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 10px',
                      fontSize: 11.5,
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--text-mid)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon size={13} style={{ color: 'var(--text-dim)' }} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Visual gap before destructive action */}
              <div
                style={{
                  height: 8,
                  background: 'var(--bg-subtle)',
                  borderTop: '1px solid var(--border-mid)',
                  borderBottom: '1px solid var(--border-mid)',
                }}
              />

              {/* Sign out — two-step confirmation */}
              <div style={{ padding: 6 }}>
                {!confirmingSignOut ? (
                  <button
                    onClick={() => setConfirmingSignOut(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 10px',
                      fontSize: 11.5,
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      color: 'var(--red)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-tint)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <LogOut size={13} />
                    Sign out
                  </button>
                ) : (
                  <div style={{ padding: '6px 4px' }}>
                    <p
                      style={{
                        fontSize: 11,
                        color: 'var(--text-mid)',
                        marginBottom: 8,
                        padding: '0 6px',
                      }}
                    >
                      Sign out of HUNT?
                    </p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setConfirmingSignOut(false)}
                        className="hunt-btn hunt-btn-sm hunt-btn-ghost"
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          setConfirmingSignOut(false);
                          handleSignOut();
                        }}
                        className="hunt-btn hunt-btn-sm"
                        style={{
                          flex: 1,
                          background: 'var(--red)',
                          color: '#fff',
                          borderColor: 'var(--red)',
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
