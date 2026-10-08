const Video = require("../models/Video.model");

async function getVideos(req, res) {
  try {
    const videos = await Video.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });
    res.json({ data: videos });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

async function createVideo(req, res) {
  try {
    const video = await Video.create(req.body);
    res.status(201).json({ data: video });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Không thể tạo video", error: err.message });
  }
}

async function updateVideo(req, res) {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!video)
      return res.status(404).json({ message: "Không tìm thấy video" });
    res.json({ data: video });
  } catch (err) {
    res.status(400).json({ message: "Không thể cập nhật", error: err.message });
  }
}

async function deleteVideo(req, res) {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!video)
      return res.status(404).json({ message: "Không tìm thấy video" });
    res.json({ message: "Đã ẩn video" });
  } catch (err) {
    res.status(400).json({ message: "Không thể xóa", error: err.message });
  }
}

module.exports = { getVideos, createVideo, updateVideo, deleteVideo };
