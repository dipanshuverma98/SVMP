const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/sendEmail");

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

// SEND OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashOtp(otp);

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otpHash,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email });
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const normalizedOtp = String(otp).trim();
    if (hashOtp(normalizedOtp) !== record.otpHash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    let user = await User.findOne({ email });
    if (!user) user = await User.create({ email, verified: true });

    await Otp.deleteMany({ email });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};
