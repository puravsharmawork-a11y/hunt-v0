import React, { useState, useEffect } from 'react';
import {
  Plus, LogOut, Sun, Moon, X, ChevronRight,
  MapPin, Users, Link2, Trash2,
  ArrowLeft, Pause, Play, ExternalLink, Github, Building2, Home,
  Layers, UserCheck, GitBranch, Sparkles,
  Bookmark, ThumbsDown, Phone, Award, Bell, Lock, MessageSquare,
  LayoutGrid, List, Edit2, Camera, Image as ImageIcon, ChevronDown,
  CheckCircle, Clock, AlertCircle, Eye, AlertTriangle, Star,
} from 'lucide-react';
import { PageHeader, SubTabStrip, EmptyState, btnPrimary } from '../shared/ui';
import { RoleCard, RoleDetailView } from '../roles/RoleViews';

export function RolesTab({ jobs, onCopyLink, onTogglePause, onDelete, onPostRole, onEdit, recruiter, showToast, initialOpenJob }) {
  const [subTab, setSubTab] = useState('live');
  const [openJob, setOpenJob] = useState(initialOpenJob || null);
  const startupLogoUrl = recruiter?.startups?.logo_url || '';

  useEffect(() => {
    if (initialOpenJob) setOpenJob(initialOpenJob);
    else setOpenJob(null);
  }, [initialOpenJob]);

  const grouped = {
    live:   jobs.filter(j => (j.status || (j.is_active ? 'live' : 'paused')) === 'live'),
    paused: jobs.filter(j => (j.status || (j.is_active ? 'live' : 'paused')) === 'paused'),
    closed: jobs.filter(j => j.status === 'closed'),
  };
  const SUBTABS = [
    { id: 'live',   label: `Live (${grouped.live.length})` },
    { id: 'paused', label: `Paused (${grouped.paused.length})` },
    { id: 'closed', label: `Closed (${grouped.closed.length})` },
  ];

  if (openJob) return (
    <RoleDetailView job={openJob} onBack={() => setOpenJob(null)} onCopyLink={onCopyLink} onEdit={(job) => { onEdit(job); }} onTogglePause={onTogglePause} onDelete={onDelete} recruiter={recruiter} showToast={showToast} />
  );

  return (
    <div>
      <PageHeader eyebrow="Roles" title={<>Manage your <em>roles.</em></>} action={<button onClick={onPostRole} style={{ ...btnPrimary(false), padding: '10px 16px' }}><Plus size={13} /> Post a role</button>} />
      <SubTabStrip tabs={SUBTABS} active={subTab} onChange={setSubTab} />
      {grouped[subTab].length === 0 ? (
        <EmptyState icon={subTab === 'live' ? '📋' : subTab === 'paused' ? '⏸' : '✕'} title={`No ${subTab} roles.`} message={subTab === 'live' ? 'Post your first role to start receiving matched candidates.' : `Roles you ${subTab === 'paused' ? 'pause' : 'close'} will appear here.`} cta={subTab === 'live' && <button onClick={onPostRole} style={{ ...btnPrimary(false), margin: '0 auto' }}><Plus size={13} /> Post a role</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {grouped[subTab].map(job => (
            <RoleCard key={job.id} job={job} startupLogoUrl={startupLogoUrl} onClick={() => setOpenJob(job)} onTogglePause={onTogglePause} onCopyLink={onCopyLink} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HIRING TAB
// ═══════════════════════════════════════════════════════════════════════════
