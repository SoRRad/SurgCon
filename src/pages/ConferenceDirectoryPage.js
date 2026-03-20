import { Link } from 'react-router-dom';

function ConferenceDirectoryPage({ conferences }) {
  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Conference directory</p>
        <h1>Browse surgical meetings and academic gatherings.</h1>
        <p>
          A simple directory for discovering conferences, comparing focus areas, and planning
          submissions.
        </p>
      </section>

      <section className="card-grid">
        {conferences.map((conference) => (
          <article className="conference-card conference-card--directory" key={conference.id}>
            <div className="conference-card__header">
              <span className="conference-card__tag">{conference.specialty}</span>
              <span className="conference-card__format">{conference.format}</span>
            </div>
            <h2>{conference.title}</h2>
            <p>{conference.description}</p>
            <ul className="topic-list" aria-label={`${conference.title} topics`}>
              {conference.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
            <dl className="conference-card__meta">
              <div>
                <dt>Location</dt>
                <dd>{conference.location}</dd>
              </div>
              <div>
                <dt>Abstract deadline</dt>
                <dd>{conference.abstractDeadline}</dd>
              </div>
              <div>
                <dt>Audience</dt>
                <dd>{conference.audience}</dd>
              </div>
            </dl>
            <Link className="text-link" to={`/conferences/${conference.id}`}>
              Open conference profile
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}

export default ConferenceDirectoryPage;
