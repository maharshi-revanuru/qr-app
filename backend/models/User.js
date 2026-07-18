const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    profilePic: {
      type: String,
      default: "",
    },

    // ✅ NEW FIELD - User Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // ✅ Email Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    // ✅ Reset Password
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);