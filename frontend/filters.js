// ========== SMART FILTERS & SORTING MODULE ==========

let currentSort = 'default';
let currentFilters = {
    priceRange: { min: 0, max: Infinity },
    rating: 0,
    categories: [],
    brands: [],
    discount: 0
};
let currentPage = 1;
const productsPerPage = 12;
let allFilteredProducts = [];

function sortProducts(sortType) {
    currentSort = sortType;
    let list = allFilteredProducts.length > 0 ? [...allFilteredProducts] : [...window.ProductService.getAllProducts()];
    
    switch(sortType) {
        case 'priceLow':
            list.sort((a, b) => a.price - b.price);
            break;
        case 'priceHigh':
            list.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            list.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            list.sort((a, b) => b.id - a.id);
            break;
        case 'popularity':
            list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
            break;
        default:
            // default ID order
            list.sort((a, b) => a.id - b.id);
    }
    
    allFilteredProducts = list;
    currentPage = 1;
    
    const container = document.getElementById('filteredProducts');
    if (container) {
        renderProductsWithPagination(allFilteredProducts, 'filteredProducts');
    } else {
        // Update all homepage blocks
        const groups = {
            flashDeals: window.ProductService.getFlashDeals(),
            trendingProducts: window.ProductService.getTrendingProducts(),
            recommendedProducts: window.ProductService.getRecommendedProducts(),
            electronicsProducts: window.ProductService.getProductsByCategory("electronics").slice(0, 4),
            luxuryProducts: window.ProductService.getProductsByCategory("luxury").slice(0, 4)
        };
        Object.entries(groups).forEach(([sectionId, prods]) => {
            const block = document.getElementById(sectionId);
            if (block) {
                const sortedSection = list.filter(p => prods.some(pp => pp.id === p.id));
                block.innerHTML = sortedSection.map(p => window.createProductCard(p, sectionId)).join("");
            }
        });
    }
}

function applyFilters() {
    let list = [...window.ProductService.getAllProducts()];
    
    if (currentFilters.priceRange.min > 0 || currentFilters.priceRange.max < Infinity) {
        list = list.filter(p => 
            p.price >= currentFilters.priceRange.min && 
            p.price <= currentFilters.priceRange.max
        );
    }
    
    if (currentFilters.rating > 0) {
        list = list.filter(p => p.rating >= currentFilters.rating);
    }
    
    if (currentFilters.categories.length > 0) {
        list = list.filter(p => 
            currentFilters.categories.includes(p.category.toLowerCase())
        );
    }
    
    if (currentFilters.brands.length > 0) {
        list = list.filter(p => 
            currentFilters.brands.includes(p.brand?.toLowerCase() || '')
        );
    }
    
    if (currentFilters.discount > 0) {
        list = list.filter(p => {
            const discountNum = parseInt(p.discount || "0");
            return discountNum >= currentFilters.discount;
        });
    }
    
    allFilteredProducts = list;
    currentPage = 1;
    
    const container = document.getElementById('filteredProducts');
    if (container) {
        if (list.length > 0) {
            renderProductsWithPagination(list, 'filteredProducts');
        } else {
            container.innerHTML = `
                <div class="no-results" style="grid-column:1/-1;text-align:center;padding:60px 20px;">
                    <strong>🔍 No products match your filters</strong>
                    <p style="color:var(--muted);margin-top:8px;">Try adjusting your ranges or clearing category lists.</p>
                    <button onclick="window.resetFilters()" style="margin-top:20px;padding:12px 30px;border-radius:999px;background:var(--maroon-light);color:white;border:none;cursor:pointer;font-weight:700;">Reset Filters</button>
                </div>
            `;
        }
    }
}

function resetFilters() {
    currentFilters = {
        priceRange: { min: 0, max: Infinity },
        rating: 0,
        categories: [],
        brands: [],
        discount: 0
    };
    currentSort = 'default';
    allFilteredProducts = [];
    currentPage = 1;
    
    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-slider').forEach(slider => slider.value = 0);
    
    const container = document.getElementById('filteredProducts');
    if (container) {
        renderProductsWithPagination(window.ProductService.getAllProducts(), 'filteredProducts');
    }
    if (window.renderAllProducts) window.renderAllProducts();
}

function renderProductsWithPagination(productsList, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const start = 0;
    const end = currentPage * productsPerPage;
    const visibleProducts = productsList.slice(start, end);
    
    container.innerHTML = visibleProducts.map(p => window.createProductCard(p, containerId)).join('');
    
    // Remove old load more container
    const oldLoadMore = container.parentElement.querySelector('.load-more-container');
    if (oldLoadMore) oldLoadMore.remove();
    
    // Append new load more button if items are remaining
    if (productsList.length > end) {
        const loadMore = document.createElement('div');
        loadMore.className = 'load-more-container';
        loadMore.style.cssText = 'text-align:center;grid-column:1/-1;margin-top:40px;';
        loadMore.innerHTML = `<button onclick="window.loadMoreProducts('${containerId}')" class="load-more-btn" style="padding:14px 40px;border-radius:999px;background:rgba(255,255,255,0.06);color:white;border:1px solid var(--line);cursor:pointer;font-weight:700;">Load More Products</button>`;
        container.parentElement.appendChild(loadMore);
    }
}

function loadMoreProducts(containerId) {
    currentPage++;
    const list = allFilteredProducts.length > 0 ? allFilteredProducts : window.ProductService.getAllProducts();
    renderProductsWithPagination(list, containerId);
}

// Expose globally
window.currentSort = currentSort;
window.currentFilters = currentFilters;
window.currentPage = currentPage;
window.productsPerPage = productsPerPage;
window.allFilteredProducts = allFilteredProducts;
window.sortProducts = sortProducts;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.loadMoreProducts = loadMoreProducts;
window.renderProductsWithPagination = renderProductsWithPagination;
