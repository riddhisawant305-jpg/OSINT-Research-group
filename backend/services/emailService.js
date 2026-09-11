const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Create reusable transporter object using SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: (process.env.SMTP_PORT == '465'),
  auth: {
    user: (process.env.SMTP_USERNAME || 'careerverse999@gmail.com').trim(),
    pass: (process.env.SMTP_PASSWORD || 'ahijstedmkamoaog').replace(/\s+/g, ''),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP connection on startup asynchronously
transporter.verify((error, success) => {
  if (error) {
    console.warn('[EmailService] SMTP verification warning (might be offline):', error.message);
  } else {
    console.log('[EmailService] SMTP Server ready to dispatch emails (careerverse999@gmail.com)');
  }
});

/**
 * Base email layout for semi-formal & semi-casual CareerVerse emails
 */
const renderEmailTemplate = ({ title, headline, bodyContent, actionUrl, actionText }) => {
  const currentYear = new Date().getFullYear();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resolvedActionUrl = actionUrl
    ? (actionUrl.startsWith('http') ? actionUrl : `${clientUrl}${actionUrl.startsWith('/') ? '' : '/'}${actionUrl}`)
    : clientUrl;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; }
    .wrapper { width: 100%; background-color: #f1f5f9; padding: 32px 16px; box-sizing: border-box; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 32px; text-align: center; }
    .logo { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: #2563eb; color: #ffffff; font-size: 20px; font-weight: 800; border-radius: 10px; margin-bottom: 8px; }
    .brand-name { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
    .brand-name span { color: #38bdf8; }
    .content { padding: 36px 32px; font-size: 15px; color: #334155; }
    .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
    .headline-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px; font-size: 15px; color: #1e40af; font-weight: 500; }
    .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .details-row { margin-bottom: 10px; display: flex; font-size: 14px; }
    .details-row:last-child { margin-bottom: 0; }
    .details-label { font-weight: 600; width: 140px; color: #475569; flex-shrink: 0; }
    .details-value { color: #0f172a; flex-grow: 1; }
    .action-btn-container { text-align: center; margin: 32px 0 16px 0; }
    .action-btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 13px; color: #64748b; }
    .footer p { margin: 4px 0; }
    .reason-box { background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 6px; padding: 16px; margin: 20px 0; color: #991b1b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">CV</div>
        <h1 class="brand-name">Career<span>Verse</span></h1>
      </div>
      <div class="content">
        ${headline ? `<div class="headline-box">${headline}</div>` : ''}
        ${bodyContent}
        ${actionText ? `
          <div class="action-btn-container">
            <a href="${resolvedActionUrl}" class="action-btn" target="_blank">${actionText}</a>
          </div>
        ` : ''}
      </div>
      <div class="footer">
        <p><strong>CareerVerse Platform</strong> • Connect, Grow & Get Hired</p>
        <p>You received this email because of activity on your CareerVerse account.</p>
        <p>&copy; ${currentYear} CareerVerse Inc. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Helper to dispatch email with error protection
 */
const sendMailSafe = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Email dispatched to ${mailOptions.to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to dispatch email to ${mailOptions.to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// 1. Welcome Email (Candidate & Organization)
const sendWelcomeEmail = async ({ to, name, role }) => {
  if (!to) return;
  const isOrg = role === 'organization' || role === 'recruiter';
  const subject = isOrg
    ? `Welcome to CareerVerse for Organizations, ${name}!`
    : `Welcome to CareerVerse, ${name}! Let's build your future 🚀`;

  const bodyContent = isOrg
    ? `
      <h2 class="greeting">Hello ${name} Team,</h2>
      <p>We're thrilled to welcome your organization to <strong>CareerVerse</strong>! You now have direct access to our premier talent pool of students, tech innovators, and driven professionals.</p>
      <div class="details-box">
        <div class="details-row"><span class="details-label">Account Type:</span><span class="details-value">Organization / Recruiter</span></div>
        <div class="details-row"><span class="details-label">Registered Email:</span><span class="details-value">${to}</span></div>
        <div class="details-row"><span class="details-label">Status:</span><span class="details-value">Active & Ready to Hire</span></div>
      </div>
      <p>Here's what you can do right away:</p>
      <ul>
        <li>Post new job openings and connect with qualified candidates.</li>
        <li>Review received applications with full applicant profiles and resume attachments.</li>
        <li>Manage candidate pipelines and track hires under <em>Hired from CareerVerse</em>.</li>
      </ul>
      <p>If you need any assistance getting started, feel free to reach out anytime.</p>
      <p>Cheers,<br><strong>The CareerVerse Team</strong></p>
    `
    : `
      <h2 class="greeting">Hey ${name},</h2>
      <p>Welcome to <strong>CareerVerse</strong>! We are super excited to have you join our community of aspiring professionals, developers, and creators.</p>
      <div class="details-box">
        <div class="details-row"><span class="details-label">Account Name:</span><span class="details-value">${name}</span></div>
        <div class="details-row"><span class="details-label">Registered Email:</span><span class="details-value">${to}</span></div>
        <div class="details-row"><span class="details-label">Role:</span><span class="details-value">Candidate / Student</span></div>
      </div>
      <p>Here are a few steps to jumpstart your CareerVerse experience:</p>
      <ul>
        <li><strong>Complete your profile:</strong> Add your skills, projects, and upload your resume.</li>
        <li><strong>Connect with peers:</strong> Expand your professional network.</li>
        <li><strong>Apply for jobs:</strong> Explore curated opportunities posted by top companies.</li>
        <li><strong>AI Career Tools:</strong> Optimize your resume and practice interviews.</li>
      </ul>
      <p>Wishing you the best in your career journey!</p>
      <p>Warm regards,<br><strong>The CareerVerse Team</strong></p>
    `;

  return sendMailSafe({
    from: process.env.MAIL_FROM || '"CareerVerse" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: isOrg ? 'Welcome to CareerVerse Hiring Portal' : 'Welcome to the CareerVerse Community!',
      bodyContent,
      actionUrl: isOrg ? '/dashboard' : '/home',
      actionText: isOrg ? 'Open Organization Dashboard' : 'Explore Your Feed',
    }),
  });
};

// 2. User: Post Liked or Commented
const sendPostInteractionEmail = async ({ to, recipientName, actorName, type, postSnippet, commentText }) => {
  if (!to) return;
  const isLike = type === 'like';
  const subject = isLike
    ? `${actorName} liked your post on CareerVerse`
    : `${actorName} commented on your post on CareerVerse`;

  const bodyContent = `
    <h2 class="greeting">Hi ${recipientName},</h2>
    <p>Great news! <strong>${actorName}</strong> just ${isLike ? 'liked' : 'commented on'} your post on CareerVerse.</p>
    <div class="details-box">
      <div class="details-row"><span class="details-label">Interacted By:</span><span class="details-value"><strong>${actorName}</strong></span></div>
      <div class="details-row"><span class="details-label">Activity:</span><span class="details-value">${isLike ? 'Liked your post' : 'Commented on your post'}</span></div>
      ${postSnippet ? `<div class="details-row"><span class="details-label">Post Snippet:</span><span class="details-value"><em>"${postSnippet}"</em></span></div>` : ''}
      ${commentText ? `<div class="details-row"><span class="details-label">Comment:</span><span class="details-value" style="color:#2563eb;">"${commentText}"</span></div>` : ''}
    </div>
    <p>Jump in and join the conversation with your network!</p>
    <p>Best regards,<br><strong>The CareerVerse Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Notifications" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: `New Engagement from ${actorName}`,
      bodyContent,
      actionUrl: '/home',
      actionText: 'View Interaction',
    }),
  });
};

// 3. User: Added in Connections
const sendConnectionEmail = async ({ to, recipientName, actorName }) => {
  if (!to) return;
  const subject = `${actorName} connected with you on CareerVerse`;

  const bodyContent = `
    <h2 class="greeting">Hi ${recipientName},</h2>
    <p>Your network is expanding! <strong>${actorName}</strong> just connected with you on CareerVerse.</p>
    <div class="details-box">
      <div class="details-row"><span class="details-label">New Connection:</span><span class="details-value"><strong>${actorName}</strong></span></div>
      <div class="details-row"><span class="details-label">Network Status:</span><span class="details-value">Connected</span></div>
    </div>
    <p>Take a look at their profile, exchange messages, and stay in touch on upcoming opportunities.</p>
    <p>Best regards,<br><strong>The CareerVerse Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Network" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: 'New Professional Connection 🤝',
      bodyContent,
      actionUrl: '/network',
      actionText: 'View Your Network',
    }),
  });
};

// 4. User: Connection Made a Post
const sendConnectionPostEmail = async ({ to, recipientName, actorName, postSnippet }) => {
  if (!to) return;
  const subject = `${actorName} from your connections posted on CareerVerse`;

  const bodyContent = `
    <h2 class="greeting">Hi ${recipientName},</h2>
    <p>Someone in your connections just shared a new update! <strong>${actorName}</strong> published a new post.</p>
    <div class="details-box">
      <div class="details-row"><span class="details-label">Author:</span><span class="details-value"><strong>${actorName}</strong></span></div>
      ${postSnippet ? `<div class="details-row"><span class="details-label">Post Preview:</span><span class="details-value"><em>"${postSnippet}"</em></span></div>` : ''}
    </div>
    <p>Check it out on your feed, leave a like or share your thoughts in the comments.</p>
    <p>Best regards,<br><strong>The CareerVerse Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Feed" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: `New Post from ${actorName}`,
      bodyContent,
      actionUrl: '/home',
      actionText: 'Read Post',
    }),
  });
};

// 5. User: Job Application Submitted
const sendJobApplicationSubmittedEmail = async ({ to, applicantName, jobTitle, companyName, location, salary, type }) => {
  if (!to) return;
  const subject = `Application Submitted: ${jobTitle} at ${companyName}`;

  const bodyContent = `
    <h2 class="greeting">Hi ${applicantName},</h2>
    <p>Awesome! Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received by the hiring team.</p>
    <div class="details-box">
      <div class="details-row"><span class="details-label">Position:</span><span class="details-value"><strong>${jobTitle}</strong></span></div>
      <div class="details-row"><span class="details-label">Organization:</span><span class="details-value"><strong>${companyName}</strong></span></div>
      <div class="details-row"><span class="details-label">Location:</span><span class="details-value">${location || 'Remote / Flexible'}</span></div>
      <div class="details-row"><span class="details-label">Job Type:</span><span class="details-value">${type || 'Full-time'}</span></div>
      ${salary ? `<div class="details-row"><span class="details-label">Compensation:</span><span class="details-value">${salary}</span></div>` : ''}
      <div class="details-row"><span class="details-label">Status:</span><span class="details-value" style="color:#2563eb; font-weight:600;">Applied</span></div>
    </div>
    <p>The recruitment team has been notified and sent your details. You can track your progress right from your CareerVerse jobs dashboard.</p>
    <p>Wishing you the best of luck!<br><strong>The CareerVerse Careers Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Careers" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: 'Application Confirmed ✅',
      bodyContent,
      actionUrl: '/jobs',
      actionText: 'Track Your Applications',
    }),
  });
};

// 6. User: Job Application Status Update
const sendJobApplicationStatusUpdateEmail = async ({ to, applicantName, jobTitle, companyName, newStatus }) => {
  if (!to) return;
  const subject = `Application Update: ${jobTitle} at ${companyName} (${newStatus})`;
  const isAccepted = newStatus === 'Accepted';

  const bodyContent = `
    <h2 class="greeting">Hi ${applicantName},</h2>
    <p>You have an update regarding your application for <strong>${jobTitle}</strong> with <strong>${companyName}</strong>.</p>
    <div class="details-box">
      <div class="details-row"><span class="details-label">Job Role:</span><span class="details-value"><strong>${jobTitle}</strong></span></div>
      <div class="details-row"><span class="details-label">Company:</span><span class="details-value"><strong>${companyName}</strong></span></div>
      <div class="details-row"><span class="details-label">Updated Status:</span><span class="details-value" style="font-weight:700; color:${isAccepted ? '#16a34a' : '#2563eb'};">${newStatus}</span></div>
    </div>
    ${isAccepted ? `
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:16px; border-radius:8px; margin:20px 0;">
        <h3 style="margin-top:0; color:#166534;">🎉 Congratulations on your acceptance!</h3>
        <p style="margin-bottom:0; color:#166534;">You have been officially accepted for this role and added to ${companyName}'s hired team on CareerVerse!</p>
      </div>
    ` : ''}
    <p>Log in to CareerVerse to view the full details of this application.</p>
    <p>Warm regards,<br><strong>The CareerVerse Careers Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Careers" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: `Application Status Updated: ${newStatus}`,
      bodyContent,
      actionUrl: '/jobs',
      actionText: 'View Application',
    }),
  });
};

// 7. User: Connection Organization Listed a New Job
const sendConnectionNewJobEmail = async ({ to, recipientName, companyName, jobTitle, location, salary, type, jobDescription }) => {
  if (!to) return;
  const subject = `New Job Opportunity: ${companyName} posted "${jobTitle}"`;

  const bodyContent = `
    <h2 class="greeting">Hi ${recipientName},</h2>
    <p>Good news! <strong>${companyName}</strong> from your network just published a new job opening that might be a great match for you.</p>
    <div class="details-box">
      <div class="details-row"><span class="details-label">Role:</span><span class="details-value"><strong>${jobTitle}</strong></span></div>
      <div class="details-row"><span class="details-label">Organization:</span><span class="details-value"><strong>${companyName}</strong></span></div>
      <div class="details-row"><span class="details-label">Location:</span><span class="details-value">${location || 'Flexible'}</span></div>
      <div class="details-row"><span class="details-label">Type:</span><span class="details-value">${type || 'Full-time'}</span></div>
      ${salary ? `<div class="details-row"><span class="details-label">Salary:</span><span class="details-value">${salary}</span></div>` : ''}
      ${jobDescription ? `<div class="details-row"><span class="details-label">Description:</span><span class="details-value"><em>"${jobDescription.slice(0, 150)}..."</em></span></div>` : ''}
    </div>
    <p>Since you are connected, consider applying early to stand out to the hiring team.</p>
    <p>Best regards,<br><strong>The CareerVerse Careers Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Jobs" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: `New Opening at ${companyName}`,
      bodyContent,
      actionUrl: '/jobs',
      actionText: 'View Job & Apply',
    }),
  });
};

// 8. User: Post Deleted by Admin
const sendPostDeletedByAdminEmail = async ({ to, recipientName, reason, postSnippet }) => {
  if (!to) return;
  const subject = 'Notice: Your post on CareerVerse was removed by Administrator';

  const bodyContent = `
    <h2 class="greeting">Hi ${recipientName},</h2>
    <p>This is to inform you that one of your recent posts on CareerVerse has been removed by a platform administrator following community moderation.</p>
    ${postSnippet ? `
      <div class="details-box">
        <div class="details-row"><span class="details-label">Removed Post:</span><span class="details-value"><em>"${postSnippet}"</em></span></div>
      </div>
    ` : ''}
    <div class="reason-box">
      <strong>Reason for Deletion provided by Admin:</strong>
      <p style="margin:8px 0 0 0;">${reason || 'Violation of CareerVerse content guidelines or community policies.'}</p>
    </div>
    <p>Please review our community guidelines to keep our professional ecosystem safe and respectful.</p>
    <p>Sincerely,<br><strong>CareerVerse Administration Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Admin" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: 'Post Moderation Notice',
      bodyContent,
      actionUrl: '/home',
      actionText: 'Return to Feed',
    }),
  });
};

// 9. User: User Account Deleted by Admin
const sendUserDeletedByAdminEmail = async ({ to, recipientName, reason }) => {
  if (!to) return;
  const subject = 'Notice: Your CareerVerse account has been terminated by Administrator';

  const bodyContent = `
    <h2 class="greeting">Hello ${recipientName},</h2>
    <p>This email is an official notice that your CareerVerse user account and associated profile data have been permanently removed by an administrator.</p>
    <div class="reason-box">
      <strong>Reason for Account Deletion:</strong>
      <p style="margin:8px 0 0 0;">${reason || 'Account termination following terms of service violation or administrative decision.'}</p>
    </div>
    <p>If you have questions regarding this decision, you may reach out to platform administrators by replying to this email.</p>
    <p>Regards,<br><strong>CareerVerse Administration</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Admin" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: 'Account Termination Notice',
      bodyContent,
    }),
  });
};

// 10. Organization: Job Listed Confirmation
const sendJobListedOrgEmail = async ({ to, companyName, jobTitle, location, salary, type, description }) => {
  if (!to) return;
  const subject = `Job Listing Confirmed: ${jobTitle} is now live on CareerVerse`;

  const bodyContent = `
    <h2 class="greeting">Hello ${companyName} Hiring Team,</h2>
    <p>Your job listing for <strong>${jobTitle}</strong> is now live and accepting applications on CareerVerse!</p>
    <div class="details-box">
      <div class="details-row"><span class="details-label">Position:</span><span class="details-value"><strong>${jobTitle}</strong></span></div>
      <div class="details-row"><span class="details-label">Location:</span><span class="details-value">${location}</span></div>
      <div class="details-row"><span class="details-label">Type:</span><span class="details-value">${type || 'Full-time'}</span></div>
      ${salary ? `<div class="details-row"><span class="details-label">Salary:</span><span class="details-value">${salary}</span></div>` : ''}
      ${description ? `<div class="details-row"><span class="details-label">Overview:</span><span class="details-value"><em>${description.slice(0, 180)}...</em></span></div>` : ''}
    </div>
    <p>You will receive email notifications as candidates apply with their resume PDFs attached.</p>
    <p>Happy hiring!<br><strong>The CareerVerse Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Careers" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: 'Job Listing Published 🚀',
      bodyContent,
      actionUrl: '/dashboard',
      actionText: 'Manage Job on Dashboard',
    }),
  });
};

// 11. Organization: Job Application Received (with Resume PDF attached)
const sendJobApplicationReceivedOrgEmail = async ({
  to,
  companyName,
  jobTitle,
  applicantName,
  applicantEmail,
  applicantHeadline,
  applicantPhone,
  coverLetter,
  resumePath,
  resumeFileName,
}) => {
  if (!to) return;
  const subject = `New Application: ${applicantName} applied for ${jobTitle}`;

  const bodyContent = `
    <h2 class="greeting">Hello ${companyName} Recruitment Team,</h2>
    <p>You have received a new application for your listing <strong>${jobTitle}</strong> on CareerVerse!</p>
    <div class="details-box">
      <div class="details-row"><span class="details-label">Position:</span><span class="details-value"><strong>${jobTitle}</strong></span></div>
      <div class="details-row"><span class="details-label">Applicant:</span><span class="details-value"><strong>${applicantName}</strong></span></div>
      <div class="details-row"><span class="details-label">Email:</span><span class="details-value"><a href="mailto:${applicantEmail}">${applicantEmail}</a></span></div>
      ${applicantHeadline ? `<div class="details-row"><span class="details-label">Headline:</span><span class="details-value">${applicantHeadline}</span></div>` : ''}
      ${applicantPhone ? `<div class="details-row"><span class="details-label">Phone:</span><span class="details-value">${applicantPhone}</span></div>` : ''}
      ${coverLetter ? `<div class="details-row"><span class="details-label">Cover Note:</span><span class="details-value">"${coverLetter}"</span></div>` : ''}
    </div>
    <p><strong>Resume:</strong> The applicant's resume PDF is attached to this email. You can also view their complete profile and update application status from your organization dashboard.</p>
    <p>Best regards,<br><strong>The CareerVerse Recruitment Portal</strong></p>
  `;

  const attachments = [];
  try {
    if (resumePath) {
      if (resumePath.startsWith('/uploads/')) {
        const fullDiskPath = path.join(__dirname, '..', resumePath.replace(/^\//, ''));
        if (fs.existsSync(fullDiskPath)) {
          attachments.push({
            filename: resumeFileName || `${applicantName.replace(/\s+/g, '_')}_Resume.pdf`,
            path: fullDiskPath,
            contentType: 'application/pdf',
          });
        }
      } else if (resumePath.startsWith('data:') && resumePath.includes('base64,')) {
        const base64Data = resumePath.split('base64,')[1];
        if (base64Data) {
          attachments.push({
            filename: resumeFileName || `${applicantName.replace(/\s+/g, '_')}_Resume.pdf`,
            content: Buffer.from(base64Data, 'base64'),
            contentType: 'application/pdf',
          });
        }
      }
    }
  } catch (attErr) {
    console.warn('[EmailService] Resume attachment handling error:', attErr.message);
  }

  return sendMailSafe({
    from: '"CareerVerse Applications" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: `New Application for ${jobTitle}`,
      bodyContent,
      actionUrl: '/dashboard',
      actionText: 'View Applicant on Dashboard',
    }),
    attachments,
  });
};

// 12. Organization: Candidate Accepted / Hired
const sendCandidateHiredOrgEmail = async ({ to, companyName, candidateName, candidateEmail, jobTitle, salary }) => {
  if (!to) return;
  const subject = `Candidate Hired: ${candidateName} added to Hired from CareerVerse`;

  const bodyContent = `
    <h2 class="greeting">Congratulations ${companyName} Team! 🎊</h2>
    <p>You have accepted <strong>${candidateName}</strong> for the position of <strong>${jobTitle}</strong>. They have now been added to your official <strong>"Hired from CareerVerse"</strong> employee records.</p>
    <div class="details-box">
      <div class="details-row"><span class="details-label">Hired Candidate:</span><span class="details-value"><strong>${candidateName}</strong></span></div>
      <div class="details-row"><span class="details-label">Candidate Email:</span><span class="details-value">${candidateEmail}</span></div>
      <div class="details-row"><span class="details-label">Job Title:</span><span class="details-value"><strong>${jobTitle}</strong></span></div>
      ${salary ? `<div class="details-row"><span class="details-label">Salary:</span><span class="details-value">${salary}</span></div>` : ''}
      <div class="details-row"><span class="details-label">Status:</span><span class="details-value" style="color:#16a34a; font-weight:700;">Hired & Active</span></div>
    </div>
    <p>You can view and manage all your hired candidates in the "Hired Employees" section of your organization dashboard.</p>
    <p>Wishing your team continued success!<br><strong>The CareerVerse Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Careers" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: 'Candidate Successfully Hired! 🎉',
      bodyContent,
      actionUrl: '/hired',
      actionText: 'View Hired Employees Directory',
    }),
  });
};

// 13. Organization: Job Deleted by Admin
const sendJobDeletedByAdminEmail = async ({ to, companyName, jobTitle, reason }) => {
  if (!to) return;
  const subject = `Notice: Listed job "${jobTitle}" removed by Administrator`;

  const bodyContent = `
    <h2 class="greeting">Hello ${companyName} Team,</h2>
    <p>This is a notice that your listed opening for <strong>"${jobTitle}"</strong> has been removed from CareerVerse by an administrator.</p>
    <div class="details-box">
      <div class="details-row"><span class="details-label">Job Title:</span><span class="details-value"><strong>${jobTitle}</strong></span></div>
      <div class="details-row"><span class="details-label">Organization:</span><span class="details-value"><strong>${companyName}</strong></span></div>
    </div>
    <div class="reason-box">
      <strong>Reason for Job Listing Deletion:</strong>
      <p style="margin:8px 0 0 0;">${reason || 'Listing does not comply with CareerVerse moderation guidelines or terms of service.'}</p>
    </div>
    <p>If you believe this was an error, feel free to contact administration or submit a compliant listing.</p>
    <p>Sincerely,<br><strong>CareerVerse Administration Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Admin" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: 'Job Listing Moderation Notice',
      bodyContent,
      actionUrl: '/dashboard',
      actionText: 'Go to Dashboard',
    }),
  });
};

// 14. Organization: Organization Deleted by Admin
const sendOrgDeletedByAdminEmail = async ({ to, companyName, reason }) => {
  if (!to) return;
  const subject = `Notice: Organization account "${companyName}" terminated by Administrator`;

  const bodyContent = `
    <h2 class="greeting">Hello ${companyName} Representatives,</h2>
    <p>This email is an official communication that your organization account and all posted jobs have been removed from CareerVerse by an administrator.</p>
    <div class="reason-box">
      <strong>Reason for Organization Deletion:</strong>
      <p style="margin:8px 0 0 0;">${reason || 'Account termination following organizational compliance review or administrative action.'}</p>
    </div>
    <p>If you have any questions or require clarification, please reply to this email.</p>
    <p>Regards,<br><strong>CareerVerse Platform Administration</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Admin" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: 'Organization Account Terminated',
      bodyContent,
    }),
  });
};

// 15. Admin: Custom Email to User or Org
const sendCustomAdminEmail = async ({ to, recipientName, subject, message }) => {
  if (!to) return;
  const bodyContent = `
    <h2 class="greeting">Hello ${recipientName || 'Member'},</h2>
    <p>You have received an official message from the <strong>CareerVerse Administration Team</strong>:</p>
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:20px; margin:20px 0; font-size:15px; color:#1e293b; white-space:pre-wrap;">${message}</div>
    <p>If you need to take action or have questions, you may reply to this email or sign in to your CareerVerse account.</p>
    <p>Warm regards,<br><strong>CareerVerse Administration Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Admin" <careerverse999@gmail.com>',
    to,
    subject: subject || 'Message from CareerVerse Administration',
    html: renderEmailTemplate({
      title: subject || 'Message from CareerVerse Administration',
      headline: 'Official Administrative Communication',
      bodyContent,
      actionUrl: '/home',
      actionText: 'Open CareerVerse',
    }),
  });
};

// 16. Forgot & Reset Password Emails
const sendPasswordResetEmail = async ({ to, recipientName, resetUrl }) => {
  if (!to) return;
  const subject = 'Reset Your CareerVerse Password 🔑';

  const bodyContent = `
    <h2 class="greeting">Hi ${recipientName || 'there'},</h2>
    <p>We received a request to reset the password for your CareerVerse account registered with <strong>${to}</strong>.</p>
    <p>You can securely reset your password by clicking the button below:</p>
    <div class="details-box">
      <div class="details-row"><span class="details-label">Registered Email:</span><span class="details-value">${to}</span></div>
      <div class="details-row"><span class="details-label">Link Validity:</span><span class="details-value">1 hour from request</span></div>
    </div>
    <p>If you did not request this, you can safely ignore this email — your password will remain unchanged.</p>
    <p>Best regards,<br><strong>The CareerVerse Security Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Security" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: 'Password Reset Request',
      bodyContent,
      actionUrl: resetUrl,
      actionText: 'Reset My Password',
    }),
  });
};

const sendPasswordResetSuccessEmail = async ({ to, recipientName }) => {
  if (!to) return;
  const subject = 'Your CareerVerse Password Has Been Reset Successfully ✅';

  const bodyContent = `
    <h2 class="greeting">Hi ${recipientName || 'there'},</h2>
    <p>This is a confirmation that the password for your CareerVerse account (<strong>${to}</strong>) has been successfully updated.</p>
    <div class="details-box">
      <div class="details-row"><span class="details-label">Account Email:</span><span class="details-value">${to}</span></div>
      <div class="details-row"><span class="details-label">Timestamp:</span><span class="details-value">${new Date().toLocaleString()}</span></div>
      <div class="details-row"><span class="details-label">Status:</span><span class="details-value" style="color:#16a34a; font-weight:600;">Secured</span></div>
    </div>
    <p>You can now sign in using your new password. If you didn't initiate this change, please contact us immediately.</p>
    <p>Best regards,<br><strong>The CareerVerse Security Team</strong></p>
  `;

  return sendMailSafe({
    from: '"CareerVerse Security" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: 'Password Changed Successfully',
      bodyContent,
      actionUrl: '/login',
      actionText: 'Sign In to CareerVerse',
    }),
  });
};

// 17. CareerVerse Verified Badge Email
const sendVerificationBadgeEmail = async ({ to, recipientName, isVerified }) => {
  if (!to) return;
  const subject = isVerified
    ? '🌟 You are CareerVerse Verified!'
    : 'CareerVerse Verification Status Update';

  const bodyContent = isVerified
    ? `
      <h2 class="greeting">Congratulations ${recipientName}! 🌟</h2>
      <p>We are excited to share that your account has officially been awarded the <strong>CareerVerse Verified Badge</strong>!</p>
      <div class="details-box">
        <div class="details-row"><span class="details-label">Status:</span><span class="details-value" style="color:#2563eb; font-weight:700;">CareerVerse Official Verified ✓</span></div>
        <div class="details-row"><span class="details-label">Date Awarded:</span><span class="details-value">${new Date().toLocaleDateString()}</span></div>
      </div>
      <p>This badge is displayed across your profile, job listings, and community posts to highlight trust and credibility.</p>
      <p>Keep shining!<br><strong>The CareerVerse Team</strong></p>
    `
    : `
      <h2 class="greeting">Hello ${recipientName},</h2>
      <p>This is an automated update that your CareerVerse Verified badge status has been changed by platform administrators.</p>
      <p>If you have questions regarding verification criteria, feel free to reach out to administration.</p>
      <p>Best regards,<br><strong>The CareerVerse Team</strong></p>
    `;

  return sendMailSafe({
    from: '"CareerVerse Team" <careerverse999@gmail.com>',
    to,
    subject,
    html: renderEmailTemplate({
      title: subject,
      headline: isVerified ? 'You are CareerVerse Verified!' : 'Verification Status Updated',
      bodyContent,
      actionUrl: '/profile',
      actionText: 'View Your Profile Badge',
    }),
  });
};

// Convenient direct aliases
const sendPostLikedEmail = (opts) => sendPostInteractionEmail({ ...opts, interactionType: 'like' });
const sendPostCommentedEmail = (opts) => sendPostInteractionEmail({ ...opts, interactionType: 'comment' });
const sendConnectionAcceptedEmail = (opts) => sendConnectionEmail({ ...opts, type: 'accepted' });
const sendConnectionRequestEmail = (opts) => sendConnectionEmail({ ...opts, type: 'request' });
const sendJobStatusUpdatedEmail = sendJobApplicationStatusUpdateEmail;
const sendConnectionPostedEmail = sendConnectionPostEmail;
const sendConnectionListedJobEmail = sendConnectionNewJobEmail;
const sendResetPasswordEmail = sendPasswordResetEmail;
const sendVerifiedBadgeEmail = sendVerificationBadgeEmail;

module.exports = {
  transporter,
  sendWelcomeEmail,
  sendPostInteractionEmail,
  sendPostLikedEmail,
  sendPostCommentedEmail,
  sendConnectionEmail,
  sendConnectionAcceptedEmail,
  sendConnectionRequestEmail,
  sendConnectionPostEmail,
  sendConnectionPostedEmail,
  sendJobApplicationSubmittedEmail,
  sendJobApplicationStatusUpdateEmail,
  sendJobStatusUpdatedEmail,
  sendConnectionNewJobEmail,
  sendConnectionListedJobEmail,
  sendPostDeletedByAdminEmail,
  sendUserDeletedByAdminEmail,
  sendJobListedOrgEmail,
  sendJobApplicationReceivedOrgEmail,
  sendCandidateHiredOrgEmail,
  sendJobDeletedByAdminEmail,
  sendOrgDeletedByAdminEmail,
  sendCustomAdminEmail,
  sendPasswordResetEmail,
  sendResetPasswordEmail,
  sendPasswordResetSuccessEmail,
  sendVerificationBadgeEmail,
  sendVerifiedBadgeEmail,
};

