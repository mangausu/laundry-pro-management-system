/**
 * Orders Module
 * Handles order management functionality
 */

// Service pricing data
const SERVICE_PRICES = {
    'Shirt': { wash: 3.00, dryClean: 5.00, iron: 2.00 },
    'Pants': { wash: 4.00, dryClean: 6.00, iron: 2.00 },
    'Dress': { wash: 6.00, dryClean: 8.00, iron: 3.00 },
    'Suit': { wash: 0.00, dryClean: 12.00, iron: 5.00 },
    'Bedsheet': { wash: 5.00, dryClean: 8.00, iron: 3.00 },
    'Towel': { wash: 2.50, dryClean: 4.00, iron: 1.50 },
    'Jacket': { wash: 7.00, dryClean: 10.00, iron: 4.00 },
    'Skirt': { wash: 4.50, dryClean: 7.00, iron: 2.50 }
};

// Extend LaundryApp with order management methods
Object.assign(LaundryApp.prototype, {
    loadOrders() {
        const tbody = document.querySelector('#orders-table tbody');
        if (!tbody) return;

        const filteredOrders = this.getFilteredOrders();
        
        tbody.innerHTML = filteredOrders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customerName}</td>
                <td>${order.items.length} item(s)</td>
                <td>${this.formatDate(order.dropOffDate)}</td>
                <td>${order.pickupDate ? this.formatDate(order.pickupDate) : 'TBD'}</td>
                <td><span class="status-badge status-${order.status}">${this.capitalizeFirst(order.status)}</span></td>
                <td>$${order.total.toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="laundryApp.openOrderModal('${order.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="laundryApp.updateOrderStatus('${order.id}')" title="Update Status">
                            <i class="fas fa-sync"></i>
                        </button>
                        <button class="btn-icon delete" onclick="laundryApp.deleteOrder('${order.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    getFilteredOrders() {
        let filtered = [...this.data.orders];
        
        // Search filter
        const searchTerm = document.getElementById('order-search')?.value.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(order => 
                order.id.toLowerCase().includes(searchTerm) ||
                order.customerName.toLowerCase().includes(searchTerm)
            );
        }
        
        // Status filter
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }
        
        // Date filter
        const dateFilter = document.getElementById('date-filter')?.value || 'all';
        if (dateFilter !== 'all') {
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.dropOffDate);
                
                switch (dateFilter) {
                    case 'today':
                        return orderDate >= startOfToday;
                    case 'week':
                        const weekAgo = new Date(startOfToday);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return orderDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(startOfToday);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return orderDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        return filtered.sort((a, b) => new Date(b.dropOffDate) - new Date(a.dropOffDate));
    },

    filterOrders() {
        this.loadOrders();
    },

    populateCustomerSelect() {
        const select = document.getElementById('customer-select');
        if (!select) return;

        select.innerHTML = '<option value="">Select Customer</option>' +
            this.data.customers.map(customer => 
                `<option value="${customer.id}">${customer.name}</option>`
            ).join('');
    },

    resetOrderForm() {
        const form = document.getElementById('order-form');
        if (!form) return;

        form.reset();
        
        // Clear items container
        const itemsContainer = document.getElementById('order-items-container');
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
        }
        
        // Reset summary
        this.updateOrderSummary();
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const dropoffDate = document.getElementById('dropoff-date');
        const pickupDate = document.getElementById('pickup-date');
        
        if (dropoffDate) dropoffDate.value = today;
        if (pickupDate) {
            const pickup = new Date();
            pickup.setDate(pickup.getDate() + 3); // Default 3 days later
            pickupDate.value = pickup.toISOString().split('T')[0];
        }

        // Setup form event listeners
        this.setupOrderFormListeners();
    },

    populateOrderForm(orderId) {
        const order = this.data.orders.find(o => o.id === orderId);
        if (!order) return;

        // Populate basic fields
        document.getElementById('customer-select').value = order.customerId;
        document.getElementById('dropoff-date').value = order.dropOffDate.toISOString().split('T')[0];
        document.getElementById('pickup-date').value = order.pickupDate ? order.pickupDate.toISOString().split('T')[0] : '';
        document.getElementById('order-notes').value = order.notes || '';

        // Populate items
        const itemsContainer = document.getElementById('order-items-container');
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
            order.items.forEach(item => {
                this.addOrderItem(item);
            });
        }

        this.updateOrderSummary();
        this.setupOrderFormListeners();
    },

    setupOrderFormListeners() {
        // Add item button
        const addItemBtn = document.getElementById('add-item-btn');
        if (addItemBtn) {
            addItemBtn.replaceWith(addItemBtn.cloneNode(true)); // Remove existing listeners
            document.getElementById('add-item-btn').addEventListener('click', () => {
                this.addOrderItem();
            });
        }

        // Save order button
        const saveBtn = document.getElementById('save-order-btn');
        if (saveBtn) {
            saveBtn.replaceWith(saveBtn.cloneNode(true));
            document.getElementById('save-order-btn').addEventListener('click', () => {
                this.saveOrder();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-order-btn');
        if (cancelBtn) {
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
            document.getElementById('cancel-order-btn').addEventListener('click', () => {
                this.closeModal(document.getElementById('order-modal'));
            });
        }
    },

    addOrderItem(existingItem = null) {
        const container = document.getElementById('order-items-container');
        if (!container) return;

        const itemId = existingItem?.id || this.generateId('ITEM');
        const itemType = existingItem?.type || Object.keys(SERVICE_PRICES)[0];
        const serviceType = existingItem?.serviceType || 'wash';
        const quantity = existingItem?.quantity || 1;
        const price = existingItem?.price || SERVICE_PRICES[itemType][serviceType];

        const itemRow = document.createElement('div');
        itemRow.className = 'order-item-row';
        itemRow.dataset.itemId = itemId;
        
        itemRow.innerHTML = `
            <select class="item-type" onchange="laundryApp.updateItemPrice(this)">
                ${Object.keys(SERVICE_PRICES).map(type => 
                    `<option value="${type}" ${type === itemType ? 'selected' : ''}>${type}</option>`
                ).join('')}
            </select>
            
            <select class="service-type" onchange="laundryApp.updateItemPrice(this)">
                <option value="wash" ${serviceType === 'wash' ? 'selected' : ''}>Wash</option>
                <option value="dryClean" ${serviceType === 'dryClean' ? 'selected' : ''}>Dry Clean</option>
                <option value="iron" ${serviceType === 'iron' ? 'selected' : ''}>Iron</option>
            </select>
            
            <input type="number" class="item-quantity" value="${quantity}" min="1" onchange="laundryApp.updateOrderSummary()">
            
            <input type="number" class="item-price" value="${price.toFixed(2)}" step="0.01" min="0" onchange="laundryApp.updateOrderSummary()" readonly>
            
            <button type="button" onclick="laundryApp.removeOrderItem('${itemId}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(itemRow);
        this.updateOrderSummary();
    },

    removeOrderItem(itemId) {
        const itemRow = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemRow) {
            itemRow.remove();
            this.updateOrderSummary();
        }
    },

    updateItemPrice(selectElement) {
        const itemRow = selectElement.closest('.order-item-row');
        const itemType = itemRow.querySelector('.item-type').value;
        const serviceType = itemRow.querySelector('.service-type').value;
        const priceInput = itemRow.querySelector('.item-price');
        
        const price = SERVICE_PRICES[itemType][serviceType];
        priceInput.value = price.toFixed(2);
        
        this.updateOrderSummary();
    },

    updateOrderSummary() {
        const itemRows = document.querySelectorAll('.order-item-row');
        let subtotal = 0;

        itemRows.forEach(row => {
            const quantity = parseInt(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            subtotal += quantity * price;
        });

        const tax = subtotal * this.data.settings.taxRate;
        const total = subtotal + tax;

        // Update summary display
        const subtotalEl = document.getElementById('order-subtotal');
        const taxEl = document.getElementById('order-tax');
        const totalEl = document.getElementById('order-total');

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    },

    saveOrder() {
        const form = document.getElementById('order-form');
        if (!form) return;

        // Validate form
        const customerId = document.getElementById('customer-select').value;
        const dropoffDate = document.getElementById('dropoff-date').value;
        
        if (!customerId) {
            alert('Please select a customer');
            return;
        }
        
        if (!dropoffDate) {
            alert('Please select a drop-off date');
            return;
        }

        const itemRows = document.querySelectorAll('.order-item-row');
        if (itemRows.length === 0) {
            alert('Please add at least one item');
            return;
        }

        // Collect form data
        const customer = this.data.customers.find(c => c.id === customerId);
        const pickupDate = document.getElementById('pickup-date').value;
        const notes = document.getElementById('order-notes').value;

        // Collect items
        const items = Array.from(itemRows).map(row => ({
            id: row.dataset.itemId,
            type: row.querySelector('.item-type').value,
            serviceType: row.querySelector('.service-type').value,
            quantity: parseInt(row.querySelector('.item-quantity').value),
            price: parseFloat(row.querySelector('.item-price').value)
        }));

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const tax = subtotal * this.data.settings.taxRate;
        const total = subtotal + tax;

        // Check if editing existing order
        const modal = document.getElementById('order-modal');
        const title = document.getElementById('order-modal-title').textContent;
        const isEditing = title === 'Edit Order';

        let order;
        if (isEditing) {
            // Find and update existing order
            const orderId = this.getCurrentEditingOrderId(); // You'll need to track this
            order = this.data.orders.find(o => o.id === orderId);
            if (order) {
                Object.assign(order, {
                    customerId,
                    customerName: customer.name,
                    items,
                    dropOffDate: new Date(dropoffDate),
                    pickupDate: pickupDate ? new Date(pickupDate) : null,
                    subtotal,
                    tax,
                    total,
                    notes
                });
            }
        } else {
            // Create new order
            order = {
                id: this.generateId('ORD'),
                customerId,
                customerName: customer.name,
                items,
                status: 'pending',
                dropOffDate: new Date(dropoffDate),
                pickupDate: pickupDate ? new Date(pickupDate) : null,
                subtotal,
                tax,
                total,
                notes
            };
            
            this.data.orders.unshift(order);
        }

        // Update customer statistics
        this.updateCustomerStats(customerId);

        // Close modal and refresh
        this.closeModal(modal);
        this.loadOrders();
        this.updateDashboard();

        // Show success message
        this.showNotification(`Order ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
    },

    updateCustomerStats(customerId) {
        const customer = this.data.customers.find(c => c.id === customerId);
        if (!customer) return;

        const customerOrders = this.data.orders.filter(o => o.customerId === customerId);
        customer.totalOrders = customerOrders.length;
        customer.totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
    },

    updateOrderStatus(orderId) {
        const order = this.data.orders.find(o => o.id === orderId);
        if (!order) return;

        const statusOptions = ['pending', 'processing', 'ready', 'delivered'];
        const currentIndex = statusOptions.indexOf(order.status);
        const nextIndex = (currentIndex + 1) % statusOptions.length;
        
        order.status = statusOptions[nextIndex];
        
        // If status is ready and no pickup date set, set it to tomorrow
        if (order.status === 'ready' && !order.pickupDate) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            order.pickupDate = tomorrow;
        }

        this.loadOrders();
        this.updateDashboard();
        this.showNotification(`Order ${orderId} status updated to ${order.status}`, 'success');
    },

    deleteOrder(orderId) {
        if (!confirm('Are you sure you want to delete this order?')) return;

        const orderIndex = this.data.orders.findIndex(o => o.id === orderId);
        if (orderIndex > -1) {
            const order = this.data.orders[orderIndex];
            this.data.orders.splice(orderIndex, 1);
            
            // Update customer stats
            this.updateCustomerStats(order.customerId);
            
            this.loadOrders();
            this.updateDashboard();
            this.showNotification('Order deleted successfully!', 'success');
        }
    },

    getCurrentEditingOrderId() {
        // This is a simple implementation - in a real app you'd track this better
        const customerSelect = document.getElementById('customer-select');
        const dropoffDate = document.getElementById('dropoff-date').value;
        
        if (!customerSelect.value || !dropoffDate) return null;
        
        return this.data.orders.find(order => 
            order.customerId === customerSelect.value && 
            order.dropOffDate.toISOString().split('T')[0] === dropoffDate
        )?.id;
    },

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 6px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
