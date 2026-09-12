import axios from "axios";
import API_URL from "../config";

const API = `${API_URL}/api/auth`;

export const sendOtp = async (email) => {
  const res = await axios.post(`${API}/send-otp`, { email });
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await axios.post(`${API}/verify-otp`, {
    email,
    otp,
  });
  return res.data;
};
