
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock Browser Globals
global.localStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = value.toString(); },
    clear() { this.store = {}; }
};
global.console = console;
global.fetch = async () => ({
    ok: true,
    json: async () => ({
        candidates: [{ content: { parts: [{ text: "I am Prismo" }] } }]
    })
});

// Mock Dependencies
global.SettingsManager = {
    getSettings: () => ({ geminiApiKey: 'test-key' }),
    updateSettings: () => { }
};
global.DataManager = {
    getProducts: () => [],
    getSales: () => [],
    getFixedCosts: () => [],
    getTotalFixedCosts: () => 0
};
global.CVP_KNOWLEDGE_BASE = {
    formulas: {},
    concepts: {},
    getFormula: () => ({}),
    getConcept: () => ({})
};

// Load ChatbotService
const filePath = path.resolve(__dirname, 'chatbot-service.js');
let code = fs.readFileSync(filePath, 'utf8');
code += '\nglobal.ChatbotService = ChatbotService;';

try {
    vm.runInThisContext(code);
} catch (e) {
    console.error("Syntax Error in Chatbot Service:", e);
    process.exit(1);
}

// Tests
console.log('--- Testing ChatbotService ---');

// Test 1: Init
const initResult = ChatbotService.init();
console.log(`Init Result: ${initResult} | Expected: true | ${initResult === true ? 'PASS' : 'FAIL'}`);

// Test 2: Send Message
(async () => {
    try {
        const response = await ChatbotService.sendMessageToGemini("Hello");
        console.log(`Message Response: ${JSON.stringify(response)} | PASS`);
    } catch (e) {
        console.error(`Message Response: Error ${e.message} | FAIL`);
    }
})();
