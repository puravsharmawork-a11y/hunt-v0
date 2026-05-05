import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, LogOut, Sun, Moon, X, ChevronRight,
  MapPin, Users, Link2, Trash2,
  ArrowLeft, Pause, Play, ExternalLink, Github, Building2, Home,
  Layers, UserCheck, GitBranch, Network, Sparkles,
  Bookmark, ThumbsDown, Phone, Award, Bell, Lock, MessageSquare,
  LayoutGrid, List, ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOut } from '../services/supabase';

// ═══════════════════════════════════════════════════════════════════════════
// 1. DESIGN TOKENS — HUNT Brutalist System
// ═══════════════════════════════════════════════════════════════════════════
const HUNT_TOKENS = {
  light: {
    '--cream':       '#F2F0E8',
    '--cream-2':     '#E8E5DA',
    '--paper':       '#FAF8F0',
    '--ink':         '#14130E',
    '--line':        'rgba(20,19,14,0.06)',
    '--line-mid':    'rgba(20,19,14,0.13)',
    '--rule':        '#14130E',
    '--blue':        '#1A35E8',
    '--blue-tint':   '#E3E7FB',
    '--blue-deep':   '#0B1BA0',
    '--red':         '#B8281C',
    '--red-tint':    '#F7D9D4',
    '--amber':       '#B85C00',
    '--amber-tint':  '#F7E7D2',
    '--green':       '#1A7A4A',
    '--green-tint':  '#E0F0E8',
    '--bg':          '#F2F0E8',
    '--bg-card':     '#FAF8F0',
    '--bg-subtle':   '#E8E5DA',
    '--border':      'rgba(0,0,0,0.10)',
    '--border-mid':  'rgba(0,0,0,0.20)',
    '--text':        '#14130E',
    '--text-mid':    '#3A362A',
    '--text-dim':    '#6E6955',
    '--text-faint':  '#A8A28C',
  },
  dark: {
    '--cream':       '#0E0E0C',
    '--cream-2':     '#16150F',
    '--paper':       '#16150F',
    '--ink':         '#F2F0E8',
    '--line':        'rgba(242,240,232,0.07)',
    '--line-mid':    'rgba(242,240,232,0.16)',
    '--rule':        '#F2F0E8',
    '--blue':        '#6B82F7',
    '--blue-tint':   '#1E2448',
    '--blue-deep':   '#C0CAFB',
    '--red':         '#E5726A',
    '--red-tint':    '#301814',
    '--amber':       '#D4944A',
    '--amber-tint':  '#2B1A08',
    '--green':       '#3EAD6A',
    '--green-tint':  '#0D2B1A',
    '--bg':          '#0E0E0C',
    '--bg-card':     '#16150F',
    '--bg-subtle':   '#1C1B15',
    '--border':      'rgba(255,255,255,0.07)',
    '--border-mid':  'rgba(255,255,255,0.14)',
    '--text':        '#F2F0E8',
    '--text-mid':    '#C9C5B4',
    '--text-dim':    '#8A8572',
    '--text-faint':  '#5A5646',
  },
};

function applyTokens(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  Object.entries(HUNT_TOKENS[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. SUPABASE HELPERS (unchanged from original)
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
    .from('applications').select('*, students(*)').eq('job_id', jobId)
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
async function updateApplicationStatus(appId, status, studentId, recruiterMessage, jobMeta = {}) {
  const patch = { status };
  if (status === 'shortlisted') patch.shortlisted_at = new Date().toISOString();
  if (status === 'interview')   patch.interviewed_at = new Date().toISOString();
  if (status === 'hired')       patch.hired_at       = new Date().toISOString();
  if (recruiterMessage?.trim()) patch.recruiter_message = recruiterMessage.trim();
  const { data, error } = await supabase
    .from('applications').update(patch).eq('id', appId).select().single();
  if (error) throw new Error(error.message || 'Status update failed');
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
const LOGO_EMOJIS = ['🚀','⚡','🎯','💡','🔥','🌊','🛠️','📊','🎨','🌱','⭐','🦾','🧬','🌐','🔮','🎮'];

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',     icon: Home },
  { id: 'roles',   label: 'Roles',    icon: Layers },
  { id: 'hiring',  label: 'Pipeline', icon: GitBranch },
  { id: 'profile', label: 'Profile',  icon: Building2 },
  { id: 'network', label: 'Network',  icon: Network },
];

const STATUS_META = {
  pending:     { label: 'Pending',     color: 'var(--text-dim)',  bg: 'var(--bg-subtle)',  border: 'var(--border-mid)' },
  shortlisted: { label: 'Shortlisted', color: 'var(--blue-deep)', bg: 'var(--blue-tint)',  border: 'var(--blue)' },
  interview:   { label: 'Interview',   color: 'var(--ink)',       bg: 'var(--cream-2)',    border: 'var(--border-mid)' },
  hired:       { label: 'Hired',       color: 'var(--cream)',     bg: 'var(--ink)',        border: 'var(--ink)' },
  rejected:    { label: 'Passed',      color: 'var(--red)',       bg: 'var(--red-tint)',   border: 'var(--red)' },
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. PIXEL HUNT MARK
// ═══════════════════════════════════════════════════════════════════════════
function PixelMark({ size = 18, color = 'var(--blue)' }) {
  const on = [1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,1, 1,0,0,0,1, 1,0,0,0,1];
  const px = Math.max(2, Math.floor(size / 6));
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(5,${px}px)`, gridAutoRows:`${px}px`, gap:1, flexShrink:0 }}>
      {on.map((v,i) => <div key={i} style={{ background: v ? color : 'transparent' }} />)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. ATOMS
// ═══════════════════════════════════════════════════════════════════════════
const mono = { fontFamily:"'JetBrains Mono', 'Fira Code', ui-monospace, monospace" };
const serif = { fontFamily:"'Instrument Serif', 'Georgia', serif", fontWeight: 400 };

function Kicker({ children, color = 'var(--text-dim)', style }) {
  return (
    <span style={{
      ...mono, fontSize:10, fontWeight:600, letterSpacing:'0.14em',
      textTransform:'uppercase', color, display:'inline-block', ...style
    }}>{children}</span>
  );
}

function BlinkDot({ color = 'var(--blue)' }) {
  return (
    <span style={{
      display:'inline-block', width:6, height:6,
      background:color, imageRendering:'pixelated', flexShrink:0,
      animation:'hunt-blink 1.2s steps(2,end) infinite',
    }} />
  );
}

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{
      ...mono, fontSize:9.5, padding:'3px 7px',
      background:m.bg, color:m.color,
      border:`1px solid ${m.border}`,
      letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:500,
    }}>{m.label}</span>
  );
}

function Avatar({ name, size = 36 }) {
  const initials = (name||'?').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  return (
    <div style={{
      width:size, height:size, flexShrink:0,
      border:'1.5px solid var(--ink)',
      background:'var(--blue-tint)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.34, fontWeight:600, color:'var(--blue-deep)',
      ...mono,
    }}>{initials}</div>
  );
}

function HuntCard({ children, style, padding = 24, ticks = true }) {
  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border-mid)',
      position:'relative', padding, ...style,
    }}>
      {ticks && (
        <>
          <span style={{ position:'absolute', top:-1, left:-1,  width:6, height:6, background:'var(--ink)', zIndex:2 }} />
          <span style={{ position:'absolute', top:-1, right:-1, width:6, height:6, background:'var(--ink)', zIndex:2 }} />
          <span style={{ position:'absolute', bottom:-1, left:-1,  width:6, height:6, background:'var(--ink)', zIndex:2 }} />
          <span style={{ position:'absolute', bottom:-1, right:-1, width:6, height:6, background:'var(--ink)', zIndex:2 }} />
        </>
      )}
      {children}
    </div>
  );
}

function SectionHead({ label, right }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
      <Kicker color="var(--text)">{label}</Kicker>
      <div style={{ flex:1, height:1, background:'var(--line-mid)' }} />
      {right}
    </div>
  );
}

const btnBase = {
  display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
  ...mono, fontSize:11.5, letterSpacing:'0.1em',
  textTransform:'uppercase', fontWeight:500,
  padding:'10px 16px',
  border:'1px solid var(--ink)',
  background:'transparent', color:'var(--ink)',
  cursor:'pointer', transition:'background 0.12s, color 0.12s',
};
const btnPrimary = {
  ...btnBase,
  background:'var(--blue)', color:'#fff', borderColor:'var(--blue)',
  boxShadow:'3px 3px 0 0 var(--ink)',
};
const btnGhost = {
  ...btnBase, borderColor:'var(--border-mid)', color:'var(--text-mid)',
};
const btnSm = { padding:'6px 10px', fontSize:10.5 };
const btnDanger = {
  ...btnBase, background:'var(--red)', color:'#fff', borderColor:'var(--red)',
  boxShadow:'3px 3px 0 0 var(--ink)',
};

const inp = {
  ...{ fontFamily:"'Inter', system-ui, sans-serif" },
  fontSize:13.5, padding:'11px 13px',
  border:'1px solid var(--border-mid)',
  background:'var(--bg-card)',
  color:'var(--text)', width:'100%',
  outline:'none', transition:'border-color 0.12s', boxSizing:'border-box',
};

function FocusInput({ style, ...props }) {
  return <input {...props} style={{ ...inp, ...style }}
    onFocus={e => e.target.style.borderColor='var(--ink)'}
    onBlur={e =>  e.target.style.borderColor='var(--border-mid)'} />;
}
function FocusSelect({ style, children, ...props }) {
  return <select {...props} style={{ ...inp, ...style }}
    onFocus={e => e.target.style.borderColor='var(--ink)'}
    onBlur={e =>  e.target.style.borderColor='var(--border-mid)'}>{children}</select>;
}
function FocusTextarea({ style, ...props }) {
  return <textarea {...props} style={{ ...inp, resize:'vertical', minHeight:70, ...style }}
    onFocus={e => e.target.style.borderColor='var(--ink)'}
    onBlur={e =>  e.target.style.borderColor='var(--border-mid)'} />;
}
function Label({ children, required }) {
  return (
    <p style={{ ...mono, fontSize:10, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:6 }}>
      {children}{required && <span style={{ color:'var(--red)', marginLeft:3 }}>*</span>}
    </p>
  );
}
function Toast({ msg, type }) {
  return (
    <div style={{
      position:'fixed', top:20, left:'50%', transform:'translateX(-50%)',
      zIndex:9999, padding:'9px 18px', fontSize:12, fontWeight:500,
      background: type==='error' ? 'rgba(184,40,28,0.96)' : 'rgba(20,19,14,0.94)',
      color:'var(--cream)', boxShadow:'4px 4px 0 0 var(--ink)',
      animation:'huntFadeDown 0.2s ease', maxWidth:'90vw', textAlign:'center',
      ...mono, letterSpacing:'0.05em',
    }}>{msg}</div>
  );
}

function PageHeader({ kicker, title, italic, sub, right }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16, marginBottom:36 }}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <BlinkDot />
          <Kicker color="var(--text)">{kicker}</Kicker>
        </div>
        <h1 style={{
          ...serif, fontSize:'clamp(34px,4vw,44px)', lineHeight:1.1,
          letterSpacing:'-0.02em', margin:0, marginBottom: sub ? 10 : 0,
          color:'var(--text)',
        }}>
          {title}{italic && <> <em style={{ fontStyle:'italic', color:'var(--blue)' }}>{italic}</em></>}
        </h1>
        {sub && <p style={{ fontSize:13.5, color:'var(--text-mid)', margin:0, maxWidth:520, lineHeight:1.55 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function SubTabStrip({ tabs, active, onChange }) {
  return (
    <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border-mid)', marginBottom:28 }}>
      {tabs.map(t => {
        const sel = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            ...mono, padding:'10px 16px',
            border:'none', background:'none', cursor:'pointer',
            fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase',
            color: sel ? 'var(--text)' : 'var(--text-dim)',
            fontWeight: sel ? 600 : 500,
            borderBottom:`2px solid ${sel ? 'var(--ink)' : 'transparent'}`,
            marginBottom:-1,
            display:'flex', alignItems:'center', gap:8,
          }}>
            {t.label}
            {t.count != null && (
              <span style={{
                fontSize:9.5, padding:'2px 6px',
                background: sel ? 'var(--ink)' : 'var(--bg-subtle)',
                color: sel ? 'var(--cream)' : 'var(--text-dim)',
                border: sel ? 'none' : '1px solid var(--border-mid)',
              }}>{String(t.count).padStart(2,'0')}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ icon='🎯', title, message, cta }) {
  return (
    <HuntCard padding={56} style={{ textAlign:'center' }}>
      <div style={{ fontSize:36, marginBottom:14 }}>{icon}</div>
      <h3 style={{ ...serif, fontSize:22, color:'var(--text)', margin:'0 0 8px', lineHeight:1.1 }}>{title}</h3>
      <p style={{ fontSize:13, color:'var(--text-dim)', marginBottom: cta ? 20 : 0, lineHeight:1.55 }}>{message}</p>
      {cta}
    </HuntCard>
  );
}

function ScoreDisplay({ score, size = 18 }) {
  const color = score >= 75 ? 'var(--blue)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
  return <span style={{ ...serif, fontSize:size, color, lineHeight:1 }}>{score}</span>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. CANDIDATE SNAPSHOT PANEL — HUNT Brutalist Design
// ═══════════════════════════════════════════════════════════════════════════
function ScoreBar({ label, value, max }) {
  const isZero = value === 0;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
      <span style={{ flex:'0 0 158px', fontSize:12.5, color: isZero ? 'var(--text-dim)' : 'var(--text)', letterSpacing:'0.005em' }}>
        {label}
      </span>
      <div style={{
        flex:1, height:6, position:'relative',
        background:'var(--bg-subtle)', border:'1px solid var(--border-mid)',
      }}>
        {!isZero && (
          <div style={{
            position:'absolute', top:-1, left:-1, bottom:-1,
            width:`calc(${(value/max)*100}% + 2px)`,
            background:'var(--blue)', minWidth:2,
            transition:'width 0.3s ease',
          }} />
        )}
      </div>
      <span style={{
        ...mono, flex:'0 0 56px', textAlign:'right',
        fontSize:11.5, fontWeight:500,
        color: isZero ? 'var(--text-faint)' : 'var(--text)',
        letterSpacing:'0.02em',
      }}>{value}/{max}</span>
    </div>
  );
}

function SkillPill({ name, level }) {
  const filled = level >= 4;
  const tint   = level === 3;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'4px 9px', fontSize:11.5,
      border:`1px solid ${filled ? 'var(--blue)' : tint ? 'var(--blue)' : 'var(--border-mid)'}`,
      background: filled ? 'var(--blue)' : tint ? 'var(--blue-tint)' : 'transparent',
      color: filled ? '#fff' : tint ? 'var(--blue-deep)' : 'var(--text-mid)',
      whiteSpace:'nowrap',
    }}>
      {name}
      <span style={{ ...mono, fontSize:9.5, fontWeight:600, letterSpacing:'0.05em', opacity:0.85 }}>L{level}</span>
    </span>
  );
}

function CandidateActionButton({ icon: Icon, label, kind = 'default', onClick, active }) {
  const styles = {
    default: { bg:'var(--bg-card)',  col:'var(--text)', border:'var(--border-mid)' },
    primary: { bg:'var(--blue)',     col:'#fff',        border:'var(--blue)' },
    danger:  { bg:'var(--red)',      col:'#fff',        border:'var(--red)' },
  }[kind];
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      padding:'13px 14px',
      border:`1px solid ${styles.border}`,
      background: active ? 'var(--ink)' : styles.bg,
      color: active ? 'var(--cream)' : styles.col,
      ...mono, fontSize:11.5, letterSpacing:'0.1em',
      textTransform:'uppercase', fontWeight:500,
      cursor:'pointer',
      boxShadow: (kind==='primary' || kind==='danger') ? '3px 3px 0 0 var(--ink)' : 'none',
      transition:'transform 0.08s ease, box-shadow 0.08s ease',
    }}
      onMouseDown={e => { if(kind==='primary'||kind==='danger') e.currentTarget.style.cssText+=';transform:translate(2px,2px);box-shadow:1px 1px 0 0 var(--ink)'; }}
      onMouseUp={e   => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=(kind==='primary'||kind==='danger')?'3px 3px 0 0 var(--ink)':'none'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; }}
    >
      <Icon size={13} /> {label}
    </button>
  );
}

function CandidatePanel({ app, onStatusChange, onClose }) {
  const s         = app?.students || {};
  const skills    = s.skills    || [];
  const projects  = s.projects  || [];
  const score     = app?.match_score    || 0;
  const breakdown = app?.match_breakdown || {};
  const [recruiterNote, setRecruiterNote] = useState('');
  const [sending, setSending] = useState(false);

  const ACTIONS = [
    { key:'shortlisted', label:'Shortlist',  icon:Bookmark,   kind:'default' },
    { key:'interview',   label:'Interview',  icon:Phone,      kind:'default' },
    { key:'hired',       label:'Hire',       icon:Award,      kind:'primary' },
    { key:'rejected',    label:'Pass',       icon:ThumbsDown, kind:'danger'  },
  ];

  const handleAction = async (key) => {
    setSending(true);
    try { await onStatusChange(app.id, key, recruiterNote); setRecruiterNote(''); }
    finally { setSending(false); }
  };

  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border-mid)',
      position:'relative', display:'flex', flexDirection:'column',
      width:'100%', maxWidth:520,
    }}>
      {/* Corner ticks */}
      {[[-1,-1,'top','left'],[-1,null,'top','right'],[null,-1,'bottom','left'],[null,null,'bottom','right']].map(([t,l,tv,lv],i) => (
        <span key={i} style={{ position:'absolute', [tv]:-1, [lv]:-1, width:6, height:6, background:'var(--ink)', zIndex:2 }} />
      ))}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 22px', borderBottom:'1px solid var(--border-mid)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <BlinkDot />
          <Kicker color="var(--text)">Candidate · {app?.jobs?.role || 'Applicant'}</Kicker>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-mid)', padding:4, display:'flex' }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        {/* Identity */}
        <div style={{ padding:'24px 22px 20px', display:'flex', alignItems:'flex-start', gap:16 }}>
          <div style={{
            width:56, height:56, flexShrink:0,
            border:'1.5px solid var(--ink)', background:'var(--blue-tint)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:18, fontWeight:600, color:'var(--blue-deep)', ...mono,
          }}>{(s.full_name||'?').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <h2 style={{ ...serif, fontSize:30, lineHeight:1.05, margin:'2px 0 4px', color:'var(--text)' }}>
              {s.full_name || 'Student'}
            </h2>
            <div style={{ ...mono, fontSize:10.5, color:'var(--text-dim)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
              {s.college || '—'} · Year {s.year || '?'}
            </div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ ...serif, fontSize:44, lineHeight:1, color:'var(--blue)', display:'flex', alignItems:'flex-start', justifyContent:'flex-end' }}>
              {score}<span style={{ fontSize:22, marginTop:4 }}>%</span>
            </div>
            <Kicker>match</Kicker>
          </div>
        </div>

        {/* Score Breakdown */}
        {Object.keys(breakdown).length > 0 && (
          <div style={{ padding:'0 22px 22px' }}>
            <div style={{ padding:18, background:'var(--bg-subtle)', border:'1px solid var(--border-mid)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:16 }}>
                <Kicker color="var(--text)">Score breakdown</Kicker>
                <span style={{ ...mono, fontSize:11, color:'var(--text-mid)' }}>
                  {totalScore}<span style={{ color:'var(--text-faint)' }}>/100</span>
                </span>
              </div>
              <div style={{ display:'grid', gap:11 }}>
                {Object.entries(breakdown).map(([k, v]) => (
                  <ScoreBar key={k} label={k.replace(/([A-Z])/g,' $1').trim()} value={v} max={40} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ padding:'0 22px 22px' }}>
            <Kicker>Skills</Kicker>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:10 }}>
              {skills.map((sk, i) => <SkillPill key={i} name={sk.name} level={sk.level || 3} />)}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:12 }}>
              {[['var(--blue)', '#fff', 'Level 4–5'], ['var(--blue-tint)', 'var(--blue-deep)', 'Level 3', true]].map(([bg, col, lbl, bordered]) => (
                <span key={lbl} style={{ ...mono, fontSize:9.5, color:'var(--text-faint)', letterSpacing:'0.08em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:8, height:8, background:bg, border: bordered ? '1px solid var(--blue)' : 'none' }} /> {lbl}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ padding:'0 22px 22px' }}>
            <Kicker>Projects</Kicker>
            <div style={{ display:'grid', gap:6, marginTop:10 }}>
              {projects.slice(0,3).map((p, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 13px', border:'1px solid var(--border-mid)', background:'var(--bg)' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:2 }}>{p.title || p.name}</div>
                    <div style={{ ...mono, fontSize:10, color:'var(--text-dim)', letterSpacing:'0.04em' }}>
                      {Array.isArray(p.techStack) ? p.techStack.join(' · ') : (p.techStack || '')}
                    </div>
                  </div>
                  {(p.github_url || p.githubUrl) && (
                    <a href={p.github_url || p.githubUrl} target="_blank" rel="noopener noreferrer" style={{ ...mono, fontSize:10, color:'var(--blue)', letterSpacing:'0.08em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:4, fontWeight:500, textDecoration:'none' }}>
                      github <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div style={{ padding:'0 22px 22px', display:'flex', gap:6, flexWrap:'wrap' }}>
          {s.github_url && (
            <a href={s.github_url} target="_blank" rel="noopener noreferrer" style={{ ...mono, display:'inline-flex', alignItems:'center', gap:7, padding:'8px 13px', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', border:'1px solid var(--border-mid)', background:'var(--bg-card)', color:'var(--text-mid)', textDecoration:'none', fontWeight:500 }}>
              <Github size={11} /> GitHub
            </a>
          )}
          {s.linkedin_url && (
            <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ ...mono, display:'inline-flex', alignItems:'center', gap:7, padding:'8px 13px', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', border:'1px solid var(--border-mid)', background:'var(--bg-card)', color:'var(--text-mid)', textDecoration:'none', fontWeight:500 }}>
              <ExternalLink size={11} /> LinkedIn
            </a>
          )}
          {s.resume_url && (
            <a href={s.resume_url} target="_blank" rel="noopener noreferrer" style={{ ...mono, display:'inline-flex', alignItems:'center', gap:7, padding:'8px 13px', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', border:'1px solid var(--ink)', background:'var(--bg-card)', color:'var(--text)', textDecoration:'none', fontWeight:500 }}>
              📄 Resume
            </a>
          )}
        </div>

        <div style={{ height:1, background:'var(--line-mid)', margin:'0 22px' }} />

        {/* Message */}
        <div style={{ padding:'20px 22px 18px' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:9 }}>
            <Kicker color="var(--text)">Message to candidate</Kicker>
            <Kicker style={{ color:'var(--text-faint)' }}>(optional)</Kicker>
          </div>
          <FocusTextarea
            value={recruiterNote}
            onChange={e => setRecruiterNote(e.target.value)}
            placeholder="e.g. Great projects! We'd love to chat — sending a Calendly link shortly."
            rows={3}
            style={{ fontFamily:'inherit', lineHeight:1.5, fontSize:13 }}
          />
        </div>

        {/* Actions */}
        <div style={{ padding:'0 22px 18px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {ACTIONS.map(opt => (
            <CandidateActionButton
              key={opt.key}
              icon={opt.icon} label={opt.label} kind={opt.kind}
              active={app?.status === opt.key}
              onClick={() => !sending && handleAction(opt.key)}
            />
          ))}
        </div>

        {/* Status + last message */}
        {(app?.status && app.status !== 'pending') && (
          <div style={{ padding:'0 22px 22px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: app?.recruiter_message ? 12 : 0 }}>
              <Kicker>Current status</Kicker>
              <StatusPill status={app.status} />
            </div>
            {app.recruiter_message && (
              <div style={{ borderLeft:'3px solid var(--blue)', background:'var(--blue-tint)', padding:'12px 14px', marginTop:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, color:'var(--blue-deep)' }}>
                  <MessageSquare size={11} />
                  <Kicker color="var(--blue-deep)">Last message sent</Kicker>
                </div>
                <p style={{ ...serif, fontStyle:'italic', fontSize:15, lineHeight:1.45, color:'var(--text)', margin:0 }}>
                  "{app.recruiter_message}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. HUNT SORT CARD (Grid view)
// ═══════════════════════════════════════════════════════════════════════════
function HuntSortCard({ app, rank, onStatusChange }) {
  const s        = app.students || {};
  const skills   = s.skills    || [];
  const projects = s.projects  || [];
  const score    = app.match_score || 0;
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const ACTIONS = [
    { key:'shortlisted', label:'Shortlist', icon:Bookmark   },
    { key:'interview',   label:'Interview', icon:Phone      },
    { key:'hired',       label:'Hire',      icon:Award      },
    { key:'rejected',    label:'Pass',      icon:ThumbsDown },
  ];

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-mid)', position:'relative', display:'flex', flexDirection:'column' }}>
      {/* Corner ticks */}
      <span style={{ position:'absolute', top:-1, left:-1,  width:6, height:6, background:'var(--ink)', zIndex:2 }} />
      <span style={{ position:'absolute', top:-1, right:-1, width:6, height:6, background:'var(--ink)', zIndex:2 }} />
      <span style={{ position:'absolute', bottom:-1, left:-1,  width:6, height:6, background:'var(--ink)', zIndex:2 }} />
      <span style={{ position:'absolute', bottom:-1, right:-1, width:6, height:6, background:'var(--ink)', zIndex:2 }} />

      {/* Rank + score */}
      <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid var(--border-mid)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ ...mono, fontSize:10, fontWeight:700, color:'var(--text-dim)' }}>#{rank}</span>
        <span style={{ ...serif, fontSize:20, color:'var(--blue)', lineHeight:1 }}>{score}%</span>
      </div>

      {/* Candidate info */}
      <div style={{ padding:'14px 16px', flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <Avatar name={s.full_name} size={40} />
          <div>
            <p style={{ ...serif, fontSize:14, color:'var(--text)', margin:0, lineHeight:1.2 }}>{s.full_name || 'Student'}</p>
            <p style={{ ...mono, fontSize:10, color:'var(--text-dim)', margin:'2px 0 0', letterSpacing:'0.04em' }}>{s.college || '—'} · Y{s.year || '?'}</p>
          </div>
        </div>

        {skills.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
            {skills.slice(0,4).map((sk, i) => (
              <span key={i} style={{ ...mono, fontSize:9, padding:'2px 7px', background:'var(--blue-tint)', border:'1px solid var(--blue)', color:'var(--blue-deep)' }}>
                {sk.name} L{sk.level}
              </span>
            ))}
            {skills.length > 4 && <span style={{ ...mono, fontSize:9, padding:'2px 5px', color:'var(--text-dim)' }}>+{skills.length-4}</span>}
          </div>
        )}

        {projects.length > 0 && (
          <div style={{ marginBottom:10 }}>
            {projects.slice(0,2).map((p, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 0', borderBottom: i<Math.min(projects.length,2)-1 ? '1px solid var(--border-mid)' : 'none' }}>
                <div style={{ width:3, height:3, background:'var(--text-dim)', flexShrink:0 }} />
                <span style={{ fontSize:11, color:'var(--text)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title || p.name}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
          {s.github_url && <a href={s.github_url} target="_blank" rel="noopener noreferrer" style={{ ...mono, display:'inline-flex', alignItems:'center', gap:4, fontSize:10, padding:'3px 8px', border:'1px solid var(--border-mid)', color:'var(--text-mid)', textDecoration:'none' }}><Github size={10} /> GitHub</a>}
          {s.resume_url && <a href={s.resume_url} target="_blank" rel="noopener noreferrer" style={{ ...mono, display:'inline-flex', alignItems:'center', gap:4, fontSize:10, padding:'3px 8px', border:'1px solid var(--ink)', color:'var(--text)', textDecoration:'none' }}>📄 Resume</a>}
        </div>

        {app.status && app.status !== 'pending' && <StatusPill status={app.status} />}
      </div>

      {/* Actions */}
      <div style={{ padding:'10px 14px', borderTop:'1px solid var(--border-mid)', background:'var(--bg-subtle)' }}>
        <FocusTextarea value={note} onChange={e => setNote(e.target.value)} placeholder="Optional message…" rows={2} style={{ fontSize:11, padding:'7px 10px', marginBottom:8, minHeight:'unset', resize:'none' }} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:5 }}>
          {ACTIONS.map(opt => {
            const active = app.status === opt.key;
            const Icon = opt.icon;
            const actionColors = {
              shortlisted: 'var(--blue)', interview: 'var(--text)',
              hired: 'var(--blue)', rejected: 'var(--red)',
            };
            const c = actionColors[opt.key];
            return (
              <button key={opt.key} disabled={sending} onClick={async () => { setSending(true); try { await onStatusChange(app.id, opt.key, note); setNote(''); } finally { setSending(false); } }} style={{
                ...mono, padding:'7px 6px', fontSize:10, fontWeight:500,
                cursor: sending ? 'wait' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                border:`1px solid ${active ? c : 'var(--border-mid)'}`,
                background: active ? c : 'transparent',
                color: active ? '#fff' : c,
                opacity: sending ? 0.6 : 1, transition:'all 0.12s',
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
// 8. APPLICANT ROW
// ═══════════════════════════════════════════════════════════════════════════
function ApplicantRow({ app, rank, onClick, isSelected }) {
  const s = app.students || {};
  const score = app.match_score || 0;
  return (
    <div onClick={onClick} style={{
      background:'var(--bg-card)',
      border: isSelected ? '1.5px solid var(--ink)' : '1px solid var(--border-mid)',
      padding:'13px 16px', cursor:'pointer',
      display:'flex', alignItems:'center', gap:12,
      transition:'border-color 0.12s',
    }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor='var(--ink)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor='var(--border-mid)'; }}
    >
      <span style={{ ...mono, fontSize:10, color:'var(--text-dim)', width:22, flexShrink:0, textAlign:'center' }}>#{rank}</span>
      <Avatar name={s.full_name} size={34} />
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:12, fontWeight:500, color:'var(--text)', margin:0, lineHeight:1.2 }}>{s.full_name || 'Student'}</p>
        <p style={{ ...mono, fontSize:10, color:'var(--text-dim)', margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'0.04em' }}>
          {s.college || '—'} · Year {s.year || '?'}
        </p>
      </div>
      <ScoreDisplay score={score} size={18} />
      <StatusPill status={app.status || 'pending'} />
      <ChevronRight size={13} style={{ color:'var(--text-dim)', transform: isSelected ? 'rotate(90deg)' : 'none', transition:'transform 0.15s', flexShrink:0 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. ROLE DETAIL VIEW
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
      await updateApplicationStatus(appId, status, app?.students?.id, note,
        { role: job.role, company: job.company || recruiter?.startups?.name });
      setApps(a => a.map(x => x.id === appId ? { ...x, status, recruiter_message: note || x.recruiter_message } : x));
      if (selectedApp?.id === appId) setSelectedApp(s => ({ ...s, status, recruiter_message: note || s.recruiter_message }));
      const labels = { shortlisted:'Shortlisted ✓', interview:'Moved to interview', hired:'Hired!', rejected:'Passed' };
      showToast(labels[status] || 'Updated');
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  };

  const huntSortedApps = useMemo(() =>
    [...apps].sort((a,b) => (b.match_score||0) - (a.match_score||0)).slice(0,6), [apps]);

  const filtered = statusFilter === 'all' ? apps : apps.filter(a => (a.status||'pending') === statusFilter);
  const counts = apps.reduce((acc, a) => {
    const s = a.status || 'pending';
    acc[s] = (acc[s]||0)+1; acc.all = (acc.all||0)+1; return acc;
  }, {});
  const avgScore = apps.length ? Math.round(apps.reduce((s,a) => s+(a.match_score||0), 0)/apps.length) : 0;

  const filterTabs = [
    { id:'all', label:`All`, count: counts.all||0 },
    { id:'pending', label:`Pending`, count: counts.pending||0 },
    { id:'shortlisted', label:`Shortlisted`, count: counts.shortlisted||0 },
    { id:'interview', label:`Interview`, count: counts.interview||0 },
    { id:'hired', label:`Hired`, count: counts.hired||0 },
    { id:'rejected', label:`Passed`, count: counts.rejected||0 },
  ];

  return (
    <div>
      <button onClick={onBack} style={{ ...btnGhost, ...btnSm, marginBottom:18 }}>
        <ArrowLeft size={12} /> All roles
      </button>

      {/* Role header */}
      <HuntCard padding={22} style={{ marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:38 }}>{job.logo || '🚀'}</span>
            <div>
              <h2 style={{ ...serif, fontSize:24, color:'var(--text)', margin:0, lineHeight:1.1 }}>{job.role}</h2>
              <p style={{ ...mono, fontSize:11, color:'var(--text-dim)', margin:'4px 0 0', letterSpacing:'0.04em' }}>
                {job.company} · {job.location} · {job.stipend}
              </p>
            </div>
          </div>
          <button onClick={() => onCopyLink(job)} style={{ ...btnGhost, ...btnSm }}>
            <Link2 size={12} /> Share
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {[
            { label:'Applicants',   val:apps.length },
            { label:'Avg score',    val:`${avgScore}%` },
            { label:'Shortlisted',  val:counts.shortlisted||0 },
            { label:'Interviewing', val:counts.interview||0 },
          ].map(stat => (
            <div key={stat.label} style={{ background:'var(--bg-subtle)', border:'1px solid var(--border-mid)', padding:'12px 14px' }}>
              <Kicker style={{ display:'block', marginBottom:6 }}>{stat.label}</Kicker>
              <p style={{ ...serif, fontSize:24, color:'var(--text)', margin:0, lineHeight:1 }}>{stat.val}</p>
            </div>
          ))}
        </div>
      </HuntCard>

      {/* HUNT Sort */}
      <div style={{ background:'var(--bg-card)', border:'2px solid var(--blue)', position:'relative', padding:20, marginBottom:18 }}>
        <span style={{ position:'absolute', top:-1, left:-1,  width:6, height:6, background:'var(--blue)', zIndex:2 }} />
        <span style={{ position:'absolute', top:-1, right:-1, width:6, height:6, background:'var(--blue)', zIndex:2 }} />
        <span style={{ position:'absolute', bottom:-1, left:-1,  width:6, height:6, background:'var(--blue)', zIndex:2 }} />
        <span style={{ position:'absolute', bottom:-1, right:-1, width:6, height:6, background:'var(--blue)', zIndex:2 }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: huntSortActive ? 18 : 0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, background:'var(--blue-tint)', border:'1px solid var(--blue)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Sparkles size={15} style={{ color:'var(--blue)' }} />
            </div>
            <div>
              <p style={{ ...mono, fontSize:12, fontWeight:600, color:'var(--text)', margin:0, letterSpacing:'0.1em', textTransform:'uppercase' }}>HUNT Sort</p>
              <p style={{ fontSize:11, color:'var(--text-dim)', margin:'1px 0 0' }}>Top 6 candidates ranked by match score</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {huntSortActive && (
              <div style={{ display:'flex', gap:4 }}>
                {[['grid', LayoutGrid], ['list', List]].map(([id, Icon]) => (
                  <button key={id} onClick={() => setHuntSortView(id)} style={{
                    ...btnGhost, ...btnSm, padding:'7px 9px',
                    background: huntSortView===id ? 'var(--bg-subtle)' : 'transparent',
                    borderColor: huntSortView===id ? 'var(--ink)' : 'var(--border-mid)',
                    color: huntSortView===id ? 'var(--text)' : 'var(--text-dim)',
                  }}>
                    <Icon size={13} />
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setHuntSortActive(h => !h)} style={{
              ...btnBase,
              background: huntSortActive ? 'var(--blue)' : 'var(--blue-tint)',
              color: huntSortActive ? '#fff' : 'var(--blue-deep)',
              borderColor:'var(--blue)',
              boxShadow: huntSortActive ? '3px 3px 0 0 var(--ink)' : 'none',
              fontSize:11, padding:'8px 14px',
            }}>
              <Sparkles size={13} />
              {huntSortActive ? 'Hide' : 'Run HUNT Sort'}
            </button>
          </div>
        </div>

        {huntSortActive && (
          apps.length === 0 ? (
            <p style={{ textAlign:'center', color:'var(--text-dim)', fontSize:13, padding:'24px 0' }}>No applicants yet.</p>
          ) : huntSortView === 'grid' ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px,1fr))', gap:14 }}>
              {huntSortedApps.map((app, i) => (
                <HuntSortCard key={app.id} app={app} rank={i+1}
                  onStatusChange={async (id, status, note) => { await handleStatusChange(id, status, note); }} />
              ))}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {huntSortedApps.map((app, i) => (
                <ApplicantRow key={app.id} app={app} rank={i+1}
                  onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                  isSelected={selectedApp?.id === app.id} />
              ))}
            </div>
          )
        )}
      </div>

      {/* All applicants */}
      <div style={{ marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <Kicker color="var(--text)">All applicants</Kicker>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {filterTabs.map(t => (
            <button key={t.id} onClick={() => setStatusFilter(t.id)} style={{
              ...mono, padding:'5px 10px', fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase',
              background: statusFilter===t.id ? 'var(--ink)' : 'transparent',
              border:`1px solid ${statusFilter===t.id ? 'var(--ink)' : 'var(--border-mid)'}`,
              color: statusFilter===t.id ? 'var(--cream)' : 'var(--text-mid)',
              fontWeight: statusFilter===t.id ? 600 : 400, cursor:'pointer',
            }}>
              {t.label} <span style={{ opacity:0.7 }}>({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign:'center', color:'var(--text-dim)', padding:40, fontSize:13 }}>Loading applicants…</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎯" title="No applicants in this view." message="Try a different filter or share your role link." />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns: selectedApp ? '1fr 500px' : '1fr', gap:16 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map((app, i) => (
              <ApplicantRow key={app.id} app={app} rank={i+1}
                onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                isSelected={selectedApp?.id === app.id} />
            ))}
          </div>
          {selectedApp && (
            <CandidatePanel app={selectedApp} onStatusChange={handleStatusChange} onClose={() => setSelectedApp(null)} />
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. ROLE CARD
// ═══════════════════════════════════════════════════════════════════════════
function RoleCard({ job, onClick, onTogglePause, onCopyLink, onDelete }) {
  const filled = (job.current_applicants||0) / (job.max_applicants||50);
  const status = job.status || (job.is_active ? 'live' : 'paused');
  const statusStyle = status === 'live'
    ? { color:'var(--blue-deep)', bg:'var(--blue-tint)', border:'var(--blue)', label:'● Live' }
    : status === 'paused'
    ? { color:'var(--amber)', bg:'var(--amber-tint)', border:'var(--amber)', label:'⏸ Paused' }
    : { color:'var(--text-dim)', bg:'var(--bg-subtle)', border:'var(--border-mid)', label:'Closed' };

  return (
    <div onClick={onClick} style={{ background:'var(--bg-card)', border:'1px solid var(--border-mid)', padding:18, cursor:'pointer', transition:'border-color 0.12s', display:'flex', flexDirection:'column', gap:12, minHeight:180, position:'relative' }}
      onMouseEnter={e => e.currentTarget.style.borderColor='var(--ink)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border-mid)'}
    >
      {/* Corner ticks */}
      <span style={{ position:'absolute', top:-1, left:-1,  width:6, height:6, background:'var(--ink)' }} />
      <span style={{ position:'absolute', bottom:-1, right:-1, width:6, height:6, background:'var(--ink)' }} />

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:11 }}>
          <span style={{ fontSize:28, lineHeight:1 }}>{job.logo || '🚀'}</span>
          <div>
            <p style={{ ...serif, fontSize:15, color:'var(--text)', margin:0, lineHeight:1.25 }}>{job.role}</p>
            <p style={{ ...mono, fontSize:10, color:'var(--text-dim)', marginTop:4, letterSpacing:'0.04em' }}>{job.stipend} · {job.duration}</p>
          </div>
        </div>
        <span style={{ ...mono, fontSize:9, padding:'2px 8px', fontWeight:500, background:statusStyle.bg, color:statusStyle.color, border:`1px solid ${statusStyle.border}`, textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap', flexShrink:0 }}>
          {statusStyle.label}
        </span>
      </div>

      <div style={{ display:'flex', gap:12, fontSize:10, color:'var(--text-mid)', flexWrap:'wrap' }}>
        <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={10} /> {job.location}</span>
        <span style={{ display:'flex', alignItems:'center', gap:4 }}><Users size={10} /> {job.current_applicants||0}/{job.max_applicants||50}</span>
      </div>

      <div>
        <div style={{ height:3, background:'var(--bg-subtle)', border:'1px solid var(--border-mid)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${Math.min(filled,1)*100}%`, background: filled>0.8 ? 'var(--red)' : filled>0.5 ? 'var(--amber)' : 'var(--blue)', transition:'width 0.4s' }} />
        </div>
      </div>

      <div onClick={e => e.stopPropagation()} style={{ display:'flex', gap:4, marginTop:'auto' }}>
        <button onClick={() => onCopyLink(job)} style={{ ...btnGhost, ...btnSm, flex:1, justifyContent:'center' }}><Link2 size={12} /></button>
        <button onClick={() => onTogglePause(job)} style={{ ...btnGhost, ...btnSm }}>
          {status === 'live' ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button onClick={() => onDelete(job)} style={{ ...btnGhost, ...btnSm, color:'var(--red)', borderColor:'var(--red)' }}><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. TABS
// ═══════════════════════════════════════════════════════════════════════════
function HomeTab({ recruiter, jobs, allApps, onPostRole, onOpenRole }) {
  const liveJobs    = jobs.filter(j => (j.status||(j.is_active?'live':'paused'))==='live');
  const totalApps   = allApps.length;
  const shortlisted = allApps.filter(a => a.status==='shortlisted').length;
  const hired       = allApps.filter(a => a.status==='hired').length;
  const recentJobs  = [...jobs].sort((a,b) => new Date(b.created_at)-new Date(a.created_at)).slice(0,6);
  const firstName   = recruiter.contact_name?.split(' ')[0] || 'recruiter';
  const startupName = recruiter.startups?.name || recruiter.company_name || 'there';

  return (
    <div>
      <PageHeader kicker="Home" title={`Welcome back,`} italic={`${firstName}.`}
        sub={`${liveJobs.length} live roles. ${totalApps} applicants total.`} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:44 }}>
        {[
          { label:'Live roles',   val:String(liveJobs.length).padStart(2,'0') },
          { label:'Applicants',   val:String(totalApps).padStart(2,'0') },
          { label:'Shortlisted',  val:String(shortlisted).padStart(2,'0') },
          { label:'Hires made',   val:String(hired).padStart(2,'0') },
        ].map(s => (
          <HuntCard key={s.label} padding={20}>
            <Kicker>{s.label}</Kicker>
            <div style={{ ...serif, fontSize:44, lineHeight:1, margin:'10px 0 8px', color:'var(--text)' }}>{s.val}</div>
          </HuntCard>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <SectionHead label="Recent roles" />
        <button onClick={onPostRole} style={{ ...btnPrimary, ...btnSm }}>
          <Plus size={12} /> Post a role
        </button>
      </div>

      {recentJobs.length === 0 ? (
        <EmptyState icon="📋" title="No roles posted yet." message="Post your first role to start receiving matched candidates."
          cta={<button onClick={onPostRole} style={{ ...btnPrimary, margin:'0 auto' }}><Plus size={13}/> Post a role</button>} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:12 }}>
          {recentJobs.map(job => {
            const filled = (job.current_applicants||0)/(job.max_applicants||50);
            const status = job.status||(job.is_active?'live':'paused');
            const ss = status==='live'
              ? { color:'var(--blue-deep)', bg:'var(--blue-tint)', border:'var(--blue)', label:'● Live' }
              : { color:'var(--amber)', bg:'var(--amber-tint)', border:'var(--amber)', label:'⏸ Paused' };
            const jobApps = allApps.filter(a => a.job_id === job.id);
            return (
              <div key={job.id} onClick={() => onOpenRole(job)} style={{ background:'var(--bg-card)', border:'1px solid var(--border-mid)', padding:18, cursor:'pointer', transition:'border-color 0.12s', display:'flex', flexDirection:'column', gap:10, position:'relative' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--ink)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border-mid)'}
              >
                <span style={{ position:'absolute', top:-1, left:-1,  width:6, height:6, background:'var(--ink)' }} />
                <span style={{ position:'absolute', bottom:-1, right:-1, width:6, height:6, background:'var(--ink)' }} />
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <span style={{ fontSize:26, lineHeight:1 }}>{job.logo||'🚀'}</span>
                    <div>
                      <p style={{ ...serif, fontSize:14, color:'var(--text)', margin:0, lineHeight:1.25 }}>{job.role}</p>
                      <p style={{ ...mono, fontSize:10, color:'var(--text-dim)', marginTop:3, letterSpacing:'0.04em' }}>{job.stipend} · {job.duration}</p>
                    </div>
                  </div>
                  <span style={{ ...mono, fontSize:9, padding:'2px 7px', fontWeight:500, background:ss.bg, color:ss.color, border:`1px solid ${ss.border}`, whiteSpace:'nowrap', flexShrink:0 }}>{ss.label}</span>
                </div>
                <div style={{ display:'flex', gap:10, fontSize:10, color:'var(--text-mid)' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:3 }}><MapPin size={10}/> {job.location}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:3 }}><Users size={10}/> {job.current_applicants||0}/{job.max_applicants||50}</span>
                </div>
                <div style={{ height:3, background:'var(--bg-subtle)', border:'1px solid var(--border-mid)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(filled,1)*100}%`, background: filled>0.8?'var(--red)':filled>0.5?'var(--amber)':'var(--blue)' }} />
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:4, borderTop:'1px solid var(--line-mid)' }}>
                  <span style={{ fontSize:10, color:'var(--text-dim)' }}>{jobApps.length} applicant{jobApps.length!==1?'s':''}</span>
                  <ChevronRight size={13} style={{ color:'var(--text-dim)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RolesTab({ jobs, onCopyLink, onTogglePause, onDelete, onPostRole, recruiter, showToast, initialOpenJob }) {
  const [subTab, setSubTab] = useState('live');
  const [openJob, setOpenJob] = useState(initialOpenJob || null);

  useEffect(() => { if (initialOpenJob) setOpenJob(initialOpenJob); }, [initialOpenJob]);

  const grouped = {
    live:   jobs.filter(j => (j.status||(j.is_active?'live':'paused'))==='live'),
    paused: jobs.filter(j => (j.status||(j.is_active?'live':'paused'))==='paused'),
    closed: jobs.filter(j => j.status==='closed'),
  };

  if (openJob) return (
    <RoleDetailView job={openJob} onBack={() => setOpenJob(null)} onCopyLink={onCopyLink} recruiter={recruiter} showToast={showToast} />
  );

  return (
    <div>
      <PageHeader kicker="Roles" title="Your" italic="postings."
        action={<button onClick={onPostRole} style={{ ...btnPrimary }}><Plus size={13}/> Post a role</button>} />
      <SubTabStrip
        active={subTab} onChange={setSubTab}
        tabs={[
          { id:'live',   label:'Live',   count:grouped.live.length },
          { id:'paused', label:'Paused', count:grouped.paused.length },
          { id:'closed', label:'Closed', count:grouped.closed.length },
        ]}
      />
      {grouped[subTab].length === 0 ? (
        <EmptyState icon="📋" title={`No ${subTab} roles.`} message="Post a role to start receiving matched candidates."
          cta={subTab==='live' && <button onClick={onPostRole} style={{ ...btnPrimary, margin:'0 auto' }}><Plus size={13}/> Post a role</button>} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:14 }}>
          {grouped[subTab].map(job => (
            <RoleCard key={job.id} job={job} onClick={() => setOpenJob(job)}
              onTogglePause={onTogglePause} onCopyLink={onCopyLink} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function HiringTab({ allApps, onStatusChange }) {
  const [selectedApp, setSelectedApp] = useState(null);
  const stages = [
    { id:'shortlisted', label:'Shortlisted', color:'var(--blue)',  icon:Bookmark },
    { id:'interview',   label:'Interview',   color:'var(--text)',  icon:Phone    },
    { id:'hired',       label:'Hired',       color:'var(--blue)',  icon:Award    },
  ];

  return (
    <div>
      <PageHeader kicker="Pipeline" title="Hiring" italic="pipeline." sub="Track candidates as they move through your process." />
      <div style={{ display:'grid', gridTemplateColumns: selectedApp ? '1fr 1fr 1fr 500px' : 'repeat(3,1fr)', gap:12 }}>
        {stages.map(stage => {
          const candidates = allApps.filter(a => a.status === stage.id);
          const Icon = stage.icon;
          return (
            <div key={stage.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border-mid)', display:'flex', flexDirection:'column', gap:10, minHeight:320 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'var(--ink)', color:'var(--cream)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <Icon size={13} style={{ color:'var(--cream)' }} />
                  <Kicker color="var(--cream)">{stage.label}</Kicker>
                </div>
                <span style={{ ...mono, fontSize:11, color:'var(--cream)' }}>{String(candidates.length).padStart(2,'0')}</span>
              </div>
              <div style={{ padding:'0 10px 10px', display:'grid', gap:8 }}>
                {candidates.length === 0 ? (
                  <p style={{ ...mono, fontSize:11, color:'var(--text-faint)', textAlign:'center', padding:'32px 0' }}>EMPTY</p>
                ) : candidates.map(app => {
                  const s = app.students || {};
                  return (
                    <div key={app.id} onClick={() => setSelectedApp(selectedApp?.id===app.id ? null : app)}
                      style={{ padding:'10px 12px', border:`1px solid ${selectedApp?.id===app.id?'var(--ink)':'var(--border-mid)'}`, background:'var(--bg)', cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'border-color 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='var(--ink)'}
                      onMouseLeave={e => { if(selectedApp?.id!==app.id) e.currentTarget.style.borderColor='var(--border-mid)'; }}
                    >
                      <Avatar name={s.full_name} size={28} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:11, fontWeight:500, color:'var(--text)', margin:0, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.full_name||'Student'}</p>
                        <p style={{ fontSize:9, color:'var(--text-dim)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{app.jobs?.role}</p>
                      </div>
                      <ScoreDisplay score={app.match_score||0} size={12} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {selectedApp && (
          <CandidatePanel app={selectedApp}
            onStatusChange={async (id, status, note) => {
              await onStatusChange(id, status, note);
              setSelectedApp(s => ({ ...s, status, recruiter_message: note || s.recruiter_message }));
            }}
            onClose={() => setSelectedApp(null)} />
        )}
      </div>
    </div>
  );
}

function ProfileTab({ recruiter, onUpdate, showToast }) {
  const [subTab, setSubTab] = useState('startup');
  const isFounder = recruiter.role_in_company === 'founder';
  const startup = recruiter.startups || {};
  return (
    <div>
      <PageHeader kicker="Profile" title="Your" italic="profile." />
      <SubTabStrip active={subTab} onChange={setSubTab} tabs={[{ id:'startup', label:'Startup' }, { id:'recruiter', label:'You' }]} />
      {subTab === 'startup'   && <StartupProfileForm   startup={startup} canEdit={isFounder} onUpdate={onUpdate} showToast={showToast} />}
      {subTab === 'recruiter' && <RecruiterProfileForm recruiter={recruiter}                  onUpdate={onUpdate} showToast={showToast} />}
    </div>
  );
}

function StartupProfileForm({ startup, canEdit, onUpdate, showToast }) {
  const [form, setForm] = useState({ name:startup.name||'', logo_emoji:startup.logo_emoji||'🚀', tagline:startup.tagline||'', about:startup.about||'', website:startup.website||'', industry:startup.industry||'', stage:startup.stage||'', team_size:startup.team_size||'', founded_year:startup.founded_year||'', hq_location:startup.hq_location||'' });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]:v }));
  const save = async () => {
    if (!startup.id) { showToast('No startup linked.','error'); return; }
    setSaving(true);
    try { await updateStartupProfile(startup.id, form); showToast('Startup profile updated'); onUpdate(); }
    catch (e) { showToast(e.message||'Failed','error'); } finally { setSaving(false); }
  };
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-mid)', padding:24, position:'relative' }}>
      <span style={{ position:'absolute', top:-1, left:-1, width:6, height:6, background:'var(--ink)' }} />
      <span style={{ position:'absolute', top:-1, right:-1, width:6, height:6, background:'var(--ink)' }} />
      <span style={{ position:'absolute', bottom:-1, left:-1, width:6, height:6, background:'var(--ink)' }} />
      <span style={{ position:'absolute', bottom:-1, right:-1, width:6, height:6, background:'var(--ink)' }} />

      {!canEdit && (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'var(--amber-tint)', border:'1px solid var(--amber)', marginBottom:18 }}>
          <Lock size={13} style={{ color:'var(--amber)', flexShrink:0 }} />
          <p style={{ ...mono, fontSize:11, color:'var(--amber)', margin:0, letterSpacing:'0.04em' }}>Read-only. Only founders can edit the startup profile.</p>
        </div>
      )}
      <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:22 }}>
        <div>
          <Label>Logo</Label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5, width:152 }}>
            {LOGO_EMOJIS.slice(0,8).map(e => (
              <button key={e} disabled={!canEdit} onClick={() => set('logo_emoji')(e)} style={{ width:34, height:34, fontSize:17, cursor:canEdit?'pointer':'not-allowed', opacity:canEdit?1:0.5, border:`1.5px solid ${form.logo_emoji===e?'var(--ink)':'var(--border-mid)'}`, background:'var(--bg-subtle)' }}>{e}</button>
            ))}
          </div>
        </div>
        <div style={{ flex:1 }}>
          <Label required>Startup name</Label>
          <FocusInput value={form.name} disabled={!canEdit} onChange={e => set('name')(e.target.value)} placeholder="HUNT Labs" />
          <div style={{ height:12 }} />
          <Label>Tagline</Label>
          <FocusInput value={form.tagline} disabled={!canEdit} onChange={e => set('tagline')(e.target.value)} placeholder="Skill-first internships" />
        </div>
      </div>
      <Label>About</Label>
      <FocusTextarea value={form.about} disabled={!canEdit} onChange={e => set('about')(e.target.value)} rows={4} placeholder="What does your startup do?" />
      <div style={{ height:16 }} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div><Label>Website</Label><FocusInput value={form.website} disabled={!canEdit} onChange={e => set('website')(e.target.value)} placeholder="https://…" /></div>
        <div><Label>HQ location</Label><FocusInput value={form.hq_location} disabled={!canEdit} onChange={e => set('hq_location')(e.target.value)} placeholder="Bangalore, India" /></div>
        <div><Label>Industry</Label><FocusInput value={form.industry} disabled={!canEdit} onChange={e => set('industry')(e.target.value)} placeholder="HR Tech / EdTech / SaaS" /></div>
        <div><Label>Stage</Label>
          <FocusSelect value={form.stage} disabled={!canEdit} onChange={e => set('stage')(e.target.value)}>
            <option value="">—</option><option>Pre-seed</option><option>Seed</option><option>Series A</option><option>Series B+</option><option>Bootstrapped</option>
          </FocusSelect>
        </div>
        <div><Label>Team size</Label>
          <FocusSelect value={form.team_size} disabled={!canEdit} onChange={e => set('team_size')(e.target.value)}>
            <option value="">—</option><option>1-10</option><option>11-50</option><option>51-200</option><option>200+</option>
          </FocusSelect>
        </div>
        <div><Label>Founded</Label><FocusInput type="number" value={form.founded_year} disabled={!canEdit} onChange={e => set('founded_year')(e.target.value)} placeholder="2024" /></div>
      </div>
      {canEdit && <div style={{ marginTop:22 }}><button onClick={save} disabled={saving} style={{ ...btnBase, opacity: saving ? 0.5 : 1 }}>{saving ? 'Saving…' : 'Save changes'}</button></div>}
    </div>
  );
}

function RecruiterProfileForm({ recruiter, onUpdate, showToast }) {
  const [form, setForm] = useState({ contact_name:recruiter.contact_name||'', email:recruiter.email||'', phone:recruiter.phone||'', title:recruiter.title||'', linkedin_url:recruiter.linkedin_url||'', bio:recruiter.bio||'', role_in_company:recruiter.role_in_company||'recruiter' });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]:v }));
  const save = async () => {
    setSaving(true);
    try { await updateRecruiterProfile(recruiter.id, form); showToast('Profile updated'); onUpdate(); }
    catch (e) { showToast(e.message||'Failed','error'); } finally { setSaving(false); }
  };
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-mid)', padding:24, maxWidth:560, position:'relative' }}>
      <span style={{ position:'absolute', top:-1, left:-1, width:6, height:6, background:'var(--ink)' }} />
      <span style={{ position:'absolute', top:-1, right:-1, width:6, height:6, background:'var(--ink)' }} />
      <span style={{ position:'absolute', bottom:-1, left:-1, width:6, height:6, background:'var(--ink)' }} />
      <span style={{ position:'absolute', bottom:-1, right:-1, width:6, height:6, background:'var(--ink)' }} />

      <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:28 }}>
        <Avatar name={form.contact_name} size={64} />
        <div>
          <Kicker>Recruiter</Kicker>
          <h3 style={{ ...serif, fontSize:28, margin:'4px 0 4px', lineHeight:1.05, color:'var(--text)' }}>{form.contact_name||'Your name'}</h3>
          <span style={{ ...mono, fontSize:11, color:'var(--text-dim)', letterSpacing:'0.04em' }}>{form.email}</span>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div><Label required>Full name</Label><FocusInput value={form.contact_name} onChange={e => set('contact_name')(e.target.value)} /></div>
        <div><Label>Title</Label><FocusInput value={form.title} onChange={e => set('title')(e.target.value)} placeholder="Head of Talent" /></div>
        <div><Label>Email</Label><FocusInput value={form.email} disabled type="email" /></div>
        <div><Label>Phone</Label><FocusInput value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="+91…" /></div>
        <div><Label>LinkedIn</Label><FocusInput value={form.linkedin_url} onChange={e => set('linkedin_url')(e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
        <div><Label>Role</Label>
          <FocusSelect value={form.role_in_company} onChange={e => set('role_in_company')(e.target.value)}>
            <option value="founder">Founder (full edit access)</option>
            <option value="hiring_manager">Hiring manager</option>
            <option value="recruiter">Recruiter</option>
          </FocusSelect>
        </div>
      </div>
      <div style={{ height:16 }} />
      <Label>Bio</Label>
      <FocusTextarea value={form.bio} onChange={e => set('bio')(e.target.value)} rows={3} placeholder="Short intro that candidates will see when you reach out." />
      <div style={{ marginTop:22 }}>
        <button onClick={save} disabled={saving} style={{ ...btnBase, opacity: saving ? 0.5 : 1 }}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </div>
  );
}

function NetworkTab() {
  return (
    <div>
      <PageHeader kicker="Network" title="Connect with" italic="builders." sub="A private channel for HUNT recruiters is coming — share intern referrals, hiring playbooks, and live snapshots." />
      <EmptyState icon="🌐" title="Coming soon." message="We're building this carefully — quality over quantity, like everything else on HUNT." />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. POST ROLE DRAWER
// ═══════════════════════════════════════════════════════════════════════════
function PostRoleDrawer({ recruiter, open, onClose, onSuccess, showToast }) {
  const [skillInput, setSkillInput] = useState('');
  const [niceInput, setNiceInput]   = useState('');
  const [saving, setSaving]         = useState(false);
  const [form, setForm] = useState(() => ({
    logo: recruiter?.startups?.logo_emoji || '🚀',
    role:'', description:'', stipend:'', duration:'',
    location:'', type:'Paid Internship', visibility:'public',
    required_skills:[], nice_to_have:[],
    max_applicants:50, minimum_match_threshold:50, positions:1,
  }));

  useEffect(() => {
    if (!open) {
      setForm({ logo:recruiter?.startups?.logo_emoji||'🚀', role:'', description:'', stipend:'', duration:'', location:'', type:'Paid Internship', visibility:'public', required_skills:[], nice_to_have:[], max_applicants:50, minimum_match_threshold:50, positions:1 });
    }
  }, [open]);

  const set = k => v => setForm(f => ({ ...f, [k]:v }));
  const addSkill = () => {
    const name = skillInput.trim();
    if (!name || form.required_skills.find(s => s.name.toLowerCase()===name.toLowerCase())) return;
    setForm(f => ({ ...f, required_skills:[...f.required_skills, { name, weight:0.25, level:3 }] }));
    setSkillInput('');
  };
  const removeSkill = name => setForm(f => ({ ...f, required_skills:f.required_skills.filter(s => s.name!==name) }));
  const addNice = () => {
    const name = niceInput.trim();
    if (!name || form.nice_to_have.includes(name)) return;
    setForm(f => ({ ...f, nice_to_have:[...f.nice_to_have, name] }));
    setNiceInput('');
  };

  const handleSubmit = async () => {
    if (!form.role.trim())     return showToast('Role title is required.','error');
    if (!form.stipend.trim())  return showToast('Stipend is required.','error');
    if (!form.duration.trim()) return showToast('Duration is required.','error');
    if (!form.location.trim()) return showToast('Location is required.','error');
    if (form.required_skills.length===0) return showToast('Add at least one required skill.','error');
    setSaving(true);
    try {
      const totalW = form.required_skills.reduce((s,sk) => s+sk.weight, 0);
      const normSkills = form.required_skills.map(sk => ({ ...sk, weight: parseFloat((sk.weight/totalW).toFixed(3)) }));
      const startupName = recruiter.startups?.name || recruiter.company_name || 'Company';
      const slug = `${startupName.toLowerCase().replace(/\s+/g,'-')}-${form.role.toLowerCase().replace(/\s+/g,'-')}-${Date.now()}`;
      await createJob({
        recruiter_id:recruiter.id, company:startupName,
        logo:form.logo, role:form.role.trim(), description:form.description.trim(),
        stipend:form.stipend.trim(), duration:form.duration.trim(), location:form.location.trim(),
        type:form.type, visibility:form.visibility, share_slug:slug,
        required_skills:normSkills, nice_to_have:form.nice_to_have,
        max_applicants:form.max_applicants, minimum_match_threshold:form.minimum_match_threshold,
        positions:form.positions, current_applicants:0, is_active:true, status:'live',
      });
      onSuccess(); onClose();
    } catch (e) { showToast('Failed: '+(e.message||'Unknown error'),'error'); }
    finally { setSaving(false); }
  };

  return (
    <>
      {open && <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(20,19,14,0.55)', zIndex:9000, backdropFilter:'blur(2px)' }} />}
      <div style={{
        position:'fixed', top:0, right:0, bottom:0, width:520,
        background:'var(--bg-card)', borderLeft:'1px solid var(--ink)',
        zIndex:9001, display:'flex', flexDirection:'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '-8px 0 0 0 var(--ink)' : 'none',
      }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border-mid)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <BlinkDot color="var(--blue)" />
              <Kicker color="var(--blue)">New role</Kicker>
            </div>
            <h2 style={{ ...serif, fontSize:22, color:'var(--text)', margin:0, lineHeight:1.05 }}>
              Post a <em style={{ fontStyle:'italic', color:'var(--blue)' }}>role.</em>
            </h2>
          </div>
          <button onClick={onClose} style={{ ...btnGhost, ...btnSm, padding:'8px 10px' }}><X size={14}/></button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:22 }}>
          <SectionHead label="Basics" />
          <div style={{ display:'flex', gap:14, alignItems:'flex-end', marginBottom:16 }}>
            <div style={{ flexShrink:0 }}>
              <Label>Logo</Label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5, width:152 }}>
                {LOGO_EMOJIS.slice(0,8).map(e => (
                  <button key={e} onClick={() => set('logo')(e)} style={{ width:34, height:34, fontSize:17, cursor:'pointer', border:`1.5px solid ${form.logo===e?'var(--ink)':'var(--border-mid)'}`, background:'var(--bg-subtle)' }}>{e}</button>
                ))}
              </div>
            </div>
            <div style={{ flex:1 }}>
              <Label required>Role title</Label>
              <FocusInput value={form.role} onChange={e => set('role')(e.target.value)} placeholder="Backend Engineering Intern" />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <div><Label required>Stipend</Label><FocusInput value={form.stipend} onChange={e => set('stipend')(e.target.value)} placeholder="₹25,000/month" /></div>
            <div><Label required>Duration</Label><FocusInput value={form.duration} onChange={e => set('duration')(e.target.value)} placeholder="3 / 6 months" /></div>
            <div><Label required>Location</Label><FocusInput value={form.location} onChange={e => set('location')(e.target.value)} placeholder="Remote / Mumbai" /></div>
            <div><Label>Type</Label>
              <FocusSelect value={form.type} onChange={e => set('type')(e.target.value)}>
                <option>Paid Internship</option><option>Unpaid Internship</option><option>Contract</option><option>Part-time</option>
              </FocusSelect>
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <Label>Description</Label>
            <FocusTextarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3} placeholder="What will the intern actually work on? Be specific." />
          </div>

          <div style={{ borderTop:'1px solid var(--border-mid)', paddingTop:16, marginBottom:16 }}>
            <SectionHead label="Skills & config" />
            <Label required>Required skills</Label>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <FocusInput value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="React, Node.js, Python…" onKeyDown={e => e.key==='Enter' && (e.preventDefault(), addSkill())} list="skill-suggestions" style={{ flex:1 }} />
              <datalist id="skill-suggestions">{SKILL_OPTIONS.map(s => <option key={s} value={s} />)}</datalist>
              <button onClick={addSkill} style={btnBase}>Add</button>
            </div>
            {form.required_skills.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
                {form.required_skills.map(skill => (
                  <div key={skill.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', border:'1px solid var(--border-mid)', background:'var(--bg-subtle)' }}>
                    <span style={{ fontSize:12, fontWeight:500, color:'var(--text)', flex:1 }}>{skill.name}</span>
                    <span style={{ ...mono, fontSize:10, color:'var(--text-dim)' }}>Level</span>
                    <div style={{ display:'flex', gap:3 }}>
                      {[1,2,3,4,5].map(lv => (
                        <button key={lv} onClick={() => setForm(f => ({ ...f, required_skills:f.required_skills.map(s => s.name===skill.name ? { ...s, level:lv } : s) }))} style={{ width:22, height:22, fontSize:10, fontWeight:600, cursor:'pointer', border:'none', background: skill.level>=lv ? 'var(--ink)' : 'var(--bg-card)', color: skill.level>=lv ? 'var(--cream)' : 'var(--text-dim)', outline: skill.level>=lv ? 'none' : '1px solid var(--border-mid)' }}>{lv}</button>
                      ))}
                    </div>
                    <button onClick={() => removeSkill(skill.name)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--text-dim)', display:'flex', padding:0 }}><X size={14}/></button>
                  </div>
                ))}
              </div>
            )}
            <Label>Nice to have (optional)</Label>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <FocusInput value={niceInput} onChange={e => setNiceInput(e.target.value)} placeholder="Docker, AWS…" onKeyDown={e => e.key==='Enter' && (e.preventDefault(), addNice())} list="skill-suggestions" style={{ flex:1 }} />
              <button onClick={addNice} style={{ ...btnGhost }}>Add</button>
            </div>
            {form.nice_to_have.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
                {form.nice_to_have.map(s => (
                  <span key={s} style={{ display:'flex', alignItems:'center', gap:4, ...mono, fontSize:11, padding:'3px 10px', border:'1px solid var(--border-mid)', color:'var(--text-mid)' }}>
                    {s}
                    <button onClick={() => setForm(f => ({ ...f, nice_to_have:f.nice_to_have.filter(x => x!==s) }))} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--text-dim)', display:'flex', padding:0 }}><X size={10}/></button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <Label>Max applicants</Label>
                <div style={{ display:'flex', gap:4 }}>
                  {[25,50,100].map(n => (
                    <button key={n} onClick={() => set('max_applicants')(n)} style={{ flex:1, padding:'8px', ...mono, fontSize:11, letterSpacing:'0.06em', cursor:'pointer', background: form.max_applicants===n ? 'var(--bg-subtle)' : 'transparent', border:`1px solid ${form.max_applicants===n ? 'var(--ink)' : 'var(--border-mid)'}`, color: form.max_applicants===n ? 'var(--text)' : 'var(--text-mid)', fontWeight: form.max_applicants===n ? 600 : 400 }}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Min match %</Label>
                <div style={{ display:'flex', gap:4 }}>
                  {[40,50,70].map(n => (
                    <button key={n} onClick={() => set('minimum_match_threshold')(n)} style={{ flex:1, padding:'8px', ...mono, fontSize:11, letterSpacing:'0.06em', cursor:'pointer', background: form.minimum_match_threshold===n ? 'var(--bg-subtle)' : 'transparent', border:`1px solid ${form.minimum_match_threshold===n ? 'var(--ink)' : 'var(--border-mid)'}`, color: form.minimum_match_threshold===n ? 'var(--text)' : 'var(--text-mid)', fontWeight: form.minimum_match_threshold===n ? 600 : 400 }}>{n}%</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:'14px 22px', borderTop:'1px solid var(--border-mid)', flexShrink:0, background:'var(--bg-card)' }}>
          <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary, width:'100%', justifyContent:'center', padding:'13px 16px', fontSize:13, opacity: saving ? 0.5 : 1 }}>
            {saving ? 'Posting…' : 'Post role'} {!saving && <ChevronRight size={14}/>}
          </button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 13. SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════════════════
function SettingsModal({ theme, setTheme, onClose, onSignOut }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(20,19,14,0.5)', zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--bg-card)', border:'1px solid var(--ink)', padding:24, maxWidth:480, width:'100%', boxShadow:'8px 8px 0 0 var(--ink)', position:'relative' }}>
        <span style={{ position:'absolute', top:-1, left:-1, width:6, height:6, background:'var(--ink)' }} />
        <span style={{ position:'absolute', top:-1, right:-1, width:6, height:6, background:'var(--ink)' }} />
        <span style={{ position:'absolute', bottom:-1, left:-1, width:6, height:6, background:'var(--ink)' }} />
        <span style={{ position:'absolute', bottom:-1, right:-1, width:6, height:6, background:'var(--ink)' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ ...serif, fontSize:22, color:'var(--text)', margin:0 }}>Settings</h2>
          <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--text-mid)' }}><X size={18}/></button>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:16, borderBottom:'1px solid var(--border-mid)' }}>
          <div>
            <p style={{ fontSize:13, fontWeight:500, color:'var(--text)', margin:0 }}>Appearance</p>
            <p style={{ fontSize:11, color:'var(--text-dim)', margin:'3px 0 0' }}>Light or dark mode.</p>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {['light','dark'].map(t => (
              <button key={t} onClick={() => setTheme(t)} style={{ ...btnBase, ...btnSm, background: theme===t ? 'var(--ink)' : 'transparent', color: theme===t ? 'var(--cream)' : 'var(--text)', borderColor: theme===t ? 'var(--ink)' : 'var(--border-mid)' }}>
                {t==='light' ? <><Sun size={12}/> Light</> : <><Moon size={12}/> Dark</>}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:16 }}>
          <div>
            <p style={{ fontSize:13, fontWeight:500, color:'var(--text)', margin:0 }}>Sign out</p>
            <p style={{ fontSize:11, color:'var(--text-dim)', margin:'3px 0 0' }}>You'll need to log in again.</p>
          </div>
          <button onClick={onSignOut} style={{ ...btnGhost, ...btnSm, color:'var(--red)', borderColor:'var(--red)' }}>
            <LogOut size={12}/> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 14. MAIN SHELL
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
  const [showSettings, setShowSettings]     = useState(false);
  const [showPostDrawer, setShowPostDrawer] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
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

  const handleOpenRole = (job) => { setPendingOpenRole(job); setActiveTab('roles'); };
  const handleTogglePause = async (job) => {
    const status = job.status || (job.is_active ? 'live' : 'paused');
    const next = status === 'live' ? 'paused' : 'live';
    try {
      await updateJob(job.id, { status:next, is_active:next==='live' });
      setJobs(j => j.map(x => x.id===job.id ? { ...x, status:next, is_active:next==='live' } : x));
      showToast(next==='live' ? 'Role resumed' : 'Role paused');
    } catch (e) { showToast(e.message||'Update failed','error'); }
  };
  const handleCopyLink = (job) => {
    const url = `${window.location.origin}/apply/${job.share_slug}`;
    navigator.clipboard.writeText(url).then(() => showToast('Share link copied'));
  };
  const handleDelete = async (job) => {
    if (!window.confirm(`Delete "${job.role}"? This cannot be undone.`)) return;
    try { await deleteJob(job.id); setJobs(j => j.filter(x => x.id!==job.id)); showToast('Role deleted'); }
    catch (e) { showToast(e.message||'Delete failed','error'); }
  };
  const handleStatusChange = async (appId, status, note = '') => {
    const app = allApps.find(a => a.id===appId);
    try {
      await updateApplicationStatus(appId, status, app?.students?.id, note,
        { role:app?.jobs?.role, company:app?.jobs?.company || recruiter?.startups?.name });
      setAllApps(a => a.map(x => x.id===appId ? { ...x, status, recruiter_message:note||x.recruiter_message } : x));
      const labels = { shortlisted:'Shortlisted ✓', interview:'Moved to interview', hired:'Hired!', rejected:'Passed' };
      showToast(labels[status] || 'Updated');
    } catch (e) { showToast(e.message||'Update failed','error'); }
  };
  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', fontFamily:"'Inter', system-ui, sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center', marginBottom:20 }}>
          <PixelMark size={22} color="var(--blue)" />
          <span style={{ ...mono, fontSize:14, fontWeight:600, letterSpacing:'0.18em', color:'var(--text)' }}>HUNT</span>
        </div>
        <p style={{ ...mono, fontSize:11, color:'var(--text-dim)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Loading dashboard…</p>
      </div>
    </div>
  );

  if (!recruiter) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', fontFamily:"'Inter', system-ui, sans-serif" }}>
      <div style={{ textAlign:'center', maxWidth:400, padding:24 }}>
        <div style={{ ...mono, fontSize:36, marginBottom:12 }}>👋</div>
        <p style={{ ...serif, fontSize:20, color:'var(--text)', marginBottom:8 }}>Finish setting up your account</p>
        <p style={{ fontSize:13, color:'var(--text-dim)' }}>Complete onboarding to continue.</p>
      </div>
    </div>
  );

  const initials = recruiter.contact_name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || '?';

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)', fontFamily:"'Inter', system-ui, sans-serif", display:'flex', WebkitFontSmoothing:'antialiased' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes huntFadeDown { from { opacity:0; transform:translateX(-50%) translateY(-6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes hunt-blink   { 0%,70% { opacity:1; } 71%,100% { opacity:0.1; } }
        @keyframes hunt-fade-in { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; }
        button:disabled { opacity:0.4; cursor:not-allowed; }
        ::-webkit-scrollbar { width:8px; height:8px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:var(--border-mid); border-radius:0; }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {showSettings && <SettingsModal theme={theme} setTheme={t => { setTheme(t); applyTokens(t); }} onClose={() => setShowSettings(false)} onSignOut={handleSignOut} />}
      {recruiter && (
        <PostRoleDrawer recruiter={recruiter} open={showPostDrawer} onClose={() => setShowPostDrawer(false)} showToast={showToast}
          onSuccess={async () => { await refreshAll(); showToast('Role posted! 🚀'); setActiveTab('roles'); }} />
      )}

      {/* SIDEBAR */}
      <aside style={{ width:220, flexShrink:0, height:'100vh', position:'sticky', top:0, borderRight:'1px solid var(--border-mid)', background:'var(--bg)', display:'flex', flexDirection:'column', padding:'22px 16px' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 8px 22px' }}>
          <PixelMark size={18} color="var(--blue)" />
          <span style={{ ...mono, fontSize:12, fontWeight:600, letterSpacing:'0.18em', color:'var(--text)' }}>HUNT</span>
        </div>

        {/* Post role CTA */}
        <button onClick={() => setShowPostDrawer(true)} style={{ ...btnPrimary, marginBottom:22, padding:'10px 14px', fontSize:11, width:'100%', justifyContent:'center' }}>
          <Plus size={12}/> Post a role
        </button>

        <Kicker color="var(--text-faint)" style={{ display:'block', marginBottom:10 }}>Navigate</Kicker>

        <nav style={{ display:'flex', flexDirection:'column', gap:2, flex:1 }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const sel = activeTab === id;
            return (
              <button key={id} onClick={() => { setActiveTab(id); if(id!=='roles') setPendingOpenRole(null); }} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'9px 10px',
                border:'none', borderLeft:`2px solid ${sel ? 'var(--blue)' : 'transparent'}`,
                background: sel ? 'var(--bg-subtle)' : 'transparent',
                color: sel ? 'var(--text)' : 'var(--text-dim)',
                ...mono, fontSize:11.5, letterSpacing:'0.08em', textTransform:'uppercase',
                fontWeight: sel ? 600 : 500,
                cursor:'pointer', textAlign:'left',
                transition:'background 0.12s, color 0.12s',
              }}>
                <Icon size={14} style={{ color: sel ? 'var(--blue)' : 'var(--text-dim)', flexShrink:0 }} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div>
          <div style={{ padding:'9px 11px', border:'1px solid var(--border-mid)', background:'var(--bg-subtle)', marginBottom:8 }}>
            <Kicker style={{ display:'block', marginBottom:2 }}>Company</Kicker>
            <p style={{ fontSize:11, fontWeight:600, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', margin:0 }}>
              {recruiter.startups?.name || recruiter.company_name || 'Your startup'}
            </p>
          </div>
          <div style={{ display:'flex', gap:4, marginBottom:6 }}>
            <button onClick={() => setTheme(t => { const n = t==='light'?'dark':'light'; applyTokens(n); return n; })} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid var(--border-mid)', cursor:'pointer', padding:7, color:'var(--text-dim)', transition:'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background='none'}>
              {theme==='light' ? <Moon size={13}/> : <Sun size={13}/>}
            </button>
            <button onClick={() => setShowSettings(true)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid var(--border-mid)', cursor:'pointer', padding:7, color:'var(--text-dim)', transition:'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background='none'}>
              <Bell size={13}/>
            </button>
          </div>
          <div onClick={() => setShowAccountMenu(p => !p)} style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 11px', cursor:'pointer', border:'1px solid transparent', transition:'background 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.background='var(--bg-subtle)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <Avatar name={recruiter.contact_name} size={26} />
            <div style={{ overflow:'hidden', flex:1 }}>
              <p style={{ fontSize:11, fontWeight:600, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', margin:0 }}>{recruiter.contact_name}</p>
              <p style={{ ...mono, fontSize:10, color:'var(--text-dim)', margin:0, textTransform:'capitalize', letterSpacing:'0.04em' }}>{recruiter.role_in_company||'Recruiter'}</p>
            </div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" style={{ flexShrink:0, transform: showAccountMenu?'rotate(180deg)':'none', transition:'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {showAccountMenu && (
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--ink)', boxShadow:'4px 4px 0 0 var(--ink)', overflow:'hidden' }}>
              <div style={{ padding:'10px 12px', borderBottom:'1px solid var(--border-mid)' }}>
                <Kicker style={{ display:'block', marginBottom:2 }}>Signed in as</Kicker>
                <p style={{ ...mono, fontSize:11, fontWeight:600, color:'var(--blue)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{recruiter.email||recruiter.contact_name}</p>
              </div>
              {[
                { label:'Profile',  action:() => { setActiveTab('profile'); setShowAccountMenu(false); } },
                { label:'Settings', action:() => { setShowSettings(true); setShowAccountMenu(false); } },
                { label:'Support',  action:() => { window.open('mailto:support@hunt.so'); setShowAccountMenu(false); } },
              ].map(item => (
                <button key={item.label} onClick={item.action} style={{ display:'block', width:'100%', textAlign:'left', padding:'9px 12px', fontSize:12, color:'var(--text-mid)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', borderBottom:'1px solid var(--line-mid)', transition:'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}>
                  {item.label}
                </button>
              ))}
              <button onClick={handleSignOut} style={{ display:'block', width:'100%', textAlign:'left', padding:'9px 12px', fontSize:12, color:'var(--red)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', transition:'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background='var(--red-tint)'}
                onMouseLeave={e => e.currentTarget.style.background='none'}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex:1, minWidth:0, overflowY:'auto', maxHeight:'100vh' }}>
        <div style={{ padding:'40px 48px 80px', maxWidth:1280, margin:'0 auto', animation:'hunt-fade-in 0.3s ease' }}>
          {activeTab === 'home'    && <HomeTab recruiter={recruiter} jobs={jobs} allApps={allApps} onPostRole={() => setShowPostDrawer(true)} onOpenRole={handleOpenRole} />}
          {activeTab === 'roles'   && <RolesTab jobs={jobs} onCopyLink={handleCopyLink} onTogglePause={handleTogglePause} onDelete={handleDelete} onPostRole={() => setShowPostDrawer(true)} recruiter={recruiter} showToast={showToast} initialOpenJob={pendingOpenRole} />}
          {activeTab === 'hiring'  && <HiringTab allApps={allApps} onStatusChange={handleStatusChange} />}
          {activeTab === 'profile' && <ProfileTab recruiter={recruiter} onUpdate={refreshRecruiter} showToast={showToast} />}
          {activeTab === 'network' && <NetworkTab />}
        </div>
      </main>
    </div>
  );
}
