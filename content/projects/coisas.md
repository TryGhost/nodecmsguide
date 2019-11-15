---
title: Coisas
repo: fiatjaf/coisas
homepage: https://coisas.alhur.es/
opensource: "Yes"
typeofcms: "Git-based"
supportedgenerators:
  - All
description: A client-side CMS for static sites hosted on GitHub.
images:
  - path: /images/coisas-basic.png
  - path: /images/coisas-preview.png
  - path: /images/coisas-expanded.png
---

## Coisas

**A client-side CMS for editing GitHub Markdown (and other) files ⛺**

**coisas** is a headless CMS specifically designed to let you edit files hosted in a GitHub repository. It is similar to [Netlify CMS](https://github.com/netlify/netlify-cms) and [Prose](http://prose.io/). Unlike existing alternatives, **coisas** doesn't try to be a multipurpose CMS. It still lets you edit, create, upload, and browse files, but doesn't try to look like a fancy CMS (custom schema, objects and all that mess). It also isn't tailored to Jekyll websites, which means that it won't insert Jekyll specific code or expect your repository to have a Jekyll-specific file structure.

### Features

- file tree view;
- simple metadata editor and automatic saving of Markdown and HTML files with YAML front-matter;
- behavior customizations that can be configured from your repository, while still accessing **coisas** from its own URL;
- easy embedding in your own site, so you'll never have to touch **coisas** own URL;
- image gallery with all the images from your repository, so you can drag and drop them inside the editor;
- simple visualization of many file formats (only text files are editable, however).
