---
name: "meeting-prd-analyzer"
description: "Analyzes meeting transcripts to extract requirement changes and generates/updates PRD documents. Invoke when user needs to process meeting notes, extract requirements, or update PRD from meeting discussions."
---

# Meeting PRD Analyzer

This skill provides a comprehensive tool for analyzing meeting transcripts and generating/updating Product Requirement Documents (PRD).

## Core Features

### 1. Meeting Transcript Analysis
- Automatically analyzes meeting transcripts
- Extracts requirement change points (new features, modifications, deletions)
- Supports manual addition of points
- Renders results in formatted Markdown for easy reading

### 2. PRD Document Comparison
- Compares meeting points with existing PRD documents
- Checks requirement coverage status (covered/uncovered)
- Generates coverage analysis reports
- Displays results in formatted Markdown

### 3. PRD Document Generation
- **With existing PRD**: Generates updated complete PRD including original content and changes
- **Without existing PRD**: Generates complete PRD from scratch based on meeting content
- Outputs standard Markdown format with proper structure

### 4. Tencent Meeting Integration
- Fetches enterprise WeChat users
- Queries historical meetings
- Automatically retrieves meeting transcripts

## When to Invoke

Use this skill when:
- User needs to analyze meeting transcripts or notes
- User wants to extract requirement changes from meeting discussions
- User needs to generate or update PRD documents
- User asks how to handle meeting transcripts
- User mentions "会议纪要", "会议转写", "需求提取", "PRD生成", "PRD更新"
- User needs to process Tencent Meeting data

## Usage Workflow

### Method 1: With Existing PRD
1. Upload meeting transcript file or fetch from Tencent Meeting
2. System automatically analyzes and extracts points
3. Upload PRD document
4. Select requirement points
5. Click "Compare PRD" → View coverage status
6. Click "Generate PRD" → Generate updated complete PRD
7. Click "Export" → Save to file

### Method 2: Without Existing PRD
1. Upload meeting transcript file or fetch from Tencent Meeting
2. System automatically analyzes and extracts points
3. Select requirement points
4. Click "Generate PRD" → Generate complete new PRD
5. Click "Export" → Save to file

## Input Requirements

### Meeting Transcript
- Clear format with identifiable discussion points
- Contains requirement or prototype change discussions
- Recommended length: 100-15000 characters

### PRD Document
- Markdown format recommended
- Clear structure and hierarchy
- Complete requirement descriptions

## Output Format

The skill generates PRD documents following standard format:
- Document overview (version, date, author)
- Product background and objectives
- Functional requirements list
- Detailed functional descriptions (with flowcharts)
- Non-functional requirements
- Appendices

## Technical Stack

- Python 3.x
- Tkinter (GUI)
- Requests (HTTP requests)
- Markdown (Rendering)
- DeepSeek API (AI analysis)

## Configuration

### Required Configuration
1. AI Analysis API (DeepSeek)
   - API_KEY
   - API_URL

### Optional Configuration
2. Tencent Meeting API
   - APP_ID
   - SECRET_ID
   - SECRET_KEY
   - SDK_ID

## File Structure

```
meeting-analyzer.py          # Main application
config.py                    # API configuration
tencent_config.py            # Tencent Meeting API config
requirements.txt             # Dependencies
README.md                    # Documentation
```

## Dependencies

- requests>=2.31.0
- markdown>=3.4.0
- pyinstaller>=6.0.0 (optional, for packaging)

## Examples

### Example 1: Analyze Meeting Transcript
```
User: "I have a meeting transcript about new login feature discussions. Can you help extract the requirements?"

Invoke the skill to:
1. Analyze the transcript
2. Extract requirement points
3. Generate PRD document
```

### Example 2: Update Existing PRD
```
User: "We discussed some changes to the user management module in yesterday's meeting. How can I update the PRD?"

Invoke the skill to:
1. Analyze meeting transcript
2. Compare with existing PRD
3. Identify uncovered points
4. Generate updated PRD
```

### Example 3: Generate New PRD
```
User: "We're starting a new project and need to create a PRD from the kick-off meeting notes."

Invoke the skill to:
1. Analyze meeting notes
2. Extract all requirement points
3. Generate complete PRD from scratch
```

## Notes

1. **API Key Security**: Keep API keys secure and don't share with unauthorized users
2. **Network Connection**: Stable internet required for AI analysis
3. **Transcript Format**: Clear format improves analysis quality
4. **PRD Format**: Markdown format recommended for better rendering

## Troubleshooting

### Analysis Failed
- Check API key configuration
- Verify network connection
- Ensure transcript content is clear and complete
- Check API service status

### No Points Extracted
- Transcript may not contain requirement discussions
- Format may not be standard
- Try manual addition of points

### PRD Generation Issues
- Ensure sufficient requirement points selected
- Check meeting content completeness
- Verify API key validity

## Version

- Version: v1.0
- Last Updated: 2026-06-24
- Author: AI Assistant