import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  try {
    await mongoose.connect(
      "mongodb://eyobsmax:%40Ihaveadream19@cluster0.gfzdy.mongodb.net/chatApp"
    );
    console.log("✅Connected to DB successfully");
  } catch (err) {
    console.log("can't connect to db, ", err.message);
  }
})();

const postSchema = new mongoose.Schema({
  username: String,
  message: String,
  time: String,
  isUser: Boolean,
  edited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  reactions: { type: [String], default: null },
});

const Post = mongoose.model("posts", postSchema);
export default Post;
