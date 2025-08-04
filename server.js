// server.js

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

// Load environment variables from .env file
dotenv.config();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// ✅ Allowed frontend origins
const allowedOrigins = [
  "https://chat-app-client-beryl-five.vercel.app",
  "https://chat-app-client-git-main-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-777434ay5-bhautiks-projects-e9693610.vercel.app",
  "http://localhost:5173",
];

// 🛡️ CORS settings for Express
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// 📦 JSON parsing
app.use(express.json());

// 🌐 MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// 📂 API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/chatroom", require("./routes/chatroom"));
app.use("/api/message", require("./routes/message"));

// 🩺 Health check
app.get("/", (req, res) => {
  res.send("✅ Server is running");
});

// 🔌 Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 📡 Socket.IO logic
const Message = require("./models/Message");

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    if (roomId) {
      socket.join(roomId);
      console.log(`📥 Joined room: ${roomId}`);
    }
  });

  socket.on("sendMessage", async ({ roomId, sender, text }) => {
    if (roomId && sender && text) {
      try {
        const newMessage = await Message.create({
          roomId,
          sender,
          text,
          timestamp: new Date().toISOString(),
          status: "sent"
        });

        io.to(roomId).emit("receiveMessage", newMessage);
        console.log("📤 Sent message to room:", roomId);
      } catch (err) {
        console.error("❌ Failed to save message:", err.message);
      }
    }
  });

  socket.on("messageSeen", async ({ messageId }) => {
    if (messageId) {
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { status: "seen" },
          { new: true }
        );
        if (updatedMessage) {
          io.emit("messageUpdated", updatedMessage);
        }
      } catch (err) {
        console.error("❌ Failed to update message status:", err.message);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
