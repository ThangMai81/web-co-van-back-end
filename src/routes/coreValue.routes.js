const { Router } = require("express");
const {
  createCoreValue,
  getCoreValues,
  updateCoreValue,
  deleteCoreValue,
} = require("../controllers/coreValue.controller");

const router = Router();

router.post("/", createCoreValue);
router.get("/", getCoreValues);
router.patch("/:id", updateCoreValue);
router.delete("/:id", deleteCoreValue);

module.exports = router;
