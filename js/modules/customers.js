/**
 * Customers Module
 * Handles customer management functionality
 */

// Extend LaundryApp with customer management methods
Object.assign(LaundryApp.prototype, {
    loadCustomers() {
        const tbody = document.querySelector('#customers-table tbody');
        if (!tbody) return;

        const filteredCustomers = this.getFilteredCustomers();
        
        tbody.innerHTML = filteredCustomers.map(customer => `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.email || 'N/A'}</td>
                <td>${customer.totalOrders}</td>
                <td>$${customer.totalSpent.toFixed(2)}</td>
                <td><span class="status-badge status-${customer.status}">${this.capitalizeFirst(customer.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="laundryApp.openCustomerModal('${customer.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="laundryApp.viewCustomerDetails('${customer.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon delete" onclick="laundryApp.deleteCustomer('${customer.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    getFilteredCustomers() {
        let filtered = [...this.data.customers];
        
        // Search filter
        const searchTerm = document.getElementById('customer-search')?.value.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(customer => 
                customer.name.toLowerCase().includes(searchTerm) ||
                customer.phone.toLowerCase().includes(searchTerm) ||
                customer.email?.toLowerCase().includes(searchTerm) ||
                customer.id.toLowerCase().includes(searchTerm)
            );
        }
        
        // Status filter
        const statusFilter = document.getElementById('customer-filter')?.value || 'all';
        if (statusFilter !== 'all') {
            filtered = filtered.filter(customer => customer.status === statusFilter);
        }
        
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    },

    filterCustomers() {
        this.loadCustomers();
    },

    resetCustomerForm() {
        const form = document.getElementById('customer-form');
        if (!form) return;

        form.reset();
        
        // Set default status
        const statusSelect = document.getElementById('customer-status');
        if (statusSelect) {
            statusSelect.value = 'active';
        }

        // Setup form event listeners
        this.setupCustomerFormListeners();
    },

    populateCustomerForm(customerId) {
        const customer = this.data.customers.find(c => c.id === customerId);
        if (!customer) return;

        // Populate form fields
        document.getElementById('customer-name').value = customer.name;
        document.getElementById('customer-phone').value = customer.phone;
        document.getElementById('customer-email').value = customer.email || '';
        document.getElementById('customer-status').value = customer.status;
        document.getElementById('customer-address').value = customer.address || '';
        document.getElementById('customer-notes').value = customer.notes || '';

        this.setupCustomerFormListeners();
    },

    setupCustomerFormListeners() {
        // Save customer button
        const saveBtn = document.getElementById('save-customer-btn');
        if (saveBtn) {
            saveBtn.replaceWith(saveBtn.cloneNode(true)); // Remove existing listeners
            document.getElementById('save-customer-btn').addEventListener('click', () => {
                this.saveCustomer();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-customer-btn');
        if (cancelBtn) {
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
            document.getElementById('cancel-customer-btn').addEventListener('click', () => {
                this.closeModal(document.getElementById('customer-modal'));
            });
        }

        // Phone number formatting
        const phoneInput = document.getElementById('customer-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }
    },

    formatPhoneNumber(input) {
        // Simple phone number formatting (US format)
        let value = input.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        
        input.value = value;
    },

    saveCustomer() {
        const form = document.getElementById('customer-form');
        if (!form) return;

        // Validate form
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        
        if (!name) {
            alert('Please enter customer name');
            return;
        }
        
        if (!phone) {
            alert('Please enter phone number');
            return;
        }

        // Check for duplicate phone numbers (excluding current customer if editing)
        const modal = document.getElementById('customer-modal');
        const title = document.getElementById('customer-modal-title').textContent;
        const isEditing = title === 'Edit Customer';
        
        const existingCustomer = this.data.customers.find(c => 
            c.phone === phone && (!isEditing || c.id !== this.getCurrentEditingCustomerId())
        );
        
        if (existingCustomer) {
            alert('A customer with this phone number already exists');
            return;
        }

        // Collect form data
        const email = document.getElementById('customer-email').value.trim();
        const status = document.getElementById('customer-status').value;
        const address = document.getElementById('customer-address').value.trim();
        const notes = document.getElementById('customer-notes').value.trim();

        let customer;
        if (isEditing) {
            // Find and update existing customer
            const customerId = this.getCurrentEditingCustomerId();
            customer = this.data.customers.find(c => c.id === customerId);
            if (customer) {
                Object.assign(customer, {
                    name,
                    phone,
                    email: email || null,
                    status,
                    address: address || null,
                    notes: notes || null
                });
            }
        } else {
            // Create new customer
            customer = {
                id: this.generateId('CUST'),
                name,
                phone,
                email: email || null,
                status,
                address: address || null,
                notes: notes || null,
                totalOrders: 0,
                totalSpent: 0.00
            };
            
            this.data.customers.push(customer);
        }

        // Close modal and refresh
        this.closeModal(modal);
        this.loadCustomers();
        this.updateDashboard();

        // Show success message
        this.showNotification(`Customer ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
    },

    getCurrentEditingCustomerId() {
        // Simple implementation - in a real app you'd track this better
        const nameInput = document.getElementById('customer-name');
        const phoneInput = document.getElementById('customer-phone');
        
        if (!nameInput.value || !phoneInput.value) return null;
        
        return this.data.customers.find(customer => 
            customer.name === nameInput.value && 
            customer.phone === phoneInput.value
        )?.id;
    },

    deleteCustomer(customerId) {
        const customer = this.data.customers.find(c => c.id === customerId);
        if (!customer) return;

        // Check if customer has orders
        const customerOrders = this.data.orders.filter(o => o.customerId === customerId);
        if (customerOrders.length > 0) {
            if (!confirm(`This customer has ${customerOrders.length} order(s). Deleting the customer will also delete all their orders. Are you sure?`)) {
                return;
            }
            
            // Delete customer orders
            this.data.orders = this.data.orders.filter(o => o.customerId !== customerId);
        } else {
            if (!confirm('Are you sure you want to delete this customer?')) return;
        }

        // Delete customer
        const customerIndex = this.data.customers.findIndex(c => c.id === customerId);
        if (customerIndex > -1) {
            this.data.customers.splice(customerIndex, 1);
            
            this.loadCustomers();
            this.updateDashboard();
            this.showNotification('Customer deleted successfully!', 'success');
        }
    },

    viewCustomerDetails(customerId) {
        const customer = this.data.customers.find(c => c.id === customerId);
        if (!customer) return;

        const customerOrders = this.data.orders.filter(o => o.customerId === customerId);
        
        // Create and show customer details modal
        this.showCustomerDetailsModal(customer, customerOrders);
    },

    showCustomerDetailsModal(customer, orders) {
        // Create modal HTML
        const modalHtml = `
            <div class="modal active" id="customer-details-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Customer Details</h3>
                        <button class="close-modal" onclick="laundryApp.closeCustomerDetailsModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="customer-info">
                            <div class="info-section">
                                <h4>Contact Information</h4>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <label>Name:</label>
                                        <span>${customer.name}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Phone:</label>
                                        <span>${customer.phone}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Email:</label>
                                        <span>${customer.email || 'N/A'}</span>
                                    </div>
                                    <div class="info-item">
                                        <label>Status:</label>
                                        <span class="status-badge status-${customer.status}">${this.capitalizeFirst(customer.status)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            ${customer.address ? `
                                <div class="info-section">
                                    <h4>Address</h4>
                                    <p>${customer.address}</p>
                                </div>
                            ` : ''}
                            
                            <div class="info-section">
                                <h4>Statistics</h4>
                                <div class="stats-grid">
                                    <div class="stat-item">
                                        <span class="stat-value">${customer.totalOrders}</span>
                                        <span class="stat-label">Total Orders</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-value">$${customer.totalSpent.toFixed(2)}</span>
                                        <span class="stat-label">Total Spent</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-value">$${customer.totalOrders > 0 ? (customer.totalSpent / customer.totalOrders).toFixed(2) : '0.00'}</span>
                                        <span class="stat-label">Avg Order Value</span>
                                    </div>
                                </div>
                            </div>
                            
                            ${customer.notes ? `
                                <div class="info-section">
                                    <h4>Notes</h4>
                                    <p>${customer.notes}</p>
                                </div>
                            ` : ''}
                            
                            <div class="info-section">
                                <h4>Order History</h4>
                                ${orders.length > 0 ? `
                                    <div class="orders-list">
                                        ${orders.slice(0, 5).map(order => `
                                            <div class="order-item">
                                                <div class="order-info">
                                                    <span class="order-id">${order.id}</span>
                                                    <span class="order-date">${this.formatDate(order.dropOffDate)}</span>
                                                </div>
                                                <div class="order-status">
                                                    <span class="status-badge status-${order.status}">${this.capitalizeFirst(order.status)}</span>
                                                    <span class="order-total">$${order.total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        `).join('')}
                                        ${orders.length > 5 ? `<p class="more-orders">... and ${orders.length - 5} more orders</p>` : ''}
                                    </div>
                                ` : '<p>No orders found for this customer.</p>'}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="laundryApp.closeCustomerDetailsModal()">Close</button>
                        <button class="btn-primary" onclick="laundryApp.openOrderModal(); laundryApp.closeCustomerDetailsModal(); document.getElementById('customer-select').value='${customer.id}';">New Order</button>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing customer details modal if any
        const existingModal = document.getElementById('customer-details-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Add styles for customer details modal
        this.addCustomerDetailsStyles();
    },

    closeCustomerDetailsModal() {
        const modal = document.getElementById('customer-details-modal');
        if (modal) {
            modal.remove();
        }
    },

    addCustomerDetailsStyles() {
        // Check if styles already added
        if (document.getElementById('customer-details-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'customer-details-styles';
        style.textContent = `
            .customer-info {
                max-height: 70vh;
                overflow-y: auto;
            }
            
            .info-section {
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }
            
            .info-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .info-section h4 {
                margin-bottom: 0.75rem;
                color: var(--gray-700);
                font-size: var(--font-size-lg);
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 0.75rem;
            }
            
            .info-item {
                display: flex;
                flex-direction: column;
            }
            
            .info-item label {
                font-size: var(--font-size-sm);
                font-weight: 500;
                color: var(--gray-500);
                margin-bottom: 0.25rem;
            }
            
            .info-item span {
                font-size: var(--font-size-base);
                color: var(--gray-800);
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 1rem;
            }
            
            .stat-item {
                text-align: center;
                padding: 1rem;
                background-color: var(--gray-50);
                border-radius: var(--border-radius);
            }
            
            .stat-value {
                display: block;
                font-size: var(--font-size-xl);
                font-weight: 700;
                color: var(--primary-color);
                margin-bottom: 0.25rem;
            }
            
            .stat-label {
                font-size: var(--font-size-sm);
                color: var(--gray-600);
            }
            
            .orders-list {
                max-height: 200px;
                overflow-y: auto;
            }
            
            .order-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                background-color: var(--gray-50);
                border-radius: var(--border-radius);
            }
            
            .order-info {
                display: flex;
                flex-direction: column;
            }
            
            .order-id {
                font-weight: 500;
                color: var(--gray-800);
            }
            
            .order-date {
                font-size: var(--font-size-sm);
                color: var(--gray-500);
            }
            
            .order-status {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }
            
            .order-total {
                font-weight: 500;
                color: var(--gray-800);
                margin-top: 0.25rem;
            }
            
            .more-orders {
                text-align: center;
                color: var(--gray-500);
                font-style: italic;
                margin-top: 0.5rem;
            }
        `;
        
        document.head.appendChild(style);
    }
});
