/**
 * Authentication middleware for StyleCart Fashion
 */
const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const { sendError } = require('../utils/apiResponse');

/**
 * Verify JWT token from Authorization header
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return sendError(res, 'Access denied. Authentication token required.', 401, 'AUTH_TOKEN_MISSING');
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return sendError(res, 'Token has expired. Please log in again.', 401, 'AUTH_TOKEN_EXPIRED');
        }
        return sendError(res, 'Invalid authentication token.', 403, 'AUTH_TOKEN_INVALID');
    }
}

/**
 * Verify admin role (must be called after verifyToken)
 */
function verifyAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return sendError(res, 'Access denied. Admin privileges required.', 403, 'AUTH_ADMIN_REQUIRED');
        }
    });
}

/**
 * Optional auth - attaches user if token present, continues if not
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            req.user = decoded;
        } catch (err) {
            // Token invalid but this is optional auth, so continue
        }
    }
    next();
}

module.exports = { verifyToken, verifyAdmin, optionalAuth };
