const Message = require("../models/Message");

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(socket.user.userId);

    socket.on("send_message", async ({ toUserId, message }) => {
      const savedMessage = await Message.create({
        sender: socket.user.userId,
        receiver: toUserId,
        message,
      });

      io.to(toUserId).emit("receive_message", {
        from: socket.user.userId,
        message: savedMessage.message,
        time: savedMessage.createdAt,
      });
    });
  });
};
