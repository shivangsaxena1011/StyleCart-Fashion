/**
 * StyleCart Fashion — AI-Powered Fashion Shopping Platform
 * Main server entry point
 */
const express = require("express");
const cors = require("cors");
const path = require("path");

const config = require("./config/environment");
const { connectDatabase } = require("./config/database");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const aiRoutes = require("./routes/ai");
const wardrobeRoutes = require("./routes/wardrobe");
const lookbookRoutes = require("./routes/lookbooks");

// Initialize Express
const app = express();

// ========== MIDDLEWARE ==========
app.use(cors({
    origin: config.isProduction ? config.corsOrigins : "*",
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(generalLimiter);

// Serve frontend and images statically
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/images", express.static(path.join(__dirname, "../images")));

// ========== ROUTES ==========
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai-fashion", aiRoutes);     // Alias for backward compatibility
app.use("/api/wardrobe", wardrobeRoutes);
app.use("/api/lookbooks", lookbookRoutes);
app.use("/api/trends", lookbookRoutes);    // Trends served from lookbooks router

// Legacy route aliases for backward compatibility
app.use("/api", aiRoutes);                 // Supports /api/chat, /api/ai-search, /api/compare

// ========== HEALTH CHECK ==========
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "StyleCart Fashion API",
        status: "running",
        timestamp: new Date().toISOString()
    });
});

// ========== FRONTEND FALLBACK ==========
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ========== ERROR HANDLING ==========
app.use(notFound);
app.use(errorHandler);

// ========== DATABASE & START ==========
async function seedDatabase() {
    const { Product } = require("./models");
    const defaultProducts = require("./data/seedProducts");

    try {
        for (const prod of defaultProducts) {
            const exists = await Product.findOne({ id: prod.id });
            if (!exists) {
                await Product.create(prod);
                console.log(`  Seeded: ${prod.name}`);
            }
        }
    } catch (err) {
        console.error("Database seeding error:", err.message);
    }
}

// Start HTTP server if not running as serverless function
if (!process.env.VERCEL) {
    app.listen(config.port, () => {
        console.log(`\n🛍️  StyleCart Fashion Server`);
        console.log(`   Port: ${config.port}`);
        console.log(`   Mode: ${config.nodeEnv}`);
        console.log(`   AI:   ${config.geminiApiKey ? "Gemini enabled" : "Fallback mode"}\n`);
        
        // Connect to DB asynchronously
        connectDatabase(seedDatabase);
    });
} else {
    // In Vercel serverless environment, connect to DB
    connectDatabase(seedDatabase);
}

module.exports = app;
