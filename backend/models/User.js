const mongoose = require('mongoose');

/**
 * User Model
 */
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    preferences: {
        fashionStyle: { type: String },
        preferredCategories: [{ type: String }],
        preferredColors: [{ type: String }],
        preferredSizes: [{ type: String }],
        budgetRange: {
            min: { type: Number },
            max: { type: Number }
        },
        favoritesBrands: [{ type: String }],
        gender: { type: String }
    },
    profileImage: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
