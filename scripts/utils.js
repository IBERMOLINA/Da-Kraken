// Utility functions for Da-Kraken App
class DaKrakenUtils {
  // Local Storage utilities
  static getFromStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`da-kraken-${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading from localStorage: ${error.message}`);
      return defaultValue;
    }
  }

  static setToStorage(key, value) {
    try {
      localStorage.setItem(`da-kraken-${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error writing to localStorage: ${error.message}`);
      return false;
    }
  }

  static removeFromStorage(key) {
    try {
      localStorage.removeItem(`da-kraken-${key}`);
      return true;
    } catch (error) {
      console.warn(`Error removing from localStorage: ${error.message}`);
      return false;
    }
  }

  static clearAllStorage() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('da-kraken-'));
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn(`Error clearing localStorage: ${error.message}`);
      return false;
    }
  }

  // DOM utilities
  static $(selector, context = document) {
    return context.querySelector(selector);
  }

  static $$(selector, context = document) {
    return context.querySelectorAll(selector);
  }

  static createElement(tag, attributes = {}, text = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (text) {
      element.textContent = text;
    }
    
    return element;
  }

  // Event utilities
  static addEvent(element, event, handler) {
    if (element && typeof handler === 'function') {
      element.addEventListener(event, handler);
    }
  }

  static removeEvent(element, event, handler) {
    if (element && typeof handler === 'function') {
      element.removeEventListener(event, handler);
    }
  }

  // Animation utilities
  static animateValue(start, end, duration, callback) {
    const startTime = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOutCubic;
      
      callback(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  }

  // Color utilities
  static generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
    const lightness = Math.floor(Math.random() * 30) + 40;  // 40-70%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  static generateColorPalette(count = 5) {
    const colors = [];
    const baseHue = Math.floor(Math.random() * 360);
    
    for (let i = 0; i < count; i++) {
      const hue = (baseHue + (i * 360 / count)) % 360;
      const saturation = Math.floor(Math.random() * 20) + 70; // 70-90%
      const lightness = Math.floor(Math.random() * 20) + 50;  // 50-70%
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return colors;
  }

  static hslToHex(hsl) {
    const hslMatch = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!hslMatch) return hsl;
    
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);
    
    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Time utilities
  static formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  static formatUptime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Device detection
  static isMobile() {
    return window.innerWidth <= 768;
  }

  static isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  static prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Notification utilities (using native browser APIs)
  static showNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: 'assets/favicon.svg',
        badge: 'assets/favicon.svg',
        ...options
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            icon: 'assets/favicon.svg',
            badge: 'assets/favicon.svg',
            ...options
          });
        }
      });
    }
  }

  // Clipboard utilities
  static async copyTextToClipboard(text) {
    try {
      if (window.isSecureContext && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          if (navigator.permissions && navigator.permissions.query) {
            try {
              // Best-effort permission query; continue regardless of state
              await navigator.permissions.query({ name: 'clipboard-write' });
            } catch (ignored) {}
          }
          await navigator.clipboard.writeText(text);
          return true;
        } catch (secureCopyError) {
          // Fall through to legacy approach
        }
      }
    } catch (ignoredOuter) {}

    // Legacy/insecure-context fallback using a hidden textarea
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return !!successful;
    } catch (legacyError) {
      return false;
    }
  }

  // Performance utilities
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Validation utilities
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  // Math utilities
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  static lerp(start, end, t) {
    return start + (end - start) * t;
  }

  static randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }
}

// Global utilities shorthand
window.DK = DaKrakenUtils;