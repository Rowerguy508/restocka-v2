const { chromium } = require('playwright');

const TEST_USERS = [
  { email: 'test1@restocka.app', password: 'TestPass123!', role: 'owner' },
  { email: 'test2@restocka.app', password: 'TestPass123!', role: 'manager' },
  { email: 'test3@restocka.app', password: 'TestPass123!', role: 'viewer' },
  { email: 'demo@restocka.app', password: 'DemoPass123!', role: 'owner' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  console.log('=== RESTOCKA COMPREHENSIVE LOGIN TESTING ===\n');
  
  for (let i = 0; i < TEST_USERS.length; i++) {
    const user = TEST_USERS[i];
    const testResult = { email: user.email, role: user.role, signup: null, login: null, redirect: null, errors: [] };
    
    console.log(`\n--- TEST ${i + 1}: ${user.email} (${user.role}) ---`);
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Track errors
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        testResult.errors.push(msg.text());
      }
    });
    page.on('pageerror', err => testResult.errors.push(err.message));
    
    // STEP 1: Try to SIGNUP
    console.log('1. Signing up...');
    await page.goto('https://restocka.app/login', { waitUntil: 'networkidle' });
    
    // Click "No account? Create one" 
    const signupLink = await page.$('button:has-text("No account")');
    if (signupLink) {
      await signupLink.click();
      await page.waitForTimeout(500);
    }
    
    // Fill signup form
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.fill('#confirmPassword', user.password);
    
    // Submit
    const submitBtn = await page.$('button[type="submit"]:has-text("Create")');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
    }
    
    // Check result
    const signupUrl = page.url();
    const signupBody = await page.evaluate(() => document.body?.innerText?.substring(0, 200) || 'EMPTY');
    
    if (signupUrl.includes('/onboarding') || signupBody.includes('Check your email')) {
      testResult.signup = 'SUCCESS';
      console.log('   ✓ Signup successful');
    } else if (signupBody.includes('already registered')) {
      testResult.signup = 'EXISTS';
      console.log('   ⚠ User exists, trying login...');
    } else if (signupBody.includes('email') && signupBody.includes('confirm')) {
      testResult.signup = 'EMAIL_SENT';
      console.log('   ✓ Confirmation email sent');
    } else {
      testResult.signup = signupBody.substring(0, 50);
      console.log('   Signup result:', testResult.signup);
    }
    
    // STEP 2: Try LOGIN (if signup exists or fails)
    console.log('2. Trying login...');
    await page.goto('https://restocka.app/login', { waitUntil: 'networkidle' });
    
    // Make sure we're on login mode
    const loginBtn = await page.$('button:has-text("Sign in")');
    if (!loginBtn) {
      // Click to switch back to login
      const switchBtn = await page.$('button:has-text("have account")');
      if (switchBtn) await switchBtn.click();
      await page.waitForTimeout(500);
    }
    
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    
    const signinBtn = await page.$('button[type="submit"]:has-text("Sign")');
    if (signinBtn) {
      await signinBtn.click();
      
      // Wait for redirect
      for (let w = 0; w < 10; w++) {
        await page.waitForTimeout(1000);
        const currentUrl = page.url();
        const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 100) || 'EMPTY');
        
        if (currentUrl.includes('/app') || currentUrl.includes('/dashboard')) {
          testResult.login = 'SUCCESS';
          testResult.redirect = currentUrl;
          console.log('   ✓ Login successful! Redirected to:', currentUrl);
          break;
        }
        
        if (bodyText.includes('Incorrect') || bodyText.includes('invalid') || bodyText.includes('password')) {
          testResult.login = 'FAILED';
          console.log('   ✗ Login failed:', bodyText.substring(0, 50));
          break;
        }
        
        if (w === 9) {
          testResult.login = 'TIMEOUT';
          console.log('   ✗ Login timeout - still at:', currentUrl);
        }
      }
    }
    
    // STEP 3: Check what page we ended up on
    console.log('3. Final state...');
    const finalUrl = page.url();
    const finalBody = await page.evaluate(() => ({
      text: document.body?.innerText?.substring(0, 150) || 'EMPTY',
      hasNav: !!document.querySelector('nav'),
      hasSidebar: !!document.querySelector('[class*="sidebar"]'),
      hasContent: document.body?.innerText?.length > 50
    }));
    
    console.log('   URL:', finalUrl);
    console.log('   Has navigation:', finalBody.hasNav);
    console.log('   Has sidebar:', finalBody.hasSidebar);
    console.log('   Has content:', finalBody.hasContent);
    
    results.push(testResult);
    
    await context.close();
  }
  
  // SUMMARY
  console.log('\n=== TEST SUMMARY ===\n');
  console.log('Email'.padEnd(25) + 'Role'.padEnd(10) + 'Signup'.padEnd(15) + 'Login'.padEnd(15) + 'URL');
  console.log('-'.repeat(80));
  
  for (const r of results) {
    console.log(
      r.email.substring(0, 24).padEnd(25) +
      r.role.padEnd(10) +
      (r.signup || 'N/A').toString().substring(0, 14).padEnd(15) +
      (r.login || 'N/A').toString().substring(0, 14).padEnd(15) +
      (r.redirect || r.login === 'SUCCESS' ? 'YES' : '')
    );
  }
  
  const successCount = results.filter(r => r.login === 'SUCCESS').length;
  console.log(`\n✓ Successful logins: ${successCount}/${results.length}`);
  
  if (successCount === 0) {
    console.log('\n⚠ All logins failed - checking for common issues...');
    console.log('Possible causes:');
    console.log('1. Email confirmation required');
    console.log('2. Password validation too strict');
    console.log('3. Supabase auth config issue');
    console.log('4. Rate limiting on signup/login');
  }
  
  console.log('\n=== TEST COMPLETE ===');
  await browser.close();
})();
