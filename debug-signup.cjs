const { chromium } = require('playwright');
(async () => {
  console.log('=== DEBUG SIGNUP FLOW ===\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const logs = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });
  
  try {
    console.log('1. Going to login...');
    await page.goto('https://restocka.app/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    console.log('   URL:', page.url());
    
    console.log('\n2. Clicking signup...');
    await page.locator("button:has-text(\"Don't have an account? Sign up\")").click();
    await page.waitForTimeout(2000);
    
    console.log('\n3. Filling form...');
    const email = 'debug' + Date.now() + '@restocka.app';
    console.log('   Email:', email);
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', 'Test123!');
    await page.fill('#confirmPassword', 'Test123!');
    
    console.log('\n4. Submitting signup...');
    await page.locator('button[type="submit"]').click();
    
    console.log('\n5. Waiting for auth (15s)...');
    await page.waitForTimeout(15000);
    
    console.log('\n=== RESULT ===');
    console.log('URL:', page.url());
    console.log('Body text length:', await page.evaluate(() => document.body.innerText.length));
    console.log('Body HTML length:', await page.evaluate(() => document.body.innerHTML.length));
    
    console.log('\n=== ERRORS ===');
    if (errors.length === 0) {
      console.log('No console errors!');
    } else {
      errors.forEach((e, i) => console.log(`${i + 1}. ${e}`));
    }
    
    console.log('\n=== PAGE STRUCTURE ===');
    const html = await page.evaluate(() => {
      return {
        rootInnerHTML: document.getElementById('root')?.innerHTML?.substring(0, 500) || 'empty',
        hasLoader: document.body.innerHTML.includes('loader') || document.body.innerHTML.includes('spinner'),
        hasLoading: document.body.innerHTML.toLowerCase().includes('cargando')
      };
    });
    console.log('Root HTML:', html.rootInnerHTML);
    console.log('Has loader:', html.hasLoader);
    console.log('Has cargando:', html.hasLoading);
    
  } catch (e) {
    console.error('Test error:', e.message);
  }
  
  await browser.close();
  console.log('\n=== DONE ===');
})();
