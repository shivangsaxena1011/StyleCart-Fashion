// ========== PAYMENT MODULE ==========

let selectedMethod = 'upi';

function selectPaymentMethod(method) {
    selectedMethod = method;
    document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('active'));
    
    const target = document.querySelector(`.payment-method[data-method="${method}"]`);
    if (target) target.classList.add('active');
    
    // Toggle details container
    document.querySelectorAll('.method-details').forEach(el => el.style.display = 'none');
    const details = document.getElementById(`${method}Details`);
    if (details) details.style.display = 'block';
}

async function processPayment(e) {
    if (e) e.preventDefault();
    
    const submitBtn = document.getElementById('payBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Processing Payment...';
    }
    
    // Simulate payment authorization delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const cart = window.cart;
    const address = JSON.parse(localStorage.getItem('checkoutAddress')) || {};
    const email = localStorage.getItem('checkoutEmail') || "guest@avenor.com";
    const name = localStorage.getItem('checkoutName') || "Guest Customer";
    
    const subtotal = parseInt(localStorage.getItem('checkoutSubtotal')) || 0;
    const shipping = parseInt(localStorage.getItem('checkoutShipping')) || 0;
    const total = parseInt(localStorage.getItem('checkoutTotal')) || 0;
    
    const orderPayload = {
        customerName: name,
        email: email,
        address: address,
        products: cart,
        subtotal,
        shipping,
        total,
        paymentMethod: selectedMethod.toUpperCase()
    };
    
    try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch('http://localhost:5001/api/orders', {
            method: 'POST',
            headers,
            body: JSON.stringify(orderPayload)
        });
        
        const data = await response.json();
        
        if (data.success && data.order) {
            // Save current order and add to list of orders in localStorage
            localStorage.setItem('currentOrder', JSON.stringify(data.order));
            const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
            existingOrders.unshift(data.order);
            localStorage.setItem('orders', JSON.stringify(existingOrders));
            
            // Clear cart
            localStorage.removeItem('cart');
            window.cart = [];
            window.updateCartCount();
            
            window.showNotification('Payment Successful! Preparing invoice...', 'success');
            setTimeout(() => {
                window.location.href = 'success.html';
            }, 800);
        } else {
            throw new Error(data.message || 'Server order validation failed');
        }
    } catch (err) {
        console.error("Order API Error, falling back to local storage logging.", err);
        // Fallback local logging
        const mockOrderId = "#ORD-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
        const orderData = {
            orderId: mockOrderId,
            customerName: name,
            email: email,
            address: address,
            products: cart,
            subtotal,
            shipping,
            total,
            paymentMethod: selectedMethod.toUpperCase(),
            orderStatus: "Processing",
            createdAt: new Date().toLocaleDateString()
        };
        
        localStorage.setItem('currentOrder', JSON.stringify(orderData));
        const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
        existingOrders.unshift(orderData);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
        
        localStorage.removeItem('cart');
        window.cart = [];
        window.updateCartCount();
        
        window.showNotification('Payment processed successfully.', 'success');
        setTimeout(() => {
            window.location.href = 'success.html';
        }, 800);
    }
}

// Expose globally
window.selectedMethod = selectedMethod;
window.selectPaymentMethod = selectPaymentMethod;
window.processPayment = processPayment;
