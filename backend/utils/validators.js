/**
 * Input validation helpers for StyleCart Fashion
 */

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * Minimum 6 characters
 */
function isValidPassword(password) {
    return typeof password === "string" && password.length >= 6;
}

/**
 * Sanitize a string to prevent basic injection
 */
function sanitizeString(str) {
    if (typeof str !== "string") return str;
    return str.trim().replace(/[<>]/g, "");
}

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {string[]} requiredFields - Array of required field names
 * @returns {string|null} Error message or null if valid
 */
function validateRequired(body, requiredFields) {
    const missing = requiredFields.filter(field => !body[field]);
    if (missing.length > 0) {
        return `Missing required fields: ${missing.join(", ")}`;
    }
    return null;
}

/**
 * Validate that a value is a positive number
 */
function isPositiveNumber(val) {
    return typeof val === "number" && val > 0 && isFinite(val);
}

module.exports = {
    isValidEmail,
    isValidPassword,
    sanitizeString,
    validateRequired,
    isPositiveNumber
};
