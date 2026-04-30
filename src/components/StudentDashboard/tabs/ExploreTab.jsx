// src/components/StudentDashboard/tabs/ExploreTab.jsx
import React from 'react';
import {
  Sparkles, LayoutGrid, List, SlidersHorizontal, Search,
  BellRing, CheckCircle2, X as XIcon, Play,
} from 'lucide-react';
import { FilterPanel } from '../explore/FilterPanel';
import { JobGridCard } from '../explore/JobGridCard';
import { JobDetailPanel } from '../explore/JobDetailPanel';
import { SwipeView } from '../explore/SwipeView';
import { WelcomeCard } from '../shared/WelcomeCard';

export function ExploreTab({
  allJobs, displayedJobs,
  viewMode, setViewMode,
  selectedJob, setSelectedJob,
  selectedMatch,
  isPanelMaximized, setIsPanelMaximized,
  showFilters, setShowFilters,
  searchQuery, setSearchQuery,
  huntFastActive, setHuntFastActive,
  filters, handleFilterChange, activeFiltersCount,
  handleJobClick,
  handleApply, applying, canApply,
  weeklyApplications,
  studentProfile,
  notified, setNotified,
  handleSaveToggle, isJobSaved,
  appliedJobs,
  showWelcomeCard, setShowWelcomeCard,
}) {
  const isJobApplied = (jobId) => (appliedJobs || []).some(j => j.id === jobId);
  const hasSearch = (searchQuery || '').trim().length > 0;
  const hasFilters = activeFiltersCount > 0;
  const profileComplete = (studentProfile?.profile_completeness || 0) >= 100;
  // Show welcome card if not dismissed and profile not complete
  const shouldShowWelcome = showWelcomeCard !== false && !profileComplete;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'hunt-fade-in 0.3s ease',
      }}
    >
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ── Left: list/grid panel ── */}
        {!(selectedJob && isPanelMaximized) && (
          <div
            style={{
              flex: selectedJob && !isPanelMaximized ? '0 0 55%' : 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRight: selectedJob ? '1px solid var(--border-mid)' : 'none',
              transition: 'flex 0.2s ease',
            }}
          >
            {/* Header / toolbar */}
            <div style={{ padding: '20px 28px 0', flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <h1 className="hunt-serif" style={{ fontSize: 28, color: 'var(--text)', lineHeight: 1 }}>
                    Opportunities <em>for you.</em>
                  </h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Hunt Fast */}
                  <button
                    onClick={() => alert('Hunt-fast · Coming soon')}
                    title="Coming soon"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      border: '1px solid var(--border-mid)',
                      background: 'transparent',
                      color: 'var(--text-mid)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10.5,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      opacity: 0.6,
                    }}
                  >
                    <Sparkles size={12} /> HUNT-fast
                  </button>

                  {/* View toggle */}
                  <div style={{ display: 'flex', border: '1px solid var(--border-mid)' }}>
                    {[
                      { mode: 'grid', Icon: LayoutGrid },
                      { mode: 'list', Icon: List },
                    ].map(({ mode, Icon }, idx) => {
                      const active = viewMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => { setViewMode(mode); setSelectedJob(null); }}
                          style={{
                            padding: '8px 10px',
                            background: active ? 'var(--ink)' : 'transparent',
                            color: active ? 'var(--cream)' : 'var(--text-dim)',
                            border: 'none',
                            borderLeft: idx > 0 ? '1px solid var(--border-mid)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Icon size={12} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Filters */}
                  <button
                    onClick={() => setShowFilters(p => !p)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      border: '1px solid ' + (showFilters ? 'var(--ink)' : 'var(--border-mid)'),
                      background: showFilters ? 'var(--ink)' : 'transparent',
                      color: showFilters ? 'var(--cream)' : 'var(--text-mid)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10.5,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    <SlidersHorizontal size={12} />
                    filters
                    {activeFiltersCount > 0 && (
                      <span
                        style={{
                          minWidth: 16,
                          height: 16,
                          padding: '0 4px',
                          background: 'var(--blue)',
                          color: '#fff',
                          fontSize: 9.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="search roles, companies, skills…"
                  className="hunt-mono"
                  style={{
                    width: '100%',
                    paddingLeft: 36,
                    paddingRight: 36,
                    paddingTop: 10,
                    paddingBottom: 10,
                    border: '1px solid var(--border-mid)',
                    background: 'var(--bg-card)',
                    color: 'var(--text)',
                    fontSize: 12,
                    letterSpacing: '0.04em',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-dim)',
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    <XIcon size={12} />
                  </button>
                )}
              </div>

              {/* Filters panel */}
              {showFilters && (
                <FilterPanel
                  filters={filters}
                  onChange={handleFilterChange}
                  onClose={() => setShowFilters(false)}
                  jobs={allJobs}
                />
              )}
            </div>

            {/* Results meta */}
            {allJobs.length > 0 && (
              <div style={{ padding: '0 28px 10px', flexShrink: 0 }}>
                <span
                  className="hunt-mono"
                  style={{
                    fontSize: 10,
                    color: 'var(--text-dim)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {displayedJobs.length} {displayedJobs.length === 1 ? 'opportunity' : 'opportunities'}
                  {huntFastActive && <span style={{ color: 'var(--blue)', marginLeft: 8 }}>· sorted by best match</span>}
                </span>
              </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: viewMode === 'list' ? '0' : '0 28px 24px' }}>
              {/* Welcome card — first-time / incomplete profile */}
              {shouldShowWelcome && viewMode === 'grid' && (
                <div style={{ padding: '8px 0 0' }}>
                  <WelcomeCard
                    name={studentProfile?.full_name}
                    completeness={studentProfile?.profile_completeness || 0}
                    onDismiss={() => setShowWelcomeCard && setShowWelcomeCard(false)}
                    onTour={() => alert('60-sec tour · Coming soon')}
                  />
                </div>
              )}

              {allJobs.length === 0 ? (
                <EmptyTargeted notified={notified} setNotified={setNotified} />
              ) : viewMode === 'list' ? (
                <SwipeView
                  jobs={displayedJobs}
                  studentProfile={studentProfile}
                  weeklyApplications={weeklyApplications}
                  onApply={handleApply}
                  applying={applying}
                  canApply={canApply}
                  selectedJob={selectedJob}
                  onJobClick={handleJobClick}
                  isJobSaved={isJobSaved}
                  onSave={handleSaveToggle}
                  isJobApplied={isJobApplied}
                  welcomeCard={shouldShowWelcome ? (
                    <WelcomeCard
                      name={studentProfile?.full_name}
                      completeness={studentProfile?.profile_completeness || 0}
                      onDismiss={() => setShowWelcomeCard && setShowWelcomeCard(false)}
                      onTour={() => alert('60-sec tour · Coming soon')}
                    />
                  ) : null}
                />
              ) : displayedJobs.length === 0 ? (
                <div
                  style={{
                    padding: 60,
                    textAlign: 'center',
                    border: '1px dashed var(--border-mid)',
                    background: 'var(--bg-card)',
                    marginTop: 8,
                  }}
                >
                  <div
                    className="hunt-mono"
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--text-dim)',
                      marginBottom: 10,
                    }}
                  >
                    ▲ no results
                  </div>
                  <div className="hunt-serif" style={{ fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>
                    Nothing matches.
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 16 }}>
                    {hasSearch && !hasFilters && 'Try clearing your search.'}
                    {hasSearch && hasFilters && 'Try clearing search and filters.'}
                    {!hasSearch && hasFilters && 'Try loosening or clearing your filters.'}
                  </div>
                  <button
                    onClick={() => {
                      if (hasSearch) setSearchQuery('');
                      if (hasFilters) handleFilterChange('reset');
                    }}
                    className="hunt-btn hunt-btn-sm hunt-btn-ghost"
                  >
                    Clear {hasSearch && hasFilters ? 'all' : hasSearch ? 'search' : 'filters'}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: selectedJob ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                    gap: 10,
                    marginTop: 8,
                  }}
                >
                  {displayedJobs.map(job => (
                    <JobGridCard
                      key={job.id}
                      job={job}
                      matchData={job._match}
                      isSelected={selectedJob?.id === job.id}
                      onClick={() => handleJobClick(job)}
                      isSaved={isJobSaved(job.id)}
                      onSave={handleSaveToggle}
                      isApplied={isJobApplied(job.id)}
                    />
                  ))}
                </div>
              )}

              {/* End of feed marker */}
              {allJobs.length > 0 && viewMode === 'grid' && displayedJobs.length > 0 && (
                <div style={{ marginTop: 36, padding: '24px 0 16px', borderTop: '1px solid var(--border)' }}>
                  <span className="hunt-mono" style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    no more jobs right now — check back for more
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Right: detail panel ── */}
        {selectedJob && (
          <div
            style={{
              flex: isPanelMaximized ? 1 : '0 0 45%',
              overflow: 'hidden',
              transition: 'flex 0.2s ease',
            }}
          >
            <JobDetailPanel
              job={selectedJob}
              matchData={selectedMatch}
              isMaximized={isPanelMaximized}
              onToggleMaximize={() => setIsPanelMaximized(p => !p)}
              onClose={() => { setSelectedJob(null); setIsPanelMaximized(false); }}
              onApply={() => handleApply(selectedJob, selectedMatch)}
              applying={applying}
              canApply={canApply}
              isSaved={isJobSaved(selectedJob?.id)}
              onSave={handleSaveToggle}
              isApplied={isJobApplied(selectedJob?.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyTargeted({ notified, setNotified }) {
  return (
    <div
      className="hunt-card"
      style={{
        padding: '56px 28px',
        textAlign: 'center',
        marginTop: 8,
      }}
    >
      <div
        className="hunt-mono"
        style={{
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--text-dim)',
          marginBottom: 12,
        }}
      >
        ▲ inbox empty
      </div>
      <h3
        className="hunt-serif"
        style={{
          fontSize: 24,
          color: 'var(--text)',
          marginBottom: 8,
        }}
      >
        No matching opportunities right now.
      </h3>
      <p
        style={{
          fontSize: 13,
          color: 'var(--text-mid)',
          maxWidth: 340,
          margin: '0 auto 20px',
          lineHeight: 1.55,
        }}
      >
        We're onboarding new companies. We'll ping you the moment a role matches your skills.
      </p>
      {!notified ? (
        <button
          onClick={() => setNotified(true)}
          className="hunt-btn hunt-btn-primary"
        >
          <BellRing size={12} /> Notify me when available
        </button>
      ) : (
        <div
          className="hunt-mono"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            background: 'var(--blue-tint)',
            border: '1px solid var(--blue)',
            color: 'var(--blue-deep)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <CheckCircle2 size={13} /> You'll be notified
        </div>
      )}
    </div>
  );
}
