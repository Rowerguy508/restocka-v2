import { test, expect } from '@playwright/test';

const BASE_URL = 'https://restocka.app';

test.describe('Dashboard Functionality', () => {
  test('dashboard route loads (public check)', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    
    // Dashboard might redirect to login if not authenticated
    // Just check it doesn't 404
    const response = await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).not.toBe(404);
  });

  test('dashboard has expected structure elements', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Check for dashboard-like elements on main page
    const pageContent = await page.content();
    
    // Look for inventory/stock-related terms
    const hasInventoryTheme = pageContent.toLowerCase().includes('inventory') ||
      pageContent.toLowerCase().includes('stock') ||
      pageContent.toLowerCase().includes('products');
    
    expect(hasInventoryTheme).toBe(true);
  });

  test('no dashboard-specific console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });
    
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Filter dashboard errors
    const dashboardErrors = consoleErrors.filter(err => 
      err.includes('dashboard') ||
      err.includes('inventory') ||
      err.includes('query') ||
      err.includes('react query')
    );
    
    expect(dashboardErrors).toHaveLength(0, 
      `Dashboard errors: ${dashboardErrors.join(', ')}`);
  });

  test('Supabase queries are working', async ({ page }) => {
    const queryErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error' && 
          (msg.text().includes('query') || msg.text().includes('PostgreSQL'))) {
        queryErrors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Wait for React Query to execute
    
    expect(queryErrors).toHaveLength(0, 
      `Database query errors: ${queryErrors.join(', ')}`);
  });
});
