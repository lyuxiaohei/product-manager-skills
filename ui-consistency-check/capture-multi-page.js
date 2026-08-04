const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const LOGIN_URL = process.argv[2] || 'https://scmtest.hongzhao.com/boss/login';
const LOGIN_USER = process.argv[3] || 'admin';
const LOGIN_PASS = process.argv[4] || '12345678';
const OUTPUT_DIR = process.argv[5] || path.join(__dirname, 'output', 'multi-page');

const STYLE_PROPS = [
  'color', 'background-color', 'background', 'font-size', 'font-family',
  'font-weight', 'line-height', 'letter-spacing',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'border', 'border-color', 'border-width', 'border-style', 'border-radius',
  'box-shadow', 'text-shadow', 'opacity',
  'width', 'height', 'display', 'flex-direction', 'align-items', 'justify-content',
  'gap', 'text-align', 'cursor', 'z-index', 'position'
];

async function login(page) {
  console.log('[multi] 正在登录...');
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 切换到密码登录
  const pwdTab = await page.$('.ant-tabs-tab:has-text("密码登录"), .ant-tabs-tab:has-text("密码")');
  if (pwdTab) {
    await pwdTab.click();
    await page.waitForTimeout(1000);
  }

  const hasPassword = await page.$('input[type="password"]:visible');
  if (hasPassword) {
    const textInputs = await page.$$('input:visible:not([type="password"])');
    if (textInputs[0]) {
      await textInputs[0].click();
      await textInputs[0].fill(LOGIN_USER);
    }
    await hasPassword.click();
    await hasPassword.fill(LOGIN_PASS);

    const loginBtn = await page.$('button:has-text("登 录"), .ant-btn-primary');
    if (loginBtn) {
      await loginBtn.click();
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');
    }
  }

  // 检查是否登录成功
  const currentUrl = page.url();
  console.log(`[multi] 登录后 URL: ${currentUrl}`);
  return !currentUrl.includes('/login');
}

async function getMenuRoutes(page) {
  // 展开所有子菜单，收集菜单项和路由
  const routes = [];

  // 先展开所有 submenu
  const submenus = await page.$$('.ant-menu-submenu-title');
  console.log(`[multi] 找到 ${submenus.length} 个菜单分组`);

  for (let i = 0; i < submenus.length; i++) {
    try {
      await submenus[i].click();
      await page.waitForTimeout(500);
    } catch (e) {
      // ignore
    }
  }

  await page.waitForTimeout(500);

  // 收集所有菜单项
  const menuItems = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('.ant-menu-item, [class*="menu-item"], a[href*="/boss/"]').forEach(el => {
      const text = (el.innerText || '').trim();
      const href = el.getAttribute('href') || '';
      const rect = el.getBoundingClientRect();
      if (text && rect.width > 0) {
        items.push({
          text: text.substring(0, 50),
          href: href,
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          w: Math.round(rect.width),
          h: Math.round(rect.height)
        });
      }
    });
    return items;
  });

  // 去重
  const seen = new Set();
  const uniqueItems = menuItems.filter(item => {
    const key = item.text + item.href;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`[multi] 收集到 ${uniqueItems.length} 个菜单项`);
  uniqueItems.forEach(item => console.log(`  - ${item.text} | ${item.href}`));

  return uniqueItems;
}

async function capturePageData(page, pageName, outputDir) {
  const data = await page.evaluate((props) => {
    function classifyElement(el) {
      const tag = el.tagName.toLowerCase();
      const classes = el.className || '';
      const role = el.getAttribute('role') || '';
      if (tag === 'button' || role === 'button' || classes.includes('btn') || classes.includes('button')) return 'button';
      if (tag === 'a' && el.getAttribute('href')) return 'link';
      if (tag === 'input' || tag === 'textarea' || role === 'textbox') return 'input';
      if (tag === 'select' || role === 'combobox' || classes.includes('select')) return 'select';
      if (classes.includes('table') || role === 'table' || role === 'grid') return 'table';
      if (tag === 'th' || tag === 'td') return 'table-cell';
      if (classes.includes('card')) return 'card';
      if (classes.includes('tag') || classes.includes('badge')) return 'tag';
      if (classes.includes('modal') || classes.includes('dialog') || role === 'dialog') return 'modal';
      if (classes.includes('menu') || role === 'menu' || role === 'menuitem') return 'menu';
      if (classes.includes('breadcrumb') || role === 'navigation') return 'breadcrumb';
      if (classes.includes('tab') || role === 'tab') return 'tab';
      if (classes.includes('form') || classes.includes('form-item')) return 'form';
      if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') return 'heading';
      if (classes.includes('pagination')) return 'pagination';
      if (classes.includes('alert') || classes.includes('message')) return 'alert';
      return 'generic';
    }

    const results = [];
    const selector = 'button, a, input, select, textarea, h1, h2, h3, h4, h5, h6, ' +
      'table, th, td, [class*="btn"], [class*="button"], [class*="card"], ' +
      '[class*="tag"], [class*="modal"], [class*="menu"], [class*="tab"], ' +
      '[class*="form"], [class*="breadcrumb"], [class*="alert"], [class*="pagination"], ' +
      '[class*="select"], [class*="input"], [class*="table"], [role="button"], ' +
      '[role="tab"], [role="menuitem"], [role="dialog"]';

    document.querySelectorAll(selector).forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      const computed = getComputedStyle(el);
      const styles = {};
      props.forEach(prop => { styles[prop] = computed.getPropertyValue(prop); });

      results.push({
        tag: el.tagName.toLowerCase(),
        class: el.className?.substring(0, 300) || '',
        text: (el.innerText || '').substring(0, 200).replace(/\s+/g, ' ').trim(),
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
        styles,
        category: classifyElement(el)
      });
    });
    return results;
  }, STYLE_PROPS);

  const screenshotPath = path.join(outputDir, `${pageName}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  return { pageName, url: page.url(), title: await page.title(), elements: data, screenshot: screenshotPath };
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'zh-CN' });
  const page = await context.newPage();

  try {
    const loggedIn = await login(page);
    if (!loggedIn) {
      console.log('[multi] 登录可能失败, 继续尝试...');
    }

    // 获取菜单路由
    const menuItems = await getMenuRoutes(page);

    // 采集每个页面
    const allPageData = [];
    const pagesToVisit = menuItems.filter(m => m.text && m.text.length > 1);

    for (let i = 0; i < pagesToVisit.length; i++) {
      const item = pagesToVisit[i];
      console.log(`\n[multi] [${i + 1}/${pagesToVisit.length}] 采集页面: ${item.text}`);

      try {
        // 点击菜单项
        const clicked = await page.evaluate((text) => {
          const items = document.querySelectorAll('.ant-menu-item, [class*="menu-item"], a[href*="/boss/"]');
          for (const el of items) {
            if ((el.innerText || '').trim() === text) {
              el.click();
              return true;
            }
          }
          return false;
        }, item.text);

        if (clicked) {
          await page.waitForTimeout(2000);
          await page.waitForLoadState('networkidle');

          const safeName = item.text.replace(/[\/\\:*?"<>|]/g, '_');
          const pageData = await capturePageData(page, safeName, OUTPUT_DIR);
          allPageData.push(pageData);
          console.log(`[multi]   -> ${pageData.elements.length} 个元素`);
        } else {
          console.log(`[multi]   -> 无法点击`);
        }
      } catch (err) {
        console.log(`[multi]   -> 错误: ${err.message}`);
      }
    }

    // 保存汇总数据
    const summaryPath = path.join(OUTPUT_DIR, 'all-pages-data.json');
    fs.writeFileSync(summaryPath, JSON.stringify(allPageData, null, 2));
    console.log(`\n[multi] ✅ 完成! 共采集 ${allPageData.length} 个页面`);
    allPageData.forEach(d => console.log(`  ${d.pageName}: ${d.elements.length} 个元素`));

    return allPageData;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch(err => { console.error('[multi] ❌', err.message); process.exit(1); });
}

module.exports = { main, login, getMenuRoutes, capturePageData };