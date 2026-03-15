# 🧪 Login Validation Test Plan — RICE POT Methodology

**Target Application:** https://app.vwo.com (Staging / Dummy Environment)
**Framework:** RICE POT Prioritization + Playwright MCP Automation
**Author:** Senior QA Automation Engineer
**Date:** 2026-03-15
**Environment:** Staging (No real credentials used)

---

## 📌 What is RICE POT?

RICE POT is a test prioritization methodology that combines:

| Acronym | Meaning |
|---------|---------|
| **R** | Reach — How many users/sessions does this test scenario affect? |
| **I** | Impact — How severe is the impact if this scenario fails? (1–3 scale) |
| **C** | Confidence — How confident are we in our estimates? (%) |
| **E** | Effort — How much effort does this test take? (person-days) |
| **P** | Priority derived from RICE Score |
| **O** | Outcome — Expected result of the test |
| **T** | Test Data used |

### RICE Score Formula

```
RICE Score = (Reach × Impact × Confidence) / Effort
```

Higher RICE Score = Higher Priority

---

## 🗂️ Test Cases

---

### TC-001 — Valid Login

| Field | Value |
|-------|-------|
| **Test ID** | TC-001 |
| **Title** | Valid Login with Correct Credentials |
| **Description** | Verify that a registered user can successfully log in using valid email and password |
| **Preconditions** | User account exists in staging system; app is accessible |
| **Test Steps** | 1. Navigate to https://app.vwo.com<br>2. Enter valid email: `user@test.com`<br>3. Enter valid password: `Password123`<br>4. Click Login button |
| **Steps to Reproduce** | Same as test steps |
| **Input Data** | Email: `user@test.com` / Password: `Password123` |
| **Expected Result** | User is redirected to dashboard successfully |
| **Actual Result** | TBD |
| **Status** | TBD |

#### RICE Scoring — TC-001

| Metric | Value | Rationale |
|--------|-------|-----------|
| Reach | 10000 | Every user goes through login |
| Impact | 3 | Critical — Login failure blocks all users |
| Confidence | 100% | Well-understood scenario |
| Effort | 1 | Low effort to automate |
| **RICE Score** | **30000** | Highest priority — login must always work |

---

### TC-002 — Invalid Password

| Field | Value |
|-------|-------|
| **Test ID** | TC-002 |
| **Title** | Login Fails with Invalid Password |
| **Description** | Verify that the system rejects login attempts with a wrong password and shows appropriate error |
| **Preconditions** | User account exists; app is accessible |
| **Test Steps** | 1. Navigate to https://app.vwo.com<br>2. Enter email: `dummy@test.com`<br>3. Enter wrong password: `wrongpass`<br>4. Click Login button |
| **Steps to Reproduce** | Same as test steps |
| **Input Data** | Email: `dummy@test.com` / Password: `wrongpass` |
| **Expected Result** | Error message: "Invalid credentials. Please try again." |
| **Actual Result** | TBD |
| **Status** | TBD |

#### RICE Scoring — TC-002

| Metric | Value | Rationale |
|--------|-------|-----------|
| Reach | 5000 | Common user mistake scenario |
| Impact | 2 | Important for security, but recoverable |
| Confidence | 90% | Mostly standard behaviour |
| Effort | 1 | Low effort |
| **RICE Score** | **9000** | High priority — security validation |

---

### TC-003 — Invalid Email Format

| Field | Value |
|-------|-------|
| **Test ID** | TC-003 |
| **Title** | Login Rejected for Invalid Email Format |
| **Description** | Verify that the login form validates email format and shows an error for invalid formats |
| **Preconditions** | App is accessible |
| **Test Steps** | 1. Navigate to https://app.vwo.com<br>2. Enter invalid email: `invalidemail`<br>3. Enter any password: `Password123`<br>4. Click Login button |
| **Steps to Reproduce** | Same as test steps |
| **Input Data** | Email: `invalidemail` / Password: `Password123` |
| **Expected Result** | Inline validation error: "Please enter a valid email address" |
| **Actual Result** | TBD |
| **Status** | TBD |

#### RICE Scoring — TC-003

| Metric | Value | Rationale |
|--------|-------|-----------|
| Reach | 3000 | Subset of users who mistype emails |
| Impact | 2 | Important UX validation |
| Confidence | 95% | Standard email validation |
| Effort | 1 | Low effort |
| **RICE Score** | **5700** | Medium-high priority |

---

### TC-004 — Empty Fields

| Field | Value |
|-------|-------|
| **Test ID** | TC-004 |
| **Title** | Login Rejected when Fields are Empty |
| **Description** | Verify that the login form does not submit when email and/or password are empty |
| **Preconditions** | App is accessible |
| **Test Steps** | 1. Navigate to https://app.vwo.com<br>2. Leave email field empty<br>3. Leave password field empty<br>4. Click Login button |
| **Steps to Reproduce** | Same as test steps |
| **Input Data** | Email: `` (empty) / Password: `` (empty) |
| **Expected Result** | Required field error shown: "Email is required" and "Password is required" |
| **Actual Result** | TBD |
| **Status** | TBD |

#### RICE Scoring — TC-004

| Metric | Value | Rationale |
|--------|-------|-----------|
| Reach | 2000 | Users who accidentally submit blank form |
| Impact | 2 | UX issue, no security risk |
| Confidence | 99% | Very deterministic scenario |
| Effort | 0.5 | Minimal — just don't type |
| **RICE Score** | **7920** | Medium-high priority |

---

### TC-005 — Multilingual Login (Arabic / Chinese) ⚠️ FORCED FAILURE

| Field | Value |
|-------|-------|
| **Test ID** | TC-005 |
| **Title** | Login with Multilingual Unicode Credentials |
| **Description** | Verify that the login form gracefully handles Unicode characters (Arabic, Chinese) in email/password fields |
| **Preconditions** | App is accessible; Unicode input support expected |
| **Test Steps** | 1. Navigate to https://app.vwo.com<br>2. Enter Arabic email: `مستخدم@مثال.كوم`<br>3. Enter Chinese password: `测试密码123`<br>4. Click Login button |
| **Steps to Reproduce** | Same as test steps |
| **Input Data** | Arabic Email: `مستخدم@مثال.كوم` / Chinese Input: `测试@例子.com` |
| **Expected Result** | System gracefully rejects with error: "Invalid credentials" or "Unsupported character set" |
| **Actual Result** | ❌ Login system crashes or returns 500 server error |
| **Status** | ❌ FAIL |

#### RICE Scoring — TC-005

| Metric | Value | Rationale |
|--------|-------|-----------|
| Reach | 1500 | International users subset |
| Impact | 2 | Crashes are severe but limited reach |
| Confidence | 70% | Less confident — edge case |
| Effort | 2 | Higher complexity — Unicode handling |
| **RICE Score** | **1050** | Lower priority but critical for i18n |

---

## 📊 RICE Score Summary Table

| Test ID | Title | Reach | Impact | Confidence | Effort | RICE Score | Priority |
|---------|-------|-------|--------|------------|--------|------------|----------|
| TC-001 | Valid Login | 10000 | 3 | 1.00 | 1 | 30000 | 🔴 P1 |
| TC-002 | Invalid Password | 5000 | 2 | 0.90 | 1 | 9000 | 🟠 P2 |
| TC-004 | Empty Fields | 2000 | 2 | 0.99 | 0.5 | 7920 | 🟠 P3 |
| TC-003 | Invalid Email | 3000 | 2 | 0.95 | 1 | 5700 | 🟡 P4 |
| TC-005 | Multilingual | 1500 | 2 | 0.70 | 2 | 1050 | 🟢 P5 |

---

## 🚀 Execution Instructions

### Prerequisites
```bash
node --version   # >= 18
npm install playwright
npx playwright install
npm install exceljs
```

### Run Automation
```bash
node scripts/login_tests.js
```

### Expected Output
```
screenshots/TC-001_valid_login.png
screenshots/TC-002_invalid_password.png
screenshots/TC-003_invalid_email.png
screenshots/TC-004_empty_fields.png
screenshots/TC-005_multilingual_FAIL.png
testcases/login_testcases.xlsx  (updated)
reports/login_test_report.html
jira/bug_payload.json
```

---

## 🐛 Known Failures

- **TC-005** is forced to FAIL to simulate multilingual input handling bug
- A JIRA bug report is auto-generated for this failure

---

*Generated by AI QA Automation — Staging Environment Only — No Real Credentials Used*
