const mongoose = require('mongoose');

/**
 * Lookbook Model
 */
const LookbookSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, default: "StyleCart Curator" },
    description: { type: String },
    productIds: [{ type: Number }],
    likesCount: { type: Number, default: 42 },
    savesCount: { type: Number, default: 18 },
    coverImage: { type: String },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lookbook', LookbookSchema);
