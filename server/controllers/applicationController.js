const Application = require("../models/Application");
const Job = require("../models/Job");
const Notification = require("../models/Notification");
const { sendEmail, emailTemplates } = require("../utils/email");

exports.applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId).populate("employer");
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status !== "active") return res.status(400).json({ message: "This job is no longer accepting applications" });

    const exists = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (exists) return res.status(400).json({ message: "You have already applied for this job" });

    const appData = {
      job: jobId,
      applicant: req.user._id,
      employer: job.employer._id,
      coverLetter: coverLetter || "",
      resume: req.file?.path || req.user.resume || "",
      resumeOriginalName: req.file?.originalname || req.user.resumeOriginalName || "",
      statusHistory: [{ status: "pending", note: "Application submitted" }],
    };

    const application = await Application.create(appData);
    await Job.findByIdAndUpdate(jobId, { $push: { applicants: application._id } });

    // Notifications
    await Notification.create({
      recipient: job.employer._id,
      sender: req.user._id,
      type: "application_received",
      title: "New Application",
      message: `${req.user.name} applied for ${job.title}`,
      link: `/employer/applications/${application._id}`,
    });

    // Emit socket notification
    const io = req.app.get("io");
    if (io) {
      io.emit("notification:send", { recipientId: job.employer._id.toString(), type: "application_received" });
    }

    // Email
    const empEmail = emailTemplates.applicationReceived(job.employer.name, job.title, req.user.name);
    sendEmail({ to: job.employer.email, subject: empEmail.subject, html: empEmail.html });

    res.status(201).json({ success: true, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getEmployerAllApplications = async (req, res) => {
  try {
    const applications = await Application.find({ employer: req.user._id })
      .populate("applicant", "name email avatar phone skills experience resume resumeOriginalName")
      .populate("job", "title companyName location")
      .sort("-createdAt")
      .limit(100);
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSeekerApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({ path: "job", populate: { path: "employer", select: "name companyName companyLogo" } })
      .sort("-createdAt");
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const applications = await Application.find({ job: req.params.jobId })
      .populate("applicant", "name email avatar phone skills experience resume resumeOriginalName")
      .sort("-createdAt");
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, note, interviewDate } = req.body;
    const application = await Application.findById(req.params.id).populate("applicant").populate("job");
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = status;
    application.statusHistory.push({ status, note: note || "" });
    if (interviewDate) application.interviewDate = interviewDate;
    await application.save();

    // Notify applicant
    await Notification.create({
      recipient: application.applicant._id,
      sender: req.user._id,
      type: "application_status",
      title: "Application Update",
      message: `Your application for ${application.job.title} is now ${status}`,
      link: `/seeker/applications`,
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("notification:send", { recipientId: application.applicant._id.toString(), type: "application_status" });
    }

    const emailData = emailTemplates.applicationStatusUpdate(application.applicant.name, application.job.title, status, application.job.companyName);
    sendEmail({ to: application.applicant.email, subject: emailData.subject, html: emailData.html });

    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
