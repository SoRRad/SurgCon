import { useEffect, useState } from 'react';
import { exportConferenceDeadlinesToIcs } from '../utils/exportHelpers';
import { getDisplayDateLabel, getDeadlineStatus } from '../utils/dateHelpers';
import {
  DEFAULT_FILTERS,
  filterConferences,
  getFilterOptions,
  getLocationFilterLabel,
} from '../utils/filterConferences';

function Calendar({ conferences, bookmarkedConferences }) {
  const [exportFeedback, setExportFeedback] = useState('');
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    bookmarkedOnly: false,
  });

  const filterOptions = getFilterOptions(conferences, filters);
  const visibleConferences = filterConferences(conferences, filters);
  const visibleDeadlineExports = visibleConferences.filter((conference) => conference.abstractDeadlineSort);
  const visibleDateExports = visibleConferences.filter((conference) => conference.startDate);
  const bookmarkedDeadlineExports = bookmarkedConferences.filter((conference) => conference.abstractDeadlineSort);
  const locationLabel = getLocationFilterLabel(filters.regionGroup);

  useEffect(() => {
    if (!exportFeedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setExportFeedback(''), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [exportFeedback]);

  function handleFilterChange(field, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  }

  function handleExport(exportResult, label) {
    if (!exportResult) {
      return;
    }

    setExportFeedback(`Downloaded ${label} for ${exportResult.recordCount} conference${exportResult.recordCount === 1 ? '' : 's'}.`);
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
        <p className="eyebrow">Calendar</p>
        <h1>Plan conference seasons and abstract deadlines with a cleaner academic timeline.</h1>
        <p>Filter by specialty, year, region, tags, deadline status, and bookmarks, then export either deadlines or meeting dates to ICS.</p>
      </section>

      <section className="export-panel export-panel--emphasis">
        <div className="export-panel__content">
          <p className="eyebrow">ICS exports</p>
          <h2>Prominent calendar exports for deadlines and conference dates</h2>
          <p className="muted-note">
            Filter first, then export all-day events for abstract deadlines or meeting dates. Bookmarked deadlines stay available as a faster shortlist export.
          </p>
          <div className="export-stats" aria-label="Calendar export summary">
            <span className="status-pill status-pill--info">{visibleConferences.length} visible</span>
            <span className="status-pill status-pill--info">{visibleDeadlineExports.length} filtered deadlines</span>
            <span className="status-pill status-pill--info">{visibleDateExports.length} filtered dates</span>
          </div>
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => handleExport(
              exportConferenceDeadlinesToIcs(visibleDeadlineExports, 'surgcon-filtered-deadlines.ics'),
              'a filtered deadline calendar'
            )}
            disabled={!visibleDeadlineExports.length}
          >
            Filtered Deadlines ({visibleDeadlineExports.length})
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => handleExport(
              exportConferenceDeadlinesToIcs(bookmarkedDeadlineExports, 'surgcon-bookmarked-deadlines.ics'),
              'a bookmarked deadline calendar'
            )}
            disabled={!bookmarkedDeadlineExports.length}
          >
            Bookmarked Deadlines ({bookmarkedDeadlineExports.length})
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => handleExport(
              exportConferenceDeadlinesToIcs(visibleDateExports, 'surgcon-filtered-dates.ics', 'dates'),
              'a filtered conference-date calendar'
            )}
            disabled={!visibleDateExports.length}
          >
            Filtered Dates ({visibleDateExports.length})
          </button>
        </div>
        {exportFeedback ? (
          <p className="export-feedback" role="status">
            {exportFeedback}
          </p>
        ) : null}
      </section>

      <section className="calendar-filter-bar">
        <label>
          Specialty
          <select value={filters.specialty} onChange={(event) => handleFilterChange('specialty', event.target.value)}>
            <option value="All">All specialties</option>
            {filterOptions.specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year
          <select value={filters.year} onChange={(event) => handleFilterChange('year', event.target.value)}>
            <option value="All">All years</option>
            {filterOptions.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label>
          Region group
          <select
            value={filters.regionGroup}
            onChange={(event) => {
              handleFilterChange('regionGroup', event.target.value);
              handleFilterChange('locationValue', 'All');
              handleFilterChange('city', 'All');
            }}
          >
            <option value="All">All regions</option>
            {filterOptions.regionGroups.map((regionGroup) => (
              <option key={regionGroup} value={regionGroup}>
                {regionGroup}
              </option>
            ))}
          </select>
        </label>
        <label>
          {locationLabel}
          <select value={filters.locationValue} onChange={(event) => handleFilterChange('locationValue', event.target.value)}>
            <option value="All">All options</option>
            {filterOptions.locationOptions.map((locationOption) => (
              <option key={locationOption} value={locationOption}>
                {locationOption}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tag
          <select value={filters.tag} onChange={(event) => handleFilterChange('tag', event.target.value)}>
            <option value="All">All tags</option>
            {filterOptions.tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <label>
          Deadline status
          <select
            value={filters.deadlineStatus}
            onChange={(event) => handleFilterChange('deadlineStatus', event.target.value)}
          >
            <option value="All">All statuses</option>
            {filterOptions.deadlineStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={filters.viewMode === 'all'}
            onChange={handlePastToggle}
          />
          <span>Show past conferences</span>
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={filters.bookmarkedOnly}
            onChange={(event) => handleFilterChange('bookmarkedOnly', event.target.checked)}
          />
          <span>Bookmarked only</span>
        </label>
      </section>

      {visibleConferences.length ? (
        <section className="calendar-grid">
          {visibleConferences.map((conference) => (
            <article className="calendar-card" key={conference.id}>
              <div className="calendar-card__date">
                <span>{conference.abstractDeadlineSort ? 'Abstract deadline' : 'Meeting date'}</span>
                <strong>{conference.abstractDeadlineSort ? conference.abstractDeadline : getDisplayDateLabel(conference)}</strong>
                <small>{conference.year ?? 'TBD'} planning record</small>
              </div>
              <div className="calendar-card__body">
                <p className="eyebrow">{conference.organization}</p>
                <h3>{conference.name}</h3>
                <p className="calendar-card__supporting-date">Meeting: {getDisplayDateLabel(conference)}</p>
                <p>{conference.locationLabel}</p>
                <ul className="tag-list tag-list--categories">
                  {conference.categories.slice(0, 2).map((category) => (
                    <li key={category}>{category}</li>
                  ))}
                </ul>
                <ul className="tag-list tag-list--discovery">
                  {conference.tags.slice(0, 4).map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
              <div className="calendar-card__meta">
                <span className={`status-pill status-pill--deadline-${getDeadlineStatus(conference.abstractDeadlineSort).toLowerCase()}`}>
                  {conference.abstractDeadlineSort ? `Deadline ${getDeadlineStatus(conference.abstractDeadlineSort)}` : 'Deadline TBD'}
                </span>
                <span className="muted-note">{conference.venue || 'Venue TBD'}</span>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>No calendar results match the current filters</h2>
          <p>Try broadening the specialty, region, or deadline filters, or disable bookmarked-only mode.</p>
        </section>
      )}
    </div>
  );
}

export default Calendar;
