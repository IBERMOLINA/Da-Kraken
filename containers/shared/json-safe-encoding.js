// JSON Safe Encoding Utilities for Da-Kraken
// Provides secure JSON handling across all language containers

/**
 * Safe JSON parsing with error handling and validation
 * @param {string} jsonString - JSON string to parse
 * @param {object} options - Parsing options
 * @returns {object} Parsed object or error info
 */
function safeJsonParse(jsonString, options = {}) {
    const { 
        maxDepth = 10, 
        maxStringLength = 10000,
        allowedTypes = ['string', 'number', 'boolean', 'object', 'array'],
        sanitizeHtml = true
    } = options;

    try {
        // Input validation
        if (typeof jsonString !== 'string') {
            throw new Error('Input must be a string');
        }

        if (jsonString.length > maxStringLength) {
            throw new Error(`JSON string exceeds maximum length of ${maxStringLength}`);
        }

        // Parse with depth checking
        const parsed = JSON.parse(jsonString, (key, value) => {
            // Check nesting depth
            const depth = key.split('.').length;
            if (depth > maxDepth) {
                throw new Error(`JSON nesting exceeds maximum depth of ${maxDepth}`);
            }

            // Sanitize strings if requested
            if (sanitizeHtml && typeof value === 'string') {
                value = sanitizeString(value);
            }

            return value;
        });

        // Validate structure
        validateJsonStructure(parsed, allowedTypes);

        return { success: true, data: parsed };

    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            type: 'JSON_PARSE_ERROR'
        };
    }
}

/**
 * Safe JSON stringification with circular reference protection
 * @param {any} obj - Object to stringify
 * @param {object} options - Stringification options
 * @returns {string} Safe JSON string
 */
function safeJsonStringify(obj, options = {}) {
    const {
        maxDepth = 10,
        maxStringLength = 10000,
        replacer = null,
        space = null,
        escapeHtml = true
    } = options;

    const seen = new WeakSet();
    let depth = 0;

    const safeReplacer = (key, value) => {
        // Check depth
        if (key && depth++ > maxDepth) {
            return '[Max Depth Exceeded]';
        }

        // Handle circular references
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular Reference]';
            }
            seen.add(value);
        }

        // Apply custom replacer if provided
        if (replacer && typeof replacer === 'function') {
            value = replacer(key, value);
        }

        // Escape HTML in strings if requested
        if (escapeHtml && typeof value === 'string') {
            value = escapeHtmlString(value);
        }

        // Limit string length
        if (typeof value === 'string' && value.length > maxStringLength) {
            value = value.substring(0, maxStringLength) + '[Truncated]';
        }

        depth--;
        return value;
    };

    try {
        return JSON.stringify(obj, safeReplacer, space);
    } catch (error) {
        return JSON.stringify({
            error: 'JSON_STRINGIFY_ERROR',
            message: error.message,
            originalType: typeof obj
        });
    }
}

/**
 * Sanitize string content to prevent XSS and injection attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/\\/g, '&#x5C;')
        .replace(/\x00/g, '') // Remove null bytes
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Escape HTML characters in strings
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtmlString(str) {
    if (typeof str !== 'string') return str;
    
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    
    return str.replace(/[&<>"'\/]/g, char => htmlEscapes[char]);
}

/**
 * Validate JSON structure against allowed types
 * @param {any} obj - Object to validate
 * @param {array} allowedTypes - Array of allowed types
 */
function validateJsonStructure(obj, allowedTypes) {
    function validate(value, path = 'root') {
        const type = Array.isArray(value) ? 'array' : typeof value;
        
        if (!allowedTypes.includes(type)) {
            throw new Error(`Invalid type '${type}' at path '${path}'. Allowed types: ${allowedTypes.join(', ')}`);
        }

        if (type === 'object' && value !== null) {
            for (const [key, val] of Object.entries(value)) {
                validate(val, `${path}.${key}`);
            }
        } else if (type === 'array') {
            value.forEach((val, index) => {
                validate(val, `${path}[${index}]`);
            });
        }
    }

    validate(obj);
}

/**
 * Create a secure JSON API response wrapper
 * @param {any} data - Response data
 * @param {object} meta - Metadata
 * @returns {object} Formatted API response
 */
function createApiResponse(data, meta = {}) {
    const response = {
        success: true,
        timestamp: new Date().toISOString(),
        data: data,
        meta: {
            version: '1.0',
            encoding: 'utf-8',
            contentType: 'application/json',
            ...meta
        }
    };

    return safeJsonStringify(response, { escapeHtml: true });
}

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {any} details - Additional error details
 * @returns {object} Error response
 */
function createErrorResponse(message, code = 'UNKNOWN_ERROR', details = null) {
    const response = {
        success: false,
        error: {
            message: sanitizeString(message),
            code: code,
            timestamp: new Date().toISOString(),
            details: details
        }
    };

    return safeJsonStringify(response, { escapeHtml: true });
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        safeJsonParse,
        safeJsonStringify,
        sanitizeString,
        escapeHtmlString,
        validateJsonStructure,
        createApiResponse,
        createErrorResponse
    };
}

// Global object for browser environments
if (typeof window !== 'undefined') {
    window.JsonSafeEncoding = {
        safeJsonParse,
        safeJsonStringify,
        sanitizeString,
        escapeHtmlString,
        validateJsonStructure,
        createApiResponse,
        createErrorResponse
    };
}