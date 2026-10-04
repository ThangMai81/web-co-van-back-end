const { Router } = require("express");
const {
  upsertCourseDetail,
} = require("../controllers/courseDetail.controller");
const createUploader = require("../middleware/cloudinaryUpload");

const uploadThumbnail = createUploader("courses");
const router = Router();

router.put(
  "/:courseId",
  uploadThumbnail.single("thumbnail"),
  upsertCourseDetail,
);

module.exports = router;
