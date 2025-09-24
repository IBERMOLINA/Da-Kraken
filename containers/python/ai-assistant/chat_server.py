#!/usr/bin/env python3
"""
Python AI Assistant Chat Server
Provides intelligent development assistance for Python projects
"""

import os
import sys
import json
import time
import random
import asyncio
import logging
from datetime import datetime
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import socketio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app and Socket.IO server
app = Flask(__name__)
CORS(app)
sio = socketio.Server(cors_allowed_origins="*")
app.wsgi_app = socketio.WSGIApp(sio, app.wsgi_app)

# AI Assistant capabilities
CAPABILITIES = [
    'Python debugging and error resolution',
    'Flask web development guidance',
    'Data science with pandas/numpy help',
    'Package dependency management',
    'Code optimization and best practices',
    'Testing with pytest guidance',
    'Virtual environment setup',
    'Database integration support'
]

@app.route('/')
def index():
    """Serve the AI assistant chat interface"""
    return render_template_string(CHAT_HTML)

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Python AI Assistant',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'environment': os.getenv('FLASK_ENV', 'development'),
        'python_version': sys.version,
        'capabilities': CAPABILITIES
    })

@app.route('/api/chat', methods=['POST'])
def chat_api():
    """REST API for chat interactions"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        context = data.get('context', {})
        
        response = generate_ai_response(message, context)
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat(),
            'context': {
                'language': 'python',
                'environment': 'container',
                'suggestions': generate_code_suggestions(message)
            }
        })
    except Exception as e:
        logger.error(f"Chat API error: {e}")
        return jsonify({
            'error': 'AI Assistant Error',
            'message': str(e)
        }), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_code():
    """Analyze Python code"""
    try:
        data = request.get_json()
        code = data.get('code', '')
        
        analysis = analyze_python_code(code)
        
        return jsonify({
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Code analysis error: {e}")
        return jsonify({
            'error': 'Code Analysis Error',
            'message': str(e)
        }), 500

# Socket.IO Events
@sio.event
def connect(sid, environ):
    """Handle client connection"""
    logger.info(f'🤖 Python AI Assistant connected: {sid}')
    sio.emit('welcome', {
        'message': 'Welcome to Python AI Assistant!',
        'capabilities': CAPABILITIES,
        'python_version': sys.version.split()[0],
        'container_ready': True
    }, room=sid)

@sio.event
def disconnect(sid):
    """Handle client disconnection"""
    logger.info(f'🤖 Python AI Assistant disconnected: {sid}')

@sio.event
def chat_message(sid, data):
    """Handle chat message from client"""
    try:
        message = data.get('message', '')
        context = data.get('context', {})
        
        # Simulate processing time
        time.sleep(1)
        
        response = generate_ai_response(message, context)
        suggestions = generate_code_suggestions(message)
        
        sio.emit('ai_response', {
            'message': response,
            'suggestions': suggestions,
            'timestamp': datetime.now().isoformat(),
            'analysis': analyze_message_intent(message)
        }, room=sid)
        
    except Exception as e:
        logger.error(f"Chat message error: {e}")
        sio.emit('error', {'message': str(e)}, room=sid)

@sio.event
def code_analysis(sid, data):
    """Handle code analysis request"""
    try:
        code = data.get('code', '')
        analysis = analyze_python_code(code)
        
        sio.emit('code_analysis_result', {
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        }, room=sid)
        
    except Exception as e:
        logger.error(f"Code analysis error: {e}")
        sio.emit('error', {'message': str(e)}, room=sid)

def generate_ai_response(message, context):
    """Generate AI response based on message content"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ['flask', 'web', 'api', 'route']):
        return generate_flask_advice(message)
    elif any(word in message_lower for word in ['pandas', 'numpy', 'data', 'dataframe']):
        return generate_data_science_advice(message)
    elif any(word in message_lower for word in ['error', 'debug', 'exception', 'traceback']):
        return generate_debugging_advice(message)
    elif any(word in message_lower for word in ['install', 'pip', 'package', 'dependency']):
        return generate_package_advice(message)
    elif any(word in message_lower for word in ['test', 'pytest', 'unittest']):
        return generate_testing_advice(message)
    elif any(word in message_lower for word in ['performance', 'optimize', 'speed']):
        return generate_performance_advice(message)
    else:
        return generate_general_advice(message)

def generate_flask_advice(message):
    """Generate Flask-specific advice"""
    advice = [
        "Use Flask-CORS for handling cross-origin requests in your API.",
        "Implement proper error handling with Flask's @app.errorhandler decorators.",
        "Use Flask-SQLAlchemy for database integration and ORM functionality.",
        "Configure Flask blueprints for better project organization.",
        "Use environment variables for configuration with Flask's config system.",
        "Implement request validation using Flask-WTF or marshmallow.",
        "Use Flask-Login for user authentication and session management."
    ]
    return f"Flask Development: {random.choice(advice)}"

def generate_data_science_advice(message):
    """Generate data science advice"""
    advice = [
        "Use pandas.read_csv() with appropriate parameters for efficient data loading.",
        "Leverage vectorized operations in NumPy and pandas for better performance.",
        "Use matplotlib.pyplot or seaborn for data visualization and analysis.",
        "Implement data validation with pandas.DataFrame.info() and describe().",
        "Use pandas.groupby() for efficient data aggregation operations.",
        "Handle missing data with pandas.fillna() or dropna() methods.",
        "Use scikit-learn for machine learning model implementation."
    ]
    return f"Data Science: {random.choice(advice)}"

def generate_debugging_advice(message):
    """Generate debugging advice"""
    advice = [
        "Use Python's built-in debugger: import pdb; pdb.set_trace()",
        "Add strategic print statements or use logging for debugging.",
        "Check Python traceback for exact error location and type.",
        "Use try-except blocks to handle expected exceptions gracefully.",
        "Validate input data types and ranges before processing.",
        "Use Python's inspect module to examine objects at runtime.",
        "Implement unit tests to catch bugs early in development."
    ]
    return f"Debugging Help: {random.choice(advice)}"

def generate_package_advice(message):
    """Generate package management advice"""
    advice = [
        "Use 'pip install -r requirements.txt' for batch dependency installation.",
        "Create virtual environments with 'python -m venv venv' for isolation.",
        "Use 'pip freeze > requirements.txt' to export current dependencies.",
        "Check for security vulnerabilities with 'pip-audit' or 'safety check'.",
        "Use 'pip list --outdated' to check for package updates.",
        "Consider using poetry or pipenv for advanced dependency management.",
        "Pin exact versions in requirements.txt for production stability."
    ]
    return f"Package Management: {random.choice(advice)}"

def generate_testing_advice(message):
    """Generate testing advice"""
    advice = [
        "Use pytest for comprehensive unit testing with better syntax.",
        "Implement test fixtures for reusable test data and setup.",
        "Use pytest-cov for test coverage reporting and analysis.",
        "Write descriptive test function names that explain the test purpose.",
        "Use parameterized tests with @pytest.mark.parametrize for multiple inputs.",
        "Mock external dependencies with unittest.mock or pytest-mock.",
        "Implement integration tests for API endpoints and database operations."
    ]
    return f"Testing Guide: {random.choice(advice)}"

def generate_performance_advice(message):
    """Generate performance optimization advice"""
    advice = [
        "Use list comprehensions instead of loops for better performance.",
        "Leverage NumPy vectorized operations for numerical computations.",
        "Use generators for memory-efficient iteration over large datasets.",
        "Profile your code with cProfile to identify performance bottlenecks.",
        "Cache expensive function calls with functools.lru_cache decorator.",
        "Use concurrent.futures for CPU-bound tasks parallelization.",
        "Optimize database queries and use connection pooling."
    ]
    return f"Performance Optimization: {random.choice(advice)}"

def generate_general_advice(message):
    """Generate general Python advice"""
    advice = [
        "Follow PEP 8 style guidelines for consistent Python code formatting.",
        "Use type hints for better code documentation and IDE support.",
        "Implement proper error handling with specific exception types.",
        "Use context managers (with statements) for resource management.",
        "Write docstrings for functions and classes for better documentation.",
        "Use f-strings for efficient and readable string formatting.",
        "Leverage Python's built-in functions and standard library modules."
    ]
    return f"Python Best Practice: {random.choice(advice)}"

def generate_code_suggestions(message):
    """Generate code suggestions based on message"""
    suggestions = [
        "pip install <package>",
        "python -m venv venv",
        "source venv/bin/activate",
        "flask run",
        "pytest tests/",
        "pip freeze > requirements.txt",
        "python -m pip list --outdated"
    ]
    return suggestions[:3]

def analyze_message_intent(message):
    """Analyze user message intent"""
    intents = {
        'debugging': ['error', 'debug', 'exception', 'traceback', 'bug'],
        'web_development': ['flask', 'api', 'web', 'route', 'server'],
        'data_science': ['pandas', 'numpy', 'data', 'dataframe', 'analysis'],
        'package_management': ['install', 'pip', 'package', 'dependency', 'requirements'],
        'testing': ['test', 'pytest', 'unittest', 'coverage'],
        'general': []
    }
    
    message_lower = message.lower()
    for intent, keywords in intents.items():
        if any(keyword in message_lower for keyword in keywords):
            return intent
    return 'general'

def analyze_python_code(code):
    """Analyze Python code and provide insights"""
    try:
        lines = code.split('\n')
        line_count = len([line for line in lines if line.strip()])
        
        analysis = {
            'lines_of_code': line_count,
            'has_imports': any('import ' in line for line in lines),
            'has_functions': any('def ' in line for line in lines),
            'has_classes': any('class ' in line for line in lines),
            'has_main_guard': '__name__ == "__main__"' in code,
            'has_docstrings': '"""' in code or "'''" in code,
            'suggestions': []
        }
        
        # Generate suggestions
        if not analysis['has_docstrings'] and analysis['has_functions']:
            analysis['suggestions'].append('Add docstrings to your functions for better documentation')
        
        if not analysis['has_main_guard'] and line_count > 10:
            analysis['suggestions'].append('Consider adding if __name__ == "__main__": guard for script execution')
        
        if 'print(' in code:
            analysis['suggestions'].append('Consider using logging instead of print statements')
        
        if analysis['line_count'] > 50 and not analysis['has_classes']:
            analysis['suggestions'].append('Consider organizing code into classes for better structure')
        
        return analysis
        
    except Exception as e:
        return {'error': f'Code analysis failed: {str(e)}'}

# Chat HTML Template
CHAT_HTML = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Python AI Assistant</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
            height: 100vh; display: flex; justify-content: center; align-items: center;
        }
        .chat-container {
            background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            width: 90%; max-width: 800px; height: 80vh; display: flex; flex-direction: column; overflow: hidden;
        }
        .chat-header {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 20px; text-align: center;
        }
        .chat-messages { flex: 1; padding: 20px; overflow-y: auto; background-color: #f8f9fa; }
        .message { margin-bottom: 15px; padding: 12px 16px; border-radius: 10px; max-width: 80%; word-wrap: break-word; }
        .user-message { background-color: #3498db; color: white; margin-left: auto; }
        .ai-message { background-color: #ecf0f1; color: #2c3e50; }
        .suggestions { margin-top: 10px; }
        .suggestion-chip {
            display: inline-block; background-color: #34495e; color: white; padding: 4px 8px;
            margin: 2px; border-radius: 12px; font-size: 12px; cursor: pointer;
        }
        .chat-input-container { padding: 20px; border-top: 1px solid #dee2e6; background-color: white; }
        .chat-input { display: flex; gap: 10px; }
        .chat-input input { flex: 1; padding: 12px; border: 1px solid #ced4da; border-radius: 25px; outline: none; }
        .send-button { padding: 12px 20px; background-color: #3498db; color: white; border: none; border-radius: 25px; cursor: pointer; }
        .status { padding: 10px 20px; background-color: #27ae60; color: white; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <h1>🐍 Python AI Assistant</h1>
            <p>Python 3.12 • Flask • Jupyter • Data Science • Auto-Dependencies</p>
        </div>
        <div class="status" id="status">Connecting to AI Assistant...</div>
        <div class="chat-messages" id="chatMessages">
            <div class="message ai-message">
                <strong>AI Assistant:</strong> Hello! I'm your Python development assistant. I can help you with:
                <div class="suggestions">
                    <span class="suggestion-chip" onclick="sendSuggestion('Flask web development')">Flask Web Dev</span>
                    <span class="suggestion-chip" onclick="sendSuggestion('Debug Python error')">Debugging</span>
                    <span class="suggestion-chip" onclick="sendSuggestion('Pandas data analysis')">Data Science</span>
                    <span class="suggestion-chip" onclick="sendSuggestion('Install Python packages')">Packages</span>
                </div>
            </div>
        </div>
        <div class="chat-input-container">
            <div class="chat-input">
                <input type="text" id="messageInput" placeholder="Ask me about Python, Flask, data science, or debugging..." onkeypress="handleKeyPress(event)">
                <button class="send-button" onclick="sendMessage()">Send</button>
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const messagesContainer = document.getElementById('chatMessages');
        const messageInput = document.getElementById('messageInput');
        const statusDiv = document.getElementById('status');

        socket.on('connect', () => {
            statusDiv.textContent = 'Connected to Python AI Assistant';
            statusDiv.style.backgroundColor = '#27ae60';
        });

        socket.on('welcome', (data) => {
            addMessage('ai', `${data.message} Python ${data.python_version}`);
        });

        socket.on('ai_response', (data) => {
            removeTyping();
            addMessage('ai', data.message, data.suggestions);
        });

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;
            addMessage('user', message);
            messageInput.value = '';
            showTyping();
            socket.emit('chat_message', { message: message, context: { timestamp: new Date().toISOString() } });
        }

        function sendSuggestion(suggestion) {
            messageInput.value = suggestion;
            sendMessage();
        }

        function addMessage(sender, message, suggestions = []) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
            let content = `<strong>${sender === 'user' ? 'You' : 'AI Assistant'}:</strong> ${message}`;
            if (suggestions && suggestions.length > 0) {
                content += '<div class="suggestions">';
                suggestions.forEach(suggestion => {
                    content += `<span class="suggestion-chip" onclick="sendSuggestion('${suggestion}')">${suggestion}</span>`;
                });
                content += '</div>';
            }
            messageDiv.innerHTML = content;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function showTyping() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing'; typingDiv.id = 'typing';
            typingDiv.innerHTML = '<div class="message ai-message"><em>AI is thinking...</em></div>';
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function removeTyping() {
            const typingDiv = document.getElementById('typing');
            if (typingDiv) typingDiv.remove();
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') sendMessage();
        }

        messageInput.focus();
    </script>
</body>
</html>
'''

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3002))
    logger.info(f"🤖 Starting Python AI Assistant on port {port}")
    logger.info(f"🌐 Health check: http://localhost:{port}/api/health")
    logger.info(f"💬 WebSocket available for real-time chat")
    
    app.run(host='0.0.0.0', port=port, debug=True)