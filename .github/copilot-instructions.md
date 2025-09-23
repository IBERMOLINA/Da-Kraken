# Da-Kraken Repository Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

Da-Kraken is a modern local web application with a comprehensive testing infrastructure. The application features notes, color palette generator, Pomodoro timer, and theme management - all running locally without external dependencies.

## Working Effectively

### Repository Navigation and Setup
- Repository location: `/home/runner/work/Da-Kraken/Da-Kraken`
- Navigate to repository: `cd /home/runner/work/Da-Kraken/Da-Kraken`
- Check repository status: `git status`
- View repository contents: `ls -la`
- Read project README: `cat README.md`

### Current State Validation
- The repository contains a complete web application:
  - `index.html` - Main application interface
  - `scripts/` - JavaScript application code (utils.js, app.js, tools.js, theme.js)
  - `styles/` - CSS styling (main.css)
  - `tests/` - Comprehensive testing infrastructure
  - `assets/` - Application assets
  - `manifest.json` - PWA manifest
  - `package.json` - Project configuration

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

### Current Application State
- **Complete web application** - Ready to run with `python3 -m http.server 8080`
- **Comprehensive testing framework** - Custom browser-based testing with visual runner
- **No external dependencies** - Everything runs locally in the browser
- **Testing infrastructure** - 49+ tests covering utils, app, and tools functionality

### Running the Application
- Start server: `python3 -m http.server 8080`
- Open application: `http://localhost:8080/`
- Run tests: `http://localhost:8080/tests/`
- Test runner features: Visual interface, individual test suites, real-time results

### Testing Framework Features
- **Custom Test Framework** - Jest-like API without external dependencies
- **Visual Test Runner** - Web interface with progress bars and result cards
- **Comprehensive Coverage** - Tests for all major components:
  - DaKrakenUtils (storage, DOM, math, colors, validation, time)
  - DaKrakenApp (initialization, navigation, interactions, uptime, animations)
  - Tools (ToolsManager, NotesTool, ColorPaletteTool, PomodoroTimer)

### Future Development Setup
When adding code to this repository:
- For Node.js projects: Create `package.json` with `npm init`
- For Python projects: Create `requirements.txt` for dependencies
- For containerized apps: Add appropriate `Dockerfile`
- Always add comprehensive README updates when adding functionality

## Validation and Testing

### Manual Validation Steps
1. Navigate to repository root: `cd /home/runner/work/Da-Kraken/Da-Kraken`
2. Start the application server: `python3 -m http.server 8080`
3. Open application: `http://localhost:8080/`
4. Run test suite: `http://localhost:8080/tests/`
5. Verify all features work: notes, color palette, timer, theme switching

### Expected Behavior
- Application should start without errors on port 8080
- All navigation sections should be accessible (Dashboard, Tools, Settings)
- Test runner should execute all test suites successfully
- Tests should provide visual feedback with pass/fail indicators
- All features should persist data locally without external dependencies

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