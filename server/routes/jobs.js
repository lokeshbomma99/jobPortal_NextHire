const express = require("express");
const router = express.Router();
const {
  getJobs, getJob, createJob, updateJob, deleteJob,
  getEmployerJobs, getFeaturedJobs,
  applyToJob, updateApplicationStatus,
  getEmployerApplications, getSeekerApplications,
  toggleSaveJob, getSavedJobs,
} = require("../controllers/jobController");
const { protect, requireRole, optionalAuth } = require("../middleware/auth");

// Public
router.get("/", getJobs);
router.get("/featured", getFeaturedJobs);

// Seeker
router.get("/saved", protect, getSavedJobs);
router.get("/seeker/applications", protect, getSeekerApplications);

// Employer
router.get("/employer/mine", protect, requireRole("employer"), getEmployerJobs);
router.get("/employer/applications", protect, requireRole("employer"), getEmployerApplications);

// Single job (must come after named routes)
router.get("/:id", optionalAuth, getJob);
router.post("/", protect, requireRole("employer"), createJob);
router.put("/:id", protect, requireRole("employer"), updateJob);
router.delete("/:id", protect, deleteJob);

// Apply & Save
router.post("/:id/apply", protect, applyToJob);
router.post("/:id/save", protect, toggleSaveJob);
router.put("/:jobId/applications/:appId/status", protect, requireRole("employer"), updateApplicationStatus);

module.exports = router;