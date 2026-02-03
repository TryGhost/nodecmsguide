---
title: Versioned
repo: versioned/versioned-api
homepage: https://www.versioned.io
twitter: VersionedCMS
opensource: "Yes"
typeofcms: "API Driven"
supportedgenerators:
  - All
description: An admin UI and API backend that deliver content faster and cheaper to your website and mobile apps. Supports custom content types with relationships, versioning, and publishing.
---

## Versioned

Versioned is a headless CMS (or content backend) that is available both as [a managed service](https://www.versioned.io) and as [open source software on Github](https://github.com/versioned).

The main building blocks are:

* A web UI where content editors can manage content
* A REST API that delivers published content/data to clients (i.e. websites and apps)

## Feature Highlights

* *Dynamic Content Types* - a flexible way for content editors to set up the content types they need without having to do any software development
* *Data Validation* - content types are a collection of fields and each field has a data type and optionally validation rules to ensure the integrity of the data
* *Relationships* - a field in a content type can represent a `one-way` or `two-way` relationship (i.e. link or reference) to another content type and the type of the relationship can be either `one-to-one`, `one-to-many`, or `many-to-many`
* *Publishing and Versioning* - you can work on new content in a draft state, preview it, and then publish it to clients when it's ready. Content is versioned and you can see what has happened in a publish history.
* *Changelog* - Versioned maintains a log of changes made to all data so that editors can keep track of exactly what has been changed, when, and by whom
* *Webhooks* - configure another system to receive an HTTP call whenever content is changed so that your clients always have the latest published content (you may for example need to rebuild a [static website](https://jamstack.org) when content changes)
* *Translations* - select which languages to translate your texts into and deliver only the relevant language to your users

## Tech Stack

Versioned is built on these technologies:

* [Node.js](https://nodejs.org)
* [MongoDB](https://www.mongodb.com)
* [Vue.js](https://vuejs.org)
