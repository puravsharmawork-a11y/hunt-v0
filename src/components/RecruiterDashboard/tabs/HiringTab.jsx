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
import { PageHeader, EmptyState } from '../shared/ui';
import { CandidateProfileDrawer } from '../candidates/CandidateProfileDrawer';
import { RolePipelineView } from '../roles/RoleViews';

export function HiringTab({ allApps, jobs, onStatusChange }) {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [profileDrawerOpen, setProfileDrawerOpen]     = useState(false);
  const [profileDrawerStudent, setProfileDrawerStudent] = useState(null);

  const jobsWithApps = jobs.map(j => ({ ...j, apps: allApps.filter(a => a.job_id === j.id) })).filter(j => j.apps.length > 0);
  const selectedJob = selectedJobId ? jobsWithApps.find(j => j.id === selectedJobId) : null;

  return (
    <div>
      <CandidateProfileDrawer student={profileDrawerStudent} open={profileDrawerOpen} onClose={() => { setProfileDrawerOpen(false); setProfileDrawerStudent(null); }} />
      <PageHeader eyebrow="Pipeline" title={<>Hiring <em>pipeline.</em></>} subtitle="Track candidates through your hiring process, by role." />
      {jobsWithApps.length === 0 ? (
        <EmptyState icon="🎯" title="No candidates in pipeline yet." message="Candidates who apply to your roles will appear here." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '260px 1fr' : '1fr', gap: 16 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Select role</p>
            {jobsWithApps.map(job => (
              <button key={job.id} onClick={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 10, marginBottom: 6, border: `1px solid ${selectedJobId === job.id ? 'var(--text)' : 'var(--border)'}`, background: selectedJobId === job.id ? 'var(--bg-subtle)' : 'var(--bg-card)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '1px 0 0' }}>{job.apps.length} applicant{job.apps.length !== 1 ? 's' : ''}</p>
                </div>
                <ChevronRight size={12} style={{ color: 'var(--text-dim)', flexShrink: 0, transform: selectedJobId === job.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>
            ))}
          </div>
          {selectedJob && <div><RolePipelineView apps={selectedJob.apps} onStatusChange={onStatusChange} onViewFull={(student) => { setProfileDrawerStudent(student); setProfileDrawerOpen(true); }} /></div>}
          {!selectedJob && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, border: '2px dashed var(--border)', borderRadius: 14 }}><p style={{ fontSize: 13, color: 'var(--text-dim)' }}>← Select a role to view its pipeline</p></div>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE TAB
// ═══════════════════════════════════════════════════════════════════════════
