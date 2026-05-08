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
import { Avatar, HuntScoreBadge, linkChip, iconBtn } from '../shared/ui';

export function getSkillLogoForRecruiter(skillName) {
  const name = (skillName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const deviconMap = {
    javascript: 'devicon-javascript-plain colored',
    typescript: 'devicon-typescript-plain colored',
    python: 'devicon-python-plain colored',
    java: 'devicon-java-plain colored',
    react: 'devicon-react-original colored',
    nextjs: 'devicon-nextjs-plain',
    nodejs: 'devicon-nodejs-plain colored',
    expressjs: 'devicon-express-original',
    django: 'devicon-django-plain colored',
    fastapi: 'devicon-fastapi-plain colored',
    flask: 'devicon-flask-original',
    postgresql: 'devicon-postgresql-plain colored',
    mongodb: 'devicon-mongodb-plain colored',
    mysql: 'devicon-mysql-plain colored',
    redis: 'devicon-redis-plain colored',
    firebase: 'devicon-firebase-plain colored',
    docker: 'devicon-docker-plain colored',
    aws: 'devicon-amazonwebservices-original colored',
    git: 'devicon-git-plain colored',
    github: 'devicon-github-original',
    figma: 'devicon-figma-plain colored',
    flutter: 'devicon-flutter-plain colored',
    reactnative: 'devicon-react-original colored',
    tensorflow: 'devicon-tensorflow-original colored',
    pytorch: 'devicon-pytorch-original colored',
    pandas: 'devicon-pandas-original colored',
    linux: 'devicon-linux-plain',
    golang: 'devicon-go-plain colored',
    cc: 'devicon-cplusplus-plain colored',
    sql: 'devicon-azuresqldatabase-plain colored',
    graphql: 'devicon-graphql-plain colored',
    kubernetes: 'devicon-kubernetes-plain colored',
    tailwind: 'devicon-tailwindcss-plain colored',
    vuejs: 'devicon-vuejs-plain colored',
    angular: 'devicon-angularjs-plain colored',
    kotlin: 'devicon-kotlin-plain colored',
    swift: 'devicon-swift-plain colored',
    ruby: 'devicon-ruby-plain colored',
    rust: 'devicon-rust-plain',
    php: 'devicon-php-plain colored',
    dart: 'devicon-dart-plain colored',
    csharp: 'devicon-csharp-plain colored',
  };

  // Emoji fallbacks for skills without devicons
  const emojiMap = {
    'machine learning': '🤖', 'rest api': '🔌', 'rest apis': '🔌',
    'cicd': '⚙️', 'ci/cd': '⚙️', 'devops': '⚙️',
  };

  const deviconClass = deviconMap[name];
  if (deviconClass) {
    return (
      <i
        className={deviconClass}
        style={{ fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', flexShrink: 0 }}
      />
    );
  }

  const lowerSkill = (skillName || '').toLowerCase();
  const emoji = emojiMap[lowerSkill];
  if (emoji) {
    return <span style={{ fontSize: 12, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>;
  }

  // Generic code icon fallback
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 4px', lineHeight: 1, flexShrink: 0 }}>
      {(skillName || '?').slice(0, 2).toUpperCase()}
    </span>
  );
}

// Coding platform configs
const CODING_PLATFORMS = {
  leetcode:    { label: 'LeetCode',    url: (u) => `https://leetcode.com/${u}`,          color: '#FFA116', logo: 'https://assets.leetcode.com/static_assets/public/icons/favicon-192x192.png' },
  codeforces:  { label: 'Codeforces',  url: (u) => `https://codeforces.com/profile/${u}`, color: '#1F8ACB', logo: 'https://codeforces.org/s/0/favicon-32x32.png' },
  codechef:    { label: 'CodeChef',    url: (u) => `https://codechef.com/users/${u}`,     color: '#5B4638', logo: 'https://cdn.codechef.com/images/cc-logo.svg' },
  hackerrank:  { label: 'HackerRank',  url: (u) => `https://hackerrank.com/${u}`,         color: '#2EC866', logo: 'https://hrcdn.net/fcore/assets/favicon-ddc852f75a.png' },
  hackerearth: { label: 'HackerEarth', url: (u) => `https://hackerearth.com/@${u}`,       color: '#323754', logo: 'https://static-fastly.hackerearth.com/static/hackathon/images/favicon.png' },
  kaggle:      { label: 'Kaggle',      url: (u) => `https://kaggle.com/${u}`,             color: '#20BEFF', logo: 'https://www.kaggle.com/static/images/favicon.ico' },
  geeksforgeeks: { label: 'GeeksforGeeks', url: (u) => `https://auth.geeksforgeeks.org/user/${u}`, color: '#2F8D46', logo: 'https://media.geeksforgeeks.org/gfg-gg-logo.svg' },
};

// Star rating display
export function StarRating({ rating, max = 5, size = 12 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          style={{
            color: i < Math.floor(rating) ? 'var(--amber)' : i < rating ? 'var(--amber)' : 'var(--border-mid)',
            fill: i < rating ? 'var(--amber)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

export function CandidateProfileDrawer({ student, open, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Inject devicon CSS if not already present
  useEffect(() => {
    const id = 'devicon-css';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/devicon.min.css';
      document.head.appendChild(link);
    }
  }, []);

  // Early return AFTER all hooks
  if (!student) return null;
  const s = student;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'resume',   label: 'Resume' },
    { id: 'skills',   label: 'Skills' },
    { id: 'journey',  label: 'Journey' },
    { id: 'myhunt',   label: 'My Hunt' },
    { id: 'reviews',  label: 'Reviews' },
  ];
  const initials = (s.full_name || '').split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
  const ci = s.contact_info || {};

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9100, backdropFilter: 'blur(2px)' }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 600,
        background: 'var(--bg)', borderLeft: '1px solid var(--border)',
        zIndex: 9101, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '-12px 0 48px rgba(0,0,0,0.15)' : 'none',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ flexShrink: 0, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          {/* Banner + avatar overlap container */}
          <div style={{ position: 'relative' }}>
            {/* Banner strip */}
            <div style={{ height: 110, overflow: 'hidden', position: 'relative', background: 'linear-gradient(120deg, var(--bg-subtle) 0%, var(--border-mid) 100%)' }}>
              {s.banner_url && s.banner_url.startsWith('http') && (
                <img src={s.banner_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
              )}
              {/* Close button over banner */}
              <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 10, width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <X size={12} />
              </button>
            </div>

            {/* Avatar — absolutely positioned to straddle banner bottom */}
            <div style={{ position: 'absolute', bottom: -28, left: 18 }}>
              {s.avatar_url ? (
                <img src={s.avatar_url} alt={s.full_name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--bg-card)', display: 'block' }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-subtle)', border: '3px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'var(--text-mid)' }}>{initials}</div>
              )}
            </div>
          </div>

          {/* Name row — padded to clear the avatar */}
          <div style={{ padding: '36px 20px 12px 86px' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0, lineHeight: 1.3 }}>{s.full_name || 'Student'}</p>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '2px 0 0' }}>{s.college || '—'}{s.year ? ` · Year ${s.year}` : ''}</p>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', overflowX: 'auto', borderTop: '1px solid var(--border)', padding: '0 20px', scrollbarWidth: 'none' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: activeTab === t.id ? 600 : 400,
                color: activeTab === t.id ? 'var(--text)' : 'var(--text-dim)',
                borderBottom: activeTab === t.id ? '2px solid var(--text)' : '2px solid transparent',
                marginBottom: -1, whiteSpace: 'nowrap', fontFamily: 'inherit',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {s.bio && (
                <div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Bio</p>
                  <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6 }}>{s.bio}</p>
                </div>
              )}

              {/* Links */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {s.github_url    && <a href={s.github_url}    target="_blank" rel="noopener noreferrer" style={linkChip}><Github size={11} /> GitHub</a>}
                {s.linkedin_url  && <a href={s.linkedin_url}  target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> LinkedIn</a>}
                {s.portfolio_url && <a href={s.portfolio_url} target="_blank" rel="noopener noreferrer" style={linkChip}><ExternalLink size={11} /> Portfolio</a>}
                {s.resume_url    && <a href={s.resume_url}    target="_blank" rel="noopener noreferrer" style={{ ...linkChip, color: 'var(--text)', borderColor: 'var(--text)' }}>📄 Resume</a>}
              </div>

              {/* Basic Info */}
              <div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Info</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'College',         val: s.college },
                    { label: 'Year',            val: s.year ? `Year ${s.year}` : null },
                    { label: 'Availability',    val: s.availability },
                    { label: 'Work Preference', val: s.work_preference },
                  ].map(({ label, val }) => val ? (
                    <div key={label}>
                      <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 12, color: 'var(--text)', margin: 0 }}>{val}</p>
                    </div>
                  ) : null)}
                </div>
              </div>

              {/* Contact Info — NEW */}
              {(ci.public_email || ci.whatsapp || ci.telegram || ci.twitter || ci.calendly || s.phone) && (
                <div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Contact</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { key: 'public_email', label: 'Email',     icon: '📧', val: ci.public_email || s.email, href: ci.public_email ? `mailto:${ci.public_email}` : null },
                      { key: 'phone',        label: 'Phone',     icon: '📱', val: s.phone, href: s.phone ? `tel:${s.phone}` : null },
                      { key: 'whatsapp',     label: 'WhatsApp',  icon: '💬', val: ci.whatsapp, href: ci.whatsapp ? `https://wa.me/${ci.whatsapp.replace(/\D/g, '')}` : null },
                      { key: 'telegram',     label: 'Telegram',  icon: '✈️', val: ci.telegram, href: ci.telegram ? `https://t.me/${ci.telegram.replace('@', '')}` : null },
                      { key: 'twitter',      label: 'X/Twitter', icon: '🐦', val: ci.twitter, href: ci.twitter ? `https://x.com/${ci.twitter.replace('@', '')}` : null },
                      { key: 'calendly',     label: 'Calendly',  icon: '📅', val: ci.calendly, href: ci.calendly },
                    ].filter(r => r.val).map(row => (
                      <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{row.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 64, flexShrink: 0 }}>{row.label}</span>
                        {row.href ? (
                          <a href={row.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--green-text)', textDecoration: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.val}</a>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-mid)', flex: 1 }}>{row.val}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── RESUME ── */}
          {activeTab === 'resume' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Projects */}
              {(s.projects || []).length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Projects</p>
                  {(s.projects || []).map((p, i) => (
                    <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{p.title || p.name}</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {(p.githubUrl || p.github_url) && <a href={p.githubUrl || p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><Github size={13} /></a>}
                          {(p.projectUrl || p.link)      && <a href={p.projectUrl || p.link}      target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)' }}><ExternalLink size={13} /></a>}
                        </div>
                      </div>
                      {p.description && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, lineHeight: 1.5 }}>{p.description}</p>}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(Array.isArray(p.techStack) ? p.techStack : []).map((t, j) => (
                          <span key={j} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Education — NEW */}
              {(s.education || []).length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Education</p>
                  {(s.education || []).map((edu, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>🎓</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{edu.school}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-mid)', marginBottom: 1 }}>{edu.degree}{edu.major ? ` · ${edu.major}` : ''}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{edu.startYear || '—'}{edu.endYear ? `–${edu.endYear}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications — NEW */}
              {(s.certifications || []).length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Certifications</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {(s.certifications || []).map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 12, color: 'var(--text-mid)' }}>
                        <span style={{ fontSize: 14 }}>🏅</span> {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards — NEW */}
              {(s.awards || []).length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Awards & Achievements</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(s.awards || []).map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                        <span style={{ fontSize: 16 }}>⭐</span>
                        <span style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coding Profiles — NEW */}
              {s.coding_profiles && Object.keys(s.coding_profiles).some(k => s.coding_profiles[k]) && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Coding Profiles</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(s.coding_profiles).filter(([, val]) => val).map(([platform, username]) => {
                      const cfg = CODING_PLATFORMS[platform];
                      if (!cfg) return null;
                      const url = cfg.url(username);
                      return (
                        <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, textDecoration: 'none' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                            <img src={cfg.logo} alt={cfg.label} style={{ width: 18, height: 18, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', width: 100, flexShrink: 0 }}>{cfg.label}</span>
                          <span style={{ fontSize: 12, color: 'var(--green-text)', flex: 1 }}>@{username}</span>
                          <ExternalLink size={11} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Other Links — NEW */}
              {(s.other_links || []).length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Other Links</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(s.other_links || []).map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, textDecoration: 'none' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🔗</div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{link.label || link.url}</span>
                        <ExternalLink size={11} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state if no resume data */}
              {!(s.projects?.length) && !(s.education?.length) && !(s.certifications?.length) && !(s.awards?.length) && (
                <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--border)', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No resume details added yet.</p>
                </div>
              )}
            </div>
          )}

          {/* ── SKILLS — with real logos ── */}
          {activeTab === 'skills' && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Technical Skills</p>
              {(s.skills || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--border)', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No skills added yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(s.skills || []).map((sk, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                      {getSkillLogoForRecruiter(sk.name)}
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{sk.name}</span>
                      <div style={{ display: 'flex', gap: 2, marginLeft: 2 }}>
                        {[1,2,3,4,5].map(d => (
                          <div key={d} style={{ width: 4, height: 4, borderRadius: 1, background: (sk.level || sk.proficiency_level || 0) >= d ? 'var(--blue)' : 'var(--border)' }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── JOURNEY ── */}
          {activeTab === 'journey' && (
            <div>
              {(s.journey || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--border)', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No journey entries yet.</p>
                </div>
              ) : (s.journey || []).map((j, i) => (
                <div key={i} style={{ paddingLeft: 24, position: 'relative', marginBottom: 16 }}>
                  <div style={{ position: 'absolute', left: 6, top: 8, width: 8, height: 8, borderRadius: 1, background: 'var(--green)' }} />
                  <div style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{j.title}</p>
                    {j.company && <p style={{ fontSize: 11, color: 'var(--text-mid)', margin: '2px 0' }}>{j.company}</p>}
                    <p style={{ fontSize: 10, color: 'var(--text-dim)' }}>{j.startDate}{j.endDate ? ` → ${j.endDate}` : ' → Present'}</p>
                    {j.description && <p style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 6, lineHeight: 1.5 }}>{j.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── MY HUNT ── */}
          {activeTab === 'myhunt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { key: 'my_hunt',     label: 'The Hunt' },
                { key: 'philosophy',  label: 'Philosophy' },
                { key: 'inspirations', label: 'What moves them' },
                { key: 'life_outside', label: 'Life outside work' },
              ].map(({ key, label }) => s[key] ? (
                <div key={key} style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>{s[key]}</p>
                </div>
              ) : null)}
              {!s.my_hunt && !s.philosophy && !s.inspirations && !s.life_outside && (
                <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--border)', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>This candidate hasn't filled in their Hunt story yet.</p>
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS — NEW ── */}
          {activeTab === 'reviews' && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Reviews & Ratings</p>

              {/* Aggregate rating if reviews exist */}
              {(s.reviews || []).length > 0 ? (
                <>
                  {/* Summary card */}
                  <div style={{ padding: '18px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 36, color: 'var(--text)', margin: 0, lineHeight: 1 }}>
                        {(s.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / s.reviews.length).toFixed(1)}
                      </p>
                      <StarRating rating={s.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / s.reviews.length} size={13} />
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0' }}>{s.reviews.length} review{s.reviews.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = s.reviews.filter(r => Math.round(r.rating) === star).length;
                        const pct = s.reviews.length ? (count / s.reviews.length) * 100 : 0;
                        return (
                          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 10, color: 'var(--text-dim)', width: 8, textAlign: 'right', flexShrink: 0 }}>{star}</span>
                            <Star size={9} style={{ color: 'var(--amber)', fill: 'var(--amber)', flexShrink: 0 }} />
                            <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--amber)', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--text-dim)', width: 16, flexShrink: 0 }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual reviews */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(s.reviews || []).map((review, i) => (
                      <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--green-tint)', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--green-text)', flexShrink: 0 }}>
                              {(review.recruiter_name || review.company || 'R').slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{review.recruiter_name || 'Recruiter'}</p>
                              {review.company && <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '1px 0 0' }}>{review.company}</p>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                            <StarRating rating={review.rating || 0} size={12} />
                            {review.role && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 6, background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{review.role}</span>}
                          </div>
                        </div>
                        {review.comment && (
                          <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
                        )}
                        {/* Attribute ratings if present */}
                        {review.attributes && Object.keys(review.attributes).length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                            {Object.entries(review.attributes).map(([attr, val]) => (
                              <div key={attr} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 6, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                                <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'capitalize' }}>{attr.replace(/_/g, ' ')}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)' }}>{val}/5</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {review.created_at && (
                          <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={9} />
                            {new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Empty state */
                <div style={{ textAlign: 'center', padding: '56px 24px', border: '2px dashed var(--border)', borderRadius: 12, background: 'var(--bg-card)' }}>
                  <div style={{ width: 48, height: 48, background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>⭐</div>
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 16, color: 'var(--text)', marginBottom: 6, fontWeight: 400 }}>No reviews yet.</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
                    Reviews appear here after a recruiter rates this candidate's performance at the end of an internship.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. HUNT SORT TRIGGER
