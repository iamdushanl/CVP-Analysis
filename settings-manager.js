// ========================================
// Settings Manager - Global App Settings
// ========================================

const SettingsManager = {
    /**
     * Get current settings
     */
    getSettings() {
        const settingsStr = localStorage.getItem('cvp_settings');
        if (!settingsStr) {
            return this.getDefaultSettings();
        }

        try {
            const settings = JSON.parse(settingsStr);
            // Merge with defaults to ensure all keys exist
            return { ...this.getDefaultSettings(), ...settings };
        } catch (e) {
            return this.getDefaultSettings();
        }
    },

    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            dark_mode: false,
            currency: 'LKR',
            currencySymbols: {
                'LKR': 'Rs.',
                'USD': '$',
                'EUR': '€',
                'GBP': '£'
            },
            dateFormat: 'DD-MM-YYYY',
            decimalPrecision: 2,
            defaultForecastHorizon: '7d',
            dataRetentionDays: 365
        };
    },

    /**
     * Update settings
     */
    updateSettings(updates) {
        const currentSettings = this.getSettings();
        const newSettings = { ...currentSettings, ...updates };

        localStorage.setItem('cvp_settings', JSON.stringify(newSettings));

        // Apply dark mode if changed
        if ('dark_mode' in updates) {
            this.applyDarkMode(updates.dark_mode);
        }

        return { success: true, settings: newSettings };
    },

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        const settings = this.getSettings();
        const newDarkMode = !settings.dark_mode;

        this.updateSettings({ dark_mode: newDarkMode });

        return newDarkMode;
    },

    /**
     * Apply dark mode to DOM
     */
    applyDarkMode(enabled) {
        if (enabled) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    },

    /**
     * Get currency symbol
     */
    getCurrencySymbol(currency = null) {
        const settings = this.getSettings();
        const curr = currency || settings.currency;
        return settings.currencySymbols[curr] || curr;
    },

    /**
     * Format currency value
     */
    formatCurrency(amount, currency = null) {
        const settings = this.getSettings();
        const curr = currency || settings.currency;
        const symbol = this.getCurrencySymbol(curr);

        const formatted = parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: settings.decimalPrecision,
            maximumFractionDigits: settings.decimalPrecision
        });

        // LKR format: Rs. 1,234.56
        if (curr === 'LKR') {
            return `${symbol} ${formatted}`;
        }

        // Other currencies: $1,234.56
        return `${symbol}${formatted}`;
    },

    /**
     * Format date based on settings
     */
    formatDate(dateString) {
        const settings = this.getSettings();
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        if (settings.dateFormat === 'DD-MM-YYYY') {
            return `${day}-${month}-${year}`;
        } else if (settings.dateFormat === 'MM-DD-YYYY') {
            return `${month}-${day}-${year}`;
        } else {
            // Default: YYYY-MM-DD
            return `${year}-${month}-${day}`;
        }
    },

    /**
     * Format number with decimal precision
     */
    formatNumber(value, decimals = null) {
        const settings = this.getSettings();
        const precision = decimals !== null ? decimals : settings.decimalPrecision;

        return parseFloat(value).toLocaleString('en-US', {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
        });
    },

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        const defaults = this.getDefaultSettings();
        localStorage.setItem('cvp_settings', JSON.stringify(defaults));
        this.applyDarkMode(defaults.dark_mode);

        return { success: true, settings: defaults };
    },

    /**
     * Export settings as JSON
     */
    exportSettings() {
        const settings = this.getSettings();
        return JSON.stringify(settings, null, 2);
    },

    /**
     * Import settings from JSON
     */
    importSettings(jsonString) {
        try {
            const settings = JSON.parse(jsonString);
            this.updateSettings(settings);
            return { success: true };
        } catch (e) {
            return { success: false, error: 'Invalid JSON format' };
        }
    },

    /**
     * Initialize settings from user preferences if logged in
     */
    initializeFromUser() {
        const user = AuthManager?.getCurrentUser();
        if (user && user.preferences) {
            const settings = this.getSettings();

            // Override global settings with user preferences
            if (user.preferences.currency) {
                settings.currency = user.preferences.currency;
            }
            if (user.preferences.dark_mode !== undefined) {
                settings.dark_mode = user.preferences.dark_mode;
            }
            if (user.preferences.date_format) {
                settings.dateFormat = user.preferences.date_format;
            }

            this.updateSettings(settings);
        } else {
            // Apply saved settings
            const settings = this.getSettings();
            this.applyDarkMode(settings.dark_mode);
        }
    }
};

// Initialize settings on load
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        SettingsManager.initializeFromUser();
    });
}

/**
 * API Contracts for Backend Integration
 * 
 * GET /api/settings
 * Headers: { Authorization: "Bearer <token>" }
 * Response: { dark_mode, currency, dateFormat, decimalPrecision, defaultForecastHorizon }
 * 
 * PUT /api/settings
 * Headers: { Authorization: "Bearer <token>" }
 * Body: { partial settings object }
 * Response: { updated settings object }
 * 
 * POST /api/settings/reset
 * Headers: { Authorization: "Bearer <token>" }
 * Response: { default settings object }
 */
