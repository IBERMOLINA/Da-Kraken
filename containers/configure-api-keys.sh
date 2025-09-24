#!/bin/bash

# Enhanced API Key Configuration Script for Da-Kraken
# Supports real API keys with secure JSON safe encoding

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env"
BACKUP_FILE=".env.backup"

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

show_header() {
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                🔑 Da-Kraken API Key Configurator             ║
║          Real API Keys Setup with Security Features         ║
╚══════════════════════════════════════════════════════════════╝
EOF
}

# Validate API key format
validate_openai_key() {
    local key="$1"
    if [[ $key =~ ^sk-[a-zA-Z0-9]{48}$ ]] || [[ $key =~ ^sk-proj-[a-zA-Z0-9_-]{64}$ ]]; then
        return 0
    else
        return 1
    fi
}

validate_anthropic_key() {
    local key="$1"
    if [[ $key =~ ^sk-ant-api03-[a-zA-Z0-9_-]{95}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Secure key input with validation
read_api_key() {
    local service="$1"
    local validator="$2"
    local key=""
    
    while true; do
        echo -n "Enter your $service API key: "
        read -s key
        echo
        
        if [ -z "$key" ]; then
            log_warning "API key cannot be empty. Please try again."
            continue
        fi
        
        if $validator "$key"; then
            echo "$key"
            return 0
        else
            log_error "Invalid $service API key format. Please check and try again."
            log_info "Expected format for $service:"
            case "$service" in
                "OpenAI")
                    log_info "  - Standard: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (48 chars)"
                    log_info "  - Project:  sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (64+ chars)"
                    ;;
                "Anthropic")
                    log_info "  - Format: sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (95+ chars)"
                    ;;
            esac
        fi
    done
}

# Test API key functionality
test_openai_key() {
    local key="$1"
    log_info "Testing OpenAI API key..."
    
    response=$(curl -s -w "%{http_code}" -o /tmp/openai_test.json \
        -H "Authorization: Bearer $key" \
        -H "Content-Type: application/json" \
        -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Hello"}],"max_tokens":5}' \
        https://api.openai.com/v1/chat/completions)
    
    if [ "$response" = "200" ]; then
        log_success "OpenAI API key is valid and working!"
        return 0
    else
        log_error "OpenAI API key test failed (HTTP $response)"
        if [ -f /tmp/openai_test.json ]; then
            cat /tmp/openai_test.json
        fi
        return 1
    fi
}

test_anthropic_key() {
    local key="$1"
    log_info "Testing Anthropic API key..."
    
    response=$(curl -s -w "%{http_code}" -o /tmp/anthropic_test.json \
        -H "x-api-key: $key" \
        -H "Content-Type: application/json" \
        -H "anthropic-version: 2023-06-01" \
        -d '{"model":"claude-3-haiku-20240307","max_tokens":5,"messages":[{"role":"user","content":"Hello"}]}' \
        https://api.anthropic.com/v1/messages)
    
    if [ "$response" = "200" ]; then
        log_success "Anthropic API key is valid and working!"
        return 0
    else
        log_error "Anthropic API key test failed (HTTP $response)"
        if [ -f /tmp/anthropic_test.json ]; then
            cat /tmp/anthropic_test.json
        fi
        return 1
    fi
}

# Create secure .env file
create_env_file() {
    local openai_key="$1"
    local anthropic_key="$2"
    
    # Backup existing .env if it exists
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "$BACKUP_FILE"
        log_info "Backed up existing .env to $BACKUP_FILE"
    fi
    
    # Create new .env with secure configuration
    cat > "$ENV_FILE" << EOF
# Da-Kraken API Configuration
# Generated on $(date)
# Security: JSON Safe Encoding Enabled

# AI Service API Keys
OPENAI_API_KEY=$openai_key
ANTHROPIC_API_KEY=$anthropic_key

# Security Configuration
USE_MOCK_AI=false
JSON_SAFE_ENCODING=true
API_RATE_LIMIT_ENABLED=true
API_TIMEOUT=30000
MAX_REQUEST_SIZE=1048576

# Container Configuration
CONTAINER_MEMORY_LIMIT=2g
CONTAINER_CPU_LIMIT=1.0
BRIDGE_PORT=4000
REDIS_URL=redis://redis:6379
NODE_ENV=production
LOG_LEVEL=info

# Security Headers
SECURITY_HEADERS_ENABLED=true
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# JSON Safe Encoding Settings
JSON_MAX_DEPTH=10
JSON_MAX_STRING_LENGTH=10000
JSON_SANITIZE_HTML=true
JSON_VALIDATE_TYPES=true

# Monitoring
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true
ERROR_REPORTING_ENABLED=true
EOF

    # Set secure permissions
    chmod 600 "$ENV_FILE"
    log_success "Created secure .env file with permissions 600"
}

# Main setup function
setup_real_api_keys() {
    show_header
    
    log_info "Setting up real API keys with enhanced security..."
    echo
    
    # Get OpenAI API key
    log_info "🤖 OpenAI API Key Setup"
    log_info "Get your API key from: https://platform.openai.com/api-keys"
    openai_key=$(read_api_key "OpenAI" validate_openai_key)
    
    echo
    
    # Get Anthropic API key
    log_info "🧠 Anthropic API Key Setup"
    log_info "Get your API key from: https://console.anthropic.com/settings/keys"
    anthropic_key=$(read_api_key "Anthropic" validate_anthropic_key)
    
    echo
    
    # Test API keys
    log_info "🧪 Testing API keys..."
    
    openai_valid=false
    anthropic_valid=false
    
    if test_openai_key "$openai_key"; then
        openai_valid=true
    fi
    
    if test_anthropic_key "$anthropic_key"; then
        anthropic_valid=true
    fi
    
    if [ "$openai_valid" = true ] && [ "$anthropic_valid" = true ]; then
        log_success "Both API keys are valid!"
        
        # Create configuration
        create_env_file "$openai_key" "$anthropic_key"
        
        echo
        log_success "✅ API keys configured successfully!"
        log_info "🔒 JSON Safe Encoding enabled for enhanced security"
        log_info "🛡️  Rate limiting and security headers configured"
        log_info "📊 Monitoring and health checks enabled"
        
        echo
        log_info "Next steps:"
        log_info "1. Start the system: ./manage-containers.sh start"
        log_info "2. Test generation: curl -X POST http://localhost:4000/generate -H 'Content-Type: application/json' -d '{\"prompt\":\"Hello world\",\"language\":\"javascript\"}'"
        log_info "3. Check health: curl http://localhost:4000/health"
        
    else
        log_error "❌ API key validation failed. Please check your keys and try again."
        exit 1
    fi
}

# Check if running as main script
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    setup_real_api_keys
fi