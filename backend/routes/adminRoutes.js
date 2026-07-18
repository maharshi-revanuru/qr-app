const router = require("express").Router();
const fs = require("fs");
const path = require("path");

const User = require("../models/User");
const File = require("../models/File");
const Notification = require("../models/Notification");
const Request = require("../models/Request");

const auth = require("../middleware/authMiddleware");

// ================================
// 🔒 ADMIN CHECK MIDDLEWARE
// ================================
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  next();
};

// ================================
// 👥 GET ALL USERS
// ================================
router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// 🗑 DELETE USER
// ================================
router.delete("/users/:id", auth, isAdmin, async (req, res) => {
  try {

    // Prevent admin deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        message: "You cannot delete your own account.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Find uploaded files
    const files = await File.find({
      uploadedBy: user._id,
    });

    // Delete physical files
    for (const file of files) {

      if (file.fileUrl) {

        const uploadPath = path.join(
          __dirname,
          "..",
          file.fileUrl
        );

        if (fs.existsSync(uploadPath)) {
          fs.unlinkSync(uploadPath);
        }
      }

      if (file.qrCode) {

        const qrPath = path.join(
          __dirname,
          "..",
          file.qrCode
        );

        if (fs.existsSync(qrPath)) {
          fs.unlinkSync(qrPath);
        }
      }
    }

    // Delete database records
    await File.deleteMany({
      uploadedBy: user._id,
    });

    await Notification.deleteMany({
      user: user._id,
    });

    await Request.deleteMany({
      user: user._id,
    });

    await User.findByIdAndDelete(user._id);

    res.json({
      message: "User deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message,
    });

  }
});

// ================================
// 📊 ADMIN DASHBOARD STATS
// ================================
router.get("/stats", auth, isAdmin, async (req, res) => {
  try {

    const totalUsers = await User.countDocuments();
    const totalFiles = await File.countDocuments();

    const files = await File.find()
      .populate("uploadedBy", "email")
      .populate("permissions.user", "email");

    const accessData = files.map((file) => ({
      fileName: file.originalName,
      owner: file.uploadedBy?.email,
      usersWithAccess: file.permissions.map((p) => ({
        email: p.user?.email,
        access: p.access,
      })),
    }));

    res.json({
      totalUsers,
      totalFiles,
      accessData,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
});

module.exports = router;