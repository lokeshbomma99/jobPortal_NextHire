const express = require("express");
const router = express.Router();
const multer = require("multer");

const { register, login, getMe, updatePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { resumeStorage } = require("../config/cloudinary");
const User = require("../models/User");

const upload = multer({ storage: resumeStorage });

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/password", protect, updatePassword);

// Upload Resume
router.post("/resume", protect, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);

    user.resume = req.file.path;
    user.resumeOriginalName = req.file.originalname;

    await user.save();

    res.json({
      success: true,
      resume: user.resume,
      resumeOriginalName: user.resumeOriginalName,
    });
  } catch (err) {
    console.error("Resume upload error:", err);
    res.status(500).json({ success: false, message: "Resume upload failed" });
  }
});

module.exports = router;