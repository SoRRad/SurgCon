import { Link } from 'react-router-dom';
import ConferenceCard from '../components/ConferenceCard';
import { SPECIALTY_HUBS } from '../utils/specialtyHelpers';

function Home({
  conferences,
  bookmarkedConferences,
  notificationPreferences,
  onToggleBookmark,
  onToggleCompare,
  onReportIssue,
}) {
  const upcomingConferences = conferences.filter((conference) => !conference.isPast).slice(0, 3);
  const specialtiesCovered = new Set(conferences.flatMap((conference) => conference.categories));
  const historicalConferenceCount = conferences.filter((conference) => conference.year && conference.year <= 2025).length;
  const featuredConferenceCount = conferences.filter((conference) => conference.featured).length;

  return (
    <div className="page">
      <section className="hero hero--wide">
        <div className="hero__content">
          <p className="eyebrow">Editorial surgical planning</p>
          <h1>A modern surgical conference platform for discovery, deadlines, bookmarks, exports, and maintainable data review.</h1>
          <p className="hero__text">
            SurgCon keeps its frontend static and GitHub Pages-friendly while still supporting a richer dataset, historical coverage from 2024 onward, and a cleaner academic workflow for surgeons, trainees, and research teams.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" to="/conferences">
              Explore the Directory
            </Link>
            <Link className="button button--secondary" to="/calendar">
              Open the Calendar
            </Link>
          </div>
        </div>

        <aside className="hero__panel">
          <h2>At a glance</h2>
          <div className="stat-grid">
            <article className="stat-card">
              <strong>{conferences.filter((conference) => conference.year >= 2026).length}</strong>
              <span>Upcoming-focused 2026+ records</span>
            </article>
            <article className="stat-card">
              <strong>{historicalConferenceCount}</strong>
              <span>2024-2025 historical records retained for context</span>
            </article>
            <article className="stat-card">
              <strong>{specialtiesCovered.size}</strong>
              <span>Standardized specialties across the dataset</span>
            </article>
            <article className="stat-card">
              <strong>{featuredConferenceCount}</strong>
              <span>Featured meetings highlighted for planning priority</span>
            </article>
          </div>
          <div className="hero__summary">
            <p>
              Saved on this device: <strong>{bookmarkedConferences.length}</strong>
            </p>
            <p>
              Reminder windows configured: <strong>{notificationPreferences.leadTimes.length}</strong>
            </p>
          </div>
        </aside>
      </section>

      <section className="section">
        <div className="section__heading">
          <div>
            <p className="eyebrow">Featured upcoming meetings</p>
            <h2>Selected conferences with richer metadata and stronger visual hierarchy</h2>
          </div>
          <Link className="text-link" to="/bookmarks">
            Review bookmarks
          </Link>
        </div>

        <div className="card-grid">
          {upcomingConferences.map((conference) => (
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
      </section>

      <section className="section section--muted">
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Broader coverage</h3>
            <p>Major meetings, regional societies, and historical records now sit in one normalized conference model with tags, venues, sessions, review status, and source confidence.</p>
          </article>
          <article className="feature-card">
            <h3>Practical exports</h3>
            <p>Bookmarks and filtered views can move cleanly into CSV rows, deadline calendars, and conference-date ICS files without any paid service.</p>
          </article>
          <article className="feature-card">
            <h3>Maintained, not magical</h3>
            <p>A repo-based update pipeline and local review files keep the data refresh workflow honest, transparent, and compatible with GitHub Pages.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section__heading">
          <div>
            <p className="eyebrow">Specialty hubs</p>
            <h2>Browse focused landing pages for the most important surgical tracks</h2>
          </div>
        </div>
        <div className="feature-grid">
          {SPECIALTY_HUBS.map((hub) => (
            <article className="feature-card" key={hub.slug}>
              <h3>{hub.title}</h3>
              <p>{hub.description}</p>
              <Link className="text-link" to={`/specialties/${hub.slug}`}>
                Open specialty hub
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
