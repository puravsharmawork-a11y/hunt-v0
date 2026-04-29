// src/components/StudentDashboard/explore/PersonCard.jsx
import React from 'react';
import { WA_SVG } from '../shared/icons';

export function PersonCard({ person, type, onAction, inviteLink }) {
  const initials = person.name.split(' ').map(n => n[0]).join('');

  const statusBadge = {
    on_hunt:     { label: 'On HUNT',   className: 'hunt-chip-blue-tint' },
    invited:     { label: 'Invited',   className: 'hunt-chip-amber' },
    not_invited: { label: 'Not yet',   className: 'hunt-chip' },
  };

  return (
    <div
      className="hunt-card"
      style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            background: 'var(--ink)',
            color: 'var(--cream)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {person.name}
          </p>
          <p
            className="hunt-mono"
            style={{
              fontSize: 9.5,
              color: 'var(--text-dim)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {person.college}
          </p>
        </div>
        {person.status && statusBadge[person.status] && (
          <span
            className={'hunt-chip ' + (statusBadge[person.status].className || '')}
            style={{ flexShrink: 0 }}
          >
            {statusBadge[person.status].label}
          </span>
        )}
      </div>

      {/* Role */}
      <p style={{ fontSize: 12, color: 'var(--text-mid)' }}>{person.role}</p>

      {/* Skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {person.skills.map(s => (
          <span
            key={s}
            className="hunt-chip"
            style={{ fontSize: 10, padding: '2px 6px' }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Mutual / connections */}
      {person.mutual > 0 && (
        <p
          className="hunt-mono"
          style={{
            fontSize: 10,
            color: 'var(--text-dim)',
            letterSpacing: '0.04em',
          }}
        >
          {person.mutual} mutual connection{person.mutual > 1 ? 's' : ''}
        </p>
      )}
      {person.connections != null && (
        <p
          className="hunt-mono"
          style={{
            fontSize: 10,
            color: 'var(--text-dim)',
            letterSpacing: '0.04em',
          }}
        >
          {person.connections} connections on HUNT
        </p>
      )}

      {/* Action button */}
      {type === 'connection' && person.status === 'on_hunt' && (
        <button className="hunt-btn hunt-btn-sm hunt-btn-ghost" style={{ width: '100%' }}>
          Message (soon)
        </button>
      )}
      {type === 'connection' && person.status === 'not_invited' && (
        <button
          onClick={() => {
            const msg = encodeURIComponent(`Hey ${person.name.split(' ')[0]}! I'm using HUNT to find internships — join with my link: ${inviteLink}`);
            window.open(`https://wa.me/?text=${msg}`, '_blank');
          }}
          className="hunt-btn hunt-btn-sm"
          style={{
            width: '100%',
            background: '#25D366',
            color: '#fff',
            borderColor: '#25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {WA_SVG} Invite to HUNT
        </button>
      )}
      {type === 'connection' && person.status === 'invited' && (
        <button disabled className="hunt-btn hunt-btn-sm hunt-btn-ghost" style={{ width: '100%' }}>
          Invite sent ✓
        </button>
      )}
      {type === 'discover' && (
        <button className="hunt-btn hunt-btn-sm hunt-btn-ghost" style={{ width: '100%' }}>
          Connect (soon)
        </button>
      )}
    </div>
  );
}
