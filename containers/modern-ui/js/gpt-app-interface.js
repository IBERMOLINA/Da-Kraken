// GPT App Interface Integration with xomni Agent Panel

class GPTAppInterface {
    constructor(appId, gptAppsManager) {
        this.appId = appId;
        this.gptAppsManager = gptAppsManager;
        this.app = gptAppsManager.installedApps.get(appId);
        this.conversationHistory = [];
        this.isActive = false;
        
        this.init();
    }

    init() {
        this.createInterface();
        this.setupEventListeners();
        this.loadHistory();
    }

    // Create the GPT app interface
    createInterface() {
        const interfaceHTML = `
            <div class="gpt-app-interface" id="gpt-app-${this.appId}">
                <div class="app-header">
                    <div class="app-info">
                        <div class="app-icon symbol-3d" data-symbol="${this.app.symbol}">
                            <i class="${this.app.icon}"></i>
                        </div>
                        <div class="app-details">
                            <h3 class="app-name">${this.app.name}</h3>
                            <p class="app-description">${this.app.description}</p>
                        </div>
                    </div>
                    <div class="app-controls">
                        <button class="control-btn settings-btn" title="Settings">
                            <i class="fas fa-cog"></i>
                        </button>
                        <button class="control-btn minimize-btn" title="Minimize">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="control-btn close-btn" title="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="app-content">
                    <div class="conversation-area">
                        <div class="messages-container" id="messages-${this.appId}">
                            <!-- Messages will be populated here -->
                        </div>
                        
                        <div class="quick-actions" id="quick-actions-${this.appId}">
                            <!-- Quick actions based on app capabilities -->
                        </div>
                    </div>

                    <div class="input-area">
                        <div class="context-info" id="context-info-${this.appId}">
                            <!-- Context information -->
                        </div>
                        
                        <form class="message-form" id="message-form-${this.appId}">
                            <div class="input-container">
                                <textarea 
                                    id="message-input-${this.appId}"
                                    placeholder="Ask ${this.app.name} anything..."
                                    rows="1"
                                    maxlength="4000"
                                ></textarea>
                                <button type="submit" class="send-btn">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                            <div class="input-controls">
                                <button type="button" class="control-btn attach-btn" title="Attach context">
                                    <i class="fas fa-paperclip"></i>
                                </button>
                                <button type="button" class="control-btn voice-btn" title="Voice input">
                                    <i class="fas fa-microphone"></i>
                                </button>
                                <div class="char-count">
                                    <span id="char-count-${this.appId}">0</span>/4000
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="app-status">
                    <div class="status-indicator" id="status-${this.appId}">
                        <div class="status-dot status-ready"></div>
                        <span>Ready</span>
                    </div>
                    <div class="app-metrics">
                        <span class="metric">
                            <i class="fas fa-comments"></i>
                            <span id="message-count-${this.appId}">0</span>
                        </span>
                        <span class="metric">
                            <i class="fas fa-clock"></i>
                            <span id="response-time-${this.appId}">-</span>
                        </span>
                    </div>
                </div>
            </div>
        `;

        // Create modal container if it doesn't exist
        let modalContainer = document.getElementById('gpt-app-modals');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'gpt-app-modals';
            modalContainer.className = 'gpt-app-modals';
            document.body.appendChild(modalContainer);
        }

        modalContainer.insertAdjacentHTML('beforeend', interfaceHTML);
        this.interfaceElement = document.getElementById(`gpt-app-${this.appId}`);
        
        this.setupQuickActions();
    }

    // Setup quick actions based on app capabilities
    setupQuickActions() {
        const quickActionsContainer = document.getElementById(`quick-actions-${this.appId}`);
        if (!quickActionsContainer) return;

        const quickActions = this.getQuickActionsForApp();
        
        quickActions.forEach(action => {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'quick-action-btn';
            actionBtn.innerHTML = `
                <i class="${action.icon}"></i>
                <span>${action.label}</span>
            `;
            actionBtn.addEventListener('click', () => this.executeQuickAction(action));
            quickActionsContainer.appendChild(actionBtn);
        });
    }

    // Get quick actions based on app type
    getQuickActionsForApp() {
        const commonActions = [
            { id: 'help', label: 'Help', icon: 'fas fa-question-circle', prompt: 'What can you help me with?' },
            { id: 'clear', label: 'Clear', icon: 'fas fa-broom', action: 'clear' }
        ];

        const appSpecificActions = {
            'code-assistant': [
                { id: 'review', label: 'Code Review', icon: 'fas fa-search', prompt: 'Please review this code for best practices and potential improvements.' },
                { id: 'debug', label: 'Debug Help', icon: 'fas fa-bug', prompt: 'Help me debug this code.' },
                { id: 'optimize', label: 'Optimize', icon: 'fas fa-rocket', prompt: 'How can I optimize this code for better performance?' },
                { id: 'document', label: 'Document', icon: 'fas fa-file-text', prompt: 'Generate documentation for this code.' }
            ],
            'project-architect': [
                { id: 'structure', label: 'Project Structure', icon: 'fas fa-sitemap', prompt: 'Help me design the project structure.' },
                { id: 'patterns', label: 'Design Patterns', icon: 'fas fa-puzzle-piece', prompt: 'Suggest appropriate design patterns for this project.' },
                { id: 'dependencies', label: 'Dependencies', icon: 'fas fa-link', prompt: 'Recommend dependencies and libraries for this project.' }
            ],
            'devops-specialist': [
                { id: 'deploy', label: 'Deployment', icon: 'fas fa-rocket', prompt: 'Help me plan the deployment strategy.' },
                { id: 'docker', label: 'Containerize', icon: 'fab fa-docker', prompt: 'Help me containerize this application.' },
                { id: 'cicd', label: 'CI/CD', icon: 'fas fa-sync', prompt: 'Set up CI/CD pipeline for this project.' }
            ],
            'ui-designer': [
                { id: 'layout', label: 'Layout', icon: 'fas fa-th-large', prompt: 'Design a layout for this interface.' },
                { id: 'colors', label: 'Color Scheme', icon: 'fas fa-palette', prompt: 'Suggest a color scheme for this design.' },
                { id: 'responsive', label: 'Responsive', icon: 'fas fa-mobile-alt', prompt: 'Make this design responsive.' }
            ],
            'data-analyst': [
                { id: 'analyze', label: 'Analyze Data', icon: 'fas fa-chart-line', prompt: 'Analyze this dataset.' },
                { id: 'visualize', label: 'Visualize', icon: 'fas fa-chart-bar', prompt: 'Create visualizations for this data.' },
                { id: 'insights', label: 'Insights', icon: 'fas fa-lightbulb', prompt: 'What insights can you derive from this data?' }
            ]
        };

        return [...commonActions, ...(appSpecificActions[this.appId] || [])];
    }

    // Execute quick action
    async executeQuickAction(action) {
        if (action.action === 'clear') {
            this.clearConversation();
            return;
        }

        if (action.prompt) {
            await this.sendMessage(action.prompt, { isQuickAction: true });
        }
    }

    // Setup event listeners
    setupEventListeners() {
        const messageForm = document.getElementById(`message-form-${this.appId}`);
        const messageInput = document.getElementById(`message-input-${this.appId}`);
        const charCount = document.getElementById(`char-count-${this.appId}`);
        const closeBtn = this.interfaceElement.querySelector('.close-btn');
        const minimizeBtn = this.interfaceElement.querySelector('.minimize-btn');
        const settingsBtn = this.interfaceElement.querySelector('.settings-btn');

        // Message form submission
        messageForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (message) {
                await this.sendMessage(message);
                messageInput.value = '';
                this.updateCharCount('');
            }
        });

        // Character count
        messageInput?.addEventListener('input', (e) => {
            this.updateCharCount(e.target.value);
        });

        // Auto-resize textarea
        messageInput?.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
        });

        // Control buttons
        closeBtn?.addEventListener('click', () => this.close());
        minimizeBtn?.addEventListener('click', () => this.minimize());
        settingsBtn?.addEventListener('click', () => this.openSettings());

        // Attach context button
        this.interfaceElement.querySelector('.attach-btn')?.addEventListener('click', () => {
            this.attachContext();
        });

        // Voice input (if supported)
        this.interfaceElement.querySelector('.voice-btn')?.addEventListener('click', () => {
            this.startVoiceInput();
        });
    }

    // Send message to the GPT app
    async sendMessage(message, options = {}) {
        const messagesContainer = document.getElementById(`messages-${this.appId}`);
        const statusIndicator = document.getElementById(`status-${this.appId}`);
        const responseTimeElement = document.getElementById(`response-time-${this.appId}`);

        try {
            // Add user message to conversation
            this.addMessage('user', message, options);

            // Update status
            this.updateStatus('thinking', 'Thinking...');

            // Get context if available
            const context = this.getContext();

            // Record start time
            const startTime = Date.now();

            // Send to GPT app
            const response = await this.gptAppsManager.useApp(this.appId, message, context);

            // Calculate response time
            const responseTime = Date.now() - startTime;
            responseTimeElement.textContent = `${(responseTime / 1000).toFixed(1)}s`;

            // Add AI response to conversation
            this.addMessage('assistant', response.content, { 
                model: response.model,
                usage: response.usage 
            });

            // Update status
            this.updateStatus('ready', 'Ready');

            // Update message count
            this.updateMessageCount();

        } catch (error) {
            console.error('Error sending message to GPT app:', error);
            this.addMessage('error', `Error: ${error.message}`);
            this.updateStatus('error', 'Error');
        }
    }

    // Add message to conversation
    addMessage(type, content, options = {}) {
        const messagesContainer = document.getElementById(`messages-${this.appId}`);
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        
        let messageHTML = '';
        
        if (type === 'user') {
            messageHTML = `
                <div class="message-content">
                    <div class="message-text">${this.formatMessage(content)}</div>
                    <div class="message-meta">
                        <span class="message-time">${timestamp}</span>
                        ${options.isQuickAction ? '<span class="quick-action-badge">Quick Action</span>' : ''}
                    </div>
                </div>
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
        } else if (type === 'assistant') {
            messageHTML = `
                <div class="message-avatar">
                    <div class="symbol-3d" data-symbol="${this.app.symbol}">
                        <i class="${this.app.icon}"></i>
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-text">${this.formatMessage(content)}</div>
                    <div class="message-meta">
                        <span class="message-time">${timestamp}</span>
                        ${options.model ? `<span class="model-badge">${options.model}</span>` : ''}
                        ${options.usage ? `<span class="usage-info">${options.usage.total_tokens || 0} tokens</span>` : ''}
                    </div>
                    <div class="message-actions">
                        <button class="action-btn copy-btn" title="Copy">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn like-btn" title="Like">
                            <i class="fas fa-thumbs-up"></i>
                        </button>
                        <button class="action-btn dislike-btn" title="Dislike">
                            <i class="fas fa-thumbs-down"></i>
                        </button>
                    </div>
                </div>
            `;
        } else if (type === 'error') {
            messageHTML = `
                <div class="message-content error-content">
                    <div class="message-text">
                        <i class="fas fa-exclamation-triangle"></i>
                        ${content}
                    </div>
                    <div class="message-meta">
                        <span class="message-time">${timestamp}</span>
                    </div>
                </div>
            `;
        }

        messageElement.innerHTML = messageHTML;
        messagesContainer.appendChild(messageElement);

        // Setup message actions
        this.setupMessageActions(messageElement);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add to conversation history
        this.conversationHistory.push({
            type,
            content,
            timestamp: new Date(),
            options
        });

        // Save history
        this.saveHistory();
    }

    // Format message content
    formatMessage(content) {
        // Convert markdown-like formatting
        content = content.replace(/\`\`\`(\w+)?\n([\s\S]*?)\n\`\`\`/g, (match, lang, code) => {
            return `<pre class="code-block" data-language="${lang || 'text'}"><code>${this.escapeHtml(code)}</code></pre>`;
        });

        content = content.replace(/\`([^`]+)\`/g, '<code class="inline-code">$1</code>');
        content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // Convert line breaks
        content = content.replace(/\n/g, '<br>');

        return content;
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Setup message actions
    setupMessageActions(messageElement) {
        const copyBtn = messageElement.querySelector('.copy-btn');
        const likeBtn = messageElement.querySelector('.like-btn');
        const dislikeBtn = messageElement.querySelector('.dislike-btn');

        copyBtn?.addEventListener('click', () => {
            const messageText = messageElement.querySelector('.message-text').textContent;
            navigator.clipboard.writeText(messageText);
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });

        likeBtn?.addEventListener('click', () => {
            likeBtn.classList.toggle('active');
            dislikeBtn?.classList.remove('active');
        });

        dislikeBtn?.addEventListener('click', () => {
            dislikeBtn.classList.toggle('active');
            likeBtn?.classList.remove('active');
        });
    }

    // Update character count
    updateCharCount(text) {
        const charCount = document.getElementById(`char-count-${this.appId}`);
        if (charCount) {
            charCount.textContent = text.length;
        }
    }

    // Update status
    updateStatus(status, text) {
        const statusIndicator = document.getElementById(`status-${this.appId}`);
        if (!statusIndicator) return;

        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('span');

        statusDot.className = `status-dot status-${status}`;
        statusText.textContent = text;
    }

    // Update message count
    updateMessageCount() {
        const messageCount = document.getElementById(`message-count-${this.appId}`);
        if (messageCount) {
            const userMessages = this.conversationHistory.filter(msg => msg.type === 'user').length;
            messageCount.textContent = userMessages.toString();
        }
    }

    // Get current context
    getContext() {
        // This would integrate with the current workspace/editor context
        return {
            timestamp: new Date(),
            appId: this.appId,
            conversationLength: this.conversationHistory.length
        };
    }

    // Clear conversation
    clearConversation() {
        const messagesContainer = document.getElementById(`messages-${this.appId}`);
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        this.conversationHistory = [];
        this.saveHistory();
        this.updateMessageCount();
    }

    // Attach context (file/code)
    attachContext() {
        // This would open a file picker or allow context selection
        console.log('Attach context functionality - to be implemented');
    }

    // Start voice input
    startVoiceInput() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            // Implement voice recognition
            console.log('Voice input functionality - to be implemented');
        } else {
            alert('Speech recognition not supported in this browser');
        }
    }

    // Show interface
    show() {
        this.interfaceElement.style.display = 'flex';
        this.isActive = true;
        
        // Focus input
        const messageInput = document.getElementById(`message-input-${this.appId}`);
        if (messageInput) {
            messageInput.focus();
        }
    }

    // Hide interface
    hide() {
        this.interfaceElement.style.display = 'none';
        this.isActive = false;
    }

    // Close interface
    close() {
        this.hide();
        // Cleanup if needed
    }

    // Minimize interface
    minimize() {
        this.interfaceElement.classList.toggle('minimized');
    }

    // Open settings
    openSettings() {
        console.log('Settings functionality - to be implemented');
    }

    // Load conversation history
    loadHistory() {
        const historyKey = `gpt-app-history-${this.appId}`;
        const savedHistory = localStorage.getItem(historyKey);
        
        if (savedHistory) {
            try {
                this.conversationHistory = JSON.parse(savedHistory);
                this.restoreConversation();
            } catch (error) {
                console.warn('Failed to load conversation history:', error);
            }
        }
    }

    // Save conversation history
    saveHistory() {
        const historyKey = `gpt-app-history-${this.appId}`;
        try {
            localStorage.setItem(historyKey, JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.warn('Failed to save conversation history:', error);
        }
    }

    // Restore conversation from history
    restoreConversation() {
        this.conversationHistory.forEach(msg => {
            this.addMessage(msg.type, msg.content, { ...msg.options, fromHistory: true });
        });
        this.updateMessageCount();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GPTAppInterface;
}