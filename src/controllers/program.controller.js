const Program = require("../models/Program.model");

// Các field có thể được gửi dưới dạng JSON string khi upload qua multipart/form-data
const JSON_FIELDS = ["highlights", "stats", "gallery", "registration"];

function parseJsonFields(data) {
  for (const key of JSON_FIELDS) {
    if (typeof data[key] === "string") {
      try {
        data[key] = JSON.parse(data[key]);
      } catch {
        // không phải JSON hợp lệ thì giữ nguyên, để Mongoose tự báo lỗi validate
      }
    }
  }
  return data;
}

function applyUploadedFiles(req, data) {
  const coverFile = req.files?.coverImage?.[0];
  const galleryFiles = req.files?.gallery || [];

  if (coverFile) {
    data.coverImage = coverFile.path;
    data.coverImagePublicId = coverFile.filename;
  }
  if (galleryFiles.length > 0) {
    data.gallery = [
      ...(data.gallery || []),
      ...galleryFiles.map((f) => f.path),
    ];
  }
  return data;
}

// GET /api/programs?status=upcoming&category=leo-nui
async function getPrograms(req, res) {
  try {
    const { status, category, sort } = req.query;
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const sortMap = {
      "price-asc": { "registration.price": 1 },
      "price-desc": { "registration.price": -1 },
      newest: { order: 1, dateStart: -1, createdAt: -1 },
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const programs = await Program.find(filter).sort(sortOption);
    res.json({ data: programs });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

// GET /api/programs/:slug — dùng cho trang chi tiết public
async function getProgramBySlug(req, res) {
  try {
    const program = await Program.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!program) {
      return res.status(404).json({ message: "Không tìm thấy chương trình" });
    }
    res.json({ data: program });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

// GET /api/programs/id/:id — dùng cho trang quản trị (sửa theo _id thay vì slug)
async function getProgramById(req, res) {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: "Không tìm thấy chương trình" });
    }
    res.json({ data: program });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

async function createProgram(req, res) {
  try {
    const data = applyUploadedFiles(req, parseJsonFields({ ...req.body }));
    const program = await Program.create(data);
    res.status(201).json({ data: program });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }
    res
      .status(400)
      .json({ message: "Không thể tạo chương trình", error: err.message });
  }
}

async function updateProgram(req, res) {
  try {
    const data = applyUploadedFiles(req, parseJsonFields({ ...req.body }));
    const program = await Program.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!program) {
      return res.status(404).json({ message: "Không tìm thấy chương trình" });
    }
    res.json({ data: program });
  } catch (err) {
    res.status(400).json({ message: "Không thể cập nhật", error: err.message });
  }
}

// Xóa mềm — đồng bộ cách làm với Course/Testimonial, thay vì xóa hẳn khỏi DB
async function deleteProgram(req, res) {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!program) {
      return res.status(404).json({ message: "Không tìm thấy chương trình" });
    }
    res.json({ message: "Đã ẩn chương trình" });
  } catch (err) {
    res.status(400).json({ message: "Không thể xóa", error: err.message });
  }
}

module.exports = {
  getPrograms,
  getProgramBySlug,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
};
