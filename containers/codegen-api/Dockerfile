# Use Node.js 20 as base for AI/ML code generation
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    git \
    curl \
    bash

# Create app directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY src/ ./src/

# Create necessary directories
RUN mkdir -p /app/generated /app/templates /app/logs

# Expose API port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:4001/health || exit 1

# Set default command
CMD ["npm", "start"]