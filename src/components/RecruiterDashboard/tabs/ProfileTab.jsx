import React, { useState } from 'react';
import {
  Camera, CheckCircle, Edit2, ExternalLink, Link2, Lock, Plus, Trash2, X,
} from 'lucide-react';
import { updateStartupProfile, updateRecruiterProfile } from '../services/recruiterApi';
import {
  PageHeader,
  SubTabStrip,
  FocusInput,
  FocusTextarea,
  FocusSelect,
  Label,
  Avatar,
  btnPrimary,
  btnGhost,
  iconBtn,
} from '../shared/ui';

const TECH_OPTIONS = ['React', 'Next.js', 'Node.js', 'Go', 'Python', 'PostgreSQL', 'Supabase', 'AWS', 'Docker', 'Figma'];
const CULTURE_OPTIONS = ['Async-first', 'Flat hierarchy', 'High ownership', 'Remote-friendly', 'Fast-paced', 'Mentorship-heavy', 'Customer-obsessed'];
const REVENUE_STAGES = ['', 'Pre-revenue', 'Ramen profitable', 'Growing'];
const EMPTY_FOUNDER = { name: '', role: '', background: '', linkedin_url: '' };

const grid2 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
};

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeFounders(founders) {
  return toArray(founders).map(f => ({
    name: f?.name || '',
    role: f?.role || '',
    background: f?.background || '',
    linkedin_url: f?.linkedin_url || '',
  }));
}

function fieldValue(value) {
  return value || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Not set</span>;
}

function ReadField({ label, value, link }) {
  const content = link && value ? (
    <a href={value} target="_blank" rel="noreferrer" style={{ color: 'var(--text)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      Open <ExternalLink size={11} />
    </a>
  ) : fieldValue(value);

  return (
    <div>
      <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 13, color: value ? 'var(--text)' : 'var(--text-dim)', margin: 0, overflowWrap: 'anywhere' }}>{content}</p>
    </div>
  );
}

function ChipList({ value, options, onChange, editing }) {
  const selected = toArray(value);
  const toggle = item => {
    onChange(selected.includes(item) ? selected.filter(x => x !== item) : [...selected, item]);
  };

  if (!editing) {
    if (!selected.length) return <p style={{ fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic', margin: 0 }}>No tags yet</p>;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {selected.map(item => <span key={item} style={chipStyle(true)}>{item}</span>)}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {options.map(item => {
        const active = selected.includes(item);
        return (
          <button key={item} type="button" onClick={() => toggle(item)} style={{ ...chipStyle(active), cursor: 'pointer', fontFamily: 'inherit' }}>
            {active && <CheckCircle size={11} />} {item}
          </button>
        );
      })}
    </div>
  );
}

function chipStyle(active) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '5px 10px',
    borderRadius: 999,
    border: `1px solid ${active ? 'var(--green)' : 'var(--border)'}`,
    background: active ? 'var(--green-tint)' : 'var(--bg-subtle)',
    color: active ? 'var(--green-text)' : 'var(--text-mid)',
    fontSize: 11,
    fontWeight: 500,
  };
}

function FounderList({ founders, editing, onChange }) {
  const list = normalizeFounders(founders);
  const updateFounder = (index, key, value) => {
    onChange(list.map((founder, i) => i === index ? { ...founder, [key]: value } : founder));
  };
  const removeFounder = index => onChange(list.filter((_, i) => i !== index));

  if (!editing) {
    if (!list.filter(f => f.name || f.role || f.background).length) {
      return <p style={{ fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic', margin: 0 }}>No founders added yet.</p>;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.filter(f => f.name || f.role || f.background).map((founder, index) => (
          <div key={`${founder.name}-${index}`} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-subtle)' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{founder.name || 'Founder'}{founder.role ? `, ${founder.role}` : ''}</p>
            <p style={{ fontSize: 12, color: 'var(--text-mid)', margin: '4px 0 0', lineHeight: 1.5 }}>{founder.background || 'Background not added'}</p>
            {founder.linkedin_url && (
              <a href={founder.linkedin_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 11, color: 'var(--green)', textDecoration: 'none' }}>
                LinkedIn <ExternalLink size={10} />
              </a>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(list.length ? list : [{ ...EMPTY_FOUNDER }]).map((founder, index) => (
        <div key={index} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Founder {index + 1}</p>
            <button type="button" onClick={() => removeFounder(index)} style={{ ...iconBtn, padding: 5 }} title="Remove founder"><Trash2 size={12} /></button>
          </div>
          <div style={grid2}>
            <div><Label>Name</Label><FocusInput value={founder.name} onChange={e => updateFounder(index, 'name', e.target.value)} placeholder="Aarav Mehta" /></div>
            <div><Label>Role</Label><FocusInput value={founder.role} onChange={e => updateFounder(index, 'role', e.target.value)} placeholder="Co-founder and CEO" /></div>
            <div><Label>Background</Label><FocusInput value={founder.background} onChange={e => updateFounder(index, 'background', e.target.value)} placeholder="ex-Razorpay, IIT Bombay" /></div>
            <div><Label>LinkedIn URL</Label><FocusInput value={founder.linkedin_url} onChange={e => updateFounder(index, 'linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...list, { ...EMPTY_FOUNDER }])} style={{ ...btnGhost(), width: 'fit-content' }}><Plus size={12} /> Add founder</button>
    </div>
  );
}

function CommitmentToggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        width: '100%',
        padding: 14,
        borderRadius: 10,
        border: `1px solid ${checked ? 'var(--green)' : 'var(--border)'}`,
        background: checked ? 'var(--green-tint)' : 'var(--bg-subtle)',
        color: 'var(--text)',
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
      }}
    >
      <span>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>Respond within 48 hours</span>
        <span style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginTop: 3 }}>Adds a visible badge on your role cards.</span>
      </span>
      <span style={{
        width: 38,
        height: 21,
        borderRadius: 999,
        padding: 2,
        background: checked ? 'var(--green)' : 'var(--border)',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}>
        <span style={{
          display: 'block',
          width: 17,
          height: 17,
          borderRadius: '50%',
          background: '#fff',
          transform: checked ? 'translateX(17px)' : 'translateX(0)',
          transition: 'transform 0.15s',
        }} />
      </span>
    </button>
  );
}

export function ProfileTab({ recruiter, onUpdate, showToast }) {
  const [subTab, setSubTab] = useState('startup');
  const isFounder = recruiter.role_in_company === 'founder';
  const startup = recruiter.startups || {};
  const SUBTABS = [{ id: 'startup', label: 'Startup' }, { id: 'recruiter', label: 'You' }];

  return (
    <div>
      <PageHeader eyebrow="Profile" title={<>Your <em>profile.</em></>} />
      <SubTabStrip tabs={SUBTABS} active={subTab} onChange={setSubTab} />
      {subTab === 'startup' && <StartupProfileForm startup={startup} canEdit={isFounder} onUpdate={onUpdate} showToast={showToast} />}
      {subTab === 'recruiter' && <RecruiterProfileForm recruiter={recruiter} onUpdate={onUpdate} showToast={showToast} />}
    </div>
  );
}

export function ProfileCard({ title, canEdit, children, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const handleSave = async () => { await onSave(); setEditing(false); };

  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${editing ? 'var(--border-mid)' : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.15s' }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{title}</p>
        {canEdit && !editing && <button onClick={() => setEditing(true)} style={{ ...iconBtn, width: 28, height: 28, padding: 0 }} title="Edit"><Edit2 size={12} /></button>}
        {editing && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setEditing(false)} style={{ ...btnGhost(), padding: '5px 12px', fontSize: 11 }}><X size={11} /> Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary(saving), padding: '5px 12px', fontSize: 11 }}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        )}
      </div>
      <div style={{ padding: '18px 20px' }}>{children(editing)}</div>
    </div>
  );
}

export function StartupProfileForm({ startup, canEdit, onUpdate, showToast }) {
  const [form, setForm] = useState({
    name: startup.name || '',
    tagline: startup.tagline || '',
    one_line_pitch: startup.one_line_pitch || '',
    about: startup.about || '',
    why_join: startup.why_join || '',
    website: startup.website || '',
    industry: startup.industry || '',
    stage: startup.stage || '',
    team_size: startup.team_size || '',
    founded_year: startup.founded_year || '',
    hq_location: startup.hq_location || '',
    logo_url: startup.logo_url || '',
    banner_url: startup.banner_url || '',
    twitter_url: startup.twitter_url || '',
    linkedin_url: startup.linkedin_url || '',
    product_hunt_url: startup.product_hunt_url || '',
    accelerator: startup.accelerator || '',
    tech_stack: toArray(startup.tech_stack),
    culture_tags: toArray(startup.culture_tags),
    traction_users: startup.traction_users || '',
    revenue_stage: startup.revenue_stage || '',
    backed_by: startup.backed_by || '',
    press_mentions: startup.press_mentions || '',
    founders: normalizeFounders(startup.founders),
  });
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(startup.logo_url || null);
  const [bannerPreview, setBannerPreview] = useState(startup.banner_url || null);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleImageChange = (key, setPreview) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPreview(ev.target.result);
      set(key)(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const saveAll = async () => {
    if (!startup.id) { showToast('No startup linked.', 'error'); throw new Error('No startup'); }
    setSaving(true);
    const cleaned = {
      ...form,
      founders: normalizeFounders(form.founders).filter(f => f.name || f.role || f.background || f.linkedin_url),
    };
    try {
      await updateStartupProfile(startup.id, cleaned);
      showToast('Startup profile updated');
      onUpdate();
    } catch (e) {
      showToast(e.message || 'Failed', 'error');
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!canEdit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'var(--amber-tint)', border: '1px solid var(--amber)' }}>
          <Lock size={13} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          <p style={{ fontSize: 11, color: 'var(--amber)', margin: 0 }}>Read-only. Only founders can edit the startup profile.</p>
        </div>
      )}

      <ProfileCard title="Brand" canEdit={canEdit} onSave={saveAll} saving={saving}>
        {(editing) => (
          <div>
            <div style={{ position: 'relative', height: 132, borderRadius: 10, overflow: 'hidden', background: bannerPreview ? 'transparent' : 'linear-gradient(135deg, var(--bg-subtle), var(--border))' }}>
              {bannerPreview ? <img src={bannerPreview} alt="Startup banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' }}>No banner uploaded</p></div>}
              {editing && <label style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, cursor: 'pointer' }}><Camera size={11} /> Banner<input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange('banner_url', setBannerPreview)} /></label>}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: -28, paddingLeft: 16, marginBottom: 16 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {logoPreview ? <img src={logoPreview} alt="Startup logo" style={{ width: 58, height: 58, borderRadius: 10, objectFit: 'cover', border: '3px solid var(--bg-card)' }} /> : <div style={{ width: 58, height: 58, borderRadius: 10, background: 'var(--bg-subtle)', border: '3px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--text-mid)' }}>{(form.name || '?').slice(0, 2).toUpperCase()}</div>}
                {editing && <label style={{ position: 'absolute', bottom: -4, right: -4, width: 23, height: 23, borderRadius: '50%', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)' }}><Camera size={10} style={{ color: 'var(--bg)' }} /><input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange('logo_url', setLogoPreview)} /></label>}
              </div>
              {!editing && (
                <div style={{ paddingBottom: 2 }}>
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 18, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{form.name || <em style={{ color: 'var(--text-dim)' }}>Startup name</em>}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '3px 0 0' }}>{form.tagline || <span style={{ fontStyle: 'italic' }}>No tagline</span>}</p>
                  {form.one_line_pitch && <p style={{ fontSize: 12, color: 'var(--text-mid)', margin: '6px 0 0', lineHeight: 1.5 }}>{form.one_line_pitch}</p>}
                </div>
              )}
            </div>
            {editing ? (
              <div style={grid2}>
                <div><Label required>Company name</Label><FocusInput value={form.name} onChange={e => set('name')(e.target.value)} placeholder="HUNT Labs" /></div>
                <div><Label>Tagline</Label><FocusInput value={form.tagline} onChange={e => set('tagline')(e.target.value)} placeholder="Skill-first internships for India" /></div>
                <div style={{ gridColumn: '1 / -1' }}><Label>One-line pitch</Label><FocusInput value={form.one_line_pitch} onChange={e => set('one_line_pitch')(e.target.value)} placeholder="We build AI tools for D2C brands" /></div>
                <div><Label>Twitter/X</Label><FocusInput value={form.twitter_url} onChange={e => set('twitter_url')(e.target.value)} placeholder="https://x.com/..." /></div>
                <div><Label>LinkedIn company page</Label><FocusInput value={form.linkedin_url} onChange={e => set('linkedin_url')(e.target.value)} placeholder="https://linkedin.com/company/..." /></div>
                <div><Label>Product Hunt</Label><FocusInput value={form.product_hunt_url} onChange={e => set('product_hunt_url')(e.target.value)} placeholder="https://producthunt.com/..." /></div>
                <div><Label>YC / accelerator</Label><FocusInput value={form.accelerator} onChange={e => set('accelerator')(e.target.value)} placeholder="YC S24, Antler, Techstars..." /></div>
              </div>
            ) : (
              <div style={grid2}>
                <ReadField label="Pitch" value={form.one_line_pitch} />
                <ReadField label="Twitter/X" value={form.twitter_url} link />
                <ReadField label="LinkedIn" value={form.linkedin_url} link />
                <ReadField label="Product Hunt" value={form.product_hunt_url} link />
                <ReadField label="Accelerator" value={form.accelerator} />
              </div>
            )}
          </div>
        )}
      </ProfileCard>

      <ProfileCard title="Basic Info" canEdit={canEdit} onSave={saveAll} saving={saving}>
        {(editing) => editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={grid2}>
              <div><Label>Website URL</Label><FocusInput value={form.website} onChange={e => set('website')(e.target.value)} placeholder="https://example.com" /></div>
              <div><Label>HQ Location</Label><FocusInput value={form.hq_location} onChange={e => set('hq_location')(e.target.value)} placeholder="Bangalore, India" /></div>
              <div><Label>Industry</Label><FocusInput value={form.industry} onChange={e => set('industry')(e.target.value)} placeholder="HR Tech / SaaS" /></div>
              <div><Label>Founded Year</Label><FocusInput type="number" value={form.founded_year} onChange={e => set('founded_year')(e.target.value)} placeholder="2024" /></div>
              <div><Label>Stage</Label><FocusSelect value={form.stage} onChange={e => set('stage')(e.target.value)}><option value="">Select stage</option><option>Pre-seed</option><option>Seed</option><option>Series A</option><option>Series B</option><option>Bootstrapped</option></FocusSelect></div>
              <div><Label>Team Size</Label><FocusSelect value={form.team_size} onChange={e => set('team_size')(e.target.value)}><option value="">Select size</option><option>1-10</option><option>11-50</option><option>51-200</option><option>200+</option></FocusSelect></div>
            </div>
            <div><Label>Internal Tech Stack</Label><ChipList value={form.tech_stack} options={TECH_OPTIONS} onChange={set('tech_stack')} editing /></div>
            <div><Label>Work Culture Tags</Label><ChipList value={form.culture_tags} options={CULTURE_OPTIONS} onChange={set('culture_tags')} editing /></div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={grid2}>
              <ReadField label="Website" value={form.website} link />
              <ReadField label="HQ Location" value={form.hq_location} />
              <ReadField label="Industry" value={form.industry} />
              <ReadField label="Founded" value={form.founded_year} />
              <ReadField label="Stage" value={form.stage} />
              <ReadField label="Team Size" value={form.team_size} />
            </div>
            <div><Label>Internal Tech Stack</Label><ChipList value={form.tech_stack} options={TECH_OPTIONS} editing={false} /></div>
            <div><Label>Work Culture Tags</Label><ChipList value={form.culture_tags} options={CULTURE_OPTIONS} editing={false} /></div>
          </div>
        )}
      </ProfileCard>

      <ProfileCard title="About" canEdit={canEdit} onSave={saveAll} saving={saving}>
        {(editing) => editing ? (
          <FocusTextarea value={form.about} onChange={e => set('about')(e.target.value)} rows={5} placeholder="What do you do, who do you serve, and what problem are you solving?" />
        ) : (
          <p style={{ fontSize: 13, color: form.about ? 'var(--text-mid)' : 'var(--text-dim)', lineHeight: 1.7, margin: 0, fontStyle: form.about ? 'normal' : 'italic' }}>{form.about || 'No description yet. Add one to help candidates understand your company.'}</p>
        )}
      </ProfileCard>

      <ProfileCard title="Why Join Us" canEdit={canEdit} onSave={saveAll} saving={saving}>
        {(editing) => editing ? (
          <FocusTextarea value={form.why_join} onChange={e => set('why_join')(e.target.value)} rows={5} placeholder="What will interns learn, build, and experience with your team?" />
        ) : (
          <p style={{ fontSize: 13, color: form.why_join ? 'var(--text-mid)' : 'var(--text-dim)', lineHeight: 1.7, margin: 0, fontStyle: form.why_join ? 'normal' : 'italic' }}>{form.why_join || 'No joining pitch yet. Add the learning curve, ownership, and environment.'}</p>
        )}
      </ProfileCard>

      <ProfileCard title="Traction / Social Proof" canEdit={canEdit} onSave={saveAll} saving={saving}>
        {(editing) => editing ? (
          <div style={grid2}>
            <div><Label>Users / customers</Label><FocusInput value={form.traction_users} onChange={e => set('traction_users')(e.target.value)} placeholder="10k users / 50 enterprise clients" /></div>
            <div><Label>Revenue stage</Label><FocusSelect value={form.revenue_stage} onChange={e => set('revenue_stage')(e.target.value)}>{REVENUE_STAGES.map(s => <option key={s} value={s}>{s || 'Select stage'}</option>)}</FocusSelect></div>
            <div><Label>Backed by</Label><FocusInput value={form.backed_by} onChange={e => set('backed_by')(e.target.value)} placeholder="Investor names or Bootstrapped" /></div>
            <div><Label>Press / customers</Label><FocusInput value={form.press_mentions} onChange={e => set('press_mentions')(e.target.value)} placeholder="Featured in..., used by..." /></div>
          </div>
        ) : (
          <div style={grid2}>
            <ReadField label="Users / customers" value={form.traction_users} />
            <ReadField label="Revenue stage" value={form.revenue_stage} />
            <ReadField label="Backed by" value={form.backed_by} />
            <ReadField label="Press / customers" value={form.press_mentions} />
          </div>
        )}
      </ProfileCard>

      <ProfileCard title="Founding Team" canEdit={canEdit} onSave={saveAll} saving={saving}>
        {(editing) => <FounderList founders={form.founders} editing={editing} onChange={set('founders')} />}
      </ProfileCard>
    </div>
  );
}

export function RecruiterProfileForm({ recruiter, onUpdate, showToast }) {
  const [form, setForm] = useState({
    contact_name: recruiter.contact_name || '',
    email: recruiter.email || '',
    phone: recruiter.phone || '',
    title: recruiter.title || '',
    linkedin_url: recruiter.linkedin_url || '',
    bio: recruiter.bio || '',
    role_in_company: recruiter.role_in_company || 'recruiter',
    what_im_looking_for: recruiter.what_im_looking_for || '',
    response_commitment: Boolean(recruiter.response_commitment),
  });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await updateRecruiterProfile(recruiter.id, form);
      showToast('Profile updated');
      onUpdate();
    } catch (e) {
      showToast(e.message || 'Failed', 'error');
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ProfileCard title="Your Profile" canEdit={true} onSave={save} saving={saving}>
        {(editing) => (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: editing ? 18 : 0, paddingBottom: editing ? 16 : 0, borderBottom: editing ? '1px solid var(--border)' : 'none' }}>
              <Avatar name={form.contact_name} size={46} />
              <div>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 17, color: 'var(--text)', margin: 0, fontWeight: 400 }}>{form.contact_name || 'Your name'}</p>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>{form.title || <span style={{ fontStyle: 'italic' }}>No title</span>} at {recruiter.startups?.name || 'your startup'}</p>
              </div>
            </div>
            {editing ? (
              <div style={grid2}>
                <div><Label required>Full name</Label><FocusInput value={form.contact_name} onChange={e => set('contact_name')(e.target.value)} /></div>
                <div><Label>Title / Role</Label><FocusInput value={form.title} onChange={e => set('title')(e.target.value)} placeholder="Head of Talent" /></div>
                <div><Label>Email</Label><FocusInput value={form.email} disabled type="email" /></div>
                <div><Label>Phone</Label><FocusInput value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="+91..." /></div>
                <div><Label>LinkedIn</Label><FocusInput value={form.linkedin_url} onChange={e => set('linkedin_url')(e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
                <div><Label>Role in company</Label><FocusSelect value={form.role_in_company} onChange={e => set('role_in_company')(e.target.value)}><option value="founder">Founder</option><option value="hiring_manager">Hiring Manager</option><option value="recruiter">Recruiter</option></FocusSelect></div>
              </div>
            ) : (
              <div style={grid2}>
                <ReadField label="Phone" value={form.phone} />
                <ReadField label="Email" value={form.email} />
                <ReadField label="LinkedIn" value={form.linkedin_url} link />
                <ReadField label="Role" value={form.role_in_company?.replace('_', ' ')} />
              </div>
            )}
          </div>
        )}
      </ProfileCard>

      <ProfileCard title="Candidate-facing Bio" canEdit={true} onSave={save} saving={saving}>
        {(editing) => editing ? (
          <FocusTextarea value={form.bio} onChange={e => set('bio')(e.target.value)} rows={4} placeholder="Short note candidates see when you message them." />
        ) : (
          <p style={{ fontSize: 13, color: form.bio ? 'var(--text-mid)' : 'var(--text-dim)', lineHeight: 1.7, margin: 0, fontStyle: form.bio ? 'normal' : 'italic' }}>{form.bio || 'No bio yet. Candidates see this when you reach out.'}</p>
        )}
      </ProfileCard>

      <ProfileCard title="What I'm Looking For" canEdit={true} onSave={save} saving={saving}>
        {(editing) => editing ? (
          <FocusTextarea value={form.what_im_looking_for} onChange={e => set('what_im_looking_for')(e.target.value)} rows={4} placeholder="Someone who ships fast and asks questions." />
        ) : (
          <p style={{ fontSize: 13, color: form.what_im_looking_for ? 'var(--text-mid)' : 'var(--text-dim)', lineHeight: 1.7, margin: 0, fontStyle: form.what_im_looking_for ? 'normal' : 'italic' }}>{form.what_im_looking_for || 'No preference note yet.'}</p>
        )}
      </ProfileCard>

      <ProfileCard title="Response Commitment" canEdit={true} onSave={save} saving={saving}>
        {(editing) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <CommitmentToggle checked={form.response_commitment} onChange={set('response_commitment')} disabled={!editing} />
            {!editing && form.response_commitment && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, width: 'fit-content', padding: '5px 10px', borderRadius: 999, background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green-text)', fontSize: 11, fontWeight: 600 }}>
                <Link2 size={11} /> 48h response badge enabled
              </span>
            )}
          </div>
        )}
      </ProfileCard>
    </div>
  );
}
