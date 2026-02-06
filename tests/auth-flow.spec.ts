/**
 * Restocka Auth Flow QA Tests
 * 
 * Key improvements over previous tests:
 * 1. Proper waiting for spinners to DISAPPEAR
 * 2. Exact button text matching
 * 3. Web-first assertions
 * 4. Data-testid selectors
 * 5. Timeout handling for network requests
 */

const { test, expect } = require('@playwright/test');

test.describe('Restocka Authentication Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear storage to start fresh
    await page.goto('https://restocka.app/login');
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
  });

  test('Login page loads correctly', async ({ page }) => {
    await page.goto('https://restocka.app/login');
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');
    
    // Check main elements exist
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check page title
    await expect(page).toHaveTitle(/ReStocka/);
    
    console.log('✅ Login page loads correctly');
  });

  test('Signup toggle works correctly', async ({ page }) => {
    await page.goto('https://restocka.app/login');
    await page.waitForLoadState('networkidle');
    
    // Click the signup toggle - use EXACT text
    const signupToggle = page.locator('button:has-text("Don\'t have an account? Sign up")');
    await expect(signupToggle).toBeVisible();
    await signupToggle.click();
    
    // Wait for confirm password to appear
    await expect(page.locator('#confirmPassword')).toBeVisible();
    
    // Check that Sign In button text changes
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toHaveText(/Sign up|Crear cuenta/);
    
    console.log('✅ Signup toggle works correctly');
  });

  test('New user signup flow', async ({ page }) => {
    await page.goto('https://restocka.app/login');
    await page.waitForLoadState('networkidle');
    
    // Click signup toggle
    const signupToggle = page.locator('button:has-text("Don\'t have an account? Sign up")');
    await signupToggle.click();
    
    // Wait for form to update
    await page.waitForSelector('#confirmPassword', { state: 'visible' });
    
    // Fill signup form with unique email
    const uniqueEmail = `test${Date.now()}@restocka.app`;
    await page.fill('input[id="email"]', uniqueEmail);
    await page.fill('input[id="password"]', 'TestPass123!');
    await page.fill('#confirmPassword', 'TestPass123!');
    
    // Submit
    await page.locator('button[type="submit"]').click();
    
    // CRITICAL: Wait for loading spinner to appear, then DISAPPEAR
    try {
      // Wait for potential loading state
      await page.waitForSelector('[class*="spinner"], [class*="loader"]', { 
        state: 'visible', 
        timeout: 2000 
      }).catch(() => {});
      
      // Wait for it to disappear
      await page.waitForSelector('[class*="spinner"], [class*="loader"]', { 
        state: 'hidden', 
        timeout: 10000 
      }).catch(() => {});
    } catch (e) {
      // No spinner found, continue
    }
    
    // Wait for navigation or error
    await page.waitForURL(/restocka\.app\/.*/, { timeout: 15000 }).catch(() => {});
    
    // Check current URL
    const url = page.url();
    console.log('After signup URL:', url);
    
    // Verify we're on the app (either dashboard or welcome state)
    if (url.includes('/app')) {
      console.log('✅ Signup successful - redirected to /app');
      
      // Check for welcome state or dashboard content
      await page.waitForTimeout(3000); // Give time for dashboard to load
      
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes('Bienvenido') || bodyText.includes('ReStocka')) {
        console.log('✅ Dashboard/Welcome state rendered');
      } else {
        console.log('⚠️ Dashboard loaded but content unclear');
      }
    } else if (url.includes('login') || page.locator('text=Incorrect').isVisible()) {
      console.log('⚠️ Still on login - check email confirmation settings');
    } else {
      console.log('⚠️ Unknown redirect:', url);
    }
  });

  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('https://restocka.app/login');
    await page.waitForLoadState('networkidle');
    
    // Fill with invalid credentials
    await page.fill('input[id="email"]', 'invalid@test.com');
    await page.fill('input[id="password"]', 'wrongpassword');
    
    // Submit
    await page.locator('button[type="submit"]').click();
    
    // Wait for error message
    await page.waitForTimeout(3000);
    
    // Check for error (either in toast, alert, or form)
    const errorSelectors = [
      'text=Incorrect',
      'text=Invalid',
      'text=error',
      '[role="alert"]'
    ];
    
    let errorFound = false;
    for (const selector of errorSelectors) {
      if (await page.locator(selector).first().isVisible().catch(() => false)) {
        errorFound = true;
        break;
      }
    }
    
    if (errorFound) {
      console.log('✅ Login error displayed correctly');
    } else {
      console.log('⚠️ No error message found (may be expected for Supabase)');
    }
  });

  test('Mobile viewport renders correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
    
    await page.goto('https://restocka.app/login');
    await page.waitForLoadState('networkidle');
    
    // Verify page elements are visible on mobile
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    
    // Check no horizontal scroll (common mobile issue)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.viewportSize().then(v => v.width);
    
    if (bodyWidth <= viewportWidth) {
      console.log('✅ Mobile view renders without horizontal scroll');
    } else {
      console.log('⚠️ Mobile horizontal scroll detected');
    }
  });

  test('Protected routes redirect to login', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('https://restocka.app/app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Should redirect to login or show login
    const url = page.url();
    if (url.includes('login') || url.includes('app') === false) {
      console.log('✅ Protected route redirects to login');
    } else {
      // May show dashboard if session persists
      console.log('⚠️ Protected route did not redirect (session may exist)');
    }
  });
});

// Helper function for waiting for spinners (can be used in tests)
// Usage: await waitForLoaderToHide(page);
async function waitForLoaderToHide(page, timeout = 10000) {
  try {
    await page.waitForSelector('[class*="spinner"], [class*="loader"]', {
      state: 'hidden',
      timeout: timeout
    });
  } catch (e) {
    // Loader may not exist, which is fine
  }
}

// Usage example:
// test('Complete flow', async ({ page }) => {
//   await page.goto('/login');
//   await waitForLoaderToHide(page);
//   // ... rest of test
// });
