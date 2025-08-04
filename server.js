// server.js
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const path = require("path");

// Load .env file
dotenv.config();

// App setup
const app = express();
const server = http.createServer(app);

// Allowed frontend domains (Vercel URLs)
const allowedOrigins = [
  "https://chat-app-client-beryl-five.vercel.app",
  "https://chat-app-client-git-main-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-cnvz786wy-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-76n2gfh2c-bhautiks-projects-e9693610.vercel.app",
];

// CORS middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes (Replace with your own routes)
const authRoutes = require("./routes/authRoutes");
const chatroomRoutes = require("./routes/chatroomRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/chatroom", chatroomRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("⚡ A user connected: " + socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`🟢 User ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", ({ roomId, message }) => {
    io.to(roomId).emit("receiveMessage", { message });
    console.log(`💬 Message to room ${roomId}:`, message);
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected: " + socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
