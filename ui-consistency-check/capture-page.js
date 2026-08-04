const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TARGET_URL = process.argv[2] || 'http://192.168.18.64/boss/system-setting/mall';
const OUTPUT_DIR = process.argv[3] || path.join(__dirname, 'output');
const LOGIN_URL = process.argv[4] || '';
const LOGIN_USER = process.argv[5] || '';
const LOGIN_PASS = process.argv[6] || '';

// 需要提取计算样式的 CSS 属性
const STYLE_PROPS = [
  'color', 'background-color', 'background', 'font-size', 'font-family',
  'font-weight', 'line-height', 'letter-spacing',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-color', 'border-width', 'border-style', 'border-radius',
  'box-shadow', 'text-shadow', 'opacity',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'display', 'flex-direction', 'align-items', 'justify-content',
  'gap', 'row-gap', 'column-gap',
  'text-align', 'text-decoration', 'text-transform',
  'white-space', 'overflow', 'text-overflow',
  'cursor', 'pointer-events', 'z-index', 'position'
];

// 元素分类规则
function classifyElement(el) {
  const tag = el.tagName.toLowerCase();
  const classes = el.className || '';
  const role = el.getAttribute('role') || '';
  const type = (el.getAttribute('type') || '').toLowerCase();

  if (tag === 'button' || role === 'button' || classes.includes('btn') || classes.includes('button')) return 'button';
  if (tag === 'a' && el.getAttribute('href')) return 'link';
  if (tag === 'input' || tag === 'textarea' || role === 'textbox' || role === 'searchbox') return 'input';
  if (tag === 'select' || role === 'combobox' || role === 'listbox' || classes.includes('select')) return 'select';
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
  if (classes.includes('alert') || classes.includes('message') || classes.includes('notification')) return 'alert';
  if (classes.includes('spin') || classes.includes('loading') || classes.includes('skeleton')) return 'loading';
  if (classes.includes('tooltip') || classes.includes('popover')) return 'tooltip';
  return 'generic';
}

async function capturePage(url, outputDir, loginUrl, loginUser, loginPass) {
  console.log(`[capture] 启动浏览器...`);
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'zh-CN',
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  try {
    // 如果提供了登录信息，先登录
    if (loginUrl && loginUser && loginPass) {
      console.log(`[capture] 先登录: ${loginUrl}`);
      await page.goto(loginUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);

      await page.screenshot({ path: path.join(outputDir, 'screenshot-login.png'), fullPage: true });
      console.log(`[capture] 登录页截图已保存`);

      // 1. 先尝试切换到密码登录 Tab
      const pwdTab = await page.$('.ant-tabs-tab:has-text("密码登录"), .ant-tabs-tab:has-text("密码"), [role="tab"]:has-text("密码")');
      if (pwdTab) {
        console.log(`[capture] 切换到密码登录 Tab`);
        await pwdTab.click();
        await page.waitForTimeout(1000);
      }

      // 2. 检测当前表单类型
      const hasPassword = await page.$('input[type="password"]:visible');
      const hasCode = await page.$('input[placeholder*="验证码"]:visible');

      if (hasPassword) {
        // === 密码登录 ===
        console.log(`[capture] 密码登录模式`);
        // 密码登录下第一个输入框可能是手机号或用户名
        const textInputs = await page.$$('input:visible:not([type="password"])');
        const userInput = textInputs[0];
        if (userInput) {
          await userInput.click();
          await userInput.fill(loginUser);
        }
        await hasPassword.click();
        await hasPassword.fill(loginPass);
        console.log(`[capture] 已填写: ${loginUser} / ***`);

        const loginBtn = await page.$('button:has-text("登 录"), .ant-btn-primary');
        if (loginBtn) {
          await loginBtn.click();
          console.log(`[capture] 已点击登录`);
          await page.waitForTimeout(3000);
          await page.waitForLoadState('networkidle');
        } else {
          await hasPassword.press('Enter');
          await page.waitForTimeout(3000);
          await page.waitForLoadState('networkidle');
        }
      } else if (hasCode) {
        // === 验证码登录 ===
        console.log(`[capture] 验证码登录模式`);
        const phoneInput = await page.$('input[placeholder*="手机"]:visible');
        const codeInput = await page.$('input[placeholder*="验证码"]:visible');
        if (phoneInput) {
          await phoneInput.click();
          await phoneInput.fill(loginUser);
        }
        const getCodeBtn = await page.$('button:has-text("获取验证码"), span:has-text("获取验证码")');
        if (getCodeBtn) {
          await getCodeBtn.click();
          console.log(`[capture] 已点击获取验证码`);
          await page.waitForTimeout(1000);
        }
        if (codeInput) {
          await codeInput.click();
          await codeInput.fill(loginPass);
        }
        const loginBtn = await page.$('button:has-text("登 录"), .ant-btn-primary');
        if (loginBtn) {
          await loginBtn.click();
          await page.waitForTimeout(3000);
          await page.waitForLoadState('networkidle');
        }
      } else {
        console.log(`[capture] 未找到登录表单, 可能已登录或页面异常`);
      }
    }

    console.log(`[capture] 导航到: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // 等待 SPA 渲染完成
    await page.waitForTimeout(3000);

    // 关闭可能的弹窗/引导
    const closeSelectors = ['.ant-modal-close', '.ant-drawer-close', '.ant-notification-close', '[aria-label="Close"]'];
    for (const sel of closeSelectors) {
      const btn = await page.$(sel);
      if (btn) {
        try { await btn.click(); await page.waitForTimeout(500); } catch (e) {}
      }
    }

    const title = await page.title();
    console.log(`[capture] 页面标题: ${title}`);

    // 获取页面尺寸
    const pageSize = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight
    }));

    // 截取全页截图
    const screenshotPath = path.join(outputDir, 'screenshot-full.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`[capture] 全页截图保存: ${screenshotPath}`);

    // 截取视口截图
    const vpScreenshotPath = path.join(outputDir, 'screenshot-viewport.png');
    await page.screenshot({ path: vpScreenshotPath, fullPage: false });
    console.log(`[capture] 视口截图保存: ${vpScreenshotPath}`);

    // 提取 CSS 自定义属性（设计 token）
    const cssVariables = await page.evaluate(() => {
      const vars = {};
      const styles = getComputedStyle(document.documentElement);
      for (let i = 0; i < styles.length; i++) {
        const prop = styles[i];
        if (prop.startsWith('--')) {
          vars[prop] = styles.getPropertyValue(prop).trim();
        }
      }
      return vars;
    });

    // 提取所有可见元素及其计算样式
    const elements = await page.evaluate((styleProps) => {
      function classifyElement(el) {
        const tag = el.tagName.toLowerCase();
        const classes = el.className || '';
        const role = el.getAttribute('role') || '';
        const type = (el.getAttribute('type') || '').toLowerCase();
        if (tag === 'button' || role === 'button' || classes.includes('btn') || classes.includes('button')) return 'button';
        if (tag === 'a' && el.getAttribute('href')) return 'link';
        if (tag === 'input' || tag === 'textarea' || role === 'textbox' || role === 'searchbox') return 'input';
        if (tag === 'select' || role === 'combobox' || role === 'listbox' || classes.includes('select')) return 'select';
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
        if (classes.includes('alert') || classes.includes('message') || classes.includes('notification')) return 'alert';
        if (classes.includes('spin') || classes.includes('loading') || classes.includes('skeleton')) return 'loading';
        if (classes.includes('tooltip') || classes.includes('popover')) return 'tooltip';
        return 'generic';
      }
      const results = [];
      const selector = 'button, a, input, select, textarea, h1, h2, h3, h4, h5, h6, ' +
        'table, th, td, thead, tbody, [class*="btn"], [class*="button"], [class*="card"], ' +
        '[class*="tag"], [class*="modal"], [class*="menu"], [class*="tab"], ' +
        '[class*="form"], [class*="breadcrumb"], [class*="alert"], [class*="pagination"], ' +
        '[class*="select"], [class*="input"], [class*="table"], [role="button"], ' +
        '[role="tab"], [role="menuitem"], [role="dialog"], [class*="layout"], ' +
        '[class*="header"], [class*="sider"], [class*="content"], [class*="footer"]';

      document.querySelectorAll(selector).forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        const computed = getComputedStyle(el);
        const styles = {};
        styleProps.forEach(prop => {
          styles[prop] = computed.getPropertyValue(prop);
        });

        const elInfo = {
          tag: el.tagName.toLowerCase(),
          class: el.className?.substring(0, 300) || '',
          id: el.id || '',
          text: (el.innerText || el.textContent || '').substring(0, 200).replace(/\s+/g, ' ').trim(),
          role: el.getAttribute('role') || '',
          type: el.getAttribute('type') || '',
          href: el.getAttribute('href') || '',
          placeholder: el.getAttribute('placeholder') || '',
          ariaLabel: el.getAttribute('aria-label') || '',
          disabled: el.disabled || el.getAttribute('disabled') !== null,
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            top: Math.round(rect.top),
            right: Math.round(rect.right),
            bottom: Math.round(rect.bottom),
            left: Math.round(rect.left)
          },
          styles,
          category: classifyElement(el)
        };
        results.push(elInfo);
      });
      return results;
    }, STYLE_PROPS);

    console.log(`[capture] 提取到 ${elements.length} 个元素`);

    // 按类别统计
    const categoryCount = {};
    elements.forEach(el => {
      categoryCount[el.category] = (categoryCount[el.category] || 0) + 1;
    });
    console.log(`[capture] 元素分类统计:`, categoryCount);

    // 提取页面布局结构
    const layout = await page.evaluate(() => {
      const getLayout = (el, depth = 0) => {
        if (depth > 5) return null;
        const children = [];
        for (const child of el.children) {
          const rect = child.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) continue;
          const node = getLayout(child, depth + 1);
          if (node) children.push(node);
        }
        const rect = el.getBoundingClientRect();
        const computed = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          class: el.className?.substring(0, 200) || '',
          id: el.id || '',
          rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
          display: computed.display,
          flexDirection: computed.flexDirection,
          children: children.length > 0 ? children : undefined
        };
      };
      return getLayout(document.body);
    });

    const result = {
      url,
      title,
      timestamp: new Date().toISOString(),
      viewport: { width: 1920, height: 1080 },
      pageSize,
      cssVariables,
      elements,
      categoryCount,
      layout,
      screenshots: {
        full: screenshotPath,
        viewport: vpScreenshotPath
      }
    };

    // 保存采集数据
    const dataPath = path.join(outputDir, 'captured-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(result, null, 2));
    console.log(`[capture] 数据保存: ${dataPath}`);

    return result;
  } finally {
    await browser.close();
    console.log(`[capture] 浏览器已关闭`);
  }
}

// Main
if (require.main === module) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  capturePage(TARGET_URL, OUTPUT_DIR, LOGIN_URL, LOGIN_USER, LOGIN_PASS).then(result => {
    console.log(`\n[capture] ✅ 完成! 共采集 ${result.elements.length} 个元素`);
    console.log(JSON.stringify({ summary: { title: result.title, elementCount: result.elements.length, categories: result.categoryCount } }));
  }).catch(err => {
    console.error('[capture] ❌ 错误:', err.message);
    process.exit(1);
  });
}

module.exports = { capturePage, STYLE_PROPS, classifyElement };