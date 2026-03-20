import { Link } from 'react-router-dom';
import {
  formatConferenceLocation,
  getConferenceStatus,
  getDeadlineStatus,
  getDisplayDateLabel,
} from '../utils/dateHelpers';
import {
  formatSourceTypeLabel,
  getConferenceFlags,
  getReviewStatusLabel,
  getTrustBadge,
} from '../utils/conferenceIntel';
import { buildIssueReportUrl } from '../utils/issueHelpers';
import BookmarkButton from './BookmarkButton';

function ConferenceCard({
  conference,
  onToggleBookmark,
  onToggleCompare,
  onReportIssue,
  isReminderSelected = false,
}) {
  const conferenceStatus = getConferenceStatus(conference);
  const deadlineStatus = getDeadlineStatus(conference.abstractDeadlineSort).toLowerCase();
  const trustBadge = getTrustBadge(conference);
  const conferenceFlags = getConferenceFlags(conference).slice(0, 4);
  const visibleTags = conference.tags.slice(0, 5);

  return (
    <article className="conference-card">
      <div className="conference-card__topline">
        <div className="label-row">
          <span className="status-pill">{conferenceStatus}</span>
          <span className={`status-pill status-pill--${trustBadge.tone}`}>{trustBadge.label}</span>
          <span className={`status-pill status-pill--${conference.reviewStatus}`}>
            {getReviewStatusLabel(conference.reviewStatus)}
          </span>
          {conference.issueReported ? (
            <span className="status-pill status-pill--review">Admin Review Pending</span>
          ) : null}
          {isReminderSelected ? <span className="status-pill status-pill--info">Reminders Enabled</span> : null}
        </div>
        <BookmarkButton
          isBookmarked={conference.isBookmarked}
          onToggle={() => onToggleBookmark(conference.id)}
        />
      </div>

      <div className="conference-card__heading">
        <div>
          <p className="conference-card__organization">{conference.organization}</p>
          <h2>{conference.name}</h2>
        </div>
      </div>

      <div className="conference-card__deadline-panel">
        <div>
          <span className="conference-card__deadline-label">Abstract deadline</span>
          <strong>{conference.abstractDeadline}</strong>
        </div>
        <span className={`status-pill status-pill--deadline-${deadlineStatus}`}>
          {conference.deadlineUrgencyLabel || 'Deadline status unavailable'}
        </span>
      </div>

      <ul className="tag-list tag-list--categories" aria-label={`${conference.name} specialties`}>
        {conference.categories.map((category) => (
          <li key={category}>{category}</li>
        ))}
      </ul>

      {conferenceFlags.length ? (
        <ul className="tag-list tag-list--discovery" aria-label={`${conference.name} planning flags`}>
          {conferenceFlags.map((flag) => (
            <li key={flag}>{flag}</li>
          ))}
        </ul>
      ) : null}

      <dl className="conference-card__details">
        <div>
          <dt>Meeting dates</dt>
          <dd>{getDisplayDateLabel(conference)}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{formatConferenceLocation(conference) || 'Location TBD'}</dd>
        </div>
        <div>
          <dt>Format</dt>
          <dd>{conference.format}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{conferenceStatus}</dd>
        </div>
      </dl>

      <ul className="tag-list tag-list--discovery" aria-label={`${conference.name} tags`}>
        {visibleTags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>

      <div className="conference-card__footer">
        <div className="conference-card__source">
          <span>{formatSourceTypeLabel(conference.sourceType)}</span>
          {conference.sourceUrl ? (
            <a href={conference.sourceUrl} target="_blank" rel="noreferrer">
              Source
            </a>
          ) : null}
        </div>

        <div className="conference-card__actions">
          {onToggleCompare ? (
            <button type="button" className="button button--secondary" onClick={() => onToggleCompare(conference.id)}>
              {conference.isCompared ? 'Compared' : 'Compare'}
            </button>
          ) : null}
          {conference.meetingUrl ? (
            <a className="button button--ghost" href={conference.meetingUrl} target="_blank" rel="noreferrer">
              Visit Site
            </a>
          ) : null}
          <Link className="button button--secondary" to={`/conferences/${conference.id}`}>
            Details
          </Link>
          <a
            className="button button--ghost"
            href={buildIssueReportUrl(conference)}
            target="_blank"
            rel="noreferrer"
            onClick={() => onReportIssue(conference.id)}
          >
            Report Issue
          </a>
        </div>
      </div>
    </article>
  );
}

export default ConferenceCard;
