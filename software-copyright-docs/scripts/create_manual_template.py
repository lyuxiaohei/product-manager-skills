# -*- coding: utf-8 -*-
"""软著操作手册生成模板。
关键设计(踩坑总结):
  - 标题/步骤都用【普通段落+加粗】,不用 doc.add_heading() / style='List Number',
    避免 Word 自动编号叠加文本硬编码序号 → 双序号。
  - 序号硬编码在文本("1." "3.1")。
  - 截图文件名: {idx:02d}_{img_name}.png,img_name 形如 "01_模块名"(带序号前缀)。
依赖: pip install python-docx
"""
import os
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn

# ============ 按实际改这三项 ============
SOFT_NAME = "XX系统"  # 软著名称(与申请表/源代码一字不差)
OUTPUT_FILE = r"<改我>\XX系统操作手册.docx"
SCREENSHOT_DIR = r"<改我>\screenshots"
# =======================================

# 每项: (img_name, title, entry, [steps], warning)
# 只放命题核心功能页,剔除占位页(3期待开发)和无关功能页。
PAGES = [
    ("01_模块A", "模块A", "入口路径 → 模块A", [
        "1. 步骤一……",
        "2. 步骤二……",
    ], "注意事项。"),
    # 按命题核心功能补全……
]


def set_font(run, font_name="微软雅黑", font_size=12, bold=False):
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run._element.rPr.rFonts.set(qn('w:eastAsia'), font_name)


def add_heading(doc, text, level=2):
    # 普通段落+加粗(不用 doc.add_heading,避免 Heading 样式自动编号)
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_font(run, font_size=(18 if level == 1 else (14 if level == 2 else 12)), bold=True)
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(12 if level <= 2 else 6)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    return p


def add_paragraph(doc, text, bold=False, font_size=12):
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_font(run, font_size=font_size, bold=bold)
    p.paragraph_format.space_after = Pt(6)
    return p


def add_steps(doc, steps):
    # 普通段落(不用 style='List Number',steps 文本已硬编码"1. 2.")
    for step in steps:
        p = doc.add_paragraph(step)
        p.paragraph_format.left_indent = Pt(20)
        for run in p.runs:
            set_font(run)
        p.paragraph_format.space_after = Pt(4)


def add_image(doc, filename, width=5.8):
    path = os.path.join(SCREENSHOT_DIR, filename)
    if os.path.exists(path):
        doc.add_picture(path, width=Inches(width))
        doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    else:
        add_paragraph(doc, f"[截图缺失: {filename}]", bold=True)


def main():
    doc = Document()
    # 封面
    for _ in range(4):
        doc.add_paragraph()
    for txt, sz in [(SOFT_NAME, 22), ("操作手册", 18), ("版本：V1.0    日期：2026年", 12)]:
        p = doc.add_paragraph(); r = p.add_run(txt); set_font(r, font_size=sz, bold=(sz > 14))
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_page_break()
    # 目录
    add_heading(doc, "目录", level=1)
    add_paragraph(doc, "1. 系统功能概览")
    add_paragraph(doc, "2. 系统业务流程")
    add_paragraph(doc, "3. 操作指南")
    for i, (_, title, _, _, _) in enumerate(PAGES):
        add_paragraph(doc, f"   3.{i+1} {title}")
    doc.add_page_break()
    # 1. 功能概览
    add_heading(doc, "1. 系统功能概览", level=1)
    add_paragraph(doc, f"本系统为{SOFT_NAME},包含以下核心模块：", bold=True)
    t = doc.add_table(rows=len(PAGES) + 1, cols=2); t.style = 'Table Grid'
    t.rows[0].cells[0].text = "模块"; t.rows[0].cells[1].text = "功能说明"
    for i, (_, title, _, steps, _) in enumerate(PAGES, 1):
        t.rows[i].cells[0].text = title
        t.rows[i].cells[1].text = steps[0].split('。')[0] if steps else ''
    doc.add_page_break()
    # 2. 业务流程
    add_heading(doc, "2. 系统业务流程", level=1)
    add_paragraph(doc, "（按实际业务流程填写核心步骤表/状态机）", bold=True)
    doc.add_page_break()
    # 3. 操作指南
    add_heading(doc, "3. 操作指南", level=1)
    add_paragraph(doc, "以下按模块逐一说明操作步骤与页面展示。", bold=True)
    for idx, (img_name, title, entry, steps, warning) in enumerate(PAGES, 1):
        add_heading(doc, f"3.{idx} {title}", level=2)
        add_paragraph(doc, f"功能入口：{entry}", bold=True)
        add_steps(doc, steps)
        add_paragraph(doc, "页面截图：", bold=True)
        add_image(doc, f"{idx:02d}_{img_name}.png")
        if warning:
            add_paragraph(doc, f"注：{warning}")
        doc.add_page_break()
    doc.save(OUTPUT_FILE)
    print(f"已生成: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
