/**
 * Wardrobe Router
 * Handles user wardrobe endpoints
 */
const router = require('express').Router();
const { getMongoStatus } = require('../config/database');
const { WardrobeItem } = require('../models');
const { optionalAuth } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const store = require('../data/inMemoryStore');

// GET /
router.get('/', optionalAuth, async (req, res) => {
    try {
        const userEmail = req.user ? req.user.email : 'guest@stylecart.com';
        
        if (getMongoStatus()) {
            const items = await WardrobeItem.find({ userEmail });
            return sendSuccess(res, { items });
        } else {
            const items = store.wardrobeItems.filter(i => i.userEmail === userEmail);
            return sendSuccess(res, { items });
        }
    } catch (err) {
        return sendError(res, "Failed to fetch wardrobe.", 500);
    }
});

// POST /
router.post('/', optionalAuth, async (req, res) => {
    try {
        const userEmail = req.user ? req.user.email : 'guest@stylecart.com';
        const data = { ...req.body, userEmail };
        
        if (getMongoStatus()) {
            const items = await WardrobeItem.find();
            const nextId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
            data.id = nextId;
            const newItem = new WardrobeItem(data);
            await newItem.save();
            return sendSuccess(res, { item: newItem }, 201);
        } else {
            const nextId = store.wardrobeItems.length > 0 ? Math.max(...store.wardrobeItems.map(i => i.id)) + 1 : 1;
            data.id = nextId;
            store.wardrobeItems.push(data);
            return sendSuccess(res, { item: data }, 201);
        }
    } catch (err) {
        return sendError(res, "Failed to add wardrobe item.", 500);
    }
});

// DELETE /:id
router.delete('/:id', optionalAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userEmail = req.user ? req.user.email : 'guest@stylecart.com';
        
        if (getMongoStatus()) {
            const deleted = await WardrobeItem.findOneAndDelete({ id, userEmail });
            if (!deleted) return sendError(res, "Item not found.", 404);
            return sendSuccess(res, { message: "Item deleted." });
        } else {
            const index = store.wardrobeItems.findIndex(i => i.id === id && i.userEmail === userEmail);
            if (index === -1) return sendError(res, "Item not found.", 404);
            store.wardrobeItems.splice(index, 1);
            return sendSuccess(res, { message: "Item deleted." });
        }
    } catch (err) {
        return sendError(res, "Failed to delete item.", 500);
    }
});

// POST /combinations
router.post('/combinations', optionalAuth, async (req, res) => {
    try {
        const userEmail = req.user ? req.user.email : 'guest@stylecart.com';
        let items = [];
        
        if (getMongoStatus()) {
            items = await WardrobeItem.find({ userEmail });
        } else {
            items = store.wardrobeItems.filter(i => i.userEmail === userEmail);
        }
        
        // Mock combinations calculation
        const combinations = items.length >= 2 ? [
            { top: items[0], bottom: items[1], score: 92 }
        ] : [];
        
        return sendSuccess(res, { combinations });
    } catch (err) {
        return sendError(res, "Failed to calculate combinations.", 500);
    }
});

module.exports = router;
