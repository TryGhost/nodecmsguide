# nodecms.guide

[nodecms.guide](https://nodecms.guide), a leaderboard of Node.js content management systems.

[![Netlify Status](https://api.netlify.com/api/v1/badges/ff98559c-c0a7-498d-9989-27f09b139e6f/deploy-status)](https://app.netlify.com/sites/headlesscms/deploys)

## Contributing

Missing a Node.js CMS here? Just fork the repo and add yours as a `<name>.md` in the
`src/content/projects` folder.

Make sure to follow the following rules:

- **Node.js application:** Built on top of Node.js in some shape or form
- **Stick to the format:** Fill out all the same fields as the other CMS's in the projects folder.
- **Short description:** Keep all the details for the body text, keep the description for the overview page short and sweet.

## Usage

Requires Node.js 22 or higher. Clone this repository and run:

```bash
yarn install
yarn dev
```

In order to successfully retrieve GitHub stars, you will need authentication
keys for the service.

You'll need a personal access token with permission to create Gists. This can be generated at
<https://github.com/settings/tokens>. When deploying, you must set the environment
variables per the example below. If you are developing locally, you can set
these in a `.env` file at the root of the repo.

```
NODE_CMS_GITHUB_TOKEN=examplekey123abc
```

GitHub data is cached in the `tmp` directory, and online in a Gist. If the data is
more than 24 hours old, fresh data is fetched from GitHub. Fetching and caching occur
automatically during the build.

Then visit http://localhost:4321/ - Astro will automatically reload when changes occur.

To preview a production build locally:

```bash
yarn build
yarn preview
```

## Tech Stack

- **Framework:** [Astro](https://astro.build/) (Static Site Generator)
- **Interactive Components:** React 18
- **Styling:** Plain CSS
- **Data:** Markdown files with YAML frontmatter
- **APIs:** GitHub (@octokit/rest)
- **Hosting:** Netlify

## Ghost

nodecms.guide is built and maintained by [Ghost](https://ghost.org), an open source publishing platform built on Node.js.

# Copyright & License

Copyright (c) 2013-2026 Ghost Foundation - Released under the [MIT license](LICENSE).
