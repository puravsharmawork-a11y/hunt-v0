// src/components/StudentDashboard/shared/WelcomeCard.jsx
import React from 'react';
import { X } from 'lucide-react';

export function WelcomeCard({ name, completeness, onDismiss }) {
  const firstName = name?.split(' ')[0] || 'there';
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px 28px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '180px', height: '100%', background: 'linear-gradient(135deg, transparent 50%, var(--green-tint) 100%)', pointerEvents: 'none' }} />
      <button onClick={onDismiss} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={15} /></button>
      <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '6px' }}>Welcome to HUNT</p>
      <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '22px', fontWeight: 400, color: 'var(--text)', marginBottom: '8px', lineHeight: 1.2 }}>
        Hey {firstName}, let's find your <em>first internship.</em>
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginBottom: '16px', lineHeight: 1.5, maxWidth: '400px' }}>
        HUNT matches you on skills — not your college name. Fewer applications, stronger shots.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '160px', height: '3px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${completeness}%`, background: completeness >= 80 ? 'var(--green)' : 'var(--amber)', borderRadius: '999px', transition: 'width 0.6s' }} />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Profile {completeness}% complete</span>
      </div>
    </div>
  );
}
