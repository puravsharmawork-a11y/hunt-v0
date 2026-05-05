// src/services/githubService.js
// Single GitHub service — replaces src/services/github.js entirely.
//
// Update StudentOnboarding.jsx import from:
//   import { importFromGitHub, isValidGitHubUsername } from '../services/github';
// To:
//   import { importFromGitHub, isValidGitHubUsername } from '../services/githubService';
//
// Everything else in StudentOnboarding stays exactly the same.
// The two new functions (refreshGitHubSignals, scoreGitHubSignals) are used
// by huntScoreService.js and matching.js — onboarding never calls them directly.

import { supabase } from './supabase';

const GH_BASE = 'https://api.github.com';

// Optional: add VITE_GITHUB_TOKEN to .env.local for 5000 req/hr instead of 60
function ghHeaders() {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const h = { Accept: 'application/vnd.github+json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function ghFetch(path) {
  const res = await fetch(`${GH_BASE}${path}`, { headers: ghHeaders() });
  if (res.status === 404) return null;
  if (res.status === 403) {
    const reset = res.headers.get('X-RateLimit-Reset');
    const t = reset ? new Date(reset * 1000).toLocaleTimeString() : 'soon';
    throw new Error(`GitHub rate limit hit. Resets at ${t}. Add VITE_GITHUB_TOKEN to .env.local.`);
  }
  if (!res.ok) throw new Error(`GitHub API ${res.status} on ${path}`);
  return res.json();
}

// ─── Extract username from any GitHub URL format ─────────────────────────────
// Handles: https://github.com/VikramS04  /  github.com/VikramS04  /  VikramS04
export function extractGitHubUsername(input) {
  if (!input) return null;
  const clean = input.trim().replace(/\/$/, '');
  if (!clean.includes('/')) return clean; // already a bare username
  const parts = clean.split('/').filter(Boolean);
  const ghIdx = parts.findIndex(p => p.toLowerCase().includes('github'));
  if (ghIdx !== -1 && parts[ghIdx + 1]) return parts[ghIdx + 1];
  return parts[parts.length - 1] || null;
}

// ─── Validate GitHub username ─────────────────────────────────────────────────
// Kept for drop-in compatibility with StudentOnboarding
export function isValidGitHubUsername(username) {
  const regex = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/i;
  return regex.test(username);
}

// ─── Language → HUNT skill mapping ───────────────────────────────────────────
const LANGUAGE_SKILL_MAP = {
  'JavaScript':  { name: 'JavaScript',  level: 3, category: 'Language' },
  'TypeScript':  { name: 'TypeScript',  level: 3, category: 'Language' },
  'Python':      { name: 'Python',      level: 3, category: 'Language' },
  'Java':        { name: 'Java',        level: 3, category: 'Language' },
  'Go':          { name: 'Golang',      level: 3, category: 'Language' },
  'Rust':        { name: 'Rust',        level: 3, category: 'Language' },
  'C':           { name: 'C / C++',     level: 3, category: 'Language' },
  'C++':         { name: 'C / C++',     level: 3, category: 'Language' },
  'C#':          { name: 'C#',          level: 3, category: 'Language' },
  'Ruby':        { name: 'Ruby',        level: 3, category: 'Language' },
  'PHP':         { name: 'PHP',         level: 3, category: 'Language' },
  'Swift':       { name: 'Swift',       level: 3, category: 'Mobile' },
  'Kotlin':      { name: 'Kotlin',      level: 3, category: 'Mobile' },
  'Dart':        { name: 'Flutter',     level: 3, category: 'Mobile' },
  'HTML':        { name: 'HTML',        level: 4, category: 'Frontend' },
  'CSS':         { name: 'CSS',         level: 3, category: 'Frontend' },
  'Vue':         { name: 'Vue.js',      level: 3, category: 'Frontend' },
  'Svelte':      { name: 'Svelte',      level: 3, category: 'Frontend' },
  'R':           { name: 'R',           level: 3, category: 'Data Science' },
  'Julia':       { name: 'Julia',       level: 3, category: 'Data Science' },
  'Shell':       { name: 'Bash/Shell',  level: 2, category: 'DevOps' },
  'Dockerfile':  { name: 'Docker',      level: 2, category: 'DevOps' },
};

// Detect frameworks from repo name/description text
function detectFrameworksFromText(text) {
  const t = text.toLowerCase();
  const frameworks = [];
  if (t.includes('react') && !t.includes('react native')) frameworks.push('React');
  if (t.includes('react native'))  frameworks.push('React Native');
  if (t.includes('next'))          frameworks.push('Next.js');
  if (t.includes('vue'))           frameworks.push('Vue.js');
  if (t.includes('angular'))       frameworks.push('AngularJS');
  if (t.includes('svelte'))        frameworks.push('Svelte');
  if (t.includes('django'))        frameworks.push('Django');
  if (t.includes('flask'))         frameworks.push('Flask');
  if (t.includes('fastapi'))       frameworks.push('FastAPI');
  if (t.includes('express'))       frameworks.push('Express.js');
  if (t.includes('spring'))        frameworks.push('Spring Boot');
  if (t.includes('node'))          frameworks.push('Node.js');
  if (t.includes('flutter'))       frameworks.push('Flutter');
  if (t.includes('tensorflow'))    frameworks.push('TensorFlow');
  if (t.includes('pytorch'))       frameworks.push('PyTorch');
  if (t.includes('pandas'))        frameworks.push('Pandas');
  if (t.includes('machine learning') || t.includes('ml ')) frameworks.push('Machine Learning');
  if (t.includes('mongodb'))       frameworks.push('MongoDB');
  if (t.includes('postgres'))      frameworks.push('PostgreSQL');
  if (t.includes('mysql'))         frameworks.push('MySQL');
  if (t.includes('firebase'))      frameworks.push('Firebase');
  if (t.includes('docker'))        frameworks.push('Docker');
  if (t.includes('kubernetes'))    frameworks.push('Kubernetes');
  return [...new Set(frameworks)];
}

// ─── Fetch README for a repo ──────────────────────────────────────────────────
async function fetchReadme(username, repoName) {
  try {
    const data = await ghFetch(`/repos/${username}/${repoName}/readme`);
    if (!data?.content) return '';
    return atob(data.content.replace(/\n/g, ''));
  } catch {
    return '';
  }
}

// ─── Fetch commit activity (weekly breakdown last 52 weeks) ──────────────────
async function fetchCommitActivity(username, repoName) {
  try {
    const data = await ghFetch(`/repos/${username}/${repoName}/stats/commit_activity`);
    if (!Array.isArray(data)) return { last90d: 0, prev90d: 0 };
    const recent = data.slice(-13).reduce((s, w) => s + (w.total || 0), 0);
    const prev   = data.slice(-26, -13).reduce((s, w) => s + (w.total || 0), 0);
    return { last90d: recent, prev90d: prev };
  } catch {
    return { last90d: 0, prev90d: 0 };
  }
}

// ============================================================================
// importFromGitHub — DROP-IN REPLACEMENT for the old github.js function
// Called in StudentOnboarding Step 3 "Import from GitHub" button.
//
// Old return shape (what onboarding uses):
//   { success: true, data: { name, bio, githubUrl, skills, projects, tools } }
//
// New: same shape + saves github_signals to Supabase in the background
// so Hunt Score has real data from day one without a separate scan step.
// ============================================================================
export async function importFromGitHub(usernameOrUrl) {
  try {
    const username = extractGitHubUsername(usernameOrUrl) || usernameOrUrl;
    if (!username) throw new Error('Invalid GitHub username');

    // 1. User profile
    const userData = await ghFetch(`/users/${username}`);
    if (!userData) throw new Error('GitHub user not found. Check the username and try again.');

    // 2. Repos (sorted by recently pushed, max 20, own repos only)
    const allRepos = await ghFetch(
      `/users/${username}/repos?sort=pushed&direction=desc&per_page=20&type=public`
    );
    if (!Array.isArray(allRepos)) throw new Error('Failed to fetch repositories');

    const repos = allRepos.filter(r => !r.fork);

    // 3. Process repos — extract skills, projects, signals
    const languageSet   = new Set();
    const frameworkSet  = new Set();
    const repoSignals   = [];
    let totalCommits90d     = 0;
    let totalCommitsPrev90d = 0;

    for (const repo of repos.slice(0, 20)) {
      if (repo.language) languageSet.add(repo.language);

      // Detect frameworks from name + description
      const repoText = `${repo.name} ${repo.description || ''}`;
      detectFrameworksFromText(repoText).forEach(f => frameworkSet.add(f));

      // Commit activity
      const activity = await fetchCommitActivity(username, repo.name);
      totalCommits90d     += activity.last90d;
      totalCommitsPrev90d += activity.prev90d;

      // README (first 600 chars is enough for framework detection)
      const readme = await fetchReadme(username, repo.name);

      // Also detect frameworks from README
      detectFrameworksFromText(readme).forEach(f => frameworkSet.add(f));

      repoSignals.push({
        name:          repo.name,
        description:   repo.description || '',
        stars:         repo.stargazers_count || 0,
        forks:         repo.forks_count || 0,
        language:      repo.language || null,
        topics:        repo.topics || [],
        lastPushed:    repo.pushed_at,
        createdAt:     repo.created_at,
        hasTests:      /test|jest|pytest|spec|vitest/i.test(readme),
        hasCI:         /github.actions|\.github\/workflows|ci\/cd|travis|circleci/i.test(readme),
        readmeLength:  readme.length,
        readmePreview: readme.slice(0, 600),
        commitActivity: activity,
        url:           repo.html_url,
      });
    }

    // 4. Build HUNT-format skills from languages
    const langSkills = Array.from(languageSet)
      .map(lang => LANGUAGE_SKILL_MAP[lang])
      .filter(Boolean);

    // 5. Build HUNT-format skills from detected frameworks
    const frameworkSkills = Array.from(frameworkSet)
      .filter(f => !langSkills.some(s => s.name.toLowerCase() === f.toLowerCase()))
      .map(f => ({ name: f, level: 3, category: guessCategory(f) }));

    const skills = [...langSkills, ...frameworkSkills];

    // 6. Build projects (top 5 non-forked repos)
    const projects = repos.slice(0, 5).map(repo => ({
      name:        repo.name.replace(/[-_]/g, ' '),
      description: repo.description || 'No description provided',
      techStack:   repo.language ? [repo.language] : [],
      link:        repo.html_url,
      githubUrl:   repo.html_url,
      projectUrl:  repo.homepage || '',
      relevance:   repo.description || '',
    }));

    // 7. Build github_signals object for Hunt Score
    const languages = Array.from(languageSet);
    const velocity  = totalCommitsPrev90d > 0
      ? totalCommits90d / totalCommitsPrev90d
      : totalCommits90d > 0 ? 2.0 : 0;

    const githubSignals = {
      username,
      scannedAt:            new Date().toISOString(),
      publicRepos:          userData.public_repos || 0,
      followers:            userData.followers || 0,
      accountAgeDays:       Math.floor(
        (Date.now() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24)
      ),
      totalStars:           repoSignals.reduce((s, r) => s + r.stars, 0),
      totalForks:           repoSignals.reduce((s, r) => s + r.forks, 0),
      commits90d:           totalCommits90d,
      commitsPrev90d:       totalCommitsPrev90d,
      velocity,
      languages,
      repos:                repoSignals,
      repoCount:            repoSignals.length,
      hasMultipleLanguages: languages.length >= 2,
      hasStarredProjects:   repoSignals.some(r => r.stars > 0),
      hasRecentActivity:    repoSignals.some(r => {
        const days = (Date.now() - new Date(r.lastPushed)) / (1000 * 60 * 60 * 24);
        return days < 90;
      }),
      avgReadmeLength: repoSignals.length > 0
        ? Math.round(repoSignals.reduce((s, r) => s + r.readmeLength, 0) / repoSignals.length)
        : 0,
      reposWithTests: repoSignals.filter(r => r.hasTests).length,
      reposWithCI:    repoSignals.filter(r => r.hasCI).length,
    };

    // 8. Save github_signals to Supabase in background (don't await — don't block UI)
    // If the user isn't signed in yet during onboarding, this will silently fail — that's fine.
    // The profile save in handleSubmit will include github_url, and the dashboard
    // will trigger a refresh on first load.
    _saveGitHubSignalsBackground(githubSignals);

    // 9. Return the exact same shape as the old github.js importFromGitHub
    return {
      success: true,
      data: {
        name:      userData.name || username,
        bio:       userData.bio  || '',
        githubUrl: userData.html_url,
        skills,
        projects,
        tools: Array.from(languageSet).slice(0, 6),
        // Extra data available for anyone who wants it (onboarding ignores these)
        _githubSignals: githubSignals,
        _frameworks:    Array.from(frameworkSet),
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Save signals in background — fires and forgets
async function _saveGitHubSignalsBackground(signals) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // not signed in yet — skip
    await supabase
      .from('students')
      .update({ github_signals: signals })
      .eq('auth_id', user.id);
  } catch {
    // Silent fail — will be retried by refreshGitHubSignals from dashboard
  }
}

// ============================================================================
// refreshGitHubSignals — called from dashboard / profile tab
// Re-scans GitHub and updates stored signals. Skips if scanned < 6 hours ago.
// ============================================================================
export async function refreshGitHubSignals(studentProfile) {
  if (!studentProfile?.github_url) throw new Error('No GitHub URL on profile');

  const existing = studentProfile.github_signals;
  if (existing?.scannedAt) {
    const hoursSince = (Date.now() - new Date(existing.scannedAt)) / (1000 * 60 * 60);
    if (hoursSince < 6) return existing; // cached — don't burn rate limit
  }

  // Re-use importFromGitHub which does the full deep scan
  const result = await importFromGitHub(studentProfile.github_url);
  if (!result.success) throw new Error(result.error);

  const signals = result.data._githubSignals;

  // Explicitly save (importFromGitHub's background save may have failed)
  const { data, error } = await supabase
    .from('students')
    .update({ github_signals: signals })
    .eq('auth_id', studentProfile.auth_id)
    .select('id, github_signals')
    .single();

  if (error) throw error;
  return signals;
}

// ============================================================================
// scoreGitHubSignals — pure function, no API calls
// Reads stored github_signals → returns 0-20 score for Hunt Score formula
// ============================================================================
export function scoreGitHubSignals(githubSignals) {
  if (!githubSignals?.scannedAt) return 0;

  let score = 0;
  const s = githubSignals;

  // Account exists + scanned: base 4 pts
  score += 4;

  // Commit activity last 90d (up to 6 pts)
  if (s.commits90d >= 100)     score += 6;
  else if (s.commits90d >= 30) score += 4;
  else if (s.commits90d >= 10) score += 2;
  else if (s.commits90d >= 1)  score += 1;

  // Velocity bonus — growing activity (up to 2 pts)
  if (s.velocity > 1.5)        score += 2;
  else if (s.velocity > 1.0)   score += 1;

  // Project quality signals (up to 5 pts)
  if (s.hasStarredProjects)    score += 1;
  if (s.reposWithTests > 0)    score += 1;
  if (s.reposWithCI > 0)       score += 1;
  if (s.avgReadmeLength > 300) score += 1;
  if (s.hasMultipleLanguages)  score += 1;

  // Recency (up to 3 pts)
  if (s.hasRecentActivity)     score += 3;

  return Math.min(score, 20);
}

// ============================================================================
// detectFrameworks — kept for backward compat (used nowhere currently but
// exported from old github.js so keeping it avoids any stray import errors)
// ============================================================================
export async function detectFrameworks(username, repos) {
  const frameworks = new Set();
  repos.forEach(repo => {
    detectFrameworksFromText(`${repo.name} ${repo.description || ''}`).forEach(f => frameworks.add(f));
  });
  return Array.from(frameworks);
}

// ============================================================================
// getGitHubStats — kept for backward compat
// ============================================================================
export async function getGitHubStats(username) {
  try {
    const data = await ghFetch(`/users/${username}`);
    if (!data) return null;
    return {
      publicRepos: data.public_repos,
      followers:   data.followers,
      following:   data.following,
      createdAt:   data.created_at,
      bio:         data.bio,
      location:    data.location,
      blog:        data.blog,
      company:     data.company,
    };
  } catch {
    return null;
  }
}

// ─── Internal: guess HUNT skill category from framework name ─────────────────
function guessCategory(name) {
  const n = name.toLowerCase();
  if (/react|next|vue|angular|svelte|tailwind|css|html/.test(n))           return 'Frontend';
  if (/node|express|django|flask|fastapi|spring|rails|laravel/.test(n))    return 'Backend';
  if (/mongo|postgres|mysql|firebase|redis|sqlite/.test(n))                return 'Database';
  if (/tensorflow|pytorch|pandas|sklearn|scikit|ml|machine/.test(n))       return 'Data Science';
  if (/docker|kubernetes|aws|gcp|azure|ci|cd|linux/.test(n))               return 'DevOps';
  if (/flutter|react native|android|ios|swift|kotlin/.test(n))             return 'Mobile';
  return 'Tools';
}
