// src/services/airtable.js
// Airtable webhook for tracking applications

const AIRTABLE_WEBHOOK_URL = import.meta.env.VITE_AIRTABLE_WEBHOOK;

// ============================================================================
// SEND APPLICATION TO AIRTABLE
// ============================================================================

export async function sendToAirtable(applicationData) {
  if (!AIRTABLE_WEBHOOK_URL) {
    console.warn('Airtable webhook URL not configured');
    return { success: false, error: 'Webhook not configured' };
  }

  try {
    const response = await fetch('/api/airtable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentName: applicationData.studentName,
        email: applicationData.email,
        phone: applicationData.phone || '',
        jobTitle: applicationData.jobTitle,
        company: applicationData.company,
        matchScore: applicationData.matchScore,
        appliedDate: new Date().toISOString(),
        status: 'New',
        profileUrl: applicationData.profileUrl || '',
        resumeUrl: applicationData.resumeUrl || '',
        githubUrl: applicationData.githubUrl || '',
        linkedinUrl: applicationData.linkedinUrl || '',
        skills: applicationData.skills?.join(', ') || '',
        notes: `Match breakdown: ${JSON.stringify(applicationData.matchBreakdown || {})}`
      }),
    });

    if (!response.ok) {
      throw new Error(`Airtable webhook failed: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending to Airtable:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// PREPARE APPLICATION DATA
// ============================================================================

export function prepareApplicationData(student, job, matchScore, matchBreakdown) {
  return {
    studentName: student.full_name,
    email: student.email,
    phone: student.phone,
    jobTitle: job.role,
    company: job.company,
    matchScore: matchScore,
    matchBreakdown: matchBreakdown,
    profileUrl: '', // You could add a profile page URL here
    resumeUrl: student.resume_url,
    githubUrl: student.github_url,
    linkedinUrl: student.linkedin_url,
    skills: student.skills?.map(s => s.name) || [],
  };
}
