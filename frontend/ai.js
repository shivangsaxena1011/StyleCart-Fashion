// ========== AI ASSISTANT MODULE ==========

async function askAI(query) {
    if (!query || !query.trim()) return;
    window.showNotification('🤖 StyleCart AI is searching catalog...', 'info');
    
    const container = document.getElementById('aiRecommendations');
    if (container) {
        container.innerHTML = `
            <div class="ai-loading" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;margin-top:20px;">
                <div class="skeleton-card" style="height:380px;background:rgba(255,255,255,0.03);border-radius:24px;animation:pulse 1.5s infinite;"></div>
                <div class="skeleton-card" style="height:380px;background:rgba(255,255,255,0.03);border-radius:24px;animation:pulse 1.5s infinite;"></div>
                <div class="skeleton-card" style="height:380px;background:rgba(255,255,255,0.03);border-radius:24px;animation:pulse 1.5s infinite;"></div>
            </div>
        `;
    }
    
    try {
        const data = await apiFetch('/ai-search', {
            method: 'POST',
            body: JSON.stringify({ query: query.trim() })
        });
        
        if (data.recommendations && data.recommendations.length > 0) {
            if (container) {
                container.innerHTML = `
                    <div class="ai-recommendations" style="margin-top:40px;padding:30px;border-radius:28px;background:rgba(143,29,45,0.05);border:1px solid rgba(143,29,45,0.2);">
                        <div class="ai-header" style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
                            <span class="ai-icon" style="font-size:2.2rem;">🤖</span>
                            <div>
                                <h3 style="font-size:1.4rem;font-weight:900;">StyleCart AI Search Assistant</h3>
                                <p class="ai-message" style="color:var(--muted);margin-top:4px;">${data.message || 'Based on your query, here is what I recommend:'}</p>
                            </div>
                        </div>
                        <div class="product-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;">
                            ${data.recommendations.map(p => window.createProductCard(p, 'aiRecommendations')).join('')}
                        </div>
                    </div>
                `;
                container.scrollIntoView({ behavior: 'smooth' });
                // Re-initialize hover/tilt bindings if they exist
                if (window.attachTiltCards) window.attachTiltCards();
            }
            window.showNotification(`Found ${data.recommendations.length} recommendations!`);
        } else {
            window.showNotification('No recommendations found.', 'info');
        }
    } catch (error) {
        console.error('AI Search Error:', error);
        window.showNotification('AI service unavailable. Using local keywords...');
        // Local keywords fallback search
        const fallback = window.ProductService.searchProducts(query).slice(0, 4);
        if (container && fallback.length > 0) {
            container.innerHTML = `
                <div class="ai-recommendations" style="margin-top:40px;padding:30px;border-radius:28px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.1);">
                    <div class="ai-header" style="margin-bottom:20px;">
                        <h3>Local Catalog Results</h3>
                        <p style="color:var(--muted);">Showing direct keyword matches.</p>
                    </div>
                    <div class="product-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;">
                        ${fallback.map(p => window.createProductCard(p, 'aiRecommendations')).join('')}
                    </div>
                </div>
            `;
        }
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
        bottom: 100px;
        right: 30px;
        width: 380px;
        height: 500px;
        border-radius: 28px;
        border: 1px solid rgba(255,255,255,0.15);
        background: rgba(18, 18, 18, 0.88);
        backdrop-filter: blur(20px);
        display: flex;
        flex-direction: column;
        z-index: 10000;
        box-shadow: var(--shadow);
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
    `;
    
    popup.innerHTML = `
        <div class="ai-assistant-header" style="padding:18px 24px;background:linear-gradient(135deg, var(--maroon), var(--maroon-light));display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.1);">
            <span style="font-weight:900;letter-spacing:1px;font-size:1.05rem;">🤖 StyleCart AI Stylist</span>
            <button onclick="this.closest('.ai-assistant-popup').remove()" style="background:none;border:none;color:white;cursor:pointer;font-size:1.2rem;">✕</button>
        </div>
        <div class="ai-assistant-body" style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px;">
            <div class="ai-message bot" style="align-self:flex-start;padding:12px 18px;border-radius:16px 16px 16px 4px;background:rgba(255,255,255,0.06);max-width:85%;font-size:0.95rem;line-height:1.5;">
                Hello! I am StyleCart AI, your personalized shopper. Ask me for recommendations, compare specs, or style guides.
            </div>
            <div class="ai-suggestions" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
                <button onclick="window.fillAIChat('best laptop under 150000')" style="padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:white;font-size:0.8rem;cursor:pointer;">💻 Best Laptop</button>
                <button onclick="window.fillAIChat('compare rolex and tag heuer')" style="padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:white;font-size:0.8rem;cursor:pointer;">⌚ Compare Watches</button>
                <button onclick="window.fillAIChat('luxury perfumes')" style="padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:white;font-size:0.8rem;cursor:pointer;">💎 Luxury Perfumes</button>
                <button onclick="window.fillAIChat('budget phone under 50000')" style="padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:white;font-size:0.8rem;cursor:pointer;">📱 Budget Phones</button>
            </div>
        </div>
        <div class="ai-assistant-footer" style="padding:14px;border-top:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.2);display:flex;gap:8px;align-items:center;">
            <input type="text" id="aiChatInput" placeholder="Ask anything..." style="flex:1;padding:12px 18px;border-radius:999px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:white;font-size:0.95rem;outline:none;" onkeyup="if(event.key==='Enter') window.sendAIMessage()">
            <button onclick="window.sendAIMessage()" style="padding:12px 20px;border-radius:999px;background:var(--maroon-light);color:white;border:none;font-weight:700;cursor:pointer;">Send</button>
            <button onclick="window.startVoiceSearch()" class="voice-btn" style="background:none;border:none;font-size:1.3rem;cursor:pointer;padding:4px;">🎤</button>
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
    
    // Add user bubble
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message user';
    userMsg.style.cssText = 'align-self:flex-end;padding:12px 18px;border-radius:16px 16px 4px 16px;background:var(--maroon-light);max-width:85%;font-size:0.95rem;line-height:1.5;color:white;';
    userMsg.textContent = query;
    body.appendChild(userMsg);
    body.scrollTop = body.scrollHeight;
    
    input.value = '';
    
    // Typing placeholder
    const typing = document.createElement('div');
    typing.className = 'ai-message bot typing';
    typing.style.cssText = 'align-self:flex-start;padding:12px 18px;border-radius:16px 16px 16px 4px;background:rgba(255,255,255,0.06);max-width:85%;font-size:0.95rem;color:var(--muted);';
    typing.textContent = '🤖 Thinking...';
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
    
    try {
        const data = await apiFetch('/chat', {
            method: 'POST',
            body: JSON.stringify({ message: query })
        });
        
        typing.remove();
        
        const botMsg = document.createElement('div');
        botMsg.className = 'ai-message bot';
        botMsg.style.cssText = 'align-self:flex-start;padding:12px 18px;border-radius:16px 16px 16px 4px;background:rgba(255,255,255,0.06);max-width:85%;font-size:0.95rem;line-height:1.5;color:white;';
        
        // Simple markdown replacement for clean display
        let replyText = data.reply || "I couldn't process this query. Please try searching instead.";
        replyText = replyText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        replyText = replyText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        replyText = replyText.replace(/\n/g, '<br>');
        
        botMsg.innerHTML = replyText;
        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;
        
    } catch (error) {
        typing.remove();
        const errorMsg = document.createElement('div');
        errorMsg.className = 'ai-message bot';
        errorMsg.style.cssText = 'align-self:flex-start;padding:12px 18px;border-radius:16px;background:rgba(255,0,0,0.1);color:#ff4444;max-width:85%;';
        errorMsg.textContent = 'Sorry, AI service is busy. Please try again.';
        body.appendChild(errorMsg);
        body.scrollTop = body.scrollHeight;
    }
}

// Expose globally
window.askAI = askAI;
window.toggleAIAssistant = toggleAIAssistant;
window.fillAIChat = fillAIChat;
window.sendAIMessage = sendAIMessage;
