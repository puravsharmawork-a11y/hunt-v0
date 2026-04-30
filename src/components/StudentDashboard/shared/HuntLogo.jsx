// src/components/StudentDashboard/shared/HuntLogo.jsx
// ─── Pixel "H" mark + HUNT wordmark used in sidebar, marquee, footers ────────
import React from 'react';

export function PixelMark({ size = 18, color = 'var(--blue)' }) {
  // 5x5 bitmap "H"
  const on = [
    1,0,0,0,1,
    1,0,0,0,1,
    1,1,1,1,1,
    1,0,0,0,1,
    1,0,0,0,1,
  ];
  const px = Math.max(2, Math.floor(size / 6));
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(5, ${px}px)`,
        gridAutoRows: `${px}px`,
        gap: 1,
      }}
    >
      {on.map((v, i) => (
        <div key={i} style={{ background: v ? color : 'transparent' }} />
      ))}
    </div>
  );
}

export function HuntLogo({ size = 18, color, showWord = true }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        letterSpacing: '0.18em',
        fontSize: size * 0.82,
        color: color || 'var(--ink)',
      }}
    >
      <PixelMark size={size} color={color || 'var(--blue)'} />
      {showWord && <span>HUNT</span>}
    </div>
  );
}
