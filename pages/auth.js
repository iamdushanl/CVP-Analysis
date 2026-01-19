// ========================================
// Authentication Pages - Clean Modern Design
// ========================================

const AuthPages = {
  /**
   * Render modern login page
   */
  renderLoginPage() {
    return `
      <div class="auth-container">
        <div class="auth-split-layout">
          <!-- Left Panel - Branding -->
          <div class="auth-branding-panel">
            <!-- Decorative floating shapes -->
            <div class="auth-decorations">
              <div class="floating-shape floating-circle shape-1"></div>
              <div class="floating-shape floating-square shape-2"></div>
              <div class="floating-shape floating-circle shape-3"></div>
            </div>
            
            <!-- Branding content -->
            <div class="auth-branding-content">
              <div class="auth-logo-container">
                <svg class="auth-logo-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                  <!-- Bar Chart Bars -->
                  <rect x="20" y="70" width="15" height="30" fill="#0284c7" rx="2"/>
                  <rect x="40" y="55" width="15" height="45" fill="#0ea5e9" rx="2"/>
                  <rect x="60" y="40" width="15" height="60" fill="#06b6d4" rx="2"/>
                  
                  <!-- Upward Arrow -->
                  <path d="M 85 60 L 105 30 L 110 35 L 105 30 L 100 32" 
                        stroke="#06b6d4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                  <polygon points="105,20 115,35 95,35" fill="#06b6d4"/>
                </svg>
              </div>
              
              <h1 class="auth-brand-name">CVP INTELLIGENCE</h1>
              <p class="auth-tagline">Transform Data into Profit Insights</p>
              
              <ul class="auth-features">
                <li class="auth-feature-item">
                  <svg class="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>Real-time Break-Even Analysis</span>
                </li>
                <li class="auth-feature-item">
                  <svg class="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  <span>Advanced Profit Forecasting</span>
                </li>
                <li class="auth-feature-item">
                  <svg class="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                  <span>Interactive What-If Scenarios</span>
                </li>
                <li class="auth-feature-item">
                  <svg class="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  <span>Comprehensive Financial Reports</span>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Right Panel - Login Form -->
          <div class="auth-form-panel">
            <div class="auth-card">
              <h2 class="auth-heading">Welcome back</h2>
              
              <form id="loginForm" onsubmit="AuthPages.handleLogin(event)">
                <!-- Email Input -->
                <div class="auth-input-group">
                  <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input 
                    type="email" 
                    id="loginEmail" 
                    class="auth-input" 
                    placeholder="Enter your email"
                    required
                    autocomplete="email"
                  >
                </div>
                
                <!-- Password Input -->
                <div class="auth-input-group">
                  <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input 
                    type="password" 
                    id="loginPassword" 
                    class="auth-input" 
                    placeholder="Enter your password"
                    required
                    autocomplete="current-password"
                  >
                  <svg class="auth-password-toggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" onclick="AuthPages.togglePassword('loginPassword')" title="Show/Hide Password">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                
                <!-- Remember Me & Forgot Password -->
                <div class="auth-options-row">
                  <label class="auth-remember">
                    <input type="checkbox" id="rememberMe" class="auth-checkbox">
                    <span class="auth-remember-label">Remember me</span>
                  </label>
                  <a href="#" onclick="AuthPages.showForgotPassword(); return false;" class="auth-forgot-link">
                    Forgot password?
                  </a>
                </div>
                
                <!-- Error Message -->
                <div id="loginError" class="hidden"></div>
                
                <!-- Sign In Button -->
                <button type="submit" class="auth-btn-primary" id="loginBtn">
                  Sign in
                </button>
                
                <!-- Divider -->
                <div class="auth-divider">
                  <div class="auth-divider-line"></div>
                  <span class="auth-divider-text">Or continue with</span>
                  <div class="auth-divider-line"></div>
                </div>
                
                <!-- Social Login -->
                <div class="auth-social-buttons">
                  <button type="button" class="auth-social-btn" onclick="AuthPages.socialLogin('google')" title="Sign in with Google">
                    <svg class="auth-social-icon" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                  <button type="button" class="auth-social-btn" onclick="AuthPages.socialLogin('microsoft')" title="Sign in with Microsoft">
                    <svg class="auth-social-icon" viewBox="0 0 24 24">
                      <path fill="#f25022" d="M1 1h10v10H1z"/>
                      <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                      <path fill="#7fba00" d="M1 13h10v10H1z"/>
                      <path fill="#ffb900" d="M13 13h10v10H13z"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Sign Up Link -->
                <p class="auth-signup-prompt">
                  Don't have an account? 
                  <a href="#" onclick="AuthPages.showRegisterPage(); return false;" class="auth-signup-link">Sign up</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render modern register page
   */
  renderRegisterPage() {
    return `
      <div class="auth-container">
        <div class="auth-split-layout">
          <!-- Left Panel - Branding -->
          <div class="auth-branding-panel">
            <!-- Decorative floating shapes -->
            <div class="auth-decorations">
              <div class="floating-shape floating-circle shape-1"></div>
              <div class="floating-shape floating-square shape-2"></div>
              <div class="floating-shape floating-circle shape-3"></div>
            </div>
            
            <!-- Branding content -->
            <div class="auth-branding-content">
              <div class="auth-logo-container">
                <svg class="auth-logo-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                  <!-- Bar Chart Bars -->
                  <rect x="20" y="70" width="15" height="30" fill="#0284c7" rx="2"/>
                  <rect x="40" y="55" width="15" height="45" fill="#0ea5e9" rx="2"/>
                  <rect x="60" y="40" width="15" height="60" fill="#06b6d4" rx="2"/>
                  
                  <!-- Upward Arrow -->
                  <path d="M 85 60 L 105 30 L 110 35 L 105 30 L 100 32" 
                        stroke="#06b6d4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                  <polygon points="105,20 115,35 95,35" fill="#06b6d4"/>
                </svg>
              </div>
              
              <h1 class="auth-brand-name">CVP INTELLIGENCE</h1>
              <p class="auth-tagline">Transform Data into Profit Insights</p>
              
              <ul class="auth-features">
                <li class="auth-feature-item">
                  <svg class="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>Real-time Break-Even Analysis</span>
                </li>
                <li class="auth-feature-item">
                  <svg class="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  <span>Advanced Profit Forecasting</span>
                </li>
                <li class="auth-feature-item">
                  <svg class="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                  <span>Interactive What-If Scenarios</span>
                </li>
                <li class="auth-feature-item">
                  <svg class="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  <span>Comprehensive Financial Reports</span>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Right Panel - Register Form -->
          <div class="auth-form-panel">
            <div class="auth-card">
              <h2 class="auth-heading">Create your account</h2>
              
              <form id="registerForm" onsubmit="AuthPages.handleRegister(event)">
                <!-- Name Input -->
                <div class="auth-input-group">
                  <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input 
                    type="text" 
                    id="registerName" 
                    class="auth-input" 
                    placeholder="Enter your full name"
                    required
                    autocomplete="name"
                  >
                </div>
                
                <!-- Email Input -->
                <div class="auth-input-group">
                  <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input 
                    type="email" 
                    id="registerEmail" 
                    class="auth-input" 
                    placeholder="Enter your email"
                    required
                    autocomplete="email"
                  >
                </div>
                
                <!-- Password Input -->
                <div class="auth-input-group">
                  <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input 
                    type="password" 
                    id="registerPassword" 
                    class="auth-input" 
                    placeholder="Create a password (min 6 characters)"
                    required
                    minlength="6"
                    autocomplete="new-password"
                  >
                  <svg class="auth-password-toggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" onclick="AuthPages.togglePassword('registerPassword')" title="Show/Hide Password">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                
                <!-- Currency Selection -->
                <div class="auth-input-group">
                  <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  <select id="registerCurrency" class="auth-input" style="padding-left: 48px;">
                    <option value="LKR" selected>Sri Lankan Rupee (LKR)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>
                
                <!-- Error Message -->
                <div id="registerError" class="hidden"></div>
                
                <!-- Create Account Button -->
                <button type="submit" class="auth-btn-primary" id="registerBtn">
                  Create account
                </button>
                
                <!-- Divider -->
                <div class="auth-divider">
                  <div class="auth-divider-line"></div>
                  <span class="auth-divider-text">Or sign up with</span>
                  <div class="auth-divider-line"></div>
                </div>
                
                <!-- Social Login -->
                <div class="auth-social-buttons">
                  <button type="button" class="auth-social-btn" onclick="AuthPages.socialLogin('google')" title="Sign up with Google">
                    <svg class="auth-social-icon" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                  <button type="button" class="auth-social-btn" onclick="AuthPages.socialLogin('microsoft')" title="Sign up with Microsoft">
                    <svg class="auth-social-icon" viewBox="0 0 24 24">
                      <path fill="#f25022" d="M1 1h10v10H1z"/>
                      <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                      <path fill="#7fba00" d="M1 13h10v10H1z"/>
                      <path fill="#ffb900" d="M13 13h10v10H13z"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Sign In Link -->
                <p class="auth-signup-prompt">
                  Already have an account? 
                  <a href="#" onclick="AuthPages.showLoginPage(); return false;" class="auth-signup-link">Sign in</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Toggle password visibility
   */
  togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  },

  /**
   * Handle login form submission
   */
  async handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginBtn = document.getElementById('loginBtn');
    const errorEl = document.getElementById('loginError');

    // Clear previous errors
    errorEl.classList.add('hidden');
    errorEl.textContent = '';

    // Show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="auth-spinner"></span> Signing in...';

    try {
      const result = await AuthManager.login(email, password, rememberMe);

      if (result.success) {
        // Show success state
        loginBtn.innerHTML = '✓ Success!';
        loginBtn.classList.add('success');

        // Redirect to dashboard after short delay
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // Show error
        errorEl.textContent = result.error;
        errorEl.classList.remove('hidden');
        errorEl.classList.add('auth-error');

        // Add error shake to inputs
        document.getElementById('loginEmail').classList.add('error');
        document.getElementById('loginPassword').classList.add('error');

        setTimeout(() => {
          document.getElementById('loginEmail').classList.remove('error');
          document.getElementById('loginPassword').classList.remove('error');
        }, 500);

        // Reset button
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Sign in';
      }
    } catch (error) {
      console.error('Login error:', error);
      errorEl.textContent = 'An unexpected error occurred. Please try again.';
      errorEl.classList.remove('hidden');
      errorEl.classList.add('auth-error');

      loginBtn.disabled = false;
      loginBtn.innerHTML = 'Sign in';
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
    const registerBtn = document.getElementById('registerBtn');
    const errorEl = document.getElementById('registerError');

    // Clear previous errors
    errorEl.classList.add('hidden');
    errorEl.textContent = '';

    // Show loading state
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<span class="auth-spinner"></span> Creating account...';

    try {
      const result = await AuthManager.register({
        name,
        email,
        password,
        currency,
        timezone: 'Asia/Colombo'
      });

      if (result.success) {
        // Show success state
        registerBtn.innerHTML = '✓ Account created!';
        registerBtn.classList.add('success');

        // Redirect to dashboard after short delay
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // Show error
        errorEl.textContent = result.error;
        errorEl.classList.remove('hidden');
        errorEl.classList.add('auth-error');

        // Reset button
        registerBtn.disabled = false;
        registerBtn.innerHTML = 'Create account';
      }
    } catch (error) {
      console.error('Registration error:', error);
      errorEl.textContent = 'An unexpected error occurred. Please try again.';
      errorEl.classList.remove('hidden');
      errorEl.classList.add('auth-error');

      registerBtn.disabled = false;
      registerBtn.innerHTML = 'Create account';
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
  },

  /**
   * Show forgot password (placeholder)
   */
  showForgotPassword() {
    alert('Password reset functionality will be implemented soon.\n\nFor now, please contact support or use demo@cvp.com / demo');
  },

  /**
   * Social login (placeholder)
   */
  socialLogin(provider) {
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login will be implemented soon.\n\nPlease use email/password login or demo@cvp.com / demo for now.`);
  }
};
