
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock Browser Environment
const localStorageMock = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = value.toString(); },
    clear() { this.store = {}; }
};

global.localStorage = localStorageMock;
global.console = console;

// Load DataManager
const filePath = path.resolve(__dirname, 'data-manager.js');
let code = fs.readFileSync(filePath, 'utf8');
code += '\nglobal.DataManager = DataManager;';

vm.runInThisContext(code);

// Test Logic
console.log('--- Testing DataManager.normalizeDate ---');

const date1 = DataManager.normalizeDate('2024-01-15');
console.log(`2024-01-15 -> ${date1} | Expected: 2024-01-15 | ${date1 === '2024-01-15' ? 'PASS' : 'FAIL'}`);

const invalidDate = '2024-13-01'; // Month 13
const date2 = DataManager.normalizeDate(invalidDate);
const today = new Date().toISOString().split('T')[0];
console.log(`${invalidDate} -> ${date2} | Expected: ${today} | ${date2 === today ? 'PASS' : 'FAIL'}`);

const invalidDay = '2024-02-30'; // Feb 30
const date3 = DataManager.normalizeDate(invalidDay);
console.log(`${invalidDay} -> ${date3} | Expected: ${today} | ${date3 === today ? 'PASS' : 'FAIL'}`);

const nonsense = 'nonsense';
const date4 = DataManager.normalizeDate(nonsense);
console.log(`${nonsense} -> ${date4} | Expected: ${today} | ${date4 === today ? 'PASS' : 'FAIL'}`);

if (date1 === '2024-01-15' && date2 === today && date3 === today && date4 === today) {
    console.log('✅ All DataManager date tests Passed');
    process.exit(0);
} else {
    console.error('❌ DataManager validation Failed');
    process.exit(1);
}
