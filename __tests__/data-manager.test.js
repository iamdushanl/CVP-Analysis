// ========================================
// Data Manager Unit Tests
// Testing CRUD operations and data validation
// ========================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadScript(filename) {
    const filePath = path.resolve(__dirname, '../' + filename);
    let code = fs.readFileSync(filePath, 'utf8');
    // Expose DataManager to global scope
    if (filename === 'data-manager.js') {
        code += '\nglobal.DataManager = DataManager;';
    }
    vm.runInThisContext(code);
}

describe('DataManager', () => {

    beforeAll(() => {
        // Load the real DataManager
        // Ensure dependecies (SettingsManager/FirebaseService) are handled or ignored
        // DataManager uses FirebaseService if defined. We can leave it undefined or mock it.
        global.FirebaseService = {
            isInitialized: false,
            subscribeToCollection: jest.fn(),
            syncToCloud: jest.fn()
        };

        global.SettingsManager = {
            formatCurrency: (val) => val
        };

        loadScript('data-manager.js');
    });

    beforeEach(() => {
        localStorage.clear();
    });

    describe('generateUniqueId', () => {
        test('should generate unique IDs', () => {
            const id1 = DataManager.generateUniqueId();
            const id2 = DataManager.generateUniqueId();

            expect(id1).toBeTruthy();
            expect(id2).toBeTruthy();
            expect(id1).not.toBe(id2);
        });

        test('should generate IDs with correct format', () => {
            const id = DataManager.generateUniqueId();
            expect(id).toContain('test-');
            expect(id.split('-').length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('normalizeDate', () => {
        test('should normalize valid date strings', () => {
            expect(DataManager.normalizeDate('2024-01-15')).toBe('2024-01-15');
            expect(DataManager.normalizeDate('2023-12-31')).toBe('2023-12-31');
        });

        test('should return today for invalid dates', () => {
            const today = new Date().toISOString().split('T')[0];
            expect(DataManager.normalizeDate('invalid')).toBe(today);
            expect(DataManager.normalizeDate('2024-13-01')).toBe(today); // Invalid month
        });

        test('should return today when no date provided', () => {
            const today = new Date().toISOString().split('T')[0];
            expect(DataManager.normalizeDate()).toBe(today);
            expect(DataManager.normalizeDate(null)).toBe(today);
        });
    });

    describe('validateProduct', () => {
        test('should validate correct product', () => {
            const product = {
                sku: 'TEST-001',
                name: 'Test Product',
                sellingPrice: 100,
                variableCost: 60
            };

            const errors = DataManager.validateProduct(product);
            expect(errors).toHaveLength(0);
        });

        test('should catch missing SKU', () => {
            const product = {
                name: 'Test Product',
                sellingPrice: 100,
                variableCost: 60
            };

            const errors = DataManager.validateProduct(product);
            expect(errors).toContain('SKU is required');
        });

        test('should catch missing name', () => {
            const product = {
                sku: 'TEST-001',
                sellingPrice: 100,
                variableCost: 60
            };

            const errors = DataManager.validateProduct(product);
            expect(errors).toContain('Product name is required');
        });

        test('should catch invalid selling price', () => {
            const product = {
                sku: 'TEST-001',
                name: 'Test Product',
                sellingPrice: -10,
                variableCost: 60
            };

            const errors = DataManager.validateProduct(product);
            expect(errors).toContain('Selling price must be a positive number');
        });

        test('should catch multiple errors', () => {
            const product = {
                sellingPrice: 'invalid',
                variableCost: -10
            };

            const errors = DataManager.validateProduct(product);
            expect(errors.length).toBeGreaterThan(2);
        });
    });

    describe('Product CRUD Operations', () => {
        test('should add product successfully', () => {
            const product = {
                sku: 'TEST-001',
                name: 'Test Product',
                category: 'Test',
                sellingPrice: 100,
                variableCost: 60
            };

            const result = DataManager.addProduct(product);

            expect(result.success).toBe(true);
            expect(result.product).toBeDefined();
            expect(result.product.id).toBeDefined();
            expect(result.product.createdAt).toBeDefined();
        });

        test('should prevent duplicate SKU', () => {
            const product1 = {
                sku: 'TEST-001',
                name: 'Product 1',
                sellingPrice: 100,
                variableCost: 60
            };

            const product2 = {
                sku: 'TEST-001',
                name: 'Product 2',
                sellingPrice: 150,
                variableCost: 80
            };

            DataManager.addProduct(product1);
            const result = DataManager.addProduct(product2);

            expect(result.success).toBe(false);
            expect(result.errors).toContain('SKU "TEST-001" already exists');
        });

        test('should retrieve products', () => {
            const product = {
                sku: 'TEST-001',
                name: 'Test Product',
                sellingPrice: 100,
                variableCost: 60
            };

            DataManager.addProduct(product);
            const products = DataManager.getProducts();

            expect(products).toHaveLength(1);
            expect(products[0].sku).toBe('TEST-001');
        });

        test('should get product by ID', () => {
            const product = {
                sku: 'TEST-001',
                name: 'Test Product',
                sellingPrice: 100,
                variableCost: 60
            };

            const addResult = DataManager.addProduct(product);
            const retrieved = DataManager.getProductById(addResult.product.id);

            expect(retrieved).toBeDefined();
            expect(retrieved.sku).toBe('TEST-001');
        });

        test('should delete product', () => {
            const product = {
                sku: 'TEST-001',
                name: 'Test Product',
                sellingPrice: 100,
                variableCost: 60
            };

            const addResult = DataManager.addProduct(product);
            const deleteResult = DataManager.deleteProduct(addResult.product.id);

            expect(deleteResult.success).toBe(true);

            const products = DataManager.getProducts();
            expect(products).toHaveLength(0);
        });
    });

    describe('validateSale', () => {
        test('should validate correct sale', () => {
            const sale = {
                productId: 'test-id',
                quantity: 5,
                unitPrice: 100
            };

            const errors = DataManager.validateSale(sale);
            expect(errors).toHaveLength(0);
        });

        test('should catch missing product ID', () => {
            const sale = {
                quantity: 5,
                unitPrice: 100
            };

            const errors = DataManager.validateSale(sale);
            expect(errors).toContain('Product ID is required');
        });

        test('should catch invalid quantity', () => {
            const sale = {
                productId: 'test-id',
                quantity: 0,
                unitPrice: 100
            };

            const errors = DataManager.validateSale(sale);
            expect(errors).toContain('Quantity must be greater than 0');
        });
    });

    describe('validateFixedCost', () => {
        test('should validate correct fixed cost', () => {
            const cost = {
                name: 'Rent',
                amount: 50000,
                frequency: 'monthly'
            };

            const errors = DataManager.validateFixedCost(cost);
            expect(errors).toHaveLength(0);
        });

        test('should catch invalid frequency', () => {
            const cost = {
                name: 'Rent',
                amount: 50000,
                frequency: 'invalid'
            };

            const errors = DataManager.validateFixedCost(cost);
            expect(errors).toContain('Invalid frequency');
        });
    });
});
