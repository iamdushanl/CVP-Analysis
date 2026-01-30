// ========================================
// CVP Calculator - Business Logic
// ========================================

const CVPCalculator = {
    /**
     * Calculate contribution margin per unit
     * @param {number} sellingPrice - Selling price per unit
     * @param {number} variableCost - Variable cost per unit
     * @returns {number} Contribution margin per unit
     */
    calculateContributionMargin(sellingPrice, variableCost) {
        return sellingPrice - variableCost;
    },

    /**
     * Calculate Profit-Volume (PV) Ratio / Contribution Margin Ratio
     * @param {number} sellingPrice - Selling price per unit
     * @param {number} variableCost - Variable cost per unit
     * @returns {number} PV Ratio as percentage (0-100)
     */
    calculatePVRatio(sellingPrice, variableCost) {
        if (sellingPrice === 0) return 0;
        const contributionMargin = this.calculateContributionMargin(sellingPrice, variableCost);
        return (contributionMargin / sellingPrice) * 100;
    },

    /**
     * Calculate break-even point in units
     * @param {number} fixedCosts - Total fixed costs
     * @param {number} contributionMargin - Contribution margin per unit
     * @returns {number} Break-even units
     */
    calculateBreakEvenUnits(fixedCosts, contributionMargin) {
        if (contributionMargin === 0) return 0;
        return fixedCosts / contributionMargin;
    },

    /**
     * Calculate break-even point in sales value
     * @param {number} fixedCosts - Total fixed costs
     * @param {number} pvRatio - PV Ratio (as decimal, e.g., 0.4 for 40%)
     * @returns {number} Break-even sales value
     */
    calculateBreakEvenSalesValue(fixedCosts, pvRatio) {
        if (pvRatio === 0) return 0;
        return fixedCosts / (pvRatio / 100);
    },

    /**
     * Calculate margin of safety
     * @param {number} actualSales - Actual sales (units or value)
     * @param {number} breakEvenSales - Break-even sales (units or value)
     * @returns {number} Margin of safety as percentage
     */
    calculateMarginOfSafety(actualSales, breakEvenSales) {
        // Handle edge cases
        if (actualSales === 0) return -100; // No sales = -100% margin
        if (breakEvenSales === 0) return 100; // No break-even needed = 100% margin
        if (!isFinite(breakEvenSales) || breakEvenSales < 0) return -100; // Invalid break-even

        // Calculate margin of safety
        const margin = ((actualSales - breakEvenSales) / actualSales) * 100;

        // Cap at -100% minimum (can't be worse than having zero sales)
        return Math.max(margin, -100);
    },

    /**
     * Calculate total profit/loss
     * @param {number} salesRevenue - Total sales revenue
     * @param {number} variableCosts - Total variable costs
     * @param {number} fixedCosts - Total fixed costs
     * @returns {number} Profit (positive) or loss (negative)
     */
    calculateProfit(salesRevenue, variableCosts, fixedCosts) {
        return salesRevenue - variableCosts - fixedCosts;
    },

    /**
     * Calculate total contribution
     * @param {number} units - Number of units sold
     * @param {number} contributionMargin - Contribution margin per unit
     * @returns {number} Total contribution
     */
    calculateTotalContribution(units, contributionMargin) {
        return units * contributionMargin;
    },

    /**
     * Perform complete CVP analysis for a product
     * @param {object} params - Analysis parameters
     * @returns {object} Complete CVP analysis results
     */
    performAnalysis(params) {
        const {
            sellingPrice,
            variableCost,
            fixedCosts,
            actualSalesUnits = 0,
            actualSalesValue = 0
        } = params;

        const contributionMargin = this.calculateContributionMargin(sellingPrice, variableCost);
        const pvRatio = this.calculatePVRatio(sellingPrice, variableCost);
        const breakEvenUnits = this.calculateBreakEvenUnits(fixedCosts, contributionMargin);
        const breakEvenValue = this.calculateBreakEvenSalesValue(fixedCosts, pvRatio);

        let marginOfSafetyUnits = 0;
        let marginOfSafetyValue = 0;

        if (actualSalesUnits > 0) {
            marginOfSafetyUnits = this.calculateMarginOfSafety(actualSalesUnits, breakEvenUnits);
        }

        if (actualSalesValue > 0) {
            marginOfSafetyValue = this.calculateMarginOfSafety(actualSalesValue, breakEvenValue);
        }

        const totalRevenue = sellingPrice * actualSalesUnits;
        const totalVariableCost = variableCost * actualSalesUnits;
        const profit = this.calculateProfit(totalRevenue, totalVariableCost, fixedCosts);

        return {
            contributionMargin,
            pvRatio,
            breakEvenUnits,
            breakEvenValue,
            marginOfSafetyUnits,
            marginOfSafetyValue,
            totalRevenue,
            totalVariableCost,
            totalContribution: this.calculateTotalContribution(actualSalesUnits, contributionMargin),
            profit
        };
    },

    /**
     * Generate CVP chart data
     * @param {object} params - Chart parameters
     * @returns {object} Chart data for sales, costs, and profit
     */
    generateChartData(params) {
        const {
            sellingPrice,
            variableCost,
            fixedCosts,
            maxUnits = 1000
        } = params;

        const contributionMargin = this.calculateContributionMargin(sellingPrice, variableCost);
        const breakEvenUnits = this.calculateBreakEvenUnits(fixedCosts, contributionMargin);

        const labels = [];
        const salesData = [];
        const costsData = [];
        const profitData = [];

        const step = Math.ceil(maxUnits / 20); // 20 data points

        for (let units = 0; units <= maxUnits; units += step) {
            labels.push(units);

            const revenue = sellingPrice * units;
            const totalCost = fixedCosts + (variableCost * units);
            const profit = revenue - totalCost;

            salesData.push(revenue);
            costsData.push(totalCost);
            profitData.push(profit);
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Sales Revenue',
                    data: salesData,
                    borderColor: 'rgb(14, 165, 233)',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    tension: 0.1
                },
                {
                    label: 'Total Costs',
                    data: costsData,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.1
                },
                {
                    label: 'Fixed Costs',
                    data: labels.map(() => fixedCosts),
                    borderColor: 'rgb(249, 115, 22)',
                    borderWidth: 2,
                    borderDash: [10, 5],
                    pointRadius: 0,
                    fill: false
                }
            ],
            breakEvenUnits: Math.round(breakEvenUnits),
            breakEvenValue: breakEvenUnits * sellingPrice
        };
    },

    /**
     * Calculate sensitivity analysis
     * @param {object} baseParams - Base parameters
     * @param {string} variable - Variable to change ('price', 'cost', 'volume')
     * @param {number} changePercent - Percentage change (+/- 50)
     * @returns {object} Sensitivity analysis results
     */
    performSensitivityAnalysis(baseParams, variable, changePercent) {
        const testParams = { ...baseParams };

        switch (variable) {
            case 'price':
                testParams.sellingPrice *= (1 + changePercent / 100);
                break;
            case 'cost':
                testParams.variableCost *= (1 + changePercent / 100);
                break;
            case 'volume':
                testParams.actualSalesUnits *= (1 + changePercent / 100);
                break;
        }

        const baseResults = this.performAnalysis(baseParams);
        const testResults = this.performAnalysis(testParams);

        return {
            baseResults,
            testResults,
            profitChange: testResults.profit - baseResults.profit,
            profitChangePercent: baseResults.profit !== 0
                ? ((testResults.profit - baseResults.profit) / baseResults.profit) * 100
                : 0
        };
    }
};
