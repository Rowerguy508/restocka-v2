const { chromium } = require('playwright');
(async () => {
  console.log('Starting test...');
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  
  console.log('Going to login page...');
  await p.goto('https://restocka.app/login', { 
    waitUntil: 'domcontentloaded', 
    timeout: 30000 
  });
  console.log('Page loaded');
  
  await p.waitForTimeout(2000);
  
  const email = await p.locator('input[id="email"]').isVisible();
  console.log('Email field visible:', email);
  
  const signupBtn = await p.locator("button:has-text(\"Don't have an account? Sign up\")").isVisible();
  console.log('Signup button visible:', signupBtn);
  
  if (signupBtn) {
    console.log('Clicking signup...');
    await p.locator("button:has-text(\"Don't have an account? Sign up\")").click();
    await p.waitForTimeout(2000);
    
    const confirm = await p.locator('#confirmPassword').isVisible();
    console.log('Confirm password visible after click:', confirm);
  }
  
  await b.close();
  console.log('Test complete!');
})().catch(e => console.error('Error:', e.message));
