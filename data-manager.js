// ========================================
// Data Manager - LocalStorage CRUD Operations
// Enhanced with validation, error handling, and data integrity
// ========================================

const DataManager = {
  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Generate unique ID using timestamp + random string
   * Prevents ID collision issues
   */
  generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Normalize date to UTC midnight to avoid timezone issues
   */
  normalizeDate(dateString) {
    if (!dateString) return new Date().toISOString().split('T')[0];

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      console.warn(`Invalid date format: ${dateString}, using today's date`);
      return new Date().toISOString().split('T')[0];
    }

    return dateString;
  },

  /**
   * Validate product data
   */
  validateProduct(product) {
    const errors = [];

    if (!product.sku || product.sku.trim() === '') {
      errors.push('SKU is required');
    }
    if (!product.name || product.name.trim() === '') {
      errors.push('Product name is required');
    }
    if (typeof product.sellingPrice !== 'number' || product.sellingPrice < 0) {
      errors.push('Selling price must be a positive number');
    }
    if (typeof product.variableCost !== 'number' || product.variableCost < 0) {
      errors.push('Variable cost must be a positive number');
    }

    return errors;
  },

  /**
   * Validate sale data
   */
  validateSale(sale) {
    const errors = [];

    if (!sale.productId) {
      errors.push('Product ID is required');
    }
    if (typeof sale.quantity !== 'number' || sale.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }
    if (typeof sale.unitPrice !== 'number' || sale.unitPrice < 0) {
      errors.push('Unit price must be a positive number');
    }

    return errors;
  },

  /**
   * Validate fixed cost data
   */
  validateFixedCost(cost) {
    const errors = [];

    if (!cost.name || cost.name.trim() === '') {
      errors.push('Cost name is required');
    }
    if (typeof cost.amount !== 'number' || cost.amount < 0) {
      errors.push('Amount must be a positive number');
    }
    if (cost.frequency && !['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(cost.frequency)) {
      errors.push('Invalid frequency. Must be: daily, weekly, monthly, quarterly, or yearly');
    }

    return errors;
  },

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Initialize data manager
   * Only loads sample data on first visit, never auto-reloads
   */
  init() {
    try {
      const hasInitialized = localStorage.getItem('cvp_initialized');
      const products = this.getProducts();

      // Only load sample data on first visit
      if (!hasInitialized && products.length === 0) {
        console.log('🚀 First time setup - loading sample data...');
        this.loadSampleData();
        localStorage.setItem('cvp_initialized', 'true');
        localStorage.setItem('cvp_version', '2.0');
        console.log('✅ Sample data loaded successfully');
      } else if (hasInitialized) {
        console.log('✅ Data Manager initialized - existing data found');
      }
    } catch (error) {
      console.error('❌ Error initializing Data Manager:', error);
    }
  },

  /**
   * Manually reset to sample data (with confirmation)
   */
  resetToSampleData() {
    this.clearAll();
    this.loadSampleData();
    localStorage.setItem('cvp_initialized', 'true');
    localStorage.setItem('cvp_version', '2.0');
    return { success: true, message: 'Data reset to sample data successfully' };
  },

  // ============================================
  // PRODUCTS
  // ============================================

  getProducts() {
    try {
      return JSON.parse(localStorage.getItem('cvp_products') || '[]');
    } catch (error) {
      console.error('Error reading products:', error);
      return [];
    }
  },

  saveProducts(products) {
    try {
      localStorage.setItem('cvp_products', JSON.stringify(products));

      // Trigger Cloud Sync
      if (typeof FirebaseService !== 'undefined' && FirebaseService.isInitialized) {
        FirebaseService.syncToCloud('products', products);
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving products:', error);
      return { success: false, error: error.message };
    }
  },

  addProduct(product) {
    try {
      // Validate product data
      const errors = this.validateProduct(product);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      const products = this.getProducts();

      // Check for duplicate SKU
      if (products.find(p => p.sku === product.sku)) {
        return { success: false, errors: [`SKU "${product.sku}" already exists`] };
      }

      product.id = this.generateUniqueId();
      product.createdAt = new Date().toISOString();
      products.push(product);

      this.saveProducts(products);
      return { success: true, product };
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, errors: [error.message] };
    }
  },

  updateProduct(id, updatedProduct) {
    try {
      const products = this.getProducts();
      const index = products.findIndex(p => p.id === id);

      if (index === -1) {
        return { success: false, errors: ['Product not found'] };
      }

      // Validate updated data
      const productToValidate = { ...products[index], ...updatedProduct };
      const errors = this.validateProduct(productToValidate);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      // Check for duplicate SKU (excluding current product)
      if (updatedProduct.sku) {
        const duplicate = products.find(p => p.sku === updatedProduct.sku && p.id !== id);
        if (duplicate) {
          return { success: false, errors: [`SKU "${updatedProduct.sku}" already exists`] };
        }
      }

      products[index] = {
        ...products[index],
        ...updatedProduct,
        updatedAt: new Date().toISOString()
      };

      this.saveProducts(products);
      return { success: true, product: products[index] };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, errors: [error.message] };
    }
  },

  deleteProduct(id) {
    try {
      // Check for associated sales (CASCADE CHECK)
      const sales = this.getSales();
      const associatedSales = sales.filter(s => s.productId === id);

      if (associatedSales.length > 0) {
        return {
          success: false,
          errors: [`Cannot delete product. It has ${associatedSales.length} associated sales records.`],
          salesCount: associatedSales.length,
          requiresConfirmation: true
        };
      }

      const products = this.getProducts().filter(p => p.id !== id);
      this.saveProducts(products);
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, errors: [error.message] };
    }
  },

  /**
   * Force delete product and cascade delete associated sales
   */
  forceDeleteProduct(id) {
    try {
      // Delete associated sales
      const sales = this.getSales().filter(s => s.productId !== id);
      this.saveSales(sales);

      // Delete product
      const products = this.getProducts().filter(p => p.id !== id);
      this.saveProducts(products);

      return { success: true };
    } catch (error) {
      console.error('Error force deleting product:', error);
      return { success: false, errors: [error.message] };
    }
  },

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  },

  // ============================================
  // SALES
  // ============================================

  getSales() {
    try {
      return JSON.parse(localStorage.getItem('cvp_sales') || '[]');
    } catch (error) {
      console.error('Error reading sales:', error);
      return [];
    }
  },

  saveSales(sales) {
    try {
      localStorage.setItem('cvp_sales', JSON.stringify(sales));

      // Trigger Cloud Sync
      if (typeof FirebaseService !== 'undefined' && FirebaseService.isInitialized) {
        FirebaseService.syncToCloud('sales', sales);
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving sales:', error);
      return { success: false, error: error.message };
    }
  },

  addSale(sale) {
    try {
      // Validate sale data
      const errors = this.validateSale(sale);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      const sales = this.getSales();
      sale.id = this.generateUniqueId();
      sale.date = this.normalizeDate(sale.date);
      sale.createdAt = new Date().toISOString();

      // Calculate contribution
      const product = this.getProductById(sale.productId);
      if (product) {
        const unitContribution = sale.unitPrice - product.variableCost;
        sale.contribution = unitContribution * sale.quantity;
        sale.totalAmount = sale.unitPrice * sale.quantity;
      } else {
        return { success: false, errors: ['Product not found'] };
      }

      sales.push(sale);
      this.saveSales(sales);
      return { success: true, sale };
    } catch (error) {
      console.error('Error adding sale:', error);
      return { success: false, errors: [error.message] };
    }
  },

  updateSale(id, updatedSale) {
    try {
      const sales = this.getSales();
      const index = sales.findIndex(s => s.id === id);

      if (index === -1) {
        return { success: false, errors: ['Sale not found'] };
      }

      // Recalculate if quantity or price changed
      if (updatedSale.quantity || updatedSale.unitPrice) {
        const sale = { ...sales[index], ...updatedSale };
        const product = this.getProductById(sale.productId);

        if (product) {
          const unitContribution = sale.unitPrice - product.variableCost;
          sale.contribution = unitContribution * sale.quantity;
          sale.totalAmount = sale.unitPrice * sale.quantity;
          updatedSale = sale;
        }
      }

      sales[index] = {
        ...sales[index],
        ...updatedSale,
        updatedAt: new Date().toISOString()
      };

      this.saveSales(sales);
      return { success: true, sale: sales[index] };
    } catch (error) {
      console.error('Error updating sale:', error);
      return { success: false, errors: [error.message] };
    }
  },

  deleteSale(id) {
    try {
      const sales = this.getSales().filter(s => s.id !== id);
      this.saveSales(sales);
      return { success: true };
    } catch (error) {
      console.error('Error deleting sale:', error);
      return { success: false, errors: [error.message] };
    }
  },

  // ============================================
  // FIXED COSTS
  // ============================================

  getFixedCosts() {
    try {
      return JSON.parse(localStorage.getItem('cvp_fixed_costs') || '[]');
    } catch (error) {
      console.error('Error reading fixed costs:', error);
      return [];
    }
  },

  saveFixedCosts(costs) {
    try {
      localStorage.setItem('cvp_fixed_costs', JSON.stringify(costs));

      // Trigger Cloud Sync
      if (typeof FirebaseService !== 'undefined' && FirebaseService.isInitialized) {
        FirebaseService.syncToCloud('fixed_costs', costs);
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving fixed costs:', error);
      return { success: false, error: error.message };
    }
  },

  addFixedCost(cost) {
    try {
      // Validate cost data
      const errors = this.validateFixedCost(cost);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      const costs = this.getFixedCosts();
      cost.id = this.generateUniqueId();
      cost.frequency = cost.frequency || 'monthly'; // Default to monthly
      cost.createdAt = new Date().toISOString();

      costs.push(cost);
      this.saveFixedCosts(costs);
      return { success: true, cost };
    } catch (error) {
      console.error('Error adding fixed cost:', error);
      return { success: false, errors: [error.message] };
    }
  },

  updateFixedCost(id, updatedCost) {
    try {
      const costs = this.getFixedCosts();
      const index = costs.findIndex(c => c.id === id);

      if (index === -1) {
        return { success: false, errors: ['Fixed cost not found'] };
      }

      // Validate updated data
      const costToValidate = { ...costs[index], ...updatedCost };
      const errors = this.validateFixedCost(costToValidate);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      costs[index] = {
        ...costs[index],
        ...updatedCost,
        updatedAt: new Date().toISOString()
      };

      this.saveFixedCosts(costs);
      return { success: true, cost: costs[index] };
    } catch (error) {
      console.error('Error updating fixed cost:', error);
      return { success: false, errors: [error.message] };
    }
  },

  deleteFixedCost(id) {
    try {
      const costs = this.getFixedCosts().filter(c => c.id !== id);
      this.saveFixedCosts(costs);
      return { success: true };
    } catch (error) {
      console.error('Error deleting fixed cost:', error);
      return { success: false, errors: [error.message] };
    }
  },

  /**
   * Get total fixed costs normalized to monthly
   * Supports multiple frequencies
   */
  getTotalFixedCosts() {
    try {
      const costs = this.getFixedCosts();
      return costs.reduce((total, cost) => {
        const frequency = cost.frequency || 'monthly';
        const amount = cost.amount || 0;

        // Convert all to monthly equivalent
        switch (frequency) {
          case 'daily':
            return total + (amount * 30); // Approximate month
          case 'weekly':
            return total + (amount * 4.33); // Average weeks per month
          case 'monthly':
            return total + amount;
          case 'quarterly':
            return total + (amount / 3);
          case 'yearly':
            return total + (amount / 12);
          default:
            return total + amount; // Default to monthly
        }
      }, 0);
    } catch (error) {
      console.error('Error calculating total fixed costs:', error);
      return 0;
    }
  },

  // ============================================
  // ANALYTICS HELPERS
  // ============================================

  getSalesToday() {
    const today = this.normalizeDate();
    return this.getSales().filter(s => s.date === today);
  },

  getSalesInRange(startDate, endDate) {
    const start = this.normalizeDate(startDate);
    const end = this.normalizeDate(endDate);
    return this.getSales().filter(s => s.date >= start && s.date <= end);
  },

  getSalesLast30Days() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const start = this.normalizeDate(startDate.toISOString().split('T')[0]);
    const end = this.normalizeDate(endDate.toISOString().split('T')[0]);

    return this.getSalesInRange(start, end);
  },

  getSalesLastNDays(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const start = this.normalizeDate(startDate.toISOString().split('T')[0]);
    const end = this.normalizeDate(endDate.toISOString().split('T')[0]);

    return this.getSalesInRange(start, end);
  },

  // ============================================
  // DATA EXPORT/IMPORT
  // ============================================

  /**
   * Export all data as JSON
   */
  exportAllData() {
    try {
      const data = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        products: this.getProducts(),
        sales: this.getSales(),
        fixedCosts: this.getFixedCosts(),
        settings: SettingsManager?.getSettings() || {}
      };
      return { success: true, data };
    } catch (error) {
      console.error('Error exporting data:', error);
      return { success: false, errors: [error.message] };
    }
  },

  /**
   * Import all data from JSON
   */
  importAllData(data) {
    try {
      if (!data || !data.version) {
        return { success: false, errors: ['Invalid data format'] };
      }

      // Validate data structure
      if (!Array.isArray(data.products) || !Array.isArray(data.sales) || !Array.isArray(data.fixedCosts)) {
        return { success: false, errors: ['Invalid data structure'] };
      }

      // Backup current data
      const backup = this.exportAllData();

      try {
        // Import data
        this.saveProducts(data.products);
        this.saveSales(data.sales);
        this.saveFixedCosts(data.fixedCosts);

        if (data.settings && typeof SettingsManager !== 'undefined') {
          SettingsManager.updateSettings(data.settings);
        }

        return { success: true, message: 'Data imported successfully' };
      } catch (importError) {
        // Restore backup on error
        this.saveProducts(backup.data.products);
        this.saveSales(backup.data.sales);
        this.saveFixedCosts(backup.data.fixedCosts);

        return { success: false, errors: ['Import failed, data restored from backup'] };
      }
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, errors: [error.message] };
    }
  },

  // ============================================
  // SAMPLE DATA
  // ============================================

  loadSampleData() {
    // Sample products - Sri Lankan Supermarket Context (50 products)
    const products = [
      // Beverages
      { id: this.generateUniqueId(), sku: 'BEV-001', name: 'Dilmah Premium Tea 400g', category: 'Beverages', sellingPrice: 850, variableCost: 650 },
      { id: this.generateUniqueId(), sku: 'BEV-002', name: 'Elephant House Ginger Beer 1.5L', category: 'Beverages', sellingPrice: 350, variableCost: 260 },
      { id: this.generateUniqueId(), sku: 'BEV-003', name: 'Milo 400g', category: 'Beverages', sellingPrice: 750, variableCost: 580 },
      { id: this.generateUniqueId(), sku: 'BEV-004', name: 'Nescafe Classic 200g', category: 'Beverages', sellingPrice: 1250, variableCost: 980 },
      { id: this.generateUniqueId(), sku: 'BEV-005', name: 'Coca-Cola 1.5L', category: 'Beverages', sellingPrice: 320, variableCost: 240 },

      // Food Items
      { id: this.generateUniqueId(), sku: 'FOD-001', name: 'Munchee Super Cream Cracker 490g', category: 'Food', sellingPrice: 420, variableCost: 340 },
      { id: this.generateUniqueId(), sku: 'FOD-002', name: 'Araliya Keeri Samba 5kg', category: 'Food', sellingPrice: 1650, variableCost: 1400 },
      { id: this.generateUniqueId(), sku: 'FOD-003', name: 'Prima Kottu Mee 80g', category: 'Food', sellingPrice: 100, variableCost: 75 },
      { id: this.generateUniqueId(), sku: 'FOD-004', name: 'Kist Mixed Fruit Jam 500g', category: 'Food', sellingPrice: 550, variableCost: 400 },
      { id: this.generateUniqueId(), sku: 'FOD-005', name: 'Samaposha 200g', category: 'Food', sellingPrice: 180, variableCost: 140 },
      { id: this.generateUniqueId(), sku: 'FOD-006', name: 'MD Dhal 500g', category: 'Food', sellingPrice: 320, variableCost: 250 },
      { id: this.generateUniqueId(), sku: 'FOD-007', name: 'Marina Soya Chunks 90g', category: 'Food', sellingPrice: 95, variableCost: 70 },
      { id: this.generateUniqueId(), sku: 'FOD-008', name: 'Raigam Noodles 400g', category: 'Food', sellingPrice: 280, variableCost: 210 },
      { id: this.generateUniqueId(), sku: 'FOD-009', name: 'Samba Rice 1kg', category: 'Food', sellingPrice: 380, variableCost: 320 },
      { id: this.generateUniqueId(), sku: 'FOD-010', name: 'Red Lentils 500g', category: 'Food', sellingPrice: 290, variableCost: 230 },

      // Dairy Products
      { id: this.generateUniqueId(), sku: 'DAI-001', name: 'Highland Full Cream Milk Powder 400g', category: 'Dairy', sellingPrice: 980, variableCost: 850 },
      { id: this.generateUniqueId(), sku: 'DAI-002', name: 'Kotmale Cheese Wedges', category: 'Dairy', sellingPrice: 620, variableCost: 480 },
      { id: this.generateUniqueId(), sku: 'DAI-003', name: 'Ambewela Yogurt 80g', category: 'Dairy', sellingPrice: 70, variableCost: 50 },
      { id: this.generateUniqueId(), sku: 'DAI-004', name: 'Anchor Butter 227g', category: 'Dairy', sellingPrice: 1250, variableCost: 1050 },
      { id: this.generateUniqueId(), sku: 'DAI-005', name: 'Nestle Fresh Milk 1L', category: 'Dairy', sellingPrice: 380, variableCost: 310 },

      // Household Items
      { id: this.generateUniqueId(), sku: 'HOU-001', name: 'Sunlight Soap Bar 110g', category: 'Household', sellingPrice: 110, variableCost: 80 },
      { id: this.generateUniqueId(), sku: 'HOU-002', name: 'Vim Dishwash Liquid 500ml', category: 'Household', sellingPrice: 380, variableCost: 290 },
      { id: this.generateUniqueId(), sku: 'HOU-003', name: 'Harpic Toilet Cleaner 500ml', category: 'Household', sellingPrice: 420, variableCost: 320 },
      { id: this.generateUniqueId(), sku: 'HOU-004', name: 'Dettol Handwash 200ml', category: 'Household', sellingPrice: 350, variableCost: 270 },
      { id: this.generateUniqueId(), sku: 'HOU-005', name: 'Surf Excel 1kg', category: 'Household', sellingPrice: 790, variableCost: 620 },

      // Personal Care
      { id: this.generateUniqueId(), sku: 'PER-001', name: 'Fair & Lovely Cream 50g', category: 'Personal Care', sellingPrice: 450, variableCost: 340 },
      { id: this.generateUniqueId(), sku: 'PER-002', name: 'Head & Shoulders 180ml', category: 'Personal Care', sellingPrice: 680, variableCost: 520 },
      { id: this.generateUniqueId(), sku: 'PER-003', name: 'Colgate Toothpaste 100g', category: 'Personal Care', sellingPrice: 280, variableCost: 210 },
      { id: this.generateUniqueId(), sku: 'PER-004', name: 'Lux Soap Bar 100g', category: 'Personal Care', sellingPrice: 120, variableCost: 90 },
      { id: this.generateUniqueId(), sku: 'PER-005', name: 'Lifebuoy Handwash 500ml', category: 'Personal Care', sellingPrice: 420, variableCost: 320 },

      // Snacks
      { id: this.generateUniqueId(), sku: 'SNK-001', name: 'Tipi Tip Chips 50g', category: 'Snacks', sellingPrice: 90, variableCost: 65 },
      { id: this.generateUniqueId(), sku: 'SNK-002', name: 'Lays Chips 52g', category: 'Snacks', sellingPrice: 150, variableCost: 110 },
      { id: this.generateUniqueId(), sku: 'SNK-003', name: 'Munchee Chocolate Puff 200g', category: 'Snacks', sellingPrice: 280, variableCost: 210 },
      { id: this.generateUniqueId(), sku: 'SNK-004', name: 'Ritzbury Chocolate 65g', category: 'Snacks', sellingPrice: 220, variableCost: 165 },
      { id: this.generateUniqueId(), sku: 'SNK-005', name: 'Uswatte Mixture 100g', category: 'Snacks', sellingPrice: 180, variableCost: 135 },

      // Frozen Items
      { id: this.generateUniqueId(), sku: 'FRZ-001', name: 'Crysbro Chicken 1kg', category: 'Frozen', sellingPrice: 1200, variableCost: 980 },
      { id: this.generateUniqueId(), sku: 'FRZ-002', name: 'Goldi French Fries 500g', category: 'Frozen', sellingPrice: 450, variableCost: 350 },
      { id: this.generateUniqueId(), sku: 'FRZ-003', name: 'Fish Fingers 400g', category: 'Frozen', sellingPrice: 520, variableCost: 400 },

      // Bakery
      { id: this.generateUniqueId(), sku: 'BAK-001', name: 'Edna Bread Loaf', category: 'Bakery', sellingPrice: 150, variableCost: 110 },
      { id: this.generateUniqueId(), sku: 'BAK-002', name: 'Munchee Marie Biscuit 500g', category: 'Bakery', sellingPrice: 320, variableCost: 240 },
      { id: this.generateUniqueId(), sku: 'BAK-003', name: 'Maliban Gold Marie 400g', category: 'Bakery', sellingPrice: 290, variableCost: 220 },

      // Condiments
      { id: this.generateUniqueId(), sku: 'CON-001', name: 'Ruhunu Chili Powder 100g', category: 'Condiments', sellingPrice: 180, variableCost: 140 },
      { id: this.generateUniqueId(), sku: 'CON-002', name: 'MD Curry Powder 100g', category: 'Condiments', sellingPrice: 160, variableCost: 125 },
      { id: this.generateUniqueId(), sku: 'CON-003', name: 'Maggi Seasonings 200ml', category: 'Condiments', sellingPrice: 280, variableCost: 210 },
      { id: this.generateUniqueId(), sku: 'CON-004', name: 'Soya Sauce 500ml', category: 'Condiments', sellingPrice: 350, variableCost: 270 },

      // Baby Products
      { id: this.generateUniqueId(), sku: 'BAB-001', name: 'Baby Cheramy Soap 100g', category: 'Baby', sellingPrice: 180, variableCost: 140 },
      { id: this.generateUniqueId(), sku: 'BAB-002', name: 'Lactogen 1 400g', category: 'Baby', sellingPrice: 1450, variableCost: 1220 },
      { id: this.generateUniqueId(), sku: 'BAB-003', name: 'Cerelac Wheat 350g', category: 'Baby', sellingPrice: 680, variableCost: 540 },
      { id: this.generateUniqueId(), sku: 'BAB-004', name: 'Johnson Baby Powder 200g', category: 'Baby', sellingPrice: 550, variableCost: 420 },
      { id: this.generateUniqueId(), sku: 'BAB-005', name: 'Huggies Diapers 10pcs', category: 'Baby', sellingPrice: 580, variableCost: 450 }
    ];
    this.saveProducts(products);

    // Sample sales (last 90 days for better forecasting)
    const sales = [];
    const today = new Date();

    // Generate large volume sales data
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Random sales for each day - HIGH VOLUME
      // 20-50 transactions per day
      const numSales = Math.floor(Math.random() * 31) + 20;

      for (let j = 0; j < numSales; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        // 1-10 units per transaction
        const quantity = Math.floor(Math.random() * 10) + 1;
        const unitContribution = product.sellingPrice - product.variableCost;

        sales.push({
          id: this.generateUniqueId(),
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          unitPrice: product.sellingPrice,
          totalAmount: product.sellingPrice * quantity,
          contribution: unitContribution * quantity,
          date: dateStr
        });
      }
    }
    this.saveSales(sales);

    // Sample fixed costs - Sri Lankan Supermarket Branch Context
    const fixedCosts = [
      { id: this.generateUniqueId(), name: 'Shop Rent', amount: 250000, frequency: 'monthly' },
      { id: this.generateUniqueId(), name: 'Staff Salaries (4 Employees)', amount: 180000, frequency: 'monthly' },
      { id: this.generateUniqueId(), name: 'Electricity Bill', amount: 65000, frequency: 'monthly' },
      { id: this.generateUniqueId(), name: 'Water Bill', amount: 5000, frequency: 'monthly' },
      { id: this.generateUniqueId(), name: 'Marketing & Promotions', amount: 25000, frequency: 'monthly' },
      { id: this.generateUniqueId(), name: 'Maintenance', amount: 15000, frequency: 'monthly' },
      { id: this.generateUniqueId(), name: 'Insurance', amount: 120000, frequency: 'yearly' },
      { id: this.generateUniqueId(), name: 'License Renewal', amount: 50000, frequency: 'yearly' }
    ];
    this.saveFixedCosts(fixedCosts);
  },

  // Clear all data
  clearAll() {
    localStorage.removeItem('cvp_products');
    localStorage.removeItem('cvp_sales');
    localStorage.removeItem('cvp_fixed_costs');
    localStorage.removeItem('cvp_initialized');
  }
};

// Initialize on load
DataManager.init();
