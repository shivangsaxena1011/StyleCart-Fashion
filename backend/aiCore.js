/**
 * Backward compatibility export for StyleCart Fashion AI Core
 */
const GeminiProvider = require('./services/geminiProvider');

class StyleCartAICore extends GeminiProvider {
    constructor(apiKey) {
        super(apiKey);
    }
}

module.exports = StyleCartAICore;
