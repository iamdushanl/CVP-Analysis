// ========================================
// Main Application Controller
// ========================================

// Global error handler for production resilience
window.addEventListener('error', (event) => {
    console.error('🔥 Unhandled error:', event.error?.message || event.message);
    console.error('   Source:', event.filename, 'Line:', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('🔥 Unhandled promise rejection:', event.reason);
});

const App = {
    currentPage: 'dashboard',

    async init() {
        console.log('🚀 CVP Intelligence - Initializing...');

        if (typeof AuthManager?.hydrateSessionFromFirebase === 'function') {
            await AuthManager.hydrateSessionFromFirebase();
        }

        if (!AuthManager.isAuthenticated()) {
            console.log('⛔ Not authenticated - showing login page');
            AuthPages.showLoginPage();
            return;
        }

        console.log('✅ User authenticated');
        SettingsManager.initializeFromUser();
        DataManager.init();

        // Ensure Firebase is initialized before starting real-time sync
        // hydrateSessionFromFirebase may have returned early if local user was cached
        if (typeof FirebaseService !== 'undefined' && !FirebaseService.isInitialized) {
            try {
                await FirebaseService.init();
            } catch (e) {
                console.warn('⚠️ Firebase init failed, continuing without cloud sync:', e);
            }
        }

        // Start Real-time Sync
        DataManager.startRealtimeSync();

        // Listen for data updates
        window.addEventListener('cvp-data-updated', (e) => {
            console.log(`🔄 Data updated (${e.detail.type}), refreshing view...`);
            this.refresh();
        });

        this.setupNavigation();
        this.setupUserProfile();
        this.navigate('dashboard');

        // Initialize chatbot after DOM is fully ready
        this.initializeChatbot();

        console.log('✅ Application ready');
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.navigate(page);
            });
        });
    },

    setupUserProfile() {
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            // Append the dropdown HTML
            const dropdownHtml = Components.renderUserProfileDropdown();
            userMenu.insertAdjacentHTML('beforeend', dropdownHtml);

            const userAvatar = userMenu.querySelector('.user-avatar');
            if (userAvatar) {
                userAvatar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    Components.toggleUserProfileDropdown();
                });
            }

            // Click outside to close
            document.addEventListener('click', (e) => {
                const dropdown = document.getElementById('userProfileDropdown');
                if (dropdown && dropdown.classList.contains('active')) {
                    if (!dropdown.contains(e.target) && !userAvatar.contains(e.target)) {
                        Components.toggleUserProfileDropdown();
                    }
                }
            });
        }
    },

    navigate(pageName) {
        console.log(`📄 Navigating to: ${pageName}`);
        this.currentPage = pageName;

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === pageName) {
                item.classList.add('active');
            }
        });

        const pageTitle = this.getPageTitle(pageName);
        document.getElementById('pageTitle').textContent = pageTitle;
        this.renderPage(pageName);
    },

    getPageTitle(pageName) {
        const titles = {
            'dashboard': 'Dashboard',
            'products': 'Products',
            'sales': 'Sales',
            'fixed-costs': 'Fixed Costs',
            'cvp-calculator': 'CVP Calculator',
            'what-if': 'What-If Simulator',
            'forecast': 'Forecast',
            'heatmap': 'Profit Heatmap',
            'reports': 'Reports',
            'settings': 'Settings'
        };
        return titles[pageName] || 'Dashboard';
    },

    renderPage(pageName) {
        const contentArea = document.getElementById('contentArea');
        let html = '';
        let pageModule = null;

        switch (pageName) {
            case 'dashboard':
                html = DashboardPage.render();
                pageModule = DashboardPage;
                break;
            case 'products':
                html = ProductsPage.render();
                pageModule = ProductsPage;
                break;
            case 'sales':
                html = SalesPage.render();
                pageModule = SalesPage;
                break;
            case 'fixed-costs':
                html = FixedCostsPage.render();
                pageModule = FixedCostsPage;
                break;
            case 'cvp-calculator':
                html = CVPCalculatorPage.render();
                pageModule = CVPCalculatorPage;
                break;
            case 'what-if':
                html = WhatIfPage.render();
                pageModule = WhatIfPage;
                break;
            case 'forecast':
                html = ForecastPage.render();
                pageModule = ForecastPage;
                break;
            case 'heatmap':
                html = HeatmapPage.render();
                pageModule = HeatmapPage;
                break;
            case 'reports':
                html = ReportsPage.render();
                pageModule = ReportsPage;
                break;
            case 'settings':
                html = SettingsPage.render();
                pageModule = SettingsPage;
                break;
            default:
                html = '<p>Page not found</p>';
        }

        contentArea.innerHTML = html;

        setTimeout(() => {
            if (pageModule && typeof pageModule.renderCharts === 'function') {
                pageModule.renderCharts();
            }
        }, 100);
    },

    initializeChatbot() {
        console.log('🤖 Starting chatbot initialization...');

        // Wait for DOM to be fully ready
        const attemptInit = () => {
            try {
                // Check if all dependencies are loaded
                if (typeof ChatbotUI === 'undefined') {
                    console.error('❌ ChatbotUI not loaded');
                    return false;
                }

                if (typeof ChatbotService === 'undefined') {
                    console.error('❌ ChatbotService not loaded');
                    return false;
                }

                if (typeof CVP_KNOWLEDGE_BASE === 'undefined') {
                    console.error('❌ CVP_KNOWLEDGE_BASE not loaded');
                    return false;
                }

                // Initialize the chatbot UI
                ChatbotUI.init();
                console.log('✅ Chatbot initialized successfully');
                console.log('   - ChatbotService initialized:', ChatbotService.isInitialized);
                console.log('   - API Key configured:', ChatbotService.apiKey ? 'Yes' : 'No');

                // Verify the chatbot widget is in the DOM
                setTimeout(() => {
                    const widget = document.querySelector('.chatbot-widget');
                    if (widget) {
                        console.log('✅ Chatbot widget rendered in DOM');
                    } else {
                        console.warn('⚠️ Chatbot widget not found in DOM');
                    }
                }, 100);

                return true;
            } catch (error) {
                console.error('❌ Chatbot initialization error:', error);
                console.error('   Stack:', error.stack);
                return false;
            }
        };

        // Attempt initialization with retry
        let attempts = 0;
        const maxAttempts = 3;

        const tryInit = () => {
            attempts++;
            console.log(`   Attempt ${attempts}/${maxAttempts}...`);

            if (attemptInit()) {
                return; // Success
            }

            if (attempts < maxAttempts) {
                console.log(`   Retrying in ${attempts * 200}ms...`);
                setTimeout(tryInit, attempts * 200);
            } else {
                console.error('❌ Failed to initialize chatbot after', maxAttempts, 'attempts');
                console.error('   Please check that all chatbot scripts are loaded correctly');
            }
        };

        // Start initialization after a brief delay to ensure all scripts are loaded
        setTimeout(tryInit, 300);
    },

    refresh() {
        this.renderPage(this.currentPage);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init().catch(err => {
            console.error('🔥 Fatal initialization error:', err);
            const contentArea = document.getElementById('contentArea');
            if (contentArea) {
                contentArea.innerHTML = `
                    <div style="padding: 3rem; text-align: center;">
                        <h2 style="color: #ef4444;">⚠️ Application Failed to Load</h2>
                        <p style="margin: 1rem 0; color: #6b7280;">An unexpected error occurred during startup.</p>
                        <button onclick="location.reload()" style="padding: 0.75rem 2rem; background: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">Reload Page</button>
                    </div>
                `;
            }
        });
    });
} else {
    App.init().catch(err => {
        console.error('🔥 Fatal initialization error:', err);
    });
}
