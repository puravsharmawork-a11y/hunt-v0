// src/components/LandingPage.jsx
import React from 'react';
import { Zap, Target, TrendingUp, Award } from 'lucide-react';
import { signInWithGoogle } from '../services/supabase';

export default function LandingPage() {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="inline-block">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  HUNT
                </span>
              </h1>
              <p className="text-zinc-400 text-sm md:text-base mt-2">
                Internships. Not noise.
              </p>
            </div>

            {/* Headline */}
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Fewer Applications.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                  More Interviews.
                </span>
              </h2>
              <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
                Swipe through matched internships. Apply to 5 best-fit roles per week. 
                Get interviews, not rejections.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleSignIn}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold text-lg hover:from-blue-400 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </div>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div>
                <div className="text-3xl md:text-4xl font-black text-green-400">5</div>
                <div className="text-sm text-zinc-500 mt-1">Applications/week</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-black text-blue-400">40-60%</div>
                <div className="text-sm text-zinc-500 mt-1">Interview rate</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-black text-purple-400">0₹</div>
                <div className="text-sm text-zinc-500 mt-1">Always free</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Matching</h3>
            <p className="text-zinc-400 text-sm">
              AI matches your skills with internships. Only see roles you actually qualify for.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Weekly Limits</h3>
            <p className="text-zinc-400 text-sm">
              5 applications per week. Forces you to apply smart, not spam.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-green-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Higher Success</h3>
            <p className="text-zinc-400 text-sm">
              40-60% interview rate vs 2-5% on LinkedIn. Quality over quantity works.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Tier 2/3 First</h3>
            <p className="text-zinc-400 text-sm">
              Built for students whose college name doesn't open doors. Skills do.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-black text-center mb-12">How It Works</h2>
        
        <div className="space-y-8">
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center font-black text-xl">
              1
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Create Your Profile</h3>
              <p className="text-zinc-400">
                Takes 3 minutes. Add skills, projects, and preferences. Import from GitHub to auto-fill.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center font-black text-xl">
              2
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Swipe Through Matches</h3>
              <p className="text-zinc-400">
                See internships ranked by match score. Swipe right on roles you want, left on ones you don't.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-orange-600 flex items-center justify-center font-black text-xl">
              3
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Apply to Top 5</h3>
              <p className="text-zinc-400">
                5 applications per week limit. Choose wisely. See match breakdown before applying.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-green-600 flex items-center justify-center font-black text-xl">
              4
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Get Interviews</h3>
              <p className="text-zinc-400">
                Track application status. Get feedback. Actually hear back from companies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to stop being invisible?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
            Join HUNT and start applying to internships that actually want your skills.
          </p>
          <button
            onClick={handleSignIn}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-lg hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25 hover:scale-105"
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}
