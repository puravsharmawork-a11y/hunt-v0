// src/components/RecruiterOnboarding.jsx
//
// SETUP:
// 1. Drop into src/components/RecruiterOnboarding.jsx
// 2. Add to App.jsx imports:
//      import RecruiterOnboarding from './components/RecruiterOnboarding';
// 3. Add route inside <Routes> in App.jsx:
//      <Route path="/recruiter/onboarding" element={user ? <RecruiterOnboarding /> : <Navigate to="/" />} />
// 4. Make sure you ran the SQL migrations (recruiters table) from the earlier step.
// 5. In LandingPage.jsx, change the "Reserve Early Access" / sign-in flow for startups to call:
//      signInWithGoogle() then redirect to /recruiter/onboarding
//    OR just navigate('/recruiter/onboarding') after google auth if user is already signed in.

import React, { useState, useEffect } from 'react';
import {
  ArrowRight, ArrowLeft, Check, X, Plus,
  Building2, Briefcase, Code, Rocket,
  Sun, Moon, Loader, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOut } from '../services/supabase';

// ─── Design tokens (light = recruiter side is always light per LandingPage) ──
const tokens = {
  light: {
    '--bg':          '#FAFAF8',
    '--bg-card':     '#FFFFFF',
    '--bg-subtle':   '#F5F5F2',
    '--border':      '#EBEBEA',
    '--border-mid':  '#D6D6D3',
    '--text':        '#0A0A0A',
    '--text-mid':    '#5A5A56',
    '--text-dim':    '#9B9B97',
    '--ember':       '#D85A30',
    '--ember-tint':  'rgba(216,90,48,0.08)',
    '--ember-border':'rgba(216,90,48,0.3)',
    '--green':       '#1A7A4A',
    '--green-tint':  '#E8F5EE',
    '--focus':       '#D85A30',
  },
  dark: {
    '--bg':          '#0C0B09',
    '--bg-card':     '#131210',
    '--bg-subtle':   '#1A1916',
    '--border':      'rgba(255,255,255,0.08)',
    '--border-mid':  'rgba(255,255,255,0.14)',
    '--text':        '#FAFAF8',
    '--text-mid':    'rgba(255,255,255,0.55)',
    '--text-dim':    'rgba(255,255,255,0.28)',
    '--ember':       '#E8714A',
    '--ember-tint':  'rgba(216,90,48,0.12)',
    '--ember-border':'rgba(216,90,48,0.35)',
    '--green':       '#2EAD6A',
    '--green-tint':  '#0D2B1A',
    '--focus':       '#E8714A',
  }
};

function applyTokens(theme) {
  Object.entries(tokens[theme]).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v)
  );
}

// ─── Supabase helpers for recruiters ─────────────────────────────────────────

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

async function createRecruiterProfile(profileData) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('recruiters')
    .insert([{ auth_id: user.id, email: user.email, ...profileData }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TEAM_SIZES = ['Just me', '2–5', '6–15', '16–50', '50+'];

const STAGE_OPTIONS = [
  { value: 'idea',    label: 'Idea stage',    desc: 'Pre-product, still validating' },
  { value: 'mvp',     label: 'MVP / Beta',    desc: 'Product exists, early users' },
  { value: 'early',   label: 'Early traction', desc: 'Revenue or meaningful users' },
  { value: 'growth',  label: 'Growing',       desc: 'Scaling, Series A or beyond' },
  { value: 'company', label: 'Established',   desc: 'Stable company, 50+ team' },
];

const ROLE_CATEGORIES = [
  'Full Stack', 'Backend', 'Frontend', 'Mobile',
  'ML / AI', 'Data', 'DevOps', 'Design',
  'Product', 'Marketing', 'Sales', 'Other',
];

const LOGO_EMOJIS = ['🚀','⚡','🎯','💡','🔥','🌊','🛠️','📊','🎨','🌱','⭐','🦾'];

const STEPS = [
  { num: 1, label: 'Company',     icon: Building2 },
  { num: 2, label: 'About',       icon: Briefcase },
  { num: 3, label: 'Hiring for',  icon: Code },
  { num: 4, label: 'Done',        icon: Rocket },
];

// ─── Shared style ─────────────────────────────────────────────────────────────
const inp = (focused) => ({
  width: '100%', padding: '11px 14px', borderRadius: 8,
  border: `1px solid ${focused ? 'var(--ember)' : 'var(--border)'}`,
  background: 'var(--bg-subtle)', color: 'var(--text)',
  fontSize: 13, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
});

// ─── Input with focus tracking ────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--ember)', marginLeft: 3 }}>*</span>}
      </p>
      {children}
    </div>
  );
}

function TextInput({ label, required, value, onChange, placeholder, type = 'text' }) {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} required={required}>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inp(focused)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </Field>
  );
}

function TextArea({ label, required, value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} required={required}>
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{ ...inp(focused), resize: 'none' }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </Field>
  );
}

// ─── Step header ──────────────────────────────────────────────────────────────
function StepHeader({ step, title, italic, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 12 }}>
        0{step} — {['Company', 'About', 'Hiring for', 'Done'][step - 1]}
      </p>
      <h2 style={{ fontFamily: "'Editorial New', Georgia, 'Times New Roman', serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 10 }}>
        {title}<br /><em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>{italic}</em>
      </h2>
      {sub && <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--text-mid)', lineHeight: 1.65, maxWidth: 400 }}>{sub}</p>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RecruiterOnboarding() {
  const navigate = useNavigate();
  const [theme, setTheme]           = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [error, setError]           = useState('');

  const [form, setForm] = useState({
    // Step 1 — Company
    company_name:  '',
    contact_name:  '',
    website:       '',
    logo_emoji:    '🚀',
    team_size:     '',
    stage:         '',
    // Step 2 — About
    about:         '',
    what_you_build:'',
    // Step 3 — Hiring for
    role_categories: [],
    hiring_note:   '',
  });

  useEffect(() => { applyTokens(theme); localStorage.setItem('hunt-theme', theme); }, [theme]);

  // If recruiter already onboarded, skip to dashboard
  useEffect(() => {
  (async () => {
    try {
      // Already onboarded? Skip straight to dashboard
      const existing = await getRecruiterProfile();
      if (existing) { navigate('/recruiter/dashboard'); return; }

      // Check if their email is approved
      const user = await getCurrentUser();
      const { data } = await supabase
        .from('recruiter_waitlist')
        .select('approved')
        .eq('email', user.email)
        .single();

      if (!data || !data.approved) {
        setApproved(false); // show waitlist screen
      } else {
        setApproved(true);  // let them through
      }
    } catch (e) {
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
      if (!form.stage) return 'Please select your company stage.';
      if (!form.team_size) return 'Please select team size.';
    }
    if (step === 2) {
      if (!form.what_you_build.trim()) return 'Tell us what you\'re building.';
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
      await createRecruiterProfile({
        company_name:    form.company_name.trim(),
        contact_name:    form.contact_name.trim(),
        website:         form.website.trim() || null,
        logo_emoji:      form.logo_emoji,
        team_size:       form.team_size,
        stage:           form.stage,
        about:           form.about.trim() || null,
        what_you_build:  form.what_you_build.trim(),
        role_categories: form.role_categories,
        hiring_note:     form.hiring_note.trim() || null,
      });
      setCurrentStep(4); // success screen
    } catch (e) {
      setError('Something went wrong: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep - 1) / 3) * 100;

  // ─────────────────────────────────────────────────────────────────────────
  if (checkingExisting) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <Loader size={20} style={{ color: 'var(--ember)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: "'DM Sans', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased',
    }}>

      {/* ── Nav ── */}
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
          {/* Progress pill */}
          {currentStep < 4 && (
            <div style={{ fontSize: 11, color: 'var(--text-dim)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
              {currentStep}/3
            </div>
          )}
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          </button>
        </div>
      </nav>

      {/* ── Progress bar ── */}
      {currentStep < 4 && (
        <div style={{ height: 2, background: 'var(--border)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--ember)', transition: 'width 0.4s ease' }} />
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(32px, 6vw, 64px) 24px 80px' }}>

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

        {/* ════════════════════════════════ STEP 1 ════════════════════════════ */}
        {currentStep === 1 && (
          <div>
            <StepHeader
              step={1}
              title="Tell us about"
              italic="your company."
              sub="This shows up on your recruiter profile. Students see your company name and what stage you're at."
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>

              {/* Logo emoji picker */}
              <Field label="Pick a logo emoji">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {LOGO_EMOJIS.map(emoji => (
                    <button key={emoji} onClick={() => set('logo_emoji')(emoji)} style={{
                      width: 40, height: 40, borderRadius: 8, fontSize: 20,
                      border: `1.5px solid ${form.logo_emoji === emoji ? 'var(--ember)' : 'var(--border)'}`,
                      background: form.logo_emoji === emoji ? 'var(--ember-tint)' : 'var(--bg-subtle)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.12s',
                    }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TextInput label="Company / startup name" required value={form.company_name} onChange={set('company_name')} placeholder="TechFlow AI" />
                <TextInput label="Your name" required value={form.contact_name} onChange={set('contact_name')} placeholder="Rahul Mehta" />
              </div>

              <TextInput label="Website" value={form.website} onChange={set('website')} placeholder="https://yoursite.com" type="url" />

              {/* Team size */}
              <Field label="Team size" required>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {TEAM_SIZES.map(size => (
                    <button key={size} onClick={() => set('team_size')(size)} style={{
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
                    <button key={stage.value} onClick={() => set('stage')(stage.value)} style={{
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

        {/* ════════════════════════════════ STEP 2 ════════════════════════════ */}
        {currentStep === 2 && (
          <div>
            <StepHeader
              step={2}
              title="What are you"
              italic="building?"
              sub="Students read this before applying. Be real — a paragraph is enough. No need to sound like a job description."
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              <TextArea
                label="What you're building" required
                value={form.what_you_build} onChange={set('what_you_build')}
                placeholder="We're building an AI-powered analytics platform for e-commerce brands. We help stores understand why customers churn and what to do about it."
                rows={4}
              />

              <TextArea
                label="What the intern will actually do"
                value={form.about} onChange={set('about')}
                placeholder="The intern will work directly with our CTO, building backend APIs, writing tests, and shipping features to production. Not just bug fixes — real work."
                rows={4}
              />

              {/* Preview card */}
              {(form.what_you_build || form.company_name) && (
                <div style={{ padding: '16px', borderRadius: 10, border: '1px solid var(--ember-border)', background: 'var(--ember-tint)' }}>
                  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 10 }}>Preview — how students see you</p>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{form.logo_emoji}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{form.company_name || 'Your Company'}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>
                        {STAGE_OPTIONS.find(s => s.value === form.stage)?.label || 'Stage'} · {form.team_size || 'Team size'} people
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.55 }}>{form.what_you_build || '…'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════ STEP 3 ════════════════════════════ */}
        {currentStep === 3 && (
          <div>
            <StepHeader
              step={3}
              title="What kind of intern"
              italic="are you looking for?"
              sub="Pick all that apply. We'll use this to surface the right candidates when you post a role."
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              <Field label="Role types you hire for" required>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {ROLE_CATEGORIES.map(cat => {
                    const selected = form.role_categories.includes(cat);
                    return (
                      <button key={cat} onClick={() => toggleCategory(cat)} style={{
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
                placeholder="e.g. We prefer candidates who've shipped side projects. Bonus if you know Supabase. We move fast and ship weekly."
                rows={3}
              />

              {/* Summary before submit */}
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>Profile summary</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Company', val: form.company_name },
                    { label: 'Stage',   val: STAGE_OPTIONS.find(s => s.value === form.stage)?.label },
                    { label: 'Team',    val: form.team_size },
                    { label: 'Hiring',  val: form.role_categories.join(', ') || '—' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', width: 60, flexShrink: 0 }}>{label}</span>
                      <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{val || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════ STEP 4 — SUCCESS ══════════════════ */}
        {currentStep === 4 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            {/* Animated checkmark */}
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ember-tint)', border: '2px solid var(--ember)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'popIn 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
              <Check size={28} color="var(--ember)" strokeWidth={2.5} />
            </div>

            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 12 }}>You're set up</p>

            <h2 style={{ fontFamily: "'Editorial New', Georgia, 'Times New Roman', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 16 }}>
              Welcome to HUNT,<br /><em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>{form.company_name}.</em>
            </h2>

            <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-mid)', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 40px' }}>
              Your recruiter profile is live. Now post your first internship — tell us what the role needs and we'll match the right candidates.
            </p>

            {/* What's next cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 36, textAlign: 'left' }}>
              {[
                { num: '01', title: 'Post an internship', desc: 'Set the role, required skills, stipend, and duration. Takes 3 minutes.', cta: true },
                { num: '02', title: 'We match candidates', desc: 'HUNT scores every student against your role spec. Only the best fit applies.' },
                { num: '03', title: 'Review your shortlist', desc: 'See top 6 ranked profiles with match breakdowns. Shortlist or pass in one click.' },
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

        {/* ── Error message ── */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', marginBottom: 16 }}>
            <X size={13} color="#c0392b" />
            <p style={{ fontSize: 12, color: '#c0392b', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Navigation buttons ── */}
        {currentStep < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
            <button
              onClick={handleBack} disabled={currentStep === 1}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 13, cursor: currentStep === 1 ? 'default' : 'pointer', fontFamily: 'inherit', opacity: currentStep === 1 ? 0.3 : 1, transition: 'all 0.15s' }}
              onMouseEnter={e => { if (currentStep > 1) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-mid)'; }}}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-mid)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <ArrowLeft size={14} /> Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--ember)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit} disabled={isSubmitting}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, border: 'none', background: isSubmitting ? 'var(--text-dim)' : 'var(--ember)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: isSubmitting ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {isSubmitting
                  ? <><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating profile…</>
                  : <><CheckCircle2 size={14} /> Complete setup</>
                }
              </button>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes popIn  { from { opacity:0; transform: scale(0.6); } to { opacity:1; transform: scale(1); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
