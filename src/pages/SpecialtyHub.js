import { Link, useParams } from 'react-router-dom';
import ConferenceCard from '../components/ConferenceCard';
import { getConferencesForHub, getSpecialtyHub, SPECIALTY_HUBS } from '../utils/specialtyHelpers';
import { compareConferences } from '../utils/dateHelpers';

function SpecialtyHub({
  conferences,
  notificationPreferences,
  onToggleBookmark,
  onToggleCompare,
  onReportIssue,
}) {
  const { specialtySlug } = useParams();
  const hub = getSpecialtyHub(specialtySlug);

  if (!hub) {
    return (
      <div className="page">
        <section className="empty-state">
          <h1>Specialty hub not found</h1>
          <p>The requested specialty page is not configured in the current SurgCon build.</p>
          <Link className="button button--primary" to="/conferences">
            Return to directory
          </Link>
        </section>
      </div>
    );
  }

  const hubConferences = getConferencesForHub(conferences, hub).sort(compareConferences);
  const upcomingCount = hubConferences.filter((conference) => !conference.isPast).length;
  const officialCount = hubConferences.filter((conference) => conference.sourceType === 'official').length;

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Specialty hub</p>
        <h1>{hub.title}</h1>
        <p>{hub.description}</p>
        <div className="export-stats">
          <span className="status-pill status-pill--info">{hubConferences.length} records</span>
          <span className="status-pill status-pill--info">{upcomingCount} upcoming</span>
          <span className="status-pill status-pill--info">{officialCount} official-source records</span>
        </div>
      </section>

      <section className="section section--muted">
        <div className="feature-grid">
          {SPECIALTY_HUBS.map((specialty) => (
            <article key={specialty.slug} className="feature-card">
              <h3>{specialty.title}</h3>
              <p>{specialty.description}</p>
              <Link className="text-link" to={`/specialties/${specialty.slug}`}>
                Open hub
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="card-grid">
        {hubConferences.map((conference) => (
          <ConferenceCard
            key={conference.id}
            conference={conference}
            onToggleBookmark={onToggleBookmark}
            onToggleCompare={onToggleCompare}
            onReportIssue={onReportIssue}
            isReminderSelected={notificationPreferences.selectedConferenceIds.includes(conference.id)}
          />
        ))}
      </section>
    </div>
  );
}

export default SpecialtyHub;
