const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    googleId: { type: String },
    password: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    resetPasswordRequestedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = model("User", userSchema);
