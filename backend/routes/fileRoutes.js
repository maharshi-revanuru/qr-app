const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const QRCode = require("qrcode");
const fs = require("fs");

const File = require("../models/File");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/authMiddleware");

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ================= UPLOAD (MULTI FILE + LOCATION) =================
router.post("/upload", auth, upload.any(), async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const filePath = `uploads/${file.filename}`;
      const BASE_URL =
  process.env.BASE_URL ||
  "https://mana-panchayat.onrender.com";

const fullFileUrl = `${BASE_URL}/${filePath}`;

      const qrFileName = `qr-${Date.now()}-${file.filename}.png`;
      const qrPath = `uploads/${qrFileName}`;

      await QRCode.toFile(qrPath, fullFileUrl);

      // 🔥 SAFE SLUG
      const slug =
        file.originalname
          .split(".")[0]
          .replace(/[^a-zA-Z0-9]/g, "-")
          .toLowerCase() +
        "-" +
        Date.now();

      const newFile = await File.create({
        filename: file.filename,
        originalName: file.originalname,
        fileUrl: filePath,
        qrCode: qrPath,
        uploadedBy: req.user.id,
        customSlug: slug,
        permissions: [],
        location: lat && lng ? { lat, lng } : undefined, // 🔥 OPTIONAL
      });

      uploadedFiles.push(newFile);
    }

    res.json(uploadedFiles);

  } catch (err) {
    console.error("UPLOAD ERROR 👉", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= UPDATE SLUG =================
router.put("/:id/slug", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update URL" });
    }

    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({ message: "Slug required" });
    }

    const exists = await File.findOne({ customSlug: slug });
    if (exists) {
      return res.status(400).json({ message: "Slug already exists" });
    }

    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    file.customSlug = slug;
    await file.save();

    res.json({ message: "Custom URL updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= GET FILES =================
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let allFiles = [];
    let myFiles = [];

    myFiles = await File.find({ uploadedBy: userId })
      .populate("uploadedBy", "email name")
      .populate("permissions.user", "email name")
      .sort({ createdAt: -1 });

    if (role === "admin") {
      allFiles = await File.find()
        .populate("uploadedBy", "email name")
        .populate("permissions.user", "email name")
        .sort({ createdAt: -1 });
    } else {
      allFiles = await File.find({
        $or: [
          { uploadedBy: userId },
          { "permissions.user": userId },
        ],
      })
        .populate("uploadedBy", "email name")
        .populate("permissions.user", "email name")
        .sort({ createdAt: -1 });
    }

    res.json({ allFiles, myFiles });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= SHARE =================
router.put("/:id/permissions", auth, async (req, res) => {
  try {
    const { userEmail, access } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can share" });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const file = await File.findById(req.params.id);

    const exists = file.permissions.some(
      (p) => p.user.toString() === user._id.toString()
    );

    if (exists) {
      return res.status(400).json({ message: "Already has access" });
    }

    file.permissions.push({
      user: user._id,
      access: access || "view",
    });

    await file.save();

    const notification = await Notification.create({
      user: user._id,
      message: `You got access to: ${file.originalName}`,
      file: file._id,
    });

    const io = req.app.get("io");
    io.to(user._id.toString()).emit("new_notification", notification);

    res.json({ message: "Access granted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= DELETE =================
router.delete("/:id", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (
      file.uploadedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const filePath = path.join(__dirname, "..", file.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const qrPath = path.join(__dirname, "..", file.qrCode);
    if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);

    await file.deleteOne();

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;