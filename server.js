const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      'https://chat-client-jglr6b1t3-bhautiks-projects-e9693610.vercel.app',
      'http://localhost:5173'
    ],
    methods: ['GET', 'POST']
  }
});


const corsOptions = {
  origin: [
    'https://chat-client-ten-iota.vercel.app',  // ✅ no trailing slash
    'https://chat-client-jglr6b1t3-bhautiks-projects-e9693610.vercel.app', // ✅ Add Vercel preview domain
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));



app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/chatroom', require('./routes/chatroom'));
app.use('/api/message', require('./routes/message'));

io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId) => {
    if (roomId) socket.join(roomId);
  });

  socket.on('sendMessage', (data) => {
    const { roomId, sender, text } = data;
    if (roomId && sender && text) {
      io.to(roomId).emit('receiveMessage', {
        roomId,
        sender,
        text,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('disconnect', () => {});
});

app.get('/', (req, res) => {
  res.send('server test')
})


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
