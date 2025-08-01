// models/Chatroom.js
const mongoose = require('mongoose');

const chatroomSchema = new mongoose.Schema({
  name: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Chatroom', chatroomSchema);
