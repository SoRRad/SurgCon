export function formatSourceTypeLabel(sourceType) {
  const sourceTypeLabels = {
    official: 'Official source',
    'trusted-directory': 'Trusted directory',
    aggregator: 'Discovery source',
    legacy: 'Legacy record',
    manual: 'Manual review',
    'user-submitted': 'User submitted',
  };

  return sourceTypeLabels[sourceType] || 'Manual review';
}

export function getTrustBadge(conference) {
  if (conference.reviewStatus === 'flagged') {
    return {
      label: 'Candidate / Needs Review',
      tone: 'candidate',
    };
  }

  if (conference.sourceType === 'official' && conference.reviewStatus === 'confirmed') {
    return {
      label: 'Verified Official Source',
      tone: 'confirmed',
    };
  }

  if (conference.sourceType === 'trusted-directory' && conference.reviewStatus !== 'flagged') {
    return {
      label: 'Trusted Directory Source',
      tone: 'info',
    };
  }

  return {
    label: 'Candidate / Needs Review',
    tone: 'candidate',
  };
}

export function getReviewStatusLabel(reviewStatus) {
  if (reviewStatus === 'confirmed') {
    return 'Confirmed';
  }

  if (reviewStatus === 'flagged') {
    return 'Flagged';
  }

  return 'Candidate';
}

export function getDeadlineUrgencyLabel(conference) {
  return conference.deadlineUrgencyLabel || 'Deadline TBD';
}

export function getConferenceFlags(conference) {
  return Array.isArray(conference.flags) ? conference.flags : [];
}

export function getAudienceIndicators(conference) {
  return Array.isArray(conference.audienceIndicators) ? conference.audienceIndicators : [];
}

export function getSubmissionIndicators(conference) {
  const indicators = [];

  if (conference.acceptsAbstracts) {
    indicators.push('Accepts abstracts');
  }

  if (conference.acceptsVideos) {
    indicators.push('Accepts videos');
  }

  if (conference.acceptsPosters) {
    indicators.push('Accepts posters');
  }

  if (conference.acceptsLateBreaking) {
    indicators.push('Late-breaking abstracts');
  }

  return indicators;
}
