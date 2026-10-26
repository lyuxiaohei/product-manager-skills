# -*- coding: utf-8 -*-
import zipfile
import xml.etree.ElementTree as ET
import re

xlsx_path = 'c:/Users/Administrator/Desktop/自研团队产研工作流梳理123.xlsx'

def col_to_num(col):
    """将列字母转换为数字"""
    num = 0
    for c in col:
        num = num * 26 + (ord(c.upper()) - ord('A') + 1)
    return num

def parse_cell_ref(ref):
    """解析单元格引用，返回(列号, 行号)"""
    match = re.match(r'([A-Z]+)(\d+)', ref)
    if match:
        col = col_to_num(match.group(1))
        row = int(match.group(2))
        return (col, row)
    return (0, 0)

# 获取工作表名称
with zipfile.ZipFile(xlsx_path, 'r') as z:
    # 读取工作簿
    wb_xml = z.read('xl/workbook.xml').decode('utf-8')
    wb_root = ET.fromstring(wb_xml)
    
    # 命名空间
    ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    
    # 获取工作表名称和r:id映射
    sheets_info = []
    for sheet in wb_root.findall('.//main:sheet', ns):
        name = sheet.get('name')
        sheet_id = sheet.get('sheetId')
        r_id = sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        sheets_info.append({'name': name, 'sheetId': sheet_id, 'r_id': r_id})
    
    print('=== 工作表列表 ===')
    for s in sheets_info:
        print(f"- {s['name']}")
    
    # 读取共享字符串
    shared_strings = []
    try:
        shared_strings_xml = z.read('xl/sharedStrings.xml').decode('utf-8')
        ss_root = ET.fromstring(shared_strings_xml)
        for si in ss_root.findall('.//main:si', ns):
            # 处理可能包含多个t元素的情况
            text_parts = []
            for t in si.findall('.//main:t', ns):
                if t.text:
                    text_parts.append(t.text)
            shared_strings.append(''.join(text_parts) if text_parts else '')
        print(f'\n共享字符串数量: {len(shared_strings)}')
    except Exception as e:
        print(f'\n无共享字符串: {e}')
    
    # 读取工作簿关系
    try:
        wb_rels_xml = z.read('xl/_rels/workbook.xml.rels').decode('utf-8')
        wb_rels_root = ET.fromstring(wb_rels_xml)
        rels_ns = {'rel': 'http://schemas.openxmlformats.org/package/2006/relationships'}
        sheet_files = {}
        for rel in wb_rels_root.findall('.//rel:Relationship', rels_ns):
            rel_id = rel.get('Id')
            target = rel.get('Target')
            if target.startswith('worksheets/'):
                sheet_files[rel_id] = target
    except Exception as e:
        print(f'读取工作簿关系错误: {e}')
        sheet_files = {}
    
    # 读取每个工作表的数据
    for s in sheets_info:
        sheet_name = s['name']
        r_id = s['r_id']
        
        # 尝试不同的sheet文件路径
        sheet_file = None
        if r_id in sheet_files:
            sheet_file = f'xl/{sheet_files[r_id]}'
        else:
            # 尝试直接使用sheetId
            sheet_file = f'xl/worksheets/sheet{s["sheetId"]}.xml'
        
        print(f'\n\n========== {sheet_name} ==========')
        print(f'尝试读取: {sheet_file}')
        
        try:
            sheet_xml = z.read(sheet_file).decode('utf-8')
            sheet_root = ET.fromstring(sheet_xml)
            
            # 读取行数据
            rows = sheet_root.findall('.//main:row', ns)
            print(f'行数: {len(rows)}')
            
            # 构建二维数组来存储数据
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
                        if cell_type == 's':  # 共享字符串
                            try:
                                idx = int(value)
                                if idx < len(shared_strings):
                                    value = shared_strings[idx]
                            except:
                                pass
                        data_grid[(col, row_n)] = value
                    else:
                        data_grid[(col, row_n)] = ''
            
            # 打印表格数据
            print(f'最大行: {max_row}, 最大列: {max_col}')
            
            # 打印表头（第一行）
            headers = []
            for col in range(1, max_col + 1):
                val = data_grid.get((col, 1), '')
                headers.append(val)
            print(f'\n表头: {headers}')
            
            # 打印数据行
            print('\n数据内容:')
            for row_num in range(2, min(max_row + 1, 52)):  # 限制到51行
                row_values = []
                for col in range(1, max_col + 1):
                    val = data_grid.get((col, row_num), '')
                    row_values.append(val)
                # 只打印非空行
                if any(v for v in row_values):
                    print(f'Row {row_num}: {row_values}')
                    
        except KeyError:
            print(f'工作表文件不存在: {sheet_file}')
            # 列出worksheets目录下的文件
            print('worksheets目录下的文件:')
            for name in z.namelist():
                if 'worksheet' in name:
                    print(f'  {name}')
        except Exception as e:
            print(f'读取错误: {e}')
            import traceback
            traceback.print_exc()