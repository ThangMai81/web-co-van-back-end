const Course = require("../models/Course.model");
const CourseDetail = require("../models/CourseDetail.model");
const Review = require("../models/Review.model");

// GET /api/courses — danh sách cơ bản, dùng cho trang /courses
// GET /api/courses?category=coach&sort=rating-desc&search=khai
async function getCourses(req, res) {
  try {
    const { category, sort, search } = req.query;

    const courseFilter = { isActive: true };
    if (search) courseFilter.title = { $regex: search, $options: "i" };

    const courses = await Course.find(courseFilter).sort({ createdAt: -1 });
    const courseIds = courses.map((c) => c._id);

    const detailFilter = { course: { $in: courseIds } };
    if (category) detailFilter.category = category;
    const details = await CourseDetail.find(detailFilter);
    const detailMap = new Map(details.map((d) => [d.course.toString(), d]));

    let merged = courses
      .filter((c) => !category || detailMap.has(c._id.toString())) // lọc theo category nếu có chọn
      .map((c) => {
        const d = detailMap.get(c._id.toString());
        return {
          _id: c._id,
          title: c.title,
          slug: c.slug,
          slogan: c.slogan,
          schedule: c.schedule,
          format: c.format,
          targetAudience: c.targetAudience,
          thumbnail: d?.thumbnail || null,
          category: d?.category || null,
          price: d?.price ?? 0,
          instructor: d?.instructor || null,
          ratingAverage: d?.ratingAverage ?? 0,
          ratingCount: d?.ratingCount ?? 0,
        };
      });

    const sortFns = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      "rating-desc": (a, b) => b.ratingAverage - a.ratingAverage,
    };
    if (sort && sortFns[sort]) merged = merged.sort(sortFns[sort]);

    res.json({ data: merged });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

// GET /api/courses/:slug — ghép Course + CourseDetail + Review + chương trình tương tự
async function getCourseBySlug(req, res) {
  try {
    const course = await Course.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    const detail = await CourseDetail.findOne({ course: course._id });

    const [reviews, ratingRaw, related] = await Promise.all([
      Review.find({ course: course._id })
        .populate("user", "name avatarUrl")
        .sort({ createdAt: -1 }),
      Review.aggregate([
        { $match: { course: course._id } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
      detail?.category
        ? CourseDetail.find({
            category: detail.category,
            course: { $ne: course._id },
          })
            .limit(4)
            .populate("course")
        : [],
    ]);

    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: ratingRaw.find((r) => r._id === star)?.count || 0,
    }));

    const relatedCourses = related
      .filter((d) => d.course) // phòng trường hợp course gốc bị xóa
      .map((d) => ({
        _id: d.course._id,
        title: d.course.title,
        slug: d.course.slug,
        format: d.course.format,
        thumbnail: d.thumbnail,
        price: d.price,
        instructor: d.instructor,
        ratingAverage: d.ratingAverage,
        ratingCount: d.ratingCount,
      }));

    res.json({
      data: { course, detail, reviews, ratingBreakdown, relatedCourses },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

async function createCourse(req, res) {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ data: course });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }
    res
      .status(400)
      .json({ message: "Không thể tạo khóa học", error: err.message });
  }
}

async function updateCourse(req, res) {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course)
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json({ data: course });
  } catch (err) {
    res.status(400).json({ message: "Không thể cập nhật", error: err.message });
  }
}

async function deleteCourse(req, res) {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!course)
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json({ message: "Đã ẩn khóa học" });
  } catch (err) {
    res.status(400).json({ message: "Không thể xóa", error: err.message });
  }
}

module.exports = {
  getCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
};
