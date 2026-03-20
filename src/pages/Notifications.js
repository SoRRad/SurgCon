import { STANDARD_CATEGORIES } from '../utils/normalizeConferenceData';
import { REMINDER_LEAD_TIMES } from '../utils/storageHelpers';

function Notifications({
  conferences,
  bookmarkedConferences,
  notificationPreferences,
  onUpdateNotificationPreferences,
  onToggleReminderConference,
  onToggleReminderCategory,
  onToggleReminderLeadTime,
  onResetNotificationPreferences,
}) {
  function handleEmailChange(event) {
    onUpdateNotificationPreferences((currentPreferences) => ({
      ...currentPreferences,
      email: event.target.value,
    }));
  }

  const upcomingDeadlines = conferences
    .filter((conference) => !conference.isPast && conference.abstractDeadlineSort)
    .sort((firstConference, secondConference) =>
      firstConference.abstractDeadlineSort.localeCompare(secondConference.abstractDeadlineSort)
    )
    .slice(0, 6);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Notifications</p>
        <h1>Save reminder preferences locally for specialties, bookmarked meetings, and filtered conference sets.</h1>
        <p>
          These settings stay in localStorage only. SurgCon prepares a clean reminder plan and export path, but it does not send automated emails from the browser.
        </p>
      </section>

      <section className="notification-layout">
        <div className="notification-form">
          <label>
            Email address
            <input
              type="email"
              value={notificationPreferences.email}
              onChange={handleEmailChange}
              placeholder="name@example.com"
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={notificationPreferences.notifyBookmarkedOnly}
              onChange={(event) =>
                onUpdateNotificationPreferences((currentPreferences) => ({
                  ...currentPreferences,
                  notifyBookmarkedOnly: event.target.checked,
                }))
              }
            />
            <span>Notify me using my bookmarked conferences</span>
          </label>

          <section className="detail-card">
            <h2>Specialty preferences</h2>
            <div className="chip-grid">
              {STANDARD_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    notificationPreferences.selectedCategories.includes(category)
                      ? 'chip-button is-active'
                      : 'chip-button'
                  }
                  onClick={() => onToggleReminderCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          <section className="detail-card">
            <h2>Selected bookmarked conferences</h2>
            {bookmarkedConferences.length ? (
              <div className="checkbox-grid">
                {bookmarkedConferences.map((conference) => (
                  <label className="checkbox-row" key={conference.id}>
                    <input
                      type="checkbox"
                      checked={notificationPreferences.selectedConferenceIds.includes(conference.id)}
                      onChange={() => onToggleReminderConference(conference.id)}
                    />
                    <span>{conference.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="empty-state empty-state--compact">
                <h3>No bookmarks yet</h3>
                <p>Save conferences first, then use them here for reminder planning.</p>
              </div>
            )}
          </section>

          <section className="detail-card">
            <h2>Advance reminder windows</h2>
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
          </section>

          <button type="button" className="button button--secondary" onClick={onResetNotificationPreferences}>
            Reset Notification Preferences
          </button>
        </div>

        <aside className="submission-note">
          <h2>Current reminder plan</h2>
          <ul>
            <li>Email: {notificationPreferences.email || 'Not set'}</li>
            <li>Selected specialties: {notificationPreferences.selectedCategories.length}</li>
            <li>Selected bookmarked conferences: {notificationPreferences.selectedConferenceIds.length}</li>
            <li>Filtered results queued from directory: {notificationPreferences.selectedFilteredResults.length}</li>
            <li>Lead times: {notificationPreferences.leadTimes.join(', ') || 'None selected'}</li>
          </ul>
          <p className="muted-note">Use the directory actions to push either a filtered result set or a specialty directly into this local reminder plan.</p>
          <div className="submission-note__section">
            <h3>Upcoming abstract deadlines</h3>
            <ul className="compact-list">
              {upcomingDeadlines.map((conference) => (
                <li key={conference.id}>
                  <strong>{conference.name}</strong>
                  <span>{conference.abstractDeadline}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Notifications;
