// ========================================
// Fixed Costs Page - Enhanced
// ========================================

const FixedCostsPage = {
  render() {
    const costs = DataManager.getFixedCosts();
    const totalMonthly = DataManager.getTotalFixedCosts();

    const rows = costs.map(cost => ({
      id: cost.id,
      cells: [
        cost.name,
        cost.frequency || 'monthly',
        Components.formatCurrency(cost.amount),
        Components.formatCurrency(this.getMonthlyAmount(cost))
      ]
    }));

    const table = Components.createTable(
      ['Cost Name', 'Frequency', 'Amount', 'Monthly Equivalent'],
      rows,
      [
        {
          label: 'Edit',
          icon: '✏️',
          class: 'edit',
          onClick: 'FixedCostsPage.editCost'
        },
        {
          label: 'Delete',
          icon: '🗑️',
          class: 'delete',
          onClick: 'FixedCostsPage.deleteCost'
        }
      ]
    );

    return `
      <div class="flex-between mb-6">
        <h2 style="font-size: var(--text-2xl); font-weight: 600;">Fixed Costs Management</h2>
        <button class="btn btn-primary" onclick="FixedCostsPage.showAddModal()">
          ➕ Add Fixed Cost
        </button>
      </div>

      <div class="grid-2 mb-6">
        <div class="card" style="background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); color: white; text-align: center;">
          <div style="font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--space-2);">TOTAL MONTHLY FIXED COSTS</div>
          <div style="font-size: var(--text-4xl); font-weight: 700;">${Components.formatCurrency(totalMonthly)}</div>
        </div>
        
        <div class="card" style="background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1)); border-left: 4px solid var(--accent-500);">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <span style="font-size: var(--text-3xl);">📋</span>
            <div>
              <div style="font-weight: 600; color: var(--text-primary); font-size: var(--text-2xl);">${costs.length}</div>
              <div style="font-size: var(--text-sm); color: var(--text-secondary);">Total Cost Items</div>
            </div>
          </div>
        </div>
      </div>

      ${table}
      
      <div class="card mt-6" style="padding: var(--space-4); background: var(--gray-50);">
        <p style="font-size: var(--text-sm); color: var(--text-secondary); margin: 0;">
          <strong>Note:</strong> Yearly costs are automatically converted to monthly equivalents (amount ÷ 12) for CVP calculations.
        </p>
      </div>
    `;
  },

  /**
   * Calculate monthly equivalent amount
   */
  getMonthlyAmount(cost) {
    const frequency = cost.frequency || 'monthly';
    const amount = cost.amount || 0;

    switch (frequency) {
      case 'daily':
        return amount * 30;
      case 'weekly':
        return amount * 4.33;
      case 'monthly':
        return amount;
      case 'quarterly':
        return amount / 3;
      case 'yearly':
        return amount / 12;
      default:
        return amount;
    }
  },

  showAddModal() {
    const today = new Date().toISOString().split('T')[0];

    const formHtml = `
      <form id="costForm">
        ${Components.createFormField('Cost Name', 'text', 'name', { required: true, placeholder: 'e.g., Rent, Utilities' })}
        ${Components.createFormField('Amount', 'number', 'amount', { required: true, min: 0, step: 0.01, placeholder: '0.00' })}
        ${Components.createFormField('Frequency', 'select', 'frequency', {
      required: true,
      selectOptions: [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' }
      ]
    })}
        ${Components.createFormField('Start Date', 'date', 'startDate', { value: today })}
      </form>
    `;

    Components.showModal('Add Fixed Cost', formHtml, [
      {
        label: 'Add Cost',
        class: 'btn-primary',
        onClick: 'FixedCostsPage.saveCost()'
      }
    ]);
  },

  showEditModal(id) {
    const cost = DataManager.getFixedCosts().find(c => c.id === id);
    if (!cost) return;

    const formHtml = `
      <form id="costForm">
        <input type="hidden" id="costId" value="${id}">
        ${Components.createFormField('Cost Name', 'text', 'name', { required: true, value: cost.name })}
        ${Components.createFormField('Amount', 'number', 'amount', { required: true, min: 0, step: 0.01, value: cost.amount })}
        ${Components.createFormField('Frequency', 'select', 'frequency', {
      required: true,
      value: cost.frequency || 'monthly',
      selectOptions: [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' }
      ]
    })}
        ${Components.createFormField('Start Date', 'date', 'startDate', { value: cost.startDate || new Date().toISOString().split('T')[0] })}
      </form>
    `;

    Components.showModal('Edit Fixed Cost', formHtml, [
      {
        label: 'Save Changes',
        class: 'btn-primary',
        onClick: 'FixedCostsPage.saveCost()'
      }
    ]);
  },

  saveCost() {
    const form = document.getElementById('costForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const costId = document.getElementById('costId')?.value;
    const name = document.getElementById('name').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const frequency = document.getElementById('frequency').value;
    const startDate = document.getElementById('startDate').value;

    const costData = { name, amount, frequency, startDate };

    let result;
    if (costId) {
      result = DataManager.updateFixedCost(costId, costData);
      if (result.success) {
        Components.showToast('Fixed cost updated successfully', 'success');
        Components.closeModal();
        App.navigate('fixed-costs');
      } else {
        Components.showToast(result.errors.join(', '), 'error');
      }
    } else {
      result = DataManager.addFixedCost(costData);
      if (result.success) {
        Components.showToast('Fixed cost added successfully', 'success');
        Components.closeModal();
        App.navigate('fixed-costs');
      } else {
        Components.showToast(result.errors.join(', '), 'error');
      }
    }
  },

  editCost(id) {
    FixedCostsPage.showEditModal(id);
  },

  deleteCost(id) {
    if (confirm('Are you sure you want to delete this fixed cost?')) {
      const result = DataManager.deleteFixedCost(id);

      if (result.success) {
        Components.showToast('Fixed cost deleted successfully', 'success');
        App.navigate('fixed-costs');
      } else {
        Components.showToast(result.errors.join(', '), 'error');
      }
    }
  }
};
