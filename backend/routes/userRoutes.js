const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");
const File = require("../models/File");
const Notification = require("../models/Notification");
const Request = require("../models/Request");

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
  try {
    const users = await User.find().select(
      "_id email name role profilePic"
    );

    res.json(users);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});

// ================= SEARCH USERS =================
router.get("/search", auth, async (req, res) => {
  try {

    const query = req.query.q;

    const users = await User.find({
      email: {
        $regex: query,
        $options: "i",
      },
    }).select("_id email name role profilePic");

    res.json(users);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});

// ================= GET PROFILE =================
router.get("/profile", auth, async (req, res) => {

  try {

    const user = await User.findById(req.user.id)
      .select("-password");

    res.json(user);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }

});

// ================= UPDATE PROFILE =================
router.put(
  "/profile",
  auth,
  upload.single("profilePic"),
  async (req, res) => {

    try {

      const { name } = req.body;

      const updateData = {
        name,
      };

      if (req.file) {
        updateData.profilePic =
          `uploads/${req.file.filename}`;
      }

      const user =
        await User.findByIdAndUpdate(
          req.user.id,
          updateData,
          {
            new: true,
          }
        ).select("-password");

      res.json(user);

    } catch (err) {

      res.status(500).json({
        message: err.message,
      });

    }

  }
);

// ================= CHANGE PASSWORD =================
router.put(
  "/change-password",
  auth,
  async (req, res) => {

    try {

      const {
        oldPassword,
        newPassword,
      } = req.body;

      const user =
        await User.findById(req.user.id);

      const isMatch =
        await bcrypt.compare(
          oldPassword,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          message:
            "Wrong old password",
        });
      }

      const hashed =
        await bcrypt.hash(
          newPassword,
          10
        );

      user.password = hashed;

      await user.save();

      res.json({
        message:
          "Password updated successfully",
      });

    } catch (err) {

      res.status(500).json({
        message: err.message,
      });

    }

  }
);

// ================= DELETE USER =================
router.delete("/:id", auth, async (req, res) => {

  try {

    // Only Admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message:
          "Only admin can delete users",
      });
    }

    // Prevent self delete
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        message:
          "You cannot delete your own account.",
      });
    }

    const user =
      await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Find uploaded files
    const files =
      await File.find({
        uploadedBy: user._id,
      });

    // Delete physical files
    for (const file of files) {

      const uploadedFile =
        path.join(
          __dirname,
          "..",
          file.fileUrl
        );

      if (
        fs.existsSync(uploadedFile)
      ) {
        fs.unlinkSync(uploadedFile);
      }

      const qrImage =
        path.join(
          __dirname,
          "..",
          file.qrCode
        );

      if (
        fs.existsSync(qrImage)
      ) {
        fs.unlinkSync(qrImage);
      }

    }

    // Delete DB Records
    await File.deleteMany({
      uploadedBy: user._id,
    });

    await Notification.deleteMany({
      user: user._id,
    });

    await Request.deleteMany({
      user: user._id,
    });

    await User.findByIdAndDelete(
      user._id
    );

    res.json({
      message:
        "User deleted successfully",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message,
    });

  }

});

module.exports = router;