const { Router } = require("express");
const {
  getCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/course.controller");
const { addReview } = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");

const router = Router();

router.get("/", getCourses);
router.get("/:slug", getCourseBySlug);

router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

router.post("/:id/reviews", protect, addReview);

module.exports = router;
