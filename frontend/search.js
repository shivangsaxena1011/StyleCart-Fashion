// ========== SEARCH & INTELLIGENCE MODULE ==========

let searchHistory = JSON.parse(localStorage.getItem('stylecart_search_history') || '[]');

function addToSearchHistory(query) {
    if (!query || query.length < 2) return;
    const clean = query.trim();
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== clean.toLowerCase());
    searchHistory.unshift(clean);
    searchHistory = searchHistory.slice(0, 10);
    localStorage.setItem('stylecart_search_history', JSON.stringify(searchHistory));
}

function getSearchHistory() {
    return searchHistory;
}

function clearSearchHistory() {
    searchHistory = [];
    localStorage.removeItem('stylecart_search_history');
    const box = document.querySelector('.search-suggestions');
    if (box) box.remove();
}

function filterByCategory(category) {
    const categorySelect = document.getElementById('searchCategory');
    if (categorySelect) {
        categorySelect.value = category;
    }
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    performSearch(query, category);
}

function performSearch(customQuery = null, customCategory = null) {
    const searchInput = document.getElementById('searchInput');
    const heroInput = document.getElementById('aiHeroSearchInput');
    const categorySelect = document.getElementById('searchCategory');
    
    let query = '';
    if (customQuery !== null) {
        query = customQuery.trim();
    } else if (searchInput && searchInput.value.trim()) {
        query = searchInput.value.trim();
    } else if (heroInput && heroInput.value.trim()) {
        query = heroInput.value.trim();
    }

    let category = 'all';
    if (customCategory !== null) {
        category = customCategory;
    } else if (categorySelect) {
        category = categorySelect.value;
    }

    // Sync input values
    if (searchInput) searchInput.value = query;
    if (heroInput) heroInput.value = query;
    if (categorySelect && customCategory) categorySelect.value = category;

    // Close any open suggestion dropdowns
    document.querySelectorAll('.search-suggestions').forEach(el => el.remove());

    if (query) {
        addToSearchHistory(query);
    }

    // If query is empty and category is all, restore normal view
    if (!query && (!category || category === 'all')) {
        clearSearch();
        return;
    }

    const filtered = window.ProductService ? window.ProductService.searchProducts(query, category) : [];
    window.allFilteredProducts = filtered;
    window.currentPage = 1;

    // Render into dedicated Search Results Section
    renderSearchResultsSection(query, category, filtered);

    // Also populate category sections on landing page
    const sections = ['flashDeals', 'trendingProducts', 'recommendedProducts', 'electronicsProducts', 'luxuryProducts', 'recentProducts'];
    sections.forEach(sectionId => {
        const container = document.getElementById(sectionId);
        if (container) {
            if (filtered.length > 0) {
                container.innerHTML = filtered.slice(0, 8).map(p => window.createProductCard(p, sectionId)).join("");
            } else {
                container.innerHTML = `
                    <div class="no-results" style="grid-column:1/-1;text-align:center;padding:40px 20px;">
                        <span style="font-size:2rem;display:block;margin-bottom:10px;">🔍</span>
                        <strong>No products found in this section</strong>
                    </div>
                `;
            }
        }
    });

    if (window.attachTiltCards) window.attachTiltCards();
}

function renderSearchResultsSection(query, category, results) {
    let section = document.getElementById('searchResultsSection');
    
    if (!section) {
        section = document.createElement('section');
        section.id = 'searchResultsSection';
        section.className = 'product-section search-results-active';
        
        // Insert right below hero or before curated categories
        const main = document.querySelector('main');
        const firstSection = document.querySelector('main > section:nth-of-type(2)');
        if (main && firstSection) {
            main.insertBefore(section, firstSection);
        } else if (main) {
            main.appendChild(section);
        }
    }

    section.style.display = 'block';

    const categoryLabel = category && category !== 'all' ? ` in ${category.toUpperCase()}` : '';
    const queryDisplay = query ? `"${escapeHtml(query)}"${categoryLabel}` : `Category: ${category.toUpperCase()}`;

    if (results.length > 0) {
        section.innerHTML = `
            <div class="search-results-banner">
                <div class="search-results-header">
                    <div>
                        <div class="tag-pill" style="margin-bottom:8px;"><span class="pink-dot"></span> SEARCH RESULTS</div>
                        <h2 class="serif-heading" style="font-size:clamp(1.8rem, 4vw, 2.5rem);">
                            Results for <span class="heading-italic">${queryDisplay}</span>
                        </h2>
                        <p style="color:var(--muted); font-size:0.95rem; margin-top:6px;">
                            Found <strong style="color:#ffffff;">${results.length}</strong> matching products across the catalog
                        </p>
                    </div>
                    <div class="search-header-actions">
                        <button type="button" class="btn-clear-search" onclick="window.clearSearch()">✕ Clear Search</button>
                    </div>
                </div>
            </div>
            <div class="product-grid" id="searchResultsGrid">
                ${results.map(p => window.createProductCard(p, 'searchResults')).join('')}
            </div>
        `;
    } else {
        section.innerHTML = `
            <div class="search-results-banner">
                <div class="search-results-header">
                    <div>
                        <div class="tag-pill" style="margin-bottom:8px;"><span class="pink-dot"></span> NO RESULTS</div>
                        <h2 class="serif-heading" style="font-size:clamp(1.8rem, 4vw, 2.5rem);">
                            No direct matches for <span class="heading-italic">${queryDisplay}</span>
                        </h2>
                        <p style="color:var(--muted); font-size:0.95rem; margin-top:6px;">
                            Try searching for popular styles, electronics, or tap a recommendation below:
                        </p>
                    </div>
                    <div class="search-header-actions">
                        <button type="button" class="btn-clear-search" onclick="window.clearSearch()">✕ Clear Search</button>
                    </div>
                </div>
                <div class="search-fallback-chips" style="display:flex; flex-wrap:wrap; gap:10px; margin:20px 0 10px;">
                    <button class="fallback-chip" onclick="window.performSearch('Samsung Phone')">📱 Samsung Phones</button>
                    <button class="fallback-chip" onclick="window.performSearch('Wireless Earbuds')">🎧 Wireless Earbuds</button>
                    <button class="fallback-chip" onclick="window.performSearch('Floral Dress')">👗 Summer Dresses</button>
                    <button class="fallback-chip" onclick="window.performSearch('Running Shoes')">👟 Running Shoes</button>
                    <button class="fallback-chip" onclick="window.performSearch('Luxury Watch')">⌚ Luxury Watches</button>
                    <button class="fallback-chip" onclick="window.performSearch('Skincare Serum')">✨ Skincare Serums</button>
                </div>
                <div style="margin-top:20px;">
                    <button type="button" class="btn-pill-white" onclick="window.askAI('${escapeHtml(query)}')">
                        🤖 Ask StyleCart AI Stylist
                    </button>
                </div>
            </div>
        `;
    }

    // Smooth scroll to results
    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const heroInput = document.getElementById('aiHeroSearchInput');
    const categorySelect = document.getElementById('searchCategory');

    if (searchInput) searchInput.value = '';
    if (heroInput) heroInput.value = '';
    if (categorySelect) categorySelect.value = 'all';

    const searchSection = document.getElementById('searchResultsSection');
    if (searchSection) {
        searchSection.style.display = 'none';
        searchSection.innerHTML = '';
    }

    // Re-render original products
    if (window.renderAllProducts) {
        window.renderAllProducts();
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
}

// ========== AUTOCOMPLETE & LIVE SUGGESTIONS ==========

function showSearchSuggestions(query, results, targetBox = null) {
    document.querySelectorAll('.search-suggestions').forEach(el => el.remove());
    
    const container = targetBox || document.querySelector('.search-box') || document.querySelector('.hero-search-pill');
    if (!container) return;

    const trimmed = (query || '').trim().toLowerCase();
    
    const suggestions = document.createElement('div');
    suggestions.className = 'search-suggestions';

    let html = '';

    // If query is empty or short, show trending & history
    if (trimmed.length < 2) {
        const history = getSearchHistory();
        if (history.length > 0) {
            html += `
                <div class="suggestion-group">
                    <div class="suggestion-group-header">
                        <span>Recent Searches</span>
                        <button type="button" class="clear-history-btn" onclick="window.clearSearchHistory();">Clear</button>
                    </div>
                    <div class="history-chips-row">
                        ${history.slice(0, 5).map(item => `
                            <button type="button" class="history-chip" onclick="window.performSearch('${escapeHtml(item)}');">
                                🕒 ${escapeHtml(item)}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        html += `
            <div class="suggestion-group">
                <div class="suggestion-group-header">
                    <span>Trending Searches</span>
                </div>
                <div class="trending-chips-row">
                    <button type="button" class="trending-chip" onclick="window.performSearch('Samsung Galaxy 5G');">🔥 Samsung 5G</button>
                    <button type="button" class="trending-chip" onclick="window.performSearch('Wireless Earbuds');">🔥 Wireless Earbuds</button>
                    <button type="button" class="trending-chip" onclick="window.performSearch('Running Shoes under 2000');">🔥 Shoes Under ₹2000</button>
                    <button type="button" class="trending-chip" onclick="window.performSearch('Luxury Watch');">🔥 Luxury Watch</button>
                    <button type="button" class="trending-chip" onclick="window.performSearch('Summer Floral Dress');">🔥 Summer Dress</button>
                </div>
            </div>
        `;
    } else {
        // Query has characters -> Show product matches
        const matches = results && results.length > 0 ? results : (window.ProductService ? window.ProductService.searchProducts(trimmed) : []);

        if (matches.length > 0) {
            html += `
                <div class="suggestion-group">
                    <div class="suggestion-group-header">
                        <span>Matching Products (${matches.length})</span>
                    </div>
                    ${matches.slice(0, 5).map(p => `
                        <div class="suggestion-item" onclick="window.goToProduct(${p.id})">
                            <img src="${p.image}" alt="${escapeHtml(p.name)}" class="suggestion-thumb" onerror="this.src='https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80'">
                            <div class="suggestion-meta">
                                <div class="suggestion-name">${escapeHtml(p.name)}</div>
                                <div class="suggestion-sub">
                                    <span class="suggestion-cat">${escapeHtml(p.category)}</span>
                                    <span class="suggestion-price">₹${p.price.toLocaleString()}</span>
                                    ${p.discount ? `<span class="suggestion-disc">${escapeHtml(p.discount)}</span>` : ''}
                                </div>
                            </div>
                            <span class="suggestion-arrow">→</span>
                        </div>
                    `).join('')}
                    <div class="suggestion-footer" onclick="window.performSearch('${escapeHtml(trimmed)}');">
                        <span>View all ${matches.length} results for "<strong>${escapeHtml(trimmed)}</strong>"</span>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="suggestion-group" style="padding:16px; text-align:center;">
                    <p style="color:var(--muted); font-size:0.9rem; margin-bottom:12px;">No quick preview found for "${escapeHtml(trimmed)}"</p>
                    <button type="button" class="btn-pill-white" style="font-size:0.82rem; padding:8px 18px;" onclick="window.performSearch('${escapeHtml(trimmed)}');">
                        Search Entire Catalog 🔍
                    </button>
                </div>
            `;
        }
    }

    suggestions.innerHTML = html;
    container.appendChild(suggestions);

    // Auto close listener
    const closeListener = function(e) {
        if (!container.contains(e.target)) {
            suggestions.remove();
            document.removeEventListener('click', closeListener);
        }
    };
    setTimeout(() => {
        document.addEventListener('click', closeListener);
    }, 50);
}

// ========== VOICE RECOGNITION SEARCH ==========

let voiceRecognitionInstance = null;

function startVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    let voiceOverlay = document.getElementById('voiceSearchOverlay');
    if (!voiceOverlay) {
        voiceOverlay = document.createElement('div');
        voiceOverlay.id = 'voiceSearchOverlay';
        voiceOverlay.className = 'voice-search-modal-overlay';
        document.body.appendChild(voiceOverlay);
    }

    voiceOverlay.innerHTML = `
        <div class="voice-search-card glassmorphism">
            <button type="button" class="close-modal-btn" onclick="window.stopVoiceSearch();">✕</button>
            <div class="voice-wave-container">
                <div class="voice-wave-bar bar1"></div>
                <div class="voice-wave-bar bar2"></div>
                <div class="voice-wave-bar bar3"></div>
                <div class="voice-wave-bar bar4"></div>
                <div class="voice-wave-bar bar5"></div>
            </div>
            <div class="voice-mic-icon-circle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
            </div>
            <h3 class="voice-status-title" id="voiceStatusTitle">Listening...</h3>
            <p class="voice-transcript-text" id="voiceTranscriptText">Speak now (e.g. "Samsung 5G Phone", "Running Shoes", "Black Jacket")</p>
            
            <div class="voice-sample-chips">
                <button type="button" class="voice-sample-chip" onclick="window.simulateVoiceQuery('Samsung Galaxy 5G');">"Samsung Galaxy 5G"</button>
                <button type="button" class="voice-sample-chip" onclick="window.simulateVoiceQuery('Wireless Earbuds under 1000');">"Wireless Earbuds under 1000"</button>
                <button type="button" class="voice-sample-chip" onclick="window.simulateVoiceQuery('Urban Streetwear Jacket');">"Urban Streetwear Jacket"</button>
            </div>
        </div>
    `;

    voiceOverlay.style.display = 'flex';

    if (!SpeechRecognition) {
        const title = document.getElementById('voiceStatusTitle');
        const desc = document.getElementById('voiceTranscriptText');
        if (title) title.innerText = 'Voice Input';
        if (desc) desc.innerText = 'Speech recognition is not supported in this browser. Tap any sample query below:';
        return;
    }

    try {
        if (voiceRecognitionInstance) {
            voiceRecognitionInstance.abort();
        }

        const recognition = new SpeechRecognition();
        voiceRecognitionInstance = recognition;
        recognition.lang = 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            const title = document.getElementById('voiceStatusTitle');
            if (title) title.innerText = 'Listening... Speak now';
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            const transcriptEl = document.getElementById('voiceTranscriptText');
            if (transcriptEl) {
                transcriptEl.innerText = `"${transcript}"`;
                transcriptEl.style.color = 'var(--pink-radiant)';
                transcriptEl.style.fontWeight = '700';
            }

            if (event.results[0].isFinal) {
                setTimeout(() => {
                    stopVoiceSearch();
                    performSearch(transcript);
                    if (window.showNotification) {
                        window.showNotification(`🔍 Voice search: "${transcript}"`, 'success');
                    }
                }, 700);
            }
        };

        recognition.onerror = (e) => {
            const title = document.getElementById('voiceStatusTitle');
            const desc = document.getElementById('voiceTranscriptText');
            if (title) title.innerText = 'Voice input error';
            if (desc) desc.innerText = 'Could not access microphone. Tap a suggestion below or try again.';
        };

        recognition.onend = () => {
            // Finished
        };

        recognition.start();
    } catch (err) {
        console.warn('Voice recognition initialization error:', err);
    }
}

function stopVoiceSearch() {
    if (voiceRecognitionInstance) {
        try { voiceRecognitionInstance.stop(); } catch (e) {}
        voiceRecognitionInstance = null;
    }
    const overlay = document.getElementById('voiceSearchOverlay');
    if (overlay) overlay.style.display = 'none';
}

function simulateVoiceQuery(text) {
    stopVoiceSearch();
    performSearch(text);
    if (window.showNotification) {
        window.showNotification(`🔍 Voice query: "${text}"`, 'success');
    }
}

// ========== AI VISUAL / CAMERA SEARCH ==========

let webCamStream = null;

function openImageSearchModal() {
    const modal = document.getElementById('imageSearchModal');
    if (modal) {
        modal.style.display = 'flex';
        resetImageSearchModal();
    }
}

function closeImageSearchModal() {
    stopWebCam();
    const modal = document.getElementById('imageSearchModal');
    if (modal) modal.style.display = 'none';
}

function stopWebCam() {
    if (webCamStream) {
        webCamStream.getTracks().forEach(t => t.stop());
        webCamStream = null;
    }
    const video = document.getElementById('imageSearchVideo');
    if (video) video.style.display = 'none';
    const dropzone = document.getElementById('imageSearchDropZone');
    if (dropzone) dropzone.style.display = 'block';
}

function toggleWebCam() {
    const video = document.getElementById('imageSearchVideo');
    const dropzone = document.getElementById('imageSearchDropZone');
    const captureBtn = document.getElementById('imageSearchCaptureBtn');

    if (webCamStream) {
        stopWebCam();
        if (captureBtn) captureBtn.style.display = 'none';
        return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                webCamStream = stream;
                if (video) {
                    video.srcObject = stream;
                    video.style.display = 'block';
                    video.play();
                }
                if (dropzone) dropzone.style.display = 'none';
                if (captureBtn) captureBtn.style.display = 'inline-flex';
            })
            .catch(err => {
                if (window.showNotification) {
                    window.showNotification('Camera access denied or unavailable', 'error');
                }
            });
    } else {
        if (window.showNotification) {
            window.showNotification('Camera not supported on this browser', 'error');
        }
    }
}

function captureWebCamPhoto() {
    stopWebCam();
    startVisualScanSimulation("camera_snapshot_streetwear_look.jpg", "Urban Streetwear Fashion");
}

function resetImageSearchModal() {
    const scanner = document.getElementById('imageSearchScanner');
    const dropzone = document.getElementById('imageSearchDropZone');
    const video = document.getElementById('imageSearchVideo');
    const captureBtn = document.getElementById('imageSearchCaptureBtn');

    if (scanner) scanner.style.display = 'none';
    if (dropzone) {
        dropzone.style.display = 'block';
        dropzone.style.opacity = '1';
    }
    if (video) video.style.display = 'none';
    if (captureBtn) captureBtn.style.display = 'none';
}

function handleVisualSampleClick(lookType) {
    const sampleMap = {
        'streetwear': { name: 'streetwear_bomber_outfit.jpg', query: 'streetwear jacket hoodie cargo' },
        'earbuds': { name: 'wireless_earbuds_anc.jpg', query: 'wireless earbuds boAt noise boult' },
        'watch': { name: 'luxury_chronograph_watch.jpg', query: 'luxury watch titan fossil chronograph' },
        'dress': { name: 'floral_summer_maxi_dress.jpg', query: 'floral maxi dress peplum top' },
        'sneakers': { name: 'running_sneakers_shoes.jpg', query: 'running shoes sneakers puma sparx' }
    };

    const target = sampleMap[lookType] || { name: 'outfit.jpg', query: 'streetwear fashion' };
    startVisualScanSimulation(target.name, target.query);
}

function startVisualScanSimulation(filename, query) {
    const scanner = document.getElementById('imageSearchScanner');
    const dropzone = document.getElementById('imageSearchDropZone');
    const video = document.getElementById('imageSearchVideo');

    if (video) video.style.display = 'none';
    if (dropzone) dropzone.style.opacity = '0.4';
    if (scanner) scanner.style.display = 'block';

    const tagsEl = document.getElementById('scannerDetectedTags');
    if (tagsEl) {
        tagsEl.innerHTML = `
            <span class="detected-tag">📷 Analyzing Visuals...</span>
            <span class="detected-tag">🎨 Palette Extraction</span>
            <span class="detected-tag">🏷️ Object Classification</span>
        `;
    }

    setTimeout(() => {
        closeImageSearchModal();
        performSearch(query);
        if (window.showNotification) {
            window.showNotification(`✨ Visual Match complete! Displaying styles matching "${filename}"`, 'success');
        }
    }, 1800);
}

// ========== INITIALIZATION & ATTACHMENTS ==========

document.addEventListener('DOMContentLoaded', () => {
    // Navbar Search Input Events
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categorySelect = document.getElementById('searchCategory');
    const voiceBtn = document.getElementById('voiceSearchBtn');
    const imageBtn = document.getElementById('imageSearchBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value;
            const cat = categorySelect ? categorySelect.value : 'all';
            const filtered = window.ProductService ? window.ProductService.searchProducts(val, cat) : [];
            showSearchSuggestions(val, filtered, document.querySelector('.search-box'));
        });

        searchInput.addEventListener('focus', (e) => {
            const val = e.target.value;
            const cat = categorySelect ? categorySelect.value : 'all';
            const filtered = window.ProductService ? window.ProductService.searchProducts(val, cat) : [];
            showSearchSuggestions(val, filtered, document.querySelector('.search-box'));
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => performSearch());
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', () => performSearch());
    }

    if (voiceBtn) {
        voiceBtn.addEventListener('click', startVoiceSearch);
    }

    if (imageBtn) {
        imageBtn.addEventListener('click', openImageSearchModal);
    }

    // Hero Search Input Events
    const heroInput = document.getElementById('aiHeroSearchInput');
    const heroBtn = document.getElementById('heroSearchSubmitBtn');
    const heroVoiceBtn = document.getElementById('heroVoiceSearchBtn');
    const heroImageBtn = document.getElementById('heroImageSearchBtn');

    if (heroInput) {
        heroInput.addEventListener('input', (e) => {
            const val = e.target.value;
            const filtered = window.ProductService ? window.ProductService.searchProducts(val, 'all') : [];
            showSearchSuggestions(val, filtered, document.querySelector('.hero-search-pill'));
        });

        heroInput.addEventListener('focus', (e) => {
            const val = e.target.value;
            const filtered = window.ProductService ? window.ProductService.searchProducts(val, 'all') : [];
            showSearchSuggestions(val, filtered, document.querySelector('.hero-search-pill'));
        });

        heroInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const q = heroInput.value.trim();
                performSearch(q);
            }
        });
    }

    if (heroBtn) {
        heroBtn.addEventListener('click', () => {
            const q = heroInput ? heroInput.value.trim() : '';
            performSearch(q);
        });
    }

    if (heroVoiceBtn) {
        heroVoiceBtn.addEventListener('click', startVoiceSearch);
    }

    if (heroImageBtn) {
        heroImageBtn.addEventListener('click', openImageSearchModal);
    }

    // Image Upload Dropzone & File Input
    const fileInput = document.getElementById('imageSearchFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const name = file.name.toLowerCase();
                let q = "streetwear jacket cargo";
                if (name.includes("shoe") || name.includes("sneaker")) q = "running shoes sneakers";
                else if (name.includes("watch")) q = "luxury chronograph watch";
                else if (name.includes("dress") || name.includes("top")) q = "floral dress peplum";
                else if (name.includes("earbud") || name.includes("phone")) q = "wireless earbuds bluetooth";
                
                startVisualScanSimulation(file.name, q);
            }
        });
    }
});

// Expose functions globally
window.searchHistory = searchHistory;
window.addToSearchHistory = addToSearchHistory;
window.getSearchHistory = getSearchHistory;
window.clearSearchHistory = clearSearchHistory;
window.filterByCategory = filterByCategory;
window.performSearch = performSearch;
window.clearSearch = clearSearch;
window.showSearchSuggestions = showSearchSuggestions;
window.startVoiceSearch = startVoiceSearch;
window.stopVoiceSearch = stopVoiceSearch;
window.simulateVoiceQuery = simulateVoiceQuery;
window.openImageSearchModal = openImageSearchModal;
window.closeImageSearchModal = closeImageSearchModal;
window.toggleWebCam = toggleWebCam;
window.captureWebCamPhoto = captureWebCamPhoto;
window.handleVisualSampleClick = handleVisualSampleClick;
