// Kraken Mesh API Client - Optimized for Speed and Efficiency
// Replaces bridge orchestrator with direct peer-to-peer communication

class KrakenMeshClient {
    constructor(options = {}) {
        this.nodeId = this.generateNodeId();
        this.discoveryPorts = [3000, 4000, 5000, 8080, 8082, 8085, 8087, 8090, 8094, 8096, 8097];
        this.peers = new Map();
        this.services = new Map();
        this.cache = new Map();
        this.maxCacheSize = options.maxCacheSize || 1000;
        this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
        
        // AI Chatbot Integration
        this.conversations = new Map();
        this.aiModels = ['default', 'code', 'analysis'];
        
        // Real-time updates
        this.eventListeners = new Map();
        this.pollingInterval = null;
        this.updateInterval = options.updateInterval || 1000; // 1 second
        
        // Performance optimization
        this.requestQueue = [];
        this.maxConcurrentRequests = options.maxConcurrency || 10;
        this.activeRequests = 0;
        this.requestMetrics = {
            total: 0,
            success: 0,
            errors: 0,
            averageTime: 0
        };
        
        this.init();
    }
    
    generateNodeId() {
        return 'client-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    }
    
    async init() {
        console.log('🕸️ Initializing Kraken Mesh Client...');
        
        await this.discoverPeers();
        this.startRealTimeUpdates();
        this.setupCacheCleanup();
        
        console.log(`✅ Mesh client ready - ${this.peers.size} peers discovered`);
    }
    
    async discoverPeers() {
        const discoveryPromises = this.discoveryPorts.map(port => 
            this.tryDiscovery('localhost', port).catch(() => null)
        );
        
        const results = await Promise.all(discoveryPromises);
        
        results.forEach(result => {
            if (result && result.peers) {
                result.peers.forEach(peer => {
                    this.peers.set(peer.id, peer);
                    this.services.set(peer.service, peer);
                });
            }
        });
        
        console.log(`🔍 Discovered ${this.peers.size} peers, ${this.services.size} services`);
    }
    
    async tryDiscovery(host, port) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                announce: false,
                nodeId: this.nodeId,
                requestPeers: true
            });
            
            const options = {
                hostname: host,
                port: port,
                path: '/mesh/discover',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                },
                timeout: 2000
            };
            
            const req = new XMLHttpRequest();
            req.open('POST', `http://${host}:${port}/mesh/discover`);
            req.setRequestHeader('Content-Type', 'application/json');
            req.timeout = 2000;
            
            req.onload = () => {
                if (req.status === 200) {
                    try {
                        resolve(JSON.parse(req.responseText));
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error(`HTTP ${req.status}`));
                }
            };
            
            req.onerror = () => reject(new Error('Network error'));
            req.ontimeout = () => reject(new Error('Timeout'));
            
            req.send(data);
        });
    }
    
    // AI Chatbot Integration
    async chat(message, options = {}) {
        const sessionId = options.sessionId || this.generateSessionId();
        const model = options.model || 'default';
        
        // Find AI-capable peer
        const aiPeer = this.findBestPeer('ai') || Array.from(this.peers.values())[0];
        
        if (!aiPeer) {
            throw new Error('No AI-capable peers available');
        }
        
        const response = await this.sendRequest(aiPeer, '/mesh/ai/chat', {
            sessionId,
            message,
            model,
            timestamp: Date.now()
        });
        
        // Cache conversation
        let conversation = this.conversations.get(sessionId) || [];
        conversation.push(
            { role: 'user', content: message, timestamp: Date.now() },
            { role: 'assistant', content: response.response, timestamp: Date.now() }
        );
        
        // Keep last 20 messages
        if (conversation.length > 20) {
            conversation = conversation.slice(-20);
        }
        
        this.conversations.set(sessionId, conversation);
        
        return {
            sessionId,
            response: response.response,
            model: response.model,
            conversation: conversation.slice(-4) // Return last 2 exchanges
        };
    }
    
    async generateCode(prompt, language, options = {}) {
        const cacheKey = `code:${language}:${this.hashString(prompt)}`;
        
        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('📦 Code generation cache hit');
            return cached;
        }
        
        // Find language-specific peer or any AI-capable peer
        const targetPeer = this.services.get(language) || this.findBestPeer('ai');
        
        if (!targetPeer) {
            throw new Error(`No peer available for language: ${language}`);
        }
        
        const response = await this.sendRequest(targetPeer, '/mesh/ai/generate', {
            prompt,
            language,
            context: options.context || '',
            options: options.generationOptions || {}
        });
        
        // Cache the result
        this.setCache(cacheKey, response, this.cacheTimeout);
        
        return response;
    }
    
    async executeCode(code, language, options = {}) {
        const sessionId = options.sessionId || this.generateSessionId();
        
        // Find peer that can execute this language
        const targetPeer = this.services.get(language);
        
        if (!targetPeer) {
            throw new Error(`No execution environment available for: ${language}`);
        }
        
        return await this.sendRequest(targetPeer, '/mesh/execute', {
            code,
            language,
            sessionId,
            options
        });
    }
    
    async sendRequest(peer, endpoint, data) {
        const startTime = Date.now();
        this.activeRequests++;
        this.requestMetrics.total++;
        
        try {
            const response = await this.makeHttpRequest(peer, endpoint, data);
            
            const duration = Date.now() - startTime;
            this.updateMetrics(duration, true);
            
            return response;
        } catch (error) {
            this.updateMetrics(Date.now() - startTime, false);
            throw error;
        } finally {
            this.activeRequests--;
            this.processQueue();
        }
    }
    
    async makeHttpRequest(peer, endpoint, data) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const url = `http://${peer.host}:${peer.port}${endpoint}`;
            
            xhr.open('POST', url);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.timeout = 10000; // 10 second timeout
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            };
            
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.ontimeout = () => reject(new Error('Request timeout'));
            
            xhr.send(JSON.stringify(data));
        });
    }
    
    findBestPeer(capability) {
        const capablePeers = Array.from(this.peers.values())
            .filter(peer => peer.capabilities && peer.capabilities.includes(capability));
        
        if (capablePeers.length === 0) return null;
        
        // Simple load balancing - return random peer
        return capablePeers[Math.floor(Math.random() * capablePeers.length)];
    }
    
    // Real-time updates system
    startRealTimeUpdates() {
        this.pollingInterval = setInterval(async () => {
            await this.pollForUpdates();
        }, this.updateInterval);
    }
    
    async pollForUpdates() {
        const promises = Array.from(this.peers.values()).map(async peer => {
            try {
                const response = await this.makeHttpRequest(peer, '/mesh/health', {});
                
                // Update peer info
                peer.lastHealthCheck = Date.now();
                peer.status = response.status;
                
                // Emit health update event
                this.emit('peerUpdate', { peer, health: response });
                
            } catch (error) {
                // Mark peer as potentially unhealthy
                peer.lastError = Date.now();
                this.emit('peerError', { peer, error: error.message });
            }
        });
        
        await Promise.allSettled(promises);
    }
    
    // Event system for real-time updates
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    
    emit(event, data) {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Event listener error:', error);
            }
        });
    }
    
    // Storage optimization
    setCache(key, value, timeout = this.cacheTimeout) {
        // Prevent cache from growing too large
        if (this.cache.size >= this.maxCacheSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            timeout
        });
    }
    
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > cached.timeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.value;
    }
    
    setupCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            const keysToDelete = [];
            
            for (const [key, cached] of this.cache) {
                if (now - cached.timestamp > cached.timeout) {
                    keysToDelete.push(key);
                }
            }
            
            keysToDelete.forEach(key => this.cache.delete(key));
            
            if (keysToDelete.length > 0) {
                console.log(`🧹 Cleaned ${keysToDelete.length} expired cache entries`);
            }
        }, 60000); // Every minute
    }
    
    // Performance monitoring
    updateMetrics(duration, success) {
        if (success) {
            this.requestMetrics.success++;
        } else {
            this.requestMetrics.errors++;
        }
        
        // Update average response time
        const total = this.requestMetrics.success + this.requestMetrics.errors;
        this.requestMetrics.averageTime = 
            (this.requestMetrics.averageTime * (total - 1) + duration) / total;
    }
    
    getMetrics() {
        return {
            ...this.requestMetrics,
            peers: this.peers.size,
            services: this.services.size,
            cacheSize: this.cache.size,
            activeRequests: this.activeRequests,
            conversations: this.conversations.size
        };
    }
    
    // Utility methods
    generateSessionId() {
        return 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    }
    
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
    
    processQueue() {
        while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
            const request = this.requestQueue.shift();
            request();
        }
    }
    
    // High-level API methods
    async getAvailableLanguages() {
        return Array.from(this.services.keys());
    }
    
    async getSystemStatus() {
        const healthPromises = Array.from(this.peers.values()).map(async peer => {
            try {
                const health = await this.makeHttpRequest(peer, '/mesh/health', {});
                return { peer: peer.service, status: 'healthy', details: health };
            } catch (error) {
                return { peer: peer.service, status: 'unhealthy', error: error.message };
            }
        });
        
        const results = await Promise.allSettled(healthPromises);
        
        return {
            totalPeers: this.peers.size,
            healthyPeers: results.filter(r => r.status === 'fulfilled' && r.value.status === 'healthy').length,
            services: Array.from(this.services.keys()),
            metrics: this.getMetrics()
        };
    }
    
    async shutdown() {
        console.log('🛑 Shutting down Kraken Mesh Client...');
        
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        this.cache.clear();
        this.conversations.clear();
        this.peers.clear();
        this.services.clear();
        
        console.log('✅ Client shutdown complete');
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KrakenMeshClient;
} else if (typeof window !== 'undefined') {
    window.KrakenMeshClient = KrakenMeshClient;
}