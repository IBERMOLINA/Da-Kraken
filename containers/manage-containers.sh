#!/bin/bash

# Multi-Language Container Management Script
# Usage: ./manage-containers.sh [command] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="da-kraken"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    cat << EOF
Multi-Language Container Management Script

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    start [language]     Start containers (all or specific language)
    stop [language]      Stop containers (all or specific language)
    restart [language]   Restart containers (all or specific language)
    build [language]     Build containers (all or specific language)
    status              Show container status
    logs [service]      Show logs for service
    clean               Clean up stopped containers and unused images
    scale [service] [n] Scale service to n instances
    exec [service] [cmd] Execute command in running container
    generate            Start code generation session
    bridge              Start bridge orchestrator only

Languages:
    nodejs, python, java, go, rust, cpp

Examples:
    $0 start                    # Start all containers
    $0 start nodejs             # Start Node.js container only
    $0 build python             # Build Python container
    $0 scale python-container 3 # Scale Python container to 3 instances
    $0 exec nodejs-container bash # Open bash in Node.js container
    $0 generate                 # Start interactive code generation

EOF
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Build containers
build_containers() {
    local language=$1
    
    if [ -n "$language" ]; then
        log_info "Building $language container..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME build ${language}-container
    else
        log_info "Building all containers..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME build
    fi
    
    log_success "Build completed!"
}

# Start containers
start_containers() {
    local language=$1
    
    if [ -n "$language" ]; then
        log_info "Starting $language development environment..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME --profile $language up -d
    else
        log_info "Starting all containers..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME --profile all up -d
    fi
    
    log_success "Containers started!"
    show_endpoints
}

# Stop containers
stop_containers() {
    local language=$1
    
    if [ -n "$language" ]; then
        log_info "Stopping $language containers..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME stop ${language}-container
    else
        log_info "Stopping all containers..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    fi
    
    log_success "Containers stopped!"
}

# Restart containers
restart_containers() {
    local language=$1
    
    log_info "Restarting containers..."
    stop_containers $language
    sleep 2
    start_containers $language
}

# Show container status
show_status() {
    log_info "Container Status:"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    
    echo
    log_info "Docker System Info:"
    docker system df
}

# Show container logs
show_logs() {
    local service=${1:-bridge-orchestrator}
    
    log_info "Showing logs for $service..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f $service
}

# Clean up Docker resources
clean_up() {
    log_info "Cleaning up Docker resources..."
    
    # Remove stopped containers
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down --remove-orphans
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    log_success "Cleanup completed!"
}

# Scale service
scale_service() {
    local service=$1
    local replicas=${2:-1}
    
    log_info "Scaling $service to $replicas instances..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d --scale $service=$replicas
    
    log_success "Service scaled!"
}

# Execute command in container
exec_command() {
    local service=$1
    local command=${2:-bash}
    
    log_info "Executing '$command' in $service..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec $service $command
}

# Show service endpoints
show_endpoints() {
    cat << EOF

🚀 Service Endpoints:
┌─────────────────────────┬─────────────────┬────────────────────────┐
│ Service                 │ Port            │ URL                    │
├─────────────────────────┼─────────────────┼────────────────────────┤
│ Bridge Orchestrator     │ 4000            │ http://localhost:4000  │
│ Code Generation API     │ 4001            │ http://localhost:4001  │
│ Node.js Dev Server      │ 3000, 3001, 5173│ http://localhost:3000  │
│ Python Dev Server       │ 5000, 8000, 8888│ http://localhost:5000  │
│ Java Dev Server         │ 8080, 8081      │ http://localhost:8080  │
│ Go Dev Server           │ 8082            │ http://localhost:8082  │
│ Rust Dev Server         │ 8083            │ http://localhost:8083  │
│ C++ Dev Server          │ 8084            │ http://localhost:8084  │
│ Redis                   │ 6379            │ redis://localhost:6379 │
└─────────────────────────┴─────────────────┴────────────────────────┘

EOF
}

# Interactive code generation
start_code_generation() {
    log_info "Starting interactive code generation session..."
    
    # Check if bridge orchestrator is running
    if ! docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps | grep -q bridge-orchestrator; then
        log_info "Starting bridge orchestrator..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d bridge-orchestrator
        sleep 5
    fi
    
    log_success "Code generation environment ready!"
    
    cat << EOF

🤖 Interactive Code Generation Session Started!

Available commands:
- curl -X POST http://localhost:4000/generate \\
    -H "Content-Type: application/json" \\
    -d '{"prompt": "Create a REST API", "language": "nodejs"}'

- Open http://localhost:4000/health to check status

Languages: nodejs, python, java, go, rust, cpp

EOF
}

# Start bridge orchestrator only
start_bridge() {
    log_info "Starting bridge orchestrator..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d bridge-orchestrator redis
    
    log_success "Bridge orchestrator started!"
    show_endpoints
}

# Main script logic
main() {
    check_dependencies
    
    case "${1:-help}" in
        start)
            start_containers $2
            ;;
        stop)
            stop_containers $2
            ;;
        restart)
            restart_containers $2
            ;;
        build)
            build_containers $2
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs $2
            ;;
        clean)
            clean_up
            ;;
        scale)
            scale_service $2 $3
            ;;
        exec)
            exec_command $2 "$3"
            ;;
        generate)
            start_code_generation
            ;;
        bridge)
            start_bridge
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"