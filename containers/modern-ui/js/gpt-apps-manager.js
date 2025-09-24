// GPT Apps Manager - Import and manage GPT applications in Da-Kraken

class GPTAppsManager {
    constructor() {
        this.gptApps = new Map();
        this.installedApps = new Map();
        this.apiKeys = {};
        this.appStore = new Map();
        this.init();
    }

    async init() {
        await this.loadAPIKeys();
        this.setupAppStore();
        await this.autoInstallBuiltInApps();
        this.initializeUI();
        console.log('🤖 GPT Apps Manager initialized');
    }

    // Load API keys from secure storage
    async loadAPIKeys() {
        try {
            // Try to load from secure key storage
            if (window.apiClient) {
                const response = await window.apiClient.makeRequest('GET', '/auth/keys');
                if (response.success) {
                    this.apiKeys = response.data;
                }
            }
        } catch (error) {
            console.warn('Could not load API keys, using environment variables');
        }
    }

    // Setup the GPT App Store with available apps
    setupAppStore() {
        // Built-in GPT Applications
        const builtInApps = [
            {
                id: 'software-architect-gpt',
                name: 'Software Architect GPT',
                description: 'Advanced AI architect for system design, project planning, and architectural decision-making',
                category: 'architecture',
                symbol: '🏗️',
                icon: 'fas fa-drafting-compass',
                version: '2.0.0',
                author: 'Da-Kraken Team',
                capabilities: ['system-architecture', 'microservices-design', 'database-design', 'scalability-planning', 'performance-optimization', 'security-architecture'],
                languages: ['all'],
                config: {
                    model: 'gpt-4',
                    temperature: 0.4,
                    maxTokens: 4000
                }
            },
            {
                id: 'code-copilot-gpt',
                name: 'Code Copilot GPT', 
                description: 'Advanced AI code assistant with intelligent suggestions, completion, and multi-language support',
                category: 'development',
                symbol: '👨‍💻',
                icon: 'fas fa-code',
                version: '2.0.0',
                author: 'Da-Kraken Team',
                capabilities: ['code-completion', 'intelligent-suggestions', 'code-review', 'bug-detection', 'refactoring', 'optimization'],
                languages: ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'php', 'crystal', 'elixir', 'fortran', 'zig', 'html', 'css', 'matlab'],
                config: {
                    model: 'gpt-4',
                    temperature: 0.3,
                    maxTokens: 3000
                }
            },
            {
                id: 'code-assistant',
                name: 'Code Assistant GPT',
                description: 'AI-powered coding assistant for all languages',
                category: 'development',
                symbol: '�',
                icon: 'fas fa-tools',
                version: '1.0.0',
                author: 'Da-Kraken Team',
                capabilities: ['code-generation', 'debugging', 'optimization', 'documentation'],
                languages: ['javascript', 'python', 'rust', 'go', 'java', 'php', 'zig', 'crystal', 'elixir', 'fortran'],
                config: {
                    model: 'gpt-4',
                    temperature: 0.7,
                    maxTokens: 2000
                }
            },
            {
                id: 'project-architect',
                name: 'Project Architect GPT',
                description: 'AI architect for project planning and structure',
                category: 'planning',
                symbol: '🏗️',
                icon: 'fas fa-building',
                version: '1.0.0',
                author: 'Da-Kraken Team',
                capabilities: ['project-planning', 'architecture-design', 'scaffolding', 'best-practices'],
                languages: ['all'],
                config: {
                    model: 'gpt-4',
                    temperature: 0.5,
                    maxTokens: 3000
                }
            },
            {
                id: 'devops-specialist',
                name: 'DevOps Specialist GPT',
                description: 'AI specialist for deployment and infrastructure',
                category: 'devops',
                symbol: '🚀',
                icon: 'fas fa-rocket',
                version: '1.0.0',
                author: 'Da-Kraken Team',
                capabilities: ['deployment', 'containerization', 'ci-cd', 'monitoring'],
                languages: ['docker', 'kubernetes', 'terraform'],
                config: {
                    model: 'gpt-4',
                    temperature: 0.3,
                    maxTokens: 2500
                }
            },
            {
                id: 'ui-designer',
                name: 'UI/UX Designer GPT',
                description: 'AI designer for user interfaces and experiences',
                category: 'design',
                symbol: '🎨',
                icon: 'fas fa-palette',
                version: '1.0.0',
                author: 'Da-Kraken Team',
                capabilities: ['ui-design', 'ux-planning', 'accessibility', 'responsive-design'],
                languages: ['html', 'css', 'react', 'vue', 'angular'],
                config: {
                    model: 'gpt-4',
                    temperature: 0.8,
                    maxTokens: 2000
                }
            },
            {
                id: 'data-analyst',
                name: 'Data Analyst GPT',
                description: 'AI analyst for data processing and insights',
                category: 'data',
                symbol: '📊',
                icon: 'fas fa-chart-bar',
                version: '1.0.0',
                author: 'Da-Kraken Team',
                capabilities: ['data-analysis', 'visualization', 'machine-learning', 'statistics'],
                languages: ['python', 'r', 'sql', 'jupyter'],
                config: {
                    model: 'gpt-4',
                    temperature: 0.4,
                    maxTokens: 2500
                }
            }
        ];

        builtInApps.forEach(app => {
            this.appStore.set(app.id, app);
        });

        // External GPT Apps (can be imported)
        this.setupExternalApps();
    }

    // Setup external GPT apps that can be imported
    setupExternalApps() {
        const externalApps = [
            {
                id: 'chatgpt-plugin',
                name: 'ChatGPT Plugin Integration',
                description: 'Direct ChatGPT integration with plugin support',
                category: 'external',
                symbol: '🔌',
                icon: 'fas fa-plug',
                source: 'openai',
                installUrl: 'https://api.openai.com/v1',
                requiresAuth: true
            },
            {
                id: 'claude-integration',
                name: 'Claude AI Integration',
                description: 'Anthropic Claude AI assistant',
                category: 'external',
                symbol: '🧠',
                icon: 'fas fa-brain',
                source: 'anthropic',
                installUrl: 'https://api.anthropic.com',
                requiresAuth: true
            },
            {
                id: 'custom-gpt-import',
                name: 'Custom GPT Import',
                description: 'Import your custom GPT applications',
                category: 'custom',
                symbol: '📥',
                icon: 'fas fa-download',
                source: 'custom',
                requiresAuth: false
            }
        ];

        externalApps.forEach(app => {
            this.appStore.set(app.id, app);
        });
    }

    // Install a GPT app
    async installApp(appId, config = {}) {
        const app = this.appStore.get(appId);
        if (!app) {
            throw new Error(`App ${appId} not found in store`);
        }

        console.log(`📥 Installing GPT App: ${app.name}`);

        try {
            // Create app instance
            const installedApp = {
                ...app,
                installDate: new Date(),
                status: 'installing',
                config: { ...app.config, ...config }
            };

            this.installedApps.set(appId, installedApp);

            // Perform installation based on app type
            await this.performInstallation(installedApp);

            // Update status
            installedApp.status = 'installed';
            installedApp.lastUsed = null;

            console.log(`✅ Successfully installed: ${app.name}`);
            this.updateUI();

            return installedApp;

        } catch (error) {
            console.error(`❌ Failed to install ${app.name}:`, error);
            this.installedApps.delete(appId);
            throw error;
        }
    }

    // Perform actual installation logic
    async performInstallation(app) {
        switch (app.source) {
            case 'openai':
                await this.installOpenAIApp(app);
                break;
            case 'anthropic':
                await this.installAnthropicApp(app);
                break;
            case 'custom':
                await this.installCustomApp(app);
                break;
            default:
                await this.installBuiltInApp(app);
        }
    }

    // Install OpenAI-based app
    async installOpenAIApp(app) {
        if (!this.apiKeys.OPENAI_API_KEY || this.apiKeys.OPENAI_API_KEY === 'placeholder_openai.key') {
            throw new Error('OpenAI API key required for installation');
        }

        // Test API connection
        const testResponse = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${this.apiKeys.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!testResponse.ok) {
            throw new Error('Failed to connect to OpenAI API');
        }

        app.apiClient = this.createOpenAIClient();
    }

    // Install Anthropic-based app
    async installAnthropicApp(app) {
        if (!this.apiKeys.ANTHROPIC_API_KEY || this.apiKeys.ANTHROPIC_API_KEY === 'placeholder_anthropic.key') {
            throw new Error('Anthropic API key required for installation');
        }

        app.apiClient = this.createAnthropicClient();
    }

    // Install custom app
    async installCustomApp(app) {
        // Custom apps can be imported from files or URLs
        app.customImport = true;
    }

    // Install built-in app
    async installBuiltInApp(app) {
        // Built-in apps use the internal API client
        app.apiClient = window.apiClient;
    }

    // Create OpenAI API client
    createOpenAIClient() {
        return {
            async chat(messages, options = {}) {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKeys.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: options.model || 'gpt-4',
                        messages: messages,
                        temperature: options.temperature || 0.7,
                        max_tokens: options.maxTokens || 2000,
                        ...options
                    })
                });

                if (!response.ok) {
                    throw new Error(`OpenAI API error: ${response.statusText}`);
                }

                return response.json();
            }
        };
    }

    // Create Anthropic API client
    createAnthropicClient() {
        return {
            async chat(messages, options = {}) {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKeys.ANTHROPIC_API_KEY}`,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: options.model || 'claude-3-sonnet-20240229',
                        messages: messages,
                        max_tokens: options.maxTokens || 2000,
                        temperature: options.temperature || 0.7,
                        ...options
                    })
                });

                if (!response.ok) {
                    throw new Error(`Anthropic API error: ${response.statusText}`);
                }

                return response.json();
            }
        };
    }

    // Use a GPT app
    async useApp(appId, prompt, context = {}) {
        const app = this.installedApps.get(appId);
        if (!app) {
            throw new Error(`App ${appId} not installed`);
        }

        if (app.status !== 'installed') {
            throw new Error(`App ${appId} is not ready (status: ${app.status})`);
        }

        console.log(`🤖 Using GPT App: ${app.name}`);

        try {
            // Update last used timestamp
            app.lastUsed = new Date();

            // Format messages based on app capabilities
            const messages = this.formatMessages(app, prompt, context);

            // Call the appropriate API
            const response = await app.apiClient.chat(messages, app.config);

            console.log(`✅ GPT App response received from: ${app.name}`);
            return this.processResponse(app, response);

        } catch (error) {
            console.error(`❌ Error using GPT App ${app.name}:`, error);
            throw error;
        }
    }

    // Format messages for the specific app
    formatMessages(app, prompt, context) {
        const systemMessage = this.getSystemMessage(app, context);
        const userMessage = { role: 'user', content: prompt };

        const messages = [systemMessage, userMessage];

        // Add context if provided
        if (context.codeContext) {
            messages.splice(1, 0, {
                role: 'user',
                content: `Code context:\n\`\`\`${context.language || 'text'}\n${context.codeContext}\n\`\`\``
            });
        }

        return messages;
    }

    // Get system message for app
    getSystemMessage(app, context) {
        const baseMessages = {
            'code-assistant': `You are a professional code assistant specialized in ${context.language || 'programming'}. Provide clean, efficient, and well-documented code solutions.`,
            'project-architect': 'You are a senior software architect. Help design robust, scalable project structures and provide architectural guidance.',
            'devops-specialist': 'You are a DevOps expert. Provide solutions for deployment, containerization, CI/CD, and infrastructure management.',
            'ui-designer': 'You are a UI/UX designer. Help create beautiful, accessible, and user-friendly interfaces.',
            'data-analyst': 'You are a data scientist. Help with data analysis, visualization, and machine learning solutions.'
        };

        return {
            role: 'system',
            content: baseMessages[app.id] || 'You are a helpful AI assistant.'
        };
    }

    // Process API response
    processResponse(app, response) {
        // Handle different API response formats
        if (response.choices && response.choices[0]) {
            return {
                content: response.choices[0].message.content,
                usage: response.usage,
                model: response.model,
                app: app.name
            };
        } else if (response.content && response.content[0]) {
            return {
                content: response.content[0].text,
                usage: response.usage,
                model: response.model,
                app: app.name
            };
        }

        return {
            content: response.content || response.text || 'No response content',
            app: app.name
        };
    }

    // Import custom GPT app from file
    async importFromFile(file) {
        try {
            const content = await this.readFile(file);
            const appConfig = JSON.parse(content);

            // Validate app configuration
            this.validateAppConfig(appConfig);

            // Add to app store
            appConfig.source = 'custom';
            appConfig.installDate = new Date();
            this.appStore.set(appConfig.id, appConfig);

            console.log(`📥 Imported custom GPT app: ${appConfig.name}`);
            this.updateUI();

            return appConfig;

        } catch (error) {
            console.error('❌ Failed to import GPT app:', error);
            throw error;
        }
    }

    // Import GPT app from URL
    async importFromURL(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch app from URL: ${response.statusText}`);
            }

            const appConfig = await response.json();
            this.validateAppConfig(appConfig);

            appConfig.source = 'url';
            appConfig.sourceUrl = url;
            appConfig.installDate = new Date();
            this.appStore.set(appConfig.id, appConfig);

            console.log(`📥 Imported GPT app from URL: ${appConfig.name}`);
            this.updateUI();

            return appConfig;

        } catch (error) {
            console.error('❌ Failed to import GPT app from URL:', error);
            throw error;
        }
    }

    // Validate app configuration
    validateAppConfig(config) {
        const required = ['id', 'name', 'description', 'version'];
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        if (this.appStore.has(config.id)) {
            throw new Error(`App with ID ${config.id} already exists`);
        }
    }

    // Read file content
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Uninstall app
    async uninstallApp(appId) {
        const app = this.installedApps.get(appId);
        if (!app) {
            throw new Error(`App ${appId} not installed`);
        }

        console.log(`🗑️ Uninstalling GPT App: ${app.name}`);

        // Cleanup app resources
        if (app.cleanup) {
            await app.cleanup();
        }

        this.installedApps.delete(appId);
        console.log(`✅ Successfully uninstalled: ${app.name}`);
        this.updateUI();
    }

    // Get installed apps
    getInstalledApps() {
        return Array.from(this.installedApps.values());
    }

    // Get available apps
    getAvailableApps() {
        return Array.from(this.appStore.values());
    }

    // Initialize UI components
    initializeUI() {
        this.createGPTAppsSection();
        this.createAppStore();
        this.createImportInterface();
    }

    // Create GPT Apps section in UI
    createGPTAppsSection() {
        // This would integrate with the modern UI
        const gptSection = document.createElement('section');
        gptSection.className = 'gpt-apps-section';
        gptSection.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">
                    <span class="title-symbol" data-symbol="🤖">🤖</span>
                    GPT Applications
                </h2>
                <button class="btn-primary" id="open-app-store">
                    <span class="symbol" data-symbol="🏪">🏪</span>
                    App Store
                </button>
            </div>
            <div class="installed-apps-grid" id="installed-apps">
                <!-- Installed apps will be populated here -->
            </div>
        `;

        // Add to main content if modern UI exists
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(gptSection);
        }
    }

    // Create app store interface
    createAppStore() {
        // App store modal/interface
        const appStoreHTML = `
            <div class="app-store-modal" id="app-store-modal">
                <div class="app-store-content">
                    <div class="app-store-header">
                        <h2>🏪 GPT App Store</h2>
                        <button class="close-btn" id="close-app-store">×</button>
                    </div>
                    <div class="app-store-body">
                        <div class="app-categories">
                            <button class="category-btn active" data-category="all">All</button>
                            <button class="category-btn" data-category="development">Development</button>
                            <button class="category-btn" data-category="design">Design</button>
                            <button class="category-btn" data-category="data">Data</button>
                            <button class="category-btn" data-category="external">External</button>
                        </div>
                        <div class="apps-grid" id="apps-grid">
                            <!-- Apps will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', appStoreHTML);
        this.setupAppStoreEvents();
    }

    // Create import interface
    createImportInterface() {
        const importHTML = `
            <div class="import-modal" id="import-modal">
                <div class="import-content">
                    <div class="import-header">
                        <h2>📥 Import GPT App</h2>
                        <button class="close-btn" id="close-import">×</button>
                    </div>
                    <div class="import-body">
                        <div class="import-options">
                            <div class="import-option">
                                <h3>📁 From File</h3>
                                <input type="file" id="import-file" accept=".json">
                                <button id="import-from-file">Import File</button>
                            </div>
                            <div class="import-option">
                                <h3>🌐 From URL</h3>
                                <input type="url" id="import-url" placeholder="https://example.com/app.json">
                                <button id="import-from-url">Import URL</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', importHTML);
        this.setupImportEvents();
    }

    // Setup app store events
    setupAppStoreEvents() {
        // Event listeners for app store
        document.getElementById('open-app-store')?.addEventListener('click', () => {
            document.getElementById('app-store-modal').style.display = 'flex';
            this.populateAppStore();
        });

        document.getElementById('close-app-store')?.addEventListener('click', () => {
            document.getElementById('app-store-modal').style.display = 'none';
        });
    }

    // Setup import events
    setupImportEvents() {
        document.getElementById('import-from-file')?.addEventListener('click', async () => {
            const fileInput = document.getElementById('import-file');
            const file = fileInput.files[0];
            if (file) {
                try {
                    await this.importFromFile(file);
                    document.getElementById('import-modal').style.display = 'none';
                } catch (error) {
                    alert(`Import failed: ${error.message}`);
                }
            }
        });

        document.getElementById('import-from-url')?.addEventListener('click', async () => {
            const urlInput = document.getElementById('import-url');
            const url = urlInput.value.trim();
            if (url) {
                try {
                    await this.importFromURL(url);
                    document.getElementById('import-modal').style.display = 'none';
                } catch (error) {
                    alert(`Import failed: ${error.message}`);
                }
            }
        });
    }

    // Populate app store
    populateAppStore() {
        const appsGrid = document.getElementById('apps-grid');
        if (!appsGrid) return;

        appsGrid.innerHTML = '';
        
        this.getAvailableApps().forEach(app => {
            const appCard = this.createAppCard(app);
            appsGrid.appendChild(appCard);
        });
    }

    // Create app card
    createAppCard(app) {
        const isInstalled = this.installedApps.has(app.id);
        
        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `
            <div class="app-icon symbol-3d" data-symbol="${app.symbol}">
                <i class="${app.icon}"></i>
            </div>
            <div class="app-info">
                <h3 class="app-name">${app.name}</h3>
                <p class="app-description">${app.description}</p>
                <div class="app-meta">
                    <span class="app-version">v${app.version}</span>
                    <span class="app-author">${app.author || 'Unknown'}</span>
                </div>
            </div>
            <div class="app-actions">
                ${isInstalled ? 
                    '<button class="btn-secondary" disabled>Installed</button>' :
                    `<button class="btn-primary install-btn" data-app-id="${app.id}">Install</button>`
                }
            </div>
        `;

        // Add install event listener
        const installBtn = card.querySelector('.install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                try {
                    installBtn.textContent = 'Installing...';
                    installBtn.disabled = true;
                    await this.installApp(app.id);
                    installBtn.textContent = 'Installed';
                    installBtn.className = 'btn-secondary';
                } catch (error) {
                    alert(`Installation failed: ${error.message}`);
                    installBtn.textContent = 'Install';
                    installBtn.disabled = false;
                }
            });
        }

        return card;
    }

    // Update UI
    updateUI() {
        this.updateInstalledApps();
        this.populateAppStore();
    }

    // Update installed apps display
    updateInstalledApps() {
        const installedAppsGrid = document.getElementById('installed-apps');
        if (!installedAppsGrid) return;

        installedAppsGrid.innerHTML = '';
        
        this.getInstalledApps().forEach(app => {
            const appTile = this.createInstalledAppTile(app);
            installedAppsGrid.appendChild(appTile);
        });
    }

    // Create installed app tile
    createInstalledAppTile(app) {
        const tile = document.createElement('div');
        tile.className = 'installed-app-tile';
        tile.innerHTML = `
            <div class="app-icon symbol-3d symbol-interactive" data-symbol="${app.symbol}">
                <i class="${app.icon}"></i>
            </div>
            <div class="app-name">${app.name}</div>
            <div class="app-status status-${app.status}">${app.status}</div>
            <div class="app-controls">
                <button class="control-btn use-btn" data-app-id="${app.id}" title="Use App">
                    <i class="fas fa-play"></i>
                </button>
                <button class="control-btn uninstall-btn" data-app-id="${app.id}" title="Uninstall">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add event listeners
        tile.querySelector('.use-btn')?.addEventListener('click', () => {
            this.openAppInterface(app.id);
        });

        tile.querySelector('.uninstall-btn')?.addEventListener('click', async () => {
            if (confirm(`Uninstall ${app.name}?`)) {
                await this.uninstallApp(app.id);
            }
        });

        return tile;
    }

    // Auto-install built-in apps
    async autoInstallBuiltInApps() {
        try {
            // Auto-install software architect and code copilot
            const autoInstallApps = ['software-architect-gpt', 'code-copilot-gpt'];
            
            for (const appId of autoInstallApps) {
                if (!this.installedApps.has(appId) && this.appStore.has(appId)) {
                    console.log(`🔄 Auto-installing ${appId}...`);
                    await this.installApp(appId);
                }
            }
        } catch (error) {
            console.warn('Auto-installation failed:', error);
        }
    }

    // Open app interface
    openAppInterface(appId) {
        const app = this.installedApps.get(appId);
        if (!app) return;

        // Create GPT app interface
        if (window.GPTAppInterface) {
            const appInterface = new GPTAppInterface(appId, this);
            appInterface.show();
        } else {
            console.log(`🚀 Opening ${app.name} interface`);
            // Fallback: show simple prompt interface
            this.showSimpleInterface(app);
        }
    }

    // Simple interface fallback
    showSimpleInterface(app) {
        const prompt = window.prompt(`💬 Ask ${app.name} anything:`);
        if (prompt) {
            this.useApp(app.id, prompt).then(response => {
                alert(`${app.name} Response:\n\n${response.content}`);
            }).catch(error => {
                alert(`Error: ${error.message}`);
            });
        }
    }

    // Export app configuration
    exportApp(appId) {
        const app = this.installedApps.get(appId);
        if (!app) return;

        const exportData = {
            ...app,
            exportDate: new Date(),
            exportVersion: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${app.id}-export.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// Initialize GPT Apps Manager
document.addEventListener('DOMContentLoaded', () => {
    window.gptAppsManager = new GPTAppsManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GPTAppsManager;
}