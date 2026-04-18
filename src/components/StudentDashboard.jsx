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
              <button key={id} className="hn-item" onClick={() => { if (id === 'profile') { navigate('/profile'); return; } setActiveTab(id); }}
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
                { label: 'Profile', action: () => { navigate('/profile'); setShowAccountMenu(false); } },
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
