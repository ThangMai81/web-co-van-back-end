const Inquiry = require("../models/Inquiry.model");

async function createInquiry(req, res) {
  const { name, phone, age, concern, concernDetail, email, userId } = req.body;

  if (!name || !phone || !age || !concern || !email) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
  }

  try {
    const inquiry = await Inquiry.create({
      name,
      phone,
      age,
      concern,
      concernDetail: concernDetail || "",
      email,
      userId: userId || null,
    });
    res.status(201).json({ success: true, data: inquiry });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Không thể gửi lời quan tâm", error: err.message });
  }
}
async function getInquiries(_req, res) {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  res.json({ success: true, count: inquiries.length, data: inquiries });
}

module.exports = { createInquiry, getInquiries };
