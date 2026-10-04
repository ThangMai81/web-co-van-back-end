const { Router } = require("express");
const {
  getPrograms,
  getProgramBySlug,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
} = require("../controllers/program.controller");
const createUploader = require("../middleware/cloudinaryUpload");

const upload = createUploader("programs");
const uploadFields = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "gallery", maxCount: 20 },
]);

const router = Router();

router.get("/", getPrograms);
router.get("/id/:id", getProgramById); // đặt trước /:slug để không bị nuốt mất
router.get("/:slug", getProgramBySlug);

router.post("/", uploadFields, createProgram);
router.patch("/:id", uploadFields, updateProgram);
router.delete("/:id", deleteProgram);

module.exports = router;
