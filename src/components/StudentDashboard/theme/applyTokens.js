// src/components/StudentDashboard/theme/applyTokens.js
import { tokens } from './tokens';
import { injectHuntGlobalStyles } from './globalStyles';

export function applyTokens(theme) {
  injectHuntGlobalStyles(); // safe to call repeatedly — only runs once
  const root = document.documentElement;
  root.dataset.theme = theme;
  Object.entries(tokens[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
}
