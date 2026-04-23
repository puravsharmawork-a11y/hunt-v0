// src/components/StudentDashboard/tabs/ExploreTab.jsx
import React from 'react';
import {
  Sparkles, LayoutGrid, Heart, SlidersHorizontal, Search,
  BellRing, CheckCircle2,
} from 'lucide-react';
import { FilterPanel } from '../explore/FilterPanel';
import { JobGridCard } from '../explore/JobGridCard';
import { JobDetailPanel } from '../explore/JobDetailPanel';
import { SwipeView } from '../explore/SwipeView';

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
}) {
  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', animation: 'hunt-fade-in 0.3s ease' }}>

      {/* Left: list/grid panel */}
      <div style={{
        flex: selectedJob && !isPanelMaximized ? '0 0 42%' : 1,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderRight: selectedJob ? '1px solid var(--border)' : 'none',
        transition: 'flex 0.2s ease',
      }}>
        {/* Toolbar */}
        <div style={{ padding: '18px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '2px' }}>Explore</p>
              <h1 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '22px', fontWeight: 400, color: 'var(--text)' }}>Opportunities</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Hunt Fast */}
              <button onClick={() => setHuntFastActive(p => !p)} style={{
                display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                background: huntFastActive ? 'var(--text)' : 'var(--bg-subtle)', color: huntFastActive ? 'var(--bg)' : 'var(--text-mid)',
                transition: 'all 0.15s',
              }}>
                <Sparkles size={13} /> Hunt Fast
              </button>
              {/* View toggle */}
              <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '7px', padding: '2px', border: '1px solid var(--border)' }}>
                {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'swipe', Icon: Heart }].map(({ mode, Icon }) => (
                  <button key={mode} onClick={() => { setViewMode(mode); setSelectedJob(null); }}
                    style={{ padding: '5px 8px', borderRadius: '5px', border: 'none', cursor: 'pointer', background: viewMode === mode ? 'var(--bg-card)' : 'transparent', color: viewMode === mode ? 'var(--text)' : 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
                    <Icon size={14} />
                  </button>
                ))}
              </div>
              {/* Filter */}
              <button onClick={() => setShowFilters(p => !p)} style={{
                display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '7px', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '11px',
                background: showFilters || activeFiltersCount > 0 ? 'var(--bg-subtle)' : 'transparent', color: 'var(--text-mid)',
              }}>
                <SlidersHorizontal size={13} />
                {activeFiltersCount > 0 && <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--green)', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFiltersCount}</span>}
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search roles or companies…"
              style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Filters panel */}
          {showFilters && <FilterPanel filters={filters} onChange={handleFilterChange} onClose={() => setShowFilters(false)} jobs={allJobs} />}
        </div>

        {/* Results count */}
        {allJobs.length > 0 && (
          <div style={{ padding: '0 24px 10px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              {displayedJobs.length} {displayedJobs.length === 1 ? 'opportunity' : 'opportunities'}
              {huntFastActive && <span style={{ color: 'var(--green)', marginLeft: '6px' }}>· sorted by best match</span>}
            </span>
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          {allJobs.length === 0 ? (
            // Empty state
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '56px 28px', textAlign: 'center', marginTop: '8px' }}>
              <div style={{ fontSize: '36px', marginBottom: '14px' }}>🎯</div>
              <h3 style={{ fontFamily: "'Editorial New', Georgia, serif", fontSize: '20px', fontWeight: 400, color: 'var(--text)', marginBottom: '8px' }}>No matching opportunities right now</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', maxWidth: '300px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                We're onboarding new companies. We'll notify you the moment a role matches your skills.
              </p>
              {!notified ? (
                <button onClick={() => setNotified(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--green)', color: '#fff', fontSize: '12px', fontWeight: 500 }}>
                  <BellRing size={13} /> Notify me when available
                </button>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', background: 'var(--green-tint)', border: '1px solid var(--green)', color: 'var(--green)', fontSize: '12px' }}>
                  <CheckCircle2 size={13} /> You'll be notified — we're on it.
                </div>
              )}
            </div>
          ) : viewMode === 'swipe' ? (
            <div style={{ marginTop: '8px' }}>
              <SwipeView jobs={displayedJobs} studentProfile={studentProfile} weeklyApplications={weeklyApplications} onApply={handleApply} applying={applying} canApply={canApply} />
            </div>
          ) : displayedJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', fontSize: '13px' }}>
              No results match your filters. <button onClick={() => handleFilterChange('reset')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: '13px', textDecoration: 'underline' }}>Clear filters</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr' : 'repeat(2, 1fr)', gap: '10px', marginTop: '8px' }}>
              {displayedJobs.map(job => (
                <JobGridCard key={job.id} job={job} matchData={job._match} isSelected={selectedJob?.id === job.id} onClick={() => handleJobClick(job)} isSaved={isJobSaved(job.id)} onSave={handleSaveToggle} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: detail panel */}
      {selectedJob && viewMode === 'grid' && (
        <div style={{
          flex: isPanelMaximized ? 1 : '0 0 58%',
          overflow: 'hidden', transition: 'flex 0.2s ease',
        }}>
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
          />
        </div>
      )}
    </div>
  );
}
