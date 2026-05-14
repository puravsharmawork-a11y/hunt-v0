// src/components/StudentDashboard/explore/JobDetailPanel.jsx
import React from 'react';
import {
  Bookmark, Maximize2, Minimize2, X,
  Briefcase, Clock, MapPin, Users,
  CheckCircle2, ChevronRight, CalendarDays,
  Zap, Gift, ListChecks, Eye, Building2,
  UserRound, Globe2, Linkedin, ExternalLink,
} from 'lucide-react';

// ─── Company logo: real image if available, else ink-block with initial ───
function CompanyLogoBlock({ name, logoUrl, size = 56 }) {
  const glyph = (name || '?').slice(0, 1).toUpperCase();
  if (logoUrl) {
    return (
      <div style={{ width: size, height: size, flexShrink: 0, position: 'relative' }}>
        <img
          src={logoUrl}
          alt={name}
          style={{
            width: size, height: size,
            objectFit: 'cover',
            border: '1px solid var(--border-mid)',
            display: 'block',
          }}
          onError={e => {
            e.target.style.display = 'none';
            e.target.nextSibling && (e.target.nextSibling.style.display = 'grid');
          }}
        />
        {/* hidden ink-block fallback */}
        <div
          style={{
            display: 'none',
            width: size, height: size,
            placeItems: 'center',
            background: 'var(--ink)',
            color: 'var(--cream)',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600, fontSize: size * 0.39,
            position: 'absolute', top: 0, left: 0,
          }}
        >
          {glyph}
          <div style={{ position: 'absolute', bottom: -1, right: -1, width: 7, height: 7, background: 'var(--blue)' }} />
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        width: size, height: size, flexShrink: 0,
        background: 'var(--ink)', color: 'var(--cream)',
        display: 'grid', placeItems: 'center',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600, fontSize: size * 0.39, position: 'relative',
      }}
    >
      {glyph}
      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 7, height: 7, background: 'var(--blue)' }} />
    </div>
  );
}

export function JobDetailPanel({
  job, matchData,
  isMaximized, onToggleMaximize,
  onClose,
  onApply, applying, canApply,
  isSaved, onSave,
  isApplied,
}) {
  const [profileOpen, setProfileOpen] = React.useState(false);
  const scoreColor = s => (s >= 75 ? 'var(--blue)' : s >= 50 ? 'var(--amber)' : 'var(--red)');
  const compColor  = c => (c === 'High' ? 'var(--red)' : c === 'Medium' ? 'var(--amber)' : 'var(--blue)');
  const compTint   = c => (c === 'High' ? 'var(--red-tint)' : c === 'Medium' ? 'var(--amber-tint)' : 'var(--blue-tint)');

  const spotsLeft = Math.max(0, (job.max_applicants || 50) - (job.current_applicants || 0));
  const spotsLabel =
    spotsLeft === 0 ? 'Full' :
    spotsLeft <= 5  ? `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left` :
    `${spotsLeft} open slots`;

  return (
    <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', borderLeft: '1px solid var(--border-mid)', overflow: 'hidden', position: 'relative' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid var(--border-mid)', flexShrink: 0 }}>
        <span className="hunt-kicker hunt-kicker-ink">▲ listing / #{(job.id || '').toString().toUpperCase().slice(0, 8)}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setProfileOpen(true)} title="View startup profile" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 6, display: 'flex', alignItems: 'center' }}>
            <Eye size={14} />
          </button>
          <button onClick={onToggleMaximize} title={isMaximized ? 'Minimize' : 'Maximize'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 6, display: 'flex', alignItems: 'center' }}>
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={() => onSave(job)} title={isSaved ? 'Unsave' : 'Save'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? 'var(--blue)' : 'var(--text-dim)', padding: 6, display: 'flex', alignItems: 'center' }}>
            <Bookmark size={14} fill={isSaved ? 'var(--blue)' : 'none'} />
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 6, display: 'flex', alignItems: 'center' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Scroll body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 28px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'flex-start' }}>
          {/* LOGO — real image or ink-block initial */}
          <CompanyLogoBlock name={job.company} logoUrl={job.logo_url} size={56} />

          <div style={{ flex: 1 }}>
            <div className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {job.company}
              {job.posted && (
                <>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', fontWeight: 400, letterSpacing: '0.04em' }}>
                    <CalendarDays size={10} style={{ opacity: 0.6 }} />
                    {job.posted}
                  </span>
                </>
              )}
              {job.response_commitment && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--blue)', fontWeight: 600, letterSpacing: '0.04em' }}>
                  <Clock size={10} />
                  48h response
                </span>
              )}
            </div>
            <h1 className="hunt-serif" style={{ fontSize: 26, color: 'var(--text)', lineHeight: 1.15, marginBottom: 10 }}>
              {job.role}
            </h1>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {job.type && <span className="hunt-chip">{job.type}</span>}
              <button
                onClick={() => setProfileOpen(true)}
                className="hunt-chip"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}
              >
                <Building2 size={10} /> View startup profile
              </button>
              {isApplied && (
                <span className="hunt-chip" style={{ background: 'var(--blue-tint)', border: '1px solid var(--blue)', color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={10} /> Applied
                </span>
              )}
            </div>
          </div>
        </div>

        {/* MATCH BLOCK */}
        {matchData && (
          <div style={{ border: '1px solid var(--ink)', background: 'var(--bg-subtle)', padding: '18px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div className="hunt-kicker" style={{ marginBottom: 4 }}>match score</div>
                <div className="hunt-serif" style={{ fontSize: 48, lineHeight: 1, color: scoreColor(matchData.score) }}>
                  {matchData.score}<span style={{ fontSize: 22, color: 'var(--text-dim)' }}>%</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="hunt-kicker" style={{ marginBottom: 4 }}>competition</div>
                <div className="hunt-mono" style={{ fontSize: 14, color: compColor(matchData.competitionLevel), textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {matchData.competitionLevel}
                </div>
                <div className="hunt-mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2, letterSpacing: '0.04em' }}>
                  {job.current_applicants}/{job.max_applicants} slots
                </div>
              </div>
            </div>
            <div style={{ position: 'relative', height: 12, background: 'var(--cream-3)', border: '1px solid var(--ink)' }}>
              <div style={{ height: '100%', width: matchData.score + '%', background: scoreColor(matchData.score) }} />
              {[25, 50, 75].map(t => (
                <div key={t} style={{ position: 'absolute', left: t + '%', top: -2, width: 1, height: 16, background: 'var(--ink)', opacity: 0.4 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {[0, 50, 100].map(n => (
                <span key={n} className="hunt-mono" style={{ fontSize: 9.5, color: 'var(--text-dim)' }}>{n}</span>
              ))}
            </div>
          </div>
        )}

        {/* QUICK STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 20 }}>
          {[
            { Icon: Briefcase, label: 'Stipend',    val: job.stipend },
            { Icon: Clock,     label: 'Duration',   val: job.duration },
            { Icon: MapPin,    label: 'Location',   val: job.location },
            { Icon: Users,     label: 'Open slots', val: spotsLabel },
          ].filter(x => x.val).map(({ Icon, label, val }, i) => (
            <div key={i} className="hunt-mono" style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 12px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon size={10} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{label}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600, letterSpacing: '0.02em' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* COMPETITION BADGE */}
        {matchData?.competitionLevel && (
          <div className="hunt-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', marginBottom: 20, fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', border: `1px solid ${compColor(matchData.competitionLevel)}`, background: compTint(matchData.competitionLevel), color: compColor(matchData.competitionLevel) }}>
            <Zap size={11} /> {matchData.competitionLevel} competition
          </div>
        )}

        {/* ABOUT */}
        {job.description && (
          <Section label="About the role">
            <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.65 }}>{job.description}</p>
          </Section>
        )}

        {/* WHAT YOU'LL DO */}
        {(job.whatYoullDo || job.what_youll_do || []).length > 0 && (
          <Section label="What you'll do" icon={<ListChecks size={11} />}>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(job.whatYoullDo || job.what_youll_do || []).map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 5, height: 5, background: 'var(--ink)', flexShrink: 0, marginTop: 6 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* PERKS */}
        {(job.perks || []).length > 0 && (
          <Section label="Perks & benefits" icon={<Gift size={11} />}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {job.perks.map((perk, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'var(--blue-tint)', border: '1px solid var(--blue)', fontSize: 11, color: 'var(--blue)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                  <span style={{ fontSize: 9, opacity: 0.7 }}>✦</span> {perk}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* CUSTOM SECTIONS */}
        {(job.sections || []).map((sec, i) =>
          sec.heading && (sec.items || []).length > 0 ? (
            <Section key={i} label={sec.heading}>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sec.items.map((item, j) => (
                  <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 5, height: 5, background: 'var(--ink)', flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null
        )}

        {/* MATCH BREAKDOWN */}
        {matchData?.breakdown && (
          <Section label="Match breakdown">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(matchData.breakdown).map(([key, val]) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="hunt-mono" style={{ fontSize: 10.5, color: 'var(--text-mid)', letterSpacing: '0.05em', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="hunt-mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{val}%</span>
                  </div>
                  <div className="hunt-match-bar-track">
                    <div className="hunt-match-bar-fill" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* REQUIRED SKILLS */}
        {(job.required_skills || []).length > 0 && (
          <Section label="Required skills">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {job.required_skills.map((skill, idx) => {
                const matched = matchData?.matchedSkills?.find(s => s.name === skill.name);
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {matched
                        ? <CheckCircle2 size={13} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                        : <X size={13} style={{ color: 'var(--red)', flexShrink: 0 }} />
                      }
                      <span style={{ fontSize: 13, color: matched ? 'var(--text)' : 'var(--text-dim)' }}>{skill.name}</span>
                    </div>
                    {matched && skill.level != null && (
                      <span className="hunt-mono" style={{ fontSize: 9.5, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                        L{matched.studentLevel}/{skill.level}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* SKILLS GAP */}
        {matchData?.missingSkills?.length > 0 && (
          <Section label="Skills gap">
            <div style={{ padding: '12px 14px', border: '1px solid var(--red)', background: 'var(--red-tint)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {matchData.missingSkills.map((s, i) => (
                  <span key={i} className="hunt-chip hunt-chip-red">
                    {s.name}{s.level != null && <> (L{s.level})</>}
                  </span>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* NICE TO HAVE */}
        {(job.nice_to_have || []).length > 0 && (
          <Section label="Nice to have">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {job.nice_to_have.map((s, i) => (
                <span key={i} className="hunt-chip">{s}</span>
              ))}
            </div>
          </Section>
        )}

        {/* HONEST CAVEAT */}
        {matchData && (
          <Section label="Honest caveat">
            <div style={{ padding: '12px 14px', border: '1px dashed var(--border-mid)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 6, height: 6, background: 'var(--blue)', flexShrink: 0, marginTop: 6 }} />
              <div style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.55 }}>
                <span className="hunt-mono" style={{ color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>
                  Heads up ·{' '}
                </span>
                This role has <b>{job.current_applicants}</b> applicants. Top 20 get reviewed.
                Your match puts you in roughly the <b>top {Math.max(1, 100 - Math.floor(matchData.score / 3))}%</b>.
              </div>
            </div>
          </Section>
        )}
      </div>

      {/* APPLY CTA FOOTER */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--ink)', background: 'var(--bg-card)', flexShrink: 0, display: 'flex', gap: 10, alignItems: 'center' }}>
        {isApplied ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={18} style={{ color: 'var(--blue)', flexShrink: 0 }} />
            <div>
              <div className="hunt-mono" style={{ fontSize: 11, color: 'var(--blue)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Application sent</div>
              <div className="hunt-mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>Recruiter will reach out if shortlisted</div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1 }}>
              <div className="hunt-mono" style={{ fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                {applying ? 'submitting…' : !canApply ? 'weekly cap reached' : 'eligible to apply'}
              </div>
              <div className="hunt-mono" style={{ fontSize: 10.5, color: 'var(--text)' }}>
                {!canApply ? 'next reset Mon 09:00 IST' : "you'll use 1 of your 5 weekly slots"}
              </div>
            </div>
            <button
              onClick={onApply}
              disabled={!canApply || applying}
              className="hunt-btn hunt-btn-primary"
              style={{ cursor: !canApply || applying ? 'not-allowed' : 'pointer' }}
            >
              {applying ? 'Sending…' : !canApply ? 'Limit reached' : <>Apply now <ChevronRight size={12} /></>}
            </button>
          </>
        )}
      </div>
      {profileOpen && <StartupProfileDrawer job={job} onClose={() => setProfileOpen(false)} />}
    </div>
  );
}

function StartupProfileDrawer({ job, onClose }) {
  const recruiter = job.recruiter_profile || {};
  const startup = job.startup_profile || {};
  const companyName = startup.name || job.company || recruiter.company_name || 'Startup';
  const recruiterName = recruiter.contact_name || 'Recruiter';
  const recruiterTitle = recruiter.title || recruiter.role_in_company?.replace('_', ' ') || 'Hiring team';
  const founders = Array.isArray(startup.founders) ? startup.founders.filter(f => f?.name || f?.role || f?.background) : [];
  const techStack = Array.isArray(startup.tech_stack) ? startup.tech_stack : [];
  const cultureTags = Array.isArray(startup.culture_tags) ? startup.culture_tags : [];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'var(--bg-card)' }}>
      <div style={{ width: '100%', height: '100%', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid var(--border-mid)', flexShrink: 0 }}>
          <span className="hunt-kicker hunt-kicker-ink">startup profile</span>
          <button onClick={onClose} title="Close profile" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 6, display: 'flex', alignItems: 'center' }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {/* Banner */}
          <div style={{ height: 132, background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
            {startup.banner_url ? (
              <img src={startup.banner_url} alt={`${companyName} banner`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                <span className="hunt-kicker" style={{ color: 'var(--text-dim)' }}>company background</span>
              </div>
            )}
          </div>

          <div style={{ padding: '0 24px 28px' }}>
            {/* ── FIXED: logo overlaps banner edge; name+tagline sit cleanly below ── */}
            <div style={{ marginBottom: 18 }}>
              {/* Logo only gets the negative pull so it overlaps the banner bottom edge */}
              <div style={{ marginTop: -28, marginBottom: 10 }}>
                <CompanyLogoBlock name={companyName} logoUrl={startup.logo_url || job.logo_url} size={64} />
              </div>
              {/* Name and tagline are fully below the banner — no overlap */}
              <h2 className="hunt-serif" style={{ fontSize: 28, lineHeight: 1.05, color: 'var(--text)', margin: 0 }}>
                {companyName}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '5px 0 0', lineHeight: 1.45 }}>
                {startup.tagline || startup.one_line_pitch || recruiter.company_name || 'Recruiter profile'}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
              {[startup.industry, startup.stage, startup.team_size, startup.hq_location].filter(Boolean).map(item => (
                <span key={item} className="hunt-chip">{item}</span>
              ))}
              {recruiter.response_commitment && (
                <span className="hunt-chip" style={{ background: 'var(--blue-tint)', borderColor: 'var(--blue)', color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={10} /> 48h response
                </span>
              )}
            </div>

            <ProfileSection label="About" empty="No startup description added yet.">
              {startup.about || startup.one_line_pitch || recruiter.what_you_build || recruiter.about}
            </ProfileSection>

            <ProfileSection label="Why join" empty="No joining note added yet.">
              {startup.why_join || recruiter.hiring_note}
            </ProfileSection>

            {(techStack.length > 0 || cultureTags.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
                <MiniList label="Tech stack" items={techStack} />
                <MiniList label="Culture" items={cultureTags} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
              <InfoTile label="Website" value={startup.website || recruiter.website} href={startup.website || recruiter.website} icon={<Globe2 size={11} />} />
              <InfoTile label="Founded" value={startup.founded_year} />
              <InfoTile label="Traction" value={startup.traction_users} />
              <InfoTile label="Backed by" value={startup.backed_by} />
              <InfoTile label="LinkedIn" value={startup.linkedin_url} href={startup.linkedin_url} icon={<Linkedin size={11} />} />
              <InfoTile label="Press / customers" value={startup.press_mentions} />
            </div>

            {founders.length > 0 && (
              <ProfileSection label="Founding team">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {founders.map((founder, index) => (
                    <div key={`${founder.name}-${index}`} style={{ padding: '11px 12px', border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, margin: 0 }}>{founder.name || 'Founder'}{founder.role ? `, ${founder.role}` : ''}</p>
                      {founder.background && <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.5, margin: '4px 0 0' }}>{founder.background}</p>}
                      {founder.linkedin_url && <ExternalAnchor href={founder.linkedin_url} label="LinkedIn" />}
                    </div>
                  ))}
                </div>
              </ProfileSection>
            )}

            <ProfileSection label="Recruiter contact">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, border: '1px solid var(--border-mid)', background: 'var(--bg-subtle)' }}>
                <div style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', background: 'var(--ink)', color: 'var(--cream)', flexShrink: 0 }}>
                  <UserRound size={17} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, margin: 0 }}>{recruiterName}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '3px 0 0', textTransform: 'capitalize' }}>{recruiterTitle}</p>
                  {recruiter.bio && <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.55, margin: '9px 0 0' }}>{recruiter.bio}</p>}
                  {recruiter.what_im_looking_for && <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.55, margin: '9px 0 0' }}><b>Looking for:</b> {recruiter.what_im_looking_for}</p>}
                  {recruiter.linkedin_url && <ExternalAnchor href={recruiter.linkedin_url} label="Recruiter LinkedIn" />}
                </div>
              </div>
            </ProfileSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ label, children, empty }) {
  const hasContent = React.isValidElement(children) || (typeof children === 'string' ? children.trim() : children);
  if (!hasContent && !empty) return null;
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 9 }}>▲ {label}</div>
      {hasContent ? (
        typeof children === 'string'
          ? <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.65, margin: 0 }}>{children}</p>
          : children
      ) : (
        <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>{empty}</p>
      )}
    </div>
  );
}

function MiniList({ label, items }) {
  return (
    <div>
      <div className="hunt-kicker" style={{ marginBottom: 8 }}>{label}</div>
      {items.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {items.map(item => <span key={item} className="hunt-chip">{item}</span>)}
        </div>
      ) : (
        <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0, fontStyle: 'italic' }}>Not added</p>
      )}
    </div>
  );
}

function InfoTile({ label, value, href, icon }) {
  if (!value) return null;
  return (
    <div style={{ padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', minWidth: 0 }}>
      <div className="hunt-kicker" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
        {icon} {label}
      </div>
      {href ? (
        <ExternalAnchor href={href} label="Open link" compact />
      ) : (
        <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, overflowWrap: 'anywhere' }}>{value}</p>
      )}
    </div>
  );
}

function ExternalAnchor({ href, label, compact }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: compact ? 0 : 8, fontSize: 11, color: 'var(--blue)', textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {label} <ExternalLink size={10} />
    </a>
  );
}

function Section({ label, icon, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="hunt-kicker hunt-kicker-ink" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
        ▲ {label} {icon && <span style={{ opacity: 0.6 }}>{icon}</span>}
      </div>
      {children}
    </div>
  );
}
