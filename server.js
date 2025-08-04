// server.js

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

// Load env variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// 🔐 Allowed frontend origins
const allowedOrigins = [
  "https://chat-app-client-bhautiks-projects-e9693610.vercel.app",
  "https://chat-app-client-git-main-bhautiks-projects-e9693610.vercel.app",
  "chat-app-client-76n2gfh2c-bhautiks-projects-e9693610.vercel.app", 
  "http://chat-client-589qyt1mz-bhautiks-projects-e9693610.vercel.app",
  "https://chat-client-git-main-bhautiks-projects-e9693610.vercel.app",

  // ← Add this line
  "http://localhost:5173",
];


// ✅ Setup CORS middleware for Express
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

// ✅ Parse JSON requests
app.use(express.json());

// ✅ Connect to MongoDB
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

// ✅ Load API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/chatroom", require("./routes/chatroom"));
app.use("/api/message", require("./routes/message"));

// ✅ Default health check route
app.get("/", (req, res) => {
  res.send("✅ Server is running");
});

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    if (roomId) {
      socket.join(roomId);
      console.log(`📥 Joined room: ${roomId}`);
    }
  });

  socket.on("sendMessage", ({ roomId, sender, text }) => {
    if (roomId && sender && text) {
      const message = {
        roomId,
        sender,
        text,
        timestamp: new Date().toISOString(),
      };
      io.to(roomId).emit("receiveMessage", message);
      console.log("📤 Message sent to room:", roomId);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
