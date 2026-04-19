// src/components/StudentDashboard.jsx
// ─── HUNT Candidate Dashboard ─────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart, X, TrendingUp, Target, Briefcase, MapPin, Clock,
  AlertCircle, CheckCircle2, ChevronRight, Zap, Award, LogOut,
  Sun, Moon, Home, Users, User, Bell, BookOpen,
  Compass, BellRing, Maximize2, Minimize2, SlidersHorizontal,
  LayoutGrid, LayoutList, Sparkles, Search, Filter, Bookmark,
  ClipboardList, FileText, Star, Link
} from 'lucide-react';
import {
  getStudentProfile, getActiveJobs, createApplication,
  getWeeklyApplicationCount, signOut
} from '../services/supabase';
import { calculateMatchScore } from '../services/matching';
import { sendToAirtable, prepareApplicationData } from '../services/airtable';
import { useNavigate } from 'react-router-dom';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const tokens = {
  light: {
    '--bg':         '#FAFAF8',
    '--bg-card':    '#FFFFFF',
    '--bg-subtle':  '#F5F5F2',
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
  },
  dark: {
    '--bg':         '#0A0A0A',
    '--bg-card':    '#111110',
    '--bg-subtle':  '#1A1A18',
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
  }
};

function applyTokens(theme) {
  const root = document.documentElement;
  Object.entries(tokens[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
}

// ─── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '0.18em', color: 'var(--text)', marginBottom: '20px' }}>HUNT</div>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', opacity: dots > i ? 1 : 0.2, transition: 'opacity 0.3s' }} />
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Finding your opportunities…</p>
      </div>
    </div>
  );
}

// ─── Welcome card ──────────────────────────────────────────────────────────────
function WelcomeCard({ name, completeness, onDismiss }) {
  const firstName = name?.split(' ')[0] || 'there';
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px 28px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '180px', height: '100%', background: 'linear-gradient(135deg, transparent 50%, var(--green-tint) 100%)', pointerEvents: 'none' }} />
      <button onClick={onDismiss} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={15} /></button>
      <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '6px' }}>Welcome to HUNT</p>
      <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginBottom: '8px', lineHeight: 1.2 }}>
        Hey {firstName}, let's find your <em>first internship.</em>
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginBottom: '16px', lineHeight: 1.5, maxWidth: '400px' }}>
        HUNT matches you on skills — not your college name. Fewer applications, stronger shots.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '160px', height: '3px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${completeness}%`, background: completeness >= 80 ? 'var(--green)' : 'var(--amber)', borderRadius: '999px', transition: 'width 0.6s' }} />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Profile {completeness}% complete</span>
      </div>
    </div>
  );
}

// ─── Quick guide ───────────────────────────────────────────────────────────────
function QuickGuideCard({ onDismiss }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 24px', marginBottom: '20px', position: 'relative' }}>
      <button onClick={onDismiss} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
        <span>Skip</span><X size={13} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '16px' }}>
        <BookOpen size={14} style={{ color: 'var(--green)' }} />
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)' }}>How HUNT works</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { n: '01', t: 'Build profile', d: 'Skills + projects = your signal.' },
          { n: '02', t: 'Explore matches', d: '5 applies/week — make them count.' },
          { n: '03', t: 'Apply with intent', d: 'See your match % before you apply.' },
          { n: '04', t: 'Get shortlisted', d: 'Recruiters see only top 20.' },
        ].map(s => (
          <div key={s.n} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--green)', display: 'block', marginBottom: '3px' }}>{s.n}</span>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>{s.t}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.4 }}>{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Filter panel ──────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, onClose, jobs }) {
  const roles = [...new Set(jobs.map(j => j.role?.split(' ').slice(-1)[0]).filter(Boolean))];
  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))];

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>Filters</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={14} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {/* Role type */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Role type</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['Full Stack', 'Backend', 'Frontend', 'ML / AI', 'DevOps', 'Data', 'Design', 'Marketing'].map(r => (
              <button key={r} onClick={() => onChange('role', r)}
                style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer', background: filters.role === r ? 'var(--text)' : 'transparent', color: filters.role === r ? 'var(--bg)' : 'var(--text-mid)' }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Location</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['Remote', 'Hybrid', 'On-site'].map(l => (
              <button key={l} onClick={() => onChange('location', l)}
                style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer', background: filters.location === l ? 'var(--text)' : 'transparent', color: filters.location === l ? 'var(--bg)' : 'var(--text-mid)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Match % */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
            Min match: <span style={{ color: 'var(--green)' }}>{filters.minMatch}%</span>
          </label>
          <input type="range" min={0} max={100} step={5} value={filters.minMatch}
            onChange={e => onChange('minMatch', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--green)' }} />
        </div>

        {/* Stipend */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Stipend</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['Any', '10k+', '20k+', '30k+'].map(s => (
              <button key={s} onClick={() => onChange('stipend', s)}
                style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer', background: filters.stipend === s ? 'var(--text)' : 'transparent', color: filters.stipend === s ? 'var(--bg)' : 'var(--text-mid)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Duration</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['Any', '1-3 months', '3-6 months', '6+ months'].map(d => (
              <button key={d} onClick={() => onChange('duration', d)}
                style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer', background: filters.duration === d ? 'var(--text)' : 'transparent', color: filters.duration === d ? 'var(--bg)' : 'var(--text-mid)' }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Skills</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['React', 'Node.js', 'Python', 'ML', 'Docker', 'AWS'].map(s => (
              <button key={s} onClick={() => onChange('skill', s)}
                style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer', background: filters.skill === s ? 'var(--text)' : 'transparent', color: filters.skill === s ? 'var(--bg)' : 'var(--text-mid)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => onChange('reset')} style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        Clear all filters
      </button>
    </div>
  );
}

// ─── Job grid card ─────────────────────────────────────────────────────────────
function JobGridCard({ job, matchData, isSelected, onClick, isSaved, onSave }) {
  const scoreColor = s => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)';
  const scoreBg    = s => s >= 75 ? 'var(--green-tint)' : s >= 50 ? 'var(--amber-tint)' : 'var(--red-tint)';

  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-card)',
      border: isSelected ? '1.5px solid var(--text)' : '1px solid var(--border)',
      borderRadius: '12px', padding: '18px 20px', cursor: 'pointer',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxShadow: isSelected ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
      position: 'relative',
    }}
    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {/* Bookmark button */}
      <button onClick={e => { e.stopPropagation(); onSave(job); }} style={{
        position: 'absolute', top: '12px', right: '12px',
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        color: isSaved ? 'var(--green)' : 'var(--text-dim)',
        display: 'flex', alignItems: 'center',
      }} title={isSaved ? 'Unsave' : 'Save'}>
        <Bookmark size={14} fill={isSaved ? 'var(--green)' : 'none'} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{job.logo}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '2px' }}>
            {job.company}
          </p>
          <h3 style={{
            fontFamily: "'Editorial New', Georgia, serif",
            fontSize: '15px', fontWeight: 400, color: 'var(--text)',
            lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{job.role}</h3>
        </div>
        {matchData && (
          <div style={{
            flexShrink: 0, fontSize: '13px', fontFamily: "'Editorial New', Georgia, serif",
            padding: '3px 8px', borderRadius: '6px',
            color: scoreColor(matchData.score), background: scoreBg(matchData.score),
          }}>{matchData.score}%</div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
        {[
          { Icon: Briefcase, val: job.stipend },
          { Icon: MapPin,    val: job.location },
          { Icon: Clock,     val: job.duration },
        ].map(({ Icon, val }) => (
          <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon size={11} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{val}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {job.required_skills?.slice(0, 3).map((s, i) => {
            const matched = matchData?.matchedSkills.find(ms => ms.name === s.name);
            return (
              <span key={i} style={{
                fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                border: `1px solid ${matched ? 'var(--green)' : 'var(--border)'}`,
                color: matched ? 'var(--green-text)' : 'var(--text-dim)',
                background: matched ? 'var(--green-tint)' : 'transparent',
              }}>{s.name}</span>
            );
          })}
          {(job.required_skills?.length || 0) > 3 && (
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>+{job.required_skills.length - 3}</span>
          )}
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
          {job.current_applicants}/{job.max_applicants}
        </span>
      </div>
    </div>
  );
}

// ─── Job detail panel ──────────────────────────────────────────────────────────
function JobDetailPanel({ job, matchData, isMaximized, onToggleMaximize, onClose, onApply, applying, canApply, isSaved, onSave }) {
  const scoreColor = s => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)';
  const scoreBg    = s => s >= 75 ? 'var(--green-tint)' : s >= 50 ? 'var(--amber-tint)' : 'var(--red-tint)';
  const compColor  = c => c === 'High' ? 'var(--red)' : c === 'Medium' ? 'var(--amber)' : 'var(--green)';
  const compBg     = c => c === 'High' ? 'var(--red-tint)' : c === 'Medium' ? 'var(--amber-tint)' : 'var(--green-tint)';

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Panel toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onToggleMaximize} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title={isMaximized ? 'Minimize' : 'Maximize'}>
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={() => onSave(job)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? 'var(--green)' : 'var(--text-dim)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title={isSaved ? 'Unsave' : 'Save'}>
            <Bookmark size={14} fill={isSaved ? 'var(--green)' : 'none'} />
          </button>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
          <X size={16} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <span style={{ fontSize: '44px', lineHeight: 1, flexShrink: 0 }}>{job.logo}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>
              {job.company}
            </p>
            <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '22px', fontWeight: 400, color: 'var(--text)', lineHeight: 1.2, marginBottom: '6px' }}>
              {job.role}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{job.type}</span>
            </div>
          </div>
          {matchData && (
            <div style={{
              flexShrink: 0, padding: '10px 14px', borderRadius: '10px', textAlign: 'center',
              background: scoreBg(matchData.score),
            }}>
              <div style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '26px', fontWeight: 400, color: scoreColor(matchData.score) }}>{matchData.score}%</div>
              <p style={{ fontSize: '10px', color: scoreColor(matchData.score), opacity: 0.7 }}>match</p>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {[
            { Icon: Briefcase, val: job.stipend },
            { Icon: Clock,     val: job.duration },
            { Icon: MapPin,    val: job.location },
            { Icon: Target,    val: `${job.current_applicants}/${job.max_applicants} applied` },
          ].map(({ Icon, val }) => (
            <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-subtle)' }}>
              <Icon size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'var(--text-mid)' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Competition */}
        {matchData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: 500, background: compBg(matchData.competitionLevel), color: compColor(matchData.competitionLevel) }}>
            <TrendingUp size={13} /> {matchData.competitionLevel} competition
          </div>
        )}

        {/* Description */}
        <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '20px' }}>{job.description}</p>

        {/* Match breakdown */}
        {matchData && (
          <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '10px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '12px' }}>Match breakdown</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(matchData.breakdown || {}).map(([key, val]) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-mid)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>{val}%</span>
                  </div>
                  <div style={{ height: '3px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${val}%`, background: 'var(--green)', borderRadius: '999px', transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required skills */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>Required skills</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {job.required_skills?.map((skill, idx) => {
              const matched = matchData?.matchedSkills.find(s => s.name === skill.name);
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {matched ? <CheckCircle2 size={13} style={{ color: 'var(--green)', flexShrink: 0 }} /> : <X size={13} style={{ color: 'var(--red)', flexShrink: 0 }} />}
                    <span style={{ fontSize: '13px', color: matched ? 'var(--text)' : 'var(--text-dim)' }}>{skill.name}</span>
                  </div>
                  {matched && <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>L{matched.studentLevel}/{skill.level}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills gap */}
        {matchData?.missingSkills.length > 0 && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--red-tint)', border: '1px solid var(--red)', marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--red)', marginBottom: '6px' }}>Skills gap</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {matchData.missingSkills.map((s, i) => (
                <span key={i} style={{ padding: '2px 7px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--red)', color: 'var(--red)' }}>{s.name} (L{s.level})</span>
              ))}
            </div>
          </div>
        )}

        {/* Nice to have */}
        {job.nice_to_have?.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>Nice to have</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {job.nice_to_have.map((s, i) => (
                <span key={i} style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'var(--bg-subtle)' }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply CTA */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={onApply} disabled={!canApply || applying} style={{
          width: '100%', padding: '13px', borderRadius: '8px', border: 'none',
          background: 'var(--green)', color: '#fff', fontSize: '13px', fontWeight: 600,
          cursor: canApply && !applying ? 'pointer' : 'not-allowed',
          opacity: (!canApply || applying) ? 0.5 : 1, transition: 'opacity 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          {applying ? 'Submitting…' : !canApply ? 'Weekly limit reached' : <><span>Apply now</span><ChevronRight size={14} /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Swipe view ────────────────────────────────────────────────────────────────
function SwipeView({ jobs, studentProfile, weeklyApplications, onApply, applying, canApply }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [skipped, setSkipped] = useState([]);

  const currentJob = jobs[currentIndex];
  const matchData = currentJob ? calculateMatchScore(studentProfile, currentJob) : null;

  const handleSwipe = (dir) => {
    setSwipeDir(dir);
    setTimeout(() => {
      if (dir === 'right') setShowBreakdown(true);
      else { setSkipped(p => [...p, currentJob.id]); moveToNext(); }
      setSwipeDir(null);
    }, 280);
  };

  const moveToNext = () => {
    setShowBreakdown(false);
    if (currentIndex < jobs.length - 1) setCurrentIndex(i => i + 1);
  };

  const scoreColor = s => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)';
  const scoreBg    = s => s >= 75 ? 'var(--green-tint)' : s >= 50 ? 'var(--amber-tint)' : 'var(--red-tint)';

  if (!currentJob || currentIndex >= jobs.length) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</p>
        <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '20px', color: 'var(--text)', marginBottom: '6px' }}>All caught up.</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>You've reviewed all current matches.</p>
        <button onClick={() => setCurrentIndex(0)} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '12px', cursor: 'pointer' }}>Review again</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
      <div>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none',
          transform: isDragging ? `translateX(${dragOffset.x}px) rotate(${dragOffset.x * 0.04}deg)` : swipeDir === 'right' ? 'translateX(200px) rotate(8deg)' : swipeDir === 'left' ? 'translateX(-200px) rotate(-8deg)' : 'none',
          opacity: swipeDir ? 0 : 1, transition: swipeDir ? 'transform 0.28s, opacity 0.28s' : 'none',
        }}
          onMouseDown={() => setIsDragging(true)}
          onMouseMove={e => { if (isDragging) setDragOffset({ x: e.movementX * 2, y: 0 }); }}
          onMouseUp={() => {
            if (Math.abs(dragOffset.x) > 100) handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
            setIsDragging(false); setDragOffset({ x: 0, y: 0 });
          }}
          onMouseLeave={() => { setIsDragging(false); setDragOffset({ x: 0, y: 0 }); }}
        >
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>{currentJob.logo}</span>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '2px' }}>{currentJob.company}</p>
                <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)' }}>{currentJob.role}</h3>
              </div>
            </div>
            {matchData && (
              <div style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '14px', fontFamily: "'Editorial New', Georgia, serif", color: scoreColor(matchData.score), background: scoreBg(matchData.score) }}>
                {matchData.score}%
              </div>
            )}
          </div>
          <div style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '12px' }}>{currentJob.description}</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[{ Icon: Briefcase, val: currentJob.stipend }, { Icon: MapPin, val: currentJob.location }].map(({ Icon, val }) => (
                <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icon size={11} style={{ color: 'var(--text-dim)' }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
          <button onClick={() => handleSwipe('left')} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.background = 'var(--red-tint)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}>
            <X size={18} style={{ color: 'var(--red)' }} />
          </button>
          <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>swipe</span>
          <button onClick={() => handleSwipe('right')} disabled={!canApply} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: canApply ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: canApply ? 1 : 0.3 }}
            onMouseEnter={e => { if (canApply) { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-tint)'; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}>
            <Heart size={18} style={{ color: 'var(--green)' }} />
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-dim)', marginTop: '8px' }}>{currentIndex + 1} of {jobs.length}</p>
      </div>

      {/* Breakdown panel */}
      {showBreakdown && matchData && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>Match breakdown</p>
          <div style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '32px', color: scoreColor(matchData.score), marginBottom: '16px' }}>{matchData.score}%</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {Object.entries(matchData.breakdown || {}).map(([key, val]) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-mid)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>{val}%</span>
                </div>
                <div style={{ height: '3px', background: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${val}%`, background: 'var(--green)', borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={() => { onApply(currentJob, matchData); moveToNext(); }} disabled={!canApply || applying} style={{ padding: '11px', borderRadius: '8px', border: 'none', background: 'var(--green)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: (!canApply || applying) ? 0.4 : 1 }}>
              {applying ? 'Submitting…' : 'Apply now'}
            </button>
            <button onClick={moveToNext} style={{ padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '12px', cursor: 'pointer' }}>Skip for now</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [weeklyApplications, setWeeklyApplications] = useState(0);
  const [applying, setApplying] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showGuide, setShowGuide] = useState(true);
  const [notified, setNotified] = useState(false);
  // Explore state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'swipe'
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isPanelMaximized, setIsPanelMaximized] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [huntFastActive, setHuntFastActive] = useState(false);
  const [filters, setFilters] = useState({ role: '', location: '', minMatch: 0, stipend: 'Any', duration: 'Any', skill: '' });
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [homeSubTab, setHomeSubTab] = useState('applications');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('account');
  // Mock notifications — empty initially, shows dot when populated
  const notifications = [];

  const WEEKLY_LIMIT = 5;
  const remainingApplications = WEEKLY_LIMIT - weeklyApplications;
  const canApply = remainingApplications > 0;
  const initials = studentProfile?.full_name?.split(' ').map(n => n[0]).join('') || 'U';

  useEffect(() => { applyTokens(theme); localStorage.setItem('hunt-theme', theme); }, [theme]);
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profile = await getStudentProfile();
      if (!profile) { navigate('/onboarding'); return; }
      setStudentProfile(profile);
      const welcomed = localStorage.getItem(`hunt-welcomed-${profile.id}`);
      if (welcomed) { setShowWelcome(false); setShowGuide(false); }
      const activeJobs = await getActiveJobs();
      const jobsWithScores = activeJobs.map(job => ({
        ...job, _match: calculateMatchScore(profile, job)
      }));
      setAllJobs(jobsWithScores.filter(j => j._match.score >= 30).sort((a, b) => b._match.score - a._match.score));
      setWeeklyApplications(await getWeeklyApplicationCount());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFilterChange = (key, val) => {
    if (key === 'reset') { setFilters({ role: '', location: '', minMatch: 0, stipend: 'Any', duration: 'Any', skill: '' }); return; }
    setFilters(prev => ({ ...prev, [key]: prev[key] === val ? '' : val }));
  };

  // Apply all filters + search + hunt fast
  const displayedJobs = allJobs.filter(job => {
    const m = job._match;
    if (m.score < filters.minMatch) return false;
    if (filters.role && !job.role?.toLowerCase().includes(filters.role.toLowerCase())) return false;
    if (filters.location) {
      const loc = job.location?.toLowerCase() || '';
      if (filters.location === 'Remote' && !loc.includes('remote')) return false;
      if (filters.location === 'Hybrid' && !loc.includes('hybrid')) return false;
      if (filters.location === 'On-site' && loc.includes('remote')) return false;
    }
    if (filters.stipend !== 'Any') {
      const num = parseInt((job.stipend || '0').replace(/[^0-9]/g, ''));
      const thresh = parseInt(filters.stipend) * 1000;
      if (num < thresh) return false;
    }
    if (filters.skill && !job.required_skills?.some(s => s.name?.toLowerCase().includes(filters.skill.toLowerCase()))) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!job.role?.toLowerCase().includes(q) && !job.company?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => huntFastActive ? b._match.score - a._match.score : 0);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setSelectedMatch(job._match);
  };

  const handleApply = async (job, matchData) => {
    if (applying || weeklyApplications >= WEEKLY_LIMIT) return;
    setApplying(true);
    try {
      await createApplication(job.id, matchData.score, matchData.breakdown);
      const airtableData = prepareApplicationData(studentProfile, job, matchData.score, matchData.breakdown);
      await sendToAirtable(airtableData);
      setAppliedJobs(p => [...p, { ...job, matchScore: matchData.score }]);
      setWeeklyApplications(c => c + 1);
      setSelectedJob(null);
    } catch (err) { alert('Failed: ' + err.message); }
    finally { setApplying(false); }
  };

  const handleSignOut = async () => { try { await signOut(); navigate('/'); } catch (e) { console.error(e); } };
  const dismissWelcome = () => { setShowWelcome(false); if (studentProfile?.id) localStorage.setItem(`hunt-welcomed-${studentProfile.id}`, '1'); };
  const handleSaveToggle = (job) => {
    setSavedJobs(prev => prev.some(j => j.id === job.id) ? prev.filter(j => j.id !== job.id) : [...prev, job]);
  };
  const isJobSaved = (jobId) => savedJobs.some(j => j.id === jobId);
  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => v && v !== 'Any' && v !== 0 && v !== '').length;

  if (loading) return <LoadingScreen />;

  const navItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'home',    label: 'Home',    icon: Home },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes hunt-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .hn-item:hover { background: var(--bg-subtle) !important; }
        .hn-card:hover { border-color: var(--border-mid) !important; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: '210px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0, borderRight: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--text)' }}>HUNT</span>
        </div>

        <nav style={{ padding: '10px 8px', flex: 1 }}>
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} className="hn-item" onClick={() => setActiveTab(id)}
                style={{ display: 'flex', alignItems: 'center', gap: '9px', width: '100%', padding: '9px 11px', borderRadius: '7px', border: 'none', cursor: 'pointer', marginBottom: '1px', background: active ? 'var(--bg-subtle)' : 'transparent', color: active ? 'var(--text)' : 'var(--text-dim)', fontSize: '13px', fontWeight: active ? 600 : 400, textAlign: 'left', transition: 'background 0.12s' }}>
                <Icon size={15} style={{ flexShrink: 0 }} />
                {label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
          {/* Applies left bar */}
          <div style={{ padding: '9px 11px', borderRadius: '7px', background: 'var(--bg-subtle)', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Applies left</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--green)' }}>{remainingApplications}/5</span>
            </div>
            <div style={{ height: '3px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--green)', width: `${(remainingApplications / 5) * 100}%`, borderRadius: '999px' }} />
            </div>
          </div>

          {/* Icon row: Bell + Theme toggle */}
          <div style={{ display: 'flex', gap: '4px', padding: '0 2px', marginBottom: '6px' }}>
            {/* Bell with notification dot */}
            <button onClick={() => setShowNotifications(p => !p)} style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: showNotifications ? 'var(--bg-subtle)' : 'none', border: 'none', cursor: 'pointer', padding: '7px', borderRadius: '6px', color: notifications.length > 0 ? 'var(--text)' : 'var(--text-dim)' }}
              className="hn-item">
              <Bell size={13} />
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: '5px', right: '5px', width: '6px', height: '6px', borderRadius: '50%', background: '#E53E3E', border: '1.5px solid var(--bg-card)' }} />
              )}
            </button>
            {/* Theme toggle */}
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '7px', borderRadius: '6px', color: 'var(--text-dim)' }}
              className="hn-item">
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </button>
          </div>

          {/* Account pill — opens account dropdown */}
          <div onClick={() => setShowAccountMenu(p => !p)} className="hn-item" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 11px', borderRadius: '7px', cursor: 'pointer', transition: 'background 0.12s', position: 'relative' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, background: 'var(--green-tint)', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--green)' }}>{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{studentProfile?.full_name}</p>
              <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Student</p>
            </div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" style={{ flexShrink: 0, transform: showAccountMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          {/* Account dropdown */}
          {showAccountMenu && (
            <div style={{ margin: '4px 2px 0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '1px' }}>Signed in as</p>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--green)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{studentProfile?.email || studentProfile?.full_name}</p>
              </div>
              {[
                { label: 'Profile', action: () => { setActiveTab('profile'); setShowAccountMenu(false); } },
                { label: 'Settings', action: () => { setShowSettings(true); setShowAccountMenu(false); } },
                { label: 'Support', action: () => { window.open('mailto:support@hunt.so'); setShowAccountMenu(false); } },
              ].map(item => (
                <button key={item.label} onClick={item.action} className="hn-item" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: '12px', color: 'var(--text-mid)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={handleSignOut} className="hn-item" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: '12px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── HOME ── */}
        {activeTab === 'home' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', animation: 'hunt-fade-in 0.3s ease' }}>

              {/* Welcome / greeting */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '6px' }}>Home</p>
                <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '28px', fontWeight: 400, color: 'var(--text)' }}>
                  {(() => {
                    const welcomed = studentProfile?.id ? localStorage.getItem(`hunt-welcomed-${studentProfile.id}`) : null;
                    const firstName = studentProfile?.full_name?.split(' ')[0] || 'there';
                    return welcomed ? <>Welcome back, <em>{firstName}.</em></> : <>Welcome to HUNT, <em>{firstName}.</em></>;
                  })()}
                </h1>
              </div>

              {/* ── Important tasks ── */}
              {(() => {
                const tasks = [];
                const p = studentProfile;
                if (!p?.profile_completeness || p.profile_completeness < 100)
                  tasks.push({ id: 'profile', title: 'Complete your profile', desc: `You're ${p?.profile_completeness || 0}% done — finish to improve match scores.`, cta: 'Complete now', action: () => navigate('/onboarding'), pct: p?.profile_completeness || 0 });
                if (!p?.linkedin_url)
                  tasks.push({ id: 'linkedin', title: 'Link LinkedIn', desc: 'Recruiters always check LinkedIn first. Add it to boost visibility.', cta: 'Add LinkedIn', action: () => navigate('/profile') });
                if (!p?.github_url)
                  tasks.push({ id: 'github', title: 'Add GitHub', desc: 'Your GitHub is proof of work. It directly improves your match score.', cta: 'Add GitHub', action: () => navigate('/profile') });
                if (!p?.resume_url)
                  tasks.push({ id: 'resume', title: 'Upload resume', desc: 'Hiring managers are more likely to reach out when they see a resume.', cta: 'Upload now', action: () => navigate('/profile') });
                if (tasks.length === 0) return null;
                return (
                  <div style={{ marginBottom: '32px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '14px' }}>Important tasks ({tasks.length})</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                      {tasks.map(task => (
                        <div key={task.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '5px' }}>{task.title}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>{task.desc}</p>
                          </div>
                          {task.pct !== undefined && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Progress</span>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--green)' }}>{task.pct}%</span>
                              </div>
                              <div style={{ height: '3px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${task.pct}%`, background: 'var(--green)', borderRadius: '999px' }} />
                              </div>
                            </div>
                          )}
                          <button onClick={task.action} style={{ padding: '9px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer', background: 'var(--text)', color: 'var(--bg)', fontSize: '12px', fontWeight: 600, alignSelf: 'flex-start' }}>
                            {task.cta}
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })()}

              {/* ── Sub-tabs ── */}
              <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '24px', display: 'flex' }}>
                {[
                  { id: 'applications', label: 'Applications' },
                  { id: 'saved',        label: 'Saved' },
                  { id: 'offers',       label: 'Offers' },
                  { id: 'assessments',  label: 'Assessments' },
                ].map(t => (
                  <button key={t.id} onClick={() => setHomeSubTab(t.id)} style={{
                    padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: homeSubTab === t.id ? 600 : 400,
                    color: homeSubTab === t.id ? 'var(--text)' : 'var(--text-dim)',
                    borderBottom: homeSubTab === t.id ? '2px solid var(--text)' : '2px solid transparent',
                    marginBottom: '-1px', transition: 'color 0.12s', whiteSpace: 'nowrap',
                  }}>{t.label}</button>
                ))}
              </div>

              {/* Applications */}
              {homeSubTab === 'applications' && (
                appliedJobs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                    <ClipboardList size={28} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 12px' }} />
                    <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>No applications yet</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '20px' }}>All your applications will be visible here</p>
                    <button onClick={() => setActiveTab('explore')} style={{ padding: '9px 18px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '12px', cursor: 'pointer' }}>
                      Explore opportunities
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {appliedJobs.map((job, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '22px' }}>{job.logo}</span>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{job.role}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{job.company} · Applied</p>
                          </div>
                        </div>
                        <div style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--green)' }}>{job.matchScore}%</div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Saved */}
              {homeSubTab === 'saved' && (
                savedJobs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                    <Bookmark size={28} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 12px' }} />
                    <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>Nothing saved yet</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '20px' }}>Save listings to easily find them later</p>
                    <button onClick={() => setActiveTab('explore')} style={{ padding: '9px 18px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '12px', cursor: 'pointer' }}>
                      Explore opportunities
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {savedJobs.map(job => (
                      <div key={job.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px', position: 'relative' }}>
                        <button onClick={() => handleSaveToggle(job)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)' }}>
                          <Bookmark size={14} fill='var(--green)' />
                        </button>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                          <span style={{ fontSize: '22px' }}>{job.logo}</span>
                          <div>
                            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '2px' }}>{job.company}</p>
                            <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '14px', color: 'var(--text)', lineHeight: 1.2 }}>{job.role}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          {[{ Icon: Briefcase, val: job.stipend }, { Icon: MapPin, val: job.location }].map(({ Icon, val }) => (
                            <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Icon size={11} style={{ color: 'var(--text-dim)' }} />
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{val}</span>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => { setActiveTab('explore'); handleJobClick(job); }} style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '11px', cursor: 'pointer' }}>
                          View & apply
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Offers */}
              {homeSubTab === 'offers' && (
                <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                  <Star size={28} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 12px' }} />
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>No offers yet</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>All your offers will be visible here once recruiters reach out</p>
                </div>
              )}

              {/* Assessments */}
              {homeSubTab === 'assessments' && (
                <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                  <FileText size={28} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 12px' }} />
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>Assessments coming soon</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', maxWidth: '300px', margin: '4px auto 0' }}>Skill verifications and tests will appear here to boost your profile score</p>
                </div>
              )}

          </div>
        )}

        {/* ── EXPLORE ── */}
        {activeTab === 'explore' && (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', animation: 'hunt-fade-in 0.3s ease' }}>

            {/* Left: list/grid panel */}
            <div style={{
              flex: selectedJob && !isPanelMaximized ? '0 0 42%' : 1,
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              borderRight: selectedJob ? '1px solid var(--border)' : 'none',
              transition: 'flex 0.2s ease',
            }}>
              {/* Toolbar */}
              <div style={{ padding: '18px 24px 0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '2px' }}>Explore</p>
                    <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '22px', fontWeight: 400, color: 'var(--text)' }}>Opportunities</h1>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Hunt Fast */}
                    <button onClick={() => setHuntFastActive(p => !p)} style={{
                      display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                      background: huntFastActive ? 'var(--text)' : 'var(--bg-subtle)', color: huntFastActive ? 'var(--bg)' : 'var(--text-mid)',
                      transition: 'all 0.15s',
                    }}>
                      <Sparkles size={13} /> Hunt Fast
                    </button>
                    {/* View toggle */}
                    <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '7px', padding: '2px', border: '1px solid var(--border)' }}>
                      {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'swipe', Icon: Heart }].map(({ mode, Icon }) => (
                        <button key={mode} onClick={() => { setViewMode(mode); setSelectedJob(null); }}
                          style={{ padding: '5px 8px', borderRadius: '5px', border: 'none', cursor: 'pointer', background: viewMode === mode ? 'var(--bg-card)' : 'transparent', color: viewMode === mode ? 'var(--text)' : 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                    {/* Filter */}
                    <button onClick={() => setShowFilters(p => !p)} style={{
                      display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '7px', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '11px',
                      background: showFilters || activeFiltersCount > 0 ? 'var(--bg-subtle)' : 'transparent', color: 'var(--text-mid)',
                    }}>
                      <SlidersHorizontal size={13} />
                      {activeFiltersCount > 0 && <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--green)', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFiltersCount}</span>}
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search roles or companies…"
                    style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Filters panel */}
                {showFilters && <FilterPanel filters={filters} onChange={handleFilterChange} onClose={() => setShowFilters(false)} jobs={allJobs} />}
              </div>

              {/* Results count */}
              {allJobs.length > 0 && (
                <div style={{ padding: '0 24px 10px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    {displayedJobs.length} {displayedJobs.length === 1 ? 'opportunity' : 'opportunities'}
                    {huntFastActive && <span style={{ color: 'var(--green)', marginLeft: '6px' }}>· sorted by best match</span>}
                  </span>
                </div>
              )}

              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
                {allJobs.length === 0 ? (
                  // Empty state
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '56px 28px', textAlign: 'center', marginTop: '8px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '14px' }}>🎯</div>
                    <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '20px', fontWeight: 400, color: 'var(--text)', marginBottom: '8px' }}>No matching opportunities right now</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-dim)', maxWidth: '300px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                      We're onboarding new companies. We'll notify you the moment a role matches your skills.
                    </p>
                    {!notified ? (
                      <button onClick={() => setNotified(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--green)', color: '#fff', fontSize: '12px', fontWeight: 500 }}>
                        <BellRing size={13} /> Notify me when available
                      </button>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green)', fontSize: '12px' }}>
                        <CheckCircle2 size={13} /> You'll be notified — we're on it.
                      </div>
                    )}
                  </div>
                ) : viewMode === 'swipe' ? (
                  <div style={{ marginTop: '8px' }}>
                    <SwipeView jobs={displayedJobs} studentProfile={studentProfile} weeklyApplications={weeklyApplications} onApply={handleApply} applying={applying} canApply={canApply} />
                  </div>
                ) : displayedJobs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', fontSize: '13px' }}>
                    No results match your filters. <button onClick={() => handleFilterChange('reset')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: '13px', textDecoration: 'underline' }}>Clear filters</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr' : 'repeat(2, 1fr)', gap: '10px', marginTop: '8px' }}>
                    {displayedJobs.map(job => (
                      <JobGridCard key={job.id} job={job} matchData={job._match} isSelected={selectedJob?.id === job.id} onClick={() => handleJobClick(job)} isSaved={isJobSaved(job.id)} onSave={handleSaveToggle} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: detail panel */}
            {selectedJob && viewMode === 'grid' && (
              <div style={{
                flex: isPanelMaximized ? 1 : '0 0 58%',
                overflow: 'hidden', transition: 'flex 0.2s ease',
              }}>
                <JobDetailPanel
                  job={selectedJob}
                  matchData={selectedMatch}
                  isMaximized={isPanelMaximized}
                  onToggleMaximize={() => setIsPanelMaximized(p => !p)}
                  onClose={() => { setSelectedJob(null); setIsPanelMaximized(false); }}
                  onApply={() => handleApply(selectedJob, selectedMatch)}
                  applying={applying}
                  canApply={canApply}
                  isSaved={isJobSaved(selectedJob?.id)}
                  onSave={handleSaveToggle}
                />
              </div>
            )}
          </div>
        )}

        {/* ── NETWORK ── */}
        {activeTab === 'network' && (
          <NetworkTab studentProfile={studentProfile} />
        )}

        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <ProfileTab studentProfile={studentProfile} setStudentProfile={setStudentProfile} theme={theme} setTheme={setTheme} />
        )}

      </main>

      {/* ── NOTIFICATION FLYOUT ── */}
      {showNotifications && (
        <>
          <div onClick={() => setShowNotifications(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
          <div style={{ position: 'fixed', bottom: '130px', left: '218px', width: '300px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', zIndex: 100, boxShadow: '0 8px 28px rgba(0,0,0,0.12)', overflow: 'hidden', animation: 'hunt-fade-in 0.15s ease' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>Notifications</p>
              {notifications.length > 0 && <span style={{ fontSize: '10px', color: 'var(--text-dim)', cursor: 'pointer' }}>Mark all read</span>}
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <Bell size={22} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '4px', fontFamily: "'Editorial New', Georgia, serif" }}>All clear</p>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No notifications right now.</p>
              </div>
            ) : (
              <div>
                {notifications.map((n, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0, marginTop: '4px' }} />
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '2px' }}>{n.text}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── SETTINGS SIDE PANEL ── */}
      {showSettings && (
        <>
          <div onClick={() => setShowSettings(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '440px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 28px rgba(0,0,0,0.1)', animation: 'hunt-slide-in 0.2s ease' }}>
            <style>{`@keyframes hunt-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
            {/* Panel header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>Settings</p>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>
            {/* Settings tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              {['account', 'preferences', 'privacy'].map(t => (
                <button key={t} onClick={() => setSettingsTab(t)} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: settingsTab === t ? 600 : 400, color: settingsTab === t ? 'var(--text)' : 'var(--text-dim)', borderBottom: settingsTab === t ? '2px solid var(--text)' : '2px solid transparent', marginBottom: '-1px', textTransform: 'capitalize' }}>
                  {t}
                </button>
              ))}
            </div>
            {/* Settings content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {settingsTab === 'account' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', borderRadius: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--green-tint)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{studentProfile?.full_name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px' }}>{studentProfile?.email}</p>
                      <label style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-mid)', background: 'var(--bg-card)' }}>
                        Change avatar
                        <input type="file" accept="image/*" style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                  {/* Change email */}
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Email address</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '10px' }}>Update your login email address.</p>
                    <input defaultValue={studentProfile?.email || ''} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }} placeholder="you@example.com" />
                    <button style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Save email</button>
                  </div>
                  {/* Delete account */}
                  <div style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--red)', background: 'var(--red-tint)' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--red)', marginBottom: '3px' }}>Delete account</p>
                    <p style={{ fontSize: '11px', color: 'var(--red)', opacity: 0.8, marginBottom: '10px' }}>Permanently delete your account and all data. This cannot be undone.</p>
                    <button style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid var(--red)', background: 'transparent', color: 'var(--red)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Delete account</button>
                  </div>
                </div>
              )}
              {settingsTab === 'preferences' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Theme */}
                  <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Appearance</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px' }}>Choose your preferred theme.</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['light', 'dark'].map(t => (
                        <button key={t} onClick={() => setTheme(t)} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: `1.5px solid ${theme === t ? 'var(--text)' : 'var(--border)'}`, background: theme === t ? 'var(--bg-card)' : 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: theme === t ? 600 : 400, color: 'var(--text)', textTransform: 'capitalize' }}>
                          {t === 'light' ? '☀️' : '🌙'} {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Notifications pref */}
                  <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>Email notifications</p>
                    {[
                      { label: 'New job matches', sub: 'When a new job matches your skills' },
                      { label: 'Application updates', sub: 'When a recruiter views your profile' },
                      { label: 'Weekly digest', sub: 'Summary of activity every Monday' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '1px' }}>{item.label}</p>
                          <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{item.sub}</p>
                        </div>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--green)', width: '16px', height: '16px', cursor: 'pointer' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {settingsTab === 'privacy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { title: 'Profile visibility', sub: 'Allow recruiters to find you in search results', checked: true },
                    { title: 'Show college name', sub: 'Display your college name on your profile', checked: true },
                    { title: 'Show match scores', sub: 'Let other students see your match score badges', checked: false },
                    { title: 'Activity status', sub: 'Show when you were last active on HUNT', checked: false },
                  ].map(item => (
                    <div key={item.title} style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{item.title}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{item.sub}</p>
                      </div>
                      <input type="checkbox" defaultChecked={item.checked} style={{ accentColor: 'var(--green)', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Network Tab ───────────────────────────────────────────────────────────────
const MOCK_CONNECTIONS = [
  { id: 'c1', name: 'Arjun Mehta', college: 'VJTI Mumbai', role: 'Backend Dev', skills: ['Node.js', 'Python'], status: 'on_hunt', mutual: 3 },
  { id: 'c2', name: 'Sneha Patil', college: 'COEP Pune', role: 'Frontend Dev', skills: ['React', 'Figma'], status: 'on_hunt', mutual: 1 },
  { id: 'c3', name: 'Rahul Desai', college: 'VJTI Mumbai', role: 'ML Engineer', skills: ['Python', 'TensorFlow'], status: 'invited', mutual: 2 },
  { id: 'c4', name: 'Priyanka Singh', college: 'NIT Surat', role: 'Full Stack', skills: ['React', 'Node.js'], status: 'not_invited', mutual: 0 },
  { id: 'c5', name: 'Karan Shah', college: 'DJ Sanghvi', role: 'DevOps', skills: ['Docker', 'AWS'], status: 'on_hunt', mutual: 4 },
  { id: 'c6', name: 'Aisha Khan', college: 'SPIT Mumbai', role: 'Data Science', skills: ['Python', 'SQL'], status: 'not_invited', mutual: 1 },
];

const MOCK_DISCOVER = [
  { id: 'd1', name: 'Vikram Nair', college: 'NIT Calicut', role: 'Backend Dev', skills: ['Go', 'PostgreSQL'], connections: 12 },
  { id: 'd2', name: 'Meera Joshi', college: 'BITS Goa', role: 'Frontend Dev', skills: ['React', 'TypeScript'], connections: 8 },
  { id: 'd3', name: 'Siddharth Rao', college: 'NIT Trichy', role: 'ML Intern', skills: ['Python', 'PyTorch'], connections: 5 },
  { id: 'd4', name: 'Ananya Gupta', college: 'DTU Delhi', role: 'Full Stack', skills: ['React', 'Node.js'], connections: 19 },
  { id: 'd5', name: 'Rohan Verma', college: 'VJTI Mumbai', role: 'DevOps', skills: ['Kubernetes', 'AWS'], connections: 7 },
  { id: 'd6', name: 'Tanya Iyer', college: 'IIIT Hyderabad', role: 'Data Engineer', skills: ['Spark', 'Python'], connections: 11 },
];

const LI_SVG = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const WA_SVG = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

function PersonCard({ person, type, onAction, inviteLink }) {
  const initials = person.name.split(' ').map(n => n[0]).join('');
  const colors = ['#1A7A4A','#0A66C2','#9333EA','#D97706','#DC2626','#0891B2'];
  const color = colors[person.name.charCodeAt(0) % colors.length];

  const statusBadge = {
    on_hunt:     { label: 'On HUNT', bg: 'var(--green-tint)', color: 'var(--green)' },
    invited:     { label: 'Invited', bg: 'var(--amber-tint)', color: 'var(--amber)' },
    not_invited: { label: 'Not yet', bg: 'var(--bg-subtle)', color: 'var(--text-dim)' },
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.name}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.college}</p>
        </div>
        {person.status && statusBadge[person.status] && (
          <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: statusBadge[person.status].bg, color: statusBadge[person.status].color, fontWeight: 600, flexShrink: 0 }}>
            {statusBadge[person.status].label}
          </span>
        )}
      </div>

      {/* Role */}
      <p style={{ fontSize: '11px', color: 'var(--text-mid)' }}>{person.role}</p>

      {/* Skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {person.skills.map(s => (
          <span key={s} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'var(--bg-subtle)' }}>{s}</span>
        ))}
      </div>

      {/* Mutual */}
      {person.mutual > 0 && (
        <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{person.mutual} mutual connection{person.mutual > 1 ? 's' : ''}</p>
      )}
      {person.connections != null && (
        <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{person.connections} connections on HUNT</p>
      )}

      {/* Action button */}
      {type === 'connection' && person.status === 'on_hunt' && (
        <button style={{ padding: '7px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}>
          Message (coming soon)
        </button>
      )}
      {type === 'connection' && person.status === 'not_invited' && (
        <button onClick={() => { const msg = encodeURIComponent(`Hey ${person.name.split(' ')[0]}! I'm using HUNT to find internships — join with my link: ${inviteLink}`); window.open(`https://wa.me/?text=${msg}`, '_blank'); }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px', borderRadius: '7px', border: 'none', background: '#25D366', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
          {WA_SVG} Invite to HUNT
        </button>
      )}
      {type === 'connection' && person.status === 'invited' && (
        <button disabled style={{ padding: '7px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: '11px', cursor: 'default' }}>
          Invite sent ✓
        </button>
      )}
      {type === 'discover' && (
        <button style={{ padding: '7px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}>
          Connect (coming soon)
        </button>
      )}
    </div>
  );
}

function NetworkTab({ studentProfile }) {
  const [networkSubTab, setNetworkSubTab] = useState('connections');
  const [discoverSearch, setDiscoverSearch] = useState('');
  const [csvImported, setCsvImported] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const inviteSlug = studentProfile?.full_name?.split(' ')[0]?.toLowerCase() || 'you';
  const inviteLink = `https://hunt.so/invite/${inviteSlug}`;

  const filteredDiscover = MOCK_DISCOVER.filter(p =>
    p.name.toLowerCase().includes(discoverSearch.toLowerCase()) ||
    p.college.toLowerCase().includes(discoverSearch.toLowerCase()) ||
    p.role.toLowerCase().includes(discoverSearch.toLowerCase())
  );

  const networkSubTabs = [
    { id: 'connections', label: 'My Connections' },
    { id: 'alumni',      label: 'Alumni' },
    { id: 'discover',    label: 'Discover' },
    { id: 'referrals',   label: 'Referrals' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'hunt-fade-in 0.3s ease' }}>
      {/* Header */}
      <div style={{ padding: '28px 40px 0', flexShrink: 0 }}>
        <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>Network</p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '26px', fontWeight: 400, color: 'var(--text)', marginBottom: '16px' }}>
          Connections & Referrals
        </h1>
        {/* Sub-tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '0' }}>
          {networkSubTabs.map(t => (
            <button key={t.id} onClick={() => setNetworkSubTab(t.id)} style={{
              padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: networkSubTab === t.id ? 600 : 400,
              color: networkSubTab === t.id ? 'var(--text)' : 'var(--text-dim)',
              borderBottom: networkSubTab === t.id ? '2px solid var(--text)' : '2px solid transparent',
              marginBottom: '-1px', whiteSpace: 'nowrap',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 40px' }}>

        {/* ── MY CONNECTIONS ── */}
        {networkSubTab === 'connections' && (
          <div>
            {/* Import bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'stretch' }}>
              {/* LinkedIn card */}
              <div style={{ flex: 1, minWidth: '280px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {LI_SVG}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>Import from LinkedIn</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Opens LinkedIn → export your connections CSV</p>
                </div>
                <button onClick={() => window.open('https://www.linkedin.com/psettings/member-data', '_blank')}
                  style={{ padding: '7px 14px', borderRadius: '7px', border: 'none', background: '#0A66C2', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Go to LinkedIn
                </button>
              </div>
              {/* CSV upload card */}
              <div style={{ flex: 1, minWidth: '280px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>Upload Connections.csv</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{csvImported ? '✓ 47 connections imported' : 'Upload the CSV you downloaded from LinkedIn'}</p>
                </div>
                <label style={{ padding: '7px 14px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: csvImported ? 'var(--green)' : 'var(--text-mid)', fontSize: '11px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {csvImported ? 'Re-upload' : 'Upload CSV'}
                  <input type="file" accept=".csv" style={{ display: 'none' }} onChange={() => setCsvImported(true)} />
                </label>
              </div>
            </div>

            {/* Connection cards grid */}
            {csvImported ? (
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                  47 connections found · <span style={{ color: 'var(--green)' }}>3 already on HUNT</span>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {MOCK_CONNECTIONS.map(c => (
                    <PersonCard key={c.id} person={c} type="connection" inviteLink={inviteLink} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  {LI_SVG}
                </div>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)', marginBottom: '6px' }}>Import your LinkedIn connections</p>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', maxWidth: '340px', margin: '0 auto 4px', lineHeight: 1.6 }}>
                  Step 1: Click "Go to LinkedIn" → download your connections CSV.<br />
                  Step 2: Upload it here — we'll show who's on HUNT and let you invite the rest.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── ALUMNI ── */}
        {networkSubTab === 'alumni' && (
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '20px', lineHeight: 1.5 }}>
              People from <strong style={{ color: 'var(--text)' }}>{studentProfile?.college || 'your college'}</strong> or companies you've interacted with on HUNT.
            </p>
            {/* Same college section */}
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '12px' }}>
              From {studentProfile?.college || 'your college'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '28px' }}>
              {MOCK_CONNECTIONS.filter((_, i) => i < 3).map(c => (
                <PersonCard key={c.id} person={{ ...c, status: 'on_hunt' }} type="connection" inviteLink={inviteLink} />
              ))}
            </div>
            {/* Companies section */}
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '12px' }}>
              At companies hiring on HUNT
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {MOCK_DISCOVER.filter((_, i) => i < 3).map(c => (
                <PersonCard key={c.id} person={c} type="discover" inviteLink={inviteLink} />
              ))}
            </div>
          </div>
        )}

        {/* ── DISCOVER ── */}
        {networkSubTab === 'discover' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={discoverSearch} onChange={e => setDiscoverSearch(e.target.value)}
                placeholder="Search by name, college, or role…"
                style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '16px' }}>{filteredDiscover.length} students on HUNT</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {filteredDiscover.map(p => (
                <PersonCard key={p.id} person={p} type="discover" inviteLink={inviteLink} />
              ))}
            </div>
            {filteredDiscover.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', fontSize: '13px' }}>
                No results for "{discoverSearch}"
              </div>
            )}
          </div>
        )}

        {/* ── REFERRALS ── */}
        {networkSubTab === 'referrals' && (
          <div style={{ maxWidth: '680px' }}>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Friends invited', val: '0' },
                { label: 'Joined HUNT', val: '0' },
                { label: 'Priority boosts', val: '0' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', textAlign: 'center' }}>
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '28px', color: 'var(--green)', marginBottom: '4px' }}>{s.val}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Invite link */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px 24px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Your invite link</p>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '14px' }}>Share this link — every friend who joins boosts your priority ranking.</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inviteLink}
                </div>
                <button onClick={() => { navigator.clipboard?.writeText(inviteLink); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}
                  style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: linkCopied ? 'var(--green-tint)' : 'transparent', color: linkCopied ? 'var(--green)' : 'var(--text-mid)', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                  {linkCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Share buttons 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* WhatsApp */}
              <button onClick={() => { const msg = encodeURIComponent(`Hey! I'm on HUNT — it matches internships on skills, not college name. Join with my link: ${inviteLink}`); window.open(`https://wa.me/?text=${msg}`, '_blank'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{WA_SVG}</div>
                <div><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>WhatsApp</p><p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Send to your contacts</p></div>
              </button>
              {/* X */}
              <button onClick={() => { const msg = encodeURIComponent(`Internships matched on skills, not college name 🎯 Check out HUNT → ${inviteLink}`); window.open(`https://twitter.com/intent/tweet?text=${msg}`, '_blank'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
                <div><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Post on X</p><p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Tweet to your followers</p></div>
              </button>
              {/* Instagram */}
              <button onClick={() => { navigator.clipboard?.writeText(inviteLink); alert('Link copied! Paste it in your Instagram bio or story.'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </div>
                <div><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Instagram</p><p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Copy link for bio/stories</p></div>
              </button>
              {/* Email */}
              <button onClick={() => window.open(`mailto:?subject=Join me on HUNT&body=Hey! I'm finding internships on HUNT — it matches based on your skills, not just your college name. Way better than Internshala. Join here: ${inviteLink}`, '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Email</p><p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Send to specific people</p></div>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Profile Tab ───────────────────────────────────────────────────────────────
const SKILL_OPTIONS_P = [
  { name: 'JavaScript', cat: 'Language' }, { name: 'Python', cat: 'Language' },
  { name: 'TypeScript', cat: 'Language' }, { name: 'Java', cat: 'Language' },
  { name: 'C / C++', cat: 'Language' }, { name: 'Golang', cat: 'Language' },
  { name: 'SQL', cat: 'Language' }, { name: 'React', cat: 'Frontend' },
  { name: 'Next.js', cat: 'Frontend' }, { name: 'Tailwind CSS', cat: 'Frontend' },
  { name: 'Node.js', cat: 'Backend' }, { name: 'Express.js', cat: 'Backend' },
  { name: 'Django', cat: 'Backend' }, { name: 'FastAPI', cat: 'Backend' },
  { name: 'REST API', cat: 'Backend' }, { name: 'GraphQL', cat: 'Backend' },
  { name: 'PostgreSQL', cat: 'Database' }, { name: 'MongoDB', cat: 'Database' },
  { name: 'MySQL', cat: 'Database' }, { name: 'Redis', cat: 'Database' },
  { name: 'Machine Learning', cat: 'Data Science' }, { name: 'TensorFlow', cat: 'Data Science' },
  { name: 'PyTorch', cat: 'Data Science' }, { name: 'Pandas', cat: 'Data Science' },
  { name: 'Docker', cat: 'DevOps' }, { name: 'AWS', cat: 'DevOps' },
  { name: 'CI/CD', cat: 'DevOps' }, { name: 'Linux', cat: 'DevOps' },
  { name: 'Git', cat: 'Tools' }, { name: 'Figma', cat: 'Design' },
  { name: 'Flutter', cat: 'Mobile' }, { name: 'React Native', cat: 'Mobile' },
];
const SKILL_CATS_P = [...new Set(SKILL_OPTIONS_P.map(s => s.cat))];
const LEVEL_LABELS_P = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
const ROLE_OPTIONS_P = [
  'Full Stack Developer', 'Backend Developer', 'Frontend Developer',
  'Mobile Developer', 'DevOps Engineer', 'Data Analyst',
  'ML Engineer', 'UI/UX Designer', 'Security Engineer', 'QA Engineer',
];

const inp_p = { width: '100%', padding: '9px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };

function Toggle_P({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{ width: 34, height: 19, borderRadius: 10, background: on ? 'var(--green)' : 'var(--border-mid)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 17 : 2, width: 15, height: 15, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.18s' }} />
    </div>
  );
}

const GH_SVG_P = <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>;
const LI_SVG_P = <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const LC_SVG_P = <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>;
const GLOBE_SVG_P = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

function ProfileTab({ studentProfile, setStudentProfile, theme, setTheme }) {
  const [activeSection, setActiveSection] = React.useState('overview');
  const [draft, setDraft] = React.useState(() => JSON.parse(JSON.stringify(studentProfile || {})));
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [skillCat, setSkillCat] = React.useState(SKILL_CATS_P[0]);
  const [addingProject, setAddingProject] = React.useState(false);
  const [newProject, setNewProject] = React.useState({ title:'', techStack:'', description:'', projectUrl:'', githubUrl:'' });
  const [addingEdu, setAddingEdu] = React.useState(false);
  const [newEdu, setNewEdu] = React.useState({ school:'', degree:'', major:'', startYear:'', endYear:'' });
  const [newCert, setNewCert] = React.useState('');
  const [newAward, setNewAward] = React.useState('');
  const [otherLinks, setOtherLinks] = React.useState(studentProfile?.other_links || []);
  const [newOtherLink, setNewOtherLink] = React.useState({ label:'', url:'' });
  const [pendingSkill, setPendingSkill] = React.useState(null);

  const showToast = (msg, type='ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2200); };

  const save = async (updates) => {
    setSaving(true);
    try {
      const { updateStudentProfile } = await import('../services/supabase');
      const merged = { ...studentProfile, ...updates };
      let sc = 0;
      if (merged.full_name) sc += 10; if (merged.college) sc += 10;
      if ((merged.skills||[]).length >= 5) sc += 25; else if ((merged.skills||[]).length >= 1) sc += 10;
      if ((merged.projects||[]).length >= 1) sc += 15;
      if (merged.github_url) sc += 5; if (merged.linkedin_url) sc += 5; if (merged.resume_url) sc += 5; if (merged.email) sc += 5;
      if ((merged.preferred_roles||[]).length > 0) sc += 10;
      const updated = await updateStudentProfile({ ...updates, profile_completeness: Math.min(sc, 100) });
      setStudentProfile(updated);
      setDraft(JSON.parse(JSON.stringify(updated)));
      showToast('Saved');
    } catch(e) { showToast('Save failed','err'); }
    finally { setSaving(false); }
  };

  const d = draft;
  const initials = (d.full_name||'').split(' ').map(n=>n[0]).join('').slice(0,2)||'U';

  const Card = ({ children, style: s={} }) => (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'20px 22px', marginBottom:14, ...s }}>{children}</div>
  );
  const SaveBtn = ({ onClick }) => (
    <button onClick={onClick} disabled={saving} style={{ padding:'7px 16px', borderRadius:7, border:'none', background:'var(--green)', color:'#fff', fontSize:12, fontWeight:600, cursor:saving?'default':'pointer', opacity:saving?0.6:1, fontFamily:'inherit' }}>
      {saving ? 'Saving…' : 'Save'}
    </button>
  );
  const FieldLabel = ({ children }) => (
    <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:5 }}>{children}</p>
  );

  const SECTIONS = [
    { id:'overview', label:'Overview' },
    { id:'resume',   label:'Resume' },
    { id:'skills',   label:'Skills' },
    { id:'prefs',    label:'Preferences' },
    { id:'myhunt',   label:'My Hunt' },
    { id:'reviews',  label:'Reviews & Ratings' },
    { id:'huntscore',label:'Hunt Score' },
    { id:'account',  label:'Account' },
  ];

  // ── Tech logos (emoji/SVG) ─────────────────────────────────────────────────
  const SKILL_LOGOS = {
    'JavaScript': '🟨', 'Python': '🐍', 'TypeScript': '🔷', 'Java': '☕',
    'C / C++': '⚙️', 'Golang': '🐹', 'SQL': '🗄️',
    'React': <svg width="14" height="14" viewBox="0 0 24 24" fill="#61DAFB"><path d="M12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/><path d="M12 21.59C9.33 19.8 2.5 15.33 2.5 12S9.33 4.2 12 2.41C14.67 4.2 21.5 8.67 21.5 12S14.67 19.8 12 21.59zM12 3.59C9.9 5.15 4 9.19 4 12s5.9 6.85 8 8.41C14.1 18.85 20 14.81 20 12S14.1 5.15 12 3.59z" opacity=".3"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(0 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(120 12 12)"/></svg>,
    'Next.js': <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0z"/></svg>,
    'Node.js': <svg width="14" height="14" viewBox="0 0 24 24" fill="#339933"><path d="M11.998 24a.844.844 0 0 1-.421-.113l-1.336-.791c-.2-.111-.102-.15-.036-.173.266-.093.32-.114.603-.274a.095.095 0 0 1 .091.007l1.027.609a.131.131 0 0 0 .122 0l4.006-2.313a.124.124 0 0 0 .061-.108V7.234a.126.126 0 0 0-.062-.109L11.998 4.8a.123.123 0 0 0-.122 0L7.872 7.126a.127.127 0 0 0-.063.109v4.619a.126.126 0 0 0 .063.108l1.097.634a1.826 1.826 0 0 0 .928.255c.52 0 .828-.316.828-.866V7.7c0-.137.11-.246.247-.246h1.052c.136 0 .246.109.246.246v4.29c0 1.697-.93 2.67-2.55 2.67-.499 0-.892-.065-1.21-.224l-1.048-.6a1.259 1.259 0 0 1-.627-1.088V7.234a1.26 1.26 0 0 1 .627-1.089L11.576.831a1.303 1.303 0 0 1 1.244 0l4.01 2.315a1.261 1.261 0 0 1 .628 1.089v4.619a1.261 1.261 0 0 1-.628 1.088l-4.01 2.315a1.303 1.303 0 0 1-1.244 0l-1.097-.634V7.7c0-.137.11-.246.246-.246h1.052c.137 0 .247.109.247.246v4.29c0 .55.307.866.828.866a1.829 1.829 0 0 0 .928-.255l1.097-.634a.127.127 0 0 0 .063-.108V3.235a.126.126 0 0 0-.062-.109L11.998.813a.122.122 0 0 0-.122 0L7.872 3.126a.128.128 0 0 0-.063.109v4.619c0 .045.024.087.063.109l4.006 2.313a.124.124 0 0 0 .122 0l1.336-.771a.125.125 0 0 0 .063-.109V5.068a.125.125 0 0 0-.062-.109l-1.026-.594a.124.124 0 0 0-.122 0L11.02 4.73a.094.094 0 0 1-.091.007c-.283-.16-.337-.181-.603-.274-.066-.023-.164-.062.036-.173l1.336-.791a.843.843 0 0 1 .842 0l1.27.733a.844.844 0 0 1 .422.731v1.465a.844.844 0 0 1-.422.732l-1.27.733a.843.843 0 0 1-.842 0L10.43 6.36a.844.844 0 0 1-.422-.732V4.163a.844.844 0 0 1 .422-.731l1.27-.733a.843.843 0 0 1 .298-.065z"/></svg>,
    'Docker': <svg width="14" height="14" viewBox="0 0 24 24" fill="#2496ED"><path d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.186.186 0 0 0-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"/></svg>,
    'Git': <svg width="14" height="14" viewBox="0 0 24 24" fill="#F05032"><path d="M23.546 10.93L13.067.452a1.55 1.55 0 0 0-2.188 0L8.708 2.627l2.76 2.76a1.838 1.838 0 0 1 2.327 2.341l2.658 2.66a1.838 1.838 0 0 1 1.9 3.039 1.837 1.837 0 0 1-2.6 0 1.846 1.846 0 0 1-.404-1.996L12.86 8.955v6.525c.176.086.342.203.483.346a1.846 1.846 0 0 1 0 2.6 1.846 1.846 0 0 1-2.6 0 1.846 1.846 0 0 1 0-2.6c.157-.157.34-.279.536-.362V8.909a1.847 1.847 0 0 1-1.003-2.416l-2.71-2.7-.975.976a1.55 1.55 0 0 0 0 2.187L16.155 17.07a1.55 1.55 0 0 0 2.187 0l5.204-5.207a1.55 1.55 0 0 0 0-2.932z" opacity=".1"/><path d="M23.546 10.93L13.067.452a1.55 1.55 0 0 0-2.188 0L8.708 2.627l2.76 2.76a1.838 1.838 0 0 1 2.327 2.341l2.658 2.66a1.838 1.838 0 0 1 1.9 3.039 1.837 1.837 0 0 1-2.6 0 1.846 1.846 0 0 1-.404-1.996L12.86 8.955v6.525c.176.086.342.203.483.346a1.846 1.846 0 0 1 0 2.6 1.846 1.846 0 0 1-2.6 0 1.846 1.846 0 0 1 0-2.6c.157-.157.34-.279.536-.362V8.909a1.847 1.847 0 0 1-1.003-2.416l-2.71-2.7-5.26 5.255a1.55 1.55 0 0 0 0 2.188L13.63 23.548a1.55 1.55 0 0 0 2.187 0l7.73-7.727a1.55 1.55 0 0 0 0-2.188"/></svg>,
    'Figma': <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#F24E1E" d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z"/><path fill="#FF7262" d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z"/><path fill="#A259FF" d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z"/><path fill="#1ABCFE" d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z"/><path fill="#0ACF83" d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z"/></svg>,
    'PostgreSQL': '🐘', 'MongoDB': '🍃', 'MySQL': '🐬', 'Redis': '🔴',
    'Machine Learning': '🤖', 'TensorFlow': '⚡', 'PyTorch': '🔥', 'Pandas': '🐼',
    'AWS': <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF9900"><path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.352 3.384 1.963 7.559 3.147 11.877 3.147 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.383.614z"/><path fill="#FF9900" d="M22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z"/></svg>,
    'CI/CD': '🔄', 'Linux': '🐧',
    'Express.js': '🚂', 'Django': '🎸', 'FastAPI': '⚡', 'REST API': '🔌', 'GraphQL': '🔮',
    'Tailwind CSS': <svg width="14" height="14" viewBox="0 0 24 24" fill="#06B6D4"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/></svg>,
    'React Native': '📱', 'Flutter': '🦋', 'Firebase': '🔥',
  };

  const getSkillLogo = (name) => {
    const logo = SKILL_LOGOS[name];
    if (!logo) return <span style={{ fontSize: 12 }}>⚬</span>;
    if (typeof logo === 'string') return <span style={{ fontSize: 12 }}>{logo}</span>;
    return logo;
  };

  // ── Coding platform logos ──────────────────────────────────────────────────
  const PLATFORM_LOGOS = {
    leetcode:     { label:'LeetCode',     color:'#FFA116', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg> },
    github_username:{ label:'GitHub',    color:'#24292e', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> },
    codechef:     { label:'CodeChef',     color:'#5B4638', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M11.257.004C5.23-.105.13 4.837.004 10.862c-.127 6.024 4.815 11.124 10.839 11.25 6.025.127 11.125-4.815 11.25-10.839.128-6.025-4.814-11.124-10.836-11.27zm-.103 2.872c1.613-.032 3.236.473 4.552 1.489.283.215.554.45.8.705l-1.6 1.6a5.267 5.267 0 0 0-.622-.541 5.097 5.097 0 0 0-6.124.255l-1.556-1.556a8.06 8.06 0 0 1 4.55-1.952zm-5.69 2.92 1.559 1.559a5.108 5.108 0 0 0-.867 4.797l-1.863.497a7.218 7.218 0 0 1 1.172-6.854zm12.09.476a7.209 7.209 0 0 1 .875 6.54l-1.854-.495a5.107 5.107 0 0 0-.594-4.527zm-10.78 4.34h1.697v2.094H10.6v1.697H8.773zm4.47 0H14.2v1.697h1.698v.397H14.2v1.697h-1.696v-1.697H10.81v-.397h1.697zm-4.47 4.493h6.172v1.697H7.074z"/></svg> },
    codeforces:   { label:'Codeforces',   color:'#1F8ACB', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5V19.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V4.5C9 3.672 9.672 3 10.5 3h3zm9 7.5c.828 0 1.5.672 1.5 1.5v9c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V15c0-.828.672-1.5 1.5-1.5h3z"/></svg> },
    kaggle:       { label:'Kaggle',       color:'#20BEFF', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .236.06.285.18.046.149.034.255-.036.315l-6.555 6.344 6.836 8.507c.095.104.117.208.07.336z"/></svg> },
    hackerrank:   { label:'HackerRank',   color:'#2EC866', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 0c1.285 0 9.75 4.886 10.392 6 .645 1.115.645 10.885 0 12S13.287 24 12 24C10.712 24 2.25 19.115 1.608 18 .963 16.886.963 7.115 1.608 6 2.253 4.886 10.715 0 12 0zm2.205 6.015a.648.648 0 0 0-.654.645.637.637 0 0 0 .654.647h.663v3.275h-5.332V7.307h.662a.643.643 0 0 0 .654-.645A.644.644 0 0 0 9.798 6h-3.3a.644.644 0 0 0-.654.645.645.645 0 0 0 .654.647h.662v10.11h-.662a.646.646 0 0 0 0 1.292h3.3a.646.646 0 0 0 0-1.293h-.662v-3.967h5.332v3.967h-.663a.646.646 0 0 0 0 1.292h3.3a.645.645 0 0 0 .654-.645.645.645 0 0 0-.654-.647h-.663V7.307h.663a.638.638 0 0 0 .654-.647.648.648 0 0 0-.654-.645h-3.3z"/></svg> },
    codingninjas: { label:'Coding Ninjas', color:'#FF5E3A', svg: <span style={{ fontSize: 10, fontWeight: 800, color: 'white' }}>CN</span> },
    geeksforgeeks:{ label:'GeeksforGeeks', color:'#2F8D46', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M21.45 14.315c-.143.28-.334.532-.565.745a3.692 3.692 0 0 1-1.104.695 4.51 4.51 0 0 1-3.116 0 4.573 4.573 0 0 1-1.104-.695 3.553 3.553 0 0 1-.565-.745h-6.19a3.553 3.553 0 0 1-.565.745 4.573 4.573 0 0 1-1.104.695 4.51 4.51 0 0 1-3.116 0 4.573 4.573 0 0 1-1.104-.695 3.692 3.692 0 0 1-.565-.745H0v-1.89h1.354a5.836 5.836 0 0 1-.16-1.025A5.847 5.847 0 0 1 3.68 7.007a5.783 5.783 0 0 1 2.085-.39c.76 0 1.49.145 2.17.435a5.63 5.63 0 0 1 1.83 1.28l1.235 1.38 1.235-1.38a5.63 5.63 0 0 1 1.83-1.28 5.783 5.783 0 0 1 2.17-.435c.76 0 1.49.145 2.17.435a5.783 5.783 0 0 1 2.487 2.393 5.847 5.847 0 0 1 .645 2.965c-.015.35-.06.693-.16 1.025H24v1.89h-2.55zm-9.45-1.78l-1.91-2.135a4.06 4.06 0 0 0-1.355-.94 3.717 3.717 0 0 0-1.5-.31c-.55 0-1.055.1-1.52.31a4.04 4.04 0 0 0-1.215.835 3.907 3.907 0 0 0-.81 1.215 3.84 3.84 0 0 0 0 2.94c.19.455.46.865.81 1.215a4.04 4.04 0 0 0 1.215.835 3.717 3.717 0 0 0 1.52.31c.53 0 1.035-.105 1.5-.31.465-.21.88-.5 1.255-.88l1.81-2.085zm9.85 0l-1.81-2.085a4.06 4.06 0 0 0-1.255-.88 3.717 3.717 0 0 0-1.5-.31c-.55 0-1.055.1-1.52.31a4.04 4.04 0 0 0-1.215.835 3.907 3.907 0 0 0-.81 1.215 3.84 3.84 0 0 0 0 2.94c.19.455.46.865.81 1.215a4.04 4.04 0 0 0 1.215.835 3.717 3.717 0 0 0 1.52.31c.53 0 1.035-.105 1.5-.31a4.06 4.06 0 0 0 1.355-.94l1.71-2.135z"/></svg> },
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'hunt-fade-in 0.25s ease' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '7px 16px', borderRadius: 7, fontSize: 12, fontWeight: 500, background: toast.type === 'err' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)', color: '#fff', pointerEvents: 'none', boxShadow: '0 3px 12px rgba(0,0,0,0.15)' }}>{toast.msg}</div>
      )}

      {/* ── PROFILE HEADER + SUB-TABS ── */}
      <div style={{ flexShrink: 0, padding: '28px 40px 0', background: 'var(--bg)' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 4 }}>Profile</p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 26, fontWeight: 400, color: 'var(--text)', marginBottom: 16 }}>
          {d.full_name ? <>{d.full_name.split(' ')[0]}<em style={{ fontStyle: 'italic' }}>'s profile.</em></> : <em>Your profile.</em>}
        </h1>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400,
              color: activeSection === s.id ? 'var(--text)' : 'var(--text-dim)',
              borderBottom: activeSection === s.id ? '2px solid var(--text)' : '2px solid transparent',
              marginBottom: '-1px', whiteSpace: 'nowrap', fontFamily: 'inherit',
              transition: 'color 0.1s',
            }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px' }}>

        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <div style={{ maxWidth: 760 }}>
            {/* Banner + Avatar hero */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
              {/* Banner */}
              <div style={{ height: 140, background: 'linear-gradient(135deg, #1A7A4A 0%, #0D4A2E 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', letterSpacing: '0.02em' }}>On a hunt.</p>
                <label style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => showToast('Banner upload coming soon')} />
                </label>
              </div>
              {/* Avatar + name row */}
              <div style={{ padding: '0 28px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ position: 'relative', marginTop: -36 }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-tint)', border: '4px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>
                      {initials}
                    </div>
                    <label style={{ position: 'absolute', bottom: 2, right: 2, width: 22, height: 22, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)' }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => showToast('Avatar upload coming soon')} />
                    </label>
                  </div>
                </div>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 3 }}>{d.full_name || '—'}</p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: d.headline ? 6 : 0 }}>{d.college}{d.year ? ` · Year ${d.year}` : ''}</p>
                {d.headline && <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.5 }}>{d.headline}</p>}
              </div>
            </div>

            {/* Headline + Bio */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Headline & Bio</p>
                <SaveBtn onClick={() => save({ headline: d.headline, bio: d.bio })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <FieldLabel>Headline</FieldLabel>
                  <input style={inp_p} value={d.headline||''} placeholder="Full Stack Dev · Open to internships" onChange={e => setDraft(x=>({...x,headline:e.target.value}))} />
                </div>
                <div>
                  <FieldLabel>Bio</FieldLabel>
                  <textarea style={{ ...inp_p, resize: 'none' }} rows={4} value={d.bio||''} placeholder="Tell recruiters about yourself..." onChange={e => setDraft(x=>({...x,bio:e.target.value}))} />
                </div>
              </div>
            </Card>

            {/* Basic info */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Basic Info</p>
                <SaveBtn onClick={() => save({ full_name: d.full_name, college: d.college, year: d.year, phone: d.phone, email: d.email })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { f:'full_name', label:'Full Name', ph:'Priya Sharma' },
                  { f:'college',   label:'College',   ph:'VJTI Mumbai' },
                  { f:'phone',     label:'Phone',     ph:'+91 98765 43210' },
                  { f:'email',     label:'Email',     ph:'you@email.com' },
                ].map(({ f, label, ph }) => (
                  <div key={f}>
                    <FieldLabel>{label}</FieldLabel>
                    <input style={inp_p} value={d[f]||''} placeholder={ph} onChange={e => setDraft(x=>({...x,[f]:e.target.value}))} />
                  </div>
                ))}
                <div>
                  <FieldLabel>Year</FieldLabel>
                  <select style={inp_p} value={d.year||3} onChange={e => setDraft(x=>({...x,year:parseInt(e.target.value)}))}>
                    {[1,2,3,4].map(y => <option key={y} value={y}>{y}{['st','nd','rd','th'][y-1]} Year</option>)}
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* RESUME */}
        {activeSection === 'resume' && (
          <div style={{ maxWidth: 700 }}>

            {/* Quick links at top */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Key Links</p>
                <SaveBtn onClick={() => save({ github_url: d.github_url, linkedin_url: d.linkedin_url, portfolio_url: d.portfolio_url })} />
              </div>
              {[
                { key:'github_url',   logo:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>, bg:'#24292e', label:'GitHub URL', ph:'https://github.com/username' },
                { key:'linkedin_url', logo:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, bg:'#0A66C2', label:'LinkedIn URL', ph:'https://linkedin.com/in/username' },
                { key:'portfolio_url', logo:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, bg:'#5A5A56', label:'Portfolio', ph:'https://yoursite.com' },
              ].map(({ key, logo, bg, label, ph }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white' }}>{logo}</div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', width: 90, flexShrink: 0 }}>{label}</span>
                  <input style={{ ...inp_p, padding: '5px 9px' }} value={d[key]||''} placeholder={ph} onChange={e => setDraft(x=>({...x,[key]:e.target.value}))} />
                </div>
              ))}
            </Card>

            {/* Resume PDF */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Resume PDF</p>
              {d.resume_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 8, border: '1px solid var(--green)', background: 'var(--green-tint)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--green-text)' }}>Resume uploaded</span>
                  <a href={d.resume_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--green-text)', textDecoration: 'none' }}>View ↗</a>
                  <label style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--green)', color: 'var(--green)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Replace<input type="file" accept=".pdf" style={{ display: 'none' }} onChange={() => showToast('Upload coming soon')} />
                  </label>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '32px', borderRadius: 10, border: '2px dashed var(--border-mid)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.background='var(--green-tint)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-mid)'; e.currentTarget.style.background='transparent'; }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>Drop PDF here or <span style={{ color: 'var(--green)' }}>browse files</span></span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>PDF up to 5MB</span>
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={() => showToast('Upload coming soon')} />
                </label>
              )}
            </Card>

            {/* Summary */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Summary</p>
                <SaveBtn onClick={() => save({ summary: d.summary })} />
              </div>
              <textarea style={{ ...inp_p, resize: 'none' }} rows={4} value={d.summary||''} placeholder="Brief professional summary..." onChange={e => setDraft(x=>({...x,summary:e.target.value}))} />
            </Card>

            {/* Education */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Education</p>
                <button onClick={() => setAddingEdu(true)} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
              </div>
              {(d.education||[]).map((edu, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{edu.school}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-mid)', marginBottom: 1 }}>{edu.degree}{edu.major ? ` · ${edu.major}` : ''}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{edu.startYear}–{edu.endYear||'Present'}</p>
                  </div>
                  <button onClick={() => { const ed=(d.education||[]).filter((_,j)=>j!==i); setDraft(x=>({...x,education:ed})); save({education:ed}); }} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-dim)',padding:0,fontSize:16 }}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--text-dim)'}>×</button>
                </div>
              ))}
              {addingEdu && (
                <div style={{ border:'1px solid var(--border)', borderRadius:9, padding:16, background:'var(--bg-subtle)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    {[{f:'school',ph:'University/College *'},{f:'degree',ph:'Bachelor of Science'},{f:'major',ph:'Computer Science'},{f:'startYear',ph:'2021'},{f:'endYear',ph:'2025'}].map(({f,ph})=>(
                      <input key={f} style={inp_p} value={newEdu[f]} placeholder={ph} onChange={e=>setNewEdu(x=>({...x,[f]:e.target.value}))} />
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => { if(!newEdu.school)return; const ed=[...(d.education||[]),newEdu]; setDraft(x=>({...x,education:ed})); save({education:ed}); setNewEdu({school:'',degree:'',major:'',startYear:'',endYear:''}); setAddingEdu(false); }} style={{ padding:'7px 14px', borderRadius:7, border:'none', background:'var(--green)', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Add</button>
                    <button onClick={() => setAddingEdu(false)} style={{ padding:'7px 14px', borderRadius:7, border:'1px solid var(--border)', background:'transparent', color:'var(--text-mid)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Projects */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Projects</p>
                <button onClick={() => setAddingProject(true)} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
              </div>
              {(d.projects||[]).map((p, i) => (
                <div key={i} style={{ padding:'12px 14px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-subtle)', marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{p.title||p.name}</p>
                    <button onClick={() => { const pr=(d.projects||[]).filter((_,j)=>j!==i); setDraft(x=>({...x,projects:pr})); save({projects:pr}); }} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-dim)',padding:0,fontSize:16 }}
                      onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                      onMouseLeave={e=>e.currentTarget.style.color='var(--text-dim)'}>×</button>
                  </div>
                  {p.description && <p style={{ fontSize:11, color:'var(--text-dim)', marginBottom:6, lineHeight:1.5 }}>{p.description}</p>}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                    {(Array.isArray(p.techStack)?p.techStack:[]).map((t,j)=>(
                      <span key={j} style={{ fontSize:10, padding:'3px 8px', borderRadius:4, border:'1px solid var(--border)', color:'var(--text-mid)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
              {addingProject && (
                <div style={{ border:'1px solid var(--border)', borderRadius:9, padding:16, background:'var(--bg-subtle)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <input style={inp_p} value={newProject.title} placeholder="Project title *" onChange={e=>setNewProject(x=>({...x,title:e.target.value}))} />
                    <input style={inp_p} value={newProject.techStack} placeholder="React, Node.js..." onChange={e=>setNewProject(x=>({...x,techStack:e.target.value}))} />
                  </div>
                  <textarea style={{ ...inp_p, resize:'none', marginBottom:10 }} rows={2} value={newProject.description} placeholder="Description" onChange={e=>setNewProject(x=>({...x,description:e.target.value}))} />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <input style={inp_p} value={newProject.projectUrl} placeholder="Live URL" onChange={e=>setNewProject(x=>({...x,projectUrl:e.target.value}))} />
                    <input style={inp_p} value={newProject.githubUrl} placeholder="GitHub URL" onChange={e=>setNewProject(x=>({...x,githubUrl:e.target.value}))} />
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => { if(!newProject.title)return; const pr=[...(d.projects||[]),{...newProject,techStack:newProject.techStack.split(',').map(t=>t.trim()),id:Date.now()}]; setDraft(x=>({...x,projects:pr})); save({projects:pr}); setNewProject({title:'',techStack:'',description:'',projectUrl:'',githubUrl:''}); setAddingProject(false); }} style={{ padding:'7px 14px', borderRadius:7, border:'none', background:'var(--green)', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Add Project</button>
                    <button onClick={() => setAddingProject(false)} style={{ padding:'7px 14px', borderRadius:7, border:'1px solid var(--border)', background:'transparent', color:'var(--text-mid)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Certifications — separate card */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Certifications</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
                {(d.certifications||[]).map((c, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:20, border:'1px solid var(--border)', background:'var(--bg-subtle)', fontSize:12 }}>
                    🏅 {c}
                    <button onClick={() => { const cer=(d.certifications||[]).filter((_,j)=>j!==i); setDraft(x=>({...x,certifications:cer})); save({certifications:cer}); }} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-dim)',padding:'0 0 0 4px',lineHeight:1,fontSize:14 }}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input style={{ ...inp_p, flex:1 }} value={newCert} placeholder="AWS Certified Developer, Google Cloud..." onChange={e=>setNewCert(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&newCert.trim()){const cer=[...(d.certifications||[]),newCert.trim()];setDraft(x=>({...x,certifications:cer}));save({certifications:cer});setNewCert('');}}} />
                <button onClick={() => { if(!newCert.trim())return;const cer=[...(d.certifications||[]),newCert.trim()];setDraft(x=>({...x,certifications:cer}));save({certifications:cer});setNewCert(''); }} style={{ padding:'0 16px', borderRadius:7, border:'none', background:'var(--green)', color:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>+</button>
              </div>
            </Card>

            {/* Awards — separate card */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Awards & Achievements</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                {(d.awards||[]).map((a, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-subtle)', fontSize:12 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:16 }}>⭐</span> {a}</span>
                    <button onClick={() => { const aw=(d.awards||[]).filter((_,j)=>j!==i);setDraft(x=>({...x,awards:aw}));save({awards:aw}); }} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-dim)',padding:0,fontSize:16 }}
                      onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                      onMouseLeave={e=>e.currentTarget.style.color='var(--text-dim)'}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input style={{ ...inp_p, flex:1 }} value={newAward} placeholder="1st place at Flipkart GRiD Hackathon..." onChange={e=>setNewAward(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&newAward.trim()){const aw=[...(d.awards||[]),newAward.trim()];setDraft(x=>({...x,awards:aw}));save({awards:aw});setNewAward('');}}} />
                <button onClick={() => { if(!newAward.trim())return;const aw=[...(d.awards||[]),newAward.trim()];setDraft(x=>({...x,awards:aw}));save({awards:aw});setNewAward(''); }} style={{ padding:'0 16px', borderRadius:7, border:'none', background:'var(--green)', color:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>+</button>
              </div>
            </Card>

            {/* Coding platforms */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Competitive & Coding Profiles</p>
                <SaveBtn onClick={() => save({ coding_profiles: d.coding_profiles })} />
              </div>
              {Object.entries(PLATFORM_LOGOS).map(([key, { label, color, svg }]) => (
                <div key={key} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-subtle)', marginBottom:8 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{svg}</div>
                  <span style={{ fontSize:12, fontWeight:500, color:'var(--text-mid)', width:110, flexShrink:0 }}>{label}</span>
                  <input style={{ ...inp_p, padding:'6px 10px' }}
                    value={d.coding_profiles?.[key]||''}
                    placeholder="username"
                    onChange={e => setDraft(x => ({ ...x, coding_profiles: { ...(x.coding_profiles||{}), [key]: e.target.value } }))} />
                </div>
              ))}
            </Card>

            {/* Other links */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Other Links</p>
                <SaveBtn onClick={() => save({ other_links: otherLinks })} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>Add any other links — papers, talks, open source contributions, etc.</p>
              {otherLinks.map((link, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-subtle)', marginBottom:8 }}>
                  <div style={{ width:28, height:28, borderRadius:6, background:'var(--bg-card)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14 }}>🔗</div>
                  <span style={{ fontSize:12, color:'var(--text)', flex:1 }}>{link.label}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'var(--green)', textDecoration:'none', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{link.url}</a>
                  <button onClick={() => { const nl=otherLinks.filter((_,j)=>j!==i); setOtherLinks(nl); save({other_links:nl}); }} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-dim)',padding:0,fontSize:16 }}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--text-dim)'}>×</button>
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:8, marginBottom:8 }}>
                <input style={inp_p} value={newOtherLink.label} placeholder="Label (e.g. Research Paper)" onChange={e=>setNewOtherLink(x=>({...x,label:e.target.value}))} />
                <input style={inp_p} value={newOtherLink.url} placeholder="https://..." onChange={e=>setNewOtherLink(x=>({...x,url:e.target.value}))} />
              </div>
              <button onClick={() => { if(!newOtherLink.url.trim())return; const nl=[...otherLinks,{label:newOtherLink.label||newOtherLink.url,url:newOtherLink.url}]; setOtherLinks(nl); save({other_links:nl}); setNewOtherLink({label:'',url:''}); }} style={{ padding:'7px 16px', borderRadius:7, border:'none', background:'var(--green)', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Add Link</button>
            </Card>
          </div>
        )}

        {/* SKILLS */}
        {activeSection === 'skills' && (() => {
          const addedSkills = d.skills || [];
          const grouped = SKILL_CATS_P.reduce((acc, cat) => {
            const inCat = addedSkills.filter(s => s.category === cat);
            if (inCat.length > 0) acc[cat] = inCat;
            return acc;
          }, {});

          const LEVELS = [
            { v:1, label:'Beginner',     desc:'Just started learning' },
            { v:2, label:'Elementary',   desc:'Built a few small things' },
            { v:3, label:'Intermediate', desc:'Used in real projects' },
            { v:4, label:'Advanced',     desc:'Deep knowledge, prod use' },
            { v:5, label:'Expert',       desc:'Mentor others, go-to person' },
          ];

          const confirmAdd = (level) => {
            if (!pendingSkill) return;
            const skillDef = SKILL_OPTIONS_P.find(s => s.name === pendingSkill);
            if (!skillDef) return;
            setDraft(x => ({ ...x, skills: [...(x.skills||[]), { id: Date.now(), name: pendingSkill, level, category: skillDef.cat }] }));
            setPendingSkill(null);
          };

          return (
            <div style={{ maxWidth: 760 }}>
              {/* Level picker modal */}
              {pendingSkill && (
                <>
                  <div onClick={() => setPendingSkill(null)} style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(0,0,0,0.3)', backdropFilter:'blur(2px)' }} />
                  <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:401, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'28px 28px 24px', width:360, boxShadow:'0 20px 60px rgba(0,0,0,0.18)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <span style={{ fontSize:20, display:'flex', alignItems:'center' }}>{getSkillLogo(pendingSkill)}</span>
                      <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:20, color:'var(--text)' }}>{pendingSkill}</p>
                    </div>
                    <p style={{ fontSize:12, color:'var(--text-dim)', marginBottom:20 }}>How well do you know this?</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {LEVELS.map(lv => (
                        <button key={lv.v} onClick={() => confirmAdd(lv.v)} style={{
                          display:'flex', alignItems:'center', justifyContent:'space-between',
                          padding:'10px 14px', borderRadius:9, border:'1px solid var(--border)',
                          background:'var(--bg-subtle)', cursor:'pointer', fontFamily:'inherit',
                          transition:'all 0.1s',
                        }}
                        onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.background='var(--green-tint)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-subtle)'; }}>
                          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <div style={{ display:'flex', gap:3 }}>
                              {[1,2,3,4,5].map(d => <div key={d} style={{ width:6, height:6, borderRadius:'50%', background: d<=lv.v ? 'var(--green)' : 'var(--border)' }} />)}
                            </div>
                            <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{lv.label}</span>
                          </div>
                          <span style={{ fontSize:11, color:'var(--text-dim)' }}>{lv.desc}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setPendingSkill(null)} style={{ marginTop:14, width:'100%', padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-dim)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                  </div>
                </>
              )}

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <div>
                  <p style={{ fontSize:18, fontFamily:"'Editorial New', Georgia, serif", color:'var(--text)', marginBottom:3 }}>Technical Skills</p>
                  <p style={{ fontSize:13, color:'var(--text-dim)' }}>{addedSkills.length} skill{addedSkills.length !== 1 ? 's' : ''} added</p>
                </div>
                <SaveBtn onClick={() => save({ skills: d.skills || [] })} />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'180px 1fr', gap:16, alignItems:'start' }}>
                {/* Category nav */}
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  {SKILL_CATS_P.map(cat => {
                    const cnt = addedSkills.filter(s => s.category === cat).length;
                    return (
                      <button key={cat} onClick={() => setSkillCat(cat)} className="hn-item" style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'9px 12px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit',
                        background: skillCat===cat ? 'var(--bg-subtle)' : 'transparent',
                        color: skillCat===cat ? 'var(--text)' : 'var(--text-dim)',
                        fontSize:13, fontWeight: skillCat===cat ? 600 : 400, textAlign:'left',
                      }}>
                        <span>{cat}</span>
                        {cnt > 0 && <span style={{ fontSize:11, fontWeight:700, color:'var(--green)', background:'var(--green-tint)', borderRadius:20, padding:'1px 7px' }}>{cnt}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Right panel */}
                <div>
                  {/* Picker */}
                  <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 18px', marginBottom:20 }}>
                    <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:12 }}>{skillCat}</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {SKILL_OPTIONS_P.filter(s => s.cat === skillCat).map(skill => {
                        const added = addedSkills.some(s => s.name === skill.name);
                        return (
                          <button key={skill.name} onClick={() => { if (!added) setPendingSkill(skill.name); }}
                            style={{
                              display:'flex', alignItems:'center', gap:6,
                              padding:'6px 12px', borderRadius:20, fontSize:12, fontFamily:'inherit',
                              cursor: added ? 'default' : 'pointer', transition:'all 0.12s',
                              border: `1px solid ${added ? 'var(--green)' : 'var(--border)'}`,
                              background: added ? 'var(--green-tint)' : 'var(--bg-subtle)',
                              color: added ? 'var(--green-text)' : 'var(--text-mid)',
                            }}>
                            <span style={{ display:'flex', alignItems:'center' }}>{getSkillLogo(skill.name)}</span>
                            {added ? '✓ ' : '+ '}{skill.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Added skills — flat chip grid, no cards */}
                  {addedSkills.length > 0 ? (
                    <div>
                      {Object.keys(grouped).length > 0 && Object.entries(grouped).map(([cat, skills]) => (
                        <div key={cat} style={{ marginBottom: 20 }}>
                          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:10 }}>{cat}</p>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                            {skills.map((skill) => {
                              const i = addedSkills.findIndex(s => s.name === skill.name);
                              const levelColors = ['','#9B9B97','#D4A84B','#1A7A4A','#0A66C2','#7C3AED'];
                              return (
                                <div key={skill.id||skill.name}
                                  style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px 6px 8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', fontSize:12, color:'var(--text)', position:'relative', cursor:'default' }}
                                  title={`${skill.name} · ${LEVEL_LABELS_P[skill.level]}`}>
                                  <span style={{ display:'flex', alignItems:'center', flexShrink:0 }}>{getSkillLogo(skill.name)}</span>
                                  <span style={{ fontWeight:500 }}>{skill.name}</span>
                                  {/* tiny dot level indicator */}
                                  <div style={{ display:'flex', gap:2, marginLeft:2 }}>
                                    {[1,2,3,4,5].map(lv => (
                                      <div key={lv} style={{ width:4, height:4, borderRadius:'50%', background: skill.level>=lv ? levelColors[skill.level] : 'var(--border)' }} />
                                    ))}
                                  </div>
                                  {/* remove × on hover */}
                                  <button onClick={() => setDraft(x=>({...x, skills:(x.skills||[]).filter((_,j)=>j!==i)}))}
                                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--border-mid)', padding:'0 0 0 2px', lineHeight:1, fontSize:13, flexShrink:0 }}
                                    onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                                    onMouseLeave={e=>e.currentTarget.style.color='var(--border-mid)'}>×</button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding:'32px', textAlign:'center', border:'2px dashed var(--border)', borderRadius:12 }}>
                      <p style={{ fontSize:13, color:'var(--text-dim)' }}>Click a skill above — you'll pick your level before it's added</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* PREFERENCES */}
        {activeSection === 'prefs' && (
          <div style={{ maxWidth: 700 }}>
            <p style={{ fontSize: 18, fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)', marginBottom: 24 }}>Preferences</p>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Work Preferences</p>
                <SaveBtn onClick={() => save({ preferred_roles: d.preferred_roles, availability: d.availability, work_preference: d.work_preference, min_stipend: d.min_stipend })} />
              </div>
              <FieldLabel>Preferred Roles</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 18 }}>
                {ROLE_OPTIONS_P.map(role => {
                  const sel = (d.preferred_roles||[]).includes(role);
                  return <button key={role} onClick={() => setDraft(x=>({...x,preferred_roles:sel?(x.preferred_roles||[]).filter(r=>r!==role):[...(x.preferred_roles||[]),role]}))} style={{ padding:'9px 12px', borderRadius:8, fontSize:12, fontFamily:'inherit', cursor:'pointer', textAlign:'left', border:`1px solid ${sel?'var(--green)':'var(--border)'}`, background:sel?'var(--green-tint)':'transparent', color:sel?'var(--green-text)':'var(--text-mid)', fontWeight:sel?500:400 }}>{role}</button>;
                })}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <FieldLabel>Availability</FieldLabel>
                  <select style={inp_p} value={d.availability||'Immediate'} onChange={e=>setDraft(x=>({...x,availability:e.target.value}))}>
                    <option>Immediate</option><option>After exams</option><option>Next semester</option><option>Not available</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Work Preference</FieldLabel>
                  <select style={inp_p} value={d.work_preference||'remote'} onChange={e=>setDraft(x=>({...x,work_preference:e.target.value}))}>
                    <option value="remote">Remote</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="any">Any</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop:14 }}>
                <FieldLabel>Min Stipend</FieldLabel>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:14, color:'var(--text-dim)' }}>₹</span>
                  <input style={{ ...inp_p, maxWidth:150 }} type="number" value={d.min_stipend||''} placeholder="0" onChange={e=>setDraft(x=>({...x,min_stipend:e.target.value}))} />
                  <span style={{ fontSize:12, color:'var(--text-dim)' }}>/ month</span>
                </div>
              </div>
            </Card>
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Notifications</p>
              {[
                { label:'New job matches', sub:'When a job matches your skills', key:'notif_matches' },
                { label:'Application updates', sub:'When recruiters view your profile', key:'notif_apps' },
                { label:'Weekly digest', sub:'Summary every Monday', key:'notif_digest' },
                { label:'Interview invites', sub:'Direct interview invitations', key:'notif_interviews' },
              ].map(({ label, sub, key }) => (
                <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div><p style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:2 }}>{label}</p><p style={{ fontSize:11, color:'var(--text-dim)' }}>{sub}</p></div>
                  <Toggle_P on={d[key]!==false} onChange={val=>{ setDraft(x=>({...x,[key]:val})); save({[key]:val}); }} />
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* MY HUNT */}
        {activeSection === 'myhunt' && (
          <div style={{ maxWidth: 600 }}>
            {/* Header */}
            <div style={{ marginBottom: 48 }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--green)', marginBottom:10 }}>Private · Only you see this</p>
              <h1 style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:38, fontWeight:400, color:'var(--text)', lineHeight:1.15, marginBottom:12 }}>
                What are you<br /><em>really</em> hunting for?
              </h1>
              <p style={{ fontSize:14, color:'var(--text-dim)', lineHeight:1.7, maxWidth:480 }}>
                Not your resume. Not the job title. The real stuff — your drives, your beliefs, your <em>why</em>. This stays private. It's just for you.
              </p>
            </div>

            {/* Section 01 */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--green)', letterSpacing:'0.1em', fontFamily:"'Editorial New', Georgia, serif" }}>01</span>
                <div>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:20, color:'var(--text)', marginBottom:3 }}>The Hunt</p>
                  <p style={{ fontSize:12, color:'var(--text-dim)' }}>Not the job title. What are you actually after?</p>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  {d.my_hunt && <button onClick={() => save({my_hunt:d.my_hunt})} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:'var(--green)', color:'#fff', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Save</button>}
                </div>
              </div>
              <textarea value={d.my_hunt||''} onChange={e=>setDraft(x=>({...x,my_hunt:e.target.value}))}
                placeholder="I'm hunting for the place where craft meets impact. Not just shipping features — building something that actually changes how someone spends their day..."
                style={{ ...inp_p, resize:'none', lineHeight:1.8, fontSize:14, padding:'14px 16px', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', borderRadius:0, paddingLeft:0 }} rows={4} />
            </div>

            {/* Divider */}
            <div style={{ height:1, background:'var(--border)', marginBottom:48 }} />

            {/* Section 02 */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--green)', letterSpacing:'0.1em', fontFamily:"'Editorial New', Georgia, serif" }}>02</span>
                <div>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:20, color:'var(--text)', marginBottom:3 }}>Philosophy</p>
                  <p style={{ fontSize:12, color:'var(--text-dim)' }}>How you see the world. What you believe is true.</p>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  {d.philosophy && <button onClick={() => save({philosophy:d.philosophy})} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:'var(--green)', color:'#fff', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Save</button>}
                </div>
              </div>
              <textarea value={d.philosophy||''} onChange={e=>setDraft(x=>({...x,philosophy:e.target.value}))}
                placeholder="I believe the best products start with genuine frustration — your own. You can't design well for problems you've never felt..."
                style={{ ...inp_p, resize:'none', lineHeight:1.8, fontSize:14, padding:'14px 16px', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', borderRadius:0, paddingLeft:0 }} rows={4} />
            </div>

            <div style={{ height:1, background:'var(--border)', marginBottom:48 }} />

            {/* Section 03 */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--green)', letterSpacing:'0.1em', fontFamily:"'Editorial New', Georgia, serif" }}>03</span>
                <div>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:20, color:'var(--text)', marginBottom:3 }}>What moves you</p>
                  <p style={{ fontSize:12, color:'var(--text-dim)' }}>Books, people, ideas that rewired how you think.</p>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  {d.inspirations && <button onClick={() => save({inspirations:d.inspirations})} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:'var(--green)', color:'#fff', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Save</button>}
                </div>
              </div>
              <textarea value={d.inspirations||''} onChange={e=>setDraft(x=>({...x,inspirations:e.target.value}))}
                placeholder="Paul Graham's essays got me comfortable with uncertainty. The Mom Test made me rethink every conversation I'd had with users. Feynman — the joy of figuring things out..."
                style={{ ...inp_p, resize:'none', lineHeight:1.8, fontSize:14, padding:'14px 16px', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', borderRadius:0, paddingLeft:0 }} rows={4} />
            </div>

            <div style={{ height:1, background:'var(--border)', marginBottom:48 }} />

            {/* Section 04 */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--green)', letterSpacing:'0.1em', fontFamily:"'Editorial New', Georgia, serif" }}>04</span>
                <div>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:20, color:'var(--text)', marginBottom:3 }}>Life outside work</p>
                  <p style={{ fontSize:12, color:'var(--text-dim)' }}>Who are you when the laptop is closed?</p>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  {d.life_outside && <button onClick={() => save({life_outside:d.life_outside})} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:'var(--green)', color:'#fff', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Save</button>}
                </div>
              </div>
              <textarea value={d.life_outside||''} onChange={e=>setDraft(x=>({...x,life_outside:e.target.value}))}
                placeholder="Cricket every Sunday morning — I bowl medium-pace. Three years of Carnatic music before I pivoted to code. Still cook every meal..."
                style={{ ...inp_p, resize:'none', lineHeight:1.8, fontSize:14, padding:'14px 16px', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', borderRadius:0, paddingLeft:0 }} rows={4} />
            </div>

            <div style={{ height:1, background:'var(--border)', marginBottom:48 }} />

            {/* Quote */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:20 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--green)', letterSpacing:'0.1em', fontFamily:"'Editorial New', Georgia, serif" }}>"</span>
                <div>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:20, color:'var(--text)', marginBottom:3 }}>A line you live by</p>
                  <p style={{ fontSize:12, color:'var(--text-dim)' }}>Something that keeps pulling you forward.</p>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  {d.quote && <button onClick={() => save({quote:d.quote,quote_author:d.quote_author})} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:'var(--green)', color:'#fff', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Save</button>}
                </div>
              </div>
              {d.quote ? (
                <div style={{ borderLeft:'2px solid var(--green)', paddingLeft:20, marginBottom:16 }}>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:22, color:'var(--text)', lineHeight:1.5, fontStyle:'italic', marginBottom:8 }}>"{d.quote}"</p>
                  {d.quote_author && <p style={{ fontSize:12, color:'var(--text-dim)' }}>{d.quote_author}</p>}
                </div>
              ) : (
                <div style={{ borderLeft:'2px solid var(--border)', paddingLeft:20, marginBottom:16 }}>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:18, color:'var(--text-dim)', fontStyle:'italic' }}>Your quote will appear here…</p>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <input style={{ ...inp_p, fontSize:14, fontFamily:"'Editorial New', Georgia, serif", fontStyle:'italic' }} value={d.quote||''} placeholder="The people who are crazy enough to think they can change the world…" onChange={e=>setDraft(x=>({...x,quote:e.target.value}))} />
                <input style={{ ...inp_p, fontSize:12 }} value={d.quote_author||''} placeholder="— Steve Jobs (or write your own)" onChange={e=>setDraft(x=>({...x,quote_author:e.target.value}))} />
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS & RATINGS */}
        {activeSection === 'reviews' && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:6 }}>Reviews & Ratings</p>
              <h1 style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:28, fontWeight:400, color:'var(--text)', marginBottom:8 }}>What recruiters say.</h1>
              <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6, maxWidth:440 }}>After internships close, recruiters rate your performance. These ratings are visible to future recruiters and boost your HUNT Score.</p>
            </div>
            <div style={{ padding:'64px 32px', textAlign:'center', border:'2px dashed var(--border)', borderRadius:14, background:'var(--bg-card)' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--bg-subtle)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:20 }}>⭐</div>
              <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:18, color:'var(--text)', marginBottom:6 }}>No reviews yet.</p>
              <p style={{ fontSize:13, color:'var(--text-dim)', maxWidth:320, margin:'0 auto', lineHeight:1.6 }}>Complete an internship through HUNT and your recruiter will be invited to leave a review. Those reviews build your reputation here.</p>
            </div>
          </div>
        )}

        {/* HUNT SCORE */}
        {activeSection === 'huntscore' && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:6 }}>Hunt Score</p>
              <h1 style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:28, fontWeight:400, color:'var(--text)', marginBottom:8 }}>Your signal, scored.</h1>
              <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6, maxWidth:480 }}>Your HUNT Score is a dynamic credibility score built from verified skills, project proof, recruiter feedback, and consistency. Recruiters see it. Make it count.</p>
            </div>
            {/* Score placeholder */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'32px', marginBottom:16, display:'flex', alignItems:'center', gap:28 }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--bg-subtle)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:26, color:'var(--text-dim)', fontWeight:400 }}>—</p>
              </div>
              <div>
                <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:18, color:'var(--text)', marginBottom:4 }}>Not yet calculated</p>
                <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6 }}>Complete your profile, add verified projects, and get your first recruiter rating to unlock your score.</p>
              </div>
            </div>
            {/* Score components */}
            {[
              { label:'Profile completeness', desc:'Name, college, bio, photo', done: false },
              { label:'Verified skills', desc:'Skills with proof of work', done: false },
              { label:'Project portfolio', desc:'At least 2 projects with links', done: false },
              { label:'First recruiter rating', desc:'Complete an internship through HUNT', done: false },
              { label:'Response rate', desc:'Reply to recruiter messages within 48h', done: false },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-card)', marginBottom:8 }}>
                <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${item.done ? 'var(--green)' : 'var(--border)'}`, background: item.done ? 'var(--green-tint)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {item.done && <span style={{ fontSize:10, color:'var(--green)' }}>✓</span>}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:500, color: item.done ? 'var(--text)' : 'var(--text-mid)', marginBottom:1 }}>{item.label}</p>
                  <p style={{ fontSize:11, color:'var(--text-dim)' }}>{item.desc}</p>
                </div>
                <span style={{ fontSize:11, color: item.done ? 'var(--green)' : 'var(--text-dim)', fontWeight: item.done ? 600 : 400 }}>{item.done ? 'Done' : 'Pending'}</span>
              </div>
            ))}
          </div>
        )}

        {/* ACCOUNT */}
        {activeSection === 'account' && (
          <div style={{ maxWidth: 560 }}>
            <p style={{ fontSize: 18, fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)', marginBottom: 24 }}>Account</p>
            <Card>
              <div style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 16px', borderRadius:10, background:'var(--bg-subtle)', border:'1px solid var(--border)', marginBottom:20 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--green-tint)', border:'2px solid var(--green)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'var(--green)', flexShrink:0 }}>{initials}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:2 }}>{d.full_name}</p>
                  <p style={{ fontSize:12, color:'var(--text-dim)' }}>{d.email}</p>
                </div>
                <label style={{ fontSize:12, padding:'6px 14px', borderRadius:7, border:'1px solid var(--border)', cursor:'pointer', color:'var(--text-mid)', background:'var(--bg-card)', fontFamily:'inherit' }}>
                  Change avatar<input type="file" accept="image/*" style={{ display:'none' }} onChange={() => showToast('Coming soon')} />
                </label>
              </div>
              <div>
                <FieldLabel>Change email</FieldLabel>
                <div style={{ display:'flex', gap:8 }}>
                  <input style={{ ...inp_p, flex:1 }} type="email" defaultValue={d.email||''} placeholder="new@email.com" />
                  <button onClick={() => showToast('Coming soon')} style={{ padding:'0 16px', borderRadius:7, border:'none', background:'var(--text)', color:'var(--bg)', fontSize:12, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>Change</button>
                </div>
              </div>
            </Card>
            <Card>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:14 }}>Appearance</p>
              <div style={{ display:'flex', gap:8 }}>
                {['light','dark'].map(t => (
                  <button key={t} onClick={() => setTheme(t)} style={{ flex:1, padding:'10px', borderRadius:8, border:`1.5px solid ${theme===t?'var(--text)':'var(--border)'}`, background:theme===t?'var(--bg-subtle)':'transparent', cursor:'pointer', fontSize:13, fontWeight:theme===t?600:400, color:'var(--text)', fontFamily:'inherit' }}>
                    {t==='light'?'☀️ Light':'🌙 Dark'}
                  </button>
                ))}
              </div>
            </Card>
            <Card>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:14 }}>Privacy</p>
              {[
                { label:'Visible to recruiters', sub:'Recruiters can find your profile', key:'privacy_visible', def:true },
                { label:'Show college name', sub:'Display your college on profile', key:'privacy_college', def:true },
                { label:'Activity status', sub:'Show when last active', key:'privacy_activity', def:false },
              ].map(({ label, sub, key, def }) => (
                <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div><p style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:2 }}>{label}</p><p style={{ fontSize:11, color:'var(--text-dim)' }}>{sub}</p></div>
                  <Toggle_P on={d[key]!==undefined?d[key]:def} onChange={val=>{ setDraft(x=>({...x,[key]:val})); save({[key]:val}); }} />
                </div>
              ))}
            </Card>
            <div style={{ padding:'16px 18px', borderRadius:10, border:'1px solid var(--red)', background:'var(--red-tint)' }}>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--red)', marginBottom:3 }}>Danger Zone</p>
              <p style={{ fontSize:12, color:'var(--red)', opacity:0.8, marginBottom:12 }}>Permanently delete your account. Cannot be undone.</p>
              <button onClick={() => { if(window.confirm('Delete your account?')) showToast('Delete coming soon','err'); }} style={{ padding:'7px 16px', borderRadius:7, border:'1px solid var(--red)', background:'transparent', color:'var(--red)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Delete account</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
