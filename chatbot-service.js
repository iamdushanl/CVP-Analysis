// ========================================
// Prismo - AI-Powered CVP Assistant
// Gemini API Integration with Function Calling
// ========================================

const ChatbotService = {
    // Default API key - fallback if not in settings
    apiKey: 'AIzaSyCpdpG1a-rKEMSKwImxUImMQ7V-00LXrY4',
    conversationHistory: [],
    isInitialized: false,
    maxHistoryLength: 50,

    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        try {
            // Load API key from settings if available
            const settings = typeof SettingsManager !== 'undefined' ? SettingsManager.getSettings() : {};
            if (settings.geminiApiKey) {
                this.apiKey = settings.geminiApiKey;
                console.log('🤖 Chatbot Service initialized with user-provided API key');
            } else {
                console.log('🤖 Chatbot Service initialized with default API key');
            }

            // Load conversation history
            const savedHistory = localStorage.getItem('chatbot_history');
            if (savedHistory) {
                this.conversationHistory = JSON.parse(savedHistory);
            }

            this.isInitialized = !!this.apiKey;
            console.log('✅ Prismo ready - AI assistant initialized');
            return true;
        } catch (error) {
            console.error('Error initializing chatbot:', error);
            return false;
        }
    },

    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.isInitialized = !!apiKey;
        // Save to settings
        SettingsManager.updateSettings({ geminiApiKey: apiKey });
    },

    // ============================================
    // GEMINI API INTEGRATION
    // ============================================
    async sendMessageToGemini(message, tools = null) {
        if (!this.apiKey) {
            throw new Error('API_KEY_MISSING');
        }

        // Use v1beta API with gemini-2.0-flash (most reliable for this key)
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;


        const requestBody = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: message }]
                }
            ],
            generationConfig: {
                temperature: 0.1, // Low temperature for precise, factual responses
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048, // Increased from 1024 to allow complete responses
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        };

        // Add function calling tools if provided
        if (tools && tools.length > 0) {
            requestBody.tools = [{
                functionDeclarations: tools
            }];
        }

        let retries = 0;
        const maxRetries = 2;
        const baseDelay = 1000;

        while (retries <= maxRetries) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorData = await response.json();

                    if (response.status === 429 && retries < maxRetries) {
                        retries++;
                        const delay = baseDelay * Math.pow(2, retries);
                        console.warn(`⏰ Rate limit hit. Retrying in ${delay}ms (Attempt ${retries}/${maxRetries})...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }

                    console.error('API Error Response:', errorData);

                    if (response.status === 429) {
                        throw new Error('RATE_LIMIT');
                    } else if (response.status === 401 || response.status === 403) {
                        throw new Error('INVALID_KEY');
                    } else if (response.status === 404) {
                        throw new Error('MODEL_NOT_FOUND');
                    } else if (response.status === 400) {
                        throw new Error('BAD_REQUEST');
                    } else {
                        throw new Error(`API_ERROR: ${errorData.error?.message || 'Unknown error'}`);
                    }
                }

                const data = await response.json();
                return data;
            } catch (error) {
                if (error.message === 'RATE_LIMIT' || error.message.includes('API_ERROR') || error.message === 'MODEL_NOT_FOUND' || error.message === 'INVALID_KEY' || error.message === 'BAD_REQUEST') {
                    throw error;
                }

                if (retries < maxRetries) {
                    retries++;
                    const delay = baseDelay * Math.pow(2, retries);
                    console.warn(`⚠️ Connection error. Retrying in ${delay}ms...`, error);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw error;
            }
        }
    },

    // ============================================
    // FUNCTION CALLING - TOOL DEFINITIONS
    // ============================================
    getAvailableTools() {
        return [
            {
                name: 'getProductData',
                description: 'Retrieve product information by name, SKU, or ID. Returns product details including prices, costs, and calculated margins.',
                parameters: {
                    type: 'object',
                    properties: {
                        productIdentifier: {
                            type: 'string',
                            description: 'Product name, SKU, or ID to search for'
                        }
                    },
                    required: ['productIdentifier']
                }
            },
            {
                name: 'calculateBreakEven',
                description: 'Calculate break-even point for a specific product or overall business. Returns units and sales value needed to break even.',
                parameters: {
                    type: 'object',
                    properties: {
                        productId: {
                            type: 'string',
                            description: 'Product ID (optional - omit for business-wide calculation)'
                        }
                    }
                }
            },
            {
                name: 'getSalesAnalytics',
                description: 'Get sales data and analytics for a specified time period. Returns sales volume, revenue, and trends.',
                parameters: {
                    type: 'object',
                    properties: {
                        days: {
                            type: 'integer',
                            description: 'Number of days to analyze (default: 30)',
                            default: 30
                        }
                    }
                }
            },
            {
                name: 'getTopProducts',
                description: 'Get top performing products based on specified metric (sales, profit, margin).',
                parameters: {
                    type: 'object',
                    properties: {
                        limit: {
                            type: 'integer',
                            description: 'Number of top products to return (default: 5)',
                            default: 5
                        },
                        metric: {
                            type: 'string',
                            description: 'Metric to rank by: sales, profit, or margin',
                            enum: ['sales', 'profit', 'margin']
                        }
                    },
                    required: ['metric']
                }
            },
            {
                name: 'getFormulaExplanation',
                description: 'Get detailed explanation of a CVP formula including definition, formula, example, and use case.',
                parameters: {
                    type: 'object',
                    properties: {
                        formulaName: {
                            type: 'string',
                            description: 'Name of formula: contribution_margin, pv_ratio, break_even_units, break_even_sales, margin_of_safety, target_profit_units, etc.',
                            enum: Object.keys(CVP_KNOWLEDGE_BASE.formulas)
                        }
                    },
                    required: ['formulaName']
                }
            },
            {
                name: 'getConceptExplanation',
                description: 'Get explanation of CVP concepts like contribution margin, break-even point, margin of safety, etc.',
                parameters: {
                    type: 'object',
                    properties: {
                        conceptName: {
                            type: 'string',
                            description: 'Name of concept to explain',
                            enum: Object.keys(CVP_KNOWLEDGE_BASE.concepts)
                        }
                    },
                    required: ['conceptName']
                }
            },
            {
                name: 'performCVPAnalysis',
                description: 'Perform complete CVP analysis for a product including all metrics (CM, PV ratio, break-even, margin of safety, etc.)',
                parameters: {
                    type: 'object',
                    properties: {
                        productId: {
                            type: 'string',
                            description: 'Product ID to analyze'
                        }
                    },
                    required: ['productId']
                }
            },
            {
                name: 'getTotalFixedCosts',
                description: 'Get total fixed costs normalized to monthly amount',
                parameters: {
                    type: 'object',
                    properties: {}
                }
            }
        ];
    },

    // ============================================
    // FUNCTION EXECUTION ROUTER
    // ============================================
    executeFunction(functionName, args) {
        console.log(`🔧 Executing function: ${functionName}`, args);

        try {
            switch (functionName) {
                case 'getProductData':
                    return this.getProductData(args.productIdentifier);

                case 'calculateBreakEven':
                    return this.calculateBreakEven(args.productId);

                case 'getSalesAnalytics':
                    return this.getSalesAnalytics(args.days || 30);

                case 'getTopProducts':
                    return this.getTopProducts(args.limit || 5, args.metric);

                case 'getFormulaExplanation':
                    return this.getFormulaExplanation(args.formulaName);

                case 'getConceptExplanation':
                    return this.getConceptExplanation(args.conceptName);

                case 'performCVPAnalysis':
                    return this.performCVPAnalysis(args.productId);

                case 'getTotalFixedCosts':
                    return this.getTotalFixedCosts();

                default:
                    return { error: `Unknown function: ${functionName}`, available: this.getAvailableTools().map(t => t.name) };
            }
        } catch (error) {
            console.error(`Error executing ${functionName}:`, error);
            return {
                error: `Function execution failed: ${error.message}`,
                function: functionName,
                arguments: args
            };
        }
    },

    // ============================================
    // FUNCTION IMPLEMENTATIONS
    // ============================================

    getProductData(identifier) {
        try {
            if (!identifier || identifier.trim() === '') {
                return { error: 'Please provide a product name, SKU, or ID' };
            }

            const products = DataManager.getProducts();

            if (!products || products.length === 0) {
                return { error: 'No products found in the system. Please add products first.' };
            }

            // Search by ID, SKU, or name
            const product = products.find(p =>
                p.id === identifier ||
                p.sku === identifier ||
                p.name.toLowerCase().includes(identifier.toLowerCase())
            );

            if (!product) {
                return {
                    error: 'Product not found',
                    searched: identifier,
                    suggestion: 'Try searching by product name, SKU, or ID'
                };
            }

            // Calculate metrics with validation
            const cm = CVPCalculator.calculateContributionMargin(product.sellingPrice, product.variableCost);
            const pvRatio = CVPCalculator.calculatePVRatio(product.sellingPrice, product.variableCost);

            return {
                id: product.id,
                sku: product.sku,
                name: product.name,
                category: product.category,
                sellingPrice: product.sellingPrice,
                variableCost: product.variableCost,
                contributionMargin: Math.round(cm),
                pvRatio: pvRatio.toFixed(2),
                currency: 'LKR'
            };
        } catch (error) {
            return { error: 'Error retrieving product data', details: error.message };
        }
    },

    calculateBreakEven(productId) {
        const fixedCosts = DataManager.getTotalFixedCosts();

        if (productId) {
            // Product-specific break-even
            const product = DataManager.getProductById(productId);
            if (!product) {
                return { error: 'Product not found' };
            }

            const cm = CVPCalculator.calculateContributionMargin(product.sellingPrice, product.variableCost);
            const beu = CVPCalculator.calculateBreakEvenUnits(fixedCosts, cm);
            const pvRatio = CVPCalculator.calculatePVRatio(product.sellingPrice, product.variableCost);
            const bev = CVPCalculator.calculateBreakEvenSalesValue(fixedCosts, pvRatio);

            return {
                productName: product.name,
                productSKU: product.sku,
                sellingPrice: product.sellingPrice,
                variableCost: product.variableCost,
                contributionMargin: Math.round(cm),
                pvRatio: pvRatio.toFixed(2),
                breakEvenUnits: Math.round(beu),
                breakEvenValue: Math.round(bev),
                fixedCosts: Math.round(fixedCosts),
                currency: 'LKR'
            };
        } else {
            // Business-wide break-even
            const products = DataManager.getProducts();
            const sales = DataManager.getSalesLast30Days();

            if (sales.length === 0) {
                return { error: 'No sales data available' };
            }

            const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
            const totalContribution = sales.reduce((sum, s) => sum + s.contribution, 0);
            const avgCMRatio = (totalContribution / totalRevenue) * 100;

            const breakEvenSales = CVPCalculator.calculateBreakEvenSalesValue(fixedCosts, avgCMRatio);

            return {
                businesswide: true,
                period: 'Last 30 days',
                totalProducts: products.length,
                totalSales: sales.length,
                currentRevenue: Math.round(totalRevenue),
                currentContribution: Math.round(totalContribution),
                averageCMRatio: avgCMRatio.toFixed(2),
                fixedCosts: Math.round(fixedCosts),
                breakEvenSales: Math.round(breakEvenSales),
                marginOfSafety: CVPCalculator.calculateMarginOfSafety(totalRevenue, breakEvenSales).toFixed(2),
                currency: 'LKR'
            };
        }
    },

    getSalesAnalytics(days) {
        try {
            if (!days || days < 1) {
                days = 30;
            }

            const sales = DataManager.getSalesLastNDays(days);

            if (!sales || sales.length === 0) {
                return {
                    error: 'No sales data found for the specified period',
                    days,
                    suggestion: 'Try a different time period or add sales data'
                };
            }

            const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
            const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0);
            const totalContribution = sales.reduce((sum, s) => sum + s.contribution, 0);

            // Group by product
            const productSales = {};
            sales.forEach(sale => {
                if (!productSales[sale.productId]) {
                    productSales[sale.productId] = {
                        productName: sale.productName,
                        units: 0,
                        revenue: 0,
                        contribution: 0
                    };
                }
                productSales[sale.productId].units += sale.quantity;
                productSales[sale.productId].revenue += sale.totalAmount;
                productSales[sale.productId].contribution += sale.contribution;
            });

            return {
                period: `Last ${days} days`,
                totalTransactions: sales.length,
                totalUnits: totalUnits,
                totalRevenue: Math.round(totalRevenue),
                totalContribution: Math.round(totalContribution),
                averageTransactionValue: Math.round(totalRevenue / sales.length),
                contributionMarginRatio: ((totalContribution / totalRevenue) * 100).toFixed(2),
                uniqueProducts: Object.keys(productSales).length,
                currency: 'LKR'
            };
        } catch (error) {
            return { error: 'Error retrieving sales analytics', details: error.message };
        }
    },

    getTopProducts(limit, metric) {
        const sales = DataManager.getSalesLast30Days();
        const products = DataManager.getProducts();

        if (sales.length === 0) {
            return { error: 'No sales data available' };
        }

        // Aggregate by product
        const productStats = {};
        sales.forEach(sale => {
            if (!productStats[sale.productId]) {
                const product = products.find(p => p.id === sale.productId);
                if (product) {
                    productStats[sale.productId] = {
                        productId: sale.productId,
                        productName: sale.productName,
                        units: 0,
                        revenue: 0,
                        contribution: 0,
                        margin: CVPCalculator.calculateContributionMargin(product.sellingPrice, product.variableCost)
                    };
                }
            }
            if (productStats[sale.productId]) {
                productStats[sale.productId].units += sale.quantity;
                productStats[sale.productId].revenue += sale.totalAmount;
                productStats[sale.productId].contribution += sale.contribution;
            }
        });

        // Convert to array and sort
        let productsArray = Object.values(productStats);

        switch (metric) {
            case 'sales':
                productsArray.sort((a, b) => b.revenue - a.revenue);
                break;
            case 'profit':
                productsArray.sort((a, b) => b.contribution - a.contribution);
                break;
            case 'margin':
                productsArray.sort((a, b) => b.margin - a.margin);
                break;
        }

        return {
            metric: metric,
            period: 'Last 30 days',
            topProducts: productsArray.slice(0, limit).map((p, index) => ({
                rank: index + 1,
                name: p.productName,
                units: p.units,
                revenue: Math.round(p.revenue),
                contribution: Math.round(p.contribution),
                margin: Math.round(p.margin)
            })),
            currency: 'LKR'
        };
    },

    getFormulaExplanation(formulaName) {
        const formula = CVP_KNOWLEDGE_BASE.getFormula(formulaName);
        if (!formula) {
            return { error: 'Formula not found', available: CVP_KNOWLEDGE_BASE.getAllFormulaNames() };
        }
        return formula;
    },

    getConceptExplanation(conceptName) {
        const concept = CVP_KNOWLEDGE_BASE.getConcept(conceptName);
        if (!concept) {
            return { error: 'Concept not found', available: CVP_KNOWLEDGE_BASE.getAllConceptNames() };
        }
        return concept;
    },

    performCVPAnalysis(productId) {
        const product = DataManager.getProductById(productId);
        if (!product) {
            return { error: 'Product not found' };
        }

        const sales = DataManager.getSalesLast30Days().filter(s => s.productId === productId);
        const actualSalesUnits = sales.reduce((sum, s) => sum + s.quantity, 0);
        const actualSalesValue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const fixedCosts = DataManager.getTotalFixedCosts();

        const analysis = CVPCalculator.performAnalysis({
            sellingPrice: product.sellingPrice,
            variableCost: product.variableCost,
            fixedCosts: fixedCosts,
            actualSalesUnits: actualSalesUnits,
            actualSalesValue: actualSalesValue
        });

        return {
            productName: product.name,
            productSKU: product.sku,
            period: 'Last 30 days',
            sellingPrice: product.sellingPrice,
            variableCost: product.variableCost,
            contributionMargin: Math.round(analysis.contributionMargin),
            pvRatio: analysis.pvRatio.toFixed(2),
            breakEvenUnits: Math.round(analysis.breakEvenUnits),
            breakEvenValue: Math.round(analysis.breakEvenValue),
            actualSalesUnits: actualSalesUnits,
            actualSalesValue: Math.round(actualSalesValue),
            marginOfSafetyUnits: analysis.marginOfSafetyUnits.toFixed(2),
            marginOfSafetyValue: analysis.marginOfSafetyValue.toFixed(2),
            totalContribution: Math.round(analysis.totalContribution),
            profit: Math.round(analysis.profit),
            currency: 'LKR'
        };
    },

    getTotalFixedCosts() {
        const total = DataManager.getTotalFixedCosts();
        const costs = DataManager.getFixedCosts();

        return {
            totalMonthly: Math.round(total),
            itemCount: costs.length,
            breakdown: costs.map(c => ({
                name: c.name,
                amount: c.amount,
                frequency: c.frequency
            })),
            currency: 'LKR'
        };
    },

    // ============================================
    // BUILD COMPREHENSIVE CONTEXT
    // Senior SSE Implementation - Complete Data Access
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

            context += `=== 📦 PRODUCT DATA (${products.length} products total) ===\n`;
            context += `(Showing top ${Math.min(15, sortedProducts.length)} by profitability)\n\n`;

            sortedProducts.slice(0, 15).forEach((p, index) => {
                context += `${index + 1}. ${p.name}`;
                if (p.category) context += ` [${p.category}]`;
                context += `\n`;
                context += `   • Price: ${settings.currency} ${p.price.toLocaleString()} | CM: ${p.pvRatio}%\n`;
                context += `   • Contribution: ${settings.currency} ${p.totalCM.toLocaleString()} (${p.totalUnits.toLocaleString()} units)\n`;
                context += `   • Status: ${p.totalUnits >= p.breakEven ? '✅ Profitable' : '🎯 Needs ' + (p.breakEven - p.totalUnits) + ' more units to BEP'}\n`;
                context += `\n`;
            });

            if (sortedProducts.length > 15) {
                context += `... and ${sortedProducts.length - 15} more products.\n\n`;
            }

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
    },

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
    },

    // ============================================
    // MAIN CHAT INTERFACE
    // ============================================
    async sendMessage(userMessage) {
        if (!this.isInitialized) {
            return {
                success: false,
                error: 'API_KEY_REQUIRED',
                message: 'Please configure your Gemini API key in Settings first.'
            };
        }

        try {
            // Add user message to history
            this.addToHistory('user', userMessage);

            // Build context for better responses
            const context = this.buildContext();
            // Add instructions to be concise - saves tokens
            const enhancedMessage = `${context}

===USER QUESTION===
${userMessage}

===RESPONSE INSTRUCTIONS===
Answer concise, professional, and data-driven. Use the data above. If quota is low, be brief.

Answer now:`;

            // Send to Gemini - temporarily WITHOUT function calling to avoid 400 errors
            // TODO: Fix function calling format for v1 API
            const response = await this.sendMessageToGemini(enhancedMessage, null);

            // Check if Gemini wants to call a function
            const candidate = response.candidates[0];
            const content = candidate.content;

            if (content.parts[0].functionCall) {
                // Execute the function
                const functionCall = content.parts[0].functionCall;
                const functionResult = this.executeFunction(functionCall.name, functionCall.args);

                // Send function result back to Gemini for final response
                const finalResponse = await this.generateResponseFromFunctionResult(userMessage, functionCall, functionResult);

                // Add AI response to history
                this.addToHistory('assistant', finalResponse);
                this.saveHistory();

                return {
                    success: true,
                    message: finalResponse,
                    usedFunction: functionCall.name,
                    functionData: functionResult
                };
            } else {
                // Direct text response
                const aiMessage = content.parts[0].text;

                // Debug logging
                console.log('📝 AI Response Length:', aiMessage.length);
                console.log('📝 AI Response Preview:', aiMessage.substring(0, 100) + '...');
                console.log('📝 Full AI Response:', aiMessage);

                this.addToHistory('assistant', aiMessage);
                this.saveHistory();

                return {
                    success: true,
                    message: aiMessage
                };
            }

        } catch (error) {
            console.error('Chat error:', error);

            let errorMessage = 'Sorry, I encountered an error. Please try again.';
            if (error.message === 'RATE_LIMIT') {
                errorMessage = '⏰ Rate limit reached. Please wait a moment and try again.';
            } else if (error.message === 'INVALID_KEY') {
                errorMessage = '🔑 Authentication failed. The API key may be invalid.';
            } else if (error.message === 'BAD_REQUEST') {
                errorMessage = '❓ I didn\'t understand that request. Try asking differently.';
            } else if (error.message === 'API_KEY_MISSING') {
                errorMessage = '⚙️ API key not configured. Please check Settings.';
            } else if (error.message.startsWith('API_ERROR')) {
                errorMessage = '⚠️ Service error: ' + error.message.split(': ')[1];
            }

            return {
                success: false,
                error: error.message,
                message: errorMessage
            };
        }
    },

    async generateResponseFromFunctionResult(originalQuestion, functionCall, functionResult) {
        const prompt = `The user asked: "${originalQuestion}"

I called the function "${functionCall.name}" and got this result:
${JSON.stringify(functionResult, null, 2)}

Please provide a clear, natural language response to the user's question using this exact data. Format numbers with LKR currency where appropriate. Be concise and helpful.`;

        const response = await this.sendMessageToGemini(prompt);
        return response.candidates[0].content.parts[0].text;
    },



    // ============================================
    // CONVERSATION HISTORY
    // ============================================
    addToHistory(role, content) {
        this.conversationHistory.push({
            role,
            content,
            timestamp: new Date().toISOString()
        });

        // Limit history length
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }
    },

    saveHistory() {
        try {
            localStorage.setItem('chatbot_history', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    },

    clearHistory() {
        this.conversationHistory = [];
        localStorage.removeItem('chatbot_history');
    },

    getHistory() {
        return this.conversationHistory;
    },

    // ============================================
    // SUGGESTED PROMPTS
    // ============================================
    getSuggestedPrompts() {
        return [
            "What's my current break-even point?",
            "Show me top 5 profitable products",
            "Explain contribution margin",
            "How are my sales performing?",
            "What's my margin of safety?"
        ];
    }
};
