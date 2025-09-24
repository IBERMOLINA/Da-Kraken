#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌐 Starting Web Development Container${NC}"
echo -e "${BLUE}HTML + CSS + JavaScript Development Environment${NC}"

# Initialize workspace if not already done
if [ ! -f "/workspace/.initialized" ]; then
    echo -e "${YELLOW}📦 Initializing workspace for web development...${NC}"
    
    # Copy templates to workspace
    cp -r /templates/* /workspace/ 2>/dev/null || true
    
    # Create project structure
    mkdir -p /workspace/{components,layouts,pages,assets/{images,fonts,icons},styles/{components,layouts,pages,utils},scripts/{modules,utils,vendors},tests/{unit,integration,e2e}}
    
    # Create .gitignore
    cat > /workspace/.gitignore << 'EOF'
# Dependencies
node_modules/
bower_components/
jspm_packages/

# Production builds
dist/
build/
public/build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out
storybook-static

# Temporary folders
tmp/
temp/

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log

# Local database files
*.db
*.sqlite
*.sqlite3

# Browser testing
/coverage
/e2e/reports/
/e2e/screenshots/
/e2e/videos/
EOF

    # Create EditorConfig
    cat > /workspace/.editorconfig << 'EOF'
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.{js,jsx,ts,tsx,vue}]
indent_size = 2

[*.{html,css,scss,sass,less}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
EOF

    # Create README
    cat > /workspace/README.md << 'EOF'
# Web Development Project

## 🌐 HTML + CSS + JavaScript Development Environment

This workspace is optimized for modern web development with support for:

### Technologies
- **HTML5**: Modern semantic markup
- **CSS3**: Advanced styling with Flexbox, Grid, and animations
- **JavaScript/TypeScript**: Modern ES6+ development
- **Frameworks**: React, Vue, Angular support
- **Build Tools**: Vite, Webpack, Parcel, Rollup
- **Testing**: Jest, Cypress, Playwright
- **Linting**: ESLint, Prettier, Stylelint

### Getting Started

1. **Initialize a new project:**
   ```bash
   npm init -y
   ```

2. **Start a development server:**
   ```bash
   # Simple HTTP server
   npx serve .
   
   # Live reload server
   npx live-server
   
   # Vite development server
   npm create vite@latest my-app
   cd my-app && npm install && npm run dev
   ```

3. **Create React app:**
   ```bash
   npx create-react-app my-react-app
   cd my-react-app && npm start
   ```

4. **Create Vue app:**
   ```bash
   npm create vue@latest my-vue-app
   cd my-vue-app && npm install && npm run dev
   ```

### Available Commands

- `dev-utils` - Development utilities and helpers
- `npm run build` - Build production version
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

### Project Structure

```
/workspace/
├── components/     # Reusable components
├── layouts/        # Page layouts
├── pages/          # Application pages
├── assets/         # Static assets
├── styles/         # CSS/SCSS files
├── scripts/        # JavaScript modules
├── tests/          # Test files
└── docs/           # Documentation
```

### Ports

- **3000**: React development server
- **4200**: Angular development server  
- **5173**: Vite development server
- **8080**: Live-server/HTTP server

Happy coding! 🚀
EOF

    # Create sample HTML5 project
    cat > /workspace/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Development Workspace</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="nav-brand">
                <h1>🌐 Web Dev</h1>
            </div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#about">About</a></li>
            </ul>
        </nav>
    </header>

    <main class="main">
        <section class="hero">
            <div class="container">
                <h1 class="hero-title">Welcome to Your Web Development Workspace</h1>
                <p class="hero-subtitle">HTML5 + CSS3 + JavaScript development environment</p>
                <div class="hero-actions">
                    <button class="btn btn-primary" onclick="createProject()">Create New Project</button>
                    <button class="btn btn-secondary" onclick="showExamples()">View Examples</button>
                </div>
            </div>
        </section>

        <section class="features">
            <div class="container">
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">🎨</div>
                        <h3>Modern CSS</h3>
                        <p>CSS Grid, Flexbox, animations, and responsive design</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">⚡</div>
                        <h3>Fast Development</h3>
                        <p>Hot reload, live server, and modern build tools</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🧪</div>
                        <h3>Testing Ready</h3>
                        <p>Jest, Cypress, and Playwright testing frameworks</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 Da-Kraken Web Development Environment</p>
        </div>
    </footer>

    <script src="scripts/main.js"></script>
</body>
</html>
EOF

    # Create main CSS file
    mkdir -p /workspace/styles
    cat > /workspace/styles/main.css << 'EOF'
/* Modern CSS Reset */
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

/* CSS Custom Properties */
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #17a2b8;
    --light-color: #f8f9fa;
    --dark-color: #343a40;
    
    --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --font-family-mono: 'SF Mono', Monaco, Menlo, Consolas, 'Liberation Mono', 'Courier New', monospace;
    
    --border-radius: 0.375rem;
    --box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    --transition: all 0.15s ease-in-out;
    
    --container-max-width: 1200px;
    --grid-gap: 2rem;
}

/* Base Styles */
html {
    font-size: 16px;
    scroll-behavior: smooth;
}

body {
    font-family: var(--font-family-base);
    line-height: 1.6;
    color: var(--dark-color);
    background-color: #fff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 1rem;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }

p {
    margin-bottom: 1rem;
}

/* Layout Components */
.container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: 0 1rem;
}

/* Header */
.header {
    background-color: #fff;
    box-shadow: var(--box-shadow);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

.nav-brand h1 {
    color: var(--primary-color);
    margin: 0;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    text-decoration: none;
    color: var(--dark-color);
    font-weight: 500;
    transition: var(--transition);
}

.nav-menu a:hover {
    color: var(--primary-color);
}

/* Main Content */
.main {
    flex: 1;
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, var(--primary-color), var(--info-color));
    color: white;
    padding: 4rem 0;
    text-align: center;
}

.hero-title {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

/* Buttons */
.btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    border: 1px solid transparent;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
    background: none;
}

.btn-primary {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: #0056b3;
    border-color: #0056b3;
}

.btn-secondary {
    background-color: transparent;
    border-color: white;
    color: white;
}

.btn-secondary:hover {
    background-color: white;
    color: var(--primary-color);
}

/* Features Section */
.features {
    padding: 4rem 0;
    background-color: var(--light-color);
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--grid-gap);
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    text-align: center;
    transition: var(--transition);
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-card h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

/* Footer */
.footer {
    background-color: var(--dark-color);
    color: white;
    text-align: center;
    padding: 2rem 0;
    margin-top: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
    .nav {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav-menu {
        gap: 1rem;
    }
    
    .hero-title {
        font-size: 2rem;
    }
    
    .hero-actions {
        flex-direction: column;
        align-items: center;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.hero {
    animation: fadeInUp 0.8s ease-out;
}

.feature-card {
    animation: fadeInUp 0.8s ease-out;
    animation-fill-mode: both;
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
EOF

    # Create main JavaScript file
    mkdir -p /workspace/scripts
    cat > /workspace/scripts/main.js << 'EOF'
// Modern JavaScript ES6+ Features Demo

class WebDevWorkspace {
    constructor() {
        this.projects = [];
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        console.log('🌐 Web Development Workspace initialized');
        this.setupEventListeners();
        this.loadProjects();
        this.displayWelcomeMessage();
    }

    setupEventListeners() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add scroll effect to header
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    handleScroll() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = '#fff';
            header.style.backdropFilter = 'none';
        }
    }

    displayWelcomeMessage() {
        const messages = [
            '🎨 Ready for creative web development!',
            '⚡ Modern tools at your fingertips!',
            '🚀 Let\'s build something amazing!',
            '💡 Your ideas, powered by modern web tech!'
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        console.log(`%c${randomMessage}`, 'color: #007bff; font-size: 16px; font-weight: bold;');
    }

    loadProjects() {
        // Load projects from localStorage
        const savedProjects = localStorage.getItem('webdev-projects');
        if (savedProjects) {
            this.projects = JSON.parse(savedProjects);
        }
    }

    saveProjects() {
        localStorage.setItem('webdev-projects', JSON.stringify(this.projects));
    }

    createProject(name, type = 'vanilla') {
        const project = {
            id: Date.now().toString(),
            name: name || `Project ${this.projects.length + 1}`,
            type: type,
            created: new Date().toISOString(),
            files: [],
            status: 'active'
        };

        this.projects.push(project);
        this.saveProjects();
        
        console.log(`📁 Created new ${type} project: ${project.name}`);
        return project;
    }

    async fetchWebDevResources() {
        try {
            // Example API call for web development resources
            const response = await fetch('/api/webdev-resources');
            const resources = await response.json();
            return resources;
        } catch (error) {
            console.warn('Could not fetch resources:', error.message);
            return this.getDefaultResources();
        }
    }

    getDefaultResources() {
        return {
            frameworks: [
                { name: 'React', url: 'https://reactjs.org', description: 'A JavaScript library for building user interfaces' },
                { name: 'Vue.js', url: 'https://vuejs.org', description: 'The Progressive JavaScript Framework' },
                { name: 'Angular', url: 'https://angular.io', description: 'Platform for building mobile and desktop web applications' }
            ],
            tools: [
                { name: 'Vite', url: 'https://vitejs.dev', description: 'Next generation frontend tooling' },
                { name: 'Webpack', url: 'https://webpack.js.org', description: 'Static module bundler for modern JavaScript applications' },
                { name: 'ESLint', url: 'https://eslint.org', description: 'Find and fix problems in your JavaScript code' }
            ],
            resources: [
                { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Resources for developers, by developers' },
                { name: 'Can I Use', url: 'https://caniuse.com', description: 'Browser support tables for modern web technologies' },
                { name: 'CSS-Tricks', url: 'https://css-tricks.com', description: 'Tips, tricks, and techniques on using CSS' }
            ]
        };
    }

    generateComponentTemplate(componentName, type = 'vanilla') {
        const templates = {
            vanilla: `
<!-- ${componentName} Component -->
<div class="${componentName.toLowerCase()}-component">
    <h3>${componentName}</h3>
    <p>A new component for your project.</p>
</div>

<style>
.${componentName.toLowerCase()}-component {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}
</style>

<script>
class ${componentName} {
    constructor(element) {
        this.element = element;
        this.init();
    }
    
    init() {
        console.log('${componentName} component initialized');
    }
}
</script>
            `,
            react: `
import React from 'react';
import './${componentName}.css';

const ${componentName} = () => {
    return (
        <div className="${componentName.toLowerCase()}-component">
            <h3>${componentName}</h3>
            <p>A new React component for your project.</p>
        </div>
    );
};

export default ${componentName};
            `,
            vue: `
<template>
    <div class="${componentName.toLowerCase()}-component">
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
    </div>
</template>

<script>
export default {
    name: '${componentName}',
    data() {
        return {
            title: '${componentName}',
            description: 'A new Vue component for your project.'
        };
    }
};
</script>

<style scoped>
.${componentName.toLowerCase()}-component {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}
</style>
            `
        };

        return templates[type] || templates.vanilla;
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('webdev-theme', this.currentTheme);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global functions for button clicks
function createProject() {
    const workspace = new WebDevWorkspace();
    const projectName = prompt('Enter project name:');
    if (projectName) {
        workspace.createProject(projectName);
        workspace.showNotification(`Project "${projectName}" created successfully!`, 'success');
    }
}

function showExamples() {
    const examples = [
        'HTML5 Semantic Structure',
        'CSS Grid & Flexbox Layouts',
        'JavaScript ES6+ Features',
        'Responsive Design Patterns',
        'CSS Animations & Transitions',
        'Modern JavaScript Modules'
    ];
    
    alert('Available Examples:\n\n' + examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n'));
}

// Initialize the workspace
const workspace = new WebDevWorkspace();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebDevWorkspace;
}
EOF

    touch /workspace/.initialized
    echo -e "${GREEN}✅ Workspace initialized successfully!${NC}"
fi

# Display container information
echo ""
echo -e "${BLUE}📊 Web Development Container Status:${NC}"
echo "  🌐 HTML5, CSS3, JavaScript ready"
echo "  ⚡ Node.js $(node --version)"
echo "  📦 npm $(npm --version)"
echo "  🔧 TypeScript $(tsc --version 2>/dev/null || echo 'ready')"
echo ""
echo -e "${YELLOW}🔧 Available Development Servers:${NC}"
echo "  • live-server      - Live reload HTML server"
echo "  • serve           - Simple HTTP server"
echo "  • http-server     - HTTP server with options"
echo "  • vite            - Modern build tool"
echo ""
echo -e "${YELLOW}🎯 Quick Start Commands:${NC}"
echo "  • dev-utils       - Development utilities"
echo "  • npx create-react-app my-app"
echo "  • npm create vue@latest my-app"
echo "  • npx live-server"
echo ""

# Execute the passed command
exec "$@"