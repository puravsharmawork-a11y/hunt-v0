import React from 'react';
import {
  Plus, LogOut, Sun, Moon, X, ChevronRight,
  MapPin, Users, Link2, Trash2,
  ArrowLeft, Pause, Play, ExternalLink, Github, Building2, Home,
  Layers, UserCheck, GitBranch, Sparkles,
  Bookmark, ThumbsDown, Phone, Award, Bell, Lock, MessageSquare,
  LayoutGrid, List, Edit2, Camera, Image as ImageIcon, ChevronDown,
  CheckCircle, Clock, AlertCircle, Eye, AlertTriangle, Star,
} from 'lucide-react';
import { btnGhost } from '../shared/ui';

export function SettingsModal({ theme, setTheme, onClose, onSignOut }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, maxWidth: 480, width: '100%', boxShadow: '0 12px 48px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: 22, color: 'var(--text)', margin: 0, fontWeight: 400 }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div><p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Appearance</p><p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '3px 0 0' }}>Light or dark mode.</p></div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['light', 'dark'].map(t => <button key={t} onClick={() => setTheme(t)} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: theme === t ? 'var(--bg-subtle)' : 'transparent', border: `1.5px solid ${theme === t ? 'var(--text)' : 'var(--border)'}`, color: 'var(--text)', fontWeight: theme === t ? 600 : 400 }}>{t === 'light' ? <><Sun size={12} /> Light</> : <><Moon size={12} /> Dark</>}</button>)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16 }}>
          <div><p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Sign out</p><p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '3px 0 0' }}>You'll need to log in again.</p></div>
          <button onClick={onSignOut} style={{ ...btnGhost(), color: 'var(--red)', borderColor: 'var(--red)' }}><LogOut size={12} /> Sign out</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SHELL
