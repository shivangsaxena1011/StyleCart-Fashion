const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const { GoogleGenerativeAI } = require("@google/generative-ai");
const AvenorAICore = require("./aiCore");

const app = express();
app.use(cors());
app.use(express.json());

// Serving frontend and product images statically
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/images", express.static(path.join(__dirname, "../images")));

// ========== CONFIGURATIONS ==========
const JWT_SECRET = process.env.JWT_SECRET || "AVENOR_LUXURY_SECRET_KEY";
const PORT = process.env.PORT || 5001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("PORT =", PORT);
console.log("GEMINI KEY FOUND =", !!GEMINI_API_KEY);

// ========== GEMINI & AI CORE SETUP ==========
let genAI = null;
if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}
let aiCore = new AvenorAICore(GEMINI_API_KEY);

// ========== HYBRID DB BACKING ==========
let isMongoConnected = false;
const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/avenor";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected Successfully at", mongoURI);
    isMongoConnected = true;
    seedDatabase();
}).catch(err => {
    console.log("WARNING: MongoDB connection failed. Falling back to in-memory store.");
    console.log("Reason:", err.message);
});

// ========== MONGOOSE SCHEMAS ==========
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", UserSchema);

const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    image: { type: String, required: true },
    discount: { type: String, default: "NEW" },
    description: { type: String },
    brand: { type: String, default: "Avenor Premium" },
    reviewsCount: { type: Number, default: 12 },
    specs: { type: Map, of: String }
});
const Product = mongoose.model("Product", ProductSchema);

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    address: {
        fullName: { type: String },
        addressLine: { type: String },
        city: { type: String },
        postalCode: { type: String },
        phone: { type: String }
    },
    products: [{
        id: Number,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "UPI" },
    paymentStatus: { type: String, default: "Paid" },
    orderStatus: { type: String, default: "Processing" },
    transactionId: { type: String },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", OrderSchema);

const StyleProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    archetype: { type: String, default: "Modern Minimalist" },
    minimalismScore: { type: Number, default: 85 },
    classicScore: { type: Number, default: 78 },
    streetwearScore: { type: Number, default: 62 },
    formalScore: { type: Number, default: 74 },
    preferredColors: [{ type: String }],
    avoidedColors: [{ type: String }],
    preferredFit: { type: String, default: "Regular / Relaxed" },
    updatedAt: { type: Date, default: Date.now }
});
const StyleProfile = mongoose.model("StyleProfile", StyleProfileSchema);

const WardrobeItemSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    userEmail: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    color: { type: String, default: "Neutral" },
    material: { type: String, default: "Cotton Blend" },
    pattern: { type: String, default: "Solid" },
    formality: { type: String, default: "Casual" },
    season: { type: String, default: "All Season" },
    isFavorite: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
    image: { type: String }
});
const WardrobeItem = mongoose.model("WardrobeItem", WardrobeItemSchema);

const LookbookSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, default: "Avenor Curator" },
    description: { type: String },
    productIds: [{ type: Number }],
    likesCount: { type: Number, default: 42 },
    savesCount: { type: Number, default: 18 },
    coverImage: { type: String },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});
const Lookbook = mongoose.model("Lookbook", LookbookSchema);

const TrendSchema = new mongoose.Schema({
    name: { type: String, required: true },
    direction: { type: String, default: "up" },
    category: { type: String, default: "Fashion" },
    velocity: { type: String, default: "+48% Search Lift" },
    matchingProductIds: [{ type: Number }]
});
const Trend = mongoose.model("Trend", TrendSchema);

// ========== IN-MEMORY FALLBACK DATABASE ==========
let inMemoryUsers = [];
let inMemoryProducts = [];
let inMemoryOrders = [];
let inMemoryStyleProfiles = {};
let inMemoryWardrobeItems = [
    { id: 101, userEmail: "guest@avenor.com", name: "Casual Denim Shirt", category: "upper", color: "Blue", material: "100% Cotton Denim", pattern: "Solid", formality: "Casual", isFavorite: true, usageCount: 6, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0" },
    { id: 102, userEmail: "guest@avenor.com", name: "Slim Fit Black Jeans", category: "lower", color: "Black", material: "Cotton Stretch", pattern: "Solid", formality: "Smart Casual", isFavorite: true, usageCount: 12, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246" },
    { id: 103, userEmail: "guest@avenor.com", name: "White Leather Court Sneakers", category: "shoes", color: "White", material: "Leather", pattern: "Solid", formality: "Casual", isFavorite: false, usageCount: 4, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772" }
];
let inMemoryLookbooks = [
    { id: "lb-1", title: "Summer Minimalist", author: "Avenor Studio", description: "Clean lines, sandy linen textures, and polarized gold accents.", productIds: [33, 24, 27, 31], likesCount: 128, savesCount: 64, coverImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c", tags: ["Summer", "Minimalism", "Linen"] },
    { id: "lb-2", title: "Midnight Corporate Luxe", author: "Elena Vance", description: "Midnight navy blazers styled with Italian suede Chelsea boots and Rolex status.", productIds: [26, 25, 28, 29, 11], likesCount: 210, savesCount: 95, coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf", tags: ["Formal", "Luxury", "Suiting"] }
];
let inMemoryTrends = [
    { name: "Oversized Tailoring & Drop Shoulders", direction: "up", category: "Silhouettes", velocity: "+64% Search Lift", matchingProductIds: [23, 26, 30] },
    { name: "Earth Tones & Warm Beige", direction: "up", category: "Colors", velocity: "+42% Engagement", matchingProductIds: [33, 29, 24] },
    { name: "Minimal Court Sneakers", direction: "up", category: "Footwear", velocity: "+55% Wishlist Saves", matchingProductIds: [31] },
    { name: "Vintage Indigo Denim Layers", direction: "up", category: "Streetwear", velocity: "+38% View Lift", matchingProductIds: [23] }
];

// Default Initial Products list
const defaultProducts = [
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
    },
    {
        id: 23,
        name: "AI Styled Oversized Denim Jacket",
        category: "fashion",
        price: 3499,
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0",
        rating: 4.6,
        discount: "New AI Style",
        description: "Premium heavy denim jacket with drop shoulder tailoring, distressed detailing, and vintage metal buttons.",
        brand: "Avenor Couture",
        reviewsCount: 28,
        specs: { "Material": "100% Cotton Denim", "Color": "Vintage Indigo", "Fit": "Oversized" }
    },
    {
        id: 24,
        name: "AI Styled Cotton Cargo Pants",
        category: "fashion",
        price: 1899,
        image: "https://images.unsplash.com/photo-1517462964-21fdcec3f25b",
        rating: 4.5,
        discount: "Trending",
        description: "Highly durable utility cargo pants featuring double-stitched pockets and adjustable drawstring ankle cuffs.",
        brand: "Avenor Couture",
        reviewsCount: 42,
        specs: { "Material": "100% Cotton Twill", "Color": "Military Olive", "Fit": "Relaxed Fit" }
    },
    {
        id: 25,
        name: "AI Styled Classic White T-Shirt",
        category: "fashion",
        price: 999,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
        rating: 4.8,
        discount: "Essential",
        description: "Ultra-soft, heavyweight combed cotton tee with ribbed crew neck. Essential building block for any modern outfit.",
        brand: "Avenor Couture",
        reviewsCount: 104,
        specs: { "Material": "Supima Cotton", "Color": "Optic White", "Fit": "Regular Fit" }
    },
    {
        id: 26,
        name: "AI Styled Slim Fit Blazer",
        category: "fashion",
        price: 5999,
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
        rating: 4.7,
        discount: "Smart Pick",
        description: "Sophisticated wool-blend blazer featuring notch lapels, dual button closure, and interior pocket linings.",
        brand: "Avenor Couture",
        reviewsCount: 19,
        specs: { "Material": "70% Wool, 30% Polyester", "Color": "Midnight Navy", "Fit": "Slim Fit" }
    },
    {
        id: 27,
        name: "AI Styled Aviator Sunglasses",
        category: "fashion",
        price: 2199,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
        rating: 4.9,
        discount: "Premium Tech",
        description: "Classic gold metal-framed aviators with polarized dark green lenses providing complete UV400 shield.",
        brand: "Ray-Ban",
        reviewsCount: 85,
        specs: { "Frame": "Stainless Steel Gold", "Lens": "Polarized G-15", "Protection": "100% UV400" }
    },
    {
        id: 28,
        name: "AI Styled Minimalist Leather Belt",
        category: "fashion",
        price: 1299,
        image: "https://images.unsplash.com/photo-1624222247344-550fb8ec5521",
        rating: 4.6,
        discount: "Classic Accessory",
        description: "Genuine full-grain calfskin leather belt with a sleek matte black finish and brushed silver buckle.",
        brand: "Avenor Premium",
        reviewsCount: 37,
        specs: { "Material": "Calfskin Leather", "Color": "Onyx Black", "Width": "3.5 cm" }
    },
    {
        id: 29,
        name: "AI Styled Luxury Suede Chelsea Boots",
        category: "fashion",
        price: 7999,
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f",
        rating: 4.8,
        discount: "Premium Quality",
        description: "Handcrafted Italian suede boots featuring flexible elastic side panels and signature crepe soles.",
        brand: "Avenor Premium",
        reviewsCount: 23,
        specs: { "Material": "Italian Suede Leather", "Color": "Honey Tan", "Sole": "Natural Crepe" }
    },
    {
        id: 30,
        name: "AI Styled Premium Wool Overcoat",
        category: "fashion",
        price: 8999,
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
        rating: 4.9,
        discount: "Winter Special",
        description: "Tailored long overcoat in rich merino wool blend. Perfect layering piece for corporate or casual wear.",
        brand: "Avenor Premium",
        reviewsCount: 14,
        specs: { "Material": "80% Merino Wool", "Color": "Charcoal Grey", "Length": "Three-Quarter" }
    },
    {
        id: 31,
        name: "AI Styled Retro Leather Sneakers",
        category: "fashion",
        price: 4499,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
        rating: 4.7,
        discount: "Bestseller",
        description: "Throwback court sneakers in clean nappa leather with contrast crimson piping and gum rubber outer soles.",
        brand: "Nike",
        reviewsCount: 93,
        specs: { "Material": "Nappa Leather & Suede", "Color": "White & Crimson", "Style": "Retro Court" }
    },
    {
        id: 32,
        name: "AI Styled Velvet Party Blazer",
        category: "fashion",
        price: 7499,
        image: "https://images.unsplash.com/photo-1520975916090-3105956dac55",
        rating: 4.8,
        discount: "Luxury Launch",
        description: "Opulent velvet blazer featuring silk satin lapels and a single vent. Engineered for stellar red-carpet events.",
        brand: "Avenor Couture",
        reviewsCount: 11,
        specs: { "Material": "Silk Velvet Blend", "Color": "Burgundy Wine", "Fit": "Modern Fit" }
    },
    {
        id: 33,
        name: "AI Styled Linen Summer Shirt",
        category: "fashion",
        price: 1799,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
        rating: 4.5,
        discount: "Summer Cool",
        description: "Lightweight, breathable pure linen shirt with standard band collar. Keeps you cool in tropical temperatures.",
        brand: "Avenor Couture",
        reviewsCount: 51,
        specs: { "Material": "100% Pure Linen", "Color": "Sandy Beige", "Sleeve": "Long Sleeve" }
    }
];

inMemoryProducts = [...defaultProducts];

// Seeder function
async function seedDatabase() {
    try {
        if (isMongoConnected) {
            for (const prod of defaultProducts) {
                const exists = await Product.findOne({ id: prod.id });
                if (!exists) {
                    await Product.create(prod);
                    console.log(`Seeded missing product: ${prod.name}`);
                }
            }
        }
    } catch (err) {
        console.error("Database Seeding Error:", err);
    }
}

// Helper to retrieve products from MongoDB or memory
async function getDbProducts() {
    if (isMongoConnected) {
        return await Product.find({});
    } else {
        return inMemoryProducts;
    }
}

// ========== AUTHENTICATION MIDDLEWARE ==========
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "Access Denied. Token missing." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ success: false, message: "Invalid or expired token." });
    }
}

function verifyAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.role === "admin") {
            next();
        } else {
            res.status(403).json({ success: false, message: "Access denied. Admin role required." });
        }
    });
}

// ========== AUTHENTICATION ENDPOINTS ==========

app.post("/api/auth/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please provide all required fields." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const hashedPassword = await bcrypt.hash(password, 10);

        if (isMongoConnected) {
            const existing = await User.findOne({ email: normalizedEmail });
            if (existing) {
                return res.status(400).json({ success: false, message: "Email already registered." });
            }
            const newUser = new User({ name, email: normalizedEmail, password: hashedPassword, role: role || "user" });
            await newUser.save();
            const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
            res.status(201).json({ success: true, token, user: { name: newUser.name, email: newUser.email, role: newUser.role } });
        } else {
            const existing = inMemoryUsers.find(u => u.email === normalizedEmail);
            if (existing) {
                return res.status(400).json({ success: false, message: "Email already registered." });
            }
            const mockId = Math.random().toString(36).substr(2, 9);
            const newUser = { id: mockId, name, email: normalizedEmail, password: hashedPassword, role: role || "user" };
            inMemoryUsers.push(newUser);
            const token = jwt.sign({ id: mockId, email: normalizedEmail, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
            res.status(201).json({ success: true, token, user: { name: newUser.name, email: newUser.email, role: newUser.role } });
        }
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Internal server error during registration." });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (isMongoConnected) {
            const user = await User.findOne({ email: normalizedEmail });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ success: false, message: "Invalid email or password." });
            }
            const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
            res.json({ success: true, token, user: { name: user.name, email: user.email, role: user.role } });
        } else {
            const user = inMemoryUsers.find(u => u.email === normalizedEmail);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ success: false, message: "Invalid email or password." });
            }
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
            res.json({ success: true, token, user: { name: user.name, email: user.email, role: user.role } });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Internal server error during login." });
    }
});

app.post("/api/auth/forgot-password", (req, res) => {
    // Elegant mockup reset trigger response
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
    }
    res.json({ success: true, message: "Password reset link has been dispatched to " + email });
});

app.get("/api/auth/me", verifyToken, async (req, res) => {
    try {
        if (isMongoConnected) {
            const user = await User.findById(req.user.id).select("-password");
            if (!user) return res.status(404).json({ success: false, message: "User not found." });
            res.json({ success: true, user });
        } else {
            const user = inMemoryUsers.find(u => u.id === req.user.id);
            if (!user) return res.status(404).json({ success: false, message: "User not found." });
            res.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error identifying active user." });
    }
});

// ========== PRODUCT API ROUTING ==========

app.get("/api/products", async (req, res) => {
    try {
        const list = await getDbProducts();
        res.json({ success: true, products: list });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch products database." });
    }
});

app.get("/api/products/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const list = await getDbProducts();
        const product = list.find(p => p.id === id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to load product details." });
    }
});

// Admin Add Product
app.post("/api/products", verifyAdmin, async (req, res) => {
    try {
        const data = req.body;
        const products = await getDbProducts();
        const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        data.id = nextId;

        if (isMongoConnected) {
            const newProd = new Product(data);
            await newProd.save();
            res.status(201).json({ success: true, product: newProd });
        } else {
            inMemoryProducts.push(data);
            res.status(201).json({ success: true, product: data });
        }
    } catch (err) {
        console.error("Add Product Error:", err);
        res.status(500).json({ success: false, message: "Failed to add new product." });
    }
});

// Admin Edit Product
app.put("/api/products/:id", verifyAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;

        if (isMongoConnected) {
            const updated = await Product.findOneAndUpdate({ id }, data, { new: true });
            if (!updated) return res.status(404).json({ success: false, message: "Product not found." });
            res.json({ success: true, product: updated });
        } else {
            const index = inMemoryProducts.findIndex(p => p.id === id);
            if (index === -1) return res.status(404).json({ success: false, message: "Product not found." });
            inMemoryProducts[index] = { ...inMemoryProducts[index], ...data };
            res.json({ success: true, product: inMemoryProducts[index] });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update product details." });
    }
});

// Admin Delete Product
app.delete("/api/products/:id", verifyAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isMongoConnected) {
            const deleted = await Product.findOneAndDelete({ id });
            if (!deleted) return res.status(404).json({ success: false, message: "Product not found." });
            res.json({ success: true, message: "Product deleted successfully." });
        } else {
            const index = inMemoryProducts.findIndex(p => p.id === id);
            if (index === -1) return res.status(404).json({ success: false, message: "Product not found." });
            inMemoryProducts.splice(index, 1);
            res.json({ success: true, message: "Product deleted successfully." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete product." });
    }
});

// ========== ORDERS API ROUTING ==========

app.post("/api/orders", async (req, res) => {
    try {
        const { customerName, email, address, products, subtotal, shipping, total, paymentMethod, transactionId } = req.body;
        if (!customerName || !email || !products || products.length === 0) {
            return res.status(400).json({ success: false, message: "Required order details are missing." });
        }

        const date = new Date();
        const orderId = "#ORD-" + date.getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
        const txnId = transactionId || ("TXN" + Math.floor(Math.random() * 900000000000));

        let userRef = null;
        const authHeader = req.headers["authorization"];
        if (authHeader) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, JWT_SECRET);
                userRef = decoded.id;
            } catch (jwtErr) {
                // Ignore invalid JWT token, proceed as guest order
            }
        }

        const orderData = {
            orderId,
            user: userRef,
            customerName,
            email: email.toLowerCase().trim(),
            address,
            products,
            subtotal,
            shipping,
            total,
            paymentMethod,
            transactionId: txnId,
            paymentStatus: "Paid",
            orderStatus: "Processing",
            createdAt: date
        };

        if (isMongoConnected) {
            const newOrder = new Order(orderData);
            await newOrder.save();
            res.status(201).json({ success: true, order: newOrder });
        } else {
            inMemoryOrders.unshift(orderData);
            res.status(201).json({ success: true, order: orderData });
        }
    } catch (err) {
        console.error("Order Creation Error:", err);
        res.status(500).json({ success: false, message: "Internal server error creating order." });
    }
});

// Get User's Orders
app.get("/api/orders", async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({ success: false, message: "Authentication token required." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const email = decoded.email.toLowerCase().trim();

        if (isMongoConnected) {
            const userOrders = await Order.find({
                $or: [
                    { user: decoded.id },
                    { email: email }
                ]
            }).sort({ createdAt: -1 });
            res.json({ success: true, orders: userOrders });
        } else {
            const userOrders = inMemoryOrders.filter(o =>
                (o.user && o.user === decoded.id) ||
                (o.email && o.email.toLowerCase() === email)
            );
            res.json({ success: true, orders: userOrders });
        }
    } catch (err) {
        console.error("Fetch Orders Error:", err);
        res.status(401).json({ success: false, message: "Failed to fetch order history." });
    }
});

// ========== ADMIN ENDPOINTS ==========

app.get("/api/admin/orders", verifyAdmin, async (req, res) => {
    try {
        if (isMongoConnected) {
            const allOrders = await Order.find({}).sort({ createdAt: -1 });
            res.json({ success: true, orders: allOrders });
        } else {
            res.json({ success: true, orders: inMemoryOrders });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to load orders." });
    }
});

app.put("/api/admin/orders/:id", verifyAdmin, async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const id = req.params.id;

        if (isMongoConnected) {
            const updated = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true });
            if (!updated) return res.status(404).json({ success: false, message: "Order not found." });
            res.json({ success: true, order: updated });
        } else {
            const order = inMemoryOrders.find(o => o.orderId === id || o._id === id);
            if (!order) return res.status(404).json({ success: false, message: "Order not found." });
            order.orderStatus = orderStatus;
            res.json({ success: true, order });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update order status." });
    }
});

app.get("/api/admin/users", verifyAdmin, async (req, res) => {
    try {
        if (isMongoConnected) {
            const users = await User.find({}).select("-password");
            res.json({ success: true, users });
        } else {
            const users = inMemoryUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
            res.json({ success: true, users });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to retrieve user list." });
    }
});

app.get("/api/admin/analytics", verifyAdmin, async (req, res) => {
    try {
        const productsList = await getDbProducts();
        const ordersList = isMongoConnected ? await Order.find({}) : inMemoryOrders;
        const usersCount = isMongoConnected ? await User.countDocuments() : inMemoryUsers.length + 5; // offset default count

        const totalRevenue = ordersList.reduce((sum, o) => sum + o.total, 0);

        // Sales statistics
        const salesByDate = {};
        ordersList.forEach(o => {
            const dateStr = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            salesByDate[dateStr] = (salesByDate[dateStr] || 0) + o.total;
        });

        const analytics = {
            totalProducts: productsList.length,
            totalOrders: ordersList.length,
            totalUsers: usersCount,
            totalRevenue,
            salesHistory: Object.entries(salesByDate).map(([date, amount]) => ({ date, amount })).slice(-7)
        };

        res.json({ success: true, analytics });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to load dashboard metrics." });
    }
});

// ========== GEMINI AI SEARCH / CHAT / COMPARE ROUTING ==========

app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;
    try {

        if (!message) {
            return res.status(400).json({ success: false, reply: "Message input is required." });
        }

        if (!genAI) {
            return res.json({
                success: true,
                reply: "Hello! I am Avenor's AI Assistant. Currently, my API model is operating in keyword fallback mode because the API key is not configured. I can help search for luxury watches, premium phones, and gaming consoles!"
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const products = await getDbProducts();

        const prompt = `
You are Avenor AI, a smart and helpful shopping assistant for a luxury marketplace. 
You help users find products, compare items, suggest alternatives, recommend accessories, and offer budgeting advice.

User Question: ${message}

${history ? `Previous conversation: ${JSON.stringify(history)}` : ""}

Available Products:
${products.map(p => `- ${p.name} (${p.category}): ₹${p.price} - ${p.description}`).join("\n")}

Please respond in a friendly, helpful, and concise manner.
If recommending products, list 3-4 specific products from the available list with their prices.
`;

        const result = await model.generateContent(prompt);
        const reply = result.response.text();

        res.json({ success: true, reply });

    } catch (error) {
        console.error("Chat Error:", error);
        const products = await getDbProducts();
        const queryLower = message.toLowerCase();
        let reply = "";

        if (queryLower.includes("laptop") || queryLower.includes("macbook") || queryLower.includes("asus")) {
            reply = "💻 **Avenor AI Laptop Recommendation:**\nI suggest checking out the **MacBook Air M4** (₹1,14,999) for elite performance and light travel, or the **ASUS ROG Gaming Laptop** (₹89,999) featuring dedicated cooling and ray-traced visuals for gamers and heavy rendering.";
        } else if (queryLower.includes("phone") || queryLower.includes("iphone") || queryLower.includes("samsung") || queryLower.includes("pixel")) {
            reply = "📱 **Avenor AI Mobile Suggestion:**\nFor the ultimate premium experience, check out the **iPhone 17 Pro Max** (₹1,39,900) or **Samsung Galaxy S28 Ultra** (₹1,29,999). For standard value, the **Google Pixel 9 Pro** (₹89,999) offers best-in-class AI camera magic.";
        } else if (queryLower.includes("watch") || queryLower.includes("rolex") || queryLower.includes("tag heuer")) {
            reply = "⌚ **Avenor AI Timepiece Styling:**\nI highly recommend the Swiss **Rolex Luxury Watch** (₹89,999) or the polished **Tag Heuer Carrera** (₹2,49,999) for unmatched corporate and heritage status styling.";
        } else if (queryLower.includes("blazer") || queryLower.includes("suit") || queryLower.includes("jacket") || queryLower.includes("fashion") || queryLower.includes("outfit")) {
            reply = "🧥 **Avenor AI Outfit Styling:**\nI recommend pairing the **AI Styled Slim Fit Blazer** (₹5,999) over our **AI Styled Classic White T-Shirt** (₹999), anchored with **AI Styled Cotton Cargo Pants** (₹1,899) and **AI Styled Retro Leather Sneakers** (₹4,499) for a modern, comfortable smart-casual look.";
        } else {
            reply = "🤖 **Hello! I am Avenor's AI Assistant.**\nI can help you style outfits, search catalog products (Laptops, Phones, Luxury, and Streetwear), and compare items. Try asking me something like *'Show me laptops under 1 lakh'* or *'Suggest a party outfit'*!";
        }

        res.json({ success: true, reply });
    }
});

app.post("/api/ai-search", async (req, res) => {
    const { query, history } = req.body;
    try {

        if (!query) {
            return res.status(400).json({ success: false, recommendations: [], message: "Query is required." });
        }

        const products = await getDbProducts();

        if (!genAI) {
            // Perform fallback search
            const keywords = query.toLowerCase().split(" ");
            const matched = products.filter(p =>
                keywords.some(k =>
                    p.name.toLowerCase().includes(k) ||
                    p.category.toLowerCase().includes(k) ||
                    p.description.toLowerCase().includes(k)
                )
            ).slice(0, 4);
            return res.json({
                success: true,
                recommendations: matched,
                message: "API Key offline. Displaying local keyword search recommendations."
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are Avenor AI, a smart shopping assistant.

User Query: "${query}"

Available Products in Catalog:
${products.map(p => `- ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: ₹${p.price}, Rating: ${p.rating}, Description: ${p.description}`).join("\n")}

${history ? `Previous conversation: ${JSON.stringify(history)}` : ""}

Task: Recommend the best 3-4 products from the list that match the user's query.
Also provide a brief explanation of why you recommend these products.

Return a JSON response with:
{
  "recommendations": [product IDs as numbers],
  "message": "Your explanation message"
}

Only return the JSON. No markdown backticks, no other text.
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let recommendations = [];
        let message = "Based on your query, I recommend these products.";

        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
                    recommendations = products.filter(p => parsed.recommendations.includes(p.id));
                }
                if (parsed.message) {
                    message = parsed.message;
                }
            } else {
                throw new Error("No JSON found in response");
            }
        } catch (parseError) {
            // Fallback search
            const keywords = query.toLowerCase().split(" ");
            recommendations = products.filter(p =>
                keywords.some(k =>
                    p.name.toLowerCase().includes(k) ||
                    p.category.toLowerCase().includes(k)
                )
            ).slice(0, 4);
        }

        if (recommendations.length === 0) {
            recommendations = products.slice(0, 4);
            message = "I couldn't find exact matches. Here are some of our popular luxury items.";
        }

        res.json({
            success: true,
            recommendations: recommendations.slice(0, 4),
            message
        });

    } catch (error) {
        console.error("AI Search Error:", error);
        const products = await getDbProducts();
        const keywords = query.toLowerCase().split(" ");
        const matched = products.filter(p =>
            keywords.some(k =>
                p.name.toLowerCase().includes(k) ||
                p.category.toLowerCase().includes(k) ||
                p.description.toLowerCase().includes(k)
            )
        ).slice(0, 4);

        const recommendations = matched.length > 0 ? matched : products.slice(0, 4);
        res.json({
            success: true,
            recommendations,
            message: "Avenor AI selected these matching products from our catalog."
        });
    }
});

// ========== AVENOR 2.0 AI CORE PLATFORM ENDPOINTS ==========

// 1. AI STYLIST 2.0 (Dual route alias /api/ai/stylist & /api/ai-fashion/stylist)
const handleStylistRequest = async (req, res) => {
    try {
        const { message, budget, weather, occasion, styleDNA, userEmail } = req.body;
        const products = await getDbProducts();
        
        let wardrobeItems = inMemoryWardrobeItems;
        if (isMongoConnected && userEmail) {
            wardrobeItems = await WardrobeItem.find({ userEmail });
        }

        const result = await aiCore.generateStylistOutfit({
            message,
            budget,
            weather,
            occasion,
            styleDNA,
            wardrobeItems,
            catalogProducts: products
        });

        res.json(result);
    } catch (error) {
        console.error("AI Stylist 2.0 Error:", error);
        res.status(500).json({ success: false, message: "AI Stylist 2.0 encountered an error." });
    }
};

app.post("/api/ai/stylist", handleStylistRequest);
app.post("/api/ai-fashion/stylist", handleStylistRequest);

// 2. AI SHOPPING AGENT CONCIERGE
app.post("/api/ai/shopping-agent", async (req, res) => {
    try {
        const { goal, context } = req.body;
        if (!goal) return res.status(400).json({ success: false, message: "Shopping goal prompt is required." });
        
        const products = await getDbProducts();
        const agentResult = await aiCore.runShoppingAgent(goal, context, products);
        res.json(agentResult);
    } catch (err) {
        console.error("Shopping Agent Error:", err);
        res.status(500).json({ success: false, message: "Shopping Agent failed to process request." });
    }
});

// 3. CAPSULE WARDROBE GENERATOR
app.post("/api/ai/capsule-wardrobe", async (req, res) => {
    try {
        const { budget, season } = req.body;
        const products = await getDbProducts();
        const capsule = await aiCore.generateCapsuleWardrobe(budget, season, products);
        res.json(capsule);
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to generate capsule wardrobe." });
    }
});

// 4. SIZE & FIT AI
app.post("/api/ai/fit", async (req, res) => {
    try {
        const { height, weight, chest, waist, hips, preferredFit, productId } = req.body;
        const products = await getDbProducts();
        const product = products.find(p => p.id === parseInt(productId));
        
        const fitData = aiCore.calculateFitRecommendation({ height, weight, chest, waist, hips, preferredFit }, product);
        res.json(fitData);
    } catch (err) {
        res.status(500).json({ success: false, message: "Fit recommendation error." });
    }
});

// 5. STEAL THIS LOOK & VISION SEARCH
app.post("/api/vision/steal-look", async (req, res) => {
    try {
        const { imageUrl } = req.body;
        const products = await getDbProducts();
        const result = await aiCore.stealThisLook(imageUrl, products);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: "Steal This Look analysis failed." });
    }
});

app.post("/api/vision/search", async (req, res) => {
    try {
        const products = await getDbProducts();
        const fashion = products.filter(p => p.category === "fashion" || p.category === "luxury" || p.category === "beauty");
        res.json({
            success: true,
            detectedAttributes: { primaryColor: "Navy Blue", silhouette: "Tailored Blazer", formality: "Smart Casual" },
            recommendations: fashion.slice(0, 4)
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Visual search failed." });
    }
});

// 6. STYLE DNA & PERSONALIZATION
app.get("/api/ai/style-dna", async (req, res) => {
    try {
        res.json({
            success: true,
            styleDNA: {
                archetype: "Modern Minimalist",
                scores: { minimalism: 91, classic: 78, streetwear: 62, formal: 84, experimental: 31 },
                preferredColors: ["Black", "White", "Navy", "Beige"],
                avoidedColors: ["Neon Pink"],
                preferredFit: "Relaxed / Regular"
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Style DNA fetch failed." });
    }
});

app.post("/api/ai/style-dna", async (req, res) => {
    try {
        const { archetype, preferredColors, preferredFit } = req.body;
        res.json({
            success: true,
            message: "Style DNA updated successfully.",
            styleDNA: { archetype, preferredColors, preferredFit }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update Style DNA." });
    }
});

// 7. DIGITAL WARDROBE API
app.get("/api/wardrobe", async (req, res) => {
    try {
        if (isMongoConnected) {
            const items = await WardrobeItem.find({});
            res.json({ success: true, items });
        } else {
            res.json({ success: true, items: inMemoryWardrobeItems });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch wardrobe." });
    }
});

app.post("/api/wardrobe", async (req, res) => {
    try {
        const { name, category, color, material, formality, season, image } = req.body;
        const newItem = {
            id: Date.now(),
            userEmail: "guest@avenor.com",
            name: name || "Custom Wardrobe Piece",
            category: category || "upper",
            color: color || "Black",
            material: material || "Cotton",
            formality: formality || "Casual",
            season: season || "All Season",
            isFavorite: true,
            usageCount: 1,
            image: image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518"
        };

        if (isMongoConnected) {
            const doc = new WardrobeItem(newItem);
            await doc.save();
        } else {
            inMemoryWardrobeItems.unshift(newItem);
        }

        res.status(201).json({ success: true, item: newItem });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to add wardrobe item." });
    }
});

app.delete("/api/wardrobe/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isMongoConnected) {
            await WardrobeItem.findOneAndDelete({ id });
        } else {
            inMemoryWardrobeItems = inMemoryWardrobeItems.filter(w => w.id !== id);
        }
        res.json({ success: true, message: "Item removed from wardrobe." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete item." });
    }
});

app.post("/api/wardrobe/combinations", async (req, res) => {
    try {
        const items = isMongoConnected ? await WardrobeItem.find({}) : inMemoryWardrobeItems;
        const uppers = items.filter(i => i.category === "upper");
        const lowers = items.filter(i => i.category === "lower");
        const shoes = items.filter(i => i.category === "shoes");

        const comboCount = Math.max(1, uppers.length) * Math.max(1, lowers.length) * Math.max(1, shoes.length);

        res.json({
            success: true,
            totalItems: items.length,
            combinationsCount: comboCount,
            message: `You can create ${comboCount} distinct outfit combinations from your current digital wardrobe.`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to calculate wardrobe combinations." });
    }
});

// 8. FASHION LOOKBOOKS & SOCIAL LAYER
app.get("/api/lookbooks", async (req, res) => {
    try {
        if (isMongoConnected) {
            const list = await Lookbook.find({}).sort({ createdAt: -1 });
            res.json({ success: true, lookbooks: list });
        } else {
            res.json({ success: true, lookbooks: inMemoryLookbooks });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to load lookbooks." });
    }
});

app.post("/api/lookbooks", async (req, res) => {
    try {
        const { title, description, productIds, tags } = req.body;
        const newLb = {
            id: "lb-" + Date.now(),
            title: title || "New Creator Lookbook",
            author: "Avenor Member",
            description: description || "Curated ensemble.",
            productIds: productIds || [26, 25, 29],
            likesCount: 1,
            savesCount: 0,
            coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
            tags: tags || ["Style"],
            createdAt: new Date()
        };

        if (isMongoConnected) {
            const doc = new Lookbook(newLb);
            await doc.save();
        } else {
            inMemoryLookbooks.unshift(newLb);
        }

        res.status(201).json({ success: true, lookbook: newLb });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to publish lookbook." });
    }
});

// 9. TREND INTELLIGENCE API
app.get("/api/trends", async (req, res) => {
    try {
        const products = await getDbProducts();
        res.json({
            success: true,
            trends: inMemoryTrends,
            trendingProducts: products.filter(p => [23, 26, 30, 33, 29, 31].includes(p.id))
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Trend intelligence offline." });
    }
});

// 10. AI PRODUCT INTELLIGENCE & SUSTAINABILITY
app.get("/api/products/:id/sustainability", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const products = await getDbProducts();
        const product = products.find(p => p.id === id);

        res.json({
            success: true,
            impact: {
                productName: product ? product.name : "Avenor Garment",
                material: product?.specs?.Material || "100% Organic Supima Cotton",
                durabilityRating: "A+ High Longevity",
                versatilityScore: 94,
                possibleCombinations: 14,
                certifications: ["GOTS Certified Organic", "Zero Hazardous Dyes", "Fair Trade Textiles"]
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Sustainability metrics unavailable." });
    }
});

app.get("/api/products/:id/intelligence", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const products = await getDbProducts();
        const product = products.find(p => p.id === id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found." });

        const items = inMemoryWardrobeItems;
        const compatibleWardrobeCount = Math.min(items.length + 3, 9);
        const styleWith = products.filter(p => p.category === "fashion" && p.id !== id).slice(0, 3);

        res.json({
            success: true,
            intelligence: {
                whyYouWillLikeIt: `The ${product.name} features refined craftsmanship and versatile drape, aligning smoothly with your modern luxury preferences.`,
                bestForOccasions: ["Cocktail Parties", "Executive Meetings", "Weekend Getaways"],
                wardrobeCompatibility: {
                    score: 94,
                    matchingOwnedCount: compatibleWardrobeCount,
                    message: `Works seamlessly with ${compatibleWardrobeCount} items in your digital wardrobe.`
                },
                styleWithProducts: styleWith
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Product intelligence unavailable." });
    }
});

// 11. AI MEMORY PREFERENCES MANAGEMENT
app.get("/api/ai/memory", async (req, res) => {
    try {
        res.json({
            success: true,
            memory: {
                preferredBrands: ["Avenor Couture", "Avenor Premium", "Rolex", "Nike"],
                preferredFit: "Regular / Relaxed",
                typicalBudget: "₹10,000 - ₹25,000",
                favoriteOccasion: "Smart Casual & Evening Parties",
                avoidedMaterials: ["Polyester blend"]
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Memory fetch failed." });
    }
});

app.delete("/api/ai/memory", async (req, res) => {
    try {
        res.json({
            success: true,
            message: "AI personalization memory has been safely reset."
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Memory reset failed." });
    }
});

// 12. AI FASHION CONCIERGE & KNOWLEDGE ENGINE
app.post("/api/ai/concierge", async (req, res) => {
    try {
        const { destination, days, purpose } = req.body;
        const products = await getDbProducts();
        const fashion = products.filter(p => p.category === "fashion" || p.category === "luxury");

        res.json({
            success: true,
            tripPlan: {
                destination: destination || "Paris",
                duration: `${days || 5} Days`,
                packingStrategy: "7-Piece Versatile Luxury Capsule",
                dailyOutfits: [
                    { day: 1, occasion: "Arrival & City Stroll", outfit: [fashion[0], fashion[1]] },
                    { day: 2, occasion: "Art Gallery & Fine Dining", outfit: [fashion[2], fashion[3]] },
                    { day: 3, occasion: "Museums & Shopping", outfit: [fashion[0], fashion[4] || fashion[1]] }
                ]
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Concierge trip plan error." });
    }
});

app.post("/api/ai/knowledge", async (req, res) => {
    try {
        const { query } = req.body;
        const products = await getDbProducts();
        const fashion = products.filter(p => p.category === "fashion" || p.category === "luxury");

        res.json({
            success: true,
            query: query || "What is smart casual?",
            explanation: "Smart Casual is a dress code that combines refined business attire (blazers, crisp button-downs, leather footwear) with elevated casual garments (dark denim, tailored chinos, clean white tees).",
            recommendedProducts: fashion.slice(0, 3)
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Knowledge engine offline." });
    }
});

app.post("/api/ai-fashion/score", async (req, res) => {
    try {
        const { productIds } = req.body;
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ success: false, message: "A list of product IDs is required." });
        }

        const products = await getDbProducts();
        const selected = products.filter(p => productIds.includes(p.id));

        let scoreResult = null;

        if (genAI && selected.length > 0) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `
You are the Avenor AI Fashion Analyzer.
Evaluate the aesthetic compatibility of this outfit combination:
${selected.map(p => `- ${p.name} (${p.category}): ₹${p.price}. Description: ${p.description}. Specs: ${JSON.stringify(p.specs)}`).join("\n")}

Compute the styling score metrics out of 100 for:
1. Color Harmony (color combinations compatibility)
2. Occasion Adaptability (suitability for diverse settings)
3. Body Fit (compatibility of cuts/shapes)
4. Trend Score (streetwear/classic fashion alignment)
5. Confidence (aesthetic boost value)

Also calculate the overall weighted score.
Provide 2-3 specific fashion tips to improve or expand this outfit.

Return ONLY a raw JSON response. No markdown backticks, no other text.
Format:
{
  "overallScore": 92,
  "metrics": {
    "harmony": 94,
    "occasion": 91,
    "fit": 88,
    "trend": 95,
    "confidence": 93
  },
  "tips": [
    "Tip 1...",
    "Tip 2..."
  ]
}
`;
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    scoreResult = JSON.parse(jsonMatch[0]);
                }
            } catch (err) {
                console.error("Gemini Scoring Error:", err);
            }
        }

        if (!scoreResult) {
            // Heuristic Scoring algorithm
            let harmony = 80;
            let occasion = 75;
            let fit = 85;
            let trend = 78;
            let confidence = 82;
            const tips = [];

            const hasUpper = selected.some(p => p.name.includes("Shirt") || p.name.includes("Hoodie") || p.name.includes("Blazer") || p.name.includes("Jacket") || p.name.includes("Overcoat"));
            const hasLower = selected.some(p => p.name.includes("Pants") || p.name.includes("Cargo") || p.name.includes("Jeans"));
            const hasShoes = selected.some(p => p.name.includes("Shoes") || p.name.includes("Boots") || p.name.includes("Sneakers"));
            const hasAccessories = selected.some(p => p.category === "luxury" || p.category === "beauty" || p.name.includes("Sunglasses") || p.name.includes("Belt") || p.name.includes("Watch"));

            // Compatibility rules
            if (hasUpper && hasLower) {
                harmony += 8;
                trend += 6;
            }
            if (hasUpper && hasLower && hasShoes) {
                harmony += 7;
                confidence += 8;
                fit += 5;
            }
            if (hasAccessories) {
                confidence += 5;
                trend += 4;
            }

            // Specific combinations
            const hasVelvet = selected.some(p => p.name.includes("Velvet"));
            const hasSuede = selected.some(p => p.name.includes("Suede"));
            const hasRolex = selected.some(p => p.brand === "Rolex" || p.brand === "Tag Heuer");
            const hasDenim = selected.some(p => p.name.includes("Denim"));
            const hasLinen = selected.some(p => p.name.includes("Linen"));

            if (hasVelvet && hasSuede) {
                harmony += 5;
                occasion += 10; // Great evening/party attire
                tips.push("AI Stylist: The velvet blazer and suede Chelsea boots form a luxurious, tactile match that excels at night.");
            }
            if (hasDenim && hasLower) {
                trend += 5;
                tips.push("AI Stylist: Denim layering is a staple for streetwear. Keep the inner tee neutral for optimal color contrast.");
            }
            if (hasLinen && hasAccessories) {
                tips.push("AI Stylist: Complete the summer linen look by pairing with our lightweight polarized aviator sunglasses.");
            }
            if (hasRolex) {
                confidence += 6;
                tips.push("AI Stylist: A premium luxury timepiece serves as a superb anchor to elevate the entire outfit's stature.");
            }

            if (tips.length === 0) {
                tips.push("AI Stylist: Try mixing formal wear (like blazers) with casual staples (like white tees) to achieve a modern smart-casual aesthetic.");
                tips.push("AI Stylist: Add matching footwear and structural accessories to balance the visual weight of the outfit.");
            }

            // Cap at 100
            harmony = Math.min(harmony, 99);
            occasion = Math.min(occasion, 99);
            fit = Math.min(fit, 99);
            trend = Math.min(trend, 99);
            confidence = Math.min(confidence, 99);

            const overallScore = Math.round((harmony + occasion + fit + trend + confidence) / 5);

            scoreResult = {
                overallScore,
                metrics: { harmony, occasion, fit, trend, confidence },
                tips
            };
        }

        res.json({
            success: true,
            ...scoreResult
        });

    } catch (error) {
        console.error("AI Fashion Score Error:", error);
        res.status(500).json({ success: false, message: "Failed to compile AI Fashion Score." });
    }
});

app.post("/api/ai-fashion/weather-style", async (req, res) => {
    try {
        const { weather, temp } = req.body;
        const products = await getDbProducts();

        let selectedIds = [];
        let weatherText = weather || "Sunny";
        let tempVal = parseInt(temp) || 28;

        if (tempVal < 18) {
            // Cold weather: Overcoat, boots, watch
            selectedIds = [30, 29, 20];
        } else if (tempVal > 30) {
            // Hot weather: Summer linen shirt, sunglasses, sneakers
            selectedIds = [33, 27, 31];
        } else {
            // Mild weather: Denim jacket, cargo pants, white tee, sneakers
            selectedIds = [23, 24, 25, 31];
        }

        const selectedProducts = products.filter(p => selectedIds.includes(p.id));

        res.json({
            success: true,
            weather: weatherText,
            temperature: tempVal,
            message: `AI recommendation for ${weatherText} weather at ${tempVal}°C:`,
            products: selectedProducts
        });

    } catch (error) {
        console.error("AI Weather style Error:", error);
        res.status(500).json({ success: false, message: "Weather Styling encountered an error." });
    }
});

app.post("/api/compare", async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
            return res.status(400).json({
                success: false,
                analysis: "Please provide at least 2 product IDs to compare."
            });
        }

        const allProds = await getDbProducts();
        const products = allProds.filter(p => productIds.includes(p.id));

        if (products.length < 2) {
            return res.status(400).json({
                success: false,
                analysis: "Could not find products with the provided IDs."
            });
        }

        if (!genAI) {
            const sorted = [...products].sort((a, b) => a.price - b.price);
            let analysis = `### Spec Comparison:\n\n`;
            products.forEach(p => {
                analysis += `- **${p.name}** (₹${p.price.toLocaleString()}): Rated ${p.rating}★. ${p.description}\n`;
            });
            analysis += `\n**Best Value Choice:** ${sorted[0].name} (₹${sorted[0].price.toLocaleString()})\n`;
            analysis += `**Premium Choice:** ${sorted[sorted.length - 1].name} (₹${sorted[sorted.length - 1].price.toLocaleString()})`;
            return res.json({ success: true, products, analysis });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const productDetails = products.map(p =>
            `- ${p.name}: Price: ₹${p.price}, Category: ${p.category}, Rating: ${p.rating}, Description: ${p.description}`
        ).join("\n");

        const prompt = `
Compare these products and provide a detailed analysis:

${productDetails}

Please provide:
1. Key differences between the products (pros, cons, specs)
2. Which product offers the best value for money
3. Which product is recommended overall and why
4. Who each product is best suited for

Keep the analysis structured and easy to read for a shopper.
`;

        const result = await model.generateContent(prompt);
        const analysis = result.response.text();

        res.json({
            success: true,
            products,
            analysis
        });

    } catch (error) {
        console.error("Compare Error:", error);
        const allProds = await getDbProducts();
        const products = allProds.filter(p => req.body.productIds?.includes(p.id)) || [];
        const sorted = [...products].sort((a, b) => a.price - b.price);
        let analysis = `### Avenor AI Comparison Insight:\n\n`;
        products.forEach(p => {
            analysis += `- **${p.name}** (₹${p.price.toLocaleString()}): Rated ${p.rating}★. ${p.description}\n`;
        });
        analysis += `\n**Value Suggestion:** ${sorted[0].name} (₹${sorted[0].price.toLocaleString()}) offers the best budget choice.\n`;
        analysis += `**Premium Suggestion:** ${sorted[sorted.length - 1].name} (₹${sorted[sorted.length - 1].price.toLocaleString()}) offers the ultimate spec experience.`;
        res.json({
            success: true,
            products,
            analysis
        });
    }
});

// ========== AI REVIEW SUMMARIZATION ENDPOINT ==========
app.get("/api/products/:id/review-summary", async (req, res) => {
    try {
        const prodId = parseInt(req.params.id);
        const allProds = await getDbProducts();
        const product = allProds.find(p => p.id === prodId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        let summaryData = null;

        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `You are Avenor AI, an expert retail reviews analyst for a luxury marketplace.
Analyze this product:
Name: ${product.name}
Description: ${product.description}
Brand: ${product.brand}
Category: ${product.category}
Price: ₹${product.price}

Synthesize standard consumer feedback and generate a structured AI Review Summary. 
Determine:
1. List of 3 major Pros
2. List of 2 major Cons
3. A short, elegant summary paragraph (2-3 sentences)
4. Sizing recommendation advice (e.g. "Runs true to size. Sizing matches slim-fit profile.")
5. An overall customer sentiment score between 80 and 100 based on standard reviews.

Return ONLY a raw JSON response. No markdown backticks, no other text.
Format:
{
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2"],
  "summary": "Overall summary paragraph",
  "sizeRecommendation": "Sizing advice text",
  "overallSentiment": 92
}`;
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    summaryData = JSON.parse(jsonMatch[0]);
                }
            } catch (err) {
                console.error("Gemini Review Summary Error:", err);
            }
        }

        // Fallback Heuristics
        if (!summaryData) {
            const cat = (product.category || "").toLowerCase();
            if (cat === "fashion" || cat === "luxury") {
                summaryData = {
                    pros: [
                        "Exceptional textile weave and drape quality",
                        "Highly versatile; works for formal layers and street casual fits",
                        "Tailored fit that accentuates silhouette lines nicely"
                    ],
                    cons: [
                        "Dry clean recommended for premium longevity",
                        "Positioned at a luxury price point"
                    ],
                    summary: `The ${product.name} has garnered acclaim for its superior finish and stylish styling versatility. Customers note that it feels premium on the skin and holds its shape exceptionally well over long durations.`,
                    sizeRecommendation: "94% of buyers report this fits true to size. We suggest ordering your regular size.",
                    overallSentiment: 93
                };
            } else if (cat === "electronics" || cat === "gaming") {
                summaryData = {
                    pros: [
                        "Incredible speed and fluid visual refresh metrics",
                        "Robust, premium build styling and high aesthetic value",
                        "Outstanding cooling capability and thermal ventilation layout"
                    ],
                    cons: [
                        "High initial purchase investment required",
                        "Accessory bundles must be purchased separately"
                    ],
                    summary: `Reviews highlight the ${product.name} as a class-leading option with unmatched performance. Its industrial design and structural rigidity are highly praised by power users.`,
                    sizeRecommendation: "Fully compatible with standard layouts and Avenor premium cabling rigs.",
                    overallSentiment: 91
                };
            } else {
                summaryData = {
                    pros: [
                        "Sleek and premium design lines",
                        "Highly functional and matches catalog description perfectly",
                        "Excellent gift wrapping compatibility"
                    ],
                    cons: [
                        "Limited seasonal stock counts",
                        "Slight premium mark-up compared to standard models"
                    ],
                    summary: `Overall, buyers are extremely satisfied with the durability and look of the ${product.name}. It makes a solid premium addition to any collection.`,
                    sizeRecommendation: "Standard specifications apply. Runs true to standard expectations.",
                    overallSentiment: 89
                };
            }
        }

        res.json({
            success: true,
            summary: summaryData
        });

    } catch (error) {
        console.error("Review summary route error:", error);
        res.status(500).json({ success: false, message: "Review summarizer offline." });
    }
});

// Serve frontend routing fallback
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});