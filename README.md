# SurgCon

SurgCon is a static React application for surgical conference intelligence, planning, and dataset maintenance. It is deployed to GitHub Pages, uses `HashRouter` for client-side navigation, stores user-specific state in `localStorage`, and publishes a generated conference dataset from repository-managed source files rather than from a live backend.

This README is intended to be a full project handoff document. It explains what the platform does, how the code is organized, where the data comes from, how the update pipeline works, and what a future maintainer needs to know before making product or data changes.

## Executive Summary

- Frontend stack: React 19 + React Router 7 + Create React App.
- Hosting model: static build deployed to GitHub Pages.
- Runtime backend: none.
- Data backend: repository-managed JSON plus Node/Python generation scripts.
- User persistence: browser `localStorage`.
- Primary dataset: `src/data/conferences.json`.
- Source-of-truth input: `src/data/conferenceSources.json`.
- Discovery/source registry: `src/data/sources.json`.
- Generated metadata: `src/data/lastUpdated.json`.
- Review artifacts: `data/raw/*.json` and `data/review/*.json`.

As of the current generated snapshot in `src/data/lastUpdated.json`:

- Last generated: March 20, 2026 (`2026-03-20T07:05:37.873Z`)
- Source records: 56
- Published records: 56
- Confirmed records: 23
- Candidate records: 33
- Flagged records: 0
- Historical records preserved from 2024-2025: 7

## What the Product Does

SurgCon is designed as a surgical conference directory and planning workspace for surgeons, trainees, and academic teams. The app combines a curated conference dataset with filters, compare tools, bookmark flows, deadline exports, specialty hubs, local reminder preferences, and lightweight issue submission links.

Core end-user capabilities:

- Browse a master conference directory from 2024 onward.
- Prioritize upcoming meetings while still retaining older records for context.
- Filter by specialty, year, region, state/province/country, city, format, tags, deadline status, trust label, bookmarks, quick filters, and search text.
- Search across names, organizations, specialties, tags, notes, sessions, venue metadata, trust labels, and flags.
- Save bookmarks locally.
- Save up to four conferences in a local compare set.
- Export bookmarks and compare sets to CSV.
- Export filtered/bookmarked deadlines or meeting dates to ICS.
- Review richer conference metadata on detail pages.
- Browse specialty-specific landing pages.
- Save reminder preferences locally for categories, bookmarked conferences, filtered results, and lead times.
- Stage proposed conference additions locally and open prefilled GitHub issue templates for review.
- Report bad data through prefilled GitHub issue links.

## Important Architectural Reality

SurgCon does not have a live backend API, authentication system, database server, or real notification delivery service.

Instead, the platform is split into two layers:

1. Static runtime application
   The deployed app reads generated JSON files bundled into the frontend and runs fully client-side.
2. Repository-based maintenance pipeline
   Python and Node scripts transform curated source files into review artifacts and a publishable conference dataset.

That distinction matters for handoff:

- The UI can save state only on the current browser/device.
- The app cannot scrape websites at runtime.
- The app cannot send reminder emails from the browser.
- The app cannot accept permanent submissions without a maintainer updating repository data.
- The “backend” of this project is really the repo workflow, generated JSON files, and GitHub automation.

## Tech Stack

### Frontend

- `react` `^19.2.4`
- `react-dom` `^19.2.4`
- `react-router-dom` `^7.13.1`
- `react-scripts` `5.0.1`
- `web-vitals`

### Tooling and deployment

- Create React App build pipeline
- `gh-pages` for GitHub Pages deployment
- GitHub Actions for scheduled data refresh/build workflow
- Python 3.12 in CI for review scripts
- Node 20 in CI for build and publish generation

### Testing

- React Testing Library
- Jest via `react-scripts test`

Current automated test coverage is minimal. There is one smoke-style app render test in `src/App.test.js`.

## Runtime Architecture

### App shell

`src/App.js` is the composition root. It:

- mounts the router with `HashRouter`
- sets document titles per route
- loads generated conference data from `src/data/conferences.json`
- loads generated metadata from `src/data/lastUpdated.json`
- loads browser-local state from `localStorage`
- enriches conference records with UI-only flags such as `isBookmarked`, `isCompared`, and `issueReported`
- wires page-level handlers for bookmarks, compare state, issue reporting, and reminder preferences

### Routing

The application routes are:

- `/` -> Home
- `/conferences` -> Directory
- `/directory` -> Redirects to `/conferences`
- `/conferences/:conferenceId` -> Conference detail
- `/calendar` -> Calendar
- `/bookmarks` -> Bookmarks
- `/compare` -> Compare
- `/specialties/:specialtySlug` -> Specialty hub
- `/notifications` -> Notification preferences
- `/add-conference` -> Add/stage conference

Because this app uses `HashRouter`, GitHub Pages can support deep links without server-side routing.

## UI Surface by Page

### Home

`src/pages/Home.js`

Purpose:

- Introduces the product.
- Shows high-level counts derived from the current dataset.
- Highlights three upcoming conferences.
- Links into specialty hubs and key app workflows.

Behavior:

- Computes upcoming conferences from `!conference.isPast`.
- Computes specialty coverage from normalized conference categories.
- Shows historical and featured counts.

### Directory

`src/pages/Directory.js`

Purpose:

- Primary searchable/filterable master directory.

Behavior:

- Owns page-local filter state using `DEFAULT_FILTERS`.
- Uses `filterConferences()` and `getFilterOptions()` from `src/utils/filterConferences.js`.
- Supports “Use Filtered Results for Notifications”.
- Supports “Use Specialty for Notifications”.
- Shows compare count from global app state.
- Defaults to upcoming conferences but allows past conferences to be shown.

### Conference Detail

`src/pages/ConferenceDetail.js`

Purpose:

- Shows the full expanded record for one conference.

Displayed metadata includes:

- date and deadline data
- location and venue data
- reminder controls
- source metadata and trust badges
- session and CME data
- recurring-meeting intelligence
- journal and resident/research metadata
- audience indicators
- submission indicators
- specialties, tags, and notes

Actions include:

- bookmark toggle
- compare toggle
- report issue
- open official meeting page
- add/remove reminder preferences for that bookmarked conference

### Calendar

`src/pages/Calendar.js`

Purpose:

- Deadline/date planning view with ICS export.

Behavior:

- Maintains its own filter state.
- Reuses shared filtering logic.
- Supports export of:
  - filtered abstract deadlines
  - bookmarked abstract deadlines
  - filtered conference dates
- Generates all-day ICS files client-side.

### Bookmarks

`src/pages/Bookmarks.js`

Purpose:

- Device-local shortlist and export board.

Behavior:

- Shows bookmarked conferences in a comparison table.
- Supports CSV export.
- Supports ICS export for both deadlines and conference dates.
- Empty state encourages the user to save conferences from the directory.

### Compare

`src/pages/Compare.js`

Purpose:

- Side-by-side shortlisting for up to four conferences.

Behavior:

- Uses the compare set stored in `localStorage`.
- Exports compare set to CSV or deadline ICS.
- Shows trust, deadline urgency, audience fit, submission options, and planning flags.

Important implementation detail:

- Compare IDs are capped to four records in `App.js` and `storageHelpers.js`.

### Notifications

`src/pages/Notifications.js`

Purpose:

- Saves a local reminder plan, not actual sent notifications.

Behavior:

- Stores email text, selected specialties, selected bookmarked conferences, selected filtered result IDs, and lead times in `localStorage`.
- Displays an at-a-glance local plan summary.
- Shows upcoming abstract deadlines as a planning aid.

Important limitation:

- No outbound email or scheduled reminder engine exists in the frontend.

### Specialty Hub

`src/pages/SpecialtyHub.js`

Purpose:

- Curated landing pages for selected specialties.

Behavior:

- Resolves a hub by slug using `src/utils/specialtyHelpers.js`.
- Filters matching conferences for the hub.
- Shows counts for total records, upcoming records, and official-source records.

### Add Conference

`src/pages/AddConference.js`

Purpose:

- Browser-local staging flow for proposed conference additions or edits.

Behavior:

- Accepts a URL and runs lightweight validation/prefill through `urlImportHelpers.js`.
- Stores submitted staging records in `localStorage`.
- Does not scrape a webpage.
- Can open a prefilled GitHub issue based on the latest local staged submission.

Important limitation:

- A staged submission is not automatically merged into the published dataset.
- Maintainers still need to update `src/data/conferenceSources.json` or act on the GitHub issue.

## Core Components

### `src/components/Header.js`

- Top-level navigation
- Bookmark count
- Compare count
- Brand identity and route links

### `src/components/Footer.js`

- Uses `lastUpdated` metadata from generated JSON
- Shows formatted last-updated timestamp
- Includes author credit

### `src/components/ConferenceCard.js`

Reusable directory/hub/home card component. Displays:

- conference status
- trust badge
- review status
- reminder enabled state
- abstract deadline and urgency
- specialties
- planning flags
- location/date/format
- source label
- compare, details, visit-site, and report-issue actions

### `src/components/FilterSidebar.js`

Directory filter UI for:

- text search
- specialty
- quick filter
- sort mode
- year
- region group
- state/province/country
- city
- format
- tag
- deadline status
- trust label
- bookmarked-only

## Persistence Model

All end-user state is saved in browser `localStorage` via `src/utils/storageHelpers.js`.

Storage keys:

- `surgcon-bookmarks`
- `surgcon-notification-preferences`
- `surgcon-reported-issues`
- `surgcon-submitted-conferences`
- `surgcon-compare-conferences`

Persisted concepts:

- bookmarked conference IDs
- compared conference IDs
- reported issue IDs
- locally submitted conference staging records
- notification preferences

Default reminder lead times:

- `1 week`
- `2 weeks`
- `1 month`
- `2 months`
- `3 months`

This means:

- bookmark/compare/reminder state is device-specific
- clearing browser storage clears the user’s local state
- nothing is synced across users or browsers

## Search, Filter, and Ranking Logic

The primary filtering implementation lives in `src/utils/filterConferences.js`.

### Default filters

The directory defaults to:

- `specialty: All`
- `viewMode: upcoming`
- `year: All`
- `regionGroup: All`
- `locationValue: All`
- `city: All`
- `format: All`
- `tag: All`
- `deadlineStatus: All`
- `trustLabel: All`
- `quickFilter: all`
- `sortBy: soonest-deadline`
- `bookmarkedOnly: false`
- `search: ""`

### Filter dimensions

- specialty
- year
- region group
- state/province/country
- city
- format
- tag
- deadline status (`Open`, `Closed`, `TBD`)
- source trust label
- bookmarked-only
- view mode (`upcoming`, `all`, and internally supported `past`)

### Quick filters

- all conferences
- deadlines closing soon
- newly added
- recently updated
- open abstract deadlines
- TBD deadlines

### Sorting options

- most relevant deadline
- upcoming conference date
- recently updated
- newest added

### Search behavior

Search is more than a simple substring match. `src/utils/searchHelpers.js` adds:

- weighted fields
- query-term expansion
- specialty and concept synonyms
- natural-language-like hints for year/season/region/deadline status

Examples of recognized hint patterns:

- `US`
- `Canada`
- `international`
- `fall`
- `spring`
- `regional`
- `open deadline`
- `virtual`

Weighted searchable fields include:

- conference name
- organization
- categories
- tags
- notes
- city/state/country
- location label
- venue
- venue address
- session names
- source label
- source trust label
- flags
- audience indicators
- journal association
- abstract types
- membership relevance

## Conference Intelligence Layer

The UI uses helper functions in `src/utils/conferenceIntel.js` and data produced by `scripts/generate-conferences.js` to express conference quality and planning context.

### Trust badges

- `Verified Official Source`
- `Trusted Directory Source`
- `Candidate / Needs Review`

### Review states

- `confirmed`
- `candidate`
- `flagged`

### Submission indicators

Derived booleans support labels such as:

- accepts abstracts
- accepts videos
- accepts posters
- late-breaking abstracts

### Audience indicators

The generation pipeline can mark records as:

- good for residents/fellows
- regional meeting
- broad meeting
- subspecialty meeting
- international travel required
- virtual attendance available

### Recurring intelligence

Generated recurring metadata includes:

- series key
- likely recurring status
- known years
- likely month
- future cycle status
- inferred/confirmed counts

## Export System

Client-side export helpers live in `src/utils/exportHelpers.js`.

### CSV export

CSV fields include:

- Conference Name
- Organization
- Specialties
- Tags
- Location
- Dates
- Abstract Deadline
- Format
- Venue
- Source Trust
- Source Type
- Review Status
- Last Checked
- First Seen
- Last Updated
- Flags
- Official Link

### ICS export

ICS exports are generated in-browser and downloaded directly.

Supported modes:

- abstract deadline calendars
- conference-date calendars

Event characteristics:

- all-day events
- one event per exportable record
- includes summary, description, location, and optional URL

## Data Model

The published records live in `src/data/conferences.json`. The generator enriches them heavily beyond the raw source list.

Important fields include:

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
- `deadlineUrgency`
- `deadlineUrgencyLabel`
- `meetingUrl`
- `sourceUrl`
- `sourceType`
- `sourceTrustLabel`
- `confidenceScore`
- `reviewStatus`
- `verifiedAt`
- `lastChecked`
- `venue`
- `venueAddress`
- `notes`
- `featured`
- `cme`
- `sessions`
- `sourceLabel`
- `isPast`
- `firstSeenAt`
- `lastSeenAt`
- `lastUpdatedAt`
- `sortUpdatedAt`
- `flags`
- `dateChangedRecently`
- `likelyRecurringMeeting`
- `isInferred`
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

UI-only runtime fields added in `App.js`:

- `isBookmarked`
- `isCompared`
- `issueReported`

### Taxonomy normalization rules

The generator normalizes category names. Important merges include:

- `Bariatric Surgery` -> `Metabolic & Abdominal Wall Reconstructive Surgery`
- `Plastic Surgery` -> `Plastic & Reconstructive Surgery`
- `Aesthetic Surgery` -> `Plastic & Reconstructive Surgery`
- `Otolaryngology / Head & Neck Surgery` -> `Otolaryngology / Head and Neck Surgery`
- `Colon & Rectal Surgery` -> `Colon and Rectal Surgery`
- `Hepatobiliary & Pancreas Surgery` -> `Hepatobiliary and Pancreas Surgery`

Unknown categories fall back to:

- `Trauma, Critical Care, and General Surgery`

### Standard specialties

The normalized specialty set is:

- Breast & Melanoma Surgical Oncology
- Cardiothoracic Surgery
- Cardiovascular Surgery
- Colon and Rectal Surgery
- Endocrine Surgery
- Hepatobiliary and Pancreas Surgery
- Metabolic & Abdominal Wall Reconstructive Surgery
- Neurologic Surgery
- Obstetrics and Gynecology Surgery
- Oral and Maxillofacial Surgery
- Orthopedic Surgery
- Otolaryngology / Head and Neck Surgery
- Pediatric Surgery
- Plastic & Reconstructive Surgery
- Thoracic Surgery
- Trauma, Critical Care, and General Surgery
- Vascular Surgery

## Data Ownership and Source Files

### 1. `src/data/conferenceSources.json`

This is the most important maintained file in the repo.

It acts as the curated source-of-truth input list for conference records. Records here can include:

- IDs
- names
- organizations
- categories
- tags
- dates
- locations
- URLs
- source metadata
- confidence/review metadata
- venue and session metadata
- audience/submission metadata
- maintenance timestamps

If a maintainer wants to add or correct conferences, this is usually the first file to edit.

### 2. `src/data/sources.json`

This is the source/discovery registry, not the published conference list.

It groups known references into:

- `officialSocieties`
- `trustedDirectories`
- `broadAggregators`
- `legacyManual`

Its purpose is to document where records are sourced or discovered from and to support the review pipeline outputs.

### 3. `src/data/conferences.json`

Generated publishable frontend dataset.

This is what the React app actually imports and renders.

### 4. `src/data/lastUpdated.json`

Generated metadata used for footer display and maintenance visibility.

Contains:

- generation timestamp
- record counts
- supported years
- workflow notes
- source-type summary
- review summary
- preserved historical record count

### 5. `data/raw/discovered_conferences.json`

Review-oriented discovery snapshot generated by the Python discovery script.

### 6. `data/review/normalized_conferences.json`

Intermediate normalized review output from source records.

### 7. `data/review/merged_conferences.json`

Intermediate merged review output before validation.

### 8. `data/review/flagged_conferences.json`

Validation output showing missing fields or invalid schema/state values requiring manual review.

## Data Pipeline

The project uses a mixed Python + Node workflow.

### Script responsibilities

#### `scripts/discover_conferences.py`

- Reads `src/data/sources.json`
- Reads `src/data/conferenceSources.json`
- Produces `data/raw/discovered_conferences.json`
- Does not perform actual scraping
- Produces a review-oriented discovery payload plus source-group counts and notes

#### `scripts/normalize_conferences.py`

- Reads `src/data/conferenceSources.json`
- Normalizes categories and core record structure
- Infers region group where needed
- Writes `data/review/normalized_conferences.json`

#### `scripts/merge_conferences.py`

- Reads normalized records
- Reads existing published master records from `src/data/conferences.json`
- Merges duplicate IDs and preserves certain existing metadata
- Writes `data/review/merged_conferences.json`

#### `scripts/validate_conferences.py`

- Validates required fields and allowed enums
- Flags records older than 2024
- Flags invalid `sourceType`, `reviewStatus`, and `moderationStatus`
- Writes `data/review/flagged_conferences.json`

#### `scripts/generate-conferences.js`

This is the main publishing script. It:

- reads `src/data/conferenceSources.json`
- optionally reads the existing published dataset for additive merge behavior
- normalizes records
- infers source type when not explicitly provided
- computes confidence and review states
- computes location labels
- computes deadline urgency labels
- computes `isPast`
- computes `firstSeenAt`, `lastSeenAt`, and `lastUpdatedAt`
- computes audience indicators
- computes recurring-series metadata
- computes user-facing flags such as `newly added`, `recently updated`, `deadline unconfirmed`, `likely recurring meeting`, `resident-friendly`, and `regional meeting`
- sorts records for publish-ready display
- writes `src/data/conferences.json`
- writes `src/data/lastUpdated.json`

### Local pipeline commands

Available npm scripts:

- `npm start` -> start development server
- `npm test` -> run tests
- `npm run build` -> production build
- `npm run refresh-data` -> run `generate-conferences.js`
- `npm run data:discover` -> run Python discovery step
- `npm run data:normalize` -> run Python normalization step
- `npm run data:merge` -> run Python merge step
- `npm run data:validate` -> run Python validation step
- `npm run data:pipeline` -> run all Python review steps, then regenerate frontend data
- `npm run deploy` -> publish `build/` to GitHub Pages

### Recommended maintainer workflow

For routine data updates:

1. Edit `src/data/conferenceSources.json`.
2. Update `src/data/sources.json` only if discovery/source references changed.
3. Run `npm run data:pipeline`.
4. Inspect `data/review/flagged_conferences.json`.
5. Inspect `src/data/conferences.json` and `src/data/lastUpdated.json`.
6. Run `npm run build`.
7. Commit and push.

For simple content changes that do not affect the source registry:

1. Edit `src/data/conferenceSources.json`.
2. Run `npm run refresh-data`.
3. Sanity-check the app locally.

## GitHub Automation

The workflow file is `.github/workflows/update-conferences.yml`.

It runs:

- manually via `workflow_dispatch`
- weekly on Mondays at `11:00 UTC`

The workflow:

1. checks out the repo
2. sets up Node 20
3. sets up Python 3.12
4. runs `npm ci`
5. runs the Python review pipeline
6. runs `node scripts/generate-conferences.js`
7. builds the app
8. commits and pushes refreshed artifacts if anything changed

This means the scheduled update mechanism is repo-driven, not a browser feature.

## GitHub Issue Flow

Issue-related helpers are in `src/utils/issueHelpers.js`.

The app opens prefilled GitHub issue URLs against:

- `https://github.com/sorrad/SurgCon/issues/new`

Templates exist in:

- `.github/ISSUE_TEMPLATE/conference-correction.yml`
- `.github/ISSUE_TEMPLATE/conference-submission.yml`

Current issue flows support:

- reporting corrections for existing conferences
- staging new conference submissions for maintainer review

## Repo Structure

High-level layout:

```text
.
|-- .github/
|   |-- ISSUE_TEMPLATE/
|   `-- workflows/
|-- build/
|-- data/
|   |-- raw/
|   `-- review/
|-- public/
|-- scripts/
|-- src/
|   |-- components/
|   |-- data/
|   |-- pages/
|   |-- styles/
|   `-- utils/
|-- package.json
`-- README.md
```

### `public/`

Standard CRA static assets such as:

- `index.html`
- manifest/icons
- favicon
- robots.txt

### `src/styles/app.css`

Primary application styling. It is a relatively large monolithic stylesheet and currently holds most layout and component presentation rules.

### `build/`

Generated production output. This is not the source of truth for the app.

## Deployment

`package.json` is configured with:

- `homepage: https://sorrad.github.io/SurgCon`

Deployment path:

1. build the app with `npm run build`
2. publish the `build/` directory with `npm run deploy`

Because the app uses `HashRouter`, GitHub Pages can serve it without custom rewrite rules.

## Known Limits and Non-Goals

These are important for any future maintainer to understand:

- No live backend exists.
- No user authentication exists.
- No database exists.
- No server-side notification engine exists.
- No browser-time scraping exists.
- URL import does not extract full conference metadata.
- Local staged submissions are not automatically merged into the published dataset.
- Dataset freshness still depends on repo maintenance and manual review.
- Discovery outputs are review-oriented helpers, not proof of exhaustive conference coverage.
- Some official meeting links and metadata are intentionally incomplete and still need curation.

## Improvement Opportunities

If the project is continued, the highest-value next steps are likely:

- add more automated tests for filtering, sorting, exports, and data generation
- split `app.css` into smaller style modules
- formalize the conference schema in JSON Schema or TypeScript types
- validate `conferenceSources.json` earlier in CI
- create a maintainer admin workflow for reviewing staged submissions
- add snapshots or fixtures for generated data
- document specialty hub configuration more explicitly if hub coverage expands
- add end-to-end smoke tests for main routes

## Local Setup

Prerequisites:

- Node.js
- npm
- Python 3

Install and run:

```bash
npm ci
npm start
```

Run the full review/publish pipeline:

```bash
npm run data:pipeline
```

Build for production:

```bash
npm run build
```

Deploy to GitHub Pages:

```bash
npm run deploy
```

## Maintainer Notes

- If you are changing conference content, prefer editing `src/data/conferenceSources.json` rather than directly editing `src/data/conferences.json`.
- If you directly edit generated files, your changes may be overwritten by the next pipeline run.
- Treat `src/data/conferences.json` and `src/data/lastUpdated.json` as generated artifacts.
- Treat `data/raw/` and `data/review/` as review/debug artifacts for maintainers.
- Treat browser `localStorage` features as convenience UX, not system-of-record functionality.

## Credits

Developed by [Reza Shahriarirad](https://sorrad.github.io/RezaShahriarirad_CV/).
