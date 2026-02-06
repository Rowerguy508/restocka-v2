const { chromium } = require('playwright');
(async () => {
  console.log('=== Debug Dashboard Loading ===\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  const logs = [];
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });
  
  try {
    console.log('1. Going to login page...');
    await page.goto('https://restocka.app/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    console.log('2. Clicking signup...');
    await page.locator("button:has-text(\"Don't have an account? Sign up\")").click();
    await page.waitForTimeout(2000);
    
    console.log('3. Filling form...');
    const email = `debug${Date.now()}@restocka.app`;
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', 'TestPass123!');
    await page.fill('#confirmPassword', 'TestPass123!');
    
    console.log('4. Submitting...');
    await page.locator('button[type="submit"]').click();
    
    console.log('5. Waiting 20s for auth...');
    await page.waitForTimeout(20000);
    
    const url = page.url();
    console.log('\n=== URL ===');
    console.log(url);
    
    console.log('\n=== CONSOLE ERRORS ===');
    if (errors.length === 0) {
      console.log('No errors found!');
    } else {
      errors.forEach(e => console.log('❌', e));
    }
    
    console.log('\n=== ALL CONSOLE ===');
    logs.slice(0, 20).forEach(l => console.log(l));
    
    console.log('\n=== PAGE CONTENT ===');
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log('Body HTML length:', html.length);
    console.log('Body HTML preview:', html.substring(0, 300));
    
    console.log('\n=== NETWORK ERRORS ===');
    const failed = await page.evaluate(() => {
      return window.performance?.getEntriesByType('request')
        ?.filter(r => !r.responseok) || [];
    });
    console.log('Failed requests:', failed.length);
    
  } catch (e) {
    console.error('Test error:', e.message);
  }
  
  await browser.close();
  console.log('\n=== DONE ===');
})().catch(e => console.error('Fatal:', e.message));
