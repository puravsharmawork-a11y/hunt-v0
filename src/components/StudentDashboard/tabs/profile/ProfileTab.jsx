import React from 'react';
import {
  SKILL_OPTIONS_P, SKILL_CATS_P, LEVEL_LABELS_P, ROLE_OPTIONS_P,
  inp_p, Toggle_P, getSkillLogo, PLATFORM_LOGOS,
} from './constants';

// ═══════════════════════════════════════════════════════════════════════════════
// ⚠️ CRITICAL: ALL SUB-COMPONENTS DEFINED OUTSIDE ProfileTab
// Defining them inside caused React to remount inputs on every keystroke.
// ═══════════════════════════════════════════════════════════════════════════════

const Card = ({ children, style: s = {} }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 0, padding: '20px 22px', marginBottom: 14, ...s }}>{children}</div>
);

const FieldLabel = ({ children }) => (
  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>{children}</p>
);

const PencilIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
);

const EditSaveBtn = ({ editing, onEdit, onSave, saving }) => {
  if (!editing) {
    return (
      <button onClick={onEdit} title="Edit" style={{
        width: 28, height: 28, borderRadius: 0, border: '1px solid var(--border)',
        background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)'; }}>
        <PencilIcon />
      </button>
    );
  }
  return (
    <button onClick={onSave} disabled={saving} style={{
      padding: '6px 14px', borderRadius: 0, border: 'none', background: 'var(--green)', color: '#fff',
      fontSize: 12, fontWeight: 600, cursor: saving ? 'default' : 'pointer',
      opacity: saving ? 0.6 : 1, fontFamily: 'inherit',
    }}>
      {saving ? 'Saving...' : 'Save'}
    </button>
  );
};

const ConfirmEditModal = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }} />
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 401, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 0, padding: '24px 28px', width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
      <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>Edit this section?</p>
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 18, lineHeight: 1.5 }}>You'll be able to make changes. Don't forget to save when you're done.</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '7px 14px', borderRadius: 0, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
        <button onClick={onConfirm} style={{ padding: '7px 14px', borderRadius: 0, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Yes, edit</button>
      </div>
    </div>
  </>
);

const EditableSection = ({ title, editKey, editingKey, onRequestEdit, onSave, onCancel, saving, children }) => {
  const isEditing = editingKey === editKey;
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {isEditing && (
            <button onClick={onCancel} style={{ padding: '6px 12px', borderRadius: 0, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          )}
          <EditSaveBtn editing={isEditing} onEdit={() => onRequestEdit(editKey)} onSave={onSave} saving={saving} />
        </div>
      </div>
      {children({ editing: isEditing })}
    </Card>
  );
};

// ── Real platform logos (same as onboarding) ──────────────────────────────────
const PlatformLogos = {
  leetcode: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFA116">
      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H19.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
    </svg>
  ),
  codechef: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#5B4638">
      <path d="M11.257.004C5.858-.114 1.83 4.33 1.945 9.728c-.014 2.76 1.202 5.205 3.15 6.87L4.4 18.45l1.967 2.307.87-1.02c1.54 1.024 3.394 1.615 5.396 1.615 2.003 0 3.856-.59 5.397-1.614l.87 1.02 1.966-2.308-.696-1.852c1.948-1.666 3.164-4.11 3.15-6.87.115-5.398-3.913-9.842-9.313-9.724h.25z"/>
    </svg>
  ),
  codeforces: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1F8ACB">
      <path d="M4.5 7.5A1.5 1.5 0 0 1 6 9v10.5A1.5 1.5 0 0 1 4.5 21h-3A1.5 1.5 0 0 1 0 19.5V9a1.5 1.5 0 0 1 1.5-1.5h3zm9-4.5A1.5 1.5 0 0 1 15 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 19.5v-15A1.5 1.5 0 0 1 10.5 3h3zm9 7.5A1.5 1.5 0 0 1 24 12v7.5A1.5 1.5 0 0 1 22.5 21h-3a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5h3z"/>
    </svg>
  ),
  kaggle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#20BEFF">
      <path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .237.05.285.14.046.094.034.2-.038.32l-6.321 6.025 6.495 8.076c.086.104.1.208.073.3z"/>
    </svg>
  ),
  hackerrank: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#00EA64">
      <path d="M12 0c1.285 0 9.75 4.886 10.392 6 .645 1.115.645 11.885 0 13-.642 1.114-9.107 6-10.392 6-1.284 0-9.75-4.886-10.392-6C.963 17.885.963 7.115 1.608 6 2.25 4.886 10.715 0 12 0z"/>
    </svg>
  ),
  coding_ninjas: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#F97316">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 14.5v-9l7 4.5-7 4.5z"/>
    </svg>
  ),
  gfg: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#2F8D46">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  codestudio: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#F97316">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
    </svg>
  ),
  codolio: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#7C3AED">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14.5v-9l6 4.5z"/>
    </svg>
  ),
};

const PLATFORM_META = {
  leetcode:      { label: 'LeetCode',      bg: '#FFA116', Logo: PlatformLogos.leetcode },
  codechef:      { label: 'CodeChef',      bg: '#5B4638', Logo: PlatformLogos.codechef },
  codeforces:    { label: 'Codeforces',    bg: '#1F8ACB', Logo: PlatformLogos.codeforces },
  kaggle:        { label: 'Kaggle',        bg: '#20BEFF', Logo: PlatformLogos.kaggle },
  hackerrank:    { label: 'HackerRank',    bg: '#00EA64', Logo: PlatformLogos.hackerrank },
  coding_ninjas: { label: 'Coding Ninjas', bg: '#F97316', Logo: PlatformLogos.coding_ninjas },
  gfg:           { label: 'GeeksForGeeks', bg: '#2F8D46', Logo: PlatformLogos.gfg },
  codestudio:    { label: 'CodeStudio',    bg: '#F97316', Logo: PlatformLogos.codestudio },
  codolio:       { label: 'Codolio',       bg: '#7C3AED', Logo: PlatformLogos.codolio },
};

// Contact field icon helpers
const ContactIcon = ({ type }) => {
  const icons = {
    email:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    phone:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 1.3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    linkedin: <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    github:   <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>,
    twitter:  <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    whatsapp: <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.107.554 4.084 1.523 5.8L0 24l6.366-1.5A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.01-1.374l-.36-.214-3.732.879.893-3.645-.235-.375A9.818 9.818 0 1 1 12 21.818z"/></svg>,
  };
  return icons[type] || icons.email;
};

const contactBg = {
  email: '#EA4335', phone: '#25D366', linkedin: '#0A66C2',
  github: '#24292e', twitter: '#000', whatsapp: '#25D366',
};

// ─── Profile Tab ─────────────────────────────────────────────────────────────
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
  const [editingSection, setEditingSection] = React.useState(null);
  const [pendingEdit, setPendingEdit] = React.useState(null);
  const [addingJourney, setAddingJourney] = React.useState(false);
  const [newJourney, setNewJourney] = React.useState({ type: 'current', title: '', company: '', startDate: '', endDate: '', description: '' });
  const [newEmail, setNewEmail] = React.useState('');
  const [changingEmail, setChangingEmail] = React.useState(false);

  // FIX 6: My Hunt — editing state and single save
  const [myHuntEditing, setMyHuntEditing] = React.useState(false);
  const [myHuntPendingEdit, setMyHuntPendingEdit] = React.useState(false);

  // FIX 3: Contact info modal/inline state
  const [showContactModal, setShowContactModal] = React.useState(false);

  const showToast = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2200); };

  React.useEffect(() => {
    if (!studentProfile) return;
    if (editingSection) return;
    setDraft(JSON.parse(JSON.stringify(studentProfile)));
    setOtherLinks(studentProfile.other_links || []);
  }, [studentProfile]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Uploading...');
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
      showToast('Uploading...');
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
      showToast('Uploading resume...');
      const { uploadResume } = await import('../../../../services/supabase');
      const url = await uploadResume(file);
      await save({ resume_url: url }, { silent: true });
      showToast('Resume uploaded');
    } catch (err) { console.error(err); showToast('Upload failed', 'err'); }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) { showToast('Enter a valid email', 'err'); return; }
    if (!window.confirm(`Change your email to ${newEmail}?`)) return;
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

  // FIX 5: Merge work_experience from onboarding into journey, sorted smart
  const mergedJourney = React.useMemo(() => {
    const journey = [...(d.journey || [])];
    // Add work_experience entries not already in journey
    const workExp = d.work_experience || d.workExperience || [];
    workExp.forEach(exp => {
      const alreadyIn = journey.some(j =>
        j.company === exp.company && j.title === (exp.role || exp.title)
      );
      if (!alreadyIn) {
        journey.push({
          id: exp.id || `we-${exp.company}`,
          type: exp.endYear ? 'past' : 'current',
          title: exp.role || exp.title || '',
          company: exp.company || '',
          startDate: exp.startYear ? String(exp.startYear) : (exp.startDate || ''),
          endDate: exp.endYear ? String(exp.endYear) : (exp.endDate || ''),
          description: exp.description || '',
          _fromOnboarding: true,
        });
      }
    });

    // Sort: current/no-endDate on top, then by startDate desc
    return journey.sort((a, b) => {
      const aIsCurrent = !a.endDate || a.type === 'current';
      const bIsCurrent = !b.endDate || b.type === 'current';
      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;
      // Both same status: sort by startDate descending
      const aYear = parseInt(a.startDate) || 0;
      const bYear = parseInt(b.startDate) || 0;
      return bYear - aYear;
    });
  }, [d.journey, d.work_experience, d.workExperience]);

  // FIX 4: Merge coding_profiles from onboarding data
  const codingProfiles = React.useMemo(() => {
    // coding_profiles from DB, fallback to onboarding fields
    const cp = { ...(d.coding_profiles || {}) };
    // Map onboarding field names to coding_profiles keys
    const fieldMap = {
      leetcodeUsername: 'leetcode',
      codechefUsername: 'codechef',
      codeforcesUsername: 'codeforces',
      kaggleUsername: 'kaggle',
      hackerrankUsername: 'hackerrank',
      codingninjaUsername: 'coding_ninjas',
      gfgUsername: 'gfg',
      codestudioUsername: 'codestudio',
      codolioUsername: 'codolio',
    };
    Object.entries(fieldMap).forEach(([field, key]) => {
      if (!cp[key] && d[field]) cp[key] = d[field];
    });
    return cp;
  }, [d]);

  const SECTIONS = [
    { id: 'overview',   label: 'Overview' },
    { id: 'resume',     label: 'Resume' },
    { id: 'skills',     label: 'Skills & Preferences' },
    { id: 'journey',    label: 'My Journey' },
    { id: 'myhunt',     label: 'My Hunt' },
    { id: 'reviews',    label: 'Reviews & Ratings' },
    { id: 'huntscore',  label: 'Hunt Score' },
    { id: 'account',    label: 'Account' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'hunt-fade-in 0.25s ease' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '7px 16px', borderRadius: 0, fontSize: 12, fontWeight: 500, background: toast.type === 'err' ? 'rgba(192,57,43,0.95)' : 'rgba(26,122,74,0.95)', color: '#fff', pointerEvents: 'none', boxShadow: '0 3px 12px rgba(0,0,0,0.15)' }}>{toast.msg}</div>
      )}

      {pendingEdit && <ConfirmEditModal onConfirm={confirmEdit} onCancel={() => setPendingEdit(null)} />}
      {myHuntPendingEdit && (
        <ConfirmEditModal
          onConfirm={() => { setMyHuntEditing(true); setMyHuntPendingEdit(false); }}
          onCancel={() => setMyHuntPendingEdit(false)}
        />
      )}

      {/* ── PROFILE HEADER + SUB-TABS ── */}
      <div style={{ flexShrink: 0, padding: '28px 40px 0', background: 'var(--bg)' }}>
        <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 6 }}>▲ profile</p>
        <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, fontWeight: 400, color: 'var(--text)', marginBottom: 16, lineHeight: 1.05 }}>
          {d.full_name ? <>{d.full_name.split(' ')[0]}<em style={{ fontStyle: 'italic' }}>'s profile.</em></> : <em>Your profile.</em>}
        </h1>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400,
              color: activeSection === s.id ? 'var(--text)' : 'var(--text-dim)',
              borderBottom: activeSection === s.id ? '2px solid var(--blue)' : '2px solid transparent',
              marginBottom: '-1px', whiteSpace: 'nowrap', fontFamily: 'inherit',
            }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px' }}>

        {/* ═══════ OVERVIEW ═══════ */}
        {activeSection === 'overview' && (
          <div style={{ maxWidth: 760 }}>

            {/* ── FIX 3: Hero card — banner + avatar + name/headline/bio inline editable ── */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: 14, overflow: 'hidden' }}>
              {/* Banner */}
              <div style={{
                height: 160,
                background: d.banner_url ? `url("${d.banner_url}") center/cover no-repeat` : 'var(--ink)',
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {!d.banner_url && (
                  <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: 'var(--cream)', fontStyle: 'italic' }}>On a hunt.</p>
                )}
                <label style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerUpload} />
                </label>
              </div>

              {/* Avatar row */}
              <div style={{ padding: '0 24px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ position: 'relative', marginTop: -46 }}>
                    {d.avatar_url ? (
                      <img src={d.avatar_url} alt="avatar" style={{ width: 92, height: 92, border: '3px solid var(--bg-card)', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: 92, height: 92, background: 'var(--ink)', border: '3px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 30, fontWeight: 600, color: 'var(--cream)' }}>
                        {initials}
                      </div>
                    )}
                    <label style={{ position: 'absolute', bottom: 4, right: 4, width: 26, height: 26, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  {/* Edit pencil for this card */}
                  <EditSaveBtn
                    editing={editingSection === 'hero_card'}
                    onEdit={() => requestEdit('hero_card')}
                    onSave={() => save({ full_name: d.full_name, headline: d.headline, bio: d.bio, college: d.college, year: d.year }, { exitEdit: true })}
                    saving={saving}
                  />
                </div>

                {/* Name always shown; editable in edit mode */}
                {editingSection === 'hero_card' ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <FieldLabel>Full Name</FieldLabel>
                        <input style={inp_p} value={d.full_name || ''} placeholder="Your name" onChange={e => setDraft(x => ({ ...x, full_name: e.target.value }))} />
                      </div>
                      <div>
                        <FieldLabel>College / Company</FieldLabel>
                        <input style={inp_p} value={d.college || ''} placeholder="VJTI Mumbai" onChange={e => setDraft(x => ({ ...x, college: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Headline</FieldLabel>
                      <input style={inp_p} value={d.headline || ''} placeholder="Full Stack Dev · Open to internships" onChange={e => setDraft(x => ({ ...x, headline: e.target.value }))} />
                    </div>
                    <div>
                      <FieldLabel>Bio</FieldLabel>
                      <textarea style={{ ...inp_p, resize: 'none' }} rows={3} value={d.bio || ''} placeholder="Tell recruiters about yourself..." onChange={e => setDraft(x => ({ ...x, bio: e.target.value }))} />
                    </div>
                    <button onClick={cancelEdit} style={{ alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 0, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: 'var(--text)', marginBottom: 2 }}>{d.full_name || <em style={{ color: 'var(--text-dim)', fontSize: 16 }}>Add your name</em>}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: d.headline ? 6 : 0 }}>
                      {d.college}{d.year && d.user_type !== 'professional' ? ` · Year ${d.year}` : ''}
                    </p>
                    {d.headline && <p style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: d.bio ? 8 : 0 }}>{d.headline}</p>}
                    {d.bio && <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{d.bio}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* ── FIX 3: Contact Info card — consolidated, with contact toggle ── */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cream)" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 1.3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Contact Info</p>
                </div>
                <EditSaveBtn
                  editing={editingSection === 'contact_info'}
                  onEdit={() => requestEdit('contact_info')}
                  onSave={() => save({
                    email: d.email, phone: d.phone,
                    linkedin_url: d.linkedin_url, github_url: d.github_url,
                    contact_info: d.contact_info,
                    contact_sharing: d.contact_sharing,
                  }, { exitEdit: true })}
                  saving={saving}
                />
              </div>

              {/* Contact sharing permission toggles */}
              <div style={{ padding: '10px 12px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Recruiter visibility</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { key: 'show_email', label: 'Email' },
                    { key: 'show_phone', label: 'Phone' },
                    { key: 'show_linkedin', label: 'LinkedIn' },
                    { key: 'show_github', label: 'GitHub' },
                  ].map(({ key, label }) => {
                    const isOn = (d.contact_sharing || {})[key];
                    return (
                      <button key={key} onClick={() => {
                        if (editingSection !== 'contact_info') return;
                        setDraft(x => ({
                          ...x,
                          contact_sharing: { ...(x.contact_sharing || {}), [key]: !isOn }
                        }));
                      }} style={{
                        padding: '4px 10px', fontSize: 11, fontFamily: 'inherit', cursor: editingSection === 'contact_info' ? 'pointer' : 'default',
                        border: `1px solid ${isOn ? 'var(--green)' : 'var(--border)'}`,
                        background: isOn ? 'var(--green-tint)' : 'transparent',
                        color: isOn ? 'var(--green-text)' : 'var(--text-dim)',
                      }}>
                        {isOn ? '✓ ' : ''}{label}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>Only enabled fields are visible to recruiters after you apply.</p>
              </div>

              {/* Contact fields */}
              {[
                { key: 'email',       field: 'email',        label: 'Email',    ph: 'you@email.com',              iconType: 'email',    isTopLevel: true },
                { key: 'phone',       field: 'phone',        label: 'Phone',    ph: '+91 98765 43210',            iconType: 'phone',    isTopLevel: true },
                { key: 'linkedin',    field: 'linkedin_url', label: 'LinkedIn', ph: 'https://linkedin.com/in/...',iconType: 'linkedin', isTopLevel: true },
                { key: 'github',      field: 'github_url',   label: 'GitHub',   ph: 'https://github.com/...',     iconType: 'github',   isTopLevel: true },
                { key: 'twitter',     field: null,           label: 'X/Twitter',ph: '@username',                  iconType: 'twitter',  isTopLevel: false },
                { key: 'whatsapp',    field: null,           label: 'WhatsApp', ph: '+91 98765 43210',            iconType: 'whatsapp', isTopLevel: false },
              ].map(({ key, field, label, ph, iconType, isTopLevel }) => {
                const val = isTopLevel ? (d[field] || '') : ((d.contact_info || {})[key] || '');
                const editing = editingSection === 'contact_info';
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 7 }}>
                    <div style={{ width: 28, height: 28, background: contactBg[iconType] || '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ContactIcon type={iconType} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', width: 80, flexShrink: 0 }}>{label}</span>
                    {editing ? (
                      <input
                        style={{ ...inp_p, padding: '5px 9px' }}
                        value={val}
                        placeholder={ph}
                        onChange={e => {
                          if (isTopLevel) {
                            setDraft(x => ({ ...x, [field]: e.target.value }));
                          } else {
                            setDraft(x => ({ ...x, contact_info: { ...(x.contact_info || {}), [key]: e.target.value } }));
                          }
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: val ? 'var(--text-mid)' : 'var(--text-dim)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: val ? 'normal' : 'italic' }}>
                        {val || '—'}
                      </span>
                    )}
                  </div>
                );
              })}
              {editingSection === 'contact_info' && (
                <button onClick={cancelEdit} style={{ marginTop: 6, padding: '6px 14px', borderRadius: 0, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              )}
            </Card>
          </div>
        )}

        {/* ═══════ RESUME ═══════ */}
        {activeSection === 'resume' && (
          <div style={{ maxWidth: 700 }}>
            {/* Key Links */}
            <EditableSection
              title="Key Links"
              editKey="key_links"
              editingKey={editingSection}
              onRequestEdit={requestEdit}
              onSave={() => save({ github_url: d.github_url, linkedin_url: d.linkedin_url, portfolio_url: d.portfolio_url }, { exitEdit: true })}
              onCancel={cancelEdit}
              saving={saving}
            >
              {({ editing }) => (
                <>
                  {[
                    { key: 'github_url',    logo: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>, bg: '#24292e', label: 'GitHub', ph: 'https://github.com/username' },
                    { key: 'linkedin_url',  logo: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, bg: '#0A66C2', label: 'LinkedIn', ph: 'https://linkedin.com/in/username' },
                    { key: 'portfolio_url', logo: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, bg: '#5A5A56', label: 'Portfolio', ph: 'https://yoursite.com' },
                  ].map(({ key, logo, bg, label, ph }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                      <div style={{ width: 28, height: 28, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white' }}>{logo}</div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', width: 80, flexShrink: 0 }}>{label}</span>
                      {editing ? (
                        <input style={{ ...inp_p, padding: '5px 9px' }} value={d[key] || ''} placeholder={ph} onChange={e => setDraft(x => ({ ...x, [key]: e.target.value }))} />
                      ) : (
                        d[key]
                          ? <a href={d[key]} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--green-text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}>{d[key]}</a>
                          : <span style={{ fontSize: 12, color: 'var(--text-dim)', flex: 1, fontStyle: 'italic' }}>Not set</span>
                      )}
                    </div>
                  ))}
                </>
              )}
            </EditableSection>

            {/* Resume PDF */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Resume PDF</p>
              {d.resume_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: '1px solid var(--green)', background: 'var(--green-tint)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--green-text)' }}>Resume uploaded</span>
                  <a href={d.resume_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--green-text)', textDecoration: 'none' }}>View</a>
                  <label style={{ fontSize: 12, padding: '5px 12px', border: '1px solid var(--green)', color: 'var(--green)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Replace<input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleResumeUpload} />
                  </label>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '32px', border: '2px dashed var(--border-mid)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-tint)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.background = 'transparent'; }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>Drop PDF here or <span style={{ color: 'var(--green)' }}>browse files</span></span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>PDF up to 5MB</span>
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleResumeUpload} />
                </label>
              )}
            </Card>

            {/* Summary */}
            <EditableSection
              title="Summary"
              editKey="summary"
              editingKey={editingSection}
              onRequestEdit={requestEdit}
              onSave={() => save({ summary: d.summary }, { exitEdit: true })}
              onCancel={cancelEdit}
              saving={saving}
            >
              {({ editing }) => (
                editing
                  ? <textarea style={{ ...inp_p, resize: 'none' }} rows={4} value={d.summary || ''} placeholder="Brief professional summary..." onChange={e => setDraft(x => ({ ...x, summary: e.target.value }))} />
                  : <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{d.summary || <em style={{ color: 'var(--text-dim)' }}>Not set</em>}</p>
              )}
            </EditableSection>

            {/* Education */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Education</p>
                <button onClick={() => setAddingEdu(true)} style={{ padding: '6px 14px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
              </div>
              {(d.education || []).map((edu, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{edu.school}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-mid)', marginBottom: 1 }}>{edu.degree}{edu.major ? ` · ${edu.major}` : ''}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{edu.startYear || '—'}{edu.endYear ? `–${edu.endYear}` : ''}</p>
                  </div>
                  <button onClick={() => { const ed = (d.education || []).filter((_, j) => j !== i); setDraft(x => ({ ...x, education: ed })); save({ education: ed }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 16 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                </div>
              ))}
              {addingEdu && (
                <div style={{ border: '1px solid var(--border)', padding: 16, background: 'var(--bg-subtle)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    {[{ f: 'school', ph: 'University/College *' }, { f: 'degree', ph: 'Bachelor of Science' }, { f: 'major', ph: 'Computer Science' }, { f: 'startYear', ph: '2021' }, { f: 'endYear', ph: '2025 (optional)' }].map(({ f, ph }) => (
                      <input key={f} style={inp_p} value={newEdu[f]} placeholder={ph} onChange={e => setNewEdu(x => ({ ...x, [f]: e.target.value }))} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { if (!newEdu.school) return; const ed = [...(d.education || []), newEdu]; setDraft(x => ({ ...x, education: ed })); save({ education: ed }); setNewEdu({ school: '', degree: '', major: '', startYear: '', endYear: '' }); setAddingEdu(false); }} style={{ padding: '7px 14px', border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                    <button onClick={() => setAddingEdu(false)} style={{ padding: '7px 14px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Projects */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Projects</p>
                <button onClick={() => setAddingProject(true)} style={{ padding: '6px 14px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
              </div>
              {(d.projects || []).map((p, i) => (
                <div key={i} style={{ padding: '12px 14px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.title || p.name}</p>
                    <button onClick={() => { const pr = (d.projects || []).filter((_, j) => j !== i); setDraft(x => ({ ...x, projects: pr })); save({ projects: pr }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 16 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                  </div>
                  {p.description && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, lineHeight: 1.5 }}>{p.description}</p>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {(Array.isArray(p.techStack) ? p.techStack : []).map((t, j) => (
                      <span key={j} style={{ fontSize: 10, padding: '3px 8px', border: '1px solid var(--border)', color: 'var(--text-mid)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
              {addingProject && (
                <div style={{ border: '1px solid var(--border)', padding: 16, background: 'var(--bg-subtle)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <input style={inp_p} value={newProject.title} placeholder="Project title *" onChange={e => setNewProject(x => ({ ...x, title: e.target.value }))} />
                    <input style={inp_p} value={newProject.techStack} placeholder="React, Node.js..." onChange={e => setNewProject(x => ({ ...x, techStack: e.target.value }))} />
                  </div>
                  <textarea style={{ ...inp_p, resize: 'none', marginBottom: 10 }} rows={2} value={newProject.description} placeholder="Description" onChange={e => setNewProject(x => ({ ...x, description: e.target.value }))} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <input style={inp_p} value={newProject.projectUrl} placeholder="Live URL" onChange={e => setNewProject(x => ({ ...x, projectUrl: e.target.value }))} />
                    <input style={inp_p} value={newProject.githubUrl} placeholder="GitHub URL" onChange={e => setNewProject(x => ({ ...x, githubUrl: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { if (!newProject.title) return; const pr = [...(d.projects || []), { ...newProject, techStack: newProject.techStack.split(',').map(t => t.trim()), id: Date.now() }]; setDraft(x => ({ ...x, projects: pr })); save({ projects: pr }); setNewProject({ title: '', techStack: '', description: '', projectUrl: '', githubUrl: '' }); setAddingProject(false); }} style={{ padding: '7px 14px', border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add Project</button>
                    <button onClick={() => setAddingProject(false)} style={{ padding: '7px 14px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Certifications */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Certifications</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
                {(d.certifications || []).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: 12 }}>
                    🏅 {c}
                    <button onClick={() => { const cer = (d.certifications || []).filter((_, j) => j !== i); setDraft(x => ({ ...x, certifications: cer })); save({ certifications: cer }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0 0 0 4px', fontSize: 14 }}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp_p, flex: 1 }} value={newCert} placeholder="AWS Certified Developer..." onChange={e => setNewCert(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newCert.trim()) { const cer = [...(d.certifications || []), newCert.trim()]; setDraft(x => ({ ...x, certifications: cer })); save({ certifications: cer }); setNewCert(''); } }} />
                <button onClick={() => { if (!newCert.trim()) return; const cer = [...(d.certifications || []), newCert.trim()]; setDraft(x => ({ ...x, certifications: cer })); save({ certifications: cer }); setNewCert(''); }}
                  style={{ padding: '0 16px', minWidth: 50, border: 'none', background: newCert.trim() ? 'var(--green)' : 'var(--border-mid)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: newCert.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                  {newCert.trim() ? 'Add' : '+'}
                </button>
              </div>
            </Card>

            {/* Awards */}
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Awards & Achievements</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                {(d.awards || []).map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 16 }}>⭐</span> {a}</span>
                    <button onClick={() => { const aw = (d.awards || []).filter((_, j) => j !== i); setDraft(x => ({ ...x, awards: aw })); save({ awards: aw }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 16 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp_p, flex: 1 }} value={newAward} placeholder="1st place at Flipkart GRiD Hackathon..." onChange={e => setNewAward(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newAward.trim()) { const aw = [...(d.awards || []), newAward.trim()]; setDraft(x => ({ ...x, awards: aw })); save({ awards: aw }); setNewAward(''); } }} />
                <button onClick={() => { if (!newAward.trim()) return; const aw = [...(d.awards || []), newAward.trim()]; setDraft(x => ({ ...x, awards: aw })); save({ awards: aw }); setNewAward(''); }}
                  style={{ padding: '0 16px', minWidth: 50, border: 'none', background: newAward.trim() ? 'var(--green)' : 'var(--border-mid)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: newAward.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                  {newAward.trim() ? 'Add' : '+'}
                </button>
              </div>
            </Card>

            {/* FIX 4: Coding platforms with real logos + preloaded from onboarding */}
            <EditableSection
              title="Competitive & Coding Profiles"
              editKey="coding_profiles"
              editingKey={editingSection}
              onRequestEdit={requestEdit}
              onSave={() => save({ coding_profiles: d.coding_profiles }, { exitEdit: true })}
              onCancel={cancelEdit}
              saving={saving}
            >
              {({ editing }) => (
                <>
                  {Object.entries(PLATFORM_META).map(([key, { label, bg, Logo }]) => {
                    const val = codingProfiles[key] || '';
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Logo />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', width: 110, flexShrink: 0 }}>{label}</span>
                        {editing ? (
                          <input style={{ ...inp_p, padding: '6px 10px' }}
                            value={(d.coding_profiles || {})[key] || val}
                            placeholder="username"
                            onChange={e => setDraft(x => ({ ...x, coding_profiles: { ...(x.coding_profiles || {}), [key]: e.target.value } }))} />
                        ) : (
                          <span style={{ fontSize: 12, color: val ? 'var(--text-mid)' : 'var(--text-dim)', flex: 1, fontStyle: val ? 'normal' : 'italic' }}>{val || '—'}</span>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </EditableSection>

            {/* Other links */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Other Links</p>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>Papers, talks, open source contributions, etc.</p>
              {otherLinks.map((link, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>🔗</div>
                  <span style={{ fontSize: 12, color: 'var(--text)', flex: 1 }}>{link.label}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--green)', textDecoration: 'none', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</a>
                  <button onClick={() => { const nl = otherLinks.filter((_, j) => j !== i); setOtherLinks(nl); save({ other_links: nl }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 16 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginBottom: 8 }}>
                <input style={inp_p} value={newOtherLink.label} placeholder="Label (e.g. Research Paper)" onChange={e => setNewOtherLink(x => ({ ...x, label: e.target.value }))} />
                <input style={inp_p} value={newOtherLink.url} placeholder="https://..." onChange={e => setNewOtherLink(x => ({ ...x, url: e.target.value }))} />
              </div>
              <button onClick={() => { if (!newOtherLink.url.trim()) return; const nl = [...otherLinks, { label: newOtherLink.label || newOtherLink.url, url: newOtherLink.url }]; setOtherLinks(nl); save({ other_links: nl }); setNewOtherLink({ label: '', url: '' }); }}
                style={{ padding: '7px 16px', border: 'none', background: newOtherLink.url.trim() ? 'var(--green)' : 'var(--border-mid)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: newOtherLink.url.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                {newOtherLink.url.trim() ? 'Add Link' : '+'}
              </button>
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
            setDraft(x => ({ ...x, skills: [...(x.skills || []), { id: Date.now(), name: pendingSkill, level, category }] }));
            setPendingSkill(null);
            setSkillSearch('');
          };

          const searchLower = skillSearch.trim().toLowerCase();
          const filteredSkills = searchLower
            ? SKILL_OPTIONS_P.filter(s => s.name.toLowerCase().includes(searchLower))
            : SKILL_OPTIONS_P.filter(s => s.cat === skillCat);
          const isCustomSkill = searchLower && !SKILL_OPTIONS_P.some(s => s.name.toLowerCase() === searchLower);

          return (
            <div style={{ maxWidth: 760 }}>
              {pendingSkill && (
                <>
                  <div onClick={() => setPendingSkill(null)} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }} />
                  <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 401, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px 24px', width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 20 }}>{getSkillLogo(pendingSkill)}</span>
                      <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: 'var(--text)' }}>{pendingSkill}</p>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 20 }}>How well do you know this?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {LEVELS.map(lv => (
                        <button key={lv.v} onClick={() => confirmAdd(lv.v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', cursor: 'pointer', fontFamily: 'inherit' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-tint)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 3 }}>
                              {[1,2,3,4,5].map(dot => <div key={dot} style={{ width: 6, height: 6, background: dot <= lv.v ? 'var(--blue)' : 'var(--border-mid)' }} />)}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{lv.label}</span>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{lv.desc}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setPendingSkill(null)} style={{ marginTop: 14, width: '100%', padding: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--text)', marginBottom: 3 }}>Technical Skills</p>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>{addedSkills.length} skill{addedSkills.length !== 1 ? 's' : ''} added</p>
                </div>
                <button onClick={() => save({ skills: d.skills || [] })} disabled={saving}
                  style={{ padding: '7px 16px', border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'inherit' }}>
                  {saving ? 'Saving...' : 'Save Skills'}
                </button>
              </div>

              <div style={{ marginBottom: 16, position: 'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input style={{ ...inp_p, paddingLeft: 34, fontSize: 13 }} value={skillSearch} placeholder="Search skills..." onChange={e => setSkillSearch(e.target.value)} />
                {skillSearch && <button onClick={() => setSkillSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 16, cursor: 'pointer' }}>×</button>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: skillSearch ? '1fr' : '180px 1fr', gap: 16, alignItems: 'start' }}>
                {!skillSearch && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {SKILL_CATS_P.map(cat => {
                      const cnt = addedSkills.filter(s => s.category === cat).length;
                      return (
                        <button key={cat} onClick={() => setSkillCat(cat)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: skillCat === cat ? 'var(--bg-subtle)' : 'transparent', color: skillCat === cat ? 'var(--text)' : 'var(--text-dim)', fontSize: 13, fontWeight: skillCat === cat ? 600 : 400, textAlign: 'left' }}>
                          <span>{cat}</span>
                          {cnt > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', background: 'var(--green-tint)', padding: '1px 7px' }}>{cnt}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px 18px', marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>
                      {skillSearch ? `Results (${filteredSkills.length})` : skillCat}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {filteredSkills.length === 0 && !isCustomSkill && <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No skills found.</p>}
                      {filteredSkills.map(skill => {
                        const added = addedSkills.some(s => s.name === skill.name);
                        return (
                          <button key={skill.name} onClick={() => { if (!added) setPendingSkill(skill.name); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12, fontFamily: 'inherit', cursor: added ? 'default' : 'pointer', border: `1px solid ${added ? 'var(--green)' : 'var(--border)'}`, background: added ? 'var(--green-tint)' : 'var(--bg-subtle)', color: added ? 'var(--green-text)' : 'var(--text-mid)' }}>
                            <span>{getSkillLogo(skill.name)}</span>
                            {added ? '✓ ' : '+ '}{skill.name}
                          </button>
                        );
                      })}
                      {isCustomSkill && (
                        <button onClick={() => setPendingSkill(skillSearch.trim())}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', border: '1px dashed var(--green)', background: 'var(--green-tint)', color: 'var(--green-text)' }}>
                          + Add "{skillSearch.trim()}" as custom skill
                        </button>
                      )}
                    </div>
                  </div>

                  {addedSkills.length > 0 ? (
                    <div>
                      {Object.entries(grouped).map(([cat, skills]) => (
                        <div key={cat} style={{ marginBottom: 20 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>{cat}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {skills.map(skill => {
                              const i = addedSkills.findIndex(s => s.name === skill.name);
                              const levelColors = ['', '#9B9B97', '#D4A84B', '#1A35E8', '#0B1BA0', '#7C3AED'];
                              return (
                                <div key={skill.id || skill.name}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px 6px 8px', border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 12, color: 'var(--text)' }}>
                                  <span>{getSkillLogo(skill.name)}</span>
                                  <span style={{ fontWeight: 500 }}>{skill.name}</span>
                                  <div style={{ display: 'flex', gap: 2, marginLeft: 2 }}>
                                    {[1,2,3,4,5].map(lv => <div key={lv} style={{ width: 4, height: 4, background: skill.level >= lv ? levelColors[skill.level] : 'var(--border-mid)' }} />)}
                                  </div>
                                  <button onClick={() => setDraft(x => ({ ...x, skills: (x.skills || []).filter((_, j) => j !== i) }))}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--border-mid)', padding: '0 0 0 2px', fontSize: 13 }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--border-mid)'}>×</button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '32px', textAlign: 'center', border: '2px dashed var(--border)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Search or browse by category — pick a skill, choose your level</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--text)', marginBottom: 20 }}>Preferences</p>
                <EditableSection
                  title="Work Preferences"
                  editKey="work_prefs"
                  editingKey={editingSection}
                  onRequestEdit={requestEdit}
                  onSave={() => save({ preferred_roles: d.preferred_roles, availability: d.availability, work_preference: d.work_preference, min_stipend: d.min_stipend }, { exitEdit: true })}
                  onCancel={cancelEdit}
                  saving={saving}
                >
                  {({ editing }) => (
                    <>
                      <FieldLabel>Preferred Roles</FieldLabel>
                      {editing ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 18 }}>
                          {ROLE_OPTIONS_P.map(role => {
                            const sel = (d.preferred_roles || []).includes(role);
                            return <button key={role} onClick={() => setDraft(x => ({ ...x, preferred_roles: sel ? (x.preferred_roles || []).filter(r => r !== role) : [...(x.preferred_roles || []), role] }))} style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', border: `1px solid ${sel ? 'var(--green)' : 'var(--border)'}`, background: sel ? 'var(--green-tint)' : 'transparent', color: sel ? 'var(--green-text)' : 'var(--text-mid)', fontWeight: sel ? 500 : 400 }}>{role}</button>;
                          })}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                          {(d.preferred_roles || []).length > 0
                            ? (d.preferred_roles || []).map(r => <span key={r} style={{ padding: '5px 12px', fontSize: 12, background: 'var(--green-tint)', color: 'var(--green-text)', border: '1px solid var(--green)' }}>{r}</span>)
                            : <span style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>No roles selected</span>}
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                          <FieldLabel>Availability</FieldLabel>
                          {editing ? (
                            <select style={inp_p} value={d.availability || 'Immediate'} onChange={e => setDraft(x => ({ ...x, availability: e.target.value }))}>
                              <option>Immediate</option><option>After exams</option><option>Next semester</option><option>Not available</option>
                            </select>
                          ) : <p style={{ fontSize: 13, color: 'var(--text-mid)', padding: '6px 0' }}>{d.availability || '—'}</p>}
                        </div>
                        <div>
                          <FieldLabel>Work Preference</FieldLabel>
                          {editing ? (
                            <select style={inp_p} value={d.work_preference || 'remote'} onChange={e => setDraft(x => ({ ...x, work_preference: e.target.value }))}>
                              <option value="remote">Remote</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="any">Any</option>
                            </select>
                          ) : <p style={{ fontSize: 13, color: 'var(--text-mid)', padding: '6px 0', textTransform: 'capitalize' }}>{d.work_preference || '—'}</p>}
                        </div>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <FieldLabel>Min Stipend</FieldLabel>
                        {editing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>Rs.</span>
                            <input style={{ ...inp_p, maxWidth: 150 }} type="number" value={d.min_stipend || ''} placeholder="0" onChange={e => setDraft(x => ({ ...x, min_stipend: e.target.value }))} />
                            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>/ month</span>
                          </div>
                        ) : <p style={{ fontSize: 13, color: 'var(--text-mid)', padding: '6px 0' }}>{d.min_stipend ? `Rs.${d.min_stipend} / month` : '—'}</p>}
                      </div>
                    </>
                  )}
                </EditableSection>
              </div>
            </div>
          );
        })()}

        {/* ═══════ MY JOURNEY — FIX 5: merges work_experience, smart sort ═══════ */}
        {activeSection === 'journey' && (
          <div style={{ maxWidth: 720 }}>
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>▲ my journey</p>
              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>The path so far.</h1>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 480 }}>
                Work experience, past projects, what you're building now. Current roles show at top; past ordered by date.
              </p>
            </div>

            <div style={{ position: 'relative' }}>
              {mergedJourney.length > 0 && (
                <div style={{ position: 'absolute', left: 11, top: 8, bottom: 8, width: 2, background: 'var(--border)' }} />
              )}

              {mergedJourney.map((j, i) => {
                const typeColors = {
                  current:   { bg: 'var(--green)',  tint: 'var(--green-tint)',          label: 'Currently' },
                  past:      { bg: '#0A66C2',        tint: 'rgba(10,102,194,0.1)',       label: 'Past' },
                  side:      { bg: '#7C3AED',        tint: 'rgba(124,58,237,0.1)',       label: 'Side project' },
                  education: { bg: '#D4A84B',        tint: 'rgba(212,168,75,0.1)',       label: 'Learning' },
                };
                const tc = typeColors[j.type] || typeColors.past;
                return (
                  <div key={j.id || i} style={{ position: 'relative', paddingLeft: 40, marginBottom: 20 }}>
                    <div style={{ position: 'absolute', left: 4, top: 12, width: 12, height: 12, background: tc.bg, border: '2px solid var(--bg)', zIndex: 1 }} />
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: tc.bg, padding: '2px 8px', background: tc.tint, display: 'inline-block', marginBottom: 6 }}>{tc.label}</span>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{j.title}</p>
                          {j.company && <p style={{ fontSize: 12, color: 'var(--text-mid)', marginBottom: 4 }}>{j.company}</p>}
                          <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                            {j.startDate || '—'}{j.endDate ? ` → ${j.endDate}` : j.type === 'current' ? ' → Present' : ''}
                          </p>
                        </div>
                        {/* Only allow removing non-onboarding items (or allow all removal) */}
                        <button onClick={() => {
                          if (j._fromOnboarding) {
                            // Remove from work_experience
                            const we = (d.work_experience || d.workExperience || []).filter(e => e.id !== j.id && !(e.company === j.company && (e.role || e.title) === j.title));
                            setDraft(x => ({ ...x, work_experience: we, workExperience: we }));
                            save({ work_experience: we });
                          } else {
                            const jr = (d.journey || []).filter((_, k) => k !== (d.journey || []).findIndex(x => x.id === j.id));
                            setDraft(x => ({ ...x, journey: jr }));
                            save({ journey: jr });
                          }
                        }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0, fontSize: 16 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>×</button>
                      </div>
                      {j.description && <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.6, marginTop: 8, whiteSpace: 'pre-wrap' }}>{j.description}</p>}
                    </div>
                  </div>
                );
              })}

              {mergedJourney.length === 0 && !addingJourney && (
                <div style={{ padding: '48px 24px', textAlign: 'center', border: '2px dashed var(--border)', marginBottom: 16 }}>
                  <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>No entries yet.</p>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Add your first — current role, past experience, or side projects.</p>
                </div>
              )}
            </div>

            {addingJourney ? (
              <div style={{ border: '1px solid var(--border)', padding: 20, background: 'var(--bg-card)' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>New journey entry</p>
                <div style={{ marginBottom: 12 }}>
                  <FieldLabel>Type</FieldLabel>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[{ v: 'current', label: 'Currently working on' }, { v: 'past', label: 'Past experience' }, { v: 'side', label: 'Side project' }, { v: 'education', label: 'Learning' }].map(opt => (
                      <button key={opt.v} onClick={() => setNewJourney(x => ({ ...x, type: opt.v }))} style={{ padding: '7px 14px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', border: `1px solid ${newJourney.type === opt.v ? 'var(--green)' : 'var(--border)'}`, background: newJourney.type === opt.v ? 'var(--green-tint)' : 'transparent', color: newJourney.type === opt.v ? 'var(--green-text)' : 'var(--text-mid)' }}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <input style={inp_p} value={newJourney.title} placeholder="Title / Role *" onChange={e => setNewJourney(x => ({ ...x, title: e.target.value }))} />
                  <input style={inp_p} value={newJourney.company} placeholder="Company / Org" onChange={e => setNewJourney(x => ({ ...x, company: e.target.value }))} />
                  <input style={inp_p} value={newJourney.startDate} placeholder="Start (e.g. Jan 2024)" onChange={e => setNewJourney(x => ({ ...x, startDate: e.target.value }))} />
                  <input style={inp_p} value={newJourney.endDate} placeholder="End (leave blank if ongoing)" onChange={e => setNewJourney(x => ({ ...x, endDate: e.target.value }))} />
                </div>
                <textarea style={{ ...inp_p, resize: 'none', marginBottom: 10 }} rows={3} value={newJourney.description} placeholder="What you did / are doing..." onChange={e => setNewJourney(x => ({ ...x, description: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => {
                    if (!newJourney.title.trim()) return;
                    const jr = [{ ...newJourney, id: Date.now() }, ...(d.journey || [])];
                    setDraft(x => ({ ...x, journey: jr }));
                    save({ journey: jr });
                    setNewJourney({ type: 'current', title: '', company: '', startDate: '', endDate: '', description: '' });
                    setAddingJourney(false);
                  }} style={{ padding: '7px 14px', border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                  <button onClick={() => setAddingJourney(false)} style={{ padding: '7px 14px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingJourney(true)} style={{ padding: '10px 20px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add entry</button>
            )}
          </div>
        )}

        {/* ═══════ MY HUNT — FIX 6: single Save button, pencil-edit flow ═══════ */}
        {activeSection === 'myhunt' && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 10 }}>▲ public · visible on your profile</p>
              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 38, fontWeight: 400, color: 'var(--text)', lineHeight: 1.15, marginBottom: 12 }}>
                What are you<br /><em>really</em> hunting for?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7, maxWidth: 480 }}>
                Not your resume. Not the job title. The real stuff — your drives, your beliefs, your <em>why</em>. Recruiters see this when they view your profile.
              </p>
            </div>

            {/* Edit / Save / Cancel controls — single for the whole tab */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, padding: '12px 14px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              {myHuntEditing ? (
                <>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', flex: 1 }}>Editing — make your changes then save</span>
                  <button onClick={() => {
                    save({
                      my_hunt: d.my_hunt,
                      philosophy: d.philosophy,
                      inspirations: d.inspirations,
                      life_outside: d.life_outside,
                      quote: d.quote,
                      quote_author: d.quote_author,
                    }, { silent: false });
                    setMyHuntEditing(false);
                  }} disabled={saving} style={{ padding: '7px 16px', border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving...' : 'Save all'}
                  </button>
                  <button onClick={() => {
                    setMyHuntEditing(false);
                    setDraft(JSON.parse(JSON.stringify(studentProfile || {})));
                  }} style={{ padding: '7px 14px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', flex: 1 }}>Click the pencil to edit your story</span>
                  <button onClick={() => setMyHuntPendingEdit(true)} title="Edit" style={{ width: 28, height: 28, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text)'; e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)'; }}>
                    <PencilIcon />
                  </button>
                </>
              )}
            </div>

            {/* Section 01 — The Hunt */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.1em', fontFamily: "'Instrument Serif', Georgia, serif" }}>01</span>
                <div>
                  <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 3 }}>The Hunt</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Not the job title. What are you actually after?</p>
                </div>
              </div>
              {myHuntEditing ? (
                <textarea value={d.my_hunt || ''} onChange={e => setDraft(x => ({ ...x, my_hunt: e.target.value }))}
                  placeholder="I'm hunting for the place where craft meets impact..."
                  style={{ ...inp_p, resize: 'none', lineHeight: 1.8, fontSize: 14, padding: '14px 0', background: 'transparent', border: 'none', borderBottom: '1px solid var(--blue)' }} rows={4} />
              ) : (
                <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.8, padding: '4px 0', borderBottom: '1px dashed var(--border)', minHeight: 56, fontStyle: d.my_hunt ? 'normal' : 'italic', color: d.my_hunt ? 'var(--text-mid)' : 'var(--text-dim)' }}>
                  {d.my_hunt || 'Not written yet...'}
                </p>
              )}
            </div>

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 48 }} />

            {/* Section 02 — Philosophy */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', fontFamily: "'Instrument Serif', Georgia, serif" }}>02</span>
                <div>
                  <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 3 }}>Philosophy</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>How you see the world. What you believe is true.</p>
                </div>
              </div>
              {myHuntEditing ? (
                <textarea value={d.philosophy || ''} onChange={e => setDraft(x => ({ ...x, philosophy: e.target.value }))}
                  placeholder="I believe the best products start with genuine frustration..."
                  style={{ ...inp_p, resize: 'none', lineHeight: 1.8, fontSize: 14, padding: '14px 0', background: 'transparent', border: 'none', borderBottom: '1px solid var(--blue)' }} rows={4} />
              ) : (
                <p style={{ fontSize: 14, lineHeight: 1.8, padding: '4px 0', borderBottom: '1px dashed var(--border)', minHeight: 56, fontStyle: d.philosophy ? 'normal' : 'italic', color: d.philosophy ? 'var(--text-mid)' : 'var(--text-dim)' }}>
                  {d.philosophy || 'Not written yet...'}
                </p>
              )}
            </div>

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 48 }} />

            {/* Section 03 — What moves you */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', fontFamily: "'Instrument Serif', Georgia, serif" }}>03</span>
                <div>
                  <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 3 }}>What moves you</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Books, people, ideas that rewired how you think.</p>
                </div>
              </div>
              {myHuntEditing ? (
                <textarea value={d.inspirations || ''} onChange={e => setDraft(x => ({ ...x, inspirations: e.target.value }))}
                  placeholder="Paul Graham's essays got me comfortable with uncertainty..."
                  style={{ ...inp_p, resize: 'none', lineHeight: 1.8, fontSize: 14, padding: '14px 0', background: 'transparent', border: 'none', borderBottom: '1px solid var(--blue)' }} rows={4} />
              ) : (
                <p style={{ fontSize: 14, lineHeight: 1.8, padding: '4px 0', borderBottom: '1px dashed var(--border)', minHeight: 56, fontStyle: d.inspirations ? 'normal' : 'italic', color: d.inspirations ? 'var(--text-mid)' : 'var(--text-dim)' }}>
                  {d.inspirations || 'Not written yet...'}
                </p>
              )}
            </div>

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 48 }} />

            {/* Section 04 — Life outside work */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', fontFamily: "'Instrument Serif', Georgia, serif" }}>04</span>
                <div>
                  <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 3 }}>Life outside work</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Who are you when the laptop is closed?</p>
                </div>
              </div>
              {myHuntEditing ? (
                <textarea value={d.life_outside || ''} onChange={e => setDraft(x => ({ ...x, life_outside: e.target.value }))}
                  placeholder="Cricket every Sunday morning..."
                  style={{ ...inp_p, resize: 'none', lineHeight: 1.8, fontSize: 14, padding: '14px 0', background: 'transparent', border: 'none', borderBottom: '1px solid var(--blue)' }} rows={4} />
              ) : (
                <p style={{ fontSize: 14, lineHeight: 1.8, padding: '4px 0', borderBottom: '1px dashed var(--border)', minHeight: 56, fontStyle: d.life_outside ? 'normal' : 'italic', color: d.life_outside ? 'var(--text-mid)' : 'var(--text-dim)' }}>
                  {d.life_outside || 'Not written yet...'}
                </p>
              )}
            </div>

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 48 }} />

            {/* Quote */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 20 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', fontFamily: "'Instrument Serif', Georgia, serif" }}>"</span>
                <div>
                  <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 3 }}>A line you live by</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Something that keeps pulling you forward.</p>
                </div>
              </div>
              {d.quote && (
                <div style={{ borderLeft: '2px solid var(--green)', paddingLeft: 20, marginBottom: 16 }}>
                  <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: 'var(--text)', lineHeight: 1.5, fontStyle: 'italic', marginBottom: 8 }}>"{d.quote}"</p>
                  {d.quote_author && <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{d.quote_author}</p>}
                </div>
              )}
              {myHuntEditing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input style={{ ...inp_p, fontSize: 14, fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }} value={d.quote || ''} placeholder="The people who are crazy enough..." onChange={e => setDraft(x => ({ ...x, quote: e.target.value }))} />
                  <input style={{ ...inp_p, fontSize: 12 }} value={d.quote_author || ''} placeholder="— Author (or your own words)" onChange={e => setDraft(x => ({ ...x, quote_author: e.target.value }))} />
                </div>
              )}
              {!myHuntEditing && !d.quote && (
                <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: 20 }}>
                  <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: 'var(--text-dim)', fontStyle: 'italic' }}>Your quote will appear here...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════ REVIEWS & RATINGS ═══════ */}
        {activeSection === 'reviews' && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>▲ reviews</p>
              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>What recruiters say.</h1>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 440 }}>After internships close, recruiters rate your performance. These ratings are visible to future recruiters and boost your HUNT Score.</p>
            </div>
            <div style={{ padding: '64px 32px', textAlign: 'center', border: '2px dashed var(--border)', background: 'var(--bg-card)' }}>
              <div style={{ width: 48, height: 48, background: 'var(--bg-subtle)', border: '1px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 20 }}>⭐</div>
              <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>No reviews yet.</p>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>Complete an internship through HUNT and your recruiter will be invited to leave a review.</p>
            </div>
          </div>
        )}

        {/* ═══════ HUNT SCORE ═══════ */}
        {activeSection === 'huntscore' && (() => {
          const p = studentProfile || {};
          const skills   = p.skills   || [];
          const projects = p.projects || [];
          const tools    = p.tools    || [];

          let pc = 0;
          if (p.full_name)                        pc += 3;
          if (p.email)                            pc += 2;
          if (p.bio && p.bio.length > 20)         pc += 3;
          if (p.avatar_url)                       pc += 2;
          if (p.resume_url)                       pc += 4;
          if (p.linkedin_url)                     pc += 3;
          if ((p.preferred_roles||[]).length > 0) pc += 2;
          if (p.availability)                     pc += 1;
          const profilePts = Math.min(pc, 20);

          let skillPts = 0;
          if (skills.length > 0) {
            const avgDepth = skills.reduce((s, sk) => s + (sk.level || sk.proficiency_level || 1), 0) / skills.length;
            skillPts = Math.round((avgDepth / 5) * 15 + Math.min((Math.log2(skills.length + 1) / Math.log2(11)) * 10, 10));
          }
          skillPts = Math.min(skillPts, 25);

          let githubPts = 0;
          if (p.github_url) {
            githubPts += 8;
            const withGH = projects.filter(pr => pr.githubUrl || pr.github_url || (pr.projectUrl||'').includes('github'));
            githubPts += Math.min(withGH.length * 2, 6);
          }
          githubPts = Math.min(githubPts, 20);

          let projPts = 0;
          if (projects.length > 0) {
            projPts += Math.min(projects.length * 3, 9);
            projects.forEach(pr => {
              if (pr.githubUrl || pr.github_url) projPts += 2;
              if (pr.projectUrl && !(pr.projectUrl||'').includes('github')) projPts += 2;
              if (pr.description && pr.description.length > 40) projPts += 1;
              if ((pr.techStack||[]).length >= 3) projPts += 1;
            });
          }
          projPts = Math.min(projPts, 20);

          let recencyPts = 3;
          const now = Date.now();
          const dateVals = [p.profile_updated_at, p.updated_at, ...projects.map(pr => pr.endDate||pr.end_date)]
            .filter(Boolean).map(dv => new Date(dv).getTime()).filter(t => !isNaN(t));
          if (dateVals.length > 0) {
            const diff = now - Math.max(...dateVals);
            const sixMo = 1000*60*60*24*180;
            recencyPts = diff < sixMo ? 10 : diff < sixMo*2 ? 6 : 2;
          }

          const toolPts = Math.min(tools.length, 5);
          const totalScore = Math.min(profilePts + skillPts + githubPts + projPts + recencyPts + toolPts, 100);

          const level = totalScore >= 80 ? 'elite' : totalScore >= 60 ? 'strong' : totalScore >= 40 ? 'building' : totalScore >= 20 ? 'starter' : 'unranked';
          const levelLabel = { elite: 'Elite Signal', strong: 'Strong Signal', building: 'Building Signal', starter: 'Starter', unranked: 'Unranked' }[level];

          const BREAKDOWN_ROWS = [
            { key: 'profile',  label: 'Profile completeness', desc: 'Name, bio, photo, resume, LinkedIn, preferred roles', pts: profilePts, max: 20, done: profilePts >= 14, tip: profilePts < 14 ? 'Add bio, upload resume, link LinkedIn to boost this' : null },
            { key: 'skills',   label: 'Skills & depth',       desc: 'Skill count and declared proficiency levels',         pts: skillPts,   max: 25, done: skillPts >= 18,   tip: skillPts < 18 ? 'Add more skills and set accurate proficiency levels' : null },
            { key: 'github',   label: 'GitHub activity',      desc: 'GitHub URL connected + projects with repo links',     pts: githubPts,  max: 20, done: githubPts >= 14,  tip: !p.github_url ? 'Add your GitHub profile URL to unlock this signal' : githubPts < 14 ? 'Link GitHub repos to your projects' : null },
            { key: 'projects', label: 'Project quality',      desc: 'Project count, live demos, descriptions, tech stack', pts: projPts,    max: 20, done: projPts >= 14,    tip: projPts < 14 ? 'Add more projects with GitHub links and live demos' : null },
            { key: 'recency',  label: 'Recency',              desc: 'How recently you updated your profile or added projects', pts: recencyPts, max: 10, done: recencyPts >= 8, tip: recencyPts < 8 ? 'Keep your profile updated — activity signals current skill' : null },
            { key: 'tools',    label: 'Tools',                desc: 'Tools, IDEs, and platforms you work with',            pts: toolPts,    max: 5,  done: toolPts >= 4,     tip: toolPts < 4 ? 'Add the tools and IDEs you use daily' : null },
          ];

          return (
            <div style={{ maxWidth: 640 }}>
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>▲ hunt score</p>
                <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>Your signal, scored.</h1>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 480 }}>
                  HUNT Score is your global credibility number — built from real profile signals, not college name.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', border: `1px solid ${totalScore > 0 ? 'var(--blue)' : 'var(--border)'}`, padding: '28px 32px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 28 }}>
                <div style={{ width: 88, height: 88, border: '2px solid var(--blue)', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: totalScore >= 100 ? 26 : 32, fontWeight: 700, color: 'var(--blue)', lineHeight: 1 }}>
                    {totalScore > 0 ? totalScore : '—'}
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: 'var(--text)', marginBottom: 4 }}>{levelLabel}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 10 }}>
                    {level === 'unranked'  && 'Complete your profile to get your first score.'}
                    {level === 'starter'   && 'Good start. Add projects and link GitHub to grow faster.'}
                    {level === 'building'  && "You're building signal. Keep adding verified proof of work."}
                    {level === 'strong'    && 'Strong profile. Recruiters will take you seriously.'}
                    {level === 'elite'     && 'Elite signal. You stand out in any recruiter shortlist.'}
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>i</span>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
                  College name is visible on your profile but <strong style={{ color: 'var(--text-mid)' }}>never</strong> factors into Hunt Score or match %. Only skills, activity, and proof of work count.
                </p>
              </div>

              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>Score breakdown</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {BREAKDOWN_ROWS.map(row => (
                  <div key={row.key} style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <div style={{ width: 16, height: 16, flexShrink: 0, border: `1px solid ${row.done ? 'var(--blue)' : 'var(--border-mid)'}`, background: row.done ? 'var(--blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {row.done && <span style={{ fontSize: 9, color: '#fff', lineHeight: 1 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 1 }}>{row.label}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{row.desc}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: row.pts > 0 ? 'var(--text)' : 'var(--text-dim)', fontWeight: 600 }}>{row.pts}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-dim)' }}>/{row.max}</span>
                      </div>
                    </div>
                    <div style={{ height: 2, background: 'var(--border)', marginLeft: 28, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(row.pts / row.max) * 100}%`, background: 'var(--blue)', transition: 'width 0.5s ease' }} />
                    </div>
                    {row.tip && <p style={{ fontSize: 11, color: '#E8A020', marginTop: 6, marginLeft: 28, lineHeight: 1.4 }}>→ {row.tip}</p>}
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>Coming soon</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'AI skill badge',       desc: 'Pass a skill assessment → unlock verified badge (+3 pts)', tag: 'SOON' },
                  { label: 'Trajectory physics',   desc: 'Velocity + momentum of your growth — computed each quarter', tag: 'SOON' },
                  { label: 'Recruiter ratings',    desc: 'Post-internship feedback from recruiters affects score', tag: 'SOON' },
                  { label: 'Friction events',      desc: 'Confirmed fake-skill reports permanently reduce score', tag: 'PERMANENT' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px dashed var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 1 }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', opacity: 0.7 }}>{item.desc}</p>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 7px', background: item.tag === 'PERMANENT' ? 'rgba(192,57,43,0.08)' : 'var(--bg-subtle)', color: item.tag === 'PERMANENT' ? 'var(--red)' : 'var(--text-dim)', border: `1px solid ${item.tag === 'PERMANENT' ? 'var(--red)' : 'var(--border)'}` }}>
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ═══════ ACCOUNT ═══════ */}
        {activeSection === 'account' && (
          <div style={{ maxWidth: 560 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>▲ account · private to you</p>
            <p style={{ fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif", color: 'var(--text)', marginBottom: 24 }}>Account settings</p>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', marginBottom: 20 }}>
                {d.avatar_url ? (
                  <img src={d.avatar_url} alt="avatar" style={{ width: 52, height: 52, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 52, height: 52, background: 'var(--ink)', display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 600, color: 'var(--cream)', flexShrink: 0 }}>{initials}</div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{d.full_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{d.email}</p>
                </div>
                <label style={{ fontSize: 12, padding: '6px 14px', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-mid)', background: 'var(--bg-card)', fontFamily: 'inherit' }}>
                  Change avatar<input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </label>
              </div>
              <div>
                <FieldLabel>Change email</FieldLabel>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inp_p, flex: 1 }} type="email" value={newEmail} placeholder="new@email.com" onChange={e => setNewEmail(e.target.value)} />
                  <button onClick={handleChangeEmail} disabled={changingEmail} style={{ padding: '0 16px', border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: 12, cursor: changingEmail ? 'default' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: changingEmail ? 0.6 : 1 }}>
                    {changingEmail ? 'Changing...' : 'Change'}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>A confirmation link will be sent to the new email</p>
              </div>
            </Card>

            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Notifications</p>
              {[
                { label: 'New job matches',     sub: 'When a job matches your skills',    key: 'notif_matches' },
                { label: 'Application updates', sub: 'When recruiters view your profile', key: 'notif_apps' },
                { label: 'Weekly digest',       sub: 'Summary every Monday',              key: 'notif_digest' },
                { label: 'Interview invites',   sub: 'Direct interview invitations',      key: 'notif_interviews' },
              ].map(({ label, sub, key }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div><p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{label}</p><p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{sub}</p></div>
                  <Toggle_P on={d[key] !== false} onChange={val => { setDraft(x => ({ ...x, [key]: val })); save({ [key]: val }, { silent: true }); }} />
                </div>
              ))}
            </Card>

            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Appearance</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['light', 'dark'].map(t => (
                  <button key={t} onClick={() => setTheme(t)} style={{ flex: 1, padding: '10px', border: `1.5px solid ${theme === t ? 'var(--text)' : 'var(--border)'}`, background: theme === t ? 'var(--bg-subtle)' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: theme === t ? 600 : 400, color: 'var(--text)', fontFamily: 'inherit' }}>
                    {t === 'light' ? 'Light' : 'Dark'}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Privacy</p>
              {[
                { label: 'Visible to recruiters', sub: 'Recruiters can find your profile',   key: 'privacy_visible',  def: true },
                { label: 'Show college name',      sub: 'Display your college on profile',    key: 'privacy_college',  def: true },
                { label: 'Activity status',        sub: 'Show when last active',              key: 'privacy_activity', def: false },
              ].map(({ label, sub, key, def }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div><p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{label}</p><p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{sub}</p></div>
                  <Toggle_P on={d[key] !== undefined ? d[key] : def} onChange={val => { setDraft(x => ({ ...x, [key]: val })); save({ [key]: val }, { silent: true }); }} />
                </div>
              ))}
            </Card>

            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Session</p>
              <button onClick={handleSignOut} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </button>
              <button onClick={handlePauseAccount} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', background: d.account_paused ? 'var(--green-tint)' : 'var(--bg-card)', color: d.account_paused ? 'var(--green-text)' : 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                {d.account_paused ? 'Resume account' : 'Pause account'}
              </button>
              {d.account_paused && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, textAlign: 'center' }}>Account paused — recruiters can't see your profile</p>}
            </Card>

            <div style={{ padding: '16px 18px', border: '1px solid var(--red)', background: 'var(--red-tint)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 3 }}>Danger Zone</p>
              <p style={{ fontSize: 12, color: 'var(--red)', opacity: 0.8, marginBottom: 12 }}>Permanently delete your account. Cannot be undone.</p>
              <button onClick={() => { if (window.confirm('Delete your account? This cannot be undone.')) showToast('Delete coming soon', 'err'); }} style={{ padding: '7px 16px', border: '1px solid var(--red)', background: 'transparent', color: 'var(--red)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Delete account</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
