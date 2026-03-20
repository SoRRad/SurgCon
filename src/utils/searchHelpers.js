const SEARCH_SYNONYMS = {
  colorectal: ['colon', 'rectal', 'bowel', 'ascrs'],
  hernia: ['abdominal wall', 'reconstructive', 'ahs'],
  bariatric: ['metabolic', 'obesity', 'asmbs'],
  cardiac: ['cardiothoracic', 'heart', 'sts', 'cardiovascular'],
  thoracic: ['cardiothoracic', 'lung', 'chest'],
  vascular: ['endovascular', 'aorta', 'carotid', 'venous'],
  hpb: ['hepatobiliary', 'pancreas', 'liver', 'ahpba', 'ihpba'],
  liver: ['hepatobiliary', 'transplant', 'hpb'],
  trauma: ['critical care', 'acute care', 'emergency surgery', 'east', 'aast'],
  endocrine: ['thyroid', 'parathyroid', 'adrenal', 'aaes'],
  plastic: ['reconstructive', 'microsurgery', 'aesthetic', 'asps'],
  orthopedic: ['orthopaedic', 'aaos', 'joint', 'sports'],
  neurosurgery: ['neurologic', 'brain', 'spine', 'aans'],
  pediatric: ['children', 'pediatric surgery', 'paps', 'apsa'],
  ent: ['otolaryngology', 'head neck', 'oto', 'aao-hns'],
  maxillofacial: ['oral', 'jaw', 'face', 'aaoms'],
  obgyn: ['gynecology', 'gynecologic', 'pelvic', 'acog'],
  oncology: ['cancer', 'melanoma', 'breast', 'tumor'],
  robotics: ['robotic', 'minimally invasive', 'laparoscopic'],
  residents: ['resident-friendly', 'fellows', 'education', 'training'],
  international: ['global', 'world congress', 'international'],
  official: ['verified official source', 'official source'],
  trusted: ['trusted directory source', 'directory source'],
  regional: ['regional meeting', 'western', 'eastern', 'southern', 'midwestern'],
};

const SEASON_MONTHS = {
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  fall: [9, 10, 11],
  autumn: [9, 10, 11],
  winter: [12, 1, 2],
  early: [1, 2, 3, 4],
};

export function expandSearchTerms(query) {
  const rawTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const expandedTerms = new Set(rawTerms);

  rawTerms.forEach((term) => {
    Object.entries(SEARCH_SYNONYMS).forEach(([key, synonyms]) => {
      if (key.includes(term) || term.includes(key) || synonyms.some((synonym) => synonym.includes(term))) {
        expandedTerms.add(key);
        synonyms.forEach((synonym) => expandedTerms.add(synonym));
      }
    });
  });

  return [...expandedTerms];
}

function parseQueryYear(query) {
  const match = query.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : null;
}

function parseQuerySeason(query) {
  const lower = query.toLowerCase();
  return Object.keys(SEASON_MONTHS).find((season) => lower.includes(season)) || null;
}

export function deriveSearchHints(query) {
  const lower = query.toLowerCase();

  return {
    year: parseQueryYear(lower),
    season: parseQuerySeason(lower),
    regionGroup:
      lower.includes('united states') || /\bus\b/.test(lower) || /\bu\.s\.\b/.test(lower)
        ? 'United States'
        : lower.includes('canada')
          ? 'Canada'
          : lower.includes('international')
            ? 'Other International'
            : null,
    openDeadlineOnly:
      lower.includes('open abstract') || lower.includes('open deadline') || lower.includes('open abstracts'),
    tbdDeadlineOnly: lower.includes('tbd deadline') || lower.includes('deadline tbd'),
    regionalOnly: lower.includes('regional'),
    virtualOnly: lower.includes('virtual'),
  };
}

export function matchesSearchHints(conference, query) {
  const hints = deriveSearchHints(query);

  if (hints.year && conference.year !== hints.year) {
    return false;
  }

  if (hints.regionGroup && conference.regionGroup !== hints.regionGroup) {
    return false;
  }

  if (hints.openDeadlineOnly && conference.deadlineUrgency !== 'open') {
    return false;
  }

  if (hints.tbdDeadlineOnly && conference.deadlineUrgency !== 'tbd') {
    return false;
  }

  if (hints.regionalOnly && !(conference.flags || []).includes('regional meeting')) {
    return false;
  }

  if (hints.virtualOnly && conference.format !== 'Virtual' && conference.format !== 'Hybrid') {
    return false;
  }

  if (hints.season && conference.startDate) {
    const month = Number(conference.startDate.slice(5, 7));
    if (!SEASON_MONTHS[hints.season].includes(month)) {
      return false;
    }
  }

  return true;
}

export function getConferenceSearchScore(conference, searchQuery) {
  if (!searchQuery.trim()) {
    return 0;
  }

  const terms = expandSearchTerms(searchQuery);
  const searchableFields = [
    { value: conference.name, weight: 10 },
    { value: conference.organization, weight: 7 },
    { value: conference.categories.join(' '), weight: 9 },
    { value: conference.tags.join(' '), weight: 8 },
    { value: conference.notes, weight: 4 },
    { value: conference.city, weight: 3 },
    { value: conference.state, weight: 3 },
    { value: conference.country, weight: 3 },
    { value: conference.locationLabel || '', weight: 4 },
    { value: conference.venue || '', weight: 5 },
    { value: conference.venueAddress || '', weight: 2 },
    { value: conference.sessions?.join(' ') || '', weight: 4 },
    { value: conference.sourceLabel || '', weight: 1 },
    { value: conference.sourceTrustLabel || '', weight: 5 },
    { value: conference.flags?.join(' ') || '', weight: 5 },
    { value: conference.audienceIndicators?.join(' ') || '', weight: 4 },
    { value: conference.journalAssociation || '', weight: 3 },
    { value: conference.abstractTypes?.join(' ') || '', weight: 4 },
    { value: conference.membershipRelevance || '', weight: 3 },
  ];

  return terms.reduce((score, term) => {
    return (
      score +
      searchableFields.reduce((fieldScore, field) => {
        return field.value.toLowerCase().includes(term) ? fieldScore + field.weight : fieldScore;
      }, 0)
    );
  }, 0);
}
