# Crystal Development Container for Da-Kraken
FROM crystallang/crystal:1.10.1-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    wget \
    build-base \
    yaml-dev \
    libxml2-dev \
    sqlite-dev \
    postgresql-dev \
    mysql-dev \
    nodejs \
    npm \
    vim \
    nano \
    htop \
    bash \
    jq \
    openssl-dev

# Set working directory
WORKDIR /workspace

# Copy template files
COPY shard-template.yml /workspace/shard.yml
COPY gitignore-template /workspace/.gitignore

# Create project structure
RUN mkdir -p /workspace/{src,spec,lib} \
    && mkdir -p /workspace/.shards

# Copy startup script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Install development tools
RUN npm install -g live-server

# Expose ports
# 8094: Crystal web server (main)
# 8095: Development server
# 8096: Documentation server
EXPOSE 8094 8095 8096

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD crystal --version || exit 1

# Set environment variables
ENV CRYSTAL_ENV=development
ENV BRIDGE_ENDPOINT="http://bridge-orchestrator:4000"

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bash"]