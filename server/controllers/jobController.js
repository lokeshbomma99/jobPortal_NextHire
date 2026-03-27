const Job = require("../models/Job");
const User = require("../models/User");

// Try to load Application model — may not exist in old server
let Application;
try { Application = require("../models/Application"); } catch (e) { Application = null; }

// ─── Get all jobs ─────────────────────────────────────────────────────────────
exports.getJobs = async (req, res) => {
  try {
    const {
      search, location, type, jobType, category, experience, experienceLevel,
      locationType, isRemote, salaryMin, salaryMax,
      page = 1, limit = 12, sort = "-createdAt",
    } = req.query;

    const query = { status: "active" };
    if (search) query.$text = { $search: search };
    if (location) query.location = { $regex: location, $options: "i" };
    // support both old (type) and new (jobType) field names
    if (type) query.jobType = type;
    if (jobType) query.jobType = jobType;
    if (category) query.industry = { $regex: category, $options: "i" };
    if (experience) query.experienceLevel = experience;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (isRemote === "true" || locationType === "remote") query.isRemote = true;
    if (salaryMin) query.salaryMin = { $gte: parseInt(salaryMin) };
    if (salaryMax) query.salaryMax = { $lte: parseInt(salaryMax) };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("employer", "name avatar companyName companyLogo")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(query),
    ]);

    res.json({ success: true, jobs, total, pages: Math.ceil(total / limit), page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Get single job ───────────────────────────────────────────────────────────
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("employer", "name avatar companyName companyLogo companyWebsite companyDescription industry");
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.views = (job.views || 0) + 1;
    await job.save({ validateBeforeSave: false });

    let hasApplied = false;
    let isSaved = false;
    if (req.user) {
      if (Application) {
        hasApplied = !!(await Application.findOne({ job: job._id, applicant: req.user._id }));
      } else {
        hasApplied = job.applications?.some(
          (a) => a.applicant?.toString() === req.user._id.toString()
        );
      }
      // Check if job is saved
      const User = require("../models/User");
      const user = await User.findById(req.user._id);
      isSaved = user.savedJobs?.some(id => id.toString() === job._id.toString());
    }

    res.json({ success: true, job: job.toObject(), hasApplied, isSaved });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Create job ───────────────────────────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      employer: req.user._id,
      companyName: req.body.companyName || req.user.companyName,
      companyLogo: req.user.companyLogo || "",
    };
    const job = await Job.create(jobData);
    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Update job ───────────────────────────────────────────────────────────────
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });
    Object.assign(job, req.body);
    await job.save();
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Delete job ───────────────────────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });
    res.json({ success: true, message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Get employer's own jobs ───────────────────────────────────────────────────
exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort("-createdAt");
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Get featured jobs ────────────────────────────────────────────────────────
exports.getFeaturedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "active", featured: true })
      .populate("employer", "name companyLogo companyName")
      .limit(6)
      .sort("-createdAt");
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Apply to job ─────────────────────────────────────────────────────────────
exports.applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("employer", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status !== "active") return res.status(400).json({ message: "Job is no longer accepting applications" });

    // Check if already applied (embedded or Application model)
    if (Application) {
      const existing = await Application.findOne({ job: job._id, applicant: req.user._id });
      if (existing) return res.status(400).json({ message: "Already applied to this job" });
      
      const application = await Application.create({
        job: job._id,
        applicant: req.user._id,
        employer: job.employer._id,
        coverLetter: req.body.coverLetter || "",
        resume: req.user.resume || "",
        resumeOriginalName: req.user.resumeOriginalName || "",
      });
      
      // Add to job's applicants array
      if (!job.applicants) job.applicants = [];
      job.applicants.push(application._id);
      await job.save({ validateBeforeSave: false });

      // Create conversation between applicant and employer
      const { Conversation } = require("../models/Message");
      let conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, job.employer._id] },
        job: job._id,
      });
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user._id, job.employer._id],
          job: job._id,
        });
      }

      // Create notification for employer
      const Notification = require("../models/Notification");
      await Notification.create({
        recipient: job.employer._id,
        sender: req.user._id,
        type: "application_received",
        title: "New Application",
        message: `${req.user.name} applied for ${job.title}`,
        link: `/employer/dashboard`,
      });

      // Emit socket notification
      const io = req.app?.get?.("io");
      if (io) {
        io.emit("notification:receive", { 
          recipientId: job.employer._id.toString(), 
          type: "application_received",
          title: "New Application",
          message: `${req.user.name} applied for ${job.title}`
        });
      }
    } else {
      const alreadyApplied = job.applications?.some(
        (a) => a.applicant?.toString() === req.user._id.toString()
      );
      if (alreadyApplied) return res.status(400).json({ message: "Already applied to this job" });
      if (!job.applications) job.applications = [];
      job.applications.push({
        applicant: req.user._id,
        coverLetter: req.body.coverLetter || "",
        resume: req.user.resume || "",
        status: "pending",
        appliedAt: new Date(),
      });
      await job.save();
    }

    res.json({ success: true, message: "Application submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Update application status (employer) ────────────────────────────────────
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (Application) {
      const app = await Application.findOneAndUpdate(
        { _id: req.params.appId },
        { status },
        { new: true }
      ).populate("applicant", "name email").populate("job", "title");
      
      if (!app) return res.status(404).json({ message: "Application not found" });

      // Create notification for applicant
      const Notification = require("../models/Notification");
      await Notification.create({
        recipient: app.applicant._id,
        sender: req.user._id,
        type: "application_status",
        title: "Application Update",
        message: `Your application for ${app.job.title} is now ${status}`,
        link: `/applications`,
      });

      // Emit socket notification
      const io = req.app?.get?.("io");
      if (io) {
        io.emit("notification:receive", { 
          recipientId: app.applicant._id.toString(), 
          type: "application_status",
          title: "Application Update",
          message: `Your application for ${app.job.title} is now ${status}`
        });
      }

      return res.json({ success: true, application: app });
    }

    const job = await Job.findOne({ _id: req.params.jobId, employer: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });
    const app = job.applications.id(req.params.appId);
    if (!app) return res.status(404).json({ message: "Application not found" });
    app.status = status;
    await job.save();
    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Get employer applications ────────────────────────────────────────────────
exports.getEmployerApplications = async (req, res) => {
  try {
    if (Application) {
      const jobs = await Job.find({ employer: req.user._id }).select("_id title");
      const jobIds = jobs.map((j) => j._id);
      const applications = await Application.find({ job: { $in: jobIds } })
        .populate("applicant", "name email avatar headline resume skills")
        .populate("job", "title")
        .sort("-createdAt");
      return res.json({ success: true, applications });
    }

    const jobs = await Job.find({ employer: req.user._id })
      .populate("applications.applicant", "name email avatar headline resume skills")
      .sort("-createdAt");

    const applications = jobs.flatMap((job) =>
      (job.applications || []).map((app) => ({
        ...app.toObject(),
        job: { _id: job._id, title: job.title },
      }))
    );
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Get seeker applications ──────────────────────────────────────────────────
exports.getSeekerApplications = async (req, res) => {
  try {
    if (Application) {
      const applications = await Application.find({ applicant: req.user._id })
        .populate("job", "title companyName location jobType status")
        .populate("employer", "_id name email")
        .sort("-createdAt");
      return res.json({ success: true, applications });
    }

    const jobs = await Job.find({ "applications.applicant": req.user._id })
      .select("title companyName companyLogo location jobType applications employer");

    const applications = jobs.map((job) => {
      const app = job.applications.find(
        (a) => a.applicant?.toString() === req.user._id.toString()
      );
      return {
        _id: app._id,
        job: { _id: job._id, title: job.title, companyName: job.companyName, location: job.location, jobType: job.jobType },
        employer: job.employer,
        status: app.status || "pending",
        createdAt: app.createdAt,
        coverLetter: app.coverLetter,
      };
    });

    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Toggle save job ──────────────────────────────────────────────────────────
exports.toggleSaveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.id;
    const isSaved = user.savedJobs?.includes(jobId);

    if (isSaved) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
      if (!user.savedJobs) user.savedJobs = [];
      user.savedJobs.push(jobId);
    }
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, saved: !isSaved, message: isSaved ? "Job unsaved" : "Job saved" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── Get saved jobs ───────────────────────────────────────────────────────────
exports.getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedJobs",
      populate: { path: "employer", select: "name companyLogo" },
    });
    res.json({ success: true, jobs: user.savedJobs || [] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};