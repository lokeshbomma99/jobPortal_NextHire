const express = require("express");
const router = express.Router();
const {
  getProfile, updateProfile, uploadResume, uploadAvatar, uploadCompanyLogo,
  saveJob, getSavedJobs, uploadResumeMiddleware, uploadAvatarMiddleware, uploadLogoMiddleware,
} = require("../controllers/userController");
const { protect, requireRole } = require("../middleware/auth");

router.get("/profile/:id?", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/resume", protect, requireRole("seeker"), uploadResumeMiddleware, uploadResume);
router.post("/avatar", protect, uploadAvatarMiddleware, uploadAvatar);
router.post("/company-logo", protect, requireRole("employer"), uploadLogoMiddleware, uploadCompanyLogo);
router.post("/save-job/:jobId", protect, requireRole("seeker"), saveJob);
router.get("/saved-jobs", protect, requireRole("seeker"), getSavedJobs);

module.exports = router;
