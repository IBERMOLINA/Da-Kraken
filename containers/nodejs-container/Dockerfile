# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Install system dependencies for development tools
RUN apk add --no-cache \
    git \
    curl \
    build-base \
    python3 \
    py3-pip \
    bash \
    vim

# Create app directory
WORKDIR /workspace

# Install global development tools
RUN npm install -g \
    typescript \
    @types/node \
    ts-node \
    nodemon \
    eslint \
    prettier \
    jest \
    webpack \
    webpack-cli \
    vite \
    create-react-app \
    @angular/cli \
    next \
    express-generator

# Install code generation and AI tools
RUN npm install -g \
    openai \
    @anthropic-ai/sdk \
    axios \
    socket.io \
    ws

# Copy package template files
COPY package-template.json /workspace/package.json
COPY tsconfig-template.json /workspace/tsconfig.json

# Install dependencies
RUN npm install

# Create workspace directories
RUN mkdir -p /workspace/src /workspace/tests /workspace/dist /workspace/generated

# Set up git
RUN git config --global user.name "Container User" && \
    git config --global user.email "container@xomni.dev"

# Expose common development ports
EXPOSE 3000 3001 5000 5173 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node --version || exit 1

# Set default command
CMD ["npm", "run", "dev"]