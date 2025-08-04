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

// ✅ Include all active Vercel deployments here
const allowedOrigins = [
  "https://chat-app-client-beryl-five.vercel.app",
  "https://chat-app-client-git-main-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-cnvz786wy-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-76n2gfh2c-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-bjyamuy2j-bhautiks-projects-e9693610.vercel.app"
];

// ✅ Full CORS support including preflight
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
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors()); // Preflight

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

// ✅ API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/chatroom", require("./routes/chatroom"));
app.use("/api/message", require("./routes/message"));

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("🚀 DuoChat Backend is running");
});

// ✅ Socket.IO server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

io.on("connection", (socket) => {
  console.log("🟢 New Socket.IO connection:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`📦 User ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.roomId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket.IO disconnected:", socket.id);
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
