import { Link, useParams } from 'react-router-dom';
import BookmarkButton from '../components/BookmarkButton';
import {
  formatConferenceLocation,
  getConferenceStatus,
  getDisplayDateLabel,
} from '../utils/dateHelpers';
import { buildIssueReportUrl } from '../utils/issueHelpers';
import { REMINDER_LEAD_TIMES } from '../utils/storageHelpers';
import {
  formatSourceTypeLabel,
  getAudienceIndicators,
  getConferenceFlags,
  getReviewStatusLabel,
  getSubmissionIndicators,
  getTrustBadge,
} from '../utils/conferenceIntel';

function ConferenceDetail({
  conferences,
  notificationPreferences,
  onToggleBookmark,
  onToggleCompare,
  onToggleReminderConference,
  onToggleReminderLeadTime,
  onReportIssue,
}) {
  const { conferenceId } = useParams();
  const conference = conferences.find((item) => item.id === conferenceId);

  if (!conference) {
    return (
      <div className="page">
        <section className="empty-state">
          <h1>Conference not found</h1>
          <p>The requested conference is not present in the current SurgCon dataset.</p>
          <Link className="button button--primary" to="/conferences">
            Return to Directory
          </Link>
        </section>
      </div>
    );
  }

  const conferenceStatus = getConferenceStatus(conference);
  const isReminderSelected = notificationPreferences.selectedConferenceIds.includes(conference.id);
  const trustBadge = getTrustBadge(conference);

  return (
    <div className="page">
      <section className="detail-page">
        <div className="detail-page__hero">
          <div>
            <p className="eyebrow">Conference detail</p>
            <h1>{conference.name}</h1>
            <p className="detail-page__organization">{conference.organization}</p>
            <div className="label-row">
              <span className="status-pill">{conferenceStatus}</span>
              <span className={`status-pill status-pill--${trustBadge.tone}`}>{trustBadge.label}</span>
              <span className="status-pill status-pill--info">{conference.deadlineUrgencyLabel}</span>
              <span className={`status-pill status-pill--${conference.reviewStatus}`}>
                {getReviewStatusLabel(conference.reviewStatus)}
              </span>
              {conference.issueReported ? <span className="status-pill status-pill--review">Admin Review Pending</span> : null}
            </div>
          </div>

          <div className="detail-page__controls">
            <BookmarkButton
              isBookmarked={conference.isBookmarked}
              onToggle={() => onToggleBookmark(conference.id)}
            />
            <button type="button" className="button button--secondary" onClick={() => onToggleCompare(conference.id)}>
              {conference.isCompared ? 'Compared' : 'Compare'}
            </button>
            <a
              className="button button--ghost"
              href={buildIssueReportUrl(conference)}
              target="_blank"
              rel="noreferrer"
              onClick={() => onReportIssue(conference.id)}
            >
              Report Issue
            </a>
            {conference.meetingUrl ? (
              <a className="button button--primary" href={conference.meetingUrl} target="_blank" rel="noreferrer">
                Official Meeting Page
              </a>
            ) : (
              <span className="muted-note">Official meeting link not yet added.</span>
            )}
          </div>
        </div>

        <div className="detail-page__grid">
          <article className="detail-card">
            <h2>Conference information</h2>
            <dl className="detail-list">
              <div>
                <dt>Abstract deadline</dt>
                <dd>{conference.abstractDeadline}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{getDisplayDateLabel(conference)}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{formatConferenceLocation(conference) || 'Location TBD'}</dd>
              </div>
              <div>
                <dt>Venue</dt>
                <dd>{conference.venue || 'Venue TBD'}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{conference.format}</dd>
              </div>
            </dl>
          </article>

          <article className="detail-card">
            <h2>Reminder options</h2>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={isReminderSelected}
                disabled={!conference.isBookmarked}
                onChange={() => onToggleReminderConference(conference.id)}
              />
              <span>Notify me about this bookmarked conference</span>
            </label>
            <div className="checkbox-grid">
              {REMINDER_LEAD_TIMES.map((leadTime) => (
                <label className="checkbox-row" key={leadTime}>
                  <input
                    type="checkbox"
                    checked={notificationPreferences.leadTimes.includes(leadTime)}
                    onChange={() => onToggleReminderLeadTime(leadTime)}
                  />
                  <span>{leadTime}</span>
                </label>
              ))}
            </div>
            <p className="muted-note">
              {conference.isBookmarked
                ? 'Reminder lead times are shared across the app and saved locally.'
                : 'Bookmark this conference first to include it in reminders.'}
            </p>
          </article>
        </div>

        <article className="detail-card">
          <h2>Source and review metadata</h2>
          <dl className="detail-list">
            <div>
              <dt>Source type</dt>
              <dd>{formatSourceTypeLabel(conference.sourceType)}</dd>
            </div>
            <div>
              <dt>Source trust</dt>
              <dd>{conference.sourceTrustLabel}</dd>
            </div>
            <div>
              <dt>Review status</dt>
              <dd>{conference.reviewStatus}</dd>
            </div>
            <div>
              <dt>Verified at</dt>
              <dd>{conference.verifiedAt || 'Not explicitly recorded'}</dd>
            </div>
            <div>
              <dt>Source label</dt>
              <dd>{conference.sourceLabel}</dd>
            </div>
            <div>
              <dt>Source URL</dt>
              <dd>
                {conference.sourceUrl ? (
                  <a href={conference.sourceUrl} target="_blank" rel="noreferrer">
                    Open source reference
                  </a>
                ) : (
                  'No source URL added'
                )}
              </dd>
            </div>
          </dl>
        </article>

        <article className="detail-card">
          <h2>Venue and session metadata</h2>
          <dl className="detail-list">
            <div>
              <dt>Venue address</dt>
              <dd>{conference.venueAddress || 'Venue address not yet available.'}</dd>
            </div>
            <div>
              <dt>CME</dt>
              <dd>{conference.cme ? `${conference.cme} credits` : 'Not listed'}</dd>
            </div>
          </dl>
          {conference.sessions?.length ? (
            <ul className="tag-list tag-list--discovery">
              {conference.sessions.map((session) => (
                <li key={session}>{session}</li>
              ))}
            </ul>
          ) : (
            <p className="muted-note">Session highlights have not been added for this conference yet.</p>
          )}
        </article>

        <article className="detail-card">
          <h2>Conference intelligence</h2>
          <dl className="detail-list">
            <div>
              <dt>Recurring pattern</dt>
              <dd>{conference.recurring?.futureCycleStatus || 'Not available'}</dd>
            </div>
            <div>
              <dt>Likely month</dt>
              <dd>{conference.recurring?.likelyMonth || 'Not enough history'}</dd>
            </div>
            <div>
              <dt>Known years</dt>
              <dd>{conference.recurring?.knownYears?.join(', ') || 'Single known record'}</dd>
            </div>
            <div>
              <dt>Journal association</dt>
              <dd>{conference.journalAssociation || 'Not listed'}</dd>
            </div>
            <div>
              <dt>Resident paper competition</dt>
              <dd>{conference.residentPaperCompetition || 'Not listed'}</dd>
            </div>
            <div>
              <dt>Travel scholarship notes</dt>
              <dd>{conference.travelScholarshipNotes || 'Not listed'}</dd>
            </div>
          </dl>
          <ul className="tag-list tag-list--discovery">
            {getConferenceFlags(conference).map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </article>

        <article className="detail-card">
          <h2>Audience and submissions</h2>
          <p className="muted-note">
            Membership relevance: {conference.membershipRelevance || 'No membership note added yet.'}
          </p>
          <ul className="tag-list tag-list--categories">
            {getAudienceIndicators(conference).map((indicator) => (
              <li key={indicator}>{indicator}</li>
            ))}
          </ul>
          <ul className="tag-list tag-list--discovery">
            {(getSubmissionIndicators(conference).length
              ? getSubmissionIndicators(conference)
              : ['Submission details not yet curated']
            ).map((indicator) => (
              <li key={indicator}>{indicator}</li>
            ))}
          </ul>
          {conference.abstractTypes?.length ? (
            <ul className="tag-list tag-list--discovery">
              {conference.abstractTypes.map((abstractType) => (
                <li key={abstractType}>{abstractType}</li>
              ))}
            </ul>
          ) : null}
        </article>

        <article className="detail-card">
          <h2>Specialties</h2>
          <ul className="tag-list tag-list--categories">
            {conference.categories.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>
        </article>

        <article className="detail-card">
          <h2>Tags</h2>
          <ul className="tag-list tag-list--discovery">
            {conference.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </article>

        <article className="detail-card">
          <h2>Notes</h2>
          <p>{conference.notes || 'No additional notes have been added yet.'}</p>
        </article>
      </section>
    </div>
  );
}

export default ConferenceDetail;
