/** 
 * Clark Counselor Notification Project
 * Project Lead: Wendy Gomez, Counselor
 * Apps Script Development: Alvaro Gomez, Academic Technology Coach
 *  
 * Trigger: set to send the emails out when a form is submitted to this sheet
 */

/**
 * 
 */
function onFormSubmit(e) {
  try {
    // Checks if 'e' is undefined
    if (!e || !e.values) {
      Logger.log("Form submission event or values are undefined.");
      return;
    }

    // Log details about the event
    Logger.log("Form Submission Event: " + JSON.stringify(e));

    // Get the responses submitted in the form
    let responses = e.values;

    // Log the form responses
    Logger.log("Form Responses: ", responses);

    // Specify the column index of the counselor selection question
    let counselorColumnIndex = 3;

    // Map counselor names to their corresponding emails
    // let counselorEmails = {
    //   'Jempty (A-Car)': 'deborah.jempty@nisd.net',
    //   'Gomez (Cas-Fl)': 'wendy.gomez@nisd.net',
    //   'Elizondo (Fm-I)': 'victoria.elizondo@nisd.net',
    //   'Lange (J-Mej)': 'laura.lange@nisd.net',
    //   'Guidry (Mek-Ph)': 'deborah.guidry@nisd.net',
    //   'Kosub (Pi-Sh)': 'stephanie.kosub@nisd.net',
    //   'Wellington (Si-Z)': 'ashley.wellington@nisd.net',
    //   'Mrs. Martinez (College, Career, & Military Advisor)': 'yvonne-2.martinez@nisd.net',
    //   'Head Counselor': 'marjan.switzer@nisd.net'
    // };

    // Used for testing
    let counselorEmails = {
      'Jempty (A-Car)': 'alvaro.gomez@nisd.net',
      'Gomez (Cas-Fl)': 'alvaro.gomez@nisd.net',
      'Elizondo (Fm-I)': 'alvaro.gomez@nisd.net',
      'Lange (J-Mej)': 'alvaro.gomez@nisd.net',
      'Guidry (Mek-Ph)': 'alvaro.gomez@nisd.net',
      'Kosub (Pi-Sh)': 'alvaro.gomez@nisd.net',
      'Wellington (Si-Z)': 'alvaro.gomez@nisd.net',
      'Mrs. Martinez (College, Career, & Military Advisor)': 'alvaro.gomez@nisd.net',
      'Head Counselor': 'alvaro.gomez@nisd.net'
    };
    let allCounselorEmails = Object.values(counselorEmails);

    // Get the selected counselor's name from the response
    let counselorName = responses[counselorColumnIndex - 1];

    // Get the counselor's email based on the selected name
    let counselorEmail = counselorEmails[counselorName];

    // Get other relevant information from the form responses
    let studentEmail = responses[1]
    let studentId = responses[3];
    let lastName = responses[4];
    let firstName = responses[5];
    let reason = responses[6];
    let urgent = responses[7];
    let personCompleting = responses[8];
    let description = responses[9];

    // Compose the email message with conditionally included parts
    let subject = 'REQUEST TO SEE COUNSELOR';
    let body = `${firstName} requested to meet with you.\n\nFollowing are the details that they provided:\n${lastName}, ${firstName} ${studentId}, Email: ${studentEmail}\nName of person completing form and relation to student: ${personCompleting}\n`;

    // Customized parts of the body of the email that are appended to the body above. The rest of the body will be different depending
    // on the reason they requested to see their counselor.
    if (reason === 'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)') {
      body += `Type of concern: Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)\nThey indicated the following level of urgency: ${urgent}`;
    }
    if (reason === 'Scheduling Concerns (Level Changes, Course Requests, etc)') {
      body += `Type of concern: Scheduling Concerns (Level Changes, Course Requests, etc)\nThey indicated the following level of urgency: ${urgent}`;
    }
    if (reason === 'Personal Issues') {
      body += `Type of concern: Personal Issues\nThey indicated the following level of urgency: ${urgent}`;
    }
    if (reason === 'College & Career Planning, Scholarships, & Financial Aid (Select Mrs. Martinez as Counselor)') {
      body += `Type of concern: College & Career Planning, Scholarships, & Financial Aid\nThey indicated the following level of urgency: ${urgent}`;
    }
    if (reason === 'Other') {
      body += `They indicated that they have an "Other" request that isn't listed in the dropdown and provided this brief description: ${description}`;
    }

    // Log details about the email
    Logger.log("Email Details (Counselor):", {
      to: counselorEmail,
      subject: subject,
      body: body
    });

    // Send the email to the selected counselor
    if (
      (
        reason === 'Academic (4 Year Planning, Transcripts, Credits, Grade Level, Letters of Recommendation)' ||
        reason === 'Scheduling Concerns (Level Changes, Course Requests, etc)' ||
        reason === 'Personal Issues' ||
        reason === 'College & Career Planning, Scholarships, & Financial Aid (Select Mrs. Martinez as Counselor)'
      ) && urgent === 'Red (It is an emergency, I need you as soon as possible, safety concern.)'
    ) {
      MailApp.sendEmail({
        to: allCounselorEmails.join(','),
        subject: subject,
        body: body
      });
      return;
    } else { 
      MailApp.sendEmail({
        to: counselorEmail,
        subject: subject,
        body: body
      });
    }
    
  } catch (error) {
    Logger.log("Error:", error);

    // Send an error notification email
    sendErrorNotificationEmail(error);
  }
}

/**
 * 
 */
function sendErrorNotificationEmail(error) {
  try {
    // Specify the recipient email address for error notifications
    let adminEmail = 'alvaro.gomez@nisd.net';

    // Compose the email message for error notification
    let errorSubject = 'Error Notification: Script Execution Issue';
    let errorBody = `An error occurred in the script:\n\n${error}`;

    // Log details about the error notification email
    Logger.log("Error Notification Email Details:", {
      to: adminEmail,
      subject: errorSubject,
      body: errorBody
    });

    // Send the error notification email
    MailApp.sendEmail({
      to: adminEmail,
      subject: errorSubject,
      body: errorBody
    });
  } catch (e) {
    // Log any additional error that might occur during the error notification process
    Logger.log("Error in sending error notification email:", e);
  }
}
