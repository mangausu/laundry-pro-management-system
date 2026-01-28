/**
 * Laundry Management System
 * Main Application JavaScript
 */
    
class LaundryApp {

    
    constructor() {
        this.currentPage = 'dashboard';
        this.data = {
            orders: [],
            customers: [],
            invoices: [],
            inventory: [],
            settings: {
                taxRate: 0.10,
                currency: 'USD'
            }
        };
        
        this.init();
    }

    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.showPage('dashboard');
        this.updateDashboard();
    }

    loadSampleData() {
        // Sample customers
        this.data.customers = [
            {
                id: 'CUST002',
                name: 'Eric Ahiadoglo',
                phone: '+233 243-125-473',
                email: 'eric@email.com',
                address: 'Com25 Main St,Tema',
                status: 'active',
                totalOrders: 3,
                totalSpent: 116.00,
                notes: 'Regular customer, prefers pickup on weekends'
            },
            {
                id: 'CUST003',
                name: 'Janet Kumah',
                phone: '+233 555-012-324',
                email: 'janetkumah@email.com',
                address: 'Ridge Ave Road, Accra',
                status: 'vip',
                totalOrders: 2,
                totalSpent: 89.0,
                notes: 'VIP customer, 10% discount applied'
            },
            {
                id: 'CUST001',
                name: 'Abdul Rauf',
                phone: '+233 515-654-987',
                email: 'abdulrauf@email.com',
                address: 'Nima-Accra',
                status: 'active',
                totalOrders: 8,
                totalSpent: 240.25,
                notes: 'New customer, referred by Janet Kumah'
            }
        ];

        // Sample orders
        this.data.orders = [
            {
                id: 'ORD002',
                customerId: 'CUST002',
                customerName: 'Eric Ahiadoglo',
                items: [
                    { id: 'ITEM001', type: 'Shirt', serviceType: 'wash', quantity: 3, price: 3.00 },
                    { id: 'ITEM002', type: 'Pants', serviceType: 'dryClean', quantity: 2, price: 6.00 }
                ],
                status: 'processing',
                dropOffDate: new Date('2025-08-04'),
                pickupDate: new Date('2025-08-07'),
                subtotal: 21.00,
                tax: 2.10,
                total: 23.10,
                notes: 'Handle with care - delicate fabric'
            },
            {
                id: 'ORD003',
                customerId: 'CUST003',
                customerName: 'Janet Kumah',
                items: [
                    { id: 'ITEM003', type: 'Dress', serviceType: 'dryClean', quantity: 1, price: 8.00 },
                    { id: 'ITEM004', type: 'Suit', serviceType: 'dryClean', quantity: 1, price: 12.00 }
                ],
                status: 'ready',
                dropOffDate: new Date('2025-08-03'),
                pickupDate: new Date('2025-08-06'),
                subtotal: 20.00,
                tax: 2.00,
                total: 22.00,
                notes: 'VIP customer - priority service'
            },
            {
                id: 'ORD001',
                customerId: 'CUST001',
                customerName: 'Abdul Rauf',
                items: [
                    { id: 'ITEM005', type: 'Bedsheet', serviceType: 'wash', quantity: 2, price: 5.00 }
                ],
                status: 'pending',
                dropOffDate: new Date('2025-08-05'),
                pickupDate: new Date('2025-08-08'),
                subtotal: 10.00,
                tax: 1.00,
                total: 11.00,
                notes: 'Standard wash and fold'
            }
        ];

        // Sample inventory
        this.data.inventory = [
            {
                id: 'INV001',
                name: 'Laundry Detergent',
                category: 'cleaning',
                quantity: 25,
                unit: 'bottles',
                cost: 12.50,
                threshold: 10,
                lastUpdated: new Date(),
                notes: 'Premium brand detergent'
            },
            {
                id: 'INV002',
                name: 'Fabric Softener',
                category: 'cleaning',
                quantity: 8,
                unit: 'bottles',
                cost: 8.75,
                threshold: 15,
                lastUpdated: new Date(),
                notes: 'Low stock - reorder soon'
            },
            {
                id: 'INV003',
                name: 'Dry Cleaning Solvent',
                category: 'chemicals',
                quantity: 3,
                unit: 'gallons',
                cost: 45.00,
                threshold: 5,
                lastUpdated: new Date(),
                notes: 'Critical stock level'
            },
            {
                id: 'INV004',
                name: 'Hangers',
                category: 'equipment',
                quantity: 150,
                unit: 'pieces',
                cost: 0.50,
                threshold: 50,
                lastUpdated: new Date(),
                notes: 'Plastic hangers for shirts'
            }
        ];

        // Sample invoices
        this.data.invoices = [
            {
                id: 'INV001',
                customerId: 'CUST001',
                customerName: 'Eric Ahiadoglo',
                date: new Date('2025-08-01'),
                dueDate: new Date('2025-08-15'),
                items: [
                    { description: 'Laundry Service - July', quantity: 1, price: 45.50 }
                ],
                subtotal: 45.50,
                tax: 4.55,
                total: 50.05,
                status: 'paid',
                notes: 'Monthly service package'
            },
            {
                id: 'INV002',
                customerId: 'CUST002',
                customerName: 'Janet Kumah',
                date: new Date('2025-08-02'),
                dueDate: new Date('2025-08-16'),
                items: [
                    { description: 'Dry Cleaning Service', quantity: 1, price: 35.00 }
                ],
                subtotal: 35.00,
                tax: 3.50,
                total: 38.50,
                status: 'unpaid',
                notes: 'VIP discount applied'
            }
        ];
    }
    

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.showPage(page);
            });
        });

        // View all links
        document.querySelectorAll('.view-all').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.showPage(page);
            });
        });

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Modal background clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });


        // New order button
        document.getElementById('new-order-btn')?.addEventListener('click', () => {
            this.openOrderModal();
        });

        // New customer button
        document.getElementById('new-customer-btn')?.addEventListener('click', () => {
            this.openCustomerModal();
        });

        // New invoice button
        document.getElementById('new-invoice-btn')?.addEventListener('click', () => {
            this.openInvoiceModal();
        });

        // New inventory button
        document.getElementById('new-inventory-btn')?.addEventListener('click', () => {
            this.openInventoryModal();
        });

        // Search functionality
        this.setupSearchListeners();

        // Filter functionality
        this.setupFilterListeners();
    }

    setupSearchListeners() {
        const searchInputs = [
            { input: '#order-search', handler: () => this.filterOrders() },
            { input: '#customer-search', handler: () => this.filterCustomers() },
            { input: '#invoice-search', handler: () => this.filterInvoices() },
            { input: '#inventory-search', handler: () => this.filterInventory() }
        ];

        searchInputs.forEach(({ input, handler }) => {
            const element = document.querySelector(input);
            if (element) {
                element.addEventListener('input', handler);
            }
        });
    }

    setupFilterListeners() {
        const filters = [
            { filter: '#status-filter', handler: () => this.filterOrders() },
            { filter: '#date-filter', handler: () => this.filterOrders() },
            { filter: '#customer-filter', handler: () => this.filterCustomers() },
            { filter: '#payment-status-filter', handler: () => this.filterInvoices() },
            { filter: '#invoice-date-filter', handler: () => this.filterInvoices() },
            { filter: '#inventory-category-filter', handler: () => this.filterInventory() },
            { filter: '#inventory-status-filter', handler: () => this.filterInventory() }
        ];

        filters.forEach(({ filter, handler }) => {
            const element = document.querySelector(filter);
            if (element) {
                element.addEventListener('change', handler);
            }
        });
    }

    showPage(pageId) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');

        // Update page content
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(`${pageId}-page`)?.classList.add('active');

        this.currentPage = pageId;

        // Load page-specific data
        switch (pageId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'customers':
                this.loadCustomers();
                break;
            case 'billing':
                this.loadInvoices();
                break;
            case 'inventory':
                this.loadInventory();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    updateDashboard() {
        // Update statistics
        document.getElementById('total-orders').textContent = this.data.orders.length;
        document.getElementById('total-customers').textContent = this.data.customers.length;
        
        const totalRevenue = this.data.orders.reduce((sum, order) => sum + order.total, 0);
        document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
        
        const avgTime = this.calculateAverageProcessingTime();
        document.getElementById('avg-time').textContent = `${avgTime} hrs`;

        // Load recent orders
        this.loadRecentOrders();
        
        // Load inventory status
        this.loadInventoryStatus();
        
        // Load upcoming pickups
        this.loadUpcomingPickups();
    }

    calculateAverageProcessingTime() {
        const completedOrders = this.data.orders.filter(order => 
            order.status === 'ready' || order.status === 'delivered'
        );
        
        if (completedOrders.length === 0) return 0;
        
        const totalHours = completedOrders.reduce((sum, order) => {
            const dropOff = new Date(order.dropOffDate);
            const pickup = new Date(order.pickupDate);
            const hours = (pickup - dropOff) / (1000 * 60 * 60);
            return sum + hours;
        }, 0);
        
        return Math.round(totalHours / completedOrders.length);
    }

    loadRecentOrders() {
        const tbody = document.querySelector('#recent-orders-table tbody');
        if (!tbody) return;

        const recentOrders = this.data.orders.slice(0, 5);
        tbody.innerHTML = recentOrders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customerName}</td>
                <td><span class="status-badge status-${order.status}">${this.capitalizeFirst(order.status)}</span></td>
                <td>$${order.total.toFixed(2)}</td>
            </tr>
        `).join('');
    }

    loadInventoryStatus() {
        const container = document.getElementById('inventory-status-items');
        if (!container) return;

        const lowStockItems = this.data.inventory.filter(item => 
            item.quantity <= item.threshold
        ).slice(0, 4);

        container.innerHTML = lowStockItems.map(item => {
            const status = item.quantity === 0 ? 'out' : 'low';
            return `
                <div class="inventory-item ${status}">
                    <div class="inventory-item-name">${item.name}</div>
                    <div class="inventory-item-quantity">${item.quantity} ${item.unit}</div>
                </div>
            `;
        }).join('');
    }

    loadUpcomingPickups() {
        const list = document.getElementById('upcoming-pickups-list');
        if (!list) return;

        const upcomingOrders = this.data.orders
            .filter(order => order.status === 'ready')
            .slice(0, 5);

        list.innerHTML = upcomingOrders.map(order => `
            <li class="pickup-item">
                <div>
                    <div class="pickup-customer">${order.customerName}</div>
                    <div class="pickup-date">${this.formatDate(order.pickupDate)}</div>
                </div>
                <div class="pickup-status ready">Ready</div>
            </li>
        `).join('');
    }

    // Modal functions
    openOrderModal(orderId = null) {
        const modal = document.getElementById('order-modal');
        const title = document.getElementById('order-modal-title');
        
        if (orderId) {
            title.textContent = 'Edit Order';
            this.populateOrderForm(orderId);
        } else {
            title.textContent = 'New Order';
            this.resetOrderForm();
        }
        
        this.populateCustomerSelect();
        modal.classList.add('active');
    }

    openCustomerModal(customerId = null) {
        const modal = document.getElementById('customer-modal');
        const title = document.getElementById('customer-modal-title');
        
        if (customerId) {
            title.textContent = 'Edit Customer';
            this.populateCustomerForm(customerId);
        } else {
            title.textContent = 'New Customer';
            this.resetCustomerForm();
        }
        
        modal.classList.add('active');
    }

    openInvoiceModal(invoiceId = null) {
        const modal = document.getElementById('invoice-modal');
        const title = document.getElementById('invoice-modal-title');
        
        if (invoiceId) {
            title.textContent = 'Edit Invoice';
            this.populateInvoiceForm(invoiceId);
        } else {
            title.textContent = 'New Invoice';
            this.resetInvoiceForm();
        }
        
        modal.classList.add('active');
    }

    openInventoryModal(itemId = null) {
        const modal = document.getElementById('inventory-modal');
        const title = document.getElementById('inventory-modal-title');
        
        if (itemId) {
            title.textContent = 'Edit Inventory';
            this.populateInventoryForm(itemId);
        } else {
            title.textContent = 'Add Inventory';
            this.resetInventoryForm();
        }
        
        modal.classList.add('active');
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }

    // Utility functions
    formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString();
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    generateId(prefix) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}${timestamp}${random}`.toUpperCase();
    }

    // Reports functionality
    loadReports() {
        this.updateReportsData();
        this.renderRevenueChart();
        this.renderOrderStatusChart();
        this.loadTopCustomers();
        this.loadInventoryAlerts();
    }

    updateReportsData() {
        // Calculate date ranges
        const today = new Date();
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const thisYear = new Date(today.getFullYear(), 0, 1);

        // Calculate metrics
        const thisMonthOrders = this.data.orders.filter(order => 
            new Date(order.dropOffDate) >= thisMonth
        );
        const lastMonthOrders = this.data.orders.filter(order => 
            new Date(order.dropOffDate) >= lastMonth && new Date(order.dropOffDate) < thisMonth
        );

        const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + order.total, 0);
        const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.total, 0);
        const revenueGrowth = lastMonthRevenue > 0 ? 
            ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

        // Update DOM elements
        document.getElementById('monthly-revenue').textContent = `$${thisMonthRevenue.toFixed(2)}`;
        document.getElementById('monthly-orders').textContent = thisMonthOrders.length;
        document.getElementById('revenue-growth').textContent = `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`;
        document.getElementById('avg-order-value').textContent = thisMonthOrders.length > 0 ? 
            `$${(thisMonthRevenue / thisMonthOrders.length).toFixed(2)}` : '$0.00';
    }

    renderRevenueChart() {
        // Simple revenue chart implementation
        const canvas = document.getElementById('revenue-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Generate sample data for last 7 days
        const days = [];
        const revenues = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            
            // Calculate revenue for this day
            const dayRevenue = this.data.orders
                .filter(order => {
                    const orderDate = new Date(order.dropOffDate);
                    return orderDate.toDateString() === date.toDateString();
                })
                .reduce((sum, order) => sum + order.total, 0);
            revenues.push(dayRevenue);
        }

        // Draw chart
        this.drawLineChart(ctx, width, height, days, revenues, '#3b82f6');
    }

    renderOrderStatusChart() {
        // Simple pie chart for order status
        const canvas = document.getElementById('status-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate status counts
        const statusCounts = {};
        this.data.orders.forEach(order => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });

        const colors = {
            pending: '#f59e0b',
            processing: '#3b82f6',
            ready: '#10b981',
            delivered: '#6b7280'
        };

        // Draw pie chart
        let startAngle = 0;
        const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

        Object.entries(statusCounts).forEach(([status, count]) => {
            const sliceAngle = (count / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[status] || '#6b7280';
            ctx.fill();
            
            startAngle += sliceAngle;
        });
    }

    drawLineChart(ctx, width, height, labels, data, color) {
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        const maxValue = Math.max(...data, 1);
        const stepX = chartWidth / (labels.length - 1);
        
        // Draw axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Draw data line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = padding + index * stepX;
            const y = height - padding - (value / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = color;
        data.forEach((value, index) => {
            const x = padding + index * stepX;
            const y = height - padding - (value / maxValue) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Draw labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        labels.forEach((label, index) => {
            const x = padding + index * stepX;
            ctx.fillText(label, x, height - padding + 20);
        });
    }

    loadTopCustomers() {
        const container = document.getElementById('top-customers-list');
        if (!container) return;

        const topCustomers = [...this.data.customers]
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);

        container.innerHTML = topCustomers.map((customer, index) => `
            <div class="top-customer-item">
                <div class="customer-rank">#${index + 1}</div>
                <div class="customer-info">
                    <div class="customer-name">${customer.name}</div>
                    <div class="customer-stats">${customer.totalOrders} orders • $${customer.totalSpent.toFixed(2)}</div>
                </div>
                <div class="customer-status">
                    <span class="status-badge status-${customer.status}">${this.capitalizeFirst(customer.status)}</span>
                </div>
            </div>
        `).join('');
    }

    loadInventoryAlerts() {
        const container = document.getElementById('inventory-alerts-list');
        if (!container) return;

        const alertItems = this.data.inventory
            .filter(item => item.quantity <= item.threshold)
            .sort((a, b) => (a.quantity / a.threshold) - (b.quantity / b.threshold))
            .slice(0, 5);

        if (alertItems.length === 0) {
            container.innerHTML = '<div class="no-alerts">No inventory alerts</div>';
            return;
        }

        container.innerHTML = alertItems.map(item => {
            const alertLevel = item.quantity === 0 ? 'critical' : 'warning';
            return `
                <div class="inventory-alert ${alertLevel}">
                    <div class="alert-icon">
                        <i class="fas fa-${item.quantity === 0 ? 'times-circle' : 'exclamation-triangle'}"></i>
                    </div>
                    <div class="alert-info">
                        <div class="alert-item">${item.name}</div>
                        <div class="alert-details">${item.quantity} ${item.unit} remaining (threshold: ${item.threshold})</div>
                    </div>
                    <div class="alert-action">
                        <button class="btn-sm" onclick="laundryApp.adjustInventory('${item.id}')">Restock</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Billing/Invoice functionality
    loadInvoices() {
        const tbody = document.querySelector('#invoices-table tbody');
        if (!tbody) return;

        const filteredInvoices = this.getFilteredInvoices();
        
        tbody.innerHTML = filteredInvoices.map(invoice => `
            <tr>
                <td>${invoice.id}</td>
                <td>${invoice.customerName}</td>
                <td>${this.formatDate(invoice.date)}</td>
                <td>${this.formatDate(invoice.dueDate)}</td>
                <td>$${invoice.total.toFixed(2)}</td>
                <td><span class="status-badge status-${invoice.status}">${this.capitalizeFirst(invoice.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="laundryApp.openInvoiceModal('${invoice.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="laundryApp.printInvoice('${invoice.id}')" title="Print">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn-icon" onclick="laundryApp.toggleInvoiceStatus('${invoice.id}')" title="Toggle Status">
                            <i class="fas fa-sync"></i>
                        </button>
                        <button class="btn-icon delete" onclick="laundryApp.deleteInvoice('${invoice.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getFilteredInvoices() {
        let filtered = [...this.data.invoices];
        
        // Search filter
        const searchTerm = document.getElementById('invoice-search')?.value.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(invoice => 
                invoice.id.toLowerCase().includes(searchTerm) ||
                invoice.customerName.toLowerCase().includes(searchTerm)
            );
        }
        
        // Payment status filter
        const statusFilter = document.getElementById('payment-status-filter')?.value || 'all';
        if (statusFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.status === statusFilter);
        }
        
        // Date filter
        const dateFilter = document.getElementById('invoice-date-filter')?.value || 'all';
        if (dateFilter !== 'all') {
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            filtered = filtered.filter(invoice => {
                const invoiceDate = new Date(invoice.date);
                
                switch (dateFilter) {
                    case 'today':
                        return invoiceDate >= startOfToday;
                    case 'week':
                        const weekAgo = new Date(startOfToday);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return invoiceDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(startOfToday);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return invoiceDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    filterInvoices() {
        this.loadInvoices();
    }

    resetInvoiceForm() {
        const form = document.getElementById('invoice-form');
        if (!form) return;

        form.reset();
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
        
        document.getElementById('invoice-date').value = today;
        document.getElementById('invoice-due-date').value = dueDate.toISOString().split('T')[0];
        
        // Clear items
        const itemsContainer = document.getElementById('invoice-items-container');
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
        }
        
        this.updateInvoiceSummary();
        this.setupInvoiceFormListeners();
    }

    populateInvoiceForm(invoiceId) {
        const invoice = this.data.invoices.find(i => i.id === invoiceId);
        if (!invoice) return;

        document.getElementById('invoice-customer-select').value = invoice.customerId;
        document.getElementById('invoice-date').value = invoice.date.toISOString().split('T')[0];
        document.getElementById('invoice-due-date').value = invoice.dueDate.toISOString().split('T')[0];
        document.getElementById('invoice-notes').value = invoice.notes || '';

        // Populate items
        const itemsContainer = document.getElementById('invoice-items-container');
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
            invoice.items.forEach(item => {
                this.addInvoiceItem(item);
            });
        }

        this.updateInvoiceSummary();
        this.setupInvoiceFormListeners();
    }

    setupInvoiceFormListeners() {
        // Add item button
        const addItemBtn = document.getElementById('add-invoice-item-btn');
        if (addItemBtn) {
            addItemBtn.replaceWith(addItemBtn.cloneNode(true));
            document.getElementById('add-invoice-item-btn').addEventListener('click', () => {
                this.addInvoiceItem();
            });
        }

        // Save invoice button
        const saveBtn = document.getElementById('save-invoice-btn');
        if (saveBtn) {
            saveBtn.replaceWith(saveBtn.cloneNode(true));
            document.getElementById('save-invoice-btn').addEventListener('click', () => {
                this.saveInvoice();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-invoice-btn');
        if (cancelBtn) {
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
            document.getElementById('cancel-invoice-btn').addEventListener('click', () => {
                this.closeModal(document.getElementById('invoice-modal'));
            });
        }
    }

    addInvoiceItem(existingItem = null) {
        const container = document.getElementById('invoice-items-container');
        if (!container) return;

        const itemId = existingItem?.id || this.generateId('INVITEM');
        const description = existingItem?.description || '';
        const quantity = existingItem?.quantity || 1;
        const price = existingItem?.price || 0;

        const itemRow = document.createElement('div');
        itemRow.className = 'invoice-item-row';
        itemRow.dataset.itemId = itemId;
        
        itemRow.innerHTML = `
            <input type="text" class="item-description" value="${description}" placeholder="Description">
            <input type="number" class="item-quantity" value="${quantity}" min="1" onchange="laundryApp.updateInvoiceSummary()">
            <input type="number" class="item-price" value="${price.toFixed(2)}" step="0.01" min="0" onchange="laundryApp.updateInvoiceSummary()">
            <span class="item-total">$${(quantity * price).toFixed(2)}</span>
            <button type="button" onclick="laundryApp.removeInvoiceItem('${itemId}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(itemRow);
        this.updateInvoiceSummary();
    }

    removeInvoiceItem(itemId) {
        const itemRow = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemRow) {
            itemRow.remove();
            this.updateInvoiceSummary();
        }
    }

    updateInvoiceSummary() {
        const itemRows = document.querySelectorAll('.invoice-item-row');
        let subtotal = 0;

        itemRows.forEach(row => {
            const quantity = parseInt(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const total = quantity * price;
            
            row.querySelector('.item-total').textContent = `$${total.toFixed(2)}`;
            subtotal += total;
        });

        const tax = subtotal * this.data.settings.taxRate;
        const total = subtotal + tax;

        document.getElementById('invoice-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('invoice-tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('invoice-total').textContent = `$${total.toFixed(2)}`;
    }

    saveInvoice() {
        // Implementation for saving invoice
        console.log('Saving invoice...');
    }

    toggleInvoiceStatus(invoiceId) {
        const invoice = this.data.invoices.find(i => i.id === invoiceId);
        if (!invoice) return;

        invoice.status = invoice.status === 'paid' ? 'unpaid' : 'paid';
        this.loadInvoices();
        this.showNotification(`Invoice ${invoiceId} marked as ${invoice.status}`, 'success');
    }

    printInvoice(invoiceId) {
        const invoice = this.data.invoices.find(i => i.id === invoiceId);
        if (!invoice) return;

        // Simple print implementation
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice ${invoice.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .invoice-details { margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .total { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>INVOICE</h1>
                        <h2>${invoice.id}</h2>
                    </div>
                    <div class="invoice-details">
                        <p><strong>Customer:</strong> ${invoice.customerName}</p>
                        <p><strong>Date:</strong> ${this.formatDate(invoice.date)}</p>
                        <p><strong>Due Date:</strong> ${this.formatDate(invoice.dueDate)}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items.map(item => `
                                <tr>
                                    <td>${item.description}</td>
                                    <td>${item.quantity}</td>
                                    <td>$${item.price.toFixed(2)}</td>
                                    <td>$${(item.quantity * item.price).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3">Subtotal</td>
                                <td>$${invoice.subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="3">Tax</td>
                                <td>$${invoice.tax.toFixed(2)}</td>
                            </tr>
                            <tr class="total">
                                <td colspan="3">Total</td>
                                <td>$${invoice.total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    deleteInvoice(invoiceId) {
        if (!confirm('Are you sure you want to delete this invoice?')) return;

        const invoiceIndex = this.data.invoices.findIndex(i => i.id === invoiceId);
        if (invoiceIndex > -1) {
            this.data.invoices.splice(invoiceIndex, 1);
            this.loadInvoices();
            this.showNotification('Invoice deleted successfully!', 'success');
        }
    }

    // Notification system
    showNotification(message, type = 'info') {
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
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Data persistence
    saveData() {
        try {
            localStorage.setItem('laundryAppData', JSON.stringify(this.data));
            this.showNotification('Data saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification('Error saving data', 'error');
        }
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('laundryAppData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                // Convert date strings back to Date objects
                parsedData.orders.forEach(order => {
                    order.dropOffDate = new Date(order.dropOffDate);
                    if (order.pickupDate) order.pickupDate = new Date(order.pickupDate);
                });
                
                parsedData.invoices.forEach(invoice => {
                    invoice.date = new Date(invoice.date);
                    invoice.dueDate = new Date(invoice.dueDate);
                });
                
                parsedData.inventory.forEach(item => {
                    item.lastUpdated = new Date(item.lastUpdated);
                });
                
                this.data = { ...this.data, ...parsedData };
                return true;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Error loading saved data', 'error');
        }
        return false;
    }

    // Export data
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `laundry-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }

    // Import data
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate data structure
                if (importedData.orders && importedData.customers && importedData.inventory) {
                    this.data = importedData;
                    this.loadSampleData(); // Ensure dates are properly formatted
                    this.updateDashboard();
                    this.showNotification('Data imported successfully!', 'success');
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                this.showNotification('Error importing data', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.laundryApp = new LaundryApp();
});
