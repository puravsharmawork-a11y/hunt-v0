// src/services/matching.js
// Match score calculation algorithm (rule-based v1)
// Hunt Score — global credibility score (separate from match %)

// ============================================================================
// HUNT SCORE — computed from real profile signals
// Grows over time, never resets (except friction penalties).
// Visible to recruiters. Skills-only; college never factors in.
//
// Formula (max 100 base + badges):
//   Profile completeness   20 pts
//   Skills (count + depth) 25 pts
//   GitHub activity        20 pts
//   Project quality        20 pts
//   Recency                10 pts
//   Tools                   5 pts
//   AI badge bonus         +3 flat  (future)
//   Friction penalty       -8/event (future)
// ============================================================================

export function calculateHuntScore(studentProfile) {
  if (!studentProfile) return { score: 0, breakdown: {}, level: 'unranked' };

  let profileScore   = 0;
  let skillScore     = 0;
  let githubScore    = 0;
  let projectScore   = 0;
  let recencyScore   = 0;
  let toolScore      = 0;
  const breakdown    = {};

  // ── 1. Profile completeness (max 20) ─────────────────────────────────────
  // Each meaningful field adds weight. College shown but not scored.
  let pc = 0;
  if (studentProfile.full_name)                              pc += 3;
  if (studentProfile.email)                                  pc += 2;
  if (studentProfile.bio && studentProfile.bio.length > 20) pc += 3;
  if (studentProfile.avatar_url)                             pc += 2;
  if (studentProfile.resume_url)                             pc += 4;
  if (studentProfile.linkedin_url)                           pc += 3;
  if ((studentProfile.preferred_roles || []).length > 0)     pc += 2;
  if (studentProfile.availability)                           pc += 1;
  profileScore = Math.min(pc, 20);
  breakdown.profileCompleteness = profileScore;

  // ── 2. Skills — count + declared depth (max 25) ──────────────────────────
  const skills = studentProfile.skills || [];
  if (skills.length > 0) {
    // Depth: avg proficiency level / 5 (0-1 normalised) × 15
    const avgDepth = skills.reduce((sum, s) => sum + (s.level || s.proficiency_level || 1), 0) / skills.length;
    const depthPts = (avgDepth / 5) * 15;
    // Breadth: log-scaled, 10+ skills = full 10 pts
    const breadthPts = Math.min((Math.log2(skills.length + 1) / Math.log2(11)) * 10, 10);
    skillScore = Math.round(depthPts + breadthPts);
  }
  breakdown.skills = Math.min(skillScore, 25);
  skillScore = breakdown.skills;

  // ── 3. GitHub activity (max 20) ──────────────────────────────────────────
  // What we can check from profile fields:
  //   github_url present           → base 8 pts
  //   Number of projects w/ github → up to 6 pts
  //   Commit count hint (profile)  → up to 6 pts (future: real API call)
  if (studentProfile.github_url) {
    githubScore += 8;

    const projects = studentProfile.projects || [];
    const projectsWithGithub = projects.filter(p => p.githubUrl || p.github_url || p.projectUrl?.includes('github'));
    githubScore += Math.min(projectsWithGithub.length * 2, 6);

    // If profile stores commit_count from GitHub OAuth import (future)
    if (studentProfile.github_commit_count) {
      const commitPts = Math.min(Math.log2(studentProfile.github_commit_count + 1) / Math.log2(501) * 6, 6);
      githubScore += Math.round(commitPts);
    }
  }
  breakdown.githubActivity = Math.min(githubScore, 20);
  githubScore = breakdown.githubActivity;

  // ── 4. Project quality (max 20) ──────────────────────────────────────────
  const projects = studentProfile.projects || [];
  if (projects.length > 0) {
    // Count: up to 3 projects give full count points
    const countPts = Math.min(projects.length * 3, 9);

    // Quality indicators per project
    let qualityPts = 0;
    projects.forEach(p => {
      if (p.githubUrl || p.github_url || (p.projectUrl || '').includes('github')) qualityPts += 2;
      if (p.projectUrl && !(p.projectUrl || '').includes('github'))               qualityPts += 2; // live demo
      if (p.description && p.description.length > 40)                             qualityPts += 1;
      if ((p.techStack || []).length >= 3)                                        qualityPts += 1;
    });

    projectScore = Math.round(countPts + Math.min(qualityPts, 11));
  }
  breakdown.projectQuality = Math.min(projectScore, 20);
  projectScore = breakdown.projectQuality;

  // ── 5. Recency (max 10) ──────────────────────────────────────────────────
  // Based on how recently profile was meaningfully updated / last project added.
  // Uses profile_updated_at or most recent project end date.
  let recencyMs = 0;
  const now = Date.now();

  const dateFields = [
    studentProfile.profile_updated_at,
    studentProfile.updated_at,
    ...(projects.map(p => p.endDate || p.end_date)).filter(Boolean),
  ].filter(Boolean).map(d => new Date(d).getTime()).filter(t => !isNaN(t));

  if (dateFields.length > 0) {
    const mostRecent = Math.max(...dateFields);
    recencyMs = now - mostRecent;
    const sixMonths = 1000 * 60 * 60 * 24 * 180;
    const oneYear   = sixMonths * 2;
    if (recencyMs < sixMonths)       recencyScore = 10;
    else if (recencyMs < oneYear)    recencyScore = 6;
    else                             recencyScore = 2;
  } else {
    recencyScore = 3; // default for brand-new profiles
  }
  breakdown.recency = recencyScore;

  // ── 6. Tools (max 5) ─────────────────────────────────────────────────────
  const tools = studentProfile.tools || [];
  toolScore = Math.min(tools.length, 5);
  breakdown.tools = toolScore;

  // ── 7. Verified-skill badge bonus (+3 flat) — future ─────────────────────
  const badgeBonus = (studentProfile.verified_skills_count || 0) > 0 ? 3 : 0;
  breakdown.badgeBonus = badgeBonus;

  // ── 8. Friction penalty (-8 per confirmed event) — future ────────────────
  const frictionPenalty = (studentProfile.friction_count || 0) * 8;
  breakdown.frictionPenalty = -frictionPenalty;

  // ── Final ─────────────────────────────────────────────────────────────────
  const raw = profileScore + skillScore + githubScore + projectScore + recencyScore + toolScore + badgeBonus - frictionPenalty;
  const score = Math.max(0, Math.min(raw, 100));

  const level =
    score >= 80 ? 'elite'    :
    score >= 60 ? 'strong'   :
    score >= 40 ? 'building' :
    score >= 20 ? 'starter'  : 'unranked';

  return { score, breakdown, level };
}

// ============================================================================
// MATCH SCORE — job-specific, changes per job, visible to candidate
// Weights: Skills 40% | Projects 25% | GitHub 20% | Recency 10% | Tools 5%
// ============================================================================

export function calculateMatchScore(studentProfile, job) {
  let matchedSkills  = [];
  let missingSkills  = [];

  // ── 1. Skill match (40%) ─────────────────────────────────────────────────
  const requiredSkills = job.required_skills || [];
  let rawSkillPct = 0;

  requiredSkills.forEach(reqSkill => {
    const studentSkill = (studentProfile.skills || []).find(s =>
      s.name?.toLowerCase() === reqSkill.name?.toLowerCase()
    );

    if (studentSkill) {
      const studentLevel = studentSkill.level || studentSkill.proficiency_level || 1;
      const levelMatch   = Math.min(studentLevel / (reqSkill.level || 3), 1);
      // Optional: verified skills get a small multiplier
      const verifiedBonus = studentSkill.verified ? 1.1 : 1.0;
      rawSkillPct += (reqSkill.weight || (1 / requiredSkills.length)) * levelMatch * verifiedBonus;
      matchedSkills.push({ ...reqSkill, studentLevel });
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const skillComponent = Math.min(rawSkillPct * 100, 100) * 0.40;

  // ── 2. Project relevance (25%) ───────────────────────────────────────────
  const projects = studentProfile.projects || [];
  let projectPct  = 0;

  if (projects.length > 0 && requiredSkills.length > 0) {
    projects.forEach(project => {
      const techStack = Array.isArray(project.techStack)
        ? project.techStack
        : (typeof project.techStack === 'string' ? project.techStack.split(',').map(t => t.trim()) : []);

      const overlap = techStack.filter(tech =>
        requiredSkills.some(s => s.name?.toLowerCase() === tech.toLowerCase())
      );
      projectPct += overlap.length / requiredSkills.length;
    });
    projectPct = Math.min(projectPct, 1); // cap at 100%
  }

  const projectComponent = projectPct * 100 * 0.25;

  // ── 3. GitHub activity (20%) ─────────────────────────────────────────────
  // Proxy: does candidate have a github_url + projects with github links?
  let githubPct = 0;
  if (studentProfile.github_url) {
    githubPct += 0.5;
    const withGithub = projects.filter(p => p.githubUrl || p.github_url || (p.projectUrl || '').includes('github'));
    githubPct += Math.min(withGithub.length / Math.max(projects.length, 1), 1) * 0.5;
  }
  const githubComponent = githubPct * 100 * 0.20;

  // ── 4. Recency (10%) ─────────────────────────────────────────────────────
  const huntData  = calculateHuntScore(studentProfile);
  const recencyPct = huntData.breakdown.recency / 10; // 0-1 from 0-10 pts
  const recencyComponent = recencyPct * 100 * 0.10;

  // ── 5. Tool match (5%) ───────────────────────────────────────────────────
  const requiredTools  = job.required_tools || [];
  const studentTools   = studentProfile.tools || [];
  let toolPct = 0;

  if (requiredTools.length > 0) {
    const matched = requiredTools.filter(t =>
      studentTools.some(st => st.toLowerCase() === t.toLowerCase())
    );
    toolPct = matched.length / requiredTools.length;
  } else {
    toolPct = studentTools.length > 0 ? 0.8 : 0.4; // no tools listed → neutral
  }
  const toolComponent = toolPct * 100 * 0.05;

  // ── Final ─────────────────────────────────────────────────────────────────
  const raw = skillComponent + projectComponent + githubComponent + recencyComponent + toolComponent;
  const finalScore = Math.min(Math.round(raw), 100);

  const competitionLevel =
    (job.current_applicants || 0) >= 40 ? 'High'   :
    (job.current_applicants || 0) >= 25 ? 'Medium' : 'Low';

  const minThreshold = job.minimum_match_threshold || 50;

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
    competitionLevel,
    canApply: finalScore >= minThreshold,
  };
}

// ============================================================================
// HELPER: batch-calculate matches for all jobs
// ============================================================================

export function calculateJobMatches(studentProfile, jobs) {
  return jobs.map(job => ({
    ...job,
    matchData: calculateMatchScore(studentProfile, job),
  }));
}

// ============================================================================
// HELPER: filter + sort by match
// ============================================================================

export function getRelevantJobs(studentProfile, jobs, minMatchScore = 50) {
  return calculateJobMatches(studentProfile, jobs)
    .filter(j => j.matchData.score >= minMatchScore && (j.current_applicants || 0) < (j.max_applicants || 50))
    .sort((a, b) => b.matchData.score - a.matchData.score);
}

// ============================================================================
// HELPER: skill gap analysis
// ============================================================================

export function getSkillGapAnalysis(studentProfile, job) {
  const matchData = calculateMatchScore(studentProfile, job);

  if (matchData.missingSkills.length === 0) {
    return { currentScore: matchData.score, potentialScore: matchData.score, gap: 0, recommendations: [] };
  }

  let potentialSkillRaw = matchData.matchedSkills.reduce((sum, s) =>
    sum + (s.weight || (1 / (job.required_skills || []).length)), 0
  );
  matchData.missingSkills.forEach(s => { potentialSkillRaw += s.weight || 0; });
  const potentialSkillComponent = Math.min(potentialSkillRaw * 100, 100) * 0.40;

  const potentialScore = Math.min(
    Math.round(potentialSkillComponent + matchData.breakdown.projectRelevance + matchData.breakdown.githubActivity + matchData.breakdown.recency + matchData.breakdown.toolMatch),
    100
  );

  const recommendations = matchData.missingSkills
    .map(skill => ({
      name:          skill.name,
      requiredLevel: skill.level || 3,
      impact:        Math.round((skill.weight || 0.2) * 40),
      estimatedTime: _estimateLearningTime(skill.name, skill.level || 3),
    }))
    .sort((a, b) => b.impact - a.impact);

  return {
    currentScore:   matchData.score,
    potentialScore,
    gap:            potentialScore - matchData.score,
    recommendations,
  };
}

function _estimateLearningTime(skillName, level) {
  const hours  = { 1: 20, 2: 40, 3: 80, 4: 160, 5: 300 }[level] || 80;
  const weeks  = Math.ceil(hours / 10);
  return {
    hours,
    weeks,
    display: weeks <= 4 ? `${weeks}w` : `${Math.ceil(weeks / 4)}mo`,
  };
}

// ============================================================================
// HELPER: alternative jobs when blocked
// ============================================================================

export function getAlternativeJobs(studentProfile, jobs, rejectedJobId, limit = 3) {
  return getRelevantJobs(studentProfile, jobs)
    .filter(j => j.id !== rejectedJobId)
    .slice(0, limit);
}
