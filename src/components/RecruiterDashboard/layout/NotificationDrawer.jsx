import React, { useState, useEffect } from 'react';
import {
  Plus, LogOut, Sun, Moon, X, ChevronRight,
  MapPin, Users, Link2, Trash2,
  ArrowLeft, Pause, Play, ExternalLink, Github, Building2, Home,
  Layers, UserCheck, GitBranch, Sparkles,
  Bookmark, ThumbsDown, Phone, Award, Bell, Lock, MessageSquare,
  LayoutGrid, List, Edit2, Camera, Image as ImageIcon, ChevronDown,
  CheckCircle, Clock, AlertCircle, Eye, AlertTriangle, Star,
} from 'lucide-react';
import { supabase } from '../../../services/supabase';
import { iconBtn } from '../shared/ui';

export function NotificationDrawer({ open, onClose, recruiter }) {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    if (!open || !recruiter) return;
    const fetchNotifs = async () => {
      setLoadingNotifs(true);
      try {
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id, role')
          .eq('recruiter_id', recruiter.id);

        if (!jobs?.length) { setNotifications([]); return; }
        const jobIds = jobs.map(j => j.id);
        const jobMap = Object.fromEntries(jobs.map(j => [j.id, j.role]));

        const { data: apps } = await supabase
          .from('applications')
          .select('id, job_id, status, created_at, match_score, students(full_name)')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false })
          .limit(20);

        const notifs = (apps || []).map(a => {
          const studentName = a.students?.full_name || 'A candidate';
          const roleName = jobMap[a.job_id] || 'a role';
          const score = a.match_score ? ` with ${a.match_score}% match` : '';
          const isNew = a.status === 'pending';
          const statusLabels = {
            shortlisted: { title: 'Candidate shortlisted', body: `${studentName} was shortlisted for ${roleName}.`, type: 'success' },
            interview:   { title: 'Interview scheduled',    body: `${studentName} moved to interview for ${roleName}.`, type: 'alert' },
            hired:       { title: 'Hire made 🎉',           body: `${studentName} was hired for ${roleName}!`, type: 'success' },
            pending:     { title: 'New application',        body: `${studentName} applied to ${roleName}${score}.`, type: 'success' },
          };
          const meta = statusLabels[a.status] || statusLabels.pending;
          const createdAt = new Date(a.created_at);
          const now = new Date();
          const diffMs = now - createdAt;
          const diffMins = Math.floor(diffMs / 60000);
          const timeStr = diffMins < 60 ? `${diffMins}m ago` :
            diffMins < 1440 ? `${Math.floor(diffMins / 60)}h ago` :
            `${Math.floor(diffMins / 1440)}d ago`;
          return { id: a.id, type: meta.type, read: !isNew, title: meta.title, body: meta.body, time: timeStr };
        });
        setNotifications(notifs);
      } catch (e) {
        console.warn('Notifications fetch failed:', e);
        setNotifications([]);
      } finally {
        setLoadingNotifs(false);
      }
    };
    fetchNotifs();
  }, [open, recruiter]);

  const iconForType = (type) => {
    if (type === 'success') return <UserCheck size={14} />;
    if (type === 'alert')   return <AlertCircle size={14} />;
    return <CheckCircle size={14} />;
  };

  const typeColor = { success: 'var(--green)', alert: 'var(--amber)', info: 'var(--blue)' };
  const typeTint  = { success: 'var(--green-tint)', alert: 'var(--amber-tint)', info: 'var(--blue-tint)' };
  const unread = notifications.filter(n => !n.read).length;

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 8998, backdropFilter: 'blur(1px)' }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
        zIndex: 8999, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '-8px 0 40px rgba(0,0,0,0.1)' : 'none',
      }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
              Notifications
              {unread > 0 && (
                <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 7px', borderRadius: 10, background: 'var(--green)', color: '#fff', fontWeight: 600 }}>{unread}</span>
              )}
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '2px 0 0' }}>Updates about your roles and candidates</p>
          </div>
          <button onClick={onClose} style={{ ...iconBtn, width: 30, height: 30, padding: 0, justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {loadingNotifs ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ width: 20, height: 20, border: '2px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Loading notifications…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Bell size={28} style={{ color: 'var(--text-dim)', marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No activity yet</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>Applications and status updates will appear here.</p>
            </div>
          ) : notifications.map(n => (
            <div key={n.id} style={{
              display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10,
              background: n.read ? 'transparent' : typeTint[n.type] || 'var(--bg-subtle)',
              border: `1px solid ${n.read ? 'var(--border)' : (typeColor[n.type] || 'var(--border)')}`,
              marginBottom: 8, opacity: n.read ? 0.7 : 1, transition: 'all 0.15s',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: typeColor[n.type] ? `${typeTint[n.type]}` : 'var(--bg-subtle)',
                border: `1px solid ${typeColor[n.type] || 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: typeColor[n.type] || 'var(--text-dim)',
              }}>
                {iconForType(n.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: n.read ? 400 : 600, color: 'var(--text)', margin: 0, marginBottom: 3, lineHeight: 1.3 }}>{n.title}</p>
                <p style={{ fontSize: 11, color: 'var(--text-mid)', margin: 0, lineHeight: 1.5 }}>{n.body}</p>
                <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={9} /> {n.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button style={{ width: '100%', padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. POST ROLE DRAWER
