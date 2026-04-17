// src/components/SwipeFeed.jsx
// ─── HUNT Candidate Dashboard ─────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, X, TrendingUp, Target, Briefcase, MapPin, Clock,
  AlertCircle, CheckCircle2, ChevronRight, Zap, Award, LogOut,
  Sun, Moon, Search, Home, Users, User, Bell, BookOpen,
  Compass, ChevronDown, ArrowRight, Sparkles, BellRing, LayoutGrid
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
    '--sidebar-w':  '220px',
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
    '--sidebar-w':  '220px',
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
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes hunt-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.96); }
        }
        @keyframes hunt-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ textAlign: 'center', animation: 'hunt-fade-in 0.5s ease' }}>
        <div style={{
          fontSize: '28px', fontWeight: 700, letterSpacing: '0.18em',
          color: 'var(--text)', marginBottom: '24px',
          animation: 'hunt-pulse 1.8s ease-in-out infinite',
        }}>HUNT</div>
        <div style={{
          display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '20px',
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--green)',
              opacity: dots > i ? 1 : 0.2,
              transition: 'opacity 0.3s ease',
            }} />
          ))}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
          Finding your opportunities…
        </p>
      </div>
    </div>
  );
}

// ─── Welcome card ──────────────────────────────────────────────────────────────
function WelcomeCard({ name, completeness, onDismiss }) {
  const firstName = name?.split(' ')[0] || 'there';
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '28px 32px', marginBottom: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle bg accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '220px', height: '100%',
        background: 'linear-gradient(135deg, transparent 60%, var(--green-tint) 100%)',
        pointerEvents: 'none',
      }} />
      <button onClick={onDismiss} style={{
        position: 'absolute', top: '16px', right: '16px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-dim)', padding: '4px',
      }}>
        <X size={16} />
      </button>
      <div style={{ position: 'relative' }}>
        <p style={{
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--green)', marginBottom: '8px',
        }}>Welcome to HUNT</p>
        <h2 style={{
          fontFamily: "'Editorial New', Georgia, serif",
          fontSize: '26px', fontWeight: 400, color: 'var(--text)',
          marginBottom: '10px', lineHeight: 1.2,
        }}>
          Hey {firstName}, let's find your<br /><em>first internship.</em>
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-mid)', maxWidth: '420px', lineHeight: 1.6, marginBottom: '20px' }}>
          You're in the right place. HUNT matches you on skills — not your college name.
          Fewer applications, stronger shots.
        </p>
        {/* Profile completeness mini-bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            flex: 1, maxWidth: '200px', height: '4px',
            background: 'var(--border)', borderRadius: '999px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${completeness}%`,
              background: completeness >= 80 ? 'var(--green)' : 'var(--amber)',
              borderRadius: '999px', transition: 'width 0.6s ease',
            }} />
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-mid)' }}>
            Profile {completeness}% complete
            {completeness < 80 && <span style={{ color: 'var(--amber)', marginLeft: '6px' }}>— finish it for better matches</span>}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Quick guide card ──────────────────────────────────────────────────────────
function QuickGuideCard({ onDismiss }) {
  const steps = [
    { num: '01', title: 'Build your profile', desc: 'Skills + projects = your signal. No college bias here.' },
    { num: '02', title: 'Explore matches', desc: 'See roles matched to you. Only 5 applies per week — make them count.' },
    { num: '03', title: 'Apply with intent', desc: 'See your match breakdown before you apply. Know your chances.' },
    { num: '04', title: 'Get shortlisted', desc: 'Recruiters see only top 20 candidates. Be one of them.' },
  ];
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '24px 28px', marginBottom: '24px',
      position: 'relative',
    }}>
      <button onClick={onDismiss} style={{
        position: 'absolute', top: '16px', right: '16px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-dim)', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px',
        fontSize: '12px',
      }}>
        <span style={{ color: 'var(--text-dim)' }}>Skip guide</span>
        <X size={14} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <BookOpen size={15} style={{ color: 'var(--green)' }} />
        <p style={{
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--text)',
        }}>How HUNT works</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {steps.map(s => (
          <div key={s.num} style={{
            padding: '14px 16px', borderRadius: '10px',
            background: 'var(--bg-subtle)', border: '1px solid var(--border)',
          }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
              color: 'var(--green)', display: 'block', marginBottom: '4px',
            }}>{s.num}</span>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{s.title}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty explore state ───────────────────────────────────────────────────────
function EmptyExplore({ onNotify, notified }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '64px 32px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎯</div>
      <h3 style={{
        fontFamily: "'Editorial New', Georgia, serif",
        fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginBottom: '8px',
      }}>No matching opportunities right now</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', maxWidth: '340px', margin: '0 auto 24px', lineHeight: 1.6 }}>
        We're onboarding new companies. Complete your profile and we'll notify you
        the moment a role matches your skills.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {!notified ? (
          <button onClick={onNotify} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: 'var(--green)', color: '#fff', fontSize: '13px', fontWeight: 500,
          }}>
            <BellRing size={14} /> Notify me when available
          </button>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '8px',
            background: 'var(--green-tint)', border: '1px solid var(--green)',
            color: 'var(--green)', fontSize: '13px',
          }}>
            <CheckCircle2 size={14} /> You'll be notified — we're on it.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Job card ──────────────────────────────────────────────────────────────────
function JobCard({ job, matchData, isDragging, dragOffset, swipeDirection, onMouseDown, onMouseMove, onMouseUp }) {
  const scoreColor = s => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)';
  const scoreBg    = s => s >= 75 ? 'var(--green-tint)' : s >= 50 ? 'var(--amber-tint)' : 'var(--red-tint)';
  const compColor  = c => c === 'High' ? 'var(--red)' : c === 'Medium' ? 'var(--amber)' : 'var(--green)';
  const compBg     = c => c === 'High' ? 'var(--red-tint)' : c === 'Medium' ? 'var(--amber-tint)' : 'var(--green-tint)';

  return (
    <div
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transform: isDragging
          ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${dragOffset.x * 0.04}deg)`
          : swipeDirection === 'right' ? 'translateX(220px) rotate(8deg)'
          : swipeDirection === 'left'  ? 'translateX(-220px) rotate(-8deg)'
          : 'none',
        opacity: swipeDirection ? 0 : 1,
        transition: swipeDirection ? 'transform 0.28s ease, opacity 0.28s ease' : 'none',
      }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove}
      onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
    >
      {/* Header */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-subtle)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <span style={{ fontSize: '36px', lineHeight: 1 }}>{job.logo}</span>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>
              {job.company}
            </p>
            <h2 style={{
              fontFamily: "'Editorial New', Georgia, serif",
              fontSize: '18px', fontWeight: 400, color: 'var(--text)', marginBottom: '8px', lineHeight: 1.2,
            }}>{job.role}</h2>
            <span style={{
              fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
              border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'var(--bg-card)',
            }}>{job.type}</span>
          </div>
        </div>
        {matchData && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              fontSize: '22px', fontFamily: "'Editorial New', Georgia, serif", fontWeight: 400,
              padding: '6px 12px', borderRadius: '8px',
              color: scoreColor(matchData.score), background: scoreBg(matchData.score),
            }}>{matchData.score}%</div>
            <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>match</p>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {[
            { Icon: Briefcase, val: job.stipend },
            { Icon: Clock,     val: job.duration },
            { Icon: MapPin,    val: job.location },
            { Icon: Target,    val: `${job.current_applicants}/${job.max_applicants} applied` },
          ].map(({ Icon, val }) => (
            <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon size={13} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'var(--text-mid)' }}>{val}</span>
            </div>
          ))}
        </div>

        {matchData && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 12px', borderRadius: '8px', marginBottom: '14px', fontSize: '12px', fontWeight: 500,
            background: compBg(matchData.competitionLevel), color: compColor(matchData.competitionLevel),
          }}>
            <TrendingUp size={13} /> {matchData.competitionLevel} competition
          </div>
        )}

        <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '16px' }}>
          {job.description}
        </p>

        <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>
          Required skills
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {job.required_skills?.map((skill, idx) => {
            const matched = matchData?.matchedSkills.find(s => s.name === skill.name);
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {matched
                    ? <CheckCircle2 size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                    : <X size={14} style={{ color: 'var(--red)', flexShrink: 0 }} />}
                  <span style={{ fontSize: '13px', color: matched ? 'var(--text)' : 'var(--text-dim)' }}>{skill.name}</span>
                </div>
                {matched && <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>L{matched.studentLevel}/{skill.level}</span>}
              </div>
            );
          })}
        </div>

        {job.nice_to_have?.length > 0 && (
          <div style={{ marginTop: '14px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Nice to have
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {job.nice_to_have.map((s, i) => (
                <span key={i} style={{
                  padding: '3px 8px', fontSize: '11px', borderRadius: '4px',
                  border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'var(--bg-subtle)',
                }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function SwipeFeed() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showMatchBreakdown, setShowMatchBreakdown] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [skippedJobs, setSkippedJobs] = useState([]);
  const [matchData, setMatchData] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [weeklyApplications, setWeeklyApplications] = useState(0);
  const [applying, setApplying] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showGuide, setShowGuide] = useState(true);
  const [notified, setNotified] = useState(false);

  const WEEKLY_LIMIT = 5;
  const currentJob = jobs[currentIndex];
  const remainingApplications = WEEKLY_LIMIT - weeklyApplications;
  const canApply = remainingApplications > 0;
  const initials = studentProfile?.full_name?.split(' ').map(n => n[0]).join('') || 'U';

  useEffect(() => {
    applyTokens(theme);
    localStorage.setItem('hunt-theme', theme);
  }, [theme]);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (currentJob && studentProfile) setMatchData(calculateMatchScore(studentProfile, currentJob));
  }, [currentIndex, studentProfile, currentJob]);

  const loadData = async () => {
    try {
      setLoading(true);
      const profile = await getStudentProfile();
      if (!profile) { navigate('/onboarding'); return; }
      setStudentProfile(profile);
      // Check if first visit
      const welcomed = localStorage.getItem(`hunt-welcomed-${profile.id}`);
      if (welcomed) { setShowWelcome(false); setShowGuide(false); }
      const activeJobs = await getActiveJobs();
      const jobsWithScores = activeJobs.map(job => ({ ...job, matchScore: calculateMatchScore(profile, job) }));
      const relevantJobs = jobsWithScores
        .filter(job => job.matchScore.score >= 50 && job.current_applicants < job.max_applicants)
        .sort((a, b) => b.matchScore.score - a.matchScore.score);
      setJobs(relevantJobs);
      setWeeklyApplications(await getWeeklyApplicationCount());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
    if (studentProfile?.id) localStorage.setItem(`hunt-welcomed-${studentProfile.id}`, '1');
  };

  const handleSwipe = (direction) => {
    if (applying) return;
    setSwipeDirection(direction);
    setTimeout(() => {
      if (direction === 'right') {
        if (weeklyApplications >= WEEKLY_LIMIT) { alert('Weekly limit reached! Come back next week.'); setSwipeDirection(null); return; }
        setShowMatchBreakdown(true);
      } else {
        setSkippedJobs(p => [...p, currentJob.id]);
        moveToNext();
      }
      setSwipeDirection(null);
    }, 280);
  };

  const moveToNext = () => {
    setShowMatchBreakdown(false);
    if (currentIndex < jobs.length - 1) setCurrentIndex(i => i + 1);
  };

  const handleApply = async () => {
    if (applying || weeklyApplications >= WEEKLY_LIMIT) return;
    setApplying(true);
    try {
      await createApplication(currentJob.id, matchData.score, matchData.breakdown);
      const airtableData = prepareApplicationData(studentProfile, currentJob, matchData.score, matchData.breakdown);
      await sendToAirtable(airtableData);
      setAppliedJobs(p => [...p, { ...currentJob, matchScore: matchData.score }]);
      setWeeklyApplications(c => c + 1);
      moveToNext();
    } catch (error) {
      alert('Failed to submit: ' + error.message);
    } finally {
      setApplying(false);
    }
  };

  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); } catch (e) { console.error(e); }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseMove = (e) => { if (isDragging) setDragOffset({ x: e.movementX * 2, y: e.movementY * 0.5 }); };
  const handleMouseUp = () => {
    if (Math.abs(dragOffset.x) > 100) handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
    setIsDragging(false); setDragOffset({ x: 0, y: 0 });
  };

  if (loading) return <LoadingScreen />;

  // ── NAV ITEMS ─────────────────────────────────────────────────────────────
  const navItems = [
    { id: 'explore', label: 'Explore',      icon: Compass },
    { id: 'home',    label: 'Home',          icon: Home },
    { id: 'network', label: 'Connections',   icon: Users },
    { id: 'profile', label: 'Profile',       icon: User },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg)', color: 'var(--text)',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes hunt-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hunt-nav-item { transition: background 0.15s, color 0.15s; }
        .hunt-nav-item:hover { background: var(--bg-subtle) !important; }
      `}</style>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <aside style={{
        width: '220px', flexShrink: 0, height: '100vh',
        position: 'sticky', top: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-card)',
        display: 'flex', flexDirection: 'column',
        padding: '0',
      }}>
        {/* Logo */}
        <div style={{
          padding: '22px 20px 18px',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{
            fontSize: '16px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--text)',
          }}>HUNT</span>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                className="hunt-nav-item"
                onClick={() => {
                  if (id === 'profile') { navigate('/profile'); return; }
                  setActiveTab(id);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: 'none', cursor: 'pointer', marginBottom: '2px',
                  background: active ? 'var(--bg-subtle)' : 'transparent',
                  color: active ? 'var(--text)' : 'var(--text-dim)',
                  fontSize: '13px', fontWeight: active ? 600 : 400,
                  textAlign: 'left',
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {label}
                {id === 'explore' && jobs.length > 0 && (
                  <span style={{
                    marginLeft: 'auto', fontSize: '10px', fontWeight: 600,
                    background: 'var(--green)', color: '#fff',
                    borderRadius: '10px', padding: '1px 6px', minWidth: '18px', textAlign: 'center',
                  }}>{jobs.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          {/* Weekly limit mini */}
          <div style={{
            padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-subtle)',
            marginBottom: '10px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Applies left</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--green)' }}>{remainingApplications}/5</span>
            </div>
            <div style={{ height: '3px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '999px', background: 'var(--green)',
                width: `${(remainingApplications / 5) * 100}%`, transition: 'width 0.4s ease',
              }} />
            </div>
          </div>

          {/* Notification + theme + sign out row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 2px' }}>
            <button onClick={() => {}} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 10px', borderRadius: '8px', color: 'var(--text-dim)',
            }}>
              <Bell size={14} />
            </button>
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px', borderRadius: '8px', color: 'var(--text-dim)',
            }}>
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <button onClick={handleSignOut} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px', borderRadius: '8px', color: 'var(--text-dim)',
            }} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>

          {/* User pill */}
          <div onClick={() => navigate('/profile')} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
            marginTop: '6px',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--green-tint)', border: '1px solid var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: 'var(--green)',
            }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {studentProfile?.full_name}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Student</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '32px 40px' }}>

        {/* ── HOME TAB ── */}
        {activeTab === 'home' && (
          <div style={{ maxWidth: '680px', animation: 'hunt-fade-in 0.35s ease' }}>
            {showWelcome && (
              <WelcomeCard
                name={studentProfile?.full_name}
                completeness={studentProfile?.profile_completeness || 0}
                onDismiss={dismissWelcome}
              />
            )}
            {showGuide && (
              <QuickGuideCard onDismiss={() => setShowGuide(false)} />
            )}
            {!showWelcome && !showGuide && (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '40px 32px', textAlign: 'center',
              }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>🏠</p>
                <h3 style={{
                  fontFamily: "'Editorial New', Georgia, serif",
                  fontSize: '20px', color: 'var(--text)', marginBottom: '6px',
                }}>Home feed</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                  Activity, updates and insights will appear here soon.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── EXPLORE TAB ── */}
        {activeTab === 'explore' && (
          <div style={{ animation: 'hunt-fade-in 0.35s ease' }}>

            {/* Page header */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    Explore
                  </p>
                  <h1 style={{
                    fontFamily: "'Editorial New', Georgia, serif",
                    fontSize: '28px', fontWeight: 400, color: 'var(--text)', lineHeight: 1.1,
                  }}>Your opportunities</h1>
                </div>
                {jobs.length > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '999px',
                    background: 'var(--green-tint)', border: '1px solid var(--green)',
                    fontSize: '12px', color: 'var(--green)', fontWeight: 500,
                  }}>
                    <Zap size={12} /> {remainingApplications}/5 applies left this week
                  </div>
                )}
              </div>
            </div>

            {jobs.length === 0 ? (
              <EmptyExplore notified={notified} onNotify={() => setNotified(true)} />
            ) : currentIndex >= jobs.length ? (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '64px 32px', textAlign: 'center',
              }}>
                <p style={{ fontSize: '36px', marginBottom: '12px' }}>🎯</p>
                <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '22px', color: 'var(--text)', marginBottom: '8px' }}>
                  You're all caught up.
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
                  You've reviewed all current matches. New roles are added regularly.
                </p>
                <button onClick={() => setCurrentIndex(0)} style={{
                  padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-mid)', fontSize: '13px', cursor: 'pointer',
                }}>Review again</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

                {/* Job card + swipe buttons */}
                <div>
                  <JobCard
                    job={currentJob}
                    matchData={matchData}
                    isDragging={isDragging}
                    dragOffset={dragOffset}
                    swipeDirection={swipeDirection}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  />
                  {/* Swipe buttons */}
                  <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px' }}>
                    <button
                      onClick={() => handleSwipe('left')} disabled={applying}
                      style={{
                        width: '52px', height: '52px', borderRadius: '50%', border: '1px solid var(--border)',
                        background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', opacity: applying ? 0.4 : 1,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.background = 'var(--red-tint)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                    >
                      <X size={20} style={{ color: 'var(--red)' }} />
                    </button>
                    <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                      swipe or click
                    </span>
                    <button
                      onClick={() => handleSwipe('right')} disabled={!canApply || applying}
                      style={{
                        width: '52px', height: '52px', borderRadius: '50%', border: '1px solid var(--border)',
                        background: 'var(--bg-card)', cursor: canApply ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', opacity: (!canApply || applying) ? 0.3 : 1,
                      }}
                      onMouseEnter={e => { if (canApply && !applying) { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-tint)'; }}}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                    >
                      <Heart size={20} style={{ color: 'var(--green)' }} />
                    </button>
                  </div>

                  {/* Counter */}
                  <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--text-dim)' }}>
                    {currentIndex + 1} of {jobs.length}
                  </p>
                </div>

                {/* Right: match breakdown or applied */}
                <div>
                  {showMatchBreakdown ? (
                    <div style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: '16px', padding: '24px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>Match breakdown</p>
                          <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '28px', color: 'var(--text)' }}>
                            {matchData?.score}%
                          </h3>
                          <p style={{ fontSize: '12px', color: 'var(--text-mid)', marginTop: '2px' }}>How your profile aligns</p>
                        </div>
                        <span style={{ fontSize: '28px' }}>{currentJob.logo}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                        {Object.entries(matchData?.breakdown || {}).map(([key, val]) => (
                          <div key={key}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-mid)', textTransform: 'capitalize' }}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>{val}%</span>
                            </div>
                            <div style={{ height: '3px', background: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${val}%`, background: 'var(--green)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {matchData?.missingSkills.length > 0 && (
                        <div style={{
                          padding: '12px 14px', borderRadius: '8px', marginBottom: '16px',
                          background: 'var(--red-tint)', border: '1px solid var(--red)',
                        }}>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--red)', marginBottom: '8px' }}>Skills gap</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {matchData.missingSkills.map((s, i) => (
                              <span key={i} style={{
                                padding: '2px 8px', fontSize: '11px', borderRadius: '4px',
                                border: '1px solid var(--red)', color: 'var(--red)',
                              }}>{s.name} (L{s.level})</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button onClick={handleApply} disabled={!canApply || applying} style={{
                          padding: '12px', borderRadius: '8px', border: 'none', cursor: canApply ? 'pointer' : 'not-allowed',
                          background: 'var(--green)', color: '#fff', fontSize: '13px', fontWeight: 600,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          opacity: (!canApply || applying) ? 0.4 : 1, transition: 'opacity 0.15s',
                        }}>
                          {applying ? 'Submitting…' : !canApply ? 'Weekly limit reached' : <><span>Apply now</span><ChevronRight size={14} /></>}
                        </button>
                        <button onClick={moveToNext} disabled={applying} style={{
                          padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                          background: 'transparent', color: 'var(--text-mid)', fontSize: '13px', cursor: 'pointer',
                          opacity: applying ? 0.4 : 1,
                        }}>Skip for now</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: '16px', padding: '24px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <Award size={14} style={{ color: 'var(--amber)' }} />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>Applied this week</span>
                      </div>

                      {appliedJobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                          <p style={{ fontSize: '28px', marginBottom: '10px' }}>🎯</p>
                          <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>
                            No applications yet
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                            Swipe right on roles that interest you
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {appliedJobs.map((job, i) => (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 14px', borderRadius: '8px',
                              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '18px' }}>{job.logo}</span>
                                <div>
                                  <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>{job.role}</p>
                                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{job.company}</p>
                                </div>
                              </div>
                              <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--green)' }}>
                                {job.matchScore}%
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Applications remaining</span>
                          <span style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '15px', color: 'var(--text)' }}>
                            {remainingApplications}/5
                          </span>
                        </div>
                        <div style={{ height: '3px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(remainingApplications / 5) * 100}%`, background: 'var(--green)', borderRadius: '999px', transition: 'width 0.4s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ── NETWORK TAB ── */}
        {activeTab === 'network' && (
          <div style={{ maxWidth: '580px', animation: 'hunt-fade-in 0.35s ease' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>Connections & Referrals</p>
              <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '28px', fontWeight: 400, color: 'var(--text)' }}>Your network</h1>
            </div>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '40px 32px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>🤝</p>
              <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '20px', color: 'var(--text)', marginBottom: '6px' }}>Coming soon</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', maxWidth: '320px', margin: '0 auto' }}>
                Referrals, peer connections, and alumni networks — launching soon.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
