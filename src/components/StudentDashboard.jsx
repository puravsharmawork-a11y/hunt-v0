// src/components/StudentDashboard.jsx
// ─── HUNT Candidate Dashboard ─────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  Heart, X, TrendingUp, Target, Briefcase, MapPin, Clock,
  AlertCircle, CheckCircle2, ChevronRight, Zap, Award, LogOut,
  Sun, Moon, Home, Users, User, Bell, BookOpen,
  Compass, BellRing, Maximize2, Minimize2, SlidersHorizontal,
  LayoutGrid, LayoutList, Sparkles, Search, Filter, Bookmark,
  ClipboardList, FileText, Star, Link, Pencil, Check, Upload
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

// ─── Filter panel ──────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, onClose, jobs }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>Filters</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={14} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
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
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
            Min match: <span style={{ color: 'var(--green)' }}>{filters.minMatch}%</span>
          </label>
          <input type="range" min={0} max={100} step={5} value={filters.minMatch}
            onChange={e => onChange('minMatch', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--green)' }} />
        </div>
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
      <button onClick={e => { e.stopPropagation(); onSave(job); }} style={{
        position: 'absolute', top: '12px', right: '12px',
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        color: isSaved ? 'var(--green)' : 'var(--text-dim)',
        display: 'flex', alignItems: 'center',
      }}>
        <Bookmark size={14} fill={isSaved ? 'var(--green)' : 'none'} />
      </button>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{job.logo}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '2px' }}>{job.company}</p>
          <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '15px', fontWeight: 400, color: 'var(--text)', lineHeight: 1.2 }}>{job.role}</h3>
        </div>
        {matchData && (
          <div style={{ flexShrink: 0, fontSize: '13px', fontFamily: "'Editorial New', Georgia, serif", padding: '3px 8px', borderRadius: '6px', color: scoreColor(matchData.score), background: scoreBg(matchData.score) }}>{matchData.score}%</div>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
        {[{ Icon: Briefcase, val: job.stipend }, { Icon: MapPin, val: job.location }, { Icon: Clock, val: job.duration }].map(({ Icon, val }) => (
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
              <span key={i} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', border: `1px solid ${matched ? 'var(--green)' : 'var(--border)'}`, color: matched ? 'var(--green-text)' : 'var(--text-dim)', background: matched ? 'var(--green-tint)' : 'transparent' }}>{s.name}</span>
            );
          })}
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{job.current_applicants}/{job.max_applicants}</span>
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onToggleMaximize} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={() => onSave(job)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? 'var(--green)' : 'var(--text-dim)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
            <Bookmark size={14} fill={isSaved ? 'var(--green)' : 'none'} />
          </button>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
          <X size={16} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <span style={{ fontSize: '44px', lineHeight: 1, flexShrink: 0 }}>{job.logo}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>{job.company}</p>
            <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '22px', fontWeight: 400, color: 'var(--text)', lineHeight: 1.2, marginBottom: '6px' }}>{job.role}</h2>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{job.type}</span>
          </div>
          {matchData && (
            <div style={{ flexShrink: 0, padding: '10px 14px', borderRadius: '10px', textAlign: 'center', background: scoreBg(matchData.score) }}>
              <div style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '26px', fontWeight: 400, color: scoreColor(matchData.score) }}>{matchData.score}%</div>
              <p style={{ fontSize: '10px', color: scoreColor(matchData.score), opacity: 0.7 }}>match</p>
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {[{ Icon: Briefcase, val: job.stipend }, { Icon: Clock, val: job.duration }, { Icon: MapPin, val: job.location }, { Icon: Target, val: `${job.current_applicants}/${job.max_applicants} applied` }].map(({ Icon, val }) => (
            <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-subtle)' }}>
              <Icon size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'var(--text-mid)' }}>{val}</span>
            </div>
          ))}
        </div>
        {matchData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: 500, background: compBg(matchData.competitionLevel), color: compColor(matchData.competitionLevel) }}>
            <TrendingUp size={13} /> {matchData.competitionLevel} competition
          </div>
        )}
        <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '20px' }}>{job.description}</p>
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
      </div>
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

  const currentJob = jobs[currentIndex];
  const matchData = currentJob ? calculateMatchScore(studentProfile, currentJob) : null;
  const scoreColor = s => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)';
  const scoreBg    = s => s >= 75 ? 'var(--green-tint)' : s >= 50 ? 'var(--amber-tint)' : 'var(--red-tint)';

  const handleSwipe = (dir) => {
    setSwipeDir(dir);
    setTimeout(() => {
      if (dir === 'right') setShowBreakdown(true);
      else { moveToNext(); }
      setSwipeDir(null);
    }, 280);
  };

  const moveToNext = () => {
    setShowBreakdown(false);
    if (currentIndex < jobs.length - 1) setCurrentIndex(i => i + 1);
  };

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
          <button onClick={() => handleSwipe('left')} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} style={{ color: 'var(--red)' }} />
          </button>
          <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>swipe</span>
          <button onClick={() => handleSwipe('right')} disabled={!canApply} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: canApply ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: canApply ? 1 : 0.3 }}>
            <Heart size={18} style={{ color: 'var(--green)' }} />
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-dim)', marginTop: '8px' }}>{currentIndex + 1} of {jobs.length}</p>
      </div>
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
  const [notified, setNotified] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
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
      const activeJobs = await getActiveJobs();
      const jobsWithScores = activeJobs.map(job => ({ ...job, _match: calculateMatchScore(profile, job) }));
      setAllJobs(jobsWithScores.filter(j => j._match.score >= 30).sort((a, b) => b._match.score - a._match.score));
      setWeeklyApplications(await getWeeklyApplicationCount());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFilterChange = (key, val) => {
    if (key === 'reset') { setFilters({ role: '', location: '', minMatch: 0, stipend: 'Any', duration: 'Any', skill: '' }); return; }
    setFilters(prev => ({ ...prev, [key]: prev[key] === val ? '' : val }));
  };

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

  const handleJobClick = (job) => { setSelectedJob(job); setSelectedMatch(job._match); };
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
        .hunt-input { width: 100%; padding: 9px 12px; border-radius: 7px; border: 1px solid var(--border); background: var(--bg-subtle); color: var(--text); font-size: 12px; font-family: inherit; outline: none; box-sizing: border-box; }
        .hunt-input:focus { border-color: var(--green); }
        .hunt-textarea { width: 100%; padding: 9px 12px; border-radius: 7px; border: 1px solid var(--border); background: var(--bg-subtle); color: var(--text); font-size: 12px; font-family: inherit; outline: none; box-sizing: border-box; resize: none; }
        .hunt-textarea:focus { border-color: var(--green); }
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
          <div style={{ padding: '9px 11px', borderRadius: '7px', background: 'var(--bg-subtle)', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Applies left</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--green)' }}>{remainingApplications}/5</span>
            </div>
            <div style={{ height: '3px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--green)', width: `${(remainingApplications / 5) * 100}%`, borderRadius: '999px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px', padding: '0 2px', marginBottom: '6px' }}>
            <button onClick={() => setShowNotifications(p => !p)} style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: showNotifications ? 'var(--bg-subtle)' : 'none', border: 'none', cursor: 'pointer', padding: '7px', borderRadius: '6px', color: 'var(--text-dim)' }} className="hn-item">
              <Bell size={13} />
            </button>
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '7px', borderRadius: '6px', color: 'var(--text-dim)' }} className="hn-item">
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </button>
          </div>
          <div onClick={() => setShowAccountMenu(p => !p)} className="hn-item" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 11px', borderRadius: '7px', cursor: 'pointer', transition: 'background 0.12s' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, background: 'var(--green-tint)', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--green)' }}>{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{studentProfile?.full_name}</p>
              <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Student</p>
            </div>
          </div>
          {showAccountMenu && (
            <div style={{ margin: '4px 2px 0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '1px' }}>Signed in as</p>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--green)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{studentProfile?.email}</p>
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
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '6px' }}>Home</p>
              <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '28px', fontWeight: 400, color: 'var(--text)' }}>
                Welcome back, <em>{studentProfile?.full_name?.split(' ')[0] || 'there'}.</em>
              </h1>
            </div>
            {/* Important tasks */}
            {(() => {
              const tasks = [];
              const p = studentProfile;
              if (!p?.profile_completeness || p.profile_completeness < 100)
                tasks.push({ id: 'profile', title: 'Complete your profile', desc: `You're ${p?.profile_completeness || 0}% done.`, cta: 'Complete now', action: () => setActiveTab('profile'), pct: p?.profile_completeness || 0 });
              if (!p?.linkedin_url)
                tasks.push({ id: 'linkedin', title: 'Link LinkedIn', desc: 'Recruiters always check LinkedIn first.', cta: 'Add LinkedIn', action: () => setActiveTab('profile') });
              if (!p?.github_url)
                tasks.push({ id: 'github', title: 'Add GitHub', desc: 'Your GitHub is proof of work.', cta: 'Add GitHub', action: () => setActiveTab('profile') });
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
            {/* Sub-tabs */}
            <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '24px', display: 'flex' }}>
              {[{ id: 'applications', label: 'Applications' }, { id: 'saved', label: 'Saved' }, { id: 'offers', label: 'Offers' }, { id: 'assessments', label: 'Assessments' }].map(t => (
                <button key={t.id} onClick={() => setHomeSubTab(t.id)} style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: homeSubTab === t.id ? 600 : 400, color: homeSubTab === t.id ? 'var(--text)' : 'var(--text-dim)', borderBottom: homeSubTab === t.id ? '2px solid var(--text)' : '2px solid transparent', marginBottom: '-1px', transition: 'color 0.12s', whiteSpace: 'nowrap' }}>{t.label}</button>
              ))}
            </div>
            {homeSubTab === 'applications' && (
              appliedJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                  <ClipboardList size={28} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 12px' }} />
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>No applications yet</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '20px' }}>All your applications will be visible here</p>
                  <button onClick={() => setActiveTab('explore')} style={{ padding: '9px 18px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '12px', cursor: 'pointer' }}>Explore opportunities</button>
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
            {homeSubTab === 'saved' && (
              savedJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                  <Bookmark size={28} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 12px' }} />
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>Nothing saved yet</p>
                  <button onClick={() => setActiveTab('explore')} style={{ marginTop: '16px', padding: '9px 18px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '12px', cursor: 'pointer' }}>Explore opportunities</button>
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
                      <button onClick={() => { setActiveTab('explore'); handleJobClick(job); }} style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '11px', cursor: 'pointer' }}>
                        View & apply
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
            {homeSubTab === 'offers' && (
              <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                <Star size={28} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 12px' }} />
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>No offers yet</p>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Offers will appear here once recruiters reach out</p>
              </div>
            )}
            {homeSubTab === 'assessments' && (
              <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                <FileText size={28} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 12px' }} />
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>Assessments coming soon</p>
              </div>
            )}
          </div>
        )}

        {/* ── EXPLORE ── */}
        {activeTab === 'explore' && (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', animation: 'hunt-fade-in 0.3s ease' }}>
            <div style={{ flex: selectedJob && !isPanelMaximized ? '0 0 42%' : 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: selectedJob ? '1px solid var(--border)' : 'none', transition: 'flex 0.2s ease' }}>
              <div style={{ padding: '18px 24px 0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '2px' }}>Explore</p>
                    <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '22px', fontWeight: 400, color: 'var(--text)' }}>Opportunities</h1>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => setHuntFastActive(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, background: huntFastActive ? 'var(--text)' : 'var(--bg-subtle)', color: huntFastActive ? 'var(--bg)' : 'var(--text-mid)', transition: 'all 0.15s' }}>
                      <Sparkles size={13} /> Hunt Fast
                    </button>
                    <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '7px', padding: '2px', border: '1px solid var(--border)' }}>
                      {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'swipe', Icon: Heart }].map(({ mode, Icon }) => (
                        <button key={mode} onClick={() => { setViewMode(mode); setSelectedJob(null); }} style={{ padding: '5px 8px', borderRadius: '5px', border: 'none', cursor: 'pointer', background: viewMode === mode ? 'var(--bg-card)' : 'transparent', color: viewMode === mode ? 'var(--text)' : 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setShowFilters(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '7px', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '11px', background: showFilters || activeFiltersCount > 0 ? 'var(--bg-subtle)' : 'transparent', color: 'var(--text-mid)' }}>
                      <SlidersHorizontal size={13} />
                      {activeFiltersCount > 0 && <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--green)', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFiltersCount}</span>}
                    </button>
                  </div>
                </div>
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search roles or companies…"
                    style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                {showFilters && <FilterPanel filters={filters} onChange={handleFilterChange} onClose={() => setShowFilters(false)} jobs={allJobs} />}
              </div>
              {allJobs.length > 0 && (
                <div style={{ padding: '0 24px 10px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{displayedJobs.length} {displayedJobs.length === 1 ? 'opportunity' : 'opportunities'}{huntFastActive && <span style={{ color: 'var(--green)', marginLeft: '6px' }}>· sorted by best match</span>}</span>
                </div>
              )}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
                {allJobs.length === 0 ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '56px 28px', textAlign: 'center', marginTop: '8px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '14px' }}>🎯</div>
                    <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '20px', fontWeight: 400, color: 'var(--text)', marginBottom: '8px' }}>No matching opportunities right now</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-dim)', maxWidth: '300px', margin: '0 auto 20px', lineHeight: 1.6 }}>We're onboarding new companies. We'll notify you the moment a role matches your skills.</p>
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
            {selectedJob && viewMode === 'grid' && (
              <div style={{ flex: isPanelMaximized ? 1 : '0 0 58%', overflow: 'hidden', transition: 'flex 0.2s ease' }}>
                <JobDetailPanel job={selectedJob} matchData={selectedMatch} isMaximized={isPanelMaximized} onToggleMaximize={() => setIsPanelMaximized(p => !p)} onClose={() => { setSelectedJob(null); setIsPanelMaximized(false); }} onApply={() => handleApply(selectedJob, selectedMatch)} applying={applying} canApply={canApply} isSaved={isJobSaved(selectedJob?.id)} onSave={handleSaveToggle} />
              </div>
            )}
          </div>
        )}

        {/* ── NETWORK ── */}
        {activeTab === 'network' && <NetworkTab studentProfile={studentProfile} />}

        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <ProfileTab
            studentProfile={studentProfile}
            setStudentProfile={setStudentProfile}
            theme={theme}
            setTheme={setTheme}
          />
        )}
      </main>

      {/* Notification flyout */}
      {showNotifications && (
        <>
          <div onClick={() => setShowNotifications(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
          <div style={{ position: 'fixed', bottom: '130px', left: '218px', width: '300px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', zIndex: 100, boxShadow: '0 8px 28px rgba(0,0,0,0.12)', overflow: 'hidden', animation: 'hunt-fade-in 0.15s ease' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>Notifications</p>
            </div>
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <Bell size={22} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '4px', fontFamily: "'Editorial New', Georgia, serif" }}>All clear</p>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No notifications right now.</p>
            </div>
          </div>
        </>
      )}

      {/* Settings panel */}
      {showSettings && (
        <>
          <div onClick={() => setShowSettings(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '440px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 28px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>Settings</p>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {['light', 'dark'].map(t => (
                  <button key={t} onClick={() => setTheme(t)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1.5px solid ${theme === t ? 'var(--text)' : 'var(--border)'}`, background: theme === t ? 'var(--bg-subtle)' : 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: theme === t ? 600 : 400, color: 'var(--text)', fontFamily: 'inherit' }}>
                    {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                ))}
              </div>
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
];

function NetworkTab({ studentProfile }) {
  const [networkSubTab, setNetworkSubTab] = useState('connections');
  const inviteSlug = studentProfile?.full_name?.split(' ')[0]?.toLowerCase() || 'you';
  const inviteLink = `https://hunt.so/invite/${inviteSlug}`;
  const [linkCopied, setLinkCopied] = useState(false);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'hunt-fade-in 0.3s ease' }}>
      <div style={{ padding: '28px 40px 0', flexShrink: 0 }}>
        <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>Network</p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '26px', fontWeight: 400, color: 'var(--text)', marginBottom: '16px' }}>Connections & Referrals</h1>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[{ id: 'connections', label: 'My Connections' }, { id: 'discover', label: 'Discover' }, { id: 'referrals', label: 'Referrals' }].map(t => (
            <button key={t.id} onClick={() => setNetworkSubTab(t.id)} style={{ padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: networkSubTab === t.id ? 600 : 400, color: networkSubTab === t.id ? 'var(--text)' : 'var(--text-dim)', borderBottom: networkSubTab === t.id ? '2px solid var(--text)' : '2px solid transparent', marginBottom: '-1px' }}>{t.label}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px' }}>
        {networkSubTab === 'connections' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {MOCK_CONNECTIONS.map(c => {
              const initials = c.name.split(' ').map(n => n[0]).join('');
              const statusBadge = { on_hunt: { label: 'On HUNT', bg: 'var(--green-tint)', color: 'var(--green)' }, invited: { label: 'Invited', bg: 'var(--amber-tint)', color: 'var(--amber)' }, not_invited: { label: 'Not yet', bg: 'var(--bg-subtle)', color: 'var(--text-dim)' } };
              const badge = statusBadge[c.status];
              return (
                <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '1px' }}>{c.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{c.college}</p>
                    </div>
                    {badge && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: badge.bg, color: badge.color, fontWeight: 600 }}>{badge.label}</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {c.skills.map(s => <span key={s} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{s}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {networkSubTab === 'referrals' && (
          <div style={{ maxWidth: '600px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px 24px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Your invite link</p>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '14px' }}>Share this link — every friend who joins boosts your priority ranking.</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inviteLink}</div>
                <button onClick={() => { navigator.clipboard?.writeText(inviteLink); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}
                  style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: linkCopied ? 'var(--green-tint)' : 'transparent', color: linkCopied ? 'var(--green)' : 'var(--text-mid)', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {linkCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}
        {networkSubTab === 'discover' && (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <Users size={28} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>Discover coming soon</p>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Connect with students across colleges on HUNT</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROFILE TAB ───────────────────────────────────────────────────────────────
// KEY FIX: Each editable field is its own controlled component that manages its
// own local state. Changes are batched and saved on blur or explicit save click.
// This prevents the parent re-render from resetting input focus.

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

// Stable field input — uses uncontrolled approach to prevent focus loss
const StableInput = memo(({ defaultValue, onCommit, placeholder, type = 'text', style: extraStyle = {} }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && ref.current !== document.activeElement) {
      ref.current.value = defaultValue ?? '';
    }
  }, [defaultValue]);
  return (
    <input
      ref={ref}
      type={type}
      className="hunt-input"
      defaultValue={defaultValue ?? ''}
      placeholder={placeholder}
      onBlur={e => onCommit(e.target.value)}
      style={extraStyle}
    />
  );
});

const StableTextarea = memo(({ defaultValue, onCommit, placeholder, rows = 4, style: extraStyle = {} }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && ref.current !== document.activeElement) {
      ref.current.value = defaultValue ?? '';
    }
  }, [defaultValue]);
  return (
    <textarea
      ref={ref}
      className="hunt-textarea"
      defaultValue={defaultValue ?? ''}
      placeholder={placeholder}
      rows={rows}
      onBlur={e => onCommit(e.target.value)}
      style={extraStyle}
    />
  );
});

// Edit-in-place inline field with pencil icon
function InlineField({ label, value, onSave, placeholder, multiline = false }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value ?? '');
  const ref = useRef(null);

  useEffect(() => { if (!editing) setLocal(value ?? ''); }, [value, editing]);
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (local !== value) onSave(local);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{label}</span>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0', display: 'flex', alignItems: 'center' }}>
            <Pencil size={11} />
          </button>
        )}
        {editing && (
          <button onClick={commit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', padding: '0', display: 'flex', alignItems: 'center' }}>
            <Check size={12} />
          </button>
        )}
      </div>
      {editing ? (
        multiline ? (
          <textarea ref={ref} value={local} onChange={e => setLocal(e.target.value)} onBlur={commit}
            placeholder={placeholder} rows={4} className="hunt-textarea" />
        ) : (
          <input ref={ref} value={local} onChange={e => setLocal(e.target.value)} onBlur={commit}
            placeholder={placeholder} className="hunt-input" />
        )
      ) : (
        <div onClick={() => setEditing(true)} style={{ padding: '8px 10px', borderRadius: '7px', border: '1px dashed var(--border)', cursor: 'text', minHeight: '36px', color: local ? 'var(--text)' : 'var(--text-dim)', fontSize: '13px', lineHeight: 1.5 }}>
          {local || <span style={{ opacity: 0.5 }}>{placeholder}</span>}
        </div>
      )}
    </div>
  );
}

// Toast hook
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  }, []);
  return [toast, show];
}

function ProfileTab({ studentProfile, setStudentProfile, theme, setTheme }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [toast, showToast] = useToast();
  const [saving, setSaving] = useState(false);
  const [skillCat, setSkillCat] = useState(SKILL_CATS_P[0]);
  const [pendingSkill, setPendingSkill] = useState(null);

  // Local copies of array fields — updated directly without re-mounting parent
  const [skills, setSkills] = useState(studentProfile?.skills || []);
  const [projects, setProjects] = useState(studentProfile?.projects || []);
  const [education, setEducation] = useState(studentProfile?.education || []);
  const [certifications, setCertifications] = useState(studentProfile?.certifications || []);
  const [awards, setAwards] = useState(studentProfile?.awards || []);
  const [preferredRoles, setPreferredRoles] = useState(studentProfile?.preferred_roles || []);
  const [otherLinks, setOtherLinks] = useState(studentProfile?.other_links || []);

  // Form states for adding items
  const [addingProject, setAddingProject] = useState(false);
  const [addingEdu, setAddingEdu] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', techStack: '', description: '', projectUrl: '', githubUrl: '' });
  const [newEdu, setNewEdu] = useState({ school: '', degree: '', major: '', startYear: '', endYear: '' });
  const certInputRef = useRef(null);
  const awardInputRef = useRef(null);
  const linkLabelRef = useRef(null);
  const linkUrlRef = useRef(null);

  // Sync if parent reloads
  useEffect(() => {
    setSkills(studentProfile?.skills || []);
    setProjects(studentProfile?.projects || []);
    setEducation(studentProfile?.education || []);
    setCertifications(studentProfile?.certifications || []);
    setAwards(studentProfile?.awards || []);
    setPreferredRoles(studentProfile?.preferred_roles || []);
    setOtherLinks(studentProfile?.other_links || []);
  }, [studentProfile?.id]);

  const saveField = useCallback(async (updates) => {
    setSaving(true);
    try {
      const { updateStudentProfile } = await import('../services/supabase');
      const merged = { ...studentProfile, ...updates };
      // Recalculate completeness
      let sc = 0;
      if (merged.full_name) sc += 10;
      if (merged.college) sc += 10;
      if ((merged.skills || []).length >= 5) sc += 25;
      else if ((merged.skills || []).length >= 1) sc += 10;
      if ((merged.projects || []).length >= 1) sc += 15;
      if (merged.github_url) sc += 5;
      if (merged.linkedin_url) sc += 5;
      if (merged.resume_url) sc += 5;
      if (merged.email) sc += 5;
      if ((merged.preferred_roles || []).length > 0) sc += 10;
      const updated = await updateStudentProfile({ ...updates, profile_completeness: Math.min(sc, 100) });
      setStudentProfile(updated);
      showToast('Saved ✓');
    } catch (e) {
      showToast('Save failed — ' + e.message, 'err');
    } finally {
      setSaving(false);
    }
  }, [studentProfile, setStudentProfile, showToast]);

  // Upload file to Supabase storage
  const uploadFile = useCallback(async (file, bucket, pathPrefix) => {
    try {
      const { supabase } = await import('../services/supabase');
      const ext = file.name.split('.').pop();
      const path = `${pathPrefix}/${studentProfile.auth_id}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      return urlData.publicUrl;
    } catch (e) {
      showToast('Upload failed: ' + e.message, 'err');
      return null;
    }
  }, [studentProfile?.auth_id, showToast]);

  const handleResumeUpload = useCallback(async (file) => {
    if (!file) return;
    showToast('Uploading resume…');
    const url = await uploadFile(file, 'student-files', 'resumes');
    if (url) await saveField({ resume_url: url });
  }, [uploadFile, saveField, showToast]);

  const p = studentProfile;
  const initials = (p?.full_name || '').split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'resume', label: 'Resume' },
    { id: 'skills', label: 'Skills' },
    { id: 'prefs', label: 'Preferences' },
    { id: 'myhunt', label: 'My Hunt' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'huntscore', label: 'Hunt Score' },
  ];

  const Card = ({ children, style: s = {} }) => (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px', marginBottom: 14, ...s }}>
      {children}
    </div>
  );

  const SectionHeader = ({ title }) => (
    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>{title}</p>
  );

  const FieldLabel = ({ children }) => (
    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>{children}</p>
  );

  // Skill level picker levels
  const LEVELS = [
    { v: 1, label: 'Beginner', desc: 'Just started learning' },
    { v: 2, label: 'Elementary', desc: 'Built a few small things' },
    { v: 3, label: 'Intermediate', desc: 'Used in real projects' },
    { v: 4, label: 'Advanced', desc: 'Deep knowledge, prod use' },
    { v: 5, label: 'Expert', desc: 'Mentor others, go-to person' },
  ];

  const confirmAddSkill = useCallback((level) => {
    if (!pendingSkill) return;
    const skillDef = SKILL_OPTIONS_P.find(s => s.name === pendingSkill);
    if (!skillDef) return;
    const newSkills = [...skills, { id: Date.now(), name: pendingSkill, level, category: skillDef.cat }];
    setSkills(newSkills);
    saveField({ skills: newSkills });
    setPendingSkill(null);
  }, [pendingSkill, skills, saveField]);

  const removeSkill = useCallback((idx) => {
    const newSkills = skills.filter((_, i) => i !== idx);
    setSkills(newSkills);
    saveField({ skills: newSkills });
  }, [skills, saveField]);

  const removeProject = useCallback((idx) => {
    const np = projects.filter((_, i) => i !== idx);
    setProjects(np);
    saveField({ projects: np });
  }, [projects, saveField]);

  const removeEdu = useCallback((idx) => {
    const ne = education.filter((_, i) => i !== idx);
    setEducation(ne);
    saveField({ education: ne });
  }, [education, saveField]);

  const removeCert = useCallback((idx) => {
    const nc = certifications.filter((_, i) => i !== idx);
    setCertifications(nc);
    saveField({ certifications: nc });
  }, [certifications, saveField]);

  const removeAward = useCallback((idx) => {
    const na = awards.filter((_, i) => i !== idx);
    setAwards(na);
    saveField({ awards: na });
  }, [awards, saveField]);

  const addCert = useCallback(() => {
    const val = certInputRef.current?.value?.trim();
    if (!val) return;
    const nc = [...certifications, val];
    setCertifications(nc);
    saveField({ certifications: nc });
    if (certInputRef.current) certInputRef.current.value = '';
  }, [certifications, saveField]);

  const addAward = useCallback(() => {
    const val = awardInputRef.current?.value?.trim();
    if (!val) return;
    const na = [...awards, val];
    setAwards(na);
    saveField({ awards: na });
    if (awardInputRef.current) awardInputRef.current.value = '';
  }, [awards, saveField]);

  const addLink = useCallback(() => {
    const label = linkLabelRef.current?.value?.trim();
    const url = linkUrlRef.current?.value?.trim();
    if (!url) return;
    const nl = [...otherLinks, { label: label || url, url }];
    setOtherLinks(nl);
    saveField({ other_links: nl });
    if (linkLabelRef.current) linkLabelRef.current.value = '';
    if (linkUrlRef.current) linkUrlRef.current.value = '';
  }, [otherLinks, saveField]);

  const grouped = SKILL_CATS_P.reduce((acc, cat) => {
    const inCat = skills.filter(s => s.category === cat);
    if (inCat.length > 0) acc[cat] = inCat;
    return acc;
  }, {});

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'hunt-fade-in 0.25s ease' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '7px 16px', borderRadius: 7, fontSize: 12, fontWeight: 500, background: toast.type === 'err' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)', color: '#fff', pointerEvents: 'none', boxShadow: '0 3px 12px rgba(0,0,0,0.15)' }}>{toast.msg}</div>
      )}

      {/* Skill level picker modal */}
      {pendingSkill && (
        <>
          <div onClick={() => setPendingSkill(null)} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 401, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px', width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
            <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 6 }}>{pendingSkill}</p>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 20 }}>How well do you know this?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {LEVELS.map(lv => (
                <button key={lv.v} onClick={() => confirmAddSkill(lv.v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-subtle)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.1s' }}
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

      {/* Header + sub-tabs */}
      <div style={{ flexShrink: 0, padding: '28px 40px 0', background: 'var(--bg)' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 4 }}>Profile</p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 26, fontWeight: 400, color: 'var(--text)', marginBottom: 16 }}>
          {p?.full_name ? <>{p.full_name.split(' ')[0]}<em style={{ fontStyle: 'italic' }}>'s profile.</em></> : <em>Your profile.</em>}
        </h1>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400, color: activeSection === s.id ? 'var(--text)' : 'var(--text-dim)', borderBottom: activeSection === s.id ? '2px solid var(--text)' : '2px solid transparent', marginBottom: '-1px', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'color 0.1s' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px' }}>

        {/* ── OVERVIEW ── */}
        {activeSection === 'overview' && (
          <div style={{ maxWidth: 760 }}>
            {/* Banner + Avatar */}
            <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ height: 140, background: 'linear-gradient(135deg, #1A7A4A 0%, #0D4A2E 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>On a hunt.</p>
              </div>
              <div style={{ padding: '0 28px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ position: 'relative', marginTop: -36 }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-tint)', border: '4px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>
                      {initials}
                    </div>
                  </div>
                </div>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 3 }}>{p?.full_name || '—'}</p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 4 }}>{p?.college}{p?.year ? ` · Year ${p.year}` : ''}</p>
                {p?.headline && <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.5 }}>{p.headline}</p>}
              </div>
            </Card>

            {/* Headline & Bio — inline editable */}
            <Card>
              <SectionHeader title="Headline & Bio" />
              <InlineField label="Headline" value={p?.headline} placeholder="Full Stack Dev · Open to internships"
                onSave={v => saveField({ headline: v })} />
              <InlineField label="Bio" value={p?.bio} placeholder="Tell recruiters about yourself..." multiline
                onSave={v => saveField({ bio: v })} />
            </Card>

            {/* Basic Info */}
            <Card>
              <SectionHeader title="Basic Info" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { f: 'full_name', label: 'Full Name', ph: 'Priya Sharma' },
                  { f: 'college', label: 'College', ph: 'VJTI Mumbai' },
                  { f: 'phone', label: 'Phone', ph: '+91 98765 43210' },
                  { f: 'email', label: 'Email', ph: 'you@email.com' },
                ].map(({ f, label, ph }) => (
                  <div key={f}>
                    <FieldLabel>{label}</FieldLabel>
                    <StableInput
                      defaultValue={p?.[f]}
                      placeholder={ph}
                      onCommit={v => saveField({ [f]: v })}
                    />
                  </div>
                ))}
                <div>
                  <FieldLabel>Year</FieldLabel>
                  <select className="hunt-input" defaultValue={p?.year || 3}
                    onChange={e => saveField({ year: parseInt(e.target.value) })}>
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}{['st', 'nd', 'rd', 'th'][y - 1]} Year</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Work Preference</FieldLabel>
                  <select className="hunt-input" defaultValue={p?.work_preference || 'remote'}
                    onChange={e => saveField({ work_preference: e.target.value })}>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="any">Any</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── RESUME ── */}
        {activeSection === 'resume' && (
          <div style={{ maxWidth: 700 }}>
            {/* Key Links */}
            <Card>
              <SectionHeader title="Key Links" />
              {[
                { key: 'github_url', label: 'GitHub', ph: 'https://github.com/username', bg: '#24292e', icon: '🐙' },
                { key: 'linkedin_url', label: 'LinkedIn', ph: 'https://linkedin.com/in/username', bg: '#0A66C2', icon: '💼' },
                { key: 'portfolio_url', label: 'Portfolio', ph: 'https://yoursite.com', bg: '#5A5A56', icon: '🌐' },
              ].map(({ key, label, ph, bg, icon }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>{icon}</div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', width: 80, flexShrink: 0 }}>{label}</span>
                  <StableInput
                    defaultValue={p?.[key]}
                    placeholder={ph}
                    onCommit={v => saveField({ [key]: v })}
                    style={{ flex: 1, padding: '5px 9px' }}
                  />
                </div>
              ))}
            </Card>

            {/* Resume PDF */}
            <Card>
              <SectionHeader title="Resume PDF" />
              {p?.resume_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 8, border: '1px solid var(--green)', background: 'var(--green-tint)', marginBottom: 12 }}>
                  <FileText size={16} style={{ color: 'var(--green)' }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--green-text)' }}>Resume uploaded</span>
                  <a href={p.resume_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--green-text)', textDecoration: 'none' }}>View ↗</a>
                  <label style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--green)', color: 'var(--green)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Replace
                    <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleResumeUpload(e.target.files[0])} />
                  </label>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '32px', borderRadius: 10, border: '2px dashed var(--border-mid)', cursor: 'pointer', transition: 'all 0.15s', marginBottom: 12 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-tint)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.background = 'transparent'; }}>
                  <Upload size={24} style={{ color: 'var(--text-dim)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>Drop PDF here or <span style={{ color: 'var(--green)' }}>browse files</span></span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>PDF up to 5MB</span>
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleResumeUpload(e.target.files[0])} />
                </label>
              )}
            </Card>

            {/* Summary */}
            <Card>
              <SectionHeader title="Summary" />
              <InlineField label="Professional Summary" value={p?.summary} placeholder="Brief professional summary..." multiline
                onSave={v => saveField({ summary: v })} />
            </Card>

            {/* Education */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <SectionHeader title="Education" />
                <button onClick={() => setAddingEdu(true)} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
              </div>
              {education.map((edu, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>🎓</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{edu.school}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-mid)', marginBottom: 1 }}>{edu.degree}{edu.major ? ` · ${edu.major}` : ''}</p>
                    {/* FIX: Only show end year if it's actually set */}
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      {edu.startYear}{edu.startYear && edu.endYear ? `–${edu.endYear}` : edu.startYear ? ' – Present' : ''}
                    </p>
                  </div>
                  <button onClick={() => removeEdu(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0, fontSize: 18, lineHeight: 1 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                </div>
              ))}
              {addingEdu && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 9, padding: 16, background: 'var(--bg-subtle)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    {[
                      { f: 'school', ph: 'University/College *' },
                      { f: 'degree', ph: 'Bachelor of Science' },
                      { f: 'major', ph: 'Computer Science' },
                      { f: 'startYear', ph: '2021' },
                      { f: 'endYear', ph: '2025 (leave blank if current)' },
                    ].map(({ f, ph }) => (
                      <input key={f} className="hunt-input" value={newEdu[f]} placeholder={ph}
                        onChange={e => setNewEdu(x => ({ ...x, [f]: e.target.value }))} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => {
                      if (!newEdu.school) return;
                      const ne = [...education, { ...newEdu }];
                      setEducation(ne);
                      saveField({ education: ne });
                      setNewEdu({ school: '', degree: '', major: '', startYear: '', endYear: '' });
                      setAddingEdu(false);
                    }} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                    <button onClick={() => setAddingEdu(false)} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Projects */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <SectionHeader title="Projects" />
                <button onClick={() => setAddingProject(true)} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
              </div>
              {projects.map((proj, i) => (
                <div key={i} style={{ padding: '12px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{proj.title || proj.name}</p>
                    <button onClick={() => removeProject(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0, fontSize: 18, lineHeight: 1 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                  </div>
                  {proj.description && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, lineHeight: 1.5 }}>{proj.description}</p>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {(Array.isArray(proj.techStack) ? proj.techStack : []).map((t, j) => (
                      <span key={j} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-mid)' }}>{t}</span>
                    ))}
                  </div>
                  {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--green)', display: 'inline-block', marginTop: 6 }}>View ↗</a>}
                </div>
              ))}
              {addingProject && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 9, padding: 16, background: 'var(--bg-subtle)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <input className="hunt-input" value={newProject.title} placeholder="Project title *" onChange={e => setNewProject(x => ({ ...x, title: e.target.value }))} />
                    <input className="hunt-input" value={newProject.techStack} placeholder="React, Node.js..." onChange={e => setNewProject(x => ({ ...x, techStack: e.target.value }))} />
                  </div>
                  <textarea className="hunt-textarea" rows={2} value={newProject.description} placeholder="Description" onChange={e => setNewProject(x => ({ ...x, description: e.target.value }))} style={{ marginBottom: 10 }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <input className="hunt-input" value={newProject.projectUrl} placeholder="Live URL" onChange={e => setNewProject(x => ({ ...x, projectUrl: e.target.value }))} />
                    <input className="hunt-input" value={newProject.githubUrl} placeholder="GitHub URL" onChange={e => setNewProject(x => ({ ...x, githubUrl: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => {
                      if (!newProject.title) return;
                      const np = [...projects, { ...newProject, techStack: newProject.techStack.split(',').map(t => t.trim()), id: Date.now() }];
                      setProjects(np);
                      saveField({ projects: np });
                      setNewProject({ title: '', techStack: '', description: '', projectUrl: '', githubUrl: '' });
                      setAddingProject(false);
                    }} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add Project</button>
                    <button onClick={() => setAddingProject(false)} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Certifications */}
            <Card>
              <SectionHeader title="Certifications" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
                {certifications.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: 12 }}>
                    🏅 {c}
                    <button onClick={() => removeCert(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0 0 0 4px', lineHeight: 1, fontSize: 14 }}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input ref={certInputRef} className="hunt-input" style={{ flex: 1 }} placeholder="AWS Certified Developer, Google Cloud..."
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCert(); } }} />
                <button onClick={addCert} style={{ padding: '0 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
              </div>
            </Card>

            {/* Awards */}
            <Card>
              <SectionHeader title="Awards & Achievements" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                {awards.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: 12 }}>
                    <span>⭐ {a}</span>
                    <button onClick={() => removeAward(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0, fontSize: 18 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input ref={awardInputRef} className="hunt-input" style={{ flex: 1 }} placeholder="1st place at Flipkart GRiD Hackathon..."
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAward(); } }} />
                <button onClick={addAward} style={{ padding: '0 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
              </div>
            </Card>

            {/* Coding platforms */}
            <Card>
              <SectionHeader title="Competitive & Coding Profiles" />
              {[
                { key: 'leetcode', label: 'LeetCode', bg: '#FFA116', icon: '🧩' },
                { key: 'github_username', label: 'GitHub Username', bg: '#24292e', icon: '🐙' },
                { key: 'codechef', label: 'CodeChef', bg: '#5B4638', icon: '👨‍🍳' },
                { key: 'codeforces', label: 'Codeforces', bg: '#1F8ACB', icon: '⚡' },
                { key: 'kaggle', label: 'Kaggle', bg: '#20BEFF', icon: '📊' },
                { key: 'hackerrank', label: 'HackerRank', bg: '#2EC866', icon: '💻' },
              ].map(({ key, label, bg, icon }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>{icon}</div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', width: 120, flexShrink: 0 }}>{label}</span>
                  <StableInput
                    defaultValue={p?.coding_profiles?.[key]}
                    placeholder="username"
                    onCommit={v => saveField({ coding_profiles: { ...(p?.coding_profiles || {}), [key]: v } })}
                    style={{ flex: 1, padding: '6px 10px' }}
                  />
                </div>
              ))}
            </Card>

            {/* Other Links */}
            <Card>
              <SectionHeader title="Other Links" />
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>Papers, talks, open source, etc.</p>
              {otherLinks.map((link, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>🔗</span>
                  <span style={{ fontSize: 12, color: 'var(--text)', flex: 1 }}>{link.label}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--green)', textDecoration: 'none', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</a>
                  <button onClick={() => { const nl = otherLinks.filter((_, j) => j !== i); setOtherLinks(nl); saveField({ other_links: nl }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0, fontSize: 18 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginBottom: 8 }}>
                <input ref={linkLabelRef} className="hunt-input" placeholder="Label (e.g. Research Paper)" />
                <input ref={linkUrlRef} className="hunt-input" placeholder="https://..." />
              </div>
              <button onClick={addLink} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add Link</button>
            </Card>
          </div>
        )}

        {/* ── SKILLS ── */}
        {activeSection === 'skills' && (
          <div style={{ maxWidth: 760 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 18, fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)', marginBottom: 3 }}>Technical Skills</p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>{skills.length} skill{skills.length !== 1 ? 's' : ''} added</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'start' }}>
              {/* Category nav */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {SKILL_CATS_P.map(cat => {
                  const cnt = skills.filter(s => s.category === cat).length;
                  return (
                    <button key={cat} onClick={() => setSkillCat(cat)} className="hn-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: skillCat === cat ? 'var(--bg-subtle)' : 'transparent', color: skillCat === cat ? 'var(--text)' : 'var(--text-dim)', fontSize: 13, fontWeight: skillCat === cat ? 600 : 400, textAlign: 'left' }}>
                      <span>{cat}</span>
                      {cnt > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', background: 'var(--green-tint)', borderRadius: 20, padding: '1px 7px' }}>{cnt}</span>}
                    </button>
                  );
                })}
              </div>

              <div>
                {/* Picker */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>{skillCat}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SKILL_OPTIONS_P.filter(s => s.cat === skillCat).map(skill => {
                      const added = skills.some(s => s.name === skill.name);
                      return (
                        <button key={skill.name} onClick={() => { if (!added) setPendingSkill(skill.name); }}
                          style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontFamily: 'inherit', cursor: added ? 'default' : 'pointer', transition: 'all 0.12s', border: `1px solid ${added ? 'var(--green)' : 'var(--border)'}`, background: added ? 'var(--green-tint)' : 'var(--bg-subtle)', color: added ? 'var(--green-text)' : 'var(--text-mid)' }}>
                          {added ? '✓ ' : '+ '}{skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Added skills */}
                {skills.length > 0 ? (
                  Object.entries(grouped).map(([cat, catSkills]) => (
                    <div key={cat} style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>{cat}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {catSkills.map((skill, i) => {
                          const globalIdx = skills.findIndex(s => s.name === skill.name && s.id === skill.id);
                          return (
                            <div key={skill.id || skill.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px 6px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 12, color: 'var(--text)' }}
                              title={`${skill.name} · ${LEVEL_LABELS_P[skill.level]}`}>
                              <span style={{ fontWeight: 500 }}>{skill.name}</span>
                              <div style={{ display: 'flex', gap: 2, marginLeft: 2 }}>
                                {[1, 2, 3, 4, 5].map(lv => (
                                  <div key={lv} style={{ width: 4, height: 4, borderRadius: '50%', background: skill.level >= lv ? 'var(--green)' : 'var(--border)' }} />
                                ))}
                              </div>
                              <button onClick={() => removeSkill(globalIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--border-mid)', padding: '0 0 0 2px', lineHeight: 1, fontSize: 13, flexShrink: 0 }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--border-mid)'}>×</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '32px', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 12 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Click a skill above to add it — you'll pick your proficiency level</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PREFERENCES ── */}
        {activeSection === 'prefs' && (
          <div style={{ maxWidth: 700 }}>
            <Card>
              <SectionHeader title="Preferred Roles" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 18 }}>
                {ROLE_OPTIONS_P.map(role => {
                  const sel = preferredRoles.includes(role);
                  return (
                    <button key={role} onClick={() => {
                      const nr = sel ? preferredRoles.filter(r => r !== role) : [...preferredRoles, role];
                      setPreferredRoles(nr);
                      saveField({ preferred_roles: nr });
                    }} style={{ padding: '9px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', border: `1px solid ${sel ? 'var(--green)' : 'var(--border)'}`, background: sel ? 'var(--green-tint)' : 'transparent', color: sel ? 'var(--green-text)' : 'var(--text-mid)', fontWeight: sel ? 500 : 400 }}>{role}</button>
                  );
                })}
              </div>
            </Card>
            <Card>
              <SectionHeader title="Work & Availability" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <FieldLabel>Availability</FieldLabel>
                  <select className="hunt-input" defaultValue={p?.availability || 'Immediate'}
                    onChange={e => saveField({ availability: e.target.value })}>
                    <option>Immediate</option>
                    <option>After exams</option>
                    <option>Next semester</option>
                    <option>Not available</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Work Preference</FieldLabel>
                  <select className="hunt-input" defaultValue={p?.work_preference || 'remote'}
                    onChange={e => saveField({ work_preference: e.target.value })}>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="any">Any</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <FieldLabel>Min Stipend (₹/month)</FieldLabel>
                <StableInput
                  defaultValue={p?.min_stipend}
                  placeholder="e.g. 10000"
                  type="number"
                  onCommit={v => saveField({ min_stipend: v })}
                  style={{ maxWidth: 200 }}
                />
              </div>
            </Card>
          </div>
        )}

        {/* ── MY HUNT (now public) ── */}
        {activeSection === 'myhunt' && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ marginBottom: 48 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 10 }}>Public · Visible to recruiters</p>
              <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 38, fontWeight: 400, color: 'var(--text)', lineHeight: 1.15, marginBottom: 12 }}>
                What are you<br /><em>really</em> hunting for?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7, maxWidth: 480 }}>
                Not your resume. Not the job title. Your drives, your beliefs, your <em>why</em>. Recruiters see this — make it count.
              </p>
            </div>

            {[
              { id: 'my_hunt', n: '01', title: 'The Hunt', sub: 'Not the job title. What are you actually after?', ph: "I'm hunting for the place where craft meets impact..." },
              { id: 'philosophy', n: '02', title: 'Philosophy', sub: 'How you see the world.', ph: 'I believe the best products start with genuine frustration...' },
              { id: 'inspirations', n: '03', title: 'What moves you', sub: 'Books, people, ideas that rewired how you think.', ph: "Paul Graham's essays, The Mom Test, Feynman..." },
              { id: 'life_outside', n: '04', title: 'Life outside work', sub: 'Who are you when the laptop is closed?', ph: 'Cricket every Sunday, Carnatic music, cooking...' },
            ].map(({ id, n, title, sub, ph }) => (
              <div key={id} style={{ marginBottom: 48 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.1em', fontFamily: "'Editorial New', Georgia, serif" }}>{n}</span>
                  <div>
                    <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 3 }}>{title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{sub}</p>
                  </div>
                </div>
                <InlineField label={title} value={p?.[id]} placeholder={ph} multiline
                  onSave={v => saveField({ [id]: v })} />
                <div style={{ height: 1, background: 'var(--border)', marginTop: 32 }} />
              </div>
            ))}

            {/* Quote */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', fontFamily: "'Editorial New', Georgia, serif" }}>"</span>
                <div>
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 3 }}>A line you live by</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Something that keeps pulling you forward.</p>
                </div>
              </div>
              {p?.quote && (
                <div style={{ borderLeft: '2px solid var(--green)', paddingLeft: 20, marginBottom: 16 }}>
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 22, color: 'var(--text)', lineHeight: 1.5, fontStyle: 'italic', marginBottom: 8 }}>"{p.quote}"</p>
                  {p.quote_author && <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{p.quote_author}</p>}
                </div>
              )}
              <InlineField label="Quote" value={p?.quote} placeholder="The people who are crazy enough to think they can change the world…"
                onSave={v => saveField({ quote: v })} />
              <InlineField label="Author" value={p?.quote_author} placeholder="— Steve Jobs"
                onSave={v => saveField({ quote_author: v })} />
            </div>
          </div>
        )}

        {/* ── REVIEWS & RATINGS ── */}
        {activeSection === 'reviews' && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>Reviews & Ratings</p>
              <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>What recruiters say.</h1>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 480 }}>
                After an internship closes, recruiters can rate and review your performance. These ratings are visible to future recruiters and boost your HUNT Score.
              </p>
            </div>

            {/* How it works */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>How reviews work</p>
              {[
                { step: '01', text: 'You complete an internship placed through HUNT' },
                { step: '02', text: 'Recruiter gets an invite to review your performance' },
                { step: '03', text: 'They rate you on skills, work ethic, communication' },
                { step: '04', text: 'Verified reviews appear here and boost your profile' },
              ].map(({ step, text }) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', width: 20, flexShrink: 0 }}>{step}</span>
                  <p style={{ fontSize: 12, color: 'var(--text-mid)' }}>{text}</p>
                </div>
              ))}
            </div>

            {/* Mock review card with stars */}
            <div style={{ padding: '40px 32px', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 14, background: 'var(--bg-card)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    ⭐
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>No reviews yet.</p>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>
                Complete an internship through HUNT and your recruiter will be invited to leave a review. Those reviews build your reputation here.
              </p>
            </div>

            {/* Rating categories preview */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 14 }}>Categories recruiters rate you on</p>
              {[
                { label: 'Technical Skills', desc: 'Quality of code, problem-solving ability' },
                { label: 'Work Ethic', desc: 'Reliability, punctuality, initiative' },
                { label: 'Communication', desc: 'Clarity, responsiveness, teamwork' },
                { label: 'Culture Fit', desc: 'Alignment with team values and environment' },
                { label: 'Would Hire Again', desc: 'Overall recommendation' },
              ].map(({ label, desc }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{desc}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <div key={s} style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--border)' }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HUNT SCORE ── */}
        {activeSection === 'huntscore' && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>Hunt Score</p>
              <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>Your signal, scored.</h1>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 480 }}>
                Your HUNT Score is a dynamic credibility score built from verified skills, project proof, recruiter feedback, and consistency.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 28 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-subtle)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 26, color: 'var(--text-dim)', fontWeight: 400 }}>{p?.profile_completeness || '—'}</p>
              </div>
              <div>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>Profile {p?.profile_completeness || 0}% complete</p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>Complete your profile, add verified projects, and get your first recruiter rating to unlock your full score.</p>
              </div>
            </div>
            {[
              { label: 'Profile completeness', done: (p?.profile_completeness || 0) >= 80 },
              { label: 'Skills added', done: (p?.skills || []).length >= 5 },
              { label: 'Projects added', done: (p?.projects || []).length >= 1 },
              { label: 'GitHub linked', done: !!p?.github_url },
              { label: 'Resume uploaded', done: !!p?.resume_url },
              { label: 'First recruiter rating', done: false },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-card)', marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${item.done ? 'var(--green)' : 'var(--border)'}`, background: item.done ? 'var(--green-tint)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.done && <span style={{ fontSize: 10, color: 'var(--green)' }}>✓</span>}
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: item.done ? 'var(--text)' : 'var(--text-mid)', flex: 1 }}>{item.label}</p>
                <span style={{ fontSize: 11, color: item.done ? 'var(--green)' : 'var(--text-dim)', fontWeight: item.done ? 600 : 400 }}>{item.done ? 'Done' : 'Pending'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
