// routes/message.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get messages
router.get('/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({ timestamp: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Create message
router.post('/', async (req, res) => {
  try {
    const { roomId, sender, text } = req.body;
    if (!roomId || !sender || !text) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const message = await Message.create({
      roomId,
      sender,
      text,
      status: 'sent'
    });
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Mark as delivered
router.put('/:id/delivered', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: 'delivered' },
      { new: true }
    );
    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update message status' });
  }
});

// Mark as seen
router.put('/:id/seen', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: 'seen' },
      { new: true }
    );
    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update message status' });
  }
});

module.exports = router;
