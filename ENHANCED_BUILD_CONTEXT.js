// ============================================
// ENHANCED buildContext() METHOD
// Senior SSE Implementation
// ============================================

buildContext() {
    try {
        // Fetch ALL data sources
        const products = DataManager.getProducts();
        const salesData = DataManager.getSales();
        const fixedCostsData = DataManager.getFixedCosts();
        const totalFixedCosts = DataManager.getTotalFixedCosts();
        const settings = typeof SettingsManager !== 'undefined' ? SettingsManager.getSettings() : { currency: 'LKR' };

        console.log('🔍 [SSE] Building comprehensive context...');
        console.log('   📦 Products:', products.length);
        console.log('   💰 Sales:', salesData.length);
        console.log('   🏢 Fixed Costs:', fixedCostsData.length);

        let context = `SYSTEM: You are Prismo, an AI-powered CVP (Cost-Volume-Profit) Assistant.\n`;
        context += `You have COMPLETE access to all business data below. Answer questions with specific data.\n\n`;

        // ============================================
        // 1. PRODUCT DATA WITH SALES ANALYTICS
        // ============================================
        const productsWithSales = products.map(p => {
            const price = p.sellingPrice || 0;
            const varCost = p.variableCost || 0;
            const cm = price - varCost;
            const pvRatio = price > 0 ? ((cm / price) * 100).toFixed(1) : '0.0';

            // Calculate sales metrics
            const productSales = salesData.filter(s => s.productId === p.id);
            const totalUnits = productSales.reduce((sum, s) => sum + (s.quantity || 0), 0);
            const revenue = price * totalUnits;
            const totalCM = cm * totalUnits;
            const productShare = products.length > 0 ? totalFixedCosts / products.length : 0;
            const breakEven = cm > 0 ? Math.ceil(productShare / cm) : 0;

            return {
                ...p,
                price,
                varCost,
                cm,
                pvRatio: parseFloat(pvRatio),
                totalUnits,
                revenue,
                totalCM,
                breakEven
            };
        });

        // Sort by total contribution (most profitable first)
        const sortedProducts = [...productsWithSales].sort((a, b) => b.totalCM - a.totalCM);

        context += `=== 📦 PRODUCT DATA (${products.length} products) ===\n\n`;

        sortedProducts.forEach((p, index) => {
            context += `${index + 1}. ${p.name}`;
            if (p.category) context += ` [${p.category}]`;
            if (p.sku) context += ` (SKU: ${p.sku})`;
            context += `\n`;
            context += `   • Price: ${settings.currency} ${p.price.toLocaleString()}\n`;
            context += `   • Variable Cost: ${settings.currency} ${p.varCost.toLocaleString()}\n`;
            context += `   • Contribution Margin: ${settings.currency} ${p.cm.toLocaleString()} per unit (${p.pvRatio}% P/V Ratio)\n`;
            context += `   • Units Sold: ${p.totalUnits.toLocaleString()} units\n`;
            context += `   • Revenue Generated: ${settings.currency} ${p.revenue.toLocaleString()}\n`;
            context += `   • Total Contribution: ${settings.currency} ${p.totalCM.toLocaleString()}\n`;
            context += `   • Break-Even Point: ${p.breakEven.toLocaleString()} units\n`;
            context += `   • Profitability Rank: #${index + 1}\n`;
            context += `\n`;
        });

        // ============================================
        // 2. CATEGORY AGGREGATIONS
        // ============================================
        const categories = {};
        productsWithSales.forEach(p => {
            const cat = p.category || 'Uncategorized';
            if (!categories[cat]) {
                categories[cat] = {
                    products: 0,
                    units: 0,
                    revenue: 0,
                    contribution: 0
                };
            }
            categories[cat].products++;
            categories[cat].units += p.totalUnits;
            categories[cat].revenue += p.revenue;
            categories[cat].contribution += p.totalCM;
        });

        context += `=== 📊 CATEGORY ANALYSIS ===\n\n`;
        Object.entries(categories).forEach(([cat, data]) => {
            context += `${cat}:\n`;
            context += `   • Products: ${data.products}\n`;
            context += `   • Units Sold: ${data.units.toLocaleString()}\n`;
            context += `   • Revenue: ${settings.currency} ${data.revenue.toLocaleString()}\n`;
            context += `   • Total Contribution: ${settings.currency} ${data.contribution.toLocaleString()}\n`;
            context += `\n`;
        });

        // ============================================
        // 3. BUSINESS-WIDE METRICS
        // ============================================
        const totalRevenue = productsWithSales.reduce((sum, p) => sum + p.revenue, 0);
        const totalContribution = productsWithSales.reduce((sum, p) => sum + p.totalCM, 0);
        const totalUnits = productsWithSales.reduce((sum, p) => sum + p.totalUnits, 0);
        const netProfit = totalContribution - totalFixedCosts;
        const avgCMRatio = totalRevenue > 0 ? ((totalContribution / totalRevenue) * 100).toFixed(1) : '0.0';

        // Overall break-even
        const overallBreakEven = avgCMRatio > 0 ? Math.ceil((totalFixedCosts / (parseFloat(avgCMRatio) / 100))) : 0;

        // Margin of safety
        const marginOfSafety = totalRevenue > 0 ? (((totalRevenue - overallBreakEven) / totalRevenue) * 100).toFixed(1) : '0.0';

        context += `=== 💼 BUSINESS METRICS ===\n\n`;
        context += `Financial Performance:\n`;
        context += `   • Total Revenue: ${settings.currency} ${totalRevenue.toLocaleString()}\n`;
        context += `   • Total Fixed Costs: ${settings.currency} ${totalFixedCosts.toLocaleString()}/month\n`;
        context += `   • Total Contribution: ${settings.currency} ${totalContribution.toLocaleString()}\n`;
        context += `   • Net Profit: ${settings.currency} ${netProfit.toLocaleString()}\n`;
        context += `   • Overall P/V Ratio: ${avgCMRatio}%\n`;
        context += `   • Break-Even Revenue: ${settings.currency} ${overallBreakEven.toLocaleString()}\n`;
        context += `   • Margin of Safety: ${marginOfSafety}%\n`;
        context += `\n`;

        context += `Sales Volume:\n`;
        context += `   • Total Units Sold: ${totalUnits.toLocaleString()}\n`;
        context += `   • Total Transactions: ${salesData.length.toLocaleString()}\n`;
        context += `   • Average Transaction Value: ${settings.currency} ${(totalRevenue / Math.max(salesData.length, 1)).toFixed(0)}\n`;
        context += `\n`;

        context += `Product Mix:\n`;
        context += `   • Total Products: ${products.length}\n`;
        context += `   • Product Categories: ${Object.keys(categories).length}\n`;
        context += `   • Products with Sales: ${productsWithSales.filter(p => p.totalUnits > 0).length}\n`;
        context += `   • Products at Break-Even: ${productsWithSales.filter(p => p.totalUnits >= p.breakEven).length}\n`;
        context += `\n`;

        // ============================================
        // 4. FIXED COSTS BREAKDOWN
        // ============================================
        context += `=== 🏢 FIXED COSTS BREAKDOWN ===\n\n`;
        fixedCostsData.forEach((cost, index) => {
            const monthlyAmount = this.normalizeToMonthly(cost.amount, cost.frequency || 'monthly');
            context += `${index + 1}. ${cost.name}: ${settings.currency} ${monthlyAmount.toLocaleString()}/month`;
            if (cost.frequency && cost.frequency !== 'monthly') {
                context += ` (${cost.frequency}: ${settings.currency} ${cost.amount.toLocaleString()})`;
            }
            context += `\n`;
        });
        context += `Total Monthly Fixed Costs: ${settings.currency} ${totalFixedCosts.toLocaleString()}\n\n`;

        // ============================================
        // 5. TOP PERFORMERS
        // ============================================
        context += `=== 🏆 TOP PERFORMERS ===\n\n`;

        // Top 5 by contribution
        context += `Top 5 Most Profitable (by Total Contribution):\n`;
        sortedProducts.slice(0, 5).forEach((p, i) => {
            context += `   ${i + 1}. ${p.name}: ${settings.currency} ${p.totalCM.toLocaleString()}\n`;
        });
        context += `\n`;

        // Top 5 by revenue
        const byRevenue = [...productsWithSales].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        context += `Top 5 by Revenue:\n`;
        byRevenue.forEach((p, i) => {
            context += `   ${i + 1}. ${p.name}: ${settings.currency} ${p.revenue.toLocaleString()}\n`;
        });
        context += `\n`;

        // Top 5 by units sold
        const byUnits = [...productsWithSales].sort((a, b) => b.totalUnits - a.totalUnits).slice(0, 5);
        context += `Top 5 by Units Sold:\n`;
        byUnits.forEach((p, i) => {
            context += `   ${i + 1}. ${p.name}: ${p.totalUnits.toLocaleString()} units\n`;
        });
        context += `\n`;

        // Top 5 by P/V ratio
        const byPVRatio = [...productsWithSales].filter(p => p.totalUnits > 0).sort((a, b) => b.pvRatio - a.pvRatio).slice(0, 5);
        context += `Top 5 by P/V Ratio (Efficiency):\n`;
        byPVRatio.forEach((p, i) => {
            context += `   ${i + 1}. ${p.name}: ${p.pvRatio}%\n`;
        });
        context += `\n`;

        // ============================================
        // 6. AI INSTRUCTIONS
        // ============================================
        context += `=== 🤖 RESPONSE GUIDELINES ===\n\n`;
        context += `1. ALWAYS use the data above - it is COMPLETE and CURRENT\n`;
        context += `2. Provide SPECIFIC product names and numbers\n`;
        context += `3. Format all currency as ${settings.currency}\n`;
        context += `4. For "top products" - rank by Total Contribution\n`;
        context += `5. For profitability - consider Total Contribution (NOT just margin %)\n`;
        context += `6. COMPLETE your answer - NEVER cut off mid-sentence\n`;
        context += `7. NEVER say "I need data" - you HAVE all data above\n`;
        context += `8. DO NOT explain calculations - give DIRECT answers with data\n`;
        context += `9. Be specific, accurate, and complete\n`;
        context += `10. Reference exact numbers from the data\n`;

        console.log('✅ [SSE] Context built successfully');
        console.log('   📄 Context size:', context.length, 'characters');
        console.log('   ✅ Products with full analytics');
        console.log('   ✅ Category aggregations');
        console.log('   ✅ Business metrics');
        console.log('   ✅ Top performers');
        console.log('   ✅ Fixed costs breakdown');

        return context;
    } catch (error) {
        console.error('❌ [SSE] Error building context:', error);
        return 'You are Prismo, a CVP analysis assistant. Help users with cost-volume-profit questions.';
    }
}

// Helper: Normalize costs to monthly
normalizeToMonthly(amount, frequency) {
    switch (frequency) {
        case 'daily': return amount * 30;
        case 'weekly': return amount * 4.33;
        case 'monthly': return amount;
        case 'quarterly': return amount / 3;
        case 'yearly': return amount / 12;
        default: return amount;
    }
}
