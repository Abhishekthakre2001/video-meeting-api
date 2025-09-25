import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join", ({ roomId, username }) => {
    socket.join(roomId);
    socket.to(roomId).emit("new-user", { socketId: socket.id, username });
    console.log(`👤 ${username} (${socket.id}) joined room ${roomId}`);
  });

  socket.on("offer", ({ roomId, offer, to }) => {
    io.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ roomId, answer, to }) => {
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("candidate", ({ roomId, candidate, to }) => {
    io.to(to).emit("candidate", { candidate, from: socket.id });
  });

  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user-disconnected", socket.id);
    console.log(`👋 User ${socket.id} left ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    // Notify all rooms this user was part of
    io.emit("user-disconnected", socket.id);
  });

  socket.on("end-room", (roomId) => {
    io.to(roomId).emit("end-room");
    io.in(roomId).socketsLeave(roomId);
    console.log(`🚪 Room ${roomId} ended by host`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Signaling server running on http://localhost:${PORT}`)
);
