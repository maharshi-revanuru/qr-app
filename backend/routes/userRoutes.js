const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// ================= MULTER (PROFILE PIC) =================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, "profile-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ================= GET ALL USERS =================
router.get("/", auth, async (req, res) => {
  const users = await User.find().select("_id email name");
  res.json(users);
});

// ================= SEARCH USERS =================
router.get("/search", auth, async (req, res) => {
  const query = req.query.q;

  const users = await User.find({
    email: { $regex: query, $options: "i" },
  }).select("_id email name");

  res.json(users);
});

// ================= GET PROFILE =================
router.get("/profile", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// ================= UPDATE PROFILE =================
router.put("/profile", auth, upload.single("profilePic"), async (req, res) => {
  try {
    const { name } = req.body;

    const updateData = { name };

    if (req.file) {
      updateData.profilePic = `uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= CHANGE PASSWORD =================
router.put("/change-password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong old password" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;