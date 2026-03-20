const REPOSITORY_ISSUES_BASE = 'https://github.com/sorrad/SurgCon/issues/new';

function buildIssueBody(conference) {
  return encodeURIComponent(
    [
      `Conference: ${conference.name}`,
      `Organization: ${conference.organization}`,
      `Location: ${[conference.city, conference.state, conference.country].filter(Boolean).join(', ')}`,
      `Dates: ${conference.startDate} to ${conference.endDate}`,
      `Source URL: ${conference.sourceUrl || conference.meetingUrl || 'Not listed'}`,
      '',
      'Issue details:',
      '- Please describe the data issue, missing detail, or requested correction here.',
    ].join('\n')
  );
}

export function buildIssueReportMailto(conference) {
  const subject = encodeURIComponent(`SurgCon issue report: ${conference.name}`);
  const body = buildIssueBody(conference);

  return `mailto:?subject=${subject}&body=${body}`;
}

export function buildIssueReportUrl(conference) {
  const title = encodeURIComponent(`Conference data correction: ${conference.name}`);
  const body = buildIssueBody(conference);
  return `${REPOSITORY_ISSUES_BASE}?template=conference-correction.yml&title=${title}&body=${body}`;
}

export function buildSubmissionIssueUrl(submission) {
  const title = encodeURIComponent(`Conference submission: ${submission.name || 'New conference'}`);
  const body = encodeURIComponent(
    [
      `Conference: ${submission.name || ''}`,
      `Organization: ${submission.organization || ''}`,
      `Specialties: ${(submission.categories || []).join(', ')}`,
      `Dates: ${submission.startDate || 'TBD'} to ${submission.endDate || submission.startDate || 'TBD'}`,
      `Location: ${[submission.city, submission.state, submission.country].filter(Boolean).join(', ')}`,
      `Meeting URL: ${submission.meetingUrl || ''}`,
      `Source URL: ${submission.sourceUrl || ''}`,
      '',
      'Why this should be added or updated:',
      '- ',
    ].join('\n')
  );

  return `${REPOSITORY_ISSUES_BASE}?template=conference-submission.yml&title=${title}&body=${body}`;
}
