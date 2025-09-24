// Symbols.js - 3D Symbol Management System

class SymbolManager {
    constructor() {
        this.symbols = new Map();
        this.animations = new Map();
        this.symbolLibrary = this.initializeSymbolLibrary();
        this.init();
    }

    init() {
        this.loadSymbols();
        this.setupEventListeners();
        this.startAnimationLoop();
    }

    // Initialize comprehensive symbol library
    initializeSymbolLibrary() {
        return {
            // Programming Languages
            languages: {
                nodejs: { symbol: '⚡', icon: 'devicon-nodejs-plain', color: '#68a063' },
                python: { symbol: '🐍', icon: 'devicon-python-plain', color: '#3776ab' },
                rust: { symbol: '🦀', icon: 'devicon-rust-plain', color: '#ce422b' },
                go: { symbol: '🚀', icon: 'devicon-go-plain', color: '#00add8' },
                java: { symbol: '☕', icon: 'devicon-java-plain', color: '#ed8b00' },
                php: { symbol: '🐘', icon: 'devicon-php-plain', color: '#777bb4' },
                zig: { symbol: '⚡', icon: 'fas fa-bolt', color: '#f7a41d' },
                crystal: { symbol: '💎', icon: 'fas fa-gem', color: '#000000' },
                elixir: { symbol: '💧', icon: 'devicon-elixir-plain', color: '#4e2a8e' },
                fortran: { symbol: '🔢', icon: 'fas fa-calculator', color: '#734f96' }
            },

            // System Operations
            system: {
                start: { symbol: '▶️', icon: 'fas fa-play', color: '#00ff88' },
                stop: { symbol: '⏹️', icon: 'fas fa-stop', color: '#ff4444' },
                restart: { symbol: '🔄', icon: 'fas fa-redo', color: '#ff8800' },
                settings: { symbol: '⚙️', icon: 'fas fa-cog', color: '#8844ff' },
                terminal: { symbol: '💻', icon: 'fas fa-terminal', color: '#00d4ff' },
                server: { symbol: '🖥️', icon: 'fas fa-server', color: '#00ffff' }
            },

            // Development Tools
            tools: {
                code: { symbol: '👨‍💻', icon: 'fas fa-code', color: '#00d4ff' },
                debug: { symbol: '🐛', icon: 'fas fa-bug', color: '#ff8800' },
                test: { symbol: '🧪', icon: 'fas fa-flask', color: '#00ff88' },
                build: { symbol: '🔨', icon: 'fas fa-hammer', color: '#8844ff' },
                deploy: { symbol: '🚀', icon: 'fas fa-rocket', color: '#ff4444' },
                monitor: { symbol: '📊', icon: 'fas fa-chart-bar', color: '#00ffff' }
            },

            // Status Indicators
            status: {
                online: { symbol: '🟢', icon: 'fas fa-circle', color: '#00ff88' },
                offline: { symbol: '🔴', icon: 'fas fa-circle', color: '#ff4444' },
                warning: { symbol: '🟡', icon: 'fas fa-exclamation-triangle', color: '#ff8800' },
                loading: { symbol: '🔄', icon: 'fas fa-spinner', color: '#00d4ff' },
                success: { symbol: '✅', icon: 'fas fa-check', color: '#00ff88' },
                error: { symbol: '❌', icon: 'fas fa-times', color: '#ff4444' }
            },

            // Mechanical Elements
            mechanical: {
                gear: { symbol: '⚙️', icon: 'fas fa-cog', color: '#777777' },
                wrench: { symbol: '🔧', icon: 'fas fa-wrench', color: '#777777' },
                hammer: { symbol: '🔨', icon: 'fas fa-hammer', color: '#777777' },
                screwdriver: { symbol: '🪛', icon: 'fas fa-screwdriver', color: '#777777' },
                bolt: { symbol: '🔩', icon: 'fas fa-bolt', color: '#777777' },
                spring: { symbol: '🔁', icon: 'fas fa-sync', color: '#777777' }
            },

            // File Operations
            files: {
                folder: { symbol: '📁', icon: 'fas fa-folder', color: '#00d4ff' },
                file: { symbol: '📄', icon: 'fas fa-file', color: '#00ffff' },
                save: { symbol: '💾', icon: 'fas fa-save', color: '#00ff88' },
                upload: { symbol: '⬆️', icon: 'fas fa-upload', color: '#8844ff' },
                download: { symbol: '⬇️', icon: 'fas fa-download', color: '#ff8800' },
                delete: { symbol: '🗑️', icon: 'fas fa-trash', color: '#ff4444' }
            }
        };
    }

    // Load and initialize all symbols in the document
    loadSymbols() {
        const symbolElements = document.querySelectorAll('[data-symbol]');
        
        symbolElements.forEach(element => {
            const symbolType = element.dataset.symbol;
            const symbolInfo = this.getSymbolInfo(symbolType);
            
            if (symbolInfo) {
                this.createSymbol(element, symbolInfo);
            }
        });
    }

    // Get symbol information from library
    getSymbolInfo(symbolType) {
        // Search through all categories
        for (const category of Object.values(this.symbolLibrary)) {
            if (category[symbolType]) {
                return category[symbolType];
            }
        }
        
        // Fallback for custom symbols
        return {
            symbol: symbolType,
            icon: 'fas fa-cube',
            color: '#00d4ff'
        };
    }

    // Create 3D symbol element
    createSymbol(element, symbolInfo) {
        const symbolId = this.generateSymbolId();
        
        // Store symbol data
        this.symbols.set(symbolId, {
            element,
            info: symbolInfo,
            state: 'idle',
            animations: []
        });

        // Apply symbol styling
        this.applySymbolStyling(element, symbolInfo);
        
        // Add 3D effects
        this.add3DEffects(element);
        
        // Setup interactions
        this.setupSymbolInteractions(element, symbolId);

        return symbolId;
    }

    // Apply base styling to symbol
    applySymbolStyling(element, symbolInfo) {
        element.style.color = symbolInfo.color;
        element.style.transition = 'all var(--transition-medium)';
        element.style.cursor = 'pointer';
        element.style.position = 'relative';
        element.style.display = 'inline-flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        
        // Add classes for styling
        element.classList.add('symbol', 'symbol-3d', 'symbol-interactive');
        
        // Set initial filter for glow effect
        element.style.filter = `drop-shadow(0 0 8px ${symbolInfo.color})`;
    }

    // Add 3D transformation effects
    add3DEffects(element) {
        element.style.transformStyle = 'preserve-3d';
        element.style.perspective = '1000px';
        
        // Create 3D depth layers
        const shadowLayer = document.createElement('div');
        shadowLayer.className = 'symbol-shadow-layer';
        shadowLayer.style.position = 'absolute';
        shadowLayer.style.top = '2px';
        shadowLayer.style.left = '2px';
        shadowLayer.style.color = 'rgba(0, 0, 0, 0.3)';
        shadowLayer.style.transform = 'translateZ(-2px)';
        shadowLayer.style.zIndex = '-1';
        shadowLayer.textContent = element.textContent;
        
        const highlightLayer = document.createElement('div');
        highlightLayer.className = 'symbol-highlight-layer';
        highlightLayer.style.position = 'absolute';
        highlightLayer.style.top = '-1px';
        highlightLayer.style.left = '-1px';
        highlightLayer.style.color = 'rgba(255, 255, 255, 0.2)';
        highlightLayer.style.transform = 'translateZ(2px)';
        highlightLayer.style.zIndex = '1';
        highlightLayer.textContent = element.textContent;
        
        element.appendChild(shadowLayer);
        element.appendChild(highlightLayer);
    }

    // Setup symbol interactions
    setupSymbolInteractions(element, symbolId) {
        element.addEventListener('mouseenter', () => {
            this.onSymbolHover(symbolId, true);
        });
        
        element.addEventListener('mouseleave', () => {
            this.onSymbolHover(symbolId, false);
        });
        
        element.addEventListener('click', () => {
            this.onSymbolClick(symbolId);
        });
        
        element.addEventListener('animationend', (e) => {
            this.onAnimationEnd(symbolId, e.animationName);
        });
    }

    // Handle symbol hover events
    onSymbolHover(symbolId, isHovering) {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) return;
        
        const { element, info } = symbol;
        
        if (isHovering) {
            // Enhanced hover effects
            element.style.transform = 'translateY(-3px) rotateX(15deg) rotateY(15deg) scale(1.1)';
            element.style.filter = `drop-shadow(0 0 20px ${info.color}) brightness(1.3)`;
            element.style.textShadow = `0 0 15px ${info.color}`;
            
            // Add pulsing animation
            this.addAnimation(symbolId, 'pulse-glow');
        } else {
            // Reset to normal state
            element.style.transform = 'translateY(0) rotateX(0) rotateY(0) scale(1)';
            element.style.filter = `drop-shadow(0 0 8px ${info.color})`;
            element.style.textShadow = 'none';
            
            // Remove hover animations
            this.removeAnimation(symbolId, 'pulse-glow');
        }
    }

    // Handle symbol click events
    onSymbolClick(symbolId) {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) return;
        
        // Add click animation
        this.addAnimation(symbolId, 'bounce');
        
        // Emit custom event
        const clickEvent = new CustomEvent('symbolClick', {
            detail: { symbolId, symbol }
        });
        symbol.element.dispatchEvent(clickEvent);
        
        // Visual feedback
        this.createClickRipple(symbol.element);
    }

    // Create click ripple effect
    createClickRipple(element) {
        const ripple = document.createElement('div');
        ripple.className = 'symbol-ripple';
        ripple.style.position = 'absolute';
        ripple.style.top = '50%';
        ripple.style.left = '50%';
        ripple.style.width = '0';
        ripple.style.height = '0';
        ripple.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'rippleExpand 0.6s ease-out forwards';
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // Add animation to symbol
    addAnimation(symbolId, animationType) {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) return;
        
        const animationClass = `animate-${animationType}`;
        symbol.element.classList.add(animationClass);
        
        // Track animation
        if (!symbol.animations.includes(animationType)) {
            symbol.animations.push(animationType);
        }
    }

    // Remove animation from symbol
    removeAnimation(symbolId, animationType) {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) return;
        
        const animationClass = `animate-${animationType}`;
        symbol.element.classList.remove(animationClass);
        
        // Remove from tracking
        const index = symbol.animations.indexOf(animationType);
        if (index > -1) {
            symbol.animations.splice(index, 1);
        }
    }

    // Handle animation end events
    onAnimationEnd(symbolId, animationName) {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) return;
        
        // Remove completed animation class
        const animationType = animationName.replace('animate-', '');
        this.removeAnimation(symbolId, animationType);
    }

    // Start symbol status animations
    startStatusAnimations() {
        const statusSymbols = document.querySelectorAll('[data-symbol*="status"]');
        
        statusSymbols.forEach(element => {
            const symbolId = this.findSymbolId(element);
            if (symbolId) {
                this.addAnimation(symbolId, 'pulse-glow-slow');
            }
        });
    }

    // Start mechanical animations
    startMechanicalAnimations() {
        const mechanicalSymbols = document.querySelectorAll('[data-symbol*="gear"], [data-symbol*="mechanical"]');
        
        mechanicalSymbols.forEach((element, index) => {
            const symbolId = this.findSymbolId(element);
            if (symbolId) {
                // Stagger animations
                setTimeout(() => {
                    this.addAnimation(symbolId, index % 2 === 0 ? 'gear-rotate' : 'gear-rotate-reverse');
                }, index * 200);
            }
        });
    }

    // Animation loop for continuous effects
    startAnimationLoop() {
        const animateLoop = () => {
            this.updateSymbolStates();
            this.updateGlowEffects();
            requestAnimationFrame(animateLoop);
        };
        
        requestAnimationFrame(animateLoop);
    }

    // Update symbol states based on system status
    updateSymbolStates() {
        this.symbols.forEach((symbol, symbolId) => {
            const { element } = symbol;
            
            // Check for status updates
            if (element.dataset.status) {
                this.updateStatusSymbol(symbolId, element.dataset.status);
            }
        });
    }

    // Update status-specific symbols
    updateStatusSymbol(symbolId, status) {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) return;
        
        // Remove existing status animations
        symbol.animations.forEach(animation => {
            if (animation.includes('status')) {
                this.removeAnimation(symbolId, animation);
            }
        });
        
        // Add new status animation
        switch (status) {
            case 'online':
                this.addAnimation(symbolId, 'pulse-glow-slow');
                break;
            case 'loading':
                this.addAnimation(symbolId, 'gear-rotate');
                break;
            case 'warning':
                this.addAnimation(symbolId, 'pulse-glow-fast');
                break;
            case 'error':
                this.addAnimation(symbolId, 'vibrate');
                break;
        }
    }

    // Update glow effects based on time
    updateGlowEffects() {
        const time = Date.now() * 0.001;
        
        this.symbols.forEach((symbol) => {
            const { element, info } = symbol;
            const intensity = (Math.sin(time * 2) + 1) * 0.5;
            const glowSize = 8 + intensity * 12;
            
            element.style.filter = `drop-shadow(0 0 ${glowSize}px ${info.color})`;
        });
    }

    // Utility methods
    generateSymbolId() {
        return `symbol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    findSymbolId(element) {
        for (const [symbolId, symbol] of this.symbols) {
            if (symbol.element === element) {
                return symbolId;
            }
        }
        return null;
    }

    // Public API methods
    getSymbol(symbolId) {
        return this.symbols.get(symbolId);
    }

    getAllSymbols() {
        return Array.from(this.symbols.values());
    }

    updateSymbol(symbolId, updates) {
        const symbol = this.symbols.get(symbolId);
        if (symbol) {
            Object.assign(symbol, updates);
        }
    }

    // Setup global event listeners
    setupEventListeners() {
        // Add CSS for ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rippleExpand {
                from {
                    width: 0;
                    height: 0;
                    opacity: 1;
                }
                to {
                    width: 100px;
                    height: 100px;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Listen for dynamic content changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const symbolElements = node.querySelectorAll ? 
                            node.querySelectorAll('[data-symbol]') : [];
                        
                        symbolElements.forEach(element => {
                            if (!this.findSymbolId(element)) {
                                const symbolType = element.dataset.symbol;
                                const symbolInfo = this.getSymbolInfo(symbolType);
                                
                                if (symbolInfo) {
                                    this.createSymbol(element, symbolInfo);
                                }
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize symbol manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.symbolManager = new SymbolManager();
    
    // Start animations after a brief delay
    setTimeout(() => {
        window.symbolManager.startStatusAnimations();
        window.symbolManager.startMechanicalAnimations();
    }, 1000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SymbolManager;
}