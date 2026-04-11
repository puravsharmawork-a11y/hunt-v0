// src/components/RecruiterDashboard.jsx
//
// SETUP:
// 1. Drop into src/components/RecruiterDashboard.jsx
// 2. Add to App.jsx imports:
//      import RecruiterDashboard from './components/RecruiterDashboard';
// 3. Add route inside <Routes> in App.jsx:
//      <Route path="/recruiter/dashboard" element={user ? <RecruiterDashboard /> : <Navigate to="/" />} />
//
// SUPABASE — make sure you have run:
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

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, LogOut, Sun, Moon, Copy, Check, X, ChevronRight,
  Briefcase, MapPin, Clock, Users, Eye, EyeOff, Link2,
  ArrowLeft, Zap, TrendingUp, CheckCircle2, AlertCircle,
  ExternalLink, Github, Star, Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOut } from '../services/supabase';

// ─── Design tokens ────────────────────────────────────────────────────────────
const tokens = {
  light: {
    '--bg':           '#FAFAF8', '--bg-card':    '#FFFFFF',
    '--bg-subtle':    '#F5F5F2', '--border':     '#EBEBEA',
    '--border-mid':   '#D6D6D3', '--text':       '#0A0A0A',
    '--text-mid':     '#5A5A56', '--text-dim':   '#9B9B97',
    '--ember':        '#D85A30', '--ember-tint': 'rgba(216,90,48,0.08)',
    '--ember-border': 'rgba(216,90,48,0.3)',
    '--green':        '#1A7A4A', '--green-tint': '#E8F5EE',
    '--green-text':   '#1A7A4A', '--red':        '#C0392B',
    '--red-tint':     '#FDECEA', '--blue':       '#2563EB',
    '--blue-tint':    'rgba(37,99,235,0.08)',
  },
  dark: {
    '--bg':           '#0C0B09', '--bg-card':    '#131210',
    '--bg-subtle':    '#1A1916', '--border':     'rgba(255,255,255,0.08)',
    '--border-mid':   'rgba(255,255,255,0.14)', '--text': '#FAFAF8',
    '--text-mid':     'rgba(255,255,255,0.55)', '--text-dim': 'rgba(255,255,255,0.28)',
    '--ember':        '#E8714A', '--ember-tint': 'rgba(216,90,48,0.12)',
    '--ember-border': 'rgba(216,90,48,0.35)',
    '--green':        '#2EAD6A', '--green-tint': '#0D2B1A',
    '--green-text':   '#2EAD6A', '--red':        '#E05C4B',
    '--red-tint':     '#2B1210', '--blue':       '#60A5FA',
    '--blue-tint':    'rgba(96,165,250,0.1)',
  }
};

function applyTokens(theme) {
  Object.entries(tokens[theme]).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v)
  );
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function getRecruiterProfile() {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('recruiters').select('*').eq('auth_id', user.id).single();
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
  const { data, error } = await supabase
    .from('jobs').insert([jobData]).select().single();
  if (error) throw error;
  return data;
}

async function toggleJobVisibility(jobId, isActive) {
  const { data, error } = await supabase
    .from('jobs').update({ is_active: isActive }).eq('id', jobId).select().single();
  if (error) throw error;
  return data;
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

async function updateApplicationStatus(appId, status) {
  const { data, error } = await supabase
    .from('applications').update({ status }).eq('id', appId).select().single();
  if (error) throw error;
  return data;
}

// ─── Skill options for post form ──────────────────────────────────────────────
const SKILL_OPTIONS = [
  'JavaScript','Python','Java','TypeScript','React','Next.js','Node.js',
  'Express.js','Django','FastAPI','Flask','REST API','GraphQL',
  'PostgreSQL','MongoDB','MySQL','Redis','Firebase',
  'Machine Learning','TensorFlow','PyTorch','Pandas',
  'Docker','AWS','CI/CD','Linux','Git','Figma','React Native','Flutter',
  'SQL','TypeScript','C / C++','Golang',
];

const LOGO_EMOJIS = ['🚀','⚡','🎯','💡','🔥','🌊','🛠️','📊','🎨','🌱','⭐','🦾'];

// ─── Shared input style ───────────────────────────────────────────────────────
const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-subtle)',
  color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
};

function FocusInput({ style, ...props }) {
  return (
    <input {...props}
      style={{ ...inp, ...style }}
      onFocus={e => e.target.style.borderColor = 'var(--ember)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  );
}
function FocusSelect({ style, children, ...props }) {
  return (
    <select {...props}
      style={{ ...inp, ...style }}
      onFocus={e => e.target.style.borderColor = 'var(--ember)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    >
      {children}
    </select>
  );
}
function FocusTextarea({ style, ...props }) {
  return (
    <textarea {...props}
      style={{ ...inp, resize: 'none', ...style }}
      onFocus={e => e.target.style.borderColor = 'var(--ember)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────
function Label({ children, required }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
      {children}{required && <span style={{ color: 'var(--ember)', marginLeft: 3 }}>*</span>}
    </p>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 500,
      background: type === 'error' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)',
      color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      animation: 'fadeDown 0.2s ease', pointerEvents: 'none',
    }}>{msg}</div>
  );
}

// ─── Post Internship Form ─────────────────────────────────────────────────────
function PostInternshipForm({ recruiter, onSuccess, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [niceInput, setNiceInput] = useState('');

  const [form, setForm] = useState({
    logo: recruiter.logo_emoji || '🚀',
    role: '',
    description: '',
    stipend: '',
    duration: '',
    location: '',
    type: 'Paid Internship',
    visibility: 'public',
    required_skills: [],   // [{ name, weight, level }]
    nice_to_have: [],
    max_applicants: 50,
  });

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

  // Auto-distribute weights evenly
  const updateSkillWeight = (name, weight) => {
    setForm(f => ({ ...f, required_skills: f.required_skills.map(s => s.name === name ? { ...s, weight: parseFloat(weight) } : s) }));
  };

  const handleSubmit = async () => {
    if (!form.role.trim()) { setError('Role title is required.'); return; }
    if (!form.stipend.trim()) { setError('Stipend is required.'); return; }
    if (!form.duration.trim()) { setError('Duration is required.'); return; }
    if (!form.location.trim()) { setError('Location is required.'); return; }
    if (form.required_skills.length === 0) { setError('Add at least one required skill.'); return; }

    setSaving(true); setError('');
    try {
      // Normalise weights to sum to 1
      const totalW = form.required_skills.reduce((s, sk) => s + sk.weight, 0);
      const normSkills = form.required_skills.map(sk => ({ ...sk, weight: parseFloat((sk.weight / totalW).toFixed(3)) }));

      const slug = `${recruiter.company_name.toLowerCase().replace(/\s+/g, '-')}-${form.role.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      await createJob({
        recruiter_id:      recruiter.id,
        company:           recruiter.company_name,
        logo:              form.logo,
        role:              form.role.trim(),
        description:       form.description.trim(),
        stipend:           form.stipend.trim(),
        duration:          form.duration.trim(),
        location:          form.location.trim(),
        type:              form.type,
        visibility:        form.visibility,
        share_slug:        slug,
        required_skills:   normSkills,
        nice_to_have:      form.nice_to_have,
        max_applicants:    form.max_applicants,
        current_applicants: 0,
        is_active:         true,
      });
      onSuccess();
    } catch (e) {
      setError('Failed to post: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 2 }}>New role</p>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Post an internship</h3>
        </div>
        <button onClick={onCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Logo + Role */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flexShrink: 0 }}>
            <Label>Logo</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxWidth: 200 }}>
              {LOGO_EMOJIS.map(e => (
                <button key={e} onClick={() => set('logo')(e)} style={{ width: 34, height: 34, borderRadius: 6, fontSize: 17, border: `1.5px solid ${form.logo === e ? 'var(--ember)' : 'var(--border)'}`, background: form.logo === e ? 'var(--ember-tint)' : 'var(--bg-subtle)', cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <Label required>Role title</Label>
            <FocusInput value={form.role} onChange={e => set('role')(e.target.value)} placeholder="Backend Engineering Intern" />
          </div>
        </div>

        {/* Quick details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Label required>Stipend</Label>
            <FocusInput value={form.stipend} onChange={e => set('stipend')(e.target.value)} placeholder="₹25,000/month" />
          </div>
          <div>
            <Label required>Duration</Label>
            <FocusInput value={form.duration} onChange={e => set('duration')(e.target.value)} placeholder="3 months / 6 months" />
          </div>
          <div>
            <Label required>Location</Label>
            <FocusInput value={form.location} onChange={e => set('location')(e.target.value)} placeholder="Remote / Mumbai" />
          </div>
          <div>
            <Label>Type</Label>
            <FocusSelect value={form.type} onChange={e => set('type')(e.target.value)}>
              <option>Paid Internship</option>
              <option>Unpaid Internship</option>
              <option>Contract</option>
              <option>Part-time</option>
            </FocusSelect>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <FocusTextarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3} placeholder="What will the intern actually work on? Be specific — 2-3 sentences is enough." />
        </div>

        {/* Required skills */}
        <div>
          <Label required>Required skills</Label>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>Type a skill and press Enter or click Add. Set level (1–5) for each.</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FocusInput
                value={skillInput} onChange={e => setSkillInput(e.target.value)}
                placeholder="e.g. React, Node.js, Python…"
                onKeyDown={e => e.key === 'Enter' && addSkill()}
                list="skill-suggestions"
              />
              <datalist id="skill-suggestions">
                {SKILL_OPTIONS.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <button onClick={addSkill} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: 'var(--ember)', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Add
            </button>
          </div>
          {form.required_skills.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {form.required_skills.map(skill => (
                <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{skill.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Level</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1,2,3,4,5].map(lv => (
                      <button key={lv} onClick={() => setForm(f => ({ ...f, required_skills: f.required_skills.map(s => s.name === skill.name ? { ...s, level: lv } : s) }))} style={{ width: 22, height: 22, borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: skill.level >= lv ? 'var(--ember)' : 'var(--bg-card)', color: skill.level >= lv ? '#fff' : 'var(--text-dim)', outline: skill.level >= lv ? 'none' : '1px solid var(--border)' }}>{lv}</button>
                    ))}
                  </div>
                  <button onClick={() => removeSkill(skill.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nice to have */}
        <div>
          <Label>Nice to have (optional)</Label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <FocusInput value={niceInput} onChange={e => setNiceInput(e.target.value)} placeholder="e.g. Docker, AWS…" onKeyDown={e => e.key === 'Enter' && addNice()} list="skill-suggestions" style={{ flex: 1 }} />
            <button onClick={addNice} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Add</button>
          </div>
          {form.nice_to_have.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {form.nice_to_have.map(s => (
                <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', borderRadius: 20, border: '1px solid var(--border)', color: 'var(--text-mid)' }}>
                  {s}
                  <button onClick={() => setForm(f => ({ ...f, nice_to_have: f.nice_to_have.filter(x => x !== s) }))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Visibility + max applicants */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Label>Visibility</Label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['public', 'private'].map(v => (
                <button key={v} onClick={() => set('visibility')(v)} style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', background: form.visibility === v ? 'var(--ember-tint)' : 'var(--bg-subtle)', border: `1px solid ${form.visibility === v ? 'var(--ember)' : 'var(--border)'}`, color: form.visibility === v ? 'var(--ember)' : 'var(--text-mid)', fontWeight: form.visibility === v ? 500 : 400 }}>
                  {v === 'public' ? '🌐 Public' : '🔗 Private'}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 5 }}>
              {form.visibility === 'public' ? 'Visible in the swipe feed to all students.' : 'Only accessible via your share link.'}
            </p>
          </div>
          <div>
            <Label>Max applicants</Label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[10, 25, 50, 100].map(n => (
                <button key={n} onClick={() => set('max_applicants')(n)} style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', background: form.max_applicants === n ? 'var(--ember-tint)' : 'var(--bg-subtle)', border: `1px solid ${form.max_applicants === n ? 'var(--ember)' : 'var(--border)'}`, color: form.max_applicants === n ? 'var(--ember)' : 'var(--text-mid)', fontWeight: form.max_applicants === n ? 500 : 400 }}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)' }}>
            <AlertCircle size={13} color="#c0392b" />
            <p style={{ fontSize: 12, color: '#c0392b', margin: 0 }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 8, border: 'none', background: saving ? 'var(--text-dim)' : 'var(--ember)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Posting…' : 'Post internship →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Applicant detail panel ───────────────────────────────────────────────────
function ApplicantPanel({ app, onStatusChange, onClose }) {
  const s = app.students || {};
  const skills = s.skills || [];
  const projects = s.projects || [];
  const initials = s.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
  const score = app.match_score || 0;
  const breakdown = app.match_breakdown || {};
  const scoreColor = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--ember)' : 'var(--red)';

  const STATUS_OPTIONS = [
    { key: 'pending',     label: 'Pending',    color: 'var(--text-dim)' },
    { key: 'shortlisted', label: 'Shortlist',  color: 'var(--green)' },
    { key: 'interview',   label: 'Interview',  color: 'var(--blue)' },
    { key: 'rejected',    label: 'Pass',       color: 'var(--red)' },
  ];

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Candidate profile</p>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}><X size={16} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--ember-tint)', border: '1.5px solid var(--ember-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: 'var(--ember)', flexShrink: 0 }}>{initials}</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{s.full_name || 'Student'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>{s.college || '—'} · Year {s.year || '?'}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: scoreColor, lineHeight: 1, margin: 0 }}>{score}%</p>
            <p style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>match</p>
          </div>
        </div>

        {/* Score breakdown */}
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

        {/* Skills */}
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

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 7 }}>Projects</p>
            {projects.slice(0, 2).map((p, i) => (
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

        {/* Links */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {s.github_url && <a href={s.github_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-mid)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', textDecoration: 'none' }}><Github size={11} /> GitHub</a>}
          {s.linkedin_url && <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-mid)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', textDecoration: 'none' }}><ExternalLink size={11} /> LinkedIn</a>}
          {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-mid)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', textDecoration: 'none' }}><ExternalLink size={11} /> Portfolio</a>}
          {s.resume_url && <a href={s.resume_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ember)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--ember-border)', textDecoration: 'none' }}>📄 Resume</a>}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {STATUS_OPTIONS.filter(s => s.key !== 'pending').map(opt => (
            <button key={opt.key} onClick={() => onStatusChange(app.id, opt.key)}
              style={{ padding: '9px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', border: `1px solid ${app.status === opt.key ? opt.color : 'var(--border)'}`, background: app.status === opt.key ? opt.color : 'transparent', color: app.status === opt.key ? '#fff' : opt.color }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Job card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onViewApplicants, onToggleActive, onCopyLink, isSelected }) {
  const filled = (job.current_applicants || 0) / (job.max_applicants || 50);
  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${isSelected ? 'var(--ember)' : 'var(--border)'}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}
      onClick={() => onViewApplicants(job)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>{job.logo || '🚀'}</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{job.role}</p>
            <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{job.stipend} · {job.duration}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flex: 'column', alignItems: 'flex-end', gap: 4 }}>
          {/* Visibility badge */}
          <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, fontWeight: 500, background: job.visibility === 'private' ? 'var(--blue-tint)' : 'var(--green-tint)', color: job.visibility === 'private' ? 'var(--blue)' : 'var(--green-text)', border: `1px solid ${job.visibility === 'private' ? 'rgba(37,99,235,0.2)' : 'rgba(26,122,74,0.2)'}` }}>
            {job.visibility === 'private' ? '🔗 Private' : '🌐 Public'}
          </span>
        </div>
      </div>

      {/* Applicant bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Applicants</span>
          <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text)' }}>{job.current_applicants || 0}/{job.max_applicants || 50}</span>
        </div>
        <div style={{ height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${filled * 100}%`, background: filled > 0.8 ? 'var(--red)' : filled > 0.5 ? 'var(--ember)' : 'var(--green)', borderRadius: 2, transition: 'width 0.4s' }} />
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
        <button onClick={() => onViewApplicants(job)} style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Users size={11} /> View applicants
        </button>
        <button onClick={() => onCopyLink(job)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }} title="Copy share link">
          <Link2 size={11} />
        </button>
        <button onClick={() => onToggleActive(job)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: job.is_active ? 'var(--green-text)' : 'var(--text-dim)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }} title={job.is_active ? 'Pause listing' : 'Activate listing'}>
          {job.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [loading, setLoading] = useState(true);
  const [recruiter, setRecruiter] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('jobs'); // 'jobs' | 'applicants'

  useEffect(() => { applyTokens(theme); localStorage.setItem('hunt-theme', theme); }, [theme]);

  useEffect(() => {
    (async () => {
      try {
        const r = await getRecruiterProfile();
        if (!r) { navigate('/recruiter/onboarding'); return; }
        setRecruiter(r);
        const j = await getRecruiterJobs(r.id);
        setJobs(j);
      } catch (e) {
        showToast('Failed to load dashboard', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setView('applicants');
    setSelectedApp(null);
    setLoadingApps(true);
    try {
      const apps = await getJobApplications(job.id);
      setApplications(apps);
    } catch (e) {
      showToast('Failed to load applicants', 'error');
    } finally {
      setLoadingApps(false);
    }
  };

  const handleToggleActive = async (job) => {
    try {
      const updated = await toggleJobVisibility(job.id, !job.is_active);
      setJobs(j => j.map(x => x.id === job.id ? { ...x, is_active: updated.is_active } : x));
      showToast(updated.is_active ? 'Listing activated' : 'Listing paused');
    } catch (e) {
      showToast('Failed to update', 'error');
    }
  };

  const handleCopyLink = (job) => {
    const url = `${window.location.origin}/apply/${job.share_slug}`;
    navigator.clipboard.writeText(url).then(() => showToast('Share link copied!'));
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      setApplications(a => a.map(x => x.id === appId ? { ...x, status } : x));
      if (selectedApp?.id === appId) setSelectedApp(a => ({ ...a, status }));
      const labels = { shortlisted: 'Shortlisted!', interview: 'Interview request sent!', rejected: 'Passed.' };
      showToast(labels[status] || 'Updated');
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  const handlePostSuccess = async () => {
    setShowPostForm(false);
    showToast('Internship posted!');
    const j = await getRecruiterJobs(recruiter.id);
    setJobs(j);
  };

  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); }
    catch (e) { console.error(e); }
  };

  // Stats
  const totalApplicants = jobs.reduce((s, j) => s + (j.current_applicants || 0), 0);
  const activeJobs = jobs.filter(j => j.is_active).length;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: 'var(--text)' }}>Loading dashboard…</p>
      </div>
    </div>
  );

  const initials = recruiter?.contact_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'R';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: '0.12em' }}>HUNT</span>
          <span style={{ width: 1, height: 16, background: 'var(--border)', display: 'inline-block' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ember)', fontWeight: 500 }}>Recruiter</span>
          {recruiter && (
            <>
              <span style={{ width: 1, height: 16, background: 'var(--border)', display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: 'var(--text-mid)' }}>{recruiter.company_name}</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => { setShowPostForm(true); setView('jobs'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--ember)', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Plus size={13} /> Post role
          </button>
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          </button>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ember-tint)', border: '1.5px solid var(--ember-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--ember)' }}>{initials}</div>
          <button onClick={handleSignOut} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Sign out">
            <LogOut size={13} />
          </button>
        </div>
      </nav>

      {/* ── Main layout ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Active roles', val: activeJobs, color: 'var(--green)' },
            { label: 'Total applicants', val: totalApplicants, color: 'var(--ember)' },
            { label: 'Total roles posted', val: jobs.length, color: 'var(--text)' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px' }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>{label}</p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 28, color, margin: 0, lineHeight: 1 }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Post form (inline, not modal) */}
        {showPostForm && (
          <div style={{ marginBottom: 20 }}>
            <PostInternshipForm
              recruiter={recruiter}
              onSuccess={handlePostSuccess}
              onCancel={() => setShowPostForm(false)}
            />
          </div>
        )}

        {/* Main grid: job list + applicants panel */}
        <div style={{ display: 'grid', gridTemplateColumns: view === 'applicants' ? '300px 1fr' : '1fr', gap: 16 }}>

          {/* ── Job list ── */}
          <div>
            {/* Back button when viewing applicants */}
            {view === 'applicants' && (
              <button onClick={() => setView('jobs')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12, transition: 'all 0.15s' }}>
                <ArrowLeft size={12} /> All roles
              </button>
            )}

            {jobs.length === 0 && !showPostForm ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>No roles yet.</p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 20 }}>Post your first internship to start getting matched candidates.</p>
                <button onClick={() => setShowPostForm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--ember)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Plus size={14} /> Post first role
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {jobs.map(job => (
                  <JobCard
                    key={job.id} job={job}
                    isSelected={selectedJob?.id === job.id}
                    onViewApplicants={handleViewApplicants}
                    onToggleActive={handleToggleActive}
                    onCopyLink={handleCopyLink}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Applicants panel ── */}
          {view === 'applicants' && selectedJob && (
            <div>
              {/* Header */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{selectedJob.role}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0 }}>{selectedJob.company} · {selectedJob.location}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 20, background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green-text)', fontWeight: 500 }}>
                      {applications.length} applicants
                    </span>
                    <button onClick={() => handleCopyLink(selectedJob)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Link2 size={11} /> Share link
                    </button>
                  </div>
                </div>
              </div>

              {loadingApps ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Loading applicants…</p>
                </div>
              ) : applications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>No applicants yet.</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>Share your role link to get applications in.</p>
                  <button onClick={() => handleCopyLink(selectedJob)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Link2 size={12} /> Copy share link
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 1fr' : '1fr', gap: 12 }}>
                  {/* Applicant list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {applications.map((app, i) => {
                      const s = app.students || {};
                      const score = app.match_score || 0;
                      const scoreColor = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--ember)' : 'var(--red)';
                      const initials = s.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
                      const statusStyle = {
                        shortlisted: { bg: 'var(--green-tint)', color: 'var(--green-text)', border: 'var(--green)' },
                        interview:   { bg: 'var(--blue-tint)', color: 'var(--blue)', border: 'var(--blue)' },
                        rejected:    { bg: 'var(--red-tint)', color: 'var(--red)', border: 'var(--red)' },
                        pending:     { bg: 'var(--bg-subtle)', color: 'var(--text-dim)', border: 'var(--border)' },
                      }[app.status || 'pending'];

                      return (
                        <div key={app.id} onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                          style={{ background: 'var(--bg-card)', border: `1px solid ${selectedApp?.id === app.id ? 'var(--ember)' : 'var(--border)'}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10 }}>
                          {/* Rank */}
                          <span style={{ fontSize: 10, color: 'var(--text-dim)', width: 16, flexShrink: 0, textAlign: 'center' }}>#{i + 1}</span>
                          {/* Avatar */}
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ember-tint)', border: '1px solid var(--ember-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'var(--ember)', flexShrink: 0 }}>{initials}</div>
                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{s.full_name || 'Student'}</p>
                            <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.college || '—'}</p>
                          </div>
                          {/* Score */}
                          <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: scoreColor, margin: 0, flexShrink: 0 }}>{score}%</p>
                          {/* Status */}
                          <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 8, background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
                            {app.status || 'pending'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected applicant detail */}
                  {selectedApp && (
                    <ApplicantPanel
                      app={selectedApp}
                      onStatusChange={handleStatusChange}
                      onClose={() => setSelectedApp(null)}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeDown {
          from { opacity:0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
