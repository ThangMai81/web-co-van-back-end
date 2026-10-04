const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  });
}

async function googleLogin(req, res) {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "Thiếu credential" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        name: payload.name || "Người dùng Google",
        avatarUrl: payload.picture,
        googleId: payload.sub,
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    setAuthCookie(res, accessToken);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    res
      .status(401)
      .json({ message: "Xác thực Google thất bại", error: err.message });
  }
}

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email này đã được đăng ký" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    setAuthCookie(res, accessToken);

    res
      .status(201)
      .json({ user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(400).json({ message: "Không thể đăng ký", error: err.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    setAuthCookie(res, accessToken);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Không thể đăng nhập", error: err.message });
  }
}

function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Đã đăng xuất" });
}

module.exports = { googleLogin, register, login, logout };
