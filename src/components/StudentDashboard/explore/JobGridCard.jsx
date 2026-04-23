// src/components/StudentDashboard/explore/JobGridCard.jsx
import React from 'react';
import { Bookmark, Briefcase, MapPin, Clock } from 'lucide-react';

export function JobGridCard({ job, matchData, isSelected, onClick, isSaved, onSave }) {
  const scoreColor = s => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)';
  const scoreBg    = s => s >= 75 ? 'var(--green-tint)' : s >= 50 ? 'var(--amber-tint)' : 'var(--red-tint)';

  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-card)',
      border: isSelected ? '1.5px solid var(--text)' : '1px solid var(--border)',
      borderRadius: '12px', padding: '18px 20px', cursor: 'pointer',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxShadow: isSelected ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
      position: 'relative',
    }}
    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {/* Bookmark button */}
      <button onClick={e => { e.stopPropagation(); onSave(job); }} style={{
        position: 'absolute', top: '12px', right: '12px',
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        color: isSaved ? 'var(--green)' : 'var(--text-dim)',
        display: 'flex', alignItems: 'center',
      }} title={isSaved ? 'Unsave' : 'Save'}>
        <Bookmark size={14} fill={isSaved ? 'var(--green)' : 'none'} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{job.logo}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '2px' }}>
            {job.company}
          </p>
          <h3 style={{
            fontFamily: "'Editorial New', Georgia, serif",
            fontSize: '15px', fontWeight: 400, color: 'var(--text)',
            lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{job.role}</h3>
        </div>
        {matchData && (
          <div style={{
            flexShrink: 0, fontSize: '13px', fontFamily: "'Editorial New', Georgia, serif",
            padding: '3px 8px', borderRadius: '6px',
            color: scoreColor(matchData.score), background: scoreBg(matchData.score),
          }}>{matchData.score}%</div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
        {[
          { Icon: Briefcase, val: job.stipend },
          { Icon: MapPin,    val: job.location },
          { Icon: Clock,     val: job.duration },
        ].map(({ Icon, val }) => (
          <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon size={11} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{val}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {job.required_skills?.slice(0, 3).map((s, i) => {
            const matched = matchData?.matchedSkills.find(ms => ms.name === s.name);
            return (
              <span key={i} style={{
                fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                border: `1px solid ${matched ? 'var(--green)' : 'var(--border)'}`,
                color: matched ? 'var(--green-text)' : 'var(--text-dim)',
                background: matched ? 'var(--green-tint)' : 'transparent',
              }}>{s.name}</span>
            );
          })}
          {(job.required_skills?.length || 0) > 3 && (
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>+{job.required_skills.length - 3}</span>
          )}
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
          {job.current_applicants}/{job.max_applicants}
        </span>
      </div>
    </div>
  );
}
