const { Schema, model } = require("mongoose");

const coreValueSchema = new Schema(
  {
    title: { type: String, required: true },
    colorTag: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = model("CoreValue", coreValueSchema);
