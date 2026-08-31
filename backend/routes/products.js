/**
 * Products Router
 * Handles product endpoints
 */
const router = require('express').Router();
const { getMongoStatus } = require('../config/database');
const { Product } = require('../models');
const { verifyAdmin } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const store = require('../data/inMemoryStore');
const config = require('../config/environment');
const GeminiProvider = require('../services/geminiProvider');
const ai = new GeminiProvider(config.geminiApiKey);

// Helper to get products
async function getProducts() {
    if (getMongoStatus()) {
        return await Product.find({});
    }
    return store.products;
}

// GET /
router.get('/', async (req, res) => {
    try {
        const list = await getProducts();
        return sendSuccess(res, { products: list, count: list.length });
    } catch (err) {
        return sendError(res, "Failed to fetch products database.", 500);
    }
});

// GET /:id
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const list = await getProducts();
        const product = list.find(p => p.id === id);
        if (!product) {
            return sendError(res, "Product not found.", 404);
        }
        return sendSuccess(res, { product });
    } catch (err) {
        return sendError(res, "Failed to load product details.", 500);
    }
});

// POST /
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const data = req.body;
        const productsList = await getProducts();
        const nextId = productsList.length > 0 ? Math.max(...productsList.map(p => p.id)) + 1 : 1;
        data.id = nextId;

        if (getMongoStatus()) {
            const newProd = new Product(data);
            await newProd.save();
            return sendSuccess(res, { product: newProd }, 201);
        } else {
            store.products.push(data);
            return sendSuccess(res, { product: data }, 201);
        }
    } catch (err) {
        return sendError(res, "Failed to add product.", 500);
    }
});

// PUT /:id
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updates = req.body;

        if (getMongoStatus()) {
            const updated = await Product.findOneAndUpdate({ id }, updates, { new: true });
            if (!updated) return sendError(res, "Product not found.", 404);
            return sendSuccess(res, { product: updated });
        } else {
            const index = store.products.findIndex(p => p.id === id);
            if (index === -1) return sendError(res, "Product not found.", 404);
            store.products[index] = { ...store.products[index], ...updates };
            return sendSuccess(res, { product: store.products[index] });
        }
    } catch (err) {
        return sendError(res, "Failed to update product.", 500);
    }
});

// DELETE /:id
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (getMongoStatus()) {
            const deleted = await Product.findOneAndDelete({ id });
            if (!deleted) return sendError(res, "Product not found.", 404);
            return sendSuccess(res, { message: "Product deleted." });
        } else {
            const index = store.products.findIndex(p => p.id === id);
            if (index === -1) return sendError(res, "Product not found.", 404);
            store.products.splice(index, 1);
            return sendSuccess(res, { message: "Product deleted." });
        }
    } catch (err) {
        return sendError(res, "Failed to delete product.", 500);
    }
});

// GET /:id/sustainability
router.get('/:id/sustainability', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const list = await getProducts();
        const product = list.find(p => p.id === id);
        
        if (!product) return sendError(res, "Product not found.", 404);
        
        const score = Math.floor(Math.random() * 30) + 70;
        return sendSuccess(res, { 
            sustainability: {
                score,
                materials: "Organic Cotton & Recycled Fibers",
                carbonFootprint: "Low",
                waterUsage: "-40% vs Industry Average"
            }
        });
    } catch (err) {
        return sendError(res, "Failed to fetch sustainability data.", 500);
    }
});

// GET /:id/intelligence
router.get('/:id/intelligence', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const list = await getProducts();
        const product = list.find(p => p.id === id);
        
        if (!product) return sendError(res, "Product not found.", 404);
        
        return sendSuccess(res, { 
            intelligence: {
                trendAlignment: "High",
                seasonality: ["Spring", "Summer"],
                versatilityScore: 85
            }
        });
    } catch (err) {
        return sendError(res, "Failed to fetch intelligence data.", 500);
    }
});

// GET /:id/review-summary
router.get('/:id/review-summary', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const list = await getProducts();
        const product = list.find(p => p.id === id);
        
        if (!product) return sendError(res, "Product not found.", 404);
        
        // Use AI provider to summarize mock reviews
        const mockReviews = [
            "Great fit and quality.",
            "Love the color, very true to pictures.",
            "A bit tight around the shoulders but otherwise perfect.",
            "Material feels premium, worth the price.",
            "Will definitely buy again in other colors!"
        ];
        
        const summary = await ai.summarizeReviews(mockReviews);
        return sendSuccess(res, { summary });
    } catch (err) {
        return sendError(res, "Failed to generate review summary.", 500);
    }
});

module.exports = router;
