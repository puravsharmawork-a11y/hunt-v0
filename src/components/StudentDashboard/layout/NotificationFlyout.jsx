// src/components/StudentDashboard/layout/NotificationFlyout.jsx
import React from 'react';
import { Bell } from 'lucide-react';

export function NotificationFlyout({ notifications, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
      <div style={{ position: 'fixed', bottom: '130px', left: '218px', width: '300px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', zIndex: 100, boxShadow: '0 8px 28px rgba(0,0,0,0.12)', overflow: 'hidden', animation: 'hunt-fade-in 0.15s ease' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>Notifications</p>
          {notifications.length > 0 && <span style={{ fontSize: '10px', color: 'var(--text-dim)', cursor: 'pointer' }}>Mark all read</span>}
        </div>
        {notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <Bell size={22} style={{ color: 'var(--text-dim)', display: 'block', margin: '0 auto 10px' }} />
            <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '4px', fontFamily: "'Editorial New', Georgia, serif" }}>All clear</p>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No notifications right now.</p>
          </div>
        ) : (
          <div>
            {notifications.map((n, i) => (
              <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '2px' }}>{n.text}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
