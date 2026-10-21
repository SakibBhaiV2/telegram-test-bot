const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { createBot } = require('../bot/bot');

// বট টোকেন সেভ ও বট চালু
router.post('/config/token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'টোকেন দিন' });
  await pool.query('DELETE FROM bot_config');
  await pool.query('INSERT INTO bot_config (bot_token) VALUES ($1)', [token]);
  createBot(token); // নতুন টোকেনে বট রিস্টার্ট
  res.json({ success: true, message: 'বট চালু হয়েছে!' });
});

// স্বাগত মেসেজ আপডেট
router.post('/config/message', async (req, res) => {
  const { message } = req.body;
  await pool.query('UPDATE bot_config SET welcome_message = $1', [message]);
  res.json({ success: true });
});

// সব বাটন লিস্ট
router.get('/buttons', async (req, res) => {
  const result = await pool.query('SELECT * FROM buttons ORDER BY id');
  res.json(result.rows);
});

// বাটন আপডেট
router.put('/buttons/:id', async (req, res) => {
  const { label, style, emoji, enabled } = req.body;
  await pool.query(
    'UPDATE buttons SET label=$1, style=$2, emoji=$3, enabled=$4 WHERE id=$5',
    [label, style, emoji, enabled, req.params.id]
  );
  res.json({ success: true });
});

module.exports = router;