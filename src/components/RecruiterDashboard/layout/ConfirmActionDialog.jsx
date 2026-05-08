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

export function ConfirmActionDialog({ open, action, candidateName, onConfirm, onCancel }) {
  if (!open) return null;
  const meta = {
    hired:     { icon: Award,      color: 'var(--purple)', label: 'Hire',      question: 'hire',       emoji: '🎉' },
    interview: { icon: Phone,      color: 'var(--blue)',   label: 'Interview', question: 'schedule an interview with', emoji: '📞' },
  };
  const m = meta[action];
  if (!m) return null;
  const Icon = m.icon;
  return (
    <div
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px 22px', maxWidth: 380, width: '100%', boxShadow: '0 16px 60px rgba(0,0,0,0.2)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `color-mix(in srgb, ${m.color} 12%, transparent)`, border: `1px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={18} style={{ color: m.color }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Confirm {m.label} {m.emoji}</p>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>This will notify the candidate</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 20 }}>
          Do you want to {m.question} <strong style={{ color: 'var(--text)' }}>{candidateName}</strong>?
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mid)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: m.color, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {m.label}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. NOTIFICATION DRAWER
