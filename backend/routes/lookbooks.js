/**
 * Lookbooks Router
 * Handles lookbooks and trends endpoints
 */
const router = require('express').Router();
const { getMongoStatus } = require('../config/database');
const { Lookbook, Trend } = require('../models');
const { verifyToken } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const store = require('../data/inMemoryStore');

// GET /
router.get('/', async (req, res) => {
    try {
        if (getMongoStatus()) {
            const lookbooks = await Lookbook.find({}).sort({ createdAt: -1 });
            return sendSuccess(res, { lookbooks });
        } else {
            const lookbooks = [...store.lookbooks];
            return sendSuccess(res, { lookbooks });
        }
    } catch (err) {
        return sendError(res, "Failed to fetch lookbooks.", 500);
    }
});

// POST /
router.post('/', verifyToken, async (req, res) => {
    try {
        const data = req.body;
        data.id = "lb-" + Math.random().toString(36).substr(2, 9);
        data.author = data.author || 'StyleCart Member';
        
        if (getMongoStatus()) {
            const newLookbook = new Lookbook(data);
            await newLookbook.save();
            return sendSuccess(res, { lookbook: newLookbook }, 201);
        } else {
            const newLookbook = { ...data, createdAt: new Date() };
            store.lookbooks.push(newLookbook);
            return sendSuccess(res, { lookbook: newLookbook }, 201);
        }
    } catch (err) {
        return sendError(res, "Failed to create lookbook.", 500);
    }
});

// GET /trends
router.get('/trends', async (req, res) => {
    try {
        if (getMongoStatus()) {
            const trends = await Trend.find({});
            return sendSuccess(res, { trends });
        } else {
            const trends = store.trends;
            return sendSuccess(res, { trends });
        }
    } catch (err) {
        return sendError(res, "Failed to fetch trends.", 500);
    }
});

module.exports = router;
