import { Link, useParams } from 'react-router-dom';

function ConferenceDetailPage({ conferences }) {
  const { conferenceId } = useParams();
  const conference = conferences.find((item) => item.id === conferenceId);

  if (!conference) {
    return (
      <div className="page">
        <section className="detail detail--missing">
          <p className="eyebrow">Conference detail</p>
          <h1>Conference not found</h1>
          <p>The requested conference could not be located in the current sample dataset.</p>
          <Link className="button button--primary" to="/conferences">
            Return to directory
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="detail">
        <div className="detail__hero">
          <div>
            <p className="eyebrow">{conference.specialty}</p>
            <h1>{conference.title}</h1>
            <p className="detail__summary">{conference.description}</p>
          </div>
          <div className="detail__actions">
            <a className="button button--primary" href={conference.website} target="_blank" rel="noreferrer">
              Visit Conference Site
            </a>
            <Link className="button button--secondary" to="/submit">
              Submit a Similar Meeting
            </Link>
          </div>
        </div>

        <div className="detail__grid">
          <article className="detail-card">
            <h2>Event overview</h2>
            <dl className="detail-list">
              <div>
                <dt>Dates</dt>
                <dd>
                  {conference.startDate} to {conference.endDate}
                </dd>
              </div>
              <div>
                <dt>Venue</dt>
                <dd>{conference.venue}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{conference.location}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{conference.format}</dd>
              </div>
              <div>
                <dt>Organizer</dt>
                <dd>{conference.organizer}</dd>
              </div>
            </dl>
          </article>

          <article className="detail-card">
            <h2>Academic collaboration</h2>
            <dl className="detail-list">
              <div>
                <dt>Audience</dt>
                <dd>{conference.audience}</dd>
              </div>
              <div>
                <dt>Submission type</dt>
                <dd>{conference.submissionType}</dd>
              </div>
              <div>
                <dt>Abstract deadline</dt>
                <dd>{conference.abstractDeadline}</dd>
              </div>
              <div>
                <dt>Collaboration focus</dt>
                <dd>{conference.collaborationFocus}</dd>
              </div>
            </dl>
          </article>
        </div>

        <article className="detail-card">
          <h2>Key topics</h2>
          <ul className="topic-list topic-list--detail">
            {conference.topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

export default ConferenceDetailPage;
