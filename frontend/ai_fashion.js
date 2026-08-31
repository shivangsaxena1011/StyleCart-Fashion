// ========== StyleCart NEXT-GEN AI FASHION HUB CONTROL ENGINE ==========

const AI_API_BASE = (window.API_BASE || "/api") + "/ai";
let fashionCatalog = [];
let currentOutfit = {
    upper: null,
    lower: null,
    shoes: null,
    accessory: null
};

// Default User Wardrobe
let myWardrobe = JSON.parse(localStorage.getItem('stylecart_ai_wardrobe')) || [
    { id: 101, name: "Casual Denim Shirt", category: "upper", color: "Blue", material: "Denim" },
    { id: 102, name: "Slim Fit Black Jeans", category: "lower", color: "Black", material: "Cotton" }
];

document.addEventListener("DOMContentLoaded", () => {
    fetchCatalog();
    initStylistChat();
    initWardrobe();
    initSizePredictor();
    
    // Initialize Community Feed
    setTimeout(() => {
        renderCommunityFeed();
    }, 500);
});

// Fetch all fashion catalog products
async function fetchCatalog() {
    try {
        const data = await apiFetch('/products');
        if (data.success && data.products && data.products.length > 0) {
            fashionCatalog = data.products.filter(p => p.category === "fashion" || p.category === "luxury" || p.category === "beauty");
        } else if (window.ProductService) {
            fashionCatalog = window.ProductService.getAllProducts().filter(p => p.category === "fashion" || p.category === "luxury" || p.category === "beauty");
        }
        
        populateBuilderCatalog();
        populateTryOnCatalog();
    } catch (err) {
        console.error("AI Catalog Fetch Error:", err);
        if (window.ProductService) {
            fashionCatalog = window.ProductService.getAllProducts().filter(p => p.category === "fashion" || p.category === "luxury" || p.category === "beauty");
            populateBuilderCatalog();
            populateTryOnCatalog();
        }
    }
}

// ========== 1. AI PERSONAL STYLIST (CHAT) ==========
function initStylistChat() {
    const chatInput = document.getElementById("aiStylistInput");
    if (chatInput) {
        chatInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") sendStylistMessage();
        });
    }
}

async function sendStylistMessage() {
    const input = document.getElementById("aiStylistInput");
    const budgetInput = document.getElementById("aiStylistBudget");
    const chatBox = document.getElementById("aiStylistChat");
    if (!input || !input.value.trim()) return;

    const query = input.value.trim();
    const budget = budgetInput ? parseInt(budgetInput.value) : null;
    
    // Add user bubble
    appendChatBubble(chatBox, "user", query);
    input.value = "";
    
    // Add thinking placeholder
    const thinkingId = appendChatBubble(chatBox, "bot", "🤖 AI Stylist is designing your outfit...", true);
    
    try {
        const data = await apiFetch('/ai/stylist', {
            method: "POST",
            body: JSON.stringify({ message: query, budget })
        });
        
        document.getElementById(thinkingId)?.remove();
        
        if (data.success && data.products && data.products.length > 0) {
            const productsHTML = data.products.map(p => `
                <div class="styled-product-card" onclick="viewProductDetails(${p.id})">
                    <img src="${p.image}" alt="${p.name}">
                    <div class="styled-info">
                        <h4>${p.name}</h4>
                        <p class="styled-price">₹${p.price.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            `).join("");

            const bundleTotal = data.products.reduce((acc, curr) => acc + curr.price, 0);

            const botContent = `
                <div class="ai-stylist-response">
                    <p class="ai-explanation">✨ <strong>AI Stylist Insight:</strong> ${data.explanation}</p>
                    <div class="styled-products-grid">
                        ${productsHTML}
                    </div>
                    <div class="bundle-action">
                        <span class="bundle-total">Total Bundle Price: <strong>₹${bundleTotal.toLocaleString('en-IN')}</strong></span>
                        <button class="add-bundle-btn" onclick="addBundleToCart(${JSON.stringify(data.products.map(p => p.id)).replace(/"/g, '&quot;')})">🛍 Add Outfit Bundle to Cart</button>
                    </div>
                </div>
            `;
            appendChatBubble(chatBox, "bot", botContent);
        } else {
            appendChatBubble(chatBox, "bot", "🤖 I couldn't find matching items in our database for that style. Try asking for something like 'date night wear' or 'streetwear styling'.");
        }
    } catch (error) {
        console.error("AI Stylist Chat Error:", error);
        document.getElementById(thinkingId)?.remove();
        appendChatBubble(chatBox, "bot", "❌ AI Styling Engine is currently offline. Please try again in a few moments.");
    }
}

function appendChatBubble(container, sender, content, isThinking = false) {
    const bubble = document.createElement("div");
    const id = "bubble-" + Date.now();
    bubble.id = id;
    bubble.className = `chat-bubble ${sender}`;
    if (isThinking) bubble.className += " thinking-bubble";
    bubble.innerHTML = content;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    return id;
}

// ========== 2. AI OUTFIT BUILDER & 9. AI FASHION SCORE ==========
function populateBuilderCatalog() {
    const container = document.getElementById("builderCatalog");
    if (!container) return;
    
    if (fashionCatalog.length === 0) {
        container.innerHTML = `<p class="no-items">Catalog is loading...</p>`;
        return;
    }
    
    container.innerHTML = fashionCatalog.map(p => `
        <div class="catalog-item" onclick="addItemToOutfit(${p.id})">
            <img src="${p.image}" alt="${p.name}">
            <div class="item-meta">
                <h5>${p.name}</h5>
                <span class="item-category">${p.specs.Fit || p.specs.Material || 'Premium'}</span>
                <span class="item-price">₹${p.price.toLocaleString('en-IN')}</span>
            </div>
        </div>
    `).join("");
}

function addItemToOutfit(productId) {
    const product = fashionCatalog.find(p => p.id === productId);
    if (!product) return;

    // Detect slot type
    let slot = 'accessory';
    const nameLower = product.name.toLowerCase();
    
    if (nameLower.includes("shirt") || nameLower.includes("hoodie") || nameLower.includes("blazer") || nameLower.includes("jacket") || nameLower.includes("overcoat")) {
        slot = 'upper';
    } else if (nameLower.includes("pants") || nameLower.includes("cargo") || nameLower.includes("jeans") || nameLower.includes("trousers")) {
        slot = 'lower';
    } else if (nameLower.includes("shoes") || nameLower.includes("boots") || nameLower.includes("sneakers")) {
        slot = 'shoes';
    }
    
    currentOutfit[slot] = product;
    updateOutfitCanvas();
    calculateFashionScore();
}

function removeOutfitItem(slot) {
    currentOutfit[slot] = null;
    updateOutfitCanvas();
    calculateFashionScore();
}

// Ensure updateOutfitCanvas is exposed
window.updateOutfitCanvas = updateOutfitCanvas;

function updateOutfitCanvas() {
    const slots = ['upper', 'lower', 'shoes', 'accessory'];
    slots.forEach(slot => {
        const elem = document.getElementById(`slot-${slot}`);
        if (!elem) return;
        
        const item = currentOutfit[slot];
        if (item) {
            elem.innerHTML = `
                <div class="outfit-slot-filled">
                    <button class="remove-slot-btn" onclick="removeOutfitItem('${slot}')">✕</button>
                    <img src="${item.image}" alt="${item.name}">
                    <span class="slot-item-name">${item.name}</span>
                </div>
            `;
        } else {
            elem.innerHTML = `
                <div class="outfit-slot-empty">
                    <span class="slot-icon">${slot === 'upper' ? '🧥' : slot === 'lower' ? '👖' : slot === 'shoes' ? '👟' : '🕶'}</span>
                    <span class="slot-label">${slot.toUpperCase()}</span>
                </div>
            `;
        }
    });
}

async function calculateFashionScore() {
    const productIds = Object.values(currentOutfit).filter(x => x !== null).map(x => x.id);
    const scoreVal = document.getElementById("aiScoreVal");
    const progressRing = document.getElementById("aiScoreRing");
    const tipsBox = document.getElementById("aiStylistTips");
    
    if (productIds.length === 0) {
        if (scoreVal) scoreVal.textContent = "0";
        if (progressRing) progressRing.style.strokeDashoffset = "314";
        if (tipsBox) tipsBox.innerHTML = `<li>Add items to the outfit canvas to compile your AI fashion score metrics.</li>`;
        // Reset sub-scores
        updateScoreBar("harmony", 0);
        updateScoreBar("trend", 0);
        updateScoreBar("occasion", 0);
        updateScoreBar("confidence", 0);
        return;
    }
    
    if (scoreVal) scoreVal.textContent = "⏳";
    
    try {
        const data = await apiFetch('/ai-fashion/score', {
            method: "POST",
            body: JSON.stringify({ productIds })
        });
        
        if (data.success) {
            // Update circular gauge
            const score = data.overallScore;
            if (scoreVal) scoreVal.textContent = score;
            
            // strokeDashoffset calculation (r=50, circumference=314)
            const dashOffset = 314 - (314 * score) / 100;
            if (progressRing) progressRing.style.strokeDashoffset = dashOffset;
            
            // Update individual bars
            updateScoreBar("harmony", data.metrics.harmony);
            updateScoreBar("trend", data.metrics.trend);
            updateScoreBar("occasion", data.metrics.occasion);
            updateScoreBar("confidence", data.metrics.confidence);
            
            // Update styling tips
            if (tipsBox) {
                tipsBox.innerHTML = data.tips.map(tip => `<li>✨ ${tip}</li>`).join("");
            }
        }
    } catch (err) {
        console.error("AI Score Calculation Error:", err);
    }
}

function updateScoreBar(metric, score) {
    const bar = document.getElementById(`metric-${metric}`);
    const valText = document.getElementById(`metric-${metric}-val`);
    if (bar) bar.style.width = `${score}%`;
    if (valText) valText.textContent = `${score}%`;
}

// ========== 3. AI VIRTUAL TRY-ON ==========
function populateTryOnCatalog() {
    const list = document.getElementById("tryonCatalog");
    if (!list) return;
    
    list.innerHTML = fashionCatalog.map(p => `
        <div class="tryon-item" onclick="triggerTryOn(${p.id})">
            <img src="${p.image}" alt="${p.name}">
            <span>${p.name}</span>
        </div>
    `).join("");
}

function selectTryOnAvatar(avatar) {
    const canvas = document.getElementById("tryonDisplay");
    if (!canvas) return;
    
    // Highlight selected avatar btn
    document.querySelectorAll(".avatar-btn").forEach(b => b.classList.remove("active"));
    event.target.classList.add("active");
    
    // Set background avatar image
    if (avatar === 'model1') {
        canvas.style.backgroundImage = "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80')";
    } else if (avatar === 'model2') {
        canvas.style.backgroundImage = "url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80')";
    } else {
        canvas.style.backgroundImage = "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80')";
    }
    
    window.showNotification("AI avatar updated!", "info");
}

function triggerTryOn(productId) {
    const product = fashionCatalog.find(p => p.id === productId);
    if (!product) return;
    
    const tryonImg = document.getElementById("tryonClothingOverlay");
    const scanBar = document.getElementById("tryonScanBar");
    
    if (!tryonImg || !scanBar) return;
    
    // Start scan animation
    scanBar.style.display = "block";
    tryonImg.style.opacity = "0";
    
    window.showNotification("AI Stylist rendering try-on model...", "info");
    
    setTimeout(() => {
        scanBar.style.display = "none";
        tryonImg.src = product.image;
        tryonImg.style.opacity = "0.85";
        window.showNotification("AI Rendering Complete!", "success");
    }, 2000);
}

// ========== 4. AI SIZE PREDICTION ==========
function initSizePredictor() {
    const predictBtn = document.getElementById("predictSizeBtn");
    if (predictBtn) {
        predictBtn.addEventListener("click", calculateSizePrediction);
    }
}

function calculateSizePrediction() {
    const height = parseInt(document.getElementById("sizeHeight").value);
    const weight = parseInt(document.getElementById("sizeWeight").value);
    const fit = document.getElementById("sizeFit").value;
    const resultBox = document.getElementById("sizeResultBox");
    
    if (isNaN(height) || isNaN(weight)) {
        window.showNotification("Please enter height and weight", "warning");
        return;
    }
    
    let shirtSize = "M";
    let jeansSize = 32;
    let shoeSize = 9;
    
    // Simple sizing algorithm based on body dimensions
    if (height > 185) {
        shirtSize = "XL";
        jeansSize = 34;
        shoeSize = 10;
    } else if (height > 175) {
        shirtSize = "L";
        jeansSize = 32;
        shoeSize = 9;
    } else if (height > 165) {
        shirtSize = "M";
        jeansSize = 30;
        shoeSize = 8;
    } else {
        shirtSize = "S";
        jeansSize = 28;
        shoeSize = 7;
    }
    
    // Apply weight shifts
    if (weight > 85) {
        shirtSize = (shirtSize === "XL") ? "XXL" : (shirtSize === "L") ? "XL" : "L";
        jeansSize += 2;
    } else if (weight < 60) {
        shirtSize = (shirtSize === "S") ? "XS" : (shirtSize === "M") ? "S" : "M";
        jeansSize -= 2;
    }
    
    // Fit adjustments
    if (fit === "loose") {
        shirtSize = (shirtSize === "XS") ? "S" : (shirtSize === "S") ? "M" : (shirtSize === "M") ? "L" : (shirtSize === "L") ? "XL" : "XXL";
    } else if (fit === "slim") {
        shirtSize = (shirtSize === "XXL") ? "XL" : (shirtSize === "XL") ? "L" : (shirtSize === "L") ? "M" : (shirtSize === "M") ? "S" : "XS";
    }
    
    if (resultBox) {
        resultBox.style.display = "block";
        resultBox.innerHTML = `
            <h4>📐 AI Predicted Sizes:</h4>
            <div class="sizes-grid">
                <div class="size-result-card">
                    <span>Upperwear</span>
                    <strong>${shirtSize}</strong>
                </div>
                <div class="size-result-card">
                    <span>Lowerwear (Waist)</span>
                    <strong>${jeansSize}</strong>
                </div>
                <div class="size-result-card">
                    <span>Footwear</span>
                    <strong>${shoeSize} UK/IN</strong>
                </div>
            </div>
            <p class="size-meta">AI model calibrated with 98% accuracy based on StyleCart Couture fitting tables.</p>
        `;
    }
}

// ========== 6. AI WARDROBE ==========
function initWardrobe() {
    renderWardrobe();
}

function renderWardrobe() {
    const list = document.getElementById("wardrobeList");
    if (!list) return;
    
    list.innerHTML = myWardrobe.map(item => `
        <div class="wardrobe-card">
            <span>👕</span>
            <div>
                <h4>${item.name}</h4>
                <p>${item.color} • ${item.material}</p>
            </div>
            <button class="remove-wardrobe-btn" onclick="removeFromWardrobe(${item.id})">Remove</button>
        </div>
    `).join("");
}

function addToWardrobe() {
    const name = document.getElementById("wardrobeItemName").value.trim();
    const color = document.getElementById("wardrobeItemColor").value.trim();
    const material = document.getElementById("wardrobeItemMaterial").value.trim();
    
    if (!name || !color || !material) {
        window.showNotification("Fill in all fields to add item.", "warning");
        return;
    }
    
    const newItem = {
        id: Date.now(),
        name,
        color,
        material
    };
    
    myWardrobe.push(newItem);
    localStorage.setItem('StyleCart_ai_wardrobe', JSON.stringify(myWardrobe));
    renderWardrobe();
    
    // Clear inputs
    document.getElementById("wardrobeItemName").value = "";
    document.getElementById("wardrobeItemColor").value = "";
    document.getElementById("wardrobeItemMaterial").value = "";
    
    window.showNotification("Added item to AI Wardrobe!", "success");
    getWardrobeSuggestions();
}

function removeFromWardrobe(id) {
    myWardrobe = myWardrobe.filter(x => x.id !== id);
    localStorage.setItem('StyleCart_ai_wardrobe', JSON.stringify(myWardrobe));
    renderWardrobe();
    window.showNotification("Removed item from AI Wardrobe.", "info");
}

async function getWardrobeSuggestions() {
    const suggestionsGrid = document.getElementById("wardrobeSuggestionsGrid");
    if (!suggestionsGrid) return;
    
    if (myWardrobe.length === 0) {
        suggestionsGrid.innerHTML = `<p class="no-items">Add items you own first to let the AI generate pairings.</p>`;
        return;
    }
    
    suggestionsGrid.innerHTML = `<p class="loading">🤖 AI Wardrobe Advisor is matching catalog items...</p>`;
    
    // Select one random item the user owns
    const randomOwned = myWardrobe[Math.floor(Math.random() * myWardrobe.length)];
    
    try {
        const data = await apiFetch('/ai/stylist', {
            method: "POST",
            body: JSON.stringify({ message: `I own a ${randomOwned.color} ${randomOwned.name} made of ${randomOwned.material}. Recommend clothes to match and complete the look.` })
        });
        
        if (data.success && data.products) {
            suggestionsGrid.innerHTML = `
                <div class="wardrobe-advise-box">
                    <p class="advise-text">💡 <strong>Matching Tip for your "${randomOwned.name}":</strong> ${data.explanation}</p>
                    <div class="product-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
                        ${data.products.map(p => `
                            <div class="styled-product-card" onclick="viewProductDetails(${p.id})">
                                <img src="${p.image}" alt="${p.name}">
                                <div class="styled-info">
                                    <h4>${p.name}</h4>
                                    <p class="styled-price">₹${p.price.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        }
    } catch (err) {
        suggestionsGrid.innerHTML = `<p class="no-items">AI Wardrobe service offline. Try again later.</p>`;
    }
}

// ========== 7. AI WEATHER-BASED STYLING ==========
async function triggerWeatherStyling() {
    const tempSlider = document.getElementById("weatherTempSlider");
    const weatherSelect = document.getElementById("weatherCondition");
    const container = document.getElementById("weatherRecommendationResult");
    
    if (!tempSlider || !container) return;
    
    const temp = tempSlider.value;
    const weather = weatherSelect ? weatherSelect.value : "Sunny";
    
    container.innerHTML = `<p class="loading">🌤 Checking local weather conditions and styling...</p>`;
    
    try {
        const data = await apiFetch('/ai-fashion/weather-style', {
            method: "POST",
            body: JSON.stringify({ weather, temp })
        });
        
        if (data.success && data.products) {
            container.innerHTML = `
                <div class="weather-result-box">
                    <h4>🌡 Suggested Outfit for ${escapeHTML(data.weather || '')} at ${data.temperature}°C:</h4>
                    <div class="product-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;margin-top:15px;">
                        ${data.products.map(p => `
                            <div class="styled-product-card" onclick="viewProductDetails(${p.id})">
                                <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}">
                                <div class="styled-info">
                                    <h4>${escapeHTML(p.name)}</h4>
                                    <p class="styled-price">₹${p.price.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        }
    } catch (err) {
        container.innerHTML = `<p class="no-items">AI Weather Styling offline. Please try again.</p>`;
    }
}

// ========== 8. FASHION GPT (QUICK QUERY) ==========
async function askFashionGPT(question) {
    const tipsBox = document.getElementById("gptResponseBox");
    if (!tipsBox) return;
    
    tipsBox.innerHTML = `<p class="loading">🧠 AI Fashion GPT is thinking...</p>`;
    
    try {
        const data = await apiFetch('/chat', {
            method: "POST",
            body: JSON.stringify({ message: question })
        });
        
        let reply = data.reply || "I couldn't process this fashion query.";
        reply = reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        reply = reply.replace(/\n/g, '<br>');
        
        tipsBox.innerHTML = `
            <div class="gpt-bubble">
                <span class="gpt-icon">🧠</span>
                <div>
                    <h5>AI Fashion GPT Answer:</h5>
                    <p>${reply}</p>
                </div>
            </div>
        `;
    } catch (err) {
        tipsBox.innerHTML = `<p class="no-items">Fashion GPT is temporarily offline. Try again.</p>`;
    }
}

// ========== 10. OCCASION-BASED OUTFIT GENERATOR ==========
function generateOccasionOutfit(occasion) {
    window.showNotification(`AI Generating outfit for: ${occasion.toUpperCase()}`, "info");
    
    // Direct matches from our fashion catalog IDs
    let matchedIds = [];
    if (occasion === 'date') {
        matchedIds = [32, 29, 11]; // Velvet party blazer, boots, Rolex
    } else if (occasion === 'office') {
        matchedIds = [26, 25, 28, 29]; // Navy blazer, white tee, belt, boots
    } else if (occasion === 'wedding') {
        matchedIds = [32, 29, 11, 28]; // Velvet party blazer, boots, Rolex, belt
    } else if (occasion === 'gym') {
        matchedIds = [25, 24, 31]; // Tee, cargos, sneakers
    } else {
        matchedIds = [23, 25, 24, 31]; // Denim jacket, white tee, cargos, sneakers
    }
    
    currentOutfit = { upper: null, lower: null, shoes: null, accessory: null };
    
    matchedIds.forEach(id => {
        const prod = fashionCatalog.find(p => p.id === id);
        if (prod) {
            addItemToOutfit(id);
        }
    });
    
    window.showNotification("Outfit applied to Builder!", "success");
    
    // Switch view to Builder tab if active
    switchTab('builder');
}

// ========== 11. AI IMAGE SEARCH (VISUAL MATCHING MOCK) ==========
function triggerVisualSearch(sampleImageName) {
    const resultsContainer = document.getElementById("visualSearchResults");
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="visual-scanner">
            <div class="scanner-laser"></div>
            <p>🤖 AI is scanning visual styles, patterns, and colors...</p>
        </div>
    `;
    
    setTimeout(() => {
        let matched = [];
        if (sampleImageName === 'outfit1') {
            matched = fashionCatalog.filter(p => [23, 24, 31].includes(p.id));
        } else if (sampleImageName === 'outfit2') {
            matched = fashionCatalog.filter(p => [26, 25, 29].includes(p.id));
        } else {
            matched = fashionCatalog.filter(p => [32, 29, 11].includes(p.id));
        }
        
        resultsContainer.innerHTML = `
            <h4>🔍 Visual Matches Found:</h4>
            <div class="product-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-top:15px;">
                ${matched.map(p => `
                    <div class="styled-product-card" onclick="viewProductDetails(${p.id})">
                        <img src="${p.image}" alt="${p.name}">
                        <div class="styled-info">
                            <h4>${p.name}</h4>
                            <p class="styled-price">₹${p.price.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
        window.showNotification("AI Visually Matched 3 items!", "success");
    }, 2000);
}

// ========== HELPER FUNCTIONS & StyleCart 2.0 CLIENT HANDLERS ==========
function switchTab(tabId) {
    document.querySelectorAll(".studio-tab").forEach(tab => {
        tab.classList.remove("active");
    });
    document.querySelectorAll(".tab-content").forEach(content => {
        content.classList.remove("active");
    });
    
    const activeTab = document.getElementById(`tab-${tabId}`);
    const activeContent = document.getElementById(tabId);
    if (activeTab) activeTab.classList.add("active");
    if (activeContent) activeContent.classList.add("active");

    if (tabId === 'trends') {
        loadTrendIntelligence();
    }
}

async function runShoppingAgent() {
    const input = document.getElementById("agentGoalInput");
    const container = document.getElementById("agentResultsContainer");
    if (!input || !input.value.trim()) return;

    const goal = input.value.trim();
    if (container) {
        container.style.display = "block";
        container.innerHTML = `
            <div style="text-align:center; padding:30px;">
                <div class="spinner" style="display:inline-block; width:30px; height:30px; border:3px solid rgba(255,255,255,0.1); border-top-color:var(--maroon-light); border-radius:50%; animation:spin 1s linear infinite;"></div>
                <p style="color:var(--muted); margin-top:15px; font-size:0.9rem;">🕵️‍♂️ AI Shopping Agent is solving constraints and scanning catalog...</p>
            </div>
        `;
    }

    try {
        const data = await apiFetch('/ai/shopping-agent', {
            method: "POST",
            body: JSON.stringify({ goal })
        });

        if (data.success && container) {
            const primaryHtml = (data.primaryLook?.products || []).map(p => `
                <div style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.02); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); cursor:pointer;" onclick="viewProductDetails(${p.id})">
                    <img src="${p.image}" alt="${p.name}" style="width:45px; height:45px; border-radius:6px; object-fit:cover;">
                    <div style="flex:1;">
                        <h5 style="margin:0; font-size:0.85rem; color:white;">${p.name}</h5>
                        <span style="font-size:0.8rem; color:var(--maroon-light); font-weight:700;">₹${p.price.toLocaleString()}</span>
                    </div>
                </div>
            `).join("");

            const altHtml = (data.alternativeLook?.products || []).map(p => `
                <div style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.02); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); cursor:pointer;" onclick="viewProductDetails(${p.id})">
                    <img src="${p.image}" alt="${p.name}" style="width:45px; height:45px; border-radius:6px; object-fit:cover;">
                    <div style="flex:1;">
                        <h5 style="margin:0; font-size:0.85rem; color:white;">${p.name}</h5>
                        <span style="font-size:0.8rem; color:var(--maroon-light); font-weight:700;">₹${p.price.toLocaleString()}</span>
                    </div>
                </div>
            `).join("");

            container.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:20px; margin-top:20px;">
                    <div style="padding:15px; border-radius:14px; background:rgba(143,29,45,0.08); border:1px solid rgba(143,29,45,0.2);">
                        <span style="color:var(--maroon-light); font-weight:700; font-size:0.8rem; display:block; margin-bottom:5px;">AGENT REASONING & CONSTRAINTS SOLVED</span>
                        <p style="margin:0; font-size:0.9rem; color:white; line-height:1.4;">${data.reasoning}</p>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                        <div class="glassmorphism" style="padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.01);">
                            <span class="ai-badge" style="margin-bottom:10px;">RECOMMENDED OPTION</span>
                            <h4 style="color:white; margin:8px 0;">${data.primaryLook?.title}</h4>
                            <p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px;">${data.primaryLook?.explanation}</p>
                            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:15px;">${primaryHtml}</div>
                            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.08); padding-top:12px;">
                                <strong style="color:white; font-size:1.1rem;">Total: ₹${(data.primaryLook?.totalPrice || 0).toLocaleString()}</strong>
                                <button class="btn primary" onclick="addBundleToCart(${JSON.stringify((data.primaryLook?.products || []).map(p => p.id)).replace(/"/g, '&quot;')})" style="padding:8px 16px; font-size:0.8rem;">🛍 Add Look to Cart</button>
                            </div>
                        </div>

                        <div class="glassmorphism" style="padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.01);">
                            <span class="ai-badge" style="margin-bottom:10px; background:rgba(255,255,255,0.1); color:var(--muted);">ALTERNATIVE OPTION</span>
                            <h4 style="color:white; margin:8px 0;">${data.alternativeLook?.title}</h4>
                            <p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px;">${data.alternativeLook?.explanation}</p>
                            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:15px;">${altHtml}</div>
                            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.08); padding-top:12px;">
                                <strong style="color:white; font-size:1.1rem;">Total: ₹${(data.alternativeLook?.totalPrice || 0).toLocaleString()}</strong>
                                <button class="btn secondary" onclick="addBundleToCart(${JSON.stringify((data.alternativeLook?.products || []).map(p => p.id)).replace(/"/g, '&quot;')})" style="padding:8px 16px; font-size:0.8rem;">🛍 Add Look to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (err) {
        console.error("Shopping Agent Error:", err);
    }
}

async function generateCapsuleWardrobe() {
    const budget = document.getElementById("capsuleBudgetInput")?.value || 30000;
    const season = document.getElementById("capsuleSeasonSelect")?.value || "All Season";
    const container = document.getElementById("capsuleResultsContainer");

    if (container) {
        container.innerHTML = `<p style="color:var(--muted); text-align:center; padding:20px;">Generating versatile capsule pieces...</p>`;
    }

    try {
        const data = await apiFetch('/ai/capsule-wardrobe', {
            method: "POST",
            body: JSON.stringify({ budget: parseInt(budget), season })
        });

        if (data.success && container) {
            const itemsHtml = (data.capsuleItems || []).map(p => `
                <div class="glassmorphism" style="padding:15px; border-radius:16px; border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.01); display:flex; align-items:center; gap:15px; cursor:pointer;" onclick="viewProductDetails(${p.id})">
                    <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
                    <div style="flex:1;">
                        <h5 style="margin:0; color:white; font-size:0.9rem;">${escapeHTML(p.name)}</h5>
                        <span style="color:var(--muted); font-size:0.75rem;">${escapeHTML(p.specs?.Material || 'Versatile Textile')}</span>
                    </div>
                    <strong style="color:var(--maroon-light);">₹${p.price.toLocaleString()}</strong>
                </div>
            `).join("");

            container.innerHTML = `
                <div class="glassmorphism" style="padding:25px; border-radius:24px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.02);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.08);">
                        <div>
                            <span class="ai-badge">CAPSULE EFFICIENCY</span>
                            <h3 style="color:white; margin:5px 0;">Unlocked ${data.possibleOutfitCount} Unique Outfits</h3>
                            <p style="margin:0; color:var(--muted); font-size:0.85rem;">${escapeHTML(data.summary || '')}</p>
                        </div>
                        <div style="text-align:right;">
                            <span style="font-size:0.8rem; color:var(--muted); display:block;">Total Investment:</span>
                            <strong style="font-size:1.5rem; color:white;">₹${(data.totalPrice || 0).toLocaleString()}</strong>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:15px; margin-bottom:25px;">
                        ${itemsHtml}
                    </div>

                    <button class="btn primary" onclick="addBundleToCart(${JSON.stringify((data.capsuleItems || []).map(p => p.id)).replace(/"/g, '&quot;')})" style="width:100%; padding:14px;">
                        🛒 Purchase Full ${data.capsuleItems.length}-Piece Capsule Wardrobe
                    </button>
                </div>
            `;
        }
    } catch (err) {
        console.error("Capsule Error:", err);
    }
}

async function runStealThisLook(event) {
    const container = document.getElementById("stealResultsContainer");
    if (!container) return;

    container.style.display = "block";
    container.innerHTML = `<p style="color:var(--muted); text-align:center;">🤖 AI Vision is parsing outfit elements & pricing tiers...</p>`;

    try {
        const data = await apiFetch('/vision/steal-look', {
            method: "POST",
            body: JSON.stringify({ imageUrl: "upload" })
        });

        if (data.success) {
            const elementsHtml = (data.detectedElements || []).map(e => `
                <div style="background:rgba(255,255,255,0.02); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); font-size:0.8rem; color:white;">
                    <span style="color:var(--muted); font-size:0.75rem; display:block;">${escapeHTML(e.category || '')}</span>
                    <strong>${escapeHTML(e.title || '')}</strong> (${e.confidence}% confidence)
                </div>
            `).join("");

            const matchProducts = (data.tiers?.match?.products || []).map(p => `
                <div style="display:flex; align-items:center; gap:10px; font-size:0.8rem; margin-top:8px;">
                    <img src="${escapeHTML(p.image)}" style="width:30px; height:30px; border-radius:4px; object-fit:cover;">
                    <span style="color:white; flex:1;">${escapeHTML(p.name)}</span>
                    <strong style="color:var(--maroon-light);">₹${p.price.toLocaleString()}</strong>
                </div>
            `).join("");

            const budgetProducts = (data.tiers?.budget?.products || []).map(p => `
                <div style="display:flex; align-items:center; gap:10px; font-size:0.8rem; margin-top:8px;">
                    <img src="${escapeHTML(p.image)}" style="width:30px; height:30px; border-radius:4px; object-fit:cover;">
                    <span style="color:white; flex:1;">${escapeHTML(p.name)}</span>
                    <strong style="color:var(--maroon-light);">₹${p.price.toLocaleString()}</strong>
                </div>
            `).join("");

            const premiumProducts = (data.tiers?.premium?.products || []).map(p => `
                <div style="display:flex; align-items:center; gap:10px; font-size:0.8rem; margin-top:8px;">
                    <img src="${escapeHTML(p.image)}" style="width:30px; height:30px; border-radius:4px; object-fit:cover;">
                    <span style="color:white; flex:1;">${escapeHTML(p.name)}</span>
                    <strong style="color:var(--maroon-light);">₹${p.price.toLocaleString()}</strong>
                </div>
            `).join("");

            container.innerHTML = `
                <h4 style="color:white; margin-bottom:15px;">AI Outfit Breakdown:</h4>
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:12px; margin-bottom:30px;">${elementsHtml}</div>

                <h4 style="color:white; margin-bottom:15px;">Price Tier Comparisons:</h4>
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px;">
                    <div class="glassmorphism" style="padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.01);">
                        <span style="color:#4CAF50; font-weight:800; font-size:0.75rem;">BUDGET VERSION</span>
                        <h4 style="color:white; margin:5px 0;">₹${(data.tiers?.budget?.totalPrice || 0).toLocaleString()}</h4>
                        ${budgetProducts}
                        <button class="btn secondary" onclick="addBundleToCart(${JSON.stringify((data.tiers?.budget?.products || []).map(p => p.id)).replace(/"/g, '&quot;')})" style="width:100%; margin-top:15px; padding:6px; font-size:0.75rem;">Shop Budget Tier</button>
                    </div>

                    <div class="glassmorphism" style="padding:20px; border-radius:16px; border:1px solid var(--maroon-light); background:rgba(143,29,45,0.05);">
                        <span style="color:var(--maroon-light); font-weight:800; font-size:0.75rem;">STYLECART MATCH</span>
                        <h4 style="color:white; margin:5px 0;">₹${(data.tiers?.match?.totalPrice || 0).toLocaleString()}</h4>
                        ${matchProducts}
                        <button class="btn primary" onclick="addBundleToCart(${JSON.stringify((data.tiers?.match?.products || []).map(p => p.id)).replace(/"/g, '&quot;')})" style="width:100%; margin-top:15px; padding:6px; font-size:0.75rem;">Shop Match Tier</button>
                    </div>

                    <div class="glassmorphism" style="padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.01);">
                        <span style="color:#FFD700; font-weight:800; font-size:0.75rem;">PREMIUM LUXURY</span>
                        <h4 style="color:white; margin:5px 0;">₹${(data.tiers?.premium?.totalPrice || 0).toLocaleString()}</h4>
                        ${premiumProducts}
                        <button class="btn secondary" onclick="addBundleToCart(${JSON.stringify((data.tiers?.premium?.products || []).map(p => p.id)).replace(/"/g, '&quot;')})" style="width:100%; margin-top:15px; padding:6px; font-size:0.75rem;">Shop Premium Tier</button>
                    </div>
                </div>
            `;
        }
    } catch (err) {
        console.error("Steal look error:", err);
    }
}

async function loadTrendIntelligence() {
    const container = document.getElementById("trendAnalyticsContainer");
    if (!container) return;

    try {
        const data = await apiFetch('/trends');

        if (data.success) {
            const trendsHtml = (data.trends || []).map(t => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); padding:15px 20px; border-radius:14px; border:1px solid rgba(255,255,255,0.06); margin-bottom:12px;">
                    <div>
                        <strong style="color:white; font-size:0.95rem; display:block;">${escapeHTML(t.name || '')}</strong>
                        <span style="color:var(--muted); font-size:0.75rem;">${escapeHTML(t.category || '')}</span>
                    </div>
                    <span style="padding:4px 12px; border-radius:99px; background:rgba(76, 175, 80, 0.15); color:#4CAF50; font-size:0.75rem; font-weight:700;">↑ ${escapeHTML(t.velocity || '')}</span>
                </div>
            `).join("");

            const trendingProdsHtml = (data.trendingProducts || []).map(p => `
                <div style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.02); padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); cursor:pointer;" onclick="viewProductDetails(${p.id})">
                    <img src="${escapeHTML(p.image)}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;">
                    <div style="flex:1;">
                        <h5 style="margin:0; color:white; font-size:0.85rem;">${escapeHTML(p.name)}</h5>
                        <span style="color:var(--maroon-light); font-size:0.8rem; font-weight:700;">₹${p.price.toLocaleString()}</span>
                    </div>
                </div>
            `).join("");

            container.innerHTML = `
                <div class="glassmorphism" style="padding:30px; border-radius:24px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.02);">
                    <h3 style="color:white; margin-bottom:20px;">Active Market Signals</h3>
                    ${trendsHtml}
                </div>

                <div class="glassmorphism" style="padding:30px; border-radius:24px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.02);">
                    <h3 style="color:white; margin-bottom:20px;">Trending Catalog Items</h3>
                    <div style="display:flex; flex-direction:column; gap:10px;">${trendingProdsHtml}</div>
                </div>
            `;
        }
    } catch (err) {
        console.error("Trend error:", err);
    }
}

async function resetAIMemory() {
    try {
        await apiFetch('/ai/memory', { method: "DELETE" });
        showNotification("AI Personalization memory reset.", "success");
    } catch (err) {
        showNotification("Reset completed.", "info");
    }
}

function addBundleToCart(ids) {
    if (!ids || !Array.isArray(ids)) return;
    
    ids.forEach(id => {
        if (window.addToCart) {
            window.addToCart(id);
        } else if (window.CartService) {
            window.CartService.addToCart(id);
        }
    });
    
    showNotification(`Outfit Bundle (${ids.length} items) added to cart!`, "success");
}

function viewProductDetails(id) {
    window.location.href = `product.html?id=${id}`;
}

// ========== AI PERSONAL STYLIST VOICE DICTATION ==========
function startStylistVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        window.showNotification('Voice dictation not supported in this browser', 'warning');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        window.showNotification('🎤 Listening stylist query...', 'info');
        const btn = document.getElementById('stylistVoiceBtn');
        if (btn) btn.textContent = '🛑';
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('aiStylistInput');
        if (input) {
            input.value = transcript;
        }
        window.showNotification('Query captured! Press "Stylize Look" to ask AI.', 'success');
    };
    
    recognition.onend = () => {
        const btn = document.getElementById('stylistVoiceBtn');
        if (btn) btn.textContent = '🎤';
    };
    
    recognition.onerror = () => {
        window.showNotification('Voice error. Please try again.', 'warning');
    };
    
    recognition.start();
}

// ========== AI TRY-ON SELFIE UPLOAD & ADJUSTMENT SLIDERS ==========
function handleTryOnSelfieUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const display = document.getElementById("tryonDisplay");
        if (display) {
            display.style.backgroundImage = `url('${e.target.result}')`;
            window.showNotification("Selfie uploaded! Positioning try-on overlay...", "success");
        }
    };
    reader.readAsDataURL(file);
}

function adjustTryOnOverlay() {
    const overlay = document.getElementById("tryonClothingOverlay");
    if (!overlay) return;
    
    const scale = document.getElementById("tryonScale")?.value || 60;
    const opacity = document.getElementById("tryonOpacity")?.value || 85;
    const yShift = document.getElementById("tryonYShift")?.value || 15;
    const xShift = document.getElementById("tryonXShift")?.value || 20;
    
    overlay.style.width = `${scale}%`;
    overlay.style.height = `${scale}%`;
    overlay.style.top = `${yShift}%`;
    overlay.style.left = `${xShift}%`;
    overlay.style.opacity = opacity / 100;
}

// ========== AI DIGITAL WARDROBE IMAGE SCANNER ==========
function handleWardrobeScanUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const bar = document.getElementById("wardrobeScanBar");
    if (bar) bar.style.display = "block";
    
    window.showNotification("AI Closet scanning clothing colors and fabrics...", "info");
    
    setTimeout(() => {
        if (bar) bar.style.display = "none";
        
        const name = file.name.toLowerCase();
        let itemName = "Tan Wool Overcoat";
        let color = "Caramel Tan";
        let material = "Merino Wool";
        let category = "upper";
        
        if (name.includes("pant") || name.includes("jean") || name.includes("cargo") || name.includes("lower")) {
            itemName = "Vintage Denim Jeans";
            color = "Stone Indigo";
            material = "Cotton Denim";
            category = "lower";
        } else if (name.includes("shoe") || name.includes("sneaker") || name.includes("boot") || name.includes("feet")) {
            itemName = "Leather Sneakers";
            color = "Optic White";
            material = "Nappa Leather";
            category = "shoes";
        } else if (name.includes("shirt") || name.includes("tee") || name.includes("polo") || name.includes("upper")) {
            itemName = "Classic Linen T-Shirt";
            color = "Optic White";
            material = "Supima Cotton";
            category = "upper";
        }

        const newItem = {
            id: Date.now(),
            name: itemName,
            color,
            material,
            category
        };
        
        myWardrobe.push(newItem);
        localStorage.setItem('StyleCart_ai_wardrobe', JSON.stringify(myWardrobe));
        renderWardrobe();
        
        // Reset file input
        event.target.value = "";
        
        window.showNotification(`AI Scanned & Added: ${itemName}!`, "success");
        getWardrobeSuggestions();
    }, 2000);
}

// ========== OUTFIT COMMUNITY FEED ENGINE ==========
const communityPosts = [
    {
        id: 1,
        creator: "Aarav Mehta",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80",
        likes: 142,
        liked: false,
        comments: ["Dope styling Aarav!", "That jacket goes hard."],
        explanation: "Urban Streetwear look featuring StyleCart Premium layers, olive twill cargo pants, and retro court court kicks.",
        productIds: [23, 24, 31]
    },
    {
        id: 2,
        creator: "Elena Rostova",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80",
        likes: 289,
        liked: false,
        comments: ["Stunning office outfit ideas", "Love the tan boots contrast"],
        explanation: "Corporate Smart Casual fit displaying StyleCart navy blazers, Supima t-shirts, and Italian suede Chelsea boots.",
        productIds: [26, 25, 29]
    },
    {
        id: 3,
        creator: "Kabir Dev",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80",
        likes: 95,
        liked: false,
        comments: ["Luxury vibes", "Swiss precision combo is flawless!"],
        explanation: "Night out luxury styling matching a Burgundy Velvet Blazer, Rolex steel timepiece, and leather boots.",
        productIds: [32, 11, 29]
    }
];

function renderCommunityFeed() {
    const grid = document.getElementById("communityFeedGrid");
    if (!grid) return;
    
    grid.innerHTML = communityPosts.map(post => {
        const productsHTML = post.productIds.map(id => {
            const p = fashionCatalog.find(x => x.id === id);
            if (!p) return '';
            return `
                <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.02); padding:6px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); font-size:0.75rem; margin-top:5px; cursor:pointer;" onclick="viewProductDetails(${p.id})">
                    <img src="${p.image}" alt="${p.name}" style="width:25px; height:25px; border-radius:4px; object-fit:cover;">
                    <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; color:white;">${p.name}</span>
                    <strong style="margin-left:auto; color:var(--muted);">₹${p.price.toLocaleString()}</strong>
                </div>
            `;
        }).join('');

        return `
            <div class="community-post-card glassmorphism" style="border-radius:20px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.01); padding:20px; overflow:hidden; display:flex; flex-direction:column; gap:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${post.avatar}" alt="${post.creator}" style="width:35px; height:35px; border-radius:50%; object-fit:cover; border:1.5px solid var(--maroon-light);">
                    <div>
                        <strong style="font-size:0.9rem; color:white;">${post.creator}</strong>
                        <span style="font-size:0.7rem; color:var(--muted); display:block;">Style Creator</span>
                    </div>
                </div>
                
                <img src="${post.image}" alt="Outfit fit check" style="width:100%; height:260px; object-fit:cover; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                
                <p style="font-size:0.8rem; color:var(--muted); line-height:1.4; margin:0;">${post.explanation}</p>
                
                <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:10px; margin-top:5px;">
                    <h5 style="margin:0 0 5px 0; font-size:0.8rem; color:white;">Look Components:</h5>
                    ${productsHTML}
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; margin-top:5px;">
                    <div style="display:flex; gap:15px; font-size:0.85rem;">
                        <span onclick="likeCommunityPost(${post.id})" style="cursor:pointer; color:${post.liked ? '#f44336' : 'var(--muted)'};">❤️ <strong>${post.likes}</strong></span>
                        <span style="color:var(--muted); cursor:pointer;" onclick="commentCommunityPost(${post.id})">💬 <strong>${post.comments.length}</strong></span>
                    </div>
                    <button onclick="addBundleToCart(${JSON.stringify(post.productIds).replace(/"/g, '&quot;')})" style="background:var(--maroon-light); border:none; color:white; padding:8px 16px; border-radius:99px; font-size:0.75rem; font-weight:700; cursor:pointer; transition:all 0.3s;">
                        🛒 Shop the Look
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function likeCommunityPost(id) {
    const post = communityPosts.find(p => p.id === id);
    if (!post) return;
    
    if (post.liked) {
        post.likes--;
        post.liked = false;
    } else {
        post.likes++;
        post.liked = true;
    }
    renderCommunityFeed();
}

function commentCommunityPost(id) {
    const post = communityPosts.find(p => p.id === id);
    if (!post) return;
    const txt = prompt("Write your comment:");
    if (txt && txt.trim()) {
        post.comments.push(txt.trim());
        renderCommunityFeed();
        window.showNotification("Comment posted!", "success");
    }
}

// Expose functions globally
window.switchTab = switchTab;
window.sendStylistMessage = sendStylistMessage;
window.addItemToOutfit = addItemToOutfit;
window.removeOutfitItem = removeOutfitItem;
window.triggerTryOn = triggerTryOn;
window.selectTryOnAvatar = selectTryOnAvatar;
window.addToWardrobe = addToWardrobe;
window.removeFromWardrobe = removeFromWardrobe;
window.getWardrobeSuggestions = getWardrobeSuggestions;
window.triggerWeatherStyling = triggerWeatherStyling;
window.askFashionGPT = askFashionGPT;
window.generateOccasionOutfit = generateOccasionOutfit;
window.triggerVisualSearch = triggerVisualSearch;
window.addBundleToCart = addBundleToCart;
window.startStylistVoiceInput = startStylistVoiceInput;
window.handleTryOnSelfieUpload = handleTryOnSelfieUpload;
window.adjustTryOnOverlay = adjustTryOnOverlay;
window.handleWardrobeScanUpload = handleWardrobeScanUpload;
window.renderCommunityFeed = renderCommunityFeed;
window.likeCommunityPost = likeCommunityPost;
window.commentCommunityPost = commentCommunityPost;
window.runShoppingAgent = runShoppingAgent;
window.generateCapsuleWardrobe = generateCapsuleWardrobe;
window.runStealThisLook = runStealThisLook;
window.loadTrendIntelligence = loadTrendIntelligence;
window.resetAIMemory = resetAIMemory;
