require('dotenv').config();
const express = require('express');
const { initDB } = require('./db');
const apiRoutes = require('./routes/api');
const { createBot } = require('./bot/bot');

const app = express();
app.use(express.json());
app.use(express.static('public')); // অ্যাডমিন প্যানেল ফাইল সার্ভ

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  await initDB();

  // ডেটাবেসে সেভ করা টোকেন থাকলে বট অটো-স্টার্ট
  const { pool } = require('./db');
  const config = await pool.query('SELECT bot_token FROM bot_config LIMIT 1');
  if (config.rows[0]?.bot_token) {
    createBot(config.rows[0].bot_token);
  }

  app.listen(PORT, () => console.log(`🌐 সার্ভার চলছে: http://localhost:${PORT}`));
}

start();