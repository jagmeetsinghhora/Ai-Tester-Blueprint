# Smart Bug Triage — Setup Guide

## Files
- `SmartBugTriage.jsx` → Main React component (drop into your project)

---

## Step 1 — Add to Your Project

Copy `SmartBugTriage.jsx` into your project:
```
Project_Smart Bug Triage (JIRA MCP + UI)/
└── src/
    └── SmartBugTriage.jsx
```

---

## Step 2 — Create .env File

Create a `.env` file in your project root:
```
VITE_JIRA_API_TOKEN=ATATT3xFfGF0MAEWw0OR5ZE-q_V8SxbJ80jM6xi3IFx0ql9tm713_vh8EVPpNUJDpyc6rnuGQlPveT4geJq99ZoXdaVJDv_li1F4nzAz3WjHUrS7NV9gGFKV7nRTu5oTOTublJKjAdEB5Igq7TvL8Pwgv0KheaHZq9WjMDT8YHyFR7ltjP_73Sk=40682277
```

---

## Step 3 — Import in App.jsx

```jsx
import SmartBugTriage from './SmartBugTriage'

export default function App() {
  return <SmartBugTriage />
}
```

---

## Step 4 — Run

```bash
npm install
npm run dev
```

---

## Step 5 — Add to .gitignore

```
.env
JIRA MCP.md
```

---

## What the UI Does

| Action | What Happens |
|--------|-------------|
| Click "Fetch Bugs from Jira" | Fetches live bugs from KAN via Jira REST API |
| Auto-classifies each bug | Sends to Claude API → gets category, severity, confidence |
| Fetches developers live | Pulls real project members + counts their open issue load |
| Suggests best assignee | Matches bug category/skills to developer role/load |
| Click "Accept" | Updates assignee in Jira + writes triage comment |
| Click "Reassign" | Override to any developer from live Jira roster |
| Click "Auto-assign all" | Accepts all bugs with confidence ≥ 85% in one click |
