const mongoose = require('mongoose');

/**
 * Trend Model
 */
const TrendSchema = new mongoose.Schema({
    name: { type: String, required: true },
    direction: { type: String, default: "up" },
    category: { type: String, default: "Fashion" },
    velocity: { type: String, default: "+48% Search Lift" },
    matchingProductIds: [{ type: Number }]
});

module.exports = mongoose.model('Trend', TrendSchema);
