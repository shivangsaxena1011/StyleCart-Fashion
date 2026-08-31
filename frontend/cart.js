// ========== SHOPPING CART MODULE ==========

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = window.ProductService.getProductById(productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartCount();
    
    if (window.animateCart) window.animateCart(product);
    if (window.showNotificationWithUndo) {
        window.showNotificationWithUndo(product);
    } else {
        window.showNotification(`${product.name} added to cart!`);
    }

    if (window.renderCart) window.renderCart();
    if (window.renderAllProducts) window.renderAllProducts();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    if (window.renderCart) window.renderCart();
    if (window.renderAllProducts) window.renderAllProducts();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartCount();
            if (window.renderCart) window.renderCart();
            if (window.renderAllProducts) window.renderAllProducts();
        }
    }
}

function getCartQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
}

function undoAddToCart(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartCount();
        }
        document.querySelector('.notification')?.remove();
        window.showNotification('Removed from cart');
    }
}

function moveFromCartToWishlist(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        removeFromCart(productId);
        if (window.toggleWishlist && !window.isInWishlist(productId)) {
            window.toggleWishlist(productId);
        }
    }
}

function getCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 50000 ? 0 : (subtotal > 0 ? 499 : 0);
    const tax = Math.round(subtotal * 0.18); // 18% luxury GST tax
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
}

// Expose functions and data globally
window.cart = cart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.getCartQuantity = getCartQuantity;
window.undoAddToCart = undoAddToCart;
window.moveFromCartToWishlist = moveFromCartToWishlist;
window.getCartTotals = getCartTotals;
window.updateCartCount = updateCartCount;

window.CartService = {
    addToCart: function(productOrId) {
        if (!productOrId) return;
        const id = typeof productOrId === 'object' ? productOrId.id : productOrId;
        addToCart(id);
    },
    removeFromCart: removeFromCart,
    getCart: function() { return cart; },
    getTotals: getCartTotals
};
