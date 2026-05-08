import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, LogOut, Sun, Moon, X, ChevronRight,
  MapPin, Users, Link2, Trash2,
  ArrowLeft, Pause, Play, ExternalLink, Github, Building2, Home,
  Layers, UserCheck, GitBranch, Sparkles,
  Bookmark, ThumbsDown, Phone, Award, Bell, Lock, MessageSquare,
  LayoutGrid, List, Edit2, Camera, Image as ImageIcon, ChevronDown,
  CheckCircle, Clock, AlertCircle, Eye, AlertTriangle, Star,
} from 'lucide-react';
import { getJobApplications, updateApplicationStatus } from '../services/recruiterApi';
import { CompanyLogo, ScoreNumber, StatusPill, Avatar, HuntScoreBadge, linkChip, iconBtn, btnPrimary, btnGhost } from '../shared/ui';
import { CandidateProfileDrawer } from '../candidates/CandidateProfileDrawer';
import { HuntSortTrigger, HuntSortSnapshot, ApplicantSnapshot } from '../candidates/HuntSort';

export function RoleCard({ job, onClick, onTogglePause, onCopyLink, onDelete, onEdit, startupLogoUrl }) {
  const filled = (job.current_applicants || 0) / (job.max_applicants || 50);
  const status = job.status || (job.is_active ? 'live' : 'paused');
  const statusStyle = status === 'live'
    ? { color: 'var(--green-text)', bg: 'var(--green-tint)', border: 'var(--green)', label: '● Live' }
    : status === 'paused'
    ? { color: 'var(--amber)', bg: 'var(--amber-tint)', border: 'var(--amber)', label: '⏸ Paused' }
    : { color: 'var(--text-dim)', bg: 'var(--bg-subtle)', border: 'var(--border)', label: 'Closed' };
  return (
    <div onClick={onClick} className="hn-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 180 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <CompanyLogo name={job.company} logoUrl={job.logo_url} startupLogoUrl={startupLogoUrl} size={40} />
          <div>
            <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 15, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.25 }}>{job.role}</p>
            <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>{job.stipend} · {job.duration}</p>
          </div>
        </div>
        <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 500, background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', flexShrink: 0 }}>{statusStyle.label}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-mid)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} /> {job.location}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={10} /> {job.current_applicants || 0} applied</span>
      </div>
      <div>
        <div style={{ height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(filled, 1) * 100}%`, background: filled > 0.8 ? 'var(--red)' : filled > 0.5 ? 'var(--amber)' : 'var(--green)', borderRadius: 2, transition: 'width 0.4s' }} />
        </div>
      </div>
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 5, marginTop: 'auto', flexWrap: 'wrap' }}>
        <button onClick={() => onCopyLink(job)} style={{ ...iconBtn, flex: 1 }} title="Copy share link"><Link2 size={12} /> <span style={{ fontSize: 10 }}>Share</span></button>
        <button onClick={() => onEdit(job)} style={{ ...iconBtn }} title="Edit role"><Edit2 size={12} /></button>
        <button onClick={() => onTogglePause(job)} style={iconBtn} title={status === 'live' ? 'Pause' : 'Resume'}>{status === 'live' ? <Pause size={12} /> : <Play size={12} />}</button>
        <button onClick={() => onDelete(job)} style={{ ...iconBtn, color: 'var(--red)' }} title="Delete"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLE DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════
export function RoleDetailView({ job, onBack, onCopyLink, onEdit, onTogglePause, onDelete, recruiter, showToast }) {
  const [apps, setApps]                     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedApp, setSelectedApp]       = useState(null);
  const [subTab, setSubTab]                 = useState('candidates');
  const [sortedCandidates, setSortedCandidates] = useState(null);
  const [profileDrawerOpen, setProfileDrawerOpen]       = useState(false);
  const [profileDrawerStudent, setProfileDrawerStudent] = useState(null);

  const startupLogoUrl = recruiter?.startups?.logo_url || '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setApps(await getJobApplications(job.id)); }
      finally { setLoading(false); }
    })();
  }, [job.id]);

  const handleStatusChange = async (appId, status) => {
    const app = apps.find(a => a.id === appId);
    try {
      await updateApplicationStatus(appId, status, app?.students?.id, { role: job.role, company: job.company || recruiter?.startups?.name });
      setApps(a => a.map(x => x.id === appId ? { ...x, status } : x));
      if (sortedCandidates) setSortedCandidates(sc => sc.map(x => x.id === appId ? { ...x, status } : x));
      if (selectedApp?.id === appId) setSelectedApp(s => ({ ...s, status }));
      const labels = { shortlisted: 'Shortlisted ✓', interview: 'Moved to interview', hired: 'Hired! 🎉', rejected: 'Passed', pending: 'Status cleared' };
      showToast(labels[status] || 'Updated');
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  };

  const handleSortDone = (candidates) => { setSortedCandidates(candidates); setSelectedApp(null); setSubTab('huntsort'); };

  const jobStatus = job.status || (job.is_active ? 'live' : 'paused');
  const avgScore  = apps.length ? Math.round(apps.reduce((s, a) => s + (a.match_score || 0), 0) / apps.length) : 0;
  const counts    = apps.reduce((acc, a) => { const s = a.status || 'pending'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});
  const displayApps = subTab === 'huntsort' ? (sortedCandidates || []) : apps;
  const tabs = [
    ...(sortedCandidates ? [{ id: 'huntsort', label: `HUNT Sort (${sortedCandidates.length})` }] : []),
    { id: 'candidates', label: `All Candidates (${apps.length})` },
    { id: 'pipeline',   label: 'Pipeline' },
  ];

  return (
    <div>
      <CandidateProfileDrawer student={profileDrawerStudent} open={profileDrawerOpen} onClose={() => { setProfileDrawerOpen(false); setProfileDrawerStudent(null); }} />
      <button onClick={onBack} style={{ ...btnGhost(), marginBottom: 18, padding: '6px 12px' }}><ArrowLeft size={12} /> All roles</button>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CompanyLogo name={job.company} logoUrl={job.logo_url} startupLogoUrl={startupLogoUrl} size={52} />
            <div>
              <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 22, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{job.role}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '4px 0 0' }}>{job.company} · {job.location} · {job.stipend}</p>
              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 500, background: jobStatus === 'live' ? 'var(--green-tint)' : 'var(--amber-tint)', color: jobStatus === 'live' ? 'var(--green-text)' : 'var(--amber)', border: `1px solid ${jobStatus === 'live' ? 'var(--green)' : 'var(--amber)'}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{jobStatus === 'live' ? '● Live' : '⏸ Paused'}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
            {!loading && <HuntSortTrigger apps={apps} onSortDone={handleSortDone} />}
            <button onClick={() => onCopyLink(job)} style={btnGhost()}><Link2 size={12} /> Share</button>
            <button onClick={() => onEdit(job)} style={btnGhost()}><Edit2 size={12} /> Edit</button>
            <button onClick={() => onTogglePause(job)} style={btnGhost()}>{jobStatus === 'live' ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Resume</>}</button>
            <button onClick={() => { onDelete(job); onBack(); }} style={{ ...btnGhost(), color: 'var(--red)', borderColor: 'var(--red)' }}><Trash2 size={12} /> Delete</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[{ label: 'Applicants', val: apps.length }, { label: 'Avg score', val: `${avgScore}%` }, { label: 'Shortlisted', val: counts.shortlisted || 0 }, { label: 'Interviewing', val: counts.interview || 0 }].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
              <p style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 24, color: 'var(--text)', margin: 0, lineHeight: 1, fontWeight: 400 }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 18 }}>
        {tabs.map(t => {
          const isHuntSort = t.id === 'huntsort';
          const active = subTab === t.id;
          return (
            <button key={t.id} onClick={() => { setSubTab(t.id); setSelectedApp(null); }} style={{ padding: '10px 18px', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', background: 'transparent', border: 'none', borderBottom: `2px solid ${active ? (isHuntSort ? 'var(--green)' : 'var(--text)') : 'transparent'}`, color: active ? (isHuntSort ? 'var(--green)' : 'var(--text)') : 'var(--text-dim)', fontWeight: active ? 600 : 400, marginBottom: -1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
              {isHuntSort && <Sparkles size={12} style={{ color: active ? 'var(--green)' : 'var(--text-dim)' }} />}
              {t.label}
            </button>
          );
        })}
        {sortedCandidates && subTab === 'huntsort' && (
          <button onClick={() => { setSortedCandidates(null); setSubTab('candidates'); setSelectedApp(null); }} style={{ marginLeft: 'auto', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'inherit' }}>
            <X size={11} /> Clear sort
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 40, fontSize: 13 }}>Loading applicants…</p>
      ) : subTab === 'pipeline' ? (
        <RolePipelineView apps={apps} onStatusChange={handleStatusChange} showToast={showToast} onViewFull={(student) => { setProfileDrawerStudent(student); setProfileDrawerOpen(true); }} />
      ) : (
        displayApps.length === 0 ? (
          <EmptyState icon="🎯" title={subTab === 'huntsort' ? 'No candidates to rank.' : 'No applicants yet.'} message={subTab === 'huntsort' ? 'Run HUNT Sort when you have applicants.' : 'Share your role link to start receiving applications.'} />
        ) : subTab === 'huntsort' ? (
          <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '200px 1fr' : '1fr', gap: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ borderRight: selectedApp ? '1px solid var(--border)' : 'none' }}>
              {displayApps.map((app, i) => {
                const s = app.students || {};
                const isSelected = selectedApp?.id === app.id;
                return (
                  <div key={app.id} onClick={() => setSelectedApp(isSelected ? null : app)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', cursor: 'pointer', transition: 'background 0.12s', background: isSelected ? 'var(--green-tint)' : 'transparent', borderLeft: `3px solid ${isSelected ? 'var(--green)' : 'transparent'}`, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 13, color: isSelected ? 'var(--green)' : 'var(--text-dim)', fontWeight: 700, width: 20, flexShrink: 0 }}>{i + 1}</span>
                    <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name || 'Student'}</p>
                      <ScoreNumber score={app.match_score || 0} size={11} />
                    </div>
                    {app.status && app.status !== 'pending' && <StatusPill status={app.status} />}
                  </div>
                );
              })}
              <div style={{ padding: '10px 14px' }}>
                <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>Max 6 candidates per role. Skill-first, always.</p>
              </div>
            </div>
            {selectedApp ? (
              <HuntSortSnapshot app={selectedApp} onStatusChange={handleStatusChange} onClose={() => setSelectedApp(null)} onViewFull={(student) => { setProfileDrawerStudent(student); setProfileDrawerOpen(true); }} showToast={showToast} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>← Select a candidate to view their profile</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 380px' : '1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayApps.map((app, i) => (
                <ApplicantRow key={app.id} app={app} rank={i + 1} onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)} isSelected={selectedApp?.id === app.id} />
              ))}
            </div>
            {selectedApp && (
              <ApplicantSnapshot app={selectedApp} onStatusChange={handleStatusChange} onClose={() => setSelectedApp(null)} onViewFull={(student) => { setProfileDrawerStudent(student); setProfileDrawerOpen(true); }} />
            )}
          </div>
        )
      )}
    </div>
  );
}

export function ApplicantRow({ app, rank, onClick, isSelected, showRank = false }) {
  const s     = app.students || {};
  const score = app.match_score || 0;
  const huntScore = s._huntScore?.score ?? s.hunt_score ?? null;
  return (
    <div onClick={onClick} className="hn-card" style={{ border: isSelected ? `1.5px solid ${showRank ? 'var(--green)' : 'var(--text)'}` : '1px solid var(--border)', borderRadius: 10, padding: '13px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.15s', background: isSelected && showRank ? 'var(--green-tint)' : 'var(--bg-card)' }}>
      <span style={{ fontSize: 10, width: 22, flexShrink: 0, textAlign: 'center', fontFamily: "'Editorial New', Georgia, serif", color: showRank ? 'var(--green)' : 'var(--text-dim)', fontWeight: showRank ? 700 : 400 }}>#{rank}</span>
      <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{s.full_name || 'Student'}</p>
        <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.college || '—'} · Year {s.year || '?'}</p>
      </div>
      {huntScore !== null && <HuntScoreBadge score={huntScore} />}
      <ScoreNumber score={score} size={16} />
      <StatusPill status={app.status || 'pending'} />
    </div>
  );
}

export function RolePipelineView({ apps, onStatusChange, showToast, onViewFull }) {
  const [selectedApp, setSelectedApp] = useState(null);
  const stages = [
    { id: 'shortlisted', label: 'Shortlisted', color: 'var(--green)',  icon: Bookmark },
    { id: 'interview',   label: 'Interview',   color: 'var(--blue)',   icon: Phone },
    { id: 'hired',       label: 'Hired',       color: 'var(--purple)', icon: Award },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 1fr 1fr 380px' : 'repeat(3, 1fr)', gap: 12 }}>
      {stages.map(stage => {
        const candidates = apps.filter(a => a.status === stage.id);
        const Icon = stage.icon;
        return (
          <div key={stage.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, minHeight: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon size={13} style={{ color: stage.color }} /><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{stage.label}</span></div>
              <span style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 14, fontWeight: 400, color: stage.color, padding: '2px 7px', borderRadius: 8, background: 'var(--bg-subtle)' }}>{candidates.length}</span>
            </div>
            {candidates.length === 0 ? (
              <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', padding: '24px 0' }}>No candidates here.</p>
            ) : candidates.map(app => {
              const s = app.students || {};
              return (
                <div key={app.id} onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)} className="hn-card" style={{ padding: '9px 11px', borderRadius: 8, border: `1px solid ${selectedApp?.id === app.id ? 'var(--text)' : 'var(--border)'}`, background: 'var(--bg-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar name={s.full_name} avatarUrl={s.avatar_url} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name || 'Student'}</p>
                  </div>
                  <ScoreNumber score={app.match_score || 0} size={12} />
                </div>
              );
            })}
          </div>
        );
      })}
      {selectedApp && (
        <ApplicantSnapshot app={selectedApp} onStatusChange={async (id, status) => { await onStatusChange(id, status); setSelectedApp(s => ({ ...s, status })); }} onClose={() => setSelectedApp(null)} onViewFull={onViewFull} compact />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME TAB
