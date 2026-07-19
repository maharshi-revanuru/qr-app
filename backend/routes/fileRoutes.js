const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");

const File = require("../models/File");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/authMiddleware");

const multer = require("multer");
const streamifier = require("streamifier");

const cloudinary = require("../config/cloudinary");
const cloudinaryStorage = require("../config/cloudinaryStorage");

// ================= MULTER (Cloudinary) =================
const upload = multer({
  storage: cloudinaryStorage,
});

// Extract Cloudinary public_id from URL
function getPublicId(url) {
  if (!url) return null;

  const parts = url.split("/");
  const uploadIndex = parts.findIndex((p) => p === "upload");

  if (uploadIndex === -1) return null;

  // Remove version if present (e.g. v1751234567)
  let publicPath = parts.slice(uploadIndex + 2).join("/");

  // Remove extension
  publicPath = publicPath.replace(/\.[^/.]+$/, "");

  return publicPath;
}
// ================= UPLOAD (MULTI FILE + LOCATION) =================
router.post("/upload", auth, upload.any(), async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {

      // Cloudinary file URL
      const fileUrl = file.path;

      // Generate QR as buffer
      const qrBuffer = await QRCode.toBuffer(fileUrl);

      // Upload QR to Cloudinary
      const qrUpload = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "mana-panchayat/qrcodes",
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(qrBuffer).pipe(uploadStream);
      });

      // Safe slug
      const slug =
        file.originalname
          .split(".")[0]
          .replace(/[^a-zA-Z0-9]/g, "-")
          .toLowerCase() +
        "-" +
        Date.now();

      const newFile = await File.create({
        filename: file.originalname,
        originalName: file.originalname,
        fileUrl: fileUrl,
        qrCode: qrUpload.secure_url,
        uploadedBy: req.user.id,
        customSlug: slug,
        permissions: [],
        location:
          lat && lng
            ? {
                lat: Number(lat),
                lng: Number(lng),
              }
            : undefined,
      });

      uploadedFiles.push(newFile);
    }

    res.json(uploadedFiles);

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({
      message: err.message,
    });
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
// ================= DELETE =================
router.delete("/:id", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    if (
      file.uploadedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    // Delete uploaded file from Cloudinary
const filePublicId = getPublicId(file.fileUrl);

if (filePublicId) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalName);

  await cloudinary.uploader.destroy(filePublicId, {
    resource_type: isImage ? "image" : "raw",
  });
}

    // Delete QR image from Cloudinary
    const qrPublicId = getPublicId(file.qrCode);

    if (qrPublicId) {
      await cloudinary.uploader.destroy(qrPublicId, {
        resource_type: "image",
      });
    }

    await file.deleteOne();

    res.json({
      message: "Deleted successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;