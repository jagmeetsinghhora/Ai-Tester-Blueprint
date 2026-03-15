# 🔧 MCP Tools — Model Context Protocol

**Last Updated:** 2026-03-15
**Reference:** [modelcontextprotocol.io](https://modelcontextprotocol.io)

---

## What is an MCP Tool?

An **MCP Tool** is a capability exposed by an MCP server that an AI model can call to interact with external systems. Tools follow a structured schema so that AI agents know exactly what inputs to provide and what outputs to expect.

> **Think of MCP Tools as "AI-callable APIs"** — they let agents control browsers, query databases, manage issues, run commands, and much more.

---

## MCP Tool Structure

Every MCP tool has the following shape:

```json
{
  "name": "tool_name",
  "description": "What the tool does",
  "inputSchema": {
    "type": "object",
    "properties": {
      "param1": { "type": "string", "description": "..." },
      "param2": { "type": "number", "description": "..." }
    },
    "required": ["param1"]
  }
}
```

| Field | Description |
|-------|-------------|
| `name` | Unique identifier for the tool |
| `description` | Human-readable explanation for the AI model |
| `inputSchema` | JSON Schema defining accepted parameters |

---

## Types of MCP Tools

### 1. 🌐 Browser / UI Tools (e.g., Playwright MCP)

Control a real browser for automation and testing.

| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to a URL |
| `browser_click` | Click an element by selector |
| `browser_type` | Type text into a field |
| `browser_screenshot` | Capture a screenshot |
| `browser_get_text` | Extract visible text from the page |
| `browser_scroll` | Scroll the page |
| `browser_wait_for` | Wait for an element or condition |

**Setup:**
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

### 2. 🗂️ Project Management Tools (e.g., Atlassian / JIRA MCP)

Interact with JIRA and Confluence.

| Tool | Description |
|------|-------------|
| `createJiraIssue` | Create a bug, story, or task |
| `getJiraIssue` | Fetch issue details by key |
| `editJiraIssue` | Update issue fields |
| `transitionJiraIssue` | Change issue status (e.g., To Do → In Progress) |
| `addCommentToJiraIssue` | Add a comment to an issue |
| `searchJiraIssuesUsingJql` | Search issues with JQL |
| `createConfluencePage` | Create a Confluence page |
| `updateConfluencePage` | Update an existing Confluence page |

**Setup:**
```json
{
  "mcpServers": {
    "atlassian": {
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

### 3. 📁 Filesystem Tools

Read and write files on the local system.

| Tool | Description |
|------|-------------|
| `read_file` | Read file contents |
| `write_file` | Write or overwrite a file |
| `list_directory` | List files in a directory |
| `create_directory` | Create a new directory |
| `delete_file` | Delete a file |
| `search_files` | Search for files by name/pattern |

**Setup:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
    }
  }
}
```

---

### 4. 🧠 Memory / Knowledge Tools

Persist and retrieve information across sessions.

| Tool | Description |
|------|-------------|
| `memory_store` | Save a key-value pair to memory |
| `memory_retrieve` | Fetch stored memory by key |
| `memory_list` | List all stored memory keys |
| `memory_delete` | Delete a memory entry |

---

### 5. 🔌 Database Tools (e.g., SQLite, PostgreSQL MCP)

Query and manage databases.

| Tool | Description |
|------|-------------|
| `query` | Run a SQL SELECT query |
| `execute` | Run INSERT / UPDATE / DELETE |
| `list_tables` | List all tables in the database |
| `describe_table` | Get schema details for a table |

---

### 6. 🔍 Search Tools (e.g., Brave Search, Tavily MCP)

Perform web or document searches.

| Tool | Description |
|------|-------------|
| `web_search` | Search the internet |
| `news_search` | Search news articles |
| `image_search` | Search for images |

---

## How Tools Are Called (Flow)

```
User Prompt
    │
    ▼
AI Model
    │
    ├──► Tool Selection (based on description + schema)
    │
    ├──► Tool Call (with structured input)
    │           │
    │           ▼
    │       MCP Server
    │           │
    │           ▼
    │       External System
    │       (Browser / JIRA / DB / FS)
    │           │
    │           ▼
    │       Tool Result (JSON)
    │
    └──► AI Response to User (using tool result)
```

---

## Configuration File Locations

| OS | Path |
|----|------|
| **macOS** | `~/.claude/claude_desktop_config.json` or `~/.cursor/mcp.json` |
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **Linux** | `~/.config/claude/claude_desktop_config.json` |

### Example Full Config

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@sooperset/mcp-atlassian"],
      "env": {
        "JIRA_URL": "https://your-domain.atlassian.net",
        "JIRA_USERNAME": "your-email@example.com",
        "JIRA_API_TOKEN": "your-token"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "~/projects"]
    }
  }
}
```

---

## MCP Tool Best Practices

| ✅ Do | ❌ Don't |
|-------|---------|
| Use descriptive tool names | Use vague names like `action1` |
| Validate inputs with JSON Schema | Skip input validation |
| Return structured JSON responses | Return raw unstructured text |
| Handle errors gracefully | Let unhandled exceptions crash |
| Use `required` for mandatory params | Make all params optional |

---

## Popular MCP Servers

| Server | npm Package | Use Case |
|--------|------------|----------|
| Playwright | `@playwright/mcp` | Browser automation & testing |
| Atlassian | `@sooperset/mcp-atlassian` | JIRA & Confluence |
| Filesystem | `@modelcontextprotocol/server-filesystem` | Local file access |
| SQLite | `@modelcontextprotocol/server-sqlite` | SQLite database |
| Brave Search | `@modelcontextprotocol/server-brave-search` | Web search |
| GitHub | `@modelcontextprotocol/server-github` | Git & GitHub ops |
| Memory | `@modelcontextprotocol/server-memory` | Knowledge persistence |

---

## Resources

- 📘 [MCP Specification](https://modelcontextprotocol.io/docs)
- 🔧 [MCP SDK (TypeScript)](https://github.com/modelcontextprotocol/typescript-sdk)
- 🔧 [MCP SDK (Python)](https://github.com/modelcontextprotocol/python-sdk)
- 🎭 [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- 🗂️ [MCP Atlassian](https://github.com/sooperset/mcp-atlassian)
- 📦 [MCP Server Registry](https://github.com/modelcontextprotocol/servers)
