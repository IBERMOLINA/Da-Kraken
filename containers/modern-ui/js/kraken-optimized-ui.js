// Optimized Da-Kraken UI with Integrated AI Chatbot and Mesh Communication
// Eliminates bridge orchestrator dependency

class DaKrakenOptimizedUI {
    constructor() {
        this.meshClient = null;
        this.aiChatbot = null;
        this.isInitialized = false;
        
        // UI State Management
        this.activeLanguage = 'javascript';
        this.currentSession = null;
        this.codeHistory = [];
        this.maxHistorySize = 50;
        
        // AI Chatbot State
        this.conversations = new Map();
        this.activeConversation = null;
        this.aiModels = ['default', 'code', 'analysis'];
        
        // Performance tracking
        this.performanceMetrics = {
            codeExecutions: 0,
            aiInteractions: 0,
            responseTime: [],
            startTime: Date.now()
        };
        
        // Real-time features
        this.autoSave = true;
        this.autoSaveInterval = 5000; // 5 seconds
        this.realtimeUpdates = true;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Da-Kraken Optimized UI...');
        
        try {
            // Initialize mesh client
            this.meshClient = new KrakenMeshClient({
                maxCacheSize: 1000,
                updateInterval: 1000,
                maxConcurrency: 5
            });
            
            await this.meshClient.init();
            
            // Initialize AI chatbot
            this.initializeAIChatbot();
            
            // Setup UI components
            this.setupUI();
            
            // Setup event handlers
            this.setupEventHandlers();
            
            // Setup auto-save
            this.setupAutoSave();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
            this.isInitialized = true;
            console.log('✅ Da-Kraken UI initialized successfully');
            
            // Show welcome message with AI
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Failed to initialize Da-Kraken UI:', error);
            this.showErrorMessage('Failed to initialize application', error.message);
        }
    }
    
    initializeAIChatbot() {
        this.aiChatbot = {
            isActive: false,
            currentModel: 'default',
            responseMode: 'conversational', // conversational, code, analysis
            autoComplete: true,
            suggestions: true
        };
        
        console.log('🧠 AI Chatbot initialized');
    }
    
    setupUI() {
        // Create main UI structure
        const app = document.getElementById('app') || document.body;
        
        app.innerHTML = `
            <div class="kraken-ui">
                <!-- Header with mesh status -->
                <header class="kraken-header">
                    <div class="logo">
                        <h1>🐙 Da-Kraken <span class="version">Optimized</span></h1>
                        <div class="mesh-status" id="meshStatus">
                            <span class="status-dot"></span>
                            <span class="peer-count">0</span> peers
                        </div>
                    </div>
                    <div class="header-controls">
                        <button id="aiToggle" class="ai-toggle">🧠 AI Chat</button>
                        <button id="settingsBtn" class="settings-btn">⚙️</button>
                    </div>
                </header>
                
                <!-- Main content area -->
                <main class="kraken-main">
                    <!-- Sidebar with language selection and AI -->
                    <aside class="sidebar">
                        <div class="language-selector">
                            <h3>Languages</h3>
                            <div id="languageList" class="language-list"></div>
                        </div>
                        
                        <!-- Integrated AI Chatbot -->
                        <div class="ai-chatbot" id="aiChatbot" style="display: none;">
                            <div class="chat-header">
                                <h3>🧠 AI Assistant</h3>
                                <select id="aiModel" class="ai-model-select">
                                    <option value="default">General AI</option>
                                    <option value="code">Code Expert</option>
                                    <option value="analysis">Analyzer</option>
                                </select>
                            </div>
                            <div class="chat-messages" id="chatMessages"></div>
                            <div class="chat-input-area">
                                <input type="text" id="chatInput" placeholder="Ask AI anything..." />
                                <button id="sendChatBtn">Send</button>
                            </div>
                        </div>
                    </aside>
                    
                    <!-- Code workspace -->
                    <section class="workspace">
                        <div class="workspace-header">
                            <div class="workspace-tabs">
                                <button class="tab active" data-tab="code">Code</button>
                                <button class="tab" data-tab="execution">Execution</button>
                                <button class="tab" data-tab="history">History</button>
                            </div>
                            <div class="workspace-controls">
                                <button id="generateCodeBtn" class="generate-btn">✨ Generate</button>
                                <button id="executeBtn" class="execute-btn">▶️ Run</button>
                                <button id="clearBtn" class="clear-btn">🗑️ Clear</button>
                            </div>
                        </div>
                        
                        <!-- Code tab -->
                        <div class="tab-content" data-tab="code">
                            <div class="code-editor">
                                <textarea id="codeEditor" placeholder="Enter your code here or ask AI to generate it..."></textarea>
                                <div class="editor-suggestions" id="editorSuggestions"></div>
                            </div>
                        </div>
                        
                        <!-- Execution tab -->
                        <div class="tab-content" data-tab="execution" style="display: none;">
                            <div class="execution-output">
                                <div class="output-header">
                                    <h4>Output</h4>
                                    <div class="execution-stats" id="executionStats"></div>
                                </div>
                                <pre id="outputArea">Ready to execute code...</pre>
                                <div class="error-output" id="errorArea" style="display: none;"></div>
                            </div>
                        </div>
                        
                        <!-- History tab -->
                        <div class="tab-content" data-tab="history" style="display: none;">
                            <div class="code-history">
                                <div class="history-header">
                                    <h4>Code History</h4>
                                    <button id="clearHistoryBtn">Clear History</button>
                                </div>
                                <div id="historyList" class="history-list"></div>
                            </div>
                        </div>
                    </section>
                </main>
                
                <!-- Status bar -->
                <footer class="status-bar">
                    <div class="status-info">
                        <span id="statusText">Ready</span>
                        <span class="separator">|</span>
                        <span id="performanceMetrics">0 executions, 0 AI chats</span>
                    </div>
                    <div class="system-info">
                        <span id="systemStatus">Mesh: Connected</span>
                    </div>
                </footer>
            </div>
        `;
        
        // Add styles
        this.injectStyles();
        
        // Load available languages
        this.loadLanguages();
        
        console.log('🎨 UI structure created');
    }
    
    setupEventHandlers() {
        // AI Toggle
        document.getElementById('aiToggle').addEventListener('click', () => {
            this.toggleAIChat();
        });
        
        // AI Model selection
        document.getElementById('aiModel').addEventListener('change', (e) => {
            this.aiChatbot.currentModel = e.target.value;
            this.addChatMessage('system', `Switched to ${e.target.value} model`);
        });
        
        // Chat input
        const chatInput = document.getElementById('chatInput');
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        document.getElementById('sendChatBtn').addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        // Code generation
        document.getElementById('generateCodeBtn').addEventListener('click', () => {
            this.generateCodeWithAI();
        });
        
        // Code execution
        document.getElementById('executeBtn').addEventListener('click', () => {
            this.executeCode();
        });
        
        // Clear code
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearCode();
        });
        
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Code editor auto-suggestions
        const codeEditor = document.getElementById('codeEditor');
        codeEditor.addEventListener('input', () => {
            if (this.aiChatbot.autoComplete) {
                this.debounce(() => this.showCodeSuggestions(), 500)();
            }
        });
        
        // History management
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });
        
        console.log('🔌 Event handlers setup complete');
    }
    
    async loadLanguages() {
        try {
            const languages = await this.meshClient.getAvailableLanguages();
            const languageList = document.getElementById('languageList');
            
            languageList.innerHTML = languages.map(lang => `
                <button class="language-btn ${lang === this.activeLanguage ? 'active' : ''}" 
                        data-language="${lang}">
                    ${this.getLanguageIcon(lang)} ${lang}
                </button>
            `).join('');
            
            // Add language selection handlers
            languageList.querySelectorAll('.language-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.selectLanguage(e.target.dataset.language);
                });
            });
            
            console.log(`📚 Loaded ${languages.length} languages`);
        } catch (error) {
            console.error('Failed to load languages:', error);
        }
    }
    
    getLanguageIcon(language) {
        const icons = {
            javascript: '🟨',
            python: '🐍',
            java: '☕',
            go: '🐹',
            rust: '🦀',
            php: '🐘',
            crystal: '💎',
            elixir: '🧪',
            zig: '⚡',
            fortran: '🔢'
        };
        
        return icons[language] || '📄';
    }
    
    selectLanguage(language) {
        this.activeLanguage = language;
        
        // Update UI
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.language === language);
        });
        
        // Update code editor placeholder
        const editor = document.getElementById('codeEditor');
        editor.placeholder = `Enter your ${language} code here or ask AI to generate it...`;
        
        this.updateStatus(`Language: ${language}`);
        console.log(`📝 Selected language: ${language}`);
    }
    
    // AI Chatbot Methods
    toggleAIChat() {
        const chatbot = document.getElementById('aiChatbot');
        const toggle = document.getElementById('aiToggle');
        
        this.aiChatbot.isActive = !this.aiChatbot.isActive;
        
        chatbot.style.display = this.aiChatbot.isActive ? 'block' : 'none';
        toggle.textContent = this.aiChatbot.isActive ? '🧠 Hide AI' : '🧠 AI Chat';
        
        if (this.aiChatbot.isActive) {
            document.getElementById('chatInput').focus();
        }
    }
    
    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        input.value = '';
        this.addChatMessage('user', message);
        
        try {
            const startTime = Date.now();
            this.updateStatus('AI is thinking...');
            
            const response = await this.meshClient.chat(message, {
                sessionId: this.getActiveConversationId(),
                model: this.aiChatbot.currentModel
            });
            
            const responseTime = Date.now() - startTime;
            this.performanceMetrics.aiInteractions++;
            this.performanceMetrics.responseTime.push(responseTime);
            
            this.addChatMessage('assistant', response.response);
            this.updateStatus('Ready');
            this.updatePerformanceMetrics();
            
        } catch (error) {
            this.addChatMessage('error', `Error: ${error.message}`);
            this.updateStatus('Ready');
        }
    }
    
    addChatMessage(role, content) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;
        
        const timestamp = new Date().toLocaleTimeString();
        const icon = role === 'user' ? '👤' : role === 'assistant' ? '🧠' : '⚠️';
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-icon">${icon}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-content">${this.formatMessageContent(content)}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    formatMessageContent(content) {
        // Basic markdown-like formatting
        return content
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
    
    async generateCodeWithAI() {
        const prompt = prompt('What code would you like me to generate?') || 'Create a simple hello world program';
        
        try {
            this.updateStatus('Generating code...');
            const startTime = Date.now();
            
            const response = await this.meshClient.generateCode(prompt, this.activeLanguage, {
                context: 'web-based-editor',
                generationOptions: {
                    includeComments: true,
                    optimized: true
                }
            });
            
            const responseTime = Date.now() - startTime;
            this.performanceMetrics.responseTime.push(responseTime);
            
            // Insert generated code
            const editor = document.getElementById('codeEditor');
            editor.value = response.code;
            
            // Add to history
            this.addToHistory(response.code, this.activeLanguage, 'Generated');
            
            this.updateStatus('Code generated successfully');
            this.addChatMessage('assistant', `Generated ${this.activeLanguage} code for: "${prompt}"`);
            
        } catch (error) {
            this.updateStatus('Code generation failed');
            this.addChatMessage('error', `Code generation failed: ${error.message}`);
        }
    }
    
    async executeCode() {
        const code = document.getElementById('codeEditor').value.trim();
        
        if (!code) {
            this.showErrorMessage('No code to execute', 'Please enter some code first.');
            return;
        }
        
        try {
            this.updateStatus('Executing code...');
            const startTime = Date.now();
            
            const response = await this.meshClient.executeCode(code, this.activeLanguage, {
                sessionId: this.currentSession
            });
            
            const executionTime = Date.now() - startTime;
            this.performanceMetrics.codeExecutions++;
            this.performanceMetrics.responseTime.push(executionTime);
            
            // Display results
            this.displayExecutionResults(response, executionTime);
            
            // Add to history
            this.addToHistory(code, this.activeLanguage, 'Executed');
            
            this.updateStatus('Code executed successfully');
            this.updatePerformanceMetrics();
            
        } catch (error) {
            this.displayExecutionError(error);
            this.updateStatus('Execution failed');
        }
    }
    
    displayExecutionResults(response, executionTime) {
        const outputArea = document.getElementById('outputArea');
        const errorArea = document.getElementById('errorArea');
        const statsArea = document.getElementById('executionStats');
        
        // Switch to execution tab
        this.switchTab('execution');
        
        // Display output
        outputArea.textContent = response.output || 'No output';
        
        // Display errors if any
        if (response.error) {
            errorArea.style.display = 'block';
            errorArea.textContent = response.error;
        } else {
            errorArea.style.display = 'none';
        }
        
        // Display stats
        statsArea.innerHTML = `
            <span>⏱️ ${executionTime}ms</span>
            <span>📝 ${response.output ? response.output.length : 0} chars</span>
            <span>🔧 ${this.activeLanguage}</span>
        `;
    }
    
    displayExecutionError(error) {
        const errorArea = document.getElementById('errorArea');
        errorArea.style.display = 'block';
        errorArea.textContent = error.message;
        
        this.switchTab('execution');
    }
    
    // Utility Methods
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = content.dataset.tab === tabName ? 'block' : 'none';
        });
    }
    
    addToHistory(code, language, type) {
        const historyItem = {
            id: Date.now(),
            code,
            language,
            type,
            timestamp: new Date()
        };
        
        this.codeHistory.unshift(historyItem);
        
        // Limit history size
        if (this.codeHistory.length > this.maxHistorySize) {
            this.codeHistory = this.codeHistory.slice(0, this.maxHistorySize);
        }
        
        this.updateHistoryDisplay();
        this.saveToLocalStorage();
    }
    
    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        
        historyList.innerHTML = this.codeHistory.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-header">
                    <span class="history-language">${this.getLanguageIcon(item.language)} ${item.language}</span>
                    <span class="history-type">${item.type}</span>
                    <span class="history-time">${item.timestamp.toLocaleTimeString()}</span>
                </div>
                <div class="history-code">
                    <pre>${item.code.substring(0, 100)}${item.code.length > 100 ? '...' : ''}</pre>
                </div>
                <div class="history-actions">
                    <button onclick="ui.loadFromHistory(${item.id})">Load</button>
                    <button onclick="ui.deleteFromHistory(${item.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    loadFromHistory(id) {
        const item = this.codeHistory.find(h => h.id === id);
        if (item) {
            document.getElementById('codeEditor').value = item.code;
            this.selectLanguage(item.language);
            this.switchTab('code');
        }
    }
    
    deleteFromHistory(id) {
        this.codeHistory = this.codeHistory.filter(h => h.id !== id);
        this.updateHistoryDisplay();
        this.saveToLocalStorage();
    }
    
    clearHistory() {
        if (confirm('Clear all history?')) {
            this.codeHistory = [];
            this.updateHistoryDisplay();
            this.saveToLocalStorage();
        }
    }
    
    clearCode() {
        if (confirm('Clear current code?')) {
            document.getElementById('codeEditor').value = '';
            document.getElementById('outputArea').textContent = 'Ready to execute code...';
            document.getElementById('errorArea').style.display = 'none';
        }
    }
    
    // Real-time updates and auto-save
    setupRealTimeUpdates() {
        this.meshClient.on('peerUpdate', (data) => {
            this.updateMeshStatus();
        });
        
        this.meshClient.on('peerError', (data) => {
            console.warn('Peer error:', data.peer.service, data.error);
        });
        
        // Update mesh status periodically
        setInterval(() => {
            this.updateMeshStatus();
        }, 5000);
    }
    
    async updateMeshStatus() {
        try {
            const status = await this.meshClient.getSystemStatus();
            const meshStatus = document.getElementById('meshStatus');
            
            meshStatus.innerHTML = `
                <span class="status-dot ${status.healthyPeers > 0 ? 'connected' : 'disconnected'}"></span>
                <span class="peer-count">${status.healthyPeers}</span> peers
            `;
            
            document.getElementById('systemStatus').textContent = 
                `Mesh: ${status.healthyPeers}/${status.totalPeers} peers`;
                
        } catch (error) {
            console.error('Failed to update mesh status:', error);
        }
    }
    
    setupAutoSave() {
        if (!this.autoSave) return;
        
        setInterval(() => {
            this.saveToLocalStorage();
        }, this.autoSaveInterval);
    }
    
    saveToLocalStorage() {
        const data = {
            codeHistory: this.codeHistory,
            activeLanguage: this.activeLanguage,
            conversations: Array.from(this.conversations.entries()),
            aiSettings: this.aiChatbot,
            lastSaved: Date.now()
        };
        
        try {
            localStorage.setItem('da-kraken-ui', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }
    
    loadFromLocalStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('da-kraken-ui') || '{}');
            
            if (data.codeHistory) {
                this.codeHistory = data.codeHistory.map(item => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
                this.updateHistoryDisplay();
            }
            
            if (data.activeLanguage) {
                this.selectLanguage(data.activeLanguage);
            }
            
            if (data.conversations) {
                this.conversations = new Map(data.conversations);
            }
            
            if (data.aiSettings) {
                Object.assign(this.aiChatbot, data.aiSettings);
            }
            
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
        }
    }
    
    // Performance and status updates
    updatePerformanceMetrics() {
        const metrics = document.getElementById('performanceMetrics');
        const avgTime = this.performanceMetrics.responseTime.length > 0
            ? Math.round(this.performanceMetrics.responseTime.reduce((a, b) => a + b, 0) / this.performanceMetrics.responseTime.length)
            : 0;
        
        metrics.textContent = `${this.performanceMetrics.codeExecutions} executions, ${this.performanceMetrics.aiInteractions} AI chats, ${avgTime}ms avg`;
    }
    
    updateStatus(message) {
        document.getElementById('statusText').textContent = message;
    }
    
    showWelcomeMessage() {
        this.addChatMessage('assistant', 'Welcome to Da-Kraken Optimized! 🐙\n\nI\'m your AI assistant integrated into every container. I can help you:\n\n• Generate code in any language\n• Execute and debug code\n• Answer programming questions\n• Analyze code performance\n\nTry asking me to generate some code or execute what you write!');
    }
    
    showErrorMessage(title, message) {
        // Simple error display - could be enhanced with a modal
        alert(`${title}\n\n${message}`);
    }
    
    // Utility functions
    getActiveConversationId() {
        if (!this.activeConversation) {
            this.activeConversation = `conversation-${Date.now()}`;
        }
        return this.activeConversation;
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    async showCodeSuggestions() {
        // Implementation for code auto-complete suggestions
        // This could use AI to suggest code completions
    }
    
    injectStyles() {
        const styles = `
            <style>
            .kraken-ui {
                display: flex;
                flex-direction: column;
                height: 100vh;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #1a1a1a;
                color: #ffffff;
            }
            
            .kraken-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: #2d2d2d;
                border-bottom: 1px solid #404040;
            }
            
            .logo h1 {
                margin: 0;
                color: #00d4ff;
            }
            
            .version {
                font-size: 0.7em;
                color: #888;
            }
            
            .mesh-status {
                font-size: 0.8em;
                color: #888;
                margin-top: 0.25rem;
            }
            
            .status-dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 0.5rem;
            }
            
            .status-dot.connected {
                background: #00ff88;
            }
            
            .status-dot.disconnected {
                background: #ff4444;
            }
            
            .header-controls button {
                margin-left: 0.5rem;
                padding: 0.5rem 1rem;
                background: #404040;
                border: none;
                border-radius: 4px;
                color: white;
                cursor: pointer;
            }
            
            .header-controls button:hover {
                background: #505050;
            }
            
            .kraken-main {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            
            .sidebar {
                width: 300px;
                background: #252525;
                border-right: 1px solid #404040;
                overflow-y: auto;
            }
            
            .language-list {
                padding: 1rem;
            }
            
            .language-btn {
                display: block;
                width: 100%;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                background: #404040;
                border: none;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                text-align: left;
            }
            
            .language-btn:hover,
            .language-btn.active {
                background: #00d4ff;
                color: #000;
            }
            
            .ai-chatbot {
                border-top: 1px solid #404040;
                padding: 1rem;
            }
            
            .chat-messages {
                height: 300px;
                overflow-y: auto;
                background: #1a1a1a;
                border: 1px solid #404040;
                border-radius: 4px;
                padding: 0.5rem;
                margin: 0.5rem 0;
            }
            
            .chat-message {
                margin-bottom: 1rem;
                padding: 0.5rem;
                border-radius: 4px;
            }
            
            .chat-message.user {
                background: #2d4a2d;
            }
            
            .chat-message.assistant {
                background: #2d2d4a;
            }
            
            .chat-message.error {
                background: #4a2d2d;
            }
            
            .message-header {
                font-size: 0.8em;
                color: #888;
                margin-bottom: 0.25rem;
            }
            
            .chat-input-area {
                display: flex;
            }
            
            .chat-input-area input {
                flex: 1;
                padding: 0.5rem;
                background: #404040;
                border: none;
                border-radius: 4px 0 0 4px;
                color: white;
            }
            
            .chat-input-area button {
                padding: 0.5rem 1rem;
                background: #00d4ff;
                border: none;
                border-radius: 0 4px 4px 0;
                color: #000;
                cursor: pointer;
            }
            
            .workspace {
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            
            .workspace-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: #2d2d2d;
                border-bottom: 1px solid #404040;
            }
            
            .workspace-tabs {
                display: flex;
            }
            
            .tab {
                padding: 0.5rem 1rem;
                background: #404040;
                border: none;
                color: white;
                cursor: pointer;
                margin-right: 0.25rem;
                border-radius: 4px 4px 0 0;
            }
            
            .tab.active {
                background: #00d4ff;
                color: #000;
            }
            
            .workspace-controls button {
                margin-left: 0.5rem;
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .generate-btn {
                background: #ff6b35;
                color: white;
            }
            
            .execute-btn {
                background: #00ff88;
                color: #000;
            }
            
            .clear-btn {
                background: #ff4444;
                color: white;
            }
            
            .tab-content {
                flex: 1;
                padding: 1rem;
            }
            
            .code-editor textarea {
                width: 100%;
                height: 400px;
                background: #1a1a1a;
                border: 1px solid #404040;
                border-radius: 4px;
                padding: 1rem;
                color: white;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                resize: vertical;
            }
            
            .execution-output pre {
                background: #1a1a1a;
                border: 1px solid #404040;
                border-radius: 4px;
                padding: 1rem;
                min-height: 200px;
                white-space: pre-wrap;
                color: #00ff88;
            }
            
            .error-output {
                background: #4a2d2d;
                border: 1px solid #ff4444;
                border-radius: 4px;
                padding: 1rem;
                margin-top: 0.5rem;
                color: #ff8888;
            }
            
            .status-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem 1rem;
                background: #2d2d2d;
                border-top: 1px solid #404040;
                font-size: 0.9em;
            }
            
            .separator {
                margin: 0 0.5rem;
                color: #666;
            }
            
            .history-item {
                background: #404040;
                border-radius: 4px;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
            }
            
            .history-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                font-size: 0.9em;
            }
            
            .history-code pre {
                background: #1a1a1a;
                padding: 0.5rem;
                border-radius: 4px;
                font-size: 0.8em;
                margin: 0;
            }
            
            .history-actions {
                margin-top: 0.5rem;
            }
            
            .history-actions button {
                padding: 0.25rem 0.5rem;
                margin-right: 0.5rem;
                background: #606060;
                border: none;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                font-size: 0.8em;
            }
            
            .ai-model-select {
                width: 100%;
                padding: 0.5rem;
                background: #404040;
                border: none;
                border-radius: 4px;
                color: white;
                margin-bottom: 0.5rem;
            }
            
            /* Responsive design */
            @media (max-width: 768px) {
                .kraken-main {
                    flex-direction: column;
                }
                
                .sidebar {
                    width: 100%;
                    height: 200px;
                }
                
                .workspace-header {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .workspace-tabs {
                    justify-content: center;
                    margin-bottom: 0.5rem;
                }
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Initialize the application
let ui;
document.addEventListener('DOMContentLoaded', () => {
    ui = new DaKrakenOptimizedUI();
});

// Export for external access
if (typeof window !== 'undefined') {
    window.DaKrakenUI = DaKrakenOptimizedUI;
}