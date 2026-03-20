import { useState } from 'react';
import ConferenceCard from '../components/ConferenceCard';
import FilterSidebar from '../components/FilterSidebar';
import { DEFAULT_FILTERS, filterConferences, getFilterOptions } from '../utils/filterConferences';

function Directory({
  conferences,
  notificationPreferences,
  onToggleBookmark,
  onToggleCompare,
  onReportIssue,
  onUseFilteredResults,
  onUseFilteredSpecialty,
  comparedCount,
}) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const visibleConferences = filterConferences(conferences, filters);
  const filterOptions = getFilterOptions(conferences, filters);

  function handleFilterChange(field, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  }

  function handleResetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function handlePastToggle() {
    setFilters((currentFilters) => ({
      ...currentFilters,
      viewMode: currentFilters.viewMode === 'all' ? 'upcoming' : 'all',
    }));
  }

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Conference directory</p>
        <h1>A master surgery conference dataset from 2024 onward, with upcoming meetings ranked first.</h1>
        <p>
          The default view now starts from the full 2024+ master dataset instead of a narrow subset. Upcoming meetings still rise to the top, but past records remain visible for historical context and recurring-pattern tracking.
        </p>
        <p className="muted-note">
          Search now weighs names, organizations, locations, specialties, tags, notes, venues, and session metadata so the results feel more surgical and less generic.
        </p>
      </section>

      <section className="directory-layout">
        <FilterSidebar
          filters={filters}
          options={filterOptions}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        <div className="directory-content">
          <div className="directory-toolbar">
            <div className="toolbar-meta">
              <strong>{visibleConferences.length}</strong>
              <span> matching conferences</span>
              <p className="muted-note">
                Compare set: <strong>{comparedCount}</strong> selected
              </p>
              <p className="muted-note">Upcoming deadlines are ranked first; meeting dates break ties when no usable deadline is available.</p>
            </div>

            <div className="toolbar-actions">
              <label className="inline-toggle">
                <input type="checkbox" checked={filters.viewMode === 'all'} onChange={handlePastToggle} />
                <span>Show past conferences</span>
              </label>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => onUseFilteredResults(visibleConferences)}
                disabled={!visibleConferences.length}
              >
                Use Filtered Results for Notifications
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => onUseFilteredSpecialty(filters.specialty)}
                disabled={filters.specialty === 'All'}
              >
                Use Specialty for Notifications
              </button>
            </div>
          </div>

          {visibleConferences.length ? (
            <div className="card-grid">
              {visibleConferences.map((conference) => (
                <ConferenceCard
                  key={conference.id}
                  conference={conference}
                  onToggleBookmark={onToggleBookmark}
                  onToggleCompare={onToggleCompare}
                  onReportIssue={onReportIssue}
                  isReminderSelected={notificationPreferences.selectedConferenceIds.includes(
                    conference.id
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No conferences match your current filters</h2>
              <p>Try another specialty, broaden the location filter, or reset the tag and deadline selections.</p>
              <button type="button" className="button button--primary" onClick={handleResetFilters}>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Directory;
