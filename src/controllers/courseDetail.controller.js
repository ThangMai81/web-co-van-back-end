const CourseDetail = require("../models/CourseDetail.model");

// PUT /api/course-details/:courseId — tạo mới nếu chưa có, cập nhật nếu đã có (upsert)
async function upsertCourseDetail(req, res) {
  try {
    const { courseId } = req.params;
    const data = { ...req.body, course: courseId };

    if (req.file) {
      data.thumbnail = req.file.path;
      data.thumbnailPublicId = req.file.filename;
    }

    const detail = await CourseDetail.findOneAndUpdate(
      { course: courseId },
      data,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    res.json({ data: detail });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Không thể lưu chi tiết khóa học", error: err.message });
  }
}

module.exports = { upsertCourseDetail };
