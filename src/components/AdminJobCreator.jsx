// AdminDashboard.jsx — HUNT Enhanced Admin Dashboard
// Tabs: Overview | Students | Startups | Jobs | Applications
// Includes: metrics, detail panels, search/filter, status management

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Building2, Briefcase, TrendingUp, Search, Filter,
  ChevronRight, X, ArrowLeft, Github, ExternalLink, Eye,
  CheckCircle2, Clock, AlertCircle, Star, Award, Zap,
  BarChart2, Activity, Target, Calendar, Mail, MapPin,
  Phone, Globe, Code, Layers, Hash, ToggleLeft, ToggleRight,
  Download, RefreshCw, Plus, Trash2, MoreVertical, ChevronDown,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { supabase } from '../services/supabase';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'hunt2026';
const ADMIN_RECRUITER_ID = '78b5cea0-ee99-49f8-8cef-d72a5199f5c3';

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg: '#0E0E0F',
  surface: '#16161A',
  surfaceHigh: '#1E1E24',
  border: 'rgba(255,255,255,0.07)',
  borderHigh: 'rgba(255,255,255,0.13)',
  text: '#F0EEE8',
  muted: '#7A7A80',
  accent: '#D85A30',
  accentSoft: 'rgba(216,90,48,0.15)',
  green: '#2ECC85',
  greenSoft: 'rgba(46,204,133,0.12)',
  blue: '#4A9EFF',
  blueSoft: 'rgba(74,158,255,0.12)',
  amber: '#F0A830',
  amberSoft: 'rgba(240,168,48,0.12)',
  red: '#E55454',
  redSoft: 'rgba(229,84,84,0.12)',
  purple: '#A78BFA',
  purpleSoft: 'rgba(167,139,250,0.12)',
};

const font = "'DM Sans', system-ui, sans-serif";
const serif = "Georgia, 'Times New Roman', serif";

// ─── MOCK DATA (replace with real Supabase calls) ─────────────────────────
const MOCK_STUDENTS = [
  { id: 'S001', full_name: 'Priya Sharma', email: 'priya@vjti.ac.in', college: 'VJTI Mumbai', year: 3, city: 'Mumbai', profile_completeness: 92, hunt_score: 78, status: 'active', created_at: '2026-01-15', skills: [{ name: 'React', level: 4 }, { name: 'Node.js', level: 3 }, { name: 'Python', level: 4 }, { name: 'PostgreSQL', level: 3 }], github_url: 'https://github.com', linkedin_url: 'https://linkedin.com', applications: 3, interviews: 2, placed: false, preferred_roles: ['Full Stack', 'Backend'], availability: 'Immediate' },
  { id: 'S002', full_name: 'Rahul Verma', email: 'rahul@nit.ac.in', college: 'NIT Nagpur', year: 3, city: 'Nagpur', profile_completeness: 76, hunt_score: 61, status: 'active', created_at: '2026-01-18', skills: [{ name: 'React', level: 3 }, { name: 'MongoDB', level: 3 }, { name: 'JavaScript', level: 4 }], github_url: 'https://github.com', linkedin_url: null, applications: 2, interviews: 1, placed: false, preferred_roles: ['Frontend'], availability: 'In 1 month' },
  { id: 'S003', full_name: 'Ananya Singh', email: 'ananya@bits.ac.in', college: 'BITS Pilani', year: 4, city: 'Pilani', profile_completeness: 98, hunt_score: 91, status: 'placed', created_at: '2026-01-10', skills: [{ name: 'Python', level: 5 }, { name: 'ML', level: 4 }, { name: 'TensorFlow', level: 4 }, { name: 'SQL', level: 4 }], github_url: 'https://github.com', linkedin_url: 'https://linkedin.com', applications: 4, interviews: 3, placed: true, preferred_roles: ['ML Engineer', 'Data Science'], availability: 'Placed' },
  { id: 'S004', full_name: 'Karan Mehta', email: 'karan@coep.ac.in', college: 'COEP Pune', year: 3, city: 'Pune', profile_completeness: 55, hunt_score: 42, status: 'incomplete', created_at: '2026-02-02', skills: [{ name: 'HTML', level: 3 }, { name: 'CSS', level: 2 }], github_url: null, linkedin_url: null, applications: 0, interviews: 0, placed: false, preferred_roles: ['Frontend'], availability: 'Immediate' },
  { id: 'S005', full_name: 'Divya Nair', email: 'divya@spit.ac.in', college: 'SPIT Mumbai', year: 3, city: 'Mumbai', profile_completeness: 88, hunt_score: 73, status: 'active', created_at: '2026-01-22', skills: [{ name: 'React Native', level: 3 }, { name: 'Flutter', level: 3 }, { name: 'Firebase', level: 3 }], github_url: 'https://github.com', linkedin_url: 'https://linkedin.com', applications: 2, interviews: 1, placed: false, preferred_roles: ['Mobile Dev'], availability: 'Immediate' },
  { id: 'S006', full_name: 'Arjun Patel', email: 'arjun@ldrp.ac.in', college: 'LDRP Ahmedabad', year: 4, city: 'Ahmedabad', profile_completeness: 81, hunt_score: 68, status: 'active', created_at: '2026-01-30', skills: [{ name: 'Node.js', level: 4 }, { name: 'Docker', level: 3 }, { name: 'AWS', level: 2 }, { name: 'PostgreSQL', level: 3 }], github_url: 'https://github.com', linkedin_url: 'https://linkedin.com', applications: 3, interviews: 2, placed: false, preferred_roles: ['Backend', 'DevOps'], availability: 'In 2 weeks' },
  { id: 'S007', full_name: 'Sneha Kulkarni', email: 'sneha@mit.ac.in', college: 'MIT Aurangabad', year: 3, city: 'Aurangabad', profile_completeness: 94, hunt_score: 82, status: 'placed', created_at: '2026-01-08', skills: [{ name: 'React', level: 4 }, { name: 'Node.js', level: 4 }, { name: 'PostgreSQL', level: 3 }, { name: 'TypeScript', level: 3 }], github_url: 'https://github.com', linkedin_url: 'https://linkedin.com', applications: 5, interviews: 3, placed: true, preferred_roles: ['Full Stack'], availability: 'Placed' },
  { id: 'S008', full_name: 'Vikram Joshi', email: 'vikram@gec.ac.in', college: 'GEC Bilimora', year: 3, city: 'Surat', profile_completeness: 67, hunt_score: 54, status: 'active', created_at: '2026-02-10', skills: [{ name: 'Python', level: 3 }, { name: 'Django', level: 2 }, { name: 'SQL', level: 3 }], github_url: null, linkedin_url: 'https://linkedin.com', applications: 1, interviews: 0, placed: false, preferred_roles: ['Backend'], availability: 'Immediate' },
];

const MOCK_STARTUPS = [
  { id: 'R001', company: 'TechFlow AI', logo: '🚀', contact_name: 'Rohan Kapoor', email: 'rohan@techflow.ai', website: 'techflow.ai', city: 'Bangalore', stage: 'Series A', size: '50-100', status: 'active', verified: true, jobs_posted: 2, total_applicants: 47, hires_made: 1, created_at: '2026-01-12', industries: ['AI/ML', 'Analytics'], description: 'AI-powered analytics for enterprise teams' },
  { id: 'R002', company: 'DataMinds', logo: '📊', contact_name: 'Preethi Suresh', email: 'preethi@dataminds.io', website: 'dataminds.io', city: 'Bangalore', stage: 'Seed', size: '10-50', status: 'active', verified: true, jobs_posted: 1, total_applicants: 45, hires_made: 2, created_at: '2026-01-20', industries: ['Data Science', 'NLP'], description: 'NLP models for customer sentiment analysis' },
  { id: 'R003', company: 'DesignStack', logo: '🎨', contact_name: 'Amit Soni', email: 'amit@designstack.co', website: 'designstack.co', city: 'Mumbai', stage: 'Bootstrapped', size: '10-50', status: 'active', verified: false, jobs_posted: 1, total_applicants: 12, hires_made: 0, created_at: '2026-02-01', industries: ['Design', 'SaaS'], description: 'Design tools for creative agencies' },
  { id: 'R004', company: 'CloudScale', logo: '☁️', contact_name: 'Nisha Malhotra', email: 'nisha@cloudscale.dev', website: 'cloudscale.dev', city: 'Hyderabad', stage: 'Series A', size: '50-100', status: 'active', verified: true, jobs_posted: 1, total_applicants: 38, hires_made: 1, created_at: '2026-01-25', industries: ['DevOps', 'Cloud'], description: 'Automated deployment pipelines' },
  { id: 'R005', company: 'FinEdge', logo: '💰', contact_name: 'Saurabh Gupta', email: 'saurabh@finedge.in', website: 'finedge.in', city: 'Mumbai', stage: 'Pre-seed', size: '1-10', status: 'pending', verified: false, jobs_posted: 0, total_applicants: 0, hires_made: 0, created_at: '2026-02-15', industries: ['Fintech'], description: 'Personal finance intelligence for millennials' },
  { id: 'R006', company: 'EduPilot', logo: '🎓', contact_name: 'Meera Krishnan', email: 'meera@edupilot.in', website: 'edupilot.in', city: 'Chennai', stage: 'Seed', size: '10-50', status: 'active', verified: true, jobs_posted: 2, total_applicants: 29, hires_made: 1, created_at: '2026-01-18', industries: ['EdTech'], description: 'AI tutoring for tier-2 college students' },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const scoreColor = (s) => s >= 75 ? C.green : s >= 50 ? C.amber : C.red;
const scoreBg = (s) => s >= 75 ? C.greenSoft : s >= 50 ? C.amberSoft : C.redSoft;
const initials = (name) => (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

function Badge({ children, color = C.muted, bg = 'transparent', border }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 500, letterSpacing: '0.05em', padding: '3px 8px',
      borderRadius: 20, border: `1px solid ${border || color + '40'}`,
      background: bg, color, display: 'inline-flex', alignItems: 'center', gap: 4,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function Avatar({ name, size = 36, color = C.green }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '20', border: `1.5px solid ${color}50`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 600, color, flexShrink: 0,
    }}>{initials(name)}</div>
  );
}

function StatCard({ label, value, sub, trend, color = C.text, icon: Icon }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: C.muted, letterSpacing: '0.05em' }}>{label}</span>
        {Icon && <Icon size={14} color={C.muted} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 28, fontFamily: serif, color, fontWeight: 400, lineHeight: 1 }}>{value}</span>
        {trend !== undefined && (
          <span style={{ fontSize: 11, color: trend >= 0 ? C.green : C.red, display: 'flex', alignItems: 'center', gap: 2 }}>
            {trend > 0 ? <ArrowUpRight size={11} /> : trend < 0 ? <ArrowDownRight size={11} /> : <Minus size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {sub && <span style={{ fontSize: 11, color: C.muted }}>{sub}</span>}
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
      <input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 12px 8px 30px', borderRadius: 8,
          border: `1px solid ${C.border}`, background: C.surfaceHigh,
          color: C.text, fontSize: 13, fontFamily: font, outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = C.accent}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

// ─── PASSWORD GATE ────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);
  const check = () => {
    if (val === ADMIN_PASSWORD) onUnlock();
    else { setErr(true); setTimeout(() => setErr(false), 1200); }
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, fontFamily: font }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '40px 44px', width: 360, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🔐</div>
        <h2 style={{ fontFamily: serif, fontSize: 24, color: C.text, marginBottom: 6, fontWeight: 400 }}>Admin access</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>HUNT internal dashboard</p>
        <input type="password" value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()} placeholder="Password"
          autoFocus
          style={{
            width: '100%', padding: '11px 14px', borderRadius: 8, textAlign: 'center',
            border: `1px solid ${err ? C.red : C.border}`, background: C.surfaceHigh,
            color: C.text, fontSize: 14, fontFamily: font, marginBottom: 10,
            outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
          }}
        />
        {err && <p style={{ fontSize: 12, color: C.red, marginBottom: 8 }}>Incorrect password</p>}
        <button onClick={check} style={{
          width: '100%', padding: 11, borderRadius: 8, border: 'none',
          background: C.accent, color: '#fff', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', fontFamily: font,
        }}>Enter dashboard →</button>
      </div>
    </div>
  );
}

// ─── STUDENT DETAIL PANEL ────────────────────────────────────────────────────
function StudentDetail({ student, onClose }) {
  const s = student;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', height: 'fit-content', position: 'sticky', top: 80 }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, background: C.surfaceHigh, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Student profile</span>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex' }}><X size={14} /></button>
      </div>
      <div style={{ padding: 18 }}>
        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <Avatar name={s.full_name} size={44} color={C.blue} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: C.text, margin: 0 }}>{s.full_name}</p>
            <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 6px' }}>{s.college} · Year {s.year}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <Badge color={s.status === 'placed' ? C.green : s.status === 'incomplete' ? C.amber : C.blue}
                bg={s.status === 'placed' ? C.greenSoft : s.status === 'incomplete' ? C.amberSoft : C.blueSoft}>
                {s.status === 'placed' ? '✓ Placed' : s.status === 'incomplete' ? '⚠ Incomplete' : '● Active'}
              </Badge>
              <Badge color={C.muted}>{s.city}</Badge>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontFamily: serif, color: scoreColor(s.hunt_score), lineHeight: 1 }}>{s.hunt_score}</div>
            <div style={{ fontSize: 9, color: C.muted }}>HUNT score</div>
          </div>
        </div>

        {/* Profile completeness bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: C.muted }}>Profile completeness</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: C.text }}>{s.profile_completeness}%</span>
          </div>
          <div style={{ height: 3, background: C.surfaceHigh, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${s.profile_completeness}%`, background: scoreColor(s.profile_completeness), borderRadius: 2 }} />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Applied', val: s.applications, color: C.blue },
            { label: 'Interviews', val: s.interviews, color: C.amber },
            { label: 'Placed', val: s.placed ? '✓' : '—', color: s.placed ? C.green : C.muted },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: C.surfaceHigh, borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontFamily: serif, color, lineHeight: 1, marginBottom: 3 }}>{val}</div>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Skills */}
        {s.skills?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 9, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {s.skills.map((sk, i) => (
                <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: C.blueSoft, border: `1px solid ${C.blue}30`, color: C.blue }}>
                  {sk.name} <span style={{ opacity: 0.6 }}>L{sk.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preferred roles */}
        {s.preferred_roles?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 9, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>Preferred roles</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {s.preferred_roles.map((r, i) => (
                <Badge key={i} color={C.purple} bg={C.purpleSoft}>{r}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginBottom: 14 }}>
          <p style={{ fontSize: 9, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Contact</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <a href={`mailto:${s.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.muted, textDecoration: 'none' }}>
              <Mail size={11} />{s.email}
            </a>
            <div style={{ display: 'flex', gap: 6 }}>
              {s.github_url && <a href={s.github_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted, padding: '4px 9px', borderRadius: 20, border: `1px solid ${C.border}`, textDecoration: 'none' }}><Github size={11} /> GitHub</a>}
              {s.linkedin_url && <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted, padding: '4px 9px', borderRadius: 20, border: `1px solid ${C.border}`, textDecoration: 'none' }}><ExternalLink size={11} /> LinkedIn</a>}
            </div>
          </div>
        </div>

        {/* Availability */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, background: C.surfaceHigh, border: `1px solid ${C.border}` }}>
          <Calendar size={11} color={C.muted} />
          <span style={{ fontSize: 11, color: C.muted }}>Availability:</span>
          <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{s.availability}</span>
        </div>
      </div>
    </div>
  );
}

// ─── STARTUP DETAIL PANEL ────────────────────────────────────────────────────
function StartupDetail({ startup, onClose }) {
  const r = startup;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', height: 'fit-content', position: 'sticky', top: 80 }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, background: C.surfaceHigh, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Startup profile</span>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex' }}><X size={14} /></button>
      </div>
      <div style={{ padding: 18 }}>
        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: C.surfaceHigh, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{r.logo}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: C.text, margin: 0 }}>{r.company}</p>
              {r.verified && <span style={{ fontSize: 10, color: C.blue, background: C.blueSoft, padding: '1px 6px', borderRadius: 8, border: `1px solid ${C.blue}30` }}>✓ Verified</span>}
            </div>
            <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 6px' }}>{r.description}</p>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Badge color={r.status === 'active' ? C.green : C.amber} bg={r.status === 'active' ? C.greenSoft : C.amberSoft}>
                {r.status === 'active' ? '● Active' : '⟳ Pending'}
              </Badge>
              <Badge color={C.muted}>{r.stage}</Badge>
              <Badge color={C.muted}>{r.size} emp</Badge>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Jobs', val: r.jobs_posted, color: C.accent },
            { label: 'Applicants', val: r.total_applicants, color: C.blue },
            { label: 'Hires', val: r.hires_made, color: C.green },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: C.surfaceHigh, borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontFamily: serif, color, lineHeight: 1, marginBottom: 3 }}>{val}</div>
              <div style={{ fontSize: 9, color: C.muted }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Industries */}
        {r.industries?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 9, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>Industries</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {r.industries.map((ind, i) => <Badge key={i} color={C.purple} bg={C.purpleSoft}>{ind}</Badge>)}
            </div>
          </div>
        )}

        {/* Contact */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <p style={{ fontSize: 9, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Contact</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.text }}>
              <Users size={11} color={C.muted} />{r.contact_name}
            </div>
            <a href={`mailto:${r.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.muted, textDecoration: 'none' }}>
              <Mail size={11} />{r.email}
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.muted }}>
              <MapPin size={11} />{r.city}
            </div>
            {r.website && (
              <a href={`https://${r.website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.accent, textDecoration: 'none' }}>
                <Globe size={11} />{r.website}
              </a>
            )}
          </div>
        </div>

        {/* Verify / Deactivate actions */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button style={{ padding: '8px', borderRadius: 8, border: `1px solid ${C.green}40`, background: C.greenSoft, color: C.green, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: font }}>
            {r.verified ? '✓ Verified' : 'Verify'}
          </button>
          <button style={{ padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 11, cursor: 'pointer', fontFamily: font }}>
            {r.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ students, startups }) {
  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.placed).length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const incompleteProfiles = students.filter(s => s.profile_completeness < 70).length;
  const totalStartups = startups.length;
  const activeStartups = startups.filter(r => r.status === 'active').length;
  const verifiedStartups = startups.filter(r => r.verified).length;
  const totalJobs = startups.reduce((sum, r) => sum + r.jobs_posted, 0);
  const totalApplications = startups.reduce((sum, r) => sum + r.total_applicants, 0);
  const totalHires = startups.reduce((sum, r) => sum + r.hires_made, 0);
  const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
  const avgHuntScore = Math.round(students.reduce((sum, s) => sum + s.hunt_score, 0) / (students.length || 1));
  const avgCompleteness = Math.round(students.reduce((sum, s) => sum + s.profile_completeness, 0) / (students.length || 1));

  // Top skills across all students
  const skillCounts = {};
  students.forEach(s => s.skills?.forEach(sk => { skillCounts[sk.name] = (skillCounts[sk.name] || 0) + 1; }));
  const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // City distribution
  const cityCounts = {};
  students.forEach(s => { cityCounts[s.city] = (cityCounts[s.city] || 0) + 1; });
  const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Key metrics */}
      <div>
        <p style={{ fontSize: 11, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Platform overview</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <StatCard label="Total students" value={totalStudents} trend={12} icon={Users} color={C.blue} sub={`${activeStudents} active`} />
          <StatCard label="Startups" value={totalStartups} trend={8} icon={Building2} color={C.accent} sub={`${activeStartups} active`} />
          <StatCard label="Jobs posted" value={totalJobs} trend={5} icon={Briefcase} color={C.purple} sub={`${totalApplications} applicants`} />
          <StatCard label="Placement rate" value={`${placementRate}%`} trend={3} icon={Target} color={C.green} sub={`${totalHires} hires made`} />
        </div>
      </div>

      {/* Secondary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <StatCard label="Avg HUNT score" value={avgHuntScore} icon={Star} color={C.amber} />
        <StatCard label="Avg profile" value={`${avgCompleteness}%`} icon={Activity} color={C.blue} sub={`${incompleteProfiles} incomplete`} />
        <StatCard label="Verified startups" value={verifiedStartups} icon={CheckCircle2} color={C.green} sub={`of ${totalStartups} total`} />
        <StatCard label="Total applications" value={totalApplications} icon={BarChart2} color={C.purple} sub="this month" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top skills */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
          <p style={{ fontSize: 11, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Top skills on platform</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topSkills.map(([skill, count]) => {
              const pct = Math.round((count / totalStudents) * 100);
              return (
                <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: C.text, width: 100, flexShrink: 0 }}>{skill}</span>
                  <div style={{ flex: 1, height: 4, background: C.surfaceHigh, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: C.accent, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 10, color: C.muted, width: 30, textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Students by city + funnel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Cities */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, flex: 1 }}>
            <p style={{ fontSize: 11, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Students by city</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {topCities.map(([city, count]) => (
                <div key={city} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: C.text }}>{city}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, height: 3, background: C.surfaceHigh, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(count / totalStudents) * 100}%`, background: C.blue, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: C.muted, width: 14, textAlign: 'right' }}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Placement funnel */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
            <p style={{ fontSize: 11, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Conversion funnel</p>
            {[
              { label: 'Students', val: totalStudents, color: C.blue },
              { label: 'Applied', val: students.filter(s => s.applications > 0).length, color: C.purple },
              { label: 'Got interviews', val: students.filter(s => s.interviews > 0).length, color: C.amber },
              { label: 'Placed', val: placedStudents, color: C.green },
            ].map(({ label, val, color }, i, arr) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < arr.length - 1 ? 6 : 0 }}>
                <div style={{ width: `${(val / totalStudents) * 100}%`, minWidth: 4, height: 24, background: color + '25', border: `1px solid ${color}40`, borderRadius: 4, transition: 'width 0.3s' }} />
                <span style={{ fontSize: 10, color: C.muted, whiteSpace: 'nowrap' }}>{label}</span>
                <span style={{ fontSize: 12, color, fontWeight: 500, marginLeft: 'auto' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
        <p style={{ fontSize: 11, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Recent onboards</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[...students].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4).map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surfaceHigh }}>
              <Avatar name={s.full_name} size={30} color={C.blue} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: C.text, margin: 0 }}>{s.full_name}</p>
                <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{s.college}</p>
              </div>
              <Badge color={scoreColor(s.hunt_score)} bg={scoreBg(s.hunt_score)}>{s.hunt_score}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENTS TAB ─────────────────────────────────────────────────────────────
function StudentsTab({ students }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('hunt_score');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let arr = [...students];
    if (search) arr = arr.filter(s =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.college.toLowerCase().includes(search.toLowerCase()) ||
      s.skills?.some(sk => sk.name.toLowerCase().includes(search.toLowerCase()))
    );
    if (filterStatus !== 'all') arr = arr.filter(s => s.status === filterStatus);
    arr.sort((a, b) => {
      if (sortBy === 'hunt_score') return b.hunt_score - a.hunt_score;
      if (sortBy === 'completeness') return b.profile_completeness - a.profile_completeness;
      if (sortBy === 'applications') return b.applications - a.applications;
      if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
      if (sortBy === 'recent') return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });
    return arr;
  }, [students, search, filterStatus, sortBy]);

  const statusCounts = useMemo(() => ({
    all: students.length,
    active: students.filter(s => s.status === 'active').length,
    placed: students.filter(s => s.status === 'placed').length,
    incomplete: students.filter(s => s.status === 'incomplete').length,
  }), [students]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: 16 }}>
      <div>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search students, colleges, skills…" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surfaceHigh, color: C.text, fontSize: 12, fontFamily: font, outline: 'none', cursor: 'pointer' }}>
            <option value="hunt_score">Sort: HUNT score</option>
            <option value="completeness">Sort: Profile %</option>
            <option value="applications">Sort: Applications</option>
            <option value="recent">Sort: Newest</option>
            <option value="name">Sort: Name A-Z</option>
          </select>
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[['all', 'All'], ['active', 'Active'], ['placed', 'Placed ✓'], ['incomplete', 'Incomplete ⚠']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterStatus(val)} style={{
              padding: '5px 12px', borderRadius: 20, border: `1px solid ${filterStatus === val ? C.accent : C.border}`,
              background: filterStatus === val ? C.accentSoft : 'transparent',
              color: filterStatus === val ? C.accent : C.muted, fontSize: 11, cursor: 'pointer', fontFamily: font,
            }}>
              {label} <span style={{ opacity: 0.6 }}>{statusCounts[val]}</span>
            </button>
          ))}
        </div>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 60px 60px 60px 80px', gap: 12, padding: '6px 14px', marginBottom: 4 }}>
          {['Student', 'College', 'Skills', 'Score', 'Apps', 'Profile', 'Status'].map(h => (
            <span key={h} style={{ fontSize: 9, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map(s => {
            const isSelected = selected?.id === s.id;
            return (
              <div key={s.id} onClick={() => setSelected(isSelected ? null : s)}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 60px 60px 60px 80px',
                  gap: 12, alignItems: 'center', padding: '10px 14px',
                  background: isSelected ? C.accentSoft : C.surface,
                  border: `1px solid ${isSelected ? C.accent + '50' : C.border}`,
                  borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = C.borderHigh; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = C.border; }}
              >
                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Avatar name={s.full_name} size={28} color={C.blue} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name}</p>
                    <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Year {s.year}</p>
                  </div>
                </div>
                {/* College */}
                <p style={{ fontSize: 11, color: C.muted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.college}</p>
                {/* Skills preview */}
                <div style={{ display: 'flex', gap: 3, overflow: 'hidden' }}>
                  {s.skills?.slice(0, 2).map((sk, i) => (
                    <span key={i} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: C.blueSoft, border: `1px solid ${C.blue}20`, color: C.blue, whiteSpace: 'nowrap' }}>{sk.name}</span>
                  ))}
                </div>
                {/* Hunt score */}
                <span style={{ fontSize: 14, fontFamily: serif, color: scoreColor(s.hunt_score) }}>{s.hunt_score}</span>
                {/* Applications */}
                <span style={{ fontSize: 12, color: C.text }}>{s.applications}</span>
                {/* Profile % */}
                <div>
                  <div style={{ height: 3, background: C.surfaceHigh, borderRadius: 2, overflow: 'hidden', marginBottom: 2 }}>
                    <div style={{ height: '100%', width: `${s.profile_completeness}%`, background: scoreColor(s.profile_completeness), borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 9, color: C.muted }}>{s.profile_completeness}%</span>
                </div>
                {/* Status */}
                <Badge
                  color={s.status === 'placed' ? C.green : s.status === 'incomplete' ? C.amber : C.blue}
                  bg={s.status === 'placed' ? C.greenSoft : s.status === 'incomplete' ? C.amberSoft : C.blueSoft}
                >
                  {s.status === 'placed' ? '✓ Placed' : s.status === 'incomplete' ? 'Incomplete' : 'Active'}
                </Badge>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: C.muted, fontSize: 13, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
              No students match your filter.
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && <StudentDetail student={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── STARTUPS TAB ─────────────────────────────────────────────────────────────
function StartupsTab({ startups }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let arr = [...startups];
    if (search) arr = arr.filter(r =>
      r.company.toLowerCase().includes(search.toLowerCase()) ||
      r.contact_name.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatus === 'active') arr = arr.filter(r => r.status === 'active');
    if (filterStatus === 'pending') arr = arr.filter(r => r.status === 'pending');
    if (filterStatus === 'verified') arr = arr.filter(r => r.verified);
    arr.sort((a, b) => b.total_applicants - a.total_applicants);
    return arr;
  }, [startups, search, filterStatus]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: 16 }}>
      <div>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search startups, cities…" />
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[['all', 'All'], ['active', 'Active'], ['pending', 'Pending'], ['verified', 'Verified ✓']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterStatus(val)} style={{
              padding: '5px 12px', borderRadius: 20, border: `1px solid ${filterStatus === val ? C.accent : C.border}`,
              background: filterStatus === val ? C.accentSoft : 'transparent',
              color: filterStatus === val ? C.accent : C.muted, fontSize: 11, cursor: 'pointer', fontFamily: font,
            }}>{label}</button>
          ))}
        </div>

        {/* Grid cards */}
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr' : 'repeat(2, 1fr)', gap: 10 }}>
          {filtered.map(r => {
            const isSelected = selected?.id === r.id;
            return (
              <div key={r.id} onClick={() => setSelected(isSelected ? null : r)}
                style={{
                  background: isSelected ? C.accentSoft : C.surface,
                  border: `1px solid ${isSelected ? C.accent + '50' : C.border}`,
                  borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = C.borderHigh; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = C.border; }}>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: C.surfaceHigh, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{r.logo}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: C.text, margin: 0 }}>{r.company}</p>
                      {r.verified && <span style={{ fontSize: 9, color: C.blue }}>✓</span>}
                    </div>
                    <p style={{ fontSize: 10, color: C.muted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</p>
                  </div>
                  <Badge color={r.status === 'active' ? C.green : C.amber} bg={r.status === 'active' ? C.greenSoft : C.amberSoft}>
                    {r.status}
                  </Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                  {[
                    { label: 'Jobs', val: r.jobs_posted, color: C.accent },
                    { label: 'Applicants', val: r.total_applicants, color: C.blue },
                    { label: 'Hires', val: r.hires_made, color: C.green },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ background: C.surfaceHigh, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontFamily: serif, color, lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <Badge color={C.muted}>{r.stage}</Badge>
                  <Badge color={C.muted}><MapPin size={9} /> {r.city}</Badge>
                  {r.industries?.slice(0, 1).map(ind => <Badge key={ind} color={C.purple} bg={C.purpleSoft}>{ind}</Badge>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selected && <StartupDetail startup={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── JOBS TAB ─────────────────────────────────────────────────────────────────
function JobsTab({ startups }) {
  // Build mock jobs from startups
  const jobs = [
    { id: 'J001', company: 'TechFlow AI', logo: '🚀', role: 'Backend Engineering Intern', stipend: '₹25,000/mo', location: 'Remote', applicants: 23, max: 50, active: true, type: 'Paid', duration: '6 months' },
    { id: 'J002', company: 'DataMinds', logo: '📊', role: 'ML Engineering Intern', stipend: '₹30,000/mo', location: 'Bangalore', applicants: 45, max: 50, active: true, type: 'Paid', duration: '6 months' },
    { id: 'J003', company: 'DesignStack', logo: '🎨', role: 'Full Stack Developer Intern', stipend: '₹20,000/mo', location: 'Mumbai (Hybrid)', applicants: 12, max: 50, active: true, type: 'Paid', duration: '3 months' },
    { id: 'J004', company: 'CloudScale', logo: '☁️', role: 'DevOps Intern', stipend: '₹28,000/mo', location: 'Remote', applicants: 38, max: 50, active: false, type: 'Paid', duration: '6 months' },
    { id: 'J005', company: 'EduPilot', logo: '🎓', role: 'React Developer Intern', stipend: '₹18,000/mo', location: 'Chennai', applicants: 29, max: 40, active: true, type: 'Paid', duration: '3 months' },
    { id: 'J006', company: 'EduPilot', logo: '🎓', role: 'Content & Marketing Intern', stipend: '₹15,000/mo', location: 'Remote', applicants: 0, max: 30, active: true, type: 'Paid', duration: '2 months' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        <StatCard label="Total jobs" value={jobs.length} icon={Briefcase} color={C.accent} />
        <StatCard label="Active now" value={jobs.filter(j => j.active).length} icon={Activity} color={C.green} />
        <StatCard label="Total applicants" value={jobs.reduce((s, j) => s + j.applicants, 0)} icon={Users} color={C.blue} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {jobs.map(j => {
          const fill = j.applicants / j.max;
          const fillColor = fill > 0.8 ? C.red : fill > 0.5 ? C.amber : C.green;
          return (
            <div key={j.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{j.logo}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.text, margin: 0 }}>{j.role}</p>
                  <p style={{ fontSize: 10, color: C.muted, margin: '2px 0' }}>{j.company} · {j.stipend}</p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Badge color={C.muted}>{j.location}</Badge>
                    <Badge color={C.muted}>{j.duration}</Badge>
                  </div>
                </div>
                <Badge color={j.active ? C.green : C.muted} bg={j.active ? C.greenSoft : 'transparent'}>
                  {j.active ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: C.muted }}>Applicants</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: fillColor }}>{j.applicants}/{j.max}</span>
              </div>
              <div style={{ height: 4, background: C.surfaceHigh, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${fill * 100}%`, background: fillColor, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('hunt_admin_v2') === 'yes');
  const [activeTab, setActiveTab] = useState('overview');

  // In production these would come from Supabase
  const students = MOCK_STUDENTS;
  const startups = MOCK_STARTUPS;

  const handleUnlock = () => { sessionStorage.setItem('hunt_admin_v2', 'yes'); setUnlocked(true); };

  if (!unlocked) return <PasswordGate onUnlock={handleUnlock} />;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'students', label: `Students (${students.length})`, icon: Users },
    { id: 'startups', label: `Startups (${startups.length})`, icon: Building2 },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font, WebkitFontSmoothing: 'antialiased', color: C.text }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px', borderBottom: `1px solid ${C.border}`, background: C.surface, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: serif, fontSize: 18, color: C.text, letterSpacing: '-0.01em' }}>HUNT</span>
          <span style={{ width: 1, height: 14, background: C.border }} />
          <span style={{ fontSize: 10, color: C.accent, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
                border: 'none', background: activeTab === tab.id ? C.accentSoft : 'transparent',
                color: activeTab === tab.id ? C.accent : C.muted, fontSize: 12, fontWeight: activeTab === tab.id ? 500 : 400,
                cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
              }}>
                <Icon size={13} />{tab.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: C.muted }}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.accentSoft, border: `1px solid ${C.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.accent, fontWeight: 600 }}>A</div>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 80px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: serif, fontSize: 26, fontWeight: 400, color: C.text, marginBottom: 4, letterSpacing: '-0.01em' }}>
            {activeTab === 'overview' && 'Platform overview'}
            {activeTab === 'students' && 'Students'}
            {activeTab === 'startups' && 'Startups'}
            {activeTab === 'jobs' && 'Job listings'}
          </h1>
          <p style={{ fontSize: 12, color: C.muted }}>
            {activeTab === 'overview' && 'Real-time metrics across the HUNT platform.'}
            {activeTab === 'students' && 'All onboarded students — search, filter, and review profiles.'}
            {activeTab === 'startups' && 'Registered companies — manage verification and activity.'}
            {activeTab === 'jobs' && 'All active and paused job listings.'}
          </p>
        </div>

        {activeTab === 'overview' && <OverviewTab students={students} startups={startups} />}
        {activeTab === 'students' && <StudentsTab students={students} />}
        {activeTab === 'startups' && <StartupsTab startups={startups} />}
        {activeTab === 'jobs' && <JobsTab startups={startups} />}
      </div>

      <style>{`* { box-sizing: border-box; } select option { background: #1E1E24; }`}</style>
    </div>
  );
}
