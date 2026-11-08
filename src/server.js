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

const DETAIL_429_DIAGNOSTIC_PATHS = {
  fansipan: "/api/programs/chinh-phuc-fansipan-noc-nha-dong-duong",
  course: "/api/courses/khai-tam-dinh-vi",
};
const DETAIL_429_DIAGNOSTIC_MAX_WINDOW_MS = 30 * 60 * 1000;
const DETAIL_429_DIAGNOSTIC_MAX_REQUESTS = 20;

let detail429DiagnosticRequestCount = 0;

function parseDiagnosticUtcInstant(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)
  ) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;

  const canonical = new Date(timestamp).toISOString().replace(".000Z", "Z");
  return canonical === value ? timestamp : null;
}

function selectedDetail429DiagnosticPath(req) {
  if (req.method !== "GET") return null;

  const target = process.env.DETAIL_429_DIAG_TARGET;
  if (target !== "fansipan" && target !== "course") return null;

  const path = DETAIL_429_DIAGNOSTIC_PATHS[target];
  if (req.path !== path) return null;

  const start = parseDiagnosticUtcInstant(
    process.env.DETAIL_429_DIAG_START_UTC,
  );
  const end = parseDiagnosticUtcInstant(process.env.DETAIL_429_DIAG_END_UTC);
  if (
    start === null ||
    end === null ||
    end <= start ||
    end - start > DETAIL_429_DIAGNOSTIC_MAX_WINDOW_MS
  ) {
    return null;
  }

  const now = Date.now();
  return start <= now && now < end ? path : null;
}

function readDiagnosticRequestHeader(req, name) {
  const value = req.get(name);
  if (value === undefined) return null;
  if (typeof value !== "string" || Array.from(value).length > 128) {
    return "invalid";
  }

  const normalized = value.replace(/^[ \t]+|[ \t]+$/g, "");
  if (
    normalized.length === 0 ||
    /[\u0000-\u001f\u007f-\u009f]/.test(normalized)
  ) {
    return "invalid";
  }

  if (name === "Rndr-Id") {
    return /^(?:[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.test(
      normalized,
    )
      ? normalized.toLowerCase()
      : "invalid";
  }

  if (name === "CF-Ray") {
    const match = /^([a-f0-9]{16})-([a-z]{3})$/i.exec(normalized);
    return match
      ? `${match[1].toLowerCase()}-${match[2].toUpperCase()}`
      : "invalid";
  }

  return "invalid";
}

function emitDetail429Diagnostic(record) {
  try {
    console.info("[detail-429-diagnostic]", record);
  } catch {
    // Optional diagnostics must not change the API response behavior.
  }
}

app.use((req, res, next) => {
  const path = selectedDetail429DiagnosticPath(req);
  if (
    path === null ||
    detail429DiagnosticRequestCount >= DETAIL_429_DIAGNOSTIC_MAX_REQUESTS
  ) {
    return next();
  }

  detail429DiagnosticRequestCount += 1;
  const headers = {
    "Rndr-Id": readDiagnosticRequestHeader(req, "Rndr-Id"),
    "CF-Ray": readDiagnosticRequestHeader(req, "CF-Ray"),
  };
  const requestFields = {
    path,
    method: "GET",
    ...headers,
  };

  emitDetail429Diagnostic({
    event: "detail-429-backend-arrival",
    time: new Date().toISOString(),
    ...requestFields,
  });

  let outcomeRecorded = false;
  const recordOutcome = (outcome, status) => {
    if (outcomeRecorded) return;
    outcomeRecorded = true;

    emitDetail429Diagnostic({
      event: "detail-429-backend-outcome",
      time: new Date().toISOString(),
      ...requestFields,
      outcome,
      ...(status === undefined ? {} : { status }),
    });
  };

  res.once("finish", () => recordOutcome("finish", res.statusCode));
  res.once("close", () => {
    if (!res.writableFinished) recordOutcome("closed_without_finish");
  });

  next();
});

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
