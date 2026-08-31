// ========== ORDER SUCCESS MODULE ==========

function initOrderSuccessPage() {
    const rawOrder = localStorage.getItem('currentOrder');
    if (!rawOrder) {
        document.getElementById('successDetailsCard').innerHTML = `
            <div style="text-align:center;padding:40px;">
                <h2>No active transaction found.</h2>
                <a href="index.html" class="btn primary" style="display:inline-block;margin-top:20px;padding:12px 30px;background:var(--maroon-light);color:white;text-decoration:none;border-radius:999px;">Continue Shopping</a>
            </div>
        `;
        return;
    }
    
    const order = JSON.parse(rawOrder);
    
    // Fill text components
    document.getElementById('orderIdText').textContent = order.orderId;
    document.getElementById('orderDateText').textContent = new Date(order.createdAt || Date.now()).toLocaleDateString();
    document.getElementById('orderPaymentText').textContent = order.paymentMethod || "UPI";
    document.getElementById('orderTxnText').textContent = order.transactionId || ("TXN" + Math.floor(Math.random() * 900000000000));
    
    const container = document.getElementById('successItemsContainer');
    if (container && order.products) {
        container.innerHTML = order.products.map(item => `
            <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                <div>
                    <strong>${item.name}</strong>
                    <div style="color:var(--muted);font-size:0.85rem;">Qty: ${item.quantity}</div>
                </div>
                <div>₹${(item.price * item.quantity).toLocaleString()}</div>
            </div>
        `).join('');
    }
    
    document.getElementById('successSubtotalText').textContent = `₹${(order.subtotal || 0).toLocaleString()}`;
    document.getElementById('successShippingText').textContent = order.shipping === 0 ? 'FREE' : `₹${(order.shipping || 0).toLocaleString()}`;
    document.getElementById('successTotalText').textContent = `₹${(order.total || 0).toLocaleString()}`;
    
    // Render recommendations
    renderSuccessRecommendations();
}

function downloadInvoice() {
    const rawOrder = localStorage.getItem('currentOrder');
    if (!rawOrder) return;
    const order = JSON.parse(rawOrder);
    
    let docContent = `========================================\n`;
    docContent += `             StyleCart INVOICE             \n`;
    docContent += `========================================\n`;
    docContent += `Order Number: ${order.orderId}\n`;
    docContent += `Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}\n`;
    docContent += `Payment Method: ${order.paymentMethod || "UPI"}\n`;
    docContent += `Customer Name: ${order.customerName || "Customer"}\n\n`;
    docContent += `Items:\n`;
    order.products.forEach(p => {
        docContent += `- ${p.name} (Qty: ${p.quantity}) - ₹${(p.price * p.quantity).toLocaleString()}\n`;
    });
    docContent += `\n`;
    docContent += `Subtotal: ₹${(order.subtotal || 0).toLocaleString()}\n`;
    docContent += `Shipping: ${order.shipping === 0 ? 'FREE' : '₹' + order.shipping.toLocaleString()}\n`;
    docContent += `Total: ₹${(order.total || 0).toLocaleString()}\n`;
    docContent += `========================================\n`;
    docContent += `        Thank you for shopping!         \n`;
    docContent += `========================================\n`;
    
    const blob = new Blob([docContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_${order.orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function renderSuccessRecommendations() {
    const grid = document.getElementById('successRecommendationsGrid');
    if (!grid) return;
    
    const recommended = window.ProductService.getRecommendedProducts().slice(0, 4);
    grid.innerHTML = recommended.map(p => `
        <article class="product-card" onclick="window.goToProduct(${p.id})" style="cursor:pointer;border:1px solid var(--line);border-radius:20px;padding:16px;background:rgba(255,255,255,0.01);">
            <img src="${p.image}" alt="${p.name}" style="width:100%;height:160px;object-fit:cover;border-radius:12px;" onerror="this.src='https://via.placeholder.com/160'">
            <h4 style="font-size:0.95rem;margin-top:10px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</h4>
            <p style="color:var(--maroon-light);font-weight:700;margin-top:4px;">₹${p.price.toLocaleString()}</p>
        </article>
    `).join('');
}

// Expose globally
window.initOrderSuccessPage = initOrderSuccessPage;
window.downloadInvoice = downloadInvoice;
window.renderSuccessRecommendations = renderSuccessRecommendations;
