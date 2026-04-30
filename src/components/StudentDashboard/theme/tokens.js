// src/components/StudentDashboard/theme/tokens.js
// ─── HUNT brutalist / bitmap design tokens ───────────────────────────────────
// Cream / ink / electric-blue palette inspired by the HUNT landing page.
// Names are kept identical to the previous palette so every existing
// `var(--green)`, `var(--bg-card)`, `var(--text-mid)` etc. keeps working —
// "green" now actually resolves to electric blue (the new accent).

export const tokens = {
  light: {
    /* Surfaces */
    '--bg':         '#F2F0E8',  // cream
    '--bg-card':    '#FAF8F0',  // paper
    '--bg-subtle':  '#E8E5DA',  // cream-2
    '--border':     '#1413180E',
    '--border-mid': '#14130E22',

    /* Text */
    '--text':       '#14130E',  // ink
    '--text-mid':   '#3A362A',
    '--text-dim':   '#6E6955',
    '--text-faint': '#A8A28C',

    /* Accent — was green, now electric blue.
       Kept under --green / --green-tint / --green-text aliases so existing
       components keep working without find-and-replace. */
    '--green':      '#1A35E8',
    '--green-tint': '#E3E7FB',
    '--green-text': '#0B1BA0',

    /* Status */
    '--red':        '#B8281C',
    '--red-tint':   '#F7D9D4',
    '--amber':      '#B85C00',
    '--amber-tint': '#F7E7D2',

    /* Brutalist-only extras */
    '--ink':        '#14130E',
    '--cream':      '#F2F0E8',
    '--cream-2':    '#E8E5DA',
    '--cream-3':    '#DDD9CB',
    '--paper':      '#FAF8F0',
    '--blue':       '#1A35E8',
    '--blue-tint':  '#E3E7FB',
    '--blue-deep':  '#0B1BA0',
    '--rule':       '#14130E',
  },
  dark: {
    '--bg':         '#0E0E0C',
    '--bg-card':    '#16150F',
    '--bg-subtle':  '#1C1B15',
    '--border':     '#ffffff12',
    '--border-mid': '#ffffff22',

    '--text':       '#F2F0E8',
    '--text-mid':   '#C9C5B4',
    '--text-dim':   '#8A8572',
    '--text-faint': '#5A5646',

    '--green':      '#6B82F7',
    '--green-tint': '#1E2448',
    '--green-text': '#C0CAFB',

    '--red':        '#E5726A',
    '--red-tint':   '#301814',
    '--amber':      '#E9B25A',
    '--amber-tint': '#2E2413',

    '--ink':        '#F2F0E8',
    '--cream':      '#0E0E0C',
    '--cream-2':    '#16150F',
    '--cream-3':    '#1E1C17',
    '--paper':      '#16150F',
    '--blue':       '#6B82F7',
    '--blue-tint':  '#1E2448',
    '--blue-deep':  '#C0CAFB',
    '--rule':       '#F2F0E8',
  },
};
