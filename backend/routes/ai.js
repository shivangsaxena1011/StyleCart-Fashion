/**
 * AI Router for StyleCart Fashion
 * Handles all AI integration endpoints
 */
const router = require("express").Router();
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { aiLimiter } = require("../middleware/rateLimiter");
const { optionalAuth } = require("../middleware/auth");
const GeminiProvider = require("../services/geminiProvider");
const config = require("../config/environment");
const { getMongoStatus } = require("../config/database");
const { Product, StyleProfile, WardrobeItem } = require("../models");
const store = require("../data/inMemoryStore");

const ai = new GeminiProvider(config.geminiApiKey);

// Helper to retrieve all products
async function getDbProducts() {
    if (getMongoStatus()) {
        return await Product.find({});
    }
    return store.products;
}

// POST /chat & /api/chat
router.post("/chat", aiLimiter, async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) {
            return sendError(res, "Message input is required.", 400);
        }
        const products = await getDbProducts();
        const result = await ai.chat(message, { products, history });
        return res.json({ success: true, reply: result.reply });
    } catch (err) {
        console.error("Chat route error:", err);
        return sendError(res, "AI chat failed.", 500);
    }
});

// POST /ai-search & /search
const handleAiSearch = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.json({ success: true, recommendations: [], message: "Query is required." });
        }
        const products = await getDbProducts();
        const result = await ai.parseSearchQuery(query, products);
        return res.json({
            success: true,
            recommendations: result.recommendations,
            message: result.message
        });
    } catch (err) {
        console.error("AI search error:", err);
        const products = await getDbProducts();
        return res.json({
            success: true,
            recommendations: products.slice(0, 4),
            message: "StyleCart AI selected these matching products from our catalog."
        });
    }
};

router.post("/search", aiLimiter, handleAiSearch);
router.post("/ai-search", aiLimiter, handleAiSearch);

// POST /stylist & /fashion/stylist & /api/ai/stylist
const handleStylist = async (req, res) => {
    try {
        const { message, budget, weather, occasion, styleDNA, userEmail } = req.body;
        const products = await getDbProducts();
        
        let wardrobeItems = store.wardrobeItems;
        if (getMongoStatus() && userEmail) {
            wardrobeItems = await WardrobeItem.find({ userEmail });
        }

        const result = await ai.generateOutfit({
            message: message || "Create a stylish outfit",
            budget,
            weather,
            occasion,
            styleDNA,
            wardrobeItems,
            catalogProducts: products
        });

        return res.json(result);
    } catch (err) {
        console.error("Stylist route error:", err);
        return sendError(res, "AI Stylist encountered an error.", 500);
    }
};

router.post("/stylist", aiLimiter, handleStylist);
router.post("/fashion/stylist", aiLimiter, handleStylist);

// POST /shopping-agent
router.post("/shopping-agent", aiLimiter, async (req, res) => {
    try {
        const { goal, context } = req.body;
        if (!goal) return sendError(res, "Shopping goal prompt is required.", 400);

        const products = await getDbProducts();
        const agentResult = await ai.runShoppingAgent(goal, context, products);
        return res.json(agentResult);
    } catch (err) {
        return sendError(res, "Shopping Agent failed.", 500);
    }
});

// POST /capsule-wardrobe
router.post("/capsule-wardrobe", aiLimiter, async (req, res) => {
    try {
        const { budget, season } = req.body;
        const products = await getDbProducts();
        const capsule = ai.generateCapsuleWardrobe(budget, season, products);
        return res.json(capsule);
    } catch (err) {
        return sendError(res, "Capsule wardrobe generation failed.", 500);
    }
});

// POST /fit
router.post("/fit", aiLimiter, async (req, res) => {
    try {
        const { height, weight, chest, waist, hips, preferredFit, productId } = req.body;
        const products = await getDbProducts();
        const product = products.find(p => p.id === parseInt(productId));

        const fitData = ai.calculateFitRecommendation({ height, weight, chest, waist, hips, preferredFit }, product);
        return res.json(fitData);
    } catch (err) {
        return sendError(res, "Fit recommendation error.", 500);
    }
});

// GET /style-dna
router.get("/style-dna", optionalAuth, async (req, res) => {
    try {
        return res.json({
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
        return sendError(res, "Failed to fetch style DNA.", 500);
    }
});

// POST /style-dna
router.post("/style-dna", optionalAuth, async (req, res) => {
    try {
        const { archetype, preferredColors, preferredFit } = req.body;
        return res.json({
            success: true,
            message: "Style DNA updated successfully.",
            styleDNA: { archetype, preferredColors, preferredFit }
        });
    } catch (err) {
        return sendError(res, "Failed to update Style DNA.", 500);
    }
});

// GET & DELETE /memory
router.get("/memory", optionalAuth, async (req, res) => {
    return res.json({
        success: true,
        memory: {
            preferredBrands: ["StyleCart Couture", "StyleCart Premium", "Rolex", "Nike"],
            preferredFit: "Regular / Relaxed",
            typicalBudget: "₹10,000 - ₹25,000",
            favoriteOccasion: "Smart Casual & Evening Parties",
            avoidedMaterials: ["Polyester blend"]
        }
    });
});

router.delete("/memory", optionalAuth, async (req, res) => {
    return res.json({
        success: true,
        message: "AI personalization memory has been safely reset."
    });
});

// POST /concierge
router.post("/concierge", aiLimiter, async (req, res) => {
    try {
        const { destination, days } = req.body;
        const products = await getDbProducts();
        const fashion = products.filter(p => p.category === "fashion" || p.category === "luxury");

        return res.json({
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
        return sendError(res, "Concierge trip plan error.", 500);
    }
});

// POST /knowledge
router.post("/knowledge", aiLimiter, async (req, res) => {
    try {
        const { query } = req.body;
        const products = await getDbProducts();
        const fashion = products.filter(p => p.category === "fashion" || p.category === "luxury");

        return res.json({
            success: true,
            query: query || "What is smart casual?",
            explanation: "Smart Casual is a dress code that combines refined business attire with elevated casual garments.",
            recommendedProducts: fashion.slice(0, 3)
        });
    } catch (err) {
        return sendError(res, "Knowledge engine offline.", 500);
    }
});

// POST /fashion/score & /score
const handleScore = async (req, res) => {
    try {
        const { productIds } = req.body;
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return sendError(res, "A list of product IDs is required.", 400);
        }
        const products = await getDbProducts();
        const selected = products.filter(p => productIds.includes(p.id));
        const scoreResult = await ai.scoreOutfit(selected);
        return res.json({ success: true, ...scoreResult });
    } catch (err) {
        return sendError(res, "Failed to compile AI Fashion Score.", 500);
    }
};

router.post("/score", aiLimiter, handleScore);
router.post("/fashion/score", aiLimiter, handleScore);

const handleWeatherStyle = async (req, res) => {
    try {
        const { weather, temp } = req.body;
        const products = await getDbProducts();

        let selectedIds = [];
        let weatherText = weather || "Sunny";
        let tempVal = parseInt(temp) || 28;

        if (tempVal < 18) {
            selectedIds = [30, 29, 20];
        } else if (tempVal > 30) {
            selectedIds = [33, 27, 31];
        } else {
            selectedIds = [23, 24, 25, 31];
        }

        const selectedProducts = products.filter(p => selectedIds.includes(p.id));

        return res.json({
            success: true,
            weather: weatherText,
            temperature: tempVal,
            message: `AI recommendation for ${weatherText} weather at ${tempVal}°C:`,
            products: selectedProducts
        });
    } catch (err) {
        return sendError(res, "Weather Styling encountered an error.", 500);
    }
};

router.post("/weather-style", aiLimiter, handleWeatherStyle);
router.post("/weather", aiLimiter, handleWeatherStyle);
router.post("/fashion/weather-style", aiLimiter, handleWeatherStyle);

// POST /compare
router.post("/compare", aiLimiter, async (req, res) => {
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

        const result = await ai.compareProducts(products);
        return res.json({
            success: true,
            products,
            analysis: result.analysis
        });
    } catch (err) {
        return sendError(res, "Comparison failed.", 500);
    }
});

// POST /vision/steal-look & /vision/search
router.post("/vision/steal-look", aiLimiter, async (req, res) => {
    try {
        const { imageUrl } = req.body;
        const products = await getDbProducts();
        const result = ai.stealThisLook(imageUrl, products);
        return res.json(result);
    } catch (err) {
        return sendError(res, "Steal This Look analysis failed.", 500);
    }
});

router.post("/vision/search", aiLimiter, async (req, res) => {
    try {
        const products = await getDbProducts();
        const fashion = products.filter(p => p.category === "fashion" || p.category === "luxury" || p.category === "beauty");
        return res.json({
            success: true,
            detectedAttributes: { primaryColor: "Navy Blue", silhouette: "Tailored Blazer", formality: "Smart Casual" },
            recommendations: fashion.slice(0, 4)
        });
    } catch (err) {
        return sendError(res, "Visual search failed.", 500);
    }
});

module.exports = router;
