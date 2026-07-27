const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: String,
originalName: String,
path: String,
qrCodeUrl: String,
qrCode: String,
fileUrl: String,

// Cloudinary
cloudinaryPublicId: String,
resourceType: String,

    // 🔥 NEW FIELD (CUSTOM URL)
    customSlug: {
      type: String,
      unique: true,
      sparse: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    location: {
  lat: Number,
  lng: Number,
},

    permissions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        access: {
          type: String,
          enum: ["view", "download", "edit"], // 🔥 FIXED
          default: "view",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);