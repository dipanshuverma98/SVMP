const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");

const { generateOtp, hashOtp } = require("../utils/generateOtp");
const { sendOtpEmail } = require("../utils/sendEmail");

// SEND OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email required" });

  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  await Otp.deleteMany({ email });

  await Otp.create({
    email,
    otpHash,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  await sendOtpEmail(email, otp);

  res.json({ message: "OTP sent to email" });
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp, role } = req.body;

  const record = await Otp.findOne({ email });
  if (!record) return res.status(400).json({ message: "OTP expired" });

  if (record.expiresAt < Date.now())
    return res.status(400).json({ message: "OTP expired" });

  if (hashOtp(otp) !== record.otpHash)
    return res.status(400).json({ message: "Invalid OTP" });

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      role: role || "mentee",
      isVerified: true,
    });
  }

  await Otp.deleteMany({ email });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Login successful",
    token,
    user,
  });
};
