require('dotenv').config();
const emailService = require('./services/emailService');

console.log('Testing Email Service Exports:');
const expected = [
  'sendWelcomeEmail',
  'sendPostInteractionEmail',
  'sendConnectionEmail',
  'sendConnectionPostEmail',
  'sendJobApplicationSubmittedEmail',
  'sendJobApplicationStatusUpdateEmail',
  'sendConnectionNewJobEmail',
  'sendPostDeletedByAdminEmail',
  'sendUserDeletedByAdminEmail',
  'sendJobListedOrgEmail',
  'sendJobApplicationReceivedOrgEmail',
  'sendCandidateHiredOrgEmail',
  'sendJobDeletedByAdminEmail',
  'sendOrgDeletedByAdminEmail',
  'sendCustomAdminEmail',
  'sendPasswordResetEmail',
  'sendPasswordResetSuccessEmail',
  'sendVerificationBadgeEmail',
];

let allExported = true;
for (const fn of expected) {
  if (typeof emailService[fn] === 'function') {
    console.log('  [OK] ' + fn);
  } else {
    console.error('  [MISSING] ' + fn);
    allExported = false;
  }
}

if (!allExported) {
  process.exit(1);
}

console.log('Verifying Transporter connection...');
emailService.transporter.verify((err, success) => {
  if (err) {
    console.error('Transporter verify error:', err);
    process.exit(1);
  } else {
    console.log('Transporter verification successful! SMTP credentials are valid.');
    process.exit(0);
  }
});
