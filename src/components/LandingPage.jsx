// src/components/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { signInWithGoogle } from '../services/supabase';

const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="currentColor" opacity=".9"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="currentColor" opacity=".9"/>
    <path d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706 0-.59.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9c0 1.45.348 2.826.957 4.038l3.007-2.332z" fill="currentColor" opacity=".9"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z" fill="currentColor" opacity=".9"/>
  </svg>
);

const CheckIcon = () => (
  <svg style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }} viewBox="0 0 20 20" fill="none" stroke="#1A7A4A" strokeWidth="1.5">
    <circle cx="10" cy="10" r="8"/>
    <path d="M6.5 10l3 3 4-5"/>
  </svg>
);

const CrossIcon = () => (
  <svg style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }} viewBox="0 0 20 20" fill="none" stroke="#9B9B97" strokeWidth="1.5">
    <circle cx="10" cy="10" r="8"/>
    <path d="M13 7l-6 6M7 7l6 6"/>
  </svg>
);

const t = {
  black:      '#0A0A0A',
  white:      '#FAFAF8',
  gray50:     '#F5F5F2',
  gray100:    '#EBEBEA',
  gray400:    '#9B9B97',
  gray600:    '#5A5A56',
  green:      '#1A7A4A',
  greenLight: '#E8F5EE',
  serif:      "'Editorial New', Georgia, serif",
  sans:       "'DM Sans', system-ui, sans-serif",
  ember:      '#D85A30',
  emberDim:   'rgba(216,90,48,0.15)',
  emberBorder:'rgba(216,90,48,0.35)',
  s_bg:       '#0C0B09',
  s_surface:  '#131210',
  s_border:   'rgba(255,255,255,0.08)',
  s_muted:    'rgba(255,255,255,0.45)',
  s_body:     'rgba(255,255,255,0.72)',
};

const btnPrimary = {
  display:        'inline-flex',
  alignItems:     'center',
  gap:            10,
  background:     t.black,
  color:          t.white,
  padding:        '14px 28px',
  borderRadius:   6,
  fontSize:       14,
  fontWeight:     400,
  cursor:         'pointer',
  border:         'none',
  fontFamily:     t.sans,
  transition:     'opacity 0.15s',
};

// ─────────────────────────────────────────────────────────────────────────────
// PHONE HERO  (student side — unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function PhoneHero() {
  useEffect(() => {
    const scenes = [
      [
        { text: "What if you knew\nyour chances ", style: "color:#e0e0e0;font-size:20px;font-family:monospace;line-height:1.7;" },
        { text: "BEFORE", style: "color:#4ade80;font-size:20px;font-family:monospace;font-weight:700;line-height:1.7;" },
        { text: "\napplying for an\ninternship?", style: "color:#e0e0e0;font-size:20px;font-family:monospace;line-height:1.7;" },
      ],
      [
        { text: "Still hunting\ninternships in 2026\nthe old way?", style: "color:#888;font-size:19px;font-family:monospace;line-height:1.7;" },
        { text: "\n\n😅", style: "color:#e0e0e0;font-size:26px;font-family:monospace;" },
      ],
      [
        { text: "Open\n", style: "color:#888;font-size:19px;font-family:monospace;line-height:1.8;" },
        { text: "HUNT", style: "color:#4ade80;font-size:30px;font-family:monospace;font-weight:700;letter-spacing:3px;" },
      ],
      [
        { text: "→ complete your\n  profile\n", style: "color:#e0e0e0;font-size:18px;font-family:monospace;line-height:1.8;" },
        { text: "\n(only takes 2 min\nor less, seriously)", style: "color:#555;font-size:15px;font-family:monospace;line-height:1.7;" },
      ],
      [
        { text: "→ swipe on\n  internships\n\n", style: "color:#e0e0e0;font-size:18px;font-family:monospace;line-height:1.8;" },
        { text: "left = nope\n", style: "color:#888;font-size:16px;font-family:monospace;line-height:1.8;" },
        { text: "right = ", style: "color:#888;font-size:16px;font-family:monospace;line-height:1.8;" },
        { text: "let's go", style: "color:#4ade80;font-size:16px;font-family:monospace;font-weight:700;line-height:1.8;" },
      ],
      [
        { text: "that's it.\n", style: "color:#e0e0e0;font-size:22px;font-family:monospace;font-weight:700;line-height:1.8;" },
        { text: "\nso easy\nand fast.", style: "color:#666;font-size:18px;font-family:monospace;line-height:1.8;" },
      ],
      [
        { text: "right now ", style: "color:#888;font-size:17px;font-family:monospace;line-height:1.8;" },
        { text: "v0\n", style: "color:#4ade80;font-size:17px;font-family:monospace;font-weight:700;line-height:1.8;" },
        { text: "\nonly for cs students\n", style: "color:#888;font-size:17px;font-family:monospace;line-height:1.8;" },
        { text: "with actual skills.", style: "color:#4ade80;font-size:17px;font-family:monospace;font-weight:700;line-height:1.8;" },
      ],
      [
        { text: "your jee rank\ndoesn't live here.\n", style: "color:#555;font-size:16px;font-family:monospace;line-height:1.9;" },
        { text: "\nyour\n", style: "color:#888;font-size:16px;font-family:monospace;line-height:1.9;" },
        { text: "github / projects\n", style: "color:#4ade80;font-size:16px;font-family:monospace;font-weight:700;line-height:1.9;" },
        { text: "does.\n", style: "color:#888;font-size:16px;font-family:monospace;line-height:1.9;" },
        { text: "\ntry it.\n", style: "color:#666;font-size:15px;font-family:monospace;line-height:1.9;" },
        { text: "roast it.\n", style: "color:#666;font-size:15px;font-family:monospace;line-height:1.9;" },
        { text: "↗", style: "color:#4ade80;font-size:15px;font-family:monospace;" },
      ],
    ];

    const SCENE_DURATIONS = [3200, 2800, 2600, 3200, 3200, 2600, 3200, 99999];
    const CHAR_DELAY = 36;
    const screen = document.getElementById('hunt-phone-screen');
    if (!screen) return;

    let stopped = false;
    let typeTimer = null;
    let sceneTimer = null;
    let currentScene = 0;

    function typeScene(idx) {
      if (stopped) return;
      screen.innerHTML = '';
      const parts = scenes[idx];
      const container = document.createElement('div');
      screen.appendChild(container);

      const spans = parts.map(p => {
        const sp = document.createElement('span');
        sp.style.cssText = p.style + 'white-space:pre-wrap;';
        container.appendChild(sp);
        return { el: sp, text: p.text };
      });

      let partIdx = 0, charIdx = 0;

      function tick() {
        if (stopped) return;
        if (partIdx >= spans.length) {
          sceneTimer = setTimeout(() => {
            if (currentScene < scenes.length - 1) {
              screen.style.transition = 'opacity 0.4s';
              screen.style.opacity = '0';
              setTimeout(() => {
                if (stopped) return;
                screen.style.opacity = '1';
                currentScene++;
                typeScene(currentScene);
              }, 420);
            }
          }, SCENE_DURATIONS[idx]);
          return;
        }
        const cur = spans[partIdx];
        if (charIdx < cur.text.length) {
          cur.el.textContent += cur.text[charIdx];
          charIdx++;
          typeTimer = setTimeout(tick, CHAR_DELAY);
        } else {
          partIdx++;
          charIdx = 0;
          typeTimer = setTimeout(tick, CHAR_DELAY);
        }
      }
      tick();
    }

    const startTimer = setTimeout(() => typeScene(0), 600);
    return () => {
      stopped = true;
      clearTimeout(typeTimer);
      clearTimeout(sceneTimer);
      clearTimeout(startTimer);
    };
  }, []);

  return (
    <div style={{ flexShrink: 0, width: '300px', height: '530px', pointerEvents: 'none', alignSelf: 'center' }}>
      <div style={{
        background: '#111',
        borderRadius: '44px',
        padding: '10px',
        boxShadow: '0 0 0 1px #333, 0 0 0 2px #222, 0 32px 64px rgba(0,0,0,0.22)',
        width: '300px',
        height: '530px',
      }}>
        <div style={{ background: '#000', borderRadius: '36px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#000', padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '80px', height: '6px', background: '#1a1a1a', borderRadius: '3px' }} />
          </div>
          <div
            id="hunt-phone-screen"
            style={{ flex: 1, padding: '24px 20px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          />
          <div style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100px', height: '4px', background: '#333', borderRadius: '2px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECRUITER CANDIDATE STACK VISUAL (mirrors PhoneHero for startup side)
// ─────────────────────────────────────────────────────────────────────────────
function CandidateStackHero() {
  const [activeIdx, setActiveIdx] = useState(0);

  const candidates = [
    {
      initials: 'RK',
      color: '#D85A30',
      name: 'Rahul Kumar',
      college: 'LNMIIT, Jaipur',
      score: 91,
      skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      project: 'E-comm Analytics Dashboard',
      projectDetail: 'React + Node · Live on GitHub',
    },
    {
      initials: 'PS',
      color: '#1A7A4A',
      name: 'Priya Sharma',
      college: 'VJTI Mumbai',
      score: 87,
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis'],
      project: 'ML Price Predictor',
      projectDetail: 'Python + Flask · Deployed on Render',
    },
    {
      initials: 'AM',
      color: '#4A6FD8',
      name: 'Arjun Mehta',
      college: 'PES University',
      score: 82,
      skills: ['React', 'TypeScript', 'GraphQL'],
      project: 'Open-source UI Library',
      projectDetail: '340 GitHub stars · Actively maintained',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % candidates.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const c = candidates[activeIdx];
  const scoreColor = c.score >= 85 ? t.ember : c.score >= 75 ? '#C9A227' : '#4A6FD8';

  return (
    <div style={{ flexShrink: 0, width: '340px', alignSelf: 'center', position: 'relative' }}>
      {/* Stack shadows behind */}
      <div style={{
        position: 'absolute', top: 18, left: 12, right: 12, bottom: -8,
        background: '#1e1c18', borderRadius: 16, border: `1px solid ${t.s_border}`,
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', top: 9, left: 6, right: 6, bottom: -4,
        background: '#191714', borderRadius: 16, border: `1px solid ${t.s_border}`,
        zIndex: 1,
      }} />

      {/* Main card */}
      <div key={activeIdx} style={{
        position: 'relative', zIndex: 2,
        background: '#111008',
        borderRadius: 16,
        border: `1px solid rgba(255,255,255,0.12)`,
        padding: '28px 28px 24px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'huntCardIn 0.4s cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: c.color + '22',
              border: `1.5px solid ${c.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 600, color: c.color, fontFamily: t.sans, flexShrink: 0,
            }}>
              {c.initials}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.2, fontFamily: t.sans }}>{c.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3, fontFamily: t.sans }}>{c.college}</div>
            </div>
          </div>
          {/* Score badge */}
          <div style={{
            background: scoreColor + '18',
            border: `1.5px solid ${scoreColor}55`,
            borderRadius: 24,
            padding: '6px 14px',
            fontSize: 17,
            fontWeight: 700,
            color: scoreColor,
            fontFamily: t.sans,
            letterSpacing: '-0.01em',
            flexShrink: 0,
          }}>
            {c.score}%
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 16 }} />

        {/* Skills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
          {c.skills.map((sk, i) => (
            <span key={i} style={{
              fontSize: 12, padding: '5px 11px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, color: 'rgba(255,255,255,0.72)',
              fontFamily: t.sans,
            }}>{sk}</span>
          ))}
        </div>

        {/* Project */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: '13px 16px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 4, fontFamily: t.sans }}>{c.project}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontFamily: t.sans }}>{c.projectDetail}</div>
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 20 }}>
        {candidates.map((_, i) => (
          <div key={i} style={{
            width: i === activeIdx ? 20 : 6,
            height: 6, borderRadius: 3,
            background: i === activeIdx ? t.ember : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      <style>{`
        @keyframes huntCardIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STARTUP PAGE
// ─────────────────────────────────────────────────────────────────────────────
function StartupPage() {
  const Label = ({ children }) => (
    <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.ember, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 16, height: 1, background: t.ember, display: 'inline-block' }} />
      {children}
    </div>
  );

  return (
    <div style={{ background: t.s_bg, color: '#fff', fontFamily: t.sans, WebkitFontSmoothing: 'antialiased', paddingBottom: 120 }}>

      {/* ── HERO ── */}
      <section style={{
        padding: 'clamp(60px,8vw,100px) clamp(20px,4vw,48px) 80px',
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 48,
        minHeight: 'calc(100vh - 65px)',
      }}>
        {/* Left copy */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* live pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${t.emberBorder}`, borderRadius: 20, padding: '5px 14px', marginBottom: 36 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.ember, animation: 'huntPulse 2s infinite', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.ember }}>Early access · Invite only</span>
          </div>

          <h1 style={{ fontFamily: t.serif, fontSize: 'clamp(52px,6vw,88px)', fontWeight: 400, lineHeight: 1.0, letterSpacing: '-0.02em', color: '#fff', marginBottom: 28 }}>
            Stop reviewing<br />
            <em style={{ fontStyle: 'italic', color: t.ember }}>400 applications</em><br />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>to hire one intern.</span>
          </h1>

          <p style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.65, color: t.s_muted, maxWidth: 480, marginBottom: 48 }}>
            HUNT pre-matches candidates to your role by actual skill. You get a ranked shortlist of 6. No resume pile. No keyword filtering. No college-name guessing.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: t.ember, color: '#fff', padding: '14px 32px', borderRadius: 6, fontSize: 15, fontWeight: 500, cursor: 'pointer', border: 'none', fontFamily: t.sans, letterSpacing: '0.01em' }}
              onMouseOver={e => e.currentTarget.style.background = '#c04e28'}
              onMouseOut={e => e.currentTarget.style.background = t.ember}
            >
              Reserve Early Access →
            </button>
            <button
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'rgba(255,255,255,0.5)', padding: '14px 20px', borderRadius: 6, fontSize: 14, fontWeight: 300, cursor: 'pointer', border: `1px solid rgba(255,255,255,0.15)`, fontFamily: t.sans }}
              onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
              onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              Talk to the founder
            </button>
          </div>
        </div>

        {/* Right visual */}
        <CandidateStackHero />
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ borderTop: `1px solid ${t.s_border}`, borderBottom: `1px solid ${t.s_border}`, padding: 'clamp(16px,2vw,24px) clamp(20px,4vw,48px)', display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
        {[
          { num: '6',          label: 'Max candidates per role' },
          { num: 'Skill-first', label: 'Not college-first' },
          { num: '₹0',         label: 'During early access' },
          { num: '48h',        label: 'Shortlist turnaround' },
        ].map((s, i, arr) => (
          <div key={i} style={{ flex: 1, minWidth: 140, padding: '0 clamp(12px,2vw,32px)', borderRight: i < arr.length - 1 ? `1px solid ${t.s_border}` : 'none', ...(i === 0 ? { paddingLeft: 0 } : {}) }}>
            <div style={{ fontFamily: t.serif, fontSize: 'clamp(24px,3vw,36px)', fontWeight: 400, color: t.ember, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{s.num}</div>
            <div style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── THE MATH ── */}
      <section style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,4vw,48px)', maxWidth: 1100, margin: '0 auto' }}>
        <Label>The problem, in numbers</Label>
        <h2 style={{ fontFamily: t.serif, fontSize: 'clamp(36px,5vw,64px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#fff', marginBottom: 12 }}>
          Your current hiring process is<br />
          <em style={{ fontStyle: 'italic', color: t.ember }}>broken by design.</em>
        </h2>
        <p style={{ fontSize: 17, fontWeight: 300, color: t.s_muted, maxWidth: 520, marginBottom: 48, lineHeight: 1.65 }}>
          Not because you're doing it wrong. Because every platform incentivises volume over quality — more applications means more revenue for them.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${t.s_border}`, borderRadius: 10, overflow: 'hidden' }}>
          {[
            { label: 'What you post today', num: '400+', desc: 'applications for a single internship on LinkedIn or Internshala.' },
            { label: 'What you actually screen', num: '~20', desc: 'because the rest are clearly unqualified. But you spent 6 hours getting there.' },
          ].map((c, i) => (
            <div key={i} style={{ padding: '2.5rem', borderBottom: `1px solid ${t.s_border}`, borderRight: i === 0 ? `1px solid ${t.s_border}` : 'none', background: t.s_surface }}>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>{c.label}</div>
              <div style={{ fontFamily: t.serif, fontSize: 56, fontWeight: 400, color: 'rgba(255,255,255,0.18)', lineHeight: 1, marginBottom: 8 }}>{c.num}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontWeight: 300 }}>{c.desc}</div>
            </div>
          ))}

          <div style={{ gridColumn: '1 / -1', padding: '1.2rem 2.5rem', background: t.emberDim, borderTop: `1px solid ${t.emberBorder}`, borderBottom: `1px solid ${t.emberBorder}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M7 2v10M12 7l-5 5-5-5" stroke={t.ember} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 15, color: t.s_body }}>HUNT inverts this. <strong style={{ color: '#F0997B', fontWeight: 500 }}>Match first, then show candidates.</strong></span>
          </div>

          {[
            { label: 'What HUNT delivers', num: 'Top 6', desc: 'skill-matched, pre-scored candidates. Nobody without the skills gets through.' },
            { label: 'Your actual time investment', num: '1 call', desc: 'to verify fit. The screening was already done by the match score.' },
          ].map((c, i) => (
            <div key={i} style={{ padding: '2.5rem', borderTop: `1px solid ${t.s_border}`, borderRight: i === 0 ? `1px solid ${t.s_border}` : 'none', background: t.s_surface }}>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>{c.label}</div>
              <div style={{ fontFamily: t.serif, fontSize: 56, fontWeight: 400, color: t.ember, lineHeight: 1, marginBottom: 8 }}>{c.num}</div>
              <div style={{ fontSize: 14, color: t.s_body, lineHeight: 1.6, fontWeight: 300 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '0 clamp(20px,4vw,48px) clamp(60px,8vw,96px)', maxWidth: 1100, margin: '0 auto' }}>
        <Label>How it works</Label>
        <h2 style={{ fontFamily: t.serif, fontSize: 'clamp(36px,5vw,64px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#fff', marginBottom: 48 }}>
          Post once.<br /><em style={{ fontStyle: 'italic', color: t.ember }}>Get matched candidates.</em>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${t.s_border}`, paddingLeft: 32, gap: 0 }}>
          {[
            { n: '01', title: 'Post the role with required skills', desc: 'Tell us what the intern actually needs to do. Tech stack, key skills, level. Takes 5 minutes. No lengthy JD required — we need the skill spec.', tag: 'No lengthy JD needed' },
            { n: '02', title: 'HUNT scores every candidate against your role', desc: 'Our match engine runs against verified skill data, project proof, and profile completeness — not just keywords. We weight each skill by your requirement, then rank.', tag: 'Skill-weighted, not keyword search' },
            { n: '03', title: 'Students with the highest match apply — max 6 total', desc: 'We cap applicants. Students can only apply to a limited number of roles per week, so only intentional applications reach you. No spray-and-pray.', tag: 'Capped at 6 applicants per role' },
            { n: '04', title: 'You see ranked profiles with match breakdowns', desc: 'Each candidate comes with a score breakdown: skill match, project relevance, tool familiarity. You decide who to call in 10 minutes, not 10 hours.', tag: 'Match score transparent before you open the profile' },
          ].map((step, i, arr) => (
            <div key={i} style={{ paddingBottom: i < arr.length - 1 ? 52 : 0, position: 'relative' }}>
              {/* dot on left border */}
              <div style={{ position: 'absolute', left: -40, top: 4, width: 16, height: 16, borderRadius: '50%', background: t.s_bg, border: `1px solid ${t.s_border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.ember }} />
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginBottom: 10, fontFamily: t.sans }}>{step.n}</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>{step.title}</div>
              <div style={{ fontSize: 14, fontWeight: 300, color: t.s_muted, lineHeight: 1.7, marginBottom: 14, maxWidth: 680 }}>{step.desc}</div>
              <span style={{ display: 'inline-block', fontSize: 11, padding: '4px 12px', borderRadius: 20, background: t.emberDim, border: `1px solid ${t.emberBorder}`, color: '#F0997B', fontWeight: 500 }}>{step.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── OUR STANCE — styled like image 4 (big bold headline + 4 cards) ── */}
      <section style={{ padding: '0 clamp(20px,4vw,48px) clamp(60px,8vw,96px)', maxWidth: 1100, margin: '0 auto' }}>
        <Label>Our stance</Label>

        <blockquote style={{
          fontFamily: t.sans,
          fontSize: 'clamp(36px,5vw,68px)',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: '#fff',
          borderLeft: `4px solid ${t.ember}`,
          paddingLeft: '1.5rem',
          margin: '0 0 24px 0',
        }}>
          "We don't filter by<br />
          college. We never will.<br />
          <em style={{ fontStyle: 'normal', color: t.ember }}>Skill is the only signal."</em>
        </blockquote>

        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 540, lineHeight: 1.7, fontWeight: 300, marginBottom: 52 }}>
          This isn't a policy. It's the entire thesis. The best React dev for your 4-person startup might be self-taught, from a college you've never heard of, building in public. HUNT finds them anyway.
        </p>

        {/* 4 feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: t.s_border, border: `1px solid ${t.s_border}`, borderRadius: 10, overflow: 'hidden' }}>
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={t.ember} strokeWidth="1.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              ),
              title: 'Skills, not credentials',
              desc: 'College name is visible but never filterable. Skill score is the primary signal. This is intentional and non-negotiable.',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={t.ember} strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16l8-4 8 4V4a2 2 0 00-2-2z"/>
                </svg>
              ),
              title: 'Project proof over claims',
              desc: 'Every matched skill is backed by project evidence — not just a checkbox. If they say React, we check if they\'ve shipped React.',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={t.ember} strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              ),
              title: 'Intentional applications only',
              desc: 'Students have a weekly application limit. So when someone applies to your role, they actually want it. No noise, no mass-apply bots.',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={t.ember} strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              ),
              title: 'Self-correcting over time',
              desc: 'Recruiter feedback after each hire feeds back into our scoring. Candidates who skill-faked don\'t survive. Shortlists improve with every placement.',
            },
          ].map((card, i) => (
            <div key={i} style={{ background: t.s_surface, padding: '32px 28px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: t.emberDim,
                border: `1px solid ${t.emberBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                {card.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>{card.title}</div>
              <div style={{ fontSize: 13, fontWeight: 300, color: t.s_muted, lineHeight: 1.65 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE DIFFERENCE ── */}
      <section style={{ padding: '0 clamp(20px,4vw,48px) clamp(60px,8vw,96px)', maxWidth: 1100, margin: '0 auto' }}>
        <Label>The difference</Label>
        <h2 style={{ fontFamily: t.serif, fontSize: 'clamp(36px,5vw,64px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#fff', marginBottom: 12 }}>
          Not a job board.<br />
          <em style={{ fontStyle: 'italic', color: t.ember }}>Not a recruiter tool.</em><br />
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>Something different.</span>
        </h2>
        <p style={{ fontSize: 17, fontWeight: 300, color: t.s_muted, maxWidth: 480, lineHeight: 1.65, marginBottom: 48 }}>
          Job boards optimise for volume. That's their business model. Ours is different — we only win if you actually hire.
        </p>

        <div style={{ border: `1px solid ${t.s_border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '1.4rem 2rem', borderBottom: `1px solid ${t.s_border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.s_surface }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Them vs HUNT</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>We're not in the same market</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: t.s_surface }}>
            {/* them col */}
            <div style={{ padding: '2rem 2.5rem', borderRight: `1px solid ${t.s_border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 24 }}>Every other platform</div>
              {[
                'More applications = more revenue for them',
                'College filter as the primary sort',
                'You screen. You filter. You do all the work.',
                'No feedback loop on who actually got hired',
                'Keyword search over actual skill depth',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18, fontSize: 14, color: 'rgba(255,255,255,0.35)', fontWeight: 300, lineHeight: 1.5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', flexShrink: 0, marginTop: 5 }} />
                  <span style={{ textDecoration: 'line-through', textDecorationColor: 'rgba(255,255,255,0.12)' }}>{item}</span>
                </div>
              ))}
            </div>
            {/* hunt col */}
            <div style={{ padding: '2rem 2.5rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.ember, marginBottom: 24 }}>HUNT</div>
              {[
                'We win only when you successfully hire',
                'College visible — never filterable. Ever.',
                'Matching is done before you open a profile',
                'Hire/no-hire feedback improves every future shortlist',
                'Weighted skill matching + project evidence',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18, fontSize: 14, color: t.s_body, fontWeight: 400, lineHeight: 1.5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.ember, flexShrink: 0, marginTop: 5 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '0 clamp(20px,4vw,48px)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ border: `1px solid ${t.s_border}`, borderRadius: 12, padding: 'clamp(40px,6vw,64px)', textAlign: 'center', background: t.s_surface, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 200, background: 'radial-gradient(ellipse, rgba(216,90,48,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>Early access · Free while we grow</div>
            <h2 style={{ fontFamily: t.serif, fontSize: 'clamp(36px,5vw,64px)', fontWeight: 400, lineHeight: 1.05, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>
              Post your first role.<br />
              See who <em style={{ fontStyle: 'italic', color: t.ember }}>actually</em> fits.
            </h2>
            <p style={{ fontSize: 17, fontWeight: 300, color: t.s_muted, maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.65 }}>
              We're in early access. Get your shortlist within 48 hours. No cost until we prove the model works.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <button
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: t.ember, color: '#fff', padding: '14px 36px', borderRadius: 6, fontSize: 15, fontWeight: 500, cursor: 'pointer', border: 'none', fontFamily: t.sans }}
                onMouseOver={e => e.currentTarget.style.background = '#c04e28'}
                onMouseOut={e => e.currentTarget.style.background = t.ember}
              >
                Reserve Early Access →
              </button>
              <button
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'rgba(255,255,255,0.5)', padding: '14px 24px', borderRadius: 6, fontSize: 14, fontWeight: 300, cursor: 'pointer', border: `1px solid rgba(255,255,255,0.15)`, fontFamily: t.sans }}
                onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              >
                Talk to the founder →
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 20 }}>No dashboard to set up. No contract. Just a role spec and a skill list.</p>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes huntPulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIENCE TOGGLE
// ─────────────────────────────────────────────────────────────────────────────
function AudienceToggle({ mode, onChange }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(10,10,10,0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 40,
      padding: 4,
      gap: 4,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      whiteSpace: 'nowrap',
    }}>
      <button
        onClick={() => onChange('student')}
        style={{
          fontFamily: t.sans,
          fontSize: 13,
          fontWeight: 500,
          padding: '9px 22px',
          borderRadius: 32,
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.25s',
          background: mode === 'student' ? t.green : 'transparent',
          color: mode === 'student' ? '#fff' : 'rgba(255,255,255,0.45)',
          letterSpacing: '0.01em',
        }}
      >
        I'm a Student
      </button>
      <button
        onClick={() => onChange('startup')}
        style={{
          fontFamily: t.sans,
          fontSize: 13,
          fontWeight: 500,
          padding: '9px 22px',
          borderRadius: 32,
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.25s',
          background: mode === 'startup' ? '#D85A30' : 'transparent',
          color: mode === 'startup' ? '#fff' : 'rgba(255,255,255,0.45)',
          letterSpacing: '0.01em',
        }}
      >
        I'm a Startup
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mode, setMode] = useState('student');

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
        rel="stylesheet"
      />

      <div style={{ fontFamily: t.sans, background: mode === 'student' ? t.white : t.s_bg, color: t.black, minHeight: '100vh', WebkitFontSmoothing: 'antialiased', overflowX: 'hidden', transition: 'background 0.3s' }}>

        {/* ── NAV — unchanged ── */}
        <nav style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          padding:         '20px 48px',
          borderBottom:    `1px solid ${mode === 'student' ? t.gray100 : 'rgba(255,255,255,0.07)'}`,
          position:        'sticky',
          top:             0,
          background:      mode === 'student' ? 'rgba(250,250,248,0.95)' : 'rgba(12,11,9,0.92)',
          backdropFilter:  'blur(8px)',
          zIndex:          100,
          transition:      'background 0.3s, border-color 0.3s',
        }}>
          <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '0.12em', color: mode === 'student' ? t.black : '#fff' }}>HUNT</span>
          <span style={{ fontSize: 11, fontWeight: 400, color: mode === 'student' ? t.gray400 : 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {mode === 'student' ? 'Internships. Not noise.' : 'Skill-first talent. Not noise.'}
          </span>
          {mode === 'student' ? (
            <button
              onClick={handleSignIn}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.black, color: t.white, padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 400, cursor: 'pointer', border: 'none', fontFamily: t.sans }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              <GoogleIcon /> Sign in with Google
            </button>
          ) : (
            <button
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#D85A30', color: '#fff', padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', fontFamily: t.sans }}
              onMouseOver={e => e.currentTarget.style.background = '#c04e28'}
              onMouseOut={e => e.currentTarget.style.background = '#D85A30'}
            >
              Reserve Early Access
            </button>
          )}
        </nav>

        {/* ── MAIN CONTENT ── */}
        {mode === 'student' ? (
          <>
            {/* ── HERO ── */}
            <section style={{
              padding: 'clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px) 80px',
              maxWidth: 1100,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 48,
              minHeight: 'calc(100vh - 65px)',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.gray600, marginBottom: 32 }}>
                  <span style={{ display: 'inline-block', width: 20, height: 1, background: t.gray400 }} />
                  Skill-first internship matching
                </div>
                <h1 style={{ fontFamily: t.serif, fontSize: 'clamp(52px, 7vw, 88px)', fontWeight: 400, lineHeight: 1.0, letterSpacing: '-0.02em', color: t.black, maxWidth: 780, marginBottom: 28 }}>
                  Skills got you here.<br />
                  Let them get you <em style={{ fontStyle: 'italic', color: t.green }}>hired.</em>
                </h1>
                <p style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.65, color: t.gray600, maxWidth: 440, marginBottom: 48 }}>
                  Stop mass applying and getting ignored. HUNT matches you to internships based on what you can actually do — then puts you in front of recruiters who care.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleSignIn}
                    style={btnPrimary}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.82'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    <GoogleIcon /> Start your hunt — it's free
                  </button>
                  <span style={{ fontSize: 12, color: t.gray400, fontWeight: 300 }}>No resume needed to start</span>
                </div>
              </div>
              <PhoneHero />
            </section>

            {/* ── STATS BAR ── */}
            <div style={{ borderTop: `1px solid ${t.gray100}`, borderBottom: `1px solid ${t.gray100}`, padding: 'clamp(16px,2vw,24px) clamp(20px,4vw,48px)', display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
              {[
                { num: '5',   numAccent: false, label: 'Applications / week' },
                { num: '40',  numAccent: true,  label: 'Min. interview rate %' },
                { num: '50',  numAccent: false, label: 'Max applicants / role' },
                { num: '0 ₹', numAccent: false, label: 'Always free for students' },
              ].map((s, i, arr) => (
                <div key={i} style={{ flex: 1, minWidth: 140, padding: '0 clamp(12px,2vw,32px)', borderRight: i < arr.length - 1 ? `1px solid ${t.gray100}` : 'none', ...(i === 0 ? { paddingLeft: 0 } : {}) }}>
                  <div style={{ fontFamily: t.serif, fontSize: 'clamp(24px,3vw,36px)', fontWeight: 400, color: s.numAccent ? t.green : t.black, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{s.num}</div>
                  <div style={{ fontSize: 11, fontWeight: 400, color: t.gray400, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── HOW IT WORKS ── */}
            <section style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,4vw,48px)', maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ fontSize: 11, fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.gray400, marginBottom: 48, display: 'flex', alignItems: 'center', gap: 12 }}>
                How it works
                <span style={{ flex: 1, height: 1, background: t.gray100, maxWidth: 200, display: 'block' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0, border: `1px solid ${t.gray100}`, borderRadius: 8, overflow: 'hidden' }}>
                {[
                  { n: '01', title: 'Build your skill profile',    desc: 'Add skills, projects, and work preferences. Takes 3 minutes. No resume required.' },
                  { n: '02', title: 'Swipe through matches',       desc: 'See internships ranked by your match score. Only roles you actually qualify for.' },
                  { n: '03', title: 'Apply to your top 5',         desc: '5 applications per week. Forces intent. See your match breakdown before you commit.' },
                  { n: '04', title: 'Get in front of recruiters',  desc: 'Recruiters see your ranked profile — skills first, nothing else. Hear back faster.' },
                ].map((step, i, arr) => (
                  <div key={i} style={{ padding: '36px 28px', borderRight: i < arr.length - 1 ? `1px solid ${t.gray100}` : 'none' }}>
                    <div style={{ fontFamily: t.serif, fontSize: 13, fontWeight: 400, color: t.gray400, marginBottom: 20 }}>{step.n}</div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: t.black, marginBottom: 10, lineHeight: 1.3 }}>{step.title}</div>
                    <div style={{ fontSize: 13, fontWeight: 300, color: t.gray600, lineHeight: 1.6 }}>{step.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── THE DIFFERENCE ── */}
            <section style={{ padding: '0 clamp(20px,4vw,48px) clamp(60px,8vw,96px)', maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ fontSize: 11, fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.gray400, marginBottom: 48, display: 'flex', alignItems: 'center', gap: 12 }}>
                The difference
                <span style={{ flex: 1, height: 1, background: t.gray100, maxWidth: 200, display: 'block' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.gray100}` }}>
                <div style={{ padding: '40px 36px', background: t.gray50 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.gray400, marginBottom: 28, fontWeight: 400 }}>Everywhere else</div>
                  {[
                    '500+ applicants per job posting',
                    'Screened out before anyone reads your resume',
                    '2–5% interview rate on average',
                    'No feedback. No transparency.',
                    'Apply to 100 things, hear back from 2',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18, fontSize: 14, color: t.gray600, fontWeight: 300, lineHeight: 1.5 }}>
                      <CrossIcon /> {item}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '40px 36px', background: t.white }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.green, marginBottom: 28, fontWeight: 400 }}>HUNT</div>
                  {[
                    'Max 50 applicants per role',
                    'Ranked by skill match — nothing else',
                    '40–60% interview rate for matched users',
                    'See your match score before you apply',
                    '5 intentional applications per week',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18, fontSize: 14, color: t.black, fontWeight: 400, lineHeight: 1.5 }}>
                      <CheckIcon /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── ON A HUNT ── */}
            <section style={{ padding: '0 clamp(20px,4vw,48px) clamp(60px,8vw,96px)', maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ fontSize: 11, fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.gray400, marginBottom: 48, display: 'flex', alignItems: 'center', gap: 12 }}>
                On a hunt
                <span style={{ flex: 1, height: 1, background: t.gray100, maxWidth: 200, display: 'block' }} />
              </div>
              <p style={{ fontSize: 17, fontWeight: 300, color: t.gray600, maxWidth: 480, lineHeight: 1.65, marginBottom: 36 }}>
                The best candidates aren't always where you'd expect to find them. HUNT surfaces them by what they've built — not where they studied.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[
                  { initials: 'RK', name: 'Rohan Kumar',  detail: 'Full Stack · React, Node.js',   score: '87%' },
                  { initials: 'PS', name: 'Priya Sharma', detail: 'Backend · Python, PostgreSQL',   score: '92%' },
                  { initials: 'AM', name: 'Arjun Mehta',  detail: 'ML · PyTorch, Scikit-learn',     score: '78%' },
                  { initials: 'SK', name: 'Sara Khan',    detail: 'Data · SQL, Pandas, Tableau',    score: '84%' },
                  { initials: 'NP', name: 'Nikhil Patel', detail: 'DevOps · Docker, AWS, CI/CD',    score: '81%' },
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: `1px solid ${t.gray100}`, borderRadius: 8, background: t.white }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: t.gray600, flexShrink: 0 }}>
                      {p.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: t.black, fontSize: 13, lineHeight: 1, marginBottom: 3 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: t.gray400, fontWeight: 300 }}>{p.detail}</div>
                    </div>
                    <div style={{ marginLeft: 8, background: t.greenLight, color: t.green, fontSize: 12, fontWeight: 500, padding: '4px 8px', borderRadius: 4 }}>{p.score}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── BIG CTA ── */}
            <div style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,4vw,48px)', borderTop: `1px solid ${t.gray100}`, textAlign: 'center' }}>
              <h2 style={{ fontFamily: t.serif, fontSize: 'clamp(36px,5vw,64px)', fontWeight: 400, color: t.black, lineHeight: 1.05, marginBottom: 20, letterSpacing: '-0.02em' }}>
                Apply smart.<br />
                <em style={{ fontStyle: 'italic', color: t.green }}>Get seen.</em>
              </h2>
              <p style={{ fontSize: 15, fontWeight: 300, color: t.gray600, marginBottom: 36 }}>
                Stop sending into the void. Start matching.
              </p>
              <button
                onClick={handleSignIn}
                style={{ ...btnPrimary, margin: '0 auto' }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.82'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                <GoogleIcon /> Start your hunt — it's free
              </button>
            </div>
          </>
        ) : (
          <StartupPage />
        )}

        {/* ── FOOTER — unchanged ── */}
        <footer style={{
          borderTop: `1px solid ${mode === 'student' ? t.gray100 : 'rgba(255,255,255,0.07)'}`,
          padding: 'clamp(24px,3vw,40px) clamp(20px,4vw,48px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          background: mode === 'student' ? t.white : t.s_bg,
        }}>
          <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.12em', color: mode === 'student' ? t.black : '#fff' }}>HUNT</span>
          <span style={{ fontSize: 12, color: mode === 'student' ? t.gray400 : 'rgba(255,255,255,0.3)', fontWeight: 300 }}>Internships. Not noise. · Built in India · 2025</span>
        </footer>

        {/* ── FIXED TOGGLE ── */}
        <AudienceToggle mode={mode} onChange={setMode} />

      </div>
    </>
  );
}
