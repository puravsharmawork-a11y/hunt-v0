import React from 'react';
import {
  Plus, LogOut, Sun, Moon, X, ChevronRight,
  MapPin, Users, Link2, Trash2,
  ArrowLeft, Pause, Play, ExternalLink, Github, Building2, Home,
  Layers, UserCheck, GitBranch, Sparkles,
  Bookmark, ThumbsDown, Phone, Award, Bell, Lock, MessageSquare,
  LayoutGrid, List, Edit2, Camera, Image as ImageIcon, ChevronDown,
  CheckCircle, Clock, AlertCircle, Eye, AlertTriangle, Star,
} from 'lucide-react';
import { CompanyLogo, EmptyState, btnPrimary } from '../shared/ui';

export function HomeTab({ recruiter, jobs, allApps, onPostRole, onOpenRole }) {
  const liveJobs    = jobs.filter(j => (j.status || (j.is_active ? 'live' : 'paused')) === 'live');
  const totalApps   = allApps.length;
  const shortlisted = allApps.filter(a => a.status === 'shortlisted').length;
  const hired       = allApps.filter(a => a.status === 'hired').length;
  const recentJobs  = [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  const firstName   = recruiter.contact_name?.split(' ')[0] || 'recruiter';
  const startupName = recruiter.startups?.name || recruiter.company_name || 'there';
  const startupLogoUrl = recruiter.startups?.logo_url || '';

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>Home</p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>Welcome back, <em>{firstName}.</em></h1>
        <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 8 }}>Here's what's happening at {startupName}.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 36 }}>
        {[{ label: 'Live roles', val: liveJobs.length }, { label: 'Applicants', val: totalApps }, { label: 'Shortlisted', val: shortlisted }, { label: 'Hired', val: hired }].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, color: 'var(--text)', margin: 0, lineHeight: 1, fontWeight: 400 }}>{s.val}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Recent roles</h3>
        <button onClick={onPostRole} style={{ ...btnPrimary(false), padding: '7px 12px', fontSize: 11 }}><Plus size={12} /> Post a role</button>
      </div>
      {recentJobs.length === 0 ? (
        <EmptyState icon="📋" title="No roles posted yet." message="Post your first role to start receiving matched candidates." cta={<button onClick={onPostRole} style={{ ...btnPrimary(false), margin: '0 auto' }}><Plus size={13} /> Post a role</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {recentJobs.map(job => {
            const filled = (job.current_applicants || 0) / (job.max_applicants || 50);
            const status = job.status || (job.is_active ? 'live' : 'paused');
            const statusStyle = status === 'live' ? { color: 'var(--green-text)', bg: 'var(--green-tint)', border: 'var(--green)', label: '● Live' } : { color: 'var(--amber)', bg: 'var(--amber-tint)', border: 'var(--amber)', label: '⏸ Paused' };
            const jobApps = allApps.filter(a => a.job_id === job.id);
            return (
              <div key={job.id} onClick={() => onOpenRole(job)} className="hn-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CompanyLogo name={job.company} logoUrl={job.logo_url} startupLogoUrl={startupLogoUrl} size={36} />
                    <div>
                      <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 14, fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.25 }}>{job.role}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3 }}>{job.stipend} · {job.duration}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 8, fontWeight: 500, background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, whiteSpace: 'nowrap', flexShrink: 0 }}>{statusStyle.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'var(--text-mid)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {job.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={10} /> {job.current_applicants || 0} applied</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(filled, 1) * 100}%`, background: filled > 0.8 ? 'var(--red)' : filled > 0.5 ? 'var(--amber)' : 'var(--green)', borderRadius: 2 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{jobApps.length} applicant{jobApps.length !== 1 ? 's' : ''}</span>
                  <ChevronRight size={13} style={{ color: 'var(--text-dim)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLES TAB
// ═══════════════════════════════════════════════════════════════════════════
