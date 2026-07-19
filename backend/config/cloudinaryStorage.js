const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "mana-panchayat/files",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

module.exports = storage;