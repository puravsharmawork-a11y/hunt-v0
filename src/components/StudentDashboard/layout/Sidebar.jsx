// src/components/StudentDashboard/layout/Sidebar.jsx
// ─── Brutalist sidebar — with Hunt Score replacing profile completeness ────────
import React, { useState, useRef, useEffect } from 'react';
import {
  Compass, Home, Users, User, Bell, Sun, Moon,
  PanelLeftClose, PanelLeftOpen, LogOut, Settings, LifeBuoy, UserCircle,
  MessageCircle, Mail, Phone, X, Edit3, Save, Plus, Trash2,
} from 'lucide-react';
import { HuntLogo, PixelMark } from '../shared/HuntLogo';
import { SettingsPanel } from './SettingsPanel';

const NAV_ITEMS = [
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'home',    label: 'Home',    icon: Home },
  { id: 'network', label: 'Network', icon: Users },
  { id: 'profile', label: 'Profile', icon: User },
];

// ─── Hunt Score colour (fixed blue always) ───────────────────────────────────
const HUNT_SCORE_COLOR = 'var(--blue)';

function huntScoreLabel(level) {
  const MAP = {
    elite:    'ELITE',
    strong:   'STRONG',
    building: 'BUILDING',
    starter:  'STARTER',
    unranked: 'UNRANKED',
  };
  return MAP[level] || 'UNRANKED';
}

// ─── Default support contact details (admin can edit these) ──────────────────
const DEFAULT_SUPPORT_CONTACTS = [
  {
    id: 'whatsapp',
    type: 'whatsapp',
    label: 'WhatsApp',
    value: '+91 63671 46875',
    href: 'https://wa.me/916367146875',
    icon: 'whatsapp',
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    value: 'puravsharma.work@gmail.com',
    href: 'mailto:puravsharma.work@gmail.com',
    icon: 'mail',
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Call',
    value: '+91 63671 46875',
    href: 'tel:+916367146875',
    icon: 'phone',
  },
];

// ─── Support Panel Component ──────────────────────────────────────────────────
function SupportPanel({ onClose, isAdmin = false }) {
  const [contacts, setContacts] = useState(DEFAULT_SUPPORT_CONTACTS);
  const [editMode, setEditMode] = useState(false);
  const [editingContacts, setEditingContacts] = useState([]);

  const enterEdit = () => {
    setEditingContacts(contacts.map(c => ({ ...c })));
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingContacts([]);
  };

  const saveEdit = () => {
    setContacts(editingContacts.filter(c => c.value.trim() !== ''));
    setEditMode(false);
    setEditingContacts([]);
  };

  const updateContact = (id, field, val) => {
    setEditingContacts(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: val };
        // Auto-update href when value changes
        if (field === 'value') {
          if (c.type === 'whatsapp') {
            const num = val.replace(/\D/g, '');
            updated.href = `https://wa.me/${num}`;
          } else if (c.type === 'email') {
            updated.href = `mailto:${val}`;
          } else if (c.type === 'phone') {
            updated.href = `tel:${val.replace(/\s/g, '')}`;
          }
        }
        return updated;
      })
    );
  };

  const removeContact = (id) => {
    setEditingContacts(prev => prev.filter(c => c.id !== id));
  };

  const addContact = (type) => {
    const templates = {
      whatsapp: { type: 'whatsapp', label: 'WhatsApp', value: '', href: '', icon: 'whatsapp' },
      email:    { type: 'email',    label: 'Email',    value: '', href: '', icon: 'mail' },
      phone:    { type: 'phone',    label: 'Call',     value: '', href: '', icon: 'phone' },
    };
    setEditingContacts(prev => [
      ...prev,
      { ...templates[type], id: `${type}_${Date.now()}` },
    ]);
  };

  const displayContacts = editMode ? editingContacts : contacts;

  const iconFor = (type) => {
    if (type === 'whatsapp') return <MessageCircle size={15} />;
    if (type === 'email')    return <Mail size={15} />;
    if (type === 'phone')    return <Phone size={15} />;
    return <MessageCircle size={15} />;
  };

  const colorFor = (type) => {
    if (type === 'whatsapp') return { bg: 'rgba(37,211,102,0.12)', border: 'rgba(37,211,102,0.35)', color: '#25d366' };
    if (type === 'email')    return { bg: 'rgba(66,133,244,0.12)', border: 'rgba(66,133,244,0.35)', color: '#4285f4' };
    if (type === 'phone')    return { bg: 'rgba(255,180,0,0.10)',  border: 'rgba(255,180,0,0.30)',  color: '#ffb400' };
    return { bg: 'var(--bg-subtle)', border: 'var(--border)', color: 'var(--text)' };
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 200,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 0, right: 0,
          height: '100vh',
          width: 420,
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--ink)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          animation: 'hunt-slide-in 0.2s ease',
        }}
      >
        <style>{`
          @keyframes hunt-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 4 }}>▲ support</p>
            <p className="hunt-serif" style={{ fontSize: 22, color: 'var(--text)' }}>
              Reach out to us
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Admin edit toggle */}
            {isAdmin && !editMode && (
              <button
                onClick={enterEdit}
                title="Edit support contacts"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px',
                  border: '1px solid var(--border-mid)',
                  background: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                }}
              >
                <Edit3 size={11} /> Edit
              </button>
            )}
            {isAdmin && editMode && (
              <>
                <button
                  onClick={cancelEdit}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 10px',
                    border: '1px solid var(--border-mid)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 10px',
                    border: '1px solid var(--blue)',
                    background: 'var(--blue)',
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: '#fff',
                  }}
                >
                  <Save size={11} /> Save
                </button>
              </>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-dim)', padding: 6,
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* Greeting message */}
          {!editMode && (
            <div style={{
              marginBottom: 24,
              padding: '14px 16px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
            }}>
              <p style={{
                fontSize: 13,
                color: 'var(--text)',
                lineHeight: 1.65,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.02em',
              }}>
                Don't hesitate to reach out — seriously, we're here for you.
                Whether it's a bug, a question, or just feedback, feel free to
                drop us a message anytime. We reply fast. 👋
              </p>
            </div>
          )}

          {/* Contact cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayContacts.map((contact) => {
              const col = colorFor(contact.type);

              if (editMode) {
                return (
                  <div
                    key={contact.id}
                    style={{
                      padding: '12px 14px',
                      border: '1px solid var(--border-mid)',
                      background: 'var(--bg-subtle)',
                      display: 'flex', flexDirection: 'column', gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: col.color }}>{iconFor(contact.type)}</span>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10, textTransform: 'uppercase',
                          letterSpacing: '0.1em', color: 'var(--text-dim)',
                        }}>
                          {contact.label}
                        </span>
                      </div>
                      <button
                        onClick={() => removeContact(contact.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--red)', padding: 2,
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <input
                      value={contact.value}
                      onChange={e => updateContact(contact.id, 'value', e.target.value)}
                      placeholder={
                        contact.type === 'whatsapp' ? '+91 98765 43210' :
                        contact.type === 'email'    ? 'support@hunt.so' :
                        '+91 98765 43210'
                      }
                      className="hunt-input"
                      style={{ fontSize: 12, padding: '8px 10px' }}
                    />
                  </div>
                );
              }

              return (
                <a
                  key={contact.id}
                  href={contact.href}
                  target={contact.type === 'whatsapp' ? '_blank' : undefined}
                  rel={contact.type === 'whatsapp' ? 'noopener noreferrer' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    border: `1px solid ${col.border}`,
                    background: col.bg,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateX(3px)';
                    e.currentTarget.style.boxShadow = `3px 3px 0 0 ${col.color}44`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Icon blob */}
                  <div style={{
                    width: 38, height: 38, flexShrink: 0,
                    background: `${col.color}22`,
                    border: `1px solid ${col.color}55`,
                    display: 'grid', placeItems: 'center',
                    color: col.color,
                  }}>
                    {iconFor(contact.type)}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: col.color, marginBottom: 3,
                    }}>
                      {contact.label}
                    </p>
                    <p style={{
                      fontSize: 13, fontWeight: 600,
                      color: 'var(--text)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {contact.value}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={col.color} strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              );
            })}
          </div>

          {/* Admin: add new contact buttons */}
          {isAdmin && editMode && (
            <div style={{ marginTop: 16 }}>
              <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 10 }}>▲ add contact</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['whatsapp', 'email', 'phone'].map(type => (
                  <button
                    key={type}
                    onClick={() => addContact(type)}
                    style={{
                      flex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '8px 6px',
                      border: '1px dashed var(--border-mid)',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: 'var(--text-dim)',
                      transition: 'border-color 0.12s, color 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--blue)';
                      e.currentTarget.style.color = 'var(--blue)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-mid)';
                      e.currentTarget.style.color = 'var(--text-dim)';
                    }}
                  >
                    <Plus size={10} /> {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          {!editMode && (
            <p style={{
              marginTop: 28,
              fontSize: 10.5,
              color: 'var(--text-dim)',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.04em',
              lineHeight: 1.6,
              textAlign: 'center',
            }}>
              We typically respond within a few hours.
              <br />Your feedback helps us build HUNT better. 🙏
            </p>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
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
  huntScore,        // { score: number, level: string } — passed from parent
  isAdmin = false,  // pass true from admin dashboard to enable edit mode in support
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = collapsedProp ?? internalCollapsed;
  const setCollapsed = setCollapsedProp ?? setInternalCollapsed;

  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [internalShowSettings, setInternalShowSettings] = useState(false);
  const [settingsTabState, setSettingsTabState] = useState('account');
  const accountWrapRef = useRef(null);
  const SIDEBAR_W = collapsed ? 72 : 220;

  const hs = huntScore || { score: 0, level: 'unranked' };

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

  // Opens settings — works self-contained even if parent doesn't wire setShowSettings
  const openSettings = () => {
    setShowAccountMenu(false);
    setConfirmingSignOut(false);
    setInternalShowSettings(true);
    if (typeof setShowSettings === 'function') {
      setShowSettings(true);
    }
  };

  const openSupport = () => {
    setShowAccountMenu(false);
    setConfirmingSignOut(false);
    setShowSupport(true);
  };

  return (
    <>
      <aside
        style={{
          width: `${SIDEBAR_W}px`,
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 300,
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
            <HuntLogo size={18} showWord={false} />
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <HuntLogo size={18} />
                <span
                  className="hunt-mono"
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    color: 'var(--text-dim)',
                    paddingLeft: 2,
                  }}
                >
                  v0.4·BETA
                </span>
              </div>
            </>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 24, height: 24,
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: 'var(--text-dim)', padding: 0, marginLeft: 'auto',
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
                position: 'absolute', top: 14, right: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22,
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: 'var(--text-dim)', padding: 0,
              }}
            >
              <PanelLeftOpen size={12} />
            </button>
          )}
        </div>

        {/* ── Profile snippet + Hunt Score (only when expanded) ── */}
        {!collapsed && studentProfile && (
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {/* Avatar + name row */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 32, height: 32,
                  background: 'var(--ink)', color: 'var(--cream)',
                  display: 'grid', placeItems: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600, fontSize: 12, flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 12.5, fontWeight: 600, color: 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {studentProfile?.full_name}
                </div>
                <div
                  className="hunt-mono"
                  style={{
                    fontSize: 9.5, color: 'var(--text-dim)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {studentProfile?.college || 'Student'}
                </div>
              </div>
            </div>

            {/* ── Hunt Score block ── */}
            <div
              style={{
                width: '100%',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                padding: '9px 12px',
                textAlign: 'left',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 8, boxSizing: 'border-box',
              }}
            >
              <div>
                <span className="hunt-kicker" style={{ display: 'block', marginBottom: 3 }}>
                  ▲ Hunt Score
                </span>
                <span
                  className="hunt-mono"
                  style={{
                    fontSize: 9, color: 'var(--text-dim)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}
                >
                  {huntScoreLabel(hs.level)}
                </span>
              </div>
              <span
                className="hunt-mono"
                style={{
                  fontSize: 22, fontWeight: 700,
                  color: HUNT_SCORE_COLOR,
                  lineHeight: 1, letterSpacing: '-0.02em',
                }}
              >
                {hs.score > 0 ? hs.score : '—'}
              </span>
            </div>
          </div>
        )}

        {/* ── Collapsed: show score number only ── */}
        {collapsed && studentProfile && hs.score > 0 && (
          <div
            title={`Hunt Score: ${hs.score} (${huntScoreLabel(hs.level)})`}
            style={{
              padding: '10px 0',
              borderBottom: '1px solid var(--border-mid)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}
          >
            <span
              className="hunt-mono"
              style={{ fontSize: 7, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              HS
            </span>
            <span
              className="hunt-mono"
              style={{ fontSize: 14, fontWeight: 700, color: HUNT_SCORE_COLOR, lineHeight: 1 }}
            >
              {hs.score}
            </span>
          </div>
        )}

        {/* ── Nav ── */}
        <nav
          style={{
            flex: 1, padding: '8px 0',
            display: 'flex', flexDirection: 'column',
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
                  fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase',
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
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'baseline', marginBottom: 8,
                }}
              >
                <span className="hunt-kicker">applies left</span>
                <span className="hunt-mono" style={{ fontSize: 10, color: 'var(--text)' }}>
                  {remainingApplications}/5
                </span>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={'hunt-apply-pill ' + (i < remainingApplications ? 'used' : 'free')}
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
                  width: 24, height: 4,
                  background: 'var(--border-mid)', overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%', background: 'var(--blue)',
                    width: `${fillPct}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Footer controls ── */}
        <div style={{ borderTop: '1px solid var(--border-mid)' }}>
          <div style={{ display: 'flex' }}>
            <button
              onClick={() => setShowNotifications(p => !p)}
              title={collapsed ? 'Notifications' : undefined}
              aria-label="Notifications"
              style={{
                flex: 1, padding: '14px 0', display: 'grid', placeItems: 'center',
                background: notifications.length > 0 && !showNotifications
                  ? 'rgba(192,57,43,0.07)'
                  : showNotifications ? 'var(--bg-subtle)' : 'transparent',
                border: 'none',
                borderRight: '1px solid var(--border-mid)',
                cursor: 'pointer',
                color: notifications.length > 0 ? 'var(--red)' : 'var(--text-dim)',
                position: 'relative',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <Bell size={14} />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute', top: 9,
                  right: collapsed ? 16 : '32%',
                  width: 7, height: 7,
                  background: 'var(--red)',
                  animation: 'hunt-notif-pulse 1.4s ease-in-out infinite',
                }} />
              )}
            </button>
            <style>{`
              @keyframes hunt-notif-pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50%       { opacity: 0.35; transform: scale(0.55); }
              }
            `}</style>
            <button
              onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
              title={collapsed ? (theme === 'light' ? 'Dark mode' : 'Light mode') : undefined}
              aria-label="Toggle theme"
              style={{
                flex: 1, padding: '14px 0', display: 'grid', placeItems: 'center',
                background: 'transparent', border: 'none', cursor: 'pointer',
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
                  width: 26, height: 26, flexShrink: 0,
                  background: 'var(--blue-tint)',
                  border: '1px solid var(--blue)',
                  display: 'grid', placeItems: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, fontWeight: 700, color: 'var(--blue-deep)',
                }}
              >
                {initials}
              </div>
              {!collapsed && (
                <>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <p style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--text)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {studentProfile?.full_name}
                    </p>
                    <p className="hunt-mono" style={{
                      fontSize: 9, color: 'var(--text-dim)',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                      student
                    </p>
                  </div>
                  <svg
                    width="10" height="10" viewBox="0 0 24 24"
                    fill="none" stroke="var(--text-dim)" strokeWidth="2"
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
                  zIndex: 1000,
                }}
              >
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-mid)' }}>
                  <p className="hunt-kicker" style={{ marginBottom: 2 }}>Signed in as</p>
                  <p className="hunt-mono" style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--blue)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {studentProfile?.email || studentProfile?.full_name}
                  </p>
                </div>

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
                      // ← Fixed: uses openSettings() which safely calls setShowSettings
                      action: openSettings,
                    },
                    {
                      label: 'Support',
                      icon: LifeBuoy,
                      // ← Fixed: opens our custom support panel instead of mailto
                      action: openSupport,
                    },
                  ].map(({ label, icon: Icon, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', textAlign: 'left', padding: '9px 10px',
                        fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: 'var(--text-mid)', background: 'none', border: 'none', cursor: 'pointer',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Icon size={13} style={{ color: 'var(--text-dim)' }} />
                      {label}
                    </button>
                  ))}
                </div>

                <div style={{
                  height: 8, background: 'var(--bg-subtle)',
                  borderTop: '1px solid var(--border-mid)',
                  borderBottom: '1px solid var(--border-mid)',
                }} />

                <div style={{ padding: 6 }}>
                  {!confirmingSignOut ? (
                    <button
                      onClick={() => setConfirmingSignOut(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', textAlign: 'left', padding: '9px 10px',
                        fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500,
                        color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-tint)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LogOut size={13} />
                      Sign out
                    </button>
                  ) : (
                    <div style={{ padding: '6px 4px' }}>
                      <p style={{ fontSize: 11, color: 'var(--text-mid)', marginBottom: 8, padding: '0 6px' }}>
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
                          style={{ flex: 1, background: 'var(--red)', color: '#fff', borderColor: 'var(--red)' }}
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

      {/* ── Support Panel (rendered outside aside so it overlays correctly) ── */}
      {showSupport && (
        <SupportPanel
          onClose={() => setShowSupport(false)}
          isAdmin={isAdmin}
        />
      )}

      {/* ── Settings Panel (self-contained — no parent wiring needed) ── */}
      {internalShowSettings && (
        <SettingsPanel
          onClose={() => {
            setInternalShowSettings(false);
            if (typeof setShowSettings === 'function') setShowSettings(false);
          }}
          settingsTab={settingsTabState}
          setSettingsTab={setSettingsTabState}
          studentProfile={studentProfile}
          initials={initials}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </>
  );
}
