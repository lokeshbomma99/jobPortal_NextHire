const express = require("express");
const router = express.Router();
const multer = require("multer");
const { resumeStorage } = require("../config/cloudinary");
const {
  applyJob, getSeekerApplications, getEmployerAllApplications, getJobApplications, updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect, requireRole } = require("../middleware/auth");

const upload = multer({ storage: resumeStorage });

router.post("/apply/:jobId", protect, requireRole("seeker"), upload.single("resume"), applyJob);
router.get("/mine", protect, requireRole("seeker"), getSeekerApplications);
router.get("/employer/all", protect, requireRole("employer"), getEmployerAllApplications);
router.get("/job/:jobId", protect, requireRole("employer"), getJobApplications);
router.put("/:id/status", protect, requireRole("employer"), updateApplicationStatus);

module.exports = router;
