# Clark Counselor Notification Project

## Overview
Automated email notification system that sends counselor requests to appropriate staff members based on Google Form submissions.

**Project Lead:** Wendy Gomez, Counselor, Clark H.S., Northside ISD

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
- Built-in unit testing via the Simple Test Framework (no external dependencies)

## Setup

### 1. Google Apps Script Configuration
1. Create a new Google Apps Script project
2. Copy the contents of `Code.js` to your script
3. Set up a form submission trigger:
   - Go to Triggers in the Apps Script editor
   - Add trigger for `onFormSubmit` function
   - Choose "On form submit" event

### 2. Unit Testing Setup (Recommended)

**Use Built-in Testing Framework**
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
In `Code.js`, line 223, change:
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

### Built-in Test Framework Features
The `SimpleTestFramework.js` provides:
- **Assertions:** `assertEqual()`, `assertTruthy()`, `assertFalsy()`, `assertContains()`, `assertThrows()`
- **Mocking:** `TestUtils.mockMailApp()`, `TestUtils.mockLogger()`
- **Data Factory:** `TestDataFactory.createValidFormEvent()`, `TestDataFactory.createEmergencyFormEvent()`
- **No Dependencies:** Works entirely within Google Apps Script environment

## Documentation

### JSDoc Documentation
The codebase includes comprehensive JSDoc comments for API documentation:

#### Generate Documentation

**Option A: Local Generation (with Node.js)**
```bash
# Install JSDoc globally
npm install -g jsdoc

# Generate documentation
jsdoc Code.js SimpleTestFramework.js SimpleTests.js -c jsdoc.json -d docs

# Open generated documentation
open docs/index.html
```

**Option B: VS Code Extension**
1. Install "JSDoc Generator" extension
2. Use `Ctrl+Shift+P` → "Generate JSDoc"

#### JSDoc Features in Code
- **Function Documentation** - All functions have complete parameter and return documentation
- **Type Definitions** - Strong typing with TypeScript-style annotations
- **Usage Examples** - Code examples for complex functions
- **Cross-References** - Links between related functions
- **Error Documentation** - All thrown exceptions documented

#### Key Documentation Sections
- **API Reference** - Complete function documentation
- **Configuration Guide** - Setup and customization options  
- **Testing Documentation** - Test framework usage
- **Deployment Guide** - Step-by-step setup instructions

### Architecture

### Main Functions
- `onFormSubmit(e)` - Main trigger function
- `parseFormData(values)` - Converts form array to structured object
- `validateFormData(formData)` - Validates required fields
- `composeEmail(formData)` - Creates email content
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
- **Test failures**: Ensure test files (`SimpleTestFramework.js`, `SimpleTests.js`) are present and up to date

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
- **v3.0.0** - Updated script to match new Google Form fields that meet HB12 requirements 
- **v2.0.0** - Complete refactor with unit testing support
- **v1.0.0** - Original monolithic implementation 

### Changelog

- 2025-09-22 (v3.0.0) — Form simplified and notification behavior updated
  - Removed form fields: type of concern, urgency level, person completing the form, and freeform description.
  - Script updated to stop parsing/validating those fields; email composition simplified.
  - Notifications now go only to the assigned counselor when a student schedules an appointment.
  - Emergency/all-counselor broadcast and reason-specific content removed (placeholder kept for future reintroduction).
  - Unit tests and test helpers updated to match the new form layout; a local Node harness was added for quick test runs.
