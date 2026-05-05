// src/components/RecruiterDashboard.jsx
// HUNT — RECRUITER DASHBOARD (v7 — all 11 updates)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, LogOut, Sun, Moon, X, ChevronRight,
  MapPin, Users, Link2, Trash2,
  ArrowLeft, Pause, Play, ExternalLink, Github, Building2, Home,
  Layers, UserCheck, GitBranch, Sparkles,
  Bookmark, ThumbsDown, Phone, Award, Bell, Lock, MessageSquare,
  LayoutGrid, List, Edit2, Camera, Image as ImageIcon, ChevronDown,
  CheckCircle, Clock, AlertCircle, Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOut } from '../services/supabase';

// ═══════════════════════════════════════════════════════════════════════════
// 1. DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════
const tokens = {
  light: {
    '--bg':          '#FAFAF8',
    '--bg-card':     '#FFFFFF',
    '--bg-subtle':   '#F5F5F2',
    '--bg-hover':    '#F0EFEA',
    '--border':      '#EBEBEA',
    '--border-mid':  '#D6D6D3',
    '--text':        '#0A0A0A',
    '--text-mid':    '#5A5A56',
    '--text-dim':    '#9B9B97',
    '--green':       '#1A7A4A',
    '--green-tint':  '#E8F5EE',
    '--green-text':  '#1A7A4A',
    '--red':         '#C0392B',
    '--red-tint':    '#FDECEA',
    '--amber':       '#92600A',
    '--amber-tint':  '#FDF3E3',
    '--blue':        '#2563EB',
    '--blue-tint':   'rgba(37,99,235,0.08)',
    '--purple':      '#7C3AED',
    '--purple-tint': 'rgba(124,58,237,0.08)',
    '--ink':         '#0A0A0A',
    '--cream':       '#FAFAF8',
  },
  dark: {
    '--bg':          '#0A0A0A',
    '--bg-card':     '#111110',
    '--bg-subtle':   '#1A1A18',
    '--bg-hover':    '#222220',
    '--border':      '#2A2A28',
    '--border-mid':  '#3A3A38',
    '--text':        '#FAFAF8',
    '--text-mid':    '#9B9B97',
    '--text-dim':    '#5A5A56',
    '--green':       '#2EAD6A',
    '--green-tint':  '#0D2B1A',
    '--green-text':  '#2EAD6A',
    '--red':         '#E05C4B',
    '--red-tint':    '#2B1210',
    '--amber':       '#D4A84B',
    '--amber-tint':  '#2B2010',
    '--blue':        '#60A5FA',
    '--blue-tint':   'rgba(96,165,250,0.1)',
    '--purple':      '#A78BFA',
    '--purple-tint': 'rgba(167,139,250,0.12)',
    '--ink':         '#FAFAF8',
    '--cream':       '#0A0A0A',
  },
};
const applyTokens = (theme) =>
  Object.entries(tokens[theme]).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v));

// ═══════════════════════════════════════════════════════════════════════════
// 2. SUPABASE HELPERS
// ═══════════════════════════════════════════════════════════════════════════
function cleanPatch(patch, { drop = [] } = {}) {
  const out = {};
  for (const [k, v] of Object.entries(patch)) {
    if (drop.includes(k)) continue;
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    out[k] = v;
  }
  return out;
}

async function getRecruiterProfile() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('recruiters')
    .select('*, startups(*)')
    .eq('auth_id', user.id)
    .maybeSingle();
  if (error) throw new Error(error.message || 'Failed to load recruiter');
  return data;
}

async function getRecruiterJobs(recruiterId) {
  const { data, error } = await supabase
    .from('jobs').select('*').eq('recruiter_id', recruiterId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function createJob(jobData) {
  const safe = cleanPatch(jobData);
  const { data, error } = await supabase.from('jobs').insert([safe]).select().single();
  if (error) throw new Error(error.message || 'Failed to create job');
  return data;
}

async function updateJob(jobId, patch) {
  const safe = cleanPatch(patch);
  const { data, error } = await supabase.from('jobs').update(safe).eq('id', jobId).select().single();
  if (error) throw new Error(error.message || 'Update failed');
  return data;
}

async function deleteJob(jobId) {
  const { error } = await supabase.from('jobs').delete().eq('id', jobId);
  if (error) throw error;
}

async function getJobApplications(jobId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, students(*)')
    .eq('job_id', jobId)
    .order('match_score', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getAllApplicationsForRecruiter(recruiterId) {
  const { data: jobs, error: jobsErr } = await supabase
    .from('jobs').select('id, role, logo, company, logo_url').eq('recruiter_id', recruiterId);
  if (jobsErr) throw jobsErr;
  if (!jobs?.length) return [];
  const jobIds = jobs.map(j => j.id);
  const jobLookup = Object.fromEntries(jobs.map(j => [j.id, j]));
  const { data: apps, error: appsErr } = await supabase
    .from('applications').select('*, students(*)').in('job_id', jobIds)
    .order('match_score', { ascending: false });
  if (appsErr) throw appsErr;
  return (apps || []).map(a => ({ ...a, jobs: jobLookup[a.job_id] }));
}

const NOTIF_META = {
  shortlisted: {
    type:  'success',
    title: (role, company) => `Shortlisted by ${company}`,
    body:  (role, company) => `You're in their top picks for ${role}.`,
  },
  interview: {
    type:  'alert',
    title: (role, company) => `Interview invite — ${company}`,
    body:  (role, company) => `${company} wants to interview you for ${role}.`,
  },
  hired: {
    type:  'success',
    title: (role, company) => `Offer from ${company} 🎉`,
    body:  (role, company) => `You received an offer for ${role}.`,
  },
  rejected: {
    type:  'info',
    title: (role, company) => `Application update — ${company}`,
    body:  (role, company) => `${company} has made a decision on your ${role} application.`,
  },
};

async function updateApplicationStatus(appId, status, studentId, recruiterMessage, jobMeta = {}) {
  const patch = { status };
  if (status === 'shortlisted') patch.shortlisted_at = new Date().toISOString();
  if (status === 'interview')   patch.interviewed_at = new Date().toISOString();
  if (status === 'hired')       patch.hired_at       = new Date().toISOString();
  if (recruiterMessage?.trim()) patch.recruiter_message = recruiterMessage.trim();

  const { data, error } = await supabase
    .from('applications').update(patch).eq('id', appId).select().single();
  if (error) throw new Error(error.message || 'Status update failed');

  if (studentId && NOTIF_META[status]) {
    const nm = NOTIF_META[status];
    const { role = 'the role', company = 'a recruiter' } = jobMeta;
    try {
      await supabase.from('notifications').insert({
        student_id:     studentId,
        application_id: appId,
        type:           nm.type,
        title:          nm.title(role, company),
        body:           recruiterMessage?.trim() || nm.body(role, company),
        read_by:        [],
        created_at:     new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Notification insert failed (non-fatal):', e);
    }
  }

  return data;
}

async function updateStartupProfile(startupId, patch) {
  const safe = cleanPatch(patch);
  if (safe.founded_year !== undefined) {
    const n = parseInt(safe.founded_year, 10);
    if (Number.isNaN(n)) delete safe.founded_year;
    else safe.founded_year = n;
  }
  const { data, error } = await supabase
    .from('startups').update(safe).eq('id', startupId).select().single();
  if (error) throw new Error(error.message || 'Update failed');
  return data;
}

async function updateRecruiterProfile(recruiterId, patch) {
  const safe = cleanPatch(patch, { drop: ['email'] });
  const { data, error } = await supabase
    .from('recruiters').update(safe).eq('id', recruiterId).select().single();
  if (error) throw new Error(error.message || 'Update failed');
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const SKILL_OPTIONS = [
  'JavaScript','Python','Java','TypeScript','React','Next.js','Node.js',
  'Express.js','Django','FastAPI','Flask','REST API','GraphQL',
  'PostgreSQL','MongoDB','MySQL','Redis','Firebase',
  'Machine Learning','TensorFlow','PyTorch','Pandas',
  'Docker','AWS','CI/CD','Linux','Git','Figma','React Native','Flutter',
  'SQL','C / C++','Golang',
];

// NAV — Network removed (change #11)
const NAV_ITEMS = [
  { id: 'home',    label: 'Home',     icon: Home },
  { id: 'roles',   label: 'Roles',    icon: Layers },
  { id: 'hiring',  label: 'Pipeline', icon: GitBranch },
  { id: 'profile', label: 'Profile',  icon: Building2 },
];

const STATUS_META = {
  pending:     { label: 'Pending',     color: 'var(--text-dim)',   bg: 'var(--bg-subtle)',   border: 'var(--border)' },
  shortlisted: { label: 'Shortlisted', color: 'var(--green-text)', bg: 'var(--green-tint)',  border: 'var(--green)' },
  interview:   { label: 'Interview',   color: 'var(--blue)',       bg: 'var(--blue-tint)',   border: 'var(--blue)' },
  hired:       { label: 'Hired',       color: 'var(--purple)',     bg: 'var(--purple-tint)', border: 'var(--purple)' },
  rejected:    { label: 'Passed',      color: 'var(--red)',        bg: 'var(--red-tint)',    border: 'var(--red)' },
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. ATOMS
// ═══════════════════════════════════════════════════════════════════════════
const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-subtle)',
  color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
};
function FocusInput({ style, ...props }) {
  return <input {...props} style={{ ...inp, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--text)'}
    onBlur={e  => e.target.style.borderColor = 'var(--border)'} />;
}
function FocusSelect({ style, children, ...props }) {
  return <select {...props} style={{ ...inp, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--text)'}
    onBlur={e  => e.target.style.borderColor = 'var(--border)'}>{children}</select>;
}
function FocusTextarea({ style, ...props }) {
  return <textarea {...props} style={{ ...inp, resize: 'vertical', minHeight: 70, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--text)'}
    onBlur={e  => e.target.style.borderColor = 'var(--border)'} />;
}
function Label({ children, required }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
      {children}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
    </p>
  );
}
function Toast({ msg, type }) {
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 500,
      background: type === 'error' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)',
      color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: 'fadeDown 0.2s ease',
      maxWidth: '90vw', textAlign: 'center',
    }}>{msg}</div>
  );
}
function Avatar({ name, avatarUrl, size = 36 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={name} style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
        border: '1px solid var(--border)',
      }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--green-tint)', border: `1px solid var(--green)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 700, color: 'var(--green)', flexShrink: 0,
    }}>{initials}</div>
  );
}

// Company logo — real image or fallback initials (change #7)
function CompanyLogo({ name, logoUrl, size = 40 }) {
  const initials = (name || '').slice(0, 2).toUpperCase() || '?';
  if (logoUrl) {
    return (
      <img src={logoUrl} alt={name} style={{
        width: size, height: size, borderRadius: 8, objectFit: 'cover', flexShrink: 0,
        border: '1px solid var(--border)',
      }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: 'var(--bg-subtle)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 700, color: 'var(--text-mid)',
      fontFamily: 'inherit', letterSpacing: '0.04em',
    }}>{initials}</div>
  );
}

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{
      fontSize: 9, padding: '3px 8px', borderRadius: 8, fontWeight: 500,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>{m.label}</span>
  );
}
function EmptyState({ icon = '🎯', title, message, cta }) {
  return (
    <div style={{
      textAlign: 'center', padding: '64px 24px',
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
    }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
      <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', marginBottom: 6, fontWeight: 400 }}>{title}</p>
      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: cta ? 18 : 0, lineHeight: 1.5 }}>{message}</p>
      {cta}
    </div>
  );
}
function ScoreNumber({ score, size = 16 }) {
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
  return <span style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: size, color, lineHeight: 1, fontWeight: 400 }}>{score}%</span>;
}

// Hunt Score badge (change #6)
function HuntScoreBadge({ score }) {
  if (!score && score !== 0) return null;
  const level = score >= 80 ? 'elite' : score >= 60 ? 'strong' : score >= 40 ? 'building' : 'starter';
  const colors = { elite: 'var(--purple)', strong: 'var(--blue)', building: 'var(--amber)', starter: 'var(--text-dim)' };
  const tints = { elite: 'var(--purple-tint)', strong: 'var(--blue-tint)', building: 'var(--amber-tint)', starter: 'var(--bg-subtle)' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
      borderRadius: 6, background: tints[level], border: `1px solid ${colors[level]}`,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: colors[level], textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hunt</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: colors[level] }}>{score}</span>
    </div>
  );
}

function btnPrimary(disabled) {
  return {
    padding: '10px 16px', borderRadius: 8, border: 'none',
    background: disabled ? 'var(--text-dim)' : 'var(--text)', color: 'var(--bg)',
    fontSize: 12, fontWeight: 500, cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'opacity 0.15s',
  };
}
function btnGhost() {
  return {
    padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text-mid)',
    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'border-color 0.15s, color 0.15s',
  };
}
function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>{eyebrow}</p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 8, lineHeight: 1.5, maxWidth: 560 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0, marginTop: 4 }}>{action}</div>}
    </div>
  );
}
function SubTabStrip({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 22 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '10px 18px', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
          background: 'transparent', border: 'none',
          borderBottom: `2px solid ${active === t.id ? 'var(--text)' : 'transparent'}`,
          color: active === t.id ? 'var(--text)' : 'var(--text-dim)',
          fontWeight: active === t.id ? 600 : 400, marginBottom: -1,
          transition: 'color 0.15s, border-color 0.15s', whiteSpace: 'nowrap',
        }}>{t.label}</button>
      ))}
    </div>
  );
}
const linkChip = {
  display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-mid)',
  padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', textDecoration: 'none',
};
const iconBtn = {
  padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  transition: 'border-color 0.15s, color 0.15s',
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. NOTIFICATION DRAWER (change #9)
// ═══════════════════════════════════════════════════════════════════════════
function NotificationDrawer({ open, onClose, recruiter }) {
  // Mock notifications — in production fetch from DB
  const [notifications] = useState([
    {
      id: 1, type: 'success', read: false,
      title: 'New application received',
      body: 'Priya Sharma applied to Backend Engineering Intern with 91% match.',
      time: '2 min ago',
      icon: <UserCheck size={14} />,
    },
    {
      id: 2, type: 'alert', read: false,
      title: 'Role almost full',
      body: 'Frontend Developer role has 45/50 applicants. Consider closing soon.',
      time: '1 hr ago',
      icon: <AlertCircle size={14} />,
    },
    {
      id: 3, type: 'success', read: true,
      title: 'Candidate shortlisted',
      body: 'You shortlisted Rahul Mehta for Full Stack Developer role.',
      time: '3 hrs ago',
      icon: <Bookmark size={14} />,
    },
    {
      id: 4, type: 'info', read: true,
      title: 'Weekly summary',
      body: '12 new applicants this week. 3 interviews scheduled. 1 hire made.',
      time: '1 day ago',
      icon: <CheckCircle size={14} />,
    },
    {
      id: 5, type: 'success', read: true,
      title: 'New application received',
      body: 'Arjun Singh applied to DevOps Intern with 78% match.',
      time: '2 days ago',
      icon: <UserCheck size={14} />,
    },
  ]);

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
        {/* Header */}
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

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Bell size={28} style={{ color: 'var(--text-dim)', marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No notifications yet</p>
            </div>
          ) : notifications.map(n => (
            <div key={n.id} style={{
              display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10,
              background: n.read ? 'transparent' : typeTint[n.type] || 'var(--bg-subtle)',
              border: `1px solid ${n.read ? 'var(--border)' : (typeColor[n.type] || 'var(--border)')}`,
              marginBottom: 8, opacity: n.read ? 0.7 : 1,
              transition: 'all 0.15s',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: typeColor[n.type] ? `${typeTint[n.type]}` : 'var(--bg-subtle)',
                border: `1px solid ${typeColor[n.type] || 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: typeColor[n.type] || 'var(--text-dim)',
              }}>
                {n.icon}
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

        {/* Footer */}
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
// 6. POST ROLE DRAWER (updated with logo upload, change #7)
// ═══════════════════════════════════════════════════════════════════════════
function PostRoleDrawer({ recruiter, open, onClose, onSuccess, showToast, editJob }) {
  const [skillInput, setSkillInput]   = useState('');
  const [niceInput, setNiceInput]     = useState('');
  const [saving, setSaving]           = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoInputRef = useRef(null);

  const defaultForm = () => ({
    logo_url: recruiter?.startups?.logo_url || '',
    role: '', description: '', stipend: '', duration: '',
    location: '', type: 'Paid Internship', visibility: 'public',
    required_skills: [], nice_to_have: [],
    max_applicants: 50, minimum_match_threshold: 50, positions: 1,
    whatYoullDo: [], perks: [], sections: [],
  });

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!open) {
      setForm(defaultForm());
      setLogoPreview(null);
    } else if (editJob) {
      // Pre-fill for edit
      setForm({
        logo_url: editJob.logo_url || '',
        role: editJob.role || '',
        description: editJob.description || '',
        stipend: editJob.stipend || '',
        duration: editJob.duration || '',
        location: editJob.location || '',
        type: editJob.type || 'Paid Internship',
        visibility: editJob.visibility || 'public',
        required_skills: editJob.required_skills || [],
        nice_to_have: editJob.nice_to_have || [],
        max_applicants: editJob.max_applicants || 50,
        minimum_match_threshold: editJob.minimum_match_threshold || 50,
        positions: editJob.positions || 1,
        whatYoullDo: editJob.what_youll_do || [],
        perks: editJob.perks || [],
        sections: editJob.sections || [],
      });
      setLogoPreview(editJob.logo_url || null);
    }
  }, [open]);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target.result);
      setForm(f => ({ ...f, logo_url: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    const name = skillInput.trim();
    if (!name || form.required_skills.find(s => s.name.toLowerCase() === name.toLowerCase())) return;
    setForm(f => ({ ...f, required_skills: [...f.required_skills, { name, weight: 0.25, level: 3 }] }));
    setSkillInput('');
  };
  const removeSkill = (name) => setForm(f => ({ ...f, required_skills: f.required_skills.filter(s => s.name !== name) }));
  const addNice = () => {
    const name = niceInput.trim();
    if (!name || form.nice_to_have.includes(name)) return;
    setForm(f => ({ ...f, nice_to_have: [...f.nice_to_have, name] }));
    setNiceInput('');
  };

  const handleSubmit = async () => {
    if (!form.role.trim())     return showToast('Role title is required.', 'error');
    if (!form.stipend.trim())  return showToast('Stipend is required.', 'error');
    if (!form.duration.trim()) return showToast('Duration is required.', 'error');
    if (!form.location.trim()) return showToast('Location is required.', 'error');
    if (form.required_skills.length === 0) return showToast('Add at least one required skill.', 'error');
    setSaving(true);
    try {
      const totalW = form.required_skills.reduce((s, sk) => s + sk.weight, 0);
      const normSkills = form.required_skills.map(sk => ({ ...sk, weight: parseFloat((sk.weight / totalW).toFixed(3)) }));
      const startupName = recruiter.startups?.name || recruiter.company_name || 'Company';
      if (editJob) {
        await updateJob(editJob.id, {
          logo_url: form.logo_url, role: form.role.trim(),
          description: form.description.trim(), stipend: form.stipend.trim(),
          duration: form.duration.trim(), location: form.location.trim(),
          type: form.type, visibility: form.visibility,
          required_skills: normSkills, nice_to_have: form.nice_to_have,
          max_applicants: form.max_applicants,
          minimum_match_threshold: form.minimum_match_threshold,
          positions: form.positions, what_youll_do: form.whatYoullDo,
          perks: form.perks, sections: form.sections,
        });
      } else {
        const slug = `${startupName.toLowerCase().replace(/\s+/g, '-')}-${form.role.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        await createJob({
          recruiter_id: recruiter.id, company: startupName,
          logo_url: form.logo_url, role: form.role.trim(),
          description: form.description.trim(), stipend: form.stipend.trim(),
          duration: form.duration.trim(), location: form.location.trim(),
          type: form.type, visibility: form.visibility, share_slug: slug,
          required_skills: normSkills, nice_to_have: form.nice_to_have,
          max_applicants: form.max_applicants,
          minimum_match_threshold: form.minimum_match_threshold,
          positions: form.positions, current_applicants: 0, is_active: true, status: 'live',
          what_youll_do: form.whatYoullDo, perks: form.perks, sections: form.sections,
        });
      }
      onSuccess();
      onClose();
    } catch (e) { showToast('Failed: ' + (e.message || 'Unknown error'), 'error'); }
    finally     { setSaving(false); }
  };

  const chipBtn = (active) => ({
    flex: 1, padding: '8px', borderRadius: 8, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
    background: active ? 'var(--bg-subtle)' : 'transparent',
    border: `1px solid ${active ? 'var(--text)' : 'var(--border)'}`,
    color: active ? 'var(--text)' : 'var(--text-mid)',
    fontWeight: active ? 600 : 400,
  });

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9000, backdropFilter: 'blur(2px)' }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 520,
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
        zIndex: 9001, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '-8px 0 40px rgba(0,0,0,0.12)' : 'none',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0, marginBottom: 4 }}>{editJob ? 'Edit role' : 'Post a role'}</p>
            <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, fontWeight: 400, color: 'var(--text)', margin: 0 }}>{editJob ? <>Edit <em>{editJob.role}</em></> : <>Hire your next <em>intern.</em></>}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Logo upload — real image (change #7) */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0 }}>
                <Label>Company Logo</Label>
                <div style={{ position: 'relative', width: 72, height: 72 }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' }} />
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: 12, background: 'var(--bg-subtle)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                      <ImageIcon size={20} style={{ color: 'var(--text-dim)' }} />
                      <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>Logo</span>
                    </div>
                  )}
                  <label style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: '50%', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)' }}>
                    <Camera size={11} style={{ color: 'var(--bg)' }} />
                    <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                  </label>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <Label required>Role title</Label>
                <FocusInput value={form.role} onChange={e => set('role')(e.target.value)} placeholder="Backend Engineering Intern" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><Label required>Stipend</Label><FocusInput value={form.stipend} onChange={e => set('stipend')(e.target.value)} placeholder="₹25,000/month" /></div>
              <div><Label required>Duration</Label><FocusInput value={form.duration} onChange={e => set('duration')(e.target.value)} placeholder="3 / 6 months" /></div>
              <div><Label required>Location</Label><FocusInput value={form.location} onChange={e => set('location')(e.target.value)} placeholder="Remote / Mumbai" /></div>
              <div><Label>Type</Label>
                <FocusSelect value={form.type} onChange={e => set('type')(e.target.value)}>
                  <option>Paid Internship</option><option>Unpaid Internship</option>
                  <option>Contract</option><option>Part-time</option>
                </FocusSelect>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <FocusTextarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3} placeholder="What will the intern actually work on?" />
            </div>

            {/* Required skills */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Skills & config</p>
              <Label required>Required skills</Label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <FocusInput value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="React, Node.js, Python…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} list="skill-suggestions-drawer" style={{ flex: 1 }} />
                <datalist id="skill-suggestions-drawer">{SKILL_OPTIONS.map(s => <option key={s} value={s} />)}</datalist>
                <button onClick={addSkill} style={btnPrimary(false)}>Add</button>
              </div>
              {form.required_skills.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.required_skills.map(skill => (
                    <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{skill.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Level</span>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1,2,3,4,5].map(lv => (
                          <button key={lv} onClick={() => setForm(f => ({ ...f, required_skills: f.required_skills.map(s => s.name === skill.name ? { ...s, level: lv } : s) }))}
                            style={{ width: 22, height: 22, borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: skill.level >= lv ? 'var(--text)' : 'var(--bg-card)', color: skill.level >= lv ? 'var(--bg)' : 'var(--text-dim)', outline: skill.level >= lv ? 'none' : '1px solid var(--border)' }}>{lv}</button>
                        ))}
                      </div>
                      <button onClick={() => removeSkill(skill.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Nice to have</Label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <FocusInput value={niceInput} onChange={e => setNiceInput(e.target.value)} placeholder="Docker, AWS…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNice())} list="skill-suggestions-drawer" style={{ flex: 1 }} />
                <button onClick={addNice} style={btnGhost()}>Add</button>
              </div>
              {form.nice_to_have.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.nice_to_have.map(s => (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', color: 'var(--text-mid)' }}>
                      {s}
                      <button onClick={() => setForm(f => ({ ...f, nice_to_have: f.nice_to_have.filter(x => x !== s) }))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <Label>Visibility</Label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['public','private'].map(v => (
                    <button key={v} onClick={() => set('visibility')(v)} style={chipBtn(form.visibility === v)}>
                      {v === 'public' ? 'Public' : 'Link only'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Max applicants</Label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[25,50,100].map(n => <button key={n} onClick={() => set('max_applicants')(n)} style={chipBtn(form.max_applicants === n)}>{n}</button>)}
                </div>
              </div>
              <div>
                <Label>Min match %</Label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[40,50,70].map(n => <button key={n} onClick={() => set('minimum_match_threshold')(n)} style={chipBtn(form.minimum_match_threshold === n)}>{n}%</button>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-card)' }}>
          <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary(saving), width: '100%', justifyContent: 'center', padding: '13px 16px', fontSize: 13 }}>
            {saving ? (editJob ? 'Saving…' : 'Posting…') : (editJob ? 'Save changes' : 'Post role')} {!saving && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. CANDIDATE FULL PROFILE DRAWER (change #5)
// ═══════════════════════════════════════════════════════════════════════════
function CandidateProfileDrawer({ student, open, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  if (!student) return null;
  const s = student;
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'resume', label: 'Resume' },
    { id: 'skills', label: 'Skills' },
    { id: 'journey', label: 'Journey' },
    { id: 'myhunt', label: 'My Hunt' },
  ];
  const initials = (s.full_name || '').split(' ').map(n => n[0]).join('').slice(0, 2) || '?';

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9100, backdropFilter: 'blur(2px)' }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 600,
        background: 'var(--bg)', borderLeft: '1px solid var(--border)',
        zIndex: 9101, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '-12px 0 48px rgba(0,0,0,0.15)' : 'none',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ flexShrink: 0, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {s.avatar_url ? (
                <img src={s.avatar_url} alt={s.full_name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-subtle)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: 'var(--text-mid)' }}>{initials}</div>
              )}
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{s.full_name || 'Student'}</p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '1px 0 0' }}>{s.college || '—'}{s.year ? ` · Year ${s.year}` : ''}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ ...iconBtn, width: 30, height: 30, padding: 0, justifyContent: 'center' }}>
              <X size={14} />
            </button>
          </div>
          {/* Sub tabs */}
          <div style={{ display: 'flex', overflowX: 'auto', borderTop: '1px solid var(--border)', padding: '0 20px' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: activeTab === t.id ? 600 : 400,
                color: activeTab === t.id ? 'var(--text)' : 'var(--text-dim)',
                borderBottom: activeTab === t.id ? '2px solid var(--text)' : '2px solid transparent',
                marginBottom: -1, whiteSpace: 'nowrap', fontFamily: 'inherit',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Bio */}
              {s.bio && (
                <div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Bio</p>
                  <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6 }}>{s.bio}</p>
                </div>
              )}
              {/* Links */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={linkChip}><Github size={11} /> GitHub</a>}
                {s.linkedin_url  && <a href={s.linkedin_url}  target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> LinkedIn</a>}
                {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> Portfolio</a>}
                {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, color: 'var(--text)', borderColor: 'var(--text)' }}>📄 Resume</a>}
              </div>
              {/* Basic info */}
              <div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Info</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'College', val: s.college },
                    { label: 'Year', val: s.year ? `Year ${s.year}` : null },
                    { label: 'Availability', val: s.availability },
                    { label: 'Work Preference', val: s.work_preference },
                  ].map(({ label, val }) => val ? (
                    <div key={label}>
                      <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 12, color: 'var(--text)', margin: 0 }}>{val}</p>
                    </div>
                  ) : null)}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'resume' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Projects */}
              {(s.projects || []).length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Projects</p>
                  {(s.projects || []).map((p, i) => (
                    <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{p.title || p.name}</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {(p.githubUrl || p.github_url) && <a href={p.githubUrl || p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><Github size={13} /></a>}
                          {(p.projectUrl || p.link)      && <a href={p.projectUrl || p.link}      target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><ExternalLink size={13} /></a>}
                        </div>
                      </div>
                      {p.description && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, lineHeight: 1.5 }}>{p.description}</p>}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(Array.isArray(p.techStack) ? p.techStack : []).map((t, j) => (
                          <span key={j} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Education */}
              {(s.education || []).length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Education</p>
                  {(s.education || []).map((e, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 6 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{e.school}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '2px 0 0' }}>{e.degree}{e.major ? ` · ${e.major}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'skills' && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Technical Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(s.skills || []).map((sk, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{sk.name}</span>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(d => (
                        <div key={d} style={{ width: 4, height: 4, borderRadius: 1, background: sk.level >= d ? 'var(--blue)' : 'var(--border)' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {(s.preferred_roles || []).length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Preferred Roles</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {s.preferred_roles.map(r => (
                      <span key={r} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green-text)' }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'journey' && (
            <div>
              {(s.journey || []).length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', paddingTop: 40 }}>No journey entries yet.</p>
              ) : (s.journey || []).map((j, i) => (
                <div key={i} style={{ paddingLeft: 24, position: 'relative', marginBottom: 16 }}>
                  <div style={{ position: 'absolute', left: 6, top: 8, width: 8, height: 8, borderRadius: 1, background: 'var(--green)' }} />
                  <div style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{j.title}</p>
                    {j.company && <p style={{ fontSize: 11, color: 'var(--text-mid)', margin: '2px 0' }}>{j.company}</p>}
                    <p style={{ fontSize: 10, color: 'var(--text-dim)' }}>{j.startDate}{j.endDate ? ` → ${j.endDate}` : ' → Present'}</p>
                    {j.description && <p style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 6, lineHeight: 1.5 }}>{j.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'myhunt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { key: 'my_hunt', label: 'The Hunt' },
                { key: 'philosophy', label: 'Philosophy' },
                { key: 'inspirations', label: 'What moves them' },
                { key: 'life_outside', label: 'Life outside work' },
              ].map(({ key, label }) => s[key] ? (
                <div key={key} style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>{s[key]}</p>
                </div>
              ) : null)}
              {s.quote && (
                <div style={{ padding: '14px 16px', borderLeft: '3px solid var(--green)', background: 'var(--bg-card)', borderRadius: '0 10px 10px 0' }}>
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 15, color: 'var(--text)', fontStyle: 'italic', margin: 0 }}>"{s.quote}"</p>
                  {s.quote_author && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>{s.quote_author}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. HUNT SORT SECTION — animated, AI-style, change #4
// ═══════════════════════════════════════════════════════════════════════════
function HuntSortSection({ apps, job, onStatusChange, showToast }) {
  const [state, setState] = useState('idle'); // idle | loading | done
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [topCandidates, setTopCandidates] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [profileDrawerStudent, setProfileDrawerStudent] = useState(null);

  const MESSAGES = [
    'Reading candidate profiles…',
    'Analysing skill match scores…',
    'Evaluating project relevance…',
    'Checking GitHub activity…',
    'Computing final rankings…',
    'Finalising top candidates…',
  ];

  const runSort = async () => {
    setState('loading');
    setProgress(0);
    // Animate through steps
    for (let i = 0; i < MESSAGES.length; i++) {
      setProgressMsg(MESSAGES[i]);
      setProgress(Math.round(((i + 1) / MESSAGES.length) * 100));
      await new Promise(r => setTimeout(r, 380 + Math.random() * 220));
    }
    // Sort by match score, take top 6
    const sorted = [...apps]
      .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      .slice(0, 6);
    setTopCandidates(sorted);
    setState('done');
  };

  const reset = () => {
    setState('idle');
    setProgress(0);
    setTopCandidates([]);
    setSelectedApp(null);
  };

  return (
    <>
      <CandidateProfileDrawer
        student={profileDrawerStudent}
        open={profileDrawerOpen}
        onClose={() => { setProfileDrawerOpen(false); setProfileDrawerStudent(null); }}
      />

      <div style={{
        background: 'var(--bg-card)',
        border: state === 'done' ? '1.5px solid var(--green)' : '1px solid var(--border)',
        borderRadius: 14, marginBottom: 18, overflow: 'hidden',
        transition: 'border-color 0.3s',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: state === 'done' ? 'var(--green-tint)' : 'var(--bg-subtle)',
              border: `1px solid ${state === 'done' ? 'var(--green)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}>
              <Sparkles size={15} style={{ color: state === 'done' ? 'var(--green)' : 'var(--text-dim)' }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>HUNT Sort</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '1px 0 0' }}>
                {state === 'idle' ? 'AI-powered candidate ranking for this role' :
                 state === 'loading' ? progressMsg :
                 `Top ${topCandidates.length} candidates found`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {state === 'done' && (
              <button onClick={reset} style={{ ...iconBtn, width: 30, height: 30, padding: 0, justifyContent: 'center' }} title="Close">
                <X size={13} />
              </button>
            )}
            {state === 'idle' && (
              <button onClick={runSort} disabled={apps.length === 0} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: apps.length === 0 ? 'var(--bg-subtle)' : 'linear-gradient(135deg, var(--green) 0%, #0D8F58 100%)',
                color: apps.length === 0 ? 'var(--text-dim)' : '#fff',
                fontSize: 12, fontWeight: 600, cursor: apps.length === 0 ? 'default' : 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: apps.length > 0 ? '0 2px 12px rgba(26,122,74,0.25)' : 'none',
                transition: 'all 0.2s',
              }}>
                <Sparkles size={13} /> Run HUNT Sort
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {state === 'loading' && (
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg, var(--green), #0D8F58)',
                width: `${progress}%`, transition: 'width 0.35s ease',
              }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                border: '2px solid var(--green)', borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>{progress}% — {progressMsg}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {state === 'done' && (
          <div style={{ padding: '0 20px 20px', display: 'flex', gap: 14 }}>
            {/* List */}
            <div style={{ flex: 1 }}>
              {topCandidates.map((app, i) => {
                const s = app.students || {};
                const huntScore = s._huntScore?.score ?? s.hunt_score ?? null;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                      borderRadius: 10, border: `1px solid ${selectedApp?.id === app.id ? 'var(--green)' : 'var(--border)'}`,
                      background: selectedApp?.id === app.id ? 'var(--green-tint)' : 'var(--bg-subtle)',
                      cursor: 'pointer', marginBottom: 7, transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', width: 20, flexShrink: 0, fontFamily: "'Editorial New', Georgia, serif" }}>#{i + 1}</span>
                    <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name || 'Student'}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.college || '—'}{s.year ? ` · Y${s.year}` : ''}</p>
                    </div>
                    {huntScore !== null && <HuntScoreBadge score={huntScore} />}
                    <ScoreNumber score={app.match_score || 0} size={15} />
                    {app.status && app.status !== 'pending' && <StatusPill status={app.status} />}
                    <ChevronRight size={12} style={{ color: 'var(--text-dim)', flexShrink: 0, transform: selectedApp?.id === app.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                  </div>
                );
              })}
            </div>

            {/* Snapshot panel */}
            {selectedApp && (
              <div style={{ width: 300, flexShrink: 0 }}>
                <HuntSortSnapshot
                  app={selectedApp}
                  onStatusChange={onStatusChange}
                  onViewFull={(student) => { setProfileDrawerStudent(student); setProfileDrawerOpen(true); }}
                  onClose={() => setSelectedApp(null)}
                  showToast={showToast}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// Compact snapshot for Hunt Sort (change #5, #6)
function HuntSortSnapshot({ app, onStatusChange, onViewFull, onClose, showToast }) {
  const s = app.students || {};
  const score = app.match_score || 0;
  const huntScore = s._huntScore?.score ?? s.hunt_score ?? null;
  const breakdown = app.match_breakdown || {};
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const ACTIONS = [
    { key: 'shortlisted', label: 'Shortlist', icon: Bookmark,   color: 'var(--green-text)' },
    { key: 'interview',   label: 'Interview', icon: Phone,      color: 'var(--blue)' },
    { key: 'hired',       label: 'Hire',      icon: Award,      color: 'var(--purple)' },
    { key: 'rejected',    label: 'Pass',      icon: ThumbsDown, color: 'var(--red)' },
  ];

  const handleAction = async (key) => {
    setSending(true);
    try { await onStatusChange(app.id, key, note); setNote(''); showToast && showToast(key === 'hired' ? 'Hired! 🎉' : `${key} updated`); }
    finally { setSending(false); }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Candidate</p>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onViewFull(s)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}
            title="View full profile"
          >
            <Eye size={11} /> Full profile
          </button>
          <button onClick={onClose} style={{ ...iconBtn, width: 26, height: 26, padding: 0, justifyContent: 'center' }}>
            <X size={11} />
          </button>
        </div>
      </div>

      <div style={{ padding: 14 }}>
        {/* Name + scores */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={38} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{s.full_name || 'Student'}</p>
              <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '1px 0 0' }}>{s.college || '—'}{s.year ? ` · Y${s.year}` : ''}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <ScoreNumber score={score} size={20} />
            <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: '1px 0 0', textTransform: 'uppercase' }}>match</p>
          </div>
        </div>

        {/* Hunt score */}
        {huntScore !== null && (
          <div style={{ marginBottom: 10 }}>
            <HuntScoreBadge score={huntScore} />
          </div>
        )}

        {/* Score breakdown */}
        {Object.keys(breakdown).length > 0 && (
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
            {Object.entries(breakdown).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 9, color: 'var(--text-dim)', width: 90, flexShrink: 0, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(v, 40) * 2.5}%`, background: 'var(--green)' }} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text)', width: 24, textAlign: 'right' }}>{v}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {(s.skills || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {(s.skills || []).slice(0, 5).map((sk, i) => (
              <span key={i} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 5, background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green-text)' }}>{sk.name}</span>
            ))}
          </div>
        )}

        {/* Links */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, fontSize: 10, padding: '3px 8px' }}><Github size={10} /> GitHub</a>}
          {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, fontSize: 10, padding: '3px 8px', color: 'var(--text)', borderColor: 'var(--text)' }}>📄 Resume</a>}
          {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ ...linkChip, fontSize: 10, padding: '3px 8px' }}><ExternalLink size={10} /></a>}
        </div>

        {/* Message */}
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Optional message…" rows={2}
          style={{ ...inp, fontSize: 11, padding: '7px 10px', marginBottom: 8, minHeight: 'unset', resize: 'none' }}
          onFocus={e => e.target.style.borderColor = 'var(--text)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border)'}
        />

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {ACTIONS.map(opt => {
            const active = app.status === opt.key;
            const Icon = opt.icon;
            return (
              <button key={opt.key} disabled={sending} onClick={() => handleAction(opt.key)} style={{
                padding: '7px 6px', borderRadius: 7, fontSize: 10, fontWeight: 500,
                cursor: sending ? 'wait' : 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                border:     `1px solid ${active ? opt.color : 'var(--border)'}`,
                background: active ? opt.color : 'transparent',
                color:      active ? '#fff'    : opt.color,
                opacity: sending ? 0.6 : 1, transition: 'all 0.15s',
              }}>
                <Icon size={11} /> {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. APPLICANT SNAPSHOT (full panel, used in all-candidates list)
// ═══════════════════════════════════════════════════════════════════════════
function ApplicantSnapshot({ app, onStatusChange, onClose, compact = false, onViewFull }) {
  const s         = app.students || {};
  const skills    = s.skills    || [];
  const projects  = s.projects  || [];
  const score     = app.match_score    || 0;
  const breakdown = app.match_breakdown || {};
  const huntScore = s._huntScore?.score ?? s.hunt_score ?? null;
  const [recruiterNote, setRecruiterNote] = useState('');
  const [sending, setSending] = useState(false);

  const ACTIONS = [
    { key: 'shortlisted', label: 'Shortlist',  icon: Bookmark,   color: 'var(--green-text)' },
    { key: 'interview',   label: 'Interview',  icon: Phone,      color: 'var(--blue)' },
    { key: 'hired',       label: 'Hire',       icon: Award,      color: 'var(--purple)' },
    { key: 'rejected',    label: 'Pass',       icon: ThumbsDown, color: 'var(--red)' },
  ];

  const handleAction = async (key) => {
    setSending(true);
    try { await onStatusChange(app.id, key, recruiterNote); setRecruiterNote(''); }
    finally { setSending(false); }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Candidate</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {onViewFull && (
            <button onClick={() => onViewFull(s)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Eye size={11} /> Full profile
            </button>
          )}
          {onClose && <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}><X size={16} /></button>}
        </div>
      </div>

      <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={46} />
            <div>
              <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 16, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{s.full_name || 'Student'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '2px 0 0' }}>{s.college || '—'} · Year {s.year || '?'}</p>
              {app.jobs?.role && <p style={{ fontSize: 10, color: 'var(--text-mid)', margin: '4px 0 0' }}>Applied for: <strong>{app.jobs.role}</strong></p>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <ScoreNumber score={score} size={26} />
            <p style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>match</p>
            {huntScore !== null && <div style={{ marginTop: 6 }}><HuntScoreBadge score={huntScore} /></div>}
          </div>
        </div>

        {Object.keys(breakdown).length > 0 && (
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Score breakdown</p>
            {Object.entries(breakdown).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-mid)', width: 110, flexShrink: 0, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(v, 40) * 2.5}%`, background: 'var(--green)', borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)', width: 28, textAlign: 'right' }}>{v}%</span>
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {skills.map((sk, i) => (
                <span key={i} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green-text)' }}>
                  {sk.name} <span style={{ opacity: 0.6 }}>L{sk.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && !compact && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Projects</p>
            {projects.slice(0, 3).map((p, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', margin: 0 }}>{p.title || p.name}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(p.githubUrl || p.github_url) && <a href={p.githubUrl || p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><Github size={12} /></a>}
                    {(p.projectUrl || p.link)      && <a href={p.projectUrl || p.link}      target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><ExternalLink size={12} /></a>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(Array.isArray(p.techStack) ? p.techStack : [p.techStack]).filter(Boolean).map((t, j) => (
                    <span key={j} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={linkChip}><Github size={11} /> GitHub</a>}
          {s.linkedin_url  && <a href={s.linkedin_url}  target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> LinkedIn</a>}
          {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> Portfolio</a>}
          {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, color: 'var(--text)', borderColor: 'var(--text)' }}>📄 Resume</a>}
        </div>

        <div style={{ marginBottom: 10 }}>
          <textarea value={recruiterNote} onChange={e => setRecruiterNote(e.target.value)} placeholder="Optional message to candidate…" rows={3}
            style={{ width: '100%', padding: '9px 11px', fontSize: 12, lineHeight: 1.5, background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text)', resize: 'vertical', fontFamily: 'inherit', borderRadius: 7, boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor = 'var(--text)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {ACTIONS.map(opt => {
            const active = app.status === opt.key;
            const Icon   = opt.icon;
            return (
              <button key={opt.key} disabled={sending} onClick={() => handleAction(opt.key)} style={{
                padding: '10px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                cursor: sending ? 'wait' : 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                border:     `1px solid ${active ? opt.color : 'var(--border)'}`,
                background: active ? opt.color : 'transparent',
                color:      active ? '#fff'    : opt.color,
                opacity:    sending ? 0.6 : 1, transition: 'all 0.15s',
              }}>
                <Icon size={12} /> {opt.label}
              </button>
            );
          })}
        </div>

        {app.status && app.status !== 'pending' && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Current status:</span>
            <StatusPill status={app.status} />
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. ROLE CARD — with edit/pause/delete icons near share (change #1)
// ═══════════════════════════════════════════════════════════════════════════
function RoleCard({ job, onClick, onTogglePause, onCopyLink, onDelete, onEdit }) {
  const filled = (job.current_applicants || 0) / (job.max_applicants || 50);
  const status = job.status || (job.is_active ? 'live' : 'paused');
  const statusStyle = status === 'live'
    ? { color: 'var(--green-text)', bg: 'var(--green-tint)', border: 'var(--green)', label: '● Live' }
    : status === 'paused'
    ? { color: 'var(--amber)', bg: 'var(--amber-tint)', border: 'var(--amber)', label: '⏸ Paused' }
    : { color: 'var(--text-dim)', bg: 'var(--bg-subtle)', border: 'var(--border)', label: 'Closed' };
  return (
    <div onClick={onClick} className="hn-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 180 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <CompanyLogo name={job.company} logoUrl={job.logo_url} size={40} />
          <div>
            <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 15, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.25 }}>{job.role}</p>
            <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>{job.stipend} · {job.duration}</p>
          </div>
        </div>
        <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 500, background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', flexShrink: 0 }}>{statusStyle.label}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-mid)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} /> {job.location}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={10} /> {job.current_applicants || 0}/{job.max_applicants || 50}</span>
      </div>
      <div>
        <div style={{ height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(filled, 1) * 100}%`, background: filled > 0.8 ? 'var(--red)' : filled > 0.5 ? 'var(--amber)' : 'var(--green)', borderRadius: 2, transition: 'width 0.4s' }} />
        </div>
      </div>
      {/* Actions — share, edit, pause, delete grouped together (change #1) */}
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 5, marginTop: 'auto', flexWrap: 'wrap' }}>
        <button onClick={() => onCopyLink(job)} style={{ ...iconBtn, flex: 1 }} title="Copy share link"><Link2 size={12} /> <span style={{ fontSize: 10 }}>Share</span></button>
        <button onClick={() => onEdit(job)} style={{ ...iconBtn }} title="Edit role"><Edit2 size={12} /></button>
        <button onClick={() => onTogglePause(job)} style={iconBtn} title={status === 'live' ? 'Pause' : 'Resume'}>{status === 'live' ? <Pause size={12} /> : <Play size={12} />}</button>
        <button onClick={() => onDelete(job)} style={{ ...iconBtn, color: 'var(--red)' }} title="Delete"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. ROLE DETAIL VIEW — with role pipeline sub-tab (change #2, #3, #4)
// ═══════════════════════════════════════════════════════════════════════════
function RoleDetailView({ job, onBack, onCopyLink, onEdit, onTogglePause, onDelete, recruiter, showToast }) {
  const [apps, setApps]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [subTab, setSubTab]           = useState('candidates'); // candidates | pipeline
  const [profileDrawerOpen, setProfileDrawerOpen]     = useState(false);
  const [profileDrawerStudent, setProfileDrawerStudent] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setApps(await getJobApplications(job.id)); }
      finally { setLoading(false); }
    })();
  }, [job.id]);

  const handleStatusChange = async (appId, status, note = '') => {
    const app = apps.find(a => a.id === appId);
    try {
      await updateApplicationStatus(
        appId, status, app?.students?.id, note,
        { role: job.role, company: job.company || recruiter?.startups?.name },
      );
      setApps(a => a.map(x => x.id === appId ? { ...x, status, recruiter_message: note || x.recruiter_message } : x));
      if (selectedApp?.id === appId) setSelectedApp(s => ({ ...s, status, recruiter_message: note || s.recruiter_message }));
      const labels = { shortlisted: 'Shortlisted ✓', interview: 'Moved to interview', hired: 'Hired! 🎉', rejected: 'Passed' };
      showToast(labels[status] || 'Updated');
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  };

  const status = job.status || (job.is_active ? 'live' : 'paused');
  const avgScore = apps.length ? Math.round(apps.reduce((s, a) => s + (a.match_score || 0), 0) / apps.length) : 0;
  const counts = apps.reduce((acc, a) => { const s = a.status || 'pending'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});

  return (
    <div>
      <CandidateProfileDrawer
        student={profileDrawerStudent}
        open={profileDrawerOpen}
        onClose={() => { setProfileDrawerOpen(false); setProfileDrawerStudent(null); }}
      />

      <button onClick={onBack} style={{ ...btnGhost(), marginBottom: 18, padding: '6px 12px' }}><ArrowLeft size={12} /> All roles</button>

      {/* Role header */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CompanyLogo name={job.company} logoUrl={job.logo_url} size={52} />
            <div>
              <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 22, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{job.role}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '4px 0 0' }}>{job.company} · {job.location} · {job.stipend}</p>
              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 500,
                  background: status === 'live' ? 'var(--green-tint)' : 'var(--amber-tint)',
                  color: status === 'live' ? 'var(--green-text)' : 'var(--amber)',
                  border: `1px solid ${status === 'live' ? 'var(--green)' : 'var(--amber)'}`,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{status === 'live' ? '● Live' : '⏸ Paused'}</span>
              </div>
            </div>
          </div>
          {/* Action buttons — share, edit, pause, delete at role detail header (change #1) */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button onClick={() => onCopyLink(job)} style={btnGhost()}><Link2 size={12} /> Share</button>
            <button onClick={() => onEdit(job)} style={btnGhost()}><Edit2 size={12} /> Edit</button>
            <button onClick={() => onTogglePause(job)} style={btnGhost()}>{status === 'live' ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Resume</>}</button>
            <button onClick={() => { onDelete(job); onBack(); }} style={{ ...btnGhost(), color: 'var(--red)', borderColor: 'var(--red)' }}><Trash2 size={12} /> Delete</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Applicants',   val: apps.length },
            { label: 'Avg score',    val: `${avgScore}%` },
            { label: 'Shortlisted',  val: counts.shortlisted || 0 },
            { label: 'Interviewing', val: counts.interview   || 0 },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
              <p style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 24, color: 'var(--text)', margin: 0, lineHeight: 1, fontWeight: 400 }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HUNT Sort — change #4 */}
      {!loading && <HuntSortSection apps={apps} job={job} onStatusChange={handleStatusChange} showToast={showToast} />}

      {/* Sub tabs — candidates | pipeline (change #2) */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 18 }}>
        {[
          { id: 'candidates', label: `All Candidates (${apps.length})` },
          { id: 'pipeline',   label: 'Pipeline' },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{
            padding: '10px 18px', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
            background: 'transparent', border: 'none',
            borderBottom: `2px solid ${subTab === t.id ? 'var(--text)' : 'transparent'}`,
            color: subTab === t.id ? 'var(--text)' : 'var(--text-dim)',
            fontWeight: subTab === t.id ? 600 : 400, marginBottom: -1,
            whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 40, fontSize: 13 }}>Loading applicants…</p>
      ) : subTab === 'candidates' ? (
        /* All candidates — no status filter (change #3) */
        apps.length === 0 ? (
          <EmptyState icon="🎯" title="No applicants yet." message="Share your role link to start receiving applications." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 380px' : '1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {apps.map((app, i) => (
                <ApplicantRow
                  key={app.id} app={app} rank={i + 1}
                  onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                  isSelected={selectedApp?.id === app.id}
                />
              ))}
            </div>
            {selectedApp && (
              <ApplicantSnapshot
                app={selectedApp}
                onStatusChange={handleStatusChange}
                onClose={() => setSelectedApp(null)}
                onViewFull={(student) => { setProfileDrawerStudent(student); setProfileDrawerOpen(true); }}
              />
            )}
          </div>
        )
      ) : (
        /* Role-specific pipeline (change #2) */
        <RolePipelineView apps={apps} onStatusChange={handleStatusChange} showToast={showToast}
          onViewFull={(student) => { setProfileDrawerStudent(student); setProfileDrawerOpen(true); }}
        />
      )}
    </div>
  );
}

function ApplicantRow({ app, rank, onClick, isSelected }) {
  const s     = app.students || {};
  const score = app.match_score || 0;
  const huntScore = s._huntScore?.score ?? s.hunt_score ?? null;
  return (
    <div onClick={onClick} className="hn-card" style={{
      background: 'var(--bg-card)',
      border: isSelected ? '1.5px solid var(--text)' : '1px solid var(--border)',
      borderRadius: 10, padding: '13px 16px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.15s',
    }}>
      <span style={{ fontSize: 10, color: 'var(--text-dim)', width: 22, flexShrink: 0, textAlign: 'center', fontFamily: "'Editorial New', Georgia, serif" }}>#{rank}</span>
      <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{s.full_name || 'Student'}</p>
        <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.college || '—'} · Year {s.year || '?'}</p>
      </div>
      {huntScore !== null && <HuntScoreBadge score={huntScore} />}
      <ScoreNumber score={score} size={16} />
      <StatusPill status={app.status || 'pending'} />
    </div>
  );
}

// Role-specific pipeline view (change #2)
function RolePipelineView({ apps, onStatusChange, showToast, onViewFull }) {
  const [selectedApp, setSelectedApp] = useState(null);
  const stages = [
    { id: 'shortlisted', label: 'Shortlisted', color: 'var(--green)',  icon: Bookmark },
    { id: 'interview',   label: 'Interview',   color: 'var(--blue)',   icon: Phone },
    { id: 'hired',       label: 'Hired',       color: 'var(--purple)', icon: Award },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 1fr 1fr 380px' : 'repeat(3, 1fr)', gap: 12 }}>
      {stages.map(stage => {
        const candidates = apps.filter(a => a.status === stage.id);
        const Icon = stage.icon;
        return (
          <div key={stage.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, minHeight: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon size={13} style={{ color: stage.color }} /><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{stage.label}</span></div>
              <span style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 14, fontWeight: 400, color: stage.color, padding: '2px 7px', borderRadius: 8, background: 'var(--bg-subtle)' }}>{candidates.length}</span>
            </div>
            {candidates.length === 0 ? (
              <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', padding: '24px 0' }}>No candidates here.</p>
            ) : candidates.map(app => {
              const s = app.students || {};
              return (
                <div key={app.id} onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)} className="hn-card" style={{ padding: '9px 11px', borderRadius: 8, border: `1px solid ${selectedApp?.id === app.id ? 'var(--text)' : 'var(--border)'}`, background: 'var(--bg-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name || 'Student'}</p>
                  </div>
                  <ScoreNumber score={app.match_score || 0} size={12} />
                </div>
              );
            })}
          </div>
        );
      })}
      {selectedApp && (
        <ApplicantSnapshot
          app={selectedApp}
          onStatusChange={async (id, status, note) => { await onStatusChange(id, status, note); setSelectedApp(s => ({ ...s, status, recruiter_message: note || s.recruiter_message })); }}
          onClose={() => setSelectedApp(null)}
          onViewFull={onViewFull}
          compact
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. TAB: HOME
// ═══════════════════════════════════════════════════════════════════════════
function HomeTab({ recruiter, jobs, allApps, onPostRole, onOpenRole }) {
  const liveJobs    = jobs.filter(j => (j.status || (j.is_active ? 'live' : 'paused')) === 'live');
  const totalApps   = allApps.length;
  const shortlisted = allApps.filter(a => a.status === 'shortlisted').length;
  const hired       = allApps.filter(a => a.status === 'hired').length;
  const recentJobs  = [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  const firstName   = recruiter.contact_name?.split(' ')[0] || 'recruiter';
  const startupName = recruiter.startups?.name || recruiter.company_name || 'there';

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>Home</p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>Welcome back, <em>{firstName}.</em></h1>
        <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 8 }}>Here's what's happening at {startupName}.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 36 }}>
        {[{ label: 'Live roles', val: liveJobs.length }, { label: 'Applicants', val: totalApps }, { label: 'Shortlisted', val: shortlisted }, { label: 'Hired', val: hired }].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, color: 'var(--text)', margin: 0, lineHeight: 1, fontWeight: 400 }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Recent roles</h3>
        <button onClick={onPostRole} style={{ ...btnPrimary(false), padding: '7px 12px', fontSize: 11 }}>
          <Plus size={12} /> Post a role
        </button>
      </div>

      {recentJobs.length === 0 ? (
        <EmptyState icon="📋" title="No roles posted yet." message="Post your first role to start receiving matched candidates."
          cta={<button onClick={onPostRole} style={{ ...btnPrimary(false), margin: '0 auto' }}><Plus size={13} /> Post a role</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {recentJobs.map(job => {
            const filled = (job.current_applicants || 0) / (job.max_applicants || 50);
            const status = job.status || (job.is_active ? 'live' : 'paused');
            const statusStyle = status === 'live'
              ? { color: 'var(--green-text)', bg: 'var(--green-tint)', border: 'var(--green)', label: '● Live' }
              : { color: 'var(--amber)', bg: 'var(--amber-tint)', border: 'var(--amber)', label: '⏸ Paused' };
            const jobApps = allApps.filter(a => a.job_id === job.id);
            return (
              <div key={job.id} onClick={() => onOpenRole(job)} className="hn-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CompanyLogo name={job.company} logoUrl={job.logo_url} size={36} />
                    <div>
                      <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 14, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.25 }}>{job.role}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3 }}>{job.stipend} · {job.duration}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 8, fontWeight: 500, background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, whiteSpace: 'nowrap', flexShrink: 0 }}>{statusStyle.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'var(--text-mid)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {job.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={10} /> {job.current_applicants || 0}/{job.max_applicants || 50}</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(filled, 1) * 100}%`, background: filled > 0.8 ? 'var(--red)' : filled > 0.5 ? 'var(--amber)' : 'var(--green)', borderRadius: 2 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{jobApps.length} applicant{jobApps.length !== 1 ? 's' : ''}</span>
                  <ChevronRight size={13} style={{ color: 'var(--text-dim)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 13. TAB: ROLES
// ═══════════════════════════════════════════════════════════════════════════
function RolesTab({ jobs, onCopyLink, onTogglePause, onDelete, onPostRole, onEdit, recruiter, showToast, initialOpenJob }) {
  const [subTab, setSubTab] = useState('live');
  const [openJob, setOpenJob] = useState(initialOpenJob || null);

  useEffect(() => {
    if (initialOpenJob) setOpenJob(initialOpenJob);
  }, [initialOpenJob]);

  const grouped = {
    live:   jobs.filter(j => (j.status || (j.is_active ? 'live' : 'paused')) === 'live'),
    paused: jobs.filter(j => (j.status || (j.is_active ? 'live' : 'paused')) === 'paused'),
    closed: jobs.filter(j => j.status === 'closed'),
  };
  const SUBTABS = [
    { id: 'live',   label: `Live (${grouped.live.length})` },
    { id: 'paused', label: `Paused (${grouped.paused.length})` },
    { id: 'closed', label: `Closed (${grouped.closed.length})` },
  ];

  if (openJob) return (
    <RoleDetailView
      job={openJob}
      onBack={() => setOpenJob(null)}
      onCopyLink={onCopyLink}
      onEdit={(job) => { onEdit(job); }}
      onTogglePause={onTogglePause}
      onDelete={onDelete}
      recruiter={recruiter}
      showToast={showToast}
    />
  );

  return (
    <div>
      <PageHeader eyebrow="Roles" title={<>Manage your <em>roles.</>} action={<button onClick={onPostRole} style={{ ...btnPrimary(false), padding: '10px 16px' }}><Plus size={13} /> Post a role</button>} />
      <SubTabStrip tabs={SUBTABS} active={subTab} onChange={setSubTab} />
      {grouped[subTab].length === 0 ? (
        <EmptyState icon={subTab === 'live' ? '📋' : subTab === 'paused' ? '⏸' : '✕'} title={`No ${subTab} roles.`} message={subTab === 'live' ? 'Post your first role to start receiving matched candidates.' : `Roles you ${subTab === 'paused' ? 'pause' : 'close'} will appear here.`}
          cta={subTab === 'live' && <button onClick={onPostRole} style={{ ...btnPrimary(false), margin: '0 auto' }}><Plus size={13} /> Post a role</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {grouped[subTab].map(job => (
            <RoleCard
              key={job.id} job={job}
              onClick={() => setOpenJob(job)}
              onTogglePause={onTogglePause}
              onCopyLink={onCopyLink}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 14. TAB: HIRING — pipeline by role (change #2)
// ═══════════════════════════════════════════════════════════════════════════
function HiringTab({ allApps, jobs, onStatusChange }) {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [profileDrawerOpen, setProfileDrawerOpen]     = useState(false);
  const [profileDrawerStudent, setProfileDrawerStudent] = useState(null);

  // Group apps by job
  const jobsWithApps = jobs.map(j => ({
    ...j,
    apps: allApps.filter(a => a.job_id === j.id),
  })).filter(j => j.apps.length > 0);

  const selectedJob = selectedJobId ? jobsWithApps.find(j => j.id === selectedJobId) : null;

  return (
    <div>
      <CandidateProfileDrawer
        student={profileDrawerStudent}
        open={profileDrawerOpen}
        onClose={() => { setProfileDrawerOpen(false); setProfileDrawerStudent(null); }}
      />

      <PageHeader eyebrow="Pipeline" title={<>Hiring <em>pipeline.</>} subtitle="Track candidates through your hiring process, by role." />

      {jobsWithApps.length === 0 ? (
        <EmptyState icon="🎯" title="No active pipelines." message="Once candidates apply to your roles, you can manage them here." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '260px 1fr' : '1fr', gap: 16 }}>
          {/* Role selector */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Select role</p>
            {jobsWithApps.map(job => (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 13px', borderRadius: 10, marginBottom: 6,
                  border: `1px solid ${selectedJobId === job.id ? 'var(--text)' : 'var(--border)'}`,
                  background: selectedJobId === job.id ? 'var(--bg-subtle)' : 'var(--bg-card)',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                <CompanyLogo name={job.company} logoUrl={job.logo_url} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '1px 0 0' }}>{job.apps.length} applicant{job.apps.length !== 1 ? 's' : ''}</p>
                </div>
                <ChevronRight size={12} style={{ color: 'var(--text-dim)', flexShrink: 0, transform: selectedJobId === job.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>
            ))}
          </div>

          {/* Pipeline for selected role */}
          {selectedJob && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <CompanyLogo name={selectedJob.company} logoUrl={selectedJob.logo_url} size={32} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{selectedJob.role}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '1px 0 0' }}>{selectedJob.company} · Pipeline</p>
                </div>
              </div>
              <RolePipelineView
                apps={selectedJob.apps}
                onStatusChange={onStatusChange}
                onViewFull={(student) => { setProfileDrawerStudent(student); setProfileDrawerOpen(true); }}
              />
            </div>
          )}

          {!selectedJob && jobsWithApps.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, border: '2px dashed var(--border)', borderRadius: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>← Select a role to view its pipeline</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 15. TAB: PROFILE — cleaner design (change #8)
// ═══════════════════════════════════════════════════════════════════════════
function ProfileTab({ recruiter, onUpdate, showToast }) {
  const [subTab, setSubTab] = useState('startup');
  const isFounder = recruiter.role_in_company === 'founder';
  const startup   = recruiter.startups || {};
  const SUBTABS   = [{ id: 'startup', label: 'Startup' }, { id: 'recruiter', label: 'You' }];
  return (
    <div>
      <PageHeader eyebrow="Profile" title={<>Your <em>profile.</em></>} />
      <SubTabStrip tabs={SUBTABS} active={subTab} onChange={setSubTab} />
      {subTab === 'startup'   && <StartupProfileForm   startup={startup} recruiter={recruiter} canEdit={isFounder} onUpdate={onUpdate} showToast={showToast} />}
      {subTab === 'recruiter' && <RecruiterProfileForm recruiter={recruiter} onUpdate={onUpdate} showToast={showToast} />}
    </div>
  );
}

function StartupProfileForm({ startup, recruiter, canEdit, onUpdate, showToast }) {
  const [form, setForm] = useState({
    name: startup.name || '', tagline: startup.tagline || '',
    about: startup.about || '', website: startup.website || '',
    industry: startup.industry || '', stage: startup.stage || '',
    team_size: startup.team_size || '', founded_year: startup.founded_year || '',
    hq_location: startup.hq_location || '',
    logo_url: startup.logo_url || '', banner_url: startup.banner_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(startup.logo_url || null);
  const [bannerPreview, setBannerPreview] = useState(startup.banner_url || null);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => { setLogoPreview(ev.target.result); set('logo_url')(ev.target.result); };
    r.readAsDataURL(file);
  };
  const handleBannerChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => { setBannerPreview(ev.target.result); set('banner_url')(ev.target.result); };
    r.readAsDataURL(file);
  };

  const save = async () => {
    if (!startup.id) { showToast('No startup linked.', 'error'); return; }
    setSaving(true);
    try { await updateStartupProfile(startup.id, form); showToast('Startup profile updated'); onUpdate(); }
    catch (e) { showToast(e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const infoRows = [
    { key: 'website', label: 'Website', ph: 'https://…' },
    { key: 'hq_location', label: 'HQ Location', ph: 'Bangalore, India' },
    { key: 'industry', label: 'Industry', ph: 'HR Tech / EdTech / SaaS' },
    { key: 'founded_year', label: 'Founded', ph: '2024', type: 'number' },
  ];

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!canEdit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'var(--amber-tint)', border: '1px solid var(--amber)' }}>
          <Lock size={13} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          <p style={{ fontSize: 11, color: 'var(--amber)', margin: 0 }}>Read-only. Only founders can edit the startup profile.</p>
        </div>
      )}

      {/* Banner + Logo hero card (change #7, #8) */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {/* Banner */}
        <div style={{ position: 'relative', height: 140, background: bannerPreview ? 'transparent' : 'linear-gradient(135deg, var(--bg-subtle) 0%, var(--border) 100%)' }}>
          {bannerPreview ? (
            <img src={bannerPreview} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic' }}>Add a banner image</p>
            </div>
          )}
          {canEdit && (
            <label style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 11, cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
              <Camera size={12} /> Change banner
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />
            </label>
          )}
        </div>
        {/* Logo + name */}
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ position: 'relative', marginTop: -36 }}>
              {logoPreview ? (
                <img src={logoPreview} alt="logo" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '3px solid var(--bg-card)' }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: 12, background: 'var(--bg-subtle)', border: '3px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--text-mid)' }}>
                  {(form.name || '?').slice(0, 2).toUpperCase()}
                </div>
              )}
              {canEdit && (
                <label style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: '50%', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)' }}>
                  <Camera size={11} style={{ color: 'var(--bg)' }} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                </label>
              )}
            </div>
          </div>
          <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)', margin: 0 }}>{form.name || <em style={{ color: 'var(--text-dim)' }}>Startup name</em>}</p>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '3px 0 0' }}>{form.tagline || ''}</p>
        </div>
      </div>

      {/* Basic info card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Basic Information</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Label required>Startup name</Label>
            <FocusInput value={form.name} disabled={!canEdit} onChange={e => set('name')(e.target.value)} placeholder="HUNT Labs" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Label>Tagline</Label>
            <FocusInput value={form.tagline} disabled={!canEdit} onChange={e => set('tagline')(e.target.value)} placeholder="Skill-first internships" />
          </div>
          {infoRows.map(({ key, label, ph, type }) => (
            <div key={key}>
              <Label>{label}</Label>
              <FocusInput type={type || 'text'} value={form[key]} disabled={!canEdit} onChange={e => set(key)(e.target.value)} placeholder={ph} />
            </div>
          ))}
          <div>
            <Label>Stage</Label>
            <FocusSelect value={form.stage} disabled={!canEdit} onChange={e => set('stage')(e.target.value)}>
              <option value="">—</option><option>Pre-seed</option><option>Seed</option>
              <option>Series A</option><option>Series B</option><option>Bootstrapped</option>
            </FocusSelect>
          </div>
          <div>
            <Label>Team size</Label>
            <FocusSelect value={form.team_size} disabled={!canEdit} onChange={e => set('team_size')(e.target.value)}>
              <option value="">—</option><option>1-10</option><option>11-50</option><option>51-200</option><option>200+</option>
            </FocusSelect>
          </div>
        </div>
      </div>

      {/* About card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>About</p>
        <FocusTextarea value={form.about} disabled={!canEdit} onChange={e => set('about')(e.target.value)} rows={4} placeholder="What does your startup do?" />
      </div>

      {canEdit && (
        <button onClick={save} disabled={saving} style={btnPrimary(saving)}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      )}
    </div>
  );
}

function RecruiterProfileForm({ recruiter, onUpdate, showToast }) {
  const [form, setForm] = useState({
    contact_name: recruiter.contact_name || '', email: recruiter.email || '',
    phone: recruiter.phone || '', title: recruiter.title || '',
    linkedin_url: recruiter.linkedin_url || '', bio: recruiter.bio || '',
    role_in_company: recruiter.role_in_company || 'recruiter',
  });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const save = async () => {
    setSaving(true);
    try { await updateRecruiterProfile(recruiter.id, form); showToast('Profile updated'); onUpdate(); }
    catch (e) { showToast(e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };
  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Identity card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <Avatar name={form.contact_name} size={52} />
          <div>
            <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{form.contact_name || 'Your name'}</p>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>{form.title || 'Your role'} at {recruiter.startups?.name || 'your startup'}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><Label required>Full name</Label><FocusInput value={form.contact_name} onChange={e => set('contact_name')(e.target.value)} /></div>
          <div><Label>Title</Label><FocusInput value={form.title} onChange={e => set('title')(e.target.value)} placeholder="Head of Talent" /></div>
          <div><Label>Email</Label><FocusInput value={form.email} disabled type="email" /></div>
          <div><Label>Phone</Label><FocusInput value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="+91…" /></div>
          <div><Label>LinkedIn</Label><FocusInput value={form.linkedin_url} onChange={e => set('linkedin_url')(e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
          <div>
            <Label>Role in company</Label>
            <FocusSelect value={form.role_in_company} onChange={e => set('role_in_company')(e.target.value)}>
              <option value="founder">Founder</option>
              <option value="hiring_manager">Hiring manager</option>
              <option value="recruiter">Recruiter</option>
            </FocusSelect>
          </div>
        </div>
      </div>

      {/* Bio card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Bio</p>
        <FocusTextarea value={form.bio} onChange={e => set('bio')(e.target.value)} rows={3} placeholder="Short intro that candidates will see when you reach out." />
      </div>

      <button onClick={save} disabled={saving} style={btnPrimary(saving)}>{saving ? 'Saving…' : 'Save changes'}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 16. SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════════════════
function SettingsModal({ theme, setTheme, onClose, onSignOut }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, maxWidth: 480, width: '100%', boxShadow: '0 12px 48px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 22, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div><p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Appearance</p><p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '3px 0 0' }}>Light or dark mode.</p></div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['light', 'dark'].map(t => <button key={t} onClick={() => setTheme(t)} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: theme === t ? 'var(--bg-subtle)' : 'transparent', border: `1.5px solid ${theme === t ? 'var(--text)' : 'var(--border)'}`, color: 'var(--text)', fontWeight: theme === t ? 600 : 400 }}>{t === 'light' ? <><Sun size={12} /> Light</> : <><Moon size={12} /> Dark</>}</button>)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16 }}>
          <div><p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Sign out</p><p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '3px 0 0' }}>You'll need to log in again.</p></div>
          <button onClick={onSignOut} style={{ ...btnGhost(), color: 'var(--red)', borderColor: 'var(--red)' }}><LogOut size={12} /> Sign out</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 17. MAIN SHELL
// ═══════════════════════════════════════════════════════════════════════════
export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme]             = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [loading, setLoading]         = useState(true);
  const [recruiter, setRecruiter]     = useState(null);
  const [jobs, setJobs]               = useState([]);
  const [allApps, setAllApps]         = useState([]);
  const [activeTab, setActiveTab]     = useState('home');
  const [toast, setToast]             = useState(null);
  const [showAccountMenu, setShowAccountMenu]   = useState(false);
  const [showSettings, setShowSettings]         = useState(false);
  const [showPostDrawer, setShowPostDrawer]     = useState(false);
  const [editJob, setEditJob]                   = useState(null); // for edit
  const [pendingOpenRole, setPendingOpenRole]   = useState(null);
  const [showNotifications, setShowNotifications] = useState(false); // change #9

  useEffect(() => { applyTokens(theme); localStorage.setItem('hunt-theme', theme); }, [theme]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await getRecruiterProfile();
        if (!r) { navigate('/recruiter/onboarding'); return; }
        setRecruiter(r);
        const [j, a] = await Promise.all([getRecruiterJobs(r.id), getAllApplicationsForRecruiter(r.id)]);
        setJobs(j); setAllApps(a);
      } catch (e) {
        console.error('Dashboard load failed:', e);
        showToast(e.message || 'Failed to load dashboard', 'error');
      } finally { setLoading(false); }
    })();
  }, []);

  const refreshAll = async () => {
    if (!recruiter) return;
    const [j, a] = await Promise.all([getRecruiterJobs(recruiter.id), getAllApplicationsForRecruiter(recruiter.id)]);
    setJobs(j); setAllApps(a);
  };
  const refreshRecruiter = async () => { const r = await getRecruiterProfile(); setRecruiter(r); };

  const handleOpenRole = (job) => {
    setPendingOpenRole(job);
    setActiveTab('roles');
  };

  const handleTogglePause = async (job) => {
    const status = job.status || (job.is_active ? 'live' : 'paused');
    const next   = status === 'live' ? 'paused' : 'live';
    try {
      await updateJob(job.id, { status: next, is_active: next === 'live' });
      setJobs(j => j.map(x => x.id === job.id ? { ...x, status: next, is_active: next === 'live' } : x));
      showToast(next === 'live' ? 'Role resumed' : 'Role paused');
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  };

  const handleCopyLink = (job) => {
    const url = `${window.location.origin}/apply/${job.share_slug}`;
    navigator.clipboard.writeText(url).then(() => showToast('Share link copied'));
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete "${job.role}"? This cannot be undone.`)) return;
    try {
      await deleteJob(job.id);
      setJobs(j => j.filter(x => x.id !== job.id));
      showToast('Role deleted');
    } catch (e) { showToast(e.message || 'Delete failed', 'error'); }
  };

  const handleEdit = (job) => {
    setEditJob(job);
    setShowPostDrawer(true);
  };

  const handleStatusChange = async (appId, status, note = '') => {
    const app = allApps.find(a => a.id === appId);
    try {
      await updateApplicationStatus(
        appId, status, app?.students?.id, note,
        { role: app?.jobs?.role, company: app?.jobs?.company || recruiter?.startups?.name },
      );
      setAllApps(a => a.map(x => x.id === appId ? { ...x, status, recruiter_message: note || x.recruiter_message } : x));
      const labels = { shortlisted: 'Shortlisted ✓', interview: 'Moved to interview', hired: 'Hired! 🎉', rejected: 'Passed' };
      showToast(labels[status] || 'Updated');
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  };

  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); } catch (e) { console.error(e); }
  };

  // unread notifications count (mock)
  const unreadCount = 2;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--text)', marginBottom: 20 }}>HUNT</div>
        <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Loading dashboard…</p>
      </div>
    </div>
  );

  if (!recruiter) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
        <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 8, fontWeight: 400 }}>Finish setting up your account</p>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>We couldn't find your recruiter profile. Please complete onboarding.</p>
      </div>
    </div>
  );

  const initials = recruiter.contact_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @keyframes fadeDown { from { opacity:0; transform: translateX(-50%) translateY(-6px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        @keyframes hunt-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        button:disabled { opacity: 0.5; }
        .hn-item:hover { background: var(--bg-subtle) !important; }
        .hn-card:hover { border-color: var(--border-mid) !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-dim); }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {showSettings && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} onSignOut={handleSignOut} />}

      {/* Notification Drawer (change #9) */}
      <NotificationDrawer open={showNotifications} onClose={() => setShowNotifications(false)} recruiter={recruiter} />

      {recruiter && (
        <PostRoleDrawer
          recruiter={recruiter}
          open={showPostDrawer}
          editJob={editJob}
          onClose={() => { setShowPostDrawer(false); setEditJob(null); }}
          showToast={showToast}
          onSuccess={async () => {
            await refreshAll();
            showToast(editJob ? 'Role updated!' : 'Role posted! 🚀');
            if (!editJob) setActiveTab('roles');
            setEditJob(null);
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside style={{ width: 210, flexShrink: 0, height: '100vh', position: 'sticky', top: 0, borderRight: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--text)' }}>HUNT</span>
        </div>

        <nav style={{ padding: '10px 8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <button
            onClick={() => setShowPostDrawer(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9, width: '100%',
              padding: '9px 11px', borderRadius: 7, border: 'none', cursor: 'pointer',
              marginBottom: 8, background: 'var(--text)', color: 'var(--bg)',
              fontSize: 12, fontWeight: 600, textAlign: 'left',
              fontFamily: 'inherit', transition: 'opacity 0.12s',
            }}
          >
            <Plus size={14} style={{ flexShrink: 0 }} /> Post a role
          </button>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 8px' }} />

          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} className="hn-item" onClick={() => { setActiveTab(id); if (id !== 'roles') setPendingOpenRole(null); }} style={{
                display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                padding: '9px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', marginBottom: 1,
                background: active ? 'var(--bg-subtle)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-dim)',
                fontSize: 13, fontWeight: active ? 600 : 400, textAlign: 'left',
                transition: 'background 0.12s, color 0.12s', fontFamily: 'inherit',
              }}>
                <Icon size={15} style={{ flexShrink: 0 }} />{label}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)', position: 'relative' }}>
          <div style={{ padding: '9px 11px', borderRadius: 7, background: 'var(--bg-subtle)', marginBottom: 8 }}>
            <p style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Company</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{recruiter.startups?.name || recruiter.company_name || 'Your startup'}</p>
          </div>

          {/* Icon row — notification + theme (change #9, #10) */}
          <div style={{ display: 'flex', gap: 4, padding: '0 2px', marginBottom: 6 }}>
            {/* Notification button — opens drawer (change #9) */}
            <button
              className="hn-item"
              onClick={() => setShowNotifications(true)}
              style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 7, borderRadius: 6, color: 'var(--text-dim)' }}
            >
              <Bell size={13} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 3, right: 8, width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--bg-card)' }} />
              )}
            </button>
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="hn-item" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 7, borderRadius: 6, color: 'var(--text-dim)' }}>
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </button>
          </div>

          {/* Account — fixed alignment, no accidental sign-out (change #10) */}
          <div
            onClick={() => setShowAccountMenu(p => !p)}
            className="hn-item"
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 11px', borderRadius: 7, cursor: 'pointer', transition: 'background 0.12s' }}
          >
            <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: 'var(--green-tint)', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--green)' }}>{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{recruiter.contact_name}</p>
              <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0, textTransform: 'capitalize' }}>{recruiter.role_in_company || 'Recruiter'}</p>
            </div>
            <ChevronDown size={10} style={{ flexShrink: 0, color: 'var(--text-dim)', transform: showAccountMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </div>

          {/* Account menu — opens UPWARD and RIGHT-aligned (change #10) */}
          {showAccountMenu && (
            <>
              <div onClick={() => setShowAccountMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 499 }} />
              <div style={{
                position: 'absolute', bottom: '100%', left: 8, right: 8,
                marginBottom: 6, zIndex: 500,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, overflow: 'hidden',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
              }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 1 }}>Signed in as</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{recruiter.email || recruiter.contact_name}</p>
                </div>
                {[
                  { label: 'Profile',  action: () => { setActiveTab('profile');  setShowAccountMenu(false); } },
                  { label: 'Settings', action: () => { setShowSettings(true);    setShowAccountMenu(false); } },
                  { label: 'Support',  action: () => { window.open('mailto:support@hunt.so'); setShowAccountMenu(false); } },
                ].map(item => (
                  <button key={item.label} onClick={item.action} className="hn-item" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 12, color: 'var(--text-mid)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{item.label}</button>
                ))}
                {/* Sign out separated, danger color, with label for clarity (change #10) */}
                <div style={{ borderTop: '1px solid var(--border)', padding: '6px' }}>
                  <button
                    onClick={handleSignOut}
                    className="hn-item"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7, width: '100%',
                      textAlign: 'left', padding: '9px 12px', borderRadius: 7,
                      fontSize: 12, color: 'var(--red)',
                      background: 'var(--red-tint)', border: 'none',
                      cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                    }}
                  >
                    <LogOut size={12} /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', maxHeight: '100vh' }}>
        <div style={{ padding: '32px 40px 80px', maxWidth: 1280, margin: '0 auto', animation: 'hunt-fade-in 0.3s ease' }}>
          {activeTab === 'home'    && <HomeTab recruiter={recruiter} jobs={jobs} allApps={allApps} onPostRole={() => setShowPostDrawer(true)} onOpenRole={handleOpenRole} />}
          {activeTab === 'roles'   && <RolesTab jobs={jobs} onCopyLink={handleCopyLink} onTogglePause={handleTogglePause} onDelete={handleDelete} onEdit={handleEdit} onPostRole={() => setShowPostDrawer(true)} recruiter={recruiter} showToast={showToast} initialOpenJob={pendingOpenRole} />}
          {activeTab === 'hiring'  && <HiringTab allApps={allApps} jobs={jobs} onStatusChange={handleStatusChange} />}
          {activeTab === 'profile' && <ProfileTab recruiter={recruiter} onUpdate={refreshRecruiter} showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}
