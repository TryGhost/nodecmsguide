# AGENTS.md

Project-specific instructions for AI agents working on this codebase.

## Project Overview

**nodecms.guide** is a Node.js CMS leaderboard and comparison website maintained by Ghost. It showcases 55+ Node.js-based content management systems with live GitHub metrics.

**Live site:** https://nodecms.guide

## Tech Stack

- **Framework:** React 16.x with React Static (SSG)
- **Styling:** Styled Components 3.x (CSS-in-JS)
- **Routing:** React Router 4.2
- **Data:** Markdown files with YAML frontmatter (gray-matter)
- **APIs:** GitHub (@octokit/rest)
- **Hosting:** Netlify

## Project Structure

```
/content/
  /projects/        # CMS definitions (Markdown + YAML frontmatter)
  /pages/           # Static pages
/src/
  /App/             # Main app wrapper, routing, global styles
  /Home/            # Homepage with filtering/sorting
  /Project/         # Individual project detail pages
  /images/          # Static images
/scripts/           # Data fetching utilities
/public/            # Static assets
```

## Development Commands

```bash
yarn install        # Install dependencies
yarn dev            # Dev server via Netlify CLI (fetches env vars from Netlify)
yarn start          # Dev server at localhost:3000 (no env vars)
yarn build          # Production build to /dist
yarn stage          # Staging build
yarn serve          # Serve production build locally
```

**Recommended:** Use `yarn dev` for local development. This runs `netlify dev` which automatically fetches environment variables from Netlify, enabling GitHub API calls without local `.env` setup.

## Adding a New CMS

Create a new Markdown file in `/content/projects/` with this frontmatter structure:

```yaml
---
title: CMS Name
repo: owner/repo                    # GitHub repo (omit for closed source)
homepage: https://example.com
opensource: "Yes"                   # "Yes" or "No"
typeofcms: "API Driven"             # See types below
supportedgenerators:
  - All                             # Or specific: Gatsby, Next, Hugo, etc.
description: Short description for the listing card.
images:
  - path: /images/cms-screenshot.png
---

Extended Markdown content for the detail page.
```

### CMS Types (`typeofcms`)

- `API Driven` - Headless CMS with REST/GraphQL API
- `Git-based` - Content stored in Git repositories
- `Flat-file` - File-based storage without database

## Code Patterns

### Styling

Use styled-components for all new styles:

```javascript
import styled from 'styled-components'

const Container = styled.div`
  padding: 20px;
  @media (max-width: 768px) {
    padding: 10px;
  }
`
```

### Module Imports

Babel module-resolver is configured. Use aliases where defined.

### ESLint

Extends `react-tools` preset. Run `yarn lint` before committing.

## Environment Variables

Required for data fetching. These are configured in Netlify and automatically available when using `yarn dev`:

- `NODE_CMS_GITHUB_TOKEN` - GitHub personal access token

No local `.env` file needed when using `yarn dev` (Netlify CLI fetches these automatically).

## Common Tasks

### Adding images for a CMS

1. Add images to `/public/images/`
2. Reference in frontmatter: `path: /images/filename.png`
3. Use in Markdown body: `<img class="simple" src="/images/filename.png" alt="..." />`

### Updating metrics

Metrics are fetched at build time. Trigger a new Netlify deploy to refresh data.

## Testing

No test suite currently configured. Manual testing:

1. `yarn start` - verify changes in dev
2. `yarn build && yarn serve` - verify production build

## Notes

- All content changes require a rebuild to appear on the live site
- GitHub metrics are cached in a GitHub Gist (24-hour refresh)
- Filtering and sorting happens client-side in React
