/**
 * COMPREHENSIVE DATA ACCESS AUDIT
 * Senior SSE Review - All Available Data Sources
 * 
 * ============================================
 * AVAILABLE DATA SOURCES IN SYSTEM:
 * ============================================
 * 
 * 1. PRODUCTS (DataManager.getProducts())
 *    - id, sku, name, category
 *    - sellingPrice, variableCost
 *    - createdAt, updatedAt
 * 
 * 2. SALES (DataManager.getSales())
 *    - id, productId, productName
 *    - quantity, unitPrice, totalAmount
 *    - contribution, date
 *    - createdAt
 * 
 * 3. FIXED COSTS (DataManager.getFixedCosts())
 *    - id, name, amount, frequency
 *    - createdAt, updatedAt
 * 
 * 4. SETTINGS (SettingsManager - if available)
 *    - currency, dateFormat, dark_mode
 *    - geminiApiKey (sensitive)
 * 
 * 5. CALCULATED METRICS (from data):
 *    - Total Fixed Costs (monthly normalized)
 *    - Sales by product
 *    - Revenue per product
 *    - Contribution margin per product
 *    - Total contribution
 *    - Break-even points
 *    - Margin of safety
 *    - P/V ratio
 *    - Profitability rankings
 * 
 * 6. TIME-BASED DATA (DataManager methods):
 *    - getSalesToday()
 *    - getSalesLast30Days()
 *    - getSalesLastNDays(n)
 *    - getSalesInRange(start, end)
 * 
 * 7. AGGREGATED DATA:
 *    - Sales by category
 *    - Sales by date
 *    - Product performance metrics
 *    - Top/bottom performers
 * 
 * ============================================
 * DATA TO PROVIDE TO CHATBOT:
 * ============================================
 * 
 * CORE DATA:
 * ✅ All products with prices, costs, margins
 * ✅ Actual sales volume per product
 * ✅ Revenue and total contribution per product
 * ✅ Fixed costs (total monthly)
 * ✅ Break-even points per product
 * 
 * ANALYTICS:
 * ✅ Product rankings by profitability
 * ✅ Category-wise aggregations
 * ✅ Time-based sales metrics (last 30 days)
 * ✅ Margin of safety calculations
 * ✅ P/V ratios
 * 
 * CONTEXT:
 * ✅ Total number of products
 * ✅ Total sales transactions
 * ✅ Currency setting
 * ✅ Date ranges
 * 
 * EXCLUSIONS (security/privacy):
 * ❌ API keys
 * ❌ User credentials
 * ❌ Internal IDs (use names instead)
 */

/**
 * ENHANCED BUILDCONTEXT() REQUIREMENTS:
 * 
 * 1. Product Data:
 *    - Name, category, SKU
 *    - Price, variable cost, contribution margin, P/V ratio
 *    - Units sold (from sales), revenue, total contribution
 *    - Break-even point
 *    - Rank by profitability
 * 
 * 2. Category Aggregations:
 *    - Total sales per category
 *    - Total contribution per category
 *    - Average P/V ratio per category
 * 
 * 3. Business Metrics:
 *    - Total fixed costs
 *    - Total revenue (all products)
 *    - Total contribution (all products)
 *    - Overall break-even
 *    - Margin of safety
 *    - Total products, total sales transactions
 * 
 * 4. Time-based Metrics:
 *    - Last 30 days sales
 *    - Recent trends
 * 
 * 5. Top Performers:
 *    - Top 10 by contribution
 *    - Top 10 by units sold
 *    - Top 10 by revenue
 * 
 * 6. Settings:
 *    - Currency
 *    - Date format
 */
