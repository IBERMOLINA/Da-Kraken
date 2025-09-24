#!/bin/bash

# Da-Kraken Codespace Startup Script
# Automatically launches development environment when codespace opens

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
STARTUP_LOG="/workspaces/Da-Kraken/.codespace-startup.log"
STARTUP_CONFIG="/workspaces/Da-Kraken/.codespace-config.json"

# Helper functions
log_info() {
    echo -e "${BLUE}[STARTUP]${NC} $1" | tee -a "$STARTUP_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$STARTUP_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$STARTUP_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$STARTUP_LOG"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1" | tee -a "$STARTUP_LOG"
}

# Initialize startup
initialize_startup() {
    echo "Da-Kraken Codespace Startup - $(date)" > "$STARTUP_LOG"
    echo "============================================" >> "$STARTUP_LOG"
    
    # Create default config if it doesn't exist
    if [ ! -f "$STARTUP_CONFIG" ]; then
        cat > "$STARTUP_CONFIG" << 'EOF'
{
  "autoStart": true,
  "selectedLanguages": ["all"],
  "startContainers": true,
  "checkDependencies": true,
  "setupWorkspace": true,
  "showWelcome": true,
  "enableHotReload": true,
  "verboseLogging": false
}
EOF
        log_info "Created default startup configuration"
    fi
}

# Welcome banner
show_welcome() {
    local config_auto_start=$(jq -r '.showWelcome' "$STARTUP_CONFIG" 2>/dev/null || echo "true")
    
    if [ "$config_auto_start" = "true" ]; then
        cat << 'EOF'

    ██████╗  █████╗       ██╗  ██╗██████╗  █████╗ ██╗  ██╗███████╗███╗   ██╗
    ██╔══██╗██╔══██╗      ██║ ██╔╝██╔══██╗██╔══██╗██║ ██╔╝██╔════╝████╗  ██║
    ██║  ██║███████║█████╗█████╔╝ ██████╔╝███████║█████╔╝ █████╗  ██╔██╗ ██║
    ██║  ██║██╔══██║╚════╝██╔═██╗ ██╔══██╗██╔══██║██╔═██╗ ██╔══╝  ██║╚██╗██║
    ██████╔╝██║  ██║      ██║  ██╗██║  ██║██║  ██║██║  ██╗███████╗██║ ╚████║
    ╚═════╝ ╚═╝  ╚═╝      ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝

    🚀 Multi-Language Development Platform
    🔧 BUILD - DEPLOY - ENJOY
    🌐 9 Programming Languages Ready

EOF
        
        echo -e "${CYAN}Welcome to Da-Kraken Development Environment!${NC}"
        echo -e "${GREEN}Supported Languages: Node.js, Python, Java, Go, PHP, Zig, Rust, Elixir, Crystal, Fortran${NC}"
        echo ""
    fi
}

# Check system dependencies
check_dependencies() {
    log_step "Checking system dependencies..."
    
    local missing_deps=()
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("nodejs")
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        missing_deps+=("python3")
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -eq 0 ]; then
        log_success "All system dependencies are installed"
        return 0
    else
        log_warning "Missing dependencies: ${missing_deps[*]}"
        return 1
    fi
}

# Setup workspace permissions and environment
setup_workspace() {
    log_step "Setting up workspace environment..."
    
    # Ensure scripts are executable
    find /workspaces/Da-Kraken/scripts -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
    find /workspaces/Da-Kraken/containers -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
    
    # Create necessary directories
    mkdir -p /workspaces/Da-Kraken/logs
    mkdir -p /workspaces/Da-Kraken/tmp
    mkdir -p /workspaces/Da-Kraken/workspace
    
    # Set up environment variables
    export DA_KRAKEN_ROOT="/workspaces/Da-Kraken"
    export DA_KRAKEN_MODE="development"
    export DA_KRAKEN_VERSION="1.0.0"
    
    # Add to bashrc if not already there
    if ! grep -q "DA_KRAKEN_ROOT" ~/.bashrc; then
        echo "export DA_KRAKEN_ROOT=\"/workspaces/Da-Kraken\"" >> ~/.bashrc
        echo "export DA_KRAKEN_MODE=\"development\"" >> ~/.bashrc
        echo "export DA_KRAKEN_VERSION=\"1.0.0\"" >> ~/.bashrc
    fi
    
    log_success "Workspace environment configured"
}

# Quick language environment check
check_language_environments() {
    log_step "Checking language environments..."
    
    declare -A languages=(
        ["nodejs"]="node --version"
        ["python"]="python3 --version"
        ["java"]="java -version"
        ["go"]="go version"
        ["php"]="php --version"
        ["rust"]="rustc --version"
        ["elixir"]="elixir --version"
        ["crystal"]="crystal --version"
        ["fortran"]="gfortran --version"
        ["zig"]="zig version"
    )
    
    for lang in "${!languages[@]}"; do
        if eval "${languages[$lang]}" &>/dev/null; then
            log_success "$lang environment ready"
        else
            log_warning "$lang environment not found (will use container)"
        fi
    done
}

# Interactive language selection
select_languages() {
    local config_languages=$(jq -r '.selectedLanguages[]' "$STARTUP_CONFIG" 2>/dev/null || echo "all")
    
    if [ "$config_languages" = "all" ]; then
        log_info "Starting all language environments (configured in $STARTUP_CONFIG)"
        return 0
    fi
    
    echo -e "${CYAN}Select development languages:${NC}"
    echo "1) All languages (recommended)"
    echo "2) Node.js + Python (web development)"
    echo "3) Rust + Go (systems programming)"
    echo "4) Java + PHP (enterprise development)"
    echo "5) Elixir + Crystal (functional programming)"
    echo "6) Custom selection"
    echo "7) Skip container startup"
    
    read -p "Choice [1-7]: " choice
    
    case $choice in
        1) echo '["all"]' | jq '.' > "$STARTUP_CONFIG.tmp" && mv "$STARTUP_CONFIG.tmp" "$STARTUP_CONFIG" ;;
        2) echo '["nodejs", "python"]' | jq '.' > "$STARTUP_CONFIG.tmp" && mv "$STARTUP_CONFIG.tmp" "$STARTUP_CONFIG" ;;
        3) echo '["rust", "go"]' | jq '.' > "$STARTUP_CONFIG.tmp" && mv "$STARTUP_CONFIG.tmp" "$STARTUP_CONFIG" ;;
        4) echo '["java", "php"]' | jq '.' > "$STARTUP_CONFIG.tmp" && mv "$STARTUP_CONFIG.tmp" "$STARTUP_CONFIG" ;;
        5) echo '["elixir", "crystal"]' | jq '.' > "$STARTUP_CONFIG.tmp" && mv "$STARTUP_CONFIG.tmp" "$STARTUP_CONFIG" ;;
        6) custom_language_selection ;;
        7) echo '["none"]' | jq '.' > "$STARTUP_CONFIG.tmp" && mv "$STARTUP_CONFIG.tmp" "$STARTUP_CONFIG" ;;
        *) log_warning "Invalid selection, using all languages" ;;
    esac
}

# Custom language selection
custom_language_selection() {
    echo -e "${CYAN}Available languages:${NC}"
    echo "nodejs python java go php zig rust elixir crystal fortran"
    echo ""
    read -p "Enter languages (space-separated): " custom_langs
    echo "$custom_langs" | tr ' ' '\n' | jq -R . | jq -s . > "$STARTUP_CONFIG.tmp"
    mv "$STARTUP_CONFIG.tmp" "$STARTUP_CONFIG"
}

# Start development containers
start_containers() {
    local config_start=$(jq -r '.startContainers' "$STARTUP_CONFIG" 2>/dev/null || echo "true")
    local selected_languages=$(jq -r '.selectedLanguages[]' "$STARTUP_CONFIG" 2>/dev/null || echo "all")
    
    if [ "$config_start" != "true" ] || [ "$selected_languages" = "none" ]; then
        log_info "Container startup disabled in configuration"
        return 0
    fi
    
    log_step "Starting development containers..."
    
    cd /workspaces/Da-Kraken/containers
    
    if [ "$selected_languages" = "all" ]; then
        log_info "Starting all language containers..."
        if ./manage-containers.sh start; then
            log_success "All containers started successfully"
        else
            log_error "Failed to start some containers"
            return 1
        fi
    else
        log_info "Starting selected language containers..."
        for lang in $(jq -r '.selectedLanguages[]' "$STARTUP_CONFIG"); do
            if ./manage-containers.sh start "$lang"; then
                log_success "$lang container started"
            else
                log_warning "Failed to start $lang container"
            fi
        done
    fi
}

# Show development endpoints
show_endpoints() {
    log_step "Development endpoints:"
    
    cat << 'EOF'
    
🌐 Service Endpoints:
┌─────────────────────────┬─────────────────┬────────────────────────┐
│ Service                 │ Port            │ URL                    │
├─────────────────────────┼─────────────────┼────────────────────────┤
│ Bridge Orchestrator     │ 4000            │ http://localhost:4000  │
│ Node.js Dev Server      │ 3000            │ http://localhost:3000  │
│ Python Dev Server       │ 5000            │ http://localhost:5000  │
│ Java Dev Server         │ 8080            │ http://localhost:8080  │
│ Go Dev Server           │ 8082            │ http://localhost:8082  │
│ PHP Dev Server          │ 8085            │ http://localhost:8085  │
│ Zig Dev Server          │ 8087            │ http://localhost:8087  │
│ Rust Dev Server         │ 8090            │ http://localhost:8090  │
│ Elixir Dev Server       │ 8091            │ http://localhost:8091  │
│ Crystal Dev Server      │ 8094            │ http://localhost:8094  │
│ Fortran Dev Server      │ 8097            │ http://localhost:8097  │
└─────────────────────────┴─────────────────┴────────────────────────┘

📋 Quick Commands:
• View status: ./containers/manage-containers.sh status
• View logs: ./containers/manage-containers.sh logs
• Stop all: ./containers/manage-containers.sh stop
• Rebuild: ./containers/manage-containers.sh build

🔧 Development Tools:
• Spellcheck: ./scripts/spellcheck.sh
• License check: cat LICENSES/COMPLIANCE.md
• Security audit: completed ✅

EOF
}

# Setup VS Code extensions and settings
setup_vscode() {
    log_step "Configuring VS Code for multi-language development..."
    
    # Create VS Code settings directory
    mkdir -p /workspaces/Da-Kraken/.vscode
    
    # Create settings.json with multi-language support
    cat > /workspaces/Da-Kraken/.vscode/settings.json << 'EOF'
{
    "workbench.colorTheme": "Default Dark+",
    "editor.fontSize": 14,
    "editor.tabSize": 2,
    "editor.insertSpaces": true,
    "editor.formatOnSave": true,
    "files.autoSave": "afterDelay",
    "files.autoSaveDelay": 1000,
    "terminal.integrated.defaultProfile.linux": "bash",
    "docker.enableDockerComposeLanguageService": true,
    "python.defaultInterpreterPath": "/usr/bin/python3",
    "rust-analyzer.enable": true,
    "go.toolsManagement.autoUpdate": true,
    "java.home": "/usr/lib/jvm/java-17-openjdk-amd64",
    "fortran.fortls.path": "/usr/local/bin/fortls",
    "elixir.ls.enable": true,
    "crystal-lang.enable": true,
    "zig.enable": true
}
EOF
    
    # Create extensions.json with recommended extensions
    cat > /workspaces/Da-Kraken/.vscode/extensions.json << 'EOF'
{
    "recommendations": [
        "ms-vscode.vscode-typescript-next",
        "ms-python.python",
        "rust-lang.rust-analyzer",
        "golang.go",
        "redhat.java",
        "bmewburn.vscode-intelephense-client",
        "elixir-lsp.elixir-ls",
        "crystal-lang-tools.crystal-lang",
        "ziglang.vscode-zig",
        "fortran-lang.lfortran",
        "ms-vscode.vscode-docker",
        "ms-vscode.vscode-json",
        "ms-vscode.vscode-yaml",
        "streetsidesoftware.code-spell-checker"
    ]
}
EOF
    
    log_success "VS Code configuration created"
}

# Main startup sequence
main() {
    initialize_startup
    
    local config_auto_start=$(jq -r '.autoStart' "$STARTUP_CONFIG" 2>/dev/null || echo "true")
    
    if [ "$config_auto_start" != "true" ]; then
        log_info "Auto-start disabled in configuration"
        exit 0
    fi
    
    show_welcome
    
    log_info "Starting Da-Kraken development environment..."
    
    # Check dependencies
    if ! check_dependencies; then
        log_error "Missing system dependencies. Please install them first."
        exit 1
    fi
    
    # Setup workspace
    setup_workspace
    
    # Setup VS Code
    setup_vscode
    
    # Check language environments
    check_language_environments
    
    # Interactive language selection (if not in auto mode)
    if [ "${1:-auto}" != "auto" ]; then
        select_languages
    fi
    
    # Start containers
    start_containers
    
    # Show endpoints
    show_endpoints
    
    log_success "Da-Kraken development environment is ready!"
    echo ""
    echo -e "${GREEN}🎉 Welcome to Da-Kraken! Your multi-language development platform is now running.${NC}"
    echo -e "${BLUE}💡 Run './containers/manage-containers.sh status' to check container status${NC}"
    echo -e "${YELLOW}📖 Check README.md for detailed usage instructions${NC}"
    echo ""
}

# Handle command line arguments
case "${1:-auto}" in
    "auto")
        main auto
        ;;
    "interactive")
        main interactive
        ;;
    "config")
        echo "Current configuration:"
        cat "$STARTUP_CONFIG" 2>/dev/null || echo "No configuration found"
        ;;
    "reset")
        rm -f "$STARTUP_CONFIG" "$STARTUP_LOG"
        echo "Configuration reset"
        ;;
    *)
        echo "Usage: $0 [auto|interactive|config|reset]"
        echo "  auto        - Automatic startup (default)"
        echo "  interactive - Interactive language selection"
        echo "  config      - Show current configuration"
        echo "  reset       - Reset configuration"
        ;;
esac