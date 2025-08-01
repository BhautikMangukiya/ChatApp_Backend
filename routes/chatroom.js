const express = require('express');
const router = express.Router();
const Chatroom = require('../models/Chatroom');

router.get('/', async (req, res) => {
  try {
    const rooms = await Chatroom.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chatrooms' });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Room name is required and must be a valid string' });
    }

    const existing = await Chatroom.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Chatroom already exists' });
    }

    const room = await Chatroom.create({ name: name.trim() });
    res.status(201).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create chatroom' });
  }
});

module.exports = router;
