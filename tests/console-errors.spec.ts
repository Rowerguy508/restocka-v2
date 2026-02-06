import { test, expect } from '@playwright/test';

const BASE_URL = 'https://restocka.app';

test.describe('Console Error Detection', () => {
  test('no console errors on landing page', async ({ page }) => {
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
    await page.waitForTimeout(2000); // Wait for any async errors
    
    // Filter out non-critical errors (like favicon, etc.)
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('favicon') &&
      !err.includes('404') &&
      !err.includes('favicon.ico')
    );
    
    // Critical: No console errors should be present
    expect(criticalErrors).toHaveLength(0, 
      `Console errors found: ${criticalErrors.join(', ')}`);
  });

  test('no uncaught exceptions', async ({ page }) => {
    const exceptions: string[] = [];
    
    page.on('pageerror', (error) => {
      exceptions.push(error.message);
    });
    
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    expect(exceptions).toHaveLength(0, 
      `Uncaught exceptions: ${exceptions.join(', ')}`);
  });

  test('API endpoints respond without errors', async ({ page }) => {
    const apiErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('api')) {
        apiErrors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Wait for API calls
    
    // Supabase/API errors
    const supabaseErrors = apiErrors.filter(err => 
      err.includes('supabase') ||
      err.includes('auth') ||
      err.includes('database')
    );
    
    expect(supabaseErrors).toHaveLength(0, 
      `API errors found: ${supabaseErrors.join(', ')}`);
  });

  test('network requests complete successfully', async ({ page }) => {
    const failedRequests: { url: string; status: number }[] = [];
    
    page.on('requestfailed', (request) => {
      failedRequests.push({
        url: request.url(),
        status: 0
      });
    });
    
    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Filter out non-critical failures
    const criticalFailures = failedRequests.filter(req => 
      !req.url.includes('favicon') &&
      !req.url.includes('.ico')
    );
    
    expect(criticalFailures).toHaveLength(0, 
      `Failed requests: ${JSON.stringify(criticalFailures)}`);
  });
});
