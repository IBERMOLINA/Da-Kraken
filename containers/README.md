# Multi-Language Container Architecture

This directory contains Docker containers for different programming languages, each optimized for code generation and development tasks.

## Architecture Overview

### Language-Specific Containers
- **nodejs-container**: Node.js/JavaScript/TypeScript development environment
- **python-container**: Python development environment with ML/AI libraries
- **java-container**: Java/Kotlin development environment with Maven/Gradle
- **go-container**: Go development environment
- **rust-container**: Rust development environment with Cargo
- **cpp-container**: C/C++ development environment with CMake

### Bridge System
- **bridge-orchestrator**: Central orchestrator for inter-container communication
- **code-gen-api**: API for on-demand code generation across languages
- **shared-volumes**: Shared storage for code artifacts and project files

## Features

1. **Language Isolation**: Each language runs in its own optimized container
2. **On-Demand Scaling**: Containers spin up only when needed
3. **Code Generation Bridge**: Seamless code generation across different languages
4. **Shared Context**: Projects can span multiple languages with shared context
5. **Development Tools**: Each container includes language-specific tools and debuggers

## Communication Flow

```
User Request -> Bridge Orchestrator -> Language Container -> Code Generation -> Shared Storage
```

## Getting Started

```bash
# Start all containers
docker-compose up -d

# Start specific language environment
docker-compose up nodejs-container

# Scale specific container
docker-compose up --scale python-container=3
```