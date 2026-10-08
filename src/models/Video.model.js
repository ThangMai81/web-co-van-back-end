const { Schema, model } = require("mongoose");

const videoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    place: { type: String, trim: true }, // vd: "Sơn La · Núi"
    youtubeId: { type: String, required: true, trim: true }, // chỉ lưu ID, không lưu URL đầy đủ
    durationLabel: { type: String, trim: true }, // vd: "04:12" — nhập tay, không tự tính
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = model("Video", videoSchema);
