const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sunshine-center/testimonials", // ảnh sẽ được nhóm vào folder này trên Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }], // tự resize, tránh ảnh quá nặng
  },
});

const upload = multer({ storage });

module.exports = upload;
