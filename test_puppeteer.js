import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Capture page errors
  let errorFound = false;
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.toString());
    errorFound = true;
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });

  await page.goto('https://www.kapora.online', { waitUntil: 'networkidle2' });
  console.log('Page loaded');
  
  // Click on the login link (Giriş Yap / Ücretsiz Başla)
  // Usually it has href="/auth"
  await page.click('a[href="/auth"]');
  console.log('Clicked /auth link');
  
  await page.waitForTimeout(2000); // Wait to see if error boundary renders
  
  const bodyText = await page.evaluate(() => document.body.innerText);
  if (bodyText.includes('Unexpected Application Error')) {
    console.log('FAILED: Application error displayed on screen!');
    errorFound = true;
  } else if (bodyText.includes('Tekrar Hoşgeldiniz')) {
    console.log('SUCCESS: Navigated to Auth page successfully.');
  } else {
    console.log('UNKNOWN STATE. Body text snapshot:');
    console.log(bodyText.substring(0, 200));
  }

  await browser.close();
  process.exit(errorFound ? 1 : 0);
})();
