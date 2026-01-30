// ========================================
// Flagship Authentication Pages Implementation
// Integrated with Firebase & Premium UI
// ========================================

const AuthPages = {
  /**
   * Render flagship login page
   */
  renderLoginPage() {
    return `
      <div class="auth-page-wrapper">
        <!-- Mesh Background -->
        <div class="mesh-gradient">
          <div class="mesh-blob blob-1"></div>
          <div class="mesh-blob blob-2"></div>
          <div class="mesh-blob blob-3"></div>
        </div>

        <div class="auth-card-container">
          <div class="auth-brand-side">
            <div class="logo-wrapper-flagship">
                <svg class="flagship-logo-svg" viewBox="0 0 100 100">
                    <defs>
                        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:var(--primary-main);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:var(--secondary-main);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect x="15" y="60" width="12" height="25" fill="url(#logoGrad)" rx="2" />
                    <rect x="35" y="45" width="12" height="40" fill="url(#logoGrad)" rx="2" />
                    <rect x="55" y="30" width="12" height="55" fill="url(#logoGrad)" rx="2" />
                    <path d="M 75 45 L 90 20 L 95 25 L 90 20 L 85 22" 
                          stroke="var(--primary-main)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    <circle cx="90" cy="20" r="4" fill="var(--primary-main)">
                        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                    </circle>
                </svg>
            </div>
            <h1 class="brand-title">CVP Intelligence</h1>
            <p class="brand-tagline">The Ultimate Cost-Volume-Profit Analysis Engine.</p>
            
            <div class="brand-explanation">
              <p>Master your business finances by analyzing the relationship between <strong>Costs</strong>, <strong>Sales Volume</strong>, and <strong>Profit</strong>.</p>
            </div>

            <div class="feature-pill-list">
              <div class="feature-pill"><div class="feature-dot"></div> Break-Even Analysis</div>
              <div class="feature-pill"><div class="feature-dot"></div> Profit Forecasting</div>
              <div class="feature-pill"><div class="feature-dot"></div> Margin Optimization</div>
              <div class="feature-pill"><div class="feature-dot"></div> Smart Product Insights</div>
            </div>
          </div>

          <!-- Right: Form -->
          <div class="auth-form-side">
            <div class="form-header">
              <h2 class="form-title">Login</h2>
              <p class="form-subtitle">Enter your credentials to continue</p>
            </div>

            <div id="loginError" class="hidden"></div>

            <form id="loginForm" onsubmit="AuthPages.handleLogin(event)">
              <div class="input-field-wrapper">
                <label class="input-label">Email Address</label>
                <input type="email" id="loginEmail" class="premium-input" placeholder="name@company.com" required>
              </div>

              <div class="input-field-wrapper">
                <label class="input-label">Password</label>
                <input type="password" id="loginPassword" class="premium-input" placeholder="••••••••" required>
                <span class="input-icon-right" onclick="AuthPages.togglePassword('loginPassword')">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </span>
              </div>

              <a href="#" class="forgot-pass-link" onclick="AuthPages.showForgotPassword(); return false;">Forgot password?</a>

              <button type="submit" class="btn-flagship" id="loginBtn">
                Sign In
              </button>

              <div class="social-auth-divider">
                <div class="divider-line"></div>
                <span class="divider-text">OR CONTINUE WITH</span>
                <div class="divider-line"></div>
              </div>

              <div class="social-grid single-provider">
                <div class="social-item-btn" onclick="AuthPages.socialLogin('google')">
                  <svg class="social-icon-svg" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </div>
              </div>

              <p class="switch-auth-mode">
                New to the platform? <a href="#" class="switch-link" onclick="AuthPages.showRegisterPage(); return false;">Create an account</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render flagship register page
   */
  renderRegisterPage() {
    return `
      <div class="auth-page-wrapper">
        <div class="mesh-gradient">
          <div class="mesh-blob blob-1"></div>
          <div class="mesh-blob blob-2"></div>
          <div class="mesh-blob blob-3"></div>
        </div>

        <div class="auth-card-container">
          <div class="auth-brand-side">
            <div class="logo-wrapper-flagship">
                <svg class="flagship-logo-svg" viewBox="0 0 100 100">
                    <defs>
                        <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:var(--primary-main);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:var(--secondary-main);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect x="15" y="60" width="12" height="25" fill="url(#logoGrad2)" rx="2" />
                    <rect x="35" y="45" width="12" height="40" fill="url(#logoGrad2)" rx="2" />
                    <rect x="55" y="30" width="12" height="55" fill="url(#logoGrad2)" rx="2" />
                    <path d="M 75 45 L 90 20 L 95 25 L 90 20 L 85 22" 
                          stroke="var(--primary-main)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    <circle cx="90" cy="20" r="4" fill="var(--primary-main)">
                        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                    </circle>
                </svg>
            </div>
            <h1 class="brand-title">CVP Intelligence</h1>
            <p class="brand-tagline">Predict Profits. Minimize Risk. Scale High.</p>
            
            <div class="brand-explanation">
              <p>Everything you need to understand <strong>Cost-Volume-Profit</strong> relationships and drive sustainable growth.</p>
            </div>
          </div>

          <div class="auth-form-side">
            <div class="form-header">
              <h2 class="form-title">Join Us</h2>
              <p class="form-subtitle">Start your 14-day premium trial today.</p>
            </div>

            <div id="registerError" class="hidden"></div>

            <form id="registerForm" onsubmit="AuthPages.handleRegister(event)">
              <div class="input-field-wrapper">
                <label class="input-label">Full Name</label>
                <input type="text" id="registerName" class="premium-input" placeholder="John Doe" required>
              </div>

              <div class="input-field-wrapper">
                <label class="input-label">Email Address</label>
                <input type="email" id="registerEmail" class="premium-input" placeholder="john@example.com" required>
              </div>

              <div class="input-field-wrapper">
                <label class="input-label">Password</label>
                <input type="password" id="registerPassword" class="premium-input" placeholder="Min 6 characters" required minlength="6">
              </div>

              <div class="input-field-wrapper">
                <label class="input-label">Currency</label>
                <select id="registerCurrency" class="premium-input">
                  <option value="LKR" selected>Sri Lankan Rupee (LKR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>

              <button type="submit" class="btn-flagship" id="registerBtn">
                Get Started
              </button>

              <p class="switch-auth-mode" style="margin-top: 24px;">
                Already a member? <a href="#" class="switch-link" onclick="AuthPages.showLoginPage(); return false;">Sign In</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  },

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    const errorEl = document.getElementById('loginError');

    errorEl.className = 'hidden';
    btn.disabled = true;
    btn.innerHTML = '<div class="btn-loader"></div>';

    try {
      const result = await AuthManager.login(email, password, true);
      if (result.success) {
        btn.innerHTML = 'Success';
        setTimeout(() => window.location.reload(), 500);
      } else {
        errorEl.className = 'auth-error-toast';
        errorEl.textContent = result.error;
        btn.disabled = false;
        btn.innerHTML = 'Sign In';
      }
    } catch (e) {
      errorEl.className = 'auth-error-toast';
      errorEl.textContent = 'Server connection failed.';
      btn.disabled = false;
      btn.innerHTML = 'Sign In';
    }
  },

  async handleRegister(event) {
    event.preventDefault();
    const btn = document.getElementById('registerBtn');
    const errorEl = document.getElementById('registerError');
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const currency = document.getElementById('registerCurrency').value;

    errorEl.className = 'hidden';
    btn.disabled = true;
    btn.innerHTML = '<div class="btn-loader"></div>';

    try {
      const result = await AuthManager.register({ name, email, password, currency });
      if (result.success) {
        btn.innerHTML = 'Welcome!';
        setTimeout(() => window.location.reload(), 500);
      } else {
        errorEl.className = 'auth-error-toast';
        errorEl.textContent = result.error;
        btn.disabled = false;
        btn.innerHTML = 'Get Started';
      }
    } catch (e) {
      errorEl.className = 'auth-error-toast';
      errorEl.textContent = 'Registration failed. Try again.';
      btn.disabled = false;
      btn.innerHTML = 'Get Started';
    }
  },

  showLoginPage() {
    document.body.innerHTML = this.renderLoginPage();
  },

  showRegisterPage() {
    document.body.innerHTML = this.renderRegisterPage();
  },

  showForgotPassword() {
    alert('Reset link will be sent to your email.');
  },

  async socialLogin(provider) {
    if (provider !== 'google') {
      alert(`${provider} login is not enabled in your Firebase console yet.`);
      return;
    }

    const btn = event?.currentTarget || document.querySelector('.social-item-btn');
    const originalHTML = btn.innerHTML;
    btn.style.pointerEvents = 'none';
    btn.innerHTML = '<div class="btn-loader"></div>';

    try {
      const result = await FirebaseService.signInWithGoogle();
      if (result.success) {
        // Now sync with local AuthManager
        await AuthManager.loginWithFirebase(result.user);
        btn.innerHTML = 'Success';
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (e) {
      console.error('Social Login Error:', e);
      alert('Google Login failed. Make sure you have enabled Google Auth in your Firebase console.');
      btn.innerHTML = originalHTML;
      btn.style.pointerEvents = 'all';
    }
  }
};
