import { Link } from 'react-router-dom';

function HomePage({ conferences }) {
  const featuredConferences = conferences.filter((conference) => conference.featured).slice(0, 3);
  const specialties = new Set(conferences.map((conference) => conference.specialty));

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__content">
          <p className="eyebrow">Surgical research and event discovery</p>
          <h1>SurgCon brings surgical conferences and academic collaboration into one platform.</h1>
          <p className="hero__text">
            Discover upcoming meetings, track abstract deadlines, and spotlight programs that
            connect surgeons, residents, fellows, and research teams.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" to="/conferences">
              Explore Conferences
            </Link>
            <Link className="button button--secondary" to="/submit">
              Submit a Conference
            </Link>
          </div>
        </div>

        <aside className="hero__panel">
          <h2>Platform Snapshot</h2>
          <div className="stat-grid">
            <article className="stat-card">
              <strong>{conferences.length}</strong>
              <span>Sample conferences listed</span>
            </article>
            <article className="stat-card">
              <strong>{specialties.size}</strong>
              <span>Surgical specialties represented</span>
            </article>
            <article className="stat-card">
              <strong>1 hub</strong>
              <span>For academic meetings and collaboration leads</span>
            </article>
          </div>
        </aside>
      </section>

      <section className="section">
        <div className="section__heading">
          <div>
            <p className="eyebrow">Featured conferences</p>
            <h2>Highlighted meetings for academic surgeons</h2>
          </div>
          <Link className="text-link" to="/calendar">
            View calendar
          </Link>
        </div>

        <div className="card-grid">
          {featuredConferences.map((conference) => (
            <article className="conference-card" key={conference.id}>
              <span className="conference-card__tag">{conference.specialty}</span>
              <h3>{conference.title}</h3>
              <p>{conference.description}</p>
              <dl className="conference-card__meta">
                <div>
                  <dt>Dates</dt>
                  <dd>
                    {conference.startDate} to {conference.endDate}
                  </dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{conference.location}</dd>
                </div>
              </dl>
              <Link className="text-link" to={`/conferences/${conference.id}`}>
                View conference details
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--muted">
        <div className="section__heading">
          <div>
            <p className="eyebrow">Why SurgCon</p>
            <h2>Designed for clean academic workflows</h2>
          </div>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <h3>Conference discovery</h3>
            <p>Browse meetings by specialty, format, and submission season without extra clutter.</p>
          </article>
          <article className="feature-card">
            <h3>Deadline awareness</h3>
            <p>Track abstract deadlines and event timing in one calm, readable interface.</p>
          </article>
          <article className="feature-card">
            <h3>Collaboration visibility</h3>
            <p>Highlight mentorship, multi-center projects, and research networking opportunities.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
