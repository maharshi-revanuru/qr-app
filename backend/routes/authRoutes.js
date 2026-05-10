const router = require("express").Router();

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const {
  register,
  login,
} = require("../controllers/authController");

// ================= REGISTER =================
router.post("/register", register);

// ================= LOGIN =================
router.post("/login", login);

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 🔥 GENERATE TOKEN
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    user.resetPasswordToken = resetToken;

    user.resetPasswordExpire =
      Date.now() + 1000 * 60 * 15;

    await user.save();

    // 🔥 RESET LINK
    const resetLink =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // 🔥 SEND EMAIL
    await sendEmail(
      email,
      "Reset Your Password",
      `
      <h2>Password Reset</h2>

      <p>Click below to reset your password:</p>

      <a href="${resetLink}">
        Reset Password
      </a>
      `
    );

    res.json({
      message:
        "Password reset email sent ✅",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message,
    });

  }
});

// ================= RESET PASSWORD =================
router.post(
  "/reset-password/:token",
  async (req, res) => {

    try {

      const user = await User.findOne({
        resetPasswordToken:
          req.params.token,

        resetPasswordExpire: {
          $gt: Date.now(),
        },
      });

      if (!user) {
        return res.status(400).json({
          message:
            "Invalid or expired token",
        });
      }

      // 🔥 HASH PASSWORD
      const hashed =
        await bcrypt.hash(
          req.body.password,
          10
        );

      user.password = hashed;

      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;

      await user.save();

      res.json({
        message:
          "Password reset successful ✅",
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: err.message,
      });

    }
  }
);

module.exports = router;
