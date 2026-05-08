import {
  Plus, LogOut, Sun, Moon, X, ChevronRight,
  MapPin, Users, Link2, Trash2,
  ArrowLeft, Pause, Play, ExternalLink, Github, Building2, Home,
  Layers, UserCheck, GitBranch, Sparkles,
  Bookmark, ThumbsDown, Phone, Award, Bell, Lock, MessageSquare,
  LayoutGrid, List, Edit2, Camera, Image as ImageIcon, ChevronDown,
  CheckCircle, Clock, AlertCircle, Eye, AlertTriangle, Star,
} from 'lucide-react';

export const SKILL_OPTIONS = [
  'JavaScript','Python','Java','TypeScript','React','Next.js','Node.js',
  'Express.js','Django','FastAPI','Flask','REST API','GraphQL',
  'PostgreSQL','MongoDB','MySQL','Redis','Firebase',
  'Machine Learning','TensorFlow','PyTorch','Pandas',
  'Docker','AWS','CI/CD','Linux','Git','Figma','React Native','Flutter',
  'SQL','C / C++','Golang',
];

export const NAV_ITEMS = [
  { id: 'home',    label: 'Home',    icon: Home },
  { id: 'roles',   label: 'Roles',   icon: Layers },
  { id: 'profile', label: 'Profile', icon: Building2 },
];

export const STATUS_META = {
  pending:     { label: 'Pending',     color: 'var(--text-dim)',   bg: 'var(--bg-subtle)',   border: 'var(--border)' },
  shortlisted: { label: 'Shortlisted', color: 'var(--green-text)', bg: 'var(--green-tint)',  border: 'var(--green)' },
  interview:   { label: 'Interview',   color: 'var(--blue)',       bg: 'var(--blue-tint)',   border: 'var(--blue)' },
  hired:       { label: 'Hired',       color: 'var(--purple)',     bg: 'var(--purple-tint)', border: 'var(--purple)' },
  rejected:    { label: 'Passed',      color: 'var(--red)',        bg: 'var(--red-tint)',    border: 'var(--red)' },
};

// ═══════════════════════════════════════════════════════════════════════════
export const CODING_PLATFORMS = {
  leetcode:    { label: 'LeetCode',    url: (u) => `https://leetcode.com/${u}`,          color: '#FFA116', logo: 'https://assets.leetcode.com/static_assets/public/icons/favicon-192x192.png' },
  codeforces:  { label: 'Codeforces',  url: (u) => `https://codeforces.com/profile/${u}`, color: '#1F8ACB', logo: 'https://codeforces.org/s/0/favicon-32x32.png' },
  codechef:    { label: 'CodeChef',    url: (u) => `https://codechef.com/users/${u}`,     color: '#5B4638', logo: 'https://cdn.codechef.com/images/cc-logo.svg' },
  hackerrank:  { label: 'HackerRank',  url: (u) => `https://hackerrank.com/${u}`,         color: '#2EC866', logo: 'https://hrcdn.net/fcore/assets/favicon-ddc852f75a.png' },
  hackerearth: { label: 'HackerEarth', url: (u) => `https://hackerearth.com/@${u}`,       color: '#323754', logo: 'https://static-fastly.hackerearth.com/static/hackathon/images/favicon.png' },
  kaggle:      { label: 'Kaggle',      url: (u) => `https://kaggle.com/${u}`,             color: '#20BEFF', logo: 'https://www.kaggle.com/static/images/favicon.ico' },
  geeksforgeeks: { label: 'GeeksforGeeks', url: (u) => `https://auth.geeksforgeeks.org/user/${u}`, color: '#2F8D46', logo: 'https://media.geeksforgeeks.org/gfg-gg-logo.svg' },
};

