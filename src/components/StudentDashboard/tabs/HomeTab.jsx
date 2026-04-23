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
  return (
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
  );
}
