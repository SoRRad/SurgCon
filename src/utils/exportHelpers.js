import { formatConferenceLocation, getDisplayDateLabel } from './dateHelpers';

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const temporaryLink = document.createElement('a');
  temporaryLink.href = objectUrl;
  temporaryLink.download = filename;
  temporaryLink.click();
  URL.revokeObjectURL(objectUrl);
}

function escapeIcsText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function escapeCsvValue(value) {
  const stringValue = String(value ?? '');
  return `"${stringValue.replace(/"/g, '""')}"`;
}

export function exportConferencesToCsv(conferences, filename = 'surgcon-bookmarks.csv') {
  const headerRow = [
    'Conference Name',
    'Organization',
    'Specialties',
    'Tags',
    'Location',
    'Dates',
    'Abstract Deadline',
    'Format',
    'Venue',
    'Source Trust',
    'Source Type',
    'Review Status',
    'Last Checked',
    'First Seen',
    'Last Updated',
    'Flags',
    'Official Link',
  ];

  const dataRows = conferences.map((conference) => [
    conference.name,
    conference.organization,
    conference.categories.join('; '),
    conference.tags.join('; '),
    formatConferenceLocation(conference),
    getDisplayDateLabel(conference),
    conference.abstractDeadline,
    conference.format,
    conference.venue,
    conference.sourceTrustLabel,
    conference.sourceType,
    conference.reviewStatus,
    conference.lastChecked,
    conference.firstSeenAt || '',
    conference.lastUpdatedAt || '',
    (conference.flags || []).join('; '),
    conference.meetingUrl,
  ]);

  const csvContent = [headerRow, ...dataRows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');

  downloadTextFile(filename, csvContent, 'text/csv;charset=utf-8;');
  return {
    filename,
    recordCount: conferences.length,
    type: 'csv',
  };
}

function buildIcsDate(value) {
  return value.replace(/-/g, '');
}

function buildNextIcsDate(value) {
  const dateValue = new Date(`${value}T00:00:00`);
  dateValue.setDate(dateValue.getDate() + 1);
  return dateValue.toISOString().slice(0, 10).replace(/-/g, '');
}

function buildCalendarEvent(conference, mode) {
  const startValue = mode === 'dates' ? conference.startDate : conference.abstractDeadlineSort;

  if (!startValue) {
    return null;
  }

  const endValue =
    mode === 'dates'
      ? conference.endDate || conference.startDate
      : conference.abstractDeadlineSort;

  const summarySuffix = mode === 'dates' ? 'conference dates' : 'abstract deadline';
  const description =
    mode === 'dates'
      ? `Conference dates for ${conference.name}`
      : `Abstract deadline for ${conference.name}`;

  return [
    'BEGIN:VEVENT',
    `UID:${conference.id}-${mode}@surgcon`,
    `DTSTAMP:${buildIcsDate(new Date().toISOString().slice(0, 10))}T000000Z`,
    `DTSTART;VALUE=DATE:${buildIcsDate(startValue)}`,
    `DTEND;VALUE=DATE:${buildNextIcsDate(endValue || startValue)}`,
    `SUMMARY:${escapeIcsText(`${conference.name} ${summarySuffix}`)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(formatConferenceLocation(conference))}`,
    conference.meetingUrl ? `URL:${escapeIcsText(conference.meetingUrl)}` : '',
    'END:VEVENT',
  ]
    .filter(Boolean)
    .join('\n');
}

export function exportConferenceDeadlinesToIcs(
  conferences,
  filename = 'surgcon-deadlines.ics',
  mode = 'deadlines'
) {
  const exportableConferences = conferences.filter((conference) =>
    mode === 'dates' ? conference.startDate : conference.abstractDeadlineSort
  );

  const events = exportableConferences
    .map((conference) => buildCalendarEvent(conference, mode))
    .filter(Boolean);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SurgCon//Conference Calendar//EN',
    ...events,
    'END:VCALENDAR',
  ].join('\n');

  downloadTextFile(filename, icsContent, 'text/calendar;charset=utf-8;');
  return {
    filename,
    recordCount: events.length,
    type: mode === 'dates' ? 'dates-ics' : 'deadlines-ics',
  };
}
