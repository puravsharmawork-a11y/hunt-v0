// src/components/StudentDashboard/explore/FilterPanel.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';

// Master skills list — can be expanded freely without breaking the UI
const ALL_SKILLS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Next.js', 'Vue.js', 'Angular',
  'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Ruby on Rails',
  'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'SQL', 'GraphQL', 'REST APIs',
  'ML', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP', 'Computer Vision',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Linux', 'Git',
  'HTML', 'CSS', 'Tailwind', 'Sass', 'Figma', 'UI/UX',
  'Java', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin',
  'Pandas', 'NumPy', 'Data Analysis', 'Tableau', 'Power BI',
  'SEO', 'Google Ads', 'Meta Ads', 'Content Marketing', 'Email Marketing',
];

function SkillsDropdown({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const filtered = useMemo(() => {
    if (!query) return ALL_SKILLS;
    return ALL_SKILLS.filter(s => s.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '5px 10px', borderRadius: '4px',
          border: '1px solid var(--border)',
          background: selected ? 'var(--bg-subtle)' : 'transparent',
          fontSize: '11px', cursor: 'pointer',
          color: selected ? 'var(--text)' : 'var(--text-mid)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected || 'Select skill'}
        </span>
        <ChevronDown size={12} style={{ flexShrink: 0, opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20,
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          maxHeight: '220px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Search input */}
          <div style={{ position: 'relative', padding: '6px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <Search size={11} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search skills…"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '4px 6px 4px 22px', fontSize: '11px',
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                borderRadius: '4px', outline: 'none', color: 'var(--text)',
              }}
            />
          </div>

          {/* Options */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {selected && (
              <button
                onClick={() => { onSelect(selected); setOpen(false); setQuery(''); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '6px 10px', fontSize: '11px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-dim)', borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Clear selection
              </button>
            )}
            {filtered.length === 0 ? (
              <div style={{ padding: '10px', fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center' }}>
                No skills found
              </div>
            ) : filtered.map(skill => {
              const isSelected = selected === skill;
              return (
                <button
                  key={skill}
                  onClick={() => { onSelect(skill); setOpen(false); setQuery(''); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '6px 10px', fontSize: '11px',
                    background: isSelected ? 'var(--bg-subtle)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: isSelected ? 'var(--text)' : 'var(--text-mid)',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

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

        {/* Skills (now a searchable dropdown) */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Skills</label>
          <SkillsDropdown
            selected={filters.skill}
            onSelect={(s) => onChange('skill', s)}
          />
        </div>
      </div>

      <button onClick={() => onChange('reset')} style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        Clear all filters
      </button>
    </div>
  );
}
