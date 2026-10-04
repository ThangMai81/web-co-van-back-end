const CoreValue = require("../models/CoreValue.model");

async function createCoreValue(req, res) {
  try {
    const item = await CoreValue.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Không thể tạo giá trị cốt lõi", error: err.message });
  }
}

async function getCoreValues(_req, res) {
  const items = await CoreValue.find().sort({ order: 1 });
  res.json(items);
}

async function updateCoreValue(req, res) {
  const item = await CoreValue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!item) {
    return res.status(404).json({ message: "Không tìm thấy giá trị cốt lõi" });
  }
  res.json(item);
}

async function deleteCoreValue(req, res) {
  const item = await CoreValue.findByIdAndDelete(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Không tìm thấy giá trị cốt lõi" });
  }
  res.json({ message: "Đã xoá" });
}

module.exports = {
  createCoreValue,
  getCoreValues,
  updateCoreValue,
  deleteCoreValue,
};
