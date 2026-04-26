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

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus, LogOut, Sun, Moon, Copy, Check, X, ChevronRight, ChevronDown,
  Briefcase, MapPin, Clock, Users, Eye, EyeOff, Link2, Trash2, Edit3,
  ArrowLeft, Zap, TrendingUp, CheckCircle2, AlertCircle, Pause, Play,
  ExternalLink, Github, Star, Building2, Home, Layers, UserCheck,
  GitBranch, Network, Settings, Sparkles, Send, MessageSquare, Award,
  Filter, Search, MoreVertical, Calendar, IndianRupee, Globe, Lock,
  TrendingDown, Activity, Bookmark, ThumbsUp, ThumbsDown, Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOut } from '../services/supabase';

// ═══════════════════════════════════════════════════════════════════════════
// 1. DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════
const tokens = {
  light: {
    '--bg':           '#FAFAF8', '--bg-card':    '#FFFFFF',
    '--bg-subtle':    '#F5F5F2', '--bg-hover':   '#F0EFEA',
    '--border':       '#EBEBEA', '--border-mid': '#D6D6D3',
    '--text':         '#0A0A0A', '--text-mid':   '#5A5A56',
    '--text-dim':     '#9B9B97',
    '--ember':        '#D85A30', '--ember-tint': 'rgba(216,90,48,0.08)',
    '--ember-border': 'rgba(216,90,48,0.3)',
    '--green':        '#1A7A4A', '--green-tint': '#E8F5EE',
    '--green-text':   '#1A7A4A', '--red':        '#C0392B',
    '--red-tint':     '#FDECEA', '--blue':       '#2563EB',
    '--blue-tint':    'rgba(37,99,235,0.08)',
    '--purple':       '#7C3AED', '--purple-tint':'rgba(124,58,237,0.08)',
    '--amber':        '#B45309', '--amber-tint': 'rgba(180,83,9,0.08)',
  },
  dark: {
    '--bg':           '#0C0B09', '--bg-card':    '#131210',
    '--bg-subtle':    '#1A1916', '--bg-hover':   '#221F1B',
    '--border':       'rgba(255,255,255,0.08)', '--border-mid': 'rgba(255,255,255,0.14)',
    '--text':         '#FAFAF8', '--text-mid':   'rgba(255,255,255,0.55)',
    '--text-dim':     'rgba(255,255,255,0.28)',
    '--ember':        '#E8714A', '--ember-tint': 'rgba(216,90,48,0.12)',
    '--ember-border': 'rgba(216,90,48,0.35)',
    '--green':        '#2EAD6A', '--green-tint': '#0D2B1A',
    '--green-text':   '#2EAD6A', '--red':        '#E05C4B',
    '--red-tint':     '#2B1210', '--blue':       '#60A5FA',
    '--blue-tint':    'rgba(96,165,250,0.1)',
    '--purple':       '#A78BFA', '--purple-tint':'rgba(167,139,250,0.12)',
    '--amber':        '#FBBF24', '--amber-tint': 'rgba(251,191,36,0.1)',
  }
};
const applyTokens = (theme) =>
  Object.entries(tokens[theme]).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v));

// ═══════════════════════════════════════════════════════════════════════════
// 2. SUPABASE HELPERS
// ═══════════════════════════════════════════════════════════════════════════
async function getRecruiterProfile() {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('recruiters').select('*, startups(*)').eq('auth_id', user.id).single();
  if (error) throw error;
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
  const { data, error } = await supabase.from('jobs').insert([jobData]).select().single();
  if (error) throw error;
  return data;
}
async function updateJob(jobId, patch) {
  const { data, error } = await supabase.from('jobs').update(patch).eq('id', jobId).select().single();
  if (error) throw error;
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
  const { data, error } = await supabase
    .from('applications')
    .select(`*, students(*), jobs!inner(id, role, logo, recruiter_id)`)
    .eq('jobs.recruiter_id', recruiterId)
    .order('match_score', { ascending: false });
  if (error) throw error;
  return data || [];
}
async function updateApplicationStatus(appId, status, extra = {}) {
  const patch = { status, ...extra };
  if (status === 'shortlisted') patch.shortlisted_at = new Date().toISOString();
  if (status === 'interview')   patch.interviewed_at = new Date().toISOString();
  if (status === 'hired')       patch.hired_at       = new Date().toISOString();
  const { data, error } = await supabase.from('applications').update(patch).eq('id', appId).select().single();
  if (error) throw error;
  return data;
}
async function updateStartupProfile(startupId, patch) {
  const { data, error } = await supabase.from('startups').update(patch).eq('id', startupId).select().single();
  if (error) throw error;
  return data;
}
async function updateRecruiterProfile(recruiterId, patch) {
  const { data, error } = await supabase.from('recruiters').update(patch).eq('id', recruiterId).select().single();
  if (error) throw error;
  return data;
}

// AI role generation — calls Claude. Replace with your actual AI service when wired up.
async function generateRoleWithAI(prompt, recruiter) {
  const sysPrompt = `You generate structured internship role data for the HUNT platform. Return ONLY valid JSON with these keys:
{
  "role": string,
  "description": string (2-3 sentences, what the intern will actually work on),
  "stipend": string (e.g. "₹25,000/month"),
  "duration": string (e.g. "3 months"),
  "location": string (e.g. "Remote" or "Bangalore"),
  "type": "Paid Internship" | "Unpaid Internship" | "Contract" | "Part-time",
  "required_skills": [{"name": string, "level": 1-5, "weight": number 0-1}] (3-5 skills, weights sum to 1),
  "nice_to_have": string[] (2-4 items)
}
No prose, no markdown fences. Just JSON.`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: sysPrompt,
      messages: [{ role: 'user', content: `Company: ${recruiter.startups?.name || recruiter.company_name}\nIndustry: ${recruiter.startups?.industry || 'tech'}\n\nThe recruiter says: "${prompt}"` }],
    }),
  });
  const data = await res.json();
  const text = data.content?.find(b => b.type === 'text')?.text || '';
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
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

const NAV_ITEMS = [
  { id: 'home',       label: 'Home',        icon: Home },
  { id: 'roles',      label: 'Roles',       icon: Layers },
  { id: 'candidates', label: 'Candidates',  icon: UserCheck },
  { id: 'pipeline',   label: 'Pipeline',    icon: GitBranch },
  { id: 'post',       label: 'Post a role', icon: Plus, accent: true },
  { id: 'profile',    label: 'Profile',     icon: Building2 },
  { id: 'network',    label: 'Network',     icon: Network },
  { id: 'settings',   label: 'Settings',    icon: Settings },
];

const STATUS_META = {
  pending:     { label: 'Pending',     color: 'var(--text-dim)',   bg: 'var(--bg-subtle)',  border: 'var(--border)' },
  shortlisted: { label: 'Shortlisted', color: 'var(--green-text)', bg: 'var(--green-tint)', border: 'var(--green)' },
  interview:   { label: 'Interview',   color: 'var(--blue)',       bg: 'var(--blue-tint)',  border: 'var(--blue)' },
  hired:       { label: 'Hired',       color: 'var(--purple)',     bg: 'var(--purple-tint)',border: 'var(--purple)' },
  rejected:    { label: 'Passed',      color: 'var(--red)',        bg: 'var(--red-tint)',   border: 'var(--red)' },
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. ATOMS — small reusable bits
// ═══════════════════════════════════════════════════════════════════════════
const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-subtle)',
  color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
};

function FocusInput({ style, ...props }) {
  return <input {...props} style={{ ...inp, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--ember)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'} />;
}
function FocusSelect({ style, children, ...props }) {
  return <select {...props} style={{ ...inp, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--ember)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'}>{children}</select>;
}
function FocusTextarea({ style, ...props }) {
  return <textarea {...props} style={{ ...inp, resize: 'vertical', minHeight: 70, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--ember)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'} />;
}
function Label({ children, required }) {
  return <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
    {children}{required && <span style={{ color: 'var(--ember)', marginLeft: 3 }}>*</span>}
  </p>;
}
function Toast({ msg, type }) {
  return <div style={{
    position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
    zIndex: 9999, padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 500,
    background: type === 'error' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)',
    color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: 'fadeDown 0.2s ease',
  }}>{msg}</div>;
}
function Avatar({ name, size = 36, color = 'var(--ember)' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  return <div style={{
    width: size, height: size, borderRadius: '50%',
    background: 'var(--ember-tint)', border: `1.5px solid var(--ember-border)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.32, fontWeight: 600, color, flexShrink: 0,
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
    textAlign: 'center', padding: '56px 24px',
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
  }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: 'var(--text)', marginBottom: 6 }}>{title}</p>
    <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: cta ? 18 : 0 }}>{message}</p>
    {cta}
  </div>;
}
function ScoreNumber({ score, size = 16 }) {
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--ember)' : 'var(--red)';
  return <span style={{ fontFamily: 'Georgia, serif', fontSize: size, color, lineHeight: 1 }}>{score}%</span>;
}
function btnPrimary(disabled) {
  return {
    padding: '10px 16px', borderRadius: 8, border: 'none',
    background: disabled ? 'var(--text-dim)' : 'var(--ember)', color: '#fff',
    fontSize: 12, fontWeight: 500, cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
  };
}
function btnGhost() {
  return {
    padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text-mid)',
    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. POST ROLE — MANUAL FORM (kept from v1 with cleanup)
// ═══════════════════════════════════════════════════════════════════════════
function PostRoleManual({ recruiter, prefill, onSuccess, onError }) {
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [niceInput, setNiceInput] = useState('');
  const [form, setForm] = useState(() => ({
    logo: prefill?.logo || recruiter.startups?.logo_emoji || '🚀',
    role: prefill?.role || '',
    description: prefill?.description || '',
    stipend: prefill?.stipend || '',
    duration: prefill?.duration || '',
    location: prefill?.location || '',
    type: prefill?.type || 'Paid Internship',
    visibility: 'public',
    required_skills: prefill?.required_skills || [],
    nice_to_have: prefill?.nice_to_have || [],
    max_applicants: 50,
    minimum_match_threshold: 50,
    positions: 1,
  }));

  // Sync prefill when AI returns new data
  useEffect(() => {
    if (prefill) setForm(f => ({ ...f, ...prefill, logo: prefill.logo || f.logo, visibility: f.visibility, max_applicants: f.max_applicants, minimum_match_threshold: f.minimum_match_threshold, positions: f.positions }));
  }, [prefill]);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

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
    if (!form.role.trim())     return onError('Role title is required.');
    if (!form.stipend.trim())  return onError('Stipend is required.');
    if (!form.duration.trim()) return onError('Duration is required.');
    if (!form.location.trim()) return onError('Location is required.');
    if (form.required_skills.length === 0) return onError('Add at least one required skill.');

    setSaving(true);
    try {
      const totalW = form.required_skills.reduce((s, sk) => s + sk.weight, 0);
      const normSkills = form.required_skills.map(sk => ({ ...sk, weight: parseFloat((sk.weight / totalW).toFixed(3)) }));
      const startupName = recruiter.startups?.name || recruiter.company_name;
      const slug = `${startupName.toLowerCase().replace(/\s+/g, '-')}-${form.role.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      await createJob({
        recruiter_id:        recruiter.id,
        company:             startupName,
        logo:                form.logo,
        role:                form.role.trim(),
        description:         form.description.trim(),
        stipend:             form.stipend.trim(),
        duration:            form.duration.trim(),
        location:            form.location.trim(),
        type:                form.type,
        visibility:          form.visibility,
        share_slug:          slug,
        required_skills:     normSkills,
        nice_to_have:        form.nice_to_have,
        max_applicants:      form.max_applicants,
        minimum_match_threshold: form.minimum_match_threshold,
        positions:           form.positions,
        current_applicants:  0,
        is_active:           true,
        status:              'live',
      });
      onSuccess();
    } catch (e) { onError('Failed: ' + e.message); }
    finally    { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flexShrink: 0 }}>
          <Label>Logo</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, width: 152 }}>
            {LOGO_EMOJIS.slice(0, 8).map(e => (
              <button key={e} onClick={() => set('logo')(e)} style={{
                width: 34, height: 34, borderRadius: 6, fontSize: 17, cursor: 'pointer',
                border: `1.5px solid ${form.logo === e ? 'var(--ember)' : 'var(--border)'}`,
                background: form.logo === e ? 'var(--ember-tint)' : 'var(--bg-subtle)',
              }}>{e}</button>
            ))}
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
        <FocusTextarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3}
          placeholder="What will the intern actually work on? Be specific — 2-3 sentences." />
      </div>

      <div>
        <Label required>Required skills</Label>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>Type a skill and press Enter. Set level 1–5 for each.</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <FocusInput value={skillInput} onChange={e => setSkillInput(e.target.value)}
            placeholder="React, Node.js, Python…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            list="skill-suggestions" style={{ flex: 1 }} />
          <datalist id="skill-suggestions">{SKILL_OPTIONS.map(s => <option key={s} value={s} />)}</datalist>
          <button onClick={addSkill} style={btnPrimary(false)}>Add</button>
        </div>
        {form.required_skills.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {form.required_skills.map(skill => (
              <div key={skill.name} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-subtle)',
              }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{skill.name}</span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Level</span>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(lv => (
                    <button key={lv} onClick={() => setForm(f => ({ ...f, required_skills: f.required_skills.map(s => s.name === skill.name ? { ...s, level: lv } : s) }))}
                      style={{
                        width: 22, height: 22, borderRadius: 4, fontSize: 10, fontWeight: 500,
                        cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                        background: skill.level >= lv ? 'var(--ember)' : 'var(--bg-card)',
                        color: skill.level >= lv ? '#fff' : 'var(--text-dim)',
                        outline: skill.level >= lv ? 'none' : '1px solid var(--border)',
                      }}>{lv}</button>
                  ))}
                </div>
                <button onClick={() => removeSkill(skill.name)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label>Nice to have (optional)</Label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <FocusInput value={niceInput} onChange={e => setNiceInput(e.target.value)}
            placeholder="Docker, AWS…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNice())}
            list="skill-suggestions" style={{ flex: 1 }} />
          <button onClick={addNice} style={btnGhost()}>Add</button>
        </div>
        {form.nice_to_have.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {form.nice_to_have.map(s => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', borderRadius: 20, border: '1px solid var(--border)', color: 'var(--text-mid)' }}>
                {s}
                <button onClick={() => setForm(f => ({ ...f, nice_to_have: f.nice_to_have.filter(x => x !== s) }))}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <Label>Visibility</Label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['public', 'private'].map(v => (
              <button key={v} onClick={() => set('visibility')(v)} style={{
                flex: 1, padding: '8px', borderRadius: 8, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
                background: form.visibility === v ? 'var(--ember-tint)' : 'var(--bg-subtle)',
                border: `1px solid ${form.visibility === v ? 'var(--ember)' : 'var(--border)'}`,
                color: form.visibility === v ? 'var(--ember)' : 'var(--text-mid)',
              }}>{v === 'public' ? '🌐 Public' : '🔗 Link only'}</button>
            ))}
          </div>
        </div>
        <div>
          <Label>Max applicants</Label>
          <div style={{ display: 'flex', gap: 4 }}>
            {[25, 50, 100].map(n => (
              <button key={n} onClick={() => set('max_applicants')(n)} style={{
                flex: 1, padding: '8px', borderRadius: 8, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
                background: form.max_applicants === n ? 'var(--ember-tint)' : 'var(--bg-subtle)',
                border: `1px solid ${form.max_applicants === n ? 'var(--ember)' : 'var(--border)'}`,
                color: form.max_applicants === n ? 'var(--ember)' : 'var(--text-mid)',
              }}>{n}</button>
            ))}
          </div>
        </div>
        <div>
          <Label>Min match %</Label>
          <div style={{ display: 'flex', gap: 4 }}>
            {[40, 50, 70].map(n => (
              <button key={n} onClick={() => set('minimum_match_threshold')(n)} style={{
                flex: 1, padding: '8px', borderRadius: 8, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
                background: form.minimum_match_threshold === n ? 'var(--ember-tint)' : 'var(--bg-subtle)',
                border: `1px solid ${form.minimum_match_threshold === n ? 'var(--ember)' : 'var(--border)'}`,
                color: form.minimum_match_threshold === n ? 'var(--ember)' : 'var(--text-mid)',
              }}>{n}%</button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary(saving), padding: '12px 16px', justifyContent: 'center', fontSize: 13 }}>
        {saving ? 'Posting…' : 'Post role'} {!saving && <ChevronRight size={14} />}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. POST ROLE — AI CHAT
// ═══════════════════════════════════════════════════════════════════════════
function PostRoleAI({ recruiter, onGenerated, onError }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hey! Tell me what role you're hiring for. Anything works — "we need a React intern who can ship fast" or "looking for a backend dev, 3 months, ₹25k". I'll structure it.` }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef();

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg = input.trim();
    setMessages(m => [...m, { role: 'user', content: userMsg }]);
    setInput(''); setBusy(true);
    try {
      const generated = await generateRoleWithAI(userMsg, recruiter);
      setMessages(m => [...m, {
        role: 'assistant',
        content: `I drafted "${generated.role}" — review on the right and tweak anything before publishing.`,
      }]);
      onGenerated(generated);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: `Hmm, couldn't generate that. Try rephrasing — be specific about skills, duration, stipend.` }]);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 480 }}>
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        background: 'var(--bg-subtle)', borderRadius: 10,
        border: '1px solid var(--border)', marginBottom: 12,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: 12,
              background: m.role === 'user' ? 'var(--ember)' : 'var(--bg-card)',
              color: m.role === 'user' ? '#fff' : 'var(--text)',
              border: m.role === 'user' ? 'none' : '1px solid var(--border)',
              fontSize: 13, lineHeight: 1.5,
            }}>{m.content}</div>
          </div>
        ))}
        {busy && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dim)', fontSize: 12 }}>
            <Sparkles size={12} /> Drafting…
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <FocusTextarea value={input} onChange={e => setInput(e.target.value)}
          placeholder="Describe the role you're hiring for…" rows={2}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          style={{ flex: 1, minHeight: 'auto' }} />
        <button onClick={send} disabled={busy || !input.trim()} style={{
          ...btnPrimary(busy || !input.trim()), padding: '0 16px', alignSelf: 'stretch',
        }}>
          <Send size={14} />
        </button>
      </div>
      <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 6, textAlign: 'center' }}>
        Each generation populates the form on the right. Edit freely before publishing.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. APPLICANT SNAPSHOT (used by Candidates, Pipeline, Role detail)
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
      borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Candidate</p>
        {onClose && <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}><X size={16} /></button>}
      </div>

      <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={s.full_name} size={44} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{s.full_name || 'Student'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>{s.college || '—'} · Year {s.year || '?'}</p>
              {app.jobs?.role && <p style={{ fontSize: 10, color: 'var(--ember)', margin: '3px 0 0' }}>Applied for: {app.jobs.role}</p>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <ScoreNumber score={score} size={26} />
            <p style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>match</p>
          </div>
        </div>

        {Object.keys(breakdown).length > 0 && (
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
            <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Score breakdown</p>
            {Object.entries(breakdown).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: 'var(--text-mid)', width: 110, flexShrink: 0, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(v, 40) * 2.5}%`, background: 'var(--green)', borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text)', width: 28, textAlign: 'right' }}>{v}%</span>
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 7 }}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {skills.map((sk, i) => (
                <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green-text)' }}>
                  {sk.name} <span style={{ opacity: 0.6 }}>L{sk.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && !compact && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 7 }}>Projects</p>
            {projects.slice(0, 3).map((p, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
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

        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {s.github_url   && <a href={s.github_url}   target="_blank" rel="noopener noreferrer" style={linkChip}><Github size={11} /> GitHub</a>}
          {s.linkedin_url && <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> LinkedIn</a>}
          {s.portfolio_url&& <a href={s.portfolio_url}target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> Portfolio</a>}
          {s.resume_url   && <a href={s.resume_url}   target="_blank" rel="noopener noreferrer" style={{ ...linkChip, color: 'var(--ember)', borderColor: 'var(--ember-border)' }}>📄 Resume</a>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {ACTIONS.map(opt => {
            const active = app.status === opt.key;
            const Icon = opt.icon;
            return (
              <button key={opt.key} onClick={() => onStatusChange(app.id, opt.key)} style={{
                padding: '9px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                border: `1px solid ${active ? opt.color : 'var(--border)'}`,
                background: active ? opt.color : 'transparent',
                color: active ? '#fff' : opt.color,
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
// 8. CANDIDATE HIGHLIGHT CARD (used in Home + Candidates tab)
// ═══════════════════════════════════════════════════════════════════════════
function CandidateHighlightCard({ app, onClick, isSelected }) {
  const s = app.students || {};
  const score = app.match_score || 0;
  const skills = (s.skills || []).slice(0, 3);

  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isSelected ? 'var(--ember)' : 'var(--border)'}`,
      borderRadius: 12, padding: 16, cursor: 'pointer',
      transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={s.full_name} size={38} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{s.full_name || 'Student'}</p>
            <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0 }}>{s.college || '—'}</p>
          </div>
        </div>
        <ScoreNumber score={score} size={20} />
      </div>

      {app.jobs?.role && (
        <p style={{ fontSize: 10, color: 'var(--ember)', margin: 0 }}>
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
// 9. ROLE CARD (Roles tab grid item)
// ═══════════════════════════════════════════════════════════════════════════
function RoleCard({ job, onClick, onTogglePause, onCopyLink, onDelete }) {
  const filled = (job.current_applicants || 0) / (job.max_applicants || 50);
  const status = job.status || (job.is_active ? 'live' : 'paused');

  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 16, cursor: 'pointer',
      transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: 12,
      minHeight: 180,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{job.logo || '🚀'}</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{job.role}</p>
            <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{job.stipend} · {job.duration}</p>
          </div>
        </div>
        <span style={{
          fontSize: 9, padding: '2px 7px', borderRadius: 10, fontWeight: 500,
          background: status === 'live' ? 'var(--green-tint)' : status === 'paused' ? 'var(--amber-tint)' : 'var(--bg-subtle)',
          color:      status === 'live' ? 'var(--green-text)' : status === 'paused' ? 'var(--amber)' : 'var(--text-dim)',
          border: `1px solid ${status === 'live' ? 'rgba(26,122,74,0.2)' : status === 'paused' ? 'rgba(180,83,9,0.2)' : 'var(--border)'}`,
        }}>{status === 'live' ? '● LIVE' : status === 'paused' ? '⏸ PAUSED' : '✕ CLOSED'}</span>
      </div>

      <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'var(--text-mid)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {job.location}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={10} /> {job.current_applicants || 0}/{job.max_applicants || 50}</span>
      </div>

      <div>
        <div style={{ height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(filled, 1) * 100}%`, background: filled > 0.8 ? 'var(--red)' : filled > 0.5 ? 'var(--ember)' : 'var(--green)', borderRadius: 2, transition: 'width 0.4s' }} />
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
};

// ═══════════════════════════════════════════════════════════════════════════
// 10. ROLE DETAIL VIEW (opens inline when role card is clicked)
// ═══════════════════════════════════════════════════════════════════════════
function RoleDetailView({ job, onBack, onCopyLink, refreshJobs }) {
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
      <button onClick={onBack} style={{ ...btnGhost(), marginBottom: 14, padding: '6px 12px' }}>
        <ArrowLeft size={12} /> All roles
      </button>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 36 }}>{job.logo || '🚀'}</span>
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: 'var(--text)', margin: 0 }}>{job.role}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '3px 0 0' }}>{job.company} · {job.location} · {job.stipend}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => onCopyLink(job)} style={btnGhost()}><Link2 size={12} /> Share</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 10 }}>
          {[
            { label: 'Applicants', val: apps.length, color: 'var(--ember)' },
            { label: 'Avg score',  val: `${avgScore}%`, color: avgScore >= 70 ? 'var(--green)' : 'var(--ember)' },
            { label: 'Shortlisted',val: counts.shortlisted || 0, color: 'var(--green)' },
            { label: 'Interviewing',val: counts.interview || 0, color: 'var(--blue)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: s.color, margin: 0, lineHeight: 1 }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
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
            background: statusFilter === t.id ? 'var(--ember-tint)' : 'transparent',
            border: `1px solid ${statusFilter === t.id ? 'var(--ember)' : 'var(--border)'}`,
            color: statusFilter === t.id ? 'var(--ember)' : 'var(--text-mid)',
            fontWeight: statusFilter === t.id ? 500 : 400,
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 40, fontSize: 13 }}>Loading applicants…</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎯" title="No applicants in this view." message="Try a different filter or share your role link to get applications." />
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
    <div onClick={onClick} style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isSelected ? 'var(--ember)' : 'var(--border)'}`,
      borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
    }}>
      <span style={{ fontSize: 10, color: 'var(--text-dim)', width: 22, flexShrink: 0, textAlign: 'center' }}>#{rank}</span>
      <Avatar name={s.full_name} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{s.full_name || 'Student'}</p>
        <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {s.college || '—'} · Year {s.year || '?'}
        </p>
      </div>
      <ScoreNumber score={score} size={16} />
      <StatusPill status={app.status || 'pending'} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. TAB: HOME
// ═══════════════════════════════════════════════════════════════════════════
function HomeTab({ recruiter, jobs, allApps, onNavigate, onSelectApp }) {
  const liveJobs   = jobs.filter(j => (j.status || (j.is_active ? 'live' : 'paused')) === 'live');
  const totalApps  = allApps.length;
  const shortlisted= allApps.filter(a => a.status === 'shortlisted').length;
  const hired      = allApps.filter(a => a.status === 'hired').length;
  const avgScore   = allApps.length ? Math.round(allApps.reduce((s, a) => s + (a.match_score || 0), 0) / allApps.length) : 0;

  // Top picks across all roles, capped at 6, only above 60%
  const topPicks = useMemo(() => {
    return [...allApps]
      .filter(a => (a.match_score || 0) >= 60 && a.status !== 'rejected')
      .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      .slice(0, 6);
  }, [allApps]);

  const startupName = recruiter.startups?.name || recruiter.company_name || 'there';

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, marginBottom: 6 }}>Home</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: 'var(--text)', margin: 0, fontWeight: 400 }}>
          Welcome back, <span style={{ color: 'var(--ember)' }}>{recruiter.contact_name?.split(' ')[0] || 'recruiter'}</span>.
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 6 }}>Here's what's happening at {startupName}.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Live roles',   val: liveJobs.length, color: 'var(--green)' },
          { label: 'Applicants',   val: totalApps, color: 'var(--ember)' },
          { label: 'Shortlisted',  val: shortlisted, color: 'var(--blue)' },
          { label: 'Hired',        val: hired, color: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px' }}>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: s.color, margin: 0, lineHeight: 1 }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Top picks for you</h3>
            <button onClick={() => onNavigate('candidates')} style={{ ...btnGhost(), padding: '5px 10px' }}>
              See all <ChevronRight size={11} />
            </button>
          </div>
          {topPicks.length === 0 ? (
            <EmptyState icon="🎯" title="No top picks yet." message="Once students apply to your roles, the strongest matches show up here." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {topPicks.map(app => (
                <CandidateHighlightCard key={app.id} app={app} onClick={() => onSelectApp(app)} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: 'var(--text)', margin: '0 0 12px', fontWeight: 400 }}>Quick actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => onNavigate('post')} style={{ ...btnPrimary(false), justifyContent: 'flex-start', padding: '12px 14px' }}>
              <Plus size={14} /> Post a new role
            </button>
            <button onClick={() => onNavigate('candidates')} style={{ ...btnGhost(), justifyContent: 'flex-start', padding: '12px 14px', textAlign: 'left' }}>
              <UserCheck size={14} /> Browse all candidates
            </button>
            <button onClick={() => onNavigate('pipeline')} style={{ ...btnGhost(), justifyContent: 'flex-start', padding: '12px 14px' }}>
              <GitBranch size={14} /> View pipeline
            </button>
            <button onClick={() => onNavigate('roles')} style={{ ...btnGhost(), justifyContent: 'flex-start', padding: '12px 14px' }}>
              <Layers size={14} /> Manage roles
            </button>
          </div>

          <div style={{ marginTop: 20, padding: 14, background: 'var(--ember-tint)', border: '1px solid var(--ember-border)', borderRadius: 10 }}>
            <p style={{ fontSize: 10, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 6 }}>Avg match score</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: 'var(--ember)', margin: 0, lineHeight: 1 }}>{avgScore}%</p>
            <p style={{ fontSize: 10, color: 'var(--text-mid)', marginTop: 6, lineHeight: 1.4 }}>
              {avgScore >= 70 ? 'Strong applicant pool. Move fast.' : avgScore >= 50 ? 'Mixed pool — focus on top 6.' : 'Consider tightening role requirements.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. TAB: ROLES
// ═══════════════════════════════════════════════════════════════════════════
function RolesTab({ jobs, onCopyLink, onTogglePause, onDelete, refreshJobs }) {
  const [subTab, setSubTab] = useState('live');
  const [openJob, setOpenJob] = useState(null);

  const grouped = {
    live:   jobs.filter(j => (j.status || (j.is_active ? 'live' : 'paused')) === 'live'),
    paused: jobs.filter(j => (j.status || (j.is_active ? 'live' : 'paused')) === 'paused'),
    closed: jobs.filter(j => j.status === 'closed'),
  };

  if (openJob) {
    return <RoleDetailView job={openJob} onBack={() => setOpenJob(null)} onCopyLink={onCopyLink} refreshJobs={refreshJobs} />;
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, marginBottom: 6 }}>Roles</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Manage your roles</h1>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'live',   label: `Live (${grouped.live.length})` },
          { id: 'paused', label: `Paused (${grouped.paused.length})` },
          { id: 'closed', label: `Closed (${grouped.closed.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{
            padding: '10px 14px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
            background: 'transparent', border: 'none',
            borderBottom: `2px solid ${subTab === t.id ? 'var(--ember)' : 'transparent'}`,
            color: subTab === t.id ? 'var(--ember)' : 'var(--text-mid)',
            fontWeight: subTab === t.id ? 500 : 400, marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      {grouped[subTab].length === 0 ? (
        <EmptyState
          icon={subTab === 'live' ? '📋' : subTab === 'paused' ? '⏸' : '✕'}
          title={`No ${subTab} roles.`}
          message={subTab === 'live' ? 'Post your first role to start receiving matched candidates.' : `Roles you ${subTab === 'paused' ? 'pause' : 'close'} will appear here.`}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
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
// 13. TAB: CANDIDATES (top picks across all roles)
// ═══════════════════════════════════════════════════════════════════════════
function CandidatesTab({ allApps, onStatusChange }) {
  const [cap, setCap] = useState(6);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  const filtered = useMemo(() => {
    let list = [...allApps].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    if (filter === 'unreviewed')   list = list.filter(a => !a.status || a.status === 'pending');
    if (filter === 'shortlisted')  list = list.filter(a => a.status === 'shortlisted');
    if (filter === 'high-match')   list = list.filter(a => (a.match_score || 0) >= 80);
    // Cap respects total: if fewer applicants than cap, show all
    return list.slice(0, Math.min(cap, list.length));
  }, [allApps, filter, cap]);

  const totalAvailable = allApps.length;

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, marginBottom: 6 }}>Candidates</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Hunt's top picks</h1>
        <p style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 6 }}>
          Ranked by match score across all your live roles. {totalAvailable} total applicant{totalAvailable === 1 ? '' : 's'}.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all',         label: 'All' },
            { id: 'unreviewed',  label: 'Unreviewed' },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'high-match',  label: '80%+ match' },
          ].map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} style={{
              padding: '6px 12px', borderRadius: 16, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
              background: filter === t.id ? 'var(--ember-tint)' : 'transparent',
              border: `1px solid ${filter === t.id ? 'var(--ember)' : 'var(--border)'}`,
              color: filter === t.id ? 'var(--ember)' : 'var(--text-mid)',
              fontWeight: filter === t.id ? 500 : 400,
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Show top</span>
          {[6, 10, 15].map(n => (
            <button key={n} onClick={() => setCap(n)}
              disabled={totalAvailable < n && n !== 6}
              style={{
                padding: '5px 10px', borderRadius: 6, fontSize: 11, fontFamily: 'inherit',
                cursor: totalAvailable < n && n !== 6 ? 'not-allowed' : 'pointer',
                opacity: totalAvailable < n && n !== 6 ? 0.4 : 1,
                background: cap === n ? 'var(--ember)' : 'transparent',
                color: cap === n ? '#fff' : 'var(--text-mid)',
                border: `1px solid ${cap === n ? 'var(--ember)' : 'var(--border)'}`,
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

// ═══════════════════════════════════════════════════════════════════════════
// 14. TAB: PIPELINE (Shortlisted → Interview → Hired)
// ═══════════════════════════════════════════════════════════════════════════
function PipelineTab({ allApps, onStatusChange }) {
  const [selectedApp, setSelectedApp] = useState(null);

  const stages = [
    { id: 'shortlisted', label: 'Shortlisted', color: 'var(--green)',  icon: Bookmark },
    { id: 'interview',   label: 'Interview',   color: 'var(--blue)',   icon: Phone },
    { id: 'hired',       label: 'Hired',       color: 'var(--purple)', icon: Award },
  ];

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, marginBottom: 6 }}>Pipeline</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Hiring pipeline</h1>
        <p style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 6 }}>Move candidates through the stages. Status updates notify the student.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 1fr 1fr 380px' : 'repeat(3, 1fr)', gap: 12 }}>
        {stages.map(stage => {
          const candidates = allApps.filter(a => a.status === stage.id);
          const Icon = stage.icon;
          return (
            <div key={stage.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 14, minHeight: 300,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={14} style={{ color: stage.color }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{stage.label}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: stage.color, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-subtle)' }}>{candidates.length}</span>
              </div>
              {candidates.length === 0 ? (
                <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', padding: '24px 0' }}>No candidates here yet.</p>
              ) : (
                candidates.map(app => {
                  const s = app.students || {};
                  return (
                    <div key={app.id} onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                      style={{
                        padding: '10px 12px', borderRadius: 8,
                        border: `1px solid ${selectedApp?.id === app.id ? 'var(--ember)' : 'var(--border)'}`,
                        background: 'var(--bg-subtle)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                      <Avatar name={s.full_name} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name || 'Student'}</p>
                        <p style={{ fontSize: 9, color: 'var(--ember)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.jobs?.role}</p>
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
// 15. TAB: POST A ROLE (manual + AI side-by-side)
// ═══════════════════════════════════════════════════════════════════════════
function PostTab({ recruiter, onPosted, showToast }) {
  const [aiPrefill, setAiPrefill] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, marginBottom: 6 }}>Post a role</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Hire your next intern.</h1>
        <p style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 6 }}>Chat with AI on the left, fine-tune on the right, publish.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Sparkles size={14} style={{ color: 'var(--ember)' }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Assistant</span>
          </div>
          <PostRoleAI recruiter={recruiter} onGenerated={setAiPrefill} onError={msg => showToast(msg, 'error')} />
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Edit3 size={14} style={{ color: 'var(--text-mid)' }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Role details</span>
            {aiPrefill && (
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--ember-tint)', color: 'var(--ember)', marginLeft: 'auto' }}>AI populated</span>
            )}
          </div>
          <PostRoleManual recruiter={recruiter} prefill={aiPrefill}
            onSuccess={() => { setAiPrefill(null); onPosted(); }}
            onError={msg => showToast(msg, 'error')} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 16. TAB: PROFILE (Startup + Recruiter sub-tabs)
// ═══════════════════════════════════════════════════════════════════════════
function ProfileTab({ recruiter, onUpdate, showToast }) {
  const [subTab, setSubTab] = useState('startup');
  const isFounder = recruiter.role_in_company === 'founder';
  const startup = recruiter.startups || {};

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, marginBottom: 6 }}>Profile</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Your profile</h1>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'startup',   label: 'Startup' },
          { id: 'recruiter', label: 'You' },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{
            padding: '10px 14px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
            background: 'transparent', border: 'none',
            borderBottom: `2px solid ${subTab === t.id ? 'var(--ember)' : 'transparent'}`,
            color: subTab === t.id ? 'var(--ember)' : 'var(--text-mid)',
            fontWeight: subTab === t.id ? 500 : 400, marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      {subTab === 'startup' ? (
        <StartupProfileForm startup={startup} canEdit={isFounder} onUpdate={onUpdate} showToast={showToast} />
      ) : (
        <RecruiterProfileForm recruiter={recruiter} onUpdate={onUpdate} showToast={showToast} />
      )}
    </div>
  );
}

function StartupProfileForm({ startup, canEdit, onUpdate, showToast }) {
  const [form, setForm] = useState({
    name: startup.name || '',
    logo_emoji: startup.logo_emoji || '🚀',
    tagline: startup.tagline || '',
    about: startup.about || '',
    website: startup.website || '',
    industry: startup.industry || '',
    stage: startup.stage || '',
    team_size: startup.team_size || '',
    founded_year: startup.founded_year || '',
    hq_location: startup.hq_location || '',
  });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await updateStartupProfile(startup.id, form);
      showToast('Startup profile updated');
      onUpdate();
    } catch (e) { showToast('Failed to update', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
      {!canEdit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'var(--amber-tint)', border: '1px solid rgba(180,83,9,0.2)', marginBottom: 16 }}>
          <Lock size={13} style={{ color: 'var(--amber)' }} />
          <p style={{ fontSize: 11, color: 'var(--amber)', margin: 0 }}>Read-only. Only founders can edit the startup profile. Ask a founder for access.</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
        <div>
          <Label>Logo</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, width: 152 }}>
            {LOGO_EMOJIS.slice(0, 8).map(e => (
              <button key={e} disabled={!canEdit} onClick={() => set('logo_emoji')(e)} style={{
                width: 34, height: 34, borderRadius: 6, fontSize: 17, cursor: canEdit ? 'pointer' : 'not-allowed',
                opacity: canEdit ? 1 : 0.5,
                border: `1.5px solid ${form.logo_emoji === e ? 'var(--ember)' : 'var(--border)'}`,
                background: form.logo_emoji === e ? 'var(--ember-tint)' : 'var(--bg-subtle)',
              }}>{e}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <Label required>Startup name</Label>
          <FocusInput value={form.name} disabled={!canEdit} onChange={e => set('name')(e.target.value)} placeholder="HUNT Labs" />
          <div style={{ height: 10 }} />
          <Label>Tagline</Label>
          <FocusInput value={form.tagline} disabled={!canEdit} onChange={e => set('tagline')(e.target.value)} placeholder="Skill-first internships" />
        </div>
      </div>

      <Label>About</Label>
      <FocusTextarea value={form.about} disabled={!canEdit} onChange={e => set('about')(e.target.value)} rows={4}
        placeholder="What does your startup do? What's the mission?" />
      <div style={{ height: 14 }} />

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
            <option value="">—</option>
            <option>1-10</option><option>11-50</option><option>51-200</option><option>200+</option>
          </FocusSelect>
        </div>
        <div><Label>Founded</Label><FocusInput type="number" value={form.founded_year} disabled={!canEdit} onChange={e => set('founded_year')(e.target.value)} placeholder="2024" /></div>
      </div>

      {canEdit && (
        <div style={{ marginTop: 18 }}>
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
    contact_name: recruiter.contact_name || '',
    email: recruiter.email || '',
    phone: recruiter.phone || '',
    title: recruiter.title || '',
    linkedin_url: recruiter.linkedin_url || '',
    bio: recruiter.bio || '',
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
    } catch (e) { showToast('Failed to update', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
        <Avatar name={form.contact_name} size={56} />
        <div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: 'var(--text)', margin: 0 }}>{form.contact_name || 'Your name'}</p>
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

      <div style={{ height: 14 }} />
      <Label>Bio</Label>
      <FocusTextarea value={form.bio} onChange={e => set('bio')(e.target.value)} rows={3} placeholder="Short intro that candidates will see when you reach out." />

      <div style={{ marginTop: 18 }}>
        <button onClick={save} disabled={saving} style={btnPrimary(saving)}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 17. TAB: NETWORK (stub for future)
// ═══════════════════════════════════════════════════════════════════════════
function NetworkTab() {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, marginBottom: 6 }}>Network</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Connect with builders.</h1>
      </div>
      <EmptyState icon="🌐" title="Coming soon."
        message="Connect with other startups, recruiters, and high-signal builders. We're building this carefully — quality over quantity, like everything else on HUNT." />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 18. TAB: SETTINGS
// ═══════════════════════════════════════════════════════════════════════════
function SettingsTab({ theme, setTheme, onSignOut }) {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, marginBottom: 6 }}>Settings</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Settings</h1>
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, maxWidth: 540 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Theme</p>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '3px 0 0' }}>Light or dark mode.</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setTheme('light')} style={{
              padding: '8px 12px', borderRadius: 8, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              background: theme === 'light' ? 'var(--ember-tint)' : 'transparent',
              border: `1px solid ${theme === 'light' ? 'var(--ember)' : 'var(--border)'}`,
              color: theme === 'light' ? 'var(--ember)' : 'var(--text-mid)',
            }}><Sun size={12} /> Light</button>
            <button onClick={() => setTheme('dark')} style={{
              padding: '8px 12px', borderRadius: 8, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              background: theme === 'dark' ? 'var(--ember-tint)' : 'transparent',
              border: `1px solid ${theme === 'dark' ? 'var(--ember)' : 'var(--border)'}`,
              color: theme === 'dark' ? 'var(--ember)' : 'var(--text-mid)',
            }}><Moon size={12} /> Dark</button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Sign out</p>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '3px 0 0' }}>You'll need to log in again.</p>
          </div>
          <button onClick={onSignOut} style={{ ...btnGhost(), color: 'var(--red)', borderColor: 'rgba(192,57,43,0.3)' }}>
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 19. MAIN SHELL
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
  const [globalSelectedApp, setGlobalSelectedApp] = useState(null);

  useEffect(() => { applyTokens(theme); localStorage.setItem('hunt-theme', theme); }, [theme]);

  useEffect(() => { (async () => {
    try {
      const r = await getRecruiterProfile();
      if (!r) { navigate('/recruiter/onboarding'); return; }
      setRecruiter(r);
      const [j, a] = await Promise.all([
        getRecruiterJobs(r.id),
        getAllApplicationsForRecruiter(r.id),
      ]);
      setJobs(j); setAllApps(a);
    } catch (e) { showToast('Failed to load dashboard', 'error'); }
    finally { setLoading(false); }
  })(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const refreshJobs = async () => {
    if (!recruiter) return;
    const [j, a] = await Promise.all([
      getRecruiterJobs(recruiter.id),
      getAllApplicationsForRecruiter(recruiter.id),
    ]);
    setJobs(j); setAllApps(a);
  };
  const refreshRecruiter = async () => {
    const r = await getRecruiterProfile();
    setRecruiter(r);
  };

  const handleTogglePause = async (job) => {
    const status = job.status || (job.is_active ? 'live' : 'paused');
    const next = status === 'live' ? 'paused' : 'live';
    try {
      await updateJob(job.id, { status: next, is_active: next === 'live' });
      setJobs(j => j.map(x => x.id === job.id ? { ...x, status: next, is_active: next === 'live' } : x));
      showToast(next === 'live' ? 'Role resumed' : 'Role paused');
    } catch { showToast('Update failed', 'error'); }
  };

  const handleCopyLink = (job) => {
    const url = `${window.location.origin}/apply/${job.share_slug}`;
    navigator.clipboard.writeText(url).then(() => showToast('Share link copied'));
  };

  const handleDelete = async (job) => {
    if (!confirm(`Delete "${job.role}"? This cannot be undone.`)) return;
    try {
      await deleteJob(job.id);
      setJobs(j => j.filter(x => x.id !== job.id));
      showToast('Role deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      setAllApps(a => a.map(x => x.id === appId ? { ...x, status } : x));
      const labels = { shortlisted: 'Shortlisted', interview: 'Moved to interview', hired: 'Hired! 🎉', rejected: 'Passed' };
      showToast(labels[status] || 'Updated');
    } catch { showToast('Update failed', 'error'); }
  };

  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: 'var(--text)' }}>Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', WebkitFontSmoothing: 'antialiased' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: 220, flexShrink: 0,
        borderRight: '1px solid var(--border)', background: 'var(--bg-card)',
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', padding: '20px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', marginBottom: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: '0.14em', color: 'var(--text)' }}>HUNT</span>
          <span style={{ fontSize: 9, color: 'var(--ember)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Recruiter</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', padding: '0 8px', marginBottom: 22, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {recruiter.startups?.name || recruiter.company_name}
        </p>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 7, border: 'none',
                background: active ? 'var(--ember-tint)' : 'transparent',
                color: active ? 'var(--ember)' : item.accent ? 'var(--ember)' : 'var(--text-mid)',
                fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left',
                fontWeight: active ? 500 : 400,
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar name={recruiter.contact_name} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recruiter.contact_name}</p>
            <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recruiter.role_in_company || 'Recruiter'}</p>
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '32px 36px 80px', maxWidth: 1280, width: '100%', margin: '0 auto' }}>
        {activeTab === 'home' && (
          <HomeTab recruiter={recruiter} jobs={jobs} allApps={allApps}
            onNavigate={setActiveTab}
            onSelectApp={(app) => { setGlobalSelectedApp(app); setActiveTab('candidates'); }} />
        )}
        {activeTab === 'roles' && (
          <RolesTab jobs={jobs}
            onCopyLink={handleCopyLink}
            onTogglePause={handleTogglePause}
            onDelete={handleDelete}
            refreshJobs={refreshJobs} />
        )}
        {activeTab === 'candidates' && (
          <CandidatesTab allApps={allApps} onStatusChange={handleStatusChange} />
        )}
        {activeTab === 'pipeline' && (
          <PipelineTab allApps={allApps} onStatusChange={handleStatusChange} />
        )}
        {activeTab === 'post' && (
          <PostTab recruiter={recruiter} showToast={showToast}
            onPosted={async () => { await refreshJobs(); showToast('Role posted!'); setActiveTab('roles'); }} />
        )}
        {activeTab === 'profile' && (
          <ProfileTab recruiter={recruiter} onUpdate={refreshRecruiter} showToast={showToast} />
        )}
        {activeTab === 'network' && <NetworkTab />}
        {activeTab === 'settings' && (
          <SettingsTab theme={theme} setTheme={setTheme} onSignOut={handleSignOut} />
        )}
      </main>

      <style>{`
        @keyframes fadeDown {
          from { opacity:0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }
        * { box-sizing: border-box; }
        button:disabled { opacity: 0.5; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-dim); }
      `}</style>
    </div>
  );
}
