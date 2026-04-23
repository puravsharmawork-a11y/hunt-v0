// src/components/StudentDashboard/index.jsx
// ─── HUNT Candidate Dashboard (orchestrator) ──────────────────────────────────
import React, { useState, useEffect } from 'react';
import { Home, Users, User, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  getStudentProfile, getActiveJobs, createApplication,
  getWeeklyApplicationCount, signOut,
} from '../../services/supabase';
import { calculateMatchScore } from '../../services/matching';
import { sendToAirtable, prepareApplicationData } from '../../services/airtable';

import { applyTokens } from './theme/applyTokens';
import { LoadingScreen } from './shared/LoadingScreen';
import { Sidebar } from './layout/Sidebar';
import { NotificationFlyout } from './layout/NotificationFlyout';
import { SettingsPanel } from './layout/SettingsPanel';
import { HomeTab } from './tabs/HomeTab';
import { ExploreTab } from './tabs/ExploreTab';
import { NetworkTab } from './tabs/NetworkTab';
import { ProfileTab } from './tabs/profile/ProfileTab';

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('hunt-theme') || 'light');
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [weeklyApplications, setWeeklyApplications] = useState(0);
  const [applying, setApplying] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showGuide, setShowGuide] = useState(true);
  const [notified, setNotified] = useState(false);
  // Explore state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'swipe'
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isPanelMaximized, setIsPanelMaximized] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [huntFastActive, setHuntFastActive] = useState(false);
  const [filters, setFilters] = useState({ role: '', location: '', minMatch: 0, stipend: 'Any', duration: 'Any', skill: '' });
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [homeSubTab, setHomeSubTab] = useState('applications');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('account');
  // Mock notifications — empty initially, shows dot when populated
  const notifications = [];

  const WEEKLY_LIMIT = 5;
  const remainingApplications = WEEKLY_LIMIT - weeklyApplications;
  const canApply = remainingApplications > 0;
  const initials = studentProfile?.full_name?.split(' ').map(n => n[0]).join('') || 'U';

  useEffect(() => { applyTokens(theme); localStorage.setItem('hunt-theme', theme); }, [theme]);
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profile = await getStudentProfile();
      if (!profile) { navigate('/onboarding'); return; }
      setStudentProfile(profile);
      const welcomed = localStorage.getItem(`hunt-welcomed-${profile.id}`);
      if (welcomed) { setShowWelcome(false); setShowGuide(false); }
      const activeJobs = await getActiveJobs();
      const jobsWithScores = activeJobs.map(job => ({
        ...job, _match: calculateMatchScore(profile, job)
      }));
      setAllJobs(jobsWithScores.filter(j => j._match.score >= 30).sort((a, b) => b._match.score - a._match.score));
      setWeeklyApplications(await getWeeklyApplicationCount());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFilterChange = (key, val) => {
    if (key === 'reset') { setFilters({ role: '', location: '', minMatch: 0, stipend: 'Any', duration: 'Any', skill: '' }); return; }
    setFilters(prev => ({ ...prev, [key]: prev[key] === val ? '' : val }));
  };

  // Apply all filters + search + hunt fast
  const displayedJobs = allJobs.filter(job => {
    const m = job._match;
    if (m.score < filters.minMatch) return false;
    if (filters.role && !job.role?.toLowerCase().includes(filters.role.toLowerCase())) return false;
    if (filters.location) {
      const loc = job.location?.toLowerCase() || '';
      if (filters.location === 'Remote' && !loc.includes('remote')) return false;
      if (filters.location === 'Hybrid' && !loc.includes('hybrid')) return false;
      if (filters.location === 'On-site' && loc.includes('remote')) return false;
    }
    if (filters.stipend !== 'Any') {
      const num = parseInt((job.stipend || '0').replace(/[^0-9]/g, ''));
      const thresh = parseInt(filters.stipend) * 1000;
      if (num < thresh) return false;
    }
    if (filters.skill && !job.required_skills?.some(s => s.name?.toLowerCase().includes(filters.skill.toLowerCase()))) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!job.role?.toLowerCase().includes(q) && !job.company?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => huntFastActive ? b._match.score - a._match.score : 0);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setSelectedMatch(job._match);
  };

  const handleApply = async (job, matchData) => {
    if (applying || weeklyApplications >= WEEKLY_LIMIT) return;
    setApplying(true);
    try {
      await createApplication(job.id, matchData.score, matchData.breakdown);
      const airtableData = prepareApplicationData(studentProfile, job, matchData.score, matchData.breakdown);
      await sendToAirtable(airtableData);
      setAppliedJobs(p => [...p, { ...job, matchScore: matchData.score }]);
      setWeeklyApplications(c => c + 1);
      setSelectedJob(null);
    } catch (err) { alert('Failed: ' + err.message); }
    finally { setApplying(false); }
  };

  const handleSignOut = async () => { try { await signOut(); navigate('/'); } catch (e) { console.error(e); } };
  const dismissWelcome = () => { setShowWelcome(false); if (studentProfile?.id) localStorage.setItem(`hunt-welcomed-${studentProfile.id}`, '1'); };
  const handleSaveToggle = (job) => {
    setSavedJobs(prev => prev.some(j => j.id === job.id) ? prev.filter(j => j.id !== job.id) : [...prev, job]);
  };
  const isJobSaved = (jobId) => savedJobs.some(j => j.id === jobId);
  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => v && v !== 'Any' && v !== 0 && v !== '').length;

  if (loading) return <LoadingScreen />;

  const navItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'home',    label: 'Home',    icon: Home },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes hunt-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .hn-item:hover { background: var(--bg-subtle) !important; }
        .hn-card:hover { border-color: var(--border-mid) !important; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <Sidebar
        navItems={navItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        remainingApplications={remainingApplications}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        theme={theme}
        setTheme={setTheme}
        studentProfile={studentProfile}
        initials={initials}
        showAccountMenu={showAccountMenu}
        setShowAccountMenu={setShowAccountMenu}
        setShowSettings={setShowSettings}
        handleSignOut={handleSignOut}
      />

      {/* ── MAIN ── */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── HOME ── */}
        {activeTab === 'home' && (
          <HomeTab
            studentProfile={studentProfile}
            navigate={navigate}
            setActiveTab={setActiveTab}
            homeSubTab={homeSubTab}
            setHomeSubTab={setHomeSubTab}
            appliedJobs={appliedJobs}
            savedJobs={savedJobs}
            handleSaveToggle={handleSaveToggle}
            handleJobClick={handleJobClick}
          />
        )}

        {/* ── EXPLORE ── */}
        {activeTab === 'explore' && (
          <ExploreTab
            allJobs={allJobs}
            displayedJobs={displayedJobs}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            selectedMatch={selectedMatch}
            isPanelMaximized={isPanelMaximized}
            setIsPanelMaximized={setIsPanelMaximized}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            activeFiltersCount={activeFiltersCount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            huntFastActive={huntFastActive}
            setHuntFastActive={setHuntFastActive}
            filters={filters}
            handleFilterChange={handleFilterChange}
            handleJobClick={handleJobClick}
            handleApply={handleApply}
            isJobSaved={isJobSaved}
            handleSaveToggle={handleSaveToggle}
            notified={notified}
            setNotified={setNotified}
            studentProfile={studentProfile}
            weeklyApplications={weeklyApplications}
            applying={applying}
            canApply={canApply}
          />
        )}

        {/* ── NETWORK ── */}
        {activeTab === 'network' && (
          <NetworkTab studentProfile={studentProfile} />
        )}

        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <ProfileTab studentProfile={studentProfile} setStudentProfile={setStudentProfile} theme={theme} setTheme={setTheme} />
        )}

      </main>

      {/* ── NOTIFICATION FLYOUT ── */}
      {showNotifications && (
        <NotificationFlyout
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* ── SETTINGS SIDE PANEL ── */}
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          settingsTab={settingsTab}
          setSettingsTab={setSettingsTab}
          studentProfile={studentProfile}
          initials={initials}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </div>
  );
}
