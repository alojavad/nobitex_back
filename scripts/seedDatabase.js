require('dotenv').config();
const mongoose = require('mongoose');
const OrderBook = require('../models/OrderBook');
const MarketStat = require('../models/MarketStat');
const UDFHistory = require('../models/UDFHistory');
const Trade = require('../models/Trade');
const NobitexService = require('../services/nobitexService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nobitex';

const nobitexService = new NobitexService();

// تابع تاخیر
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAndSaveData() {
  try {
    // دریافت و ذخیره‌سازی دفتر سفارشات
    const orderBookData = await nobitexService.getOrderBook('BTCIRT');
    if (orderBookData) {
      await OrderBook.findOneAndUpdate(
        { symbol: 'BTCIRT' },
        orderBookData,
        { upsert: true, new: true }
      );
      console.log(new Date().toISOString(), '- OrderBook data saved successfully');
    }

    // دریافت و ذخیره‌سازی معاملات
    const tradesData = await nobitexService.getTrades('BTCIRT');
    if (tradesData && tradesData.length > 0) {
      for (const trade of tradesData) {
        await Trade.findOneAndUpdate(
          { 
            symbol: 'BTCIRT',
            time: trade.time,
            price: trade.price,
            volume: trade.volume,
            type: trade.type
          },
          trade,
          { upsert: true, new: true }
        );
      }
      console.log(new Date().toISOString(), '- Trades data saved successfully');
    }

    // دریافت و ذخیره‌سازی آمار بازار
    const marketStats = await nobitexService.getMarketStats();
    if (marketStats) {
      await MarketStat.findOneAndUpdate(
        { symbol: 'BTCIRT' },
        marketStats,
        { upsert: true, new: true }
      );
      console.log(new Date().toISOString(), '- Market stats saved successfully');
    }

  } catch (error) {
    console.error(new Date().toISOString(), '- Error fetching data:', error);
  }
}

async function startPeriodicFetch() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // حلقه بی‌نهایت برای دریافت داده‌ها هر 30 ثانیه
    while (true) {
      await fetchAndSaveData();
      console.log(new Date().toISOString(), '- Waiting 30 seconds for next fetch...');
      await delay(30000); // تاخیر 30 ثانیه
    }
  } catch (error) {
    console.error('Error in periodic fetch:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// شروع دریافت دوره‌ای داده‌ها
console.log('Starting periodic data fetch every 30 seconds...');
startPeriodicFetch(); 