const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const crypto = require("crypto");
const {
  sendResetPasswordEmail,
  EmailProviderError,
} = require("../utils/email");

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

// Đổi tất cả 3 chỗ expiresIn: "7d" thành:
{
  expiresIn: "30d";
}

// Và trong setAuthCookie, đổi maxAge thành:
function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
  });
}

// Thêm hàm mới, export thêm "getMe"
async function getMe(req, res) {
  // req.userId được gắn bởi middleware `protect`
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  }
  res.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
  });
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

const RESET_COOLDOWN_MS = 60 * 1000; // 1 phút — đủ ngắn để không làm phiền người dùng thật, đủ dài để chặn gửi trùng

// POST /auth/forgot-password
async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Vui lòng nhập email" });
  }

  try {
    const user = await User.findOne({ email });

    const genericSentResponse = {
      message: "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu",
    };

    if (!user) {
      // Không tiết lộ email có tồn tại hay không
      return res.json(genericSentResponse);
    }

    // ===== LỚP 1: chủ động chặn trước, không đợi Resend từ chối =====
    if (
      user.resetPasswordRequestedAt &&
      Date.now() - user.resetPasswordRequestedAt.getTime() < RESET_COOLDOWN_MS
    ) {
      const secondsLeft = Math.ceil(
        (RESET_COOLDOWN_MS -
          (Date.now() - user.resetPasswordRequestedAt.getTime())) /
          1000,
      );
      return res.status(429).json({
        message: `Chúng tôi vừa gửi email cho bạn cách đây không lâu. Vui lòng kiểm tra hộp thư (kể cả mục Spam) trước khi yêu cầu gửi lại — hoặc thử lại sau ${secondsLeft} giây.`,
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    user.resetPasswordRequestedAt = new Date();
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    try {
      await sendResetPasswordEmail(user.email, resetLink);
    } catch (emailErr) {
      // Gửi thất bại thật sự -> rollback token để người dùng thử lại sạch sẽ
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.resetPasswordRequestedAt = undefined;
      await user.save();

      // ===== LỚP 2: phân biệt 3 trường hợp, báo đúng người dùng cần làm gì =====
      if (emailErr instanceof EmailProviderError) {
        if (emailErr.isRateLimited) {
          // Resend chủ động từ chối vì giới hạn tần suất -> không phải lỗi mạng
          return res.status(503).json({
            message:
              "Dịch vụ gửi email đang tạm giới hạn số lượt gửi. Vui lòng kiểm tra lại email trước đó (kể cả mục Spam) hoặc thử lại sau vài phút.",
          });
        }
        // Resend từ chối vì lý do khác (vd domain chưa xác thực, địa chỉ không hợp lệ...)
        return res.status(502).json({
          message:
            "Không thể gửi email lúc này do sự cố từ dịch vụ email. Vui lòng thử lại sau ít phút.",
        });
      }

      // Lỗi mạng/kết nối thật sự (timeout, mất kết nối...), không phải provider từ chối
      return res.status(502).json({
        message:
          "Không thể kết nối tới dịch vụ gửi email. Vui lòng kiểm tra mạng và thử lại.",
      });
    }

    res.json(genericSentResponse);
  } catch (err) {
    res.status(500).json({
      message: "Có lỗi xảy ra, vui lòng thử lại sau",
      error: err.message,
    });
  }
}
// POST /auth/reset-password/:token
async function resetPassword(req, res) {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Liên kết không hợp lệ hoặc đã hết hạn" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: "Đặt lại mật khẩu thành công, bạn có thể đăng nhập ngay",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Không thể đặt lại mật khẩu", error: err.message });
  }
}

module.exports = {
  googleLogin,
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
