const router = require("express").Router();
const Request = require("../models/Request");
const Notification = require("../models/Notification");
const File = require("../models/File");
const auth = require("../middleware/authMiddleware");


// =======================================
// 1️⃣ USER REQUEST ACCESS
// =======================================
router.post("/:fileId", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // ❗ Prevent duplicate requests
    const existingRequest = await Request.findOne({
      file: file._id,
      user: req.user.id,
      status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Request already sent" });
    }

    const request = await Request.create({
      file: file._id,
      user: req.user.id,
    });

    // 🔔 Notify Admin
    await Notification.create({
      user: file.uploadedBy,
      message: `${req.user.email} requested access to "${file.originalName}"`,
    });

    res.json({ message: "Request sent to admin" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


// =======================================
// 2️⃣ GET NOTIFICATIONS (IMPORTANT: ABOVE /:id)
// =======================================
router.get("/notifications", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    })
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =======================================
// 3️⃣ ADMIN APPROVE / REJECT REQUEST
// =======================================
router.put("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await Request.findById(req.params.id)
      .populate("file")
      .populate("user");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    await request.save();

    // ✅ If approved → add permission
    if (status === "approved") {
      const alreadyExists = request.file.permissions.some(
        (p) =>
          p.user.toString() === request.user._id.toString()
      );

      if (!alreadyExists) {
        request.file.permissions.push({
          user: request.user._id,
          access: "view",
        });

        await request.file.save();
      }
    }

    // 🔔 Notify User
    await Notification.create({
      user: request.user._id,
      message:
        status === "approved"
          ? `✅ Admin approved your request for "${request.file.originalName}"`
          : `❌ Admin rejected your request for "${request.file.originalName}"`,
    });

    res.json({ message: "Request updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


// =======================================
// 4️⃣ GET ALL REQUESTS (ADMIN VIEW)
// =======================================
router.get("/", auth, async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("user", "email")
      .populate("file", "originalName")
      .sort({ createdAt: -1 });

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;