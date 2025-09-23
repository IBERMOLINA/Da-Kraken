// Tests for ToolsManager and individual tools
// These tests verify tool functionality and integration

// Create test framework instance
const toolsTestFramework = new TestFramework();

toolsTestFramework.describe('ToolsManager', () => {
  let toolsManager;
  
  toolsTestFramework.beforeEach(() => {
    DaKrakenUtils.clearAllStorage();
    
    // Set up minimal DOM for tools
    document.body.innerHTML = `
      <div id="app">
        <section id="tools-section">
          <div class="tool-card">
            <textarea id="notes-textarea" placeholder="Your notes..."></textarea>
            <button id="save-notes">Save Notes</button>
            <button id="clear-notes">Clear Notes</button>
          </div>
          <div class="tool-card">
            <div id="color-palette"></div>
            <button id="generate-palette">Generate Palette</button>
          </div>
          <div class="tool-card">
            <div id="timer-display">25:00</div>
            <button id="timer-start">Start</button>
            <button id="timer-reset">Reset</button>
          </div>
        </section>
      </div>
    `;
    
    toolsManager = new ToolsManager();
  });

  toolsTestFramework.afterEach(() => {
    DaKrakenUtils.clearAllStorage();
  });

  toolsTestFramework.it('should initialize all tools', () => {
    toolsTestFramework.expect(toolsManager.tools).toBeTruthy();
    toolsTestFramework.expect(toolsManager.tools.notes).toBeTruthy();
    toolsTestFramework.expect(toolsManager.tools.colorPalette).toBeTruthy();
    toolsTestFramework.expect(toolsManager.tools.timer).toBeTruthy();
  });

  toolsTestFramework.it('should provide access to individual tools', () => {
    const notesTool = toolsManager.getTool('notes');
    const colorTool = toolsManager.getTool('colorPalette');
    const timerTool = toolsManager.getTool('timer');
    
    toolsTestFramework.expect(notesTool).toBeTruthy();
    toolsTestFramework.expect(colorTool).toBeTruthy();
    toolsTestFramework.expect(timerTool).toBeTruthy();
    
    toolsTestFramework.expect(notesTool instanceof NotesTool).toBeTruthy();
    toolsTestFramework.expect(colorTool instanceof ColorPaletteTool).toBeTruthy();
    toolsTestFramework.expect(timerTool instanceof PomodoroTimer).toBeTruthy();
  });
});

toolsTestFramework.describe('NotesTool', () => {
  let notesTool;
  
  toolsTestFramework.beforeEach(() => {
    DaKrakenUtils.clearAllStorage();
    
    document.body.innerHTML = `
      <div id="app">
        <textarea id="notes-textarea" placeholder="Your notes..."></textarea>
        <button id="save-notes">Save Notes</button>
        <button id="clear-notes">Clear Notes</button>
      </div>
    `;
    
    notesTool = new NotesTool();
    notesTool.init();
  });

  toolsTestFramework.afterEach(() => {
    DaKrakenUtils.clearAllStorage();
  });

  toolsTestFramework.it('should initialize with empty notes by default', () => {
    const textarea = DaKrakenUtils.$('#notes-textarea');
    toolsTestFramework.expect(textarea.value).toBe('');
  });

  toolsTestFramework.it('should load saved notes from storage', () => {
    const savedNotes = 'This is a saved note';
    DaKrakenUtils.setToStorage('notes', savedNotes);
    
    // Create new instance to test loading
    const newNotesTool = new NotesTool();
    newNotesTool.init();
    
    const textarea = DaKrakenUtils.$('#notes-textarea');
    toolsTestFramework.expect(textarea.value).toBe(savedNotes);
  });

  toolsTestFramework.it('should save notes to storage', () => {
    const noteText = 'Test note content';
    const textarea = DaKrakenUtils.$('#notes-textarea');
    textarea.value = noteText;
    
    notesTool.saveNotes();
    
    const savedNotes = DaKrakenUtils.getFromStorage('notes');
    toolsTestFramework.expect(savedNotes).toBe(noteText);
  });

  toolsTestFramework.it('should clear notes', () => {
    const noteText = 'Text to be cleared';
    const textarea = DaKrakenUtils.$('#notes-textarea');
    textarea.value = noteText;
    
    notesTool.saveNotes();
    toolsTestFramework.expect(DaKrakenUtils.getFromStorage('notes')).toBe(noteText);
    
    notesTool.clearNotes();
    
    toolsTestFramework.expect(textarea.value).toBe('');
    toolsTestFramework.expect(DaKrakenUtils.getFromStorage('notes')).toBe('');
  });

  toolsTestFramework.it('should autosave after delay', async () => {
    const noteText = 'Auto-saved content';
    const textarea = DaKrakenUtils.$('#notes-textarea');
    textarea.value = noteText;
    
    notesTool.autosave(noteText);
    
    // Wait for autosave delay (should be immediate for testing)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const savedNotes = DaKrakenUtils.getFromStorage('notes');
    toolsTestFramework.expect(savedNotes).toBe(noteText);
  });
});

toolsTestFramework.describe('ColorPaletteTool', () => {
  let colorTool;
  
  toolsTestFramework.beforeEach(() => {
    DaKrakenUtils.clearAllStorage();
    
    document.body.innerHTML = `
      <div id="app">
        <div id="color-palette"></div>
        <button id="generate-palette">Generate Palette</button>
      </div>
    `;
    
    colorTool = new ColorPaletteTool();
    colorTool.init();
  });

  toolsTestFramework.afterEach(() => {
    DaKrakenUtils.clearAllStorage();
  });

  toolsTestFramework.it('should generate a color palette', () => {
    const paletteContainer = DaKrakenUtils.$('#color-palette');
    
    colorTool.generatePalette();
    
    const colorItems = paletteContainer.querySelectorAll('.color-item');
    toolsTestFramework.expect(colorItems.length).toBe(5); // Default palette size
  });

  toolsTestFramework.it('should create color items with hex values', () => {
    colorTool.generatePalette();
    
    const paletteContainer = DaKrakenUtils.$('#color-palette');
    const colorItems = paletteContainer.querySelectorAll('.color-item');
    
    colorItems.forEach(item => {
      const hexValue = item.getAttribute('data-color');
      toolsTestFramework.expect(hexValue).toContain('#');
      toolsTestFramework.expect(hexValue.length).toBe(7);
      
      // Verify it's a valid hex color
      const hexPattern = /^#[0-9A-Fa-f]{6}$/;
      toolsTestFramework.expect(hexPattern.test(hexValue)).toBeTruthy();
    });
  });

  toolsTestFramework.it('should save generated palette to storage', () => {
    colorTool.generatePalette();
    
    const savedPalette = DaKrakenUtils.getFromStorage('color-palette');
    toolsTestFramework.expect(Array.isArray(savedPalette)).toBeTruthy();
    toolsTestFramework.expect(savedPalette.length).toBe(5);
  });
});

toolsTestFramework.describe('PomodoroTimer', () => {
  let timer;
  
  toolsTestFramework.beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <div id="timer-display">25:00</div>
        <button id="timer-start">Start</button>
        <button id="timer-reset">Reset</button>
      </div>
    `;
    
    timer = new PomodoroTimer();
    timer.init();
  });

  toolsTestFramework.afterEach(() => {
    // Clean up any running intervals
    if (timer.interval) {
      clearInterval(timer.interval);
    }
  });

  toolsTestFramework.it('should initialize with default 25 minute timer', () => {
    toolsTestFramework.expect(timer.timeLeft).toBe(25 * 60); // 25 minutes in seconds
    toolsTestFramework.expect(timer.isRunning).toBeFalsy();
  });

  toolsTestFramework.it('should update display correctly', () => {
    const display = DaKrakenUtils.$('#timer-display');
    
    timer.updateDisplay();
    toolsTestFramework.expect(display.textContent).toBe('25:00');
    
    timer.timeLeft = 300; // 5 minutes
    timer.updateDisplay();
    toolsTestFramework.expect(display.textContent).toBe('05:00');
    
    timer.timeLeft = 65; // 1 minute 5 seconds
    timer.updateDisplay();
    toolsTestFramework.expect(display.textContent).toBe('01:05');
  });

  toolsTestFramework.it('should start and stop timer', () => {
    toolsTestFramework.expect(timer.isRunning).toBeFalsy();
    
    timer.start();
    toolsTestFramework.expect(timer.isRunning).toBeTruthy();
    toolsTestFramework.expect(timer.interval).toBeTruthy();
    
    timer.stop();
    toolsTestFramework.expect(timer.isRunning).toBeFalsy();
    toolsTestFramework.expect(timer.interval).toBe(null);
  });

  toolsTestFramework.it('should reset timer to default time', () => {
    timer.timeLeft = 100;
    timer.start();
    
    timer.reset();
    
    toolsTestFramework.expect(timer.timeLeft).toBe(25 * 60);
    toolsTestFramework.expect(timer.isRunning).toBeFalsy();
    toolsTestFramework.expect(timer.interval).toBe(null);
  });

  toolsTestFramework.it('should toggle between start and stop', () => {
    toolsTestFramework.expect(timer.isRunning).toBeFalsy();
    
    timer.toggle();
    toolsTestFramework.expect(timer.isRunning).toBeTruthy();
    
    timer.toggle();
    toolsTestFramework.expect(timer.isRunning).toBeFalsy();
  });

  toolsTestFramework.it('should handle timer completion', async () => {
    timer.timeLeft = 1; // 1 second
    timer.start();
    
    // Wait for timer to complete
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    toolsTestFramework.expect(timer.isRunning).toBeFalsy();
    toolsTestFramework.expect(timer.timeLeft).toBe(0);
  });
});

// Export the test framework instance for running
if (typeof window !== 'undefined') {
  window.daKrakenToolsTests = toolsTestFramework;
}