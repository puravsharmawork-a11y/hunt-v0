// src/components/RecruiterDashboard.jsx
// HUNT — RECRUITER DASHBOARD (v9 — world-class UI redesign, all v8 functionality preserved)
// Design language: Editorial Precision — JetBrains Mono for data, DM Serif Display for heroes,
// ink/cream palette with electric blue accent. Match score is the hero everywhere.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, LogOut, Sun, Moon, X, ChevronRight,
  MapPin, Users, Link2, Trash2,
  ArrowLeft, Pause, Play, ExternalLink, Github, Building2, Home,
  Layers, UserCheck, GitBranch, Sparkles,
  Bookmark, ThumbsDown, Phone, Award, Bell, Lock, MessageSquare,
  LayoutGrid, List, Edit2, Camera, Image as ImageIcon, ChevronDown,
  CheckCircle, Clock, AlertCircle, Eye, AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOut } from '../services/supabase';

// ═══════════════════════════════════════════════════════════════════════════
// 1. DESIGN TOKENS — Editorial Precision palette
// ═══════════════════════════════════════════════════════════════════════════
const tokens = {
  light: {
    '--bg':           '#F4F2EC',   // warm parchment — not cold white
    '--bg-card':      '#FDFCF9',   // cream card surface
    '--bg-subtle':    '#EDE9E0',   // slightly warmer subtle
    '--bg-hover':     '#E8E3D8',
    '--border':       '#DDD9CF',
    '--border-mid':   '#C8C3B8',
    '--text':         '#0E0D0B',   // near-black ink
    '--text-mid':     '#4A4740',
    '--text-dim':     '#9A9690',
    '--accent':       '#1035D8',   // electric blue — Hunt signature
    '--accent-tint':  'rgba(16,53,216,0.07)',
    '--accent-mid':   'rgba(16,53,216,0.18)',
    '--green':        '#0F6B3D',
    '--green-tint':   '#E3F5EC',
    '--green-text':   '#0F6B3D',
    '--red':          '#B82B1E',
    '--red-tint':     '#FDECEB',
    '--amber':        '#84530A',
    '--amber-tint':   '#FBF1E3',
    '--blue':         '#1035D8',
    '--blue-tint':    'rgba(16,53,216,0.07)',
    '--purple':       '#6825C8',
    '--purple-tint':  'rgba(104,37,200,0.08)',
    '--ink':          '#0E0D0B',
    '--cream':        '#F4F2EC',
    '--mono':         "'JetBrains Mono', 'Fira Code', monospace",
    '--serif':        "'DM Serif Display', 'Playfair Display', Georgia, serif",
    '--sans':         "'DM Sans', system-ui, sans-serif",
  },
  dark: {
    '--bg':           '#0C0B09',
    '--bg-card':      '#141310',
    '--bg-subtle':    '#1C1A17',
    '--bg-hover':     '#242118',
    '--border':       '#2C2920',
    '--border-mid':   '#3C3830',
    '--text':         '#F4F2EC',
    '--text-mid':     '#9A9690',
    '--text-dim':     '#5A5750',
    '--accent':       '#4060F8',
    '--accent-tint':  'rgba(64,96,248,0.1)',
    '--accent-mid':   'rgba(64,96,248,0.22)',
    '--green':        '#2AAE6A',
    '--green-tint':   '#0B2B1A',
    '--green-text':   '#2AAE6A',
    '--red':          '#E05040',
    '--red-tint':     '#2B1010',
    '--amber':        '#D0A040',
    '--amber-tint':   '#2B2010',
    '--blue':         '#4060F8',
    '--blue-tint':    'rgba(64,96,248,0.1)',
    '--purple':       '#9060E8',
    '--purple-tint':  'rgba(144,96,232,0.12)',
    '--ink':          '#F4F2EC',
    '--cream':        '#0C0B09',
    '--mono':         "'JetBrains Mono', 'Fira Code', monospace",
    '--serif':        "'DM Serif Display', 'Playfair Display', Georgia, serif",
    '--sans':         "'DM Sans', system-ui, sans-serif",
  },
};

const applyTokens = (theme) =>
  Object.entries(tokens[theme]).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v));

// ═══════════════════════════════════════════════════════════════════════════
// 2. SUPABASE HELPERS — ALL UNCHANGED from v8
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
    .from('recruiters').select('*, startups(*)').eq('auth_id', user.id).maybeSingle();
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
  const safe = Object.fromEntries(Object.entries(jobData).filter(([, v]) => v !== undefined && v !== null));
  const { data, error } = await supabase.from('jobs').insert([safe]).select().single();
  if (error) {
    if (error.message?.includes('logo_url') || error.message?.includes('schema cache')) {
      const { logo_url: _d, ...rest } = safe;
      const { data: d2, error: e2 } = await supabase.from('jobs').insert([rest]).select().single();
      if (e2) throw new Error(e2.message || 'Failed to create job');
      return d2;
    }
    throw new Error(error.message || 'Failed to create job');
  }
  return data;
}

async function updateJob(jobId, patch) {
  const safe = cleanPatch(patch);
  const { data, error } = await supabase.from('jobs').update(safe).eq('id', jobId).select().single();
  if (error) {
    if (error.message?.includes('logo_url') || error.message?.includes('schema cache')) {
      const { logo_url: _d, ...rest } = safe;
      const { data: d2, error: e2 } = await supabase.from('jobs').update(rest).eq('id', jobId).select().single();
      if (e2) throw new Error(e2.message || 'Update failed');
      return d2;
    }
    throw new Error(error.message || 'Update failed');
  }
  return data;
}

async function deleteJob(jobId) {
  const { error } = await supabase.from('jobs').delete().eq('id', jobId);
  if (error) throw error;
}

async function getJobApplications(jobId) {
  const { data, error } = await supabase
    .from('applications').select('*, students(*)')
    .eq('job_id', jobId).order('match_score', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getAllApplicationsForRecruiter(recruiterId) {
  const { data: jobs, error: jobsErr } = await supabase
    .from('jobs').select('id, role, company').eq('recruiter_id', recruiterId);
  if (jobsErr) { console.warn('Jobs query failed:', jobsErr); return []; }
  if (!jobs?.length) return [];
  const jobIds = jobs.map(j => j.id);
  const jobLookup = Object.fromEntries(jobs.map(j => [j.id, j]));
  const { data: apps, error: appsErr } = await supabase
    .from('applications').select('*, students(*)').in('job_id', jobIds)
    .order('match_score', { ascending: false });
  if (appsErr) { console.warn('Applications query failed:', appsErr); return []; }
  return (apps || []).map(a => ({ ...a, jobs: jobLookup[a.job_id] }));
}

const NOTIF_META = {
  shortlisted: { type: 'success', title: (r, c) => `Shortlisted by ${c}`, body: (r, c) => `You're in their top picks for ${r}.` },
  interview:   { type: 'alert',   title: (r, c) => `Interview invite — ${c}`, body: (r, c) => `${c} wants to interview you for ${r}.` },
  hired:       { type: 'success', title: (r, c) => `Offer from ${c} 🎉`,     body: (r, c) => `You received an offer for ${r}.` },
  rejected:    { type: 'info',    title: (r, c) => `Application update — ${c}`, body: (r, c) => `${c} has made a decision on your ${r} application.` },
};

async function updateApplicationStatus(appId, status, studentId, jobMeta = {}) {
  const patch = { status };
  if (status === 'shortlisted') patch.shortlisted_at = new Date().toISOString();
  if (status === 'interview')   patch.interviewed_at = new Date().toISOString();
  if (status === 'hired')       patch.hired_at       = new Date().toISOString();
  const { data, error } = await supabase.from('applications').update(patch).eq('id', appId).select().single();
  if (error) throw new Error(error.message || 'Status update failed');
  if (studentId && NOTIF_META[status]) {
    const nm = NOTIF_META[status];
    const { role = 'the role', company = 'a recruiter' } = jobMeta;
    try {
      await supabase.from('notifications').insert({
        student_id: studentId, application_id: appId, type: nm.type,
        title: nm.title(role, company), body: nm.body(role, company),
        read_by: [], created_at: new Date().toISOString(),
      });
    } catch (e) { console.warn('Notification insert failed (non-fatal):', e); }
  }
  return data;
}

async function updateStartupProfile(startupId, patch) {
  const safe = cleanPatch(patch);
  if (safe.founded_year !== undefined) {
    const n = parseInt(safe.founded_year, 10);
    if (Number.isNaN(n)) delete safe.founded_year; else safe.founded_year = n;
  }
  const { data, error } = await supabase.from('startups').update(safe).eq('id', startupId).select().single();
  if (error) throw new Error(error.message || 'Update failed');
  return data;
}

async function updateRecruiterProfile(recruiterId, patch) {
  const safe = cleanPatch(patch, { drop: ['email'] });
  const { data, error } = await supabase.from('recruiters').update(safe).eq('id', recruiterId).select().single();
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

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',    icon: Home },
  { id: 'roles',   label: 'Roles',   icon: Layers },
  { id: 'profile', label: 'Profile', icon: Building2 },
];

const STATUS_META = {
  pending:     { label: 'Pending',     color: 'var(--text-dim)',  bg: 'var(--bg-subtle)', border: 'var(--border)' },
  shortlisted: { label: 'Shortlisted', color: 'var(--green-text)',bg: 'var(--green-tint)',border: 'var(--green)' },
  interview:   { label: 'Interview',   color: 'var(--accent)',    bg: 'var(--accent-tint)',border: 'var(--accent)' },
  hired:       { label: 'Hired',       color: 'var(--purple)',    bg: 'var(--purple-tint)',border: 'var(--purple)' },
  rejected:    { label: 'Passed',      color: 'var(--red)',       bg: 'var(--red-tint)',  border: 'var(--red)' },
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. ATOMS — redesigned
// ═══════════════════════════════════════════════════════════════════════════
const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 6,
  border: '1px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text)', fontSize: 13, fontFamily: 'var(--sans)',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
};

function FocusInput({ style, ...props }) {
  return <input {...props} style={{ ...inp, ...style }}
    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-tint)'; }}
    onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />;
}
function FocusSelect({ style, children, ...props }) {
  return <select {...props} style={{ ...inp, ...style }}
    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-tint)'; }}
    onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}>{children}</select>;
}
function FocusTextarea({ style, ...props }) {
  return <textarea {...props} style={{ ...inp, resize: 'vertical', minHeight: 70, ...style }}
    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-tint)'; }}
    onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />;
}

function Label({ children, required }) {
  return (
    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
      fontFamily: 'var(--mono)', color: 'var(--text-dim)', marginBottom: 6 }}>
      {children}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
    </p>
  );
}

function Toast({ msg, type }) {
  return (
    <div style={{
      position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, padding: '10px 20px', borderRadius: 8, fontSize: 12,
      fontWeight: 600, fontFamily: 'var(--mono)', letterSpacing: '0.04em',
      background: type === 'error' ? 'var(--red)' : 'var(--ink)',
      color: type === 'error' ? '#fff' : 'var(--cream)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      animation: 'huntFadeDown 0.22s ease', maxWidth: '90vw', textAlign: 'center',
    }}>{msg}</div>
  );
}

function Avatar({ name, avatarUrl, size = 36 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  if (avatarUrl) return (
    <img src={avatarUrl} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--border)' }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--accent-tint)', border: '1.5px solid var(--accent-mid)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 700, color: 'var(--accent)',
      fontFamily: 'var(--mono)',
    }}>{initials}</div>
  );
}

// Company logo with fallback chain: logoUrl → startupLogoUrl → initials
function CompanyLogo({ name, logoUrl, startupLogoUrl, size = 40 }) {
  const resolved = logoUrl || startupLogoUrl || null;
  const initials = (name || '').slice(0, 2).toUpperCase() || '?';
  if (resolved) return (
    <img src={resolved} alt={name} style={{ width: size, height: size, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
      onError={e => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: 6, flexShrink: 0,
      background: 'var(--accent-tint)', border: '1px solid var(--accent-mid)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, color: 'var(--accent)',
      fontFamily: 'var(--mono)', letterSpacing: '0.02em',
    }}>{initials}</div>
  );
}

// StatusPill — redesigned: readable size, monospace, no uppercase screaming
function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
      fontFamily: 'var(--mono)', letterSpacing: '0.05em',
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      whiteSpace: 'nowrap', textTransform: 'uppercase',
    }}>{m.label}</span>
  );
}

function EmptyState({ icon = '—', title, message, cta }) {
  return (
    <div style={{
      textAlign: 'center', padding: '72px 24px',
      background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 12,
    }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>▲ empty</p>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--text)', marginBottom: 8, fontWeight: 400 }}>{title}</p>
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: cta ? 20 : 0, lineHeight: 1.6 }}>{message}</p>
      {cta}
    </div>
  );
}

// ── THE HERO ELEMENT: ScoreNumber — Von Restorff in action ──────────────
// The match score is Hunt's entire value proposition. It gets treated like a hero number.
function ScoreNumber({ score, size = 16 }) {
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
  return (
    <span style={{
      fontFamily: 'var(--mono)', fontSize: size, color, lineHeight: 1,
      fontWeight: 700, letterSpacing: '-0.02em',
    }}>{score}<span style={{ fontSize: size * 0.6, fontWeight: 500, opacity: 0.7 }}>%</span></span>
  );
}

function HuntScoreBadge({ score }) {
  if (!score && score !== 0) return null;
  const level = score >= 80 ? 'elite' : score >= 60 ? 'strong' : score >= 40 ? 'building' : 'starter';
  const cfg = {
    elite:    { color: 'var(--purple)', bg: 'var(--purple-tint)', label: 'ELITE' },
    strong:   { color: 'var(--accent)', bg: 'var(--accent-tint)', label: 'STRONG' },
    building: { color: 'var(--amber)',  bg: 'var(--amber-tint)',  label: 'BUILDING' },
    starter:  { color: 'var(--text-dim)', bg: 'var(--bg-subtle)', label: 'STARTER' },
  }[level];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px',
      borderRadius: 4, background: cfg.bg, border: `1px solid ${cfg.color}22`,
    }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, color: cfg.color, letterSpacing: '0.1em' }}>HS</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: cfg.color }}>{score}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: cfg.color, opacity: 0.6, letterSpacing: '0.06em' }}>{cfg.label}</span>
    </div>
  );
}

// Buttons
function btnPrimary(disabled) {
  return {
    padding: '10px 18px', borderRadius: 6,
    border: 'none',
    background: disabled ? 'var(--text-dim)' : 'var(--ink)',
    color: 'var(--cream)',
    fontSize: 12, fontWeight: 600, fontFamily: 'var(--sans)',
    letterSpacing: '0.01em',
    cursor: disabled ? 'default' : 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'opacity 0.15s, transform 0.1s',
  };
}
function btnGhost() {
  return {
    padding: '10px 16px', borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text-mid)',
    fontSize: 12, fontFamily: 'var(--sans)', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'border-color 0.15s, color 0.15s',
  };
}
function btnAccent() {
  return {
    padding: '9px 16px', borderRadius: 6,
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)',
    letterSpacing: '0.04em', textTransform: 'uppercase',
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'opacity 0.15s',
  };
}

// PageHeader — editorial style
function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
      <div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>▲ {eyebrow}</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.1 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 10, lineHeight: 1.6, maxWidth: 560 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0, marginTop: 6 }}>{action}</div>}
    </div>
  );
}

function SubTabStrip({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, gap: 0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '10px 20px', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
          textTransform: 'uppercase', cursor: 'pointer',
          background: 'transparent', border: 'none',
          borderBottom: `2px solid ${active === t.id ? 'var(--accent)' : 'transparent'}`,
          color: active === t.id ? 'var(--accent)' : 'var(--text-dim)',
          fontWeight: active === t.id ? 700 : 500, marginBottom: -1,
          transition: 'color 0.15s, border-color 0.15s', whiteSpace: 'nowrap',
        }}>{t.label}</button>
      ))}
    </div>
  );
}

const linkChip = {
  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10,
  fontFamily: 'var(--mono)', color: 'var(--text-mid)',
  padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)',
  textDecoration: 'none', letterSpacing: '0.03em',
};
const iconBtn = {
  padding: '6px 10px', borderRadius: 5, border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer',
  fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: 4, transition: 'border-color 0.15s, color 0.15s',
};

// ── Stat card — editorial metric display ─────────────────────────────────
function StatCard({ label, value, accent = false, large = false }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${accent ? 'var(--accent-mid)' : 'var(--border)'}`,
      borderRadius: 8, padding: large ? '18px 22px' : '14px 18px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: accent ? 'var(--accent)' : 'var(--text-dim)', margin: 0 }}>{label}</p>
      <p style={{ fontFamily: 'var(--mono)', fontSize: large ? 36 : 26, fontWeight: 700, color: accent ? 'var(--accent)' : 'var(--text)', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIRM DIALOG — FIX #3 from v8, redesigned
// ═══════════════════════════════════════════════════════════════════════════
function ConfirmActionDialog({ open, action, candidateName, onConfirm, onCancel }) {
  if (!open) return null;
  const meta = {
    hired:     { icon: Award, color: 'var(--purple)', label: 'Hire', question: 'hire', emoji: '🎉' },
    interview: { icon: Phone, color: 'var(--accent)',  label: 'Interview', question: 'schedule an interview with', emoji: '📞' },
  };
  const m = meta[action];
  if (!m) return null;
  const Icon = m.icon;
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '28px', maxWidth: 380, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--accent-tint)', border: `1px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={18} style={{ color: m.color }} />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Confirm {m.label} {m.emoji}</p>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', margin: '3px 0 0', letterSpacing: '0.04em' }}>This will notify the candidate</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 22 }}>
          Do you want to {m.question} <strong style={{ color: 'var(--text)' }}>{candidateName}</strong>?
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ ...btnGhost(), flex: 1, justifyContent: 'center', padding: '10px' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: m.color, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)' }}>{m.label}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION DRAWER — redesigned
// ═══════════════════════════════════════════════════════════════════════════
function NotificationDrawer({ open, onClose, recruiter }) {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    if (!open || !recruiter) return;
    const fetchNotifs = async () => {
      setLoadingNotifs(true);
      try {
        const { data: jobs } = await supabase.from('jobs').select('id, role').eq('recruiter_id', recruiter.id);
        if (!jobs?.length) { setNotifications([]); return; }
        const jobIds = jobs.map(j => j.id);
        const jobMap = Object.fromEntries(jobs.map(j => [j.id, j.role]));
        const { data: apps } = await supabase
          .from('applications').select('id, job_id, status, created_at, match_score, students(full_name)')
          .in('job_id', jobIds).order('created_at', { ascending: false }).limit(20);
        const notifs = (apps || []).map(a => {
          const studentName = a.students?.full_name || 'A candidate';
          const roleName = jobMap[a.job_id] || 'a role';
          const score = a.match_score ? ` with ${a.match_score}% match` : '';
          const isNew = a.status === 'pending';
          const labels = {
            shortlisted: { title: 'Candidate shortlisted', body: `${studentName} was shortlisted for ${roleName}.`, type: 'success' },
            interview:   { title: 'Interview scheduled',    body: `${studentName} moved to interview for ${roleName}.`, type: 'alert' },
            hired:       { title: 'Hire made 🎉',           body: `${studentName} was hired for ${roleName}!`, type: 'success' },
            pending:     { title: 'New application',        body: `${studentName} applied to ${roleName}${score}.`, type: 'success' },
          };
          const meta = labels[a.status] || labels.pending;
          const diffMs = Date.now() - new Date(a.created_at);
          const diffMins = Math.floor(diffMs / 60000);
          const timeStr = diffMins < 60 ? `${diffMins}m` : diffMins < 1440 ? `${Math.floor(diffMins / 60)}h` : `${Math.floor(diffMins / 1440)}d`;
          return { id: a.id, type: meta.type, read: !isNew, title: meta.title, body: meta.body, time: timeStr };
        });
        setNotifications(notifs);
      } catch (e) { console.warn('Notifications fetch failed:', e); setNotifications([]); }
      finally { setLoadingNotifs(false); }
    };
    fetchNotifs();
  }, [open, recruiter]);

  const typeColor = { success: 'var(--green)', alert: 'var(--amber)', info: 'var(--accent)' };
  const typeTint  = { success: 'var(--green-tint)', alert: 'var(--amber-tint)', info: 'var(--accent-tint)' };
  const unread = notifications.filter(n => !n.read).length;

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 8998 }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
        zIndex: 8999, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '-12px 0 48px rgba(0,0,0,0.12)' : 'none',
      }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', margin: 0 }}>▲ notifications{unread > 0 ? ` · ${unread} new` : ''}</p>
            <button onClick={onClose} style={{ ...iconBtn, width: 28, height: 28, padding: 0, justifyContent: 'center' }}><X size={13} /></button>
          </div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Activity feed</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {loadingNotifs ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ width: 20, height: 20, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'huntSpin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>Loading…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Bell size={26} style={{ color: 'var(--text-dim)', marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
              <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>No activity yet</p>
            </div>
          ) : notifications.map(n => (
            <div key={n.id} style={{
              display: 'flex', gap: 10, padding: '12px 12px', borderRadius: 8,
              background: n.read ? 'transparent' : typeTint[n.type] || 'var(--bg-subtle)',
              border: `1px solid ${n.read ? 'var(--border)' : (typeColor[n.type] || 'var(--border)')}22`,
              marginBottom: 6, opacity: n.read ? 0.65 : 1, transition: 'all 0.15s',
            }}>
              <div style={{ width: 3, borderRadius: 2, background: n.read ? 'transparent' : (typeColor[n.type] || 'var(--text-dim)'), flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                  <p style={{ fontSize: 12, fontWeight: n.read ? 400 : 600, color: 'var(--text)', margin: 0, lineHeight: 1.3, fontFamily: 'var(--sans)' }}>{n.title}</p>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', flexShrink: 0, letterSpacing: '0.04em' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-mid)', margin: 0, lineHeight: 1.5 }}>{n.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button style={{ ...btnGhost(), width: '100%', justifyContent: 'center', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>Mark all as read</button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// POST ROLE DRAWER — redesigned, FIX #1 companyLogoUrl
// ═══════════════════════════════════════════════════════════════════════════
function PostRoleDrawer({ recruiter, open, onClose, onSuccess, showToast, editJob }) {
  const [skillInput, setSkillInput]         = useState('');
  const [niceInput, setNiceInput]           = useState('');
  const [whatDoInput, setWhatDoInput]       = useState('');
  const [perkInput, setPerkInput]           = useState('');
  const [newSecHeading, setNewSecHeading]   = useState('');
  const [newSecItemText, setNewSecItemText] = useState({});
  const [saving, setSaving]                 = useState(false);

  const companyLogoUrl = recruiter?.startups?.logo_url || '';

  const defaultForm = () => ({
    logo_url: companyLogoUrl, role: '', description: '', stipend: '', duration: '',
    location: '', type: 'Paid Internship', visibility: 'public',
    required_skills: [], nice_to_have: [], positions: 1,
    whatYoullDo: [], perks: [], sections: [],
    max_applicants: 50, minimum_match_threshold: 50,
  });
  const [form, setForm] = useState(defaultForm);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!open) {
      setForm(defaultForm()); setWhatDoInput(''); setPerkInput('');
      setNewSecHeading(''); setNewSecItemText({});
    } else if (editJob) {
      setForm({
        logo_url: editJob.logo_url || companyLogoUrl, role: editJob.role || '',
        description: editJob.description || '', stipend: editJob.stipend || '',
        duration: editJob.duration || '', location: editJob.location || '',
        type: editJob.type || 'Paid Internship', visibility: editJob.visibility || 'public',
        required_skills: editJob.required_skills || [], nice_to_have: editJob.nice_to_have || [],
        max_applicants: editJob.max_applicants || 50, minimum_match_threshold: editJob.minimum_match_threshold || 50,
        positions: editJob.positions || 1, whatYoullDo: editJob.what_youll_do || [],
        perks: editJob.perks || [], sections: editJob.sections || [],
      });
    }
  }, [open]);

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
    setForm(f => ({ ...f, nice_to_have: [...f.nice_to_have, name] })); setNiceInput('');
  };
  const addWhatDo = () => {
    const n = whatDoInput.trim(); if (!n) return;
    setForm(f => ({ ...f, whatYoullDo: [...f.whatYoullDo, n] })); setWhatDoInput('');
  };
  const removeWhatDo = (i) => setForm(f => ({ ...f, whatYoullDo: f.whatYoullDo.filter((_, idx) => idx !== i) }));
  const addPerk = () => {
    const n = perkInput.trim(); if (!n || form.perks.includes(n)) return;
    setForm(f => ({ ...f, perks: [...f.perks, n] })); setPerkInput('');
  };
  const removePerk = (i) => setForm(f => ({ ...f, perks: f.perks.filter((_, idx) => idx !== i) }));
  const addSection = () => {
    const h = newSecHeading.trim(); if (!h) return;
    setForm(f => ({ ...f, sections: [...f.sections, { heading: h, items: [] }] })); setNewSecHeading('');
  };
  const removeSection = (si) => setForm(f => ({ ...f, sections: f.sections.filter((_, i) => i !== si) }));
  const addSectionItem = (si) => {
    const text = (newSecItemText[si] || '').trim(); if (!text) return;
    setForm(f => ({ ...f, sections: f.sections.map((s, i) => i === si ? { ...s, items: [...s.items, text] } : s) }));
    setNewSecItemText(prev => ({ ...prev, [si]: '' }));
  };
  const removeSectionItem = (si, ii) => setForm(f => ({
    ...f, sections: f.sections.map((s, i) => i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s),
  }));

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
      const jobLogoUrl = form.logo_url || companyLogoUrl || null;
      if (editJob) {
        await updateJob(editJob.id, {
          logo_url: jobLogoUrl, role: form.role.trim(), description: form.description.trim(),
          stipend: form.stipend.trim(), duration: form.duration.trim(), location: form.location.trim(),
          type: form.type, visibility: form.visibility, required_skills: normSkills,
          nice_to_have: form.nice_to_have, max_applicants: form.max_applicants,
          minimum_match_threshold: form.minimum_match_threshold, positions: form.positions,
          what_youll_do: form.whatYoullDo, perks: form.perks, sections: form.sections,
        });
      } else {
        const slug = `${startupName.toLowerCase().replace(/\s+/g, '-')}-${form.role.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        await createJob({
          recruiter_id: recruiter.id, company: startupName, logo_url: jobLogoUrl,
          role: form.role.trim(), description: form.description.trim(), stipend: form.stipend.trim(),
          duration: form.duration.trim(), location: form.location.trim(), type: form.type,
          visibility: form.visibility, share_slug: slug, required_skills: normSkills,
          nice_to_have: form.nice_to_have, max_applicants: form.max_applicants,
          minimum_match_threshold: form.minimum_match_threshold, positions: form.positions,
          current_applicants: 0, is_active: true, status: 'live',
          what_youll_do: form.whatYoullDo, perks: form.perks, sections: form.sections,
        });
      }
      onSuccess(); onClose();
    } catch (e) { showToast('Failed: ' + (e.message || 'Unknown error'), 'error'); }
    finally { setSaving(false); }
  };

  const sectionDivider = (label) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', whiteSpace: 'nowrap' }}>▲ {label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9000 }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 520,
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
        zIndex: 9001, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '-16px 0 60px rgba(0,0,0,0.15)' : 'none',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 6px' }}>{editJob ? '▲ edit role' : '▲ new role'}</p>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, color: 'var(--text)', margin: 0 }}>
                {editJob ? <>Edit <em>{editJob.role}</em></> : <>Post a new <em>role.</em></>}
              </h2>
            </div>
            <button onClick={onClose} style={{ ...iconBtn, width: 30, height: 30, padding: 0, justifyContent: 'center', flexShrink: 0, marginTop: 2 }}><X size={14} /></button>
          </div>
          {companyLogoUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'var(--accent-tint)', border: '1px solid var(--accent-mid)' }}>
              <img src={companyLogoUrl} alt="company" style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover' }} />
              <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', margin: 0, letterSpacing: '0.04em' }}>Company logo will appear on this role</p>
            </div>
          )}
        </div>

        {/* Scrollable form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><Label required>Role title</Label><FocusInput value={form.role} onChange={e => set('role')(e.target.value)} placeholder="Backend Engineer, Growth Marketer…" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><Label required>Stipend</Label><FocusInput value={form.stipend} onChange={e => set('stipend')(e.target.value)} placeholder="₹25,000/mo" /></div>
              <div><Label required>Duration</Label><FocusInput value={form.duration} onChange={e => set('duration')(e.target.value)} placeholder="3 / 6 months" /></div>
              <div><Label required>Location</Label><FocusInput value={form.location} onChange={e => set('location')(e.target.value)} placeholder="Remote / Mumbai" /></div>
              <div><Label>Type</Label>
                <FocusSelect value={form.type} onChange={e => set('type')(e.target.value)}>
                  <option>Paid Internship</option><option>Unpaid Internship</option><option>Contract</option><option>Part-time</option>
                </FocusSelect>
              </div>
            </div>
            <div><Label>Description</Label><FocusTextarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3} placeholder="What will the intern actually work on?" /></div>

            {sectionDivider('Role content')}

            {/* What you'll do */}
            <div>
              <Label>What you'll do</Label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <FocusInput value={whatDoInput} onChange={e => setWhatDoInput(e.target.value)} placeholder="Build and ship features end to end" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addWhatDo())} style={{ flex: 1 }} />
                <button onClick={addWhatDo} style={{ ...btnPrimary(false), padding: '10px 14px' }}>Add</button>
              </div>
              {form.whatYoullDo.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 10px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg)', marginBottom: 4 }}>
                  <span style={{ color: 'var(--accent)', fontSize: 10, marginTop: 2, flexShrink: 0 }}>▲</span>
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>{item}</span>
                  <button onClick={() => removeWhatDo(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0, flexShrink: 0 }}><X size={12} /></button>
                </div>
              ))}
            </div>

            {/* Perks */}
            <div>
              <Label>Perks & benefits</Label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <FocusInput value={perkInput} onChange={e => setPerkInput(e.target.value)} placeholder="Flexible hours · Certificate of completion" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPerk())} style={{ flex: 1 }} />
                <button onClick={addPerk} style={{ ...btnGhost(), padding: '10px 14px' }}>Add</button>
              </div>
              {form.perks.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.perks.map((p, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-mid)', background: 'var(--bg)', fontFamily: 'var(--sans)' }}>
                      {p}
                      <button onClick={() => removePerk(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Custom sections */}
            <div>
              <Label>Custom sections</Label>
              {form.sections.map((sec, si) => (
                <div key={si} style={{ marginBottom: 10, padding: '12px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em' }}>▲ {sec.heading}</span>
                    <button onClick={() => removeSection(si)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><Trash2 size={11} /></button>
                  </div>
                  {sec.items.map((item, ii) => (
                    <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <div style={{ width: 3, height: 3, background: 'var(--text-dim)', flexShrink: 0, marginTop: 7 }} />
                      <span style={{ flex: 1, fontSize: 11, color: 'var(--text)' }}>{item}</span>
                      <button onClick={() => removeSectionItem(si, ii)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0, flexShrink: 0 }}><X size={10} /></button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <FocusInput value={newSecItemText[si] || ''} onChange={e => setNewSecItemText(prev => ({ ...prev, [si]: e.target.value }))} placeholder="Add a point…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSectionItem(si))} style={{ flex: 1, fontSize: 11, padding: '6px 10px' }} />
                    <button onClick={() => addSectionItem(si)} style={{ ...btnPrimary(false), padding: '6px 12px', fontSize: 11 }}>Add</button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <FocusInput value={newSecHeading} onChange={e => setNewSecHeading(e.target.value)} placeholder="Section heading…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSection())} style={{ flex: 1 }} />
                <button onClick={addSection} style={{ ...btnGhost(), whiteSpace: 'nowrap' }}><Plus size={12} /> Add</button>
              </div>
            </div>

            {sectionDivider('Skills & config')}

            {/* Required skills */}
            <div>
              <Label required>Required skills</Label>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8, fontFamily: 'var(--sans)' }}>Type and press Enter. Set expertise level 1–5.</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <FocusInput value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="React, Node.js, Python…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} list="skill-opts" style={{ flex: 1 }} />
                <datalist id="skill-opts">{SKILL_OPTIONS.map(s => <option key={s} value={s} />)}</datalist>
                <button onClick={addSkill} style={btnPrimary(false)}>Add</button>
              </div>
              {form.required_skills.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {form.required_skills.map(skill => (
                    <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', flex: 1, fontFamily: 'var(--sans)' }}>{skill.name}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>LEVEL</span>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1,2,3,4,5].map(lv => (
                          <button key={lv}
                            onClick={() => setForm(f => ({ ...f, required_skills: f.required_skills.map(s => s.name === skill.name ? { ...s, level: lv } : s) }))}
                            style={{ width: 24, height: 24, borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--mono)', border: 'none', background: skill.level >= lv ? 'var(--accent)' : 'var(--bg-subtle)', color: skill.level >= lv ? '#fff' : 'var(--text-dim)', outline: skill.level >= lv ? 'none' : '1px solid var(--border)' }}>{lv}</button>
                        ))}
                      </div>
                      <button onClick={() => removeSkill(skill.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><X size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nice to have */}
            <div>
              <Label>Nice to have</Label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <FocusInput value={niceInput} onChange={e => setNiceInput(e.target.value)} placeholder="Docker, AWS…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNice())} list="skill-opts" style={{ flex: 1 }} />
                <button onClick={addNice} style={btnGhost()}>Add</button>
              </div>
              {form.nice_to_have.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.nice_to_have.map(s => (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 10px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-mid)', fontFamily: 'var(--sans)' }}>
                      {s}
                      <button onClick={() => setForm(f => ({ ...f, nice_to_have: f.nice_to_have.filter(x => x !== s) }))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Visibility */}
            <div>
              <Label>Visibility</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['public', 'private'].map(v => (
                  <button key={v} onClick={() => set('visibility')(v)} style={{
                    padding: '8px 16px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--mono)', cursor: 'pointer',
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                    background: form.visibility === v ? 'var(--ink)' : 'transparent',
                    border: `1px solid ${form.visibility === v ? 'var(--ink)' : 'var(--border)'}`,
                    color: form.visibility === v ? 'var(--cream)' : 'var(--text-mid)',
                    fontWeight: form.visibility === v ? 700 : 500,
                  }}>
                    {v === 'public' ? 'Public' : 'Link only'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-card)' }}>
          <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary(saving), width: '100%', justifyContent: 'center', padding: '13px 16px', fontSize: 13, borderRadius: 8 }}>
            {saving ? (editJob ? 'Saving…' : 'Posting…') : (editJob ? 'Save changes' : 'Post role')}
            {!saving && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CANDIDATE FULL PROFILE DRAWER — redesigned
// ═══════════════════════════════════════════════════════════════════════════
function CandidateProfileDrawer({ student, open, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  if (!student) return null;
  const s = student;
  const tabs = [
    { id: 'overview', label: 'Overview' }, { id: 'resume', label: 'Resume' },
    { id: 'skills', label: 'Skills' },     { id: 'journey', label: 'Journey' },
    { id: 'myhunt', label: 'My Hunt' },
  ];
  const initials = (s.full_name || '').split(' ').map(n => n[0]).join('').slice(0, 2) || '?';

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9100 }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 600,
        background: 'var(--bg)', borderLeft: '1px solid var(--border)',
        zIndex: 9101, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '-16px 0 60px rgba(0,0,0,0.18)' : 'none',
        overflow: 'hidden',
      }}>
        <div style={{ flexShrink: 0, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {s.avatar_url ? (
                <img src={s.avatar_url} alt={s.full_name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
              ) : (
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--accent-tint)', border: '2px solid var(--accent-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{initials}</div>
              )}
              <div>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{s.full_name || 'Student'}</p>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', margin: '2px 0 0', letterSpacing: '0.04em' }}>{s.college || '—'}{s.year ? ` · Y${s.year}` : ''}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ ...iconBtn, width: 30, height: 30, padding: 0, justifyContent: 'center' }}><X size={14} /></button>
          </div>
          <div style={{ display: 'flex', overflowX: 'auto', borderTop: '1px solid var(--border)', padding: '0 22px' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--mono)', fontSize: 10, fontWeight: activeTab === t.id ? 700 : 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: activeTab === t.id ? 'var(--accent)' : 'var(--text-dim)',
                borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, whiteSpace: 'nowrap',
              }}>{t.label}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {s.bio && (
                <div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Bio</p>
                  <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>{s.bio}</p>
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={linkChip}><Github size={11} /> GitHub</a>}
                {s.linkedin_url  && <a href={s.linkedin_url}  target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> LinkedIn</a>}
                {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> Portfolio</a>}
                {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, color: 'var(--accent)', borderColor: 'var(--accent-mid)' }}>↗ Resume</a>}
              </div>
              <div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>Info</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[{ label: 'College', val: s.college }, { label: 'Year', val: s.year ? `Year ${s.year}` : null }, { label: 'Availability', val: s.availability }, { label: 'Work Preference', val: s.work_preference }].map(({ label, val }) => val ? (
                    <div key={label}>
                      <p style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{label}</p>
                      <p style={{ fontSize: 12, color: 'var(--text)', margin: 0 }}>{val}</p>
                    </div>
                  ) : null)}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'resume' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(s.projects || []).length > 0 && (
                <div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>Projects</p>
                  {(s.projects || []).map((p, i) => (
                    <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{p.title || p.name}</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {(p.githubUrl || p.github_url) && <a href={p.githubUrl || p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><Github size={13} /></a>}
                          {(p.projectUrl || p.link)      && <a href={p.projectUrl || p.link}      target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><ExternalLink size={13} /></a>}
                        </div>
                      </div>
                      {p.description && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8, lineHeight: 1.5 }}>{p.description}</p>}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(Array.isArray(p.techStack) ? p.techStack : []).map((t, j) => (
                          <span key={j} style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px', borderRadius: 3, border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'skills' && (
            <div>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 14 }}>Technical Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(s.skills || []).map((sk, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{sk.name}</span>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(d => (
                        <div key={d} style={{ width: 4, height: 4, borderRadius: 1, background: sk.level >= d ? 'var(--accent)' : 'var(--border)' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {(s.preferred_roles || []).length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Preferred Roles</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {s.preferred_roles.map(r => (
                      <span key={r} style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, background: 'var(--accent-tint)', border: '1px solid var(--accent-mid)', color: 'var(--accent)', fontFamily: 'var(--mono)', letterSpacing: '0.03em' }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'journey' && (
            <div>
              {(s.journey || []).length === 0 ? (
                <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', paddingTop: 40, letterSpacing: '0.06em' }}>No journey entries yet.</p>
              ) : (s.journey || []).map((j, i) => (
                <div key={i} style={{ paddingLeft: 20, position: 'relative', marginBottom: 14 }}>
                  <div style={{ position: 'absolute', left: 4, top: 10, width: 6, height: 6, borderRadius: 1, background: 'var(--accent)' }} />
                  <div style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{j.title}</p>
                    {j.company && <p style={{ fontSize: 11, color: 'var(--text-mid)', margin: '2px 0' }}>{j.company}</p>}
                    <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>{j.startDate}{j.endDate ? ` → ${j.endDate}` : ' → Present'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'myhunt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[{ key: 'my_hunt', label: 'The Hunt' }, { key: 'philosophy', label: 'Philosophy' }, { key: 'inspirations', label: 'What moves them' }, { key: 'life_outside', label: 'Life outside work' }].map(({ key, label }) => s[key] ? (
                <div key={key} style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>{label}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>{s[key]}</p>
                </div>
              ) : null)}
              {s.quote && (
                <div style={{ padding: '16px 18px', borderLeft: '3px solid var(--accent)', background: 'var(--accent-tint)', borderRadius: '0 8px 8px 0' }}>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>"{s.quote}"</p>
                  {s.quote_author && <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', marginTop: 8, letterSpacing: '0.04em' }}>{s.quote_author}</p>}
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
// HUNT SORT TRIGGER — redesigned loading overlay
// ═══════════════════════════════════════════════════════════════════════════
function HuntSortTrigger({ apps, onSortDone }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState('');

  const MESSAGES = [
    'Reading candidate profiles…',
    'Analysing skill match scores…',
    'Evaluating project relevance…',
    'Checking consistency signals…',
    'Computing final rankings…',
    'Finalising top candidates…',
  ];

  const run = async () => {
    setLoading(true); setProgress(0);
    for (let i = 0; i < MESSAGES.length; i++) {
      setMsg(MESSAGES[i]);
      setProgress(Math.round(((i + 1) / MESSAGES.length) * 100));
      await new Promise(r => setTimeout(r, 400 + Math.random() * 200));
    }
    const sorted = [...apps].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 6);
    setLoading(false);
    onSortDone(sorted);
  };

  return (
    <>
      <button onClick={run} disabled={loading || apps.length === 0} style={{
        ...btnAccent(),
        background: apps.length === 0 ? 'var(--bg-subtle)' : 'var(--accent)',
        color: apps.length === 0 ? 'var(--text-dim)' : '#fff',
        cursor: apps.length === 0 ? 'default' : 'pointer',
        fontSize: 10, padding: '8px 14px',
      }}>
        <Sparkles size={12} /> Hunt Sort
      </button>

      {loading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9200, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, padding: '48px 56px',
            border: '1px solid var(--border)', textAlign: 'center', maxWidth: 380, width: '90%',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--accent-tint)', border: '1px solid var(--accent-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Sparkles size={22} style={{ color: 'var(--accent)' }} />
            </div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 8px' }}>▲ Hunt Sort</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', margin: '0 0 6px', fontWeight: 400 }}>Ranking candidates</p>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', margin: '0 0 28px', lineHeight: 1.5, letterSpacing: '0.02em' }}>{msg}</p>
            {/* Progress track */}
            <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 1, width: `${progress}%`, transition: 'width 0.4s ease' }} />
            </div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: 'var(--accent)', margin: 0 }}>{progress}%</p>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HUNT SORT SNAPSHOT — redesigned (FIX #2 layout, #3 toggle/confirm, #4 no msg)
// ═══════════════════════════════════════════════════════════════════════════
function HuntSortSnapshot({ app, onStatusChange, onViewFull, onClose, showToast }) {
  const s = app.students || {};
  const score = app.match_score || 0;
  const huntScore = s._huntScore?.score ?? s.hunt_score ?? null;
  const breakdown = app.match_breakdown || {};
  const [sending, setSending] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const ACTIONS = [
    { key: 'shortlisted', label: 'Shortlist', icon: Bookmark,   color: 'var(--green)' },
    { key: 'interview',   label: 'Interview', icon: Phone,      color: 'var(--accent)' },
    { key: 'hired',       label: 'Hire',      icon: Award,      color: 'var(--purple)' },
    { key: 'rejected',    label: 'Pass',      icon: ThumbsDown, color: 'var(--red)' },
  ];

  const handleActionClick = (key) => {
    if (app.status === key) { executeAction('pending'); return; }
    if (key === 'hired' || key === 'interview') { setConfirmDialog({ action: key }); return; }
    executeAction(key);
  };
  const executeAction = async (key) => {
    setSending(true);
    try {
      await onStatusChange(app.id, key);
      showToast && showToast(key === 'hired' ? 'Hired! 🎉' : key === 'pending' ? 'Status cleared' : `${key} updated`);
    } finally { setSending(false); setConfirmDialog(null); }
  };

  return (
    <>
      <ConfirmActionDialog open={!!confirmDialog} action={confirmDialog?.action} candidateName={s.full_name || 'this candidate'} onConfirm={() => executeAction(confirmDialog.action)} onCancel={() => setConfirmDialog(null)} />
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0 }}>Candidate</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => onViewFull(s)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontFamily: 'var(--mono)', fontSize: 9, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <Eye size={10} /> Profile
            </button>
            <button onClick={onClose} style={{ ...iconBtn, width: 24, height: 24, padding: 0, justifyContent: 'center' }}><X size={11} /></button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: 14 }}>
            {/* Hero row: name + THE SCORE */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={38} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--text)', margin: 0, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name || 'Student'}</p>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>{s.college || '—'}{s.year ? ` · Y${s.year}` : ''}</p>
                </div>
              </div>
              {/* Von Restorff: the score is enormous */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <ScoreNumber score={score} size={28} />
                <p style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--text-dim)', margin: '1px 0 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>match</p>
              </div>
            </div>

            {huntScore !== null && <div style={{ marginBottom: 10 }}><HuntScoreBadge score={huntScore} /></div>}

            {/* Score breakdown */}
            {Object.keys(breakdown).length > 0 && (
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', marginBottom: 10 }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Score breakdown</p>
                {Object.entries(breakdown).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', width: 88, flexShrink: 0, textTransform: 'capitalize', letterSpacing: '0.02em' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(v, 100)}%`, background: 'var(--accent)' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, color: 'var(--text)', width: 28, textAlign: 'right' }}>{v}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {(s.skills || []).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {(s.skills || []).slice(0, 5).map((sk, i) => (
                  <span key={i} style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px', borderRadius: 3, background: 'var(--accent-tint)', border: '1px solid var(--accent-mid)', color: 'var(--accent)' }}>{sk.name}</span>
                ))}
              </div>
            )}

            {/* Links */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
              {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip }}><Github size={10} /> GH</a>}
              {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, color: 'var(--accent)', borderColor: 'var(--accent-mid)' }}>↗ CV</a>}
              {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ ...linkChip }}><ExternalLink size={10} /></a>}
            </div>

            {/* Current status hint */}
            {app.status && app.status !== 'pending' && (
              <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusPill status={app.status} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>· click again to undo</span>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {ACTIONS.map(opt => {
                const active = app.status === opt.key;
                const Icon = opt.icon;
                return (
                  <button key={opt.key} disabled={sending} onClick={() => handleActionClick(opt.key)} style={{
                    padding: '8px 6px', borderRadius: 5,
                    fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: sending ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    border: `1px solid ${active ? opt.color : 'var(--border)'}`,
                    background: active ? opt.color : 'transparent',
                    color: active ? '#fff' : opt.color,
                    opacity: sending ? 0.6 : 1, transition: 'all 0.15s',
                  }}>
                    <Icon size={10} /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLICANT SNAPSHOT — redesigned (FIX #2, #3, #4)
// ═══════════════════════════════════════════════════════════════════════════
function ApplicantSnapshot({ app, onStatusChange, onClose, compact = false, onViewFull }) {
  const s = app.students || {};
  const skills = s.skills || [];
  const projects = s.projects || [];
  const score = app.match_score || 0;
  const breakdown = app.match_breakdown || {};
  const huntScore = s._huntScore?.score ?? s.hunt_score ?? null;
  const [sending, setSending] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const ACTIONS = [
    { key: 'shortlisted', label: 'Shortlist', icon: Bookmark,   color: 'var(--green)' },
    { key: 'interview',   label: 'Interview', icon: Phone,      color: 'var(--accent)' },
    { key: 'hired',       label: 'Hire',      icon: Award,      color: 'var(--purple)' },
    { key: 'rejected',    label: 'Pass',      icon: ThumbsDown, color: 'var(--red)' },
  ];

  const handleActionClick = (key) => {
    if (app.status === key) { executeAction('pending'); return; }
    if (key === 'hired' || key === 'interview') { setConfirmDialog({ action: key }); return; }
    executeAction(key);
  };
  const executeAction = async (key) => {
    setSending(true);
    try { await onStatusChange(app.id, key); }
    finally { setSending(false); setConfirmDialog(null); }
  };

  return (
    <>
      <ConfirmActionDialog open={!!confirmDialog} action={confirmDialog?.action} candidateName={s.full_name || 'this candidate'} onConfirm={() => executeAction(confirmDialog.action)} onCancel={() => setConfirmDialog(null)} />
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0 }}>Candidate</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {onViewFull && (
              <button onClick={() => onViewFull(s)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontFamily: 'var(--mono)', fontSize: 9, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                <Eye size={10} /> Profile
              </button>
            )}
            {onClose && <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}><X size={16} /></button>}
          </div>
        </div>

        <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
          {/* Hero: name + GIANT score */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={46} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text)', margin: 0, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name || 'Student'}</p>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>{s.college || '—'} · Year {s.year || '?'}</p>
                {app.jobs?.role && <p style={{ fontSize: 10, color: 'var(--text-mid)', margin: '4px 0 0' }}>Applied: <strong style={{ color: 'var(--text)' }}>{app.jobs.role}</strong></p>}
              </div>
            </div>
            {/* The match score — this is The Hero */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <ScoreNumber score={score} size={36} />
              <p style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--text-dim)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>match</p>
              {huntScore !== null && <div style={{ marginTop: 8 }}><HuntScoreBadge score={huntScore} /></div>}
            </div>
          </div>

          {/* Score breakdown — fixed math: Math.min(v, 100) */}
          {Object.keys(breakdown).length > 0 && (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Score breakdown</p>
              {Object.entries(breakdown).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-mid)', width: 100, flexShrink: 0, textTransform: 'capitalize', letterSpacing: '0.02em' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(v, 100)}%`, background: v >= 75 ? 'var(--green)' : v >= 50 ? 'var(--accent)' : 'var(--amber)', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--text)', width: 30, textAlign: 'right' }}>{v}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {skills.map((sk, i) => (
                  <span key={i} style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 9px', borderRadius: 4, background: 'var(--accent-tint)', border: '1px solid var(--accent-mid)', color: 'var(--accent)' }}>
                    {sk.name} <span style={{ opacity: 0.6 }}>L{sk.level}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && !compact && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Projects</p>
              {projects.slice(0, 3).map((p, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', margin: 0 }}>{p.title || p.name}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(p.githubUrl || p.github_url) && <a href={p.githubUrl || p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><Github size={12} /></a>}
                      {(p.projectUrl || p.link) && <a href={p.projectUrl || p.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><ExternalLink size={12} /></a>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(Array.isArray(p.techStack) ? p.techStack : [p.techStack]).filter(Boolean).map((t, j) => (
                      <span key={j} style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '1px 6px', borderRadius: 3, border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Links */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={linkChip}><Github size={10} /> GitHub</a>}
            {s.linkedin_url  && <a href={s.linkedin_url}  target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={10} /> LinkedIn</a>}
            {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={10} /> Portfolio</a>}
            {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, color: 'var(--accent)', borderColor: 'var(--accent-mid)' }}>↗ Resume</a>}
          </div>

          {/* Status undo hint */}
          {app.status && app.status !== 'pending' && (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <StatusPill status={app.status} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>· click again to undo</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {ACTIONS.map(opt => {
              const active = app.status === opt.key;
              const Icon = opt.icon;
              return (
                <button key={opt.key} disabled={sending} onClick={() => handleActionClick(opt.key)} style={{
                  padding: '10px', borderRadius: 6,
                  fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: sending ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  border: `1px solid ${active ? opt.color : 'var(--border)'}`,
                  background: active ? opt.color : 'transparent',
                  color: active ? '#fff' : opt.color,
                  opacity: sending ? 0.6 : 1, transition: 'all 0.15s',
                }}>
                  <Icon size={11} /> {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLE CARD — redesigned with FIX #1 startupLogoUrl
// ═══════════════════════════════════════════════════════════════════════════
function RoleCard({ job, onClick, onTogglePause, onCopyLink, onDelete, onEdit, startupLogoUrl }) {
  const filled = (job.current_applicants || 0) / (job.max_applicants || 50);
  const status = job.status || (job.is_active ? 'live' : 'paused');
  const isLive = status === 'live';

  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
      padding: 18, cursor: 'pointer', transition: 'border-color 0.15s, transform 0.1s',
      display: 'flex', flexDirection: 'column', gap: 12, minHeight: 176,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, minWidth: 0, flex: 1 }}>
          <CompanyLogo name={job.company} logoUrl={job.logo_url} startupLogoUrl={startupLogoUrl} size={38} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--text)', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</p>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', marginTop: 4, letterSpacing: '0.03em' }}>{job.stipend} · {job.duration}</p>
          </div>
        </div>
        {/* Status badge */}
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 8, padding: '3px 8px', borderRadius: 4, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0,
          background: isLive ? 'var(--green-tint)' : 'var(--bg-subtle)',
          color: isLive ? 'var(--green)' : 'var(--text-dim)',
          border: `1px solid ${isLive ? 'var(--green)' : 'var(--border)'}`,
        }}>{isLive ? '● Live' : '⏸ Paused'}</span>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.03em' }}><MapPin size={10} /> {job.location}</span>
        <span style={{ fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.03em' }}><Users size={10} /> {job.current_applicants || 0} applied</span>
      </div>

      {/* Fill progress */}
      <div style={{ height: 2, borderRadius: 1, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(filled, 1) * 100}%`, background: filled > 0.8 ? 'var(--red)' : filled > 0.5 ? 'var(--amber)' : 'var(--accent)', borderRadius: 1, transition: 'width 0.4s' }} />
      </div>

      {/* Action row */}
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 5, marginTop: 'auto', flexWrap: 'wrap' }}>
        <button onClick={() => onCopyLink(job)} style={{ ...iconBtn, flex: 1, fontSize: 10 }} title="Copy share link"><Link2 size={11} /> Share</button>
        <button onClick={() => onEdit(job)} style={iconBtn} title="Edit"><Edit2 size={11} /></button>
        <button onClick={() => onTogglePause(job)} style={iconBtn} title={isLive ? 'Pause' : 'Resume'}>{isLive ? <Pause size={11} /> : <Play size={11} />}</button>
        <button onClick={() => onDelete(job)} style={{ ...iconBtn, color: 'var(--red)' }} title="Delete"><Trash2 size={11} /></button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLICANT ROW — redesigned
// ═══════════════════════════════════════════════════════════════════════════
function ApplicantRow({ app, rank, onClick, isSelected, showRank = false }) {
  const s = app.students || {};
  const score = app.match_score || 0;
  const huntScore = s._huntScore?.score ?? s.hunt_score ?? null;
  return (
    <div onClick={onClick} style={{
      background: isSelected && showRank ? 'var(--accent-tint)' : 'var(--bg-card)',
      border: isSelected ? `1.5px solid ${showRank ? 'var(--accent)' : 'var(--accent)'}` : '1px solid var(--border)',
      borderRadius: 8, padding: '12px 16px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.15s, background 0.15s',
    }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, width: 22, flexShrink: 0, textAlign: 'center', color: showRank ? 'var(--accent)' : 'var(--text-dim)', fontWeight: showRank ? 700 : 400 }}>#{rank}</span>
      <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{s.full_name || 'Student'}</p>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>{s.college || '—'} · Y{s.year || '?'}</p>
      </div>
      {huntScore !== null && <HuntScoreBadge score={huntScore} />}
      <ScoreNumber score={score} size={18} />
      <StatusPill status={app.status || 'pending'} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLE PIPELINE VIEW — redesigned
// ═══════════════════════════════════════════════════════════════════════════
function RolePipelineView({ apps, onStatusChange, showToast, onViewFull }) {
  const [selectedApp, setSelectedApp] = useState(null);
  const stages = [
    { id: 'shortlisted', label: 'Shortlisted', color: 'var(--green)',  icon: Bookmark },
    { id: 'interview',   label: 'Interview',   color: 'var(--accent)', icon: Phone },
    { id: 'hired',       label: 'Hired',       color: 'var(--purple)', icon: Award },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 1fr 1fr 380px' : 'repeat(3, 1fr)', gap: 12 }}>
      {stages.map(stage => {
        const candidates = apps.filter(a => a.status === stage.id);
        const Icon = stage.icon;
        return (
          <div key={stage.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, minHeight: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Icon size={12} style={{ color: stage.color }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)' }}>{stage.label}</span>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: stage.color }}>{candidates.length}</span>
            </div>
            {candidates.length === 0 ? (
              <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', padding: '24px 0', letterSpacing: '0.06em' }}>Empty</p>
            ) : candidates.map(app => {
              const st = app.students || {};
              return (
                <div key={app.id} onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)} style={{
                  padding: '9px 11px', borderRadius: 6, cursor: 'pointer',
                  border: `1px solid ${selectedApp?.id === app.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: selectedApp?.id === app.id ? 'var(--accent-tint)' : 'var(--bg)',
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.12s',
                }}>
                  <Avatar name={st.full_name} avatarUrl={st.avatar_url} size={26} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.full_name || 'Student'}</p>
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
          onStatusChange={async (id, status) => { await onStatusChange(id, status); setSelectedApp(s => ({ ...s, status })); }}
          onClose={() => setSelectedApp(null)}
          onViewFull={onViewFull}
          compact
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLE DETAIL VIEW — redesigned with FIX #1 startupLogoUrl
// ═══════════════════════════════════════════════════════════════════════════
function RoleDetailView({ job, onBack, onCopyLink, onEdit, onTogglePause, onDelete, recruiter, showToast }) {
  const [apps, setApps]                     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedApp, setSelectedApp]       = useState(null);
  const [subTab, setSubTab]                 = useState('candidates');
  const [sortedCandidates, setSortedCandidates] = useState(null);
  const [profileDrawerOpen, setProfileDrawerOpen]       = useState(false);
  const [profileDrawerStudent, setProfileDrawerStudent] = useState(null);

  const startupLogoUrl = recruiter?.startups?.logo_url || '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setApps(await getJobApplications(job.id)); }
      finally { setLoading(false); }
    })();
  }, [job.id]);

  const handleStatusChange = async (appId, status) => {
    const app = apps.find(a => a.id === appId);
    try {
      await updateApplicationStatus(appId, status, app?.students?.id, { role: job.role, company: job.company || recruiter?.startups?.name });
      setApps(a => a.map(x => x.id === appId ? { ...x, status } : x));
      if (sortedCandidates) setSortedCandidates(sc => sc.map(x => x.id === appId ? { ...x, status } : x));
      if (selectedApp?.id === appId) setSelectedApp(s => ({ ...s, status }));
      const labels = { shortlisted: 'Shortlisted ✓', interview: 'Moved to interview', hired: 'Hired! 🎉', rejected: 'Passed', pending: 'Status cleared' };
      showToast(labels[status] || 'Updated');
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  };

  const handleSortDone = (candidates) => {
    setSortedCandidates(candidates); setSelectedApp(null); setSubTab('huntsort');
  };

  const jobStatus = job.status || (job.is_active ? 'live' : 'paused');
  const avgScore  = apps.length ? Math.round(apps.reduce((s, a) => s + (a.match_score || 0), 0) / apps.length) : 0;
  const counts    = apps.reduce((acc, a) => { const s = a.status || 'pending'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});
  const displayApps = subTab === 'huntsort' ? (sortedCandidates || []) : apps;

  const tabs = [
    ...(sortedCandidates ? [{ id: 'huntsort', label: `Hunt Sort (${sortedCandidates.length})` }] : []),
    { id: 'candidates', label: `All Candidates (${apps.length})` },
    { id: 'pipeline',   label: 'Pipeline' },
  ];

  return (
    <div>
      <CandidateProfileDrawer student={profileDrawerStudent} open={profileDrawerOpen} onClose={() => { setProfileDrawerOpen(false); setProfileDrawerStudent(null); }} />

      <button onClick={onBack} style={{ ...btnGhost(), marginBottom: 20, padding: '7px 14px', fontSize: 12 }}><ArrowLeft size={12} /> All roles</button>

      {/* Role header card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <CompanyLogo name={job.company} logoUrl={job.logo_url} startupLogoUrl={startupLogoUrl} size={52} />
            <div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{job.role}</h2>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', margin: '5px 0 0', letterSpacing: '0.04em' }}>{job.company} · {job.location} · {job.stipend}</p>
              <div style={{ marginTop: 8 }}>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 8, padding: '3px 8px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: jobStatus === 'live' ? 'var(--green-tint)' : 'var(--amber-tint)',
                  color: jobStatus === 'live' ? 'var(--green)' : 'var(--amber)',
                  border: `1px solid ${jobStatus === 'live' ? 'var(--green)' : 'var(--amber)'}`,
                }}>{jobStatus === 'live' ? '● Live' : '⏸ Paused'}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
            {!loading && <HuntSortTrigger apps={apps} onSortDone={handleSortDone} />}
            <button onClick={() => onCopyLink(job)} style={btnGhost()}><Link2 size={12} /> Share</button>
            <button onClick={() => onEdit(job)} style={btnGhost()}><Edit2 size={12} /> Edit</button>
            <button onClick={() => onTogglePause(job)} style={btnGhost()}>{jobStatus === 'live' ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Resume</>}</button>
            <button onClick={() => { onDelete(job); onBack(); }} style={{ ...btnGhost(), color: 'var(--red)', borderColor: 'var(--red)' }}><Trash2 size={12} /> Delete</button>
          </div>
        </div>

        {/* Stats — avg score is hero (Von Restorff) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <StatCard label="Avg match score" value={`${avgScore}%`} accent={true} />
          <StatCard label="Applicants" value={apps.length} />
          <StatCard label="Shortlisted" value={counts.shortlisted || 0} />
          <StatCard label="Interviewing" value={counts.interview || 0} />
        </div>
      </div>

      {/* Tab strip */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {tabs.map(t => {
          const isHunt = t.id === 'huntsort';
          const active = subTab === t.id;
          return (
            <button key={t.id} onClick={() => { setSubTab(t.id); setSelectedApp(null); }} style={{
              padding: '10px 20px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: 'pointer', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${active ? (isHunt ? 'var(--accent)' : 'var(--accent)') : 'transparent'}`,
              color: active ? 'var(--accent)' : 'var(--text-dim)',
              fontWeight: active ? 700 : 500, marginBottom: -1, whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {isHunt && <Sparkles size={11} style={{ color: active ? 'var(--accent)' : 'var(--text-dim)' }} />}
              {t.label}
            </button>
          );
        })}
        {sortedCandidates && subTab === 'huntsort' && (
          <button onClick={() => { setSortedCandidates(null); setSubTab('candidates'); setSelectedApp(null); }}
            style={{ marginLeft: 'auto', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <X size={10} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Loading applicants…</p>
        </div>
      ) : subTab === 'pipeline' ? (
        <RolePipelineView apps={apps} onStatusChange={handleStatusChange} showToast={showToast}
          onViewFull={(student) => { setProfileDrawerStudent(student); setProfileDrawerOpen(true); }} />
      ) : (
        displayApps.length === 0 ? (
          <EmptyState title={subTab === 'huntsort' ? 'No candidates to rank.' : 'No applicants yet.'} message={subTab === 'huntsort' ? 'Run Hunt Sort when you have applicants.' : 'Share your role link to start receiving applications.'} />
        ) : subTab === 'huntsort' ? (
          <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '200px 1fr' : '1fr', gap: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ borderRight: selectedApp ? '1px solid var(--border)' : 'none' }}>
              {displayApps.map((app, i) => {
                const st = app.students || {};
                const isSelected = selectedApp?.id === app.id;
                return (
                  <div key={app.id} onClick={() => setSelectedApp(isSelected ? null : app)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px',
                    cursor: 'pointer', transition: 'background 0.12s',
                    background: isSelected ? 'var(--accent-tint)' : 'transparent',
                    borderLeft: `3px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: isSelected ? 'var(--accent)' : 'var(--text-dim)', fontWeight: 700, width: 20, flexShrink: 0 }}>{i + 1}</span>
                    <Avatar name={st.full_name} avatarUrl={st.avatar_url} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.full_name || 'Student'}</p>
                      <ScoreNumber score={app.match_score || 0} size={11} />
                    </div>
                    {app.status && app.status !== 'pending' && <StatusPill status={app.status} />}
                  </div>
                );
              })}
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--text-dim)', margin: 0, lineHeight: 1.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Top 6 · Skill-first</p>
              </div>
            </div>
            {selectedApp ? (
              <HuntSortSnapshot app={selectedApp} onStatusChange={handleStatusChange} onClose={() => setSelectedApp(null)}
                onViewFull={(student) => { setProfileDrawerStudent(student); setProfileDrawerOpen(true); }} showToast={showToast} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>← Select a candidate</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 380px' : '1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {displayApps.map((app, i) => (
                <ApplicantRow key={app.id} app={app} rank={i + 1}
                  onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                  isSelected={selectedApp?.id === app.id} />
              ))}
            </div>
            {selectedApp && (
              <ApplicantSnapshot app={selectedApp} onStatusChange={handleStatusChange} onClose={() => setSelectedApp(null)}
                onViewFull={(student) => { setProfileDrawerStudent(student); setProfileDrawerOpen(true); }} />
            )}
          </div>
        )
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME TAB — redesigned with FIX #1
// ═══════════════════════════════════════════════════════════════════════════
function HomeTab({ recruiter, jobs, allApps, onPostRole, onOpenRole }) {
  const liveJobs    = jobs.filter(j => (j.status || (j.is_active ? 'live' : 'paused')) === 'live');
  const totalApps   = allApps.length;
  const shortlisted = allApps.filter(a => a.status === 'shortlisted').length;
  const hired       = allApps.filter(a => a.status === 'hired').length;
  const recentJobs  = [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  const firstName   = recruiter.contact_name?.split(' ')[0] || 'recruiter';
  const startupName = recruiter.startups?.name || recruiter.company_name || 'there';
  const startupLogoUrl = recruiter.startups?.logo_url || '';

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>▲ home</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.05 }}>Welcome back, <em>{firstName}.</em></h1>
        <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 10, fontFamily: 'var(--sans)' }}>Here's what's happening at {startupName}.</p>
      </div>

      {/* Stat cards — editorial metric display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 40 }}>
        <StatCard label="Live roles" value={liveJobs.length} />
        <StatCard label="Applicants" value={totalApps} />
        <StatCard label="Shortlisted" value={shortlisted} accent={shortlisted > 0} />
        <StatCard label="Hired" value={hired} accent={hired > 0} />
      </div>

      {/* Recent roles */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 4px' }}>▲ recent roles</p>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Active postings</h3>
        </div>
        <button onClick={onPostRole} style={btnPrimary(false)}><Plus size={13} /> Post a role</button>
      </div>

      {recentJobs.length === 0 ? (
        <EmptyState title="No roles posted yet." message="Post your first role to start receiving matched candidates."
          cta={<button onClick={onPostRole} style={{ ...btnPrimary(false), margin: '0 auto' }}><Plus size={13} /> Post a role</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {recentJobs.map(job => {
            const filled = (job.current_applicants || 0) / (job.max_applicants || 50);
            const status = job.status || (job.is_active ? 'live' : 'paused');
            const isLive = status === 'live';
            const jobApps = allApps.filter(a => a.job_id === job.id);
            return (
              <div key={job.id} onClick={() => onOpenRole(job)} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
                padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10, transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0, flex: 1 }}>
                    <CompanyLogo name={job.company} logoUrl={job.logo_url} startupLogoUrl={startupLogoUrl} size={34} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--text)', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</p>
                      <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: 3, letterSpacing: '0.03em' }}>{job.stipend} · {job.duration}</p>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '2px 7px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0, background: isLive ? 'var(--green-tint)' : 'var(--bg-subtle)', color: isLive ? 'var(--green)' : 'var(--text-dim)', border: `1px solid ${isLive ? 'var(--green)' : 'var(--border)'}` }}>{isLive ? '● Live' : '⏸'}</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.03em' }}><MapPin size={9} /> {job.location}</span>
                  <span style={{ fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.03em' }}><Users size={9} /> {job.current_applicants || 0}</span>
                </div>
                <div style={{ height: 2, borderRadius: 1, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(filled, 1) * 100}%`, background: filled > 0.8 ? 'var(--red)' : filled > 0.5 ? 'var(--amber)' : 'var(--accent)', borderRadius: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>{jobApps.length} applicant{jobApps.length !== 1 ? 's' : ''}</span>
                  <ChevronRight size={12} style={{ color: 'var(--text-dim)' }} />
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
// ROLES TAB — redesigned with FIX #1
// ═══════════════════════════════════════════════════════════════════════════
function RolesTab({ jobs, onCopyLink, onTogglePause, onDelete, onPostRole, onEdit, recruiter, showToast, initialOpenJob }) {
  const [subTab, setSubTab] = useState('live');
  const [openJob, setOpenJob] = useState(initialOpenJob || null);
  const startupLogoUrl = recruiter?.startups?.logo_url || '';

  useEffect(() => {
    if (initialOpenJob) setOpenJob(initialOpenJob); else setOpenJob(null);
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
    <RoleDetailView job={openJob} onBack={() => setOpenJob(null)} onCopyLink={onCopyLink}
      onEdit={(job) => { onEdit(job); }} onTogglePause={onTogglePause} onDelete={onDelete}
      recruiter={recruiter} showToast={showToast} />
  );

  return (
    <div>
      <PageHeader eyebrow="Roles" title={<>Manage your <em>roles.</em></>}
        action={<button onClick={onPostRole} style={btnPrimary(false)}><Plus size={13} /> Post a role</button>} />
      <SubTabStrip tabs={SUBTABS} active={subTab} onChange={setSubTab} />
      {grouped[subTab].length === 0 ? (
        <EmptyState title={`No ${subTab} roles.`}
          message={subTab === 'live' ? 'Post your first role to start receiving matched candidates.' : `Roles you ${subTab === 'paused' ? 'pause' : 'close'} will appear here.`}
          cta={subTab === 'live' && <button onClick={onPostRole} style={{ ...btnPrimary(false), margin: '0 auto' }}><Plus size={13} /> Post a role</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {grouped[subTab].map(job => (
            <RoleCard key={job.id} job={job} startupLogoUrl={startupLogoUrl}
              onClick={() => setOpenJob(job)} onTogglePause={onTogglePause}
              onCopyLink={onCopyLink} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE TAB
// ═══════════════════════════════════════════════════════════════════════════
function ProfileCard({ title, canEdit, children, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const handleSave = async () => { await onSave(); setEditing(false); };
  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${editing ? 'var(--accent-mid)' : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.15s' }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)', margin: 0 }}>{title}</p>
        {canEdit && !editing && (
          <button onClick={() => setEditing(true)} style={{ ...iconBtn, width: 28, height: 28, padding: 0, justifyContent: 'center' }} title="Edit"><Edit2 size={12} /></button>
        )}
        {editing && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setEditing(false)} style={{ ...btnGhost(), padding: '5px 12px', fontSize: 11 }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary(saving), padding: '5px 12px', fontSize: 11 }}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        )}
      </div>
      <div style={{ padding: '18px 20px' }}>{children(editing)}</div>
    </div>
  );
}

function StartupProfileForm({ startup, recruiter, canEdit, onUpdate, showToast }) {
  const [form, setForm] = useState({
    name: startup.name || '', tagline: startup.tagline || '', about: startup.about || '',
    website: startup.website || '', industry: startup.industry || '', stage: startup.stage || '',
    team_size: startup.team_size || '', founded_year: startup.founded_year || '',
    hq_location: startup.hq_location || '', logo_url: startup.logo_url || '', banner_url: startup.banner_url || '',
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

  const saveAll = async () => {
    if (!startup.id) { showToast('No startup linked.', 'error'); throw new Error('No startup'); }
    setSaving(true);
    try { await updateStartupProfile(startup.id, form); showToast('Updated'); onUpdate(); }
    catch (e) { showToast(e.message || 'Failed', 'error'); throw e; }
    finally { setSaving(false); }
  };

  const infoRows = [
    { key: 'website', label: 'Website', ph: 'https://…' },
    { key: 'hq_location', label: 'HQ Location', ph: 'Bangalore, India' },
    { key: 'industry', label: 'Industry', ph: 'HR Tech / EdTech / SaaS' },
    { key: 'founded_year', label: 'Founded', ph: '2024', type: 'number' },
  ];

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!canEdit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 6, background: 'var(--amber-tint)', border: '1px solid var(--amber)' }}>
          <Lock size={13} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--amber)', margin: 0, letterSpacing: '0.04em' }}>Read-only — only founders can edit the startup profile.</p>
        </div>
      )}
      <ProfileCard title="Brand" canEdit={canEdit} onSave={saveAll} saving={saving}>
        {(editing) => (
          <div>
            <div style={{ position: 'relative', height: 120, borderRadius: 8, overflow: 'hidden', background: bannerPreview ? 'transparent' : 'var(--bg)', marginBottom: 0, border: '1px solid var(--border)' }}>
              {bannerPreview ? <img src={bannerPreview} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>No banner image</p>
                </div>
              )}
              {editing && (
                <label style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 5, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>
                  <Camera size={10} /> Change banner
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />
                </label>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: -28, paddingLeft: 16, marginBottom: 14 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '3px solid var(--bg-card)' }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--accent-tint)', border: '3px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
                    {(form.name || '?').slice(0, 2).toUpperCase()}
                  </div>
                )}
                {editing && (
                  <label style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)' }}>
                    <Camera size={10} style={{ color: 'var(--cream)' }} />
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                  </label>
                )}
              </div>
              {!editing && (
                <div style={{ paddingBottom: 2 }}>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{form.name || <em style={{ color: 'var(--text-dim)' }}>Startup name</em>}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '3px 0 0' }}>{form.tagline || <span style={{ fontStyle: 'italic' }}>No tagline</span>}</p>
                </div>
              )}
            </div>
            {editing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><Label required>Startup name</Label><FocusInput value={form.name} onChange={e => set('name')(e.target.value)} placeholder="HUNT Labs" /></div>
                <div><Label>Tagline</Label><FocusInput value={form.tagline} onChange={e => set('tagline')(e.target.value)} placeholder="Skill-first internships" /></div>
              </div>
            )}
          </div>
        )}
      </ProfileCard>

      <ProfileCard title="Basic Info" canEdit={canEdit} onSave={saveAll} saving={saving}>
        {(editing) => editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {infoRows.map(({ key, label, ph, type }) => (
              <div key={key}><Label>{label}</Label><FocusInput type={type || 'text'} value={form[key]} onChange={e => set(key)(e.target.value)} placeholder={ph} /></div>
            ))}
            <div><Label>Stage</Label>
              <FocusSelect value={form.stage} onChange={e => set('stage')(e.target.value)}>
                <option value="">—</option><option>Pre-seed</option><option>Seed</option>
                <option>Series A</option><option>Series B</option><option>Bootstrapped</option>
              </FocusSelect>
            </div>
            <div><Label>Team size</Label>
              <FocusSelect value={form.team_size} onChange={e => set('team_size')(e.target.value)}>
                <option value="">—</option><option>1-10</option><option>11-50</option><option>51-200</option><option>200+</option>
              </FocusSelect>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[{ label: 'Website', val: form.website }, { label: 'HQ', val: form.hq_location }, { label: 'Industry', val: form.industry }, { label: 'Founded', val: form.founded_year }, { label: 'Stage', val: form.stage }, { label: 'Team size', val: form.team_size }].map(({ label, val: v }) => (
              <div key={label}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 13, color: v ? 'var(--text)' : 'var(--text-dim)', margin: 0, fontStyle: v ? 'normal' : 'italic' }}>{v || 'Not set'}</p>
              </div>
            ))}
          </div>
        )}
      </ProfileCard>

      <ProfileCard title="About" canEdit={canEdit} onSave={saveAll} saving={saving}>
        {(editing) => editing ? (
          <FocusTextarea value={form.about} onChange={e => set('about')(e.target.value)} rows={4} placeholder="What does your startup do? What problems do you solve?" />
        ) : (
          <p style={{ fontSize: 13, color: form.about ? 'var(--text-mid)' : 'var(--text-dim)', lineHeight: 1.7, margin: 0, fontStyle: form.about ? 'normal' : 'italic' }}>
            {form.about || 'No description yet. Add one to help candidates understand your company.'}
          </p>
        )}
      </ProfileCard>
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
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ProfileCard title="Your Profile" canEdit={true} onSave={save} saving={saving}>
        {(editing) => (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: editing ? 18 : 0, paddingBottom: editing ? 16 : 0, borderBottom: editing ? '1px solid var(--border)' : 'none' }}>
              <Avatar name={form.contact_name} size={46} />
              <div>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{form.contact_name || 'Your name'}</p>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', margin: '3px 0 0', letterSpacing: '0.04em' }}>{form.title || <span style={{ fontStyle: 'italic' }}>No title</span>} · {recruiter.startups?.name || 'your startup'}</p>
              </div>
            </div>
            {editing && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><Label required>Full name</Label><FocusInput value={form.contact_name} onChange={e => set('contact_name')(e.target.value)} /></div>
                <div><Label>Title</Label><FocusInput value={form.title} onChange={e => set('title')(e.target.value)} placeholder="Head of Talent" /></div>
                <div><Label>Email</Label><FocusInput value={form.email} disabled type="email" /></div>
                <div><Label>Phone</Label><FocusInput value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="+91…" /></div>
                <div><Label>LinkedIn</Label><FocusInput value={form.linkedin_url} onChange={e => set('linkedin_url')(e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
                <div><Label>Role in company</Label>
                  <FocusSelect value={form.role_in_company} onChange={e => set('role_in_company')(e.target.value)}>
                    <option value="founder">Founder</option>
                    <option value="hiring_manager">Hiring manager</option>
                    <option value="recruiter">Recruiter</option>
                  </FocusSelect>
                </div>
              </div>
            )}
            {!editing && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                {[{ label: 'Phone', val: form.phone }, { label: 'Email', val: form.email }, { label: 'LinkedIn', val: form.linkedin_url ? 'Connected' : null }, { label: 'Role', val: form.role_in_company }].map(({ label, val: v }) => v ? (
                  <div key={label}>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, textTransform: label === 'Role' ? 'capitalize' : 'none' }}>{v}</p>
                  </div>
                ) : null)}
              </div>
            )}
          </div>
        )}
      </ProfileCard>

      <ProfileCard title="Bio" canEdit={true} onSave={save} saving={saving}>
        {(editing) => editing ? (
          <FocusTextarea value={form.bio} onChange={e => set('bio')(e.target.value)} rows={3} placeholder="Short intro that candidates will see when you reach out." />
        ) : (
          <p style={{ fontSize: 13, color: form.bio ? 'var(--text-mid)' : 'var(--text-dim)', lineHeight: 1.7, margin: 0, fontStyle: form.bio ? 'normal' : 'italic' }}>
            {form.bio || 'No bio yet. Candidates see this when you reach out.'}
          </p>
        )}
      </ProfileCard>
    </div>
  );
}

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

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS MODAL — redesigned
// ═══════════════════════════════════════════════════════════════════════════
function SettingsModal({ theme, setTheme, onClose, onSignOut }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 4px' }}>▲ settings</p>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Preferences</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
          <div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)', margin: '0 0 4px' }}>Appearance</p>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>Light or dark mode</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['light', 'dark'].map(t => (
              <button key={t} onClick={() => setTheme(t)} style={{ padding: '8px 14px', borderRadius: 6, fontSize: 11, fontFamily: 'var(--mono)', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, background: theme === t ? 'var(--ink)' : 'transparent', border: `1px solid ${theme === t ? 'var(--ink)' : 'var(--border)'}`, color: theme === t ? 'var(--cream)' : 'var(--text-mid)', fontWeight: theme === t ? 700 : 500 }}>
                {t === 'light' ? <><Sun size={11} /> Light</> : <><Moon size={11} /> Dark</>}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18 }}>
          <div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)', margin: '0 0 4px' }}>Sign out</p>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>You'll need to log in again</p>
          </div>
          <button onClick={onSignOut} style={{ ...btnGhost(), color: 'var(--red)', borderColor: 'var(--red)', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}><LogOut size={12} /> Sign out</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SHELL — redesigned sidebar + font imports
// ═══════════════════════════════════════════════════════════════════════════
export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme]           = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [loading, setLoading]       = useState(true);
  const [recruiter, setRecruiter]   = useState(null);
  const [jobs, setJobs]             = useState([]);
  const [allApps, setAllApps]       = useState([]);
  const [activeTab, setActiveTab]   = useState('home');
  const [toast, setToast]           = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSettings, setShowSettings]       = useState(false);
  const [showPostDrawer, setShowPostDrawer]   = useState(false);
  const [editJob, setEditJob]                 = useState(null);
  const [pendingOpenRole, setPendingOpenRole] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

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
        const j = await getRecruiterJobs(r.id);
        setJobs(j);
        try { const a = await getAllApplicationsForRecruiter(r.id); setAllApps(a); }
        catch (appErr) { console.warn('Applications load failed (non-fatal):', appErr); }
      } catch (e) {
        console.error('Dashboard load failed:', e);
        showToast(e.message || 'Failed to load dashboard', 'error');
      } finally { setLoading(false); }
    })();
  }, []);

  const refreshAll = async () => {
    if (!recruiter) return;
    const j = await getRecruiterJobs(recruiter.id);
    setJobs(j);
    try { const a = await getAllApplicationsForRecruiter(recruiter.id); setAllApps(a); }
    catch (e) { console.warn('Apps refresh failed:', e); }
  };
  const refreshRecruiter = async () => { const r = await getRecruiterProfile(); setRecruiter(r); };

  const handleOpenRole = (job) => { setPendingOpenRole(job); setActiveTab('roles'); };
  const handleTogglePause = async (job) => {
    const status = job.status || (job.is_active ? 'live' : 'paused');
    const next = status === 'live' ? 'paused' : 'live';
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
    try { await deleteJob(job.id); setJobs(j => j.filter(x => x.id !== job.id)); showToast('Role deleted'); }
    catch (e) { showToast(e.message || 'Delete failed', 'error'); }
  };
  const handleEdit = (job) => { setEditJob(job); setShowPostDrawer(true); };
  const handleStatusChange = async (appId, status) => {
    const app = allApps.find(a => a.id === appId);
    try {
      await updateApplicationStatus(appId, status, app?.students?.id, { role: app?.jobs?.role, company: app?.jobs?.company || recruiter?.startups?.name });
      setAllApps(a => a.map(x => x.id === appId ? { ...x, status } : x));
      const labels = { shortlisted: 'Shortlisted ✓', interview: 'Moved to interview', hired: 'Hired! 🎉', rejected: 'Passed', pending: 'Status cleared' };
      showToast(labels[status] || 'Updated');
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  };
  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); } catch (e) { console.error(e); }
  };

  const unreadCount = allApps.filter(a => a.status === 'pending').length;
  const initials = recruiter?.contact_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  // Loading screen
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, letterSpacing: '0.25em', color: 'var(--text)', marginBottom: 24, textTransform: 'uppercase' }}>HUNT</div>
        <div style={{ width: 32, height: 2, background: 'var(--accent)', margin: '0 auto', animation: 'huntLoad 1.2s ease-in-out infinite' }} />
      </div>
    </div>
  );

  if (!recruiter) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--text)', marginBottom: 10, fontWeight: 400 }}>Finish setting up your account</p>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>We couldn't find your recruiter profile. Please complete onboarding.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes huntFadeDown { from { opacity:0; transform: translateX(-50%) translateY(-8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        @keyframes huntFadeIn   { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes huntSpin     { to { transform: rotate(360deg); } }
        @keyframes huntLoad     { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(2.5); } }
        * { box-sizing: border-box; }
        button:disabled { opacity: 0.45; cursor: not-allowed !important; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-dim); }
        .hunt-nav-btn:hover { background: var(--bg-hover) !important; }
        .hunt-card:hover { border-color: var(--border-mid) !important; }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {showSettings && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} onSignOut={handleSignOut} />}
      <NotificationDrawer open={showNotifications} onClose={() => setShowNotifications(false)} recruiter={recruiter} />

      {recruiter && (
        <PostRoleDrawer
          recruiter={recruiter} open={showPostDrawer} editJob={editJob}
          onClose={() => { setShowPostDrawer(false); setEditJob(null); }}
          showToast={showToast}
          onSuccess={async () => {
            const wasEdit = !!editJob;
            setEditJob(null);
            await refreshAll();
            showToast(wasEdit ? 'Role updated!' : 'Role posted! 🚀');
            setPendingOpenRole(null);
            setActiveTab('roles');
          }}
        />
      )}

      {/* ── SIDEBAR — redesigned ────────────────────────────────────────── */}
      <aside style={{
        width: 220, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
        borderRight: '1px solid var(--border)', background: 'var(--bg-card)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', align: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--text)', textTransform: 'uppercase' }}>HUNT</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'var(--accent)', letterSpacing: '0.08em', marginTop: 3 }}>v0.4 BETA</span>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'var(--text-dim)', margin: '4px 0 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recruiter</p>
        </div>

        {/* Primary CTA */}
        <div style={{ padding: '14px 12px 10px' }}>
          <button onClick={() => setShowPostDrawer(true)} style={{
            ...btnAccent(), width: '100%', justifyContent: 'center',
            padding: '10px 14px', fontSize: 10, letterSpacing: '0.1em',
          }}>
            <Plus size={13} /> Post a role
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '4px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} className="hunt-nav-btn"
                onClick={() => { setActiveTab(id); if (id !== 'roles') setPendingOpenRole(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '9px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: active ? 'var(--accent-tint)' : 'transparent',
                  borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  color: active ? 'var(--accent)' : 'var(--text-dim)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, fontWeight: active ? 700 : 500,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  textAlign: 'left', transition: 'all 0.12s',
                }}>
                <Icon size={14} style={{ flexShrink: 0 }} />{label}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
          {/* Company pill */}
          <div style={{ padding: '9px 12px', borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)', marginBottom: 8 }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Company</p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, letterSpacing: '0.02em' }}>{recruiter?.startups?.name || recruiter?.company_name || 'Your startup'}</p>
          </div>

          {/* Icon row */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {/* Bell */}
            <button className="hunt-nav-btn" onClick={() => setShowNotifications(true)} style={{
              flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: '1px solid var(--border)', cursor: 'pointer',
              padding: 8, borderRadius: 6, color: 'var(--text-dim)', transition: 'all 0.12s',
            }}>
              <Bell size={13} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', border: '1.5px solid var(--bg-card)' }} />
              )}
            </button>
            {/* Theme */}
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="hunt-nav-btn" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: '1px solid var(--border)', cursor: 'pointer',
              padding: 8, borderRadius: 6, color: 'var(--text-dim)', transition: 'all 0.12s',
            }}>
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </button>
          </div>

          {/* Account */}
          <div onClick={() => setShowAccountMenu(p => !p)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            borderRadius: 6, cursor: 'pointer', transition: 'background 0.12s',
            background: showAccountMenu ? 'var(--bg)' : 'transparent',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => { if (!showAccountMenu) e.currentTarget.style.background = 'transparent'; }}
          >
            <Avatar name={recruiter?.contact_name} size={26} />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, letterSpacing: '0.02em' }}>{recruiter?.contact_name}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'var(--text-dim)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{recruiter?.role_in_company || 'recruiter'}</p>
            </div>
            <ChevronDown size={10} style={{ flexShrink: 0, color: 'var(--text-dim)', transform: showAccountMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </div>

          {/* Account menu — opens upward */}
          {showAccountMenu && (
            <>
              <div onClick={() => setShowAccountMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 499 }} />
              <div style={{
                position: 'absolute', bottom: '100%', left: 8, right: 8, marginBottom: 6, zIndex: 500,
                background: 'var(--bg-card)', border: '1px solid var(--ink)', borderRadius: 8,
                overflow: 'hidden', boxShadow: '4px 4px 0 0 var(--ink)',
              }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'var(--text-dim)', marginBottom: 3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Signed in as</p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{recruiter?.email || recruiter?.contact_name}</p>
                </div>
                <div style={{ padding: 4 }}>
                  {[
                    { label: 'Profile',  action: () => { setActiveTab('profile'); setShowAccountMenu(false); } },
                    { label: 'Settings', action: () => { setShowSettings(true); setShowAccountMenu(false); } },
                    { label: 'Support',  action: () => { window.open('mailto:support@hunt.so'); setShowAccountMenu(false); } },
                  ].map(item => (
                    <button key={item.label} onClick={item.action} style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '9px 10px',
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: 'var(--text-mid)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 5,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >{item.label}</button>
                  ))}
                </div>
                <div style={{ height: 1, background: 'var(--border)', margin: '0 4px' }} />
                <div style={{ padding: 4 }}>
                  <button onClick={handleSignOut} style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    textAlign: 'left', padding: '9px 10px', borderRadius: 5,
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: 'var(--red)', background: 'var(--red-tint)', border: 'none', cursor: 'pointer', fontWeight: 700,
                  }}>
                    <LogOut size={11} /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', maxHeight: '100vh' }}>
        <div style={{ padding: '36px 44px 100px', maxWidth: 1320, margin: '0 auto', animation: 'huntFadeIn 0.3s ease' }}>
          {activeTab === 'home'    && <HomeTab recruiter={recruiter} jobs={jobs} allApps={allApps} onPostRole={() => setShowPostDrawer(true)} onOpenRole={handleOpenRole} />}
          {activeTab === 'roles'   && <RolesTab key={jobs.length} jobs={jobs} onCopyLink={handleCopyLink} onTogglePause={handleTogglePause} onDelete={handleDelete} onEdit={handleEdit} onPostRole={() => setShowPostDrawer(true)} recruiter={recruiter} showToast={showToast} initialOpenJob={pendingOpenRole} />}
          {activeTab === 'profile' && <ProfileTab recruiter={recruiter} onUpdate={refreshRecruiter} showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}
