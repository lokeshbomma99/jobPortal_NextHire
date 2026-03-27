const User = require("../models/User");
const multer = require("multer");
const { resumeStorage, avatarStorage, companyLogoStorage } = require("../config/cloudinary");

const uploadResume = multer({ storage: resumeStorage }).single("resume");
const uploadAvatar = multer({ storage: avatarStorage }).single("avatar");
const uploadLogo = multer({ storage: companyLogoStorage }).single("companyLogo");

exports.uploadResumeMiddleware = uploadResume;
exports.uploadAvatarMiddleware = uploadAvatar;
exports.uploadLogoMiddleware = uploadLogo;

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id || req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name", "phone", "location", "bio", "skills", "experience", "education",
      "portfolio", "linkedIn", "github", "companyName", "companyWebsite",
      "companyDescription", "companySize", "industry",
    ];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resume: req.file.path, resumeOriginalName: req.file.originalname },
      { new: true }
    ).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: req.file.path }, { new: true }).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.uploadCompanyLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findByIdAndUpdate(req.user._id, { companyLogo: req.file.path }, { new: true }).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.jobId;
    const idx = user.savedJobs.indexOf(jobId);
    if (idx === -1) {
      user.savedJobs.push(jobId);
    } else {
      user.savedJobs.splice(idx, 1);
    }
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, savedJobs: user.savedJobs, saved: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedJobs",
      populate: { path: "employer", select: "name companyName companyLogo" },
    });
    res.json({ success: true, savedJobs: user.savedJobs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
