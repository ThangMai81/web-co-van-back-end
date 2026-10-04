const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

function createUploader(folder) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `sunshine-center/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    },
  });
  return multer({ storage });
}

module.exports = createUploader;
