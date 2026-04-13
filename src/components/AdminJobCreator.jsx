// AdminDashboard.jsx — HUNT Enhanced Admin Dashboard
// Matches AdminJobCreator theme exactly. Light/dark toggle included.

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Building2, Briefcase, Search, X, Github, ExternalLink,
  CheckCircle2, Star, BarChart2, Activity, Target, Calendar,
  Mail, MapPin, Globe, ArrowUpRight, ArrowDownRight, Minus,
  Sun, Moon, Eye, EyeOff,
} from 'lucide-react';
import { supabase } from '../services/supabase';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD     = 'hunt2026';
const ADMIN_RECRUITER_ID = '78b5cea0-ee99-49f8-8cef-d72a5199f5c3';

// ─── THEMES — light matches AdminJobCreator exactly ───────────────────────────
const THEMES = {
  light: {
    bg:          '#FAFAF8',
    surface:     '#FFFFFF',
    surfaceAlt:  '#F5F5F2',
    border:      '#EBEBEA',
    borderHigh:  '#D6D6D3',
    text:        '#0A0A0A',
    muted:       '#9B9B97',
    sub:         '#5A5A56',
    accent:      '#D85A30',
    accentSoft:  'rgba(216,90,48,0.08)',
    green:       '#1A7A4A',
    greenSoft:   '#E8F5EE',
    greenBorder: 'rgba(26,122,74,0.25)',
    blue:        '#2563EB',
    blueSoft:    'rgba(37,99,235,0.08)',
    blueBorder:  'rgba(37,99,235,0.2)',
    amber:       '#92600A',
    amberSoft:   '#FDF3E3',
    amberBorder: 'rgba(146,96,10,0.25)',
    red:         '#C0392B',
    redSoft:     '#FDECEA',
    redBorder:   'rgba(192,57,43,0.25)',
    purple:      '#6D28D9',
    purpleSoft:  'rgba(109,40,217,0.08)',
    navBg:       '#FFFFFF',
    inputBg:     '#F5F5F2',
  },
  dark: {
    bg:          '#0E0E0F',
    surface:     '#16161A',
    surfaceAlt:  '#1E1E24',
    border:      'rgba(255,255,255,0.07)',
    borderHigh:  'rgba(255,255,255,0.13)',
    text:        '#F0EEE8',
    muted:       '#7A7A80',
    sub:         '#A0A09A',
    accent:      '#D85A30',
    accentSoft:  'rgba(216,90,48,0.15)',
    green:       '#2ECC85',
    greenSoft:   'rgba(46,204,133,0.12)',
    greenBorder: 'rgba(46,204,133,0.3)',
    blue:        '#4A9EFF',
    blueSoft:    'rgba(74,158,255,0.12)',
    blueBorder:  'rgba(74,158,255,0.3)',
    amber:       '#F0A830',
    amberSoft:   'rgba(240,168,48,0.12)',
    amberBorder: 'rgba(240,168,48,0.3)',
    red:         '#E55454',
    redSoft:     'rgba(229,84,84,0.12)',
    redBorder:   'rgba(229,84,84,0.3)',
    purple:      '#A78BFA',
    purpleSoft:  'rgba(167,139,250,0.12)',
    navBg:       '#16161A',
    inputBg:     '#1E1E24',
  },
};

const font  = "'DM Sans', system-ui, sans-serif";
const serif = "Georgia, 'Times New Roman', serif";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
  { id: 'S001', full_name: 'Priya Sharma',   email: 'priya@vjti.ac.in',  college: 'VJTI Mumbai',    year: 3, city: 'Mumbai',    profile_completeness: 92, hunt_score: 78, status: 'active',     created_at: '2026-01-15', skills: [{ name: 'React', level: 4 }, { name: 'Node.js', level: 3 }, { name: 'Python', level: 4 }, { name: 'PostgreSQL', level: 3 }], github_url: 'https://github.com', linkedin_url: 'https://linkedin.com', applications: 3, interviews: 2, placed: false, preferred_roles: ['Full Stack', 'Backend'],     availability: 'Immediate'   },
  { id: 'S002', full_name: 'Rahul Verma',    email: 'rahul@nit.ac.in',   college: 'NIT Nagpur',     year: 3, city: 'Nagpur',    profile_completeness: 76, hunt_score: 61, status: 'active',     created_at: '2026-01-18', skills: [{ name: 'React', level: 3 }, { name: 'MongoDB', level: 3 }, { name: 'JavaScript', level: 4 }],                                                    github_url: 'https://github.com', linkedin_url: null,                       applications: 2, interviews: 1, placed: false, preferred_roles: ['Frontend'],              availability: 'In 1 month'  },
  { id: 'S003', full_name: 'Ananya Singh',   email: 'ananya@bits.ac.in', college: 'BITS Pilani',    year: 4, city: 'Pilani',    profile_completeness: 98, hunt_score: 91, status: 'placed',     created_at: '2026-01-10', skills: [{ name: 'Python', level: 5 }, { name: 'ML', level: 4 }, { name: 'TensorFlow', level: 4 }, { name: 'SQL', level: 4 }],                           github_url: 'https://github.com', linkedin_url: 'https://linkedin.com', applications: 4, interviews: 3, placed: true,  preferred_roles: ['ML Engineer', 'Data Science'], availability: 'Placed'      },
  { id: 'S004', full_name: 'Karan Mehta',    email: 'karan@coep.ac.in',  college: 'COEP Pune',      year: 3, city: 'Pune',      profile_completeness: 55, hunt_score: 42, status: 'incomplete', created_at: '2026-02-02', skills: [{ name: 'HTML', level: 3 }, { name: 'CSS', level: 2 }],                                                                                             github_url: null,                 linkedin_url: null,                       applications: 0, interviews: 0, placed: false, preferred_roles: ['Frontend'],              availability: 'Immediate'   },
  { id: 'S005', full_name: 'Divya Nair',     email: 'divya@spit.ac.in',  college: 'SPIT Mumbai',    year: 3, city: 'Mumbai',    profile_completeness: 88, hunt_score: 73, status: 'active',     created_at: '2026-01-22', skills: [{ name: 'React Native', level: 3 }, { name: 'Flutter', level: 3 }, { name: 'Firebase', level: 3 }],                                            github_url: 'https://github.com', linkedin_url: 'https://linkedin.com', applications: 2, interviews: 1, placed: false, preferred_roles: ['Mobile Dev'],            availability: 'Immediate'   },
  { id: 'S006', full_name: 'Arjun Patel',    email: 'arjun@ldrp.ac.in',  college: 'LDRP Ahmedabad', year: 4, city: 'Ahmedabad', profile_completeness: 81, hunt_score: 68, status: 'active',     created_at: '2026-01-30', skills: [{ name: 'Node.js', level: 4 }, { name: 'Docker', level: 3 }, { name: 'AWS', level: 2 }, { name: 'PostgreSQL', level: 3 }],                   github_url: 'https://github.com', linkedin_url: 'https://linkedin.com', applications: 3, interviews: 2, placed: false, preferred_roles: ['Backend', 'DevOps'],     availability: 'In 2 weeks'  },
  { id: 'S007', full_name: 'Sneha Kulkarni', email: 'sneha@mit.ac.in',   college: 'MIT Aurangabad', year: 3, city: 'Aurangabad', profile_completeness: 94, hunt_score: 82, status: 'placed',     created_at: '2026-01-08', skills: [{ name: 'React', level: 4 }, { name: 'Node.js', level: 4 }, { name: 'PostgreSQL', level: 3 }, { name: 'TypeScript', level: 3 }],               github_url: 'https://github.com', linkedin_url: 'https://linkedin.com', applications: 5, interviews: 3, placed: true,  preferred_roles: ['Full Stack'],            availability: 'Placed'      },
  { id: 'S008', full_name: 'Vikram Joshi',   email: 'vikram@gec.ac.in',  college: 'GEC Bilimora',   year: 3, city: 'Surat',     profile_completeness: 67, hunt_score: 54, status: 'active',     created_at: '2026-02-10', skills: [{ name: 'Python', level: 3 }, { name: 'Django', level: 2 }, { name: 'SQL', level: 3 }],                                                         github_url: null,                 linkedin_url: 'https://linkedin.com', applications: 1, interviews: 0, placed: false, preferred_roles: ['Backend'],              availability: 'Immediate'   },
];

const MOCK_STARTUPS = [
  { id: 'R001', company: 'TechFlow AI', logo: '🚀', contact_name: 'Rohan Kapoor',   email: 'rohan@techflow.ai',    website: 'techflow.ai',    city: 'Bangalore', stage: 'Series A',     size: '50-100', status: 'active',  verified: true,  jobs_posted: 2, total_applicants: 47, hires_made: 1, created_at: '2026-01-12', industries: ['AI/ML', 'Analytics'],  description: 'AI-powered analytics for enterprise teams'     },
  { id: 'R002', company: 'DataMinds',   logo: '📊', contact_name: 'Preethi Suresh', email: 'preethi@dataminds.io', website: 'dataminds.io',   city: 'Bangalore', stage: 'Seed',         size: '10-50',  status: 'active',  verified: true,  jobs_posted: 1, total_applicants: 45, hires_made: 2, created_at: '2026-01-20', industries: ['Data Science', 'NLP'], description: 'NLP models for customer sentiment analysis'    },
  { id: 'R003', company: 'DesignStack', logo: '🎨', contact_name: 'Amit Soni',      email: 'amit@designstack.co',  website: 'designstack.co', city: 'Mumbai',    stage: 'Bootstrapped', size: '10-50',  status: 'active',  verified: false, jobs_posted: 1, total_applicants: 12, hires_made: 0, created_at: '2026-02-01', industries: ['Design', 'SaaS'],      description: 'Design tools for creative agencies'           },
  { id: 'R004', company: 'CloudScale',  logo: '☁️', contact_name: 'Nisha Malhotra', email: 'nisha@cloudscale.dev', website: 'cloudscale.dev', city: 'Hyderabad', stage: 'Series A',     size: '50-100', status: 'active',  verified: true,  jobs_posted: 1, total_applicants: 38, hires_made: 1, created_at: '2026-01-25', industries: ['DevOps', 'Cloud'],     description: 'Automated deployment pipelines'               },
  { id: 'R005', company: 'FinEdge',     logo: '💰', contact_name: 'Saurabh Gupta',  email: 'saurabh@finedge.in',   website: 'finedge.in',     city: 'Mumbai',    stage: 'Pre-seed',     size: '1-10',   status: 'pending', verified: false, jobs_posted: 0, total_applicants: 0,  hires_made: 0, created_at: '2026-02-15', industries: ['Fintech'],             description: 'Personal finance for millennials'             },
  { id: 'R006', company: 'EduPilot',    logo: '🎓', contact_name: 'Meera Krishnan', email: 'meera@edupilot.in',    website: 'edupilot.in',    city: 'Chennai',   stage: 'Seed',         size: '10-50',  status: 'active',  verified: true,  jobs_posted: 2, total_applicants: 29, hires_made: 1, created_at: '2026-01-18', industries: ['EdTech'],              description: 'AI tutoring for tier-2 college students'      },
];

const MOCK_JOBS = [
  { id: 'J001', company: 'TechFlow AI', logo: '🚀', role: 'Backend Engineering Intern', stipend: '₹25,000/mo', location: 'Remote',          applicants: 23, max: 50, is_active: true,  duration: '6 months' },
  { id: 'J002', company: 'DataMinds',   logo: '📊', role: 'ML Engineering Intern',       stipend: '₹30,000/mo', location: 'Bangalore',       applicants: 45, max: 50, is_active: true,  duration: '6 months' },
  { id: 'J003', company: 'DesignStack', logo: '🎨', role: 'Full Stack Developer Intern', stipend: '₹20,000/mo', location: 'Mumbai (Hybrid)', applicants: 12, max: 50, is_active: true,  duration: '3 months' },
  { id: 'J004', company: 'CloudScale',  logo: '☁️', role: 'DevOps Intern',               stipend: '₹28,000/mo', location: 'Remote',          applicants: 38, max: 50, is_active: false, duration: '6 months' },
  { id: 'J005', company: 'EduPilot',    logo: '🎓', role: 'React Developer Intern',      stipend: '₹18,000/mo', location: 'Chennai',         applicants: 29, max: 40, is_active: true,  duration: '3 months' },
  { id: 'J006', company: 'EduPilot',    logo: '🎓', role: 'Content & Marketing Intern',  stipend: '₹15,000/mo', location: 'Remote',          applicants: 0,  max: 30, is_active: true,  duration: '2 months' },
];

// ─── TINY HELPERS ─────────────────────────────────────────────────────────────
const initials    = (name) => (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
const scoreColor  = (s, T) => s >= 75 ? T.green  : s >= 50 ? T.amber  : T.red;
const scoreBg     = (s, T) => s >= 75 ? T.greenSoft : s >= 50 ? T.amberSoft : T.redSoft;
const scoreBorder = (s, T) => s >= 75 ? T.greenBorder : s >= 50 ? T.amberBorder : T.redBorder;

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
function SectionLabel({ children, T }) {
  return <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 12, margin: '0 0 12px' }}>{children}</p>;
}

function Avatar({ name, size = 36, T }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: T.blueSoft, border: `1.5px solid ${T.blueBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size * 0.3), fontWeight: 600, color: T.blue, flexShrink: 0 }}>
      {initials(name)}
    </div>
  );
}

function Badge({ children, color, bg, border }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 20, border: `1px solid ${border || color + '40'}`, background: bg || 'transparent', color, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, sub, trend, color, icon: Icon, T }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
        {Icon && <Icon size={14} color={T.muted} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: serif, fontSize: 28, color: color || T.text, fontWeight: 400, lineHeight: 1 }}>{value}</span>
        {trend !== undefined && (
          <span style={{ fontSize: 11, color: trend >= 0 ? T.green : T.red, display: 'flex', alignItems: 'center', gap: 2 }}>
            {trend > 0 ? <ArrowUpRight size={11} /> : trend < 0 ? <ArrowDownRight size={11} /> : <Minus size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {sub && <span style={{ fontSize: 11, color: T.muted }}>{sub}</span>}
    </div>
  );
}

function SearchBar({ value, onChange, placeholder, T }) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '8px 12px 8px 30px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 13, fontFamily: font, outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = T.accent}
        onBlur={e => e.target.style.borderColor = T.border}
      />
    </div>
  );
}

function FilterPill({ active, onClick, children, T }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${active ? T.accent : T.border}`, background: active ? T.accentSoft : 'transparent', color: active ? T.accent : T.muted, fontSize: 11, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' }}>
      {children}
    </button>
  );
}

// ─── PASSWORD GATE ────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);
  const check = () => { if (val === ADMIN_PASSWORD) onUnlock(); else { setErr(true); setTimeout(() => setErr(false), 1200); } };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8', fontFamily: font }}>
      <div style={{ background: '#fff', border: '1px solid #EBEBEA', borderRadius: 12, padding: '36px 40px', width: 360, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 400, color: '#0A0A0A', marginBottom: 6 }}>Admin access</h2>
        <p style={{ fontSize: 13, color: '#9B9B97', marginBottom: 24 }}>HUNT internal tools</p>
        <input type="password" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} placeholder="Enter password" autoFocus
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, textAlign: 'center', border: `1px solid ${err ? '#C0392B' : '#EBEBEA'}`, background: '#F5F5F2', color: '#0A0A0A', fontSize: 13, fontFamily: font, outline: 'none', boxSizing: 'border-box', marginBottom: 10, transition: 'border-color 0.2s' }}
        />
        {err && <p style={{ fontSize: 12, color: '#C0392B', marginBottom: 8 }}>Wrong password</p>}
        <button onClick={check} style={{ width: '100%', padding: 11, borderRadius: 8, border: 'none', background: '#D85A30', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: font }}>Enter</button>
      </div>
    </div>
  );
}

// ─── STUDENT DETAIL PANEL ────────────────────────────────────────────────────
function StudentDetail({ student: s, onClose, T }) {
  const sc = scoreColor(s.hunt_score, T);
  const sb = scoreBg(s.hunt_score, T);
  const sbd = scoreBorder(s.hunt_score, T);
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', position: 'sticky', top: 76 }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionLabel T={T}>Student profile</SectionLabel>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.muted, display: 'flex' }}><X size={14} /></button>
      </div>
      <div style={{ padding: 18, overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
        {/* Identity row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <Avatar name={s.full_name} size={44} T={T} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: T.text, margin: 0 }}>{s.full_name}</p>
            <p style={{ fontSize: 11, color: T.muted, margin: '2px 0 6px' }}>{s.college} · Year {s.year}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <Badge color={s.status === 'placed' ? T.green : s.status === 'incomplete' ? T.amber : T.blue}
                bg={s.status === 'placed' ? T.greenSoft : s.status === 'incomplete' ? T.amberSoft : T.blueSoft}
                border={s.status === 'placed' ? T.greenBorder : s.status === 'incomplete' ? T.amberBorder : T.blueBorder}>
                {s.status === 'placed' ? '✓ Placed' : s.status === 'incomplete' ? '⚠ Incomplete' : '● Active'}
              </Badge>
              <Badge color={T.muted} border={T.border}>{s.city}</Badge>
            </div>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: 10, background: sb, border: `1.5px solid ${sbd}`, textAlign: 'center', flexShrink: 0 }}>
            <p style={{ fontFamily: serif, fontSize: 22, color: sc, margin: 0, lineHeight: 1 }}>{s.hunt_score}</p>
            <p style={{ fontSize: 9, color: T.muted, margin: '2px 0 0' }}>HUNT score</p>
          </div>
        </div>

        {/* Profile bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: T.muted }}>Profile completeness</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: T.text }}>{s.profile_completeness}%</span>
          </div>
          <div style={{ height: 3, background: T.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${s.profile_completeness}%`, background: scoreColor(s.profile_completeness, T), borderRadius: 2 }} />
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[{ label: 'Applied', val: s.applications, color: T.blue }, { label: 'Interviews', val: s.interviews, color: T.amber }, { label: 'Placed', val: s.placed ? '✓' : '—', color: s.placed ? T.green : T.muted }].map(({ label, val, color }) => (
            <div key={label} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: serif, fontSize: 18, color, lineHeight: 1, marginBottom: 3 }}>{val}</div>
              <div style={{ fontSize: 9, color: T.muted, letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Skills */}
        {s.skills?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <SectionLabel T={T}>Skills</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {s.skills.map((sk, i) => (
                <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: T.blueSoft, border: `1px solid ${T.blueBorder}`, color: T.blue }}>
                  {sk.name} <span style={{ opacity: 0.6 }}>L{sk.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preferred roles */}
        {s.preferred_roles?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <SectionLabel T={T}>Preferred roles</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {s.preferred_roles.map((r, i) => <Badge key={i} color={T.purple} bg={T.purpleSoft}>{r}</Badge>)}
            </div>
          </div>
        )}

        {/* Contact */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, marginBottom: 12 }}>
          <SectionLabel T={T}>Contact</SectionLabel>
          <a href={`mailto:${s.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.muted, textDecoration: 'none', marginBottom: 8 }}><Mail size={11} />{s.email}</a>
          <div style={{ display: 'flex', gap: 6 }}>
            {s.github_url   && <a href={s.github_url}   target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.sub, padding: '4px 9px', borderRadius: 20, border: `1px solid ${T.border}`, textDecoration: 'none' }}><Github size={11} /> GitHub</a>}
            {s.linkedin_url && <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.sub, padding: '4px 9px', borderRadius: 20, border: `1px solid ${T.border}`, textDecoration: 'none' }}><ExternalLink size={11} /> LinkedIn</a>}
          </div>
        </div>

        {/* Availability */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
          <Calendar size={11} color={T.muted} />
          <span style={{ fontSize: 11, color: T.muted }}>Availability:</span>
          <span style={{ fontSize: 11, color: T.text, fontWeight: 500 }}>{s.availability}</span>
        </div>
      </div>
    </div>
  );
}

// ─── STARTUP DETAIL PANEL ────────────────────────────────────────────────────
function StartupDetail({ startup: r, onClose, T, onVerify, onToggle }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', position: 'sticky', top: 76 }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionLabel T={T}>Startup profile</SectionLabel>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.muted, display: 'flex' }}><X size={14} /></button>
      </div>
      <div style={{ padding: 18, overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: T.surfaceAlt, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{r.logo}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: T.text, margin: 0 }}>{r.company}</p>
              {r.verified && <span style={{ fontSize: 10, color: T.blue, background: T.blueSoft, padding: '1px 6px', borderRadius: 8, border: `1px solid ${T.blueBorder}` }}>✓ Verified</span>}
            </div>
            <p style={{ fontSize: 11, color: T.muted, margin: '0 0 6px' }}>{r.description}</p>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Badge color={r.status === 'active' ? T.green : T.amber} bg={r.status === 'active' ? T.greenSoft : T.amberSoft} border={r.status === 'active' ? T.greenBorder : T.amberBorder}>{r.status === 'active' ? '● Active' : '⟳ Pending'}</Badge>
              <Badge color={T.muted} border={T.border}>{r.stage}</Badge>
              <Badge color={T.muted} border={T.border}>{r.size} emp</Badge>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[{ label: 'Jobs', val: r.jobs_posted, color: T.accent }, { label: 'Applicants', val: r.total_applicants, color: T.blue }, { label: 'Hires', val: r.hires_made, color: T.green }].map(({ label, val, color }) => (
            <div key={label} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: serif, fontSize: 20, color, lineHeight: 1, marginBottom: 3 }}>{val}</div>
              <div style={{ fontSize: 9, color: T.muted }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Industries */}
        {r.industries?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <SectionLabel T={T}>Industries</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {r.industries.map((ind, i) => <Badge key={i} color={T.purple} bg={T.purpleSoft}>{ind}</Badge>)}
            </div>
          </div>
        )}

        {/* Contact */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, marginBottom: 16 }}>
          <SectionLabel T={T}>Contact</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.text }}><Users size={11} color={T.muted} />{r.contact_name}</div>
            <a href={`mailto:${r.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.muted, textDecoration: 'none' }}><Mail size={11} />{r.email}</a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.muted }}><MapPin size={11} />{r.city}</div>
            {r.website && <a href={`https://${r.website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.accent, textDecoration: 'none' }}><Globe size={11} />{r.website}</a>}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button onClick={() => onVerify && onVerify(r)} style={{ padding: '9px', borderRadius: 8, border: `1px solid ${T.greenBorder}`, background: T.greenSoft, color: T.green, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: font }}>
            {r.verified ? '✓ Verified' : 'Verify startup'}
          </button>
          <button onClick={() => onToggle && onToggle(r)} style={{ padding: '9px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.sub, fontSize: 11, cursor: 'pointer', fontFamily: font }}>
            {r.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ students, startups, T }) {
  const total     = students.length;
  const placed    = students.filter(s => s.placed).length;
  const active    = students.filter(s => s.status === 'active').length;
  const incomplete= students.filter(s => s.profile_completeness < 70).length;
  const rTotal    = startups.length;
  const rActive   = startups.filter(r => r.status === 'active').length;
  const rVerified = startups.filter(r => r.verified).length;
  const totalJobs = startups.reduce((s, r) => s + r.jobs_posted, 0);
  const totalApps = startups.reduce((s, r) => s + r.total_applicants, 0);
  const totalHires= startups.reduce((s, r) => s + r.hires_made, 0);
  const pRate     = total > 0 ? Math.round((placed / total) * 100) : 0;
  const avgScore  = Math.round(students.reduce((s, st) => s + st.hunt_score, 0) / (total || 1));
  const avgComp   = Math.round(students.reduce((s, st) => s + st.profile_completeness, 0) / (total || 1));

  const skillCounts = {};
  students.forEach(s => s.skills?.forEach(sk => { skillCounts[sk.name] = (skillCounts[sk.name] || 0) + 1; }));
  const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const cityCounts = {};
  students.forEach(s => { cityCounts[s.city] = (cityCounts[s.city] || 0) + 1; });
  const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const card = (props) => <StatCard {...props} T={T} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <SectionLabel T={T}>Platform overview</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {card({ label: 'Total students',  value: total,        trend: 12, icon: Users,     color: T.blue,   sub: `${active} active`      })}
          {card({ label: 'Startups',        value: rTotal,       trend: 8,  icon: Building2, color: T.accent, sub: `${rActive} active`     })}
          {card({ label: 'Jobs posted',     value: totalJobs,    trend: 5,  icon: Briefcase, color: T.purple, sub: `${totalApps} apps`     })}
          {card({ label: 'Placement rate',  value: `${pRate}%`,  trend: 3,  icon: Target,    color: T.green,  sub: `${totalHires} hires`   })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {card({ label: 'Avg HUNT score',     value: avgScore,         icon: Star,         color: T.amber  })}
        {card({ label: 'Avg profile',        value: `${avgComp}%`,    icon: Activity,     color: T.blue,   sub: `${incomplete} incomplete` })}
        {card({ label: 'Verified startups',  value: rVerified,        icon: CheckCircle2, color: T.green,  sub: `of ${rTotal} total`       })}
        {card({ label: 'Total applications', value: totalApps,        icon: BarChart2,    color: T.purple, sub: 'this month'               })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top skills */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
          <SectionLabel T={T}>Top skills on platform</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {topSkills.map(([skill, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: T.text, width: 110, flexShrink: 0 }}>{skill}</span>
                  <div style={{ flex: 1, height: 4, background: T.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: T.accent, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 10, color: T.muted, width: 28, textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Cities */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
            <SectionLabel T={T}>Students by city</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topCities.map(([city, count]) => (
                <div key={city} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: T.text }}>{city}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 70, height: 3, background: T.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(count / total) * 100}%`, background: T.blue, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: T.muted, width: 14, textAlign: 'right' }}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Funnel */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
            <SectionLabel T={T}>Conversion funnel</SectionLabel>
            {[
              { label: 'Onboarded',     val: total,                                            color: T.blue   },
              { label: 'Applied',       val: students.filter(s => s.applications > 0).length, color: T.purple },
              { label: 'Got interview', val: students.filter(s => s.interviews > 0).length,   color: T.amber  },
              { label: 'Placed',        val: placed,                                           color: T.green  },
            ].map(({ label, val, color }, i, arr) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < arr.length - 1 ? 8 : 0 }}>
                <div style={{ width: `${Math.max((val / total) * 100, 4)}%`, height: 22, background: color + '20', border: `1px solid ${color}40`, borderRadius: 4 }} />
                <span style={{ fontSize: 10, color: T.muted, flex: 1 }}>{label}</span>
                <span style={{ fontSize: 12, color, fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent onboards */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
        <SectionLabel T={T}>Recent onboards</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[...students].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4).map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.surfaceAlt }}>
              <Avatar name={s.full_name} size={30} T={T} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: T.text, margin: 0 }}>{s.full_name}</p>
                <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>{s.college}</p>
              </div>
              <Badge color={scoreColor(s.hunt_score, T)} bg={scoreBg(s.hunt_score, T)} border={scoreBorder(s.hunt_score, T)}>{s.hunt_score}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENTS TAB ─────────────────────────────────────────────────────────────
function StudentsTab({ students, T }) {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [sortBy, setSortBy]   = useState('hunt_score');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let arr = [...students];
    if (search) arr = arr.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()) || s.college.toLowerCase().includes(search.toLowerCase()) || s.skills?.some(sk => sk.name.toLowerCase().includes(search.toLowerCase())));
    if (filter !== 'all') arr = arr.filter(s => s.status === filter);
    arr.sort((a, b) => {
      if (sortBy === 'hunt_score')   return b.hunt_score - a.hunt_score;
      if (sortBy === 'completeness') return b.profile_completeness - a.profile_completeness;
      if (sortBy === 'applications') return b.applications - a.applications;
      if (sortBy === 'name')         return a.full_name.localeCompare(b.full_name);
      if (sortBy === 'recent')       return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });
    return arr;
  }, [students, search, filter, sortBy]);

  const counts = { all: students.length, active: students.filter(s => s.status === 'active').length, placed: students.filter(s => s.status === 'placed').length, incomplete: students.filter(s => s.status === 'incomplete').length };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: 16 }}>
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, college, skill…" T={T} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.inputBg, color: T.text, fontSize: 12, fontFamily: font, outline: 'none', cursor: 'pointer' }}>
            <option value="hunt_score">Sort: HUNT score</option>
            <option value="completeness">Sort: Profile %</option>
            <option value="applications">Sort: Applications</option>
            <option value="recent">Sort: Newest</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[['all', `All ${counts.all}`], ['active', `Active ${counts.active}`], ['placed', `Placed ✓ ${counts.placed}`], ['incomplete', `Incomplete ⚠ ${counts.incomplete}`]].map(([val, label]) => (
            <FilterPill key={val} active={filter === val} onClick={() => setFilter(val)} T={T}>{label}</FilterPill>
          ))}
        </div>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 56px 50px 64px 88px', gap: 10, padding: '5px 14px', marginBottom: 4 }}>
          {['Student', 'College', 'Skills', 'Score', 'Apps', 'Profile', 'Status'].map(h => (
            <span key={h} style={{ fontSize: 9, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</span>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map(s => {
            const isSel = selected?.id === s.id;
            const sc    = scoreColor(s.hunt_score, T);
            return (
              <div key={s.id} onClick={() => setSelected(isSel ? null : s)}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 56px 50px 64px 88px', gap: 10, alignItems: 'center', padding: '10px 14px', background: isSel ? T.accentSoft : T.surface, border: `1px solid ${isSel ? T.accent + '60' : T.border}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.borderColor = T.borderHigh; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.borderColor = T.border; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Avatar name={s.full_name} size={28} T={T} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: T.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name}</p>
                    <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>Year {s.year}</p>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: T.muted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.college}</p>
                <div style={{ display: 'flex', gap: 3, overflow: 'hidden' }}>
                  {s.skills?.slice(0, 2).map((sk, i) => <span key={i} style={{ fontSize: 9, padding: '2px 5px', borderRadius: 4, background: T.blueSoft, border: `1px solid ${T.blueBorder}`, color: T.blue, whiteSpace: 'nowrap' }}>{sk.name}</span>)}
                </div>
                <span style={{ fontFamily: serif, fontSize: 15, color: sc }}>{s.hunt_score}</span>
                <span style={{ fontSize: 12, color: T.text }}>{s.applications}</span>
                <div>
                  <div style={{ height: 3, background: T.surfaceAlt, borderRadius: 2, overflow: 'hidden', marginBottom: 2 }}>
                    <div style={{ height: '100%', width: `${s.profile_completeness}%`, background: scoreColor(s.profile_completeness, T), borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 9, color: T.muted }}>{s.profile_completeness}%</span>
                </div>
                <Badge color={s.status === 'placed' ? T.green : s.status === 'incomplete' ? T.amber : T.blue}
                  bg={s.status === 'placed' ? T.greenSoft : s.status === 'incomplete' ? T.amberSoft : T.blueSoft}
                  border={s.status === 'placed' ? T.greenBorder : s.status === 'incomplete' ? T.amberBorder : T.blueBorder}>
                  {s.status === 'placed' ? '✓ Placed' : s.status === 'incomplete' ? 'Incomplete' : 'Active'}
                </Badge>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: T.muted, fontSize: 13, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10 }}>No students match your filter.</div>
          )}
        </div>
      </div>
      {selected && <StudentDetail student={selected} onClose={() => setSelected(null)} T={T} />}
    </div>
  );
}

// ─── STARTUPS TAB ─────────────────────────────────────────────────────────────
function StartupsTab({ startups: initial, T }) {
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);
  const [startups, setStartups] = useState(initial);

  const filtered = useMemo(() => {
    let arr = [...startups];
    if (search) arr = arr.filter(r => r.company.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase()) || r.contact_name.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'active')   arr = arr.filter(r => r.status === 'active');
    if (filter === 'pending')  arr = arr.filter(r => r.status === 'pending');
    if (filter === 'verified') arr = arr.filter(r => r.verified);
    return arr.sort((a, b) => b.total_applicants - a.total_applicants);
  }, [startups, search, filter]);

  const handleVerify = (r) => {
    setStartups(p => p.map(x => x.id === r.id ? { ...x, verified: !x.verified } : x));
    setSelected(p => p ? { ...p, verified: !p.verified } : null);
  };
  const handleToggle = (r) => {
    const next = r.status === 'active' ? 'pending' : 'active';
    setStartups(p => p.map(x => x.id === r.id ? { ...x, status: next } : x));
    setSelected(p => p ? { ...p, status: next } : null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: 16 }}>
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by company, city, contact…" T={T} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[['all', 'All'], ['active', 'Active'], ['pending', 'Pending'], ['verified', 'Verified ✓']].map(([val, label]) => (
            <FilterPill key={val} active={filter === val} onClick={() => setFilter(val)} T={T}>{label}</FilterPill>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr' : 'repeat(2, 1fr)', gap: 10 }}>
          {filtered.map(r => {
            const isSel = selected?.id === r.id;
            return (
              <div key={r.id} onClick={() => setSelected(isSel ? null : r)}
                style={{ background: isSel ? T.accentSoft : T.surface, border: `1px solid ${isSel ? T.accent + '60' : T.border}`, borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.borderColor = T.borderHigh; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.borderColor = T.border; }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: T.surfaceAlt, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{r.logo}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>{r.company}</p>
                      {r.verified && <span style={{ fontSize: 9, color: T.blue }}>✓</span>}
                    </div>
                    <p style={{ fontSize: 10, color: T.muted, margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</p>
                  </div>
                  <Badge color={r.status === 'active' ? T.green : T.amber} bg={r.status === 'active' ? T.greenSoft : T.amberSoft} border={r.status === 'active' ? T.greenBorder : T.amberBorder}>{r.status}</Badge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                  {[{ label: 'Jobs', val: r.jobs_posted, color: T.accent }, { label: 'Applicants', val: r.total_applicants, color: T.blue }, { label: 'Hires', val: r.hires_made, color: T.green }].map(({ label, val, color }) => (
                    <div key={label} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ fontFamily: serif, fontSize: 16, color, lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <Badge color={T.muted} border={T.border}>{r.stage}</Badge>
                  <Badge color={T.muted} border={T.border}>{r.city}</Badge>
                  {r.industries?.slice(0, 1).map(ind => <Badge key={ind} color={T.purple} bg={T.purpleSoft}>{ind}</Badge>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selected && <StartupDetail startup={selected} onClose={() => setSelected(null)} T={T} onVerify={handleVerify} onToggle={handleToggle} />}
    </div>
  );
}

// ─── JOBS TAB ─────────────────────────────────────────────────────────────────
function JobsTab({ T }) {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const toggle = (id) => setJobs(p => p.map(j => j.id === id ? { ...j, is_active: !j.is_active } : j));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        <StatCard label="Total jobs"       value={jobs.length}                                   icon={Briefcase} color={T.accent} T={T} />
        <StatCard label="Active now"       value={jobs.filter(j => j.is_active).length}          icon={Activity}  color={T.green}  T={T} />
        <StatCard label="Total applicants" value={jobs.reduce((s, j) => s + j.applicants, 0)}   icon={Users}     color={T.blue}   T={T} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {jobs.map(j => {
          const fill = j.max > 0 ? j.applicants / j.max : 0;
          const fc   = fill > 0.8 ? T.red : fill > 0.5 ? T.amber : T.green;
          return (
            <div key={j.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 26 }}>{j.logo}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>{j.role}</p>
                  <p style={{ fontSize: 10, color: T.muted, margin: '2px 0' }}>{j.company} · {j.stipend}</p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Badge color={T.muted} border={T.border}>{j.location}</Badge>
                    <Badge color={T.muted} border={T.border}>{j.duration}</Badge>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Badge color={j.is_active ? T.green : T.muted} bg={j.is_active ? T.greenSoft : 'transparent'} border={j.is_active ? T.greenBorder : T.border}>
                    {j.is_active ? 'Active' : 'Paused'}
                  </Badge>
                  <button onClick={() => toggle(j.id)} title={j.is_active ? 'Pause' : 'Activate'}
                    style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: T.muted, display: 'flex', alignItems: 'center' }}>
                    {j.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: T.muted }}>Applicants</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: fc }}>{j.applicants}/{j.max}</span>
              </div>
              <div style={{ height: 4, background: T.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${fill * 100}%`, background: fc, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [unlocked,  setUnlocked]  = useState(() => sessionStorage.getItem('hunt_admin_v2') === 'yes');
  const [isDark,    setIsDark]    = useState(() => sessionStorage.getItem('hunt_admin_theme') === 'dark');
  const [activeTab, setActiveTab] = useState('overview');

  // ── TO USE REAL SUPABASE DATA: ─────────────────────────────────────────────
  // 1. Remove the MOCK_STUDENTS / MOCK_STARTUPS / MOCK_JOBS lines below
  // 2. Uncomment this block and adjust table names to match yours:
  //
  // const [students, setStudents] = useState([]);
  // const [startups, setStartups] = useState([]);
  // useEffect(() => {
  //   if (!unlocked) return;
  //   Promise.all([
  //     supabase.from('students').select('*').order('created_at', { ascending: false }),
  //     supabase.from('recruiters').select('*, jobs(count)').order('created_at', { ascending: false }),
  //   ]).then(([{ data: s }, { data: r }]) => {
  //     setStudents(s || []);
  //     setStartups(r || []);
  //   });
  // }, [unlocked]);
  // ──────────────────────────────────────────────────────────────────────────

  const students = MOCK_STUDENTS;
  const startups = MOCK_STARTUPS;

  const T = isDark ? THEMES.dark : THEMES.light;

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    sessionStorage.setItem('hunt_admin_theme', next ? 'dark' : 'light');
  };

  const handleUnlock = () => { sessionStorage.setItem('hunt_admin_v2', 'yes'); setUnlocked(true); };
  if (!unlocked) return <PasswordGate onUnlock={handleUnlock} />;

  const tabs = [
    { id: 'overview', label: 'Overview',                      icon: BarChart2  },
    { id: 'students', label: `Students (${students.length})`, icon: Users      },
    { id: 'startups', label: `Startups (${startups.length})`, icon: Building2  },
    { id: 'jobs',     label: 'Jobs',                          icon: Briefcase  },
  ];

  const titles = { overview: 'Platform overview', students: 'Students', startups: 'Startups', jobs: 'Job listings' };
  const subs   = { overview: 'Real-time metrics across the HUNT platform.', students: 'All onboarded students — search, filter, and review profiles.', startups: 'Registered companies — manage verification and activity.', jobs: 'All active and paused job listings.' };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: font, WebkitFontSmoothing: 'antialiased', color: T.text, transition: 'background 0.2s, color 0.2s' }}>
      {/* Nav — identical structure to AdminJobCreator */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: `1px solid ${T.border}`, background: T.navBg, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: '0.12em', color: T.text }}>HUNT</span>
          <span style={{ width: 1, height: 14, background: T.border, display: 'inline-block' }} />
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent }}>Admin</span>
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: 'none', background: active ? T.accentSoft : 'transparent', color: active ? T.accent : T.muted, fontSize: 12, fontWeight: active ? 500 : 400, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = T.sub; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = T.muted; }}>
                <Icon size={13} />{tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: T.muted }}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          {/* Theme toggle — same look as other buttons in AdminJobCreator */}
          <button onClick={toggleTheme}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 20, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.muted, fontSize: 11, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHigh; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}>
            {isDark ? <Sun size={12} /> : <Moon size={12} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.accentSoft, border: `1px solid ${T.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: T.accent, fontWeight: 600 }}>A</div>
        </div>
      </nav>

      {/* Page */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 80px' }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: serif, fontSize: 26, fontWeight: 400, color: T.text, marginBottom: 4, letterSpacing: '-0.01em' }}>{titles[activeTab]}</h1>
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>{subs[activeTab]}</p>
        </div>

        {activeTab === 'overview' && <OverviewTab students={students} startups={startups} T={T} />}
        {activeTab === 'students' && <StudentsTab students={students} T={T} />}
        {activeTab === 'startups' && <StartupsTab startups={startups} T={T} />}
        {activeTab === 'jobs'     && <JobsTab T={T} />}
      </div>

      <style>{`* { box-sizing: border-box; } select option { background: ${T.inputBg}; color: ${T.text}; }`}</style>
    </div>
  );
}
