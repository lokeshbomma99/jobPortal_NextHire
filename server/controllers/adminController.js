const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalJobs, totalApplications, seekers, employers] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application ? Application.countDocuments() : Promise.resolve(0),
      User.countDocuments({ role: "seeker" }),
      User.countDocuments({ role: "employer" }),
    ]);
    const activeJobs = await Job.countDocuments({ status: "active" });
    res.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalApplications,
        seekers,
        employers,
        activeJobs
      }
    });
  } catch (err) {
    console.error("Error in getStats:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select("-password").sort("-createdAt").skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, data: { users, total } });
  } catch (err) {
    console.error("Error in getUsers:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleJobFeatured = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    job.featured = !job.featured;
    await job.save({ validateBeforeSave: false });
    res.json({ success: true, featured: job.featured });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent deleting admin users
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let extraData = {};
    if (user.role === "employer") {
      const jobs = await Job.find({ employer: user._id }).sort("-createdAt");
      extraData = { jobs, totalJobs: jobs.length };
    } else if (user.role === "seeker") {
      const applications = await Application.find({ user: user._id }).populate("job", "title companyName location").sort("-createdAt");
      extraData = { applications, totalApplications: applications.length };
    }

    res.json({ success: true, user, ...extraData });
  } catch (err) {
    console.error("Error in getUserDetails:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
