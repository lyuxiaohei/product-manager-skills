const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('https://scmtest.hongzhao.com/boss/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Print all buttons, tabs, links on the page
  const elements = await page.evaluate(() => {
    const result = [];
    document.querySelectorAll('button, a, [role="tab"], .ant-tabs-tab, span[class*="tab"], div[class*="tab"], form').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        result.push({
          tag: el.tagName,
          text: (el.innerText || '').substring(0, 100).replace(/\s+/g, ' '),
          class: el.className?.substring(0, 200),
          id: el.id,
          href: el.getAttribute('href'),
          role: el.getAttribute('role'),
          rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) }
        });
      }
    });
    return result;
  });
  
  console.log('=== PAGE ELEMENTS ===');
  elements.forEach((el, i) => {
    console.log(`[${i}] ${el.tag} class="${el.class.substring(0, 80)}" text="${el.text.substring(0, 60)}" rect=(${el.rect.x},${el.rect.y} ${el.rect.w}x${el.rect.h})`);
  });
  
  const inputs = await page.$$eval('input', els => els.map(e => ({
    type: e.type, placeholder: e.placeholder, id: e.id, name: e.name
  })));
  console.log('\n=== INPUTS ===');
  console.log(JSON.stringify(inputs, null, 2));
  
  await page.screenshot({ path: require('path').join(__dirname, 'output', 'login-explore.png'), fullPage: true });
  console.log('\nScreenshot saved');
  
  await browser.close();
})();
