const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/projects', (req, res) => {
  // Return list of available projects
  res.json({
    projects: [
      { id: 1, name: 'React Web App', type: 'web' },
      { id: 2, name: 'Node.js API', type: 'backend' },
      { id: 3, 'Flutter Mobile App', type: 'mobile' }
    ]
  });
});

app.post('/api/deploy', (req, res) => {
  const { projectId, platform } = req.body;
  
  // Simulate deployment
  console.log(`Deploying project ${projectId} to ${platform}`);
  
  // Emit deployment status via Socket.IO
  io.emit('deployment-status', {
    projectId,
    platform,
    status: 'building',
    message: 'Building project...'
  });
  
  // Simulate deployment process
  setTimeout(() => {
    io.emit('deployment-status', {
      projectId,
      platform,
      status: 'deploying',
      message: 'Deploying to production...'
    });
  }, 2000);
  
  setTimeout(() => {
    io.emit('deployment-status', {
      projectId,
      platform,
      status: 'completed',
      message: 'Deployment successful!',
      url: `https://my-app-${platform}.com`
    });
  }, 5000);
  
  res.json({ success: true, deploymentId: Date.now() });
});

app.post('/api/optimize', (req, res) => {
  const { code, language } = req.body;
  
  // Simulate code optimization
  console.log(`Optimizing ${language} code...`);
  
  setTimeout(() => {
    io.emit('optimization-result', {
      originalSize: code.length,
      optimizedSize: Math.floor(code.length * 0.8),
      improvements: [
        'Removed unused variables',
        'Minified code structure',
        'Optimized imports'
      ]
    });
  }, 3000);
  
  res.json({ success: true, message: 'Optimization started' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room ${roomId}`);
  });
  
  socket.on('code-change', (data) => {
    socket.to(data.roomId).emit('code-update', data);
  });
  
  socket.on('terminal-command', (command) => {
    console.log('Executing command:', command);
    
    // Simulate command execution
    let output = '';
    if (command === 'ls') {
      output = 'src/\npackage.json\nREADME.md\n';
    } else if (command === 'npm install') {
      output = 'Installing dependencies...\n✅ Dependencies installed';
    } else if (command.startsWith('echo')) {
      output = command.substring(5);
    } else {
      output = `Command not found: ${command}`;
    }
    
    socket.emit('terminal-output', {
      command,
      output,
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 xomni server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = { app, server, io };