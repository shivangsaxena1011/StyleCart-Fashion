/**
 * Orders Router
 * Handles order endpoints
 */
const router = require('express').Router();
const { getMongoStatus } = require('../config/database');
const { Order } = require('../models');
const { verifyToken } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const store = require('../data/inMemoryStore');

// POST /
router.post('/', async (req, res) => {
    try {
        const orderData = req.body;
        orderData.orderId = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        if (getMongoStatus()) {
            const newOrder = new Order(orderData);
            await newOrder.save();
            return sendSuccess(res, { order: newOrder }, 201);
        } else {
            const newOrder = { ...orderData, createdAt: new Date() };
            store.orders.push(newOrder);
            return sendSuccess(res, { order: newOrder }, 201);
        }
    } catch (err) {
        console.error("Order Creation Error:", err);
        return sendError(res, "Failed to create order.", 500);
    }
});

// GET / or /my-orders
const getMyOrdersHandler = async (req, res) => {
    try {
        if (getMongoStatus()) {
            const orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 });
            return sendSuccess(res, { orders });
        } else {
            const orders = store.orders.filter(o => o.email === req.user.email).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return sendSuccess(res, { orders });
        }
    } catch (err) {
        console.error("Order Fetch Error:", err);
        return sendError(res, "Failed to fetch orders.", 500);
    }
};

router.get('/', verifyToken, getMyOrdersHandler);
router.get('/my-orders', verifyToken, getMyOrdersHandler);

module.exports = router;
