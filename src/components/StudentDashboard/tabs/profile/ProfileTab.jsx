import React from 'react';
import {
  SKILL_OPTIONS_P, SKILL_CATS_P, LEVEL_LABELS_P, ROLE_OPTIONS_P,
  inp_p, Toggle_P, getSkillLogo, PLATFORM_LOGOS,
} from './constants';

/* ════════════════════════════════════════════════════════════════════════════
   ProfileTab — brutalist/bitmap aesthetic (matches HUNT Candidate Dashboard)
   
   VISUAL LANGUAGE (must exist as CSS vars in your global stylesheet):
     --cream / --ink / --blue / --blue-tint / --blue-deep
     --bg / --bg-card / --bg-subtle / --border / --border-mid
     --text / --text-mid / --text-dim / --text-faint
     --amber / --amber-tint / --red / --red-tint / --green / --green-tint
     --mono: 'JetBrains Mono', ui-monospace, ...
     --serif: 'Instrument Serif', 'Times New Roman', ...
     --sans: 'Inter', ...

   UTILITY CLASSES this file expects in your global CSS:
     .card           → border + square corners, bg var(--bg-card)
     .kicker         → mono 10px uppercase 0.14em letter-spacing
     .kicker-ink     → kicker with --text color
     .display-serif  → instrument-serif, letter-spacing -0.01em
     .chip / .chip-blue-tint / .chip-solid
     .btn / .btn-primary / .btn-dark / .btn-ghost / .btn-sm
     .input
     .match-bar-track / .match-bar-fill
     .solid-rule
     .hairline

   Behavior is preserved 1:1 from previous ProfileTab:
     - Draft/confirm/save flow
     - Supabase dynamic imports
     - File upload handlers
     - Toast system
     - All 8 sections (Overview, Resume, Skills, Journey, My Hunt, Reviews, Score, Account)
   Only the visual shell changes.
   ════════════════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════════════
// ⚠️ KEEP ALL SUB-COMPONENTS OUTSIDE ProfileTab (prevents remount on keystroke)
// ═══════════════════════════════════════════════════════════════════════════

const Card = ({ children, style: s = {}, className = '' }) => (
  <div className={`card ${className}`} style={{ padding: '22px 24px', marginBottom: 16, ...s }}>
    {children}
  </div>
);

const Kicker = ({ children, tone = 'ink' }) => (
  <div className={`kicker ${tone === 'ink' ? 'kicker-ink' : ''}`}>
    ▲ {children}
  </div>
);

const FieldLabel = ({ children }) => (
  <div className="kicker" style={{ marginBottom: 6 }}>{children}</div>
);

// Pencil icon for edit
const PencilIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="square">
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

// Edit / Save toggle — brutalist square button
const EditSaveBtn = ({ editing, onEdit, onSave, saving }) => {
  if (!editing) {
    return (
      <button onClick={onEdit} className="btn btn-sm btn-ghost" title="Edit"
              style={{ padding: '6px 9px' }}>
        <PencilIcon />
      </button>
    );
  }
  return (
    <button onClick={onSave} disabled={saving} className="btn btn-sm btn-primary">
      {saving ? 'SAVING…' : 'SAVE'}
    </button>
  );
};

// Confirm-to-edit modal (brutalist variant: square, hard shadow)
const ConfirmEditModal = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(20,19,14,0.35)', backdropFilter: 'blur(2px)',
    }} />
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      zIndex: 401, background: 'var(--bg-card)', border: '1px solid var(--ink)',
      boxShadow: '4px 4px 0 0 var(--ink)', padding: '26px 28px', width: 360, borderRadius: 0,
    }}>
      <div className="kicker kicker-ink" style={{ marginBottom: 10 }}>▲ confirm edit</div>
      <p className="display-serif" style={{ fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>
        Edit this section?
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 20, lineHeight: 1.55 }}>
        You'll be able to make changes. Don't forget to save when you're done.
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} className="btn btn-sm btn-ghost">CANCEL</button>
        <button onClick={onConfirm} className="btn btn-sm btn-dark">YES, EDIT</button>
      </div>
    </div>
  </>
);

// Section wrapper (matches "▲ section / title" header style from dashboard)
const EditableSection = ({ title, editKey, editingKey, onRequestEdit, onSave, onCancel, saving, children }) => {
  const isEditing = editingKey === editKey;
  return (
    <Card>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
      }}>
        <Kicker>{title}</Kicker>
        <div style={{ display: 'flex', gap: 6 }}>
          {isEditing && (
            <button onClick={onCancel} className="btn btn-sm btn-ghost">CANCEL</button>
          )}
          <EditSaveBtn editing={isEditing} onEdit={() => onRequestEdit(editKey)} onSave={onSave} saving={saving} />
        </div>
      </div>
      {children({ editing: isEditing })}
    </Card>
  );
};

// ─── Main ProfileTab ────────────────────────────────────────────────────────
export function ProfileTab({ studentProfile, setStudentProfile, theme, setTheme }) {
  const [activeSection, setActiveSection] = React.useState('overview');
  const [draft, setDraft] = React.useState(() => JSON.parse(JSON.stringify(studentProfile || {})));
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [skillCat, setSkillCat] = React.useState(SKILL_CATS_P[0]);
  const [skillSearch, setSkillSearch] = React.useState('');
  const [addingProject, setAddingProject] = React.useState(false);
  const [newProject, setNewProject] = React.useState({ title: '', techStack: '', description: '', projectUrl: '', githubUrl: '' });
  const [addingEdu, setAddingEdu] = React.useState(false);
  const [newEdu, setNewEdu] = React.useState({ school: '', degree: '', major: '', startYear: '', endYear: '' });
  const [newCert, setNewCert] = React.useState('');
  const [newAward, setNewAward] = React.useState('');
  const [otherLinks, setOtherLinks] = React.useState(studentProfile?.other_links || []);
  const [newOtherLink, setNewOtherLink] = React.useState({ label: '', url: '' });
  const [pendingSkill, setPendingSkill] = React.useState(null);

  // Edit-mode tracking
  const [editingSection, setEditingSection] = React.useState(null);
  const [pendingEdit, setPendingEdit] = React.useState(null);

  // My Journey
  const [addingJourney, setAddingJourney] = React.useState(false);
  const [newJourney, setNewJourney] = React.useState({ type: 'current', title: '', company: '', startDate: '', endDate: '', description: '' });

  // Account
  const [newEmail, setNewEmail] = React.useState('');
  const [changingEmail, setChangingEmail] = React.useState(false);

  const showToast = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2200); };

  const requestEdit = (sectionKey) => setPendingEdit(sectionKey);
  const confirmEdit = () => { setEditingSection(pendingEdit); setPendingEdit(null); };
  const cancelEdit = () => {
    setEditingSection(null);
    setDraft(JSON.parse(JSON.stringify(studentProfile || {})));
    setOtherLinks(studentProfile?.other_links || []);
  };

  const save = async (updates, opts = {}) => {
    setSaving(true);
    try {
      const { updateStudentProfile } = await import('../../../../services/supabase');
      const merged = { ...studentProfile, ...updates };
      let sc = 0;
      if (merged.full_name) sc += 10;
      if (merged.college) sc += 10;
      if ((merged.skills || []).length >= 5) sc += 25;
      else if ((merged.skills || []).length >= 1) sc += 10;
      if ((merged.projects || []).length >= 1) sc += 15;
      if (merged.github_url) sc += 5;
      if (merged.linkedin_url) sc += 5;
      if (merged.resume_url) sc += 5;
      if (merged.email) sc += 5;
      if ((merged.preferred_roles || []).length > 0) sc += 10;
      const updated = await updateStudentProfile({ ...updates, profile_completeness: Math.min(sc, 100) });
      setStudentProfile(updated);
      setDraft(JSON.parse(JSON.stringify(updated)));
      if (!opts.silent) showToast('Saved');
      if (opts.exitEdit) setEditingSection(null);
    } catch (e) {
      console.error(e);
      showToast('Save failed', 'err');
    } finally {
      setSaving(false);
    }
  };

  // File upload handlers
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Uploading…');
      const { uploadAvatar } = await import('../../../../services/supabase');
      const url = await uploadAvatar(file);
      await save({ avatar_url: url }, { silent: true });
      showToast('Avatar updated');
    } catch (err) { console.error(err); showToast('Upload failed', 'err'); }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Uploading…');
      const { uploadBanner } = await import('../../../../services/supabase');
      const url = await uploadBanner(file);
      await save({ banner_url: url }, { silent: true });
      showToast('Banner updated');
    } catch (err) { console.error(err); showToast('Upload failed', 'err'); }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('File too large (max 5MB)', 'err'); return; }
    try {
      showToast('Uploading resume…');
      const { uploadResume } = await import('../../../../services/supabase');
      const url = await uploadResume(file);
      await save({ resume_url: url }, { silent: true });
      showToast('Resume uploaded');
    } catch (err) { console.error(err); showToast('Upload failed', 'err'); }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) { showToast('Enter a valid email', 'err'); return; }
    if (!window.confirm(`Change your email to ${newEmail}? You'll get a confirmation link (OTP verification coming soon).`)) return;
    setChangingEmail(true);
    try {
      const { updateUserEmail } = await import('../../../../services/supabase');
      await updateUserEmail(newEmail);
      await save({ email: newEmail }, { silent: true });
      showToast('Check your email to confirm');
      setNewEmail('');
    } catch (err) { console.error(err); showToast(err.message || 'Change failed', 'err'); }
    finally { setChangingEmail(false); }
  };

  const handlePauseAccount = async () => {
    if (!window.confirm('Pause your account? Recruiters won\'t see your profile until you unpause.')) return;
    await save({ account_paused: !(draft.account_paused) }, { silent: true });
    showToast(draft.account_paused ? 'Account resumed' : 'Account paused');
  };

  const handleSignOut = async () => {
    if (!window.confirm('Sign out of HUNT?')) return;
    try {
      const { signOut } = await import('../../../../services/supabase');
      await signOut();
      window.location.href = '/';
    } catch (err) { console.error(err); showToast('Sign out failed', 'err'); }
  };

  const d = draft;
  const initials = (d.full_name || '').split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  const SECTIONS = [
    { id: 'overview',  label: 'Overview' },
    { id: 'resume',    label: 'Resume' },
    { id: 'skills',    label: 'Skills & Prefs' },
    { id: 'journey',   label: 'Journey' },
    { id: 'myhunt',    label: 'My Hunt' },
    { id: 'reviews',   label: 'Reviews' },
    { id: 'huntscore', label: 'Hunt Score' },
    { id: 'account',   label: 'Account' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, padding: '8px 16px',
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
          background: toast.type === 'err' ? 'var(--red)' : 'var(--ink)',
          color: '#fff', border: '1px solid var(--ink)',
          boxShadow: '3px 3px 0 0 ' + (toast.type === 'err' ? 'var(--ink)' : 'var(--blue)'),
          pointerEvents: 'none',
        }}>
          {toast.msg}
        </div>
      )}

      {pendingEdit && <ConfirmEditModal onConfirm={confirmEdit} onCancel={() => setPendingEdit(null)} />}

      {/* ── HEADER + SUB-TABS (brutalist kicker + display-serif) ── */}
      <div style={{ flexShrink: 0, padding: '28px 40px 0', background: 'var(--bg)' }}>
        <div className="kicker" style={{ marginBottom: 6 }}>▲ candidate / profile</div>
        <div className="display-serif" style={{ fontSize: 36, lineHeight: 1, marginBottom: 22 }}>
          {d.full_name
            ? <>{d.full_name.split(' ')[0]}<em style={{ fontStyle: 'italic', color: 'var(--blue)' }}>'s profile.</em></>
            : <em style={{ fontStyle: 'italic' }}>Your profile.</em>}
        </div>

        {/* Tabs — brutalist: square, mono, bottom border on active */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-mid)', overflowX: 'auto' }}>
          {SECTIONS.map(s => {
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="mono"
                style={{
                  padding: '11px 16px',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--ink)' : 'var(--text-dim)',
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? '2px solid var(--blue)' : '2px solid transparent',
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'color 0.1s',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px' }}>

        {/* ═══════ OVERVIEW ═══════ */}
        {activeSection === 'overview' && (
          <div style={{ maxWidth: 780 }}>
            {/* Identity header — pixel block panel on right (matches dashboard ProfileTab) */}
            <div className="card" style={{ padding: 0, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
              {/* Banner strip */}
              <div style={{
                height: 140,
                background: d.banner_url
                  ? `url("${d.banner_url}") center/cover no-repeat`
                  : 'var(--ink)',
                position: 'relative',
                borderBottom: '1px solid var(--ink)',
              }}>
                {/* Pixel grid art when no banner */}
                {!d.banner_url && (
                  <div style={{
                    position: 'absolute', inset: 20,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(40, 1fr)',
                    gridTemplateRows: 'repeat(8, 1fr)',
                    gap: 2,
                    pointerEvents: 'none',
                  }}>
                    {Array.from({ length: 40 * 8 }).map((_, i) => {
                      const on = ((i * 11) % 17) < 5;
                      return <div key={i} style={{ background: on ? 'var(--blue)' : 'transparent' }} />;
                    })}
                  </div>
                )}
                <div className="kicker" style={{
                  position: 'absolute', top: 14, left: 16, color: 'var(--cream)', opacity: 0.7,
                }}>
                  ▲ on a hunt
                </div>
                <label style={{
                  position: 'absolute', top: 12, right: 12,
                  padding: '5px 10px',
                  background: 'rgba(20,19,14,0.6)',
                  border: '1px solid var(--cream)',
                  color: 'var(--cream)',
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em',
                  textTransform: 'uppercase', cursor: 'pointer',
                }}>
                  CHANGE
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerUpload} />
                </label>
              </div>

              {/* Avatar + name */}
              <div style={{ padding: '0 28px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, marginBottom: 14 }}>
                  <div style={{ position: 'relative', marginTop: -48 }}>
                    {d.avatar_url ? (
                      <img src={d.avatar_url} alt="avatar" style={{
                        width: 96, height: 96, objectFit: 'cover',
                        border: '3px solid var(--bg-card)',
                        boxShadow: '3px 3px 0 0 var(--ink)',
                        display: 'block',
                      }} />
                    ) : (
                      <div style={{
                        width: 96, height: 96,
                        background: 'var(--blue)',
                        border: '3px solid var(--bg-card)',
                        boxShadow: '3px 3px 0 0 var(--ink)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--serif)', fontSize: 36, color: '#fff',
                      }}>
                        {initials}
                      </div>
                    )}
                    <label style={{
                      position: 'absolute', bottom: -6, right: -6,
                      width: 24, height: 24, background: 'var(--ink)',
                      border: '2px solid var(--bg-card)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--cream)" strokeWidth="2.2" strokeLinecap="square">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div style={{ flex: 1, paddingBottom: 4 }}>
                    <div className="display-serif" style={{ fontSize: 32, lineHeight: 1, marginBottom: 4 }}>
                      {d.full_name || '—'}
                    </div>
                    <div className="mono" style={{
                      fontSize: 11, color: 'var(--text-mid)', letterSpacing: '0.06em',
                    }}>
                      {d.college || '—'}{d.year && d.user_type !== 'professional' ? ` · YEAR ${d.year}` : ''}
                    </div>
                  </div>
                </div>
                {d.headline && (
                  <>
                    <div className="solid-rule" style={{ margin: '14px 0 14px' }} />
                    <p style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.6 }}>
                      {d.headline}
                    </p>
                  </>
                )}
                {/* Status chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                  <span className="chip chip-blue-tint">OPEN TO WORK</span>
                  {d.work_preference && <span className="chip">{String(d.work_preference).toUpperCase()}</span>}
                  {d.availability && <span className="chip">{d.availability.toUpperCase()}</span>}
                </div>
              </div>
            </div>

            {/* Headline + Bio */}
            <EditableSection
              title="headline & bio"
              editKey="headline_bio"
              editingKey={editingSection}
              onRequestEdit={requestEdit}
              onSave={() => save({ headline: d.headline, bio: d.bio }, { exitEdit: true })}
              onCancel={cancelEdit}
              saving={saving}
            >
              {({ editing }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <FieldLabel>Headline</FieldLabel>
                    {editing ? (
                      <input className="input" value={d.headline || ''}
                        placeholder="Full-stack dev · open to internships"
                        onChange={e => setDraft(x => ({ ...x, headline: e.target.value }))} />
                    ) : (
                      <p style={{ fontSize: 13.5, color: 'var(--text-mid)', padding: '6px 0' }}>
                        {d.headline || <em style={{ color: 'var(--text-dim)' }}>Not set</em>}
                      </p>
                    )}
                  </div>
                  <div>
                    <FieldLabel>Bio</FieldLabel>
                    {editing ? (
                      <textarea className="input" style={{ resize: 'none' }} rows={4}
                        value={d.bio || ''}
                        placeholder="Tell recruiters about yourself..."
                        onChange={e => setDraft(x => ({ ...x, bio: e.target.value }))} />
                    ) : (
                      <p style={{
                        fontSize: 13.5, color: 'var(--text-mid)', padding: '6px 0',
                        lineHeight: 1.65, whiteSpace: 'pre-wrap',
                      }}>
                        {d.bio || <em style={{ color: 'var(--text-dim)' }}>Not set</em>}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </EditableSection>

            {/* Basic Info */}
            <EditableSection
              title="basic info"
              editKey="basic_info"
              editingKey={editingSection}
              onRequestEdit={requestEdit}
              onSave={() => save({ full_name: d.full_name, college: d.college, year: d.year, phone: d.phone, email: d.email, user_type: d.user_type }, { exitEdit: true })}
              onCancel={cancelEdit}
              saving={saving}
            >
              {({ editing }) => (
                <>
                  {editing && (
                    <div style={{ marginBottom: 16 }}>
                      <FieldLabel>I am a</FieldLabel>
                      <div style={{ display: 'flex', gap: 0 }}>
                        {[
                          { v: 'student',      label: 'Student' },
                          { v: 'professional', label: 'Professional' },
                          { v: 'other',        label: 'Other' },
                        ].map((opt, idx) => {
                          const sel = (d.user_type || 'student') === opt.v;
                          return (
                            <button key={opt.v}
                              onClick={() => setDraft(x => ({ ...x, user_type: opt.v }))}
                              className="mono"
                              style={{
                                padding: '8px 14px',
                                fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                                border: '1px solid ' + (sel ? 'var(--ink)' : 'var(--border-mid)'),
                                background: sel ? 'var(--ink)' : 'transparent',
                                color: sel ? 'var(--cream)' : 'var(--text-mid)',
                                cursor: 'pointer',
                                marginLeft: idx > 0 ? -1 : 0,
                              }}>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[
                      { f: 'full_name', label: 'Full Name', ph: 'Priya Sharma' },
                      { f: 'college', label: (d.user_type === 'professional' ? 'Current Company' : d.user_type === 'other' ? 'Organization' : 'College'), ph: 'VJTI Mumbai' },
                      { f: 'phone', label: 'Phone', ph: '+91 98765 43210' },
                      { f: 'email', label: 'Email', ph: 'you@email.com' },
                    ].map(({ f, label, ph }) => (
                      <div key={f}>
                        <FieldLabel>{label}</FieldLabel>
                        {editing ? (
                          <input className="input" value={d[f] || ''} placeholder={ph}
                            onChange={e => setDraft(x => ({ ...x, [f]: e.target.value }))} />
                        ) : (
                          <p style={{ fontSize: 13.5, color: 'var(--text-mid)', padding: '6px 0' }}>
                            {d[f] || <em style={{ color: 'var(--text-dim)' }}>—</em>}
                          </p>
                        )}
                      </div>
                    ))}
                    {(d.user_type || 'student') === 'student' && (
                      <div>
                        <FieldLabel>Year</FieldLabel>
                        {editing ? (
                          <select className="input" value={d.year || ''}
                            onChange={e => setDraft(x => ({ ...x, year: e.target.value ? parseInt(e.target.value) : null }))}>
                            <option value="">Select year</option>
                            {[1, 2, 3, 4, 5].map(y => (
                              <option key={y} value={y}>{y}{['st', 'nd', 'rd', 'th', 'th'][y - 1]} Year</option>
                            ))}
                          </select>
                        ) : (
                          <p style={{ fontSize: 13.5, color: 'var(--text-mid)', padding: '6px 0' }}>
                            {d.year ? `${d.year}${['st', 'nd', 'rd', 'th', 'th'][d.year - 1]} Year` : <em style={{ color: 'var(--text-dim)' }}>—</em>}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </EditableSection>

            {/* Contact Info */}
            <EditableSection
              title="contact"
              editKey="contact_info"
              editingKey={editingSection}
              onRequestEdit={requestEdit}
              onSave={() => save({ contact_info: d.contact_info }, { exitEdit: true })}
              onCancel={cancelEdit}
              saving={saving}
            >
              {({ editing }) => {
                const ci = d.contact_info || {};
                const setCI = (k, v) => setDraft(x => ({
                  ...x, contact_info: { ...(x.contact_info || {}), [k]: v },
                }));
                const rows = [
                  { key: 'public_email', label: 'EMAIL',    ph: 'you@email.com' },
                  { key: 'whatsapp',     label: 'WHATSAPP', ph: '+91 98765 43210' },
                  { key: 'telegram',     label: 'TELEGRAM', ph: '@username' },
                  { key: 'twitter',      label: 'X',        ph: '@username' },
                  { key: 'calendly',     label: 'CALENDLY', ph: 'https://calendly.com/you' },
                ];
                return (
                  <>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>
                      How recruiters reach you. Shown on your public profile.
                    </p>
                    <div style={{ border: '1px solid var(--border-mid)' }}>
                      {rows.map(({ key, label, ph }, i) => (
                        <div key={key} style={{
                          display: 'flex', alignItems: 'center',
                          padding: '10px 12px',
                          borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                          background: i % 2 ? 'var(--bg-subtle)' : 'transparent',
                        }}>
                          <span className="mono" style={{
                            fontSize: 10, letterSpacing: '0.1em',
                            color: 'var(--text-dim)', width: 100, flexShrink: 0,
                          }}>{label}</span>
                          {editing ? (
                            <input className="input" style={{ padding: '4px 8px', fontSize: 12 }}
                              value={ci[key] || ''} placeholder={ph}
                              onChange={e => setCI(key, e.target.value)} />
                          ) : (
                            <span style={{
                              fontSize: 12, color: 'var(--text-mid)', flex: 1,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {ci[key] || <em style={{ color: 'var(--text-dim)' }}>—</em>}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                );
              }}
            </EditableSection>
          </div>
        )}

        {/* ═══════ RESUME ═══════ */}
        {activeSection === 'resume' && (
          <div style={{ maxWidth: 720 }}>

            {/* Key links */}
            <EditableSection
              title="key links"
              editKey="key_links"
              editingKey={editingSection}
              onRequestEdit={requestEdit}
              onSave={() => save({ github_url: d.github_url, linkedin_url: d.linkedin_url, portfolio_url: d.portfolio_url }, { exitEdit: true })}
              onCancel={cancelEdit}
              saving={saving}
            >
              {({ editing }) => (
                <div style={{ border: '1px solid var(--border-mid)' }}>
                  {[
                    { key: 'github_url',    label: 'GITHUB',    ph: 'https://github.com/username' },
                    { key: 'linkedin_url',  label: 'LINKEDIN',  ph: 'https://linkedin.com/in/username' },
                    { key: 'portfolio_url', label: 'PORTFOLIO', ph: 'https://yoursite.com' },
                  ].map(({ key, label, ph }, i) => (
                    <div key={key} style={{
                      display: 'flex', alignItems: 'center',
                      padding: '10px 12px',
                      borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                      background: i % 2 ? 'var(--bg-subtle)' : 'transparent',
                    }}>
                      <span className="mono" style={{
                        fontSize: 10, letterSpacing: '0.1em',
                        color: 'var(--text-dim)', width: 100, flexShrink: 0,
                      }}>{label}</span>
                      {editing ? (
                        <input className="input" style={{ padding: '4px 8px', fontSize: 12 }}
                          value={d[key] || ''} placeholder={ph}
                          onChange={e => setDraft(x => ({ ...x, [key]: e.target.value }))} />
                      ) : (
                        d[key]
                          ? <a href={d[key]} target="_blank" rel="noopener noreferrer"
                               className="mono" style={{
                                 fontSize: 11, color: 'var(--blue)', flex: 1,
                                 overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                 textDecoration: 'none',
                               }}>
                              {d[key]} ↗
                            </a>
                          : <span style={{ fontSize: 12, color: 'var(--text-dim)', flex: 1, fontStyle: 'italic' }}>
                              Not set
                            </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </EditableSection>

            {/* Resume PDF */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <Kicker>resume pdf</Kicker>
              </div>
              {d.resume_url ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  border: '1px solid var(--blue)',
                  background: 'var(--blue-tint)',
                  boxShadow: '3px 3px 0 0 var(--ink)',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="var(--blue-deep)" strokeWidth="1.8" strokeLinecap="square">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="mono" style={{
                    flex: 1, fontSize: 11, letterSpacing: '0.08em',
                    color: 'var(--blue-deep)',
                  }}>RESUME UPLOADED</span>
                  <a href={d.resume_url} target="_blank" rel="noopener noreferrer"
                     className="btn btn-sm btn-ghost">VIEW ↗</a>
                  <label className="btn btn-sm btn-dark" style={{ cursor: 'pointer' }}>
                    REPLACE
                    <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleResumeUpload} />
                  </label>
                </div>
              ) : (
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  padding: '36px',
                  border: '2px dashed var(--border-mid)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--blue)';
                    e.currentTarget.style.background = 'var(--blue-tint)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-mid)';
                    e.currentTarget.style.background = 'transparent';
                  }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                       stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="square">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-mid)' }}>
                    DROP PDF · OR BROWSE
                  </span>
                  <span style={{ fontSize: 10.5, color: 'var(--text-dim)' }}>PDF up to 5MB</span>
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleResumeUpload} />
                </label>
              )}
            </Card>

            {/* Summary */}
            <EditableSection
              title="summary"
              editKey="summary"
              editingKey={editingSection}
              onRequestEdit={requestEdit}
              onSave={() => save({ summary: d.summary }, { exitEdit: true })}
              onCancel={cancelEdit}
              saving={saving}
            >
              {({ editing }) => (
                editing
                  ? <textarea className="input" style={{ resize: 'none' }} rows={4}
                      value={d.summary || ''} placeholder="Brief professional summary..."
                      onChange={e => setDraft(x => ({ ...x, summary: e.target.value }))} />
                  : <p style={{
                      fontSize: 13.5, color: 'var(--text-mid)',
                      lineHeight: 1.65, whiteSpace: 'pre-wrap',
                    }}>
                      {d.summary || <em style={{ color: 'var(--text-dim)' }}>Not set</em>}
                    </p>
              )}
            </EditableSection>

            {/* Education */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <Kicker>education / {(d.education || []).length}</Kicker>
                <button onClick={() => setAddingEdu(true)} className="btn btn-sm btn-ghost">+ ADD</button>
              </div>
              {(d.education || []).map((edu, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 14, padding: '12px 0',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 36, height: 36, background: 'var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--cream)', fontWeight: 600 }}>
                      {(edu.school || '').charAt(0).toUpperCase() || 'E'}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="display-serif" style={{ fontSize: 16, marginBottom: 2 }}>{edu.school}</div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-mid)', marginBottom: 2 }}>
                      {edu.degree}{edu.major ? ` · ${edu.major}` : ''}
                    </p>
                    <p className="mono" style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--text-dim)' }}>
                      {edu.startYear || '—'}{edu.endYear ? ` — ${edu.endYear}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const ed = (d.education || []).filter((_, j) => j !== i);
                      setDraft(x => ({ ...x, education: ed }));
                      save({ education: ed });
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                      <path d="M6 6l12 12M18 6l-12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {addingEdu && (
                <div style={{ border: '1px solid var(--ink)', padding: 16, marginTop: 14, background: 'var(--bg-subtle)' }}>
                  <div className="kicker kicker-ink" style={{ marginBottom: 12 }}>▲ new entry</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    {[
                      { f: 'school',    ph: 'University / College *' },
                      { f: 'degree',    ph: 'Bachelor of Science' },
                      { f: 'major',     ph: 'Computer Science' },
                      { f: 'startYear', ph: '2021' },
                      { f: 'endYear',   ph: '2025 (optional)' },
                    ].map(({ f, ph }) => (
                      <input key={f} className="input" value={newEdu[f]} placeholder={ph}
                        onChange={e => setNewEdu(x => ({ ...x, [f]: e.target.value }))} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => {
                      if (!newEdu.school) return;
                      const ed = [...(d.education || []), newEdu];
                      setDraft(x => ({ ...x, education: ed }));
                      save({ education: ed });
                      setNewEdu({ school: '', degree: '', major: '', startYear: '', endYear: '' });
                      setAddingEdu(false);
                    }} className="btn btn-sm btn-primary">ADD</button>
                    <button onClick={() => setAddingEdu(false)} className="btn btn-sm btn-ghost">CANCEL</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Projects */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <Kicker>projects / {(d.projects || []).length}</Kicker>
                <button onClick={() => setAddingProject(true)} className="btn btn-sm btn-ghost">+ ADD</button>
              </div>
              {(d.projects || []).map((p, i) => (
                <div key={i} style={{
                  padding: '14px 0',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div className="display-serif" style={{ fontSize: 16 }}>{p.title || p.name}</div>
                    <button onClick={() => {
                      const pr = (d.projects || []).filter((_, j) => j !== i);
                      setDraft(x => ({ ...x, projects: pr }));
                      save({ projects: pr });
                    }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                        <path d="M6 6l12 12M18 6l-12 12" />
                      </svg>
                    </button>
                  </div>
                  {p.description && (
                    <p style={{ fontSize: 12.5, color: 'var(--text-mid)', marginBottom: 8, lineHeight: 1.6 }}>
                      {p.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(Array.isArray(p.techStack) ? p.techStack : []).map((t, j) => (
                      <span key={j} className="chip">{t}</span>
                    ))}
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                         className="mono" style={{
                           fontSize: 10, letterSpacing: '0.08em',
                           color: 'var(--text-dim)', marginLeft: 'auto',
                           textDecoration: 'none',
                         }}>↗ GITHUB</a>
                    )}
                  </div>
                </div>
              ))}
              {addingProject && (
                <div style={{ border: '1px solid var(--ink)', padding: 16, marginTop: 14, background: 'var(--bg-subtle)' }}>
                  <div className="kicker kicker-ink" style={{ marginBottom: 12 }}>▲ new project</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <input className="input" value={newProject.title} placeholder="Project title *"
                      onChange={e => setNewProject(x => ({ ...x, title: e.target.value }))} />
                    <input className="input" value={newProject.techStack} placeholder="React, Node.js..."
                      onChange={e => setNewProject(x => ({ ...x, techStack: e.target.value }))} />
                  </div>
                  <textarea className="input" style={{ resize: 'none', marginBottom: 10 }} rows={2}
                    value={newProject.description} placeholder="Description"
                    onChange={e => setNewProject(x => ({ ...x, description: e.target.value }))} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <input className="input" value={newProject.projectUrl} placeholder="Live URL"
                      onChange={e => setNewProject(x => ({ ...x, projectUrl: e.target.value }))} />
                    <input className="input" value={newProject.githubUrl} placeholder="GitHub URL"
                      onChange={e => setNewProject(x => ({ ...x, githubUrl: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => {
                      if (!newProject.title) return;
                      const pr = [...(d.projects || []), {
                        ...newProject,
                        techStack: newProject.techStack.split(',').map(t => t.trim()).filter(Boolean),
                        id: Date.now(),
                      }];
                      setDraft(x => ({ ...x, projects: pr }));
                      save({ projects: pr });
                      setNewProject({ title: '', techStack: '', description: '', projectUrl: '', githubUrl: '' });
                      setAddingProject(false);
                    }} className="btn btn-sm btn-primary">ADD PROJECT</button>
                    <button onClick={() => setAddingProject(false)} className="btn btn-sm btn-ghost">CANCEL</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Certifications */}
            <Card>
              <Kicker>certifications / {(d.certifications || []).length}</Kicker>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '12px 0 14px' }}>
                {(d.certifications || []).map((c, i) => (
                  <span key={i} className="chip" style={{ paddingRight: 4 }}>
                    {c}
                    <button onClick={() => {
                      const cer = (d.certifications || []).filter((_, j) => j !== i);
                      setDraft(x => ({ ...x, certifications: cer }));
                      save({ certifications: cer });
                    }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0 0 0 4px', lineHeight: 1, opacity: 0.5 }}>×</button>
                  </span>
                ))}
                {(d.certifications || []).length === 0 && (
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    No certifications yet
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" style={{ flex: 1 }} value={newCert}
                  placeholder="AWS Certified Developer, Google Cloud..."
                  onChange={e => setNewCert(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newCert.trim()) {
                      const cer = [...(d.certifications || []), newCert.trim()];
                      setDraft(x => ({ ...x, certifications: cer }));
                      save({ certifications: cer });
                      setNewCert('');
                    }
                  }} />
                <button onClick={() => {
                  if (!newCert.trim()) return;
                  const cer = [...(d.certifications || []), newCert.trim()];
                  setDraft(x => ({ ...x, certifications: cer }));
                  save({ certifications: cer });
                  setNewCert('');
                }} className={newCert.trim() ? 'btn btn-primary' : 'btn btn-ghost'}>
                  {newCert.trim() ? 'ADD' : '+'}
                </button>
              </div>
            </Card>

            {/* Awards */}
            <Card>
              <Kicker>awards & achievements / {(d.awards || []).length}</Kicker>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '12px 0 14px' }}>
                {(d.awards || []).map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-subtle)',
                  }}>
                    <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="pixel-dot" style={{ background: 'var(--amber)' }} />
                      {a}
                    </span>
                    <button onClick={() => {
                      const aw = (d.awards || []).filter((_, j) => j !== i);
                      setDraft(x => ({ ...x, awards: aw }));
                      save({ awards: aw });
                    }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                        <path d="M6 6l12 12M18 6l-12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" style={{ flex: 1 }} value={newAward}
                  placeholder="1st place at Flipkart GRiD Hackathon..."
                  onChange={e => setNewAward(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newAward.trim()) {
                      const aw = [...(d.awards || []), newAward.trim()];
                      setDraft(x => ({ ...x, awards: aw }));
                      save({ awards: aw });
                      setNewAward('');
                    }
                  }} />
                <button onClick={() => {
                  if (!newAward.trim()) return;
                  const aw = [...(d.awards || []), newAward.trim()];
                  setDraft(x => ({ ...x, awards: aw }));
                  save({ awards: aw });
                  setNewAward('');
                }} className={newAward.trim() ? 'btn btn-primary' : 'btn btn-ghost'}>
                  {newAward.trim() ? 'ADD' : '+'}
                </button>
              </div>
            </Card>

            {/* Competitive & Coding Profiles */}
            <EditableSection
              title="coding profiles"
              editKey="coding_profiles"
              editingKey={editingSection}
              onRequestEdit={requestEdit}
              onSave={() => save({ coding_profiles: d.coding_profiles }, { exitEdit: true })}
              onCancel={cancelEdit}
              saving={saving}
            >
              {({ editing }) => (
                <div style={{ border: '1px solid var(--border-mid)' }}>
                  {Object.entries(PLATFORM_LOGOS).map(([key, { label }], i) => (
                    <div key={key} style={{
                      display: 'flex', alignItems: 'center',
                      padding: '10px 12px',
                      borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                      background: i % 2 ? 'var(--bg-subtle)' : 'transparent',
                    }}>
                      <span className="mono" style={{
                        fontSize: 10, letterSpacing: '0.1em',
                        color: 'var(--text-dim)', width: 120, flexShrink: 0,
                        textTransform: 'uppercase',
                      }}>{label}</span>
                      {editing ? (
                        <input className="input" style={{ padding: '4px 8px', fontSize: 12 }}
                          value={d.coding_profiles?.[key] || ''} placeholder="username"
                          onChange={e => setDraft(x => ({
                            ...x, coding_profiles: { ...(x.coding_profiles || {}), [key]: e.target.value },
                          }))} />
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-mid)', flex: 1 }}>
                          {d.coding_profiles?.[key] || <em style={{ color: 'var(--text-dim)' }}>—</em>}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </EditableSection>

            {/* Other links */}
            <Card>
              <Kicker>other links</Kicker>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '10px 0 14px' }}>
                Papers, talks, open source contributions, etc.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {otherLinks.map((link, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-subtle)',
                  }}>
                    <span className="pixel-dot" style={{ background: 'var(--blue)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text)', flex: 1 }}>{link.label}</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                       className="mono" style={{
                         fontSize: 10.5, letterSpacing: '0.06em', color: 'var(--blue)',
                         textDecoration: 'none',
                         maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                       }}>{link.url} ↗</a>
                    <button onClick={() => {
                      const nl = otherLinks.filter((_, j) => j !== i);
                      setOtherLinks(nl);
                      save({ other_links: nl });
                    }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                        <path d="M6 6l12 12M18 6l-12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8 }}>
                <input className="input" value={newOtherLink.label} placeholder="Label (e.g. Research Paper)"
                  onChange={e => setNewOtherLink(x => ({ ...x, label: e.target.value }))} />
                <input className="input" value={newOtherLink.url} placeholder="https://..."
                  onChange={e => setNewOtherLink(x => ({ ...x, url: e.target.value }))} />
                <button onClick={() => {
                  if (!newOtherLink.url.trim()) return;
                  const nl = [...otherLinks, { label: newOtherLink.label || newOtherLink.url, url: newOtherLink.url }];
                  setOtherLinks(nl);
                  save({ other_links: nl });
                  setNewOtherLink({ label: '', url: '' });
                }} className={newOtherLink.url.trim() ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}>
                  {newOtherLink.url.trim() ? 'ADD' : '+'}
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ═══════ SKILLS & PREFERENCES ═══════ */}
        {activeSection === 'skills' && (() => {
          const addedSkills = d.skills || [];
          const grouped = SKILL_CATS_P.reduce((acc, cat) => {
            const inCat = addedSkills.filter(s => s.category === cat);
            if (inCat.length > 0) acc[cat] = inCat;
            return acc;
          }, {});

          const LEVELS = [
            { v: 1, label: 'Beginner',     desc: 'Just started learning' },
            { v: 2, label: 'Elementary',   desc: 'Built a few small things' },
            { v: 3, label: 'Intermediate', desc: 'Used in real projects' },
            { v: 4, label: 'Advanced',     desc: 'Deep knowledge, prod use' },
            { v: 5, label: 'Expert',       desc: 'Mentor others, go-to person' },
          ];

          const confirmAdd = (level) => {
            if (!pendingSkill) return;
            const skillDef = SKILL_OPTIONS_P.find(s => s.name === pendingSkill);
            const category = skillDef ? skillDef.cat : skillCat;
            setDraft(x => ({
              ...x, skills: [...(x.skills || []), { id: Date.now(), name: pendingSkill, level, category }],
            }));
            setPendingSkill(null);
            setSkillSearch('');
          };

          const searchLower = skillSearch.trim().toLowerCase();
          const filteredSkills = searchLower
            ? SKILL_OPTIONS_P.filter(s => s.name.toLowerCase().includes(searchLower))
            : SKILL_OPTIONS_P.filter(s => s.cat === skillCat);
          const isCustomSkill = searchLower && !SKILL_OPTIONS_P.some(s => s.name.toLowerCase() === searchLower);

          return (
            <div style={{ maxWidth: 780 }}>
              {/* Level picker modal — brutalist */}
              {pendingSkill && (
                <>
                  <div onClick={() => setPendingSkill(null)} style={{
                    position: 'fixed', inset: 0, zIndex: 400,
                    background: 'rgba(20,19,14,0.35)', backdropFilter: 'blur(2px)',
                  }} />
                  <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    zIndex: 401, background: 'var(--bg-card)', border: '1px solid var(--ink)',
                    boxShadow: '5px 5px 0 0 var(--ink)',
                    padding: '26px 28px', width: 380,
                  }}>
                    <div className="kicker kicker-ink" style={{ marginBottom: 10 }}>▲ skill level</div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6,
                    }}>
                      <span style={{ fontSize: 18, display: 'flex', alignItems: 'center' }}>
                        {getSkillLogo(pendingSkill)}
                      </span>
                      <p className="display-serif" style={{ fontSize: 22 }}>{pendingSkill}</p>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 18 }}>
                      How well do you know this?
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {LEVELS.map((lv, idx) => (
                        <button key={lv.v} onClick={() => confirmAdd(lv.v)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '11px 14px',
                            border: '1px solid var(--border-mid)',
                            borderTop: idx > 0 ? 'none' : '1px solid var(--border-mid)',
                            background: 'transparent',
                            cursor: 'pointer', textAlign: 'left',
                            transition: 'background 0.1s, border-color 0.1s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--blue-tint)';
                            e.currentTarget.style.borderColor = 'var(--blue)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'var(--border-mid)';
                          }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1, 2, 3, 4, 5].map(dot => (
                                <div key={dot} style={{
                                  width: 6, height: 6,
                                  background: dot <= lv.v ? 'var(--blue)' : 'var(--border-mid)',
                                }} />
                              ))}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                              {lv.label}
                            </span>
                          </div>
                          <span className="mono" style={{
                            fontSize: 10, letterSpacing: '0.06em', color: 'var(--text-dim)',
                          }}>
                            {lv.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setPendingSkill(null)}
                      className="btn btn-sm btn-ghost" style={{ width: '100%', marginTop: 14 }}>
                      CANCEL
                    </button>
                  </div>
                </>
              )}

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <div>
                  <div className="kicker" style={{ marginBottom: 4 }}>▲ technical stack</div>
                  <div className="display-serif" style={{ fontSize: 26 }}>
                    {addedSkills.length} skill{addedSkills.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <button onClick={() => save({ skills: d.skills || [] })} disabled={saving}
                  className="btn btn-primary btn-sm">
                  {saving ? 'SAVING…' : 'SAVE SKILLS'}
                </button>
              </div>

              {/* Search bar */}
              <div style={{ marginBottom: 18, position: 'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="square"
                     style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" />
                </svg>
                <input className="input" style={{ paddingLeft: 34, fontSize: 13 }}
                  value={skillSearch}
                  placeholder="Search skills (web dev, html, dsa, flutter...)"
                  onChange={e => setSkillSearch(e.target.value)} />
                {skillSearch && (
                  <button onClick={() => setSkillSearch('')}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-dim)',
                      fontSize: 18, cursor: 'pointer', lineHeight: 1,
                    }}>×</button>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: skillSearch ? '1fr' : '180px 1fr',
                gap: 20, alignItems: 'start',
              }}>
                {/* Category nav */}
                {!skillSearch && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--border-mid)' }}>
                    {SKILL_CATS_P.map((cat, idx) => {
                      const cnt = addedSkills.filter(s => s.category === cat).length;
                      const active = skillCat === cat;
                      return (
                        <button key={cat} onClick={() => setSkillCat(cat)}
                          className="mono"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px',
                            border: 'none',
                            borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                            cursor: 'pointer', textAlign: 'left',
                            background: active ? 'var(--ink)' : 'transparent',
                            color: active ? 'var(--cream)' : 'var(--text-mid)',
                            fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                            fontWeight: active ? 600 : 400,
                          }}>
                          <span>{cat}</span>
                          {cnt > 0 && (
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              padding: '1px 6px',
                              background: active ? 'var(--blue)' : 'var(--blue-tint)',
                              color: active ? '#fff' : 'var(--blue-deep)',
                            }}>{cnt}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Right panel */}
                <div>
                  {/* Picker card */}
                  <div className="card" style={{ padding: '16px 18px', marginBottom: 20 }}>
                    <div className="kicker kicker-ink" style={{ marginBottom: 12 }}>
                      ▲ {skillSearch ? `search results / ${filteredSkills.length}` : skillCat}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {filteredSkills.length === 0 && !isCustomSkill && (
                        <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No skills found.</p>
                      )}
                      {filteredSkills.map(skill => {
                        const added = addedSkills.some(s => s.name === skill.name);
                        return (
                          <button key={skill.name}
                            onClick={() => { if (!added) setPendingSkill(skill.name); }}
                            className="mono"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '5px 10px',
                              fontSize: 11, letterSpacing: '0.04em',
                              cursor: added ? 'default' : 'pointer',
                              border: '1px solid ' + (added ? 'var(--blue)' : 'var(--border-mid)'),
                              background: added ? 'var(--blue-tint)' : 'var(--bg-card)',
                              color: added ? 'var(--blue-deep)' : 'var(--text-mid)',
                              transition: 'all 0.1s',
                            }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>{getSkillLogo(skill.name)}</span>
                            {added ? '✓ ' : '+ '}{skill.name}
                          </button>
                        );
                      })}
                      {isCustomSkill && (
                        <button onClick={() => setPendingSkill(skillSearch.trim())}
                          className="mono"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '5px 10px',
                            fontSize: 11, letterSpacing: '0.04em',
                            cursor: 'pointer',
                            border: '1px dashed var(--blue)',
                            background: 'var(--blue-tint)',
                            color: 'var(--blue-deep)',
                          }}>
                          + Add "{skillSearch.trim()}" as custom
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Added skills — grouped */}
                  {addedSkills.length > 0 ? (
                    <div>
                      {Object.entries(grouped).map(([cat, skills]) => (
                        <div key={cat} style={{ marginBottom: 22 }}>
                          <div className="kicker" style={{ marginBottom: 10 }}>▲ {cat}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {skills.map((skill) => {
                              const i = addedSkills.findIndex(s => s.name === skill.name);
                              return (
                                <div key={skill.id || skill.name}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '7px 10px 7px 10px',
                                    border: '1px solid var(--border-mid)',
                                    background: 'var(--bg-card)',
                                    fontSize: 12, color: 'var(--text)',
                                  }}
                                  title={`${skill.name} · ${LEVEL_LABELS_P[skill.level]}`}>
                                  <span style={{ display: 'flex', alignItems: 'center' }}>{getSkillLogo(skill.name)}</span>
                                  <span style={{ fontWeight: 500 }}>{skill.name}</span>
                                  <div style={{ display: 'flex', gap: 2 }}>
                                    {[1, 2, 3, 4, 5].map(lv => (
                                      <div key={lv} style={{
                                        width: 4, height: 4,
                                        background: skill.level >= lv ? 'var(--blue)' : 'var(--border-mid)',
                                      }} />
                                    ))}
                                  </div>
                                  <button onClick={() => setDraft(x => ({
                                    ...x, skills: (x.skills || []).filter((_, j) => j !== i),
                                  }))}
                                    style={{
                                      background: 'none', border: 'none', cursor: 'pointer',
                                      color: 'var(--text-dim)', padding: 0, lineHeight: 1,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                                      <path d="M6 6l12 12M18 6l-12 12" />
                                    </svg>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '32px', textAlign: 'center',
                      border: '2px dashed var(--border-mid)',
                    }}>
                      <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                        Search or browse by category — pick a skill, then choose your level
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Preferences (merged) ── */}
              <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--border-mid)' }}>
                <div className="kicker" style={{ marginBottom: 6 }}>▲ preferences</div>
                <div className="display-serif" style={{ fontSize: 26, marginBottom: 20 }}>
                  Work preferences
                </div>

                <EditableSection
                  title="work preferences"
                  editKey="work_prefs"
                  editingKey={editingSection}
                  onRequestEdit={requestEdit}
                  onSave={() => save({
                    preferred_roles: d.preferred_roles,
                    availability: d.availability,
                    work_preference: d.work_preference,
                    min_stipend: d.min_stipend,
                  }, { exitEdit: true })}
                  onCancel={cancelEdit}
                  saving={saving}
                >
                  {({ editing }) => (
                    <>
                      <FieldLabel>Preferred Roles</FieldLabel>
                      {editing ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 20 }}>
                          {ROLE_OPTIONS_P.map(role => {
                            const sel = (d.preferred_roles || []).includes(role);
                            return (
                              <button key={role}
                                onClick={() => setDraft(x => ({
                                  ...x,
                                  preferred_roles: sel
                                    ? (x.preferred_roles || []).filter(r => r !== role)
                                    : [...(x.preferred_roles || []), role],
                                }))}
                                className="mono"
                                style={{
                                  padding: '8px 12px',
                                  fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                                  cursor: 'pointer', textAlign: 'left',
                                  border: '1px solid ' + (sel ? 'var(--blue)' : 'var(--border-mid)'),
                                  background: sel ? 'var(--blue-tint)' : 'transparent',
                                  color: sel ? 'var(--blue-deep)' : 'var(--text-mid)',
                                  fontWeight: sel ? 500 : 400,
                                }}>
                                {role}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                          {(d.preferred_roles || []).length > 0
                            ? (d.preferred_roles || []).map(r => (
                                <span key={r} className="chip chip-blue-tint">{r}</span>
                              ))
                            : <span style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>No roles selected</span>}
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                          <FieldLabel>Availability</FieldLabel>
                          {editing ? (
                            <select className="input" value={d.availability || 'Immediate'}
                              onChange={e => setDraft(x => ({ ...x, availability: e.target.value }))}>
                              <option>Immediate</option>
                              <option>After exams</option>
                              <option>Next semester</option>
                              <option>Not available</option>
                            </select>
                          ) : (
                            <p style={{ fontSize: 13.5, color: 'var(--text-mid)', padding: '6px 0' }}>{d.availability || '—'}</p>
                          )}
                        </div>
                        <div>
                          <FieldLabel>Work Preference</FieldLabel>
                          {editing ? (
                            <select className="input" value={d.work_preference || 'remote'}
                              onChange={e => setDraft(x => ({ ...x, work_preference: e.target.value }))}>
                              <option value="remote">Remote</option>
                              <option value="onsite">On-site</option>
                              <option value="hybrid">Hybrid</option>
                              <option value="any">Any</option>
                            </select>
                          ) : (
                            <p style={{ fontSize: 13.5, color: 'var(--text-mid)', padding: '6px 0', textTransform: 'capitalize' }}>
                              {d.work_preference || '—'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <FieldLabel>Min Stipend</FieldLabel>
                        {editing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="mono" style={{ fontSize: 14, color: 'var(--text-dim)' }}>₹</span>
                            <input className="input" style={{ maxWidth: 160 }}
                              type="number" value={d.min_stipend || ''} placeholder="0"
                              onChange={e => setDraft(x => ({ ...x, min_stipend: e.target.value }))} />
                            <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                              / MONTH
                            </span>
                          </div>
                        ) : (
                          <p style={{ fontSize: 13.5, color: 'var(--text-mid)', padding: '6px 0' }}>
                            {d.min_stipend ? `₹${d.min_stipend} / month` : '—'}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </EditableSection>
              </div>
            </div>
          );
        })()}

        {/* ═══════ JOURNEY ═══════ */}
        {activeSection === 'journey' && (
          <div style={{ maxWidth: 740 }}>
            <div style={{ marginBottom: 32 }}>
              <div className="kicker" style={{ marginBottom: 6 }}>▲ my journey</div>
              <div className="display-serif" style={{ fontSize: 32, lineHeight: 1.1, marginBottom: 10 }}>
                The path so far.
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 480 }}>
                Work experience, past projects, what you're building now. Tell the story in order.
              </p>
            </div>

            {/* Timeline */}
            <div style={{ position: 'relative' }}>
              {(d.journey || []).length > 0 && (
                <div style={{
                  position: 'absolute', left: 7, top: 8, bottom: 8,
                  width: 2, background: 'var(--border-mid)',
                }} />
              )}

              {(d.journey || []).map((j, i) => {
                const typeCfg = {
                  current:   { chip: 'chip-green',     label: 'CURRENTLY' },
                  past:      { chip: 'chip-blue-tint', label: 'PAST' },
                  side:      { chip: 'chip-solid',     label: 'SIDE PROJECT' },
                  education: { chip: 'chip-amber',     label: 'LEARNING' },
                };
                const tc = typeCfg[j.type] || typeCfg.past;
                return (
                  <div key={i} style={{ position: 'relative', paddingLeft: 36, marginBottom: 16 }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 12,
                      width: 16, height: 16,
                      background: 'var(--blue)',
                      border: '3px solid var(--bg)',
                      zIndex: 1,
                    }} />
                    <div className="card" style={{ padding: '16px 20px' }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        marginBottom: 6,
                      }}>
                        <div style={{ flex: 1 }}>
                          <span className={'chip ' + tc.chip} style={{ marginBottom: 8 }}>{tc.label}</span>
                          <div className="display-serif" style={{ fontSize: 18, marginTop: 8, marginBottom: 2 }}>
                            {j.title}
                          </div>
                          {j.company && (
                            <p style={{ fontSize: 12.5, color: 'var(--text-mid)', marginBottom: 4 }}>{j.company}</p>
                          )}
                          <p className="mono" style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--text-dim)' }}>
                            {j.startDate || '—'}{j.endDate ? ` → ${j.endDate}` : j.type === 'current' ? ' → PRESENT' : ''}
                          </p>
                        </div>
                        <button onClick={() => {
                          const jr = (d.journey || []).filter((_, k) => k !== i);
                          setDraft(x => ({ ...x, journey: jr }));
                          save({ journey: jr });
                        }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                            <path d="M6 6l12 12M18 6l-12 12" />
                          </svg>
                        </button>
                      </div>
                      {j.description && (
                        <p style={{ fontSize: 12.5, color: 'var(--text-mid)', lineHeight: 1.65, marginTop: 8, whiteSpace: 'pre-wrap' }}>
                          {j.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {(d.journey || []).length === 0 && !addingJourney && (
                <div style={{
                  padding: '48px 24px', textAlign: 'center',
                  border: '2px dashed var(--border-mid)',
                  marginBottom: 16,
                }}>
                  <div className="display-serif" style={{ fontSize: 20, color: 'var(--text)', marginBottom: 6 }}>
                    No entries yet.
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                    Add your first — currently working on, past experience, or side projects.
                  </p>
                </div>
              )}
            </div>

            {/* Add form */}
            {addingJourney ? (
              <div className="card" style={{ padding: 20, border: '1px solid var(--ink)' }}>
                <div className="kicker kicker-ink" style={{ marginBottom: 14 }}>▲ new entry</div>
                <div style={{ marginBottom: 14 }}>
                  <FieldLabel>Type</FieldLabel>
                  <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
                    {[
                      { v: 'current',   label: 'Currently' },
                      { v: 'past',      label: 'Past' },
                      { v: 'side',      label: 'Side project' },
                      { v: 'education', label: 'Learning' },
                    ].map((opt, idx) => {
                      const sel = newJourney.type === opt.v;
                      return (
                        <button key={opt.v}
                          onClick={() => setNewJourney(x => ({ ...x, type: opt.v }))}
                          className="mono"
                          style={{
                            padding: '7px 12px',
                            fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                            border: '1px solid ' + (sel ? 'var(--ink)' : 'var(--border-mid)'),
                            marginLeft: idx > 0 ? -1 : 0,
                            background: sel ? 'var(--ink)' : 'transparent',
                            color: sel ? 'var(--cream)' : 'var(--text-mid)',
                            cursor: 'pointer',
                          }}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <input className="input" value={newJourney.title} placeholder="Title / Role *"
                    onChange={e => setNewJourney(x => ({ ...x, title: e.target.value }))} />
                  <input className="input" value={newJourney.company} placeholder="Company / Org"
                    onChange={e => setNewJourney(x => ({ ...x, company: e.target.value }))} />
                  <input className="input" value={newJourney.startDate} placeholder="Start (e.g. Jan 2024)"
                    onChange={e => setNewJourney(x => ({ ...x, startDate: e.target.value }))} />
                  <input className="input" value={newJourney.endDate} placeholder="End (leave blank if ongoing)"
                    onChange={e => setNewJourney(x => ({ ...x, endDate: e.target.value }))} />
                </div>
                <textarea className="input" style={{ resize: 'none', marginBottom: 12 }} rows={3}
                  value={newJourney.description} placeholder="What you did / are doing..."
                  onChange={e => setNewJourney(x => ({ ...x, description: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => {
                    if (!newJourney.title.trim()) return;
                    const jr = [{ ...newJourney, id: Date.now() }, ...(d.journey || [])];
                    setDraft(x => ({ ...x, journey: jr }));
                    save({ journey: jr });
                    setNewJourney({ type: 'current', title: '', company: '', startDate: '', endDate: '', description: '' });
                    setAddingJourney(false);
                  }} className="btn btn-sm btn-primary">ADD</button>
                  <button onClick={() => setAddingJourney(false)} className="btn btn-sm btn-ghost">CANCEL</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingJourney(true)} className="btn">+ ADD ENTRY</button>
            )}
          </div>
        )}

        {/* ═══════ MY HUNT — public ═══════ */}
        {activeSection === 'myhunt' && (
          <div style={{ maxWidth: 620 }}>
            <div style={{ marginBottom: 44 }}>
              <div className="kicker kicker-blue" style={{ marginBottom: 10 }}>
                ▲ public · visible on your profile
              </div>
              <div className="display-serif" style={{ fontSize: 40, lineHeight: 1.1, marginBottom: 12 }}>
                What are you<br />
                <em style={{ fontStyle: 'italic', color: 'var(--blue)' }}>really</em> hunting for?
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.7, maxWidth: 480 }}>
                Not your resume. Not the job title. The real stuff — your drives, your beliefs,
                your <em>why</em>. Recruiters see this when they view your profile.
              </p>
            </div>

            {[
              { n: '01', key: 'my_hunt',    title: 'The Hunt',        sub: 'Not the job title. What are you actually after?',
                ph: "I'm hunting for the place where craft meets impact. Not just shipping features — building something that actually changes how someone spends their day..." },
              { n: '02', key: 'philosophy', title: 'Philosophy',      sub: 'How you see the world. What you believe is true.',
                ph: "I believe the best products start with genuine frustration — your own. You can't design well for problems you've never felt..." },
              { n: '03', key: 'inspirations', title: 'What moves you', sub: 'Books, people, ideas that rewired how you think.',
                ph: "Paul Graham's essays got me comfortable with uncertainty. The Mom Test made me rethink every conversation I'd had with users..." },
              { n: '04', key: 'life_outside', title: 'Life outside work', sub: 'Who are you when the laptop is closed?',
                ph: "Cricket every Sunday morning — I bowl medium-pace. Three years of Carnatic music before I pivoted to code. Still cook every meal..." },
            ].map((s, idx, arr) => (
              <React.Fragment key={s.key}>
                <div style={{ marginBottom: 40 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                    <span className="display-serif" style={{ fontSize: 20, color: 'var(--blue)', fontStyle: 'italic' }}>
                      {s.n}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div className="display-serif" style={{ fontSize: 20, marginBottom: 3 }}>{s.title}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{s.sub}</p>
                    </div>
                    {d[s.key] && (
                      <button onClick={() => save({ [s.key]: d[s.key] })} className="btn btn-sm btn-primary">
                        SAVE
                      </button>
                    )}
                  </div>
                  <textarea
                    value={d[s.key] || ''}
                    onChange={e => setDraft(x => ({ ...x, [s.key]: e.target.value }))}
                    placeholder={s.ph}
                    className="input"
                    style={{
                      resize: 'none', lineHeight: 1.8, fontSize: 14,
                      padding: '12px 0',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-mid)',
                    }}
                    rows={4}
                  />
                </div>
                {idx < arr.length - 1 && <div style={{ height: 1, background: 'var(--border)', marginBottom: 40 }} />}
              </React.Fragment>
            ))}

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 40 }} />

            {/* Quote */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <span className="display-serif" style={{ fontSize: 26, color: 'var(--blue)', lineHeight: 1 }}>"</span>
                <div style={{ flex: 1 }}>
                  <div className="display-serif" style={{ fontSize: 20, marginBottom: 3 }}>A line you live by</div>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Something that keeps pulling you forward.</p>
                </div>
                {d.quote && (
                  <button onClick={() => save({ quote: d.quote, quote_author: d.quote_author })}
                    className="btn btn-sm btn-primary">SAVE</button>
                )}
              </div>
              {d.quote ? (
                <div style={{ borderLeft: '2px solid var(--blue)', paddingLeft: 20, marginBottom: 16 }}>
                  <p className="display-serif" style={{
                    fontSize: 24, fontStyle: 'italic', color: 'var(--text)',
                    lineHeight: 1.5, marginBottom: 8,
                  }}>"{d.quote}"</p>
                  {d.quote_author && (
                    <p className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
                      — {d.quote_author}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ borderLeft: '2px solid var(--border-mid)', paddingLeft: 20, marginBottom: 16 }}>
                  <p className="display-serif" style={{ fontSize: 18, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    Your quote will appear here…
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input className="input" style={{ fontSize: 14, fontFamily: 'var(--serif)', fontStyle: 'italic' }}
                  value={d.quote || ''}
                  placeholder="The people who are crazy enough to think they can change the world…"
                  onChange={e => setDraft(x => ({ ...x, quote: e.target.value }))} />
                <input className="input" style={{ fontSize: 12 }}
                  value={d.quote_author || ''}
                  placeholder="— Steve Jobs (or write your own)"
                  onChange={e => setDraft(x => ({ ...x, quote_author: e.target.value }))} />
              </div>
            </div>
          </div>
        )}

        {/* ═══════ REVIEWS & RATINGS ═══════ */}
        {activeSection === 'reviews' && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ marginBottom: 32 }}>
              <div className="kicker" style={{ marginBottom: 6 }}>▲ reviews & ratings</div>
              <div className="display-serif" style={{ fontSize: 32, lineHeight: 1.1, marginBottom: 10 }}>
                What recruiters say.
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 460 }}>
                After internships close, recruiters rate your performance. These ratings are
                visible to future recruiters and boost your HUNT Score.
              </p>
            </div>
            <div style={{
              padding: '64px 32px', textAlign: 'center',
              border: '2px dashed var(--border-mid)',
              background: 'var(--bg-card)',
            }}>
              <div style={{
                width: 56, height: 56,
                background: 'var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--cream)" stroke="none">
                  <path d="M12 3l2.8 6.4L22 10l-5 5 1.3 7L12 18.5 5.7 22 7 15 2 10l7.2-.6z" />
                </svg>
              </div>
              <div className="display-serif" style={{ fontSize: 22, marginBottom: 6 }}>
                No reviews yet.
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', maxWidth: 340, margin: '0 auto', lineHeight: 1.6 }}>
                Complete an internship through HUNT and your recruiter will be invited to leave a review.
                Those reviews build your reputation here.
              </p>
            </div>
          </div>
        )}

        {/* ═══════ HUNT SCORE ═══════ */}
        {activeSection === 'huntscore' && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ marginBottom: 32 }}>
              <div className="kicker" style={{ marginBottom: 6 }}>▲ hunt score</div>
              <div className="display-serif" style={{ fontSize: 32, lineHeight: 1.1, marginBottom: 10 }}>
                Your signal, scored.
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 500 }}>
                Your HUNT Score is a dynamic credibility score built from verified skills,
                project proof, recruiter feedback, and consistency. Recruiters see it. Make it count.
              </p>
            </div>

            <div className="card" style={{
              padding: 32, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 28,
            }}>
              <div style={{
                width: 88, height: 88,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span className="display-serif" style={{ fontSize: 30, color: 'var(--text-dim)' }}>—</span>
              </div>
              <div>
                <div className="kicker kicker-ink" style={{ marginBottom: 6 }}>▲ not yet calculated</div>
                <div className="display-serif" style={{ fontSize: 18, marginBottom: 6 }}>
                  Score unlocks after your first hire.
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6 }}>
                  Complete your profile, add verified projects, and get your first
                  recruiter rating to unlock your score.
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ border: '1px solid var(--border-mid)' }}>
              {[
                { label: 'Profile completeness', desc: 'Name, college, bio, photo',           done: false },
                { label: 'Verified skills',      desc: 'Skills with proof of work',             done: false },
                { label: 'Project portfolio',    desc: 'At least 2 projects with links',        done: false },
                { label: 'First recruiter rating', desc: 'Complete an internship through HUNT', done: false },
                { label: 'Response rate',        desc: 'Reply to messages within 48h',           done: false },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  background: i % 2 ? 'var(--bg-subtle)' : 'transparent',
                }}>
                  <div style={{
                    width: 14, height: 14,
                    border: '2px solid ' + (item.done ? 'var(--blue)' : 'var(--border-mid)'),
                    background: item.done ? 'var(--blue)' : 'transparent',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: item.done ? 'var(--text)' : 'var(--text-mid)', marginBottom: 2 }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{item.desc}</p>
                  </div>
                  <span className="mono" style={{
                    fontSize: 10, letterSpacing: '0.1em',
                    color: item.done ? 'var(--blue)' : 'var(--text-dim)',
                    fontWeight: item.done ? 600 : 400,
                  }}>
                    {item.done ? 'DONE' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ ACCOUNT ═══════ */}
        {activeSection === 'account' && (
          <div style={{ maxWidth: 580 }}>
            <div className="kicker" style={{ marginBottom: 6 }}>▲ account · private to you</div>
            <div className="display-serif" style={{ fontSize: 26, marginBottom: 22 }}>
              Account settings
            </div>

            {/* Identity card */}
            <Card>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 16px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                marginBottom: 20,
              }}>
                {d.avatar_url ? (
                  <img src={d.avatar_url} alt="avatar" style={{
                    width: 52, height: 52, objectFit: 'cover',
                    border: '2px solid var(--ink)',
                  }} />
                ) : (
                  <div style={{
                    width: 52, height: 52,
                    background: 'var(--blue)',
                    border: '2px solid var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--serif)', fontSize: 20, color: '#fff',
                    flexShrink: 0,
                  }}>{initials}</div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    {d.full_name}
                  </p>
                  <p className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
                    {d.email}
                  </p>
                </div>
                <label className="btn btn-sm btn-ghost" style={{ cursor: 'pointer' }}>
                  CHANGE AVATAR
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </label>
              </div>
              <div>
                <FieldLabel>Change email</FieldLabel>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" style={{ flex: 1 }} type="email"
                    value={newEmail} placeholder="new@email.com"
                    onChange={e => setNewEmail(e.target.value)} />
                  <button onClick={handleChangeEmail} disabled={changingEmail}
                    className="btn btn-sm btn-dark" style={{ whiteSpace: 'nowrap' }}>
                    {changingEmail ? 'CHANGING…' : 'CHANGE'}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
                  A confirmation link will be sent to the new email (OTP verification coming soon)
                </p>
              </div>
            </Card>

            {/* Notifications */}
            <Card>
              <Kicker>notifications</Kicker>
              <div style={{ marginTop: 14 }}>
                {[
                  { label: 'New job matches',     sub: 'When a job matches your skills',       key: 'notif_matches' },
                  { label: 'Application updates', sub: 'When recruiters view your profile',    key: 'notif_apps' },
                  { label: 'Weekly digest',       sub: 'Summary every Monday',                 key: 'notif_digest' },
                  { label: 'Interview invites',   sub: 'Direct interview invitations',         key: 'notif_interviews' },
                ].map(({ label, sub, key }, i) => (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0',
                    borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{sub}</p>
                    </div>
                    <Toggle_P
                      on={d[key] !== false}
                      onChange={val => {
                        setDraft(x => ({ ...x, [key]: val }));
                        save({ [key]: val }, { silent: true });
                      }} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Appearance */}
            <Card>
              <Kicker>appearance</Kicker>
              <div style={{ display: 'flex', gap: 0, marginTop: 14 }}>
                {[
                  { v: 'light', label: '☀ LIGHT' },
                  { v: 'dark',  label: '☾ DARK' },
                ].map((t, idx) => {
                  const sel = theme === t.v;
                  return (
                    <button key={t.v}
                      onClick={() => setTheme(t.v)}
                      className="mono"
                      style={{
                        flex: 1, padding: '12px',
                        fontSize: 11, letterSpacing: '0.1em', fontWeight: sel ? 600 : 400,
                        border: '1px solid ' + (sel ? 'var(--ink)' : 'var(--border-mid)'),
                        marginLeft: idx > 0 ? -1 : 0,
                        background: sel ? 'var(--ink)' : 'transparent',
                        color: sel ? 'var(--cream)' : 'var(--text-mid)',
                        cursor: 'pointer',
                      }}>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Privacy */}
            <Card>
              <Kicker>privacy</Kicker>
              <div style={{ marginTop: 14 }}>
                {[
                  { label: 'Visible to recruiters', sub: 'Recruiters can find your profile',  key: 'privacy_visible', def: true },
                  { label: 'Show college name',     sub: 'Display your college on profile',    key: 'privacy_college', def: true },
                  { label: 'Activity status',       sub: 'Show when last active',              key: 'privacy_activity', def: false },
                ].map(({ label, sub, key, def }, i) => (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0',
                    borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{sub}</p>
                    </div>
                    <Toggle_P
                      on={d[key] !== undefined ? d[key] : def}
                      onChange={val => {
                        setDraft(x => ({ ...x, [key]: val }));
                        save({ [key]: val }, { silent: true });
                      }} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Session actions */}
            <Card>
              <Kicker>session</Kicker>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                <button onClick={handleSignOut} className="btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                    <path d="M15 3h4v18h-4" />
                    <path d="M10 8l-4 4 4 4M6 12h11" />
                  </svg>
                  SIGN OUT
                </button>
                <button onClick={handlePauseAccount}
                  className={d.account_paused ? 'btn btn-primary' : 'btn'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  {d.account_paused ? 'RESUME ACCOUNT' : 'PAUSE ACCOUNT'}
                </button>
                {d.account_paused && (
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>
                    Account paused — recruiters can't see your profile
                  </p>
                )}
              </div>
            </Card>

            {/* Danger zone */}
            <div style={{
              padding: '18px 20px',
              border: '1px solid var(--red)',
              background: 'var(--red-tint)',
            }}>
              <div className="kicker" style={{ color: 'var(--red)', marginBottom: 6 }}>▲ danger zone</div>
              <p style={{ fontSize: 13, color: 'var(--red)', marginBottom: 12, lineHeight: 1.5 }}>
                Permanently delete your account. Cannot be undone.
              </p>
              <button onClick={() => {
                if (window.confirm('Delete your account? This cannot be undone.'))
                  showToast('Delete coming soon', 'err');
              }}
                className="btn btn-sm"
                style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
                DELETE ACCOUNT
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
