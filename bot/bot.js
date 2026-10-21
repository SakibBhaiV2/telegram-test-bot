const { Telegraf } = require('telegraf');
const { Button, BotConfig, mongoose } = require('../db');

let botInstance = null;

function createBot(token) {
  if (botInstance) {
    try { botInstance.stop('restart'); } catch (e) {}
  }
  
  const bot = new Telegraf(token);

  // /start কমান্ড দিলে Reply Keyboard দেখাবে
  bot.start(async (ctx) => {
    if (mongoose.connection.readyState === 0) {
      return ctx.reply('⚠️ ডাটাবেস কানেক্টেড নেই। অ্যাডমিন প্যানেল থেকে MongoDB URL সেট করুন।');
    }

    const config = await BotConfig.findOne();
    const btnRes = await Button.find({ enabled: true }).sort({ _id: 1 });
    
    // ডাটাবেস থেকে বাটন নিয়ে ২ কলামের Reply Keyboard বানানো
    const keyboardRows = [];
    for (let i = 0; i < btnRes.length; i += 2) {
      const row = [];
      // ১ম বাটন
      row.push({
        text: `${btnRes[i].emoji} ${btnRes[i].label}`,
        style: btnRes[i].style // primary, success, danger
      });
      // ২য় বাটন (যদি থাকে)
      if (btnRes[i + 1]) {
        row.push({
          text: `${btnRes[i + 1].emoji} ${btnRes[i + 1].label}`,
          style: btnRes[i + 1].style
        });
      }
      keyboardRows.push(row);
    }

    // মেসেজের নিচে Reply Keyboard পাঠানো
    await ctx.reply(config?.welcomeMessage || '🎮 স্বাগতম!', {
      reply_markup: {
        keyboard: keyboardRows,
        resize_keyboard: true, // বাটনগুলো সুন্দরভাবে সাইজ হবে
        is_persistent: true    // কীবোর্ড সবসময় স্ক্রিনে থাকবে
      }
    });
  });

  // Reply Keyboard-এ ক্লিক করলে যেহেতু সাধারণ টেক্সট যায়, তাই 'text' হ্যান্ডেল করতে হবে
  bot.on('text', async (ctx) => {
    const text = ctx.message.text;

    // ডাটাবেস থেকে চেক করা ইউজার কোন বাটনে ক্লিক করেছে
    const allButtons = await Button.find();
    const clickedBtn = allButtons.find(b => text.includes(b.label));

    if (clickedBtn) {
      // আপনার পুরনো logic বা গেমগুলো এখানে বসাতে পারেন
      switch (clickedBtn.callback_data) {
        case 'profile':
          return ctx.reply('👤 আপনার প্রোফাইল লোড হচ্ছে...');
        case 'buy_vpn':
          return ctx.reply('🛡️ Buy VPN পেজে স্বাগতম...');
        case 'buy_id':
          return ctx.reply('🛒 Buy ID এর জন্য অ্যাভেইলেবল আইডি লিস্ট...');
        case 'buy_bm':
          return ctx.reply('📦 Buy BM এর জন্য আমাদের ইনভেন্টরি...');
        case 'deposit':
          return ctx.reply('💳 ডিপোজিট করার জন্য পেমেন্ট মেথড সিলেক্ট করুন...');
        case 'support':
          return ctx.reply('🎧 সাপোর্ট টিমের সাথে যোগাযোগ করুন: @YourSupportUsername');
        case 'replace':
          return ctx.reply('🔄 রিপ্লেস করার জন্য রুলস দেখুন...');
        case 'terms':
          return ctx.reply('📜 আমাদের শর্তাবলী: \n ১. ... \n ২. ...');
        // আপনার আগের গেম বাটনগুলো এখানে দিতে পারেন
        case 'game_dice':
          const roll = Math.floor(Math.random() * 6) + 1;
          return ctx.reply(`🎲 আপনি পেয়েছেন: ${roll}`);
        default:
          return ctx.reply('আপনি একটি বাটনে ক্লিক করেছেন!');
      }
    }
  });

  bot.launch();
  botInstance = bot;
  console.log('✅ বট চালু হয়েছে (Reply Keyboard মোডে)');
}

module.exports = { createBot };