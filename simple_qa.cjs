const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];

  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  console.log('=== RESTOCKA COMPREHENSIVE QA ===\n');

  const pages = [
    { url: 'https://restocka.app/', name: 'HOME' },
    { url: 'https://restocka.app/login', name: 'LOGIN' },
    { url: 'https://restocka.app/dashboard', name: 'DASHBOARD' },
    { url: 'https://restocka.app/inventory', name: 'INVENTORY' },
    { url: 'https://restocka.app/orders', name: 'ORDERS' },
    { url: 'https://restocka.app/settings', name: 'SETTINGS' },
  ];

  for (const p of pages) {
    try {
      await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(500);
      const text = await page.evaluate(() => document.body?.innerText?.substring(0, 50));
      console.log(`${p.name}: ${text?.length > 0 ? 'OK' : 'BLANK'} (${text?.length || 0} chars)`);
    } catch (e) {
      console.log(`${p.name}: ERROR - ${e.message.substring(0, 30)}`);
    }
  }

  // Mobile viewport test
  console.log('\n=== MOBILE VIEWPORT (iPhone 17 Pro Max) ===');
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto('https://restocka.app/dashboard', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1000);
  
  const mobileContent = await page.evaluate(() => document.body?.innerText?.length);
  console.log(`Dashboard on mobile: ${mobileContent > 0 ? 'OK' : 'BLANK'} (${mobileContent} chars)`);

  // Check Supabase
  console.log('\n=== SUPABASE CONNECTIVITY ===');
  const supabaseCheck = await page.request.get('https://zsewmpjceuomivvbyjgl.supabase.co/rest/v1/memberships?limit=1', {
    headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZXdtcGpjZXVvbWl2dmJ5amdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NzM3MTcsImV4cCI6MjA4MzA0OTcxN30.vPwuXwWTr5VkNz-IR-HxN9qp0A50ncETU0vL4SnrckE' }
  }).catch(() => ({ ok: false }));
  console.log(`Supabase API: ${supabaseCheck.ok ? 'REACHABLE' : 'NOT REACHABLE'}`);

  const criticalErrors = errors.filter(e => !e.includes('favicon') && !e.includes('ResizeObserver'));
  console.log(`\n=== ERRORS ===`);
  console.log(`Total: ${errors.length}, Critical: ${criticalErrors.length}`);

  if (criticalErrors.length > 0) {
    [...new Set(criticalErrors)].slice(0, 3).forEach((e, i) => console.log(`${i+1}. ${e.substring(0, 80)}`));
  }

  console.log('\n=== QA COMPLETE ===');
  await browser.close();
})();
