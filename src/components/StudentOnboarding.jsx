// src/components/StudentOnboarding.jsx
import React, { useState, useEffect } from 'react';
import { User, Briefcase, Code, Rocket, CheckCircle2, ArrowRight, Plus, X, Github, Loader, Sun, Moon } from 'lucide-react';
import { createStudentProfile, uploadResume } from '../services/supabase';
import { importFromGitHub, isValidGitHubUsername } from '../services/github';
import { useNavigate } from 'react-router-dom';

// ─── Design tokens (mirrors landing page CSS variables) ───────────────────────
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

// ─── Data ─────────────────────────────────────────────────────────────────────

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
  
  // E-commerce & Marketing
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

const STEPS = [
  { num: 1, label: 'Basics',   icon: User },
  { num: 2, label: 'Skills',   icon: Code },
  { num: 3, label: 'Projects', icon: Briefcase },
  { num: 4, label: 'Finish',   icon: Rocket },
];

// ─── Shared style helpers ──────────────────────────────────────────────────────

const inputCls = `
  w-full px-4 py-3 rounded-lg text-sm font-normal
  transition-colors duration-150 outline-none
  bg-[var(--bg-subtle)] border border-[var(--border)]
  text-[var(--text)] placeholder:text-[var(--text-dim)]
  focus:border-[var(--focus)]
`.replace(/\s+/g, ' ').trim();

const labelCls = 'block text-xs font-medium tracking-widest uppercase text-[var(--text-dim)] mb-2';

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [githubImporting, setGithubImporting] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [activeCategory, setActiveCategory] = useState(SKILL_CATEGORIES[0]);

  const [formData, setFormData] = useState({
    fullName: '', college: '', year: 3, phone: '', email: '',
    skills: [], projects: [], preferredRoles: [],
    availability: 'Immediate', workPreference: 'remote',
    resume: null, githubUrl: '', linkedinUrl: '', portfolioUrl: ''
  });

  const [newProject, setNewProject] = useState({
    title: '', description: '', techStack: '', projectUrl: '', githubUrl: ''
  });

  useEffect(() => {
    applyTokens(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // ── Handlers ────────────────────────────────────────────────────────────────

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
        githubUrl: data.githubUrl
      }));
      setGithubUsername('');
    } catch (e) { alert('Error: ' + e.message); }
    finally { setGithubImporting(false); }
  };

  const hi = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const addSkill = (skill) => {
    if (formData.skills.find(s => s.name === skill.name)) return;
    setFormData(prev => ({ ...prev, skills: [...prev.skills, { id: Date.now(), name: skill.name, level: 3, category: skill.category }] }));
  };

  const removeSkill = (id) => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));
  const updateLevel = (id, level) => setFormData(prev => ({ ...prev, skills: prev.skills.map(s => s.id === id ? { ...s, level } : s) }));

  const addProject = () => {
    if (!newProject.title || !newProject.techStack) return;
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { ...newProject, techStack: newProject.techStack.split(',').map(t => t.trim()), id: Date.now() }]
    }));
    setNewProject({ title: '', description: '', techStack: '', projectUrl: '', githubUrl: '' });
  };

  const removeProject = (id) => setFormData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));

  const toggleRole = (role) => setFormData(prev => ({
    ...prev,
    preferredRoles: prev.preferredRoles.includes(role)
      ? prev.preferredRoles.filter(r => r !== role)
      : [...prev.preferredRoles, role]
  }));

  const handleNext = () => {
    if (currentStep === 1 && (!formData.fullName || !formData.college)) {
      alert('Please fill in name and college'); return;
    }
    if (currentStep < totalSteps) setCurrentStep(s => s + 1);
  };

  const handleBack = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  const calculateCompleteness = () => {
    let s = 0;
    if (formData.fullName) s += 10; if (formData.college) s += 10;
    if (formData.phone) s += 5;     if (formData.email) s += 5;
    if (formData.skills.length >= 3) s += 25;
    if (formData.projects.length >= 1) s += 20;
    if (formData.preferredRoles.length > 0) s += 10;
    if (formData.githubUrl) s += 5; if (formData.linkedinUrl) s += 5;
    if (formData.resume) s += 5;
    return s;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let resumeUrl = null;
      if (formData.resume) resumeUrl = await uploadResume(formData.resume);
      await createStudentProfile({
        full_name: formData.fullName, college: formData.college,
        year: formData.year, phone: formData.phone,
        skills: formData.skills, tools: formData.tools || [],
        projects: formData.projects, preferred_roles: formData.preferredRoles,
        availability: formData.availability, work_preference: formData.workPreference,
        github_url: formData.githubUrl, linkedin_url: formData.linkedinUrl,
        portfolio_url: formData.portfolioUrl, resume_url: resumeUrl,
        profile_completeness: calculateCompleteness(),
      });
      const pendingSlug = sessionStorage.getItem('apply_after_login');
      if (pendingSlug) {
        sessionStorage.removeItem('apply_after_login');
        navigate(`/apply/${pendingSlug}`);
      } else {
        navigate('/swipe');
      }
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally { setIsSubmitting(false); }
  };

  const completeness = calculateCompleteness();
  const catSkills = SKILL_OPTIONS.filter(s => s.category === activeCategory);

  // ── Step renderers ──────────────────────────────────────────────────────────

  const Step1 = () => (
    <div>
      <StepHeader
        label="01 — Basics"
        title={<>Tell us who<br /><em>you are.</em></>}
        sub="We only show recruiters what matters — your work, not your college name."
      />
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { f: 'fullName', label: 'Full Name', req: true, placeholder: 'Priya Sharma' },
          { f: 'college',  label: 'College',   req: true, placeholder: 'VJTI Mumbai' },
          { f: 'phone',    label: 'Phone',      type: 'tel', placeholder: '+91 98765 43210' },
          { f: 'email',    label: 'Email',      type: 'email', placeholder: 'priya@email.com' },
        ].map(({ f, label, req, placeholder, type }) => (
          <div key={f}>
            <label className={labelCls}>{label}{req && <span className="text-[var(--green)] ml-1">*</span>}</label>
            <input type={type || 'text'} value={formData[f]} onChange={e => hi(f, e.target.value)}
              placeholder={placeholder} className={inputCls} />
          </div>
        ))}
        <div>
          <label className={labelCls}>Year</label>
          <select value={formData.year} onChange={e => hi('year', parseInt(e.target.value))} className={inputCls}>
            {[1,2,3,4].map(y => <option key={y} value={y}>{y}{['st','nd','rd','th'][y-1]} Year</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  const Step2 = () => (
    <div>
      <StepHeader
        label="02 — Skills"
        title={<>What can you<br /><em>actually build?</em></>}
        sub="Pick your skills and set an honest level. Recruiters see exactly this."
      />

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
      <div className="flex flex-wrap gap-2 mb-6 pb-5 border-b border-[var(--border)]">
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
  );

  const Step3 = () => (
    <div>
      <StepHeader
        label="03 — Projects"
        title={<>Show what<br /><em>you've built.</em></>}
        sub="Projects are your proof of work. Recruiters weight these heavily."
      />

      {/* Add form */}
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] space-y-3 mb-6">
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
  );

  const Step4 = () => (
    <div>
      <StepHeader
        label="04 — Finish"
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

        {/* Links */}
        {[
          { f: 'githubUrl',    label: 'GitHub URL',    placeholder: 'https://github.com/yourname' },
          { f: 'linkedinUrl',  label: 'LinkedIn URL',  placeholder: 'https://linkedin.com/in/yourname' },
          { f: 'portfolioUrl', label: 'Portfolio URL', placeholder: 'https://yoursite.com' },
        ].map(({ f, label, placeholder }) => (
          <div key={f}>
            <label className={labelCls}>{label}</label>
            <input type="url" value={formData[f]} onChange={e => hi(f, e.target.value)}
              placeholder={placeholder} className={inputCls} />
          </div>
        ))}

        {/* Resume */}
        <div>
          <label className={labelCls}>Resume (PDF)</label>
          <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] cursor-pointer hover:border-[var(--border-mid)] transition-colors">
            <span className="text-sm text-[var(--text-dim)]">
              {formData.resume ? formData.resume.name : 'Choose file…'}
            </span>
            <input type="file" accept=".pdf" onChange={e => hi('resume', e.target.files[0])} className="sr-only" />
            <span className="ml-auto text-xs px-3 py-1.5 rounded border border-[var(--border)] text-[var(--text-mid)]">Browse</span>
          </label>
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

  const steps = [Step1, Step2, Step3, Step4];

  return (
    <div className="min-h-screen transition-colors duration-300"
      style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4">
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

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Progress line */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((s, i) => {
              const done = currentStep > s.num;
              const active = currentStep === s.num;
              return (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 border ${
                      active  ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                      : done  ? 'border-[var(--green)] bg-[var(--green-tint)] text-[var(--green-text)]'
                               : 'border-[var(--border)] text-[var(--text-dim)]'
                    }`} style={{ background: active ? 'var(--text)' : done ? 'var(--green-tint)' : 'var(--bg)' }}>
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

        {/* Card */}
        <div className="rounded-xl border p-6 md:p-10 mb-8"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          {steps[currentStep - 1]()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
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
  );
}

// ── Sub-component ──────────────────────────────────────────────────────────────
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
