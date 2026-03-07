// src/services/matching.js
// Match score calculation algorithm (rule-based v1)

// ============================================================================
// MAIN MATCHING FUNCTION
// ============================================================================

export function calculateMatchScore(studentProfile, job) {
  let requiredSkillMatch = 0;
  let matchedSkills = [];
  let missingSkills = [];
  
  // 1. Required Skill Match (40%)
  const requiredSkills = job.required_skills || [];
  
  requiredSkills.forEach(reqSkill => {
    const studentSkill = (studentProfile.skills || []).find(s => 
      s.name.toLowerCase() === reqSkill.name.toLowerCase()
    );
    
    if (studentSkill) {
      const levelMatch = Math.min(studentSkill.level / reqSkill.level, 1);
      requiredSkillMatch += reqSkill.weight * levelMatch;
      matchedSkills.push({ 
        ...reqSkill, 
        studentLevel: studentSkill.level 
      });
    } else {
      missingSkills.push(reqSkill);
    }
  });
  
  requiredSkillMatch = requiredSkillMatch * 100; // Convert to 0-100 scale
  
  // 2. Project Relevance (25%)
  let projectScore = 0;
  const projects = studentProfile.projects || [];
  
  if (projects.length > 0) {
    projects.forEach(project => {
      const projectTech = Array.isArray(project.techStack) 
        ? project.techStack 
        : (typeof project.techStack === 'string' ? project.techStack.split(',') : []);
      
      const relevantTech = projectTech.filter(tech =>
        requiredSkills.some(skill => 
          skill.name.toLowerCase() === tech.trim().toLowerCase()
        )
      );
      
      if (requiredSkills.length > 0) {
        projectScore += (relevantTech.length / requiredSkills.length) * 25;
      }
    });
    projectScore = Math.min(projectScore, 25);
  }
  
  // 3. Experience Fit (15%)
  const experienceScore = 15; // Simplified: all students are 3rd/4th year
  
  // 4. Consistency Score (10%) - Profile completeness
  const profileCompleteness = studentProfile.profile_completeness || 0;
  const consistencyScore = (profileCompleteness / 100) * 10;
  
  // 5. Tool Match (10%)
  let toolScore = 0;
  const studentTools = studentProfile.tools || [];
  const requiredTools = job.required_tools || [];
  
  if (requiredTools.length > 0) {
    requiredTools.forEach(tool => {
      if (studentTools.some(t => t.toLowerCase() === tool.toLowerCase())) {
        toolScore += (1 / requiredTools.length) * 10;
      }
    });
  }
  
  // Calculate final score
  const finalScore = Math.round(
    requiredSkillMatch * 0.4 +
    projectScore +
    experienceScore +
    consistencyScore +
    toolScore
  );
  
  // Competition level calculation
  const currentApplicants = job.current_applicants || 0;
  const maxApplicants = job.max_applicants || 50;
  const competitionLevel = currentApplicants >= 40 ? "High" :
                          currentApplicants >= 25 ? "Medium" : "Low";
  
  return {
    score: Math.min(finalScore, 100),
    breakdown: {
      requiredSkillMatch: Math.round(requiredSkillMatch * 0.4),
      projectRelevance: Math.round(projectScore),
      experienceFit: experienceScore,
      consistencyScore: Math.round(consistencyScore),
      toolMatch: Math.round(toolScore)
    },
    matchedSkills,
    missingSkills,
    competitionLevel,
    canApply: finalScore >= (job.minimum_match_threshold || 50)
  };
}

// ============================================================================
// HELPER: CALCULATE MATCHES FOR ALL JOBS
// ============================================================================

export function calculateJobMatches(studentProfile, jobs) {
  return jobs.map(job => ({
    ...job,
    matchData: calculateMatchScore(studentProfile, job)
  }));
}

// ============================================================================
// HELPER: FILTER & SORT JOBS BY MATCH
// ============================================================================

export function getRelevantJobs(studentProfile, jobs, minMatchScore = 50) {
  const jobsWithScores = calculateJobMatches(studentProfile, jobs);
  
  // Filter by minimum match score
  const relevantJobs = jobsWithScores.filter(job => 
    job.matchData.score >= minMatchScore && 
    job.current_applicants < job.max_applicants
  );
  
  // Sort by match score (highest first)
  relevantJobs.sort((a, b) => b.matchData.score - a.matchData.score);
  
  return relevantJobs;
}

// ============================================================================
// HELPER: GET SKILL GAP ANALYSIS
// ============================================================================

export function getSkillGapAnalysis(studentProfile, job) {
  const matchData = calculateMatchScore(studentProfile, job);
  
  if (matchData.missingSkills.length === 0) {
    return {
      currentScore: matchData.score,
      potentialScore: matchData.score,
      gap: 0,
      recommendations: []
    };
  }
  
  // Calculate potential score if they learned missing skills
  let potentialSkillMatch = matchData.breakdown.requiredSkillMatch / 0.4; // Reverse the 40% weight
  
  matchData.missingSkills.forEach(skill => {
    potentialSkillMatch += skill.weight * 100;
  });
  
  potentialSkillMatch = Math.min(potentialSkillMatch, 100);
  
  const potentialScore = Math.round(
    potentialSkillMatch * 0.4 +
    matchData.breakdown.projectRelevance +
    matchData.breakdown.experienceFit +
    matchData.breakdown.consistencyScore +
    matchData.breakdown.toolMatch
  );
  
  // Sort skills by impact
  const recommendations = matchData.missingSkills
    .map(skill => ({
      name: skill.name,
      requiredLevel: skill.level,
      impact: Math.round(skill.weight * 40), // Impact on final score
      estimatedTime: estimateLearningTime(skill.name, skill.level)
    }))
    .sort((a, b) => b.impact - a.impact);
  
  return {
    currentScore: matchData.score,
    potentialScore: Math.min(potentialScore, 100),
    gap: Math.min(potentialScore, 100) - matchData.score,
    recommendations
  };
}

// ============================================================================
// HELPER: ESTIMATE LEARNING TIME
// ============================================================================

function estimateLearningTime(skillName, level) {
  const baseHours = {
    1: 20,   // Beginner: 20 hours
    2: 40,   // Elementary: 40 hours
    3: 80,   // Intermediate: 80 hours
    4: 160,  // Advanced: 160 hours
    5: 300   // Expert: 300 hours
  };
  
  const hours = baseHours[level] || 80;
  const weeks = Math.ceil(hours / 10); // Assuming 10 hours/week study
  
  return {
    hours,
    weeks,
    display: weeks <= 4 ? `${weeks} weeks` : `${Math.ceil(weeks / 4)} months`
  };
}

// ============================================================================
// HELPER: GET ALTERNATIVE JOBS
// ============================================================================

export function getAlternativeJobs(studentProfile, jobs, rejectedJobId, limit = 3) {
  const relevantJobs = getRelevantJobs(studentProfile, jobs);
  
  // Filter out the rejected job
  const alternatives = relevantJobs.filter(job => job.id !== rejectedJobId);
  
  // Return top alternatives
  return alternatives.slice(0, limit);
}
