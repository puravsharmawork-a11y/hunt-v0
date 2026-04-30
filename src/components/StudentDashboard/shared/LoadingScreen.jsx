// src/components/StudentDashboard/shared/LoadingScreen.jsx
import React, { useState, useEffect } from 'react';
import { PixelMark } from './HuntLogo';

export function LoadingScreen() {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="hunt-bitmap-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <PixelMark size={40} color="var(--blue)" />
        </div>
        <div
          className="hunt-mono"
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '0.22em',
            color: 'var(--text)',
            marginBottom: 22,
          }}
        >
          HUNT
        </div>
        {/* Square pixel dots, no rounded corners */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                background: 'var(--blue)',
                opacity: dots > i ? 1 : 0.18,
                transition: 'opacity 0.3s',
              }}
            />
          ))}
        </div>
        <p
          className="hunt-mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
          }}
        >
          ▲ finding your opportunities
        </p>
      </div>
    </div>
  );
}
