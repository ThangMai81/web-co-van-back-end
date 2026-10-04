const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const Testimonial = require("../src/models/testimonial.model");
const testimonials = require("./testimonials.json");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected — bắt đầu seed testimonials...");

    await Testimonial.deleteMany({});
    console.log("Đã xoá dữ liệu testimonial cũ (nếu có).");

    const inserted = await Testimonial.insertMany(testimonials);
    console.log(`Đã thêm ${inserted.length} testimonial thành công.`);

    process.exit(0);
  } catch (err) {
    console.error("Seed testimonials thất bại:", err);
    process.exit(1);
  }
}

seed();
