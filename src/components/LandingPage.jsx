// src/components/LandingPage.jsx
import React, { useEffect } from 'react';
import { signInWithGoogle } from '../services/supabase';

// ─── Google icon (inline so no extra dependency) ─────────────────────────────
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

// ─── Design tokens ────────────────────────────────────────────────────────────
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
};

// ─── Shared button styles ─────────────────────────────────────────────────────
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

// ─── Phone Animation Component ────────────────────────────────────────────────
function PhoneHero() {
  useEffect(() => {
    const scenes = [
      [
        { text: "What if you knew\nyour chances ", style: "color:#e0e0e0;" },
        { text: "BEFORE", style: "color:#4ade80;font-weight:700;" },
        { text: "\napplying for an\ninternship?", style: "color:#e0e0e0;" },
      ],
      [
        { text: "your jee rank\ndoesn't live here.\n\n", style: "color:#666666;" },
        { text: "your ", style: "color:#888888;" },
        { text: "github / projects\n", style: "color:#4ade80;font-weight:700;" },
        { text: "does.", style: "color:#888888;" },
      ],
      [
        { text: "swipe on\ninternships\n\n", style: "color:#e0e0e0;" },
        { text: "left = nope\n", style: "color:#666666;" },
        { text: "right = ", style: "color:#666666;" },
        { text: "let's go", style: "color:#4ade80;font-weight:700;" },
      ],
      [
        { text: "know your\n", style: "color:#666666;" },
        { text: "match score\n", style: "color:#4ade80;font-weight:700;" },
        { text: "before\napplying.", style: "color:#666666;" },
      ],
    ];

    const SCENE_DURATIONS = [3200, 3200, 3200, 99999];
    const CHAR_DELAY = 38;
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
        sp.style.cssText = `white-space:pre-wrap;font-family:monospace;font-size:11.5px;line-height:1.75;${p.style}`;
        container.appendChild(sp);
        return { el: sp, text: p.text };
      });

      let partIdx = 0, charIdx = 0;

      function tick() {
        if (stopped) return;
        if (partIdx >= spans.length) {
          sceneTimer = setTimeout(() => {
            if (currentScene < scenes.length - 1) {
              screen.style.transition = 'opacity 0.35s';
              screen.style.opacity = '0';
              setTimeout(() => {
                if (stopped) return;
                screen.style.opacity = '1';
                currentScene++;
                typeScene(currentScene);
              }, 380);
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

    const startTimer = setTimeout(() => typeScene(0), 500);
    return () => {
      stopped = true;
      clearTimeout(typeTimer);
      clearTimeout(sceneTimer);
      clearTimeout(startTimer);
    };
  }, []);

  return (
    <div style={{
      flexShrink: 0,
      width: '240px',
      height: '420px',
      pointerEvents: 'none',
      alignSelf: 'center',
    }}>
      <div style={{
        background: '#111',
        borderRadius: '36px',
        padding: '8px',
        boxShadow: '0 0 0 1px #333, 0 24px 48px rgba(0,0,0,0.18)',
        width: '240px',
        height: '420px',
      }}>
        <div style={{
          background: '#000',
          borderRadius: '30px',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #222',
        }}>
          {/* Notch */}
          <div style={{ padding: '10px 0 2px', display: 'flex', justifyContent: 'center', background: '#000' }}>
            <div style={{ width: '52px', height: '4px', background: '#1a1a1a', borderRadius: '2px' }} />
          </div>
          {/* Screen content */}
          <div
            id="hunt-phone-screen"
            style={{
              flex: 1,
              padding: '16px 14px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          />
          {/* Home bar */}
          <div style={{ padding: '0 0 10px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '3px', background: '#333', borderRadius: '2px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
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
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Editorial+New:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
        rel="stylesheet"
      />

      <div style={{ fontFamily: t.sans, background: t.white, color: t.black, minHeight: '100vh', WebkitFontSmoothing: 'antialiased', overflowX: 'hidden' }}>

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <nav style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          padding:         '20px 48px',
          borderBottom:    `1px solid ${t.gray100}`,
          position:        'sticky',
          top:             0,
          background:      'rgba(250,250,248,0.95)',
          backdropFilter:  'blur(8px)',
          zIndex:          100,
        }}>
          <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '0.12em', color: t.black }}>HUNT</span>
          <span style={{ fontSize: 11, fontWeight: 400, color: t.gray400, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Internships. Not noise.
          </span>
          <button
            onClick={handleSignIn}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.black, color: t.white, padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 400, cursor: 'pointer', border: 'none', fontFamily: t.sans }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            <GoogleIcon /> Sign in with Google
          </button>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px) 80px',
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 48,
        }}>

          {/* Left: text content */}
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

          {/* Right: phone */}
          <PhoneHero />

        </section>

        {/* ── STATS BAR ───────────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${t.gray100}`, borderBottom: `1px solid ${t.gray100}`, padding: 'clamp(16px,2vw,24px) clamp(20px,4vw,48px)', display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
          {[
            { num: '5',      numAccent: false, label: 'Applications / week' },
            { num: '40',     numAccent: true,  label: 'Min. interview rate %' },
            { num: '50',     numAccent: false, label: 'Max applicants / role' },
            { num: '0 ₹',    numAccent: false, label: 'Always free for students' },
          ].map((s, i, arr) => (
            <div key={i} style={{ flex: 1, minWidth: 140, padding: '0 clamp(12px,2vw,32px)', borderRight: i < arr.length - 1 ? `1px solid ${t.gray100}` : 'none', ...(i === 0 ? { paddingLeft: 0 } : {}) }}>
              <div style={{ fontFamily: t.serif, fontSize: 'clamp(24px,3vw,36px)', fontWeight: 400, color: s.numAccent ? t.green : t.black, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>
                {s.num}
              </div>
              <div style={{ fontSize: 11, fontWeight: 400, color: t.gray400, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,4vw,48px)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.gray400, marginBottom: 48, display: 'flex', alignItems: 'center', gap: 12 }}>
            How it works
            <span style={{ flex: 1, height: 1, background: t.gray100, maxWidth: 200, display: 'block' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0, border: `1px solid ${t.gray100}`, borderRadius: 8, overflow: 'hidden' }}>
            {[
              { n: '01', title: 'Build your skill profile',  desc: 'Add skills, projects, and work preferences. Takes 3 minutes. No resume required.' },
              { n: '02', title: 'Swipe through matches',     desc: 'See internships ranked by your match score. Only roles you actually qualify for.' },
              { n: '03', title: 'Apply to your top 5',       desc: '5 applications per week. Forces intent. See your match breakdown before you commit.' },
              { n: '04', title: 'Get in front of recruiters', desc: 'Recruiters see your ranked profile — skills first, nothing else. Hear back faster.' },
            ].map((step, i, arr) => (
              <div key={i} style={{ padding: '36px 28px', borderRight: i < arr.length - 1 ? `1px solid ${t.gray100}` : 'none' }}>
                <div style={{ fontFamily: t.serif, fontSize: 13, fontWeight: 400, color: t.gray400, marginBottom: 20 }}>{step.n}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: t.black, marginBottom: 10, lineHeight: 1.3 }}>{step.title}</div>
                <div style={{ fontSize: 13, fontWeight: 300, color: t.gray600, lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── THE DIFFERENCE ──────────────────────────────────────────────── */}
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

        {/* ── ON A HUNT (profile badges) ───────────────────────────────────── */}
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
              { initials: 'RK', name: 'Rohan Kumar',  detail: 'Full Stack · React, Node.js',      score: '87%' },
              { initials: 'PS', name: 'Priya Sharma', detail: 'Backend · Python, PostgreSQL',      score: '92%' },
              { initials: 'AM', name: 'Arjun Mehta',  detail: 'ML · PyTorch, Scikit-learn',        score: '78%' },
              { initials: 'SK', name: 'Sara Khan',    detail: 'Data · SQL, Pandas, Tableau',       score: '84%' },
              { initials: 'NP', name: 'Nikhil Patel', detail: 'DevOps · Docker, AWS, CI/CD',       score: '81%' },
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: `1px solid ${t.gray100}`, borderRadius: 8, background: t.white }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: t.gray600, flexShrink: 0 }}>
                  {p.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: t.black, fontSize: 13, lineHeight: 1, marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: t.gray400, fontWeight: 300 }}>{p.detail}</div>
                </div>
                <div style={{ marginLeft: 8, background: t.greenLight, color: t.green, fontSize: 12, fontWeight: 500, padding: '4px 8px', borderRadius: 4 }}>
                  {p.score}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BIG CTA ─────────────────────────────────────────────────────── */}
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

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer style={{ borderTop: `1px solid ${t.gray100}`, padding: 'clamp(24px,3vw,40px) clamp(20px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.12em', color: t.black }}>HUNT</span>
          <span style={{ fontSize: 12, color: t.gray400, fontWeight: 300 }}>Internships. Not noise. · Built in India · 2025</span>
        </footer>

      </div>
    </>
  );
}
