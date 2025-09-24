# Da-Kraken Multi-Language Development Environment Setup

## Overview
Da-Kraken provides containerized development environments for multiple programming languages, each with its own AI chat assistant and auto-dependency management.

## Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 8GB+ RAM recommended
- 20GB+ disk space

### Launch All Environments
```bash
# Clone and navigate to the repository
git clone https://github.com/IBERMOLINA/Da-Kraken.git
cd Da-Kraken

# Start all development environments
docker-compose up -d

# Check status of all services
docker-compose ps

# View logs for specific service
docker-compose logs -f javascript-dev
```

## Available Development Environments

### 🟨 JavaScript/Node.js Environment
- **Container**: `da-kraken-javascript`
- **VS Code Server**: http://localhost:8080
- **React Dev Server**: http://localhost:3000
- **AI Assistant**: http://localhost:3001
- **Features**: React 19, Node.js 20, auto npm install, ESLint, Prettier

```bash
# Access JavaScript container
docker exec -it da-kraken-javascript bash

# Start development
cd /workspace
npm start
```

### 🐍 Python Environment
- **Container**: `da-kraken-python`
- **VS Code Server**: http://localhost:8081
- **Flask App**: http://localhost:5000
- **Jupyter Lab**: http://localhost:8888
- **AI Assistant**: http://localhost:3002
- **Features**: Python 3.12, Flask, pandas, numpy, auto pip install

```bash
# Access Python container
docker exec -it da-kraken-python bash

# Activate virtual environment
source venv/bin/activate

# Start Flask app
flask run --host=0.0.0.0
```

### ☕ Java Environment
- **Container**: `da-kraken-java`
- **VS Code Server**: http://localhost:8082
- **Spring Boot App**: http://localhost:8000
- **AI Assistant**: http://localhost:3003
- **Features**: OpenJDK 21, Spring Boot 3.4.3, Maven, auto dependency resolution

```bash
# Access Java container
docker exec -it da-kraken-java bash

# Build and run Spring Boot app
mvn spring-boot:run
```

### 🐹 Go Environment
- **Container**: `da-kraken-go`
- **VS Code Server**: http://localhost:8083
- **Go App**: http://localhost:8001
- **AI Assistant**: http://localhost:3004
- **Features**: Go 1.21+, auto module init, gofmt, golint

### 🦀 Rust Environment
- **Container**: `da-kraken-rust`
- **VS Code Server**: http://localhost:8084
- **Rust App**: http://localhost:8002
- **AI Assistant**: http://localhost:3005
- **Features**: Latest Rust toolchain, Cargo, clippy, auto crate management

### ⚡ C/C++ Environment
- **Container**: `da-kraken-cpp`
- **VS Code Server**: http://localhost:8085
- **C++ App**: http://localhost:8003
- **AI Assistant**: http://localhost:3006
- **Features**: GCC/Clang, CMake, debugger integration

### 🐘 PHP Environment
- **Container**: `da-kraken-php`
- **VS Code Server**: http://localhost:8086
- **PHP App**: http://localhost:8004
- **AI Assistant**: http://localhost:3007
- **Features**: PHP 8.3, Composer, Laravel ready

### 💎 Ruby Environment
- **Container**: `da-kraken-ruby`
- **VS Code Server**: http://localhost:8087
- **Rails App**: http://localhost:8005
- **AI Assistant**: http://localhost:3008
- **Features**: Ruby 3.2, Rails, Bundler, auto gem management

## Database Services

### PostgreSQL
- **Host**: localhost:5432
- **Database**: da_kraken_dev
- **Username**: developer
- **Password**: dev_password_2025

### Redis
- **Host**: localhost:6379
- **Used for**: Caching, sessions, pub/sub

### MongoDB
- **Host**: localhost:27017
- **Username**: developer
- **Password**: dev_password_2025

## AI Chat Hub
- **Dashboard**: http://localhost:9000
- **API**: http://localhost:9001
- **Features**: Central AI coordination, cross-language assistance

## Monitoring
- **Grafana Dashboard**: http://localhost:3000 (admin/admin_2025)
- **Prometheus Metrics**: http://localhost:9090

## Individual Container Management

### Start specific language environment
```bash
# JavaScript only
docker-compose up -d javascript-dev

# Python only
docker-compose up -d python-dev database redis

# Java only
docker-compose up -d java-dev database
```

### Stop and remove containers
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ destroys data)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build
```

### Scale services
```bash
# Run multiple instances of a service
docker-compose up -d --scale javascript-dev=2
```

## Development Workflow

### 1. Choose Your Language Environment
Access the VS Code Server for your preferred language at the corresponding port.

### 2. Auto-Dependency Installation
Each container automatically:
- Installs dependencies when package files are detected
- Sets up virtual environments (Python)
- Initializes modules (Go)
- Resolves Maven dependencies (Java)

### 3. AI Assistant Integration
Each environment includes a language-specific AI assistant that can help with:
- Debugging and error resolution
- Code optimization suggestions
- Package/dependency management
- Best practices guidance
- Framework-specific advice

### 4. Cross-Language Development
Use the AI Hub dashboard to coordinate between different language environments and share context.

## Workspace Structure
```
Da-Kraken/
├── workspace/
│   ├── javascript/    # JavaScript/React projects
│   ├── python/        # Python/Flask projects
│   ├── java/          # Java/Spring Boot projects
│   ├── go/            # Go projects
│   ├── rust/          # Rust projects
│   ├── cpp/           # C++ projects
│   ├── php/           # PHP projects
│   └── ruby/          # Ruby/Rails projects
├── containers/        # Docker configurations
├── shared/            # Shared resources between containers
└── docker-compose.yml # Orchestration configuration
```

## Troubleshooting

### Container won't start
```bash
# Check container logs
docker-compose logs container-name

# Rebuild container
docker-compose up -d --build container-name
```

### Port conflicts
```bash
# Check which processes are using ports
sudo netstat -tulpn | grep :8080

# Stop conflicting services or modify ports in docker-compose.yml
```

### Performance issues
```bash
# Monitor container resources
docker stats

# Increase Docker memory allocation in Docker Desktop settings
```

### Reset environment
```bash
# Stop all containers and remove volumes
docker-compose down -v

# Remove all images (forces rebuild)
docker system prune -a

# Restart fresh
docker-compose up -d --build
```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Test in container environment
4. Submit pull request with documentation updates

## Support
- GitHub Issues: https://github.com/IBERMOLINA/Da-Kraken/issues
- AI Chat Assistants: Available in each container environment
- Health Checks: http://localhost:PORT/health for each service