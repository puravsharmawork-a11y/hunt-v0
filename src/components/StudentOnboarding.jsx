// src/components/StudentOnboarding.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Code, Rocket, CheckCircle2, ArrowRight, Plus, X, Github, Loader, Sun, Moon, Shield, GraduationCap, Link2, AlertCircle, Upload } from 'lucide-react';
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

// ─── SVG Logos ─────────────────────────────────────────────────────────────────
const LinkedInLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2" style={{ flexShrink: 0 }}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GitHubLogo = ({ theme }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={theme === 'dark' ? '#FAFAF8' : '#0A0A0A'} style={{ flexShrink: 0 }}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const LeetCodeLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFA116" style={{ flexShrink: 0 }}>
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H19.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
  </svg>
);

const CodeChefLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#5B4638" style={{ flexShrink: 0 }}>
    <path d="M11.257.004C5.858-.114 1.83 4.33 1.945 9.728c-.014 2.76 1.202 5.205 3.15 6.87L4.4 18.45l1.967 2.307.87-1.02c1.54 1.024 3.394 1.615 5.396 1.615 2.003 0 3.856-.59 5.397-1.614l.87 1.02 1.966-2.308-.696-1.852c1.948-1.666 3.164-4.11 3.15-6.87.115-5.398-3.913-9.842-9.313-9.724h.25zm.25 1.528c4.737-.105 8.648 3.647 8.544 8.196.01 2.42-1.044 4.578-2.73 6.062l-.366.318.814 2.167-.84.984-.82-.963-.392.272A9.084 9.084 0 0 1 11.5 19.82a9.081 9.081 0 0 1-4.217-1.052l-.392-.272-.82.963-.84-.984.813-2.167-.366-.318C3.993 14.507 2.94 12.35 2.95 9.728 2.844 5.18 6.756 1.426 11.493 1.532h.014z"/>
  </svg>
);

const CodeForcesLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1F8ACB" style={{ flexShrink: 0 }}>
    <path d="M4.5 7.5A1.5 1.5 0 0 1 6 9v10.5A1.5 1.5 0 0 1 4.5 21h-3A1.5 1.5 0 0 1 0 19.5V9a1.5 1.5 0 0 1 1.5-1.5h3zm9-4.5A1.5 1.5 0 0 1 15 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 19.5v-15A1.5 1.5 0 0 1 10.5 3h3zm9 7.5A1.5 1.5 0 0 1 24 12v7.5A1.5 1.5 0 0 1 22.5 21h-3a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5h3z"/>
  </svg>
);

const KaggleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#20BEFF" style={{ flexShrink: 0 }}>
    <path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .237.05.285.14.046.094.034.2-.038.32l-6.321 6.025 6.495 8.076c.086.104.1.208.073.3z"/>
  </svg>
);

const HackerRankLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#00EA64" style={{ flexShrink: 0 }}>
    <path d="M12 0c1.285 0 9.75 4.886 10.392 6 .645 1.115.645 11.885 0 13-.642 1.114-9.107 6-10.392 6-1.284 0-9.75-4.886-10.392-6C.963 17.885.963 7.115 1.608 6 2.25 4.886 10.715 0 12 0zm2.295 6.799c-.141 0-.258.115-.258.258v4.035H9.963V7.057c0-.143-.117-.258-.258-.258c-.095 0-3.873 2.103-3.873 4.658v.088c0 2.555 3.778 4.659 3.873 4.659.141 0 .258-.116.258-.258V11.91h4.074v4.036c0 .141.117.258.258.258.094 0 3.872-2.104 3.872-4.659v-.088c0-2.555-3.778-4.658-3.872-4.658z"/>
  </svg>
);

const CodingNinjaLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#F97316" style={{ flexShrink: 0 }}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 14.5v-9l7 4.5-7 4.5z"/>
  </svg>
);

const GeeksForGeeksLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#2F8D46" style={{ flexShrink: 0 }}>
    <path d="M21.45 14.315c-.143.28-.334.532-.565.745a3.691 3.691 0 0 1-1.104.695 4.51 4.51 0 0 1-3.116-.016 3.79 3.79 0 0 1-1.106-.712 3.382 3.382 0 0 1-.565-.747H12v3.953c.005.44.372.794.82.794h.428v.59H6.752v-.59h.428a.822.822 0 0 0 .82-.794v-9.42a.822.822 0 0 0-.82-.794h-.428v-.59h5.252l-.004.59h-.428a.822.822 0 0 0-.82.794v3.953h2.994a3.69 3.69 0 0 1 .566-.747 3.79 3.79 0 0 1 1.106-.712 4.51 4.51 0 0 1 3.116-.016c.41.159.778.39 1.104.695.231.213.422.465.565.745.149.29.235.606.253.927v.01a2.2 2.2 0 0 1-.253.95zm-3.024-.863a2.45 2.45 0 0 0-.974-.196c-.353 0-.687.067-.974.196a2.27 2.27 0 0 0-.73.527 2.31 2.31 0 0 0 0 3.079 2.27 2.27 0 0 0 .73.527c.287.13.621.196.974.196s.687-.067.974-.196a2.27 2.27 0 0 0 .73-.527 2.31 2.31 0 0 0 0-3.079 2.27 2.27 0 0 0-.73-.527z"/>
  </svg>
);

const CodeStudioLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#F97316" style={{ flexShrink: 0 }}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6l4 4-4 4-1.5-1.5L11 13l-1.5-1.5L11 10 9.5 8.5 11 7zm2 0l1.5 1.5L13 10l1.5 1.5L13 13l1.5 1.5L13 15l-1-1 3.5-3.5L13 7z"/>
  </svg>
);

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
  { num: 1, label: 'Basics',    },
  { num: 2, label: 'Links',     },
  { num: 3, label: 'Skills',    },
  { num: 4, label: 'Work Auth', },
  { num: 5, label: 'Education', },
  { num: 6, label: 'Finish',    },
];

const inputCls = `w-full px-4 py-3 rounded-lg text-sm font-normal transition-colors duration-150 outline-none bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:border-[var(--focus)]`;
const labelCls = 'block text-xs font-medium tracking-widest uppercase text-[var(--text)] mb-2';
// Section headings (Education, Work Experience, Skills, Projects, etc.) use this
const sectionLabelCls = 'block text-xs font-semibold tracking-widest uppercase mb-2' ;

// ─── Progress Bar Component ────────────────────────────────────────────────────
// Design: full-width thin line with a floating pill showing current step
function StepProgress({ currentStep, totalSteps, steps }) {
  const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const currentLabel = steps[currentStep - 1]?.label;

  return (
    <div style={{ padding: '0 0 0 0' }}>
      {/* Top row: label left, fraction right */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '10px',
      }}>
        <span style={{
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--text)',
        }}>
          {currentLabel}
        </span>
        <span style={{
          fontSize: '11px', letterSpacing: '0.05em',
          color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums',
        }}>
          {currentStep} <span style={{ color: 'var(--border-mid)' }}>/</span> {totalSteps}
        </span>
      </div>

      {/* Track */}
      <div style={{
        position: 'relative',
        height: '2px',
        background: 'var(--border)',
        borderRadius: '999px',
      }}>
        {/* Filled portion */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          height: '100%',
          width: `${pct}%`,
          background: 'var(--green)',
          borderRadius: '999px',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />

        {/* Tick marks for each step */}
        {steps.map((s) => {
          const tickPct = ((s.num - 1) / (totalSteps - 1)) * 100;
          const done = currentStep > s.num;
          const active = currentStep === s.num;
          return (
            <div key={s.num} style={{
              position: 'absolute',
              top: '50%',
              left: `${tickPct}%`,
              transform: 'translate(-50%, -50%)',
              width: active ? '8px' : done ? '6px' : '5px',
              height: active ? '8px' : done ? '6px' : '5px',
              borderRadius: '50%',
              background: active ? 'var(--green)' : done ? 'var(--green)' : 'var(--border-mid)',
              border: active ? '2px solid var(--bg)' : done ? '1.5px solid var(--bg)' : 'none',
              boxShadow: active ? '0 0 0 2px var(--green)' : 'none',
              transition: 'all 0.3s ease',
              zIndex: 2,
            }} />
          );
        })}
      </div>

      {/* Step labels below — only show immediate neighbors for minimal feel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        {steps.map((s) => {
          const done = currentStep > s.num;
          const active = currentStep === s.num;
          // Only show label for done/active/next — hide distant future steps
          const show = done || active || s.num === currentStep + 1;
          return (
            <span key={s.num} style={{
              fontSize: '10px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: active ? 'var(--green)' : done ? 'var(--text-dim)' : 'var(--border-mid)',
              opacity: show ? 1 : 0,
              transition: 'all 0.3s ease',
              fontWeight: active ? 600 : 400,
            }}>
              {s.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function StudentOnboarding() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [githubImporting, setGithubImporting] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [activeCategory, setActiveCategory] = useState(SKILL_CATEGORIES[0]);
  const [extraLinks, setExtraLinks] = useState(['']);
  // Which platform profile rows are currently shown (user can remove rows)
  const ALL_PROFILES = ['leetcodeUsername','codechefUsername','codeforcesUsername','kaggleUsername','hackerrankUsername','codingninjaUsername','gfgUsername','codestudioUsername'];
  const [visibleProfiles, setVisibleProfiles] = useState(ALL_PROFILES);
  const [step2Attempted, setStep2Attempted] = useState(false);
  const [workAuthError, setWorkAuthError] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '',
    linkedinUrl: '', githubUrl: '', portfolioUrl: '',
    leetcodeUsername: '', codechefUsername: '', codeforcesUsername: '', kaggleUsername: '',
    hackerrankUsername: '', codingninjaUsername: '', gfgUsername: '', codestudioUsername: '',
    skills: [], projects: [],
    dob: '', state: '', city: '', pincode: '',
    workFromDifferentCountry: false, confirmWorkAuth: false, confirmStayInIndia: false,
    signatureName: '', signatureText: '',
    education: [{ school: '', degree: '', major: '', gpa: '', startYear: '', endYear: '' }],
    workExperience: [{ company: '', role: '', startYear: '', endYear: '', city: '', description: '' }],
    preferredRoles: [], availability: 'Immediate', workPreference: 'remote',
    resume: null, noResume: false,
  });

  const [newProject, setNewProject] = useState({ title: '', description: '', techStack: '', projectUrl: '', githubUrl: '' });

  useEffect(() => { applyTokens(theme); }, [theme]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentStep]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const hi = useCallback((field, value) => setFormData(prev => ({ ...prev, [field]: value })), []);

  const handleGitHubImport = async () => {
    if (!githubUsername.trim() || !isValidGitHubUsername(githubUsername)) { alert('Enter a valid GitHub username'); return; }
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

  const addSkill = useCallback((skill) => {
    setFormData(prev => {
      if (prev.skills.find(s => s.name === skill.name)) return prev;
      return { ...prev, skills: [...prev.skills, { id: Date.now(), name: skill.name, level: 3, category: skill.category }] };
    });
  }, []);
  const removeSkill = useCallback((id) => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) })), []);
  const updateLevel = useCallback((id, level) => setFormData(prev => ({ ...prev, skills: prev.skills.map(s => s.id === id ? { ...s, level } : s) })), []);

  const addProject = () => {
    if (!newProject.title || !newProject.techStack) return;
    setFormData(prev => ({ ...prev, projects: [...prev.projects, { ...newProject, techStack: newProject.techStack.split(',').map(t => t.trim()), id: Date.now() }] }));
    setNewProject({ title: '', description: '', techStack: '', projectUrl: '', githubUrl: '' });
  };
  const removeProject = (id) => setFormData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));

  const updateEducation = (idx, field, value) => {
    const updated = [...formData.education]; updated[idx] = { ...updated[idx], [field]: value }; hi('education', updated);
  };
  const addEducation = () => hi('education', [...formData.education, { school: '', degree: '', major: '', gpa: '', startYear: '', endYear: '' }]);
  const removeEducation = (idx) => hi('education', formData.education.filter((_, i) => i !== idx));

  const updateWorkExp = (idx, field, value) => {
    const updated = [...formData.workExperience]; updated[idx] = { ...updated[idx], [field]: value }; hi('workExperience', updated);
  };
  const addWorkExp = () => hi('workExperience', [...formData.workExperience, { company: '', role: '', startYear: '', endYear: '', city: '', description: '' }]);
  const removeWorkExp = (idx) => hi('workExperience', formData.workExperience.filter((_, i) => i !== idx));

  const toggleRole = (role) => setFormData(prev => ({
    ...prev, preferredRoles: prev.preferredRoles.includes(role) ? prev.preferredRoles.filter(r => r !== role) : [...prev.preferredRoles, role]
  }));

  const addExtraLink = useCallback(() => setExtraLinks(prev => [...prev, '']), []);
  const updateExtraLink = useCallback((idx, val) => setExtraLinks(prev => { const u = [...prev]; u[idx] = val; return u; }), []);
  const removeExtraLink = useCallback((idx) => setExtraLinks(prev => prev.filter((_, i) => i !== idx)), []);

  const handleNext = () => {
    if (currentStep === 1 && !formData.fullName) { alert('Please enter your name'); return; }
    if (currentStep === 2) setStep2Attempted(true);
    if (currentStep === 4 && (!formData.confirmWorkAuth || !formData.confirmStayInIndia)) {
      setWorkAuthError(true); return;
    }
    setWorkAuthError(false);
    if (currentStep < STEPS.length) setCurrentStep(s => s + 1);
  };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') hi('resume', file);
  };

  const calculateCompleteness = () => {
    let s = 0;
    if (formData.fullName) s += 10; if (formData.email) s += 5; if (formData.phone) s += 5;
    if (formData.linkedinUrl) s += 8; if (formData.githubUrl) s += 7;
    if (formData.skills.length >= 3) s += 20; if (formData.projects.length >= 1) s += 15;
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
        skills: formData.skills, projects: formData.projects, preferred_roles: formData.preferredRoles,
        availability: formData.availability, work_preference: formData.workPreference,
        github_url: formData.githubUrl, linkedin_url: formData.linkedinUrl, portfolio_url: formData.portfolioUrl,
        education: formData.education, work_experience: formData.workExperience,
        work_auth: { dob: formData.dob, state: formData.state, city: formData.city, pincode: formData.pincode, confirmed: formData.confirmWorkAuth },
        resume_url: resumeUrl, profile_completeness: calculateCompleteness(),
      });
      const pendingSlug = localStorage.getItem('apply_after_login');
      if (pendingSlug) { localStorage.removeItem('apply_after_login'); navigate(`/apply/${pendingSlug}`); } else navigate('/swipe');
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setIsSubmitting(false); }
  };

  const completeness = calculateCompleteness();
  const catSkills = SKILL_OPTIONS.filter(s => s.category === activeCategory);
  const showLinkedinWarn = step2Attempted && !formData.linkedinUrl;
  const showGithubWarn = step2Attempted && !formData.githubUrl;

  // ── Steps (unchanged) ────────────────────────────────────────────────────────

  const Step1 = () => (
    <div>
      <StepHeader label="01 — Basics" title={<>Tell us who<br /><em>you are.</em></>}
        sub="We only show recruiters what matters — your work, not your college name." />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelCls}>Full Name <span className="text-[var(--green)]">*</span></label>
          <input type="text" value={formData.fullName} onChange={e => hi('fullName', e.target.value)} placeholder="Priya Sharma" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email <span className="text-[var(--green)]">*</span></label>
          <input type="email" value={formData.email} onChange={e => hi('email', e.target.value)} placeholder="priya@email.com" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input type="tel" value={formData.phone} onChange={e => hi('phone', e.target.value)} placeholder="+91 98765 43210" className={inputCls} />
        </div>
      </div>
    </div>
  );

  const Step2 = () => (
    <div>
      <StepHeader label="02 — Links" title={<>Your online<br /><em>presence.</em></>}
        sub="LinkedIn and GitHub are essential — they're how recruiters verify your work." />
      <div className="space-y-4 mb-6">
        <div>
          <label className={labelCls}>
            <span className="flex items-center gap-2 flex-wrap">
              <LinkedInLogo /> LinkedIn URL <span className="text-[var(--green)]">*</span>
              {showLinkedinWarn && <span style={{ color: '#f59e0b', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal' }}>— important</span>}
            </span>
          </label>
          <input type="url" value={formData.linkedinUrl} onChange={e => hi('linkedinUrl', e.target.value)}
            placeholder="https://www.linkedin.com/in/..." className={inputCls}
            style={showLinkedinWarn ? { borderColor: '#fbbf24' } : {}} />
          {showLinkedinWarn && (
            <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#f59e0b' }}>
              <AlertCircle className="w-3.5 h-3.5" /> Recruiters look at this first. Add it to boost your match score.
            </p>
          )}
        </div>
        <div>
          <label className={labelCls}>
            <span className="flex items-center gap-2 flex-wrap">
              <GitHubLogo theme={theme} /> GitHub URL <span className="text-[var(--green)]">*</span>
              {showGithubWarn && <span style={{ color: '#f59e0b', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal' }}>— important</span>}
            </span>
          </label>
          <input type="url" value={formData.githubUrl} onChange={e => hi('githubUrl', e.target.value)}
            placeholder="https://github.com/yourname" className={inputCls}
            style={showGithubWarn ? { borderColor: '#fbbf24' } : {}} />
          {showGithubWarn && (
            <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#f59e0b' }}>
              <AlertCircle className="w-3.5 h-3.5" /> Your GitHub shows real proof of work. Don't skip this.
            </p>
          )}
        </div>
        <div>
          <label className={labelCls}>Portfolio</label>
          <input type="url" value={formData.portfolioUrl} onChange={e => hi('portfolioUrl', e.target.value)}
            placeholder="https://yourportfolio.com" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Other Links</label>
          <div className="space-y-2">
            {extraLinks.map((link, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="url" value={link} onChange={e => updateExtraLink(idx, e.target.value)}
                  placeholder="https://example.com" className={inputCls + ' flex-1'} />
                {extraLinks.length > 1 && (
                  <button onClick={() => removeExtraLink(idx)} className="px-3 rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-dim)' }}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addExtraLink} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: 'var(--text-dim)' }}>
              <Plus className="w-4 h-4" /> Add more links
            </button>
          </div>
        </div>
      </div>
      <div className="pt-5" style={{ borderTop: '1px solid var(--border)' }}>
        <label className={sectionLabelCls} style={{ color: 'var(--text)' }}>Other Profiles</label>
        <div className="space-y-2">
          {(() => {
            const PROFILE_META = {
              leetcodeUsername:   { placeholder: 'LeetCode username',     Logo: LeetCodeLogo },
              codechefUsername:   { placeholder: 'CodeChef username',     Logo: CodeChefLogo },
              codeforcesUsername: { placeholder: 'Codeforces username',   Logo: CodeForcesLogo },
              kaggleUsername:     { placeholder: 'Kaggle username',       Logo: KaggleLogo },
              hackerrankUsername: { placeholder: 'HackerRank username',   Logo: HackerRankLogo },
              codingninjaUsername:{ placeholder: 'Coding Ninjas username', Logo: CodingNinjaLogo },
              gfgUsername:        { placeholder: 'GeeksForGeeks username', Logo: GeeksForGeeksLogo },
              codestudioUsername: { placeholder: 'CodeStudio username',   Logo: CodeStudioLogo },
            };
            return visibleProfiles.map((field) => {
              const { placeholder, Logo } = PROFILE_META[field];
              return (
                <div key={field} className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
                  <Logo theme={theme} />
                  <input type="text" value={formData[field]} onChange={e => hi(field, e.target.value)}
                    placeholder={placeholder}
                    style={{ flex: 1, background: 'transparent', outline: 'none', fontSize: '0.875rem', color: 'var(--text)' }}
                    className="placeholder:text-[var(--text-dim)]" />
                  <button
                    onClick={() => {
                      hi(field, '');
                      setVisibleProfiles(prev => prev.filter(f => f !== field));
                    }}
                    style={{ color: 'var(--text-dim)', flexShrink: 0 }}
                    tabIndex={-1}
                    title="Remove this platform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );

  const Step3 = () => (
    <div>
      <StepHeader label="03 — Skills & Projects" title={<>What can you<br /><em>build & show?</em></>}
        sub="Add your skills and the projects that prove them. This is your signal." />
      {step2Attempted && (showLinkedinWarn || showGithubWarn) && (
        <div className="mb-6 p-4 rounded-lg border flex items-start gap-3"
          style={{ borderColor: 'rgba(251,191,36,0.4)', background: 'rgba(245,158,11,0.05)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {showLinkedinWarn && showGithubWarn ? 'LinkedIn and GitHub not added' : showLinkedinWarn ? 'LinkedIn not added' : 'GitHub not added'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
              These are the most important signals for recruiters.{' '}
              <button onClick={() => setCurrentStep(2)} className="underline" style={{ color: 'var(--text-mid)' }}>Go back and add them.</button>
            </p>
          </div>
        </div>
      )}
      <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
        <div className="flex items-center gap-3 mb-3">
          <Github className="w-4 h-4" style={{ color: 'var(--text-mid)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Import from GitHub</span>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>— auto-fill skills & projects</span>
        </div>
        <div className="flex gap-2">
          <input type="text" value={githubUsername} onChange={e => setGithubUsername(e.target.value)}
            placeholder="username" className={inputCls + ' flex-1'} />
          <button onClick={handleGitHubImport} disabled={githubImporting}
            className="px-5 py-3 text-sm font-medium rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            {githubImporting ? <><Loader className="w-4 h-4 animate-spin" />Importing…</> : 'Import'}
          </button>
        </div>
      </div>
      <div className="mb-8">
        <p className={sectionLabelCls} style={{ color: 'var(--text)' }}>Skills</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {SKILL_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 text-xs font-medium rounded-full border transition-colors duration-150"
              style={activeCategory === cat
                ? { background: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }
                : { background: 'transparent', color: 'var(--text-mid)', borderColor: 'var(--border)' }}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          {catSkills.map(skill => {
            const added = formData.skills.some(s => s.name === skill.name);
            return (
              <button key={skill.id} onClick={() => addSkill(skill)}
                className="px-3 py-1.5 text-sm rounded-lg border transition-all duration-150"
                style={added
                  ? { background: 'var(--green-tint)', borderColor: 'var(--green)', color: 'var(--green-text)', cursor: 'default' }
                  : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-mid)' }}>
                {skill.name}{added && ' ✓'}
              </button>
            );
          })}
        </div>
        {formData.skills.length > 0 && (
          <div>
            <p className={sectionLabelCls} style={{ color: 'var(--text)' }}>Selected — {formData.skills.length} skill{formData.skills.length !== 1 && 's'}</p>
            <div className="space-y-2">
              {formData.skills.map(skill => (
                <div key={skill.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
                  <span className="text-sm font-medium flex-1" style={{ color: 'var(--text)' }}>{skill.name}</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(lv => (
                      <button key={lv} onClick={() => updateLevel(skill.id, lv)}
                        className="w-7 h-7 rounded text-xs font-medium transition-colors duration-100"
                        style={skill.level >= lv
                          ? { background: 'var(--green)', color: '#fff' }
                          : { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                        {lv}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs w-20 text-right" style={{ color: 'var(--text-dim)' }}>{LEVEL_LABELS[skill.level]}</span>
                  <button onClick={() => removeSkill(skill.id)} style={{ color: 'var(--text-dim)' }} className="ml-1"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <p className={sectionLabelCls} style={{ color: 'var(--text)' }}>Projects</p>
        <div className="p-4 rounded-lg border space-y-3 mb-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Project title <span className="text-[var(--green)]">*</span></label>
              <input type="text" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} placeholder="E-commerce Dashboard" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tech stack <span className="text-[var(--green)]">*</span></label>
              <input type="text" value={newProject.techStack} onChange={e => setNewProject({ ...newProject, techStack: e.target.value })} placeholder="React, Node.js, PostgreSQL" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={newProject.description} rows={2} onChange={e => setNewProject({ ...newProject, description: e.target.value })} placeholder="What does this project do?" className={inputCls + ' resize-none'} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Live URL</label>
              <input type="url" value={newProject.projectUrl} onChange={e => setNewProject({ ...newProject, projectUrl: e.target.value })} placeholder="https://" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>GitHub URL</label>
              <input type="url" value={newProject.githubUrl} onChange={e => setNewProject({ ...newProject, githubUrl: e.target.value })} placeholder="https://github.com/…" className={inputCls} />
            </div>
          </div>
          <button onClick={addProject} className="w-full py-3 rounded-lg text-sm font-medium border border-dashed transition-colors flex items-center justify-center gap-2"
            style={{ borderColor: 'var(--border-mid)', color: 'var(--text-mid)' }}>
            <Plus className="w-4 h-4" /> Add project
          </button>
        </div>
        {formData.projects.length > 0 && (
          <div className="space-y-3">
            {formData.projects.map(p => (
              <div key={p.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{p.title || p.name}</span>
                  <button onClick={() => removeProject(p.id)} style={{ color: 'var(--text-dim)' }} className="ml-3"><X className="w-4 h-4" /></button>
                </div>
                {p.description && <p className="text-xs mb-2" style={{ color: 'var(--text-dim)' }}>{p.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(p.techStack) ? p.techStack : [p.techStack]).map((t, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs rounded border" style={{ borderColor: 'var(--border)', color: 'var(--text-mid)' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const Step4 = () => (
    <div>
      <StepHeader label="04 — Work Authorization" title={<>Your work<br /><em>eligibility.</em></>}
        sub="Please ensure you meet local employment requirements. Accurate info helps recruiters process faster." />
      <div className="space-y-5">
        <div>
          <label className={labelCls}>Date of Birth <span className="text-[var(--green)]">*</span></label>
          <input type="date" value={formData.dob} onChange={e => hi('dob', e.target.value)} className={inputCls} />
        </div>
        <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Location of Residence</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>Where you're based for most of the year. This may differ from your home address.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>Country</label>
              <input type="text" value="India" disabled className={inputCls} style={{ opacity: 0.6, cursor: 'not-allowed' }} />
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
              <input type="text" value={formData.city} onChange={e => hi('city', e.target.value)} placeholder="Mumbai" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Postal Code <span className="text-[var(--green)]">*</span></label>
              <input type="text" value={formData.pincode} onChange={e => hi('pincode', e.target.value)} placeholder="400001" className={inputCls} />
            </div>
          </div>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={formData.workFromDifferentCountry} onChange={e => hi('workFromDifferentCountry', e.target.checked)} className="mt-0.5 accent-[var(--green)]" />
          <span className="text-sm" style={{ color: 'var(--text-mid)' }}>I will be physically working from a different country while performing services through HUNT.</span>
        </label>
        {workAuthError && (
          <div className="p-3 rounded-lg border flex items-center gap-2" style={{ borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.05)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#ef4444' }} />
            <p className="text-sm" style={{ color: '#ef4444' }}>Please confirm both authorizations below to continue.</p>
          </div>
        )}
        <div className="space-y-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={formData.confirmWorkAuth}
              onChange={e => { hi('confirmWorkAuth', e.target.checked); if (e.target.checked && formData.confirmStayInIndia) setWorkAuthError(false); }}
              className="mt-0.5 accent-[var(--green)]" />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: workAuthError && !formData.confirmWorkAuth ? '#ef4444' : 'var(--text)' }}>
                I confirm that I am legally authorized to work from India. <span className="text-[var(--green)]">*</span>
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                By checking this, you confirm you have all necessary permits and rights to work from your indicated country, and agree to hold HUNT harmless from any liability arising from failure to maintain proper work authorization.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={formData.confirmStayInIndia}
              onChange={e => { hi('confirmStayInIndia', e.target.checked); if (e.target.checked && formData.confirmWorkAuth) setWorkAuthError(false); }}
              className="mt-0.5 accent-[var(--green)]" />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: workAuthError && !formData.confirmStayInIndia ? '#ef4444' : 'var(--text)' }}>
                I agree to remain working from India and notify HUNT in writing prior to any change. <span className="text-[var(--green)]">*</span>
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                By checking this, you agree to only work from the specified country unless prior written notice is given to HUNT, and to maintain proper work authorization for any future country.
              </p>
            </div>
          </label>
        </div>
        <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Digital Signature</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>Please provide your digital signature to confirm your agreement.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Full Name <span className="text-[var(--green)]">*</span></label>
              <input type="text" value={formData.signatureName} onChange={e => hi('signatureName', e.target.value)} placeholder={formData.fullName || 'Your full name'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Signature <span className="text-[var(--green)]">*</span></label>
              <input type="text" value={formData.signatureText} onChange={e => hi('signatureText', e.target.value)} placeholder="Ex: Priya Sharma" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input type="text" value={new Date().toLocaleDateString('en-US')} disabled className={inputCls} style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Step5 = () => {
    const yearOptions = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
    return (
      <div>
        <StepHeader label="05 — Education & Experience" title={<>Confirm and add<br /><em>experiences.</em></>}
          sub="Review your details. Projects you added in Skills will be attached automatically." />
        <div className="mb-8">
          <p className={sectionLabelCls} style={{ color: 'var(--text)' }}>Education</p>
          <div className="space-y-4">
            {formData.education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-lg border relative" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
                {formData.education.length > 1 && (
                  <button onClick={() => removeEducation(idx)} className="absolute top-3 right-3" style={{ color: 'var(--text-dim)' }}><X className="w-4 h-4" /></button>
                )}
                <div className="grid md:grid-cols-2 gap-3">
                  <div><label className={labelCls}>School</label><input type="text" value={edu.school} onChange={e => updateEducation(idx, 'school', e.target.value)} placeholder="Ex: VJTI Mumbai" className={inputCls} /></div>
                  <div><label className={labelCls}>Degree</label><input type="text" value={edu.degree} onChange={e => updateEducation(idx, 'degree', e.target.value)} placeholder="Ex: B.Tech Computer Science" className={inputCls} /></div>
                  <div><label className={labelCls}>Start Year</label><select value={edu.startYear} onChange={e => updateEducation(idx, 'startYear', e.target.value)} className={inputCls}><option value="">Select year</option>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                  <div><label className={labelCls}>End Year</label><select value={edu.endYear} onChange={e => updateEducation(idx, 'endYear', e.target.value)} className={inputCls}><option value="">Select year</option>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                  <div><label className={labelCls}>Major</label><input type="text" value={edu.major} onChange={e => updateEducation(idx, 'major', e.target.value)} placeholder="Ex: Computer Science" className={inputCls} /></div>
                  <div><label className={labelCls}>GPA / CGPA</label><input type="text" value={edu.gpa} onChange={e => updateEducation(idx, 'gpa', e.target.value)} placeholder="Ex: 8.5 / 10" className={inputCls} /></div>
                </div>
              </div>
            ))}
            <button onClick={addEducation} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: 'var(--text-dim)' }}><Plus className="w-4 h-4" /> Add education</button>
          </div>
        </div>
        <div className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <p className={sectionLabelCls} style={{ color: 'var(--text)' }}>Work Experience</p>
          <div className="space-y-4">
            {formData.workExperience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-lg border relative" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
                {formData.workExperience.length > 1 && (
                  <button onClick={() => removeWorkExp(idx)} className="absolute top-3 right-3" style={{ color: 'var(--text-dim)' }}><X className="w-4 h-4" /></button>
                )}
                <div className="grid md:grid-cols-2 gap-3">
                  <div><label className={labelCls}>Company</label><input type="text" value={exp.company} onChange={e => updateWorkExp(idx, 'company', e.target.value)} placeholder="Ex: Razorpay" className={inputCls} /></div>
                  <div><label className={labelCls}>Role</label><input type="text" value={exp.role} onChange={e => updateWorkExp(idx, 'role', e.target.value)} placeholder="Ex: Software Intern" className={inputCls} /></div>
                  <div><label className={labelCls}>Start Year</label><select value={exp.startYear} onChange={e => updateWorkExp(idx, 'startYear', e.target.value)} className={inputCls}><option value="">Select year</option>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                  <div><label className={labelCls}>End Year</label><select value={exp.endYear} onChange={e => updateWorkExp(idx, 'endYear', e.target.value)} className={inputCls}><option value="">Select year</option>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                  <div><label className={labelCls}>City</label><input type="text" value={exp.city} onChange={e => updateWorkExp(idx, 'city', e.target.value)} placeholder="Ex: Bangalore" className={inputCls} /></div>
                </div>
                <div className="mt-3">
                  <label className={labelCls}>Description</label>
                  <textarea value={exp.description} rows={3} onChange={e => updateWorkExp(idx, 'description', e.target.value)}
                    placeholder="Ex: Built REST APIs for payment gateway processing 10k+ transactions/day..." className={inputCls + ' resize-none'} />
                </div>
              </div>
            ))}
            <button onClick={addWorkExp} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: 'var(--text-dim)' }}><Plus className="w-4 h-4" /> Add work experience</button>
          </div>
        </div>
      </div>
    );
  };

  const Step6 = () => (
    <div>
      <StepHeader label="06 — Finish" title={<>Almost there.<br /><em>Set preferences.</em></>}
        sub="What kind of roles and setup works best for you?" />
      <div className="space-y-6">
        <div>
          <label className={labelCls}>Preferred roles</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map(role => (
              <button key={role} onClick={() => toggleRole(role)}
                className="px-4 py-3 rounded-lg text-sm text-left transition-all border"
                style={formData.preferredRoles.includes(role)
                  ? { background: 'var(--green-tint)', borderColor: 'var(--green)', color: 'var(--green-text)', fontWeight: 500 }
                  : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-mid)' }}>
                {role}
              </button>
            ))}
          </div>
        </div>
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
        <div>
          <label className={labelCls}>Resume</label>
          <p className="text-sm mb-3" style={{ color: 'var(--text-mid)' }}>Autofill your profile in seconds by uploading your resume</p>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border mb-4 text-xs"
            style={{ borderColor: 'var(--green)', background: 'var(--green-tint)', color: 'var(--green-text)' }}>
            <span>💡</span>
            <span>Tip: Hiring managers are more likely to reach out when they see a resume attached</span>
          </div>
          {!formData.resume ? (
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-12 px-6 text-center transition-colors duration-150"
              style={{ borderColor: dragOver ? 'var(--green)' : 'var(--border-mid)', background: dragOver ? 'var(--green-tint)' : 'var(--bg-subtle)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <Upload className="w-6 h-6" style={{ color: 'var(--text-dim)' }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Drop your resume here</p>
              <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
                or <span style={{ color: 'var(--green)', textDecoration: 'underline' }}>browse files</span> on your computer
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>Supports PDF up to 3MB</p>
              <input ref={fileInputRef} type="file" accept=".pdf" className="sr-only"
                onChange={e => { if (e.target.files?.[0]) hi('resume', e.target.files[0]); }} />
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ borderColor: 'var(--green)', background: 'var(--green-tint)' }}>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--green)' }} />
              <span className="text-sm flex-1" style={{ color: 'var(--text)' }}>{formData.resume.name}</span>
              <button onClick={() => hi('resume', null)} style={{ color: 'var(--text-dim)' }}><X className="w-4 h-4" /></button>
            </div>
          )}
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={formData.noResume} onChange={e => hi('noResume', e.target.checked)} className="accent-[var(--green)]" />
            <span className="text-sm" style={{ color: 'var(--text-mid)' }}>I don't have a resume</span>
          </label>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Profile completeness</span>
            <span className="text-2xl" style={{ fontFamily: "'Editorial New', Georgia, serif", color: 'var(--green)' }}>{completeness}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completeness}%`, background: 'var(--green)' }} />
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>
            {completeness >= 80 ? 'Ready to start swiping — strong profile.' : 'Add more to improve your match scores.'}
          </p>
        </div>
      </div>
    </div>
  );

  const stepComponents = [Step1, Step2, Step3, Step4, Step5, Step6];
  const CurrentStepComponent = stepComponents[currentStep - 1];

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: '100vh' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4"
        style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <span className="text-base font-medium" style={{ letterSpacing: '0.12em' }}>HUNT</span>
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>Build your profile</span>
        <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-mid)' }}>
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </nav>

      {/* Progress bar — new design, sticky below nav */}
      <div className="px-6 md:px-12 py-4"
        style={{ position: 'sticky', top: '57px', zIndex: 40, background: 'var(--bg)' }}>
        <div className="max-w-2xl mx-auto">
          <StepProgress currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-10 pb-20">
        <div className="rounded-xl border p-6 md:p-10 mb-8"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <CurrentStepComponent />
        </div>
        <div className="flex items-center justify-between">
          <button onClick={handleBack} disabled={currentStep === 1}
            className="px-6 py-3 text-sm font-medium rounded-lg border transition-colors disabled:opacity-30"
            style={{ borderColor: 'var(--border)', color: 'var(--text-mid)', background: 'transparent' }}>
            Back
          </button>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{currentStep} / {STEPS.length}</span>
          {currentStep < STEPS.length ? (
            <button onClick={handleNext}
              className="px-6 py-3 text-sm font-medium rounded-lg flex items-center gap-2 transition-opacity hover:opacity-80"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}>
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="px-6 py-3 text-sm font-medium rounded-lg flex items-center gap-2 transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: 'var(--green)', color: '#fff' }}>
              {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" /> Creating…</> : <><CheckCircle2 className="w-4 h-4" /> Complete profile</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepHeader({ label, title, sub }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: 'var(--text-dim)' }}>{label}</p>
      <h2 className="text-4xl md:text-5xl font-normal leading-none mb-4 tracking-tight"
        style={{ fontFamily: "'Editorial New', Georgia, serif", color: 'var(--text)' }}>
        {title}
      </h2>
      <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--text-mid)', maxWidth: '380px' }}>{sub}</p>
    </div>
  );
}
