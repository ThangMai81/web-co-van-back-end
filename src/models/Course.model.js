const { Schema, model } = require("mongoose");

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    schedule: { type: String, trim: true },
    format: { type: String, default: "Online" },
    targetAudience: { type: String, trim: true },
    highlights: { type: [String], default: [] },
    slogan: { type: String, trim: true },
    contact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      fanpage: { type: String, trim: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = model("Course", courseSchema);
