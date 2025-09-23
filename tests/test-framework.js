// Simple test framework for Da-Kraken App
// Designed to work in browser without external dependencies
class TestFramework {
  constructor() {
    this.tests = [];
    this.suites = new Map();
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  // Create a test suite
  describe(name, callback) {
    const suite = {
      name,
      tests: [],
      beforeEach: null,
      afterEach: null
    };
    
    this.suites.set(name, suite);
    
    // Temporarily set current suite context
    const currentSuite = this.currentSuite;
    this.currentSuite = suite;
    
    callback();
    
    // Restore previous suite context
    this.currentSuite = currentSuite;
    
    return suite;
  }

  // Add a test case
  it(description, testFn) {
    const test = {
      description,
      testFn,
      suite: this.currentSuite ? this.currentSuite.name : 'Default'
    };
    
    if (this.currentSuite) {
      this.currentSuite.tests.push(test);
    } else {
      this.tests.push(test);
    }
    
    return test;
  }

  // Setup function to run before each test in a suite
  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEach = fn;
    }
  }

  // Cleanup function to run after each test in a suite
  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEach = fn;
    }
  }

  // Assertion methods
  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }
        return true;
      },
      
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }
        return true;
      },
      
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected truthy value, but got ${JSON.stringify(actual)}`);
        }
        return true;
      },
      
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected falsy value, but got ${JSON.stringify(actual)}`);
        }
        return true;
      },
      
      toContain: (expected) => {
        if (typeof actual === 'string' && actual.indexOf(expected) === -1) {
          throw new Error(`Expected "${actual}" to contain "${expected}"`);
        }
        if (Array.isArray(actual) && actual.indexOf(expected) === -1) {
          throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
        }
        return true;
      },
      
      toHaveLength: (expected) => {
        if (actual.length !== expected) {
          throw new Error(`Expected length ${expected}, but got ${actual.length}`);
        }
        return true;
      },
      
      toThrow: () => {
        if (typeof actual !== 'function') {
          throw new Error('Expected a function to test for throwing');
        }
        
        try {
          actual();
          throw new Error('Expected function to throw, but it did not');
        } catch (error) {
          // Function threw as expected
          return true;
        }
      }
    };
  }

  // Run all tests
  async runTests() {
    console.log('🐙 Starting Da-Kraken Tests...\n');
    
    // Run standalone tests
    for (const test of this.tests) {
      await this.runSingleTest(test);
    }
    
    // Run suite tests
    for (const [suiteName, suite] of this.suites) {
      console.log(`\n📦 Suite: ${suiteName}`);
      
      for (const test of suite.tests) {
        // Run beforeEach if defined
        if (suite.beforeEach) {
          try {
            await suite.beforeEach();
          } catch (error) {
            console.error(`❌ BeforeEach failed for ${test.description}: ${error.message}`);
            continue;
          }
        }
        
        await this.runSingleTest(test, '  ');
        
        // Run afterEach if defined
        if (suite.afterEach) {
          try {
            await suite.afterEach();
          } catch (error) {
            console.warn(`⚠️  AfterEach failed for ${test.description}: ${error.message}`);
          }
        }
      }
    }
    
    this.printSummary();
    return this.results;
  }

  // Run a single test
  async runSingleTest(test, indent = '') {
    this.results.total++;
    
    try {
      await test.testFn();
      console.log(`${indent}✅ ${test.description}`);
      this.results.passed++;
    } catch (error) {
      console.error(`${indent}❌ ${test.description}`);
      console.error(`${indent}   ${error.message}`);
      this.results.failed++;
    }
  }

  // Print test summary
  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('🐙 Da-Kraken Test Results');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed} ✅`);
    console.log(`Failed: ${this.results.failed} ❌`);
    
    const percentage = this.results.total > 0 
      ? Math.round((this.results.passed / this.results.total) * 100) 
      : 0;
    console.log(`Success Rate: ${percentage}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log(`\n⚠️  ${this.results.failed} test(s) failed`);
    }
  }

  // Reset all test data
  reset() {
    this.tests = [];
    this.suites.clear();
    this.results = { passed: 0, failed: 0, total: 0 };
  }
}

// Export for use in tests
if (typeof window !== 'undefined') {
  window.TestFramework = TestFramework;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestFramework;
}