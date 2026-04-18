// src/components/StudentProfile.jsx
// ─── HUNT Student Profile ─────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Edit3, Check, X, Plus, Github, Linkedin, Globe,
  Briefcase, User, Rocket, Sun, Moon, LogOut, Upload,
  ChevronRight, Zap, AlertCircle, ExternalLink, Trash2, Save,
  Star, TrendingUp, TrendingDown, Minus, Camera, Image as ImageIcon,
  Quote, Heart, Target, BookOpen, Code, Award, MapPin, Phone,
  Mail, Calendar, GraduationCap, Building2, Link2, FileText,
  BarChart2, MessageSquare, Shield, Bell, Palette, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStudentProfile, updateStudentProfile, uploadResume, signOut } from '../services/supabase';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const tokens = {
  light: {
    '--bg': '#FAFAF8', '--bg-card': '#FFFFFF', '--bg-subtle': '#F5F5F2',
    '--border': '#EBEBEA', '--border-mid': '#D6D6D3', '--text': '#0A0A0A',
    '--text-mid': '#5A5A56', '--text-dim': '#9B9B97', '--green': '#1A7A4A',
    '--green-tint': '#E8F5EE', '--green-text': '#1A7A4A', '--red': '#C0392B',
    '--red-tint': '#FDECEA', '--amber': '#92600A', '--amber-tint': '#FDF3E3',
  },
  dark: {
    '--bg': '#0A0A0A', '--bg-card': '#111110', '--bg-subtle': '#1A1A18',
    '--border': '#2A2A28', '--border-mid': '#3A3A38', '--text': '#FAFAF8',
    '--text-mid': '#9B9B97', '--text-dim': '#5A5A56', '--green': '#2EAD6A',
    '--green-tint': '#0D2B1A', '--green-text': '#2EAD6A', '--red': '#E05C4B',
    '--red-tint': '#2B1210', '--amber': '#D4A84B', '--amber-tint': '#2B2010',
  }
};

function applyTokens(theme) {
  Object.entries(tokens[theme]).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
}

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

const DOMAIN_OPTIONS = [
  'Software Engineering', 'Data Science & AI', 'Product Management',
  'Design & UX', 'Marketing & Growth', 'Finance & Fintech',
  'Healthcare & Biotech', 'EdTech', 'SaaS / B2B', 'Consumer Tech'
];

const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-subtle)',
  color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
};

function calcCompleteness(p) {
  let s = 0;
  if (p.full_name) s += 10; if (p.college) s += 10;
  if (p.phone) s += 5; if (p.email) s += 5;
  const skills = p.skills || [];
  if (skills.length >= 5) s += 25; else if (skills.length >= 3) s += 15; else if (skills.length >= 1) s += 10;
  const projects = p.projects || [];
  if (projects.length >= 3) s += 20; else if (projects.length >= 2) s += 15; else if (projects.length >= 1) s += 10;
  if ((p.preferred_roles || []).length > 0) s += 10;
  if (p.github_url) s += 5; if (p.linkedin_url) s += 5; if (p.resume_url) s += 5;
  return Math.min(s, 100);
}

// ─── Mini toggle switch ────────────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{ width: 36, height: 20, borderRadius: 10, background: on ? 'var(--green)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
    </div>
  );
}

// ─── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ value, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={12} fill={i < value ? '#D97706' : 'none'} stroke={i < value ? '#D97706' : 'var(--border-mid)'} />
      ))}
    </div>
  );
}

// ─── Trajectory sparkline ──────────────────────────────────────────────────────
function TrajectoryChart({ data, color = '#1A7A4A' }) {
  const w = 280, h = 80;
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 10) - 5
  ]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="tgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#tgrad)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 5 : 3} fill={color} />)}
    </svg>
  );
}

// ─── Section block ─────────────────────────────────────────────────────────────
function Block({ title, children, action }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0 }}>{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function StudentProfile() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // Edit states per section
  const [editing, setEditing] = useState({});
  const [draft, setDraft] = useState({});

  // Skills
  const [activeSkillCat, setActiveSkillCat] = useState(SKILL_CATEGORIES[0]);

  // Projects
  const [newProject, setNewProject] = useState({ title: '', description: '', techStack: '', projectUrl: '', githubUrl: '' });
  const [addingProject, setAddingProject] = useState(false);

  // Education
  const [addingEdu, setAddingEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ school: '', degree: '', major: '', startYear: '', endYear: '', gpa: '' });

  // Work experience
  const [addingWork, setAddingWork] = useState(false);
  const [newWork, setNewWork] = useState({ company: '', role: '', startYear: '', endYear: '', city: '', description: '' });

  // Certifications, awards
  const [newCert, setNewCert] = useState('');
  const [newAward, setNewAward] = useState('');

  const resumeRef = useRef(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => { applyTokens(theme); localStorage.setItem('hunt-theme', theme); }, [theme]);

  useEffect(() => {
    (async () => {
      try {
        const p = await getStudentProfile();
        if (!p) { navigate('/onboarding'); return; }
        setProfile(p);
        setDraft(JSON.parse(JSON.stringify(p)));
      } catch (e) { showToast('Failed to load profile', 'error'); }
      finally { setLoading(false); }
    })();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2500);
  };

  const save = async (updates) => {
    setSaving(true);
    try {
      const merged = { ...profile, ...updates };
      const updated = await updateStudentProfile({ ...updates, profile_completeness: calcCompleteness(merged) });
      setProfile(updated);
      setDraft(JSON.parse(JSON.stringify(updated)));
      showToast('Saved!');
    } catch (e) { showToast('Save failed: ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    setUploadingResume(true);
    try {
      const { uploadResume: ur } = await import('../services/supabase');
      const url = await ur(file);
      await save({ resume_url: url });
    } catch (e) { showToast('Upload failed: ' + e.message, 'error'); }
    finally { setUploadingResume(false); }
  };

  const handleSignOut = async () => { try { await signOut(); navigate('/'); } catch (e) { console.error(e); } };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Loading profile…</p>
      </div>
    </div>
  );
  if (!profile) return null;

  const completeness = calcCompleteness(profile);
  const complColor = completeness >= 80 ? 'var(--green)' : completeness >= 50 ? 'var(--amber)' : 'var(--red)';
  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  const TABS = [
    { id: 'profile',     label: 'Profile',     icon: User },
    { id: 'resume',      label: 'Resume',       icon: FileText },
    { id: 'skills',      label: 'Skills',       icon: Code },
    { id: 'preferences', label: 'Preferences',  icon: Target },
    { id: 'reviews',     label: 'Reviews',      icon: BarChart2 },
    { id: 'my-hunt',     label: 'My Hunt',      icon: Heart },
    { id: 'account',     label: 'Account',      icon: Shield },
  ];

  // Mock trajectory data
  const trajectoryData = [42, 48, 55, 61, 68, 72, 79, 84, completeness];
  const mockReviews = [
    { company: 'TechFlow AI', rating: 5, comment: 'Excellent communication and delivered ahead of schedule.', date: 'Mar 2025', verified: true },
    { company: 'DataMinds', rating: 4, comment: 'Strong technical skills, good team player.', date: 'Jan 2025', verified: true },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeDown { from { opacity:0; transform:translateX(-50%) translateY(-6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: var(--green) !important; }
        .tab-btn:hover { color: var(--text) !important; }
        .action-btn:hover { border-color: var(--border-mid) !important; color: var(--text) !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: toast.type === 'error' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: 'fadeDown 0.2s ease', pointerEvents: 'none' }}>{toast.msg}</div>
      )}

      {/* Top nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', height: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/swipe')} className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            <ArrowLeft size={12} /> Back
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.14em' }}>HUNT</span>
          <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Profile</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, border: `1px solid ${complColor}50`, background: `${complColor}10`, fontSize: 11, fontWeight: 600, color: complColor }}>
            <Zap size={11} /> {completeness}%
          </div>
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          </button>
          <button onClick={handleSignOut} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <LogOut size={13} />
          </button>
        </div>
      </nav>

      {/* Tab bar */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', top: 52, zIndex: 90 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', display: 'flex', overflowX: 'auto' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} className="tab-btn" onClick={() => setActiveTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: activeTab === id ? 600 : 400,
              color: activeTab === id ? 'var(--text)' : 'var(--text-dim)',
              borderBottom: activeTab === id ? '2px solid var(--text)' : '2px solid transparent',
              marginBottom: '-1px', whiteSpace: 'nowrap', fontFamily: 'inherit',
            }}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* ══════════════════════════════════════════════════════
            TAB: PROFILE
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, alignItems: 'start' }}>
            {/* Left */}
            <div>
              {/* Banner + Avatar card */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                {/* Banner */}
                <div style={{ height: 100, background: profile.banner_color || 'linear-gradient(135deg, #1A7A4A, #0D4A2E)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {profile.banner_url
                    ? <img src={profile.banner_url} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    : <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 22, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>On a hunt.</p>
                  }
                  <label style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Camera size={12} color="white" />
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => showToast('Banner upload coming soon')} />
                  </label>
                </div>
                {/* Avatar */}
                <div style={{ padding: '0 20px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-tint)', border: '3px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--green)', marginTop: -28, position: 'relative' }}>
                      {profile.avatar_url ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
                      <label style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)' }}>
                        <Camera size={9} color="white" />
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => showToast('Avatar upload coming soon')} />
                      </label>
                    </div>
                  </div>
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 17, color: 'var(--text)', marginBottom: 2 }}>{profile.full_name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>{profile.college} · Year {profile.year}</p>
                  {profile.headline && <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.5 }}>{profile.headline}</p>}
                </div>
              </div>

              {/* Profile strength */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Profile Strength</p>
                  <span style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 22, color: complColor }}>{completeness}%</span>
                </div>
                <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: '100%', width: `${completeness}%`, background: complColor, borderRadius: 2, transition: 'width 0.5s' }} />
                </div>
                {[
                  { label: 'Basic info', done: !!(profile.full_name && profile.college) },
                  { label: '3+ skills', done: (profile.skills || []).length >= 3 },
                  { label: '1+ project', done: (profile.projects || []).length >= 1 },
                  { label: 'GitHub', done: !!profile.github_url },
                  { label: 'Resume PDF', done: !!profile.resume_url },
                  { label: 'Preferred roles', done: (profile.preferred_roles || []).length > 0 },
                ].map(({ label, done }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <div style={{ width: 13, height: 13, borderRadius: '50%', background: done ? 'var(--green-tint)' : 'var(--bg-subtle)', border: `1px solid ${done ? 'var(--green)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {done && <Check size={8} color='var(--green)' strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: 11, color: done ? 'var(--text-mid)' : 'var(--text-dim)' }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Links */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Links</p>
                {[
                  { icon: <Github size={12} />, label: 'GitHub', val: profile.github_url },
                  { icon: <Linkedin size={12} />, label: 'LinkedIn', val: profile.linkedin_url },
                  { icon: <Globe size={12} />, label: 'Portfolio', val: profile.portfolio_url },
                ].map(({ icon, label, val }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                    <span style={{ color: 'var(--text-dim)' }}>{icon}</span>
                    {val ? (
                      <a href={val} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--green-text)', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                        {val.replace('https://', '').slice(0, 32)}{val.length > 36 ? '…' : ''}
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Not set · <button onClick={() => setActiveTab('resume')} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: 11, padding: 0, fontFamily: 'inherit' }}>Add</button></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div>
              {/* Headline + bio editor */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Headline & Bio</p>
                  {!editing.bio ? (
                    <button className="action-btn" onClick={() => setEditing(e => ({ ...e, bio: true }))} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Edit3 size={11} /> Edit
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setEditing(e => ({ ...e, bio: false }))} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                      <button onClick={() => { save({ headline: draft.headline, bio: draft.bio }); setEditing(e => ({ ...e, bio: false })); }} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Save size={11} /> Save
                      </button>
                    </div>
                  )}
                </div>
                {editing.bio ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4 }}>HEADLINE — shown under your name</p>
                      <input style={inp} value={draft.headline || ''} placeholder="e.g. Full Stack Developer · Open to internships" onChange={e => setDraft(d => ({ ...d, headline: e.target.value }))} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4 }}>BIO</p>
                      <textarea style={{ ...inp, resize: 'none' }} rows={4} value={draft.bio || ''} placeholder="Tell recruiters about yourself in a few lines..." onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} />
                    </div>
                  </div>
                ) : (
                  <div>
                    {profile.headline
                      ? <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>{profile.headline}</p>
                      : <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>No headline yet</p>}
                    {profile.bio
                      ? <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6 }}>{profile.bio}</p>
                      : <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No bio yet — click Edit to add one</p>}
                  </div>
                )}
              </div>

              {/* Skills preview */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Skills</p>
                  <button className="action-btn" onClick={() => setActiveTab('skills')} style={{ fontSize: 11, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Manage <ChevronRight size={11} />
                  </button>
                </div>
                {(profile.skills || []).length === 0
                  ? <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No skills yet</p>
                  : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(profile.skills || []).slice(0, 12).map((s, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green-text)' }}>{s.name}</span>
                    ))}
                    {(profile.skills || []).length > 12 && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>+{profile.skills.length - 12} more</span>}
                  </div>}
              </div>

              {/* Projects preview */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Projects</p>
                  <button className="action-btn" onClick={() => setActiveTab('resume')} style={{ fontSize: 11, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Manage <ChevronRight size={11} />
                  </button>
                </div>
                {(profile.projects || []).length === 0
                  ? <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No projects yet</p>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(profile.projects || []).slice(0, 3).map((p, i) => (
                      <div key={i} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{p.title || p.name}</p>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {(Array.isArray(p.techStack) ? p.techStack : []).slice(0, 4).map((t, j) => (
                            <span key={j} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: RESUME
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'resume' && (
          <div style={{ maxWidth: 700 }}>

            {/* Resume upload */}
            <Block title="Resume PDF">
              {profile.resume_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, border: '1px solid var(--green)', background: 'var(--green-tint)' }}>
                  <FileText size={18} style={{ color: 'var(--green)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-text)', marginBottom: 2 }}>Resume uploaded</p>
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--green-text)', opacity: 0.7, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                      View <ExternalLink size={10} />
                    </a>
                  </div>
                  <label style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--green)', background: 'transparent', color: 'var(--green)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Upload size={11} /> {uploadingResume ? 'Uploading…' : 'Replace'}
                    <input ref={resumeRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleResumeUpload(e.target.files[0])} />
                  </label>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '32px', borderRadius: 10, border: '2px dashed var(--border-mid)', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-tint)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.background = 'transparent'; }}>
                  <Upload size={22} style={{ color: 'var(--text-dim)' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-mid)', margin: 0 }}>Drop your resume here, or <span style={{ color: 'var(--green)' }}>browse files</span></p>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>PDF up to 5MB</p>
                  <input ref={resumeRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleResumeUpload(e.target.files[0])} />
                </label>
              )}
            </Block>

            {/* Summary */}
            <Block title="Summary" action={
              <button className="action-btn" onClick={() => setEditing(e => ({ ...e, summary: !e.summary }))} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                {editing.summary ? <><X size={11} /> Cancel</> : <><Edit3 size={11} /> Edit</>}
              </button>
            }>
              {editing.summary ? (
                <div>
                  <textarea style={{ ...inp, resize: 'none' }} rows={4} value={draft.summary || ''} placeholder="Brief professional summary..." onChange={e => setDraft(d => ({ ...d, summary: e.target.value }))} />
                  <button onClick={() => { save({ summary: draft.summary }); setEditing(e => ({ ...e, summary: false })); }} style={{ marginTop: 8, padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: profile.summary ? 'var(--text-mid)' : 'var(--text-dim)', lineHeight: 1.6 }}>{profile.summary || 'No summary yet'}</p>
              )}
            </Block>

            {/* Education */}
            <Block title="Education" action={
              <button onClick={() => setAddingEdu(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Plus size={11} /> Add
              </button>
            }>
              {(profile.education || []).map((edu, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <GraduationCap size={14} style={{ color: 'var(--text-dim)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{edu.school}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-mid)', marginBottom: 1 }}>{edu.degree}{edu.major ? ` · ${edu.major}` : ''}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{edu.startYear}–{edu.endYear || 'Present'}{edu.gpa ? ` · GPA ${edu.gpa}` : ''}</p>
                  </div>
                  <button onClick={() => { const ed = (profile.education || []).filter((_, j) => j !== i); save({ education: ed }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {(profile.education || []).length === 0 && !addingEdu && <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No education added yet</p>}
              {addingEdu && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16, background: 'var(--bg-subtle)', marginTop: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    {[
                      { f: 'school', label: 'School *', ph: 'Ex Stanford University' },
                      { f: 'degree', label: 'Degree', ph: 'Ex Bachelor of Science' },
                      { f: 'major', label: 'Major', ph: 'Ex Computer Science' },
                      { f: 'gpa', label: 'GPA', ph: 'Ex 3.9' },
                      { f: 'startYear', label: 'Start Year', ph: '2021' },
                      { f: 'endYear', label: 'End Year', ph: '2025' },
                    ].map(({ f, label, ph }) => (
                      <div key={f}>
                        <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
                        <input style={inp} value={newEdu[f]} placeholder={ph} onChange={e => setNewEdu(d => ({ ...d, [f]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { if (!newEdu.school) return; const ed = [...(profile.education || []), newEdu]; save({ education: ed }); setNewEdu({ school: '', degree: '', major: '', startYear: '', endYear: '', gpa: '' }); setAddingEdu(false); }} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                    <button onClick={() => setAddingEdu(false)} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Block>

            {/* Work Experience */}
            <Block title="Work Experience" action={
              <button onClick={() => setAddingWork(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Plus size={11} /> Add
              </button>
            }>
              {(profile.work_experience || []).map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={14} style={{ color: 'var(--text-dim)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{w.role}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-mid)', marginBottom: 1 }}>{w.company}{w.city ? ` · ${w.city}` : ''}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{w.startYear}–{w.endYear || 'Present'}</p>
                    {w.description && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.5 }}>{w.description}</p>}
                  </div>
                  <button onClick={() => { const wk = (profile.work_experience || []).filter((_, j) => j !== i); save({ work_experience: wk }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {(profile.work_experience || []).length === 0 && !addingWork && <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No work experience added yet</p>}
              {addingWork && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16, background: 'var(--bg-subtle)', marginTop: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    {[
                      { f: 'company', label: 'Company *', ph: 'Ex Microsoft' },
                      { f: 'role', label: 'Role *', ph: 'Ex Software Engineer' },
                      { f: 'startYear', label: 'Start Year', ph: '2023' },
                      { f: 'endYear', label: 'End Year', ph: '2024 or leave blank' },
                      { f: 'city', label: 'City', ph: 'Ex Mumbai' },
                    ].map(({ f, label, ph }) => (
                      <div key={f}>
                        <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
                        <input style={inp} value={newWork[f]} placeholder={ph} onChange={e => setNewWork(d => ({ ...d, [f]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Description</p>
                    <textarea style={{ ...inp, resize: 'none' }} rows={2} value={newWork.description} placeholder="Brief description..." onChange={e => setNewWork(d => ({ ...d, description: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { if (!newWork.company || !newWork.role) return; const wk = [...(profile.work_experience || []), newWork]; save({ work_experience: wk }); setNewWork({ company: '', role: '', startYear: '', endYear: '', city: '', description: '' }); setAddingWork(false); }} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                    <button onClick={() => setAddingWork(false)} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Block>

            {/* Projects */}
            <Block title="Projects" action={
              <button onClick={() => setAddingProject(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Plus size={11} /> Add
              </button>
            }>
              {(profile.projects || []).map((p, i) => (
                <div key={i} style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.title || p.name}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {(p.githubUrl || p.github_url) && <a href={p.githubUrl || p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)', display: 'flex' }}><Github size={13} /></a>}
                      {(p.projectUrl || p.link) && <a href={p.projectUrl || p.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)', display: 'flex' }}><ExternalLink size={13} /></a>}
                      <button onClick={() => { const pr = (profile.projects || []).filter((_, j) => j !== i); save({ projects: pr }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {p.description && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, lineHeight: 1.5 }}>{p.description}</p>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(Array.isArray(p.techStack) ? p.techStack : []).map((t, j) => (
                      <span key={j} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-mid)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
              {(profile.projects || []).length === 0 && !addingProject && <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No projects yet</p>}
              {addingProject && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16, background: 'var(--bg-subtle)', marginTop: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Title *</p>
                      <input style={inp} value={newProject.title} placeholder="E-commerce Dashboard" onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tech Stack *</p>
                      <input style={inp} value={newProject.techStack} placeholder="React, Node.js, PostgreSQL" onChange={e => setNewProject(p => ({ ...p, techStack: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Description</p>
                    <textarea style={{ ...inp, resize: 'none' }} rows={2} value={newProject.description} placeholder="What does it do?" onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Live URL</p>
                      <input style={inp} type="url" value={newProject.projectUrl} placeholder="https://" onChange={e => setNewProject(p => ({ ...p, projectUrl: e.target.value }))} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>GitHub URL</p>
                      <input style={inp} type="url" value={newProject.githubUrl} placeholder="https://github.com/…" onChange={e => setNewProject(p => ({ ...p, githubUrl: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { if (!newProject.title) return; const pr = [...(profile.projects || []), { ...newProject, techStack: newProject.techStack.split(',').map(t => t.trim()), id: Date.now() }]; save({ projects: pr }); setNewProject({ title: '', description: '', techStack: '', projectUrl: '', githubUrl: '' }); setAddingProject(false); }} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add Project</button>
                    <button onClick={() => setAddingProject(false)} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Block>

            {/* Certifications */}
            <Block title="Certifications" action={null}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {(profile.certifications || []).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: 12, color: 'var(--text-mid)' }}>
                    <Award size={11} style={{ color: 'var(--amber)' }} /> {c}
                    <button onClick={() => save({ certifications: (profile.certifications || []).filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0 0 0 2px', display: 'flex' }}><X size={10} /></button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp, flex: 1 }} value={newCert} placeholder="AWS Certified Developer, etc." onChange={e => setNewCert(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newCert.trim()) { save({ certifications: [...(profile.certifications || []), newCert.trim()] }); setNewCert(''); }}} />
                <button onClick={() => { if (!newCert.trim()) return; save({ certifications: [...(profile.certifications || []), newCert.trim()] }); setNewCert(''); }} style={{ padding: '0 14px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Add</button>
              </div>
            </Block>

            {/* Awards */}
            <Block title="Awards & Achievements">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {(profile.awards || []).map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: 12, color: 'var(--text-mid)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Star size={11} style={{ color: 'var(--amber)', fill: '#D97706' }} /> {a}</span>
                    <button onClick={() => save({ awards: (profile.awards || []).filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}><X size={12} /></button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp, flex: 1 }} value={newAward} placeholder="Placed 1st in Flipkart GRiD Hackathon..." onChange={e => setNewAward(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newAward.trim()) { save({ awards: [...(profile.awards || []), newAward.trim()] }); setNewAward(''); }}} />
                <button onClick={() => { if (!newAward.trim()) return; save({ awards: [...(profile.awards || []), newAward.trim()] }); setNewAward(''); }} style={{ padding: '0 14px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Add</button>
              </div>
            </Block>

            {/* Coding profiles */}
            <Block title="Coding Profiles" action={
              <button className="action-btn" onClick={() => setEditing(e => ({ ...e, codingProfiles: !e.codingProfiles }))} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                {editing.codingProfiles ? <><X size={11} /> Cancel</> : <><Edit3 size={11} /> Edit</>}
              </button>
            }>
              {[
                { f: 'leetcode', label: 'LeetCode', ph: 'username', emoji: '🧩' },
                { f: 'github_username', label: 'GitHub', ph: 'username', emoji: '🐙' },
                { f: 'codechef', label: 'CodeChef', ph: 'username', emoji: '👨‍🍳' },
                { f: 'codeforces', label: 'Codeforces', ph: 'username', emoji: '⚡' },
                { f: 'hackerrank', label: 'HackerRank', ph: 'username', emoji: '🏆' },
              ].map(({ f, label, ph, emoji }) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-mid)', width: 80 }}>{label}</span>
                  {editing.codingProfiles
                    ? <input style={{ ...inp, flex: 1, marginBottom: 0 }} value={draft.coding_profiles?.[f] || ''} placeholder={ph} onChange={e => setDraft(d => ({ ...d, coding_profiles: { ...(d.coding_profiles || {}), [f]: e.target.value } }))} />
                    : <span style={{ fontSize: 12, color: profile.coding_profiles?.[f] ? 'var(--text)' : 'var(--text-dim)', flex: 1 }}>{profile.coding_profiles?.[f] || '—'}</span>
                  }
                  {profile.coding_profiles?.[f] && !editing.codingProfiles && (
                    <ExternalLink size={11} style={{ color: 'var(--text-dim)', cursor: 'pointer' }} />
                  )}
                </div>
              ))}
              {editing.codingProfiles && (
                <button onClick={() => { save({ coding_profiles: draft.coding_profiles }); setEditing(e => ({ ...e, codingProfiles: false })); }} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>Save</button>
              )}
            </Block>

            {/* Links */}
            <Block title="Links" action={
              <button className="action-btn" onClick={() => setEditing(e => ({ ...e, links: !e.links }))} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                {editing.links ? <><X size={11} /> Cancel</> : <><Edit3 size={11} /> Edit</>}
              </button>
            }>
              {editing.links ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { f: 'github_url', label: 'GitHub URL', ph: 'https://github.com/yourname' },
                    { f: 'linkedin_url', label: 'LinkedIn URL', ph: 'https://linkedin.com/in/yourname' },
                    { f: 'portfolio_url', label: 'Portfolio URL', ph: 'https://yoursite.com' },
                  ].map(({ f, label, ph }) => (
                    <div key={f}>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
                      <input style={inp} type="url" value={draft[f] || ''} placeholder={ph} onChange={e => setDraft(d => ({ ...d, [f]: e.target.value }))} />
                    </div>
                  ))}
                  <button onClick={() => { save({ github_url: draft.github_url, linkedin_url: draft.linkedin_url, portfolio_url: draft.portfolio_url }); setEditing(e => ({ ...e, links: false })); }} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}>Save</button>
                </div>
              ) : (
                <div>
                  {[
                    { label: 'GitHub', val: profile.github_url },
                    { label: 'LinkedIn', val: profile.linkedin_url },
                    { label: 'Portfolio', val: profile.portfolio_url },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-dim)', width: 70 }}>{label}</span>
                      {val
                        ? <a href={val} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--green-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>{val.replace('https://', '').slice(0, 40)} <ExternalLink size={10} /></a>
                        : <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Not set</span>}
                    </div>
                  ))}
                </div>
              )}
            </Block>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: SKILLS
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'skills' && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Technical Skills</p>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Click a skill to add it, then set your proficiency level</p>
                </div>
                <button onClick={() => save({ skills: draft.skills_edit || profile.skills || [] })} disabled={saving} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Save size={12} /> Save Skills
                </button>
              </div>

              {/* Category tabs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {SKILL_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveSkillCat(cat)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${activeSkillCat === cat ? 'var(--text)' : 'var(--border)'}`, background: activeSkillCat === cat ? 'var(--text)' : 'transparent', color: activeSkillCat === cat ? 'var(--bg)' : 'var(--text-dim)' }}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Skill pills to add */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--border)' }}>
                {SKILL_OPTIONS.filter(s => s.category === activeSkillCat).map(skill => {
                  const currentSkills = draft.skills_edit || profile.skills || [];
                  const added = currentSkills.some(s => s.name === skill.name);
                  return (
                    <button key={skill.name} onClick={() => {
                      if (added) return;
                      const updated = [...currentSkills, { id: Date.now(), name: skill.name, level: 3, category: skill.category }];
                      setDraft(d => ({ ...d, skills_edit: updated }));
                    }} style={{ padding: '5px 10px', borderRadius: 8, fontSize: 12, cursor: added ? 'default' : 'pointer', fontFamily: 'inherit', border: `1px solid ${added ? 'var(--green)' : 'var(--border)'}`, background: added ? 'var(--green-tint)' : 'transparent', color: added ? 'var(--green-text)' : 'var(--text-dim)' }}>
                      {skill.name}{added ? ' ✓' : ''}
                    </button>
                  );
                })}
              </div>

              {/* Added skills with levels */}
              {(draft.skills_edit || profile.skills || []).length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Your Skills</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(draft.skills_edit || profile.skills || []).map((skill, i) => (
                      <div key={skill.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{skill.name}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-dim)', width: 56 }}>{LEVEL_LABELS[skill.level]}</span>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {[1,2,3,4,5].map(lv => (
                            <button key={lv} onClick={() => {
                              const updated = (draft.skills_edit || profile.skills || []).map((s, j) => j === i ? { ...s, level: lv } : s);
                              setDraft(d => ({ ...d, skills_edit: updated }));
                            }} style={{ width: 22, height: 22, borderRadius: 4, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: skill.level >= lv ? 'var(--green)' : 'var(--bg-card)', color: skill.level >= lv ? '#fff' : 'var(--text-dim)', outline: skill.level >= lv ? 'none' : '1px solid var(--border)' }}>{lv}</button>
                          ))}
                        </div>
                        <button onClick={() => {
                          const updated = (draft.skills_edit || profile.skills || []).filter((_, j) => j !== i);
                          setDraft(d => ({ ...d, skills_edit: updated }));
                        }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: PREFERENCES
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'preferences' && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Work Preferences</p>
                <button onClick={() => save({ preferred_roles: draft.preferred_roles || profile.preferred_roles, availability: draft.availability || profile.availability, work_preference: draft.work_preference || profile.work_preference, domain_interests: draft.domain_interests || profile.domain_interests, min_stipend: draft.min_stipend || profile.min_stipend })} disabled={saving} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Save size={12} /> Save
                </button>
              </div>

              {/* Preferred roles */}
              <Block title="Preferred Roles">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {ROLE_OPTIONS.map(role => {
                    const selected = (draft.preferred_roles || profile.preferred_roles || []).includes(role);
                    return (
                      <button key={role} onClick={() => {
                        const curr = draft.preferred_roles || profile.preferred_roles || [];
                        setDraft(d => ({ ...d, preferred_roles: selected ? curr.filter(r => r !== role) : [...curr, role] }));
                      }} style={{ padding: '9px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', border: `1px solid ${selected ? 'var(--green)' : 'var(--border)'}`, background: selected ? 'var(--green-tint)' : 'transparent', color: selected ? 'var(--green-text)' : 'var(--text-mid)', fontWeight: selected ? 500 : 400 }}>
                        {role}
                      </button>
                    );
                  })}
                </div>
              </Block>

              {/* Availability + work type */}
              <Block title="Availability & Work Type">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Availability</p>
                    <select style={inp} value={draft.availability || profile.availability || 'Immediate'} onChange={e => setDraft(d => ({ ...d, availability: e.target.value }))}>
                      <option>Immediate</option>
                      <option>After exams</option>
                      <option>Next semester</option>
                      <option>Not available</option>
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Work preference</p>
                    <select style={inp} value={draft.work_preference || profile.work_preference || 'remote'} onChange={e => setDraft(d => ({ ...d, work_preference: e.target.value }))}>
                      <option value="remote">Remote</option>
                      <option value="onsite">On-site</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="any">Any</option>
                    </select>
                  </div>
                </div>
              </Block>

              {/* Domain interests */}
              <Block title="Domain Interests">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {DOMAIN_OPTIONS.map(d => {
                    const selected = (draft.domain_interests || profile.domain_interests || []).includes(d);
                    return (
                      <button key={d} onClick={() => {
                        const curr = draft.domain_interests || profile.domain_interests || [];
                        setDraft(dr => ({ ...dr, domain_interests: selected ? curr.filter(x => x !== d) : [...curr, d] }));
                      }} style={{ padding: '5px 11px', borderRadius: 20, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', border: `1px solid ${selected ? 'var(--green)' : 'var(--border)'}`, background: selected ? 'var(--green-tint)' : 'transparent', color: selected ? 'var(--green-text)' : 'var(--text-mid)' }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </Block>

              {/* Minimum stipend */}
              <Block title="Minimum Expected Stipend">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>₹</span>
                  <input style={{ ...inp, maxWidth: 160 }} type="number" value={draft.min_stipend || profile.min_stipend || ''} placeholder="0" onChange={e => setDraft(d => ({ ...d, min_stipend: e.target.value }))} />
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>/ month</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5 }}>We won't show you roles below this. Private — won't affect your match scores.</p>
              </Block>
            </div>

            {/* Communications */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 18 }}>Communication Preferences</p>
              {[
                { label: 'New job matches', sub: 'When a new job matches your skills', key: 'notif_matches' },
                { label: 'Application updates', sub: 'When recruiters view your profile', key: 'notif_apps' },
                { label: 'Weekly digest', sub: 'Summary every Monday morning', key: 'notif_digest' },
                { label: 'Interview invites', sub: 'Direct interview invitations', key: 'notif_interviews' },
              ].map(({ label, sub, key }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{sub}</p>
                  </div>
                  <Toggle on={draft[key] !== false && profile[key] !== false} onChange={(val) => { setDraft(d => ({ ...d, [key]: val })); save({ [key]: val }); }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: REVIEWS
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'reviews' && (
          <div>
            {/* Trajectory */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 4 }}>6-Month Trajectory</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 48, color: 'var(--green)', lineHeight: 1, marginBottom: 4 }}>{completeness}</p>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--green-tint)', border: '1px solid var(--green)' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 2 }}>Velocity</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <TrendingUp size={13} /> High
                      </p>
                    </div>
                    <div style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 2 }}>Acceleration</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        +{Math.round(completeness * 0.18)} pts
                      </p>
                    </div>
                    <div style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 2 }}>Friction</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-mid)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Minus size={13} /> None
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <TrajectoryChart data={trajectoryData} color="var(--green)" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    {['Sep', 'Nov', 'Jan', 'Now'].map(l => (
                      <span key={l} style={{ fontSize: 10, color: l === 'Now' ? 'var(--green)' : 'var(--text-dim)', fontWeight: l === 'Now' ? 600 : 400 }}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Score formula explainer */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { letter: 'M', name: 'Mass', desc: 'Depth of verified knowledge. Skills + projects + GitHub activity.', formula: 'Σ(verified_skills × depth) + project_proof' },
                  { letter: 'v', name: 'Velocity', desc: 'Rate of growth. Decays if nothing new is added.', formula: 'Δskill_depth / Δtime · recency_weight' },
                  { letter: 'a', name: 'Acceleration', desc: 'Rate of change of growth. Rewards people on a steep curve.', formula: '(v_now - v_3mo_ago) / Δtime' },
                ].map(({ letter, name, desc, formula }) => (
                  <div key={name} style={{ padding: '14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{name}</p>
                      <span style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--green)', fontStyle: 'italic' }}>{letter}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: 8 }}>{desc}</p>
                    <code style={{ fontSize: 10, color: 'var(--text-mid)', background: 'var(--bg-card)', padding: '4px 7px', borderRadius: 4, display: 'block' }}>{formula}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruiter reviews */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Recruiter Reviews</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRating value={4} />
                  <span style={{ fontSize: 12, color: 'var(--text-mid)' }}>4.5 avg</span>
                </div>
              </div>
              {mockReviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                  <MessageSquare size={24} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No reviews yet — complete an internship to get your first review.</p>
                </div>
              ) : (
                mockReviews.map((r, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.company}</p>
                          {r.verified && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'var(--green-tint)', color: 'var(--green)', letterSpacing: '0.06em' }}>VERIFIED</span>}
                        </div>
                        <StarRating value={r.rating} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{r.date}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.6 }}>{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: MY HUNT
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'my-hunt' && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 32, fontWeight: 400, color: 'var(--text)', marginBottom: 6 }}>My Hunt.</h1>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>This section is yours — not for recruiters, not for metrics. It's who you are beyond the skills list.</p>
            </div>

            {/* What's your hunt */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Target size={16} style={{ color: 'var(--green)' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>What's your hunt?</p>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>Not just the job — what are you really after? What would success look like in 5 years?</p>
              <textarea style={{ ...inp, resize: 'none' }} rows={4} value={draft.my_hunt || profile.my_hunt || ''} placeholder="I'm hunting for the intersection of technology and education. I want to build systems that give every student — regardless of where they're from — access to the same quality of learning..." onChange={e => setDraft(d => ({ ...d, my_hunt: e.target.value }))} />
              <button onClick={() => save({ my_hunt: draft.my_hunt })} style={{ marginTop: 8, padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
            </div>

            {/* Life philosophy */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <BookOpen size={16} style={{ color: 'var(--green)' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Philosophy & worldview</p>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>How do you see the world? What do you believe about work, people, and building things?</p>
              <textarea style={{ ...inp, resize: 'none' }} rows={4} value={draft.philosophy || profile.philosophy || ''} placeholder="I believe the best products come from deep empathy — when you've felt the problem personally. I grew up without good career guidance, and that's why I'm here..." onChange={e => setDraft(d => ({ ...d, philosophy: e.target.value }))} />
              <button onClick={() => save({ philosophy: draft.philosophy })} style={{ marginTop: 8, padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
            </div>

            {/* Quote */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Quote size={16} style={{ color: 'var(--green)' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>A quote that defines you</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input style={inp} value={draft.quote || profile.quote || ''} placeholder="The people who are crazy enough to think they can change the world are the ones who do." onChange={e => setDraft(d => ({ ...d, quote: e.target.value }))} />
                <input style={inp} value={draft.quote_author || profile.quote_author || ''} placeholder="— Steve Jobs (or your own words)" onChange={e => setDraft(d => ({ ...d, quote_author: e.target.value }))} />
              </div>
              {(draft.quote || profile.quote) && (
                <div style={{ marginTop: 14, padding: '16px 20px', borderRadius: 10, background: 'var(--bg-subtle)', borderLeft: '3px solid var(--green)' }}>
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 15, color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 6 }}>"{draft.quote || profile.quote}"</p>
                  {(draft.quote_author || profile.quote_author) && <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{draft.quote_author || profile.quote_author}</p>}
                </div>
              )}
              <button onClick={() => save({ quote: draft.quote, quote_author: draft.quote_author })} style={{ marginTop: 10, padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
            </div>

            {/* Inspirations */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Rocket size={16} style={{ color: 'var(--green)' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>People & things that inspire you</p>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12 }}>Who do you follow? What books changed you? What projects excite you?</p>
              <textarea style={{ ...inp, resize: 'none' }} rows={3} value={draft.inspirations || profile.inspirations || ''} placeholder="Naval Ravikant on wealth & leverage, Paul Graham's essays, The Mom Test book, everything Supabase builds..." onChange={e => setDraft(d => ({ ...d, inspirations: e.target.value }))} />
              <button onClick={() => save({ inspirations: draft.inspirations })} style={{ marginTop: 8, padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
            </div>

            {/* Life outside work */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Heart size={16} style={{ color: 'var(--green)' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Life outside work</p>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12 }}>What do you do when you're not coding? Cricket? Music? Drawing? Hiking?</p>
              <textarea style={{ ...inp, resize: 'none' }} rows={3} value={draft.life_outside || profile.life_outside || ''} placeholder="I play cricket every Sunday morning. I sketch UI concepts in a paper notebook. I've been learning Carnatic music for 3 years..." onChange={e => setDraft(d => ({ ...d, life_outside: e.target.value }))} />
              <button onClick={() => save({ life_outside: draft.life_outside })} style={{ marginTop: 8, padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: ACCOUNT
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'account' && (
          <div style={{ maxWidth: 600 }}>
            {/* Avatar & basic info */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Account</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 10, background: 'var(--bg-subtle)', border: '1px solid var(--border)', marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-tint)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{profile.full_name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{profile.email}</p>
                </div>
                <label style={{ fontSize: 11, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-mid)', background: 'var(--bg-card)', fontFamily: 'inherit' }}>
                  Change avatar
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => showToast('Avatar upload coming soon')} />
                </label>
              </div>

              {/* Change email */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>Change email</p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>Update your login email. You'll need to verify the new address.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inp, flex: 1 }} type="email" defaultValue={profile.email || ''} placeholder="new@email.com" />
                  <button onClick={() => showToast('Email change coming soon')} style={{ padding: '0 14px', borderRadius: 7, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Change email</button>
                </div>
              </div>

              {/* Theme */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Appearance</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['light', 'dark'].map(t => (
                    <button key={t} onClick={() => setTheme(t)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1.5px solid ${theme === t ? 'var(--text)' : 'var(--border)'}`, background: theme === t ? 'var(--bg-subtle)' : 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: theme === t ? 600 : 400, color: 'var(--text)', fontFamily: 'inherit' }}>
                      {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Privacy</p>
              {[
                { label: 'Profile visible to recruiters', sub: 'Allow recruiters to find you', key: 'privacy_visible', default: true },
                { label: 'Show college name', sub: 'Display your college on your profile', key: 'privacy_college', default: true },
                { label: 'Show match scores', sub: 'Let other students see your score', key: 'privacy_scores', default: false },
                { label: 'Activity status', sub: 'Show when you were last active', key: 'privacy_activity', default: false },
              ].map(({ label, sub, key, default: def }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{sub}</p>
                  </div>
                  <Toggle on={draft[key] !== undefined ? draft[key] : (profile[key] !== undefined ? profile[key] : def)} onChange={val => { setDraft(d => ({ ...d, [key]: val })); save({ [key]: val }); }} />
                </div>
              ))}
            </div>

            {/* Danger zone */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--red)', borderRadius: 14, padding: '20px 24px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--red)', marginBottom: 8 }}>Danger Zone</p>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>Permanently delete your account and all data. This cannot be undone.</p>
              <button onClick={() => { if (window.confirm('Are you sure? This will permanently delete your account and all data.')) showToast('Delete account coming soon', 'error'); }} style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid var(--red)', background: 'transparent', color: 'var(--red)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Delete account
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
