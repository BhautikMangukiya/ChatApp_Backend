const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ List of allowed frontend origins (Vercel deployments)
const allowedOrigins = [
  "https://chat-app-client-jc6cd3cph-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-git-main-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-45642a0ct-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-git-main-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-76udmmtmy-bhautiks-projects-e9693610.vercel.app"

];

// ✅ CORS middleware with preflight support
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors()); // Handle preflight

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch((err) => {
  console.error("❌ MongoDB connection failed:", err);
});

// ✅ API routes
console.log("✅ Registering API routes...");
app.use("/api/auth", require("./routes/auth"));
app.use("/api/chatroom", require("./routes/chatroom"));
app.use("/api/message", require("./routes/message"));
console.log("✅ API routes registered");

// ✅ Health check
app.get("/", (req, res) => {
  res.send("🚀 DuoChat Backend is running");
});

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

io.on("connection", (socket) => {
  console.log("🟢 New connection:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`📦 Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.roomId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
