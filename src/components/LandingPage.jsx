// src/components/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { signInWithGoogle } from '../services/supabase';

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream:    #F7F4EF;
    --ink:      #111010;
    --ink2:     #3A3834;
    --ink3:     #7A7673;
    --ink4:     #B8B5B0;
    --rule:     #E2DDD7;
    --ember:    #C94B1F;
    --ember2:   #E8622E;
    --green:    #1A6B40;
    --green-bg: #EBF5EF;
    --serif:    'Georgia', 'Times New Roman', serif;
    --sans:     'DM Sans', system-ui, sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--cream);
    color: var(--ink);
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* grain overlay */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 9999; opacity: 0.45; mix-blend-mode: multiply;
  }

  @keyframes huntPulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.45;transform:scale(0.82);} }
  @keyframes cardIn { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes tickerScroll { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }

  .fade-up { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-2 { animation-delay: 0.18s; }
  .fade-up-3 { animation-delay: 0.3s; }

  .hover-lift { transition: transform 0.18s ease; }
  .hover-lift:hover { transform: translateY(-2px); }

  .btn-ember {
    display: inline-flex; align-items: center; gap: 9px;
    background: var(--ember); color: #fff;
    padding: 12px 26px; border-radius: 4px;
    font-size: 14px; font-weight: 500; cursor: pointer;
    border: none; font-family: var(--sans); letter-spacing: 0.01em;
    transition: background 0.14s, transform 0.14s;
  }
  .btn-ember:hover { background: var(--ember2); transform: translateY(-1px); }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: var(--ink2);
    padding: 12px 20px; border-radius: 4px;
    font-size: 14px; font-weight: 400; cursor: pointer;
    border: 1px solid var(--rule); font-family: var(--sans);
    transition: border-color 0.14s, color 0.14s;
  }
  .btn-ghost:hover { border-color: var(--ink3); color: var(--ink); }

  .btn-ink {
    display: inline-flex; align-items: center; gap: 9px;
    background: var(--ink); color: #fff;
    padding: 12px 26px; border-radius: 4px;
    font-size: 14px; font-weight: 400; cursor: pointer;
    border: none; font-family: var(--sans);
    transition: opacity 0.14s, transform 0.14s;
  }
  .btn-ink:hover { opacity: 0.82; transform: translateY(-1px); }

  .rule { height: 1px; background: var(--rule); }

  .ticker-wrap { overflow: hidden; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 13px 0; }
  .ticker-inner { display: flex; white-space: nowrap; animation: tickerScroll 26s linear infinite; }
  .ticker-item { display: inline-flex; align-items: center; gap: 28px; padding: 0 28px; font-size: 11px; font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink3); }
  .ticker-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ember); flex-shrink: 0; }

  .stat-num { font-family: var(--serif); font-size: clamp(34px,4vw,50px); font-weight: 400; line-height: 1; letter-spacing: -0.02em; }
  .stat-label { font-size: 10px; letter-spacing: 0.09em; text-transform: uppercase; color: var(--ink3); margin-top: 6px; font-weight: 400; }

  .accent-bar { position: absolute; top: 0; right: -1px; width: 3px; height: 100%; border-radius: 0 4px 4px 0; }
`;

// ─── ICONS ────────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="currentColor" opacity=".9"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="currentColor" opacity=".9"/>
    <path d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706 0-.59.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9c0 1.45.348 2.826.957 4.038l3.007-2.332z" fill="currentColor" opacity=".9"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z" fill="currentColor" opacity=".9"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M1 6.5h11M7.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Check = ({ color = '#1A6B40' }) => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="7.5" cy="7.5" r="7" stroke={color} strokeWidth="1"/>
    <path d="M4.5 7.5l2.5 2.5 3.5-4" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Cross = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="7.5" cy="7.5" r="7" stroke="#B8B5B0" strokeWidth="1"/>
    <path d="M10 5L5 10M5 5l5 5" stroke="#B8B5B0" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// ─── PHONE HERO ───────────────────────────────────────────────────────────────
function PhoneHero() {
  useEffect(() => {
    const scenes = [
      [
        { text: "What if you knew\nyour chances ", style: "color:#ccc9c3;font-size:18px;font-family:monospace;line-height:1.7;" },
        { text: "BEFORE", style: "color:#4ade80;font-size:18px;font-family:monospace;font-weight:700;line-height:1.7;" },
        { text: "\napplying for an\ninternship?", style: "color:#ccc9c3;font-size:18px;font-family:monospace;line-height:1.7;" },
      ],
      [
        { text: "Still hunting\ninternships in 2026\nthe old way?", style: "color:#6a6663;font-size:17px;font-family:monospace;line-height:1.7;" },
        { text: "\n\n😅", style: "color:#ccc9c3;font-size:22px;font-family:monospace;" },
      ],
      [
        { text: "Open\n", style: "color:#6a6663;font-size:17px;font-family:monospace;line-height:1.8;" },
        { text: "HUNT", style: "color:#4ade80;font-size:26px;font-family:monospace;font-weight:700;letter-spacing:4px;" },
      ],
      [
        { text: "→ complete your\n  profile\n", style: "color:#ccc9c3;font-size:16px;font-family:monospace;line-height:1.8;" },
        { text: "\n(only takes 2 min\nor less, seriously)", style: "color:#3e3c3a;font-size:13px;font-family:monospace;line-height:1.7;" },
      ],
      [
        { text: "→ swipe on\n  internships\n\n", style: "color:#ccc9c3;font-size:16px;font-family:monospace;line-height:1.8;" },
        { text: "left = nope\n", style: "color:#6a6663;font-size:14px;font-family:monospace;line-height:1.8;" },
        { text: "right = ", style: "color:#6a6663;font-size:14px;font-family:monospace;line-height:1.8;" },
        { text: "let's go", style: "color:#4ade80;font-size:14px;font-family:monospace;font-weight:700;line-height:1.8;" },
      ],
      [
        { text: "that's it.\n", style: "color:#ccc9c3;font-size:20px;font-family:monospace;font-weight:700;line-height:1.8;" },
        { text: "\nso easy\nand fast.", style: "color:#3e3c3a;font-size:16px;font-family:monospace;line-height:1.8;" },
      ],
      [
        { text: "right now ", style: "color:#6a6663;font-size:15px;font-family:monospace;line-height:1.8;" },
        { text: "v0\n", style: "color:#4ade80;font-size:15px;font-family:monospace;font-weight:700;line-height:1.8;" },
        { text: "\nonly for cs students\n", style: "color:#6a6663;font-size:15px;font-family:monospace;line-height:1.8;" },
        { text: "with actual skills.", style: "color:#4ade80;font-size:15px;font-family:monospace;font-weight:700;line-height:1.8;" },
      ],
      [
        { text: "your jee rank\ndoesn't live here.\n", style: "color:#3e3c3a;font-size:14px;font-family:monospace;line-height:1.9;" },
        { text: "\nyour\n", style: "color:#6a6663;font-size:14px;font-family:monospace;line-height:1.9;" },
        { text: "github / projects\n", style: "color:#4ade80;font-size:14px;font-family:monospace;font-weight:700;line-height:1.9;" },
        { text: "does.\n\ntry it. roast it. ↗", style: "color:#3e3c3a;font-size:13px;font-family:monospace;line-height:1.9;" },
      ],
    ];
    const SCENE_DURATIONS = [3200, 2800, 2600, 3200, 3200, 2600, 3200, 99999];
    const CHAR_DELAY = 33;
    const screen = document.getElementById('hunt-phone-screen');
    if (!screen) return;
    let stopped = false, typeTimer = null, sceneTimer = null, currentScene = 0;
    function typeScene(idx) {
      if (stopped) return;
      screen.innerHTML = '';
      const container = document.createElement('div');
      screen.appendChild(container);
      const spans = scenes[idx].map(p => {
        const sp = document.createElement('span');
        sp.style.cssText = p.style + 'white-space:pre-wrap;';
        container.appendChild(sp);
        return { el: sp, text: p.text };
      });
      let pi = 0, ci = 0;
      function tick() {
        if (stopped) return;
        if (pi >= spans.length) {
          sceneTimer = setTimeout(() => {
            if (currentScene < scenes.length - 1) {
              screen.style.transition = 'opacity 0.32s'; screen.style.opacity = '0';
              setTimeout(() => { if (stopped) return; screen.style.opacity = '1'; currentScene++; typeScene(currentScene); }, 360);
            }
          }, SCENE_DURATIONS[idx]);
          return;
        }
        const cur = spans[pi];
        if (ci < cur.text.length) { cur.el.textContent += cur.text[ci++]; typeTimer = setTimeout(tick, CHAR_DELAY); }
        else { pi++; ci = 0; typeTimer = setTimeout(tick, CHAR_DELAY); }
      }
      tick();
    }
    const st = setTimeout(() => typeScene(0), 500);
    return () => { stopped = true; clearTimeout(typeTimer); clearTimeout(sceneTimer); clearTimeout(st); };
  }, []);

  return (
    <div style={{ flexShrink: 0, width: 276, height: 496, pointerEvents: 'none', alignSelf: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: '10px 14px -10px', background: '#16140f', borderRadius: 36, filter: 'blur(14px)', opacity: 0.3 }} />
      <div style={{ background: '#131109', borderRadius: 40, padding: 8, boxShadow: '0 0 0 1px #252320, 0 18px 44px rgba(0,0,0,0.28)', width: 276, height: 496, position: 'relative' }}>
        <div style={{ background: '#09080600', borderRadius: 34, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', background: '#080706' }}>
          <div style={{ padding: '9px 0 3px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 66, height: 4.5, background: '#1c1a17', borderRadius: 3 }} />
          </div>
          <div id="hunt-phone-screen" style={{ flex: 1, padding: '18px 17px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
          <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 82, height: 3, background: '#1c1a17', borderRadius: 2 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CANDIDATE CARD HERO ──────────────────────────────────────────────────────
function CandidateStackHero() {
  const [idx, setIdx] = useState(0);
  const candidates = [
    { initials: 'RK', color: '#C94B1F', name: 'Rahul Kumar', college: 'LNMIIT, Jaipur', score: 91, skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'], project: 'E-comm Analytics Dashboard', projectDetail: 'React + Node · Live on GitHub' },
    { initials: 'PS', color: '#1A6B40', name: 'Priya Sharma', college: 'VJTI Mumbai', score: 87, skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis'], project: 'ML Price Predictor', projectDetail: 'Python + Flask · Deployed on Render' },
    { initials: 'AM', color: '#3B5FC0', name: 'Arjun Mehta', college: 'PES University', score: 82, skills: ['React', 'TypeScript', 'GraphQL'], project: 'Open-source UI Library', projectDetail: '340 GitHub stars · Actively maintained' },
  ];
  useEffect(() => { const iv = setInterval(() => setIdx(p => (p + 1) % candidates.length), 2800); return () => clearInterval(iv); }, []);
  const c = candidates[idx];
  const sc = c.score >= 85 ? '#C94B1F' : c.score >= 75 ? '#A07820' : '#3B5FC0';
  return (
    <div style={{ flexShrink: 0, width: 308, alignSelf: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 13, left: 9, right: 9, bottom: -5, background: '#E6E2DC', borderRadius: 11, border: '1px solid #D4D0C9' }} />
      <div style={{ position: 'absolute', top: 6.5, left: 4.5, right: 4.5, bottom: -2.5, background: '#EDE9E3', borderRadius: 11, border: '1px solid #DAD6CF' }} />
      <div key={idx} style={{ position: 'relative', zIndex: 2, background: '#F5F2ED', borderRadius: 11, border: '1px solid #D8D4CD', padding: '22px 22px 18px', boxShadow: '0 6px 28px rgba(0,0,0,0.09)', animation: 'cardIn 0.36s cubic-bezier(0.22,1,0.36,1)' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 3, height: '100%', background: sc, borderRadius: '0 11px 11px 0', opacity: 0.65 }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: sc + '16', border: `1.5px solid ${sc}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: sc, flexShrink: 0 }}>{c.initials}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111010', lineHeight: 1.2 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: '#7A7673', marginTop: 2, letterSpacing: '0.01em' }}>{c.college}</div>
            </div>
          </div>
          <div style={{ background: sc + '12', border: `1px solid ${sc}28`, borderRadius: 4, padding: '4px 9px', fontSize: 15, fontWeight: 700, color: sc, letterSpacing: '-0.02em', flexShrink: 0 }}>{c.score}%</div>
        </div>
        <div style={{ height: 1, background: '#E2DDD7', margin: '0 0 12px' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 13 }}>
          {c.skills.map((sk, i) => (
            <span key={i} style={{ fontSize: 11, padding: '3px 8px', background: '#ECEAE5', border: '1px solid #DAD7D1', borderRadius: 3, color: '#3A3834' }}>{sk}</span>
          ))}
        </div>
        <div style={{ background: '#EDE9E3', border: '1px solid #DAD7D1', borderRadius: 6, padding: '10px 13px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#111010', marginBottom: 2 }}>{c.project}</div>
          <div style={{ fontSize: 11, color: '#7A7673' }}>{c.projectDetail}</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 15 }}>
        {candidates.map((_, i) => (
          <div key={i} style={{ width: i === idx ? 16 : 5, height: 5, borderRadius: 3, background: i === idx ? '#C94B1F' : '#D4D0C9', transition: 'all 0.28s' }} />
        ))}
      </div>
    </div>
  );
}

// ─── TICKER ───────────────────────────────────────────────────────────────────
function Ticker({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="ticker-wrap">
      <div className="ticker-inner">
        {doubled.map((item, i) => (
          <span key={i} className="ticker-item"><span className="ticker-dot" />{item}</span>
        ))}
      </div>
    </div>
  );
}

// ─── LABEL COMPONENT ──────────────────────────────────────────────────────────
function SectionLabel({ children, color = 'var(--ink3)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
      <span style={{ width: 20, height: 1, background: color, display: 'block' }} />
      <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color }}>{children}</span>
    </div>
  );
}

// ─── STUDENT PAGE ─────────────────────────────────────────────────────────────
function StudentPage({ onSignIn }) {
  return (
    <div style={{ background: 'var(--cream)' }}>

      {/* HERO */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(60px,8vw,92px) clamp(24px,4vw,48px) clamp(48px,6vw,68px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48, minHeight: 'calc(100vh - 62px)' }}>
        <div style={{ flex: 1, minWidth: 0 }} className="fade-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 30 }}>
            <span style={{ width: 22, height: 1, background: 'var(--ink3)', display: 'block' }} />
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink3)' }}>Skill-first internship matching</span>
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(50px,6.5vw,82px)', fontWeight: 400, lineHeight: 1.0, letterSpacing: '-0.025em', color: 'var(--ink)', marginBottom: 22, maxWidth: 660 }}>
            Skills got you here.<br />Let them get you{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--green)' }}>hired.</em>
          </h1>
          <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.68, color: 'var(--ink2)', maxWidth: 400, marginBottom: 36 }}>
            Stop mass applying and getting ignored. HUNT matches you to internships based on what you can actually do — then puts you in front of recruiters who care.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button className="btn-ink" onClick={onSignIn}><GoogleIcon /> Start your hunt — it's free</button>
            <span style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 300 }}>No resume needed to start</span>
          </div>
        </div>
        <div className="fade-up fade-up-2"><PhoneHero /></div>
      </section>

      {/* TICKER */}
      <Ticker items={['5 applications per week', 'Skill-first matching', '40%+ interview rate', 'Free for students forever', 'Max 50 applicants per role', 'Match score before you apply']} />

      {/* STATS */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 clamp(24px,4vw,48px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderLeft: '1px solid var(--rule)', margin: '60px 0' }}>
          {[
            { num: '5', label: 'Applications / week', accent: false },
            { num: '40%+', label: 'Interview rate target', accent: true, accentColor: 'var(--green)' },
            { num: '50', label: 'Max applicants / role', accent: false },
            { num: '₹0', label: 'Always free for students', accent: false },
          ].map((s, i) => (
            <div key={i} style={{ borderRight: '1px solid var(--rule)', padding: '22px 28px', position: 'relative' }}>
              {i === 1 && <div className="accent-bar" style={{ background: 'var(--green)' }} />}
              <div className="stat-num" style={{ color: s.accent ? s.accentColor : 'var(--ink)' }}>{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rule" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(60px,8vw,88px) clamp(24px,4vw,48px)' }}>
        <SectionLabel>How it works</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid var(--rule)', borderRadius: 6 }}>
          {[
            { n: '01', title: 'Build your skill profile', desc: 'Add skills, projects, and work preferences. Takes 3 minutes. No resume required.' },
            { n: '02', title: 'Swipe through matches', desc: 'See internships ranked by your match score. Only roles you actually qualify for.' },
            { n: '03', title: 'Apply to your top 5', desc: '5 applications per week. Forces intent. See your match breakdown before you commit.' },
            { n: '04', title: 'Get in front of recruiters', desc: 'Recruiters see your ranked profile — skills first, nothing else. Hear back faster.' },
          ].map((step, i, arr) => (
            <div key={i} style={{ padding: '28px 24px', borderRight: i < arr.length - 1 ? '1px solid var(--rule)' : 'none' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 11, color: 'var(--ink4)', marginBottom: 16, letterSpacing: '0.04em' }}>{step.n}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 9, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{step.title}</div>
              <div style={{ fontSize: 13, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.65 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="rule" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* THE DIFFERENCE */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(60px,8vw,88px) clamp(24px,4vw,48px)' }}>
        <SectionLabel>The difference</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--rule)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ background: '#EDECE6', padding: '36px 32px', borderRight: '1px solid var(--rule)' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 24, fontWeight: 500 }}>Everywhere else</div>
            {['500+ applicants per job posting', 'Screened out before anyone reads your resume', '2–5% interview rate on average', 'No feedback. No transparency.', 'Apply to 100 things, hear back from 2'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 14, fontSize: 13.5, color: 'var(--ink3)', fontWeight: 300, lineHeight: 1.5 }}>
                <Cross /> {item}
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--cream)', padding: '36px 32px' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 24, fontWeight: 500 }}>HUNT</div>
            {['Max 50 applicants per role', 'Ranked by skill match — nothing else', '40–60% interview rate for matched users', 'See your match score before you apply', '5 intentional applications per week'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 14, fontSize: 13.5, color: 'var(--ink)', fontWeight: 400, lineHeight: 1.5 }}>
                <Check /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="rule" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* ON A HUNT */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(60px,8vw,88px) clamp(24px,4vw,48px)' }}>
        <SectionLabel>On a hunt</SectionLabel>
        <p style={{ fontSize: 15, fontWeight: 300, color: 'var(--ink2)', maxWidth: 420, lineHeight: 1.7, marginBottom: 32 }}>
          The best candidates aren't always where you'd expect. HUNT surfaces them by what they've built — not where they studied.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {[
            { initials: 'RK', name: 'Rohan Kumar', detail: 'Full Stack · React, Node.js', score: '87%' },
            { initials: 'PS', name: 'Priya Sharma', detail: 'Backend · Python, PostgreSQL', score: '92%' },
            { initials: 'AM', name: 'Arjun Mehta', detail: 'ML · PyTorch, Scikit-learn', score: '78%' },
            { initials: 'SK', name: 'Sara Khan', detail: 'Data · SQL, Pandas, Tableau', score: '84%' },
            { initials: 'NP', name: 'Nikhil Patel', detail: 'DevOps · Docker, AWS, CI/CD', score: '81%' },
          ].map((p, i) => (
            <div key={i} className="hover-lift" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', border: '1px solid var(--rule)', borderRadius: 5, background: 'var(--cream)', cursor: 'default' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E8E4DD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: 'var(--ink2)', flexShrink: 0 }}>{p.initials}</div>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--ink)', fontSize: 12.5, lineHeight: 1, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink3)', fontWeight: 300 }}>{p.detail}</div>
              </div>
              <div style={{ marginLeft: 4, background: '#EBF5EF', color: 'var(--green)', fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 3 }}>{p.score}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '0 clamp(24px,4vw,48px) clamp(88px,10vw,112px)' }}>
        <div style={{ textAlign: 'center', padding: 'clamp(44px,6vw,68px) 32px', background: '#EDECE6', border: '1px solid var(--rule)', borderRadius: 6 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(34px,5vw,56px)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.05, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Apply smart.<br /><em style={{ fontStyle: 'italic', color: 'var(--green)' }}>Get seen.</em>
          </h2>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink2)', marginBottom: 28 }}>Stop sending into the void. Start matching.</p>
          <button className="btn-ink" onClick={onSignIn} style={{ margin: '0 auto' }}><GoogleIcon /> Start your hunt — it's free</button>
        </div>
      </section>
    </div>
  );
}

// ─── STARTUP PAGE ─────────────────────────────────────────────────────────────
function StartupPage() {
  return (
    <div style={{ background: 'var(--cream)' }}>

      {/* HERO */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(60px,8vw,92px) clamp(24px,4vw,48px) clamp(48px,6vw,68px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 64, minHeight: 'calc(100vh - 62px)' }}>
        <div style={{ flex: 1, minWidth: 0 }} className="fade-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(201,75,31,0.4)', borderRadius: 20, padding: '4px 12px', marginBottom: 30 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ember)', animation: 'huntPulse 2s infinite', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ember)' }}>Early access · Invite only</span>
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(50px,6.5vw,82px)', fontWeight: 400, lineHeight: 1.0, letterSpacing: '-0.025em', color: 'var(--ink)', marginBottom: 22 }}>
            Stop reviewing<br />
            <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>400 applications</em><br />
            <span style={{ color: 'var(--ink2)' }}>to hire one intern.</span>
          </h1>
          <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.68, color: 'var(--ink2)', maxWidth: 400, marginBottom: 36 }}>
            HUNT pre-matches candidates to your role by actual skill. You get a ranked shortlist of 6. No resume pile. No keyword filtering. No college-name guessing.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button className="btn-ember">Reserve Early Access <ArrowRight /></button>
            <button className="btn-ghost">Talk to the founder</button>
          </div>
        </div>
        <div className="fade-up fade-up-2"><CandidateStackHero /></div>
      </section>

      {/* TICKER */}
      <Ticker items={['6 max candidates per role', 'Skill-weighted matching', '₹0 during early access', '48h shortlist turnaround', 'No resume pile. No noise.', 'College visible, never filterable']} />

      {/* STATS */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 clamp(24px,4vw,48px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderLeft: '1px solid var(--rule)', margin: '60px 0' }}>
          {[
            { num: '6', label: 'Max candidates per role', accent: true },
            { num: 'Skill-first', label: 'Not college-first', accent: false },
            { num: '₹0', label: 'During early access', accent: false },
            { num: '48h', label: 'Shortlist turnaround', accent: false },
          ].map((s, i) => (
            <div key={i} style={{ borderRight: '1px solid var(--rule)', padding: '22px 28px', position: 'relative' }}>
              {i === 0 && <div className="accent-bar" style={{ background: 'var(--ember)' }} />}
              <div className="stat-num" style={{ color: s.accent ? 'var(--ember)' : 'var(--ink)' }}>{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rule" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* THE PROBLEM */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(60px,8vw,88px) clamp(24px,4vw,48px)' }}>
        <SectionLabel color="var(--ember)">The problem, in numbers</SectionLabel>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(34px,5vw,58px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 12 }}>
          Your current hiring process is<br /><em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>broken by design.</em>
        </h2>
        <p style={{ fontSize: 15, fontWeight: 300, color: 'var(--ink2)', maxWidth: 460, marginBottom: 44, lineHeight: 1.68 }}>
          Not because you're doing it wrong. Because every platform incentivises volume over quality — more applications means more revenue for them.
        </p>
        <div style={{ border: '1px solid var(--rule)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--rule)' }}>
            {[
              { label: 'What you post today', num: '400+', desc: 'applications for a single internship on LinkedIn or Internshala.' },
              { label: 'What you actually screen', num: '~20', desc: 'because the rest are clearly unqualified. But you spent 6 hours getting there.' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '2.2rem', background: '#EDECE6', borderRight: i === 0 ? '1px solid var(--rule)' : 'none' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 12, fontWeight: 500 }}>{c.label}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(42px,5vw,58px)', fontWeight: 400, color: 'var(--ink4)', lineHeight: 1, marginBottom: 10, letterSpacing: '-0.02em' }}>{c.num}</div>
                <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, fontWeight: 300 }}>{c.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '13px 22px', background: 'rgba(201,75,31,0.07)', borderBottom: '1px solid rgba(201,75,31,0.18)', display: 'flex', alignItems: 'center', gap: 11 }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M9.5 6.5l-4 4-4-4" stroke="#C94B1F" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <span style={{ fontSize: 13.5, color: 'var(--ink)' }}>HUNT inverts this. <strong style={{ color: 'var(--ember)', fontWeight: 500 }}>Match first, then show candidates.</strong></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {[
              { label: 'What HUNT delivers', num: 'Top 6', desc: 'skill-matched, pre-scored candidates. Nobody without the skills gets through.' },
              { label: 'Your actual time investment', num: '1 call', desc: 'to verify fit. The screening was already done by the match score.' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '2.2rem', background: 'var(--cream)', borderRight: i === 0 ? '1px solid var(--rule)' : 'none' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 12, fontWeight: 500 }}>{c.label}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(42px,5vw,58px)', fontWeight: 400, color: 'var(--ember)', lineHeight: 1, marginBottom: 10, letterSpacing: '-0.02em' }}>{c.num}</div>
                <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, fontWeight: 300 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="rule" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(60px,8vw,88px) clamp(24px,4vw,48px)' }}>
        <SectionLabel color="var(--ember)">How it works</SectionLabel>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(34px,5vw,58px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 48 }}>
          Post once.<br /><em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>Get matched candidates.</em>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--rule)', paddingLeft: 30 }}>
          {[
            { n: '01', title: 'Post the role with required skills', desc: 'Tell us what the intern actually needs to do. Tech stack, key skills, level. Takes 5 minutes. No lengthy JD required — we need the skill spec.', tag: 'No lengthy JD needed' },
            { n: '02', title: 'HUNT scores every candidate against your role', desc: 'Our match engine runs against verified skill data, project proof, and profile completeness — not just keywords. We weight each skill by your requirement, then rank.', tag: 'Skill-weighted, not keyword search' },
            { n: '03', title: 'Students with the highest match apply — max 6 total', desc: 'We cap applicants. Students can only apply to a limited number of roles per week, so only intentional applications reach you. No spray-and-pray.', tag: 'Capped at 6 applicants per role' },
            { n: '04', title: 'You see ranked profiles with match breakdowns', desc: 'Each candidate comes with a score breakdown: skill match, project relevance, tool familiarity. You decide who to call in 10 minutes, not 10 hours.', tag: 'Match score transparent before you open the profile' },
          ].map((step, i, arr) => (
            <div key={i} style={{ paddingBottom: i < arr.length - 1 ? 44 : 0, position: 'relative' }}>
              <div style={{ position: 'absolute', left: -37, top: 3, width: 13, height: 13, borderRadius: '50%', background: 'var(--cream)', border: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ember)' }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink4)', marginBottom: 8, fontFamily: 'var(--serif)', letterSpacing: '0.05em' }}>{step.n}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{step.title}</div>
              <div style={{ fontSize: 13.5, fontWeight: 300, color: 'var(--ink2)', lineHeight: 1.7, marginBottom: 12, maxWidth: 580 }}>{step.desc}</div>
              <span style={{ display: 'inline-block', fontSize: 10, padding: '3px 9px', borderRadius: 3, background: 'rgba(201,75,31,0.08)', border: '1px solid rgba(201,75,31,0.18)', color: 'var(--ember)', fontWeight: 500, letterSpacing: '0.03em' }}>{step.tag}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="rule" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* OUR STANCE */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(60px,8vw,88px) clamp(24px,4vw,48px)' }}>
        <SectionLabel color="var(--ember)">Our stance</SectionLabel>
        <blockquote style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px,4.5vw,56px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--ink)', borderLeft: '2.5px solid var(--ember)', paddingLeft: '1.4rem', margin: '0 0 22px' }}>
          "We don't filter by college.<br />We never will.<br />
          <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>Skill is the only signal."</em>
        </blockquote>
        <p style={{ fontSize: 13.5, color: 'var(--ink3)', maxWidth: 460, lineHeight: 1.72, fontWeight: 300, marginBottom: 44 }}>
          This isn't a policy. It's the entire thesis. The best React dev for your 4-person startup might be self-taught, from a college you've never heard of, building in public. HUNT finds them anyway.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid var(--rule)' }}>
          {[
            { n: '01', title: 'Skills, not credentials', desc: 'College name is visible but never filterable. Skill score is the primary signal. Intentional and non-negotiable.' },
            { n: '02', title: 'Project proof over claims', desc: "Every matched skill is backed by project evidence. If they say React, we check if they've shipped React." },
            { n: '03', title: 'Intentional applications only', desc: 'Students have a weekly application limit. So when someone applies, they actually want it. No noise, no bots.' },
            { n: '04', title: 'Self-correcting over time', desc: "Recruiter feedback after each hire improves every future shortlist. Candidates who skill-faked don't survive." },
          ].map((card, i) => (
            <div key={i} style={{ padding: '24px 24px 24px 0', borderRight: i < 3 ? '1px solid var(--rule)' : 'none', paddingRight: i < 3 ? 24 : 0, paddingLeft: i > 0 ? 24 : 0 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 10, color: 'var(--ink4)', marginBottom: 13, letterSpacing: '0.05em' }}>{card.n}</div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', marginBottom: 9, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{card.title}</div>
              <div style={{ fontSize: 12.5, fontWeight: 300, color: 'var(--ink3)', lineHeight: 1.65 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="rule" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* THE DIFFERENCE */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(60px,8vw,88px) clamp(24px,4vw,48px)' }}>
        <SectionLabel color="var(--ember)">The difference</SectionLabel>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px,5vw,52px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 12 }}>
          Not a job board.<br />
          <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>Not a recruiter tool.</em><br />
          <span style={{ color: 'var(--ink3)' }}>Something different.</span>
        </h2>
        <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink2)', maxWidth: 400, lineHeight: 1.68, marginBottom: 36 }}>
          Job boards optimise for volume. That's their business model. Ours is different — we only win if you actually hire.
        </p>
        <div style={{ border: '1px solid var(--rule)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ padding: '13px 22px', background: '#EDECE6', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Them vs HUNT</span>
            <span style={{ fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>We're not in the same market</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--cream)' }}>
            <div style={{ padding: '26px 30px', borderRight: '1px solid var(--rule)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 20 }}>Every other platform</div>
              {['More applications = more revenue for them', 'College filter as the primary sort', 'You screen. You filter. You do all the work.', 'No feedback loop on who actually got hired', 'Keyword search over actual skill depth'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 14, fontSize: 13.5, color: 'var(--ink3)', fontWeight: 300, lineHeight: 1.5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink4)', flexShrink: 0, marginTop: 5.5 }} />
                  <span style={{ textDecoration: 'line-through', textDecorationColor: 'var(--ink4)' }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '26px 30px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 20 }}>HUNT</div>
              {['We win only when you successfully hire', 'College visible — never filterable. Ever.', 'Matching is done before you open a profile', 'Hire/no-hire feedback improves every future shortlist', 'Weighted skill matching + project evidence'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 14, fontSize: 13.5, color: 'var(--ink)', fontWeight: 400, lineHeight: 1.5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ember)', flexShrink: 0, marginTop: 5.5 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '0 clamp(24px,4vw,48px) clamp(88px,10vw,112px)' }}>
        <div style={{ textAlign: 'center', padding: 'clamp(44px,6vw,68px) 32px', background: '#EDECE6', border: '1px solid var(--rule)', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 440, height: 160, background: 'radial-gradient(ellipse, rgba(201,75,31,0.07) 0%, transparent 68%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 18 }}>Early access · Free while we grow</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px,5vw,52px)', fontWeight: 400, lineHeight: 1.05, color: 'var(--ink)', marginBottom: 14, letterSpacing: '-0.02em' }}>
              Post your first role.<br />See who <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>actually</em> fits.
            </h2>
            <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink2)', maxWidth: 360, margin: '0 auto 32px', lineHeight: 1.68 }}>
              We're in early access. Get your shortlist within 48 hours. No cost until we prove the model works.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-ember">Reserve Early Access <ArrowRight /></button>
              <button className="btn-ghost">Talk to the founder <ArrowRight /></button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 18 }}>No dashboard to set up. No contract. Just a role spec and a skill list.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── TOGGLE ───────────────────────────────────────────────────────────────────
function AudienceToggle({ mode, onChange }) {
  return (
    <div style={{
      position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9998, display: 'flex', alignItems: 'center',
      background: 'rgba(15,14,12,0.9)', backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 34, padding: 4, gap: 3,
      boxShadow: '0 8px 28px rgba(0,0,0,0.28)', whiteSpace: 'nowrap',
    }}>
      {[{ key: 'student', label: "I'm a Student", ac: '#1A6B40' }, { key: 'startup', label: "I'm a Startup", ac: '#C94B1F' }].map(({ key, label, ac }) => (
        <button key={key} onClick={() => onChange(key)} style={{
          fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500,
          padding: '9px 20px', borderRadius: 26, border: 'none', cursor: 'pointer',
          transition: 'all 0.2s',
          background: mode === key ? ac : 'transparent',
          color: mode === key ? '#fff' : 'rgba(255,255,255,0.38)',
          letterSpacing: '0.01em',
        }}>{label}</button>
      ))}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mode, setMode] = useState('student');
  const handleSignIn = async () => {
    try { await signInWithGoogle(); }
    catch (e) { console.error('Sign in error:', e); alert('Failed to sign in. Please try again.'); }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ fontFamily: 'var(--sans)', background: 'var(--cream)', color: 'var(--ink)', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* NAV */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px clamp(24px,4vw,48px)', borderBottom: '1px solid var(--rule)', position: 'sticky', top: 0, background: 'rgba(247,244,239,0.92)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
          <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: '0.16em', color: 'var(--ink)', fontFamily: 'var(--sans)', textTransform: 'uppercase' }}>HUNT</span>
          <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--ink3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {mode === 'student' ? 'Internships. Not noise.' : 'Skill-first talent. Not noise.'}
          </span>
          {mode === 'student' ? (
            <button className="btn-ink" onClick={handleSignIn} style={{ padding: '9px 16px', fontSize: 12 }}><GoogleIcon /> Sign in with Google</button>
          ) : (
            <button className="btn-ember" style={{ padding: '9px 16px', fontSize: 12 }}>Reserve Early Access</button>
          )}
        </nav>

        {mode === 'student' ? <StudentPage onSignIn={handleSignIn} /> : <StartupPage />}

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid var(--rule)', padding: 'clamp(22px,3vw,34px) clamp(24px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, background: 'var(--cream)' }}>
          <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink)' }}>HUNT</span>
          <span style={{ fontSize: 11, color: 'var(--ink3)', fontWeight: 300, letterSpacing: '0.04em' }}>Internships. Not noise. · Built in India · 2025</span>
        </footer>

        <AudienceToggle mode={mode} onChange={setMode} />
      </div>
    </>
  );
}
