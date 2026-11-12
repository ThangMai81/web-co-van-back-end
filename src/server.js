const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const programRoutes = require("./routes/program.routes");
const coreValueRoutes = require("./routes/coreValue.routes");
const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const testimonialRoutes = require("./routes/testimonial.routes");
const inquiryRoutes = require("./routes/inquiry.routes");
const courseDetailRoutes = require("./routes/courseDetail.routes");
const videoRoutes = require("./routes/video.routes");
const coachRoutes = require("./routes/coach.routes");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

app.set("trust proxy", 1);

// app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true || "http://localhost:3000",
  }),
);

app.use(express.json());

// Kiểm tra sống nhanh (không chạm database) — dùng cho dịch vụ "ping" giữ server luôn thức
app.get("/health", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ ok: true, uptime: Math.round(process.uptime()) });
});

// Dữ liệu công khai đọc nhiều, ít đổi: cho phép trình duyệt/CDN giữ 60 giây
app.use(["/api/programs", "/api/courses", "/api/coaches", "/api/videos", "/api/testimonials"], (req, res, next) => {
  if (req.method === "GET") {
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
  }
  next();
});

app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.use("/api/programs", programRoutes);
app.use("/api/core-values", coreValueRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/course-details", courseDetailRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/coaches", coachRoutes);
app.use("/auth", authRoutes);

const allowedOrigins = [
  process.env.FRONTEND_URL, // vd: https://sunshinecenter.vn
  "http://localhost:3000", // vẫn giữ để bạn test local song song
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

const PORT = process.env.PORT || 3001;

// Mở cổng ngay để Render nhận server đã sẵn sàng sớm hơn; Mongoose tự xếp hàng truy vấn
// cho tới khi kết nối database xong (connectDB tự thoát tiến trình nếu kết nối lỗi).
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
connectDB();
