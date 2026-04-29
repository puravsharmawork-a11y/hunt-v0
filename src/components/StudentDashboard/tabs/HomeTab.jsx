// src/components/StudentDashboard/tabs/HomeTab.jsx
import React from 'react';
import { ClipboardList, Bookmark, Star, FileText, Briefcase, MapPin } from 'lucide-react';

export function HomeTab({
  studentProfile,
  navigate,
  setActiveTab,
  homeSubTab, setHomeSubTab,
  appliedJobs,
  savedJobs,
  handleSaveToggle,
  handleJobClick,
}) {
  const firstName = studentProfile?.full_name?.split(' ')[0] || 'there';
  const welcomed = studentProfile?.id ? localStorage.getItem(`hunt-welcomed-${studentProfile.id}`) : null;

  // Build "important tasks" list (preserved logic)
  const tasks = [];
  const p = studentProfile;
  if (!p?.profile_completeness || p.profile_completeness < 100)
    tasks.push({
      id: 'profile',
      title: 'Complete your profile',
      desc: `You're ${p?.profile_completeness || 0}% done — finish to improve match scores.`,
      cta: 'Complete now',
      action: () => navigate('/onboarding'),
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
          style={{
            fontSize: 34,
            color: 'var(--text)',
            lineHeight: 1.05,
          }}
        >
          {welcomed ? <>Welcome back, <em>{firstName}.</em></> : <>Welcome to HUNT, <em>{firstName}.</em></>}
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
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div>
                  <p
                    className="hunt-serif"
                    style={{
                      fontSize: 17,
                      color: 'var(--text)',
                      marginBottom: 6,
                      lineHeight: 1.15,
                    }}
                  >
                    {task.title}
                  </p>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: 'var(--text-mid)',
                      lineHeight: 1.5,
                    }}
                  >
                    {task.desc}
                  </p>
                </div>
                {task.pct !== undefined && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}
                    >
                      <span className="hunt-kicker">progress</span>
                      <span
                        className="hunt-mono"
                        style={{ fontSize: 10, fontWeight: 600, color: 'var(--blue)' }}
                      >
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

      {/* ── Sub-tabs ── */}
      <div
        style={{
          borderBottom: '1px solid var(--border-mid)',
          marginBottom: 24,
          display: 'flex',
        }}
      >
        {[
          { id: 'applications', label: 'Applications' },
          { id: 'saved',        label: 'Saved' },
          { id: 'offers',       label: 'Offers' },
          { id: 'assessments',  label: 'Assessments' },
        ].map(t => {
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
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Applications */}
      {homeSubTab === 'applications' && (
        appliedJobs.length === 0 ? (
          <EmptyState
            Icon={ClipboardList}
            title="No applications yet."
            sub="All your applications will be visible here."
            cta={{ label: 'Explore opportunities', onClick: () => setActiveTab('explore') }}
          />
        ) : (
          <div className="hunt-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr 140px 100px 80px',
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-mid)',
                background: 'var(--bg-subtle)',
              }}
            >
              {['', 'Role', 'Applied', 'Status', 'Match'].map((h, i) => (
                <div key={i} className="hunt-kicker">{h}</div>
              ))}
            </div>
            {appliedJobs.map((job, i) => {
              const glyph = (job.company || '?').slice(0, 1).toUpperCase();
              return (
                <div
                  key={job.id || i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr 140px 100px 80px',
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border)',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      background: 'var(--ink)',
                      color: 'var(--cream)',
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {glyph}
                  </div>
                  <div>
                    <div className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 2 }}>
                      {job.company}
                    </div>
                    <div
                      className="hunt-serif"
                      style={{ fontSize: 14, color: 'var(--text)' }}
                    >
                      {job.role}
                    </div>
                  </div>
                  <div
                    className="hunt-mono"
                    style={{
                      fontSize: 10.5,
                      color: 'var(--text-dim)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    just now
                  </div>
                  <div>
                    <span className="hunt-chip hunt-chip-blue-tint">● Sent</span>
                  </div>
                  <div
                    className="hunt-serif"
                    style={{
                      fontSize: 18,
                      color: 'var(--blue)',
                      lineHeight: 1,
                    }}
                  >
                    {job.matchScore}%
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Saved */}
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
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--blue)',
                      padding: 4,
                    }}
                  >
                    <Bookmark size={14} fill="var(--blue)" />
                  </button>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        background: 'var(--ink)',
                        color: 'var(--cream)',
                        display: 'grid',
                        placeItems: 'center',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {glyph}
                    </div>
                    <div>
                      <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 2 }}>
                        {job.company}
                      </p>
                      <p
                        className="hunt-serif"
                        style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.15 }}
                      >
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
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 10.5,
                            color: 'var(--text-dim)',
                            letterSpacing: '0.04em',
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

      {/* Offers */}
      {homeSubTab === 'offers' && (
        <EmptyState
          Icon={Star}
          title="No offers yet."
          sub="Offers appear here once recruiters reach out."
        />
      )}

      {/* Assessments */}
      {homeSubTab === 'assessments' && (
        <EmptyState
          Icon={FileText}
          title="Assessments coming soon."
          sub="Skill verifications will appear here to boost your profile score."
        />
      )}
    </div>
  );
}

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
        style={{
          color: 'var(--text-dim)',
          display: 'block',
          margin: '0 auto 14px',
        }}
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
        <button
          onClick={cta.onClick}
          className="hunt-btn hunt-btn-sm hunt-btn-ghost"
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}
