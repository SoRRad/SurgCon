# SurgCon

SurgCon is a surgical conference intelligence platform built in React for GitHub Pages deployment. It maintains a master surgery conference dataset from 2024 onward, keeps past and upcoming meetings together through an additive repo-based update workflow, and combines source trust signals, recurring-meeting intelligence, compare workflows, CSV and ICS exports, local reminder preferences, lightweight issue reporting, specialty hubs, and maintainable data transparency.

## What SurgCon Covers

- A master conference dataset from 2024 onward
- Default directory behavior that includes all meetings, with upcoming meetings sorted first
- Historical coverage from 2024 onward for recurring-pattern inference
- Major meetings, regional meetings, and selected international congresses
- Specialty coverage across:
  - Plastic & Reconstructive Surgery
  - Metabolic & Abdominal Wall Reconstructive Surgery
  - Cardiothoracic Surgery
  - Cardiovascular Surgery
  - Thoracic Surgery
  - Vascular Surgery
  - Trauma, Critical Care, and General Surgery
  - Endocrine Surgery
  - Hepatobiliary and Pancreas Surgery
  - Colon and Rectal Surgery
  - Breast & Melanoma Surgical Oncology
  - Pediatric Surgery
  - Neurologic Surgery
  - Orthopedic Surgery
  - Oral and Maxillofacial Surgery
  - Otolaryngology / Head and Neck Surgery
  - Obstetrics and Gynecology Surgery

## Product Features

- HashRouter navigation for GitHub Pages compatibility
- Premium, editorial-style UI with improved spacing, cards, filters, exports, compare workflows, and specialty hubs
- Specialty-first sidebar filtering with:
  - upcoming or past or all
  - year
  - region group
  - state or province or country drill-down
  - city
  - format
  - tags
  - deadline status
  - trust level
  - quick filters for newly added, recently changed, closing soon, open deadlines, and TBD deadlines
  - sort by upcoming date, soonest deadline, recently updated, or newest added
  - bookmarked only
- Smart search across conference name, organization, location, tags, notes, venue, sessions, specialties, flags, and source trust labels
- Lightweight natural-language-style search hints for phrases such as US/international, fall/spring, regional, and open deadlines
- Bookmarks persisted in localStorage
- Compare workflow persisted in localStorage for side-by-side shortlists of up to four meetings
- Bookmarks comparison table with CSV export and ICS export
- Calendar page with its own filters and ICS export for:
  - filtered abstract deadlines
  - bookmarked deadlines
  - filtered conference dates
- Specialty hub pages for high-priority surgical tracks
- Notification preferences persisted in localStorage for:
  - selected specialties
  - bookmarked conferences
  - filtered directory results
  - multiple lead-time windows
- Conference detail pages with:
  - venue
  - venue address
  - CME
  - sessions
  - source metadata
  - trust badges
  - recurring-meeting intelligence
  - audience and submission indicators
  - review status
  - report issue actions
- Add Conference staging flow with URL validation, manual fallback, a local pending-review queue, and prefilled GitHub review issue links
- GitHub issue templates for conference corrections and new conference submissions

## Data Model

Published conference records in `src/data/conferences.json` support a richer schema including:

- `id`
- `name`
- `organization`
- `categories`
- `tags`
- `startDate`
- `endDate`
- `dateLabel`
- `year`
- `city`
- `state`
- `country`
- `regionGroup`
- `locationLabel`
- `format`
- `abstractDeadline`
- `abstractDeadlineSort`
- `meetingUrl`
- `sourceUrl`
- `sourceType`
- `sourceTrustLabel`
- `verifiedAt`
- `lastChecked`
- `confidenceScore`
- `reviewStatus`
- `firstSeenAt`
- `lastSeenAt`
- `lastUpdatedAt`
- `venue`
- `venueAddress`
- `notes`
- `featured`
- `cme`
- `sessions`
- `issueReported`
- `flags`
- `deadlineUrgency`
- `deadlineUrgencyLabel`
- `sortUpdatedAt`
- `journalAssociation`
- `abstractTypes`
- `residentPaperCompetition`
- `travelScholarshipNotes`
- `membershipRelevance`
- `acceptsAbstracts`
- `acceptsVideos`
- `acceptsPosters`
- `acceptsLateBreaking`
- `moderationStatus`
- `audienceIndicators`
- `recurring`

Category merges are enforced:

- `Bariatric Surgery` -> `Metabolic & Abdominal Wall Reconstructive Surgery`
- `Aesthetic Surgery` and `Plastic Surgery` -> `Plastic & Reconstructive Surgery`

## Data Workflow

Primary maintained files:

- `src/data/conferenceSources.json`
  Curated source-of-truth conference seed list and additive master input
- `src/data/sources.json`
  Discovery/reference registry grouped by official societies, trusted directories, broad aggregators, and legacy/manual support
- `src/data/conferences.json`
  Generated publishable frontend dataset
- `src/data/lastUpdated.json`
  Generated timestamp and workflow metadata
- `data/raw/discovered_conferences.json`
  Review-oriented discovery output
- `data/review/flagged_conferences.json`
  Validation issues to inspect manually

### Local Update Flow

1. Edit `src/data/conferenceSources.json` to add or correct records.
2. Optionally update `src/data/sources.json` when you want to expand the discovery/reference registry.
3. Run `npm run data:pipeline`.
4. Review `data/review/flagged_conferences.json`.
5. Confirm `src/data/conferences.json` and `src/data/lastUpdated.json`.
6. Run `npm start` or `npm run build`.

### GitHub Actions Update Flow

The repo includes `.github/workflows/update-conferences.yml`.

It runs on:

- a weekly schedule
- manual `workflow_dispatch`

The workflow:

1. runs the Python review pipeline
2. discovers and normalizes candidate meetings
3. additively merges them against the existing published dataset
4. regenerates frontend conference data
5. builds the app
6. commits refreshed data back to the repository when files change

This is intentionally a repo-based additive update architecture, not a fake browser-only auto-update system.

## Scripts

- `npm start`
  Start the React development server
- `npm test`
  Run the test suite
- `npm run build`
  Create the production build
- `npm run refresh-data`
  Regenerate published conference data and the visible last-updated timestamp
- `npm run data:discover`
  Build the raw review-oriented discovery snapshot from configured sources
- `npm run data:normalize`
  Normalize maintained conference records into a review dataset
- `npm run data:merge`
  Deduplicate normalized conference records and preserve additive master-dataset metadata
- `npm run data:validate`
  Flag missing fields or schema problems
- `npm run data:pipeline`
  Run the full review pipeline and publish refreshed frontend data
- `npm run deploy`
  Publish the app to GitHub Pages

## Deployment

The app is configured for GitHub Pages at:

`https://sorrad.github.io/SurgCon`

It uses `HashRouter`, so deep links remain compatible with static hosting.

Typical deployment flow:

1. Run `npm run data:pipeline` if you updated conference records.
2. Run `npm run build`.
3. Commit and push your changes.
4. Run `npm run deploy`.

## Sources and Discovery Strategy

SurgCon uses a source hierarchy:

- Official society or meeting pages for highest-confidence records
- Trusted specialty directories and calendars for discovery and backfill
- Broad aggregators only for discovery support when better sources are not yet available
- Legacy SurgicalHub data only when it is 2024 or newer and can be normalized cleanly
- Manual review for partial or candidate records

Examples of configured source references include:

- UPenn CSHE abstract deadlines and meeting dates
- Northwestern Surgery conference calendar
- CTSNet event calendar
- Penn trauma and surgical critical care conference references
- Academic Surgical Congress official pages
- American Surgical Association future meetings
- American Pediatric Surgical Association official pages
- Society of Black Academic Surgeons official pages

## Issue Reporting

Issue reporting is frontend-friendly. The current implementation opens a lightweight prefilled GitHub issue flow so users can flag missing dates, incorrect locations, broken links, or questionable metadata without requiring a paid backend service.

## Limitations

- SurgCon does not promise exhaustive or real-time web scraping from the browser.
- Broad discovery is limited by the configured source registry and still benefits from manual review after each update run.
- Candidate records still require human review before they should be treated as fully confirmed.
- Some meetings intentionally keep `TBD` values when public details are incomplete.
- Official meeting URLs are still incomplete for some records and should continue to be curated over time.

## Credits

Developed by [Reza Shahriarirad](https://sorrad.github.io/RezaShahriarirad_CV/)
