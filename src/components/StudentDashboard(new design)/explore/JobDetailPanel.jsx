// src/components/StudentDashboard/explore/JobDetailPanel.jsx
import React from 'react';
import {
  Bookmark, Maximize2, Minimize2, X,
  Briefcase, Clock, MapPin, Target, TrendingUp,
  CheckCircle2, ChevronRight,
} from 'lucide-react';

export function JobDetailPanel({
  job, matchData,
  isMaximized, onToggleMaximize,
  onClose,
  onApply, applying, canApply,
  isSaved, onSave,
}) {
  const scoreColor = s => (s >= 75 ? 'var(--blue)' : s >= 50 ? 'var(--amber)' : 'var(--red)');
  const compColor  = c => (c === 'High' ? 'var(--red)' : c === 'Medium' ? 'var(--amber)' : 'var(--blue)');
  const compTint   = c => (c === 'High' ? 'var(--red-tint)' : c === 'Medium' ? 'var(--amber-tint)' : 'var(--blue-tint)');

  const logoGlyph = (job.company || '?').slice(0, 1).toUpperCase();

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-mid)',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-mid)',
          flexShrink: 0,
        }}
      >
        <span className="hunt-kicker hunt-kicker-ink">▲ listing / #{(job.id || '').toString().toUpperCase().slice(0, 8)}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={onToggleMaximize}
            title={isMaximized ? 'Minimize' : 'Maximize'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={() => onSave(job)}
            title={isSaved ? 'Unsave' : 'Save'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isSaved ? 'var(--blue)' : 'var(--text-dim)',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Bookmark size={14} fill={isSaved ? 'var(--blue)' : 'none'} />
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Scroll body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 56,
              height: 56,
              flexShrink: 0,
              background: 'var(--ink)',
              color: 'var(--cream)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              fontSize: 22,
              position: 'relative',
            }}
          >
            {logoGlyph}
            <div
              style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 7,
                height: 7,
                background: 'var(--blue)',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 6 }}>
              {job.company}
              {job.posted && <> · {job.posted}</>}
            </div>
            <h1
              className="hunt-serif"
              style={{
                fontSize: 26,
                color: 'var(--text)',
                lineHeight: 1.15,
                marginBottom: 10,
              }}
            >
              {job.role}
            </h1>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {job.type && <span className="hunt-chip">{job.type}</span>}
              {job.location && <span className="hunt-chip">{job.location}</span>}
            </div>
          </div>
        </div>

        {/* Match block — bordered ink frame, big number */}
        {matchData && (
          <div
            style={{
              border: '1px solid var(--ink)',
              background: 'var(--bg-subtle)',
              padding: '18px 20px',
              marginBottom: 20,
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 12,
              }}
            >
              <div>
                <div className="hunt-kicker" style={{ marginBottom: 4 }}>match score</div>
                <div
                  className="hunt-serif"
                  style={{
                    fontSize: 48,
                    lineHeight: 1,
                    color: scoreColor(matchData.score),
                  }}
                >
                  {matchData.score}
                  <span style={{ fontSize: 22, color: 'var(--text-dim)' }}>%</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="hunt-kicker" style={{ marginBottom: 4 }}>competition</div>
                <div
                  className="hunt-mono"
                  style={{
                    fontSize: 14,
                    color: compColor(matchData.competitionLevel),
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {matchData.competitionLevel}
                </div>
                <div
                  className="hunt-mono"
                  style={{
                    fontSize: 10,
                    color: 'var(--text-dim)',
                    marginTop: 2,
                    letterSpacing: '0.04em',
                  }}
                >
                  {job.current_applicants}/{job.max_applicants} slots
                </div>
              </div>
            </div>
            {/* Big match bar with ticks */}
            <div
              style={{
                position: 'relative',
                height: 12,
                background: 'var(--cream-3)',
                border: '1px solid var(--ink)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: matchData.score + '%',
                  background: scoreColor(matchData.score),
                }}
              />
              {[25, 50, 75].map(t => (
                <div
                  key={t}
                  style={{
                    position: 'absolute',
                    left: t + '%',
                    top: -2,
                    width: 1,
                    height: 16,
                    background: 'var(--ink)',
                    opacity: 0.4,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 6,
              }}
            >
              {[0, 50, 100].map(n => (
                <span
                  key={n}
                  className="hunt-mono"
                  style={{ fontSize: 9.5, color: 'var(--text-dim)' }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            marginBottom: 20,
          }}
        >
          {[
            { Icon: Briefcase, val: job.stipend },
            { Icon: Clock,     val: job.duration },
            { Icon: MapPin,    val: job.location },
            { Icon: Target,    val: `${job.current_applicants}/${job.max_applicants} applied` },
          ]
            .filter(x => x.val)
            .map(({ Icon, val }, i) => (
              <div
                key={i}
                className="hunt-mono"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  fontSize: 11,
                  color: 'var(--text-mid)',
                  letterSpacing: '0.03em',
                }}
              >
                <Icon size={12} style={{ flexShrink: 0 }} />
                {val}
              </div>
            ))}
        </div>

        {/* Competition badge (if matchData) */}
        {matchData?.competitionLevel && (
          <div
            className="hunt-mono"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              marginBottom: 20,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: `1px solid ${compColor(matchData.competitionLevel)}`,
              background: compTint(matchData.competitionLevel),
              color: compColor(matchData.competitionLevel),
            }}
          >
            <TrendingUp size={12} /> {matchData.competitionLevel} competition
          </div>
        )}

        {/* About */}
        {job.description && (
          <Section label="About the role">
            <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.65 }}>
              {job.description}
            </p>
          </Section>
        )}

        {/* Match breakdown */}
        {matchData?.breakdown && (
          <Section label="Match breakdown">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(matchData.breakdown).map(([key, val]) => (
                <div key={key}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      className="hunt-mono"
                      style={{
                        fontSize: 10.5,
                        color: 'var(--text-mid)',
                        letterSpacing: '0.05em',
                        textTransform: 'capitalize',
                      }}
                    >
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span
                      className="hunt-mono"
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--text)',
                      }}
                    >
                      {val}%
                    </span>
                  </div>
                  <div className="hunt-match-bar-track">
                    <div
                      className="hunt-match-bar-fill"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Required skills */}
        {(job.required_skills || []).length > 0 && (
          <Section label="Required skills">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {job.required_skills.map((skill, idx) => {
                const matched = matchData?.matchedSkills?.find(s => s.name === skill.name);
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {matched ? (
                        <CheckCircle2 size={13} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                      ) : (
                        <X size={13} style={{ color: 'var(--red)', flexShrink: 0 }} />
                      )}
                      <span
                        style={{
                          fontSize: 13,
                          color: matched ? 'var(--text)' : 'var(--text-dim)',
                        }}
                      >
                        {skill.name}
                      </span>
                    </div>
                    {matched && skill.level != null && (
                      <span
                        className="hunt-mono"
                        style={{
                          fontSize: 9.5,
                          color: 'var(--text-dim)',
                          letterSpacing: '0.06em',
                        }}
                      >
                        L{matched.studentLevel}/{skill.level}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Skills gap */}
        {matchData?.missingSkills?.length > 0 && (
          <Section label="Skills gap">
            <div
              style={{
                padding: '12px 14px',
                border: '1px solid var(--red)',
                background: 'var(--red-tint)',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {matchData.missingSkills.map((s, i) => (
                  <span
                    key={i}
                    className="hunt-chip hunt-chip-red"
                  >
                    {s.name}
                    {s.level != null && <> (L{s.level})</>}
                  </span>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Nice to have */}
        {(job.nice_to_have || []).length > 0 && (
          <Section label="Nice to have">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {job.nice_to_have.map((s, i) => (
                <span key={i} className="hunt-chip">{s}</span>
              ))}
            </div>
          </Section>
        )}

        {/* Honest caveat */}
        {matchData && (
          <Section label="Honest caveat">
            <div
              style={{
                padding: '12px 14px',
                border: '1px dashed var(--border-mid)',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <div style={{ width: 6, height: 6, background: 'var(--blue)', flexShrink: 0, marginTop: 6 }} />
              <div style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.55 }}>
                <span
                  className="hunt-mono"
                  style={{
                    color: 'var(--text)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontSize: 10,
                  }}
                >
                  Heads up · {' '}
                </span>
                This role has <b>{job.current_applicants}</b> applicants. Top 20 get reviewed.
                Your match puts you in roughly the <b>top {Math.max(1, 100 - Math.floor(matchData.score / 3))}%</b>.
              </div>
            </div>
          </Section>
        )}
      </div>

      {/* Apply CTA footer */}
      <div
        style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--ink)',
          background: 'var(--bg-card)',
          flexShrink: 0,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            className="hunt-mono"
            style={{
              fontSize: 9.5,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}
          >
            {applying ? 'submitting…' : !canApply ? 'weekly cap reached' : 'eligible to apply'}
          </div>
          <div className="hunt-mono" style={{ fontSize: 10.5, color: 'var(--text)' }}>
            {!canApply ? 'next reset Mon 09:00 IST' : "you'll use 1 of your 5 weekly slots"}
          </div>
        </div>
        <button
          onClick={onApply}
          disabled={!canApply || applying}
          className="hunt-btn hunt-btn-primary"
        >
          {applying ? 'Sending…' : !canApply ? 'Limit reached' : <>Apply now <ChevronRight size={12} /></>}
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 10 }}>▲ {label}</div>
      {children}
    </div>
  );
}
