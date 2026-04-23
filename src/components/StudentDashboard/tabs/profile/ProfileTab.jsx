import React from 'react';
import {
  SKILL_OPTIONS_P, SKILL_CATS_P, LEVEL_LABELS_P, ROLE_OPTIONS_P,
  inp_p, Toggle_P, getSkillLogo, PLATFORM_LOGOS,
} from './constants';

// ─── Profile Tab ───────────────────────────────────────────────────────────────
export default function ProfileTab({ studentProfile, setStudentProfile, theme, setTheme }) {
  const [activeSection, setActiveSection] = React.useState('overview');
  const [draft, setDraft] = React.useState(() => JSON.parse(JSON.stringify(studentProfile || {})));
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [skillCat, setSkillCat] = React.useState(SKILL_CATS_P[0]);
  const [addingProject, setAddingProject] = React.useState(false);
  const [newProject, setNewProject] = React.useState({ title:'', techStack:'', description:'', projectUrl:'', githubUrl:'' });
  const [addingEdu, setAddingEdu] = React.useState(false);
  const [newEdu, setNewEdu] = React.useState({ school:'', degree:'', major:'', startYear:'', endYear:'' });
  const [newCert, setNewCert] = React.useState('');
  const [newAward, setNewAward] = React.useState('');
  const [otherLinks, setOtherLinks] = React.useState(studentProfile?.other_links || []);
  const [newOtherLink, setNewOtherLink] = React.useState({ label:'', url:'' });
  const [pendingSkill, setPendingSkill] = React.useState(null);

  const showToast = (msg, type='ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2200); };

  const save = async (updates) => {
    setSaving(true);
    try {
      const { updateStudentProfile } = await import('../../../services/supabase');
      const merged = { ...studentProfile, ...updates };
      let sc = 0;
      if (merged.full_name) sc += 10; if (merged.college) sc += 10;
      if ((merged.skills||[]).length >= 5) sc += 25; else if ((merged.skills||[]).length >= 1) sc += 10;
      if ((merged.projects||[]).length >= 1) sc += 15;
      if (merged.github_url) sc += 5; if (merged.linkedin_url) sc += 5; if (merged.resume_url) sc += 5; if (merged.email) sc += 5;
      if ((merged.preferred_roles||[]).length > 0) sc += 10;
      const updated = await updateStudentProfile({ ...updates, profile_completeness: Math.min(sc, 100) });
      setStudentProfile(updated);
      setDraft(JSON.parse(JSON.stringify(updated)));
      showToast('Saved');
    } catch(e) { showToast('Save failed','err'); }
    finally { setSaving(false); }
  };

  const d = draft;
  const initials = (d.full_name||'').split(' ').map(n=>n[0]).join('').slice(0,2)||'U';

  const Card = ({ children, style: s={} }) => (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'20px 22px', marginBottom:14, ...s }}>{children}</div>
  );
  const SaveBtn = ({ onClick }) => (
    <button onClick={onClick} disabled={saving} style={{ padding:'7px 16px', borderRadius:7, border:'none', background:'var(--green)', color:'#fff', fontSize:12, fontWeight:600, cursor:saving?'default':'pointer', opacity:saving?0.6:1, fontFamily:'inherit' }}>
      {saving ? 'Saving…' : 'Save'}
    </button>
  );
  const FieldLabel = ({ children }) => (
    <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:5 }}>{children}</p>
  );

  const SECTIONS = [
    { id:'overview', label:'Overview' },
    { id:'resume',   label:'Resume' },
    { id:'skills',   label:'Skills' },
    { id:'prefs',    label:'Preferences' },
    { id:'myhunt',   label:'My Hunt' },
    { id:'reviews',  label:'Reviews & Ratings' },
    { id:'huntscore',label:'Hunt Score' },
    { id:'account',  label:'Account' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'hunt-fade-in 0.25s ease' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '7px 16px', borderRadius: 7, fontSize: 12, fontWeight: 500, background: toast.type === 'err' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)', color: '#fff', pointerEvents: 'none', boxShadow: '0 3px 12px rgba(0,0,0,0.15)' }}>{toast.msg}</div>
      )}

      {/* ── PROFILE HEADER + SUB-TABS ── */}
      <div style={{ flexShrink: 0, padding: '28px 40px 0', background: 'var(--bg)' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 4 }}>Profile</p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 26, fontWeight: 400, color: 'var(--text)', marginBottom: 16 }}>
          {d.full_name ? <>{d.full_name.split(' ')[0]}<em style={{ fontStyle: 'italic' }}>'s profile.</em></> : <em>Your profile.</em>}
        </h1>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400,
              color: activeSection === s.id ? 'var(--text)' : 'var(--text-dim)',
              borderBottom: activeSection === s.id ? '2px solid var(--text)' : '2px solid transparent',
              marginBottom: '-1px', whiteSpace: 'nowrap', fontFamily: 'inherit',
              transition: 'color 0.1s',
            }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px' }}>

        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <div style={{ maxWidth: 760 }}>
            {/* Banner + Avatar hero */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
              {/* Banner */}
              <div style={{ height: 140, background: 'linear-gradient(135deg, #1A7A4A 0%, #0D4A2E 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', letterSpacing: '0.02em' }}>On a hunt.</p>
                <label style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => showToast('Banner upload coming soon')} />
                </label>
              </div>
              {/* Avatar + name row */}
              <div style={{ padding: '0 28px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ position: 'relative', marginTop: -36 }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-tint)', border: '4px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>
                      {initials}
                    </div>
                    <label style={{ position: 'absolute', bottom: 2, right: 2, width: 22, height: 22, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)' }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => showToast('Avatar upload coming soon')} />
                    </label>
                  </div>
                </div>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 3 }}>{d.full_name || '—'}</p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: d.headline ? 6 : 0 }}>{d.college}{d.year ? ` · Year ${d.year}` : ''}</p>
                {d.headline && <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.5 }}>{d.headline}</p>}
              </div>
            </div>

            {/* Headline + Bio */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Headline & Bio</p>
                <SaveBtn onClick={() => save({ headline: d.headline, bio: d.bio })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <FieldLabel>Headline</FieldLabel>
                  <input style={inp_p} value={d.headline||''} placeholder="Full Stack Dev · Open to internships" onChange={e => setDraft(x=>({...x,headline:e.target.value}))} />
                </div>
                <div>
                  <FieldLabel>Bio</FieldLabel>
                  <textarea style={{ ...inp_p, resize: 'none' }} rows={4} value={d.bio||''} placeholder="Tell recruiters about yourself..." onChange={e => setDraft(x=>({...x,bio:e.target.value}))} />
                </div>
              </div>
            </Card>

            {/* Basic info */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Basic Info</p>
                <SaveBtn onClick={() => save({ full_name: d.full_name, college: d.college, year: d.year, phone: d.phone, email: d.email })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { f:'full_name', label:'Full Name', ph:'Priya Sharma' },
                  { f:'college',   label:'College',   ph:'VJTI Mumbai' },
                  { f:'phone',     label:'Phone',     ph:'+91 98765 43210' },
                  { f:'email',     label:'Email',     ph:'you@email.com' },
                ].map(({ f, label, ph }) => (
                  <div key={f}>
                    <FieldLabel>{label}</FieldLabel>
                    <input style={inp_p} value={d[f]||''} placeholder={ph} onChange={e => setDraft(x=>({...x,[f]:e.target.value}))} />
                  </div>
                ))}
                <div>
                  <FieldLabel>Year</FieldLabel>
                  <select style={inp_p} value={d.year||3} onChange={e => setDraft(x=>({...x,year:parseInt(e.target.value)}))}>
                    {[1,2,3,4].map(y => <option key={y} value={y}>{y}{['st','nd','rd','th'][y-1]} Year</option>)}
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* RESUME */}
        {activeSection === 'resume' && (
          <div style={{ maxWidth: 700 }}>

            {/* Quick links at top */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Key Links</p>
                <SaveBtn onClick={() => save({ github_url: d.github_url, linkedin_url: d.linkedin_url, portfolio_url: d.portfolio_url })} />
              </div>
              {[
                { key:'github_url',   logo:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>, bg:'#24292e', label:'GitHub URL', ph:'https://github.com/username' },
                { key:'linkedin_url', logo:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, bg:'#0A66C2', label:'LinkedIn URL', ph:'https://linkedin.com/in/username' },
                { key:'portfolio_url', logo:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, bg:'#5A5A56', label:'Portfolio', ph:'https://yoursite.com' },
              ].map(({ key, logo, bg, label, ph }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white' }}>{logo}</div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', width: 90, flexShrink: 0 }}>{label}</span>
                  <input style={{ ...inp_p, padding: '5px 9px' }} value={d[key]||''} placeholder={ph} onChange={e => setDraft(x=>({...x,[key]:e.target.value}))} />
                </div>
              ))}
            </Card>

            {/* Resume PDF */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Resume PDF</p>
              {d.resume_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 8, border: '1px solid var(--green)', background: 'var(--green-tint)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--green-text)' }}>Resume uploaded</span>
                  <a href={d.resume_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--green-text)', textDecoration: 'none' }}>View ↗</a>
                  <label style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--green)', color: 'var(--green)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Replace<input type="file" accept=".pdf" style={{ display: 'none' }} onChange={() => showToast('Upload coming soon')} />
                  </label>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '32px', borderRadius: 10, border: '2px dashed var(--border-mid)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.background='var(--green-tint)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-mid)'; e.currentTarget.style.background='transparent'; }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>Drop PDF here or <span style={{ color: 'var(--green)' }}>browse files</span></span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>PDF up to 5MB</span>
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={() => showToast('Upload coming soon')} />
                </label>
              )}
            </Card>

            {/* Summary */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Summary</p>
                <SaveBtn onClick={() => save({ summary: d.summary })} />
              </div>
              <textarea style={{ ...inp_p, resize: 'none' }} rows={4} value={d.summary||''} placeholder="Brief professional summary..." onChange={e => setDraft(x=>({...x,summary:e.target.value}))} />
            </Card>

            {/* Education */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Education</p>
                <button onClick={() => setAddingEdu(true)} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
              </div>
              {(d.education||[]).map((edu, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{edu.school}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-mid)', marginBottom: 1 }}>{edu.degree}{edu.major ? ` · ${edu.major}` : ''}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{edu.startYear}–{edu.endYear||'Present'}</p>
                  </div>
                  <button onClick={() => { const ed=(d.education||[]).filter((_,j)=>j!==i); setDraft(x=>({...x,education:ed})); save({education:ed}); }} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-dim)',padding:0,fontSize:16 }}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--text-dim)'}>×</button>
                </div>
              ))}
              {addingEdu && (
                <div style={{ border:'1px solid var(--border)', borderRadius:9, padding:16, background:'var(--bg-subtle)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    {[{f:'school',ph:'University/College *'},{f:'degree',ph:'Bachelor of Science'},{f:'major',ph:'Computer Science'},{f:'startYear',ph:'2021'},{f:'endYear',ph:'2025'}].map(({f,ph})=>(
                      <input key={f} style={inp_p} value={newEdu[f]} placeholder={ph} onChange={e=>setNewEdu(x=>({...x,[f]:e.target.value}))} />
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => { if(!newEdu.school)return; const ed=[...(d.education||[]),newEdu]; setDraft(x=>({...x,education:ed})); save({education:ed}); setNewEdu({school:'',degree:'',major:'',startYear:'',endYear:''}); setAddingEdu(false); }} style={{ padding:'7px 14px', borderRadius:7, border:'none', background:'var(--green)', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Add</button>
                    <button onClick={() => setAddingEdu(false)} style={{ padding:'7px 14px', borderRadius:7, border:'1px solid var(--border)', background:'transparent', color:'var(--text-mid)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Projects */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Projects</p>
                <button onClick={() => setAddingProject(true)} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
              </div>
              {(d.projects||[]).map((p, i) => (
                <div key={i} style={{ padding:'12px 14px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-subtle)', marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{p.title||p.name}</p>
                    <button onClick={() => { const pr=(d.projects||[]).filter((_,j)=>j!==i); setDraft(x=>({...x,projects:pr})); save({projects:pr}); }} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-dim)',padding:0,fontSize:16 }}
                      onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                      onMouseLeave={e=>e.currentTarget.style.color='var(--text-dim)'}>×</button>
                  </div>
                  {p.description && <p style={{ fontSize:11, color:'var(--text-dim)', marginBottom:6, lineHeight:1.5 }}>{p.description}</p>}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                    {(Array.isArray(p.techStack)?p.techStack:[]).map((t,j)=>(
                      <span key={j} style={{ fontSize:10, padding:'3px 8px', borderRadius:4, border:'1px solid var(--border)', color:'var(--text-mid)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
              {addingProject && (
                <div style={{ border:'1px solid var(--border)', borderRadius:9, padding:16, background:'var(--bg-subtle)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <input style={inp_p} value={newProject.title} placeholder="Project title *" onChange={e=>setNewProject(x=>({...x,title:e.target.value}))} />
                    <input style={inp_p} value={newProject.techStack} placeholder="React, Node.js..." onChange={e=>setNewProject(x=>({...x,techStack:e.target.value}))} />
                  </div>
                  <textarea style={{ ...inp_p, resize:'none', marginBottom:10 }} rows={2} value={newProject.description} placeholder="Description" onChange={e=>setNewProject(x=>({...x,description:e.target.value}))} />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <input style={inp_p} value={newProject.projectUrl} placeholder="Live URL" onChange={e=>setNewProject(x=>({...x,projectUrl:e.target.value}))} />
                    <input style={inp_p} value={newProject.githubUrl} placeholder="GitHub URL" onChange={e=>setNewProject(x=>({...x,githubUrl:e.target.value}))} />
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => { if(!newProject.title)return; const pr=[...(d.projects||[]),{...newProject,techStack:newProject.techStack.split(',').map(t=>t.trim()),id:Date.now()}]; setDraft(x=>({...x,projects:pr})); save({projects:pr}); setNewProject({title:'',techStack:'',description:'',projectUrl:'',githubUrl:''}); setAddingProject(false); }} style={{ padding:'7px 14px', borderRadius:7, border:'none', background:'var(--green)', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Add Project</button>
                    <button onClick={() => setAddingProject(false)} style={{ padding:'7px 14px', borderRadius:7, border:'1px solid var(--border)', background:'transparent', color:'var(--text-mid)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Certifications — separate card */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Certifications</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
                {(d.certifications||[]).map((c, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:20, border:'1px solid var(--border)', background:'var(--bg-subtle)', fontSize:12 }}>
                    🏅 {c}
                    <button onClick={() => { const cer=(d.certifications||[]).filter((_,j)=>j!==i); setDraft(x=>({...x,certifications:cer})); save({certifications:cer}); }} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-dim)',padding:'0 0 0 4px',lineHeight:1,fontSize:14 }}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input style={{ ...inp_p, flex:1 }} value={newCert} placeholder="AWS Certified Developer, Google Cloud..." onChange={e=>setNewCert(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&newCert.trim()){const cer=[...(d.certifications||[]),newCert.trim()];setDraft(x=>({...x,certifications:cer}));save({certifications:cer});setNewCert('');}}} />
                <button onClick={() => { if(!newCert.trim())return;const cer=[...(d.certifications||[]),newCert.trim()];setDraft(x=>({...x,certifications:cer}));save({certifications:cer});setNewCert(''); }} style={{ padding:'0 16px', borderRadius:7, border:'none', background:'var(--green)', color:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>+</button>
              </div>
            </Card>

            {/* Awards — separate card */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Awards & Achievements</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                {(d.awards||[]).map((a, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-subtle)', fontSize:12 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:16 }}>⭐</span> {a}</span>
                    <button onClick={() => { const aw=(d.awards||[]).filter((_,j)=>j!==i);setDraft(x=>({...x,awards:aw}));save({awards:aw}); }} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-dim)',padding:0,fontSize:16 }}
                      onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                      onMouseLeave={e=>e.currentTarget.style.color='var(--text-dim)'}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input style={{ ...inp_p, flex:1 }} value={newAward} placeholder="1st place at Flipkart GRiD Hackathon..." onChange={e=>setNewAward(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&newAward.trim()){const aw=[...(d.awards||[]),newAward.trim()];setDraft(x=>({...x,awards:aw}));save({awards:aw});setNewAward('');}}} />
                <button onClick={() => { if(!newAward.trim())return;const aw=[...(d.awards||[]),newAward.trim()];setDraft(x=>({...x,awards:aw}));save({awards:aw});setNewAward(''); }} style={{ padding:'0 16px', borderRadius:7, border:'none', background:'var(--green)', color:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>+</button>
              </div>
            </Card>

            {/* Coding platforms */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Competitive & Coding Profiles</p>
                <SaveBtn onClick={() => save({ coding_profiles: d.coding_profiles })} />
              </div>
              {Object.entries(PLATFORM_LOGOS).map(([key, { label, color, svg }]) => (
                <div key={key} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-subtle)', marginBottom:8 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{svg}</div>
                  <span style={{ fontSize:12, fontWeight:500, color:'var(--text-mid)', width:110, flexShrink:0 }}>{label}</span>
                  <input style={{ ...inp_p, padding:'6px 10px' }}
                    value={d.coding_profiles?.[key]||''}
                    placeholder="username"
                    onChange={e => setDraft(x => ({ ...x, coding_profiles: { ...(x.coding_profiles||{}), [key]: e.target.value } }))} />
                </div>
              ))}
            </Card>

            {/* Other links */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Other Links</p>
                <SaveBtn onClick={() => save({ other_links: otherLinks })} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>Add any other links — papers, talks, open source contributions, etc.</p>
              {otherLinks.map((link, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-subtle)', marginBottom:8 }}>
                  <div style={{ width:28, height:28, borderRadius:6, background:'var(--bg-card)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14 }}>🔗</div>
                  <span style={{ fontSize:12, color:'var(--text)', flex:1 }}>{link.label}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'var(--green)', textDecoration:'none', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{link.url}</a>
                  <button onClick={() => { const nl=otherLinks.filter((_,j)=>j!==i); setOtherLinks(nl); save({other_links:nl}); }} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-dim)',padding:0,fontSize:16 }}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--text-dim)'}>×</button>
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:8, marginBottom:8 }}>
                <input style={inp_p} value={newOtherLink.label} placeholder="Label (e.g. Research Paper)" onChange={e=>setNewOtherLink(x=>({...x,label:e.target.value}))} />
                <input style={inp_p} value={newOtherLink.url} placeholder="https://..." onChange={e=>setNewOtherLink(x=>({...x,url:e.target.value}))} />
              </div>
              <button onClick={() => { if(!newOtherLink.url.trim())return; const nl=[...otherLinks,{label:newOtherLink.label||newOtherLink.url,url:newOtherLink.url}]; setOtherLinks(nl); save({other_links:nl}); setNewOtherLink({label:'',url:''}); }} style={{ padding:'7px 16px', borderRadius:7, border:'none', background:'var(--green)', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Add Link</button>
            </Card>
          </div>
        )}

        {/* SKILLS */}
        {activeSection === 'skills' && (() => {
          const addedSkills = d.skills || [];
          const grouped = SKILL_CATS_P.reduce((acc, cat) => {
            const inCat = addedSkills.filter(s => s.category === cat);
            if (inCat.length > 0) acc[cat] = inCat;
            return acc;
          }, {});

          const LEVELS = [
            { v:1, label:'Beginner',     desc:'Just started learning' },
            { v:2, label:'Elementary',   desc:'Built a few small things' },
            { v:3, label:'Intermediate', desc:'Used in real projects' },
            { v:4, label:'Advanced',     desc:'Deep knowledge, prod use' },
            { v:5, label:'Expert',       desc:'Mentor others, go-to person' },
          ];

          const confirmAdd = (level) => {
            if (!pendingSkill) return;
            const skillDef = SKILL_OPTIONS_P.find(s => s.name === pendingSkill);
            if (!skillDef) return;
            setDraft(x => ({ ...x, skills: [...(x.skills||[]), { id: Date.now(), name: pendingSkill, level, category: skillDef.cat }] }));
            setPendingSkill(null);
          };

          return (
            <div style={{ maxWidth: 760 }}>
              {/* Level picker modal */}
              {pendingSkill && (
                <>
                  <div onClick={() => setPendingSkill(null)} style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(0,0,0,0.3)', backdropFilter:'blur(2px)' }} />
                  <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:401, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'28px 28px 24px', width:360, boxShadow:'0 20px 60px rgba(0,0,0,0.18)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <span style={{ fontSize:20, display:'flex', alignItems:'center' }}>{getSkillLogo(pendingSkill)}</span>
                      <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:20, color:'var(--text)' }}>{pendingSkill}</p>
                    </div>
                    <p style={{ fontSize:12, color:'var(--text-dim)', marginBottom:20 }}>How well do you know this?</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {LEVELS.map(lv => (
                        <button key={lv.v} onClick={() => confirmAdd(lv.v)} style={{
                          display:'flex', alignItems:'center', justifyContent:'space-between',
                          padding:'10px 14px', borderRadius:9, border:'1px solid var(--border)',
                          background:'var(--bg-subtle)', cursor:'pointer', fontFamily:'inherit',
                          transition:'all 0.1s',
                        }}
                        onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.background='var(--green-tint)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-subtle)'; }}>
                          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <div style={{ display:'flex', gap:3 }}>
                              {[1,2,3,4,5].map(d => <div key={d} style={{ width:6, height:6, borderRadius:'50%', background: d<=lv.v ? 'var(--green)' : 'var(--border)' }} />)}
                            </div>
                            <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{lv.label}</span>
                          </div>
                          <span style={{ fontSize:11, color:'var(--text-dim)' }}>{lv.desc}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setPendingSkill(null)} style={{ marginTop:14, width:'100%', padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-dim)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                  </div>
                </>
              )}

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <div>
                  <p style={{ fontSize:18, fontFamily:"'Editorial New', Georgia, serif", color:'var(--text)', marginBottom:3 }}>Technical Skills</p>
                  <p style={{ fontSize:13, color:'var(--text-dim)' }}>{addedSkills.length} skill{addedSkills.length !== 1 ? 's' : ''} added</p>
                </div>
                <SaveBtn onClick={() => save({ skills: d.skills || [] })} />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'180px 1fr', gap:16, alignItems:'start' }}>
                {/* Category nav */}
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  {SKILL_CATS_P.map(cat => {
                    const cnt = addedSkills.filter(s => s.category === cat).length;
                    return (
                      <button key={cat} onClick={() => setSkillCat(cat)} className="hn-item" style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'9px 12px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit',
                        background: skillCat===cat ? 'var(--bg-subtle)' : 'transparent',
                        color: skillCat===cat ? 'var(--text)' : 'var(--text-dim)',
                        fontSize:13, fontWeight: skillCat===cat ? 600 : 400, textAlign:'left',
                      }}>
                        <span>{cat}</span>
                        {cnt > 0 && <span style={{ fontSize:11, fontWeight:700, color:'var(--green)', background:'var(--green-tint)', borderRadius:20, padding:'1px 7px' }}>{cnt}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Right panel */}
                <div>
                  {/* Picker */}
                  <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 18px', marginBottom:20 }}>
                    <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:12 }}>{skillCat}</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {SKILL_OPTIONS_P.filter(s => s.cat === skillCat).map(skill => {
                        const added = addedSkills.some(s => s.name === skill.name);
                        return (
                          <button key={skill.name} onClick={() => { if (!added) setPendingSkill(skill.name); }}
                            style={{
                              display:'flex', alignItems:'center', gap:6,
                              padding:'6px 12px', borderRadius:20, fontSize:12, fontFamily:'inherit',
                              cursor: added ? 'default' : 'pointer', transition:'all 0.12s',
                              border: `1px solid ${added ? 'var(--green)' : 'var(--border)'}`,
                              background: added ? 'var(--green-tint)' : 'var(--bg-subtle)',
                              color: added ? 'var(--green-text)' : 'var(--text-mid)',
                            }}>
                            <span style={{ display:'flex', alignItems:'center' }}>{getSkillLogo(skill.name)}</span>
                            {added ? '✓ ' : '+ '}{skill.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Added skills — flat chip grid, no cards */}
                  {addedSkills.length > 0 ? (
                    <div>
                      {Object.keys(grouped).length > 0 && Object.entries(grouped).map(([cat, skills]) => (
                        <div key={cat} style={{ marginBottom: 20 }}>
                          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:10 }}>{cat}</p>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                            {skills.map((skill) => {
                              const i = addedSkills.findIndex(s => s.name === skill.name);
                              const levelColors = ['','#9B9B97','#D4A84B','#1A7A4A','#0A66C2','#7C3AED'];
                              return (
                                <div key={skill.id||skill.name}
                                  style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px 6px 8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', fontSize:12, color:'var(--text)', position:'relative', cursor:'default' }}
                                  title={`${skill.name} · ${LEVEL_LABELS_P[skill.level]}`}>
                                  <span style={{ display:'flex', alignItems:'center', flexShrink:0 }}>{getSkillLogo(skill.name)}</span>
                                  <span style={{ fontWeight:500 }}>{skill.name}</span>
                                  {/* tiny dot level indicator */}
                                  <div style={{ display:'flex', gap:2, marginLeft:2 }}>
                                    {[1,2,3,4,5].map(lv => (
                                      <div key={lv} style={{ width:4, height:4, borderRadius:'50%', background: skill.level>=lv ? levelColors[skill.level] : 'var(--border)' }} />
                                    ))}
                                  </div>
                                  {/* remove × on hover */}
                                  <button onClick={() => setDraft(x=>({...x, skills:(x.skills||[]).filter((_,j)=>j!==i)}))}
                                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--border-mid)', padding:'0 0 0 2px', lineHeight:1, fontSize:13, flexShrink:0 }}
                                    onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                                    onMouseLeave={e=>e.currentTarget.style.color='var(--border-mid)'}>×</button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding:'32px', textAlign:'center', border:'2px dashed var(--border)', borderRadius:12 }}>
                      <p style={{ fontSize:13, color:'var(--text-dim)' }}>Click a skill above — you'll pick your level before it's added</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* PREFERENCES */}
        {activeSection === 'prefs' && (
          <div style={{ maxWidth: 700 }}>
            <p style={{ fontSize: 18, fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)', marginBottom: 24 }}>Preferences</p>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Work Preferences</p>
                <SaveBtn onClick={() => save({ preferred_roles: d.preferred_roles, availability: d.availability, work_preference: d.work_preference, min_stipend: d.min_stipend })} />
              </div>
              <FieldLabel>Preferred Roles</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 18 }}>
                {ROLE_OPTIONS_P.map(role => {
                  const sel = (d.preferred_roles||[]).includes(role);
                  return <button key={role} onClick={() => setDraft(x=>({...x,preferred_roles:sel?(x.preferred_roles||[]).filter(r=>r!==role):[...(x.preferred_roles||[]),role]}))} style={{ padding:'9px 12px', borderRadius:8, fontSize:12, fontFamily:'inherit', cursor:'pointer', textAlign:'left', border:`1px solid ${sel?'var(--green)':'var(--border)'}`, background:sel?'var(--green-tint)':'transparent', color:sel?'var(--green-text)':'var(--text-mid)', fontWeight:sel?500:400 }}>{role}</button>;
                })}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <FieldLabel>Availability</FieldLabel>
                  <select style={inp_p} value={d.availability||'Immediate'} onChange={e=>setDraft(x=>({...x,availability:e.target.value}))}>
                    <option>Immediate</option><option>After exams</option><option>Next semester</option><option>Not available</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Work Preference</FieldLabel>
                  <select style={inp_p} value={d.work_preference||'remote'} onChange={e=>setDraft(x=>({...x,work_preference:e.target.value}))}>
                    <option value="remote">Remote</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="any">Any</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop:14 }}>
                <FieldLabel>Min Stipend</FieldLabel>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:14, color:'var(--text-dim)' }}>₹</span>
                  <input style={{ ...inp_p, maxWidth:150 }} type="number" value={d.min_stipend||''} placeholder="0" onChange={e=>setDraft(x=>({...x,min_stipend:e.target.value}))} />
                  <span style={{ fontSize:12, color:'var(--text-dim)' }}>/ month</span>
                </div>
              </div>
            </Card>
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Notifications</p>
              {[
                { label:'New job matches', sub:'When a job matches your skills', key:'notif_matches' },
                { label:'Application updates', sub:'When recruiters view your profile', key:'notif_apps' },
                { label:'Weekly digest', sub:'Summary every Monday', key:'notif_digest' },
                { label:'Interview invites', sub:'Direct interview invitations', key:'notif_interviews' },
              ].map(({ label, sub, key }) => (
                <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div><p style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:2 }}>{label}</p><p style={{ fontSize:11, color:'var(--text-dim)' }}>{sub}</p></div>
                  <Toggle_P on={d[key]!==false} onChange={val=>{ setDraft(x=>({...x,[key]:val})); save({[key]:val}); }} />
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* MY HUNT */}
        {activeSection === 'myhunt' && (
          <div style={{ maxWidth: 600 }}>
            {/* Header */}
            <div style={{ marginBottom: 48 }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--green)', marginBottom:10 }}>Private · Only you see this</p>
              <h1 style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:38, fontWeight:400, color:'var(--text)', lineHeight:1.15, marginBottom:12 }}>
                What are you<br /><em>really</em> hunting for?
              </h1>
              <p style={{ fontSize:14, color:'var(--text-dim)', lineHeight:1.7, maxWidth:480 }}>
                Not your resume. Not the job title. The real stuff — your drives, your beliefs, your <em>why</em>. This stays private. It's just for you.
              </p>
            </div>

            {/* Section 01 */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--green)', letterSpacing:'0.1em', fontFamily:"'Editorial New', Georgia, serif" }}>01</span>
                <div>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:20, color:'var(--text)', marginBottom:3 }}>The Hunt</p>
                  <p style={{ fontSize:12, color:'var(--text-dim)' }}>Not the job title. What are you actually after?</p>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  {d.my_hunt && <button onClick={() => save({my_hunt:d.my_hunt})} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:'var(--green)', color:'#fff', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Save</button>}
                </div>
              </div>
              <textarea value={d.my_hunt||''} onChange={e=>setDraft(x=>({...x,my_hunt:e.target.value}))}
                placeholder="I'm hunting for the place where craft meets impact. Not just shipping features — building something that actually changes how someone spends their day..."
                style={{ ...inp_p, resize:'none', lineHeight:1.8, fontSize:14, padding:'14px 16px', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', borderRadius:0, paddingLeft:0 }} rows={4} />
            </div>

            {/* Divider */}
            <div style={{ height:1, background:'var(--border)', marginBottom:48 }} />

            {/* Section 02 */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--green)', letterSpacing:'0.1em', fontFamily:"'Editorial New', Georgia, serif" }}>02</span>
                <div>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:20, color:'var(--text)', marginBottom:3 }}>Philosophy</p>
                  <p style={{ fontSize:12, color:'var(--text-dim)' }}>How you see the world. What you believe is true.</p>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  {d.philosophy && <button onClick={() => save({philosophy:d.philosophy})} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:'var(--green)', color:'#fff', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Save</button>}
                </div>
              </div>
              <textarea value={d.philosophy||''} onChange={e=>setDraft(x=>({...x,philosophy:e.target.value}))}
                placeholder="I believe the best products start with genuine frustration — your own. You can't design well for problems you've never felt..."
                style={{ ...inp_p, resize:'none', lineHeight:1.8, fontSize:14, padding:'14px 16px', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', borderRadius:0, paddingLeft:0 }} rows={4} />
            </div>

            <div style={{ height:1, background:'var(--border)', marginBottom:48 }} />

            {/* Section 03 */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--green)', letterSpacing:'0.1em', fontFamily:"'Editorial New', Georgia, serif" }}>03</span>
                <div>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:20, color:'var(--text)', marginBottom:3 }}>What moves you</p>
                  <p style={{ fontSize:12, color:'var(--text-dim)' }}>Books, people, ideas that rewired how you think.</p>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  {d.inspirations && <button onClick={() => save({inspirations:d.inspirations})} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:'var(--green)', color:'#fff', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Save</button>}
                </div>
              </div>
              <textarea value={d.inspirations||''} onChange={e=>setDraft(x=>({...x,inspirations:e.target.value}))}
                placeholder="Paul Graham's essays got me comfortable with uncertainty. The Mom Test made me rethink every conversation I'd had with users. Feynman — the joy of figuring things out..."
                style={{ ...inp_p, resize:'none', lineHeight:1.8, fontSize:14, padding:'14px 16px', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', borderRadius:0, paddingLeft:0 }} rows={4} />
            </div>

            <div style={{ height:1, background:'var(--border)', marginBottom:48 }} />

            {/* Section 04 */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--green)', letterSpacing:'0.1em', fontFamily:"'Editorial New', Georgia, serif" }}>04</span>
                <div>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:20, color:'var(--text)', marginBottom:3 }}>Life outside work</p>
                  <p style={{ fontSize:12, color:'var(--text-dim)' }}>Who are you when the laptop is closed?</p>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  {d.life_outside && <button onClick={() => save({life_outside:d.life_outside})} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:'var(--green)', color:'#fff', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Save</button>}
                </div>
              </div>
              <textarea value={d.life_outside||''} onChange={e=>setDraft(x=>({...x,life_outside:e.target.value}))}
                placeholder="Cricket every Sunday morning — I bowl medium-pace. Three years of Carnatic music before I pivoted to code. Still cook every meal..."
                style={{ ...inp_p, resize:'none', lineHeight:1.8, fontSize:14, padding:'14px 16px', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', borderRadius:0, paddingLeft:0 }} rows={4} />
            </div>

            <div style={{ height:1, background:'var(--border)', marginBottom:48 }} />

            {/* Quote */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:20 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--green)', letterSpacing:'0.1em', fontFamily:"'Editorial New', Georgia, serif" }}>"</span>
                <div>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:20, color:'var(--text)', marginBottom:3 }}>A line you live by</p>
                  <p style={{ fontSize:12, color:'var(--text-dim)' }}>Something that keeps pulling you forward.</p>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  {d.quote && <button onClick={() => save({quote:d.quote,quote_author:d.quote_author})} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:'var(--green)', color:'#fff', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Save</button>}
                </div>
              </div>
              {d.quote ? (
                <div style={{ borderLeft:'2px solid var(--green)', paddingLeft:20, marginBottom:16 }}>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:22, color:'var(--text)', lineHeight:1.5, fontStyle:'italic', marginBottom:8 }}>"{d.quote}"</p>
                  {d.quote_author && <p style={{ fontSize:12, color:'var(--text-dim)' }}>{d.quote_author}</p>}
                </div>
              ) : (
                <div style={{ borderLeft:'2px solid var(--border)', paddingLeft:20, marginBottom:16 }}>
                  <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:18, color:'var(--text-dim)', fontStyle:'italic' }}>Your quote will appear here…</p>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <input style={{ ...inp_p, fontSize:14, fontFamily:"'Editorial New', Georgia, serif", fontStyle:'italic' }} value={d.quote||''} placeholder="The people who are crazy enough to think they can change the world…" onChange={e=>setDraft(x=>({...x,quote:e.target.value}))} />
                <input style={{ ...inp_p, fontSize:12 }} value={d.quote_author||''} placeholder="— Steve Jobs (or write your own)" onChange={e=>setDraft(x=>({...x,quote_author:e.target.value}))} />
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS & RATINGS */}
        {activeSection === 'reviews' && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:6 }}>Reviews & Ratings</p>
              <h1 style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:28, fontWeight:400, color:'var(--text)', marginBottom:8 }}>What recruiters say.</h1>
              <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6, maxWidth:440 }}>After internships close, recruiters rate your performance. These ratings are visible to future recruiters and boost your HUNT Score.</p>
            </div>
            <div style={{ padding:'64px 32px', textAlign:'center', border:'2px dashed var(--border)', borderRadius:14, background:'var(--bg-card)' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--bg-subtle)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:20 }}>⭐</div>
              <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:18, color:'var(--text)', marginBottom:6 }}>No reviews yet.</p>
              <p style={{ fontSize:13, color:'var(--text-dim)', maxWidth:320, margin:'0 auto', lineHeight:1.6 }}>Complete an internship through HUNT and your recruiter will be invited to leave a review. Those reviews build your reputation here.</p>
            </div>
          </div>
        )}

        {/* HUNT SCORE */}
        {activeSection === 'huntscore' && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:6 }}>Hunt Score</p>
              <h1 style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:28, fontWeight:400, color:'var(--text)', marginBottom:8 }}>Your signal, scored.</h1>
              <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6, maxWidth:480 }}>Your HUNT Score is a dynamic credibility score built from verified skills, project proof, recruiter feedback, and consistency. Recruiters see it. Make it count.</p>
            </div>
            {/* Score placeholder */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'32px', marginBottom:16, display:'flex', alignItems:'center', gap:28 }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--bg-subtle)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:26, color:'var(--text-dim)', fontWeight:400 }}>—</p>
              </div>
              <div>
                <p style={{ fontFamily:"'Editorial New', Georgia, serif", fontSize:18, color:'var(--text)', marginBottom:4 }}>Not yet calculated</p>
                <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6 }}>Complete your profile, add verified projects, and get your first recruiter rating to unlock your score.</p>
              </div>
            </div>
            {/* Score components */}
            {[
              { label:'Profile completeness', desc:'Name, college, bio, photo', done: false },
              { label:'Verified skills', desc:'Skills with proof of work', done: false },
              { label:'Project portfolio', desc:'At least 2 projects with links', done: false },
              { label:'First recruiter rating', desc:'Complete an internship through HUNT', done: false },
              { label:'Response rate', desc:'Reply to recruiter messages within 48h', done: false },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-card)', marginBottom:8 }}>
                <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${item.done ? 'var(--green)' : 'var(--border)'}`, background: item.done ? 'var(--green-tint)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {item.done && <span style={{ fontSize:10, color:'var(--green)' }}>✓</span>}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:500, color: item.done ? 'var(--text)' : 'var(--text-mid)', marginBottom:1 }}>{item.label}</p>
                  <p style={{ fontSize:11, color:'var(--text-dim)' }}>{item.desc}</p>
                </div>
                <span style={{ fontSize:11, color: item.done ? 'var(--green)' : 'var(--text-dim)', fontWeight: item.done ? 600 : 400 }}>{item.done ? 'Done' : 'Pending'}</span>
              </div>
            ))}
          </div>
        )}

        {/* ACCOUNT */}
        {activeSection === 'account' && (
          <div style={{ maxWidth: 560 }}>
            <p style={{ fontSize: 18, fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)', marginBottom: 24 }}>Account</p>
            <Card>
              <div style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 16px', borderRadius:10, background:'var(--bg-subtle)', border:'1px solid var(--border)', marginBottom:20 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--green-tint)', border:'2px solid var(--green)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'var(--green)', flexShrink:0 }}>{initials}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:2 }}>{d.full_name}</p>
                  <p style={{ fontSize:12, color:'var(--text-dim)' }}>{d.email}</p>
                </div>
                <label style={{ fontSize:12, padding:'6px 14px', borderRadius:7, border:'1px solid var(--border)', cursor:'pointer', color:'var(--text-mid)', background:'var(--bg-card)', fontFamily:'inherit' }}>
                  Change avatar<input type="file" accept="image/*" style={{ display:'none' }} onChange={() => showToast('Coming soon')} />
                </label>
              </div>
              <div>
                <FieldLabel>Change email</FieldLabel>
                <div style={{ display:'flex', gap:8 }}>
                  <input style={{ ...inp_p, flex:1 }} type="email" defaultValue={d.email||''} placeholder="new@email.com" />
                  <button onClick={() => showToast('Coming soon')} style={{ padding:'0 16px', borderRadius:7, border:'none', background:'var(--text)', color:'var(--bg)', fontSize:12, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>Change</button>
                </div>
              </div>
            </Card>
            <Card>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:14 }}>Appearance</p>
              <div style={{ display:'flex', gap:8 }}>
                {['light','dark'].map(t => (
                  <button key={t} onClick={() => setTheme(t)} style={{ flex:1, padding:'10px', borderRadius:8, border:`1.5px solid ${theme===t?'var(--text)':'var(--border)'}`, background:theme===t?'var(--bg-subtle)':'transparent', cursor:'pointer', fontSize:13, fontWeight:theme===t?600:400, color:'var(--text)', fontFamily:'inherit' }}>
                    {t==='light'?'☀️ Light':'🌙 Dark'}
                  </button>
                ))}
              </div>
            </Card>
            <Card>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:14 }}>Privacy</p>
              {[
                { label:'Visible to recruiters', sub:'Recruiters can find your profile', key:'privacy_visible', def:true },
                { label:'Show college name', sub:'Display your college on profile', key:'privacy_college', def:true },
                { label:'Activity status', sub:'Show when last active', key:'privacy_activity', def:false },
              ].map(({ label, sub, key, def }) => (
                <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div><p style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:2 }}>{label}</p><p style={{ fontSize:11, color:'var(--text-dim)' }}>{sub}</p></div>
                  <Toggle_P on={d[key]!==undefined?d[key]:def} onChange={val=>{ setDraft(x=>({...x,[key]:val})); save({[key]:val}); }} />
                </div>
              ))}
            </Card>
            <div style={{ padding:'16px 18px', borderRadius:10, border:'1px solid var(--red)', background:'var(--red-tint)' }}>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--red)', marginBottom:3 }}>Danger Zone</p>
              <p style={{ fontSize:12, color:'var(--red)', opacity:0.8, marginBottom:12 }}>Permanently delete your account. Cannot be undone.</p>
              <button onClick={() => { if(window.confirm('Delete your account?')) showToast('Delete coming soon','err'); }} style={{ padding:'7px 16px', borderRadius:7, border:'1px solid var(--red)', background:'transparent', color:'var(--red)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Delete account</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
