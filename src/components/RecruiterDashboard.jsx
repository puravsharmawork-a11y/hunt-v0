import React, { useState, useMemo } from 'react';
import {
  Plus, X, ChevronRight, MapPin, Users, Briefcase, Clock,
  Heart, Star, Phone, Award, ThumbsDown, Bookmark,
  LayoutGrid, List, ArrowLeft, Sparkles, Edit2,
  Building2, User, Send, CheckCircle, Circle,
  TrendingUp, Filter, Home, GitBranch
} from 'lucide-react';

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  bg:        '#0A0A0A',
  card:      '#111110',
  subtle:    '#1A1A18',
  hover:     '#222220',
  border:    '#2A2A28',
  borderMid: '#3A3A38',
  text:      '#FAFAF8',
  textMid:   '#9B9B97',
  textDim:   '#5A5A56',
  green:     '#2EAD6A',
  greenTint: '#0D2B1A',
  blue:      '#60A5FA',
  blueTint:  'rgba(96,165,250,0.1)',
  purple:    '#A78BFA',
  purpleTint:'rgba(167,139,250,0.12)',
  amber:     '#D4A84B',
  amberTint: '#2B2010',
  red:       '#E05C4B',
  redTint:   '#2B1210',
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_RECRUITER = {
  name: 'Arjun Mehta',
  title: 'Founder',
  company: 'TechFlow AI',
  email: 'arjun@techflow.ai',
  about: 'Building AI-powered analytics for B2B SaaS companies.',
  stage: 'Seed',
  location: 'Mumbai, India',
  website: 'techflow.ai',
  teamSize: '11-50',
};

const MOCK_ROLES = [
  {
    id: 'R001', logo: '🚀', role: 'Backend Engineering Intern',
    stipend: '₹25,000/mo', duration: '6 months', location: 'Remote',
    status: 'live', applicants: 23, maxApplicants: 50,
    description: 'Build scalable backend systems for AI-powered analytics.',
    skills: ['Node.js', 'PostgreSQL', 'REST APIs', 'Git'],
  },
  {
    id: 'R002', logo: '🎨', role: 'Full Stack Developer Intern',
    stipend: '₹20,000/mo', duration: '3 months', location: 'Hybrid (Mumbai)',
    status: 'live', applicants: 12, maxApplicants: 50,
    description: 'Build modern web applications for creative agencies.',
    skills: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
  },
  {
    id: 'R003', logo: '☁️', role: 'DevOps Intern',
    stipend: '₹28,000/mo', duration: '6 months', location: 'Remote',
    status: 'paused', applicants: 38, maxApplicants: 50,
    description: 'Automate deployment pipelines and infrastructure.',
    skills: ['Linux', 'Docker', 'Python', 'CI/CD'],
  },
];

const MOCK_CANDIDATES = [
  {
    id: 'C001', name: 'Priya Sharma', college: 'VJTI Mumbai', year: 3,
    score: 94, skills: ['Node.js L4', 'PostgreSQL L3', 'REST APIs L4', 'Git L4'],
    projects: ['E-commerce Dashboard', 'ML Price Predictor'],
    github: true, portfolio: true,
    status: 'pending', roleId: 'R001',
    summary: 'Strong backend candidate with solid project history.',
  },
  {
    id: 'C002', name: 'Rahul Gupta', college: 'NIT Nagpur', year: 3,
    score: 87, skills: ['Node.js L3', 'PostgreSQL L3', 'REST APIs L3'],
    projects: ['Blog API', 'Chat App'],
    github: true, portfolio: false,
    status: 'shortlisted', roleId: 'R001',
    summary: 'Consistent profile with good REST API exposure.',
  },
  {
    id: 'C003', name: 'Sneha Patil', college: 'SPIT Mumbai', year: 4,
    score: 82, skills: ['Node.js L3', 'PostgreSQL L2', 'Git L4'],
    projects: ['Task Manager API', 'Weather Dashboard'],
    github: true, portfolio: true,
    status: 'interview', roleId: 'R001',
    summary: 'Active GitHub contributor. Strong consistency score.',
  },
  {
    id: 'C004', name: 'Aditya Verma', college: 'COEP Pune', year: 3,
    score: 79, skills: ['Node.js L3', 'REST APIs L3', 'Git L3'],
    projects: ['Portfolio Site', 'Student Portal'],
    github: false, portfolio: true,
    status: 'pending', roleId: 'R001',
    summary: 'Decent match. Missing DB experience.',
  },
  {
    id: 'C005', name: 'Kavya Nair', college: 'RAIT Mumbai', year: 3,
    score: 76, skills: ['Node.js L2', 'PostgreSQL L2', 'REST APIs L2'],
    projects: ['Notes App'],
    github: true, portfolio: false,
    status: 'pending', roleId: 'R001',
    summary: 'Beginner-level but motivated profile.',
  },
  {
    id: 'C006', name: 'Yash Joshi', college: 'DJ Sanghvi', year: 4,
    score: 71, skills: ['Node.js L3', 'Git L4'],
    projects: ['Inventory System'],
    github: true, portfolio: false,
    status: 'hired', roleId: 'R001',
    summary: 'Good Git discipline. Limited DB work.',
  },
  {
    id: 'C007', name: 'Meera Iyer', college: 'KIT Kolhapur', year: 3,
    score: 89, skills: ['React L4', 'Node.js L3', 'MongoDB L3'],
    projects: ['Real-time Dashboard', 'E-commerce UI'],
    github: true, portfolio: true,
    status: 'pending', roleId: 'R002',
    summary: 'Excellent React skills. Strong full stack candidate.',
  },
  {
    id: 'C008', name: 'Dev Malhotra', college: 'VESIT Mumbai', year: 3,
    score: 83, skills: ['React L3', 'Node.js L3', 'MongoDB L2'],
    projects: ['Portfolio App', 'Task Board'],
    github: true, portfolio: true,
    status: 'shortlisted', roleId: 'R002',
    summary: 'Solid UI skills with growing backend experience.',
  },
];

const STATUS_CFG = {
  pending:     { label: 'Pending',     color: T.textDim,   bg: T.subtle,      border: T.border },
  shortlisted: { label: 'Shortlisted', color: T.green,     bg: T.greenTint,   border: T.green },
  interview:   { label: 'Interview',   color: T.blue,      bg: T.blueTint,    border: T.blue },
  hired:       { label: 'Hired',       color: T.purple,    bg: T.purpleTint,  border: T.purple },
  rejected:    { label: 'Passed',      color: T.red,       bg: T.redTint,     border: T.red },
};

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: T.greenTint, border: `1px solid ${T.green}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 700, color: T.green,
    }}>{initials}</div>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span style={{
      fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 600,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>{cfg.label}</span>
  );
}

function ScoreTag({ score }) {
  const color = score >= 80 ? T.green : score >= 65 ? T.amber : T.red;
  return (
    <span style={{
      fontSize: 13, fontWeight: 700, color,
      fontFamily: "Georgia, serif",
    }}>{score}%</span>
  );
}

function Btn({ children, onClick, variant = 'ghost', small, disabled, style: extra = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: small ? '6px 10px' : '9px 14px',
    fontSize: small ? 11 : 12, fontWeight: 500, fontFamily: 'inherit',
    borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
    ...extra,
  };
  if (variant === 'primary') return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, background: T.text, color: T.bg }}>{children}</button>
  );
  if (variant === 'ghost') return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, background: 'transparent', color: T.textMid, border: `1px solid ${T.border}` }}>{children}</button>
  );
  if (variant === 'danger') return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, background: 'transparent', color: T.red, border: `1px solid ${T.redTint}` }}>{children}</button>
  );
  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: variant, color: '#fff', border: 'none' }}>{children}</button>;
}

function Label({ children }) {
  return <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textDim, marginBottom: 5 }}>{children}</p>;
}

function FocusInput({ style, ...props }) {
  return (
    <input {...props} style={{
      width: '100%', padding: '9px 12px', borderRadius: 7,
      border: `1px solid ${T.border}`, background: T.subtle,
      color: T.text, fontSize: 12, fontFamily: 'inherit', outline: 'none',
      boxSizing: 'border-box', ...style,
    }} />
  );
}

function FocusTextarea({ style, ...props }) {
  return (
    <textarea {...props} style={{
      width: '100%', padding: '9px 12px', borderRadius: 7, resize: 'vertical',
      border: `1px solid ${T.border}`, background: T.subtle,
      color: T.text, fontSize: 12, fontFamily: 'inherit', outline: 'none',
      boxSizing: 'border-box', minHeight: 70, ...style,
    }} />
  );
}

function FocusSelect({ style, children, ...props }) {
  return (
    <select {...props} style={{
      width: '100%', padding: '9px 12px', borderRadius: 7,
      border: `1px solid ${T.border}`, background: T.subtle,
      color: T.text, fontSize: 12, fontFamily: 'inherit', outline: 'none',
      boxSizing: 'border-box', ...style,
    }}>{children}</select>
  );
}

// ─── POST ROLE DRAWER ─────────────────────────────────────────────────────────
function PostRoleDrawer({ open, onClose, onPost }) {
  const [form, setForm] = useState({
    logo: '🚀', role: '', stipend: '', duration: '', location: '',
    type: 'Paid Internship', description: '', skillInput: '',
    skills: [],
  });

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const addSkill = () => {
    const s = form.skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm(f => ({ ...f, skills: [...f.skills, s], skillInput: '' }));
  };

  const removeSkill = s => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

  const handlePost = () => {
    if (!form.role || !form.stipend || !form.skills.length) return;
    onPost({ ...form, id: `R${Date.now()}`, status: 'live', applicants: 0, maxApplicants: 50 });
    onClose();
  };

  const LOGOS = ['🚀','⚡','🎯','💡','🔥','🌊','🛠️','📊','🎨','🌱','⭐','🦾'];

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9000, backdropFilter: 'blur(2px)' }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 480,
        background: T.card, borderLeft: `1px solid ${T.border}`, zIndex: 9001,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.26s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textDim, margin: 0, marginBottom: 3 }}>Post a role</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 400, color: T.text, margin: 0 }}>Hire your next <em>intern.</em></h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 7, cursor: 'pointer', color: T.textDim, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Logo + Role */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div>
                <Label>Logo</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, width: 168 }}>
                  {LOGOS.slice(0, 12).map(e => (
                    <button key={e} onClick={() => set('logo')(e)} style={{ width: 26, height: 26, borderRadius: 5, fontSize: 14, cursor: 'pointer', border: `1.5px solid ${form.logo === e ? T.text : T.border}`, background: T.subtle }}>{e}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <Label>Role title *</Label>
                <FocusInput value={form.role} onChange={e => set('role')(e.target.value)} placeholder="Backend Engineering Intern" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><Label>Stipend *</Label><FocusInput value={form.stipend} onChange={e => set('stipend')(e.target.value)} placeholder="₹25,000/month" /></div>
              <div><Label>Duration *</Label><FocusInput value={form.duration} onChange={e => set('duration')(e.target.value)} placeholder="3 / 6 months" /></div>
              <div><Label>Location</Label><FocusInput value={form.location} onChange={e => set('location')(e.target.value)} placeholder="Remote / Mumbai" /></div>
              <div><Label>Type</Label>
                <FocusSelect value={form.type} onChange={e => set('type')(e.target.value)}>
                  <option>Paid Internship</option><option>Unpaid Internship</option><option>Contract</option>
                </FocusSelect>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <FocusTextarea value={form.description} onChange={e => set('description')(e.target.value)} placeholder="What will the intern actually work on?" rows={3} />
            </div>

            <div>
              <Label>Required Skills *</Label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <FocusInput
                  value={form.skillInput}
                  onChange={e => set('skillInput')(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="React, Node.js, Python… press Enter"
                  style={{ flex: 1 }}
                />
                <Btn onClick={addSkill} variant="primary" small>Add</Btn>
              </div>
              {form.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.skills.map(s => (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 9px', borderRadius: 20, border: `1px solid ${T.border}`, color: T.textMid }}>
                      {s}
                      <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textDim, display: 'flex', padding: 0 }}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.card }}>
          <Btn onClick={handlePost} variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', fontSize: 13 }}>
            Post Role <ChevronRight size={14} />
          </Btn>
        </div>
      </div>
    </>
  );
}

// ─── EDIT ROLE MODAL ──────────────────────────────────────────────────────────
function EditRoleModal({ role, onClose, onSave }) {
  const [form, setForm] = useState({ ...role });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, width: 480, maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 400, color: T.text, margin: 0 }}>Edit Role</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textDim }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><Label>Role title</Label><FocusInput value={form.role} onChange={e => set('role')(e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><Label>Stipend</Label><FocusInput value={form.stipend} onChange={e => set('stipend')(e.target.value)} /></div>
            <div><Label>Duration</Label><FocusInput value={form.duration} onChange={e => set('duration')(e.target.value)} /></div>
            <div><Label>Location</Label><FocusInput value={form.location} onChange={e => set('location')(e.target.value)} /></div>
            <div><Label>Status</Label>
              <FocusSelect value={form.status} onChange={e => set('status')(e.target.value)}>
                <option value="live">Live</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </FocusSelect>
            </div>
          </div>
          <div><Label>Description</Label><FocusTextarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3} /></div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => { onSave(form); onClose(); }} variant="primary">Save Changes</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── CANDIDATE SNAPSHOT CARD ──────────────────────────────────────────────────
function CandidateSnapshot({ c, onAction, compact }) {
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const handleAction = (action) => {
    onAction(c.id, action, msg);
    if (action !== 'view') setSent(false);
  };

  const sendMsg = () => {
    if (!msg.trim()) return;
    onAction(c.id, 'message', msg);
    setSent(true);
    setMsg('');
  };

  const ACTIONS = [
    { key: 'shortlisted', label: 'Shortlist', icon: Bookmark, color: T.green },
    { key: 'interview',   label: 'Interview', icon: Phone,    color: T.blue },
    { key: 'hired',       label: 'Hire',      icon: Award,    color: T.purple },
    { key: 'rejected',    label: 'Pass',      icon: ThumbsDown, color: T.red },
  ];

  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', background: T.subtle, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={c.name} size={40} />
            <div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 400, color: T.text, margin: 0 }}>{c.name}</p>
              <p style={{ fontSize: 10, color: T.textDim, margin: '2px 0 0' }}>{c.college} · Year {c.year}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ScoreTag score={c.score} />
            <StatusPill status={c.status} />
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px', flex: 1 }}>
        {/* Skills */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Skills</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {c.skills.map((s, i) => (
              <span key={i} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 5, background: T.greenTint, border: `1px solid ${T.green}30`, color: T.green }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Projects */}
        {!compact && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Projects</p>
            {c.projects.map((p, i) => (
              <p key={i} style={{ fontSize: 11, color: T.textMid, margin: '2px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: T.textDim, flexShrink: 0, display: 'inline-block' }} />{p}
              </p>
            ))}
          </div>
        )}

        {/* Links */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {c.github && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, border: `1px solid ${T.border}`, color: T.textMid }}>GitHub</span>}
          {c.portfolio && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, border: `1px solid ${T.border}`, color: T.textMid }}>Portfolio</span>}
        </div>

        {/* Message */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Message to candidate</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="e.g. Great profile! Sending Calendly link shortly."
              rows={2}
              style={{
                flex: 1, padding: '7px 10px', fontSize: 11, borderRadius: 7,
                background: T.subtle, border: `1px solid ${T.border}`,
                color: T.text, resize: 'none', fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button onClick={sendMsg} style={{
              padding: '0 10px', borderRadius: 7, border: 'none',
              background: sent ? T.greenTint : T.blue, color: '#fff',
              cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center',
            }}>
              {sent ? <CheckCircle size={14} color={T.green} /> : <Send size={14} />}
            </button>
          </div>
          {sent && <p style={{ fontSize: 10, color: T.green, marginTop: 4 }}>Message sent ✓</p>}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
          {ACTIONS.map(a => {
            const active = c.status === a.key;
            const Icon = a.icon;
            return (
              <button key={a.key} onClick={() => handleAction(a.key)} style={{
                padding: '7px 4px', borderRadius: 7, fontSize: 10, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3,
                border: `1px solid ${active ? a.color : T.border}`,
                background: active ? a.color + '20' : 'transparent',
                color: active ? a.color : T.textMid,
                transition: 'all 0.12s',
              }}>
                <Icon size={11} />
                <span>{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ROLE DETAIL VIEW ─────────────────────────────────────────────────────────
function RoleDetailView({ role, candidates, onBack, onAction, onEditRole }) {
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [huntSorted, setHuntSorted] = useState(false);
  const [topSix, setTopSix] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editOpen, setEditOpen] = useState(false);

  const roleCandidates = candidates.filter(c => c.roleId === role.id);

  const handleHuntSort = () => {
    const sorted = [...roleCandidates].sort((a, b) => b.score - a.score).slice(0, 6);
    setTopSix(sorted.map(c => c.id));
    setHuntSorted(true);
    setStatusFilter('all');
  };

  const displayed = useMemo(() => {
    let list = huntSorted
      ? roleCandidates.filter(c => topSix.includes(c.id)).sort((a, b) => b.score - a.score)
      : roleCandidates;
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
    return list;
  }, [roleCandidates, huntSorted, topSix, statusFilter]);

  const counts = roleCandidates.reduce((acc, c) => {
    acc.all = (acc.all || 0) + 1;
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const statusLabel = {
    live: { label: '● Live', color: T.green },
    paused: { label: '⏸ Paused', color: T.amber },
    closed: { label: '✕ Closed', color: T.textDim },
  };
  const sLabel = statusLabel[role.status] || statusLabel.closed;

  return (
    <div>
      {editOpen && <EditRoleModal role={role} onClose={() => setEditOpen(false)} onSave={r => { onEditRole(r); setEditOpen(false); }} />}

      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: T.textMid, cursor: 'pointer', fontSize: 12, marginBottom: 18, padding: 0 }}>
        <ArrowLeft size={13} /> All Roles
      </button>

      {/* Role header card */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 36, lineHeight: 1 }}>{role.logo}</span>
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, color: T.text, margin: 0, lineHeight: 1.2 }}>{role.role}</h2>
              <p style={{ fontSize: 11, color: T.textDim, margin: '4px 0 0' }}>{role.stipend} · {role.duration} · {role.location}</p>
              <span style={{ fontSize: 9, fontWeight: 600, color: sLabel.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sLabel.label}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <Btn onClick={() => setEditOpen(true)} small><Edit2 size={12} /> Edit</Btn>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Applicants',   val: roleCandidates.length },
            { label: 'Shortlisted',  val: counts.shortlisted || 0 },
            { label: 'Interviewing', val: counts.interview || 0 },
            { label: 'Hired',        val: counts.hired || 0 },
          ].map(s => (
            <div key={s.label} style={{ background: T.subtle, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontSize: 9, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: T.text, margin: 0, lineHeight: 1, fontWeight: 400 }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* HUNT Sort button */}
          <button onClick={handleHuntSort} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            background: huntSorted ? T.amber + '20' : T.text,
            color: huntSorted ? T.amber : T.bg,
            border: huntSorted ? `1px solid ${T.amber}` : 'none',
          }}>
            <Sparkles size={13} />
            {huntSorted ? 'Top 6 Active' : 'HUNT Sort'}
          </button>
          {huntSorted && (
            <button onClick={() => { setHuntSorted(false); setTopSix([]); }} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '7px 10px', borderRadius: 7,
              background: 'transparent', border: `1px solid ${T.border}`, color: T.textDim, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <X size={11} /> Clear
            </button>
          )}

          {/* Status filters */}
          <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
            {[
              { id: 'all', label: `All (${counts.all || 0})` },
              { id: 'pending', label: `Pending (${counts.pending || 0})` },
              { id: 'shortlisted', label: `Shortlisted` },
              { id: 'interview', label: `Interview` },
              { id: 'hired', label: `Hired` },
            ].map(f => (
              <button key={f.id} onClick={() => setStatusFilter(f.id)} style={{
                padding: '5px 10px', borderRadius: 14, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                background: statusFilter === f.id ? T.text : 'transparent',
                border: `1px solid ${statusFilter === f.id ? T.text : T.border}`,
                color: statusFilter === f.id ? T.bg : T.textMid,
              }}>{f.label}</button>
            ))}
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 4, background: T.subtle, borderRadius: 8, padding: 3, border: `1px solid ${T.border}` }}>
          {[{ m: 'grid', Icon: LayoutGrid }, { m: 'list', Icon: List }].map(({ m, Icon }) => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: viewMode === m ? T.card : 'transparent',
              color: viewMode === m ? T.text : T.textDim, display: 'flex', alignItems: 'center',
            }}><Icon size={13} /></button>
          ))}
        </div>
      </div>

      {huntSorted && (
        <div style={{ marginBottom: 14, padding: '8px 14px', background: T.amberTint, border: `1px solid ${T.amber}30`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={12} style={{ color: T.amber }} />
          <p style={{ fontSize: 11, color: T.amber, margin: 0 }}>Showing top 6 candidates ranked by HUNT score — skill match, projects & consistency.</p>
        </div>
      )}

      {/* Candidates */}
      {displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 14 }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>🎯</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: T.text }}>No candidates in this view.</p>
          <p style={{ fontSize: 12, color: T.textDim }}>Try a different filter or share your role link.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {displayed.map(c => <CandidateSnapshot key={c.id} c={c} onAction={onAction} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayed.map((c, i) => (
            <div key={c.id} style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 10, color: T.textDim, width: 20, fontFamily: 'Georgia, serif' }}>#{i + 1}</span>
              <Avatar name={c.name} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: T.text, margin: 0 }}>{c.name}</p>
                <p style={{ fontSize: 10, color: T.textDim, margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.college} · Year {c.year}</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 200 }}>
                {c.skills.slice(0, 3).map((s, j) => (
                  <span key={j} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: T.greenTint, border: `1px solid ${T.green}30`, color: T.green }}>{s}</span>
                ))}
              </div>
              <ScoreTag score={c.score} />
              <StatusPill status={c.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── HOME TAB (Roles list + detail) ──────────────────────────────────────────
function HomeTab({ roles, candidates, onPostRole, onCandidateAction, onEditRole }) {
  const [openRole, setOpenRole] = useState(null);

  if (openRole) {
    const role = roles.find(r => r.id === openRole);
    if (!role) { setOpenRole(null); return null; }
    return (
      <RoleDetailView
        role={role}
        candidates={candidates}
        onBack={() => setOpenRole(null)}
        onAction={onCandidateAction}
        onEditRole={onEditRole}
      />
    );
  }

  const liveRoles = roles.filter(r => r.status === 'live');
  const totalApplicants = candidates.length;
  const shortlisted = candidates.filter(c => c.status === 'shortlisted').length;
  const hired = candidates.filter(c => c.status === 'hired').length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textDim, marginBottom: 5 }}>Home</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 400, color: T.text, margin: 0 }}>Welcome back, <em>Arjun.</em></h1>
        <p style={{ fontSize: 12, color: T.textMid, marginTop: 6 }}>Here's what's happening at TechFlow AI.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Live Roles', val: liveRoles.length },
          { label: 'Applicants', val: totalApplicants },
          { label: 'Shortlisted', val: shortlisted },
          { label: 'Hired', val: hired },
        ].map(s => (
          <div key={s.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textDim, marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: T.text, margin: 0, lineHeight: 1, fontWeight: 400 }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Roles section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 400, color: T.text, margin: 0 }}>Your Roles</h2>
        <Btn onClick={onPostRole} variant="primary" small><Plus size={12} /> Post a Role</Btn>
      </div>

      {roles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 14 }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>📋</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: T.text, marginBottom: 6 }}>No roles yet.</p>
          <p style={{ fontSize: 12, color: T.textDim, marginBottom: 14 }}>Post your first role to start receiving matched candidates.</p>
          <Btn onClick={onPostRole} variant="primary" small><Plus size={12} /> Post a Role</Btn>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {roles.map(role => {
            const roleCands = candidates.filter(c => c.roleId === role.id);
            const filled = (role.applicants || roleCands.length) / (role.maxApplicants || 50);
            const sLabel = { live: { label: '● Live', c: T.green }, paused: { label: '⏸ Paused', c: T.amber }, closed: { label: '✕ Closed', c: T.textDim } };
            const sl = sLabel[role.status] || sLabel.closed;
            return (
              <div
                key={role.id}
                onClick={() => setOpenRole(role.id)}
                style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
                  padding: 18, cursor: 'pointer', transition: 'border-color 0.15s',
                  display: 'flex', flexDirection: 'column', gap: 12, minHeight: 170,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.borderMid}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 28, lineHeight: 1 }}>{role.logo}</span>
                    <div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 400, color: T.text, margin: 0, lineHeight: 1.25 }}>{role.role}</p>
                      <p style={{ fontSize: 10, color: T.textDim, marginTop: 3 }}>{role.stipend} · {role.duration}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, color: sl.c, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{sl.label}</span>
                </div>

                <div style={{ display: 'flex', gap: 12, fontSize: 10, color: T.textMid }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {role.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={10} /> {roleCands.length}/{role.maxApplicants || 50} applied</span>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ height: 2, borderRadius: 2, background: T.border, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ height: '100%', width: `${Math.min(filled, 1) * 100}%`, background: filled > 0.8 ? T.red : filled > 0.5 ? T.amber : T.green, borderRadius: 2 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['shortlisted', 'interview', 'hired'].map(st => {
                      const n = roleCands.filter(c => c.status === st).length;
                      const cfg = STATUS_CFG[st];
                      if (!n) return null;
                      return <span key={st} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 8, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{cfg.label.toLowerCase()}: {n}</span>;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PIPELINE TAB ─────────────────────────────────────────────────────────────
function PipelineTab({ candidates, roles, onAction }) {
  const stages = [
    { id: 'shortlisted', label: 'Shortlisted', color: T.green,  icon: Bookmark },
    { id: 'interview',   label: 'Interview',   color: T.blue,   icon: Phone },
    { id: 'hired',       label: 'Hired',       color: T.purple, icon: Award },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textDim, marginBottom: 5 }}>Pipeline</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 400, color: T.text, margin: 0 }}>Hiring <em>pipeline.</em></h1>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {stages.map(st => {
          const n = candidates.filter(c => c.status === st.id).length;
          const Icon = st.icon;
          return (
            <div key={st.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: st.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} style={{ color: st.color }} />
              </div>
              <div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: st.color, margin: 0, lineHeight: 1 }}>{n}</p>
                <p style={{ fontSize: 9, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '2px 0 0', fontWeight: 600 }}>{st.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {stages.map(stage => {
          const stageCands = candidates.filter(c => c.status === stage.id);
          const Icon = stage.icon;
          return (
            <div key={stage.id} style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
              padding: 14, minHeight: 280, display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon size={13} style={{ color: stage.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{stage.label}</span>
                </div>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: stage.color, padding: '1px 7px', borderRadius: 8, background: T.subtle }}>{stageCands.length}</span>
              </div>

              {stageCands.length === 0 ? (
                <p style={{ fontSize: 11, color: T.textDim, textAlign: 'center', padding: '28px 0' }}>No candidates here yet.</p>
              ) : stageCands.map(c => {
                const role = roles.find(r => r.id === c.roleId);
                return (
                  <div key={c.id} style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.subtle, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar name={c.name} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 500, color: T.text, margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                      <p style={{ fontSize: 9, color: T.textDim, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role?.logo} {role?.role}</p>
                    </div>
                    <ScoreTag score={c.score} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* All candidates table */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 400, color: T.text, marginBottom: 12 }}>All Candidates</h3>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {candidates.sort((a, b) => b.score - a.score).map((c, i) => {
            const role = roles.find(r => r.id === c.roleId);
            return (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                borderBottom: i < candidates.length - 1 ? `1px solid ${T.border}` : 'none',
              }}>
                <span style={{ fontSize: 10, color: T.textDim, width: 20, fontFamily: 'Georgia, serif' }}>#{i+1}</span>
                <Avatar name={c.name} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: T.text, margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: 10, color: T.textDim, margin: 0 }}>{c.college}</p>
                </div>
                <span style={{ fontSize: 10, color: T.textMid }}>{role?.logo} {role?.role}</span>
                <ScoreTag score={c.score} />
                <StatusPill status={c.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
function ProfileTab() {
  const [subTab, setSubTab] = useState('startup');
  const [startup, setStartup] = useState({ ...MOCK_RECRUITER });
  const [recruiter, setRecruiter] = useState({ name: MOCK_RECRUITER.name, title: MOCK_RECRUITER.title, email: MOCK_RECRUITER.email, phone: '', linkedin: '', bio: '' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textDim, marginBottom: 5 }}>Profile</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 400, color: T.text, margin: 0 }}>Your <em>profile.</em></h1>
      </div>

      {/* Sub tab strip */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, marginBottom: 22 }}>
        {[{ id: 'startup', label: 'Startup' }, { id: 'you', label: 'You' }].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{
            padding: '9px 16px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
            background: 'transparent', border: 'none',
            borderBottom: `2px solid ${subTab === t.id ? T.text : 'transparent'}`,
            color: subTab === t.id ? T.text : T.textDim,
            fontWeight: subTab === t.id ? 600 : 400, marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, maxWidth: 600 }}>
        {subTab === 'startup' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
              <span style={{ fontSize: 40 }}>🚀</span>
              <div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: T.text, margin: 0 }}>{startup.company}</p>
                <p style={{ fontSize: 11, color: T.textDim, margin: '3px 0 0' }}>{startup.stage} · {startup.location}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><Label>Startup name</Label><FocusInput value={startup.company} onChange={e => setStartup(s => ({...s, company: e.target.value}))} /></div>
              <div><Label>Website</Label><FocusInput value={startup.website} onChange={e => setStartup(s => ({...s, website: e.target.value}))} /></div>
              <div><Label>Location</Label><FocusInput value={startup.location} onChange={e => setStartup(s => ({...s, location: e.target.value}))} /></div>
              <div><Label>Stage</Label>
                <FocusSelect value={startup.stage} onChange={e => setStartup(s => ({...s, stage: e.target.value}))}>
                  <option>Pre-seed</option><option>Seed</option><option>Series A</option><option>Series B</option><option>Bootstrapped</option>
                </FocusSelect>
              </div>
            </div>
            <div><Label>About</Label><FocusTextarea value={startup.about} onChange={e => setStartup(s => ({...s, about: e.target.value}))} rows={3} /></div>
            <Btn onClick={handleSave} variant="primary" small>
              {saved ? <><CheckCircle size={12} /> Saved</> : 'Save Changes'}
            </Btn>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <Avatar name={recruiter.name} size={48} />
              <div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: T.text, margin: 0 }}>{recruiter.name}</p>
                <p style={{ fontSize: 11, color: T.textDim, margin: '3px 0 0' }}>{recruiter.title} at {startup.company}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><Label>Full name</Label><FocusInput value={recruiter.name} onChange={e => setRecruiter(r => ({...r, name: e.target.value}))} /></div>
              <div><Label>Title</Label><FocusInput value={recruiter.title} onChange={e => setRecruiter(r => ({...r, title: e.target.value}))} /></div>
              <div><Label>Email</Label><FocusInput value={recruiter.email} disabled type="email" style={{ opacity: 0.6 }} /></div>
              <div><Label>Phone</Label><FocusInput value={recruiter.phone} onChange={e => setRecruiter(r => ({...r, phone: e.target.value}))} placeholder="+91…" /></div>
              <div style={{ gridColumn: 'span 2' }}><Label>LinkedIn</Label><FocusInput value={recruiter.linkedin} onChange={e => setRecruiter(r => ({...r, linkedin: e.target.value}))} placeholder="https://linkedin.com/in/…" /></div>
            </div>
            <div><Label>Bio</Label><FocusTextarea value={recruiter.bio} onChange={e => setRecruiter(r => ({...r, bio: e.target.value}))} rows={3} placeholder="Short intro candidates will see." /></div>
            <Btn onClick={handleSave} variant="primary" small>
              {saved ? <><CheckCircle size={12} /> Saved</> : 'Save Changes'}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN SHELL ───────────────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [postOpen, setPostOpen] = useState(false);
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);

  const handlePost = (newRole) => {
    setRoles(r => [newRole, ...r]);
  };

  const handleCandidateAction = (candidateId, action, msg) => {
    const statusActions = ['shortlisted', 'interview', 'hired', 'rejected'];
    if (statusActions.includes(action)) {
      setCandidates(cs => cs.map(c => c.id === candidateId ? { ...c, status: action } : c));
    }
  };

  const handleEditRole = (updatedRole) => {
    setRoles(rs => rs.map(r => r.id === updatedRole.id ? updatedRole : r));
  };

  const NAV = [
    { id: 'home',     label: 'Home',     icon: Home },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'profile',  label: 'Profile',  icon: Building2 },
  ];

  const initials = MOCK_RECRUITER.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, color: T.text,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      display: 'flex', WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus, select:focus { border-color: ${T.text} !important; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <PostRoleDrawer open={postOpen} onClose={() => setPostOpen(false)} onPost={handlePost} />

      {/* Sidebar */}
      <aside style={{
        width: 200, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
        borderRight: `1px solid ${T.border}`, background: T.card,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.2em', color: T.text }}>HUNT</span>
        </div>

        <nav style={{ padding: '8px 7px', flex: 1 }}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '8px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
              marginBottom: 1, fontFamily: 'inherit', textAlign: 'left',
              background: activeTab === id ? T.subtle : 'transparent',
              color: activeTab === id ? T.text : T.textDim,
              fontSize: 12, fontWeight: activeTab === id ? 600 : 400,
              transition: 'background 0.1s, color 0.1s',
            }}>
              <Icon size={14} style={{ flexShrink: 0 }} />{label}
            </button>
          ))}

          <div style={{ marginTop: 8, padding: '0 3px' }}>
            <button onClick={() => setPostOpen(true)} style={{
              display: 'flex', alignItems: 'center', gap: 7, width: '100%',
              padding: '8px 10px', borderRadius: 7, border: `1px dashed ${T.borderMid}`,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 11,
              background: 'transparent', color: T.textDim, transition: 'all 0.15s',
            }}>
              <Plus size={12} /> Post a Role
            </button>
          </div>
        </nav>

        <div style={{ padding: '10px 7px', borderTop: `1px solid ${T.border}` }}>
          <div style={{ padding: '8px 10px', borderRadius: 8, background: T.subtle, marginBottom: 6 }}>
            <p style={{ fontSize: 9, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 2 }}>Company</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>TechFlow AI</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 7 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: T.greenTint, border: `1px solid ${T.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: T.green, flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{MOCK_RECRUITER.name}</p>
              <p style={{ fontSize: 9, color: T.textDim }}>{MOCK_RECRUITER.title}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', maxHeight: '100vh' }}>
        <div style={{ padding: '32px 36px 80px', maxWidth: 1200, margin: '0 auto' }}>
          {activeTab === 'home' && (
            <HomeTab
              roles={roles}
              candidates={candidates}
              onPostRole={() => setPostOpen(true)}
              onCandidateAction={handleCandidateAction}
              onEditRole={handleEditRole}
            />
          )}
          {activeTab === 'pipeline' && (
            <PipelineTab roles={roles} candidates={candidates} onAction={handleCandidateAction} />
          )}
          {activeTab === 'profile' && <ProfileTab />}
        </div>
      </main>
    </div>
  );
}
