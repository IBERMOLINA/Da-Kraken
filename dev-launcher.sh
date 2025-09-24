# Da-Kraken Development Launcher

#!/bin/bash

# Universal Development Environment Launcher
# Allows starting development with one language or all languages simultaneously

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
LAUNCHER_CONFIG="/workspaces/Da-Kraken/.launcher-config.json"
PROJECT_ROOT="/workspaces/Da-Kraken"

# Language configurations
declare -A LANGUAGE_PORTS=(
    ["nodejs"]="3000,3001,5173"
    ["python"]="5000,8000,8888"
    ["java"]="8080,8081"
    ["go"]="8082"
    ["php"]="8085,8086"
    ["zig"]="8087,8088,8089"
    ["rust"]="8090,8091,8092"
    ["elixir"]="8090,8091,8092"
    ["crystal"]="8094,8095,8096"
    ["fortran"]="8097,8098,8099"
)

declare -A LANGUAGE_DESCRIPTIONS=(
    ["nodejs"]="Node.js + TypeScript + React/Vue ecosystem"
    ["python"]="Python + Django/Flask + Data Science stack"
    ["java"]="Java + Spring Boot + Enterprise development"
    ["go"]="Go + Gin/Echo + Microservices"
    ["php"]="PHP + Laravel/Symfony + Web development"
    ["zig"]="Zig + Systems programming + WebAssembly"
    ["rust"]="Rust + Tokio + WebAssembly + Systems"
    ["elixir"]="Elixir + Phoenix + OTP + Functional"
    ["crystal"]="Crystal + Kemal + High performance"
    ["fortran"]="Fortran + Scientific computing + HPC"
)

# Helper functions
log_info() {
    echo -e "${BLUE}[LAUNCHER]${NC} $1"
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

# Initialize configuration
init_config() {
    if [ ! -f "$LAUNCHER_CONFIG" ]; then
        cat > "$LAUNCHER_CONFIG" << 'EOF'
{
  "defaultMode": "interactive",
  "autoInstallDeps": true,
  "startContainers": true,
  "enableHotReload": true,
  "showPorts": true,
  "verboseOutput": false,
  "lastUsedLanguages": ["nodejs", "python"],
  "favoriteStacks": {
    "fullstack": ["nodejs", "python"],
    "systems": ["rust", "go"],
    "scientific": ["python", "fortran"],
    "functional": ["elixir", "crystal"],
    "enterprise": ["java", "php"]
  }
}
EOF
    fi
}

# Show launcher banner
show_banner() {
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║                    🚀 DA-KRAKEN LAUNCHER 🚀                     ║
║                                                                  ║
║              Universal Multi-Language Development                ║
║                        Environment Launcher                      ║
║                                                                  ║
║  • 10 Programming Languages  • Container Orchestration          ║
║  • Hot Reload Support        • Integrated Development Tools     ║
║  • Multi-Stack Development   • Real-time Collaboration          ║
╚══════════════════════════════════════════════════════════════════╝

EOF
}

# Show available languages
show_languages() {
    echo -e "${CYAN}📚 Available Programming Languages:${NC}"
    echo ""
    
    local i=1
    for lang in "${!LANGUAGE_DESCRIPTIONS[@]}"; do
        local ports="${LANGUAGE_PORTS[$lang]}"
        printf "${GREEN}%2d)${NC} %-12s ${BLUE}%-45s${NC} ${YELLOW}(Ports: %s)${NC}\n" \
            "$i" "$lang" "${LANGUAGE_DESCRIPTIONS[$lang]}" "$ports"
        ((i++))
    done
    echo ""
}

# Show favorite stacks
show_stacks() {
    echo -e "${CYAN}🎯 Pre-configured Development Stacks:${NC}"
    echo ""
    
    local stacks=$(jq -r '.favoriteStacks | keys[]' "$LAUNCHER_CONFIG" 2>/dev/null || echo "")
    local i=1
    
    for stack in $stacks; do
        local languages=$(jq -r ".favoriteStacks.$stack[]" "$LAUNCHER_CONFIG" | tr '\n' ', ' | sed 's/,$//')
        printf "${GREEN}%2d)${NC} %-12s ${BLUE}%s${NC}\n" "$i" "$stack" "$languages"
        ((i++))
    done
    echo ""
}

# Interactive language selection
interactive_selection() {
    show_banner
    show_languages
    show_stacks
    
    echo -e "${CYAN}Choose your development setup:${NC}"
    echo "1) 🌟 All languages (full platform)"
    echo "2) 🎯 Select from favorite stacks"
    echo "3) 🔧 Custom language selection"
    echo "4) 🚀 Quick start (last used languages)"
    echo "5) ⚡ Single language development"
    echo "6) 🛠️  Container management only"
    echo ""
    
    read -p "Enter your choice [1-6]: " choice
    
    case $choice in
        1) return_selection "all" ;;
        2) select_favorite_stack ;;
        3) custom_language_selection ;;
        4) quick_start ;;
        5) single_language_selection ;;
        6) container_management ;;
        *) log_warning "Invalid choice, using interactive mode"; interactive_selection ;;
    esac
}

# Select favorite stack
select_favorite_stack() {
    local stacks=($(jq -r '.favoriteStacks | keys[]' "$LAUNCHER_CONFIG" 2>/dev/null))
    
    if [ ${#stacks[@]} -eq 0 ]; then
        log_warning "No favorite stacks configured, using custom selection"
        custom_language_selection
        return
    fi
    
    echo -e "${CYAN}Select a development stack:${NC}"
    local i=1
    for stack in "${stacks[@]}"; do
        local languages=$(jq -r ".favoriteStacks.$stack[]" "$LAUNCHER_CONFIG" | tr '\n' ', ' | sed 's/,$//')
        echo "$i) $stack: $languages"
        ((i++))
    done
    
    read -p "Stack choice [1-${#stacks[@]}]: " stack_choice
    
    if [[ "$stack_choice" =~ ^[0-9]+$ ]] && [ "$stack_choice" -ge 1 ] && [ "$stack_choice" -le ${#stacks[@]} ]; then
        local selected_stack="${stacks[$((stack_choice-1))]}"
        local selected_languages=$(jq -r ".favoriteStacks.$selected_stack | join(\",\")" "$LAUNCHER_CONFIG")
        return_selection "$selected_languages"
    else
        log_error "Invalid selection"
        select_favorite_stack
    fi
}

# Custom language selection
custom_language_selection() {
    echo -e "${CYAN}Select languages (space-separated numbers or names):${NC}"
    show_languages
    
    read -p "Your selection: " selection
    
    local selected_languages=()
    
    # Parse selection (numbers or names)
    for item in $selection; do
        if [[ "$item" =~ ^[0-9]+$ ]]; then
            # Number selection
            local lang_array=($(printf '%s\n' "${!LANGUAGE_DESCRIPTIONS[@]}" | sort))
            if [ "$item" -ge 1 ] && [ "$item" -le ${#lang_array[@]} ]; then
                selected_languages+=("${lang_array[$((item-1))]}")
            fi
        else
            # Name selection
            if [[ -n "${LANGUAGE_DESCRIPTIONS[$item]}" ]]; then
                selected_languages+=("$item")
            fi
        fi
    done
    
    if [ ${#selected_languages[@]} -eq 0 ]; then
        log_error "No valid languages selected"
        custom_language_selection
        return
    fi
    
    local languages_str=$(IFS=','; echo "${selected_languages[*]}")
    return_selection "$languages_str"
}

# Quick start with last used languages
quick_start() {
    local last_used=$(jq -r '.lastUsedLanguages | join(",")' "$LAUNCHER_CONFIG" 2>/dev/null || echo "nodejs,python")
    log_info "Quick starting with: $last_used"
    return_selection "$last_used"
}

# Single language selection
single_language_selection() {
    echo -e "${CYAN}Select a single language for focused development:${NC}"
    show_languages
    
    read -p "Language choice [1-${#LANGUAGE_DESCRIPTIONS[@]}]: " lang_choice
    
    local lang_array=($(printf '%s\n' "${!LANGUAGE_DESCRIPTIONS[@]}" | sort))
    
    if [[ "$lang_choice" =~ ^[0-9]+$ ]] && [ "$lang_choice" -ge 1 ] && [ "$lang_choice" -le ${#lang_array[@]} ]; then
        local selected_lang="${lang_array[$((lang_choice-1))]}"
        return_selection "$selected_lang"
    else
        log_error "Invalid selection"
        single_language_selection
    fi
}

# Container management mode
container_management() {
    log_info "Launching container management interface..."
    cd "$PROJECT_ROOT/containers"
    exec ./manage-containers.sh
}

# Return selection and start development
return_selection() {
    local languages="$1"
    
    log_info "Starting development environment with: $languages"
    
    # Update last used languages
    if [ "$languages" != "all" ]; then
        local lang_array=$(echo "$languages" | tr ',' '\n' | jq -R . | jq -s .)
        jq ".lastUsedLanguages = $lang_array" "$LAUNCHER_CONFIG" > "$LAUNCHER_CONFIG.tmp"
        mv "$LAUNCHER_CONFIG.tmp" "$LAUNCHER_CONFIG"
    fi
    
    # Start the development environment
    start_development_environment "$languages"
}

# Start development environment
start_development_environment() {
    local languages="$1"
    
    log_step "Initializing development environment..."
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Start containers based on selection
    if [ "$languages" = "all" ]; then
        log_info "Starting all language containers..."
        ./containers/manage-containers.sh start
    else
        log_info "Starting selected language containers..."
        IFS=',' read -ra LANG_ARRAY <<< "$languages"
        for lang in "${LANG_ARRAY[@]}"; do
            log_info "Starting $lang container..."
            ./containers/manage-containers.sh start "$lang" || log_warning "Failed to start $lang container"
        done
    fi
    
    # Show active endpoints
    show_active_endpoints "$languages"
    
    # Show quick commands
    show_quick_commands
    
    log_success "Development environment is ready!"
}

# Show active endpoints
show_active_endpoints() {
    local languages="$1"
    
    log_step "Active development endpoints:"
    echo ""
    
    if [ "$languages" = "all" ]; then
        # Show all endpoints
        for lang in "${!LANGUAGE_PORTS[@]}"; do
            local ports="${LANGUAGE_PORTS[$lang]}"
            local main_port=$(echo "$ports" | cut -d',' -f1)
            printf "${GREEN}%-12s${NC} ${BLUE}http://localhost:%-6s${NC} ${YELLOW}%s${NC}\n" \
                "$lang" "$main_port" "${LANGUAGE_DESCRIPTIONS[$lang]}"
        done
    else
        # Show selected endpoints
        IFS=',' read -ra LANG_ARRAY <<< "$languages"
        for lang in "${LANG_ARRAY[@]}"; do
            if [[ -n "${LANGUAGE_PORTS[$lang]}" ]]; then
                local ports="${LANGUAGE_PORTS[$lang]}"
                local main_port=$(echo "$ports" | cut -d',' -f1)
                printf "${GREEN}%-12s${NC} ${BLUE}http://localhost:%-6s${NC} ${YELLOW}%s${NC}\n" \
                    "$lang" "$main_port" "${LANGUAGE_DESCRIPTIONS[$lang]}"
            fi
        done
    fi
    
    echo ""
    echo -e "${CYAN}🌐 Bridge Orchestrator: ${BLUE}http://localhost:4000${NC}"
    echo ""
}

# Show quick commands
show_quick_commands() {
    cat << 'EOF'
🔧 Quick Development Commands:
┌─────────────────────────────────────────────────────────────────┐
│ ./containers/manage-containers.sh status    - Check status      │
│ ./containers/manage-containers.sh logs      - View logs         │
│ ./containers/manage-containers.sh stop      - Stop containers   │
│ ./containers/manage-containers.sh restart   - Restart all       │
│ ./scripts/spellcheck.sh                     - Run spellcheck    │
│ ./dev-launcher.sh                           - Relaunch this tool│
└─────────────────────────────────────────────────────────────────┘

💡 Tips:
• Use Ctrl+C to stop containers gracefully
• Check container logs if services don't start
• All containers share the /shared volume for file exchange
• Bridge orchestrator coordinates cross-container communication

EOF
}

# Command line interface
case "${1:-interactive}" in
    "interactive"|"")
        init_config
        interactive_selection
        ;;
    "all")
        init_config
        return_selection "all"
        ;;
    "quick")
        init_config
        quick_start
        ;;
    "stack")
        init_config
        if [ -n "$2" ]; then
            local stack_languages=$(jq -r ".favoriteStacks.$2 | join(\",\")" "$LAUNCHER_CONFIG" 2>/dev/null)
            if [ "$stack_languages" != "null" ] && [ -n "$stack_languages" ]; then
                return_selection "$stack_languages"
            else
                log_error "Stack '$2' not found"
                exit 1
            fi
        else
            select_favorite_stack
        fi
        ;;
    "lang")
        init_config
        if [ -n "$2" ]; then
            return_selection "$2"
        else
            single_language_selection
        fi
        ;;
    "config")
        init_config
        echo "Current launcher configuration:"
        cat "$LAUNCHER_CONFIG" | jq .
        ;;
    "help"|"-h"|"--help")
        cat << 'EOF'
Da-Kraken Development Launcher

Usage: ./dev-launcher.sh [COMMAND] [OPTIONS]

Commands:
  interactive        Interactive language selection (default)
  all               Start all languages
  quick             Quick start with last used languages
  stack [NAME]      Start a predefined stack
  lang [LANGUAGES]  Start specific languages (comma-separated)
  config            Show current configuration
  help              Show this help

Examples:
  ./dev-launcher.sh                          # Interactive mode
  ./dev-launcher.sh all                      # Start everything
  ./dev-launcher.sh quick                    # Quick start
  ./dev-launcher.sh stack fullstack          # Start fullstack stack
  ./dev-launcher.sh lang nodejs,python       # Start Node.js and Python
  ./dev-launcher.sh lang rust                # Start only Rust

Available Stacks:
  fullstack    - Node.js + Python
  systems      - Rust + Go
  scientific   - Python + Fortran
  functional   - Elixir + Crystal
  enterprise   - Java + PHP

EOF
        ;;
    *)
        log_error "Unknown command: $1"
        log_info "Use './dev-launcher.sh help' for usage information"
        exit 1
        ;;
esac