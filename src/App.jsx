// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChange, supabase } from './services/supabase';
import LandingPage from './components/LandingPage';
import StudentOnboarding from './components/StudentOnboarding';
import StudentDashboard from './components/StudentDashboard';
import RecruiterOnboarding from './components/RecruiterOnboarding';
import RecruiterDashboard from './components/RecruiterDashboard';
import ApplyPage from './components/ApplyPage';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);          // 'student' | 'recruiter' | null
  const [loading, setLoading] = useState(true);

  // Look up which table the auth user belongs to
  const detectRole = async (authUser) => {
    if (!authUser) return null;
    const [{ data: rec }, { data: stu }] = await Promise.all([
      supabase.from('recruiters').select('id').eq('auth_id', authUser.id).maybeSingle(),
      supabase.from('students').select('id').eq('auth_id', authUser.id).maybeSingle(),
    ]);
    if (rec) return 'recruiter';
    if (stu) return 'student';
    return 'new'; // logged in but no profile row yet
  };

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      const u = session?.user || null;
      setUser(u);
      setRole(await detectRole(u));
      setLoading(false);
    });
    return () => subscription?.unsubscribe();
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

  // Where should a logged-in user land by default?
  const homeForRole = () => {
    if (role === 'recruiter') return '/recruiter/dashboard';
    if (role === 'student')   return '/studentdashboard';
    return '/onboarding'; // logged in but no profile — pick a default onboarding
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Root: route by role, not blanket student redirect */}
        <Route
          path="/"
          element={user ? <Navigate to={homeForRole()} replace /> : <LandingPage />}
        />

        {/* Student */}
        <Route
          path="/onboarding"
          element={user ? <StudentOnboarding /> : <Navigate to="/" replace />}
        />
        <Route
          path="/studentdashboard"
          element={
            user
              ? (role === 'recruiter'
                  ? <Navigate to="/recruiter/dashboard" replace />
                  : <StudentDashboard />)
              : <Navigate to="/" replace />
          }
        />

        {/* Recruiter */}
        <Route
          path="/recruiter/onboarding"
          element={user ? <RecruiterOnboarding /> : <Navigate to="/" replace />}
        />
        <Route
          path="/recruiter/dashboard"
          element={
            user
              ? (role === 'student'
                  ? <Navigate to="/studentdashboard" replace />
                  : <RecruiterDashboard />)
              : <Navigate to="/" replace />
          }
        />

        <Route path="/apply/:slug" element={<ApplyPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
