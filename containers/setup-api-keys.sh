#!/bin/bash

# API Key Fetcher and Setup Script
# This script helps you get API keys and configure the container system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

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

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

show_header() {
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                    🔑 API Key Setup Wizard                   ║
║              Get API Keys for Da-Kraken Containers          ║
╚══════════════════════════════════════════════════════════════╝
EOF
}

show_menu() {
    echo
    echo "Choose your setup option:"
    echo "1) 🚀 Quick Start with Mock Keys (No real API keys needed)"
    echo "2) 🆓 Setup Free API Keys (OpenAI + Anthropic free tiers)"  
    echo "3) 🏠 Setup Local AI (Ollama - No API keys needed)"
    echo "4) 🔄 Use Alternative Free APIs (Hugging Face, Cohere)"
    echo "5) ⚙️  Manual API Key Entry"
    echo "6) 📋 Show API Key Status"
    echo "7) 🧪 Test Current Configuration"
    echo "8) ❓ Help & Documentation"
    echo "0) Exit"
    echo
}

setup_mock_keys() {
    log_step "Setting up mock API keys for testing..."
    
    cat > .env << EOF
# Mock API Keys for Testing
OPENAI_API_KEY=mock-openai-test-key-$(date +%s)
ANTHROPIC_API_KEY=mock-anthropic-test-key-$(date +%s)
USE_MOCK_AI=true

# Container Configuration
CONTAINER_MEMORY_LIMIT=1g
CONTAINER_CPU_LIMIT=0.5
BRIDGE_PORT=4000
REDIS_URL=redis://redis:6379
NODE_ENV=development
LOG_LEVEL=info
EOF

    log_success "Mock API keys configured!"
    log_info "You can now start the containers with: ./manage-containers.sh start"
    log_warning "Note: This uses mock responses for testing only"
}

setup_free_apis() {
    log_step "Setting up free API keys..."
    
    echo
    echo "🎯 Getting Free API Keys:"
    echo
    echo "1. OpenAI (Free $5 credits):"
    echo "   → Visit: https://platform.openai.com/signup"
    echo "   → Sign up with email"
    echo "   → Go to API Keys section"
    echo "   → Create new secret key"
    echo "   → Copy the key (starts with 'sk-')"
    echo
    echo "2. Anthropic (Free $5 credits):"
    echo "   → Visit: https://console.anthropic.com/"
    echo "   → Sign up with email"
    echo "   → Go to API Keys section" 
    echo "   → Create new API key"
    echo "   → Copy the key (starts with 'sk-ant-')"
    echo

    read -p "Press Enter when you have obtained your API keys..."

    echo
    read -p "Enter your OpenAI API key (or press Enter to skip): " openai_key
    read -p "Enter your Anthropic API key (or press Enter to skip): " anthropic_key

    # Create .env file
    cat > .env << EOF
# Free Tier API Keys
OPENAI_API_KEY=${openai_key:-mock-openai-key}
ANTHROPIC_API_KEY=${anthropic_key:-mock-anthropic-key}
USE_MOCK_AI=${openai_key:+false}${openai_key:-true}

# Model Configuration
OPENAI_MODEL=gpt-3.5-turbo
ANTHROPIC_MODEL=claude-3-haiku-20240307
OPENAI_MAX_TOKENS=500
ANTHROPIC_MAX_TOKENS=500

# Container Configuration
CONTAINER_MEMORY_LIMIT=1g
CONTAINER_CPU_LIMIT=0.5
BRIDGE_PORT=4000
REDIS_URL=redis://redis:6379
NODE_ENV=development
LOG_LEVEL=info
EOF

    log_success "Free API keys configured!"
    
    if [[ -n "$openai_key" || -n "$anthropic_key" ]]; then
        test_api_keys
    fi
}

setup_local_ai() {
    log_step "Setting up local AI with Ollama..."
    
    if ! command -v ollama &> /dev/null; then
        log_info "Installing Ollama..."
        curl -fsSL https://ollama.com/install.sh | sh
    else
        log_info "Ollama already installed!"
    fi
    
    log_info "Starting Ollama service..."
    ollama serve &
    sleep 3
    
    log_info "Pulling coding models..."
    ollama pull codellama:7b
    ollama pull deepseek-coder:6.7b
    
    cat > .env << EOF
# Local AI Configuration
USE_LOCAL_AI=true
OLLAMA_HOST=http://localhost:11434
LOCAL_MODEL=codellama:7b

# Fallback mock keys
OPENAI_API_KEY=local-ai-mock-key
ANTHROPIC_API_KEY=local-ai-mock-key
USE_MOCK_AI=false

# Container Configuration
CONTAINER_MEMORY_LIMIT=1g
CONTAINER_CPU_LIMIT=0.5
BRIDGE_PORT=4000
REDIS_URL=redis://redis:6379
NODE_ENV=development
LOG_LEVEL=info
EOF

    log_success "Local AI configured with Ollama!"
    log_info "Available models: codellama:7b, deepseek-coder:6.7b"
}

setup_alternative_apis() {
    log_step "Setting up alternative free APIs..."
    
    echo
    echo "🔄 Alternative Free APIs:"
    echo
    echo "1. Hugging Face (30k characters/month free):"
    echo "   → Visit: https://huggingface.co/settings/tokens"
    echo "   → Create new token"
    echo "   → Copy token (starts with 'hf_')"
    echo
    echo "2. Cohere (100 API calls/month free):"
    echo "   → Visit: https://dashboard.cohere.ai/api-keys"
    echo "   → Sign up and create API key"
    echo
    
    read -p "Enter Hugging Face token (or press Enter to skip): " hf_token
    read -p "Enter Cohere API key (or press Enter to skip): " cohere_key
    
    cat > .env << EOF
# Alternative API Configuration
HUGGINGFACE_API_KEY=${hf_token:-}
HF_MODEL=microsoft/DialoGPT-medium
COHERE_API_KEY=${cohere_key:-}

# Fallback configuration
OPENAI_API_KEY=alternative-api-mock-key
ANTHROPIC_API_KEY=alternative-api-mock-key
USE_MOCK_AI=true

# Container Configuration
CONTAINER_MEMORY_LIMIT=1g
CONTAINER_CPU_LIMIT=0.5
BRIDGE_PORT=4000
REDIS_URL=redis://redis:6379
NODE_ENV=development
LOG_LEVEL=info
EOF

    log_success "Alternative APIs configured!"
}

manual_api_entry() {
    log_step "Manual API key entry..."
    
    echo
    read -p "Enter OpenAI API key: " openai_key
    read -p "Enter Anthropic API key: " anthropic_key
    read -p "Enter OpenAI model (default: gpt-3.5-turbo): " openai_model
    read -p "Enter Anthropic model (default: claude-3-haiku-20240307): " anthropic_model
    
    openai_model=${openai_model:-gpt-3.5-turbo}
    anthropic_model=${anthropic_model:-claude-3-haiku-20240307}
    
    cat > .env << EOF
# Manual API Key Configuration
OPENAI_API_KEY=${openai_key}
ANTHROPIC_API_KEY=${anthropic_key}
OPENAI_MODEL=${openai_model}
ANTHROPIC_MODEL=${anthropic_model}
USE_MOCK_AI=false

# Container Configuration
CONTAINER_MEMORY_LIMIT=1g
CONTAINER_CPU_LIMIT=0.5
BRIDGE_PORT=4000
REDIS_URL=redis://redis:6379
NODE_ENV=development
LOG_LEVEL=info
EOF

    log_success "Manual API keys configured!"
    test_api_keys
}

show_api_status() {
    log_step "Checking API key status..."
    
    if [[ ! -f .env ]]; then
        log_warning "No .env file found. Run setup first."
        return
    fi
    
    source .env
    
    echo
    echo "📊 Current Configuration:"
    echo "─────────────────────────"
    
    if [[ "${USE_MOCK_AI:-false}" == "true" ]]; then
        echo "🧪 Mock AI: ENABLED"
    fi
    
    if [[ "${USE_LOCAL_AI:-false}" == "true" ]]; then
        echo "🏠 Local AI: ENABLED (${LOCAL_MODEL:-codellama:7b})"
    fi
    
    if [[ -n "${OPENAI_API_KEY}" && "${OPENAI_API_KEY}" != *"mock"* ]]; then
        echo "🤖 OpenAI: CONFIGURED (${OPENAI_MODEL:-gpt-3.5-turbo})"
    fi
    
    if [[ -n "${ANTHROPIC_API_KEY}" && "${ANTHROPIC_API_KEY}" != *"mock"* ]]; then
        echo "🧠 Anthropic: CONFIGURED (${ANTHROPIC_MODEL:-claude-3-haiku-20240307})"
    fi
    
    if [[ -n "${HUGGINGFACE_API_KEY}" ]]; then
        echo "🤗 Hugging Face: CONFIGURED"
    fi
    
    if [[ -n "${COHERE_API_KEY}" ]]; then
        echo "🔄 Cohere: CONFIGURED"
    fi
    
    echo
}

test_api_keys() {
    log_step "Testing API configuration..."
    
    if [[ ! -f .env ]]; then
        log_error "No .env file found!"
        return 1
    fi
    
    # Start containers in background
    log_info "Starting test containers..."
    ./manage-containers.sh bridge &
    sleep 10
    
    # Test health endpoint
    if curl -s http://localhost:4000/health > /dev/null; then
        log_success "Bridge orchestrator is running!"
        
        # Test code generation
        log_info "Testing code generation..."
        response=$(curl -s -X POST http://localhost:4000/generate \
            -H "Content-Type: application/json" \
            -d '{"prompt": "hello world", "language": "javascript"}' || echo "error")
        
        if [[ "$response" != "error" ]]; then
            log_success "Code generation API is working!"
        else
            log_warning "Code generation test failed (this might be expected with mock keys)"
        fi
    else
        log_error "Bridge orchestrator failed to start"
    fi
}

show_help() {
    cat << EOF

📚 Help & Documentation

Quick Links:
• Full Setup Guide: ./API_KEYS_SETUP.md
• Container Management: ./manage-containers.sh help
• Architecture Docs: ./README.md

API Key Sources:
• OpenAI: https://platform.openai.com/api-keys
• Anthropic: https://console.anthropic.com/
• Hugging Face: https://huggingface.co/settings/tokens
• Cohere: https://dashboard.cohere.ai/api-keys

Free Alternatives:
• Ollama (Local): https://ollama.com/
• Hugging Face Inference API
• Google AI Studio (Gemini)

Commands:
• Start containers: ./manage-containers.sh start
• View logs: ./manage-containers.sh logs bridge-orchestrator
• Test generation: curl -X POST http://localhost:4000/generate -H "Content-Type: application/json" -d '{"prompt":"hello","language":"javascript"}'

EOF
}

# Main menu loop
main() {
    show_header
    
    while true; do
        show_menu
        read -p "Choose an option (0-8): " choice
        
        case $choice in
            1)
                setup_mock_keys
                ;;
            2)
                setup_free_apis
                ;;
            3)
                setup_local_ai
                ;;
            4)
                setup_alternative_apis
                ;;
            5)
                manual_api_entry
                ;;
            6)
                show_api_status
                ;;
            7)
                test_api_keys
                ;;
            8)
                show_help
                ;;
            0)
                log_info "Goodbye!"
                exit 0
                ;;
            *)
                log_error "Invalid option. Please choose 0-8."
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Run main function
main "$@"