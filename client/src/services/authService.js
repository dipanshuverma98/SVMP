import axios from "axios";

const API = "http://localhost:5000/api/auth";

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
