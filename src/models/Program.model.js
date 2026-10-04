const { Schema, model } = require("mongoose");
const slugify = require("../utils/slugify");

const statSchema = new Schema(
  {
    label: { type: String, required: true, trim: true }, // vd: "Độ cao", "Số ngày"
    value: { type: String, required: true, trim: true }, // vd: "3.143m", "4 ngày 3 đêm"
  },
  { _id: false },
);

const registrationSchema = new Schema(
  {
    isOpen: { type: Boolean, default: false },
    price: { type: Number },
    seatsTotal: { type: Number },
    seatsTaken: { type: Number, default: 0 },
    deadline: { type: Date },
    contactPhone: { type: String, trim: true },
  },
  { _id: false },
);

const programSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },

    category: {
      type: String,
      enum: ["trai-he", "leo-nui", "workshop", "off-chua-lanh"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "past"], // sắp diễn ra / đã diễn ra
      required: true,
      index: true,
    },

    format: { type: String, enum: ["online", "offline"], required: true },
    colorTag: { type: String, default: "#d8a73d" }, // giữ lại field cũ, dùng cho UI badge màu

    location: { type: String, trim: true },
    schedule: { type: String, required: true, trim: true }, // giữ nguyên field cũ: lịch dạng text
    dateStart: { type: Date }, // optional, để sort theo thời gian thực nếu cần

    theme: { type: String, trim: true }, // câu chủ đề/khẩu hiệu, optional (vd "Gặp gỡ chính mình")
    description: { type: String, required: true },
    highlights: { type: [String], default: [] },

    coverImage: { type: String },
    coverImagePublicId: { type: String },
    videoUrl: { type: String },
    gallery: { type: [String], default: [] },

    stats: { type: [statSchema], default: [] },

    // Chỉ có ý nghĩa khi status = "upcoming"
    registration: { type: registrationSchema, default: () => ({}) },

    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Tự sinh slug từ title nếu chưa có, tự tránh trùng lặp
programSchema.pre("validate", async function () {
  if (!this.slug && this.title) {
    const base = slugify(this.title);
    let slug = base;
    let count = 1;
    const Program = this.constructor;
    while (await Program.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${count++}`;
    }
    this.slug = slug;
  }
});

module.exports = model("Program", programSchema);
