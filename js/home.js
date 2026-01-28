/*
 * LaundryPro Home Page JavaScript
 */

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const getStartedBtn = document.getElementById('get-started-btn');
const learnMoreBtn = document.getElementById('learn-more-btn');

const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const closeLoginBtn = document.getElementById('close-login');
const closeSignupBtn = document.getElementById('close-signup');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const contactForm = document.getElementById('contact-form');

const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');

const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');

// Navigation functionality
hamburger?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Modal functionality
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Event listeners for modal buttons
loginBtn?.addEventListener('click', () => openModal(loginModal));
signupBtn?.addEventListener('click', () => openModal(signupModal));
getStartedBtn?.addEventListener('click', () => openModal(signupModal));

closeLoginBtn?.addEventListener('click', () => closeModal(loginModal));
closeSignupBtn?.addEventListener('click', () => closeModal(signupModal));

// Switch between login and signup modals
switchToSignup?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(signupModal);
});

switchToLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(signupModal);
    openModal(loginModal);
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeModal(loginModal);
    }
    if (e.target === signupModal) {
        closeModal(signupModal);
    }
});

// Learn more button functionality
learnMoreBtn?.addEventListener('click', () => {
    document.querySelector('#services').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

// Form validation and submission
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function validatePassword(password) {
    return password.length >= 6;
}

function showMessage(message, type = 'success') {
    // Create message element
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

    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

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

// Login form submission
loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const userType = document.getElementById('user-type').value;
    
    // Validation
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (!userType) {
        showMessage('Please select a user type', 'error');
        return;
    }
    
    // Simulate login process
    showMessage('Logging in...', 'success');
    
    // Store user data in localStorage (for demo purposes)
    const userData = {
        email: email,
        userType: userType,
        loginTime: new Date().toISOString()
    };
    localStorage.setItem('laundryProUser', JSON.stringify(userData));
    
    // Redirect based on user type
    setTimeout(() => {
        switch (userType) {
            case 'customer':
                window.location.href = 'user-dashboard.html';
                break;
            case 'staff':
                window.location.href = 'staff-dashboard.html';
                break;
            case 'admin':
                window.location.href = 'index.html';
                break;
            default:
                showMessage('Invalid user type', 'error');
        }
    }, 1500);
});

// Signup form submission
signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const address = document.getElementById('signup-address').value;
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
        showMessage('Please enter your full name', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    if (!validatePhone(phone)) {
        showMessage('Please enter a valid phone number', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (!address.trim()) {
        showMessage('Please enter your address', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showMessage('Please agree to the Terms of Service and Privacy Policy', 'error');
        return;
    }
    
    // Simulate signup process
    showMessage('Creating your account...', 'success');
    
    // Store user data in localStorage (for demo purposes)
    const userData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        address: address,
        userType: 'customer', // New signups are customers by default
        signupTime: new Date().toISOString()
    };
    
    // Simulate saving to database
    let users = JSON.parse(localStorage.getItem('laundryProUsers') || '[]');
    users.push(userData);
    localStorage.setItem('laundryProUsers', JSON.stringify(users));
    
    // Auto-login the user
    localStorage.setItem('laundryProUser', JSON.stringify(userData));
    
    setTimeout(() => {
        showMessage('Account created successfully! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'user-dashboard.html';
        }, 1500);
    }, 1500);
});

// Contact form submission
contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;
    
    // Validation
    if (!name.trim()) {
        showMessage('Please enter your name', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    if (!message.trim()) {
        showMessage('Please enter your message', 'error');
        return;
    }
    
    // Simulate sending message
    showMessage('Sending message...', 'success');
    
    // Store contact message (for demo purposes)
    const contactData = {
        name: name,
        email: email,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    let contacts = JSON.parse(localStorage.getItem('laundryProContacts') || '[]');
    contacts.push(contactData);
    localStorage.setItem('laundryProContacts', JSON.stringify(contacts));
    
    setTimeout(() => {
        showMessage('Message sent successfully! We\'ll get back to you soon.', 'success');
        contactForm.reset();
    }, 1500);
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem('laundryProUser');
    if (userData) {
        const user = JSON.parse(userData);
        // Update login button to show user is logged in
        if (loginBtn) {
            loginBtn.textContent = `Welcome, ${user.firstName || user.email}`;
            loginBtn.style.pointerEvents = 'none';
        }
        if (signupBtn) {
            signupBtn.textContent = 'Dashboard';
            signupBtn.onclick = () => {
                switch (user.userType) {
                    case 'customer':
                        window.location.href = 'user-dashboard.html';
                        break;
                    case 'staff':
                        window.location.href = 'staff-dashboard.html';
                        break;
                    case 'admin':
                        window.location.href = 'index.html';
                        break;
                }
            };
        }
    }
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = '#ffffff';
        navbar.style.backdropFilter = 'none';
    }
});

// Animate stats on scroll
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const finalValue = stat.textContent;
                const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
                const suffix = finalValue.replace(/[\d,]/g, '');
                
                let currentValue = 0;
                const increment = numericValue / 50;
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= numericValue) {
                        stat.textContent = finalValue;
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(currentValue).toLocaleString() + suffix;
                    }
                }, 30);
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe stats section
const statsSection = document.querySelector('.about-stats');
if (statsSection) {
    observer.observe(statsSection);
}
