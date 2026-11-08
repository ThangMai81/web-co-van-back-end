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

const DETAIL_429_PASSIVE_PATH =
  "/api/programs/chinh-phuc-fansipan-noc-nha-dong-duong";
const DETAIL_429_PASSIVE_MAX_DURATION_MS = 4 * 60 * 60 * 1000;
const DETAIL_429_PASSIVE_MAX_RECORDS = 10;
const DETAIL_429_PASSIVE_RNDR_ID_PATTERN =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
let detail429PassiveRecords = 0;

function parseDetail429PassiveUtc(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value || "")) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;

  const canonical = new Date(timestamp).toISOString().replace(/\.000Z$/, "Z");
  return canonical === value ? timestamp : null;
}

function readDetail429PassiveWindow() {
  if (process.env.DETAIL_429_PASSIVE_TARGET !== "fansipan") return null;

  const startAt = parseDetail429PassiveUtc(
    process.env.DETAIL_429_PASSIVE_START_UTC,
  );
  const endAt = parseDetail429PassiveUtc(
    process.env.DETAIL_429_PASSIVE_END_UTC,
  );

  if (
    startAt === null ||
    endAt === null ||
    endAt <= startAt ||
    endAt - startAt > DETAIL_429_PASSIVE_MAX_DURATION_MS
  ) {
    return null;
  }

  return { startAt, endAt };
}

function validatedDetail429PassiveRndrId(value) {
  if (value === undefined || value === null) return null;

  const trimmed = value.replace(/^[\t ]+|[\t ]+$/g, "");
  if (
    trimmed.length === 0 ||
    trimmed.length > 128 ||
    /[\u0000-\u001f\u007f]/.test(trimmed) ||
    !DETAIL_429_PASSIVE_RNDR_ID_PATTERN.test(trimmed)
  ) {
    return "invalid";
  }

  return trimmed.toLowerCase();
}

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
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.use((req, res, next) => {
  if (req.method !== "GET" || req.path !== DETAIL_429_PASSIVE_PATH) {
    return next();
  }

  const window = readDetail429PassiveWindow();
  if (!window) return next();

  res.once("finish", () => {
    if (res.statusCode !== 429 || detail429PassiveRecords >= DETAIL_429_PASSIVE_MAX_RECORDS) {
      return;
    }

    const finishedAt = Date.now();
    if (finishedAt < window.startAt || finishedAt >= window.endAt) return;

    detail429PassiveRecords += 1;
    console.warn("[detail-429-passive]", {
      timeUtc: new Date(finishedAt).toISOString(),
      path: DETAIL_429_PASSIVE_PATH,
      method: "GET",
      status: 429,
      rndrId: validatedDetail429PassiveRndrId(req.get("Rndr-Id")),
    });
  });

  next();
});

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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
