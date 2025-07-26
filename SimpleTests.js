/**
 * Unit Tests using Simple Test Framework
 * No external library dependencies required
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
  addEmergencyTests(runner);
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
      reason: 'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)'
    };
    this.assertTruthy(validateFormData(validData));
  });

  runner.test('validateFormData should return false for missing firstName', function() {
    const invalidData = {
      firstName: '',
      lastName: 'Doe',
      counselorName: 'Gomez (Cas-Fl)',
      reason: 'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)'
    };
    this.assertFalsy(validateFormData(invalidData));
  });

  runner.test('validateFormData should return false for missing required fields', function() {
    const invalidData = {
      firstName: 'John',
      lastName: '',
      counselorName: '',
      reason: ''
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
      'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)', // REASON
      'Green (I can wait a few days, not urgent.)', // URGENCY
      'Parent - Jane Doe',   // PERSON_COMPLETING
      'Additional info'      // DESCRIPTION
    ];
    
    const result = parseFormData(mockFormData);
    
    this.assertEqual(result.studentEmail, 'student@email.com');
    this.assertEqual(result.counselorName, 'Gomez (Cas-Fl)');
    this.assertEqual(result.studentId, '12345');
    this.assertEqual(result.lastName, 'Doe');
    this.assertEqual(result.firstName, 'John');
    this.assertContains(result.reason, 'Academic');
    this.assertContains(result.urgency, 'Green');
    this.assertEqual(result.personCompleting, 'Parent - Jane Doe');
    this.assertEqual(result.description, 'Additional info');
  });

  runner.test('parseFormData should handle missing values gracefully', function() {
    const result = parseFormData([]);
    
    this.assertEqual(result.studentEmail, '');
    this.assertEqual(result.counselorName, '');
    this.assertEqual(result.firstName, '');
    this.assertEqual(result.lastName, '');
  });

  runner.test('parseFormData should handle partial data', function() {
    const partialData = ['timestamp', 'student@test.com', 'Gomez (Cas-Fl)'];
    const result = parseFormData(partialData);
    
    this.assertEqual(result.studentEmail, 'student@test.com');
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
      studentEmail: 'john.doe@student.com',
      personCompleting: 'Parent - Jane Doe',
      reason: 'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)',
      urgency: 'Green (I can wait a few days, not urgent.)',
      description: 'Test description'
    };
    
    const result = composeEmail(mockFormData);
    
    this.assertEqual(result.subject, CONFIG.EMAIL_SUBJECT);
    this.assertContains(result.body, 'John requested to meet with you');
    this.assertContains(result.body, 'Doe, John 12345');
    this.assertContains(result.body, 'john.doe@student.com');
    this.assertContains(result.body, 'Parent - Jane Doe');
  });

  runner.test('buildReasonSpecificContent should handle Academic reason', function() {
    const formData = {
      reason: REASON_TYPES.ACADEMIC,
      urgency: 'Green (I can wait a few days, not urgent.)',
      description: ''
    };
    
    const result = buildReasonSpecificContent(formData);
    this.assertContains(result, 'Type of concern: Academic');
    this.assertContains(result, 'Green (I can wait a few days, not urgent.)');
  });

  runner.test('buildReasonSpecificContent should handle Other reason', function() {
    const formData = {
      reason: REASON_TYPES.OTHER,
      urgency: 'Yellow (In the next day or two would be great.)',
      description: 'Custom description here'
    };
    
    const result = buildReasonSpecificContent(formData);
    this.assertContains(result, 'Other" request');
    this.assertContains(result, 'Custom description here');
  });

  runner.test('buildReasonSpecificContent should handle unknown reason', function() {
    const formData = {
      reason: 'Unknown Reason Type',
      urgency: 'Red (It is an emergency, I need you as soon as possible, safety concern.)',
      description: ''
    };
    
    const result = buildReasonSpecificContent(formData);
    this.assertContains(result, 'Type of concern: Unknown Reason Type');
    this.assertContains(result, 'Red (It is an emergency');
  });
}

/**
 * Test emergency detection logic
 */
function addEmergencyTests(runner) {
  runner.test('isEmergencyRequest should return true for emergency', function() {
    const emergencyData = {
      reason: REASON_TYPES.PERSONAL,
      urgency: CONFIG.EMERGENCY_URGENCY
    };
    
    this.assertTruthy(isEmergencyRequest(emergencyData));
  });

  runner.test('isEmergencyRequest should return false for non-emergency urgency', function() {
    const nonEmergencyData = {
      reason: REASON_TYPES.PERSONAL,
      urgency: 'Green (I can wait a few days, not urgent.)'
    };
    
    this.assertFalsy(isEmergencyRequest(nonEmergencyData));
  });

  runner.test('isEmergencyRequest should return false for Other reason type', function() {
    const nonEmergencyData = {
      reason: REASON_TYPES.OTHER,
      urgency: CONFIG.EMERGENCY_URGENCY
    };
    
    this.assertFalsy(isEmergencyRequest(nonEmergencyData));
  });

  runner.test('isEmergencyRequest should handle all emergency reason types', function() {
    const emergencyReasons = [
      REASON_TYPES.ACADEMIC,
      REASON_TYPES.SCHEDULING,
      REASON_TYPES.PERSONAL,
      REASON_TYPES.COLLEGE_CAREER
    ];
    
    for (const reason of emergencyReasons) {
      const emergencyData = {
        reason: reason,
        urgency: CONFIG.EMERGENCY_URGENCY
      };
      
      this.assertTruthy(isEmergencyRequest(emergencyData), `${reason} should be emergency`);
    }
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
    const isEmergency = isEmergencyRequest(formData);
    
    this.assertTruthy(isValid, 'Form data should be valid');
    this.assertFalsy(isEmergency, 'Should not be detected as emergency');
    this.assertEqual(emailData.subject, CONFIG.EMAIL_SUBJECT, 'Subject should match config');
    this.assertContains(emailData.body, 'John requested to meet', 'Body should contain student name');
  });

  runner.test('Complete workflow should process emergency request correctly', function() {
    // Mock emergency form submission
    const mockEvent = TestDataFactory.createEmergencyFormEvent();
    
    const formData = parseFormData(mockEvent.values);
    const isValid = validateFormData(formData);
    const emailData = composeEmail(formData);
    const isEmergency = isEmergencyRequest(formData);
    
    this.assertTruthy(isValid, 'Form data should be valid');
    this.assertTruthy(isEmergency, 'Should be detected as emergency');
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
      
      // Test emergency email
      sendEmergencyEmail(emailData, ['counselor1@test.com', 'counselor2@test.com']);
      this.assertEqual(mailMock.emailsSent.length, 2, 'Should send two emails total');
      this.assertContains(mailMock.emailsSent[1].to, 'counselor1@test.com', 'Should send to all counselors');
      
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
        'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)',
        'Green (I can wait a few days, not urgent.)', 
        'Parent', testData.description
      ];
      
      const formData = parseFormData(mockData);
      validateFormData(formData);
      composeEmail(formData);
      isEmergencyRequest(formData);
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
    case 'isEmergencyRequest':
      addEmergencyTests(runner);
      break;
    default:
      runner.test('Unknown function', function() {
        this.assert(false, `Function ${functionName} not found in test suite`);
      });
  }
  
  runner.runAll();
}
