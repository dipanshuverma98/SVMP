const Message = require("../models/message.model");

module.exports = (socket, io) => {
  // Join group/session room
  socket.on("join_room", ({ roomId }) => {
    socket.join(roomId);
  });

  // Send message
  socket.on("send_message", async ({ roomId, content, type = "text" }) => {
    const message = await Message.create({
      sender: socket.user.id,
      roomId,
      content,
      type,
    });

    io.to(roomId).emit("receive_message", message);
  });

  // Broadcast (admin/mentor)
  socket.on("broadcast", async ({ content }) => {
    if (socket.user.role === "mentee") return;

    io.to("broadcast").emit("receive_broadcast", {
      sender: socket.user.id,
      content,
    });
  });
};
