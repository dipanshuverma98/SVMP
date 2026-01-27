const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"SVMP" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your SVMP Login OTP",
    html: `
      <h2>Your OTP: ${otp}</h2>
      <p>Valid for 5 minutes.</p>
    `,
  });
};

module.exports = { sendOtpEmail };
