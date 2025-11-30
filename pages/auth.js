// ========================================
// Authentication Pages
// ========================================

const AuthPages = {
  /**
   * Render login page
   */
  renderLoginPage() {
    return `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary-600), var(--accent-600)); padding: var(--space-8);">
        <div class="card" style="max-width: 420px; width: 100%; padding: var(--space-8);">
          <div style="text-align: center; margin-bottom: var(--space-8);">
            <h1 style="font-size: var(--text-3xl); font-weight: 700; background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: var(--space-2);">CVP Intelligence</h1>
            <p class="text-muted">Cost-Volume-Profit Analysis Platform</p>
          </div>
          
          <form id="loginForm" onsubmit="AuthPages.handleLogin(event)">
            <div class="form-group">
              <label class="form-label" for="loginEmail">Email</label>
              <input 
                type="email" 
                id="loginEmail" 
                class="form-input" 
                placeholder="user@example.com"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label" for="loginPassword">Password</label>
              <input 
                type="password" 
                id="loginPassword" 
                class="form-input" 
                placeholder="Enter your password"
                required
              >
            </div>
            
            <div class="form-group" style="display: flex; align-items: center; gap: var(--space-2);">
              <input type="checkbox" id="rememberMe" style="width: auto;">
              <label for="rememberMe" style="margin: 0; font-size: var(--text-sm); cursor: pointer;">Remember me</label>
            </div>
            
            <div id="loginError" class="hidden" style="padding: var(--space-3); background: #fee2e2; border: 1px solid var(--danger-500); border-radius: var(--radius-md); color: var(--danger-600); font-size: var(--text-sm); margin-bottom: var(--space-4);"></div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: var(--space-4);">
              Sign In
            </button>
            
            <button type="button" class="btn btn-secondary" style="width: 100%; margin-bottom: var(--space-4);" onclick="AuthPages.handleDemoLogin()">
              🚀 Demo Quick Login
            </button>
            
            <div style="text-align: center;">
              <a href="#" onclick="AuthPages.showRegisterPage()" style="color: var(--primary-600); text-decoration: none; font-size: var(--text-sm);">
                Don't have an account? <strong>Sign up</strong>
              </a>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  /**
   * Render register page
   */
  renderRegisterPage() {
    return `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary-600), var(--accent-600)); padding: var(--space-8);">
        <div class="card" style="max-width: 420px; width: 100%; padding: var(--space-8);">
          <div style="text-align: center; margin-bottom: var(--space-8);">
            <h1 style="font-size: var(--text-3xl); font-weight: 700; background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: var(--space-2);">Create Account</h1>
            <p class="text-muted">Join CVP Intelligence</p>
          </div>
          
          <form id="registerForm" onsubmit="AuthPages.handleRegister(event)">
            <div class="form-group">
              <label class="form-label" for="registerName">Full Name *</label>
              <input 
                type="text" 
                id="registerName" 
                class="form-input" 
                placeholder="John Doe"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label" for="registerEmail">Email *</label>
              <input 
                type="email" 
                id="registerEmail" 
                class="form-input" 
                placeholder="user@example.com"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label" for="registerPassword">Password *</label>
              <input 
                type="password" 
                id="registerPassword" 
                class="form-input" 
                placeholder="At least 6 characters"
                required
                minlength="6"
              >
            </div>
            
            <div class="form-group">
              <label class="form-label" for="registerCurrency">Preferred Currency</label>
              <select id="registerCurrency" class="form-select">
                <option value="LKR" selected>Sri Lankan Rupee (LKR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
            
            <div id="registerError" class="hidden" style="padding: var(--space-3); background: #fee2e2; border: 1px solid var(--danger-500); border-radius: var(--radius-md); color: var(--danger-600); font-size: var(--text-sm); margin-bottom: var(--space-4);"></div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: var(--space-4);">
              Create Account
            </button>
            
            <div style="text-align: center;">
              <a href="#" onclick="AuthPages.showLoginPage()" style="color: var(--primary-600); text-decoration: none; font-size: var(--text-sm);">
                Already have an account? <strong>Sign in</strong>
              </a>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  /**
   * Handle login form submission
   */
  async handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const result = await AuthManager.login(email, password, rememberMe);

    if (result.success) {
      // Redirect to dashboard
      window.location.reload();
    } else {
      // Show error
      const errorEl = document.getElementById('loginError');
      errorEl.textContent = result.error;
      errorEl.classList.remove('hidden');
    }
  },

  /**
   * Handle demo login
   */
  async handleDemoLogin() {
    const result = await AuthManager.login('demo@cvp.com', 'demo', false);

    if (result.success) {
      window.location.reload();
    }
  },

  /**
   * Handle register form submission
   */
  async handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const currency = document.getElementById('registerCurrency').value;

    const result = await AuthManager.register({
      name,
      email,
      password,
      currency,
      timezone: 'Asia/Colombo'
    });

    if (result.success) {
      // Redirect to dashboard
      window.location.reload();
    } else {
      // Show error
      const errorEl = document.getElementById('registerError');
      errorEl.textContent = result.error;
      errorEl.classList.remove('hidden');
    }
  },

  /**
   * Show login page
   */
  showLoginPage() {
    document.body.innerHTML = this.renderLoginPage();
  },

  /**
   * Show register page
   */
  showRegisterPage() {
    document.body.innerHTML = this.renderRegisterPage();
  }
};
