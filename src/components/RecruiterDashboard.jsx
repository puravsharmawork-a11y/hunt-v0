// src/components/RecruiterDashboard.jsx
// HUNT — RECRUITER DASHBOARD (v7 — brutalist redesign, recent roles home, hunt score in snapshots, send msg)

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, LogOut, Sun, Moon, X, ChevronRight,
  MapPin, Users, Link2, Trash2,
  ArrowLeft, Pause, Play, ExternalLink, Github, Building2, Home,
  Layers, UserCheck, GitBranch, Network, Sparkles,
  Bookmark, ThumbsDown, Phone, Award, Bell, Lock, MessageSquare,
  LayoutGrid, List, Send, Star, TrendingUp, Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOut } from '../services/supabase';

// ═══════════════════════════════════════════════════════════════════════════
// 1. DESIGN TOKENS — BRUTALIST EDITORIAL
// ═══════════════════════════════════════════════════════════════════════════
const tokens = {
  light: {
    '--bg':           '#F2EFE8',
    '--bg-card':      '#FAFAF6',
    '--bg-subtle':    '#ECEAE2',
    '--bg-hover':     '#E4E1D8',
    '--border':       '#1A1A18',
    '--border-mid':   '#1A1A18',
    '--text':         '#0A0A08',
    '--text-mid':     '#3A3A36',
    '--text-dim':     '#7A7A74',
    '--green':        '#0A5C35',
    '--green-tint':   '#D4EDE0',
    '--green-text':   '#0A5C35',
    '--red':          '#8B1A0A',
    '--red-tint':     '#F5DDD9',
    '--amber':        '#6B4500',
    '--amber-tint':   '#F5E8CC',
    '--blue':         '#0A2E6E',
    '--blue-tint':    '#D4DFFA',
    '--purple':       '#3A0A6E',
    '--purple-tint':  '#E8D4FA',
    '--accent':       '#1A1AFF',
    '--accent-tint':  '#E0E0FF',
  },
  dark: {
    '--bg':           '#0C0C0A',
    '--bg-card':      '#141412',
    '--bg-subtle':    '#1C1C1A',
    '--bg-hover':     '#242420',
    '--border':       '#E8E5DC',
    '--border-mid':   '#B0ADA4',
    '--text':         '#F5F2E8',
    '--text-mid':     '#B8B5AA',
    '--text-dim':     '#6A6A64',
    '--green':        '#2ECC80',
    '--green-tint':   '#0A2A1A',
    '--green-text':   '#2ECC80',
    '--red':          '#E05040',
    '--red-tint':     '#2A0E08',
    '--amber':        '#E0A030',
    '--amber-tint':   '#2A1C08',
    '--blue':         '#5080F0',
    '--blue-tint':    '#0A1835',
    '--purple':       '#A060F0',
    '--purple-tint':  '#1A0835',
    '--accent':       '#4040FF',
    '--accent-tint':  '#0A0A2A',
  },
};
const applyTokens = (theme) =>
  Object.entries(tokens[theme]).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v));

// ═══════════════════════════════════════════════════════════════════════════
// 2. SUPABASE HELPERS (unchanged from v6)
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
    .from('jobs').select('id, role, logo, company').eq('recruiter_id', recruiterId);
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
    type: 'success',
    title: (role, company) => `Shortlisted by ${company}`,
    body: (role, company) => `You're in their top picks for ${role}. Keep an eye on your Offers tab.`,
  },
  interview: {
    type: 'alert',
    title: (role, company) => `Interview invite — ${company}`,
    body: (role, company) => `${company} wants to interview you for ${role}. Check your Offers tab for details.`,
  },
  hired: {
    type: 'success',
    title: (role, company) => `Offer from ${company} 🎉`,
    body: (role, company) => `You received an offer for ${role}. Head to your Offers tab to respond.`,
  },
  rejected: {
    type: 'info',
    title: (role, company) => `Application update — ${company}`,
    body: (role, company) => `${company} has made a decision on your ${role} application.`,
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
const LOGO_EMOJIS = ['🚀','⚡','🎯','💡','🔥','🌊','🛠️','📊','🎨','🌱','⭐','🦾','🧬','🌐','🔮','🎮'];

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',     icon: Home },
  { id: 'roles',   label: 'Roles',    icon: Layers },
  { id: 'hiring',  label: 'Pipeline', icon: GitBranch },
  { id: 'profile', label: 'Profile',  icon: Building2 },
  { id: 'network', label: 'Network',  icon: Network },
];

const STATUS_META = {
  pending:     { label: 'Pending',     color: 'var(--text-dim)',   bg: 'var(--bg-subtle)',   border: 'var(--border-mid)' },
  shortlisted: { label: 'Shortlisted', color: 'var(--green-text)', bg: 'var(--green-tint)',  border: 'var(--green)' },
  interview:   { label: 'Interview',   color: 'var(--blue)',       bg: 'var(--blue-tint)',   border: 'var(--blue)' },
  hired:       { label: 'Hired',       color: 'var(--purple)',     bg: 'var(--purple-tint)', border: 'var(--purple)' },
  rejected:    { label: 'Passed',      color: 'var(--red)',        bg: 'var(--red-tint)',    border: 'var(--red)' },
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. ATOMS — BRUTALIST STYLE
// ═══════════════════════════════════════════════════════════════════════════
const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 0,
  border: '1.5px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.1s',
};
function FocusInput({ style, ...props }) {
  return <input {...props} style={{ ...inp, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
    onBlur={e  => e.target.style.borderColor = 'var(--border)'} />;
}
function FocusSelect({ style, children, ...props }) {
  return <select {...props} style={{ ...inp, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
    onBlur={e  => e.target.style.borderColor = 'var(--border)'}>{children}</select>;
}
function FocusTextarea({ style, ...props }) {
  return <textarea {...props} style={{ ...inp, resize: 'vertical', minHeight: 70, borderRadius: 0, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
    onBlur={e  => e.target.style.borderColor = 'var(--border)'} />;
}
function Label({ children, required }) {
  return (
    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
      {children}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
    </p>
  );
}
function Toast({ msg, type }) {
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, padding: '10px 20px', fontSize: 12, fontWeight: 600,
      background: type === 'error' ? 'var(--red)' : 'var(--text)',
      color: 'var(--bg)', border: '2px solid var(--border)',
      letterSpacing: '0.05em', textTransform: 'uppercase',
      maxWidth: '90vw', textAlign: 'center',
    }}>{msg}</div>
  );
}
function Avatar({ name, size = 36 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: 'var(--text)', color: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 700, letterSpacing: '0.05em',
      fontFamily: 'inherit',
    }}>{initials}</div>
  );
}
function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{
      fontSize: 8, padding: '3px 7px', fontWeight: 700,
      background: m.bg, color: m.color, border: `1.5px solid ${m.border}`,
      textTransform: 'uppercase', letterSpacing: '0.1em',
    }}>{m.label}</span>
  );
}
function EmptyState({ icon = '—', title, message, cta }) {
  return (
    <div style={{
      textAlign: 'center', padding: '64px 24px',
      background: 'var(--bg-card)', border: '2px solid var(--border)',
    }}>
      <div style={{ fontSize: 32, marginBottom: 14, fontFamily: 'Georgia, serif' }}>{icon}</div>
      <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 20, color: 'var(--text)', marginBottom: 6, fontWeight: 400 }}>{title}</p>
      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: cta ? 18 : 0, lineHeight: 1.6 }}>{message}</p>
      {cta}
    </div>
  );
}

// HUNT Score — the big number with ring
function HuntScoreRing({ score, size = 56 }) {
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
  const r = (size / 2) - 4;
  const circ = 2 * Math.PI * r;
  const pct = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth="3" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${pct} ${circ}`} strokeLinecap="square" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color, lineHeight: 1, fontFamily: 'Georgia, serif' }}>{score}</span>
        <span style={{ fontSize: size * 0.12, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>HUNT</span>
      </div>
    </div>
  );
}

function ScoreNumber({ score, size = 16 }) {
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
  return <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: size, color, lineHeight: 1, fontWeight: 400 }}>{score}%</span>;
}
function btnPrimary(disabled) {
  return {
    padding: '10px 16px', borderRadius: 0,
    border: `2px solid ${disabled ? 'var(--border-mid)' : 'var(--text)'}`,
    background: disabled ? 'var(--bg-subtle)' : 'var(--text)', color: 'var(--bg)',
    fontSize: 11, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    transition: 'opacity 0.1s',
  };
}
function btnGhost() {
  return {
    padding: '10px 16px', borderRadius: 0, border: '1.5px solid var(--border)',
    background: 'transparent', color: 'var(--text-mid)',
    fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    transition: 'border-color 0.1s, color 0.1s',
  };
}
function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: 20 }}>
      <div>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>{eyebrow}</p>
        <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 32, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.15 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 10, lineHeight: 1.6, maxWidth: 560 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0, marginTop: 4 }}>{action}</div>}
    </div>
  );
}
function SubTabStrip({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 24 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '10px 18px', fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
          background: 'transparent', border: 'none',
          borderBottom: `3px solid ${active === t.id ? 'var(--text)' : 'transparent'}`,
          color: active === t.id ? 'var(--text)' : 'var(--text-dim)',
          fontWeight: active === t.id ? 700 : 400, marginBottom: -2,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          transition: 'color 0.1s',
        }}>{t.label}</button>
      ))}
    </div>
  );
}
const linkChip = {
  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-mid)',
  padding: '4px 10px', border: '1.5px solid var(--border)', textDecoration: 'none',
  fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
};
const iconBtn = {
  padding: '7px 10px', borderRadius: 0, border: '1.5px solid var(--border)',
  background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  transition: 'border-color 0.1s, color 0.1s',
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. POST ROLE DRAWER (brutalist styled)
// ═══════════════════════════════════════════════════════════════════════════
function PostRoleDrawer({ recruiter, open, onClose, onSuccess, showToast }) {
  const [skillInput, setSkillInput]         = useState('');
  const [niceInput, setNiceInput]           = useState('');
  const [whatDoInput, setWhatDoInput]       = useState('');
  const [perkInput, setPerkInput]           = useState('');
  const [newSecHeading, setNewSecHeading]   = useState('');
  const [newSecItemText, setNewSecItemText] = useState({});
  const [saving, setSaving]                 = useState(false);
  const [form, setForm] = useState(() => ({
    logo: recruiter?.startups?.logo_emoji || '🚀',
    role: '', description: '', stipend: '', duration: '',
    location: '', type: 'Paid Internship', visibility: 'public',
    required_skills: [], nice_to_have: [],
    max_applicants: 50, minimum_match_threshold: 50, positions: 1,
    whatYoullDo: [], perks: [], sections: [],
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
  const addWhatDo = () => {
    const n = whatDoInput.trim(); if (!n) return;
    setForm(f => ({ ...f, whatYoullDo: [...f.whatYoullDo, n] }));
    setWhatDoInput('');
  };
  const removeWhatDo = (i) => setForm(f => ({ ...f, whatYoullDo: f.whatYoullDo.filter((_, idx) => idx !== i) }));
  const addPerk = () => {
    const n = perkInput.trim(); if (!n || form.perks.includes(n)) return;
    setForm(f => ({ ...f, perks: [...f.perks, n] }));
    setPerkInput('');
  };
  const removePerk = (i) => setForm(f => ({ ...f, perks: f.perks.filter((_, idx) => idx !== i) }));
  const addSection = () => {
    const h = newSecHeading.trim(); if (!h) return;
    setForm(f => ({ ...f, sections: [...f.sections, { heading: h, items: [] }] }));
    setNewSecHeading('');
  };
  const removeSection = (si) => setForm(f => ({ ...f, sections: f.sections.filter((_, i) => i !== si) }));
  const addSectionItem = (si) => {
    const text = (newSecItemText[si] || '').trim(); if (!text) return;
    setForm(f => ({ ...f, sections: f.sections.map((s, i) => i === si ? { ...s, items: [...s.items, text] } : s) }));
    setNewSecItemText(prev => ({ ...prev, [si]: '' }));
  };
  const removeSectionItem = (si, ii) => setForm(f => ({
    ...f,
    sections: f.sections.map((s, i) => i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s),
  }));

  const handleSubmit = async () => {
    if (!form.role.trim())     return showToast('Role title required.', 'error');
    if (!form.stipend.trim())  return showToast('Stipend required.', 'error');
    if (!form.duration.trim()) return showToast('Duration required.', 'error');
    if (!form.location.trim()) return showToast('Location required.', 'error');
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
        what_youll_do: form.whatYoullDo, perks: form.perks, sections: form.sections,
      });
      onSuccess();
      onClose();
    } catch (e) { showToast('Failed: ' + (e.message || 'Unknown error'), 'error'); }
    finally { setSaving(false); }
  };

  const chipBtn = (active) => ({
    flex: 1, padding: '8px', fontSize: 10, fontFamily: 'inherit', cursor: 'pointer',
    background: active ? 'var(--text)' : 'transparent',
    border: `1.5px solid ${active ? 'var(--text)' : 'var(--border)'}`,
    color: active ? 'var(--bg)' : 'var(--text-mid)',
    fontWeight: active ? 700 : 400, borderRadius: 0,
    textTransform: 'uppercase', letterSpacing: '0.08em',
  });

  const ListItemRow = ({ item, onRemove }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 10px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 4 }}>
      <div style={{ width: 3, height: 3, background: 'var(--text-dim)', flexShrink: 0, marginTop: 7 }} />
      <span style={{ flex: 1, fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>{item}</span>
      <button onClick={onRemove} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0, flexShrink: 0 }}><X size={12} /></button>
    </div>
  );

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9000 }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 520,
        background: 'var(--bg-card)', borderLeft: '2px solid var(--border)',
        zIndex: 9001, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0, marginBottom: 6 }}>Post a role</p>
            <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 22, fontWeight: 400, color: 'var(--text)', margin: 0 }}>Hire your next <em>intern.</em></h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1.5px solid var(--border)', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
              <div style={{ flexShrink: 0 }}>
                <Label>Logo</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, width: 152 }}>
                  {LOGO_EMOJIS.slice(0, 8).map(e => (
                    <button key={e} onClick={() => set('logo')(e)} style={{ width: 34, height: 34, fontSize: 17, cursor: 'pointer', border: `2px solid ${form.logo === e ? 'var(--text)' : 'var(--border)'}`, background: 'var(--bg-subtle)', borderRadius: 0 }}>{e}</button>
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
              <FocusTextarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3} placeholder="What will the intern actually work on? Be specific." />
            </div>
            <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: 16 }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Role content</p>
              <div style={{ marginBottom: 18 }}>
                <Label>What you'll do</Label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <FocusInput value={whatDoInput} onChange={e => setWhatDoInput(e.target.value)} placeholder="e.g. Build and ship features end to end" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addWhatDo())} style={{ flex: 1 }} />
                  <button onClick={addWhatDo} style={{ ...btnPrimary(false), padding: '10px 14px' }}>Add</button>
                </div>
                {form.whatYoullDo.map((item, i) => <ListItemRow key={i} item={item} onRemove={() => removeWhatDo(i)} />)}
              </div>
              <div style={{ marginBottom: 18 }}>
                <Label>Perks & benefits</Label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <FocusInput value={perkInput} onChange={e => setPerkInput(e.target.value)} placeholder="Flexible hours · Certificate" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPerk())} style={{ flex: 1 }} />
                  <button onClick={addPerk} style={{ ...btnGhost(), padding: '10px 14px' }}>Add</button>
                </div>
                {form.perks.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {form.perks.map((p, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, padding: '4px 10px', border: '1.5px solid var(--border)', color: 'var(--text-mid)', background: 'var(--bg-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {p}
                        <button onClick={() => removePerk(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: 16 }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Skills & config</p>
              <Label required>Required skills</Label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <FocusInput value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="React, Node.js, Python…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} list="skill-suggestions-drawer" style={{ flex: 1 }} />
                <datalist id="skill-suggestions-drawer">{SKILL_OPTIONS.map(s => <option key={s} value={s} />)}</datalist>
                <button onClick={addSkill} style={btnPrimary(false)}>Add</button>
              </div>
              {form.required_skills.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.required_skills.map(skill => (
                    <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1.5px solid var(--border)', background: 'var(--bg-subtle)' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{skill.name}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Level</span>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1,2,3,4,5].map(lv => (
                          <button key={lv} onClick={() => setForm(f => ({ ...f, required_skills: f.required_skills.map(s => s.name === skill.name ? { ...s, level: lv } : s) }))}
                            style={{ width: 22, height: 22, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: skill.level >= lv ? 'var(--text)' : 'var(--bg-card)', color: skill.level >= lv ? 'var(--bg)' : 'var(--text-dim)', outline: skill.level >= lv ? 'none' : '1.5px solid var(--border)' }}>{lv}</button>
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
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '3px 10px', border: '1.5px solid var(--border)', color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
                <div style={{ display: 'flex', gap: 4 }}>
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

        <div style={{ padding: '16px 24px', borderTop: '2px solid var(--border)', flexShrink: 0, background: 'var(--bg-card)' }}>
          <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary(saving), width: '100%', justifyContent: 'center', padding: '14px 16px', fontSize: 12 }}>
            {saving ? 'Posting…' : <><Plus size={13} /> Post role</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. APPLICANT SNAPSHOT — BRUTALIST + HUNT SCORE + SEND MESSAGE
// ═══════════════════════════════════════════════════════════════════════════
function ApplicantSnapshot({ app, onStatusChange, onClose, compact = false }) {
  const s         = app.students || {};
  const skills    = s.skills    || [];
  const projects  = s.projects  || [];
  const score     = app.match_score    || 0;
  const breakdown = app.match_breakdown || {};
  // HUNT Score — derived from match + profile completeness
  const huntScore = Math.min(100, Math.round(score * 0.7 + (s.profile_completeness || 70) * 0.3));
  const [recruiterNote, setRecruiterNote] = useState('');
  const [sending, setSending]             = useState(false);
  const [msgSent, setMsgSent]             = useState(false);

  const ACTIONS = [
    { key: 'shortlisted', label: 'Shortlist',  icon: Bookmark,   color: 'var(--green)',  bg: 'var(--green-tint)' },
    { key: 'interview',   label: 'Interview',  icon: Phone,      color: 'var(--blue)',   bg: 'var(--blue-tint)' },
    { key: 'hired',       label: 'Hire',       icon: Award,      color: 'var(--purple)', bg: 'var(--purple-tint)' },
    { key: 'rejected',    label: 'Pass',       icon: ThumbsDown, color: 'var(--red)',    bg: 'var(--red-tint)' },
  ];

  const handleAction = async (key) => {
    setSending(true);
    try { await onStatusChange(app.id, key, recruiterNote); setRecruiterNote(''); }
    finally { setSending(false); }
  };

  const handleSendMessage = async () => {
    if (!recruiterNote.trim()) return;
    setSending(true);
    try {
      // Send message without changing status
      await onStatusChange(app.id, app.status || 'pending', recruiterNote);
      setMsgSent(true);
      setTimeout(() => setMsgSent(false), 2500);
      setRecruiterNote('');
    } finally { setSending(false); }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)' }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Candidate Profile</p>
        {onClose && <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}><X size={16} /></button>}
      </div>

      <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>

        {/* Identity + HUNT Score */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: '1.5px solid var(--border)' }}>
          <Avatar name={s.full_name} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 18, color: 'var(--text)', margin: 0, fontWeight: 400, lineHeight: 1.2 }}>{s.full_name || 'Candidate'}</p>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0' }}>{s.college || '—'} · Year {s.year || '?'}</p>
            {app.jobs?.role && <p style={{ fontSize: 10, color: 'var(--text-mid)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Applied → {app.jobs.role}</p>}
          </div>
          {/* HUNT Score Ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <HuntScoreRing score={huntScore} size={60} />
          </div>
        </div>

        {/* Match score + status row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Match Score</span>
            <ScoreNumber score={score} size={22} />
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
          {app.status && <StatusPill status={app.status} />}
        </div>

        {/* Score breakdown */}
        {Object.keys(breakdown).length > 0 && (
          <div style={{ background: 'var(--bg-subtle)', border: '1.5px solid var(--border)', padding: '14px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Score breakdown</p>
            {Object.entries(breakdown).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: 'var(--text-mid)', width: 120, flexShrink: 0, textTransform: 'capitalize', letterSpacing: '0.04em' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div style={{ flex: 1, height: 3, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(v, 40) * 2.5}%`, background: 'var(--text)' }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text)', width: 28, textAlign: 'right' }}>{v}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {skills.map((sk, i) => (
                <span key={i} style={{ fontSize: 10, padding: '3px 9px', border: '1.5px solid var(--border)', color: 'var(--text)', fontWeight: 600, letterSpacing: '0.04em' }}>
                  {sk.name} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>L{sk.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && !compact && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Projects</p>
            {projects.slice(0, 3).map((p, i) => (
              <div key={i} style={{ padding: '10px 12px', border: '1.5px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{p.title || p.name}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(p.githubUrl || p.github_url) && <a href={p.githubUrl || p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><Github size={12} /></a>}
                    {(p.projectUrl || p.link) && <a href={p.projectUrl || p.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><ExternalLink size={12} /></a>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(Array.isArray(p.techStack) ? p.techStack : [p.techStack]).filter(Boolean).map((t, j) => (
                    <span key={j} style={{ fontSize: 9, padding: '1px 6px', border: '1px solid var(--border)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={linkChip}><Github size={11} /> GitHub</a>}
          {s.linkedin_url  && <a href={s.linkedin_url}  target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> LinkedIn</a>}
          {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> Portfolio</a>}
          {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, color: 'var(--text)', borderColor: 'var(--text)', borderWidth: 2 }}>↗ Resume</a>}
        </div>

        {/* ─── MESSAGE BOX ─── */}
        <div style={{ border: '2px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 14 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageSquare size={11} style={{ color: 'var(--text-dim)' }} />
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0 }}>Message to candidate</p>
          </div>
          <div style={{ padding: 12 }}>
            <textarea
              value={recruiterNote}
              onChange={e => setRecruiterNote(e.target.value)}
              placeholder="e.g. Great projects! We'd love to chat — sending a Calendly link shortly."
              rows={3}
              style={{ ...inp, fontSize: 12, padding: '9px 12px', minHeight: 'unset', resize: 'none', background: 'var(--bg-card)', marginBottom: 8 }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !recruiterNote.trim()}
              style={{
                ...btnPrimary(!recruiterNote.trim()),
                width: '100%', justifyContent: 'center', padding: '10px',
                background: msgSent ? 'var(--green)' : (!recruiterNote.trim() ? 'var(--bg-subtle)' : 'var(--text)'),
                borderColor: msgSent ? 'var(--green)' : undefined,
              }}
            >
              {msgSent ? '✓ Sent' : <><Send size={12} /> Send Message</>}
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Move to stage</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {ACTIONS.map(opt => {
            const active = app.status === opt.key;
            const Icon   = opt.icon;
            return (
              <button key={opt.key} disabled={sending} onClick={() => handleAction(opt.key)} style={{
                padding: '10px', fontSize: 11, fontWeight: 700,
                cursor: sending ? 'wait' : 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                border:     `2px solid ${active ? opt.color : 'var(--border)'}`,
                background: active ? opt.color : 'transparent',
                color:      active ? '#fff'    : opt.color,
                opacity:    sending ? 0.6      : 1,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                <Icon size={12} /> {opt.label}
              </button>
            );
          })}
        </div>

        {/* Last message sent */}
        {app.recruiter_message && (
          <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--bg-subtle)', border: '1.5px solid var(--border)', borderLeft: '3px solid var(--accent)' }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Last message sent</p>
            <p style={{ fontSize: 11, color: 'var(--text)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>"{app.recruiter_message}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Grid card version for HUNT Sort
function ApplicantSnapshotCard({ app, rank, onStatusChange, isGridView }) {
  const s         = app.students || {};
  const skills    = s.skills    || [];
  const projects  = s.projects  || [];
  const score     = app.match_score    || 0;
  const huntScore = Math.min(100, Math.round(score * 0.7 + (s.profile_completeness || 70) * 0.3));
  const [recruiterNote, setRecruiterNote] = useState('');
  const [sending, setSending]             = useState(false);
  const [msgSent, setMsgSent]             = useState(false);
  const [expanded, setExpanded]           = useState(false);

  const ACTIONS = [
    { key: 'shortlisted', label: 'Shortlist', icon: Bookmark,   color: 'var(--green)' },
    { key: 'interview',   label: 'Interview', icon: Phone,      color: 'var(--blue)' },
    { key: 'hired',       label: 'Hire',      icon: Award,      color: 'var(--purple)' },
    { key: 'rejected',    label: 'Pass',      icon: ThumbsDown, color: 'var(--red)' },
  ];

  const handleAction = async (key) => {
    setSending(true);
    try { await onStatusChange(app.id, key, recruiterNote); setRecruiterNote(''); }
    finally { setSending(false); }
  };

  const handleSendMessage = async () => {
    if (!recruiterNote.trim()) return;
    setSending(true);
    try {
      await onStatusChange(app.id, app.status || 'pending', recruiterNote);
      setMsgSent(true);
      setTimeout(() => setMsgSent(false), 2500);
      setRecruiterNote('');
    } finally { setSending(false); }
  };

  if (isGridView) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        {/* Rank + scores header */}
        <div style={{ padding: '10px 14px', borderBottom: '1.5px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', fontFamily: 'Georgia, serif' }}>#{rank}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 8, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Match</div>
              <ScoreNumber score={score} size={16} />
            </div>
            <HuntScoreRing score={huntScore} size={44} />
          </div>
        </div>

        <div style={{ padding: '14px 14px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Avatar name={s.full_name} size={38} />
            <div>
              <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 14, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{s.full_name || 'Student'}</p>
              <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.college || '—'} · Y{s.year || '?'}</p>
            </div>
          </div>

          {skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {skills.slice(0, 4).map((sk, i) => (
                <span key={i} style={{ fontSize: 9, padding: '2px 7px', border: '1.5px solid var(--border)', color: 'var(--text)', fontWeight: 600, letterSpacing: '0.04em' }}>
                  {sk.name} <span style={{ color: 'var(--text-dim)' }}>L{sk.level}</span>
                </span>
              ))}
              {skills.length > 4 && <span style={{ fontSize: 9, padding: '2px 5px', color: 'var(--text-dim)' }}>+{skills.length - 4}</span>}
            </div>
          )}

          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, fontSize: 9, padding: '2px 7px' }}><Github size={9} /> GitHub</a>}
            {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, fontSize: 9, padding: '2px 7px', color: 'var(--text)', borderColor: 'var(--text)', borderWidth: 2 }}>↗ Resume</a>}
            {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ ...linkChip, fontSize: 9, padding: '2px 7px' }}><ExternalLink size={9} /> Portfolio</a>}
          </div>

          {app.status && app.status !== 'pending' && <StatusPill status={app.status} />}
        </div>

        {/* Actions */}
        <div style={{ padding: '10px 12px', borderTop: '1.5px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <textarea
              value={recruiterNote}
              onChange={e => setRecruiterNote(e.target.value)}
              placeholder="Optional message…"
              rows={2}
              style={{ ...inp, fontSize: 10, padding: '6px 8px', flex: 1, minHeight: 'unset', resize: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !recruiterNote.trim()}
              title="Send message"
              style={{
                ...iconBtn,
                background: msgSent ? 'var(--green)' : 'var(--text)',
                borderColor: msgSent ? 'var(--green)' : 'var(--text)',
                color: 'var(--bg)',
                opacity: !recruiterNote.trim() ? 0.4 : 1,
                alignSelf: 'flex-end',
              }}
            >
              {msgSent ? '✓' : <Send size={11} />}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
            {ACTIONS.map(opt => {
              const active = app.status === opt.key;
              const Icon = opt.icon;
              return (
                <button key={opt.key} disabled={sending} onClick={() => handleAction(opt.key)} style={{
                  padding: '6px', fontSize: 9, fontWeight: 700,
                  cursor: sending ? 'wait' : 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  border:     `1.5px solid ${active ? opt.color : 'var(--border)'}`,
                  background: active ? opt.color : 'transparent',
                  color:      active ? '#fff'    : opt.color,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  <Icon size={10} /> {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // List view row
  return (
    <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
           onClick={() => setExpanded(e => !e)}>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', width: 22, textAlign: 'center', fontFamily: 'Georgia, serif', flexShrink: 0 }}>#{rank}</span>
        <Avatar name={s.full_name} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>{s.full_name || 'Student'}</p>
          <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.college || '—'} · Year {s.year || '?'}</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 180 }}>
          {skills.slice(0, 3).map((sk, i) => (
            <span key={i} style={{ fontSize: 8, padding: '2px 6px', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{sk.name}</span>
          ))}
        </div>
        <HuntScoreRing score={huntScore} size={38} />
        <ScoreNumber score={score} size={16} />
        {app.status && app.status !== 'pending' && <StatusPill status={app.status} />}
        <ChevronRight size={14} style={{ color: 'var(--text-dim)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
      </div>
      {expanded && (
        <div style={{ padding: '0 16px 14px 16px', borderTop: '1.5px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 14 }}>
            <div>
              {projects.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>Projects</p>
                  {projects.slice(0, 3).map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 11, color: 'var(--text)', flex: 1 }}>{p.title || p.name}</span>
                      {(p.githubUrl || p.github_url) && <a href={p.githubUrl || p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><Github size={10} /></a>}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, fontSize: 9, padding: '2px 7px' }}><Github size={9} /> GitHub</a>}
                {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, fontSize: 9, padding: '2px 7px', color: 'var(--text)', borderColor: 'var(--text)', borderWidth: 2 }}>↗ Resume</a>}
                {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ ...linkChip, fontSize: 9, padding: '2px 7px' }}><ExternalLink size={9} /> Portfolio</a>}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <textarea
                  value={recruiterNote}
                  onChange={e => setRecruiterNote(e.target.value)}
                  placeholder="Message to candidate…"
                  rows={2}
                  style={{ ...inp, fontSize: 11, padding: '7px 10px', flex: 1, minHeight: 'unset', resize: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
                <button onClick={handleSendMessage} disabled={sending || !recruiterNote.trim()} title="Send message"
                  style={{ ...iconBtn, background: msgSent ? 'var(--green)' : 'var(--text)', borderColor: msgSent ? 'var(--green)' : 'var(--text)', color: 'var(--bg)', opacity: !recruiterNote.trim() ? 0.4 : 1, alignSelf: 'flex-end' }}>
                  {msgSent ? '✓' : <Send size={11} />}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5 }}>
                {ACTIONS.map(opt => {
                  const active = app.status === opt.key;
                  const Icon = opt.icon;
                  return (
                    <button key={opt.key} disabled={sending} onClick={() => handleAction(opt.key)} style={{
                      padding: '7px 6px', fontSize: 9, fontWeight: 700,
                      cursor: sending ? 'wait' : 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      border:     `1.5px solid ${active ? opt.color : 'var(--border)'}`,
                      background: active ? opt.color : 'transparent',
                      color:      active ? '#fff'    : opt.color,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      <Icon size={10} /> {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. ROLE CARD — BRUTALIST
// ═══════════════════════════════════════════════════════════════════════════
function RoleCard({ job, onClick, onTogglePause, onCopyLink, onDelete }) {
  const filled = (job.current_applicants || 0) / (job.max_applicants || 50);
  const status = job.status || (job.is_active ? 'live' : 'paused');
  const statusStyle = status === 'live'
    ? { color: 'var(--green)', border: 'var(--green)', label: '● Live' }
    : status === 'paused'
    ? { color: 'var(--amber)', border: 'var(--amber)', label: '⏸ Paused' }
    : { color: 'var(--text-dim)', border: 'var(--border)', label: '✕ Closed' };
  return (
    <div onClick={onClick} className="hn-card" style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 180 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <span style={{ fontSize: 26, lineHeight: 1 }}>{job.logo || '🚀'}</span>
          <div>
            <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 15, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.25 }}>{job.role}</p>
            <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{job.stipend} · {job.duration}</p>
          </div>
        </div>
        <span style={{ fontSize: 8, padding: '2px 8px', fontWeight: 700, color: statusStyle.color, border: `1.5px solid ${statusStyle.border}`, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', flexShrink: 0 }}>{statusStyle.label}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-mid)', flexWrap: 'wrap', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={9} /> {job.location}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={9} /> {job.current_applicants || 0}/{job.max_applicants || 50}</span>
      </div>
      <div>
        <div style={{ height: 2, background: 'var(--bg-hover)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(filled, 1) * 100}%`, background: filled > 0.8 ? 'var(--red)' : filled > 0.5 ? 'var(--amber)' : 'var(--text)' }} />
        </div>
      </div>
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 4, marginTop: 'auto' }}>
        <button onClick={() => onCopyLink(job)} style={{ ...iconBtn, flex: 1 }} title="Copy share link"><Link2 size={12} /></button>
        <button onClick={() => onTogglePause(job)} style={iconBtn} title={status === 'live' ? 'Pause' : 'Resume'}>{status === 'live' ? <Pause size={12} /> : <Play size={12} />}</button>
        <button onClick={() => onDelete(job)} style={{ ...iconBtn, color: 'var(--red)' }} title="Delete"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. ROLE DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════
function RoleDetailView({ job, onBack, onCopyLink, recruiter, showToast }) {
  const [apps, setApps]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [huntSortActive, setHuntSortActive] = useState(false);
  const [huntSortView, setHuntSortView]     = useState('grid');

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
      const labels = { shortlisted: 'Shortlisted ✓', interview: 'Moved to interview', hired: 'Hired!', rejected: 'Passed' };
      showToast(labels[status] || 'Updated');
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  };

  const huntSortedApps = useMemo(() =>
    [...apps].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 6),
    [apps]
  );

  const filtered = statusFilter === 'all' ? apps : apps.filter(a => (a.status || 'pending') === statusFilter);
  const counts   = apps.reduce((acc, a) => { const s = a.status || 'pending'; acc[s] = (acc[s] || 0) + 1; acc.all = (acc.all || 0) + 1; return acc; }, {});
  const avgScore = apps.length ? Math.round(apps.reduce((s, a) => s + (a.match_score || 0), 0) / apps.length) : 0;

  return (
    <div>
      <button onClick={onBack} style={{ ...btnGhost(), marginBottom: 20, padding: '7px 14px', fontSize: 10 }}><ArrowLeft size={11} /> All roles</button>

      <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', padding: 22, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 36 }}>{job.logo || '🚀'}</span>
            <div>
              <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 26, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{job.role}</h2>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{job.company} · {job.location} · {job.stipend}</p>
            </div>
          </div>
          <button onClick={() => onCopyLink(job)} style={btnGhost()}><Link2 size={11} /> Share</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Applicants',   val: apps.length },
            { label: 'Avg score',    val: `${avgScore}%` },
            { label: 'Shortlisted',  val: counts.shortlisted || 0 },
            { label: 'Interviewing', val: counts.interview   || 0 },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-subtle)', border: '1.5px solid var(--border)', padding: '14px 16px' }}>
              <p style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, fontWeight: 700 }}>{s.label}</p>
              <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 26, color: 'var(--text)', margin: 0, lineHeight: 1, fontWeight: 400 }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HUNT Sort */}
      <div style={{ background: 'var(--bg-card)', border: '2px solid var(--green)', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: huntSortActive ? 20 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: 'var(--green-tint)', border: '1.5px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={14} style={{ color: 'var(--green)' }} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>HUNT Sort</p>
              <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '1px 0 0' }}>Top 6 ranked by match + HUNT score</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {huntSortActive && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setHuntSortView('grid')} style={{ ...iconBtn, background: huntSortView === 'grid' ? 'var(--text)' : 'transparent', borderColor: 'var(--border)', color: huntSortView === 'grid' ? 'var(--bg)' : 'var(--text-dim)' }}><LayoutGrid size={12} /></button>
                <button onClick={() => setHuntSortView('list')} style={{ ...iconBtn, background: huntSortView === 'list' ? 'var(--text)' : 'transparent', borderColor: 'var(--border)', color: huntSortView === 'list' ? 'var(--bg)' : 'var(--text-dim)' }}><List size={12} /></button>
              </div>
            )}
            <button
              onClick={() => setHuntSortActive(h => !h)}
              style={{
                padding: '8px 16px', fontSize: 10, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', borderRadius: 0,
                background: huntSortActive ? 'var(--green)' : 'var(--green-tint)',
                color: huntSortActive ? '#fff' : 'var(--green)',
                border: `2px solid var(--green)`,
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}
            >
              <Sparkles size={11} style={{ display: 'inline', marginRight: 6 }} />
              {huntSortActive ? 'Hide' : 'Run HUNT Sort'}
            </button>
          </div>
        </div>

        {huntSortActive && (
          apps.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 12, padding: '24px 0' }}>No applicants yet.</p>
          ) : huntSortView === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {huntSortedApps.map((app, i) => (
                <ApplicantSnapshotCard key={app.id} app={app} rank={i + 1} isGridView={true}
                  onStatusChange={async (id, status, note) => { await handleStatusChange(id, status, note); }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {huntSortedApps.map((app, i) => (
                <ApplicantSnapshotCard key={app.id} app={app} rank={i + 1} isGridView={false}
                  onStatusChange={async (id, status, note) => { await handleStatusChange(id, status, note); }} />
              ))}
            </div>
          )
        )}
      </div>

      {/* All applicants */}
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0 }}>All applicants</p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[
            { id: 'all',         label: `All (${counts.all || 0})` },
            { id: 'pending',     label: `Pending (${counts.pending || 0})` },
            { id: 'shortlisted', label: `Shortlisted (${counts.shortlisted || 0})` },
            { id: 'interview',   label: `Interview (${counts.interview || 0})` },
            { id: 'hired',       label: `Hired (${counts.hired || 0})` },
            { id: 'rejected',    label: `Passed (${counts.rejected || 0})` },
          ].map(t => (
            <button key={t.id} onClick={() => setStatusFilter(t.id)} style={{
              padding: '5px 10px', fontSize: 9, fontFamily: 'inherit', cursor: 'pointer',
              background: statusFilter === t.id ? 'var(--text)' : 'transparent',
              border: `1.5px solid ${statusFilter === t.id ? 'var(--text)' : 'var(--border)'}`,
              color: statusFilter === t.id ? 'var(--bg)' : 'var(--text-mid)',
              fontWeight: statusFilter === t.id ? 700 : 400,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 40, fontSize: 12 }}>Loading applicants…</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon="—" title="No applicants in this view." message="Try a different filter or share your role link." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 380px' : '1fr', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
  const s     = app.students || {};
  const score = app.match_score || 0;
  const huntScore = Math.min(100, Math.round(score * 0.7 + (s.profile_completeness || 70) * 0.3));
  return (
    <div onClick={onClick} className="hn-card" style={{
      background: 'var(--bg-card)',
      border: `${isSelected ? '2px' : '1.5px'} solid ${isSelected ? 'var(--text)' : 'var(--border)'}`,
      padding: '12px 16px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 10, color: 'var(--text-dim)', width: 22, flexShrink: 0, textAlign: 'center', fontFamily: 'Georgia, serif' }}>#{rank}</span>
      <Avatar name={s.full_name} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{s.full_name || 'Student'}</p>
        <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.college || '—'} · Year {s.year || '?'}</p>
      </div>
      <HuntScoreRing score={huntScore} size={36} />
      <ScoreNumber score={score} size={15} />
      <StatusPill status={app.status || 'pending'} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. HOME TAB — recent roles + 2 quick actions (NO top picks)
// ═══════════════════════════════════════════════════════════════════════════
function HomeTab({ recruiter, jobs, allApps, onPostRole, onOpenRole, onOpenPipeline }) {
  const liveJobs    = jobs.filter(j => (j.status || (j.is_active ? 'live' : 'paused')) === 'live');
  const totalApps   = allApps.length;
  const shortlisted = allApps.filter(a => a.status === 'shortlisted').length;
  const hired       = allApps.filter(a => a.status === 'hired').length;
  const recentJobs  = [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  const firstName   = recruiter.contact_name?.split(' ')[0] || 'there';
  const startupName = recruiter.startups?.name || recruiter.company_name || 'your startup';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32, borderBottom: '2px solid var(--border)', paddingBottom: 24 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Home</p>
        <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 36, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.15 }}>
          Welcome back, <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{firstName}.</em>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 10, lineHeight: 1.6 }}>
          {liveJobs.length} live role{liveJobs.length !== 1 ? 's' : ''}. {totalApps} applicants total.
        </p>
      </div>

      {/* Stats — brutalist grid with thick borders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginBottom: 40, border: '2px solid var(--border)' }}>
        {[
          { label: 'Active Roles',  val: String(liveJobs.length).padStart(2,'0'),   sub: '+1 this week' },
          { label: 'Total Applicants', val: String(totalApps).padStart(2,'0'),       sub: '+12 this week' },
          { label: 'Shortlisted',   val: String(shortlisted).padStart(2,'0'),        sub: `${Math.max(0, shortlisted - hired)} awaiting reply` },
          { label: 'Hires Made',    val: String(hired).padStart(2,'0'),              sub: 'all-time' },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: '20px 22px', borderRight: i < 3 ? '2px solid var(--border)' : 'none', background: 'var(--bg-card)' }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 10px' }}>{s.label}</p>
            <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 40, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1, fontWeight: 400 }}>{s.val}</p>
            <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column: Recent Roles + Quick Actions/Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>

        {/* LEFT: Recent Roles */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Recent Roles</p>
            <button onClick={onPostRole} style={{ ...btnPrimary(false), padding: '6px 12px', fontSize: 9 }}>
              <Plus size={11} /> Post a role
            </button>
          </div>

          {recentJobs.length === 0 ? (
            <EmptyState icon="—" title="No roles posted yet." message="Post your first role to start receiving matched candidates."
              cta={<button onClick={onPostRole} style={{ ...btnPrimary(false), margin: '0 auto' }}><Plus size={12} /> Post a role</button>} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '2px solid var(--border)' }}>
              {recentJobs.map((job, idx) => {
                const filled = (job.current_applicants || 0) / (job.max_applicants || 50);
                const status = job.status || (job.is_active ? 'live' : 'paused');
                const isLive = status === 'live';
                const jobApps = allApps.filter(a => a.job_id === job.id);
                return (
                  <div key={job.id} onClick={() => onOpenRole(job)} className="hn-card" style={{
                    padding: '16px 18px', cursor: 'pointer', background: 'var(--bg-card)',
                    borderBottom: idx < recentJobs.length - 1 ? '1.5px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{job.logo || '🚀'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 14, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{job.role}</p>
                        <span style={{ fontSize: 8, padding: '1px 6px', fontWeight: 700, color: isLive ? 'var(--green)' : 'var(--amber)', border: `1.5px solid ${isLive ? 'var(--green)' : 'var(--amber)'}`, textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>{isLive ? '● Live' : '⏸ Paused'}</span>
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{job.stipend} · {job.location}</p>
                      <div style={{ height: 2, background: 'var(--bg-hover)', overflow: 'hidden', maxWidth: 200 }}>
                        <div style={{ height: '100%', width: `${Math.min(filled, 1) * 100}%`, background: filled > 0.8 ? 'var(--red)' : filled > 0.5 ? 'var(--amber)' : 'var(--text)' }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: 'var(--text)', margin: 0, lineHeight: 1, fontWeight: 400 }}>{jobApps.length}</p>
                      <p style={{ fontSize: 8, color: 'var(--text-dim)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>applicants</p>
                    </div>
                    <ChevronRight size={13} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Quick Actions + Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick Actions — 2 big brutalist buttons */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 12px' }}>Quick Actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={onPostRole} style={{
                width: '100%', padding: '16px 20px',
                background: 'var(--text)', color: 'var(--bg)',
                border: '2px solid var(--text)', borderRadius: 0,
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Plus size={14} /> Post a new role
                </span>
                <ChevronRight size={14} />
              </button>
              <button onClick={onOpenPipeline} style={{
                width: '100%', padding: '16px 20px',
                background: 'transparent', color: 'var(--text)',
                border: '2px solid var(--border)', borderRadius: 0,
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <GitBranch size={14} /> Review pipeline
                </span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 12px' }}>Recent Activity</p>
            <div style={{ border: '2px solid var(--border)', background: 'var(--bg-card)' }}>
              {allApps.slice(0, 5).map((app, i) => {
                const s = app.students || {};
                return (
                  <div key={app.id} style={{ padding: '12px 14px', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 4, height: 4, background: 'var(--text-dim)', flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>
                        <strong>{s.full_name || 'Someone'}</strong> applied to <strong>{app.jobs?.role || 'a role'}</strong>
                      </p>
                      <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>just now</p>
                    </div>
                  </div>
                );
              })}
              {allApps.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 11 }}>No activity yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. ROLES TAB
// ═══════════════════════════════════════════════════════════════════════════
function RolesTab({ jobs, onCopyLink, onTogglePause, onDelete, onPostRole, recruiter, showToast, initialOpenJob }) {
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

  if (openJob) return <RoleDetailView job={openJob} onBack={() => setOpenJob(null)} onCopyLink={onCopyLink} recruiter={recruiter} showToast={showToast} />;

  return (
    <div>
      <PageHeader eyebrow="Roles" title={<>Manage your <em>roles.</em></>} action={<button onClick={onPostRole} style={{ ...btnPrimary(false), padding: '10px 16px' }}><Plus size={12} /> Post a role</button>} />
      <SubTabStrip tabs={SUBTABS} active={subTab} onChange={setSubTab} />
      {grouped[subTab].length === 0 ? (
        <EmptyState icon="—" title={`No ${subTab} roles.`} message={subTab === 'live' ? 'Post your first role to start receiving matched candidates.' : `Roles you ${subTab === 'paused' ? 'pause' : 'close'} will appear here.`}
          cta={subTab === 'live' && <button onClick={onPostRole} style={{ ...btnPrimary(false), margin: '0 auto' }}><Plus size={12} /> Post a role</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {grouped[subTab].map(job => <RoleCard key={job.id} job={job} onClick={() => setOpenJob(job)} onTogglePause={onTogglePause} onCopyLink={onCopyLink} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. HIRING TAB
// ═══════════════════════════════════════════════════════════════════════════
function HiringTab({ allApps, onStatusChange }) {
  return (
    <div>
      <PageHeader eyebrow="Pipeline" title={<>Hiring <em>pipeline.</em></>} subtitle="Track candidates through your hiring process." />
      <PipelineView allApps={allApps} onStatusChange={onStatusChange} />
    </div>
  );
}

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
            <div key={stage.id} style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', padding: 14, minHeight: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1.5px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon size={13} style={{ color: stage.color }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stage.label}</span>
                </div>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 400, color: stage.color }}>{candidates.length}</span>
              </div>
              {candidates.length === 0 ? (
                <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', padding: '32px 0' }}>No candidates yet.</p>
              ) : candidates.map(app => {
                const s = app.students || {};
                const score = app.match_score || 0;
                const huntScore = Math.min(100, Math.round(score * 0.7 + (s.profile_completeness || 70) * 0.3));
                return (
                  <div key={app.id} onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)} className="hn-card" style={{ padding: '10px 12px', border: `1.5px solid ${selectedApp?.id === app.id ? 'var(--text)' : 'var(--border)'}`, background: 'var(--bg-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar name={s.full_name} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name || 'Student'}</p>
                      <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{app.jobs?.role}</p>
                    </div>
                    <HuntScoreRing score={huntScore} size={30} />
                  </div>
                );
              })}
            </div>
          );
        })}
        {selectedApp && (
          <ApplicantSnapshot app={selectedApp}
            onStatusChange={async (id, status, note) => { await onStatusChange(id, status, note); setSelectedApp(s => ({ ...s, status, recruiter_message: note || s.recruiter_message })); }}
            onClose={() => setSelectedApp(null)} compact />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. PROFILE TAB
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
      {subTab === 'startup'   && <StartupProfileForm   startup={startup} canEdit={isFounder} onUpdate={onUpdate} showToast={showToast} />}
      {subTab === 'recruiter' && <RecruiterProfileForm recruiter={recruiter}                  onUpdate={onUpdate} showToast={showToast} />}
    </div>
  );
}

function StartupProfileForm({ startup, canEdit, onUpdate, showToast }) {
  const [form, setForm] = useState({ name: startup.name || '', logo_emoji: startup.logo_emoji || '🚀', tagline: startup.tagline || '', about: startup.about || '', website: startup.website || '', industry: startup.industry || '', stage: startup.stage || '', team_size: startup.team_size || '', founded_year: startup.founded_year || '', hq_location: startup.hq_location || '' });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const save = async () => {
    if (!startup.id) { showToast('No startup linked.', 'error'); return; }
    setSaving(true);
    try { await updateStartupProfile(startup.id, form); showToast('Startup profile updated'); onUpdate(); }
    catch (e) { showToast(e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };
  return (
    <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', padding: 24 }}>
      {!canEdit && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--amber-tint)', border: '1.5px solid var(--amber)', marginBottom: 18 }}><Lock size={12} style={{ color: 'var(--amber)' }} /><p style={{ fontSize: 11, color: 'var(--amber)', margin: 0 }}>Read-only — only founders can edit the startup profile.</p></div>}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 22 }}>
        <div><Label>Logo</Label><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, width: 152 }}>{LOGO_EMOJIS.slice(0, 8).map(e => <button key={e} disabled={!canEdit} onClick={() => set('logo_emoji')(e)} style={{ width: 34, height: 34, fontSize: 17, cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.5, border: `2px solid ${form.logo_emoji === e ? 'var(--text)' : 'var(--border)'}`, background: 'var(--bg-subtle)', borderRadius: 0 }}>{e}</button>)}</div></div>
        <div style={{ flex: 1 }}><Label required>Startup name</Label><FocusInput value={form.name} disabled={!canEdit} onChange={e => set('name')(e.target.value)} placeholder="HUNT Labs" /><div style={{ height: 12 }} /><Label>Tagline</Label><FocusInput value={form.tagline} disabled={!canEdit} onChange={e => set('tagline')(e.target.value)} placeholder="Skill-first internships" /></div>
      </div>
      <Label>About</Label><FocusTextarea value={form.about} disabled={!canEdit} onChange={e => set('about')(e.target.value)} rows={4} placeholder="What does your startup do?" />
      <div style={{ height: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><Label>Website</Label><FocusInput value={form.website} disabled={!canEdit} onChange={e => set('website')(e.target.value)} placeholder="https://…" /></div>
        <div><Label>HQ location</Label><FocusInput value={form.hq_location} disabled={!canEdit} onChange={e => set('hq_location')(e.target.value)} placeholder="Bangalore, India" /></div>
        <div><Label>Industry</Label><FocusInput value={form.industry} disabled={!canEdit} onChange={e => set('industry')(e.target.value)} placeholder="HR Tech / EdTech / SaaS" /></div>
        <div><Label>Stage</Label><FocusSelect value={form.stage} disabled={!canEdit} onChange={e => set('stage')(e.target.value)}><option value="">—</option><option>Pre-seed</option><option>Seed</option><option>Series A</option><option>Series B</option><option>Series C+</option><option>Bootstrapped</option></FocusSelect></div>
        <div><Label>Team size</Label><FocusSelect value={form.team_size} disabled={!canEdit} onChange={e => set('team_size')(e.target.value)}><option value="">—</option><option>1-10</option><option>11-50</option><option>51-200</option><option>200+</option></FocusSelect></div>
        <div><Label>Founded</Label><FocusInput type="number" value={form.founded_year} disabled={!canEdit} onChange={e => set('founded_year')(e.target.value)} placeholder="2024" /></div>
      </div>
      {canEdit && <div style={{ marginTop: 22 }}><button onClick={save} disabled={saving} style={btnPrimary(saving)}>{saving ? 'Saving…' : 'Save changes'}</button></div>}
    </div>
  );
}

function RecruiterProfileForm({ recruiter, onUpdate, showToast }) {
  const [form, setForm] = useState({ contact_name: recruiter.contact_name || '', email: recruiter.email || '', phone: recruiter.phone || '', title: recruiter.title || '', linkedin_url: recruiter.linkedin_url || '', bio: recruiter.bio || '', role_in_company: recruiter.role_in_company || 'recruiter' });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const save = async () => {
    setSaving(true);
    try { await updateRecruiterProfile(recruiter.id, form); showToast('Profile updated'); onUpdate(); }
    catch (e) { showToast(e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };
  return (
    <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}><Avatar name={form.contact_name} size={52} /><div><p style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{form.contact_name || 'Your name'}</p><p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{form.title || 'Your role'}</p></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><Label required>Full name</Label><FocusInput value={form.contact_name} onChange={e => set('contact_name')(e.target.value)} /></div>
        <div><Label>Title</Label><FocusInput value={form.title} onChange={e => set('title')(e.target.value)} placeholder="Head of Talent" /></div>
        <div><Label>Email</Label><FocusInput value={form.email} disabled type="email" /></div>
        <div><Label>Phone</Label><FocusInput value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="+91…" /></div>
        <div><Label>LinkedIn</Label><FocusInput value={form.linkedin_url} onChange={e => set('linkedin_url')(e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
        <div><Label>Role in company</Label><FocusSelect value={form.role_in_company} onChange={e => set('role_in_company')(e.target.value)}><option value="founder">Founder (full access)</option><option value="hiring_manager">Hiring manager</option><option value="recruiter">Recruiter</option></FocusSelect></div>
      </div>
      <div style={{ height: 16 }} /><Label>Bio</Label><FocusTextarea value={form.bio} onChange={e => set('bio')(e.target.value)} rows={3} placeholder="Short intro that candidates will see when you reach out." />
      <div style={{ marginTop: 22 }}><button onClick={save} disabled={saving} style={btnPrimary(saving)}>{saving ? 'Saving…' : 'Save changes'}</button></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 13. NETWORK TAB
// ═══════════════════════════════════════════════════════════════════════════
function NetworkTab() {
  return (
    <div>
      <PageHeader eyebrow="Network" title={<>Connect with <em>builders.</em></>} />
      <EmptyState icon="—" title="Coming soon." message="Connect with other startups, recruiters, and high-signal builders. Quality over quantity — like everything else on HUNT." />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 14. SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════════════════
function SettingsModal({ theme, setTheme, onClose, onSignOut }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', padding: 28, maxWidth: 460, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18, borderBottom: '1.5px solid var(--border)' }}>
          <div><p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Appearance</p><p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '3px 0 0' }}>Light or dark mode.</p></div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['light', 'dark'].map(t => <button key={t} onClick={() => setTheme(t)} style={{ padding: '8px 14px', fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: theme === t ? 'var(--text)' : 'transparent', border: `2px solid ${theme === t ? 'var(--text)' : 'var(--border)'}`, color: theme === t ? 'var(--bg)' : 'var(--text)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: 0 }}>{t === 'light' ? <><Sun size={11} /> Light</> : <><Moon size={11} /> Dark</>}</button>)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18 }}>
          <div><p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Sign out</p><p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '3px 0 0' }}>You'll need to log in again.</p></div>
          <button onClick={onSignOut} style={{ ...btnGhost(), color: 'var(--red)', borderColor: 'var(--red)' }}><LogOut size={11} /> Sign out</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 15. MAIN SHELL
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
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSettings, setShowSettings]       = useState(false);
  const [showPostDrawer, setShowPostDrawer]   = useState(false);
  const [pendingOpenRole, setPendingOpenRole] = useState(null);

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

  const handleOpenPipeline = () => {
    setActiveTab('hiring');
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

  const handleStatusChange = async (appId, status, note = '') => {
    const app = allApps.find(a => a.id === appId);
    try {
      await updateApplicationStatus(
        appId, status, app?.students?.id, note,
        { role: app?.jobs?.role, company: app?.jobs?.company || recruiter?.startups?.name },
      );
      setAllApps(a => a.map(x => x.id === appId ? { ...x, status, recruiter_message: note || x.recruiter_message } : x));
      const labels = { shortlisted: 'Shortlisted ✓', interview: 'Moved to interview', hired: 'Hired!', rejected: 'Passed' };
      showToast(labels[status] || 'Updated');
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  };

  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--text)', marginBottom: 20, textTransform: 'uppercase' }}>HUNT</div>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading…</p>
      </div>
    </div>
  );

  if (!recruiter) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: 'var(--text)', marginBottom: 8, fontWeight: 400 }}>Finish setting up your account</p>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>We couldn't find your recruiter profile. Please complete onboarding to continue.</p>
      </div>
    </div>
  );

  const initials = recruiter.contact_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, 'Helvetica Neue', sans-serif", display: 'flex', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @keyframes hunt-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        button:disabled { opacity: 0.45; }
        .hn-item:hover { background: var(--bg-hover) !important; }
        .hn-card:hover { border-color: var(--text) !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-mid); }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-dim); }
        input:disabled, textarea:disabled, select:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {showSettings && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} onSignOut={handleSignOut} />}

      {recruiter && (
        <PostRoleDrawer recruiter={recruiter} open={showPostDrawer} onClose={() => setShowPostDrawer(false)} showToast={showToast}
          onSuccess={async () => { await refreshAll(); showToast('Role posted'); setActiveTab('roles'); }} />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside style={{ width: 200, flexShrink: 0, height: '100vh', position: 'sticky', top: 0, borderRight: '2px solid var(--border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '2px solid var(--border)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--text)', textTransform: 'uppercase' }}>HUNT</span>
        </div>

        <nav style={{ padding: '12px 10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Post CTA */}
          <button
            onClick={() => setShowPostDrawer(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9, width: '100%',
              padding: '10px 12px', border: '2px solid var(--text)', cursor: 'pointer',
              marginBottom: 10, background: 'var(--text)', color: 'var(--bg)',
              fontSize: 10, fontWeight: 700, textAlign: 'left', fontFamily: 'inherit',
              textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 0,
            }}
          >
            <Plus size={13} style={{ flexShrink: 0 }} /> Post a role
          </button>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 10px' }} />

          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} className="hn-item" onClick={() => { setActiveTab(id); if (id !== 'roles') setPendingOpenRole(null); }} style={{
                display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                padding: '9px 12px', border: 'none', cursor: 'pointer', marginBottom: 1,
                background: active ? 'var(--bg-hover)' : 'transparent',
                borderLeft: `3px solid ${active ? 'var(--text)' : 'transparent'}`,
                color: active ? 'var(--text)' : 'var(--text-dim)',
                fontSize: 11, fontWeight: active ? 700 : 400, textAlign: 'left',
                fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.08em',
                borderRadius: 0,
              }}>
                <Icon size={13} style={{ flexShrink: 0 }} />{label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '10px 10px', borderTop: '2px solid var(--border)', position: 'relative' }}>
          <div style={{ padding: '8px 10px', background: 'var(--bg-subtle)', marginBottom: 8, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Company</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{recruiter.startups?.name || recruiter.company_name || 'Your startup'}</p>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            <button className="hn-item" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 7, color: 'var(--text-dim)' }}><Bell size={12} /></button>
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="hn-item" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 7, color: 'var(--text-dim)' }}>{theme === 'light' ? <Moon size={12} /> : <Sun size={12} />}</button>
          </div>
          <div onClick={() => setShowAccountMenu(p => !p)} className="hn-item" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', cursor: 'pointer' }}>
            <div style={{ width: 26, height: 26, flexShrink: 0, background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--bg)', letterSpacing: '0.05em' }}>{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{recruiter.contact_name}</p>
              <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: 0, textTransform: 'capitalize' }}>{recruiter.role_in_company || 'Recruiter'}</p>
            </div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" style={{ flexShrink: 0, transform: showAccountMenu ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {showAccountMenu && (
            <div style={{ margin: '4px 0 0', background: 'var(--bg-card)', border: '2px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Signed in as</p>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{recruiter.email || recruiter.contact_name}</p>
              </div>
              {[
                { label: 'Profile',  action: () => { setActiveTab('profile');  setShowAccountMenu(false); } },
                { label: 'Settings', action: () => { setShowSettings(true);    setShowAccountMenu(false); } },
                { label: 'Support',  action: () => { window.open('mailto:support@hunt.so'); setShowAccountMenu(false); } },
              ].map(item => (
                <button key={item.label} onClick={item.action} className="hn-item" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 10, color: 'var(--text-mid)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{item.label}</button>
              ))}
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={handleSignOut} className="hn-item" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 10, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Sign out</button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', maxHeight: '100vh' }}>
        <div style={{ padding: '36px 44px 80px', maxWidth: 1320, margin: '0 auto', animation: 'hunt-fade-in 0.25s ease' }}>
          {activeTab === 'home'    && <HomeTab recruiter={recruiter} jobs={jobs} allApps={allApps} onPostRole={() => setShowPostDrawer(true)} onOpenRole={handleOpenRole} onOpenPipeline={handleOpenPipeline} />}
          {activeTab === 'roles'   && <RolesTab jobs={jobs} onCopyLink={handleCopyLink} onTogglePause={handleTogglePause} onDelete={handleDelete} onPostRole={() => setShowPostDrawer(true)} recruiter={recruiter} showToast={showToast} initialOpenJob={pendingOpenRole} />}
          {activeTab === 'hiring'  && <HiringTab allApps={allApps} onStatusChange={handleStatusChange} />}
          {activeTab === 'profile' && <ProfileTab recruiter={recruiter} onUpdate={refreshRecruiter} showToast={showToast} />}
          {activeTab === 'network' && <NetworkTab />}
        </div>
      </main>
    </div>
  );
}
