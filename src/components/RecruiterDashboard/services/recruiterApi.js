import { supabase, getCurrentUser } from '../../../services/supabase';

function cleanPatch(patch, { drop = [] } = {}) {
  const out = {};
  for (const [k, v] of Object.entries(patch)) {
    if (drop.includes(k)) continue;
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    out[k] = v;
  }
  return out;
}

export async function getRecruiterProfile() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('recruiters')
    .select('*, startups(*)')
    .eq('auth_id', user.id)
    .maybeSingle();
  if (error) throw new Error(error.message || 'Failed to load recruiter');
  return data;
}

export async function getRecruiterJobs(recruiterId) {
  const { data, error } = await supabase
    .from('jobs').select('*').eq('recruiter_id', recruiterId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createJob(jobData) {
  const safe = Object.fromEntries(
    Object.entries(jobData).filter(([k, v]) => v !== undefined && v !== null)
  );
  const { data, error } = await supabase.from('jobs').insert([safe]).select().single();
  if (error) {
    if (error.message?.includes("logo_url") || error.message?.includes("schema cache")) {
      const { logo_url: _dropped, ...safeWithoutLogo } = safe;
      const { data: d2, error: e2 } = await supabase.from('jobs').insert([safeWithoutLogo]).select().single();
      if (e2) throw new Error(e2.message || 'Failed to create job');
      return d2;
    }
    throw new Error(error.message || 'Failed to create job');
  }
  return data;
}

export async function updateJob(jobId, patch) {
  const safe = cleanPatch(patch);
  const { data, error } = await supabase.from('jobs').update(safe).eq('id', jobId).select().single();
  if (error) {
    if (error.message?.includes("logo_url") || error.message?.includes("schema cache")) {
      const { logo_url: _dropped, ...safeWithoutLogo } = safe;
      const { data: d2, error: e2 } = await supabase.from('jobs').update(safeWithoutLogo).eq('id', jobId).select().single();
      if (e2) throw new Error(e2.message || 'Update failed');
      return d2;
    }
    throw new Error(error.message || 'Update failed');
  }
  return data;
}

export async function deleteJob(jobId) {
  const { error } = await supabase.from('jobs').delete().eq('id', jobId);
  if (error) throw error;
}

export async function getJobApplications(jobId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, students(*)')
    .eq('job_id', jobId)
    .order('match_score', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAllApplicationsForRecruiter(recruiterId) {
  const { data: jobs, error: jobsErr } = await supabase
    .from('jobs').select('id, role, company').eq('recruiter_id', recruiterId);
  if (jobsErr) { console.warn('Jobs query failed:', jobsErr); return []; }
  if (!jobs?.length) return [];
  const jobIds = jobs.map(j => j.id);
  const jobLookup = Object.fromEntries(jobs.map(j => [j.id, j]));
  const { data: apps, error: appsErr } = await supabase
    .from('applications').select('*, students(*)').in('job_id', jobIds)
    .order('match_score', { ascending: false });
  if (appsErr) { console.warn('Applications query failed:', appsErr); return []; }
  return (apps || []).map(a => ({ ...a, jobs: jobLookup[a.job_id] }));
}

const NOTIF_META = {
  shortlisted: {
    type:  'success',
    title: (role, company) => `Shortlisted by ${company}`,
    body:  (role, company) => `You're in their top picks for ${role}.`,
  },
  interview: {
    type:  'alert',
    title: (role, company) => `Interview invite — ${company}`,
    body:  (role, company) => `${company} wants to interview you for ${role}.`,
  },
  hired: {
    type:  'success',
    title: (role, company) => `Offer from ${company} 🎉`,
    body:  (role, company) => `You received an offer for ${role}.`,
  },
  rejected: {
    type:  'info',
    title: (role, company) => `Application update — ${company}`,
    body:  (role, company) => `${company} has made a decision on your ${role} application.`,
  },
};

export async function updateApplicationStatus(appId, status, studentId, jobMeta = {}) {
  const patch = { status };
  if (status === 'shortlisted') patch.shortlisted_at = new Date().toISOString();
  if (status === 'interview')   patch.interviewed_at = new Date().toISOString();
  if (status === 'hired')       patch.hired_at       = new Date().toISOString();

  const { data, error } = await supabase
    .from('applications').update(patch).eq('id', appId).select().single();
  if (error) throw new Error(error.message || 'Status update failed');

  if (studentId && NOTIF_META[status]) {
    const nm = NOTIF_META[status];
    const { role = 'the role', company = 'a recruiter' } = jobMeta;
    try {
      await supabase.from('notifications').insert({
        student_id:     studentId,
        application_id: appId,
        type:           nm.type,
        title:          nm.title(role, company),
        body:           nm.body(role, company),
        read_by:        [],
        created_at:     new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Notification insert failed (non-fatal):', e);
    }
  }

  return data;
}

export async function updateStartupProfile(startupId, patch) {
  const safe = cleanPatch(patch);
  if (safe.founded_year !== undefined) {
    const n = parseInt(safe.founded_year, 10);
    if (Number.isNaN(n)) delete safe.founded_year;
    else safe.founded_year = n;
  }
  const { data, error } = await supabase
    .from('startups').update(safe).eq('id', startupId).select().single();
  if (error) throw new Error(error.message || 'Update failed');
  return data;
}

export async function updateRecruiterProfile(recruiterId, patch) {
  const safe = cleanPatch(patch, { drop: ['email'] });
  const { data, error } = await supabase
    .from('recruiters').update(safe).eq('id', recruiterId).select().single();
  if (error) throw new Error(error.message || 'Update failed');
  return data;
}
