// ========== AVENOR MODULAR SCRIPT LOADER ==========
// Automatically imports all sub-modules in correct dependency order.

(function() {
    const modules = [
        'utils.js',
        'products.js',
        'cart.js',
        'wishlist.js',
        'search.js',
        'ai.js',
        'compare.js',
        'checkout.js',
        'payment.js',
        'success.js',
        'filters.js',
        'animations.js',
        'threeScene.js',
        'app.js'
    ];

    // Detect if we are in a subdirectory or root to find files correctly
    const pathPrefix = ''; 

    modules.forEach(moduleName => {
        const scriptEl = document.createElement('script');
        scriptEl.src = pathPrefix + moduleName;
        scriptEl.async = false; // Critical: Load synchronously to preserve execution order
        document.head.appendChild(scriptEl);
    });

    console.log("AVENOR modules loaded successfully in correct sequence.");
})();