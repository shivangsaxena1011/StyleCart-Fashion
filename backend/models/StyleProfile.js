const mongoose = require('mongoose');

/**
 * StyleProfile Model
 */
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

module.exports = mongoose.model('StyleProfile', StyleProfileSchema);
