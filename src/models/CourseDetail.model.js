const { Schema, model } = require("mongoose");

const lessonSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    format: { type: String, enum: ["online", "offline"], default: "online" },
    scheduledAt: { type: Date },
    durationHours: { type: Number, default: 0 },
  },
  { _id: false },
);

const chapterSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    lessons: { type: [lessonSchema], default: [] },
  },
  { _id: false },
);

const courseDetailSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true, // đảm bảo mỗi Course chỉ có 1 CourseDetail
    },
    category: { type: String, trim: true, index: true }, // dùng để gợi ý "chương trình tương tự"

    thumbnail: { type: String },
    thumbnailPublicId: { type: String },
    videoUrl: { type: String },

    instructor: {
      name: { type: String, trim: true },
      title: { type: String, trim: true },
      avatar: { type: String },
    },

    price: { type: Number, default: 0 },
    originalPrice: { type: Number },
    durationLabel: { type: String }, // vd: "2 tháng"
    totalDurationLabel: { type: String }, // vd: "8 tiếng"

    descriptionBullets: { type: [String], default: [] },
    benefits: { type: [String], default: [] },

    curriculum: { type: [chapterSchema], default: [] },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = model("CourseDetail", courseDetailSchema);
