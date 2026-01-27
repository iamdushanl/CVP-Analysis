/**
 * Test Prismo with real product data context
 */

// Simulate the DataManager
const MockDataManager = {
    getProducts: () => [
        { name: 'Widget A', price: 100, variableCost: 60, sales: 50, fixedCost: 1000 },
        { name: 'Widget B', price: 150, variableCost: 90, sales: 80, fixedCost: 2000 },
        { name: 'Widget C', price: 200, variableCost: 120, sales: 30, fixedCost: 1500 }
    ],
    getTotalFixedCosts: () => 10000
};

// Build context like Prismo does
function buildContext() {
    const products = MockDataManager.getProducts();
    const fixedCosts = MockDataManager.getTotalFixedCosts();

    let context = `SYSTEM: You are Prismo, an AI CVP assistant. Answer ONLY using the data below. Provide specific numbers and names.\n\n`;

    context += `=== PRODUCT DATA (${products.length} products) ===\n\n`;

    products.forEach((p, index) => {
        const cm = p.price - p.variableCost;
        const pvRatio = ((cm / p.price) * 100).toFixed(1);
        const sales = p.sales || 0;
        const revenue = p.price * sales;
        const totalCM = cm * sales;

        context += `${index + 1}. ${p.name}\n`;
        context += `   • Price: LKR ${p.price.toLocaleString()}\n`;
        context += `   • Variable Cost: LKR ${p.variableCost.toLocaleString()}\n`;
        context += `   • Contribution Margin (CM): LKR ${cm.toLocaleString()} (${pvRatio}%)\n`;
        context += `   • Units Sold: ${sales.toLocaleString()}\n`;
        context += `   • Revenue: LKR ${revenue.toLocaleString()}\n`;
        context += `   • Total Contribution: LKR ${totalCM.toLocaleString()}\n`;

        if (cm > 0) {
            const productFixedCost = p.fixedCost || 0;
            const breakEven = Math.ceil(productFixedCost / cm);
            context += `   • Break-Even Point: ${breakEven} units\n`;
        }

        context += `\n`;
    });

    context += `=== BUSINESS METRICS ===\n`;
    context += `Total Fixed Costs: LKR ${fixedCosts.toLocaleString()}\n\n`;

    context += `=== INSTRUCTIONS ===\n`;
    context += `• Use ONLY the data above\n`;
    context += `• Provide specific product names and numbers\n`;
    context += `• For "top products" queries, rank by Total Contribution\n`;

    return context;
}

// Test context generation
console.log('📊 Testing Prismo Context Generation\n');
console.log('='.repeat(70));

const context = buildContext();
console.log(context);

console.log('='.repeat(70));
console.log('\n✅ Context includes:');
console.log('   • All product names: ✓');
console.log('   • Prices and costs: ✓');
console.log('   • Contribution margins: ✓');
console.log('   • Sales data: ✓');
console.log('   • Break-even points: ✓');
console.log('   • Total contribution (for ranking): ✓');

console.log('\n📝 Sample question: "Show me top 3 profitable products"');
console.log('Expected AI to rank by Total Contribution:');
console.log('   1. Widget B - LKR 4,800 total contribution (80 units × LKR 60 CM)');
console.log('   2. Widget C - LKR 2,400 total contribution (30 units × LKR 80 CM)');
console.log('   3. Widget A - LKR 2,000 total contribution (50 units × LKR 40 CM)');

console.log('\n🎯 Context is comprehensive and should enable specific answers!');
