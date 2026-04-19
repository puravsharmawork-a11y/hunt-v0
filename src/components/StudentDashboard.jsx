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
                  tasks.push({ id: 'linkedin', title: 'Link LinkedIn', desc: 'Recruiters always check LinkedIn first. Add it to boost visibility.', cta: 'Add LinkedIn', action: () => setActiveTab('profile') });
                if (!p?.github_url)
                  tasks.push({ id: 'github', title: 'Add GitHub', desc: 'Your GitHub is proof of work. It directly improves your match score.', cta: 'Add GitHub', action: () => setActiveTab('profile') });
                if (!p?.resume_url)
                  tasks.push({ id: 'resume', title: 'Upload resume', desc: 'Hiring managers are more likely to reach out when they see a resume.', cta: 'Upload now', action: () => setActiveTab('profile') });
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

// src/components/StudentDashboard/tabs/ProfileTab.jsx
// ─── HUNT Profile Tab — Fixed ──────────────────────────────────────────────────
// FIX 1: draft state never reset by save() — fixes typing cursor loss
// FIX 2: pencil icon edit mode per card
// FIX 3: real file upload via supabase uploadResume
// FIX 5: save uses top-level import, not dynamic import

import React, { useState, useRef } from 'react';
import { updateStudentProfile, uploadResume } from '../services/supabase';
// ↑ If this file lives at tabs/ProfileTab.jsx, adjust path to ../../services/supabase
// If it stays inside StudentDashboard.jsx, keep the existing dynamic import pattern
// but use the version at the bottom of this file instead.

// ─── Constants ────────────────────────────────────────────────────────────────

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

const inp_p = {
  width: '100%', padding: '9px 12px', borderRadius: 7,
  border: '1px solid var(--border)', background: 'var(--bg-subtle)',
  color: 'var(--text)', fontSize: 12, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcCompleteness(p) {
  let sc = 0;
  if (p.full_name) sc += 10;
  if (p.college) sc += 10;
  if ((p.skills || []).length >= 5) sc += 25;
  else if ((p.skills || []).length >= 1) sc += 10;
  if ((p.projects || []).length >= 1) sc += 15;
  if (p.github_url) sc += 5;
  if (p.linkedin_url) sc += 5;
  if (p.resume_url) sc += 5;
  if (p.email) sc += 5;
  if ((p.preferred_roles || []).length > 0) sc += 10;
  return Math.min(sc, 100);
}

// Pencil icon SVG
const PencilIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// Check icon SVG
const CheckIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// Toggle component
function Toggle_P({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 34, height: 19, borderRadius: 10,
      background: on ? 'var(--green)' : 'var(--border-mid)',
      cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 17 : 2,
        width: 15, height: 15, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.18s',
      }} />
    </div>
  );
}

// ─── PLATFORM LOGOS ───────────────────────────────────────────────────────────
const PLATFORM_LOGOS = {
  leetcode:      { label: 'LeetCode',      color: '#FFA116' },
  github_username: { label: 'GitHub',      color: '#24292e' },
  codechef:      { label: 'CodeChef',      color: '#5B4638' },
  codeforces:    { label: 'Codeforces',    color: '#1F8ACB' },
  kaggle:        { label: 'Kaggle',        color: '#20BEFF' },
  hackerrank:    { label: 'HackerRank',    color: '#2EC866' },
  codingninjas:  { label: 'Coding Ninjas', color: '#FF5E3A' },
  geeksforgeeks: { label: 'GeeksForGeeks', color: '#2F8D46' },
};

// ─── SKILL LOGOS ──────────────────────────────────────────────────────────────
const SKILL_EMOJI = {
  'JavaScript': '🟨', 'Python': '🐍', 'TypeScript': '🔷', 'Java': '☕',
  'C / C++': '⚙️', 'Golang': '🐹', 'SQL': '🗄️', 'PostgreSQL': '🐘',
  'MongoDB': '🍃', 'MySQL': '🐬', 'Redis': '🔴', 'Machine Learning': '🤖',
  'TensorFlow': '⚡', 'PyTorch': '🔥', 'Pandas': '🐼', 'CI/CD': '🔄',
  'Linux': '🐧', 'Express.js': '🚂', 'Django': '🎸', 'FastAPI': '⚡',
  'REST API': '🔌', 'GraphQL': '🔮', 'React Native': '📱', 'Flutter': '🦋',
  'Firebase': '🔥', 'Docker': '🐳', 'Git': '🔀', 'Figma': '🎨',
  'AWS': '☁️', 'React': '⚛️', 'Next.js': '▲', 'Tailwind CSS': '💨',
  'Node.js': '🟢',
};

function getSkillLogo(name) {
  const e = SKILL_EMOJI[name];
  return <span style={{ fontSize: 13 }}>{e || '⚬'}</span>;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ProfileTab({ studentProfile, setStudentProfile, theme, setTheme }) {
  const [activeSection, setActiveSection] = useState('overview');

  // ── FIX 1: draft is ONLY updated by user typing, never by save() ──────────
  // This prevents the "character reset" bug where save() would call setDraft()
  // and React would re-render the input, losing cursor position.
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(studentProfile || {})));

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const resumeRef = useRef(null);

  // Edit mode per card (pencil icon toggle) — FIX 2
  const [editMode, setEditMode] = useState({});
  const toggleEdit = (key) => setEditMode(p => ({ ...p, [key]: !p[key] }));

  // Skills state
  const [skillCat, setSkillCat] = useState(SKILL_CATS_P[0]);
  const [pendingSkill, setPendingSkill] = useState(null);

  // Projects / Education adding forms
  const [addingProject, setAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', techStack: '', description: '', projectUrl: '', githubUrl: '' });
  const [addingEdu, setAddingEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ school: '', degree: '', major: '', startYear: '', endYear: '' });
  const [newCert, setNewCert] = useState('');
  const [newAward, setNewAward] = useState('');
  const [newOtherLink, setNewOtherLink] = useState({ label: '', url: '' });

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  // ── FIX 5: save() uses top-level import, does NOT reset draft ─────────────
  const save = async (updates) => {
    setSaving(true);
    try {
      const merged = { ...studentProfile, ...updates };
      const updated = await updateStudentProfile({
        ...updates,
        profile_completeness: calcCompleteness(merged),
      });
      // Only update the server-side studentProfile state.
      // Draft is NOT reset — user keeps typing without interruption.
      setStudentProfile(updated);
      showToast('Saved ✓');
    } catch (e) {
      showToast('Save failed: ' + (e.message || 'unknown error'), 'err');
    } finally {
      setSaving(false);
    }
  };

  // ── FIX 3: Real file upload ───────────────────────────────────────────────
  const handleResumeUpload = async (file) => {
    if (!file) return;
    setUploadingResume(true);
    try {
      const url = await uploadResume(file);
      setDraft(x => ({ ...x, resume_url: url }));
      await save({ resume_url: url });
    } catch (e) {
      showToast('Upload failed: ' + (e.message || 'error'), 'err');
    } finally {
      setUploadingResume(false);
    }
  };

  const d = draft;
  const initials = (d.full_name || '').split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  const SECTIONS = [
    { id: 'overview',  label: 'Overview' },
    { id: 'resume',    label: 'Resume' },
    { id: 'skills',    label: 'Skills' },
    { id: 'prefs',     label: 'Preferences' },
    { id: 'myhunt',    label: 'My Hunt' },
    { id: 'reviews',   label: 'Reviews & Ratings' },
    { id: 'huntscore', label: 'Hunt Score' },
    { id: 'account',   label: 'Account' },
  ];

  // ── Shared sub-components ─────────────────────────────────────────────────

  const Card = ({ children, style: s = {} }) => (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px 22px', marginBottom: 14, ...s,
    }}>
      {children}
    </div>
  );

  const FieldLabel = ({ children }) => (
    <p style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5,
    }}>
      {children}
    </p>
  );

  // ── FIX 2: Pencil/Save button ─────────────────────────────────────────────
  // Each card has its own editKey. Click pencil → editable. Click checkmark → saves + closes edit.
  const EditSaveBtn = ({ editKey, onSave }) => {
    const isEditing = editMode[editKey];
    return isEditing ? (
      <button
        onClick={async () => { await onSave(); toggleEdit(editKey); }}
        disabled={saving}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 14px', borderRadius: 7, border: 'none',
          background: 'var(--green)', color: '#fff',
          fontSize: 12, fontWeight: 600, cursor: saving ? 'default' : 'pointer',
          opacity: saving ? 0.6 : 1, fontFamily: 'inherit',
        }}
      >
        <CheckIcon size={12} /> {saving ? 'Saving…' : 'Save'}
      </button>
    ) : (
      <button
        onClick={() => toggleEdit(editKey)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 7,
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <PencilIcon size={12} /> Edit
      </button>
    );
  };

  // Read-only field display
  const FieldDisplay = ({ value, placeholder = '—' }) => (
    <p style={{ fontSize: 13, color: value ? 'var(--text)' : 'var(--text-dim)', padding: '9px 0' }}>
      {value || placeholder}
    </p>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'hunt-fade-in 0.25s ease' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, padding: '7px 18px', borderRadius: 7, fontSize: 12, fontWeight: 500,
          background: toast.type === 'err' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)',
          color: '#fff', pointerEvents: 'none', boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header + section tabs */}
      <div style={{ flexShrink: 0, padding: '28px 40px 0', background: 'var(--bg)' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 4 }}>Profile</p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 26, fontWeight: 400, color: 'var(--text)', marginBottom: 16 }}>
          {d.full_name ? <>{d.full_name.split(' ')[0]}<em style={{ fontStyle: 'italic' }}>'s profile.</em></> : <em>Your profile.</em>}
        </h1>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400,
              color: activeSection === s.id ? 'var(--text)' : 'var(--text-dim)',
              borderBottom: activeSection === s.id ? '2px solid var(--text)' : '2px solid transparent',
              marginBottom: '-1px', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'color 0.1s',
            }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px' }}>

        {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
        {activeSection === 'overview' && (
          <div style={{ maxWidth: 760 }}>

            {/* Banner + Avatar */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ height: 120, background: 'linear-gradient(135deg, #1A7A4A 0%, #0D4A2E 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 24, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>On a hunt.</p>
              </div>
              <div style={{ padding: '0 28px 24px' }}>
                <div style={{ marginTop: -36, marginBottom: 12 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-tint)', border: '4px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>
                    {initials}
                  </div>
                </div>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 3 }}>{d.full_name || '—'}</p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>{d.college}{d.year ? ` · Year ${d.year}` : ''}</p>
                {d.headline && <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 4, lineHeight: 1.5 }}>{d.headline}</p>}
              </div>
            </div>

            {/* Headline & Bio */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Headline & Bio</p>
                <EditSaveBtn editKey="bio" onSave={() => save({ headline: d.headline, bio: d.bio })} />
              </div>
              {editMode['bio'] ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <FieldLabel>Headline</FieldLabel>
                    <input style={inp_p} value={d.headline || ''} placeholder="Full Stack Dev · Open to internships"
                      onChange={e => setDraft(x => ({ ...x, headline: e.target.value }))} />
                  </div>
                  <div>
                    <FieldLabel>Bio</FieldLabel>
                    <textarea style={{ ...inp_p, resize: 'vertical' }} rows={4} value={d.bio || ''} placeholder="Tell recruiters about yourself..."
                      onChange={e => setDraft(x => ({ ...x, bio: e.target.value }))} />
                  </div>
                </div>
              ) : (
                <div>
                  <FieldLabel>Headline</FieldLabel>
                  <FieldDisplay value={d.headline} placeholder="No headline yet — click Edit to add" />
                  <FieldLabel>Bio</FieldLabel>
                  <p style={{ fontSize: 13, color: d.bio ? 'var(--text-mid)' : 'var(--text-dim)', lineHeight: 1.6 }}>
                    {d.bio || 'No bio yet — click Edit to add'}
                  </p>
                </div>
              )}
            </Card>

            {/* Basic Info */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Basic Info</p>
                <EditSaveBtn editKey="basic" onSave={() => save({ full_name: d.full_name, college: d.college, year: d.year, phone: d.phone, email: d.email })} />
              </div>
              {editMode['basic'] ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { f: 'full_name', label: 'Full Name', ph: 'Priya Sharma' },
                    { f: 'college', label: 'College', ph: 'VJTI Mumbai' },
                    { f: 'phone', label: 'Phone', ph: '+91 98765 43210' },
                    { f: 'email', label: 'Email', ph: 'you@email.com' },
                  ].map(({ f, label, ph }) => (
                    <div key={f}>
                      <FieldLabel>{label}</FieldLabel>
                      <input style={inp_p} value={d[f] || ''} placeholder={ph}
                        onChange={e => setDraft(x => ({ ...x, [f]: e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <FieldLabel>Year</FieldLabel>
                    <select style={inp_p} value={d.year || 3}
                      onChange={e => setDraft(x => ({ ...x, year: parseInt(e.target.value) }))}>
                      {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}{['st', 'nd', 'rd', 'th'][y - 1]} Year</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Full Name', val: d.full_name },
                    { label: 'College', val: d.college },
                    { label: 'Phone', val: d.phone },
                    { label: 'Email', val: d.email },
                    { label: 'Year', val: d.year ? `${d.year}${['st', 'nd', 'rd', 'th'][d.year - 1]} Year` : null },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <FieldLabel>{label}</FieldLabel>
                      <FieldDisplay value={val} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ══ RESUME ════════════════════════════════════════════════════════ */}
        {activeSection === 'resume' && (
          <div style={{ maxWidth: 700 }}>

            {/* Key Links */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Key Links</p>
                <EditSaveBtn editKey="links" onSave={() => save({ github_url: d.github_url, linkedin_url: d.linkedin_url, portfolio_url: d.portfolio_url })} />
              </div>
              {[
                { key: 'github_url', bg: '#24292e', label: 'GitHub', ph: 'https://github.com/username' },
                { key: 'linkedin_url', bg: '#0A66C2', label: 'LinkedIn', ph: 'https://linkedin.com/in/username' },
                { key: 'portfolio_url', bg: '#5A5A56', label: 'Portfolio', ph: 'https://yoursite.com' },
              ].map(({ key, bg, label, ph }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>{label[0]}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', width: 80, flexShrink: 0 }}>{label}</span>
                  {editMode['links'] ? (
                    <input style={{ ...inp_p, padding: '5px 9px' }} value={d[key] || ''} placeholder={ph}
                      onChange={e => setDraft(x => ({ ...x, [key]: e.target.value }))} />
                  ) : (
                    <span style={{ fontSize: 12, color: d[key] ? 'var(--green)' : 'var(--text-dim)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d[key] || 'Not set'}
                    </span>
                  )}
                </div>
              ))}
            </Card>

            {/* ── FIX 3: Resume PDF upload ── */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Resume PDF</p>
              {d.resume_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 8, border: '1px solid var(--green)', background: 'var(--green-tint)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--green-text)' }}>Resume uploaded</span>
                  <a href={d.resume_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--green-text)', textDecoration: 'none' }}>View ↗</a>
                  <label style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--green)', color: 'var(--green)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {uploadingResume ? 'Uploading…' : 'Replace'}
                    <input ref={resumeRef} type="file" accept=".pdf" style={{ display: 'none' }}
                      onChange={e => handleResumeUpload(e.target.files[0])} />
                  </label>
                </div>
              ) : (
                <label
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '32px', borderRadius: 10, border: '2px dashed var(--border-mid)', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-tint)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>
                    {uploadingResume ? 'Uploading…' : <>Drop PDF here or <span style={{ color: 'var(--green)' }}>browse files</span></>}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>PDF up to 5MB</span>
                  <input ref={resumeRef} type="file" accept=".pdf" style={{ display: 'none' }}
                    onChange={e => handleResumeUpload(e.target.files[0])} />
                </label>
              )}
            </Card>

            {/* Summary */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Summary</p>
                <EditSaveBtn editKey="summary" onSave={() => save({ summary: d.summary })} />
              </div>
              {editMode['summary'] ? (
                <textarea style={{ ...inp_p, resize: 'vertical' }} rows={4} value={d.summary || ''} placeholder="Brief professional summary..."
                  onChange={e => setDraft(x => ({ ...x, summary: e.target.value }))} />
              ) : (
                <p style={{ fontSize: 13, color: d.summary ? 'var(--text-mid)' : 'var(--text-dim)', lineHeight: 1.6 }}>
                  {d.summary || 'No summary yet — click Edit to add'}
                </p>
              )}
            </Card>

            {/* Education */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Education</p>
                <button onClick={() => setAddingEdu(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  + Add
                </button>
              </div>
              {(d.education || []).map((edu, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20 }}>🎓</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{edu.school}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-mid)' }}>{edu.degree}{edu.major ? ` · ${edu.major}` : ''}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{edu.startYear}–{edu.endYear || 'Present'}</p>
                  </div>
                  <button onClick={() => { const ed = (d.education || []).filter((_, j) => j !== i); setDraft(x => ({ ...x, education: ed })); save({ education: ed }); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 18, lineHeight: 1 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                </div>
              ))}
              {addingEdu && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 9, padding: 16, background: 'var(--bg-subtle)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    {[{ f: 'school', ph: 'University/College *' }, { f: 'degree', ph: 'Bachelor of Science' }, { f: 'major', ph: 'Computer Science' }, { f: 'startYear', ph: '2021' }, { f: 'endYear', ph: '2025' }].map(({ f, ph }) => (
                      <input key={f} style={inp_p} value={newEdu[f]} placeholder={ph}
                        onChange={e => setNewEdu(x => ({ ...x, [f]: e.target.value }))} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { if (!newEdu.school) return; const ed = [...(d.education || []), newEdu]; setDraft(x => ({ ...x, education: ed })); save({ education: ed }); setNewEdu({ school: '', degree: '', major: '', startYear: '', endYear: '' }); setAddingEdu(false); }}
                      style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                    <button onClick={() => setAddingEdu(false)}
                      style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Projects */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Projects</p>
                <button onClick={() => setAddingProject(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  + Add
                </button>
              </div>
              {(d.projects || []).map((p, i) => (
                <div key={i} style={{ padding: '12px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.title || p.name}</p>
                    <button onClick={() => { const pr = (d.projects || []).filter((_, j) => j !== i); setDraft(x => ({ ...x, projects: pr })); save({ projects: pr }); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 18, lineHeight: 1 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                  </div>
                  {p.description && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, lineHeight: 1.5 }}>{p.description}</p>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {(Array.isArray(p.techStack) ? p.techStack : []).map((t, j) => (
                      <span key={j} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-mid)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
              {addingProject && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 9, padding: 16, background: 'var(--bg-subtle)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <input style={inp_p} value={newProject.title} placeholder="Project title *"
                      onChange={e => setNewProject(x => ({ ...x, title: e.target.value }))} />
                    <input style={inp_p} value={newProject.techStack} placeholder="React, Node.js, PostgreSQL"
                      onChange={e => setNewProject(x => ({ ...x, techStack: e.target.value }))} />
                  </div>
                  <textarea style={{ ...inp_p, resize: 'none', marginBottom: 10 }} rows={2} value={newProject.description} placeholder="What does it do?"
                    onChange={e => setNewProject(x => ({ ...x, description: e.target.value }))} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <input style={inp_p} value={newProject.projectUrl} placeholder="Live URL"
                      onChange={e => setNewProject(x => ({ ...x, projectUrl: e.target.value }))} />
                    <input style={inp_p} value={newProject.githubUrl} placeholder="GitHub URL"
                      onChange={e => setNewProject(x => ({ ...x, githubUrl: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => {
                      if (!newProject.title) return;
                      const pr = [...(d.projects || []), { ...newProject, techStack: newProject.techStack.split(',').map(t => t.trim()), id: Date.now() }];
                      setDraft(x => ({ ...x, projects: pr }));
                      save({ projects: pr });
                      setNewProject({ title: '', techStack: '', description: '', projectUrl: '', githubUrl: '' });
                      setAddingProject(false);
                    }} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add Project</button>
                    <button onClick={() => setAddingProject(false)}
                      style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Certifications */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Certifications</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
                {(d.certifications || []).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: 12 }}>
                    🏅 {c}
                    <button onClick={() => { const cer = (d.certifications || []).filter((_, j) => j !== i); setDraft(x => ({ ...x, certifications: cer })); save({ certifications: cer }); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 14, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp_p, flex: 1 }} value={newCert} placeholder="AWS Certified Developer..."
                  onChange={e => setNewCert(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newCert.trim()) { const cer = [...(d.certifications || []), newCert.trim()]; setDraft(x => ({ ...x, certifications: cer })); save({ certifications: cer }); setNewCert(''); } }} />
                <button onClick={() => { if (!newCert.trim()) return; const cer = [...(d.certifications || []), newCert.trim()]; setDraft(x => ({ ...x, certifications: cer })); save({ certifications: cer }); setNewCert(''); }}
                  style={{ padding: '0 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
              </div>
            </Card>

            {/* Awards */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Awards & Achievements</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                {(d.awards || []).map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: 12 }}>
                    <span>⭐ {a}</span>
                    <button onClick={() => { const aw = (d.awards || []).filter((_, j) => j !== i); setDraft(x => ({ ...x, awards: aw })); save({ awards: aw }); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 16, lineHeight: 1 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp_p, flex: 1 }} value={newAward} placeholder="1st place at Flipkart GRiD..."
                  onChange={e => setNewAward(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newAward.trim()) { const aw = [...(d.awards || []), newAward.trim()]; setDraft(x => ({ ...x, awards: aw })); save({ awards: aw }); setNewAward(''); } }} />
                <button onClick={() => { if (!newAward.trim()) return; const aw = [...(d.awards || []), newAward.trim()]; setDraft(x => ({ ...x, awards: aw })); save({ awards: aw }); setNewAward(''); }}
                  style={{ padding: '0 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
              </div>
            </Card>

            {/* Coding Profiles */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Coding & Competitive Profiles</p>
                <EditSaveBtn editKey="coding" onSave={() => save({ coding_profiles: d.coding_profiles })} />
              </div>
              {Object.entries(PLATFORM_LOGOS).map(([key, { label, color }]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'white' }}>{label.slice(0, 2)}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', width: 120, flexShrink: 0 }}>{label}</span>
                  {editMode['coding'] ? (
                    <input style={{ ...inp_p, padding: '6px 10px' }} value={d.coding_profiles?.[key] || ''} placeholder="username"
                      onChange={e => setDraft(x => ({ ...x, coding_profiles: { ...(x.coding_profiles || {}), [key]: e.target.value } }))} />
                  ) : (
                    <span style={{ fontSize: 12, color: d.coding_profiles?.[key] ? 'var(--text)' : 'var(--text-dim)' }}>
                      {d.coding_profiles?.[key] || '—'}
                    </span>
                  )}
                </div>
              ))}
            </Card>

            {/* Other links */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Other Links</p>
              {(d.other_links || []).map((link, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>🔗</span>
                  <span style={{ fontSize: 12, color: 'var(--text)', flex: 1 }}>{link.label}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--green)', textDecoration: 'none', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</a>
                  <button onClick={() => { const nl = (d.other_links || []).filter((_, j) => j !== i); setDraft(x => ({ ...x, other_links: nl })); save({ other_links: nl }); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 18, lineHeight: 1 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginBottom: 8 }}>
                <input style={inp_p} value={newOtherLink.label} placeholder="Label (e.g. Research Paper)"
                  onChange={e => setNewOtherLink(x => ({ ...x, label: e.target.value }))} />
                <input style={inp_p} value={newOtherLink.url} placeholder="https://..."
                  onChange={e => setNewOtherLink(x => ({ ...x, url: e.target.value }))} />
              </div>
              <button onClick={() => { if (!newOtherLink.url.trim()) return; const nl = [...(d.other_links || []), { label: newOtherLink.label || newOtherLink.url, url: newOtherLink.url }]; setDraft(x => ({ ...x, other_links: nl })); save({ other_links: nl }); setNewOtherLink({ label: '', url: '' }); }}
                style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add Link</button>
            </Card>
          </div>
        )}

        {/* ══ SKILLS ════════════════════════════════════════════════════════ */}
        {activeSection === 'skills' && (() => {
          const addedSkills = d.skills || [];
          const grouped = SKILL_CATS_P.reduce((acc, cat) => {
            const inCat = addedSkills.filter(s => s.category === cat);
            if (inCat.length > 0) acc[cat] = inCat;
            return acc;
          }, {});
          const LEVELS = [
            { v: 1, label: 'Beginner', desc: 'Just started learning' },
            { v: 2, label: 'Elementary', desc: 'Built a few small things' },
            { v: 3, label: 'Intermediate', desc: 'Used in real projects' },
            { v: 4, label: 'Advanced', desc: 'Deep knowledge, prod use' },
            { v: 5, label: 'Expert', desc: 'Mentor others, go-to person' },
          ];
          const confirmAdd = (level) => {
            if (!pendingSkill) return;
            const skillDef = SKILL_OPTIONS_P.find(s => s.name === pendingSkill);
            if (!skillDef) return;
            setDraft(x => ({ ...x, skills: [...(x.skills || []), { id: Date.now(), name: pendingSkill, level, category: skillDef.cat }] }));
            setPendingSkill(null);
          };
          const levelColors = ['', '#9B9B97', '#D4A84B', '#1A7A4A', '#0A66C2', '#7C3AED'];

          return (
            <div style={{ maxWidth: 760 }}>
              {/* Level picker modal */}
              {pendingSkill && (
                <>
                  <div onClick={() => setPendingSkill(null)} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }} />
                  <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 401, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px 24px', width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      {getSkillLogo(pendingSkill)}
                      <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)' }}>{pendingSkill}</p>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 20 }}>How well do you know this?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {LEVELS.map(lv => (
                        <button key={lv.v} onClick={() => confirmAdd(lv.v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-subtle)', cursor: 'pointer', fontFamily: 'inherit' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-tint)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 3 }}>
                              {[1, 2, 3, 4, 5].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: d <= lv.v ? 'var(--green)' : 'var(--border)' }} />)}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{lv.label}</span>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{lv.desc}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setPendingSkill(null)} style={{ marginTop: 14, width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 18, fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)', marginBottom: 3 }}>Technical Skills</p>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>{addedSkills.length} skill{addedSkills.length !== 1 ? 's' : ''} added</p>
                </div>
                <button onClick={() => save({ skills: d.skills || [] })} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
                  <CheckIcon size={12} /> {saving ? 'Saving…' : 'Save Skills'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {SKILL_CATS_P.map(cat => {
                    const cnt = addedSkills.filter(s => s.category === cat).length;
                    return (
                      <button key={cat} onClick={() => setSkillCat(cat)} className="hn-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: skillCat === cat ? 'var(--bg-subtle)' : 'transparent', color: skillCat === cat ? 'var(--text)' : 'var(--text-dim)', fontSize: 13, fontWeight: skillCat === cat ? 600 : 400, textAlign: 'left' }}>
                        <span>{cat}</span>
                        {cnt > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', background: 'var(--green-tint)', borderRadius: 20, padding: '1px 7px' }}>{cnt}</span>}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>{skillCat}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {SKILL_OPTIONS_P.filter(s => s.cat === skillCat).map(skill => {
                        const added = addedSkills.some(s => s.name === skill.name);
                        return (
                          <button key={skill.name} onClick={() => { if (!added) setPendingSkill(skill.name); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, fontSize: 12, fontFamily: 'inherit', cursor: added ? 'default' : 'pointer', border: `1px solid ${added ? 'var(--green)' : 'var(--border)'}`, background: added ? 'var(--green-tint)' : 'var(--bg-subtle)', color: added ? 'var(--green-text)' : 'var(--text-mid)' }}>
                            {getSkillLogo(skill.name)}
                            {added ? '✓ ' : '+ '}{skill.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {addedSkills.length > 0 ? (
                    <div>
                      {Object.entries(grouped).map(([cat, skills]) => (
                        <div key={cat} style={{ marginBottom: 20 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>{cat}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {skills.map(skill => {
                              const i = addedSkills.findIndex(s => s.name === skill.name);
                              return (
                                <div key={skill.id || skill.name} title={`${skill.name} · ${LEVEL_LABELS_P[skill.level]}`}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px 6px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 12, color: 'var(--text)' }}>
                                  {getSkillLogo(skill.name)}
                                  <span style={{ fontWeight: 500 }}>{skill.name}</span>
                                  <div style={{ display: 'flex', gap: 2, marginLeft: 2 }}>
                                    {[1, 2, 3, 4, 5].map(lv => (
                                      <div key={lv} style={{ width: 4, height: 4, borderRadius: '50%', background: skill.level >= lv ? levelColors[skill.level] : 'var(--border)' }} />
                                    ))}
                                  </div>
                                  <button onClick={() => setDraft(x => ({ ...x, skills: (x.skills || []).filter((_, j) => j !== i) }))}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--border-mid)', fontSize: 13, lineHeight: 1 }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--border-mid)'}>×</button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '32px', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 12 }}>
                      <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Click a skill above to add it</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ══ PREFERENCES ══════════════════════════════════════════════════ */}
        {activeSection === 'prefs' && (
          <div style={{ maxWidth: 700 }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Work Preferences</p>
                <EditSaveBtn editKey="prefs" onSave={() => save({ preferred_roles: d.preferred_roles, availability: d.availability, work_preference: d.work_preference, min_stipend: d.min_stipend })} />
              </div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Preferred Roles</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 18 }}>
                {ROLE_OPTIONS_P.map(role => {
                  const sel = (d.preferred_roles || []).includes(role);
                  return (
                    <button key={role} onClick={() => setDraft(x => ({ ...x, preferred_roles: sel ? (x.preferred_roles || []).filter(r => r !== role) : [...(x.preferred_roles || []), role] }))}
                      style={{ padding: '9px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', border: `1px solid ${sel ? 'var(--green)' : 'var(--border)'}`, background: sel ? 'var(--green-tint)' : 'transparent', color: sel ? 'var(--green-text)' : 'var(--text-mid)', fontWeight: sel ? 500 : 400 }}>
                      {role}
                    </button>
                  );
                })}
              </div>
              {editMode['prefs'] && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <FieldLabel>Availability</FieldLabel>
                    <select style={inp_p} value={d.availability || 'Immediate'} onChange={e => setDraft(x => ({ ...x, availability: e.target.value }))}>
                      <option>Immediate</option><option>After exams</option><option>Next semester</option><option>Not available</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Work Preference</FieldLabel>
                    <select style={inp_p} value={d.work_preference || 'remote'} onChange={e => setDraft(x => ({ ...x, work_preference: e.target.value }))}>
                      <option value="remote">Remote</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="any">Any</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Min Stipend</FieldLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>₹</span>
                      <input style={{ ...inp_p, maxWidth: 150 }} type="number" value={d.min_stipend || ''} placeholder="0"
                        onChange={e => setDraft(x => ({ ...x, min_stipend: e.target.value }))} />
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>/month</span>
                    </div>
                  </div>
                </div>
              )}
              {!editMode['prefs'] && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Availability', val: d.availability || 'Immediate' },
                    { label: 'Work type', val: d.work_preference || 'Remote' },
                    { label: 'Min stipend', val: d.min_stipend ? `₹${d.min_stipend}/mo` : 'Any' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{val}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Notifications</p>
              {[
                { label: 'New job matches', sub: 'When a job matches your skills', key: 'notif_matches' },
                { label: 'Application updates', sub: 'When recruiters view your profile', key: 'notif_apps' },
                { label: 'Weekly digest', sub: 'Summary every Monday', key: 'notif_digest' },
                { label: 'Interview invites', sub: 'Direct interview invitations', key: 'notif_interviews' },
              ].map(({ label, sub, key }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{sub}</p>
                  </div>
                  <Toggle_P on={d[key] !== false} onChange={val => { setDraft(x => ({ ...x, [key]: val })); save({ [key]: val }); }} />
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ══ MY HUNT ════════════════════════════════════════════════════════ */}
        {activeSection === 'myhunt' && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Private · Only you see this</p>
              <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 34, fontWeight: 400, color: 'var(--text)', lineHeight: 1.15, marginBottom: 10 }}>
                What are you<br /><em>really</em> hunting for?
              </h1>
            </div>
            {[
              { key: 'my_hunt', label: 'The Hunt', sub: 'Not the job title. What are you actually after?', ph: "I'm hunting for the place where craft meets impact..." },
              { key: 'philosophy', label: 'Philosophy', sub: 'How you see the world. What you believe is true.', ph: "I believe the best products start with genuine frustration..." },
              { key: 'inspirations', label: 'What moves you', sub: 'Books, people, ideas that rewired how you think.', ph: "Paul Graham's essays, The Mom Test, Feynman..." },
              { key: 'life_outside', label: 'Life outside work', sub: 'Who are you when the laptop is closed?', ph: "Cricket every Sunday morning..." },
            ].map((section, idx) => (
              <div key={section.key}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', fontFamily: "'Editorial New', Georgia, serif" }}>0{idx + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', marginBottom: 2 }}>{section.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{section.sub}</p>
                  </div>
                  {d[section.key] && (
                    <button onClick={() => save({ [section.key]: d[section.key] })} disabled={saving}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                      <CheckIcon size={10} /> Save
                    </button>
                  )}
                </div>
                <textarea value={d[section.key] || ''} onChange={e => setDraft(x => ({ ...x, [section.key]: e.target.value }))}
                  placeholder={section.ph}
                  style={{ ...inp_p, resize: 'none', lineHeight: 1.8, fontSize: 14, padding: '12px 0', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, marginBottom: 40 }} rows={4} />
              </div>
            ))}
            {/* Quote */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>A line you live by</p>
              {d.quote && (
                <div style={{ borderLeft: '2px solid var(--green)', paddingLeft: 16, marginBottom: 12 }}>
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', fontStyle: 'italic', marginBottom: 4 }}>"{d.quote}"</p>
                  {d.quote_author && <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{d.quote_author}</p>}
                </div>
              )}
              <input style={{ ...inp_p, marginBottom: 8, fontStyle: 'italic' }} value={d.quote || ''} placeholder="The people who are crazy enough to think..."
                onChange={e => setDraft(x => ({ ...x, quote: e.target.value }))} />
              <input style={{ ...inp_p, marginBottom: 8 }} value={d.quote_author || ''} placeholder="— Steve Jobs (or write your own)"
                onChange={e => setDraft(x => ({ ...x, quote_author: e.target.value }))} />
              {d.quote && (
                <button onClick={() => save({ quote: d.quote, quote_author: d.quote_author })} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <CheckIcon size={11} /> Save quote
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══ REVIEWS ════════════════════════════════════════════════════════ */}
        {activeSection === 'reviews' && (
          <div style={{ maxWidth: 640 }}>
            <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>What recruiters say.</h1>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 440, marginBottom: 28 }}>After internships close, recruiters rate your performance. Visible to future recruiters and boosts your HUNT Score.</p>
            <div style={{ padding: '64px 32px', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 14, background: 'var(--bg-card)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⭐</div>
              <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>No reviews yet.</p>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>Complete an internship through HUNT and your recruiter will be invited to leave a review.</p>
            </div>
          </div>
        )}

        {/* ══ HUNT SCORE ════════════════════════════════════════════════════ */}
        {activeSection === 'huntscore' && (
          <div style={{ maxWidth: 640 }}>
            <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>Your signal, scored.</h1>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 480, marginBottom: 24 }}>Your HUNT Score is a dynamic credibility score built from verified skills, project proof, recruiter feedback, and consistency.</p>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 28 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-subtle)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 26, color: 'var(--text-dim)' }}>—</p>
              </div>
              <div>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>Not yet calculated</p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>Complete your profile, add verified projects, and get your first recruiter rating to unlock your score.</p>
              </div>
            </div>
            {[
              { label: 'Profile completeness', desc: 'Name, college, bio, photo' },
              { label: 'Verified skills', desc: 'Skills with proof of work' },
              { label: 'Project portfolio', desc: 'At least 2 projects with links' },
              { label: 'First recruiter rating', desc: 'Complete an internship through HUNT' },
              { label: 'Response rate', desc: 'Reply to recruiter messages within 48h' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-card)', marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-mid)', marginBottom: 1 }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{item.desc}</p>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Pending</span>
              </div>
            ))}
          </div>
        )}

        {/* ══ ACCOUNT ════════════════════════════════════════════════════════ */}
        {activeSection === 'account' && (
          <div style={{ maxWidth: 560 }}>
            <p style={{ fontSize: 18, fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)', marginBottom: 24 }}>Account</p>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 10, background: 'var(--bg-subtle)', border: '1px solid var(--border)', marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--green-tint)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>{initials}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{d.full_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{d.email}</p>
                </div>
              </div>
              <FieldLabel>Change email</FieldLabel>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp_p, flex: 1 }} type="email" value={d.email || ''} placeholder="new@email.com"
                  onChange={e => setDraft(x => ({ ...x, email: e.target.value }))} />
                <button onClick={() => save({ email: d.email })} disabled={saving}
                  style={{ padding: '0 16px', borderRadius: 7, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                  Change
                </button>
              </div>
            </Card>
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Appearance</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['light', 'dark'].map(t => (
                  <button key={t} onClick={() => setTheme(t)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1.5px solid ${theme === t ? 'var(--text)' : 'var(--border)'}`, background: theme === t ? 'var(--bg-subtle)' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: theme === t ? 600 : 400, color: 'var(--text)', fontFamily: 'inherit' }}>
                    {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                ))}
              </div>
            </Card>
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Privacy</p>
              {[
                { label: 'Visible to recruiters', sub: 'Recruiters can find your profile', key: 'privacy_visible', def: true },
                { label: 'Show college name', sub: 'Display your college on profile', key: 'privacy_college', def: true },
                { label: 'Activity status', sub: 'Show when last active', key: 'privacy_activity', def: false },
              ].map(({ label, sub, key, def }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{sub}</p>
                  </div>
                  <Toggle_P on={d[key] !== undefined ? d[key] : def} onChange={val => { setDraft(x => ({ ...x, [key]: val })); save({ [key]: val }); }} />
                </div>
              ))}
            </Card>
            <div style={{ padding: '16px 18px', borderRadius: 10, border: '1px solid var(--red)', background: 'var(--red-tint)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 3 }}>Danger Zone</p>
              <p style={{ fontSize: 12, color: 'var(--red)', opacity: 0.8, marginBottom: 12 }}>Permanently delete your account. Cannot be undone.</p>
              <button onClick={() => { if (window.confirm('Delete your account? This cannot be undone.')) showToast('Account deletion coming soon', 'err'); }}
                style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid var(--red)', background: 'transparent', color: 'var(--red)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Delete account</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
