# SurgCon

SurgCon is a surgical conference and academic collaboration platform built with React. This project turns the default Create React App starter into a clean, modular front-end for browsing surgical meetings, tracking deadlines, and highlighting academic collaboration opportunities.

## Features

- Branded home page for the SurgCon platform
- Conference directory powered by local JSON sample data
- Individual conference detail pages using route parameters
- Calendar-style view for event planning
- Simple conference submission form for future back-end integration
- GitHub Pages deployment support with `HashRouter`

## Tech Stack

- React
- React Router DOM
- Create React App
- GitHub Pages

## Project Structure

```text
src/
  components/
  data/
  pages/
  styles/
```

## Available Scripts

### `npm start`

Runs the app locally in development mode.

### `npm test`

Runs the test suite.

### `npm run build`

Creates a production build in the `build` folder.

### `npm run deploy`

Runs the predeploy build step and publishes the site to GitHub Pages.

## Deployment

The project is configured for GitHub Pages at:

`https://sorrad.github.io/SurgCon`

Because the app uses `HashRouter`, client-side routes continue to work correctly after deployment.

Typical deployment flow:

1. Commit and push your latest changes to GitHub.
2. Run `npm run deploy`.
3. Confirm GitHub Pages is serving from the `gh-pages` branch if your repository settings require it.

## Sample Data

Conference records live in `src/data/conferences.json`. This makes the app easy to understand for beginners and easy to replace later with an API or database.

## Future Ideas

- Add specialty and location filters
- Save form submissions to a back end
- Add authentication for academic collaborators
- Expand the conference dataset with research tracks and submission status
