// ========================================
// Reports Page - Professional Analytics Report with Colorful Charts
// ========================================

const ReportsPage = {
  currentCharts: {},
  selectedPeriod: 90, // Default to 90 days

  render() {
    return `
      <h2 style="font-size: var(--text-2xl); font-weight: 600; margin-bottom: var(--space-6);">Reports & Export</h2>

      <div class="card mb-6">
        <h3 style="font-size: var(--text-lg); font-weight: 600; margin-bottom: var(--space-4);">Report Configuration</h3>
        
        <div class="form-group">
          <label class="form-label">Analysis Time Period</label>
          <div style="display: flex; gap: var(--space-3); flex-wrap: wrap; margin-bottom: var(--space-4);">
            <button class="btn ${this.selectedPeriod === 30 ? 'btn-primary' : 'btn-secondary'}" onclick="ReportsPage.setPeriod(30)">30 Days</button>
            <button class="btn ${this.selectedPeriod === 60 ? 'btn-primary' : 'btn-secondary'}" onclick="ReportsPage.setPeriod(60)">60 Days</button>
            <button class="btn ${this.selectedPeriod === 90 ? 'btn-primary' : 'btn-secondary'}" onclick="ReportsPage.setPeriod(90)">90 Days</button>
            <button class="btn ${this.selectedPeriod === 180 ? 'btn-primary' : 'btn-secondary'}" onclick="ReportsPage.setPeriod(180)">6 Months</button>
            <button class="btn ${this.selectedPeriod === 365 ? 'btn-primary' : 'btn-secondary'}" onclick="ReportsPage.setPeriod(365)">1 Year</button>
          </div>
          <p style="color: var(--gray-600); font-size: var(--text-sm);">
            Selected: <strong>${this.selectedPeriod} days</strong> of historical data will be analyzed
          </p>
        </div>
      </div>

      <div class="card mb-6" style="text-align: center; padding: var(--space-8);">
        <div style="font-size: var(--text-4xl); margin-bottom: var(--space-4);">📊</div>
        <h3 style="font-size: var(--text-xl); font-weight: 600; margin-bottom: var(--space-3);">
          Professional CVP Analytics Report
        </h3>
        <p style="color: var(--gray-600); margin-bottom: var(--space-6); max-width: 600px; margin-left: auto; margin-right: auto;">
          Generate a comprehensive, colorful PDF report with embedded charts, graphs, data interpretations, 
          and professional analyst insights for all 50 products and sales data.
        </p>
        <button class="btn btn-primary" onclick="ReportsPage.generatePDF()" style="font-size: var(--text-lg); padding: var(--space-4) var(--space-8);">
          📄 Generate ${this.selectedPeriod}-Day Analytics Report
        </button>
      </div>

      <div id="reportPreview" class="hidden">
        <div class="card">
          <h3 class="card-title mb-4">Report Preview</h3>
          <div id="reportContent">
            <!-- Report content will be generated here -->
          </div>
        </div>
      </div>

      <!-- Hidden containers for chart generation -->
      <div id="chartContainers" style="position: absolute; left: -9999px; width: 1000px;">
        <div style="background: white; padding: 20px; margin-bottom: 20px;">
          <canvas id="categoryChart" width="900" height="400"></canvas>
        </div>
        <div style="background: white; padding: 20px; margin-bottom: 20px;">
          <canvas id="productsChart" width="900" height="500"></canvas>
        </div>
        <div style="background: white; padding: 20px;">
          <canvas id="trendChart" width="900" height="350"></canvas>
        </div>
      </div>
    `;
  },

  setPeriod(days) {
    this.selectedPeriod = days;
    App.navigate('reports'); // Refresh page to update UI
  },

  getFilteredSales() {
    const allSales = DataManager.getSales();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - this.selectedPeriod);

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    return allSales.filter(s => s.date >= start && s.date <= end);
  },

  getPeriodLabel() {
    const labels = {
      30: '30-Day',
      60: '60-Day',
      90: '90-Day',
      180: '6-Month',
      365: '1-Year'
    };
    return labels[this.selectedPeriod] || `${this.selectedPeriod}-Day`;
  },

  async generatePDF() {
    Components.showToast(`Generating colorful ${this.getPeriodLabel()} professional analytics report...`, 'info');

    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = 20;

      // Get data - filtered by selected period
      const products = DataManager.getProducts();
      const sales = this.getFilteredSales();
      const fixedCosts = DataManager.getTotalFixedCosts();
      const monthsInPeriod = this.selectedPeriod / 30;
      const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalContribution = sales.reduce((sum, s) => sum + s.contribution, 0);
      const totalProfit = totalContribution - (fixedCosts * monthsInPeriod);
      const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0);

      // === PAGE 1: COLORFUL COVER & EXECUTIVE SUMMARY ===

      // Gradient header background
      pdf.setFillColor(14, 165, 233); // Sky blue
      pdf.rect(0, 0, pageWidth, 50, 'F');

      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text('CVP Intelligence', pageWidth / 2, 20, { align: 'center' });

      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Professional Analytics Report', pageWidth / 2, 30, { align: 'center' });

      pdf.setFontSize(10);
      pdf.setTextColor(240, 240, 255);
      const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      pdf.text(`Generated on ${reportDate}`, pageWidth / 2, 38, { align: 'center' });
      pdf.text(`Sri Lankan Supermarket - ${this.getPeriodLabel()} Analysis`, pageWidth / 2, 44, { align: 'center' });

      yPosition = 60;

      // Executive Summary Box with colored border
      pdf.setDrawColor(139, 92, 246); // Purple
      pdf.setLineWidth(1);
      pdf.setFillColor(249, 250, 251); // Light gray background
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 75, 3, 3, 'FD');
      yPosition += 8;

      pdf.setFontSize(14);
      pdf.setTextColor(139, 92, 246);
      pdf.text('Executive Summary', margin + 5, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setTextColor(31, 41, 55);

      const summaryData = [
        { label: 'Analysis Period:', value: `${this.getPeriodLabel()} (${sales.length} transactions)`, color: [14, 165, 233] },
        { label: 'Product Catalog:', value: `${products.length} items across 9 categories`, color: [16, 185, 129] },
        { label: 'Units Sold:', value: `${totalUnits.toLocaleString()} units`, color: [245, 158, 11] },
        { label: 'Total Revenue:', value: Components.formatCurrency(totalRevenue), color: [14, 165, 233] },
        { label: 'Gross Contribution:', value: `${Components.formatCurrency(totalContribution)} (${((totalContribution / totalRevenue) * 100).toFixed(1)}% margin)`, color: [16, 185, 129] },
        { label: 'Fixed Costs:', value: `${Components.formatCurrency(fixedCosts * monthsInPeriod)} (${monthsInPeriod.toFixed(1)} months)`, color: [239, 68, 68] },
        { label: 'Net Profit:', value: `${Components.formatCurrency(totalProfit)} | ROI: ${((totalProfit / (fixedCosts * monthsInPeriod)) * 100).toFixed(1)}%`, color: totalProfit > 0 ? [16, 185, 129] : [239, 68, 68] },
        { label: 'Avg Transaction:', value: `${Components.formatCurrency(totalRevenue / sales.length)} | ${(totalUnits / sales.length).toFixed(1)} units/txn`, color: [139, 92, 246] }
      ];

      summaryData.forEach(item => {
        pdf.setTextColor(75, 85, 99);
        pdf.text(item.label, margin + 5, yPosition);
        pdf.setTextColor(...item.color);
        pdf.setFont(undefined, 'bold');
        pdf.text(item.value, margin + 45, yPosition);
        pdf.setFont(undefined, 'normal');
        yPosition += 6;
      });

      yPosition += 5;

      // Key Insights Box
      pdf.setFillColor(254, 243, 199); // Amber background
      pdf.setDrawColor(245, 158, 11); // Amber border
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 2, 2, 'FD');
      yPosition += 6;

      pdf.setFontSize(11);
      pdf.setTextColor(146, 64, 14);
      pdf.text('Key Insights & Recommendations', margin + 5, yPosition);
      yPosition += 6;

      pdf.setFontSize(8);
      pdf.setTextColor(120, 53, 15);

      const avgDailyRevenue = totalRevenue / this.selectedPeriod;
      const breakEvenDaily = (fixedCosts / 30);
      const profitMargin = (totalProfit / totalRevenue) * 100;

      const insights = [
        `✓ Performance: Daily revenue ${Components.formatCurrency(avgDailyRevenue)} ${avgDailyRevenue > breakEvenDaily ? 'exceeds' : 'below'} break-even ${Components.formatCurrency(breakEvenDaily)}`,
        `✓ Margins: ${((totalContribution / totalRevenue) * 100).toFixed(1)}% contribution margin indicates ${((totalContribution / totalRevenue) * 100) > 30 ? 'strong' : 'moderate'} pricing power`,
        `✓ Profitability: ${profitMargin.toFixed(1)}% net margin ${profitMargin > 0 ? 'demonstrates sustainable model' : 'requires cost optimization'}`
      ];

      insights.forEach(line => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });

      // === PAGE 2: SALES ANALYTICS WITH COLORFUL CHART ===
      pdf.addPage();
      yPosition = 20;

      // Page header with gradient
      pdf.setFillColor(139, 92, 246);
      pdf.rect(0, 0, pageWidth, 15, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Sales Analytics & Category Performance', pageWidth / 2, 10, { align: 'center' });

      yPosition = 25;

      // Generate and embed category chart
      Components.showToast('Generating category chart...', 'info');
      const categoryChart = await this.generateCategoryChart(sales, products);
      if (categoryChart) {
        pdf.addImage(categoryChart, 'PNG', margin, yPosition, pageWidth - 2 * margin, 85);
        yPosition += 90;
      }

      // Category table with colored rows
      pdf.setFontSize(11);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Category Performance Breakdown', margin, yPosition);
      yPosition += 7;

      const salesByCategory = {};
      sales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
          if (!salesByCategory[product.category]) {
            salesByCategory[product.category] = { revenue: 0, units: 0, contribution: 0 };
          }
          salesByCategory[product.category].revenue += sale.totalAmount;
          salesByCategory[product.category].units += sale.quantity;
          salesByCategory[product.category].contribution += sale.contribution;
        }
      });

      const sortedCategories = Object.entries(salesByCategory)
        .sort((a, b) => b[1].revenue - a[1].revenue);

      // Table header
      pdf.setFillColor(14, 165, 233);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont(undefined, 'bold');
      pdf.text('Category', margin + 2, yPosition + 5);
      pdf.text('Revenue', margin + 60, yPosition + 5);
      pdf.text('Units', margin + 100, yPosition + 5);
      pdf.text('Margin %', margin + 130, yPosition + 5);
      pdf.text('% of Total', margin + 160, yPosition + 5);
      pdf.setFont(undefined, 'normal');
      yPosition += 7;

      sortedCategories.forEach(([category, data], index) => {
        const marginPct = (data.contribution / data.revenue) * 100;
        const revPct = (data.revenue / totalRevenue) * 100;

        // Alternating row colors
        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251);
          pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');
        }

        pdf.setTextColor(31, 41, 55);
        pdf.text(category, margin + 2, yPosition);
        pdf.text(Components.formatCurrency(data.revenue), margin + 60, yPosition);
        pdf.text(data.units.toString(), margin + 100, yPosition);

        // Color code margins
        if (marginPct > 25) {
          pdf.setTextColor(16, 185, 129); // Green
        } else if (marginPct > 15) {
          pdf.setTextColor(245, 158, 11); // Amber
        } else {
          pdf.setTextColor(239, 68, 68); // Red
        }
        pdf.text(marginPct.toFixed(1) + '%', margin + 130, yPosition);

        pdf.setTextColor(107, 114, 128);
        pdf.text(revPct.toFixed(1) + '%', margin + 160, yPosition);

        yPosition += 6;
      });

      yPosition += 5;

      // Analyst Interpretation Box
      pdf.setFillColor(243, 232, 255); // Purple tint
      pdf.setDrawColor(139, 92, 246);
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 28, 2, 2, 'FD');
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setTextColor(107, 33, 168);
      pdf.setFont(undefined, 'bold');
      pdf.text('Analyst Interpretation:', margin + 3, yPosition);
      pdf.setFont(undefined, 'normal');
      yPosition += 5;

      pdf.setFontSize(8);
      pdf.setTextColor(91, 33, 182);
      const topCategory = sortedCategories[0];
      const interpretation = [
        `${topCategory[0]} dominates with ${((topCategory[1].revenue / totalRevenue) * 100).toFixed(1)}% market share and ${((topCategory[1].contribution / topCategory[1].revenue) * 100).toFixed(1)}% margin.`,
        `Portfolio diversification across ${Object.keys(salesByCategory).length} categories mitigates risk. Focus on expanding`,
        `high-margin segments while maintaining customer variety for retention and cross-selling opportunities.`
      ];

      interpretation.forEach(line => {
        pdf.text(line, margin + 3, yPosition);
        yPosition += 4;
      });

      // === PAGE 3: TOP PRODUCTS WITH CHART ===
      pdf.addPage();
      yPosition = 20;

      pdf.setFillColor(16, 185, 129); // Green
      pdf.rect(0, 0, pageWidth, 15, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Top Product Performance', pageWidth / 2, 10, { align: 'center' });

      yPosition = 25;

      // Calculate product metrics
      const productRevenue = {};
      sales.forEach(sale => {
        if (!productRevenue[sale.productId]) {
          productRevenue[sale.productId] = {
            name: sale.productName,
            revenue: 0,
            units: 0,
            contribution: 0
          };
        }
        productRevenue[sale.productId].revenue += sale.totalAmount;
        productRevenue[sale.productId].units += sale.quantity;
        productRevenue[sale.productId].contribution += sale.contribution;
      });

      const topProducts = Object.values(productRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 15);

      // Generate top products chart
      Components.showToast('Generating products chart...', 'info');
      const topProductsChart = await this.generateTopProductsChart(topProducts);
      if (topProductsChart) {
        pdf.addImage(topProductsChart, 'PNG', margin, yPosition, pageWidth - 2 * margin, 80);
        yPosition += 85;
      }

      pdf.setFontSize(11);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Top 15 Products - Detailed Metrics', margin, yPosition);
      yPosition += 7;

      pdf.setFontSize(7);
      topProducts.forEach((prod, index) => {
        const marginPct = (prod.contribution / prod.revenue) * 100;

        // Color-coded ranking
        if (index < 3) {
          pdf.setTextColor(16, 185, 129); // Top 3 in green
        } else if (index < 10) {
          pdf.setTextColor(14, 165, 233); // Top 10 in blue
        } else {
          pdf.setTextColor(107, 114, 128); // Rest in gray
        }

        const text = `${index + 1}. ${prod.name.substring(0, 35)} - ${Components.formatCurrency(prod.revenue)} | ${prod.units} units | ${marginPct.toFixed(1)}% margin`;
        pdf.text(text, margin, yPosition);
        yPosition += 4;
      });

      yPosition += 3;

      // Product Analysis Box
      pdf.setFillColor(220, 252, 231); // Green tint
      pdf.setDrawColor(16, 185, 129);
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 2, 2, 'FD');
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setTextColor(6, 95, 70);
      pdf.setFont(undefined, 'bold');
      pdf.text('Product Portfolio Strategy:', margin + 3, yPosition);
      pdf.setFont(undefined, 'normal');
      yPosition += 5;

      pdf.setFontSize(8);
      pdf.setTextColor(20, 83, 45);
      const top3Revenue = topProducts.slice(0, 3).reduce((sum, p) => sum + p.revenue, 0);
      const top3Pct = (top3Revenue / totalRevenue) * 100;

      const productAnalysis = [
        `Top 3 SKUs drive ${top3Pct.toFixed(1)}% of revenue. ${top3Pct > 40 ? 'High concentration - diversify to reduce risk' : 'Balanced distribution'}`,
        `Avg margin: ${(topProducts.reduce((sum, p) => sum + (p.contribution / p.revenue), 0) / topProducts.length * 100).toFixed(1)}%. Optimize inventory for top performers, test promotions on mid-tier items.`
      ];

      productAnalysis.forEach(line => {
        pdf.text(line, margin + 3, yPosition);
        yPosition += 4;
      });

      // === PAGE 4: CVP ANALYSIS & RECOMMENDATIONS ===
      pdf.addPage();
      yPosition = 20;

      pdf.setFillColor(245, 158, 11); // Amber
      pdf.rect(0, 0, pageWidth, 15, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('CVP & Profitability Analysis', pageWidth / 2, 10, { align: 'center' });

      yPosition = 25;

      // Generate trend chart
      Components.showToast('Generating trend chart...', 'info');
      const trendChart = await this.generateTrendChart(sales);
      if (trendChart) {
        pdf.addImage(trendChart, 'PNG', margin, yPosition, pageWidth - 2 * margin, 70);
        yPosition += 75;
      }

      // Break-Even Analysis Box
      pdf.setFillColor(254, 249, 195); // Yellow tint
      pdf.setDrawColor(245, 158, 11);
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 50, 2, 2, 'FD');
      yPosition += 7;

      pdf.setFontSize(11);
      pdf.setTextColor(146, 64, 14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Break-Even Analysis', margin + 3, yPosition);
      pdf.setFont(undefined, 'normal');
      yPosition += 7;

      pdf.setFontSize(9);
      pdf.setTextColor(120, 53, 15);

      const avgPrice = totalRevenue / totalUnits;
      const avgVarCost = (totalRevenue - totalContribution) / totalUnits;
      const avgContribution = avgPrice - avgVarCost;
      const monthlyBEUnits = fixedCosts / avgContribution;
      const dailyBEUnits = monthlyBEUnits / 30;
      const actualDailyUnits = totalUnits / this.selectedPeriod;

      const cvpMetrics = [
        `Avg Price: ${Components.formatCurrency(avgPrice)} | Var Cost: ${Components.formatCurrency(avgVarCost)} | Contribution: ${Components.formatCurrency(avgContribution)}/unit`,
        ``,
        `Monthly Fixed Costs: ${Components.formatCurrency(fixedCosts)}`,
        `Break-Even: ${Math.ceil(monthlyBEUnits)} units/month (${Math.ceil(dailyBEUnits)} units/day)`,
        ``,
        `Actual Daily Sales: ${Math.ceil(actualDailyUnits)} units`,
        `Margin of Safety: ${Math.ceil(actualDailyUnits - dailyBEUnits)} units/day (${((actualDailyUnits / dailyBEUnits - 1) * 100).toFixed(1)}% above break-even)`
      ];

      cvpMetrics.forEach(line => {
        pdf.text(line, margin + 3, yPosition);
        yPosition += 5;
      });

      yPosition += 5;

      // Financial Summary Box
      pdf.setFillColor(219, 234, 254); // Blue tint
      pdf.setDrawColor(14, 165, 233);
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 40, 2, 2, 'FD');
      yPosition += 7;

      pdf.setFontSize(11);
      pdf.setTextColor(30, 64, 175);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Financial Performance (${this.getPeriodLabel()})`, margin + 3, yPosition);
      pdf.setFont(undefined, 'normal');
      yPosition += 7;

      pdf.setFontSize(9);
      pdf.setTextColor(29, 78, 216);

      const profitMetrics = [
        `Revenue: ${Components.formatCurrency(totalRevenue)}`,
        `Variable Costs: ${Components.formatCurrency(totalRevenue - totalContribution)}`,
        `Contribution: ${Components.formatCurrency(totalContribution)} (${((totalContribution / totalRevenue) * 100).toFixed(1)}%)`,
        `Fixed Costs: ${Components.formatCurrency(fixedCosts * monthsInPeriod)}`,
        `Net Profit: ${Components.formatCurrency(totalProfit)} | Margin: ${((totalProfit / totalRevenue) * 100).toFixed(2)}% | ROI: ${((totalProfit / (fixedCosts * monthsInPeriod)) * 100).toFixed(1)}%`
      ];

      profitMetrics.forEach(line => {
        pdf.text(line, margin + 3, yPosition);
        yPosition += 5;
      });

      yPosition += 5;

      // Strategic Recommendations Box
      pdf.setFillColor(243, 232, 255); // Purple tint
      pdf.setDrawColor(139, 92, 246);
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 50, 2, 2, 'FD');
      yPosition += 7;

      pdf.setFontSize(11);
      pdf.setTextColor(107, 33, 168);
      pdf.setFont(undefined, 'bold');
      pdf.text('Strategic Recommendations', margin + 3, yPosition);
      pdf.setFont(undefined, 'normal');
      yPosition += 7;

      pdf.setFontSize(8);
      pdf.setTextColor(91, 33, 182);

      const recommendations = [
        `1. Inventory: Prioritize top 20% SKUs. Current safety margin allows strategic stock expansion`,
        ``,
        `2. Pricing: ${((totalContribution / totalRevenue) * 100).toFixed(1)}% margin is ${((totalContribution / totalRevenue) * 100) > 25 ? 'strong' : 'moderate'}. Test 5-10% increases on essentials`,
        ``,
        `3. Cost Control: ${Math.ceil(actualDailyUnits - dailyBEUnits)} units/day buffer enables marketing investments`,
        ``,
        `4. Growth: Expand high-margin categories, optimize underperformers or phase out`,
        ``,
        `5. Monitoring: Track vs ${Math.ceil(dailyBEUnits)} unit/day threshold for early intervention`
      ];

      recommendations.forEach(line => {
        pdf.text(line, margin + 3, yPosition);
        yPosition += 4;
      });

      // Add footers to all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        this.addFooter(pdf, pageWidth, pageHeight, i, pageCount);
      }

      // Save PDF
      const filename = `CVP_${this.getPeriodLabel()}_Analytics_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      Components.showToast('✅ Colorful professional analytics report generated successfully!', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      Components.showToast('Error generating PDF: ' + error.message, 'error');
    }
  },

  async generateCategoryChart(sales, products) {
    try {
      const canvas = document.getElementById('categoryChart');
      if (!canvas) return null;

      const ctx = canvas.getContext('2d');

      const salesByCategory = {};
      sales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
          if (!salesByCategory[product.category]) {
            salesByCategory[product.category] = 0;
          }
          salesByCategory[product.category] += sale.totalAmount;
        }
      });

      const sortedData = Object.entries(salesByCategory)
        .sort((a, b) => b[1] - a[1]);

      // Colorful gradient colors
      const colors = [
        'rgba(14, 165, 233, 0.8)',   // Sky blue
        'rgba(139, 92, 246, 0.8)',   // Purple
        'rgba(16, 185, 129, 0.8)',   // Green
        'rgba(245, 158, 11, 0.8)',   // Amber
        'rgba(239, 68, 68, 0.8)',    // Red
        'rgba(236, 72, 153, 0.8)',   // Pink
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(34, 197, 94, 0.8)',    // Emerald
        'rgba(168, 85, 247, 0.8)'    // Violet
      ];

      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sortedData.map(([cat]) => cat),
          datasets: [{
            label: 'Revenue (LKR)',
            data: sortedData.map(([, rev]) => rev),
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace('0.8', '1')),
            borderWidth: 2
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { font: { size: 12, weight: 'bold' } }
            },
            title: {
              display: true,
              text: 'Sales Revenue by Category',
              font: { size: 16, weight: 'bold' },
              color: '#1f2937'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => 'Rs. ' + (value / 1000).toFixed(0) + 'K',
                font: { size: 10 }
              },
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              ticks: { font: { size: 9 } },
              grid: { display: false }
            }
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 800));
      const imageData = canvas.toDataURL('image/png');
      chart.destroy();
      return imageData;
    } catch (error) {
      console.error('Category chart error:', error);
      return null;
    }
  },

  async generateTopProductsChart(topProducts) {
    try {
      const canvas = document.getElementById('productsChart');
      if (!canvas) return null;

      const ctx = canvas.getContext('2d');

      const colors = [
        'rgba(16, 185, 129, 0.8)',   // Top 1 - Green
        'rgba(14, 165, 233, 0.8)',   // Top 2 - Blue
        'rgba(139, 92, 246, 0.8)',   // Top 3 - Purple
        'rgba(245, 158, 11, 0.8)',   // 4
        'rgba(236, 72, 153, 0.8)',   // 5
        'rgba(59, 130, 246, 0.8)',   // 6
        'rgba(34, 197, 94, 0.8)',    // 7
        'rgba(168, 85, 247, 0.8)',   // 8
        'rgba(251, 146, 60, 0.8)',   // 9
        'rgba(107, 114, 128, 0.7)'   // 10
      ];

      const chart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
          labels: topProducts.slice(0, 10).map(p => p.name.substring(0, 30)),
          datasets: [{
            label: 'Revenue (LKR)',
            data: topProducts.slice(0, 10).map(p => p.revenue),
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace('0.8', '1').replace('0.7', '1')),
            borderWidth: 2
          }]
        },
        options: {
          responsive: false,
          indexAxis: 'y',
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { font: { size: 12, weight: 'bold' } }
            },
            title: {
              display: true,
              text: 'Top 10 Products by Revenue',
              font: { size: 16, weight: 'bold' },
              color: '#1f2937'
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: (value) => 'Rs. ' + (value / 1000).toFixed(0) + 'K',
                font: { size: 9 }
              },
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            y: {
              ticks: { font: { size: 8 } },
              grid: { display: false }
            }
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 800));
      const imageData = canvas.toDataURL('image/png');
      chart.destroy();
      return imageData;
    } catch (error) {
      console.error('Products chart error:', error);
      return null;
    }
  },

  async generateTrendChart(sales) {
    try {
      const canvas = document.getElementById('trendChart');
      if (!canvas) return null;

      const ctx = canvas.getContext('2d');

      // Group sales by date
      const salesByDate = {};
      sales.forEach(sale => {
        if (!salesByDate[sale.date]) {
          salesByDate[sale.date] = 0;
        }
        salesByDate[sale.date] += sale.totalAmount;
      });

      const sortedDates = Object.keys(salesByDate).sort();
      const last30Days = sortedDates.slice(-30);

      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: last30Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Daily Revenue (LKR)',
            data: last30Days.map(d => salesByDate[d]),
            borderColor: 'rgb(14, 165, 233)',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(14, 165, 233)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { font: { size: 12, weight: 'bold' } }
            },
            title: {
              display: true,
              text: 'Revenue Trend (Last 30 Days)',
              font: { size: 16, weight: 'bold' },
              color: '#1f2937'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => 'Rs. ' + (value / 1000).toFixed(0) + 'K',
                font: { size: 10 }
              },
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              ticks: { font: { size: 8 } },
              grid: { display: false }
            }
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 800));
      const imageData = canvas.toDataURL('image/png');
      chart.destroy();
      return imageData;
    } catch (error) {
      console.error('Trend chart error:', error);
      return null;
    }
  },

  addFooter(pdf, pageWidth, pageHeight, pageNum, totalPages) {
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.text(
      `Page ${pageNum} of ${totalPages} | CVP Intelligence Professional Analytics | Confidential`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
};
