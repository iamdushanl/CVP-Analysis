/**
 * Test if Prismo now gives complete, direct answers
 */

// Test message that should trigger a complete response
const userQuestion = "What's my margin of safety?";

const mockContext = `SYSTEM: You are Prismo, an AI CVP assistant. Answer ONLY using the data below. Provide specific numbers and names.

=== PRODUCT DATA (2 products) ===

1. Widget A
   • Price: LKR 100
   • Variable Cost: LKR 60
   • Contribution Margin (CM): LKR 40 (40.0%)
   • Units Sold: 50
   • Revenue: LKR 5,000
   • Total Contribution: LKR 2,000
   • Break-Even Point: 25 units

2. Widget B
   • Price: LKR 150
   • Variable Cost: LKR 90
   • Contribution Margin (CM): LKR 60 (40.0%)
   • Units Sold: 80
   • Revenue: LKR 12,000
   • Total Contribution: LKR 4,800
   • Break-Even Point: 34 units

=== BUSINESS METRICS ===
Total Fixed Costs: LKR 10,000

=== INSTRUCTIONS ===
• Use ONLY the data above
• Provide specific product names and numbers
• Format currency as LKR
• ALWAYS provide COMPLETE answers - DO NOT cut off
• NEVER say "I need..." or "I will..." - JUST PROVIDE THE DATA NOW
• DO NOT explain formulas - GIVE DIRECT ANSWERS

===USER QUESTION===
${userQuestion}

===RESPONSE INSTRUCTIONS===
1. Provide a COMPLETE, COMPREHENSIVE answer
2. Use the EXACT product data above
3. Include ALL relevant numbers and names
4. DO NOT explain methodology - just provide the answer
5. Format with bullet points or lists
6. DO NOT cut off mid-sentence - finish your response
7. Be specific and data-driven

Answer now:`;

console.log('📋 ENHANCED PROMPT TEST\n');
console.log('='.repeat(70));
console.log(mockContext);
console.log('='.repeat(70));

console.log('\n✅ Prompt enhancements:');
console.log('   • "COMPLETE answers" instruction added');
console.log('   • "DO NOT cut off" explicitly stated');
console.log('   • "NEVER say I need/I will" - forces direct answers');
console.log('   • "DO NOT explain" - prevents methodology explanations');
console.log('   • Numbered response instructions for clarity');

console.log('\n🎯 Expected behavior change:');
console.log('   BEFORE: "To calculate margin of safety, I need..."');
console.log('   AFTER: "Your margin of safety:\n   • Widget A: 25 units...");

console.log('\n📊 Prompt is now more explicit and directive!');
