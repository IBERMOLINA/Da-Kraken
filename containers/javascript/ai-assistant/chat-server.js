const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// AI Assistant API endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'JavaScript AI Assistant',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.post('/api/chat', async (req, res) => {
    const { message, context } = req.body;

    try {
        // Simulate AI response (replace with actual AI integration)
        const aiResponse = await simulateAIResponse(message, context);
        res.json({
            response: aiResponse,
            timestamp: new Date().toISOString(),
            context: {
                language: 'javascript',
                environment: 'container',
                suggestions: generateCodeSuggestions(message)
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'AI Assistant Error',
            message: error.message
        });
    }
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
    console.log('🤖 AI Assistant connected:', socket.id);

    socket.emit('welcome', {
        message: 'Welcome to JavaScript AI Assistant!',
        capabilities: [
            'React 19 development help',
            'JavaScript debugging assistance',
            'Package dependency resolution',
            'Code optimization suggestions',
            'Testing guidance',
            'Performance optimization'
        ]
    });

    socket.on('chat_message', async (data) => {
        try {
            const response = await simulateAIResponse(data.message, data.context);
            socket.emit('ai_response', {
                message: response,
                suggestions: generateCodeSuggestions(data.message),
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('code_analysis', (code) => {
        const analysis = analyzeJavaScriptCode(code);
        socket.emit('code_analysis_result', analysis);
    });

    socket.on('disconnect', () => {
        console.log('🤖 AI Assistant disconnected:', socket.id);
    });
});

// AI Response Simulation (replace with actual AI service)
async function simulateAIResponse(message, context) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('react')) {
        return `For React 19 development: ${generateReactAdvice(message)}`;
    } else if (lowerMessage.includes('error') || lowerMessage.includes('debug')) {
        return `Debugging assistance: ${generateDebuggingAdvice(message)}`;
    } else if (lowerMessage.includes('performance')) {
        return `Performance optimization: ${generatePerformanceAdvice(message)}`;
    } else if (lowerMessage.includes('install') || lowerMessage.includes('dependency')) {
        return `Dependency management: ${generateDependencyAdvice(message)}`;
    } else {
        return `I can help you with JavaScript/React development. ${generateGeneralAdvice(message)}`;
    }
}

function generateReactAdvice(message) {
    const advice = [
        "Use React 19's new features like concurrent rendering for better performance.",
        "Consider using React.memo() for component optimization.",
        "Implement proper error boundaries for better error handling.",
        "Use React DevTools for debugging component state and props.",
        "Leverage React Hooks for state management and side effects."
    ];
    return advice[Math.floor(Math.random() * advice.length)];
}

function generateDebuggingAdvice(message) {
    const advice = [
        "Use console.log() strategically or set breakpoints in browser DevTools.",
        "Check the Network tab for API request issues.",
        "Verify component props and state in React DevTools.",
        "Use ESLint to catch common JavaScript errors.",
        "Check browser console for error messages and stack traces."
    ];
    return advice[Math.floor(Math.random() * advice.length)];
}

function generatePerformanceAdvice(message) {
    const advice = [
        "Use React.lazy() for code splitting and dynamic imports.",
        "Implement useMemo() and useCallback() for expensive computations.",
        "Optimize bundle size with webpack-bundle-analyzer.",
        "Use React Profiler to identify performance bottlenecks.",
        "Consider virtualization for large lists with react-window."
    ];
    return advice[Math.floor(Math.random() * advice.length)];
}

function generateDependencyAdvice(message) {
    const advice = [
        "Use 'npm audit fix' to resolve security vulnerabilities.",
        "Keep dependencies updated with 'npm update' or 'npm outdated'.",
        "Use exact versions in package.json for production stability.",
        "Consider peerDependencies for plugin architecture.",
        "Use npm ci for faster, reliable, reproducible builds."
    ];
    return advice[Math.floor(Math.random() * advice.length)];
}

function generateGeneralAdvice(message) {
    const advice = [
        "What specific aspect of JavaScript development can I help you with?",
        "I can assist with React components, hooks, state management, or debugging.",
        "Would you like help with package management, testing, or performance optimization?",
        "I'm here to help with your JavaScript development questions!",
        "Ask me about React patterns, JavaScript best practices, or troubleshooting."
    ];
    return advice[Math.floor(Math.random() * advice.length)];
}

function generateCodeSuggestions(message) {
    const suggestions = [
        "npm install <package-name>",
        "npm start",
        "npm run build",
        "npm test",
        "npm run lint",
        "npm audit",
        "npm update"
    ];
    return suggestions.slice(0, 3);
}

function analyzeJavaScriptCode(code) {
    return {
        linesOfCode: code.split('\n').length,
        hasReactImport: code.includes('import React'),
        hasHooks: /use[A-Z]/.test(code),
        hasAsyncAwait: code.includes('async') && code.includes('await'),
        suggestions: [
            'Consider adding PropTypes for better type checking',
            'Use ESLint for code quality improvements',
            'Add error handling for async operations'
        ]
    };
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🤖 JavaScript AI Assistant running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💬 WebSocket available for real-time chat`);
});

module.exports = app;