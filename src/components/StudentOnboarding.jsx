// src/components/StudentOnboarding.jsx
import React, { useState } from 'react';
import { User, Briefcase, Code, Rocket, CheckCircle2, ArrowRight, Plus, X, Github, Loader } from 'lucide-react';
import { createStudentProfile, uploadResume } from '../services/supabase';
import { importFromGitHub, isValidGitHubUsername } from '../services/github';
import { useNavigate } from 'react-router-dom';

const SKILL_OPTIONS = [
  { id: 1, name: 'React', category: 'frontend' },
  { id: 2, name: 'Node.js', category: 'backend' },
  { id: 3, name: 'Python', category: 'language' },
  { id: 4, name: 'PostgreSQL', category: 'database' },
  { id: 5, name: 'MongoDB', category: 'database' },
  { id: 6, name: 'Express', category: 'backend' },
  { id: 7, name: 'JavaScript', category: 'language' },
  { id: 8, name: 'TypeScript', category: 'language' },
  { id: 9, name: 'Git', category: 'tools' },
  { id: 10, name: 'Docker', category: 'devops' },
  { id: 11, name: 'AWS', category: 'devops' },
  { id: 12, name: 'REST APIs', category: 'backend' },
  { id: 13, name: 'GraphQL', category: 'backend' },
  { id: 14, name: 'TailwindCSS', category: 'frontend' },
  { id: 15, name: 'Vue.js', category: 'frontend' },
  { id: 16, name: 'Django', category: 'backend' },
  { id: 17, name: 'Flask', category: 'backend' },
  { id: 18, name: 'Java', category: 'language' },
  { id: 19, name: 'Spring Boot', category: 'backend' },
  { id: 20, name: 'Kotlin', category: 'language' }
];

const ROLE_OPTIONS = [
  'Full Stack Developer',
  'Backend Developer',
  'Frontend Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'Data Analyst',
  'ML Engineer',
  'UI/UX Designer'
];

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [githubImporting, setGithubImporting] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    college: '',
    year: 3,
    phone: '',
    email: '',
    skills: [],
    projects: [],
    preferredRoles: [],
    availability: 'Immediate',
    workPreference: 'remote',
    resume: null,
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: ''
  });

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    techStack: '',
    projectUrl: '',
    githubUrl: ''
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // GitHub Import Handler
  const handleGitHubImport = async () => {
    if (!githubUsername.trim()) {
      alert('Please enter a GitHub username');
      return;
    }

    if (!isValidGitHubUsername(githubUsername)) {
      alert('Invalid GitHub username format');
      return;
    }

    setGithubImporting(true);

    try {
      const result = await importFromGitHub(githubUsername);

      if (!result.success) {
        alert(result.error || 'Failed to import from GitHub');
        return;
      }

      const { data } = result;

      // Merge with existing form data
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || data.name,
        skills: [...prev.skills, ...data.skills.map((s, idx) => ({ ...s, id: Date.now() + idx }))],
        projects: [...prev.projects, ...data.projects.map((p, idx) => ({ ...p, id: Date.now() + idx }))],
        tools: [...new Set([...(prev.tools || []), ...(data.tools || [])])],
        githubUrl: data.githubUrl
      }));

      alert('✅ Successfully imported from GitHub!');
      setGithubUsername('');
    } catch (error) {
      alert('Error importing from GitHub: ' + error.message);
    } finally {
      setGithubImporting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = (skillOption) => {
    if (!formData.skills.find(s => s.name === skillOption.name)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { 
          id: Date.now(), 
          name: skillOption.name, 
          level: 3,
          category: skillOption.category 
        }]
      }));
    }
  };

  const removeSkill = (skillId) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== skillId)
    }));
  };

  const updateSkillLevel = (skillId, level) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map(s => 
        s.id === skillId ? { ...s, level: parseInt(level) } : s
      )
    }));
  };

  const addProject = () => {
    if (newProject.title && newProject.techStack) {
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, {
          ...newProject,
          techStack: newProject.techStack.split(',').map(t => t.trim()),
          id: Date.now()
        }]
      }));
      setNewProject({
        title: '',
        description: '',
        techStack: '',
        projectUrl: '',
        githubUrl: ''
      });
    }
  };

  const removeProject = (projectId) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId)
    }));
  };

  const toggleRole = (role) => {
    if (formData.preferredRoles.includes(role)) {
      setFormData(prev => ({
        ...prev,
        preferredRoles: prev.preferredRoles.filter(r => r !== role)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferredRoles: [...prev.preferredRoles, role]
      }));
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.fullName || !formData.college) {
        alert('Please fill in all required fields');
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      let resumeUrl = null;
      if (formData.resume) {
        resumeUrl = await uploadResume(formData.resume);
      }

      const profileData = {
        full_name: formData.fullName,
        college: formData.college,
        year: formData.year,
        phone: formData.phone,
        skills: formData.skills,
        tools: formData.tools || [],
        projects: formData.projects,
        preferred_roles: formData.preferredRoles,
        availability: formData.availability,
        work_preference: formData.workPreference,
        github_url: formData.githubUrl,
        linkedin_url: formData.linkedinUrl,
        portfolio_url: formData.portfolioUrl,
        resume_url: resumeUrl,
        profile_completeness: calculateCompleteness(),
      };

      await createStudentProfile(profileData);
      navigate('/swipe');
    } catch (error) {
      console.error('Profile creation error:', error);
      alert('Failed to create profile: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateCompleteness = () => {
    let score = 0;
    if (formData.fullName) score += 10;
    if (formData.college) score += 10;
    if (formData.phone) score += 5;
    if (formData.email) score += 5;
    if (formData.skills.length >= 3) score += 25;
    if (formData.projects.length >= 1) score += 20;
    if (formData.preferredRoles.length > 0) score += 10;
    if (formData.githubUrl) score += 5;
    if (formData.linkedinUrl) score += 5;
    if (formData.resume) score += 5;
    return score;
  };

  const completeness = calculateCompleteness();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                <User className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Basic Information</h2>
              <p className="text-zinc-400">Tell us about yourself</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">College *</label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., VJTI Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <Code className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Your Skills</h2>
              <p className="text-zinc-400">Add your technical skills</p>
            </div>

            {/* GitHub Import */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Github className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-2">Import from GitHub</h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    Auto-fill your skills and projects from your GitHub repos
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="GitHub username"
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={handleGitHubImport}
                      disabled={githubImporting}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {githubImporting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        'Import'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Selector */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-3">Select Skills</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {SKILL_OPTIONS.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => addSkill(skill)}
                    disabled={formData.skills.some(s => s.name === skill.name)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.skills.some(s => s.name === skill.name)
                        ? 'bg-green-500/20 border border-green-500 text-green-300 cursor-not-allowed'
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    {skill.name}
                    {formData.skills.some(s => s.name === skill.name) && ' ✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Skills */}
            {formData.skills.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">
                  Your Skills ({formData.skills.length})
                </label>
                <div className="space-y-3">
                  {formData.skills.map(skill => (
                    <div key={skill.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{skill.name}</span>
                        <button
                          onClick={() => removeSkill(skill.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-zinc-400">Level:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(level => (
                            <button
                              key={level}
                              onClick={() => updateSkillLevel(skill.id, level)}
                              className={`w-8 h-8 rounded ${
                                skill.level >= level
                                  ? 'bg-green-500 text-white'
                                  : 'bg-zinc-700 text-zinc-500'
                              } text-sm font-bold`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                        <span className="text-sm text-zinc-500">
                          {skill.level === 1 ? 'Beginner' :
                           skill.level === 2 ? 'Elementary' :
                           skill.level === 3 ? 'Intermediate' :
                           skill.level === 4 ? 'Advanced' : 'Expert'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
                <Briefcase className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Your Projects</h2>
              <p className="text-zinc-400">Showcase your work</p>
            </div>

            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="Project title"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
              />
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
              />
              <input
                type="text"
                value={newProject.techStack}
                onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                placeholder="Tech stack (comma separated: React, Node.js, MongoDB)"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="url"
                  value={newProject.projectUrl}
                  onChange={(e) => setNewProject({ ...newProject, projectUrl: e.target.value })}
                  placeholder="Live URL (optional)"
                  className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
                />
                <input
                  type="url"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                  placeholder="GitHub URL (optional)"
                  className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
              <button
                onClick={addProject}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>

            {formData.projects.length > 0 && (
              <div className="space-y-3">
                {formData.projects.map(project => (
                  <div key={project.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-white">{project.title || project.name}</h3>
                      <button
                        onClick={() => removeProject(project.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-zinc-400 mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(project.techStack) ? project.techStack : [project.techStack]).map((tech, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-zinc-900 rounded border border-zinc-700 text-zinc-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 mb-4">
                <Rocket className="w-8 h-8 text-orange-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Final Touches</h2>
              <p className="text-zinc-400">Set your preferences</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">Preferred Roles</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map(role => (
                    <button
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        formData.preferredRoles.includes(role)
                          ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-300'
                          : 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="After exams">After exams</option>
                    <option value="Next semester">Next semester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">Work Preference</label>
                  <select
                    value={formData.workPreference}
                    onChange={(e) => handleInputChange('workPreference', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="any">Any</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">GitHub URL</label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Resume Upload (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleInputChange('resume', e.target.files[0])}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-500"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Profile Completeness</span>
                  <span className="text-2xl font-black text-blue-400">{completeness}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  {completeness >= 80 ? '✨ Ready to start swiping!' : 'Add more details to improve match scores'}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              HUNT
            </span>
          </h1>
          <p className="text-zinc-400">Build your profile in 4 simple steps</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-zinc-400">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-semibold text-zinc-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-12">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step === currentStep 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-110' 
                  : step < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-zinc-800 text-zinc-500'
              }`}>
                {step < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step}
              </div>
              <span className="text-xs text-zinc-500 mt-2 hidden md:block">
                {step === 1 ? 'Basic' : step === 2 ? 'Skills' : step === 3 ? 'Projects' : 'Finish'}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 md:p-8 mb-8">
          {renderStep()}
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all"
          >
            Back
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-bold rounded-lg transition-all flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Profile
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
