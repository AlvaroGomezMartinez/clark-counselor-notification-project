# Clark Counselor Notification Project

## Overview
Automated email notification system that sends counselor requests to appropriate staff members based on Google Form submissions.

**Project Lead:** Wendy Gomez, Counselor  ### Troubleshooting

### Common Issues
- **"No email found for counselor"**: Check counselor name mapping in form vs. `COUNSELOR_EMAILS`
- **Form validation errors**: Verify form column indices in `CONFIG.FORM_COLUMNS`
- **Test failures**: Check that all script files are properly added to your Apps Script project
- **Library access issues**: Use the built-in `SimpleTestFramework.js` instead of external libraries

### Debugging
```javascript
// Enable detailed logging
Logger.log("Form Data:", formData);
Logger.log("Email Details:", emailData);

// Test individual functions
quickTest('parseFormData');
quickTest('validateFormData');

// Run specific test categories
runPerformanceTests();  // Check performance
runEdgeCaseTests();     // Test edge cases

// Sample test output:
// 🚀 Starting test suite...
// ✅ validateFormEvent should return true for valid event
// ✅ parseFormData should correctly parse form values
// ❌ validateFormData should return false for missing firstName
//    Error: Expected falsy value, but got true
```
## Google Apps Script Development: Alvaro Gomez, Academic Technology Coach

## Features
- Automatic email routing to assigned counselor based on student last name ranges
- Emergency notifications sent to all counselors when urgent
- Error handling and admin notifications
- Comprehensive unit testing with GasTap

## Setup

### 1. Google Apps Script Configuration
1. Create a new Google Apps Script project
2. Copy the contents of `Code.js` to your script
3. Set up a form submission trigger:
   - Go to Triggers in the Apps Script editor
   - Add trigger for `onFormSubmit` function
   - Choose "On form submit" event

### 2. Unit Testing Setup (Recommended)

**Option A: Use GasTap Library (if available)**
1. **Install GasTap Library:**
   - In Apps Script, go to Libraries
   - Try these Library IDs (use the first one that works):
     - `1sHSS8UQPUZxLXSBNaZHGm1v5Lz4l0KJfqHvlIl3GqT7N9R7QJ4n_9Q-E`
     - `MxL38OxqIK-B73jyDTvCe-OBao7QLBR4j`
   - Select the latest version
   - Set identifier to `GasTap`
   - Click "Save"

**Option B: Use Built-in Testing Framework (Recommended)**
1. **Add Test Files:**
   - Create new script files: `SimpleTestFramework.js` and `SimpleTests.js`
   - Copy the respective code from this repository
   - No external dependencies required!

2. **Run Tests:**
   ```javascript
   // Run all tests
   runAllTests();
   
   // Run specific test categories
   runPerformanceTests();
   runEdgeCaseTests();
   
   // Test individual functions
   quickTest('parseFormData');
   quickTest('validateFormData');
   
   // Run integration tests
   testCompleteWorkflow();
   
   // Run performance tests
   testPerformance();
   ```

## Configuration

### Switching Between Testing and Production
In `Code.js`, line 77, change:
```javascript
// For testing
const counselorEmails = COUNSELOR_EMAILS.TESTING;

// For production
const counselorEmails = COUNSELOR_EMAILS.PRODUCTION;
```

### Form Column Mapping
Update `CONFIG.FORM_COLUMNS` if your form structure changes:
```javascript
FORM_COLUMNS: {
  STUDENT_EMAIL: 1,      // Column index for student email
  COUNSELOR_NAME: 2,     // Column index for counselor selection
  STUDENT_ID: 3,         // Column index for student ID
  // ... etc
}
```

### Counselor Email Mapping
Update counselor emails in the `COUNSELOR_EMAILS` object:
```javascript
COUNSELOR_EMAILS: {
  PRODUCTION: {
    'Jempty (A-Car)': 'deborah.jempty@nisd.net',
    'Gomez (Cas-Fl)': 'wendy.gomez@nisd.net',
    // ... add or modify counselors
  }
}
```

## Testing

### Unit Tests Available
- **Form Event Validation:** Tests form submission event handling
- **Data Parsing:** Tests conversion of form arrays to structured objects
- **Data Validation:** Tests required field validation
- **Email Composition:** Tests email content generation
- **Emergency Detection:** Tests logic for emergency vs. regular requests
- **Email Sending:** Tests email routing logic (mocked)

### Running Tests
```javascript
// Complete test suite
runAllTests();              // All unit tests with built-in framework

// Specialized test suites
runPerformanceTests();      // Performance and speed tests
runEdgeCaseTests();         // Edge cases and error handling

// Individual function testing
quickTest('parseFormData');      // Test specific function
quickTest('validateFormData');   // Test validation logic
quickTest('composeEmail');       // Test email composition

// Alternative: If using GasTap library
function runTestsWithGasTap() {
  runAllTests();           // All unit tests
  testCompleteWorkflow();  // Integration tests
  testEdgeCases();         // Edge case handling
  testPerformance();       // Performance tests
  stressTest();           // Stress testing
}
```

### Built-in Test Framework Features
The `SimpleTestFramework.js` provides:
- **Assertions:** `assertEqual()`, `assertTruthy()`, `assertFalsy()`, `assertContains()`, `assertThrows()`
- **Mocking:** `TestUtils.mockMailApp()`, `TestUtils.mockLogger()`
- **Data Factory:** `TestDataFactory.createValidFormEvent()`, `TestDataFactory.createEmergencyFormEvent()`
- **No Dependencies:** Works entirely within Google Apps Script environment

### Test Data Factory
Use `TestDataFactory` to create consistent test data:
```javascript
// Valid form submission
const validEvent = TestDataFactory.createValidFormEvent();

// Emergency request
const emergencyEvent = TestDataFactory.createEmergencyFormEvent();

// Invalid data for error testing
const invalidEvent = TestDataFactory.createInvalidFormEvent();

// Custom data with overrides
const customEvent = TestDataFactory.createValidFormEvent({
  FIRST_NAME: 'Maria',
  URGENCY: 'Red (It is an emergency, I need you as soon as possible, safety concern.)'
});
```

### Mock Utilities
```javascript
// Mock email sending for testing
const mailMock = TestUtils.mockMailApp();
sendRegularEmail(emailData, 'test@example.com');
console.log(mailMock.emailsSent); // Check sent emails
mailMock.restore(); // Restore original MailApp

// Mock logging for testing
const logMock = TestUtils.mockLogger();
Logger.log('test message');
console.log(logMock.logs); // Check logged messages
logMock.restore(); // Restore original Logger

// Generate random test data
const randomData = TestUtils.generateRandomData();
console.log(randomData.firstName, randomData.studentEmail);
```

## Architecture

### Main Functions
- `onFormSubmit(e)` - Main trigger function
- `parseFormData(values)` - Converts form array to structured object
- `validateFormData(formData)` - Validates required fields
- `composeEmail(formData)` - Creates email content
- `isEmergencyRequest(formData)` - Determines if emergency routing needed
- `sendRegularEmail()` / `sendEmergencyEmail()` - Email routing functions

### Error Handling
- Form validation errors
- Missing counselor mappings
- Email sending failures
- Automatic admin notifications

## Benefits of This Architecture

### ✅ **Maintainability**
- Modular functions with single responsibilities
- Clear separation of concerns
- Easy to modify individual components

### ✅ **Testability**
- Comprehensive unit test coverage
- Mock utilities for external dependencies
- Integration and performance testing

### ✅ **Reliability**
- Input validation and error handling
- Graceful degradation on errors
- Admin notifications for issues

### ✅ **Flexibility**
- Easy configuration switching (test/prod)
- Simple counselor mapping updates
- Extensible for new requirements

## Deployment Checklist

1. ✅ Copy `Code.js` to Apps Script project
2. ✅ Update counselor email mappings
3. ✅ Set up form submission trigger
4. ✅ Test with sample form submissions
5. ✅ Run unit test suite
6. ✅ Switch to production configuration
7. ✅ Monitor error logs and admin notifications

## Troubleshooting

### Common Issues
- **"No email found for counselor"**: Check counselor name mapping in form vs. `COUNSELOR_EMAILS`
- **Form validation errors**: Verify form column indices in `CONFIG.FORM_COLUMNS`
- **Test failures**: Ensure GasTap library is properly installed and configured

### Debugging
```javascript
// Enable detailed logging
Logger.log("Form Data:", formData);
Logger.log("Email Details:", emailData);

// Test individual functions
quickTest('parseFormData');
quickTest('validateFormData');
```

## Version History
- **v2.0** - Complete refactor with unit testing support
- **v1.0** - Original monolithic implementation 
