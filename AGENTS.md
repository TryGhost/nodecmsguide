# AGENTS.md

Project-specific instructions for AI agents working on this codebase.

> `CLAUDE.md` is a symlink to this file — update `AGENTS.md` and both stay in sync.

## Project Overview

**nodecms.guide** is a Node.js CMS leaderboard and comparison website maintained by Ghost. It showcases 60+ Node.js-based content management systems with live GitHub metrics.

**Live site:** https://nodecms.guide

## Tech Stack

- **Framework:** [Astro](https://astro.build/) 5.x (static output)
- **Interactive Components:** React 19 via `@astrojs/react`
- **Language:** TypeScript (strict, extends `astro/tsconfigs/strict`)
- **Styling:** Plain CSS (`src/styles/global.css`) + scoped styles in `.astro` components
- **Content:** Markdown + YAML frontmatter loaded via Astro Content Collections (`astro:content`)
- **APIs:** GitHub (`@octokit/rest`)
- **Hosting:** Netlify
- **Node:** >= 22

## Project Structure

```
/src/
  /components/      # Astro + React components (Header, Footer, ProjectFilter, ShareButtons)
  /content/
    /projects/      # CMS definitions (Markdown + YAML frontmatter) — one file per CMS
    /pages/         # Static page content (contact, contribute)
  /layouts/         # BaseLayout.astro
  /pages/           # Astro routes: index.astro, [slug].astro, projects/[slug].astro, 404.astro
  /styles/          # global.css
  /images/          # Images referenced from components
  content.config.ts # Content collection schemas (zod)
/scripts/           # Build-time data fetching (fetch-archive.js, project-data.js, util.js)
/public/            # Static assets served as-is (favicon, robots.txt, /images/*)
/dist/              # Build output (gitignored)
/tmp/               # Local cache for GitHub archive data
```

Content collections are defined in `src/content.config.ts` with two collections: `projects` and `pages`. Any new frontmatter field must be added to the zod schema there.

## Development Commands

```bash
yarn install        # Install dependencies
yarn dev            # Astro dev server at http://localhost:4321
yarn build          # Production build to /dist
yarn preview        # Serve the production build locally
```

There is no `yarn start`, `yarn stage`, or `yarn serve` script — don't reference them. Tests, lint, and typecheck scripts are documented under [Testing](#testing).

## Adding a New CMS

Create a new Markdown file in `src/content/projects/` with this frontmatter (schema enforced by `src/content.config.ts`):

```yaml
---
title: CMS Name
repo: owner/repo                    # GitHub repo (omit for closed source)
homepage: https://example.com       # Must be a valid URL if present
twitter: handle                     # Optional
opensource: "Yes"                   # "Yes" | "No" (required)
typeofcms: "API Driven"             # See types below
supportedgenerators:
  - All                             # Or specific: Gatsby, Next, Hugo, etc.
description: Short description for the listing card.
images:
  - path: /images/cms-screenshot.png
startertemplaterepo: owner/repo     # Optional
---

Extended Markdown content for the detail page.
```

### CMS Types (`typeofcms`)

- `API Driven` - Headless CMS with REST/GraphQL API
- `Git-based` - Content stored in Git repositories
- `Flat-file` - File-based storage without database

## Code Patterns

### Components

- Prefer `.astro` components for static markup. Reach for React (`.tsx`) only when client-side interactivity is required (e.g. `ProjectFilter`, `ShareButtons`) and add the appropriate `client:*` directive at the usage site.
- Follow the existing TypeScript style — the project is strict, so type all props and external values explicitly.

### Styling

Global styles live in `src/styles/global.css`. Component-specific styles go in scoped `<style>` blocks inside `.astro` files. There is no styled-components or CSS-in-JS here anymore.

### Content access

Load projects/pages via `getCollection('projects')` / `getEntry('pages', slug)` from `astro:content`. The schema in `src/content.config.ts` is the source of truth for available fields.

### Module system

`package.json` has `"type": "module"` — use ESM (`import`/`export`) everywhere, including in `/scripts`.

## Environment Variables

Required for build-time GitHub data fetching:

- `NODE_CMS_GITHUB_TOKEN` — GitHub personal access token with permission to create Gists
- `NODE_CMS_USE_FIXTURE` — set to `1` to bypass GitHub entirely and load the checked-in fixture at `test/fixtures/node-cms-archive.json`. Used by CI and the test suite; not for production builds.

For local development, create a `.env` file at the repo root. On Netlify, this is configured in the site's environment settings.

## Data Fetching

GitHub metrics are fetched at build time by the scripts in `/scripts`:

- Raw archive data is cached locally in `/tmp` and remotely in a GitHub Gist
- If the cache is more than 24 hours old, fresh data is pulled from GitHub
- `project-data.js` compares newest data with data from ~1 week ago to compute trends

To refresh production data, trigger a new Netlify deploy.

## Common Tasks

### Adding images for a CMS

1. Add the image to `/public/images/`
2. Reference it in frontmatter: `path: /images/filename.png`
3. Use it in the Markdown body: `<img class="simple" src="/images/filename.png" alt="..." />`

## Testing

Three layers of automated tests, all wired into CI:

1. **Unit tests (vitest)** — `scripts/__tests__/*.test.js` cover `fetch-archive.js`, `project-data.js`, and `util.js`. 100% line coverage is enforced.
   - `yarn test` — run once
   - `yarn test:watch` — watch mode
   - `yarn test:coverage` — with v8 coverage
2. **End-to-end tests (Playwright)** — `tests/e2e/*.spec.ts` split into two kinds:
   - `build-output.spec.ts` — reads files from `dist/` to assert page structure, slug routing, and astro-island hydration markers. No browser required.
   - `render.spec.ts` — drives `astro preview` with real Chromium to verify hydration, client-side filtering, ShareButtons, and the 404 path.
   - Run with `NODE_CMS_USE_FIXTURE=1 yarn build && NODE_CMS_USE_FIXTURE=1 yarn test:e2e`.
3. **Quality gates** — `yarn lint` (ESLint flat config) and `yarn typecheck` (`astro check`) must pass.

CI workflows live in `.github/workflows/`:

- `ci.yml` — runs on every PR and push to main. Lint, typecheck, unit tests, build with fixture mode, and E2E. No secrets required.
- `smoke.yml` — runs on a daily cron and on-demand via `workflow_dispatch`. Does a real `yarn build` against the live GitHub API using the `NODE_CMS_GITHUB_TOKEN` repo secret, then verifies the archive gist was updated. This is the only place the real gist-creation path is exercised.

Manual verification:

1. `yarn dev` — verify changes interactively
2. `NODE_CMS_USE_FIXTURE=1 yarn build && yarn preview` — verify the production build without needing a GitHub token

## Notes

- All content changes require a rebuild to appear on the live site
- Filtering and sorting happens client-side in the `ProjectFilter` React component
- `CLAUDE.md` is a symlink to this file — edit `AGENTS.md`
