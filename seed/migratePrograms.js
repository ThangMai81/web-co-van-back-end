// migratePrograms.js — đặt cùng cấp seedCourses.js
require("dotenv").config();
const { connectDB } = require("./src/config/db");
const Program = require("./src/models/Program.model");

async function run() {
  await connectDB();

  // Dùng collection thô vì schema mới không còn field "name"
  const rawDocs = await Program.collection
    .find({ title: { $exists: false } })
    .toArray();

  for (const doc of rawDocs) {
    await Program.collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          title: doc.name,
          category: "workshop", // ⚠️ mặc định tạm — vào DB sửa lại đúng loại cho từng chương trình
          status: "upcoming", // ⚠️ mặc định tạm — đổi thành "past" nếu đã diễn ra
          isActive: true,
        },
        $unset: { name: "" },
      },
    );
    console.log(`✅ Đã chuyển: ${doc.name}`);
  }

  // Sau khi có title, load lại qua Mongoose để hook tự sinh slug
  const needSlug = await Program.find({ slug: { $exists: false } });
  for (const p of needSlug) {
    await p.save();
    console.log(`✅ Slug: ${p.title} -> ${p.slug}`);
  }

  process.exit(0);
}

run();
