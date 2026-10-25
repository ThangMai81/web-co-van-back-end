const { Schema, model } = require("mongoose");

const coachSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    initials: { type: String, required: true, trim: true },
    accent: { type: String, default: "#ffcc00" },
    quote: { type: String, required: true, trim: true },
    bio: { type: String, required: true, trim: true },
    approach: { type: String, required: true, trim: true },
    focusAreas: { type: [String], default: [] },
    sessionFee: { type: String, default: "" },
    availability: { type: [String], default: [] },
    story: { type: [String], default: [] },
    experienceYears: { type: Number, default: null },
    coachingHours: { type: Number, default: null },
    outcomes: { type: [String], default: [] },
    responseTime: { type: String, default: "" },
    bookingNoticeHours: { type: Number, default: null },
    detailsNeedConfirmation: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = model("Coach", coachSchema);
