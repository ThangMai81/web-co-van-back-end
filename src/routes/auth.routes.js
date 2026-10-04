const { Router } = require("express");
const {
  googleLogin,
  register,
  login,
  logout,
} = require("../controllers/auth.controller");

const router = Router();

router.post("/google", googleLogin);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
