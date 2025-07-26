/** 
 * Clark Counselor Notification Project
 * 
 * @fileoverview Automated email notification system for counselor requests
 * @description This Google Apps Script processes form submissions and sends 
 *              email notifications to appropriate counselors based on student 
 *              last name ranges and request urgency levels.
 * 
 * @author Alvaro Gomez, Academic Technology Coach
 * @version 2.0.0
 * @since 2025-07-26
 * 
 * @requires Google Apps Script
 * @requires MailApp service
 * @requires SpreadsheetApp service
 * 
 * @example
 * // This script is triggered automatically on form submission
 * // Manual testing can be done with:
 * runAllTests();
 * 
 * @see {@link https://developers.google.com/apps-script} Google Apps Script Documentation
 */

/**
 * Adds checkboxes to column K starting in row 2 for specified counselor sheets
 * 
 * @description This function iterates through predefined counselor sheet names
 *              and adds checkboxes to column K for tracking completed requests.
 *              Includes error handling and duplicate prevention.
 * 
 * @function addCheckboxesToCounselorSheets
 * @memberof CounselorNotificationSystem
 * 
 * @throws {Error} When spreadsheet access fails or sheet operations error
 * 
 * @example
 * // Called automatically on form submission
 * addCheckboxesToCounselorSheets();
 * 
 * @see {@link addCheckboxesToSheet} Individual sheet checkbox handler
 * @since 2.0.0
 */
function addCheckboxesToCounselorSheets() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const targetSheetNames = ['Jempty', 'Gomez', 'Elizondo', 'Lange', 'Guidry', 'Kosub', 'Wellington', 'Martinez'];
    
    targetSheetNames.forEach(sheetName => {
      const sheet = spreadsheet.getSheetByName(sheetName);
      
      if (sheet) {
        addCheckboxesToSheet(sheet);
        Logger.log(`Checkboxes added to sheet: ${sheetName}`);
      } else {
        Logger.log(`Sheet not found: ${sheetName}`);
      }
    });
    
    Logger.log('Checkbox setup completed for all counselor sheets');
  } catch (error) {
    Logger.log('Error adding checkboxes:', error);
    sendErrorNotificationEmail(error);
  }
}

/**
 * Adds checkboxes to column K for a specific sheet
 * @param {Sheet} sheet - The sheet to add checkboxes to
 */
function addCheckboxesToSheet(sheet) {
  try {
    // Get the last row with data in the sheet
    const lastRow = sheet.getLastRow();
    
    // Only proceed if there are rows beyond row 1 (header row)
    if (lastRow > 1) {
      // Get the range from K2 to K[lastRow]
      const checkboxRange = sheet.getRange(2, 11, lastRow - 1, 1); // Column K is column 11
      
      // Check if checkboxes already exist in this range
      const existingValues = checkboxRange.getValues();
      const needsCheckboxes = existingValues.some(row => 
        typeof row[0] !== 'boolean' && row[0] !== true && row[0] !== false
      );
      
      if (needsCheckboxes) {
        // Insert checkboxes (unchecked by default)
        checkboxRange.insertCheckboxes();
        Logger.log(`Added ${lastRow - 1} checkboxes to column K in sheet: ${sheet.getName()}`);
      } else {
        Logger.log(`Checkboxes already exist in sheet: ${sheet.getName()}`);
      }
    } else {
      Logger.log(`No data rows found in sheet: ${sheet.getName()}`);
    }
  } catch (error) {
    Logger.log(`Error adding checkboxes to sheet ${sheet.getName()}:`, error);
  }
}

/**
 * Manual function to refresh checkboxes for all counselor sheets
 * Can be run manually if needed
 */
function refreshCheckboxes() {
  Logger.log('Manually refreshing checkboxes...');
  addCheckboxesToCounselorSheets();
}

// Configuration constants
const CONFIG = {
  ADMIN_EMAIL: 'alvaro.gomez@nisd.net',
  EMAIL_SUBJECT: 'REQUEST TO SEE COUNSELOR',
  EMERGENCY_URGENCY: 'Red (It is an emergency, I need you as soon as possible, safety concern.)',
  
  // Form column indices (0-based)
  FORM_COLUMNS: {
    STUDENT_EMAIL: 1,
    COUNSELOR_NAME: 2,
    STUDENT_ID: 3,
    LAST_NAME: 4,
    FIRST_NAME: 5,
    REASON: 6,
    URGENCY: 7,
    PERSON_COMPLETING: 8,
    DESCRIPTION: 9
  }
};

// Counselor email mappings
const COUNSELOR_EMAILS = {
  PRODUCTION: {
    'Jempty (A-Car)': 'deborah.jempty@nisd.net',
    'Gomez (Cas-Fl)': 'wendy.gomez@nisd.net',
    'Elizondo (Fm-I)': 'victoria.elizondo@nisd.net',
    'Lange (J-Mej)': 'laura.lange@nisd.net',
    'Guidry (Mek-Ph)': 'deborah.guidry@nisd.net',
    'Kosub (Pi-Sh)': 'stephanie.kosub@nisd.net',
    'Wellington (Si-Z)': 'ashley.wellington@nisd.net',
    'Mrs. Martinez (College, Career, & Military Advisor)': 'yvonne-2.martinez@nisd.net',
    'Head Counselor': 'marjan.switzer@nisd.net'
  },
  TESTING: {
    'Jempty (A-Car)': 'alvaro.gomez@nisd.net',
    'Gomez (Cas-Fl)': 'wendy.gomez@nisd.net',
    'Elizondo (Fm-I)': 'alvaro.gomez@nisd.net',
    'Lange (J-Mej)': 'alvaro.gomez@nisd.net',
    'Guidry (Mek-Ph)': 'alvaro.gomez@nisd.net',
    'Kosub (Pi-Sh)': 'alvaro.gomez@nisd.net',
    'Wellington (Si-Z)': 'alvaro.gomez@nisd.net',
    'Mrs. Martinez (College, Career, & Military Advisor)': 'alvaro.gomez@nisd.net',
    'Head Counselor': 'alvaro.gomez@nisd.net'
  }
};

// Reason types and their display names
const REASON_TYPES = {
  ACADEMIC: 'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)',
  SCHEDULING: 'Scheduling Concerns (Level Changes, Course Requests, etc)',
  PERSONAL: 'Personal Issues',
  COLLEGE_CAREER: 'College & Career Planning, Scholarships, & Financial Aid (Select Mrs. Martinez as Counselor)',
  OTHER: 'Other'
};

/**
 * Main form submission handler and email dispatcher
 * 
 * @description Processes Google Form submissions, validates data, determines
 *              appropriate counselor routing, sends email notifications, and
 *              updates spreadsheet checkboxes. Handles both regular and
 *              emergency request workflows.
 * 
 * @function onFormSubmit
 * @memberof CounselorNotificationSystem
 * 
 * @param {Object} e - Form submission event object from Google Forms
 * @param {Array<string>} e.values - Array of form response values
 * @param {string} e.range - Range where form data was inserted
 * @param {Object} e.source - Source spreadsheet object
 * 
 * @throws {Error} When counselor email mapping is not found
 * @throws {Error} When form validation fails
 * @throws {Error} When email sending fails
 * 
 * @example
 * // Automatically triggered on form submission
 * // Manual testing with mock data:
 * const mockEvent = {
 *   values: ['timestamp', 'student@email.com', 'Gomez (Cas-Fl)', '12345', 'Doe', 'John', 'Academic', 'Green', 'Self', '']
 * };
 * onFormSubmit(mockEvent);
 * 
 * @see {@link validateFormEvent} Form event validation
 * @see {@link parseFormData} Data parsing
 * @see {@link validateFormData} Data validation
 * @see {@link composeEmail} Email composition
 * @see {@link sendRegularEmail} Regular email sending
 * @see {@link sendEmergencyEmail} Emergency email sending
 * 
 * @since 1.0.0
 * @version 2.0.0
 */
function onFormSubmit(e) {
  try {
    // Validate form submission event
    if (!validateFormEvent(e)) {
      return;
    }

    Logger.log("Form Submission Event: " + JSON.stringify(e));
    Logger.log("Form Responses: ", e.values);

    // Parse form data
    const formData = parseFormData(e.values);
    
    // Validate required fields
    if (!validateFormData(formData)) {
      return;
    }

    // Get counselor email configuration (change to 'PRODUCTION' for live deployment)
    const counselorEmails = COUNSELOR_EMAILS.TESTING;
    const counselorEmail = counselorEmails[formData.counselorName];

    if (!counselorEmail) {
      throw new Error(`No email found for counselor: ${formData.counselorName}`);
    }

    // Compose and send email
    const emailData = composeEmail(formData);
    const shouldSendToAll = isEmergencyRequest(formData);

    logEmailDetails(emailData, counselorEmail, shouldSendToAll);
    
    if (shouldSendToAll) {
      sendEmergencyEmail(emailData, Object.values(counselorEmails));
    } else {
      sendRegularEmail(emailData, counselorEmail);
    }
    
    // Add checkboxes to counselor sheets after processing the form submission
    addCheckboxesToCounselorSheets();
    
  } catch (error) {
    Logger.log("Error in onFormSubmit:", error);
    sendErrorNotificationEmail(error);
  }
}

/**
 * Validates the form submission event
 * @param {Object} e - Form submission event object
 * @returns {boolean} True if valid, false otherwise
 */
function validateFormEvent(e) {
  if (!e || !e.values) {
    Logger.log("Form submission event or values are undefined.");
    return false;
  }
  return true;
}

/**
 * Parses form data into a structured object
 * @param {Array} values - Form response values
 * @returns {Object} Parsed form data
 */
function parseFormData(values) {
  const cols = CONFIG.FORM_COLUMNS;
  
  return {
    studentEmail: values[cols.STUDENT_EMAIL] || '',
    counselorName: values[cols.COUNSELOR_NAME] || '',
    studentId: values[cols.STUDENT_ID] || '',
    lastName: values[cols.LAST_NAME] || '',
    firstName: values[cols.FIRST_NAME] || '',
    reason: values[cols.REASON] || '',
    urgency: values[cols.URGENCY] || '',
    personCompleting: values[cols.PERSON_COMPLETING] || '',
    description: values[cols.DESCRIPTION] || ''
  };
}

/**
 * Validates required form data fields
 * @param {Object} formData - Parsed form data
 * @returns {boolean} True if valid, false otherwise
 */
function validateFormData(formData) {
  const requiredFields = ['firstName', 'lastName', 'counselorName', 'reason'];
  
  for (const field of requiredFields) {
    if (!formData[field] || formData[field].trim() === '') {
      Logger.log(`Required field missing: ${field}`);
      sendErrorNotificationEmail(new Error(`Required field missing: ${field}`));
      return false;
    }
  }
  return true;
}

/**
 * Composes the email subject and body
 * @param {Object} formData - Parsed form data
 * @returns {Object} Email data with subject and body
 */
function composeEmail(formData) {
  const subject = CONFIG.EMAIL_SUBJECT;
  
  // Base email body with better formatting
  let body = `${formData.firstName} requested to meet with you.\n\n`;
  body += `STUDENT DETAILS:\n`;
  body += `Name: ${formData.lastName}, ${formData.firstName}\n`;
  body += `Student ID: ${formData.studentId}\n`;
  body += `Email: ${formData.studentEmail}\n`;
  body += `Form completed by: ${formData.personCompleting}\n\n`;
  
  // Add reason-specific content
  body += buildReasonSpecificContent(formData);

  return { subject, body };
}

/**
 * Builds reason-specific email content
 * @param {Object} formData - Parsed form data
 * @returns {string} Reason-specific content
 */
function buildReasonSpecificContent(formData) {
  const { reason, urgency, description } = formData;
  
  // Map of reason types to their display content with better formatting
  const reasonContent = {
    [REASON_TYPES.ACADEMIC]: 
      `REQUEST TYPE: Academic Support\n` +
      `(4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)\n\n` +
      `URGENCY LEVEL: ${urgency}`,
      
    [REASON_TYPES.SCHEDULING]: 
      `REQUEST TYPE: Scheduling Concerns\n` +
      `(Level Changes, Course Requests, etc.)\n\n` +
      `URGENCY LEVEL: ${urgency}`,
      
    [REASON_TYPES.PERSONAL]: 
      `REQUEST TYPE: Personal Issues\n\n` +
      `URGENCY LEVEL: ${urgency}`,
      
    [REASON_TYPES.COLLEGE_CAREER]: 
      `REQUEST TYPE: College & Career Planning\n` +
      `(Scholarships & Financial Aid)\n\n` +
      `URGENCY LEVEL: ${urgency}`,
      
    [REASON_TYPES.OTHER]: 
      `REQUEST TYPE: Other\n\n` +
      `ADDITIONAL DETAILS:\n${description}`
  };

  return reasonContent[reason] || 
    `REQUEST TYPE: ${reason}\n\nURGENCY LEVEL: ${urgency}`;
}

/**
 * Determines if the request is an emergency requiring all counselors
 * @param {Object} formData - Parsed form data
 * @returns {boolean} True if emergency, false otherwise
 */
function isEmergencyRequest(formData) {
  const { reason, urgency } = formData;
  
  const emergencyReasons = [
    REASON_TYPES.ACADEMIC,
    REASON_TYPES.SCHEDULING,
    REASON_TYPES.PERSONAL,
    REASON_TYPES.COLLEGE_CAREER
  ];
  
  return emergencyReasons.includes(reason) && urgency === CONFIG.EMERGENCY_URGENCY;
}

/**
 * Logs email details for debugging
 * @param {Object} emailData - Email subject and body
 * @param {string} counselorEmail - Target counselor email
 * @param {boolean} isEmergency - Whether this is an emergency email
 */
function logEmailDetails(emailData, counselorEmail, isEmergency) {
  Logger.log("Email Details:", {
    to: isEmergency ? "All Counselors" : counselorEmail,
    isEmergency: isEmergency,
    subject: emailData.subject,
    body: emailData.body
  });
}

/**
 * Sends emergency email to all counselors
 * @param {Object} emailData - Email subject and body
 * @param {Array} allEmails - Array of all counselor emails
 */
function sendEmergencyEmail(emailData, allEmails) {
  MailApp.sendEmail({
    to: allEmails.join(','),
    subject: emailData.subject,
    body: emailData.body,
    htmlBody: createHtmlEmailBody(emailData.body)
  });
  Logger.log("Emergency email sent to all counselors");
}

/**
 * Sends regular email to specific counselor
 * @param {Object} emailData - Email subject and body
 * @param {string} counselorEmail - Target counselor email
 */
function sendRegularEmail(emailData, counselorEmail) {
  MailApp.sendEmail({
    to: counselorEmail,
    subject: emailData.subject,
    body: emailData.body,
    htmlBody: createHtmlEmailBody(emailData.body)
  });
  Logger.log(`Regular email sent to: ${counselorEmail}`);
}

/**
 * Creates HTML version of email body for better formatting
 * @param {string} plainTextBody - Plain text email body
 * @returns {string} HTML formatted email body
 */
function createHtmlEmailBody(plainTextBody) {
  // Convert plain text to HTML with better formatting
  let htmlBody = plainTextBody
    .replace(/\n\n/g, '</p><p>')  // Double line breaks become paragraph breaks
    .replace(/\n/g, '<br>')       // Single line breaks become <br> tags
    .replace(/^/, '<p>')          // Start with opening paragraph tag
    .replace(/$/, '</p>');        // End with closing paragraph tag
  
  // Add styling for better readability
  htmlBody = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
      ${htmlBody}
    </div>
  `;
  
  // Style specific sections
  htmlBody = htmlBody
    .replace(/STUDENT DETAILS:/g, '<strong style="color: #cc0099ff;">STUDENT DETAILS:</strong>')
    .replace(/REQUEST TYPE:/g, '<strong style="color: #cc0099ff;">REQUEST TYPE:</strong>')
    .replace(/URGENCY LEVEL:/g, '<strong style="color: #cc0099ff;">URGENCY LEVEL:</strong>')
    .replace(/ADDITIONAL DETAILS:/g, '<strong style="color: #cc0099ff;">ADDITIONAL DETAILS:</strong>');
  
  return htmlBody;
}

/**
 * Sends error notification email to administrator
 * @param {Error} error - The error object
 */
function sendErrorNotificationEmail(error) {
  try {
    const errorSubject = 'Error Notification: Script Execution Issue';
    const errorBody = `An error occurred in the Clark Counselor Notification script:\n\n${error.toString()}\n\nStack trace:\n${error.stack || 'No stack trace available'}`;

    Logger.log("Error Notification Email Details:", {
      to: CONFIG.ADMIN_EMAIL,
      subject: errorSubject,
      body: errorBody
    });

    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: errorSubject,
      body: errorBody
    });
    
    Logger.log("Error notification email sent successfully");
  } catch (e) {
    Logger.log("Critical error - Failed to send error notification email:", e);
  }
}
