
const HeatmapEngine = {
    getProfitColor(profit, minProfit, maxProfit) {
        // Handle strictly zero case
        if (Math.abs(profit) < 0.01) {
            return '#fbbf24'; // Yellow for break-even
        }

        if (profit > 0) {
            // GREEN SCALE (0 -> Max Positive Profit)
            const max = Math.max(maxProfit, profit, 1);
            const intensity = Math.min(1, profit / max);

            return `rgb(
                 ${Math.round(255 + (16 - 255) * intensity)}, 
                 ${Math.round(255 + (185 - 255) * intensity)}, 
                 ${Math.round(255 + (129 - 255) * intensity)}
             )`;
        } else {
            // RED SCALE (Min Negative Profit -> 0)
            const min = Math.min(minProfit, profit, -1);
            const intensity = Math.min(1, Math.abs(profit / min));

            return `rgb(
                ${Math.round(255 + (239 - 255) * intensity)}, 
                ${Math.round(255 + (68 - 255) * intensity)}, 
                ${Math.round(255 + (68 - 255) * intensity)}
            )`;
        }
    }
};

// Test Cases
const tests = [
    { profit: 1000, min: -1000, max: 1000, expected: 'Green-ish' },
    { profit: 0, min: -1000, max: 1000, expected: '#fbbf24' },
    { profit: -1000, min: -1000, max: 1000, expected: 'Red-ish' },
    { profit: 500, min: -1000, max: 1000, expected: 'Light Green' },
    { profit: -500, min: -1000, max: 1000, expected: 'Light Red' }
];

tests.forEach(test => {
    const result = HeatmapEngine.getProfitColor(test.profit, test.min, test.max);
    console.log(`Profit: ${test.profit} (Range: ${test.min} to ${test.max}) -> Color: ${result} [Expect: ${test.expected}]`);
});
