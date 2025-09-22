// Integration tests for DaKrakenApp class
// These tests verify the main application functionality

// Create test framework instance
const appTestFramework = new TestFramework();

appTestFramework.describe('DaKrakenApp Initialization', () => {
  let testApp;
  
  appTestFramework.beforeEach(() => {
    // Clear localStorage before each test
    DaKrakenUtils.clearAllStorage();
    
    // Set up minimal DOM for testing
    document.body.innerHTML = `
      <div id="app">
        <div id="main-app" class="hidden">
          <header class="header">
            <nav class="nav">
              <button class="nav-btn active" data-section="dashboard">Dashboard</button>
              <button class="nav-btn" data-section="tools">Tools</button>
              <button class="nav-btn" data-section="settings">Settings</button>
            </nav>
          </header>
          <main>
            <section id="dashboard-section" class="section active">
              <div class="stat-card">
                <div class="stat-value" id="uptime">00:00:00</div>
                <div class="stat-value" id="interactions">0</div>
              </div>
            </section>
            <section id="tools-section" class="section"></section>
            <section id="settings-section" class="section">
              <div class="setting-item">
                <input type="checkbox" id="animation-toggle">
              </div>
              <button id="clear-data">Clear Data</button>
            </section>
          </main>
        </div>
      </div>
    `;
  });

  appTestFramework.afterEach(() => {
    // Clean up after each test
    if (testApp) {
      testApp.destroy();
      testApp = null;
    }
    DaKrakenUtils.clearAllStorage();
  });

  appTestFramework.it('should initialize with default values', () => {
    // Mock Date.now() to have consistent test results
    const mockStartTime = 1234567890000;
    const originalDateNow = Date.now;
    Date.now = () => mockStartTime;
    
    testApp = new DaKrakenApp();
    
    appTestFramework.expect(testApp.startTime).toBe(mockStartTime);
    appTestFramework.expect(testApp.interactions).toBe(0);
    appTestFramework.expect(testApp.currentSection).toBe('dashboard');
    
    // Restore Date.now()
    Date.now = originalDateNow;
  });

  appTestFramework.it('should load saved interaction count from storage', () => {
    const savedInteractions = 42;
    DaKrakenUtils.setToStorage('interactions', savedInteractions);
    
    testApp = new DaKrakenApp();
    
    appTestFramework.expect(testApp.interactions).toBe(savedInteractions);
  });

  appTestFramework.it('should have public API methods', () => {
    testApp = new DaKrakenApp();
    
    appTestFramework.expect(typeof testApp.getCurrentSection).toBe('function');
    appTestFramework.expect(typeof testApp.getUptime).toBe('function');
    appTestFramework.expect(typeof testApp.getInteractionCount).toBe('function');
    appTestFramework.expect(typeof testApp.destroy).toBe('function');
  });
});

appTestFramework.describe('DaKrakenApp Navigation', () => {
  let testApp;
  
  appTestFramework.beforeEach(() => {
    DaKrakenUtils.clearAllStorage();
    
    document.body.innerHTML = `
      <div id="app">
        <div id="main-app">
          <header class="header">
            <nav class="nav">
              <button class="nav-btn active" data-section="dashboard">Dashboard</button>
              <button class="nav-btn" data-section="tools">Tools</button>
              <button class="nav-btn" data-section="settings">Settings</button>
            </nav>
          </header>
          <main>
            <section id="dashboard-section" class="section active">Dashboard Content</section>
            <section id="tools-section" class="section">Tools Content</section>
            <section id="settings-section" class="section">Settings Content</section>
          </main>
        </div>
      </div>
    `;
    
    testApp = new DaKrakenApp();
  });

  appTestFramework.afterEach(() => {
    testApp.destroy();
    DaKrakenUtils.clearAllStorage();
  });

  appTestFramework.it('should start with dashboard section active', () => {
    appTestFramework.expect(testApp.getCurrentSection()).toBe('dashboard');
  });

  appTestFramework.it('should navigate to different sections', () => {
    testApp.navigateToSection('tools');
    appTestFramework.expect(testApp.getCurrentSection()).toBe('tools');
    
    testApp.navigateToSection('settings');
    appTestFramework.expect(testApp.getCurrentSection()).toBe('settings');
    
    testApp.navigateToSection('dashboard');
    appTestFramework.expect(testApp.getCurrentSection()).toBe('dashboard');
  });

  appTestFramework.it('should update active states when navigating', () => {
    const dashboardBtn = DaKrakenUtils.$('[data-section="dashboard"]');
    const toolsBtn = DaKrakenUtils.$('[data-section="tools"]');
    const dashboardSection = DaKrakenUtils.$('#dashboard-section');
    const toolsSection = DaKrakenUtils.$('#tools-section');
    
    // Initially dashboard should be active
    appTestFramework.expect(dashboardBtn.classList.contains('active')).toBeTruthy();
    appTestFramework.expect(dashboardSection.classList.contains('active')).toBeTruthy();
    
    // Navigate to tools
    testApp.navigateToSection('tools');
    
    // Dashboard should no longer be active, tools should be active
    appTestFramework.expect(dashboardBtn.classList.contains('active')).toBeFalsy();
    appTestFramework.expect(toolsBtn.classList.contains('active')).toBeTruthy();
    appTestFramework.expect(dashboardSection.classList.contains('active')).toBeFalsy();
    appTestFramework.expect(toolsSection.classList.contains('active')).toBeTruthy();
  });
});

appTestFramework.describe('DaKrakenApp Interactions', () => {
  let testApp;
  
  appTestFramework.beforeEach(() => {
    DaKrakenUtils.clearAllStorage();
    
    document.body.innerHTML = `
      <div id="app">
        <div id="main-app">
          <div class="stat-value" id="interactions">0</div>
        </div>
      </div>
    `;
    
    testApp = new DaKrakenApp();
  });

  appTestFramework.afterEach(() => {
    testApp.destroy();
    DaKrakenUtils.clearAllStorage();
  });

  appTestFramework.it('should increment interaction count', () => {
    const initialCount = testApp.getInteractionCount();
    
    testApp.incrementInteractions();
    
    appTestFramework.expect(testApp.getInteractionCount()).toBe(initialCount + 1);
  });

  appTestFramework.it('should save interaction count to storage', () => {
    testApp.incrementInteractions();
    testApp.incrementInteractions();
    
    const storedCount = DaKrakenUtils.getFromStorage('interactions');
    appTestFramework.expect(storedCount).toBe(testApp.getInteractionCount());
  });

  appTestFramework.it('should update interaction display in DOM', () => {
    const interactionEl = DaKrakenUtils.$('#interactions');
    
    testApp.incrementInteractions();
    
    appTestFramework.expect(interactionEl.textContent).toBe('1');
    
    testApp.incrementInteractions();
    
    appTestFramework.expect(interactionEl.textContent).toBe('2');
  });
});

appTestFramework.describe('DaKrakenApp Uptime', () => {
  let testApp;
  
  appTestFramework.beforeEach(() => {
    DaKrakenUtils.clearAllStorage();
    
    document.body.innerHTML = `
      <div id="app">
        <div id="main-app">
          <div class="stat-value" id="uptime">00:00:00</div>
        </div>
      </div>
    `;
  });

  appTestFramework.afterEach(() => {
    if (testApp) {
      testApp.destroy();
    }
    DaKrakenUtils.clearAllStorage();
  });

  appTestFramework.it('should calculate uptime correctly', () => {
    const startTime = Date.now();
    const originalDateNow = Date.now;
    
    // Mock start time
    Date.now = () => startTime;
    testApp = new DaKrakenApp();
    
    // Mock current time (1 minute later)
    Date.now = () => startTime + 60000;
    
    const uptime = testApp.getUptime();
    appTestFramework.expect(uptime).toBe(60000); // 1 minute in milliseconds
    
    // Restore Date.now()
    Date.now = originalDateNow;
  });
});

appTestFramework.describe('DaKrakenApp Animation Control', () => {
  let testApp;
  
  appTestFramework.beforeEach(() => {
    DaKrakenUtils.clearAllStorage();
    
    document.body.innerHTML = `
      <div id="app">
        <div id="main-app"></div>
      </div>
    `;
    
    testApp = new DaKrakenApp();
  });

  appTestFramework.afterEach(() => {
    testApp.destroy();
    DaKrakenUtils.clearAllStorage();
  });

  appTestFramework.it('should toggle animations on and off', () => {
    const root = document.documentElement;
    
    // Enable animations
    testApp.toggleAnimations(true);
    
    // CSS variables should not be set to 0ms when animations are enabled
    appTestFramework.expect(root.style.getPropertyValue('--transition-fast')).toBe('');
    
    // Disable animations
    testApp.toggleAnimations(false);
    
    // CSS variables should be set to 0ms when animations are disabled
    appTestFramework.expect(root.style.getPropertyValue('--transition-fast')).toBe('0ms');
    appTestFramework.expect(root.style.getPropertyValue('--transition-normal')).toBe('0ms');
    appTestFramework.expect(root.style.getPropertyValue('--transition-slow')).toBe('0ms');
  });
});

appTestFramework.describe('DaKrakenApp Data Management', () => {
  let testApp;
  
  appTestFramework.beforeEach(() => {
    DaKrakenUtils.clearAllStorage();
    
    document.body.innerHTML = `
      <div id="app">
        <div id="main-app">
          <div class="stat-value" id="interactions">0</div>
          <button id="clear-data">Clear Data</button>
        </div>
      </div>
    `;
    
    testApp = new DaKrakenApp();
  });

  appTestFramework.afterEach(() => {
    testApp.destroy();
    DaKrakenUtils.clearAllStorage();
  });

  appTestFramework.it('should clear all app data', () => {
    // Set some test data
    testApp.incrementInteractions();
    testApp.incrementInteractions();
    DaKrakenUtils.setToStorage('test-key', 'test-value');
    
    // Verify data exists
    appTestFramework.expect(testApp.getInteractionCount()).toBe(2);
    appTestFramework.expect(DaKrakenUtils.getFromStorage('test-key')).toBe('test-value');
    
    // Clear all data
    testApp.clearAllData();
    
    // Verify data is cleared
    appTestFramework.expect(testApp.getInteractionCount()).toBe(0);
    appTestFramework.expect(DaKrakenUtils.getFromStorage('test-key')).toBe(null);
  });
});

// Export the test framework instance for running
if (typeof window !== 'undefined') {
  window.daKrakenAppTests = appTestFramework;
}