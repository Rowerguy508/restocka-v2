const { chromium } = require('playwright');
(async () => {
  console.log('=== React Error Debug ===\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  
  // Capture EVERYTHING
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(`CONSOLE ERROR: ${text}`);
    }
    // Also capture warnings
    if (text.toLowerCase().includes('error') || text.toLowerCase().includes('warning')) {
      errors.push(`[${msg.type()}] ${text}`);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
    errors.push(`STACK: ${err.stack || 'no stack'}`);
  });
  
  page.on('requestfailed', req => {
    errors.push(`REQUEST FAILED: ${req.url()} - ${req.failure()?.errorText || 'unknown'}`);
  });
  
  try {
    console.log('1. Creating fresh user...');
    await page.goto('https://restocka.app/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    await page.locator("button:has-text(\"Don't have an account? Sign up\")").click();
    await page.waitForTimeout(2000);
    
    const email = `react${Date.now()}@restocka.app`;
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', 'TestPass123!');
    await page.fill('#confirmPassword', 'TestPass123!');
    await page.locator('button[type="submit"]').click();
    
    console.log('2. Waiting 25s for auth...');
    await page.waitForTimeout(25000);
    
    console.log('\n=== RESULT ===');
    console.log('URL:', page.url());
    
    console.log('\n=== ALL CAPTURED ERRORS ===');
    if (errors.length === 0) {
      console.log('No errors captured!');
    } else {
      errors.forEach((e, i) => console.log(`${i + 1}. ${e}`));
    }
    
    console.log('\n=== PAGE STATE ===');
    const state = await page.evaluate(() => ({
      url: window.location.href,
      title: document.title,
      bodyLength: document.body?.innerText?.length || 0,
      bodyHTML: document.body?.innerHTML?.substring(0, 500) || 'empty',
      reactRoot: !!document.getElementById('root'),
      reactRootHTML: document.getElementById('root')?.innerHTML?.substring(0, 300) || 'empty'
    }));
    
    console.log('Title:', state.title);
    console.log('Body text length:', state.bodyLength);
    console.log('Root element exists:', !!state.reactRoot);
    console.log('Root HTML preview:', state.reactRootHTML);
    
    console.log('\n=== NETWORK ===');
    const reqs = await page.evaluate(() => window.performance?.getEntriesByType('request')?.length || 0);
    console.log('Total requests:', reqs);
    
  } catch (e) {
    console.error('Test failed:', e.message);
  }
  
  await browser.close();
  console.log('\n=== DONE ===');
})();
