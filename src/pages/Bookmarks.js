import { useEffect, useState } from 'react';
import { exportConferenceDeadlinesToIcs, exportConferencesToCsv } from '../utils/exportHelpers';
import { formatConferenceLocation, getDisplayDateLabel } from '../utils/dateHelpers';

function Bookmarks({ bookmarkedConferences }) {
  const [exportFeedback, setExportFeedback] = useState('');
  const exportableDeadlines = bookmarkedConferences.filter((conference) => conference.abstractDeadlineSort);
  const exportableDates = bookmarkedConferences.filter((conference) => conference.startDate);

  useEffect(() => {
    if (!exportFeedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setExportFeedback(''), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [exportFeedback]);

  function handleExport(exportResult, label) {
    if (!exportResult) {
      return;
    }

    setExportFeedback(`Downloaded ${label} for ${exportResult.recordCount} conference${exportResult.recordCount === 1 ? '' : 's'}.`);
  }

  if (!bookmarkedConferences.length) {
    return (
      <div className="page">
        <section className="page-intro">
          <p className="eyebrow">Bookmarks</p>
          <h1>Saved conferences will appear here as a planning table once you begin curating a shortlist.</h1>
          <p>Bookmark meetings from the directory to compare specialties, dates, deadlines, and links in one place.</p>
        </section>
        <section className="empty-state">
          <h2>No bookmarks yet</h2>
          <p>Save conferences from the directory to build a comparison set, export CSV rows, or download ICS files.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Bookmarks</p>
        <h1>Your saved conference shortlist is ready for comparison, export, and deadline planning.</h1>
        <p>Use this view as a device-local decision board for specialty alignment, location tradeoffs, and abstract planning.</p>
      </section>

      <section className="export-panel">
        <div className="export-panel__content">
          <p className="eyebrow">Bookmark exports</p>
          <h2>Take your shortlist into planning documents and calendars</h2>
          <p className="muted-note">
            CSV keeps the full comparison data together. ICS exports create all-day calendar events for either abstract deadlines or conference dates.
          </p>
          <div className="export-stats" aria-label="Bookmark export summary">
            <span className="status-pill status-pill--info">{bookmarkedConferences.length} saved</span>
            <span className="status-pill status-pill--info">{exportableDeadlines.length} deadline-ready</span>
            <span className="status-pill status-pill--info">{exportableDates.length} date-ready</span>
          </div>
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => handleExport(exportConferencesToCsv(bookmarkedConferences), 'a CSV export')}
          >
            CSV Export ({bookmarkedConferences.length})
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => handleExport(
              exportConferenceDeadlinesToIcs(exportableDeadlines, 'surgcon-bookmarked-deadlines.ics'),
              'a deadline calendar'
            )}
            disabled={!exportableDeadlines.length}
          >
            Deadline ICS ({exportableDeadlines.length})
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => handleExport(
              exportConferenceDeadlinesToIcs(exportableDates, 'surgcon-bookmarked-dates.ics', 'dates'),
              'a conference-date calendar'
            )}
            disabled={!exportableDates.length}
          >
            Meeting Date ICS ({exportableDates.length})
          </button>
        </div>
        {exportFeedback ? (
          <p className="export-feedback" role="status">
            {exportFeedback}
          </p>
        ) : null}
      </section>

      <section className="comparison-table-wrap">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Conference name</th>
              <th>Organization</th>
              <th>Specialty</th>
              <th>Tags</th>
              <th>Location</th>
              <th>Dates</th>
              <th>Abstract deadline</th>
              <th>Format</th>
              <th>Official link</th>
            </tr>
          </thead>
          <tbody>
            {bookmarkedConferences.map((conference) => (
              <tr key={conference.id}>
                <td data-label="Conference name">
                  <div className="comparison-table__primary">
                    <strong>{conference.name}</strong>
                    <span>{conference.year ?? 'TBD'} planning record</span>
                  </div>
                </td>
                <td data-label="Organization">{conference.organization}</td>
                <td data-label="Specialty">
                  <div className="comparison-table__chips">
                    {conference.categories.map((category) => (
                      <span key={category} className="status-pill">
                        {category}
                      </span>
                    ))}
                  </div>
                </td>
                <td data-label="Tags">
                  <div className="comparison-table__chips comparison-table__chips--muted">
                    {conference.tags.map((tag) => (
                      <span key={tag} className="status-pill status-pill--info">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td data-label="Location">{formatConferenceLocation(conference)}</td>
                <td data-label="Dates">{getDisplayDateLabel(conference)}</td>
                <td data-label="Abstract deadline">
                  <span className="comparison-table__deadline">{conference.abstractDeadline}</span>
                </td>
                <td data-label="Format">{conference.format}</td>
                <td data-label="Official link">
                  {conference.meetingUrl ? (
                    <a href={conference.meetingUrl} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  ) : (
                    'TBD'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Bookmarks;
