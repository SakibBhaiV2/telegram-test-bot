const { Telegraf } = require('telegraf');
const { InlineKeyboardBuilder } = require('telegram-inline-keyboard-builder');
const { Button, BotConfig, mongoose } = require('../db');

let botInstance = null;

function createBot(token) {
  if (botInstance) {
    try { botInstance.stop('restart'); } catch (e) {}
  }
  
  const bot = new Telegraf(token);

  bot.start(async (ctx) => {
    if (mongoose.connection.readyState === 0) {
      return ctx.reply('⚠️ ডাটাবেস কানেক্টেড নেই।');
    }

    const config = await BotConfig.findOne();
    const btnRes = await Button.find({ enabled: true }).sort({ _id: 1 });
    
    const builder = new InlineKeyboardBuilder(2);
    for (const btn of btnRes) {
      builder.addCallbackButton(`${btn.emoji} ${btn.label}`, btn.callback_data, {
        style: btn.style,
      });
    }
    await ctx.reply(config?.welcomeMessage || '🎮 স্বাগতম!', builder.build());
  });

  // গেমস
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
    await ctx.replyWithPhoto('https://picsum.photos/400/300', { caption: '😂 আজকের মিম!' });
  });

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