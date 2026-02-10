// ========================================
// Sales Page - Enhanced
// ========================================

const SalesPage = {
    render() {
        const sales = DataManager.getSales().sort((a, b) => b.date.localeCompare(a.date));
        const products = DataManager.getProducts();

        const rows = sales.map(sale => ({
            id: sale.id,
            cells: [
                Components.formatDate(sale.date),
                sale.productName,
                sale.quantity,
                Components.formatCurrency(sale.unitPrice),
                Components.formatCurrency(sale.totalAmount),
                Components.formatCurrency(sale.contribution)
            ]
        }));

        const table = Components.createTable(
            ['Date', 'Product', 'Quantity', 'Unit Price', 'Total Amount', 'Contribution'],
            rows,
            [
                {
                    label: 'Delete',
                    icon: '🗑️',
                    class: 'delete',
                    onClick: 'SalesPage.deleteSale'
                }
            ]
        );

        // Calculate totals
        const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalContribution = sales.reduce((sum, s) => sum + s.contribution, 0);

        return `
      <div class="flex-between mb-6">
        <div>
          <h2 style="font-size: var(--text-2xl); font-weight: 600; margin-bottom: var(--space-2);">Sales Tracking</h2>
          <p style="color: var(--gray-600);">
            Total Sales: <strong>${Components.formatCurrency(totalSales)}</strong> | 
            Total Contribution: <strong>${Components.formatCurrency(totalContribution)}</strong>
          </p>
        </div>
        <div class="flex gap-4">
          <button class="btn btn-secondary" onclick="SalesPage.exportCSV()">
            📥 Export CSV
          </button>
          <button class="btn btn-secondary" onclick="SalesPage.showImportModal()">
            📤 Import CSV
          </button>
          <button class="btn btn-primary" onclick="SalesPage.showAddModal()">
            ➕ Add Sale
          </button>
        </div>
      </div>

      <div class="mb-6">
        <div class="chart-container">
          <h3 class="card-title mb-4">Daily Sales Chart (Last 30 Days)</h3>
          <div class="chart-wrapper">
            <canvas id="dailySalesChart"></canvas>
          </div>
        </div>
      </div>

      ${table}
    `;
    },

    renderCharts() {
        const sales = DataManager.getSalesLast30Days();
        const dailyRevenue = {};

        sales.forEach(sale => {
            if (!dailyRevenue[sale.date]) {
                dailyRevenue[sale.date] = 0;
            }
            dailyRevenue[sale.date] += sale.totalAmount;
        });

        const sortedDates = Object.keys(dailyRevenue).sort();
        const revenues = sortedDates.map(date => dailyRevenue[date]);

        Components.createChart('dailySalesChart', {
            type: 'bar',
            data: {
                labels: sortedDates.map(d => Components.formatDate(d)),
                datasets: [{
                    label: 'Daily Sales',
                    data: revenues,
                    backgroundColor: 'rgba(14, 165, 233, 0.8)',
                    borderColor: 'rgb(14, 165, 233)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => Components.formatCurrency(value)
                        }
                    }
                }
            }
        });
    },

    showAddModal() {
        const products = DataManager.getProducts();
        const productOptions = products.map(p => ({
            value: p.id,
            label: `${p.name} - ${Components.formatCurrency(p.sellingPrice)}`
        }));

        const today = new Date().toISOString().split('T')[0];

        const formHtml = `
      <form id="saleForm">
        ${Components.createFormField('Product', 'select', 'productId', {
            required: true,
            selectOptions: [{ value: '', label: 'Select a product' }, ...productOptions]
        })}
        ${Components.createFormField('Quantity', 'number', 'quantity', { required: true, min: 1, step: 1, value: 1 })}
        ${Components.createFormField('Unit Price', 'number', 'unitPrice', { required: true, min: 0, step: 0.01, placeholder: '0.00' })}
        ${Components.createFormField('Date', 'date', 'date', { required: true, value: today })}
      </form>
      <script>
        document.getElementById('productId').addEventListener('change', function() {
          const productId = this.value;
          if (productId) {
            const product = DataManager.getProductById(productId);
            if (product) {
              document.getElementById('unitPrice').value = product.sellingPrice;
            }
          }
        });
      </script>
    `;

        Components.showModal('Add Sale', formHtml, [
            {
                label: 'Add Sale',
                class: 'btn-primary',
                onClick: 'SalesPage.saveSale()'
            }
        ]);
    },

    saveSale() {
        const form = document.getElementById('saleForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const productId = document.getElementById('productId').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const unitPrice = parseFloat(document.getElementById('unitPrice').value);
        const date = document.getElementById('date').value;

        const product = DataManager.getProductById(productId);
        if (!product) {
            Components.showToast('Invalid product selected', 'error');
            return;
        }

        const saleData = {
            productId,
            productName: product.name,
            quantity,
            unitPrice,
            date
        };

        const result = DataManager.addSale(saleData);

        if (result.success) {
            Components.showToast('Sale added successfully', 'success');
            Components.closeModal();
            App.navigate('sales');
        } else {
            Components.showToast(result.errors.join(', '), 'error');
        }
    },

    deleteSale(id) {
        if (confirm('Are you sure you want to delete this sale?')) {
            const result = DataManager.deleteSale(id);

            if (result.success) {
                Components.showToast('Sale deleted successfully', 'success');
                App.navigate('sales');
            } else {
                Components.showToast(result.errors.join(', '), 'error');
            }
        }
    },

    /**
     * Export sales to CSV with error handling
     * Fixed: Added try-catch and proper user feedback
     */
    exportCSV() {
        try {
            const sales = DataManager.getSales();

            if (sales.length === 0) {
                Components.showToast('No sales to export', 'error');
                return;
            }

            const csvData = sales.map(s => ({
                'Date': s.date,
                'Product Name': s.productName,
                'Quantity': s.quantity,
                'Unit Price': s.unitPrice,
                'Total Amount': s.totalAmount,
                'Contribution': s.contribution
            }));

            const csv = CSVHandler.arrayToCSV(csvData);
            const filename = `sales_export_${new Date().toISOString().split('T')[0]}.csv`;
            CSVHandler.downloadCSV(filename, csv);

            Components.showToast(`✅ Exported ${sales.length} sales records successfully`, 'success');
        } catch (error) {
            console.error('Error exporting sales:', error);
            Components.showToast('❌ Failed to export sales. Please try again.', 'error');
        }
    },

    /**
     * Show import modal
     */
    showImportModal() {
        const modalContent = `
      <div>
        <p style="margin-bottom: var(--space-4); color: var(--text-secondary);">
          Upload a CSV file with sales data. The file should include columns for Product (name or SKU), Quantity, Unit Price, and Date.
        </p>
        
        <div class="form-group">
          <label class="form-label">Select CSV File</label>
          <input type="file" id="csvFileInput" accept=".csv" class="form-input">
        </div>

        <div style="padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius-md); font-size: var(--text-sm);">
          <p style="font-weight: 600; margin-bottom: var(--space-2);">Expected CSV Format:</p>
          <code style="display: block; color: var(--text-secondary);">
            Date,Product,Quantity,Unit Price<br>
            2024-01-15,Product Name,10,100.00
          </code>
        </div>
      </div>
    `;

        Components.showModal('Import Sales from CSV', modalContent, [
            {
                label: 'Next: Map Columns',
                class: 'btn-primary',
                onClick: 'SalesPage.processCSVFile()'
            }
        ]);
    },

    /**
     * Process uploaded CSV file
     */
    processCSVFile() {
        CSVHandler.handleFileUpload('csvFileInput', (parsed) => {
            Components.closeModal();

            if (parsed.rows.length === 0) {
                Components.showToast('CSV file is empty', 'error');
                return;
            }

            // Show column mapping modal
            const targetFields = [
                { key: 'date', label: 'Date', required: true, type: 'text' },
                { key: 'productName', label: 'Product Name or SKU', required: true, type: 'text' },
                { key: 'quantity', label: 'Quantity', required: true, type: 'number' },
                { key: 'unitPrice', label: 'Unit Price', required: true, type: 'number' }
            ];

            CSVHandler.showMappingModal(
                parsed.headers,
                parsed.rows[0],
                targetFields,
                (mapping) => {
                    SalesPage.importSales(parsed.rows, mapping, targetFields);
                }
            );
        });
    },

    /**
     * Import sales with validation
     */
    importSales(rows, mapping, targetFields) {
        const products = DataManager.getProducts();

        const importFunction = (item) => {
            // Find product by name or SKU
            const product = products.find(p =>
                p.name.toLowerCase() === item.productName.toLowerCase() ||
                p.sku.toLowerCase() === item.productName.toLowerCase()
            );

            if (!product) {
                return { success: false, error: `Product not found: ${item.productName}` };
            }

            // Validate quantity
            if (item.quantity <= 0) {
                return { success: false, error: 'Quantity must be greater than 0' };
            }

            // Validate unit price
            if (item.unitPrice < 0) {
                return { success: false, error: 'Unit price cannot be negative' };
            }

            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(item.date)) {
                return { success: false, error: 'Invalid date format (use YYYY-MM-DD)' };
            }

            // Add sale using new API
            const result = DataManager.addSale({
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                date: item.date
            });

            if (!result.success) {
                return { success: false, error: result.errors.join(', ') };
            }

            return { success: true };
        };

        const results = CSVHandler.validateAndImport(rows, mapping, targetFields, importFunction);
        CSVHandler.showImportResults(results);

        if (results.successful.length > 0) {
            App.navigate('sales');
        }
    }
};
