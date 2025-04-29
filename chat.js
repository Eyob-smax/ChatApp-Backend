import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
// import { saveMessage } from "./database.js";
import cors from "cors";
// import { Message } from "./database.js";
import Post from "./database.js";

const app = express();
app.use(cors());
app.use(express.json());
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      ,
      "https://chat-app-frontend-vert-seven.vercel.app/",
      "http://127.0.0.1:5173",
    ],
  },
});

const typingUsers = new Set();

io.on("connection", (socket) => {
  socket.on("new-message", async (data) => {
    socket.broadcast.emit("new-message", data);

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

app.post("/messages", async (req, res) => {
  const { data } = req.body;
  try {
    if (!data.username || !data.message) {
      res.status(400).json({ success: false, message: "inclomplete fields" });
    }

    await Post.create(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/messages", async (req, res) => {
  const { username, message } = req.body;
  try {
    if (!username || !message) {
      res.status(400).json({ success: false, message: "inclomplete fields" });
    }

    const newMessage = await Post.create({
      username,
      message,
    });
    res.status(200).json({ success: true, message: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const messages = await Post.find();
    res.status(200).json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/delete-message/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "ID is required" });
    }
    const message = await Post.findByIdAndDelete(id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
    console.log(err);
  }
});

app.delete("/delete-all-messages", async (req, res) => {
  try {
    const { username } = req.body;
    await Post.deleteMany({ username });
    res.status(200).json({ success: true, message: "All messages deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/edit-message", async (req, res) => {
  const { editedText, id } = req.body;
  try {
    if (!editedText || !id) {
      return res
        .status(404)
        .json({ success: false, message: "Inclomplete fields" });
    }
    const message = await Post.findByIdAndUpdate(id, {
      message: editedText,
      edited: true,
    });
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }
    res.status(200).json({ success: true, message: "Message edited" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
    console.log(err);
  }
});

app.put("/react-message", async (req, res) => {
  const { reaction, id } = req.body;
  try {
    if (!reaction || !id) {
      return res
        .status(400)
        .json({ success: false, message: "incomplete fields" });
    }

    const previousPost = await Post.findById(id);
    const previousReactions = previousPost?.reactions || [];

    const message = await Post.findOneAndUpdate(id, {
      reactions: [...previousReactions, reaction],
    });

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "message not found!" });
    }

    res.status(200).json({ success: true, message: "reaction added" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: true, message: err.message });
  }
});

httpServer.listen(5000, () =>
  console.log("Server running at http://localhost:5000")
);
