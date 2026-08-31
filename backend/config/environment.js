/**
 * Environment configuration for StyleCart Fashion
 * Validates and exports all environment variables
 */
const path = require("path");

// Load .env from backend directory
require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

// Also check root .env
if (!process.env.JWT_SECRET) {
    require("dotenv").config({
        path: path.join(__dirname, "../../.env")
    });
}

const config = {
    port: parseInt(process.env.PORT, 10) || 5001,
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",

    // Database
    mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/stylecart",

    // Authentication
    jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? null : "DEV_ONLY_STYLECART_SECRET_CHANGE_ME"),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

    // AI Provider
    geminiApiKey: process.env.GEMINI_API_KEY || null,

    // CORS
    corsOrigins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(",").map(s => s.trim())
        : ["http://localhost:5001", "http://localhost:3000"]
};

// Validate critical config in production
if (config.isProduction && !config.jwtSecret) {
    console.error("FATAL: JWT_SECRET must be set in production environment");
    process.exit(1);
}

module.exports = config;
