const router = require("express").Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ VALIDATION
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // ✅ CHECK EXISTING USER
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 🔐 HASH PASSWORD
    const hashed = await bcrypt.hash(password, 10);

    // 🔑 GENERATE TOKEN
    const token = crypto.randomBytes(32).toString("hex");

    // ✅ CREATE USER
    await User.create({
      name,
      email,
      password: hashed,
      verificationToken: token,
      isVerified: false,
    });

    // 🔗 VERIFY LINK
    const link = '${process.env.CLIENT_URL}/verify/${token}';

    // 📧 SEND EMAIL
    await sendEmail(
      email,
      "Verify Your Email",
      `
      <h3>Welcome to QR Manager</h3>
      <p>Please verify your email to activate your account</p>
      <a href="${link}" style="padding:10px 20px;background:#4f46e5;color:white;border-radius:5px;text-decoration:none;">
        Verify Email
      </a>
      `
    );

    res.json({
      message: "Registered successfully. Please check your email 📩",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔐 PASSWORD CHECK
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ❗ BLOCK UNVERIFIED USERS
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email before login 📧",
      });
    }

    // ✅ SUCCESS LOGIN (you can add JWT here)
    res.json({
      message: "Login successful",
      user,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= VERIFY EMAIL =================
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token ❌");
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    // ✅ REDIRECT TO FRONTEND
    res.redirect('${process.env.CLIENT_URL}/login?verified=true');

  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;