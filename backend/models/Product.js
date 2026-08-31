const mongoose = require('mongoose');

/**
 * Product Model
 */
const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    price: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    image: { type: String, required: true },
    discount: { type: String, default: 'NEW' },
    description: { type: String },
    brand: { type: String, default: 'StyleCart Premium' },
    reviewsCount: { type: Number, default: 0 },
    specs: { type: Map, of: String },
    colors: [{ type: String }],
    sizes: [{ type: String }],
    material: { type: String },
    gender: { type: String },
    occasion: [{ type: String }],
    style: [{ type: String }],
    stock: { type: Number, default: 100 },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
