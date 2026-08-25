// ========== MASTER ENTRY POINT (APP) ==========

// Recently viewed lists management
let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

function addToRecentlyViewed(productId) {
    const id = parseInt(productId);
    recentlyViewed = recentlyViewed.filter(val => val !== id);
    recentlyViewed.unshift(id);
    recentlyViewed = recentlyViewed.slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
}

function getRecentlyViewed() {
    return recentlyViewed.map(id => window.ProductService.getProductById(id)).filter(Boolean);
}

function goToProduct(productId) {
    addToRecentlyViewed(productId);
    window.location.href = `product.html?id=${productId}`;
}

// ========== PRODUCT CARD CREATION ==========
function createProductCard(product, containerType = 'default') {
    if (!product) return '';
    const inWishlist = window.isInWishlist ? window.isInWishlist(product.id) : false;
    const cartQty = window.getCartQuantity ? window.getCartQuantity(product.id) : 0;
    const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));
    
    return `
        <article class="product-card tilt-card reveal" data-id="${product.id}" data-price="${product.price}" data-rating="${product.rating}" data-category="${product.category}">
            <div class="product-image" style="position:relative;overflow:hidden;border-radius:18px;">
                <span class="discount-badge" style="position:absolute;top:10px;left:10px;padding:6px 12px;background:var(--maroon-light);font-size:0.8rem;border-radius:999px;font-weight:800;z-index:2;">${product.discount || "NEW"}</span>
                <button class="wishlist ${inWishlist ? 'active' : ''}" 
                        data-product="${product.id}"
                        onclick="event.stopPropagation();window.toggleWishlist(${product.id})" 
                        style="position:absolute;top:10px;right:10px;background:none;border:none;color:${inWishlist ? '#ff4444' : 'white'};font-size:1.45rem;cursor:pointer;z-index:2;transition:transform 0.2s;"
                        aria-label="Toggle wishlist">
                    ${inWishlist ? '♥' : '♡'}
                </button>
                <img src="${product.image}" alt="${product.name}" class="product-img" 
                     style="width:100%;height:220px;object-fit:cover;cursor:pointer;transition:transform 0.5s;"
                     loading="lazy"
                     onclick="window.goToProduct(${product.id})"
                     onerror="this.src='https://via.placeholder.com/300x300/5b101b/ffffff?text=${encodeURIComponent(product.name)}'">
                <button class="quick-view-btn" onclick="event.stopPropagation();window.quickView(${product.id})" style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%) translateY(50px);padding:8px 16px;border-radius:999px;border:none;background:var(--white);color:var(--black);font-weight:700;font-size:0.85rem;cursor:pointer;opacity:0;transition:0.3s;">👁️ Quick View</button>
                <button class="compare-btn" onclick="event.stopPropagation();window.toggleCompare(${product.id})" style="position:absolute;top:50px;right:10px;background:rgba(0,0,0,0.4);border:none;border-radius:50%;width:35px;height:35px;color:white;cursor:pointer;z-index:2;" title="Add to Compare">📊</button>
            </div>
            <div class="product-info" style="padding:15px 0;">
                <p class="label" style="text-transform:uppercase;font-size:0.75rem;color:var(--maroon-light);font-weight:800;letter-spacing:1px;">${product.category}</p>
                <h3 onclick="window.goToProduct(${product.id})" style="font-size:1.15rem;font-weight:900;margin:6px 0;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${product.name}</h3>
                <p class="rating" style="font-size:0.85rem;color:#ffd700;"><span class="stars">${stars}</span> ${product.rating}</p>
                <div class="price-row" style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
                    <div>
                        <strong style="font-size:1.25rem;color:var(--white);">₹${product.price.toLocaleString()}</strong>
                    </div>
                    <div class="action-buttons">
                        ${cartQty > 0 ? `
                            <div class="quantity-control" style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.06);border-radius:999px;padding:4px 10px;border:1px solid var(--line);">
                                <button onclick="event.stopPropagation();window.updateQuantity(${product.id}, -1)" style="background:none;border:none;color:white;cursor:pointer;font-weight:bold;font-size:1.1rem;">−</button>
                                <span style="font-weight:800;font-size:0.95rem;">${cartQty}</span>
                                <button onclick="event.stopPropagation();window.updateQuantity(${product.id}, 1)" style="background:none;border:none;color:white;cursor:pointer;font-weight:bold;font-size:1.1rem;">+</button>
                            </div>
                        ` : `
                            <button onclick="event.stopPropagation();window.addToCart(${product.id})" style="padding:8px 18px;border-radius:999px;background:var(--white);color:var(--black);border:none;font-weight:700;cursor:pointer;font-size:0.85rem;transition:0.25s;">Add</button>
                        `}
                    </div>
                </div>
            </div>
        </article>
    `;
}

// ========== QUICK VIEW ==========
function quickView(productId) {
    const product = window.ProductService.getProductById(productId);
    if (!product) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'quick-view-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10100;
        backdrop-filter: blur(10px);
    `;
    overlay.innerHTML = `
        <div class="quick-view-modal" style="width:min(800px, 90%);max-height:90vh;background:var(--black-soft);border:1px solid var(--line);border-radius:36px;padding:30px;position:relative;overflow-y:auto;box-shadow:var(--shadow);">
            <button class="quick-view-close" onclick="this.closest('.quick-view-overlay').remove()" style="position:absolute;top:20px;right:20px;background:none;border:none;color:white;font-size:1.4rem;cursor:pointer;">✕</button>
            <div class="quick-view-content" style="display:grid;grid-template-columns:1fr 1.2fr;gap:30px;margin-top:10px;">
                <div class="quick-view-image">
                    <img src="${product.image}" alt="${product.name}" style="width:100%;height:320px;object-fit:cover;border-radius:18px;" onerror="this.src='https://via.placeholder.com/300'">
                </div>
                <div class="quick-view-info" style="display:flex;flex-direction:column;gap:12px;">
                    <span class="category-tag" style="text-transform:uppercase;color:var(--maroon-light);font-weight:800;font-size:0.85rem;">${product.category}</span>
                    <h2 style="font-size:1.8rem;font-weight:950;letter-spacing:-0.5px;">${product.name}</h2>
                    <p style="color:#ffd700;">★ ${product.rating} rating</p>
                    <p style="font-size:1.6rem;font-weight:900;color:var(--maroon-light);">₹${product.price.toLocaleString()}</p>
                    <p style="color:var(--muted);font-size:0.95rem;line-height:1.6;">${product.description}</p>
                    <div style="display:flex;gap:10px;margin-top:15px;flex-wrap:wrap;">
                        <button onclick="window.addToCart(${product.id});this.closest('.quick-view-overlay').remove();" style="padding:12px 24px;border-radius:999px;background:var(--maroon-light);color:white;border:none;cursor:pointer;font-weight:700;">Add to Cart</button>
                        <button onclick="window.goToProduct(${product.id});this.closest('.quick-view-overlay').remove();" style="padding:12px 24px;border-radius:999px;background:rgba(255,255,255,0.06);color:white;border:1px solid var(--line);cursor:pointer;font-weight:700;">View Details</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

function animateCart(product) {
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        const flyingProduct = document.createElement('div');
        flyingProduct.innerHTML = `<img src="${product.image}" alt="${product.name}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">`;
        flyingProduct.style.cssText = `
            position: fixed;
            width: 50px;
            height: 50px;
            z-index: 9999;
            pointer-events: none;
            transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
            opacity: 1;
            left: ${window.innerWidth / 2 - 25}px;
            top: ${window.innerHeight / 2 - 25}px;
        `;
        document.body.appendChild(flyingProduct);
        
        const rect = cartBtn.getBoundingClientRect();
        
        setTimeout(() => {
            flyingProduct.style.left = (rect.left + rect.width / 2 - 25) + 'px';
            flyingProduct.style.top = (rect.top - 10) + 'px';
            flyingProduct.style.transform = 'scale(0.3)';
            flyingProduct.style.opacity = '0.5';
        }, 50);
        
        setTimeout(() => {
            flyingProduct.remove();
            cartBtn.style.transform = 'scale(1.15)';
            setTimeout(() => {
                cartBtn.style.transform = 'scale(1)';
            }, 300);
        }, 800);
    }
}

// ========== INITIAL RENDERING ==========
function renderAllProducts() {
    const flash = window.ProductService.getFlashDeals();
    const trending = window.ProductService.getTrendingProducts();
    const recommended = window.ProductService.getRecommendedProducts();
    
    const electronics = window.ProductService.getProductsByCategory("electronics").slice(0, 4);
    const luxury = window.ProductService.getProductsByCategory("luxury").slice(0, 4);
    const bestSellers = window.ProductService.getProductsByCategory("electronics").slice(2, 6);
    const newArrivals = window.ProductService.getProductsByCategory("gaming").slice(0, 4);
    const featured = window.ProductService.getProductsByCategory("luxury").slice(1, 5);
    
    const groups = {
        flashDeals: flash,
        trendingProducts: trending,
        recommendedProducts: recommended,
        electronicsProducts: electronics,
        luxuryProducts: luxury,
        bestSellers: bestSellers,
        newArrivals: newArrivals,
        featuredProducts: featured,
        recentProducts: getRecentlyViewed().slice(0, 4)
    };
    
    Object.entries(groups).forEach(([sectionId, productsList]) => {
        const container = document.getElementById(sectionId);
        if (container) {
            if (productsList.length > 0) {
                container.innerHTML = productsList.map(p => createProductCard(p, sectionId)).join("");
            } else if (sectionId === 'recentProducts') {
                container.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:20px;">No recently viewed items.</p>`;
            }
        }
    });

    if (window.attachTiltCards) window.attachTiltCards();
}

function initNavigation() {
    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("navLinks");
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("open");
        });
        
        document.querySelectorAll(".nav-links a").forEach((link) => {
            link.addEventListener("click", () => navLinks.classList.remove("open"));
        });
    }
}

function init() {
    initNavigation();
    
    // Bind Event Listeners
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn && window.performSearch) {
        searchBtn.addEventListener('click', window.performSearch);
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput && window.performSearch) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                window.performSearch();
                document.querySelectorAll('.search-suggestions').forEach(el => el.remove());
            } else if (window.debounce) {
                // Debounced instant search suggestions
                window.debounce(() => window.performSearch(), 300)();
            }
        });
    }
    
    const voiceSearchBtn = document.getElementById('voiceSearchBtn');
    if (voiceSearchBtn && window.startVoiceSearch) {
        voiceSearchBtn.addEventListener('click', window.startVoiceSearch);
    }
    
    const sortDropdown = document.getElementById('sortDropdown');
    if (sortDropdown && window.sortProducts) {
        sortDropdown.addEventListener('change', (e) => {
            window.sortProducts(e.target.value);
        });
    }
    
    const aiSearchBtn = document.getElementById('aiSearchBtn');
    if (aiSearchBtn) {
        aiSearchBtn.addEventListener('click', () => {
            const aiInput = document.getElementById('aiSearch');
            if (aiInput && aiInput.value.trim() && window.askAI) {
                window.askAI(aiInput.value.trim());
            }
        });
    }
    
    const aiSearchInput = document.getElementById('aiSearch');
    if (aiSearchInput && aiSearchBtn) {
        aiSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') aiSearchBtn.click();
        });
    }
    
    const aiAssistantBtn = document.getElementById('aiAssistantBtn');
    if (aiAssistantBtn && window.toggleAIAssistant) {
        aiAssistantBtn.addEventListener('click', window.toggleAIAssistant);
    }
    
    const compareBtn = document.getElementById('compareBtn');
    if (compareBtn && window.goToCompare) {
        compareBtn.addEventListener('click', window.goToCompare);
    }

    // Load initial listings
    setTimeout(() => {
        renderAllProducts();
        if (window.updateCartCount) window.updateCartCount();
        if (window.updateWishlistCount) window.updateWishlistCount();
        if (window.updateCompareButton) window.updateCompareButton();
        if (window.initParticles) window.initParticles();
        if (window.initRevealAnimations) window.initRevealAnimations();
        if (window.initSpatialParallax) window.initSpatialParallax();
        if (window.initMarketplace3D) window.initMarketplace3D();

        // Populate Personalized AI Home Feed
        if (window.loadPersonalizedFeed) window.loadPersonalizedFeed('streetwear');
    }, 400); // 400ms delay to allow ProductService API fetch resolution

    // Bind Image Search inputs
    const imgInput = document.getElementById('imageSearchFileInput');
    if (imgInput) {
        imgInput.addEventListener('change', handleImageSearchUpload);
    }
}

// ========== PERSONALIZED AI FEED ENGINE ==========
function loadPersonalizedFeed(persona, btnElement) {
    const feedSection = document.getElementById('aiHomeFeed');
    if (feedSection) feedSection.style.display = 'block';

    // Update active button styling
    if (btnElement) {
        document.querySelectorAll('.feed-persona-btn').forEach(b => {
            b.classList.remove('active');
            b.style.border = '1px solid rgba(255,255,255,0.1)';
            b.style.background = 'none';
            b.style.color = 'var(--muted)';
        });
        btnElement.classList.add('active');
        btnElement.style.border = '1px solid var(--maroon-light)';
        btnElement.style.background = 'rgba(143,29,45,0.1)';
        btnElement.style.color = 'white';
    }

    const card = document.getElementById('aiPersonaCard');
    const grid = document.getElementById('aiFeedProducts');
    if (!card || !grid) return;

    let title = "";
    let desc = "";
    let tags = "";
    let skinTips = "";
    let matchedProductIds = [];

    if (persona === 'streetwear') {
        title = "Urban Trendsetter";
        desc = "Your aesthetic leans towards high-comfort twill cargo pants, heavy hoodies, and retro court sneakers.";
        tags = "• Oversized Cuts • Earthy Tones • Active Performance";
        skinTips = "💡 Recommended for warm undertones: Olive green and deep crimson accentuates your warmth.";
        matchedProductIds = [7, 8, 23, 24, 31];
    } else if (persona === 'formal') {
        title = "Corporate Executive";
        desc = "Tailored wool blazers, calfskin leather accessories, and suede Chelsea boots define your daily look.";
        tags = "• Slim Fit • Structured Lapels • Neutral Monochromes";
        skinTips = "💡 Recommended for neutral skin tones: Midnight navy blue contrast styles work flawlessly.";
        matchedProductIds = [25, 26, 28, 29, 30];
    } else if (persona === 'luxury') {
        title = "Elite Connoisseur";
        desc = "You prioritize Swiss hand-assembled watches and heritage Speedmasters, paired with velvet blazers.";
        tags = "• Swiss Calibre • Silk Satin Accents • Heritage Dials";
        skinTips = "💡 Recommended for cool undertones: Polished silver Oystersteel and burgundy velvet elevate your cool hues.";
        matchedProductIds = [11, 19, 21, 32];
    } else if (persona === 'casual') {
        title = "Minimalist Modern";
        desc = "Sandy beige linen wear and regular fit Supima cotton layers compose your comfort styling.";
        tags = "• Organic Fibers • Loose Comfort • Earth Hues";
        skinTips = "💡 Recommended for fair skin: Warm sand tones offer a highly balanced, elegant contrast.";
        matchedProductIds = [25, 27, 33, 31];
    }

    card.innerHTML = `
        <span style="font-size:3.5rem; display:block; margin-bottom:15px;">👤</span>
        <h4 style="font-size:1.5rem; margin-bottom:10px; font-weight:800; color:white;">${title}</h4>
        <p style="color:var(--muted); font-size:0.9rem; line-height:1.5; margin-bottom:15px;">${desc}</p>
        <span style="display:inline-block; font-size:0.8rem; padding:6px 12px; border-radius:99px; background:rgba(255,255,255,0.04); color:var(--muted); margin-bottom:20px;">${tags}</span>
        <div style="font-size:0.85rem; border-top:1px solid rgba(255,255,255,0.06); padding-top:15px; color:#4caf50; font-weight:600; line-height:1.4;">${skinTips}</div>
    `;

    // Retrieve products
    const all = window.ProductService.getAllProducts();
    const matches = all.filter(p => matchedProductIds.includes(p.id));
    grid.innerHTML = matches.map(p => window.createProductCard(p, 'aiFeedProducts')).join('');
    if (window.attachTiltCards) window.attachTiltCards();
}

// ========== AI IMAGE SEARCH HANDLER (MOCK SCANNED SEARCH) ==========
async function handleImageSearchUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const scanner = document.getElementById('imageSearchScanner');
    const dropzone = document.getElementById('imageSearchDropZone');
    
    if (scanner) scanner.style.display = 'block';
    if (dropzone) dropzone.style.opacity = '0.5';

    // Simulate scanning
    setTimeout(async () => {
        // Hide modal
        const modal = document.getElementById('imageSearchModal');
        if (modal) modal.style.display = 'none';
        if (scanner) scanner.style.display = 'none';
        if (dropzone) dropzone.style.opacity = '1';
        
        // Reset file input
        e.target.value = "";
        
        // Dynamic search based on file name characteristics or general styling query
        const name = file.name.toLowerCase();
        let searchQuery = "jacket cargo streetwear"; // default
        if (name.includes("shoe") || name.includes("sneaker") || name.includes("foot")) {
            searchQuery = "running shoes boots sneakers";
        } else if (name.includes("watch") || name.includes("rolex") || name.includes("time")) {
            searchQuery = "luxury watch tag heuer";
        } else if (name.includes("perfume") || name.includes("fragrance") || name.includes("scent")) {
            searchQuery = "perfume luxury beauty";
        } else if (name.includes("shirt") || name.includes("tee") || name.includes("hoodie")) {
            searchQuery = "premium white t-shirt hoodie";
        }

        window.showNotification("AI image scanning complete! Finding visual matches...", "success");
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchQuery;
            window.performSearch();
        }
    }, 2000);
}

// Expose globally
window.recentlyViewed = recentlyViewed;
window.addToRecentlyViewed = addToRecentlyViewed;
window.getRecentlyViewed = getRecentlyViewed;
window.goToProduct = goToProduct;
window.createProductCard = createProductCard;
window.quickView = quickView;
window.animateCart = animateCart;
window.renderAllProducts = renderAllProducts;
window.loadPersonalizedFeed = loadPersonalizedFeed;
window.handleImageSearchUpload = handleImageSearchUpload;

// Auto run init on DOM Content Loaded
document.addEventListener("DOMContentLoaded", init);
