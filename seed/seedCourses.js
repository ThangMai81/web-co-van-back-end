require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../src/models/Course.model");
const courses = require("./courses.json");

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB");

    await Course.deleteMany({}); // xóa dữ liệu khóa học cũ — bỏ dòng này nếu không muốn xóa
    const result = await Course.insertMany(courses);

    console.log(`✅ Đã thêm ${result.length} khóa học vào database`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi seed dữ liệu:", error.message);
    process.exit(1);
  }
}

seed();
