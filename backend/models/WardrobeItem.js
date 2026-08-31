const mongoose = require('mongoose');

/**
 * WardrobeItem Model
 */
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

module.exports = mongoose.model('WardrobeItem', WardrobeItemSchema);
