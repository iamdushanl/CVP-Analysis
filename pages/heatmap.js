// ========================================
// Heatmap Analysis Page
// ========================================

const HeatmapPage = {
  selectedProductId: null,

  render() {
    const products = DataManager.getProducts();

    return `
      <div class="mb-6">
        <h2 style="font-size: var(--text-2xl); font-weight: 600;">Profit Sensitivity Heatmap</h2>
        <p style="color: var(--text-secondary); margin-top: var(--space-2);">
          Visualize how price and volume changes impact profitability
        </p>
      </div>

      <div class="card mb-6">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Select Product</label>
            <select id="heatmapProductSelect" class="form-select" onchange="HeatmapPage.generateHeatmap()">
              <option value="">Choose a product...</option>
              ${products.map(p => `
                <option value="${p.id}">${p.name} - ${Components.formatCurrency(p.sellingPrice)}</option>
              `).join('')}
            </select>
          </div>
          
          <div style="display: flex; gap: var(--space-3); align-items: flex-end;">
            <button class="btn btn-primary" onclick="HeatmapPage.showCustomRanges()" style="flex: 1;">
              ⚙️ Custom Ranges
            </button>
            <button class="btn btn-secondary" onclick="HeatmapPage.exportHeatmap()" id="exportHeatmapBtn" disabled style="flex: 1;">
              📥 Export CSV
            </button>
          </div>
        </div>
      </div>

      <div id="heatmapContainer" style="display: none;">
        <div class="card">
          <div id="heatmapLegend" class="mb-4"></div>
          <div id="heatmapGrid" style="overflow-x: auto;"></div>
          <div id="optimalPoint" class="mt-6"></div>
        </div>
      </div>

      <div id="heatmapPlaceholder" class="card text-center" style="padding: var(--space-16); color: var(--text-muted);">
        <div style="font-size: var(--text-4xl); margin-bottom: var(--space-4);">📊</div>
        <p style="font-size: var(--text-lg);">Select a product to generate the profit sensitivity heatmap</p>
      </div>
    `;
  },

  generateHeatmap(customRanges = null) {
    const productId = document.getElementById('heatmapProductSelect').value;

    if (!productId) {
      Components.showToast('Please select a product', 'error');
      return;
    }

    this.selectedProductId = productId;

    const priceRange = customRanges?.price || { min: -50, max: 50, step: 10 };
    const volumeRange = customRanges?.volume || { min: -50, max: 200, step: 25 };

    const heatmapData = HeatmapEngine.generateProfitMatrix(productId, priceRange, volumeRange);

    if (!heatmapData) {
      Components.showToast('Failed to generate heatmap', 'error');
      return;
    }

    this.renderHeatmap(heatmapData);

    document.getElementById('heatmapContainer').style.display = 'block';
    document.getElementById('heatmapPlaceholder').style.display = 'none';
    document.getElementById('exportHeatmapBtn').disabled = false;
  },

  renderHeatmap(data) {
    const { matrix, pricePoints, volumePoints, basePrice, baseVolume, product } = data;
    const { min, max } = HeatmapEngine.getProfitRange(matrix);

    // Render legend
    const legendHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius-md);">
        <div>
          <strong>Base Price:</strong> ${Components.formatCurrency(basePrice)} | 
          <strong>Avg Monthly Volume:</strong> ${Math.round(baseVolume)} units
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-4);">
          <span style="font-size: var(--text-sm); color: var(--text-secondary);">Profit Range:</span>
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <div style="width: 20px; height: 20px; background: #ef4444; border-radius: var(--radius-sm);"></div>
            <span style="font-size: var(--text-xs);">Loss</span>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <div style="width: 20px; height: 20px; background: #fbbf24; border-radius: var(--radius-sm);"></div>
            <span style="font-size: var(--text-xs);">Break-even</span>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <div style="width: 20px; height: 20px; background: #10b981; border-radius: var(--radius-sm);"></div>
            <span style="font-size: var(--text-xs);">Profit</span>
          </div>
        </div>
      </div>
    `;
    document.getElementById('heatmapLegend').innerHTML = legendHtml;

    // Render heatmap grid
    let gridHtml = '<table style="width: 100%; border-collapse: separate; border-spacing: 2px;">';

    // Header row
    gridHtml += '<thead><tr><th style="padding: var(--space-3); text-align: center; font-weight: 600; background: var(--gray-100);">Volume \\ Price</th>';
    pricePoints.forEach(pricePct => {
      gridHtml += `<th style="padding: var(--space-3); text-align: center; font-weight: 600; font-size: var(--text-xs); background: var(--gray-100);">${pricePct > 0 ? '+' : ''}${pricePct}%</th>`;
    });
    gridHtml += '</tr></thead><tbody>';

    // Data rows
    matrix.forEach((row, rowIdx) => {
      const volumePct = volumePoints[rowIdx];
      gridHtml += `<tr><td style="padding: var(--space-3); text-align: center; font-weight: 600; font-size: var(--text-xs); background: var(--gray-100);">${volumePct > 0 ? '+' : ''}${volumePct}%</td>`;

      row.forEach(cell => {
        const color = HeatmapEngine.getProfitColor(cell.profit, min, max);
        const isBase = cell.pricePercent === 0 && cell.volumePercent === 0;
        const borderStyle = isBase ? 'border: 3px solid var(--primary-600);' : '';

        gridHtml += `
          <td 
            style="
              padding: var(--space-3);
              text-align: center;
              background: ${color};
              cursor: pointer;
              transition: transform var(--transition-fast);
              font-size: var(--text-xs);
              font-weight: 600;
              color: ${cell.profit < 0 ? 'white' : 'var(--gray-900)'};
              ${borderStyle}
            "
            onmouseover="this.style.transform='scale(1.1)'; this.style.zIndex='10';"
            onmouseout="this.style.transform='scale(1)'; this.style.zIndex='1';"
            title="Price: ${Components.formatCurrency(cell.price)} | Volume: ${Math.round(cell.volume)} | Profit: ${Components.formatCurrency(cell.profit)}"
          >
            ${Components.formatCurrency(cell.profit)}
          </td>
        `;
      });

      gridHtml += '</tr>';
    });

    gridHtml += '</tbody></table>';
    document.getElementById('heatmapGrid').innerHTML = gridHtml;

    // Find and display optimal point
    const optimal = HeatmapEngine.findOptimalPoint(data);
    if (optimal) {
      const optimalHtml = `
        <div style="padding: var(--space-6); background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(14, 165, 233, 0.1)); border-radius: var(--radius-lg); border-left: 4px solid var(--success-600);">
          <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
            <span style="font-size: var(--text-2xl);">🎯</span>
            <h3 style="font-weight: 700; font-size: var(--text-xl); margin: 0;">Optimal Configuration</h3>
          </div>
          <div class="grid-3">
            <div>
              <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-1);">Suggested Price</div>
              <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--primary-600);">${Components.formatCurrency(optimal.price)}</div>
              <div style="font-size: var(--text-xs); color: var(--text-muted);">${optimal.pricePercent > 0 ? '+' : ''}${optimal.pricePercent}% vs current</div>
            </div>
            <div>
              <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-1);">Target Volume</div>
              <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--accent-600);">${Math.round(optimal.volume)} units</div>
              <div style="font-size: var(--text-xs); color: var(--text-muted);">${optimal.volumePercent > 0 ? '+' : ''}${optimal.volumePercent}% vs avg</div>
            </div>
            <div>
              <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-1);">Maximum Profit</div>
              <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--success-600);">${Components.formatCurrency(optimal.profit)}</div>
              <div style="font-size: var(--text-xs); color: var(--text-muted);">${optimal.margin.toFixed(1)}% margin</div>
            </div>
          </div>
        </div>
      `;
      document.getElementById('optimalPoint').innerHTML = optimalHtml;
    }
  },

  showCustomRanges() {
    const modalContent = `
      <form id="customRangesForm">
        <h4 style="margin-bottom: var(--space-4);">Price Variation Range</h4>
        <div class="grid-3 mb-4">
          ${Components.createFormField('Min %', 'number', 'priceMin', { value: -50, step: 5 })}
          ${Components.createFormField('Max %', 'number', 'priceMax', { value: 50, step: 5 })}
          ${Components.createFormField('Step %', 'number', 'priceStep', { value: 10, step: 5 })}
        </div>

        <h4 style="margin-bottom: var(--space-4); margin-top: var(--space-6);">Volume Variation Range</h4>
        <div class="grid-3">
          ${Components.createFormField('Min %', 'number', 'volumeMin', { value: -50, step: 5 })}
          ${Components.createFormField('Max %', 'number', 'volumeMax', { value: 200, step: 5 })}
          ${Components.createFormField('Step %', 'number', 'volumeStep', { value: 25, step: 5 })}
        </div>
      </form>
    `;

    Components.showModal('Custom Heatmap Ranges', modalContent, [
      {
        label: 'Generate Heatmap',
        class: 'btn-primary',
        onClick: 'HeatmapPage.applyCustomRanges()'
      }
    ]);
  },

  applyCustomRanges() {
    const customRanges = {
      price: {
        min: parseInt(document.getElementById('priceMin').value),
        max: parseInt(document.getElementById('priceMax').value),
        step: parseInt(document.getElementById('priceStep').value)
      },
      volume: {
        min: parseInt(document.getElementById('volumeMin').value),
        max: parseInt(document.getElementById('volumeMax').value),
        step: parseInt(document.getElementById('volumeStep').value)
      }
    };

    Components.closeModal();
    this.generateHeatmap(customRanges);
  },

  exportHeatmap() {
    if (!this.selectedProductId) {
      Components.showToast('No heatmap to export', 'error');
      return;
    }

    const heatmapData = HeatmapEngine.generateProfitMatrix(this.selectedProductId);
    const csv = HeatmapEngine.exportHeatmapData(heatmapData);

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `heatmap_${heatmapData.product.name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    Components.showToast('Heatmap exported successfully', 'success');
  }
};
