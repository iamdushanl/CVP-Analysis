// ========================================
// CVP Calculator Page
// ========================================

const CVPCalculatorPage = {
  currentProductId: null,

  render() {
    const products = DataManager.getProducts();
    const fixedCosts = DataManager.getTotalFixedCosts();

    const productOptions = products.map(p => ({
      value: p.id,
      label: p.name
    }));

    const selectedProduct = products[0] || null;
    this.currentProductId = selectedProduct?.id || null;

    return `
      <h2 style="font-size: var(--text-2xl); font-weight: 600; margin-bottom: var(--space-6);">CVP Calculator</h2>

      <div class="grid-2 mb-6">
        <div class="card">
          <h3 class="card-title mb-4">Input Parameters</h3>
          
          <div class="form-group">
            <label class="form-label">Select Product</label>
            <select class="form-select" id="productSelect" onchange="CVPCalculatorPage.onProductChange()">
              ${productOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Total Fixed Costs</label>
            <input type="text" class="form-input" value="${Components.formatCurrency(fixedCosts)}" readonly>
          </div>

          <div class="form-group">
            <label class="form-label">Selling Price (per unit)</label>
            <input type="text" class="form-input" id="sellingPriceDisplay" value="${selectedProduct ? Components.formatCurrency(selectedProduct.sellingPrice) : 'Rs. 0.00'}" readonly>
          </div>

          <div class="form-group">
            <label class="form-label">Variable Cost (per unit)</label>
            <input type="text" class="form-input" id="variableCostDisplay" value="${selectedProduct ? Components.formatCurrency(selectedProduct.variableCost) : 'Rs. 0.00'}" readonly>
          </div>
        </div>

        <div class="card" id="outputMetrics">
          <h3 class="card-title mb-4">Calculated Outputs</h3>
          <div id="metricsContent">
            <!-- Metrics will be loaded here -->
          </div>
        </div>
      </div>

      <div class="chart-container">
        <h3 class="card-title mb-4">CVP Analysis Chart</h3>
        <div class="chart-wrapper" style="height: 400px;">
          <canvas id="cvpChart"></canvas>
        </div>
      </div>
    `;
  },

  renderCharts() {
    this.updateCalculations();
  },

  onProductChange() {
    const productId = document.getElementById('productSelect').value;
    this.currentProductId = productId;
    this.updateCalculations();
  },

  updateCalculations() {
    if (!this.currentProductId) return;

    const product = DataManager.getProductById(this.currentProductId);
    const fixedCosts = DataManager.getTotalFixedCosts();

    if (!product) return;

    // Update displays
    document.getElementById('sellingPriceDisplay').value = Components.formatCurrency(product.sellingPrice);
    document.getElementById('variableCostDisplay').value = Components.formatCurrency(product.variableCost);

    // Calculate CVP metrics
    const analysis = CVPCalculator.performAnalysis({
      sellingPrice: product.sellingPrice,
      variableCost: product.variableCost,
      fixedCosts: fixedCosts
    });

    // Display metrics
    const metricsHtml = `
      <div class="form-group">
        <label class="form-label">Contribution Margin (per unit)</label>
        <input type="text" class="form-input" value="${Components.formatCurrency(analysis.contributionMargin)}" readonly style="font-weight: 600; background: var(--gray-50);">
      </div>
      
      <div class="form-group">
        <label class="form-label">PV Ratio (Contribution Margin Ratio)</label>
        <input type="text" class="form-input" value="${Components.formatNumber(analysis.pvRatio, 2)}%" readonly style="font-weight: 600; background: var(--gray-50);">
      </div>
      
      <div class="form-group">
        <label class="form-label">Break-Even Units</label>
        <input type="text" class="form-input" value="${Components.formatNumber(analysis.breakEvenUnits, 0)} units" readonly style="font-weight: 600; background: var(--primary-50); color: var(--primary-700);">
      </div>
      
      <div class="form-group">
        <label class="form-label">Break-Even Sales Value</label>
        <input type="text" class="form-input" value="${Components.formatCurrency(analysis.breakEvenValue)}" readonly style="font-weight: 600; background: var(--primary-50); color: var(--primary-700);">
      </div>
    `;

    document.getElementById('metricsContent').innerHTML = metricsHtml;

    // Render chart
    const chartData = CVPCalculator.generateChartData({
      sellingPrice: product.sellingPrice,
      variableCost: product.variableCost,
      fixedCosts: fixedCosts,
      maxUnits: Math.ceil(analysis.breakEvenUnits * 2.5)
    });

    Components.createChart('cvpChart', {
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
                return context.dataset.label + ': ' + Components.formatCurrency(context.parsed.y);
              },
              afterLabel: function (context) {
                if (context.dataset.label === 'Break-Even Point') {
                  return `At ${chartData.breakEvenUnits} units`;
                }
                return '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount (LKR)'
            },
            ticks: {
              callback: value => Components.formatCurrency(value)
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
  }
};
