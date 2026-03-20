const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const conferenceSourcesPath = path.join(rootDir, 'src', 'data', 'conferenceSources.json');
const conferencesOutputPath = path.join(rootDir, 'src', 'data', 'conferences.json');
const existingConferencesPath = conferencesOutputPath;
const lastUpdatedOutputPath = path.join(rootDir, 'src', 'data', 'lastUpdated.json');

const STANDARD_CATEGORIES = [
  'Breast & Melanoma Surgical Oncology',
  'Cardiothoracic Surgery',
  'Cardiovascular Surgery',
  'Colon and Rectal Surgery',
  'Endocrine Surgery',
  'Hepatobiliary and Pancreas Surgery',
  'Metabolic & Abdominal Wall Reconstructive Surgery',
  'Neurologic Surgery',
  'Obstetrics and Gynecology Surgery',
  'Oral and Maxillofacial Surgery',
  'Orthopedic Surgery',
  'Otolaryngology / Head and Neck Surgery',
  'Pediatric Surgery',
  'Plastic & Reconstructive Surgery',
  'Thoracic Surgery',
  'Trauma, Critical Care, and General Surgery',
  'Vascular Surgery',
];

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '');
}

function parseDateValue(value) {
  return isIsoDate(value) ? new Date(`${value}T00:00:00`) : null;
}

function formatSingleDate(value) {
  const parsedDate = parseDateValue(value);

  if (!parsedDate) {
    return value || 'TBD';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function formatDateRangeLabel(startDate, endDate) {
  if (!startDate && !endDate) {
    return 'TBD';
  }

  if (startDate === endDate || !endDate) {
    return formatSingleDate(startDate);
  }

  return `${formatSingleDate(startDate)} - ${formatSingleDate(endDate)}`;
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getRegionGroup(country) {
  if (country === 'United States') {
    return 'United States';
  }

  if (country === 'Canada') {
    return 'Canada';
  }

  return 'Other International';
}

function normalizeCategory(category) {
  if (category === 'Bariatric Surgery') {
    return 'Metabolic & Abdominal Wall Reconstructive Surgery';
  }

  if (
    category === 'Plastic Surgery' ||
    category === 'Aesthetic Surgery' ||
    category === 'Plastic & Reconstructive Surgery'
  ) {
    return 'Plastic & Reconstructive Surgery';
  }

  if (category === 'Otolaryngology / Head & Neck Surgery') {
    return 'Otolaryngology / Head and Neck Surgery';
  }

  if (category === 'Colon & Rectal Surgery') {
    return 'Colon and Rectal Surgery';
  }

  if (category === 'Hepatobiliary & Pancreas Surgery') {
    return 'Hepatobiliary and Pancreas Surgery';
  }

  return STANDARD_CATEGORIES.includes(category)
    ? category
    : 'Trauma, Critical Care, and General Surgery';
}

function inferSourceType(record) {
  if (record.sourceType) {
    return record.sourceType;
  }

  if (record.meetingUrl) {
    return 'official';
  }

  if (
    (record.source || '').includes('UPenn') ||
    (record.source || '').includes('Northwestern') ||
    (record.source || '').includes('CTSNet')
  ) {
    return 'trusted-directory';
  }

  if ((record.source || '').includes('SurgicalHub')) {
    return 'legacy';
  }

  return 'manual';
}

function inferConfidenceScore(sourceType) {
  const confidenceBySource = {
    official: 0.96,
    'trusted-directory': 0.84,
    aggregator: 0.68,
    legacy: 0.74,
    manual: 0.7,
    'user-submitted': 0.55,
  };

  return confidenceBySource[sourceType] ?? 0.7;
}

function buildLocationLabel(city, state, country) {
  return [city, state, country].filter((value) => value && value !== 'TBD').join(', ') || 'Location TBD';
}

function getSourceTrustLabel(sourceType, reviewStatus) {
  if (reviewStatus === 'flagged') {
    return 'Candidate / Needs Review';
  }

  if (sourceType === 'official' && reviewStatus === 'confirmed') {
    return 'Verified Official Source';
  }

  if (sourceType === 'trusted-directory' && reviewStatus !== 'flagged') {
    return 'Trusted Directory Source';
  }

  return 'Candidate / Needs Review';
}

function getDeadlineUrgency(abstractDeadlineSort) {
  if (!isIsoDate(abstractDeadlineSort)) {
    return {
      code: 'tbd',
      label: 'Deadline TBD',
    };
  }

  const today = parseDateValue(getTodayString());
  const deadline = parseDateValue(abstractDeadlineSort);
  const dayDifference = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (dayDifference < 0) {
    return {
      code: 'closed',
      label: 'Deadline closed',
    };
  }

  if (dayDifference <= 7) {
    return {
      code: 'closing-7-days',
      label: 'Deadline closing in 7 days',
    };
  }

  if (dayDifference <= 14) {
    return {
      code: 'closing-14-days',
      label: 'Deadline closing in 14 days',
    };
  }

  if (dayDifference <= 30) {
    return {
      code: 'closing-30-days',
      label: 'Deadline closing in 30 days',
    };
  }

  return {
    code: 'open',
    label: 'Open abstract deadline',
  };
}

function getSortDateValue(value) {
  const parsedDate = parseDateValue(value);
  return parsedDate ? parsedDate.getTime() : null;
}

function loadExistingRecords() {
  if (!fs.existsSync(existingConferencesPath)) {
    return [];
  }

  try {
    const existingRecords = JSON.parse(fs.readFileSync(existingConferencesPath, 'utf8'));
    return Array.isArray(existingRecords) ? existingRecords : [];
  } catch (error) {
    return [];
  }
}

function buildRecordSignature(record) {
  return [
    (record.organization || '').toLowerCase().trim(),
    (record.name || '').toLowerCase().replace(/\b20\d{2}\b/g, '').trim(),
    record.year || '',
  ].join('::');
}

function createComparableSnapshot(record) {
  return {
    name: record.name,
    organization: record.organization,
    categories: record.categories,
    tags: record.tags,
    startDate: record.startDate,
    endDate: record.endDate,
    dateLabel: record.dateLabel,
    city: record.city,
    state: record.state,
    country: record.country,
    regionGroup: record.regionGroup,
    locationLabel: record.locationLabel,
    format: record.format,
    abstractDeadline: record.abstractDeadline,
    abstractDeadlineSort: record.abstractDeadlineSort,
    meetingUrl: record.meetingUrl,
    sourceUrl: record.sourceUrl,
    sourceType: record.sourceType,
    confidenceScore: record.confidenceScore,
    reviewStatus: record.reviewStatus,
    venue: record.venue,
    venueAddress: record.venueAddress,
    notes: record.notes,
    featured: record.featured,
    cme: record.cme,
    sessions: record.sessions,
    sourceLabel: record.sourceLabel,
    journalAssociation: record.journalAssociation,
    abstractTypes: record.abstractTypes,
    residentPaperCompetition: record.residentPaperCompetition,
    travelScholarshipNotes: record.travelScholarshipNotes,
    membershipRelevance: record.membershipRelevance,
    acceptsAbstracts: record.acceptsAbstracts,
    acceptsVideos: record.acceptsVideos,
    acceptsPosters: record.acceptsPosters,
    acceptsLateBreaking: record.acceptsLateBreaking,
    moderationStatus: record.moderationStatus,
  };
}

function getAudienceIndicators(record, normalizedCategories) {
  const indicators = [];

  if ((record.tags || []).includes('resident-friendly')) {
    indicators.push('Good for residents/fellows');
  }

  if ((record.tags || []).includes('regional')) {
    indicators.push('Regional meeting');
  }

  if (normalizedCategories.length > 1 || normalizedCategories.includes('Trauma, Critical Care, and General Surgery')) {
    indicators.push('Broad meeting');
  } else {
    indicators.push('Subspecialty meeting');
  }

  if (record.country && record.country !== 'United States') {
    indicators.push('International travel required');
  }

  if (record.format === 'Virtual' || record.format === 'Hybrid') {
    indicators.push('Virtual attendance available');
  }

  return [...new Set(indicators)];
}

function buildRecurringSeriesKey(record) {
  if (record.seriesId) {
    return record.seriesId;
  }

  return `${record.organization || ''}`
    .toLowerCase()
    .replace(/\bthe\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getLikelyMonth(records) {
  const monthCounts = new Map();

  records.forEach((record) => {
    if (!record.startDate) {
      return;
    }

    const month = Number(record.startDate.slice(5, 7));
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
  });

  const topMonth = [...monthCounts.entries()].sort((firstEntry, secondEntry) => secondEntry[1] - firstEntry[1])[0];

  if (!topMonth) {
    return null;
  }

  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(`2026-${String(topMonth[0]).padStart(2, '0')}-01T00:00:00`));
}

function buildRecurringMetadata(record, recordsBySeriesKey) {
  const seriesRecords = recordsBySeriesKey.get(record.recurringSeriesKey) || [];
  const confirmedSeriesRecords = seriesRecords.filter((item) => item.reviewStatus === 'confirmed');
  const pastYears = [...new Set(seriesRecords.map((item) => item.year).filter(Boolean))].sort((firstYear, secondYear) => firstYear - secondYear);
  const isLikelyRecurring = seriesRecords.length >= 2 || Boolean(record.likelyRecurringMeeting);

  return {
    seriesKey: record.recurringSeriesKey,
    isLikelyRecurring,
    knownYears: pastYears,
    likelyMonth: getLikelyMonth(seriesRecords),
    futureCycleStatus:
      record.isInferred && isLikelyRecurring
        ? 'Future cycle not yet officially confirmed'
        : record.reviewStatus === 'confirmed'
          ? 'Confirmed official record'
          : isLikelyRecurring
            ? 'Future cycle not yet officially confirmed'
            : 'Insufficient history to infer cycle',
    inferred: Boolean(record.isInferred),
    confirmedCount: confirmedSeriesRecords.length,
  };
}

function buildFlags(record, recurringMetadata, deadlineUrgency) {
  const flags = Array.isArray(record.flags) ? [...record.flags] : [];

  if (record.firstSeenAt && getSortDateValue(record.firstSeenAt) >= getSortDateValue('2026-02-01')) {
    flags.push('newly added');
  }

  if (record.lastUpdatedAt && getSortDateValue(record.lastUpdatedAt) >= getSortDateValue('2026-02-01')) {
    flags.push('recently updated');
  }

  if (record.dateChangedRecently) {
    flags.push('date changed recently');
  }

  if (deadlineUrgency.code === 'tbd') {
    flags.push('deadline unconfirmed');
  }

  if (recurringMetadata.isLikelyRecurring) {
    flags.push('likely recurring meeting');
  }

  if ((record.tags || []).includes('resident-friendly')) {
    flags.push('resident-friendly');
  }

  if ((record.tags || []).includes('regional')) {
    flags.push('regional meeting');
  }

  return [...new Set(flags)];
}

function normalizeConference(sourceConference) {
  const normalizedCategories = [...new Set((sourceConference.categories || []).map(normalizeCategory))];
  const today = parseDateValue(getTodayString());
  const startDate = sourceConference.startDate || null;
  const endDate = sourceConference.endDate || sourceConference.startDate || null;
  const parsedEndDate = parseDateValue(endDate || startDate);
  const abstractDeadlineSort = isIsoDate(sourceConference.abstractDeadline)
    ? sourceConference.abstractDeadline
    : null;
  const sourceType = inferSourceType(sourceConference);
  const confidenceScore = Number.isFinite(sourceConference.confidenceScore)
    ? sourceConference.confidenceScore
    : inferConfidenceScore(sourceType);
  const reviewStatus =
    sourceConference.reviewStatus ||
    (confidenceScore >= 0.85 ? 'confirmed' : confidenceScore >= 0.65 ? 'candidate' : 'flagged');
  const city = sourceConference.city || 'TBD';
  const state = sourceConference.state || '';
  const country = sourceConference.country || 'TBD';
  const regionGroup = sourceConference.regionGroup || getRegionGroup(country);
  const deadlineUrgency = getDeadlineUrgency(abstractDeadlineSort);

  return {
    id: sourceConference.id,
    name: sourceConference.name,
    organization: sourceConference.organization,
    categories: normalizedCategories.length
      ? normalizedCategories
      : ['Trauma, Critical Care, and General Surgery'],
    tags: [...new Set(sourceConference.tags || [])],
    startDate,
    endDate,
    dateLabel: sourceConference.dateLabel || formatDateRangeLabel(startDate, endDate),
    year: Number.isFinite(sourceConference.year)
      ? sourceConference.year
      : parseDateValue(startDate)?.getUTCFullYear() ?? null,
    city,
    state,
    country,
    regionGroup,
    locationLabel: sourceConference.locationLabel || buildLocationLabel(city, state, country),
    format: sourceConference.format || 'TBD',
    abstractDeadline: sourceConference.abstractDeadline || 'TBD',
    abstractDeadlineSort,
    deadlineUrgency: deadlineUrgency.code,
    deadlineUrgencyLabel: deadlineUrgency.label,
    meetingUrl: sourceConference.meetingUrl || '',
    sourceUrl: sourceConference.sourceUrl || sourceConference.meetingUrl || '',
    sourceType,
    sourceTrustLabel: getSourceTrustLabel(sourceType, reviewStatus),
    confidenceScore,
    reviewStatus,
    verifiedAt: sourceConference.verifiedAt || (reviewStatus === 'confirmed' ? (sourceConference.lastChecked || getTodayString()) : null),
    lastChecked: sourceConference.lastChecked || getTodayString(),
    venue: sourceConference.venue || '',
    venueAddress: sourceConference.venueAddress || '',
    notes: sourceConference.notes || '',
    featured: Boolean(sourceConference.featured),
    cme: Number.isFinite(sourceConference.cme)
      ? sourceConference.cme
      : Number.isFinite(sourceConference.cmeCredits)
        ? sourceConference.cmeCredits
        : null,
    sessions: Array.isArray(sourceConference.sessions)
      ? sourceConference.sessions
      : Array.isArray(sourceConference.sessionHighlights)
        ? sourceConference.sessionHighlights
        : [],
    issueReported: false,
    sourceLabel: sourceConference.source || 'Maintained SurgCon source list',
    isPast: parsedEndDate ? parsedEndDate < today : false,
    firstSeenAt: sourceConference.firstSeenAt || sourceConference.addedAt || null,
    lastSeenAt: sourceConference.lastSeenAt || null,
    lastUpdatedAt: sourceConference.lastUpdatedAt || sourceConference.updatedAt || null,
    sortUpdatedAt:
      sourceConference.lastUpdatedAt ||
      sourceConference.updatedAt ||
      sourceConference.firstSeenAt ||
      sourceConference.addedAt ||
      sourceConference.lastChecked ||
      getTodayString(),
    flags: Array.isArray(sourceConference.flags) ? sourceConference.flags : [],
    dateChangedRecently: Boolean(sourceConference.dateChangedRecently),
    likelyRecurringMeeting: Boolean(sourceConference.likelyRecurringMeeting),
    isInferred: Boolean(sourceConference.isInferred),
    journalAssociation: sourceConference.journalAssociation || '',
    abstractTypes: Array.isArray(sourceConference.abstractTypes) ? sourceConference.abstractTypes : [],
    residentPaperCompetition: sourceConference.residentPaperCompetition || '',
    travelScholarshipNotes: sourceConference.travelScholarshipNotes || '',
    membershipRelevance: sourceConference.membershipRelevance || '',
    acceptsAbstracts:
      typeof sourceConference.acceptsAbstracts === 'boolean'
        ? sourceConference.acceptsAbstracts
        : Boolean(sourceConference.abstractDeadline),
    acceptsVideos: Boolean(sourceConference.acceptsVideos),
    acceptsPosters: Boolean(sourceConference.acceptsPosters),
    acceptsLateBreaking: Boolean(sourceConference.acceptsLateBreaking),
    moderationStatus: sourceConference.moderationStatus || 'approved',
    recurringSeriesKey: buildRecurringSeriesKey(sourceConference),
    audienceIndicators: getAudienceIndicators(sourceConference, normalizedCategories),
  };
}

function mergeConferenceRecords(records) {
  const recordMap = new Map();

  records.forEach((record) => {
    const existingRecord = recordMap.get(record.id);

    if (!existingRecord) {
      recordMap.set(record.id, record);
      return;
    }

    recordMap.set(record.id, {
      ...existingRecord,
      ...record,
      categories: [...new Set([...existingRecord.categories, ...record.categories])],
      tags: [...new Set([...existingRecord.tags, ...record.tags])],
      sessions: [...new Set([...(existingRecord.sessions || []), ...(record.sessions || [])])],
      abstractTypes: [...new Set([...(existingRecord.abstractTypes || []), ...(record.abstractTypes || [])])],
      confidenceScore: Math.max(existingRecord.confidenceScore, record.confidenceScore),
      reviewStatus:
        existingRecord.reviewStatus === 'flagged' || record.reviewStatus === 'flagged'
          ? 'flagged'
          : existingRecord.reviewStatus === 'candidate' || record.reviewStatus === 'candidate'
            ? 'candidate'
            : 'confirmed',
    });
  });

  return [...recordMap.values()];
}

function mergeWithExistingMaster(existingRecords, discoveredRecords) {
  const today = getTodayString();
  const existingById = new Map(existingRecords.map((record) => [record.id, record]));
  const existingBySignature = new Map(existingRecords.map((record) => [buildRecordSignature(record), record]));
  const mergedRecords = [];
  const seenIds = new Set();

  discoveredRecords.forEach((record) => {
    const existingRecord = existingById.get(record.id) || existingBySignature.get(buildRecordSignature(record));
    const comparableRecord = createComparableSnapshot(record);
    const comparableExisting = existingRecord ? createComparableSnapshot(existingRecord) : null;
    const hasMeaningfulChange =
      !existingRecord || JSON.stringify(comparableRecord) !== JSON.stringify(comparableExisting);

    const mergedRecord = {
      ...(existingRecord || {}),
      ...record,
      firstSeenAt: existingRecord?.firstSeenAt || record.firstSeenAt || today,
      lastSeenAt: today,
      lastUpdatedAt:
        record.lastUpdatedAt ||
        (hasMeaningfulChange ? today : existingRecord?.lastUpdatedAt || existingRecord?.firstSeenAt || today),
      sortUpdatedAt:
        record.lastUpdatedAt ||
        (hasMeaningfulChange ? today : existingRecord?.lastUpdatedAt || existingRecord?.firstSeenAt || today),
    };

    mergedRecords.push(mergedRecord);
    seenIds.add(mergedRecord.id);
  });

  existingRecords
    .filter((record) => !seenIds.has(record.id) && (record.year ?? 0) >= 2024)
    .forEach((record) => {
      mergedRecords.push({
        ...record,
        lastSeenAt: record.lastSeenAt || record.lastChecked || today,
        sortUpdatedAt: record.lastUpdatedAt || record.lastSeenAt || record.firstSeenAt || today,
      });
    });

  return mergedRecords;
}

const sourceRecords = JSON.parse(fs.readFileSync(conferenceSourcesPath, 'utf8'));
const existingRecords = loadExistingRecords();
const mergedRecords = mergeWithExistingMaster(
  existingRecords,
  mergeConferenceRecords(sourceRecords.map(normalizeConference))
).filter(
  (conference) => (conference.year ?? 0) >= 2024
);

const recordsBySeriesKey = new Map();
mergedRecords.forEach((record) => {
  const currentRecords = recordsBySeriesKey.get(record.recurringSeriesKey) || [];
  recordsBySeriesKey.set(record.recurringSeriesKey, [...currentRecords, record]);
});

const normalizedRecords = mergedRecords
  .map((record) => {
    const recurring = buildRecurringMetadata(record, recordsBySeriesKey);
    const deadlineUrgency = getDeadlineUrgency(record.abstractDeadlineSort);
    const flags = buildFlags(record, recurring, deadlineUrgency);

    return {
      ...record,
      recurring,
      flags,
    };
  })
  .sort((firstConference, secondConference) => {
    if (firstConference.isPast !== secondConference.isPast) {
      return firstConference.isPast ? 1 : -1;
    }

    if (firstConference.isPast === secondConference.isPast && firstConference.featured !== secondConference.featured) {
      return firstConference.featured ? -1 : 1;
    }

    if (firstConference.startDate === secondConference.startDate) {
      return firstConference.name.localeCompare(secondConference.name);
    }

    if (!isIsoDate(firstConference.startDate)) {
      return 1;
    }

    if (!isIsoDate(secondConference.startDate)) {
      return -1;
    }

    if (firstConference.isPast) {
      return secondConference.startDate.localeCompare(firstConference.startDate);
    }

    return firstConference.startDate.localeCompare(secondConference.startDate);
  });

const lastUpdatedPayload = {
  lastUpdated: new Date().toISOString(),
  sourceRecordCount: sourceRecords.length,
  normalizedRecordCount: normalizedRecords.length,
  supportedYears: '2024 onward',
  workflow: 'Edit src/data/conferenceSources.json or run the Python review pipeline, then run npm run refresh-data.',
  masterDatasetStrategy: 'Additive merge against the existing published dataset from 2024 onward.',
  reviewSummary: {
    confirmed: normalizedRecords.filter((conference) => conference.reviewStatus === 'confirmed').length,
    candidate: normalizedRecords.filter((conference) => conference.reviewStatus === 'candidate').length,
    flagged: normalizedRecords.filter((conference) => conference.reviewStatus === 'flagged').length,
  },
  sourceSummary: {
    official: normalizedRecords.filter((conference) => conference.sourceType === 'official').length,
    trustedDirectory: normalizedRecords.filter((conference) => conference.sourceType === 'trusted-directory').length,
    aggregator: normalizedRecords.filter((conference) => conference.sourceType === 'aggregator').length,
    legacy: normalizedRecords.filter((conference) => conference.sourceType === 'legacy').length,
    manual: normalizedRecords.filter((conference) => conference.sourceType === 'manual').length,
    userSubmitted: normalizedRecords.filter((conference) => conference.sourceType === 'user-submitted').length,
  },
  preservedHistoricalRecordCount: normalizedRecords.filter((conference) => conference.year && conference.year <= 2025).length,
};

fs.writeFileSync(conferencesOutputPath, `${JSON.stringify(normalizedRecords, null, 2)}\n`);
fs.writeFileSync(lastUpdatedOutputPath, `${JSON.stringify(lastUpdatedPayload, null, 2)}\n`);

console.log(`Generated ${normalizedRecords.length} conference records.`);
