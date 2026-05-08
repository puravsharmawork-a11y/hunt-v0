import React from 'react';
import { STATUS_META } from '../constants';

export const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-subtle)',
  color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
};
export function FocusInput({ style, ...props }) {
  return <input {...props} style={{ ...inp, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--text)'}
    onBlur={e  => e.target.style.borderColor = 'var(--border)'} />;
}
export function FocusSelect({ style, children, ...props }) {
  return <select {...props} style={{ ...inp, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--text)'}
    onBlur={e  => e.target.style.borderColor = 'var(--border)'}>{children}</select>;
}
export function FocusTextarea({ style, ...props }) {
  return <textarea {...props} style={{ ...inp, resize: 'vertical', minHeight: 70, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--text)'}
    onBlur={e  => e.target.style.borderColor = 'var(--border)'} />;
}
export function Label({ children, required }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
      {children}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
    </p>
  );
}
export function Toast({ msg, type }) {
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 500,
      background: type === 'error' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)',
      color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: 'fadeDown 0.2s ease',
      maxWidth: '90vw', textAlign: 'center',
    }}>{msg}</div>
  );
}
export function Avatar({ name, avatarUrl, size = 36 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={name} style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
        border: '1px solid var(--border)',
      }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--green-tint)', border: `1px solid var(--green)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 700, color: 'var(--green)', flexShrink: 0,
    }}>{initials}</div>
  );
}

export function CompanyLogo({ name, logoUrl, startupLogoUrl, size = 40 }) {
  const resolvedUrl = startupLogoUrl || logoUrl || null;
  const initials = (name || '').slice(0, 2).toUpperCase() || '?';
  if (resolvedUrl) {
    return (
      <img src={resolvedUrl} alt={name} style={{
        width: size, height: size, borderRadius: 8, objectFit: 'cover', flexShrink: 0,
        border: '1px solid var(--border)',
      }}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: 'var(--bg-subtle)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 700, color: 'var(--text-mid)',
      fontFamily: 'inherit', letterSpacing: '0.04em',
    }}>{initials}</div>
  );
}

export function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{
      fontSize: 9, padding: '3px 8px', borderRadius: 8, fontWeight: 500,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>{m.label}</span>
  );
}
export function EmptyState({ icon = '🎯', title, message, cta }) {
  return (
    <div style={{
      textAlign: 'center', padding: '64px 24px',
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
    }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
      <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', marginBottom: 6, fontWeight: 400 }}>{title}</p>
      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: cta ? 18 : 0, lineHeight: 1.5 }}>{message}</p>
      {cta}
    </div>
  );
}
export function ScoreNumber({ score, size = 16 }) {
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
  return <span style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: size, color, lineHeight: 1, fontWeight: 400 }}>{score}%</span>;
}

export function HuntScoreBadge({ score }) {
  if (!score && score !== 0) return null;
  const level = score >= 80 ? 'elite' : score >= 60 ? 'strong' : score >= 40 ? 'building' : 'starter';
  const colors = { elite: 'var(--purple)', strong: 'var(--blue)', building: 'var(--amber)', starter: 'var(--text-dim)' };
  const tints = { elite: 'var(--purple-tint)', strong: 'var(--blue-tint)', building: 'var(--amber-tint)', starter: 'var(--bg-subtle)' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
      borderRadius: 6, background: tints[level], border: `1px solid ${colors[level]}`,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: colors[level], textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hunt</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: colors[level] }}>{score}</span>
    </div>
  );
}

export function btnPrimary(disabled) {
  return {
    padding: '10px 16px', borderRadius: 8, border: 'none',
    background: disabled ? 'var(--text-dim)' : 'var(--text)', color: 'var(--bg)',
    fontSize: 12, fontWeight: 500, cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'opacity 0.15s',
  };
}
export function btnGhost() {
  return {
    padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text-mid)',
    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'border-color 0.15s, color 0.15s',
  };
}
export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>{eyebrow}</p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 8, lineHeight: 1.5, maxWidth: 560 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0, marginTop: 4 }}>{action}</div>}
    </div>
  );
}
export function SubTabStrip({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 22 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '10px 18px', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
          background: 'transparent', border: 'none',
          borderBottom: `2px solid ${active === t.id ? 'var(--text)' : 'transparent'}`,
          color: active === t.id ? 'var(--text)' : 'var(--text-dim)',
          fontWeight: active === t.id ? 600 : 400, marginBottom: -1,
          transition: 'color 0.15s, border-color 0.15s', whiteSpace: 'nowrap',
        }}>{t.label}</button>
      ))}
    </div>
  );
}
export const linkChip = {
  display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-mid)',
  padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', textDecoration: 'none',
};
export const iconBtn = {
  padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  transition: 'border-color 0.15s, color 0.15s',
};

// ═══════════════════════════════════════════════════════════════════════════
// CONFIRM DIALOG
