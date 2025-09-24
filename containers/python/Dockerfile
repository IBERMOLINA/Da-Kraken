# Python Development Container with AI Assistant
FROM python:3.12-bullseye

LABEL maintainer="Da-Kraken Team"
LABEL description="Python development environment with Flask, AI chat assistant, Jupyter, and auto-dependency management"

# Set environment variables
ENV PYTHONPATH=/workspace
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV CONTAINER_NAME=python-dev
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
    libssl-dev \
    libffi-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libncurses5-dev \
    libncursesw5-dev \
    xz-utils \
    tk-dev \
    ca-certificates \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for VS Code Server
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install VS Code Server for web-based development
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Upgrade pip and install global Python tools
RUN pip install --upgrade pip setuptools wheel

# Install development and AI tools
RUN pip install \
    flask==3.1.2 \
    flask-cors==6.0.1 \
    flask-sqlalchemy==3.1.1 \
    requests==2.32.3 \
    numpy==2.2.1 \
    pandas==2.2.3 \
    matplotlib==3.10.0 \
    seaborn==0.13.2 \
    scikit-learn==1.6.0 \
    jupyter==1.1.1 \
    jupyterlab==4.3.5 \
    notebook==7.3.1 \
    ipykernel==6.29.5 \
    black==24.10.0 \
    flake8==7.1.1 \
    mypy==1.14.0 \
    pytest==8.3.4 \
    pytest-cov==6.0.0 \
    safety==3.2.11 \
    bandit==1.8.0 \
    autopep8==2.3.1 \
    isort==5.13.2 \
    pylint==3.3.2 \
    virtualenv==20.28.0 \
    pipenv==2024.4.0 \
    poetry==1.8.5 \
    uvicorn==0.34.0 \
    fastapi==0.115.6 \
    sqlalchemy==2.0.36 \
    alembic==1.14.0

# Create workspace directory
WORKDIR /workspace

# Copy Python requirements and install
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy AI assistant
COPY ai-assistant/ ./ai-assistant/

# Create auto-setup script
RUN cat > /usr/local/bin/auto-setup.sh << 'EOF'
#!/bin/bash
echo "🐍 Starting Python Development Environment..."

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Auto-install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Auto-installing Python dependencies..."
    pip install -r requirements.txt
fi

# Auto-install from setup.py if exists
if [ -f "setup.py" ]; then
    echo "📦 Installing package in development mode..."
    pip install -e .
fi

# Start Jupyter Lab
echo "📊 Starting Jupyter Lab..."
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root --NotebookApp.token='' --NotebookApp.password='' &

# Start AI assistant
if [ "$AI_ASSISTANT_ENABLED" = "true" ]; then
    echo "🤖 Starting Python AI Assistant..."
    python /workspace/ai-assistant/chat_server.py &
fi

# Start code-server
echo "🔧 Starting VS Code Server..."
code-server --bind-addr 0.0.0.0:8080 --auth none /workspace &

# Start Flask development server if app.py exists
if [ -f "app.py" ]; then
    echo "🌐 Starting Flask development server..."
    export FLASK_ENV=development
    export FLASK_DEBUG=1
    flask run --host=0.0.0.0 --port=5000 &
fi

echo "✅ Python Development Environment Ready!"
echo "🌐 VS Code Server: http://localhost:8080"
echo "📊 Jupyter Lab: http://localhost:8888"
echo "🤖 AI Assistant: http://localhost:3002"
echo "🌐 Flask App: http://localhost:5000"

# Keep container running
tail -f /dev/null
EOF

RUN chmod +x /usr/local/bin/auto-setup.sh

# Expose ports
EXPOSE 5000 3002 8080 8888

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080 || exit 1

# Start auto-setup
CMD ["/usr/local/bin/auto-setup.sh"]