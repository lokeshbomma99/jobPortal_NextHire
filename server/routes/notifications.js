const express = require("express");
const router = express.Router();
const { getNotifications, markRead, markOneRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getNotifications);
router.get("/unread", protect, (req, res) => res.json({ success: true, count: 0 })); // placeholder
router.put("/read-all", protect, markRead);
router.put("/:id/read", protect, markOneRead);
router.delete("/:id", protect, async (req, res) => {
  try {
    const Notification = require("../models/Notification");
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
