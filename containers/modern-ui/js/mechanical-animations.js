// Mechanical Animations - Advanced 3D Mechanical Animation System

class MechanicalAnimationEngine {
    constructor() {
        this.animations = new Map();
        this.mechanicalElements = new Map();
        this.animationQueue = [];
        this.isRunning = false;
        this.frameRate = 60;
        this.lastFrameTime = 0;
        
        this.init();
    }

    init() {
        this.setupAnimationFramework();
        this.registerMechanicalElements();
        this.startAnimationEngine();
    }

    // Setup core animation framework
    setupAnimationFramework() {
        // Define animation presets
        this.animationPresets = {
            // Gear Animations
            gearRotate: {
                keyframes: [
                    { transform: 'rotate(0deg)', offset: 0 },
                    { transform: 'rotate(360deg)', offset: 1 }
                ],
                options: {
                    duration: 4000,
                    iterations: Infinity,
                    easing: 'linear'
                }
            },
            
            gearRotateReverse: {
                keyframes: [
                    { transform: 'rotate(0deg)', offset: 0 },
                    { transform: 'rotate(-360deg)', offset: 1 }
                ],
                options: {
                    duration: 4000,
                    iterations: Infinity,
                    easing: 'linear'
                }
            },

            // Hydraulic Animations
            hydraulicExtend: {
                keyframes: [
                    { transform: 'scaleY(1)', offset: 0 },
                    { transform: 'scaleY(1.5)', offset: 1 }
                ],
                options: {
                    duration: 3000,
                    iterations: Infinity,
                    direction: 'alternate',
                    easing: 'ease-in-out'
                }
            },

            hydraulicCompress: {
                keyframes: [
                    { transform: 'scaleY(1)', offset: 0 },
                    { transform: 'scaleY(0.7)', offset: 1 }
                ],
                options: {
                    duration: 2000,
                    iterations: Infinity,
                    direction: 'alternate',
                    easing: 'ease-in-out'
                }
            },

            // Spring Animations
            springBounce: {
                keyframes: [
                    { transform: 'scaleY(1)', offset: 0 },
                    { transform: 'scaleY(0.8)', offset: 0.25 },
                    { transform: 'scaleY(1.2)', offset: 0.5 },
                    { transform: 'scaleY(0.9)', offset: 0.75 },
                    { transform: 'scaleY(1)', offset: 1 }
                ],
                options: {
                    duration: 1500,
                    iterations: Infinity,
                    easing: 'ease-in-out'
                }
            },

            // Piston Animations
            pistonMove: {
                keyframes: [
                    { transform: 'translateX(0px)', offset: 0 },
                    { transform: 'translateX(20px)', offset: 0.5 },
                    { transform: 'translateX(0px)', offset: 1 }
                ],
                options: {
                    duration: 2000,
                    iterations: Infinity,
                    easing: 'ease-in-out'
                }
            },

            // Vibration Effects
            mechanicalVibrate: {
                keyframes: [
                    { transform: 'translateX(0px) translateY(0px)', offset: 0 },
                    { transform: 'translateX(-1px) translateY(-1px)', offset: 0.25 },
                    { transform: 'translateX(1px) translateY(1px)', offset: 0.5 },
                    { transform: 'translateX(-1px) translateY(1px)', offset: 0.75 },
                    { transform: 'translateX(0px) translateY(0px)', offset: 1 }
                ],
                options: {
                    duration: 100,
                    iterations: Infinity,
                    easing: 'ease-in-out'
                }
            },

            // Pressure Gauge
            pressureGauge: {
                keyframes: [
                    { transform: 'rotate(-45deg)', offset: 0 },
                    { transform: 'rotate(0deg)', offset: 0.25 },
                    { transform: 'rotate(45deg)', offset: 0.5 },
                    { transform: 'rotate(90deg)', offset: 0.75 },
                    { transform: 'rotate(-45deg)', offset: 1 }
                ],
                options: {
                    duration: 4000,
                    iterations: Infinity,
                    easing: 'ease-in-out'
                }
            },

            // Conveyor Belt
            conveyorBelt: {
                keyframes: [
                    { backgroundPositionX: '0px', offset: 0 },
                    { backgroundPositionX: '40px', offset: 1 }
                ],
                options: {
                    duration: 2000,
                    iterations: Infinity,
                    easing: 'linear'
                }
            },

            // Steam Effect
            steamRise: {
                keyframes: [
                    { 
                        transform: 'translateY(0px) scale(1)', 
                        opacity: 0.8,
                        offset: 0 
                    },
                    { 
                        transform: 'translateY(-20px) scale(1.2)', 
                        opacity: 0.4,
                        offset: 0.5 
                    },
                    { 
                        transform: 'translateY(-40px) scale(1.5)', 
                        opacity: 0,
                        offset: 1 
                    }
                ],
                options: {
                    duration: 3000,
                    iterations: Infinity,
                    easing: 'ease-out'
                }
            },

            // Assembly Line
            assemblyMove: {
                keyframes: [
                    { transform: 'translateX(-100px) rotate(0deg)', offset: 0 },
                    { transform: 'translateX(0px) rotate(180deg)', offset: 0.5 },
                    { transform: 'translateX(100px) rotate(360deg)', offset: 1 }
                ],
                options: {
                    duration: 6000,
                    iterations: Infinity,
                    easing: 'ease-in-out'
                }
            },

            // Mechanical Lift
            mechanicalLift: {
                keyframes: [
                    { transform: 'translateY(0px) rotateX(0deg)', offset: 0 },
                    { transform: 'translateY(-10px) rotateX(10deg)', offset: 1 }
                ],
                options: {
                    duration: 300,
                    fill: 'forwards',
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }
            },

            // Mechanical Tilt
            mechanicalTilt: {
                keyframes: [
                    { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)', offset: 0 },
                    { transform: 'perspective(1000px) rotateX(10deg) rotateY(10deg)', offset: 1 }
                ],
                options: {
                    duration: 300,
                    fill: 'forwards',
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }
            }
        };
    }

    // Register mechanical elements in the DOM
    registerMechanicalElements() {
        const mechanicalSelectors = [
            '.mechanical-gear',
            '.gear',
            '.mechanical-cylinder',
            '.mechanical-spring',
            '.mechanical-piston',
            '.mechanical-conveyor',
            '.mechanical-steam',
            '.mechanical-gauge',
            '[data-mechanical]',
            '[class*="mechanical-"]'
        ];

        mechanicalSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => this.registerElement(element));
        });
    }

    // Register individual mechanical element
    registerElement(element) {
        const elementId = this.generateElementId();
        const mechanicalType = this.detectMechanicalType(element);
        
        const mechanicalElement = {
            id: elementId,
            element: element,
            type: mechanicalType,
            animations: [],
            state: 'idle',
            properties: this.extractElementProperties(element)
        };

        this.mechanicalElements.set(elementId, mechanicalElement);
        
        // Apply initial styling
        this.applyMechanicalStyling(mechanicalElement);
        
        // Start appropriate animations
        this.startElementAnimations(mechanicalElement);
        
        return elementId;
    }

    // Detect mechanical element type
    detectMechanicalType(element) {
        const classList = element.classList;
        const dataType = element.dataset.mechanical;
        
        if (dataType) return dataType;
        if (classList.contains('gear') || classList.contains('mechanical-gear')) return 'gear';
        if (classList.contains('mechanical-cylinder')) return 'cylinder';
        if (classList.contains('mechanical-spring')) return 'spring';
        if (classList.contains('mechanical-piston')) return 'piston';
        if (classList.contains('mechanical-conveyor')) return 'conveyor';
        if (classList.contains('mechanical-steam')) return 'steam';
        if (classList.contains('mechanical-gauge')) return 'gauge';
        if (classList.contains('mechanical-assembly')) return 'assembly';
        
        return 'generic';
    }

    // Extract element properties
    extractElementProperties(element) {
        return {
            size: element.dataset.size || 'medium',
            speed: parseFloat(element.dataset.speed) || 1.0,
            direction: element.dataset.direction || 'forward',
            intensity: parseFloat(element.dataset.intensity) || 1.0,
            autoStart: element.dataset.autoStart !== 'false'
        };
    }

    // Apply mechanical styling
    applyMechanicalStyling(mechanicalElement) {
        const { element, type } = mechanicalElement;
        
        element.style.transformStyle = 'preserve-3d';
        element.style.transition = 'all 0.3s ease';
        
        // Add mechanical-specific classes
        element.classList.add('mechanical-element', `mechanical-${type}`);
        
        // Apply type-specific styling
        switch (type) {
            case 'gear':
                this.applyGearStyling(element);
                break;
            case 'cylinder':
                this.applyCylinderStyling(element);
                break;
            case 'spring':
                this.applyStringStyling(element);
                break;
            case 'conveyor':
                this.applyConveyorStyling(element);
                break;
        }
    }

    // Apply gear-specific styling
    applyGearStyling(element) {
        if (!element.querySelector('.gear-teeth')) {
            const teeth = document.createElement('div');
            teeth.className = 'gear-teeth';
            element.appendChild(teeth);
        }
        
        // Add metallic appearance
        element.style.background = 'radial-gradient(circle, #777 30%, #333 70%)';
        element.style.border = '3px solid #555';
        element.style.borderRadius = '50%';
    }

    // Apply cylinder-specific styling
    applyCylinderStyling(element) {
        element.style.background = 'linear-gradient(180deg, #777 0%, #555 50%, #333 100%)';
        element.style.border = '2px solid #555';
        element.style.borderRadius = '10px';
        
        if (!element.querySelector('.cylinder-piston')) {
            const piston = document.createElement('div');
            piston.className = 'cylinder-piston';
            element.appendChild(piston);
        }
    }

    // Apply spring-specific styling
    applyStringStyling(element) {
        element.style.background = 'repeating-linear-gradient(0deg, #555 0px, #555 2px, #777 2px, #777 4px)';
        element.style.border = '1px solid #333';
        element.style.borderRadius = '10px';
    }

    // Apply conveyor-specific styling
    applyConveyorStyling(element) {
        element.style.background = 'repeating-linear-gradient(90deg, #555 0px, #555 10px, #777 10px, #777 20px)';
        element.style.backgroundSize = '40px 100%';
    }

    // Start animations for element
    startElementAnimations(mechanicalElement) {
        const { type, properties } = mechanicalElement;
        
        if (!properties.autoStart) return;
        
        switch (type) {
            case 'gear':
                this.startGearAnimation(mechanicalElement);
                break;
            case 'cylinder':
                this.startCylinderAnimation(mechanicalElement);
                break;
            case 'spring':
                this.startSpringAnimation(mechanicalElement);
                break;
            case 'piston':
                this.startPistonAnimation(mechanicalElement);
                break;
            case 'conveyor':
                this.startConveyorAnimation(mechanicalElement);
                break;
            case 'steam':
                this.startSteamAnimation(mechanicalElement);
                break;
            case 'gauge':
                this.startGaugeAnimation(mechanicalElement);
                break;
            case 'assembly':
                this.startAssemblyAnimation(mechanicalElement);
                break;
        }
    }

    // Start gear animation
    startGearAnimation(mechanicalElement) {
        const animationType = mechanicalElement.properties.direction === 'reverse' ? 
            'gearRotateReverse' : 'gearRotate';
        
        this.applyAnimation(mechanicalElement, animationType);
    }

    // Start cylinder animation
    startCylinderAnimation(mechanicalElement) {
        const animationType = mechanicalElement.properties.size === 'large' ? 
            'hydraulicExtend' : 'hydraulicCompress';
        
        this.applyAnimation(mechanicalElement, animationType);
    }

    // Start spring animation
    startSpringAnimation(mechanicalElement) {
        this.applyAnimation(mechanicalElement, 'springBounce');
    }

    // Start piston animation
    startPistonAnimation(mechanicalElement) {
        this.applyAnimation(mechanicalElement, 'pistonMove');
    }

    // Start conveyor animation
    startConveyorAnimation(mechanicalElement) {
        this.applyAnimation(mechanicalElement, 'conveyorBelt');
    }

    // Start steam animation
    startSteamAnimation(mechanicalElement) {
        this.applyAnimation(mechanicalElement, 'steamRise');
    }

    // Start gauge animation
    startGaugeAnimation(mechanicalElement) {
        this.applyAnimation(mechanicalElement, 'pressureGauge');
    }

    // Start assembly animation
    startAssemblyAnimation(mechanicalElement) {
        this.applyAnimation(mechanicalElement, 'assemblyMove');
    }

    // Apply animation to element
    applyAnimation(mechanicalElement, animationType) {
        const preset = this.animationPresets[animationType];
        if (!preset) return;

        const { element, properties } = mechanicalElement;
        
        // Adjust animation options based on properties
        const options = { ...preset.options };
        if (properties.speed !== 1.0) {
            options.duration = options.duration / properties.speed;
        }

        // Create and start animation
        const animation = element.animate(preset.keyframes, options);
        
        // Store animation reference
        mechanicalElement.animations.push({
            type: animationType,
            animation: animation,
            startTime: Date.now()
        });

        return animation;
    }

    // Start animation engine
    startAnimationEngine() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animationLoop();
    }

    // Main animation loop
    animationLoop() {
        const currentTime = performance.now();
        
        if (currentTime - this.lastFrameTime >= 1000 / this.frameRate) {
            this.updateAnimations();
            this.processAnimationQueue();
            this.lastFrameTime = currentTime;
        }
        
        if (this.isRunning) {
            requestAnimationFrame(() => this.animationLoop());
        }
    }

    // Update all animations
    updateAnimations() {
        this.mechanicalElements.forEach(mechanicalElement => {
            this.updateElementAnimations(mechanicalElement);
        });
    }

    // Update animations for specific element
    updateElementAnimations(mechanicalElement) {
        mechanicalElement.animations.forEach((animData, index) => {
            if (animData.animation.playState === 'finished') {
                mechanicalElement.animations.splice(index, 1);
            }
        });
    }

    // Process animation queue
    processAnimationQueue() {
        while (this.animationQueue.length > 0) {
            const queuedAnimation = this.animationQueue.shift();
            this.executeQueuedAnimation(queuedAnimation);
        }
    }

    // Execute queued animation
    executeQueuedAnimation(queuedAnimation) {
        const { elementId, animationType, options } = queuedAnimation;
        const mechanicalElement = this.mechanicalElements.get(elementId);
        
        if (mechanicalElement) {
            this.applyAnimation(mechanicalElement, animationType);
        }
    }

    // Public API methods
    addAnimation(elementId, animationType, options = {}) {
        this.animationQueue.push({
            elementId,
            animationType,
            options
        });
    }

    removeAnimation(elementId, animationType) {
        const mechanicalElement = this.mechanicalElements.get(elementId);
        if (!mechanicalElement) return;
        
        mechanicalElement.animations = mechanicalElement.animations.filter(animData => {
            if (animData.type === animationType) {
                animData.animation.cancel();
                return false;
            }
            return true;
        });
    }

    pauseAnimation(elementId, animationType) {
        const mechanicalElement = this.mechanicalElements.get(elementId);
        if (!mechanicalElement) return;
        
        const animData = mechanicalElement.animations.find(a => a.type === animationType);
        if (animData) {
            animData.animation.pause();
        }
    }

    resumeAnimation(elementId, animationType) {
        const mechanicalElement = this.mechanicalElements.get(elementId);
        if (!mechanicalElement) return;
        
        const animData = mechanicalElement.animations.find(a => a.type === animationType);
        if (animData) {
            animData.animation.play();
        }
    }

    // Hover effects
    addHoverEffects(elementId) {
        const mechanicalElement = this.mechanicalElements.get(elementId);
        if (!mechanicalElement) return;
        
        const { element } = mechanicalElement;
        
        element.addEventListener('mouseenter', () => {
            this.applyAnimation(mechanicalElement, 'mechanicalLift');
            element.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(0, 212, 255, 0.5))';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
            element.style.filter = '';
        });
    }

    // Utility methods
    generateElementId() {
        return `mechanical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getMechanicalElement(elementId) {
        return this.mechanicalElements.get(elementId);
    }

    getAllMechanicalElements() {
        return Array.from(this.mechanicalElements.values());
    }

    stopAllAnimations() {
        this.mechanicalElements.forEach(mechanicalElement => {
            mechanicalElement.animations.forEach(animData => {
                animData.animation.cancel();
            });
            mechanicalElement.animations = [];
        });
    }

    stop() {
        this.isRunning = false;
        this.stopAllAnimations();
    }
}

// Initialize mechanical animation engine
document.addEventListener('DOMContentLoaded', () => {
    window.mechanicalAnimationEngine = new MechanicalAnimationEngine();
    
    // Auto-detect and animate mechanical elements after a delay
    setTimeout(() => {
        window.mechanicalAnimationEngine.registerMechanicalElements();
    }, 500);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MechanicalAnimationEngine;
}