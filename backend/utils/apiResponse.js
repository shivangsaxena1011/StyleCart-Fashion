/**
 * Standardized API response helpers for StyleCart Fashion
 * Ensures consistent response format across all endpoints
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code (default 200)
 */
function sendSuccess(res, data = {}, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        ...data
    });
}

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} code - Error code for programmatic handling
 */
function sendError(res, message, statusCode = 500, code = null) {
    const response = {
        success: false,
        error: {
            message,
            ...(code && { code })
        }
    };
    return res.status(statusCode).json(response);
}

module.exports = { sendSuccess, sendError };
