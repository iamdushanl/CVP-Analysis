// ========================================
// Forecast Engine - Time Series Prediction - Enhanced
// ========================================

const ForecastEngine = {
    /**
     * Calculate simple moving average
     * @param {array} data - Array of numeric values
     * @param {number} period - Period for moving average
     * @returns {array} Moving average values
     */
    calculateMovingAverage(data, period) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
            } else {
                const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                result.push(sum / period);
            }
        }
        return result;
    },

    /**
     * Calculate exponential moving average
     * @param {array} data - Array of numeric values
     * @param {number} alpha - Smoothing factor (0-1)
     * @returns {array} EMA values
     */
    calculateEMA(data, alpha = 0.3) {
        if (!data || data.length === 0) return [];
        const result = [data[0]];
        for (let i = 1; i < data.length; i++) {
            result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
        }
        return result;
    },

    /**
     * Simple linear regression for trend - Enhanced with error handling
     * @param {array} yValues - Dependent variable values
     * @returns {object} Slope and intercept
     */
    linearRegression(yValues) {
        const n = yValues.length;

        // Handle edge cases
        if (n === 0) return { slope: 0, intercept: 0 };
        if (n === 1) return { slope: 0, intercept: yValues[0] };

        const xValues = Array.from({ length: n }, (_, i) => i);

        const sumX = xValues.reduce((a, b) => a + b, 0);
        const sumY = yValues.reduce((a, b) => a + b, 0);
        const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
        const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

        const denominator = (n * sumX2 - sumX * sumX);

        // Handle case where all x values are the same or no variance
        if (denominator === 0 || !isFinite(denominator)) {
            return { slope: 0, intercept: sumY / n };
        }

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;

        // Check for NaN or Infinity
        if (!isFinite(slope) || !isFinite(intercept)) {
            return { slope: 0, intercept: sumY / n };
        }

        return { slope, intercept };
    },

    /**
     * Forecast future values using linear regression - Enhanced
     * @param {array} historicalValues - Historical data points
     * @param {number} periodsAhead - Number of periods to forecast
     * @returns {array} Forecasted values
     */
    forecastLinearRegression(historicalValues, periodsAhead) {
        // Handle empty or insufficient data
        if (!historicalValues || historicalValues.length === 0) {
            return Array(periodsAhead).fill(0);
        }

        if (historicalValues.length === 1) {
            // If only one data point, forecast the same value
            return Array(periodsAhead).fill(historicalValues[0]);
        }

        const { slope, intercept } = this.linearRegression(historicalValues);
        const n = historicalValues.length;
        const forecast = [];

        for (let i = 0; i < periodsAhead; i++) {
            const value = slope * (n + i) + intercept;
            // Ensure non-negative forecasts (can't have negative sales)
            forecast.push(Math.max(0, value));
        }

        return forecast;
    },

    /**
     * Alias for backward compatibility
     */
    forecastLinear(historicalData, periods) {
        return this.forecastLinearRegression(historicalData, periods);
    },

    /**
     * Forecast using moving average
     * @param {array} historicalData - Historical values
     * @param {number} periods - Number of periods to forecast
     * @param {number} maPeriod - Moving average period
     * @returns {array} Forecasted values
     */
    forecastMovingAverage(historicalData, periods, maPeriod = 7) {
        if (!historicalData || historicalData.length === 0) {
            return Array(periods).fill(0);
        }

        const ma = this.calculateMovingAverage(historicalData, maPeriod);
        const lastMA = ma.filter(v => v !== null).slice(-1)[0] || 0;

        return Array(periods).fill(lastMA);
    },

    /**
     * Forecast using exponential smoothing
     * @param {array} historicalData - Historical values
     * @param {number} periods - Number of periods to forecast
     * @param {number} alpha - Smoothing factor
     * @returns {array} Forecasted values
     */
    forecastExponentialSmoothing(historicalData, periods, alpha = 0.3) {
        if (!historicalData || historicalData.length === 0) {
            return Array(periods).fill(0);
        }

        const ema = this.calculateEMA(historicalData, alpha);
        const lastEMA = ema[ema.length - 1] || 0;

        return Array(periods).fill(lastEMA);
    },

    /**
     * Aggregate sales data by product and date
     * @param {array} sales - Sales transactions
     * @param {string} productId - Product ID to filter
     * @returns {object} Daily aggregated data
     */
    aggregateDailySales(sales, productId = null) {
        const filtered = productId
            ? sales.filter(s => s.productId === productId)
            : sales;

        const dailyData = {};

        filtered.forEach(sale => {
            if (!dailyData[sale.date]) {
                dailyData[sale.date] = {
                    quantity: 0,
                    revenue: 0,
                    contribution: 0
                };
            }

            dailyData[sale.date].quantity += sale.quantity;
            dailyData[sale.date].revenue += sale.totalAmount;
            dailyData[sale.date].contribution += sale.contribution;
        });

        return dailyData;
    },

    /**
     * Generate complete forecast for a product - Enhanced with error handling
     * @param {string} productId - Product ID
     * @param {number} forecastDays - Number of days to forecast
     * @returns {object} Complete forecast data
     */
    generateForecast(productId, forecastDays = 7) {
        const sales = DataManager.getSales();
        const dailyData = this.aggregateDailySales(sales, productId);

        // Create time series for last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const dates = [];
        const quantities = [];
        const contributions = [];

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            dates.push(dateStr);

            const data = dailyData[dateStr] || { quantity: 0, contribution: 0 };
            quantities.push(data.quantity);
            contributions.push(data.contribution);
        }

        // Generate forecasts
        const forecastedQuantities = this.forecastLinear(quantities, forecastDays);
        const forecastedContributions = this.forecastLinear(contributions, forecastDays);

        // Generate forecast dates
        const forecastDates = [];
        for (let i = 1; i <= forecastDays; i++) {
            const d = new Date(endDate);
            d.setDate(d.getDate() + i);
            forecastDates.push(d.toISOString().split('T')[0]);
        }

        // Calculate moving averages
        const ma7 = this.calculateMovingAverage(quantities, 7);
        const ma30 = this.calculateMovingAverage(quantities, 30);

        // Calculate metrics with division by zero protection
        const quantitiesSum = quantities.reduce((a, b) => a + b, 0);
        const contributionsSum = contributions.reduce((a, b) => a + b, 0);
        const forecastQtySum = forecastedQuantities.reduce((a, b) => a + b, 0);
        const forecastContSum = forecastedContributions.reduce((a, b) => a + b, 0);

        return {
            historical: {
                dates,
                quantities,
                contributions,
                ma7,
                ma30
            },
            forecast: {
                dates: forecastDates,
                quantities: forecastedQuantities,
                contributions: forecastedContributions
            },
            metrics: {
                avgDailyDemand: quantities.length > 0 ? quantitiesSum / quantities.length : 0,
                avgDailyContribution: contributions.length > 0 ? contributionsSum / contributions.length : 0,
                predictedDailyDemand: forecastedQuantities.length > 0 ? forecastQtySum / forecastedQuantities.length : 0,
                predictedDailyContribution: forecastedContributions.length > 0 ? forecastContSum / forecastedContributions.length : 0,
                totalForecastDemand: forecastQtySum,
                totalForecastContribution: forecastContSum
            }
        };
    },

    /**
     * Get trend direction and strength - Enhanced with error handling
     * @param {array} data - Historical data
     * @returns {object} Trend analysis
     */
    analyzeTrend(data) {
        if (!data || data.length === 0) {
            return {
                direction: 'stable',
                strength: 'weak',
                slope: 0,
                trendStrengthPercent: 0
            };
        }

        const { slope } = this.linearRegression(data);
        const dataSum = data.reduce((a, b) => a + b, 0);
        const avgValue = data.length > 0 ? dataSum / data.length : 0;

        // Avoid division by zero
        const trendStrength = avgValue !== 0 ? Math.abs(slope / avgValue) * 100 : 0;

        return {
            direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
            strength: trendStrength < 5 ? 'weak' : trendStrength < 15 ? 'moderate' : 'strong',
            slope,
            trendStrengthPercent: trendStrength
        };
    }
};
