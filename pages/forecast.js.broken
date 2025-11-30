// ========================================
// Forecast Page - Multi-Horizon Forecasting
// ========================================

const ForecastPage = {
  currentProductId: null,
  currentHorizon: '7d',

  render() {
    const products = DataManager.getProducts();
    const productOptions = products.map(p => ({
      value: p.id,
      label: p.name
    }));

    const selectedProduct = products[0] || null;
    this.currentProductId = selectedProduct?.id || null;

    return `
      <h2 style="font-size: var(--text-2xl); font-weight: 600; margin-bottom: var(--space-6);">Demand Forecast</h2>

      <div class="card mb-6">
        <div class="form-group">
          <label class="form-label">Select Product</label>
          <select class="form-select" id="forecastProductSelect" onchange="ForecastPage.onProductChange()" style="max-width: 500px;">
            ${productOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
          </select>
        </div>

        <div class="form-group mt-4">
          <label class="form-label">Forecast Horizon</label>
          <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
            <button class="btn ${this.currentHorizon === '7d' ? 'btn-primary' : 'btn-secondary'}" onclick="ForecastPage.setHorizon('7d')">7 Days</button>
            <button class="btn ${this.currentHorizon === '1m' ? 'btn-primary' : 'btn-secondary'}" onclick="ForecastPage.setHorizon('1m')">1 Month</button>
            <button class="btn ${this.currentHorizon === '6m' ? 'btn-primary' : 'btn-secondary'}" onclick="ForecastPage.setHorizon('6m')">6 Months</button>
            <button class="btn ${this.currentHorizon === '1y' ? 'btn-primary' : 'btn-secondary'}" onclick="ForecastPage.setHorizon('1y')">1 Year</button>
            <button class="btn ${this.currentHorizon === '5y' ? 'btn-primary' : 'btn-secondary'}" onclick="ForecastPage.setHorizon('5y')">5 Years</button>
          </div>
        </div>
      </div>

      <div class="grid-3 mb-6" id="forecastMetrics">
        <!-- Forecast metrics will be loaded here -->
      </div>

      <div class="chart-container">
        <h3 class="card-title mb-4" id="forecastChartTitle">Historical Data + Forecast</h3>
        <div class="chart-wrapper" style="height: 400px;">
          <canvas id="forecastChartCanvas"></canvas>
        </div>
      </div>

      <div class="grid-2 mt-6">
        <div class="card">
          <h3 class="card-title mb-4">Trend Analysis</h3>
          <div id="trendAnalysis">
            <!-- Trend analysis will be loaded here -->
          </div>
        </div>

        <div class="card">
          <h3 class="card-title mb-4">Forecast Summary</h3>
          <div id="forecastSummary">
            <!-- Forecast summary will be loaded here -->
          </div>
        </div>
      </div>
    `;
  },

  renderCharts() {
    this.loadForecast();
  },

  onProductChange() {
    const productId = document.getElementById('forecastProductSelect').value;
    this.currentProductId = productId;
    this.loadForecast();
  },

  setHorizon(horizon) {
    this.currentHorizon = horizon;
    App.navigate('forecast');
  },

  getHorizonDays(horizon) {
    const horizonMap = {
      '7d': 7,
      '1m': 30,
      '6m': 180,
      '1y': 365,
      '5y': 1825
    };
    return horizonMap[horizon] || 7;
  },

  getHorizonLabel(horizon) {
    const labels = {
      '7d': '7-Day',
      '1m': '1-Month',
      '6m': '6-Month',
      '1y': '1-Year',
      '5y': '5-Year'
    };
    return labels[horizon] || '7-Day';
  },

  loadForecast() {
    if (!this.currentProductId) return;

    const forecastDays = this.getHorizonDays(this.currentHorizon);
    const horizonLabel = this.getHorizonLabel(this.currentHorizon);
    const forecastData = ForecastEngine.generateForecast(this.currentProductId, forecastDays);
    const product = DataManager.getProductById(this.currentProductId);

    document.getElementById('forecastChartTitle').textContent = `Historical Data + ${horizonLabel} Forecast`;

    const metricsHtml = `
      ${Components.createMetricCard('Avg Daily Demand', Components.formatNumber(forecastData.metrics.avgDailyDemand, 1) + ' units')}
      ${Components.createMetricCard('Predicted Daily Demand', Components.formatNumber(forecastData.metrics.predictedDailyDemand, 1) + ' units')}
      ${Components.createMetricCard('Total Forecast Demand', Components.formatNumber(forecastData.metrics.totalForecastDemand, 0) + ' units')}
      ${Components.createMetricCard('Avg Daily Revenue', Components.formatCurrency(forecastData.metrics.avgDailyContribution))}
      ${Components.createMetricCard('Predicted Daily Revenue', Components.formatCurrency(forecastData.metrics.predictedDailyContribution))}
      ${Components.createMetricCard('Total Forecast Revenue', Components.formatCurrency(forecastData.metrics.totalForecastContribution))}
    `;

    document.getElementById('forecastMetrics').innerHTML = metricsHtml;

    const trend = ForecastEngine.analyzeTrend(forecastData.historical.quantities);
    const trendIconSymbol = trend.direction === 'increasing' ? '📈' : trend.direction === 'decreasing' ? '📉' : '➡️';
    const trendColor = trend.direction === 'increasing' ? 'var(--success-600)' : trend.direction === 'decreasing' ? 'var(--danger-600)' : 'var(--gray-600)';

    const trendHtml = `
      <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div style="font-size: var(--text-4xl);">${trendIconSymbol}</div>
        <div>
          <div style="font-size: var(--text-lg); font-weight: 600; color: ${trendColor}; text-transform: capitalize;">
            ${trend.direction}
          </div>
          <div style="color: var(--gray-600); font-size: var(--text-sm);">
            Trend Strength: ${trend.strength}
          </div>
        </div>
      </div>
      <div style="font-size: var(--text-sm); color: var(--gray-600);">
        The demand for <strong>${product.name}</strong> is showing a <strong>${trend.strength} ${trend.direction}</strong> trend 
        based on historical data analysis.
      </div>
    `;

    document.getElementById('trendAnalysis').innerHTML = trendHtml;

    const unitContribution = product.sellingPrice - product.variableCost;
    const totalRevenue = forecastData.metrics.totalForecastDemand * product.sellingPrice;
    const totalContribution = forecastData.metrics.totalForecastDemand * unitContribution;

    const summaryHtml = `
      <div class="form-group">
        <label class="form-label">Forecast Period</label>
        <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--primary-600);">
          ${horizonLabel}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Expected Units</label>
        <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--accent-600);">
          ${Components.formatNumber(forecastData.metrics.totalForecastDemand, 0)}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Expected Revenue</label>
        <div style="font-size: var(--text-xl); font-weight: 700; color: var(--success-600);">
          ${Components.formatCurrency(totalRevenue)}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Expected Contribution</label>
        <div style="font-size: var(--text-xl); font-weight: 700; color: var(--success-600);">
          ${Components.formatCurrency(totalContribution)}
        </div>
      </div>
      <div style="font-size: var(--text-sm); color: var(--gray-600); margin-top: var(--space-4); padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius-md);">
        💡 <strong>Insight:</strong> Based on ${horizonLabel.toLowerCase()} historical patterns, we predict ${Components.formatNumber(forecastData.metrics.predictedDailyDemand, 1)} units/day on average.
      </div>
    `;

    document.getElementById('forecastSummary').innerHTML = summaryHtml;

    this.renderForecastChart(forecastData);
  },

  renderForecastChart(forecastData) {
    const allDates = [...forecastData.historical.dates, ...forecastData.forecast.dates];
    const historicalQty = [...forecastData.historical.quantities, ...Array(forecastData.forecast.dates.length).fill(null)];
    const forecastQty = [...Array(forecastData.historical.dates.length).fill(null), ...forecastData.forecast.quantities];

    forecastQty[forecastData.historical.dates.length] = forecastData.historical.quantities[forecastData.historical.quantities.length - 1];

    Components.createChart('forecastChartCanvas', {
      type: 'line',
      data: {
        labels: allDates.map(d => Components.formatDate(d)),
        datasets: [
          {
            label: 'Historical Demand',
            data: historicalQty,
            borderColor: 'rgb(14, 165, 233)',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Forecasted Demand',
            data: forecastQty,
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderDash: [5, 5],
            tension: 0.4,
            fill: true
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
              label: function (context) {
                return context.dataset.label + ': ' + Components.formatNumber(context.parsed.y, 1) + ' units';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Units Sold'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 20
            }
          }
        }
      }
    });
  }
};
