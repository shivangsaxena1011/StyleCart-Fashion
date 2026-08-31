/**
 * In-memory data store for StyleCart Fashion
 * Used as fallback when MongoDB is not connected
 */
const defaultProducts = require('./seedProducts');

const store = {
    users: [],
    products: [...defaultProducts],
    orders: [],
    styleProfiles: {},
    wardrobeItems: [
        { id: 101, userEmail: 'guest@stylecart.com', name: 'Casual Denim Shirt', category: 'upper', color: 'Blue', material: '100% Cotton Denim', pattern: 'Solid', formality: 'Casual', isFavorite: true, usageCount: 6, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0' },
        { id: 102, userEmail: 'guest@stylecart.com', name: 'Slim Fit Black Jeans', category: 'lower', color: 'Black', material: 'Cotton Stretch', pattern: 'Solid', formality: 'Smart Casual', isFavorite: true, usageCount: 12, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246' },
        { id: 103, userEmail: 'guest@stylecart.com', name: 'White Leather Court Sneakers', category: 'shoes', color: 'White', material: 'Leather', pattern: 'Solid', formality: 'Casual', isFavorite: false, usageCount: 4, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772' }
    ],
    lookbooks: [
        { id: 'lb-1', title: 'Summer Minimalist', author: 'StyleCart Studio', description: 'Clean lines, sandy linen textures, and polarized gold accents.', productIds: [33, 24, 27, 31], likesCount: 128, savesCount: 64, coverImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c', tags: ['Summer', 'Minimalism', 'Linen'] },
        { id: 'lb-2', title: 'Midnight Corporate Luxe', author: 'Elena Vance', description: 'Midnight navy blazers styled with Italian suede Chelsea boots.', productIds: [26, 25, 28, 29, 11], likesCount: 210, savesCount: 95, coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf', tags: ['Formal', 'Luxury', 'Suiting'] }
    ],
    trends: [
        { name: 'Oversized Tailoring & Drop Shoulders', direction: 'up', category: 'Silhouettes', velocity: '+64% Search Lift', matchingProductIds: [23, 26, 30] },
        { name: 'Earth Tones & Warm Beige', direction: 'up', category: 'Colors', velocity: '+42% Engagement', matchingProductIds: [33, 29, 24] },
        { name: 'Minimal Court Sneakers', direction: 'up', category: 'Footwear', velocity: '+55% Wishlist Saves', matchingProductIds: [31] },
        { name: 'Vintage Indigo Denim Layers', direction: 'up', category: 'Streetwear', velocity: '+38% View Lift', matchingProductIds: [23] }
    ]
};

module.exports = store;
