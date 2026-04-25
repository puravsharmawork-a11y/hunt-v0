import React, { useState } from 'react';
import { PersonCard } from '../explore/PersonCard';
import { LI_SVG, WA_SVG } from '../shared/icons';

// ─── Network Tab ───────────────────────────────────────────────────────────────
const MOCK_CONNECTIONS = [
  { id: 'c1', name: 'Arjun Mehta', college: 'VJTI Mumbai', role: 'Backend Dev', skills: ['Node.js', 'Python'], status: 'on_hunt', mutual: 3 },
  { id: 'c2', name: 'Sneha Patil', college: 'COEP Pune', role: 'Frontend Dev', skills: ['React', 'Figma'], status: 'on_hunt', mutual: 1 },
  { id: 'c3', name: 'Rahul Desai', college: 'VJTI Mumbai', role: 'ML Engineer', skills: ['Python', 'TensorFlow'], status: 'invited', mutual: 2 },
  { id: 'c4', name: 'Priyanka Singh', college: 'NIT Surat', role: 'Full Stack', skills: ['React', 'Node.js'], status: 'not_invited', mutual: 0 },
  { id: 'c5', name: 'Karan Shah', college: 'DJ Sanghvi', role: 'DevOps', skills: ['Docker', 'AWS'], status: 'on_hunt', mutual: 4 },
  { id: 'c6', name: 'Aisha Khan', college: 'SPIT Mumbai', role: 'Data Science', skills: ['Python', 'SQL'], status: 'not_invited', mutual: 1 },
];

const MOCK_DISCOVER = [
  { id: 'd1', name: 'Vikram Nair', college: 'NIT Calicut', role: 'Backend Dev', skills: ['Go', 'PostgreSQL'], connections: 12 },
  { id: 'd2', name: 'Meera Joshi', college: 'BITS Goa', role: 'Frontend Dev', skills: ['React', 'TypeScript'], connections: 8 },
  { id: 'd3', name: 'Siddharth Rao', college: 'NIT Trichy', role: 'ML Intern', skills: ['Python', 'PyTorch'], connections: 5 },
  { id: 'd4', name: 'Ananya Gupta', college: 'DTU Delhi', role: 'Full Stack', skills: ['React', 'Node.js'], connections: 19 },
  { id: 'd5', name: 'Rohan Verma', college: 'VJTI Mumbai', role: 'DevOps', skills: ['Kubernetes', 'AWS'], connections: 7 },
  { id: 'd6', name: 'Tanya Iyer', college: 'IIIT Hyderabad', role: 'Data Engineer', skills: ['Spark', 'Python'], connections: 11 },
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'hunt-fade-in 0.3s ease' }}>
      {/* Header */}
      <div style={{ padding: '28px 40px 0', flexShrink: 0 }}>
        <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>Network</p>
        <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '26px', fontWeight: 400, color: 'var(--text)', marginBottom: '16px' }}>
          Connections & Referrals
        </h1>
        {/* Sub-tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '0' }}>
          {networkSubTabs.map(t => (
            <button key={t.id} onClick={() => setNetworkSubTab(t.id)} style={{
              padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: networkSubTab === t.id ? 600 : 400,
              color: networkSubTab === t.id ? 'var(--text)' : 'var(--text-dim)',
              borderBottom: networkSubTab === t.id ? '2px solid var(--text)' : '2px solid transparent',
              marginBottom: '-1px', whiteSpace: 'nowrap',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 40px' }}>

        {/* ── MY CONNECTIONS ── */}
        {networkSubTab === 'connections' && (
          <div>
            {/* Import bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'stretch' }}>
              {/* LinkedIn card */}
              <div style={{ flex: 1, minWidth: '280px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {LI_SVG}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>Import from LinkedIn</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Opens LinkedIn → export your connections CSV</p>
                </div>
                <button onClick={() => window.open('https://www.linkedin.com/psettings/member-data', '_blank')}
                  style={{ padding: '7px 14px', borderRadius: '7px', border: 'none', background: '#0A66C2', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Go to LinkedIn
                </button>
              </div>
              {/* CSV upload card */}
              <div style={{ flex: 1, minWidth: '280px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>Upload Connections.csv</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{csvImported ? '✓ 47 connections imported' : 'Upload the CSV you downloaded from LinkedIn'}</p>
                </div>
                <label style={{ padding: '7px 14px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: csvImported ? 'var(--green)' : 'var(--text-mid)', fontSize: '11px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {csvImported ? 'Re-upload' : 'Upload CSV'}
                  <input type="file" accept=".csv" style={{ display: 'none' }} onChange={() => setCsvImported(true)} />
                </label>
              </div>
            </div>

            {/* Connection cards grid */}
            {csvImported ? (
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                  47 connections found · <span style={{ color: 'var(--green)' }}>3 already on HUNT</span>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {MOCK_CONNECTIONS.map(c => (
                    <PersonCard key={c.id} person={c} type="connection" inviteLink={inviteLink} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  {LI_SVG}
                </div>
                <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '16px', color: 'var(--text)', marginBottom: '6px' }}>Import your LinkedIn connections</p>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', maxWidth: '340px', margin: '0 auto 4px', lineHeight: 1.6 }}>
                  Step 1: Click "Go to LinkedIn" → download your connections CSV.<br />
                  Step 2: Upload it here — we'll show who's on HUNT and let you invite the rest.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── ALUMNI ── */}
        {networkSubTab === 'alumni' && (
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '20px', lineHeight: 1.5 }}>
              People from <strong style={{ color: 'var(--text)' }}>{studentProfile?.college || 'your college'}</strong> or companies you've interacted with on HUNT.
            </p>
            {/* Same college section */}
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '12px' }}>
              From {studentProfile?.college || 'your college'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '28px' }}>
              {MOCK_CONNECTIONS.filter((_, i) => i < 3).map(c => (
                <PersonCard key={c.id} person={{ ...c, status: 'on_hunt' }} type="connection" inviteLink={inviteLink} />
              ))}
            </div>
            {/* Companies section */}
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '12px' }}>
              At companies hiring on HUNT
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {MOCK_DISCOVER.filter((_, i) => i < 3).map(c => (
                <PersonCard key={c.id} person={c} type="discover" inviteLink={inviteLink} />
              ))}
            </div>
          </div>
        )}

        {/* ── DISCOVER ── */}
        {networkSubTab === 'discover' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={discoverSearch} onChange={e => setDiscoverSearch(e.target.value)}
                placeholder="Search by name, college, or role…"
                style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '16px' }}>{filteredDiscover.length} students on HUNT</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {filteredDiscover.map(p => (
                <PersonCard key={p.id} person={p} type="discover" inviteLink={inviteLink} />
              ))}
            </div>
            {filteredDiscover.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', fontSize: '13px' }}>
                No results for "{discoverSearch}"
              </div>
            )}
          </div>
        )}

        {/* ── REFERRALS ── */}
        {networkSubTab === 'referrals' && (
          <div style={{ maxWidth: '680px' }}>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Friends invited', val: '0' },
                { label: 'Joined HUNT', val: '0' },
                { label: 'Priority boosts', val: '0' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', textAlign: 'center' }}>
                  <p style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '28px', color: 'var(--green)', marginBottom: '4px' }}>{s.val}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Invite link */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px 24px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Your invite link</p>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '14px' }}>Share this link — every friend who joins boosts your priority ranking.</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inviteLink}
                </div>
                <button onClick={() => { navigator.clipboard?.writeText(inviteLink); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}
                  style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: linkCopied ? 'var(--green-tint)' : 'transparent', color: linkCopied ? 'var(--green)' : 'var(--text-mid)', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                  {linkCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Share buttons 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* WhatsApp */}
              <button onClick={() => { const msg = encodeURIComponent(`Hey! I'm on HUNT — it matches internships on skills, not college name. Join with my link: ${inviteLink}`); window.open(`https://wa.me/?text=${msg}`, '_blank'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{WA_SVG}</div>
                <div><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>WhatsApp</p><p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Send to your contacts</p></div>
              </button>
              {/* X */}
              <button onClick={() => { const msg = encodeURIComponent(`Internships matched on skills, not college name 🎯 Check out HUNT → ${inviteLink}`); window.open(`https://twitter.com/intent/tweet?text=${msg}`, '_blank'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
                <div><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Post on X</p><p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Tweet to your followers</p></div>
              </button>
              {/* Instagram */}
              <button onClick={() => { navigator.clipboard?.writeText(inviteLink); alert('Link copied! Paste it in your Instagram bio or story.'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </div>
                <div><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Instagram</p><p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Copy link for bio/stories</p></div>
              </button>
              {/* Email */}
              <button onClick={() => window.open(`mailto:?subject=Join me on HUNT&body=Hey! I'm finding internships on HUNT — it matches based on your skills, not just your college name. Way better than Internshala. Join here: ${inviteLink}`, '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Email</p><p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Send to specific people</p></div>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
