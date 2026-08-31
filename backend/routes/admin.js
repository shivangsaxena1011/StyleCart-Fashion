/**
 * Admin Router
 * Handles admin and dashboard endpoints
 */
const router = require('express').Router();
const { getMongoStatus } = require('../config/database');
const { Order, User, Product } = require('../models');
const { verifyAdmin } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const store = require('../data/inMemoryStore');

// GET /orders
router.get('/orders', verifyAdmin, async (req, res) => {
    try {
        if (getMongoStatus()) {
            const orders = await Order.find({}).sort({ createdAt: -1 });
            return sendSuccess(res, { orders });
        } else {
            const orders = [...store.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return sendSuccess(res, { orders });
        }
    } catch (err) {
        return sendError(res, "Failed to fetch orders.", 500);
    }
});

// PUT /orders/:id
router.put('/orders/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;
        
        if (getMongoStatus()) {
            const order = await Order.findOneAndUpdate({ orderId: id }, { orderStatus }, { new: true });
            if (!order) return sendError(res, "Order not found.", 404);
            return sendSuccess(res, { order });
        } else {
            const orderIndex = store.orders.findIndex(o => o.orderId === id);
            if (orderIndex === -1) return sendError(res, "Order not found.", 404);
            store.orders[orderIndex].orderStatus = orderStatus;
            return sendSuccess(res, { order: store.orders[orderIndex] });
        }
    } catch (err) {
        return sendError(res, "Failed to update order.", 500);
    }
});

// GET /users
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        if (getMongoStatus()) {
            const users = await User.find({}).select("-password").sort({ createdAt: -1 });
            return sendSuccess(res, { users });
        } else {
            const users = store.users.map(({ password, ...u }) => u);
            return sendSuccess(res, { users });
        }
    } catch (err) {
        return sendError(res, "Failed to fetch users.", 500);
    }
});

// GET /analytics
router.get('/analytics', verifyAdmin, async (req, res) => {
    try {
        let totalRevenue = 0;
        let totalOrders = 0;
        let totalUsers = 0;
        let totalProducts = 0;
        
        if (getMongoStatus()) {
            const orders = await Order.find({});
            totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
            totalOrders = orders.length;
            totalUsers = await User.countDocuments();
            totalProducts = await Product.countDocuments();
        } else {
            totalRevenue = store.orders.reduce((sum, order) => sum + (order.total || 0), 0);
            totalOrders = store.orders.length;
            totalUsers = store.users.length;
            totalProducts = store.products.length;
        }
        
        return sendSuccess(res, { 
            analytics: {
                revenue: totalRevenue,
                orders: totalOrders,
                users: totalUsers,
                products: totalProducts
            }
        });
    } catch (err) {
        return sendError(res, "Failed to fetch analytics.", 500);
    }
});

module.exports = router;
