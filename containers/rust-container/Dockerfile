# Rust Development Container for Da-Kraken
FROM rust:1.75-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    pkg-config \
    libssl-dev \
    libsqlite3-dev \
    libpq-dev \
    libmysqlclient-dev \
    nodejs \
    npm \
    vim \
    nano \
    htop \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install additional Rust tools
RUN rustup component add rustfmt clippy rust-analyzer \
    && cargo install cargo-watch cargo-edit cargo-tree cargo-audit \
    && cargo install wasm-pack cargo-generate \
    && cargo install diesel_cli --no-default-features --features postgres,mysql,sqlite

# Install web frameworks and tools
RUN cargo install cargo-leptos trunk \
    && cargo install sqlx-cli --no-default-features --features rustls,postgres,mysql,sqlite

# Set working directory
WORKDIR /workspace

# Copy template files
COPY Cargo-template.toml /workspace/Cargo.toml
COPY rust-toolchain-template.toml /workspace/rust-toolchain.toml
COPY gitignore-template /workspace/.gitignore

# Create project structure
RUN mkdir -p /workspace/{src,tests,examples,benches,docs} \
    && mkdir -p /workspace/.cargo

# Copy startup script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Install development server tools
RUN npm install -g http-server live-server

# Expose ports
# 8083: Rust web server (main)
# 8090: Development server
# 8091: Documentation server
EXPOSE 8083 8090 8091

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD rustc --version || exit 1

# Set environment variables
ENV RUST_BACKTRACE=1
ENV CARGO_HOME=/workspace/.cargo
ENV BRIDGE_ENDPOINT="http://bridge-orchestrator:4000"

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bash"]