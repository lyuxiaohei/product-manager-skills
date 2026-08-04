# Operation Manual Generator

Generate operation manuals with screenshots for web applications.

## Overview

This skill provides a complete workflow for creating professional operation manuals:
1. Environment setup
2. Automated screenshot capture with Playwright
3. Word document generation with python-docx

## Reference

See `reference/` directory for example output:
- `商品管理模块操作手册_V2.0.docx` - Complete example with 15 screenshots, cross-system workflow documentation

## Quick Start

```bash
# 1. Install dependencies
pip install playwright python-docx
playwright install chromium

# 2. Capture screenshots
python capture_screenshots.py

# 3. Generate document
python create_manual.py
```

---

## Part 1: Environment Setup

### Required Packages

```bash
pip install playwright python-docx
playwright install chromium
```

### Directory Structure

```
project/
├── screenshots/           # Screenshot output directory
│   └── manual/
├── capture_screenshots.py # Screenshot capture script
└── create_manual.py       # Document generation script
```

---

## Part 2: Screenshot Capture

### Basic Pattern

```python
from playwright.sync_api import sync_playwright
import os

output_dir = "screenshots/manual"
os.makedirs(output_dir, exist_ok=True)

counter = 1

def save_screenshot(page, name):
    global counter
    path = f"{output_dir}/{counter:02d}_{name}.png"
    page.screenshot(path=path, full_page=True)
    print(f"Saved: {path}")
    counter += 1
    return path

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=500)
    context = browser.new_context(viewport={'width': 1920, 'height': 1080})
    page = context.new_page()

    # Navigate and capture
    page.goto("http://your-app-url", wait_until='networkidle')
    page.wait_for_timeout(2000)
    save_screenshot(page, "01_login_page")

    browser.close()
```

### Key Techniques

#### 1. Wait Strategies

```python
# Wait for network idle (JS execution complete)
page.wait_for_load_state('networkidle')

# Explicit timeout
page.wait_for_timeout(2000)

# Wait for element
page.wait_for_selector('.ant-table')

# Wait for URL change
while 'login' in page.url:
    page.wait_for_timeout(1000)
```

#### 2. Element Selection (Ant Design)

```python
# Tabs
tabs = page.locator('.ant-tabs-tab')
tabs.nth(1).click()  # Click second tab

# Menu items
page.locator('.ant-menu-submenu-title').click()  # Expand submenu
page.locator('.ant-menu-item').filter(has_text="商品列表").click()

# Table actions
page.locator('table').locator('a:has-text("编辑")').first.click()

# Dialogs
page.locator('[role="dialog"], .ant-modal-content')
```

#### 3. JavaScript Evaluation (Reliable Clicking)

```python
# Click by text content (more reliable than selectors)
page.evaluate('''() => {
    const btns = document.querySelectorAll('button');
    for (let b of btns) {
        if (b.innerText.includes('登录')) {
            b.click();
            return true;
        }
    }
    return false;
}''')

# Expand menu
page.evaluate('''() => {
    const items = document.querySelectorAll('.ant-menu-submenu-title');
    for (let item of items) {
        if (item.innerText.includes('商品管理')) {
            item.click();
            return;
        }
    }
}''')
```

#### 4. Form Input

```python
# Method 1: fill() - recommended
page.locator('input[type="text"]').first.fill("username")
page.locator('input[type="password"]').first.fill("password")

# Method 2: type() with delay
page.locator('input').type("text", delay=50)

# Method 3: JavaScript (most reliable)
page.evaluate('''() => {
    document.querySelector('input[type="text"]').value = 'username';
    document.querySelector('input').dispatchEvent(new Event('input', { bubbles: true }));
}''')
```

#### 5. Handle Popups/Dialogs

```python
# Open dialog
page.locator('button:has-text("调价")').click()
page.wait_for_timeout(2000)

# Check if dialog appeared
if page.locator('[role="dialog"]').count() > 0:
    save_screenshot(page, "dialog_open")

# Close dialog
page.keyboard.press("Escape")
```

### Screenshot Naming Convention

Use consistent naming for easy document generation:

```
{counter:02d}_{system}_{page/feature}.png

Examples:
01_supply_chain_01_login.png
02_supply_chain_02_password_tab.png
03_supply_chain_page_商品列表.png
04_supplier_page_商品编辑.png
05_supplier_调价弹窗.png
```

---

## Part 3: Document Generation

### Basic Structure

```python
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
import os

screenshot_dir = r"screenshots/manual"
output_file = r"操作手册.docx"

def add_image(doc, filename, width_inches=5.5):
    filepath = os.path.join(screenshot_dir, filename)
    if os.path.exists(filepath):
        doc.add_picture(filepath, width=Inches(width_inches))
        doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
        return True
    return False

def set_font(run, font_name="微软雅黑", font_size=12):
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run._element.rPr.rFonts.set(qn('w:eastAsia'), font_name)

def add_h(doc, text, level):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.name = "微软雅黑"
        run._element.rPr.rFonts.set(qn('w:eastAsia'), "微软雅黑")

def add_p(doc, text, bold=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_font(run)
    if bold:
        run.font.bold = True

def add_steps(doc, steps):
    for i, step in enumerate(steps, 1):
        p = doc.add_paragraph(f"{i}. {step}")
        for run in p.runs:
            set_font(run)

def add_warning(doc, text):
    p = doc.add_paragraph()
    run = p.add_run(f"⚠️ {text}")
    run.font.bold = True
    set_font(run)

# Create document
doc = Document()

# Set default font
style = doc.styles['Normal']
style.font.name = '微软雅黑'
style._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# Add content
add_h(doc, "功能标题", 2)
add_p(doc, "功能说明...", bold=True)
add_steps(doc, ["步骤1", "步骤2", "步骤3"])
add_image(doc, "01_screenshot.png")
add_warning(doc, "重要提示")

# Save
doc.save(output_file)
```

### Document Sections

#### Cover Page

```python
doc.add_paragraph()
doc.add_paragraph()
p = doc.add_paragraph()
run = p.add_run("模块名称")
set_font(run, font_size=28)
run.font.bold = True
p.alignment = WD_ALIGN_PARAGRAPH.CENTER

p = doc.add_paragraph()
run = p.add_run("操作手册")
set_font(run, font_size=24)
run.font.bold = True
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
```

#### Process Flow Table

```python
table = doc.add_table(rows=4, cols=3)
table.style = 'Table Grid'
table.rows[0].cells[0].text = "步骤"
table.rows[0].cells[1].text = "操作方"
table.rows[0].cells[2].text = "操作内容"
table.rows[1].cells[0].text = "1"
table.rows[1].cells[1].text = "供应商"
table.rows[1].cells[2].text = "发起申请"
```

#### Page Break

```python
doc.add_page_break()
```

---

## Part 4: Best Practices

### 1. Cross-System Workflow Documentation

When documenting workflows that span multiple systems:

1. Start with a **process flow diagram** showing the complete workflow
2. Organize by role: **initiator first**, then **reviewer**
3. Link related sections: "供应商发起的操作请参见 X.X节"

```
跨系统流程:
供应商后台（发起） → 供应链后台（审核） → 系统生效

文档结构:
第一部分：供应商后台操作（发起方）
第二部分：供应链管理后台操作（审核方）
```

### 2. Screenshot Checklist

Before generating the document, verify:

- [ ] All mentioned features have corresponding screenshots
- [ ] Screenshots are named consistently
- [ ] No duplicate or irrelevant screenshots
- [ ] Screenshots show the actual operation (not just the page)

### 3. Content Guidelines

- **Remove unnecessary sections**: No system overview, login steps, or FAQ unless requested
- **Focus on operations**: Step-by-step instructions with visual aids
- **Add warnings**: Highlight critical actions that can't be undone
- **Use tables for workflows**: Clear step-by-step process visualization

### 4. Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Login fails in script | Use JavaScript evaluation for form input and clicking |
| Element not found | Wait for `networkidle`, use JavaScript to find by text |
| Images not in document | Use python-docx instead of docx-js; check file paths |
| Font not applied | Set both `run.font.name` and `rFonts` for East Asian fonts |
| Permission denied on save | Close the docx file, or use a different filename |

---

## Part 5: Complete Example

### capture_screenshots.py

```python
# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import os

output_dir = "screenshots/manual"
os.makedirs(output_dir, exist_ok=True)

URL = "http://your-app-url"
USER = "username"
PWD = "password"

counter = 1

def save_img(page, name):
    global counter
    path = f"{output_dir}/{counter:02d}_{name}.png"
    page.screenshot(path=path, full_page=True)
    print(f"Saved: {path}")
    counter += 1

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=500)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # Login
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(2000)

    # Switch to password login
    page.locator('.ant-tabs-tab').nth(1).click()
    page.wait_for_timeout(1000)

    # Fill credentials
    page.locator('input[type="text"]').first.fill(USER)
    page.locator('input[type="password"]').first.fill(PWD)

    # Click login
    page.evaluate('''() => {
        document.querySelectorAll('button').forEach(b => {
            if (b.innerText.includes('登录')) b.click();
        });
    }''')

    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)

    if 'login' not in page.url:
        print("Login successful!")

        # Navigate to feature
        page.evaluate('''() => {
            document.querySelectorAll('.ant-menu-submenu-title').forEach(m => {
                if (m.innerText.includes('功能模块')) m.click();
            });
        }''')
        page.wait_for_timeout(1500)

        page.evaluate('''() => {
            document.querySelectorAll('.ant-menu-item').forEach(m => {
                if (m.innerText.includes('子功能')) m.click();
            });
        }''')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        save_img(page, "page_功能列表")

        # Capture dialog
        page.locator('table button:has-text("操作")').first.click()
        page.wait_for_timeout(2000)
        if page.locator('[role="dialog"]').count() > 0:
            save_img(page, "弹窗_操作界面")
        page.keyboard.press("Escape")

    browser.close()
```

### create_manual.py

```python
# -*- coding: utf-8 -*-
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
import os

screenshot_dir = "screenshots/manual"
output_file = "操作手册.docx"

def add_image(doc, filename, width_inches=5.5):
    filepath = os.path.join(screenshot_dir, filename)
    if os.path.exists(filepath):
        doc.add_picture(filepath, width=Inches(width_inches))
        doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
        return True
    return False

def set_font(run, font_name="微软雅黑", font_size=12):
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run._element.rPr.rFonts.set(qn('w:eastAsia'), font_name)

def add_h(doc, text, level):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.name = "微软雅黑"
        run._element.rPr.rFonts.set(qn('w:eastAsia'), "微软雅黑")

def add_p(doc, text, bold=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_font(run)
    if bold:
        run.font.bold = True

def add_steps(doc, steps):
    for i, step in enumerate(steps, 1):
        p = doc.add_paragraph(f"{i}. {step}")
        for run in p.runs:
            set_font(run)

def add_warning(doc, text):
    p = doc.add_paragraph()
    run = p.add_run(f"⚠️ {text}")
    run.font.bold = True
    set_font(run)

# Create document
doc = Document()
style = doc.styles['Normal']
style.font.name = '微软雅黑'
style._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# Cover
doc.add_paragraph()
doc.add_paragraph()
p = doc.add_paragraph()
run = p.add_run("模块名称")
set_font(run, font_size=28)
run.font.bold = True
p.alignment = WD_ALIGN_PARAGRAPH.CENTER

p = doc.add_paragraph()
run = p.add_run("操作手册")
set_font(run, font_size=24)
run.font.bold = True
p.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Content
doc.add_page_break()
add_h(doc, "功能标题", 2)
add_p(doc, "功能入口：菜单 → 子菜单", bold=True)
add_steps(doc, [
    "步骤1：进入功能页面",
    "步骤2：点击操作按钮",
    "步骤3：填写信息",
    "步骤4：确认保存"
])
add_p(doc, "页面截图：", bold=True)
add_image(doc, "01_page_功能列表.png")
add_image(doc, "02_弹窗_操作界面.png")
add_warning(doc, "操作不可撤销，请确认后再执行")

doc.save(output_file)
print(f"文档已生成: {output_file}")
```

---

## Checklist Before Final Output

- [ ] All screenshots captured and named consistently
- [ ] Document structure follows: Cover → Flow → Operations (by role)
- [ ] Each feature has: Entry point, Steps, Screenshots, Warnings
- [ ] No login/logout steps (removed as requested)
- [ ] No FAQ or general notes sections (removed as requested)
- [ ] Cross-system workflows clearly show initiator → reviewer flow
- [ ] Chinese font properly set (微软雅黑 with East Asian font settings)