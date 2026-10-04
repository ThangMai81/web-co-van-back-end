const { Router } = require("express");
const {
  getTestimonials,
  getFeaturedTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonial.controller");
const upload = require("../middleware/upload.middleware");

const router = Router();

router.get("/", getTestimonials);
router.get("/featured", getFeaturedTestimonials);
router.get("/:id", getTestimonialById);

// Nên gắn thêm middleware `protect, authorize("admin")` trước 3 route dưới khi dùng thật
router.post("/", upload.single("image"), createTestimonial);
router.put("/:id", upload.single("image"), updateTestimonial);
router.delete("/:id", deleteTestimonial);

module.exports = router;
