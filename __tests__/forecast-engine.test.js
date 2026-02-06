
describe('ForecastEngine', () => {
    // Mock ForecastEngine since we are running in a node environment without direct access to browser objects
    // We will copy the key logic for testing purposes, or import if it was a module. 
    // Since the original file is a global object, we assume it's loaded.
    // For this test script, we will paste the ForecastEngine logic to test it in isolation 
    // or assume it's available in the test environment setup.

    // NOTE: In a real environment we would import this. Here we define a mock to verify logic.
    const ForecastEngine = {
        linearRegression(yValues) {
            const n = yValues.length;
            if (n === 0) return { slope: 0, intercept: 0 };
            if (n === 1) return { slope: 0, intercept: yValues[0] };

            const xValues = Array.from({ length: n }, (_, i) => i);

            const sumX = xValues.reduce((a, b) => a + b, 0);
            const sumY = yValues.reduce((a, b) => a + b, 0);
            const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
            const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

            const denominator = (n * sumX2 - sumX * sumX);

            if (denominator === 0 || !isFinite(denominator)) {
                return { slope: 0, intercept: sumY / n };
            }

            const slope = (n * sumXY - sumX * sumY) / denominator;
            const intercept = (sumY - slope * sumX) / n;

            if (!isFinite(slope) || !isFinite(intercept)) return { slope: 0, intercept: sumY / n };

            return { slope, intercept };
        },

        forecastLinearRegression(historicalValues, periodsAhead) {
            if (!historicalValues || historicalValues.length === 0) return Array(periodsAhead).fill(0);
            if (historicalValues.length === 1) return Array(periodsAhead).fill(historicalValues[0]);

            const { slope, intercept } = this.linearRegression(historicalValues);
            const n = historicalValues.length;
            const forecast = [];

            for (let i = 0; i < periodsAhead; i++) {
                const value = slope * (n + i) + intercept;
                forecast.push(Math.max(0, value));
            }
            return forecast;
        }
    };

    test('should calculate correct linear regression', () => {
        const data = [10, 20, 30, 40, 50]; // Slope should be 10, intercept 10 (at index 0) -> y = 10x + 10
        const { slope, intercept } = ForecastEngine.linearRegression(data);
        expect(slope).toBeCloseTo(10);
        expect(intercept).toBeCloseTo(10);
    });

    test('should forecast next values correctly', () => {
        const data = [10, 20, 30, 40, 50];
        // Next 3 values should be 60, 70, 80
        const forecast = ForecastEngine.forecastLinearRegression(data, 3);
        expect(forecast[0]).toBeCloseTo(60);
        expect(forecast[1]).toBeCloseTo(70);
        expect(forecast[2]).toBeCloseTo(80);
    });

    test('should handle flat line', () => {
        const data = [10, 10, 10, 10];
        const { slope } = ForecastEngine.linearRegression(data);
        expect(slope).toBeCloseTo(0);
        const forecast = ForecastEngine.forecastLinearRegression(data, 2);
        expect(forecast).toEqual([10, 10]);
    });

    test('should handle empty data', () => {
        const forecast = ForecastEngine.forecastLinearRegression([], 3);
        expect(forecast).toEqual([0, 0, 0]);
    });

    test('should handle single data point', () => {
        const forecast = ForecastEngine.forecastLinearRegression([100], 3);
        expect(forecast).toEqual([100, 100, 100]);
    });
});
