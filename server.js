const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const path = require("path");

dotenv.config(); // Load .env config

const app = express();
const server = http.createServer(app);

// ✅ ALLOWED CLIENT ORIGINS (include all active Vercel URLs)
const allowedOrigins = [
  "https://chat-app-client-beryl-five.vercel.app",
  "https://chat-app-client-git-main-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-cnvz786wy-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-76n2gfh2c-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-bjyamuy2j-bhautiks-projects-e9693610.vercel.app", // newly deployed client
];

// ✅ Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Import Routes
const authRoutes = require("./routes/auth");
const chatroomRoutes = require("./routes/chatroom");
const messageRoutes = require("./routes/message");

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chatroom", chatroomRoutes);
app.use("/api/message", messageRoutes);

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("🚀 Chat App Backend is Running");
});

// ✅ Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🟢 New connection:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`📦 ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", (data) => {
    // Broadcast to the same room
    io.to(data.roomId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});

// ✅ Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
