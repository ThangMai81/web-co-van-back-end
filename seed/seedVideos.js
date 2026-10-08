require("dotenv").config();
const { connectDB } = require("../src/config/db");
const Video = require("../src/models/Video.model");
const videos = require("./videos.json");

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
async function seed() {
  await connectDB();
  await Video.deleteMany({});
  const result = await Video.insertMany(videos);
  console.log(`✅ Đã thêm ${result.length} video`);
  process.exit(0);
}

seed();
