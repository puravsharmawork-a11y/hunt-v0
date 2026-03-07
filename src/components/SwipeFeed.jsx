// src/components/SwipeFeed.jsx
import React, { useState, useEffect } from 'react';
import { Heart, X, TrendingUp, Target, Briefcase, MapPin, Clock, AlertCircle, CheckCircle2, ChevronRight, Zap, Award, LogOut } from 'lucide-react';
import { getStudentProfile, getActiveJobs, createApplication, getWeeklyApplicationCount, signOut } from '../services/supabase';
import { calculateMatchScore } from '../services/matching';
import { sendToAirtable, prepareApplicationData } from '../services/airtable';
import { useNavigate } from 'react-router-dom';

export default function SwipeFeed() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showMatchBreakdown, setShowMatchBreakdown] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [skippedJobs, setSkippedJobs] = useState([]);
  const [matchData, setMatchData] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [weeklyApplications, setWeeklyApplications] = useState(0);
  const [applying, setApplying] = useState(false);
  
  const WEEKLY_LIMIT = 5;
  const currentJob = jobs[currentIndex];
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (currentJob && studentProfile) {
      const match = calculateMatchScore(studentProfile, currentJob);
      setMatchData(match);
    }
  }, [currentIndex, studentProfile, currentJob]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get student profile
      const profile = await getStudentProfile();
      if (!profile) {
        navigate('/onboarding');
        return;
      }
      setStudentProfile(profile);
      
      // Get active jobs
      const activeJobs = await getActiveJobs();
      
      // Calculate match scores and filter
      const jobsWithScores = activeJobs.map(job => ({
        ...job,
        matchScore: calculateMatchScore(profile, job)
      }));
      
      // Filter: only show jobs with 50%+ match and not full
      const relevantJobs = jobsWithScores.filter(job => 
        job.matchScore.score >= 50 && 
        job.current_applicants < job.max_applicants
      );
      
      // Sort by match score
      relevantJobs.sort((a, b) => b.matchScore.score - a.matchScore.score);
      
      setJobs(relevantJobs);
      
      // Get weekly application count
      const count = await getWeeklyApplicationCount();
      setWeeklyApplications(count);
      
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load jobs. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSwipe = (direction) => {
    if (applying) return;
    
    setSwipeDirection(direction);
    
    setTimeout(() => {
      if (direction === 'right') {
        if (weeklyApplications >= WEEKLY_LIMIT) {
          alert('Weekly application limit reached! Come back next week.');
          setSwipeDirection(null);
          return;
        }
        setShowMatchBreakdown(true);
      } else {
        setSkippedJobs([...skippedJobs, currentJob.id]);
        moveToNext();
      }
      setSwipeDirection(null);
    }, 300);
  };
  
  const moveToNext = () => {
    setShowMatchBreakdown(false);
    if (currentIndex < jobs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handleApply = async () => {
    if (applying || weeklyApplications >= WEEKLY_LIMIT) return;
    
    setApplying(true);
    
    try {
      // Create application in Supabase
      await createApplication(
        currentJob.id,
        matchData.score,
        matchData.breakdown
      );
      
      // Send to Airtable
      const airtableData = prepareApplicationData(
        studentProfile,
        currentJob,
        matchData.score,
        matchData.breakdown
      );
      await sendToAirtable(airtableData);
      
      // Update local state
      setAppliedJobs([...appliedJobs, { 
        ...currentJob, 
        matchScore: matchData.score 
      }]);
      setWeeklyApplications(weeklyApplications + 1);
      
      alert('✅ Application submitted successfully!');
      moveToNext();
    } catch (error) {
      console.error('Application error:', error);
      alert('Failed to submit application: ' + error.message);
    } finally {
      setApplying(false);
    }
  };
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      setDragOffset({ x: e.movementX * 2, y: e.movementY * 0.5 });
    }
  };
  
  const handleMouseUp = () => {
    if (Math.abs(dragOffset.x) > 100) {
      handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
    }
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  const remainingApplications = WEEKLY_LIMIT - weeklyApplications;
  const canApply = remainingApplications > 0;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl font-bold">Loading opportunities...</p>
        </div>
      </div>
    );
  }
  
  if (!currentJob) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎯</div>
          <h2 className="text-3xl font-bold">All caught up!</h2>
          <p className="text-zinc-400">No more opportunities right now. Check back soon.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black tracking-tighter text-white">HUNT</div>
            <div className="h-6 w-px bg-zinc-700"></div>
            <div className="text-sm text-zinc-400">Discovery</div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold">{remainingApplications}/5 left</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                {studentProfile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
              <button
                onClick={handleSignOut}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Completeness Warning */}
      {studentProfile?.profile_completeness < 80 && (
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-200">
                Profile {studentProfile.profile_completeness}% complete
              </p>
              <p className="text-xs text-amber-300/70 mt-1">
                Complete your profile to increase match scores
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LEFT: Job Card */}
          <div className="relative">
            <div 
              className={`
                bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden
                transition-all duration-300 ease-out
                ${swipeDirection === 'right' ? 'translate-x-[200px] opacity-0 rotate-12' : ''}
                ${swipeDirection === 'left' ? '-translate-x-[200px] opacity-0 -rotate-12' : ''}
                ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
              `}
              style={{
                transform: isDragging ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)` : undefined
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Match Score Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className={`
                  px-4 py-2 rounded-full font-black text-2xl backdrop-blur-sm
                  ${matchData && matchData.score >= 75 ? 'bg-green-500/20 text-green-400 border-2 border-green-500' :
                    matchData && matchData.score >= 50 ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500' :
                    'bg-red-500/20 text-red-400 border-2 border-red-500'}
                `}>
                  {matchData?.score}%
                </div>
              </div>
              
              {/* Company Header */}
              <div className="p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 border-b border-zinc-800">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{currentJob.logo}</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      {currentJob.company}
                    </div>
                    <h2 className="text-2xl font-black text-white leading-tight mb-2">
                      {currentJob.role}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">
                        {currentJob.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Job Details */}
              <div className="p-6 space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-400">{currentJob.stipend}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-400">{currentJob.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-400">{currentJob.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-400">{currentJob.current_applicants}/{currentJob.max_applicants} applied</span>
                  </div>
                </div>
                
                {/* Competition Level */}
                <div className={`
                  px-3 py-2 rounded-lg border flex items-center gap-2
                  ${matchData?.competitionLevel === 'High' ? 'bg-red-500/10 border-red-500/30' :
                    matchData?.competitionLevel === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-green-500/10 border-green-500/30'}
                `}>
                  <TrendingUp className={`w-4 h-4 ${
                    matchData?.competitionLevel === 'High' ? 'text-red-400' :
                    matchData?.competitionLevel === 'Medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`} />
                  <span className="text-sm font-semibold">
                    {matchData?.competitionLevel} Competition
                  </span>
                </div>
                
                {/* Description */}
                <div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {currentJob.description}
                  </p>
                </div>
                
                {/* Required Skills */}
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                    Required Skills
                  </h3>
                  <div className="space-y-2">
                    {currentJob.required_skills?.map((skill, idx) => {
                      const matched = matchData?.matchedSkills.find(s => s.name === skill.name);
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {matched ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm ${matched ? 'text-white' : 'text-zinc-500'}`}>
                              {skill.name}
                            </span>
                          </div>
                          {matched && (
                            <span className="text-xs text-zinc-500">
                              L{matched.studentLevel}/{skill.level}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Nice to Have */}
                {currentJob.nice_to_have?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                      Nice to Have
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentJob.nice_to_have.map((skill, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-zinc-800/50 rounded border border-zinc-700 text-zinc-400">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Swipe Actions */}
            <div className="mt-6 flex items-center justify-center gap-6">
              <button
                onClick={() => handleSwipe('left')}
                disabled={applying}
                className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-red-500/50 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500 transition-all group disabled:opacity-50"
              >
                <X className="w-7 h-7 text-red-500 group-hover:scale-110 transition-transform" />
              </button>
              
              <div className="text-center px-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Swipe or Click</p>
              </div>
              
              <button
                onClick={() => handleSwipe('right')}
                disabled={!canApply || applying}
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center transition-all group
                  ${canApply && !applying
                    ? 'bg-zinc-900 border-2 border-green-500/50 hover:bg-green-500/10 hover:border-green-500' 
                    : 'bg-zinc-900 border-2 border-zinc-800 opacity-50 cursor-not-allowed'}
                `}
              >
                <Heart className={`w-7 h-7 ${canApply && !applying ? 'text-green-500 group-hover:scale-110' : 'text-zinc-600'} transition-transform`} />
              </button>
            </div>
          </div>
          
          {/* RIGHT: Match Breakdown or Applied Jobs */}
          <div>
            {showMatchBreakdown ? (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-black">Match Breakdown</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      How your profile aligns with this role
                    </p>
                  </div>
                  <div className="text-4xl font-black text-green-400">
                    {matchData?.score}%
                  </div>
                </div>
                
                {/* Score Breakdown */}
                <div className="space-y-4">
                  {Object.entries(matchData?.breakdown || {}).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-bold text-white">{value}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Missing Skills Alert */}
                {matchData?.missingSkills.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-red-400 mb-2">Skills Gap</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchData.missingSkills.map((skill, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-red-500/20 rounded border border-red-500/40 text-red-300">
                          {skill.name} (L{skill.level})
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-red-300/70 mt-2">
                      Consider learning these to strengthen your application
                    </p>
                  </div>
                )}
                
                {/* Application CTA */}
                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  <button
                    onClick={handleApply}
                    disabled={!canApply || applying}
                    className={`
                      w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                      ${canApply && !applying
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/20' 
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
                    `}
                  >
                    {applying ? (
                      'Submitting...'
                    ) : !canApply ? (
                      'Weekly Application Limit Reached'
                    ) : (
                      <>
                        Apply Now
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={moveToNext}
                    disabled={applying}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all disabled:opacity-50"
                  >
                    Skip for Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Applied This Week
                </h3>
                
                {appliedJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">🎯</div>
                    <p className="text-sm text-zinc-500">No applications yet</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Swipe right on jobs you're interested in
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appliedJobs.map((job, idx) => (
                      <div key={idx} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">{job.logo}</span>
                              <div>
                                <h4 className="font-bold text-sm">{job.role}</h4>
                                <p className="text-xs text-zinc-500">{job.company}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black text-green-400">{job.matchScore}%</div>
                            <p className="text-xs text-zinc-500">match</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Applications Remaining */}
                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Applications Remaining</span>
                    <span className="text-lg font-black text-white">{remainingApplications}/5</span>
                  </div>
                  <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full transition-all"
                      style={{ width: `${(remainingApplications / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      {/* Footer Stats */}
      <div className="border-t border-zinc-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-black text-white">{currentIndex + 1}/{jobs.length}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Jobs Reviewed</div>
            </div>
            <div>
              <div className="text-2xl font-black text-green-400">{appliedJobs.length}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Applied</div>
            </div>
            <div>
              <div className="text-2xl font-black text-red-400">{skippedJobs.length}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Skipped</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
