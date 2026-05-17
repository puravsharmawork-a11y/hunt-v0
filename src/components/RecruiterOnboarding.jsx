// src/components/RecruiterOnboarding.jsx
//
// CHANGES vs previous version:
//  - Step 1: Auto-fill import bar at top (website / LinkedIn / Instagram / Twitter)
//            fetches and pre-fills company name, pitch, about, location, logo
//  - Step 1: Social handles added (linkedin_url, instagram_handle, twitter_handle)
//  - Step 1: Website moved below import bar, not a separate step
//  - Step 2: Story — one-line pitch, about, why join (unchanged, refined copy)
//  - Step 3: Replaced "role categories" with one honest question:
//            "What does success look like for an intern after 3 months?"
//            + "Anything we should know about how you work?" (optional)
//  - Removed role_categories entirely from onboarding (belongs at job posting)
//  - Design: matches StudentOnboarding brutalist cream/ink/blue tokens exactly

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, ArrowLeft, Check, X, Plus,
  Building2, BookOpen, Star, Rocket,
  Sun, Moon, Loader, CheckCircle2, Camera, Upload,
  Globe, Linkedin, Instagram, Twitter, Sparkles, AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser, signOut } from '../services/supabase';

// ─── Design tokens — matches StudentOnboarding exactly ───────────────────────
const tokens = {
  light: {
    '--cream':      '#F2F0E8',
    '--cream-2':    '#E8E5DA',
    '--paper':      '#FAF8F0',
    '--ink':        '#14130E',
    '--ink-2':      '#3A362A',
    '--ink-3':      '#6E6955',
    '--ink-4':      '#A8A28C',
    '--line-mid':   '#14130E22',
    '--blue':       '#1A35E8',
    '--blue-tint':  '#E3E7FB',
    '--blue-deep':  '#0B1BA0',
    '--red':        '#B8281C',
    '--red-tint':   '#F7D9D4',
    '--amber':      '#B85C00',
    '--amber-tint': '#F7E7D2',
    '--bg':         '#F2F0E8',
    '--bg-card':    '#FAF8F0',
    '--bg-subtle':  '#E8E5DA',
    '--border':     '#0000001A',
    '--border-mid': '#00000033',
    '--text':       '#14130E',
    '--text-mid':   '#3A362A',
    '--text-dim':   '#6E6955',
    '--text-faint': '#A8A28C',
  },
  dark: {
    '--cream':      '#0E0E0C',
    '--cream-2':    '#16150F',
    '--paper':      '#16150F',
    '--ink':        '#F2F0E8',
    '--ink-2':      '#C9C5B4',
    '--ink-3':      '#8A8572',
    '--ink-4':      '#5A5646',
    '--line-mid':   '#F2F0E828',
    '--blue':       '#6B82F7',
    '--blue-tint':  '#1E2448',
    '--blue-deep':  '#C0CAFB',
    '--red':        '#E5726A',
    '--red-tint':   '#301814',
    '--amber':      '#E9B25A',
    '--amber-tint': '#2E2413',
    '--bg':         '#0E0E0C',
    '--bg-card':    '#16150F',
    '--bg-subtle':  '#1C1B15',
    '--border':     '#ffffff12',
    '--border-mid': '#ffffff22',
    '--text':       '#F2F0E8',
    '--text-mid':   '#C9C5B4',
    '--text-dim':   '#8A8572',
    '--text-faint': '#5A5646',
  },
};

let _globalsInjected = false;
function injectGlobals() {
  if (_globalsInjected || typeof document === 'undefined') return;
  const tag = document.createElement('style');
  tag.id = 'hunt-rec-globals';
  tag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap');

    .rec-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-feature-settings: 'zero' 1; }
    .rec-serif { font-family: 'Instrument Serif', Georgia, serif; }
    .rec-display { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; letter-spacing: -0.01em; line-height: 1.02; }
    .rec-kicker {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px; font-weight: 500;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--text-dim);
    }
    .rec-kicker-ink  { color: var(--text); }
    .rec-kicker-blue { color: var(--blue); }

    .rec-pixel-dot {
      display: inline-block; width: 6px; height: 6px;
      background: var(--blue); image-rendering: pixelated;
    }
    @keyframes rec-blink { 0%, 70% { opacity: 1; } 71%, 100% { opacity: 0.1; } }
    .rec-blink { animation: rec-blink 1.2s steps(2, end) infinite; }

    .rec-bitmap-bg {
      background-image:
        linear-gradient(to right, rgba(20,19,14,0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(20,19,14,0.04) 1px, transparent 1px);
      background-size: 28px 28px;
    }
    [data-theme="dark"] .rec-bitmap-bg {
      background-image:
        linear-gradient(to right, rgba(242,240,232,0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(242,240,232,0.04) 1px, transparent 1px);
    }

    .rec-card {
      background: var(--bg-card);
      border: 1px solid var(--border-mid);
      border-radius: 0;
      position: relative;
    }
    .rec-corner { position: relative; }
    .rec-corner::before, .rec-corner::after {
      content: ''; position: absolute; width: 6px; height: 6px;
      background: var(--ink); z-index: 2;
    }
    .rec-corner::before { top: -1px; left: -1px; }
    .rec-corner::after  { bottom: -1px; right: -1px; }
    .rec-corner > .rec-tr, .rec-corner > .rec-bl {
      position: absolute; width: 6px; height: 6px;
      background: var(--ink); z-index: 2;
    }
    .rec-corner > .rec-tr { top: -1px; right: -1px; }
    .rec-corner > .rec-bl { bottom: -1px; left: -1px; }

    .rec-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
      padding: 10px 16px; border: 1px solid var(--ink);
      background: transparent; color: var(--ink); border-radius: 0; cursor: pointer;
      transition: background 0.12s, color 0.12s, transform 0.08s, box-shadow 0.08s;
    }
    .rec-btn:hover:not(:disabled) { background: var(--ink); color: var(--cream); }
    .rec-btn-primary {
      background: var(--blue); color: #fff; border-color: var(--blue);
      box-shadow: 3px 3px 0 0 var(--ink);
    }
    .rec-btn-primary:hover:not(:disabled) {
      background: var(--blue-deep); transform: translate(-1px,-1px); box-shadow: 4px 4px 0 0 var(--ink);
    }
    .rec-btn-primary:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 1px 1px 0 0 var(--ink); }
    .rec-btn-dark { background: var(--ink); color: var(--cream); border-color: var(--ink); }
    .rec-btn-dark:hover:not(:disabled) { background: var(--ink-2); }
    .rec-btn-ghost { border-color: var(--border-mid); color: var(--text-mid); }
    .rec-btn-ghost:hover:not(:disabled) { background: var(--bg-subtle); color: var(--text); }
    .rec-btn-sm { padding: 6px 10px; font-size: 10.5px; }
    .rec-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .rec-input {
      font-family: 'Inter', sans-serif; font-size: 13px; padding: 10px 12px;
      border: 1px solid var(--border-mid); background: var(--bg-card);
      border-radius: 0; color: var(--text); width: 100%;
      box-sizing: border-box; outline: none; transition: border-color 0.12s;
    }
    .rec-input:focus { border-color: var(--ink); }
    select.rec-input {
      appearance: none;
      background-image:
        linear-gradient(45deg, transparent 50%, var(--text-dim) 50%),
        linear-gradient(135deg, var(--text-dim) 50%, transparent 50%);
      background-position: calc(100% - 14px) 50%, calc(100% - 10px) 50%;
      background-size: 4px 4px; background-repeat: no-repeat; padding-right: 28px;
    }

    .rec-hatch {
      background-image: linear-gradient(to right, var(--ink) 50%, transparent 50%);
      background-size: 6px 2px; background-repeat: repeat-x; opacity: 0.25;
    }

    @keyframes rec-spin { to { transform: rotate(360deg); } }
    .rec-spin { animation: rec-spin 0.9s linear infinite; }

    @keyframes rec-pop { from { opacity:0; transform: scale(0.6); } to { opacity:1; transform: scale(1); } }

    @keyframes rec-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    .rec-marquee-track {
      display: flex; gap: 36px; align-items: center;
      animation: rec-marquee 40s linear infinite; width: max-content;
    }
    .rec-marquee-track > span { display: flex; align-items: center; gap: 16px; }

    @media (max-width: 900px) {
      .rec-grid { grid-template-columns: 1fr !important; }
      .rec-grid aside { display: none !important; }
    }
    * { box-sizing: border-box; }
  `;
  document.head.appendChild(tag);
  _globalsInjected = true;
}

function applyTokens(theme) {
  injectGlobals();
  const root = document.documentElement;
  root.dataset.theme = theme;
  Object.entries(tokens[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
}

// ─── 5×5 Pixel HUNT mark ─────────────────────────────────────────────────────
const PixelMark = ({ size = 18, color = 'var(--blue)' }) => {
  const on = [1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,1, 1,0,0,0,1, 1,0,0,0,1];
  const px = Math.max(2, Math.floor(size / 6));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(5, ${px}px)`, gridAutoRows: `${px}px`, gap: 1 }}>
      {on.map((v, i) => <div key={i} style={{ background: v ? color : 'transparent' }} />)}
    </div>
  );
};

// ─── Supabase helpers ─────────────────────────────────────────────────────────
async function getRecruiterProfile() {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('recruiters').select('*').eq('auth_id', user.id).single();
  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

async function createRecruiterAndStartup(profileData) {
  const user = await getCurrentUser();

  const startupPayload = {
    name:           profileData.company_name,
    tagline:        profileData.tagline        || null,
    one_line_pitch: profileData.one_line_pitch  || null,
    about:          profileData.about           || null,
    why_join:       profileData.why_join        || null,
    website:        profileData.website         || null,
    linkedin_url:   profileData.linkedin_url    || null,
    instagram_handle: profileData.instagram_handle || null,
    twitter_handle: profileData.twitter_handle  || null,
    stage:          profileData.stage           || null,
    team_size:      profileData.team_size       || null,
    industry:       profileData.industry        || null,
    hq_location:    profileData.hq_location     || null,
    founded_year:   profileData.founded_year
      ? parseInt(profileData.founded_year, 10) || null : null,
    logo_url:       profileData.logo_url        || null,
    intern_success: profileData.intern_success  || null,
    hiring_note:    profileData.hiring_note     || null,
  };

  const { data: startup, error: startupErr } = await supabase
    .from('startups').insert([startupPayload]).select().single();
  if (startupErr) throw startupErr;

  const recruiterPayload = {
    auth_id:      user.id,
    email:        user.email,
    contact_name: profileData.contact_name,
    company_name: profileData.company_name,
    website:      profileData.website  || null,
    team_size:    profileData.team_size || null,
    stage:        profileData.stage    || null,
    startup_id:   startup.id,
  };

  const { data: recruiter, error: recruiterErr } = await supabase
    .from('recruiters').insert([recruiterPayload]).select().single();
  if (recruiterErr) throw recruiterErr;
  return recruiter;
}

async function uploadLogo(file) {
  const user = await getCurrentUser();
  const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `logos/${user.id}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from('student-files')
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (upErr) throw new Error(upErr.message || 'Logo upload failed');
  const { data: { publicUrl } } = supabase.storage.from('student-files').getPublicUrl(path);
  return publicUrl;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const TEAM_SIZES = ['Just me', '2–5', '6–15', '16–50', '50+'];

const STAGE_OPTIONS = [
  { value: 'idea',    label: 'Idea stage',     desc: 'Pre-product, still validating' },
  { value: 'mvp',     label: 'MVP / Beta',     desc: 'Product exists, early users' },
  { value: 'early',   label: 'Early traction', desc: 'Revenue or meaningful users' },
  { value: 'growth',  label: 'Growing',        desc: 'Scaling, Series A or beyond' },
  { value: 'company', label: 'Established',    desc: 'Stable company, 50+ team' },
];

const STEPS = [
  { num: 1, label: 'Company',  Icon: Building2 },
  { num: 2, label: 'Story',    Icon: BookOpen },
  { num: 3, label: 'Hiring',   Icon: Star },
];

// ─── Shared UI primitives ─────────────────────────────────────────────────────
function FieldLabel({ children, required, hint }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label className="rec-kicker rec-kicker-ink" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {children}
        {required && <span style={{ color: 'var(--blue)' }}>*</span>}
      </label>
      {hint && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

function SectionHead({ label, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 4 }}>
      <span className="rec-kicker rec-kicker-ink">{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--line-mid)' }} />
      {right}
    </div>
  );
}

function TextInput({ label, required, hint, value, onChange, placeholder, type = 'text', prefix }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <FieldLabel required={required} hint={hint}>{label}</FieldLabel>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 10, color: 'var(--text-dim)',
            display: 'flex', alignItems: 'center', pointerEvents: 'none',
          }}>{prefix}</span>
        )}
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="rec-input"
          style={{ borderColor: focused ? 'var(--ink)' : undefined, paddingLeft: prefix ? 32 : undefined }}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  );
}

function TextArea({ label, required, hint, value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <FieldLabel required={required} hint={hint}>{label}</FieldLabel>
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        className="rec-input"
        style={{ resize: 'none', borderColor: focused ? 'var(--ink)' : undefined }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </div>
  );
}

// ─── Auto-fill import bar ─────────────────────────────────────────────────────
function ImportBar({ onImport, isImporting }) {
  const [url, setUrl] = useState('');

  const handleImport = () => {
    if (!url.trim()) return;
    onImport(url.trim());
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleImport();
  };

  return (
    <div style={{
      padding: '12px 14px',
      border: '1px solid var(--border-mid)',
      background: 'var(--bg-subtle)',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span className="rec-pixel-dot rec-blink" />
        <span className="rec-kicker rec-kicker-ink">Auto-fill from your online presence</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10, lineHeight: 1.55 }}>
        Have a website or LinkedIn? Drop the link and we'll fill what we can.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="rec-input"
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={handleKey}
          placeholder="https://yoursite.com or linkedin.com/company/…"
          style={{ flex: 1 }}
        />
        <button
          onClick={handleImport}
          disabled={isImporting || !url.trim()}
          className="rec-btn rec-btn-dark"
        >
          {isImporting
            ? <><Loader size={13} className="rec-spin" /> Fetching…</>
            : <><Sparkles size={13} /> Fill</>}
        </button>
      </div>
      <p style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 8, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
        Works with: website · LinkedIn · Instagram · Twitter/X
      </p>
    </div>
  );
}

// ─── Logo Upload ──────────────────────────────────────────────────────────────
function LogoUpload({ preview, onChange }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Logo must be under 3 MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => onChange({ file, preview: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <FieldLabel hint="Optional. PNG or JPG, under 3 MB. Shown on your profile and job cards.">
        Company logo
      </FieldLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 64, height: 64, flexShrink: 0,
            border: `1.5px dashed ${preview ? 'var(--blue)' : 'var(--border-mid)'}`,
            background: 'var(--bg-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', cursor: 'pointer',
          }}
          onClick={() => ref.current?.click()}
        >
          {preview
            ? <img src={preview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Camera size={20} style={{ color: 'var(--text-dim)' }} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            type="button" onClick={() => ref.current?.click()}
            className="rec-btn rec-btn-ghost rec-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <Upload size={12} />
            {preview ? 'Replace logo' : 'Upload logo'}
          </button>
          {preview && (
            <button
              type="button" onClick={() => onChange(null)}
              style={{ fontSize: 11, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0, fontFamily: 'inherit' }}
            >
              <X size={11} /> Remove
            </button>
          )}
        </div>
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    </div>
  );
}

// ─── Step header ──────────────────────────────────────────────────────────────
function StepHeader({ stepNum, label, title, italic, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span className="rec-pixel-dot rec-blink" />
        <span className="rec-kicker rec-kicker-ink">0{stepNum} — {label}</span>
      </div>
      <h2 className="rec-display" style={{ fontSize: 'clamp(32px, 4vw, 44px)', lineHeight: 1.02, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 10 }}>
        {title}<br />
        <em style={{ fontStyle: 'italic', color: 'var(--blue)' }}>{italic}</em>
      </h2>
      {sub && <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--text-mid)', lineHeight: 1.65, maxWidth: 440 }}>{sub}</p>}
    </div>
  );
}

// ─── Progress stepper ─────────────────────────────────────────────────────────
function StepProgress({ currentStep, steps }) {
  const pct = ((currentStep - 1) / (steps.length - 1)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="rec-kicker rec-kicker-ink">
          Step {String(currentStep).padStart(2, '0')} · {steps[currentStep - 1]?.label}
        </span>
        <span className="rec-kicker rec-mono">
          {String(currentStep).padStart(2, '0')} <span style={{ opacity: 0.4 }}>/</span> {String(steps.length).padStart(2, '0')}
        </span>
      </div>
      <div style={{ position: 'relative', height: 14 }}>
        <div className="rec-hatch" style={{ position: 'absolute', top: 6, left: 0, right: 0, height: 2 }} />
        <div style={{ position: 'absolute', top: 6, left: 0, height: 2, width: `${pct}%`, background: 'var(--blue)', transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
        {steps.map(s => {
          const tickPct = ((s.num - 1) / (steps.length - 1)) * 100;
          const done   = currentStep > s.num;
          const active = currentStep === s.num;
          return (
            <div key={s.num} style={{
              position: 'absolute', top: '50%', left: `${tickPct}%`,
              transform: 'translate(-50%,-50%)',
              width: active ? 14 : 10, height: active ? 14 : 10,
              background: active ? 'var(--blue)' : done ? 'var(--ink)' : 'var(--bg-card)',
              border: '1.5px solid var(--ink)',
              zIndex: 2, imageRendering: 'pixelated',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {done && <Check size={6} color="var(--cream)" strokeWidth={3} />}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        {steps.map(s => {
          const done = currentStep > s.num, active = currentStep === s.num;
          return (
            <span key={s.num} className="rec-kicker" style={{ color: active ? 'var(--ink)' : done ? 'var(--text-mid)' : 'var(--text-faint)', fontWeight: active ? 600 : 400, fontSize: 9.5 }}>
              {String(s.num).padStart(2, '0')}·{s.label.toUpperCase()}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Side preview panel ───────────────────────────────────────────────────────
function SidePanel({ form, logoData, currentStep }) {
  const checklist = [
    { label: 'Company name', done: !!form.company_name },
    { label: 'Your name',    done: !!form.contact_name },
    { label: 'Stage',        done: !!form.stage },
    { label: 'Team size',    done: !!form.team_size },
    { label: 'About',        done: !!form.about },
    { label: 'Why join',     done: !!form.why_join },
    { label: 'Success goal', done: !!form.intern_success },
    { label: 'Logo',         done: !!logoData?.preview },
  ];

  const completeness = Math.round((checklist.filter(c => c.done).length / checklist.length) * 100);

  return (
    <aside style={{ position: 'sticky', top: 140, alignSelf: 'flex-start', display: 'grid', gap: 18 }}>
      {/* Signal strength */}
      <div className="rec-card rec-corner" style={{ padding: 16 }}>
        <span className="rec-tr" /><span className="rec-bl" />
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="rec-kicker rec-kicker-ink">Profile Strength</span>
          <span className="rec-display" style={{ fontSize: 24, color: 'var(--blue)', lineHeight: 1 }}>
            {completeness}<span style={{ fontSize: 11, color: 'var(--text-dim)' }}>%</span>
          </span>
        </div>
        <div style={{ height: 4, background: 'var(--border-mid)', marginBottom: 14, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, width: `${completeness}%`, background: 'var(--blue)', transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {checklist.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: c.done ? 'var(--text)' : 'var(--text-dim)' }}>
              <span style={{ width: 12, height: 12, border: '1px solid var(--border-mid)', background: c.done ? 'var(--blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {c.done && <Check size={8} color="#fff" strokeWidth={3} />}
              </span>
              <span style={{ flex: 1 }}>{c.label}</span>
              {c.done && <span className="rec-mono" style={{ fontSize: 9, color: 'var(--blue)' }}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Live preview card — how students see you */}
      <div className="rec-card rec-corner" style={{ padding: 16 }}>
        <span className="rec-tr" /><span className="rec-bl" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 6, height: 6, background: 'var(--ink)', display: 'inline-block' }} />
          <span className="rec-kicker rec-kicker-ink">Student View</span>
        </div>
        <div style={{ padding: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, background: 'var(--bg-card)', border: '1px solid var(--border-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {logoData?.preview
                ? <img src={logoData.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)' }}>{(form.company_name || '?').slice(0, 2).toUpperCase()}</span>}
            </div>
            <div>
              <div className="rec-display" style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.1 }}>{form.company_name || 'Your Company'}</div>
              <div className="rec-mono" style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                {STAGE_OPTIONS.find(s => s.value === form.stage)?.label || '—'} · {form.team_size || '—'}
              </div>
            </div>
          </div>
          {form.tagline && (
            <p style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 500, marginBottom: 4 }}>{form.tagline}</p>
          )}
          {form.one_line_pitch && (
            <p style={{ fontSize: 11, color: 'var(--text-mid)', lineHeight: 1.5, marginBottom: 6 }}>
              {form.one_line_pitch.slice(0, 80)}{form.one_line_pitch.length > 80 ? '…' : ''}
            </p>
          )}
          <div className="rec-mono" style={{ fontSize: 9.5, color: 'var(--text-dim)', display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px dashed var(--border-mid)', flexWrap: 'wrap' }}>
            {form.hq_location && <span>📍 {form.hq_location}</span>}
            {form.website && <span>🌐 website</span>}
            {form.linkedin_url && <span>in LinkedIn</span>}
            {form.instagram_handle && <span>ig @{form.instagram_handle}</span>}
            {form.twitter_handle && <span>𝕏 @{form.twitter_handle}</span>}
          </div>
        </div>
      </div>

      <div className="rec-mono" style={{ padding: '10px 0', fontSize: 10.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Step</span><span>{String(currentStep).padStart(2,'0')}/{String(STEPS.length).padStart(2,'0')}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Saved</span><span>Auto</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Secure</span><span style={{ color: 'var(--blue)' }}>● TLS 1.3</span></div>
      </div>
    </aside>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RecruiterOnboarding() {
  const navigate = useNavigate();
  const [theme, setTheme]   = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [approved, setApproved] = useState(null);
  const [error, setError]   = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [logoData, setLogoData]   = useState(null);

  const [form, setForm] = useState({
    // Step 1 — Company basics
    company_name:      '',
    contact_name:      '',
    website:           '',
    linkedin_url:      '',
    instagram_handle:  '',
    twitter_handle:    '',
    industry:          '',
    hq_location:       '',
    founded_year:      '',
    team_size:         '',
    stage:             '',
    // Step 2 — Story
    tagline:           '',
    one_line_pitch:    '',
    about:             '',
    why_join:          '',
    // Step 3 — Hiring signal
    intern_success:    '',
    hiring_note:       '',
  });

  useEffect(() => { applyTokens(theme); localStorage.setItem('hunt-theme', theme); }, [theme]);

  useEffect(() => {
    (async () => {
      try {
        const existing = await getRecruiterProfile();
        if (existing) { navigate('/recruiter/dashboard'); return; }
        const user = await getCurrentUser();
        const { data } = await supabase
          .from('recruiter_waitlist').select('approved').eq('email', user.email).single();
        setApproved(!data || !data.approved ? false : true);
      } catch {
        setApproved(false);
      } finally {
        setCheckingExisting(false);
      }
    })();
  }, []);

  const set = (field) => (value) => setForm(f => ({ ...f, [field]: value }));

  // ─── Auto-fill import ─────────────────────────────────────────────────────
  // Real implementation: call your backend / scraping service with the URL.
  // For now: simulates a fetch and shows what fields would be populated.
  const handleImport = async (url) => {
    setIsImporting(true);
    setImportMsg('');
    try {
      // ── REAL IMPLEMENTATION PLACEHOLDER ──────────────────────────────────
      // Replace the block below with an actual call to your scraping backend:
      //
      // const res = await fetch('/api/scrape-company', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url }),
      // });
      // const scraped = await res.json();
      //
      // Then map scraped fields → form fields below.
      // ─────────────────────────────────────────────────────────────────────

      // Simulated 1.5s delay
      await new Promise(r => setTimeout(r, 1500));

      // Detect platform from URL and show message
      const isLinkedIn  = url.includes('linkedin');
      const isInstagram = url.includes('instagram');
      const isTwitter   = url.includes('twitter') || url.includes('x.com');

      // In a real implementation, scraped data would fill these fields.
      // For now just pre-fill the relevant URL field if not already set.
      if (isLinkedIn && !form.linkedin_url) {
        setForm(f => ({ ...f, linkedin_url: url }));
        setImportMsg('LinkedIn URL saved. Connect your scraping service to auto-fill company name, about, and location.');
      } else if (isInstagram && !form.instagram_handle) {
        const handle = url.split('/').filter(Boolean).pop() || '';
        setForm(f => ({ ...f, instagram_handle: handle }));
        setImportMsg(`Instagram handle @${handle} saved.`);
      } else if (isTwitter) {
        const handle = url.split('/').filter(Boolean).pop() || '';
        setForm(f => ({ ...f, twitter_handle: handle }));
        setImportMsg(`Twitter/X handle @${handle} saved.`);
      } else {
        // Assume it's a website
        if (!form.website) setForm(f => ({ ...f, website: url }));
        setImportMsg('Website saved. Connect your scraping service (e.g. Microlink or your own backend) to auto-fill name, description, and logo.');
      }
    } catch (e) {
      setImportMsg('Could not fetch data. You can fill in manually below.');
    } finally {
      setIsImporting(false);
    }
  };

  // ─── Validation ──────────────────────────────────────────────────────────
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
      if (!form.intern_success.trim()) return 'Please describe what success looks like for an intern.';
    }
    return '';
  };

  const handleNext = () => {
    const err = validate(currentStep);
    if (err) { setError(err); return; }
    setError('');
    setCurrentStep(s => s + 1);
  };

  const handleBack = () => { setError(''); setCurrentStep(s => s - 1); };

  const handleSubmit = async () => {
    const err = validate(3);
    if (err) { setError(err); return; }
    setIsSubmitting(true);
    setError('');
    try {
      let logo_url = null;
      if (logoData?.file) {
        try { logo_url = await uploadLogo(logoData.file); }
        catch (uploadErr) { console.warn('Logo upload failed (non-fatal):', uploadErr.message); }
      }
      await createRecruiterAndStartup({
        company_name:     form.company_name.trim(),
        contact_name:     form.contact_name.trim(),
        website:          form.website.trim()           || null,
        linkedin_url:     form.linkedin_url.trim()      || null,
        instagram_handle: form.instagram_handle.trim()  || null,
        twitter_handle:   form.twitter_handle.trim()    || null,
        industry:         form.industry.trim()          || null,
        hq_location:      form.hq_location.trim()       || null,
        founded_year:     form.founded_year.trim()      || null,
        team_size:        form.team_size,
        stage:            form.stage,
        tagline:          form.tagline.trim()           || null,
        one_line_pitch:   form.one_line_pitch.trim()    || null,
        about:            form.about.trim(),
        why_join:         form.why_join.trim()          || null,
        intern_success:   form.intern_success.trim(),
        hiring_note:      form.hiring_note.trim()       || null,
        logo_url,
      });
      setCurrentStep(4);
    } catch (e) {
      setError('Something went wrong: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Loading / waitlist ───────────────────────────────────────────────────
  if (checkingExisting) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <Loader size={20} style={{ color: 'var(--blue)', animation: 'rec-spin 0.8s linear infinite' }} />
    </div>
  );

  if (approved === false) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 400, textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 32, marginBottom: 20 }}>🕐</div>
        <h2 className="rec-display" style={{ fontSize: 32, color: 'var(--text)', marginBottom: 12 }}>
          You're on the<br /><em style={{ fontStyle: 'italic', color: 'var(--blue)' }}>waitlist.</em>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 24 }}>
          We review recruiter accounts manually to keep quality high. We'll email you when approved.
        </p>
        <button
          onClick={async () => { try { await signOut(); navigate('/'); } catch {} }}
          className="rec-btn rec-btn-ghost"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  // ─── Success screen ───────────────────────────────────────────────────────
  if (currentStep === 4) return (
    <div className="rec-bitmap-bg" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div className="rec-card rec-corner" style={{ padding: '56px 48px', maxWidth: 560, width: '100%', textAlign: 'center' }}>
        <span className="rec-tr" /><span className="rec-bl" />
        <div style={{ width: 64, height: 64, background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'rec-pop 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
          <Check size={28} strokeWidth={2.5} />
        </div>
        <p className="rec-kicker rec-kicker-ink" style={{ marginBottom: 14, fontSize: 11 }}>Profile — Complete</p>
        <h1 className="rec-display" style={{ fontSize: 'clamp(32px,4vw,48px)', lineHeight: 1.02, marginBottom: 14 }}>
          Welcome to HUNT,<br /><em style={{ fontStyle: 'italic', color: 'var(--blue)' }}>{form.company_name}.</em>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 40px' }}>
          Your company profile is live. Post your first internship and we'll match the right candidates to it.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 36, textAlign: 'left' }}>
          {[
            { num: '01', title: 'Post an internship', desc: 'Set the role, required skills, stipend, and duration. Takes 3 minutes.' },
            { num: '02', title: 'We match candidates', desc: 'HUNT scores every student against your role spec. Only the best fit applies.' },
            { num: '03', title: 'Review your shortlist', desc: 'See top ranked profiles with match breakdowns. Shortlist or pass in one click.' },
          ].map(item => (
            <div key={item.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', border: '1px solid var(--border-mid)', background: 'var(--bg-subtle)' }}>
              <span className="rec-mono" style={{ fontSize: 11, color: 'var(--blue)', flexShrink: 0, marginTop: 1 }}>{item.num}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{item.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/recruiter/dashboard')} className="rec-btn rec-btn-primary">
          Go to dashboard <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  // ─── Main onboarding UI ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: '1px solid var(--border-mid)', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PixelMark size={18} />
          <span className="rec-kicker rec-kicker-ink" style={{ fontSize: 11, letterSpacing: '0.18em' }}>HUNT</span>
          <span style={{ height: 16, width: 1, background: 'var(--border-mid)' }} />
          <span className="rec-kicker">Recruiter Setup</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="rec-kicker" style={{ fontSize: 9.5 }}>v1.0 · beta</span>
          <button
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            className="rec-btn rec-btn-ghost rec-btn-sm"
            style={{ width: 32, height: 32, padding: 0 }}
          >
            {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          </button>
        </div>
      </nav>

      {/* Progress bar */}
      <div style={{ position: 'sticky', top: 57, zIndex: 40, background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '14px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <StepProgress currentStep={currentStep} steps={STEPS} />
        </div>
      </div>

      {/* Marquee */}
      <div style={{ borderBottom: '1px solid var(--border-mid)', background: 'var(--ink)', color: 'var(--cream)', padding: '8px 0', overflow: 'hidden' }}>
        <div className="rec-marquee-track rec-mono" style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          {Array(6).fill(0).map((_, i) => (
            <span key={i}>
              <span>Setting up your company</span>
              <span style={{ color: 'var(--blue)' }}>●</span>
              <span>Skill-first hiring</span>
              <span style={{ color: 'var(--blue)' }}>●</span>
              <span>No spam. No filtering.</span>
              <span style={{ color: 'var(--blue)' }}>●</span>
              <span>Know who can build before the first call</span>
              <span style={{ color: 'var(--blue)' }}>●</span>
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="rec-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 32 }}>

        <div>
          <div className="rec-card rec-corner" style={{ padding: '36px 40px' }}>
            <span className="rec-tr" /><span className="rec-bl" />

            {/* ═══════════════════ STEP 1 — Company ═══════════════════════ */}
            {currentStep === 1 && (
              <div>
                <StepHeader
                  stepNum={1} label="Company"
                  title="Tell us about"
                  italic="your company."
                  sub="Students see this on your profile and job cards. Drop a link to auto-fill, or fill in manually."
                />

                {/* Auto-fill import bar — at top of step 1 */}
                <ImportBar onImport={handleImport} isImporting={isImporting} />

                {importMsg && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', border: '1px solid var(--border-mid)', background: 'var(--bg-subtle)', marginBottom: 20 }}>
                    <CheckCircle2 size={14} style={{ color: 'var(--blue)', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.5 }}>{importMsg}</p>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                  {/* Logo */}
                  <LogoUpload preview={logoData?.preview || null} onChange={setLogoData} />

                  {/* Name + contact */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <TextInput label="Company / startup name" required value={form.company_name} onChange={set('company_name')} placeholder="TechFlow AI" />
                    <TextInput label="Your name" required value={form.contact_name} onChange={set('contact_name')} placeholder="Rahul Mehta" />
                  </div>

                  {/* Location + Industry */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <TextInput label="HQ Location" value={form.hq_location} onChange={set('hq_location')} placeholder="Bangalore, India" />
                    <TextInput label="Industry" value={form.industry} onChange={set('industry')} placeholder="HR Tech / SaaS / Fintech" />
                  </div>

                  {/* Team size */}
                  <div>
                    <FieldLabel required>Team size</FieldLabel>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {TEAM_SIZES.map(size => (
                        <button key={size} type="button" onClick={() => set('team_size')(size)} className="rec-btn rec-btn-sm" style={{
                          background: form.team_size === size ? 'var(--blue-tint)' : 'transparent',
                          borderColor: form.team_size === size ? 'var(--blue)' : 'var(--border-mid)',
                          color: form.team_size === size ? 'var(--blue-deep)' : 'var(--text-mid)',
                          fontWeight: form.team_size === size ? 600 : 400,
                        }}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stage */}
                  <div>
                    <FieldLabel required>Company stage</FieldLabel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {STAGE_OPTIONS.map(stage => (
                        <button key={stage.value} type="button" onClick={() => set('stage')(stage.value)} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left',
                          background: form.stage === stage.value ? 'var(--blue-tint)' : 'var(--bg-subtle)',
                          border: `1px solid ${form.stage === stage.value ? 'var(--blue)' : 'var(--border-mid)'}`,
                          transition: 'all 0.12s',
                        }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: form.stage === stage.value ? 'var(--blue-deep)' : 'var(--text)', margin: 0 }}>{stage.label}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '2px 0 0' }}>{stage.desc}</p>
                          </div>
                          {form.stage === stage.value && (
                            <div style={{ width: 18, height: 18, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Check size={10} color="#fff" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Online presence */}
                  <SectionHead label="Online presence" right={<span className="rec-kicker" style={{ fontSize: 9.5 }}>optional — students check these</span>} />

                  <TextInput
                    label="Website"
                    value={form.website} onChange={set('website')}
                    placeholder="https://yoursite.com" type="url"
                    prefix={<Globe size={13} />}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <TextInput
                      label="LinkedIn company page"
                      value={form.linkedin_url} onChange={set('linkedin_url')}
                      placeholder="linkedin.com/company/…" type="url"
                      prefix={<Linkedin size={13} style={{ color: '#0A66C2' }} />}
                    />
                    <TextInput
                      label="Founded year"
                      value={form.founded_year} onChange={set('founded_year')}
                      placeholder="2024" type="number"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <TextInput
                      label="Instagram handle"
                      value={form.instagram_handle} onChange={set('instagram_handle')}
                      placeholder="yourstartup"
                      prefix={<Instagram size={13} style={{ color: '#E1306C' }} />}
                      hint="Without the @"
                    />
                    <TextInput
                      label="Twitter / X handle"
                      value={form.twitter_handle} onChange={set('twitter_handle')}
                      placeholder="yourstartup"
                      prefix={<Twitter size={13} style={{ color: '#1DA1F2' }} />}
                      hint="Without the @"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* ═══════════════════ STEP 2 — Story ═════════════════════════ */}
            {currentStep === 2 && (
              <div>
                <StepHeader
                  stepNum={2} label="Story"
                  title="What's your"
                  italic="company story?"
                  sub="Students read this before they swipe right. Be real — a few honest paragraphs beats a job description every time."
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

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
                    hint="Shown under your company name on job cards."
                  />

                  <TextArea
                    label="About the company" required
                    value={form.about} onChange={set('about')}
                    placeholder="What do you build, who do you serve, what problem are you solving? Be real — a paragraph or two is perfect."
                    rows={5}
                    hint="Fills your 'About' section on your profile."
                  />

                  <TextArea
                    label="Why join us?"
                    value={form.why_join} onChange={set('why_join')}
                    placeholder="What will someone working here actually learn and experience? Talk about ownership, the team, the pace."
                    rows={4}
                    hint="This is what makes a good student choose you over the next card."
                  />

                  {/* Live preview */}
                  {(form.about || form.tagline || form.company_name) && (
                    <div style={{ padding: 16, border: '1px solid var(--border-mid)', background: 'var(--bg-subtle)' }}>
                      <p className="rec-kicker rec-kicker-blue" style={{ marginBottom: 10 }}>Preview — how students see you</p>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ width: 44, height: 44, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {logoData?.preview
                            ? <img src={logoData.preview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-mid)' }}>{(form.company_name || '?').slice(0, 2).toUpperCase()}</span>}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{form.company_name || 'Your Company'}</p>
                          <p className="rec-mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            {STAGE_OPTIONS.find(s => s.value === form.stage)?.label || '—'} · {form.team_size || '—'} · {form.hq_location || '—'}
                          </p>
                          {form.tagline && <p style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 500, marginBottom: 4 }}>{form.tagline}</p>}
                          <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.55 }}>
                            {form.about ? form.about.slice(0, 160) + (form.about.length > 160 ? '…' : '') : '…'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════ STEP 3 — Hiring signal ══════════════════ */}
            {currentStep === 3 && (
              <div>
                <StepHeader
                  stepNum={3} label="Hiring"
                  title="What does"
                  italic="success look like?"
                  sub="One honest question. This forces clarity — and it's the first thing a great candidate reads before they decide to apply."
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* The one question */}
                  <div style={{ padding: '16px', border: '1px solid var(--blue)', background: 'var(--blue-tint)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ width: 5, height: 5, background: 'var(--blue)' }} />
                      <span className="rec-kicker rec-kicker-blue">The most important question</span>
                    </div>
                    <TextArea
                      label="What does success look like for an intern at your company after 3 months?" required
                      value={form.intern_success} onChange={set('intern_success')}
                      placeholder="e.g. They've shipped at least one feature to production, reviewed and fixed 3+ bugs independently, and can explain the system architecture to a new joiner."
                      rows={5}
                      hint="Be specific. 'Has made a real contribution' doesn't help anyone. What will they have built, fixed, or shipped?"
                    />
                  </div>

                  {/* Optional culture note */}
                  <TextArea
                    label="Anything else about how you work? (optional)"
                    value={form.hiring_note} onChange={set('hiring_note')}
                    placeholder="e.g. We ship every Friday. Everyone codes, including the founders. We do async-first with 2 standups a week. Interns get real ownership from day one."
                    rows={3}
                    hint="What a candidate won't know from your website. Culture, pace, how decisions get made."
                  />

                  {/* Profile summary before submit */}
                  <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-mid)', padding: 16 }}>
                    <p className="rec-kicker rec-kicker-ink" style={{ marginBottom: 12 }}>Profile summary</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Company',  val: form.company_name },
                        { label: 'Industry', val: form.industry },
                        { label: 'Location', val: form.hq_location },
                        { label: 'Stage',    val: STAGE_OPTIONS.find(s => s.value === form.stage)?.label },
                        { label: 'Team',     val: form.team_size },
                        { label: 'Website',  val: form.website },
                        { label: 'LinkedIn', val: form.linkedin_url ? 'Added' : null },
                        { label: 'Instagram',val: form.instagram_handle ? `@${form.instagram_handle}` : null },
                        { label: 'Twitter',  val: form.twitter_handle ? `@${form.twitter_handle}` : null },
                      ].map(({ label, val }) => (
                        <div key={label} style={{ display: 'flex', gap: 12 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-dim)', width: 72, flexShrink: 0 }}>{label}</span>
                          <span style={{ fontSize: 12, color: val ? 'var(--text)' : 'var(--text-faint)', fontWeight: val ? 500 : 400, fontStyle: val ? 'normal' : 'italic' }}>
                            {val || 'not set'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1px solid var(--red)', background: 'var(--red-tint)', marginTop: 12 }}>
              <AlertCircle size={13} style={{ color: 'var(--red)', flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: 'var(--red)', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
            <button onClick={handleBack} disabled={currentStep === 1} className="rec-btn rec-btn-ghost">
              <ArrowLeft size={13} /> Back
            </button>
            <span className="rec-kicker rec-mono" style={{ fontSize: 10 }}>
              {String(currentStep).padStart(2,'0')} / {String(STEPS.length).padStart(2,'0')} — {STEPS[currentStep - 1]?.label}
            </span>
            {currentStep < STEPS.length ? (
              <button onClick={handleNext} className="rec-btn rec-btn-primary">
                Continue <ArrowRight size={13} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} className="rec-btn rec-btn-primary">
                {isSubmitting
                  ? <><Loader size={13} className="rec-spin" /> Creating…</>
                  : <><CheckCircle2 size={13} /> Complete setup</>}
              </button>
            )}
          </div>
        </div>

        {/* Side panel */}
        <SidePanel form={form} logoData={logoData} currentStep={currentStep} />

      </div>
    </div>
  );
}
