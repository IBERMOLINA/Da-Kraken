# Multi-Language Container Architecture Setup Guide

## Overview

This system provides separate Docker containers for different programming languages with a bridge orchestrator for on-demand code generation and inter-container communication.

## Quick Start

1. **Navigate to containers directory:**
   ```bash
   cd /workspaces/Da-Kraken/containers
   ```

2. **Start all containers:**
   ```bash
   ./manage-containers.sh start
   ```

3. **Or start specific language environment:**
   ```bash
   ./manage-containers.sh start nodejs  # Node.js only
   ./manage-containers.sh start python  # Python only
   ```

## Available Commands

### Container Management
```bash
# Start containers
./manage-containers.sh start [language]     # Start all or specific language
./manage-containers.sh stop [language]      # Stop containers
./manage-containers.sh restart [language]   # Restart containers
./manage-containers.sh build [language]     # Build containers

# Monitor and debug
./manage-containers.sh status               # Show container status
./manage-containers.sh logs [service]       # Show logs
./manage-containers.sh clean                # Clean up resources
```

### Code Generation
```bash
# Start interactive code generation
./manage-containers.sh generate

# Example API calls:
curl -X POST http://localhost:4000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a REST API with user authentication",
    "language": "nodejs",
    "context": {
      "framework": "express",
      "database": "mongodb"
    }
  }'
```

### Development Workflow
```bash
# Execute commands in containers
./manage-containers.sh exec nodejs-container bash
./manage-containers.sh exec python-container python

# Scale containers for load testing
./manage-containers.sh scale python-container 3
```

## Service Endpoints

| Service | Port | Description |
|---------|------|-------------|
| Bridge Orchestrator | 4000 | Central coordinator and API |
| Code Generation API | 4001 | AI-powered code generation |
| Node.js Dev | 3000, 5173 | React/Vue/Angular development |
| Python Dev | 5000, 8888 | Flask/Django + Jupyter |
| Java Dev | 8080, 8081 | Spring Boot development |
| Go Dev | 8082 | Go web services |
| Rust Dev | 8083 | Rust applications |
| C++ Dev | 8084 | C++ applications |

## Bridge API Examples

### 1. Generate Code
```bash
curl -X POST http://localhost:4000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a microservice that processes user data",
    "language": "python",
    "options": {
      "framework": "fastapi",
      "include_tests": true,
      "include_docker": true
    }
  }'
```

### 2. Translate Code Between Languages
```bash
curl -X POST http://localhost:4000/bridge/translate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
    "fromLanguage": "python",
    "toLanguage": "javascript"
  }'
```

### 3. Start Language-Specific Container
```bash
curl -X POST http://localhost:4000/containers/python/start \
  -H "Content-Type: application/json"
```

## Architecture Benefits

### 1. **Language Isolation**
- Each language runs in its own optimized environment
- No conflicts between different runtime versions
- Easier dependency management

### 2. **On-Demand Scaling**
- Containers start only when needed
- Automatic resource management
- Cost-effective development

### 3. **Cross-Language Code Generation**
- Generate code in any supported language
- Translate code between languages
- Shared context across projects

### 4. **Development Productivity**
- Pre-configured development environments
- Integrated debugging tools
- Hot reloading and live updates

## Development Examples

### Node.js Development
```bash
# Start Node.js environment
./manage-containers.sh start nodejs

# Access container
./manage-containers.sh exec nodejs-container bash

# Inside container:
npm create vite@latest my-app
cd my-app
npm install
npm run dev
```

### Python Development
```bash
# Start Python environment
./manage-containers.sh start python

# Generate a FastAPI project
curl -X POST http://localhost:4000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a FastAPI app with user management",
    "language": "python"
  }'
```

### Multi-Language Project
```bash
# Start all environments
./manage-containers.sh start

# Generate frontend (React)
curl -X POST http://localhost:4000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create React frontend with authentication",
    "language": "nodejs"
  }'

# Generate backend (Python FastAPI)
curl -X POST http://localhost:4000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create FastAPI backend with JWT authentication",
    "language": "python"
  }'
```

## Configuration

### Environment Variables
Create a `.env` file in the containers directory:

```bash
# AI API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Container Settings
CONTAINER_MEMORY_LIMIT=1g
CONTAINER_CPU_LIMIT=0.5

# Bridge Settings
BRIDGE_PORT=4000
REDIS_URL=redis://redis:6379
```

### Custom Language Support
To add a new language container:

1. Create `containers/[language]-container/Dockerfile`
2. Add service to `docker-compose.yml`
3. Update `manage-containers.sh` with new language option
4. Add language support to bridge orchestrator

## Monitoring and Debugging

### View Container Status
```bash
./manage-containers.sh status
```

### View Logs
```bash
./manage-containers.sh logs bridge-orchestrator
./manage-containers.sh logs nodejs-container
```

### Health Checks
```bash
curl http://localhost:4000/health
curl http://localhost:4001/health
```

## Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   ./manage-containers.sh build [language]
   ./manage-containers.sh clean
   ./manage-containers.sh start [language]
   ```

2. **Port conflicts**
   - Modify ports in `docker-compose.yml`
   - Or stop conflicting services

3. **Out of disk space**
   ```bash
   ./manage-containers.sh clean
   docker system prune -a
   ```

### Debug Mode
```bash
# Start with debug logging
BRIDGE_DEBUG=true ./manage-containers.sh start

# View detailed logs
docker-compose logs -f bridge-orchestrator
```

This architecture provides a powerful, scalable development environment that supports multiple programming languages with seamless code generation and cross-language project development!