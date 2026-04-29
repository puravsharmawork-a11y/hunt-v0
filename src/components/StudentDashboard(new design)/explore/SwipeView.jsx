// src/components/StudentDashboard/explore/SwipeView.jsx
import React, { useState } from 'react';
import { X, Heart, Briefcase, MapPin } from 'lucide-react';
import { calculateMatchScore } from '../../../services/matching';

export function SwipeView({ jobs, studentProfile, weeklyApplications, onApply, applying, canApply }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [skipped, setSkipped] = useState([]);

  const currentJob = jobs[currentIndex];
  const matchData = currentJob ? calculateMatchScore(studentProfile, currentJob) : null;

  const handleSwipe = (dir) => {
    setSwipeDir(dir);
    setTimeout(() => {
      if (dir === 'right') setShowBreakdown(true);
      else { setSkipped(p => [...p, currentJob.id]); moveToNext(); }
      setSwipeDir(null);
    }, 280);
  };

  const moveToNext = () => {
    setShowBreakdown(false);
    if (currentIndex < jobs.length - 1) setCurrentIndex(i => i + 1);
  };

  const scoreColor = s => (s >= 75 ? 'var(--blue)' : s >= 50 ? 'var(--amber)' : 'var(--red)');

  const logoGlyph = currentJob ? (currentJob.company || '?').slice(0, 1).toUpperCase() : '';

  if (!currentJob || currentIndex >= jobs.length) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          border: '1px dashed var(--border-mid)',
          background: 'var(--bg-card)',
        }}
      >
        <div
          className="hunt-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            marginBottom: 10,
          }}
        >
          ▲ all caught up
        </div>
        <h3 className="hunt-serif" style={{ fontSize: 24, color: 'var(--text)', marginBottom: 6 }}>
          You've reviewed every match.
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
          New drops Mon + Thu at 09:00 IST.
        </p>
        <button
          onClick={() => setCurrentIndex(0)}
          className="hunt-btn hunt-btn-sm hunt-btn-ghost"
        >
          Review again
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
        alignItems: 'start',
      }}
    >
      <div>
        {/* Card */}
        <div
          className="hunt-card"
          style={{
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            transform: isDragging
              ? `translateX(${dragOffset.x}px) rotate(${dragOffset.x * 0.04}deg)`
              : swipeDir === 'right'
              ? 'translateX(200px) rotate(8deg)'
              : swipeDir === 'left'
              ? 'translateX(-200px) rotate(-8deg)'
              : 'none',
            opacity: swipeDir ? 0 : 1,
            transition: swipeDir ? 'transform 0.28s, opacity 0.28s' : 'none',
          }}
          onMouseDown={() => setIsDragging(true)}
          onMouseMove={e => { if (isDragging) setDragOffset({ x: e.movementX * 2, y: 0 }); }}
          onMouseUp={() => {
            if (Math.abs(dragOffset.x) > 100) handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
            setIsDragging(false); setDragOffset({ x: 0, y: 0 });
          }}
          onMouseLeave={() => { setIsDragging(false); setDragOffset({ x: 0, y: 0 }); }}
        >
          <div
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid var(--border-mid)',
              background: 'var(--bg-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  fontSize: 18,
                  position: 'relative',
                }}
              >
                {logoGlyph}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    right: -1,
                    width: 6,
                    height: 6,
                    background: 'var(--blue)',
                  }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 4 }}>
                  {currentJob.company}
                </p>
                <h3
                  className="hunt-serif"
                  style={{
                    fontSize: 17,
                    color: 'var(--text)',
                    lineHeight: 1.15,
                  }}
                >
                  {currentJob.role}
                </h3>
              </div>
            </div>
            {matchData && (
              <div
                style={{ textAlign: 'right', flexShrink: 0 }}
              >
                <div
                  className="hunt-serif"
                  style={{
                    fontSize: 26,
                    lineHeight: 1,
                    color: scoreColor(matchData.score),
                  }}
                >
                  {matchData.score}<span style={{ fontSize: 14 }}>%</span>
                </div>
                <div
                  className="hunt-mono"
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                  }}
                >
                  match
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 12.5, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 14 }}>
              {currentJob.description}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { Icon: Briefcase, val: currentJob.stipend },
                { Icon: MapPin,    val: currentJob.location },
              ]
                .filter(x => x.val)
                .map(({ Icon, val }) => (
                  <div
                    key={val}
                    className="hunt-mono"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 10.5,
                      color: 'var(--text-dim)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <Icon size={11} /> {val}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Action row */}
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <button
            onClick={() => handleSwipe('left')}
            style={{
              width: 48,
              height: 48,
              border: '1px solid var(--ink)',
              background: 'var(--bg-card)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-tint)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; }}
          >
            <X size={18} style={{ color: 'var(--red)' }} />
          </button>
          <span
            className="hunt-mono"
            style={{
              fontSize: 9.5,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}
          >
            swipe
          </span>
          <button
            onClick={() => handleSwipe('right')}
            disabled={!canApply}
            style={{
              width: 48,
              height: 48,
              border: '1px solid var(--ink)',
              background: 'var(--bg-card)',
              cursor: canApply ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canApply ? 1 : 0.3,
              boxShadow: canApply ? '2px 2px 0 0 var(--ink)' : 'none',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => { if (canApply) e.currentTarget.style.background = 'var(--blue-tint)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; }}
          >
            <Heart size={18} style={{ color: 'var(--blue)' }} />
          </button>
        </div>
        <p
          className="hunt-mono"
          style={{
            textAlign: 'center',
            fontSize: 9.5,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            marginTop: 10,
          }}
        >
          {currentIndex + 1} of {jobs.length}
        </p>
      </div>

      {/* Breakdown panel */}
      {showBreakdown && matchData && (
        <div className="hunt-card" style={{ padding: 20 }}>
          <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 8 }}>▲ match breakdown</p>
          <div
            className="hunt-serif"
            style={{
              fontSize: 38,
              lineHeight: 1,
              color: scoreColor(matchData.score),
              marginBottom: 18,
            }}
          >
            {matchData.score}<span style={{ fontSize: 18, color: 'var(--text-dim)' }}>%</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {Object.entries(matchData.breakdown || {}).map(([key, val]) => (
              <div key={key}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 3,
                  }}
                >
                  <span
                    className="hunt-mono"
                    style={{
                      fontSize: 10.5,
                      color: 'var(--text-mid)',
                      letterSpacing: '0.04em',
                      textTransform: 'capitalize',
                    }}
                  >
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span
                    className="hunt-mono"
                    style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}
                  >
                    {val}%
                  </span>
                </div>
                <div className="hunt-match-bar-track">
                  <div className="hunt-match-bar-fill" style={{ width: `${val}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => { onApply(currentJob, matchData); moveToNext(); }}
              disabled={!canApply || applying}
              className="hunt-btn hunt-btn-primary"
            >
              {applying ? 'Submitting…' : 'Apply now'}
            </button>
            <button
              onClick={moveToNext}
              className="hunt-btn hunt-btn-sm hunt-btn-ghost"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
