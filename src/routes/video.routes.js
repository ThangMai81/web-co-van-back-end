const { Router } = require("express");
const {
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,
} = require("../controllers/video.controller");

const router = Router();

router.get("/", getVideos);
router.post("/", createVideo);
router.put("/:id", updateVideo);
router.delete("/:id", deleteVideo);

module.exports = router;
