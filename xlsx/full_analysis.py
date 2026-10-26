# -*- coding: utf-8 -*-
import zipfile
import xml.etree.ElementTree as ET
import re

xlsx_path = 'c:/Users/Administrator/Desktop/自研团队产研工作流梳理123.xlsx'
output_file = 'c:/Users/Administrator/Desktop/workflow_analysis.txt'

def col_to_num(col):
    num = 0
    for c in col:
        num = num * 26 + (ord(c.upper()) - ord('A') + 1)
    return num

def parse_cell_ref(ref):
    match = re.match(r'([A-Z]+)(\d+)', ref)
    if match:
        col = col_to_num(match.group(1))
        row = int(match.group(2))
        return (col, row)
    return (0, 0)

with zipfile.ZipFile(xlsx_path, 'r') as z:
    wb_xml = z.read('xl/workbook.xml').decode('utf-8')
    wb_root = ET.fromstring(wb_xml)
    
    ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    
    sheets_info = []
    for sheet in wb_root.findall('.//main:sheet', ns):
        name = sheet.get('name')
        sheet_id = sheet.get('sheetId')
        r_id = sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        sheets_info.append({'name': name, 'sheetId': sheet_id, 'r_id': r_id})
    
    shared_strings = []
    shared_strings_xml = z.read('xl/sharedStrings.xml').decode('utf-8')
    ss_root = ET.fromstring(shared_strings_xml)
    for si in ss_root.findall('.//main:si', ns):
        text_parts = []
        for t in si.findall('.//main:t', ns):
            if t.text:
                text_parts.append(t.text)
        shared_strings.append(''.join(text_parts) if text_parts else '')
    
    wb_rels_xml = z.read('xl/_rels/workbook.xml.rels').decode('utf-8')
    wb_rels_root = ET.fromstring(wb_rels_xml)
    rels_ns = {'rel': 'http://schemas.openxmlformats.org/package/2006/relationships'}
    sheet_files = {}
    for rel in wb_rels_root.findall('.//rel:Relationship', rels_ns):
        rel_id = rel.get('Id')
        target = rel.get('Target')
        if target.startswith('worksheets/'):
            sheet_files[rel_id] = target
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # 读取两个工作表
        for sheet_idx, s in enumerate(sheets_info):
            sheet_name = s['name']
            r_id = s['r_id']
            
            sheet_file = f'xl/{sheet_files[r_id]}'
            f.write(f'\n\n{"="*80}\n')
            f.write(f'========== {sheet_name} ==========\n')
            f.write(f'{"="*80}\n\n')
            
            sheet_xml = z.read(sheet_file).decode('utf-8')
            sheet_root = ET.fromstring(sheet_xml)
            
            rows = sheet_root.findall('.//main:row', ns)
            f.write(f'总行数: {len(rows)}\n')
            
            max_col = 0
            max_row = 0
            data_grid = {}
            
            for row in rows:
                row_num = int(row.get('r'))
                max_row = max(max_row, row_num)
                cells = row.findall('main:c', ns)
                
                for cell in cells:
                    cell_ref = cell.get('r')
                    col, row_n = parse_cell_ref(cell_ref)
                    max_col = max(max_col, col)
                    
                    cell_type = cell.get('t')
                    value_elem = cell.find('main:v', ns)
                    
                    if value_elem is not None:
                        value = value_elem.text if value_elem.text else ''
                        if cell_type == 's':
                            try:
                                idx = int(value)
                                if idx < len(shared_strings):
                                    value = shared_strings[idx]
                            except:
                                pass
                        data_grid[(col, row_n)] = value
                    else:
                        data_grid[(col, row_n)] = ''
            
            # 表头
            headers = []
            for col in range(1, max_col + 1):
                val = data_grid.get((col, 1), '')
                headers.append(val)
            f.write(f'表头: {headers}\n\n')
            
            # 数据行
            for row_num in range(2, max_row + 1):
                row_values = []
                for col in range(1, max_col + 1):
                    val = data_grid.get((col, row_num), '')
                    row_values.append(val)
                
                if any(v for v in row_values):
                    f.write(f'\n--- Row {row_num} ---\n')
                    for h, v in zip(headers, row_values):
                        if v:
                            f.write(f'【{h}】: {v}\n')
    
print(f'分析结果已保存至: {output_file}')