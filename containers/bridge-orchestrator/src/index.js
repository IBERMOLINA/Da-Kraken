const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');

const ContainerManager = require('./containerManager');
const CodeGenerator = require('./codeGenerator');
const BridgeAPI = require('./bridgeAPI');

class BridgeOrchestrator {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.docker = new Docker();
        this.containerManager = new ContainerManager(this.docker);
        this.codeGenerator = new CodeGenerator();
        this.bridgeAPI = new BridgeAPI();
        
        this.setupLogger();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        
        this.activeContainers = new Map();
        this.codeGenSessions = new Map();
    }
    
    setupLogger() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/combined.log' }),
                new winston.transports.Console({
                    format: winston.format.simple()
                })
            ]
        });
    }
    
    setupMiddleware() {
        this.app.use(helmet());
        this.app.use(cors());
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
                timestamp: new Date().toISOString(),
                activeContainers: this.activeContainers.size,
                activeSessions: this.codeGenSessions.size
            });
        });
        
        // Container management routes
        this.app.post('/containers/:language/start', async (req, res) => {
            try {
                const { language } = req.params;
                const sessionId = uuidv4();
                
                const container = await this.containerManager.startLanguageContainer(language, sessionId);
                this.activeContainers.set(sessionId, container);
                
                this.logger.info(`Started ${language} container`, { sessionId, containerId: container.id });
                
                res.json({
                    sessionId,
                    containerId: container.id,
                    language,
                    status: 'started'
                });
            } catch (error) {
                this.logger.error('Failed to start container', { error: error.message, language: req.params.language });
                res.status(500).json({ error: error.message });
            }
        });
        
        this.app.post('/containers/:sessionId/stop', async (req, res) => {
            try {
                const { sessionId } = req.params;
                const container = this.activeContainers.get(sessionId);
                
                if (!container) {
                    return res.status(404).json({ error: 'Container session not found' });
                }
                
                await this.containerManager.stopContainer(container);
                this.activeContainers.delete(sessionId);
                
                this.logger.info('Stopped container', { sessionId });
                
                res.json({ sessionId, status: 'stopped' });
            } catch (error) {
                this.logger.error('Failed to stop container', { error: error.message, sessionId: req.params.sessionId });
                res.status(500).json({ error: error.message });
            }
        });
        
        // Code generation routes
        this.app.post('/generate', async (req, res) => {
            try {
                const { prompt, language, context, options = {} } = req.body;
                const sessionId = uuidv4();
                
                this.codeGenSessions.set(sessionId, {
                    prompt,
                    language,
                    context,
                    options,
                    status: 'started',
                    createdAt: new Date()
                });
                
                // Start code generation in background
                this.generateCode(sessionId, prompt, language, context, options);
                
                res.json({
                    sessionId,
                    status: 'initiated',
                    message: 'Code generation started'
                });
            } catch (error) {
                this.logger.error('Failed to initiate code generation', { error: error.message });
                res.status(500).json({ error: error.message });
            }
        });
        
        this.app.get('/generate/:sessionId/status', (req, res) => {
            const { sessionId } = req.params;
            const session = this.codeGenSessions.get(sessionId);
            
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            
            res.json(session);
        });
        
        // Cross-language bridge routes
        this.app.post('/bridge/translate', async (req, res) => {
            try {
                const { code, fromLanguage, toLanguage, context } = req.body;
                
                const result = await this.bridgeAPI.translateCode(code, fromLanguage, toLanguage, context);
                
                res.json({
                    originalCode: code,
                    translatedCode: result.code,
                    fromLanguage,
                    toLanguage,
                    confidence: result.confidence,
                    notes: result.notes
                });
            } catch (error) {
                this.logger.error('Failed to translate code', { error: error.message });
                res.status(500).json({ error: error.message });
            }
        });
    }
    
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            this.logger.info('Client connected', { socketId: socket.id });
            
            socket.on('joinSession', (sessionId) => {
                socket.join(sessionId);
                this.logger.info('Client joined session', { socketId: socket.id, sessionId });
            });
            
            socket.on('executeCode', async (data) => {
                const { sessionId, code, language } = data;
                try {
                    const container = this.activeContainers.get(sessionId);
                    if (!container) {
                        socket.emit('error', { message: 'Container session not found' });
                        return;
                    }
                    
                    const result = await this.containerManager.executeCode(container, code, language);
                    socket.emit('executionResult', result);
                } catch (error) {
                    socket.emit('error', { message: error.message });
                }
            });
            
            socket.on('disconnect', () => {
                this.logger.info('Client disconnected', { socketId: socket.id });
            });
        });
    }
    
    async generateCode(sessionId, prompt, language, context, options) {
        try {
            this.codeGenSessions.set(sessionId, {
                ...this.codeGenSessions.get(sessionId),
                status: 'generating'
            });
            
            this.io.to(sessionId).emit('statusUpdate', { sessionId, status: 'generating' });
            
            const result = await this.codeGenerator.generate(prompt, language, context, options);
            
            this.codeGenSessions.set(sessionId, {
                ...this.codeGenSessions.get(sessionId),
                status: 'completed',
                result,
                completedAt: new Date()
            });
            
            this.io.to(sessionId).emit('codeGenerated', { sessionId, result });
            this.logger.info('Code generation completed', { sessionId, language });
        } catch (error) {
            this.codeGenSessions.set(sessionId, {
                ...this.codeGenSessions.get(sessionId),
                status: 'error',
                error: error.message
            });
            
            this.io.to(sessionId).emit('error', { sessionId, message: error.message });
            this.logger.error('Code generation failed', { sessionId, error: error.message });
        }
    }
    
    async start(port = 4000) {
        this.server.listen(port, () => {
            this.logger.info(`Bridge Orchestrator started on port ${port}`);
            console.log(`🚀 Bridge Orchestrator running on http://localhost:${port}`);
        });
        
        // Cleanup on shutdown
        process.on('SIGTERM', this.shutdown.bind(this));
        process.on('SIGINT', this.shutdown.bind(this));
    }
    
    async shutdown() {
        this.logger.info('Shutting down Bridge Orchestrator...');
        
        // Stop all active containers
        for (const [sessionId, container] of this.activeContainers) {
            try {
                await this.containerManager.stopContainer(container);
                this.logger.info(`Stopped container for session ${sessionId}`);
            } catch (error) {
                this.logger.error(`Failed to stop container for session ${sessionId}`, { error: error.message });
            }
        }
        
        // Close server
        this.server.close(() => {
            this.logger.info('Bridge Orchestrator shutdown complete');
            process.exit(0);
        });
    }
}

module.exports = BridgeOrchestrator;