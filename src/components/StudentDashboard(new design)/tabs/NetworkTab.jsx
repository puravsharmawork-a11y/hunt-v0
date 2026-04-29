// src/components/StudentDashboard/tabs/NetworkTab.jsx
import React, { useState } from 'react';
import { PersonCard } from '../explore/PersonCard';
import { LI_SVG, WA_SVG } from '../shared/icons';

// ─── Mock data preserved exactly from prior version ─────────────────────────────
const MOCK_CONNECTIONS = [
  { id: 'c1', name: 'Arjun Mehta',     college: 'VJTI Mumbai',    role: 'Backend Dev',  skills: ['Node.js', 'Python'],     status: 'on_hunt',     mutual: 3 },
  { id: 'c2', name: 'Sneha Patil',     college: 'COEP Pune',      role: 'Frontend Dev', skills: ['React', 'Figma'],        status: 'on_hunt',     mutual: 1 },
  { id: 'c3', name: 'Rahul Desai',     college: 'VJTI Mumbai',    role: 'ML Engineer',  skills: ['Python', 'TensorFlow'],  status: 'invited',     mutual: 2 },
  { id: 'c4', name: 'Priyanka Singh',  college: 'NIT Surat',      role: 'Full Stack',   skills: ['React', 'Node.js'],      status: 'not_invited', mutual: 0 },
  { id: 'c5', name: 'Karan Shah',      college: 'DJ Sanghvi',     role: 'DevOps',       skills: ['Docker', 'AWS'],         status: 'on_hunt',     mutual: 4 },
  { id: 'c6', name: 'Aisha Khan',      college: 'SPIT Mumbai',    role: 'Data Science', skills: ['Python', 'SQL'],         status: 'not_invited', mutual: 1 },
];

const MOCK_DISCOVER = [
  { id: 'd1', name: 'Vikram Nair',     college: 'NIT Calicut',     role: 'Backend Dev',  skills: ['Go', 'PostgreSQL'],     connections: 12 },
  { id: 'd2', name: 'Meera Joshi',     college: 'BITS Goa',        role: 'Frontend Dev', skills: ['React', 'TypeScript'],  connections: 8 },
  { id: 'd3', name: 'Siddharth Rao',   college: 'NIT Trichy',      role: 'ML Intern',    skills: ['Python', 'PyTorch'],    connections: 5 },
  { id: 'd4', name: 'Ananya Gupta',    college: 'DTU Delhi',       role: 'Full Stack',   skills: ['React', 'Node.js'],     connections: 19 },
  { id: 'd5', name: 'Rohan Verma',     college: 'VJTI Mumbai',     role: 'DevOps',       skills: ['Kubernetes', 'AWS'],    connections: 7 },
  { id: 'd6', name: 'Tanya Iyer',      college: 'IIIT Hyderabad',  role: 'Data Engineer',skills: ['Spark', 'Python'],      connections: 11 },
];

export function NetworkTab({ studentProfile }) {
  const [networkSubTab, setNetworkSubTab] = useState('connections');
  const [discoverSearch, setDiscoverSearch] = useState('');
  const [csvImported, setCsvImported] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const inviteSlug = studentProfile?.full_name?.split(' ')[0]?.toLowerCase() || 'you';
  const inviteLink = `https://hunt.so/invite/${inviteSlug}`;

  const filteredDiscover = MOCK_DISCOVER.filter(p =>
    p.name.toLowerCase().includes(discoverSearch.toLowerCase()) ||
    p.college.toLowerCase().includes(discoverSearch.toLowerCase()) ||
    p.role.toLowerCase().includes(discoverSearch.toLowerCase())
  );

  const networkSubTabs = [
    { id: 'connections', label: 'My Connections' },
    { id: 'alumni',      label: 'Alumni' },
    { id: 'discover',    label: 'Discover' },
    { id: 'referrals',   label: 'Referrals' },
  ];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'hunt-fade-in 0.3s ease',
      }}
    >
      {/* Header */}
      <div style={{ padding: '28px 40px 0', flexShrink: 0 }}>
        <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 6 }}>▲ network</p>
        <h1
          className="hunt-serif"
          style={{
            fontSize: 30,
            color: 'var(--text)',
            marginBottom: 18,
            lineHeight: 1.05,
          }}
        >
          Connections & <em>referrals.</em>
        </h1>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-mid)' }}>
          {networkSubTabs.map(t => {
            const active = networkSubTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setNetworkSubTab(t.id)}
                className="hunt-mono"
                style={{
                  padding: '10px 18px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11.5,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--text)' : 'var(--text-dim)',
                  borderBottom: `2px solid ${active ? 'var(--blue)' : 'transparent'}`,
                  marginBottom: -1,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.12s, border-color 0.12s',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 40px' }}>

        {/* ── MY CONNECTIONS ── */}
        {networkSubTab === 'connections' && (
          <div>
            {/* Import bar */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginBottom: 24,
                flexWrap: 'wrap',
                alignItems: 'stretch',
              }}
            >
              {/* LinkedIn card */}
              <div
                className="hunt-card"
                style={{
                  flex: 1,
                  minWidth: 280,
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: '#0A66C2',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {LI_SVG}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    Import from LinkedIn
                  </p>
                  <p
                    className="hunt-mono"
                    style={{
                      fontSize: 10.5,
                      color: 'var(--text-dim)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Opens LinkedIn → export connections CSV
                  </p>
                </div>
                <button
                  onClick={() => window.open('https://www.linkedin.com/psettings/member-data', '_blank')}
                  className="hunt-btn hunt-btn-sm"
                  style={{
                    background: '#0A66C2',
                    color: '#fff',
                    borderColor: '#0A66C2',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Go to LinkedIn
                </button>
              </div>

              {/* CSV upload card */}
              <div
                className="hunt-card"
                style={{
                  flex: 1,
                  minWidth: 280,
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-mid)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    Upload Connections.csv
                  </p>
                  <p
                    className="hunt-mono"
                    style={{
                      fontSize: 10.5,
                      color: csvImported ? 'var(--blue)' : 'var(--text-dim)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {csvImported ? '✓ 47 connections imported' : 'upload the file from LinkedIn'}
                  </p>
                </div>
                <label
                  className="hunt-btn hunt-btn-sm hunt-btn-ghost"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {csvImported ? 'Re-upload' : 'Upload CSV'}
                  <input
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={() => setCsvImported(true)}
                  />
                </label>
              </div>
            </div>

            {/* Connection cards grid */}
            {csvImported ? (
              <div>
                <p
                  className="hunt-mono"
                  style={{
                    fontSize: 10.5,
                    color: 'var(--text-dim)',
                    marginBottom: 16,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  47 connections found ·{' '}
                  <span style={{ color: 'var(--blue)' }}>3 already on HUNT</span>
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: 14,
                  }}
                >
                  {MOCK_CONNECTIONS.map(c => (
                    <PersonCard key={c.id} person={c} type="connection" inviteLink={inviteLink} />
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="hunt-card"
                style={{
                  textAlign: 'center',
                  padding: '48px 20px',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: '#0A66C2',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 14px',
                  }}
                >
                  {LI_SVG}
                </div>
                <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 8 }}>
                  ▲ import linkedin connections
                </p>
                <p
                  className="hunt-serif"
                  style={{
                    fontSize: 22,
                    color: 'var(--text)',
                    marginBottom: 8,
                  }}
                >
                  Bring your network to <em>HUNT.</em>
                </p>
                <p
                  style={{
                    fontSize: 12.5,
                    color: 'var(--text-mid)',
                    maxWidth: 360,
                    margin: '0 auto',
                    lineHeight: 1.6,
                  }}
                >
                  <b>Step 1:</b> Click "Go to LinkedIn" → download your connections CSV.<br />
                  <b>Step 2:</b> Upload it here — we'll show who's on HUNT and let you invite the rest.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── ALUMNI ── */}
        {networkSubTab === 'alumni' && (
          <div>
            <p
              style={{
                fontSize: 13,
                color: 'var(--text-mid)',
                marginBottom: 22,
                lineHeight: 1.55,
              }}
            >
              People from{' '}
              <strong style={{ color: 'var(--text)' }}>
                {studentProfile?.college || 'your college'}
              </strong>{' '}
              or companies you've interacted with on HUNT.
            </p>

            <p className="hunt-kicker" style={{ marginBottom: 12 }}>
              ▲ from {studentProfile?.college || 'your college'}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 14,
                marginBottom: 32,
              }}
            >
              {MOCK_CONNECTIONS.filter((_, i) => i < 3).map(c => (
                <PersonCard
                  key={c.id}
                  person={{ ...c, status: 'on_hunt' }}
                  type="connection"
                  inviteLink={inviteLink}
                />
              ))}
            </div>

            <p className="hunt-kicker" style={{ marginBottom: 12 }}>
              ▲ at companies hiring on HUNT
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 14,
              }}
            >
              {MOCK_DISCOVER.filter((_, i) => i < 3).map(c => (
                <PersonCard key={c.id} person={c} type="discover" inviteLink={inviteLink} />
              ))}
            </div>
          </div>
        )}

        {/* ── DISCOVER ── */}
        {networkSubTab === 'discover' && (
          <div>
            <div
              style={{
                position: 'relative',
                marginBottom: 20,
                maxWidth: 420,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-dim)"
                strokeWidth="2"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={discoverSearch}
                onChange={e => setDiscoverSearch(e.target.value)}
                placeholder="search by name, college, or role…"
                className="hunt-mono"
                style={{
                  width: '100%',
                  paddingLeft: 36,
                  paddingRight: 12,
                  paddingTop: 10,
                  paddingBottom: 10,
                  border: '1px solid var(--border-mid)',
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  fontSize: 12,
                  letterSpacing: '0.04em',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <p
              className="hunt-mono"
              style={{
                fontSize: 10.5,
                color: 'var(--text-dim)',
                marginBottom: 16,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {filteredDiscover.length} students on HUNT
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 14,
              }}
            >
              {filteredDiscover.map(p => (
                <PersonCard key={p.id} person={p} type="discover" inviteLink={inviteLink} />
              ))}
            </div>
            {filteredDiscover.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: 40,
                  color: 'var(--text-dim)',
                  fontSize: 13,
                  border: '1px dashed var(--border-mid)',
                }}
              >
                No results for "{discoverSearch}"
              </div>
            )}
          </div>
        )}

        {/* ── REFERRALS ── */}
        {networkSubTab === 'referrals' && (
          <div style={{ maxWidth: 720 }}>
            {/* Stats row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                marginBottom: 24,
              }}
            >
              {[
                { label: 'Friends invited',  val: '0' },
                { label: 'Joined HUNT',       val: '0' },
                { label: 'Priority boosts',   val: '0' },
              ].map(s => (
                <div
                  key={s.label}
                  className="hunt-card"
                  style={{ padding: '18px 20px', textAlign: 'center' }}
                >
                  <p
                    className="hunt-serif"
                    style={{
                      fontSize: 36,
                      lineHeight: 1,
                      color: 'var(--blue)',
                      marginBottom: 6,
                    }}
                  >
                    {s.val}
                  </p>
                  <p className="hunt-kicker">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Invite link */}
            <div
              className="hunt-card"
              style={{ padding: '22px 24px', marginBottom: 16 }}
            >
              <p className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 6 }}>
                ▲ your invite link
              </p>
              <p
                style={{
                  fontSize: 12.5,
                  color: 'var(--text-mid)',
                  marginBottom: 14,
                  lineHeight: 1.55,
                }}
              >
                Share this link — every friend who joins boosts your priority ranking.
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                <div
                  className="hunt-mono"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid var(--border-mid)',
                    background: 'var(--bg-subtle)',
                    fontSize: 12,
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.04em',
                  }}
                >
                  {inviteLink}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(inviteLink);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                  className="hunt-btn hunt-btn-sm"
                  style={{
                    background: linkCopied ? 'var(--blue-tint)' : 'transparent',
                    color: linkCopied ? 'var(--blue-deep)' : 'var(--ink)',
                    borderColor: linkCopied ? 'var(--blue)' : 'var(--ink)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {linkCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Share buttons 2x2 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              {/* WhatsApp */}
              <ShareButton
                bg="#25D366"
                icon={WA_SVG}
                title="WhatsApp"
                sub="Send to your contacts"
                onClick={() => {
                  const msg = encodeURIComponent(`Hey! I'm on HUNT — it matches internships on skills, not college name. Join with my link: ${inviteLink}`);
                  window.open(`https://wa.me/?text=${msg}`, '_blank');
                }}
              />

              {/* X */}
              <ShareButton
                bg="#000"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                }
                title="Post on X"
                sub="Tweet to your followers"
                onClick={() => {
                  const msg = encodeURIComponent(`Internships matched on skills, not college name 🎯 Check out HUNT → ${inviteLink}`);
                  window.open(`https://twitter.com/intent/tweet?text=${msg}`, '_blank');
                }}
              />

              {/* Instagram */}
              <ShareButton
                bg="linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)"
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                }
                title="Instagram"
                sub="Copy for bio/stories"
                onClick={() => {
                  navigator.clipboard?.writeText(inviteLink);
                  alert('Link copied! Paste it in your Instagram bio or story.');
                }}
              />

              {/* Email */}
              <ShareButton
                bg="var(--bg-subtle)"
                iconBorder
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                }
                title="Email"
                sub="Send to specific people"
                onClick={() => window.open(
                  `mailto:?subject=Join me on HUNT&body=Hey! I'm finding internships on HUNT — it matches based on your skills, not just your college name. Way better than Internshala. Join here: ${inviteLink}`,
                  '_blank'
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShareButton({ bg, icon, iconBorder, title, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="hunt-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        cursor: 'pointer',
        textAlign: 'left',
        background: 'var(--bg-card)',
        transition: 'transform 0.1s, box-shadow 0.1s, border-color 0.1s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--ink)';
        e.currentTarget.style.boxShadow = '3px 3px 0 0 var(--ink)';
        e.currentTarget.style.transform = 'translate(-1px,-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-mid)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          background: bg,
          border: iconBorder ? '1px solid var(--border-mid)' : 'none',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</p>
        <p
          className="hunt-mono"
          style={{
            fontSize: 10,
            color: 'var(--text-dim)',
            letterSpacing: '0.04em',
          }}
        >
          {sub}
        </p>
      </div>
    </button>
  );
}
