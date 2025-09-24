// App.js - Main Application Controller for Da-Kraken Modern UI

class DaKrakenApp {
    constructor() {
        this.isInitialized = false;
        this.currentLanguage = 'all';
        this.containers = new Map();
        this.systemMetrics = {};
        this.activityLog = [];
        this.services = new Map();
        
        this.init();
    }

    async init() {
        try {
            await this.waitForDependencies();
            this.setupEventListeners();
            this.initializeComponents();
            await this.loadInitialData();
            this.startDataPolling();
            this.showApplication();
            
            this.isInitialized = true;
            console.log('Da-Kraken Modern UI initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Da-Kraken UI:', error);
            this.showErrorScreen(error);
        }
    }

    // Wait for dependencies to load
    async waitForDependencies() {
        const maxWait = 10000; // 10 seconds
        const startTime = Date.now();
        
        while (!window.apiClient || !window.symbolManager || !window.mechanicalAnimationEngine || !window.gptAppsManager) {
            if (Date.now() - startTime > maxWait) {
                throw new Error('Dependencies failed to load within timeout');
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Setup global event listeners
    setupEventListeners() {
        // Navigation events
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.onLanguageSelect(e.target.dataset.lang);
            });
        });

        // Control button events
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.onControlAction(e.target.dataset.action);
            });
        });

        // Action card events
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.onActionClick(e.target.dataset.action);
            });
        });

        // FAB events
        const fabMain = document.querySelector('.fab-main');
        const fabItems = document.querySelectorAll('.fab-item');
        
        if (fabMain) {
            fabMain.addEventListener('click', () => {
                this.toggleFABMenu();
            });
        }
        
        fabItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.onFABAction(e.target.dataset.action);
            });
        });

        // API client events
        if (window.apiClient) {
            window.apiClient.on('healthCheck', (health) => {
                this.updateSystemHealth(health);
            });
            
            window.apiClient.on('healthCheckError', (error) => {
                this.handleAPIError(error);
            });
        }

        // System events
        document.addEventListener('systemHealthUpdate', (e) => {
            this.updateSystemHealth(e.detail);
        });

        // Symbol events
        document.addEventListener('symbolClick', (e) => {
            this.onSymbolClick(e.detail);
        });

        // Window events
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });

        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    // Initialize UI components
    initializeComponents() {
        this.initializeContainerGrid();
        this.initializeServiceGrid();
        this.initializeStatusCards();
        this.initializeActivityLog();
    }

    // Initialize container status grid
    initializeContainerGrid() {
        const containerList = document.getElementById('container-list');
        if (!containerList) return;

        // Create container status template
        this.containerTemplate = `
            <div class="container-item" data-container-id="{id}">
                <div class="container-symbol symbol-3d" data-symbol="{symbol}">
                    <i class="{icon}"></i>
                </div>
                <div class="container-info">
                    <h4 class="container-name">{name}</h4>
                    <div class="container-status status-{status}">
                        <div class="status-indicator"></div>
                        <span>{statusText}</span>
                    </div>
                </div>
                <div class="container-actions">
                    <button class="action-btn start-btn" data-action="start" data-container="{id}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="action-btn stop-btn" data-action="stop" data-container="{id}">
                        <i class="fas fa-stop"></i>
                    </button>
                    <button class="action-btn restart-btn" data-action="restart" data-container="{id}">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Initialize service grid
    initializeServiceGrid() {
        const serviceGrid = document.getElementById('service-grid');
        if (!serviceGrid) return;

        this.serviceTemplate = `
            <div class="service-card" data-service="{service}">
                <div class="service-header">
                    <div class="service-symbol symbol-3d" data-symbol="{symbol}">
                        <i class="{icon}"></i>
                    </div>
                    <div class="service-info">
                        <h3 class="service-name">{name}</h3>
                        <p class="service-description">{description}</p>
                    </div>
                </div>
                <div class="service-status">
                    <div class="status-indicator {statusClass}"></div>
                    <span class="status-text">{statusText}</span>
                </div>
                <div class="service-metrics">
                    <div class="metric">
                        <span class="metric-label">CPU</span>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: {cpu}%"></div>
                        </div>
                        <span class="metric-value">{cpu}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">RAM</span>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: {memory}%"></div>
                        </div>
                        <span class="metric-value">{memory}%</span>
                    </div>
                </div>
                <div class="service-actions">
                    <button class="service-btn" data-action="open" data-service="{service}">
                        <span class="symbol" data-symbol="🚀">🚀</span>
                        Open
                    </button>
                    <button class="service-btn" data-action="logs" data-service="{service}">
                        <span class="symbol" data-symbol="📋">📋</span>
                        Logs
                    </button>
                </div>
            </div>
        `;
    }

    // Initialize status cards
    initializeStatusCards() {
        // System status card is already in HTML
        // We'll update its content dynamically
    }

    // Initialize activity log
    initializeActivityLog() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        this.activityTemplate = `
            <div class="activity-item">
                <div class="activity-time">{time}</div>
                <div class="activity-symbol symbol-{type}" data-symbol="{symbol}">
                    <i class="{icon}"></i>
                </div>
                <div class="activity-content">
                    <span class="activity-text">{text}</span>
                </div>
            </div>
        `;
    }

    // Load initial data
    async loadInitialData() {
        try {
            // Load containers
            await this.loadContainers();
            
            // Load system status
            await this.loadSystemStatus();
            
            // Load services
            await this.loadServices();
            
            // Add initial activity log entry
            this.addActivity('system', 'Da-Kraken UI initialized', '🚀');
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.addActivity('error', 'Failed to load system data', '❌');
        }
    }

    // Load containers data
    async loadContainers() {
        try {
            const response = await window.apiClient.getContainers();
            if (response.success) {
                this.updateContainers(response.data);
            }
        } catch (error) {
            console.error('Failed to load containers:', error);
            // Show fallback container data
            this.showFallbackContainers();
        }
    }

    // Load system status
    async loadSystemStatus() {
        try {
            const response = await window.apiClient.getSystemStatus();
            if (response.success) {
                this.updateSystemStatus(response.data);
            }
        } catch (error) {
            console.error('Failed to load system status:', error);
            this.showFallbackSystemStatus();
        }
    }

    // Load services
    async loadServices() {
        try {
            const response = await window.apiClient.getEnvironments();
            if (response.success) {
                this.updateServices(response.data);
            }
        } catch (error) {
            console.error('Failed to load services:', error);
            this.showFallbackServices();
        }
    }

    // Update containers display
    updateContainers(containers) {
        const containerList = document.getElementById('container-list');
        if (!containerList) return;

        containerList.innerHTML = '';
        
        containers.forEach(container => {
            const containerElement = this.createContainerElement(container);
            containerList.appendChild(containerElement);
            
            // Store container data
            this.containers.set(container.id, container);
        });

        // Reinitialize symbols for new elements
        if (window.symbolManager) {
            window.symbolManager.loadSymbols();
        }
    }

    // Create container element
    createContainerElement(container) {
        const symbol = this.getContainerSymbol(container.language);
        const html = this.containerTemplate
            .replace(/{id}/g, container.id)
            .replace(/{name}/g, container.name)
            .replace(/{symbol}/g, symbol.symbol)
            .replace(/{icon}/g, symbol.icon)
            .replace(/{status}/g, container.status)
            .replace(/{statusText}/g, this.formatStatus(container.status));

        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild;
    }

    // Get container symbol based on language
    getContainerSymbol(language) {
        const symbols = {
            nodejs: { symbol: '⚡', icon: 'devicon-nodejs-plain' },
            python: { symbol: '🐍', icon: 'devicon-python-plain' },
            rust: { symbol: '🦀', icon: 'devicon-rust-plain' },
            go: { symbol: '🚀', icon: 'devicon-go-plain' },
            java: { symbol: '☕', icon: 'devicon-java-plain' },
            php: { symbol: '🐘', icon: 'devicon-php-plain' },
            zig: { symbol: '⚡', icon: 'fas fa-bolt' },
            crystal: { symbol: '💎', icon: 'fas fa-gem' },
            elixir: { symbol: '💧', icon: 'devicon-elixir-plain' },
            fortran: { symbol: '🔢', icon: 'fas fa-calculator' }
        };
        
        return symbols[language] || { symbol: '📦', icon: 'fas fa-cube' };
    }

    // Update services display
    updateServices(services) {
        const serviceGrid = document.getElementById('service-grid');
        if (!serviceGrid) return;

        serviceGrid.innerHTML = '';
        
        services.forEach(service => {
            const serviceElement = this.createServiceElement(service);
            serviceGrid.appendChild(serviceElement);
            
            this.services.set(service.id, service);
        });

        if (window.symbolManager) {
            window.symbolManager.loadSymbols();
        }
    }

    // Create service element
    createServiceElement(service) {
        const symbol = this.getContainerSymbol(service.language);
        const html = this.serviceTemplate
            .replace(/{service}/g, service.id)
            .replace(/{name}/g, service.name)
            .replace(/{description}/g, service.description || 'Development environment')
            .replace(/{symbol}/g, symbol.symbol)
            .replace(/{icon}/g, symbol.icon)
            .replace(/{statusClass}/g, service.status === 'running' ? 'online' : 'offline')
            .replace(/{statusText}/g, this.formatStatus(service.status))
            .replace(/{cpu}/g, service.metrics?.cpu || 0)
            .replace(/{memory}/g, service.metrics?.memory || 0);

        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild;
    }

    // Update system status
    updateSystemStatus(status) {
        this.systemMetrics = status;
        
        // Update status indicator
        const systemStatus = document.querySelector('.system-status .status-indicator');
        if (systemStatus) {
            systemStatus.className = `status-indicator ${status.healthy ? 'online' : 'offline'}`;
        }

        // Update performance metrics
        this.updatePerformanceMetrics(status.metrics);
    }

    // Update performance metrics
    updatePerformanceMetrics(metrics) {
        if (!metrics) return;

        const cpuFill = document.querySelector('.metric-row:nth-child(1) .metric-fill');
        const cpuValue = document.querySelector('.metric-row:nth-child(1) .metric-value');
        const ramFill = document.querySelector('.metric-row:nth-child(2) .metric-fill');
        const ramValue = document.querySelector('.metric-row:nth-child(2) .metric-value');

        if (cpuFill && cpuValue) {
            cpuFill.style.width = `${metrics.cpu}%`;
            cpuValue.textContent = `${metrics.cpu}%`;
        }

        if (ramFill && ramValue) {
            ramFill.style.width = `${metrics.memory}%`;
            ramValue.textContent = `${metrics.memory}%`;
        }
    }

    // Event handlers
    onLanguageSelect(language) {
        this.currentLanguage = language;
        
        // Update active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === language);
        });

        // Filter displayed services
        this.filterServices(language);
        
        this.addActivity('system', `Switched to ${language} environment`, '🔄');
    }

    async onControlAction(action) {
        try {
            switch (action) {
                case 'start':
                    await this.startAllServices();
                    break;
                case 'stop':
                    await this.stopAllServices();
                    break;
                case 'restart':
                    await this.restartAllServices();
                    break;
                case 'settings':
                    this.openSettings();
                    break;
            }
        } catch (error) {
            console.error(`Failed to execute ${action}:`, error);
            this.addActivity('error', `Failed to ${action} services`, '❌');
        }
    }

    onActionClick(action) {
        switch (action) {
            case 'generate-code':
                this.openCodeGenerator();
                break;
            case 'run-tests':
                this.runTests();
                break;
            case 'deploy':
                this.deployServices();
                break;
            case 'monitor':
                this.openMonitoring();
                break;
        }
    }

    onFABAction(action) {
        switch (action) {
            case 'new-project':
                this.createNewProject();
                break;
            case 'terminal':
                this.openTerminal();
                break;
            case 'help':
                this.showHelp();
                break;
        }
    }

    onSymbolClick(detail) {
        const { symbolId, symbol } = detail;
        console.log('Symbol clicked:', symbol);
        
        // Add visual feedback
        if (window.symbolManager) {
            window.symbolManager.addAnimation(symbolId, 'bounce');
        }
    }

    // Filter services by language
    filterServices(language) {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            const serviceId = card.dataset.service;
            const service = this.services.get(serviceId);
            
            if (language === 'all' || !service || service.language === language) {
                card.style.display = 'block';
                card.classList.add('animate-fade-in');
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Add activity log entry
    addActivity(type, text, symbol) {
        const activity = {
            time: new Date().toLocaleTimeString(),
            type,
            text,
            symbol,
            icon: this.getActivityIcon(type)
        };
        
        this.activityLog.unshift(activity);
        
        // Keep only last 20 activities
        if (this.activityLog.length > 20) {
            this.activityLog = this.activityLog.slice(0, 20);
        }
        
        this.updateActivityDisplay();
    }

    // Get activity icon
    getActivityIcon(type) {
        const icons = {
            system: 'fas fa-cog',
            container: 'fas fa-cube',
            error: 'fas fa-exclamation-triangle',
            success: 'fas fa-check',
            info: 'fas fa-info'
        };
        
        return icons[type] || 'fas fa-circle';
    }

    // Update activity display
    updateActivityDisplay() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        activityList.innerHTML = '';
        
        this.activityLog.slice(0, 5).forEach(activity => {
            const html = this.activityTemplate
                .replace(/{time}/g, activity.time)
                .replace(/{type}/g, activity.type)
                .replace(/{symbol}/g, activity.symbol)
                .replace(/{icon}/g, activity.icon)
                .replace(/{text}/g, activity.text);

            const div = document.createElement('div');
            div.innerHTML = html;
            activityList.appendChild(div.firstElementChild);
        });
    }

    // Start data polling
    startDataPolling() {
        // Poll system status every 30 seconds
        this.systemPollingInterval = setInterval(async () => {
            try {
                await this.loadSystemStatus();
            } catch (error) {
                console.error('System status polling failed:', error);
            }
        }, 30000);

        // Poll containers every 10 seconds
        this.containerPollingInterval = setInterval(async () => {
            try {
                await this.loadContainers();
            } catch (error) {
                console.error('Container polling failed:', error);
            }
        }, 10000);
    }

    // Show application (hide loading screen)
    showApplication() {
        const loadingScreen = document.getElementById('loading-screen');
        const appContainer = document.querySelector('.app-container');
        
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
        
        if (appContainer) {
            appContainer.classList.add('loaded');
        }
    }

    // Show error screen
    showErrorScreen(error) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="error-screen">
                    <div class="error-symbol">❌</div>
                    <h2>Failed to Initialize</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="retry-btn">Retry</button>
                </div>
            `;
        }
    }

    // Fallback data methods
    showFallbackContainers() {
        const fallbackContainers = [
            { id: 'nodejs-1', name: 'Node.js Environment', language: 'nodejs', status: 'running' },
            { id: 'python-1', name: 'Python Environment', language: 'python', status: 'running' },
            { id: 'rust-1', name: 'Rust Environment', language: 'rust', status: 'stopped' }
        ];
        
        this.updateContainers(fallbackContainers);
    }

    showFallbackServices() {
        const fallbackServices = [
            { 
                id: 'bridge-orchestrator',
                name: 'Bridge Orchestrator',
                language: 'nodejs',
                status: 'running',
                description: 'Container management service',
                metrics: { cpu: 15, memory: 25 }
            },
            {
                id: 'redis-cache',
                name: 'Redis Cache',
                language: 'database',
                status: 'running',
                description: 'In-memory data store',
                metrics: { cpu: 5, memory: 12 }
            }
        ];
        
        this.updateServices(fallbackServices);
    }

    showFallbackSystemStatus() {
        const fallbackStatus = {
            healthy: true,
            metrics: {
                cpu: 25,
                memory: 40
            }
        };
        
        this.updateSystemStatus(fallbackStatus);
    }

    // Utility methods
    formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    toggleFABMenu() {
        const fabContainer = document.querySelector('.fab-container');
        if (fabContainer) {
            fabContainer.classList.toggle('open');
        }
    }

    onWindowResize() {
        // Handle responsive adjustments
        if (window.symbolManager) {
            window.symbolManager.loadSymbols();
        }
    }

    // Cleanup
    cleanup() {
        if (this.systemPollingInterval) {
            clearInterval(this.systemPollingInterval);
        }
        
        if (this.containerPollingInterval) {
            clearInterval(this.containerPollingInterval);
        }
        
        if (window.apiClient) {
            window.apiClient.destroy();
        }
    }

    // Placeholder methods for future implementation
    async startAllServices() {
        this.addActivity('system', 'Starting all services...', '▶️');
    }

    async stopAllServices() {
        this.addActivity('system', 'Stopping all services...', '⏹️');
    }

    async restartAllServices() {
        this.addActivity('system', 'Restarting all services...', '🔄');
    }

    openSettings() {
        this.addActivity('system', 'Opening settings...', '⚙️');
    }

    openCodeGenerator() {
        this.addActivity('system', 'Opening code generator...', '🤖');
    }

    runTests() {
        this.addActivity('system', 'Running tests...', '🧪');
    }

    deployServices() {
        this.addActivity('system', 'Deploying services...', '🚀');
    }

    openMonitoring() {
        this.addActivity('system', 'Opening monitoring dashboard...', '📊');
    }

    createNewProject() {
        this.addActivity('system', 'Creating new project...', '📁');
    }

    openTerminal() {
        this.addActivity('system', 'Opening terminal...', '💻');
    }

    showHelp() {
        this.addActivity('system', 'Opening help documentation...', '❓');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.daKrakenApp = new DaKrakenApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DaKrakenApp;
}