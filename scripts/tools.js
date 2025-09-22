// Tools functionality for Da-Kraken App
class ToolsManager {
  constructor() {
    this.tools = {
      notes: new NotesTool(),
      colorPalette: new ColorPaletteTool(),
      timer: new PomodoroTimer()
    };
    
    this.init();
  }

  init() {
    // Initialize all tools
    Object.values(this.tools).forEach(tool => {
      if (tool.init) {
        tool.init();
      }
    });
  }

  getTool(name) {
    return this.tools[name];
  }
}

// Notes Tool
class NotesTool {
  constructor() {
    this.notes = DK.getFromStorage('notes', '');
    this.autosaveTimer = null;
  }

  init() {
    this.setupEventListeners();
    this.loadNotes();
  }

  setupEventListeners() {
    const textarea = DK.$('#notes');
    const saveBtn = DK.$('#save-notes');
    const clearBtn = DK.$('#clear-notes');

    if (textarea) {
      // Load saved notes
      textarea.value = this.notes;

      // Autosave on input with debouncing
      DK.addEvent(textarea, 'input', DK.debounce(() => {
        this.autosave(textarea.value);
      }, 1000));

      // Handle tab key for better UX
      DK.addEvent(textarea, 'keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }
      });
    }

    if (saveBtn) {
      DK.addEvent(saveBtn, 'click', () => this.saveNotes());
    }

    if (clearBtn) {
      DK.addEvent(clearBtn, 'click', () => this.clearNotes());
    }
  }

  loadNotes() {
    const textarea = DK.$('#notes');
    if (textarea) {
      textarea.value = this.notes;
    }
  }

  saveNotes() {
    const textarea = DK.$('#notes');
    if (textarea) {
      this.notes = textarea.value;
      DK.setToStorage('notes', this.notes);
      this.showSaveConfirmation();
    }
  }

  autosave(content) {
    this.notes = content;
    DK.setToStorage('notes', this.notes);
  }

  clearNotes() {
    if (confirm('Are you sure you want to clear all notes? This action cannot be undone.')) {
      this.notes = '';
      DK.setToStorage('notes', '');
      const textarea = DK.$('#notes');
      if (textarea) {
        textarea.value = '';
        textarea.focus();
      }
      this.showClearConfirmation();
    }
  }

  showSaveConfirmation() {
    const saveBtn = DK.$('#save-notes');
    if (saveBtn) {
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saved!';
      saveBtn.disabled = true;
      
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }, 2000);
    }
  }

  showClearConfirmation() {
    const clearBtn = DK.$('#clear-notes');
    if (clearBtn) {
      const originalText = clearBtn.textContent;
      clearBtn.textContent = 'Cleared!';
      clearBtn.disabled = true;
      
      setTimeout(() => {
        clearBtn.textContent = originalText;
        clearBtn.disabled = false;
      }, 2000);
    }
  }
}

// Color Palette Tool
class ColorPaletteTool {
  constructor() {
    this.currentPalette = DK.getFromStorage('colorPalette', this.generatePalette());
  }

  init() {
    this.setupEventListeners();
    this.renderPalette();
  }

  setupEventListeners() {
    const generateBtn = DK.$('#generate-colors');
    if (generateBtn) {
      DK.addEvent(generateBtn, 'click', () => this.generateNewPalette());
    }
  }

  generatePalette() {
    return DK.generateColorPalette(5);
  }

  generateNewPalette() {
    this.currentPalette = this.generatePalette();
    DK.setToStorage('colorPalette', this.currentPalette);
    this.renderPalette();
    this.animateGeneration();
  }

  renderPalette() {
    const container = DK.$('#color-palette');
    if (!container) return;

    container.innerHTML = '';
    
    this.currentPalette.forEach((color, index) => {
      const swatch = DK.createElement('div', {
        className: 'color-swatch',
        'data-color': DK.hslToHex(color),
        style: `background-color: ${color}`,
        title: `Click to copy ${DK.hslToHex(color)}`
      });

      DK.addEvent(swatch, 'click', () => this.copyColor(color, swatch));
      
      container.appendChild(swatch);
    });
  }

  async copyColor(color, element) {
    const hexColor = DK.hslToHex(color);

    try {
      // Check if clipboard API is available and context is secure
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }

      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext && !window.location.hostname.includes('localhost')) {
        throw new Error('Secure context required for clipboard access');
      }

      await navigator.clipboard.writeText(hexColor);
      this.showCopyFeedback(element, 'Copied!');
    } catch (error) {
      console.warn('Clipboard API failed:', error.message);
      // Enhanced fallback for browsers that don't support clipboard API
      this.fallbackCopyColor(hexColor, element);
      this.showCopyFeedback(element, 'Copied!');
    }
  }

  fallbackCopyColor(text, element) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('aria-hidden', 'true');

    document.body.appendChild(textarea);

    try {
      textarea.select();
      textarea.setSelectionRange(0, text.length); // For mobile devices

      const successful = document.execCommand('copy');
      if (!successful) {
        throw new Error('Copy command failed');
      }

      console.log('Color copied using fallback method:', text);
    } catch (error) {
      console.error('Fallback copy method failed:', error);
      // Show a more detailed feedback if both methods fail
      this.showCopyFeedback(element, 'Copy failed - try again');
    } finally {
      document.body.removeChild(textarea);
    }
  }

  showCopyFeedback(element, message) {
    const originalTransform = element.style.transform;
    element.style.transform = 'scale(0.9)';
    
    // Create temporary feedback element
    const feedback = DK.createElement('div', {
      className: 'copy-feedback',
      style: `
        position: absolute;
        background: var(--color-text-primary);
        color: var(--color-bg-primary);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        pointer-events: none;
        z-index: 1000;
        transform: translateX(-50%);
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
      `
    }, message);

    const rect = element.getBoundingClientRect();
    feedback.style.left = rect.left + rect.width / 2 + 'px';
    feedback.style.top = rect.top - 30 + 'px';
    
    document.body.appendChild(feedback);
    
    requestAnimationFrame(() => {
      feedback.style.opacity = '1';
    });

    setTimeout(() => {
      element.style.transform = originalTransform;
      feedback.style.opacity = '0';
      setTimeout(() => {
        if (feedback.parentNode) {
          document.body.removeChild(feedback);
        }
      }, 200);
    }, 1500);
  }

  animateGeneration() {
    const generateBtn = DK.$('#generate-colors');
    if (generateBtn && !DK.prefersReducedMotion()) {
      generateBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        generateBtn.style.transform = 'scale(1)';
      }, 150);
    }

    // Animate color swatches
    const swatches = DK.$$('.color-swatch');
    swatches.forEach((swatch, index) => {
      if (!DK.prefersReducedMotion()) {
        swatch.style.opacity = '0';
        swatch.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
          swatch.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
          swatch.style.opacity = '1';
          swatch.style.transform = 'scale(1)';
        }, index * 100);
      }
    });
  }
}

// Pomodoro Timer Tool
class PomodoroTimer {
  constructor() {
    this.timeLeft = 25 * 60; // 25 minutes in seconds
    this.isRunning = false;
    this.interval = null;
    this.defaultTime = 25 * 60;
  }

  init() {
    this.setupEventListeners();
    this.updateDisplay();
  }

  setupEventListeners() {
    const startBtn = DK.$('#start-timer');
    const pauseBtn = DK.$('#pause-timer');
    const resetBtn = DK.$('#reset-timer');

    if (startBtn) {
      DK.addEvent(startBtn, 'click', () => this.start());
    }

    if (pauseBtn) {
      DK.addEvent(pauseBtn, 'click', () => this.pause());
    }

    if (resetBtn) {
      DK.addEvent(resetBtn, 'click', () => this.reset());
    }

    // Keyboard shortcuts
    DK.addEvent(document, 'keydown', (e) => {
      // Only respond to shortcuts when timer section is active
      const timerSection = DK.$('#tools-section');
      if (!timerSection || !timerSection.classList.contains('active')) return;

      if (e.key === ' ' && (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT')) {
        e.preventDefault();
        this.isRunning ? this.pause() : this.start();
      } else if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        this.reset();
      }
    });
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.interval = setInterval(() => {
        this.tick();
      }, 1000);
      this.updateButtons();
    }
  }

  pause() {
    if (this.isRunning) {
      this.isRunning = false;
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      this.updateButtons();
    }
  }

  reset() {
    this.pause();
    this.timeLeft = this.defaultTime;
    this.updateDisplay();
    this.updateButtons();
  }

  tick() {
    if (this.timeLeft > 0) {
      this.timeLeft--;
      this.updateDisplay();
    } else {
      this.complete();
    }
  }

  complete() {
    this.pause();
    this.showCompletion();
    
    // Show notification if supported
    DK.showNotification('Pomodoro Complete!', {
      body: 'Time for a break! 🍅',
      tag: 'pomodoro-complete'
    });

    // Reset for next session
    this.timeLeft = this.defaultTime;
    this.updateDisplay();
  }

  updateDisplay() {
    const display = DK.$('#timer-display');
    if (display) {
      display.textContent = DK.formatTime(this.timeLeft);
      
      // Update document title when timer is running
      if (this.isRunning) {
        document.title = `${DK.formatTime(this.timeLeft)} - Da-Kraken`;
      } else {
        document.title = 'Da-Kraken - Local App';
      }
      
      // Add visual indicator for low time
      if (this.timeLeft <= 60 && this.isRunning) {
        display.style.color = 'var(--color-error)';
        if (!DK.prefersReducedMotion()) {
          display.style.animation = 'pulse 1s ease-in-out infinite';
        }
      } else {
        display.style.color = 'var(--color-primary)';
        display.style.animation = '';
      }
    }
  }

  updateButtons() {
    const startBtn = DK.$('#start-timer');
    const pauseBtn = DK.$('#pause-timer');

    if (startBtn && pauseBtn) {
      if (this.isRunning) {
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-flex';
      } else {
        startBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
      }
    }
  }

  showCompletion() {
    const display = DK.$('#timer-display');
    if (display && !DK.prefersReducedMotion()) {
      // Flash effect
      display.style.background = 'var(--color-success)';
      display.style.color = 'white';
      display.style.transform = 'scale(1.1)';
      display.style.transition = 'all 0.3s ease-out';
      
      setTimeout(() => {
        display.style.background = '';
        display.style.color = 'var(--color-primary)';
        display.style.transform = '';
      }, 1000);
    }
  }
}

// Initialize tools when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.toolsManager = new ToolsManager();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ToolsManager, NotesTool, ColorPaletteTool, PomodoroTimer };
}