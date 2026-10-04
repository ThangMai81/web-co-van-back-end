const path = require("path");
// 1. Load biến môi trường ĐẦU TIÊN
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// 2. Require với đường dẫn chính xác
const { connectDB } = require("../src/config/db.js");
const Course = require("../src/models/Course.model");
const CourseDetail = require("../src/models/CourseDetail.model");
const details = require("./courseDetails.json");

async function seed() {
  await connectDB();

  for (const item of details) {
    const { courseSlug, ...detailData } = item;
    const course = await Course.findOne({ slug: courseSlug });

    if (!course) {
      console.warn(`⚠️ Không tìm thấy Course slug="${courseSlug}", bỏ qua`);
      continue;
    }

    await CourseDetail.findOneAndUpdate(
      { course: course._id },
      { ...detailData, course: course._id },
      { upsert: true, new: true },
    );
    console.log(`✅ Đã tạo/cập nhật chi tiết cho: ${course.title}`);
  }

  process.exit(0);
}

seed();
