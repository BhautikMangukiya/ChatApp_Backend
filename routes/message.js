const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      return res.status(400).json({ success: false, message: 'Invalid room ID' });
    }

    const messages = await Message.find({ roomId: roomId.trim() }).sort({ timestamp: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { roomId, sender, text } = req.body;

    if (!roomId || !sender || !text) {
      return res.status(400).json({ success: false, message: 'roomId, sender, and text are required' });
    }

    const message = await Message.create({
      roomId: roomId.trim(),
      sender: sender.trim(),
      text: text.trim()
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

module.exports = router;
