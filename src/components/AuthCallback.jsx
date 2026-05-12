// src/components/AuthCallback.jsx
//
// This page sits at /auth/callback — the URL Google redirects back to after
// OAuth. Supabase exchanges the code, fires onAuthStateChange, and then this
// component decides WHERE to send the user based on:
//
//   1. `intended_role` query param  (set in the signIn helpers, e.g. ?intended_role=recruiter)
//   2. Whether the user already has a profile in `students` or `recruiters`
//
// Decision table:
//
//  existing role | intended role | result
//  ─────────────────────────────────────────────────────────────────────────
//  student       | student       | → /studentdashboard
//  student       | recruiter     | → BLOCKED (show "already a student" error)
//  recruiter     | recruiter     | → /recruiter/dashboard
//  recruiter     | student       | → BLOCKED (show "already a recruiter" error)
//  none          | student       | → /onboarding  (new student)
//  none          | recruiter     | → /recruiter/onboarding (new recruiter)
//  none          | none          | → /onboarding  (default: student)
//  waitlist      | recruiter     | → /recruiter/onboarding

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getExistingRole } from '../services/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Read the intended_role the sign-in helper stamped into the redirect URL.
    // e.g. /auth/callback?intended_role=recruiter
    const params = new URLSearchParams(window.location.search);
    // Also check hash params — some OAuth flows append them there
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    const intendedRole =
      params.get('intended_role') ||
      hashParams.get('intended_role') ||
      null;

    // Wait for Supabase to finish exchanging the code for a session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) return; // still loading

        const user = session.user;
        const existingRole = await getExistingRole(user.id, user.email);

        // ── Case 1: User already has a profile ──────────────────────────────
        if (existingRole === 'student') {
          if (intendedRole === 'recruiter') {
            // Signed in on the recruiter side but is already a student
            setError({
              type: 'wrong_side',
              message: 'This Google account is registered as a student.',
              hint: 'Sign in on the student side to access your dashboard, or use a different Google account to register as a recruiter.',
              cta: { label: 'Go to student sign-in', path: '/' },
            });
            return;
          }
          navigate('/studentdashboard', { replace: true });
          return;
        }

        if (existingRole === 'recruiter') {
          if (intendedRole === 'student') {
            // Signed in on the student side but is already a recruiter
            setError({
              type: 'wrong_side',
              message: 'This Google account is registered as a recruiter.',
              hint: 'Switch to the "I\'m a Startup" view and sign in there, or use a different Google account to register as a student.',
              cta: { label: 'Go to recruiter sign-in', path: '/?mode=startup' },
            });
            return;
          }
          navigate('/recruiter/dashboard', { replace: true });
          return;
        }

        // ── Case 2: In waitlist (approved recruiter, not yet onboarded) ─────
        if (existingRole === 'recruiter_waitlist') {
          navigate('/recruiter/onboarding', { replace: true });
          return;
        }

        // ── Case 3: Brand new user — route by intended role ─────────────────
        if (intendedRole === 'recruiter') {
          navigate('/recruiter/onboarding', { replace: true });
        } else {
          // Default: student onboarding
          navigate('/onboarding', { replace: true });
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [navigate]);

  // ── Error screen ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        <div style={{
          maxWidth: 440,
          width: '100%',
          background: '#131210',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 16,
          padding: '40px 36px',
          textAlign: 'center',
        }}>
          {/* Icon */}
          <div style={{
            width: 56, height: 56,
            borderRadius: '50%',
            background: 'rgba(216,90,48,0.12)',
            border: '1.5px solid rgba(216,90,48,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 24,
          }}>
            ⚠️
          </div>

          <p style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#D85A30',
            marginBottom: 12,
          }}>
            Account conflict
          </p>

          <h2 style={{
            fontFamily: "'Editorial New', Georgia, serif",
            fontSize: 26,
            fontWeight: 400,
            color: '#FAFAF8',
            marginBottom: 14,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}>
            {error.message}
          </h2>

          <p style={{
            fontSize: 13,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.65,
            marginBottom: 32,
          }}>
            {error.hint}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              href={error.cta.path}
              style={{
                display: 'block',
                padding: '12px 24px',
                background: '#D85A30',
                color: '#fff',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {error.cta.label}
            </a>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '11px 24px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.35)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 8,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
              }}
            >
              Sign out and try a different account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading screen ────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 48,
          marginBottom: 20,
          display: 'inline-block',
          animation: 'pulse 1.4s ease-in-out infinite',
        }}>
          🎯
        </div>
        <p style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.06em',
        }}>
          Signing you in…
        </p>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.92); }
        }
      `}</style>
    </div>
  );
}
