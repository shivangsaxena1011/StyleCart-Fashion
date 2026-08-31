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
    const reviews = product.reviewsCount ? product.reviewsCount.toLocaleString() : '1,240';
    const originalPriceFormatted = product.originalPrice ? ` | <span style="text-decoration:line-through;color:var(--muted);font-weight:400;font-size:0.85rem;">₹${product.originalPrice.toLocaleString()}</span>` : '';
    const discountFormatted = product.discount ? ` | <span style="color:#4ade80;font-weight:700;font-size:0.82rem;">${product.discount}</span>` : '';

    return `
        <article class="product-card tilt-card reveal" data-id="${product.id}" data-price="${product.price}" data-rating="${product.rating}" data-category="${product.category}">
            <div class="product-image" style="position:relative;overflow:hidden;border-radius:18px;">
                ${product.dealTag ? `<span class="discount-badge" style="position:absolute;top:10px;left:10px;padding:4px 10px;background:linear-gradient(135deg, var(--maroon-light), #e54b60);font-size:0.72rem;border-radius:999px;font-weight:800;z-index:2;letter-spacing:0.5px;">${product.dealTag}</span>` : (product.discount ? `<span class="discount-badge" style="position:absolute;top:10px;left:10px;padding:4px 10px;background:var(--maroon-light);font-size:0.72rem;border-radius:999px;font-weight:800;z-index:2;">${product.discount}</span>` : '')}
                <button class="wishlist ${inWishlist ? 'active' : ''}" 
                        data-product="${product.id}"
                        onclick="event.stopPropagation();window.toggleWishlist(${product.id})" 
                        style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.35);backdrop-filter:blur(6px);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:${inWishlist ? '#ff4444' : 'white'};font-size:1.1rem;cursor:pointer;z-index:2;transition:transform 0.2s;"
                        aria-label="Toggle wishlist">
                    ${inWishlist ? '♥' : '♡'}
                </button>
                <img src="${product.image}" alt="${product.name}" class="product-img" 
                     style="width:100%;height:190px;object-fit:cover;cursor:pointer;transition:transform 0.5s;"
                     loading="lazy"
                     onclick="window.goToProduct(${product.id})"
                     onerror="this.src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80'">
                <button class="quick-view-btn" onclick="event.stopPropagation();window.quickView(${product.id})" style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%) translateY(50px);padding:6px 14px;border-radius:999px;border:none;background:var(--white);color:var(--black);font-weight:700;font-size:0.78rem;cursor:pointer;opacity:0;transition:0.3s;">👁️ Quick View</button>
                <button class="compare-btn" onclick="event.stopPropagation();window.toggleCompare(${product.id})" style="position:absolute;top:46px;right:10px;background:rgba(0,0,0,0.35);backdrop-filter:blur(6px);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:white;cursor:pointer;z-index:2;font-size:0.9rem;" title="Add to Compare">📊</button>
            </div>
            <div class="product-info" style="padding:12px 2px;">
                <p class="label" style="text-transform:uppercase;font-size:0.7rem;color:var(--maroon-light);font-weight:800;letter-spacing:0.8px;margin-bottom:2px;">${product.brand ? product.brand + ' • ' : ''}${product.category}</p>
                <h3 onclick="window.goToProduct(${product.id})" style="font-size:0.95rem;font-weight:750;margin:3px 0;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3;" title="${product.name}">${product.name}</h3>
                <div style="font-size:0.92rem;font-weight:700;color:var(--white);margin:4px 0;">
                    <span style="color:#ffffff;font-size:1.05rem;">₹${product.price.toLocaleString()}</span>${originalPriceFormatted}${discountFormatted}
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
                    <p class="rating" style="font-size:0.8rem;color:#fbbf24;margin:0;">
                        ⭐ ${product.rating} <span style="color:var(--muted);font-weight:400;font-size:0.75rem;">(${reviews})</span>
                    </p>
                    <div class="action-buttons">
                        ${cartQty > 0 ? `
                            <div class="quantity-control" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);border-radius:999px;padding:2px 8px;border:1px solid var(--line);">
                                <button onclick="event.stopPropagation();window.updateQuantity(${product.id}, -1)" style="background:none;border:none;color:white;cursor:pointer;font-weight:bold;font-size:1rem;">−</button>
                                <span style="font-weight:800;font-size:0.85rem;">${cartQty}</span>
                                <button onclick="event.stopPropagation();window.updateQuantity(${product.id}, 1)" style="background:none;border:none;color:white;cursor:pointer;font-weight:bold;font-size:1rem;">+</button>
                            </div>
                        ` : `
                            <button onclick="event.stopPropagation();window.addToCart(${product.id})" style="padding:6px 14px;border-radius:999px;background:var(--white);color:var(--black);border:none;font-weight:750;cursor:pointer;font-size:0.78rem;transition:0.25s;">Add</button>
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
    const all = window.ProductService.getAllProducts();
    
    const flash = all.filter(p => p.dealTag === 'Crazy Low Prices' || p.dealTag === 'Deals of the Day' || p.price <= 799).slice(0, 8);
    const trending = all.filter(p => p.dealTag === 'Trending Now' || p.dealTag === 'Customers Most-Loved').slice(0, 8);
    const recommended = all.filter(p => p.dealTag === 'Recommended For You' || p.rating >= 4.5).slice(0, 8);
    
    const electronics = all.filter(p => p.category === "electronics").slice(0, 8);
    const fashion = all.filter(p => p.category === "fashion").slice(0, 8);
    const home = all.filter(p => p.category === "home").slice(0, 8);
    const sports = all.filter(p => p.category === "sports" || p.category === "beauty").slice(0, 8);
    const bestSellers = all.filter(p => p.dealTag && p.dealTag.includes('Best Seller')).slice(0, 8);
    const newArrivals = all.filter(p => p.category === "books" || p.category === "toys" || p.category === "grocery").slice(0, 8);
    const featured = all.filter(p => p.dealTag === 'Fashion Under ₹999' || p.dealTag === 'Top Rated').slice(0, 8);
    
    const groups = {
        flashDeals: flash.length > 0 ? flash : all.slice(0, 8),
        trendingProducts: trending.length > 0 ? trending : all.slice(8, 16),
        recommendedProducts: recommended.length > 0 ? recommended : all.slice(16, 24),
        electronicsProducts: electronics.length > 0 ? electronics : all.slice(0, 8),
        luxuryProducts: fashion.length > 0 ? fashion : all.filter(p => p.category === 'fashion').slice(0, 8),
        fashionProducts: fashion,
        homeProducts: home,
        sportsProducts: sports,
        bestSellers: bestSellers.length > 0 ? bestSellers : all.slice(4, 12),
        newArrivals: newArrivals.length > 0 ? newArrivals : all.slice(12, 20),
        featuredProducts: featured.length > 0 ? featured : all.slice(20, 28),
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
    
    function startAISearch(suggestedQuery) {
        const aiInput = document.getElementById('aiSearch');
        if (aiInput) {
            if (suggestedQuery) aiInput.value = suggestedQuery;
            aiInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            aiInput.focus();
            if (window.askAI && aiInput.value.trim()) {
                window.askAI(aiInput.value.trim());
            }
        } else if (window.askAI) {
            window.askAI(suggestedQuery || 'Trending products under ₹499');
        }
    }
    window.startAISearch = startAISearch;

    const aiSearchBtn = document.getElementById('aiSearchBtn');
    if (aiSearchBtn) {
        aiSearchBtn.addEventListener('click', () => {
            const aiInput = document.getElementById('aiSearch');
            if (aiInput && aiInput.value.trim() && window.askAI) {
                window.askAI(aiInput.value.trim());
            } else if (aiInput) {
                aiInput.focus();
                window.showNotification('Please enter what you want to find!', 'info');
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
