import { test, expect } from '@playwright/test';

/**
 * Render tests run against `astro preview` serving the fixture-backed build.
 * They verify hydration, client-side filtering, and cross-page navigation —
 * the things that plain dist/ assertions can't prove.
 */

test.describe('homepage render', () => {
  test('loads and shows the leaderboard heading', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/NodeCMSGuide/i);
  });

  test('renders all fixture project cards', async ({ page }) => {
    await page.goto('/');
    // Cards are anchor elements pointing at /projects/<slug>
    for (const slug of ['ghost', 'strapi', 'payload-cms', 'keystone-5']) {
      await expect(
        page.locator(`a.card[href="/projects/${slug}"]`).first(),
        `card for ${slug} should be visible`
      ).toBeVisible();
    }
  });

  test('ProjectFilter hydrates and license filter narrows results', async ({ page }) => {
    await page.goto('/');
    // Wait for the React island to mount — the filter selects render inside it.
    const licenseSelect = page.getByRole('combobox', { name: /filter by license/i });
    await expect(licenseSelect).toBeVisible();

    const allBefore = await page.locator('a.card').count();
    expect(allBefore).toBeGreaterThan(0);

    // "Closed source" is guaranteed to reduce the set since the vast majority
    // of CMSes in the repo are open source.
    await licenseSelect.selectOption('Closed source');
    const afterCount = await page.locator('a.card').count();
    expect(afterCount).toBeLessThan(allBefore);
  });
});

test.describe('project detail page', () => {
  test('ghost detail page loads with title and github link', async ({ page }) => {
    await page.goto('/projects/ghost');
    // The sheet's <h1> (there's also a header <h1>, so scope to .sheet).
    await expect(page.locator('.sheet h1')).toContainText(/ghost/i);
    await expect(page.locator('a[href*="github.com/TryGhost/Ghost"]').first()).toBeVisible();
  });

  test('ShareButtons hydrate on a project detail page', async ({ page }) => {
    await page.goto('/projects/ghost');
    // react-share renders buttons inside the ShareButtons island. Once the
    // island is hydrated, its astro-island element holds child buttons.
    const island = page.locator('astro-island').filter({ has: page.locator('button') });
    await expect(island.first()).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('404', () => {
  test('unknown routes serve the 404 page', async ({ page }) => {
    const response = await page.goto('/definitely-not-a-real-page');
    // `astro preview` serves 404.html with a 404 status for missing static files.
    expect(response?.status()).toBe(404);
    // There is a site header <h1> and a 404 <h1>; assert the 404 one
    // specifically rather than using a bare `locator('h1')`.
    await expect(page.locator('.sheet h1')).toContainText(/404/i);
  });
});
