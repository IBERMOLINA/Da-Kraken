// Main application logic for Da-Kraken App
class DaKrakenApp {
  constructor() {
    this.startTime = Date.now();
    this.interactions = DK.getFromStorage('interactions', 0);
    this.currentSection = 'dashboard';
    this.uptimeInterval = null;
    
    this.init();
  }

  async init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    this.setupEventListeners();
    this.initializeApp();
    this.startUptime();
    
    // Initialize loading sequence
    setTimeout(() => {
      this.hideLoadingScreen();
    }, 2500);
  }

  setupEventListeners() {
    // Navigation
    const navBtns = DK.$$('.nav-btn');
    navBtns.forEach(btn => {
      DK.addEvent(btn, 'click', (e) => {
        const section = e.target.getAttribute('data-section');
        if (section) {
          this.navigateToSection(section);
          this.incrementInteractions();
        }
      });
    });

    // Settings functionality
    this.setupSettingsListeners();

    // Keyboard shortcuts
    DK.addEvent(document, 'keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Track user interactions
    DK.addEvent(document, 'click', () => {
      this.incrementInteractions();
    });

    // Window visibility change
    DK.addEvent(document, 'visibilitychange', () => {
      if (document.hidden) {
        this.pauseTimers();
      } else {
        this.resumeTimers();
      }
    });

    // Window resize
    DK.addEvent(window, 'resize', DK.throttle(() => {
      this.handleResize();
    }, 250));

    // Prevent right-click context menu on interactive elements (optional)
    const interactiveElements = DK.$$('.btn, .nav-btn, .card, .color-swatch');
    interactiveElements.forEach(element => {
      DK.addEvent(element, 'contextmenu', (e) => {
        e.preventDefault();
      });
    });
  }

  setupSettingsListeners() {
    // Animation toggle
    const animationToggle = DK.$('#animation-toggle');
    if (animationToggle) {
      const savedAnimationPref = DK.getFromStorage('animations-enabled', true);
      animationToggle.checked = savedAnimationPref;
      
      DK.addEvent(animationToggle, 'change', (e) => {
        const enabled = e.target.checked;
        DK.setToStorage('animations-enabled', enabled);
        this.toggleAnimations(enabled);
      });
    }

    // Clear data button
    const clearDataBtn = DK.$('#clear-data');
    if (clearDataBtn) {
      DK.addEvent(clearDataBtn, 'click', () => {
        this.clearAllData();
      });
    }
  }

  initializeApp() {
    // Set initial interaction count
    const interactionEl = DK.$('#interactions');
    if (interactionEl) {
      interactionEl.textContent = this.interactions.toLocaleString();
    }

    // Initialize animations based on stored preference
    const animationsEnabled = DK.getFromStorage('animations-enabled', true);
    this.toggleAnimations(animationsEnabled);

    // Set initial section
    this.navigateToSection('dashboard');

    console.log('⚙️ Da-Kraken Systems Online!');
    console.log('Modules: Notes, Color Palette, Pomodoro Timer, Theme Management');
    console.log('No external dependencies • Fully offline • Privacy-focused');
  }

  hideLoadingScreen() {
    const loadingScreen = DK.$('#loading-screen');
    const mainApp = DK.$('#main-app');
    
    if (loadingScreen && mainApp) {
      if (!DK.prefersReducedMotion()) {
        loadingScreen.style.transition = 'opacity 0.5s ease-in-out';
        loadingScreen.style.opacity = '0';
        
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          mainApp.classList.remove('hidden');
          
          // Trigger entrance animation for main app
          mainApp.style.opacity = '0';
          mainApp.style.transform = 'translateY(20px)';
          
          requestAnimationFrame(() => {
            mainApp.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            mainApp.style.opacity = '1';
            mainApp.style.transform = 'translateY(0)';
          });
        }, 500);
      } else {
        loadingScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
      }
    }
  }

  navigateToSection(sectionName) {
    // Update navigation buttons
    const navBtns = DK.$$('.nav-btn');
    navBtns.forEach(btn => {
      if (btn.getAttribute('data-section') === sectionName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update sections
    const sections = DK.$$('.section');
    sections.forEach(section => {
      if (section.id === `${sectionName}-section`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    this.currentSection = sectionName;
    
    // Update URL hash without triggering navigation
    history.replaceState(null, null, `#${sectionName}`);

    // Announce section change for screen readers
    this.announceForScreenReader(`Navigated to ${sectionName} section`);
  }

  handleKeyboardShortcuts(e) {
    // Global shortcuts
    if (e.altKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          this.navigateToSection('dashboard');
          break;
        case '2':
          e.preventDefault();
          this.navigateToSection('tools');
          break;
        case '3':
          e.preventDefault();
          this.navigateToSection('settings');
          break;
      }
    }

    // Escape key to close modals or return to dashboard
    if (e.key === 'Escape') {
      this.navigateToSection('dashboard');
    }
  }

  startUptime() {
    const uptimeEl = DK.$('#uptime');
    if (!uptimeEl) return;

    this.uptimeInterval = setInterval(() => {
      const uptime = Date.now() - this.startTime;
      uptimeEl.textContent = DK.formatUptime(uptime);
    }, 1000);
  }

  pauseTimers() {
    // Pause pomodoro timer if running
    if (window.toolsManager && window.toolsManager.getTool('timer')) {
      const timer = window.toolsManager.getTool('timer');
      if (timer.isRunning) {
        timer.pause();
        this.timerWasPausedByVisibility = true;
      }
    }
  }

  resumeTimers() {
    // Resume pomodoro timer if it was paused by visibility change
    if (window.toolsManager && window.toolsManager.getTool('timer') && this.timerWasPausedByVisibility) {
      const timer = window.toolsManager.getTool('timer');
      timer.start();
      this.timerWasPausedByVisibility = false;
    }
  }

  incrementInteractions() {
    this.interactions++;
    DK.setToStorage('interactions', this.interactions);
    
    const interactionEl = DK.$('#interactions');
    if (interactionEl) {
      // Animate the counter
      if (!DK.prefersReducedMotion()) {
        interactionEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
          interactionEl.style.transform = 'scale(1)';
        }, 150);
      }
      
      interactionEl.textContent = this.interactions.toLocaleString();
    }
  }

  toggleAnimations(enabled) {
    const root = document.documentElement;
    
    if (enabled && !DK.prefersReducedMotion()) {
      root.style.removeProperty('--transition-fast');
      root.style.removeProperty('--transition-normal');
      root.style.removeProperty('--transition-slow');
    } else {
      root.style.setProperty('--transition-fast', '0ms');
      root.style.setProperty('--transition-normal', '0ms');
      root.style.setProperty('--transition-slow', '0ms');
    }
  }

  clearAllData() {
    const confirmed = confirm(
      'Are you sure you want to clear all data? This will remove:\n\n' +
      '• All saved notes\n' +
      '• Theme preferences\n' +
      '• Color palette history\n' +
      '• Interaction counter\n' +
      '• All other settings\n\n' +
      'This action cannot be undone.'
    );

    if (confirmed) {
      DK.clearAllStorage();
      
      // Reset application state
      this.interactions = 0;
      this.startTime = Date.now();
      
      // Reset UI elements
      const notesTextarea = DK.$('#notes');
      if (notesTextarea) {
        notesTextarea.value = '';
      }

      const interactionEl = DK.$('#interactions');
      if (interactionEl) {
        interactionEl.textContent = '0';
      }

      // Reset theme to auto
      if (window.themeManager) {
        window.themeManager.setTheme('auto');
      }

      // Reset tools
      if (window.toolsManager) {
        Object.values(window.toolsManager.tools).forEach(tool => {
          if (tool.reset) {
            tool.reset();
          }
        });
      }

      // Show confirmation
      this.showDataClearedConfirmation();
    }
  }

  showDataClearedConfirmation() {
    const clearBtn = DK.$('#clear-data');
    if (clearBtn) {
      const originalText = clearBtn.textContent;
      clearBtn.textContent = 'Data Cleared!';
      clearBtn.disabled = true;
      clearBtn.classList.add('btn-success');
      clearBtn.classList.remove('btn-danger');
      
      setTimeout(() => {
        clearBtn.textContent = originalText;
        clearBtn.disabled = false;
        clearBtn.classList.add('btn-danger');
        clearBtn.classList.remove('btn-success');
      }, 3000);
    }
  }

  handleResize() {
    // Handle responsive behavior if needed
    const isMobile = DK.isMobile();
    
    // Update mobile-specific features
    if (isMobile) {
      // Mobile-specific optimizations
      this.optimizeForMobile();
    } else {
      // Desktop-specific optimizations
      this.optimizeForDesktop();
    }
  }

  optimizeForMobile() {
    // Mobile optimizations
    const header = DK.$('.header-content');
    if (header) {
      header.classList.add('mobile-header');
    }
  }

  optimizeForDesktop() {
    // Desktop optimizations
    const header = DK.$('.header-content');
    if (header) {
      header.classList.remove('mobile-header');
    }
  }

  announceForScreenReader(message) {
    // Create a live region for screen reader announcements
    let liveRegion = DK.$('#sr-live-region');
    if (!liveRegion) {
      liveRegion = DK.createElement('div', {
        id: 'sr-live-region',
        className: 'sr-only',
        'aria-live': 'polite',
        'aria-atomic': 'true'
      });
      document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = message;
    
    // Clear the message after a short delay
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }

  // Public API methods
  getCurrentSection() {
    return this.currentSection;
  }

  getUptime() {
    return Date.now() - this.startTime;
  }

  getInteractionCount() {
    return this.interactions;
  }

  // Cleanup method for when the app needs to be destroyed
  destroy() {
    if (this.uptimeInterval) {
      clearInterval(this.uptimeInterval);
    }

    // Clean up other intervals and event listeners if needed
    console.log('⚙️ Da-Kraken Systems Shutdown Complete');
  }
}

// Progressive Web App Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // We'll create a simple service worker later
      // const registration = await navigator.serviceWorker.register('/sw.js');
      // console.log('ServiceWorker registered: ', registration);
    } catch (error) {
      console.log('ServiceWorker registration failed: ', error);
    }
  });
}

// Initialize the app
window.addEventListener('load', () => {
  window.daKrakenApp = new DaKrakenApp();
});

// Handle initial hash navigation
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1);
  const validSections = ['dashboard', 'tools', 'settings'];
  
  if (hash && validSections.includes(hash)) {
    // Wait for app to initialize, then navigate
    setTimeout(() => {
      if (window.daKrakenApp) {
        window.daKrakenApp.navigateToSection(hash);
      }
    }, 100);
  }
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DaKrakenApp;
}

// Global error handler
window.addEventListener('error', (e) => {
  console.error('⚙️ Da-Kraken System Error:', e.error);
  
  // Could implement user-friendly error reporting here
  // For now, just log it to console
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
  console.error('⚙️ Da-Kraken System Promise Rejection:', e.reason);
});