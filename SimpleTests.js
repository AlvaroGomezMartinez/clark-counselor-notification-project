/**
 * Unit Tests using Simple Test Framework
 * No external library dependencies required
 * @description Unit tests using Simple Test Framework (markdown fences removed)
 * 
 * To run tests, execute `runAllTests()` function
 */

/**
 * Main test runner - execute this function to run all tests
 */
function runAllTests() {
  const runner = new SimpleTestRunner();
  
  // Add all test cases
  addValidationTests(runner);
  addParsingTests(runner);
  addEmailTests(runner);
  addIntegrationTests(runner);
  
  // Run all tests
  runner.runAll();
}

/**
 * Test form validation functions
 */
function addValidationTests(runner) {
  runner.test('validateFormEvent should return true for valid event', function() {
    const validEvent = { values: ['test', 'data'] };
    this.assertTruthy(validateFormEvent(validEvent));
  });

  runner.test('validateFormEvent should return false for null event', function() {
    this.assertFalsy(validateFormEvent(null));
  });

  runner.test('validateFormEvent should return false for undefined event', function() {
    this.assertFalsy(validateFormEvent(undefined));
  });

  runner.test('validateFormEvent should return false for event without values', function() {
    this.assertFalsy(validateFormEvent({}));
  });

  runner.test('validateFormData should return true for valid data', function() {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      counselorName: 'Gomez (Cas-Fl)',
    };
    this.assertTruthy(validateFormData(validData));
  });

  runner.test('validateFormData should return false for missing firstName', function() {
    const invalidData = {
      firstName: '',
      lastName: 'Doe',
      counselorName: 'Gomez (Cas-Fl)',
    };
    this.assertFalsy(validateFormData(invalidData));
  });

  runner.test('validateFormData should return false for missing required fields', function() {
    const invalidData = {
      firstName: 'John',
      lastName: '',
      counselorName: '',
    };
    this.assertFalsy(validateFormData(invalidData));
  });
}

/**
 * Test data parsing functions
 */
function addParsingTests(runner) {
  runner.test('parseFormData should correctly parse form values', function() {
    const mockFormData = [
      'timestamp',
      'student@email.com',   // STUDENT_EMAIL
      'Gomez (Cas-Fl)',      // COUNSELOR_NAME
      '12345',               // STUDENT_ID
      'Doe',                 // LAST_NAME
      'John',                // FIRST_NAME
      '10'                   // GRADE_LEVEL
    ];

    const result = parseFormData(mockFormData);

  this.assertEqual(result.studentEmail, 'student@email.com');
    this.assertEqual(result.counselorName, 'Gomez (Cas-Fl)');
    this.assertEqual(result.studentId, '12345');
    this.assertEqual(result.lastName, 'Doe');
    this.assertEqual(result.firstName, 'John');
  });

  runner.test('parseFormData should handle missing values gracefully', function() {
    const result = parseFormData([]);
    
    this.assertEqual(result.studentEmail, '');
    this.assertEqual(result.counselorName, '');
    this.assertEqual(result.firstName, '');
    this.assertEqual(result.lastName, '');
  });

  runner.test('parseFormData should handle partial data', function() {
    const partialData = ['timestamp', 'student@students.nisd.net', 'Gomez (Cas-Fl)'];
    const result = parseFormData(partialData);
    
    this.assertEqual(result.studentEmail, 'student@students.nisd.net');
    this.assertEqual(result.counselorName, 'Gomez (Cas-Fl)');
    this.assertEqual(result.studentId, ''); // Should be empty for missing data
  });
}

/**
 * Test email composition functions
 */
function addEmailTests(runner) {
  runner.test('composeEmail should create properly formatted email', function() {
    const mockFormData = {
      firstName: 'John',
      lastName: 'Doe',
      studentId: '12345',
      studentEmail: 'john.doe@students.nisd.net'
    };
    
    const result = composeEmail(mockFormData);

    this.assertEqual(result.subject, CONFIG.EMAIL_SUBJECT);
    this.assertContains(result.body, 'John requested to meet with you');
    this.assertContains(result.body, 'Doe, John 12345');
    this.assertContains(result.body, 'john.doe@students.nisd.net');
  });

}

/**
 * Integration tests
 */
function addIntegrationTests(runner) {
  runner.test('Complete workflow should process regular request correctly', function() {
    // Mock form submission event
    const mockEvent = TestDataFactory.createValidFormEvent();
    
    // Test the workflow components
    const formData = parseFormData(mockEvent.values);
    const isValid = validateFormData(formData);
    const emailData = composeEmail(formData);
    
    this.assertTruthy(isValid, 'Form data should be valid');
    this.assertEqual(emailData.subject, CONFIG.EMAIL_SUBJECT, 'Subject should match config');
    this.assertContains(emailData.body, 'John requested to meet', 'Body should contain student name');
  });

  runner.test('Email sending functions should work with mocked MailApp', function() {
    // Mock MailApp
    const mailMock = TestUtils.mockMailApp();
    
    try {
      const emailData = {
        subject: 'Test Subject',
        body: 'Test Body'
      };
      
    // Test regular email
    sendRegularEmail(emailData, 'test@example.com');
    this.assertEqual(mailMock.emailsSent.length, 1, 'Should send one email');
    this.assertEqual(mailMock.emailsSent[0].to, 'test@example.com', 'Should send to correct recipient');
      
    } finally {
      mailMock.restore();
    }
  });
}

/**
 * Performance and stress tests
 */
function runPerformanceTests() {
  const runner = new SimpleTestRunner();
  
  runner.test('Performance test - processing 100 form submissions', function() {
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
      const testData = TestUtils.generateRandomData();
      const mockData = [
        'timestamp', testData.studentEmail, 'Gomez (Cas-Fl)', 
        testData.studentId, testData.lastName, testData.firstName,
        `${9 + (i % 4)}`
      ];
      
      const formData = parseFormData(mockData);
      validateFormData(formData);
      composeEmail(formData);
  // Emergency detection removed; keep placeholder variable for parity
  const _isEmergency = false;
    }
    
    const duration = Date.now() - startTime;
    this.assert(duration < 5000, `Processing 100 submissions should take less than 5 seconds (took ${duration}ms)`);
  });
  
  runner.runAll();
}

/**
 * Edge case tests
 */
function runEdgeCaseTests() {
  const runner = new SimpleTestRunner();
  
  runner.test('Should handle very long student names', function() {
    const longName = 'A'.repeat(1000);
    const formData = {
      firstName: longName,
      lastName: longName,
      counselorName: 'Gomez (Cas-Fl)',
      reason: 'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)'
    };
    
    this.assertTruthy(validateFormData(formData), 'Should validate long names');
    
    const emailData = composeEmail(formData);
    this.assert(emailData.body.length > 0, 'Should compose email with long names');
  });

  runner.test('Should handle special characters in names', function() {
    const formData = {
      firstName: "José María",
      lastName: "García-López",
      counselorName: 'Gomez (Cas-Fl)',
      reason: 'Personal Issues',
      studentEmail: 'josé.garcía@test.com'
    };
    
    this.assertTruthy(validateFormData(formData), 'Should validate names with special characters');
    
    const emailData = composeEmail(formData);
    this.assertContains(emailData.body, 'José María', 'Should include special characters in email');
  });

  runner.test('Should handle empty form submission gracefully', function() {
    const result = parseFormData([]);
    this.assertEqual(typeof result, 'object', 'Should return object for empty array');
    this.assertEqual(result.firstName, '', 'Should have empty string for missing fields');
  });
  
  runner.runAll();
}

/**
 * Quick test runner for individual function testing
 */
function quickTest(functionName) {
  // If no function specified, show usage and run the full suite
  if (!functionName) {
    Logger.log('Usage: quickTest("parseFormData" | "validateFormData" | "composeEmail" | "integration" | "performance" | "edge")');
    runAllTests();
    return;
  }

  // Special shortcuts that manage their own runner
  if (functionName === 'performance') {
    runPerformanceTests();
    return;
  }
  if (functionName === 'edge') {
    runEdgeCaseTests();
    return;
  }

  const runner = new SimpleTestRunner();

  switch(functionName) {
    case 'parseFormData':
      addParsingTests(runner);
      break;
    case 'validateFormData':
      addValidationTests(runner);
      break;
    case 'composeEmail':
      addEmailTests(runner);
      break;
    case 'integration':
      addIntegrationTests(runner);
      break;
    default:
  Logger.log(`Unknown function name: ${functionName}`);
  Logger.log('Valid options: parseFormData, validateFormData, composeEmail, integration, performance, edge');
      runner.test('Unknown function', function() {
        this.assert(false, `Function ${functionName} not found in test suite`);
      });
  }

  runner.runAll();
}
