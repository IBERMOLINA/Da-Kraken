# Da-Kraken Repository Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

Da-Kraken is currently a minimal repository with a simple "BUILD-DEPLOY-ENJOY" mission statement. The repository is prepared for future development and expansion.

## Working Effectively

### Repository Navigation and Setup
- Repository location: `/home/runner/work/Da-Kraken/Da-Kraken`
- Navigate to repository: `cd /home/runner/work/Da-Kraken/Da-Kraken`
- Check repository status: `git status`
- View repository contents: `ls -la`
- Read project README: `cat README.md`

### Current State Validation
- The repository currently contains only essential files:
  - `README.md` - Project mission statement
  - `.git/` - Git repository metadata  
  - `.github/` - GitHub configuration directory
- No build dependencies or application code currently present

### Available Development Tools
The following development tools are available in the environment:
- Node.js v20.19.5: `/usr/local/bin/node`
- npm: `/usr/local/bin/npm` 
- Python 3.12.3: `/usr/bin/python3`
- pip: `/usr/bin/pip`
- git: `/usr/bin/git`
- make: `/usr/bin/make` 
- docker: `/usr/bin/docker`

### Git Operations
- Check current branch: `git branch`
- View commit history: `git log --oneline -n 10`
- Check file changes: `git diff`
- Stage changes: `git add .`
- Create commits: `git commit -m "Your message"`

## Build and Test Status

### Current Build State
- **No build process currently configured** - Repository contains no build files (package.json, Makefile, Dockerfile, etc.)
- **No testing framework present** - No test files or test runners configured
- **No dependencies** - No dependency management files present

### Future Development Setup
When adding code to this repository:
- For Node.js projects: Create `package.json` with `npm init`
- For Python projects: Create `requirements.txt` for dependencies
- For containerized apps: Add appropriate `Dockerfile`
- Always add comprehensive README updates when adding functionality

## Validation and Testing

### Manual Validation Steps
1. Navigate to repository root: `cd /home/runner/work/Da-Kraken/Da-Kraken`
2. Verify repository integrity: `git status`
3. Confirm README accessibility: `cat README.md`
4. Check directory structure: `ls -la`

### Expected Behavior
- Repository should be clean with no uncommitted changes initially
- README.md should contain "BUILD-DEPLOY-ENJOY" message
- All git commands should work without errors
- Directory should contain only essential files (.git, .github, README.md)

## Common Tasks

### Repository Structure
```
/home/runner/work/Da-Kraken/Da-Kraken/
├── .git/                    # Git metadata
├── .github/                 # GitHub configuration  
│   └── copilot-instructions.md
└── README.md               # Project overview
```

### Frequently Used Commands
- Repository navigation: `cd /home/runner/work/Da-Kraken/Da-Kraken`
- View all files: `ls -la`
- Git status check: `git status`
- View README: `cat README.md`

### Adding New Features
When expanding this repository:
1. Always update README.md to reflect new functionality
2. Add appropriate build/test configuration for chosen technology
3. Update these copilot instructions to include new build and test procedures
4. Include validation steps for new features
5. Document expected execution times for any long-running operations

## Important Notes
- This is currently a minimal repository ready for development
- All git operations work normally
- Environment has full development toolchain available (Node.js, Python, Docker, etc.)
- No long-running builds or tests currently present
- Always validate changes with `git status` and basic repository commands before committing

## Mission Statement
As stated in README.md: "BUILD-DEPLOY-ENJOY" - This repository is prepared for rapid development and deployment cycles.