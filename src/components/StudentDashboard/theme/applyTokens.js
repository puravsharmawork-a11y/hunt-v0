// src/components/StudentDashboard/theme/applyTokens.js
import { tokens } from './tokens';

export function applyTokens(theme) {
  const root = document.documentElement;
  Object.entries(tokens[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
}
