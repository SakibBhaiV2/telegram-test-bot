const { Telegraf, Markup } = require('telegraf');
const { InlineKeyboardBuilder } = require('telegram-inline-keyboard-builder');
const { pool } = require('../db');

let botInstance = null;

function createBot(token) {
  if (botInstance) botInstance.stop('restart');
  const bot = new Telegraf(token);

  // /start কমান্ড
  bot.start(async (ctx) => {
    const config = await pool.query('SELECT welcome_message FROM bot_config LIMIT 1');
    const welcomeText = config.rows[0]?.welcome_message || '🎮 স্বাগতম!';

    // ডেটাবেস থেকে এনাবলড বাটনগুলো নিয়ে রঙিন কিবোর্ড তৈরি
    const btnRes = await pool.query('SELECT * FROM buttons WHERE enabled = TRUE ORDER BY id');
    const builder = new InlineKeyboardBuilder(2); // প্রতি রো-তে ২টি বাটন
    for (const btn of btnRes.rows) {
      builder.addCallbackButton(`${btn.emoji} ${btn.label}`, btn.callback_data, {
        style: btn.style, // primary | success | danger
      });
    }
    await ctx.reply(welcomeText, builder.build());
  });

  // গেম কলব্যাক হ্যান্ডলার
  bot.action('game_dice', async (ctx) => {
    const roll = Math.floor(Math.random() * 6) + 1;
    await ctx.answerCbQuery();
    await ctx.reply(`🎲 আপনি পেয়েছেন: **${roll}**`, { parse_mode: 'Markdown' });
  });

  bot.action('game_coin', async (ctx) => {
    const result = Math.random() < 0.5 ? 'হেডস 🪙' : 'টেইলস 🪙';
    await ctx.answerCbQuery();
    await ctx.reply(`🪙 কয়েন টসের ফলাফল: **${result}**`, { parse_mode: 'Markdown' });
  });

  bot.action('game_meme', async (ctx) => {
    await ctx.answerCbQuery();
    // র‍্যান্ডম মিম (placeholder – আসল মিম URL ব্যবহার করতে পারেন)
    await ctx.replyWithPhoto('https://picsum.photos/400/300', {
      caption: '😂 আজকের মিম!',
    });
  });

  // নাম্বার গেস (সহজ ইন্টারঅ্যাকশন)
  const guesses = new Map();
  bot.action('game_guess', async (ctx) => {
    const target = Math.floor(Math.random() * 100) + 1;
    guesses.set(ctx.from.id, target);
    await ctx.answerCbQuery();
    await ctx.reply('🎯 আমি ১-১০০ এর মধ্যে একটি সংখ্যা ভেবেছি! আপনার অনুমান লিখুন:');
  });

  bot.on('text', async (ctx, next) => {
    const target = guesses.get(ctx.from.id);
    if (!target) return next();
    const num = parseInt(ctx.message.text);
    if (isNaN(num)) return ctx.reply('❌ শুধু সংখ্যা লিখুন।');
    if (num === target) {
      guesses.delete(ctx.from.id);
      await ctx.reply(`🎉 অভিনন্দন! সংখ্যাটি ছিল **${target}**`, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply(num < target ? '📈 আরও বড় সংখ্যা!' : '📉 আরও ছোট সংখ্যা!');
    }
  });

  bot.launch();
  botInstance = bot;
  console.log('✅ বট চালু হয়েছে');
}

module.exports = { createBot };