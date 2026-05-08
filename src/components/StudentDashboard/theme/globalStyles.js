// src/components/StudentDashboard/theme/globalStyles.js
// ─── Global stylesheet for the brutalist HUNT dashboard ───────────────────────
// Injected once into <head> by applyTokens(). Provides:
//   • Google Fonts (Inter / Instrument Serif / JetBrains Mono)
//   • CSS reset bits + brutalist utility classes (.kicker, .chip, .btn, .card,
//     .match-bar-track, .bitmap-bg, marquee animation, pixel accents)
// Classes are referenced from every component but every component also
// continues to work even if this isn't loaded — the classes are additive.

export const HUNT_GLOBAL_CSS = `
/* ─── Fonts ─── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* ─── Type primitives ─── */
.hunt-mono   { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; font-feature-settings: 'zero' 1; }
.hunt-serif  { font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif; font-weight: 400; letter-spacing: -0.01em; line-height: 1.05; }
.hunt-sans   { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

.hunt-kicker {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dim);
}
.hunt-kicker-ink { color: var(--text); }
.hunt-kicker-blue { color: var(--blue); }

/* ─── Chip / tag ─── */
.hunt-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 8px;
  border: 1px solid var(--border-mid);
  color: var(--text-mid);
  background: transparent;
  border-radius: 0;
  white-space: nowrap;
}
.hunt-chip-solid { background: var(--ink); color: var(--cream); border-color: var(--ink); }
.hunt-chip-blue { background: var(--blue); color: #fff; border-color: var(--blue); }
.hunt-chip-blue-tint { background: var(--blue-tint); color: var(--blue-deep); border-color: var(--blue); }
.hunt-chip-green { background: var(--green-tint); color: var(--green-text); border-color: var(--green); }
.hunt-chip-amber { background: var(--amber-tint); color: var(--amber); border-color: var(--amber); }
.hunt-chip-red { background: var(--red-tint); color: var(--red); border-color: var(--red); }

/* ─── Brutalist button ─── */
.hunt-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 500;
  padding: 10px 16px;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  border-radius: 0;
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.08s ease, background 0.12s, color 0.12s;
}
.hunt-btn:hover { background: var(--ink); color: var(--cream); }
.hunt-btn-primary {
  background: var(--blue); color: #fff; border-color: var(--blue);
  box-shadow: 3px 3px 0 0 var(--ink);
}
.hunt-btn-primary:hover { background: var(--blue-deep); color: #fff; transform: translate(-1px,-1px); box-shadow: 4px 4px 0 0 var(--ink); }
.hunt-btn-primary:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 0 var(--ink); }
.hunt-btn-dark { background: var(--ink); color: var(--cream); border-color: var(--ink); }
.hunt-btn-dark:hover { background: var(--text-mid); color: var(--cream); }
.hunt-btn-ghost { border-color: var(--border-mid); }
.hunt-btn-sm { padding: 6px 10px; font-size: 10.5px; }
.hunt-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.hunt-btn:disabled:hover { background: transparent; color: var(--ink); }

/* ─── Card ─── */
.hunt-card {
  background: var(--bg-card);
  border: 1px solid var(--border-mid);
  border-radius: 0;
  position: relative;
}
.hunt-card-flat { background: var(--bg-card); border: 1px solid var(--border); border-radius: 0; }

/* ─── Inputs ─── */
.hunt-input {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  padding: 10px 12px;
  border: 1px solid var(--border-mid);
  background: var(--bg-card);
  border-radius: 0;
  color: var(--text);
  width: 100%;
  outline: none;
  box-sizing: border-box;
}
.hunt-input:focus { border-color: var(--ink); }

/* ─── Match bar visual ─── */
.hunt-match-bar-track { height: 4px; background: var(--border-mid); position: relative; overflow: hidden; }
.hunt-match-bar-fill { height: 100%; background: var(--blue); transition: width 0.6s cubic-bezier(.22,1,.36,1); }

/* ─── Bitmap pixel background ─── */
.hunt-bitmap-bg {
  background-image:
    linear-gradient(to right, rgba(20,19,14,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(20,19,14,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
}
[data-theme="dark"] .hunt-bitmap-bg {
  background-image:
    linear-gradient(to right, rgba(242,240,232,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(242,240,232,0.04) 1px, transparent 1px);
}

/* ─── Marquee ─── */
@keyframes hunt-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.hunt-marquee-track { display: flex; gap: 36px; animation: hunt-marquee 40s linear infinite; width: max-content; }

/* ─── Blink for pixel accents ─── */
@keyframes hunt-blink { 0%, 70% { opacity: 1; } 71%, 100% { opacity: 0.1; } }
.hunt-blink { animation: hunt-blink 1.2s steps(2, end) infinite; }

/* ─── Hairline ─── */
.hunt-hairline { border-bottom: 1px solid var(--border); }
.hunt-pixel-rule {
  height: 1px;
  background-image: linear-gradient(to right, var(--rule) 50%, transparent 50%);
  background-size: 8px 1px;
  background-repeat: repeat-x;
  opacity: 0.5;
}

/* ─── Scrollbars ─── */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 0; }
::-webkit-scrollbar-thumb:hover { background: var(--text-faint); }
.hunt-hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hunt-hide-scrollbar::-webkit-scrollbar { display: none; }

/* ─── Range input ─── */
input[type="range"].hunt-range {
  -webkit-appearance: none; appearance: none;
  height: 4px; background: var(--border-mid);
  border-radius: 0; outline: none;
}
input[type="range"].hunt-range::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 14px; height: 14px; background: var(--blue);
  border-radius: 0; border: 2px solid var(--ink); cursor: pointer;
}

/* ─── Animations preserved from prior dashboard ─── */
@keyframes hunt-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.hn-item:hover { background: var(--bg-subtle) !important; }

/* ─── Apply pill (weekly quota) ─── */
.hunt-apply-pill {
  width: 14px; height: 14px; border: 1px solid var(--ink);
  display: inline-block;
  border-radius: 0;
}
.hunt-apply-pill.used { background: var(--blue); }
.hunt-apply-pill.free { background: transparent; }

/* ─── Override default body font in dashboard ─── */
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
`;

let _injected = false;
export function injectHuntGlobalStyles() {
  if (_injected) return;
  if (typeof document === 'undefined') return;
  const tag = document.createElement('style');
  tag.id = 'hunt-global-styles';
  tag.textContent = HUNT_GLOBAL_CSS;
  document.head.appendChild(tag);
  _injected = true;
}
