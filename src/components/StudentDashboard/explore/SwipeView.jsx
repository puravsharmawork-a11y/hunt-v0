// src/components/StudentDashboard/explore/SwipeView.jsx
import React from 'react';
import { Bookmark } from 'lucide-react';

export function SwipeView({ jobs, selectedJob, onJobClick, isJobSaved, onSave }) {

  const scoreColor = s => (s >= 75 ? 'var(--blue)' : s >= 50 ? 'var(--amber)' : 'var(--red)');
  const compColor  = c => (c === 'High' ? 'var(--red)' : c === 'Medium' ? 'var(--amber)' : 'var(--blue)');
  const panelOpen  = !!selectedJob;

  if (!jobs || jobs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border-mid)', background: 'var(--bg-card)', margin: '8px 28px' }}>
        <div className="hunt-mono" style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>▲ all caught up</div>
        <h3 className="hunt-serif" style={{ fontSize: 24, color: 'var(--text)', marginBottom: 6 }}>You've reviewed every match.</h3>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>New drops Mon + Thu at 09:00 IST.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Column headers */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 28px',
        borderBottom: '1px solid var(--border-mid)',
        gap: 12,
      }}>
        <div style={{ width: 36, flexShrink: 0 }} />
        <div className="hunt-mono" style={{ flex: '1 1 0', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Role</div>
        {!panelOpen && <>
          <div className="hunt-mono" style={{ width: 130, flexShrink: 0, fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Location</div>
          <div className="hunt-mono" style={{ width: 90, flexShrink: 0, fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Stipend</div>
          <div className="hunt-mono" style={{ width: 80, flexShrink: 0, fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Duration</div>
        </>}
        <div className="hunt-mono" style={{ width: 52, flexShrink: 0, textAlign: 'right', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Match</div>
        <div style={{ width: 24, flexShrink: 0 }} />
      </div>

      {jobs.map(job => {
        const matchData = job._match;
        const isSelected = selectedJob?.id === job.id;
        const isSaved = isJobSaved?.(job.id);
        const logoGlyph = (job.company || '?').slice(0, 1).toUpperCase();

        return (
          <div
            key={job.id}
            onClick={() => onJobClick?.(job)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 28px',
              borderBottom: '1px solid var(--border)',
              borderLeft: isSelected ? '2px solid var(--blue)' : '2px solid transparent',
              background: isSelected ? 'var(--blue-tint)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--blue-tint)' : 'transparent'; }}
          >
            {/* Logo */}
            <div style={{
              width: 36, height: 36, flexShrink: 0,
              display: 'grid', placeItems: 'center',
              background: 'var(--ink)', color: 'var(--cream)',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600, fontSize: 14,
              position: 'relative',
            }}>
              {logoGlyph}
              <div style={{ position: 'absolute', bottom: -1, right: -1, width: 4, height: 4, background: 'var(--blue)' }} />
            </div>

            {/* Company + Role — always flex: 1 */}
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              <div className="hunt-kicker" style={{ fontSize: 8.5, color: 'var(--text-dim)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {job.company}
              </div>
              <div className="hunt-serif" style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {job.role}
              </div>
              {/* Show location + stipend inline when panel is open (no space for columns) */}
              {panelOpen && (
                <div className="hunt-mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {[job.location, job.stipend, job.duration].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>

            {/* Extra columns — only show when panel is closed */}
            {!panelOpen && <>
              <div className="hunt-mono" style={{ width: 130, flexShrink: 0, fontSize: 11, color: 'var(--text-mid)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {job.location || '—'}
              </div>
              <div className="hunt-mono" style={{ width: 90, flexShrink: 0, fontSize: 11, color: 'var(--text-mid)', whiteSpace: 'nowrap' }}>
                {job.stipend || '—'}
              </div>
              <div className="hunt-mono" style={{ width: 80, flexShrink: 0, fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                {job.duration || '—'}
              </div>
            </>}

            {/* Match % */}
            <div style={{ width: 52, flexShrink: 0, textAlign: 'right' }}>
              {matchData && (
                <>
                  <div className="hunt-serif" style={{ fontSize: 17, lineHeight: 1, color: scoreColor(matchData.score), whiteSpace: 'nowrap' }}>
                    {matchData.score}<span style={{ fontSize: 10 }}>%</span>
                  </div>
                  {matchData.competitionLevel && (
                    <div className="hunt-mono" style={{ fontSize: 7.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: compColor(matchData.competitionLevel), marginTop: 2, whiteSpace: 'nowrap' }}>
                      {matchData.competitionLevel === 'Low' ? 'Low' : matchData.competitionLevel === 'Medium' ? 'Med' : 'High'}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bookmark */}
            <button
              onClick={e => { e.stopPropagation(); onSave?.({ id: job.id, ...job }); }}
              style={{ width: 24, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: isSaved ? 'var(--blue)' : 'var(--text-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Bookmark size={13} fill={isSaved ? 'var(--blue)' : 'none'} />
            </button>
          </div>
        );
      })}

      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)' }}>
        <span className="hunt-mono" style={{ fontSize: 9.5, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          end of feed · new drops mon + thu @ 09:00 IST
        </span>
      </div>
    </div>
  );
}
