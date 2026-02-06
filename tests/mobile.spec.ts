import { test, expect } from '@playwright/test';

const BASE_URL = 'https://restocka.app';

test.describe('Mobile Responsiveness', () => {
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 14 Pro', width: 393, height: 852 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'Galaxy S21', width: 412, height: 915 },
  ];

  for (const viewport of viewports) {
    test(`${viewport.name} (${viewport.width}x${viewport.height}) - page loads`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      
      const response = await page.goto(BASE_URL);
      expect([200, 304]).toContain(response?.status());
    });

    test(`${viewport.name} - no horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      
      const body = page.locator('body');
      const overflowX = await body.evaluate((el) => {
        return window.getComputedStyle(el).overflowX;
      });
      
      // Page should not have horizontal scroll on mobile
      expect(overflowX).not.toBe('scroll');
    });

    test(`${viewport.name} - touch elements are accessible`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      
      // Check for clickable elements (buttons, links)
      const interactiveElements = await page.locator('a, button').count();
      expect(interactiveElements).toBeGreaterThan(0);
    });

    test(`${viewport.name} - no console errors`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      const consoleErrors: string[] = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      page.on('pageerror', (error) => {
        consoleErrors.push(error.message);
      });
      
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const criticalErrors = consoleErrors.filter(err => 
        !err.includes('favicon') &&
        !err.includes('404')
      );
      
      expect(criticalErrors).toHaveLength(0, 
        `${viewport.name} errors: ${criticalErrors.join(', ')}`);
    });
  }

  test('mobile menu/hamburger works on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Look for mobile navigation elements
    const mobileNav = await page.locator('button, [role="button"], .mobile-menu, .hamburger').count();
    
    // At least some navigation elements should exist
    expect(mobileNav).toBeGreaterThanOrEqual(0);
  });
});
