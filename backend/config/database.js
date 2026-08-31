/**
 * Database configuration for StyleCart Fashion
 * Supports hybrid MongoDB + in-memory fallback
 */
const mongoose = require("mongoose");
const config = require("./environment");

let isMongoConnected = false;

/**
 * Connect to MongoDB asynchronously. Falls back to in-memory store if connection fails.
 * @param {Function} onConnected - Callback when connected (e.g., seed database)
 */
function connectDatabase(onConnected) {
    return mongoose.connect(config.mongodbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 2000 // Quick fallback if MongoDB is not running locally
    }).then(async () => {
        isMongoConnected = true;
        console.log("✅ MongoDB connected successfully at", config.mongodbUri);
        if (onConnected) await onConnected();
    }).catch(err => {
        isMongoConnected = false;
        console.log("⚠️  MongoDB connection failed. Using in-memory fallback store.");
        console.log("   Reason:", err.message);
    });
}

/**
 * Check if MongoDB is connected
 */
function getMongoStatus() {
    return isMongoConnected;
}

module.exports = { connectDatabase, getMongoStatus };
