// src/components/StudentDashboard/layout/NotificationFlyout.jsx
// Reads from Supabase `notifications` table with realtime updates.
// Props:
//   studentId      — current student's UUID (for per-student read tracking)
//   onClose        — close handler
//   onUnreadChange — (count: number) => void  ← drives the red dot on bell

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Info, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import { supabase } from '../../services/supabase';

const TYPE_META = {
  info:    { icon: Info,         color: 'var(--blue)'  },
  success: { icon: CheckCircle2, color: 'var(--green)' },
  warning: { icon: AlertCircle,  color: 'var(--amber)' },
  alert:   { icon: Star,         color: 'var(--red)'   },
};

export function NotificationFlyout({ studentId, onClose, onUnreadChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setNotifications(data);
      const unread = data.filter(n => !(n.read_by || []).includes(studentId)).length;
      onUnreadChange?.(unread);
    }
    setLoading(false);
  }, [studentId, onUnreadChange]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Realtime ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('notif_flyout')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications(prev => {
          let next;
          if (payload.eventType === 'INSERT') next = [payload.new, ...prev];
          else if (payload.eventType === 'DELETE') next = prev.filter(n => n.id !== payload.old.id);
          else next = prev.map(n => n.id === payload.new.id ? payload.new : n);
          const unread = next.filter(n => !(n.read_by || []).includes(studentId)).length;
          onUnreadChange?.(unread);
          return next;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [studentId, onUnreadChange]);

  // ── Mark one read ─────────────────────────────────────────────────────────
  const markRead = useCallback(async (notif) => {
    if (!studentId || (notif.read_by || []).includes(studentId)) return;
    const updated = [...(notif.read_by || []), studentId];
    await supabase.from('notifications').update({ read_by: updated }).eq('id', notif.id);
    setNotifications(prev => {
      const next = prev.map(n => n.id === notif.id ? { ...n, read_by: updated } : n);
      onUnreadChange?.(next.filter(n => !(n.read_by || []).includes(studentId)).length);
      return next;
    });
  }, [studentId, onUnreadChange]);

  // ── Mark all read ─────────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    if (!studentId) return;
    const unread = notifications.filter(n => !(n.read_by || []).includes(studentId));
    await Promise.all(
      unread.map(n =>
        supabase.from('notifications')
          .update({ read_by: [...(n.read_by || []), studentId] })
          .eq('id', n.id)
      )
    );
    setNotifications(prev =>
      prev.map(n => ({
        ...n,
        read_by: (n.read_by || []).includes(studentId)
          ? n.read_by
          : [...(n.read_by || []), studentId],
      }))
    );
    onUnreadChange?.(0);
  }, [notifications, studentId, onUnreadChange]);

  const unreadCount = notifications.filter(n => !(n.read_by || []).includes(studentId)).length;

  const fmt = (d) => {
    if (!d) return '';
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.18)' }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: 380, height: '100vh',
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-mid)',
        zIndex: 100,
        display: 'flex', flexDirection: 'column',
        animation: 'hunt-slide-in-right 0.18s ease',
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--border-mid)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={14} style={{ color: 'var(--text-dim)' }} />
            <p className="hunt-kicker hunt-kicker-ink" style={{ margin: 0 }}>▲ notifications</p>
            {unreadCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 18, height: 18, background: 'var(--red)', color: '#fff',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, fontWeight: 700, padding: '0 4px',
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {unreadCount > 0 && (
              <span className="hunt-mono" onClick={markAllRead} style={{
                fontSize: 9.5, color: 'var(--text-dim)', cursor: 'pointer',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                textDecoration: 'underline', textDecorationStyle: 'dotted',
              }}>
                Mark all read
              </span>
            )}
            <button onClick={onClose} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 26, background: 'transparent',
              border: '1px solid var(--border-mid)', cursor: 'pointer',
              color: 'var(--text-dim)', padding: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <p className="hunt-mono" style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Loading…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <Bell size={28} style={{ color: 'var(--text-dim)', opacity: 0.4 }} />
              <p className="hunt-serif" style={{ fontSize: 20, color: 'var(--text)', margin: 0 }}>All clear.</p>
              <p className="hunt-mono" style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                no notifications right now
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = (n.read_by || []).includes(studentId);
              const meta = TYPE_META[n.type] || TYPE_META.info;
              const Icon = meta.icon;
              return (
                <div key={n.id} onClick={() => markRead(n)} style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  cursor: 'pointer', transition: 'background 0.1s',
                  background: isRead ? 'transparent' : 'var(--bg-subtle)',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = isRead ? 'transparent' : 'var(--bg-subtle)'}
                >
                  {/* Type icon */}
                  <div style={{
                    width: 28, height: 28, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: meta.color + '18',
                  }}>
                    <Icon size={13} style={{ color: meta.color }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 12.5, margin: '0 0 3px', lineHeight: 1.4,
                      color: isRead ? 'var(--text-mid)' : 'var(--text)',
                      fontWeight: isRead ? 400 : 600,
                    }}>
                      {n.title}
                    </p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-dim)', margin: '0 0 5px', lineHeight: 1.45 }}>
                      {n.body}
                    </p>
                    <p className="hunt-mono" style={{ fontSize: 9.5, color: 'var(--text-dim)', letterSpacing: '0.06em', margin: 0 }}>
                      {fmt(n.created_at)}
                    </p>
                  </div>

                  {/* Unread square dot */}
                  {!isRead && (
                    <div style={{ width: 7, height: 7, background: 'var(--red)', flexShrink: 0, marginTop: 5 }} />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-mid)', flexShrink: 0 }}>
          <p className="hunt-mono" style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, textAlign: 'center' }}>
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
