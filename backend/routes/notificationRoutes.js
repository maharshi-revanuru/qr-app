const router = require("express").Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/authMiddleware");

// GET notifications
router.get("/", auth, async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json(notifications);
});

// MARK AS READ
router.put("/:id/read", auth, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ message: "Marked as read" });
});

module.exports = router;