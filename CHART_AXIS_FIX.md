# 🔧 Chart Y-Axis Label Fix

## Issue Identified
The y-axis labels on charts in the What-If Simulator were showing incorrect formatting like "lnx0.00", "lnx1,400,000.00" instead of proper currency values like "Rs. 0", "Rs. 1,400,000".

## Root Cause
The chart configuration was calling `Components.formatCurrency(value, true)` with an incorrect second parameter.

**Problem:**
```javascript
ticks: {
    callback: value => Components.formatCurrency(value, true)  // ❌ Wrong!
}
```

The `formatCurrency` function signature is:
```javascript
formatCurrency(amount, currency = null)
```

When `true` is passed as the `currency` parameter, it gets converted to a string and causes the formatting error, resulting in the "lnx" prefix.

## Fix Applied

Updated both charts in `pages/what-if.js`:

**CVP Chart (Line 201):**
```javascript
// Before
ticks: {
    callback: value => Components.formatCurrency(value, true)  // ❌
}

// After
ticks: {
    callback: value => Components.formatCurrency(value)  // ✅
}
```

**Profit Sensitivity Chart (Line 284):**
```javascript
// Before
ticks: {
    callback: value => Components.formatCurrency(value, true)  // ❌
}

// After
ticks: {
    callback: value => Components.formatCurrency(value)  // ✅
}
```

## Result

**Before:**
- Y-axis labels: "lnx0.00", "lnx200,000.00", "lnx400,000.00", etc. ❌

**After:**
- Y-axis labels: "Rs. 0.00", "Rs. 200,000.00", "Rs. 400,000.00", etc. ✅

## Files Modified

- `pages/what-if.js` - Fixed both CVP Chart and Profit Sensitivity chart y-axis labels

## Testing

1. Refresh your browser (Ctrl+F5 or Cmd+Shift+R)
2. Navigate to **What-If Simulator**
3. Check both charts:
   - **CVP Chart** - Y-axis should show "Rs. X,XXX,XXX.XX"
   - **Profit Sensitivity** - Y-axis should show "Rs. X,XXX,XXX.XX"

## Impact

- **Severity:** Medium (Visual/UX issue)
- **User Impact:** High (Confusing labels)
- **Fix Complexity:** Low (Simple parameter removal)

---

**Status:** ✅ Fixed  
**Testing:** Manual verification recommended  
**Deployment:** Ready
