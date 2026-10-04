const Course = require("../models/Course.model");
const CourseDetail = require("../models/CourseDetail.model");
const Review = require("../models/Review.model");

// POST /api/courses/:id/reviews — req.userId lấy từ middleware `protect`
async function addReview(req, res) {
  try {
    const { rating, comment } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course)
      return res.status(404).json({ message: "Không tìm thấy khóa học" });

    const review = await Review.create({
      course: course._id,
      user: req.userId,
      rating,
      comment,
    });

    // Cập nhật lại điểm trung bình trên CourseDetail (nếu có)
    const stats = await Review.aggregate([
      { $match: { course: course._id } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    await CourseDetail.findOneAndUpdate(
      { course: course._id },
      { ratingAverage: stats[0]?.avg || 0, ratingCount: stats[0]?.count || 0 },
    );

    const populated = await review.populate("user", "name avatarUrl");
    res.status(201).json({ data: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Bạn đã đánh giá khóa học này rồi" });
    }
    res
      .status(400)
      .json({ message: "Không thể gửi đánh giá", error: err.message });
  }
}

module.exports = { addReview };
