# Modern Fortran Development Container for Da-Kraken
FROM gcc:13-bookworm

# Install system dependencies and modern Fortran tools
RUN apt-get update && apt-get install -y \
    gfortran \
    gcc \
    g++ \
    make \
    cmake \
    git \
    curl \
    wget \
    pkg-config \
    liblapack-dev \
    libblas-dev \
    libnetcdf-dev \
    libhdf5-dev \
    libopenmpi-dev \
    openmpi-bin \
    python3 \
    python3-pip \
    nodejs \
    npm \
    vim \
    nano \
    htop \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install additional Fortran package managers and tools
RUN pip3 install fortls fpm --break-system-packages

# Install Intel Fortran Package Manager (fpm)
RUN curl -fsSL https://github.com/fortran-lang/fpm/releases/latest/download/fpm-0.9.0-linux-x86_64 -o /usr/local/bin/fpm \
    && chmod +x /usr/local/bin/fpm

# Install modern Fortran libraries via git
WORKDIR /opt/fortran-libs

# Install FORD for documentation
RUN pip3 install ford --break-system-packages

# Set working directory
WORKDIR /workspace

# Copy template files
COPY fpm-template.toml /workspace/fpm.toml
COPY makefile-template /workspace/Makefile
COPY cmake-template.txt /workspace/CMakeLists.txt
COPY gitignore-template /workspace/.gitignore

# Create project structure
RUN mkdir -p /workspace/{src,test,app,example,doc} \
    && mkdir -p /workspace/build

# Copy startup script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Install development server tools
RUN npm install -g live-server

# Expose ports
# 8097: Fortran web interface
# 8098: Documentation server
# 8099: Development tools server
EXPOSE 8097 8098 8099

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD gfortran --version || exit 1

# Set environment variables
ENV FC=/usr/bin/gfortran
ENV CC=/usr/bin/gcc
ENV CXX=/usr/bin/g++
ENV BRIDGE_ENDPOINT="http://bridge-orchestrator:4000"
ENV FORTRAN_STANDARD=2018

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bash"]