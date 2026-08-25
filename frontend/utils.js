// ========== UTILS & NOTIFICATION SYSTEM ==========

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

function showNotificationWithUndo(product) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification enhanced';
    notification.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
            <img src="${product.image}" alt="${product.name}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;">
            <div>
                <div style="font-weight:700;">Added to Cart</div>
                <div style="font-size:0.9rem;color:var(--muted);">${product.name}</div>
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

function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
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

// Expose functions globally for cross-module & inline HTML support
window.showNotification = showNotification;
window.showNotificationWithUndo = showNotificationWithUndo;
window.debounce = debounce;
window.lazyLoadImages = lazyLoadImages;
