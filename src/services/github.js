// src/services/github.js
// GitHub profile import functionality

// ============================================================================
// MAIN IMPORT FUNCTION
// ============================================================================

export async function importFromGitHub(username) {
  try {
    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    
    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        throw new Error('GitHub user not found. Check the username and try again.');
      }
      throw new Error('Failed to fetch GitHub profile');
    }
    
    const userData = await userResponse.json();
    
    // Fetch repositories
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`
    );
    
    if (!reposResponse.ok) {
      throw new Error('Failed to fetch repositories');
    }
    
    const repos = await reposResponse.json();
    
    // Extract languages/skills from repos
    const languages = new Set();
    repos.forEach(repo => {
      if (repo.language) languages.add(repo.language);
    });
    
    // Map languages to skills with default levels
    const skills = Array.from(languages)
      .map(lang => mapLanguageToSkill(lang))
      .filter(Boolean); // Remove nulls
    
    // Extract projects
    const projects = repos.slice(0, 5).map(repo => ({
      name: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
      description: repo.description || 'No description provided',
      techStack: repo.language ? [repo.language] : [],
      link: repo.html_url,
      relevance: repo.description || ''
    }));
    
    // Extract tools
    const tools = Array.from(languages).slice(0, 6);
    
    return {
      success: true,
      data: {
        name: userData.name || username,
        bio: userData.bio,
        githubUrl: userData.html_url,
        skills,
        projects,
        tools
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// LANGUAGE TO SKILL MAPPING
// ============================================================================

function mapLanguageToSkill(language) {
  const skillMap = {
    // Frontend
    'JavaScript': { name: 'JavaScript', level: 3, category: 'frontend' },
    'TypeScript': { name: 'TypeScript', level: 3, category: 'frontend' },
    'HTML': { name: 'HTML', level: 4, category: 'frontend' },
    'CSS': { name: 'CSS', level: 4, category: 'frontend' },
    'Vue': { name: 'Vue.js', level: 3, category: 'frontend' },
    'Svelte': { name: 'Svelte', level: 3, category: 'frontend' },
    
    // Backend
    'Python': { name: 'Python', level: 3, category: 'language' },
    'Java': { name: 'Java', level: 3, category: 'language' },
    'Go': { name: 'Go', level: 3, category: 'language' },
    'Rust': { name: 'Rust', level: 3, category: 'language' },
    'C': { name: 'C', level: 3, category: 'language' },
    'C++': { name: 'C++', level: 3, category: 'language' },
    'C#': { name: 'C#', level: 3, category: 'language' },
    'Ruby': { name: 'Ruby', level: 3, category: 'language' },
    'PHP': { name: 'PHP', level: 3, category: 'language' },
    'Swift': { name: 'Swift', level: 3, category: 'language' },
    'Kotlin': { name: 'Kotlin', level: 3, category: 'language' },
    
    // Mobile
    'Dart': { name: 'Flutter', level: 3, category: 'mobile' },
    
    // Data/ML
    'R': { name: 'R', level: 3, category: 'data' },
    'Julia': { name: 'Julia', level: 3, category: 'data' },
    
    // Other
    'Shell': { name: 'Bash/Shell', level: 2, category: 'tools' },
    'Dockerfile': { name: 'Docker', level: 2, category: 'devops' },
  };
  
  return skillMap[language] || null;
}

// ============================================================================
// DETECT FRAMEWORKS FROM REPO
// ============================================================================

export async function detectFrameworks(username, repos) {
  // This is a simplified version
  // In production, you'd fetch package.json, requirements.txt, etc.
  
  const frameworks = new Set();
  
  repos.forEach(repo => {
    // Check repo name and description for framework keywords
    const text = (repo.name + ' ' + repo.description).toLowerCase();
    
    if (text.includes('react')) frameworks.add('React');
    if (text.includes('next')) frameworks.add('Next.js');
    if (text.includes('vue')) frameworks.add('Vue.js');
    if (text.includes('angular')) frameworks.add('Angular');
    if (text.includes('svelte')) frameworks.add('Svelte');
    if (text.includes('django')) frameworks.add('Django');
    if (text.includes('flask')) frameworks.add('Flask');
    if (text.includes('express')) frameworks.add('Express');
    if (text.includes('spring')) frameworks.add('Spring Boot');
    if (text.includes('laravel')) frameworks.add('Laravel');
    if (text.includes('rails')) frameworks.add('Ruby on Rails');
  });
  
  return Array.from(frameworks);
}

// ============================================================================
// VALIDATE GITHUB USERNAME
// ============================================================================

export function isValidGitHubUsername(username) {
  // GitHub username rules:
  // - Only alphanumeric characters and hyphens
  // - Cannot start or end with hyphen
  // - Cannot have consecutive hyphens
  // - Max 39 characters
  
  const regex = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/i;
  return regex.test(username);
}

// ============================================================================
// GET GITHUB STATS
// ============================================================================

export async function getGitHubStats(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch GitHub stats');
    }
    
    const data = await response.json();
    
    return {
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
      createdAt: data.created_at,
      bio: data.bio,
      location: data.location,
      blog: data.blog,
      company: data.company
    };
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return null;
  }
}
