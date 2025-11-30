// ========================================
// Products Page - Enhanced
// ========================================

const ProductsPage = {
    render() {
        const products = DataManager.getProducts();

        const rows = products.map(product => ({
            id: product.id,
            cells: [
                product.sku,
                product.name,
                product.category || '-',
                Components.formatCurrency(product.sellingPrice),
                Components.formatCurrency(product.variableCost),
                Components.formatCurrency(product.sellingPrice - product.variableCost)
            ]
        }));

        const table = Components.createTable(
            ['SKU', 'Product Name', 'Category', 'Selling Price', 'Variable Cost', 'Contribution/Unit'],
            rows,
            [
                {
                    label: 'Edit',
                    icon: '✏️',
                    class: 'edit',
                    onClick: 'ProductsPage.editProduct'
                },
                {
                    label: 'Delete',
                    icon: '🗑️',
                    class: 'delete',
                    onClick: 'ProductsPage.deleteProduct'
                }
            ]
        );

        return `
      <div class="flex-between mb-6">
        <h2 style="font-size: var(--text-2xl); font-weight: 600;">Product Management</h2>
        <div class="flex gap-4">
          <button class="btn btn-secondary" onclick="ProductsPage.exportCSV()">
            📥 Export CSV
          </button>
          <button class="btn btn-secondary" onclick="ProductsPage.showImportModal()">
            📤 Import CSV
          </button>
          <button class="btn btn-primary" onclick="ProductsPage.showAddModal()">
            ➕ Add New Product
          </button>
        </div>
      </div>
      
      <div class="card mb-4" style="padding: var(--space-4); background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1)); border-left: 4px solid var(--primary-500);">
        <div style="display: flex; align-items: center; gap: var(--space-3);">
          <span style="font-size: var(--text-2xl);">📦</span>
          <div>
            <div style="font-weight: 600; color: var(--text-primary);">Total Products: ${products.length}</div>
            <div style="font-size: var(--text-sm); color: var(--text-secondary);">Manage your product catalog and pricing</div>
          </div>
        </div>
      </div>
      
      ${table}
    `;
    },

    showAddModal() {
        const formHtml = `
      <form id="productForm">
        ${Components.createFormField('SKU', 'text', 'sku', { required: true, placeholder: 'e.g., PROD-001' })}
        ${Components.createFormField('Product Name', 'text', 'name', { required: true, placeholder: 'Enter product name' })}
        ${Components.createFormField('Category', 'text', 'category', { placeholder: 'Optional: e.g., Electronics, Food' })}
        ${Components.createFormField('Selling Price', 'number', 'sellingPrice', { required: true, min: 0, step: 0.01, placeholder: '0.00' })}
        ${Components.createFormField('Variable Cost', 'number', 'variableCost', { required: true, min: 0, step: 0.01, placeholder: '0.00' })}
      </form>
    `;

        Components.showModal('Add New Product', formHtml, [
            {
                label: 'Add Product',
                class: 'btn-primary',
                onClick: 'ProductsPage.saveProduct()'
            }
        ]);
    },

    showEditModal(id) {
        const product = DataManager.getProductById(id);
        if (!product) return;

        const formHtml = `
      <form id="productForm">
        <input type="hidden" id="productId" value="${id}">
        ${Components.createFormField('SKU', 'text', 'sku', { required: true, value: product.sku })}
        ${Components.createFormField('Product Name', 'text', 'name', { required: true, value: product.name })}
        ${Components.createFormField('Category', 'text', 'category', { value: product.category || '' })}
        ${Components.createFormField('Selling Price', 'number', 'sellingPrice', { required: true, min: 0, step: 0.01, value: product.sellingPrice })}
        ${Components.createFormField('Variable Cost', 'number', 'variableCost', { required: true, min: 0, step: 0.01, value: product.variableCost })}
      </form>
    `;

        Components.showModal('Edit Product', formHtml, [
            {
                label: 'Save Changes',
                class: 'btn-primary',
                onClick: 'ProductsPage.saveProduct()'
            }
        ]);
    },

    saveProduct() {
        const form = document.getElementById('productForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const productId = document.getElementById('productId')?.value;
        const sku = document.getElementById('sku').value.trim();
        const name = document.getElementById('name').value.trim();
        const category = document.getElementById('category').value.trim();
        const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);
        const variableCost = parseFloat(document.getElementById('variableCost').value);

        // Warning for negative margin (allow but warn)
        if (sellingPrice <= variableCost) {
            if (!confirm('⚠️ Warning: Selling price is not greater than variable cost.\n\nThis will result in negative or zero profit margin.\n\nDo you want to continue?')) {
                return;
            }
        }

        const productData = { sku, name, category, sellingPrice, variableCost };

        let result;
        if (productId) {
            result = DataManager.updateProduct(productId, productData);
            if (result.success) {
                Components.showToast('Product updated successfully', 'success');
                Components.closeModal();
                App.navigate('products');
            } else {
                Components.showToast(result.errors.join(', '), 'error');
            }
        } else {
            result = DataManager.addProduct(productData);
            if (result.success) {
                Components.showToast('Product added successfully', 'success');
                Components.closeModal();
                App.navigate('products');
            } else {
                Components.showToast(result.errors.join(', '), 'error');
            }
        }
    },

    editProduct(id) {
        ProductsPage.showEditModal(id);
    },

    deleteProduct(id) {
        const product = DataManager.getProductById(id);
        if (!product) {
            Components.showToast('Product not found', 'error');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
            return;
        }

        const result = DataManager.deleteProduct(id);

        if (result.success) {
            Components.showToast('Product deleted successfully', 'success');
            App.navigate('products');
        } else if (result.requiresConfirmation) {
            // Product has associated sales
            const confirmMsg = `${result.errors[0]}\n\n⚠️ WARNING: This will permanently delete:\n• The product\n• ${result.salesCount} associated sales record(s)\n\nThis action cannot be undone!\n\nDo you want to proceed?`;

            if (confirm(confirmMsg)) {
                const forceResult = DataManager.forceDeleteProduct(id);
                if (forceResult.success) {
                    Components.showToast(`Product and ${result.salesCount} sales records deleted`, 'success');
                    App.navigate('products');
                } else {
                    Components.showToast('Error deleting product', 'error');
                }
            }
        } else {
            Components.showToast(result.errors.join(', '), 'error');
        }
    },

    /**
     * Export products to CSV
     */
    exportCSV() {
        const products = DataManager.getProducts();

        if (products.length === 0) {
            Components.showToast('No products to export', 'error');
            return;
        }

        const csvData = products.map(p => ({
            'SKU': p.sku,
            'Name': p.name,
            'Category': p.category || '',
            'Selling Price': p.sellingPrice,
            'Variable Cost': p.variableCost
        }));

        const csv = CSVHandler.arrayToCSV(csvData);
        const filename = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
        CSVHandler.downloadCSV(filename, csv);

        Components.showToast(`Exported ${products.length} products`, 'success');
    },

    /**
     * Show import modal
     */
    showImportModal() {
        const modalContent = `
      <div>
        <p style="margin-bottom: var(--space-4); color: var(--text-secondary);">
          Upload a CSV file with product data. The file should include columns for SKU, Name, Selling Price, and Variable Cost.
        </p>
        
        <div class="form-group">
          <label class="form-label">Select CSV File</label>
          <input type="file" id="csvFileInput" accept=".csv" class="form-input">
        </div>

        <div style="padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius-md); font-size: var(--text-sm);">
          <p style="font-weight: 600; margin-bottom: var(--space-2);">Expected CSV Format:</p>
          <code style="display: block; color: var(--text-secondary);">
            SKU,Name,Category,Selling Price,Variable Cost<br>
            PROD-001,Product Name,Electronics,100.00,60.00
          </code>
        </div>
      </div>
    `;

        Components.showModal('Import Products from CSV', modalContent, [
            {
                label: 'Next: Map Columns',
                class: 'btn-primary',
                onClick: 'ProductsPage.processCSVFile()'
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
                { key: 'sku', label: 'SKU', required: true, type: 'text' },
                { key: 'name', label: 'Product Name', required: true, type: 'text' },
                { key: 'category', label: 'Category', required: false, type: 'text' },
                { key: 'sellingPrice', label: 'Selling Price', required: true, type: 'number' },
                { key: 'variableCost', label: 'Variable Cost', required: true, type: 'number' }
            ];

            CSVHandler.showMappingModal(
                parsed.headers,
                parsed.rows[0],
                targetFields,
                (mapping) => {
                    ProductsPage.importProducts(parsed.rows, mapping, targetFields);
                }
            );
        });
    },

    /**
     * Import products with validation
     */
    importProducts(rows, mapping, targetFields) {
        const importFunction = (item) => {
            // Warning for negative margin but allow import
            const hasNegativeMargin = item.sellingPrice <= item.variableCost;

            // Check for duplicate SKU
            const existing = DataManager.getProducts().find(p => p.sku === item.sku);
            if (existing) {
                return { success: false, error: `Duplicate SKU: ${item.sku}` };
            }

            // Add product using new API
            const result = DataManager.addProduct({
                sku: item.sku,
                name: item.name,
                category: item.category || '',
                sellingPrice: item.sellingPrice,
                variableCost: item.variableCost
            });

            if (!result.success) {
                return { success: false, error: result.errors.join(', ') };
            }

            return {
                success: true,
                warning: hasNegativeMargin ? 'Negative margin' : null
            };
        };

        const results = CSVHandler.validateAndImport(rows, mapping, targetFields, importFunction);
        CSVHandler.showImportResults(results);

        if (results.successful.length > 0) {
            App.navigate('products');
        }
    }
};

