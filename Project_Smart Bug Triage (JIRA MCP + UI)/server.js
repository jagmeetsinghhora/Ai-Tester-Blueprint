import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIT_FILE = path.join(__dirname, 'audit.json');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const JIRA_SITE_URL = "https://jagmeetsingh0106007.atlassian.net";
const JIRA_EMAIL = "jagmeetsingh0106007@gmail.com";
const JIRA_PROJECT_KEY = "KAN";

const getInitials = (name) => {
  if (!name) return "";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const jiraFetch = async (endpointPath, options = {}) => {
  const token = process.env.VITE_JIRA_API_TOKEN;
  if (!token) throw new Error("Jira API token missing from .env");

  const base64Auth = Buffer.from(`${JIRA_EMAIL}:${token}`).toString('base64');
  const url = `${JIRA_SITE_URL}/rest/api/3${endpointPath}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Basic ${base64Auth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });
  
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Jira API error: ${res.status} - ${errText}`);
  }
  return res.status !== 204 ? res.json() : null;
};

// ─── Audit Subsystem ────────────────────────────────────────────────────────

const writeAuditLog = (logEntry) => {
  try {
    let logs = [];
    if (fs.existsSync(AUDIT_FILE)) {
      logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
    }
    logEntry.timestamp = new Date().toISOString();
    logs.unshift(logEntry); // Store latest at the top index 0 natively
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Audit log native error:", err);
  }
};

app.get('/api/audit', (req, res) => {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      res.json(JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8')));
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Core Proxy Routes ──────────────────────────────────────────────────────

app.get('/api/bugs', async (req, res) => {
  try {
    const jql = `project = ${JIRA_PROJECT_KEY} AND issuetype = Bug AND status != Done ORDER BY created DESC`;
    const data = await jiraFetch(`/search/jql?jql=${encodeURIComponent(jql)}&maxResults=100&fields=summary,description,labels,components,priority,status,assignee,reporter,environment,created`);
    
    const bugs = data.issues.map((issue) => {
      let priorityName = issue.fields.priority?.name || "Medium";
      let mappedSev = "Medium";
      let pLower = priorityName.toLowerCase();
      if (pLower === "blocker" || pLower === "critical") mappedSev = "Critical";
      else if (pLower === "high") mappedSev = "High";
      else if (pLower === "low" || pLower === "trivial") mappedSev = "Low";

      return {
        id: issue.key,
        title: issue.fields.summary,
        description: issue.fields.description?.content?.[0]?.content?.[0]?.text || "",
        labels: issue.fields.labels || [],
        components: issue.fields.components?.map((c) => c.name) || [],
        priority: priorityName,
        mappedPrioritySev: mappedSev,
        status: issue.fields.status?.name || "Open",
        currentAssignee: issue.fields.assignee?.displayName || null,
        currentAssigneeAccountId: issue.fields.assignee?.accountId || null,
        reporter: issue.fields.reporter?.displayName || "Unknown",
        reporterAccountId: issue.fields.reporter?.accountId || null,
        environment: issue.fields.environment || "",
        created: issue.fields.created,
        // UI fields
        cat: null,
        sev: null,
        conf: null,
        suggestedAssignee: null,
        suggestedAccountId: null,
        skills: [],
        reasoning: "",
        accepted: false,
      };
    });
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/developers', async (req, res) => {
  try {
    const rolesMap = await jiraFetch(`/project/${JIRA_PROJECT_KEY}/role`);
    const memberMap = {};

    for (const [roleName, roleUrl] of Object.entries(rolesMap)) {
      const pathSuffix = roleUrl.split('/rest/api/3')[1];
      if (!pathSuffix) continue;

      const roleData = await jiraFetch(pathSuffix);
      if (roleData && roleData.actors) {
        for (const actor of roleData.actors) {
          const accountId = actor.actorUser?.accountId || actor.accountId;
          const displayName = actor.actorUser?.displayName || actor.displayName || "Unknown user";
          const accountType = actor.actorUser?.accountType || actor.accountType;

          if (accountType && accountType !== "atlassian") continue;

          const forbiddenNames = ["for Jira", "Atlassian", "Automation", "System", "Migrator", "Spreadsheet", "Outlook", "Teams", "Slack", "Statuspage", "Widget"];
          if (forbiddenNames.some(w => displayName.toLowerCase().includes(w.toLowerCase()))) continue;
          
          if (accountId && !memberMap[accountId]) {
            memberMap[accountId] = {
              accountId,
              name: displayName,
              initials: getInitials(displayName),
              role: roleName,
              load: 0,
              available: true,
            };
          } else if (accountId && memberMap[accountId]) {
            if (!memberMap[accountId].role.includes(roleName)) {
               memberMap[accountId].role += `, ${roleName}`;
            }
          }
        }
      }
    }

    await Promise.all(
      Object.values(memberMap).map(async (dev) => {
        const loadJql = `assignee = "${dev.accountId}" AND project = ${JIRA_PROJECT_KEY} AND status != Done`;
        const loadData = await jiraFetch(`/search/jql?jql=${encodeURIComponent(loadJql)}&maxResults=50`);
        dev.load = loadData?.total || 0;
        dev.available = dev.load < 8; // Developer Guardrails implementation
      })
    );

    res.json(Object.values(memberMap));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/assign/:issueKey', async (req, res) => {
  try {
    const { issueKey } = req.params;
    const { accountId, commentBody, assigneeName, assignedBy } = req.body;
    if (!accountId) return res.status(400).json({ error: "Missing accountId" });

    await jiraFetch(`/issue/${issueKey}/assignee`, {
      method: "PUT",
      body: JSON.stringify({ accountId }),
    });

    if (commentBody) {
      await jiraFetch(`/issue/${issueKey}/comment`, {
        method: "POST",
        body: JSON.stringify({
          body: {
            type: "doc",
            version: 1,
            content: [{ type: "paragraph", content: [{ type: "text", text: commentBody }] }],
          },
        }),
      });
    }

    // Capture explicit assignment into Audit JSON array natively
    writeAuditLog({
      id: Math.random().toString(36).substr(2, 9),
      issue: issueKey,
      action: "Assigned",
      assigneeName: assigneeName || "Unknown API Target",
      assignedBy: assignedBy || "Autonomous SmartBot Engine" 
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/classify → Advanced Production Feature Parsing Strings & Objects
app.post('/api/classify', (req, res) => {
  const { title, description, mappedPrioritySev, labels = [], components = [] } = req.body;
  
  // Implements Phase 1 advanced string injection mapping labels + components + title + description
  const combined = `${title || ''} ${description || ''} ${labels.join(" ")} ${components.join(" ")}`.toLowerCase();
  
  let cat = "Unknown";
  let skills = [];
  let reasoning = "Rule-based: No specific keywords found. Defaulting to fallback mapping metrics.";
  let matched_keywords = [];
  
  const backendWords = ["login", "auth", "password", "username", "token", "session", "jwt", "api", "server", "database", "query", "timeout"];
  const frontendWords = ["button", "click", "ui", "screen", "display", "css", "layout", "mobile", "safari", "browser", "visual"];
  const uiWords = ["design", "color", "font", "spacing", "icon"];

  const getMatched = (words) => words.filter(w => combined.includes(w.toLowerCase()));

  const bMatch = getMatched(backendWords);
  const fMatch = getMatched(frontendWords);
  const uMatch = getMatched(uiWords);

  // Win condition heuristic checking length arrays explicitly
  if (bMatch.length > 0 && bMatch.length >= fMatch.length && bMatch.length >= uMatch.length) {
    cat = "Backend";
    skills = ["API", "Backend"];
    matched_keywords = bMatch;
    reasoning = `Advanced ruleset: Captured backend keywords natively (${bMatch.join(", ")}).`;
  } else if (fMatch.length > 0 && fMatch.length >= uMatch.length) {
    cat = "Frontend";
    skills = ["Frontend", "CSS"];
    matched_keywords = fMatch;
    reasoning = `Advanced ruleset: Captured frontend keywords natively (${fMatch.join(", ")}).`;
  } else if (uMatch.length > 0) {
    cat = "UI";
    skills = ["Design", "UI"];
    matched_keywords = uMatch;
    reasoning = `Advanced ruleset: Captured UI keywords natively (${uMatch.join(", ")}).`;
  }

  // Map Jira priority safely
  let score = 5; // default Medium
  if (mappedPrioritySev === "Critical") score = 10;
  else if (mappedPrioritySev === "High") score = 8;
  else if (mappedPrioritySev === "Medium") score = 5;
  else if (mappedPrioritySev === "Low") score = 3;

  res.json({
    category: cat,
    severity: mappedPrioritySev || "Medium",
    priority_score: score,
    skills_required: skills,
    reasoning: reasoning,
    matched_keywords, // Phase 1 explicit keyword exposing
    confidence: 0.85
  });
});

const server = app.listen(3001, () => {
  console.log('Smart Bug Triage Backend listening on port 3001');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('Error: Port 3001 is already in use!');
    console.error('The server could not start because something else is using this port.');
  } else {
    console.error('Express server failed:', error);
  }
});
