const { Router } = require("express");
const {
  createInquiry,
  getInquiries,
} = require("../controllers/inquiry.controller");

const router = Router();

router.post("/", createInquiry);
router.get("/", getInquiries);

module.exports = router;
