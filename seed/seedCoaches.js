const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const coaches = require("./coaches.json");
const Coach = require("../src/models/Coach.model");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function seedCoaches() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Thiếu MONGODB_URI trong cấu hình backend");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  let inserted = 0;
  let alreadyPresent = 0;

  for (const coach of coaches) {
    const profileDetails = {
      image: coach.image,
      sessionFee: coach.sessionFee,
      availability: coach.availability,
      story: coach.story,
      experienceYears: coach.experienceYears,
      coachingHours: coach.coachingHours,
      outcomes: coach.outcomes,
      responseTime: coach.responseTime,
      bookingNoticeHours: coach.bookingNoticeHours,
      detailsNeedConfirmation: coach.detailsNeedConfirmation,
    };
    const newCoach = { ...coach };
    Object.keys(profileDetails).forEach((key) => delete newCoach[key]);

    const result = await Coach.updateOne(
      { slug: coach.slug },
      { $setOnInsert: newCoach, $set: profileDetails },
      { upsert: true },
    );
    if (result.upsertedCount) inserted += 1;
    else alreadyPresent += 1;
  }

  console.log(`Seed coach hoàn tất: thêm ${inserted}, đã có ${alreadyPresent}.`);
}

seedCoaches()
  .catch((err) => {
    console.error("Seed coach thất bại:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
