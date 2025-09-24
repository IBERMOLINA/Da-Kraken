#!/bin/bash

# Da-Kraken Secure Key Management Script
# Handles secure storage and retrieval of API keys and sensitive data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
KEY_STORE_DIR="/workspaces/Da-Kraken/.keys"
ENV_FILE="/workspaces/Da-Kraken/containers/.env"
TEMPLATE_FILE="/workspaces/Da-Kraken/containers/.env.template"

# Helper functions
log_info() {
    echo -e "${BLUE}[KEY-MGR]${NC} $1"
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

# Initialize secure key storage
init_key_store() {
    log_info "Initializing secure key storage..."
    
    # Create secure key directory
    mkdir -p "$KEY_STORE_DIR"
    chmod 700 "$KEY_STORE_DIR"
    
    # Add to .gitignore if not already there
    if ! grep -q ".keys/" /workspaces/Da-Kraken/.gitignore 2>/dev/null; then
        echo ".keys/" >> /workspaces/Da-Kraken/.gitignore
        echo "containers/.env" >> /workspaces/Da-Kraken/.gitignore
        log_info "Added key directories to .gitignore"
    fi
    
    log_success "Key storage initialized"
}

# Generate secure random keys
generate_keys() {
    log_info "Generating secure random keys..."
    
    # Generate encryption key
    openssl rand -hex 32 > "$KEY_STORE_DIR/encryption.key"
    
    # Generate JWT secret
    openssl rand -base64 64 > "$KEY_STORE_DIR/jwt.secret"
    
    # Generate session secret
    openssl rand -base64 32 > "$KEY_STORE_DIR/session.secret"
    
    # Generate Redis password
    openssl rand -base64 16 > "$KEY_STORE_DIR/redis.password"
    
    # Generate handshake secret for secure communication
    openssl rand -hex 32 > "$KEY_STORE_DIR/handshake.secret"
    
    # Set secure permissions
    chmod 600 "$KEY_STORE_DIR"/*
    
    log_success "Secure keys generated"
}

# Set API keys interactively
set_api_keys() {
    log_info "Setting up API keys..."
    
    echo -e "${YELLOW}Enter your API keys (press Enter to skip):${NC}"
    
    # OpenAI API Key
    echo -n "OpenAI API Key: "
    read -s openai_key
    echo
    if [ -n "$openai_key" ]; then
        echo -n "$openai_key" > "$KEY_STORE_DIR/openai.key"
        chmod 600 "$KEY_STORE_DIR/openai.key"
        log_success "OpenAI key stored securely"
    fi
    
    # Anthropic API Key
    echo -n "Anthropic API Key: "
    read -s anthropic_key
    echo
    if [ -n "$anthropic_key" ]; then
        echo -n "$anthropic_key" > "$KEY_STORE_DIR/anthropic.key"
        chmod 600 "$KEY_STORE_DIR/anthropic.key"
        log_success "Anthropic key stored securely"
    fi
}

# Load key from secure storage
load_key() {
    local key_name="$1"
    local key_file="$KEY_STORE_DIR/$key_name"
    
    if [ -f "$key_file" ]; then
        cat "$key_file"
    else
        echo "placeholder_${key_name}"
    fi
}

# Generate environment file from template
generate_env_file() {
    log_info "Generating environment file from template..."
    
    # Copy template
    cp "$TEMPLATE_FILE" "$ENV_FILE"
    
    # Replace placeholders with actual keys (using temporary files to avoid sed issues)
    local openai_key=$(load_key openai.key)
    local anthropic_key=$(load_key anthropic.key)
    local encryption_key=$(load_key encryption.key)
    local jwt_secret=$(load_key jwt.secret)
    local session_secret=$(load_key session.secret)
    local redis_password=$(load_key redis.password)
    local handshake_secret=$(load_key handshake.secret)
    
    sed -i "s|your_openai_api_key_here|$openai_key|g" "$ENV_FILE"
    sed -i "s|your_anthropic_api_key_here|$anthropic_key|g" "$ENV_FILE"
    sed -i "s|generate_random_key_here|$encryption_key|g" "$ENV_FILE"
    sed -i "s|generate_jwt_secret_here|$jwt_secret|g" "$ENV_FILE"
    sed -i "s|generate_session_secret_here|$session_secret|g" "$ENV_FILE"
    sed -i "s|generate_redis_password_here|$redis_password|g" "$ENV_FILE"
    sed -i "s|generate_handshake_secret_here|$handshake_secret|g" "$ENV_FILE"
    
    # Set secure permissions
    chmod 600 "$ENV_FILE"
    
    log_success "Environment file generated with secure keys"
}

# Show key status
show_status() {
    log_info "Key Management Status:"
    echo ""
    
    echo "🔐 Secure Key Storage:"
    if [ -d "$KEY_STORE_DIR" ]; then
        echo "  ✅ Key store directory exists"
        echo "  📁 Location: $KEY_STORE_DIR"
        echo "  🔒 Permissions: $(stat -c %a "$KEY_STORE_DIR")"
        echo ""
        
        echo "🗝️  Available Keys:"
        for key_file in "$KEY_STORE_DIR"/*; do
            if [ -f "$key_file" ]; then
                local key_name=$(basename "$key_file")
                local key_size=$(wc -c < "$key_file")
                echo "  ✅ $key_name ($key_size bytes)"
            fi
        done
    else
        echo "  ❌ Key store not initialized"
    fi
    
    echo ""
    echo "📄 Environment File:"
    if [ -f "$ENV_FILE" ]; then
        echo "  ✅ Environment file exists"
        echo "  🔒 Permissions: $(stat -c %a "$ENV_FILE")"
    else
        echo "  ❌ Environment file not found"
    fi
}

# Rotate keys
rotate_keys() {
    log_warning "Rotating all keys..."
    
    # Backup existing keys
    if [ -d "$KEY_STORE_DIR" ]; then
        backup_dir="$KEY_STORE_DIR.backup.$(date +%Y%m%d_%H%M%S)"
        cp -r "$KEY_STORE_DIR" "$backup_dir"
        log_info "Backed up existing keys to $backup_dir"
    fi
    
    # Generate new keys
    generate_keys
    generate_env_file
    
    log_success "Keys rotated successfully"
}

# Main command handling
case "${1:-help}" in
    "init")
        init_key_store
        generate_keys
        generate_env_file
        ;;
    "set-api")
        init_key_store
        set_api_keys
        generate_env_file
        ;;
    "generate")
        generate_keys
        generate_env_file
        ;;
    "status")
        show_status
        ;;
    "rotate")
        rotate_keys
        ;;
    "help"|*)
        cat << 'EOF'
Da-Kraken Secure Key Management

Usage: ./secure-keys.sh [COMMAND]

Commands:
  init      Initialize key store and generate all keys
  set-api   Set API keys interactively
  generate  Generate new random keys
  status    Show key management status
  rotate    Rotate all keys (creates backup)
  help      Show this help

Security Features:
• Keys stored in secure directory (.keys/)
• Proper file permissions (600/700)
• Automatic .gitignore configuration
• Template-based environment generation
• Key rotation with backup

EOF
        ;;
esac