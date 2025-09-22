// Autocommit System for Da-Kraken App
class AutoCommitManager {
  constructor() {
    this.pendingChanges = [];
    this.commitInterval = null;
    this.commitDelay = 5000; // 5 seconds delay for batching changes
    this.enabled = true;
    this.init();
  }

  init() {
    // Listen for autocommit events from various sources
    window.addEventListener('autocommit', (e) => {
      if (this.enabled) {
        this.queueChange(e.detail);
      }
    });

    // Listen for storage changes
    window.addEventListener('storage', (e) => {
      if (this.enabled && e.key && e.key.startsWith('da-kraken-')) {
        this.queueChange({
          type: 'storage',
          key: e.key,
          oldValue: e.oldValue,
          newValue: e.newValue,
          timestamp: Date.now()
        });
      }
    });

    // Listen for any form changes
    document.addEventListener('change', (e) => {
      if (this.enabled && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
        this.queueChange({
          type: 'form',
          element: e.target.id || e.target.name,
          value: e.target.value,
          timestamp: Date.now()
        });
      }
    });

    // Load saved autocommit state
    this.enabled = DK.getFromStorage('autocommit-enabled', true);
  }

  queueChange(change) {
    this.pendingChanges.push(change);
    
    // Clear existing interval
    if (this.commitInterval) {
      clearTimeout(this.commitInterval);
    }

    // Set new interval for batch commit
    this.commitInterval = setTimeout(() => {
      this.commit();
    }, this.commitDelay);
  }

  commit() {
    if (this.pendingChanges.length === 0) return;

    const commitData = {
      timestamp: Date.now(),
      changes: [...this.pendingChanges],
      sessionId: this.getSessionId()
    };

    // Store commit history
    const history = DK.getFromStorage('commit-history', []);
    history.push(commitData);
    
    // Keep only last 100 commits
    if (history.length > 100) {
      history.shift();
    }
    
    DK.setToStorage('commit-history', history);

    // Dispatch commit event for external integrations
    window.dispatchEvent(new CustomEvent('commit', {
      detail: commitData
    }));

    // Show visual feedback
    this.showCommitFeedback(this.pendingChanges.length);

    // Clear pending changes
    this.pendingChanges = [];
  }

  showCommitFeedback(changeCount) {
    // Create temporary commit notification
    const notification = DK.createElement('div', {
      className: 'autocommit-notification',
      style: `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
        color: #74b9ff;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 0.875rem;
        z-index: 10000;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease-out;
        border: 1px solid #74b9ff;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      `
    }, `✓ Auto-saved ${changeCount} change${changeCount > 1 ? 's' : ''}`);

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    });

    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(10px)';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('da-kraken-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('da-kraken-session-id', sessionId);
    }
    return sessionId;
  }

  toggle(enabled) {
    this.enabled = enabled;
    DK.setToStorage('autocommit-enabled', enabled);
    
    if (!enabled && this.commitInterval) {
      clearTimeout(this.commitInterval);
      this.commitInterval = null;
    }
  }

  forceCommit() {
    if (this.commitInterval) {
      clearTimeout(this.commitInterval);
      this.commitInterval = null;
    }
    this.commit();
  }

  getHistory() {
    return DK.getFromStorage('commit-history', []);
  }

  clearHistory() {
    DK.setToStorage('commit-history', []);
    this.pendingChanges = [];
  }

  getPendingChanges() {
    return [...this.pendingChanges];
  }
}

// Initialize autocommit when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.autoCommitManager = new AutoCommitManager();
});

// No module exports - this is a standalone local app