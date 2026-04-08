import { test, expect } from '@playwright/test';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * File-system assertions over the built `dist/` directory. These run without a
 * browser — they just verify `astro build` emits the structure we expect when
 * driven by the fixture archive. They catch regressions in content collection
 * schemas, slug generation, and template wiring before the preview server is
 * even involved.
 */

const dist = path.resolve(process.cwd(), 'dist');

const FIXTURE_PROJECTS = ['ghost', 'strapi', 'payload-cms', 'keystone-5'] as const;
const CONTENT_PAGES = ['contact', 'contribute'] as const;

async function readDist(relativePath: string): Promise<string> {
  return readFile(path.join(dist, relativePath), 'utf8');
}

async function distExists(relativePath: string): Promise<boolean> {
  try {
    await stat(path.join(dist, relativePath));
    return true;
  } catch {
    return false;
  }
}

test.describe('dist/ build output', () => {
  test('index.html exists and advertises the site title', async () => {
    const html = await readDist('index.html');
    expect(html).toContain('<title>');
    expect(html).toMatch(/NodeCMSGuide/i);
  });

  test('index.html renders cards for every fixture project', async () => {
    const html = await readDist('index.html');
    for (const slug of FIXTURE_PROJECTS) {
      expect(html, `expected /projects/${slug} link on index`).toContain(`/projects/${slug}`);
    }
  });

  test('index.html renders formatted star counts from fixture data', async () => {
    const html = await readDist('index.html');
    // The fixture puts Strapi at 65,000 stars — format is en-US with commas.
    expect(html).toContain('65,000');
    // Ghost 48,000.
    expect(html).toContain('48,000');
  });

  test('per-project detail pages exist for each fixture slug', async () => {
    for (const slug of FIXTURE_PROJECTS) {
      const html = await readDist(`projects/${slug}/index.html`);
      expect(html).toContain('<h1>');
    }
  });

  test('404.html exists', async () => {
    expect(await distExists('404.html')).toBe(true);
  });

  test('static content pages build from src/content/pages', async () => {
    for (const slug of CONTENT_PAGES) {
      expect(await distExists(`${slug}/index.html`), `dist/${slug}/index.html`).toBe(true);
    }
  });

  test('React islands emit astro-island hydration markers on index', async () => {
    const html = await readDist('index.html');
    expect(html).toContain('astro-island');
  });

  test('React islands emit astro-island hydration markers on project detail pages', async () => {
    // ShareButtons is a client island on /projects/[slug]
    const html = await readDist('projects/ghost/index.html');
    expect(html).toContain('astro-island');
  });

  test('sitemap-ish: every project in src/content/projects has a dist page', async () => {
    // Sanity check — count must be at least the fixture projects we care about.
    // We don't hard-code the full 60+ count here since the content collection
    // may legitimately grow; we just verify each fixture slug produced output.
    for (const slug of FIXTURE_PROJECTS) {
      expect(await distExists(`projects/${slug}/index.html`)).toBe(true);
    }
  });
});
