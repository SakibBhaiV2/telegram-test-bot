const mongoose = require('mongoose');

// আপনার MongoDB URL
const MONGO_URI = "mongodb+srv://mdsakibhosen1219_db_user:FnNwf6EBidZKadlw@cluster0.lqo8wfr.mongodb.net/telegram_bot?retryWrites=true&w=majority";

// স্কিমা ডিফাইন করা
const ButtonSchema = new mongoose.Schema({
  label: String,
  callback_data: { type: String, unique: true },
  style: { type: String, default: 'primary' },
  emoji: String,
  enabled: { type: Boolean, default: true }
});

const BotConfigSchema = new mongoose.Schema({
  botToken: { type: String, default: '' },
  welcomeMessage: { type: String, default: '🎮 স্বাগতম! নিচের মজার গেমগুলো ট্রাই করুন:' }
});

const Button = mongoose.model('Button', ButtonSchema);
const BotConfig = mongoose.model('BotConfig', BotConfigSchema);

// ডাটাবেস কানেক্ট করার ফাংশন
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB সফলভাবে কানেক্ট হয়েছে');
    
    // ডিফল্ট কনফিগ তৈরি
    const configCount = await BotConfig.countDocuments();
    if (configCount === 0) {
      await BotConfig.create({ welcomeMessage: '🎮 স্বাগতম! নিচের মজার গেমগুলো ট্রাই করুন:' });
    }

    // ডিফল্ট বাটন তৈরি
    const btnCount = await Button.countDocuments();
    if (btnCount === 0) {
      const defaultButtons = [
        { label: 'ডাইস রোল', callback_data: 'game_dice', style: 'primary', emoji: '🎲' },
        { label: 'নাম্বার গেস', callback_data: 'game_guess', style: 'success', emoji: '🎯' },
        { label: 'কয়েন টস', callback_data: 'game_coin', style: 'primary', emoji: '🪙' },
        { label: 'মিম', callback_data: 'game_meme', style: 'danger', emoji: '😂' },
      ];
      await Button.insertMany(defaultButtons);
    }
    return true;
  } catch (error) {
    console.error('❌ MongoDB কানেকশন এরর:', error.message);
    return false;
  }
}

module.exports = { connectDB, Button, BotConfig, mongoose };