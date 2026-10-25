const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadRoot = path.resolve(__dirname, "../../uploads");
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const mimeExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function createUploader(folder = "misc") {
  const destination = path.join(uploadRoot, folder);
  fs.mkdirSync(destination, { recursive: true });

  const storage = multer.diskStorage({
    destination,
    filename(_req, file, callback) {
      const extension = mimeExtensions[file.mimetype] || path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter(_req, file, callback) {
      if (!allowedMimeTypes.has(file.mimetype)) {
        return callback(new Error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP"));
      }
      callback(null, true);
    },
  });
}

const upload = createUploader("testimonials");
upload.createUploader = createUploader;

module.exports = upload;
