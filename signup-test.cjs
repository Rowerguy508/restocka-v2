const { chromium } = require('playwright');
(async () => {
  console.log('=== Signup Flow Test ===\n');
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  
  // Clear state
  await p.goto('https://restocka.app/login', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => localStorage.clear());
  await p.evaluate(() => sessionStorage.clear());
  
  console.log('1. Going to login page...');
  await p.goto('https://restocka.app/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(2000);
  
  console.log('2. Clicking signup toggle...');
  await p.locator("button:has-text(\"Don't have an account? Sign up\")").click();
  await p.waitForTimeout(2000);
  
  console.log('3. Filling signup form...');
  const email = `test${Date.now()}@restocka.app`;
  console.log('   Email:', email);
  
  await p.fill('input[id="email"]', email);
  await p.fill('input[id="password"]', 'TestPass123!');
  await p.fill('#confirmPassword', 'TestPass123!');
  
  console.log('4. Submitting...');
  await p.locator('button[type="submit"]').click();
  
  console.log('5. Waiting for response (20s)...');
  await p.waitForTimeout(20000);
  
  const url = p.url();
  console.log('\n=== RESULT ===');
  console.log('Final URL:', url);
  
  if (url.includes('/app')) {
    console.log('✅ SIGNUP SUCCESSFUL - Redirected to /app\n');
    
    // Check dashboard content
    console.log('6. Checking dashboard...');
    await p.waitForTimeout(3000);
    
    const bodyText = await p.evaluate(() => document.body.innerText);
    console.log('   Body text length:', bodyText.length);
    console.log('   Contains "ReStocka":', bodyText.includes('ReStocka'));
    console.log('   Contains "Bienvenido":', bodyText.includes('Bienvenido'));
    console.log('   Preview:', bodyText.substring(0, 100));
  } else {
    console.log('⚠️  Signup may have failed. URL:', url);
  }
  
  await b.close();
  console.log('\n=== COMPLETE ===');
})().catch(e => console.error('Error:', e.message));
