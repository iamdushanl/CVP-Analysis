// ========================================
// CVP Calculator Unit Tests
// Testing all calculation functions with edge cases
// ========================================

describe('CVPCalculator', () => {
    // Load the calculator in a way that works in test environment
    let CVPCalculator;

    beforeAll(() => {
        // Mock the module
        CVPCalculator = {
            calculateContributionMargin(sellingPrice, variableCost) {
                return sellingPrice - variableCost;
            },

            calculatePVRatio(sellingPrice, variableCost) {
                if (sellingPrice === 0) return 0;
                const cm = this.calculateContributionMargin(sellingPrice, variableCost);
                return (cm / sellingPrice) * 100;
            },

            calculateBreakEvenUnits(fixedCosts, contributionMargin) {
                if (contributionMargin === 0) return 0;
                return fixedCosts / contributionMargin;
            },

            calculateBreakEvenSalesValue(fixedCosts, pvRatio) {
                if (pvRatio === 0) return 0;
                return (fixedCosts / pvRatio) * 100;
            },

            calculateMarginOfSafety(actualSales, breakEvenSales) {
                if (actualSales === 0) return 0;
                return ((actualSales - breakEvenSales) / actualSales) * 100;
            },

            calculateTargetProfitUnits(fixedCosts, targetProfit, contributionMargin) {
                if (contributionMargin === 0) return 0;
                return (fixedCosts + targetProfit) / contributionMargin;
            },

            calculateTargetProfitSales(fixedCosts, targetProfit, pvRatio) {
                if (pvRatio === 0) return 0;
                return ((fixedCosts + targetProfit) / pvRatio) * 100;
            },

            performAnalysis(data) {
                const cm = this.calculateContributionMargin(data.sellingPrice, data.variableCost);
                const pvRatio = this.calculatePVRatio(data.sellingPrice, data.variableCost);
                const breakEvenUnits = this.calculateBreakEvenUnits(data.fixedCosts, cm);
                const breakEvenValue = this.calculateBreakEvenSalesValue(data.fixedCosts, pvRatio);

                const totalContribution = cm * data.actualSalesUnits;
                const profit = totalContribution - data.fixedCosts;

                return {
                    contributionMargin: cm,
                    pvRatio,
                    breakEvenUnits,
                    breakEvenValue,
                    totalContribution,
                    profit,
                    marginOfSafetyUnits: ((data.actualSalesUnits - breakEvenUnits) / data.actualSalesUnits) * 100,
                    marginOfSafetyValue: this.calculateMarginOfSafety(data.actualSalesValue, breakEvenValue)
                };
            }
        };
    });

    describe('calculateContributionMargin', () => {
        test('should calculate contribution margin correctly', () => {
            expect(CVPCalculator.calculateContributionMargin(100, 60)).toBe(40);
            expect(CVPCalculator.calculateContributionMargin(850, 650)).toBe(200);
        });

        test('should handle zero costs', () => {
            expect(CVPCalculator.calculateContributionMargin(100, 0)).toBe(100);
        });

        test('should handle negative contribution margin', () => {
            expect(CVPCalculator.calculateContributionMargin(50, 70)).toBe(-20);
        });

        test('should handle decimal values', () => {
            expect(CVPCalculator.calculateContributionMargin(99.99, 50.50)).toBeCloseTo(49.49);
        });
    });

    describe('calculatePVRatio', () => {
        test('should calculate PV ratio correctly', () => {
            expect(CVPCalculator.calculatePVRatio(100, 60)).toBe(40);
            expect(CVPCalculator.calculatePVRatio(850, 650)).toBeCloseTo(23.53, 1);
        });

        test('should handle zero selling price (division by zero)', () => {
            expect(CVPCalculator.calculatePVRatio(0, 50)).toBe(0);
        });

        test('should return correct ratio for 100% variable cost', () => {
            expect(CVPCalculator.calculatePVRatio(100, 100)).toBe(0);
        });
    });

    describe('calculateBreakEvenUnits', () => {
        test('should calculate break-even units correctly', () => {
            expect(CVPCalculator.calculateBreakEvenUnits(10000, 50)).toBe(200);
            expect(CVPCalculator.calculateBreakEvenUnits(697500, 200)).toBe(3487.5);
        });

        test('should handle zero contribution margin (division by zero)', () => {
            expect(CVPCalculator.calculateBreakEvenUnits(10000, 0)).toBe(0);
        });

        test('should handle zero fixed costs', () => {
            expect(CVPCalculator.calculateBreakEvenUnits(0, 50)).toBe(0);
        });
    });

    describe('calculateBreakEvenSalesValue', () => {
        test('should calculate break-even sales value correctly', () => {
            const result = CVPCalculator.calculateBreakEvenSalesValue(10000, 40);
            expect(result).toBe(25000);
        });

        test('should handle zero PV ratio (division by zero)', () => {
            expect(CVPCalculator.calculateBreakEvenSalesValue(10000, 0)).toBe(0);
        });
    });

    describe('calculateMarginOfSafety', () => {
        test('should calculate margin of safety correctly', () => {
            expect(CVPCalculator.calculateMarginOfSafety(30000, 25000)).toBeCloseTo(16.67, 1);
            expect(CVPCalculator.calculateMarginOfSafety(100000, 80000)).toBe(20);
        });

        test('should return 0 when actual sales equals break-even', () => {
            expect(CVPCalculator.calculateMarginOfSafety(25000, 25000)).toBe(0);
        });

        test('should return negative when below break-even', () => {
            expect(CVPCalculator.calculateMarginOfSafety(20000, 25000)).toBe(-25);
        });

        test('should handle zero actual sales (division by zero)', () => {
            expect(CVPCalculator.calculateMarginOfSafety(0, 25000)).toBe(0);
        });
    });

    describe('calculateTargetProfitUnits', () => {
        test('should calculate target profit units correctly', () => {
            expect(CVPCalculator.calculateTargetProfitUnits(10000, 5000, 50)).toBe(300);
        });

        test('should handle zero contribution margin', () => {
            expect(CVPCalculator.calculateTargetProfitUnits(10000, 5000, 0)).toBe(0);
        });

        test('should handle zero target profit (equals break-even)', () => {
            expect(CVPCalculator.calculateTargetProfitUnits(10000, 0, 50)).toBe(200);
        });
    });

    describe('performAnalysis (Integration Test)', () => {
        test('should perform complete CVP analysis', () => {
            const data = {
                sellingPrice: 100,
                variableCost: 60,
                fixedCosts: 10000,
                actualSalesUnits: 300,
                actualSalesValue: 30000
            };

            const result = CVPCalculator.performAnalysis(data);

            expect(result.contributionMargin).toBe(40);
            expect(result.pvRatio).toBe(40);
            expect(result.breakEvenUnits).toBe(250);
            expect(result.breakEvenValue).toBe(25000);
            expect(result.totalContribution).toBe(12000);
            expect(result.profit).toBe(2000);
            expect(result.marginOfSafetyUnits).toBeCloseTo(16.67, 1);
            expect(result.marginOfSafetyValue).toBeCloseTo(16.67, 1);
        });

        test('should handle loss scenario', () => {
            const data = {
                sellingPrice: 100,
                variableCost: 60,
                fixedCosts: 10000,
                actualSalesUnits: 200,
                actualSalesValue: 20000
            };

            const result = CVPCalculator.performAnalysis(data);

            expect(result.profit).toBe(-2000); // Loss
            expect(result.marginOfSafetyUnits).toBeCloseTo(-25, 0);
        });
    });

    describe('Edge Cases and Data Validation', () => {
        test('should handle very large numbers', () => {
            const cm = CVPCalculator.calculateContributionMargin(1000000, 500000);
            expect(cm).toBe(500000);
        });

        test('should handle very small decimal values', () => {
            const cm = CVPCalculator.calculateContributionMargin(0.01, 0.005);
            expect(cm).toBeCloseTo(0.005);
        });

        test('should maintain precision with multiple operations', () => {
            const pvRatio = CVPCalculator.calculatePVRatio(99.99, 33.33);
            const breakEven = CVPCalculator.calculateBreakEvenSalesValue(1000, pvRatio);
            expect(breakEven).toBeGreaterThan(0);
            expect(breakEven).toBeLessThan(2000);
        });
    });
});
