export function isLikelyUrl(value) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

function humanizePathSegment(segment) {
  return segment
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function buildConferencePrefillFromUrl(urlValue) {
  if (!isLikelyUrl(urlValue)) {
    return null;
  }

  const parsedUrl = new URL(urlValue);
  const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
  const finalSegment = pathSegments[pathSegments.length - 1] || parsedUrl.hostname.replace('www.', '');
  const suggestedName = humanizePathSegment(finalSegment);
  const organization = parsedUrl.hostname.replace('www.', '');

  return {
    meetingUrl: urlValue,
    sourceUrl: urlValue,
    sourceType: 'manual',
    name: suggestedName,
    organization,
    source: `Manual URL import: ${parsedUrl.hostname}`,
    notes:
      'Frontend-only import can validate the URL and suggest a title, but it cannot scrape full conference details automatically.',
  };
}
