// src/components/StudentOnboarding.jsx
import React, { useState, useEffect, useRef } from 'react';
import { User, Briefcase, Code, Rocket, CheckCircle2, ArrowRight, Plus, X, Github, Loader, Sun, Moon, Shield, GraduationCap, Link2, AlertCircle } from 'lucide-react';
import { createStudentProfile, uploadResume } from '../services/supabase';
import { importFromGitHub, isValidGitHubUsername } from '../services/github';
import { useNavigate } from 'react-router-dom';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const tokens = {
  light: {
    '--bg':         '#FAFAF8',
    '--bg-card':    '#FFFFFF',
    '--bg-subtle':  '#F5F5F2',
    '--border':     '#EBEBEA',
    '--border-mid': '#D6D6D3',
    '--text':       '#0A0A0A',
    '--text-mid':   '#5A5A56',
    '--text-dim':   '#9B9B97',
    '--green':      '#1A7A4A',
    '--green-tint': '#E8F5EE',
    '--green-text': '#1A7A4A',
    '--focus':      '#1A7A4A',
  },
  dark: {
    '--bg':         '#0A0A0A',
    '--bg-card':    '#111110',
    '--bg-subtle':  '#1A1A18',
    '--border':     '#2A2A28',
    '--border-mid': '#3A3A38',
    '--text':       '#FAFAF8',
    '--text-mid':   '#9B9B97',
    '--text-dim':   '#5A5A56',
    '--green':      '#2EAD6A',
    '--green-tint': '#0D2B1A',
    '--green-text': '#2EAD6A',
    '--focus':      '#2EAD6A',
  }
};

function applyTokens(theme) {
  const root = document.documentElement;
  Object.entries(tokens[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const SKILL_OPTIONS = [
  { id: 'sk-001', name: 'JavaScript', category: 'Language' },
  { id: 'sk-002', name: 'Python', category: 'Language' },
  { id: 'sk-003', name: 'Java', category: 'Language' },
  { id: 'sk-004', name: 'TypeScript', category: 'Language' },
  { id: 'sk-005', name: 'C / C++', category: 'Language' },
  { id: 'sk-006', name: 'Golang', category: 'Language' },
  { id: 'sk-007', name: 'Rust', category: 'Language' },
  { id: 'sk-008', name: 'SQL', category: 'Language' },
  { id: 'sk-013', name: 'React', category: 'Frontend' },
  { id: 'sk-014', name: 'React Native', category: 'Frontend' },
  { id: 'sk-015', name: 'Next.js', category: 'Frontend' },
  { id: 'sk-019', name: 'Tailwind CSS', category: 'Frontend' },
  { id: 'sk-021', name: 'AngularJS', category: 'Frontend' },
  { id: 'sk-022', name: 'Redux', category: 'Frontend' },
  { id: 'sk-023', name: 'Flutter', category: 'Mobile' },
  { id: 'sk-050', name: 'Android Dev', category: 'Mobile' },
  { id: 'sk-051', name: 'iOS Dev', category: 'Mobile' },
  { id: 'sk-024', name: 'Node.js', category: 'Backend' },
  { id: 'sk-025', name: 'Express.js', category: 'Backend' },
  { id: 'sk-027', name: 'Django', category: 'Backend' },
  { id: 'sk-028', name: 'Flask', category: 'Backend' },
  { id: 'sk-029', name: 'FastAPI', category: 'Backend' },
  { id: 'sk-031', name: 'REST API', category: 'Backend' },
  { id: 'sk-032', name: 'GraphQL', category: 'Backend' },
  { id: 'sk-035', name: 'MySQL', category: 'Database' },
  { id: 'sk-036', name: 'PostgreSQL', category: 'Database' },
  { id: 'sk-037', name: 'MongoDB', category: 'Database' },
  { id: 'sk-038', name: 'Firebase', category: 'Database' },
  { id: 'sk-039', name: 'Redis', category: 'Database' },
  { id: 'sk-041', name: 'Machine Learning', category: 'Data Science' },
  { id: 'sk-043', name: 'Data Analysis', category: 'Data Science' },
  { id: 'sk-045', name: 'TensorFlow', category: 'Data Science' },
  { id: 'sk-046', name: 'PyTorch', category: 'Data Science' },
  { id: 'sk-047', name: 'Pandas', category: 'Data Science' },
  { id: 'sk-053', name: 'Docker', category: 'DevOps' },
  { id: 'sk-055', name: 'Linux', category: 'DevOps' },
  { id: 'sk-056', name: 'AWS', category: 'DevOps' },
  { id: 'sk-057', name: 'CI/CD', category: 'DevOps' },
  { id: 'sk-054', name: 'Git', category: 'Tools' },
  { id: 'sk-070', name: 'Figma', category: 'Design' },
  { id: 'sk-072', name: 'SEO', category: 'Marketing' },
  { id: 'sk-064', name: 'Ethical Hacking', category: 'Security' },
  { id: 'sk-066', name: 'Embedded Systems', category: 'Embedded' },
  { id: 'sk-075', name: 'Blockchain', category: 'Emerging' },
  { id: 'sk-079', name: 'Prompt Engineering', category: 'Emerging' },
  { id: 'sk-080', name: 'LangChain', category: 'Emerging' },
  { id: 'sk-081', name: 'Shopify', category: 'E-commerce' },
  { id: 'sk-082', name: 'Amazon Seller', category: 'E-commerce' },
  { id: 'sk-083', name: 'WooCommerce', category: 'E-commerce' },
  { id: 'sk-084', name: 'Product Listing', category: 'E-commerce' },
  { id: 'sk-085', name: 'Email Marketing', category: 'Marketing' },
  { id: 'sk-086', name: 'Social Media Marketing', category: 'Marketing' },
  { id: 'sk-087', name: 'Google Ads', category: 'Marketing' },
  { id: 'sk-088', name: 'Meta Ads', category: 'Marketing' },
  { id: 'sk-089', name: 'Competitor Research', category: 'Marketing' },
  { id: 'sk-090', name: 'Content Writing', category: 'Marketing' },
  { id: 'sk-091', name: 'Google Analytics', category: 'Analytics' },
  { id: 'sk-092', name: 'Sales Analysis', category: 'Analytics' },
  { id: 'sk-093', name: 'Excel / Google Sheets', category: 'Tools' },
  { id: 'sk-094', name: 'Google Workspace', category: 'Tools' },
  { id: 'sk-095', name: 'MS Office', category: 'Tools' },
  { id: 'sk-096', name: 'Canva', category: 'Design' },
  { id: 'sk-097', name: 'Scikit-learn', category: 'Data Science' },
  { id: 'sk-098', name: 'Jupyter Notebook', category: 'Tools' },
  { id: 'sk-099', name: 'Data Science', category: 'Data Science' },
  { id: 'sk-100', name: 'NLP', category: 'Data Science' },
  { id: 'sk-101', name: 'Customer Service', category: 'Operations' },
  { id: 'sk-102', name: 'Operations Management', category: 'Operations' },
  { id: 'sk-103', name: 'Inventory Management', category: 'Operations' },
];

const SKILL_CATEGORIES = [...new Set(SKILL_OPTIONS.map(s => s.category))];

const ROLE_OPTIONS = [
  'Full Stack Developer', 'Backend Developer', 'Frontend Developer',
  'Mobile Developer', 'DevOps Engineer', 'Data Analyst',
  'ML Engineer', 'UI/UX Designer', 'Security / Pen Tester',
  'Embedded Systems Engineer', 'QA / Testing Engineer',
  'E-commerce Executive', 'Digital Marketing Intern'
];

const LEVEL_LABELS = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
];

const STEPS = [
  { num: 1, label: 'Basics',     icon: User },
  { num: 2, label: 'Links',      icon: Link2 },
  { num: 3, label: 'Skills',     icon: Code },
  { num: 4, label: 'Work Auth',  icon: Shield },
  { num: 5, label: 'Education',  icon: GraduationCap },
  { num: 6, label: 'Finish',     icon: Rocket },
];

// ─── Shared style helpers ───────────────────────────────────────────────────────

const inputCls = `
  w-full px-4 py-3 rounded-lg text-sm font-normal
  transition-colors duration-150 outline-none
  bg-[var(--bg-subtle)] border border-[var(--border)]
  text-[var(--text)] placeholder:text-[var(--text-dim)]
  focus:border-[var(--focus)]
`.replace(/\s+/g, ' ').trim();

const labelCls = 'block text-xs font-medium tracking-widest uppercase text-[var(--text-dim)] mb-2';

// ─── Component ─────────────────────────────────────────────────────────────────

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [githubImporting, setGithubImporting] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [activeCategory, setActiveCategory] = useState(SKILL_CATEGORIES[0]);
  const [extraLinks, setExtraLinks] = useState(['']);
  const contentRef = useRef(null);

  const [formData, setFormData] = useState({
    // Step 1 – Basics
    fullName: '', email: '', phone: '',

    // Step 2 – Links
    linkedinUrl: '', githubUrl: '', portfolioUrl: '',
    otherLinks: [],
    leetcodeUsername: '', codechefUsername: '', codeforces: '', kaggleUsername: '',

    // Step 3 – Skills + Projects
    skills: [], projects: [],

    // Step 4 – Work Authorization
    dob: '', state: '', city: '', pincode: '',
    workFromDifferentCountry: false,
    confirmWorkAuth: false,
    confirmStayInIndia: false,
    signatureName: '', signatureText: '',

    // Step 5 – Education + Experience
    education: [{ school: '', degree: '', major: '', gpa: '', startYear: '', endYear: '' }],
    workExperience: [{ company: '', role: '', startYear: '', endYear: '', city: '', description: '' }],

    // Step 6 – Finish
    preferredRoles: [],
    availability: 'Immediate', workPreference: 'remote',
    resume: null,
  });

  const [newProject, setNewProject] = useState({
    title: '', description: '', techStack: '', projectUrl: '', githubUrl: ''
  });

  useEffect(() => { applyTokens(theme); }, [theme]);

  // Scroll content to top on step change
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [currentStep]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const totalSteps = STEPS.length;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const hi = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleGitHubImport = async () => {
    if (!githubUsername.trim() || !isValidGitHubUsername(githubUsername)) {
      alert('Enter a valid GitHub username'); return;
    }
    setGithubImporting(true);
    try {
      const result = await importFromGitHub(githubUsername);
      if (!result.success) { alert(result.error || 'Import failed'); return; }
      const { data } = result;
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || data.name,
        skills: [...prev.skills, ...data.skills.map((s, i) => ({ ...s, id: Date.now() + i }))],
        projects: [...prev.projects, ...data.projects.map((p, i) => ({ ...p, id: Date.now() + i }))],
        githubUrl: prev.githubUrl || data.githubUrl
      }));
      setGithubUsername('');
    } catch (e) { alert('Error: ' + e.message); }
    finally { setGithubImporting(false); }
  };

  // Skills
  const addSkill = (skill) => {
    if (formData.skills.find(s => s.name === skill.name)) return;
    setFormData(prev => ({ ...prev, skills: [...prev.skills, { id: Date.now(), name: skill.name, level: 3, category: skill.category }] }));
  };
  const removeSkill = (id) => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));
  const updateLevel = (id, level) => setFormData(prev => ({ ...prev, skills: prev.skills.map(s => s.id === id ? { ...s, level } : s) }));

  // Projects
  const addProject = () => {
    if (!newProject.title || !newProject.techStack) return;
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { ...newProject, techStack: newProject.techStack.split(',').map(t => t.trim()), id: Date.now() }]
    }));
    setNewProject({ title: '', description: '', techStack: '', projectUrl: '', githubUrl: '' });
  };
  const removeProject = (id) => setFormData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));

  // Education
  const updateEducation = (idx, field, value) => {
    const updated = [...formData.education];
    updated[idx] = { ...updated[idx], [field]: value };
    hi('education', updated);
  };
  const addEducation = () => hi('education', [...formData.education, { school: '', degree: '', major: '', gpa: '', startYear: '', endYear: '' }]);
  const removeEducation = (idx) => hi('education', formData.education.filter((_, i) => i !== idx));

  // Work Experience
  const updateWorkExp = (idx, field, value) => {
    const updated = [...formData.workExperience];
    updated[idx] = { ...updated[idx], [field]: value };
    hi('workExperience', updated);
  };
  const addWorkExp = () => hi('workExperience', [...formData.workExperience, { company: '', role: '', startYear: '', endYear: '', city: '', description: '' }]);
  const removeWorkExp = (idx) => hi('workExperience', formData.workExperience.filter((_, i) => i !== idx));

  // Roles
  const toggleRole = (role) => setFormData(prev => ({
    ...prev,
    preferredRoles: prev.preferredRoles.includes(role)
      ? prev.preferredRoles.filter(r => r !== role)
      : [...prev.preferredRoles, role]
  }));

  // Extra links
  const addExtraLink = () => setExtraLinks(prev => [...prev, '']);
  const updateExtraLink = (idx, val) => {
    const updated = [...extraLinks];
    updated[idx] = val;
    setExtraLinks(updated);
  };
  const removeExtraLink = (idx) => setExtraLinks(prev => prev.filter((_, i) => i !== idx));

  const handleNext = () => {
    if (currentStep === 1 && !formData.fullName) { alert('Please enter your name'); return; }
    if (currentStep < totalSteps) setCurrentStep(s => s + 1);
  };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  const calculateCompleteness = () => {
    let s = 0;
    if (formData.fullName) s += 10; if (formData.email) s += 5;
    if (formData.phone) s += 5;
    if (formData.linkedinUrl) s += 8; if (formData.githubUrl) s += 7;
    if (formData.skills.length >= 3) s += 20;
    if (formData.projects.length >= 1) s += 15;
    if (formData.preferredRoles.length > 0) s += 10;
    if (formData.education[0]?.school) s += 10;
    if (formData.resume) s += 5; if (formData.portfolioUrl) s += 5;
    return Math.min(s, 100);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let resumeUrl = null;
      if (formData.resume) resumeUrl = await uploadResume(formData.resume);
      await createStudentProfile({
        full_name: formData.fullName, email: formData.email, phone: formData.phone,
        skills: formData.skills, projects: formData.projects,
        preferred_roles: formData.preferredRoles,
        availability: formData.availability, work_preference: formData.workPreference,
        github_url: formData.githubUrl, linkedin_url: formData.linkedinUrl,
        portfolio_url: formData.portfolioUrl,
        education: formData.education, work_experience: formData.workExperience,
        work_auth: {
          dob: formData.dob, state: formData.state, city: formData.city,
          pincode: formData.pincode, confirmed: formData.confirmWorkAuth,
        },
        resume_url: resumeUrl,
        profile_completeness: calculateCompleteness(),
      });
      const pendingSlug = localStorage.getItem('apply_after_login');
      if (pendingSlug) { localStorage.removeItem('apply_after_login'); navigate(`/apply/${pendingSlug}`); }
      else navigate('/swipe');
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setIsSubmitting(false); }
  };

  const completeness = calculateCompleteness();
  const catSkills = SKILL_OPTIONS.filter(s => s.category === activeCategory);
  const missingLinkedin = !formData.linkedinUrl;
  const missingGithub = !formData.githubUrl;

  // ── Step renderers ────────────────────────────────────────────────────────────

  // STEP 1 — Basics (name, email, phone only)
  const Step1 = () => (
    <div>
      <StepHeader
        label="01 — Basics"
        title={<>Tell us who<br /><em>you are.</em></>}
        sub="We only show recruiters what matters — your work, not your college name."
      />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelCls}>Full Name <span className="text-[var(--green)]">*</span></label>
          <input type="text" value={formData.fullName} onChange={e => hi('fullName', e.target.value)}
            placeholder="Priya Sharma" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email <span className="text-[var(--green)]">*</span></label>
          <input type="email" value={formData.email} onChange={e => hi('email', e.target.value)}
            placeholder="priya@email.com" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input type="tel" value={formData.phone} onChange={e => hi('phone', e.target.value)}
            placeholder="+91 98765 43210" className={inputCls} />
        </div>
      </div>
    </div>
  );

  // STEP 2 — Links
  const Step2 = () => (
    <div>
      <StepHeader
        label="02 — Links"
        title={<>Your online<br /><em>presence.</em></>}
        sub="LinkedIn and GitHub are essential — they're how recruiters verify your work."
      />

      {/* LinkedIn + GitHub — highlighted if missing */}
      <div className="space-y-4 mb-6">
        <div>
          <label className={labelCls}>
            LinkedIn URL <span className="text-[var(--green)]">*</span>
            {missingLinkedin && <span className="ml-2 text-amber-500 normal-case tracking-normal font-normal">— important</span>}
          </label>
          <input
            type="url" value={formData.linkedinUrl} onChange={e => hi('linkedinUrl', e.target.value)}
            placeholder="https://www.linkedin.com/in/..."
            className={inputCls + (missingLinkedin ? ' border-amber-400 focus:border-amber-500' : '')}
          />
          {missingLinkedin && (
            <p className="mt-1.5 text-xs text-amber-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Recruiters look at this first. Add it to boost your match score.
            </p>
          )}
        </div>

        <div>
          <label className={labelCls}>
            GitHub URL <span className="text-[var(--green)]">*</span>
            {missingGithub && <span className="ml-2 text-amber-500 normal-case tracking-normal font-normal">— important</span>}
          </label>
          <input
            type="url" value={formData.githubUrl} onChange={e => hi('githubUrl', e.target.value)}
            placeholder="https://github.com/yourname"
            className={inputCls + (missingGithub ? ' border-amber-400 focus:border-amber-500' : '')}
          />
          {missingGithub && (
            <p className="mt-1.5 text-xs text-amber-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Your GitHub shows real proof of work. Don't skip this.
            </p>
          )}
        </div>

        <div>
          <label className={labelCls}>Portfolio</label>
          <input type="url" value={formData.portfolioUrl} onChange={e => hi('portfolioUrl', e.target.value)}
            placeholder="https://yourportfolio.com" className={inputCls} />
        </div>

        {/* Other links */}
        <div>
          <label className={labelCls}>Other Links</label>
          <div className="space-y-2">
            {extraLinks.map((link, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="url" value={link} onChange={e => updateExtraLink(idx, e.target.value)}
                  placeholder="https://example.com" className={inputCls + ' flex-1'} />
                {extraLinks.length > 1 && (
                  <button onClick={() => removeExtraLink(idx)}
                    className="px-3 text-[var(--text-dim)] hover:text-[var(--text)] border border-[var(--border)] rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addExtraLink}
              className="flex items-center gap-1.5 text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
              <Plus className="w-4 h-4" /> Add more links
            </button>
          </div>
        </div>
      </div>

      {/* Other Profiles */}
      <div className="pt-5 border-t border-[var(--border)]">
        <label className={labelCls}>Other Profiles</label>
        <div className="space-y-2">
          {[
            { field: 'leetcodeUsername',  placeholder: 'leetcode-username',   icon: '⚡' },
            { field: 'codechefUsername',  placeholder: 'codechef-username',   icon: '👨‍🍳' },
            { field: 'codeforces',        placeholder: 'codeforces-username', icon: '🏆' },
            { field: 'kaggleUsername',    placeholder: 'kaggle-username',     icon: '📊' },
          ].map(({ field, placeholder, icon }) => (
            <div key={field} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]">
              <span className="text-base w-5 text-center">{icon}</span>
              <input type="text" value={formData[field]} onChange={e => hi(field, e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-sm text-[var(--text)] placeholder:text-[var(--text-dim)]" />
              {formData[field] && (
                <button onClick={() => hi(field, '')} className="text-[var(--text-dim)] hover:text-[var(--text)]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // STEP 3 — Skills + Projects (combined, unchanged internally)
  const Step3 = () => (
    <div>
      <StepHeader
        label="03 — Skills & Projects"
        title={<>What can you<br /><em>build & show?</em></>}
        sub="Add your skills and the projects that prove them. This is your signal."
      />

      {/* LinkedIn / GitHub missing warning */}
      {(missingLinkedin || missingGithub) && (
        <div className="mb-6 p-4 rounded-lg border border-amber-400/40 bg-amber-500/5 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {missingLinkedin && missingGithub
                ? 'LinkedIn and GitHub not added'
                : missingLinkedin ? 'LinkedIn not added' : 'GitHub not added'}
            </p>
            <p className="text-xs text-[var(--text-dim)] mt-0.5">
              These are the most important signals for recruiters.{' '}
              <button onClick={() => setCurrentStep(2)} className="underline text-[var(--text-mid)] hover:text-[var(--text)]">
                Go back and add them.
              </button>
            </p>
          </div>
        </div>
      )}

      {/* GitHub import */}
      <div className="mb-6 p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]">
        <div className="flex items-center gap-3 mb-3">
          <Github className="w-4 h-4 text-[var(--text-mid)]" />
          <span className="text-sm font-medium text-[var(--text)]">Import from GitHub</span>
          <span className="text-xs text-[var(--text-dim)]">— auto-fill skills & projects</span>
        </div>
        <div className="flex gap-2">
          <input type="text" value={githubUsername} onChange={e => setGithubUsername(e.target.value)}
            placeholder="username" className={inputCls + ' flex-1'} />
          <button onClick={handleGitHubImport} disabled={githubImporting}
            className="px-5 py-3 text-sm font-medium rounded-lg transition-opacity bg-[var(--text)] text-[var(--bg)] hover:opacity-80 disabled:opacity-40 flex items-center gap-2 whitespace-nowrap">
            {githubImporting ? <><Loader className="w-4 h-4 animate-spin" />Importing…</> : 'Import'}
          </button>
        </div>
      </div>

      {/* ── SKILLS ── */}
      <div className="mb-8">
        <p className={labelCls}>Skills</p>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SKILL_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors duration-150 ${
                activeCategory === cat
                  ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)]'
                  : 'bg-transparent text-[var(--text-mid)] border-[var(--border)] hover:border-[var(--border-mid)]'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Skill pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {catSkills.map(skill => {
            const added = formData.skills.some(s => s.name === skill.name);
            return (
              <button key={skill.id} onClick={() => addSkill(skill)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-150 ${
                  added
                    ? 'bg-[var(--green-tint)] border-[var(--green)] text-[var(--green-text)] cursor-default'
                    : 'bg-transparent border-[var(--border)] text-[var(--text-mid)] hover:border-[var(--border-mid)] hover:text-[var(--text)]'
                }`}>
                {skill.name}{added && ' ✓'}
              </button>
            );
          })}
        </div>

        {/* Selected skills */}
        {formData.skills.length > 0 && (
          <div>
            <p className={labelCls}>Selected — {formData.skills.length} skill{formData.skills.length !== 1 && 's'}</p>
            <div className="space-y-2">
              {formData.skills.map(skill => (
                <div key={skill.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]">
                  <span className="text-sm font-medium text-[var(--text)] flex-1">{skill.name}</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(lv => (
                      <button key={lv} onClick={() => updateLevel(skill.id, lv)}
                        className={`w-7 h-7 rounded text-xs font-medium transition-colors duration-100 ${
                          skill.level >= lv
                            ? 'bg-[var(--green)] text-white'
                            : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-dim)]'
                        }`}>
                        {lv}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-[var(--text-dim)] w-20 text-right">{LEVEL_LABELS[skill.level]}</span>
                  <button onClick={() => removeSkill(skill.id)} className="text-[var(--text-dim)] hover:text-[var(--text)] ml-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── PROJECTS ── */}
      <div className="pt-6 border-t border-[var(--border)]">
        <p className={labelCls}>Projects</p>

        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] space-y-3 mb-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Project title <span className="text-[var(--green)]">*</span></label>
              <input type="text" value={newProject.title}
                onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="E-commerce Dashboard" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tech stack <span className="text-[var(--green)]">*</span></label>
              <input type="text" value={newProject.techStack}
                onChange={e => setNewProject({ ...newProject, techStack: e.target.value })}
                placeholder="React, Node.js, PostgreSQL" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={newProject.description} rows={2}
              onChange={e => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="What does this project do?" className={inputCls + ' resize-none'} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Live URL</label>
              <input type="url" value={newProject.projectUrl}
                onChange={e => setNewProject({ ...newProject, projectUrl: e.target.value })}
                placeholder="https://" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>GitHub URL</label>
              <input type="url" value={newProject.githubUrl}
                onChange={e => setNewProject({ ...newProject, githubUrl: e.target.value })}
                placeholder="https://github.com/…" className={inputCls} />
            </div>
          </div>
          <button onClick={addProject}
            className="w-full py-3 rounded-lg text-sm font-medium border border-dashed border-[var(--border-mid)] text-[var(--text-mid)] hover:border-[var(--text)] hover:text-[var(--text)] transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add project
          </button>
        </div>

        {formData.projects.length > 0 && (
          <div className="space-y-3">
            {formData.projects.map(p => (
              <div key={p.id} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-[var(--text)] text-sm">{p.title || p.name}</span>
                  <button onClick={() => removeProject(p.id)} className="text-[var(--text-dim)] hover:text-[var(--text)] ml-3">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {p.description && <p className="text-xs text-[var(--text-dim)] mb-2">{p.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(p.techStack) ? p.techStack : [p.techStack]).map((t, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs rounded border border-[var(--border)] text-[var(--text-mid)]">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // STEP 4 — Work Authorization
  const Step4 = () => (
    <div>
      <StepHeader
        label="04 — Work Authorization"
        title={<>Your work<br /><em>eligibility.</em></>}
        sub="Please ensure you meet local employment requirements. Accurate info helps recruiters process faster."
      />

      <div className="space-y-5">
        {/* DOB */}
        <div>
          <label className={labelCls}>Date of Birth <span className="text-[var(--green)]">*</span></label>
          <input type="date" value={formData.dob} onChange={e => hi('dob', e.target.value)} className={inputCls} />
        </div>

        {/* Location */}
        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-sm font-medium text-[var(--text)] mb-1">Location of Residence</p>
          <p className="text-xs text-[var(--text-dim)] mb-4">
            Where you're based for most of the year. This may differ from your home address.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>Country</label>
              <input type="text" value="India" disabled
                className={inputCls + ' opacity-60 cursor-not-allowed'} />
            </div>
            <div>
              <label className={labelCls}>State / Province <span className="text-[var(--green)]">*</span></label>
              <select value={formData.state} onChange={e => hi('state', e.target.value)} className={inputCls}>
                <option value="">Select State / Province</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>City <span className="text-[var(--green)]">*</span></label>
              <input type="text" value={formData.city} onChange={e => hi('city', e.target.value)}
                placeholder="Mumbai" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Postal Code <span className="text-[var(--green)]">*</span></label>
              <input type="text" value={formData.pincode} onChange={e => hi('pincode', e.target.value)}
                placeholder="400001" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Working from different country */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={formData.workFromDifferentCountry}
            onChange={e => hi('workFromDifferentCountry', e.target.checked)}
            className="mt-0.5 accent-[var(--green)]" />
          <span className="text-sm text-[var(--text-mid)]">
            I will be physically working from a different country while performing services through HUNT.
          </span>
        </label>

        {/* Work auth confirmations */}
        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={formData.confirmWorkAuth}
              onChange={e => hi('confirmWorkAuth', e.target.checked)}
              className="mt-0.5 accent-[var(--green)]" />
            <div>
              <p className="text-sm font-medium text-[var(--text)] mb-1">
                I confirm that I am legally authorized to work from India. <span className="text-[var(--green)]">*</span>
              </p>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                By checking this, you confirm you have all necessary permits and rights to work from your indicated country,
                and agree to hold HUNT harmless from any liability arising from failure to maintain proper work authorization.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={formData.confirmStayInIndia}
              onChange={e => hi('confirmStayInIndia', e.target.checked)}
              className="mt-0.5 accent-[var(--green)]" />
            <div>
              <p className="text-sm font-medium text-[var(--text)] mb-1">
                I agree to remain working from India and notify HUNT in writing prior to any change. <span className="text-[var(--green)]">*</span>
              </p>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                By checking this, you agree to only work from the specified country unless prior written notice is given to HUNT,
                and to maintain proper work authorization for any future country.
              </p>
            </div>
          </label>
        </div>

        {/* Digital Signature */}
        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-sm font-medium text-[var(--text)] mb-1">Digital Signature</p>
          <p className="text-xs text-[var(--text-dim)] mb-4">Please provide your digital signature to confirm your agreement.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Full Name <span className="text-[var(--green)]">*</span></label>
              <input type="text" value={formData.signatureName} onChange={e => hi('signatureName', e.target.value)}
                placeholder={formData.fullName || 'Your full name'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Signature <span className="text-[var(--green)]">*</span></label>
              <input type="text" value={formData.signatureText} onChange={e => hi('signatureText', e.target.value)}
                placeholder="Ex: John Doe" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input type="text" value={new Date().toLocaleDateString('en-US')} disabled
                className={inputCls + ' opacity-60 cursor-not-allowed'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // STEP 5 — Education + Work Experience
  const Step5 = () => {
    const yearOptions = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
    return (
      <div>
        <StepHeader
          label="05 — Education & Experience"
          title={<>Confirm and add<br /><em>experiences.</em></>}
          sub="Review your details. Projects you added in Skills will be attached automatically."
        />

        {/* Education */}
        <div className="mb-8">
          <p className={labelCls}>Education</p>
          <div className="space-y-4">
            {formData.education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] relative">
                {formData.education.length > 1 && (
                  <button onClick={() => removeEducation(idx)}
                    className="absolute top-3 right-3 text-[var(--text-dim)] hover:text-[var(--text)]">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>School</label>
                    <input type="text" value={edu.school} onChange={e => updateEducation(idx, 'school', e.target.value)}
                      placeholder="Ex: VJTI Mumbai" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Degree</label>
                    <input type="text" value={edu.degree} onChange={e => updateEducation(idx, 'degree', e.target.value)}
                      placeholder="Ex: B.Tech Computer Science" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Start Year</label>
                    <select value={edu.startYear} onChange={e => updateEducation(idx, 'startYear', e.target.value)} className={inputCls}>
                      <option value="">Select year</option>
                      {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>End Year</label>
                    <select value={edu.endYear} onChange={e => updateEducation(idx, 'endYear', e.target.value)} className={inputCls}>
                      <option value="">Select year</option>
                      {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Major</label>
                    <input type="text" value={edu.major} onChange={e => updateEducation(idx, 'major', e.target.value)}
                      placeholder="Ex: Computer Science" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>GPA / CGPA</label>
                    <input type="text" value={edu.gpa} onChange={e => updateEducation(idx, 'gpa', e.target.value)}
                      placeholder="Ex: 8.5 / 10" className={inputCls} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addEducation}
              className="flex items-center gap-1.5 text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
              <Plus className="w-4 h-4" /> Add education
            </button>
          </div>
        </div>

        {/* Work Experience */}
        <div className="pt-6 border-t border-[var(--border)]">
          <p className={labelCls}>Work Experience</p>
          <div className="space-y-4">
            {formData.workExperience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] relative">
                {formData.workExperience.length > 1 && (
                  <button onClick={() => removeWorkExp(idx)}
                    className="absolute top-3 right-3 text-[var(--text-dim)] hover:text-[var(--text)]">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Company</label>
                    <input type="text" value={exp.company} onChange={e => updateWorkExp(idx, 'company', e.target.value)}
                      placeholder="Ex: Razorpay" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Role</label>
                    <input type="text" value={exp.role} onChange={e => updateWorkExp(idx, 'role', e.target.value)}
                      placeholder="Ex: Software Intern" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Start Year</label>
                    <select value={exp.startYear} onChange={e => updateWorkExp(idx, 'startYear', e.target.value)} className={inputCls}>
                      <option value="">Select year</option>
                      {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>End Year</label>
                    <select value={exp.endYear} onChange={e => updateWorkExp(idx, 'endYear', e.target.value)} className={inputCls}>
                      <option value="">Select year</option>
                      {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>City</label>
                    <input type="text" value={exp.city} onChange={e => updateWorkExp(idx, 'city', e.target.value)}
                      placeholder="Ex: Bangalore" className={inputCls} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={labelCls}>Description</label>
                  <textarea value={exp.description} rows={3}
                    onChange={e => updateWorkExp(idx, 'description', e.target.value)}
                    placeholder="Ex: Built REST APIs for payment gateway processing 10k+ transactions/day..."
                    className={inputCls + ' resize-none mt-0'} />
                </div>
              </div>
            ))}
            <button onClick={addWorkExp}
              className="flex items-center gap-1.5 text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
              <Plus className="w-4 h-4" /> Add work experience
            </button>
          </div>
        </div>
      </div>
    );
  };

  // STEP 6 — Finish (roles, availability, resume, completeness — links removed)
  const Step6 = () => (
    <div>
      <StepHeader
        label="06 — Finish"
        title={<>Almost there.<br /><em>Set preferences.</em></>}
        sub="What kind of roles and setup works best for you?"
      />

      <div className="space-y-6">
        {/* Roles */}
        <div>
          <label className={labelCls}>Preferred roles</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map(role => (
              <button key={role} onClick={() => toggleRole(role)}
                className={`px-4 py-3 rounded-lg text-sm text-left transition-all border ${
                  formData.preferredRoles.includes(role)
                    ? 'bg-[var(--green-tint)] border-[var(--green)] text-[var(--green-text)] font-medium'
                    : 'bg-transparent border-[var(--border)] text-[var(--text-mid)] hover:border-[var(--border-mid)]'
                }`}>
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Selects */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Availability</label>
            <select value={formData.availability} onChange={e => hi('availability', e.target.value)} className={inputCls}>
              <option value="Immediate">Immediate</option>
              <option value="After exams">After exams</option>
              <option value="Next semester">Next semester</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Work preference</label>
            <select value={formData.workPreference} onChange={e => hi('workPreference', e.target.value)} className={inputCls}>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
              <option value="any">Any</option>
            </select>
          </div>
        </div>

        {/* Resume */}
        <div>
          <label className={labelCls}>Resume (PDF)</label>
          <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-[var(--border-mid)] bg-[var(--bg-subtle)] cursor-pointer hover:border-[var(--border-mid)] transition-colors">
            <span className="text-sm text-[var(--text-dim)]">
              {formData.resume ? formData.resume.name : 'Drop your resume here or browse files — PDF up to 3MB'}
            </span>
            <input type="file" accept=".pdf" onChange={e => hi('resume', e.target.files[0])} className="sr-only" />
            <span className="ml-auto text-xs px-3 py-1.5 rounded border border-[var(--border)] text-[var(--text-mid)] whitespace-nowrap">Browse</span>
          </label>
          <p className="text-xs text-[var(--text-dim)] mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green)]" />
            Tip: Recruiters are more likely to reach out when they see a resume attached.
          </p>
        </div>

        {/* Completeness */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--text)]">Profile completeness</span>
            <span className="font-serif text-2xl text-[var(--green)]" style={{ fontFamily: "'Editorial New', Georgia, serif" }}>
              {completeness}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--green)] transition-all duration-500"
              style={{ width: `${completeness}%` }} />
          </div>
          <p className="text-xs text-[var(--text-dim)] mt-2">
            {completeness >= 80 ? 'Ready to start swiping — strong profile.' : 'Add more to improve your match scores.'}
          </p>
        </div>
      </div>
    </div>
  );

  const stepComponents = [Step1, Step2, Step3, Step4, Step5, Step6];
  const CurrentStepComponent = stepComponents[currentStep - 1];

  return (
    <div className="h-screen flex flex-col overflow-hidden transition-colors duration-300"
      style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Nav (sticky, never scrolls) ── */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
        className="flex-shrink-0 z-50 flex items-center justify-between px-6 md:px-12 py-4">
        <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '0.12em' }}
          className="text-base font-medium">HUNT</span>
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>
          Build your profile
        </span>
        <button onClick={toggleTheme}
          className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border)] transition-colors hover:border-[var(--border-mid)]"
          style={{ background: 'var(--bg-subtle)', color: 'var(--text-mid)' }}>
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </nav>

      {/* ── Progress bar (sticky, never scrolls) ── */}
      <div className="flex-shrink-0 px-6 md:px-12 py-5"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const done = currentStep > s.num;
              const active = currentStep === s.num;
              return (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 border ${
                      active  ? 'border-[var(--text)] text-[var(--bg)]'
                      : done  ? 'border-[var(--green)] text-[var(--green-text)]'
                               : 'border-[var(--border)] text-[var(--text-dim)]'
                    }`}
                      style={{
                        background: active ? 'var(--text)' : done ? 'var(--green-tint)' : 'var(--bg)'
                      }}>
                      {done ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                    </div>
                    <span className="text-xs hidden md:block" style={{ color: active ? 'var(--text)' : 'var(--text-dim)' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-2 h-px" style={{ background: currentStep > s.num ? 'var(--green)' : 'var(--border)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Scrollable content area ── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Card */}
          <div className="rounded-xl border p-6 md:p-10 mb-8"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <CurrentStepComponent />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pb-12">
            <button onClick={handleBack} disabled={currentStep === 1}
              className="px-6 py-3 text-sm font-medium rounded-lg border transition-colors disabled:opacity-30"
              style={{ borderColor: 'var(--border)', color: 'var(--text-mid)', background: 'transparent' }}>
              Back
            </button>
            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{currentStep} / {totalSteps}</span>
            {currentStep < totalSteps ? (
              <button onClick={handleNext}
                className="px-6 py-3 text-sm font-medium rounded-lg flex items-center gap-2 transition-opacity hover:opacity-80"
                style={{ background: 'var(--text)', color: 'var(--bg)' }}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="px-6 py-3 text-sm font-medium rounded-lg flex items-center gap-2 transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ background: 'var(--green)', color: '#fff' }}>
                {isSubmitting
                  ? <><Loader className="w-4 h-4 animate-spin" /> Creating…</>
                  : <><CheckCircle2 className="w-4 h-4" /> Complete profile</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component ───────────────────────────────────────────────────────────────
function StepHeader({ label, title, sub }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: 'var(--text-dim)' }}>
        {label}
      </p>
      <h2 className="text-4xl md:text-5xl font-normal leading-none mb-4 tracking-tight"
        style={{ fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)' }}>
        {title}
      </h2>
      <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--text-mid)', maxWidth: '380px' }}>
        {sub}
      </p>
    </div>
  );
}
