const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên người chia sẻ"],
      trim: true,
    },
    quote: {
      type: String,
      trim: true,
    },
    story: {
      type: String,
      required: [true, "Vui lòng nhập nội dung câu chuyện"],
    },
    image: {
      type: String, // URL ảnh trả về từ Cloudinary
    },
    imagePublicId: {
      type: String, // public_id trên Cloudinary, dùng để xóa ảnh khi cần
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },
    isFeatured: {
      type: Boolean,
      default: false, // true = hiển thị ở trang chủ / phần collage
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
