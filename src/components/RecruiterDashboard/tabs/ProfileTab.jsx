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
import { updateStartupProfile, updateRecruiterProfile } from '../services/recruiterApi';
import { PageHeader, SubTabStrip, FocusInput, FocusTextarea, Label, CompanyLogo, Avatar, btnPrimary, btnGhost } from '../shared/ui';

export function ProfileTab({ recruiter, onUpdate, showToast }) {
  const [subTab, setSubTab] = useState('startup');
  const isFounder = recruiter.role_in_company === 'founder';
  const startup   = recruiter.startups || {};
  const SUBTABS   = [{ id: 'startup', label: 'Startup' }, { id: 'recruiter', label: 'You' }];
  return (
    <div>
      <PageHeader eyebrow="Profile" title={<>Your <em>profile.</em></>} />
      <SubTabStrip tabs={SUBTABS} active={subTab} onChange={setSubTab} />
      {subTab === 'startup'   && <StartupProfileForm   startup={startup} recruiter={recruiter} canEdit={isFounder} onUpdate={onUpdate} showToast={showToast} />}
      {subTab === 'recruiter' && <RecruiterProfileForm recruiter={recruiter} onUpdate={onUpdate} showToast={showToast} />}
    </div>
  );
}

export function ProfileCard({ title, canEdit, children, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const handleSave = async () => { await onSave(); setEditing(false); };
  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${editing ? 'var(--border-mid)' : 'var(--border)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.15s' }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{title}</p>
        {canEdit && !editing && <button onClick={() => setEditing(true)} style={{ ...iconBtn, width: 28, height: 28, padding: 0, justifyContent: 'center' }} title="Edit"><Edit2 size={12} /></button>}
        {editing && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setEditing(false)} style={{ ...btnGhost(), padding: '5px 12px', fontSize: 11 }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary(saving), padding: '5px 12px', fontSize: 11 }}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        )}
      </div>
      <div style={{ padding: '18px 20px' }}>{children(editing)}</div>
    </div>
  );
}

export function StartupProfileForm({ startup, recruiter, canEdit, onUpdate, showToast }) {
  const [form, setForm] = useState({ name: startup.name || '', tagline: startup.tagline || '', about: startup.about || '', website: startup.website || '', industry: startup.industry || '', stage: startup.stage || '', team_size: startup.team_size || '', founded_year: startup.founded_year || '', hq_location: startup.hq_location || '', logo_url: startup.logo_url || '', banner_url: startup.banner_url || '' });
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(startup.logo_url || null);
  const [bannerPreview, setBannerPreview] = useState(startup.banner_url || null);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const handleLogoChange = (e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = ev => { setLogoPreview(ev.target.result); set('logo_url')(ev.target.result); }; r.readAsDataURL(file); };
  const handleBannerChange = (e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = ev => { setBannerPreview(ev.target.result); set('banner_url')(ev.target.result); }; r.readAsDataURL(file); };
  const saveAll = async () => {
    if (!startup.id) { showToast('No startup linked.', 'error'); throw new Error('No startup'); }
    setSaving(true);
    try { await updateStartupProfile(startup.id, form); showToast('Updated'); onUpdate(); }
    catch (e) { showToast(e.message || 'Failed', 'error'); throw e; }
    finally { setSaving(false); }
  };
  const infoRows = [{ key: 'website', label: 'Website', ph: 'https://…' }, { key: 'hq_location', label: 'HQ Location', ph: 'Bangalore, India' }, { key: 'industry', label: 'Industry', ph: 'HR Tech / EdTech / SaaS' }, { key: 'founded_year', label: 'Founded', ph: '2024', type: 'number' }];
  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!canEdit && (<div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'var(--amber-tint)', border: '1px solid var(--amber)' }}><Lock size={13} style={{ color: 'var(--amber)', flexShrink: 0 }} /><p style={{ fontSize: 11, color: 'var(--amber)', margin: 0 }}>Read-only. Only founders can edit the startup profile.</p></div>)}
      <ProfileCard title="Brand" canEdit={canEdit} onSave={saveAll} saving={saving}>
        {(editing) => (
          <div>
            <div style={{ position: 'relative', height: 120, borderRadius: 10, overflow: 'hidden', background: bannerPreview ? 'transparent' : 'linear-gradient(135deg, var(--bg-subtle), var(--border))', marginBottom: 0 }}>
              {bannerPreview ? <img src={bannerPreview} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' }}>No banner</p></div>}
              {editing && (<label style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, cursor: 'pointer', backdropFilter: 'blur(4px)' }}><Camera size={11} /> Change banner<input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} /></label>)}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: -28, paddingLeft: 16, marginBottom: 14 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {logoPreview ? <img src={logoPreview} alt="logo" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '3px solid var(--bg-card)' }} /> : <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--bg-subtle)', border: '3px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--text-mid)' }}>{(form.name || '?').slice(0, 2).toUpperCase()}</div>}
                {editing && (<label style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: '50%', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)' }}><Camera size={10} style={{ color: 'var(--bg)' }} /><input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} /></label>)}
              </div>
              {!editing && (<div style={{ paddingBottom: 2 }}><p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{form.name || <em style={{ color: 'var(--text-dim)' }}>Startup name</em>}</p><p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>{form.tagline || <span style={{ fontStyle: 'italic' }}>No tagline</span>}</p></div>)}
            </div>
            {editing && (<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}><div><Label required>Startup name</Label><FocusInput value={form.name} onChange={e => set('name')(e.target.value)} placeholder="HUNT Labs" /></div><div><Label>Tagline</Label><FocusInput value={form.tagline} onChange={e => set('tagline')(e.target.value)} placeholder="Skill-first internships" /></div></div>)}
          </div>
        )}
      </ProfileCard>
      <ProfileCard title="Basic Info" canEdit={canEdit} onSave={saveAll} saving={saving}>
        {(editing) => editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {infoRows.map(({ key, label, ph, type }) => (<div key={key}><Label>{label}</Label><FocusInput type={type || 'text'} value={form[key]} onChange={e => set(key)(e.target.value)} placeholder={ph} /></div>))}
            <div><Label>Stage</Label><FocusSelect value={form.stage} onChange={e => set('stage')(e.target.value)}><option value="">—</option><option>Pre-seed</option><option>Seed</option><option>Series A</option><option>Series B</option><option>Bootstrapped</option></FocusSelect></div>
            <div><Label>Team size</Label><FocusSelect value={form.team_size} onChange={e => set('team_size')(e.target.value)}><option value="">—</option><option>1-10</option><option>11-50</option><option>51-200</option><option>200+</option></FocusSelect></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[{ label: 'Website', val: form.website }, { label: 'HQ Location', val: form.hq_location }, { label: 'Industry', val: form.industry }, { label: 'Founded', val: form.founded_year }, { label: 'Stage', val: form.stage }, { label: 'Team size', val: form.team_size }].map(({ label, val: v }) => (<div key={label}><p style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</p><p style={{ fontSize: 13, color: v ? 'var(--text)' : 'var(--text-dim)', margin: 0, fontStyle: v ? 'normal' : 'italic' }}>{v || 'Not set'}</p></div>))}
          </div>
        )}
      </ProfileCard>
      <ProfileCard title="About" canEdit={canEdit} onSave={saveAll} saving={saving}>
        {(editing) => editing ? <FocusTextarea value={form.about} onChange={e => set('about')(e.target.value)} rows={4} placeholder="What does your startup do? What problems do you solve?" /> : <p style={{ fontSize: 13, color: form.about ? 'var(--text-mid)' : 'var(--text-dim)', lineHeight: 1.7, margin: 0, fontStyle: form.about ? 'normal' : 'italic' }}>{form.about || 'No description yet. Add one to help candidates understand your company.'}</p>}
      </ProfileCard>
    </div>
  );
}

export function RecruiterProfileForm({ recruiter, onUpdate, showToast }) {
  const [form, setForm] = useState({ contact_name: recruiter.contact_name || '', email: recruiter.email || '', phone: recruiter.phone || '', title: recruiter.title || '', linkedin_url: recruiter.linkedin_url || '', bio: recruiter.bio || '', role_in_company: recruiter.role_in_company || 'recruiter' });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const save = async () => {
    setSaving(true);
    try { await updateRecruiterProfile(recruiter.id, form); showToast('Profile updated'); onUpdate(); }
    catch (e) { showToast(e.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };
  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ProfileCard title="Your Profile" canEdit={true} onSave={save} saving={saving}>
        {(editing) => (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: editing ? 18 : 0, paddingBottom: editing ? 16 : 0, borderBottom: editing ? '1px solid var(--border)' : 'none' }}>
              <Avatar name={form.contact_name} size={46} />
              <div>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 17, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{form.contact_name || 'Your name'}</p>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>{form.title || <span style={{ fontStyle: 'italic' }}>No title</span>} · {recruiter.startups?.name || 'your startup'}</p>
              </div>
            </div>
            {editing && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><Label required>Full name</Label><FocusInput value={form.contact_name} onChange={e => set('contact_name')(e.target.value)} /></div>
                <div><Label>Title</Label><FocusInput value={form.title} onChange={e => set('title')(e.target.value)} placeholder="Head of Talent" /></div>
                <div><Label>Email</Label><FocusInput value={form.email} disabled type="email" /></div>
                <div><Label>Phone</Label><FocusInput value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="+91…" /></div>
                <div><Label>LinkedIn</Label><FocusInput value={form.linkedin_url} onChange={e => set('linkedin_url')(e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
                <div><Label>Role in company</Label><FocusSelect value={form.role_in_company} onChange={e => set('role_in_company')(e.target.value)}><option value="founder">Founder</option><option value="hiring_manager">Hiring manager</option><option value="recruiter">Recruiter</option></FocusSelect></div>
              </div>
            )}
            {!editing && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                {[{ label: 'Phone', val: form.phone }, { label: 'Email', val: form.email }, { label: 'LinkedIn', val: form.linkedin_url ? 'Connected' : null }, { label: 'Role', val: form.role_in_company }].map(({ label, val: v }) => v ? (<div key={label}><p style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</p><p style={{ fontSize: 13, color: 'var(--text)', margin: 0, textTransform: label === 'Role' ? 'capitalize' : 'none' }}>{v}</p></div>) : null)}
              </div>
            )}
          </div>
        )}
      </ProfileCard>
      <ProfileCard title="Bio" canEdit={true} onSave={save} saving={saving}>
        {(editing) => editing ? <FocusTextarea value={form.bio} onChange={e => set('bio')(e.target.value)} rows={3} placeholder="Short intro that candidates will see when you reach out." /> : <p style={{ fontSize: 13, color: form.bio ? 'var(--text-mid)' : 'var(--text-dim)', lineHeight: 1.7, margin: 0, fontStyle: form.bio ? 'normal' : 'italic' }}>{form.bio || 'No bio yet. Candidates see this when you reach out.'}</p>}
      </ProfileCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════════════════
