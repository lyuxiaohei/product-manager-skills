# -*- coding: utf-8 -*-
"""
操作手册截图脚本模板
修改URL、USER、PWD和页面操作逻辑以适应目标系统
"""
from playwright.sync_api import sync_playwright
import os

# ===== 配置区域 =====
output_dir = "screenshots/manual"
os.makedirs(output_dir, exist_ok=True)

URL = "http://your-app-url/login"
USER = "username"
PWD = "password"

counter = 1

def save_img(page, name):
    """保存截图"""
    global counter
    path = f"{output_dir}/{counter:02d}_{name}.png"
    page.screenshot(path=path, full_page=True)
    print(f"Saved: {path}")
    counter += 1
    return path

def click_by_text(page, text, tag='button'):
    """通过文本点击元素"""
    return page.evaluate(f'''() => {{
        const elements = document.querySelectorAll('{tag}');
        for (let el of elements) {{
            if (el.innerText.includes('{text}')) {{
                el.click();
                return true;
            }}
        }}
        return false;
    }}''')

def expand_menu(page, menu_text):
    """展开菜单"""
    page.evaluate(f'''() => {{
        const items = document.querySelectorAll('.ant-menu-submenu-title, li');
        for (let item of items) {{
            if (item.innerText.includes('{menu_text}')) {{
                item.click();
                return;
            }}
        }}
    }}''')

def click_submenu(page, submenu_text):
    """点击子菜单"""
    page.evaluate(f'''() => {{
        const items = document.querySelectorAll('.ant-menu-item');
        for (let item of items) {{
            if (item.innerText.includes('{submenu_text}')) {{
                item.click();
                return;
            }}
        }}
    }}''')

# ===== 主流程 =====
with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=500)
    context = browser.new_context(viewport={'width': 1920, 'height': 1080})
    page = context.new_page()

    print("=== Step 1: 打开登录页面 ===")
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(2000)
    save_img(page, "01_login_page")

    print("=== Step 2: 切换密码登录 ===")
    tabs = page.locator('.ant-tabs-tab')
    if tabs.count() >= 2:
        tabs.nth(1).click()
        page.wait_for_timeout(1000)
        save_img(page, "02_password_tab")

    print("=== Step 3: 填写账号密码 ===")
    page.locator('input[type="text"]').first.fill(USER)
    page.locator('input[type="password"]').first.fill(PWD)
    save_img(page, "03_credentials")

    print("=== Step 4: 点击登录 ===")
    click_by_text(page, '登录', 'button')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    save_img(page, "04_after_login")

    if 'login' not in page.url:
        print("登录成功!")

        # ===== 添加你的截图逻辑 =====
        # 示例：展开菜单
        print("\n=== Step 5: 展开功能菜单 ===")
        expand_menu(page, '功能模块')
        page.wait_for_timeout(1500)
        save_img(page, "05_menu_expanded")

        # 示例：进入子页面
        print("\n=== Step 6: 进入功能页面 ===")
        click_submenu(page, '功能列表')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)
        save_img(page, "06_function_list")

        # 示例：截取操作弹窗
        if page.locator('table').count() > 0:
            print("\n=== Step 7: 截取操作弹窗 ===")
            btn = page.locator('table').locator('button:has-text("操作")').first
            if btn.count() > 0:
                btn.click()
                page.wait_for_timeout(2000)
                if page.locator('[role="dialog"], .ant-modal').count() > 0:
                    save_img(page, "07_operation_dialog")
                page.keyboard.press("Escape")
                page.wait_for_timeout(500)

    else:
        print("登录失败!")
        save_img(page, "login_failed")

    browser.close()
    print(f"\n完成: 共 {counter - 1} 张截图")