const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const allErrors = [];
  
  page.on('console', msg => { 
    if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('ResizeObserver')) {
      allErrors.push({page: page.url(), error: msg.text()});
    }
  });
  page.on('pageerror', err => allErrors.push({page: page.url(), error: err.message}));
  
  const routes = [
    {path: '/', name: 'HOME'},
    {path: '/login', name: 'LOGIN'},
    {path: '/dashboard', name: 'DASHBOARD'},
    {path: '/inventory', name: 'INVENTORY'},
    {path: '/orders', name: 'ORDERS'},
    {path: '/suppliers', name: 'SUPPLIERS'},
    {path: '/settings', name: 'SETTINGS'}
  ];
  
  console.log('=== RESTOCKA COMPREHENSIVE QA ===\n');
  
  for (const r of routes) {
    try {
      await page.goto('https://restocka.app' + r.path, {waitUntil: 'domcontentloaded', timeout: 15000});
      await page.waitForTimeout(500);
      console.log(r.name + ': ' + page.url());
    } catch(e) {
      console.log(r.name + ': FAILED - ' + e.message.substring(0,50));
    }
  }
  
  // Check for key elements
  console.log('\n=== ELEMENT CHECKS ===\n');
  
  await page.goto('https://restocka.app/login', {waitUntil: 'networkidle'});
  const email = await page.$('input[type="email"]');
  const submit = await page.$('button[type="submit"]');
  console.log('Login: Email=' + (email ? 'YES' : 'NO') + ', Submit=' + (submit ? 'YES' : 'NO'));
  
  await page.goto('https://restocka.app/dashboard', {waitUntil: 'networkidle', timeout: 20000});
  const cards = await page.$$('[class*="card"]');
  console.log('Dashboard: ' + cards.length + ' cards');
  
  await page.goto('https://restocka.app/inventory', {waitUntil: 'networkidle', timeout: 20000});
  const tables = await page.$$('table, [class*="table"]');
  const addBtn = await page.$('button[class*="add"], button[class*="new"]');
  console.log('Inventory: ' + tables.length + ' tables, Add button=' + (addBtn ? 'YES' : 'NO'));
  
  console.log('\n=== ERRORS ===');
  if (allErrors.length === 0) {
    console.log('✓ No console errors detected!');
  } else {
    console.log('Found ' + allErrors.length + ' errors:');
    [...new Set(allErrors.map(e => e.error.substring(0,100)))].slice(0,5).forEach((e,i) => console.log(i+1 + '. ' + e));
  }
  
  console.log('\n=== QA COMPLETE ===');
  await browser.close();
})();
