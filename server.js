require('dotenv').config();
const express = require('express');
const { connectDB, BotConfig } = require('./db');
const apiRoutes = require('./routes/api');
const { createBot } = require('./bot/bot');

const app = express();
app.use(express.json());
app.use(express.static('public')); // অ্যাডমিন প্যানেল ফাইল সার্ভ

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  // ১. প্রথমে ডাটাবেস কানেক্ট হবে
  await connectDB();

  // ২. ডাটাবেস থেকে বট টোকেন খোঁজা হবে
  const config = await BotConfig.findOne();
  if (config && config.botToken) {
    createBot(config.botToken); // টোকেন থাকলে বট চালু হবে
  } else {
    console.log('⚠️ বট টোকেন সেট করা নেই। অ্যাডমিন প্যানেল থেকে সেট করুন।');
  }

  app.listen(PORT, () => console.log(`🌐 সার্ভার চলছে: http://localhost:${PORT}`));
}

start();