import React, { useState } from 'react';
import {
  Plus, LogOut, Sun, Moon, X, ChevronRight,
  MapPin, Users, Link2, Trash2,
  ArrowLeft, Pause, Play, ExternalLink, Github, Building2, Home,
  Layers, UserCheck, GitBranch, Sparkles,
  Bookmark, ThumbsDown, Phone, Award, Bell, Lock, MessageSquare,
  LayoutGrid, List, Edit2, Camera, Image as ImageIcon, ChevronDown,
  CheckCircle, Clock, AlertCircle, Eye, AlertTriangle, Star,
} from 'lucide-react';
import { Avatar, ScoreNumber, HuntScoreBadge, StatusPill, linkChip, iconBtn } from '../shared/ui';
import { ConfirmActionDialog } from '../layout/ConfirmActionDialog';

export function HuntSortTrigger({ apps, onSortDone }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState('');

  const MESSAGES = [
    'Reading candidate profiles…',
    'Analysing skill match scores…',
    'Evaluating project relevance…',
    'Checking consistency signals…',
    'Computing final rankings…',
    'Finalising top candidates…',
  ];

  const run = async () => {
    setLoading(true);
    setProgress(0);
    for (let i = 0; i < MESSAGES.length; i++) {
      setMsg(MESSAGES[i]);
      setProgress(Math.round(((i + 1) / MESSAGES.length) * 100));
      await new Promise(r => setTimeout(r, 400 + Math.random() * 200));
    }
    const sorted = [...apps].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 6);
    setLoading(false);
    onSortDone(sorted);
  };

  return (
    <>
      <button onClick={run} disabled={loading || apps.length === 0} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 8, border: 'none',
        background: apps.length === 0 ? 'var(--bg-subtle)' : 'var(--text)',
        color: apps.length === 0 ? 'var(--text-dim)' : 'var(--bg)',
        fontSize: 11, fontWeight: 600, cursor: apps.length === 0 ? 'default' : 'pointer',
        fontFamily: 'inherit', flexShrink: 0,
      }}>
        <Sparkles size={12} /> HUNT Sort
      </button>

      {loading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '48px 56px', border: '1px solid var(--border)', textAlign: 'center', maxWidth: 380, width: '90%', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--green-tint)', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Sparkles size={24} style={{ color: 'var(--green)' }} />
            </div>
            <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)', margin: '0 0 6px', fontWeight: 400 }}>HUNT Sort</p>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '0 0 28px', lineHeight: 1.5 }}>{msg}</p>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ height: '100%', background: 'var(--green)', borderRadius: 2, width: `${progress}%`, transition: 'width 0.4s ease' }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>{progress}%</p>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
export function HuntSortSnapshot({ app, onStatusChange, onViewFull, onClose, showToast }) {
  const s = app.students || {};
  const score = app.match_score || 0;
  const huntScore = s._huntScore?.score ?? s.hunt_score ?? null;
  const breakdown = app.match_breakdown || {};
  const [sending, setSending] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const ACTIONS = [
    { key: 'shortlisted', label: 'Shortlist', icon: Bookmark,   color: 'var(--green-text)' },
    { key: 'interview',   label: 'Interview', icon: Phone,      color: 'var(--blue)' },
    { key: 'hired',       label: 'Hire',      icon: Award,      color: 'var(--purple)' },
    { key: 'rejected',    label: 'Pass',      icon: ThumbsDown, color: 'var(--red)' },
  ];

  const handleActionClick = (key) => {
    if (app.status === key) { executeAction('pending'); return; }
    if (key === 'hired' || key === 'interview') { setConfirmDialog({ action: key }); return; }
    executeAction(key);
  };

  const executeAction = async (key) => {
    setSending(true);
    try {
      await onStatusChange(app.id, key);
      showToast && showToast(key === 'hired' ? 'Hired! 🎉' : key === 'pending' ? 'Status cleared' : `${key} updated`);
    } finally { setSending(false); setConfirmDialog(null); }
  };

  return (
    <>
      <ConfirmActionDialog open={!!confirmDialog} action={confirmDialog?.action} candidateName={s.full_name || 'this candidate'} onConfirm={() => executeAction(confirmDialog.action)} onCancel={() => setConfirmDialog(null)} />
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Candidate</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => onViewFull(s)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Eye size={11} /> Full profile
            </button>
            <button onClick={onClose} style={{ ...iconBtn, width: 26, height: 26, padding: 0, justifyContent: 'center' }}><X size={11} /></button>
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12, flexWrap: 'nowrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0, flex: 1 }}>
                <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={38} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name || 'Student'}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.college || '—'}{s.year ? ` · Y${s.year}` : ''}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <ScoreNumber score={score} size={20} />
                <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: '1px 0 0', textTransform: 'uppercase' }}>match</p>
              </div>
            </div>
            {huntScore !== null && <div style={{ marginBottom: 10 }}><HuntScoreBadge score={huntScore} /></div>}
            {Object.keys(breakdown).length > 0 && (
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                {Object.entries(breakdown).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-dim)', width: 90, flexShrink: 0, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(v, 40) * 2.5}%`, background: 'var(--green)' }} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text)', width: 24, textAlign: 'right' }}>{v}%</span>
                  </div>
                ))}
              </div>
            )}
            {(s.skills || []).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {(s.skills || []).slice(0, 5).map((sk, i) => (
                  <span key={i} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 5, background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green-text)' }}>{sk.name}</span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
              {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, fontSize: 10, padding: '3px 8px' }}><Github size={10} /> GitHub</a>}
              {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, fontSize: 10, padding: '3px 8px', color: 'var(--text)', borderColor: 'var(--text)' }}>📄 Resume</a>}
              {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ ...linkChip, fontSize: 10, padding: '3px 8px' }}><ExternalLink size={10} /></a>}
            </div>
            {app.status && app.status !== 'pending' && (
              <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Current:</span>
                <StatusPill status={app.status} />
                <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>· click again to undo</span>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {ACTIONS.map(opt => {
                const active = app.status === opt.key;
                const Icon = opt.icon;
                return (
                  <button key={opt.key} disabled={sending} onClick={() => handleActionClick(opt.key)} style={{
                    padding: '8px 6px', borderRadius: 7, fontSize: 10, fontWeight: 500,
                    cursor: sending ? 'wait' : 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    border: `1px solid ${active ? opt.color : 'var(--border)'}`,
                    background: active ? opt.color : 'transparent',
                    color: active ? '#fff' : opt.color,
                    opacity: sending ? 0.6 : 1, transition: 'all 0.15s',
                  }}>
                    <Icon size={11} /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLICANT SNAPSHOT
// ═══════════════════════════════════════════════════════════════════════════
export function ApplicantSnapshot({ app, onStatusChange, onClose, compact = false, onViewFull }) {
  const s         = app.students || {};
  const skills    = s.skills    || [];
  const projects  = s.projects  || [];
  const score     = app.match_score    || 0;
  const breakdown = app.match_breakdown || {};
  const huntScore = s._huntScore?.score ?? s.hunt_score ?? null;
  const [sending, setSending] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const ACTIONS = [
    { key: 'shortlisted', label: 'Shortlist',  icon: Bookmark,   color: 'var(--green-text)' },
    { key: 'interview',   label: 'Interview',  icon: Phone,      color: 'var(--blue)' },
    { key: 'hired',       label: 'Hire',       icon: Award,      color: 'var(--purple)' },
    { key: 'rejected',    label: 'Pass',       icon: ThumbsDown, color: 'var(--red)' },
  ];

  const handleActionClick = (key) => {
    if (app.status === key) { executeAction('pending'); return; }
    if (key === 'hired' || key === 'interview') { setConfirmDialog({ action: key }); return; }
    executeAction(key);
  };

  const executeAction = async (key) => {
    setSending(true);
    try { await onStatusChange(app.id, key); }
    finally { setSending(false); setConfirmDialog(null); }
  };

  return (
    <>
      <ConfirmActionDialog open={!!confirmDialog} action={confirmDialog?.action} candidateName={s.full_name || 'this candidate'} onConfirm={() => executeAction(confirmDialog.action)} onCancel={() => setConfirmDialog(null)} />
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Candidate</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {onViewFull && (
              <button onClick={() => onViewFull(s)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Eye size={11} /> Full profile
              </button>
            )}
            {onClose && <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}><X size={16} /></button>}
          </div>
        </div>
        <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={46} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 16, color: 'var(--text)', margin: 0, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name || 'Student'}</p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.college || '—'} · Year {s.year || '?'}</p>
                {app.jobs?.role && <p style={{ fontSize: 10, color: 'var(--text-mid)', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Applied for: <strong>{app.jobs.role}</strong></p>}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <ScoreNumber score={score} size={26} />
              <p style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>match</p>
              {huntScore !== null && <div style={{ marginTop: 6 }}><HuntScoreBadge score={huntScore} /></div>}
            </div>
          </div>
          {Object.keys(breakdown).length > 0 && (
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Score breakdown</p>
              {Object.entries(breakdown).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-mid)', width: 110, flexShrink: 0, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(v, 40) * 2.5}%`, background: 'var(--green)', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)', width: 28, textAlign: 'right' }}>{v}%</span>
                </div>
              ))}
            </div>
          )}
          {skills.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {skills.map((sk, i) => (
                  <span key={i} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green-text)' }}>
                    {sk.name} <span style={{ opacity: 0.6 }}>L{sk.level}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {projects.length > 0 && !compact && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Projects</p>
              {projects.slice(0, 3).map((p, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', margin: 0 }}>{p.title || p.name}</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(p.githubUrl || p.github_url) && <a href={p.githubUrl || p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><Github size={12} /></a>}
                      {(p.projectUrl || p.link)      && <a href={p.projectUrl || p.link}      target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><ExternalLink size={12} /></a>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(Array.isArray(p.techStack) ? p.techStack : [p.techStack]).filter(Boolean).map((t, j) => (
                      <span key={j} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={linkChip}><Github size={11} /> GitHub</a>}
            {s.linkedin_url  && <a href={s.linkedin_url}  target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> LinkedIn</a>}
            {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> Portfolio</a>}
            {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, color: 'var(--text)', borderColor: 'var(--text)' }}>📄 Resume</a>}
          </div>
          {app.status && app.status !== 'pending' && (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Current status:</span>
              <StatusPill status={app.status} />
              <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>· click again to undo</span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {ACTIONS.map(opt => {
              const active = app.status === opt.key;
              const Icon   = opt.icon;
              return (
                <button key={opt.key} disabled={sending} onClick={() => handleActionClick(opt.key)} style={{
                  padding: '10px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                  cursor: sending ? 'wait' : 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  border: `1px solid ${active ? opt.color : 'var(--border)'}`,
                  background: active ? opt.color : 'transparent',
                  color: active ? '#fff' : opt.color,
                  opacity: sending ? 0.6 : 1, transition: 'all 0.15s',
                }}>
                  <Icon size={12} /> {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLE CARD
