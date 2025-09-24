// API Client - Modern Da-Kraken API Communication

class DaKrakenAPIClient {
    constructor() {
        this.baseURL = this.detectAPIEndpoint();
        this.version = 'v1';
        this.timeout = 10000;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        
        this.endpoints = {
            // Container Management
            containers: {
                list: '/containers',
                status: '/containers/status',
                start: '/containers/{id}/start',
                stop: '/containers/{id}/stop',
                restart: '/containers/{id}/restart',
                logs: '/containers/{id}/logs',
                stats: '/containers/{id}/stats'
            },
            
            // Code Generation
            codegen: {
                generate: '/codegen/generate',
                languages: '/codegen/languages',
                templates: '/codegen/templates',
                validate: '/codegen/validate'
            },
            
            // System Status
            system: {
                health: '/system/health',
                status: '/system/status',
                metrics: '/system/metrics',
                info: '/system/info'
            },
            
            // File Operations
            files: {
                list: '/files',
                read: '/files/{path}',
                write: '/files/{path}',
                delete: '/files/{path}',
                upload: '/files/upload',
                download: '/files/download'
            },
            
            // Development Environment
            dev: {
                environments: '/dev/environments',
                create: '/dev/create',
                setup: '/dev/setup',
                cleanup: '/dev/cleanup'
            }
        };
        
        this.init();
    }

    // Initialize API client
    init() {
        this.setupInterceptors();
        this.startHealthCheck();
        this.loadAPIKeys();
    }

    // Detect API endpoint based on environment
    detectAPIEndpoint() {
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        // Development environment detection
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `http://${hostname}:${port || 3001}/api`;
        }
        
        // Codespace environment
        if (hostname.includes('github.dev') || hostname.includes('codespaces')) {
            return `https://${hostname}/api`;
        }
        
        // Container environment
        if (hostname.includes('bridge-orchestrator')) {
            return `http://bridge-orchestrator:3001/api`;
        }
        
        // Default fallback
        return '/api';
    }

    // Load API keys from secure storage
    async loadAPIKeys() {
        try {
            const response = await this.makeRequest('GET', '/auth/keys');
            if (response.success) {
                this.apiKeys = response.data;
            }
        } catch (error) {
            console.warn('Could not load API keys:', error);
            this.apiKeys = {};
        }
    }

    // Setup request/response interceptors
    setupInterceptors() {
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        
        // Add default request interceptor for authentication
        this.requestInterceptors.push((config) => {
            if (this.apiKeys?.bridgeToken) {
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${this.apiKeys.bridgeToken}`
                };
            }
            return config;
        });
        
        // Add default response interceptor for error handling
        this.responseInterceptors.push((response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response;
        });
    }

    // Make HTTP request with retry logic
    async makeRequest(method, endpoint, data = null, options = {}) {
        const config = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                'X-Client': 'Da-Kraken-Modern-UI',
                ...options.headers
            },
            ...options
        };

        // Apply request interceptors
        for (const interceptor of this.requestInterceptors) {
            Object.assign(config, interceptor(config));
        }

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        const url = `${this.baseURL}${endpoint}`;
        let lastError;

        for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                config.signal = controller.signal;
                
                let response = await fetch(url, config);
                clearTimeout(timeoutId);

                // Apply response interceptors
                for (const interceptor of this.responseInterceptors) {
                    response = interceptor(response);
                }

                const responseData = await response.json();
                return responseData;

            } catch (error) {
                lastError = error;
                
                if (attempt < this.retryAttempts - 1) {
                    await this.delay(this.retryDelay * Math.pow(2, attempt));
                    continue;
                }
            }
        }

        throw lastError;
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Build endpoint URL with parameters
    buildEndpoint(template, params = {}) {
        let endpoint = template;
        for (const [key, value] of Object.entries(params)) {
            endpoint = endpoint.replace(`{${key}}`, encodeURIComponent(value));
        }
        return endpoint;
    }

    // Container Management API
    async getContainers() {
        return this.makeRequest('GET', this.endpoints.containers.list);
    }

    async getContainerStatus(containerId) {
        const endpoint = this.buildEndpoint(this.endpoints.containers.status, { id: containerId });
        return this.makeRequest('GET', endpoint);
    }

    async startContainer(containerId) {
        const endpoint = this.buildEndpoint(this.endpoints.containers.start, { id: containerId });
        return this.makeRequest('POST', endpoint);
    }

    async stopContainer(containerId) {
        const endpoint = this.buildEndpoint(this.endpoints.containers.stop, { id: containerId });
        return this.makeRequest('POST', endpoint);
    }

    async restartContainer(containerId) {
        const endpoint = this.buildEndpoint(this.endpoints.containers.restart, { id: containerId });
        return this.makeRequest('POST', endpoint);
    }

    async getContainerLogs(containerId, options = {}) {
        const endpoint = this.buildEndpoint(this.endpoints.containers.logs, { id: containerId });
        const queryParams = new URLSearchParams(options).toString();
        return this.makeRequest('GET', `${endpoint}?${queryParams}`);
    }

    async getContainerStats(containerId) {
        const endpoint = this.buildEndpoint(this.endpoints.containers.stats, { id: containerId });
        return this.makeRequest('GET', endpoint);
    }

    // Code Generation API
    async generateCode(language, prompt, options = {}) {
        return this.makeRequest('POST', this.endpoints.codegen.generate, {
            language,
            prompt,
            ...options
        });
    }

    async getSupportedLanguages() {
        return this.makeRequest('GET', this.endpoints.codegen.languages);
    }

    async getCodeTemplates(language) {
        const queryParams = new URLSearchParams({ language }).toString();
        return this.makeRequest('GET', `${this.endpoints.codegen.templates}?${queryParams}`);
    }

    async validateCode(language, code) {
        return this.makeRequest('POST', this.endpoints.codegen.validate, {
            language,
            code
        });
    }

    // System Status API
    async getSystemHealth() {
        return this.makeRequest('GET', this.endpoints.system.health);
    }

    async getSystemStatus() {
        return this.makeRequest('GET', this.endpoints.system.status);
    }

    async getSystemMetrics() {
        return this.makeRequest('GET', this.endpoints.system.metrics);
    }

    async getSystemInfo() {
        return this.makeRequest('GET', this.endpoints.system.info);
    }

    // File Operations API
    async listFiles(path = '/') {
        const queryParams = new URLSearchParams({ path }).toString();
        return this.makeRequest('GET', `${this.endpoints.files.list}?${queryParams}`);
    }

    async readFile(filePath) {
        const endpoint = this.buildEndpoint(this.endpoints.files.read, { path: filePath });
        return this.makeRequest('GET', endpoint);
    }

    async writeFile(filePath, content) {
        const endpoint = this.buildEndpoint(this.endpoints.files.write, { path: filePath });
        return this.makeRequest('POST', endpoint, { content });
    }

    async deleteFile(filePath) {
        const endpoint = this.buildEndpoint(this.endpoints.files.delete, { path: filePath });
        return this.makeRequest('DELETE', endpoint);
    }

    async uploadFile(file, path) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', path);

        return this.makeRequest('POST', this.endpoints.files.upload, formData, {
            headers: {} // Remove Content-Type to let browser set it for FormData
        });
    }

    async downloadFile(filePath) {
        const queryParams = new URLSearchParams({ path: filePath }).toString();
        const response = await fetch(`${this.baseURL}${this.endpoints.files.download}?${queryParams}`);
        return response.blob();
    }

    // Development Environment API
    async getEnvironments() {
        return this.makeRequest('GET', this.endpoints.dev.environments);
    }

    async createEnvironment(language, name, options = {}) {
        return this.makeRequest('POST', this.endpoints.dev.create, {
            language,
            name,
            ...options
        });
    }

    async setupEnvironment(environmentId, config = {}) {
        return this.makeRequest('POST', this.endpoints.dev.setup, {
            environmentId,
            config
        });
    }

    async cleanupEnvironment(environmentId) {
        return this.makeRequest('POST', this.endpoints.dev.cleanup, {
            environmentId
        });
    }

    // WebSocket connections for real-time data
    connectWebSocket(endpoint, options = {}) {
        const wsURL = this.baseURL.replace('http', 'ws') + endpoint;
        const ws = new WebSocket(wsURL);
        
        ws.onopen = (event) => {
            console.log('WebSocket connected:', endpoint);
            if (options.onOpen) options.onOpen(event);
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (options.onMessage) options.onMessage(data);
            } catch (error) {
                console.error('WebSocket message parse error:', error);
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (options.onError) options.onError(error);
        };
        
        ws.onclose = (event) => {
            console.log('WebSocket closed:', endpoint);
            if (options.onClose) options.onClose(event);
        };
        
        return ws;
    }

    // Real-time container monitoring
    monitorContainers(callback) {
        return this.connectWebSocket('/containers/monitor', {
            onMessage: callback
        });
    }

    // Real-time system metrics
    monitorSystemMetrics(callback) {
        return this.connectWebSocket('/system/metrics/stream', {
            onMessage: callback
        });
    }

    // Health check system
    startHealthCheck() {
        this.healthCheckInterval = setInterval(async () => {
            try {
                const health = await this.getSystemHealth();
                this.emit('healthCheck', health);
            } catch (error) {
                this.emit('healthCheckError', error);
            }
        }, 30000); // Check every 30 seconds
    }

    stopHealthCheck() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }

    // Event system
    emit(event, data) {
        if (this.eventListeners && this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }

    on(event, callback) {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    off(event, callback) {
        if (this.eventListeners && this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(callback);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }

    // Cleanup
    destroy() {
        this.stopHealthCheck();
        if (this.eventListeners) {
            this.eventListeners = {};
        }
    }
}

// Initialize API client
document.addEventListener('DOMContentLoaded', () => {
    window.apiClient = new DaKrakenAPIClient();
    
    // Set up global error handling
    window.apiClient.on('healthCheckError', (error) => {
        console.warn('API health check failed:', error);
        // Could trigger UI notification here
    });
    
    window.apiClient.on('healthCheck', (health) => {
        // Update UI health indicators
        document.dispatchEvent(new CustomEvent('systemHealthUpdate', {
            detail: health
        }));
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DaKrakenAPIClient;
}