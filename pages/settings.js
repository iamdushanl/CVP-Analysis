// ========================================
// Settings Page
// ========================================

const SettingsPage = {
  render() {
    const user = AuthManager.getCurrentUser();
    const settings = SettingsManager.getSettings();

    return `
      <div class="mb-6">
        <h2 style="font-size: var(--text-2xl); font-weight: 600;">Settings & Preferences</h2>
        <p style="color: var(--text-secondary); margin-top: var(--space-2);">Manage your profile, preferences, and application settings</p>
      </div>

      <div class="grid-2">
        <!-- Profile Settings -->
        <div class="card">
          <h3 class="card-title">👤 Profile Settings</h3>
          <div style="margin-top: var(--space-4);">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" id="userName" class="form-input" value="${user?.name || ''}" placeholder="Your name">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="userEmail" class="form-input" value="${user?.email || ''}" placeholder="your@email.com">
            </div>
            <div class="form-group">
              <label class="form-label">Role</label>
              <input type="text" class="form-input" value="${user?.role || 'User'}" disabled style="background: var(--gray-50);">
            </div>
            <button class="btn btn-primary" onclick="SettingsPage.updateProfile()">
              💾 Save Profile
            </button>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div class="card">
          <h3 class="card-title">🎨 Appearance</h3>
          <div style="margin-top: var(--space-4);">
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius-md);">
                <div>
                  <div style="font-weight: 600; color: var(--text-primary);">Dark Mode</div>
                  <div style="font-size: var(--text-sm); color: var(--text-secondary);">Switch to dark theme</div>
                </div>
                <label class="switch">
                  <input type="checkbox" id="darkModeToggle" ${settings.dark_mode ? 'checked' : ''} onchange="SettingsPage.toggleDarkMode()">
                  <span class="switch-slider"></span>
                </label>
              </div>
            </div>
            <p style="font-size: var(--text-sm); color: var(--text-muted); margin-top: var(--space-2);">
              ⚠️ Dark mode UI is ready but requires full theme integration (coming soon)
            </p>
          </div>
        </div>

        <!-- Currency & Localization -->
        <div class="card">
          <h3 class="card-title">💱 Currency & Localization</h3>
          <div style="margin-top: var(--space-4);">
            <div class="form-group">
              <label class="form-label">Currency</label>
              <select id="currencySelect" class="form-select" onchange="SettingsPage.updateCurrency()">
                <option value="LKR" ${settings.currency === 'LKR' ? 'selected' : ''}>🇱🇰 Sri Lankan Rupee (Rs.)</option>
                <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>🇺🇸 US Dollar ($)</option>
                <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>🇪🇺 Euro (€)</option>
                <option value="GBP" ${settings.currency === 'GBP' ? 'selected' : ''}>🇬🇧 British Pound (£)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Date Format</label>
              <select id="dateFormatSelect" class="form-select" onchange="SettingsPage.updateDateFormat()">
                <option value="DD-MM-YYYY" ${settings.dateFormat === 'DD-MM-YYYY' ? 'selected' : ''}>DD-MM-YYYY</option>
                <option value="MM-DD-YYYY" ${settings.dateFormat === 'MM-DD-YYYY' ? 'selected' : ''}>MM-DD-YYYY</option>
                <option value="YYYY-MM-DD" ${settings.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>


        <!-- Data Management -->
        <div class="card">
          <h3 class="card-title">💾 Data Management</h3>
          <div style="margin-top: var(--space-4);">
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              <button class="btn btn-secondary" onclick="SettingsPage.exportAllData()">
                📤 Export All Data (JSON)
              </button>
              <button class="btn btn-secondary" onclick="SettingsPage.showImportDataModal()">
                📥 Import Data (JSON)
              </button>
              <button class="btn btn-danger" onclick="SettingsPage.clearAllData()">
                🗑️ Clear All Data
              </button>
            </div>
            <p style="font-size: var(--text-sm); color: var(--text-muted); margin-top: var(--space-4);">
              ⚠️ Clearing data will remove all products, sales, and fixed costs. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <!-- Password Change Section -->
      <div class="card mt-6">
        <h3 class="card-title">🔒 Change Password</h3>
        <div style="margin-top: var(--space-4); max-width: 500px;">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input type="password" id="currentPassword" class="form-input" placeholder="Enter current password">
          </div>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input type="password" id="newPassword" class="form-input" placeholder="Enter new password (min 6 characters)">
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input type="password" id="confirmPassword" class="form-input" placeholder="Confirm new password">
          </div>
          <button class="btn btn-primary" onclick="SettingsPage.changePassword()">
            🔐 Update Password
          </button>
        </div>
      </div>

      <!-- Logout Button -->
      <div class="mt-6" style="text-align: center;">
        <button class="btn btn-danger" onclick="SettingsPage.logout()" style="min-width: 200px;">
          🚪 Logout
        </button>
      </div>
    `;
  },

  updateProfile() {
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;

    if (!name || !email) {
      Components.showToast('Name and email are required', 'error');
      return;
    }

    const result = AuthManager.updateProfile({ name, email });

    if (result.success) {
      Components.showToast('Profile updated successfully', 'success');
    } else {
      Components.showToast(result.error || 'Failed to update profile', 'error');
    }
  },

  toggleDarkMode() {
    const enabled = document.getElementById('darkModeToggle').checked;
    SettingsManager.updateSettings({ dark_mode: enabled });
    AuthManager.updatePreferences({ dark_mode: enabled });
    Components.showToast(`Dark mode ${enabled ? 'enabled' : 'disabled'}`, 'success');
  },

  updateCurrency() {
    const currency = document.getElementById('currencySelect').value;
    SettingsManager.updateSettings({ currency });
    AuthManager.updatePreferences({ currency });
    Components.showToast(`Currency changed to ${currency}`, 'success');
    setTimeout(() => App.refresh(), 500);
  },

  updateDateFormat() {
    const dateFormat = document.getElementById('dateFormatSelect').value;
    SettingsManager.updateSettings({ dateFormat });
    Components.showToast(`Date format changed to ${dateFormat}`, 'success');
    setTimeout(() => App.refresh(), 500);
  },

  exportAllData() {
    const data = {
      products: DataManager.getProducts(),
      sales: DataManager.getSales(),
      fixedCosts: DataManager.getFixedCosts(),
      settings: SettingsManager.getSettings(),
      exportDate: new Date().toISOString()
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cvp_data_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    Components.showToast('Data exported successfully', 'success');
  },

  showImportDataModal() {
    const modalContent = `
      <div>
        <p style="margin-bottom: var(--space-4); color: var(--text-secondary);">
          Upload a JSON backup file to restore your data. This will replace all existing data.
        </p>
        
        <div class="form-group">
          <label class="form-label">Select JSON File</label>
          <input type="file" id="jsonFileInput" accept=".json" class="form-input">
        </div>

        <div style="padding: var(--space-4); background: var(--warning-500); color: white; border-radius: var(--radius-md);">
          <strong>⚠️ Warning:</strong> This will overwrite all existing data!
        </div>
      </div>
    `;

    Components.showModal('Import Data', modalContent, [
      {
        label: 'Import',
        class: 'btn-primary',
        onClick: 'SettingsPage.importData()'
      }
    ]);
  },

  importData() {
    const fileInput = document.getElementById('jsonFileInput');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      Components.showToast('Please select a file', 'error');
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.products) DataManager.saveProducts(data.products);
        if (data.sales) DataManager.saveSales(data.sales);
        if (data.fixedCosts) DataManager.saveFixedCosts(data.fixedCosts);

        Components.closeModal();
        Components.showToast('Data imported successfully', 'success');

        setTimeout(() => App.navigate('dashboard'), 1000);
      } catch (error) {
        Components.showToast('Invalid JSON file', 'error');
      }
    };

    reader.readAsText(file);
  },

  clearAllData() {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
      if (confirm('This will delete all products, sales, and fixed costs. Are you ABSOLUTELY sure?')) {
        DataManager.clearAll();
        Components.showToast('All data cleared', 'success');
        setTimeout(() => {
          location.reload();
        }, 1000);
      }
    }
  },

  changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Components.showToast('All password fields are required', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      Components.showToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      Components.showToast('New password must be at least 6 characters', 'error');
      return;
    }

    const result = AuthManager.changePassword(currentPassword, newPassword);

    if (result.success) {
      Components.showToast('Password changed successfully', 'success');
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    } else {
      Components.showToast(result.error || 'Failed to change password', 'error');
    }
  },

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      AuthManager.logout();
      location.reload();
    }
  },

  toggleAPIKeyVisibility() {
    const input = document.getElementById('geminiApiKey');
    const btn = event.target;
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈 Hide';
    } else {
      input.type = 'password';
      btn.textContent = '👁️ Show';
    }
  },

  saveAPIKey() {
    const apiKey = document.getElementById('geminiApiKey').value.trim();
    if (!apiKey) {
      Components.showToast('Please enter an API key', 'error');
      return;
    }
    SettingsManager.updateSettings({ geminiApiKey: apiKey });
    ChatbotService.setApiKey(apiKey);
    ChatbotUI.updateAPIKey(apiKey);
    Components.showToast('API key saved successfully', 'success');

    const status = document.getElementById('apiKeyStatus');
    if (status) {
      status.innerHTML = `<div style="padding: 12px; background: #d1fae5; color: #065f46; border-radius: 8px;">✅ API key configured!</div>`;
    }
  },

  async testAPIKey() {
    const apiKey = document.getElementById('geminiApiKey').value.trim();
    if (!apiKey) {
      Components.showToast('Please enter an API key first', 'error');
      return;
    }

    const status = document.getElementById('apiKeyStatus');
    if (status) {
      status.innerHTML = `<div style="padding: 12px; background: #dbeafe; color: #1e40af; border-radius: 8px;">🔄 Testing...</div>`;
    }

    try {
      ChatbotService.setApiKey(apiKey);
      const response = await ChatbotService.sendMessageToGemini('Test');

      if (response && response.candidates) {
        status.innerHTML = `<div style="padding: 12px; background: #d1fae5; color: #065f46; border-radius: 8px;">✅ Connection successful!</div>`;
        Components.showToast('API key is valid!', 'success');
        SettingsManager.updateSettings({ geminiApiKey: apiKey });
      }
    } catch (error) {
      status.innerHTML = `<div style="padding: 12px; background: #fee2e2; color: #991b1b; border-radius: 8px;">❌ Failed. Check API key.</div>`;
      Components.showToast('API key test failed', 'error');
    }
  }
};
