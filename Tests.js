/**
 * Unit Tests for Clark Counselor Notification Project
 * Using GasTap testing framework
 * 
 * To install GasTap:
 * 1. Go to Libraries in Apps Script
 * 2. Add library ID: 1T65ahz0hUzGXJWYUcyWCa5cCW9W1WcTbWqPHpbOGjAJBhFuSDAcT-_8K
 * 3. Select the latest version and save
 * 4. Set identifier to 'GasTap'
 */

/**
 * Main test runner function - run this to execute all tests
 */
function runAllTests() {
  const test = new GasTap();
  
  // Test suites
  testValidateFormEvent(test);
  testParseFormData(test);
  testValidateFormData(test);
  testComposeEmail(test);
  testBuildReasonSpecificContent(test);
  testIsEmergencyRequest(test);
  testEmailSending(test);
  
  // Finish and display results
  test.finish();
}

/**
 * Test validateFormEvent function
 */
function testValidateFormEvent(test) {
  // Test valid event
  const validEvent = { values: ['test', 'data'] };
  test('validateFormEvent should return true for valid event', 
    function(t) {
      t.equal(validateFormEvent(validEvent), true);
    });
  
  // Test null event
  test('validateFormEvent should return false for null event', 
    function(t) {
      t.equal(validateFormEvent(null), false);
    });
  
  // Test undefined event
  test('validateFormEvent should return false for undefined event', 
    function(t) {
      t.equal(validateFormEvent(undefined), false);
    });
  
  // Test event without values
  test('validateFormEvent should return false for event without values', 
    function(t) {
      t.equal(validateFormEvent({}), false);
    });
}

/**
 * Test parseFormData function
 */
function testParseFormData(test) {
  const mockFormData = [
    'timestamp',           // 0
    'student@email.com',   // 1 - STUDENT_EMAIL
    'Gomez (Cas-Fl)',      // 2 - COUNSELOR_NAME
    '12345',               // 3 - STUDENT_ID
    'Doe',                 // 4 - LAST_NAME
    'John',                // 5 - FIRST_NAME
    'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)', // 6 - REASON
    'Green (I can wait a few days, not urgent.)', // 7 - URGENCY
    'Parent - Jane Doe',   // 8 - PERSON_COMPLETING
    'Additional info'      // 9 - DESCRIPTION
  ];
  
  test('parseFormData should correctly parse form values', 
    function(t) {
      const result = parseFormData(mockFormData);
      
      t.equal(result.studentEmail, 'student@email.com');
      t.equal(result.counselorName, 'Gomez (Cas-Fl)');
      t.equal(result.studentId, '12345');
      t.equal(result.lastName, 'Doe');
      t.equal(result.firstName, 'John');
      t.equal(result.reason, 'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)');
      t.equal(result.urgency, 'Green (I can wait a few days, not urgent.)');
      t.equal(result.personCompleting, 'Parent - Jane Doe');
      t.equal(result.description, 'Additional info');
    });
  
  // Test with missing values
  test('parseFormData should handle missing values gracefully', 
    function(t) {
      const result = parseFormData([]);
      
      t.equal(result.studentEmail, '');
      t.equal(result.counselorName, '');
      t.equal(result.firstName, '');
    });
}

/**
 * Test validateFormData function
 */
function testValidateFormData(test) {
  const validFormData = {
    firstName: 'John',
    lastName: 'Doe',
    counselorName: 'Gomez (Cas-Fl)',
    reason: 'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)',
    studentEmail: 'student@email.com'
  };
  
  test('validateFormData should return true for valid data', 
    function(t) {
      t.equal(validateFormData(validFormData), true);
    });
  
  // Test missing firstName
  test('validateFormData should return false for missing firstName', 
    function(t) {
      const invalidData = { ...validFormData, firstName: '' };
      t.equal(validateFormData(invalidData), false);
    });
  
  // Test missing lastName
  test('validateFormData should return false for missing lastName', 
    function(t) {
      const invalidData = { ...validFormData, lastName: null };
      t.equal(validateFormData(invalidData), false);
    });
  
  // Test missing counselorName
  test('validateFormData should return false for missing counselorName', 
    function(t) {
      const invalidData = { ...validFormData, counselorName: '   ' };
      t.equal(validateFormData(invalidData), false);
    });
}

/**
 * Test composeEmail function
 */
function testComposeEmail(test) {
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
  
  test('composeEmail should create properly formatted email', 
    function(t) {
      const result = composeEmail(mockFormData);
      
      t.equal(result.subject, CONFIG.EMAIL_SUBJECT);
      t.ok(result.body.includes('John requested to meet with you'));
      t.ok(result.body.includes('Doe, John 12345'));
      t.ok(result.body.includes('john.doe@student.com'));
      t.ok(result.body.includes('Parent - Jane Doe'));
    });
}

/**
 * Test buildReasonSpecificContent function
 */
function testBuildReasonSpecificContent(test) {
  // Test Academic reason
  test('buildReasonSpecificContent should handle Academic reason', 
    function(t) {
      const formData = {
        reason: REASON_TYPES.ACADEMIC,
        urgency: 'Green (I can wait a few days, not urgent.)',
        description: ''
      };
      
      const result = buildReasonSpecificContent(formData);
      t.ok(result.includes('Type of concern: Academic'));
      t.ok(result.includes('Green (I can wait a few days, not urgent.)'));
    });
  
  // Test Other reason
  test('buildReasonSpecificContent should handle Other reason', 
    function(t) {
      const formData = {
        reason: REASON_TYPES.OTHER,
        urgency: 'Yellow (In the next day or two would be great.)',
        description: 'Custom description here'
      };
      
      const result = buildReasonSpecificContent(formData);
      t.ok(result.includes('Other" request'));
      t.ok(result.includes('Custom description here'));
    });
  
  // Test unknown reason
  test('buildReasonSpecificContent should handle unknown reason', 
    function(t) {
      const formData = {
        reason: 'Unknown Reason Type',
        urgency: 'Red (It is an emergency, I need you as soon as possible, safety concern.)',
        description: ''
      };
      
      const result = buildReasonSpecificContent(formData);
      t.ok(result.includes('Type of concern: Unknown Reason Type'));
      t.ok(result.includes('Red (It is an emergency'));
    });
}

/**
 * Test isEmergencyRequest function
 */
function testIsEmergencyRequest(test) {
  // Test emergency request
  test('isEmergencyRequest should return true for emergency', 
    function(t) {
      const emergencyData = {
        reason: REASON_TYPES.PERSONAL,
        urgency: CONFIG.EMERGENCY_URGENCY
      };
      
      t.equal(isEmergencyRequest(emergencyData), true);
    });
  
  // Test non-emergency request (wrong urgency)
  test('isEmergencyRequest should return false for non-emergency urgency', 
    function(t) {
      const nonEmergencyData = {
        reason: REASON_TYPES.PERSONAL,
        urgency: 'Green (I can wait a few days, not urgent.)'
      };
      
      t.equal(isEmergencyRequest(nonEmergencyData), false);
    });
  
  // Test non-emergency request (Other reason type)
  test('isEmergencyRequest should return false for Other reason type', 
    function(t) {
      const nonEmergencyData = {
        reason: REASON_TYPES.OTHER,
        urgency: CONFIG.EMERGENCY_URGENCY
      };
      
      t.equal(isEmergencyRequest(nonEmergencyData), false);
    });
}

/**
 * Test email sending functions (mock tests)
 */
function testEmailSending(test) {
  // Mock MailApp for testing
  const originalMailApp = MailApp;
  let emailsSent = [];
  
  // Create mock MailApp
  MailApp = {
    sendEmail: function(options) {
      emailsSent.push(options);
    }
  };
  
  test('sendRegularEmail should send to single recipient', 
    function(t) {
      const emailData = {
        subject: 'Test Subject',
        body: 'Test Body'
      };
      
      emailsSent = []; // Reset
      sendRegularEmail(emailData, 'test@example.com');
      
      t.equal(emailsSent.length, 1);
      t.equal(emailsSent[0].to, 'test@example.com');
      t.equal(emailsSent[0].subject, 'Test Subject');
    });
  
  test('sendEmergencyEmail should send to all counselors', 
    function(t) {
      const emailData = {
        subject: 'Emergency Subject',
        body: 'Emergency Body'
      };
      const allEmails = ['counselor1@test.com', 'counselor2@test.com'];
      
      emailsSent = []; // Reset
      sendEmergencyEmail(emailData, allEmails);
      
      t.equal(emailsSent.length, 1);
      t.equal(emailsSent[0].to, 'counselor1@test.com,counselor2@test.com');
    });
  
  // Restore original MailApp
  MailApp = originalMailApp;
}

/**
 * Integration test for the complete workflow
 */
function testCompleteWorkflow() {
  const test = new GasTap();
  
  // Mock form submission event
  const mockEvent = {
    values: [
      'timestamp',
      'john.doe@student.com',        // STUDENT_EMAIL
      'Gomez (Cas-Fl)',              // COUNSELOR_NAME  
      '12345',                       // STUDENT_ID
      'Doe',                         // LAST_NAME
      'John',                        // FIRST_NAME
      'Personal Issues',             // REASON
      'Red (It is an emergency, I need you as soon as possible, safety concern.)', // URGENCY
      'Parent - Jane Doe',           // PERSON_COMPLETING
      'Student is having difficulties' // DESCRIPTION
    ]
  };
  
  // Mock MailApp
  const originalMailApp = MailApp;
  let emailsSent = [];
  MailApp = {
    sendEmail: function(options) {
      emailsSent.push(options);
    }
  };
  
  test('Complete workflow should process emergency request correctly', 
    function(t) {
      try {
        // This would normally call onFormSubmit, but we'll test the components
        const formData = parseFormData(mockEvent.values);
        const isValid = validateFormData(formData);
        const emailData = composeEmail(formData);
        const isEmergency = isEmergencyRequest(formData);
        
        t.ok(isValid, 'Form data should be valid');
        t.ok(isEmergency, 'Should be detected as emergency');
        t.ok(emailData.subject === CONFIG.EMAIL_SUBJECT, 'Subject should match config');
        t.ok(emailData.body.includes('John requested to meet'), 'Body should contain student name');
        
      } catch (error) {
        t.fail('Complete workflow should not throw errors: ' + error.message);
      }
    });
  
  // Restore MailApp
  MailApp = originalMailApp;
  test.finish();
}

/**
 * Performance test for large data sets
 */
function testPerformance() {
  const test = new GasTap();
  
  test('Performance test - processing 100 form submissions', 
    function(t) {
      const startTime = new Date().getTime();
      
      for (let i = 0; i < 100; i++) {
        const mockData = [
          'timestamp', `student${i}@test.com`, 'Gomez (Cas-Fl)', 
          `1234${i}`, `LastName${i}`, `FirstName${i}`, 
          'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)',
          'Green (I can wait a few days, not urgent.)', 
          `Parent ${i}`, `Description ${i}`
        ];
        
        const formData = parseFormData(mockData);
        validateFormData(formData);
        composeEmail(formData);
        isEmergencyRequest(formData);
      }
      
      const endTime = new Date().getTime();
      const duration = endTime - startTime;
      
      t.ok(duration < 5000, `Processing 100 submissions should take less than 5 seconds (took ${duration}ms)`);
    });
  
  test.finish();
}
