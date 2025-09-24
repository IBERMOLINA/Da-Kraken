# Use Python 3.11 as base image
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    vim \
    nano \
    htop \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
WORKDIR /workspace

# Copy requirements template
COPY requirements-template.txt /workspace/requirements.txt

# Install Python packages
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Install additional development tools
RUN pip install --no-cache-dir \
    black \
    flake8 \
    mypy \
    pytest \
    pytest-cov \
    ipython \
    jupyter \
    notebook \
    jupyterlab

# Install AI/ML libraries
RUN pip install --no-cache-dir \
    numpy \
    pandas \
    scikit-learn \
    matplotlib \
    seaborn \
    plotly \
    tensorflow \
    torch \
    transformers \
    openai \
    anthropic

# Create workspace directories
RUN mkdir -p /workspace/src /workspace/tests /workspace/notebooks /workspace/generated /workspace/models

# Set up git
RUN git config --global user.name "Container User" && \
    git config --global user.email "container@xomni.dev"

# Create Python virtual environment
RUN python -m venv /workspace/venv
ENV PATH="/workspace/venv/bin:$PATH"

# Expose common development ports
EXPOSE 5000 8000 8888 8501

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python --version || exit 1

# Set default command
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]