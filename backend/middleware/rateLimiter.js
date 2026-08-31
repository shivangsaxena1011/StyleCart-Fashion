/**
 * Simple in-memory rate limiter for StyleCart Fashion
 * No external dependencies required
 */

/**
 * Create a rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default 15 min)
 * @param {number} options.max - Max requests per window (default 100)
 * @param {string} options.message - Error message
 */
function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' } = {}) {
    const requests = new Map();

    // Cleanup old entries periodically
    setInterval(() => {
        const now = Date.now();
        for (const [key, data] of requests) {
            if (now - data.startTime > windowMs) {
                requests.delete(key);
            }
        }
    }, windowMs);

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const record = requests.get(key);

        if (!record || now - record.startTime > windowMs) {
            requests.set(key, { count: 1, startTime: now });
            return next();
        }

        record.count++;

        if (record.count > max) {
            return res.status(429).json({
                success: false,
                error: {
                    message,
                    code: 'RATE_LIMIT_EXCEEDED'
                }
            });
        }

        next();
    };
}

// Pre-configured limiters
const generalLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many authentication attempts.' });
const aiLimiter = createRateLimiter({ windowMs: 1 * 60 * 1000, max: 30, message: 'Too many AI requests. Please wait a moment.' });

module.exports = { createRateLimiter, generalLimiter, authLimiter, aiLimiter };
