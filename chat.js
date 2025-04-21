import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  },
});

const typingUsers = new Set();

io.on("connection", (socket) => {
  // console.log(`User connected: ${socket.id}`);

  socket.on("message", (data) => {
    socket.broadcast.emit("message", data);

    if (typingUsers.has(socket.id)) {
      typingUsers.delete(socket.id);
      socket.broadcast.emit("stopTyping", { userId: socket.id });
    }
  });

  socket.on("typing", () => {
    if (!typingUsers.has(socket.id)) {
      typingUsers.add(socket.id);
      socket.broadcast.emit("typing", { userId: socket.id });
    }
  });

  socket.on("stopTyping", () => {
    if (typingUsers.has(socket.id)) {
      typingUsers.delete(socket.id);
      socket.broadcast.emit("stopTyping", { userId: socket.id });
    }
  });

  socket.on("disconnect", () => {
    if (typingUsers.has(socket.id)) {
      typingUsers.delete(socket.id);
      socket.broadcast.emit("stopTyping", { userId: socket.id });
    }
  });
});

httpServer.listen(5000, () =>
  console.log("Server running at http://localhost:5000")
);
