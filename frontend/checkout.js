// ========== CHECKOUT MODULE ==========

let appliedCoupon = null;

function renderCheckoutSummary() {
    const container = document.getElementById('checkoutSummary');
    if (!container) return;
    
    if (window.cart.length === 0) {
        container.innerHTML = `<p style="color:var(--muted);text-align:center;padding:30px;">Your cart is empty.</p>`;
        return;
    }
    
    const { subtotal, shipping, tax, total } = window.getCartTotals();
    let discountedTotal = total;
    let couponText = '';
    
    if (appliedCoupon === 'LUXURY20') {
        const discount = Math.round(subtotal * 0.2);
        discountedTotal = total - discount;
        couponText = `
            <div class="summary-row" style="display:flex;justify-content:space-between;padding:10px 0;color:#4caf50;font-weight:700;">
                <span>Coupon (LUXURY20) -20%</span>
                <span>-₹${discount.toLocaleString()}</span>
            </div>
        `;
    }
    
    // Save current checkout total to local storage for billing/payment
    localStorage.setItem('checkoutTotal', discountedTotal);
    localStorage.setItem('checkoutSubtotal', subtotal);
    localStorage.setItem('checkoutShipping', shipping);
    localStorage.setItem('checkoutTax', tax);
    
    container.innerHTML = `
        <h3 style="font-size:1.4rem;font-weight:900;margin-bottom:20px;border-bottom:1px solid var(--line);padding-bottom:12px;">Order Summary</h3>
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
            ${window.cart.map(item => `
                <div style="display:flex;justify-content:space-between;font-size:0.95rem;color:var(--muted);">
                    <span>${item.name} (x${item.quantity})</span>
                    <span>₹${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `).join('')}
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:14px;display:flex;flex-direction:column;gap:10px;">
            <div class="summary-row" style="display:flex;justify-content:space-between;color:var(--muted);">
                <span>Subtotal</span>
                <span>₹${subtotal.toLocaleString()}</span>
            </div>
            <div class="summary-row" style="display:flex;justify-content:space-between;color:var(--muted);">
                <span>GST Tax (18%)</span>
                <span>₹${tax.toLocaleString()}</span>
            </div>
            <div class="summary-row" style="display:flex;justify-content:space-between;color:var(--muted);">
                <span>Shipping</span>
                <span>${shipping === 0 ? 'FREE' : '₹' + shipping.toLocaleString()}</span>
            </div>
            ${couponText}
            <div class="summary-row total" style="display:flex;justify-content:space-between;font-size:1.3rem;font-weight:900;border-top:1px solid var(--line);padding-top:16px;margin-top:8px;">
                <span>Grand Total</span>
                <span style="color:var(--maroon-light);font-size:1.50rem;">₹${discountedTotal.toLocaleString()}</span>
            </div>
        </div>
    `;
}

function applyCouponCode() {
    const input = document.getElementById('couponInput');
    if (!input) return;
    const code = input.value.toUpperCase().trim();
    
    if (code === 'LUXURY20') {
        appliedCoupon = 'LUXURY20';
        window.showNotification('Coupon applied successfully! 20% discount on subtotal.');
        renderCheckoutSummary();
    } else {
        window.showNotification('Invalid coupon code.', 'error');
    }
}

function handleCheckoutSubmit(e) {
    if (e) e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const addressLine = document.getElementById('addressLine').value.trim();
    const city = document.getElementById('city').value.trim();
    const postalCode = document.getElementById('postalCode').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!fullName || !email || !addressLine || !city || !postalCode || !phone) {
        window.showNotification('Please fill in all shipping details.', 'error');
        return;
    }
    
    const address = { fullName, addressLine, city, postalCode, phone };
    localStorage.setItem('checkoutAddress', JSON.stringify(address));
    localStorage.setItem('checkoutEmail', email);
    localStorage.setItem('checkoutName', fullName);
    
    window.showNotification('Address details saved. Proceeding to payment...');
    setTimeout(() => {
        window.location.href = 'payment.html';
    }, 800);
}

// Expose globally
window.appliedCoupon = appliedCoupon;
window.renderCheckoutSummary = renderCheckoutSummary;
window.applyCouponCode = applyCouponCode;
window.handleCheckoutSubmit = handleCheckoutSubmit;
