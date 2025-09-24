# JavaScript Development Container with AI Assistant
FROM node:20-bullseye

LABEL maintainer="Da-Kraken Team"
LABEL description="JavaScript/Node.js development environment with React 19, AI chat assistant, and auto-dependency management"

# Set environment variables
ENV NODE_ENV=development
ENV DEBIAN_FRONTEND=noninteractive
ENV CONTAINER_NAME=javascript-dev
ENV AI_ASSISTANT_ENABLED=true

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    nano \
    htop \
    tree \
    jq \
    build-essential \
    python3 \
    python3-pip \
    ca-certificates \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install global Node.js tools
RUN npm install -g \
    npm@latest \
    yarn@latest \
    pnpm@latest \
    create-react-app@latest \
    vite@latest \
    eslint@latest \
    prettier@latest \
    typescript@latest \
    @typescript-eslint/parser@latest \
    @typescript-eslint/eslint-plugin@latest \
    nodemon@latest \
    pm2@latest \
    serve@latest \
    http-server@latest \
    concurrently@latest \
    cross-env@latest

# Install VS Code Server for web-based development
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Create workspace directory
WORKDIR /workspace

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy AI assistant configuration
COPY ai-assistant/ ./ai-assistant/

# Create auto-setup script
RUN cat > /usr/local/bin/auto-setup.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting JavaScript Development Environment..."

# Auto-install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Auto-installing dependencies..."
    npm install
fi

# Start AI assistant
if [ "$AI_ASSISTANT_ENABLED" = "true" ]; then
    echo "🤖 Starting AI Chat Assistant..."
    node /workspace/ai-assistant/chat-server.js &
fi

# Start code-server
echo "🔧 Starting VS Code Server..."
code-server --bind-addr 0.0.0.0:8080 --auth none /workspace &

echo "✅ JavaScript Development Environment Ready!"
echo "🌐 VS Code Server: http://localhost:8080"
echo "🤖 AI Assistant: http://localhost:3001"
echo "📊 React Dev Server: npm start (port 3000)"

# Keep container running
tail -f /dev/null
EOF

RUN chmod +x /usr/local/bin/auto-setup.sh

# Expose ports
EXPOSE 3000 3001 8080 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080 || exit 1

# Start auto-setup
CMD ["/usr/local/bin/auto-setup.sh"]