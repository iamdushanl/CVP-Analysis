// ========================================
// Profit Sensitivity Heatmap Engine
// ========================================

const HeatmapEngine = {
    /**
     * Generate profit matrix for price/volume variations
     */
    generateProfitMatrix(productId, priceRange = { min: -50, max: 50, step: 10 }, volumeRange = { min: -50, max: 200, step: 25 }, fixedCostOverride = null) {
        const product = DataManager.getProductById(productId);
        if (!product) {
            return null;
        }

        const basePrice = product.sellingPrice;
        const baseVolume = this.getAverageMonthlyVolume(productId);
        const variableCost = product.variableCost;
        const fixedCosts = fixedCostOverride !== null ? fixedCostOverride : DataManager.getTotalFixedCosts();

        const matrix = [];
        const pricePoints = [];
        const volumePoints = [];

        // Generate price variation points
        for (let pricePct = priceRange.min; pricePct <= priceRange.max; pricePct += priceRange.step) {
            pricePoints.push(pricePct);
        }

        // Generate volume variation points
        for (let volumePct = volumeRange.min; volumePct <= volumeRange.max; volumePct += volumeRange.step) {
            volumePoints.push(volumePct);
        }

        // Calculate profit for each combination
        volumePoints.forEach(volPct => {
            const row = [];
            const volume = baseVolume * (1 + volPct / 100);

            pricePoints.forEach(pricePct => {
                const price = basePrice * (1 + pricePct / 100);
                const revenue = price * volume;
                const totalVariableCost = variableCost * volume;
                const profit = revenue - totalVariableCost - fixedCosts;

                row.push({
                    pricePercent: pricePct,
                    volumePercent: volPct,
                    price: price,
                    volume: volume,
                    revenue: revenue,
                    profit: profit,
                    margin: revenue > 0 ? (profit / revenue) * 100 : 0
                });
            });

            matrix.push(row);
        });

        return {
            matrix,
            pricePoints,
            volumePoints,
            basePrice,
            baseVolume,
            product,
            fixedCosts
        };
    },

    /**
     * Get average monthly volume for a product
     */
    getAverageMonthlyVolume(productId) {
        const sales = DataManager.getSales().filter(s => s.productId === productId);

        if (sales.length === 0) {
            return 100; // Default assumption
        }

        const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);

        // Get date range
        const dates = sales.map(s => new Date(s.date));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24) + 1;
        const months = Math.max(1, daysDiff / 30);

        return totalQuantity / months;
    },

    /**
     * Find optimal price/volume combination
     */
    findOptimalPoint(heatmapData) {
        if (!heatmapData || !heatmapData.matrix) {
            return null;
        }

        let maxProfit = -Infinity;
        let optimalPoint = null;

        heatmapData.matrix.forEach(row => {
            row.forEach(cell => {
                if (cell.profit > maxProfit) {
                    maxProfit = cell.profit;
                    optimalPoint = cell;
                }
            });
        });

        return optimalPoint;
    },

    /**
     * Get color for profit value (diverging color scale)
     */
    getProfitColor(profit, minProfit, maxProfit) {
        // Normalize profit to 0-1 scale
        const range = maxProfit - minProfit;
        if (range === 0) return '#gray-300';

        const normalized = (profit - minProfit) / range;

        // Diverging color scale: red (loss) -> yellow (breakeven) -> green (profit)
        if (profit < 0) {
            // Red scale for losses
            const intensity = Math.min(1, Math.abs(profit) / Math.abs(minProfit));
            return `rgb(${Math.round(239 * intensity + 255 * (1 - intensity))}, ${Math.round(68 * intensity + 255 * (1 - intensity))}, ${Math.round(68 * intensity + 255 * (1 - intensity))})`;
        } else if (profit === 0) {
            return '#fbbf24'; // Yellow for break-even
        } else {
            // Green scale for profits
            const intensity = Math.min(1, profit / maxProfit);
            return `rgb(${Math.round(16 * intensity + 255 * (1 - intensity))}, ${Math.round(185 * intensity + 255 * (1 - intensity))}, ${Math.round(129 * intensity + 255 * (1 - intensity))})`;
        }
    },

    /**
     * Get min and max profits from matrix
     */
    getProfitRange(matrix) {
        let min = Infinity;
        let max = -Infinity;

        matrix.forEach(row => {
            row.forEach(cell => {
                if (cell.profit < min) min = cell.profit;
                if (cell.profit > max) max = cell.profit;
            });
        });

        return { min, max };
    },

    /**
     * Export heatmap data for reporting
     */
    exportHeatmapData(heatmapData) {
        if (!heatmapData) return null;

        const csvRows = [];
        csvRows.push(['Volume %', ...heatmapData.pricePoints.map(p => `Price ${p}%`)]);

        heatmapData.matrix.forEach((row, idx) => {
            const volumePct = heatmapData.volumePoints[idx];
            const rowData = [volumePct, ...row.map(cell => cell.profit.toFixed(2))];
            csvRows.push(rowData);
        });

        return csvRows.map(row => row.join(',')).join('\n');
    }
};

/**
 * API Contracts for Backend Integration
 * 
 * GET /api/analytics/heatmap?product_id={id}&price_min={min}&price_max={max}&volume_min={min}&volume_max={max}
 * Response: { matrix: [][], pricePoints: [], volumePoints: [], optimal: {...} }
 */
