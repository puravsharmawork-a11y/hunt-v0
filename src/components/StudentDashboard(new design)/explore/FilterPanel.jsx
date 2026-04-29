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
        className="hunt-mono"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          border: '1px solid var(--border-mid)',
          background: selected ? 'var(--bg-subtle)' : 'transparent',
          fontSize: 11,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          color: selected ? 'var(--text)' : 'var(--text-mid)',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {selected || 'Select skill'}
        </span>
        <ChevronDown
          size={12}
          style={{
            flexShrink: 0,
            opacity: 0.6,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 20,
            background: 'var(--bg-card)',
            border: '1px solid var(--ink)',
            boxShadow: '4px 4px 0 0 var(--ink)',
            maxHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Search input */}
          <div
            style={{
              position: 'relative',
              padding: 6,
              borderBottom: '1px solid var(--border-mid)',
              flexShrink: 0,
            }}
          >
            <Search
              size={11}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
              }}
            />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search skills…"
              className="hunt-mono"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '5px 6px 5px 22px',
                fontSize: 11,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-mid)',
                outline: 'none',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Options */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {selected && (
              <button
                onClick={() => { onSelect(selected); setOpen(false); setQuery(''); }}
                className="hunt-mono"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 10px',
                  fontSize: 10.5,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-dim)',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Clear selection
              </button>
            )}
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: 12,
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  textAlign: 'center',
                }}
              >
                No skills found
              </div>
            ) : (
              filtered.map(skill => {
                const isSelected = selected === skill;
                return (
                  <button
                    key={skill}
                    onClick={() => { onSelect(skill); setOpen(false); setQuery(''); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 10px',
                      fontSize: 12,
                      background: isSelected ? 'var(--bg-subtle)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: isSelected ? 'var(--text)' : 'var(--text-mid)',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {skill}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="hunt-mono"
      style={{
        padding: '4px 9px',
        border: '1px solid ' + (active ? 'var(--ink)' : 'var(--border-mid)'),
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--cream)' : 'var(--text-mid)',
        fontSize: 10.5,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export function FilterPanel({ filters, onChange, onClose, jobs }) {
  const activeCount = Object.values(filters).filter(v => v && v !== 'Any' && v !== 0 && v !== '').length;

  return (
    <div
      className="hunt-card"
      style={{
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <span className="hunt-kicker hunt-kicker-ink">
          ▲ filters / {activeCount} active
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-dim)',
            padding: 4,
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 12 }}>
        {/* Role */}
        <div>
          <div className="hunt-kicker" style={{ marginBottom: 8 }}>Role type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['Full Stack', 'Backend', 'Frontend', 'ML / AI', 'DevOps', 'Data', 'Design', 'Marketing'].map(r => (
              <Pill key={r} active={filters.role === r} onClick={() => onChange('role', r)}>{r}</Pill>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="hunt-kicker" style={{ marginBottom: 8 }}>Location</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['Remote', 'Hybrid', 'On-site'].map(l => (
              <Pill key={l} active={filters.location === l} onClick={() => onChange('location', l)}>{l}</Pill>
            ))}
          </div>
        </div>

        {/* Min match */}
        <div>
          <div className="hunt-kicker" style={{ marginBottom: 8 }}>
            Min match · <span style={{ color: 'var(--blue)' }}>{filters.minMatch}%</span>
          </div>
          <input
            type="range"
            className="hunt-range"
            min={0}
            max={100}
            step={5}
            value={filters.minMatch}
            onChange={e => onChange('minMatch', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Stipend */}
        <div>
          <div className="hunt-kicker" style={{ marginBottom: 8 }}>Stipend</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['Any', '10k+', '20k+', '30k+'].map(s => (
              <Pill key={s} active={filters.stipend === s} onClick={() => onChange('stipend', s)}>{s}</Pill>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <div className="hunt-kicker" style={{ marginBottom: 8 }}>Duration</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['Any', '1-3 months', '3-6 months', '6+ months'].map(d => (
              <Pill key={d} active={filters.duration === d} onClick={() => onChange('duration', d)}>{d}</Pill>
            ))}
          </div>
        </div>

        {/* Skills (dropdown) */}
        <div>
          <div className="hunt-kicker" style={{ marginBottom: 8 }}>Skills</div>
          <SkillsDropdown
            selected={filters.skill}
            onSelect={(s) => onChange('skill', s)}
          />
        </div>
      </div>

      <button
        onClick={() => onChange('reset')}
        className="hunt-mono"
        style={{
          fontSize: 10.5,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-dim)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textDecoration: 'underline',
          padding: 0,
        }}
      >
        Clear all
      </button>
    </div>
  );
}
