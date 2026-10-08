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
const cookieParser = require("cookie-parser");

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

app.use(cookieParser());

app.use("/api/programs", programRoutes);
app.use("/api/core-values", coreValueRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/course-details", courseDetailRoutes);
app.use("/api/videos", videoRoutes);
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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
