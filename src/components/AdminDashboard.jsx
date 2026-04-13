// AdminDashboard.jsx — HUNT Admin Dashboard (Real Supabase Data)
// Tables: students, recruiters, jobs, applications, recruiter_waitlist
// Full admin controls: approve/reject/edit students, approve recruiters,
// toggle jobs, post new jobs, manage waitlist — all writes go to Supabase.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, Building2, Briefcase, Search, X, Github, ExternalLink,
  CheckCircle2, Star, BarChart2, Activity, Target, Calendar,
  Mail, MapPin, Globe, ArrowUpRight, ArrowDownRight, Minus,
  Sun, Moon, Eye, EyeOff, RefreshCw, Plus, Trash2, Link2,
  Copy, Check, Phone, FileText, Clock, AlertCircle, ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../services/supabase';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD     = 'hunt2026';
const ADMIN_RECRUITER_ID = '78b5cea0-ee99-49f8-8cef-d72a5199f5c3';

const SKILL_OPTIONS = [
  'JavaScript','Python','Java','TypeScript','C / C++','Golang','Rust','SQL',
  'React','React Native','Next.js','Tailwind CSS','AngularJS','Redux',
  'Flutter','Android Dev','iOS Dev',
  'Node.js','Express.js','Django','Flask','FastAPI','REST API','GraphQL',
  'MySQL','PostgreSQL','MongoDB','Firebase','Redis',
  'Machine Learning','Data Analysis','TensorFlow','PyTorch','Pandas',
  'Scikit-learn','Jupyter Notebook','Data Science','NLP',
  'Docker','Linux','AWS','CI/CD','Git',
  'Figma','Canva','SEO','Ethical Hacking',
  'Shopify','Amazon Seller','WooCommerce','Product Listing',
  'Email Marketing','Social Media Marketing','Google Ads','Meta Ads',
  'Competitor Research','Content Writing','Google Analytics','Sales Analysis',
  'Excel / Google Sheets','Google Workspace','MS Office',
];

// ─── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = {
  light: {
    bg: '#FAFAF8', surface: '#FFFFFF', surfaceAlt: '#F5F5F2',
    border: '#EBEBEA', borderHigh: '#D6D6D3',
    text: '#0A0A0A', muted: '#9B9B97', sub: '#5A5A56',
    accent: '#D85A30', accentSoft: 'rgba(216,90,48,0.08)',
    green: '#1A7A4A', greenSoft: '#E8F5EE', greenBorder: 'rgba(26,122,74,0.25)',
    blue: '#2563EB', blueSoft: 'rgba(37,99,235,0.08)', blueBorder: 'rgba(37,99,235,0.2)',
    amber: '#92600A', amberSoft: '#FDF3E3', amberBorder: 'rgba(146,96,10,0.25)',
    red: '#C0392B', redSoft: '#FDECEA', redBorder: 'rgba(192,57,43,0.25)',
    purple: '#6D28D9', purpleSoft: 'rgba(109,40,217,0.08)',
    navBg: '#FFFFFF', inputBg: '#F5F5F2',
  },
  dark: {
    bg: '#0E0E0F', surface: '#16161A', surfaceAlt: '#1E1E24',
    border: 'rgba(255,255,255,0.07)', borderHigh: 'rgba(255,255,255,0.13)',
    text: '#F0EEE8', muted: '#7A7A80', sub: '#A0A09A',
    accent: '#D85A30', accentSoft: 'rgba(216,90,48,0.15)',
    green: '#2ECC85', greenSoft: 'rgba(46,204,133,0.12)', greenBorder: 'rgba(46,204,133,0.3)',
    blue: '#4A9EFF', blueSoft: 'rgba(74,158,255,0.12)', blueBorder: 'rgba(74,158,255,0.3)',
    amber: '#F0A830', amberSoft: 'rgba(240,168,48,0.12)', amberBorder: 'rgba(240,168,48,0.3)',
    red: '#E55454', redSoft: 'rgba(229,84,84,0.12)', redBorder: 'rgba(229,84,84,0.3)',
    purple: '#A78BFA', purpleSoft: 'rgba(167,139,250,0.12)',
    navBg: '#16161A', inputBg: '#1E1E24',
  },
};

const font  = "'DM Sans', system-ui, sans-serif";
const serif = "Georgia, 'Times New Roman', serif";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const ini         = (n) => (n||'?').split(' ').map(c=>c[0]).join('').slice(0,2).toUpperCase();
const sc          = (v,T) => v>=75?T.green:v>=50?T.amber:T.red;
const sb          = (v,T) => v>=75?T.greenSoft:v>=50?T.amberSoft:T.redSoft;
const sbd         = (v,T) => v>=75?T.greenBorder:v>=50?T.amberBorder:T.redBorder;
const fmt         = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';

// Derive a student "status" from their profile data
const studentStatus = (s) => {
  if (s.profile_completeness >= 70 && (s.skills||[]).length > 0) return 'active';
  return 'incomplete';
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const SL = ({children,T}) => <p style={{fontSize:10,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:T.muted,margin:'0 0 10px'}}>{children}</p>;

function Avatar({name,size=36,T}) {
  return <div style={{width:size,height:size,borderRadius:'50%',background:T.blueSoft,border:`1.5px solid ${T.blueBorder}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:Math.round(size*0.3),fontWeight:600,color:T.blue,flexShrink:0}}>{ini(name)}</div>;
}

function Badge({children,color,bg,border}) {
  return <span style={{fontSize:10,fontWeight:500,padding:'3px 8px',borderRadius:20,border:`1px solid ${border||color+'40'}`,background:bg||'transparent',color,display:'inline-flex',alignItems:'center',gap:4,whiteSpace:'nowrap'}}>{children}</span>;
}

function Pill({active,onClick,children,T}) {
  return <button onClick={onClick} style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${active?T.accent:T.border}`,background:active?T.accentSoft:'transparent',color:active?T.accent:T.muted,fontSize:11,cursor:'pointer',fontFamily:font}}>{children}</button>;
}

function StatCard({label,value,sub,trend,color,icon:Icon,T}) {
  return (
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:'16px 18px',display:'flex',flexDirection:'column',gap:6}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:10,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase'}}>{label}</span>
        {Icon && <Icon size={14} color={T.muted}/>}
      </div>
      <div style={{display:'flex',alignItems:'baseline',gap:8}}>
        <span style={{fontFamily:serif,fontSize:28,color:color||T.text,fontWeight:400,lineHeight:1}}>{value}</span>
        {trend!==undefined && <span style={{fontSize:11,color:trend>=0?T.green:T.red,display:'flex',alignItems:'center',gap:2}}>{trend>0?<ArrowUpRight size={11}/>:<ArrowDownRight size={11}/>}{Math.abs(trend)}%</span>}
      </div>
      {sub && <span style={{fontSize:11,color:T.muted}}>{sub}</span>}
    </div>
  );
}

function SBar({value,onChange,placeholder,T}) {
  return (
    <div style={{position:'relative',flex:1}}>
      <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:T.muted,pointerEvents:'none'}}/>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',padding:'8px 12px 8px 30px',borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,color:T.text,fontSize:13,fontFamily:font,outline:'none',boxSizing:'border-box'}}
        onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
    </div>
  );
}

function Toast({msg,type}) {
  return <div style={{position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',zIndex:9999,padding:'9px 18px',borderRadius:8,fontSize:12,fontWeight:500,background:type==='error'?'rgba(192,57,43,0.95)':'rgba(26,122,74,0.95)',color:'#fff',boxShadow:'0 4px 20px rgba(0,0,0,0.2)',pointerEvents:'none',whiteSpace:'nowrap'}}>{msg}</div>;
}

// ─── PASSWORD GATE ────────────────────────────────────────────────────────────
function PasswordGate({onUnlock}) {
  const [val,setVal]=useState('');const [err,setErr]=useState(false);
  const check=()=>{if(val===ADMIN_PASSWORD)onUnlock();else{setErr(true);setTimeout(()=>setErr(false),1200);}};
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FAFAF8',fontFamily:font}}>
      <div style={{background:'#fff',border:'1px solid #EBEBEA',borderRadius:12,padding:'36px 40px',width:360,textAlign:'center',boxShadow:'0 4px 24px rgba(0,0,0,0.06)'}}>
        <div style={{fontSize:36,marginBottom:16}}>🔒</div>
        <h2 style={{fontFamily:serif,fontSize:24,fontWeight:400,color:'#0A0A0A',marginBottom:6}}>Admin access</h2>
        <p style={{fontSize:13,color:'#9B9B97',marginBottom:24}}>HUNT internal tools</p>
        <input type="password" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&check()} placeholder="Enter password" autoFocus
          style={{width:'100%',padding:'10px 14px',borderRadius:8,textAlign:'center',border:`1px solid ${err?'#C0392B':'#EBEBEA'}`,background:'#F5F5F2',color:'#0A0A0A',fontSize:13,fontFamily:font,outline:'none',boxSizing:'border-box',marginBottom:10}}/>
        {err && <p style={{fontSize:12,color:'#C0392B',marginBottom:8}}>Wrong password</p>}
        <button onClick={check} style={{width:'100%',padding:11,borderRadius:8,border:'none',background:'#D85A30',color:'#fff',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:font}}>Enter</button>
      </div>
    </div>
  );
}

// ─── STUDENT DETAIL ───────────────────────────────────────────────────────────
function StudentDetail({student:s,onClose,onUpdate,T}) {
  const [saving,setSaving]=useState(null);
  const status = studentStatus(s);

  const update = async (field, value) => {
    setSaving(field);
    try {
      const {error} = await supabase.from('students').update({[field]:value}).eq('id',s.id);
      if(error) throw error;
      onUpdate({...s,[field]:value});
    } catch(e){ alert('Failed: '+e.message); }
    finally{ setSaving(null); }
  };

  const deleteStudent = async () => {
    if(!window.confirm(`Delete ${s.full_name}? This cannot be undone.`)) return;
    await supabase.from('applications').delete().eq('student_id',s.id);
    await supabase.from('students').delete().eq('id',s.id);
    onUpdate(null); // signal deletion
  };

  return (
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:'hidden',position:'sticky',top:76}}>
      <div style={{padding:'12px 16px',borderBottom:`1px solid ${T.border}`,background:T.surfaceAlt,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <SL T={T}>Student profile</SL>
        <div style={{display:'flex',gap:8}}>
          <button onClick={deleteStudent} style={{background:'transparent',border:'none',cursor:'pointer',color:T.red,display:'flex'}} title="Delete student"><Trash2 size={13}/></button>
          <button onClick={onClose} style={{background:'transparent',border:'none',cursor:'pointer',color:T.muted,display:'flex'}}><X size={14}/></button>
        </div>
      </div>
      <div style={{padding:18,overflowY:'auto',maxHeight:'calc(100vh - 160px)'}}>
        {/* Identity */}
        <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:16}}>
          <Avatar name={s.full_name} size={44} T={T}/>
          <div style={{flex:1}}>
            <p style={{fontSize:15,fontWeight:600,color:T.text,margin:0}}>{s.full_name}</p>
            <p style={{fontSize:11,color:T.muted,margin:'2px 0 6px'}}>{s.college||'—'} · Year {s.year||'—'}</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
              <Badge color={status==='active'?T.blue:T.amber} bg={status==='active'?T.blueSoft:T.amberSoft} border={status==='active'?T.blueBorder:T.amberBorder}>
                {status==='active'?'● Active':'⚠ Incomplete'}
              </Badge>
              {s.work_preference && <Badge color={T.muted} border={T.border}>{s.work_preference}</Badge>}
            </div>
          </div>
          <div style={{padding:'6px 12px',borderRadius:10,background:sb(s.profile_completeness||0,T),border:`1.5px solid ${sbd(s.profile_completeness||0,T)}`,textAlign:'center',flexShrink:0}}>
            <p style={{fontFamily:serif,fontSize:22,color:sc(s.profile_completeness||0,T),margin:0,lineHeight:1}}>{s.profile_completeness||0}%</p>
            <p style={{fontSize:9,color:T.muted,margin:'2px 0 0'}}>profile</p>
          </div>
        </div>

        {/* Profile bar */}
        <div style={{marginBottom:16}}>
          <div style={{height:3,background:T.surfaceAlt,borderRadius:2,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${s.profile_completeness||0}%`,background:sc(s.profile_completeness||0,T),borderRadius:2}}/>
          </div>
        </div>

        {/* Skills */}
        {(s.skills||[]).length>0 && (
          <div style={{marginBottom:14}}>
            <SL T={T}>Skills ({(s.skills||[]).length})</SL>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {(s.skills||[]).map((sk,i)=>(
                <span key={i} style={{fontSize:10,padding:'3px 8px',borderRadius:6,background:T.blueSoft,border:`1px solid ${T.blueBorder}`,color:T.blue}}>
                  {sk.name} <span style={{opacity:0.6}}>L{sk.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preferred roles */}
        {(s.preferred_roles||[]).length>0 && (
          <div style={{marginBottom:14}}>
            <SL T={T}>Preferred roles</SL>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {(s.preferred_roles||[]).map((r,i)=><Badge key={i} color={T.purple} bg={T.purpleSoft}>{r}</Badge>)}
            </div>
          </div>
        )}

        {/* Tools */}
        {(s.tools||[]).length>0 && (
          <div style={{marginBottom:14}}>
            <SL T={T}>Tools</SL>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {(s.tools||[]).map((t,i)=><Badge key={i} color={T.muted} border={T.border}>{t}</Badge>)}
            </div>
          </div>
        )}

        {/* Projects */}
        {(s.projects||[]).length>0 && (
          <div style={{marginBottom:14}}>
            <SL T={T}>Projects ({(s.projects||[]).length})</SL>
            {(s.projects||[]).slice(0,3).map((p,i)=>(
              <div key={i} style={{padding:'8px 10px',borderRadius:8,border:`1px solid ${T.border}`,background:T.surfaceAlt,marginBottom:6}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                  <p style={{fontSize:11,fontWeight:500,color:T.text,margin:0}}>{p.name||p.title}</p>
                  {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" style={{color:T.muted,display:'flex'}}><ExternalLink size={11}/></a>}
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
                  {(Array.isArray(p.techStack)?p.techStack:[]).map((t,j)=>(
                    <span key={j} style={{fontSize:9,padding:'1px 5px',borderRadius:4,border:`1px solid ${T.border}`,color:T.muted}}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact */}
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12,marginBottom:14}}>
          <SL T={T}>Contact</SL>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <a href={`mailto:${s.email}`} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:T.muted,textDecoration:'none'}}><Mail size={11}/>{s.email}</a>
            {s.phone && <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:T.muted}}><Phone size={11}/>{s.phone}</div>}
          </div>
          <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
            {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:T.sub,padding:'4px 9px',borderRadius:20,border:`1px solid ${T.border}`,textDecoration:'none'}}><Github size={11}/> GitHub</a>}
            {s.linkedin_url  && <a href={s.linkedin_url}  target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:T.sub,padding:'4px 9px',borderRadius:20,border:`1px solid ${T.border}`,textDecoration:'none'}}><ExternalLink size={11}/> LinkedIn</a>}
            {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:T.sub,padding:'4px 9px',borderRadius:20,border:`1px solid ${T.border}`,textDecoration:'none'}}><Globe size={11}/> Portfolio</a>}
            {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:T.accent,padding:'4px 9px',borderRadius:20,border:`1px solid ${T.accent}30`,textDecoration:'none'}}><FileText size={11}/> Resume</a>}
          </div>
        </div>

        {/* Availability */}
        <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 10px',borderRadius:8,background:T.surfaceAlt,border:`1px solid ${T.border}`,marginBottom:14}}>
          <Calendar size={11} color={T.muted}/>
          <span style={{fontSize:11,color:T.muted}}>Availability:</span>
          <span style={{fontSize:11,color:T.text,fontWeight:500}}>{s.availability||'—'}</span>
        </div>

        {/* Admin actions */}
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12}}>
          <SL T={T}>Admin actions</SL>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <p style={{fontSize:10,color:T.muted,margin:'0 0 4px'}}>Set availability</p>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {['Immediate','In 2 weeks','In 1 month','Not available'].map(opt=>(
                <button key={opt} onClick={()=>update('availability',opt)} disabled={saving==='availability'}
                  style={{fontSize:10,padding:'4px 9px',borderRadius:6,border:`1px solid ${s.availability===opt?T.accent:T.border}`,background:s.availability===opt?T.accentSoft:'transparent',color:s.availability===opt?T.accent:T.muted,cursor:'pointer',fontFamily:font}}>
                  {opt}
                </button>
              ))}
            </div>
            <p style={{fontSize:10,color:T.muted,margin:'8px 0 4px'}}>Edit profile completeness</p>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <input type="number" min="0" max="100" defaultValue={s.profile_completeness||0}
                onBlur={e=>update('profile_completeness',parseInt(e.target.value))}
                style={{width:70,padding:'5px 8px',borderRadius:6,border:`1px solid ${T.border}`,background:T.inputBg,color:T.text,fontSize:12,fontFamily:font,outline:'none'}}/>
              <span style={{fontSize:11,color:T.muted}}>%</span>
              {saving==='profile_completeness' && <span style={{fontSize:10,color:T.muted}}>Saving…</span>}
            </div>
            <button onClick={deleteStudent} style={{marginTop:4,padding:'8px',borderRadius:8,border:`1px solid ${T.redBorder}`,background:T.redSoft,color:T.red,fontSize:11,fontWeight:500,cursor:'pointer',fontFamily:font}}>
              Delete student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RECRUITER DETAIL ─────────────────────────────────────────────────────────
function RecruiterDetail({recruiter:r,onClose,onUpdate,T}) {
  const [saving,setSaving]=useState(null);

  const update = async (field,value) => {
    setSaving(field);
    try {
      const {error} = await supabase.from('recruiters').update({[field]:value}).eq('id',r.id);
      if(error) throw error;
      onUpdate({...r,[field]:value});
    } catch(e){ alert('Failed: '+e.message); }
    finally{ setSaving(null); }
  };

  const logo = r.logo_emoji || r.logo || '🚀';
  const name = r.company_name || r.company || '—';
  const desc = r.what_you_build || r.about || '—';

  return (
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:'hidden',position:'sticky',top:76}}>
      <div style={{padding:'12px 16px',borderBottom:`1px solid ${T.border}`,background:T.surfaceAlt,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <SL T={T}>Recruiter profile</SL>
        <button onClick={onClose} style={{background:'transparent',border:'none',cursor:'pointer',color:T.muted,display:'flex'}}><X size={14}/></button>
      </div>
      <div style={{padding:18,overflowY:'auto',maxHeight:'calc(100vh - 160px)'}}>
        {/* Identity */}
        <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:16}}>
          <div style={{width:44,height:44,borderRadius:10,background:T.surfaceAlt,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{logo}</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
              <p style={{fontSize:15,fontWeight:600,color:T.text,margin:0}}>{name}</p>
              {r.is_approved && <span style={{fontSize:10,color:T.blue,background:T.blueSoft,padding:'1px 6px',borderRadius:8,border:`1px solid ${T.blueBorder}`}}>✓ Approved</span>}
            </div>
            <p style={{fontSize:11,color:T.muted,margin:'0 0 6px'}}>{desc}</p>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              <Badge color={r.is_approved?T.green:T.amber} bg={r.is_approved?T.greenSoft:T.amberSoft} border={r.is_approved?T.greenBorder:T.amberBorder}>
                {r.is_approved?'● Approved':'⟳ Pending'}
              </Badge>
              {r.stage && <Badge color={T.muted} border={T.border}>{r.stage}</Badge>}
              {r.team_size && <Badge color={T.muted} border={T.border}>{r.team_size}</Badge>}
            </div>
          </div>
        </div>

        {/* Role categories / hiring for */}
        {(r.role_categories||r.hiring_for||[]).length>0 && (
          <div style={{marginBottom:14}}>
            <SL T={T}>Hiring for</SL>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {(r.role_categories||r.hiring_for||[]).map((c,i)=><Badge key={i} color={T.purple} bg={T.purpleSoft}>{c}</Badge>)}
            </div>
          </div>
        )}

        {/* Contact */}
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12,marginBottom:14}}>
          <SL T={T}>Contact</SL>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {r.contact_name && <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:T.text}}><Users size={11} color={T.muted}/>{r.contact_name}</div>}
            {(r.contact_email||r.email) && <a href={`mailto:${r.contact_email||r.email}`} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:T.muted,textDecoration:'none'}}><Mail size={11}/>{r.contact_email||r.email}</a>}
            {r.phone && <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:T.muted}}><Phone size={11}/>{r.phone}</div>}
            {r.location && <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:T.muted}}><MapPin size={11}/>{r.location}</div>}
            {r.website && <a href={r.website.startsWith('http')?r.website:`https://${r.website}`} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:T.accent,textDecoration:'none'}}><Globe size={11}/>{r.website}</a>}
            {r.linkedin && <a href={r.linkedin} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:T.muted,textDecoration:'none'}}><ExternalLink size={11}/> LinkedIn</a>}
          </div>
        </div>

        {/* Extra info */}
        {(r.industry||r.founded_year) && (
          <div style={{marginBottom:14}}>
            {r.industry && <div style={{display:'flex',gap:6,marginBottom:4}}><span style={{fontSize:10,color:T.muted,width:80}}>Industry</span><span style={{fontSize:11,color:T.text}}>{r.industry}</span></div>}
            {r.founded_year && <div style={{display:'flex',gap:6}}><span style={{fontSize:10,color:T.muted,width:80}}>Founded</span><span style={{fontSize:11,color:T.text}}>{r.founded_year}</span></div>}
          </div>
        )}

        {r.notes && (
          <div style={{padding:'8px 10px',borderRadius:8,background:T.surfaceAlt,border:`1px solid ${T.border}`,marginBottom:14}}>
            <p style={{fontSize:9,color:T.muted,margin:'0 0 4px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Notes</p>
            <p style={{fontSize:11,color:T.text,margin:0}}>{r.notes}</p>
          </div>
        )}

        {/* Admin actions */}
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12}}>
          <SL T={T}>Admin actions</SL>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            <button onClick={()=>update('is_approved',!r.is_approved)} disabled={saving==='is_approved'}
              style={{padding:'9px',borderRadius:8,border:`1px solid ${r.is_approved?T.redBorder:T.greenBorder}`,background:r.is_approved?T.redSoft:T.greenSoft,color:r.is_approved?T.red:T.green,fontSize:11,fontWeight:500,cursor:'pointer',fontFamily:font}}>
              {saving==='is_approved'?'Saving…':r.is_approved?'Revoke approval':'✓ Approve'}
            </button>
            <button onClick={()=>update('notes',(r.notes?r.notes+'\n':'')+'Reviewed by admin on '+new Date().toLocaleDateString())}
              style={{padding:'9px',borderRadius:8,border:`1px solid ${T.border}`,background:T.surfaceAlt,color:T.sub,fontSize:11,cursor:'pointer',fontFamily:font}}>
              Add note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({students,recruiters,jobs,applications,T}) {
  const total     = students.length;
  const active    = students.filter(s=>studentStatus(s)==='active').length;
  const incomplete= students.filter(s=>studentStatus(s)==='incomplete').length;
  const rTotal    = recruiters.length;
  const rApproved = recruiters.filter(r=>r.is_approved).length;
  const totalJobs = jobs.length;
  const activeJobs= jobs.filter(j=>j.is_active).length;
  const totalApps = applications.length;
  const shortlisted=applications.filter(a=>a.status==='shortlisted').length;
  const avgComp   = total>0?Math.round(students.reduce((s,st)=>s+(st.profile_completeness||0),0)/total):0;

  const skillCounts={};
  students.forEach(s=>(s.skills||[]).forEach(sk=>{skillCounts[sk.name]=(skillCounts[sk.name]||0)+1;}));
  const topSkills=Object.entries(skillCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);

  const collegeCounts={};
  students.forEach(s=>{if(s.college){collegeCounts[s.college]=(collegeCounts[s.college]||0)+1;}});
  const topColleges=Object.entries(collegeCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const card=p=><StatCard {...p} T={T}/>;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div>
        <SL T={T}>Platform overview</SL>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
          {card({label:'Students',value:total,icon:Users,color:T.blue,sub:`${active} active · ${incomplete} incomplete`})}
          {card({label:'Recruiters',value:rTotal,icon:Building2,color:T.accent,sub:`${rApproved} approved`})}
          {card({label:'Jobs posted',value:totalJobs,icon:Briefcase,color:T.purple,sub:`${activeJobs} active`})}
          {card({label:'Applications',value:totalApps,icon:BarChart2,color:T.green,sub:`${shortlisted} shortlisted`})}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
        {card({label:'Avg profile %',value:`${avgComp}%`,icon:Activity,color:T.blue})}
        {card({label:'Total applicants',value:jobs.reduce((s,j)=>s+(j.current_applicants||0),0),icon:Users,color:T.amber})}
        {card({label:'Pending approval',value:recruiters.filter(r=>!r.is_approved).length,icon:AlertCircle,color:T.amber})}
        {card({label:'Conversion rate',value:totalApps>0?`${Math.round((shortlisted/totalApps)*100)}%`:'—',icon:Target,color:T.green})}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {/* Top skills */}
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:18}}>
          <SL T={T}>Top skills on platform</SL>
          {topSkills.length===0 ? <p style={{fontSize:12,color:T.muted}}>No skill data yet.</p> :
            topSkills.map(([skill,count])=>{
              const pct=total>0?Math.round((count/total)*100):0;
              return (
                <div key={skill} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                  <span style={{fontSize:11,color:T.text,width:110,flexShrink:0}}>{skill}</span>
                  <div style={{flex:1,height:4,background:T.surfaceAlt,borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:T.accent,borderRadius:2}}/>
                  </div>
                  <span style={{fontSize:10,color:T.muted,width:28,textAlign:'right'}}>{count}</span>
                </div>
              );
            })
          }
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* Top colleges */}
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:18}}>
            <SL T={T}>Students by college</SL>
            {topColleges.length===0 ? <p style={{fontSize:12,color:T.muted}}>No data yet.</p> :
              topColleges.map(([college,count])=>(
                <div key={college} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7}}>
                  <span style={{fontSize:11,color:T.text,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginRight:8}}>{college}</span>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                    <div style={{width:60,height:3,background:T.surfaceAlt,borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${(count/total)*100}%`,background:T.blue,borderRadius:2}}/>
                    </div>
                    <span style={{fontSize:10,color:T.muted,width:14,textAlign:'right'}}>{count}</span>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Application status breakdown */}
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:18}}>
            <SL T={T}>Application statuses</SL>
            {[
              {label:'Pending',count:applications.filter(a=>!a.status||a.status==='pending').length,color:T.muted},
              {label:'Shortlisted',count:applications.filter(a=>a.status==='shortlisted').length,color:T.green},
              {label:'Interview',count:applications.filter(a=>a.status==='interview').length,color:T.blue},
              {label:'Rejected',count:applications.filter(a=>a.status==='rejected').length,color:T.red},
            ].map(({label,count,color})=>(
              <div key={label} style={{display:'flex',alignItems:'center',gap:10,marginBottom:7}}>
                <div style={{width:`${totalApps>0?Math.max((count/totalApps)*100,2):2}%`,minWidth:4,height:20,background:color+'20',border:`1px solid ${color}40`,borderRadius:4}}/>
                <span style={{fontSize:10,color:T.muted,flex:1}}>{label}</span>
                <span style={{fontSize:12,color,fontWeight:500}}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent students */}
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:18}}>
        <SL T={T}>Recently joined students</SL>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {[...students].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,6).map(s=>(
            <div key={s.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:8,border:`1px solid ${T.border}`,background:T.surfaceAlt}}>
              <Avatar name={s.full_name} size={30} T={T}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:12,fontWeight:500,color:T.text,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.full_name}</p>
                <p style={{fontSize:10,color:T.muted,margin:0}}>{s.college||'—'}</p>
              </div>
              <Badge color={sc(s.profile_completeness||0,T)} bg={sb(s.profile_completeness||0,T)} border={sbd(s.profile_completeness||0,T)}>{s.profile_completeness||0}%</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENTS TAB ─────────────────────────────────────────────────────────────
function StudentsTab({students:init,T,showToast}) {
  const [students,setStudents]=useState(init);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all');
  const [sortBy,setSortBy]=useState('recent');
  const [selected,setSelected]=useState(null);

  useEffect(()=>setStudents(init),[init]);

  const filtered=useMemo(()=>{
    let arr=[...students];
    if(search) arr=arr.filter(s=>
      s.full_name?.toLowerCase().includes(search.toLowerCase())||
      s.college?.toLowerCase().includes(search.toLowerCase())||
      s.email?.toLowerCase().includes(search.toLowerCase())||
      (s.skills||[]).some(sk=>sk.name?.toLowerCase().includes(search.toLowerCase()))
    );
    if(filter==='active')     arr=arr.filter(s=>studentStatus(s)==='active');
    if(filter==='incomplete') arr=arr.filter(s=>studentStatus(s)==='incomplete');
    if(filter==='no_skills')  arr=arr.filter(s=>(s.skills||[]).length===0);
    arr.sort((a,b)=>{
      if(sortBy==='recent')       return new Date(b.created_at)-new Date(a.created_at);
      if(sortBy==='completeness') return (b.profile_completeness||0)-(a.profile_completeness||0);
      if(sortBy==='name')         return a.full_name?.localeCompare(b.full_name||'')||0;
      return 0;
    });
    return arr;
  },[students,search,filter,sortBy]);

  const handleUpdate=(updated)=>{
    if(updated===null){
      setStudents(p=>p.filter(x=>x.id!==selected.id));
      setSelected(null);
      showToast('Student deleted');
    } else {
      setStudents(p=>p.map(x=>x.id===updated.id?updated:x));
      setSelected(updated);
      showToast('Updated');
    }
  };

  const counts={all:students.length,active:students.filter(s=>studentStatus(s)==='active').length,incomplete:students.filter(s=>studentStatus(s)==='incomplete').length,no_skills:students.filter(s=>(s.skills||[]).length===0).length};

  return (
    <div style={{display:'grid',gridTemplateColumns:selected?'1fr 320px':'1fr',gap:16}}>
      <div>
        <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center',flexWrap:'wrap'}}>
          <SBar value={search} onChange={setSearch} placeholder="Search name, college, email, skill…" T={T}/>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            style={{padding:'8px 10px',borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,color:T.text,fontSize:12,fontFamily:font,outline:'none',cursor:'pointer'}}>
            <option value="recent">Newest first</option>
            <option value="completeness">Profile % ↓</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
          {[['all',`All ${counts.all}`],['active',`Active ${counts.active}`],['incomplete',`Incomplete ${counts.incomplete}`],['no_skills',`No skills ${counts.no_skills}`]].map(([v,l])=>(
            <Pill key={v} active={filter===v} onClick={()=>setFilter(v)} T={T}>{l}</Pill>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'2fr 1.5fr 1fr 70px 64px 88px',gap:10,padding:'5px 14px',marginBottom:4}}>
          {['Student','College','Skills','Profile','Joined','Status'].map(h=>(
            <span key={h} style={{fontSize:9,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',fontWeight:500}}>{h}</span>
          ))}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {filtered.map(s=>{
            const isSel=selected?.id===s.id;
            const status=studentStatus(s);
            return (
              <div key={s.id} onClick={()=>setSelected(isSel?null:s)}
                style={{display:'grid',gridTemplateColumns:'2fr 1.5fr 1fr 70px 64px 88px',gap:10,alignItems:'center',padding:'10px 14px',background:isSel?T.accentSoft:T.surface,border:`1px solid ${isSel?T.accent+'60':T.border}`,borderRadius:10,cursor:'pointer',transition:'all 0.15s'}}
                onMouseEnter={e=>{if(!isSel)e.currentTarget.style.borderColor=T.borderHigh;}}
                onMouseLeave={e=>{if(!isSel)e.currentTarget.style.borderColor=T.border;}}>
                <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
                  <Avatar name={s.full_name} size={28} T={T}/>
                  <div style={{minWidth:0}}>
                    <p style={{fontSize:12,fontWeight:500,color:T.text,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.full_name}</p>
                    <p style={{fontSize:10,color:T.muted,margin:0}}>Year {s.year||'?'}</p>
                  </div>
                </div>
                <p style={{fontSize:11,color:T.muted,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.college||'—'}</p>
                <div style={{display:'flex',gap:3,overflow:'hidden'}}>
                  {(s.skills||[]).slice(0,2).map((sk,i)=>(
                    <span key={i} style={{fontSize:9,padding:'2px 5px',borderRadius:4,background:T.blueSoft,border:`1px solid ${T.blueBorder}`,color:T.blue,whiteSpace:'nowrap'}}>{sk.name}</span>
                  ))}
                  {(s.skills||[]).length===0 && <span style={{fontSize:9,color:T.muted}}>none</span>}
                </div>
                <div>
                  <div style={{height:3,background:T.surfaceAlt,borderRadius:2,overflow:'hidden',marginBottom:2}}>
                    <div style={{height:'100%',width:`${s.profile_completeness||0}%`,background:sc(s.profile_completeness||0,T),borderRadius:2}}/>
                  </div>
                  <span style={{fontSize:9,color:T.muted}}>{s.profile_completeness||0}%</span>
                </div>
                <span style={{fontSize:10,color:T.muted}}>{fmt(s.created_at)}</span>
                <Badge color={status==='active'?T.blue:T.amber} bg={status==='active'?T.blueSoft:T.amberSoft} border={status==='active'?T.blueBorder:T.amberBorder}>
                  {status==='active'?'Active':'Incomplete'}
                </Badge>
              </div>
            );
          })}
          {filtered.length===0 && <div style={{textAlign:'center',padding:'40px',color:T.muted,fontSize:13,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10}}>No students match your filter.</div>}
        </div>
      </div>
      {selected && <StudentDetail student={selected} onClose={()=>setSelected(null)} onUpdate={handleUpdate} T={T}/>}
    </div>
  );
}

// ─── RECRUITERS TAB ───────────────────────────────────────────────────────────
function RecruitersTab({recruiters:init,T,showToast}) {
  const [recruiters,setRecruiters]=useState(init);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all');
  const [selected,setSelected]=useState(null);

  useEffect(()=>setRecruiters(init),[init]);

  const filtered=useMemo(()=>{
    let arr=[...recruiters];
    if(search) arr=arr.filter(r=>(r.company_name||r.company||'').toLowerCase().includes(search.toLowerCase())||(r.contact_name||'').toLowerCase().includes(search.toLowerCase())||(r.email||'').toLowerCase().includes(search.toLowerCase()));
    if(filter==='approved')   arr=arr.filter(r=>r.is_approved);
    if(filter==='pending')    arr=arr.filter(r=>!r.is_approved);
    return arr.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  },[recruiters,search,filter]);

  const handleUpdate=(updated)=>{
    setRecruiters(p=>p.map(x=>x.id===updated.id?updated:x));
    setSelected(updated);
    showToast('Recruiter updated');
  };

  return (
    <div style={{display:'grid',gridTemplateColumns:selected?'1fr 320px':'1fr',gap:16}}>
      <div>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <SBar value={search} onChange={setSearch} placeholder="Search company, contact, email…" T={T}/>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:16}}>
          {[['all','All'],['approved','Approved ✓'],['pending','Pending approval']].map(([v,l])=>(
            <Pill key={v} active={filter===v} onClick={()=>setFilter(v)} T={T}>{l}</Pill>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:selected?'1fr':'repeat(2,1fr)',gap:10}}>
          {filtered.map(r=>{
            const isSel=selected?.id===r.id;
            const logo=r.logo_emoji||r.logo||'🚀';
            const name=r.company_name||r.company||'—';
            const desc=r.what_you_build||r.about||'—';
            return (
              <div key={r.id} onClick={()=>setSelected(isSel?null:r)}
                style={{background:isSel?T.accentSoft:T.surface,border:`1px solid ${isSel?T.accent+'60':T.border}`,borderRadius:12,padding:16,cursor:'pointer',transition:'all 0.15s'}}
                onMouseEnter={e=>{if(!isSel)e.currentTarget.style.borderColor=T.borderHigh;}}
                onMouseLeave={e=>{if(!isSel)e.currentTarget.style.borderColor=T.border;}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:12}}>
                  <div style={{width:38,height:38,borderRadius:8,background:T.surfaceAlt,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{logo}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                      <p style={{fontSize:13,fontWeight:600,color:T.text,margin:0}}>{name}</p>
                      {r.is_approved && <span style={{fontSize:9,color:T.blue}}>✓</span>}
                    </div>
                    <p style={{fontSize:10,color:T.muted,margin:'2px 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{desc}</p>
                  </div>
                  <Badge color={r.is_approved?T.green:T.amber} bg={r.is_approved?T.greenSoft:T.amberSoft} border={r.is_approved?T.greenBorder:T.amberBorder}>
                    {r.is_approved?'Approved':'Pending'}
                  </Badge>
                </div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
                  {r.stage && <Badge color={T.muted} border={T.border}>{r.stage}</Badge>}
                  {r.team_size && <Badge color={T.muted} border={T.border}>{r.team_size}</Badge>}
                  {(r.role_categories||r.hiring_for||[]).slice(0,2).map((c,i)=><Badge key={i} color={T.purple} bg={T.purpleSoft}>{c}</Badge>)}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:10,color:T.muted}}>{fmt(r.created_at)}</span>
                  {(r.contact_email||r.email) && <span style={{fontSize:10,color:T.muted}}>{r.contact_email||r.email}</span>}
                </div>
              </div>
            );
          })}
          {filtered.length===0 && <div style={{gridColumn:'1/-1',textAlign:'center',padding:'40px',color:T.muted,fontSize:13,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10}}>No recruiters match.</div>}
        </div>
      </div>
      {selected && <RecruiterDetail recruiter={selected} onClose={()=>setSelected(null)} onUpdate={handleUpdate} T={T}/>}
    </div>
  );
}

// ─── COPY LINK ────────────────────────────────────────────────────────────────
function CopyLink({url,T}) {
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  return (
    <div style={{display:'flex',gap:6,alignItems:'center',padding:'7px 10px',borderRadius:8,background:T.surfaceAlt,border:`1px solid ${T.border}`}}>
      <Link2 size={11} style={{color:T.muted,flexShrink:0}}/>
      <span style={{fontSize:10,color:T.muted,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{url}</span>
      <button onClick={copy} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:6,border:`1px solid ${T.border}`,background:copied?T.greenSoft:T.surface,color:copied?T.green:T.sub,fontSize:10,cursor:'pointer',fontFamily:font,flexShrink:0}}>
        {copied?<><Check size={9}/>Copied!</>:<><Copy size={9}/>Copy</>}
      </button>
    </div>
  );
}

// ─── JOB CANDIDATES VIEW ──────────────────────────────────────────────────────
function JobCandidatesView({job, onBack, T, showToast}) {
  const [apps, setApps]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [statusFilter, setSFilter]= useState('all');

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try {
        // Fetch applications for this job
        const {data:appData, error:appErr} = await supabase
          .from('applications')
          .select('*')
          .eq('job_id', job.id)
          .order('match_score', {ascending:false});
        if(appErr) throw appErr;

        // Fetch student profiles for all applicants
        const studentIds = (appData||[]).map(a=>a.student_id).filter(Boolean);
        let studentsMap = {};
        if(studentIds.length > 0) {
          const {data:sData} = await supabase
            .from('students')
            .select('*')
            .in('id', studentIds);
          (sData||[]).forEach(s=>{ studentsMap[s.id]=s; });
        }

        setApps((appData||[]).map(a=>({...a, student: studentsMap[a.student_id]||null})));
      } catch(e){ showToast('Failed to load applicants','error'); }
      finally{ setLoading(false); }
    })();
  },[job.id]);

  const updateStatus = async(appId, status) => {
    try {
      const {error} = await supabase.from('applications').update({status}).eq('id',appId);
      if(error) throw error;
      setApps(p=>p.map(a=>a.id===appId?{...a,status}:a));
      if(selected?.id===appId) setSelected(p=>({...p,status}));
      const labels = {shortlisted:'✓ Shortlisted',interview:'Interview scheduled',rejected:'Passed'};
      showToast(labels[status]||'Updated');
    } catch(e){ showToast('Failed','error'); }
  };

  const filtered = useMemo(()=>{
    if(statusFilter==='all') return apps;
    return apps.filter(a=>(a.status||'pending')===statusFilter);
  },[apps,statusFilter]);

  const counts = {
    all: apps.length,
    pending: apps.filter(a=>!a.status||a.status==='pending').length,
    shortlisted: apps.filter(a=>a.status==='shortlisted').length,
    interview: apps.filter(a=>a.status==='interview').length,
    rejected: apps.filter(a=>a.status==='rejected').length,
  };

  const statusStyle = (status) => ({
    shortlisted: {color:T.green,  bg:T.greenSoft,  border:T.greenBorder},
    interview:   {color:T.blue,   bg:T.blueSoft,   border:T.blueBorder},
    rejected:    {color:T.red,    bg:T.redSoft,    border:T.redBorder},
    pending:     {color:T.muted,  bg:'transparent', border:T.border},
  })[status||'pending'] || {color:T.muted,bg:'transparent',border:T.border};

  return (
    <div>
      {/* Sub-header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onBack} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 10px',borderRadius:6,border:`1px solid ${T.border}`,background:'transparent',color:T.muted,fontSize:12,cursor:'pointer',fontFamily:font}}
            onMouseEnter={e=>{e.currentTarget.style.color=T.text;e.currentTarget.style.borderColor=T.borderHigh;}}
            onMouseLeave={e=>{e.currentTarget.style.color=T.muted;e.currentTarget.style.borderColor=T.border;}}>
            <ArrowLeft size={12}/> All jobs
          </button>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:22}}>{job.logo||'🚀'}</span>
            <div>
              <p style={{fontSize:15,fontWeight:600,color:T.text,margin:0}}>{job.role}</p>
              <p style={{fontSize:11,color:T.muted,margin:0}}>{job.company} · {job.location} · {job.stipend}</p>
            </div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Badge color={job.is_active?T.green:T.muted} bg={job.is_active?T.greenSoft:'transparent'} border={job.is_active?T.greenBorder:T.border}>
            {job.is_active?'Active':'Paused'}
          </Badge>
          <span style={{fontSize:12,color:T.muted}}>{loading?'…':apps.length} applicant{apps.length!==1?'s':''}</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
        <StatCard label="Total applied"  value={apps.length}           icon={Users}        color={T.blue}   T={T}/>
        <StatCard label="Shortlisted"    value={counts.shortlisted}    icon={CheckCircle2} color={T.green}  T={T}/>
        <StatCard label="Interview"      value={counts.interview}      icon={Calendar}     color={T.blue}   T={T}/>
        <StatCard label="Avg match score"
          value={apps.length>0?`${Math.round(apps.reduce((s,a)=>s+(a.match_score||0),0)/apps.length)}%`:'—'}
          icon={Target} color={T.accent} T={T}/>
      </div>

      {/* Filter pills */}
      <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
        {[['all',`All ${counts.all}`],['pending',`New ${counts.pending}`],['shortlisted',`Shortlisted ${counts.shortlisted}`],['interview',`Interview ${counts.interview}`],['rejected',`Passed ${counts.rejected}`]].map(([v,l])=>(
          <Pill key={v} active={statusFilter===v} onClick={()=>setSFilter(v)} T={T}>{l}</Pill>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'48px',color:T.muted,fontSize:13,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12}}>Loading applicants…</div>
      ) : filtered.length===0 ? (
        <div style={{textAlign:'center',padding:'52px 20px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:12}}>
          <div style={{fontSize:36,marginBottom:10}}>🎯</div>
          <p style={{fontFamily:serif,fontSize:18,color:T.text,marginBottom:6}}>{apps.length===0?'No applicants yet.':'No applicants in this status.'}</p>
          <p style={{fontSize:13,color:T.muted}}>{apps.length===0?'Share the job link to start getting applications.':'Try a different filter.'}</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:selected?'1fr 340px':'1fr',gap:16}}>
          {/* List */}
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {/* Column headers */}
            <div style={{display:'grid',gridTemplateColumns:'24px 2fr 1.5fr 1fr 70px 100px',gap:10,padding:'4px 14px',marginBottom:2}}>
              {['#','Applicant','College','Skills','Score','Status'].map(h=>(
                <span key={h} style={{fontSize:9,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',fontWeight:500}}>{h}</span>
              ))}
            </div>

            {filtered.map((app, idx)=>{
              const s = app.student;
              const isSel = selected?.id===app.id;
              const score = app.match_score||0;
              const scoreC = score>=75?T.green:score>=50?T.amber:T.red;
              const ss = statusStyle(app.status);
              return (
                <div key={app.id} onClick={()=>setSelected(isSel?null:app)}
                  style={{display:'grid',gridTemplateColumns:'24px 2fr 1.5fr 1fr 70px 100px',gap:10,alignItems:'center',padding:'10px 14px',background:isSel?T.accentSoft:T.surface,border:`1px solid ${isSel?T.accent+'60':T.border}`,borderRadius:10,cursor:'pointer',transition:'all 0.15s'}}
                  onMouseEnter={e=>{if(!isSel)e.currentTarget.style.borderColor=T.borderHigh;}}
                  onMouseLeave={e=>{if(!isSel)e.currentTarget.style.borderColor=T.border;}}>
                  <span style={{fontSize:10,color:T.muted,fontWeight:500}}>#{idx+1}</span>
                  <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
                    <Avatar name={s?.full_name||'?'} size={28} T={T}/>
                    <div style={{minWidth:0}}>
                      <p style={{fontSize:12,fontWeight:500,color:T.text,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s?.full_name||'Unknown'}</p>
                      <p style={{fontSize:10,color:T.muted,margin:0}}>Year {s?.year||'?'} · {s?.availability||'—'}</p>
                    </div>
                  </div>
                  <p style={{fontSize:11,color:T.muted,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s?.college||'—'}</p>
                  <div style={{display:'flex',gap:3,overflow:'hidden'}}>
                    {(s?.skills||[]).slice(0,2).map((sk,i)=>(
                      <span key={i} style={{fontSize:9,padding:'2px 5px',borderRadius:4,background:T.blueSoft,border:`1px solid ${T.blueBorder}`,color:T.blue,whiteSpace:'nowrap'}}>{sk.name}</span>
                    ))}
                    {(s?.skills||[]).length===0 && <span style={{fontSize:9,color:T.muted}}>—</span>}
                  </div>
                  <span style={{fontFamily:serif,fontSize:15,color:scoreC,fontWeight:400}}>{score}%</span>
                  <Badge color={ss.color} bg={ss.bg} border={ss.border}>
                    {app.status||'New'}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Candidate detail panel */}
          {selected && (
            <CandidatePanel app={selected} onClose={()=>setSelected(null)} onStatusChange={updateStatus} T={T}/>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CANDIDATE PANEL (inside job view) ───────────────────────────────────────
function CandidatePanel({app, onClose, onStatusChange, T}) {
  const s = app.student;
  const score = app.match_score||0;
  const breakdown = app.match_breakdown||{};
  const scoreC = score>=75?T.green:score>=50?T.amber:T.red;
  const scoreBg_ = score>=75?T.greenSoft:score>=50?T.amberSoft:T.redSoft;
  const scoreBd = score>=75?T.greenBorder:score>=50?T.amberBorder:T.redBorder;

  return (
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:'hidden',position:'sticky',top:76}}>
      <div style={{padding:'12px 16px',borderBottom:`1px solid ${T.border}`,background:T.surfaceAlt,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <SL T={T}>Candidate profile</SL>
        <button onClick={onClose} style={{background:'transparent',border:'none',cursor:'pointer',color:T.muted,display:'flex'}}><X size={14}/></button>
      </div>
      <div style={{padding:18,overflowY:'auto',maxHeight:'calc(100vh - 160px)'}}>
        {/* Identity */}
        <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:16}}>
          <Avatar name={s?.full_name||'?'} size={44} T={T}/>
          <div style={{flex:1}}>
            <p style={{fontSize:15,fontWeight:600,color:T.text,margin:0}}>{s?.full_name||'Unknown'}</p>
            <p style={{fontSize:11,color:T.muted,margin:'2px 0 6px'}}>{s?.college||'—'} · Year {s?.year||'?'}</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
              {s?.availability && <Badge color={T.muted} border={T.border}>{s.availability}</Badge>}
              {s?.work_preference && <Badge color={T.muted} border={T.border}>{s.work_preference}</Badge>}
            </div>
          </div>
          <div style={{padding:'6px 12px',borderRadius:10,background:scoreBg_,border:`1.5px solid ${scoreBd}`,textAlign:'center',flexShrink:0}}>
            <p style={{fontFamily:serif,fontSize:22,color:scoreC,margin:0,lineHeight:1}}>{score}%</p>
            <p style={{fontSize:9,color:T.muted,margin:'2px 0 0'}}>match</p>
          </div>
        </div>

        {/* Score breakdown */}
        {Object.keys(breakdown).length>0 && (
          <div style={{background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',marginBottom:14}}>
            <SL T={T}>Score breakdown</SL>
            {Object.entries(breakdown).map(([k,v])=>(
              <div key={k} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                <span style={{fontSize:10,color:T.sub,width:120,flexShrink:0,textTransform:'capitalize'}}>{k.replace(/([A-Z])/g,' $1').trim()}</span>
                <div style={{flex:1,height:3,background:T.border,borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${Math.min(v*2.5,100)}%`,background:T.green,borderRadius:2}}/>
                </div>
                <span style={{fontSize:10,fontWeight:500,color:T.text,width:28,textAlign:'right'}}>{v}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {(s?.skills||[]).length>0 && (
          <div style={{marginBottom:14}}>
            <SL T={T}>Skills ({(s.skills||[]).length})</SL>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {(s.skills||[]).map((sk,i)=>(
                <span key={i} style={{fontSize:10,padding:'3px 8px',borderRadius:6,background:T.blueSoft,border:`1px solid ${T.blueBorder}`,color:T.blue}}>
                  {sk.name} <span style={{opacity:0.6}}>L{sk.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {(s?.projects||[]).length>0 && (
          <div style={{marginBottom:14}}>
            <SL T={T}>Projects ({(s.projects||[]).length})</SL>
            {(s.projects||[]).slice(0,3).map((p,i)=>(
              <div key={i} style={{padding:'8px 10px',borderRadius:8,border:`1px solid ${T.border}`,background:T.surfaceAlt,marginBottom:6}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                  <p style={{fontSize:11,fontWeight:500,color:T.text,margin:0}}>{p.name||p.title}</p>
                  {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" style={{color:T.muted,display:'flex'}}><ExternalLink size={11}/></a>}
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
                  {(Array.isArray(p.techStack)?p.techStack:[]).map((t,j)=>(
                    <span key={j} style={{fontSize:9,padding:'1px 5px',borderRadius:4,border:`1px solid ${T.border}`,color:T.muted}}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact links */}
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12,marginBottom:14}}>
          <SL T={T}>Contact</SL>
          {s?.email && <a href={`mailto:${s.email}`} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:T.muted,textDecoration:'none',marginBottom:6}}><Mail size={11}/>{s.email}</a>}
          {s?.phone && <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:T.muted,marginBottom:6}}><Phone size={11}/>{s.phone}</div>}
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {s?.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:T.sub,padding:'4px 9px',borderRadius:20,border:`1px solid ${T.border}`,textDecoration:'none'}}><Github size={11}/> GitHub</a>}
            {s?.linkedin_url  && <a href={s.linkedin_url}  target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:T.sub,padding:'4px 9px',borderRadius:20,border:`1px solid ${T.border}`,textDecoration:'none'}}><ExternalLink size={11}/> LinkedIn</a>}
            {s?.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:T.sub,padding:'4px 9px',borderRadius:20,border:`1px solid ${T.border}`,textDecoration:'none'}}><Globe size={11}/> Portfolio</a>}
            {s?.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:T.accent,padding:'4px 9px',borderRadius:20,border:`1px solid ${T.accent}30`,textDecoration:'none'}}><FileText size={11}/> Resume</a>}
          </div>
        </div>

        {/* Application info */}
        <div style={{padding:'8px 10px',borderRadius:8,background:T.surfaceAlt,border:`1px solid ${T.border}`,marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:10,color:T.muted}}>Applied</span>
            <span style={{fontSize:11,color:T.text}}>{app.applied_at?new Date(app.applied_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'}</span>
          </div>
        </div>

        {/* Status action buttons */}
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12}}>
          <SL T={T}>Update status</SL>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
            {[
              {key:'shortlisted', label:'✓ Shortlist', activeC:T.green,  activeBg:T.greenSoft,  activeBd:T.greenBorder},
              {key:'interview',   label:'📅 Interview', activeC:T.blue,   activeBg:T.blueSoft,   activeBd:T.blueBorder},
              {key:'rejected',    label:'✕ Pass',       activeC:T.red,    activeBg:T.redSoft,    activeBd:T.redBorder},
            ].map(opt=>{
              const isActive = app.status===opt.key;
              return (
                <button key={opt.key} onClick={()=>onStatusChange(app.id,opt.key)}
                  style={{padding:'9px 6px',borderRadius:8,fontSize:11,fontWeight:500,cursor:'pointer',fontFamily:font,transition:'all 0.15s',
                    border:`1px solid ${isActive?opt.activeBd:opt.activeC+'40'}`,
                    background:isActive?opt.activeBg:'transparent',
                    color:isActive?opt.activeC:opt.activeC}}>
                  {opt.label}
                </button>
              );
            })}
          </div>
          {app.status && app.status!=='pending' && (
            <p style={{fontSize:10,color:T.muted,textAlign:'center',marginTop:8}}>
              Status: <strong style={{color:T.text,textTransform:'capitalize'}}>{app.status}</strong>
              {' · '}<button onClick={()=>onStatusChange(app.id,'pending')} style={{background:'none',border:'none',fontSize:10,color:T.muted,cursor:'pointer',textDecoration:'underline',padding:0,fontFamily:font}}>Reset</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── JOBS TAB ─────────────────────────────────────────────────────────────────
function JobsTab({jobs:init,T,showToast}) {
  const [jobs,setJobs]       = useState(init);
  const [showForm,setShowForm] = useState(false);
  const [search,setSearch]   = useState('');
  const [viewingJob,setViewingJob] = useState(null); // null = list, job = candidates view

  useEffect(()=>setJobs(init),[init]);

  const filtered=useMemo(()=>{
    if(!search) return jobs;
    return jobs.filter(j=>j.role?.toLowerCase().includes(search.toLowerCase())||j.company?.toLowerCase().includes(search.toLowerCase()));
  },[jobs,search]);

  // Early return AFTER all hooks — fixes React error #300
  if(viewingJob) {
    return <JobCandidatesView job={viewingJob} onBack={()=>setViewingJob(null)} T={T} showToast={showToast}/>;
  }

  const toggleJob=async(job)=>{
    try {
      const {data,error}=await supabase.from('jobs').update({is_active:!job.is_active}).eq('id',job.id).select().single();
      if(error) throw error;
      setJobs(p=>p.map(x=>x.id===job.id?data:x));
      showToast(data.is_active?'Job activated':'Job paused');
    } catch(e){ showToast('Failed','error'); }
  };

  const deleteJob=async(job)=>{
    if(!window.confirm(`Delete "${job.role}"?`)) return;
    try {
      await supabase.from('applications').delete().eq('job_id',job.id);
      await supabase.from('jobs').delete().eq('id',job.id);
      setJobs(p=>p.filter(x=>x.id!==job.id));
      showToast('Job deleted');
    } catch(e){ showToast('Failed','error'); }
  };

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        <StatCard label="Total jobs"      value={jobs.length}                                  icon={Briefcase} color={T.accent} T={T}/>
        <StatCard label="Active"          value={jobs.filter(j=>j.is_active).length}           icon={Activity}  color={T.green}  T={T}/>
        <StatCard label="Total applicants"value={jobs.reduce((s,j)=>s+(j.current_applicants||0),0)} icon={Users} color={T.blue} T={T}/>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center'}}>
        <SBar value={search} onChange={setSearch} placeholder="Search jobs…" T={T}/>
        <button onClick={()=>setShowForm(true)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:8,border:'none',background:T.accent,color:'#fff',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:font,whiteSpace:'nowrap'}}>
          <Plus size={13}/> New internship
        </button>
      </div>

      {showForm && <PostJobForm onSuccess={j=>{setJobs(p=>[j,...p]);setShowForm(false);showToast('Job posted!');}} onCancel={()=>setShowForm(false)} T={T}/>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
        {filtered.map(j=>{
          const fill=j.max_applicants>0?(j.current_applicants||0)/j.max_applicants:0;
          const fc=fill>0.8?T.red:fill>0.5?T.amber:T.green;
          const url=`${window.location.origin}/apply/${j.share_slug}`;
          return (
            <div key={j.id} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
                <span style={{fontSize:24}}>{j.logo||'🚀'}</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:13,fontWeight:600,color:T.text,margin:0}}>{j.role}</p>
                  <p style={{fontSize:10,color:T.muted,margin:'2px 0'}}>{j.company} · {j.stipend}</p>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                    <Badge color={T.muted} border={T.border}>{j.location}</Badge>
                    {j.duration && <Badge color={T.muted} border={T.border}>{j.duration}</Badge>}
                    <Badge color={j.visibility==='public'?T.green:T.blue} bg={j.visibility==='public'?T.greenSoft:T.blueSoft} border={j.visibility==='public'?T.greenBorder:T.blueBorder}>
                      {j.visibility==='public'?'🌐 Public':'🔗 Private'}
                    </Badge>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                  <Badge color={j.is_active?T.green:T.muted} bg={j.is_active?T.greenSoft:'transparent'} border={j.is_active?T.greenBorder:T.border}>
                    {j.is_active?'Active':'Paused'}
                  </Badge>
                  <button onClick={e=>{e.stopPropagation();toggleJob(j);}} style={{background:'transparent',border:`1px solid ${T.border}`,borderRadius:6,padding:'4px 6px',cursor:'pointer',color:T.muted,display:'flex'}} title={j.is_active?'Pause':'Activate'}>
                    {j.is_active?<EyeOff size={12}/>:<Eye size={12}/>}
                  </button>
                  <button onClick={e=>{e.stopPropagation();deleteJob(j);}} style={{background:'transparent',border:`1px solid ${T.border}`,borderRadius:6,padding:'4px 6px',cursor:'pointer',color:T.muted,display:'flex'}} title="Delete"
                    onMouseEnter={e=>e.currentTarget.style.color=T.red} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
                    <Trash2 size={12}/>
                  </button>
                </div>
              </div>

              {/* Applicant fill bar */}
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontSize:10,color:T.muted}}>Applicants</span>
                <span style={{fontSize:10,fontWeight:500,color:fc}}>{j.current_applicants||0}/{j.max_applicants||50}</span>
              </div>
              <div style={{height:4,background:T.surfaceAlt,borderRadius:2,overflow:'hidden',marginBottom:10}}>
                <div style={{height:'100%',width:`${Math.min(fill*100,100)}%`,background:fc,borderRadius:2}}/>
              </div>

              {/* View candidates button */}
              <button onClick={()=>setViewingJob(j)}
                style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px',borderRadius:8,border:`1px solid ${T.border}`,background:T.surfaceAlt,color:T.sub,fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:font,marginBottom:8,transition:'all 0.15s'}}
                onMouseEnter={e=>{e.currentTarget.style.background=T.accent;e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor=T.accent;}}
                onMouseLeave={e=>{e.currentTarget.style.background=T.surfaceAlt;e.currentTarget.style.color=T.sub;e.currentTarget.style.borderColor=T.border;}}>
                <Users size={12}/> View {j.current_applicants||0} candidates <ChevronRight size={11}/>
              </button>

              {j.share_slug && <CopyLink url={url} T={T}/>}
            </div>
          );
        })}
        {filtered.length===0 && !showForm && (
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:'48px',color:T.muted,fontSize:13,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12}}>
            <div style={{fontSize:36,marginBottom:10}}>📋</div>
            <p style={{fontFamily:serif,fontSize:18,color:T.text,marginBottom:6}}>No jobs yet.</p>
            <p style={{marginBottom:16}}>Post your first internship to get started.</p>
            <button onClick={()=>setShowForm(true)} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:8,border:'none',background:T.accent,color:'#fff',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:font}}>
              <Plus size={13}/> Post first internship
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── POST JOB FORM ────────────────────────────────────────────────────────────
const LOGO_EMOJIS=['🚀','⚡','🎯','💡','🔥','🌊','🛠️','📊','🎨','🌱','⭐','🦾'];

function PostJobForm({onSuccess,onCancel,T}) {
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [skillInput,setSkillInput]=useState('');
  const [niceInput,setNiceInput]=useState('');
  const [form,setForm]=useState({
    logo:'🚀',company:'',role:'',description:'',
    stipend:'',duration:'',location:'',
    type:'Paid Internship',visibility:'private',
    required_skills:[],nice_to_have:[],max_applicants:50,
  });

  const set=k=>v=>setForm(f=>({...f,[k]:v}));
  const addSkill=()=>{const n=skillInput.trim();if(!n||form.required_skills.find(s=>s.name.toLowerCase()===n.toLowerCase()))return;setForm(f=>({...f,required_skills:[...f.required_skills,{name:n,weight:0.25,level:3}]}));setSkillInput('');};
  const addNice=()=>{const n=niceInput.trim();if(!n||form.nice_to_have.includes(n))return;setForm(f=>({...f,nice_to_have:[...f.nice_to_have,n]}));setNiceInput('');};

  const inp={width:'100%',padding:'9px 12px',borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,color:T.text,fontSize:13,fontFamily:font,outline:'none',boxSizing:'border-box'};

  const submit=async()=>{
    if(!form.company.trim()||!form.role.trim()||!form.stipend.trim()||!form.location.trim()){setError('Fill in company, role, stipend and location.');return;}
    if(form.required_skills.length===0){setError('Add at least one required skill.');return;}
    setSaving(true);setError('');
    try {
      const total=form.required_skills.reduce((s,sk)=>s+sk.weight,0);
      const normSkills=form.required_skills.map(sk=>({...sk,weight:parseFloat((sk.weight/total).toFixed(3))}));
      const slug=`${form.company.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${form.role.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${Date.now()}`;
      const {data,error:err}=await supabase.from('jobs').insert([{
        recruiter_id:ADMIN_RECRUITER_ID,company:form.company.trim(),logo:form.logo,
        role:form.role.trim(),description:form.description.trim(),
        stipend:form.stipend.trim(),duration:form.duration.trim(),location:form.location.trim(),
        type:form.type,visibility:form.visibility,share_slug:slug,
        required_skills:normSkills,nice_to_have:form.nice_to_have,
        max_applicants:form.max_applicants,current_applicants:0,is_active:true,
      }]).select().single();
      if(err) throw err;
      onSuccess(data);
    } catch(e){setError('Failed: '+e.message);}
    finally{setSaving(false);}
  };

  return (
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'12px 18px',borderBottom:`1px solid ${T.border}`,background:T.surfaceAlt,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <p style={{fontSize:10,color:T.accent,letterSpacing:'0.1em',textTransform:'uppercase',margin:0,fontWeight:500}}>New internship</p>
          <p style={{fontSize:13,fontWeight:600,color:T.text,margin:'2px 0 0'}}>Post & get shareable link</p>
        </div>
        <button onClick={onCancel} style={{background:'transparent',border:'none',cursor:'pointer',color:T.muted}}><X size={16}/></button>
      </div>
      <div style={{padding:20,display:'flex',flexDirection:'column',gap:14}}>
        <div>
          <p style={{fontSize:10,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:6}}>Logo</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{LOGO_EMOJIS.map(e=>(<button key={e} onClick={()=>set('logo')(e)} style={{width:34,height:34,borderRadius:6,fontSize:17,border:`1.5px solid ${form.logo===e?T.accent:T.border}`,background:form.logo===e?T.accentSoft:T.surfaceAlt,cursor:'pointer'}}>{e}</button>))}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div><p style={{fontSize:10,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Company *</p><input style={inp} value={form.company} onChange={e=>set('company')(e.target.value)} placeholder="Company name" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          <div><p style={{fontSize:10,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Role *</p><input style={inp} value={form.role} onChange={e=>set('role')(e.target.value)} placeholder="e.g. Backend Intern" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
          <div><p style={{fontSize:10,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Stipend *</p><input style={inp} value={form.stipend} onChange={e=>set('stipend')(e.target.value)} placeholder="₹15,000/month" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          <div><p style={{fontSize:10,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Duration</p><input style={inp} value={form.duration} onChange={e=>set('duration')(e.target.value)} placeholder="3 months" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          <div><p style={{fontSize:10,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Location *</p><input style={inp} value={form.location} onChange={e=>set('location')(e.target.value)} placeholder="Remote / Jaipur" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/></div>
        </div>
        <div><p style={{fontSize:10,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Description</p><textarea style={{...inp,resize:'none'}} rows={3} value={form.description} onChange={e=>set('description')(e.target.value)} placeholder="What will the intern work on?" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/></div>
        <div>
          <p style={{fontSize:10,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Required skills *</p>
          <div style={{display:'flex',gap:8,marginBottom:8}}>
            <input style={{...inp,flex:1}} value={skillInput} onChange={e=>setSkillInput(e.target.value)} placeholder="Type skill + Enter" list="pjf-skills" onKeyDown={e=>e.key==='Enter'&&addSkill()} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
            <datalist id="pjf-skills">{SKILL_OPTIONS.map(s=><option key={s} value={s}/>)}</datalist>
            <button onClick={addSkill} style={{padding:'9px 14px',borderRadius:8,border:'none',background:T.accent,color:'#fff',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:font,whiteSpace:'nowrap'}}>Add</button>
          </div>
          {form.required_skills.map(skill=>(
            <div key={skill.name} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:7,border:`1px solid ${T.border}`,background:T.surfaceAlt,marginBottom:5}}>
              <span style={{fontSize:12,color:T.text,flex:1}}>{skill.name}</span>
              <span style={{fontSize:10,color:T.muted}}>L</span>
              {[1,2,3,4,5].map(lv=>(
                <button key={lv} onClick={()=>setForm(f=>({...f,required_skills:f.required_skills.map(s=>s.name===skill.name?{...s,level:lv}:s)}))}
                  style={{width:22,height:22,borderRadius:4,fontSize:10,fontWeight:500,cursor:'pointer',border:'none',background:skill.level>=lv?T.accent:T.surfaceAlt,color:skill.level>=lv?'#fff':T.muted,outline:skill.level>=lv?'none':`1px solid ${T.border}`}}>{lv}</button>
              ))}
              <button onClick={()=>setForm(f=>({...f,required_skills:f.required_skills.filter(s=>s.name!==skill.name)}))} style={{background:'transparent',border:'none',cursor:'pointer',color:T.muted,display:'flex'}}><X size={13}/></button>
            </div>
          ))}
        </div>
        <div>
          <p style={{fontSize:10,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Nice to have</p>
          <div style={{display:'flex',gap:8,marginBottom:6}}>
            <input style={{...inp,flex:1}} value={niceInput} onChange={e=>setNiceInput(e.target.value)} placeholder="e.g. Docker" list="pjf-skills" onKeyDown={e=>e.key==='Enter'&&addNice()} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
            <button onClick={addNice} style={{padding:'9px 14px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.sub,fontSize:12,cursor:'pointer',fontFamily:font}}>Add</button>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {form.nice_to_have.map(s=>(
              <span key={s} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,padding:'3px 8px',borderRadius:20,border:`1px solid ${T.border}`,color:T.sub}}>
                {s}<button onClick={()=>setForm(f=>({...f,nice_to_have:f.nice_to_have.filter(x=>x!==s)}))} style={{background:'transparent',border:'none',cursor:'pointer',color:T.muted,display:'flex',padding:0}}><X size={10}/></button>
              </span>
            ))}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <p style={{fontSize:10,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Visibility</p>
            <div style={{display:'flex',gap:6}}>
              {['public','private'].map(v=>(
                <button key={v} onClick={()=>set('visibility')(v)} style={{flex:1,padding:'8px',borderRadius:8,fontSize:12,fontFamily:font,cursor:'pointer',background:form.visibility===v?T.accentSoft:T.surfaceAlt,border:`1px solid ${form.visibility===v?T.accent:T.border}`,color:form.visibility===v?T.accent:T.sub,fontWeight:form.visibility===v?500:400}}>
                  {v==='public'?'🌐 Public':'🔗 Private'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p style={{fontSize:10,color:T.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Max applicants</p>
            <div style={{display:'flex',gap:5}}>
              {[10,25,50,100].map(n=>(
                <button key={n} onClick={()=>set('max_applicants')(n)} style={{flex:1,padding:'8px',borderRadius:8,fontSize:11,fontFamily:font,cursor:'pointer',background:form.max_applicants===n?T.accentSoft:T.surfaceAlt,border:`1px solid ${form.max_applicants===n?T.accent:T.border}`,color:form.max_applicants===n?T.accent:T.muted,fontWeight:form.max_applicants===n?500:400}}>{n}</button>
              ))}
            </div>
          </div>
        </div>
        {error && <div style={{padding:'9px 12px',borderRadius:8,background:T.redSoft,border:`1px solid ${T.redBorder}`}}><p style={{fontSize:12,color:T.red,margin:0}}>{error}</p></div>}
        <div style={{display:'flex',gap:8}}>
          <button onClick={onCancel} style={{flex:1,padding:11,borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.sub,fontSize:13,cursor:'pointer',fontFamily:font}}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{flex:2,padding:11,borderRadius:8,border:'none',background:saving?T.muted:T.accent,color:'#fff',fontSize:13,fontWeight:500,cursor:saving?'default':'pointer',fontFamily:font}}>{saving?'Posting…':'Post & get link →'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── WAITLIST TAB ─────────────────────────────────────────────────────────────
function WaitlistTab({T,showToast}) {
  const [list,setList]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    supabase.from('recruiter_waitlist').select('*').order('submitted_at',{ascending:false})
      .then(({data})=>{ setList(data||[]); setLoading(false); });
  },[]);

  const update=async(id,field,value)=>{
    try {
      const {error}=await supabase.from('recruiter_waitlist').update({[field]:value}).eq('id',id);
      if(error) throw error;
      setList(p=>p.map(x=>x.id===id?{...x,[field]:value}:x));
      showToast('Updated');
    } catch(e){ showToast('Failed','error'); }
  };

  if(loading) return <div style={{textAlign:'center',padding:'48px',color:T.muted,fontSize:13}}>Loading waitlist…</div>;

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        <StatCard label="Total waitlist" value={list.length} icon={Clock} color={T.accent} T={T}/>
        <StatCard label="Approved" value={list.filter(x=>x.approved).length} icon={CheckCircle2} color={T.green} T={T}/>
        <StatCard label="Contacted" value={list.filter(x=>x.contacted).length} icon={Mail} color={T.blue} T={T}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {list.map(item=>(
          <div key={item.id} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <p style={{fontSize:13,fontWeight:600,color:T.text,margin:0}}>{item.name}</p>
                  <Badge color={T.muted} border={T.border}>{item.company}</Badge>
                  {item.team_size && <Badge color={T.muted} border={T.border}>{item.team_size}</Badge>}
                </div>
                <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:6}}>
                  <a href={`mailto:${item.email}`} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:T.muted,textDecoration:'none'}}><Mail size={11}/>{item.email}</a>
                  {item.website && <a href={item.website.startsWith('http')?item.website:`https://${item.website}`} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:T.accent,textDecoration:'none'}}><Globe size={11}/>{item.website}</a>}
                </div>
                <p style={{fontSize:11,color:T.muted,margin:'0 0 4px'}}>Looking for: <span style={{color:T.text}}>{item.role_looking_for}</span></p>
                {item.notes && <p style={{fontSize:10,color:T.muted,margin:0,fontStyle:'italic'}}>Note: {item.notes}</p>}
                <p style={{fontSize:10,color:T.muted,margin:'4px 0 0'}}>{fmt(item.submitted_at)} · via {item.source||'—'}</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0}}>
                <button onClick={()=>update(item.id,'approved',!item.approved)}
                  style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${item.approved?T.redBorder:T.greenBorder}`,background:item.approved?T.redSoft:T.greenSoft,color:item.approved?T.red:T.green,fontSize:11,fontWeight:500,cursor:'pointer',fontFamily:font,whiteSpace:'nowrap'}}>
                  {item.approved?'Revoke':'✓ Approve'}
                </button>
                <button onClick={()=>update(item.id,'contacted',!item.contacted)}
                  style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${T.border}`,background:item.contacted?T.blueSoft:'transparent',color:item.contacted?T.blue:T.muted,fontSize:11,cursor:'pointer',fontFamily:font,whiteSpace:'nowrap'}}>
                  {item.contacted?'✓ Contacted':'Mark contacted'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {list.length===0 && <div style={{textAlign:'center',padding:'48px',color:T.muted,fontSize:13,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12}}>No waitlist entries yet.</div>}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [unlocked,setUnlocked]  = useState(()=>sessionStorage.getItem('hunt_admin_v2')==='yes');
  const [isDark,setIsDark]      = useState(()=>sessionStorage.getItem('hunt_admin_theme')==='dark');
  const [activeTab,setActiveTab]= useState('overview');
  const [toast,setToast]        = useState(null);

  // ── Real Supabase data ──────────────────────────────────────────────────────
  const [students,setStudents]      = useState([]);
  const [recruiters,setRecruiters]  = useState([]);
  const [jobs,setJobs]              = useState([]);
  const [applications,setApps]      = useState([]);
  const [loading,setLoading]        = useState(true);

  const showToast = useCallback((msg,type='success')=>{
    setToast({msg,type});
    setTimeout(()=>setToast(null),2500);
  },[]);

  const load = useCallback(async()=>{
    if(!unlocked) return;
    setLoading(true);
    try {
      const [s,r,j,a] = await Promise.all([
        supabase.from('students').select('*').order('created_at',{ascending:false}),
        supabase.from('recruiters').select('*').order('created_at',{ascending:false}),
        supabase.from('jobs').select('*').order('created_at',{ascending:false}),
        supabase.from('applications').select('*').order('applied_at',{ascending:false}),
      ]);
      setStudents(s.data||[]);
      setRecruiters(r.data||[]);
      setJobs(j.data||[]);
      setApps(a.data||[]);
    } catch(e){ showToast('Failed to load data','error'); }
    finally{ setLoading(false); }
  },[unlocked,showToast]);

  useEffect(()=>{ load(); },[load]);

  const T = isDark ? THEMES.dark : THEMES.light;
  const toggleTheme=()=>{const n=!isDark;setIsDark(n);sessionStorage.setItem('hunt_admin_theme',n?'dark':'light');};
  const handleUnlock=()=>{sessionStorage.setItem('hunt_admin_v2','yes');setUnlocked(true);};

  if(!unlocked) return <PasswordGate onUnlock={handleUnlock}/>;

  const tabs=[
    {id:'overview', label:'Overview',                       icon:BarChart2 },
    {id:'students', label:`Students (${students.length})`,  icon:Users     },
    {id:'recruiters',label:`Recruiters (${recruiters.length})`,icon:Building2},
    {id:'jobs',     label:`Jobs (${jobs.length})`,          icon:Briefcase },
    {id:'waitlist', label:'Waitlist',                       icon:Clock     },
  ];

  const titles={overview:'Platform overview',students:'Students',recruiters:'Recruiters',jobs:'Job listings',waitlist:'Recruiter waitlist'};
  const subs={overview:'Live data from Supabase.',students:'All students — click a row to view and edit.',recruiters:'All recruiters — approve or update directly.',jobs:'All internship listings — toggle, delete, or post new.',waitlist:'Pre-launch recruiter signups — approve and mark contacted.'};

  return (
    <div style={{minHeight:'100vh',background:T.bg,fontFamily:font,WebkitFontSmoothing:'antialiased',color:T.text,transition:'background 0.2s,color 0.2s'}}>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}

      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 32px',borderBottom:`1px solid ${T.border}`,background:T.navBg,position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:15,fontWeight:500,letterSpacing:'0.12em',color:T.text}}>HUNT</span>
          <span style={{width:1,height:14,background:T.border,display:'inline-block'}}/>
          <span style={{fontSize:10,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:T.accent}}>Admin</span>
        </div>
        <div style={{display:'flex',gap:2}}>
          {tabs.map(tab=>{
            const Icon=tab.icon;const active=activeTab===tab.id;
            return (
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:8,border:'none',background:active?T.accentSoft:'transparent',color:active?T.accent:T.muted,fontSize:12,fontWeight:active?500:400,cursor:'pointer',fontFamily:font,transition:'all 0.15s'}}>
                <Icon size={13}/>{tab.label}
              </button>
            );
          })}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={load} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:20,border:`1px solid ${T.border}`,background:T.surfaceAlt,color:T.muted,fontSize:11,cursor:'pointer',fontFamily:font}} title="Refresh data">
            <RefreshCw size={11}/>{loading?'Loading…':'Refresh'}
          </button>
          <button onClick={toggleTheme} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 11px',borderRadius:20,border:`1px solid ${T.border}`,background:T.surfaceAlt,color:T.muted,fontSize:11,cursor:'pointer',fontFamily:font}}>
            {isDark?<Sun size={12}/>:<Moon size={12}/>}{isDark?'Light':'Dark'}
          </button>
          <div style={{width:28,height:28,borderRadius:'50%',background:T.accentSoft,border:`1px solid ${T.accent}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:T.accent,fontWeight:600}}>A</div>
        </div>
      </nav>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'28px 24px 80px'}}>
        <div style={{marginBottom:22}}>
          <h1 style={{fontFamily:serif,fontSize:26,fontWeight:400,color:T.text,marginBottom:4,letterSpacing:'-0.01em'}}>{titles[activeTab]}</h1>
          <p style={{fontSize:12,color:T.muted,margin:0}}>{subs[activeTab]}</p>
        </div>

        {loading && activeTab==='overview' ? (
          <div style={{textAlign:'center',padding:'60px',color:T.muted,fontSize:13}}>Loading data from Supabase…</div>
        ) : (
          <>
            {activeTab==='overview'   && <OverviewTab students={students} recruiters={recruiters} jobs={jobs} applications={applications} T={T}/>}
            {activeTab==='students'   && <StudentsTab students={students} T={T} showToast={showToast}/>}
            {activeTab==='recruiters' && <RecruitersTab recruiters={recruiters} T={T} showToast={showToast}/>}
            {activeTab==='jobs'       && <JobsTab jobs={jobs} T={T} showToast={showToast}/>}
            {activeTab==='waitlist'   && <WaitlistTab T={T} showToast={showToast}/>}
          </>
        )}
      </div>

      <style>{`* { box-sizing: border-box; } select option { background: ${T.inputBg}; color: ${T.text}; }`}</style>
    </div>
  );
}
