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

  const scoreColor = s => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)';
  const scoreBg    = s => s >= 75 ? 'var(--green-tint)' : s >= 50 ? 'var(--amber-tint)' : 'var(--red-tint)';

  if (!currentJob || currentIndex >= jobs.length) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</p>
        <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '20px', color: 'var(--text)', marginBottom: '6px' }}>All caught up.</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>You've reviewed all current matches.</p>
        <button onClick={() => setCurrentIndex(0)} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '12px', cursor: 'pointer' }}>Review again</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
      <div>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none',
          transform: isDragging ? `translateX(${dragOffset.x}px) rotate(${dragOffset.x * 0.04}deg)` : swipeDir === 'right' ? 'translateX(200px) rotate(8deg)' : swipeDir === 'left' ? 'translateX(-200px) rotate(-8deg)' : 'none',
          opacity: swipeDir ? 0 : 1, transition: swipeDir ? 'transform 0.28s, opacity 0.28s' : 'none',
        }}
          onMouseDown={() => setIsDragging(true)}
          onMouseMove={e => { if (isDragging) setDragOffset({ x: e.movementX * 2, y: 0 }); }}
          onMouseUp={() => {
            if (Math.abs(dragOffset.x) > 100) handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
            setIsDragging(false); setDragOffset({ x: 0, y: 0 });
          }}
          onMouseLeave={() => { setIsDragging(false); setDragOffset({ x: 0, y: 0 }); }}
        >
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>{currentJob.logo}</span>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '2px' }}>{currentJob.company}</p>
                <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)' }}>{currentJob.role}</h3>
              </div>
            </div>
            {matchData && (
              <div style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '14px', fontFamily: "'Editorial New', Georgia, serif", color: scoreColor(matchData.score), background: scoreBg(matchData.score) }}>
                {matchData.score}%
              </div>
            )}
          </div>
          <div style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '12px' }}>{currentJob.description}</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[{ Icon: Briefcase, val: currentJob.stipend }, { Icon: MapPin, val: currentJob.location }].map(({ Icon, val }) => (
                <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icon size={11} style={{ color: 'var(--text-dim)' }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
          <button onClick={() => handleSwipe('left')} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.background = 'var(--red-tint)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}>
            <X size={18} style={{ color: 'var(--red)' }} />
          </button>
          <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>swipe</span>
          <button onClick={() => handleSwipe('right')} disabled={!canApply} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: canApply ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: canApply ? 1 : 0.3 }}
            onMouseEnter={e => { if (canApply) { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-tint)'; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}>
            <Heart size={18} style={{ color: 'var(--green)' }} />
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-dim)', marginTop: '8px' }}>{currentIndex + 1} of {jobs.length}</p>
      </div>

      {/* Breakdown panel */}
      {showBreakdown && matchData && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>Match breakdown</p>
          <div style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '32px', color: scoreColor(matchData.score), marginBottom: '16px' }}>{matchData.score}%</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {Object.entries(matchData.breakdown || {}).map(([key, val]) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-mid)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>{val}%</span>
                </div>
                <div style={{ height: '3px', background: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${val}%`, background: 'var(--green)', borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={() => { onApply(currentJob, matchData); moveToNext(); }} disabled={!canApply || applying} style={{ padding: '11px', borderRadius: '8px', border: 'none', background: 'var(--green)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: (!canApply || applying) ? 0.4 : 1 }}>
              {applying ? 'Submitting…' : 'Apply now'}
            </button>
            <button onClick={moveToNext} style={{ padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: '12px', cursor: 'pointer' }}>Skip for now</button>
          </div>
        </div>
      )}
    </div>
  );
}
