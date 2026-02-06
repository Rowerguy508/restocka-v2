const { chromium, firefox, webkit } = require('playwright');

(async () => {
  const browsers = [
    { name: 'Chrome (Desktop)', browser: chromium, viewport: { width: 1920, height: 1080 } },
    { name: 'Chrome (Mobile)', browser: chromium, viewport: { width: 390, height: 844 } },
    { name: 'Firefox (Desktop)', browser: firefox, viewport: { width: 1366, height: 768 } },
    { name: 'Safari (Desktop)', browser: webkit, viewport: { width: 1280, height: 800 } },
    { name: 'Edge (Desktop)', browser: chromium, viewport: { width: 1440,  height: 900 } },
  ];

  const testPages = [
    { path: '/', name: 'HOME' },
    { path: '/login', name: 'LOGIN' },
    { path: '/dashboard', name: 'DASHBOARD' },
    { path: '/inventory', name: 'INVENTORY' },
    { path: '/orders', name: 'ORDERS' },
    { path: '/settings', name: 'SETTINGS' },
  ];

  const results = {
    summary: {},
    details: [],
    errors: []
  };

  console.log('=== RESTOCKA CROSS-BROWSER QA ===\n');

  for (const b of browsers) {
    console.log(`Testing ${b.name}...`);
    const browser = await b.browser.launch({ headless: true });
    const context = await browser.newContext({ viewport: b.viewport });
    const page = await context.newPage();
    
    const browserErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        browserErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', err => {
      browserErrors.push(err.message);
    });

    let pageCount = 0;
    for (const p of testPages) {
      try {
        await page.goto('https://restocka.app' + p.path, { 
          waitUntil: 'domcontentloaded', 
          timeout: 15000 
        });
        await page.waitForTimeout(500);
        
        const hasContent = await page.evaluate(() => {
          const body = document.body;
          return body && body.innerText && body.innerText.length > 10;
        });
        
        results.details.push({
          browser: b.name,
          page: p.name,
          status: hasContent ? 'PASS' : 'FAIL',
          errors: browserErrors.length
        });
        
        pageCount++;
      } catch (e) {
        results.details.push({
          browser: b.name,
          page: p.name,
          status: 'ERROR',
          errors: e.message.substring(0, 50)
        });
      }
    }
    
    results.summary[b.name] = {
      total: pageCount,
      errors: browserErrors.length
    };
    
    console.log(`   ✓ ${pageCount}/${testPages.length} pages, ${browserErrors.length} errors`);
    await browser.close();
  }

  // Print results
  console.log('\n=== RESULTS SUMMARY ===\n');
  
  for (const [browser, data] of Object.entries(results.summary)) {
    console.log(`${browser}: ${data.total}/${testPages.length} pages, ${data.errors} errors`);
  }
  
  const fails = results.details.filter(d => d.status === 'FAIL');
  if (fails.length > 0) {
    console.log('\n=== FAILURES ===');
    fails.forEach(f => {
      console.log(`${f.browser} - ${f.page}: ${f.errors} errors`);
    });
  }
  
  const uniqueErrors = [...new Set(results.errors)];
  if (uniqueErrors.length > 0) {
    console.log('\n=== UNIQUE ERRORS ===');
    uniqueErrors.slice(0, 5).forEach((e, i) => {
      console.log(`${i+1}. ${e.substring(0, 100)}`);
    });
  }

  console.log('\n=== QA COMPLETE ===');
})();
