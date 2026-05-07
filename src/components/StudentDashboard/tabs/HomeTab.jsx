// src/components/StudentDashboard/tabs/HomeTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// HUNT — Home Tab (recruiter-loop update)
//
// TAB ORDER (changed):
//   Applications | Offers | Assessments | Saved
//
// RECRUITER → CANDIDATE LOOP:
//   When a recruiter changes an application status, HUNT writes a row to
//   `application_status_updates` (or uses the existing `applications.status`
//   column + `applications.recruiter_message` column).
//
//   Status mapping:
//     shortlisted → shown in Applications tab as "Shortlisted" chip + notification bell
//     rejected    → shown in Applications tab as "Not selected" chip + notification bell
//     interview   → shown in Offers tab as Interview card (with recruiter message)
//     hired       → shown in Offers tab as Offer card (with recruiter message)
//
// SUPABASE (run once, idempotent):
//   ALTER TABLE applications ADD COLUMN IF NOT EXISTS recruiter_message TEXT;
//   ALTER TABLE applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
//   -- If you want a separate notifications table entry written by RecruiterDashboard:
//   -- RecruiterDashboard already calls updateApplicationStatus(appId, status)
//   -- which you can extend to also insert into `notifications` with student_id.
//
// REALTIME:
//   This tab subscribes to `applications` changes filtered to the current student
//   so status updates land live without a full refresh.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Bookmark, Star, FileText, Briefcase, MapPin,
  CheckCircle2, Clock, XCircle, Phone, Award, Bell, ChevronRight,
  MessageSquare, Calendar,
} from 'lucide-react';
import { supabase } from '../../../services/supabase';

// ─── Status meta ─────────────────────────────────────────────────────────────
const STATUS_META = {
  pending: {
    label: 'Sent',
    chipClass: 'hunt-chip hunt-chip-blue-tint',
    icon: Clock,
    color: 'var(--blue)',
    bg: 'var(--blue-tint)',
    showInOffers: false,
  },
  shortlisted: {
    label: 'Shortlisted',
    chipClass: 'hunt-chip',
    icon: CheckCircle2,
    color: 'var(--green)',
    bg: 'var(--green-tint)',
    showInOffers: false,
    notifTitle: 'You\'ve been shortlisted',
    notifBody: (role, company) => `${company} shortlisted you for ${role}. You're in their top picks.`,
  },
  interview: {
    label: 'Interview',
    chipClass: 'hunt-chip',
    icon: Phone,
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.1)',
    showInOffers: true,
    notifTitle: 'Interview invite',
    notifBody: (role, company) => `${company} wants to interview you for ${role}.`,
  },
  hired: {
    label: 'Offer',
    chipClass: 'hunt-chip',
    icon: Award,
    color: '#059669',
    bg: 'rgba(5,150,105,0.1)',
    showInOffers: true,
    notifTitle: 'You got an offer 🎉',
    notifBody: (role, company) => `${company} has extended an offer for ${role}. Congratulations!`,
  },
  rejected: {
    label: 'Not selected',
    chipClass: 'hunt-chip',
    icon: XCircle,
    color: 'var(--red)',
    bg: 'var(--red-tint)',
    showInOffers: false,
    notifTitle: 'Application update',
    notifBody: (role, company) => `${company} has made a decision on your ${role} application.`,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d) {
  if (!d) return 'just now';
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Main component ───────────────────────────────────────────────────────────
export function HomeTab({
  studentProfile,
  navigate,
  setActiveTab,
  homeSubTab, setHomeSubTab,
  appliedJobs,      // hydrated in index.jsx from getMyApplications()
  setAppliedJobs,   // needed to sync realtime status changes
  savedJobs,
  handleSaveToggle,
  handleJobClick,
}) {
  const firstName = studentProfile?.full_name?.split(' ')[0] || 'there';
  const welcomed  = studentProfile?.id
    ? localStorage.getItem(`hunt-welcomed-${studentProfile.id}`)
    : null;

  // Live applications with status (replaces static appliedJobs for status display)
  const [liveApps, setLiveApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // ── Fetch full application rows (with status + recruiter_message) ──────────
  const fetchApps = useCallback(async () => {
    if (!studentProfile?.id) return;
    setLoadingApps(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          match_score,
          applied_at,
          status,
          recruiter_message,
          shortlisted_at,
          interviewed_at,
          hired_at,
          jobs (
            id, role, company, logo_url,
            stipend, location, duration
          )
        `)
        .eq('student_id', studentProfile.id)
        .order('applied_at', { ascending: false });

      if (!error && data) {
        setLiveApps(data.filter(a => a.jobs));
        // Sync back to parent if needed for Explore tab "already applied" guard
        if (setAppliedJobs) {
          setAppliedJobs(data.filter(a => a.jobs).map(a => ({
            ...a.jobs,
            matchScore: a.match_score || 0,
            appliedAt: a.applied_at,
          })));
        }
      }
    } finally {
      setLoadingApps(false);
    }
  }, [studentProfile?.id, setAppliedJobs]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  // ── Realtime subscription on applications ─────────────────────────────────
  useEffect(() => {
    if (!studentProfile?.id) return;
    const channel = supabase
      .channel('student_app_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `student_id=eq.${studentProfile.id}`,
        },
        (payload) => {
          setLiveApps(prev =>
            prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a)
          );
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [studentProfile?.id]);

  // ── Important tasks ────────────────────────────────────────────────────────
  const tasks = [];
  const p = studentProfile;
  if (!p?.profile_completeness || p.profile_completeness < 100)
    tasks.push({
      id: 'profile',
      title: 'Complete your profile',
      desc: `You're ${p?.profile_completeness || 0}% done — finish to improve match scores.`,
      cta: 'Complete now',
      action: () => setActiveTab('profile'),
      pct: p?.profile_completeness || 0,
    });
  if (!p?.linkedin_url)
    tasks.push({
      id: 'linkedin',
      title: 'Link LinkedIn',
      desc: 'Recruiters always check LinkedIn first. Add it to boost visibility.',
      cta: 'Add LinkedIn',
      action: () => setActiveTab('profile'),
    });
  if (!p?.github_url)
    tasks.push({
      id: 'github',
      title: 'Add GitHub',
      desc: 'Your GitHub is proof of work. It directly improves your match score.',
      cta: 'Add GitHub',
      action: () => setActiveTab('profile'),
    });
  if (!p?.resume_url)
    tasks.push({
      id: 'resume',
      title: 'Upload resume',
      desc: 'Hiring managers reach out more when they see a resume.',
      cta: 'Upload now',
      action: () => setActiveTab('profile'),
    });

  // Partition into different views
  const activeApplications = liveApps.filter(a =>
    !['interview', 'hired'].includes(a.status || 'pending')
  );
  const offerItems = liveApps.filter(a =>
    ['interview', 'hired'].includes(a.status || 'pending')
  );

  // Unread offer count (for tab badge)
  const unreadOffers = offerItems.filter(a =>
    !a._seenByStudent // you can track this with a seen_at column or localStorage
  ).length;

  // Tab config — reordered: Applications | Offers | Assessments | Saved
  const TABS = [
    { id: 'applications', label: 'Applications' },
    {
      id: 'offers',
      label: 'Offers',
      badge: offerItems.length > 0 ? offerItems.length : null,
    },
    { id: 'assessments', label: 'Assessments' },
    { id: 'saved',       label: 'Saved' },
  ];

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 40px',
        animation: 'hunt-fade-in 0.3s ease',
      }}
    >
      {/* ── Greeting ── */}
      <div style={{ marginBottom: 28 }}>
        <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 6 }}>▲ home</p>
        <h1
          className="hunt-serif"
          style={{ fontSize: 34, color: 'var(--text)', lineHeight: 1.05 }}
        >
          {welcomed
            ? <>Welcome back, <em>{firstName}.</em></>
            : <>Welcome to HUNT, <em>{firstName}.</em></>}
        </h1>
      </div>

      {/* ── Important tasks ── */}
      {tasks.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <p className="hunt-kicker" style={{ marginBottom: 14 }}>
            ▲ important tasks · {tasks.length}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 14,
            }}
          >
            {tasks.map(task => (
              <div
                key={task.id}
                className="hunt-card"
                style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div>
                  <p
                    className="hunt-serif"
                    style={{ fontSize: 17, color: 'var(--text)', marginBottom: 6, lineHeight: 1.15 }}
                  >
                    {task.title}
                  </p>
                  <p style={{ fontSize: 12.5, color: 'var(--text-mid)', lineHeight: 1.5 }}>
                    {task.desc}
                  </p>
                </div>
                {task.pct !== undefined && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span className="hunt-kicker">progress</span>
                      <span className="hunt-mono" style={{ fontSize: 10, fontWeight: 600, color: 'var(--blue)' }}>
                        {task.pct}%
                      </span>
                    </div>
                    <div className="hunt-match-bar-track">
                      <div className="hunt-match-bar-fill" style={{ width: `${task.pct}%` }} />
                    </div>
                  </div>
                )}
                <button
                  onClick={task.action}
                  className="hunt-btn hunt-btn-dark hunt-btn-sm"
                  style={{ alignSelf: 'flex-start' }}
                >
                  {task.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sub-tabs (reordered) ── */}
      <div
        style={{
          borderBottom: '1px solid var(--border-mid)',
          marginBottom: 24,
          display: 'flex',
          gap: 0,
        }}
      >
        {TABS.map(t => {
          const active = homeSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setHomeSubTab(t.id)}
              className="hunt-mono"
              style={{
                padding: '10px 20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11.5,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--text)' : 'var(--text-dim)',
                borderBottom: `2px solid ${active ? 'var(--blue)' : 'transparent'}`,
                marginBottom: -1,
                transition: 'color 0.12s, border-color 0.12s',
                whiteSpace: 'nowrap',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {t.label}
              {t.badge && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 16,
                    height: 16,
                    background: '#7C3AED',
                    color: '#fff',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '0 4px',
                    borderRadius: 3,
                  }}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB: APPLICATIONS
          Shows all apps. Status updates from recruiter show
          inline as chips with colour coding.
      ═══════════════════════════════════════════════════════ */}
      {homeSubTab === 'applications' && (
        loadingApps ? (
          <LoadingRow />
        ) : activeApplications.length === 0 && liveApps.length === 0 ? (
          <EmptyState
            Icon={ClipboardList}
            title="No applications yet."
            sub="All your applications will be visible here."
            cta={{ label: 'Explore opportunities', onClick: () => setActiveTab('explore') }}
          />
        ) : (
          <div>
            {/* Moved-to-offers notice */}
            {offerItems.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  marginBottom: 16,
                  background: 'rgba(124,58,237,0.07)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
                onClick={() => setHomeSubTab('offers')}
              >
                <Bell size={13} style={{ color: '#7C3AED', flexShrink: 0 }} />
                <span
                  className="hunt-mono"
                  style={{ fontSize: 11, color: '#7C3AED', letterSpacing: '0.05em', flex: 1 }}
                >
                  {offerItems.length} application{offerItems.length !== 1 ? 's' : ''} moved
                  to Offers — interview or hire decisions waiting
                </span>
                <ChevronRight size={12} style={{ color: '#7C3AED' }} />
              </div>
            )}

            <div className="hunt-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr 160px 130px 80px',
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border-mid)',
                  background: 'var(--bg-subtle)',
                }}
              >
                {['', 'Role', 'Applied', 'Status', 'Match'].map((h, i) => (
                  <div key={i} className="hunt-kicker">{h}</div>
                ))}
              </div>

              {activeApplications.length === 0 ? (
                <div style={{ padding: '32px 14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
                    All active applications moved to the Offers tab.
                  </p>
                </div>
              ) : (
                activeApplications.map((app, i) => {
                  const job    = app.jobs || {};
                  const glyph  = (job.company || '?').slice(0, 1).toUpperCase();
                  const status = app.status || 'pending';
                  const meta   = STATUS_META[status] || STATUS_META.pending;
                  const Icon   = meta.icon;

                  return (
                    <div key={app.id || i}>
                      {/* Main row */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '44px 1fr 160px 130px 80px',
                          padding: '12px 14px',
                          borderBottom: '1px solid var(--border)',
                          alignItems: 'center',
                          background: status === 'shortlisted'
                            ? 'rgba(26,53,232,0.03)'
                            : status === 'rejected'
                            ? 'rgba(184,40,28,0.03)'
                            : 'transparent',
                          transition: 'background 0.15s',
                        }}
                      >
                        {/* Logo */}
                        {job.logo_url ? (
                          <img
                            src={job.logo_url}
                            alt={job.company}
                            style={{ width: 34, height: 34, objectFit: 'cover', border: '1px solid var(--border-mid)', flexShrink: 0, display: 'block' }}
                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'grid'); }}
                          />
                        ) : null}
                        <div
                          style={{
                            width: 34, height: 34,
                            background: 'var(--ink)', color: 'var(--cream)',
                            display: job.logo_url ? 'none' : 'grid',
                            placeItems: 'center',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 600, fontSize: 14,
                          }}
                        >
                          {glyph}
                        </div>

                        {/* Role + company */}
                        <div>
                          <div className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 2 }}>
                            {job.company}
                          </div>
                          <div className="hunt-serif" style={{ fontSize: 14, color: 'var(--text)' }}>
                            {job.role}
                          </div>
                        </div>

                        {/* Applied at */}
                        <div
                          className="hunt-mono"
                          style={{ fontSize: 10.5, color: 'var(--text-dim)', letterSpacing: '0.04em' }}
                        >
                          {fmt(app.applied_at)}
                        </div>

                        {/* Status chip */}
                        <div>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 10,
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontFamily: "'JetBrains Mono', monospace",
                              fontWeight: 500,
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              background: meta.bg,
                              color: meta.color,
                              border: `1px solid ${meta.color}33`,
                            }}
                          >
                            <Icon size={10} />
                            {meta.label}
                          </span>
                        </div>

                        {/* Match score */}
                        <div
                          className="hunt-serif"
                          style={{ fontSize: 18, color: 'var(--blue)', lineHeight: 1 }}
                        >
                          {app.match_score}%
                        </div>
                      </div>

                      {/* Recruiter message sub-row (shortlisted / rejected) */}
                      {app.recruiter_message && ['shortlisted', 'rejected'].includes(status) && (
                        <RecruiterMessageBar
                          message={app.recruiter_message}
                          status={status}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: OFFERS
          Shows Interview + Hire cards from recruiters,
          each with recruiter message and CTA.
      ═══════════════════════════════════════════════════════ */}
      {homeSubTab === 'offers' && (
        offerItems.length === 0 ? (
          <EmptyState
            Icon={Star}
            title="No offers yet."
            sub="Offers appear here once recruiters reach out with an interview or hire decision."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {offerItems.map((app) => (
              <OfferCard key={app.id} app={app} />
            ))}
          </div>
        )
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: ASSESSMENTS
      ═══════════════════════════════════════════════════════ */}
      {homeSubTab === 'assessments' && (
        <EmptyState
          Icon={FileText}
          title="Assessments coming soon."
          sub="Skill verifications will appear here to boost your profile score."
        />
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: SAVED
      ═══════════════════════════════════════════════════════ */}
      {homeSubTab === 'saved' && (
        savedJobs.length === 0 ? (
          <EmptyState
            Icon={Bookmark}
            title="Nothing saved yet."
            sub="Save listings to easily find them later."
            cta={{ label: 'Explore opportunities', onClick: () => setActiveTab('explore') }}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 14,
            }}
          >
            {savedJobs.map(job => {
              const glyph = (job.company || '?').slice(0, 1).toUpperCase();
              return (
                <div
                  key={job.id}
                  className="hunt-card"
                  style={{ padding: '16px 18px', position: 'relative' }}
                >
                  <button
                    onClick={() => handleSaveToggle(job)}
                    style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--blue)', padding: 4,
                    }}
                  >
                    <Bookmark size={14} fill="var(--blue)" />
                  </button>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    {job.logo_url ? (
                      <img
                        src={job.logo_url}
                        alt={job.company}
                        style={{ width: 36, height: 36, objectFit: 'cover', border: '1px solid var(--border-mid)', flexShrink: 0, display: 'block' }}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'grid'); }}
                      />
                    ) : null}
                    <div
                      style={{
                        width: 36, height: 36,
                        background: 'var(--ink)', color: 'var(--cream)',
                        display: job.logo_url ? 'none' : 'grid', placeItems: 'center',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600, fontSize: 14, flexShrink: 0,
                      }}
                    >
                      {glyph}
                    </div>
                    <div>
                      <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 2 }}>
                        {job.company}
                      </p>
                      <p className="hunt-serif" style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.15 }}>
                        {job.role}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                    {[
                      { Icon: Briefcase, val: job.stipend },
                      { Icon: MapPin,    val: job.location },
                    ]
                      .filter(x => x.val)
                      .map(({ Icon, val }) => (
                        <div
                          key={val}
                          className="hunt-mono"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: 10.5, color: 'var(--text-dim)', letterSpacing: '0.04em',
                          }}
                        >
                          <Icon size={11} /> {val}
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={() => { setActiveTab('explore'); handleJobClick(job); }}
                    className="hunt-btn hunt-btn-sm hunt-btn-ghost"
                  >
                    View & apply
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

// ─── RecruiterMessageBar ──────────────────────────────────────────────────────
// Shown below an application row when the recruiter left a message.
function RecruiterMessageBar({ message, status }) {
  const isRejected = status === 'rejected';
  const borderColor = isRejected ? 'var(--red)' : 'var(--blue)';
  const bgColor     = isRejected ? 'var(--red-tint)' : 'var(--blue-tint)';
  const textColor   = isRejected ? 'var(--red)' : 'var(--blue-deep)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '9px 14px 9px 56px', // 56 = 44px logo col + 12px gap
        background: bgColor,
        borderBottom: '1px solid var(--border)',
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <MessageSquare size={12} style={{ color: borderColor, flexShrink: 0, marginTop: 1 }} />
      <p
        style={{
          fontSize: 12,
          color: textColor,
          margin: 0,
          lineHeight: 1.5,
          fontStyle: 'italic',
        }}
      >
        {message}
      </p>
    </div>
  );
}

// ─── OfferCard ────────────────────────────────────────────────────────────────
// Rich card shown in the Offers tab for interview + hire decisions.
function OfferCard({ app }) {
  const job    = app.jobs || {};
  const status = app.status || 'pending';
  const meta   = STATUS_META[status] || STATUS_META.pending;
  const Icon   = meta.icon;
  const glyph  = (job.company || '?').slice(0, 1).toUpperCase();

  const isHire      = status === 'hired';
  const isInterview = status === 'interview';

  const accentColor  = isHire ? '#059669' : '#7C3AED';
  const accentBg     = isHire ? 'rgba(5,150,105,0.07)' : 'rgba(124,58,237,0.07)';
  const accentBorder = isHire ? 'rgba(5,150,105,0.3)' : 'rgba(124,58,237,0.3)';

  const timestampLabel = isHire ? 'Offer sent' : 'Invite sent';
  const timestamp      = isHire ? app.hired_at : app.interviewed_at;

  return (
    <div
      className="hunt-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      {/* Header band */}
      <div
        style={{
          background: accentBg,
          borderBottom: `1px solid ${accentBorder}`,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Icon size={13} style={{ color: accentColor }} />
        <span
          className="hunt-mono"
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {isHire ? '🎉 Offer received' : 'Interview invite'}
        </span>
        <span
          className="hunt-mono"
          style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 'auto', letterSpacing: '0.04em' }}
        >
          {timestampLabel}: {fmt(timestamp || app.applied_at)}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
          {/* Company logo */}
          {job.logo_url ? (
            <img
              src={job.logo_url}
              alt={job.company}
              style={{ width: 40, height: 40, objectFit: 'cover', border: '1px solid var(--border-mid)', flexShrink: 0, display: 'block' }}
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'grid'); }}
            />
          ) : null}
          <div
            style={{
              width: 40, height: 40,
              background: 'var(--ink)', color: 'var(--cream)',
              display: job.logo_url ? 'none' : 'grid', placeItems: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600, fontSize: 16, flexShrink: 0,
            }}
          >
            {glyph}
          </div>

          {/* Role info */}
          <div style={{ flex: 1 }}>
            <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 3 }}>
              {job.company}
            </p>
            <p className="hunt-serif" style={{ fontSize: 18, color: 'var(--text)', lineHeight: 1.1 }}>
              {job.role}
            </p>
            <div
              style={{
                display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap',
              }}
            >
              {[
                { Icon: Briefcase, val: job.stipend },
                { Icon: MapPin,    val: job.location },
                { Icon: Clock,     val: job.duration },
              ]
                .filter(x => x.val)
                .map(({ Icon: I, val }) => (
                  <div
                    key={val}
                    className="hunt-mono"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.04em',
                    }}
                  >
                    <I size={10} /> {val}
                  </div>
                ))}
            </div>
          </div>

          {/* Match badge */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p className="hunt-serif" style={{ fontSize: 24, color: 'var(--blue)', lineHeight: 1 }}>
              {app.match_score}%
            </p>
            <p className="hunt-kicker" style={{ marginTop: 2 }}>match</p>
          </div>
        </div>

        {/* Recruiter message */}
        {app.recruiter_message && (
          <div
            style={{
              padding: '12px 14px',
              background: accentBg,
              border: `1px solid ${accentBorder}`,
              borderRadius: 6,
              marginBottom: 16,
              display: 'flex',
              gap: 9,
              alignItems: 'flex-start',
            }}
          >
            <MessageSquare size={13} style={{ color: accentColor, flexShrink: 0, marginTop: 1 }} />
            <div>
              <p
                className="hunt-kicker"
                style={{ marginBottom: 4, color: accentColor, letterSpacing: '0.08em' }}
              >
                Message from recruiter
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text)',
                  margin: 0,
                  lineHeight: 1.55,
                  fontStyle: 'italic',
                }}
              >
                "{app.recruiter_message}"
              </p>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isInterview && (
            <>
              <button
                className="hunt-btn hunt-btn-dark hunt-btn-sm"
                style={{ background: accentColor, borderColor: accentColor }}
                onClick={() => {/* open scheduling / external link */}}
              >
                <Calendar size={12} /> Confirm interview
              </button>
              <button className="hunt-btn hunt-btn-ghost hunt-btn-sm">
                Ask a question
              </button>
            </>
          )}
          {isHire && (
            <>
              <button
                className="hunt-btn hunt-btn-dark hunt-btn-sm"
                style={{ background: accentColor, borderColor: accentColor }}
                onClick={() => {/* accept flow */}}
              >
                <Award size={12} /> Accept offer
              </button>
              <button className="hunt-btn hunt-btn-ghost hunt-btn-sm">
                Request more time
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared: LoadingRow ────────────────────────────────────────────────────────
function LoadingRow() {
  return (
    <div style={{ padding: '48px 0', textAlign: 'center' }}>
      <p
        className="hunt-mono"
        style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
      >
        Loading…
      </p>
    </div>
  );
}

// ─── Shared: EmptyState ────────────────────────────────────────────────────────
function EmptyState({ Icon, title, sub, cta }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        border: '1px dashed var(--border-mid)',
      }}
    >
      <Icon
        size={26}
        style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 14px' }}
      />
      <p
        className="hunt-mono"
        style={{
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--text-dim)',
          marginBottom: 8,
        }}
      >
        ▲ empty
      </p>
      <p className="hunt-serif" style={{ fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>
        {title}
      </p>
      <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: cta ? 18 : 0 }}>
        {sub}
      </p>
      {cta && (
        <button onClick={cta.onClick} className="hunt-btn hunt-btn-sm hunt-btn-ghost">
          {cta.label}
        </button>
      )}
    </div>
  );
}
