// src/components/StudentDashboard/layout/Sidebar.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Compass, Home, Users, User, Bell, Sun, Moon,
  PanelLeftClose, PanelLeftOpen, LogOut, Settings, LifeBuoy, UserCircle,
} from 'lucide-react';

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
  // NEW props (with safe defaults so existing callers don't break)
  collapsed: collapsedProp,
  setCollapsed: setCollapsedProp,
}) {
  // Internal collapsed state if parent doesn't control it
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = collapsedProp ?? internalCollapsed;
  const setCollapsed = setCollapsedProp ?? setInternalCollapsed;

  // Sign-out confirmation state — prevents misclick logout
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  const accountWrapRef = useRef(null);

  const SIDEBAR_W = collapsed ? 64 : 210;

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

  // Reset confirmation whenever menu closes
  useEffect(() => {
    if (!showAccountMenu) setConfirmingSignOut(false);
  }, [showAccountMenu]);

  // Auto-close account menu when collapsing (avoids weird floating positioning)
  useEffect(() => {
    if (collapsed) {
      setShowAccountMenu(false);
      setShowNotifications(false);
    }
  }, [collapsed]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside
      style={{
        width: `${SIDEBAR_W}px`,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.18s ease',
      }}
    >
      {/* Header: brand + collapse toggle */}
      <div
        style={{
          padding: collapsed ? '18px 0 14px' : '20px 18px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '8px',
        }}
      >
        {!collapsed && (
          <span
            style={{
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: 'var(--text)',
            }}
          >
            HUNT
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hn-item"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderRadius: '6px',
            color: 'var(--text-dim)',
            padding: 0,
          }}
        >
          {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: collapsed ? '10px 6px' : '10px 8px', flex: 1 }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              className="hn-item"
              onClick={() => setActiveTab(id)}
              title={collapsed ? label : undefined}
              aria-label={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : '9px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                width: '100%',
                padding: collapsed ? '10px 0' : '9px 11px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '1px',
                background: active ? 'var(--bg-subtle)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-dim)',
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                textAlign: 'left',
                transition: 'background 0.12s',
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: collapsed ? '10px 6px' : '10px 8px', borderTop: '1px solid var(--border)' }}>
        {/* Applies-left bar — only when expanded; collapsed shows a tiny dot */}
        {!collapsed ? (
          <div
            style={{
              padding: '9px 11px',
              borderRadius: '7px',
              background: 'var(--bg-subtle)',
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Applies left</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--green)' }}>
                {remainingApplications}/5
              </span>
            </div>
            <div style={{ height: '3px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: 'var(--green)',
                  width: `${(remainingApplications / 5) * 100}%`,
                  borderRadius: '999px',
                }}
              />
            </div>
          </div>
        ) : (
          <div
            title={`${remainingApplications}/5 applies left`}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '4px',
                background: 'var(--border)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'var(--green)',
                  width: `${(remainingApplications / 5) * 100}%`,
                  borderRadius: '999px',
                }}
              />
            </div>
          </div>
        )}

        {/* Bell + Theme toggle */}
        <div
          style={{
            display: 'flex',
            flexDirection: collapsed ? 'column' : 'row',
            gap: '4px',
            padding: collapsed ? 0 : '0 2px',
            marginBottom: '6px',
          }}
        >
          <button
            onClick={() => setShowNotifications(p => !p)}
            title={collapsed ? 'Notifications' : undefined}
            aria-label="Notifications"
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: showNotifications ? 'var(--bg-subtle)' : 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '7px',
              borderRadius: '6px',
              color: notifications.length > 0 ? 'var(--text)' : 'var(--text-dim)',
            }}
            className="hn-item"
          >
            <Bell size={13} />
            {notifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#E53E3E',
                  border: '1.5px solid var(--bg-card)',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '7px',
              borderRadius: '6px',
              color: 'var(--text-dim)',
            }}
            className="hn-item"
          >
            {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          </button>
        </div>

        {/* Account pill — wrapper is positioned relative so the floating menu anchors here */}
        <div ref={accountWrapRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setShowAccountMenu(p => !p)}
            className="hn-item"
            title={collapsed ? studentProfile?.full_name : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : '9px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '6px 0' : '8px 11px',
              borderRadius: '7px',
              cursor: 'pointer',
              transition: 'background 0.12s',
              background: showAccountMenu ? 'var(--bg-subtle)' : 'transparent',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                flexShrink: 0,
                background: 'var(--green-tint)',
                border: '1px solid var(--green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--green)',
              }}
            >
              {initials}
            </div>
            {!collapsed && (
              <>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {studentProfile?.full_name}
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Student</p>
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

          {/* Floating account menu — opens to the RIGHT of the sidebar so the cursor
              isn't already hovering on the menu items. Sign out is separated and
              requires a second confirming click. */}
          {showAccountMenu && (
            <div
              role="menu"
              style={{
                position: 'fixed',
                left: `${SIDEBAR_W + 8}px`,
                bottom: '14px',
                width: '224px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 60,
              }}
            >
              {/* Identity header */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '2px' }}>
                  Signed in as
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--green)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {studentProfile?.email || studentProfile?.full_name}
                </p>
              </div>

              {/* Safe actions */}
              <div style={{ padding: '4px' }}>
                {[
                  {
                    label: 'Profile',
                    icon: UserCircle,
                    action: () => {
                      setActiveTab('profile');
                      setShowAccountMenu(false);
                    },
                  },
                  {
                    label: 'Settings',
                    icon: Settings,
                    action: () => {
                      setShowSettings(true);
                      setShowAccountMenu(false);
                    },
                  },
                  {
                    label: 'Support',
                    icon: LifeBuoy,
                    action: () => {
                      window.open('mailto:support@hunt.so');
                      setShowAccountMenu(false);
                    },
                  },
                ].map(({ label, icon: Icon, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="hn-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 10px',
                      fontSize: '12px',
                      color: 'var(--text-mid)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '6px',
                    }}
                  >
                    <Icon size={13} style={{ color: 'var(--text-dim)' }} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Visual gap before destructive action */}
              <div
                style={{
                  height: '8px',
                  background: 'var(--bg-subtle)',
                  borderTop: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                }}
              />

              {/* Sign out — two-step confirmation. First click reveals confirm row. */}
              <div style={{ padding: '6px' }}>
                {!confirmingSignOut ? (
                  <button
                    onClick={() => setConfirmingSignOut(true)}
                    className="hn-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 10px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--red, #E53E3E)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '6px',
                    }}
                  >
                    <LogOut size={13} />
                    Sign out
                  </button>
                ) : (
                  <div style={{ padding: '6px 4px' }}>
                    <p
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-mid)',
                        marginBottom: '8px',
                        padding: '0 6px',
                      }}
                    >
                      Sign out of HUNT?
                    </p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setConfirmingSignOut(false)}
                        style={{
                          flex: 1,
                          padding: '7px 10px',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: 'var(--text-mid)',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          setConfirmingSignOut(false);
                          handleSignOut();
                        }}
                        style={{
                          flex: 1,
                          padding: '7px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#fff',
                          background: 'var(--red, #E53E3E)',
                          border: '1px solid var(--red, #E53E3E)',
                          borderRadius: '6px',
                          cursor: 'pointer',
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
