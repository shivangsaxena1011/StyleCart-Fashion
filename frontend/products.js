// ========== CENTRALIZED PRODUCT SERVICE ==========

const localFallbackProducts = [
    {
        id: 1,
        name: "iPhone 16 Pro",
        category: "electronics",
        price: 129999,
        image: "images/iphone16.png",
        rating: 4.8,
        discount: "18% OFF",
        description: "Apple iPhone 16 Pro with A18 Pro chip, studio-quality microphones, and advanced pro camera system.",
        brand: "Apple",
        reviewsCount: 48,
        specs: { "Display": "6.3-inch OLED", "Processor": "A18 Pro", "Storage": "256GB" }
    },
    {
        id: 2,
        name: "Samsung Galaxy S25 Ultra",
        category: "electronics",
        price: 124999,
        image: "images/s25ultra.png",
        rating: 4.7,
        discount: "15% OFF",
        description: "Samsung flagship smartphone featuring Galaxy AI, titanium frame, and 200MP camera system.",
        brand: "Samsung",
        reviewsCount: 35,
        specs: { "Display": "6.8-inch AMOLED 2X", "Processor": "Snapdragon 8 Gen 4", "Storage": "512GB" }
    },
    {
        id: 3,
        name: "MacBook Air M4",
        category: "electronics",
        price: 114999,
        image: "images/macbookm4.png",
        rating: 4.9,
        discount: "Top Pick",
        description: "Incredibly thin and fast Apple MacBook Air powered by the state-of-the-art M4 chip.",
        brand: "Apple",
        reviewsCount: 64,
        specs: { "Display": "13.6-inch Liquid Retina", "Processor": "Apple M4", "RAM": "16GB Unified" }
    },
    {
        id: 4,
        name: "ASUS ROG Gaming Laptop",
        category: "gaming",
        price: 89999,
        image: "images/rog.png",
        rating: 4.8,
        discount: "10% OFF",
        description: "High performance gaming laptop with NVIDIA RTX graphics, ROG Intelligent Cooling, and Aura Sync RGB.",
        brand: "ASUS",
        reviewsCount: 22,
        specs: { "Processor": "Intel Core i7", "Graphics": "RTX 4060", "Refresh Rate": "165Hz" }
    },
    {
        id: 5,
        name: "PlayStation 5 Pro",
        category: "gaming",
        price: 54999,
        image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
        rating: 4.9,
        discount: "Hot Deal",
        description: "Sony PlayStation 5 gaming console featuring ultra-high speed SSD, ray tracing, and 4K gaming.",
        brand: "Sony",
        reviewsCount: 88,
        specs: { "Storage": "825GB Custom SSD", "Resolution": "Up to 8K", "HDR": "Yes" }
    },
    {
        id: 6,
        name: "Gaming Keyboard",
        category: "gaming",
        price: 2999,
        image: "images/keyboard.png",
        rating: 4.5,
        discount: "12% OFF",
        description: "Premium mechanical gaming keyboard with customizable RGB backlighting and tactile switches.",
        brand: "Razer",
        reviewsCount: 120,
        specs: { "Switch Type": "Tactile Blue", "Backlight": "RGB Chroma", "Interface": "USB Wired" }
    },
    {
        id: 7,
        name: "Premium Hoodie",
        category: "fashion",
        price: 2499,
        image: "images/hoddie.png",
        rating: 4.4,
        discount: "20% OFF",
        description: "Ultra-comfortable premium quality heavy knit cotton hoodie suited for streetwear styling.",
        brand: "Avenor Couture",
        reviewsCount: 45,
        specs: { "Material": "100% Cotton", "Fit": "Oversized", "Color": "Crimson Black" }
    },
    {
        id: 8,
        name: "Running Shoes",
        category: "fashion",
        price: 3999,
        image: "images/shoes.png",
        rating: 4.6,
        discount: "15% OFF",
        description: "Lightweight running shoes built with responsive cushioning technology and mesh upper.",
        brand: "Nike",
        reviewsCount: 74,
        specs: { "Sole": "React Foam", "Weight": "240g", "Arch Support": "Neutral" }
    },
    {
        id: 9,
        name: "Luxury Perfume",
        category: "beauty",
        price: 4999,
        image: "images/perfume.png",
        rating: 4.7,
        discount: "Luxury Choice",
        description: "Long-lasting fragrance featuring hints of luxury sandalwood, cedarwood, and rich ambergris.",
        brand: "Chanel",
        reviewsCount: 92,
        specs: { "Size": "100 ml", "Type": "Eau de Parfum", "Concentration": "22%" }
    },
    {
        id: 10,
        name: "Face Wash",
        category: "beauty",
        price: 399,
        image: "images/face wash.png",
        rating: 4.3,
        discount: "5% OFF",
        description: "Deep cleansing facial cleanser infused with green tea extracts and hyaluronic acid.",
        brand: "Glow & Co",
        reviewsCount: 140,
        specs: { "Skin Type": "All Skin Types", "Key Active": "Salicylic Acid", "Volume": "150 ml" }
    },
    {
        id: 11,
        name: "Luxury Watch",
        category: "luxury",
        price: 89999,
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
        rating: 4.9,
        discount: "Top Luxury",
        description: "Premium luxury mechanical watch crafted with Swiss precision and sapphire crystal glass.",
        brand: "Rolex",
        reviewsCount: 16,
        specs: { "Movement": "Automatic", "Water Resistance": "100m", "Case Material": "Oystersteel" }
    },
    {
        id: 12,
        name: "Designer Handbag",
        category: "luxury",
        price: 45999,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
        rating: 4.8,
        discount: "Luxury Choice",
        description: "Elegant designer leather handbag styled for high-society events and premium utility.",
        brand: "Gucci",
        reviewsCount: 30,
        specs: { "Material": "Italian Calfskin Leather", "Color": "Tuscan Brown", "Strap": "Detachable Gold Chain" }
    },
    {
        id: 13,
        name: "Gaming Mouse",
        category: "gaming",
        price: 1999,
        image: "images/mouse.png",
        rating: 4.6,
        discount: "10% OFF",
        description: "High precision lightweight RGB gaming mouse with programmable optical sensor.",
        brand: "Logitech",
        reviewsCount: 155,
        specs: { "DPI": "25,000 HERO Sensor", "Weight": "63g", "Connectivity": "LIGHTSPEED Wireless" }
    },
    {
        id: 14,
        name: "Wireless Earbuds",
        category: "electronics",
        price: 7999,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
        rating: 4.5,
        discount: "NEW",
        description: "Active noise cancelling wireless earbuds featuring spatial audio coordinates and touch control surfaces.",
        brand: "Sony",
        reviewsCount: 88,
        specs: { "Driver Size": "12mm", "Battery Life": "Up to 30h", "Waterproof Rating": "IPX4" }
    },
    {
        id: 15,
        name: "Luxury Skincare Kit",
        category: "beauty",
        price: 6999,
        image: "images/skin care.png",
        rating: 4.8,
        discount: "Special Pick",
        description: "Premium skincare kit including anti-aging serum, night repair cream, and hydrating lotion.",
        brand: "Estee Lauder",
        reviewsCount: 29,
        specs: { "Regimen": "Anti-aging & Hydrating", "Duration": "30 Days Supply", "Origin": "Made in USA" }
    },
    {
        id: 16,
        name: "iPhone 17 Pro Max",
        category: "electronics",
        price: 139900,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
        rating: 4.8,
        discount: "Luxury Launch",
        description: "The next-generation ultimate iPhone with expanded Gemini Nano integration and titanium design.",
        brand: "Apple",
        reviewsCount: 15,
        specs: { "Display": "6.9-inch LTPO OLED", "Processor": "A19 Pro", "AI Core": "Gemini Ultra Client" }
    },
    {
        id: 17,
        name: "Samsung Galaxy S28 Ultra",
        category: "electronics",
        price: 129999,
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97",
        rating: 4.7,
        discount: "Top Luxury",
        description: "Premium flagship experience featuring advanced holographic display projection and AI photography.",
        brand: "Samsung",
        reviewsCount: 19,
        specs: { "Camera": "240MP Zoom", "Battery": "6000mAh", "Operating System": "Android 18" }
    },
    {
        id: 18,
        name: "Google Pixel 9 Pro",
        category: "electronics",
        price: 89999,
        image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0",
        rating: 4.6,
        discount: "12% OFF",
        description: "Google Pixel 9 Pro featuring pure Android operating systems, advanced Gemini Pro models, and magic editor tools.",
        brand: "Google",
        reviewsCount: 42,
        specs: { "Camera": "Triple 50MP", "Processor": "Tensor G4", "RAM": "16GB" }
    },
    {
        id: 19,
        name: "Tag Heuer Carrera",
        category: "luxury",
        price: 249999,
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
        rating: 4.9,
        discount: "Swiss Made",
        description: "Swiss luxury chronograph watch with automatic self-winding movement, silver-polished dials.",
        brand: "Tag Heuer",
        reviewsCount: 11,
        specs: { "Movement": "Heuer 02 Automatic", "Power Reserve": "80 Hours", "Strap": "Alligator Leather" }
    },
    {
        id: 20,
        name: "Apple Watch Ultra 3",
        category: "luxury",
        price: 89999,
        image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6",
        rating: 4.8,
        discount: "Adventure Spec",
        description: "The rugged Apple smartwatch designed for deep diving and mountain treks with dual-frequency GPS.",
        brand: "Apple",
        reviewsCount: 38,
        specs: { "Case": "49mm Titanium", "Battery": "72 Hours", "Water Resistance": "100m" }
    },
    {
        id: 21,
        name: "Omega Speedmaster",
        category: "luxury",
        price: 499999,
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
        rating: 4.9,
        discount: "Heritage Spec",
        description: "The iconic Moonwatch chronograph watch featuring legacy manual winding, sapphire sandwich dial backing.",
        brand: "Omega",
        reviewsCount: 7,
        specs: { "Calibre": "Omega 3861", "Winding": "Manual Winding", "Strap": "Steel bracelet" }
    },
    {
        id: 22,
        name: "Razer Blade 18",
        category: "gaming",
        price: 249999,
        image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6",
        rating: 4.6,
        discount: "Ultimate Spec",
        description: "The supreme gaming desktop replacement workstation packing RTX 5080 graphics, 240Hz OLED display panel.",
        brand: "Razer",
        reviewsCount: 18,
        specs: { "Display": "18-inch 4K Mini-LED", "Graphics": "RTX 5080", "Storage": "2TB NVMe" }
    }
];

class ProductService {
    constructor() {
        this.products = [...localFallbackProducts];
        this.baseUrl = "http://localhost:5001/api/products";
    }

    async init() {
        try {
            const response = await fetch(this.baseUrl);
            const data = await response.json();
            if (data.success && data.products && data.products.length > 0) {
                this.products = data.products;
                console.log("ProductService initialized with backend catalog.");
            }
        } catch (err) {
            console.log("ProductService failed to contact backend, utilizing fallback catalog.", err.message);
        }
        window.allProducts = this.products;
        window.products = this.products;
        return this.products;
    }

    getAllProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(p => p.id === parseInt(id));
    }

    getProductsByCategory(category) {
        if (!category || category.toLowerCase() === 'all') return this.products;
        return this.products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    searchProducts(query, category = 'all') {
        let list = this.getProductsByCategory(category);
        if (!query) return list;
        const q = query.toLowerCase().trim();
        return list.filter(p => 
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q))
        );
    }

    getTrendingProducts() {
        // High rated products or custom selection
        return [...this.products].sort((a, b) => b.rating - a.rating).slice(0, 6);
    }

    getFlashDeals() {
        // Products with % OFF or custom selection
        return this.products.filter(p => p.discount && p.discount.includes('%')).slice(0, 4);
    }

    getLuxuryProducts() {
        return this.getProductsByCategory("luxury").slice(0, 4);
    }

    getRecommendedProducts() {
        // Mix of electronics and luxury
        return this.products.filter(p => p.rating >= 4.7).slice(4, 8);
    }

    getRelatedProducts(product) {
        if (!product) return [];
        return this.products.filter(p => p.id !== product.id && p.category.toLowerCase() === product.category.toLowerCase()).slice(0, 4);
    }
}

// Instantiate and expose globally
const productServiceInstance = new ProductService();
window.ProductService = productServiceInstance;
window.allProducts = productServiceInstance.getAllProducts();
window.products = productServiceInstance.getAllProducts();

// Fast-initialize so data is available on script load
productServiceInstance.init();