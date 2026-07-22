const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");
const File = require("./models/File");

// SOCKET.IO
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// 🔥 SOCKET SETUP
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });
});

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// STATIC FILES
const fs = require("fs");

const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ================= 🔥 CUSTOM URL (IMPORTANT) =================
app.get("/f/:slug", async (req, res) => {
  try {
    const file = await File.findOne({ customSlug: req.params.slug });

    if (!file) {
      return res.status(404).send("Link not found");
    }

    return res.redirect(file.fileUrl);

  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("QR File Manager API Running...");
});

// START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});