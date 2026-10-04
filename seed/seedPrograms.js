require("dotenv").config();
const { connectDB } = require("../src/config/db"); // chỉnh path require cho khớp project bạn
const Program = require("../src/models/Program.model");
const programs = require("./programs.json");

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function seed() {
  await connectDB();

  await Program.deleteMany({}); // xóa dữ liệu Program cũ — bỏ dòng này nếu không muốn mất data hiện có
  const result = await Program.insertMany(programs);

  console.log(`✅ Đã thêm ${result.length} chương trình demo`);
  result.forEach((p) =>
    console.log(`   - [${p.category}/${p.status}] ${p.title} -> ${p.slug}`),
  );

  process.exit(0);
}

seed();
