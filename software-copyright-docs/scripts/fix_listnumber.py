# -*- coding: utf-8 -*-
"""修复已生成 docx 的 Word 双序号:去除步骤段落的 List Number 样式 + 段落级 numPr,
保留文本里硬编码的序号("1." "2.")。用于补救旧脚本用 style='List Number' 生成的手册。
用法: python fix_listnumber.py <docx路径>
依赖: pip install python-docx
注意: 只去段落级 numPr(段落不再引用编号),不要删 word/numbering.xml(会破坏 docx)。
"""
import sys, shutil
from docx import Document
from docx.oxml.ns import qn

path = sys.argv[1]
shutil.copy2(path, path + '.bak')  # 备份
doc = Document(path)
changed = 0
for p in doc.paragraphs:
    sn = p.style.name if p.style else ''
    pPr = p._p.find(qn('w:pPr'))
    has_numPr = pPr is not None and pPr.find(qn('w:numPr')) is not None
    if sn in ('List Number', 'ListNumber', 'List Paragraph') or has_numPr:
        if sn in ('List Number', 'ListNumber', 'List Paragraph'):
            try:
                p.style = doc.styles['Normal']
            except Exception:
                pass
        pPr2 = p._p.find(qn('w:pPr'))
        if pPr2 is not None:
            numPr = pPr2.find(qn('w:numPr'))
            if numPr is not None:
                pPr2.remove(numPr)
        changed += 1
doc.save(path)
print(f"backed up -> {path}.bak")
print(f"fixed paragraphs: {changed}")
