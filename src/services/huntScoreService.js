// src/services/huntScoreService.js
// Orchestrates ALL signals into the Hunt Score
//
// Signal sources (in priority order):
//   1. github_signals  — from githubService.scanGitHub()  (stored in DB)
//   2. resume_signals  — from resumeService.parseResume() (stored in DB)
//   3. profile fields  — skills, tools, projects, links   (always available)
//
// Hunt Score is infinite — it grows, never resets (except friction).
// Currently capped at 100 for display; future: uncapped with tiers shown.
//
// Formula (total 100 base):
//   GitHub activity     20 pts   (real API data when available, proxy otherwise)
//   Skills depth        25 pts   (merged: manual + resume-extracted)
//   Project quality     20 pts   (GitHub repos + profile projects)
//   Profile signals     20 pts   (completeness, links, bio)
//   Resume parsed       10 pts   (bonus for having a parseable resume)
//   Recency              5 pts   (how recently active)
//
// Future additions (not built yet):
//   AI badge bonus      +3 flat  (skill assessment passed)
//   Trajectory physics  computed per quarter
//   Friction penalty    -8/event (permanent)
//   Recruiter ratings   affects score

import { scoreGitHubSignals } from './githubService';
import { scoreResumeSignals, mergeSkills } from './resumeService';

// ─── Main: compute Hunt Score from all available signals ─────────────────────
export function computeHuntScore(studentProfile) {
  if (!studentProfile) return buildResult(0, {});

  const github  = studentProfile.github_signals  || null;
  const resume  = studentProfile.resume_signals  || null;

  // Merge skills: profile skills + resume-extracted skills
  const mergedSkills = mergeSkills(
    studentProfile.skills || [],
    resume?.skills || []
  );

  const breakdown = {};

  // ── 1. GitHub Activity (max 20) ───────────────────────────────────────────
  let githubScore = 0;
  if (github?.scannedAt) {
    // Real data from GitHub API
    githubScore = scoreGitHubSignals(github);
    breakdown.githubSource = 'api';
  } else if (studentProfile.github_url) {
    // Proxy: just has a URL set
    githubScore = 5;
    const projects = studentProfile.projects || [];
    const withGH = projects.filter(p =>
      p.githubUrl || p.github_url ||
      (p.projectUrl || '').toLowerCase().includes('github') ||
      (p.link || '').toLowerCase().includes('github')
    );
    githubScore += Math.min(withGH.length * 2, 6);
    breakdown.githubSource = 'proxy';
  } else {
    breakdown.githubSource = 'none';
  }
  breakdown.github = Math.min(githubScore, 20);

  // ── 2. Skills — depth + breadth from merged skills (max 25) ──────────────
  let skillScore = 0;
  if (mergedSkills.length > 0) {
    // Depth: weighted avg level / 5 × 15
    const avgLevel = mergedSkills.reduce((s, sk) => s + (sk.level || 3), 0) / mergedSkills.length;
    const depthPts = (avgLevel / 5) * 15;
    // Breadth: log-scaled. 10+ skills → full 10 pts
    const breadthPts = Math.min(
      (Math.log2(mergedSkills.length + 1) / Math.log2(11)) * 10,
      10
    );
    skillScore = Math.round(depthPts + breadthPts);
    breakdown.skillsSource = resume?.skills?.length > 0 ? 'merged' : 'profile';
  } else {
    breakdown.skillsSource = 'none';
  }
  breakdown.skills = Math.min(skillScore, 25);

  // ── 3. Project quality (max 20) ───────────────────────────────────────────
  let projectScore = 0;
  const profileProjects = studentProfile.projects || [];
  const resumeProjects  = resume?.projects || [];

  // Combine and deduplicate by name
  const allProjectNames = new Set();
  const allProjects = [];
  for (const p of [...profileProjects, ...resumeProjects]) {
    const key = (p.name || p.title || '').toLowerCase().trim();
    if (key && !allProjectNames.has(key)) {
      allProjectNames.add(key);
      allProjects.push(p);
    }
  }

  if (allProjects.length > 0) {
    // Base: up to 9 pts for count (3 per project, max 3 projects)
    projectScore += Math.min(allProjects.length * 3, 9);

    // Quality signals per project
    let qualityPts = 0;
    for (const p of allProjects) {
      const hasGithub = p.githubUrl || p.github_url ||
        (p.link || '').toLowerCase().includes('github') ||
        (p.projectUrl || '').toLowerCase().includes('github');
      const hasLiveUrl = p.projectUrl && !hasGithub;
      const hasDesc = (p.description || '').length > 40;
      const hasTech = (p.techStack || []).length >= 2;
      const hasStars = github?.repos?.find(r =>
        r.name.toLowerCase() === (p.name || '').toLowerCase()
      )?.stars > 0;

      if (hasGithub)   qualityPts += 2;
      if (hasLiveUrl)  qualityPts += 2;
      if (hasDesc)     qualityPts += 1;
      if (hasTech)     qualityPts += 1;
      if (hasStars)    qualityPts += 1;
    }
    projectScore += Math.min(qualityPts, 11);
  }

  // Bonus if GitHub repos have quality signals (tests, CI, READMEs)
  if (github?.reposWithTests > 0)  projectScore += 2;
  if (github?.reposWithCI > 0)     projectScore += 2;
  if (github?.avgReadmeLength > 500) projectScore += 1;

  breakdown.projects = Math.min(projectScore, 20);

  // ── 4. Profile signals (max 20) ───────────────────────────────────────────
  let profileScore = 0;
  if (studentProfile.full_name)                                   profileScore += 2;
  if (studentProfile.email)                                       profileScore += 1;
  if (studentProfile.bio && studentProfile.bio.length > 20)      profileScore += 3;
  if (studentProfile.headline)                                    profileScore += 1;
  if (studentProfile.avatar_url)                                  profileScore += 2;
  if (studentProfile.resume_url)                                  profileScore += 3;
  if (studentProfile.linkedin_url)                                profileScore += 3;
  if (studentProfile.github_url)                                  profileScore += 2;
  if ((studentProfile.preferred_roles || []).length > 0)         profileScore += 2;
  if (studentProfile.availability)                                profileScore += 1;
  breakdown.profile = Math.min(profileScore, 20);

  // ── 5. Resume parsed bonus (max 10) ───────────────────────────────────────
  let resumeScore = 0;
  if (resume?.parsedAt) {
    resumeScore = scoreResumeSignals(resume);
    breakdown.resumeSource = 'parsed';
  } else if (studentProfile.resume_url) {
    resumeScore = 2; // has resume URL but not yet parsed
    breakdown.resumeSource = 'url_only';
  } else {
    breakdown.resumeSource = 'none';
  }
  breakdown.resume = Math.min(resumeScore, 10);

  // ── 6. Recency (max 5) ────────────────────────────────────────────────────
  let recencyScore = 0;
  const now = Date.now();
  const candidates = [
    studentProfile.updated_at,
    github?.scannedAt,
    ...(profileProjects.map(p => p.endDate || p.end_date || null)).filter(Boolean),
  ].filter(Boolean).map(d => new Date(d).getTime()).filter(t => !isNaN(t));

  if (candidates.length > 0) {
    const mostRecent = Math.max(...candidates);
    const daysAgo = (now - mostRecent) / (1000 * 60 * 60 * 24);
    if (daysAgo < 30)       recencyScore = 5;
    else if (daysAgo < 90)  recencyScore = 4;
    else if (daysAgo < 180) recencyScore = 3;
    else if (daysAgo < 365) recencyScore = 1;
  } else {
    recencyScore = 1;
  }
  breakdown.recency = recencyScore;

  // ── 7. Future: friction penalty ───────────────────────────────────────────
  const frictionPenalty = (studentProfile.friction_count || 0) * 8;
  breakdown.frictionPenalty = -frictionPenalty;

  // ── 8. Future: AI badge bonus ─────────────────────────────────────────────
  const badgeBonus = (studentProfile.verified_skills_count || 0) > 0 ? 3 : 0;
  breakdown.badgeBonus = badgeBonus;

  // ── Final ─────────────────────────────────────────────────────────────────
  const raw =
    breakdown.github +
    breakdown.skills +
    breakdown.projects +
    breakdown.profile +
    breakdown.resume +
    breakdown.recency +
    breakdown.badgeBonus -
    frictionPenalty;

  const score = Math.max(0, Math.min(Math.round(raw), 100));

  return buildResult(score, breakdown, { mergedSkills, allProjects });
}

function buildResult(score, breakdown, extras = {}) {
  const level =
    score >= 80 ? 'elite'    :
    score >= 60 ? 'strong'   :
    score >= 40 ? 'building' :
    score >= 20 ? 'starter'  : 'unranked';

  return {
    score,
    breakdown,
    level,
    // Pass merged data back so index.jsx can use enriched profile
    enriched: extras,
    // Human-readable signal quality for UI
    signals: {
      github:  breakdown.githubSource || 'none',
      resume:  breakdown.resumeSource || 'none',
      skills:  breakdown.skillsSource || 'none',
    },
  };
}

// ─── Enrich a full student profile with merged signals ───────────────────────
// Returns profile + merged skills + allProjects + huntScore
// Use this in index.jsx after loadData() to get the enriched profile
export function enrichProfile(studentProfile) {
  const result = computeHuntScore(studentProfile);
  return {
    ...studentProfile,
    // Augment skills with resume-merged version
    _mergedSkills:   result.enriched.mergedSkills || studentProfile.skills,
    _allProjects:    result.enriched.allProjects  || studentProfile.projects,
    _huntScore:      result,
  };
}

// ─── What's blocking a higher score — for the UI tip cards ───────────────────
export function getScoreImprovements(studentProfile) {
  const result = computeHuntScore(studentProfile);
  const { breakdown, signals } = result;
  const tips = [];

  if (signals.github === 'none') {
    tips.push({
      impact: 20, action: 'add_github',
      title: 'Add your GitHub URL',
      desc: 'Up to +20 pts — GitHub is the strongest signal we read',
    });
  } else if (signals.github === 'proxy') {
    tips.push({
      impact: 15, action: 'refresh_github',
      title: 'Scan your GitHub',
      desc: 'We\'ll read your actual repos, commits, and project quality',
    });
  }

  if (signals.resume === 'none') {
    tips.push({
      impact: 10, action: 'upload_resume',
      title: 'Upload your resume',
      desc: 'We\'ll extract skills and experience you may not have listed',
    });
  } else if (signals.resume === 'url_only') {
    tips.push({
      impact: 8, action: 'parse_resume',
      title: 'Scan your resume',
      desc: 'Resume uploaded but not yet parsed — click to analyse it',
    });
  }

  if (!studentProfile.bio || studentProfile.bio.length < 20) {
    tips.push({
      impact: 3, action: 'add_bio',
      title: 'Add a bio',
      desc: 'A few sentences about what you\'re building or learning',
    });
  }

  if (!studentProfile.linkedin_url) {
    tips.push({
      impact: 3, action: 'add_linkedin',
      title: 'Add LinkedIn URL',
      desc: 'Shows recruiters you have a professional presence',
    });
  }

  return tips.sort((a, b) => b.impact - a.impact);
}
