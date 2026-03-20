import { useState } from 'react';
import { STANDARD_CATEGORIES } from '../utils/normalizeConferenceData';
import { buildSubmissionIssueUrl } from '../utils/issueHelpers';
import { loadSubmittedConferences, saveSubmittedConferences } from '../utils/storageHelpers';
import { buildConferencePrefillFromUrl, isLikelyUrl } from '../utils/urlImportHelpers';

const initialFormState = {
  name: '',
  organization: '',
  categories: [],
  startDate: '',
  endDate: '',
  regionGroup: 'United States',
  city: '',
  state: '',
  country: 'United States',
  format: 'In-Person',
  abstractDeadline: '',
  venue: '',
  venueAddress: '',
  tags: '',
  abstractTypes: '',
  meetingUrl: '',
  sourceUrl: '',
  sourceType: 'manual',
  source: '',
  membershipRelevance: '',
  notes: '',
};

const CANADA_PROVINCES = ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan'];
const US_STATES = ['Alabama', 'Arizona', 'California', 'Colorado', 'Connecticut', 'DC', 'Florida', 'Georgia', 'Illinois', 'Indiana', 'Kentucky', 'Louisiana', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Missouri', 'Nevada', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'Ohio', 'Pennsylvania', 'Texas', 'Utah', 'Virginia', 'Washington', 'Wisconsin'];

function AddConference() {
  const [urlInput, setUrlInput] = useState('');
  const [formData, setFormData] = useState(initialFormState);
  const [statusMessage, setStatusMessage] = useState('');
  const [submittedConferences, setSubmittedConferences] = useState(() => loadSubmittedConferences());

  function handleUrlImport() {
    if (!isLikelyUrl(urlInput)) {
      setStatusMessage('Please enter a valid URL. Frontend-only import can validate the link, but it cannot scrape full conference details.');
      return;
    }

    const prefill = buildConferencePrefillFromUrl(urlInput);
    setFormData((currentData) => ({
      ...currentData,
      ...prefill,
    }));
    setStatusMessage('URL validated. SurgCon prefilled the link, organization, and a suggested title for manual review.');
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleRegionChange(event) {
    const nextRegion = event.target.value;
    setFormData((currentData) => ({
      ...currentData,
      regionGroup: nextRegion,
      state: '',
      country:
        nextRegion === 'United States'
          ? 'United States'
          : nextRegion === 'Canada'
            ? 'Canada'
            : '',
    }));
  }

  function handleToggleCategory(category) {
    setFormData((currentData) => ({
      ...currentData,
      categories: currentData.categories.includes(category)
        ? currentData.categories.filter((currentCategory) => currentCategory !== category)
        : [...currentData.categories, category],
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!formData.name.trim() || !formData.organization.trim() || !formData.city.trim()) {
      setStatusMessage('Please complete the conference name, organization, and city before submitting for review.');
      return;
    }

    const submission = {
      id: `submission-${Date.now()}`,
      ...formData,
      endDate: formData.endDate || formData.startDate,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      abstractTypes: formData.abstractTypes
        .split(',')
        .map((abstractType) => abstractType.trim())
        .filter(Boolean),
      moderationStatus: 'submitted',
      submittedAt: new Date().toISOString(),
    };
    const nextSubmissions = [submission, ...submittedConferences];
    setSubmittedConferences(nextSubmissions);
    saveSubmittedConferences(nextSubmissions);
    setStatusMessage('Submitted for local review. You can keep it in the device-local queue and/or open a prefilled GitHub review issue.');
    setFormData(initialFormState);
  }

  const regionOptions = formData.regionGroup === 'Canada' ? CANADA_PROVINCES : US_STATES;
  const showStateField = formData.regionGroup === 'United States' || formData.regionGroup === 'Canada';

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Add conference</p>
        <h1>Clean, reliable conference staging without pretending to scrape the web.</h1>
        <p>Import from URL validates the link and suggests a title or organization when possible, but full conference extraction remains manual in this frontend-only app.</p>
      </section>

      <section className="notification-layout">
        <form className="notification-form" onSubmit={handleSubmit}>
          <label>
            Import from URL
            <input
              type="url"
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              placeholder="https://example.org/conference-page"
            />
          </label>
          <button type="button" className="button button--secondary" onClick={handleUrlImport}>
            Validate and Prefill
          </button>

          <label>
            Conference name
            <input type="text" name="name" value={formData.name} onChange={handleFieldChange} />
          </label>

          <label>
            Organization
            <input type="text" name="organization" value={formData.organization} onChange={handleFieldChange} />
          </label>

          <div className="detail-card">
            <h2>Specialties</h2>
            <div className="chip-grid">
              {STANDARD_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={formData.categories.includes(category) ? 'chip-button is-active' : 'chip-button'}
                  onClick={() => handleToggleCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row-grid">
            <label>
              Start date
              <input type="date" name="startDate" value={formData.startDate} onChange={handleFieldChange} />
            </label>
            <label>
              End date
              <input type="date" name="endDate" value={formData.endDate} onChange={handleFieldChange} />
            </label>
          </div>

          <div className="form-row-grid">
            <label>
              Region group
              <select name="regionGroup" value={formData.regionGroup} onChange={handleRegionChange}>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Other International">Other International</option>
              </select>
            </label>
            <label>
              City
              <input type="text" name="city" value={formData.city} onChange={handleFieldChange} />
            </label>
          </div>

          <div className="form-row-grid">
            {showStateField ? (
              <label>
                {formData.regionGroup === 'Canada' ? 'Province' : 'State'}
                <select name="state" value={formData.state} onChange={handleFieldChange}>
                  <option value="">Select an option</option>
                  {regionOptions.map((optionValue) => (
                    <option key={optionValue} value={optionValue}>
                      {optionValue}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label>
                Country
                <input type="text" name="country" value={formData.country} onChange={handleFieldChange} />
              </label>
            )}
            <label>
              Format
              <select name="format" value={formData.format} onChange={handleFieldChange}>
                <option value="In-Person">In-Person</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Virtual">Virtual</option>
                <option value="TBD">TBD</option>
              </select>
            </label>
          </div>

          <label>
            Abstract deadline
            <input type="date" name="abstractDeadline" value={formData.abstractDeadline} onChange={handleFieldChange} />
          </label>

          <div className="form-row-grid">
            <label>
              Venue
              <input type="text" name="venue" value={formData.venue} onChange={handleFieldChange} />
            </label>
            <label>
              Venue address
              <input type="text" name="venueAddress" value={formData.venueAddress} onChange={handleFieldChange} />
            </label>
          </div>

          <label>
            Meeting URL
            <input type="url" name="meetingUrl" value={formData.meetingUrl} onChange={handleFieldChange} />
          </label>

          <div className="form-row-grid">
            <label>
              Source URL
              <input type="url" name="sourceUrl" value={formData.sourceUrl} onChange={handleFieldChange} />
            </label>
            <label>
              Source type
              <select name="sourceType" value={formData.sourceType} onChange={handleFieldChange}>
                <option value="manual">Manual</option>
                <option value="official">Official</option>
                <option value="trusted-directory">Trusted directory</option>
                <option value="legacy">Legacy</option>
                <option value="aggregator">Aggregator</option>
              </select>
            </label>
          </div>

          <label>
            Tags
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleFieldChange}
              placeholder="abstracts, resident-friendly, annual meeting"
            />
          </label>

          <label>
            Abstract types
            <input
              type="text"
              name="abstractTypes"
              value={formData.abstractTypes}
              onChange={handleFieldChange}
              placeholder="podium, poster, video, late-breaking"
            />
          </label>

          <label>
            Source note
            <input type="text" name="source" value={formData.source} onChange={handleFieldChange} />
          </label>

          <label>
            Membership relevance
            <input
              type="text"
              name="membershipRelevance"
              value={formData.membershipRelevance}
              onChange={handleFieldChange}
              placeholder="Useful for residents, fellows, regional network, or society members"
            />
          </label>

          <label>
            Notes
            <textarea name="notes" rows="5" value={formData.notes} onChange={handleFieldChange} />
          </label>

          <button type="submit" className="button button--primary">
            Submit for Review
          </button>
        </form>

        <aside className="submission-note">
          <h2>Static workflow and moderation</h2>
          <ul>
            <li>URL import can validate a link and suggest basic text only.</li>
            <li>No scraping or background discovery is performed.</li>
            <li>Conference additions still need either a source record update or a GitHub review issue.</li>
            <li>Recommended moderation states are submitted, under review, approved, and flagged.</li>
            <li>After editing the source list, run `npm run data:pipeline` to regenerate review and publishable data.</li>
          </ul>
          {statusMessage ? <p className="muted-note">{statusMessage}</p> : null}
          <div className="submission-note__section">
            <h3>Local review queue</h3>
            {submittedConferences.length ? (
              <ul className="compact-list">
                {submittedConferences.slice(0, 5).map((submission) => (
                  <li key={submission.id}>
                    <strong>{submission.name}</strong>
                    <span>{submission.moderationStatus}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted-note">No local submissions yet.</p>
            )}
          </div>
          {submittedConferences.length ? (
            <a
              className="button button--secondary"
              href={buildSubmissionIssueUrl(submittedConferences[0])}
              target="_blank"
              rel="noreferrer"
            >
              Open Prefilled GitHub Review Issue
            </a>
          ) : null}
        </aside>
      </section>
    </div>
  );
}

export default AddConference;
