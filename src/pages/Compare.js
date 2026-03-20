import { Link } from 'react-router-dom';
import {
  exportConferenceDeadlinesToIcs,
  exportConferencesToCsv,
} from '../utils/exportHelpers';
import {
  formatConferenceLocation,
  getDisplayDateLabel,
} from '../utils/dateHelpers';
import {
  getAudienceIndicators,
  getConferenceFlags,
  getSubmissionIndicators,
  getTrustBadge,
} from '../utils/conferenceIntel';

function Compare({ comparedConferences, onToggleCompare, onClearCompared }) {
  if (!comparedConferences.length) {
    return (
      <div className="page">
        <section className="page-intro">
          <p className="eyebrow">Compare</p>
          <h1>Select conferences from the directory or detail pages to build a side-by-side planning board.</h1>
          <p>Compare is persistent on this device and works well for shortlists of two to four meetings.</p>
        </section>
        <section className="empty-state">
          <h2>No conferences selected for compare yet</h2>
          <p>Choose Compare on any conference card to start a side-by-side planning workflow.</p>
          <Link className="button button--primary" to="/conferences">
            Browse conferences
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Compare</p>
        <h1>Side-by-side conference comparison for planning dates, fit, trust, and submission workflows.</h1>
        <p>Use this board for shortlist decisions across deadline urgency, travel, audience fit, and source trust.</p>
      </section>

      <section className="export-panel">
        <div className="export-panel__content">
          <p className="eyebrow">Compare actions</p>
          <h2>Export or clear the current compare set</h2>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="button button--primary" onClick={() => exportConferencesToCsv(comparedConferences, 'surgcon-compare.csv')}>
            Export CSV
          </button>
          <button type="button" className="button button--secondary" onClick={() => exportConferenceDeadlinesToIcs(comparedConferences, 'surgcon-compare-deadlines.ics')}>
            Export Deadline ICS
          </button>
          <button type="button" className="button button--ghost" onClick={onClearCompared}>
            Clear compare set
          </button>
        </div>
      </section>

      <section className="compare-grid">
        {comparedConferences.map((conference) => {
          const trustBadge = getTrustBadge(conference);

          return (
            <article key={conference.id} className="detail-card compare-card">
              <div className="conference-card__topline">
                <div className="label-row">
                  <span className={`status-pill status-pill--${trustBadge.tone}`}>{trustBadge.label}</span>
                  <span className="status-pill status-pill--info">{conference.deadlineUrgencyLabel}</span>
                </div>
                <button type="button" className="button button--ghost" onClick={() => onToggleCompare(conference.id)}>
                  Remove
                </button>
              </div>
              <h2>{conference.name}</h2>
              <p className="conference-card__organization">{conference.organization}</p>
              <dl className="detail-list">
                <div>
                  <dt>Dates</dt>
                  <dd>{getDisplayDateLabel(conference)}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{formatConferenceLocation(conference)}</dd>
                </div>
                <div>
                  <dt>Deadline</dt>
                  <dd>{conference.abstractDeadline}</dd>
                </div>
              </dl>
              <h3>Audience fit</h3>
              <ul className="tag-list tag-list--categories">
                {getAudienceIndicators(conference).map((indicator) => (
                  <li key={indicator}>{indicator}</li>
                ))}
              </ul>
              <h3>Submission options</h3>
              <ul className="tag-list tag-list--discovery">
                {(getSubmissionIndicators(conference).length ? getSubmissionIndicators(conference) : ['Submission details limited']).map((indicator) => (
                  <li key={indicator}>{indicator}</li>
                ))}
              </ul>
              <h3>Flags</h3>
              <ul className="tag-list tag-list--discovery">
                {getConferenceFlags(conference).map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default Compare;
