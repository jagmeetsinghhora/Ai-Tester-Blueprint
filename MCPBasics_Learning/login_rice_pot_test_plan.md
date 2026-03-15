# Login Validation Test Plan (RICE POT Framework)

Target Application: **Placeholder staging environment**\
Example Reference: `https://app.vwo.com`\
Safe Test URL Used: `https://staging.example-login-app.com/login`

⚠️ **Note:** No real credentials or production accounts are used.

------------------------------------------------------------------------

# 1. Test Plan (RICE POT Methodology)

RICE Formula:

OverallScore = (Reach × Impact × Confidence) / Effort

  --------------------------------------------------------------------------------------
  TestID   Description    Reach   Impact   Confidence   Effort   Score   Rationale
  -------- -------------- ------- -------- ------------ -------- ------- ---------------
  TC01     Valid Login    100     5        0.9          2        225     Core
                                                                         functionality
                                                                         used by every
                                                                         user

  TC02     Invalid        90      4        0.85         2        153     High frequency
           Password                                                      user mistake

  TC03     Invalid Email  70      3        0.8          1        168     Input
           Format                                                        validation
                                                                         requirement

  TC04     Blank Inputs   60      3        0.9          1        162     Common UI
                                                                         validation
                                                                         scenario

  TC05     Multilingual   40      2        0.7          2        28      Edge case for
           Inputs                                                        international
                                                                         input
  --------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 2. Detailed Test Cases

## TC01 Valid Login

**Preconditions** - Test user exists in staging database

**Input** Email: test.user@example.com\
Password: Password123

**Steps** 1. Navigate to login page 2. Enter valid email 3. Enter valid
password 4. Click login

**Expected Result** User redirected to dashboard

------------------------------------------------------------------------

## TC02 Invalid Password

**Preconditions** User exists

**Input** Email: test.user@example.com\
Password: WrongPassword

**Steps** 1. Navigate to login page 2. Enter valid email 3. Enter
invalid password 4. Click login

**Expected Result** Error message displayed: "Invalid credentials"

------------------------------------------------------------------------

## TC03 Invalid Email Format

**Input** Email: invalidemail\
Password: Password123

**Steps** 1. Navigate to login page 2. Enter invalid email format 3.
Enter password 4. Click login

**Expected Result** Email validation error displayed

------------------------------------------------------------------------

## TC04 Blank Inputs

**Input** Email: (blank)\
Password: (blank)

**Steps** 1. Open login page 2. Click login without entering values

**Expected Result** Required field validation messages appear

------------------------------------------------------------------------

## TC05 Multilingual Input (Expected Failure Case)

**Input** Email: 测试@例子.com\
Password: كلمةالسر

**Steps** 1. Navigate to login page 2. Enter multilingual characters 3.
Click login

**Expected Result** System should gracefully reject unsupported input

**Actual Result (Simulated Failure)** System crashes with server
validation error

------------------------------------------------------------------------

# 3. Excel Dataset (Copy to Spreadsheet)

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  TestID   Description    Input            ExpectedResult   ActualResult   PassFail   RICEReach   RICEImpact   RICEConfidence   RICEEffort   OverallScore   Preconditions
  -------- -------------- ---------------- ---------------- -------------- ---------- ----------- ------------ ---------------- ------------ -------------- ---------------
  TC01     Valid Login    valid            Redirect to      Dashboard      Pass       100         5            0.9              2            225            Test user
                          credentials      dashboard        loaded                                                                                          exists

  TC02     Invalid        wrong password   Error message    Error shown    Pass       90          4            0.85             2            153            User exists
           Password                                                                                                                                         

  TC03     Invalid Email  invalid email    Validation       Validation     Pass       70          3            0.8              1            168            None
                          format           message          shown                                                                                           

  TC04     Blank Fields   empty inputs     Required field   Error shown    Pass       60          3            0.9              1            162            None
                                           error                                                                                                            

  TC05     Multilingual   Arabic/Chinese   Graceful         Server error   Fail       40          2            0.7              2            28             None
           Input                           rejection                                                                                                        
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 4. HTML Report (Standalone Example)

``` html
<!DOCTYPE html>
<html>
<head>
<title>Login Test Report</title>
</head>
<body>

<h2>Login Test Summary</h2>

<table border="1">
<tr>
<th>TestID</th>
<th>Description</th>
<th>Steps</th>
<th>Expected</th>
<th>Actual</th>
<th>Status</th>
<th>Screenshot</th>
</tr>

<tr>
<td>TC01</td>
<td>Valid Login</td>
<td>Enter valid credentials</td>
<td>Dashboard loads</td>
<td>Dashboard loaded</td>
<td>PASS</td>
<td>screenshots/TC01.png</td>
</tr>

<tr>
<td>TC05</td>
<td>Multilingual Input</td>
<td>Enter Chinese/Arabic credentials</td>
<td>Validation error</td>
<td>Server error</td>
<td>FAIL</td>
<td>screenshots/TC05.png</td>
</tr>

</table>

</body>
</html>
```

------------------------------------------------------------------------

# 5. Playwright Automation Plan

## Dependencies

Node.js ≥ 18

Install:

    npm init -y
    npm install playwright
    npx playwright install

------------------------------------------------------------------------

## Playwright Example Script

``` javascript
const { chromium } = require('playwright');

const tests = [
{ id:'TC01', email:'test.user@example.com', password:'Password123' },
{ id:'TC02', email:'test.user@example.com', password:'WrongPassword' },
{ id:'TC03', email:'invalidemail', password:'Password123' },
{ id:'TC04', email:'', password:'' },
{ id:'TC05', email:'测试@例子.com', password:'كلمةالسر' }
];

(async () => {

const browser = await chromium.launch();
const page = await browser.newPage();

for(const t of tests){

await page.goto('https://staging.example-login-app.com/login');

await page.fill('#email', t.email);
await page.fill('#password', t.password);
await page.click('#login');

await page.screenshot({ path:`screenshots/${t.id}.png` });

}

await browser.close();

})();
```

------------------------------------------------------------------------

# 6. Failure Handling (JIRA Bug)

## Bug Summary

Login system crashes when multilingual characters are used in login
fields.

## Description

The login form does not properly validate Unicode inputs.

## Steps to Reproduce

1.  Open login page
2.  Enter Chinese email
3.  Enter Arabic password
4.  Click login

## Expected Result

Input validation error shown.

## Actual Result

Server returns 500 error.

## Environment

Staging environment\
Chrome browser

## Severity

Medium

------------------------------------------------------------------------

# JIRA API JSON Payload

``` json
{
 "fields": {
   "project": { "key": "QA" },
   "summary": "Login fails with multilingual input",
   "description": "System crashes when Chinese/Arabic input used in login form.",
   "issuetype": { "name": "Bug" },
   "priority": { "name": "Medium" }
 }
}
```

------------------------------------------------------------------------

# 7. Run Instructions

    node login-tests.js

Outputs

-   screenshots/
-   HTML report
-   console test results
