// ========== AI ASSISTANT MODULE ==========

function generateLocalAIAnswer(query) {
    const all = window.ProductService ? window.ProductService.getAllProducts() : [];
    const qLower = (query || "").toLowerCase();
    
    // Extract budget
    const budgetMatch = qLower.match(/under\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
    const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;
    
    const stopWords = new Set(["the", "a", "an", "for", "in", "with", "show", "me", "what", "is", "are", "best", "good", "cheap", "find", "suggest", "buy", "under", "price", "to", "of", "can", "you", "tell"]);
    const words = qLower.replace(/[^\w\s]/g, " ").split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));
    
    let scored = all.map(p => {
        const name = (p.name || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        
        let score = 0;
        words.forEach(w => {
            const reg = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
            if (brand.toLowerCase() === w) score += 10;
            else if (reg.test(brand)) score += 6;
            if (reg.test(name)) score += 5;
            if (reg.test(cat)) score += 3;
            if (reg.test(desc)) score += 1;
        });
        
        return { product: p, score };
    });

    if (budget) {
        scored = scored.filter(item => item.product.price <= budget);
    }

    let matched = [];
    if (words.length > 0) {
        const withScore = scored.filter(item => item.score > 0);
        withScore.sort((a, b) => b.score - a.score || b.product.rating - a.product.rating);
        matched = withScore.map(item => item.product);
    }

    if (matched.length === 0 && budget) {
        matched = scored.map(item => item.product);
    }

    if (matched.length === 0) {
        matched = all.slice(0, 4);
    } else {
        matched = matched.slice(0, 4);
    }

    let header = `🛍️ <strong>StyleCart AI Recommendations:</strong><br><span style="color:var(--muted);font-size:0.85rem;">Based on "${query}", here are our verified product picks:</span>`;
    if (budget) {
        header = `🎯 <strong>StyleCart Budget Picks (Under ₹${budget.toLocaleString()}):</strong><br><span style="color:var(--muted);font-size:0.85rem;">Verified top deals fitting your budget criteria:</span>`;
    }

    const items = matched.map((p) => `
        <div style="margin-top:10px;padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08);text-align:left;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <strong style="color:white;font-size:0.92rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${p.name}">${p.name}</strong>
                <span style="color:#fbbf24;font-size:0.8rem;white-space:nowrap;">⭐ ${p.rating}</span>
            </div>
            <div style="color:var(--muted);font-size:0.8rem;margin:4px 0;line-height:1.4;">${p.description}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                <span style="color:white;font-weight:700;font-size:0.95rem;">₹${p.price.toLocaleString()} ${p.discount ? '<span style="color:#4ade80;font-size:0.75rem;">(' + p.discount + ')</span>' : ''}</span>
                <div style="display:flex;gap:4px;">
                    <button onclick="window.addToCart(${p.id});window.showNotification('Added to cart!');" style="padding:4px 10px;border-radius:999px;background:var(--maroon-light);color:white;border:none;font-size:0.75rem;font-weight:700;cursor:pointer;">Add</button>
                    <button onclick="window.goToProduct(${p.id})" style="padding:4px 10px;border-radius:999px;background:rgba(255,255,255,0.1);color:white;border:none;font-size:0.75rem;cursor:pointer;">View</button>
                </div>
            </div>
        </div>
    `).join("");

    return `${header}<div style="margin-top:6px;">${items}</div>`;
}

async function askAI(query) {
    if (!query || !query.trim()) return;
    const cleanQuery = query.trim();
    window.showNotification('🤖 StyleCart AI is searching catalog...', 'info');
    
    const container = document.getElementById('aiRecommendations');
    if (container) {
        container.innerHTML = `
            <div class="ai-loading" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;margin-top:20px;">
                <div class="skeleton-card" style="height:320px;background:rgba(255,255,255,0.03);border-radius:24px;animation:pulse 1.5s infinite;"></div>
                <div class="skeleton-card" style="height:320px;background:rgba(255,255,255,0.03);border-radius:24px;animation:pulse 1.5s infinite;"></div>
                <div class="skeleton-card" style="height:320px;background:rgba(255,255,255,0.03);border-radius:24px;animation:pulse 1.5s infinite;"></div>
                <div class="skeleton-card" style="height:320px;background:rgba(255,255,255,0.03);border-radius:24px;animation:pulse 1.5s infinite;"></div>
            </div>
        `;
    }
    
    let recommendations = [];
    let message = '';
    
    try {
        const data = await apiFetch('/ai-search', {
            method: 'POST',
            body: JSON.stringify({ query: cleanQuery })
        });
        if (data && data.recommendations && data.recommendations.length > 0) {
            recommendations = data.recommendations;
            message = data.message || `Found ${recommendations.length} matching products in catalog:`;
        }
    } catch (err) {
        console.warn('AI search backend offline, utilizing smart client-side matcher:', err);
    }
    
    // Client-side fallback if backend returned nothing or failed
    if (recommendations.length === 0 && window.ProductService) {
        const all = window.ProductService.getAllProducts();
        const qLower = cleanQuery.toLowerCase();
        
        const budgetMatch = qLower.match(/under\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
        const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;
        
        const stopWords = new Set(["the", "a", "an", "for", "in", "with", "show", "me", "what", "is", "are", "best", "good", "cheap", "find", "suggest", "buy", "under", "price"]);
        const words = qLower.replace(/[^\w\s]/g, " ").split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));
        
        recommendations = all.filter(p => {
            const name = (p.name || "").toLowerCase();
            const cat = (p.category || "").toLowerCase();
            const brand = (p.brand || "").toLowerCase();
            const desc = (p.description || "").toLowerCase();
            
            const matchesText = words.length === 0 || words.some(w => name.includes(w) || cat.includes(w) || brand.includes(w) || desc.includes(w));
            const matchesBudget = !budget || p.price <= budget;
            return matchesText && matchesBudget;
        });

        if (recommendations.length === 0 && words.length > 0) {
            recommendations = all.filter(p => {
                const name = (p.name || "").toLowerCase();
                const cat = (p.category || "").toLowerCase();
                return words.some(w => name.includes(w) || cat.includes(w));
            });
        }
        
        recommendations = (recommendations.length > 0 ? recommendations : all).slice(0, 8);
        message = budget 
            ? `Top verified products under ₹${budget.toLocaleString()} matching "${cleanQuery}":`
            : `Top verified recommendations matching "${cleanQuery}":`;
    }
    
    if (container && recommendations.length > 0) {
        container.innerHTML = `
            <div class="ai-recommendations" style="margin-top:30px;padding:24px;border-radius:24px;background:rgba(143,29,45,0.06);border:1px solid rgba(143,29,45,0.25);">
                <div class="ai-header" style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
                    <span class="ai-icon" style="font-size:2rem;">🤖</span>
                    <div>
                        <h3 style="font-size:1.25rem;font-weight:850;letter-spacing:-0.4px;">StyleCart AI Search Results</h3>
                        <p class="ai-message" style="color:var(--muted);margin-top:3px;font-size:0.9rem;">${message}</p>
                    </div>
                </div>
                <div class="product-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;">
                    ${recommendations.map(p => window.createProductCard(p, 'aiRecommendations')).join('')}
                </div>
            </div>
        `;
        container.scrollIntoView({ behavior: 'smooth' });
        if (window.attachTiltCards) window.attachTiltCards();
        window.showNotification(`Found ${recommendations.length} recommendations!`);
    } else {
        window.showNotification('Catalog scanned. Check popular categories below!', 'info');
    }
}

function toggleAIAssistant() {
    const existing = document.querySelector('.ai-assistant-popup');
    if (existing) {
        existing.remove();
        return;
    }
    
    const popup = document.createElement('div');
    popup.className = 'ai-assistant-popup';
    popup.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 24px;
        width: 380px;
        height: 520px;
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.15);
        background: rgba(18, 18, 18, 0.94);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        display: flex;
        flex-direction: column;
        z-index: 10000;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
    `;
    
    popup.innerHTML = `
        <div class="ai-assistant-header" style="padding:16px 20px;background:linear-gradient(135deg, var(--maroon), var(--maroon-light));display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:1.3rem;">🤖</span>
                <div>
                    <div style="font-weight:800;letter-spacing:0.5px;font-size:0.95rem;">StyleCart AI Assistant</div>
                    <div style="font-size:0.75rem;color:rgba(255,255,255,0.8);">Ask anything: products, prices, styling</div>
                </div>
            </div>
            <button onclick="this.closest('.ai-assistant-popup').remove()" style="background:none;border:none;color:white;cursor:pointer;font-size:1.2rem;padding:4px;">✕</button>
        </div>
        <div class="ai-assistant-body" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;">
            <div class="ai-message bot" style="align-self:flex-start;padding:12px 16px;border-radius:16px 16px 16px 4px;background:rgba(255,255,255,0.06);max-width:90%;font-size:0.88rem;line-height:1.5;">
                Hello! I am your <strong>StyleCart Shopping AI</strong>. Ask me for recommendations, budget deals under ₹500, phone comparisons, or styling advice.
            </div>
            <div class="ai-suggestions" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
                <button onclick="window.fillAIChat('Samsung or OnePlus phone under 25000')" style="padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:white;font-size:0.75rem;cursor:pointer;">📱 Phones under ₹25k</button>
                <button onclick="window.fillAIChat('Wireless earbuds under 999')" style="padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:white;font-size:0.75rem;cursor:pointer;">🎧 Earbuds under ₹999</button>
                <button onclick="window.fillAIChat('Kurtas and sneakers starting 299')" style="padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:white;font-size:0.75rem;cursor:pointer;">👗 Fashion from ₹299</button>
                <button onclick="window.fillAIChat('Cookware and home essentials under 499')" style="padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:white;font-size:0.75rem;cursor:pointer;">🍳 Home under ₹499</button>
            </div>
        </div>
        <div class="ai-assistant-footer" style="padding:12px;border-top:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.3);display:flex;gap:8px;align-items:center;">
            <input type="text" id="aiChatInput" placeholder="Ask: 'Show earbuds under 1000'..." style="flex:1;padding:10px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:white;font-size:0.88rem;outline:none;" onkeyup="if(event.key==='Enter') window.sendAIMessage()">
            <button onclick="window.sendAIMessage()" style="padding:10px 18px;border-radius:999px;background:var(--maroon-light);color:white;border:none;font-weight:750;cursor:pointer;font-size:0.85rem;">Send</button>
        </div>
    `;
    document.body.appendChild(popup);
    document.getElementById('aiChatInput')?.focus();
}

function fillAIChat(text) {
    const input = document.getElementById('aiChatInput');
    if (input) {
        input.value = text;
        window.sendAIMessage();
    }
}

async function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    if (!input || !input.value.trim()) return;
    
    const query = input.value.trim();
    const body = document.querySelector('.ai-assistant-body');
    if (!body) return;
    
    // Add user bubble
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message user';
    userMsg.style.cssText = 'align-self:flex-end;padding:10px 16px;border-radius:16px 16px 4px 16px;background:var(--maroon-light);max-width:85%;font-size:0.88rem;line-height:1.45;color:white;';
    userMsg.textContent = query;
    body.appendChild(userMsg);
    body.scrollTop = body.scrollHeight;
    
    input.value = '';
    
    // Typing placeholder
    const typing = document.createElement('div');
    typing.className = 'ai-message bot typing';
    typing.style.cssText = 'align-self:flex-start;padding:10px 16px;border-radius:16px 16px 16px 4px;background:rgba(255,255,255,0.06);max-width:85%;font-size:0.85rem;color:var(--muted);';
    typing.textContent = '🤖 Searching catalog and analyzing specs...';
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
    
    const botMsg = document.createElement('div');
    botMsg.className = 'ai-message bot';
    botMsg.style.cssText = 'align-self:flex-start;padding:12px 16px;border-radius:16px 16px 16px 4px;background:rgba(255,255,255,0.06);max-width:92%;font-size:0.88rem;line-height:1.45;color:white;';

    try {
        const data = await apiFetch('/chat', {
            method: 'POST',
            body: JSON.stringify({ message: query })
        });
        
        typing.remove();
        
        if (data && data.success && data.reply) {
            let replyText = data.reply;
            replyText = replyText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            replyText = replyText.replace(/\*(.*?)\*/g, '<em>$1</em>');
            replyText = replyText.replace(/\n/g, '<br>');
            botMsg.innerHTML = replyText;
        } else {
            botMsg.innerHTML = generateLocalAIAnswer(query);
        }
    } catch (error) {
        typing.remove();
        botMsg.innerHTML = generateLocalAIAnswer(query);
    }

    body.appendChild(botMsg);
    body.scrollTop = body.scrollHeight;
}

// Expose globally
window.askAI = askAI;
window.toggleAIAssistant = toggleAIAssistant;
window.fillAIChat = fillAIChat;
window.sendAIMessage = sendAIMessage;
window.generateLocalAIAnswer = generateLocalAIAnswer;
