// src/components/StudentDashboard/explore/FilterPanel.jsx
import React from 'react';
import { X } from 'lucide-react';

export function FilterPanel({ filters, onChange, onClose, jobs }) {
  const roles = [...new Set(jobs.map(j => j.role?.split(' ').slice(-1)[0]).filter(Boolean))];
  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))];

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>Filters</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={14} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {/* Role type */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Role type</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['Full Stack', 'Backend', 'Frontend', 'ML / AI', 'DevOps', 'Data', 'Design', 'Marketing'].map(r => (
              <button key={r} onClick={() => onChange('role', r)}
                style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer', background: filters.role === r ? 'var(--text)' : 'transparent', color: filters.role === r ? 'var(--bg)' : 'var(--text-mid)' }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Location</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['Remote', 'Hybrid', 'On-site'].map(l => (
              <button key={l} onClick={() => onChange('location', l)}
                style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer', background: filters.location === l ? 'var(--text)' : 'transparent', color: filters.location === l ? 'var(--bg)' : 'var(--text-mid)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Match % */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
            Min match: <span style={{ color: 'var(--green)' }}>{filters.minMatch}%</span>
          </label>
          <input type="range" min={0} max={100} step={5} value={filters.minMatch}
            onChange={e => onChange('minMatch', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--green)' }} />
        </div>

        {/* Stipend */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Stipend</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['Any', '10k+', '20k+', '30k+'].map(s => (
              <button key={s} onClick={() => onChange('stipend', s)}
                style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer', background: filters.stipend === s ? 'var(--text)' : 'transparent', color: filters.stipend === s ? 'var(--bg)' : 'var(--text-mid)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Duration</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['Any', '1-3 months', '3-6 months', '6+ months'].map(d => (
              <button key={d} onClick={() => onChange('duration', d)}
                style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer', background: filters.duration === d ? 'var(--text)' : 'transparent', color: filters.duration === d ? 'var(--bg)' : 'var(--text-mid)' }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Skills</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['React', 'Node.js', 'Python', 'ML', 'Docker', 'AWS'].map(s => (
              <button key={s} onClick={() => onChange('skill', s)}
                style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '11px', cursor: 'pointer', background: filters.skill === s ? 'var(--text)' : 'transparent', color: filters.skill === s ? 'var(--bg)' : 'var(--text-mid)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => onChange('reset')} style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        Clear all filters
      </button>
    </div>
  );
}
