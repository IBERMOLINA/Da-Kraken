#!/usr/bin/env node
// Kraken Mesh - Decentralized Container Communication System
// Eliminates bridge orchestrator dependency with peer-to-peer communication

const http = require('http');
const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

class KrakenMesh extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.nodeId = process.env.CONTAINER_ID || uuidv4();
        this.port = options.port || this.detectPort();
        this.serviceName = options.serviceName || process.env.SERVICE_NAME || 'unknown';
        this.capabilities = options.capabilities || [];
        
        // Peer discovery and registry
        this.peers = new Map();
        this.services = new Map();
        this.localCache = new Map();
        
        // AI Chatbot integration
        this.aiModels = new Map();
        this.conversationHistory = new Map();
        
        // Performance optimization
        this.metrics = {
            messages: 0,
            errors: 0,
            responseTime: [],
            uptime: Date.now()
        };
        
        this.server = null;
        this.discoveryInterval = null;
        this.cleanupInterval = null;
        
        this.init();
    }
    
    init() {
        this.startServer();
        this.startDiscovery();
        this.setupCleanup();
        this.initializeAI();
        
        console.log(`🕸️ Kraken Mesh node ${this.nodeId} started`);
        console.log(`🔧 Service: ${this.serviceName} on port ${this.port}`);
        console.log(`🧠 AI: ${this.aiModels.size} models loaded`);
    }
    
    detectPort() {
        const servicePortMap = {
            'nodejs': 3000,
            'python': 5000,
            'java': 8080,
            'go': 8082,
            'php': 8085,
            'rust': 8090,
            'zig': 8087,
            'crystal': 8094,
            'elixir': 8096,
            'fortran': 8097,
            'modern-ui': 8080
        };
        
        return servicePortMap[this.serviceName] || 8000 + Math.floor(Math.random() * 1000);
    }
    
    startServer() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });
        
        this.server.listen(this.port, () => {
            console.log(`🚀 Mesh server listening on port ${this.port}`);
        });
    }
    
    async handleRequest(req, res) {
        const startTime = Date.now();
        
        try {
            const url = new URL(req.url, `http://localhost:${this.port}`);
            const method = req.method;
            const path = url.pathname;
            
            // Parse request body
            let body = '';
            req.on('data', chunk => body += chunk);
            await new Promise(resolve => req.on('end', resolve));
            
            let data = {};
            if (body) {
                try {
                    data = JSON.parse(body);
                } catch (e) {
                    data = { raw: body };
                }
            }
            
            let response = {};
            
            switch (path) {
                case '/mesh/discover':
                    response = await this.handleDiscovery(data);
                    break;
                case '/mesh/message':
                    response = await this.handleMessage(data);
                    break;
                case '/mesh/ai/chat':
                    response = await this.handleAIChat(data);
                    break;
                case '/mesh/ai/generate':
                    response = await this.handleAIGenerate(data);
                    break;
                case '/mesh/execute':
                    response = await this.handleExecute(data);
                    break;
                case '/mesh/health':
                    response = this.getHealthStatus();
                    break;
                case '/mesh/metrics':
                    response = this.getMetrics();
                    break;
                case '/mesh/peers':
                    response = this.getPeers();
                    break;
                default:
                    response = { error: 'Unknown endpoint', path };
            }
            
            const responseTime = Date.now() - startTime;
            this.metrics.responseTime.push(responseTime);
            this.metrics.messages++;
            
            // Keep only last 100 response times
            if (this.metrics.responseTime.length > 100) {
                this.metrics.responseTime.shift();
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            
        } catch (error) {
            this.metrics.errors++;
            console.error('Request handling error:', error);
            
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    
    async handleDiscovery(data) {
        if (data.announce) {
            // Register new peer
            const peer = {
                id: data.nodeId,
                service: data.serviceName,
                host: data.host || 'localhost',
                port: data.port,
                capabilities: data.capabilities || [],
                lastSeen: Date.now()
            };
            
            this.peers.set(data.nodeId, peer);
            this.services.set(data.serviceName, peer);
            
            console.log(`🔍 Discovered peer: ${data.serviceName} (${data.nodeId})`);
            
            return {
                success: true,
                nodeId: this.nodeId,
                service: this.serviceName,
                peers: Array.from(this.peers.values())
            };
        }
        
        return {
            nodeId: this.nodeId,
            service: this.serviceName,
            peers: Array.from(this.peers.values())
        };
    }
    
    async handleMessage(data) {
        const { targetService, targetNode, message, messageType = 'general' } = data;
        
        if (targetNode && targetNode !== this.nodeId) {
            // Forward to specific node
            return await this.forwardMessage(targetNode, data);
        }
        
        // Process message locally
        this.emit('message', { message, messageType, from: data.from });
        
        return {
            success: true,
            processed: true,
            nodeId: this.nodeId,
            timestamp: Date.now()
        };
    }
    
    async handleAIChat(data) {
        const { sessionId, message, model = 'default' } = data;
        
        // Get conversation history
        let history = this.conversationHistory.get(sessionId) || [];
        
        // Add user message
        history.push({ role: 'user', content: message, timestamp: Date.now() });
        
        // Generate AI response (mock implementation - replace with actual AI)
        const aiResponse = await this.generateAIResponse(message, history, model);
        
        // Add AI response to history
        history.push({ role: 'assistant', content: aiResponse, timestamp: Date.now() });
        
        // Store updated history (keep last 20 messages)
        if (history.length > 20) {
            history = history.slice(-20);
        }
        this.conversationHistory.set(sessionId, history);
        
        return {
            success: true,
            response: aiResponse,
            sessionId,
            model,
            history: history.slice(-5) // Return last 5 messages
        };
    }
    
    async handleAIGenerate(data) {
        const { prompt, language, context = '', options = {} } = data;
        
        // Generate code using AI (mock implementation)
        const generatedCode = await this.generateCode(prompt, language, context, options);
        
        return {
            success: true,
            code: generatedCode,
            language,
            metadata: {
                lines: generatedCode.split('\n').length,
                characters: generatedCode.length,
                generated: Date.now()
            }
        };
    }
    
    async handleExecute(data) {
        const { code, language, sessionId } = data;
        
        // Execute code locally if this container supports the language
        if (this.capabilities.includes(language) || this.serviceName === language) {
            return await this.executeCodeLocally(code, language, sessionId);
        }
        
        // Find peer that can execute this language
        const targetPeer = Array.from(this.peers.values())
            .find(peer => peer.service === language || peer.capabilities.includes(language));
        
        if (targetPeer) {
            return await this.forwardExecution(targetPeer, data);
        }
        
        return {
            error: `No available container for language: ${language}`,
            availableLanguages: Array.from(this.services.keys())
        };
    }
    
    async generateAIResponse(message, history, model) {
        // Mock AI response - replace with actual AI integration
        const responses = [
            `I understand you're asking about: "${message}". Here's my analysis...`,
            `Based on your message, I can help you with: ${message}`,
            `Let me process that request: "${message}" and provide you with a solution.`,
            `Great question! Regarding "${message}", here's what I think...`,
            `I see you need help with: ${message}. Let me break this down for you.`
        ];
        
        const contextResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Add some context awareness
        if (message.toLowerCase().includes('code')) {
            return `${contextResponse}\n\nFor code-related tasks, I can help you generate, debug, or explain code in multiple languages including: ${Array.from(this.services.keys()).join(', ')}.`;
        }
        
        if (message.toLowerCase().includes('container')) {
            return `${contextResponse}\n\nI can see ${this.peers.size} active containers in the mesh: ${Array.from(this.services.keys()).join(', ')}.`;
        }
        
        return contextResponse;
    }
    
    async generateCode(prompt, language, context, options) {
        // Mock code generation - replace with actual AI
        const templates = {
            javascript: `// Generated code for: ${prompt}\nfunction solution() {\n    // TODO: Implement ${prompt}\n    console.log("Hello from ${language}!");\n}\n\nsolution();`,
            python: `# Generated code for: ${prompt}\ndef solution():\n    # TODO: Implement ${prompt}\n    print("Hello from ${language}!")\n\nif __name__ == "__main__":\n    solution()`,
            java: `// Generated code for: ${prompt}\npublic class Solution {\n    public static void main(String[] args) {\n        // TODO: Implement ${prompt}\n        System.out.println("Hello from ${language}!");\n    }\n}`,
            go: `// Generated code for: ${prompt}\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // TODO: Implement ${prompt}\n    fmt.Println("Hello from ${language}!")\n}`,
            rust: `// Generated code for: ${prompt}\nfn main() {\n    // TODO: Implement ${prompt}\n    println!("Hello from {}!", "${language}");\n}`
        };
        
        return templates[language] || `// Generated code for: ${prompt}\n// Language: ${language}\n// Context: ${context}`;
    }
    
    async executeCodeLocally(code, language, sessionId) {
        // Mock code execution - implement actual execution
        const output = `Executing ${language} code...\nCode length: ${code.length} characters\nExecution completed successfully!`;
        
        return {
            success: true,
            output,
            error: '',
            language,
            sessionId,
            executedAt: Date.now(),
            executionTime: Math.random() * 1000 + 100 // Mock execution time
        };
    }
    
    async forwardMessage(targetNodeId, data) {
        const peer = this.peers.get(targetNodeId);
        if (!peer) {
            return { error: `Peer ${targetNodeId} not found` };
        }
        
        try {
            const response = await this.sendToPeer(peer, '/mesh/message', data);
            return response;
        } catch (error) {
            return { error: `Failed to forward message: ${error.message}` };
        }
    }
    
    async forwardExecution(peer, data) {
        try {
            const response = await this.sendToPeer(peer, '/mesh/execute', data);
            return response;
        } catch (error) {
            return { error: `Execution forwarding failed: ${error.message}` };
        }
    }
    
    async sendToPeer(peer, endpoint, data) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(data);
            
            const options = {
                hostname: peer.host,
                port: peer.port,
                path: endpoint,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve({ error: 'Invalid JSON response', raw: body });
                    }
                });
            });
            
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }
    
    startDiscovery() {
        // Announce self to network
        this.announceToNetwork();
        
        // Regular discovery broadcasts
        this.discoveryInterval = setInterval(() => {
            this.announceToNetwork();
            this.pingPeers();
        }, 30000); // Every 30 seconds
    }
    
    async announceToNetwork() {
        const announcement = {
            announce: true,
            nodeId: this.nodeId,
            serviceName: this.serviceName,
            host: 'localhost',
            port: this.port,
            capabilities: this.capabilities,
            timestamp: Date.now()
        };
        
        // Broadcast to common discovery ports
        const discoveryPorts = [3000, 4000, 5000, 8080, 8082, 8085, 8087, 8090, 8094, 8096, 8097];
        
        for (const port of discoveryPorts) {
            if (port !== this.port) {
                try {
                    await this.sendDiscoveryMessage('localhost', port, announcement);
                } catch (error) {
                    // Silently ignore - peer might not be running
                }
            }
        }
    }
    
    async sendDiscoveryMessage(host, port, data) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(data);
            
            const options = {
                hostname: host,
                port: port,
                path: '/mesh/discover',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                timeout: 1000
            };
            
            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        const response = JSON.parse(body);
                        if (response.peers) {
                            // Update peer list
                            response.peers.forEach(peer => {
                                this.peers.set(peer.id, peer);
                                this.services.set(peer.service, peer);
                            });
                        }
                        resolve(response);
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Discovery timeout'));
            });
            
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }
    
    pingPeers() {
        // Remove stale peers
        const stalePeers = [];
        const now = Date.now();
        
        for (const [id, peer] of this.peers) {
            if (now - peer.lastSeen > 120000) { // 2 minutes
                stalePeers.push(id);
            }
        }
        
        stalePeers.forEach(id => {
            const peer = this.peers.get(id);
            this.peers.delete(id);
            this.services.delete(peer.service);
            console.log(`🗑️ Removed stale peer: ${peer.service} (${id})`);
        });
    }
    
    setupCleanup() {
        this.cleanupInterval = setInterval(() => {
            // Clean old conversation history
            const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
            
            for (const [sessionId, history] of this.conversationHistory) {
                const lastMessage = history[history.length - 1];
                if (lastMessage && lastMessage.timestamp < cutoff) {
                    this.conversationHistory.delete(sessionId);
                }
            }
            
            // Clean cache
            this.localCache.clear();
            
        }, 60000); // Every minute
    }
    
    initializeAI() {
        // Initialize AI models (mock)
        this.aiModels.set('default', {
            name: 'Kraken AI',
            version: '1.0',
            capabilities: ['chat', 'code-generation', 'analysis']
        });
        
        this.aiModels.set('code', {
            name: 'Code Generator',
            version: '1.0',
            capabilities: ['code-generation', 'debugging', 'optimization']
        });
    }
    
    getHealthStatus() {
        return {
            nodeId: this.nodeId,
            service: this.serviceName,
            status: 'healthy',
            uptime: Date.now() - this.metrics.uptime,
            peers: this.peers.size,
            services: this.services.size,
            aiModels: this.aiModels.size,
            conversations: this.conversationHistory.size
        };
    }
    
    getMetrics() {
        const avgResponseTime = this.metrics.responseTime.length > 0
            ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
            : 0;
        
        return {
            messages: this.metrics.messages,
            errors: this.metrics.errors,
            averageResponseTime: Math.round(avgResponseTime),
            uptime: Date.now() - this.metrics.uptime,
            memoryUsage: process.memoryUsage(),
            peers: this.peers.size,
            activeConversations: this.conversationHistory.size
        };
    }
    
    getPeers() {
        return {
            nodeId: this.nodeId,
            peers: Array.from(this.peers.values()),
            services: Array.from(this.services.entries()).map(([name, peer]) => ({
                name,
                nodeId: peer.id,
                host: peer.host,
                port: peer.port
            }))
        };
    }
    
    async shutdown() {
        console.log('🛑 Shutting down Kraken Mesh...');
        
        if (this.discoveryInterval) clearInterval(this.discoveryInterval);
        if (this.cleanupInterval) clearInterval(this.cleanupInterval);
        
        if (this.server) {
            this.server.close();
        }
        
        console.log('✅ Kraken Mesh shutdown complete');
    }
}

// Export for use as module
module.exports = KrakenMesh;

// CLI usage
if (require.main === module) {
    const options = {
        serviceName: process.argv[2] || process.env.SERVICE_NAME,
        port: process.argv[3] || process.env.MESH_PORT,
        capabilities: (process.argv[4] || '').split(',').filter(Boolean)
    };
    
    const mesh = new KrakenMesh(options);
    
    process.on('SIGTERM', () => mesh.shutdown());
    process.on('SIGINT', () => mesh.shutdown());
}