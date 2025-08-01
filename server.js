const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Move this ABOVE where it's used
const allowedOrigins = [
  "https://chat-client-ten-iota.vercel.app",
  "https://chat-client-4dvz9sk2p-bhautiks-projects-e9693610.vercel.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

// ✅ Use CORS for Express
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Use CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ DB & Routes
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

app.use("/api/auth", require("./routes/auth"));
app.use("/api/chatroom", require("./routes/chatroom"));
app.use("/api/message", require("./routes/message"));

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId) => {
    if (roomId) socket.join(roomId);
  });

  socket.on("sendMessage", (data) => {
    const { roomId, sender, text } = data;
    if (roomId && sender && text) {
      io.to(roomId).emit("receiveMessage", {
        roomId,
        sender,
        text,
        timestamp: new Date().toISOString(),
      });
    }
  });
});

app.get("/", (req, res) => {
  res.send("server test");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
