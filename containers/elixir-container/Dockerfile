# Elixir Development Container for Da-Kraken
FROM elixir:1.15-otp-26-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    wget \
    build-base \
    nodejs \
    npm \
    inotify-tools \
    postgresql-client \
    sqlite \
    vim \
    nano \
    htop \
    bash \
    jq

# Install Hex and Rebar
RUN mix local.hex --force \
    && mix local.rebar --force

# Install Phoenix and LiveView
RUN mix archive.install hex phx_new --force

# Set working directory
WORKDIR /workspace

# Copy template files
COPY mix-template.exs /workspace/mix.exs
COPY config-template/ /workspace/config/
COPY gitignore-template /workspace/.gitignore

# Create project structure
RUN mkdir -p /workspace/{lib,test,priv,assets} \
    && mkdir -p /workspace/{deps,_build} \
    && mkdir -p /workspace/priv/{repo,static}

# Copy startup script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Install development tools
RUN npm install -g live-server

# Expose ports
# 4000: Phoenix web server (main)
# 4001: Phoenix LiveReload
# 8092: Development server
# 8093: Documentation server
EXPOSE 4000 4001 8092 8093

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD elixir --version || exit 1

# Set environment variables
ENV MIX_ENV=dev
ENV PHX_SERVER=true
ENV BRIDGE_ENDPOINT="http://bridge-orchestrator:4000"

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bash"]