# Playwright MCP — Login Test Automation (RICE POT)

> **⚠️ Staging/Dummy environment only. No real credentials used.**

## 🗂️ Project Structure

```
playwright-mcp-project/
├── prompts/
│   └── test_prompt.md          ← RICE POT test plan + all 5 test cases
├── testcases/
│   ├── login_testcases.xlsx    ← Test execution log (auto-updated)
│   └── generate_excel.js       ← Script to generate initial Excel template
├── scripts/
│   └── login_tests.js          ← Main Playwright automation script
├── screenshots/                ← Auto-created screenshots per test case
├── reports/
│   └── login_test_report.html  ← Standalone HTML report
├── jira/
│   └── bug_payload.json        ← JIRA REST API payload for TC-005 bug
└── package.json
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install playwright exceljs
npx playwright install
```

### 2. Generate Excel Template (optional — run before automation)

```bash
node testcases/generate_excel.js
```

### 3. Run Automation

```bash
node scripts/login_tests.js
# or
npm test
```

### Expected Output

```
✅ TC-001 PASS | RICE: 30000 | Screenshot: TC-001_valid_login.png
✅ TC-002 PASS | RICE: 9000  | Screenshot: TC-002_invalid_password.png
✅ TC-003 PASS | RICE: 5700  | Screenshot: TC-003_invalid_email.png
✅ TC-004 PASS | RICE: 7920  | Screenshot: TC-004_empty_fields.png
❌ TC-005 FAIL | RICE: 1050  | Screenshot: TC-005_multilingual_FAIL.png

📊 Excel saved: testcases/login_testcases.xlsx
📄 HTML Report saved: reports/login_test_report.html
🐛 JIRA Bug: KAN-1
✅ All done!
```

## 📋 Test Cases (RICE POT)

| ID | Title | RICE Score | Priority | Status |
|----|-------|-----------|----------|--------|
| TC-001 | Valid Login | 30000 | 🔴 P1 | ✅ PASS |
| TC-002 | Invalid Password | 9000 | 🟠 P2 | ✅ PASS |
| TC-004 | Empty Fields | 7920 | 🟠 P3 | ✅ PASS |
| TC-003 | Invalid Email | 5700 | 🟡 P4 | ✅ PASS |
| TC-005 | Multilingual (Arab/Chinese) | 1050 | 🟢 P5 | ❌ FAIL |

> **TC-005** is intentionally forced to FAIL to simulate a Unicode-handling bug.

## 🐛 JIRA Bug

- **Issue:** [KAN-1](https://jagmeetsingh0106007-1773566139171.atlassian.net/browse/KAN-1)
- **Summary:** TC-005: Login fails when multilingual credentials (Arabic/Chinese) are used
- **Priority:** Medium
- **Labels:** login, multilingual, unicode, automation

## ⚙️ Requirements

- Node.js >= 18
- npm packages: `playwright`, `exceljs`
- JIRA access: Atlassian MCP server connected

---
*Phase 6 — Playwright MCP Project | RICE POT QA Automation*
