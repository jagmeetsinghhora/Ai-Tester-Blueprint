// Generate initial Excel test case template (before execution)
// Run: node testcases/generate_excel.js

const ExcelJS = require('exceljs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, 'login_testcases.xlsx');

const testCases = [
  {
    testId: 'TC-001', title: 'Valid Login', description: 'Verify successful login with valid credentials',
    inputData: 'Email: user@test.com | Pass: Password123',
    stepsToReproduce: '1. Navigate to app\n2. Enter valid email\n3. Enter valid password\n4. Click Login',
    expectedResult: 'User redirected to dashboard', actualResult: '', status: '',
    riceReach: 10000, riceImpact: 3, riceConfidence: 100, riceEffort: 1, riceScore: 30000,
    preconditions: 'User account exists in staging', screenshotPath: ''
  },
  {
    testId: 'TC-002', title: 'Invalid Password', description: 'Verify system rejects wrong password',
    inputData: 'Email: dummy@test.com | Pass: wrongpass',
    stepsToReproduce: '1. Navigate to app\n2. Enter valid email\n3. Enter wrong password\n4. Click Login',
    expectedResult: 'Error: Invalid credentials. Please try again.', actualResult: '', status: '',
    riceReach: 5000, riceImpact: 2, riceConfidence: 90, riceEffort: 1, riceScore: 9000,
    preconditions: 'User account exists in staging', screenshotPath: ''
  },
  {
    testId: 'TC-003', title: 'Invalid Email Format', description: 'Verify email format validation',
    inputData: 'Email: invalidemail | Pass: Password123',
    stepsToReproduce: '1. Navigate to app\n2. Enter malformed email\n3. Enter any password\n4. Click Login',
    expectedResult: 'Validation error: Please enter a valid email address', actualResult: '', status: '',
    riceReach: 3000, riceImpact: 2, riceConfidence: 95, riceEffort: 1, riceScore: 5700,
    preconditions: 'App is accessible', screenshotPath: ''
  },
  {
    testId: 'TC-004', title: 'Empty Fields', description: 'Verify required field validation',
    inputData: 'Email: (empty) | Pass: (empty)',
    stepsToReproduce: '1. Navigate to app\n2. Leave fields empty\n3. Click Login',
    expectedResult: 'Email is required, Password is required', actualResult: '', status: '',
    riceReach: 2000, riceImpact: 2, riceConfidence: 99, riceEffort: 0.5, riceScore: 7920,
    preconditions: 'App is accessible', screenshotPath: ''
  },
  {
    testId: 'TC-005', title: 'Multilingual Login (Arabic/Chinese)', description: 'Verify Unicode input handling',
    inputData: 'Email: مستخدم@مثال.كوم | Pass: 测试@例子.com',
    stepsToReproduce: '1. Navigate to app\n2. Enter Arabic email\n3. Enter Chinese input\n4. Click Login',
    expectedResult: 'Graceful error: Invalid credentials', actualResult: '', status: '',
    riceReach: 1500, riceImpact: 2, riceConfidence: 70, riceEffort: 2, riceScore: 1050,
    preconditions: 'App accessible, Unicode support expected', screenshotPath: ''
  }
];

async function generate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Login Test Cases');

  sheet.columns = [
    { header: 'TestID',           key: 'testId',           width: 10 },
    { header: 'Title',            key: 'title',            width: 35 },
    { header: 'Description',      key: 'description',      width: 40 },
    { header: 'InputData',        key: 'inputData',        width: 40 },
    { header: 'StepsToReproduce', key: 'stepsToReproduce', width: 50 },
    { header: 'ExpectedResult',   key: 'expectedResult',   width: 45 },
    { header: 'ActualResult',     key: 'actualResult',     width: 45 },
    { header: 'Status',           key: 'status',           width: 10 },
    { header: 'RICEReach',        key: 'riceReach',        width: 12 },
    { header: 'RICEImpact',       key: 'riceImpact',       width: 12 },
    { header: 'RICEConfidence',   key: 'riceConfidence',   width: 16 },
    { header: 'RICEEffort',       key: 'riceEffort',       width: 12 },
    { header: 'RICEScore',        key: 'riceScore',        width: 12 },
    { header: 'Preconditions',    key: 'preconditions',    width: 35 },
    { header: 'ScreenshotPath',   key: 'screenshotPath',   width: 45 }
  ];

  sheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    cell.alignment = { horizontal: 'center', wrapText: true };
  });

  testCases.forEach(tc => sheet.addRow(tc));

  await workbook.xlsx.writeFile(OUTPUT_PATH);
  console.log(`✅ Excel generated: ${OUTPUT_PATH}`);
}

generate().catch(console.error);
