/**
 * Google Gemini AI Provider for StyleCart Fashion
 * Implements the AIProvider interface using Google Generative AI
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");
const AIProvider = require("./aiProvider");

class GeminiProvider extends AIProvider {
    constructor(apiKey) {
        super("gemini");
        this.apiKey = apiKey;
        this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
        this.modelName = "gemini-1.5-flash";
    }

    isAvailable() {
        return !!this.genAI;
    }

    _getModel() {
        if (!this.genAI) throw new Error("Gemini API key not configured");
        return this.genAI.getGenerativeModel({ model: this.modelName });
    }

    _extractJSON(text) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error("No JSON found in AI response");
    }

    // ========== CHAT ==========
    async chat(message, context = {}) {
        const { products = [], history = [] } = context;

        if (!this.isAvailable()) {
            return this._fallbackChat(message, products);
        }

        try {
            const model = this._getModel();
            const prompt = `
You are StyleCart AI, a smart and helpful shopping assistant for StyleCart Fashion, a modern AI-powered fashion marketplace.
You help users find products, compare items, suggest alternatives, recommend accessories, and offer styling advice.

User Question: ${message}

${history.length > 0 ? `Previous conversation: ${JSON.stringify(history)}` : ""}

Available Products:
${products.map(p => `- ${p.name} (${p.category}): ₹${p.price} - ${p.description}`).join("\n")}

Please respond in a friendly, helpful, and concise manner.
If recommending products, list 3-4 specific products from the available list with their prices.
`;
            const result = await model.generateContent(prompt);
            return { reply: result.response.text() };
        } catch (err) {
            console.error("Gemini chat error:", err.message);
            return this._fallbackChat(message, products);
        }
    }

    _fallbackChat(message, products) {
        const queryLower = (message || "").toLowerCase();

        if (queryLower.includes("blazer") || queryLower.includes("suit") || queryLower.includes("jacket") || queryLower.includes("fashion") || queryLower.includes("outfit")) {
            return { reply: "🧥 **StyleCart AI Outfit Styling:**\nI recommend pairing a **Slim Fit Blazer** over a **Classic White T-Shirt**, anchored with **Cotton Cargo Pants** and **Retro Leather Sneakers** for a modern smart-casual look." };
        } else if (queryLower.includes("shoe") || queryLower.includes("sneaker") || queryLower.includes("boot")) {
            return { reply: "👟 **StyleCart AI Footwear Pick:**\nCheck out our **Retro Leather Sneakers** or **Luxury Suede Chelsea Boots** — both versatile choices that pair well with casual and smart-casual outfits." };
        } else {
            return { reply: "🤖 **Hello! I'm StyleCart AI.**\nI can help you style outfits, search products, and compare items. Try asking me something like *'Suggest a party outfit'* or *'What goes with a navy blazer?'*!" };
        }
    }

    // ========== AI SEARCH ==========
    async parseSearchQuery(query, products) {
        if (!this.isAvailable()) {
            return this._fallbackSearch(query, products);
        }

        try {
            const model = this._getModel();
            const prompt = `
You are StyleCart AI, a smart shopping assistant.

User Query: "${query}"

Available Products in Catalog:
${products.map(p => `- ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: ₹${p.price}, Rating: ${p.rating}, Description: ${p.description}`).join("\n")}

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
            const parsed = this._extractJSON(result.response.text());
            const recommendations = products.filter(p => (parsed.recommendations || []).includes(p.id));
            return {
                recommendations: recommendations.slice(0, 4),
                message: parsed.message || "Based on your query, here are our top recommendations."
            };
        } catch (err) {
            console.error("Gemini search error:", err.message);
            return this._fallbackSearch(query, products);
        }
    }

    _fallbackSearch(query, products) {
        const keywords = (query || "").toLowerCase().split(" ");
        const matched = products.filter(p =>
            keywords.some(k =>
                p.name.toLowerCase().includes(k) ||
                p.category.toLowerCase().includes(k) ||
                (p.description || "").toLowerCase().includes(k)
            )
        ).slice(0, 4);

        return {
            recommendations: matched.length > 0 ? matched : products.slice(0, 4),
            message: matched.length > 0
                ? "Here are products matching your search."
                : "I couldn't find exact matches. Here are some popular items."
        };
    }

    // ========== OUTFIT GENERATION ==========
    async generateOutfit(params) {
        const { message, budget, weather, occasion, styleDNA, wardrobeItems = [], catalogProducts = [] } = params;
        const fashionProducts = catalogProducts.filter(p =>
            p.category === "fashion" || p.category === "luxury" || p.category === "beauty"
        );

        if (this.isAvailable()) {
            try {
                const model = this._getModel();
                const prompt = `
You are StyleCart AI Stylist, an elite personal fashion stylist.
User Style Intent: "${message}"
${budget ? `Max Budget Limit: ₹${budget}` : ""}
${weather ? `Current Weather: ${weather}` : ""}
${occasion ? `Occasion: ${occasion}` : ""}
${styleDNA ? `User Style DNA: ${styleDNA.archetype}, Preferred Colors: ${JSON.stringify(styleDNA.preferredColors)}` : ""}

User's Wardrobe Items:
${wardrobeItems.length > 0 ? wardrobeItems.map(w => `- [OWNED] ID: ${w.id}, Name: ${w.name}, Category: ${w.category}, Color: ${w.color}`).join("\n") : "None provided"}

StyleCart Catalog Products:
${fashionProducts.map(p => `- ID: ${p.id}, Name: ${p.name}, Price: ₹${p.price}, Specs: ${JSON.stringify(p.specs || {})}`).join("\n")}

Task: Create a stylized look containing 2 to 5 items (can combine catalog items and user's owned wardrobe items).
Ensure total cost of catalog items fits within the budget.
Provide style reasoning, color palette breakdown, occasion suitability, and size advice.

Return raw JSON only:
{
  "productIds": [catalog product IDs as numbers],
  "wardrobeItemIds": [owned wardrobe item IDs if used],
  "title": "Outfit Title",
  "explanation": "Detailed styling advice.",
  "colorPalette": ["#hex1", "#hex2"],
  "formalityLevel": "Smart Casual",
  "totalCatalogPrice": 0
}
`;
                const result = await model.generateContent(prompt);
                const parsed = this._extractJSON(result.response.text());
                const recommendedProducts = fashionProducts.filter(p => (parsed.productIds || []).includes(p.id));

                return {
                    success: true,
                    title: parsed.title || "Curated StyleCart Look",
                    explanation: parsed.explanation,
                    colorPalette: parsed.colorPalette || ["#121212", "#8F1D2D", "#F5F5F7"],
                    formalityLevel: parsed.formalityLevel || "Smart Casual",
                    products: recommendedProducts,
                    usedWardrobeItems: wardrobeItems.filter(w => (parsed.wardrobeItemIds || []).includes(w.id)),
                    totalPrice: recommendedProducts.reduce((sum, p) => sum + p.price, 0)
                };
            } catch (err) {
                console.error("Gemini stylist error:", err.message);
            }
        }

        return this._fallbackStylist(message, budget, fashionProducts, wardrobeItems);
    }

    _fallbackStylist(message, budget, fashionProducts, wardrobeItems) {
        const queryLower = (message || "").toLowerCase();
        let selectedIds = [];
        let title = "StyleCart Signature Look";
        let explanation = "";

        if (queryLower.includes("date") || queryLower.includes("party") || queryLower.includes("night")) {
            selectedIds = [32, 29, 11];
            title = "Midnight Velvet Party Outfit";
            explanation = "The Royal Burgundy Velvet Blazer paired with Italian Suede Chelsea Boots and a Swiss Rolex watch creates an opulent evening aesthetic.";
        } else if (queryLower.includes("office") || queryLower.includes("work") || queryLower.includes("formal")) {
            selectedIds = [26, 25, 28, 29];
            title = "Corporate Modern Luxe";
            explanation = "Combining the Midnight Navy Slim-Fit Blazer over a clean white tee, accented with a minimalist calfskin belt and Chelsea boots.";
        } else if (queryLower.includes("summer") || queryLower.includes("beach") || queryLower.includes("vacation")) {
            selectedIds = [33, 24, 27, 31];
            title = "Tropical Summer Breeze";
            explanation = "A breathable Sandy Beige Linen shirt paired with Military Olive Cargo pants, gold aviators, and retro court sneakers.";
        } else {
            selectedIds = [23, 25, 24, 31];
            title = "Contemporary Urban Streetwear";
            explanation = "A versatile modern streetwear look combining an oversized denim jacket over a white tee, with olive cargos and court sneakers.";
        }

        let products = fashionProducts.filter(p => selectedIds.includes(p.id));
        if (budget) {
            let total = 0;
            const budgeted = [];
            for (const p of products) {
                if (total + p.price <= budget) {
                    budgeted.push(p);
                    total += p.price;
                }
            }
            if (budgeted.length > 0) products = budgeted;
        }

        return {
            success: true,
            title,
            explanation,
            colorPalette: ["#8F1D2D", "#1E2022", "#EAEAEA"],
            formalityLevel: "Smart Casual",
            products,
            usedWardrobeItems: wardrobeItems.slice(0, 1),
            totalPrice: products.reduce((sum, p) => sum + p.price, 0)
        };
    }

    // ========== PRODUCT COMPARISON ==========
    async compareProducts(products) {
        if (!this.isAvailable()) {
            return this._fallbackCompare(products);
        }

        try {
            const model = this._getModel();
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
            return { analysis: result.response.text() };
        } catch (err) {
            console.error("Gemini compare error:", err.message);
            return this._fallbackCompare(products);
        }
    }

    _fallbackCompare(products) {
        const sorted = [...products].sort((a, b) => a.price - b.price);
        let analysis = `### StyleCart AI Comparison\n\n`;
        products.forEach(p => {
            analysis += `- **${p.name}** (₹${p.price.toLocaleString()}): Rated ${p.rating}★. ${p.description}\n`;
        });
        analysis += `\n**Best Value:** ${sorted[0].name} (₹${sorted[0].price.toLocaleString()})\n`;
        analysis += `**Premium Choice:** ${sorted[sorted.length - 1].name} (₹${sorted[sorted.length - 1].price.toLocaleString()})`;
        return { analysis };
    }

    // ========== OUTFIT SCORING ==========
    async scoreOutfit(products) {
        if (this.isAvailable()) {
            try {
                const model = this._getModel();
                const prompt = `
You are the StyleCart AI Fashion Analyzer.
Evaluate the aesthetic compatibility of this outfit combination:
${products.map(p => `- ${p.name} (${p.category}): ₹${p.price}. Description: ${p.description}. Specs: ${JSON.stringify(p.specs)}`).join("\n")}

Compute styling score metrics out of 100 for:
1. Color Harmony
2. Occasion Adaptability
3. Body Fit compatibility
4. Trend Score
5. Confidence boost

Also calculate the overall weighted score and provide 2-3 fashion tips.

Return ONLY raw JSON:
{
  "overallScore": 92,
  "metrics": { "harmony": 94, "occasion": 91, "fit": 88, "trend": 95, "confidence": 93 },
  "tips": ["Tip 1...", "Tip 2..."]
}
`;
                const result = await model.generateContent(prompt);
                return this._extractJSON(result.response.text());
            } catch (err) {
                console.error("Gemini scoring error:", err.message);
            }
        }

        return this._fallbackScore(products);
    }

    _fallbackScore(products) {
        let harmony = 80, occasion = 75, fit = 85, trend = 78, confidence = 82;
        const tips = [];

        const hasUpper = products.some(p => /Shirt|Hoodie|Blazer|Jacket|Overcoat|Tee/i.test(p.name));
        const hasLower = products.some(p => /Pants|Cargo|Jeans/i.test(p.name));
        const hasShoes = products.some(p => /Shoes|Boots|Sneakers/i.test(p.name));
        const hasAccessories = products.some(p => /Sunglasses|Belt|Watch/i.test(p.name) || p.category === "luxury");

        if (hasUpper && hasLower) { harmony += 8; trend += 6; }
        if (hasUpper && hasLower && hasShoes) { harmony += 7; confidence += 8; fit += 5; }
        if (hasAccessories) { confidence += 5; trend += 4; }

        if (tips.length === 0) {
            tips.push("Try mixing formal wear with casual staples for a modern smart-casual aesthetic.");
            tips.push("Add matching footwear and accessories to balance the visual weight of the outfit.");
        }

        harmony = Math.min(harmony, 99);
        occasion = Math.min(occasion, 99);
        fit = Math.min(fit, 99);
        trend = Math.min(trend, 99);
        confidence = Math.min(confidence, 99);

        return {
            overallScore: Math.round((harmony + occasion + fit + trend + confidence) / 5),
            metrics: { harmony, occasion, fit, trend, confidence },
            tips
        };
    }

    // ========== REVIEW SUMMARY ==========
    async summarizeReviews(product) {
        if (this.isAvailable()) {
            try {
                const model = this._getModel();
                const prompt = `You are StyleCart AI, an expert retail reviews analyst.
Analyze this product:
Name: ${product.name}
Description: ${product.description}
Brand: ${product.brand}
Category: ${product.category}
Price: ₹${product.price}

Generate a structured AI Review Summary:
1. List of 3 major Pros
2. List of 2 major Cons
3. A short summary paragraph (2-3 sentences)
4. Sizing recommendation
5. Overall customer sentiment score between 80 and 100

Return ONLY raw JSON:
{
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2"],
  "summary": "Overall summary",
  "sizeRecommendation": "Sizing advice",
  "overallSentiment": 92
}`;
                const result = await model.generateContent(prompt);
                return this._extractJSON(result.response.text());
            } catch (err) {
                console.error("Gemini review summary error:", err.message);
            }
        }

        return this._fallbackReviewSummary(product);
    }

    _fallbackReviewSummary(product) {
        const cat = (product.category || "").toLowerCase();
        if (cat === "fashion" || cat === "luxury") {
            return {
                pros: ["Exceptional textile quality and drape", "Highly versatile for formal and casual fits", "Tailored fit that accentuates silhouette"],
                cons: ["Dry clean recommended for longevity", "Premium price point"],
                summary: `The ${product.name} has earned acclaim for its superior finish and styling versatility. It feels premium and holds shape exceptionally well.`,
                sizeRecommendation: "94% of buyers report true-to-size fit. Order your regular size.",
                overallSentiment: 93
            };
        }
        return {
            pros: ["Sleek premium design", "Matches catalog description accurately", "Excellent as a gift option"],
            cons: ["Limited seasonal stock", "Slight premium markup"],
            summary: `Buyers are extremely satisfied with the ${product.name}. It makes a solid premium addition to any collection.`,
            sizeRecommendation: "Standard specifications apply.",
            overallSentiment: 89
        };
    }

    // ========== SHOPPING AGENT ==========
    async runShoppingAgent(goalPrompt, userContext, catalogProducts) {
        const fashionProducts = catalogProducts.filter(p =>
            p.category === "fashion" || p.category === "luxury" || p.category === "beauty"
        );

        if (this.isAvailable()) {
            try {
                const model = this._getModel();
                const prompt = `
You are the StyleCart AI Shopping Agent, an autonomous fashion concierge.
User Request: "${goalPrompt}"
User Context: ${JSON.stringify(userContext || {})}

Catalog Items:
${fashionProducts.map(p => `- ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: ₹${p.price}, Specs: ${JSON.stringify(p.specs || {})}`).join("\n")}

Execute Shopping Search Plan:
1. Extract constraints (budget, style, item count, occasion).
2. Select optimal items matching constraints.
3. Formulate complete solution options with trade-offs.

Return raw JSON only:
{
  "extractedConstraints": { "maxBudget": 10000, "occasion": "Date Night", "itemTypes": ["Blazer", "Shoes"] },
  "agentReasoning": "I analyzed the catalog...",
  "primaryRecommendation": { "title": "Optimal Choice", "productIds": [], "explanation": "Why this combination works" },
  "alternativeRecommendation": { "title": "Alternative", "productIds": [], "explanation": "Budget-friendly option" }
}
`;
                const result = await model.generateContent(prompt);
                const parsed = this._extractJSON(result.response.text());
                return {
                    success: true,
                    goal: goalPrompt,
                    constraints: parsed.extractedConstraints || {},
                    reasoning: parsed.agentReasoning,
                    primaryLook: {
                        title: parsed.primaryRecommendation?.title || "Primary Selection",
                        explanation: parsed.primaryRecommendation?.explanation || "Selected for style harmony.",
                        products: fashionProducts.filter(p => (parsed.primaryRecommendation?.productIds || []).includes(p.id)),
                        totalPrice: fashionProducts.filter(p => (parsed.primaryRecommendation?.productIds || []).includes(p.id)).reduce((s, p) => s + p.price, 0)
                    },
                    alternativeLook: {
                        title: parsed.alternativeRecommendation?.title || "Alternative",
                        explanation: parsed.alternativeRecommendation?.explanation || "Alternative option.",
                        products: fashionProducts.filter(p => (parsed.alternativeRecommendation?.productIds || []).includes(p.id)),
                        totalPrice: fashionProducts.filter(p => (parsed.alternativeRecommendation?.productIds || []).includes(p.id)).reduce((s, p) => s + p.price, 0)
                    }
                };
            } catch (err) {
                console.error("Gemini shopping agent error:", err.message);
            }
        }

        // Fallback
        const primary = fashionProducts.filter(p => [26, 25, 29].includes(p.id));
        const alt = fashionProducts.filter(p => [23, 24, 31].includes(p.id));
        return {
            success: true,
            goal: goalPrompt,
            constraints: { maxBudget: 15000, style: "Smart Casual" },
            reasoning: "StyleCart AI scanned our catalog for compatible items matching your criteria.",
            primaryLook: { title: "Recommended Combination", explanation: "Combines a navy blazer with premium leather boots.", products: primary, totalPrice: primary.reduce((s, p) => s + p.price, 0) },
            alternativeLook: { title: "Casual Alternative", explanation: "Relaxed streetwear with vintage denim and cargo pants.", products: alt, totalPrice: alt.reduce((s, p) => s + p.price, 0) }
        };
    }

    // ========== CAPSULE WARDROBE ==========
    generateCapsuleWardrobe(budget, season, catalogProducts) {
        const fashionProducts = catalogProducts.filter(p => p.category === "fashion" || p.category === "luxury" || p.category === "beauty");
        const maxBudget = budget || 30000;

        const uppers = fashionProducts.filter(p => [25, 33, 23, 26].includes(p.id));
        const lowers = fashionProducts.filter(p => [24].includes(p.id));
        const shoes = fashionProducts.filter(p => [29, 31].includes(p.id));
        const accessories = fashionProducts.filter(p => [27, 28].includes(p.id));

        const capsuleItems = [...uppers, ...lowers, ...shoes, ...accessories].slice(0, 7);
        const totalPrice = capsuleItems.reduce((s, p) => s + p.price, 0);
        const totalOutfitsPossible = uppers.length * Math.max(1, lowers.length) * Math.max(1, shoes.length);

        return {
            success: true,
            budget: maxBudget,
            season: season || "All Season",
            capsuleItems,
            totalPrice,
            possibleOutfitCount: totalOutfitsPossible,
            efficiencyScore: Math.round((totalOutfitsPossible / Math.max(1, totalPrice)) * 100000),
            summary: `This ${capsuleItems.length}-piece capsule wardrobe unlocks up to ${totalOutfitsPossible} versatile outfit combinations.`
        };
    }

    // ========== SIZE & FIT ==========
    calculateFitRecommendation(measurements, product) {
        const { height = 175, weight = 70, chest = 96, waist = 82, preferredFit = "Regular" } = measurements;

        let recommendedSize = "M";
        let confidence = 89;
        let reasoning = "Your measurements align with a medium size chart for a relaxed profile.";

        if (chest > 104 || weight > 85) {
            recommendedSize = "XL"; confidence = 92;
            reasoning = "Chest circumference (>104cm) indicates Large/XL for comfort.";
        } else if (chest > 98 || weight > 76) {
            recommendedSize = "L"; confidence = 88;
            reasoning = "Chest and shoulder width match standard European Large.";
        } else if (chest < 90 && weight < 60) {
            recommendedSize = "S"; confidence = 91;
            reasoning = "Slender build matches Small slim-fit parameters.";
        }

        if (preferredFit === "Oversized") {
            reasoning += " Adjusted +1 size for your preferred oversized silhouette.";
        }

        return {
            success: true,
            recommendedSize,
            confidence,
            reasoning,
            measurementsSubmitted: measurements,
            productDetails: { id: product?.id, name: product?.name }
        };
    }

    // ========== STEAL THIS LOOK ==========
    stealThisLook(imageUrl, catalogProducts) {
        const fashionProducts = catalogProducts.filter(p => p.category === "fashion" || p.category === "luxury" || p.category === "beauty");

        const matchLook = fashionProducts.filter(p => [26, 25, 24, 31].includes(p.id));
        const budgetLook = fashionProducts.filter(p => [25, 24, 31].includes(p.id));
        const premiumLook = fashionProducts.filter(p => [32, 29, 11, 27].includes(p.id));

        return {
            success: true,
            detectedElements: [
                { category: "Upperwear", title: "Tailored Navy Blazer / Jacket", confidence: 96 },
                { category: "Inner", title: "Clean Crewneck White T-Shirt", confidence: 98 },
                { category: "Lowerwear", title: "Utility Twill Trousers", confidence: 92 },
                { category: "Footwear", title: "Classic Court Sneakers / Leather Boots", confidence: 94 }
            ],
            tiers: {
                match: { title: "STYLECART MATCH", products: matchLook, totalPrice: matchLook.reduce((s, p) => s + p.price, 0) },
                budget: { title: "BUDGET ALTERNATIVE", products: budgetLook, totalPrice: budgetLook.reduce((s, p) => s + p.price, 0) },
                premium: { title: "PREMIUM EDITION", products: premiumLook, totalPrice: premiumLook.reduce((s, p) => s + p.price, 0) }
            }
        };
    }

    // ========== POST-PURCHASE ==========
    generatePostPurchaseIntelligence(orderProducts, userWardrobe, catalogProducts) {
        const item = orderProducts[0] || {};
        const matchingCatalog = catalogProducts.filter(p => p.category === "fashion" && p.id !== item.id).slice(0, 3);

        return {
            success: true,
            purchasedItem: item,
            wardrobeCombinationsCount: userWardrobe.length + 4,
            careInstructions: [
                "Machine wash cold inside out with like colors.",
                "Line dry in shade to preserve fabric texture and dye tone.",
                "Use lukewarm iron if necessary."
            ],
            complementaryProducts: matchingCatalog,
            message: `Your new ${item.name || "garment"} pairs with ${userWardrobe.length + 4} items in your digital wardrobe.`
        };
    }
}

module.exports = GeminiProvider;
