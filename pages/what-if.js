// ========================================
// What-If Scenario Simulator Page - Product-Specific
// ========================================

const WhatIfPage = {
    currentProductId: null,
    sellingPrice: 200,
    variableCost: 120,
    salesVolume: 1000,
    fixedCosts: 0,

    render() {
        this.fixedCosts = DataManager.getTotalFixedCosts();
        const products = DataManager.getProducts();

        // Select first product by default
        const selectedProduct = products[0] || null;
        if (selectedProduct && !this.currentProductId) {
            this.currentProductId = selectedProduct.id;
            this.sellingPrice = selectedProduct.sellingPrice;
            this.variableCost = selectedProduct.variableCost;
        }

        return `
      <h2 style="font-size: var(--text-2xl); font-weight: 600; margin-bottom: var(--space-2);">What-If Scenario Simulator</h2>
      <p style="color: var(--gray-600); margin-bottom: var(--space-6);">Select a product and adjust parameters to see real-time CVP impact</p>

      <div class="card mb-6">
        <div class="form-group">
          <label class="form-label">Select Product</label>
          <select class="form-select" id="whatIfProductSelect" onchange="WhatIfPage.onProductChange()" style="max-width: 500px;">
            ${products.map(p => `
              <option value="${p.id}" ${p.id === this.currentProductId ? 'selected' : ''}>
                ${p.name} - ${Components.formatCurrency(p.sellingPrice)}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="card mb-6">
        <h3 class="card-title mb-4">Scenario Parameters</h3>
        
        <div class="slider-group">
          <div class="slider-label">
            <span>Selling Price</span>
            <span class="slider-value" id="priceValue">${Components.formatCurrency(this.sellingPrice)}</span>
          </div>
          <input type="range" class="slider" id="priceSlider" min="0" max="5000" step="10" value="${this.sellingPrice}" 
                 oninput="WhatIfPage.updatePrice(this.value)">
        </div>

        <div class="slider-group">
          <div class="slider-label">
            <span>Variable Cost</span>
            <span class="slider-value" id="costValue">${Components.formatCurrency(this.variableCost)}</span>
          </div>
          <input type="range" class="slider" id="costSlider" min="0" max="5000" step="10" value="${this.variableCost}"
                 oninput="WhatIfPage.updateCost(this.value)">
        </div>

        <div class="slider-group">
          <div class="slider-label">
            <span>Sales Volume</span>
            <span class="slider-value" id="volumeValue">${this.salesVolume.toLocaleString()} units</span>
          </div>
          <input type="range" class="slider" id="volumeSlider" min="0" max="10000" step="50" value="${this.salesVolume}"
                 oninput="WhatIfPage.updateVolume(this.value)">
        </div>
      </div>

      <div class="grid-3 mb-6" id="metricsGrid">
        <!-- Metrics will be inserted here -->
      </div>

      <div class="grid-2">
        <div class="chart-container">
          <h3 class="card-title mb-4">CVP Chart</h3>
          <div class="chart-wrapper">
            <canvas id="whatIfCVPChart"></canvas>
          </div>
        </div>

        <div class="chart-container">
          <h3 class="card-title mb-4">Profit Sensitivity</h3>
          <div class="chart-wrapper">
            <canvas id="sensitivityChart"></canvas>
          </div>
        </div>
      </div>
    `;
    },

    renderCharts() {
        this.updateCalculations();
    },

    onProductChange() {
        const productId = document.getElementById('whatIfProductSelect').value;
        const product = DataManager.getProductById(productId);

        if (product) {
            this.currentProductId = product.id;
            this.sellingPrice = product.sellingPrice;
            this.variableCost = product.variableCost;

            // Update sliders
            document.getElementById('priceSlider').value = this.sellingPrice;
            document.getElementById('costSlider').value = this.variableCost;
            document.getElementById('priceValue').textContent = Components.formatCurrency(this.sellingPrice);
            document.getElementById('costValue').textContent = Components.formatCurrency(this.variableCost);

            this.updateCalculations();
        }
    },

    updatePrice(value) {
        this.sellingPrice = parseFloat(value);
        document.getElementById('priceValue').textContent = Components.formatCurrency(this.sellingPrice);
        this.updateCalculations();
    },

    updateCost(value) {
        this.variableCost = parseFloat(value);
        document.getElementById('costValue').textContent = Components.formatCurrency(this.variableCost);
        this.updateCalculations();
    },

    updateVolume(value) {
        this.salesVolume = parseFloat(value);
        document.getElementById('volumeValue').textContent = this.salesVolume.toLocaleString() + ' units';
        this.updateCalculations();
    },

    updateCalculations() {
        const analysis = CVPCalculator.performAnalysis({
            sellingPrice: this.sellingPrice,
            variableCost: this.variableCost,
            fixedCosts: this.fixedCosts,
            actualSalesUnits: this.salesVolume
        });

        // Update metrics cards
        const metricsHtml = `
      ${Components.createMetricCard('Contribution/Unit', Components.formatCurrency(analysis.contributionMargin))}
      ${Components.createMetricCard('PV Ratio', Components.formatNumber(analysis.pvRatio, 2) + '%')}
      ${Components.createMetricCard('Break-Even Units', Components.formatNumber(analysis.breakEvenUnits, 0))}
      ${Components.createMetricCard('Break-Even Value', Components.formatCurrency(analysis.breakEvenValue))}
      ${Components.createMetricCard('Margin of Safety', Components.formatNumber(analysis.marginOfSafetyUnits, 1) + '%')}
      ${Components.createMetricCard('Total Profit', Components.formatCurrency(analysis.profit), '')}
    `;

        document.getElementById('metricsGrid').innerHTML = metricsHtml;

        // Update CVP chart
        this.renderCVPChart();
        this.renderSensitivityChart();
    },

    renderCVPChart() {
        const chartData = CVPCalculator.generateChartData({
            sellingPrice: this.sellingPrice,
            variableCost: this.variableCost,
            fixedCosts: this.fixedCosts,
            maxUnits: Math.max(this.salesVolume * 1.5, 1000)
        });

        // Add current position marker
        const currentRevenue = this.sellingPrice * this.salesVolume;
        const isAboveBreakEven = this.salesVolume > chartData.breakEvenUnits;

        Components.createChart('whatIfCVPChart', {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    ...chartData.datasets,
                    {
                        label: 'Break-Even Point',
                        data: chartData.labels.map(units =>
                            Math.abs(units - chartData.breakEvenUnits) <= (chartData.labels[1] - chartData.labels[0]) / 2
                                ? chartData.breakEvenValue : null
                        ),
                        pointRadius: 12,
                        pointBackgroundColor: 'rgb(234, 179, 8)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        showLine: false
                    },
                    {
                        label: 'Current Position',
                        data: chartData.labels.map(units => units === this.salesVolume ? currentRevenue : null),
                        pointRadius: 10,
                        pointBackgroundColor: isAboveBreakEven ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        showLine: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (context) => context.dataset.label + ': ' + Components.formatCurrency(context.parsed.y),
                            afterLabel: function (context) {
                                if (context.dataset.label === 'Break-Even Point') {
                                    return `At ${chartData.breakEvenUnits} units`;
                                }
                                if (context.dataset.label === 'Current Position') {
                                    return isAboveBreakEven ? 'PROFITABLE ✓' : 'LOSS ✗';
                                }
                                return '';
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
                        title: {
                            display: true,
                            text: 'Units Sold'
                        }
                    }
                }
            }
        });
    },

    renderSensitivityChart() {
        // Show how profit changes with price and volume
        const baseProfit = CVPCalculator.performAnalysis({
            sellingPrice: this.sellingPrice,
            variableCost: this.variableCost,
            fixedCosts: this.fixedCosts,
            actualSalesUnits: this.salesVolume
        }).profit;

        const priceChanges = [-20, -10, 0, 10, 20]; // Percentage changes
        const profitsByPrice = priceChanges.map(change => {
            const newPrice = this.sellingPrice * (1 + change / 100);
            return CVPCalculator.performAnalysis({
                sellingPrice: newPrice,
                variableCost: this.variableCost,
                fixedCosts: this.fixedCosts,
                actualSalesUnits: this.salesVolume
            }).profit;
        });

        const profitsByVolume = priceChanges.map(change => {
            const newVolume = this.salesVolume * (1 + change / 100);
            return CVPCalculator.performAnalysis({
                sellingPrice: this.sellingPrice,
                variableCost: this.variableCost,
                fixedCosts: this.fixedCosts,
                actualSalesUnits: newVolume
            }).profit;
        });

        Components.createChart('sensitivityChart', {
            type: 'line',
            data: {
                labels: priceChanges.map(c => (c > 0 ? '+' : '') + c + '%'),
                datasets: [
                    {
                        label: 'Price Sensitivity',
                        data: profitsByPrice,
                        borderColor: 'rgb(14, 165, 233)',
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Volume Sensitivity',
                        data: profitsByVolume,
                        borderColor: 'rgb(139, 92, 246)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (context) => context.dataset.label + ': ' + Components.formatCurrency(context.parsed.y)
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Profit (LKR)'
                        },
                        ticks: {
                            callback: value => Components.formatCurrency(value)
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Change from Current'
                        }
                    }
                }
            }
        });
    }
};
