// ========================================
// CVP Knowledge Base
// Static repository of formulas, concepts, and explanations
// Ensures 100% accuracy - AI never invents formulas
// ========================================

const CVP_KNOWLEDGE_BASE = {
    // ============================================
    // CVP FORMULAS - All verified and linked to actual calculator functions
    // ============================================
    formulas: {
        contribution_margin: {
            name: "Contribution Margin per Unit",
            formula: "Selling Price - Variable Cost per Unit",
            explanation: "The amount from each unit sale that contributes to covering fixed costs and generating profit.",
            example: "If selling price is LKR 850 and variable cost is LKR 650, CM = 850 - 650 = LKR 200",
            useCase: "Determines profitability of each product sold",
            code: (sp, vc) => CVPCalculator.calculateContributionMargin(sp, vc)
        },

        pv_ratio: {
            name: "Profit-Volume Ratio (Contribution Margin Ratio)",
            formula: "(Contribution Margin / Selling Price) × 100",
            explanation: "Percentage of each sales rupee available to cover fixed costs and generate profit.",
            example: "If CM is LKR 200 and SP is LKR 850, PV Ratio = (200/850) × 100 = 23.53%",
            useCase: "Measures efficiency of sales in generating contribution",
            code: (sp, vc) => CVPCalculator.calculatePVRatio(sp, vc)
        },

        break_even_units: {
            name: "Break-Even Point in Units",
            formula: "Fixed Costs / Contribution Margin per Unit",
            explanation: "Number of units that must be sold to cover all costs (zero profit/loss).",
            example: "If fixed costs are LKR 540,000 and CM is LKR 200, BEP = 540,000 / 200 = 2,700 units",
            useCase: "Determines minimum sales target to avoid losses",
            code: (fc, cm) => CVPCalculator.calculateBreakEvenUnits(fc, cm)
        },

        break_even_sales: {
            name: "Break-Even Point in Sales Value",
            formula: "Fixed Costs / (PV Ratio / 100)",
            explanation: "Sales revenue needed to cover all costs.",
            example: "If fixed costs are LKR 540,000 and PV ratio is 23.53%, BEP = 540,000 / 0.2353 = LKR 2,295,000",
            useCase: "Shows revenue target to break even",
            code: (fc, pvr) => CVPCalculator.calculateBreakEvenSalesValue(fc, pvr)
        },

        margin_of_safety: {
            name: "Margin of Safety",
            formula: "((Actual Sales - Break-Even Sales) / Actual Sales) × 100",
            explanation: "Percentage by which sales can drop before reaching break-even.",
            example: "If actual sales are 4,000 units and BEP is 2,700, MOS = ((4000-2700)/4000) × 100 = 32.5%",
            useCase: "Measures risk cushion and safety buffer",
            code: (actual, breakeven) => CVPCalculator.calculateMarginOfSafety(actual, breakeven)
        },

        target_profit_units: {
            name: "Units Required for Target Profit",
            formula: "(Fixed Costs + Target Profit) / Contribution Margin per Unit",
            explanation: "Number of units needed to achieve a specific profit target.",
            example: "For LKR 100,000 profit with FC=540,000 and CM=200, Units = (540,000+100,000)/200 = 3,200 units",
            useCase: "Goal setting and profit planning",
            code: (fc, tp, cm) => (fc + tp) / cm
        },

        target_profit_sales: {
            name: "Sales Value for Target Profit",
            formula: "(Fixed Costs + Target Profit) / (PV Ratio / 100)",
            explanation: "Sales revenue needed to achieve specific profit target.",
            example: "For LKR 100,000 profit with FC=540,000 and PV=23.53%, Sales = (540,000+100,000)/0.2353 = LKR 2,720,000",
            useCase: "Revenue target for desired profitability",
            code: (fc, tp, pvr) => (fc + tp) / (pvr / 100)
        },

        total_contribution: {
            name: "Total Contribution",
            formula: "Units Sold × Contribution Margin per Unit",
            explanation: "Total amount available to cover fixed costs and profit.",
            example: "If 3,500 units sold at CM of LKR 200, Total Contribution = 3,500 × 200 = LKR 700,000",
            useCase: "Measures overall contribution to profitability",
            code: (units, cm) => CVPCalculator.calculateTotalContribution(units, cm)
        },

        profit: {
            name: "Profit/Loss",
            formula: "Total Revenue - Total Variable Costs - Fixed Costs",
            alternateFormula: "Total Contribution - Fixed Costs",
            explanation: "Net income after all costs are deducted from revenue.",
            example: "If revenue is LKR 2,975,000, variable costs LKR 2,275,000, and fixed costs LKR 540,000, Profit = 2,975,000 - 2,275,000 - 540,000 = LKR 160,000",
            useCase: "Bottom-line profitability metric",
            code: (revenue, variableCosts, fixedCosts) => CVPCalculator.calculateProfit(revenue, variableCosts, fixedCosts)
        }
    },

    // ============================================
    // CVP CONCEPTS - Definitions and interpretations
    // ============================================
    concepts: {
        contribution_margin: {
            definition: "The difference between selling price and variable cost per unit",
            importance: "Shows how much each unit contributes to covering fixed costs and profit",
            interpretation: {
                high: "Excellent - more of each sale goes toward profit",
                moderate: "Good - reasonable contribution per unit",
                low: "Concerning - limited room for profit after covering variable costs"
            },
            factors: [
                "Higher selling prices increase CM",
                "Lower variable costs increase CM",
                "Product mix affects overall CM"
            ]
        },

        break_even_point: {
            definition: "The sales level where total revenue equals total costs (no profit, no loss)",
            importance: "Minimum performance threshold for the business",
            interpretation: {
                below: "Operating at a loss - urgently need to increase sales or reduce costs",
                at: "Breaking even - no profit but covering all costs",
                above: "Profitable operations - generating positive net income"
            },
            factors: [
                "Higher fixed costs increase break-even point",
                "Higher contribution margin decreases break-even point",
                "Price increases can lower break-even units"
            ]
        },

        margin_of_safety: {
            definition: "How much sales can decline before reaching break-even",
            importance: "Measures risk - higher margin means more cushion against sales fluctuations",
            interpretation: {
                above_50: "Excellent - strong buffer against sales decline",
                "30_to_50": "Good - reasonable safety margin",
                "15_to_30": "Fair - moderate risk exposure",
                below_15: "Risky - vulnerable to sales fluctuations"
            },
            factors: [
                "Higher actual sales increase margin of safety",
                "Lower break-even point increases margin of safety",
                "Market volatility affects risk assessment"
            ]
        },

        pv_ratio: {
            definition: "Percentage of sales revenue that is contribution margin",
            importance: "Shows profitability efficiency of sales",
            interpretation: {
                above_40: "Excellent - very profitable product mix",
                "25_to_40": "Good - healthy profitability",
                "15_to_25": "Fair - room for improvement",
                below_15: "Poor - low profitability per sale"
            },
            factors: [
                "Product mix affects overall PV ratio",
                "Price increases improve PV ratio",
                "Variable cost reduction improves PV ratio"
            ]
        },

        fixed_costs: {
            definition: "Costs that remain constant regardless of production or sales volume",
            examples: ["Rent", "Salaries", "Insurance", "Depreciation", "Utilities (base amount)"],
            importance: "Must be covered to avoid losses",
            management: [
                "Negotiate better lease terms",
                "Automate processes to reduce labor",
                "Review and eliminate unnecessary expenses"
            ]
        },

        variable_costs: {
            definition: "Costs that change in direct proportion to production or sales volume",
            examples: ["Raw materials", "Direct labor", "Packaging", "Shipping", "Sales commissions"],
            importance: "Directly affects contribution margin",
            management: [
                "Negotiate bulk purchase discounts",
                "Improve operational efficiency",
                "Find alternative suppliers",
                "Reduce waste and spoilage"
            ]
        }
    },

    // ============================================
    // COMMON QUESTIONS & ANSWERS
    // ============================================
    faq: {
        what_is_cvp: {
            question: "What is CVP analysis?",
            answer: "CVP (Cost-Volume-Profit) analysis examines the relationship between costs, sales volume, and profit to help make business decisions. It shows how changes in prices, costs, and volume affect profitability."
        },

        importance_break_even: {
            question: "Why is break-even point important?",
            answer: "Break-even point shows the minimum sales needed to avoid losses. It's your baseline target - you must exceed this to make profit. It helps in pricing decisions, budgeting, and risk assessment."
        },

        improve_profitability: {
            question: "How can I improve profitability?",
            answer: "Five main strategies:",
            strategies: [
                "Increase selling prices (if market allows)",
                "Reduce variable costs (better suppliers, efficiency)",
                "Reduce fixed costs (renegotiate rent, automation)",
                "Increase sales volume (marketing, expansion)",
                "Improve product mix (focus on high-margin items)"
            ]
        },

        cm_vs_profit: {
            question: "What's the difference between contribution margin and profit?",
            answer: "Contribution margin is selling price minus variable costs per unit. Profit is total contribution minus fixed costs. CM shows what each sale contributes; profit is what remains after all costs."
        },

        increase_margin_safety: {
            question: "How to increase margin of safety?",
            answer: "Two approaches:",
            strategies: [
                "Increase actual sales (grow your business)",
                "Lower break-even point (reduce costs or improve margins)"
            ]
        },

        when_reduce_price: {
            question: "When should I reduce prices?",
            answer: "Consider price reduction when:",
            conditions: [
                "High margin of safety (can afford lower margins)",
                "High PV ratio (room to reduce and stay profitable)",
                "Need to increase market share",
                "Competitors are undercutting significantly"
            ],
            warning: "Always calculate new break-even point before reducing prices"
        }
    },

    // ============================================
    // INTERPRETATION GUIDELINES
    // ============================================
    interpretationRules: {
        profitability: {
            excellent: { minProfit: 0.20, description: "Highly profitable - >20% profit margin" },
            good: { minProfit: 0.10, description: "Profitable - 10-20% profit margin" },
            fair: { minProfit: 0.05, description: "Marginally profitable - 5-10% profit margin" },
            poor: { minProfit: 0, description: "Break-even or loss - <5% profit margin" }
        },

        growth: {
            strong: { minGrowth: 0.15, description: "Strong growth - >15% increase" },
            moderate: { minGrowth: 0.05, description: "Moderate growth - 5-15% increase" },
            stable: { minGrowth: -0.05, description: "Stable - ±5% change" },
            declining: { minGrowth: -Infinity, description: "Declining - >5% decrease" }
        }
    },

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    getFormula(formulaKey) {
        return this.formulas[formulaKey] || null;
    },

    getConcept(conceptKey) {
        return this.concepts[conceptKey] || null;
    },

    getFAQ(faqKey) {
        return this.faq[faqKey] || null;
    },

    getAllFormulaNames() {
        return Object.keys(this.formulas);
    },

    getAllConceptNames() {
        return Object.keys(this.concepts);
    },

    searchKnowledge(query) {
        const lowerQuery = query.toLowerCase();
        const results = [];

        // Search formulas
        for (const [key, formula] of Object.entries(this.formulas)) {
            if (formula.name.toLowerCase().includes(lowerQuery) ||
                formula.explanation.toLowerCase().includes(lowerQuery)) {
                results.push({ type: 'formula', key, data: formula });
            }
        }

        // Search concepts
        for (const [key, concept] of Object.entries(this.concepts)) {
            if (concept.definition.toLowerCase().includes(lowerQuery)) {
                results.push({ type: 'concept', key, data: concept });
            }
        }

        // Search FAQ
        for (const [key, faq] of Object.entries(this.faq)) {
            if (faq.question?.toLowerCase().includes(lowerQuery) ||
                faq.answer?.toLowerCase().includes(lowerQuery)) {
                results.push({ type: 'faq', key, data: faq });
            }
        }

        return results;
    }
};
