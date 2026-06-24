#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
转录文件转 Markdown 思维导图格式
将 Whisper 输出的 txt 文件转换为结构化、有层级、经过总结的 Markdown
"""

import re
import sys
from datetime import datetime
from pathlib import Path


def parse_whisper_output(txt_content):
    """解析 Whisper 输出的 txt 文件"""
    lines = txt_content.strip().split('\n')
    segments = []

    for line in lines:
        # 匹配时间戳格式: [00:00.000 --> 00:03.660] 文本
        match = re.match(r'\[(\d+:\d+\.\d+) --> (\d+:\d+\.\d+)\]\s*(.*)', line)
        if match:
            start_time = match.group(1)
            end_time = match.group(2)
            text = match.group(3).strip()
            if text:
                segments.append({
                    'start': start_time,
                    'end': end_time,
                    'text': text
                })

    return segments


def get_total_duration(segments):
    """获取总时长"""
    if not segments:
        return "00:00"
    last = segments[-1]['end']
    parts = last.split(':')
    if len(parts) == 2:
        minutes = int(parts[0])
        seconds = int(float(parts[1]))
        return f"{minutes:02d}:{seconds:02d}"
    return last


def analyze_content_structure(segments):
    """分析内容结构，提取主题层级"""

    # 关键词识别：章节标记
    chapter_markers = [
        '首先', '第一', '第一步', '一是', '第一点',
        '然后', '第二', '第二步', '二是', '第二点',
        '接着', '接下来', '第三', '第三步', '三是', '第三点',
        '最后', '第四', '第四步', '四是', '第四点',
        '总结', '综上所述', '结论', '回到', '我们来看'
    ]

    # 关键词识别：要点标记
    point_markers = [
        '重点', '关键', '核心', '注意', '重要',
        '建议', '推荐', '必须', '需要', '应该',
        '比如', '例如', '举例', '案例'
    ]

    # 关键词识别：定义/概念
    definition_markers = [
        '是什么', '定义为', '叫做', '称为', '意思是',
        '就是', '等于', '代表', '含义', '定义'
    ]

    chapters = []
    current_chapter = None
    all_text = []

    for seg in segments:
        text = seg['text']
        all_text.append(text)

        # 检测章节开头
        is_new_chapter = False
        for marker in chapter_markers:
            if text.startswith(marker) or (marker in text[:20] and len(text) > 15):
                if current_chapter:
                    chapters.append(current_chapter)
                # 提取章节主题
                title = extract_chapter_title(text, marker)
                current_chapter = {
                    'title': title,
                    'points': [],
                    'definitions': [],
                    'examples': [],
                    'raw_texts': []
                }
                is_new_chapter = True
                break

        if not is_new_chapter and current_chapter:
            current_chapter['raw_texts'].append(text)

            # 检测要点
            for pm in point_markers:
                if pm in text and len(text) > 10:
                    point = summarize_point(text)
                    if point and point not in [p[:30] for p in current_chapter['points']]:
                        current_chapter['points'].append(point)
                    break

            # 检测定义
            for dm in definition_markers:
                if dm in text and len(text) > 10:
                    defn = extract_definition(text)
                    if defn and defn not in current_chapter['definitions']:
                        current_chapter['definitions'].append(defn)
                    break

    if current_chapter:
        chapters.append(current_chapter)

    # 如果没有识别到章节，自动按时间分段
    if not chapters or len(chapters) < 2:
        chapters = auto_segment_by_topic(segments)

    # 合并相似的章节（标题太短或内容太少）
    chapters = merge_similar_chapters(chapters)

    return chapters, all_text


def merge_similar_chapters(chapters):
    """合并内容太少或标题相似的章节"""
    merged = []
    i = 0
    while i < len(chapters):
        chapter = chapters[i]

        # 如果当前章节内容太少，尝试与下一章节合并
        if len(chapter['raw_texts']) < 3 and i + 1 < len(chapters):
            next_chapter = chapters[i + 1]
            # 合并内容
            merged_chapter = {
                'title': chapter['title'] if len(chapter['title']) > len(next_chapter['title']) else next_chapter['title'],
                'points': chapter['points'] + next_chapter['points'],
                'definitions': chapter['definitions'] + next_chapter['definitions'],
                'examples': chapter['examples'] + next_chapter['examples'],
                'raw_texts': chapter['raw_texts'] + next_chapter['raw_texts']
            }
            merged.append(merged_chapter)
            i += 2
        else:
            merged.append(chapter)
            i += 1

    return merged


def extract_chapter_title(text, marker):
    """提取章节标题"""
    # 去除标记词，提取核心主题
    text = text.replace(marker, '').strip()
    # 截取前30字符作为标题
    if len(text) > 30:
        return text[:30] + '...'
    return text if text else marker + "部分"


def summarize_point(text):
    """总结要点（简化表述）"""
    # 去除口语化表达
    text = re.sub(r'(对不对|是不是|好不好|OK|好吧|嗯|啊|呢|吧)', '', text)
    text = text.strip()

    # 提取核心句子（前50字符）
    if len(text) > 50:
        # 尝试找到句号位置
        match = re.search(r'[。！？]', text)
        if match and match.start() < 50:
            return text[:match.start() + 1]
        return text[:50] + '...'
    return text


def extract_definition(text):
    """提取定义/概念"""
    # 提取"XX是XX"或"XX等于XX"的结构
    patterns = [
        r'(.+?)就是(.+)',
        r'(.+?)等于(.+)',
        r'(.+?)叫做(.+)',
        r'(.+?)称为(.+)',
        r'(.+?)定义为(.+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            concept = match.group(1).strip()
            explanation = match.group(2).strip()
            if len(explanation) > 40:
                explanation = explanation[:40] + '...'
            return f"{concept}：{explanation}"

    return None


def auto_segment_by_topic(segments):
    """自动按主题分段（当没有明显章节标记时）"""
    # 按时间分成3-5个大段
    total_segments = len(segments)
    chunk_size = max(1, total_segments // 4)

    chapters = []
    for i in range(0, total_segments, chunk_size):
        chunk = segments[i:i + chunk_size]
        if not chunk:
            continue

        # 提取该段的核心内容作为标题
        all_texts = [s['text'] for s in chunk]
        title = extract_topic_title(all_texts)

        # 提取要点
        points = []
        for text in all_texts:
            if len(text) > 15 and any(kw in text for kw in ['重点', '关键', '核心', '注意', '需要', '应该']):
                points.append(summarize_point(text))

        chapters.append({
            'title': title,
            'points': points[:5],  # 最多5个要点
            'definitions': [],
            'examples': [],
            'raw_texts': all_texts
        })

    return chapters


def extract_topic_title(texts):
    """从文本组中提取主题标题"""
    # 合并前几句
    combined = ' '.join(texts[:3])
    # 提取关键词
    keywords = re.findall(r'[A-Za-z]+|[\u4e00-\u9fa5]{2,8}', combined)

    # 常见主题关键词
    topic_keywords = ['Agent', 'AI', '工程师', '开发', '设计', '流程', '方法', '原则', '概念', '定义']

    for kw in topic_keywords:
        if kw in combined:
            return f"关于{kw}"

    # 使用第一个有意义的句子
    for text in texts:
        if len(text) > 5:
            return text[:25] + ('...' if len(text) > 25 else '')

    return "内容段落"


def generate_mindmap_markdown(chapters, video_title, video_url, duration):
    """生成思维导图格式的 Markdown"""

    md_content = f"""# {video_title}

## 元信息
- **来源**：视频转录总结
- **原始链接**：{video_url}
- **处理时间**：{datetime.now().strftime('%Y-%m-%d %H:%M')}
- **视频时长**：{duration}
- **处理方式**：Whisper 转录 + AI 结构化总结

---

## 思维导图结构

```
# 中心主题：{video_title}

"""

    # 生成层级结构
    for i, chapter in enumerate(chapters, 1):
        title = chapter['title']
        md_content += f"## {i}. {title}\n"

        # 定义/概念
        for defn in chapter['definitions'][:2]:
            md_content += f"### 📌 {defn}\n"

        # 要点
        for j, point in enumerate(chapter['points'][:5], 1):
            md_content += f"### • {point}\n"

        md_content += "\n"

    md_content += "```\n\n---\n\n"

    # 详细内容展开
    md_content += "## 内容详解\n\n"

    for i, chapter in enumerate(chapters, 1):
        md_content += f"### {i}. {chapter['title']}\n\n"

        # 定义
        if chapter['definitions']:
            md_content += "**核心概念：**\n"
            for defn in chapter['definitions']:
                md_content += f"- {defn}\n"
            md_content += "\n"

        # 要点
        if chapter['points']:
            md_content += "**关键要点：**\n"
            for point in chapter['points']:
                md_content += f"- {point}\n"
            md_content += "\n"

        # 简要总结该章节
        if chapter['raw_texts']:
            summary = summarize_chapter(chapter['raw_texts'])
            md_content += f"**本节要点：** {summary}\n\n"

        md_content += "---\n\n"

    return md_content


def summarize_chapter(raw_texts):
    """总结一个章节的核心内容"""
    combined = ' '.join(raw_texts)

    # 去除口语化表达
    combined = re.sub(r'(对不对|是不是|好不好|OK|好吧|嗯|啊|呢|吧|咱们|就是说)', '', combined)
    combined = combined.strip()

    # 提取前100字符作为总结
    if len(combined) > 100:
        # 找到句号位置截断
        match = re.search(r'[。！？]', combined[80:])
        if match:
            end_pos = 80 + match.start() + 1
            return combined[:end_pos]
        return combined[:100] + '...'

    return combined


def convert_to_markdown(txt_path, video_title, video_url, output_path):
    """主转换函数"""
    # 读取原始转录
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 解析转录内容
    segments = parse_whisper_output(content)

    if not segments:
        # 如果没有时间戳格式，按行处理
        lines = [l.strip() for l in content.split('\n') if l.strip()]
        segments = [{'start': '00:00', 'end': '00:00', 'text': line} for line in lines]

    # 获取时长
    duration = get_total_duration(segments)

    # 分析内容结构
    chapters, all_text = analyze_content_structure(segments)

    # 生成思维导图 Markdown
    md_content = generate_mindmap_markdown(chapters, video_title, video_url, duration)

    # 写入文件
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md_content)

    return output_path


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("用法: python transcript_to_md.py <txt文件> <视频标题> [视频链接]")
        sys.exit(1)

    txt_path = sys.argv[1]
    video_title = sys.argv[2]
    video_url = sys.argv[3] if len(sys.argv) > 3 else "未知"

    output_path = Path(txt_path).with_suffix('.md')

    result = convert_to_markdown(txt_path, video_title, video_url, output_path)
    print(f"Markdown 思维导图已生成: {result}")