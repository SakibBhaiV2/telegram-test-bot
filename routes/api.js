const express = require('express');
const router = express.Router();
const { Button, BotConfig, mongoose } = require('../db');
const { createBot } = require('../bot/bot');

// ১. বট টোকেন সেভ এবং বট চালু
router.post('/config/token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'টোকেন দিন' });

  await BotConfig.findOneAndUpdate({}, { botToken: token }, { upsert: true });
  createBot(token); // নতুন টোকেনে বট চালু
  res.json({ success: true, message: 'বট সফলভাবে চালু হয়েছে!' });
});

// ২. স্বাগত মেসেজ আপডেট
router.post('/config/message', async (req, res) => {
  const { message } = req.body;
  await BotConfig.findOneAndUpdate({}, { welcomeMessage: message }, { upsert: true });
  res.json({ success: true });
});

// ৩. সব বাটন লিস্ট
router.get('/buttons', async (req, res) => {
  if (mongoose.connection.readyState === 0) return res.json([]);
  const buttons = await Button.find().sort({ _id: 1 });
  res.json(buttons);
});

// ৪. বাটন আপডেট
router.put('/buttons/:id', async (req, res) => {
  const { label, style, emoji, enabled } = req.body;
  await Button.findByIdAndUpdate(req.params.id, { label, style, emoji, enabled });
  res.json({ success: true });
});

module.exports = router;