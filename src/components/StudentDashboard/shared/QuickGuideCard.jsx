// src/components/StudentDashboard/shared/QuickGuideCard.jsx
import React from 'react';
import { X, BookOpen } from 'lucide-react';

export function QuickGuideCard({ onDismiss }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 24px', marginBottom: '20px', position: 'relative' }}>
      <button onClick={onDismiss} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
        <span>Skip</span><X size={13} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '16px' }}>
        <BookOpen size={14} style={{ color: 'var(--green)' }} />
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)' }}>How HUNT works</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { n: '01', t: 'Build profile', d: 'Skills + projects = your signal.' },
          { n: '02', t: 'Explore matches', d: '5 applies/week — make them count.' },
          { n: '03', t: 'Apply with intent', d: 'See your match % before you apply.' },
          { n: '04', t: 'Get shortlisted', d: 'Recruiters see only top 20.' },
        ].map(s => (
          <div key={s.n} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--green)', display: 'block', marginBottom: '3px' }}>{s.n}</span>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>{s.t}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.4 }}>{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
