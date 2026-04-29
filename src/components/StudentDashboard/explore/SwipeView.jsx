// src/components/StudentDashboard/explore/SwipeView.jsx
import React from 'react';
import { Bookmark } from 'lucide-react';

export function SwipeView({ jobs, studentProfile, weeklyApplications, onApply, applying, canApply, selectedJob, onJobClick, isJobSaved, onSave }) {

  const scoreColor = s => (s >= 75 ? 'var(--blue)' : s >= 50 ? 'var(--amber)' : 'var(--red)');
  const compColor  = c => (c === 'High' ? 'var(--red)' : c === 'Medium' ? 'var(--amber)' : 'var(--blue)');

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
    <div>
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
              gridTemplateColumns: '48px 1fr 140px 110px 90px 60px 32px',
              alignItems: 'center',
              gap: 16,
              padding: '14px 24px',
              borderBottom: '1px solid var(--border)',
              borderLeft: isSelected ? '2px solid var(--blue)' : '2px solid transparent',
              background: isSelected ? 'var(--blue-tint)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'var(--blue-tint)' : 'transparent'; }}
          >
            {/* Logo */}
            <div style={{
              width: 40, height: 40,
              display: 'grid', placeItems: 'center',
              background: 'var(--ink)', color: 'var(--cream)',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600, fontSize: 15,
              position: 'relative', flexShrink: 0,
            }}>
              {logoGlyph}
              <div style={{ position: 'absolute', bottom: -1, right: -1, width: 5, height: 5, background: 'var(--blue)' }} />
            </div>

            {/* Company + Role */}
            <div style={{ minWidth: 0 }}>
              <div className="hunt-kicker" style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 3 }}>
                {job.company}
              </div>
              <div className="hunt-serif" style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {job.role}
              </div>
            </div>

            {/* Location */}
            <div className="hunt-mono" style={{ fontSize: 11, color: 'var(--text-mid)', letterSpacing: '0.02em' }}>
              {job.location || '—'}
            </div>

            {/* Stipend */}
            <div className="hunt-mono" style={{ fontSize: 11, color: 'var(--text-mid)', letterSpacing: '0.02em' }}>
              {job.stipend || '—'}
            </div>

            {/* Duration */}
            <div className="hunt-mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.02em' }}>
              {job.duration || '—'}
            </div>

            {/* Match % */}
            {matchData ? (
              <div style={{ textAlign: 'right' }}>
                <div className="hunt-serif" style={{ fontSize: 20, lineHeight: 1, color: scoreColor(matchData.score), fontWeight: 700 }}>
                  {matchData.score}<span style={{ fontSize: 11 }}>%</span>
                </div>
                {matchData.competitionLevel && (
                  <div className="hunt-mono" style={{ fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', color: compColor(matchData.competitionLevel), marginTop: 2 }}>
                    {matchData.competitionLevel} comp
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

      <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
        <span className="hunt-mono" style={{ fontSize: 9.5, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          end of feed · new drops mon + thu @ 09:00 IST
        </span>
      </div>
    </div>
  );
}
