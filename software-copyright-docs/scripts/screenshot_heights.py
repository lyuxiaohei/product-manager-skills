# -*- coding: utf-8 -*-
"""扫描原型页面渲染高度,判断视口(1080)是否截得全,决定是否需要长图。
用法:
  python screenshot_heights.py <base_url> <page.html> [<page.html> ...]
  例: python screenshot_heights.py http://127.0.0.1:8765/admin/ admin-ticket-ai.html admin-auto-reply.html
依赖: pip install playwright && playwright install chromium
输出: 每页 height + FIT(视口够)/LONG(需长图)。
"""
import sys
from playwright.sync_api import sync_playwright

base = sys.argv[1].rstrip('/') if len(sys.argv) > 1 else ''
pages = sys.argv[2:]
LONG_THRESHOLD = 1250  # 视口 1080,留余量

if not pages:
    print("用法: python screenshot_heights.py <base_url> <page.html> [...]")
    sys.exit(1)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    ctx = b.new_context(viewport={'width': 1920, 'height': 1080})
    pg = ctx.new_page()
    for name in pages:
        url = name if name.startswith('http') else f"{base}/{name}"
        try:
            pg.goto(url, wait_until='networkidle', timeout=60000)
            pg.wait_for_timeout(1500)
            h = pg.evaluate('document.body.scrollHeight')
            tag = 'LONG(需长图)' if h > LONG_THRESHOLD else 'FIT(视口够)'
            print(f"{name:30s} height={h:5d}  {tag}")
        except Exception as e:
            print(f"{name:30s} ERR {e}")
    b.close()
