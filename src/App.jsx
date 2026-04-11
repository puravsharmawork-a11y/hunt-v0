// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChange } from './services/supabase';
import LandingPage from './components/LandingPage';
import StudentOnboarding from './components/StudentOnboarding';
import SwipeFeed from './components/SwipeFeed';
import StudentProfile from './components/StudentProfile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
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
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/swipe" /> : <LandingPage />} />
        
        {/* Protected routes */}
        <Route 
          path="/onboarding" 
          element={user ? <StudentOnboarding /> : <Navigate to="/" />} 
        />
        <Route 
          path="/swipe" 
          element={user ? <SwipeFeed /> : <Navigate to="/" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <StudentProfile /> : <Navigate to="/" />} 
          />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
