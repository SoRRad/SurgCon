import { useState } from 'react';

const initialForm = {
  conferenceName: '',
  specialty: '',
  location: '',
  startDate: '',
  abstractDeadline: '',
  website: '',
  notes: '',
};

function SubmitConferencePage({ conferences }) {
  const [formData, setFormData] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const specialties = [...new Set(conferences.map((conference) => conference.specialty))];

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Submit conference</p>
        <h1>Suggest a conference for the SurgCon directory.</h1>
        <p>
          This beginner-friendly form is currently a front-end demo and can later be connected to a
          database or API.
        </p>
      </section>

      <section className="submission-layout">
        <form className="submission-form" onSubmit={handleSubmit}>
          <label>
            Conference name
            <input
              type="text"
              name="conferenceName"
              value={formData.conferenceName}
              onChange={handleChange}
              placeholder="Example: Midwestern Surgical Research Forum"
              required
            />
          </label>

          <label>
            Specialty
            <select name="specialty" value={formData.specialty} onChange={handleChange} required>
              <option value="">Select a specialty</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </label>

          <label>
            Location
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State or Virtual"
              required
            />
          </label>

          <label>
            Start date
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </label>

          <label>
            Abstract deadline
            <input
              type="date"
              name="abstractDeadline"
              value={formData.abstractDeadline}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Website
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.org"
            />
          </label>

          <label>
            Notes
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="5"
              placeholder="Add submission notes, audience details, or collaboration opportunities."
            />
          </label>

          <button className="button button--primary" type="submit">
            Submit Conference
          </button>
        </form>

        <aside className="submission-note">
          <h2>What to collect</h2>
          <ul>
            <li>Conference title and specialty</li>
            <li>Meeting dates and abstract deadline</li>
            <li>Location, venue, and official website</li>
            <li>Any mentorship or research collaboration notes</li>
          </ul>

          {submitted ? (
            <div className="submission-success" role="status">
              <h3>Submission captured</h3>
              <p>
                Demo submission recorded for <strong>{formData.conferenceName}</strong>. The form
                currently stores data only in the browser session.
              </p>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}

export default SubmitConferencePage;
