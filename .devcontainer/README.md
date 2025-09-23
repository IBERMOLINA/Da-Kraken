# Da-Kraken Devcontainer Configuration

This directory contains the GitHub Codespace/DevContainer configuration for the Da-Kraken project.

## What it does

When you open this repository in a GitHub Codespace or DevContainer, it will automatically:

1. **Set up Node.js 20** environment with npm
2. **Install all dependencies** for the xomni project (42+ packages including React, Vite, Monaco Editor, Three.js, etc.)
3. **Configure VS Code** with useful extensions for web development
4. **Forward necessary ports** (3000, 3001, 8000) for development servers
5. **Set up development environment variables**

## Pre-installed Dependencies

The setup automatically installs all dependencies from `xomni/package.json`:

### Main Dependencies (42)
- React 18.2.0 & React DOM
- Vite 4.4.0 (build tool)
- Monaco Editor & CodeMirror (code editors)
- Three.js & React Three Fiber (3D graphics)
- Styled Components & Framer Motion (UI/animations)
- Socket.IO (real-time communication)
- Axios (HTTP client)
- And many more...

### Dev Dependencies (11)
- ESLint & Jest (testing/linting)
- TypeScript types
- Testing Library
- Vite PWA plugin
- And more...

## Files

- `devcontainer.json` - Main configuration file
- `setup.sh` - Dependency installation script
- `README.md` - This documentation

## Usage

1. Open repository in GitHub Codespace or VS Code with DevContainer extension
2. Wait for the setup to complete (shows progress in terminal)
3. Start developing immediately with all dependencies ready!

### Available Commands (in xomni/ directory)

```bash
npm run dev      # Start development server (port 3000)
npm run server   # Start backend server (port 3001)  
npm run build    # Build for production
npm run test     # Run tests
npm run lint     # Run linter
```

## Features

- ✅ **Zero-config setup** - Everything works immediately
- ✅ **Fast startup** - Dependencies are cached between sessions
- ✅ **VS Code integration** - Pre-configured with useful extensions
- ✅ **Port forwarding** - Development servers accessible instantly
- ✅ **Git & GitHub CLI** - Fully integrated development workflow

## Ports

- **3000**: Xomni Frontend (React/Vite dev server)
- **3001**: Xomni Backend (Node.js server)
- **8000**: Local server (for main Da-Kraken app)