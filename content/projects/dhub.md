---
title: Dhub
homepage: https://dhub.dev
twitter: withdhub
opensource: "No"
typeofcms: "Git-based"
supportedgenerators:
  - All
description: The Git-based CMS for technical documentation websites.
images:
  - path: /images/dhub-1.webp
  - path: /images/dhub-2.webp
---

## Dhub

[Dhub](https://dhub.dev) is a Git-based CMS for documentation websites. It's built to bridge the gap between developers and content writers. It gives you a polished, Notion-style visual Markdown editor while keeping the actual content safely stored in your own GitHub repository.

The goal is simple: let developers stay in their preferred workflow (Git/VS Code) while giving non-technical contributors a friendly space to write, edit, and manage docs without touching a command line.

---

## How it Works

Think of Dhub as a user-friendly layer on top of your Git repository.

**Your content, your ownership.** Unlike traditional CMSs that lock your data into proprietary databases, Dhub commits everything back to GitHub as clean Markdown or MDX. If you stop using Dhub, you walk away with all your files intact.

## Why teams use it

* **Visual Editing (That actually works):** Writing complex Markdown tables or formatting images in raw text can be painful. Dhub offers a visual editor (similar to Notion) that handles the heavy lifting. You can drag, drop, and format easily, including LaTeX equations and callouts.

* **True Git Sync:** Changes made in the editor can be pushed directly to your main branch or submitted as a Pull Request for review. It works both ways—if a developer pushes a change via terminal, it shows up in Dhub immediately.

* **Frictionless Collaboration:** Marketing, Product, and Support teams can finally contribute to documentation without needing a GitHub account or understanding Git commands. Simply invite them to Dhub, and the platform handles the commits behind the scenes.

## Framework Support

Dhub is designed to fit into modern tech stacks, specifically React-based environments.

### Docusaurus
We have native support for Docusaurus. You can import your existing project directly from GitHub, and Dhub will respect your Docusaurus-specific MDX architecture immediately.

### Next.js & React
For custom sites running on Next.js or other React frameworks, Dhub integrates with **[Prose UI](https://prose-ui.com)**. This is an open-source library that provides a set of polished React components and CSS so your Markdown looks great out of the box (think centered images, pretty code blocks, and nice typography).

### General Markdown
At its core, Dhub edits Markdown. If you have a static site generator that uses standard `.md` or `.mdx` files, you can use Dhub to manage your content right away without complex configuration.