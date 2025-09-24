const { 
    safeJsonParse, 
    safeJsonStringify, 
    createApiResponse, 
    createErrorResponse,
    sanitizeString 
} = require('./json-safe-encoding');

/**
 * Enhanced Bridge API with JSON Safe Encoding
 * Integrates secure JSON handling across all API endpoints
 */
class SecureBridgeAPI {
    constructor(logger) {
        this.logger = logger;
        this.config = {
            maxDepth: parseInt(process.env.JSON_MAX_DEPTH) || 10,
            maxStringLength: parseInt(process.env.JSON_MAX_STRING_LENGTH) || 10000,
            sanitizeHtml: process.env.JSON_SANITIZE_HTML === 'true',
            validateTypes: process.env.JSON_VALIDATE_TYPES === 'true'
        };
    }

    /**
     * Secure middleware for JSON request parsing
     */
    secureJsonParser() {
        return (req, res, next) => {
            if (req.headers['content-type']?.includes('application/json')) {
                let body = '';
                
                req.on('data', chunk => {
                    body += chunk.toString();
                    
                    // Prevent excessive payload sizes
                    if (body.length > (parseInt(process.env.MAX_REQUEST_SIZE) || 1048576)) {
                        res.status(413).json(createErrorResponse(
                            'Request payload too large',
                            'PAYLOAD_TOO_LARGE'
                        ));
                        return;
                    }
                });
                
                req.on('end', () => {
                    try {
                        const parseResult = safeJsonParse(body, this.config);
                        
                        if (parseResult.success) {
                            req.body = parseResult.data;
                            next();
                        } else {
                            this.logger.warn('JSON parse error:', parseResult.error);
                            res.status(400).json(createErrorResponse(
                                'Invalid JSON payload',
                                'JSON_PARSE_ERROR',
                                parseResult.error
                            ));
                        }
                    } catch (error) {
                        this.logger.error('JSON parsing failed:', error);
                        res.status(400).json(createErrorResponse(
                            'JSON parsing failed',
                            'JSON_PARSE_ERROR'
                        ));
                    }
                });
            } else {
                next();
            }
        };
    }

    /**
     * Secure response wrapper
     */
    sendSecureResponse(res, data, meta = {}) {
        try {
            const response = createApiResponse(data, {
                timestamp: new Date().toISOString(),
                encoding: 'utf-8',
                secure: true,
                ...meta
            });
            
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            
            res.send(response);
        } catch (error) {
            this.logger.error('Response serialization failed:', error);
            res.status(500).json(createErrorResponse(
                'Internal server error',
                'RESPONSE_SERIALIZATION_ERROR'
            ));
        }
    }

    /**
     * Secure error response
     */
    sendSecureError(res, message, code = 'UNKNOWN_ERROR', statusCode = 500, details = null) {
        try {
            const response = createErrorResponse(
                sanitizeString(message),
                code,
                details
            );
            
            res.status(statusCode).json(JSON.parse(response));
        } catch (error) {
            this.logger.error('Error response serialization failed:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Internal server error',
                    code: 'RESPONSE_ERROR',
                    timestamp: new Date().toISOString()
                }
            });
        }
    }

    /**
     * Validate and sanitize code generation request
     */
    validateCodeGenRequest(req, res, next) {
        const { prompt, language, options = {} } = req.body;
        
        // Validate required fields
        if (!prompt || typeof prompt !== 'string') {
            return this.sendSecureError(res, 'Prompt is required and must be a string', 'INVALID_PROMPT', 400);
        }
        
        if (!language || typeof language !== 'string') {
            return this.sendSecureError(res, 'Language is required and must be a string', 'INVALID_LANGUAGE', 400);
        }
        
        // Sanitize inputs
        req.body.prompt = sanitizeString(prompt);
        req.body.language = sanitizeString(language.toLowerCase());
        
        // Validate language support
        const supportedLanguages = ['javascript', 'python', 'java', 'go', 'php', 'rust', 'cpp', 'zig'];
        if (!supportedLanguages.includes(req.body.language)) {
            return this.sendSecureError(
                res, 
                `Unsupported language: ${req.body.language}. Supported: ${supportedLanguages.join(', ')}`,
                'UNSUPPORTED_LANGUAGE',
                400
            );
        }
        
        // Validate options
        if (typeof options !== 'object') {
            return this.sendSecureError(res, 'Options must be an object', 'INVALID_OPTIONS', 400);
        }
        
        next();
    }

    /**
     * Log request with sanitized data
     */
    logSecureRequest(req, res, next) {
        const sanitizedRequest = {
            method: req.method,
            url: req.url,
            userAgent: sanitizeString(req.get('User-Agent') || ''),
            ip: req.ip,
            timestamp: new Date().toISOString()
        };
        
        // Don't log sensitive data in body
        if (req.body && Object.keys(req.body).length > 0) {
            sanitizedRequest.hasBody = true;
            sanitizedRequest.bodyKeys = Object.keys(req.body);
        }
        
        this.logger.info('API Request', sanitizedRequest);
        next();
    }

    /**
     * Rate limiting with secure headers
     */
    rateLimitMiddleware() {
        const requests = new Map();
        const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
        const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
        
        return (req, res, next) => {
            const key = req.ip;
            const now = Date.now();
            const windowStart = now - windowMs;
            
            // Clean old entries
            if (requests.has(key)) {
                const userRequests = requests.get(key).filter(time => time > windowStart);
                requests.set(key, userRequests);
            } else {
                requests.set(key, []);
            }
            
            const userRequests = requests.get(key);
            
            if (userRequests.length >= maxRequests) {
                res.setHeader('X-Rate-Limit-Limit', maxRequests);
                res.setHeader('X-Rate-Limit-Remaining', 0);
                res.setHeader('X-Rate-Limit-Reset', new Date(now + windowMs).toISOString());
                
                return this.sendSecureError(
                    res,
                    'Rate limit exceeded',
                    'RATE_LIMIT_EXCEEDED',
                    429
                );
            }
            
            userRequests.push(now);
            
            res.setHeader('X-Rate-Limit-Limit', maxRequests);
            res.setHeader('X-Rate-Limit-Remaining', maxRequests - userRequests.length);
            res.setHeader('X-Rate-Limit-Reset', new Date(now + windowMs).toISOString());
            
            next();
        };
    }
}

module.exports = SecureBridgeAPI;