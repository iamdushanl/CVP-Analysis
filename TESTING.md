# CVP Intelligence - Unit Testing Suite

## 🧪 Test Coverage

This testing suite provides comprehensive coverage for the CVP Intelligence system's core components.

## 📦 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This will install:
- **Jest** (v29.7.0) - Testing framework
- **@testing-library/jest-dom** - DOM matchers
- **jest-environment-jsdom** - Browser environment simulation

### 2. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with detailed output
npm run test:verbose
```

## 📊 Test Files

### `__tests__/cvp-calculator.test.js`
**Coverage**: CVP Calculator functions
- ✅ Contribution Margin calculations
- ✅ PV Ratio calculations  
- ✅ Break-Even calculations (units & value)
- ✅ Margin of Safety calculations
- ✅ Target Profit calculations
- ✅ Complete CVP Analysis integration
- ✅ Edge cases (zero division, negative values, decimals)

**Total Tests**: 25+

### `__tests__/data-manager.test.js`
**Coverage**: Data Manager CRUD operations
- ✅ Product validation
- ✅ Product CRUD (Create, Read, Update, Delete)
- ✅ Sale validation
- ✅ Fixed Cost validation
- ✅ Unique ID generation
- ✅ Date normalization
- ✅ Duplicate prevention
- ✅ localStorage integration

**Total Tests**: 20+

### `__tests__/chatbot-service.test.js` 
**Coverage**: Chatbot AI functions
- ✅ Function execution routing
- ✅ Product data retrieval
- ✅ Break-even calculations
- ✅ Sales analytics
- ✅ Error handling
- ✅ Data validation

**Total Tests**: 15+

## 🎯 What's Tested

### Critical Business Logic ✅
- All CVP calculation formulas
- Financial computations with precision
- Edge cases and boundary conditions

### Data Validation ✅
- Input validation for products, sales, costs
- Required field checks
- Type checking (numbers, strings)
- Range validation (positive values)
- Duplicate prevention

### Error Handling ✅
- Division by zero protection
- Invalid data handling
- Missing data scenarios
- localStorage failures

### Integration Points ✅
- Complete CVP analysis workflows
- Data flow between components
- State management via localStorage

## 📈 Coverage Goals

| Component | Target | Status |
|-----------|--------|--------|
| CVPCalculator | 95%+ | ✅ Achieved |
| DataManager | 90%+ | ✅ Achieved |
| ChatbotService | 85%+ | ✅ In Progress |
| Overall | 85%+ | 🎯 Target |

## 🔍 Test Structure

Each test file follows this pattern:

```javascript
describe('ComponentName', () => {
    describe('functionName', () => {
        test('should handle normal case', () => {
            // Arrange
            const input = ...;
            
            // Act
            const result = function(input);
            
            // Assert
            expect(with (result).toBe(expected);
        });

        test('should handle edge cases', () => {
            // Test zero, negative, null, undefined, etc.
        });
    });
});
```

## 🚀 Running Specific Tests

```bash
# Run only CVP Calculator tests
npm test cvp-calculator

# Run only Data Manager tests
npm test data-manager

# Run tests matching a pattern
npm test -- --testNamePattern="validation"

# Update test snapshots
npm test -- -u
```

## 📝 Writing New Tests

1. Create test file in `__tests__/` folder
2. Name it `component-name.test.js`
3. Import component to test
4. Write describe blocks for each function
5. Add test cases for:
   - Normal/happy path
   - Edge cases
   - Error scenarios
   - Boundary conditions

## 🐛 Debugging Tests

```bash
# Run single test file in debug mode
node --inspect-brk node_modules/.bin/jest __tests__/cvp-calculator.test.js

# Run with verbose logging
npm test -- --verbose

# See which tests are running
npm test -- --listTests
```

## ✅ Test Quality Checklist

- [ ] Tests are independent (no shared state)
- [ ] Tests have clear descriptions
- [ ] Edge cases are covered
- [ ] Error scenarios are tested
- [ ] Mock data is realistic
- [ ] Assertions are specific
- [ ] Tests run fast (< 1s each)

## 🎓 Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **One Assertion Per Test**: Focus on single behavior
3. **Clear Test Names**: Describe what's being tested
4. **Test Behaviors, Not Implementation**: Focus on outcomes
5. **Use Realistic Data**: Match production scenarios
6. **Keep Tests Fast**: Mock external dependencies
7. **Clean Up**: Reset state between tests

## 📦 Continuous Integration

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run Tests
  run: npm test -- --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## 🔧 Troubleshooting

**Tests not running?**
- Check Node.js version (requires 14+)
- Run `npm install` again
- Clear Jest cache: `npx jest --clearCache`

**Tests failing?**
- Check test output for specific errors
- Ensure localStorage mock is working
- Verify test data matches expected format

**Coverage not generating?**
- Run `npm run test:coverage`
- Check `coverage/` folder for HTML report
- Open `coverage/lcov-report/index.html` in browser

---

**Happy Testing! 🎉**

Write tests, catch bugs early, ship with confidence!
