const { Telegraf, Markup } = require('telegraf');
const { Button, BotConfig, mongoose } = require('../db');

let botInstance = null;

function createBot(token) {
  if (botInstance) {
    try { botInstance.stop('restart'); } catch (e) {}
  }
  
  const bot = new Telegraf(token);

  // কুল ডিজাইনের মেইন মেনু
  bot.start(async (ctx) => {
    if (mongoose.connection.readyState === 0) {
      return ctx.reply('⚠️ Database offline.');
    }

    const config = await BotConfig.findOne();
    
    // ইনলাইন কিবোর্ড (Cyberpunk Style)
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔥 Hack System', 'hack_start'), Markup.button.callback('💻 Matrix Mode', 'matrix_mode')],
      [Markup.button.callback('👻 Ghost Protocol', 'ghost_protocol'), Markup.button.callback('📁 System Info', 'sys_info')]
    ]);

    const welcomeMsg = `
<b>╔══════════════════════════╗</b>
   <b>⚡ WELCOME TO CYBER NET ⚡</b>
<b>╚══════════════════════════╝</b>

<b>STATUS:</b> <code>🟢 ONLINE</code>
<b>USER:</b> <code>${ctx.from.first_name}</code>
<b>SECURITY:</b> <code>🛡️ MAXIMUM</code>

<i>নিচের অপশন থেকে আপনার মিশন সিলেক্ট করুন:</i>
`;
    
    await ctx.replyWithHTML(welcomeMsg, keyboard);
  });

  // ১. লাইভ হ্যাকিং অ্যানিমেশন (Live Progress Bar)
  bot.action('hack_start', async (ctx) => {
    await ctx.answerCbQuery('Initializing Hack...');
    const msg = await ctx.replyWithHTML(`<b>🚀 Initializing Hack Sequence...</b>\n<code>[□□□□□□□□□□] 0%</code>`);
    
    const steps = [
      { text: "Bypassing Firewall", percent: 20 },
      { text: "Extracting Database", percent: 50 },
      { text: "Downloading Passwords", percent: 80 },
      { text: "Access Granted", percent: 100 }
    ];

    for (let step of steps) {
      await new Promise(r => setTimeout(r, 1500)); // ১.৫ সেকেন্ড পর পর এডিট হবে
      let filled = '■'.repeat(step.percent / 10);
      let empty = '□'.repeat(10 - (step.percent / 10));
      await ctx.telegram.editMessageText(
        ctx.chat.id, 
        msg.message_id, 
        null, 
        `<b>⚙️ ${step.text}...</b>\n<code>[${filled}${empty}] ${step.percent}%</code>`, 
        { parse_mode: 'HTML' }
      );
    }

    await new Promise(r => setTimeout(r, 1000));
    await ctx.telegram.editMessageText(
      ctx.chat.id, 
      msg.message_id, 
      null, 
      `✅ <b>ACCESS GRANTED!</b>\n\nআপনার সিক্রেট ফাইলটি এখানে: \n<tg-spoiler>ভাই, এটা তো ফেক হ্যাকিং ছিল! 😂 আপনার পাসওয়ার্ড সেফ আছে।</tg-spoiler>`, 
      { parse_mode: 'HTML' }
    );
  });

  // ২. Matrix Mode (Zalgo Text Generator)
  bot.action('matrix_mode', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(`<b>💻 MATRIX MODE ACTIVATED</b>\n\nযেকোনো একটি কথা লিখে পাঠান, আমি সেটাকে হ্যাকার স্টাইলে কনভার্ট করে দিবো!`);
    // Zalgo ফাংশন চালু করার জন্য স্টেট (আমরা সহজে text হ্যান্ডেলার দিয়ে করবো)
    ctx.session = { matrixMode: true };
  });

  // ৩. Ghost Protocol
  bot.action('ghost_protocol', async (ctx) => {
    await ctx.answerCbQuery('Connecting...', { show_alert: true });
    await ctx.replyWithHTML(`
<b>👻 GHOST PROTOCOL ACTIVE</b>

<blockquote>আপনার আইপি অ্যাড্রেস সাকসেসফুলি হাইড করা হয়েছে। এখন আপনি সম্পূর্ণ অ্যানোনিমাস।</blockquote>

<b>IP:</b> <code>192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}</code>
<b>Location:</b> <code>Dark Web Server (Node 0x${Math.floor(Math.random() * 9999)})</code>
    `);
  });

  // ৪. System Info
  bot.action('sys_info', async (ctx) => {
    await ctx.answerCbQuery();
    const uptime = process.uptime();
    await ctx.replyWithHTML(`
<b>📁 SERVER DIAGNOSTICS</b>
<pre>
OS      : Linux (Render)
CPU     : Node.js ${process.version}
Uptime  : ${Math.floor(uptime)} seconds
RAM     : 512MB
DB      : MongoDB Connected
Status  : 🟢 HEALTHY
</pre>
    `);
  });

  // Matrix Mode-এর জন্য টেক্সট কনভার্টার (Zalgo Text)
  bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    // যদি ইউজার Matrix Mode-এ থাকে
    if (ctx.session?.matrixMode) {
      const matrixText = text.split('').map(char => {
        const chars = ['░', '▒', '▓', '█', '▄', '▀', '■', '□', '▪', '▫'];
        return char + chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      
      ctx.session.matrixMode = false; // একবার কনভার্ট করলেই বন্ধ হয়ে যাবে
      return ctx.replyWithHTML(`<code>${matrixText}</code>\n\n<i>Matrix conversion complete.</i>`);
    }

    // সাধারণ মেসেজের জন্য ডাটাবেস চেক
    const allButtons = await Button.find();
    const clickedBtn = allButtons.find(b => text.includes(b.label));

    if (clickedBtn) {
      return ctx.reply(`আপনি '${clickedBtn.label}' বাটনে ক্লিক করেছেন।`);
    }
  });

  bot.launch();
  botInstance = bot;
  console.log('✅ Cyberpunk Bot চালু হয়েছে!');
}

module.exports = { createBot };