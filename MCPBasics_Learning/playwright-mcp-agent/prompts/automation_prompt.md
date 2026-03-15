# 🤖 Autonomous QA Automation Agent — Automation Prompt & Test Plan

**Agent Name:** `login-automation-qa-agent`
**Role:** Senior QA Automation Agent
**Target:** https://app.vwo.com
**Environment:** Staging
**Methodology:** RICE POT Prioritization

---

## 🎯 Objective
Automate 5 login workflows using Playwright MCP based on the RICE POT framework. Handle dummy credentials safely. Generate Excel execution logs, HTML reports, screenshots, and integrate with JIRA MCP.

---

## 📊 RICE Score Formula
`RICE Score = (Reach × Impact × Confidence) / Effort`

---

## 📋 Generated RICE POT Test Cases

### TC-001: Valid login
- **TestID:** TC-001
- **Title:** Valid Login Authentication
- **Description:** Verify user can log in with valid credentials.
- **InputData:** Email: `user@test.com` | Password: `Password123`
- **StepsToReproduce:** 
  1. Navigate to https://app.vwo.com
  2. Enter valid email
  3. Enter valid password
  4. Click Login
- **ExpectedResult:** User is securely redirected to the dashboard.
- **Preconditions:** Staging dummy account exists.
- **RICEReach:** 10000 | **RICEImpact:** 3 | **RICEConfidence:** 100 | **RICEEffort:** 1
- **RICEScore:** `30000`

### TC-002: Invalid password
- **TestID:** TC-002
- **Title:** Rejected Invalid Password
- **Description:** Verify the system rejects login if password is wrong.
- **InputData:** Email: `dummy@test.com` | Password: `wrongpassword`
- **StepsToReproduce:** 
  1. Navigate to https://app.vwo.com
  2. Enter email
  3. Enter wrong password
  4. Click Login
- **ExpectedResult:** System displays an "Invalid email or password" error.
- **Preconditions:** App accessible.
- **RICEReach:** 5000 | **RICEImpact:** 2 | **RICEConfidence:** 90 | **RICEEffort:** 1
- **RICEScore:** `9000`

### TC-003: Invalid email format
- **TestID:** TC-003
- **Title:** Rejected Invalid Email Format
- **Description:** Verify client-side format validation for email.
- **InputData:** Email: `invalidemail` | Password: `Password123`
- **StepsToReproduce:** 
  1. Navigate to https://app.vwo.com
  2. Enter malformed email
  3. Enter any password
  4. Click Login
- **ExpectedResult:** Inline error "Please enter a valid email address".
- **Preconditions:** App accessible.
- **RICEReach:** 3000 | **RICEImpact:** 2 | **RICEConfidence:** 95 | **RICEEffort:** 1
- **RICEScore:** `5700`

### TC-004: Blank login fields
- **TestID:** TC-004
- **Title:** Required Fields Validation
- **Description:** Verify blank form submission is blocked.
- **InputData:** Email: `[Blank]` | Password: `[Blank]`
- **StepsToReproduce:** 
  1. Navigate to https://app.vwo.com
  2. Leave fields empty
  3. Click Login
- **ExpectedResult:** Required field errors displayed for both fields.
- **Preconditions:** App accessible.
- **RICEReach:** 2000 | **RICEImpact:** 2 | **RICEConfidence:** 99 | **RICEEffort:** 0.5
- **RICEScore:** `7920`

### TC-005: Multilingual login input
- **TestID:** TC-005
- **Title:** Multilingual Unicode Login Support
- **Description:** Verify the app handles non-Latin strings (Arabic/Chinese) without crashing.
- **InputData:** Email: `مستخدم@مثال.كوم` | Password: `测试@例子.com`
- **StepsToReproduce:** 
  1. Navigate to https://app.vwo.com
  2. Enter Arabic email
  3. Enter Chinese characters as password
  4. Click Login
- **ExpectedResult:** System should gracefully reject multilingual credentials.
- **Preconditions:** App accessible.
- **RICEReach:** 1500 | **RICEImpact:** 2 | **RICEConfidence:** 70 | **RICEEffort:** 2
- **RICEScore:** `1050`

---
> **Execution Note:** The automation agent will intentionally force `TC-005` to fail to simulate a Unicode processing failure and trigger JIRA bug generation.
