/**
 * Simple Testing Framework for Google Apps Script
 * No external dependencies required - built-in solution
 */

/**
 * Simple Test Runner Class
 */
class SimpleTestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  /**
   * Add a test case
   * @param {string} description - Test description
   * @param {function} testFunction - Test function that returns true/false or throws
   */
  test(description, testFunction) {
    this.tests.push({ description, testFunction });
  }

  /**
   * Assert that a condition is true
   * @param {boolean} condition - Condition to test
   * @param {string} message - Error message if assertion fails
   */
  assert(condition, message = 'Assertion failed') {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * Assert that two values are equal
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Error message if assertion fails
   */
  assertEqual(actual, expected, message) {
    const msg = message || `Expected ${expected}, but got ${actual}`;
    this.assert(actual === expected, msg);
  }

  /**
   * Assert that a value is truthy
   * @param {*} value - Value to test
   * @param {string} message - Error message if assertion fails
   */
  assertTruthy(value, message) {
    const msg = message || `Expected truthy value, but got ${value}`;
    this.assert(!!value, msg);
  }

  /**
   * Assert that a value is falsy
   * @param {*} value - Value to test
   * @param {string} message - Error message if assertion fails
   */
  assertFalsy(value, message) {
    const msg = message || `Expected falsy value, but got ${value}`;
    this.assert(!value, msg);
  }

  /**
   * Assert that a string contains a substring
   * @param {string} str - String to search in
   * @param {string} substring - Substring to find
   * @param {string} message - Error message if assertion fails
   */
  assertContains(str, substring, message) {
    const msg = message || `Expected "${str}" to contain "${substring}"`;
    this.assert(str.includes(substring), msg);
  }

  /**
   * Assert that a function throws an error
   * @param {function} func - Function that should throw
   * @param {string} message - Error message if assertion fails
   */
  assertThrows(func, message) {
    let threw = false;
    try {
      func();
    } catch (e) {
      threw = true;
    }
    const msg = message || 'Expected function to throw an error';
    this.assert(threw, msg);
  }

  /**
   * Run all tests and display results
   */
  runAll() {
    console.log('🚀 Starting test suite...\n');
    
    this.results = { passed: 0, failed: 0, total: 0 };
    
    for (const { description, testFunction } of this.tests) {
      this.results.total++;
      
      try {
        testFunction.call(this);
        this.results.passed++;
        console.log(`✅ ${description}`);
      } catch (error) {
        this.results.failed++;
        console.log(`❌ ${description}`);
        console.log(`   Error: ${error.message}`);
      }
    }
    
    this.displaySummary();
  }

  /**
   * Display test results summary
   */
  displaySummary() {
    console.log('\n' + '='.repeat(50));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Check the output above for details.');
    }
    console.log('='.repeat(50));
  }
}

/**
 * Test utilities for mocking and data generation
 */
class TestUtils {
  /**
   * Mock MailApp for testing
   */
  static mockMailApp() {
    const emailsSent = [];
    const originalMailApp = globalThis.MailApp;
    
    globalThis.MailApp = {
      sendEmail: function(options) {
        emailsSent.push({
          to: options.to,
          subject: options.subject,
          body: options.body,
          timestamp: new Date()
        });
      }
    };
    
    return {
      emailsSent,
      restore: () => {
        globalThis.MailApp = originalMailApp;
      }
    };
  }

  /**
   * Mock Logger for testing
   */
  static mockLogger() {
    const logs = [];
    const originalLogger = globalThis.Logger;
    
    globalThis.Logger = {
      log: function(...args) {
        logs.push({
          args: args,
          timestamp: new Date()
        });
      }
    };
    
    return {
      logs,
      restore: () => {
        globalThis.Logger = originalLogger;
      }
    };
  }

  /**
   * Generate random test data
   */
  static generateRandomData() {
    const random = Math.random().toString(36).substr(2, 9);
    return {
      studentEmail: `student${random}@test.com`,
      studentId: `ID${random}`,
      firstName: `First${random}`,
      lastName: `Last${random}`,
      description: `Description ${random}`
    };
  }
}

/**
 * Test data factory
 */
class TestDataFactory {
  /**
   * Creates a valid form submission event
   */
  static createValidFormEvent(overrides = {}) {
    const defaultData = [
      '2025-01-15 10:30:00',         // timestamp
      'student@test.com',            // STUDENT_EMAIL
      'Gomez (Cas-Fl)',              // COUNSELOR_NAME
      '12345',                       // STUDENT_ID
      'Doe',                         // LAST_NAME
      'John',                        // FIRST_NAME
      'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)', // REASON
      'Green (I can wait a few days, not urgent.)', // URGENCY
      'Parent - Jane Doe',           // PERSON_COMPLETING
      'Additional information'        // DESCRIPTION
    ];
    
    // Apply overrides
    const data = [...defaultData];
    Object.keys(overrides).forEach(key => {
      const index = CONFIG.FORM_COLUMNS[key];
      if (index !== undefined) {
        data[index] = overrides[key];
      }
    });
    
    return { values: data };
  }

  /**
   * Creates an emergency form submission
   */
  static createEmergencyFormEvent() {
    return this.createValidFormEvent({
      REASON: 'Personal Issues',
      URGENCY: 'Red (It is an emergency, I need you as soon as possible, safety concern.)'
    });
  }

  /**
   * Creates form submission with missing required fields
   */
  static createInvalidFormEvent() {
    return this.createValidFormEvent({
      FIRST_NAME: '',
      LAST_NAME: '',
      COUNSELOR_NAME: ''
    });
  }
}
