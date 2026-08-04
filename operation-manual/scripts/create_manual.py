# -*- coding: utf-8 -*-
"""
操作手册文档生成脚本模板
修改截图目录、输出文件名和文档内容以适应目标系统
"""
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
import os

# ===== 配置区域 =====
screenshot_dir = r"screenshots/manual"
output_file = r"操作手册.docx"

# ===== 辅助函数 =====
def add_image(doc, filename, width_inches=5.5):
    """添加图片"""
    filepath = os.path.join(screenshot_dir, filename)
    if os.path.exists(filepath):
        doc.add_picture(filepath, width=Inches(width_inches))
        doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
        print(f"Added: {filename}")
        return True
    else:
        print(f"Not found: {filename}")
    return False

def set_font(run, font_name="微软雅黑", font_size=12):
    """设置字体"""
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run._element.rPr.rFonts.set(qn('w:eastAsia'), font_name)

def add_h(doc, text, level):
    """添加标题"""
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.name = "微软雅黑"
        run._element.rPr.rFonts.set(qn('w:eastAsia'), "微软雅黑")
    return h

def add_p(doc, text, bold=False):
    """添加段落"""
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_font(run)
    if bold:
        run.font.bold = True
    return p

def add_steps(doc, steps):
    """添加操作步骤"""
    for i, step in enumerate(steps, 1):
        p = doc.add_paragraph(f"{i}. {step}")
        for run in p.runs:
            set_font(run)

def add_bullets(doc, items):
    """添加无序列表"""
    for item in items:
        p = doc.add_paragraph(f"• {item}")
        for run in p.runs:
            set_font(run)

def add_warning(doc, text):
    """添加警告提示"""
    p = doc.add_paragraph()
    run = p.add_run(f"⚠️ {text}")
    run.font.bold = True
    set_font(run)

def add_tip(doc, text):
    """添加提示信息"""
    p = doc.add_paragraph()
    run = p.add_run(f"💡 提示：{text}")
    set_font(run)

def add_flow_table(doc, rows_data):
    """添加流程表格"""
    table = doc.add_table(rows=len(rows_data) + 1, cols=3)
    table.style = 'Table Grid'
    table.rows[0].cells[0].text = "步骤"
    table.rows[0].cells[1].text = "操作方"
    table.rows[0].cells[2].text = "操作内容"
    for i, (step, operator, content) in enumerate(rows_data, 1):
        table.rows[i].cells[0].text = str(step)
        table.rows[i].cells[1].text = operator
        table.rows[i].cells[2].text = content

# ===== 创建文档 =====
doc = Document()

# 设置默认字体
style = doc.styles['Normal']
style.font.name = '微软雅黑'
style._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# ===== 封面 =====
doc.add_paragraph()
doc.add_paragraph()
p = doc.add_paragraph()
run = p.add_run("模块名称")  # 修改为实际模块名
set_font(run, font_size=28)
run.font.bold = True
p.alignment = WD_ALIGN_PARAGRAPH.CENTER

p = doc.add_paragraph()
run = p.add_run("操作手册")
set_font(run, font_size=24)
run.font.bold = True
p.alignment = WD_ALIGN_PARAGRAPH.CENTER

doc.add_paragraph()
doc.add_paragraph()

p = doc.add_paragraph()
run = p.add_run("系统名称")  # 修改为实际系统名
set_font(run, font_size=14)
p.alignment = WD_ALIGN_PARAGRAPH.CENTER

p = doc.add_paragraph()
run = p.add_run("版本：V1.0")
set_font(run)
p.alignment = WD_ALIGN_PARAGRAPH.CENTER

# ===== 跨系统流程（可选） =====
doc.add_page_break()
add_h(doc, "跨系统业务流程", 1)

add_h(doc, "一、功能流程", 2)
add_p(doc, "发起方 → 审核方 → 生效")
doc.add_paragraph()

add_flow_table(doc, [
    (1, "发起方", "提交申请"),
    (2, "审核方", "审核申请"),
    (3, "系统", "自动生效"),
])

# ===== 第一部分：发起方操作 =====
doc.add_page_break()
add_h(doc, "第一部分：发起方操作", 1)
add_p(doc, "适用角色：XXX")
add_p(doc, "访问地址：http://xxx")

# 功能1
add_h(doc, "1. 功能名称", 2)

add_h(doc, "功能入口", 3)
add_p(doc, "菜单 → 子菜单")

add_h(doc, "操作步骤", 3)
add_steps(doc, [
    "步骤1：进入功能页面",
    "步骤2：点击操作按钮",
    "步骤3：填写信息",
    "步骤4：确认保存"
])

add_p(doc, "页面截图：", bold=True)
add_image(doc, "01_screenshot.png")

add_warning(doc, "重要提示内容")

# ===== 第二部分：审核方操作 =====
doc.add_page_break()
add_h(doc, "第二部分：审核方操作", 1)
add_p(doc, "适用角色：XXX")
add_p(doc, "访问地址：http://xxx")

# 功能2
add_h(doc, "1. 审核功能", 2)

add_h(doc, "功能入口", 3)
add_p(doc, "菜单 → 子菜单")

add_h(doc, "前置条件", 3)
add_p(doc, "发起方已提交申请")

add_h(doc, "操作步骤", 3)
add_steps(doc, [
    "步骤1：查看申请列表",
    "步骤2：点击查看详情",
    "步骤3：核实信息",
    "步骤4：点击通过或驳回"
])

add_p(doc, "审核要点：", bold=True)
add_bullets(doc, [
    "要点1",
    "要点2",
    "要点3"
])

add_p(doc, "页面截图：", bold=True)
add_image(doc, "02_screenshot.png")

# ===== 保存文档 =====
doc.save(output_file)
print(f"\n文档已生成: {output_file}")