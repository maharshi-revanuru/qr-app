const File = require("../models/File");
const QRCode = require("qrcode");

exports.uploadFile = async (req, res) => {
  try {
    const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    const qrPath = `uploads/qr-${Date.now()}.png`;

    await QRCode.toFile(qrPath, fileUrl);

    const newFile = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: fileUrl,
      size: req.file.size,
      qrCodeUrl: `${process.env.BASE_URL}/${qrPath}`,
      uploadedBy: req.user.id
    });

    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const files = await File.find().populate("uploadedBy", "name email");
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    await File.findByIdAndDelete(req.params.id);
    res.json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};