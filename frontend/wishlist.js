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
    const id = parseInt(productId, 10);
    if (isNaN(id)) return;
    const index = wishlist.indexOf(id);
    const btns = document.querySelectorAll(`.wishlist[data-product="${id}"]`);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        window.showNotification('❤️ Removed from wishlist');
        btns.forEach(btn => {
            btn.textContent = '♡';
            btn.classList.remove('active');
        });
    } else {
        wishlist.push(id);
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
    const id = parseInt(productId, 10);
    return wishlist.includes(id);
}

// Expose globally
window.wishlist = wishlist;
window.toggleWishlist = toggleWishlist;
window.isInWishlist = isInWishlist;
window.updateWishlistCount = updateWishlistCount;
