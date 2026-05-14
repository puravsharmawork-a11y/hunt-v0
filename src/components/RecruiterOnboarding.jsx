// src/components/RecruiterOnboarding.jsx
//
// SETUP:
// 1. Drop into src/components/RecruiterOnboarding.jsx
// 2. Add to App.jsx imports:
//      import RecruiterOnboarding from './components/RecruiterOnboarding';
// 3. Add route inside <Routes> in App.jsx:
//      <Route path="/recruiter/onboarding" element={user ? <RecruiterOnboarding /> : <Navigate to="/" />} />
// 4. Make sure you ran the SQL migrations (recruiters + startups tables) from the earlier step.
// 5. In LandingPage.jsx, change the "Reserve Early Access" / sign-in flow for startups to call:
//      signInWithGoogle() then redirect to /recruiter/onboarding
//    OR just navigate('/recruiter/onboarding') after google auth if user is already signed in.
//
// FIXES vs previous version:
//  - Logo: optional real image upload (file → base64 preview + Supabase storage) instead of emoji picker
//  - Removed "What the intern will actually do" field — onboarding is about the company, not the role
//  - Added richer company questions: tagline, one_line_pitch, industry, hq_location, founded_year, why_join
//  - On submit: creates a row in `startups` table first, then links it to the recruiter via startup_id
//  - Dashboard ProfileTab now shows correct data because startups row exists

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, ArrowLeft, Check, X, Plus,
  Building2, Briefcase, Code, Rocket,
  Sun, Moon, Loader, CheckCircle2, Camera, Upload,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOut } from '../services/supabase';

// ─── Design tokens ────────────────────────────────────────────────────────────
const tokens = {
  light: {
    '--bg':           '#FAFAF8',
    '--bg-card':      '#FFFFFF',
    '--bg-subtle':    '#F5F5F2',
    '--border':       '#EBEBEA',
    '--border-mid':   '#D6D6D3',
    '--text':         '#0A0A0A',
    '--text-mid':     '#5A5A56',
    '--text-dim':     '#9B9B97',
    '--ember':        '#D85A30',
    '--ember-tint':   'rgba(216,90,48,0.08)',
    '--ember-border': 'rgba(216,90,48,0.3)',
    '--green':        '#1A7A4A',
    '--green-tint':   '#E8F5EE',
    '--focus':        '#D85A30',
  },
  dark: {
    '--bg':           '#0C0B09',
    '--bg-card':      '#131210',
    '--bg-subtle':    '#1A1916',
    '--border':       'rgba(255,255,255,0.08)',
    '--border-mid':   'rgba(255,255,255,0.14)',
    '--text':         '#FAFAF8',
    '--text-mid':     'rgba(255,255,255,0.55)',
    '--text-dim':     'rgba(255,255,255,0.28)',
    '--ember':        '#E8714A',
    '--ember-tint':   'rgba(216,90,48,0.12)',
    '--ember-border': 'rgba(216,90,48,0.35)',
    '--green':        '#2EAD6A',
    '--green-tint':   '#0D2B1A',
    '--focus':        '#E8714A',
  },
};

function applyTokens(theme) {
  Object.entries(tokens[theme]).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v)
  );
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function getRecruiterProfile() {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('recruiters')
    .select('*')
    .eq('auth_id', user.id)
    .single();
  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

// Creates startup row, then recruiter row linked to it.
// Returns the new recruiter row.
async function createRecruiterAndStartup(profileData) {
  const user = await getCurrentUser();

  // 1. Create startup row with all company info
  const startupPayload = {
    name:           profileData.company_name,
    tagline:        profileData.tagline        || null,
    one_line_pitch: profileData.one_line_pitch  || null,
    about:          profileData.about           || null,
    why_join:       profileData.why_join        || null,
    website:        profileData.website         || null,
    stage:          profileData.stage           || null,
    team_size:      profileData.team_size       || null,
    industry:       profileData.industry        || null,
    hq_location:    profileData.hq_location     || null,
    founded_year:   profileData.founded_year
      ? parseInt(profileData.founded_year, 10) || null
      : null,
    logo_url:       profileData.logo_url        || null,
  };

  const { data: startup, error: startupErr } = await supabase
    .from('startups')
    .insert([startupPayload])
    .select()
    .single();

  if (startupErr) throw startupErr;

  // 2. Create recruiter row linked to startup
  const recruiterPayload = {
    auth_id:         user.id,
    email:           user.email,
    contact_name:    profileData.contact_name,
    company_name:    profileData.company_name,
    website:         profileData.website        || null,
    team_size:       profileData.team_size      || null,
    stage:           profileData.stage          || null,
    role_categories: profileData.role_categories,
    hiring_note:     profileData.hiring_note    || null,
    startup_id:      startup.id,
  };

  const { data: recruiter, error: recruiterErr } = await supabase
    .from('recruiters')
    .insert([recruiterPayload])
    .select()
    .single();

  if (recruiterErr) throw recruiterErr;
  return recruiter;
}

// Upload logo to Supabase storage, return public URL
async function uploadLogo(file) {
  const user = await getCurrentUser();
  const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `logos/${user.id}-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from('student-files')   // reuse same bucket; adjust if you have a separate one
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });

  if (upErr) throw new Error(upErr.message || 'Logo upload failed');

  const { data: { publicUrl } } = supabase.storage
    .from('student-files')
    .getPublicUrl(path);

  return publicUrl;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const TEAM_SIZES = ['Just me', '2–5', '6–15', '16–50', '50+'];

const STAGE_OPTIONS = [
  { value: 'idea',    label: 'Idea stage',      desc: 'Pre-product, still validating' },
  { value: 'mvp',     label: 'MVP / Beta',      desc: 'Product exists, early users' },
  { value: 'early',   label: 'Early traction',  desc: 'Revenue or meaningful users' },
  { value: 'growth',  label: 'Growing',         desc: 'Scaling, Series A or beyond' },
  { value: 'company', label: 'Established',     desc: 'Stable company, 50+ team' },
];

const ROLE_CATEGORIES = [
  'Full Stack', 'Backend', 'Frontend', 'Mobile',
  'ML / AI', 'Data', 'DevOps', 'Design',
  'Product', 'Marketing', 'Sales', 'Other',
];

const STEPS = [
  { num: 1, label: 'Company',  icon: Building2 },
  { num: 2, label: 'Story',    icon: Briefcase },
  { num: 3, label: 'Hiring',   icon: Code },
  { num: 4, label: 'Done',     icon: Rocket },
];

// ─── Shared style helpers ─────────────────────────────────────────────────────

const inp = (focused) => ({
  width: '100%', padding: '11px 14px', borderRadius: 8,
  border: `1px solid ${focused ? 'var(--ember)' : 'var(--border)'}`,
  background: 'var(--bg-subtle)', color: 'var(--text)',
  fontSize: 13, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
});

function Field({ label, required, hint, children }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--ember)', marginLeft: 3 }}>*</span>}
      </p>
      {children}
      {hint && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

function TextInput({ label, required, hint, value, onChange, placeholder, type = 'text' }) {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} required={required} hint={hint}>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inp(focused)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </Field>
  );
}

function TextArea({ label, required, hint, value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} required={required} hint={hint}>
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{ ...inp(focused), resize: 'none' }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </Field>
  );
}

// ─── Logo Upload component ────────────────────────────────────────────────────

function LogoUpload({ preview, onChange }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Logo must be under 3 MB');
      return;
    }
    // Show local preview immediately; actual upload happens on submit
    const reader = new FileReader();
    reader.onload = ev => onChange({ file, preview: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <Field
      label="Company logo"
      hint="Optional. PNG or JPG, under 3 MB. Shown on your profile and job cards."
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Preview box */}
        <div
          style={{
            width: 64, height: 64, borderRadius: 12, flexShrink: 0,
            border: `1.5px dashed ${preview ? 'var(--ember)' : 'var(--border)'}`,
            background: 'var(--bg-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', position: 'relative', cursor: 'pointer',
          }}
          onClick={() => ref.current?.click()}
          title="Click to upload logo"
        >
          {preview
            ? <img src={preview} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Camera size={20} style={{ color: 'var(--text-dim)' }} />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-subtle)', color: 'var(--text-mid)',
              fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ember)'; e.currentTarget.style.color = 'var(--ember)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-mid)'; }}
          >
            <Upload size={13} />
            {preview ? 'Replace logo' : 'Upload logo'}
          </button>
          {preview && (
            <button
              type="button"
              onClick={() => onChange(null)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 6, border: 'none',
                background: 'transparent', color: 'var(--text-dim)',
                fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              <X size={11} /> Remove
            </button>
          )}
        </div>

        <input
          ref={ref} type="file" accept="image/png,image/jpeg,image/webp"
          style={{ display: 'none' }} onChange={handleFile}
        />
      </div>
    </Field>
  );
}

// ─── Step header ──────────────────────────────────────────────────────────────

function StepHeader({ step, title, italic, sub }) {
  const stepLabels = ['Company', 'Story', 'Hiring', 'Done'];
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 12 }}>
        0{step} — {stepLabels[step - 1]}
      </p>
      <h2 style={{ fontFamily: "'Editorial New', Georgia, 'Times New Roman', serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 10 }}>
        {title}<br /><em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>{italic}</em>
      </h2>
      {sub && <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--text-mid)', lineHeight: 1.65, maxWidth: 420 }}>{sub}</p>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RecruiterOnboarding() {
  const navigate = useNavigate();
  const [theme, setTheme]                 = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [currentStep, setCurrentStep]     = useState(1);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [approved, setApproved]           = useState(null);
  const [error, setError]                 = useState('');

  // Logo: { file: File, preview: string } or null
  const [logoData, setLogoData] = useState(null);

  const [form, setForm] = useState({
    // Step 1 — Company basics
    company_name:    '',
    contact_name:    '',
    website:         '',
    industry:        '',
    hq_location:     '',
    founded_year:    '',
    team_size:       '',
    stage:           '',
    // Step 2 — Company story
    tagline:         '',
    one_line_pitch:  '',
    about:           '',
    why_join:        '',
    // Step 3 — Hiring
    role_categories: [],
    hiring_note:     '',
  });

  useEffect(() => { applyTokens(theme); localStorage.setItem('hunt-theme', theme); }, [theme]);

  // Check if already onboarded; check waitlist approval
  useEffect(() => {
    (async () => {
      try {
        const existing = await getRecruiterProfile();
        if (existing) { navigate('/recruiter/dashboard'); return; }

        const user = await getCurrentUser();
        const { data } = await supabase
          .from('recruiter_waitlist')
          .select('approved')
          .eq('email', user.email)
          .single();

        setApproved(!data || !data.approved ? false : true);
      } catch {
        setApproved(false);
      } finally {
        setCheckingExisting(false);
      }
    })();
  }, []);

  const set = (field) => (value) => setForm(f => ({ ...f, [field]: value }));

  const toggleCategory = (cat) => {
    setForm(f => ({
      ...f,
      role_categories: f.role_categories.includes(cat)
        ? f.role_categories.filter(c => c !== cat)
        : [...f.role_categories, cat],
    }));
  };

  // ── Validation per step ────────────────────────────────────────────────────
  const validate = (step) => {
    if (step === 1) {
      if (!form.company_name.trim()) return 'Company name is required.';
      if (!form.contact_name.trim()) return 'Your name is required.';
      if (!form.stage)               return 'Please select your company stage.';
      if (!form.team_size)           return 'Please select team size.';
    }
    if (step === 2) {
      if (!form.about.trim()) return 'Tell us what your company is building.';
    }
    if (step === 3) {
      if (form.role_categories.length === 0) return 'Select at least one role type.';
    }
    return '';
  };

  const handleNext = () => {
    const err = validate(currentStep);
    if (err) { setError(err); return; }
    setError('');
    setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(s => s - 1);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const err = validate(3);
    if (err) { setError(err); return; }
    setIsSubmitting(true);
    setError('');

    try {
      let logo_url = null;

      // Upload logo if provided
      if (logoData?.file) {
        try {
          logo_url = await uploadLogo(logoData.file);
        } catch (uploadErr) {
          // Non-fatal: log and continue without logo
          console.warn('Logo upload failed (non-fatal):', uploadErr.message);
        }
      }

      await createRecruiterAndStartup({
        company_name:    form.company_name.trim(),
        contact_name:    form.contact_name.trim(),
        website:         form.website.trim()        || null,
        industry:        form.industry.trim()       || null,
        hq_location:     form.hq_location.trim()    || null,
        founded_year:    form.founded_year.trim()   || null,
        team_size:       form.team_size,
        stage:           form.stage,
        tagline:         form.tagline.trim()        || null,
        one_line_pitch:  form.one_line_pitch.trim() || null,
        about:           form.about.trim(),
        why_join:        form.why_join.trim()       || null,
        role_categories: form.role_categories,
        hiring_note:     form.hiring_note.trim()    || null,
        logo_url,
      });

      setCurrentStep(4); // success screen
    } catch (e) {
      setError('Something went wrong: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep - 1) / 3) * 100;

  // ─── Loading / waitlist screens ───────────────────────────────────────────
  if (checkingExisting) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <Loader size={20} style={{ color: 'var(--ember)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (approved === false) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 400, textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 32, marginBottom: 20 }}>🕐</div>
        <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 12 }}>
          You're on the<br /><em style={{ color: 'var(--ember)', fontStyle: 'italic' }}>waitlist.</em>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 24 }}>
          We review recruiter accounts manually to keep the quality high. We'll email you when you're approved.
        </p>
        <button
          onClick={async () => { try { await signOut(); navigate('/'); } catch {} }}
          style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>
      <style>{`* { box-sizing: border-box; }`}</style>
    </div>
  );

  // ─── Main onboarding UI ───────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: "'DM Sans', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased',
    }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--text)' }}>HUNT</span>
          <span style={{ width: 1, height: 16, background: 'var(--border)', display: 'inline-block' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ember)', fontWeight: 500 }}>Recruiter setup</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentStep < 4 && (
            <div style={{ fontSize: 11, color: 'var(--text-dim)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
              {currentStep}/3
            </div>
          )}
          <button
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          </button>
        </div>
      </nav>

      {/* Progress bar */}
      {currentStep < 4 && (
        <div style={{ height: 2, background: 'var(--border)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--ember)', transition: 'width 0.4s ease' }} />
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 580, margin: '0 auto', padding: 'clamp(32px, 6vw, 64px) 24px 80px' }}>

        {/* Step indicators */}
        {currentStep < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
            {STEPS.slice(0, 3).map((s, i) => {
              const done   = currentStep > s.num;
              const active = currentStep === s.num;
              return (
                <React.Fragment key={s.num}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600, transition: 'all 0.2s',
                      background: active ? 'var(--ember)' : done ? 'var(--ember-tint)' : 'var(--bg-subtle)',
                      border: `1.5px solid ${active ? 'var(--ember)' : done ? 'var(--ember)' : 'var(--border)'}`,
                      color: active ? '#fff' : done ? 'var(--ember)' : 'var(--text-dim)',
                    }}>
                      {done ? <Check size={13} strokeWidth={2.5} /> : s.num}
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: active ? 'var(--ember)' : done ? 'var(--text-mid)' : 'var(--text-dim)' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div style={{ flex: 1, height: 1, background: currentStep > s.num ? 'var(--ember)' : 'var(--border)', margin: '0 8px', marginBottom: 20, transition: 'background 0.3s' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════ STEP 1 — Company ══════════════════════ */}
        {currentStep === 1 && (
          <div>
            <StepHeader
              step={1}
              title="Tell us about"
              italic="your company."
              sub="Basic details about who you are and where you're at. Students see this on your profile and job cards."
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>

              {/* Logo upload */}
              <LogoUpload
                preview={logoData?.preview || null}
                onChange={setLogoData}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TextInput
                  label="Company / startup name" required
                  value={form.company_name} onChange={set('company_name')}
                  placeholder="TechFlow AI"
                />
                <TextInput
                  label="Your name" required
                  value={form.contact_name} onChange={set('contact_name')}
                  placeholder="Rahul Mehta"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TextInput
                  label="Website"
                  value={form.website} onChange={set('website')}
                  placeholder="https://yoursite.com" type="url"
                />
                <TextInput
                  label="Industry"
                  value={form.industry} onChange={set('industry')}
                  placeholder="HR Tech / SaaS / Fintech"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TextInput
                  label="HQ Location"
                  value={form.hq_location} onChange={set('hq_location')}
                  placeholder="Bangalore, India"
                />
                <TextInput
                  label="Founded year"
                  value={form.founded_year} onChange={set('founded_year')}
                  placeholder="2024" type="number"
                />
              </div>

              {/* Team size */}
              <Field label="Team size" required>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {TEAM_SIZES.map(size => (
                    <button key={size} type="button" onClick={() => set('team_size')(size)} style={{
                      padding: '8px 16px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
                      background: form.team_size === size ? 'var(--ember-tint)' : 'var(--bg-subtle)',
                      border: `1px solid ${form.team_size === size ? 'var(--ember)' : 'var(--border)'}`,
                      color: form.team_size === size ? 'var(--ember)' : 'var(--text-mid)',
                      fontWeight: form.team_size === size ? 500 : 400,
                    }}>
                      {size}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Stage */}
              <Field label="Company stage" required>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {STAGE_OPTIONS.map(stage => (
                    <button key={stage.value} type="button" onClick={() => set('stage')(stage.value)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                      background: form.stage === stage.value ? 'var(--ember-tint)' : 'var(--bg-subtle)',
                      border: `1px solid ${form.stage === stage.value ? 'var(--ember)' : 'var(--border)'}`,
                    }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: form.stage === stage.value ? 'var(--ember)' : 'var(--text)', margin: 0 }}>{stage.label}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0, marginTop: 1 }}>{stage.desc}</p>
                      </div>
                      {form.stage === stage.value && (
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--ember)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={10} color="#fff" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* ══════════════════════════ STEP 2 — Story ════════════════════════ */}
        {currentStep === 2 && (
          <div>
            <StepHeader
              step={2}
              title="What's your"
              italic="company story?"
              sub="Students read this before they apply. Be genuine — a few paragraphs is enough. No job-description fluff."
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>

              <TextInput
                label="Tagline"
                value={form.tagline} onChange={set('tagline')}
                placeholder="Skill-first internships for India"
                hint="One short line — shown on your profile card."
              />

              <TextInput
                label="One-line pitch"
                value={form.one_line_pitch} onChange={set('one_line_pitch')}
                placeholder="We help D2C brands understand why customers churn and fix it with AI."
                hint="Slightly longer — shown under your company name."
              />

              <TextArea
                label="About the company" required
                value={form.about} onChange={set('about')}
                placeholder="What do you build, who do you serve, and what problem are you solving? Be real — a paragraph or two is perfect."
                rows={5}
                hint="This fills your 'About' section in the dashboard profile."
              />

              <TextArea
                label="Why join us?"
                value={form.why_join} onChange={set('why_join')}
                placeholder="What will someone working with you actually learn and experience? Talk about ownership, the team, the growth curve."
                rows={4}
                hint="Shown as a 'Why Join Us' section — helps you stand out to candidates."
              />

              {/* Preview card */}
              {(form.about || form.tagline || form.company_name) && (
                <div style={{ padding: '16px', borderRadius: 10, border: '1px solid var(--ember-border)', background: 'var(--ember-tint)' }}>
                  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 10 }}>
                    Preview — how students see you
                  </p>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* Logo or initials */}
                    <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {logoData?.preview
                        ? <img src={logoData.preview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-mid)' }}>{(form.company_name || '?').slice(0, 2).toUpperCase()}</span>
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{form.company_name || 'Your Company'}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>
                        {STAGE_OPTIONS.find(s => s.value === form.stage)?.label || 'Stage'} · {form.team_size || '—'} · {form.hq_location || 'Location'}
                      </p>
                      {form.tagline && <p style={{ fontSize: 12, color: 'var(--ember)', fontWeight: 500, marginBottom: 4 }}>{form.tagline}</p>}
                      <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.55 }}>{form.about ? form.about.slice(0, 160) + (form.about.length > 160 ? '…' : '') : '…'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════ STEP 3 — Hiring ═══════════════════════ */}
        {currentStep === 3 && (
          <div>
            <StepHeader
              step={3}
              title="What kind of intern"
              italic="are you looking for?"
              sub="Pick all that apply. This helps us surface the right candidates when you post a role."
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>

              <Field label="Role types you hire for" required>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {ROLE_CATEGORIES.map(cat => {
                    const selected = form.role_categories.includes(cat);
                    return (
                      <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{
                        padding: '10px 14px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                        background: selected ? 'var(--ember-tint)' : 'var(--bg-subtle)',
                        border: `1px solid ${selected ? 'var(--ember)' : 'var(--border)'}`,
                        color: selected ? 'var(--ember)' : 'var(--text-mid)',
                        fontWeight: selected ? 500 : 400,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <span>{cat}</span>
                        {selected && <Check size={12} strokeWidth={2.5} />}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <TextArea
                label="Anything else we should know? (optional)"
                value={form.hiring_note} onChange={set('hiring_note')}
                placeholder="e.g. We prefer candidates who've shipped side projects. We move fast and deploy weekly. Remote-friendly."
                rows={3}
              />

              {/* Summary before submit */}
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>
                  Profile summary
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Company',  val: form.company_name },
                    { label: 'Industry', val: form.industry },
                    { label: 'Location', val: form.hq_location },
                    { label: 'Stage',    val: STAGE_OPTIONS.find(s => s.value === form.stage)?.label },
                    { label: 'Team',     val: form.team_size },
                    { label: 'Hiring',   val: form.role_categories.join(', ') || '—' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', width: 64, flexShrink: 0 }}>{label}</span>
                      <span style={{ fontSize: 12, color: val ? 'var(--text)' : 'var(--text-dim)', fontWeight: val ? 500 : 400, fontStyle: val ? 'normal' : 'italic' }}>{val || 'not set'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════ STEP 4 — Success ══════════════════════ */}
        {currentStep === 4 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ember-tint)', border: '2px solid var(--ember)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'popIn 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
              <Check size={28} color="var(--ember)" strokeWidth={2.5} />
            </div>

            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 12 }}>
              You're set up
            </p>

            <h2 style={{ fontFamily: "'Editorial New', Georgia, 'Times New Roman', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 16 }}>
              Welcome to HUNT,<br /><em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>{form.company_name}.</em>
            </h2>

            <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-mid)', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 40px' }}>
              Your company profile is live. Post your first internship and we'll match the right candidates to it.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 36, textAlign: 'left' }}>
              {[
                { num: '01', title: 'Post an internship', desc: 'Set the role, required skills, stipend, and duration. Takes 3 minutes.' },
                { num: '02', title: 'We match candidates', desc: 'HUNT scores every student against your role spec. Only the best fit applies.' },
                { num: '03', title: 'Review your shortlist', desc: 'See top ranked profiles with match breakdowns. Shortlist or pass in one click.' },
              ].map(item => (
                <div key={item.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: 'var(--ember)', flexShrink: 0, marginTop: 1 }}>{item.num}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/recruiter/dashboard')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '13px 32px', borderRadius: 8, border: 'none',
                background: 'var(--ember)', color: '#fff',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Go to dashboard <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', marginBottom: 16 }}>
            <X size={13} color="#c0392b" />
            <p style={{ fontSize: 12, color: '#c0392b', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Navigation buttons */}
        {currentStep < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 13, cursor: currentStep === 1 ? 'default' : 'pointer', fontFamily: 'inherit', opacity: currentStep === 1 ? 0.3 : 1, transition: 'all 0.15s' }}
              onMouseEnter={e => { if (currentStep > 1) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-mid)'; } }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-mid)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <ArrowLeft size={14} /> Back
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--ember)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, border: 'none', background: isSubmitting ? 'var(--text-dim)' : 'var(--ember)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: isSubmitting ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {isSubmitting
                  ? <><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating profile…</>
                  : <><CheckCircle2 size={14} /> Complete setup</>}
              </button>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes popIn { from { opacity:0; transform: scale(0.6); } to { opacity:1; transform: scale(1); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
