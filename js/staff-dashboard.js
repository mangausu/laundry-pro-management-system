/*
 * LaundryPro Staff Dashboard JavaScript
 */

// Global variables
let currentUser = null;
let allOrders = [];
let allCustomers = [];
let currentPage = 'dashboard';

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menu-toggle');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('page-title');
const userName = document.getElementById('user-name');
const welcomeName = document.getElementById('welcome-name');
const logoutBtn = document.getElementById('logout-btn');
const dropdownToggle = document.querySelector('.dropdown-toggle');
const dropdown = document.querySelector('.dropdown');

// Modal elements
const statusModal = document.getElementById('status-modal');
const closeStatusModal = document.getElementById('close-status-modal');
const cancelStatusBtn = document.getElementById('cancel-status');
const updateStatusBtn = document.getElementById('update-status');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeUser();
    initializeNavigation();
    initializeForms();
    initializeModals();
    loadData();
    updateDashboardStats();
});

// Initialize user data
function initializeUser() {
    const userData = localStorage.getItem('laundryProUser');
    if (!userData) {
        window.location.href = 'home.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    
    // Check if user is staff
    if (currentUser.userType !== 'staff') {
        window.location.href = 'home.html';
        return;
    }
    
    // Update user display
    const displayName = currentUser.firstName || currentUser.email.split('@')[0];
    if (userName) userName.textContent = displayName;
    if (welcomeName) welcomeName.textContent = displayName;
}

// Initialize navigation
function initializeNavigation() {
    // Mobile menu toggle
    menuToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    // Navigation items
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });
    
    // Action buttons
    document.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const page = btn.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });
    
    // Dropdown menu
    dropdownToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        dropdown.classList.remove('active');
    });
    
    // Logout functionality
    logoutBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// Navigate to page
function navigateToPage(page) {
    // Update active nav item
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Update active page
    pages.forEach(pageEl => {
        pageEl.classList.remove('active');
        if (pageEl.id === `${page}-page`) {
            pageEl.classList.add('active');
        }
    });
    
    // Update page title
    const titles = {
        'dashboard': 'Staff Dashboard',
        'orders': 'Order Management',
        'customers': 'Customer Management',
        'schedule': 'Schedule Management',
        'reports': 'Reports & Analytics',
        'profile': 'Staff Profile'
    };
    
    if (pageTitle) {
        pageTitle.textContent = titles[page] || 'Staff Dashboard';
    }
    
    currentPage = page;
    
    // Load page-specific data
    switch (page) {
        case 'dashboard':
            updateDashboardStats();
            loadUrgentOrders();
            loadTodaySchedule();
            break;
        case 'orders':
            loadOrdersTable();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'schedule':
            loadSchedule();
            break;
        case 'reports':
            loadReports();
            break;
        case 'profile':
            loadProfile();
            break;
    }
    
    // Close mobile sidebar
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
    }
}

// Initialize forms
function initializeForms() {
    // Profile form
    const profileForm = document.getElementById('profile-form');
    profileForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        updateProfile();
    });
    
    // Set today's date for schedule
    const scheduleDate = document.getElementById('schedule-date');
    const todayBtn = document.getElementById('today-btn');
    
    if (scheduleDate) {
        scheduleDate.value = new Date().toISOString().split('T')[0];
    }
    
    todayBtn?.addEventListener('click', () => {
        if (scheduleDate) {
            scheduleDate.value = new Date().toISOString().split('T')[0];
            loadSchedule();
        }
    });
    
    scheduleDate?.addEventListener('change', () => {
        loadSchedule();
    });
    
    // Search and filter functionality
    const orderSearch = document.getElementById('order-search');
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');
    
    orderSearch?.addEventListener('input', filterOrders);
    statusFilter?.addEventListener('change', filterOrders);
    priorityFilter?.addEventListener('change', filterOrders);
    
    // Customer search
    const customerSearch = document.getElementById('customer-search');
    customerSearch?.addEventListener('input', filterCustomers);
    
    // Report generation
    const generateReportBtn = document.getElementById('generate-report');
    generateReportBtn?.addEventListener('click', generateReport);
}

// Initialize modals
function initializeModals() {
    // Status modal
    closeStatusModal?.addEventListener('click', () => {
        statusModal.classList.remove('active');
    });
    
    cancelStatusBtn?.addEventListener('click', () => {
        statusModal.classList.remove('active');
    });
    
    updateStatusBtn?.addEventListener('click', () => {
        updateOrderStatus();
    });
    
    // Close modal when clicking outside
    statusModal?.addEventListener('click', (e) => {
        if (e.target === statusModal) {
            statusModal.classList.remove('active');
        }
    });
}

// Load data
function loadData() {
    // Load all orders
    allOrders = JSON.parse(localStorage.getItem('laundryProOrders') || '[]');
    
    // Load all customers
    const users = JSON.parse(localStorage.getItem('laundryProUsers') || '[]');
    allCustomers = users.filter(user => user.userType === 'customer' || !user.userType);
    
    // Add priority to orders if not exists
    allOrders.forEach(order => {
        if (!order.priority) {
            const deliveryDate = new Date(order.deliveryDate);
            const today = new Date();
            const daysDiff = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));
            order.priority = daysDiff <= 1 ? 'urgent' : 'normal';
        }
    });
    
    // Save updated orders
    localStorage.setItem('laundryProOrders', JSON.stringify(allOrders));
}

// Update dashboard stats
function updateDashboardStats() {
    const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
    const processingOrders = allOrders.filter(order => order.status === 'processing').length;
    const readyOrders = allOrders.filter(order => order.status === 'ready').length;
    
    // Completed today
    const today = new Date().toISOString().split('T')[0];
    const completedToday = allOrders.filter(order => 
        order.status === 'delivered' && 
        order.updatedAt && 
        order.updatedAt.startsWith(today)
    ).length;
    
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('processing-orders').textContent = processingOrders;
    document.getElementById('ready-orders').textContent = readyOrders;
    document.getElementById('completed-orders').textContent = completedToday;
    
    // Update notification count
    const notificationCount = pendingOrders + readyOrders;
    document.getElementById('notification-count').textContent = notificationCount;
}

// Load urgent orders
function loadUrgentOrders() {
    const urgentOrdersList = document.getElementById('urgent-orders-list');
    if (!urgentOrdersList) return;
    
    const urgentOrders = allOrders
        .filter(order => order.priority === 'urgent' && order.status !== 'delivered')
        .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
        .slice(0, 5);
    
    if (urgentOrders.length === 0) {
        urgentOrdersList.innerHTML = '<p class="empty-state">No urgent orders at the moment</p>';
        return;
    }
    
    urgentOrdersList.innerHTML = urgentOrders.map(order => `
        <div class="order-item">
            <div class="order-info">
                <h4>${order.id}</h4>
                <p>Due: ${formatDate(order.deliveryDate)} • ${getCustomerName(order.customerId)}</p>
            </div>
            <span class="order-status ${order.status}">${order.status}</span>
        </div>
    `).join('');
}

// Load today's schedule
function loadTodaySchedule() {
    const todayScheduleList = document.getElementById('today-schedule-list');
    if (!todayScheduleList) return;
    
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = allOrders.filter(order => 
        order.pickupDate === today || order.deliveryDate === today
    );
    
    if (todayOrders.length === 0) {
        todayScheduleList.innerHTML = '<p class="empty-state">No scheduled activities for today</p>';
        return;
    }
    
    todayScheduleList.innerHTML = todayOrders.map(order => `
        <div class="schedule-item">
            <div class="schedule-details">
                <strong>${order.id}</strong> - ${getCustomerName(order.customerId)}
            </div>
            <div class="schedule-time">
                ${order.pickupDate === today ? 'Pickup' : 'Delivery'}
            </div>
        </div>
    `).join('');
}

// Load orders table
function loadOrdersTable() {
    const ordersTableBody = document.getElementById('orders-table-body');
    if (!ordersTableBody) return;
    
    if (allOrders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No orders found</h3>
                    <p>Orders will appear here when customers place them</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const sortedOrders = allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    ordersTableBody.innerHTML = sortedOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${getCustomerName(order.customerId)}</td>
            <td>${order.services.join(', ')}</td>
            <td>${formatDate(order.pickupDate)}</td>
            <td>${formatDate(order.deliveryDate)}</td>
            <td><span class="order-status ${order.status}">${order.status}</span></td>
            <td><span class="priority-badge ${order.priority}">${order.priority}</span></td>
            <td>
                <button class="btn-primary btn-sm" onclick="openStatusModal('${order.id}')">Update Status</button>
                <button class="btn-secondary btn-sm" onclick="viewOrderDetails('${order.id}')">View Details</button>
            </td>
        </tr>
    `).join('');
}

// Filter orders
function filterOrders() {
    const searchTerm = document.getElementById('order-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || 'all';
    const priorityFilter = document.getElementById('priority-filter')?.value || 'all';
    
    let filteredOrders = allOrders;
    
    // Apply search filter
    if (searchTerm) {
        filteredOrders = filteredOrders.filter(order => 
            order.id.toLowerCase().includes(searchTerm) ||
            getCustomerName(order.customerId).toLowerCase().includes(searchTerm) ||
            order.services.some(service => service.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.priority === priorityFilter);
    }
    
    // Update table with filtered orders
    const ordersTableBody = document.getElementById('orders-table-body');
    if (!ordersTableBody) return;
    
    if (filteredOrders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No orders match your filters</h3>
                    <p>Try adjusting your search criteria</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const sortedOrders = filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    ordersTableBody.innerHTML = sortedOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${getCustomerName(order.customerId)}</td>
            <td>${order.services.join(', ')}</td>
            <td>${formatDate(order.pickupDate)}</td>
            <td>${formatDate(order.deliveryDate)}</td>
            <td><span class="order-status ${order.status}">${order.status}</span></td>
            <td><span class="priority-badge ${order.priority}">${order.priority}</span></td>
            <td>
                <button class="btn-primary btn-sm" onclick="openStatusModal('${order.id}')">Update Status</button>
                <button class="btn-secondary btn-sm" onclick="viewOrderDetails('${order.id}')">View Details</button>
            </td>
        </tr>
    `).join('');
}

// Load customers
function loadCustomers() {
    const customersGrid = document.getElementById('customers-grid');
    if (!customersGrid) return;
    
    if (allCustomers.length === 0) {
        customersGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No customers found</h3>
                <p>Customer information will appear here when they register</p>
            </div>
        `;
        return;
    }
    
    customersGrid.innerHTML = allCustomers.map(customer => {
        const customerOrders = allOrders.filter(order => order.customerId === customer.email);
        const totalOrders = customerOrders.length;
        const totalSpent = customerOrders.reduce((sum, order) => sum + (order.estimatedCost || 0), 0);
        
        return `
            <div class="customer-card">
                <div class="customer-header">
                    <div class="customer-avatar">
                        ${(customer.firstName?.[0] || customer.email[0]).toUpperCase()}
                    </div>
                    <div class="customer-info">
                        <h4>${customer.firstName || ''} ${customer.lastName || ''}</h4>
                        <p>${customer.email}</p>
                        <p>${customer.phone || 'No phone'}</p>
                    </div>
                </div>
                <div class="customer-stats">
                    <div class="customer-stat">
                        <div class="value">${totalOrders}</div>
                        <div class="label">Orders</div>
                    </div>
                    <div class="customer-stat">
                        <div class="value">$${totalSpent.toFixed(2)}</div>
                        <div class="label">Total Spent</div>
                    </div>
                    <div class="customer-stat">
                        <div class="value">${customerOrders.filter(o => o.status === 'pending').length}</div>
                        <div class="label">Active</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filter customers
function filterCustomers() {
    const searchTerm = document.getElementById('customer-search')?.value.toLowerCase() || '';
    
    let filteredCustomers = allCustomers;
    
    if (searchTerm) {
        filteredCustomers = filteredCustomers.filter(customer => 
            (customer.firstName || '').toLowerCase().includes(searchTerm) ||
            (customer.lastName || '').toLowerCase().includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm) ||
            (customer.phone || '').includes(searchTerm)
        );
    }
    
    const customersGrid = document.getElementById('customers-grid');
    if (!customersGrid) return;
    
    if (filteredCustomers.length === 0) {
        customersGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No customers match your search</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }
    
    customersGrid.innerHTML = filteredCustomers.map(customer => {
        const customerOrders = allOrders.filter(order => order.customerId === customer.email);
        const totalOrders = customerOrders.length;
        const totalSpent = customerOrders.reduce((sum, order) => sum + (order.estimatedCost || 0), 0);
        
        return `
            <div class="customer-card">
                <div class="customer-header">
                    <div class="customer-avatar">
                        ${(customer.firstName?.[0] || customer.email[0]).toUpperCase()}
                    </div>
                    <div class="customer-info">
                        <h4>${customer.firstName || ''} ${customer.lastName || ''}</h4>
                        <p>${customer.email}</p>
                        <p>${customer.phone || 'No phone'}</p>
                    </div>
                </div>
                <div class="customer-stats">
                    <div class="customer-stat">
                        <div class="value">${totalOrders}</div>
                        <div class="label">Orders</div>
                    </div>
                    <div class="customer-stat">
                        <div class="value">$${totalSpent.toFixed(2)}</div>
                        <div class="label">Total Spent</div>
                    </div>
                    <div class="customer-stat">
                        <div class="value">${customerOrders.filter(o => o.status === 'pending').length}</div>
                        <div class="label">Active</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Load schedule
function loadSchedule() {
    const selectedDate = document.getElementById('schedule-date')?.value || new Date().toISOString().split('T')[0];
    const pickupsList = document.getElementById('pickups-list');
    const deliveriesList = document.getElementById('deliveries-list');
    
    if (!pickupsList || !deliveriesList) return;
    
    const pickups = allOrders.filter(order => order.pickupDate === selectedDate);
    const deliveries = allOrders.filter(order => order.deliveryDate === selectedDate);
    
    // Load pickups
    if (pickups.length === 0) {
        pickupsList.innerHTML = '<p class="empty-state">No pickups scheduled for this date</p>';
    } else {
        pickupsList.innerHTML = pickups.map(order => `
            <div class="schedule-item">
                <div class="schedule-item-info">
                    <h4>${order.id}</h4>
                    <p>${getCustomerName(order.customerId)}</p>
                    <p>${order.pickupAddress}</p>
                </div>
                <div class="schedule-time">
                    <span class="order-status ${order.status}">${order.status}</span>
                </div>
            </div>
        `).join('');
    }
    
    // Load deliveries
    if (deliveries.length === 0) {
        deliveriesList.innerHTML = '<p class="empty-state">No deliveries scheduled for this date</p>';
    } else {
        deliveriesList.innerHTML = deliveries.map(order => `
            <div class="schedule-item">
                <div class="schedule-item-info">
                    <h4>${order.id}</h4>
                    <p>${getCustomerName(order.customerId)}</p>
                    <p>${order.deliveryAddress}</p>
                </div>
                <div class="schedule-time">
                    <span class="order-status ${order.status}">${order.status}</span>
                </div>
            </div>
        `).join('');
    }
}

// Load reports
function loadReports() {
    generateReport();
}

// Generate report
function generateReport() {
    const period = document.getElementById('report-period')?.value || 'today';
    let startDate, endDate;
    
    const now = new Date();
    
    switch (period) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
    }
    
    const periodOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate < endDate;
    });
    
    // Calculate stats
    const totalOrders = periodOrders.length;
    const totalRevenue = periodOrders.reduce((sum, order) => sum + (order.estimatedCost || 0), 0);
    const completedOrders = periodOrders.filter(order => order.status === 'delivered').length;
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    const satisfaction = 95; // Mock satisfaction rate
    
    // Update report values
    document.getElementById('report-total-orders').textContent = totalOrders;
    document.getElementById('report-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('report-completion-rate').textContent = `${completionRate}%`;
    document.getElementById('report-satisfaction').textContent = `${satisfaction}%`;
    
    // Update charts (mock data)
    const statusChart = document.getElementById('status-chart');
    const serviceChart = document.getElementById('service-chart');
    
    if (statusChart) {
        const pending = periodOrders.filter(o => o.status === 'pending').length;
        const processing = periodOrders.filter(o => o.status === 'processing').length;
        const ready = periodOrders.filter(o => o.status === 'ready').length;
        const delivered = periodOrders.filter(o => o.status === 'delivered').length;
        
        statusChart.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Pending:</span> <strong>${pending}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Processing:</span> <strong>${processing}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Ready:</span> <strong>${ready}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Delivered:</span> <strong>${delivered}</strong>
                </div>
            </div>
        `;
    }
    
    if (serviceChart) {
        const washFold = periodOrders.filter(o => o.services.includes('wash-fold')).length;
        const dryClean = periodOrders.filter(o => o.services.includes('dry-clean')).length;
        const pressIron = periodOrders.filter(o => o.services.includes('press-iron')).length;
        
        serviceChart.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Wash & Fold:</span> <strong>${washFold}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Dry Cleaning:</span> <strong>${dryClean}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Press & Iron:</span> <strong>${pressIron}</strong>
                </div>
            </div>
        `;
    }
}

// Load profile
function loadProfile() {
    if (!currentUser) return;
    
    document.getElementById('profile-firstname').value = currentUser.firstName || '';
    document.getElementById('profile-lastname').value = currentUser.lastName || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-phone').value = currentUser.phone || '';
    document.getElementById('profile-employee-id').value = currentUser.employeeId || 'EMP-' + Date.now();
    document.getElementById('profile-department').value = currentUser.department || 'processing';
    document.getElementById('profile-shift').value = currentUser.shift || 'morning';
}

// Update profile
function updateProfile() {
    const updatedUser = {
        ...currentUser,
        firstName: document.getElementById('profile-firstname').value,
        lastName: document.getElementById('profile-lastname').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value,
        employeeId: document.getElementById('profile-employee-id').value,
        department: document.getElementById('profile-department').value,
        shift: document.getElementById('profile-shift').value
    };
    
    // Update localStorage
    localStorage.setItem('laundryProUser', JSON.stringify(updatedUser));
    currentUser = updatedUser;
    
    // Update display
    const displayName = currentUser.firstName || currentUser.email.split('@')[0];
    if (userName) userName.textContent = displayName;
    if (welcomeName) welcomeName.textContent = displayName;
    
    showMessage('Profile updated successfully!', 'success');
}

// Open status modal
function openStatusModal(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    document.getElementById('order-id-display').value = orderId;
    document.getElementById('order-id-hidden').value = orderId;
    document.getElementById('new-status').value = order.status;
    document.getElementById('status-notes').value = '';
    
    statusModal.classList.add('active');
}

// Update order status
function updateOrderStatus() {
    const orderId = document.getElementById('order-id-hidden').value;
    const newStatus = document.getElementById('new-status').value;
    const notes = document.getElementById('status-notes').value;
    
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;
    
    // Update order
    allOrders[orderIndex].status = newStatus;
    allOrders[orderIndex].updatedAt = new Date().toISOString();
    if (notes) {
        allOrders[orderIndex].statusNotes = notes;
    }
    
    // Update localStorage
    localStorage.setItem('laundryProOrders', JSON.stringify(allOrders));
    
    // Update customer's orders
    const customerId = allOrders[orderIndex].customerId;
    const customerOrders = JSON.parse(localStorage.getItem(`orders_${customerId}`) || '[]');
    const customerOrderIndex = customerOrders.findIndex(o => o.id === orderId);
    if (customerOrderIndex !== -1) {
        customerOrders[customerOrderIndex].status = newStatus;
        customerOrders[customerOrderIndex].updatedAt = new Date().toISOString();
        localStorage.setItem(`orders_${customerId}`, JSON.stringify(customerOrders));
    }
    
    // Close modal and refresh data
    statusModal.classList.remove('active');
    showMessage('Order status updated successfully!', 'success');
    
    // Refresh current page data
    switch (currentPage) {
        case 'dashboard':
            updateDashboardStats();
            loadUrgentOrders();
            break;
        case 'orders':
            loadOrdersTable();
            break;
    }
}

// Utility functions
function getCustomerName(customerId) {
    const customer = allCustomers.find(c => c.email === customerId);
    if (customer && customer.firstName) {
        return `${customer.firstName} ${customer.lastName || ''}`.trim();
    }
    return customerId.split('@')[0];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

function logout() {
    localStorage.removeItem('laundryProUser');
    window.location.href = 'home.html';
}

// Global functions for order actions
window.openStatusModal = openStatusModal;

window.viewOrderDetails = function(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
        alert(`Order Details:\n\nID: ${order.id}\nCustomer: ${getCustomerName(order.customerId)}\nServices: ${order.services.join(', ')}\nStatus: ${order.status}\nPriority: ${order.priority}\nPickup: ${formatDate(order.pickupDate)}\nDelivery: ${formatDate(order.deliveryDate)}\nCost: $${order.estimatedCost.toFixed(2)}\n\nSpecial Instructions: ${order.specialInstructions || 'None'}\nStatus Notes: ${order.statusNotes || 'None'}`);
    }
};

// Add CSS animations
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
