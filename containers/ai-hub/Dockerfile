# AI Chat Hub - Central Coordination Service
FROM node:20-bullseye

LABEL maintainer="Da-Kraken Team"
LABEL description="Central AI Hub for coordinating multi-language development environments"

# Set environment variables
ENV NODE_ENV=development
ENV DEBIAN_FRONTEND=noninteractive
ENV HUB_PORT=9000
ENV API_PORT=9001

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
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Create startup script
RUN cat > /usr/local/bin/start-ai-hub.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Da-Kraken AI Hub..."

echo "🤖 AI Hub Dashboard: http://localhost:${HUB_PORT}"
echo "🔌 AI Hub API: http://localhost:${API_PORT}"

# Start the AI Hub server
npm start
EOF

RUN chmod +x /usr/local/bin/start-ai-hub.sh

# Expose ports
EXPOSE 9000 9001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${HUB_PORT}/health || exit 1

# Start AI Hub
CMD ["/usr/local/bin/start-ai-hub.sh"]