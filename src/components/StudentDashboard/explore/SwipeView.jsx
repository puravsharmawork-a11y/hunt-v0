// src/components/StudentDashboard/explore/SwipeView.jsx
// List view — replaces the old swipe card UI
import React from 'react';
import { Bookmark, Briefcase, MapPin, Clock } from 'lucide-react';

export function SwipeView({ jobs, studentProfile, weeklyApplications, onApply, applying, canApply, selectedJob, onJobClick, isJobSaved, onSave }) {

  const scoreColor = s => (s >= 75 ? 'var(--blue)' : s >= 50 ? 'var(--amber)' : 'var(--red)');
  const compColor  = c => (c === 'High' ? 'var(--red)' : c === 'Medium' ? 'var(--amber)' : 'var(--blue)');

  if (!jobs || jobs.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          border: '1px dashed var(--border-mid)',
          background: 'var(--bg-card)',
        }}
      >
        <div
          className="hunt-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            marginBottom: 10,
          }}
        >
          ▲ all caught up
        </div>
        <h3 className="hunt-serif" style={{ fontSize: 24, color: 'var(--text)', marginBottom: 6 }}>
          You've reviewed every match.
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          New drops Mon + Thu at 09:00 IST.
        </p>
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
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '13px 20px',
              borderBottom: '1px solid var(--border)',
              borderLeft: isSelected ? '2px solid var(--blue)' : '2px solid transparent',
              background: isSelected ? 'var(--blue-tint)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Logo block */}
            <div
              style={{
                width: 38,
                height: 38,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'var(--ink)',
                color: 'var(--cream)',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                fontSize: 15,
                position: 'relative',
              }}
            >
              {logoGlyph}
              <div style={{ position: 'absolute', bottom: -1, right: -1, width: 5, height: 5, background: 'var(--blue)' }} />
            </div>

            {/* Job info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 2 }}>
                <span className="hunt-kicker" style={{ fontSize: 9, color: 'var(--text-dim)' }}>
                  {job.company}
                </span>
                {job.posted && (
                  <span className="hunt-mono" style={{ fontSize: 9, color: 'var(--text-faint)' }}>
                    {job.posted}
                  </span>
                )}
              </div>
              <div
                className="hunt-serif"
                style={{
                  fontSize: 15,
                  color: 'var(--text)',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {job.role}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                {[
                  { Icon: Briefcase, val: job.stipend },
                  { Icon: MapPin,    val: job.location },
                  { Icon: Clock,     val: job.duration },
                ].filter(x => x.val).map(({ Icon, val }) => (
                  <div
                    key={val}
                    className="hunt-mono"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-dim)' }}
                  >
                    <Icon size={10} />{val}
                  </div>
                ))}
              </div>
            </div>

            {/* Match score */}
            {matchData && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div
                  className="hunt-serif"
                  style={{ fontSize: 22, lineHeight: 1, color: scoreColor(matchData.score) }}
                >
                  {matchData.score}<span style={{ fontSize: 11 }}>%</span>
                </div>
                <div
                  className="hunt-mono"
                  style={{ fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginTop: 1 }}
                >
                  {matchData.competitionLevel && (
                    <span style={{ color: compColor(matchData.competitionLevel) }}>
                      {matchData.competitionLevel} comp
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Bookmark */}
            <button
              onClick={e => { e.stopPropagation(); onSave?.({ id: job.id, ...job }); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: isSaved ? 'var(--blue)' : 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Bookmark size={13} fill={isSaved ? 'var(--blue)' : 'none'} />
            </button>
          </div>
        );
      })}

      {/* End of feed */}
      <div style={{ padding: '20px 20px', borderTop: '1px solid var(--border)' }}>
        <span
          className="hunt-mono"
          style={{ fontSize: 9.5, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          end of feed · new drops mon + thu @ 09:00 IST
        </span>
      </div>
    </div>
  );
}
