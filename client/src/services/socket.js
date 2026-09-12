import { io } from "socket.io-client";
import API_URL from "../config";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(API_URL);
  }
  return socket;
};

export const connectSocket = (token) => {
  if (!socket) {
    socket = io(API_URL, {
      auth: { token },
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

