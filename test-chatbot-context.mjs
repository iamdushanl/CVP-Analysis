// Test comprehensive chatbot context and API
const ChatbotService = await import('./chatbot-service.js').then(m => m.default || m.ChatbotService);
const DataManager = await import('./data-manager.js').then(m => m.default || m.DataManager);
const CVPCalculator = await import('./cvp-calculator.js').then(m => m.default || m.CVPCalculator);
const CVP_KNOWLEDGE_BASE = await import('./cvp-knowledge-base.js').then(m => m.default || m.CVP_KNOWLEDGE_BASE);

console.log('🧪 Testing Chatbot Comprehensive Context...\n');

// Initialize
DataManager.init();
ChatbotService.init();

console.log('📊 Data Available:');
console.log('   Products:', DataManager.getProducts().length);
console.log('   Sales:', DataManager.getSales().length);
console.log('   Fixed Costs:', DataManager.getFixedCosts().length);
console.log('');

// Test buildContext
console.log('🔍 Building Context...');
const context = ChatbotService.buildContext();

console.log('📝 Context Stats:');
console.log('   Length:', context.length, 'characters');
console.log('   Has product names:', /Widget|Product/.test(context));
console.log('   Has prices:', /Price:|LKR/.test(context));
console.log('   Has contribution margins:', /Contribution Margin/.test(context));
console.log('   Has sales data:', /Units Sold:|Revenue/.test(context));
console.log('   Has categories:', /CATEGORY ANALYSIS/.test(context));
console.log('   Has business metrics:', /BUSINESS METRICS/.test(context));
console.log('   Has top performers:', /TOP PERFORMERS/.test(context));
console.log('');

// Show a snippet
console.log('📄 Context Preview (first 500 chars):');
console.log(context.substring(0, 500));
console.log('...\n');

console.log('✅ Context generation test complete!');
