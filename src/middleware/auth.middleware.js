const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Bạn cần đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

module.exports = { protect };
