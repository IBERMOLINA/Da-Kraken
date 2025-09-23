# xomni - Universal Coding Environment

A comprehensive AI-powered coding environment for creating software solutions across multiple platforms and languages.

## Features

### 🤖 AI Agent
- **Claude AI Integration**: Powered by Anthropic's Claude for intelligent coding assistance
- Built-in AI assistant for framework construction  
- Intelligent scaffolding and project setup
- Code optimization and testing assistance
- Graceful fallback to simulation mode when API key not configured

### 🎨 Dark Theme UI
- High-contrast dark theme optimized for coding
- 3D mechanical and abstract symbol dictionary
- Minimalist interface design

### 📚 Stack Management
- Pre-configured development stacks
- Cross-platform project templates
- One-click deployment options

### 🔧 Development Tools
- Multi-language code editor with syntax highlighting
- Integrated terminal with command execution
- Testing and optimization tools
- Real-time collaboration features

### 🌐 Offline/Online Modes
- Full offline functionality for development
- Server mode when internet connection available
- Progressive Web App (PWA) support

## Supported Platforms

- **Web Applications**: React, Vue, Angular, Svelte
- **Mobile Apps**: React Native, Flutter, Ionic
- **Desktop Apps**: Electron, Tauri
- **Backend Services**: Node.js, Python, Java, Go
- **Data Science**: Python, R, Jupyter
- **Game Development**: Unity, Godot, WebGL

## Supported Languages

JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, HTML, CSS, SQL, and more.

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/xomni.git
cd xomni

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server (optional)
npm run server
```

## Usage

### Development Mode
1. Open the application in your browser
2. Choose a project template or start from scratch
3. Use the AI agent to set up your framework
4. Start coding with the integrated editor
5. Test and optimize your code
6. Deploy to your target platform

### Offline Mode
- All features work without internet connection
- Local file system access
- Export projects for external use

### Online Mode
- Additional AI capabilities
- Cloud synchronization
- Real-time collaboration
- Remote deployment options

## Project Structure

```
xomni/
├── src/
│   ├── components/          # React components
│   ├── services/            # API services (Claude integration)
│   ├── utils/              # Utility functions and themes
│   ├── assets/             # Static assets and symbols
│   └── main.jsx            # Application entry point
├── server/                 # Backend server
├── public/                 # Public assets
├── CLAUDE_INTEGRATION.md   # Claude AI setup guide
└── dist/                   # Build output
```

## Commands

```bash
# Development
npm run dev              # Start development server
npm run server           # Start backend server

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run lint             # Run linter

# Deployment
npm run deploy           # Deploy to production
```

## Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Basic configuration
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=xomni
VITE_APP_VERSION=1.0.0

# Claude AI integration (optional)
VITE_CLAUDE_API_KEY=sk-ant-your-api-key-here
VITE_CLAUDE_MODEL=claude-3-sonnet-20240229
VITE_CLAUDE_MAX_TOKENS=4096
```

See `CLAUDE_INTEGRATION.md` for detailed Claude AI setup instructions.

### Customization
- Modify themes in `src/utils/themes.js`
- Add custom symbols in `src/components/SymbolDictionary.jsx`
- Extend language support in `src/components/CodeEditor.jsx`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- GitHub Issues: [Create an issue](https://github.com/your-username/xomni/issues)
- Documentation: [Wiki](https://github.com/your-username/xomni/wiki)
- Discord: [Join our community](https://discord.gg/xomni)

## Roadmap

- [ ] Mobile app version
- [ ] Plugin system for custom tools
- [ ] Advanced AI code generation
- [ ] Team collaboration features
- [ ] Custom stack builder
- [ ] Advanced debugging tools

---

**xomni** - Empowering developers to create better software, faster.