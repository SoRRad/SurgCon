export const BOOKMARK_STORAGE_KEY = 'surgcon-bookmarks';
export const NOTIFICATION_STORAGE_KEY = 'surgcon-notification-preferences';
export const ISSUE_STORAGE_KEY = 'surgcon-reported-issues';
export const SUBMISSION_STORAGE_KEY = 'surgcon-submitted-conferences';
export const COMPARE_STORAGE_KEY = 'surgcon-compare-conferences';
export const REMINDER_LEAD_TIMES = ['1 week', '2 weeks', '1 month', '2 months', '3 months'];

export const defaultNotificationPreferences = {
  email: '',
  notifyBookmarkedOnly: true,
  selectedCategories: [],
  selectedConferenceIds: [],
  selectedFilteredResults: [],
  leadTimes: ['1 month'],
};

function loadJsonValue(storageKey, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

function saveJsonValue(storageKey, value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

export function loadBookmarks() {
  const savedBookmarks = loadJsonValue(BOOKMARK_STORAGE_KEY, []);
  return Array.isArray(savedBookmarks) ? savedBookmarks : [];
}

export function saveBookmarks(bookmarkIds) {
  saveJsonValue(BOOKMARK_STORAGE_KEY, bookmarkIds);
}

export function loadReportedIssues() {
  const savedIssues = loadJsonValue(ISSUE_STORAGE_KEY, []);
  return Array.isArray(savedIssues) ? savedIssues : [];
}

export function saveReportedIssues(issueIds) {
  saveJsonValue(ISSUE_STORAGE_KEY, issueIds);
}

export function loadSubmittedConferences() {
  const submittedConferences = loadJsonValue(SUBMISSION_STORAGE_KEY, []);
  return Array.isArray(submittedConferences) ? submittedConferences : [];
}

export function saveSubmittedConferences(submissions) {
  saveJsonValue(SUBMISSION_STORAGE_KEY, submissions);
}

export function loadComparedConferences() {
  const comparedConferenceIds = loadJsonValue(COMPARE_STORAGE_KEY, []);
  return Array.isArray(comparedConferenceIds) ? comparedConferenceIds.slice(0, 4) : [];
}

export function saveComparedConferences(comparedConferenceIds) {
  saveJsonValue(COMPARE_STORAGE_KEY, comparedConferenceIds.slice(0, 4));
}

export function loadNotificationPreferences() {
  const savedPreferences = loadJsonValue(NOTIFICATION_STORAGE_KEY, defaultNotificationPreferences);

  return {
    ...defaultNotificationPreferences,
    ...savedPreferences,
    selectedCategories: Array.isArray(savedPreferences.selectedCategories)
      ? savedPreferences.selectedCategories
      : [],
    selectedConferenceIds: Array.isArray(savedPreferences.selectedConferenceIds)
      ? savedPreferences.selectedConferenceIds
      : [],
    selectedFilteredResults: Array.isArray(savedPreferences.selectedFilteredResults)
      ? savedPreferences.selectedFilteredResults
      : [],
    leadTimes: Array.isArray(savedPreferences.leadTimes) ? savedPreferences.leadTimes : ['1 month'],
  };
}

export function saveNotificationPreferences(preferences) {
  saveJsonValue(NOTIFICATION_STORAGE_KEY, preferences);
}
