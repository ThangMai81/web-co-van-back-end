const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true },
);

// Mỗi user chỉ được đánh giá 1 khóa học 1 lần
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

module.exports = model("Review", reviewSchema);
