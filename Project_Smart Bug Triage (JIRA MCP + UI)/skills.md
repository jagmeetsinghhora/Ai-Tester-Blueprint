# Skills Configuration — Smart Bug Triage

## Role to Skill Mapping
## Developers are fetched LIVE from Jira KAN project via MCP
## This file only defines what skills belong to what role

| Role      | Skills to Look For                              |
|-----------|-------------------------------------------------|
| Frontend  | React, TypeScript, CSS, Mobile, Safari, Browser |
| Backend   | Node.js, Python, PostgreSQL, Auth, API, JWT     |
| UI        | Figma, Accessibility, CSS, HTML, Design         |
| DevOps    | Docker, CI/CD, Pipeline, Linux, Kubernetes      |

## Workload Rules
- Max active bugs per developer: 8
- Count open issues assigned to dev in Jira = current load
- Always pick developer with lowest open issue count
- P1 bugs → assign immediately regardless of load

## Fallback Rules
- No skill match → match by role only
- All role members at max load → notify lead
- Nobody available → label "needs-manual-triage"
```

---

### And update `smart-bug-triage-plan.md` — the fetch step becomes:
```
STEP 1 — Fetch all project members LIVE from Jira
         → Use Jira MCP to get all members in KAN project
         → Get their display name, account ID, role

STEP 2 — For each developer, count their open issues
         → JQL: assignee = {accountId} AND project = KAN 
                AND status != Done
         → This = their current workload (live)

STEP 3 — Classify the bug using AI

STEP 4 — Match bug category → role → 
         find live dev with lowest workload → assign