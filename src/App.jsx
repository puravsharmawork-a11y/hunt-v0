// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChange } from './services/supabase';
import { supabase } from './services/supabase';
import AuthCallback from './components/AuthCallback';
import { getExistingRole } from './services/supabase';
import LandingPage from './components/LandingPage';
import StudentOnboarding from './components/StudentOnboarding';
import StudentDashboard from './components/StudentDashboard';
import RecruiterOnboarding from './components/RecruiterOnboarding';
import RecruiterDashboard from './components/RecruiterDashboard';
import ApplyPage from './components/ApplyPage';
import AdminDashboard from './components/AdminDashboard';

function SmartRedirect({ user }) {
  const [destination, setDestination] = useState(null);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const role = await getExistingRole(user.id, user.email);
      if (role === 'student') setDestination('/studentdashboard');
      else if (role === 'recruiter') setDestination('/recruiter/dashboard');
      else if (role === 'recruiter_waitlist') setDestination('/recruiter/onboarding');
      else setDestination('/onboarding');
    })();
  }, [user]);
  if (!destination) return <LoadingScreen />;
  return <Navigate to={destination} replace />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🎯</div>
        <p className="text-xl font-bold">Loading HUNT...</p>
      </div>
    </div>
  );
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
        
        {/* ── OAuth callback — the ONLY place routing decisions happen after Google redirects ── */}
        {/* Always accessible (no auth guard) because Supabase hasn't set the session yet */}
        <Route 
          path="/auth/callback" 
          element={<AuthCallback />} 
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
