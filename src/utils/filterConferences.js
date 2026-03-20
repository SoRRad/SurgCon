import {
  compareConferences,
  getConferenceDateSortValue,
  getDeadlineStatus,
  getSortDateValue,
} from './dateHelpers';
import { STANDARD_CATEGORIES } from './normalizeConferenceData';
import { getConferenceSearchScore, matchesSearchHints } from './searchHelpers';

export const DEFAULT_FILTERS = {
  specialty: 'All',
  viewMode: 'upcoming',
  year: 'All',
  regionGroup: 'All',
  locationValue: 'All',
  city: 'All',
  format: 'All',
  tag: 'All',
  deadlineStatus: 'All',
  trustLabel: 'All',
  quickFilter: 'all',
  sortBy: 'soonest-deadline',
  bookmarkedOnly: false,
  search: '',
};

function matchesLocation(conference, filters) {
  if (filters.regionGroup === 'All') {
    return true;
  }

  if (conference.regionGroup !== filters.regionGroup) {
    return false;
  }

  if (filters.locationValue === 'All') {
    return true;
  }

  if (filters.regionGroup === 'United States' || filters.regionGroup === 'Canada') {
    return conference.state === filters.locationValue;
  }

  return conference.country === filters.locationValue;
}

function matchesViewMode(conference, filters) {
  if (filters.viewMode === 'all') {
    return true;
  }

  if (filters.viewMode === 'past') {
    return conference.isPast;
  }

  return !conference.isPast;
}

function matchesTrust(conference, filters) {
  return filters.trustLabel === 'All' ? true : conference.sourceTrustLabel === filters.trustLabel;
}

function matchesQuickFilter(conference, filters) {
  if (filters.quickFilter === 'all') {
    return true;
  }

  if (filters.quickFilter === 'deadlines-closing-soon') {
    return ['closing-7-days', 'closing-14-days', 'closing-30-days'].includes(conference.deadlineUrgency);
  }

  if (filters.quickFilter === 'newly-added') {
    return (conference.flags || []).includes('newly added');
  }

  if (filters.quickFilter === 'recently-updated') {
    return (conference.flags || []).includes('recently updated');
  }

  if (filters.quickFilter === 'open-deadlines') {
    return conference.deadlineUrgency !== 'closed' && conference.deadlineUrgency !== 'tbd';
  }

  if (filters.quickFilter === 'tbd-deadlines') {
    return conference.deadlineUrgency === 'tbd';
  }

  return true;
}

function getDeadlinePriority(conference) {
  const deadlineStatus = getDeadlineStatus(conference.abstractDeadlineSort);
  const deadlineValue = getSortDateValue(conference.abstractDeadlineSort);
  const meetingValue = getConferenceDateSortValue(conference);

  if (deadlineStatus === 'Open' && deadlineValue !== null) {
    return 0;
  }

  if (!conference.isPast && meetingValue !== null && deadlineStatus !== 'Closed') {
    return 1;
  }

  if (!conference.isPast && meetingValue !== null) {
    return 2;
  }

  if (deadlineStatus === 'TBD') {
    return conference.isPast ? 4 : 3;
  }

  return conference.isPast ? 5 : 3;
}

function sortConferences(firstConference, secondConference, sortBy) {
  if (sortBy === 'soonest-deadline') {
    const firstDeadline = getSortDateValue(firstConference.abstractDeadlineSort);
    const secondDeadline = getSortDateValue(secondConference.abstractDeadlineSort);
    const firstPriority = getDeadlinePriority(firstConference);
    const secondPriority = getDeadlinePriority(secondConference);

    if (firstPriority !== secondPriority) {
      return firstPriority - secondPriority;
    }

    if (firstPriority === 0 && firstDeadline !== null && secondDeadline !== null && firstDeadline !== secondDeadline) {
      return firstDeadline - secondDeadline;
    }

    if (firstPriority === 1 || firstPriority === 2) {
      const firstMeeting = getConferenceDateSortValue(firstConference);
      const secondMeeting = getConferenceDateSortValue(secondConference);

      if (firstMeeting !== null && secondMeeting !== null && firstMeeting !== secondMeeting) {
        return firstMeeting - secondMeeting;
      }
    }

    if (firstDeadline !== null && secondDeadline === null) {
      return -1;
    }

    if (firstDeadline === null && secondDeadline !== null) {
      return 1;
    }

    return compareConferences(firstConference, secondConference);
  }

  if (sortBy === 'recently-updated') {
    const firstUpdated = getSortDateValue(firstConference.sortUpdatedAt || firstConference.lastUpdatedAt || firstConference.updatedAt);
    const secondUpdated = getSortDateValue(secondConference.sortUpdatedAt || secondConference.lastUpdatedAt || secondConference.updatedAt);

    if (firstUpdated !== null && secondUpdated !== null && firstUpdated !== secondUpdated) {
      return secondUpdated - firstUpdated;
    }
  }

  if (sortBy === 'newest-added') {
    const firstAdded = getSortDateValue(firstConference.firstSeenAt || firstConference.addedAt);
    const secondAdded = getSortDateValue(secondConference.firstSeenAt || secondConference.addedAt);

    if (firstAdded !== null && secondAdded !== null && firstAdded !== secondAdded) {
      return secondAdded - firstAdded;
    }
  }

  if (sortBy === 'upcoming-date') {
    const firstStart = getConferenceDateSortValue(firstConference);
    const secondStart = getConferenceDateSortValue(secondConference);

    if (firstStart !== null && secondStart !== null && firstStart !== secondStart) {
      return firstConference.isPast ? secondStart - firstStart : firstStart - secondStart;
    }
  }

  return compareConferences(firstConference, secondConference);
}

export function filterConferences(conferences, filters) {
  return conferences
    .filter((conference) => (conference.year ?? 0) >= 2024)
    .filter((conference) => matchesViewMode(conference, filters))
    .filter((conference) => (filters.specialty === 'All' ? true : conference.categories.includes(filters.specialty)))
    .filter((conference) => (filters.year === 'All' ? true : String(conference.year) === String(filters.year)))
    .filter((conference) => matchesLocation(conference, filters))
    .filter((conference) => (filters.city === 'All' ? true : conference.city === filters.city))
    .filter((conference) => (filters.format === 'All' ? true : conference.format === filters.format))
    .filter((conference) => (filters.tag === 'All' ? true : conference.tags.includes(filters.tag)))
    .filter((conference) => matchesTrust(conference, filters))
    .filter((conference) => matchesQuickFilter(conference, filters))
    .filter((conference) =>
      filters.deadlineStatus === 'All'
        ? true
        : getDeadlineStatus(conference.abstractDeadlineSort) === filters.deadlineStatus
    )
    .filter((conference) => (filters.bookmarkedOnly ? conference.isBookmarked : true))
    .filter((conference) => matchesSearchHints(conference, filters.search))
    .map((conference) => ({
      conference,
      searchScore: getConferenceSearchScore(conference, filters.search),
    }))
    .filter(({ conference, searchScore }) => (!filters.search.trim() ? true : searchScore > 0))
    .sort((firstItem, secondItem) => {
      if (filters.search.trim() && firstItem.searchScore !== secondItem.searchScore) {
        return secondItem.searchScore - firstItem.searchScore;
      }

      return sortConferences(firstItem.conference, secondItem.conference, filters.sortBy);
    })
    .map(({ conference }) => conference);
}

function uniqueSorted(values) {
  return [...new Set(values.filter((value) => value && value !== 'TBD'))].sort((firstValue, secondValue) => {
    if (/^\d+$/.test(firstValue) && /^\d+$/.test(secondValue)) {
      return Number(firstValue) - Number(secondValue);
    }

    return firstValue.localeCompare(secondValue);
  });
}

export function getLocationOptions(conferences, regionGroup) {
  if (regionGroup === 'United States' || regionGroup === 'Canada') {
    return uniqueSorted(
      conferences
        .filter((conference) => conference.regionGroup === regionGroup)
        .map((conference) => conference.state)
    );
  }

  if (regionGroup === 'Other International') {
    return uniqueSorted(
      conferences
        .filter((conference) => conference.regionGroup === regionGroup)
        .map((conference) => conference.country)
    );
  }

  return [];
}

export function getFilterOptions(conferences, filters) {
  const locationScopedConferences =
    filters.regionGroup === 'All'
      ? conferences
      : conferences.filter((conference) => conference.regionGroup === filters.regionGroup);

  return {
    specialties: STANDARD_CATEGORIES,
    years: uniqueSorted(conferences.map((conference) => String(conference.year))),
    regionGroups: ['United States', 'Canada', 'Other International'],
    locationOptions: getLocationOptions(conferences, filters.regionGroup),
    cities: uniqueSorted(locationScopedConferences.map((conference) => conference.city)),
    formats: ['In-Person', 'Virtual', 'Hybrid', 'TBD'],
    tags: uniqueSorted(conferences.flatMap((conference) => conference.tags)),
    deadlineStatuses: ['Open', 'Closed', 'TBD'],
    trustLabels: uniqueSorted(conferences.map((conference) => conference.sourceTrustLabel)),
    quickFilters: [
      { value: 'all', label: 'All conferences' },
      { value: 'deadlines-closing-soon', label: 'Deadlines closing soon' },
      { value: 'newly-added', label: 'Newly added' },
      { value: 'recently-updated', label: 'Recently updated' },
      { value: 'open-deadlines', label: 'Open abstract deadlines' },
      { value: 'tbd-deadlines', label: 'TBD deadlines' },
    ],
    sortOptions: [
      { value: 'soonest-deadline', label: 'Most relevant deadline' },
      { value: 'upcoming-date', label: 'Upcoming conference date' },
      { value: 'recently-updated', label: 'Recently updated' },
      { value: 'newest-added', label: 'Newest added' },
    ],
  };
}

export function getLocationFilterLabel(regionGroup) {
  if (regionGroup === 'United States') {
    return 'State';
  }

  if (regionGroup === 'Canada') {
    return 'Province';
  }

  if (regionGroup === 'Other International') {
    return 'Country';
  }

  return 'State / Province / Country';
}
