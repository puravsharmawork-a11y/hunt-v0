// src/components/ApplyPage.jsx
//
// SETUP:
// 1. Drop into src/components/ApplyPage.jsx
// 2. In App.jsx add import:
//      import ApplyPage from './components/ApplyPage';
// 3. In App.jsx inside <Routes> — this route is PUBLIC (no auth guard):
//      <Route path="/apply/:slug" element={<ApplyPage />} />
//
// HOW IT WORKS:
// - Anyone with the link lands here
// - If not logged in → shows job + lightweight Google sign-in prompt
// - If logged in but no student profile → redirects to /onboarding after sign-in
// - If logged in with profile → shows job + one-click apply
// - After applying → success screen with confetti

import React, { useState, useEffect } from 'react';
import {
  Briefcase, MapPin, Clock, Target, CheckCircle2,
  X, TrendingUp, ChevronRight, Zap, ArrowLeft, Loader
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, getStudentProfile, createApplication } from '../services/supabase';
import { calculateMatchScore } from '../services/matching';

// ─── Design tokens ─────────────────────────────────────────────────────────
const tokens = {
  light: {
    '--bg':           '#FAFAF8', '--bg-card':    '#FFFFFF',
    '--bg-subtle':    '#F5F5F2', '--border':     '#EBEBEA',
    '--border-mid':   '#D6D6D3', '--text':       '#0A0A0A',
    '--text-mid':     '#5A5A56', '--text-dim':   '#9B9B97',
    '--ember':        '#D85A30', '--ember-tint': 'rgba(216,90,48,0.08)',
    '--ember-border': 'rgba(216,90,48,0.3)',
    '--green':        '#1A7A4A', '--green-tint': '#E8F5EE',
    '--green-text':   '#1A7A4A', '--red':        '#C0392B',
    '--red-tint':     '#FDECEA', '--amber':      '#92600A',
    '--amber-tint':   '#FDF3E3',
  },
  dark: {
    '--bg':           '#0C0B09', '--bg-card':    '#131210',
    '--bg-subtle':    '#1A1916', '--border':     'rgba(255,255,255,0.08)',
    '--border-mid':   'rgba(255,255,255,0.14)', '--text': '#FAFAF8',
    '--text-mid':     'rgba(255,255,255,0.55)', '--text-dim': 'rgba(255,255,255,0.28)',
    '--ember':        '#E8714A', '--ember-tint': 'rgba(216,90,48,0.12)',
    '--ember-border': 'rgba(216,90,48,0.35)',
    '--green':        '#2EAD6A', '--green-tint': '#0D2B1A',
    '--green-text':   '#2EAD6A', '--red':        '#E05C4B',
    '--red-tint':     '#2B1210', '--amber':      '#D4A84B',
    '--amber-tint':   '#2B2010',
  }
};

function applyTokens(theme) {
  Object.entries(tokens[theme]).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v)
  );
}

// ─── Google icon ──────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="currentColor" opacity=".9"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="currentColor" opacity=".9"/>
    <path d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706 0-.59.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9c0 1.45.348 2.826.957 4.038l3.007-2.332z" fill="currentColor" opacity=".9"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z" fill="currentColor" opacity=".9"/>
  </svg>
);

// ─── Confetti ─────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    color: ['#D85A30','#1A7A4A','#2563EB','#F59E0B','#EC4899','#8B5CF6'][i % 6],
    left: `${(i * 37) % 100}%`,
    delay: `${(i * 0.08).toFixed(2)}s`,
    size: 6 + (i % 4) * 2,
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: '-10px', left: p.left,
          width: p.size, height: p.size, borderRadius: '2px',
          background: p.color, animation: `confettiFall 2.4s ${p.delay} ease-in forwards`,
          transform: `rotate(${p.id * 13}deg)`,
        }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function ApplyPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [theme] = useState(() => localStorage.getItem('hunt-theme') || 'light');

  // Page states
  const [loading, setLoading]         = useState(true);
  const [job, setJob]                 = useState(null);
  const [notFound, setNotFound]       = useState(false);
  const [user, setUser]               = useState(null);
  const [studentProfile, setProfile]  = useState(null);
  const [matchData, setMatchData]     = useState(null);
  const [applying, setApplying]       = useState(false);
  const [applied, setApplied]         = useState(false);
  const [alreadyApplied, setAlready]  = useState(false);
  const [signingIn, setSigningIn]     = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => { applyTokens(theme); }, [theme]);

  // Load job + check auth on mount
  useEffect(() => {
    (async () => {
      try {
        // 1. Load job by slug
        const { data: jobData, error: jobErr } = await supabase
          .from('jobs')
          .select('*')
          .eq('share_slug', slug)
          .eq('is_active', true)
          .single();

        if (jobErr || !jobData) { setNotFound(true); setLoading(false); return; }
        setJob(jobData);

        // 2. Check if user is logged in
        try {
          const u = await getCurrentUser();
          setUser(u);

          // 3. Load student profile
          const profile = await getStudentProfile();
          setProfile(profile);

          if (profile) {
            // 4. Calculate match score
            const match = calculateMatchScore(profile, jobData);
            setMatchData(match);

            // 5. Check if already applied
            const { data: existing } = await supabase
              .from('applications')
              .select('id')
              .eq('job_id', jobData.id)
              .eq('student_id', profile.id)
              .single();

            if (existing) setAlready(true);
          }
        } catch {
          // Not logged in — that's fine, show the job + sign-in prompt
        }
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      // Store slug so we can redirect back after auth
      sessionStorage.setItem('apply_after_login', slug);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/apply/${slug}` }
      });
    } catch (e) {
      setError('Sign in failed. Please try again.');
      setSigningIn(false);
    }
  };

  const handleApply = async () => {
    if (!studentProfile) {
      sessionStorage.setItem('apply_after_login', slug);
      navigate(`/onboarding`);
      return;
    }
    if (applying || alreadyApplied || applied) return;

    setApplying(true); setError('');
    try {
      // Check weekly limit
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const { data: weekApps } = await supabase
        .from('applications')
        .select('id', { count: 'exact' })
        .eq('student_id', studentProfile.id)
        .gte('applied_at', oneWeekAgo.toISOString());

      if ((weekApps?.length || 0) >= 5) {
        setError('You\'ve reached your 5 application limit this week. Come back next week!');
        setApplying(false); return;
      }

      await createApplication(job.id, matchData?.score || 0, matchData?.breakdown || {});
      setApplied(true);
    } catch (e) {
      if (e.message?.includes('already applied')) {
        setAlready(true);
      } else {
        setError('Failed to apply: ' + e.message);
      }
    } finally {
      setApplying(false);
    }
  };

  const scoreColor = (s) => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)';
  const scoreBg    = (s) => s >= 75 ? 'var(--green-tint)' : s >= 50 ? 'var(--amber-tint)' : 'var(--red-tint)';
  const compColor  = (c) => c === 'High' ? 'var(--red)' : c === 'Medium' ? 'var(--amber)' : 'var(--green)';
  const compBg     = (c) => c === 'High' ? 'var(--red-tint)' : c === 'Medium' ? 'var(--amber-tint)' : 'var(--green-tint)';

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Loader size={20} style={{ color: 'var(--ember)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Not found ──
  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif", padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 10 }}>Role not found.</h2>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.65, marginBottom: 24 }}>
          This internship may have been closed or the link may have expired.
        </p>
        <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          <ArrowLeft size={13} /> Go to HUNT
        </button>
      </div>
    </div>
  );

  // ── Success screen ──
  if (applied) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif", padding: 24 }}>
      <Confetti />
      <div style={{ textAlign: 'center', maxWidth: 420, position: 'relative', zIndex: 10 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-tint)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'popIn 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
          <CheckCircle2 size={28} color="var(--green-text)" />
        </div>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green-text)', marginBottom: 10 }}>Application submitted</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: 'var(--text)', lineHeight: 1.1, marginBottom: 12, letterSpacing: '-0.02em' }}>
          You applied to<br />
          <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>{job.role}.</em>
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 10 }}>
          {job.company} will review your profile. Your match score was
        </p>
        {matchData && (
          <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 20, background: scoreBg(matchData.score), border: `1.5px solid ${scoreColor(matchData.score)}`, marginBottom: 28 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: scoreColor(matchData.score), fontWeight: 400 }}>{matchData.score}%</span>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 6 }}>match</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/swipe')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 8, border: 'none', background: 'var(--ember)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Zap size={13} /> Find more roles
          </button>
          <button onClick={() => navigate('/profile')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            View my profile
          </button>
        </div>
      </div>
      <style>{`@keyframes popIn { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );

  const skills = job.required_skills || [];
  const matchedSkills = matchData?.matchedSkills || [];
  const missingSkills = matchData?.missingSkills || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            <ArrowLeft size={12} /> HUNT
          </button>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Internship opportunity
          </span>
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: 11, color: 'var(--text-dim)' }}>
              {user.email}
            </div>
          </div>
        )}
      </nav>

      {/* ── Content ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(24px,5vw,48px) 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: Job card ── */}
          <div>
            {/* Company + role header */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ padding: '20px 24px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 44, lineHeight: 1 }}>{job.logo || '🚀'}</span>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 4 }}>{job.company}</p>
                      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, color: 'var(--text)', lineHeight: 1.1, marginBottom: 8, letterSpacing: '-0.01em' }}>{job.role}</h1>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'var(--bg-card)' }}>{job.type || 'Paid Internship'}</span>
                    </div>
                  </div>
                  {matchData && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ padding: '6px 14px', borderRadius: 10, background: scoreBg(matchData.score), border: `1.5px solid ${scoreColor(matchData.score)}` }}>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: scoreColor(matchData.score), margin: 0, lineHeight: 1 }}>{matchData.score}%</p>
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>your match</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {/* Quick info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { Icon: Briefcase, val: job.stipend },
                    { Icon: Clock,     val: job.duration },
                    { Icon: MapPin,    val: job.location },
                    { Icon: Target,    val: `${job.current_applicants || 0}/${job.max_applicants || 50} applied` },
                  ].map(({ Icon, val }) => (
                    <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon size={13} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Competition */}
                {matchData && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: compBg(matchData.competitionLevel), color: compColor(matchData.competitionLevel), fontSize: 12, fontWeight: 500, marginBottom: 16 }}>
                    <TrendingUp size={13} />
                    {matchData.competitionLevel} competition
                  </div>
                )}

                {/* Description */}
                {job.description && (
                  <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.65, marginBottom: 20 }}>{job.description}</p>
                )}

                {/* Required skills */}
                {skills.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Required skills</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {skills.map((skill, i) => {
                        const matched = matchedSkills.find(s => s.name === skill.name);
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {matched
                                ? <CheckCircle2 size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                                : <X size={14} style={{ color: 'var(--red)', flexShrink: 0 }} />
                              }
                              <span style={{ fontSize: 13, color: matched ? 'var(--text)' : 'var(--text-dim)' }}>{skill.name}</span>
                            </div>
                            {matched && (
                              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>L{matched.studentLevel}/{skill.level}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nice to have */}
                {(job.nice_to_have || []).length > 0 && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Nice to have</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {job.nice_to_have.map((s, i) => (
                        <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Apply panel ── */}
          <div style={{ position: 'sticky', top: 80 }}>

            {/* ── CASE 1: Not logged in ── */}
            {!user && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{job.logo || '🚀'}</div>
                <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 8 }}>Apply to this role</p>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 400, color: 'var(--text)', lineHeight: 1.2, marginBottom: 8 }}>
                  {job.company} is looking<br />for an intern.
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 20 }}>
                  Sign in to see your match score and apply in one click.
                </p>

                <button onClick={handleSignIn} disabled={signingIn} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 8, border: 'none', background: signingIn ? 'var(--text-dim)' : 'var(--ember)', color: '#fff', fontSize: 14, fontWeight: 500, cursor: signingIn ? 'default' : 'pointer', fontFamily: 'inherit', marginBottom: 10, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => { if (!signingIn) e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  {signingIn
                    ? <><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Signing in…</>
                    : <><GoogleIcon /> Sign in with Google</>
                  }
                </button>

                <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                  New to HUNT? You'll set up a quick skill profile first — takes 2 minutes.
                </p>

                {error && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 10 }}>{error}</p>}

                {/* What HUNT is */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'left' }}>
                  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>What is HUNT?</p>
                  {[
                    'Skill-first internship matching',
                    'See your match score before applying',
                    'Max 50 applicants per role — no noise',
                  ].map((line, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                      <CheckCircle2 size={12} style={{ color: 'var(--green)', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-mid)' }}>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CASE 2: Logged in, no profile yet ── */}
            {user && !studentProfile && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>👋</div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 400, color: 'var(--text)', marginBottom: 10 }}>Almost there.</h3>
                <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 20 }}>
                  You need a skill profile before applying. It takes 2 minutes — add your skills and one project.
                </p>
                <button onClick={() => navigate('/onboarding')} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: 'var(--ember)', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Build my profile <ChevronRight size={14} />
                </button>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10 }}>
                  We'll bring you back here after setup.
                </p>
              </div>
            )}

            {/* ── CASE 3: Logged in with profile ── */}
            {user && studentProfile && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>

                {/* Profile chip */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green-tint)', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: 'var(--green-text)', flexShrink: 0 }}>
                    {studentProfile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', margin: 0 }}>{studentProfile.full_name}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0 }}>{studentProfile.college}</p>
                  </div>
                  <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green-text)', fontWeight: 500 }}>
                    {studentProfile.profile_completeness || 0}%
                  </div>
                </div>

                <div style={{ padding: '16px' }}>
                  {/* Match breakdown */}
                  {matchData && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0 }}>Your match</p>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: scoreColor(matchData.score), margin: 0 }}>{matchData.score}%</p>
                      </div>
                      {Object.entries(matchData.breakdown).map(([k, v]) => (
                        <div key={k} style={{ marginBottom: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text)' }}>{v}%</span>
                          </div>
                          <div style={{ height: 3, borderRadius: 2, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${v}%`, background: 'var(--green)', borderRadius: 2, transition: 'width 0.5s' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills gap */}
                  {missingSkills.length > 0 && (
                    <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--red-tint)', border: '1px solid var(--red)', marginBottom: 14 }}>
                      <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--red)', marginBottom: 6 }}>Skills gap</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {missingSkills.map((s, i) => (
                          <span key={i} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, border: '1px solid var(--red)', color: 'var(--red)' }}>{s.name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--red-tint)', border: '1px solid var(--red)', marginBottom: 12 }}>
                      <p style={{ fontSize: 12, color: 'var(--red)', margin: 0 }}>{error}</p>
                    </div>
                  )}

                  {/* Apply button */}
                  {alreadyApplied ? (
                    <div style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'var(--green-tint)', border: '1px solid var(--green)', textAlign: 'center' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--green-text)', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <CheckCircle2 size={14} /> Already applied
                      </p>
                    </div>
                  ) : (
                    <button onClick={handleApply} disabled={applying} style={{ width: '100%', padding: '13px', borderRadius: 8, border: 'none', background: applying ? 'var(--text-dim)' : 'var(--green)', color: '#fff', fontSize: 14, fontWeight: 500, cursor: applying ? 'default' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s', marginBottom: 8 }}
                      onMouseEnter={e => { if (!applying) e.currentTarget.style.opacity = '0.85'; }}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                      {applying ? <><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Applying…</> : <>Apply now <ChevronRight size={14} /></>}
                    </button>
                  )}

                  <button onClick={() => navigate('/swipe')} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Browse more roles
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
