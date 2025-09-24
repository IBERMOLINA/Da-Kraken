# Zig Development Container for Da-Kraken
FROM debian:bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    xz-utils \
    ca-certificates \
    vim \
    nano \
    htop \
    && rm -rf /var/lib/apt/lists/*

# Install Zig (latest stable version)
ENV ZIG_VERSION=0.11.0
RUN wget -q https://ziglang.org/download/${ZIG_VERSION}/zig-linux-x86_64-${ZIG_VERSION}.tar.xz \
    && tar -xf zig-linux-x86_64-${ZIG_VERSION}.tar.xz \
    && mv zig-linux-x86_64-${ZIG_VERSION} /opt/zig \
    && ln -s /opt/zig/zig /usr/local/bin/zig \
    && rm zig-linux-x86_64-${ZIG_VERSION}.tar.xz

# Install Zig Language Server (ZLS) for development support
RUN git clone https://github.com/zigtools/zls.git /tmp/zls \
    && cd /tmp/zls \
    && git checkout master \
    && zig build -Doptimize=ReleaseSafe \
    && cp zig-out/bin/zls /usr/local/bin/ \
    && rm -rf /tmp/zls

# Install Node.js for bridge communication
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /workspace

# Copy template files
COPY build-template.zig /workspace/build.zig
COPY src-template/ /workspace/src/
COPY gitignore-template /workspace/.gitignore
COPY zon-template /workspace/build.zig.zon

# Create directories
RUN mkdir -p /workspace/{src,tests,examples,docs} \
    && mkdir -p /workspace/zig-cache \
    && mkdir -p /workspace/zig-out

# Copy startup script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Install development tools
RUN npm install -g http-server

# Expose ports
# 8087: Zig development server
# 8088: Documentation server
# 8089: Test runner server
EXPOSE 8087 8088 8089

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD zig version || exit 1

# Set environment variables
ENV PATH="/opt/zig:${PATH}"
ENV ZIG_GLOBAL_CACHE_DIR="/workspace/zig-cache"
ENV BRIDGE_ENDPOINT="http://bridge-orchestrator:4000"

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bash"]