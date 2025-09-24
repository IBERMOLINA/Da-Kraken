#!/bin/bash

# Da-Kraken Spellcheck Script
# Comprehensive spellcheck for documentation and comments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SPELLCHECK_DIR="/workspaces/Da-Kraken"
REPORT_FILE="$SPELLCHECK_DIR/spellcheck-report.txt"
WORDLIST_FILE="$SPELLCHECK_DIR/.aspell.wordlist"

# Create custom wordlist for technical terms
create_wordlist() {
    cat > "$WORDLIST_FILE" << 'EOF'
# Technical terms and project-specific words
Da-Kraken
Kraken
IBERMOLINA
codespace
codespaces
dockerfile
Dockerfile
nodejs
python
elixir
fortran
FORTRAN
gfortran
lapack
blas
fftw
openmp
openmpi
coarrays
tokio
serde
kemal
phoenix
ecto
genserver
liveview
websocket
websockets
API
APIs
JSON
HTTP
HTTPS
REST
GraphQL
npm
pip
cargo
mix
shards
fpm
cmake
makefile
gitignore
TypeScript
JavaScript
WebAssembly
async
await
microservice
microservices
containerization
orchestrator
redis
docker
compose
kubernetes
kubectl
cicd
devops
localhost
middleware
backend
frontend
fullstack
regex
XSS
CSRF
SQL
NoSQL
PostgreSQL
MongoDB
filesystem
env
config
configs
deps
workflows
README
TODO
FIXME
MIT
GPL
BSD
Apache
PSF
copyleft
repo
repos
github
vscode
ubuntu
debian
linux
unix
glibc
musl
x86
amd64
arm64
EOF
}

# Log functions
log_info() {
    echo -e "${BLUE}[SPELLCHECK]${NC} $1"
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

# Spellcheck function
spellcheck_file() {
    local file="$1"
    local temp_file="/tmp/spellcheck_temp.txt"
    local errors_found=0
    
    # Extract text content based on file type
    case "$file" in
        *.md)
            # Markdown files - exclude code blocks
            grep -v '```' "$file" | grep -v '`[^`]*`' > "$temp_file" 2>/dev/null || echo -n > "$temp_file"
            ;;
        *.js|*.py|*.html|*.css|*.json|*.yml|*.yaml)
            # Code files - extract comments and strings
            grep -E '(#.*|//.*|/\*.*\*/|<!--.*-->|"[^"]*"|'"'"'[^'"'"']*'"'"')' "$file" > "$temp_file" 2>/dev/null || echo -n > "$temp_file"
            ;;
        *.txt|*.sh)
            # Plain text and scripts
            cp "$file" "$temp_file"
            ;;
        *)
            return 0
            ;;
    esac
    
    if [ ! -s "$temp_file" ]; then
        rm -f "$temp_file"
        return 0
    fi
    
    # Run aspell with custom wordlist
    local misspelled=$(aspell --personal="$WORDLIST_FILE" --lang=en list < "$temp_file" | sort -u)
    
    if [ -n "$misspelled" ]; then
        echo "=== $file ===" >> "$REPORT_FILE"
        echo "$misspelled" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        errors_found=$(echo "$misspelled" | wc -l)
        log_warning "Found $errors_found potential misspellings in $file"
    fi
    
    rm -f "$temp_file"
    return $errors_found
}

# Main spellcheck function
run_spellcheck() {
    log_info "Starting comprehensive spellcheck..."
    
    # Create custom wordlist
    create_wordlist
    
    # Clear previous report
    echo "Da-Kraken Spellcheck Report" > "$REPORT_FILE"
    echo "Generated: $(date)" >> "$REPORT_FILE"
    echo "================================================" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    local total_files=0
    local files_with_errors=0
    local total_errors=0
    
    # Find files to check
    while IFS= read -r -d '' file; do
        # Skip node_modules, .git, and other noise
        if [[ "$file" == *"/node_modules/"* ]] || \
           [[ "$file" == *"/.git/"* ]] || \
           [[ "$file" == *"/dist/"* ]] || \
           [[ "$file" == *"/build/"* ]] || \
           [[ "$file" == *".min."* ]]; then
            continue
        fi
        
        total_files=$((total_files + 1))
        
        if spellcheck_file "$file"; then
            continue
        else
            errors_in_file=$?
            if [ $errors_in_file -gt 0 ]; then
                files_with_errors=$((files_with_errors + 1))
                total_errors=$((total_errors + errors_in_file))
            fi
        fi
        
    done < <(find "$SPELLCHECK_DIR" -type f \( \
        -name "*.md" -o \
        -name "*.txt" -o \
        -name "*.js" -o \
        -name "*.py" -o \
        -name "*.html" -o \
        -name "*.css" -o \
        -name "*.json" -o \
        -name "*.yml" -o \
        -name "*.yaml" -o \
        -name "*.sh" \
    \) -print0)
    
    # Generate summary
    echo "" >> "$REPORT_FILE"
    echo "SUMMARY:" >> "$REPORT_FILE"
    echo "Total files checked: $total_files" >> "$REPORT_FILE"
    echo "Files with potential misspellings: $files_with_errors" >> "$REPORT_FILE"
    echo "Total potential misspellings: $total_errors" >> "$REPORT_FILE"
    
    log_success "Spellcheck complete!"
    echo "Total files checked: $total_files"
    echo "Files with potential issues: $files_with_errors"
    echo "Total potential misspellings: $total_errors"
    echo "Report saved to: $REPORT_FILE"
    
    if [ $total_errors -gt 0 ]; then
        log_warning "Review the report and add legitimate technical terms to $WORDLIST_FILE"
        return 1
    else
        log_success "No spelling issues found!"
        return 0
    fi
}

# Interactive correction function
interactive_correction() {
    log_info "Starting interactive spelling correction..."
    
    if [ ! -f "$REPORT_FILE" ]; then
        log_error "No spellcheck report found. Run spellcheck first."
        return 1
    fi
    
    log_info "Review suggestions in $REPORT_FILE"
    log_info "Add legitimate technical terms to $WORDLIST_FILE"
    log_info "Then run spellcheck again to verify corrections"
}

# Main execution
case "${1:-check}" in
    check)
        run_spellcheck
        ;;
    interactive)
        interactive_correction
        ;;
    wordlist)
        create_wordlist
        log_success "Custom wordlist created at $WORDLIST_FILE"
        ;;
    report)
        if [ -f "$REPORT_FILE" ]; then
            cat "$REPORT_FILE"
        else
            log_error "No spellcheck report found. Run 'check' first."
        fi
        ;;
    *)
        echo "Usage: $0 [check|interactive|wordlist|report]"
        echo "  check       - Run comprehensive spellcheck (default)"
        echo "  interactive - Start interactive correction session"
        echo "  wordlist    - Create/update custom wordlist"
        echo "  report      - Display last spellcheck report"
        exit 1
        ;;
esac