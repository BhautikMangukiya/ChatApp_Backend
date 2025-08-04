// server.js

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const Message = require("./models/Message");

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Define allowed frontend origins
const allowedOrigins = [
  "https://chat-app-client-beryl-five.vercel.app",
  "https://chat-app-client-git-main-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-777434ay5-bhautiks-projects-e9693610.vercel.app",
  "http://localhost:5173",
];

// Apply CORS policy for Express
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

// Enable JSON parsing
app.use(express.json());

// Connect to MongoDB
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

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/chatroom", require("./routes/chatroom"));
app.use("/api/message", require("./routes/message"));

// Health check endpoint
app.get("/", (_, res) => res.send("✅ Server is running"));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // Join a chat room
  socket.on("joinRoom", (roomId) => {
    if (roomId) {
      socket.join(roomId);
      console.log(`📥 Client ${socket.id} joined room: ${roomId}`);
    }
  });

  // Handle new message
  socket.on("sendMessage", async ({ roomId, sender, text, replyTo }) => {
    if (!roomId || !sender || !text) return;

    try {
      const message = await Message.create({
        roomId,
        sender,
        text,
        replyTo,
        timestamp: new Date().toISOString(),
        status: "sent",
      });

      // Emit to everyone in the room (including sender)
      io.to(roomId).emit("receiveMessage", message);
      console.log(`📤 Message sent in room ${roomId}`);
    } catch (err) {
      console.error("❌ Error sending message:", err.message);
    }
  });

  // Optional: Update message status (seen/read)
  socket.on("messageSeen", async ({ messageId }) => {
    try {
      const updated = await Message.findByIdAndUpdate(
        messageId,
        { status: "seen" },
        { new: true }
      );
      if (updated) {
        io.to(updated.roomId).emit("messageUpdated", updated);
        console.log(`👀 Message seen: ${messageId}`);
      }
    } catch (err) {
      console.error("❌ Error updating message status:", err.message);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
