import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // socket.on("join", (roomId) => {
  //   socket.join(roomId);
  //   console.log(`User ${socket.id} joined room ${roomId}`);
  // });

  socket.on("join", ({ roomId, username }) => {
    socket.join(roomId);
    socket.to(roomId).emit("new-user", { username });
    console.log(`👤 ${username} (${socket.id}) joined room ${roomId}`);
  });


  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Signaling server running on http://localhost:${PORT}`)
);
