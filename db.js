const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Render PostgreSQL-এর জন্য
});

// টেবিল তৈরি (প্রথমবার রান হলে)
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bot_config (
      id SERIAL PRIMARY KEY,
      bot_token TEXT NOT NULL,
      welcome_message TEXT DEFAULT '🎮 স্বাগতম! নিচের মজার গেমগুলো ট্রাই করুন:',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS buttons (
      id SERIAL PRIMARY KEY,
      label TEXT NOT NULL,
      callback_data TEXT NOT NULL UNIQUE,
      style TEXT DEFAULT 'primary',
      emoji TEXT DEFAULT '🎮',
      enabled BOOLEAN DEFAULT TRUE
    );
  `);

  // ডিফল্ট বাটন ইনসার্ট (যদি টেবিল খালি থাকে)
  const res = await pool.query('SELECT COUNT(*) FROM buttons');
  if (parseInt(res.rows[0].count) === 0) {
    const defaultButtons = [
      ['🎲 ডাইস রোল', 'game_dice', 'primary', '🎲'],
      ['🎯 নাম্বার গেস', 'game_guess', 'success', '🎯'],
      ['🪙 কয়েন টস', 'game_coin', 'primary', '🪙'],
      ['😂 মিম', 'game_meme', 'danger', '😂'],
    ];
    for (const [label, cb, style, emoji] of defaultButtons) {
      await pool.query(
        'INSERT INTO buttons (label, callback_data, style, emoji) VALUES ($1,$2,$3,$4)',
        [label, cb, style, emoji]
      );
    }
  }
}

module.exports = { pool, initDB };