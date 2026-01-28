/**
 * Inventory Module
 * Handles inventory management functionality
 */

// Extend LaundryApp with inventory management methods
Object.assign(LaundryApp.prototype, {
    loadInventory() {
        const tbody = document.querySelector('#inventory-table tbody');
        if (!tbody) return;

        const filteredInventory = this.getFilteredInventory();
        
        tbody.innerHTML = filteredInventory.map(item => {
            const status = this.getInventoryStatus(item);
            return `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${this.capitalizeFirst(item.category)}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit}</td>
                    <td>$${item.cost.toFixed(2)}</td>
                    <td><span class="status-badge status-${status.class}">${status.text}</span></td>
                    <td>${this.formatDate(item.lastUpdated)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon edit" onclick="laundryApp.openInventoryModal('${item.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="laundryApp.adjustInventory('${item.id}')" title="Adjust Stock">
                                <i class="fas fa-plus-minus"></i>
                            </button>
                            <button class="btn-icon delete" onclick="laundryApp.deleteInventoryItem('${item.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    getFilteredInventory() {
        let filtered = [...this.data.inventory];
        
        // Search filter
        const searchTerm = document.getElementById('inventory-search')?.value.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm) ||
                item.id.toLowerCase().includes(searchTerm)
            );
        }
        
        // Category filter
        const categoryFilter = document.getElementById('inventory-category-filter')?.value || 'all';
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category === categoryFilter);
        }
        
        // Status filter
        const statusFilter = document.getElementById('inventory-status-filter')?.value || 'all';
        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => {
                const status = this.getInventoryStatus(item);
                return status.class === statusFilter.replace('-', '');
            });
        }
        
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    },

    getInventoryStatus(item) {
        if (item.quantity === 0) {
            return { class: 'unpaid', text: 'Out of Stock' }; // Reusing unpaid class for red color
        } else if (item.quantity <= item.threshold) {
            return { class: 'partial', text: 'Low Stock' }; // Reusing partial class for yellow color
        } else {
            return { class: 'paid', text: 'In Stock' }; // Reusing paid class for green color
        }
    },

    filterInventory() {
        this.loadInventory();
    },

    resetInventoryForm() {
        const form = document.getElementById('inventory-form');
        if (!form) return;

        form.reset();
        
        // Set default values
        const categorySelect = document.getElementById('inventory-category');
        const thresholdInput = document.getElementById('inventory-threshold');
        
        if (categorySelect) categorySelect.value = 'cleaning';
        if (thresholdInput) thresholdInput.value = '10';

        // Setup form event listeners
        this.setupInventoryFormListeners();
    },

    populateInventoryForm(itemId) {
        const item = this.data.inventory.find(i => i.id === itemId);
        if (!item) return;

        // Populate form fields
        document.getElementById('inventory-name').value = item.name;
        document.getElementById('inventory-category').value = item.category;
        document.getElementById('inventory-quantity').value = item.quantity;
        document.getElementById('inventory-unit').value = item.unit;
        document.getElementById('inventory-cost').value = item.cost.toFixed(2);
        document.getElementById('inventory-threshold').value = item.threshold;
        document.getElementById('inventory-notes').value = item.notes || '';

        this.setupInventoryFormListeners();
    },

    setupInventoryFormListeners() {
        // Save inventory button
        const saveBtn = document.getElementById('save-inventory-btn');
        if (saveBtn) {
            saveBtn.replaceWith(saveBtn.cloneNode(true)); // Remove existing listeners
            document.getElementById('save-inventory-btn').addEventListener('click', () => {
                this.saveInventoryItem();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-inventory-btn');
        if (cancelBtn) {
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
            document.getElementById('cancel-inventory-btn').addEventListener('click', () => {
                this.closeModal(document.getElementById('inventory-modal'));
            });
        }
    },

    saveInventoryItem() {
        const form = document.getElementById('inventory-form');
        if (!form) return;

        // Validate form
        const name = document.getElementById('inventory-name').value.trim();
        const category = document.getElementById('inventory-category').value;
        const quantity = parseInt(document.getElementById('inventory-quantity').value);
        const unit = document.getElementById('inventory-unit').value.trim();
        const cost = parseFloat(document.getElementById('inventory-cost').value);
        const threshold = parseInt(document.getElementById('inventory-threshold').value);
        
        if (!name) {
            alert('Please enter item name');
            return;
        }
        
        if (!unit) {
            alert('Please enter unit');
            return;
        }
        
        if (isNaN(quantity) || quantity < 0) {
            alert('Please enter a valid quantity');
            return;
        }
        
        if (isNaN(cost) || cost < 0) {
            alert('Please enter a valid cost');
            return;
        }
        
        if (isNaN(threshold) || threshold < 1) {
            alert('Please enter a valid threshold (minimum 1)');
            return;
        }

        // Check for duplicate names (excluding current item if editing)
        const modal = document.getElementById('inventory-modal');
        const title = document.getElementById('inventory-modal-title').textContent;
        const isEditing = title === 'Edit Inventory';
        
        const existingItem = this.data.inventory.find(i => 
            i.name.toLowerCase() === name.toLowerCase() && 
            (!isEditing || i.id !== this.getCurrentEditingInventoryId())
        );
        
        if (existingItem) {
            alert('An item with this name already exists');
            return;
        }

        // Collect form data
        const notes = document.getElementById('inventory-notes').value.trim();

        let item;
        if (isEditing) {
            // Find and update existing item
            const itemId = this.getCurrentEditingInventoryId();
            item = this.data.inventory.find(i => i.id === itemId);
            if (item) {
                Object.assign(item, {
                    name,
                    category,
                    quantity,
                    unit,
                    cost,
                    threshold,
                    notes: notes || null,
                    lastUpdated: new Date()
                });
            }
        } else {
            // Create new item
            item = {
                id: this.generateId('INV'),
                name,
                category,
                quantity,
                unit,
                cost,
                threshold,
                notes: notes || null,
                lastUpdated: new Date()
            };
            
            this.data.inventory.push(item);
        }

        // Close modal and refresh
        this.closeModal(modal);
        this.loadInventory();
        this.updateDashboard();

        // Show success message
        this.showNotification(`Inventory item ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
    },

    getCurrentEditingInventoryId() {
        // Simple implementation - in a real app you'd track this better
        const nameInput = document.getElementById('inventory-name');
        const categoryInput = document.getElementById('inventory-category');
        
        if (!nameInput.value || !categoryInput.value) return null;
        
        return this.data.inventory.find(item => 
            item.name === nameInput.value && 
            item.category === categoryInput.value
        )?.id;
    },

    deleteInventoryItem(itemId) {
        if (!confirm('Are you sure you want to delete this inventory item?')) return;

        const itemIndex = this.data.inventory.findIndex(i => i.id === itemId);
        if (itemIndex > -1) {
            this.data.inventory.splice(itemIndex, 1);
            
            this.loadInventory();
            this.updateDashboard();
            this.showNotification('Inventory item deleted successfully!', 'success');
        }
    },

    adjustInventory(itemId) {
        const item = this.data.inventory.find(i => i.id === itemId);
        if (!item) return;

        // Show adjustment modal
        this.showInventoryAdjustmentModal(item);
    },

    showInventoryAdjustmentModal(item) {
        const modalHtml = `
            <div class="modal active" id="inventory-adjustment-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Adjust Inventory - ${item.name}</h3>
                        <button class="close-modal" onclick="laundryApp.closeInventoryAdjustmentModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="current-stock">
                            <p><strong>Current Stock:</strong> ${item.quantity} ${item.unit}</p>
                            <p><strong>Low Stock Threshold:</strong> ${item.threshold} ${item.unit}</p>
                        </div>
                        
                        <div class="adjustment-form">
                            <div class="form-group">
                                <label>Adjustment Type</label>
                                <select id="adjustment-type">
                                    <option value="add">Add Stock</option>
                                    <option value="remove">Remove Stock</option>
                                    <option value="set">Set Exact Amount</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label id="adjustment-quantity-label">Quantity to Add</label>
                                <input type="number" id="adjustment-quantity" min="1" value="1">
                            </div>
                            
                            <div class="form-group">
                                <label>Reason</label>
                                <select id="adjustment-reason">
                                    <option value="restock">Restock</option>
                                    <option value="usage">Usage</option>
                                    <option value="damaged">Damaged/Expired</option>
                                    <option value="correction">Stock Correction</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Notes (Optional)</label>
                                <textarea id="adjustment-notes" placeholder="Additional notes..."></textarea>
                            </div>
                            
                            <div class="new-stock-preview">
                                <p><strong>New Stock Level:</strong> <span id="new-stock-amount">${item.quantity}</span> ${item.unit}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="laundryApp.closeInventoryAdjustmentModal()">Cancel</button>
                        <button class="btn-primary" onclick="laundryApp.saveInventoryAdjustment('${item.id}')">Save Adjustment</button>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('inventory-adjustment-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Setup adjustment form listeners
        this.setupAdjustmentFormListeners(item);
    },

    setupAdjustmentFormListeners(item) {
        const typeSelect = document.getElementById('adjustment-type');
        const quantityInput = document.getElementById('adjustment-quantity');
        const quantityLabel = document.getElementById('adjustment-quantity-label');
        const newStockSpan = document.getElementById('new-stock-amount');
        
        const updatePreview = () => {
            const type = typeSelect.value;
            const quantity = parseInt(quantityInput.value) || 0;
            let newStock = item.quantity;
            
            switch (type) {
                case 'add':
                    newStock = item.quantity + quantity;
                    quantityLabel.textContent = 'Quantity to Add';
                    quantityInput.min = '1';
                    break;
                case 'remove':
                    newStock = Math.max(0, item.quantity - quantity);
                    quantityLabel.textContent = 'Quantity to Remove';
                    quantityInput.min = '1';
                    quantityInput.max = item.quantity.toString();
                    break;
                case 'set':
                    newStock = quantity;
                    quantityLabel.textContent = 'New Stock Level';
                    quantityInput.min = '0';
                    quantityInput.removeAttribute('max');
                    break;
            }
            
            newStockSpan.textContent = newStock;
            
            // Color code the preview
            if (newStock === 0) {
                newStockSpan.style.color = 'var(--danger-color)';
            } else if (newStock <= item.threshold) {
                newStockSpan.style.color = 'var(--warning-color)';
            } else {
                newStockSpan.style.color = 'var(--success-color)';
            }
        };
        
        typeSelect.addEventListener('change', updatePreview);
        quantityInput.addEventListener('input', updatePreview);
        
        // Initial preview update
        updatePreview();
    },

    saveInventoryAdjustment(itemId) {
        const item = this.data.inventory.find(i => i.id === itemId);
        if (!item) return;
        
        const type = document.getElementById('adjustment-type').value;
        const quantity = parseInt(document.getElementById('adjustment-quantity').value) || 0;
        const reason = document.getElementById('adjustment-reason').value;
        const notes = document.getElementById('adjustment-notes').value.trim();
        
        if (quantity <= 0 && type !== 'set') {
            alert('Please enter a valid quantity');
            return;
        }
        
        if (type === 'set' && quantity < 0) {
            alert('Stock level cannot be negative');
            return;
        }
        
        if (type === 'remove' && quantity > item.quantity) {
            alert('Cannot remove more stock than available');
            return;
        }
        
        // Calculate new stock level
        let newStock = item.quantity;
        switch (type) {
            case 'add':
                newStock = item.quantity + quantity;
                break;
            case 'remove':
                newStock = Math.max(0, item.quantity - quantity);
                break;
            case 'set':
                newStock = quantity;
                break;
        }
        
        // Update item
        const oldQuantity = item.quantity;
        item.quantity = newStock;
        item.lastUpdated = new Date();
        
        // Add to notes if provided
        if (notes) {
            const timestamp = new Date().toLocaleString();
            const adjustmentNote = `[${timestamp}] ${reason}: ${type} ${quantity} (${oldQuantity} → ${newStock}) - ${notes}`;
            item.notes = item.notes ? `${item.notes}\n${adjustmentNote}` : adjustmentNote;
        }
        
        // Close modal and refresh
        this.closeInventoryAdjustmentModal();
        this.loadInventory();
        this.updateDashboard();
        
        // Show success message
        this.showNotification(`Inventory adjusted: ${item.name} stock updated to ${newStock} ${item.unit}`, 'success');
    },

    closeInventoryAdjustmentModal() {
        const modal = document.getElementById('inventory-adjustment-modal');
        if (modal) {
            modal.remove();
        }
    }
});
