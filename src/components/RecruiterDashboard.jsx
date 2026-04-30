// src/components/RecruiterDashboard.jsx
//
// ════════════════════════════════════════════════════════════════════════════
// HUNT — RECRUITER DASHBOARD (v2)
// ════════════════════════════════════════════════════════════════════════════
//
// SETUP:
//   1. Drop into src/components/RecruiterDashboard.jsx
//   2. App.jsx route (no change to existing pattern):
//        <Route path="/recruiter/dashboard" element={user ? <RecruiterDashboard /> : <Navigate to="/" />} />
//
// SUPABASE — run this once (idempotent):
//
//   -- Existing job columns (some you already had)
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS recruiter_id UUID REFERENCES recruiters(id);
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS share_slug TEXT UNIQUE;
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS nice_to_have JSONB DEFAULT '[]';
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS required_tools JSONB DEFAULT '[]';
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS required_skills JSONB DEFAULT '[]';
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS current_applicants INT DEFAULT 0;
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS max_applicants INT DEFAULT 50;
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS logo TEXT;
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Paid Internship';
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'live'; -- live | paused | closed
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS minimum_match_threshold INT DEFAULT 50;
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS positions INT DEFAULT 1;
//
//   -- Application status flow (the full pipeline: pending → shortlisted → interview → hired/rejected)
//   ALTER TABLE applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
//   ALTER TABLE applications ADD COLUMN IF NOT EXISTS recruiter_note TEXT;
//   ALTER TABLE applications ADD COLUMN IF NOT EXISTS hired_at TIMESTAMPTZ;
//   ALTER TABLE applications ADD COLUMN IF NOT EXISTS interviewed_at TIMESTAMPTZ;
//   ALTER TABLE applications ADD COLUMN IF NOT EXISTS shortlisted_at TIMESTAMPTZ;
//
//   -- Startup (company) profile — separate from individual recruiter
//   CREATE TABLE IF NOT EXISTS startups (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     name TEXT NOT NULL,
//     slug TEXT UNIQUE,
//     logo_emoji TEXT DEFAULT '🚀',
//     tagline TEXT,
//     about TEXT,
//     website TEXT,
//     industry TEXT,
//     stage TEXT, -- 'pre-seed' | 'seed' | 'series-a' etc
//     team_size TEXT,
//     founded_year INT,
//     hq_location TEXT,
//     created_at TIMESTAMPTZ DEFAULT now()
//   );
//   ALTER TABLE recruiters ADD COLUMN IF NOT EXISTS startup_id UUID REFERENCES startups(id);
//   ALTER TABLE recruiters ADD COLUMN IF NOT EXISTS role_in_company TEXT DEFAULT 'recruiter'; -- 'founder' | 'recruiter' | 'hiring_manager'
//
//   -- Successful hires log (powers stats + future "successful hires" showcase)
//   CREATE TABLE IF NOT EXISTS hires (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     application_id UUID REFERENCES applications(id),
//     student_id UUID REFERENCES students(id),
//     job_id UUID REFERENCES jobs(id),
//     recruiter_id UUID REFERENCES recruiters(id),
//     hired_at TIMESTAMPTZ DEFAULT now(),
//     internship_completed BOOLEAN DEFAULT false,
//     recruiter_rating INT, -- 1-5, post-internship
//     recruiter_review TEXT
//   );
//
// FILE STRUCTURE (top-down, easy to navigate):
//   ┌─ Design tokens & theme
//   ├─ Supabase helpers (jobs, applications, startup, AI)
//   ├─ Constants (skills, emojis, status labels)
//   ├─ Reusable atoms (FocusInput, Label, Toast, Avatar, StatusPill, EmptyState)
//   ├─ TAB COMPONENTS:
//   │    • HomeTab           — overview, stats, recent activity, top picks
//   │    • RolesTab          — Live | Paused | Closed sub-tabs, grid of cards, inline detail
//   │    • CandidatesTab     — Top 6/10/15 highlight reel across all roles
//   │    • PipelineTab       — Shortlisted | Interview | Hired kanban-ish view
//   │    • PostRoleTab       — Manual form + AI chat side-by-side
//   │    • ProfileTab        — Startup profile + Recruiter profile sub-tabs
//   │    • NetworkTab        — Stub (future)
//   │    • SettingsTab
//   ├─ Shared sub-views:
//   │    • RoleDetailView    — opened inline when a role card is clicked
//   │    • ApplicantCard     — list-row applicant
//   │    • ApplicantSnapshot — full-detail panel
//   │    • PostRoleManual    — the form (lifted from previous version, refined)
//   │    • PostRoleAI        — chat-driven role builder
//   └─ Main shell with sidebar
// ════════════════════════════════════════════════════════════════════════════

// src/components/RecruiterDashboard.jsx
//
// ════════════════════════════════════════════════════════════════════════════
// HUNT — RECRUITER DASHBOARD (v2 — fixed, no AI)
// ════════════════════════════════════════════════════════════════════════════
//
// Run 01_database_migration.sql in Supabase SQL Editor BEFORE using this file.
// After running the SQL, go to Supabase Settings → API → "Reload schema".
// ════════════════════════════════════════════════════════════════════════════

// src/components/RecruiterDashboard.jsx
//
// ════════════════════════════════════════════════════════════════════════════
// HUNT — RECRUITER DASHBOARD (v3 — refined to match StudentDashboard polish)
// ════════════════════════════════════════════════════════════════════════════
//
// Design rules borrowed from StudentDashboard:
//   • Narrow 210px sidebar with simple logo + nav + bottom account pill
//   • Editorial New (Georgia) for all H1s & numbers, lowercase italic emphasis
//   • Eyebrow = text-dim uppercase (NOT ember orange) — calmer, less busy
//   • Active nav = bg-subtle background, text colour goes from dim → primary
//   • No accent on "Post a role" — uniform with other nav items
//   • Tab underline uses --text (black) not --ember
//   • Generous whitespace, subtle borders, minimal dense colour
//   • Theme + Bell as small icon row above account pill
//   • Account pill expands a dropdown (Profile / Settings / Support / Sign out)
//
// Run 01_database_migration.sql in Supabase SQL Editor BEFORE using this file.
// After running the SQL, go to Supabase Settings → API → "Reload schema".
// ════════════════════════════════════════════════════════════════════════════

// src/components/RecruiterDashboard.jsx
//
// ════════════════════════════════════════════════════════════════════════════
// HUNT — RECRUITER DASHBOARD (v4 — Clean 5-tab nav, mirrors StudentDashboard)
// ════════════════════════════════════════════════════════════════════════════
//
// NAV STRUCTURE:
//   Home     → overview, stats, quick actions (Post a role triggers drawer)
//   Roles    → subtabs: Live | Paused | Closed   +  "Post a role" button top-right
//   Hiring   → subtabs: Top Picks | Pipeline
//   Profile  → subtabs: Startup | You
//   Network  → stub (mirrors StudentDashboard pattern)
//
//  "Post a role" is a slide-over drawer — accessible from Home quick actions
//   AND Roles tab header button. No longer a standalone sidebar tab.
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, LogOut, Sun, Moon, X, ChevronRight,
  MapPin, Users, Link2, Trash2, Edit3,
  ArrowLeft, Pause, Play, ExternalLink, Github, Building2, Home,
  Layers, UserCheck, GitBranch, Network, Settings, Sparkles,
  Bookmark, ThumbsDown, Phone, Award, Bell, Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOut } from '../services/supabase';

// ═══════════════════════════════════════════════════════════════════════════
// 1. DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════
const tokens = {
  light: {
    '--bg':         '#FAFAF8',
    '--bg-card':    '#FFFFFF',
    '--bg-subtle':  '#F5F5F2',
    '--bg-hover':   '#F0EFEA',
    '--border':     '#EBEBEA',
    '--border-mid': '#D6D6D3',
    '--text':       '#0A0A0A',
    '--text-mid':   '#5A5A56',
    '--text-dim':   '#9B9B97',
    '--green':      '#1A7A4A',
    '--green-tint': '#E8F5EE',
    '--green-text': '#1A7A4A',
    '--red':        '#C0392B',
    '--red-tint':   '#FDECEA',
    '--amber':      '#92600A',
    '--amber-tint': '#FDF3E3',
    '--blue':       '#2563EB',
    '--blue-tint':  'rgba(37,99,235,0.08)',
    '--purple':     '#7C3AED',
    '--purple-tint':'rgba(124,58,237,0.08)',
  },
  dark: {
    '--bg':         '#0A0A0A',
    '--bg-card':    '#111110',
    '--bg-subtle':  '#1A1A18',
    '--bg-hover':   '#222220',
    '--border':     '#2A2A28',
    '--border-mid': '#3A3A38',
    '--text':       '#FAFAF8',
    '--text-mid':   '#9B9B97',
    '--text-dim':   '#5A5A56',
    '--green':      '#2EAD6A',
    '--green-tint': '#0D2B1A',
    '--green-text': '#2EAD6A',
    '--red':        '#E05C4B',
    '--red-tint':   '#2B1210',
    '--amber':      '#D4A84B',
    '--amber-tint': '#2B2010',
    '--blue':       '#60A5FA',
    '--blue-tint':  'rgba(96,165,250,0.1)',
    '--purple':     '#A78BFA',
    '--purple-tint':'rgba(167,139,250,0.12)',
  }
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
    .select(`*, students(*)`)
    .eq('job_id', jobId)
    .order('match_score', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getAllApplicationsForRecruiter(recruiterId) {
  const { data: jobs, error: jobsErr } = await supabase
    .from('jobs').select('id, role, logo').eq('recruiter_id', recruiterId);
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

async function updateApplicationStatus(appId, status, extra = {}) {
  const patch = { status, ...extra };
  if (status === 'shortlisted') patch.shortlisted_at = new Date().toISOString();
  if (status === 'interview')   patch.interviewed_at = new Date().toISOString();
  if (status === 'hired')       patch.hired_at       = new Date().toISOString();
  const { data, error } = await supabase
    .from('applications').update(patch).eq('id', appId).select().single();
  if (error) throw new Error(error.message || 'Status update failed');
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
const LOGO_EMOJIS = ['🚀','⚡','🎯','💡','🔥','🌊','🛠️','📊','🎨','🌱','⭐','🦾','🧬','🌐','🔮','🎮'];

// ─── 5 sidebar tabs — no "Post a role" slot ──────────────────────────────
const NAV_ITEMS = [
  { id: 'home',    label: 'Home',    icon: Home },
  { id: 'roles',   label: 'Roles',   icon: Layers },
  { id: 'hiring',  label: 'Hiring',  icon: UserCheck },
  { id: 'profile', label: 'Profile', icon: Building2 },
  { id: 'network', label: 'Network', icon: Network },
];

const STATUS_META = {
  pending:     { label: 'Pending',     color: 'var(--text-dim)',   bg: 'var(--bg-subtle)',  border: 'var(--border)' },
  shortlisted: { label: 'Shortlisted', color: 'var(--green-text)', bg: 'var(--green-tint)', border: 'var(--green)' },
  interview:   { label: 'Interview',   color: 'var(--blue)',       bg: 'var(--blue-tint)',  border: 'var(--blue)' },
  hired:       { label: 'Hired',       color: 'var(--purple)',     bg: 'var(--purple-tint)',border: 'var(--purple)' },
  rejected:    { label: 'Passed',      color: 'var(--red)',        bg: 'var(--red-tint)',   border: 'var(--red)' },
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
    onBlur={e => e.target.style.borderColor = 'var(--border)'} />;
}
function FocusSelect({ style, children, ...props }) {
  return <select {...props} style={{ ...inp, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--text)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'}>{children}</select>;
}
function FocusTextarea({ style, ...props }) {
  return <textarea {...props} style={{ ...inp, resize: 'vertical', minHeight: 70, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--text)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'} />;
}
function Label({ children, required }) {
  return <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
    {children}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
  </p>;
}
function Toast({ msg, type }) {
  return <div style={{
    position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
    zIndex: 9999, padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 500,
    background: type === 'error' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)',
    color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: 'fadeDown 0.2s ease',
    maxWidth: '90vw', textAlign: 'center',
  }}>{msg}</div>;
}
function Avatar({ name, size = 36 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  return <div style={{
    width: size, height: size, borderRadius: '50%',
    background: 'var(--green-tint)', border: `1px solid var(--green)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.32, fontWeight: 700, color: 'var(--green)', flexShrink: 0,
  }}>{initials}</div>;
}
function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return <span style={{
    fontSize: 9, padding: '3px 8px', borderRadius: 8, fontWeight: 500,
    background: m.bg, color: m.color, border: `1px solid ${m.border}`,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  }}>{m.label}</span>;
}
function EmptyState({ icon = '🎯', title, message, cta }) {
  return <div style={{
    textAlign: 'center', padding: '64px 24px',
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
  }}>
    <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
    <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', marginBottom: 6, fontWeight: 400 }}>{title}</p>
    <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: cta ? 18 : 0, lineHeight: 1.5 }}>{message}</p>
    {cta}
  </div>;
}
function ScoreNumber({ score, size = 16 }) {
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
  return <span style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: size, color, lineHeight: 1, fontWeight: 400 }}>{score}%</span>;
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
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
          {eyebrow}
        </p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 8, lineHeight: 1.5, maxWidth: 560 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0, marginTop: 4 }}>{action}</div>}
    </div>
  );
}

// Reusable underline sub-tab strip (matches StudentDashboard exactly)
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

// ═══════════════════════════════════════════════════════════════════════════
// 5. POST ROLE — SLIDE-OVER DRAWER
//    Triggered from: Roles tab header button OR Home quick action
// ═══════════════════════════════════════════════════════════════════════════
// ─── UPDATED PostRoleDrawer for RecruiterDashboard.jsx ─────────────────────
// Drop this in to replace the existing PostRoleDrawer function entirely.
// Adds: What You'll Do, Perks, and unlimited custom sections.

// ─── UPDATED PostRoleDrawer for RecruiterDashboard.jsx ─────────────────────
// Drop this in to replace the existing PostRoleDrawer function entirely.
// Adds: What You'll Do, Perks, and unlimited custom sections.

function PostRoleDrawer({ recruiter, open, onClose, onSuccess, showToast }) {
  const [skillInput, setSkillInput]       = useState('');
  const [niceInput, setNiceInput]         = useState('');
  const [whatDoInput, setWhatDoInput]     = useState('');
  const [perkInput, setPerkInput]         = useState('');
  const [newSecHeading, setNewSecHeading] = useState('');
  const [newSecItemText, setNewSecItemText] = useState({}); // {sectionIdx: value}
  const [saving, setSaving]               = useState(false);

  const [form, setForm] = useState(() => ({
    logo: recruiter?.startups?.logo_emoji || '🚀',
    role: '', description: '', stipend: '', duration: '',
    location: '', type: 'Paid Internship', visibility: 'public',
    required_skills: [], nice_to_have: [],
    max_applicants: 50, minimum_match_threshold: 50, positions: 1,
    whatYoullDo: [],
    perks: [],
    sections: [],   // [{heading:'', items:['',...]}]
  }));

  useEffect(() => {
    if (!open) {
      setForm({
        logo: recruiter?.startups?.logo_emoji || '🚀',
        role: '', description: '', stipend: '', duration: '',
        location: '', type: 'Paid Internship', visibility: 'public',
        required_skills: [], nice_to_have: [],
        max_applicants: 50, minimum_match_threshold: 50, positions: 1,
        whatYoullDo: [], perks: [], sections: [],
      });
      setNewSecItemText({});
      setNewSecHeading('');
    }
  }, [open]);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  // Required skills
  const addSkill = () => {
    const name = skillInput.trim();
    if (!name || form.required_skills.find(s => s.name.toLowerCase() === name.toLowerCase())) return;
    setForm(f => ({ ...f, required_skills: [...f.required_skills, { name, weight: 0.25, level: 3 }] }));
    setSkillInput('');
  };
  const removeSkill = (name) => setForm(f => ({ ...f, required_skills: f.required_skills.filter(s => s.name !== name) }));

  // Nice to have
  const addNice = () => {
    const name = niceInput.trim();
    if (!name || form.nice_to_have.includes(name)) return;
    setForm(f => ({ ...f, nice_to_have: [...f.nice_to_have, name] }));
    setNiceInput('');
  };

  // What you'll do
  const addWhatDo = () => {
    const n = whatDoInput.trim(); if (!n) return;
    setForm(f => ({ ...f, whatYoullDo: [...f.whatYoullDo, n] }));
    setWhatDoInput('');
  };
  const removeWhatDo = (i) => setForm(f => ({ ...f, whatYoullDo: f.whatYoullDo.filter((_, idx) => idx !== i) }));

  // Perks
  const addPerk = () => {
    const n = perkInput.trim(); if (!n || form.perks.includes(n)) return;
    setForm(f => ({ ...f, perks: [...f.perks, n] }));
    setPerkInput('');
  };
  const removePerk = (i) => setForm(f => ({ ...f, perks: f.perks.filter((_, idx) => idx !== i) }));

  // Custom sections
  const addSection = () => {
    const h = newSecHeading.trim(); if (!h) return;
    setForm(f => ({ ...f, sections: [...f.sections, { heading: h, items: [] }] }));
    setNewSecHeading('');
  };
  const removeSection = (si) => setForm(f => ({ ...f, sections: f.sections.filter((_, i) => i !== si) }));
  const addSectionItem = (si) => {
    const text = (newSecItemText[si] || '').trim(); if (!text) return;
    setForm(f => ({
      ...f,
      sections: f.sections.map((s, i) => i === si ? { ...s, items: [...s.items, text] } : s),
    }));
    setNewSecItemText(prev => ({ ...prev, [si]: '' }));
  };
  const removeSectionItem = (si, ii) => setForm(f => ({
    ...f,
    sections: f.sections.map((s, i) => i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s),
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
      const slug = `${startupName.toLowerCase().replace(/\s+/g, '-')}-${form.role.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      await createJob({
        recruiter_id: recruiter.id, company: startupName,
        logo: form.logo, role: form.role.trim(), description: form.description.trim(),
        stipend: form.stipend.trim(), duration: form.duration.trim(), location: form.location.trim(),
        type: form.type, visibility: form.visibility, share_slug: slug,
        required_skills: normSkills, nice_to_have: form.nice_to_have,
        max_applicants: form.max_applicants,
        minimum_match_threshold: form.minimum_match_threshold,
        positions: form.positions, current_applicants: 0, is_active: true, status: 'live',
        what_youll_do: form.whatYoullDo,
        perks: form.perks,
        sections: form.sections,
      });
      onSuccess();
      onClose();
    } catch (e) { showToast('Failed: ' + (e.message || 'Unknown error'), 'error'); }
    finally    { setSaving(false); }
  };

  const chipBtn = (active) => ({
    flex: 1, padding: '8px', borderRadius: 8, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
    background: active ? 'var(--bg-subtle)' : 'transparent',
    border: `1px solid ${active ? 'var(--text)' : 'var(--border)'}`,
    color: active ? 'var(--text)' : 'var(--text-mid)',
    fontWeight: active ? 600 : 400,
  });

  // Reusable list-item row
  const ListItemRow = ({ item, onRemove }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 4 }}>
      <div style={{ width: 4, height: 4, background: 'var(--text-dim)', flexShrink: 0, marginTop: 6 }} />
      <span style={{ flex: 1, fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>{item}</span>
      <button onClick={onRemove} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0, flexShrink: 0 }}><X size={12} /></button>
    </div>
  );

  return (
    <>
      {open && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9000, backdropFilter: 'blur(2px)' }} />
      )}

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 520, background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
        zIndex: 9001, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: open ? '-8px 0 40px rgba(0,0,0,0.12)' : 'none',
      }}>
        {/* Drawer header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0, marginBottom: 4 }}>Post a role</p>
            <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, fontWeight: 400, color: 'var(--text)', margin: 0 }}>Hire your next <em>intern.</em></h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Logo + Role */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
              <div style={{ flexShrink: 0 }}>
                <Label>Logo</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, width: 152 }}>
                  {LOGO_EMOJIS.slice(0, 8).map(e => (
                    <button key={e} onClick={() => set('logo')(e)} style={{ width: 34, height: 34, borderRadius: 6, fontSize: 17, cursor: 'pointer', border: `1.5px solid ${form.logo === e ? 'var(--text)' : 'var(--border)'}`, background: 'var(--bg-subtle)' }}>{e}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <Label required>Role title</Label>
                <FocusInput value={form.role} onChange={e => set('role')(e.target.value)} placeholder="Backend Engineering Intern" />
              </div>
            </div>

            {/* Grid fields */}
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

            {/* Description */}
            <div>
              <Label>Description</Label>
              <FocusTextarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3}
                placeholder="What will the intern actually work on? Be specific — 2-3 sentences." />
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Role content sections</p>

              {/* What you'll do */}
              <div style={{ marginBottom: 18 }}>
                <Label>What you'll do</Label>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>These show as bullet points in "What you'll do" on the job card.</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <FocusInput value={whatDoInput} onChange={e => setWhatDoInput(e.target.value)}
                    placeholder="e.g. Build and ship features end to end"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addWhatDo())}
                    style={{ flex: 1 }} />
                  <button onClick={addWhatDo} style={{ ...btnPrimary(false), padding: '10px 14px' }}>Add</button>
                </div>
                {form.whatYoullDo.map((item, i) => <ListItemRow key={i} item={item} onRemove={() => removeWhatDo(i)} />)}
              </div>

              {/* Perks */}
              <div style={{ marginBottom: 18 }}>
                <Label>Perks & benefits</Label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <FocusInput value={perkInput} onChange={e => setPerkInput(e.target.value)}
                    placeholder="e.g. Flexible hours · Certificate of completion"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPerk())}
                    style={{ flex: 1 }} />
                  <button onClick={addPerk} style={{ ...btnGhost(), padding: '10px 14px' }}>Add</button>
                </div>
                {form.perks.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {form.perks.map((p, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', color: 'var(--text-mid)', background: 'var(--bg-subtle)' }}>
                        ✦ {p}
                        <button onClick={() => removePerk(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom sections */}
              <div>
                <Label>Custom sections</Label>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>
                  Create any section with your own heading — "Who we're looking for", "About us", "Tech stack". It shows directly on the job card.
                </p>

                {/* Existing sections */}
                {form.sections.map((sec, si) => (
                  <div key={si} style={{ marginBottom: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>▲ {sec.heading}</span>
                      <button onClick={() => removeSection(si)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><Trash2 size={12} /></button>
                    </div>
                    {sec.items.map((item, ii) => (
                      <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                        <div style={{ width: 4, height: 4, background: 'var(--text-dim)', flexShrink: 0, marginTop: 6 }} />
                        <span style={{ flex: 1, fontSize: 11, color: 'var(--text)' }}>{item}</span>
                        <button onClick={() => removeSectionItem(si, ii)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0, flexShrink: 0 }}><X size={10} /></button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <FocusInput
                        value={newSecItemText[si] || ''}
                        onChange={e => setNewSecItemText(prev => ({ ...prev, [si]: e.target.value }))}
                        placeholder="Add a point…"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSectionItem(si))}
                        style={{ flex: 1, fontSize: 11, padding: '6px 10px' }}
                      />
                      <button onClick={() => addSectionItem(si)} style={{ ...btnPrimary(false), padding: '6px 12px', fontSize: 11 }}>Add</button>
                    </div>
                  </div>
                ))}

                {/* New section */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <FocusInput
                    value={newSecHeading}
                    onChange={e => setNewSecHeading(e.target.value)}
                    placeholder="Heading — e.g. Who we're looking for"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSection())}
                    style={{ flex: 1 }}
                  />
                  <button onClick={addSection} style={{ ...btnGhost(), whiteSpace: 'nowrap' }}>
                    <Plus size={12} /> Add section
                  </button>
                </div>
              </div>
            </div>

            {/* Required skills */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Skills & config</p>
              <Label required>Required skills</Label>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>Type a skill and press Enter. Set level 1–5 for each.</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <FocusInput value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  placeholder="React, Node.js, Python…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  list="skill-suggestions-drawer" style={{ flex: 1 }} />
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

            {/* Nice to have */}
            <div>
              <Label>Nice to have (optional)</Label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <FocusInput value={niceInput} onChange={e => setNiceInput(e.target.value)}
                  placeholder="Docker, AWS…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNice())}
                  list="skill-suggestions-drawer" style={{ flex: 1 }} />
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

            {/* Config row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <Label>Visibility</Label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['public', 'private'].map(v => (
                    <button key={v} onClick={() => set('visibility')(v)} style={chipBtn(form.visibility === v)}>
                      {v === 'public' ? 'Public' : 'Link only'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Max applicants</Label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[25, 50, 100].map(n => (
                    <button key={n} onClick={() => set('max_applicants')(n)} style={chipBtn(form.max_applicants === n)}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Min match %</Label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[40, 50, 70].map(n => (
                    <button key={n} onClick={() => set('minimum_match_threshold')(n)} style={chipBtn(form.minimum_match_threshold === n)}>{n}%</button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sticky footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-card)' }}>
          <button onClick={handleSubmit} disabled={saving}
            style={{ ...btnPrimary(saving), width: '100%', justifyContent: 'center', padding: '13px 16px', fontSize: 13 }}>
            {saving ? 'Posting…' : 'Post role'} {!saving && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </>
  );
}
// ═══════════════════════════════════════════════════════════════════════════
// 6. APPLICANT SNAPSHOT
// ═══════════════════════════════════════════════════════════════════════════
function ApplicantSnapshot({ app, onStatusChange, onClose, compact = false }) {
  const s = app.students || {};
  const skills = s.skills || [];
  const projects = s.projects || [];
  const score = app.match_score || 0;
  const breakdown = app.match_breakdown || {};

  const ACTIONS = [
    { key: 'shortlisted', label: 'Shortlist',  icon: Bookmark,   color: 'var(--green-text)' },
    { key: 'interview',   label: 'Interview',  icon: Phone,      color: 'var(--blue)' },
    { key: 'hired',       label: 'Hire',       icon: Award,      color: 'var(--purple)' },
    { key: 'rejected',    label: 'Pass',       icon: ThumbsDown, color: 'var(--red)' },
  ];

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Candidate</p>
        {onClose && <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}><X size={16} /></button>}
      </div>

      <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={s.full_name} size={46} />
            <div>
              <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 16, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{s.full_name || 'Student'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '2px 0 0' }}>{s.college || '—'} · Year {s.year || '?'}</p>
              {app.jobs?.role && <p style={{ fontSize: 10, color: 'var(--text-mid)', margin: '4px 0 0' }}>Applied for: <strong>{app.jobs.role}</strong></p>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <ScoreNumber score={score} size={26} />
            <p style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>match</p>
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
                    {(p.projectUrl || p.link) && <a href={p.projectUrl || p.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><ExternalLink size={12} /></a>}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {ACTIONS.map(opt => {
            const active = app.status === opt.key;
            const Icon = opt.icon;
            return (
              <button key={opt.key} onClick={() => onStatusChange(app.id, opt.key)} style={{
                padding: '10px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                border: `1px solid ${active ? opt.color : 'var(--border)'}`,
                background: active ? opt.color : 'transparent',
                color: active ? '#fff' : opt.color,
                transition: 'all 0.15s',
              }}>
                <Icon size={12} /> {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
const linkChip = {
  display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-mid)',
  padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', textDecoration: 'none',
};

// ═══════════════════════════════════════════════════════════════════════════
// 7. CANDIDATE HIGHLIGHT CARD
// ═══════════════════════════════════════════════════════════════════════════
function CandidateHighlightCard({ app, onClick, isSelected }) {
  const s = app.students || {};
  const score = app.match_score || 0;
  const skills = (s.skills || []).slice(0, 3);

  return (
    <div onClick={onClick} className="hn-card" style={{
      background: 'var(--bg-card)',
      border: isSelected ? '1.5px solid var(--text)' : '1px solid var(--border)',
      borderRadius: 12, padding: 16, cursor: 'pointer',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxShadow: isSelected ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={s.full_name} size={38} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{s.full_name || 'Student'}</p>
            <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '2px 0 0' }}>{s.college || '—'}</p>
          </div>
        </div>
        <ScoreNumber score={score} size={20} />
      </div>
      {app.jobs?.role && (
        <p style={{ fontSize: 10, color: 'var(--text-mid)', margin: 0 }}>
          {app.jobs.logo} {app.jobs.role}
        </p>
      )}
      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {skills.map((sk, i) => (
            <span key={i} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 5, background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green-text)' }}>
              {sk.name}
            </span>
          ))}
          {(s.skills || []).length > 3 && (
            <span style={{ fontSize: 9, padding: '2px 7px', color: 'var(--text-dim)' }}>+{s.skills.length - 3}</span>
          )}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <StatusPill status={app.status || 'pending'} />
        <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. ROLE CARD
// ═══════════════════════════════════════════════════════════════════════════
function RoleCard({ job, onClick, onTogglePause, onCopyLink, onDelete }) {
  const filled = (job.current_applicants || 0) / (job.max_applicants || 50);
  const status = job.status || (job.is_active ? 'live' : 'paused');
  const statusStyle = status === 'live'
    ? { color: 'var(--green-text)', bg: 'var(--green-tint)', border: 'var(--green)', label: '● Live' }
    : status === 'paused'
    ? { color: 'var(--amber)', bg: 'var(--amber-tint)', border: 'var(--amber)', label: '⏸ Paused' }
    : { color: 'var(--text-dim)', bg: 'var(--bg-subtle)', border: 'var(--border)', label: 'Closed' };

  return (
    <div onClick={onClick} className="hn-card" style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 18, cursor: 'pointer',
      transition: 'border-color 0.15s', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 180,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <span style={{ fontSize: 28, lineHeight: 1 }}>{job.logo || '🚀'}</span>
          <div>
            <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 15, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.25 }}>{job.role}</p>
            <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>{job.stipend} · {job.duration}</p>
          </div>
        </div>
        <span style={{
          fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 500,
          background: statusStyle.bg, color: statusStyle.color,
          border: `1px solid ${statusStyle.border}`,
          textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', flexShrink: 0,
        }}>{statusStyle.label}</span>
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
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 4, marginTop: 'auto' }}>
        <button onClick={() => onCopyLink(job)} style={{ ...iconBtn, flex: 1 }} title="Copy share link"><Link2 size={12} /></button>
        <button onClick={() => onTogglePause(job)} style={iconBtn} title={status === 'live' ? 'Pause' : 'Resume'}>
          {status === 'live' ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button onClick={() => onDelete(job)} style={{ ...iconBtn, color: 'var(--red)' }} title="Delete"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}
const iconBtn = {
  padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  transition: 'border-color 0.15s, color 0.15s',
};

// ═══════════════════════════════════════════════════════════════════════════
// 9. ROLE DETAIL VIEW (opens inline inside RolesTab)
// ═══════════════════════════════════════════════════════════════════════════
function RoleDetailView({ job, onBack, onCopyLink }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setApps(await getJobApplications(job.id)); }
      finally { setLoading(false); }
    })();
  }, [job.id]);

  const handleStatusChange = async (appId, status) => {
    await updateApplicationStatus(appId, status);
    setApps(a => a.map(x => x.id === appId ? { ...x, status } : x));
    if (selectedApp?.id === appId) setSelectedApp(s => ({ ...s, status }));
  };

  const filtered = statusFilter === 'all' ? apps : apps.filter(a => (a.status || 'pending') === statusFilter);
  const counts = apps.reduce((acc, a) => {
    const s = a.status || 'pending';
    acc[s] = (acc[s] || 0) + 1; acc.all = (acc.all || 0) + 1;
    return acc;
  }, {});
  const avgScore = apps.length ? Math.round(apps.reduce((s, a) => s + (a.match_score || 0), 0) / apps.length) : 0;

  return (
    <div>
      <button onClick={onBack} style={{ ...btnGhost(), marginBottom: 18, padding: '6px 12px' }}>
        <ArrowLeft size={12} /> All roles
      </button>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 38 }}>{job.logo || '🚀'}</span>
            <div>
              <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 24, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{job.role}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '4px 0 0' }}>{job.company} · {job.location} · {job.stipend}</p>
            </div>
          </div>
          <button onClick={() => onCopyLink(job)} style={btnGhost()}><Link2 size={12} /> Share</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Applicants',  val: apps.length },
            { label: 'Avg score',   val: `${avgScore}%` },
            { label: 'Shortlisted', val: counts.shortlisted || 0 },
            { label: 'Interviewing',val: counts.interview || 0 },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
              <p style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 24, color: 'var(--text)', margin: 0, lineHeight: 1, fontWeight: 400 }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { id: 'all',         label: `All (${counts.all || 0})` },
          { id: 'pending',     label: `Pending (${counts.pending || 0})` },
          { id: 'shortlisted', label: `Shortlisted (${counts.shortlisted || 0})` },
          { id: 'interview',   label: `Interview (${counts.interview || 0})` },
          { id: 'hired',       label: `Hired (${counts.hired || 0})` },
          { id: 'rejected',    label: `Passed (${counts.rejected || 0})` },
        ].map(t => (
          <button key={t.id} onClick={() => setStatusFilter(t.id)} style={{
            padding: '6px 12px', borderRadius: 16, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
            background: statusFilter === t.id ? 'var(--text)' : 'transparent',
            border: `1px solid ${statusFilter === t.id ? 'var(--text)' : 'var(--border)'}`,
            color: statusFilter === t.id ? 'var(--bg)' : 'var(--text-mid)',
            fontWeight: statusFilter === t.id ? 500 : 400,
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 40, fontSize: 13 }}>Loading applicants…</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎯" title="No applicants in this view." message="Try a different filter or share your role link." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 380px' : '1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((app, i) => (
              <ApplicantRow key={app.id} app={app} rank={i + 1}
                onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                isSelected={selectedApp?.id === app.id} />
            ))}
          </div>
          {selectedApp && (
            <ApplicantSnapshot app={selectedApp} onStatusChange={handleStatusChange} onClose={() => setSelectedApp(null)} />
          )}
        </div>
      )}
    </div>
  );
}

function ApplicantRow({ app, rank, onClick, isSelected }) {
  const s = app.students || {};
  const score = app.match_score || 0;
  return (
    <div onClick={onClick} className="hn-card" style={{
      background: 'var(--bg-card)',
      border: isSelected ? '1.5px solid var(--text)' : '1px solid var(--border)',
      borderRadius: 10, padding: '13px 16px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.15s',
    }}>
      <span style={{ fontSize: 10, color: 'var(--text-dim)', width: 22, flexShrink: 0, textAlign: 'center', fontFamily: "'Editorial New', Georgia, serif" }}>#{rank}</span>
      <Avatar name={s.full_name} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{s.full_name || 'Student'}</p>
        <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {s.college || '—'} · Year {s.year || '?'}
        </p>
      </div>
      <ScoreNumber score={score} size={16} />
      <StatusPill status={app.status || 'pending'} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. TAB: HOME
// ═══════════════════════════════════════════════════════════════════════════
function HomeTab({ recruiter, jobs, allApps, onNavigate, onPostRole }) {
  const liveJobs    = jobs.filter(j => (j.status || (j.is_active ? 'live' : 'paused')) === 'live');
  const totalApps   = allApps.length;
  const shortlisted = allApps.filter(a => a.status === 'shortlisted').length;
  const hired       = allApps.filter(a => a.status === 'hired').length;
  const avgScore    = allApps.length ? Math.round(allApps.reduce((s, a) => s + (a.match_score || 0), 0) / allApps.length) : 0;

  const topPicks = useMemo(() => {
    return [...allApps]
      .filter(a => (a.match_score || 0) >= 60 && a.status !== 'rejected')
      .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      .slice(0, 6);
  }, [allApps]);

  const startupName = recruiter.startups?.name || recruiter.company_name || 'there';
  const firstName   = recruiter.contact_name?.split(' ')[0] || 'recruiter';

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>Home</p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
          Welcome back, <em>{firstName}.</em>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 8 }}>Here's what's happening at {startupName}.</p>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Live roles',  val: liveJobs.length },
          { label: 'Applicants',  val: totalApps },
          { label: 'Shortlisted', val: shortlisted },
          { label: 'Hired',       val: hired },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, color: 'var(--text)', margin: 0, lineHeight: 1, fontWeight: 400 }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28 }}>
        {/* Top picks */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Top picks for you</h3>
            <button onClick={() => onNavigate('hiring')} style={{ ...btnGhost(), padding: '5px 10px' }}>
              See all <ChevronRight size={11} />
            </button>
          </div>
          {topPicks.length === 0 ? (
            <EmptyState icon="🎯" title="No top picks yet." message="Once students apply to your roles, the strongest matches show up here." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {topPicks.map(app => (
                <CandidateHighlightCard key={app.id} app={app} onClick={() => onNavigate('hiring')} />
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', margin: '0 0 14px', fontWeight: 400 }}>Quick actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* "Post a role" triggers drawer — same as Roles tab button */}
            <button onClick={onPostRole} style={{ ...btnPrimary(false), justifyContent: 'flex-start', padding: '12px 14px' }}>
              <Plus size={14} /> Post a new role
            </button>
            <button onClick={() => onNavigate('hiring')} style={{ ...btnGhost(), justifyContent: 'flex-start', padding: '12px 14px', textAlign: 'left' }}>
              <UserCheck size={14} /> Browse all candidates
            </button>
            <button onClick={() => onNavigate('hiring')} style={{ ...btnGhost(), justifyContent: 'flex-start', padding: '12px 14px' }}>
              <GitBranch size={14} /> View pipeline
            </button>
            <button onClick={() => onNavigate('roles')} style={{ ...btnGhost(), justifyContent: 'flex-start', padding: '12px 14px' }}>
              <Layers size={14} /> Manage roles
            </button>
          </div>

          <div style={{ marginTop: 22, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Avg match score</p>
            <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 32, color: 'var(--text)', margin: 0, lineHeight: 1, fontWeight: 400 }}>{avgScore}%</p>
            <p style={{ fontSize: 11, color: 'var(--text-mid)', marginTop: 8, lineHeight: 1.5 }}>
              {avgScore >= 70 ? 'Strong applicant pool. Move fast.' : avgScore >= 50 ? 'Mixed pool — focus on top 6.' : 'Consider tightening role requirements.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. TAB: ROLES
//     Subtabs: Live | Paused | Closed
//     Header action: "Post a role" button (triggers drawer via onPostRole)
// ═══════════════════════════════════════════════════════════════════════════
function RolesTab({ jobs, onCopyLink, onTogglePause, onDelete, onPostRole }) {
  const [subTab, setSubTab] = useState('live');
  const [openJob, setOpenJob] = useState(null);

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

  if (openJob) {
    return <RoleDetailView job={openJob} onBack={() => setOpenJob(null)} onCopyLink={onCopyLink} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Roles"
        title={<>Manage your <em>roles.</em></>}
        action={
          <button onClick={onPostRole} style={{ ...btnPrimary(false), padding: '10px 16px' }}>
            <Plus size={13} /> Post a role
          </button>
        }
      />

      {/* Subtabs: Live | Paused | Closed */}
      <SubTabStrip tabs={SUBTABS} active={subTab} onChange={setSubTab} />

      {grouped[subTab].length === 0 ? (
        <EmptyState
          icon={subTab === 'live' ? '📋' : subTab === 'paused' ? '⏸' : '✕'}
          title={`No ${subTab} roles.`}
          message={subTab === 'live' ? 'Post your first role to start receiving matched candidates.' : `Roles you ${subTab === 'paused' ? 'pause' : 'close'} will appear here.`}
          cta={subTab === 'live' && (
            <button onClick={onPostRole} style={{ ...btnPrimary(false), margin: '0 auto' }}>
              <Plus size={13} /> Post a role
            </button>
          )}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {grouped[subTab].map(job => (
            <RoleCard key={job.id} job={job}
              onClick={() => setOpenJob(job)}
              onTogglePause={onTogglePause}
              onCopyLink={onCopyLink}
              onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. TAB: HIRING
//     Subtabs: Top Picks | Pipeline
//     (Merges old Candidates tab + Pipeline tab into one logical home)
// ═══════════════════════════════════════════════════════════════════════════
function HiringTab({ allApps, onStatusChange }) {
  const [subTab, setSubTab] = useState('top-picks');

  const SUBTABS = [
    { id: 'top-picks', label: 'Top Picks' },
    { id: 'pipeline',  label: 'Pipeline' },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Hiring"
        title={<>Your <em>hiring</em> centre.</>}
        subtitle="Review top candidates and move them through your pipeline."
      />

      <SubTabStrip tabs={SUBTABS} active={subTab} onChange={setSubTab} />

      {subTab === 'top-picks' && (
        <TopPicksView allApps={allApps} onStatusChange={onStatusChange} />
      )}
      {subTab === 'pipeline' && (
        <PipelineView allApps={allApps} onStatusChange={onStatusChange} />
      )}
    </div>
  );
}

// ── Top Picks view (was CandidatesTab) ─────────────────────────────────────
function TopPicksView({ allApps, onStatusChange }) {
  const [cap, setCap] = useState(6);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  const filtered = useMemo(() => {
    let list = [...allApps].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    if (filter === 'unreviewed')  list = list.filter(a => !a.status || a.status === 'pending');
    if (filter === 'shortlisted') list = list.filter(a => a.status === 'shortlisted');
    if (filter === 'high-match')  list = list.filter(a => (a.match_score || 0) >= 80);
    return list.slice(0, Math.min(cap, list.length));
  }, [allApps, filter, cap]);

  const totalAvailable = allApps.length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all',         label: 'All' },
            { id: 'unreviewed',  label: 'Unreviewed' },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'high-match',  label: '80%+ match' },
          ].map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} style={{
              padding: '6px 12px', borderRadius: 16, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
              background: filter === t.id ? 'var(--text)' : 'transparent',
              border: `1px solid ${filter === t.id ? 'var(--text)' : 'var(--border)'}`,
              color: filter === t.id ? 'var(--bg)' : 'var(--text-mid)',
              fontWeight: filter === t.id ? 500 : 400,
            }}>{t.label}</button>
          ))}
        </div>
        {/* Show top N */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Show top</span>
          {[6, 10, 15].map(n => (
            <button key={n} onClick={() => setCap(n)}
              disabled={totalAvailable < n && n !== 6}
              style={{
                padding: '5px 10px', borderRadius: 6, fontSize: 11, fontFamily: 'inherit',
                cursor: totalAvailable < n && n !== 6 ? 'not-allowed' : 'pointer',
                opacity: totalAvailable < n && n !== 6 ? 0.4 : 1,
                background: cap === n ? 'var(--text)' : 'transparent',
                color: cap === n ? 'var(--bg)' : 'var(--text-mid)',
                border: `1px solid ${cap === n ? 'var(--text)' : 'var(--border)'}`,
              }}>{n}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🎯" title="No candidates in this view." message="Adjust filters or wait for more applications to come in." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 380px' : '1fr', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {filtered.map(app => (
              <CandidateHighlightCard key={app.id} app={app}
                onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                isSelected={selectedApp?.id === app.id} />
            ))}
          </div>
          {selectedApp && (
            <ApplicantSnapshot app={selectedApp}
              onStatusChange={async (id, status) => { await onStatusChange(id, status); setSelectedApp(s => ({ ...s, status })); }}
              onClose={() => setSelectedApp(null)} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Pipeline view (was PipelineTab) ────────────────────────────────────────
function PipelineView({ allApps, onStatusChange }) {
  const [selectedApp, setSelectedApp] = useState(null);

  const stages = [
    { id: 'shortlisted', label: 'Shortlisted', color: 'var(--green)',  icon: Bookmark },
    { id: 'interview',   label: 'Interview',   color: 'var(--blue)',   icon: Phone },
    { id: 'hired',       label: 'Hired',       color: 'var(--purple)', icon: Award },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 1fr 1fr 380px' : 'repeat(3, 1fr)', gap: 12 }}>
        {stages.map(stage => {
          const candidates = allApps.filter(a => a.status === stage.id);
          const Icon = stage.icon;
          return (
            <div key={stage.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 14, minHeight: 320,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon size={14} style={{ color: stage.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{stage.label}</span>
                </div>
                <span style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 14, fontWeight: 400, color: stage.color, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-subtle)' }}>{candidates.length}</span>
              </div>
              {candidates.length === 0 ? (
                <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', padding: '32px 0' }}>No candidates here yet.</p>
              ) : (
                candidates.map(app => {
                  const s = app.students || {};
                  return (
                    <div key={app.id} onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)} className="hn-card"
                      style={{
                        padding: '10px 12px', borderRadius: 8,
                        border: `1px solid ${selectedApp?.id === app.id ? 'var(--text)' : 'var(--border)'}`,
                        background: 'var(--bg-subtle)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                      <Avatar name={s.full_name} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name || 'Student'}</p>
                        <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.jobs?.role}</p>
                      </div>
                      <ScoreNumber score={app.match_score || 0} size={12} />
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
        {selectedApp && (
          <ApplicantSnapshot app={selectedApp}
            onStatusChange={async (id, status) => { await onStatusChange(id, status); setSelectedApp(s => ({ ...s, status })); }}
            onClose={() => setSelectedApp(null)} compact />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 13. TAB: PROFILE
//     Subtabs: Startup | You
// ═══════════════════════════════════════════════════════════════════════════
function ProfileTab({ recruiter, onUpdate, showToast }) {
  const [subTab, setSubTab] = useState('startup');
  const isFounder = recruiter.role_in_company === 'founder';
  const startup = recruiter.startups || {};

  const SUBTABS = [
    { id: 'startup',   label: 'Startup' },
    { id: 'recruiter', label: 'You' },
  ];

  return (
    <div>
      <PageHeader eyebrow="Profile" title={<>Your <em>profile.</em></>} />
      <SubTabStrip tabs={SUBTABS} active={subTab} onChange={setSubTab} />

      {subTab === 'startup' && (
        <StartupProfileForm startup={startup} canEdit={isFounder} onUpdate={onUpdate} showToast={showToast} />
      )}
      {subTab === 'recruiter' && (
        <RecruiterProfileForm recruiter={recruiter} onUpdate={onUpdate} showToast={showToast} />
      )}
    </div>
  );
}

function StartupProfileForm({ startup, canEdit, onUpdate, showToast }) {
  const [form, setForm] = useState({
    name: startup.name || '', logo_emoji: startup.logo_emoji || '🚀',
    tagline: startup.tagline || '', about: startup.about || '',
    website: startup.website || '', industry: startup.industry || '',
    stage: startup.stage || '', team_size: startup.team_size || '',
    founded_year: startup.founded_year || '', hq_location: startup.hq_location || '',
  });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!startup.id) { showToast('No startup linked to this account yet.', 'error'); return; }
    setSaving(true);
    try {
      await updateStartupProfile(startup.id, form);
      showToast('Startup profile updated');
      onUpdate();
    } catch (e) { showToast(e.message || 'Failed to update', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
      {!canEdit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'var(--amber-tint)', border: '1px solid var(--amber)', marginBottom: 18 }}>
          <Lock size={13} style={{ color: 'var(--amber)' }} />
          <p style={{ fontSize: 11, color: 'var(--amber)', margin: 0 }}>Read-only. Only founders can edit the startup profile.</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 22 }}>
        <div>
          <Label>Logo</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, width: 152 }}>
            {LOGO_EMOJIS.slice(0, 8).map(e => (
              <button key={e} disabled={!canEdit} onClick={() => set('logo_emoji')(e)} style={{
                width: 34, height: 34, borderRadius: 6, fontSize: 17, cursor: canEdit ? 'pointer' : 'not-allowed',
                opacity: canEdit ? 1 : 0.5, border: `1.5px solid ${form.logo_emoji === e ? 'var(--text)' : 'var(--border)'}`, background: 'var(--bg-subtle)',
              }}>{e}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <Label required>Startup name</Label>
          <FocusInput value={form.name} disabled={!canEdit} onChange={e => set('name')(e.target.value)} placeholder="HUNT Labs" />
          <div style={{ height: 12 }} />
          <Label>Tagline</Label>
          <FocusInput value={form.tagline} disabled={!canEdit} onChange={e => set('tagline')(e.target.value)} placeholder="Skill-first internships" />
        </div>
      </div>
      <Label>About</Label>
      <FocusTextarea value={form.about} disabled={!canEdit} onChange={e => set('about')(e.target.value)} rows={4} placeholder="What does your startup do? What's the mission?" />
      <div style={{ height: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><Label>Website</Label><FocusInput value={form.website} disabled={!canEdit} onChange={e => set('website')(e.target.value)} placeholder="https://…" /></div>
        <div><Label>HQ location</Label><FocusInput value={form.hq_location} disabled={!canEdit} onChange={e => set('hq_location')(e.target.value)} placeholder="Bangalore, India" /></div>
        <div><Label>Industry</Label><FocusInput value={form.industry} disabled={!canEdit} onChange={e => set('industry')(e.target.value)} placeholder="HR Tech / EdTech / SaaS" /></div>
        <div><Label>Stage</Label>
          <FocusSelect value={form.stage} disabled={!canEdit} onChange={e => set('stage')(e.target.value)}>
            <option value="">—</option>
            <option>Pre-seed</option><option>Seed</option><option>Series A</option>
            <option>Series B</option><option>Series C+</option><option>Bootstrapped</option>
          </FocusSelect>
        </div>
        <div><Label>Team size</Label>
          <FocusSelect value={form.team_size} disabled={!canEdit} onChange={e => set('team_size')(e.target.value)}>
            <option value="">—</option><option>1-10</option><option>11-50</option><option>51-200</option><option>200+</option>
          </FocusSelect>
        </div>
        <div><Label>Founded</Label><FocusInput type="number" value={form.founded_year} disabled={!canEdit} onChange={e => set('founded_year')(e.target.value)} placeholder="2024" /></div>
      </div>
      {canEdit && (
        <div style={{ marginTop: 22 }}>
          <button onClick={save} disabled={saving} style={btnPrimary(saving)}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
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
    try {
      await updateRecruiterProfile(recruiter.id, form);
      showToast('Profile updated');
      onUpdate();
    } catch (e) { showToast(e.message || 'Failed to update', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <Avatar name={form.contact_name} size={56} />
        <div>
          <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{form.contact_name || 'Your name'}</p>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '3px 0 0' }}>{form.title || 'Your role'} at {recruiter.startups?.name || 'your startup'}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><Label required>Full name</Label><FocusInput value={form.contact_name} onChange={e => set('contact_name')(e.target.value)} /></div>
        <div><Label>Title</Label><FocusInput value={form.title} onChange={e => set('title')(e.target.value)} placeholder="Head of Talent" /></div>
        <div><Label>Email</Label><FocusInput value={form.email} disabled type="email" /></div>
        <div><Label>Phone</Label><FocusInput value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="+91…" /></div>
        <div><Label>LinkedIn</Label><FocusInput value={form.linkedin_url} onChange={e => set('linkedin_url')(e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
        <div>
          <Label>Role in company</Label>
          <FocusSelect value={form.role_in_company} onChange={e => set('role_in_company')(e.target.value)}>
            <option value="founder">Founder (full edit access)</option>
            <option value="hiring_manager">Hiring manager</option>
            <option value="recruiter">Recruiter</option>
          </FocusSelect>
        </div>
      </div>
      <div style={{ height: 16 }} />
      <Label>Bio</Label>
      <FocusTextarea value={form.bio} onChange={e => set('bio')(e.target.value)} rows={3} placeholder="Short intro that candidates will see when you reach out." />
      <div style={{ marginTop: 22 }}>
        <button onClick={save} disabled={saving} style={btnPrimary(saving)}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 14. TAB: NETWORK (stub — mirrors StudentDashboard)
// ═══════════════════════════════════════════════════════════════════════════
function NetworkTab() {
  return (
    <div>
      <PageHeader eyebrow="Network" title={<>Connect with <em>builders.</em></>} />
      <EmptyState icon="🌐" title="Coming soon."
        message="Connect with other startups, recruiters, and high-signal builders. We're building this carefully — quality over quantity, like everything else on HUNT." />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 15. SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════════════════
function SettingsModal({ theme, setTheme, onClose, onSignOut }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 24, maxWidth: 480, width: '100%',
        boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 22, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Appearance</p>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '3px 0 0' }}>Light or dark mode.</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['light', 'dark'].map(t => (
              <button key={t} onClick={() => setTheme(t)} style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                background: theme === t ? 'var(--bg-subtle)' : 'transparent',
                border: `1.5px solid ${theme === t ? 'var(--text)' : 'var(--border)'}`,
                color: 'var(--text)', fontWeight: theme === t ? 600 : 400,
              }}>
                {t === 'light' ? <><Sun size={12} /> Light</> : <><Moon size={12} /> Dark</>}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Sign out</p>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '3px 0 0' }}>You'll need to log in again.</p>
          </div>
          <button onClick={onSignOut} style={{ ...btnGhost(), color: 'var(--red)', borderColor: 'var(--red)' }}>
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 16. MAIN SHELL
// ═══════════════════════════════════════════════════════════════════════════
export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [loading, setLoading] = useState(true);
  const [recruiter, setRecruiter] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // ── "Post a role" drawer — accessible from Home + Roles tab ──
  const [showPostDrawer, setShowPostDrawer] = useState(false);

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
        const [j, a] = await Promise.all([
          getRecruiterJobs(r.id),
          getAllApplicationsForRecruiter(r.id),
        ]);
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
    try {
      await deleteJob(job.id);
      setJobs(j => j.filter(x => x.id !== job.id));
      showToast('Role deleted');
    } catch (e) { showToast(e.message || 'Delete failed', 'error'); }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      setAllApps(a => a.map(x => x.id === appId ? { ...x, status } : x));
      const labels = { shortlisted: 'Shortlisted', interview: 'Moved to interview', hired: 'Hired! 🎉', rejected: 'Passed' };
      showToast(labels[status] || 'Updated');
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  };

  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); } catch (e) { console.error(e); }
  };

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
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>We couldn't find your recruiter profile. Please complete onboarding to continue.</p>
      </div>
    </div>
  );

  const initials = recruiter.contact_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @keyframes fadeDown { from { opacity:0; transform: translateX(-50%) translateY(-6px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        @keyframes hunt-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        button:disabled { opacity: 0.5; }
        .hn-item:hover { background: var(--bg-subtle) !important; }
        .hn-card:hover { border-color: var(--border-mid) !important; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-dim); }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {showSettings && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} onSignOut={handleSignOut} />}

      {/* ── Post a role drawer — portal-style, z-index above everything ── */}
      {recruiter && (
        <PostRoleDrawer
          recruiter={recruiter}
          open={showPostDrawer}
          onClose={() => setShowPostDrawer(false)}
          showToast={showToast}
          onSuccess={async () => {
            await refreshAll();
            showToast('Role posted! 🚀');
            setActiveTab('roles');
          }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 210, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
        borderRight: '1px solid var(--border)', background: 'var(--bg-card)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--text)' }}>HUNT</span>
        </div>

        {/* 5 nav items — no "Post a role" clutter */}
        <nav style={{ padding: '10px 8px', flex: 1 }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} className="hn-item" onClick={() => setActiveTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  width: '100%', padding: '9px 11px', borderRadius: 7,
                  border: 'none', cursor: 'pointer', marginBottom: 1,
                  background: active ? 'var(--bg-subtle)' : 'transparent',
                  color: active ? 'var(--text)' : 'var(--text-dim)',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  textAlign: 'left', transition: 'background 0.12s, color 0.12s',
                  fontFamily: 'inherit',
                }}>
                <Icon size={15} style={{ flexShrink: 0 }} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Bottom: company tag + bell/theme + account pill */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)', position: 'relative' }}>
          <div style={{ padding: '9px 11px', borderRadius: 7, background: 'var(--bg-subtle)', marginBottom: 8 }}>
            <p style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Company</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
              {recruiter.startups?.name || recruiter.company_name || 'Your startup'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 4, padding: '0 2px', marginBottom: 6 }}>
            <button className="hn-item" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 7, borderRadius: 6, color: 'var(--text-dim)' }}>
              <Bell size={13} />
            </button>
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="hn-item" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 7, borderRadius: 6, color: 'var(--text-dim)' }}>
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </button>
          </div>

          {/* Account pill */}
          <div onClick={() => setShowAccountMenu(p => !p)} className="hn-item" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 11px', borderRadius: 7, cursor: 'pointer', transition: 'background 0.12s', position: 'relative' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: 'var(--green-tint)', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--green)' }}>{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{recruiter.contact_name}</p>
              <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0, textTransform: 'capitalize' }}>{recruiter.role_in_company || 'Recruiter'}</p>
            </div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" style={{ flexShrink: 0, transform: showAccountMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          {/* Account dropdown */}
          {showAccountMenu && (
            <div style={{ margin: '4px 2px 0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 1 }}>Signed in as</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{recruiter.email || recruiter.contact_name}</p>
              </div>
              {[
                { label: 'Profile',  action: () => { setActiveTab('profile');  setShowAccountMenu(false); } },
                { label: 'Settings', action: () => { setShowSettings(true);    setShowAccountMenu(false); } },
                { label: 'Support',  action: () => { window.open('mailto:support@hunt.so'); setShowAccountMenu(false); } },
              ].map(item => (
                <button key={item.label} onClick={item.action} className="hn-item" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 12, color: 'var(--text-mid)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={handleSignOut} className="hn-item" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', maxHeight: '100vh' }}>
        <div style={{ padding: '32px 40px 80px', maxWidth: 1280, margin: '0 auto', animation: 'hunt-fade-in 0.3s ease' }}>

          {activeTab === 'home' && (
            <HomeTab
              recruiter={recruiter}
              jobs={jobs}
              allApps={allApps}
              onNavigate={setActiveTab}
              onPostRole={() => setShowPostDrawer(true)}
            />
          )}

          {activeTab === 'roles' && (
            <RolesTab
              jobs={jobs}
              onCopyLink={handleCopyLink}
              onTogglePause={handleTogglePause}
              onDelete={handleDelete}
              onPostRole={() => setShowPostDrawer(true)}
            />
          )}

          {activeTab === 'hiring' && (
            <HiringTab
              allApps={allApps}
              onStatusChange={handleStatusChange}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              recruiter={recruiter}
              onUpdate={refreshRecruiter}
              showToast={showToast}
            />
          )}

          {activeTab === 'network' && <NetworkTab />}

        </div>
      </main>
    </div>
  );
}
