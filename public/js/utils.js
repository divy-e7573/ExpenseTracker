// public/js/utils.js

const API_URL = '/api';

/**
 * Handle API requests with automatic JWT Bearer token integration.
 */
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        // Handle unauthorized (expired token, etc)
        if (response.status === 401) {
            logout();
            return null; // Stop execution
        }

        if (!response.ok) {
           throw new Error(data.error || 'Something went wrong');
        }

        return data;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

/**
 * Basic toast notification system
 */
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
    
    toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-10 opacity-0`;
    toast.textContent = message;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Check if user is logged in
 */
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

/**
 * Protect routes - redirect to login if not authenticated
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login_page.html';
    }
}

/**
 * Prevent logged-in users from seeing login/signup pages
 */
function requireGuest() {
    if (isAuthenticated()) {
        window.location.href = '/financial_dashboard.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login_page.html';
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}
