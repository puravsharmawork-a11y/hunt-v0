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
import { SKILL_OPTIONS } from '../constants';
import { createJob, updateJob } from '../services/recruiterApi';
import { FocusInput, FocusSelect, FocusTextarea, Label, CompanyLogo, btnPrimary, btnGhost } from '../shared/ui';

export function PostRoleDrawer({ recruiter, open, onClose, onSuccess, showToast, editJob }) {
  const [skillInput, setSkillInput]         = useState('');
  const [niceInput, setNiceInput]           = useState('');
  const [whatDoInput, setWhatDoInput]       = useState('');
  const [perkInput, setPerkInput]           = useState('');
  const [newSecHeading, setNewSecHeading]   = useState('');
  const [newSecItemText, setNewSecItemText] = useState({});
  const [saving, setSaving]                 = useState(false);
  const logoInputRef = useRef(null);

  const companyLogoUrl = recruiter?.startups?.logo_url || '';

  const defaultForm = () => ({
    logo_url: companyLogoUrl,
    role: '', description: '', stipend: '', duration: '',
    location: '', type: 'Paid Internship', visibility: 'public',
    required_skills: [], nice_to_have: [],
    positions: 1,
    whatYoullDo: [], perks: [], sections: [],
    max_applicants: 50, minimum_match_threshold: 50,
  });

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!open) {
      setForm(defaultForm());
      setWhatDoInput('');
      setPerkInput('');
      setNewSecHeading('');
      setNewSecItemText({});
    } else if (editJob) {
      setForm({
        logo_url: editJob.logo_url || companyLogoUrl,
        role: editJob.role || '',
        description: editJob.description || '',
        stipend: editJob.stipend || '',
        duration: editJob.duration || '',
        location: editJob.location || '',
        type: editJob.type || 'Paid Internship',
        visibility: editJob.visibility || 'public',
        required_skills: editJob.required_skills || [],
        nice_to_have: editJob.nice_to_have || [],
        max_applicants: editJob.max_applicants || 50,
        minimum_match_threshold: editJob.minimum_match_threshold || 50,
        positions: editJob.positions || 1,
        whatYoullDo: editJob.what_youll_do || [],
        perks: editJob.perks || [],
        sections: editJob.sections || [],
      });
    }
  }, [open]);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const addSkill = () => {
    const name = skillInput.trim();
    if (!name || form.required_skills.find(s => s.name.toLowerCase() === name.toLowerCase())) return;
    setForm(f => ({ ...f, required_skills: [...f.required_skills, { name, weight: 0.25, level: 3 }] }));
    setSkillInput('');
  };
  const removeSkill = (name) => setForm(f => ({ ...f, required_skills: f.required_skills.filter(s => s.name !== name) }));
  const addNice = () => {
    const name = niceInput.trim();
    if (!name || form.nice_to_have.includes(name)) return;
    setForm(f => ({ ...f, nice_to_have: [...f.nice_to_have, name] }));
    setNiceInput('');
  };
  const addWhatDo = () => {
    const n = whatDoInput.trim(); if (!n) return;
    setForm(f => ({ ...f, whatYoullDo: [...f.whatYoullDo, n] }));
    setWhatDoInput('');
  };
  const removeWhatDo = (i) => setForm(f => ({ ...f, whatYoullDo: f.whatYoullDo.filter((_, idx) => idx !== i) }));
  const addPerk = () => {
    const n = perkInput.trim(); if (!n || form.perks.includes(n)) return;
    setForm(f => ({ ...f, perks: [...f.perks, n] }));
    setPerkInput('');
  };
  const removePerk = (i) => setForm(f => ({ ...f, perks: f.perks.filter((_, idx) => idx !== i) }));
  const addSection = () => {
    const h = newSecHeading.trim(); if (!h) return;
    setForm(f => ({ ...f, sections: [...f.sections, { heading: h, items: [] }] }));
    setNewSecHeading('');
  };
  const removeSection = (si) => setForm(f => ({ ...f, sections: f.sections.filter((_, i) => i !== si) }));
  const addSectionItem = (si) => {
    const text = (newSecItemText[si] || '').trim(); if (!text) return;
    setForm(f => ({ ...f, sections: f.sections.map((s, i) => i === si ? { ...s, items: [...s.items, text] } : s) }));
    setNewSecItemText(prev => ({ ...prev, [si]: '' }));
  };
  const removeSectionItem = (si, ii) => setForm(f => ({
    ...f,
    sections: f.sections.map((s, i) => i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s),
  }));

  const handleSubmit = async () => {
    if (!form.role.trim())     return showToast('Role title is required.', 'error');
    if (!form.stipend.trim())  return showToast('Stipend is required.', 'error');
    if (!form.duration.trim()) return showToast('Duration is required.', 'error');
    if (!form.location.trim()) return showToast('Location is required.', 'error');
    if (form.required_skills.length === 0) return showToast('Add at least one required skill.', 'error');
    setSaving(true);
    try {
      const totalW = form.required_skills.reduce((s, sk) => s + sk.weight, 0);
      const normSkills = form.required_skills.map(sk => ({ ...sk, weight: parseFloat((sk.weight / totalW).toFixed(3)) }));
      const startupName = recruiter.startups?.name || recruiter.company_name || 'Company';
      const jobLogoUrl = form.logo_url || companyLogoUrl || null;
      if (editJob) {
        await updateJob(editJob.id, {
          logo_url: jobLogoUrl, role: form.role.trim(),
          description: form.description.trim(), stipend: form.stipend.trim(),
          duration: form.duration.trim(), location: form.location.trim(),
          type: form.type, visibility: form.visibility,
          required_skills: normSkills, nice_to_have: form.nice_to_have,
          max_applicants: form.max_applicants,
          minimum_match_threshold: form.minimum_match_threshold,
          positions: form.positions, what_youll_do: form.whatYoullDo,
          perks: form.perks, sections: form.sections,
        });
      } else {
        const slug = `${startupName.toLowerCase().replace(/\s+/g, '-')}-${form.role.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        await createJob({
          recruiter_id: recruiter.id, company: startupName,
          logo_url: jobLogoUrl, role: form.role.trim(),
          description: form.description.trim(), stipend: form.stipend.trim(),
          duration: form.duration.trim(), location: form.location.trim(),
          type: form.type, visibility: form.visibility, share_slug: slug,
          required_skills: normSkills, nice_to_have: form.nice_to_have,
          max_applicants: form.max_applicants,
          minimum_match_threshold: form.minimum_match_threshold,
          positions: form.positions, current_applicants: 0, is_active: true, status: 'live',
          what_youll_do: form.whatYoullDo, perks: form.perks, sections: form.sections,
        });
      }
      onSuccess();
      onClose();
    } catch (e) { showToast('Failed: ' + (e.message || 'Unknown error'), 'error'); }
    finally     { setSaving(false); }
  };

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9000, backdropFilter: 'blur(2px)' }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 520,
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
        zIndex: 9001, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '-8px 0 40px rgba(0,0,0,0.12)' : 'none',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0, marginBottom: 4 }}>{editJob ? 'Edit role' : 'Post a role'}</p>
            <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 20, fontWeight: 400, color: 'var(--text)', margin: 0 }}>{editJob ? <>Edit <em>{editJob.role}</em></> : <>Post a new <em>role.</em></>}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {companyLogoUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'var(--green-tint)', border: '1px solid var(--green)' }}>
                <img src={companyLogoUrl} alt="company" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                <p style={{ fontSize: 11, color: 'var(--green-text)', margin: 0 }}>Company logo will be used for this role</p>
              </div>
            )}

            <div>
              <Label required>Role title</Label>
              <FocusInput value={form.role} onChange={e => set('role')(e.target.value)} placeholder="e.g. Backend Engineer, Growth Marketer…" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><Label required>Stipend</Label><FocusInput value={form.stipend} onChange={e => set('stipend')(e.target.value)} placeholder="₹25,000/month" /></div>
              <div><Label required>Duration</Label><FocusInput value={form.duration} onChange={e => set('duration')(e.target.value)} placeholder="3 / 6 months" /></div>
              <div><Label required>Location</Label><FocusInput value={form.location} onChange={e => set('location')(e.target.value)} placeholder="Remote / Mumbai" /></div>
              <div><Label>Type</Label>
                <FocusSelect value={form.type} onChange={e => set('type')(e.target.value)}>
                  <option>Paid Internship</option><option>Unpaid Internship</option>
                  <option>Contract</option><option>Part-time</option>
                </FocusSelect>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <FocusTextarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3} placeholder="What will the intern actually work on?" />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Role content</p>

              <div style={{ marginBottom: 18 }}>
                <Label>What you'll do</Label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <FocusInput value={whatDoInput} onChange={e => setWhatDoInput(e.target.value)}
                    placeholder="e.g. Build and ship features end to end"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addWhatDo())}
                    style={{ flex: 1 }} />
                  <button onClick={addWhatDo} style={{ ...btnPrimary(false), padding: '10px 14px' }}>Add</button>
                </div>
                {form.whatYoullDo.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 4 }}>
                    <div style={{ width: 4, height: 4, background: 'var(--text-dim)', flexShrink: 0, marginTop: 7 }} />
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>{item}</span>
                    <button onClick={() => removeWhatDo(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0, flexShrink: 0 }}><X size={12} /></button>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 18 }}>
                <Label>Perks & benefits</Label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <FocusInput value={perkInput} onChange={e => setPerkInput(e.target.value)}
                    placeholder="e.g. Flexible hours · Certificate of completion"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPerk())}
                    style={{ flex: 1 }} />
                  <button onClick={addPerk} style={{ ...btnGhost(), padding: '10px 14px' }}>Add</button>
                </div>
                {form.perks.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {form.perks.map((p, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', color: 'var(--text-mid)', background: 'var(--bg-subtle)' }}>
                        ✦ {p}
                        <button onClick={() => removePerk(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Custom sections</Label>
                {form.sections.map((sec, si) => (
                  <div key={si} style={{ marginBottom: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>▲ {sec.heading}</span>
                      <button onClick={() => removeSection(si)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><Trash2 size={12} /></button>
                    </div>
                    {sec.items.map((item, ii) => (
                      <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                        <div style={{ width: 4, height: 4, background: 'var(--text-dim)', flexShrink: 0, marginTop: 6 }} />
                        <span style={{ flex: 1, fontSize: 11, color: 'var(--text)' }}>{item}</span>
                        <button onClick={() => removeSectionItem(si, ii)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0, flexShrink: 0 }}><X size={10} /></button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <FocusInput value={newSecItemText[si] || ''} onChange={e => setNewSecItemText(prev => ({ ...prev, [si]: e.target.value }))}
                        placeholder="Add a point…"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSectionItem(si))}
                        style={{ flex: 1, fontSize: 11, padding: '6px 10px' }} />
                      <button onClick={() => addSectionItem(si)} style={{ ...btnPrimary(false), padding: '6px 12px', fontSize: 11 }}>Add</button>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8 }}>
                  <FocusInput value={newSecHeading} onChange={e => setNewSecHeading(e.target.value)}
                    placeholder="Heading — e.g. Who we're looking for"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSection())}
                    style={{ flex: 1 }} />
                  <button onClick={addSection} style={{ ...btnGhost(), whiteSpace: 'nowrap' }}><Plus size={12} /> Add section</button>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Skills & config</p>
              <Label required>Required skills</Label>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>Type a skill and press Enter. Set level 1–5 for each.</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <FocusInput value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="React, Node.js, Python…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} list="skill-suggestions-drawer" style={{ flex: 1 }} />
                <datalist id="skill-suggestions-drawer">{SKILL_OPTIONS.map(s => <option key={s} value={s} />)}</datalist>
                <button onClick={addSkill} style={btnPrimary(false)}>Add</button>
              </div>
              {form.required_skills.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.required_skills.map(skill => (
                    <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{skill.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Level</span>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1,2,3,4,5].map(lv => (
                          <button key={lv} onClick={() => setForm(f => ({ ...f, required_skills: f.required_skills.map(s => s.name === skill.name ? { ...s, level: lv } : s) }))}
                            style={{ width: 22, height: 22, borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: skill.level >= lv ? 'var(--text)' : 'var(--bg-card)', color: skill.level >= lv ? 'var(--bg)' : 'var(--text-dim)', outline: skill.level >= lv ? 'none' : '1px solid var(--border)' }}>{lv}</button>
                        ))}
                      </div>
                      <button onClick={() => removeSkill(skill.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Nice to have</Label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <FocusInput value={niceInput} onChange={e => setNiceInput(e.target.value)} placeholder="Docker, AWS…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNice())} list="skill-suggestions-drawer" style={{ flex: 1 }} />
                <button onClick={addNice} style={btnGhost()}>Add</button>
              </div>
              {form.nice_to_have.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.nice_to_have.map(s => (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', color: 'var(--text-mid)' }}>
                      {s}
                      <button onClick={() => setForm(f => ({ ...f, nice_to_have: f.nice_to_have.filter(x => x !== s) }))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Visibility</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['public', 'private'].map(v => (
                  <button key={v} onClick={() => set('visibility')(v)} style={{
                    padding: '8px 16px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
                    background: form.visibility === v ? 'var(--text)' : 'transparent',
                    border: `1px solid ${form.visibility === v ? 'var(--text)' : 'var(--border)'}`,
                    color: form.visibility === v ? 'var(--bg)' : 'var(--text-mid)',
                    fontWeight: form.visibility === v ? 600 : 400,
                  }}>
                    {v === 'public' ? '🌐 Public' : '🔒 Link only'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-card)' }}>
          <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary(saving), width: '100%', justifyContent: 'center', padding: '13px 16px', fontSize: 13 }}>
            {saving ? (editJob ? 'Saving…' : 'Posting…') : (editJob ? 'Save changes' : 'Post role')} {!saving && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. CANDIDATE FULL PROFILE DRAWER — ENHANCED v9
// Changes:
//   • Overview: shows contact_info (email, whatsapp, telegram, twitter, calendly)
//   • Resume: shows education, certifications, awards, coding_profiles, other_links
//   • Skills: real skill logos using devicon CDN
//   • Added "Reviews" tab with ratings or empty state
// ═══════════════════════════════════════════════════════════════════════════

