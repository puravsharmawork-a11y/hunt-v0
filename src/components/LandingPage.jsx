// src/components/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { signInWithGoogle } from '../services/supabase';
import { supabase } from '../services/supabase';

const FOUNDER_CALL_URL = 'https://wa.me/916367146875?text=Hi%20Purav%2C%20I%20found%20HUNT%20and%20want%20to%20hire%20an%20intern';

const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="currentColor" opacity=".9"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="currentColor" opacity=".9"/>
    <path d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706 0-.59.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9c0 1.45.348 2.826.957 4.038l3.007-2.332z" fill="currentColor" opacity=".9"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z" fill="currentColor" opacity=".9"/>
  </svg>
);
const CheckIcon = () => (
  <svg style={{ width:18, height:18, flexShrink:0, marginTop:1 }} viewBox="0 0 20 20" fill="none" stroke="#1A7A4A" strokeWidth="1.5">
    <circle cx="10" cy="10" r="8"/><path d="M6.5 10l3 3 4-5"/>
  </svg>
);
const CrossIcon = () => (
  <svg style={{ width:18, height:18, flexShrink:0, marginTop:1 }} viewBox="0 0 20 20" fill="none" stroke="#9B9B97" strokeWidth="1.5">
    <circle cx="10" cy="10" r="8"/><path d="M13 7l-6 6M7 7l6 6"/>
  </svg>
);

const t = {
  black:'#0A0A0A', white:'#FAFAF8', gray50:'#F5F5F2', gray100:'#EBEBEA',
  gray400:'#9B9B97', gray600:'#5A5A56', green:'#1A7A4A', greenLight:'#E8F5EE',
  serif:"'Editorial New', Georgia, serif", sans:"'DM Sans', system-ui, sans-serif",
  ember:'#D85A30', emberDim:'rgba(216,90,48,0.15)', emberBorder:'rgba(216,90,48,0.35)',
  s_bg:'#0C0B09', s_surface:'#131210', s_border:'rgba(255,255,255,0.08)',
  s_muted:'rgba(255,255,255,0.45)', s_body:'rgba(255,255,255,0.72)',
};
const btnPrimary = {
  display:'inline-flex', alignItems:'center', gap:10,
  background:t.black, color:t.white, padding:'14px 28px', borderRadius:6,
  fontSize:14, fontWeight:400, cursor:'pointer', border:'none',
  fontFamily:t.sans, transition:'opacity 0.15s',
};

// =============================================================================
// PREBOOK MODAL
// =============================================================================
function PreBookModal({ onClose }) {
  const [form, setForm]     = useState({ name:'', company:'', website:'', email:'', role:'', teamSize:'' });
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    const { name, company, email, role } = form;
    if (!name.trim() || !company.trim() || !email.trim() || !role.trim()) {
      setErrMsg('Name, company, email and role are required.'); return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) { setErrMsg('Enter a valid email address.'); return; }
    setErrMsg(''); setStatus('loading');
    const { error } = await supabase.from('recruiter_waitlist').insert([{
      name: form.name.trim(), company: form.company.trim(),
      website: form.website.trim() || null, email: form.email.trim(),
      role_looking_for: form.role.trim(), team_size: form.teamSize || null,
      source: 'landing_prebook',
    }]);
    if (error) {
      console.error('Supabase error:', error.message);
      setErrMsg('Something went wrong. Please try again.'); setStatus('error'); return;
    }
    setStatus('success');
  };

  const inp = {
    width:'100%', padding:'11px 14px', background:t.gray50,
    border:`1px solid ${t.gray100}`, borderRadius:6, color:t.black,
    fontSize:14, fontFamily:t.sans, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s',
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:t.white, border:`1px solid ${t.gray100}`, borderRadius:14, padding:'clamp(28px,5vw,44px)', width:'100%', maxWidth:480, position:'relative', boxShadow:'0 24px 64px rgba(0,0,0,0.12)', animation:'modalIn 0.22s cubic-bezier(0.22,1,0.36,1)' }}>
        <style>{`@keyframes modalIn { from{opacity:0;transform:translateY(10px) scale(0.98)} to{opacity:1;transform:none} }`}</style>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:18, background:'transparent', border:'none', cursor:'pointer', color:t.gray400, fontSize:22, lineHeight:1, fontFamily:t.sans }}>×</button>
        {status === 'success' ? (
          <div style={{ textAlign:'center', padding:'8px 0' }}>
            <div style={{ fontSize:44, marginBottom:18 }}>🎯</div>
            <h3 style={{ fontFamily:t.serif, fontSize:26, fontWeight:400, color:t.black, marginBottom:10, letterSpacing:'-0.02em' }}>You're on the list.</h3>
            <p style={{ fontSize:14, color:t.gray600, lineHeight:1.7, marginBottom:28, fontWeight:300 }}>We'll reach out personally when the recruiter side launches.</p>
            <button onClick={onClose} style={{ background:t.ember, color:'#fff', border:'none', borderRadius:6, padding:'12px 32px', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:t.sans }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom:26 }}>
              <div style={{ fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:t.ember, marginBottom:10 }}>Recruiter · Early access</div>
              <h3 style={{ fontFamily:t.serif, fontSize:26, fontWeight:400, color:t.black, lineHeight:1.15, marginBottom:8, letterSpacing:'-0.02em' }}>Reserve your spot.<br />We'll call you first.</h3>
              <p style={{ fontSize:13, color:t.gray600, lineHeight:1.65, fontWeight:300 }}>The recruiter dashboard isn't live yet. Fill this in and you'll get personal onboarding + early access when it is.</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
              <div>
                <label style={{ fontSize:11, color:t.gray400, display:'block', marginBottom:5, letterSpacing:'0.04em' }}>Your name <span style={{ color:t.ember }}>*</span></label>
                <input type="text" placeholder="Full name" value={form.name} onChange={set('name')} style={inp} onFocus={e => e.target.style.borderColor=t.ember} onBlur={e => e.target.style.borderColor=t.gray100} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ fontSize:11, color:t.gray400, display:'block', marginBottom:5, letterSpacing:'0.04em' }}>Company / startup <span style={{ color:t.ember }}>*</span></label>
                  <input type="text" placeholder="What you're building" value={form.company} onChange={set('company')} style={inp} onFocus={e => e.target.style.borderColor=t.ember} onBlur={e => e.target.style.borderColor=t.gray100} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:t.gray400, display:'block', marginBottom:5, letterSpacing:'0.04em' }}>Website</label>
                  <input type="text" placeholder="yoursite.com" value={form.website} onChange={set('website')} style={inp} onFocus={e => e.target.style.borderColor=t.ember} onBlur={e => e.target.style.borderColor=t.gray100} />
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, color:t.gray400, display:'block', marginBottom:5, letterSpacing:'0.04em' }}>Work email <span style={{ color:t.ember }}>*</span></label>
                <input type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} style={inp} onFocus={e => e.target.style.borderColor=t.ember} onBlur={e => e.target.style.borderColor=t.gray100} />
              </div>
              <div>
                <label style={{ fontSize:11, color:t.gray400, display:'block', marginBottom:5, letterSpacing:'0.04em' }}>Role you want to hire for <span style={{ color:t.ember }}>*</span></label>
                <input type="text" placeholder="e.g. Backend Intern, Design Intern" value={form.role} onChange={set('role')} style={inp} onFocus={e => e.target.style.borderColor=t.ember} onBlur={e => e.target.style.borderColor=t.gray100} />
              </div>
              <div>
                <label style={{ fontSize:11, color:t.gray400, display:'block', marginBottom:8, letterSpacing:'0.04em' }}>Team size</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {['1–5','6–20','21–50','50+'].map(size => (
                    <button key={size} onClick={() => setForm(p => ({ ...p, teamSize: p.teamSize === size ? '' : size }))} style={{ padding:'8px 16px', borderRadius:6, border:`1px solid ${form.teamSize === size ? t.ember : t.gray100}`, background:form.teamSize === size ? t.emberDim : t.gray50, color:form.teamSize === size ? t.ember : t.gray600, fontSize:13, fontFamily:t.sans, cursor:'pointer', transition:'all 0.15s', fontWeight:form.teamSize === size ? 500 : 400 }}>{size}</button>
                  ))}
                </div>
              </div>
            </div>
            {errMsg && <p style={{ fontSize:12, color:'#c0392b', marginBottom:12 }}>{errMsg}</p>}
            <button onClick={handleSubmit} disabled={status==='loading'} style={{ width:'100%', padding:13, background:status==='loading' ? t.gray400 : t.ember, color:'#fff', border:'none', borderRadius:6, fontSize:15, fontWeight:500, cursor:status==='loading' ? 'default' : 'pointer', fontFamily:t.sans, transition:'background 0.2s' }} onMouseOver={e => { if(status!=='loading') e.currentTarget.style.background='#c04e28'; }} onMouseOut={e => { if(status!=='loading') e.currentTarget.style.background=t.ember; }}>
              {status === 'loading' ? 'Saving...' : 'Get Early Access →'}
            </button>
            <p style={{ fontSize:11, color:t.gray400, marginTop:12, textAlign:'center', fontWeight:300 }}>No spam. No pitch deck. Just a heads-up when we're ready.</p>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// PHONE HERO
// =============================================================================
function PhoneHero() {
  useEffect(() => {
    const scenes = [
      [{ text:"What if you knew\nyour chances ", style:"color:#e0e0e0;font-size:20px;font-family:monospace;line-height:1.7;" },{ text:"BEFORE", style:"color:#4ade80;font-size:20px;font-family:monospace;font-weight:700;line-height:1.7;" },{ text:"\napplying for an\ninternship?", style:"color:#e0e0e0;font-size:20px;font-family:monospace;line-height:1.7;" }],
      [{ text:"Still hunting\ninternships in 2026\nthe old way?", style:"color:#888;font-size:19px;font-family:monospace;line-height:1.7;" },{ text:"\n\n😅", style:"color:#e0e0e0;font-size:26px;font-family:monospace;" }],
      [{ text:"Open\n", style:"color:#888;font-size:19px;font-family:monospace;line-height:1.8;" },{ text:"HUNT", style:"color:#4ade80;font-size:30px;font-family:monospace;font-weight:700;letter-spacing:3px;" }],
      [{ text:"→ complete your\n  profile\n", style:"color:#e0e0e0;font-size:18px;font-family:monospace;line-height:1.8;" },{ text:"\n(only takes 2 min\nor less, seriously)", style:"color:#555;font-size:15px;font-family:monospace;line-height:1.7;" }],
      [{ text:"→ swipe on\n  internships\n\n", style:"color:#e0e0e0;font-size:18px;font-family:monospace;line-height:1.8;" },{ text:"left = nope\n", style:"color:#888;font-size:16px;font-family:monospace;line-height:1.8;" },{ text:"right = ", style:"color:#888;font-size:16px;font-family:monospace;line-height:1.8;" },{ text:"let's go", style:"color:#4ade80;font-size:16px;font-family:monospace;font-weight:700;line-height:1.8;" }],
      [{ text:"that's it.\n", style:"color:#e0e0e0;font-size:22px;font-family:monospace;font-weight:700;line-height:1.8;" },{ text:"\nso easy\nand fast.", style:"color:#666;font-size:18px;font-family:monospace;line-height:1.8;" }],
      [{ text:"right now ", style:"color:#888;font-size:17px;font-family:monospace;line-height:1.8;" },{ text:"v0\n", style:"color:#4ade80;font-size:17px;font-family:monospace;font-weight:700;line-height:1.8;" },{ text:"\nonly for cs students\n", style:"color:#888;font-size:17px;font-family:monospace;line-height:1.8;" },{ text:"with actual skills.", style:"color:#4ade80;font-size:17px;font-family:monospace;font-weight:700;line-height:1.8;" }],
      [{ text:"your jee rank\ndoesn't live here.\n", style:"color:#555;font-size:16px;font-family:monospace;line-height:1.9;" },{ text:"\nyour\n", style:"color:#888;font-size:16px;font-family:monospace;line-height:1.9;" },{ text:"github / projects\n", style:"color:#4ade80;font-size:16px;font-family:monospace;font-weight:700;line-height:1.9;" },{ text:"does.\n", style:"color:#888;font-size:16px;font-family:monospace;line-height:1.9;" },{ text:"\ntry it.\n", style:"color:#666;font-size:15px;font-family:monospace;line-height:1.9;" },{ text:"roast it.\n", style:"color:#666;font-size:15px;font-family:monospace;line-height:1.9;" },{ text:"↗", style:"color:#4ade80;font-size:15px;font-family:monospace;" }],
    ];
    const SCENE_DURATIONS=[3200,2800,2600,3200,3200,2600,3200,99999];
    const CHAR_DELAY=36;
    const screen=document.getElementById('hunt-phone-screen');
    if(!screen) return;
    let stopped=false,typeTimer=null,sceneTimer=null,currentScene=0;
    function typeScene(idx){
      if(stopped) return;
      screen.innerHTML='';
      const container=document.createElement('div');
      screen.appendChild(container);
      const spans=scenes[idx].map(p=>{ const sp=document.createElement('span'); sp.style.cssText=p.style+'white-space:pre-wrap;'; container.appendChild(sp); return{el:sp,text:p.text}; });
      let partIdx=0,charIdx=0;
      function tick(){
        if(stopped) return;
        if(partIdx>=spans.length){ sceneTimer=setTimeout(()=>{ if(currentScene<scenes.length-1){ screen.style.transition='opacity 0.4s'; screen.style.opacity='0'; setTimeout(()=>{ if(stopped) return; screen.style.opacity='1'; currentScene++; typeScene(currentScene); },420); } },SCENE_DURATIONS[idx]); return; }
        const cur=spans[partIdx];
        if(charIdx<cur.text.length){ cur.el.textContent+=cur.text[charIdx]; charIdx++; typeTimer=setTimeout(tick,CHAR_DELAY); }
        else{ partIdx++; charIdx=0; typeTimer=setTimeout(tick,CHAR_DELAY); }
      }
      tick();
    }
    const startTimer=setTimeout(()=>typeScene(0),600);
    return()=>{ stopped=true; clearTimeout(typeTimer); clearTimeout(sceneTimer); clearTimeout(startTimer); };
  },[]);
  return (
    <div style={{ flexShrink:0, width:'300px', height:'530px', pointerEvents:'none', alignSelf:'center' }}>
      <div style={{ background:'#111', borderRadius:'44px', padding:'10px', boxShadow:'0 0 0 1px #333, 0 0 0 2px #222, 0 32px 64px rgba(0,0,0,0.22)', width:'300px', height:'530px' }}>
        <div style={{ background:'#000', borderRadius:'36px', overflow:'hidden', height:'100%', display:'flex', flexDirection:'column' }}>
          <div style={{ background:'#000', padding:'12px 0 4px', display:'flex', justifyContent:'center' }}><div style={{ width:'80px', height:'6px', background:'#1a1a1a', borderRadius:'3px' }} /></div>
          <div id="hunt-phone-screen" style={{ flex:1, padding:'24px 20px 48px', display:'flex', flexDirection:'column', justifyContent:'center' }} />
          <div style={{ height:'30px', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:'100px', height:'4px', background:'#333', borderRadius:'2px' }} /></div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CANDIDATE STACK HERO
// =============================================================================
function CandidateStackHero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const candidates = [
    { initials:'RK', color:'#D85A30', name:'Rahul Kumar', college:'LNMIIT, Jaipur', score:91, skills:['React','Node.js','PostgreSQL','Docker'], project:'E-comm Analytics Dashboard', projectDetail:'React + Node · Live on GitHub' },
    { initials:'PS', color:'#1A7A4A', name:'Priya Sharma', college:'VJTI Mumbai', score:87, skills:['Python','FastAPI','PostgreSQL','Redis'], project:'ML Price Predictor', projectDetail:'Python + Flask · Deployed on Render' },
    { initials:'AM', color:'#4A6FD8', name:'Arjun Mehta', college:'PES University', score:82, skills:['React','TypeScript','GraphQL'], project:'Open-source UI Library', projectDetail:'340 GitHub stars · Actively maintained' },
  ];
  useEffect(() => {
    const interval = setInterval(() => setActiveIdx(prev => (prev + 1) % candidates.length), 2800);
    return () => clearInterval(interval);
  }, []);
  const c = candidates[activeIdx];
  const scoreColor = c.score >= 85 ? t.ember : c.score >= 75 ? '#C9A227' : '#4A6FD8';
  return (
    <div style={{ flexShrink:0, width:'340px', alignSelf:'center', position:'relative' }}>
      <div style={{ position:'absolute', top:18, left:12, right:12, bottom:-8, background:'#1e1c18', borderRadius:16, border:`1px solid ${t.s_border}`, zIndex:0 }} />
      <div style={{ position:'absolute', top:9, left:6, right:6, bottom:-4, background:'#191714', borderRadius:16, border:`1px solid ${t.s_border}`, zIndex:1 }} />
      <div key={activeIdx} style={{ position:'relative', zIndex:2, background:'#111008', borderRadius:16, border:'1px solid rgba(255,255,255,0.12)', padding:'28px 28px 24px', boxShadow:'0 24px 64px rgba(0,0,0,0.5)', animation:'huntCardIn 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:'50%', background:c.color+'22', border:`1.5px solid ${c.color}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600, color:c.color, fontFamily:t.sans, flexShrink:0 }}>{c.initials}</div>
            <div>
              <div style={{ fontSize:16, fontWeight:600, color:'#fff', lineHeight:1.2, fontFamily:t.sans }}>{c.name}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.38)', marginTop:3, fontFamily:t.sans }}>{c.college}</div>
            </div>
          </div>
          <div style={{ background:scoreColor+'18', border:`1.5px solid ${scoreColor}55`, borderRadius:24, padding:'6px 14px', fontSize:17, fontWeight:700, color:scoreColor, fontFamily:t.sans, letterSpacing:'-0.01em', flexShrink:0 }}>{c.score}%</div>
        </div>
        <div style={{ height:1, background:'rgba(255,255,255,0.07)', marginBottom:16 }} />
        <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:18 }}>
          {c.skills.map((sk,i) => <span key={i} style={{ fontSize:12, padding:'5px 11px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, color:'rgba(255,255,255,0.72)', fontFamily:t.sans }}>{sk}</span>)}
        </div>
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'13px 16px' }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#fff', marginBottom:4, fontFamily:t.sans }}>{c.project}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', fontFamily:t.sans }}>{c.projectDetail}</div>
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:7, marginTop:20 }}>
        {candidates.map((_,i) => <div key={i} style={{ width:i===activeIdx?20:6, height:6, borderRadius:3, background:i===activeIdx?t.ember:'rgba(255,255,255,0.2)', transition:'all 0.3s' }} />)}
      </div>
      <style>{`@keyframes huntCardIn { from{opacity:0;transform:translateY(12px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }`}</style>
    </div>
  );
}

// =============================================================================
// STUDENT INTERACTIVE DEMO
// =============================================================================
const DEMO_JOBS = [
  { id:'j1', logo:'🚀', company:'TechFlow AI', role:'Backend Engineering Intern', stipend:'₹25,000/mo', duration:'6 months', location:'Remote', applicants:23, max:50, description:'Build scalable backend systems for an AI-powered analytics platform.', skills:['Node.js','PostgreSQL','REST APIs','Git'], niceToHave:['Docker','Redis'], match:88, comp:'Low', breakdown:{ 'Skill match':38, 'Project relevance':22, 'Experience fit':15, 'Tool match':9, 'Consistency':4 } },
  { id:'j2', logo:'🎨', company:'DesignStack', role:'Full Stack Developer Intern', stipend:'₹20,000/mo', duration:'3 months', location:'Hybrid · Mumbai', applicants:12, max:50, description:'Build modern web apps for creative agencies. React + Node stack.', skills:['React','Node.js','MongoDB','REST APIs'], niceToHave:['Next.js','TypeScript'], match:84, comp:'Low', breakdown:{ 'Skill match':35, 'Project relevance':20, 'Experience fit':15, 'Tool match':8, 'Consistency':6 } },
  { id:'j3', logo:'📊', company:'DataMinds', role:'ML Engineering Intern', stipend:'₹30,000/mo', duration:'6 months', location:'Bangalore · On-site', applicants:45, max:50, description:'Work on NLP models for customer sentiment analysis at scale.', skills:['Python','Machine Learning','SQL','Data Analysis'], niceToHave:['TensorFlow','PyTorch'], match:61, comp:'High', breakdown:{ 'Skill match':26, 'Project relevance':14, 'Experience fit':15, 'Tool match':4, 'Consistency':2 } },
  { id:'j4', logo:'☁️', company:'CloudScale', role:'DevOps Intern', stipend:'₹28,000/mo', duration:'6 months', location:'Remote', applicants:38, max:50, description:'Automate deployment pipelines and infrastructure.', skills:['Linux','Docker','Python','CI/CD'], niceToHave:['Kubernetes','AWS'], match:55, comp:'Medium', breakdown:{ 'Skill match':22, 'Project relevance':12, 'Experience fit':15, 'Tool match':6, 'Consistency':0 } },
];

const STUDENT_SKILLS = ['React','Node.js','Python','PostgreSQL','REST APIs','Git'];

const FEED_POSTS = [
  { id:1, author:'Priya Sharma', avatar:'PS', college:'VJTI Mumbai', time:'2h ago', content:'Just got my first backend internship offer through HUNT! The match score actually matched — they asked exactly what I knew.', likes:24, comments:6, tag:'win' },
  { id:2, author:'Rahul Kumar', avatar:'RK', college:'LNMIIT Jaipur', time:'5h ago', content:'Pro tip: link your GitHub projects properly. Recruiters on HUNT actually look at them. Got 3 interview calls this week.', likes:41, comments:11, tag:'tip' },
  { id:3, author:'Arjun Mehta', avatar:'AM', college:'PES University', time:'1d ago', content:'Rejected by 40 places on LinkedIn. Got shortlisted by 2 out of 3 applications here. The intentional limit actually helps you think before applying.', likes:87, comments:22, tag:'story' },
];

const CONNECTIONS = [
  { initials:'SK', name:'Sara Khan', college:'IIT Bombay', role:'ML Intern @ Flipkart', mutual:3, color:'#7C3AED' },
  { initials:'NP', name:'Nikhil Patel', college:'BITS Pilani', role:'Full Stack @ Razorpay', mutual:5, color:'#0369A1' },
  { initials:'DM', name:'Divya Mehta', college:'NIT Trichy', role:'DevOps Intern @ AWS', mutual:2, color:'#047857' },
];

const INSIGHTS = [
  { title:'React demand up 34% this quarter', tag:'Trending', time:'Today', icon:'📈' },
  { title:'Startups are hiring backend devs 2x faster than frontend', tag:'Insight', time:'2d ago', icon:'⚡' },
  { title:'How to make your GitHub profile stand out to recruiters', tag:'Guide', time:'3d ago', icon:'✦' },
  { title:'₹30k+ internships: which skills actually get you there', tag:'Analysis', time:'1w ago', icon:'💡' },
];

function StudentDemo() {
  const [activeTab, setActiveTab] = useState('swipe');
  const [jobIdx, setJobIdx] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [applied, setApplied] = useState([]);
  const [skipped, setSkipped] = useState(0);
  const [weekly, setWeekly] = useState(5);
  const [swipeAnim, setSwipeAnim] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [connectedTo, setConnectedTo] = useState({});
  const [toast, setToast] = useState(null);

  const job = DEMO_JOBS[jobIdx];

  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  const doSwipe = (dir) => {
    if (!job) return;
    if (dir === 'right' && !showBreakdown) { setShowBreakdown(true); return; }
    if (dir === 'right' && showBreakdown) { doApply(); return; }
    setSwipeAnim(dir);
    setTimeout(() => {
      setSkipped(s => s + 1);
      setJobIdx(i => i + 1);
      setShowBreakdown(false);
      setSwipeAnim(null);
    }, 240);
  };

  const doApply = () => {
    if (weekly <= 0) { showToast('Weekly limit reached!', 'warn'); return; }
    setSwipeAnim('right');
    setTimeout(() => {
      setApplied(a => [...a, { ...job, appliedAt: new Date() }]);
      setWeekly(w => w - 1);
      setJobIdx(i => i + 1);
      setShowBreakdown(false);
      setSwipeAnim(null);
      showToast('Application submitted!');
    }, 240);
  };

  const tabStyle = (id) => ({
    padding:'7px 14px', fontSize:12, fontWeight:500, borderRadius:20,
    border:'none', cursor:'pointer', fontFamily:t.sans, transition:'all 0.18s',
    background: activeTab === id ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.38)',
    letterSpacing:'0.01em',
  });

  const compColor = (c) => c==='High'?'rgba(224,92,75,0.85)':c==='Medium'?t.ember:'#2EAD6A';

  return (
    <div style={{ fontFamily:t.sans, background:'#0C0B09', borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)', position:'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'absolute', top:16, left:'50%', transform:'translateX(-50%)', zIndex:50, padding:'8px 18px', borderRadius:8, fontSize:12, fontWeight:500, background: toast.type==='warn'?'rgba(216,90,48,0.92)':'rgba(26,122,74,0.92)', color:'#fff', whiteSpace:'nowrap', boxShadow:'0 4px 20px rgba(0,0,0,0.4)', animation:'fadeInDown 0.25s ease', pointerEvents:'none' }}>
          {toast.msg}
        </div>
      )}

      {/* App top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'#0f0e0c' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Profile chip */}
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 10px 4px 4px', background:'rgba(255,255,255,0.06)', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(26,122,74,0.3)', border:'1.5px solid rgba(26,122,74,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:600, color:'#2EAD6A' }}>PS</div>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.55)', fontWeight:500 }}>Priya Sharma</span>
          </div>
          {/* Profile completeness pill */}
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px', background:'rgba(26,122,74,0.12)', borderRadius:20, border:'1px solid rgba(26,122,74,0.25)' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'#2EAD6A' }} />
            <span style={{ fontSize:10, color:'#2EAD6A', fontWeight:500 }}>92% profile</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ padding:'3px 10px', background:'rgba(255,255,255,0.05)', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)', fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:500 }}>
            ⚡ {weekly}/5 left
          </div>
          <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:600, color:'rgba(255,255,255,0.4)' }}>PS</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', alignItems:'center', gap:2, padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        {[
          { id:'swipe', label:'Jobs' },
          { id:'feed', label:'Feed' },
          { id:'network', label:'Network' },
          { id:'insights', label:'Insights' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={tabStyle(tab.id)}>{tab.label}</button>
        ))}
        {applied.length > 0 && (
          <button onClick={() => setActiveTab('applied')} style={{ ...tabStyle('applied'), marginLeft:'auto' }}>
            Applied ({applied.length})
          </button>
        )}
      </div>

      {/* Tab content */}
      <div style={{ padding:'16px 20px 20px', minHeight:400 }}>

        {/* ── JOBS / SWIPE TAB ── */}
        {activeTab === 'swipe' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {/* Left: job card */}
            <div>
              {!job ? (
                <div style={{ textAlign:'center', padding:'60px 20px' }}>
                  <div style={{ fontSize:36, marginBottom:12 }}>🎯</div>
                  <p style={{ fontFamily:'Georgia,serif', fontSize:18, color:'rgba(255,255,255,0.6)', marginBottom:8 }}>All caught up.</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginBottom:20 }}>You've reviewed all demo roles.</p>
                  <button onClick={() => { setJobIdx(0); setApplied([]); setSkipped(0); setWeekly(5); setShowBreakdown(false); }} style={{ padding:'8px 20px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:6, color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer', fontFamily:t.sans }}>
                    Start over
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ background:'#131210', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, overflow:'hidden', transition:'transform 0.22s ease, opacity 0.22s ease', transform: swipeAnim==='right'?'translateX(180px) rotate(6deg)':swipeAnim==='left'?'translateX(-180px) rotate(-6deg)':'none', opacity: swipeAnim ? 0 : 1 }}>
                    {/* Card header */}
                    <div style={{ padding:'14px 16px 12px', background:'#1a1916', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                        <span style={{ fontSize:28 }}>{job.logo}</span>
                        <div>
                          <div style={{ fontSize:10, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:2 }}>{job.company}</div>
                          <div style={{ fontFamily:'Georgia,serif', fontSize:14, fontWeight:400, color:'#fff', lineHeight:1.25 }}>{job.role}</div>
                        </div>
                      </div>
                      <div style={{ padding:'5px 10px', borderRadius:20, fontSize:14, fontFamily:'Georgia,serif', background: job.match>=75?'rgba(46,173,106,0.15)':'rgba(216,90,48,0.15)', color: job.match>=75?'#2EAD6A':t.ember, border:`1.5px solid ${job.match>=75?'rgba(46,173,106,0.35)':'rgba(216,90,48,0.35)'}`, flexShrink:0 }}>{job.match}%</div>
                    </div>
                    <div style={{ padding:'12px 16px 16px' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                        {[job.stipend, job.duration, job.location, `${job.applicants}/${job.max} applied`].map((v,i) => (
                          <div key={i} style={{ fontSize:11, color:'rgba(255,255,255,0.38)' }}>{v}</div>
                        ))}
                      </div>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:4, marginBottom:10, fontSize:10, fontWeight:500, padding:'2px 8px', borderRadius:10, background: job.comp==='High'?'rgba(224,92,75,0.12)':job.comp==='Medium'?'rgba(216,90,48,0.1)':'rgba(46,173,106,0.1)', color: compColor(job.comp), border:`1px solid ${compColor(job.comp)}40` }}>
                        {job.comp} competition
                      </div>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.5, marginBottom:10 }}>{job.description}</p>
                      {/* Skills */}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {job.skills.map(s => (
                          <span key={s} style={{ fontSize:10, padding:'3px 8px', borderRadius:10, background: STUDENT_SKILLS.includes(s)?'rgba(46,173,106,0.12)':'rgba(255,255,255,0.04)', border:`1px solid ${STUDENT_SKILLS.includes(s)?'rgba(46,173,106,0.35)':'rgba(255,255,255,0.09)'}`, color: STUDENT_SKILLS.includes(s)?'#2EAD6A':'rgba(255,255,255,0.38)' }}>{s}</span>
                        ))}
                        {job.niceToHave.map(s => (
                          <span key={s} style={{ fontSize:10, padding:'3px 8px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.25)' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Swipe buttons */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginTop:14 }}>
                    <button onClick={() => doSwipe('left')} style={{ width:44, height:44, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.1)', background:'#131210', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(224,92,75,0.8)', transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(224,92,75,0.1)';e.currentTarget.style.borderColor='rgba(224,92,75,0.4)'}} onMouseLeave={e=>{e.currentTarget.style.background='#131210';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}}>✕</button>
                    <span style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.18)' }}>swipe</span>
                    <button onClick={() => doSwipe('right')} style={{ width:44, height:44, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.1)', background:'#131210', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#2EAD6A', transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(46,173,106,0.1)';e.currentTarget.style.borderColor='rgba(46,173,106,0.4)'}} onMouseLeave={e=>{e.currentTarget.style.background='#131210';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}}>♥</button>
                  </div>
                </>
              )}
            </div>

            {/* Right: breakdown or applied list */}
            <div>
              {showBreakdown && job ? (
                <div style={{ background:'#131210', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, padding:'16px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                    <div>
                      <div style={{ fontSize:10, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:3 }}>Match breakdown</div>
                      <div style={{ fontFamily:'Georgia,serif', fontSize:24, color: job.match>=75?'#2EAD6A':t.ember }}>{job.match}%</div>
                    </div>
                    <span style={{ fontSize:24 }}>{job.logo}</span>
                  </div>
                  {Object.entries(job.breakdown).map(([k,v]) => (
                    <div key={k} style={{ marginBottom:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                        <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{k}</span>
                        <span style={{ fontSize:10, fontWeight:500, color:'rgba(255,255,255,0.6)' }}>{v}%</span>
                      </div>
                      <div style={{ height:3, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${(v/40)*100}%`, background:'#2EAD6A', borderRadius:2, transition:'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:6 }}>
                    <button onClick={doApply} disabled={weekly<=0} style={{ width:'100%', padding:'10px', background: weekly>0?'#2EAD6A':'rgba(255,255,255,0.08)', color: weekly>0?'#fff':'rgba(255,255,255,0.3)', border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor: weekly>0?'pointer':'default', fontFamily:t.sans, transition:'opacity 0.15s' }} onMouseEnter={e=>{if(weekly>0)e.currentTarget.style.opacity='0.85'}} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                      {weekly>0?'Apply now →':'Weekly limit reached'}
                    </button>
                    <button onClick={() => { setShowBreakdown(false); setSwipeAnim('left'); setTimeout(() => { setJobIdx(i=>i+1); setSkipped(s=>s+1); setSwipeAnim(null); }, 240); }} style={{ width:'100%', padding:'8px', background:'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, fontSize:12, color:'rgba(255,255,255,0.35)', cursor:'pointer', fontFamily:t.sans }}>
                      Skip for now
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background:'#131210', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'16px' }}>
                  <div style={{ fontSize:10, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginBottom:12 }}>Applied this week</div>
                  {applied.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'28px 0' }}>
                      <div style={{ fontSize:28, marginBottom:8 }}>🎯</div>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)' }}>No applications yet</p>
                      <p style={{ fontSize:10, color:'rgba(255,255,255,0.15)', marginTop:4 }}>Swipe right to see match breakdown</p>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {applied.map((aj, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:8, border:'1px solid rgba(255,255,255,0.06)', animation:'slideUp 0.3s ease' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:18 }}>{aj.logo}</span>
                            <div>
                              <div style={{ fontSize:11, fontWeight:500, color:'#fff' }}>{aj.role}</div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{aj.company}</div>
                            </div>
                          </div>
                          <div style={{ fontFamily:'Georgia,serif', fontSize:16, color:'#2EAD6A' }}>{aj.match}%</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:11, color:'rgba(255,255,255,0.28)' }}>
                      <span>Remaining</span>
                      <span style={{ fontFamily:'Georgia,serif', color:'rgba(255,255,255,0.7)' }}>{weekly}/5</span>
                    </div>
                    <div style={{ height:3, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(weekly/5)*100}%`, background:t.ember, borderRadius:2, transition:'width 0.4s' }} />
                    </div>
                  </div>
                  {/* Stats */}
                  <div style={{ display:'flex', gap:12, marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    {[{v:`${Math.min(jobIdx,DEMO_JOBS.length)}/${DEMO_JOBS.length}`,l:'Reviewed',c:'rgba(255,255,255,0.7)'},{v:applied.length,l:'Applied',c:'#2EAD6A'},{v:skipped,l:'Skipped',c:'rgba(255,255,255,0.3)'}].map(s=>(
                      <div key={s.l} style={{ textAlign:'center', flex:1 }}>
                        <div style={{ fontFamily:'Georgia,serif', fontSize:16, color:s.c }}>{s.v}</div>
                        <div style={{ fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', marginTop:2 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FEED TAB ── */}
        {activeTab === 'feed' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {FEED_POSTS.map(post => (
              <div key={post.id} style={{ background:'#131210', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.55)' }}>{post.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.8)' }}>{post.author}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)' }}>{post.college} · {post.time}</div>
                  </div>
                  <span style={{ fontSize:9, padding:'2px 8px', borderRadius:10, background: post.tag==='win'?'rgba(46,173,106,0.12)':post.tag==='tip'?'rgba(216,90,48,0.12)':'rgba(255,255,255,0.06)', color: post.tag==='win'?'#2EAD6A':post.tag==='tip'?t.ember:'rgba(255,255,255,0.35)', border:`1px solid ${post.tag==='win'?'rgba(46,173,106,0.25)':post.tag==='tip'?'rgba(216,90,48,0.25)':'rgba(255,255,255,0.08)'}`, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.06em' }}>{post.tag}</span>
                </div>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.55)', lineHeight:1.55, marginBottom:10 }}>{post.content}</p>
                <div style={{ display:'flex', gap:12 }}>
                  <button onClick={() => { setLikedPosts(p=>({...p,[post.id]:!p[post.id]})); if(!likedPosts[post.id]) showToast('Liked!'); }} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)', background: likedPosts[post.id]?'rgba(216,90,48,0.1)':'transparent', color: likedPosts[post.id]?t.ember:'rgba(255,255,255,0.3)', fontSize:11, cursor:'pointer', fontFamily:t.sans, transition:'all 0.15s' }}>
                    ♥ {post.likes + (likedPosts[post.id]?1:0)}
                  </button>
                  <button style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'rgba(255,255,255,0.3)', fontSize:11, cursor:'pointer', fontFamily:t.sans }}>
                    💬 {post.comments}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── NETWORK TAB ── */}
        {activeTab === 'network' && (
          <div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.28)', marginBottom:12, fontWeight:500, letterSpacing:'0.06em', textTransform:'uppercase' }}>People you may know</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {CONNECTIONS.map((c,i) => (
                <div key={i} style={{ background:'#131210', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:c.color+'20', border:`1.5px solid ${c.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:c.color, flexShrink:0 }}>{c.initials}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.8)' }}>{c.name}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{c.college}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:2 }}>{c.role}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.2)', marginBottom:6 }}>{c.mutual} mutual</div>
                    <button onClick={() => { setConnectedTo(p=>({...p,[i]:true})); if(!connectedTo[i]) showToast('Request sent!'); }} style={{ padding:'5px 12px', borderRadius:20, border: connectedTo[i]?'1px solid rgba(46,173,106,0.4)':'1px solid rgba(255,255,255,0.14)', background: connectedTo[i]?'rgba(46,173,106,0.1)':'transparent', color: connectedTo[i]?'#2EAD6A':'rgba(255,255,255,0.45)', fontSize:10, fontWeight:500, cursor:'pointer', fontFamily:t.sans, transition:'all 0.15s' }}>
                      {connectedTo[i] ? '✓ Connected' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INSIGHTS TAB ── */}
        {activeTab === 'insights' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {INSIGHTS.map((item, i) => (
              <div key={i} style={{ background:'#131210', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', transition:'border-color 0.15s' }} onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
                <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.75)', lineHeight:1.35, marginBottom:4 }}>{item.title}</div>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    <span style={{ fontSize:9, padding:'1px 7px', borderRadius:10, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.35)', fontWeight:500, letterSpacing:'0.05em', textTransform:'uppercase' }}>{item.tag}</span>
                    <span style={{ fontSize:9, color:'rgba(255,255,255,0.2)' }}>{item.time}</span>
                  </div>
                </div>
                <span style={{ fontSize:14, color:'rgba(255,255,255,0.18)' }}>→</span>
              </div>
            ))}
          </div>
        )}

        {/* ── APPLIED TAB ── */}
        {activeTab === 'applied' && (
          <div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.28)', marginBottom:12, fontWeight:500, letterSpacing:'0.06em', textTransform:'uppercase' }}>Your applications</div>
            {applied.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0' }}>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.25)' }}>No applications yet</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {applied.map((aj,i) => (
                  <div key={i} style={{ background:'#131210', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:22 }}>{aj.logo}</span>
                      <div>
                        <div style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.8)' }}>{aj.role}</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{aj.company} · {aj.location}</div>
                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.18)', marginTop:2 }}>{aj.stipend}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'Georgia,serif', fontSize:18, color:'#2EAD6A' }}>{aj.match}%</div>
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.2)' }}>match</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes fadeInDown { from{opacity:0;transform:translateX(-50%) translateY(-8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>
    </div>
  );
}

// =============================================================================
// RECRUITER INTERACTIVE DEMO
// =============================================================================
const DEMO_ROLE = {
  title: 'Backend Engineering Intern',
  company: 'TechFlow AI',
  location: 'Remote',
  stipend: '₹25,000/mo',
  skills: ['Node.js','PostgreSQL','REST APIs','Git','Docker'],
  cap: 6,
};

const RECRUITER_CANDIDATES = [
  { initials:'PS', color:'#1A7A4A', name:'Priya Sharma', college:'VJTI Mumbai', year:'3rd Year', score:88, skills:['Node.js','PostgreSQL','REST APIs','Git'], project:'E-commerce Dashboard', projectDetail:'React + Node · Live on GitHub · 12 commits last week', github:'92 repos · 847 contributions', breakdown:{ 'Skill match':38, 'Project relevance':22, 'Experience fit':15, 'Tool match':9, 'Consistency':4 } },
  { initials:'RK', color:'#D85A30', name:'Rahul Kumar', college:'LNMIIT Jaipur', year:'3rd Year', score:81, skills:['Node.js','Python','PostgreSQL','Docker'], project:'API Gateway Service', projectDetail:'Python + FastAPI · Production deployed', github:'67 repos · 623 contributions', breakdown:{ 'Skill match':33, 'Project relevance':20, 'Experience fit':15, 'Tool match':9, 'Consistency':4 } },
  { initials:'AM', color:'#4A6FD8', name:'Arjun Mehta', college:'PES University', year:'4th Year', score:74, skills:['Node.js','REST APIs','Git'], project:'Open-source CLI Tool', projectDetail:'Node.js · 340 GitHub stars', github:'48 repos · 401 contributions', breakdown:{ 'Skill match':28, 'Project relevance':16, 'Experience fit':15, 'Tool match':8, 'Consistency':7 } },
];

function RecruiterDemo({ onOpenPreBook }) {
  const [step, setStep] = useState('listing'); // listing | reviewing
  const [selectedCand, setSelectedCand] = useState(0);
  const [candidateStatus, setCandidateStatus] = useState({});
  const [toast, setToast] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  const handleStatus = (i, status) => {
    setCandidateStatus(p => ({ ...p, [i]: status }));
    const msgs = { shortlist:'Shortlisted! They will be notified.', pass:'Passed on this candidate.', interview:'Interview request sent!' };
    showToast(msgs[status] || 'Done!', status==='pass'?'warn':'success');
    if (i < RECRUITER_CANDIDATES.length - 1) setTimeout(() => setSelectedCand(i+1), 400);
  };

  const c = RECRUITER_CANDIDATES[selectedCand];
  const statusColors = { shortlist:{ bg:'rgba(46,173,106,0.12)', border:'rgba(46,173,106,0.3)', text:'#2EAD6A' }, interview:{ bg:'rgba(74,111,216,0.12)', border:'rgba(74,111,216,0.3)', text:'#7B9FF0' }, pass:{ bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)', text:'rgba(255,255,255,0.3)' } };

  return (
    <div style={{ fontFamily:t.sans, background:'#FAFAF8', borderRadius:16, overflow:'hidden', border:'1px solid #EBEBEA', position:'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'absolute', top:16, left:'50%', transform:'translateX(-50%)', zIndex:50, padding:'8px 18px', borderRadius:8, fontSize:12, fontWeight:500, background: toast.type==='warn'?'rgba(100,100,100,0.95)':'rgba(26,122,74,0.92)', color:'#fff', whiteSpace:'nowrap', boxShadow:'0 4px 20px rgba(0,0,0,0.15)', animation:'fadeInDown 0.25s ease', pointerEvents:'none' }}>
          {toast.msg}
        </div>
      )}

      {/* App top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', borderBottom:'1px solid #EBEBEA', background:'#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:13, fontWeight:500, letterSpacing:'0.12em', color:t.black }}>HUNT</span>
          <span style={{ fontSize:10, color:'#9B9B97', letterSpacing:'0.06em', textTransform:'uppercase' }}>Recruiter</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ padding:'3px 10px', background:t.emberDim, borderRadius:20, border:`1px solid ${t.emberBorder}`, fontSize:10, color:t.ember, fontWeight:500 }}>Early access</div>
          <div style={{ width:26, height:26, borderRadius:'50%', background:'#F5F5F2', border:'1px solid #EBEBEA', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:600, color:'#9B9B97' }}>TF</div>
        </div>
      </div>

      {step === 'listing' ? (
        /* ── CREATE LISTING STEP ── */
        <div style={{ padding:'24px 28px' }}>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:t.ember, marginBottom:8 }}>Post a role</div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:22, fontWeight:400, color:t.black, letterSpacing:'-0.01em', lineHeight:1.1, marginBottom:4 }}>Tell us what you need.<br /><em style={{ color:t.ember }}>We'll find who fits.</em></div>
            <p style={{ fontSize:12, color:t.gray600, lineHeight:1.5, fontWeight:300 }}>No lengthy JD. Just the skill spec. We do the rest.</p>
          </div>

          {/* Mock form — read only for demo */}
          <div style={{ background:'#F5F5F2', borderRadius:12, padding:'16px', border:'1px solid #EBEBEA', marginBottom:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              {[{label:'Role title',val:'Backend Engineering Intern'},{label:'Company',val:'TechFlow AI'},{label:'Stipend',val:'₹25,000/mo'},{label:'Duration',val:'6 months'}].map((f,i)=>(
                <div key={i}>
                  <div style={{ fontSize:9, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'#9B9B97', marginBottom:4 }}>{f.label}</div>
                  <div style={{ padding:'7px 10px', background:'#fff', border:'1px solid #EBEBEA', borderRadius:6, fontSize:12, color:t.black }}>{f.val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:9, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'#9B9B97', marginBottom:6 }}>Required skills <span style={{ color:t.ember }}>*</span></div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {DEMO_ROLE.skills.map(s=>(
                  <span key={s} style={{ fontSize:11, padding:'4px 10px', borderRadius:20, background:'#fff', border:'1px solid #EBEBEA', color:'#5A5A56' }}>{s}</span>
                ))}
                <span style={{ fontSize:11, padding:'4px 10px', borderRadius:20, background:t.emberDim, border:`1px solid ${t.emberBorder}`, color:t.ember }}>+ Add skill</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:9, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'#9B9B97', marginBottom:4 }}>Max shortlist</div>
              <div style={{ display:'flex', gap:6 }}>
                {[3,4,5,6].map(n=>(
                  <div key={n} style={{ width:32, height:32, borderRadius:6, border:`1.5px solid ${n===6?t.ember:'#EBEBEA'}`, background:n===6?t.emberDim:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:500, color:n===6?t.ember:'#9B9B97', cursor:'pointer' }}>{n}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ flex:1, height:1, background:'#EBEBEA' }} />
            <span style={{ fontSize:10, color:'#9B9B97', letterSpacing:'0.04em' }}>or see live demo</span>
            <div style={{ flex:1, height:1, background:'#EBEBEA' }} />
          </div>

          <button onClick={() => { setIsPosting(true); setTimeout(() => { setIsPosting(false); setStep('reviewing'); }, 1200); }} style={{ width:'100%', padding:'12px', background: isPosting?t.gray400:t.ember, color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor: isPosting?'default':'pointer', fontFamily:t.sans, transition:'background 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {isPosting ? (
              <>
                <span style={{ display:'inline-block', width:12, height:12, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                Matching candidates…
              </>
            ) : 'Post role & see matched candidates →'}
          </button>
          <p style={{ fontSize:11, color:t.gray400, textAlign:'center', marginTop:8, fontWeight:300 }}>Demo only — no real data posted</p>
        </div>

      ) : (
        /* ── REVIEWING CANDIDATES STEP ── */
        <div style={{ padding:'0' }}>
          {/* Sub-header */}
          <div style={{ padding:'12px 20px', borderBottom:'1px solid #EBEBEA', background:'#F5F5F2', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:12, fontWeight:500, color:t.black }}>{DEMO_ROLE.title}</div>
              <div style={{ fontSize:10, color:t.gray400 }}>{DEMO_ROLE.company} · {DEMO_ROLE.location}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background:'rgba(26,122,74,0.1)', border:'1px solid rgba(26,122,74,0.25)', color:t.green, fontWeight:500 }}>{RECRUITER_CANDIDATES.length}/{DEMO_ROLE.cap} matched</span>
              <button onClick={() => setStep('listing')} style={{ fontSize:10, padding:'3px 10px', background:'transparent', border:'1px solid #EBEBEA', borderRadius:20, color:t.gray400, cursor:'pointer', fontFamily:t.sans }}>← Back</button>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', minHeight:380 }}>
            {/* Candidate list */}
            <div style={{ borderRight:'1px solid #EBEBEA', padding:'12px 0' }}>
              {RECRUITER_CANDIDATES.map((cand, i) => {
                const st = candidateStatus[i];
                const stStyle = st ? statusColors[st] : null;
                return (
                  <div key={i} onClick={() => setSelectedCand(i)} style={{ padding:'10px 14px', cursor:'pointer', background: selectedCand===i?'#fff':'transparent', borderRight: selectedCand===i?`2px solid ${t.ember}`:'2px solid transparent', transition:'all 0.15s' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <div style={{ width:26, height:26, borderRadius:'50%', background:cand.color+'18', border:`1.5px solid ${cand.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:600, color:cand.color, flexShrink:0 }}>{cand.initials}</div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:500, color:t.black, lineHeight:1.2 }}>{cand.name}</div>
                        <div style={{ fontSize:9, color:t.gray400 }}>{cand.college}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:'Georgia,serif', fontSize:14, color: cand.score>=85?t.green:cand.score>=75?t.ember:'#888' }}>{cand.score}%</span>
                      {st && <span style={{ fontSize:8, padding:'1px 6px', borderRadius:8, background:stStyle.bg, border:`1px solid ${stStyle.border}`, color:stStyle.text, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' }}>{st}</span>}
                      {i===0 && !st && <span style={{ fontSize:8, padding:'1px 6px', borderRadius:8, background:'rgba(26,122,74,0.1)', color:t.green, fontWeight:500, letterSpacing:'0.04em' }}>Top</span>}
                    </div>
                  </div>
                );
              })}
              <div style={{ padding:'10px 14px', borderTop:'1px solid #EBEBEA', marginTop:4 }}>
                <div style={{ fontSize:9, color:t.gray400, lineHeight:1.5 }}>Max {DEMO_ROLE.cap} candidates per role. Skill-first, always.</div>
              </div>
            </div>

            {/* Candidate detail */}
            <div style={{ padding:'16px 18px', overflowY:'auto' }}>
              {c && (
                <>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:c.color+'18', border:`1.5px solid ${c.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:c.color }}>{c.initials}</div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:500, color:t.black }}>{c.name}</div>
                        <div style={{ fontSize:10, color:t.gray400 }}>{c.college} · {c.year}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'Georgia,serif', fontSize:22, color: c.score>=85?t.green:c.score>=75?t.ember:'#888', lineHeight:1 }}>{c.score}%</div>
                      <div style={{ fontSize:9, color:t.gray400 }}>match score</div>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div style={{ background:'#F5F5F2', border:'1px solid #EBEBEA', borderRadius:10, padding:'12px 14px', marginBottom:12 }}>
                    <div style={{ fontSize:9, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:t.gray400, marginBottom:10 }}>Score breakdown</div>
                    {Object.entries(c.breakdown).map(([k,v])=>(
                      <div key={k} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <span style={{ fontSize:10, color:t.gray600, width:100, flexShrink:0 }}>{k}</span>
                        <div style={{ flex:1, height:3, background:'#EBEBEA', borderRadius:2, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${(v/40)*100}%`, background:t.green, borderRadius:2 }} />
                        </div>
                        <span style={{ fontSize:10, fontWeight:500, color:t.black, width:24, textAlign:'right' }}>{v}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:9, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:t.gray400, marginBottom:6 }}>Matched skills</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {c.skills.map(s=>(
                        <span key={s} style={{ fontSize:10, padding:'3px 8px', borderRadius:10, background:t.greenLight, border:'1px solid rgba(26,122,74,0.2)', color:t.green }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Project */}
                  <div style={{ background:'#F5F5F2', border:'1px solid #EBEBEA', borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
                    <div style={{ fontSize:9, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:t.gray400, marginBottom:6 }}>Top project</div>
                    <div style={{ fontSize:12, fontWeight:500, color:t.black, marginBottom:2 }}>{c.project}</div>
                    <div style={{ fontSize:10, color:t.gray600 }}>{c.projectDetail}</div>
                  </div>

                  {/* GitHub snapshot */}
                  <div style={{ background:'#F5F5F2', border:'1px solid #EBEBEA', borderRadius:10, padding:'10px 12px', marginBottom:14 }}>
                    <div style={{ fontSize:9, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:t.gray400, marginBottom:4 }}>GitHub</div>
                    <div style={{ fontSize:11, color:t.gray600 }}>{c.github}</div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                    {[
                      { action:'shortlist', label:'Shortlist', emoji:'✓', bg:t.green, textColor:'#fff' },
                      { action:'interview', label:'Interview', emoji:'📅', bg:'#4A6FD8', textColor:'#fff' },
                      { action:'pass', label:'Pass', emoji:'✕', bg:'transparent', textColor:t.gray400, border:`1px solid ${t.gray100}` },
                    ].map(btn => (
                      <button key={btn.action} onClick={() => handleStatus(selectedCand, btn.action)} style={{ padding:'8px 6px', background: candidateStatus[selectedCand]===btn.action ? btn.bg : (btn.bg==='transparent'?'transparent':btn.bg+'18'), color: candidateStatus[selectedCand]===btn.action ? btn.textColor : (btn.bg==='transparent'?btn.textColor:btn.bg), border: btn.border || `1px solid ${btn.bg==='transparent'?t.gray100:btn.bg+'40'}`, borderRadius:8, fontSize:11, fontWeight:500, cursor:'pointer', fontFamily:t.sans, display:'flex', alignItems:'center', justifyContent:'center', gap:4, transition:'all 0.15s' }}>
                        <span style={{ fontSize:11 }}>{btn.emoji}</span> {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Share link */}
                  <button onClick={() => showToast('Profile link copied!')} style={{ width:'100%', marginTop:6, padding:'7px', background:'transparent', border:'1px dashed #EBEBEA', borderRadius:8, fontSize:11, color:t.gray400, cursor:'pointer', fontFamily:t.sans, display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'border-color 0.15s' }} onMouseEnter={e=>e.currentTarget.style.borderColor=t.gray400} onMouseLeave={e=>e.currentTarget.style.borderColor='#EBEBEA'}>
                    🔗 Copy profile link to share
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInDown { from{opacity:0;transform:translateX(-50%) translateY(-8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>
    </div>
  );
}

// =============================================================================
// STARTUP PAGE
// =============================================================================
function StartupPage({ onOpenPreBook, onTalkToFounder }) {
  const Label = ({ children }) => (
    <div style={{ fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:t.ember, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ width:16, height:1, background:t.ember, display:'inline-block' }} />{children}
    </div>
  );
  const r = { bg:t.white, surface:t.gray50, border:t.gray100, muted:t.gray600, body:t.gray600, heading:t.black };

  return (
    <div style={{ background:r.bg, color:r.heading, fontFamily:t.sans, WebkitFontSmoothing:'antialiased', paddingBottom:120 }}>

      {/* HERO */}
      <section style={{ padding:'clamp(60px,8vw,100px) clamp(20px,4vw,48px) 80px', maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:48, minHeight:'calc(100vh - 65px)' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, border:`1px solid ${t.emberBorder}`, borderRadius:20, padding:'5px 14px', marginBottom:36 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:t.ember, animation:'huntPulse 2s infinite', display:'inline-block' }} />
            <span style={{ fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:t.ember }}>Early access · Invite only</span>
          </div>
          <h1 style={{ fontFamily:t.serif, fontSize:'clamp(52px,6vw,88px)', fontWeight:400, lineHeight:1.0, letterSpacing:'-0.02em', color:r.heading, marginBottom:28 }}>
            Stop reviewing<br /><em style={{ fontStyle:'italic', color:t.ember }}>400 applications</em><br /><span style={{ color:t.gray600 }}>to hire one intern.</span>
          </h1>
          <p style={{ fontSize:17, fontWeight:300, lineHeight:1.65, color:r.muted, maxWidth:480, marginBottom:48 }}>
            HUNT pre-matches candidates to your role by actual skill. You get a ranked shortlist of 6. No resume pile. No keyword filtering. No college-name guessing.
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <button onClick={onOpenPreBook} style={{ display:'inline-flex', alignItems:'center', gap:10, background:t.ember, color:'#fff', padding:'14px 32px', borderRadius:6, fontSize:15, fontWeight:500, cursor:'pointer', border:'none', fontFamily:t.sans }} onMouseOver={e=>e.currentTarget.style.background='#c04e28'} onMouseOut={e=>e.currentTarget.style.background=t.ember}>
              Reserve Early Access →
            </button>
            <button onClick={onTalkToFounder} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'transparent', color:t.gray600, padding:'14px 20px', borderRadius:6, fontSize:14, fontWeight:400, cursor:'pointer', border:`1px solid ${t.gray100}`, fontFamily:t.sans }} onMouseOver={e=>{e.currentTarget.style.color=t.black;e.currentTarget.style.borderColor=t.gray400;}} onMouseOut={e=>{e.currentTarget.style.color=t.gray600;e.currentTarget.style.borderColor=t.gray100;}}>
              Talk to the founder
            </button>
          </div>
        </div>
        <CandidateStackHero />
      </section>

      {/* STATS BAR */}
      <div style={{ borderTop:`1px solid ${r.border}`, borderBottom:`1px solid ${r.border}`, padding:'clamp(16px,2vw,24px) clamp(20px,4vw,48px)', display:'flex', alignItems:'center', overflowX:'auto' }}>
        {[{num:'6',label:'Max candidates per role'},{num:'Skill-first',label:'Not college-first'},{num:'₹0',label:'During early access'},{num:'48h',label:'Shortlist turnaround'}].map((s,i,arr)=>(
          <div key={i} style={{ flex:1, minWidth:140, padding:'0 clamp(12px,2vw,32px)', borderRight:i<arr.length-1?`1px solid ${r.border}`:'none', ...(i===0?{paddingLeft:0}:{}) }}>
            <div style={{ fontFamily:t.serif, fontSize:'clamp(24px,3vw,36px)', fontWeight:400, color:t.ember, letterSpacing:'-0.02em', lineHeight:1, marginBottom:4 }}>{s.num}</div>
            <div style={{ fontSize:11, fontWeight:400, color:t.gray400, letterSpacing:'0.06em', textTransform:'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* INTERACTIVE DEMO */}
      <section style={{ padding:'clamp(60px,8vw,96px) clamp(20px,4vw,48px)', maxWidth:1100, margin:'0 auto' }}>
        <Label>See it in action</Label>
        <h2 style={{ fontFamily:t.serif, fontSize:'clamp(36px,5vw,64px)', fontWeight:400, lineHeight:1.05, letterSpacing:'-0.02em', color:r.heading, marginBottom:12 }}>
          Post a role.<br /><em style={{ fontStyle:'italic', color:t.ember }}>Meet your shortlist.</em>
        </h2>
        <p style={{ fontSize:15, fontWeight:300, color:r.muted, maxWidth:460, lineHeight:1.65, marginBottom:40 }}>
          See exactly what recruiters see. Post a role spec, watch HUNT score candidates, then shortlist, pass, or schedule in one click.
        </p>
        {/* Contained frame — matches SkillSync reference layout */}
        <div style={{ maxWidth:880, margin:'0 auto', borderRadius:20, overflow:'hidden', boxShadow:'0 2px 0 #EBEBEA, 0 8px 40px rgba(0,0,0,0.06)', border:`1px solid ${r.border}` }}>
          {/* Browser chrome bar */}
          <div style={{ background:'#F5F5F2', borderBottom:`1px solid ${r.border}`, padding:'10px 16px', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ display:'flex', gap:5 }}>
              {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{ width:10, height:10, borderRadius:'50%', background:c }} />)}
            </div>
            <div style={{ flex:1, background:'#fff', borderRadius:6, border:'1px solid #EBEBEA', padding:'4px 10px', fontSize:10, color:t.gray400, marginLeft:8 }}>hunt.so/recruiter/demo</div>
          </div>
          <RecruiterDemo onOpenPreBook={onOpenPreBook} />
        </div>
      </section>

      {/* THE MATH */}
      <section style={{ padding:'0 clamp(20px,4vw,48px) clamp(60px,8vw,96px)', maxWidth:1100, margin:'0 auto' }}>
        <Label>The problem, in numbers</Label>
        <h2 style={{ fontFamily:t.serif, fontSize:'clamp(36px,5vw,64px)', fontWeight:400, lineHeight:1.05, letterSpacing:'-0.02em', color:r.heading, marginBottom:12 }}>
          Your current hiring process is<br /><em style={{ fontStyle:'italic', color:t.ember }}>broken by design.</em>
        </h2>
        <p style={{ fontSize:17, fontWeight:300, color:r.muted, maxWidth:520, marginBottom:48, lineHeight:1.65 }}>
          Not because you're doing it wrong. Because every platform incentivises volume over quality — more applications means more revenue for them.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', border:`1px solid ${r.border}`, borderRadius:10, overflow:'hidden' }}>
          {[{label:'What you post today',num:'400+',desc:'applications for a single internship on LinkedIn or Internshala.'},{label:'What you actually screen',num:'~20',desc:'because the rest are clearly unqualified. But you spent 6 hours getting there.'}].map((c,i)=>(
            <div key={i} style={{ padding:'2.5rem', borderBottom:`1px solid ${r.border}`, borderRight:i===0?`1px solid ${r.border}`:'none', background:r.surface }}>
              <div style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:t.gray600, marginBottom:12 }}>{c.label}</div>
              <div style={{ fontFamily:t.serif, fontSize:56, fontWeight:400, color:t.gray400, lineHeight:1, marginBottom:8 }}>{c.num}</div>
              <div style={{ fontSize:14, color:t.gray600, lineHeight:1.6, fontWeight:300 }}>{c.desc}</div>
            </div>
          ))}
          <div style={{ gridColumn:'1 / -1', padding:'1.2rem 2.5rem', background:t.emberDim, borderTop:`1px solid ${t.emberBorder}`, borderBottom:`1px solid ${t.emberBorder}`, display:'flex', alignItems:'center', gap:12 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0 }}><path d="M7 2v10M12 7l-5 5-5-5" stroke={t.ember} strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span style={{ fontSize:15, color:t.black }}>HUNT inverts this. <strong style={{ color:t.ember, fontWeight:500 }}>Match first, then show candidates.</strong></span>
          </div>
          {[{label:'What HUNT delivers',num:'Top 6',desc:'skill-matched, pre-scored candidates. Nobody without the skills gets through.'},{label:'Your actual time investment',num:'1 call',desc:'to verify fit. The screening was already done by the match score.'}].map((c,i)=>(
            <div key={i} style={{ padding:'2.5rem', borderTop:`1px solid ${r.border}`, borderRight:i===0?`1px solid ${r.border}`:'none', background:r.surface }}>
              <div style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:t.gray400, marginBottom:12 }}>{c.label}</div>
              <div style={{ fontFamily:t.serif, fontSize:56, fontWeight:400, color:t.ember, lineHeight:1, marginBottom:8 }}>{c.num}</div>
              <div style={{ fontSize:14, color:r.body, lineHeight:1.6, fontWeight:300 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:'0 clamp(20px,4vw,48px) clamp(60px,8vw,96px)', maxWidth:1100, margin:'0 auto' }}>
        <Label>How it works</Label>
        <h2 style={{ fontFamily:t.serif, fontSize:'clamp(36px,5vw,64px)', fontWeight:400, lineHeight:1.05, letterSpacing:'-0.02em', color:r.heading, marginBottom:48 }}>
          Post once.<br /><em style={{ fontStyle:'italic', color:t.ember }}>Get matched candidates.</em>
        </h2>
        <div style={{ display:'flex', flexDirection:'column', borderLeft:`1px solid ${r.border}`, paddingLeft:32, gap:0 }}>
          {[
            {n:'01',title:'Post the role with required skills',desc:'Tell us what the intern actually needs to do. Tech stack, key skills, level. Takes 5 minutes. No lengthy JD required — we need the skill spec.',tag:'No lengthy JD needed'},
            {n:'02',title:'HUNT scores every candidate against your role',desc:'Our match engine runs against verified skill data, project proof, and profile completeness — not just keywords. We weight each skill by your requirement, then rank.',tag:'Skill-weighted, not keyword search'},
            {n:'03',title:'Students with the highest match apply — max 6',desc:'We cap applicants. Students can only apply to a limited number of roles per week, so only intentional applications reach you. No spray-and-pray.',tag:'Capped at 6 applicants per role'},
            {n:'04',title:'You see ranked profiles with match breakdowns',desc:'Each candidate comes with a score breakdown: skill match, project relevance, tool familiarity. You decide who to call in 10 minutes, not 10 hours.',tag:'Match score transparent before you open the profile'},
          ].map((step,i,arr)=>(
            <div key={i} style={{ paddingBottom:i<arr.length-1?52:0, position:'relative' }}>
              <div style={{ position:'absolute', left:-40, top:4, width:16, height:16, borderRadius:'50%', background:r.bg, border:`1px solid ${r.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:6, height:6, borderRadius:'50%', background:t.ember }} /></div>
              <div style={{ fontSize:12, color:t.gray400, marginBottom:10, fontFamily:t.sans }}>{step.n}</div>
              <div style={{ fontSize:17, fontWeight:600, color:r.heading, marginBottom:10, lineHeight:1.3 }}>{step.title}</div>
              <div style={{ fontSize:14, fontWeight:300, color:r.muted, lineHeight:1.7, marginBottom:14, maxWidth:680 }}>{step.desc}</div>
              <span style={{ display:'inline-block', fontSize:11, padding:'4px 12px', borderRadius:20, background:t.emberDim, border:`1px solid ${t.emberBorder}`, color:t.ember, fontWeight:500 }}>{step.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* OUR STANCE */}
      <section style={{ padding:'0 clamp(20px,4vw,48px) clamp(60px,8vw,96px)', maxWidth:1100, margin:'0 auto' }}>
        <Label>Our stance</Label>
        <blockquote style={{ fontFamily:t.serif, fontSize:'clamp(38px,5.5vw,72px)', fontWeight:400, lineHeight:1.05, letterSpacing:'-0.02em', color:r.heading, borderLeft:`3px solid ${t.ember}`, paddingLeft:'1.5rem', margin:'0 0 28px 0' }}>
          "We don't filter by<br />college. We never will.<br /><em style={{ fontStyle:'italic', color:t.ember }}>Skill is the only signal."</em>
        </blockquote>
        <p style={{ fontSize:15, color:t.gray400, maxWidth:540, lineHeight:1.7, fontWeight:300, marginBottom:52 }}>
          This isn't a policy. It's the entire thesis. The best React dev for your 4-person startup might be self-taught, from a college you've never heard of, building in public. HUNT finds them anyway.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', borderTop:`1px solid ${r.border}` }}>
          {[
            {n:'01',title:'Skills, not credentials',desc:'College name is visible but never filterable. Skill score is the primary signal. This is intentional and non-negotiable.'},
            {n:'02',title:'Project proof over claims',desc:"Every matched skill is backed by project evidence — not just a checkbox. If they say React, we check if they've shipped React."},
            {n:'03',title:'Intentional applications only',desc:'Students have a weekly application limit. So when someone applies to your role, they actually want it. No noise, no mass-apply bots.'},
            {n:'04',title:'Self-correcting over time',desc:"Recruiter feedback after each hire feeds back into our scoring. Candidates who skill-faked don't survive. Shortlists improve with every placement."},
          ].map((card,i)=>(
            <div key={i} style={{ padding:'32px 28px 32px 0', borderRight:i<3?`1px solid ${r.border}`:'none', paddingRight:i<3?28:0, paddingLeft:i>0?28:0 }}>
              <div style={{ fontFamily:t.serif, fontSize:12, color:t.gray400, marginBottom:20, letterSpacing:'0.02em' }}>{card.n}</div>
              <div style={{ fontSize:15, fontWeight:500, color:r.heading, marginBottom:12, lineHeight:1.3, letterSpacing:'-0.01em' }}>{card.title}</div>
              <div style={{ fontSize:13, fontWeight:300, color:r.muted, lineHeight:1.7 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* THE DIFFERENCE */}
      <section style={{ padding:'0 clamp(20px,4vw,48px) clamp(60px,8vw,96px)', maxWidth:1100, margin:'0 auto' }}>
        <Label>The difference</Label>
        <h2 style={{ fontFamily:t.serif, fontSize:'clamp(36px,5vw,64px)', fontWeight:400, lineHeight:1.05, letterSpacing:'-0.02em', color:r.heading, marginBottom:12 }}>
          Not a job board.<br /><em style={{ fontStyle:'italic', color:t.ember }}>Not a recruiter tool.</em><br /><span style={{ color:t.gray400 }}>Something different.</span>
        </h2>
        <p style={{ fontSize:17, fontWeight:300, color:r.muted, maxWidth:480, lineHeight:1.65, marginBottom:48 }}>Job boards optimise for volume. That's their business model. Ours is different — we only win if you actually hire.</p>
        <div style={{ border:`1px solid ${r.border}`, borderRadius:10, overflow:'hidden' }}>
          <div style={{ padding:'1.4rem 2rem', borderBottom:`1px solid ${r.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:r.surface }}>
            <span style={{ fontSize:15, fontWeight:600, color:r.heading }}>Them vs HUNT</span>
            <span style={{ fontSize:11, color:t.gray400, letterSpacing:'0.06em', textTransform:'uppercase' }}>We're not in the same market</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:r.surface }}>
            <div style={{ padding:'2rem 2.5rem', borderRight:`1px solid ${r.border}` }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:t.gray400, marginBottom:24 }}>Every other platform</div>
              {['More applications = more revenue for them','College filter as the primary sort','You screen. You filter. You do all the work.','No feedback loop on who actually got hired','Keyword search over actual skill depth'].map((item,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:18, fontSize:14, color:t.gray400, fontWeight:300, lineHeight:1.5 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:t.gray100, flexShrink:0, marginTop:5 }} />
                  <span style={{ textDecoration:'line-through', textDecorationColor:t.gray100 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:'2rem 2.5rem' }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:t.ember, marginBottom:24 }}>HUNT</div>
              {['We win only when you successfully hire','College visible — never filterable. Ever.','Matching is done before you open a profile','Hire/no-hire feedback improves every future shortlist','Weighted skill matching + project evidence'].map((item,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:18, fontSize:14, color:r.body, fontWeight:400, lineHeight:1.5 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:t.ember, flexShrink:0, marginTop:5 }} />{item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding:'0 clamp(20px,4vw,48px)', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ border:`1px solid ${r.border}`, borderRadius:12, padding:'clamp(40px,6vw,64px)', textAlign:'center', background:r.surface, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:200, background:'radial-gradient(ellipse, rgba(216,90,48,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'relative' }}>
            <div style={{ fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:t.gray400, marginBottom:20 }}>Early access · Free while we grow</div>
            <h2 style={{ fontFamily:t.serif, fontSize:'clamp(36px,5vw,64px)', fontWeight:400, lineHeight:1.05, color:r.heading, marginBottom:16, letterSpacing:'-0.02em' }}>
              Post your first role.<br />See who <em style={{ fontStyle:'italic', color:t.ember }}>actually</em> fits.
            </h2>
            <p style={{ fontSize:17, fontWeight:300, color:r.muted, maxWidth:420, margin:'0 auto 40px', lineHeight:1.65 }}>We're in early access. Get your shortlist within 48 hours. No cost until we prove the model works.</p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
              <button onClick={onOpenPreBook} style={{ display:'inline-flex', alignItems:'center', gap:10, background:t.ember, color:'#fff', padding:'14px 36px', borderRadius:6, fontSize:15, fontWeight:500, cursor:'pointer', border:'none', fontFamily:t.sans }} onMouseOver={e=>e.currentTarget.style.background='#c04e28'} onMouseOut={e=>e.currentTarget.style.background=t.ember}>
                Reserve Early Access →
              </button>
              <button onClick={onTalkToFounder} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'transparent', color:t.gray600, padding:'14px 24px', borderRadius:6, fontSize:14, fontWeight:400, cursor:'pointer', border:`1px solid ${t.gray100}`, fontFamily:t.sans }} onMouseOver={e=>{e.currentTarget.style.color=t.black;e.currentTarget.style.borderColor=t.gray400;}} onMouseOut={e=>{e.currentTarget.style.color=t.gray600;e.currentTarget.style.borderColor=t.gray100;}}>
                Talk to the founder →
              </button>
            </div>
            <p style={{ fontSize:12, color:t.gray400, marginTop:20 }}>No dashboard to set up. No contract. Just a role spec and a skill list.</p>
          </div>
        </div>
      </section>

      <style>{`@keyframes huntPulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }`}</style>
    </div>
  );
}

// =============================================================================
// AUDIENCE TOGGLE
// =============================================================================
function AudienceToggle({ mode, onChange }) {
  return (
    <div style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:999, display:'flex', alignItems:'center', background:'rgba(10,10,10,0.88)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:40, padding:4, gap:4, boxShadow:'0 8px 32px rgba(0,0,0,0.4)', whiteSpace:'nowrap' }}>
      <button onClick={()=>onChange('student')} style={{ fontFamily:t.sans, fontSize:13, fontWeight:500, padding:'9px 22px', borderRadius:32, border:'none', cursor:'pointer', transition:'all 0.25s', background:mode==='student'?t.green:'transparent', color:mode==='student'?'#fff':'rgba(255,255,255,0.45)', letterSpacing:'0.01em' }}>I'm a Student</button>
      <button onClick={()=>onChange('startup')} style={{ fontFamily:t.sans, fontSize:13, fontWeight:500, padding:'9px 22px', borderRadius:32, border:'none', cursor:'pointer', transition:'all 0.25s', background:mode==='startup'?'#D85A30':'transparent', color:mode==='startup'?'#fff':'rgba(255,255,255,0.45)', letterSpacing:'0.01em' }}>I'm a Startup</button>
    </div>
  );
}

// =============================================================================
// ROOT EXPORT
// =============================================================================
export default function LandingPage() {
  const [mode, setMode]           = useState('student');
  const [showPreBook, setPreBook] = useState(false);

  const handleSignIn = async () => {
    try { await signInWithGoogle(); }
    catch (error) { console.error('Sign in error:', error); alert('Failed to sign in. Please try again.'); }
  };

  const handleTalkToFounder = () => {
    window.open(FOUNDER_CALL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />

      <div style={{ fontFamily:t.sans, background:t.white, color:t.black, minHeight:'100vh', WebkitFontSmoothing:'antialiased', overflowX:'hidden', transition:'background 0.3s' }}>

        {/* NAV */}
        <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:`1px solid ${t.gray100}`, position:'sticky', top:0, background:'rgba(250,250,248,0.95)', backdropFilter:'blur(8px)', zIndex:100, transition:'background 0.3s, border-color 0.3s' }}>
          <span style={{ fontSize:18, fontWeight:500, letterSpacing:'0.12em', color:t.black }}>HUNT</span>
          <span style={{ fontSize:11, fontWeight:400, color:t.gray400, letterSpacing:'0.06em', textTransform:'uppercase' }}>
            {mode === 'student' ? 'Internships. Not noise.' : 'Skill-first talent. Not noise.'}
          </span>
          {mode === 'student' ? (
            <button onClick={handleSignIn} style={{ display:'flex', alignItems:'center', gap:8, background:t.black, color:t.white, padding:'10px 20px', borderRadius:6, fontSize:13, fontWeight:400, cursor:'pointer', border:'none', fontFamily:t.sans }} onMouseOver={e=>e.currentTarget.style.opacity='0.8'} onMouseOut={e=>e.currentTarget.style.opacity='1'}>
              <GoogleIcon /> Sign in with Google
            </button>
          ) : (
            <button onClick={()=>setPreBook(true)} style={{ display:'flex', alignItems:'center', gap:8, background:'#D85A30', color:'#fff', padding:'10px 20px', borderRadius:6, fontSize:13, fontWeight:500, cursor:'pointer', border:'none', fontFamily:t.sans }} onMouseOver={e=>e.currentTarget.style.background='#c04e28'} onMouseOut={e=>e.currentTarget.style.background='#D85A30'}>
              Reserve Early Access
            </button>
          )}
        </nav>

        {/* MAIN CONTENT */}
        {mode === 'student' ? (
          <>
            {/* HERO */}
            <section style={{ padding:'clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px) 80px', maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:48, minHeight:'calc(100vh - 65px)' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12, fontWeight:400, letterSpacing:'0.08em', textTransform:'uppercase', color:t.gray600, marginBottom:32 }}>
                  <span style={{ display:'inline-block', width:20, height:1, background:t.gray400 }} />Skill-first internship matching
                </div>
                <h1 style={{ fontFamily:t.serif, fontSize:'clamp(52px, 7vw, 88px)', fontWeight:400, lineHeight:1.0, letterSpacing:'-0.02em', color:t.black, maxWidth:780, marginBottom:28 }}>
                  Skills got you here.<br />Let them get you <em style={{ fontStyle:'italic', color:t.green }}>hired.</em>
                </h1>
                <p style={{ fontSize:17, fontWeight:300, lineHeight:1.65, color:t.gray600, maxWidth:440, marginBottom:48 }}>
                  Stop mass applying and getting ignored. HUNT matches you to internships based on what you can actually do — then puts you in front of recruiters who care.
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                  <button onClick={handleSignIn} style={btnPrimary} onMouseOver={e=>e.currentTarget.style.opacity='0.82'} onMouseOut={e=>e.currentTarget.style.opacity='1'}>
                    <GoogleIcon /> Start your hunt — it's free
                  </button>
                  <span style={{ fontSize:12, color:t.gray400, fontWeight:300 }}>No resume needed to start</span>
                </div>
              </div>
              <PhoneHero />
            </section>

            {/* STATS BAR */}
            <div style={{ borderTop:`1px solid ${t.gray100}`, borderBottom:`1px solid ${t.gray100}`, padding:'clamp(16px,2vw,24px) clamp(20px,4vw,48px)', display:'flex', alignItems:'center', overflowX:'auto' }}>
              {[{num:'5',numAccent:false,label:'Applications / week'},{num:'40',numAccent:true,label:'Min. interview rate %'},{num:'50',numAccent:false,label:'Max applicants / role'},{num:'0 ₹',numAccent:false,label:'Always free for students'}].map((s,i,arr)=>(
                <div key={i} style={{ flex:1, minWidth:140, padding:'0 clamp(12px,2vw,32px)', borderRight:i<arr.length-1?`1px solid ${t.gray100}`:'none', ...(i===0?{paddingLeft:0}:{}) }}>
                  <div style={{ fontFamily:t.serif, fontSize:'clamp(24px,3vw,36px)', fontWeight:400, color:s.numAccent?t.green:t.black, letterSpacing:'-0.02em', lineHeight:1, marginBottom:4 }}>{s.num}</div>
                  <div style={{ fontSize:11, fontWeight:400, color:t.gray400, letterSpacing:'0.06em', textTransform:'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* INTERACTIVE DEMO — student side */}
            <section style={{ padding:'clamp(60px,8vw,96px) clamp(20px,4vw,48px)', maxWidth:1100, margin:'0 auto' }}>
              <div style={{ fontSize:11, fontWeight:400, letterSpacing:'0.1em', textTransform:'uppercase', color:t.green, marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ width:16, height:1, background:t.green, display:'inline-block' }} />Try it yourself
              </div>
              <h2 style={{ fontFamily:t.serif, fontSize:'clamp(36px,5vw,64px)', fontWeight:400, lineHeight:1.05, letterSpacing:'-0.02em', color:t.black, marginBottom:12 }}>
                This is what<br /><em style={{ fontStyle:'italic', color:t.green }}>swiping feels like.</em>
              </h2>
              <p style={{ fontSize:15, fontWeight:300, color:t.gray600, maxWidth:440, lineHeight:1.65, marginBottom:40 }}>
                Explore jobs, connect with peers, read insights. No signup needed to explore — just interact.
              </p>
              {/* Contained frame — centered, not full bleed */}
              <div style={{ maxWidth:880, margin:'0 auto', borderRadius:20, overflow:'hidden', boxShadow:'0 2px 0 #EBEBEA, 0 12px 40px rgba(0,0,0,0.08)', border:`1px solid ${t.gray100}` }}>
                {/* Browser chrome */}
                <div style={{ background:'#1a1916', padding:'10px 16px', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ display:'flex', gap:5 }}>
                    {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{ width:10, height:10, borderRadius:'50%', background:c }} />)}
                  </div>
                  <div style={{ flex:1, background:'rgba(255,255,255,0.06)', borderRadius:6, border:'1px solid rgba(255,255,255,0.08)', padding:'4px 10px', fontSize:10, color:'rgba(255,255,255,0.35)', marginLeft:8 }}>hunt.so/swipe</div>
                </div>
                <StudentDemo />
              </div>
            </section>

            {/* HOW IT WORKS */}
            <section style={{ padding:'0 clamp(20px,4vw,48px) clamp(60px,8vw,96px)', maxWidth:1100, margin:'0 auto' }}>
              <div style={{ fontSize:11, fontWeight:400, letterSpacing:'0.1em', textTransform:'uppercase', color:t.gray400, marginBottom:48, display:'flex', alignItems:'center', gap:12 }}>
                How it works<span style={{ flex:1, height:1, background:t.gray100, maxWidth:200, display:'block' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:0, border:`1px solid ${t.gray100}`, borderRadius:8, overflow:'hidden' }}>
                {[{n:'01',title:'Build your skill profile',desc:'Add skills, projects, and work preferences. Takes 3 minutes. No resume required.'},{n:'02',title:'Swipe through matches',desc:'See internships ranked by your match score. Only roles you actually qualify for.'},{n:'03',title:'Apply to your top 5',desc:'5 applications per week. Forces intent. See your match breakdown before you commit.'},{n:'04',title:'Get in front of recruiters',desc:'Recruiters see your ranked profile — skills first, nothing else. Hear back faster.'}].map((step,i,arr)=>(
                  <div key={i} style={{ padding:'36px 28px', borderRight:i<arr.length-1?`1px solid ${t.gray100}`:'none' }}>
                    <div style={{ fontFamily:t.serif, fontSize:13, fontWeight:400, color:t.gray400, marginBottom:20 }}>{step.n}</div>
                    <div style={{ fontSize:15, fontWeight:500, color:t.black, marginBottom:10, lineHeight:1.3 }}>{step.title}</div>
                    <div style={{ fontSize:13, fontWeight:300, color:t.gray600, lineHeight:1.6 }}>{step.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* THE DIFFERENCE */}
            <section style={{ padding:'0 clamp(20px,4vw,48px) clamp(60px,8vw,96px)', maxWidth:1100, margin:'0 auto' }}>
              <div style={{ fontSize:11, fontWeight:400, letterSpacing:'0.1em', textTransform:'uppercase', color:t.gray400, marginBottom:48, display:'flex', alignItems:'center', gap:12 }}>
                The difference<span style={{ flex:1, height:1, background:t.gray100, maxWidth:200, display:'block' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:2, borderRadius:8, overflow:'hidden', border:`1px solid ${t.gray100}` }}>
                <div style={{ padding:'40px 36px', background:t.gray50 }}>
                  <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:t.gray400, marginBottom:28, fontWeight:400 }}>Everywhere else</div>
                  {['500+ applicants per job posting','Screened out before anyone reads your resume','2–5% interview rate on average','No feedback. No transparency.','Apply to 100 things, hear back from 2'].map((item,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:18, fontSize:14, color:t.gray600, fontWeight:300, lineHeight:1.5 }}><CrossIcon /> {item}</div>
                  ))}
                </div>
                <div style={{ padding:'40px 36px', background:t.white }}>
                  <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:t.green, marginBottom:28, fontWeight:400 }}>HUNT</div>
                  {['Max 50 applicants per role','Ranked by skill match — nothing else','40–60% interview rate for matched users','See your match score before you apply','5 intentional applications per week'].map((item,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:18, fontSize:14, color:t.black, fontWeight:400, lineHeight:1.5 }}><CheckIcon /> {item}</div>
                  ))}
                </div>
              </div>
            </section>

            {/* ON A HUNT */}
            <section style={{ padding:'0 clamp(20px,4vw,48px) clamp(60px,8vw,96px)', maxWidth:1100, margin:'0 auto' }}>
              <div style={{ fontSize:11, fontWeight:400, letterSpacing:'0.1em', textTransform:'uppercase', color:t.gray400, marginBottom:48, display:'flex', alignItems:'center', gap:12 }}>
                On a hunt<span style={{ flex:1, height:1, background:t.gray100, maxWidth:200, display:'block' }} />
              </div>
              <p style={{ fontSize:17, fontWeight:300, color:t.gray600, maxWidth:480, lineHeight:1.65, marginBottom:36 }}>The best candidates aren't always where you'd expect to find them. HUNT surfaces them by what they've built — not where they studied.</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {[{initials:'RK',name:'Rohan Kumar',detail:'Full Stack · React, Node.js',score:'87%'},{initials:'PS',name:'Priya Sharma',detail:'Backend · Python, PostgreSQL',score:'92%'},{initials:'AM',name:'Arjun Mehta',detail:'ML · PyTorch, Scikit-learn',score:'78%'},{initials:'SK',name:'Sara Khan',detail:'Data · SQL, Pandas, Tableau',score:'84%'},{initials:'NP',name:'Nikhil Patel',detail:'DevOps · Docker, AWS, CI/CD',score:'81%'}].map((p,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', border:`1px solid ${t.gray100}`, borderRadius:8, background:t.white }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:t.gray100, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:500, color:t.gray600, flexShrink:0 }}>{p.initials}</div>
                    <div><div style={{ fontWeight:500, color:t.black, fontSize:13, lineHeight:1, marginBottom:3 }}>{p.name}</div><div style={{ fontSize:11, color:t.gray400, fontWeight:300 }}>{p.detail}</div></div>
                    <div style={{ marginLeft:8, background:t.greenLight, color:t.green, fontSize:12, fontWeight:500, padding:'4px 8px', borderRadius:4 }}>{p.score}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* BIG CTA */}
            <div style={{ padding:'clamp(60px,8vw,96px) clamp(20px,4vw,48px)', borderTop:`1px solid ${t.gray100}`, textAlign:'center' }}>
              <h2 style={{ fontFamily:t.serif, fontSize:'clamp(36px,5vw,64px)', fontWeight:400, color:t.black, lineHeight:1.05, marginBottom:20, letterSpacing:'-0.02em' }}>
                Apply smart.<br /><em style={{ fontStyle:'italic', color:t.green }}>Get seen.</em>
              </h2>
              <p style={{ fontSize:15, fontWeight:300, color:t.gray600, marginBottom:36 }}>Stop sending into the void. Start matching.</p>
              <button onClick={handleSignIn} style={{ ...btnPrimary, margin:'0 auto' }} onMouseOver={e=>e.currentTarget.style.opacity='0.82'} onMouseOut={e=>e.currentTarget.style.opacity='1'}>
                <GoogleIcon /> Start your hunt — it's free
              </button>
            </div>
          </>
        ) : (
          <StartupPage onOpenPreBook={()=>setPreBook(true)} onTalkToFounder={handleTalkToFounder} />
        )}

        {/* FOOTER */}
        <footer style={{ borderTop:`1px solid ${t.gray100}`, padding:'clamp(24px,3vw,40px) clamp(20px,4vw,48px)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, background:t.white }}>
          <span style={{ fontSize:14, fontWeight:500, letterSpacing:'0.12em', color:t.black }}>HUNT</span>
          <span style={{ fontSize:12, color:t.gray400, fontWeight:300 }}>Internships. Not noise. · Built in India · 2025</span>
        </footer>

        {/* FIXED TOGGLE */}
        <AudienceToggle mode={mode} onChange={setMode} />

        {/* PREBOOK MODAL */}
        {showPreBook && <PreBookModal onClose={()=>setPreBook(false)} />}

      </div>
    </>
  );
}
