// src/components/StudentDashboard/explore/SwipeView.jsx
import React from 'react';
import { Bookmark } from 'lucide-react';

export function SwipeView({ jobs, studentProfile, weeklyApplications, onApply, applying, canApply, selectedJob, onJobClick, isJobSaved, onSave }) {

  const scoreColor = s => (s >= 75 ? 'var(--blue)' : s >= 50 ? 'var(--amber)' : 'var(--red)');
  const compColor  = c => (c === 'High' ? 'var(--red)' : c === 'Medium' ? 'var(--amber)' : 'var(--blue)');
  const panelOpen  = !!selectedJob;

  if (!jobs || jobs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border-mid)', background: 'var(--bg-card)' }}>
        <div className="hunt-mono" style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>
          ▲ all caught up
        </div>
        <h3 className="hunt-serif" style={{ fontSize: 24, color: 'var(--text)', marginBottom: 6 }}>
          You've reviewed every match.
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>New drops Mon + Thu at 09:00 IST.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '48px minmax(160px,1fr) 120px 100px 80px 56px 32px',
        gap: 12,
        padding: '6px 24px 6px',
        borderBottom: '1px solid var(--border-mid)',
      }}>
        {['', 'Role', 'Location', 'Stipend', 'Duration', 'Match', ''].map((h, i) => (
          <div key={i} className="hunt-mono" style={{ fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
            {h}
          </div>
        ))}
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
              display: 'grid',
              gridTemplateColumns: '48px minmax(160px,1fr) 120px 100px 80px 56px 32px',
              alignItems: 'center',
              gap: 12,
              padding: '12px 24px',
              borderBottom: '1px solid var(--border)',
              borderLeft: isSelected ? '2px solid var(--blue)' : '2px solid transparent',
              background: isSelected ? 'var(--blue-tint)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.1s',
              minWidth: 520,
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--blue-tint)' : 'transparent'; }}
          >
            {/* Logo */}
            <div style={{
              width: 36, height: 36,
              display: 'grid', placeItems: 'center',
              background: 'var(--ink)', color: 'var(--cream)',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600, fontSize: 14,
              position: 'relative', flexShrink: 0,
            }}>
              {logoGlyph}
              <div style={{ position: 'absolute', bottom: -1, right: -1, width: 4, height: 4, background: 'var(--blue)' }} />
            </div>

            {/* Company + Role */}
            <div style={{ minWidth: 0 }}>
              <div className="hunt-kicker" style={{ fontSize: 8.5, color: 'var(--text-dim)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {job.company}
              </div>
              <div className="hunt-serif" style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {job.role}
              </div>
            </div>

            {/* Location */}
            <div className="hunt-mono" style={{ fontSize: 10.5, color: 'var(--text-mid)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {job.location || '—'}
            </div>

            {/* Stipend */}
            <div className="hunt-mono" style={{ fontSize: 10.5, color: 'var(--text-mid)', whiteSpace: 'nowrap' }}>
              {job.stipend || '—'}
            </div>

            {/* Duration */}
            <div className="hunt-mono" style={{ fontSize: 10.5, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
              {job.duration || '—'}
            </div>

            {/* Match % */}
            {matchData ? (
              <div style={{ textAlign: 'right' }}>
                <div className="hunt-serif" style={{ fontSize: 18, lineHeight: 1, color: scoreColor(matchData.score), fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {matchData.score}<span style={{ fontSize: 10 }}>%</span>
                </div>
                {matchData.competitionLevel && (
                  <div className="hunt-mono" style={{ fontSize: 7.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: compColor(matchData.competitionLevel), marginTop: 2, whiteSpace: 'nowrap' }}>
                    {matchData.competitionLevel === 'Low' ? 'Low comp' : matchData.competitionLevel === 'Medium' ? 'Med comp' : 'High comp'}
                  </div>
                )}
              </div>
            ) : <div />}

            {/* Bookmark */}
            <button
              onClick={e => { e.stopPropagation(); onSave?.({ id: job.id, ...job }); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: isSaved ? 'var(--blue)' : 'var(--text-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Bookmark size={13} fill={isSaved ? 'var(--blue)' : 'none'} />
            </button>
          </div>
        );
      })}

      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
        <span className="hunt-mono" style={{ fontSize: 9.5, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          end of feed · new drops mon + thu @ 09:00 IST
        </span>
      </div>
    </div>
  );
}
