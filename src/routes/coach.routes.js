const { Router } = require("express");
const { getCoaches, getCoachBySlug } = require("../controllers/coach.controller");

const router = Router();

router.get("/", getCoaches);
router.get("/:slug", getCoachBySlug);

module.exports = router;
