// ========== COMPARE MODULE ==========

let compareList = JSON.parse(localStorage.getItem('compareList')) || [];

function toggleCompare(productId) {
    const index = compareList.indexOf(productId);
    if (index > -1) {
        compareList.splice(index, 1);
        window.showNotification('Removed from comparison');
    } else {
        if (compareList.length >= 4) {
            window.showNotification('Maximum 4 products can be compared at once.');
            return;
        }
        compareList.push(productId);
        window.showNotification('Added to comparison');
    }
    localStorage.setItem('compareList', JSON.stringify(compareList));
    updateCompareButton();
}

function updateCompareButton() {
    const btn = document.querySelector('.compare-btn-main');
    if (btn) {
        btn.textContent = `Compare (${compareList.length})`;
        btn.style.display = compareList.length > 0 ? 'flex' : 'none';
    }
}

function goToCompare() {
    if (compareList.length < 2) {
        window.showNotification('Add at least 2 products to compare');
        return;
    }
    window.location.href = `compare.html?ids=${compareList.join(',')}`;
}

async function renderComparePage() {
    const params = new URLSearchParams(window.location.search);
    const idsString = params.get('ids');
    if (!idsString) {
        document.getElementById('compareContainer').innerHTML = `
            <div style="text-align:center;padding:80px 20px;">
                <h2>No products selected for comparison</h2>
                <a href="index.html" class="btn primary" style="display:inline-block;margin-top:20px;padding:12px 30px;background:var(--maroon-light);color:white;text-decoration:none;border-radius:999px;">Add products</a>
            </div>
        `;
        return;
    }
    
    const ids = idsString.split(',').map(id => parseInt(id));
    const products = ids.map(id => window.ProductService.getProductById(id)).filter(Boolean);
    
    if (products.length < 2) {
        document.getElementById('compareContainer').innerHTML = `
            <div style="text-align:center;padding:80px 20px;">
                <h2>Add at least 2 products to compare</h2>
                <a href="index.html" class="btn primary" style="display:inline-block;margin-top:20px;padding:12px 30px;background:var(--maroon-light);color:white;text-decoration:none;border-radius:999px;">Browse Products</a>
            </div>
        `;
        return;
    }
    
    // Highlight lowest price as green, highest rating as gold
    const lowestPrice = Math.min(...products.map(p => p.price));
    const highestRating = Math.max(...products.map(p => p.rating));
    
    let tableHtml = `
        <table class="compare-table" style="width:100%;border-collapse:collapse;border-radius:24px;overflow:hidden;border:1px solid var(--line);background:rgba(255,255,255,0.02);">
            <thead>
                <tr style="background:rgba(255,255,255,0.05);">
                    <th style="padding:20px;text-align:left;font-weight:800;color:var(--muted);width:200px;">Features</th>
                    ${products.map(p => `
                        <th style="padding:20px;text-align:center;min-width:200px;">
                            <img src="${p.image}" alt="${p.name}" style="width:120px;height:120px;object-fit:cover;border-radius:12px;margin-bottom:10px;" onerror="this.src='https://via.placeholder.com/120'">
                            <h4 style="font-size:1.1rem;font-weight:900;">${p.name}</h4>
                            <button onclick="removeFromComparePage(${p.id})" style="background:none;border:none;color:#ff4444;cursor:pointer;margin-top:8px;font-size:0.85rem;">Remove</button>
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding:16px 20px;font-weight:700;border-top:1px solid var(--line);">Category</td>
                    ${products.map(p => `<td style="padding:16px 20px;text-align:center;border-top:1px solid var(--line);text-transform:capitalize;">${p.category}</td>`).join('')}
                </tr>
                <tr>
                    <td style="padding:16px 20px;font-weight:700;border-top:1px solid var(--line);">Price</td>
                    ${products.map(p => `
                        <td style="padding:16px 20px;text-align:center;border-top:1px solid var(--line);font-weight:800;font-size:1.15rem;color:${p.price === lowestPrice ? '#4caf50' : 'white'}">
                            ₹${p.price.toLocaleString()}
                            ${p.price === lowestPrice ? '<br><span style="font-size:0.75rem;color:#4caf50;font-weight:700;">★ BEST VALUE</span>' : ''}
                        </td>
                    `).join('')}
                </tr>
                <tr>
                    <td style="padding:16px 20px;font-weight:700;border-top:1px solid var(--line);">Rating</td>
                    ${products.map(p => `
                        <td style="padding:16px 20px;text-align:center;border-top:1px solid var(--line);color:${p.rating === highestRating ? '#ffd700' : 'white'}">
                            ★ ${p.rating}
                            ${p.rating === highestRating ? '<br><span style="font-size:0.75rem;color:#ffd700;font-weight:700;">★ TOP RATED</span>' : ''}
                        </td>
                    `).join('')}
                </tr>
                <tr>
                    <td style="padding:16px 20px;font-weight:700;border-top:1px solid var(--line);">Brand</td>
                    ${products.map(p => `<td style="padding:16px 20px;text-align:center;border-top:1px solid var(--line);font-weight:600;">${p.brand || 'StyleCart Premium'}</td>`).join('')}
                </tr>
                <tr>
                    <td style="padding:16px 20px;font-weight:700;border-top:1px solid var(--line);">Description</td>
                    ${products.map(p => `<td style="padding:16px 20px;text-align:center;border-top:1px solid var(--line);font-size:0.9rem;color:var(--muted);line-height:1.5;">${p.description}</td>`).join('')}
                </tr>
                <tr>
                    <td style="padding:16px 20px;font-weight:700;border-top:1px solid var(--line);">Cart Action</td>
                    ${products.map(p => `
                        <td style="padding:16px 20px;text-align:center;border-top:1px solid var(--line);">
                            <button onclick="addToCart(${p.id})" style="padding:10px 20px;border-radius:999px;background:var(--maroon-light);color:white;border:none;cursor:pointer;font-weight:700;">Add to Cart</button>
                        </td>
                    `).join('')}
                </tr>
            </tbody>
        </table>
    `;
    
    document.getElementById('compareContainer').innerHTML = tableHtml;
    
    // Trigger Gemini AI report
    await fetchAICompareReport(ids);
}

function removeFromComparePage(productId) {
    compareList = compareList.filter(id => id !== productId);
    localStorage.setItem('compareList', JSON.stringify(compareList));
    const url = new URL(window.location.href);
    url.searchParams.set('ids', compareList.join(','));
    window.location.href = url.toString();
}

async function fetchAICompareReport(ids) {
    const reportBox = document.getElementById('analysisText');
    if (!reportBox) return;
    
    reportBox.innerHTML = `
        <div class="ai-loading" style="padding:30px;background:rgba(255,255,255,0.02);border-radius:24px;border:1px solid var(--line);text-align:center;">
            <p>🤖 StyleCart AI is analyzing product specs...</p>
        </div>
    `;
    
    try {
        const data = await apiFetch('/compare', {
            method: 'POST',
            body: JSON.stringify({ productIds: ids })
        });
        
        let reportMarkdown = data.analysis || "Failed to generate comparison report.";
        // Simple Markdown Parsers
        reportMarkdown = reportMarkdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        reportMarkdown = reportMarkdown.replace(/\*(.*?)\*/g, '<em>$1</em>');
        reportMarkdown = reportMarkdown.replace(/### (.*?)\n/g, '<h4 style="font-size:1.25rem;font-weight:900;margin:16px 0 8px;">$1</h4>');
        reportMarkdown = reportMarkdown.replace(/- (.*?)\n/g, '<li style="margin-left:20px;margin-bottom:6px;">$1</li>');
        reportMarkdown = reportMarkdown.replace(/\n/g, '<br>');
        
        reportBox.innerHTML = `
            <div class="ai-report-body" style="padding:30px;background:rgba(143,29,45,0.05);border-radius:24px;border:1px solid rgba(143,29,45,0.2);line-height:1.6;">
                <h3 style="font-size:1.5rem;font-weight:900;margin-bottom:15px;display:flex;align-items:center;gap:10px;">
                    <span>🤖</span> StyleCart AI Smart Summary
                </h3>
                <div>${reportMarkdown}</div>
            </div>
        `;
    } catch (err) {
        console.error("AI Compare Report Error:", err);
        reportBox.innerHTML = `
            <div style="padding:20px;border-radius:16px;background:rgba(255,0,0,0.05);color:#ff4444;border:1px solid rgba(255,0,0,0.15);">
                AI comparison report currently unavailable.
            </div>
        `;
    }
}

// Expose globally
window.compareList = compareList;
window.toggleCompare = toggleCompare;
window.updateCompareButton = updateCompareButton;
window.goToCompare = goToCompare;
window.renderComparePage = renderComparePage;
window.removeFromComparePage = removeFromComparePage;
