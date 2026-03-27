const express = require("express");
const router = express.Router();
const { getStats, getUsers, toggleUserStatus, toggleJobFeatured, deleteUser, getUserDetails } = require("../controllers/adminController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect, requireRole("admin"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id/toggle", toggleUserStatus);
router.delete("/users/:id", deleteUser);
router.put("/jobs/:id/featured", toggleJobFeatured);

module.exports = router;
