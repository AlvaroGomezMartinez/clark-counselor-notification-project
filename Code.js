/** 
 * Clark Counselor Notification Project
 * Project Lead: Wendy Gomez, Counselor
 * Apps Script Development: Alvaro Gomez, Academic Technology Coach
 *  
 * Trigger: set to send the emails out when a form is submitted to this sheet
 */

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
    'Gomez (Cas-Fl)': 'alvaro.gomez@nisd.net',
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
 * Main form submission handler
 * @param {Object} e - Form submission event object
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
  
  // Base email body
  let body = `${formData.firstName} requested to meet with you.\n\n`;
  body += `Following are the details that they provided:\n`;
  body += `${formData.lastName}, ${formData.firstName} ${formData.studentId}, Email: ${formData.studentEmail}\n`;
  body += `Name of person completing form and relation to student: ${formData.personCompleting}\n\n`;
  
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
  
  // Map of reason types to their display content
  const reasonContent = {
    [REASON_TYPES.ACADEMIC]: `Type of concern: Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)\nThey indicated the following level of urgency: ${urgency}`,
    [REASON_TYPES.SCHEDULING]: `Type of concern: Scheduling Concerns (Level Changes, Course Requests, etc)\nThey indicated the following level of urgency: ${urgency}`,
    [REASON_TYPES.PERSONAL]: `Type of concern: Personal Issues\nThey indicated the following level of urgency: ${urgency}`,
    [REASON_TYPES.COLLEGE_CAREER]: `Type of concern: College & Career Planning, Scholarships, & Financial Aid\nThey indicated the following level of urgency: ${urgency}`,
    [REASON_TYPES.OTHER]: `They indicated that they have an "Other" request that isn't listed in the dropdown and provided this brief description: ${description}`
  };

  return reasonContent[reason] || `Type of concern: ${reason}\nUrgency level: ${urgency}`;
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
    body: emailData.body
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
    body: emailData.body
  });
  Logger.log(`Regular email sent to: ${counselorEmail}`);
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
