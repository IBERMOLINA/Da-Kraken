#!/bin/bash

# Da-Kraken Dependency Security Audit Script
# Comprehensive security review of all package managers and dependencies

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
AUDIT_LOG="/workspaces/Da-Kraken/security-audit.log"
AUDIT_REPORT="/workspaces/Da-Kraken/dependency-audit-report.json"
PROJECT_ROOT="/workspaces/Da-Kraken"

# Initialize audit
initialize_audit() {
    echo "Da-Kraken Dependency Security Audit - $(date)" > "$AUDIT_LOG"
    echo "=============================================" >> "$AUDIT_LOG"
    
    # Initialize JSON report
    cat > "$AUDIT_REPORT" << 'EOF'
{
  "auditDate": "",
  "summary": {
    "totalPackages": 0,
    "vulnerabilities": {
      "critical": 0,
      "high": 0,
      "moderate": 0,
      "low": 0,
      "info": 0
    },
    "outdatedPackages": 0,
    "licenseIssues": 0
  },
  "languages": {},
  "recommendations": []
}
EOF
    
    # Set audit date
    jq ".auditDate = \"$(date -Iseconds)\"" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
    mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
}

# Helper functions
log_info() {
    echo -e "${BLUE}[AUDIT]${NC} $1" | tee -a "$AUDIT_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$AUDIT_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$AUDIT_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$AUDIT_LOG"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1" | tee -a "$AUDIT_LOG"
}

# Audit Node.js dependencies
audit_nodejs() {
    log_step "Auditing Node.js dependencies..."
    
    local nodejs_results="{\"packageManager\": \"npm\", \"vulnerabilities\": {}, \"outdated\": [], \"licenses\": []}"
    
    # Find all package.json files
    local package_files=$(find "$PROJECT_ROOT" -name "package.json" -not -path "*/node_modules/*" 2>/dev/null || echo "")
    
    if [ -z "$package_files" ]; then
        log_info "No Node.js package.json files found"
        jq ".languages.nodejs = $nodejs_results" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
        mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
        return
    fi
    
    local total_vulns=0
    local outdated_count=0
    
    while IFS= read -r package_file; do
        local dir=$(dirname "$package_file")
        log_info "Checking $package_file"
        
        cd "$dir"
        
        # Check if npm is available
        if command -v npm &> /dev/null; then
            # Run npm audit
            if npm audit --json > npm_audit.json 2>/dev/null; then
                local audit_result=$(cat npm_audit.json)
                local vulns=$(echo "$audit_result" | jq '.metadata.vulnerabilities // {}')
                
                # Count vulnerabilities
                local critical=$(echo "$vulns" | jq '.critical // 0')
                local high=$(echo "$vulns" | jq '.high // 0')
                local moderate=$(echo "$vulns" | jq '.moderate // 0')
                local low=$(echo "$vulns" | jq '.low // 0')
                
                total_vulns=$((total_vulns + critical + high + moderate + low))
                
                if [ $((critical + high)) -gt 0 ]; then
                    log_warning "Found $((critical + high)) critical/high vulnerabilities in $dir"
                fi
                
                rm -f npm_audit.json
            fi
            
            # Check outdated packages
            if npm outdated --json > npm_outdated.json 2>/dev/null; then
                local outdated=$(cat npm_outdated.json | jq 'keys | length')
                outdated_count=$((outdated_count + outdated))
                
                if [ "$outdated" -gt 0 ]; then
                    log_info "Found $outdated outdated packages in $dir"
                fi
                
                rm -f npm_outdated.json
            fi
        else
            log_warning "npm not available for auditing $package_file"
        fi
        
        cd "$PROJECT_ROOT"
    done <<< "$package_files"
    
    # Update report
    nodejs_results=$(echo "$nodejs_results" | jq ".vulnerabilities.total = $total_vulns | .outdatedCount = $outdated_count")
    jq ".languages.nodejs = $nodejs_results" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
    mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
    
    log_success "Node.js audit completed: $total_vulns vulnerabilities, $outdated_count outdated packages"
}

# Audit Python dependencies
audit_python() {
    log_step "Auditing Python dependencies..."
    
    local python_results="{\"packageManager\": \"pip\", \"vulnerabilities\": {}, \"outdated\": [], \"licenses\": []}"
    
    # Find all requirements.txt files
    local requirements_files=$(find "$PROJECT_ROOT" -name "requirements*.txt" 2>/dev/null || echo "")
    
    if [ -z "$requirements_files" ]; then
        log_info "No Python requirements.txt files found"
        jq ".languages.python = $python_results" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
        mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
        return
    fi
    
    local total_vulns=0
    local outdated_count=0
    
    # Check if pip-audit is available, install if not
    if ! command -v pip-audit &> /dev/null; then
        log_info "Installing pip-audit for vulnerability scanning..."
        pip install --user pip-audit 2>/dev/null || log_warning "Could not install pip-audit"
    fi
    
    while IFS= read -r req_file; do
        log_info "Checking $req_file"
        
        # Use pip-audit if available
        if command -v pip-audit &> /dev/null; then
            local audit_output=$(pip-audit -r "$req_file" --format=json 2>/dev/null || echo '{"vulnerabilities": []}')
            local vulns=$(echo "$audit_output" | jq '.vulnerabilities | length')
            total_vulns=$((total_vulns + vulns))
            
            if [ "$vulns" -gt 0 ]; then
                log_warning "Found $vulns vulnerabilities in $req_file"
            fi
        fi
        
        # Check for outdated packages (basic version parsing)
        local packages=$(grep -v '^#' "$req_file" | grep -v '^$' | wc -l)
        outdated_count=$((outdated_count + packages))  # Conservative estimate
        
    done <<< "$requirements_files"
    
    # Update report
    python_results=$(echo "$python_results" | jq ".vulnerabilities.total = $total_vulns | .outdatedCount = $outdated_count")
    jq ".languages.python = $python_results" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
    mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
    
    log_success "Python audit completed: $total_vulns vulnerabilities, $outdated_count packages checked"
}

# Audit Rust dependencies
audit_rust() {
    log_step "Auditing Rust dependencies..."
    
    local rust_results="{\"packageManager\": \"cargo\", \"vulnerabilities\": {}, \"outdated\": [], \"licenses\": []}"
    
    # Find all Cargo.toml files
    local cargo_files=$(find "$PROJECT_ROOT" -name "Cargo.toml" 2>/dev/null || echo "")
    
    if [ -z "$cargo_files" ]; then
        log_info "No Rust Cargo.toml files found"
        jq ".languages.rust = $rust_results" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
        mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
        return
    fi
    
    local total_vulns=0
    local outdated_count=0
    
    # Check if cargo-audit is available
    if ! command -v cargo-audit &> /dev/null; then
        log_info "cargo-audit not available for Rust vulnerability scanning"
    fi
    
    while IFS= read -r cargo_file; do
        local dir=$(dirname "$cargo_file")
        log_info "Checking $cargo_file"
        
        cd "$dir"
        
        # Use cargo-audit if available
        if command -v cargo-audit &> /dev/null; then
            local audit_output=$(cargo audit --json 2>/dev/null || echo '{"vulnerabilities": {"list": []}}')
            local vulns=$(echo "$audit_output" | jq '.vulnerabilities.list | length')
            total_vulns=$((total_vulns + vulns))
            
            if [ "$vulns" -gt 0 ]; then
                log_warning "Found $vulns vulnerabilities in $dir"
            fi
        fi
        
        # Check for outdated packages
        if command -v cargo &> /dev/null; then
            if cargo update --dry-run > cargo_update.log 2>&1; then
                local updates=$(grep -c "Updating" cargo_update.log || echo "0")
                outdated_count=$((outdated_count + updates))
                rm -f cargo_update.log
            fi
        fi
        
        cd "$PROJECT_ROOT"
    done <<< "$cargo_files"
    
    # Update report
    rust_results=$(echo "$rust_results" | jq ".vulnerabilities.total = $total_vulns | .outdatedCount = $outdated_count")
    jq ".languages.rust = $rust_results" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
    mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
    
    log_success "Rust audit completed: $total_vulns vulnerabilities, $outdated_count outdated packages"
}

# Audit other package managers
audit_other_languages() {
    log_step "Auditing other language dependencies..."
    
    # Go modules
    local go_files=$(find "$PROJECT_ROOT" -name "go.mod" 2>/dev/null || echo "")
    if [ -n "$go_files" ]; then
        log_info "Found Go modules, checking for vulnerabilities..."
        local go_results="{\"packageManager\": \"go\", \"vulnerabilities\": {\"total\": 0}, \"outdatedCount\": 0}"
        
        if command -v govulncheck &> /dev/null; then
            while IFS= read -r go_file; do
                local dir=$(dirname "$go_file")
                cd "$dir"
                local vulns=$(govulncheck -json . 2>/dev/null | jq '.finding // [] | length' || echo "0")
                go_results=$(echo "$go_results" | jq ".vulnerabilities.total += $vulns")
                cd "$PROJECT_ROOT"
            done <<< "$go_files"
        fi
        
        jq ".languages.go = $go_results" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
        mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
    fi
    
    # PHP Composer
    local composer_files=$(find "$PROJECT_ROOT" -name "composer.json" 2>/dev/null || echo "")
    if [ -n "$composer_files" ]; then
        log_info "Found PHP Composer files..."
        local php_results="{\"packageManager\": \"composer\", \"vulnerabilities\": {\"total\": 0}, \"outdatedCount\": 0}"
        jq ".languages.php = $php_results" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
        mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
    fi
    
    # Elixir Mix
    local mix_files=$(find "$PROJECT_ROOT" -name "mix.exs" 2>/dev/null || echo "")
    if [ -n "$mix_files" ]; then
        log_info "Found Elixir Mix files..."
        local elixir_results="{\"packageManager\": \"mix\", \"vulnerabilities\": {\"total\": 0}, \"outdatedCount\": 0}"
        jq ".languages.elixir = $elixir_results" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
        mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
    fi
    
    # Crystal Shards
    local shard_files=$(find "$PROJECT_ROOT" -name "shard.yml" 2>/dev/null || echo "")
    if [ -n "$shard_files" ]; then
        log_info "Found Crystal Shard files..."
        local crystal_results="{\"packageManager\": \"shards\", \"vulnerabilities\": {\"total\": 0}, \"outdatedCount\": 0}"
        jq ".languages.crystal = $crystal_results" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
        mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
    fi
    
    # Fortran FPM
    local fpm_files=$(find "$PROJECT_ROOT" -name "fpm.toml" 2>/dev/null || echo "")
    if [ -n "$fpm_files" ]; then
        log_info "Found Fortran FPM files..."
        local fortran_results="{\"packageManager\": \"fpm\", \"vulnerabilities\": {\"total\": 0}, \"outdatedCount\": 0}"
        jq ".languages.fortran = $fortran_results" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
        mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
    fi
}

# Generate security recommendations
generate_recommendations() {
    log_step "Generating security recommendations..."
    
    local recommendations=()
    
    # Analyze the audit results
    local total_vulns=$(jq '[.languages[] | .vulnerabilities.total // 0] | add' "$AUDIT_REPORT")
    local total_outdated=$(jq '[.languages[] | .outdatedCount // 0] | add' "$AUDIT_REPORT")
    
    if [ "$total_vulns" -gt 0 ]; then
        recommendations+=("\"Fix $total_vulns security vulnerabilities across language dependencies\"")
        recommendations+=("\"Run 'npm audit fix', 'pip-audit --fix', and 'cargo audit' regularly\"")
        recommendations+=("\"Implement automated security scanning in CI/CD pipeline\"")
    fi
    
    if [ "$total_outdated" -gt 10 ]; then
        recommendations+=("\"Update $total_outdated outdated packages to latest secure versions\"")
        recommendations+=("\"Set up automated dependency updates using Dependabot or similar\"")
    fi
    
    # Always include these general recommendations
    recommendations+=("\"Enable security monitoring and vulnerability alerts\"")
    recommendations+=("\"Use lock files (package-lock.json, Cargo.lock) for reproducible builds\"")
    recommendations+=("\"Regularly audit and update development dependencies\"")
    recommendations+=("\"Consider using vulnerability scanning tools in pre-commit hooks\"")
    recommendations+=("\"Implement supply chain security practices for all package managers\"")
    
    # Update report with recommendations
    local recs_json=$(printf '%s\n' "${recommendations[@]}" | jq -R . | jq -s .)
    jq ".recommendations = $recs_json" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
    mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
    
    # Update summary
    jq ".summary.totalVulnerabilities = $total_vulns | .summary.totalOutdated = $total_outdated" "$AUDIT_REPORT" > "$AUDIT_REPORT.tmp"
    mv "$AUDIT_REPORT.tmp" "$AUDIT_REPORT"
}

# Show audit results
show_results() {
    log_step "Dependency Security Audit Results"
    echo ""
    
    # Summary
    local total_vulns=$(jq '.summary.totalVulnerabilities // 0' "$AUDIT_REPORT")
    local total_outdated=$(jq '.summary.totalOutdated // 0' "$AUDIT_REPORT")
    
    echo -e "${CYAN}📊 Security Audit Summary:${NC}"
    echo "├── Total Vulnerabilities: $total_vulns"
    echo "├── Outdated Packages: $total_outdated"
    echo "└── Languages Scanned: $(jq '.languages | keys | length' "$AUDIT_REPORT")"
    echo ""
    
    # Language breakdown
    echo -e "${CYAN}🔍 Language Breakdown:${NC}"
    jq -r '.languages | to_entries[] | "├── \(.key): \(.value.vulnerabilities.total // 0) vulns, \(.value.outdatedCount // 0) outdated"' "$AUDIT_REPORT"
    echo ""
    
    # Recommendations
    echo -e "${CYAN}💡 Security Recommendations:${NC}"
    jq -r '.recommendations[] | "• " + .' "$AUDIT_REPORT"
    echo ""
    
    # Status assessment
    if [ "$total_vulns" -eq 0 ]; then
        log_success "🎉 No critical vulnerabilities found!"
    elif [ "$total_vulns" -lt 5 ]; then
        log_warning "⚠️  Few vulnerabilities found - address soon"
    else
        log_error "🚨 Multiple vulnerabilities found - immediate action required"
    fi
    
    echo ""
    echo -e "${BLUE}📄 Detailed report saved to: $AUDIT_REPORT${NC}"
    echo -e "${BLUE}📄 Audit log saved to: $AUDIT_LOG${NC}"
}

# Main audit function
main() {
    log_info "Starting comprehensive dependency security audit..."
    
    initialize_audit
    
    # Audit each language ecosystem
    audit_nodejs
    audit_python
    audit_rust
    audit_other_languages
    
    # Generate recommendations
    generate_recommendations
    
    # Show results
    show_results
    
    log_success "Dependency security audit completed!"
}

# Execute main function
main "$@"