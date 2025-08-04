const express = require('express');
const router = express.Router();
const Chatroom = require('../models/Chatroom');

// Get all chatrooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Chatroom.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error('Fetch chatrooms error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chatrooms.' });
  }
});

// Create a new chatroom
router.post('/create', async (req, res) => {
  try {
    const { name } = req.body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Room name is required and must be a valid string.' });
    }

    const trimmedName = name.trim();

    // Check for duplicate room
    const existingRoom = await Chatroom.findOne({ name: trimmedName });
    if (existingRoom) {
      return res.status(409).json({ success: false, message: 'Chatroom already exists.' });
    }

    // Create new room
    const newRoom = await Chatroom.create({ name: trimmedName });
    return res.status(201).json({ success: true, room: newRoom });
  } catch (error) {
    console.error('Create chatroom error:', error);
    res.status(500).json({ success: false, message: 'Failed to create chatroom.' });
  }
});

module.exports = router;
