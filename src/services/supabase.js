// src/services/supabase.js
// Supabase client configuration and authentication helpers

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables! Check your .env.local file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/onboarding`,
    },
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Update the user's auth email (sends confirmation link to new address)
export const updateUserEmail = async (newEmail) => {
  const { data, error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw error;
  return data;
};

// ============================================================================
// STUDENT PROFILE OPERATIONS
// ============================================================================

export const createStudentProfile = async (profileData) => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('students')
    .insert([
      {
        auth_id: user.id,
        email: user.email,
        full_name: profileData.fullName || user.user_metadata.full_name,
        ...profileData,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getStudentProfile = async () => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Profile doesn't exist yet
      return null;
    }
    throw error;
  }

  return data;
};

export const updateStudentProfile = async (updates) => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('auth_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================================================
// FILE UPLOAD HELPERS
// ----------------------------------------------------------------------------
// All uploads go to the same `student-files` bucket (already public, proven
// to work via your existing resume uploads). Folders separate them:
//   resumes/   →  PDFs
//   avatars/   →  profile pictures
//   banners/   →  cover images
// ============================================================================

// Internal helper — keeps logic identical for all 3 file types so any future
// breakage is fixed in one place. Throws clear errors instead of cryptic ones.
const uploadToStudentFiles = async (file, folder, opts = {}) => {
  if (!file) throw new Error('No file provided');

  const user = await getCurrentUser();
  if (!user) throw new Error('You must be signed in to upload files');

  // Optional size guard
  if (opts.maxSizeMB && file.size > opts.maxSizeMB * 1024 * 1024) {
    throw new Error(`File too large (max ${opts.maxSizeMB}MB)`);
  }

  // Optional MIME guard
  if (opts.allowedTypes && !opts.allowedTypes.some(t => file.type.startsWith(t))) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  const fileExt = (file.name.split('.').pop() || 'bin').toLowerCase();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('student-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    // Surface the actual reason instead of the generic "Upload failed"
    console.error('[uploadToStudentFiles] Supabase storage error:', uploadError);
    throw new Error(uploadError.message || 'Storage upload failed');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('student-files')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const uploadResume = (file) =>
  uploadToStudentFiles(file, 'resumes', {
    maxSizeMB: 5,
    allowedTypes: ['application/pdf'],
  });

export const uploadAvatar = (file) =>
  uploadToStudentFiles(file, 'avatars', {
    maxSizeMB: 3,
    allowedTypes: ['image/'],
  });

export const uploadBanner = (file) =>
  uploadToStudentFiles(file, 'banners', {
    maxSizeMB: 5,
    allowedTypes: ['image/'],
  });

// ============================================================================
// JOBS OPERATIONS
// ============================================================================

export const getActiveJobs = async (limit = 50) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const getJobById = async (jobId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) throw error;
  return data;
};

// ============================================================================
// APPLICATIONS OPERATIONS
// ============================================================================

export const createApplication = async (jobId, matchScore, matchBreakdown) => {
  const profile = await getStudentProfile();

  const { data, error } = await supabase
    .from('applications')
    .insert([
      {
        student_id: profile.id,
        job_id: jobId,
        match_score: matchScore,
        match_breakdown: matchBreakdown,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already applied to this job!');
    }
    throw error;
  }

  return data;
};

export const getMyApplications = async () => {
  const profile = await getStudentProfile();

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (*)
    `)
    .eq('student_id', profile.id)
    .order('applied_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getWeeklyApplicationCount = async () => {
  const profile = await getStudentProfile();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('applications')
    .select('id', { count: 'exact' })
    .eq('student_id', profile.id)
    .gte('applied_at', oneWeekAgo.toISOString());

  if (error) throw error;
  return data.length;
};

export const canApplyThisWeek = async () => {
  const count = await getWeeklyApplicationCount();
  return count < 5; // Weekly limit
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const calculateProfileCompleteness = (profile) => {
  let score = 0;

  // Basic info (30 points)
  if (profile.full_name) score += 10;
  if (profile.college) score += 10;
  if (profile.phone) score += 5;
  if (profile.email) score += 5;

  // Skills (25 points)
  const skills = profile.skills || [];
  if (skills.length >= 5) score += 25;
  else if (skills.length >= 3) score += 15;
  else if (skills.length >= 1) score += 10;

  // Projects (20 points)
  const projects = profile.projects || [];
  if (projects.length >= 3) score += 20;
  else if (projects.length >= 2) score += 15;
  else if (projects.length >= 1) score += 10;

  // Preferences (10 points)
  if (profile.preferred_roles && profile.preferred_roles.length > 0) score += 10;

  // Links (15 points)
  if (profile.github_url) score += 5;
  if (profile.linkedin_url) score += 5;
  if (profile.resume_url) score += 5;

  return Math.min(score, 100);
};
