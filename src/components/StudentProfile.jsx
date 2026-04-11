// src/components/StudentProfile.jsx
// Drop this file into src/components/
// Add route in App.jsx: <Route path="/profile" element={user ? <StudentProfile /> : <Navigate to="/" />} />

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Edit3, Check, X, Plus, Github, Linkedin, Globe,
  Briefcase, Code, User, Rocket, Sun, Moon, LogOut, Upload,
  ChevronRight, Zap, AlertCircle, ExternalLink, Trash2, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStudentProfile, updateStudentProfile, uploadResume, signOut } from '../services/supabase';

// ─── Design tokens (mirrors the rest of HUNT) ────────────────────────────────
const tokens = {
  light: {
    '--bg':          '#FAFAF8',
    '--bg-card':     '#FFFFFF',
    '--bg-subtle':   '#F5F5F2',
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
    '--focus':       '#1A7A4A',
  },
  dark: {
    '--bg':          '#0A0A0A',
    '--bg-card':     '#111110',
    '--bg-subtle':   '#1A1A18',
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
    '--focus':       '#2EAD6A',
  }
};

function applyTokens(theme) {
  Object.entries(tokens[theme]).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v)
  );
}

// ─── Skill options (same as onboarding) ──────────────────────────────────────
const SKILL_OPTIONS = [
  { name: 'JavaScript', category: 'Language' }, { name: 'Python', category: 'Language' },
  { name: 'Java', category: 'Language' }, { name: 'TypeScript', category: 'Language' },
  { name: 'C / C++', category: 'Language' }, { name: 'Golang', category: 'Language' },
  { name: 'SQL', category: 'Language' }, { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' }, { name: 'React Native', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' }, { name: 'Flutter', category: 'Mobile' },
  { name: 'Node.js', category: 'Backend' }, { name: 'Express.js', category: 'Backend' },
  { name: 'Django', category: 'Backend' }, { name: 'FastAPI', category: 'Backend' },
  { name: 'REST API', category: 'Backend' }, { name: 'GraphQL', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' }, { name: 'MongoDB', category: 'Database' },
  { name: 'MySQL', category: 'Database' }, { name: 'Redis', category: 'Database' },
  { name: 'Firebase', category: 'Database' }, { name: 'Machine Learning', category: 'Data Science' },
  { name: 'TensorFlow', category: 'Data Science' }, { name: 'PyTorch', category: 'Data Science' },
  { name: 'Pandas', category: 'Data Science' }, { name: 'Docker', category: 'DevOps' },
  { name: 'AWS', category: 'DevOps' }, { name: 'CI/CD', category: 'DevOps' },
  { name: 'Linux', category: 'DevOps' }, { name: 'Git', category: 'Tools' },
  { name: 'Figma', category: 'Design' },
];

const SKILL_CATEGORIES = [...new Set(SKILL_OPTIONS.map(s => s.category))];
const LEVEL_LABELS = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

const ROLE_OPTIONS = [
  'Full Stack Developer', 'Backend Developer', 'Frontend Developer',
  'Mobile Developer', 'DevOps Engineer', 'Data Analyst',
  'ML Engineer', 'UI/UX Designer', 'Security / Pen Tester',
  'Embedded Systems Engineer', 'QA / Testing Engineer'
];

// ─── Shared input style ───────────────────────────────────────────────────────
const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-subtle)',
  color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
};

// ─── Completeness calculator (mirrors supabase.js) ───────────────────────────
function calcCompleteness(p) {
  let s = 0;
  if (p.full_name) s += 10; if (p.college) s += 10;
  if (p.phone)     s += 5;  if (p.email)   s += 5;
  const skills = p.skills || [];
  if (skills.length >= 5) s += 25;
  else if (skills.length >= 3) s += 15;
  else if (skills.length >= 1) s += 10;
  const projects = p.projects || [];
  if (projects.length >= 3) s += 20;
  else if (projects.length >= 2) s += 15;
  else if (projects.length >= 1) s += 10;
  if ((p.preferred_roles || []).length > 0) s += 10;
  if (p.github_url)   s += 5;
  if (p.linkedin_url) s += 5;
  if (p.resume_url)   s += 5;
  return Math.min(s, 100);
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, label, editing, onEdit, onSave, onCancel, saving, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden', marginBottom: 16,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-subtle)',
      }}>
        <div>
          {label && <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 2 }}>{label}</p>}
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{title}</h3>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {editing ? (
            <>
              <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                <X size={12} /> Cancel
              </button>
              <button onClick={onSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
                <Save size={12} /> {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-mid)'; }}>
              <Edit3 size={12} /> Edit
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function StudentProfile() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Per-section edit state
  const [editing, setEditing] = useState({});   // { basics: true, skills: false, … }
  const [saving, setSaving]   = useState({});
  const [draft, setDraft]     = useState({});    // local draft while editing

  // Skill picker state
  const [activeCategory, setActiveCategory] = useState(SKILL_CATEGORIES[0]);

  // New project form
  const [newProject, setNewProject] = useState({ title: '', description: '', techStack: '', projectUrl: '', githubUrl: '' });
  const [addingProject, setAddingProject] = useState(false);

  // Resume upload
  const [uploadingResume, setUploadingResume] = useState(false);
  const resumeRef = useRef(null);

  useEffect(() => { applyTokens(theme); localStorage.setItem('hunt-theme', theme); }, [theme]);

  useEffect(() => {
    (async () => {
      try {
        const p = await getStudentProfile();
        if (!p) { navigate('/onboarding'); return; }
        setProfile(p);
      } catch (e) {
        showToast('Failed to load profile', 'error');
      } finally { setLoading(false); }
    })();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Start editing a section — clone current data into draft
  const startEdit = (section) => {
    setDraft(d => ({ ...d, [section]: JSON.parse(JSON.stringify(profile)) }));
    setEditing(e => ({ ...e, [section]: true }));
  };

  const cancelEdit = (section) => {
    setEditing(e => ({ ...e, [section]: false }));
    setDraft(d => ({ ...d, [section]: null }));
  };

  // Save a section — persist to Supabase
  const saveSection = async (section, updates) => {
    setSaving(s => ({ ...s, [section]: true }));
    try {
      const updated = await updateStudentProfile({ ...updates, profile_completeness: calcCompleteness({ ...profile, ...updates }) });
      setProfile(updated);
      setEditing(e => ({ ...e, [section]: false }));
      showToast('Saved!');
    } catch (e) {
      showToast('Save failed: ' + e.message, 'error');
    } finally {
      setSaving(s => ({ ...s, [section]: false }));
    }
  };

  // Draft field helpers
  const setField = (section, field, value) =>
    setDraft(d => ({ ...d, [section]: { ...d[section], [field]: value } }));

  // ── Resume upload ────────────────────────────────────────────────────────
  const handleResumeUpload = async (file) => {
    if (!file) return;
    setUploadingResume(true);
    try {
      const url = await uploadResume(file);
      const updated = await updateStudentProfile({ resume_url: url, profile_completeness: calcCompleteness({ ...profile, resume_url: url }) });
      setProfile(updated);
      showToast('Resume uploaded!');
    } catch (e) {
      showToast('Upload failed: ' + e.message, 'error');
    } finally { setUploadingResume(false); }
  };

  // ── Skills helpers ────────────────────────────────────────────────────────
  const addSkill = (skillName, category) => {
    const skills = draft.skills?.skills || [];
    if (skills.find(s => s.name === skillName)) return;
    setDraft(d => ({
      ...d,
      skills: { ...d.skills, skills: [...skills, { id: Date.now(), name: skillName, level: 3, category }] }
    }));
  };

  const removeSkill = (id) => {
    setDraft(d => ({
      ...d,
      skills: { ...d.skills, skills: (d.skills?.skills || []).filter(s => s.id !== id) }
    }));
  };

  const updateLevel = (id, level) => {
    setDraft(d => ({
      ...d,
      skills: { ...d.skills, skills: (d.skills?.skills || []).map(s => s.id === id ? { ...s, level } : s) }
    }));
  };

  // ── Projects helpers ──────────────────────────────────────────────────────
  const addProject = () => {
    if (!newProject.title || !newProject.techStack) return;
    const existing = draft.projects?.projects || [];
    setDraft(d => ({
      ...d,
      projects: {
        ...d.projects,
        projects: [...existing, {
          ...newProject,
          techStack: newProject.techStack.split(',').map(t => t.trim()),
          id: Date.now()
        }]
      }
    }));
    setNewProject({ title: '', description: '', techStack: '', projectUrl: '', githubUrl: '' });
    setAddingProject(false);
  };

  const removeProject = (id) => {
    setDraft(d => ({
      ...d,
      projects: { ...d.projects, projects: (d.projects?.projects || []).filter(p => p.id !== id) }
    }));
  };

  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); }
    catch (e) { console.error(e); }
  };

  // ────────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: 'var(--text)' }}>Loading your profile…</p>
      </div>
    </div>
  );

  if (!profile) return null;

  const completeness = calcCompleteness(profile);
  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';
  const complColor = completeness >= 80 ? 'var(--green)' : completeness >= 50 ? 'var(--amber)' : 'var(--red)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 500,
          background: toast.type === 'error' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)',
          color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'fadeDown 0.2s ease', pointerEvents: 'none',
        }}>{toast.msg}</div>
      )}

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg)', backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/swipe')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-mid)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
            <ArrowLeft size={13} /> Back
          </button>
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: '0.12em' }}>HUNT</span>
          <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Profile</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Completeness pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, border: `1px solid ${complColor}40`, background: `${complColor}12`, fontSize: 11, fontWeight: 500, color: complColor }}>
            <Zap size={11} /> {completeness}% complete
          </div>
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          </button>
          <button onClick={handleSignOut} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Sign out">
            <LogOut size={13} />
          </button>
        </div>
      </nav>

      {/* Main layout */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ position: 'sticky', top: 80 }}>

          {/* Avatar card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 20px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-tint)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, color: 'var(--green-text)', margin: '0 auto 12px', letterSpacing: '0.02em' }}>
              {initials}
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 400, color: 'var(--text)', marginBottom: 4, lineHeight: 1.2 }}>{profile.full_name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 2 }}>{profile.college}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 16 }}>Year {profile.year}</div>

            {/* Social links */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-mid)', padding: '4px 8px', borderRadius: 20, border: '1px solid var(--border)', textDecoration: 'none', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-mid)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <Github size={11} /> GitHub
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-mid)', padding: '4px 8px', borderRadius: 20, border: '1px solid var(--border)', textDecoration: 'none', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-mid)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <Linkedin size={11} /> LinkedIn
                </a>
              )}
              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-mid)', padding: '4px 8px', borderRadius: 20, border: '1px solid var(--border)', textDecoration: 'none', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-mid)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <Globe size={11} /> Portfolio
                </a>
              )}
            </div>
          </div>

          {/* Completeness breakdown */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>Profile strength</div>

            {/* Big number */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 400, color: complColor, lineHeight: 1 }}>{completeness}</span>
              <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>%</span>
            </div>

            <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ height: '100%', width: `${completeness}%`, background: complColor, borderRadius: 2, transition: 'width 0.5s ease' }} />
            </div>

            {[
              { label: 'Basic info',   done: !!(profile.full_name && profile.college) },
              { label: 'Phone & email', done: !!(profile.phone && profile.email) },
              { label: '3+ skills',    done: (profile.skills || []).length >= 3 },
              { label: '1+ project',   done: (profile.projects || []).length >= 1 },
              { label: 'Preferred roles', done: (profile.preferred_roles || []).length > 0 },
              { label: 'GitHub link',  done: !!profile.github_url },
              { label: 'Resume PDF',   done: !!profile.resume_url },
            ].map(({ label, done }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: done ? 'var(--green-tint)' : 'var(--bg-subtle)', border: `1px solid ${done ? 'var(--green)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done && <Check size={8} color='var(--green-text)' strokeWidth={3} />}
                </div>
                <span style={{ fontSize: 11, color: done ? 'var(--text-mid)' : 'var(--text-dim)' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Resume */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Resume</div>
            {profile.resume_url ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--green-text)', textDecoration: 'none' }}>
                  <ExternalLink size={11} /> View current resume
                </a>
                <button onClick={() => resumeRef.current?.click()} disabled={uploadingResume} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                  <Upload size={11} /> {uploadingResume ? 'Uploading…' : 'Replace'}
                </button>
              </div>
            ) : (
              <button onClick={() => resumeRef.current?.click()} disabled={uploadingResume} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px dashed var(--border-mid)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-dim)'; e.currentTarget.style.color = 'var(--text-mid)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-dim)'; }}>
                <Upload size={13} /> {uploadingResume ? 'Uploading…' : 'Upload PDF'}
              </button>
            )}
            <input ref={resumeRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleResumeUpload(e.target.files[0])} />
          </div>
        </div>

        {/* ── RIGHT MAIN CONTENT ── */}
        <div>

          {/* ── BASICS SECTION ── */}
          <Section
            title="Basic Info" label="01 — Personal"
            editing={editing.basics} saving={saving.basics}
            onEdit={() => startEdit('basics')}
            onCancel={() => cancelEdit('basics')}
            onSave={() => saveSection('basics', {
              full_name: draft.basics?.full_name,
              college:   draft.basics?.college,
              year:      draft.basics?.year,
              phone:     draft.basics?.phone,
              email:     draft.basics?.email,
            })}
          >
            {editing.basics ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { f: 'full_name', label: 'Full Name', placeholder: 'Priya Sharma' },
                  { f: 'college',   label: 'College',   placeholder: 'VJTI Mumbai' },
                  { f: 'phone',     label: 'Phone',     placeholder: '+91 98765 43210', type: 'tel' },
                  { f: 'email',     label: 'Email',     placeholder: 'you@email.com', type: 'email' },
                ].map(({ f, label, placeholder, type }) => (
                  <div key={f}>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>{label}</p>
                    <input type={type || 'text'} style={inp} value={draft.basics?.[f] || ''} placeholder={placeholder}
                      onChange={e => setField('basics', f, e.target.value)}
                      onFocus={e => e.target.style.borderColor = 'var(--focus)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                ))}
                <div>
                  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>Year</p>
                  <select style={{ ...inp }} value={draft.basics?.year || 3} onChange={e => setField('basics', 'year', parseInt(e.target.value))}>
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}{['st', 'nd', 'rd', 'th'][y - 1]} Year</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Full Name', val: profile.full_name },
                  { label: 'College',   val: profile.college },
                  { label: 'Year',      val: profile.year ? `${profile.year}${['st','nd','rd','th'][profile.year-1]} Year` : '—' },
                  { label: 'Phone',     val: profile.phone || '—' },
                  { label: 'Email',     val: profile.email || '—' },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 3 }}>{label}</p>
                    <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>{val}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ── SKILLS SECTION ── */}
          <Section
            title="Skills" label="02 — Technical"
            editing={editing.skills} saving={saving.skills}
            onEdit={() => startEdit('skills')}
            onCancel={() => cancelEdit('skills')}
            onSave={() => saveSection('skills', { skills: draft.skills?.skills || [] })}
          >
            {editing.skills ? (
              <div>
                {/* Category tabs */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {SKILL_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
                      background: activeCategory === cat ? 'var(--text)' : 'transparent',
                      color: activeCategory === cat ? 'var(--bg)' : 'var(--text-dim)',
                      border: `1px solid ${activeCategory === cat ? 'var(--text)' : 'var(--border)'}`,
                    }}>
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Skill pills for active category */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--border)' }}>
                  {SKILL_OPTIONS.filter(s => s.category === activeCategory).map(skill => {
                    const added = (draft.skills?.skills || []).some(s => s.name === skill.name);
                    return (
                      <button key={skill.name} onClick={() => addSkill(skill.name, skill.category)} style={{
                        padding: '5px 10px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: added ? 'default' : 'pointer', transition: 'all 0.15s',
                        background: added ? 'var(--green-tint)' : 'transparent',
                        color: added ? 'var(--green-text)' : 'var(--text-dim)',
                        border: `1px solid ${added ? 'var(--green)' : 'var(--border)'}`,
                      }}>
                        {skill.name}{added && ' ✓'}
                      </button>
                    );
                  })}
                </div>

                {/* Selected with levels */}
                {(draft.skills?.skills || []).length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(draft.skills.skills).map(skill => (
                      <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{skill.name}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[1,2,3,4,5].map(lv => (
                            <button key={lv} onClick={() => updateLevel(skill.id, lv)} style={{
                              width: 24, height: 24, borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 0.1s',
                              background: skill.level >= lv ? 'var(--green)' : 'var(--bg-card)',
                              color: skill.level >= lv ? '#fff' : 'var(--text-dim)',
                              outline: skill.level >= lv ? 'none' : '1px solid var(--border)',
                            }}>{lv}</button>
                          ))}
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-dim)', width: 72, textAlign: 'right' }}>{LEVEL_LABELS[skill.level]}</span>
                        <button onClick={() => removeSkill(skill.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {(profile.skills || []).length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>No skills added yet — edit to add some.</p>
                ) : (
                  <>
                    {/* Group by category */}
                    {SKILL_CATEGORIES.filter(cat => (profile.skills || []).some(s => s.category === cat)).map(cat => (
                      <div key={cat} style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>{cat}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {(profile.skills || []).filter(s => s.category === cat).map(skill => (
                            <div key={skill.id || skill.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green-text)', fontSize: 12 }}>
                              <span style={{ fontWeight: 500 }}>{skill.name}</span>
                              <span style={{ fontSize: 10, opacity: 0.7 }}>L{skill.level}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </Section>

          {/* ── PROJECTS SECTION ── */}
          <Section
            title="Projects" label="03 — Work"
            editing={editing.projects} saving={saving.projects}
            onEdit={() => startEdit('projects')}
            onCancel={() => { cancelEdit('projects'); setAddingProject(false); setNewProject({ title: '', description: '', techStack: '', projectUrl: '', githubUrl: '' }); }}
            onSave={() => saveSection('projects', { projects: draft.projects?.projects || [] })}
          >
            {editing.projects ? (
              <div>
                {/* Existing projects */}
                {(draft.projects?.projects || []).map((p, i) => (
                  <div key={p.id || i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{p.title || p.name}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(Array.isArray(p.techStack) ? p.techStack : [p.techStack]).map((t, j) => (
                          <span key={j} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeProject(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0 0 0 8px', flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {/* Add project form */}
                {addingProject ? (
                  <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '14px', background: 'var(--bg-subtle)', marginTop: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>Title *</p>
                        <input style={inp} value={newProject.title} placeholder="E-commerce Dashboard" onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--focus)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                      </div>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>Tech stack *</p>
                        <input style={inp} value={newProject.techStack} placeholder="React, Node.js, PostgreSQL" onChange={e => setNewProject(p => ({ ...p, techStack: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--focus)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>Description</p>
                      <textarea style={{ ...inp, resize: 'none' }} rows={2} value={newProject.description} placeholder="What does this do?" onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--focus)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>Live URL</p>
                        <input style={inp} type="url" value={newProject.projectUrl} placeholder="https://" onChange={e => setNewProject(p => ({ ...p, projectUrl: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--focus)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                      </div>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>GitHub URL</p>
                        <input style={inp} type="url" value={newProject.githubUrl} placeholder="https://github.com/…" onChange={e => setNewProject(p => ({ ...p, githubUrl: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--focus)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={addProject} style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Add project</button>
                      <button onClick={() => { setAddingProject(false); setNewProject({ title: '', description: '', techStack: '', projectUrl: '', githubUrl: '' }); }} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingProject(true)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px dashed var(--border-mid)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-dim)'; e.currentTarget.style.color = 'var(--text-mid)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-dim)'; }}>
                    <Plus size={13} /> Add project
                  </button>
                )}
              </div>
            ) : (
              <div>
                {(profile.projects || []).length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>No projects yet — edit to add some.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(profile.projects || []).map((p, i) => (
                      <div key={p.id || i} style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{p.title || p.name}</p>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {(p.githubUrl || p.github_url) && (
                              <a href={p.githubUrl || p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)', display: 'flex' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                                <Github size={13} />
                              </a>
                            )}
                            {(p.projectUrl || p.link) && (
                              <a href={p.projectUrl || p.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)', display: 'flex' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                        {p.description && <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>{p.description}</p>}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(Array.isArray(p.techStack) ? p.techStack : [p.techStack]).filter(Boolean).map((t, j) => (
                            <span key={j} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-mid)', background: 'var(--bg-card)' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* ── PREFERENCES SECTION ── */}
          <Section
            title="Preferences" label="04 — Availability"
            editing={editing.prefs} saving={saving.prefs}
            onEdit={() => startEdit('prefs')}
            onCancel={() => cancelEdit('prefs')}
            onSave={() => saveSection('prefs', {
              preferred_roles:  draft.prefs?.preferred_roles,
              availability:     draft.prefs?.availability,
              work_preference:  draft.prefs?.work_preference,
            })}
          >
            {editing.prefs ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Preferred roles</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {ROLE_OPTIONS.map(role => {
                      const selected = (draft.prefs?.preferred_roles || []).includes(role);
                      return (
                        <button key={role} onClick={() => {
                          const curr = draft.prefs?.preferred_roles || [];
                          setField('prefs', 'preferred_roles', selected ? curr.filter(r => r !== role) : [...curr, role]);
                        }} style={{
                          padding: '8px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                          background: selected ? 'var(--green-tint)' : 'transparent',
                          border: `1px solid ${selected ? 'var(--green)' : 'var(--border)'}`,
                          color: selected ? 'var(--green-text)' : 'var(--text-mid)',
                          fontWeight: selected ? 500 : 400,
                        }}>
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>Availability</p>
                    <select style={inp} value={draft.prefs?.availability || 'Immediate'} onChange={e => setField('prefs', 'availability', e.target.value)}>
                      <option>Immediate</option>
                      <option>After exams</option>
                      <option>Next semester</option>
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>Work preference</p>
                    <select style={inp} value={draft.prefs?.work_preference || 'remote'} onChange={e => setField('prefs', 'work_preference', e.target.value)}>
                      <option value="remote">Remote</option>
                      <option value="onsite">On-site</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="any">Any</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Preferred roles</p>
                  {(profile.preferred_roles || []).length === 0 ? (
                    <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>None set</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(profile.preferred_roles || []).map(r => (
                        <span key={r} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-mid)' }}>{r}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 3 }}>Availability</p>
                    <p style={{ fontSize: 13, color: 'var(--text)' }}>{profile.availability || '—'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 3 }}>Work preference</p>
                    <p style={{ fontSize: 13, color: 'var(--text)', textTransform: 'capitalize' }}>{profile.work_preference || '—'}</p>
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* ── LINKS SECTION ── */}
          <Section
            title="Links" label="05 — Online presence"
            editing={editing.links} saving={saving.links}
            onEdit={() => startEdit('links')}
            onCancel={() => cancelEdit('links')}
            onSave={() => saveSection('links', {
              github_url:    draft.links?.github_url,
              linkedin_url:  draft.links?.linkedin_url,
              portfolio_url: draft.links?.portfolio_url,
            })}
          >
            {editing.links ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { f: 'github_url',    icon: <Github size={13} />,   label: 'GitHub URL',    placeholder: 'https://github.com/yourname' },
                  { f: 'linkedin_url',  icon: <Linkedin size={13} />, label: 'LinkedIn URL',  placeholder: 'https://linkedin.com/in/yourname' },
                  { f: 'portfolio_url', icon: <Globe size={13} />,    label: 'Portfolio URL', placeholder: 'https://yoursite.com' },
                ].map(({ f, icon, label, placeholder }) => (
                  <div key={f}>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>{label}</p>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>{icon}</div>
                      <input style={{ ...inp, paddingLeft: 32 }} type="url" value={draft.links?.[f] || ''} placeholder={placeholder}
                        onChange={e => setField('links', f, e.target.value)}
                        onFocus={e => e.target.style.borderColor = 'var(--focus)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: <Github size={13} />,   label: 'GitHub',    val: profile.github_url },
                  { icon: <Linkedin size={13} />, label: 'LinkedIn',  val: profile.linkedin_url },
                  { icon: <Globe size={13} />,    label: 'Portfolio', val: profile.portfolio_url },
                ].map(({ icon, label, val }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--text-dim)' }}>{icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-dim)', width: 56 }}>{label}</span>
                    {val ? (
                      <a href={val} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--green-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                        {val.replace('https://', '').slice(0, 40)}{val.length > 45 ? '…' : ''}
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Not set</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Incomplete profile nudge */}
          {completeness < 80 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 8, background: 'var(--amber-tint)', border: '1px solid var(--amber)', marginTop: 4 }}>
              <AlertCircle size={14} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--amber)', marginBottom: 2 }}>Your match scores are lower with an incomplete profile</p>
                <p style={{ fontSize: 11, color: 'var(--amber)', opacity: 0.75 }}>Complete all sections above to maximise your chances with recruiters.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
