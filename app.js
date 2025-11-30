// ========================================
// Main Application Controller
// ========================================

const App = {
    currentPage: 'dashboard',

    init() {
        console.log('🚀 CVP Intelligence - Initializing...');

        if (!AuthManager.isAuthenticated()) {
            console.log('⛔ Not authenticated - showing login page');
            AuthPages.showLoginPage();
            return;
        }

        console.log('✅ User authenticated');
        SettingsManager.initializeFromUser();
        DataManager.init();
        this.setupNavigation();
        this.setupUserProfile();
        this.navigate('dashboard');
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
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.style.cursor = 'pointer';
            userAvatar.addEventListener('click', () => {
                Components.showUserProfileModal();
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

    refresh() {
        this.renderPage(this.currentPage);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
