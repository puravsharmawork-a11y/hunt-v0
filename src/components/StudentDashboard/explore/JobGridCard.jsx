// src/components/StudentDashboard/explore/JobGridCard.jsx
import React from 'react';
import { Bookmark, Briefcase, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export function JobGridCard({ job, matchData, isSelected, onClick, isSaved, onSave, isApplied }) {
  const scoreColor = s => (s >= 75 ? 'var(--blue)' : s >= 50 ? 'var(--amber)' : 'var(--red)');
  const compColor  = c => (c === 'High' ? 'var(--red)' : c === 'Medium' ? 'var(--amber)' : 'var(--blue)');

  const logoGlyph = (job.company || '?').slice(0, 1).toUpperCase();

  return (
    <div
      onClick={onClick}
      className="hunt-card"
      style={{
        padding: '18px 20px',
        cursor: 'pointer',
        position: 'relative',
        // Applied glow border overrides selection border
        borderColor: isApplied ? 'var(--blue)' : isSelected ? 'var(--ink)' : 'var(--border-mid)',
        boxShadow: isApplied
          ? '0 0 0 1px var(--blue), 0 2px 8px rgba(0,0,0,0.1)'
          : isSelected
          ? '4px 4px 0 0 var(--ink)'
          : 'none',
        transform: isSelected && !isApplied ? 'translate(-2px,-2px)' : 'none',
        transition: 'transform 0.12s, box-shadow 0.12s, border-color 0.12s',
        background: isApplied ? 'var(--blue-tint)' : 'var(--bg-card)',
      }}
      onMouseEnter={e => {
        if (!isSelected && !isApplied) e.currentTarget.style.borderColor = 'var(--ink)';
      }}
      onMouseLeave={e => {
        if (!isSelected && !isApplied) e.currentTarget.style.borderColor = 'var(--border-mid)';
      }}
    >
      {/* Applied ribbon — top-right corner */}
      {isApplied && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: '3px 8px',
            background: 'var(--blue)',
            color: 'var(--cream)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <CheckCircle2 size={9} />
          Applied
        </div>
      )}

      {/* Header: logo block + match % + bookmark */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 42, height: 42, flexShrink: 0,
            display: 'grid', placeItems: 'center',
            background: isApplied ? 'var(--blue)' : 'var(--ink)',
            color: 'var(--cream)',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600, fontSize: 16, letterSpacing: '0.04em',
            position: 'relative',
          }}
        >
          {logoGlyph}
          <div style={{ position: 'absolute', bottom: -1, right: -1, width: 5, height: 5, background: isApplied ? 'var(--cream)' : 'var(--blue)' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span className="hunt-kicker hunt-kicker-ink" style={{ fontSize: 9.5 }}>
              {job.company}
            </span>
            {job.posted && (
              <>
                <span style={{ width: 3, height: 3, background: 'var(--text-faint)' }} />
                <span className="hunt-mono" style={{ fontSize: 9.5, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                  {job.posted}
                </span>
              </>
            )}
          </div>
          <h3
            className="hunt-serif"
            style={{
              fontSize: 17, color: 'var(--text)', lineHeight: 1.15,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}
          >
            {job.role}
          </h3>
        </div>

        {/* Right: match score + bookmark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); onSave(job); }}
            title={isSaved ? 'Unsave' : 'Save'}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer',
              padding: 2,
              color: isSaved ? 'var(--blue)' : 'var(--text-dim)',
              display: 'flex', alignItems: 'center',
            }}
          >
            <Bookmark size={14} fill={isSaved ? 'var(--blue)' : 'none'} />
          </button>
          {matchData && (
            <div style={{ textAlign: 'right' }}>
              <div className="hunt-serif" style={{ fontSize: 26, lineHeight: 1, color: scoreColor(matchData.score) }}>
                {matchData.score}
                <span style={{ fontSize: 13 }}>%</span>
              </div>
              <div className="hunt-mono" style={{ fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                match
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match bar */}
      {matchData && (
        <div className="hunt-match-bar-track" style={{ marginBottom: 14 }}>
          <div
            className="hunt-match-bar-fill"
            style={{
              width: matchData.score + '%',
              background: isApplied ? 'var(--blue)' : scoreColor(matchData.score),
            }}
          />
        </div>
      )}

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        {[
          { Icon: Briefcase, val: job.stipend },
          { Icon: MapPin,    val: job.location },
          { Icon: Clock,     val: job.duration },
        ]
          .filter(x => x.val)
          .map(({ Icon, val }) => (
            <div
              key={val}
              className="hunt-mono"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 10.5, color: 'var(--text-mid)', letterSpacing: '0.03em',
              }}
            >
              <Icon size={11} style={{ flexShrink: 0 }} />
              {val}
            </div>
          ))}
      </div>

      {/* Skills chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {(job.required_skills || []).slice(0, 5).map((s, i) => {
          const matched = matchData?.matchedSkills?.find(ms => ms.name === s.name);
          return (
            <span
              key={i}
              className={'hunt-chip ' + (matched ? 'hunt-chip-blue-tint' : '')}
            >
              {matched && <span style={{ fontSize: 9 }}>●</span>} {s.name}
            </span>
          );
        })}
        {(job.required_skills?.length || 0) > 5 && (
          <span className="hunt-mono" style={{ fontSize: 10, color: 'var(--text-dim)', alignSelf: 'center', letterSpacing: '0.06em' }}>
            +{job.required_skills.length - 5}
          </span>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 10, borderTop: '1px solid var(--border)',
        }}
      >
        <div className="hunt-mono" style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--text-dim)' }}>
          {isApplied ? (
            <span style={{ color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={10} /> Application submitted
            </span>
          ) : (
            <>
              {job.current_applicants}
              <span style={{ color: 'var(--text-faint)' }}>/{job.max_applicants}</span> applicants
              {matchData?.competitionLevel && (
                <>
                  {' · '}
                  <span style={{ color: compColor(matchData.competitionLevel) }}>
                    {matchData.competitionLevel} comp
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
