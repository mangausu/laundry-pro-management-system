/*
 * LaundryPro User Dashboard JavaScript
 */

// Global variables
let currentUser = null;
let userOrders = [];
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

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeUser();
    initializeNavigation();
    initializeForms();
    initializeFAQ();
    loadUserData();
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
    
    // Update user display
    const displayName = currentUser.firstName || currentUser.email.split('@')[0];
    if (userName) userName.textContent = displayName;
    if (welcomeName) welcomeName.textContent = displayName;
    
    // Load user orders
    const orders = localStorage.getItem(`orders_${currentUser.email}`) || '[]';
    userOrders = JSON.parse(orders);
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
        'dashboard': 'Dashboard',
        'new-order': 'New Order',
        'my-orders': 'My Orders',
        'order-history': 'Order History',
        'profile': 'My Profile',
        'support': 'Support'
    };
    
    if (pageTitle) {
        pageTitle.textContent = titles[page] || 'Dashboard';
    }
    
    currentPage = page;
    
    // Load page-specific data
    switch (page) {
        case 'dashboard':
            updateDashboardStats();
            loadRecentOrders();
            break;
        case 'my-orders':
            loadMyOrders();
            break;
        case 'order-history':
            loadOrderHistory();
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
    // New order form
    const newOrderForm = document.getElementById('new-order-form');
    const sameAddressCheckbox = document.getElementById('same-address');
    const pickupAddress = document.getElementById('pickup-address');
    const deliveryAddress = document.getElementById('delivery-address');
    
    // Same address functionality
    sameAddressCheckbox?.addEventListener('change', () => {
        if (sameAddressCheckbox.checked) {
            deliveryAddress.value = pickupAddress.value;
            deliveryAddress.disabled = true;
        } else {
            deliveryAddress.disabled = false;
        }
    });
    
    pickupAddress?.addEventListener('input', () => {
        if (sameAddressCheckbox.checked) {
            deliveryAddress.value = pickupAddress.value;
        }
    });
    
    // New order form submission
    newOrderForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        submitNewOrder();
    });
    
    // Profile form
    const profileForm = document.getElementById('profile-form');
    profileForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        updateProfile();
    });
    
    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    const pickupDate = document.getElementById('pickup-date');
    const deliveryDate = document.getElementById('delivery-date');
    
    if (pickupDate) pickupDate.min = today;
    if (deliveryDate) deliveryDate.min = today;
}

// Submit new order
function submitNewOrder() {
    const services = Array.from(document.querySelectorAll('input[name="services"]:checked'))
        .map(cb => cb.value);
    
    if (services.length === 0) {
        showMessage('Please select at least one service', 'error');
        return;
    }
    
    const orderData = {
        id: 'ORD-' + Date.now(),
        customerId: currentUser.email,
        services: services,
        pickupDate: document.getElementById('pickup-date').value,
        deliveryDate: document.getElementById('delivery-date').value,
        pickupAddress: document.getElementById('pickup-address').value,
        deliveryAddress: document.getElementById('delivery-address').value,
        specialInstructions: document.getElementById('special-instructions').value,
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedCost: calculateOrderCost(services)
    };
    
    // Add to user orders
    userOrders.push(orderData);
    localStorage.setItem(`orders_${currentUser.email}`, JSON.stringify(userOrders));
    
    // Add to global orders
    const allOrders = JSON.parse(localStorage.getItem('laundryProOrders') || '[]');
    allOrders.push(orderData);
    localStorage.setItem('laundryProOrders', JSON.stringify(allOrders));
    
    showMessage('Order submitted successfully!', 'success');
    
    // Reset form and navigate to orders
    document.getElementById('new-order-form').reset();
    setTimeout(() => {
        navigateToPage('my-orders');
    }, 1500);
}

// Calculate order cost
function calculateOrderCost(services) {
    const prices = {
        'wash-fold': 15.00,
        'dry-clean': 25.00,
        'press-iron': 12.00
    };
    
    return services.reduce((total, service) => total + (prices[service] || 0), 0);
}

// Update dashboard stats
function updateDashboardStats() {
    const pendingOrders = userOrders.filter(order => order.status === 'pending').length;
    const processingOrders = userOrders.filter(order => order.status === 'processing').length;
    const readyOrders = userOrders.filter(order => order.status === 'ready').length;
    const totalOrders = userOrders.length;
    
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('processing-orders').textContent = processingOrders;
    document.getElementById('ready-orders').textContent = readyOrders;
    document.getElementById('total-orders').textContent = totalOrders;
    
    // Update notification count
    const notificationCount = pendingOrders + readyOrders;
    document.getElementById('notification-count').textContent = notificationCount;
}

// Load recent orders
function loadRecentOrders() {
    const recentOrdersList = document.getElementById('recent-orders-list');
    if (!recentOrdersList) return;
    
    const recentOrders = userOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (recentOrders.length === 0) {
        recentOrdersList.innerHTML = '<p class="no-orders">No orders yet. <a href="#" data-page="new-order">Create your first order</a></p>';
        return;
    }
    
    recentOrdersList.innerHTML = recentOrders.map(order => `
        <div class="order-item">
            <div class="order-info">
                <h4>${order.id}</h4>
                <p>${formatDate(order.createdAt)} • $${order.estimatedCost.toFixed(2)}</p>
            </div>
            <span class="order-status ${order.status}">${order.status}</span>
        </div>
    `).join('');
}

// Load my orders
function loadMyOrders() {
    const ordersGrid = document.getElementById('orders-grid');
    if (!ordersGrid) return;
    
    if (userOrders.length === 0) {
        ordersGrid.innerHTML = `
            <div class="no-orders-message">
                <i class="fas fa-clipboard-list"></i>
                <h3>No orders yet</h3>
                <p>Start by creating your first laundry order</p>
                <button class="btn-primary" data-page="new-order">Create Order</button>
            </div>
        `;
        return;
    }
    
    const sortedOrders = userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    ordersGrid.innerHTML = sortedOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">${order.id}</span>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><strong>Services:</strong> ${order.services.join(', ')}</p>
                <p><strong>Pickup:</strong> ${formatDate(order.pickupDate)}</p>
                <p><strong>Delivery:</strong> ${formatDate(order.deliveryDate)}</p>
                <p><strong>Cost:</strong> $${order.estimatedCost.toFixed(2)}</p>
            </div>
            <div class="order-actions">
                <button class="btn-secondary btn-sm" onclick="viewOrderDetails('${order.id}')">View Details</button>
                ${order.status === 'pending' ? `<button class="btn-primary btn-sm" onclick="cancelOrder('${order.id}')">Cancel</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Load order history
function loadOrderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const completedOrders = userOrders.filter(order => 
        order.status === 'delivered' || order.status === 'cancelled'
    );
    
    if (completedOrders.length === 0) {
        historyList.innerHTML = '<p class="no-history">No order history available</p>';
        return;
    }
    
    historyList.innerHTML = completedOrders.map(order => `
        <div class="history-item">
            <div class="history-header">
                <span class="order-id">${order.id}</span>
                <span class="order-date">${formatDate(order.createdAt)}</span>
            </div>
            <div class="history-details">
                <p>Services: ${order.services.join(', ')}</p>
                <p>Total: $${order.estimatedCost.toFixed(2)}</p>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
        </div>
    `).join('');
}

// Load profile
function loadProfile() {
    if (!currentUser) return;
    
    document.getElementById('profile-firstname').value = currentUser.firstName || '';
    document.getElementById('profile-lastname').value = currentUser.lastName || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-phone').value = currentUser.phone || '';
    document.getElementById('profile-address').value = currentUser.address || '';
    
    // Load preferences
    document.getElementById('email-notifications').checked = currentUser.emailNotifications !== false;
    document.getElementById('sms-notifications').checked = currentUser.smsNotifications === true;
}

// Update profile
function updateProfile() {
    const updatedUser = {
        ...currentUser,
        firstName: document.getElementById('profile-firstname').value,
        lastName: document.getElementById('profile-lastname').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value,
        address: document.getElementById('profile-address').value,
        emailNotifications: document.getElementById('email-notifications').checked,
        smsNotifications: document.getElementById('sms-notifications').checked
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

// Initialize FAQ
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => faq.classList.remove('active'));
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Utility functions
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

function loadUserData() {
    // Load user-specific data
    updateDashboardStats();
    loadRecentOrders();
}

// Global functions for order actions
window.viewOrderDetails = function(orderId) {
    const order = userOrders.find(o => o.id === orderId);
    if (order) {
        alert(`Order Details:\n\nID: ${order.id}\nServices: ${order.services.join(', ')}\nStatus: ${order.status}\nPickup: ${formatDate(order.pickupDate)}\nDelivery: ${formatDate(order.deliveryDate)}\nCost: $${order.estimatedCost.toFixed(2)}\n\nSpecial Instructions: ${order.specialInstructions || 'None'}`);
    }
};

window.cancelOrder = function(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        const orderIndex = userOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            userOrders[orderIndex].status = 'cancelled';
            localStorage.setItem(`orders_${currentUser.email}`, JSON.stringify(userOrders));
            
            // Update global orders
            const allOrders = JSON.parse(localStorage.getItem('laundryProOrders') || '[]');
            const globalOrderIndex = allOrders.findIndex(o => o.id === orderId);
            if (globalOrderIndex !== -1) {
                allOrders[globalOrderIndex].status = 'cancelled';
                localStorage.setItem('laundryProOrders', JSON.stringify(allOrders));
            }
            
            showMessage('Order cancelled successfully', 'success');
            loadMyOrders();
            updateDashboardStats();
        }
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
    .no-orders-message {
        text-align: center;
        padding: 60px 20px;
        color: #6b7280;
    }
    .no-orders-message i {
        font-size: 4rem;
        margin-bottom: 20px;
        color: #d1d5db;
    }
    .no-orders-message h3 {
        font-size: 1.5rem;
        margin-bottom: 10px;
        color: #374151;
    }
    .no-orders p {
        color: #6b7280;
        font-style: italic;
    }
    .no-orders a {
        color: #4f46e5;
        text-decoration: none;
    }
    .no-orders a:hover {
        text-decoration: underline;
    }
    .no-history {
        text-align: center;
        padding: 40px;
        color: #6b7280;
        font-style: italic;
    }
    .history-item {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }
    .history-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
    }
`;
document.head.appendChild(style);
