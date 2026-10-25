const Coach = require("../models/Coach.model");

async function getCoaches(_req, res) {
  try {
    const coaches = await Coach.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    res.json({ data: coaches });
  } catch (err) {
    res.status(500).json({ message: "Không thể tải danh sách người đồng hành" });
  }
}

async function getCoachBySlug(req, res) {
  try {
    const coach = await Coach.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!coach) return res.status(404).json({ message: "Không tìm thấy hồ sơ người đồng hành" });
    res.json({ data: coach });
  } catch (err) {
    res.status(500).json({ message: "Không thể tải hồ sơ người đồng hành" });
  }
}

module.exports = { getCoaches, getCoachBySlug };
