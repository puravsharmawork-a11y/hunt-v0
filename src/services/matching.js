// src/services/matching.js
// Match score — job-specific, uses real stored signals from github_signals + resume_signals
// Hunt Score — now delegated to huntScoreService.js (import from there)

export { computeHuntScore as calculateHuntScore, enrichProfile } from './huntScoreService';

import { scoreGitHubSignals } from './githubService';

// ============================================================================
// MATCH SCORE — job-specific, changes per job, visible to candidate
//
// Weights: Skills 40% | Projects 25% | GitHub 20% | Recency 10% | Tools 5%
//
// Uses merged skills (profile + resume_signals.skills) when resume parsed.
// Uses real github_signals when GitHub has been scanned.
// ============================================================================

export function calculateMatchScore(studentProfile, job) {
  // Build merged skill map: profile skills + resume-extracted skills
  const profileSkills = studentProfile.skills || [];
  const resumeSkills  = studentProfile.resume_signals?.skills || [];

  const skillMap = new Map();
  for (const s of profileSkills) {
    skillMap.set(s.name.toLowerCase(), s);
  }
  // Resume skills fill gaps only — don't override manual entries
  for (const s of resumeSkills) {
    const key = s.name.toLowerCase();
    if (!skillMap.has(key)) {
      skillMap.set(key, { ...s, source: 'resume' });
    }
  }

  const requiredSkills = job.required_skills || [];
  const matchedSkills  = [];
  const missingSkills  = [];
  let rawSkillPct = 0;

  // ── 1. Skill match (40%) ─────────────────────────────────────────────────
  for (const reqSkill of requiredSkills) {
    const found = skillMap.get(reqSkill.name?.toLowerCase());
    if (found) {
      const studentLevel  = found.level || 3;
      const levelMatch    = Math.min(studentLevel / (reqSkill.level || 3), 1);
      const verifiedBonus = found.verified ? 1.1 : 1.0;
      rawSkillPct += (reqSkill.weight || (1 / requiredSkills.length)) * levelMatch * verifiedBonus;
      matchedSkills.push({ ...reqSkill, studentLevel, source: found.source || 'profile' });
    } else {
      missingSkills.push(reqSkill);
    }
  }

  const skillComponent = Math.min(rawSkillPct * 100, 100) * 0.40;

  // ── 2. Project relevance (25%) ───────────────────────────────────────────
  // Combine profile projects + resume-extracted projects (deduplicated)
  const profileProjects = studentProfile.projects || [];
  const resumeProjects  = studentProfile.resume_signals?.projects || [];
  const seenProjects    = new Set();
  const allProjects     = [];

  for (const p of [...profileProjects, ...resumeProjects]) {
    const key = (p.name || p.title || '').toLowerCase().trim();
    if (!seenProjects.has(key)) {
      seenProjects.add(key);
      allProjects.push(p);
    }
  }

  let projectPct = 0;
  if (allProjects.length > 0 && requiredSkills.length > 0) {
    for (const project of allProjects) {
      const techStack = Array.isArray(project.techStack)
        ? project.techStack
        : (typeof project.techStack === 'string'
          ? project.techStack.split(',').map(t => t.trim())
          : []);

      const overlap = techStack.filter(tech =>
        requiredSkills.some(s => s.name?.toLowerCase() === tech.toLowerCase())
      );
      projectPct += overlap.length / requiredSkills.length;
    }
    projectPct = Math.min(projectPct, 1);
  }

  const projectComponent = projectPct * 100 * 0.25;

  // ── 3. GitHub activity (20%) ─────────────────────────────────────────────
  const githubSignals = studentProfile.github_signals;
  let githubPct = 0;

  if (githubSignals?.scannedAt) {
    // Real GitHub API data — use dedicated scorer
    githubPct = scoreGitHubSignals(githubSignals) / 20; // normalize to 0-1
  } else if (studentProfile.github_url) {
    // Proxy: URL exists but not scanned yet
    const projectsWithGH = allProjects.filter(p =>
      p.githubUrl || p.github_url ||
      (p.projectUrl || '').toLowerCase().includes('github') ||
      (p.link || '').toLowerCase().includes('github')
    );
    githubPct = 0.4 + Math.min(projectsWithGH.length * 0.1, 0.3);
  }

  const githubComponent = githubPct * 100 * 0.20;

  // ── 4. Recency (10%) ─────────────────────────────────────────────────────
  const now = Date.now();
  const dateCandidates = [
    studentProfile.updated_at,
    githubSignals?.scannedAt,
    ...allProjects.map(p => p.endDate || p.end_date).filter(Boolean),
  ].filter(Boolean).map(d => new Date(d).getTime()).filter(t => !isNaN(t));

  let recencyPct = 0.3;
  if (dateCandidates.length > 0) {
    const daysAgo = (now - Math.max(...dateCandidates)) / (1000 * 60 * 60 * 24);
    if (daysAgo < 30)       recencyPct = 1.0;
    else if (daysAgo < 90)  recencyPct = 0.8;
    else if (daysAgo < 180) recencyPct = 0.5;
    else if (daysAgo < 365) recencyPct = 0.2;
  }

  const recencyComponent = recencyPct * 100 * 0.10;

  // ── 5. Tool match (5%) ───────────────────────────────────────────────────
  const requiredTools = job.required_tools || [];
  const studentTools  = studentProfile.tools || [];
  let toolPct = 0.4;

  if (requiredTools.length > 0) {
    const matched = requiredTools.filter(t =>
      studentTools.some(st => st.toLowerCase() === t.toLowerCase())
    );
    toolPct = matched.length / requiredTools.length;
  } else if (studentTools.length > 0) {
    toolPct = 0.8;
  }

  const toolComponent = toolPct * 100 * 0.05;

  // ── Final ─────────────────────────────────────────────────────────────────
  const raw = skillComponent + projectComponent + githubComponent + recencyComponent + toolComponent;
  const finalScore = Math.min(Math.round(raw), 100);

  return {
    score: finalScore,
    breakdown: {
      skillMatch:       Math.round(skillComponent),
      projectRelevance: Math.round(projectComponent),
      githubActivity:   Math.round(githubComponent),
      recency:          Math.round(recencyComponent),
      toolMatch:        Math.round(toolComponent),
    },
    matchedSkills,
    missingSkills,
    competitionLevel:
      (job.current_applicants || 0) >= 40 ? 'High' :
      (job.current_applicants || 0) >= 25 ? 'Medium' : 'Low',
    canApply: finalScore >= (job.minimum_match_threshold || 50),
    usingRealGitHub:   !!githubSignals?.scannedAt,
    usingResumeSkills: resumeSkills.length > 0,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

export function calculateJobMatches(studentProfile, jobs) {
  return jobs.map(job => ({ ...job, matchData: calculateMatchScore(studentProfile, job) }));
}

export function getRelevantJobs(studentProfile, jobs, minMatchScore = 30) {
  return calculateJobMatches(studentProfile, jobs)
    .filter(j =>
      j.matchData.score >= minMatchScore &&
      (j.current_applicants || 0) < (j.max_applicants || 50)
    )
    .sort((a, b) => b.matchData.score - a.matchData.score);
}

export function getSkillGapAnalysis(studentProfile, job) {
  const matchData = calculateMatchScore(studentProfile, job);
  if (matchData.missingSkills.length === 0) {
    return { currentScore: matchData.score, potentialScore: matchData.score, gap: 0, recommendations: [] };
  }

  let potentialSkillRaw = matchData.matchedSkills.reduce(
    (sum, s) => sum + (s.weight || (1 / (job.required_skills || []).length)), 0
  );
  matchData.missingSkills.forEach(s => { potentialSkillRaw += s.weight || 0; });

  const potentialScore = Math.min(
    Math.round(
      Math.min(potentialSkillRaw * 100, 100) * 0.40 +
      matchData.breakdown.projectRelevance +
      matchData.breakdown.githubActivity +
      matchData.breakdown.recency +
      matchData.breakdown.toolMatch
    ),
    100
  );

  return {
    currentScore: matchData.score,
    potentialScore,
    gap: potentialScore - matchData.score,
    recommendations: matchData.missingSkills
      .map(skill => ({
        name: skill.name,
        requiredLevel: skill.level || 3,
        impact: Math.round((skill.weight || 0.2) * 40),
        estimatedTime: (() => {
          const hours = { 1: 20, 2: 40, 3: 80, 4: 160, 5: 300 }[skill.level] || 80;
          const weeks = Math.ceil(hours / 10);
          return { hours, weeks, display: weeks <= 4 ? `${weeks}w` : `${Math.ceil(weeks / 4)}mo` };
        })(),
      }))
      .sort((a, b) => b.impact - a.impact),
  };
}

export function getAlternativeJobs(studentProfile, jobs, rejectedJobId, limit = 3) {
  return getRelevantJobs(studentProfile, jobs)
    .filter(j => j.id !== rejectedJobId)
    .slice(0, limit);
}
