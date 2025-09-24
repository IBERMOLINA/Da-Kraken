const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');

const ContainerManager = require('./containerManager');
const CodeGenerator = require('./codeGenerator');
const BridgeAPI = require('./bridgeAPI');
const FileManager = require('./fileManager');
const NpmManager = require('./npmManager');
const HandshakeManager = require('./handshakeManager');
const { 
    safeJsonParse, 
    safeJsonStringify, 
    createApiResponse, 
    createErrorResponse 
} = require('../shared/json-safe-encoding');

class BridgeOrchestrator {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        
        // Replace Socket.IO with handshake-based real-time communication
        this.eventSubscribers = new Map(); // Event subscription management
        this.pollingClients = new Map();   // Client polling registry
        
        this.docker = new Docker();
        this.containerManager = new ContainerManager(this.docker);
        this.codeGenerator = new CodeGenerator();
        this.bridgeAPI = new BridgeAPI();
        this.fileManager = new FileManager(this.logger);
        this.npmManager = new NpmManager(this.fileManager, this.logger);
        this.handshakeManager = new HandshakeManager();
        
        this.setupLogger();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupHandshakePolling();
        
        this.activeContainers = new Map();
        this.codeGenSessions = new Map();
        this.systemEvents = new Map();    // System event queue
        this.containerMetrics = new Map(); // Container performance metrics
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

        // ===== HANDSHAKE COMMUNICATION ROUTES =====
        this.app.post('/api/handshake/initiate', async (req, res) => {
            try {
                const { source, target, payload } = req.body;
                
                if (!source || !target || !payload) {
                    return res.status(400).json({ 
                        error: 'Missing required fields: source, target, payload' 
                    });
                }
                
                const handshakeId = this.handshakeManager.initiate(source, target, payload);
                
                this.logger.info('Handshake initiated', { 
                    handshakeId, 
                    source, 
                    target,
                    payloadType: typeof payload
                });
                
                res.json({
                    handshakeId,
                    source,
                    target,
                    status: 'initiated',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                this.logger.error('Failed to initiate handshake', { error: error.message });
                res.status(500).json({ error: error.message });
            }
        });
        
        this.app.post('/api/handshake/:id/acknowledge', async (req, res) => {
            try {
                const { id } = req.params;
                const { response } = req.body;
                
                const success = this.handshakeManager.acknowledge(id, response);
                
                if (!success) {
                    return res.status(404).json({ 
                        error: 'Handshake not found or already completed' 
                    });
                }
                
                this.logger.info('Handshake acknowledged', { 
                    handshakeId: id,
                    responseType: typeof response
                });
                
                res.json({
                    handshakeId: id,
                    status: 'acknowledged',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                this.logger.error('Failed to acknowledge handshake', { error: error.message });
                res.status(500).json({ error: error.message });
            }
        });
        
        this.app.post('/api/handshake/:id/complete', async (req, res) => {
            try {
                const { id } = req.params;
                const { result } = req.body;
                
                const handshake = this.handshakeManager.complete(id, result);
                
                if (!handshake) {
                    return res.status(404).json({ 
                        error: 'Handshake not found or not acknowledged' 
                    });
                }
                
                this.logger.info('Handshake completed', { 
                    handshakeId: id,
                    source: handshake.source,
                    target: handshake.target,
                    resultType: typeof result
                });
                
                res.json({
                    handshakeId: id,
                    source: handshake.source,
                    target: handshake.target,
                    result: handshake.result,
                    status: 'completed',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                this.logger.error('Failed to complete handshake', { error: error.message });
                res.status(500).json({ error: error.message });
            }
        });
        
        this.app.get('/api/handshake/:id/status', (req, res) => {
            try {
                const { id } = req.params;
                const handshake = this.handshakeManager.getHandshake(id);
                
                if (!handshake) {
                    return res.status(404).json({ 
                        error: 'Handshake not found' 
                    });
                }
                
                res.json({
                    handshakeId: id,
                    source: handshake.source,
                    target: handshake.target,
                    status: handshake.status,
                    createdAt: handshake.createdAt,
                    acknowledgedAt: handshake.acknowledgedAt,
                    completedAt: handshake.completedAt
                });
            } catch (error) {
                this.logger.error('Failed to get handshake status', { error: error.message });
                res.status(500).json({ error: error.message });
            }
        });

        // ===== FILE MANAGEMENT ROUTES =====
        
        this.app.post('/api/files/fetch', async (req, res) => {
            try {
                const { containerName, filePath, encoding } = req.body;
                if (!containerName || !filePath) {
                    return res.status(400).json(createErrorResponse(
                        'Container name and file path required',
                        'MISSING_PARAMETERS'
                    ));
                }
                const result = await this.fileManager.fetchFile(containerName, filePath, encoding);
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('File fetch error:', error);
                res.status(500).json(createErrorResponse(error.message, 'FILE_FETCH_ERROR'));
            }
        });

        this.app.post('/api/files/write', async (req, res) => {
            try {
                const { containerName, filePath, content, encoding } = req.body;
                if (!containerName || !filePath || content === undefined) {
                    return res.status(400).json(createErrorResponse(
                        'Container name, file path, and content required',
                        'MISSING_PARAMETERS'
                    ));
                }
                const result = await this.fileManager.writeFile(containerName, filePath, content, encoding);
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('File write error:', error);
                res.status(500).json(createErrorResponse(error.message, 'FILE_WRITE_ERROR'));
            }
        });

        this.app.post('/api/files/list', async (req, res) => {
            try {
                const { containerName, directoryPath, recursive } = req.body;
                if (!containerName || !directoryPath) {
                    return res.status(400).json(createErrorResponse(
                        'Container name and directory path required',
                        'MISSING_PARAMETERS'
                    ));
                }
                const result = await this.fileManager.listDirectory(containerName, directoryPath, recursive);
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('Directory list error:', error);
                res.status(500).json(createErrorResponse(error.message, 'DIRECTORY_LIST_ERROR'));
            }
        });

        // ===== NPM MANAGEMENT ROUTES =====
        
        this.app.post('/api/npm/install', async (req, res) => {
            try {
                const options = req.body || {};
                const result = await this.npmManager.install(options);
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('NPM install error:', error);
                res.status(500).json(createErrorResponse(error.message, 'NPM_INSTALL_ERROR'));
            }
        });

        this.app.post('/api/npm/ci', async (req, res) => {
            try {
                const result = await this.npmManager.ci();
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('NPM ci error:', error);
                res.status(500).json(createErrorResponse(error.message, 'NPM_CI_ERROR'));
            }
        });

        this.app.post('/api/npm/test', async (req, res) => {
            try {
                const options = req.body || {};
                const result = await this.npmManager.test(options);
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('NPM test error:', error);
                res.status(500).json(createErrorResponse(error.message, 'NPM_TEST_ERROR'));
            }
        });

        this.app.post('/api/npm/audit', async (req, res) => {
            try {
                const { fix = false, force = false } = req.body || {};
                const result = await this.npmManager.audit(fix, force);
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('NPM audit error:', error); 
                res.status(500).json(createErrorResponse(error.message, 'NPM_AUDIT_ERROR'));
            }
        });

        this.app.post('/api/npm/prune', async (req, res) => {
            try {
                const { production = false } = req.body || {};
                const result = await this.npmManager.prune(production);
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('NPM prune error:', error);
                res.status(500).json(createErrorResponse(error.message, 'NPM_PRUNE_ERROR'));
            }
        });

        this.app.post('/api/npm/shrinkwrap', async (req, res) => {
            try {
                const result = await this.npmManager.shrinkwrap();
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('NPM shrinkwrap error:', error);
                res.status(500).json(createErrorResponse(error.message, 'NPM_SHRINKWRAP_ERROR'));
            }
        });

        this.app.post('/api/npm/rebuild', async (req, res) => {
            try {
                const { packageName } = req.body || {};
                const result = await this.npmManager.rebuild(packageName);
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('NPM rebuild error:', error);
                res.status(500).json(createErrorResponse(error.message, 'NPM_REBUILD_ERROR'));
            }
        });

        this.app.post('/api/npm/update-lockfile', async (req, res) => {
            try {
                const result = await this.npmManager.updateLockfile();
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('NPM lockfile update error:', error);
                res.status(500).json(createErrorResponse(error.message, 'NPM_LOCKFILE_UPDATE_ERROR'));
            }
        });

        this.app.get('/api/npm/outdated', async (req, res) => {
            try {
                const result = await this.npmManager.getOutdated();
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('NPM outdated check error:', error);
                res.status(500).json(createErrorResponse(error.message, 'NPM_OUTDATED_ERROR'));
            }
        });

        this.app.post('/api/npm/cicd', async (req, res) => {
            try {
                const options = req.body || {};
                const result = await this.npmManager.cicdPipeline(options);
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('NPM CICD pipeline error:', error);
                res.status(500).json(createErrorResponse(error.message, 'NPM_CICD_ERROR'));
            }
        });

        this.app.get('/api/npm/report', async (req, res) => {
            try {
                const result = await this.npmManager.generateReport();
                res.json(createApiResponse(result));
            } catch (error) {
                this.logger.error('NPM report generation error:', error);
                res.status(500).json(createErrorResponse(error.message, 'NPM_REPORT_ERROR'));
            }
        });
    }
    
    setupHandshakePolling() {
        // Real-time communication polling endpoints
        this.app.get('/api/events/poll/:clientId', this.pollEvents.bind(this));
        this.app.post('/api/events/subscribe', this.subscribeToEvents.bind(this));
        this.app.delete('/api/events/unsubscribe/:clientId', this.unsubscribeFromEvents.bind(this));
        
        // Execute code via handshake instead of socket
        this.app.post('/api/execute-code', this.executeCodeHandshake.bind(this));
        
        // System monitoring endpoints
        this.app.get('/api/monitoring/containers', this.getContainerStatus.bind(this));
        this.app.get('/api/monitoring/metrics', this.getSystemMetrics.bind(this));
        
        // Setup cleanup interval for polling clients
        setInterval(() => {
            this.cleanupInactiveClients();
        }, 60000); // Cleanup every minute
        
        // Setup metrics collection
        setInterval(() => {
            this.collectSystemMetrics();
        }, 5000); // Collect metrics every 5 seconds
    }
    
    // Event polling system (replaces Socket.IO)
    pollEvents(req, res) {
        const { clientId } = req.params;
        const timeout = parseInt(req.query.timeout) || 30000; // 30 second timeout
        
        if (!this.pollingClients.has(clientId)) {
            return res.status(404).json({ error: 'Client not subscribed' });
        }
        
        const client = this.pollingClients.get(clientId);
        const events = this.getEventsForClient(clientId);
        
        // Update last activity
        client.lastActivity = Date.now();
        
        if (events.length > 0) {
            // Return events immediately if available
            res.json({ events, timestamp: Date.now() });
        } else {
            // Long polling - wait for events
            const timeoutId = setTimeout(() => {
                res.json({ events: [], timestamp: Date.now() });
            }, timeout);
            
            // Store response for when events arrive
            client.pendingResponse = { res, timeoutId };
        }
    }
    
    subscribeToEvents(req, res) {
        const { clientId, sessionId, eventTypes = [] } = req.body;
        
        if (!clientId) {
            return res.status(400).json({ error: 'Client ID required' });
        }
        
        this.pollingClients.set(clientId, {
            sessionId,
            eventTypes,
            lastActivity: Date.now(),
            pendingResponse: null,
            events: []
        });
        
        this.logger.info('Client subscribed to events', { clientId, sessionId, eventTypes });
        
        res.json({ 
            success: true, 
            clientId,
            message: 'Subscribed to events successfully'
        });
    }
    
    unsubscribeFromEvents(req, res) {
        const { clientId } = req.params;
        
        if (this.pollingClients.has(clientId)) {
            const client = this.pollingClients.get(clientId);
            
            // Clear any pending response
            if (client.pendingResponse) {
                clearTimeout(client.pendingResponse.timeoutId);
                client.pendingResponse.res.json({ events: [], timestamp: Date.now() });
            }
            
            this.pollingClients.delete(clientId);
            this.logger.info('Client unsubscribed from events', { clientId });
        }
        
        res.json({ success: true, message: 'Unsubscribed successfully' });
    }
    
    async executeCodeHandshake(req, res) {
        try {
            const { sessionId, code, language, clientId } = req.body;
            
            const container = this.activeContainers.get(sessionId);
            if (!container) {
                return res.status(404).json({ error: 'Container session not found' });
            }
            
            // Create handshake for code execution
            const handshakeId = this.handshakeManager.initiate(
                'web-client',
                `${language}-container`,
                { action: 'execute', code, sessionId }
            );
            
            // Execute code
            const result = await this.containerManager.executeCode(container, code, language);
            
            // Complete handshake
            this.handshakeManager.complete(handshakeId, result);
            
            // Notify subscribed clients
            this.broadcastEvent('code-executed', {
                sessionId,
                result,
                language,
                timestamp: Date.now()
            });
            
            res.json({
                success: true,
                handshakeId,
                result,
                timestamp: Date.now()
            });
        } catch (error) {
            this.logger.error('Code execution failed:', error);
            
            // Broadcast error to clients
            this.broadcastEvent('execution-error', {
                sessionId: req.body.sessionId,
                error: error.message,
                timestamp: Date.now()
            });
            
            res.status(500).json({ error: error.message });
        }
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
    
    // Supporting methods for handshake-based communication
    getEventsForClient(clientId) {
        const client = this.pollingClients.get(clientId);
        if (!client) return [];
        
        const events = client.events.slice(); // Copy events
        client.events = []; // Clear events after retrieving
        return events;
    }
    
    broadcastEvent(eventType, data) {
        const event = {
            id: uuidv4(),
            type: eventType,
            data,
            timestamp: Date.now()
        };
        
        // Add event to all subscribed clients
        for (const [clientId, client] of this.pollingClients) {
            if (client.eventTypes.length === 0 || client.eventTypes.includes(eventType)) {
                client.events.push(event);
                
                // If client is waiting (long polling), respond immediately
                if (client.pendingResponse) {
                    clearTimeout(client.pendingResponse.timeoutId);
                    client.pendingResponse.res.json({
                        events: [event],
                        timestamp: Date.now()
                    });
                    client.pendingResponse = null;
                }
            }
        }
    }
    
    cleanupInactiveClients() {
        const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();
        
        for (const [clientId, client] of this.pollingClients) {
            if (now - client.lastActivity > inactiveThreshold) {
                if (client.pendingResponse) {
                    clearTimeout(client.pendingResponse.timeoutId);
                    client.pendingResponse.res.json({ events: [], timestamp: now });
                }
                this.pollingClients.delete(clientId);
                this.logger.info('Cleaned up inactive client', { clientId });
            }
        }
    }
    
    getContainerStatus(req, res) {
        const containers = Array.from(this.activeContainers.entries()).map(([sessionId, container]) => ({
            sessionId,
            containerId: container.id,
            status: 'running', // You could query actual status
            language: container.language || 'unknown',
            startTime: container.startTime || null
        }));
        
        res.json({
            containers,
            total: containers.length,
            timestamp: Date.now()
        });
    }
    
    getSystemMetrics(req, res) {
        const metrics = {
            activeContainers: this.activeContainers.size,
            pollingClients: this.pollingClients.size,
            activeHandshakes: this.handshakeManager.getActiveCount(),
            codeGenSessions: this.codeGenSessions.size,
            systemEvents: this.systemEvents.size,
            timestamp: Date.now()
        };
        
        res.json(metrics);
    }
    
    collectSystemMetrics() {
        const metrics = {
            timestamp: Date.now(),
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            activeContainers: this.activeContainers.size,
            pollingClients: this.pollingClients.size,
            activeHandshakes: this.handshakeManager.getActiveCount()
        };
        
        // Store metrics (keep last 100 entries)
        const metricsArray = this.containerMetrics.get('system') || [];
        metricsArray.push(metrics);
        if (metricsArray.length > 100) {
            metricsArray.shift();
        }
        this.containerMetrics.set('system', metricsArray);
        
        // Broadcast metrics to interested clients
        this.broadcastEvent('system-metrics', metrics);
    }

    async shutdown() {
        this.logger.info('Shutting down Bridge Orchestrator...');
        
        // Clear all polling clients
        for (const [clientId, client] of this.pollingClients) {
            if (client.pendingResponse) {
                clearTimeout(client.pendingResponse.timeoutId);
                client.pendingResponse.res.json({ events: [], shutdown: true });
            }
        }
        this.pollingClients.clear();
        
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