const { Resend } = require("resend");

let resendClient;

function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Lỗi do NHÀ CUNG CẤP (Resend) chủ động từ chối gửi — khác với lỗi mạng/kết nối thật sự
class EmailProviderError extends Error {
  constructor(message, { isRateLimited = false, raw } = {}) {
    super(message);
    this.name = "EmailProviderError";
    this.isRateLimited = isRateLimited;
    this.raw = raw;
  }
}

async function sendResetPasswordEmail(toEmail, resetLink) {
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from: "Sunshine Center <onboarding@resend.dev>",
    to: toEmail,
    subject: "Đặt lại mật khẩu - Sunshine Center",
    text: `Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Sunshine Center.\n\nBấm vào liên kết sau để đặt mật khẩu mới (hiệu lực 15 phút):\n${resetLink}\n\nNếu bạn không yêu cầu điều này, hãy bỏ qua email này.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #333;">
        <p>Xin chào,</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Sunshine Center.</p>
        <p>Bấm vào liên kết sau để đặt mật khẩu mới (hiệu lực 15 phút):</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này — mật khẩu của bạn vẫn an toàn.</p>
        <p>— Sunshine Center</p>
      </div>
    `,
  });

  // ĐÂY LÀ CHỖ SỬA QUAN TRỌNG NHẤT: Resend KHÔNG throw exception khi bị từ chối,
  // nó trả về field "error" trong kết quả — code cũ bỏ sót điều này nên luôn tưởng gửi thành công.
  if (error) {
    const isRateLimited =
      error.name === "rate_limit_exceeded" || error.statusCode === 429;
    throw new EmailProviderError(
      error.message || "Nhà cung cấp email từ chối gửi",
      {
        isRateLimited,
        raw: error,
      },
    );
  }

  return data;
}

module.exports = { sendResetPasswordEmail, EmailProviderError };
