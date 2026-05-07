// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChange } from './services/supabase';
import { supabase } from './services/supabase';
import LandingPage from './components/LandingPage';
import StudentOnboarding from './components/StudentOnboarding';
import StudentDashboard from './components/StudentDashboard';
import RecruiterOnboarding from './components/RecruiterOnboarding';
import RecruiterDashboard from './components/RecruiterDashboard';
import ApplyPage from './components/ApplyPage';
import AdminDashboard from './components/AdminDashboard';

// ─── SmartRedirect ────────────────────────────────────────────────────────────
// When a logged-in user hits "/", check if they have a recruiter profile.
// If yes  → /recruiter/dashboard
// If no   → /studentdashboard
// This handles the OAuth callback landing on "/" for BOTH student and recruiter flows.
function SmartRedirect({ user }) {
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('recruiters')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (!error && data) {
          // Has a completed recruiter profile → go to recruiter dashboard
          setDestination('/recruiter/dashboard');
        } else {
          // Check if they're in the recruiter waitlist (approved or not)
          // so we can send them to recruiter onboarding instead of student dashboard
          const { data: waitlist } = await supabase
            .from('recruiter_waitlist')
            .select('approved')
            .eq('email', user.email)
            .maybeSingle();

          if (waitlist) {
            // They registered as a recruiter — send to recruiter onboarding
            setDestination('/recruiter/onboarding');
          } else {
            // No recruiter record at all → student flow
            setDestination('/studentdashboard');
          }
        }
      } catch (e) {
        // On any error, fall back to student dashboard
        setDestination('/studentdashboard');
      }
    })();
  }, [user]);

  if (!destination) {
    // Still checking — show the same loading indicator
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-xl font-bold">Loading HUNT...</p>
        </div>
      </div>
    );
  }

  return <Navigate to={destination} replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-xl font-bold">Loading HUNT...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Root: smart redirect for logged-in users, landing page for guests */}
        <Route
          path="/"
          element={user ? <SmartRedirect user={user} /> : <LandingPage />}
        />

        {/* Student routes */}
        <Route
          path="/onboarding"
          element={user ? <StudentOnboarding /> : <Navigate to="/" />}
        />
        <Route
          path="/studentdashboard"
          element={user ? <StudentDashboard /> : <Navigate to="/" />}
        />

        {/* Recruiter routes */}
        <Route
          path="/recruiter/onboarding"
          element={user ? <RecruiterOnboarding /> : <Navigate to="/" />}
        />
        <Route
          path="/recruiter/dashboard"
          element={user ? <RecruiterDashboard /> : <Navigate to="/" />}
        />

        {/* Public routes */}
        <Route path="/apply/:slug" element={<ApplyPage />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
