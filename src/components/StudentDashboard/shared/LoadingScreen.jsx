// src/components/StudentDashboard/shared/LoadingScreen.jsx
import React, { useState, useEffect } from 'react';

export function LoadingScreen() {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '0.18em', color: 'var(--text)', marginBottom: '20px' }}>HUNT</div>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', opacity: dots > i ? 1 : 0.2, transition: 'opacity 0.3s' }} />
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Finding your opportunities…</p>
      </div>
    </div>
  );
}
