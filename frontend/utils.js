// ========== UTILS & NOTIFICATION SYSTEM ==========

/**
 * Centralized API Base URL Configuration for StyleCart Fashion
 */
const API_BASE = (function() {
    if (typeof window !== 'undefined' && window.location) {
        if (window.location.origin && (window.location.origin.includes(':5001') || window.location.origin.includes('vercel.app') || window.location.port === '5001')) {
            return '/api';
        }
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            // Default to same origin /api if hosted or fallback to localhost:5001
            return '/api';
        }
    }
    return 'http://localhost:5001/api';
})();
window.API_BASE = API_BASE;

/**
 * Centralized Fetch Wrapper with Authentication & Error Handling
 */
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('stylecart_token') || localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(options.headers || {})
    };
    
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const base = window.API_BASE || '/api';
    const url = endpoint.startsWith('http') ? endpoint : `${base}${cleanEndpoint}`;
    
    try {
        const response = await fetch(url, { ...options, headers });
        const data = await response.json();
        return data;
    } catch (err) {
        console.warn(`[StyleCart API] Fetch failed for ${url}:`, err);
        return { success: false, message: 'Network connection or server error.' };
    }
}
window.apiFetch = apiFetch;

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}
window.escapeHTML = escapeHTML;

/**
 * Format Currency (INR)
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount || 0);
}
window.formatCurrency = formatCurrency;

/**
 * Show Toast Notification
 */
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification:not(.enhanced)').forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
window.showNotification = showNotification;

/**
 * Show Notification with Undo Option
 */
function showNotificationWithUndo(product) {
    if (!product) return;
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification enhanced';
    notification.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
            <img src="${escapeHTML(product.image || 'images/shoes.png')}" alt="${escapeHTML(product.name || 'Product')}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;">
            <div>
                <div style="font-weight:700;">Added to Cart</div>
                <div style="font-size:0.9rem;color:var(--muted);">${escapeHTML(product.name || 'Item')}</div>
            </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px;">
            <button onclick="undoAddToCart(${product.id})" style="padding:4px 16px;border-radius:999px;border:1px solid var(--line);background:transparent;color:white;cursor:pointer;font-size:0.85rem;">Undo</button>
            <a href="cart.html" style="padding:4px 16px;border-radius:999px;background:var(--maroon-light);color:white;text-decoration:none;font-size:0.85rem;">View Cart</a>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}
window.showNotificationWithUndo = showNotificationWithUndo;

/**
 * Debounce Function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
window.debounce = debounce;

/**
 * Lazy Load Images
 */
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if (!('IntersectionObserver' in window)) return;
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                imageObserver.unobserve(img);
            }
        });
    });
    images.forEach(img => imageObserver.observe(img));
}
window.lazyLoadImages = lazyLoadImages;
