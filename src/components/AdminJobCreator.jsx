// src/components/AdminJobCreator.jsx
// Full replacement — adds candidates view to existing admin page

import React, { useState, useEffect } from 'react';
import {
  Plus, X, Copy, Check, ExternalLink, Eye, EyeOff,
  Trash2, Link2, ArrowLeft, Github, Users, ChevronRight
} from 'lucide-react';
import { supabase } from '../services/supabase';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const ADMIN_RECRUITER_ID = '78b5cea0-ee99-49f8-8cef-d72a5199f5c3';
const ADMIN_PASSWORD     = 'hunt2026';
// ─────────────────────────────────────────────────────────────────────────────

const SKILL_OPTIONS = [
  'JavaScript','Python','Java','TypeScript','C / C++','Golang','Rust','SQL',
  'React','React Native','Next.js','Tailwind CSS','AngularJS','Redux',
  'Flutter','Android Dev','iOS Dev',
  'Node.js','Express.js','Django','Flask','FastAPI','REST API','GraphQL',
  'MySQL','PostgreSQL','MongoDB','Firebase','Redis',
  'Machine Learning','Data Analysis','TensorFlow','PyTorch','Pandas',
  'Scikit-learn','Jupyter Notebook','Data Science','NLP',
  'Docker','Linux','AWS','CI/CD','Git',
  'Figma','Canva','SEO','Ethical Hacking','Embedded Systems',
  'Blockchain','Prompt Engineering','LangChain',
  'Shopify','Amazon Seller','WooCommerce','Product Listing',
  'Email Marketing','Social Media Marketing','Google Ads','Meta Ads',
  'Competitor Research','Content Writing','Google Analytics','Sales Analysis',
  'Excel / Google Sheets','Google Workspace','MS Office',
  'Customer Service','Operations Management','Inventory Management',
];

const LOGO_EMOJIS = ['🚀','⚡','🎯','💡','🔥','🌊','🛠️','📊','🎨','🌱','⭐','🦾'];

const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid #EBEBEA', background: '#F5F5F2',
  color: '#0A0A0A', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
};

function Label({ children, required }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9B97', marginBottom: 6 }}>
      {children}{required && <span style={{ color: '#D85A30', marginLeft: 3 }}>*</span>}
    </p>
  );
}

// ─── Password gate ─────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);
  const check = () => {
    if (val === ADMIN_PASSWORD) { onUnlock(); }
    else { setErr(true); setTimeout(() => setErr(false), 1200); }
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ background: '#fff', border: '1px solid #EBEBEA', borderRadius: 12, padding: '36px 40px', width: '100%', maxWidth: 360, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 400, color: '#0A0A0A', marginBottom: 6 }}>Admin access</h2>
        <p style={{ fontSize: 13, color: '#9B9B97', marginBottom: 24 }}>HUNT internal tools</p>
        <input type="password" value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()} placeholder="Enter password"
          style={{ ...inp, textAlign: 'center', marginBottom: 10, border: err ? '1px solid #C0392B' : '1px solid #EBEBEA', transition: 'border-color 0.2s' }}
          autoFocus />
        {err && <p style={{ fontSize: 12, color: '#C0392B', marginBottom: 8 }}>Wrong password</p>}
        <button onClick={check} style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: '#D85A30', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Enter</button>
      </div>
    </div>
  );
}

// ─── Candidate detail panel ────────────────────────────────────────────────
function CandidatePanel({ app, onStatusChange, onClose }) {
  const s         = app.students || {};
  const skills    = s.skills   || [];
  const projects  = s.projects || [];
  const score     = app.match_score || 0;
  const breakdown = app.match_breakdown || {};
  const initials  = s.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
  const scoreColor = score >= 75 ? '#1A7A4A' : score >= 50 ? '#92600A' : '#C0392B';
  const scoreBg    = score >= 75 ? '#E8F5EE' : score >= 50 ? '#FDF3E3' : '#FDECEA';

  return (
    <div style={{ background: '#fff', border: '1px solid #EBEBEA', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #EBEBEA', background: '#F5F5F2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9B97', margin: 0 }}>Candidate profile</p>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9B9B97', display: 'flex' }}><X size={15} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E8F5EE', border: '1.5px solid rgba(26,122,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#1A7A4A', flexShrink: 0 }}>{initials}</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A', margin: 0 }}>{s.full_name || '—'}</p>
              <p style={{ fontSize: 11, color: '#9B9B97', margin: 0 }}>{s.college || '—'}{s.year ? ` · Year ${s.year}` : ''}</p>
              {s.email && <p style={{ fontSize: 10, color: '#9B9B97', margin: 0 }}>{s.email}</p>}
            </div>
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 10, background: scoreBg, border: `1.5px solid ${scoreColor}40`, textAlign: 'center', flexShrink: 0 }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: scoreColor, margin: 0, lineHeight: 1 }}>{score}%</p>
            <p style={{ fontSize: 9, color: '#9B9B97', margin: 0, marginTop: 2 }}>match</p>
          </div>
        </div>

        {/* Score breakdown */}
        {Object.keys(breakdown).length > 0 && (
          <div style={{ background: '#F5F5F2', border: '1px solid #EBEBEA', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
            <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9B97', marginBottom: 8 }}>Score breakdown</p>
            {Object.entries(breakdown).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: '#5A5A56', width: 110, flexShrink: 0, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div style={{ flex: 1, height: 3, background: '#EBEBEA', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(v * 2.5, 100)}%`, background: '#1A7A4A', borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, color: '#0A0A0A', width: 28, textAlign: 'right' }}>{v}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9B97', marginBottom: 7 }}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {skills.map((sk, i) => (
                <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: '#E8F5EE', border: '1px solid rgba(26,122,74,0.25)', color: '#1A7A4A' }}>
                  {sk.name} <span style={{ opacity: 0.6 }}>L{sk.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9B97', marginBottom: 7 }}>Projects</p>
            {projects.slice(0, 3).map((p, i) => (
              <div key={i} style={{ padding: '9px 11px', borderRadius: 8, border: '1px solid #EBEBEA', background: '#F5F5F2', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#0A0A0A', margin: 0 }}>{p.title || p.name}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(p.githubUrl || p.github_url) && <a href={p.githubUrl || p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#9B9B97', display: 'flex' }}><Github size={12} /></a>}
                    {(p.projectUrl || p.link) && <a href={p.projectUrl || p.link} target="_blank" rel="noopener noreferrer" style={{ color: '#9B9B97', display: 'flex' }}><ExternalLink size={12} /></a>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(Array.isArray(p.techStack) ? p.techStack : [p.techStack]).filter(Boolean).map((t, j) => (
                    <span key={j} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, border: '1px solid #EBEBEA', color: '#9B9B97' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5A5A56', padding: '4px 10px', borderRadius: 20, border: '1px solid #EBEBEA', textDecoration: 'none' }}><Github size={11} /> GitHub</a>}
          {s.linkedin_url  && <a href={s.linkedin_url}  target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5A5A56', padding: '4px 10px', borderRadius: 20, border: '1px solid #EBEBEA', textDecoration: 'none' }}><ExternalLink size={11} /> LinkedIn</a>}
          {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5A5A56', padding: '4px 10px', borderRadius: 20, border: '1px solid #EBEBEA', textDecoration: 'none' }}><ExternalLink size={11} /> Portfolio</a>}
          {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#D85A30', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(216,90,48,0.3)', textDecoration: 'none' }}>📄 Resume</a>}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[
            { key: 'shortlisted', label: '✓ Shortlist', activeBg: '#1A7A4A', activeColor: '#fff', inactiveBg: '#E8F5EE', inactiveColor: '#1A7A4A' },
            { key: 'interview',   label: '📅 Interview', activeBg: '#2563EB', activeColor: '#fff', inactiveBg: 'rgba(37,99,235,0.08)', inactiveColor: '#2563EB' },
            { key: 'rejected',    label: '✕ Pass',      activeBg: '#C0392B', activeColor: '#fff', inactiveBg: '#FDECEA', inactiveColor: '#C0392B' },
          ].map(opt => (
            <button key={opt.key} onClick={() => onStatusChange(app.id, opt.key)} style={{
              padding: '9px 6px', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              border: `1px solid ${app.status === opt.key ? opt.activeBg : opt.activeBg + '40'}`,
              background: app.status === opt.key ? opt.activeBg : opt.inactiveBg,
              color: app.status === opt.key ? opt.activeColor : opt.inactiveColor,
            }}>
              {opt.label}
            </button>
          ))}
        </div>
        {app.status && app.status !== 'pending' && (
          <p style={{ fontSize: 10, color: '#9B9B97', textAlign: 'center', marginTop: 8 }}>
            Status: <strong style={{ color: '#0A0A0A', textTransform: 'capitalize' }}>{app.status}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Candidates view ───────────────────────────────────────────────────────
function CandidatesView({ job, onBack, showToast }) {
  const [apps, setApps]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: appsData, error } = await supabase
          .from('applications')
          .select('*')
          .eq('job_id', job.id)
          .order('match_score', { ascending: false });
        if (error) throw error;
        const studentIds = appsData.map(a => a.student_id);
        const { data: studentsData } = await supabase
          .from('students')
          .select('*')
          .in('id', studentIds);
        const merged = appsData.map(app => ({
          ...app,
          students: studentsData?.find(s => s.id === app.student_id) || {}
        }));
        setApps(merged);
      } catch (e) {
        showToast('Failed to load applicants', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [job.id]);

  const handleStatusChange = async (appId, status) => {
    try {
      const { error } = await supabase.from('applications').update({ status }).eq('id', appId);
      if (error) throw error;
      setApps(a => a.map(x => x.id === appId ? { ...x, status } : x));
      if (selectedApp?.id === appId) setSelectedApp(a => ({ ...a, status }));
      const labels = { shortlisted: 'Shortlisted!', interview: 'Interview request sent!', rejected: 'Passed.' };
      showToast(labels[status] || 'Updated');
    } catch (e) { showToast('Failed to update', 'error'); }
  };

  const statusStyle = (status) => ({
    shortlisted: { bg: '#E8F5EE',                    color: '#1A7A4A', border: 'rgba(26,122,74,0.25)' },
    interview:   { bg: 'rgba(37,99,235,0.08)',        color: '#2563EB', border: 'rgba(37,99,235,0.2)' },
    rejected:    { bg: '#FDECEA',                     color: '#C0392B', border: 'rgba(192,57,43,0.25)' },
    pending:     { bg: '#F5F5F2',                     color: '#9B9B97', border: '#EBEBEA' },
  }[status || 'pending']);

  return (
    <div>
      {/* Sub header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 6, border: '1px solid #EBEBEA', background: 'transparent', color: '#9B9B97', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0A0A0A'; e.currentTarget.style.borderColor = '#D6D6D3'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9B9B97'; e.currentTarget.style.borderColor = '#EBEBEA'; }}>
            <ArrowLeft size={12} /> All roles
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{job.logo || '🚀'}</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', margin: 0 }}>{job.role}</p>
              <p style={{ fontSize: 11, color: '#9B9B97', margin: 0 }}>{job.company} · {job.location}</p>
            </div>
          </div>
        </div>
        <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: '#E8F5EE', border: '1px solid rgba(26,122,74,0.2)', color: '#1A7A4A', fontWeight: 500 }}>
          {loading ? '…' : apps.length} applicant{apps.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#fff', border: '1px solid #EBEBEA', borderRadius: 12, color: '#9B9B97', fontSize: 13 }}>Loading applicants…</div>
      ) : apps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '52px 20px', background: '#fff', border: '1px solid #EBEBEA', borderRadius: 12 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#0A0A0A', marginBottom: 6 }}>No applicants yet.</p>
          <p style={{ fontSize: 13, color: '#9B9B97' }}>Share the role link to start getting applications.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 1fr' : '1fr', gap: 16 }}>
          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {apps.map((app, i) => {
              const s = app.students || {};
              const score = app.match_score || 0;
              const scoreColor = score >= 75 ? '#1A7A4A' : score >= 50 ? '#92600A' : '#C0392B';
              const initials = s.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
              const ss = statusStyle(app.status);
              const isSelected = selectedApp?.id === app.id;

              return (
                <div key={app.id} onClick={() => setSelectedApp(isSelected ? null : app)}
                  style={{ background: '#fff', border: `1px solid ${isSelected ? '#D85A30' : '#EBEBEA'}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#D6D6D3'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#EBEBEA'; }}>
                  <span style={{ fontSize: 10, color: '#9B9B97', width: 18, flexShrink: 0, textAlign: 'center', fontWeight: 500 }}>#{i + 1}</span>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E8F5EE', border: '1px solid rgba(26,122,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#1A7A4A', flexShrink: 0 }}>{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#0A0A0A', margin: 0 }}>{s.full_name || 'Student'}</p>
                    <p style={{ fontSize: 10, color: '#9B9B97', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.college || '—'}{s.year ? ` · Year ${s.year}` : ''}</p>
                  </div>
                  {/* Skill previews */}
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {(s.skills || []).slice(0, 2).map((sk, j) => (
                      <span key={j} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: '#E8F5EE', border: '1px solid rgba(26,122,74,0.2)', color: '#1A7A4A' }}>{sk.name}</span>
                    ))}
                  </div>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: scoreColor, margin: 0, flexShrink: 0 }}>{score}%</p>
                  <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 8, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
                    {app.status || 'new'}
                  </span>
                  <ChevronRight size={12} style={{ color: '#9B9B97', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selectedApp && (
            <CandidatePanel
              app={selectedApp}
              onStatusChange={handleStatusChange}
              onClose={() => setSelectedApp(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Shareable link card ───────────────────────────────────────────────────
function LinkCard({ job, onToggle, onDelete, onViewCandidates }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/apply/${job.share_slug}`;

  const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const whatsapp = () => {
    const text = encodeURIComponent(`Hey! 👋\n\n*${job.role}* at *${job.company}*\n\n💰 ${job.stipend} · 📍 ${job.location} · ⏱ ${job.duration}\n\nApply here: ${url}\n\n_Powered by HUNT — skill-first internships_`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const filled = (job.current_applicants || 0) / (job.max_applicants || 50);

  return (
    <div style={{ background: '#fff', border: '1px solid #EBEBEA', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{job.logo || '🚀'}</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A', margin: 0 }}>{job.role}</p>
            <p style={{ fontSize: 11, color: '#9B9B97', margin: 0 }}>{job.company} · {job.stipend} · {job.location}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, fontWeight: 500, background: job.visibility === 'private' ? 'rgba(37,99,235,0.08)' : '#E8F5EE', color: job.visibility === 'private' ? '#2563EB' : '#1A7A4A', border: `1px solid ${job.visibility === 'private' ? 'rgba(37,99,235,0.2)' : 'rgba(26,122,74,0.2)'}` }}>
            {job.visibility === 'private' ? '🔗 Private' : '🌐 Public'}
          </span>
          <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, fontWeight: 500, background: job.is_active ? '#E8F5EE' : '#F5F5F2', color: job.is_active ? '#1A7A4A' : '#9B9B97', border: `1px solid ${job.is_active ? 'rgba(26,122,74,0.2)' : '#EBEBEA'}` }}>
            {job.is_active ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: '#9B9B97' }}>Applicants</span>
          <span style={{ fontSize: 10, fontWeight: 500, color: '#0A0A0A' }}>{job.current_applicants || 0}/{job.max_applicants || 50}</span>
        </div>
        <div style={{ height: 3, borderRadius: 2, background: '#EBEBEA', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${filled * 100}%`, background: filled > 0.8 ? '#C0392B' : filled > 0.5 ? '#D85A30' : '#1A7A4A', borderRadius: 2 }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: '#F5F5F2', border: '1px solid #EBEBEA', marginBottom: 10 }}>
        <Link2 size={12} style={{ color: '#9B9B97', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: '#5A5A56', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
        <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid #EBEBEA', background: copied ? '#E8F5EE' : '#fff', color: copied ? '#1A7A4A' : '#5A5A56', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.15s' }}>
          {copied ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy</>}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onViewCandidates(job)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, border: '1px solid #0A0A0A', background: '#0A0A0A', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#333'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0A0A0A'; }}>
          <Users size={12} /> View candidates
        </button>
        <button onClick={whatsapp} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, border: 'none', background: '#25D366', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 10px', borderRadius: 8, border: '1px solid #EBEBEA', background: 'transparent', color: '#5A5A56', fontSize: 11, cursor: 'pointer', textDecoration: 'none' }} title="Open apply page"><ExternalLink size={12} /></a>
        <button onClick={() => onToggle(job)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 10px', borderRadius: 8, border: '1px solid #EBEBEA', background: 'transparent', color: job.is_active ? '#1A7A4A' : '#9B9B97', fontSize: 11, cursor: 'pointer' }} title={job.is_active ? 'Pause' : 'Activate'}>
          {job.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        <button onClick={() => onDelete(job)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 10px', borderRadius: 8, border: '1px solid #EBEBEA', background: 'transparent', color: '#9B9B97', fontSize: 11, cursor: 'pointer' }} title="Delete"
          onMouseEnter={e => e.currentTarget.style.color = '#C0392B'}
          onMouseLeave={e => e.currentTarget.style.color = '#9B9B97'}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Post form ─────────────────────────────────────────────────────────────
function PostForm({ onSuccess, onCancel }) {
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [niceInput, setNiceInput]   = useState('');
  const [form, setForm] = useState({
    logo: '🚀', company: '', role: '', description: '',
    stipend: '', duration: '', location: '',
    type: 'Paid Internship', visibility: 'private',
    required_skills: [], nice_to_have: [], max_applicants: 50,
  });

  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const addSkill = () => { const name = skillInput.trim(); if (!name || form.required_skills.find(s => s.name.toLowerCase() === name.toLowerCase())) return; setForm(f => ({ ...f, required_skills: [...f.required_skills, { name, weight: 0.25, level: 3 }] })); setSkillInput(''); };
  const removeSkill = name => setForm(f => ({ ...f, required_skills: f.required_skills.filter(s => s.name !== name) }));
  const addNice = () => { const name = niceInput.trim(); if (!name || form.nice_to_have.includes(name)) return; setForm(f => ({ ...f, nice_to_have: [...f.nice_to_have, name] })); setNiceInput(''); };

  const handleSubmit = async () => {
    if (!form.company.trim()) { setError('Company name is required.'); return; }
    if (!form.role.trim())    { setError('Role title is required.'); return; }
    if (!form.stipend.trim()) { setError('Stipend is required.'); return; }
    if (!form.duration.trim()){ setError('Duration is required.'); return; }
    if (!form.location.trim()){ setError('Location is required.'); return; }
    if (form.required_skills.length === 0) { setError('Add at least one required skill.'); return; }
    setSaving(true); setError('');
    try {
      const totalW = form.required_skills.reduce((s, sk) => s + sk.weight, 0);
      const normSkills = form.required_skills.map(sk => ({ ...sk, weight: parseFloat((sk.weight / totalW).toFixed(3)) }));
      const slug = `${form.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${form.role.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
      const { data, error: err } = await supabase.from('jobs').insert([{
        recruiter_id: ADMIN_RECRUITER_ID, company: form.company.trim(), logo: form.logo,
        role: form.role.trim(), description: form.description.trim(),
        stipend: form.stipend.trim(), duration: form.duration.trim(), location: form.location.trim(),
        type: form.type, visibility: form.visibility, share_slug: slug,
        required_skills: normSkills, nice_to_have: form.nice_to_have,
        max_applicants: form.max_applicants, current_applicants: 0, is_active: true,
      }]).select().single();
      if (err) throw err;
      onSuccess(data);
    } catch (e) { setError('Failed: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #EBEBEA', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #EBEBEA', background: '#F5F5F2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D85A30', marginBottom: 2 }}>New internship</p>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A', margin: 0 }}>Post & get shareable link</h3>
        </div>
        <button onClick={onCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9B9B97' }}><X size={16} /></button>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><Label>Logo emoji</Label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{LOGO_EMOJIS.map(e => (<button key={e} onClick={() => set('logo')(e)} style={{ width: 34, height: 34, borderRadius: 6, fontSize: 17, border: `1.5px solid ${form.logo === e ? '#D85A30' : '#EBEBEA'}`, background: form.logo === e ? 'rgba(216,90,48,0.08)' : '#F5F5F2', cursor: 'pointer' }}>{e}</button>))}</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><Label required>Company name</Label><input style={inp} value={form.company} onChange={e => set('company')(e.target.value)} placeholder="TechFlow AI" onFocus={e => e.target.style.borderColor='#D85A30'} onBlur={e => e.target.style.borderColor='#EBEBEA'} /></div>
          <div><Label required>Role title</Label><input style={inp} value={form.role} onChange={e => set('role')(e.target.value)} placeholder="Backend Engineering Intern" onFocus={e => e.target.style.borderColor='#D85A30'} onBlur={e => e.target.style.borderColor='#EBEBEA'} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div><Label required>Stipend</Label><input style={inp} value={form.stipend} onChange={e => set('stipend')(e.target.value)} placeholder="₹25,000/month" onFocus={e => e.target.style.borderColor='#D85A30'} onBlur={e => e.target.style.borderColor='#EBEBEA'} /></div>
          <div><Label required>Duration</Label><input style={inp} value={form.duration} onChange={e => set('duration')(e.target.value)} placeholder="3 months" onFocus={e => e.target.style.borderColor='#D85A30'} onBlur={e => e.target.style.borderColor='#EBEBEA'} /></div>
          <div><Label required>Location</Label><input style={inp} value={form.location} onChange={e => set('location')(e.target.value)} placeholder="Remote" onFocus={e => e.target.style.borderColor='#D85A30'} onBlur={e => e.target.style.borderColor='#EBEBEA'} /></div>
        </div>
        <div><Label>Description</Label><textarea style={{ ...inp, resize: 'none' }} rows={3} value={form.description} onChange={e => set('description')(e.target.value)} placeholder="What will the intern work on?" onFocus={e => e.target.style.borderColor='#D85A30'} onBlur={e => e.target.style.borderColor='#EBEBEA'} /></div>
        <div>
          <Label required>Required skills</Label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input style={{ ...inp, flex: 1 }} value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Type skill + Enter" list="admin-skills" onKeyDown={e => e.key === 'Enter' && addSkill()} onFocus={e => e.target.style.borderColor='#D85A30'} onBlur={e => e.target.style.borderColor='#EBEBEA'} />
            <datalist id="admin-skills">{SKILL_OPTIONS.map(s => <option key={s} value={s} />)}</datalist>
            <button onClick={addSkill} style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: '#D85A30', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Add</button>
          </div>
          {form.required_skills.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {form.required_skills.map(skill => (
                <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, border: '1px solid #EBEBEA', background: '#F5F5F2' }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#0A0A0A', flex: 1 }}>{skill.name}</span>
                  <span style={{ fontSize: 10, color: '#9B9B97' }}>Level</span>
                  <div style={{ display: 'flex', gap: 3 }}>{[1,2,3,4,5].map(lv => (<button key={lv} onClick={() => setForm(f => ({ ...f, required_skills: f.required_skills.map(s => s.name === skill.name ? { ...s, level: lv } : s) }))} style={{ width: 22, height: 22, borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: 'pointer', border: 'none', background: skill.level >= lv ? '#D85A30' : '#fff', color: skill.level >= lv ? '#fff' : '#9B9B97', outline: skill.level >= lv ? 'none' : '1px solid #EBEBEA' }}>{lv}</button>))}</div>
                  <button onClick={() => removeSkill(skill.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9B9B97', display: 'flex', padding: 0 }}><X size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <Label>Nice to have</Label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input style={{ ...inp, flex: 1 }} value={niceInput} onChange={e => setNiceInput(e.target.value)} placeholder="e.g. Docker, AWS" list="admin-skills" onKeyDown={e => e.key === 'Enter' && addNice()} onFocus={e => e.target.style.borderColor='#D85A30'} onBlur={e => e.target.style.borderColor='#EBEBEA'} />
            <button onClick={addNice} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #EBEBEA', background: 'transparent', color: '#5A5A56', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
          </div>
          {form.nice_to_have.length > 0 && (<div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{form.nice_to_have.map(s => (<span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', borderRadius: 20, border: '1px solid #EBEBEA', color: '#5A5A56' }}>{s}<button onClick={() => setForm(f => ({ ...f, nice_to_have: f.nice_to_have.filter(x => x !== s) }))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9B9B97', display: 'flex', padding: 0 }}><X size={10} /></button></span>))}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Label>Visibility</Label>
            <div style={{ display: 'flex', gap: 7 }}>{['public', 'private'].map(v => (<button key={v} onClick={() => set('visibility')(v)} style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', background: form.visibility === v ? 'rgba(216,90,48,0.08)' : '#F5F5F2', border: `1px solid ${form.visibility === v ? '#D85A30' : '#EBEBEA'}`, color: form.visibility === v ? '#D85A30' : '#5A5A56', fontWeight: form.visibility === v ? 500 : 400 }}>{v === 'public' ? '🌐 Public' : '🔗 Private'}</button>))}</div>
            <p style={{ fontSize: 10, color: '#9B9B97', marginTop: 4 }}>{form.visibility === 'public' ? 'Shows in swipe feed.' : 'Only via share link.'}</p>
          </div>
          <div>
            <Label>Max applicants</Label>
            <div style={{ display: 'flex', gap: 5 }}>{[10, 25, 50, 100].map(n => (<button key={n} onClick={() => set('max_applicants')(n)} style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', background: form.max_applicants === n ? 'rgba(216,90,48,0.08)' : '#F5F5F2', border: `1px solid ${form.max_applicants === n ? '#D85A30' : '#EBEBEA'}`, color: form.max_applicants === n ? '#D85A30' : '#9B9B97', fontWeight: form.max_applicants === n ? 500 : 400 }}>{n}</button>))}</div>
          </div>
        </div>
        {error && <div style={{ padding: '9px 12px', borderRadius: 8, background: '#FDECEA', border: '1px solid #C0392B' }}><p style={{ fontSize: 12, color: '#C0392B', margin: 0 }}>{error}</p></div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid #EBEBEA', background: 'transparent', color: '#5A5A56', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 8, border: 'none', background: saving ? '#9B9B97' : '#D85A30', color: '#fff', fontSize: 13, fontWeight: 500, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit' }}>{saving ? 'Posting…' : 'Post & get link →'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function AdminJobCreator() {
  const [unlocked, setUnlocked]     = useState(() => sessionStorage.getItem('hunt_admin') === 'yes');
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [toast, setToast]           = useState(null);
  const [viewingJob, setViewingJob] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };
  const handleUnlock = () => { sessionStorage.setItem('hunt_admin', 'yes'); setUnlocked(true); };

  useEffect(() => { if (!unlocked) return; loadJobs(); }, [unlocked]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('jobs').select('*').eq('recruiter_id', ADMIN_RECRUITER_ID).order('created_at', { ascending: false });
      if (error) throw error;
      setJobs(data || []);
    } catch (e) { showToast('Failed to load jobs', 'error'); }
    finally { setLoading(false); }
  };

  const handlePostSuccess = (newJob) => { setShowForm(false); setJobs(j => [newJob, ...j]); showToast('Internship posted! Share link is ready.'); };

  const handleToggle = async (job) => {
    try {
      const { data, error } = await supabase.from('jobs').update({ is_active: !job.is_active }).eq('id', job.id).select().single();
      if (error) throw error;
      setJobs(j => j.map(x => x.id === job.id ? data : x));
      showToast(data.is_active ? 'Activated' : 'Paused');
    } catch (e) { showToast('Failed', 'error'); }
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete "${job.role}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', job.id);
      if (error) throw error;
      setJobs(j => j.filter(x => x.id !== job.id));
      showToast('Deleted');
    } catch (e) { showToast('Failed to delete', 'error'); }
  };

  if (!unlocked) return <PasswordGate onUnlock={handleUnlock} />;

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: toast.type === 'error' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)', color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', pointerEvents: 'none' }}>
          {toast.msg}
        </div>
      )}

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: '1px solid #EBEBEA', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: '0.12em', color: '#0A0A0A' }}>HUNT</span>
          <span style={{ width: 1, height: 14, background: '#EBEBEA', display: 'inline-block' }} />
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D85A30' }}>
            Admin {viewingJob ? `· ${viewingJob.role}` : '· Job creator'}
          </span>
        </div>
        {!viewingJob && (
          <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', background: '#D85A30', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Plus size={13} /> New internship
          </button>
        )}
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px 80px' }}>
        {viewingJob ? (
          <CandidatesView job={viewingJob} onBack={() => setViewingJob(null)} showToast={showToast} />
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: '#0A0A0A', marginBottom: 6, letterSpacing: '-0.01em' }}>Your internships</h1>
              <p style={{ fontSize: 13, color: '#9B9B97' }}>Post roles, share links, review candidates. Click "View candidates" on any role.</p>
            </div>
            {showForm && <PostForm onSuccess={handlePostSuccess} onCancel={() => setShowForm(false)} />}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9B9B97', fontSize: 13 }}>Loading…</div>
            ) : jobs.length === 0 && !showForm ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid #EBEBEA', borderRadius: 12 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#0A0A0A', marginBottom: 8 }}>No internships yet.</p>
                <p style={{ fontSize: 13, color: '#9B9B97', marginBottom: 20 }}>Post your first one and get a shareable link.</p>
                <button onClick={() => setShowForm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: 'none', background: '#D85A30', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Plus size={14} /> Post first internship
                </button>
              </div>
            ) : (
              jobs.map(job => (
                <LinkCard key={job.id} job={job} onToggle={handleToggle} onDelete={handleDelete} onViewCandidates={setViewingJob} />
              ))
            )}
          </>
        )}
      </div>
      <style>{`* { box-sizing: border-box; }`}</style>
    </div>
  );
}
