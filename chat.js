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

io.on("connection", (socket) => {
  // console.log("User connected " + socket.id);

  socket.on("message", (data) => {
    socket.broadcast.emit("message", data);
  });
});

httpServer.listen(5000, () =>
  console.log("Server running at http://localhost:5000")
);
