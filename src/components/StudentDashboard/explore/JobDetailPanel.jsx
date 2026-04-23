// src/components/StudentDashboard/explore/JobDetailPanel.jsx
import React from 'react';
import { Bookmark, Maximize2, Minimize2, X, Briefcase, Clock, MapPin, Target, TrendingUp, CheckCircle2, ChevronRight } from 'lucide-react';

export function JobDetailPanel({ job, matchData, isMaximized, onToggleMaximize, onClose, onApply, applying, canApply, isSaved, onSave }) {
  const scoreColor = s => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)';
  const scoreBg    = s => s >= 75 ? 'var(--green-tint)' : s >= 50 ? 'var(--amber-tint)' : 'var(--red-tint)';
  const compColor  = c => c === 'High' ? 'var(--red)' : c === 'Medium' ? 'var(--amber)' : 'var(--green)';
  const compBg     = c => c === 'High' ? 'var(--red-tint)' : c === 'Medium' ? 'var(--amber-tint)' : 'var(--green-tint)';

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Panel toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onToggleMaximize} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title={isMaximized ? 'Minimize' : 'Maximize'}>
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={() => onSave(job)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? 'var(--green)' : 'var(--text-dim)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title={isSaved ? 'Unsave' : 'Save'}>
            <Bookmark size={14} fill={isSaved ? 'var(--green)' : 'none'} />
          </button>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
          <X size={16} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <span style={{ fontSize: '44px', lineHeight: 1, flexShrink: 0 }}>{job.logo}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>
              {job.company}
            </p>
            <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '22px', fontWeight: 400, color: 'var(--text)', lineHeight: 1.2, marginBottom: '6px' }}>
              {job.role}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{job.type}</span>
            </div>
          </div>
          {matchData && (
            <div style={{
              flexShrink: 0, padding: '10px 14px', borderRadius: '10px', textAlign: 'center',
              background: scoreBg(matchData.score),
            }}>
              <div style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '26px', fontWeight: 400, color: scoreColor(matchData.score) }}>{matchData.score}%</div>
              <p style={{ fontSize: '10px', color: scoreColor(matchData.score), opacity: 0.7 }}>match</p>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {[
            { Icon: Briefcase, val: job.stipend },
            { Icon: Clock,     val: job.duration },
            { Icon: MapPin,    val: job.location },
            { Icon: Target,    val: `${job.current_applicants}/${job.max_applicants} applied` },
          ].map(({ Icon, val }) => (
            <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-subtle)' }}>
              <Icon size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'var(--text-mid)' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Competition */}
        {matchData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: 500, background: compBg(matchData.competitionLevel), color: compColor(matchData.competitionLevel) }}>
            <TrendingUp size={13} /> {matchData.competitionLevel} competition
          </div>
        )}

        {/* Description */}
        <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '20px' }}>{job.description}</p>

        {/* Match breakdown */}
        {matchData && (
          <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '10px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '12px' }}>Match breakdown</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(matchData.breakdown || {}).map(([key, val]) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-mid)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>{val}%</span>
                  </div>
                  <div style={{ height: '3px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${val}%`, background: 'var(--green)', borderRadius: '999px', transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required skills */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>Required skills</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {job.required_skills?.map((skill, idx) => {
              const matched = matchData?.matchedSkills.find(s => s.name === skill.name);
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {matched ? <CheckCircle2 size={13} style={{ color: 'var(--green)', flexShrink: 0 }} /> : <X size={13} style={{ color: 'var(--red)', flexShrink: 0 }} />}
                    <span style={{ fontSize: '13px', color: matched ? 'var(--text)' : 'var(--text-dim)' }}>{skill.name}</span>
                  </div>
                  {matched && <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>L{matched.studentLevel}/{skill.level}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills gap */}
        {matchData?.missingSkills.length > 0 && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--red-tint)', border: '1px solid var(--red)', marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--red)', marginBottom: '6px' }}>Skills gap</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {matchData.missingSkills.map((s, i) => (
                <span key={i} style={{ padding: '2px 7px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--red)', color: 'var(--red)' }}>{s.name} (L{s.level})</span>
              ))}
            </div>
          </div>
        )}

        {/* Nice to have */}
        {job.nice_to_have?.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>Nice to have</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {job.nice_to_have.map((s, i) => (
                <span key={i} style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'var(--bg-subtle)' }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply CTA */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={onApply} disabled={!canApply || applying} style={{
          width: '100%', padding: '13px', borderRadius: '8px', border: 'none',
          background: 'var(--green)', color: '#fff', fontSize: '13px', fontWeight: 600,
          cursor: canApply && !applying ? 'pointer' : 'not-allowed',
          opacity: (!canApply || applying) ? 0.5 : 1, transition: 'opacity 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          {applying ? 'Submitting…' : !canApply ? 'Weekly limit reached' : <><span>Apply now</span><ChevronRight size={14} /></>}
        </button>
      </div>
    </div>
  );
}
