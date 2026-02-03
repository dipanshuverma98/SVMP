import axios from "axios";

export const getChatHistory = async (userId, token) => {
  const res = await axios.get(
    `http://localhost:5000/api/chat/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
