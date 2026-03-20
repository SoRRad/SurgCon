const MONTH_DAY_YEAR_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '');
}

export function parseDateValue(value) {
  if (!isIsoDate(value)) {
    return null;
  }

  return new Date(`${value}T00:00:00`);
}

export function formatSingleDate(value) {
  const parsedDate = parseDateValue(value);

  if (!parsedDate) {
    return value || 'TBD';
  }

  return MONTH_DAY_YEAR_FORMATTER.format(parsedDate);
}

export function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) {
    return 'TBD';
  }

  if (startDate === endDate || !endDate) {
    return formatSingleDate(startDate);
  }

  return `${formatSingleDate(startDate)} - ${formatSingleDate(endDate)}`;
}

export function formatConferenceLocation(conference) {
  if (conference.locationLabel) {
    return conference.locationLabel;
  }

  return [conference.city, conference.state, conference.country]
    .filter((value) => value && value !== 'TBD')
    .join(', ');
}

export function getSortDateValue(value) {
  const parsedDate = parseDateValue(value);
  return parsedDate ? parsedDate.getTime() : null;
}

export function getDeadlineStatus(abstractDeadlineSort) {
  const deadlineDate = parseDateValue(abstractDeadlineSort);

  if (!deadlineDate) {
    return 'TBD';
  }

  const today = parseDateValue(getTodayDateString());
  return deadlineDate >= today ? 'Open' : 'Closed';
}

export function getConferenceStatus(conference) {
  if (conference.isInferred) {
    return 'Predicted';
  }

  if (conference.isPast) {
    return 'Past';
  }

  return 'Upcoming';
}

export function getConferenceDateSortValue(conference) {
  return getSortDateValue(conference.startDate);
}

export function compareConferences(firstConference, secondConference) {
  if (firstConference.isPast !== secondConference.isPast) {
    return firstConference.isPast ? 1 : -1;
  }

  const firstStart = getConferenceDateSortValue(firstConference);
  const secondStart = getConferenceDateSortValue(secondConference);

  if (!firstConference.isPast && firstStart !== null && secondStart !== null) {
    return firstStart - secondStart;
  }

  if (firstConference.isPast && firstStart !== null && secondStart !== null) {
    return secondStart - firstStart;
  }

  if (firstStart !== null && secondStart === null) {
    return -1;
  }

  if (firstStart === null && secondStart !== null) {
    return 1;
  }

  if (firstConference.year !== secondConference.year) {
    return firstConference.year - secondConference.year;
  }

  return firstConference.name.localeCompare(secondConference.name);
}

export function formatLastUpdatedLabel() {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

export function formatDataUpdatedLabel(lastUpdatedValue) {
  const parsedDate = new Date(lastUpdatedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return lastUpdatedValue || 'Unknown';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsedDate);
}

export function getDisplayDateLabel(conference) {
  return conference.dateLabel || formatDateRange(conference.startDate, conference.endDate);
}
