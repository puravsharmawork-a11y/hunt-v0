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
import { useNavigate } from 'react-router-dom';
import { signOut } from '../../services/supabase';
import { applyTokens } from './theme/tokens';
import { NAV_ITEMS } from './constants';
import { getRecruiterProfile, getRecruiterJobs, getAllApplicationsForRecruiter, updateJob, deleteJob, updateApplicationStatus } from './services/recruiterApi';
import { Toast } from './shared/ui';
import { NotificationDrawer } from './layout/NotificationDrawer';
import { SettingsModal } from './layout/SettingsModal';
import { PostRoleDrawer } from './roles/PostRoleDrawer';
import { HomeTab } from './tabs/HomeTab';
import { RolesTab } from './tabs/RolesTab';
import { ProfileTab } from './tabs/ProfileTab';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme]             = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [loading, setLoading]         = useState(true);
  const [recruiter, setRecruiter]     = useState(null);
  const [jobs, setJobs]               = useState([]);
  const [allApps, setAllApps]         = useState([]);
  const [activeTab, setActiveTab]     = useState('home');
  const [toast, setToast]             = useState(null);
  const [showAccountMenu, setShowAccountMenu]   = useState(false);
  const [showSettings, setShowSettings]         = useState(false);
  const [showPostDrawer, setShowPostDrawer]     = useState(false);
  const [editJob, setEditJob]                   = useState(null);
  const [pendingOpenRole, setPendingOpenRole]   = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => { applyTokens(theme); localStorage.setItem('hunt-theme', theme); }, [theme]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await getRecruiterProfile();
        if (!r) { navigate('/recruiter/onboarding'); return; }
        setRecruiter(r);
        const j = await getRecruiterJobs(r.id);
        setJobs(j);
        try {
          const a = await getAllApplicationsForRecruiter(r.id);
          setAllApps(a);
        } catch (appErr) {
          console.warn('Applications load failed (non-fatal):', appErr);
        }
      } catch (e) {
        console.error('Dashboard load failed:', e);
        showToast(e.message || 'Failed to load dashboard', 'error');
      } finally { setLoading(false); }
    })();
  }, []);

  const refreshAll = async () => {
    if (!recruiter) return;
    const j = await getRecruiterJobs(recruiter.id);
    setJobs(j);
    try { const a = await getAllApplicationsForRecruiter(recruiter.id); setAllApps(a); }
    catch (e) { console.warn('Apps refresh failed:', e); }
  };
  const refreshRecruiter = async () => { const r = await getRecruiterProfile(); setRecruiter(r); };

  const handleOpenRole = (job) => { setPendingOpenRole(job); setActiveTab('roles'); };
  const handleTogglePause = async (job) => {
    const status = job.status || (job.is_active ? 'live' : 'paused');
    const next   = status === 'live' ? 'paused' : 'live';
    try {
      await updateJob(job.id, { status: next, is_active: next === 'live' });
      setJobs(j => j.map(x => x.id === job.id ? { ...x, status: next, is_active: next === 'live' } : x));
      showToast(next === 'live' ? 'Role resumed' : 'Role paused');
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  };
  const handleCopyLink = (job) => { const url = `${window.location.origin}/apply/${job.share_slug}`; navigator.clipboard.writeText(url).then(() => showToast('Share link copied')); };
  const handleDelete = async (job) => {
    if (!window.confirm(`Delete "${job.role}"? This cannot be undone.`)) return;
    try { await deleteJob(job.id); setJobs(j => j.filter(x => x.id !== job.id)); showToast('Role deleted'); }
    catch (e) { showToast(e.message || 'Delete failed', 'error'); }
  };
  const handleEdit = (job) => { setEditJob(job); setShowPostDrawer(true); };
  const handleStatusChange = async (appId, status) => {
    const app = allApps.find(a => a.id === appId);
    try {
      await updateApplicationStatus(appId, status, app?.students?.id, { role: app?.jobs?.role, company: app?.jobs?.company || recruiter?.startups?.name });
      setAllApps(a => a.map(x => x.id === appId ? { ...x, status } : x));
      const labels = { shortlisted: 'Shortlisted ✓', interview: 'Moved to interview', hired: 'Hired! 🎉', rejected: 'Passed', pending: 'Status cleared' };
      showToast(labels[status] || 'Updated');
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  };
  const handleSignOut = async () => {
    try { await signOut(); navigate('/'); } catch (e) { console.error(e); }
  };

  const unreadCount = allApps.filter(a => a.status === 'pending').length;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--text)', marginBottom: 20 }}>HUNT</div>
        <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Loading dashboard…</p>
      </div>
    </div>
  );

  if (!recruiter) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
        <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 8, fontWeight: 400 }}>Finish setting up your account</p>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>We couldn't find your recruiter profile. Please complete onboarding.</p>
      </div>
    </div>
  );

  const initials = recruiter.contact_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @keyframes fadeDown { from { opacity:0; transform: translateX(-50%) translateY(-6px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        @keyframes hunt-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        button:disabled { opacity: 0.5; }
        .hn-item:hover { background: var(--bg-subtle) !important; }
        .hn-card:hover { border-color: var(--border-mid) !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-dim); }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {showSettings && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} onSignOut={handleSignOut} />}
      <NotificationDrawer open={showNotifications} onClose={() => setShowNotifications(false)} recruiter={recruiter} />

      {recruiter && (
        <PostRoleDrawer recruiter={recruiter} open={showPostDrawer} editJob={editJob}
          onClose={() => { setShowPostDrawer(false); setEditJob(null); }}
          showToast={showToast}
          onSuccess={async () => {
            const wasEdit = !!editJob;
            setEditJob(null);
            await refreshAll();
            showToast(wasEdit ? 'Role updated!' : 'Role posted! 🚀');
            setPendingOpenRole(null);
            setActiveTab('roles');
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside style={{ width: 210, flexShrink: 0, height: '100vh', position: 'sticky', top: 0, borderRight: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--text)' }}>HUNT</span>
        </div>
        <nav style={{ padding: '10px 8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <button onClick={() => setShowPostDrawer(true)} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', marginBottom: 8, background: 'var(--text)', color: 'var(--bg)', fontSize: 12, fontWeight: 600, textAlign: 'left', fontFamily: 'inherit', transition: 'opacity 0.12s' }}>
            <Plus size={14} style={{ flexShrink: 0 }} /> Post a role
          </button>
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 8px' }} />
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} className="hn-item" onClick={() => { setActiveTab(id); if (id !== 'roles') setPendingOpenRole(null); }} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', marginBottom: 1, background: active ? 'var(--bg-subtle)' : 'transparent', color: active ? 'var(--text)' : 'var(--text-dim)', fontSize: 13, fontWeight: active ? 600 : 400, textAlign: 'left', transition: 'background 0.12s, color 0.12s', fontFamily: 'inherit' }}>
                <Icon size={15} style={{ flexShrink: 0 }} />{label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)', position: 'relative' }}>
          <div style={{ padding: '9px 11px', borderRadius: 7, background: 'var(--bg-subtle)', marginBottom: 8 }}>
            <p style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Company</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{recruiter.startups?.name || recruiter.company_name || 'Your startup'}</p>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: '0 2px', marginBottom: 6 }}>
            <button className="hn-item" onClick={() => setShowNotifications(true)} style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 7, borderRadius: 6, color: 'var(--text-dim)' }}>
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <Bell size={13} />
                {unreadCount > 0 && <span style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', border: '1.5px solid var(--bg-card)' }} />}
              </span>
            </button>
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="hn-item" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 7, borderRadius: 6, color: 'var(--text-dim)' }}>
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </button>
          </div>
          <div onClick={() => setShowAccountMenu(p => !p)} className="hn-item" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 11px', borderRadius: 7, cursor: 'pointer', transition: 'background 0.12s' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: 'var(--green-tint)', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--green)' }}>{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{recruiter.contact_name}</p>
              <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0, textTransform: 'capitalize' }}>{recruiter.role_in_company || 'Recruiter'}</p>
            </div>
            <ChevronDown size={10} style={{ flexShrink: 0, color: 'var(--text-dim)', transform: showAccountMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </div>
          {showAccountMenu && (
            <>
              <div onClick={() => setShowAccountMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 499 }} />
              <div style={{ position: 'absolute', bottom: '100%', left: 8, right: 8, marginBottom: 6, zIndex: 500, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 1 }}>Signed in as</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{recruiter.email || recruiter.contact_name}</p>
                </div>
                {[
                  { label: 'Profile',  action: () => { setActiveTab('profile');  setShowAccountMenu(false); } },
                  { label: 'Settings', action: () => { setShowSettings(true);    setShowAccountMenu(false); } },
                  { label: 'Support',  action: () => { window.open('mailto:support@hunt.so'); setShowAccountMenu(false); } },
                ].map(item => (
                  <button key={item.label} onClick={item.action} className="hn-item" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 12, color: 'var(--text-mid)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{item.label}</button>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', padding: '6px' }}>
                  <button onClick={handleSignOut} className="hn-item" style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 7, fontSize: 12, color: 'var(--red)', background: 'var(--red-tint)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                    <LogOut size={12} /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', maxHeight: '100vh' }}>
        <div style={{ padding: '32px 40px 80px', maxWidth: 1280, margin: '0 auto', animation: 'hunt-fade-in 0.3s ease' }}>
          {activeTab === 'home'    && <HomeTab recruiter={recruiter} jobs={jobs} allApps={allApps} onPostRole={() => setShowPostDrawer(true)} onOpenRole={handleOpenRole} />}
          {activeTab === 'roles'   && <RolesTab key={jobs.length} jobs={jobs} onCopyLink={handleCopyLink} onTogglePause={handleTogglePause} onDelete={handleDelete} onEdit={handleEdit} onPostRole={() => setShowPostDrawer(true)} recruiter={recruiter} showToast={showToast} initialOpenJob={pendingOpenRole} />}
          {activeTab === 'profile' && <ProfileTab recruiter={recruiter} onUpdate={refreshRecruiter} showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

