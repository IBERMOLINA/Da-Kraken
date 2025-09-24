const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const Redis = require('redis');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class GoogleAuthService {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 4002;
        
        // Initialize Google OAuth2 Client
        this.googleClient = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`
        );
        
        // Initialize Redis Client
        this.redis = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        
        this.setupLogger();
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeRedis();
    }
    
    setupLogger() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),
                new winston.transports.File({ 
                    filename: '/shared/logs/auth-service.log' 
                })
            ]
        });
    }
    
    setupMiddleware() {
        // Security
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
                    scriptSrc: ["'self'", "https://accounts.google.com"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "https://accounts.google.com"],
                    frameSrc: ["https://accounts.google.com"]
                }
            }
        }));
        
        // CORS
        this.app.use(cors({
            origin: [
                'http://localhost:3000',
                'http://localhost:4000',
                process.env.FRONTEND_URL
            ].filter(Boolean),
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP',
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use(limiter);
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // Request logging
        this.app.use((req, res, next) => {
            this.logger.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });
    }
    
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'da-kraken-auth-service',
                version: '2.0.0',
                timestamp: new Date().toISOString()
            });
        });
        
        // Google OAuth2 Routes
        this.app.get('/auth/google', this.initiateGoogleAuth.bind(this));
        this.app.post('/auth/google/callback', this.handleGoogleCallback.bind(this));
        this.app.post('/auth/google/verify', this.verifyGoogleToken.bind(this));
        
        // JWT Token Management
        this.app.post('/auth/refresh', this.refreshToken.bind(this));
        this.app.post('/auth/logout', this.logout.bind(this));
        this.app.get('/auth/profile', this.authenticateToken.bind(this), this.getProfile.bind(this));
        
        // Session Management
        this.app.get('/auth/sessions', this.authenticateToken.bind(this), this.getUserSessions.bind(this));
        this.app.delete('/auth/sessions/:sessionId', this.authenticateToken.bind(this), this.revokeSession.bind(this));
        
        // Error handling
        this.app.use(this.errorHandler.bind(this));
    }
    
    async initializeRedis() {
        try {
            await this.redis.connect();
            this.logger.info('Redis connected successfully');
        } catch (error) {
            this.logger.error('Failed to connect to Redis:', error);
        }
    }
    
    // Google OAuth2 Flow
    initiateGoogleAuth(req, res) {
        try {
            const state = uuidv4();
            const scopes = [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ];
            
            const authUrl = this.googleClient.generateAuthUrl({
                access_type: 'offline',
                scope: scopes,
                state: state,
                prompt: 'consent'
            });
            
            // Store state in Redis for verification
            this.redis.setEx(`auth_state:${state}`, 600, JSON.stringify({
                created: Date.now(),
                ip: req.ip
            }));
            
            res.json({
                authUrl,
                state,
                message: 'Redirect to this URL to authenticate with Google'
            });
        } catch (error) {
            this.logger.error('Failed to initiate Google auth:', error);
            res.status(500).json({ error: 'Failed to initiate authentication' });
        }
    }
    
    async handleGoogleCallback(req, res) {
        try {
            const { code, state } = req.body;
            
            if (!code || !state) {
                return res.status(400).json({ error: 'Missing authorization code or state' });
            }
            
            // Verify state
            const storedState = await this.redis.get(`auth_state:${state}`);
            if (!storedState) {
                return res.status(400).json({ error: 'Invalid or expired state' });
            }
            
            // Exchange code for tokens
            const { tokens } = await this.googleClient.getToken(code);
            this.googleClient.setCredentials(tokens);
            
            // Get user info
            const ticket = await this.googleClient.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            
            const payload = ticket.getPayload();
            const user = {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                verified: payload.email_verified
            };
            
            // Generate JWT tokens
            const sessionId = uuidv4();
            const accessToken = this.generateAccessToken(user, sessionId);
            const refreshToken = this.generateRefreshToken(user, sessionId);
            
            // Store session in Redis
            await this.storeUserSession(user, sessionId, {
                accessToken,
                refreshToken,
                googleRefreshToken: tokens.refresh_token,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            // Clean up state
            await this.redis.del(`auth_state:${state}`);
            
            this.logger.info('User authenticated successfully', { 
                userId: user.id, 
                email: user.email,
                sessionId 
            });
            
            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    picture: user.picture
                },
                tokens: {
                    accessToken,
                    refreshToken
                },
                sessionId
            });
        } catch (error) {
            this.logger.error('Google auth callback failed:', error);
            res.status(500).json({ error: 'Authentication failed' });
        }
    }
    
    async verifyGoogleToken(req, res) {
        try {
            const { idToken } = req.body;
            
            if (!idToken) {
                return res.status(400).json({ error: 'Missing ID token' });
            }
            
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            
            const payload = ticket.getPayload();
            const user = {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                verified: payload.email_verified
            };
            
            // Generate session
            const sessionId = uuidv4();
            const accessToken = this.generateAccessToken(user, sessionId);
            const refreshToken = this.generateRefreshToken(user, sessionId);
            
            await this.storeUserSession(user, sessionId, {
                accessToken,
                refreshToken,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            res.json({
                success: true,
                user,
                tokens: { accessToken, refreshToken },
                sessionId
            });
        } catch (error) {
            this.logger.error('Token verification failed:', error);
            res.status(401).json({ error: 'Invalid token' });
        }
    }
    
    // JWT Token Management
    generateAccessToken(user, sessionId) {
        return jwt.sign(
            { 
                userId: user.id,
                email:
        user.email,
                sessionId,
                type: 'access'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    }
    
    generateRefreshToken(user, sessionId) {
        return jwt.sign(
            { 
                userId: user.id,
                sessionId,
                type: 'refresh'
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    }
    
    async storeUserSession(user, sessionId, sessionData) {
        const session = {
            user,
            ...sessionData,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };
        
        // Store session (expires in 7 days)
        await this.redis.setEx(
            `session:${sessionId}`,
            7 * 24 * 60 * 60,
            JSON.stringify(session)
        );
        
        // Store user session list
        await this.redis.sAdd(`user_sessions:${user.id}`, sessionId);
        await this.redis.expire(`user_sessions:${user.id}`, 7 * 24 * 60 * 60);
    }
    
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            
            if (!refreshToken) {
                return res.status(400).json({ error: 'Refresh token required' });
            }
            
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
            
            if (decoded.type !== 'refresh') {
                return res.status(401).json({ error: 'Invalid token type' });
            }
            
            // Get session
            const sessionData = await this.redis.get(`session:${decoded.sessionId}`);
            if (!sessionData) {
                return res.status(401).json({ error: 'Session expired' });
            }
            
            const session = JSON.parse(sessionData);
            
            // Generate new tokens
            const newAccessToken = this.generateAccessToken(session.user, decoded.sessionId);
            const newRefreshToken = this.generateRefreshToken(session.user, decoded.sessionId);
            
            // Update session
            session.accessToken = newAccessToken;
            session.refreshToken = newRefreshToken;
            session.lastActivity = new Date().toISOString();
            
            await this.redis.setEx(
                `session:${decoded.sessionId}`,
                7 * 24 * 60 * 60,
                JSON.stringify(session)
            );
            
            res.json({
                tokens: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                }
            });
        } catch (error) {
            this.logger.error('Token refresh failed:', error);
            res.status(401).json({ error: 'Token refresh failed' });
        }
    }
    
    async logout(req, res) {
        try {
            const { sessionId } = req.body;
            const authHeader = req.headers.authorization;
            
            if (authHeader) {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                if (decoded.sessionId) {
                    await this.redis.del(`session:${decoded.sessionId}`);
                    await this.redis.sRem(`user_sessions:${decoded.userId}`, decoded.sessionId);
                }
            }
            
            if (sessionId) {
                await this.redis.del(`session:${sessionId}`);
            }
            
            res.json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            this.logger.error('Logout failed:', error);
            res.status(500).json({ error: 'Logout failed' });
        }
    }
    
    // Middleware
    async authenticateToken(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({ error: 'Access token required' });
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            if (decoded.type !== 'access') {
                return res.status(401).json({ error: 'Invalid token type' });
            }
            
            // Verify session exists
            const sessionData = await this.redis.get(`session:${decoded.sessionId}`);
            if (!sessionData) {
                return res.status(401).json({ error: 'Session expired' });
            }
            
            req.user = decoded;
            req.session = JSON.parse(sessionData);
            next();
        } catch (error) {
            this.logger.error('Token authentication failed:', error);
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
    
    getProfile(req, res) {
        res.json({
            user: req.session.user,
            sessionId: req.user.sessionId,
            lastActivity: req.session.lastActivity
        });
    }
    
    async getUserSessions(req, res) {
        try {
            const sessionIds = await this.redis.sMembers(`user_sessions:${req.user.userId}`);
            const sessions = [];
            
            for (const sessionId of sessionIds) {
                const sessionData = await this.redis.get(`session:${sessionId}`);
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    sessions.push({
                        sessionId,
                        createdAt: session.createdAt,
                        lastActivity: session.lastActivity,
                        ip: session.ip,
                        userAgent: session.userAgent,
                        current: sessionId === req.user.sessionId
                    });
                }
            }
            
            res.json({ sessions });
        } catch (error) {
            this.logger.error('Failed to get user sessions:', error);
            res.status(500).json({ error: 'Failed to retrieve sessions' });
        }
    }
    
    async revokeSession(req, res) {
        try {
            const { sessionId } = req.params;
            
            // Only allow users to revoke their own sessions
            const sessionData = await this.redis.get(`session:${sessionId}`);
            if (!sessionData) {
                return res.status(404).json({ error: 'Session not found' });
            }
            
            const session = JSON.parse(sessionData);
            if (session.user.id !== req.user.userId) {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            
            await this.redis.del(`session:${sessionId}`);
            await this.redis.sRem(`user_sessions:${req.user.userId}`, sessionId);
            
            res.json({ success: true, message: 'Session revoked' });
        } catch (error) {
            this.logger.error('Failed to revoke session:', error);
            res.status(500).json({ error: 'Failed to revoke session' });
        }
    }
    
    errorHandler(error, req, res, next) {
        this.logger.error('Unhandled error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
    
    async start() {
        try {
            this.server = this.app.listen(this.port, () => {
                this.logger.info(`🔐 Da-Kraken Auth Service running on port ${this.port}`);
                this.logger.info(`🌐 Google OAuth2 configured for client: ${process.env.GOOGLE_CLIENT_ID ? 'Yes' : 'No'}`);
            });
            
            // Graceful shutdown
            process.on('SIGTERM', () => this.shutdown());
            process.on('SIGINT', () => this.shutdown());
            
        } catch (error) {
            this.logger.error('Failed to start auth service:', error);
            process.exit(1);
        }
    }
    
    async shutdown() {
        this.logger.info('Shutting down auth service...');
        
        if (this.server) {
            this.server.close();
        }
        
        if (this.redis) {
            await this.redis.quit();
        }
        
        process.exit(0);
    }
}

// Start the service
const authService = new GoogleAuthService();
authService.start();