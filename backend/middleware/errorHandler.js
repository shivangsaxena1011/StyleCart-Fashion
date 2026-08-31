/**
 * Global error handling middleware for StyleCart Fashion
 */
const config = require('../config/environment');

/**
 * Handle 404 - Route not found
 */
function notFound(req, res, next) {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.status = 404;
    next(error);
}

/**
 * Global error handler - catches all unhandled errors
 * Never exposes stack traces in production
 */
function errorHandler(err, req, res, next) {
    const statusCode = err.status || 500;
    
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);
    if (!config.isProduction) {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message: statusCode === 500 && config.isProduction
                ? 'Internal server error'
                : err.message,
            code: err.code || 'INTERNAL_ERROR',
            ...((!config.isProduction) && { stack: err.stack })
        }
    });
}

module.exports = { notFound, errorHandler };
