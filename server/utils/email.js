const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"JobPortal" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
    console.log(`📧 Email sent to ${to}`);
    return true;
  } catch (err) {
    console.error("Email error:", err.message);
    return false;
  }
};

const emailTemplates = {
  applicationReceived: (employerName, jobTitle, applicantName) => ({
    subject: `New Application for ${jobTitle}`,
    html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#1a1a2e;padding:30px;text-align:center"><h1 style="color:#e94560;margin:0">JobPortal</h1></div><div style="padding:30px;background:#f9f9f9"><h2>Hello ${employerName},</h2><p><strong>${applicantName}</strong> has applied for <strong>${jobTitle}</strong>.</p><a href="${process.env.CLIENT_URL}/employer/dashboard" style="background:#e94560;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">View Application</a></div></div>`,
  }),
  applicationStatusUpdate: (seekerName, jobTitle, status, companyName) => ({
    subject: `Application Update: ${jobTitle} at ${companyName}`,
    html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#1a1a2e;padding:30px;text-align:center"><h1 style="color:#e94560;margin:0">JobPortal</h1></div><div style="padding:30px;background:#f9f9f9"><h2>Hello ${seekerName},</h2><p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> is now: <strong style="color:#e94560">${status.toUpperCase()}</strong></p><a href="${process.env.CLIENT_URL}/seeker/dashboard" style="background:#e94560;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">View Dashboard</a></div></div>`,
  }),
  welcome: (name, role) => ({
    subject: "Welcome to JobPortal!",
    html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#1a1a2e;padding:30px;text-align:center"><h1 style="color:#e94560;margin:0">JobPortal</h1></div><div style="padding:30px;background:#f9f9f9"><h2>Welcome, ${name}! 🎉</h2><p>Your account as a <strong>${role}</strong> is ready.</p><a href="${process.env.CLIENT_URL}" style="background:#e94560;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">Get Started</a></div></div>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
