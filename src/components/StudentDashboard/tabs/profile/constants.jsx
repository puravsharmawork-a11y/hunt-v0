import React from 'react';

// ─── Profile constants ─────────────────────────────────────────────────────────
export const SKILL_OPTIONS_P = [
  // Languages
  { name: 'JavaScript', cat: 'Language' }, { name: 'Python', cat: 'Language' },
  { name: 'TypeScript', cat: 'Language' }, { name: 'Java', cat: 'Language' },
  { name: 'C / C++', cat: 'Language' }, { name: 'Golang', cat: 'Language' },
  { name: 'SQL', cat: 'Language' }, { name: 'Rust', cat: 'Language' },
  { name: 'Kotlin', cat: 'Language' }, { name: 'Swift', cat: 'Language' },
  { name: 'PHP', cat: 'Language' }, { name: 'Ruby', cat: 'Language' },
  { name: 'R', cat: 'Language' }, { name: 'Scala', cat: 'Language' },
  { name: 'Dart', cat: 'Language' }, { name: 'C#', cat: 'Language' },

  // Frontend
  { name: 'HTML', cat: 'Frontend' }, { name: 'CSS', cat: 'Frontend' },
  { name: 'Web Development', cat: 'Frontend' },
  { name: 'React', cat: 'Frontend' }, { name: 'Next.js', cat: 'Frontend' },
  { name: 'Tailwind CSS', cat: 'Frontend' }, { name: 'Vue.js', cat: 'Frontend' },
  { name: 'Angular', cat: 'Frontend' }, { name: 'Svelte', cat: 'Frontend' },
  { name: 'Redux', cat: 'Frontend' }, { name: 'Sass/SCSS', cat: 'Frontend' },
  { name: 'Bootstrap', cat: 'Frontend' }, { name: 'Material UI', cat: 'Frontend' },
  { name: 'jQuery', cat: 'Frontend' }, { name: 'Webpack', cat: 'Frontend' },
  { name: 'Vite', cat: 'Frontend' },

  // Backend
  { name: 'Node.js', cat: 'Backend' }, { name: 'Express.js', cat: 'Backend' },
  { name: 'Django', cat: 'Backend' }, { name: 'FastAPI', cat: 'Backend' },
  { name: 'Flask', cat: 'Backend' }, { name: 'Spring Boot', cat: 'Backend' },
  { name: 'Laravel', cat: 'Backend' }, { name: 'Ruby on Rails', cat: 'Backend' },
  { name: 'NestJS', cat: 'Backend' }, { name: 'REST API', cat: 'Backend' },
  { name: 'GraphQL', cat: 'Backend' }, { name: 'Microservices', cat: 'Backend' },
  { name: 'WebSockets', cat: 'Backend' },

  // Database
  { name: 'PostgreSQL', cat: 'Database' }, { name: 'MongoDB', cat: 'Database' },
  { name: 'MySQL', cat: 'Database' }, { name: 'Redis', cat: 'Database' },
  { name: 'SQLite', cat: 'Database' }, { name: 'Firebase', cat: 'Database' },
  { name: 'Supabase', cat: 'Database' }, { name: 'DynamoDB', cat: 'Database' },
  { name: 'Cassandra', cat: 'Database' }, { name: 'ElasticSearch', cat: 'Database' },

  // Data Science & ML
  { name: 'Machine Learning', cat: 'Data Science' },
  { name: 'Deep Learning', cat: 'Data Science' },
  { name: 'TensorFlow', cat: 'Data Science' },
  { name: 'PyTorch', cat: 'Data Science' },
  { name: 'Scikit-learn', cat: 'Data Science' },
  { name: 'Pandas', cat: 'Data Science' },
  { name: 'NumPy', cat: 'Data Science' },
  { name: 'Matplotlib', cat: 'Data Science' },
  { name: 'Data Analysis', cat: 'Data Science' },
  { name: 'NLP', cat: 'Data Science' },
  { name: 'Computer Vision', cat: 'Data Science' },
  { name: 'Statistics', cat: 'Data Science' },
  { name: 'Tableau', cat: 'Data Science' },
  { name: 'Power BI', cat: 'Data Science' },

  // CS Fundamentals
  { name: 'DSA', cat: 'CS Fundamentals' },
  { name: 'Algorithms', cat: 'CS Fundamentals' },
  { name: 'Data Structures', cat: 'CS Fundamentals' },
  { name: 'Operating Systems', cat: 'CS Fundamentals' },
  { name: 'Computer Networks', cat: 'CS Fundamentals' },
  { name: 'Database Management', cat: 'CS Fundamentals' },
  { name: 'System Design', cat: 'CS Fundamentals' },
  { name: 'OOP', cat: 'CS Fundamentals' },

  // DevOps
  { name: 'Docker', cat: 'DevOps' }, { name: 'Kubernetes', cat: 'DevOps' },
  { name: 'AWS', cat: 'DevOps' }, { name: 'Azure', cat: 'DevOps' },
  { name: 'GCP', cat: 'DevOps' }, { name: 'CI/CD', cat: 'DevOps' },
  { name: 'Linux', cat: 'DevOps' }, { name: 'Jenkins', cat: 'DevOps' },
  { name: 'Terraform', cat: 'DevOps' }, { name: 'Ansible', cat: 'DevOps' },
  { name: 'Nginx', cat: 'DevOps' }, { name: 'Shell Scripting', cat: 'DevOps' },

  // Tools
  { name: 'Git', cat: 'Tools' }, { name: 'GitHub', cat: 'Tools' },
  { name: 'VS Code', cat: 'Tools' }, { name: 'Postman', cat: 'Tools' },
  { name: 'Jira', cat: 'Tools' }, { name: 'Notion', cat: 'Tools' },
  { name: 'Slack', cat: 'Tools' },

  // Design
  { name: 'Figma', cat: 'Design' }, { name: 'Adobe XD', cat: 'Design' },
  { name: 'Photoshop', cat: 'Design' }, { name: 'Illustrator', cat: 'Design' },
  { name: 'UI/UX Design', cat: 'Design' }, { name: 'Wireframing', cat: 'Design' },
  { name: 'Prototyping', cat: 'Design' },

  // Mobile
  { name: 'Flutter', cat: 'Mobile' }, { name: 'React Native', cat: 'Mobile' },
  { name: 'Android Dev', cat: 'Mobile' }, { name: 'iOS Dev', cat: 'Mobile' },
  { name: 'Jetpack Compose', cat: 'Mobile' }, { name: 'SwiftUI', cat: 'Mobile' },

  // Marketing
  { name: 'SEO', cat: 'Marketing' }, { name: 'Social Media Marketing', cat: 'Marketing' },
  { name: 'Content Writing', cat: 'Marketing' }, { name: 'Email Marketing', cat: 'Marketing' },
  { name: 'Google Ads', cat: 'Marketing' }, { name: 'Meta Ads', cat: 'Marketing' },
  { name: 'Google Analytics', cat: 'Marketing' }, { name: 'Copywriting', cat: 'Marketing' },
  { name: 'Brand Strategy', cat: 'Marketing' },

  // E-commerce
  { name: 'Shopify', cat: 'E-commerce' }, { name: 'WooCommerce', cat: 'E-commerce' },
  { name: 'Amazon Seller', cat: 'E-commerce' }, { name: 'Product Listing', cat: 'E-commerce' },

  // Business
  { name: 'Google Workspace', cat: 'Business' }, { name: 'MS Office', cat: 'Business' },
  { name: 'Sales Analysis', cat: 'Business' }, { name: 'Competitor Research', cat: 'Business' },
  { name: 'Project Management', cat: 'Business' }, { name: 'Agile/Scrum', cat: 'Business' },
];

export const SKILL_CATS_P = [...new Set(SKILL_OPTIONS_P.map(s => s.cat))];
export const LEVEL_LABELS_P = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
export const ROLE_OPTIONS_P = [
  'Full Stack Developer', 'Backend Developer', 'Frontend Developer',
  'Mobile Developer', 'DevOps Engineer', 'Data Analyst',
  'ML Engineer', 'UI/UX Designer', 'Security Engineer', 'QA Engineer',
  'Product Manager', 'Marketing Intern', 'Content Writer', 'Sales Intern',
  'Business Analyst', 'E-Commerce Intern', 'SEO Specialist',
];

export const inp_p = { width: '100%', padding: '9px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };

export function Toggle_P({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{ width: 34, height: 19, borderRadius: 10, background: on ? 'var(--green)' : 'var(--border-mid)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 17 : 2, width: 15, height: 15, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.18s' }} />
    </div>
  );
}

// ── Tech logos (emoji/SVG) ─────────────────────────────────────────────────
export const SKILL_LOGOS = {
  'JavaScript': '🟨', 'Python': '🐍', 'TypeScript': '🔷', 'Java': '☕',
  'C / C++': '⚙️', 'Golang': '🐹', 'SQL': '🗄️', 'Rust': '🦀',
  'Kotlin': '🅺', 'Swift': '🦅', 'PHP': '🐘', 'Ruby': '💎',
  'R': '📊', 'Scala': '🎯', 'Dart': '🎯', 'C#': '#️⃣',
  'HTML': '📄', 'CSS': '🎨', 'Web Development': '🌐',
  'React': <svg width="14" height="14" viewBox="0 0 24 24" fill="#61DAFB"><path d="M12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/><path d="M12 21.59C9.33 19.8 2.5 15.33 2.5 12S9.33 4.2 12 2.41C14.67 4.2 21.5 8.67 21.5 12S14.67 19.8 12 21.59zM12 3.59C9.9 5.15 4 9.19 4 12s5.9 6.85 8 8.41C14.1 18.85 20 14.81 20 12S14.1 5.15 12 3.59z" opacity=".3"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(0 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(120 12 12)"/></svg>,
  'Next.js': <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0z"/></svg>,
  'Node.js': <svg width="14" height="14" viewBox="0 0 24 24" fill="#339933"><path d="M11.998 24a.844.844 0 0 1-.421-.113l-1.336-.791c-.2-.111-.102-.15-.036-.173.266-.093.32-.114.603-.274a.095.095 0 0 1 .091.007l1.027.609a.131.131 0 0 0 .122 0l4.006-2.313a.124.124 0 0 0 .061-.108V7.234a.126.126 0 0 0-.062-.109L11.998 4.8a.123.123 0 0 0-.122 0L7.872 7.126a.127.127 0 0 0-.063.109v4.619a.126.126 0 0 0 .063.108l1.097.634a1.826 1.826 0 0 0 .928.255c.52 0 .828-.316.828-.866V7.7c0-.137.11-.246.247-.246h1.052c.136 0 .246.109.246.246v4.29c0 1.697-.93 2.67-2.55 2.67-.499 0-.892-.065-1.21-.224l-1.048-.6a1.259 1.259 0 0 1-.627-1.088V7.234a1.26 1.26 0 0 1 .627-1.089L11.576.831a1.303 1.303 0 0 1 1.244 0l4.01 2.315a1.261 1.261 0 0 1 .628 1.089v4.619a1.261 1.261 0 0 1-.628 1.088l-4.01 2.315a1.303 1.303 0 0 1-1.244 0l-1.097-.634V7.7c0-.137.11-.246.246-.246h1.052c.137 0 .247.109.247.246v4.29c0 .55.307.866.828.866a1.829 1.829 0 0 0 .928-.255l1.097-.634a.127.127 0 0 0 .063-.108V3.235a.126.126 0 0 0-.062-.109L11.998.813a.122.122 0 0 0-.122 0L7.872 3.126a.128.128 0 0 0-.063.109v4.619c0 .045.024.087.063.109l4.006 2.313a.124.124 0 0 0 .122 0l1.336-.771a.125.125 0 0 0 .063-.109V5.068a.125.125 0 0 0-.062-.109l-1.026-.594a.124.124 0 0 0-.122 0L11.02 4.73a.094.094 0 0 1-.091.007c-.283-.16-.337-.181-.603-.274-.066-.023-.164-.062.036-.173l1.336-.791a.843.843 0 0 1 .842 0l1.27.733a.844.844 0 0 1 .422.731v1.465a.844.844 0 0 1-.422.732l-1.27.733a.843.843 0 0 1-.842 0L10.43 6.36a.844.844 0 0 1-.422-.732V4.163a.844.844 0 0 1 .422-.731l1.27-.733a.843.843 0 0 1 .298-.065z"/></svg>,
  'Docker': <svg width="14" height="14" viewBox="0 0 24 24" fill="#2496ED"><path d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.186.186 0 0 0-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"/></svg>,
  'Git': <svg width="14" height="14" viewBox="0 0 24 24" fill="#F05032"><path d="M23.546 10.93L13.067.452a1.55 1.55 0 0 0-2.188 0L8.708 2.627l2.76 2.76a1.838 1.838 0 0 1 2.327 2.341l2.658 2.66a1.838 1.838 0 0 1 1.9 3.039 1.837 1.837 0 0 1-2.6 0 1.846 1.846 0 0 1-.404-1.996L12.86 8.955v6.525c.176.086.342.203.483.346a1.846 1.846 0 0 1 0 2.6 1.846 1.846 0 0 1-2.6 0 1.846 1.846 0 0 1 0-2.6c.157-.157.34-.279.536-.362V8.909a1.847 1.847 0 0 1-1.003-2.416l-2.71-2.7-5.26 5.255a1.55 1.55 0 0 0 0 2.188L13.63 23.548a1.55 1.55 0 0 0 2.187 0l7.73-7.727a1.55 1.55 0 0 0 0-2.188"/></svg>,
  'Figma': <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#F24E1E" d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z"/><path fill="#FF7262" d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z"/><path fill="#A259FF" d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z"/><path fill="#1ABCFE" d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z"/><path fill="#0ACF83" d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z"/></svg>,
  'PostgreSQL': '🐘', 'MongoDB': '🍃', 'MySQL': '🐬', 'Redis': '🔴',
  'SQLite': '📦', 'Firebase': '🔥', 'Supabase': '⚡',
  'Machine Learning': '🤖', 'Deep Learning': '🧠', 'TensorFlow': '⚡',
  'PyTorch': '🔥', 'Pandas': '🐼', 'NumPy': '🔢', 'Scikit-learn': '📊',
  'Data Analysis': '📈', 'NLP': '💬', 'Computer Vision': '👁️',
  'Statistics': '📉', 'Tableau': '📊', 'Power BI': '📊', 'Matplotlib': '📈',
  'DSA': '🧩', 'Algorithms': '🧮', 'Data Structures': '🌳',
  'Operating Systems': '💻', 'Computer Networks': '🌐',
  'Database Management': '🗄️', 'System Design': '🏗️', 'OOP': '🎯',
  'AWS': <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF9900"><path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586z"/></svg>,
  'Azure': '🔷', 'GCP': '☁️', 'Kubernetes': '☸️',
  'CI/CD': '🔄', 'Linux': '🐧', 'Jenkins': '⚙️', 'Terraform': '🏔️',
  'Ansible': '🔧', 'Nginx': '🚦', 'Shell Scripting': '💻',
  'Express.js': '🚂', 'Django': '🎸', 'FastAPI': '⚡', 'REST API': '🔌',
  'GraphQL': '🔮', 'Flask': '🧪', 'Spring Boot': '🌱', 'Laravel': '🎭',
  'Ruby on Rails': '💎', 'NestJS': '🐈', 'Microservices': '🧱',
  'WebSockets': '🔌',
  'Tailwind CSS': <svg width="14" height="14" viewBox="0 0 24 24" fill="#06B6D4"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/></svg>,
  'Vue.js': '💚', 'Angular': '🅰️', 'Svelte': '🟠', 'Redux': '🟣',
  'Sass/SCSS': '💅', 'Bootstrap': '🅱️', 'Material UI': '🎨',
  'jQuery': '💲', 'Webpack': '📦', 'Vite': '⚡',
  'React Native': '📱', 'Flutter': '🦋', 'Android Dev': '🤖',
  'iOS Dev': '🍎', 'Jetpack Compose': '🧩', 'SwiftUI': '🦅',
  'GitHub': '🐙', 'VS Code': '💻', 'Postman': '📮',
  'Jira': '🎯', 'Notion': '📝', 'Slack': '💬',
  'Adobe XD': '🎨', 'Photoshop': '🖼️', 'Illustrator': '✏️',
  'UI/UX Design': '🎨', 'Wireframing': '📐', 'Prototyping': '🔧',
  'SEO': '🔍', 'Social Media Marketing': '📱', 'Content Writing': '✍️',
  'Email Marketing': '📧', 'Google Ads': '🎯', 'Meta Ads': '📘',
  'Google Analytics': '📊', 'Copywriting': '✍️', 'Brand Strategy': '🏷️',
  'Shopify': '🛒', 'WooCommerce': '🛍️', 'Amazon Seller': '📦',
  'Product Listing': '📋',
  'Google Workspace': '📧', 'MS Office': '📊', 'Sales Analysis': '💰',
  'Competitor Research': '🔎', 'Project Management': '📋', 'Agile/Scrum': '🔁',
  'DynamoDB': '⚡', 'Cassandra': '🗃️', 'ElasticSearch': '🔎',
};

export const getSkillLogo = (name) => {
  const logo = SKILL_LOGOS[name];
  if (!logo) return <span style={{ fontSize: 12 }}>⚬</span>;
  if (typeof logo === 'string') return <span style={{ fontSize: 12 }}>{logo}</span>;
  return logo;
};

// ── Coding platform logos ──────────────────────────────────────────────────
export const PLATFORM_LOGOS = {
  leetcode:     { label:'LeetCode',     color:'#FFA116', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg> },
  github_username:{ label:'GitHub',    color:'#24292e', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> },
  codechef:     { label:'CodeChef',     color:'#5B4638', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M11.257.004C5.23-.105.13 4.837.004 10.862c-.127 6.024 4.815 11.124 10.839 11.25 6.025.127 11.125-4.815 11.25-10.839.128-6.025-4.814-11.124-10.836-11.27zm-.103 2.872c1.613-.032 3.236.473 4.552 1.489.283.215.554.45.8.705l-1.6 1.6a5.267 5.267 0 0 0-.622-.541 5.097 5.097 0 0 0-6.124.255l-1.556-1.556a8.06 8.06 0 0 1 4.55-1.952zm-5.69 2.92 1.559 1.559a5.108 5.108 0 0 0-.867 4.797l-1.863.497a7.218 7.218 0 0 1 1.172-6.854zm12.09.476a7.209 7.209 0 0 1 .875 6.54l-1.854-.495a5.107 5.107 0 0 0-.594-4.527zm-10.78 4.34h1.697v2.094H10.6v1.697H8.773zm4.47 0H14.2v1.697h1.698v.397H14.2v1.697h-1.696v-1.697H10.81v-.397h1.697zm-4.47 4.493h6.172v1.697H7.074z"/></svg> },
  codeforces:   { label:'Codeforces',   color:'#1F8ACB', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5V19.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V4.5C9 3.672 9.672 3 10.5 3h3zm9 7.5c.828 0 1.5.672 1.5 1.5v9c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V15c0-.828.672-1.5 1.5-1.5h3z"/></svg> },
  kaggle:       { label:'Kaggle',       color:'#20BEFF', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .236.06.285.18.046.149.034.255-.036.315l-6.555 6.344 6.836 8.507c.095.104.117.208.07.336z"/></svg> },
  hackerrank:   { label:'HackerRank',   color:'#2EC866', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 0c1.285 0 9.75 4.886 10.392 6 .645 1.115.645 10.885 0 12S13.287 24 12 24C10.712 24 2.25 19.115 1.608 18 .963 16.886.963 7.115 1.608 6 2.253 4.886 10.715 0 12 0zm2.205 6.015a.648.648 0 0 0-.654.645.637.637 0 0 0 .654.647h.663v3.275h-5.332V7.307h.662a.643.643 0 0 0 .654-.645A.644.644 0 0 0 9.798 6h-3.3a.644.644 0 0 0-.654.645.645.645 0 0 0 .654.647h.662v10.11h-.662a.646.646 0 0 0 0 1.292h3.3a.646.646 0 0 0 0-1.293h-.662v-3.967h5.332v3.967h-.663a.646.646 0 0 0 0 1.292h3.3a.645.645 0 0 0 .654-.645.645.645 0 0 0-.654-.647h-.663V7.307h.663a.638.638 0 0 0 .654-.647.648.648 0 0 0-.654-.645h-3.3z"/></svg> },
  codingninjas: { label:'Coding Ninjas', color:'#FF5E3A', svg: <span style={{ fontSize: 10, fontWeight: 800, color: 'white' }}>CN</span> },
  geeksforgeeks:{ label:'GeeksforGeeks', color:'#2F8D46', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M21.45 14.315c-.143.28-.334.532-.565.745a3.692 3.692 0 0 1-1.104.695 4.51 4.51 0 0 1-3.116 0 4.573 4.573 0 0 1-1.104-.695 3.553 3.553 0 0 1-.565-.745h-6.19a3.553 3.553 0 0 1-.565.745 4.573 4.573 0 0 1-1.104.695 4.51 4.51 0 0 1-3.116 0 4.573 4.573 0 0 1-1.104-.695 3.692 3.692 0 0 1-.565-.745H0v-1.89h1.354a5.836 5.836 0 0 1-.16-1.025A5.847 5.847 0 0 1 3.68 7.007a5.783 5.783 0 0 1 2.085-.39c.76 0 1.49.145 2.17.435a5.63 5.63 0 0 1 1.83 1.28l1.235 1.38 1.235-1.38a5.63 5.63 0 0 1 1.83-1.28 5.783 5.783 0 0 1 2.17-.435c.76 0 1.49.145 2.17.435a5.783 5.783 0 0 1 2.487 2.393 5.847 5.847 0 0 1 .645 2.965c-.015.35-.06.693-.16 1.025H24v1.89h-2.55zm-9.45-1.78l-1.91-2.135a4.06 4.06 0 0 0-1.355-.94 3.717 3.717 0 0 0-1.5-.31c-.55 0-1.055.1-1.52.31a4.04 4.04 0 0 0-1.215.835 3.907 3.907 0 0 0-.81 1.215 3.84 3.84 0 0 0 0 2.94c.19.455.46.865.81 1.215a4.04 4.04 0 0 0 1.215.835 3.717 3.717 0 0 0 1.52.31c.53 0 1.035-.105 1.5-.31.465-.21.88-.5 1.255-.88l1.81-2.085zm9.85 0l-1.81-2.085a4.06 4.06 0 0 0-1.255-.88 3.717 3.717 0 0 0-1.5-.31c-.55 0-1.055.1-1.52.31a4.04 4.04 0 0 0-1.215.835 3.907 3.907 0 0 0-.81 1.215 3.84 3.84 0 0 0 0 2.94c.19.455.46.865.81 1.215a4.04 4.04 0 0 0 1.215.835 3.717 3.717 0 0 0 1.52.31c.53 0 1.035-.105 1.5-.31a4.06 4.06 0 0 0 1.355-.94l1.71-2.135z"/></svg> },
};
