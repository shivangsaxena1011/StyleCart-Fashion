// ========== SEARCH MODULE ==========

let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

function addToSearchHistory(query) {
    if (!query || query.length < 2) return;
    searchHistory = searchHistory.filter(item => item !== query);
    searchHistory.unshift(query);
    searchHistory = searchHistory.slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

function getSearchHistory() {
    return searchHistory;
}

function filterByCategory(category) {
    const categorySelect = document.getElementById('searchCategory');
    if (categorySelect) {
        categorySelect.value = category;
        performSearch();
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('searchCategory');
    
    if (!searchInput || !categorySelect) return;
    
    const query = searchInput.value.toLowerCase().trim();
    const category = categorySelect.value;
    
    if (query) addToSearchHistory(query);
    
    const filtered = window.ProductService.searchProducts(query, category);
    
    showSearchSuggestions(query, filtered);
    
    window.allFilteredProducts = filtered;
    window.currentPage = 1;
    
    const sections = ['flashDeals', 'trendingProducts', 'recommendedProducts', 'electronicsProducts', 'luxuryProducts', 'recentProducts'];
    sections.forEach(sectionId => {
        const container = document.getElementById(sectionId);
        if (container) {
            if (filtered.length > 0) {
                container.innerHTML = filtered.map(p => window.createProductCard(p, sectionId)).join("");
            } else {
                container.innerHTML = `
                    <div class="no-results" style="grid-column:1/-1;text-align:center;padding:60px 20px;">
                        <strong>🔍 No products found matching "${query}"</strong>
                        <p style="color:var(--muted);margin-top:8px;">Try searching for "iPhone", "MacBook", "Perfume", or "Watch".</p>
                        <button onclick="askAI('${query}')" style="margin-top:20px;padding:12px 30px;border-radius:999px;background:var(--maroon-light);color:white;border:none;cursor:pointer;font-weight:700;">
                            🤖 Ask StyleCart AI
                        </button>
                    </div>
                `;
            }
        }
    });
}

function showSearchSuggestions(query, results) {
    const existingSuggestions = document.querySelector('.search-suggestions');
    if (existingSuggestions) existingSuggestions.remove();
    
    if (!query || query.length < 2) return;
    
    const suggestions = document.createElement('div');
    suggestions.className = 'search-suggestions';
    
    let html = '';
    
    const history = getSearchHistory();
    if (history.length > 0 && query.length < 3) {
        html += `<div class="suggestion-group"><strong style="display:block;padding:8px 16px;font-size:0.8rem;color:var(--muted);text-transform:uppercase;">Recent Searches</strong>`;
        history.slice(0, 5).forEach(item => {
            html += `<div class="suggestion-item" style="padding:10px 16px;cursor:pointer;" onclick="document.getElementById('searchInput').value='${item}';window.performSearch();">🔍 ${item}</div>`;
        });
        html += `</div>`;
    }
    
    if (results.length > 0) {
        html += `<div class="suggestion-group"><strong style="display:block;padding:8px 16px;font-size:0.8rem;color:var(--muted);text-transform:uppercase;">Products</strong>`;
        results.slice(0, 5).forEach(p => {
            html += `<div class="suggestion-item" style="padding:10px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;" onclick="window.goToProduct(${p.id})">
                <img src="${p.image}" alt="${p.name}" style="width:30px;height:30px;border-radius:4px;object-fit:cover;" onerror="this.src='https://via.placeholder.com/30/5b101b/ffffff?text=P'">
                <div>
                    <div>${p.name}</div>
                    <div style="color:var(--muted);font-size:0.75rem;">${p.category} • ₹${p.price.toLocaleString()}</div>
                </div>
            </div>`;
        });
        html += `</div>`;
    } else {
        html += `<div class="suggestion-group" style="padding:12px 16px;color:var(--muted);font-size:0.9rem;">
            No instant matches found. Click "Search" or <span style="color:var(--maroon-light);cursor:pointer;font-weight:700;" onclick="window.askAI('${query}')">Ask StyleCart AI</span>
        </div>`;
    }
    
    suggestions.innerHTML = html;
    
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        searchBox.appendChild(suggestions);
    }
    
    document.addEventListener('click', function closeSuggestions(e) {
        if (!e.target.closest('.search-box')) {
            if (suggestions) suggestions.remove();
            document.removeEventListener('click', closeSuggestions);
        }
    });
}

function startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        window.showNotification('Voice search not supported in this browser');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        window.showNotification('🎤 Listening... Speak now');
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = transcript;
            performSearch();
        }
        window.showNotification(`🔍 Searching for: "${transcript}"`);
    };
    
    recognition.onerror = () => {
        window.showNotification('Voice search error. Please try again.');
    };
    
    recognition.start();
}

// Expose globally
window.searchHistory = searchHistory;
window.filterByCategory = filterByCategory;
window.performSearch = performSearch;
window.showSearchSuggestions = showSearchSuggestions;
window.startVoiceSearch = startVoiceSearch;
