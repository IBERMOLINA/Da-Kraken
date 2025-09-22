// Unit tests for DaKrakenUtils class
// These tests can be run in the browser environment

// Create test framework instance
const testFramework = new TestFramework();

testFramework.describe('DaKrakenUtils Storage Methods', () => {
  
  testFramework.beforeEach(() => {
    // Clear any existing test data before each test
    DaKrakenUtils.clearAllStorage();
  });

  testFramework.afterEach(() => {
    // Clean up after each test
    DaKrakenUtils.clearAllStorage();
  });

  testFramework.it('should store and retrieve string values', () => {
    const key = 'test-string';
    const value = 'hello world';
    
    const setResult = DaKrakenUtils.setToStorage(key, value);
    testFramework.expect(setResult).toBe(true);
    
    const retrieved = DaKrakenUtils.getFromStorage(key);
    testFramework.expect(retrieved).toBe(value);
  });

  testFramework.it('should store and retrieve object values', () => {
    const key = 'test-object';
    const value = { name: 'Da-Kraken', version: '1.0.0' };
    
    DaKrakenUtils.setToStorage(key, value);
    const retrieved = DaKrakenUtils.getFromStorage(key);
    
    testFramework.expect(retrieved).toEqual(value);
  });

  testFramework.it('should store and retrieve array values', () => {
    const key = 'test-array';
    const value = ['red', 'green', 'blue'];
    
    DaKrakenUtils.setToStorage(key, value);
    const retrieved = DaKrakenUtils.getFromStorage(key);
    
    testFramework.expect(retrieved).toEqual(value);
  });

  testFramework.it('should return default value when key does not exist', () => {
    const key = 'non-existent';
    const defaultValue = 'default';
    
    const retrieved = DaKrakenUtils.getFromStorage(key, defaultValue);
    testFramework.expect(retrieved).toBe(defaultValue);
  });

  testFramework.it('should return null when key does not exist and no default provided', () => {
    const key = 'non-existent';
    
    const retrieved = DaKrakenUtils.getFromStorage(key);
    testFramework.expect(retrieved).toBe(null);
  });

  testFramework.it('should remove stored values', () => {
    const key = 'test-remove';
    const value = 'to be removed';
    
    DaKrakenUtils.setToStorage(key, value);
    testFramework.expect(DaKrakenUtils.getFromStorage(key)).toBe(value);
    
    const removeResult = DaKrakenUtils.removeFromStorage(key);
    testFramework.expect(removeResult).toBe(true);
    
    testFramework.expect(DaKrakenUtils.getFromStorage(key)).toBe(null);
  });

  testFramework.it('should clear all Da-Kraken storage', () => {
    // Set multiple values
    DaKrakenUtils.setToStorage('key1', 'value1');
    DaKrakenUtils.setToStorage('key2', 'value2');
    DaKrakenUtils.setToStorage('key3', 'value3');
    
    // Verify they exist
    testFramework.expect(DaKrakenUtils.getFromStorage('key1')).toBe('value1');
    testFramework.expect(DaKrakenUtils.getFromStorage('key2')).toBe('value2');
    testFramework.expect(DaKrakenUtils.getFromStorage('key3')).toBe('value3');
    
    // Clear all
    const clearResult = DaKrakenUtils.clearAllStorage();
    testFramework.expect(clearResult).toBe(true);
    
    // Verify they're gone
    testFramework.expect(DaKrakenUtils.getFromStorage('key1')).toBe(null);
    testFramework.expect(DaKrakenUtils.getFromStorage('key2')).toBe(null);
    testFramework.expect(DaKrakenUtils.getFromStorage('key3')).toBe(null);
  });
});

testFramework.describe('DaKrakenUtils DOM Methods', () => {
  
  testFramework.beforeEach(() => {
    // Create test DOM elements
    document.body.innerHTML = `
      <div id="test-container">
        <div class="test-class" data-test="first">First</div>
        <div class="test-class" data-test="second">Second</div>
        <input id="test-input" type="text" value="test">
        <button id="test-button">Click me</button>
      </div>
    `;
  });

  testFramework.afterEach(() => {
    // Clean up test DOM
    const container = document.getElementById('test-container');
    if (container) {
      container.remove();
    }
  });

  testFramework.it('should find single element with $ method', () => {
    const element = DaKrakenUtils.$('#test-input');
    testFramework.expect(element).toBeTruthy();
    testFramework.expect(element.tagName.toLowerCase()).toBe('input');
    testFramework.expect(element.value).toBe('test');
  });

  testFramework.it('should find multiple elements with $$ method', () => {
    const elements = DaKrakenUtils.$$('.test-class');
    testFramework.expect(elements.length).toBe(2);
    testFramework.expect(elements[0].getAttribute('data-test')).toBe('first');
    testFramework.expect(elements[1].getAttribute('data-test')).toBe('second');
  });

  testFramework.it('should create element with attributes and text', () => {
    const element = DaKrakenUtils.createElement('div', {
      class: 'created-element',
      id: 'created-id',
      'data-test': 'created'
    }, 'Hello World');
    
    testFramework.expect(element.tagName.toLowerCase()).toBe('div');
    testFramework.expect(element.className).toBe('created-element');
    testFramework.expect(element.id).toBe('created-id');
    testFramework.expect(element.getAttribute('data-test')).toBe('created');
    testFramework.expect(element.textContent).toBe('Hello World');
  });

  testFramework.it('should create element without attributes or text', () => {
    const element = DaKrakenUtils.createElement('span');
    
    testFramework.expect(element.tagName.toLowerCase()).toBe('span');
    testFramework.expect(element.textContent).toBe('');
  });
});

testFramework.describe('DaKrakenUtils Math Methods', () => {
  
  testFramework.it('should clamp values within range', () => {
    testFramework.expect(DaKrakenUtils.clamp(5, 0, 10)).toBe(5);
    testFramework.expect(DaKrakenUtils.clamp(-5, 0, 10)).toBe(0);
    testFramework.expect(DaKrakenUtils.clamp(15, 0, 10)).toBe(10);
    testFramework.expect(DaKrakenUtils.clamp(0, 0, 10)).toBe(0);
    testFramework.expect(DaKrakenUtils.clamp(10, 0, 10)).toBe(10);
  });

  testFramework.it('should interpolate values with lerp', () => {
    testFramework.expect(DaKrakenUtils.lerp(0, 10, 0.5)).toBe(5);
    testFramework.expect(DaKrakenUtils.lerp(0, 10, 0)).toBe(0);
    testFramework.expect(DaKrakenUtils.lerp(0, 10, 1)).toBe(10);
    testFramework.expect(DaKrakenUtils.lerp(10, 20, 0.3)).toBe(13);
  });

  testFramework.it('should generate random numbers between min and max', () => {
    for (let i = 0; i < 10; i++) {
      const random = DaKrakenUtils.randomBetween(1, 10);
      testFramework.expect(random >= 1).toBeTruthy();
      testFramework.expect(random <= 10).toBeTruthy();
    }
  });
});

testFramework.describe('DaKrakenUtils Color Methods', () => {
  
  testFramework.it('should generate random hex colors', () => {
    const color = DaKrakenUtils.generateRandomColor();
    testFramework.expect(color).toContain('#');
    testFramework.expect(color.length).toBe(7);
    
    // Verify it's a valid hex color
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    testFramework.expect(hexPattern.test(color)).toBeTruthy();
  });

  testFramework.it('should generate color palettes', () => {
    const palette = DaKrakenUtils.generateColorPalette(3);
    testFramework.expect(palette.length).toBe(3);
    
    palette.forEach(color => {
      testFramework.expect(color).toContain('#');
      testFramework.expect(color.length).toBe(7);
      
      const hexPattern = /^#[0-9A-Fa-f]{6}$/;
      testFramework.expect(hexPattern.test(color)).toBeTruthy();
    });
  });

  testFramework.it('should generate default 5 color palette', () => {
    const palette = DaKrakenUtils.generateColorPalette();
    testFramework.expect(palette.length).toBe(5);
  });
});

testFramework.describe('DaKrakenUtils Validation Methods', () => {
  
  testFramework.it('should validate email addresses', () => {
    testFramework.expect(DaKrakenUtils.validateEmail('test@example.com')).toBeTruthy();
    testFramework.expect(DaKrakenUtils.validateEmail('user.name@domain.org')).toBeTruthy();
    testFramework.expect(DaKrakenUtils.validateEmail('invalid-email')).toBeFalsy();
    testFramework.expect(DaKrakenUtils.validateEmail('test@')).toBeFalsy();
    testFramework.expect(DaKrakenUtils.validateEmail('@example.com')).toBeFalsy();
  });

  testFramework.it('should sanitize HTML strings', () => {
    const dangerous = '<script>alert("xss")</script><b>Bold</b>';
    const safe = DaKrakenUtils.sanitizeHTML(dangerous);
    
    testFramework.expect(safe).not.toContain('<script>');
    testFramework.expect(safe).toContain('&lt;script&gt;');
  });
});

testFramework.describe('DaKrakenUtils Time Methods', () => {
  
  testFramework.it('should format seconds as MM:SS', () => {
    testFramework.expect(DaKrakenUtils.formatTime(0)).toBe('00:00');
    testFramework.expect(DaKrakenUtils.formatTime(30)).toBe('00:30');
    testFramework.expect(DaKrakenUtils.formatTime(60)).toBe('01:00');
    testFramework.expect(DaKrakenUtils.formatTime(125)).toBe('02:05');
    testFramework.expect(DaKrakenUtils.formatTime(3600)).toBe('60:00'); // 1 hour
  });

  testFramework.it('should format uptime from milliseconds', () => {
    testFramework.expect(DaKrakenUtils.formatUptime(0)).toBe('00:00:00');
    testFramework.expect(DaKrakenUtils.formatUptime(1000)).toBe('00:00:01');
    testFramework.expect(DaKrakenUtils.formatUptime(60000)).toBe('00:01:00');
    testFramework.expect(DaKrakenUtils.formatUptime(3600000)).toBe('01:00:00');
    testFramework.expect(DaKrakenUtils.formatUptime(3661000)).toBe('01:01:01');
  });
});

// Export the test framework instance for running
if (typeof window !== 'undefined') {
  window.daKrakenUtilsTests = testFramework;
}