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
    '10'                   // 6 - GRADE_LEVEL
  ];
  
  test('parseFormData should correctly parse form values', 
    function(t) {
      const result = parseFormData(mockFormData);
      
      t.equal(result.studentEmail, 'student@email.com');
      t.equal(result.counselorName, 'Gomez (Cas-Fl)');
      t.equal(result.studentId, '12345');
      t.equal(result.lastName, 'Doe');
      t.equal(result.firstName, 'John');
      t.equal(result.studentId, '12345');
      t.equal(result.lastName, 'Doe');
      t.equal(result.firstName, 'John');
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

// Emergency detection tests removed - revised form does not include reason/urgency

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
      '11'                           // GRADE_LEVEL (optional)
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
        
        t.ok(isValid, 'Form data should be valid');
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
          `${9 + (i % 4)}` // grade level (sample)
        ];
        
        const formData = parseFormData(mockData);
        validateFormData(formData);
        composeEmail(formData);
      }
      
      const endTime = new Date().getTime();
      const duration = endTime - startTime;
      
      t.ok(duration < 5000, `Processing 100 submissions should take less than 5 seconds (took ${duration}ms)`);
    });
  
  test.finish();
}
