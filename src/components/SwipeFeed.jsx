// src/components/SwipeFeed.jsx
import React, { useState, useEffect } from 'react';
import {
  Heart, X, TrendingUp, Target, Briefcase, MapPin, Clock,
  AlertCircle, CheckCircle2, ChevronRight, Zap, Award, LogOut, Sun, Moon
} from 'lucide-react';
import { getStudentProfile, getActiveJobs, createApplication, getWeeklyApplicationCount, signOut } from '../services/supabase';
import { calculateMatchScore } from '../services/matching';
import { sendToAirtable, prepareApplicationData } from '../services/airtable';
import { useNavigate } from 'react-router-dom';

// ─── Design tokens (mirrors landing page CSS variables) ───────────────────────
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

  const WEEKLY_LIMIT = 5;
  const currentJob = jobs[currentIndex];
  const remainingApplications = WEEKLY_LIMIT - weeklyApplications;
  const canApply = remainingApplications > 0;

  useEffect(() => {
    applyTokens(theme);
    localStorage.setItem('hunt-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (currentJob && studentProfile) {
      setMatchData(calculateMatchScore(studentProfile, currentJob));
    }
  }, [currentIndex, studentProfile, currentJob]);

  const loadData = async () => {
    try {
      setLoading(true);
      const profile = await getStudentProfile();
      if (!profile) { navigate('/onboarding'); return; }
      setStudentProfile(profile);

      const activeJobs = await getActiveJobs();
      const jobsWithScores = activeJobs.map(job => ({
        ...job,
        matchScore: calculateMatchScore(profile, job)
      }));
      const relevantJobs = jobsWithScores
        .filter(job => job.matchScore.score >= 50 && job.current_applicants < job.max_applicants)
        .sort((a, b) => b.matchScore.score - a.matchScore.score);

      setJobs(relevantJobs);
      setWeeklyApplications(await getWeeklyApplicationCount());
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load jobs. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction) => {
    if (applying) return;
    setSwipeDirection(direction);
    setTimeout(() => {
      if (direction === 'right') {
        if (weeklyApplications >= WEEKLY_LIMIT) {
          alert('Weekly application limit reached! Come back next week.');
          setSwipeDirection(null);
          return;
        }
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
      alert('✅ Application submitted successfully!');
      moveToNext();
    } catch (error) {
      console.error('Application error:', error);
      alert('Failed to submit application: ' + error.message);
    } finally {
      setApplying(false);
    }
  };

  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); }
    catch (error) { console.error('Sign out error:', error); }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseMove = (e) => {
    if (isDragging) setDragOffset({ x: e.movementX * 2, y: e.movementY * 0.5 });
  };
  const handleMouseUp = () => {
    if (Math.abs(dragOffset.x) > 100) handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const scoreColor = s => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)';
  const scoreBg    = s => s >= 75 ? 'var(--green-tint)' : s >= 50 ? 'var(--amber-tint)' : 'var(--red-tint)';
  const compColor  = c => c === 'High' ? 'var(--red)' : c === 'Medium' ? 'var(--amber)' : 'var(--green)';
  const compBg     = c => c === 'High' ? 'var(--red-tint)' : c === 'Medium' ? 'var(--amber-tint)' : 'var(--green-tint)';

  const initials = studentProfile?.full_name?.split(' ').map(n => n[0]).join('') || 'U';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-base font-normal"
            style={{ fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)' }}>
            Loading opportunities…
          </p>
        </div>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div className="text-center">
          <p className="text-5xl mb-4">🎯</p>
          <h2 className="text-3xl font-normal mb-2"
            style={{ fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)' }}>
            All caught up.
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-dim)' }}>
            No more opportunities right now. Check back soon.
          </p>
          <button onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300"
      style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="flex items-center gap-4">
          <span className="text-base font-medium" style={{ letterSpacing: '0.12em' }}>HUNT</span>
          <span className="text-xs tracking-widest uppercase hidden sm:block" style={{ color: 'var(--text-dim)' }}>
            Discovery
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-mid)' }}>
            <Zap className="w-3.5 h-3.5" style={{ color: 'var(--green)' }} />
            {remainingApplications}/5 left
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-mid)' }}>
            {initials}
          </div>
          <button onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
            style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)', color: 'var(--text-dim)' }}>
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleSignOut}
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
            style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)', color: 'var(--text-dim)' }}
            title="Sign out">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Profile completeness warning */}
      {studentProfile?.profile_completeness < 80 && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm"
            style={{ background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Profile {studentProfile.profile_completeness}% complete — finish it to improve your match scores.</span>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* LEFT: Job card */}
          <div>
            <div
              className="rounded-xl border overflow-hidden transition-all duration-300 select-none"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
                cursor: isDragging ? 'grabbing' : 'grab',
                transform: isDragging
                  ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${dragOffset.x * 0.05}deg)`
                  : swipeDirection === 'right' ? 'translateX(200px) rotate(8deg)'
                  : swipeDirection === 'left'  ? 'translateX(-200px) rotate(-8deg)'
                  : undefined,
                opacity: swipeDirection ? 0 : 1,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Card header */}
              <div className="px-6 pt-6 pb-5 flex items-start justify-between"
                style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                <div className="flex items-start gap-4">
                  <span className="text-4xl leading-none">{currentJob.logo}</span>
                  <div>
                    <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: 'var(--text-dim)' }}>
                      {currentJob.company}
                    </p>
                    <h2 className="text-xl font-normal leading-tight mb-2"
                      style={{ fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)' }}>
                      {currentJob.role}
                    </h2>
                    <span className="inline-block text-xs px-2 py-1 rounded border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-dim)', background: 'var(--bg-card)' }}>
                      {currentJob.type}
                    </span>
                  </div>
                </div>
                {matchData && (
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-normal px-3 py-1.5 rounded-lg"
                      style={{
                        fontFamily: "'Editorial New', Georgia, serif",
                        color: scoreColor(matchData.score),
                        background: scoreBg(matchData.score),
                      }}>
                      {matchData.score}%
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>match</p>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="px-6 py-5 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { Icon: Briefcase, val: currentJob.stipend },
                    { Icon: Clock,     val: currentJob.duration },
                    { Icon: MapPin,    val: currentJob.location },
                    { Icon: Target,    val: `${currentJob.current_applicants}/${currentJob.max_applicants} applied` },
                  ].map(({ Icon, val }) => (
                    <div key={val} className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-dim)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-mid)' }}>{val}</span>
                    </div>
                  ))}
                </div>

                {matchData && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ background: compBg(matchData.competitionLevel), color: compColor(matchData.competitionLevel) }}>
                    <TrendingUp className="w-4 h-4" />
                    {matchData.competitionLevel} competition
                  </div>
                )}

                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                  {currentJob.description}
                </p>

                <div>
                  <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--text-dim)' }}>
                    Required skills
                  </p>
                  <div className="space-y-1.5">
                    {currentJob.required_skills?.map((skill, idx) => {
                      const matched = matchData?.matchedSkills.find(s => s.name === skill.name);
                      return (
                        <div key={idx} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            {matched
                              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--green)' }} />
                              : <X className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--red)' }} />
                            }
                            <span className="text-sm" style={{ color: matched ? 'var(--text)' : 'var(--text-dim)' }}>
                              {skill.name}
                            </span>
                          </div>
                          {matched && (
                            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                              L{matched.studentLevel}/{skill.level}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {currentJob.nice_to_have?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--text-dim)' }}>
                      Nice to have
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentJob.nice_to_have.map((s, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs rounded border"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-dim)', background: 'var(--bg-subtle)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Swipe buttons */}
            <div className="mt-6 flex items-center justify-center gap-8">
              <button onClick={() => handleSwipe('left')} disabled={applying}
                className="w-14 h-14 rounded-full flex items-center justify-center border transition-all disabled:opacity-30"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.background = 'var(--red-tint)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}>
                <X className="w-6 h-6" style={{ color: 'var(--red)' }} />
              </button>
              <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>
                swipe or click
              </span>
              <button onClick={() => handleSwipe('right')} disabled={!canApply || applying}
                className="w-14 h-14 rounded-full flex items-center justify-center border transition-all disabled:opacity-30"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                onMouseEnter={e => { if (canApply && !applying) { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-tint)'; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}>
                <Heart className="w-6 h-6" style={{ color: 'var(--green)' }} />
              </button>
            </div>
          </div>

          {/* RIGHT: Breakdown or applied */}
          <div>
            {showMatchBreakdown ? (
              <div className="rounded-xl border p-6 space-y-6"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: 'var(--text-dim)' }}>
                      Match breakdown
                    </p>
                    <h3 className="text-3xl font-normal"
                      style={{ fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)' }}>
                      {matchData?.score}%
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
                      How your profile aligns with this role
                    </p>
                  </div>
                  <span className="text-4xl">{currentJob.logo}</span>
                </div>

                <div className="space-y-4">
                  {Object.entries(matchData?.breakdown || {}).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-mid)' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{value}%</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${value}%`, background: 'var(--green)' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {matchData?.missingSkills.length > 0 && (
                  <div className="px-4 py-3 rounded-lg"
                    style={{ background: 'var(--red-tint)', border: '1px solid var(--red)' }}>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--red)' }}>Skills gap</p>
                    <div className="flex flex-wrap gap-2">
                      {matchData.missingSkills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs rounded border"
                          style={{ borderColor: 'var(--red)', color: 'var(--red)', background: 'transparent' }}>
                          {skill.name} (L{skill.level})
                        </span>
                      ))}
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--red)' }}>
                      Learn these to strengthen your application
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button onClick={handleApply} disabled={!canApply || applying}
                    className="w-full py-3.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-80 disabled:opacity-30"
                    style={{ background: 'var(--green)', color: '#fff' }}>
                    {applying ? 'Submitting…'
                      : !canApply ? 'Weekly limit reached'
                      : <><span>Apply now</span><ChevronRight className="w-4 h-4" /></>}
                  </button>
                  <button onClick={moveToNext} disabled={applying}
                    className="w-full py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-30"
                    style={{ background: 'var(--bg-subtle)', color: 'var(--text-mid)' }}>
                    Skip for now
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border p-6"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-5">
                  <Award className="w-4 h-4" style={{ color: 'var(--amber)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Applied this week</span>
                </div>

                {appliedJobs.length === 0 ? (
                  <div className="text-center py-14">
                    <p className="text-3xl mb-3">🎯</p>
                    <p className="text-sm font-normal"
                      style={{ fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)' }}>
                      No applications yet
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
                      Swipe right on roles that interest you
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {appliedJobs.map((job, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-lg border"
                        style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{job.logo}</span>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{job.role}</p>
                            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{job.company}</p>
                          </div>
                        </div>
                        <p className="text-base font-normal"
                          style={{ fontFamily: "'Editorial New', Georgia, serif", color: 'var(--green)' }}>
                          {job.matchScore}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Applications remaining</span>
                    <span className="text-base font-normal"
                      style={{ fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)' }}>
                      {remainingApplications}/5
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(remainingApplications / 5) * 100}%`, background: 'var(--green)' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Footer stats */}
      <div className="border-t mt-16" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { val: `${currentIndex + 1}/${jobs.length}`, label: 'Reviewed', color: 'var(--text)' },
              { val: appliedJobs.length,                   label: 'Applied',  color: 'var(--green)' },
              { val: skippedJobs.length,                   label: 'Skipped',  color: 'var(--text-dim)' },
            ].map(({ val, label, color }) => (
              <div key={label}>
                <div className="text-2xl font-normal mb-0.5"
                  style={{ fontFamily: "'Editorial New', Georgia, serif", color }}>
                  {val}
                </div>
                <div className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
