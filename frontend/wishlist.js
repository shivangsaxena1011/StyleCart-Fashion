// ========== WISHLIST MODULE ==========

let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    const btns = document.querySelectorAll(`.wishlist[data-product="${productId}"]`);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        window.showNotification('❤️ Removed from wishlist');
        btns.forEach(btn => {
            btn.textContent = '♡';
            btn.classList.remove('active');
        });
    } else {
        wishlist.push(productId);
        window.showNotification('❤️ Added to wishlist!');
        btns.forEach(btn => {
            btn.textContent = '♥';
            btn.classList.add('active');
            btn.style.transform = 'scale(1.4)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 300);
        });
    }
    updateWishlistCount();
    if (window.renderWishlist) window.renderWishlist();
    if (window.renderAllProducts) window.renderAllProducts();
}

function isInWishlist(productId) {
    return wishlist.includes(productId);
}

// Expose globally
window.wishlist = wishlist;
window.toggleWishlist = toggleWishlist;
window.isInWishlist = isInWishlist;
window.updateWishlistCount = updateWishlistCount;
