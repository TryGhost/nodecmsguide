# nodecms.guide

[nodecms.guide](https://nodecms.guide), a leaderboard of Node.js content management systems.

[![Netlify Status](https://api.netlify.com/api/v1/badges/ff98559c-c0a7-498d-9989-27f09b139e6f/deploy-status)](https://app.netlify.com/sites/headlesscms/deploys)

## Contributing

Missing a Node.js CMS here? Just fork the repo and add yours as a `<name>.md` in the
`content/projects` folder.

Make sure to follow the following rules:

- **Node.js application:** Built on top of Node.js in some shape or form
- **Stick to the format:** Fill out all the same fields as the other CMS's in source/projects.
- **Short description:** Keep all the details for the body text, keep the description for the overview page short and sweet.

## Usage

Be sure that you have the latest node and yarn installed, then clone this repository and run:

```bash
yarn
yarn start
```

In order to successfully retrieve Twitter followers and GitHub stars, you will need authentication
keys for both services.

For GitHub you'll need is a personal access token with permission to create Gists. This can be generated at
<https://github.com/settings/tokens>. For Twitter, you need to create an application at
<https://apps.twitter.com> to get the necessary tokens. When deploying, you must set the environment
variables per the example below. If you are developing locally, you can set
these in a `.env` file at the root of the repo.

```
NODE_CMS_GITHUB_TOKEN=examplekey123abc
NODE_CMS_TWITTER_CONSUMER_KEY=examplekey231abc
NODE_CMS_TWITTER_CONSUMER_SECRET=examplekey321abc
NODE_CMS_TWITTER_ACCESS_TOKEN_KEY=examplekey231abc
NODE_CMS_TWITTER_ACCESS_TOKEN_SECRET=examplekey321abc
```

GitHub and Twitter data is cached in the `.tmp` directory, and online in a Gist. If neither has data
newer than 24 hours old, fresh data is fetched from GitHub and Twitter. Fetching caching occur
automatically during the build.

Then visit http://localhost:3000/ - React Static will automatically reload when changes occur.

To test a production build locally, do:

```bash
npm run stage
npm run serve
```

To run a production build for deployment:

```bash
npm run build
```

## Ghost

nodecms.guide is built and maintained by [Ghost](https://ghost.org), an open source publishing platform built on Node.js.

# Copyright & License

Copyright (c) 2013-2026 Ghost Foundation - Released under the [MIT license](LICENSE).
