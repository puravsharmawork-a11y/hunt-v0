// src/components/StudentDashboard/explore/PersonCard.jsx
import React from 'react';
import { WA_SVG } from '../shared/icons';

export function PersonCard({ person, type, onAction, inviteLink }) {
  const initials = person.name.split(' ').map(n => n[0]).join('');
  const colors = ['#1A7A4A','#0A66C2','#9333EA','#D97706','#DC2626','#0891B2'];
  const color = colors[person.name.charCodeAt(0) % colors.length];

  const statusBadge = {
    on_hunt:     { label: 'On HUNT', bg: 'var(--green-tint)', color: 'var(--green)' },
    invited:     { label: 'Invited', bg: 'var(--amber-tint)', color: 'var(--amber)' },
    not_invited: { label: 'Not yet', bg: 'var(--bg-subtle)', color: 'var(--text-dim)' },
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.name}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.college}</p>
        </div>
        {person.status && statusBadge[person.status] && (
          <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: statusBadge[person.status].bg, color: statusBadge[person.status].color, fontWeight: 600, flexShrink: 0 }}>
            {statusBadge[person.status].label}
          </span>
        )}
      </div>

      {/* Role */}
      <p style={{ fontSize: '11px', color: 'var(--text-mid)' }}>{person.role}</p>

      {/* Skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {person.skills.map(s => (
          <span key={s} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'var(--bg-subtle)' }}>{s}</span>
        ))}
      </div>

      {/* Mutual */}
      {person.mutual > 0 && (
        <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{person.mutual} mutual connection{person.mutual > 1 ? 's' : ''}</p>
      )}
      {person.connections != null && (
        <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{person.connections} connections on HUNT</p>
      )}

      {/* Action button */}
      {type === 'connection' && person.status === 'on_hunt' && (
        <button style={{ padding: '7px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}>
          Message (coming soon)
        </button>
      )}
      {type === 'connection' && person.status === 'not_invited' && (
        <button onClick={() => { const msg = encodeURIComponent(`Hey ${person.name.split(' ')[0]}! I'm using HUNT to find internships — join with my link: ${inviteLink}`); window.open(`https://wa.me/?text=${msg}`, '_blank'); }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px', borderRadius: '7px', border: 'none', background: '#25D366', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
          {WA_SVG} Invite to HUNT
        </button>
      )}
      {type === 'connection' && person.status === 'invited' && (
        <button disabled style={{ padding: '7px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: '11px', cursor: 'default' }}>
          Invite sent ✓
        </button>
      )}
      {type === 'discover' && (
        <button style={{ padding: '7px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}>
          Connect (coming soon)
        </button>
      )}
    </div>
  );
}
