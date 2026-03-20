function sortByDate(conferences) {
  return [...conferences].sort((first, second) => {
    return new Date(first.startDate) - new Date(second.startDate);
  });
}

function CalendarPage({ conferences }) {
  const orderedConferences = sortByDate(conferences);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Conference calendar</p>
        <h1>Plan upcoming surgical deadlines and meetings.</h1>
        <p>
          A lightweight schedule view that keeps event dates, locations, and abstract deadlines
          easy to scan.
        </p>
      </section>

      <section className="timeline" aria-label="Conference calendar timeline">
        {orderedConferences.map((conference) => (
          <article className="timeline__item" key={conference.id}>
            <div className="timeline__date">
              <span>{conference.startDate}</span>
              <small>Abstract deadline: {conference.abstractDeadline}</small>
            </div>
            <div className="timeline__content">
              <p className="eyebrow">{conference.specialty}</p>
              <h2>{conference.title}</h2>
              <p>{conference.location}</p>
              <p>{conference.collaborationFocus}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default CalendarPage;
