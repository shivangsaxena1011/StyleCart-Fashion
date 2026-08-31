/**
 * AI Provider Abstraction for StyleCart Fashion
 * Allows swapping AI backends without changing application code
 */

/**
 * Abstract AI Provider interface
 * All AI providers must implement these methods
 */
class AIProvider {
    constructor(name) {
        this.name = name;
    }

    /**
     * General chat/conversation
     * @param {string} message - User message
     * @param {Object} context - Context (products, history, etc.)
     * @returns {Promise<{reply: string, productIds?: number[]}>}
     */
    async chat(message, context) {
        throw new Error("chat() not implemented");
    }

    /**
     * Parse natural language search query into structured criteria
     * @param {string} query - Natural language query
     * @param {Object[]} products - Available products
     * @returns {Promise<{recommendations: Object[], message: string}>}
     */
    async parseSearchQuery(query, products) {
        throw new Error("parseSearchQuery() not implemented");
    }

    /**
     * Generate outfit recommendation
     * @param {Object} params - Styling parameters
     * @returns {Promise<Object>}
     */
    async generateOutfit(params) {
        throw new Error("generateOutfit() not implemented");
    }

    /**
     * Compare products and provide analysis
     * @param {Object[]} products - Products to compare
     * @returns {Promise<{analysis: string, verdicts: Object}>}
     */
    async compareProducts(products) {
        throw new Error("compareProducts() not implemented");
    }

    /**
     * Score an outfit combination
     * @param {Object[]} products - Products in the outfit
     * @returns {Promise<Object>}
     */
    async scoreOutfit(products) {
        throw new Error("scoreOutfit() not implemented");
    }

    /**
     * Generate review summary for a product
     * @param {Object} product - Product to summarize
     * @returns {Promise<Object>}
     */
    async summarizeReviews(product) {
        throw new Error("summarizeReviews() not implemented");
    }

    /**
     * Check if the provider is available/configured
     */
    isAvailable() {
        return false;
    }
}

module.exports = AIProvider;
