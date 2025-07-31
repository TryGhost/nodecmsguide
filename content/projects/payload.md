---
title: Payload CMS
repo: payloadcms/payload
homepage: https://payloadcms.com
twitter: payloadcms
opensource: "Yes"
typeofcms: "API Driven"
supportedgenerators:
  - All
description: A headless CMS built with TypeScript, React, and Node.js. Payload gives you full control of your backend, a powerful admin UI, and extensibility for anything from content sites to custom applications.
images:
  - path: /images/payload-ui.png
  - path: /images/payload-examples.png
---

Payload is a powerful open source headless CMS and application framework built on modern technologies like TypeScript, React, and Node.js. Designed for developers who want maximum flexibility, Payload provides a fully customizable backend, API, and admin interface with zero lock-in.

<img class="simple" src="/images/payload-ui.png" alt="Payload Admin UI" />

### Architecture

Payload is completely headless and database-agnostic. It ships with a REST and GraphQL API, an auto-generated React-based admin panel, and native file upload handling. You define your data models in TypeScript and Payload handles the rest.

Unlike many headless CMS platforms, Payload is self-hosted and code-first by design. You can use it with any front-end framework (Next.js, Nuxt, Astro, Svelte, etc.) and deploy anywhere — from Vercel to DigitalOcean to your own infrastructure.

Payload's admin panel is fully themeable and extensible, with hooks for customizing UI behavior or adding new components. Its plugin system allows you to build features like authentication, file uploads, AI assistants, or custom workflows — all in one backend.

### Data & Storage

Payload supports PostgreSQL, MongoDB, SQLite, and any custom adapter via its new `db` abstraction layer introduced in v3. Local file uploads are supported out of the box, or you can use adapters for Amazon S3, Google Cloud Storage, and others.

All data definitions live alongside your application code, which means your entire schema is version-controlled and deployable like any other part of your app.

<img class="simple" style="width:calc(100%+40px);margin-left:-20px;margin-right:-20px;" src="/images/payload-examples.png" alt="Payload examples" />

### Example Use Cases

Payload is used by companies building SaaS platforms, design agencies launching websites, journalists managing content workflows, and AI researchers storing structured LLM knowledge. Some notable users include Netflix, Google DeepMind, NASA research teams, and hundreds of startups worldwide.

### Try Payload

Payload is open source under the MIT license and fully self-hostable. You can try it locally in seconds or deploy it instantly with Docker, Render, Railway, or Fly.io. A cloud platform is also available.

Here are a few quick links to get started:

[PayloadCMS.com](https://payloadcms.com) | [Docs](https://payloadcms.com/docs) | [GitHub](https://github.com/payloadcms/payload) | [Forum](https://github.com/payloadcms/payload/discussions) | [Starters](https://payloadcms.com/starters) | [Examples](https://github.com/payloadcms/payload/tree/main/examples) | [Cloud](https://payloadcms.com/cloud)

<style>.images{display:none}</style>
