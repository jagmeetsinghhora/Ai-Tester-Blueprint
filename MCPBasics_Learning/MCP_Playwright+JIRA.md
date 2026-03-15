# MCP with Playwright + JIRA Integration

## Overview

This document covers the basics of using **Model Context Protocol (MCP)** with **Playwright** for browser automation and **JIRA** for issue tracking — enabling AI-powered testing workflows.

---

## What is MCP?

**Model Context Protocol (MCP)** is an open protocol that allows AI models to interact with external tools and services in a structured way. MCP servers expose capabilities (tools, resources, prompts) that AI agents can call.

---

## MCP + Playwright

### Purpose
Use Playwright MCP to allow AI agents to control a real browser — navigating pages, clicking elements, filling forms, and extracting data.

### Key Capabilities
- Launch and control Chromium / Firefox / WebKit browsers
- Navigate to URLs
- Click, type, and interact with elements
- Take screenshots
- Extract page content (DOM, text, etc.)

### Example MCP Tools (Playwright)
| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to a specified URL |
| `browser_click` | Click an element by selector |
| `browser_type` | Type text into an input field |
| `browser_screenshot` | Capture a screenshot |
| `browser_get_text` | Get visible text from a page |

### Setup
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

---

## MCP + JIRA

### Purpose
Use JIRA MCP to allow AI agents to create, read, update, and manage JIRA issues programmatically during testing workflows.

### Key Capabilities
- Create bug reports / issues automatically
- Query issues by project, status, or assignee
- Update issue status and fields
- Add comments to issues
- Attach screenshots or logs

### Example MCP Tools (JIRA)
| Tool | Description |
|------|-------------|
| `jira_create_issue` | Create a new issue in a project |
| `jira_get_issue` | Fetch details of an issue by key |
| `jira_update_issue` | Update fields of an existing issue |
| `jira_add_comment` | Add a comment to an issue |
| `jira_search_issues` | Search issues using JQL |

### Setup
```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@sooperset/mcp-atlassian"],
      "env": {
        "JIRA_URL": "https://your-domain.atlassian.net",
        "JIRA_USERNAME": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

---

## Combined Workflow: AI-Powered Test Automation

```
AI Agent
  │
  ├── Playwright MCP ──► Browser Automation
  │     ├── Navigate to app URL
  │     ├── Execute test steps
  │     ├── Capture screenshot on failure
  │
  └── JIRA MCP ──────► Issue Tracking
        ├── Create bug report with details
        ├── Attach screenshot
        └── Set priority & assignee
```

### Example Use Case
1. Agent navigates to the login page via **Playwright MCP**
2. Agent attempts login with test credentials
3. If login fails → Agent captures a screenshot
4. Agent creates a **JIRA bug** with:
   - Summary: `Login page returns 500 error`
   - Steps to reproduce
   - Screenshot attached
   - Priority: High

---

## Configuration File Location

Place your MCP configuration at:
- **macOS/Linux**: `~/.cursor/mcp.json` or `~/.claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

---

## Resources

- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [MCP Atlassian (JIRA)](https://github.com/sooperset/mcp-atlassian)
- [Model Context Protocol Docs](https://modelcontextprotocol.io)
- [Playwright Docs](https://playwright.dev)
- [JIRA REST API Docs](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
