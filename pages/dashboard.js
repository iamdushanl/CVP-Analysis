// ========================================
// Dashboard Page - Enhanced with Error Handling
// ========================================

const DashboardPage = {
    render() {
        try {
            const sales = DataManager.getSales();
            const products = DataManager.getProducts();
            const fixedCosts = DataManager.getTotalFixedCosts();

            // Calculate today's metrics
            const today = new Date().toISOString().split('T')[0];
            const todaySales = sales.filter(s => s.date === today);
            const totalRevenueToday = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
            const totalContributionToday = todaySales.reduce((sum, s) => sum + s.contribution, 0);

            // Calculate break-even (using weighted average across ALL products)
            let totalSalesRevenue = 0;
            let totalVariableCost = 0;

            sales.forEach(sale => {
                totalSalesRevenue += sale.totalAmount;
                const product = products.find(p => p.id === sale.productId);
                if (product) {
                    totalVariableCost += product.variableCost * sale.quantity;
                }
            });

            const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0);
            const avgSellingPrice = totalUnits > 0 ? totalSalesRevenue / totalUnits : 0;
            const avgVariableCost = totalUnits > 0 ? totalVariableCost / totalUnits : 0;
            const avgContribution = avgSellingPrice - avgVariableCost;

            // FIX: Proper break-even calculation with edge case handling
            let breakEvenUnits = 0;
            let breakEvenDisplay = 'N/A';

            if (avgContribution > 0) {
                breakEvenUnits = fixedCosts / avgContribution;
                breakEvenDisplay = Components.formatNumber(breakEvenUnits, 0);
            } else if (avgContribution < 0) {
                breakEvenDisplay = '∞ (Negative Margin)';
            } else {
                breakEvenDisplay = '∞ (Zero Margin)';
            }

            // FIX: Margin of safety with proper edge case handling
            const last30Sales = DataManager.getSalesLast30Days();
            const total30Units = last30Sales.reduce((sum, s) => sum + s.quantity, 0);

            let marginOfSafety = 0;
            let marginTrend = null;

            if (avgContribution <= 0) {
                marginOfSafety = -100; // Losing money on every sale
                marginTrend = -100;
            } else if (total30Units > 0 && breakEvenUnits > 0 && breakEvenUnits !== Infinity) {
                marginOfSafety = ((total30Units - breakEvenUnits) / total30Units) * 100;
                marginTrend = marginOfSafety > 0 ? 5 : -5;
            }

            // Calculate MTD (Month-to-Date) metrics
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const mtdSales = sales.filter(s => s.date >= firstDayOfMonth);
            const mtdRevenue = mtdSales.reduce((sum, s) => sum + s.totalAmount, 0);
            const mtdContribution = mtdSales.reduce((sum, s) => sum + s.contribution, 0);
            const mtdUnits = mtdSales.reduce((sum, s) => sum + s.quantity, 0);

            // Calculate last month for comparison
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
            const lastMonthSales = sales.filter(s => s.date >= lastMonthStart && s.date <= lastMonthEnd);
            const lastMonthRevenue = lastMonthSales.reduce((sum, s) => sum + s.totalAmount, 0);

            // Calculate growth rate
            const revenueGrowth = lastMonthRevenue > 0 ? ((mtdRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

            // Calculate Net Profit (Contribution - Fixed Costs)
            const netProfit = mtdContribution - fixedCosts;
            const profitMargin = mtdRevenue > 0 ? (netProfit / mtdRevenue) * 100 : 0;

            // Get top performing products
            const productPerformance = this.getProductPerformance(sales, products);
            const topProducts = productPerformance.slice(0, 5);

            // Generate business insights
            const insights = this.generateBusinessInsights({
                marginOfSafety,
                netProfit,
                profitMargin,
                revenueGrowth,
                productPerformance,
                breakEvenUnits,
                total30Units
            });

            // FIX: 7-day forecast with empty data protection
            const forecast7Day = this.calculate7DayForecast();

            return `
          <!-- Business Insights Panel -->
          ${insights.length > 0 ? `
          <div class="card mb-6" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: var(--space-6);">
            <h3 style="font-size: var(--text-xl); font-weight: 600; margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);">
              💡 Business Insights & Alerts
            </h3>
            <div style="display: grid; gap: var(--space-3);">
              ${insights.map(insight => `
                <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: var(--space-4); border-radius: var(--radius-lg); border-left: 4px solid ${insight.color};">
                  <div style="display: flex; align-items: start; gap: var(--space-3);">
                    <span style="font-size: var(--text-2xl);">${insight.icon}</span>
                    <div style="flex: 1;">
                      <div style="font-weight: 600; margin-bottom: var(--space-1);">${insight.title}</div>
                      <div style="opacity: 0.9; font-size: var(--text-sm);">${insight.message}</div>
                      ${insight.action ? `<div style="margin-top: var(--space-2); font-size: var(--text-sm); opacity: 0.8;">→ ${insight.action}</div>` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- Responsive Grid Styles -->
          <style>
            .dashboard-kpi-grid {
              display: grid;
              gap: var(--space-6);
              grid-template-columns: 1fr;
              margin-bottom: var(--space-8);
            }
            @media (min-width: 640px) {
              .dashboard-kpi-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (min-width: 1024px) {
              .dashboard-kpi-grid { grid-template-columns: repeat(3, 1fr); }
            }
          </style>

          <!-- Key Performance Indicators -->
          <div class="dashboard-kpi-grid">
            ${Components.createKPICard(
                'Today\'s Revenue',
                Components.formatCurrency(totalRevenueToday),
                null,
                '💵'
            )}
            ${Components.createKPICard(
                'MTD Revenue',
                Components.formatCurrency(mtdRevenue),
                revenueGrowth !== 0 ? (revenueGrowth > 0 ? 5 : -5) : null,
                '📊'
            )}
            ${Components.createKPICard(
                'Net Profit (MTD)',
                Components.formatCurrency(netProfit),
                netProfit > 0 ? 5 : (netProfit < 0 ? -5 : null),
                netProfit >= 0 ? '💰' : '⚠️'
            )}
            ${Components.createKPICard(
                'Profit Margin',
                Components.formatNumber(profitMargin, 1) + '%',
                profitMargin > 20 ? 5 : (profitMargin < 10 ? -5 : null),
                '📈'
            )}
            ${Components.createKPICard(
                'Monthly Break-Even',
                breakEvenDisplay + ' units',
                null,
                '⚖️'
            )}
            ${Components.createKPICard(
                'Margin of Safety',
                Components.formatNumber(marginOfSafety, 1) + '%',
                marginTrend,
                marginOfSafety >= 20 ? '🛡️' : (marginOfSafety >= 10 ? '⚠️' : '🔴')
            )}
          </div>

          <!-- Top Products Performance -->
          ${topProducts.length > 0 ? `
          <div class="card mb-6">
            <h3 class="card-title mb-4">🏆 Top Performing Products (by Contribution)</h3>
            <div style="display: grid; gap: var(--space-3);">
              ${topProducts.map((product, index) => `
                <div style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius-md);">
                  <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--primary-600); min-width: 40px;">#${index + 1}</div>
                  <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: var(--space-1);">${product.name}</div>
                    <div style="font-size: var(--text-sm); color: var(--text-secondary);">
                      ${product.unitsSold} units sold • ${Components.formatNumber(product.margin, 1)}% margin
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--success-600);">${Components.formatCurrency(product.totalContribution)}</div>
                    <div style="font-size: var(--text-sm); color: var(--text-secondary);">contribution</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div class="grid-2">
            <div class="chart-container">
              <h3 class="card-title mb-4">30-Day Sales Trend</h3>
              <div class="chart-wrapper">
                <canvas id="salesTrendChart"></canvas>
              </div>
            </div>

            <div class="chart-container">
              <h3 class="card-title mb-4">CVP Break-Even Analysis (Weighted Average)</h3>
              <div class="chart-wrapper">
                <canvas id="cvpBreakEvenChart"></canvas>
              </div>
            </div>
          </div>

          <div class="chart-container">
            <h3 class="card-title mb-4">7-Day Sales Forecast (All Products)</h3>
            <div class="chart-wrapper">
              <canvas id="forecastChart"></canvas>
            </div>
          </div>
        `;
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            return `
                <div class="card" style="padding: var(--space-8); text-align: center;">
                    <h2 style="color: var(--danger-600); margin-bottom: var(--space-4);">⚠️ Error Loading Dashboard</h2>
                    <p style="color: var(--text-secondary);">There was an error loading the dashboard. Please refresh the page.</p>
                    <button class="btn btn-primary" onclick="location.reload()" style="margin-top: var(--space-4);">Refresh Page</button>
                </div>
            `;
        }
    },

    /**
     * Calculate 7-day forecast with empty data protection
     */
    calculate7DayForecast() {
        try {
            const sales = DataManager.getSalesLast30Days();

            if (sales.length === 0) {
                return 0; // No sales data
            }

            const dailyContributions = {};

            sales.forEach(sale => {
                if (!dailyContributions[sale.date]) {
                    dailyContributions[sale.date] = 0;
                }
                dailyContributions[sale.date] += sale.contribution;
            });

            const contributions = Object.values(dailyContributions);

            if (contributions.length === 0) {
                return 0; // No contribution data
            }

            const avgDaily = contributions.reduce((a, b) => a + b, 0) / contributions.length;
            return avgDaily * 7;
        } catch (error) {
            console.error('Error calculating 7-day forecast:', error);
            return 0;
        }
    },

    renderCharts() {
        try {
            this.renderSalesTrendChart();
            this.renderCVPBreakEvenChart();
            this.renderForecastChart();
        } catch (error) {
            console.error('Error rendering charts:', error);
        }
    },

    renderSalesTrendChart() {
        try {
            const sales = DataManager.getSalesLast30Days();
            const fixedCosts = DataManager.getTotalFixedCosts();
            const dailyFixedCost = fixedCosts / 30;

            // Generate last 30 days dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const allDates = [];
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                allDates.push(d.toISOString().split('T')[0]);
            }

            if (sales.length === 0) {
                // Show empty state
                const ctx = document.getElementById('salesTrendChart');
                if (ctx) {
                    // Even with empty sales, we can show the fixed cost line on the 30-day axis
                    // to give the user better context than just "No Data"
                    // But if there are ABSOLUTELY no sales ever, maybe empty state is better.
                    // Let's stick to empty state if truly empty, but if we have partial data, we use the loop below.
                }
            }

            // Map sales to dates
            const dailyRevenue = {};
            const dailyContribution = {};

            // Initialize all dates with 0
            allDates.forEach(date => {
                dailyRevenue[date] = 0;
                dailyContribution[date] = 0;
            });

            // Aggregate by date
            sales.forEach(sale => {
                if (dailyRevenue.hasOwnProperty(sale.date)) {
                    dailyRevenue[sale.date] += sale.totalAmount;
                    dailyContribution[sale.date] += sale.contribution;
                }
            });

            const sortedDates = allDates; // Already sorted
            const revenues = sortedDates.map(date => dailyRevenue[date]);

            // Calculate daily profit (Contribution - Daily Fixed Cost)
            const profits = sortedDates.map(date => dailyContribution[date] - dailyFixedCost);

            // Calculate 7-day moving average for revenue
            const movingAverage = [];
            for (let i = 0; i < revenues.length; i++) {
                const start = Math.max(0, i - 6);
                const subset = revenues.slice(start, i + 1);
                const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
                movingAverage.push(avg);
            }

            Components.createChart('salesTrendChart', {
                type: 'line',
                data: {
                    labels: sortedDates.map(d => Components.formatDate(d)),
                    datasets: [
                        {
                            label: 'Daily Revenue',
                            data: revenues,
                            borderColor: 'rgb(14, 165, 233)',
                            backgroundColor: 'rgba(14, 165, 233, 0.1)',
                            tension: 0.4,
                            fill: true,
                            order: 2
                        },
                        {
                            label: 'Daily Profit (Est.)',
                            data: profits,
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.05)',
                            borderDash: [5, 5],
                            tension: 0.4,
                            fill: false,
                            order: 1
                        },
                        {
                            label: 'Revenue Trend (7d MA)',
                            data: movingAverage,
                            borderColor: 'rgb(99, 102, 241)',
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.4,
                            fill: false,
                            order: 0
                        },
                        {
                            label: 'Daily Fixed Cost',
                            data: sortedDates.map(() => dailyFixedCost),
                            borderColor: 'rgb(249, 115, 22)',
                            borderWidth: 2,
                            borderDash: [10, 5],
                            pointRadius: 0,
                            fill: false,
                            order: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { usePointStyle: true }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += Components.formatCurrency(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => Components.formatCurrency(value)
                            },
                            title: {
                                display: true,
                                text: 'Amount (LKR)'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering sales trend chart:', error);
        }
    },

    /**
     * FIX: Use weighted average instead of first product
     * ENHANCED: Add break-even marker and current position
     */
    renderCVPBreakEvenChart() {
        try {
            const products = DataManager.getProducts();
            const sales = DataManager.getSales();
            const fixedCosts = DataManager.getTotalFixedCosts();

            if (products.length === 0 || sales.length === 0) {
                const ctx = document.getElementById('cvpBreakEvenChart');
                if (ctx) {
                    ctx.parentElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-muted);">No data available for CVP analysis</p>';
                }
                return;
            }

            // Calculate weighted average selling price and variable cost
            let totalRevenue = 0;
            let totalVariableCost = 0;
            let totalUnits = 0;

            sales.forEach(sale => {
                totalRevenue += sale.totalAmount;
                totalUnits += sale.quantity;

                const product = products.find(p => p.id === sale.productId);
                if (product) {
                    totalVariableCost += product.variableCost * sale.quantity;
                }
            });

            const avgSellingPrice = totalUnits > 0 ? totalRevenue / totalUnits : 0;
            const avgVariableCost = totalUnits > 0 ? totalVariableCost / totalUnits : 0;
            const avgContribution = avgSellingPrice - avgVariableCost;

            if (avgSellingPrice === 0) {
                const ctx = document.getElementById('cvpBreakEvenChart');
                if (ctx) {
                    ctx.parentElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-muted);">Insufficient revenue data for CVP analysis</p>';
                }
                return;
            }

            // Warn if variable cost is 0 (might be legitimate or missing data)
            if (avgVariableCost === 0) {
                console.warn('CVP Analysis: Average Variable Cost is 0. This might be due to missing product data or 100% margin products.');
            }

            // Calculate break-even point
            const breakEvenUnits = avgContribution > 0 ? fixedCosts / avgContribution : 0;

            // Get last 30 days sales for current position
            const last30Sales = DataManager.getSalesLast30Days();
            const currentMonthlyUnits = last30Sales.reduce((sum, s) => sum + s.quantity, 0);

            const chartData = CVPCalculator.generateChartData({
                sellingPrice: avgSellingPrice,
                variableCost: avgVariableCost,
                fixedCosts: fixedCosts,
                maxUnits: Math.max(1000, breakEvenUnits * 1.5, currentMonthlyUnits * 1.2)
            });

            // Add break-even point marker
            const breakEvenRevenue = avgSellingPrice * breakEvenUnits;

            // Add current position marker
            const currentRevenue = avgSellingPrice * currentMonthlyUnits;

            // Convert datasets to scatter format {x, y} for precise plotting
            const formattedDatasets = chartData.datasets.map(ds => ({
                ...ds,
                data: ds.data.map((y, i) => ({ x: chartData.labels[i], y: y }))
            }));

            Components.createChart('cvpBreakEvenChart', {
                type: 'line',
                data: {
                    datasets: [
                        ...formattedDatasets,
                        {
                            label: 'Break-Even Point',
                            data: [{ x: breakEvenUnits, y: breakEvenRevenue }],
                            pointRadius: 10,
                            pointBackgroundColor: 'rgb(234, 179, 8)', // Yellow
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            showLine: false,
                            order: 0
                        },
                        {
                            label: 'Current Position (30-day)',
                            data: [{ x: currentMonthlyUnits, y: currentRevenue }],
                            pointRadius: 10,
                            pointBackgroundColor: currentMonthlyUnits > breakEvenUnits ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            showLine: false,
                            order: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 15
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += Components.formatCurrency(context.parsed.y);
                                    }
                                    return label;
                                },
                                afterLabel: function (context) {
                                    if (context.dataset.label === 'Break-Even Point') {
                                        return `Units: ${Math.round(breakEvenUnits)}`;
                                    }
                                    if (context.dataset.label === 'Current Position (30-day)') {
                                        const status = currentMonthlyUnits > breakEvenUnits ? 'PROFITABLE ✓' : 'LOSS ✗';
                                        return [`Units: ${Math.round(currentMonthlyUnits)}`, status];
                                    }
                                    return '';
                                }
                            }
                        },
                        annotation: {
                            annotations: {
                                breakEvenLine: {
                                    type: 'line',
                                    xMin: breakEvenUnits,
                                    xMax: breakEvenUnits,
                                    borderColor: 'rgb(234, 179, 8)',
                                    borderWidth: 2,
                                    borderDash: [6, 6],
                                    label: {
                                        display: true,
                                        content: 'Break-Even',
                                        position: 'start',
                                        color: 'rgb(234, 179, 8)',
                                        backgroundColor: 'rgba(255,255,255,0.8)'
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => Components.formatCurrency(value)
                            },
                            title: {
                                display: true,
                                text: 'Amount (LKR)'
                            }
                        },
                        x: {
                            type: 'linear', // Use linear scale for precise x-axis plotting
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Units Sold'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering CVP break-even chart:', error);
        }
    },

    renderForecastChart() {
        try {
            const products = DataManager.getProducts();

            if (products.length === 0) {
                const ctx = document.getElementById('forecastChart');
                if (ctx) {
                    ctx.parentElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-muted);">No products available for forecasting</p>';
                }
                return;
            }

            // Generate forecast for ALL products (aggregated)
            const forecastData = ForecastEngine.generateForecast(null, 7); // null = all products

            if (!forecastData || !forecastData.historical || !forecastData.forecast) {
                const ctx = document.getElementById('forecastChart');
                if (ctx) {
                    ctx.parentElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-muted);">Insufficient data for forecasting</p>';
                }
                return;
            }

            const allDates = [...forecastData.historical.dates, ...forecastData.forecast.dates];
            const historicalQty = [...forecastData.historical.quantities, ...Array(7).fill(null)];
            const forecastQty = [...Array(forecastData.historical.dates.length).fill(null), ...forecastData.forecast.quantities];

            // Get product count for tooltip
            const productCount = products.length;

            Components.createChart('forecastChart', {
                type: 'line',
                data: {
                    labels: allDates.map(d => Components.formatDate(d)),
                    datasets: [
                        {
                            label: 'Historical Sales (All Products)',
                            data: historicalQty,
                            borderColor: 'rgb(14, 165, 233)',
                            backgroundColor: 'rgba(14, 165, 233, 0.1)',
                            tension: 0.4,
                            spanGaps: false,
                            fill: true
                        },
                        {
                            label: 'Forecasted Sales (All Products)',
                            data: forecastQty,
                            borderColor: 'rgb(139, 92, 246)',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            borderDash: [5, 5],
                            tension: 0.4,
                            spanGaps: false,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 15
                            }
                        },
                        tooltip: {
                            callbacks: {
                                footer: function (tooltipItems) {
                                    return `Based on ${productCount} product(s)`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Total Units (All Products)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering forecast chart:', error);
        }
    },

    /**
     * Get product performance metrics
     */
    getProductPerformance(sales, products) {
        const productStats = {};

        sales.forEach(sale => {
            const product = products.find(p => p.id === sale.productId);
            if (!product) return;

            if (!productStats[product.id]) {
                productStats[product.id] = {
                    id: product.id,
                    name: product.name,
                    sku: product.sku,
                    unitsSold: 0,
                    totalRevenue: 0,
                    totalContribution: 0,
                    sellingPrice: product.sellingPrice,
                    variableCost: product.variableCost
                };
            }

            productStats[product.id].unitsSold += sale.quantity;
            productStats[product.id].totalRevenue += sale.totalAmount;
            productStats[product.id].totalContribution += sale.contribution;
        });

        // Calculate margins and sort by contribution
        return Object.values(productStats)
            .map(p => ({
                ...p,
                margin: p.sellingPrice > 0 ? ((p.sellingPrice - p.variableCost) / p.sellingPrice) * 100 : 0
            }))
            .sort((a, b) => b.totalContribution - a.totalContribution);
    },

    /**
     * Generate business insights and alerts
     */
    generateBusinessInsights(metrics) {
        const insights = [];

        // Critical Alert: Below break-even
        if (metrics.total30Units > 0 && metrics.total30Units < metrics.breakEvenUnits) {
            insights.push({
                icon: '🔴',
                title: 'CRITICAL: Below Break-Even',
                message: `You're selling ${Math.round(metrics.total30Units)} units/month but need ${Math.round(metrics.breakEvenUnits)} to break even.`,
                action: 'Increase sales volume by ' + Math.round(((metrics.breakEvenUnits - metrics.total30Units) / metrics.total30Units) * 100) + '% or reduce costs',
                color: '#ef4444',
                priority: 1
            });
        }

        // Warning: Low margin of safety
        if (metrics.marginOfSafety < 10 && metrics.marginOfSafety >= 0) {
            insights.push({
                icon: '⚠️',
                title: 'WARNING: Low Margin of Safety',
                message: `Your margin of safety is only ${metrics.marginOfSafety.toFixed(1)}%. A small sales drop could cause losses.`,
                action: 'Target 20%+ margin of safety for healthy operations',
                color: '#f59e0b',
                priority: 2
            });
        }

        // Alert: Negative profit
        if (metrics.netProfit < 0) {
            insights.push({
                icon: '💸',
                title: 'ALERT: Operating at a Loss',
                message: `Net loss of ${Components.formatCurrency(Math.abs(metrics.netProfit))} this month.`,
                action: 'Review pricing strategy and cost structure immediately',
                color: '#ef4444',
                priority: 1
            });
        }

        // Success: Good profit margin
        if (metrics.profitMargin > 20) {
            insights.push({
                icon: '🎉',
                title: 'Excellent Profit Margin',
                message: `Your profit margin of ${metrics.profitMargin.toFixed(1)}% is above the 20% target.`,
                action: 'Maintain current strategy and consider expansion',
                color: '#10b981',
                priority: 3
            });
        }

        // Opportunity: Strong growth
        if (metrics.revenueGrowth > 15) {
            insights.push({
                icon: '📈',
                title: 'Strong Revenue Growth',
                message: `Revenue is up ${metrics.revenueGrowth.toFixed(1)}% compared to last month.`,
                action: 'Capitalize on momentum with targeted marketing',
                color: '#10b981',
                priority: 3
            });
        }

        // Warning: Declining revenue
        if (metrics.revenueGrowth < -10) {
            insights.push({
                icon: '📉',
                title: 'Revenue Decline Detected',
                message: `Revenue is down ${Math.abs(metrics.revenueGrowth).toFixed(1)}% from last month.`,
                action: 'Investigate causes and implement recovery plan',
                color: '#f59e0b',
                priority: 2
            });
        }

        // Product insights
        if (metrics.productPerformance && metrics.productPerformance.length > 0) {
            const topProduct = metrics.productPerformance[0];
            const bottomProducts = metrics.productPerformance.filter(p => p.margin < 0);

            if (bottomProducts.length > 0) {
                insights.push({
                    icon: '⚠️',
                    title: `${bottomProducts.length} Product(s) with Negative Margin`,
                    message: `Products with negative margins are hurting profitability.`,
                    action: 'Review pricing or consider discontinuing these products',
                    color: '#f59e0b',
                    priority: 2
                });
            }
        }

        // Sort by priority and return top 5
        return insights.sort((a, b) => a.priority - b.priority).slice(0, 5);
    }
};
