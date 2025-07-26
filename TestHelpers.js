/**
 * Test Configuration and Helper Functions
 * Support file for unit testing
 */

/**
 * Test data factory - creates mock form data for testing
 */
const TestDataFactory = {
  /**
   * Creates a valid form submission event
   */
  createValidFormEvent: function(overrides = {}) {
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
  },
  
  /**
   * Creates an emergency form submission
   */
  createEmergencyFormEvent: function() {
    return this.createValidFormEvent({
      REASON: 'Personal Issues',
      URGENCY: 'Red (It is an emergency, I need you as soon as possible, safety concern.)'
    });
  },
  
  /**
   * Creates form submission with missing required fields
   */
  createInvalidFormEvent: function() {
    return this.createValidFormEvent({
      FIRST_NAME: '',
      LAST_NAME: '',
      COUNSELOR_NAME: ''
    });
  }
};

/**
 * Test utilities for mocking and assertions
 */
const TestUtils = {
  /**
   * Mock MailApp for testing email functionality
   */
  mockMailApp: function() {
    const emailsSent = [];
    const originalMailApp = global.MailApp || MailApp;
    
    MailApp = {
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
      emailsSent: emailsSent,
      restore: function() {
        MailApp = originalMailApp;
      }
    };
  },
  
  /**
   * Mock Logger for testing log output
   */
  mockLogger: function() {
    const logs = [];
    const originalLogger = global.Logger || Logger;
    
    Logger = {
      log: function(...args) {
        logs.push({
          args: args,
          timestamp: new Date()
        });
      }
    };
    
    return {
      logs: logs,
      restore: function() {
        Logger = originalLogger;
      }
    };
  },
  
  /**
   * Asserts that an email was sent with specific properties
   */
  assertEmailSent: function(emailsSent, expectedProperties, test) {
    const matchingEmail = emailsSent.find(email => {
      return Object.keys(expectedProperties).every(key => {
        if (key === 'to' && Array.isArray(expectedProperties[key])) {
          // Handle multiple recipients
          return expectedProperties[key].every(recipient => 
            email.to.includes(recipient)
          );
        }
        return email[key] === expectedProperties[key] || 
               (email[key] && email[key].includes(expectedProperties[key]));
      });
    });
    
    test.ok(matchingEmail, `Expected email with properties ${JSON.stringify(expectedProperties)} was sent`);
    return matchingEmail;
  },
  
  /**
   * Generates random test data
   */
  generateRandomData: function() {
    const random = Math.random().toString(36).substr(2, 9);
    return {
      studentEmail: `student${random}@test.com`,
      studentId: `ID${random}`,
      firstName: `First${random}`,
      lastName: `Last${random}`,
      description: `Description ${random}`
    };
  }
};

/**
 * Quick test runner for individual functions
 * Useful for debugging specific functions
 */
function quickTest(functionName) {
  const test = new GasTap();
  
  switch(functionName) {
    case 'parseFormData':
      testParseFormData(test);
      break;
    case 'validateFormData':
      testValidateFormData(test);
      break;
    case 'composeEmail':
      testComposeEmail(test);
      break;
    case 'isEmergencyRequest':
      testIsEmergencyRequest(test);
      break;
    default:
      test('Unknown function', function(t) {
        t.fail(`Function ${functionName} not found in test suite`);
      });
  }
  
  test.finish();
}

/**
 * Test data validation with edge cases
 */
function testEdgeCases() {
  const test = new GasTap();
  
  // Test with extremely long strings
  test('Should handle very long student names', function(t) {
    const longName = 'A'.repeat(1000);
    const formData = {
      firstName: longName,
      lastName: longName,
      counselorName: 'Gomez (Cas-Fl)',
      reason: 'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)'
    };
    
    t.ok(validateFormData(formData), 'Should validate long names');
    
    const emailData = composeEmail(formData);
    t.ok(emailData.body.length > 0, 'Should compose email with long names');
  });
  
  // Test with special characters
  test('Should handle special characters in names', function(t) {
    const formData = {
      firstName: "José María",
      lastName: "García-López",
      counselorName: 'Gomez (Cas-Fl)',
      reason: 'Personal Issues',
      studentEmail: 'josé.garcía@test.com'
    };
    
    t.ok(validateFormData(formData), 'Should validate names with special characters');
    
    const emailData = composeEmail(formData);
    t.ok(emailData.body.includes('José María'), 'Should include special characters in email');
  });
  
  // Test with empty arrays
  test('Should handle empty form submission', function(t) {
    const result = parseFormData([]);
    t.equal(typeof result, 'object', 'Should return object for empty array');
    t.equal(result.firstName, '', 'Should have empty string for missing fields');
  });
  
  test.finish();
}

/**
 * Stress test for performance
 */
function stressTest() {
  const test = new GasTap();
  
  test('Stress test - 1000 rapid operations', function(t) {
    const startTime = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      const testData = TestUtils.generateRandomData();
      const formData = parseFormData([
        'timestamp', testData.studentEmail, 'Gomez (Cas-Fl)', 
        testData.studentId, testData.lastName, testData.firstName,
        'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)',
        'Green (I can wait a few days, not urgent.)', 
        'Parent', testData.description
      ]);
      
      validateFormData(formData);
      composeEmail(formData);
      isEmergencyRequest(formData);
    }
    
    const duration = Date.now() - startTime;
    t.ok(duration < 10000, `1000 operations should complete in under 10 seconds (took ${duration}ms)`);
  });
  
  test.finish();
}
