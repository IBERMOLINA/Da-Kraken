// Theme management for Da-Kraken App
class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme();
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
    this.watchSystemTheme();
  }

  getStoredTheme() {
    return DK.getFromStorage('theme', 'auto');
  }

  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  getEffectiveTheme() {
    return this.currentTheme === 'auto' ? this.getSystemTheme() : this.currentTheme;
  }

  applyTheme(theme) {
    const effectiveTheme = theme === 'auto' ? this.getSystemTheme() : theme;
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    
    // Update theme toggle button
    const themeToggle = DK.$('#theme-toggle');
    const themeIcon = DK.$('.theme-icon');
    
    if (themeToggle && themeIcon) {
      themeIcon.textContent = effectiveTheme === 'dark' ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-label', 
        effectiveTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }

    // Update theme select if on settings page
    const themeSelect = DK.$('#theme-select');
    if (themeSelect) {
      themeSelect.value = theme;
    }

    // Save theme preference
    DK.setToStorage('theme', theme);
    this.currentTheme = theme;

    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: effectiveTheme, userTheme: theme }
    }));
  }

  toggleTheme() {
    const currentEffective = this.getEffectiveTheme();
    const newTheme = currentEffective === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  setupEventListeners() {
    // Theme toggle button
    const themeToggle = DK.$('#theme-toggle');
    if (themeToggle) {
      DK.addEvent(themeToggle, 'click', () => this.toggleTheme());
    }

    // Theme select dropdown
    const themeSelect = DK.$('#theme-select');
    if (themeSelect) {
      DK.addEvent(themeSelect, 'change', (e) => {
        this.applyTheme(e.target.value);
      });
    }

    // Keyboard shortcut (Ctrl/Cmd + Shift + T)
    DK.addEvent(document, 'keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (this.currentTheme === 'auto') {
        this.applyTheme('auto');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }

  // Public methods for external use
  setTheme(theme) {
    const validThemes = ['auto', 'light', 'dark'];
    if (validThemes.includes(theme)) {
      this.applyTheme(theme);
    } else {
      console.warn(`Invalid theme: ${theme}. Valid themes are: ${validThemes.join(', ')}`);
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getActiveTheme() {
    return this.getEffectiveTheme();
  }

  // Theme-aware utilities
  getThemeColors() {
    const theme = this.getEffectiveTheme();
    
    if (theme === 'dark') {
      return {
        primary: '#4338ca',
        secondary: '#06b6d4',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        border: '#334155'
      };
    } else {
      return {
        primary: '#4338ca',
        secondary: '#06b6d4',
        background: '#ffffff',
        surface: '#ffffff',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0'
      };
    }
  }

  // Animation utilities that respect user preferences
  getTransitionDuration() {
    if (DK.prefersReducedMotion()) {
      return '0ms';
    }
    return '250ms';
  }

  createThemeAwareAnimation(element, keyframes, options = {}) {
    if (DK.prefersReducedMotion()) {
      // Skip animation for users who prefer reduced motion
      return {
        finished: Promise.resolve(),
        cancel: () => {},
        play: () => {},
        pause: () => {}
      };
    }

    const defaultOptions = {
      duration: 250,
      easing: 'ease-in-out',
      fill: 'forwards'
    };

    return element.animate(keyframes, { ...defaultOptions, ...options });
  }
}

// Initialize theme manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});

// No module exports - this is a standalone local app