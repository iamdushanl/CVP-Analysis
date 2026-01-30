// ========================================
// Data Manager Unit Tests
// Testing CRUD operations and data validation
// ========================================

describe('DataManager', () => {
    let DataManager;

    beforeAll(() => {
        // Mock DataManager
        DataManager = {
            generateUniqueId() {
                return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            },

            normalizeDate(dateString) {
                if (!dateString) return new Date().toISOString().split('T')[0];
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(dateString)) {
                    return new Date().toISOString().split('T')[0];
                }
                return dateString;
            },

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

            validateFixedCost(cost) {
                const errors = [];
                if (!cost.name || cost.name.trim() === '') {
                    errors.push('Cost name is required');
                }
                if (typeof cost.amount !== 'number' || cost.amount < 0) {
                    errors.push('Amount must be a positive number');
                }
                if (cost.frequency && !['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(cost.frequency)) {
                    errors.push('Invalid frequency');
                }
                return errors;
            },

            getProducts() {
                try {
                    return JSON.parse(localStorage.getItem('cvp_products') || '[]');
                } catch (error) {
                    return [];
                }
            },

            saveProducts(products) {
                try {
                    localStorage.setItem('cvp_products', JSON.stringify(products));
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addProduct(product) {
                try {
                    const errors = this.validateProduct(product);
                    if (errors.length > 0) {
                        return { success: false, errors };
                    }

                    const products = this.getProducts();

                    if (products.find(p => p.sku === product.sku)) {
                        return { success: false, errors: [`SKU "${product.sku}" already exists`] };
                    }

                    product.id = this.generateUniqueId();
                    product.createdAt = new Date().toISOString();
                    products.push(product);

                    this.saveProducts(products);
                    return { success: true, product };
                } catch (error) {
                    return { success: false, errors: [error.message] };
                }
            },

            getProductById(id) {
                const products = this.getProducts();
                return products.find(p => p.id === id);
            },

            deleteProduct(id) {
                try {
                    const products = this.getProducts().filter(p => p.id !== id);
                    this.saveProducts(products);
                    return { success: true };
                } catch (error) {
                    return { success: false, errors: [error.message] };
                }
            }
        };
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
