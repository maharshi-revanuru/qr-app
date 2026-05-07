const router = require("express").Router();
const User = require("../models/User");
const File = require("../models/File");
const auth = require("../middleware/authMiddleware");

// ================================
// 🔒 ADMIN CHECK MIDDLEWARE
// ================================
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// ================================
// 👥 GET ALL USERS (NEW API)
// ================================
router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // hide password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;