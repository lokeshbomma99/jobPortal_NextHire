const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "JobPortal <noreply@jobportal.com>",
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("Email error:", err.message);
  }
};

const emailTemplates = {
  applicationReceived: (applicantName, jobTitle, companyName) => ({
    subject: `Application Received – ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#1a1a2e">Application Received! 🎉</h2>
        <p>Hi <strong>${applicantName}</strong>,</p>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received.</p>
        <p>We'll notify you as soon as the employer reviews it. Good luck!</p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
        <p style="color:#6b7280;font-size:12px">JobPortal — Find your dream job</p>
      </div>`,
  }),
  applicationStatusUpdate: (applicantName, jobTitle, status) => ({
    subject: `Application Update – ${jobTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#1a1a2e">Application Update</h2>
        <p>Hi <strong>${applicantName}</strong>,</p>
        <p>Your application for <strong>${jobTitle}</strong> has been <strong style="color:${status === "accepted" ? "#10b981" : status === "rejected" ? "#ef4444" : "#f59e0b"}">${status}</strong>.</p>
        ${status === "accepted" ? "<p>Congratulations! The employer will be in touch soon.</p>" : ""}
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
        <p style="color:#6b7280;font-size:12px">JobPortal — Find your dream job</p>
      </div>`,
  }),
  newApplicant: (employerName, applicantName, jobTitle) => ({
    subject: `New Applicant for ${jobTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#1a1a2e">New Application Received</h2>
        <p>Hi <strong>${employerName}</strong>,</p>
        <p><strong>${applicantName}</strong> has applied for your <strong>${jobTitle}</strong> position.</p>
        <a href="${process.env.CLIENT_URL}/employer/dashboard" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#6c63ff;color:white;border-radius:8px;text-decoration:none">View Applicants</a>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
        <p style="color:#6b7280;font-size:12px">JobPortal — Hire great talent</p>
      </div>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
