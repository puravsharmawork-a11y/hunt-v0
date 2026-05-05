// src/services/resumeService.js
// Resume PDF → text → LLM → structured skills + experience
//
// Pipeline:
//   1. Fetch PDF from Supabase public URL (already stored, no auth needed)
//   2. Extract raw text using pdf.js (runs in browser, no backend needed)
//   3. Send text to Anthropic API with structured extraction prompt
//   4. Parse JSON response → skills[], experience[], summary
//   5. Persist to students.resume_signals (jsonb)
//
// Why pdf.js and not pdfminer?
//   pdfminer is Python — needs a backend. pdf.js is the browser-native PDF
//   renderer from Mozilla. Same extraction quality, zero server cost.
//
// Install: npm install pdfjs-dist
// (pdfjs-dist is already a transitive dep of many React apps — check first)

import { supabase } from './supabase';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

// ─── Load pdf.js lazily ───────────────────────────────────────────────────────
let pdfjsLib = null;

async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  // Dynamic import — only loaded when resume parsing is triggered
  const pdfjs = await import('pdfjs-dist');
  // Worker must point to the same version
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
  pdfjsLib = pdfjs;
  return pdfjs;
}

// ─── Extract raw text from a PDF URL ─────────────────────────────────────────
export async function extractTextFromPdfUrl(pdfUrl) {
  if (!pdfUrl) throw new Error('No PDF URL provided');

  const pdfjs = await getPdfJs();

  // Fetch the PDF bytes
  const response = await fetch(pdfUrl);
  if (!response.ok) throw new Error(`Could not fetch PDF: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();

  // Load with pdf.js
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  // Extract text from all pages
  const pageTexts = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map(item => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pageTexts.push(pageText);
  }

  return pageTexts.join('\n\n');
}

// ─── LLM extraction prompt ────────────────────────────────────────────────────
// Matches exactly what your documentation specifies:
// "Extract skills with inferred proficiency levels, project descriptions,
//  and work experience. Return structured JSON. Ignore education/college."
function buildExtractionPrompt(resumeText) {
  return `You are an expert resume parser for a tech internship platform.

Extract information from this resume text and return ONLY valid JSON — no markdown, no explanation, no code fences.

Resume text:
---
${resumeText.slice(0, 6000)}
---

Return this exact JSON structure:
{
  "skills": [
    {
      "name": "skill name",
      "level": 1-5,
      "category": "Language|Frontend|Backend|Database|Data Science|Mobile|DevOps|Design|Marketing|Tools|Other",
      "inferred_from": "brief note on why this level was inferred"
    }
  ],
  "projects": [
    {
      "name": "project name",
      "description": "what it does",
      "techStack": ["tech1", "tech2"],
      "githubUrl": "url or null",
      "projectUrl": "live url or null"
    }
  ],
  "work_experience": [
    {
      "role": "job title",
      "company": "company name",
      "duration": "e.g. June 2023 - Aug 2023",
      "description": "what they did"
    }
  ],
  "summary": "2-3 sentence summary of this candidate's profile and strengths",
  "top_skills": ["skill1", "skill2", "skill3"],
  "seniority_signal": "fresher|junior|mid",
  "domains": ["domain1", "domain2"]
}

Rules:
- Proficiency levels: 1=heard of it, 2=basic, 3=comfortable, 4=strong, 5=expert
- Infer level from context clues: years used, projects built, certifications
- NEVER include college name, degree, or GPA anywhere
- If a field cannot be extracted, use null or empty array
- Return ONLY the JSON object, nothing else`;
}

// ─── Call Anthropic API ───────────────────────────────────────────────────────
async function callAnthropicForResume(resumeText) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set in .env.local');

  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required for browser-side calls
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001', // fast + cheap for extraction
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: buildExtractionPrompt(resumeText),
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Anthropic API error ${response.status}: ${err.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text || '';

  // Parse JSON — strip any accidental markdown fences
  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[resumeService] Failed to parse LLM JSON:', rawText);
    throw new Error('LLM returned invalid JSON. Raw: ' + rawText.slice(0, 200));
  }
}

// ─── Merge LLM-extracted skills with existing profile skills ─────────────────
// Priority: keep manual skills, add new ones from resume if not already present
export function mergeSkills(existingSkills, resumeSkills) {
  if (!Array.isArray(resumeSkills)) return existingSkills;

  const existing = new Map(
    (existingSkills || []).map(s => [s.name.toLowerCase(), s])
  );

  const merged = [...(existingSkills || [])];

  for (const rSkill of resumeSkills) {
    const key = rSkill.name.toLowerCase();
    if (!existing.has(key)) {
      // New skill from resume — add it with source tag
      merged.push({
        id: Date.now() + Math.random(),
        name: rSkill.name,
        level: rSkill.level || 3,
        category: rSkill.category || 'Other',
        source: 'resume',  // so UI can show "from resume" badge
      });
    } else {
      // Skill exists — if resume implies higher level, suggest upgrade
      const existing_skill = existing.get(key);
      if (rSkill.level > (existing_skill.level || 0)) {
        // Don't auto-upgrade — just note it in signals
        existing_skill.resume_suggested_level = rSkill.level;
      }
    }
  }

  return merged;
}

// ─── Score resume signals (for huntScoreService) ─────────────────────────────
export function scoreResumeSignals(resumeSignals) {
  if (!resumeSignals?.parsedAt) return 0;

  let score = 0;
  const s = resumeSignals;

  // Resume exists and was parsed: base 3 pts
  score += 3;

  // Skills extracted (up to 5 pts)
  const skillCount = (s.skills || []).length;
  if (skillCount >= 10)     score += 5;
  else if (skillCount >= 5) score += 3;
  else if (skillCount >= 1) score += 1;

  // Work experience (up to 4 pts)
  const expCount = (s.work_experience || []).length;
  if (expCount >= 2)  score += 4;
  else if (expCount >= 1) score += 2;

  // Projects in resume (up to 3 pts)
  const projCount = (s.projects || []).length;
  if (projCount >= 3)  score += 3;
  else if (projCount >= 1) score += 1;

  // Seniority (1 pt for being correctly junior/fresher)
  if (s.seniority_signal === 'junior') score += 1;

  return Math.min(score, 15); // caps at 15 to avoid over-weighting resume vs GitHub
}

// ─── Persist to Supabase ──────────────────────────────────────────────────────
export async function saveResumeSignals(studentAuthId, signals) {
  const { data, error } = await supabase
    .from('students')
    .update({ resume_signals: signals })
    .eq('auth_id', studentAuthId)
    .select('id, resume_signals')
    .single();

  if (error) throw error;
  return data;
}

// ─── Full pipeline: fetch PDF → extract → LLM parse → save ───────────────────
// Returns the resume_signals object
export async function parseResume(studentProfile) {
  if (!studentProfile?.resume_url) {
    throw new Error('No resume URL on profile');
  }

  // Don't re-parse if we parsed < 24 hours ago (saves API cost)
  const existing = studentProfile.resume_signals;
  if (existing?.parsedAt) {
    const hoursSince = (Date.now() - new Date(existing.parsedAt)) / (1000 * 60 * 60);
    if (hoursSince < 24) {
      return existing;
    }
  }

  // Step 1: Extract text
  const rawText = await extractTextFromPdfUrl(studentProfile.resume_url);
  if (!rawText || rawText.length < 50) {
    throw new Error('Could not extract readable text from PDF. Is the resume a scanned image?');
  }

  // Step 2: LLM extraction
  const extracted = await callAnthropicForResume(rawText);

  // Step 3: Build signals object
  const signals = {
    parsedAt:        new Date().toISOString(),
    rawTextLength:   rawText.length,
    skills:          extracted.skills || [],
    projects:        extracted.projects || [],
    work_experience: extracted.work_experience || [],
    summary:         extracted.summary || '',
    top_skills:      extracted.top_skills || [],
    seniority_signal: extracted.seniority_signal || 'fresher',
    domains:         extracted.domains || [],
  };

  // Step 4: Persist
  await saveResumeSignals(studentProfile.auth_id, signals);

  return signals;
}
