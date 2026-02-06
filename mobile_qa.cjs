const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // Test iPhone 17 Pro Max viewport
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true
  });
  
  const page = await context.newPage();
  const errors = [];
  const consoleMessages = [];
  
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push('PAGE ERROR: ' + err.message);
  });
  
  console.log('=== RESTOCKA MOBILE QA (iPhone 17 Pro Max) ===\n');
  
  // Test 1: Home page mobile
  console.log('1. Testing HOME on mobile...');
  await page.goto('https://restocka.app', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  
  const homeTitle = await page.title();
  const homeContent = await page.content();
  const homeBodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 100));
  
  console.log('   Title: ' + homeTitle);
  console.log('   Has content: ' + (homeBodyText?.length > 0 ? 'YES' : 'NO'));
  console.log('   Body text: ' + (homeBodyText || 'EMPTY'));
  
  // Check for blank page indicators
  const bodyBg = await page.evaluate(() => {
    const body = document.body;
    if (!body) return 'NO BODY';
    const styles = window.getComputedStyle(body);
    return 'bg: ' + styles.backgroundColor + ', height: ' + body.clientHeight + 'px';
  });
  console.log('   Body: ' + bodyBg);
  
  // Test 2: Login flow
  console.log('\n2. Testing LOGIN flow...');
  await page.goto('https://restocka.app/login', { waitUntil: 'networkidle', timeout: 15000 });
  
  const emailExists = await page.$('input[type="email"]');
  const submitExists = await page.$('button[type="submit"]');
  
  console.log('   Email input: ' + (emailExists ? 'YES' : 'NO'));
  console.log('   Submit button: ' + (submitExists ? 'YES' : 'NO'));
  
  // Test 3: Simulate login and redirect
  console.log('\n3. Simulating login...');
  
  if (emailExists) {
    await emailExists.fill('test@restocka.app');
  }
  
  if (submitExists) {
    await submitExists.click();
    await page.waitForTimeout(3000);
    
    console.log('   After submit URL: ' + page.url());
    console.log('   After submit body: ' + (await page.evaluate(() => document.body?.innerText?.substring(0, 100))));
  }
  
  // Test 4: Dashboard after "login"
  console.log('\n4. Testing DASHBOARD (post-login simulation)...');
  await page.goto('https://restocka.app/dashboard', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  
  const dashUrl = page.url();
  const dashContent = await page.evaluate(() => {
    const body = document.body;
    return {
      hasBody: !!body,
      textLength: body?.innerText?.length || 0,
      visible: body?.offsetHeight > 0,
      html: body?.innerHTML?.substring(0, 200)
    };
  });
  
  console.log('   URL: ' + dashUrl);
  console.log('   Has body: ' + (dashContent.hasBody ? 'YES' : 'NO'));
  console.log('   Text length: ' + dashContent.textLength);
  console.log('   Visible: ' + (dashContent.visible ? 'YES' : 'NO'));
  console.log('   HTML preview: ' + (dashContent.html || 'NONE'));
  
  // Test 5: Check for common mobile issues
  console.log('\n5. Checking mobile-specific issues...');
  
  const mobileChecks = await page.evaluate(() => {
    const issues = [];
    
    // Check viewport meta
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) issues.push('Missing viewport meta');
    
    // Check for canvas/WebGL
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const canvasVisible = canvas.offsetHeight > 0;
      if (!canvasVisible) issues.push('Canvas not visible');
    }
    
    // Check for transparent elements
    const allDivs = document.querySelectorAll('div');
    const transparentDivs = [];
    allDivs.forEach((div, i) => {
      if (i > 50) return; // Check first 50 only
      const style = window.getComputedStyle(div);
      if (style.opacity === '0' || style.visibility === 'hidden') {
        transparentDivs.push(i);
      }
    });
    if (transparentDivs.length > 0) {
      issues.push(transparentDivs.length + ' transparent/hidden divs');
    }
    
    // Check for infinite loading
    const loaders = document.querySelectorAll('[class*="loader"], [class*="spinner"], [class*="loading"]');
    if (loaders.length > 0) {
      issues.push(loaders.length + ' loading indicators found');
    }
    
    return issues;
  });
  
  console.log('   Issues found: ' + (mobileChecks.length > 0 ? mobileChecks.join(', ') : 'NONE'));
  
  // Test 6: Console error analysis
  console.log('\n6. Console Analysis...');
  const errorCount = errors.filter(e => !e.includes('favicon') && !e.includes('ResizeObserver')).length;
  console.log('   Errors: ' + errorCount);
  
  if (errors.length > 0) {
    [...new Set(errors)].slice(0, 5).forEach((e, i) => {
      console.log('   ' + (i+1) + '. ' + e.substring(0, 100));
    });
  }
  
  // SUMMARY
  console.log('\n=== MOBILE QA SUMMARY ===\n');
  console.log('Device: iPhone 17 Pro Max (430x932)');
  console.log('Home Page: ' + (homeBodyText?.length > 0 ? 'OK' : 'BLANK'));
  console.log('Login Form: ' + (emailExists && submitExists ? 'OK' : 'MISSING'));
  console.log('Dashboard: ' + (dashContent.textLength > 0 ? 'OK (' + dashContent.textLength + ' chars)' : 'BLANK'));
  console.log('Mobile Issues: ' + (mobileChecks.length > 0 ? mobileChecks.join('; ') : 'NONE'));
  console.log('Console Errors: ' + errorCount);
  
  if (dashContent.textLength === 0 || homeBodyText?.length === 0) {
    console.log('\n⚠️  BLANK PAGE DETECTED - Root cause analysis needed');
  }
  
  console.log('\n=== QA COMPLETE ===');
  
  await browser.close();
})();
