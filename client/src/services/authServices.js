import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// TEMP: backend not wired yet
export const sendOtp = async (email) => {
  console.log("Sending OTP to:", email);
  return Promise.resolve();
};

export const verifyOtp = async (email, otp) => {
  console.log("Verifying OTP:", email, otp);
  return Promise.resolve({ token: "fake-jwt-token" });
};
