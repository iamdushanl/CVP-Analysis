// ========================================
// CSV Import/Export Handler
// ========================================

const CSVHandler = {
    /**
     * Parse CSV file
     */
    parseCSV(fileContent) {
        const lines = fileContent.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            return { headers: [], rows: [] };
        }

        const headers = this.parseCSVLine(lines[0]);
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length > 0) {
                rows.push(values);
            }
        }

        return { headers, rows };
    },

    /**
     * Parse a single CSV line handling quoted values
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    },

    /**
     * Convert array of objects to CSV
     */
    arrayToCSV(data, headers) {
        if (!data || data.length === 0) {
            return '';
        }

        const csvHeaders = headers || Object.keys(data[0]);
        const csvRows = [csvHeaders.join(',')];

        data.forEach(item => {
            const row = csvHeaders.map(header => {
                let value = item[header] ?? '';

                // Handle values that need quoting
                if (String(value).includes(',') || String(value).includes('"') || String(value).includes('\n')) {
                    value = `"${String(value).replace(/"/g, '""')}"`;
                }

                return value;
            });

            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    },

    /**
     * Download CSV file
     */
    downloadCSV(filename, csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    },

    /**
     * Show column mapping modal
     */
    showMappingModal(headers, sampleRow, targetFields, onComplete) {
        const modalContent = `
      <div style="max-height: 60vh; overflow-y: auto;">
        <p style="margin-bottom: var(--space-4); color: var(--text-secondary);">
          Map CSV columns to product fields. We've auto-detected some mappings based on column names.
        </p>
        
        <div class="table-container" style="margin-bottom: var(--space-4);">
          <table>
            <thead>
              <tr>
                <th>Target Field</th>
                <th>CSV Column</th>
                <th>Sample Value</th>
              </tr>
            </thead>
            <tbody>
              ${targetFields.map((field, index) => {
            const autoDetected = this.autoDetectColumn(field.key, headers);
            const sampleValue = autoDetected !== null ? sampleRow[autoDetected] : '';

            return `
                  <tr>
                    <td>
                      <strong>${field.label}</strong>
                      ${field.required ? '<span style="color: var(--danger-500);">*</span>' : ''}
                    </td>
                    <td>
                      <select class="form-select" id="map_${field.key}" style="width: 100%;">
                        <option value="">-- Select Column --</option>
                        ${headers.map((header, headerIndex) => `
                          <option value="${headerIndex}" ${headerIndex === autoDetected ? 'selected' : ''}>
                            ${header}
                          </option>
                        `).join('')}
                      </select>
                    </td>
                    <td style="color: var(--text-muted); font-size: var(--text-sm);">
                      ${sampleValue || '-'}
                    </td>
                  </tr>
                `;
        }).join('')}
            </tbody>
          </table>
        </div>

        <div style="padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius-md); border-left: 4px solid var(--primary-500);">
          <p style="margin: 0; font-size: var(--text-sm); color: var(--text-secondary);">
            <strong>Note:</strong> Fields marked with * are required. Rows with missing required fields will be skipped during import.
          </p>
        </div>
      </div>
    `;

        Components.showModal('Map CSV Columns', modalContent, [
            {
                label: 'Import',
                class: 'btn-primary',
                onClick: () => {
                    const mapping = {};
                    targetFields.forEach(field => {
                        const select = document.getElementById(`map_${field.key}`);
                        if (select && select.value !== '') {
                            mapping[field.key] = parseInt(select.value);
                        }
                    });

                    Components.closeModal();
                    onComplete(mapping);
                }
            }
        ]);
    },

    /**
     * Auto-detect column mapping
     */
    autoDetectColumn(targetKey, headers) {
        const patterns = {
            sku: ['sku', 'code', 'product code', 'item code'],
            name: ['name', 'product name', 'product', 'item name', 'item'],
            category: ['category', 'group', 'type'],
            sellingPrice: ['selling price', 'price', 'unit price', 'sale price', 'selling_price'],
            variableCost: ['variable cost', 'cost', 'unit cost', 'vc', 'variable_cost'],
            quantity: ['quantity', 'qty', 'amount'],
            date: ['date', 'transaction date', 'sale date'],
            productId: ['product id', 'product_id', 'sku'],
            productName: ['product name', 'product', 'name']
        };

        const targetPatterns = patterns[targetKey] || [];

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i].toLowerCase().trim();
            if (targetPatterns.some(pattern => header === pattern || header.includes(pattern))) {
                return i;
            }
        }

        return null;
    },

    /**
     * Validate and import rows
     */
    validateAndImport(rows, mapping, targetFields, importFunction) {
        const results = {
            successful: [],
            errors: []
        };

        rows.forEach((row, rowIndex) => {
            try {
                const item = {};
                let hasAllRequired = true;

                // Map columns to fields
                targetFields.forEach(field => {
                    const columnIndex = mapping[field.key];

                    if (columnIndex !== undefined) {
                        let value = row[columnIndex];

                        // Type conversion
                        if (field.type === 'number') {
                            value = parseFloat(value);
                            if (isNaN(value)) {
                                if (field.required) {
                                    throw new Error(`Invalid number for ${field.label}`);
                                }
                                value = null;
                            }
                        }

                        item[field.key] = value;
                    } else if (field.required) {
                        hasAllRequired = false;
                    }
                });

                if (!hasAllRequired) {
                    results.errors.push({
                        row: rowIndex + 2, // +2 for header row and 0-index
                        message: 'Missing required fields'
                    });
                    return;
                }

                // Validate required fields
                const missingFields = targetFields
                    .filter(f => f.required && !item[f.key])
                    .map(f => f.label);

                if (missingFields.length > 0) {
                    results.errors.push({
                        row: rowIndex + 2,
                        message: `Missing required fields: ${missingFields.join(', ')}`
                    });
                    return;
                }

                // Call import function
                const result = importFunction(item);
                if (result.success) {
                    results.successful.push(item);
                } else {
                    results.errors.push({
                        row: rowIndex + 2,
                        message: result.error || 'Import failed'
                    });
                }
            } catch (error) {
                results.errors.push({
                    row: rowIndex + 2,
                    message: error.message
                });
            }
        });

        return results;
    },

    /**
     * Show import results
     */
    showImportResults(results) {
        const successCount = results.successful.length;
        const errorCount = results.errors.length;
        const totalCount = successCount + errorCount;

        const content = `
      <div>
        <div style="margin-bottom: var(--space-4);">
          <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-4);">
            <div style="flex: 1; padding: var(--space-4); background: var(--success-500); color: white; border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: var(--text-3xl); font-weight: 700;">${successCount}</div>
              <div style="font-size: var(--text-sm);">Imported</div>
            </div>
            ${errorCount > 0 ? `
              <div style="flex: 1; padding: var(--space-4); background: var(--danger-500); color: white; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: var(--text-3xl); font-weight: 700;">${errorCount}</div>
                <div style="font-size: var(--text-sm);">Errors</div>
              </div>
            ` : ''}
          </div>
        </div>

        ${errorCount > 0 ? `
          <div style="max-height: 300px; overflow-y: auto;">
            <h4 style="margin-bottom: var(--space-3); color: var(--danger-600);">Import Errors:</h4>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  ${results.errors.map(error => `
                    <tr>
                      <td>${error.row}</td>
                      <td style="color: var(--danger-600);">${error.message}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      </div>
    `;

        Components.showModal('Import Results', content, [
            {
                label: 'Close',
                class: 'btn-primary',
                onClick: 'Components.closeModal()'
            }
        ]);

        // Show toast notification
        if (successCount > 0) {
            Components.showToast(`Successfully imported ${successCount} ${successCount === 1 ? 'item' : 'items'}`, 'success');
        }
    },

    /**
     * Handle file upload
     */
    handleFileUpload(fileInputId, onParsed) {
        const fileInput = document.getElementById(fileInputId);
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            Components.showToast('Please select a CSV file', 'error');
            return;
        }

        const file = fileInput.files[0];
        if (!file.name.endsWith('.csv')) {
            Components.showToast('Please select a valid CSV file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const parsed = this.parseCSV(content);
            onParsed(parsed);
        };
        reader.readAsText(file);
    }
};

/**
 * API Contracts for Backend Integration
 * 
 * POST /api/products/import
 * Headers: { Authorization: "Bearer <token>", Content-Type: "multipart/form-data" }
 * Body: FormData with file
 * Response: { imported: number, errors: [{ row: number, message: string }] }
 * 
 * POST /api/sales/import
 * Headers: { Authorization: "Bearer <token>", Content-Type: "multipart/form-data" }
 * Body: FormData with file
 * Response: { imported: number, errors: [{ row: number, message: string }] }
 */
