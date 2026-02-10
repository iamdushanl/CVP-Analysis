// ========================================
// Reusable UI Components
// ========================================

const Components = {
  /**
   * Create a KPI card
   */
  createKPICard(title, value, trend = null, icon = '📊') {
    const trendHtml = trend ? `
      <div class="kpi-trend ${trend > 0 ? 'positive' : 'negative'}">
        ${trend > 0 ? '▲' : '▼'} ${Math.abs(trend).toFixed(1)}%
      </div>
    ` : '';

    return `
      <div class="kpi-card">
        <div class="kpi-header">
          <div>
            <div class="kpi-label">${title}</div>
          </div>
          <div class="kpi-icon">${icon}</div>
        </div>
        <div class="kpi-value">${value}</div>
        ${trendHtml}
      </div>
    `;
  },

  /**
   * Create a data table
   */
  createTable(headers, rows, actions = []) {
    const headerHtml = headers.map(h => `<th>${h}</th>`).join('');

    const rowsHtml = rows.map(row => {
      const cellsHtml = row.cells.map(cell => `<td>${cell}</td>`).join('');

      const actionsHtml = actions.length > 0 ? `
        <td>
          <div class="table-actions">
            ${actions.map(action => `
              <button class="action-btn ${action.class || ''}" 
                      onclick="${action.onClick}('${row.id}')"
                      title="${action.label}">
                ${action.icon}
              </button>
            `).join('')}
          </div>
        </td>
      ` : '';

      return `<tr>${cellsHtml}${actionsHtml}</tr>`;
    }).join('');

    const actionsHeader = actions.length > 0 ? '<th>Actions</th>' : '';

    return `
      <div class="table-container">
        <table>
          <thead>
            <tr>${headerHtml}${actionsHeader}</tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="100" style="text-align:center;padding:2rem;color:var(--gray-400);">No data available</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * Create and show a modal
   */
  showModal(title, content, actions = []) {
    const actionsHtml = actions.map(action => `
      <button class="btn ${action.class || 'btn-secondary'}" 
              onclick="${action.onClick}">
        ${action.label}
      </button>
    `).join('');

    const modalHtml = `
      <div class="modal-overlay" id="modalOverlay" onclick="Components.closeModal(event)">
        <div class="modal" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">${title}</h2>
            <button class="modal-close" onclick="Components.closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
          <div class="modal-footer">
            ${actionsHtml}
            <button class="btn btn-secondary" onclick="Components.closeModal()">Cancel</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHtml;
  },

  /**
   * Close modal
   * Fixed: Only close when clicking on overlay itself, not on modal content
   */
  closeModal(event) {
    // If event exists and the click was not directly on the overlay, ignore it
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modalContainer').innerHTML = '';
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${message}</span>
    `;

    document.getElementById('toastContainer').appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut var(--transition-base) forwards';
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  },

  /**
   * Create form field
   */
  createFormField(label, type, id, options = {}) {
    const {
      value = '',
      placeholder = '',
      required = false,
      min,
      max,
      step,
      selectOptions = []
    } = options;

    let inputHtml = '';

    if (type === 'select') {
      const optionsHtml = selectOptions.map(opt =>
        `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
      ).join('');

      inputHtml = `<select class="form-select" id="${id}" ${required ? 'required' : ''}>${optionsHtml}</select>`;
    } else if (type === 'textarea') {
      inputHtml = `<textarea class="form-textarea" id="${id}" placeholder="${placeholder}" ${required ? 'required' : ''}>${value}</textarea>`;
    } else {
      inputHtml = `
        <input type="${type}" 
               class="form-input" 
               id="${id}" 
               value="${value}"
               placeholder="${placeholder}"
               ${required ? 'required' : ''}
               ${min !== undefined ? `min="${min}"` : ''}
               ${max !== undefined ? `max="${max}"` : ''}
               ${step !== undefined ? `step="${step}"` : ''}>
      `;
    }

    return `
      <div class="form-group">
        <label class="form-label" for="${id}">${label}${required ? ' *' : ''}</label>
        ${inputHtml}
      </div>
    `;
  },

  /**
   * Format currency
   */
  formatCurrency(amount, currency = null) {
    if (typeof SettingsManager !== 'undefined') {
      return SettingsManager.formatCurrency(amount, currency);
    }

    // Fallback if SettingsManager not loaded
    const num = parseFloat(amount);
    if (isNaN(num)) return 'Rs. 0.00';

    return 'Rs. ' + num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  /**
   * Format number
   */
  formatNumber(num, decimals = 2) {
    if (typeof SettingsManager !== 'undefined') {
      return SettingsManager.formatNumber(num, decimals);
    }

    // Fallback
    const parsedNum = parseFloat(num);
    if (isNaN(parsedNum)) return '0';

    return parsedNum.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  /**
   * Format date
   */
  formatDate(dateString) {
    if (typeof SettingsManager !== 'undefined') {
      return SettingsManager.formatDate(dateString);
    }

    // Fallback
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Create chart
   */
  createChart(canvasId, config) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Destroy existing chart if any
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) {
      existingChart.destroy();
    }

    return new Chart(ctx, config);
  },

  /**
   * Get form data
   */
  getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return null;

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      // Convert numeric fields
      if (value && !isNaN(value) && value.trim() !== '') {
        data[key] = parseFloat(value);
      } else {
        data[key] = value;
      }
    }

    return data;
  },

  /**
   * Create output metric card
   */
  createMetricCard(label, value, unit = '') {
    return `
      <div class="card">
        <div class="kpi-label">${label}</div>
        <div class="kpi-value">${value} ${unit}</div>
      </div>
    `;
  },

  /**
   * Render User Profile Dropdown
   */
  renderUserProfileDropdown() {
    const isGuest = sessionStorage.getItem('cvp_guest_mode') === 'true';

    if (isGuest) {
      // Guest mode dropdown
      const guestUser = JSON.parse(sessionStorage.getItem('cvp_current_user') || '{}');
      const initials = AuthManager.getAvatarInitials(guestUser.name || 'Guest');

      return `
        <div class="profile-dropdown" id="userProfileDropdown">
          <div class="dropdown-header">
            <div class="dropdown-avatar">${initials}</div>
            <div class="dropdown-name">${guestUser.name || 'Guest User'}</div>
            <div class="dropdown-email">${guestUser.email || 'guest@demo.local'}</div>
            <div style="color: var(--primary-color); font-size: 0.75rem; margin-top: 4px;">
              🎭 Guest Mode - Exploring with sample data
            </div>
          </div>
          <div class="dropdown-menu">
            <button class="dropdown-item" onclick="sessionStorage.clear(); AuthPages.showLoginPage()">
              <span class="dropdown-icon">🔐</span> Login to Save Your Data
            </button>
            <button class="dropdown-item" onclick="sessionStorage.clear(); AuthPages.showRegisterPage()">
              <span class="dropdown-icon">✨</span> Create Account
            </button>
          </div>
        </div>
      `;
    }

    // Authenticated user dropdown
    const user = AuthManager.getCurrentUser();
    if (!user) return '';

    const initials = AuthManager.getAvatarInitials(user);

    return `
      <div class="profile-dropdown" id="userProfileDropdown">
        <div class="dropdown-header">
          <div class="dropdown-avatar">${initials}</div>
          <div class="dropdown-name">${user.name}</div>
          <div class="dropdown-email">${user.email}</div>
        </div>
        <div class="dropdown-menu">
          <button class="dropdown-item" onclick="App.navigate('settings')">
            <span class="dropdown-icon">⚙️</span> Settings
          </button>
          <div class="dropdown-footer">
            <button class="dropdown-item danger" onclick="Components.handleLogout()">
              <span class="dropdown-icon">🚪</span> Logout
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Toggle User Profile Dropdown
   */
  toggleUserProfileDropdown() {
    const dropdown = document.getElementById('userProfileDropdown');
    if (dropdown) {
      const isActive = dropdown.classList.contains('active');

      // Close all other dropdowns if any
      document.querySelectorAll('.profile-dropdown').forEach(d => d.classList.remove('active'));

      if (!isActive) {
        dropdown.style.display = 'block';
        setTimeout(() => dropdown.classList.add('active'), 10);
      } else {
        dropdown.classList.remove('active');
        setTimeout(() => dropdown.style.display = 'none', 250);
      }
    }
  },

  /**
   * Show user profile modal (Fallback or detailed view)
   */
  showUserProfileModal() {
    const user = AuthManager.getCurrentUser();
    if (!user) return;

    const initials = AuthManager.getAvatarInitials(user);
    const settings = SettingsManager.getSettings();

    const content = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-500), var(--primary-600)); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 600; margin: 0 auto 1rem;">
          ${initials}
        </div>
        <h3 style="margin: 0; font-size: 1.5rem; font-weight: 600;">${user.name}</h3>
        <p style="margin: 0.5rem 0 0; color: var(--gray-500);">${user.email}</p>
      </div>

      <div style="background: var(--gray-50); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; font-weight: 600; color: var(--gray-700);">Account Information</h4>
        <div style="display: grid; gap: 0.75rem;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--gray-600);">Role:</span>
            <span style="font-weight: 500; text-transform: capitalize;">${user.role || 'User'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--gray-600);">Currency:</span>
            <span style="font-weight: 500;">${settings.currency}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--gray-600);">Date Format:</span>
            <span style="font-weight: 500;">${settings.dateFormat}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--gray-600);">Member Since:</span>
            <span style="font-weight: 500;">${new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button class="btn btn-secondary" onclick="App.navigate('settings')" style="flex: 1;">
          ⚙️ Settings
        </button>
        <button class="btn btn-danger" onclick="Components.handleLogout()" style="flex: 1;">
          🚪 Logout
        </button>
      </div>
    `;

    this.showModal('User Profile', content, []);
  },

  /**
   * Handle logout
   */
  handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      AuthManager.logout();
      this.closeModal();
      // Also close dropdown if open
      const dropdown = document.getElementById('userProfileDropdown');
      if (dropdown) dropdown.classList.remove('active');

      location.reload();
    }
  }
};

// Add CSS for toast slideOut animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
