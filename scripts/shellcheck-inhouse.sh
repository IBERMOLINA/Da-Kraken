#!/bin/bash
# Da-Kraken In-House ShellCheck Tool
# Comprehensive shell script linting and quality assurance tool
# Eliminates dependency on external VS Code extensions

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SHELLCHECK_CONFIG="$PROJECT_ROOT/.shellcheckrc"
REPORT_FILE="$PROJECT_ROOT/shellcheck-report.json"
HTML_REPORT="$PROJECT_ROOT/shellcheck-report.html"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Statistics
TOTAL_FILES=0
PASSED_FILES=0
FAILED_FILES=0
TOTAL_ISSUES=0

# Default severity levels to check
SEVERITY_LEVELS=("error" "warning" "info" "style")

print_usage() {
    cat << EOF
Da-Kraken In-House ShellCheck Tool

Usage: $0 [OPTIONS] [FILES/DIRECTORIES]

OPTIONS:
    -h, --help              Show this help message
    -f, --format FORMAT     Output format: tty, json, html, all (default: tty)
    -s, --severity LEVEL    Minimum severity level: error, warning, info, style (default: warning)
    -r, --recursive         Recursively check directories
    -c, --config FILE       Use custom ShellCheck config file
    -o, --output FILE       Output file for reports
    -v, --verbose           Verbose output
    -q, --quiet             Quiet mode (errors only)
    --fix                   Attempt to fix common issues automatically
    --watch                 Watch mode for continuous checking
    --exclude CODES         Comma-separated list of error codes to exclude

EXAMPLES:
    $0                      # Check all shell scripts in project
    $0 -f json -o report.json  # Generate JSON report
    $0 --fix scripts/       # Check and fix scripts in directory
    $0 --watch              # Continuous monitoring mode
    $0 --severity error     # Only show errors

EOF
}

log_info() {
    if [[ "${VERBOSE:-0}" == "1" ]] || [[ "${QUIET:-0}" != "1" ]]; then
        echo -e "${BLUE}[INFO]${NC} $1" >&2
    fi
}

log_success() {
    if [[ "${QUIET:-0}" != "1" ]]; then
        echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
    fi
}

log_warning() {
    if [[ "${QUIET:-0}" != "1" ]]; then
        echo -e "${YELLOW}[WARNING]${NC} $1" >&2
    fi
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

create_shellcheck_config() {
    if [[ ! -f "$SHELLCHECK_CONFIG" ]]; then
        log_info "Creating ShellCheck configuration file: $SHELLCHECK_CONFIG"
        cat > "$SHELLCHECK_CONFIG" << 'EOF'
# Da-Kraken ShellCheck Configuration
# Disable specific warnings that are not relevant for our project

# SC2034: Variable appears unused (common in sourced scripts)
disable=SC2034

# SC1091: Not following sourced files (we have complex sourcing patterns)
disable=SC1091

# SC2155: Declare and assign separately to avoid masking return values
# disable=SC2155

# Enable additional checks
enable=all

# Set shell dialect (default to bash)
shell=bash

# Check sourced files
source-path=SCRIPTDIR

# External sources (common paths)
external-sources=true
EOF
    fi
}

find_shell_scripts() {
    local search_paths=("$@")
    local files=()
    
    if [[ ${#search_paths[@]} -eq 0 ]]; then
        search_paths=("$PROJECT_ROOT")
    fi
    
    for path in "${search_paths[@]}"; do
        if [[ -f "$path" ]]; then
            # Single file
            if is_shell_script "$path"; then
                files+=("$path")
            fi
        elif [[ -d "$path" ]]; then
            # Directory - find shell scripts
            if [[ "${RECURSIVE:-1}" == "1" ]]; then
                while IFS= read -r -d '' file; do
                    if is_shell_script "$file"; then
                        files+=("$file")
                    fi
                done < <(find "$path" -type f \( -name "*.sh" -o -name "*.bash" -o -name "*.ksh" -o -name "*.zsh" \) -print0)
                
                # Also check files with shebang
                while IFS= read -r -d '' file; do
                    if [[ -x "$file" ]] && has_shell_shebang "$file"; then
                        files+=("$file")
                    fi
                done < <(find "$path" -type f -executable -print0)
            else
                for file in "$path"/*.sh "$path"/*.bash "$path"/*.ksh "$path"/*.zsh; do
                    if [[ -f "$file" ]] && is_shell_script "$file"; then
                        files+=("$file")
                    fi
                done
            fi
        fi
    done
    
    printf '%s\n' "${files[@]}" | sort -u
}

is_shell_script() {
    local file="$1"
    [[ -f "$file" ]] && {
        [[ "$file" =~ \.(sh|bash|ksh|zsh)$ ]] || has_shell_shebang "$file"
    }
}

has_shell_shebang() {
    local file="$1"
    [[ -f "$file" ]] && {
        head -n1 "$file" | grep -qE '^#!.*/(bash|sh|ksh|zsh)(\s|$)'
    }
}

check_file() {
    local file="$1"
    local format="${FORMAT:-tty}"
    local severity="${SEVERITY:-warning}"
    local exclude_codes="${EXCLUDE_CODES:-}"
    
    local shellcheck_args=()
    
    # Add severity filter
    case "$severity" in
        "error")   shellcheck_args+=("--severity=error") ;;
        "warning") shellcheck_args+=("--severity=warning") ;;
        "info")    shellcheck_args+=("--severity=info") ;;
        "style")   shellcheck_args+=("--severity=style") ;;
    esac
    
    # Add format
    case "$format" in
        "json")    shellcheck_args+=("--format=json") ;;
        "tty")     shellcheck_args+=("--format=tty") ;;
        *)         shellcheck_args+=("--format=tty") ;;
    esac
    
    # Add exclusions
    if [[ -n "$exclude_codes" ]]; then
        shellcheck_args+=("--exclude=$exclude_codes")
    fi
    
    # Add config file if exists
    if [[ -f "$SHELLCHECK_CONFIG" ]]; then
        shellcheck_args+=("--rcfile=$SHELLCHECK_CONFIG")
    fi
    
    local output
    local exit_code=0
    
    output=$(shellcheck "${shellcheck_args[@]}" "$file" 2>&1) || exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        ((PASSED_FILES++))
        if [[ "${VERBOSE:-0}" == "1" ]]; then
            log_success "✓ $file"
        fi
        return 0
    else
        ((FAILED_FILES++))
        if [[ "$format" == "tty" ]]; then
            echo -e "${RED}✗ $file${NC}"
            echo "$output" | sed 's/^/  /'
        else
            echo "$output"
        fi
        
        # Count issues for statistics
        local issue_count
        issue_count=$(echo "$output" | grep -c "^In.*line" 2>/dev/null || echo "1")
        ((TOTAL_ISSUES += issue_count))
        
        return 1
    fi
}

fix_common_issues() {
    local file="$1"
    local backup_file="${file}.bak"
    
    log_info "Attempting to fix common issues in: $file"
    
    # Create backup
    cp "$file" "$backup_file"
    
    local fixed=0
    
    # Fix 1: Add missing quotes around variables
    if sed -i.tmp 's/\$\([A-Za-z_][A-Za-z0-9_]*\)/"$\1"/g' "$file" 2>/dev/null; then
        if ! cmp -s "$file" "$file.tmp"; then
            ((fixed++))
            log_info "  Fixed: Added quotes around variables"
        fi
        rm -f "$file.tmp"
    fi
    
    # Fix 2: Replace backticks with $()
    if sed -i.tmp 's/`\([^`]*\)`/$(\1)/g' "$file" 2>/dev/null; then
        if ! cmp -s "$file" "$file.tmp"; then
            ((fixed++))
            log_info "  Fixed: Replaced backticks with \$()"
        fi
        rm -f "$file.tmp"
    fi
    
    # Fix 3: Add proper shebang if missing
    if ! head -n1 "$file" | grep -q '^#!'; then
        {
            echo '#!/bin/bash'
            cat "$file"
        } > "$file.tmp" && mv "$file.tmp" "$file"
        ((fixed++))
        log_info "  Fixed: Added missing shebang"
    fi
    
    if [[ $fixed -gt 0 ]]; then
        log_success "Applied $fixed fixes to $file"
        # Verify the fixes didn't break anything
        if ! bash -n "$file" 2>/dev/null; then
            log_error "Fixes introduced syntax errors, restoring backup"
            mv "$backup_file" "$file"
            return 1
        fi
    else
        log_info "No automatic fixes available for $file"
    fi
    
    rm -f "$backup_file"
    return 0
}

generate_html_report() {
    local json_file="$1"
    local html_file="$2"
    
    if [[ ! -f "$json_file" ]]; then
        log_error "JSON report file not found: $json_file"
        return 1
    fi
    
    log_info "Generating HTML report: $html_file"
    
    cat > "$html_file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Da-Kraken ShellCheck Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .stat-card.error { border-left-color: #dc3545; }
        .stat-card.warning { border-left-color: #ffc107; }
        .stat-card.success { border-left-color: #28a745; }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .stat-label { color: #6c757d; font-size: 0.9em; }
        .files-section { padding: 0 30px 30px; }
        .file-card { background: #f8f9fa; margin-bottom: 20px; border-radius: 8px; overflow: hidden; }
        .file-header { background: #e9ecef; padding: 15px; font-weight: bold; cursor: pointer; }
        .file-header:hover { background: #dee2e6; }
        .file-issues { padding: 15px; display: none; }
        .file-issues.show { display: block; }
        .issue { margin-bottom: 15px; padding: 10px; border-left: 4px solid #6c757d; background: white; border-radius: 0 4px 4px 0; }
        .issue.error { border-left-color: #dc3545; }
        .issue.warning { border-left-color: #ffc107; }
        .issue.info { border-left-color: #17a2b8; }
        .issue.style { border-left-color: #6f42c1; }
        .issue-header { font-weight: bold; margin-bottom: 5px; }
        .issue-message { color: #495057; }
        .issue-location { font-size: 0.9em; color: #6c757d; }
        .no-issues { text-align: center; padding: 40px; color: #28a745; }
        .footer { padding: 20px 30px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐚 ShellCheck Report</h1>
            <p>Da-Kraken Shell Script Quality Analysis</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="total-files">0</div>
                <div class="stat-label">Total Files</div>
            </div>
            <div class="stat-card success">
                <div class="stat-number" id="passed-files">0</div>
                <div class="stat-label">Passed Files</div>
            </div>
            <div class="stat-card error">
                <div class="stat-number" id="failed-files">0</div>
                <div class="stat-label">Failed Files</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-number" id="total-issues">0</div>
                <div class="stat-label">Total Issues</div>
            </div>
        </div>
        
        <div class="files-section">
            <h2>File Analysis Results</h2>
            <div id="files-container">
                <!-- Files will be populated by JavaScript -->
            </div>
        </div>
        
        <div class="footer">
            Generated by Da-Kraken In-House ShellCheck Tool | 
            <span id="report-date"><!-- Date will be populated --></span>
        </div>
    </div>
    
    <script>
        // This will be populated with actual data
        const reportData = EOF
    
    # Add JSON data
    cat "$json_file" >> "$html_file"
    
    cat >> "$html_file" << 'EOF'
;
        
        // Populate statistics
        document.getElementById('total-files').textContent = reportData.summary.total_files;
        document.getElementById('passed-files').textContent = reportData.summary.passed_files;
        document.getElementById('failed-files').textContent = reportData.summary.failed_files;
        document.getElementById('total-issues').textContent = reportData.summary.total_issues;
        document.getElementById('report-date').textContent = new Date(reportData.timestamp).toLocaleString();
        
        // Populate files
        const filesContainer = document.getElementById('files-container');
        
        if (reportData.files.length === 0) {
            filesContainer.innerHTML = '<div class="no-issues">🎉 No shell scripts found or all scripts passed!</div>';
        } else {
            reportData.files.forEach((file, index) => {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'file-card';
                
                const hasIssues = file.issues && file.issues.length > 0;
                const statusIcon = hasIssues ? '❌' : '✅';
                const statusClass = hasIssues ? 'error' : 'success';
                
                fileDiv.innerHTML = `
                    <div class="file-header ${statusClass}" onclick="toggleFile(${index})">
                        ${statusIcon} ${file.file} 
                        ${hasIssues ? `(${file.issues.length} issues)` : '(passed)'}
                    </div>
                    <div class="file-issues" id="file-issues-${index}">
                        ${hasIssues ? file.issues.map(issue => `
                            <div class="issue ${issue.level}">
                                <div class="issue-header">${issue.code}: ${issue.message}</div>
                                <div class="issue-location">Line ${issue.line}, Column ${issue.column}</div>
                            </div>
                        `).join('') : '<div class="no-issues">No issues found in this file! 🎉</div>'}
                    </div>
                `;
                
                filesContainer.appendChild(fileDiv);
            });
        }
        
        function toggleFile(index) {
            const issues = document.getElementById(`file-issues-${index}`);
            issues.classList.toggle('show');
        }
    </script>
</body>
</html>
EOF
    
    log_success "HTML report generated: $html_file"
}

watch_mode() {
    log_info "Starting watch mode..."
    log_info "Monitoring shell scripts for changes. Press Ctrl+C to stop."
    
    if ! command -v inotifywait >/dev/null 2>&1; then
        log_error "inotifywait not found. Install inotify-tools for watch mode."
        return 1
    fi
    
    local watch_paths=("$@")
    if [[ ${#watch_paths[@]} -eq 0 ]]; then
        watch_paths=("$PROJECT_ROOT")
    fi
    
    while true; do
        inotifywait -r -e modify,create,delete --include='.*\.sh$' "${watch_paths[@]}" 2>/dev/null | while read -r path event file; do
            if [[ "$event" =~ (MODIFY|CREATE) ]]; then
                log_info "Detected change: $path$file"
                echo "Checking $path$file..."
                check_file "$path$file" 2>/dev/null || true
                echo "---"
            fi
        done
    done
}

main() {
    local format="tty"
    local severity="warning"
    local output_file=""
    local recursive=1
    local fix_mode=0
    local watch_mode_flag=0
    local exclude_codes=""
    local files_to_check=()
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                print_usage
                exit 0
                ;;
            -f|--format)
                format="$2"
                shift 2
                ;;
            -s|--severity)
                severity="$2"
                shift 2
                ;;
            -r|--recursive)
                recursive=1
                shift
                ;;
            -c|--config)
                SHELLCHECK_CONFIG="$2"
                shift 2
                ;;
            -o|--output)
                output_file="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=1
                shift
                ;;
            -q|--quiet)
                QUIET=1
                shift
                ;;
            --fix)
                fix_mode=1
                shift
                ;;
            --watch)
                watch_mode_flag=1
                shift
                ;;
            --exclude)
                exclude_codes="$2"
                shift 2
                ;;
            -*)
                log_error "Unknown option: $1"
                print_usage
                exit 1
                ;;
            *)
                files_to_check+=("$1")
                shift
                ;;
        esac
    done
    
    # Export variables for use in functions
    export FORMAT="$format"
    export SEVERITY="$severity"
    export RECURSIVE="$recursive"
    export EXCLUDE_CODES="$exclude_codes"

    # Handle watch mode
    if [[ $watch_mode_flag -eq 1 ]]; then
        watch_mode "${files_to_check[@]}"
        return $?
    fi
    
    # Create ShellCheck config if needed
    create_shellcheck_config
    
    # Find shell scripts
    local shell_scripts
    mapfile -t shell_scripts < <(find_shell_scripts "${files_to_check[@]}")
    
    if [[ ${#shell_scripts[@]} -eq 0 ]]; then
        log_info "No shell scripts found."
        exit 0
    fi
    
    TOTAL_FILES=${#shell_scripts[@]}
    
    log_info "Found $TOTAL_FILES shell script(s) to check"
    
    # Prepare output
    local json_output=""
    local json_files=()
    
    if [[ "$format" == "json" ]] || [[ "$format" == "all" ]]; then
        json_output='{"timestamp":"'$(date -Iseconds)'","summary":{},"files":[]}'
    fi
    
    # Check each file
    for script in "${shell_scripts[@]}"; do
        if [[ $fix_mode -eq 1 ]]; then
            fix_common_issues "$script"
        fi
        
        local file_result=""
        local issues=""
        
        if [[ "$format" == "json" ]] || [[ "$format" == "all" ]]; then
            # Capture JSON output for this file
            file_result=$(check_file "$script" 2>&1) || true
            
            # Parse ShellCheck JSON output if available
            if [[ "$file_result" =~ ^\[ ]]; then
                # It's valid JSON from shellcheck
                local file_json="{\"file\":\"$script\",\"issues\":$file_result}"
            else
                # Convert text output to JSON structure
                local status="passed"
                if [[ $? -ne 0 ]]; then
                    status="failed"
                fi
                local file_json="{\"file\":\"$script\",\"status\":\"$status\",\"issues\":[]}"
            fi
            json_files+=("$file_json")
        else
            check_file "$script"
        fi
    done
    
    # Generate reports
    if [[ "$format" == "json" ]] || [[ "$format" == "all" ]]; then
        # Build final JSON
        local files_json=$(printf '%s,' "${json_files[@]}")
        files_json="[${files_json%,}]"
        
        local summary_json="{\"total_files\":$TOTAL_FILES,\"passed_files\":$PASSED_FILES,\"failed_files\":$FAILED_FILES,\"total_issues\":$TOTAL_ISSUES}"
        
        json_output="{\"timestamp\":\"$(date -Iseconds)\",\"summary\":$summary_json,\"files\":$files_json}"
        
        if [[ -n "$output_file" ]]; then
            echo "$json_output" > "$output_file"
            log_success "JSON report saved to: $output_file"
        elif [[ "$format" == "json" ]]; then
            echo "$json_output"
        fi
        
        # Generate HTML report if format is "all"
        if [[ "$format" == "all" ]]; then
            local json_file="${output_file:-$REPORT_FILE}"
            echo "$json_output" > "$json_file"
            generate_html_report "$json_file" "$HTML_REPORT"
        fi
    fi
    
    # Print summary
    if [[ "$format" == "tty" ]] || [[ "$format" == "all" ]]; then
        echo
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📊 SHELLCHECK SUMMARY"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        printf "Total files:    %s\n" "$TOTAL_FILES"
        printf "Passed:         %s\n" "$PASSED_FILES"
        printf "Failed:         %s\n" "$FAILED_FILES"
        printf "Total issues:   %s\n" "$TOTAL_ISSUES"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        if [[ $FAILED_FILES -eq 0 ]]; then
            echo -e "${GREEN}🎉 All shell scripts passed the checks!${NC}"
        else
            echo -e "${RED}⚠️  $FAILED_FILES file(s) have issues that need attention.${NC}"
        fi
    fi
    
    # Exit with appropriate code
    exit $([[ $FAILED_FILES -eq 0 ]] && echo 0 || echo 1)
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi