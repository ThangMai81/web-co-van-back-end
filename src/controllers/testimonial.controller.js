const Testimonial = require("../models/Testimonial.model");
const cloudinary = require("../config/cloudinary");

// GET /api/testimonials - danh sách đầy đủ (cho trang /cau-chuyen-chuyen-hoa)
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .populate("program", "title slug")
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/testimonials/featured - chỉ lấy bài nổi bật (cho collage ở trang chủ)
exports.getFeaturedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      isActive: true,
      isFeatured: true,
    }).sort({
      createdAt: -1,
    });
    res
      .status(200)
      .json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/testimonials/:id - chi tiết 1 câu chuyện
exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id).populate(
      "program",
      "title slug",
    );
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy câu chuyện" });
    }
    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/testimonials - tạo mới (kèm upload ảnh qua middleware `upload.single("image")`)
exports.createTestimonial = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path; // URL Cloudinary trả về
      data.imagePublicId = req.file.filename; // public_id để xóa sau này
    }
    const testimonial = await Testimonial.create(data);
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/testimonials/:id - cập nhật (tự xóa ảnh cũ trên Cloudinary nếu có ảnh mới)
exports.updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy câu chuyện" });
    }

    const data = { ...req.body };
    if (req.file) {
      if (testimonial.imagePublicId) {
        await cloudinary.uploader.destroy(testimonial.imagePublicId);
      }
      data.image = req.file.path;
      data.imagePublicId = req.file.filename;
    }

    const updated = await Testimonial.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// DELETE /api/testimonials/:id - xóa mềm
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy câu chuyện" });
    }
    res.status(200).json({ success: true, message: "Đã ẩn câu chuyện" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
