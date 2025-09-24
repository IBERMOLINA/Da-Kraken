const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration
const HUB_PORT = process.env.HUB_PORT || 9000;
const API_PORT = process.env.API_PORT || 9001;
const ENABLED_LANGUAGES = (process.env.ENABLED_LANGUAGES || '').split(',');

// Language environments configuration
const LANGUAGE_ENVIRONMENTS = {
    javascript: {
        name: 'JavaScript/Node.js',
        container: 'da-kraken-javascript',
        ports: { app: 3000, ai: 3001, vscode: 8080 },
        health: 'http://javascript-dev:8080/health',
        ai_endpoint: 'http://javascript-dev:3001/api/health'
    },
    python: {
        name: 'Python/Flask',
        container: 'da-kraken-python',
        ports: { app: 5000, ai: 3002, vscode: 8081, jupyter: 8888 },
        health: 'http://python-dev:8081/health',
        ai_endpoint: 'http://python-dev:3002/api/health'
    },
    java: {
        name: 'Java/Spring Boot',
        container: 'da-kraken-java',
        ports: { app: 8000, ai: 3003, vscode: 8082 },
        health: 'http://java-dev:8082/health',
        ai_endpoint: 'http://java-dev:3003/api/health'
    },
    go: {
        name: 'Go',
        container: 'da-kraken-go',
        ports: { app: 8001, ai: 3004, vscode: 8083 },
        health: 'http://go-dev:8083/health',
        ai_endpoint: 'http://go-dev:3004/api/health'
    },
    rust: {
        name: 'Rust',
        container: 'da-kraken-rust',
        ports: { app: 8002, ai: 3005, vscode: 8084 },
        health: 'http://rust-dev:8084/health',
        ai_endpoint: 'http://rust-dev:3005/api/health'
    },
    cpp: {
        name: 'C/C++',
        container: 'da-kraken-cpp',
        ports: { app: 8003, ai: 3006, vscode: 8085 },
        health: 'http://cpp-dev:8085/health',
        ai_endpoint: 'http://cpp-dev:3006/api/health'
    },
    php: {
        name: 'PHP',
        container: 'da-kraken-php',
        ports: { app: 8004, ai: 3007, vscode: 8086 },
        health: 'http://php-dev:8086/health',
        ai_endpoint: 'http://php-dev:3007/api/health'
    },
    ruby: {
        name: 'Ruby/Rails',
        container: 'da-kraken-ruby',
        ports: { app: 8005, ai: 3008, vscode: 8087 },
        health: 'http://ruby-dev:8087/health',
        ai_endpoint: 'http://ruby-dev:3008/api/health'
    }
};

// Store active connections and environment status
const activeConnections = new Map();
const environmentStatus = new Map();

// API Routes
app.get('/', (req, res) => {
    res.send(generateDashboardHTML());
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Da-Kraken AI Hub',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        enabled_languages: ENABLED_LANGUAGES,
        active_connections: activeConnections.size,
        environment_status: Object.fromEntries(environmentStatus)
    });
});

app.get('/api/environments', async (req, res) => {
    try {
        const environments = await checkAllEnvironments();
        res.json({
            environments,
            total: Object.keys(environments).length,
            active: Object.values(environments).filter(env => env.status === 'healthy').length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/environments/:language', async (req, res) => {
    try {
        const { language } = req.params;
        const environment = await checkEnvironmentHealth(language);
        if (!environment) {
            return res.status(404).json({ error: 'Environment not found' });
        }
        res.json(environment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat/broadcast', async (req, res) => {
    try {
        const { message, languages, priority } = req.body;
        
        const results = await broadcastMessage(message, languages, priority);
        res.json({
            message: 'Broadcast sent',
            results,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/environments/:language/execute', async (req, res) => {
    try {
        const { language } = req.params;
        const { command, args } = req.body;
        
        const result = await executeCommand(language, command, args);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Socket.IO for real-time communication
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    activeConnections.set(socket.id, {
        connectedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
    });

    socket.emit('welcome', {
        message: 'Connected to Da-Kraken AI Hub',
        environments: Object.keys(LANGUAGE_ENVIRONMENTS),
        capabilities: [
            'Multi-language environment coordination',
            'Cross-language AI assistance',
            'Real-time environment monitoring',
            'Centralized command execution',
            'Development workflow orchestration'
        ]
    });

    socket.on('request_environment_status', async () => {
        try {
            const environments = await checkAllEnvironments();
            socket.emit('environment_status', environments);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('subscribe_language', (language) => {
        if (LANGUAGE_ENVIRONMENTS[language]) {
            socket.join(`language_${language}`);
            socket.emit('subscribed', { language });
        }
    });

    socket.on('cross_language_chat', async (data) => {
        try {
            const { message, source_language, target_languages } = data;
            const responses = await handleCrossLanguageChat(message, source_language, target_languages);
            socket.emit('cross_language_responses', responses);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('execute_command', async (data) => {
        try {
            const { language, command, args } = data;
            const result = await executeCommand(language, command, args);
            socket.emit('command_result', { language, result });
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        activeConnections.delete(socket.id);
    });
});

// Helper Functions
async function checkAllEnvironments() {
    const environments = {};
    
    for (const [language, config] of Object.entries(LANGUAGE_ENVIRONMENTS)) {
        if (ENABLED_LANGUAGES.length === 0 || ENABLED_LANGUAGES.includes(language)) {
            environments[language] = await checkEnvironmentHealth(language);
        }
    }
    
    return environments;
}

async function checkEnvironmentHealth(language) {
    const config = LANGUAGE_ENVIRONMENTS[language];
    if (!config) return null;

    try {
        // Check main health endpoint
        const healthResponse = await axios.get(config.health, { timeout: 5000 });
        
        // Check AI assistant health
        let aiHealth = 'unknown';
        try {
            await axios.get(config.ai_endpoint, { timeout: 3000 });
            aiHealth = 'healthy';
        } catch {
            aiHealth = 'unhealthy';
        }

        const status = {
            language,
            name: config.name,
            container: config.container,
            status: 'healthy',
            ports: config.ports,
            ai_assistant: aiHealth,
            last_checked: new Date().toISOString(),
            response_time: healthResponse.responseTime || 0
        };

        environmentStatus.set(language, status);
        return status;

    } catch (error) {
        const status = {
            language,
            name: config.name,
            container: config.container,
            status: 'unhealthy',
            error: error.message,
            last_checked: new Date().toISOString()
        };

        environmentStatus.set(language, status);
        return status;
    }
}

async function broadcastMessage(message, languages, priority = 'normal') {
    const results = {};
    
    const targetLanguages = languages || Object.keys(LANGUAGE_ENVIRONMENTS);
    
    for (const language of targetLanguages) {
        try {
            const config = LANGUAGE_ENVIRONMENTS[language];
            if (!config) continue;

            const response = await axios.post(`${config.ai_endpoint.replace('/health', '')}/chat`, {
                message,
                context: {
                    source: 'ai_hub',
                    priority,
                    timestamp: new Date().toISOString()
                }
            }, { timeout: 10000 });

            results[language] = {
                status: 'success',
                response: response.data
            };

            // Broadcast to subscribed clients
            io.to(`language_${language}`).emit('broadcast_message', {
                message,
                response: response.data,
                language,
                priority
            });

        } catch (error) {
            results[language] = {
                status: 'error',
                error: error.message
            };
        }
    }

    return results;
}

async function handleCrossLanguageChat(message, sourceLanguage, targetLanguages) {
    const responses = {};
    
    for (const targetLang of targetLanguages) {
        if (targetLang === sourceLanguage) continue;
        
        try {
            const config = LANGUAGE_ENVIRONMENTS[targetLang];
            if (!config) continue;

            const contextualMessage = `Cross-language question from ${sourceLanguage} developer: ${message}`;
            
            const response = await axios.post(`${config.ai_endpoint.replace('/health', '')}/chat`, {
                message: contextualMessage,
                context: {
                    source_language: sourceLanguage,
                    cross_language: true,
                    timestamp: new Date().toISOString()
                }
            }, { timeout: 10000 });

            responses[targetLang] = {
                status: 'success',
                response: response.data
            };

        } catch (error) {
            responses[targetLang] = {
                status: 'error',
                error: error.message
            };
        }
    }

    return responses;
}

async function executeCommand(language, command, args = []) {
    // This would integrate with container execution - placeholder for now
    return {
        language,
        command,
        args,
        result: 'Command execution not implemented yet',
        timestamp: new Date().toISOString()
    };
}

function generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Da-Kraken AI Hub Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; padding: 20px;
        }
        .dashboard { max-width: 1400px; margin: 0 auto; }
        .header {
            background: rgba(255, 255, 255, 0.95); border-radius: 15px; padding: 30px;
            margin-bottom: 30px; text-align: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .header h1 { color: #2c3e50; margin-bottom: 10px; font-size: 2.5em; }
        .header p { color: #7f8c8d; font-size: 1.1em; }
        .environments {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px; margin-bottom: 30px;
        }
        .env-card {
            background: rgba(255, 255, 255, 0.95); border-radius: 15px; padding: 25px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1); transition: transform 0.3s ease;
        }
        .env-card:hover { transform: translateY(-5px); }
        .env-header {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;
        }
        .env-name { font-size: 1.3em; font-weight: bold; color: #2c3e50; }
        .status-indicator {
            width: 12px; height: 12px; border-radius: 50%; background: #e74c3c; animation: pulse 2s infinite;
        }
        .status-healthy { background: #27ae60; }
        .ports { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
        .port-item {
            background: #f8f9fa; padding: 8px 12px; border-radius: 8px; text-align: center;
            font-size: 0.9em; color: #495057;
        }
        .actions { display: flex; gap: 10px; }
        .btn {
            padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer;
            font-size: 0.9em; transition: background-color 0.3s ease;
        }
        .btn-primary { background: #3498db; color: white; }
        .btn-primary:hover { background: #2980b9; }
        .btn-success { background: #27ae60; color: white; }
        .btn-success:hover { background: #219a52; }
        .stats {
            background: rgba(255, 255, 255, 0.95); border-radius: 15px; padding: 25px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat-item { text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #3498db; }
        .stat-label { color: #7f8c8d; margin-top: 5px; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🚀 Da-Kraken AI Hub</h1>
            <p>Multi-Language Development Environment Orchestration</p>
        </div>
        
        <div class="environments" id="environments">
            <!-- Environment cards will be populated by JavaScript -->
        </div>
        
        <div class="stats">
            <h2 style="margin-bottom: 20px; color: #2c3e50;">Hub Statistics</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value" id="totalEnvs">8</div>
                    <div class="stat-label">Total Environments</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="activeEnvs">0</div>
                    <div class="stat-label">Active Environments</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="activeConnections">0</div>
                    <div class="stat-label">Active Connections</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="uptime">0s</div>
                    <div class="stat-label">Hub Uptime</div>
                </div>
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const startTime = Date.now();

        const environments = {
            javascript: { name: 'JavaScript/Node.js', icon: '🟨', ports: { vscode: 8080, app: 3000, ai: 3001 } },
            python: { name: 'Python/Flask', icon: '🐍', ports: { vscode: 8081, app: 5000, ai: 3002, jupyter: 8888 } },
            java: { name: 'Java/Spring Boot', icon: '☕', ports: { vscode: 8082, app: 8000, ai: 3003 } },
            go: { name: 'Go', icon: '🐹', ports: { vscode: 8083, app: 8001, ai: 3004 } },
            rust: { name: 'Rust', icon: '🦀', ports: { vscode: 8084, app: 8002, ai: 3005 } },
            cpp: { name: 'C/C++', icon: '⚡', ports: { vscode: 8085, app: 8003, ai: 3006 } },
            php: { name: 'PHP', icon: '🐘', ports: { vscode: 8086, app: 8004, ai: 3007 } },
            ruby: { name: 'Ruby/Rails', icon: '💎', ports: { vscode: 8087, app: 8005, ai: 3008 } }
        };

        function updateEnvironments() {
            const container = document.getElementById('environments');
            container.innerHTML = '';

            Object.entries(environments).forEach(([key, env]) => {
                const card = document.createElement('div');
                card.className = 'env-card';
                
                const portsHtml = Object.entries(env.ports).map(([name, port]) => 
                    \`<div class="port-item">\${name.toUpperCase()}: \${port}</div>\`
                ).join('');

                card.innerHTML = \`
                    <div class="env-header">
                        <div class="env-name">\${env.icon} \${env.name}</div>
                        <div class="status-indicator" id="status-\${key}"></div>
                    </div>
                    <div class="ports">\${portsHtml}</div>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="openVSCode('\${env.ports.vscode}')">VS Code</button>
                        <button class="btn btn-success" onclick="openAI('\${env.ports.ai}')">AI Assistant</button>
                    </div>
                \`;
                
                container.appendChild(card);
            });
        }

        function updateStats() {
            fetch('/api/environments')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('activeEnvs').textContent = data.active;
                    
                    Object.entries(data.environments).forEach(([key, env]) => {
                        const statusEl = document.getElementById(\`status-\${key}\`);
                        if (statusEl) {
                            statusEl.className = env.status === 'healthy' ? 'status-indicator status-healthy' : 'status-indicator';
                        }
                    });
                });

            const uptime = Math.floor((Date.now() - startTime) / 1000);
            document.getElementById('uptime').textContent = uptime + 's';
        }

        function openVSCode(port) {
            window.open(\`http://localhost:\${port}\`, '_blank');
        }

        function openAI(port) {
            window.open(\`http://localhost:\${port}\`, '_blank');
        }

        socket.on('connect', () => {
            console.log('Connected to AI Hub');
        });

        // Initialize
        updateEnvironments();
        updateStats();
        setInterval(updateStats, 5000);
    </script>
</body>
</html>
    `;
}

// Start periodic environment health checks
setInterval(async () => {
    await checkAllEnvironments();
}, 30000);

// Start servers
const hubServer = server.listen(HUB_PORT, () => {
    console.log(`🚀 Da-Kraken AI Hub Dashboard running on port ${HUB_PORT}`);
    console.log(`🌐 Dashboard: http://localhost:${HUB_PORT}`);
    console.log(`🔌 WebSocket available for real-time updates`);
});

const apiServer = app.listen(API_PORT, () => {
    console.log(`🔌 AI Hub API running on port ${API_PORT}`);
    console.log(`📊 API Endpoints: http://localhost:${API_PORT}/api/environments`);
});

module.exports = { app, server, io };