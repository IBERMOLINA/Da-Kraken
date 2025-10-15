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
    this.lastSaved = this.notes;
    this.saveInProgress = false;
    this.saveQueue = [];
  }

  init() {
    this.setupEventListeners();
    this.loadNotes();
    this.startPeriodicSave();
  }

  setupEventListeners() {
    const textarea = DK.$('#notes');
    const saveBtn = DK.$('#save-notes');
    const clearBtn = DK.$('#clear-notes');

    if (textarea) {
      // Load saved notes
      textarea.value = this.notes;

      // Enhanced autosave with multiple triggers
      DK.addEvent(textarea, 'input', DK.debounce(() => {
        this.queueSave(textarea.value);
      }, 500)); // Faster response

      // Save on focus loss
      DK.addEvent(textarea, 'blur', () => {
        this.queueSave(textarea.value, true); // Force immediate save
      });

      // Save on page visibility change
      DK.addEvent(document, 'visibilitychange', () => {
        if (document.hidden) {
          this.queueSave(textarea.value, true);
        }
      });

      // Handle tab key for better UX
      DK.addEvent(textarea, 'keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 1;
          // Trigger autosave after tab insertion
          this.queueSave(textarea.value);
        }
      });

      // Save on Ctrl+S
      DK.addEvent(textarea, 'keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          this.queueSave(textarea.value, true);
        }
      });
    }

    if (saveBtn) {
      DK.addEvent(saveBtn, 'click', () => this.saveNotes());
    }

    if (clearBtn) {
      DK.addEvent(clearBtn, 'click', () => this.clearNotes());
    }

    // Save before page unload
    DK.addEvent(window, 'beforeunload', () => {
      const textarea = DK.$('#notes');
      if (textarea && textarea.value !== this.lastSaved) {
        this.autosave(textarea.value);
      }
    });
  }

  startPeriodicSave() {
    // Periodic save every 30 seconds if there are changes
    setInterval(() => {
      const textarea = DK.$('#notes');
      if (textarea && textarea.value !== this.lastSaved) {
        this.queueSave(textarea.value);
      }
    }, 30000);
  }

  queueSave(content, immediate = false) {
    if (content === this.lastSaved) {
      return; // No changes to save
    }

    this.saveQueue.push({ content, timestamp: Date.now() });

    if (immediate || !this.saveInProgress) {
      this.processSaveQueue();
    }
  }

  async processSaveQueue() {
    if (this.saveInProgress || this.saveQueue.length === 0) {
      return;
    }

    this.saveInProgress = true;
    
    try {
      // Get the most recent save request
      const latestSave = this.saveQueue[this.saveQueue.length - 1];
      this.saveQueue = []; // Clear the queue

      await this.autosave(latestSave.content);
      
    } catch (error) {
      console.warn('Auto-save failed:', error);
    } finally {
      this.saveInProgress = false;
      
      // Process any new saves that came in while we were saving
      if (this.saveQueue.length > 0) {
        setTimeout(() => this.processSaveQueue(), 100);
      }
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

  async autosave(content) {
    try {
      // Validate content
      if (typeof content !== 'string') {
        throw new Error('Invalid content type for autosave');
      }

      // Only save if content has actually changed
      if (content === this.lastSaved) {
        return true;
      }

      // Attempt to save
      const saveSuccess = DK.setToStorage('notes', content);
      
      if (saveSuccess) {
        this.notes = content;
        this.lastSaved = content;
        console.log('Auto-saved notes successfully');
        
        // Update UI to show save status
        this.showAutosaveStatus('saved');
        return true;
      } else {
        throw new Error('Failed to save to localStorage');
      }
    } catch (error) {
      console.error('Autosave failed:', error);
      this.showAutosaveStatus('error');
      return false;
    }
  }

  showAutosaveStatus(status) {
    const saveBtn = DK.$('#save-notes');
    if (!saveBtn) return;

    // Remove any existing status classes
    saveBtn.classList.remove('autosave-success', 'autosave-error');
    
    if (status === 'saved') {
      saveBtn.classList.add('autosave-success');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Auto-saved';
      
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.classList.remove('autosave-success');
      }, 2000);
    } else if (status === 'error') {
      saveBtn.classList.add('autosave-error');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Save Error';
      
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.classList.remove('autosave-error');
      }, 3000);
    }
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
    let success = false;
    let method = '';
    
    try {
      // First try the modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(hexColor);
        success = true;
        method = 'modern';
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (error) {
      // Fallback for browsers that don't support clipboard API or insecure contexts
      try {
        success = this.fallbackCopyColor(hexColor);
        method = 'fallback';
      } catch (fallbackError) {
        console.warn('Clipboard copy failed:', fallbackError);
        success = false;
      }
    }
    
    if (success) {
      this.showCopyFeedback(element, 'Copied!');
      console.log(`Color ${hexColor} copied using ${method} method`);
    } else {
      this.showCopyFeedback(element, 'Copy failed - try selecting manually');
    }
  }

  fallbackCopyColor(text) {
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.setAttribute('readonly', '');
      
      document.body.appendChild(textarea);
      
      // Select the text
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices
      
      // Try to copy
      const successful = document.execCommand('copy');
      
      // Clean up
      document.body.removeChild(textarea);
      
      if (!successful) {
        throw new Error('execCommand copy failed');
      }
      
      return true;
    } catch (error) {
      console.warn('Fallback copy method failed:', error);
      return false;
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
      body: 'System recommends: Break time! ⚙️',
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