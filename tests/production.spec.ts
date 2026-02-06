import { test, expect } from '@playwright/test';

const BASE_URL = 'https://restocka.app';

test.describe('Production Smoke Tests', () => {
  test('page loads without 404 errors', async ({ page }) => {
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    expect(response?.status()).not.toBe(404);
  });

  test('div#root has content', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    
    // Check that root has actual content
    const rootContent = await root.innerHTML();
    expect(rootContent.length).toBeGreaterThan(100);
  });

  test('landing page shows ReStocka branding', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Check for ReStocka branding - look for the brand name
    const pageContent = await page.content();
    expect(pageContent.toLowerCase()).toContain('restocka');
    
    // Check title
    await expect(page).toHaveTitle(/ReStocka/i);
  });

  test('JavaScript bundle loads successfully', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // No JavaScript bundle errors should be present
    const jsErrors = consoleErrors.filter(err => 
      err.includes('Failed to load resource') || 
      err.includes('.js') ||
      err.includes('bundle')
    );
    expect(jsErrors).toHaveLength(0);
  });

  test('main content elements are present', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Check for main app structure
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Page should have meaningful content
    const textContent = await page.textContent('body');
    expect(textContent?.length).toBeGreaterThan(50);
  });
});
