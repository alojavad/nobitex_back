require('dotenv').config();
const mongoose = require('mongoose');
const Agenda = require('agenda');
const nobitexService = require('../services/nobitexService');
const OrderBook = require('../models/OrderBook');
const MarketStat = require('../models/MarketStat');
const Trade = require('../models/Trade');

// تنظیمات اولیه
const FETCH_INTERVAL = '30 seconds';
const SYMBOLS = ['BTCIRT', 'ETHIRT', 'LTCIRT', 'XRPIRT', 'DOGEIRT'];

// اتصال به دیتابیس
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// تنظیمات Agenda
const agenda = new Agenda({
  db: {
    address: process.env.MONGODB_URI,
    collection: 'nobitexJobs'
  },
  processEvery: '10 seconds'
});

// تعریف وظایف
agenda.define('fetch market data', async (job) => {
  const { symbol } = job.attrs.data;
  try {
    console.log(`[${new Date().toISOString()}] Fetching data for ${symbol}...`);
    
    // دریافت Order Book
    const orderBook = await nobitexService.getOrderBook(symbol);
    if (orderBook) {
      await OrderBook.create({
        symbol,
        bids: orderBook.bids,
        asks: orderBook.asks,
        timestamp: new Date()
      });
      console.log(`[${new Date().toISOString()}] Saved order book for ${symbol}`);
    }

    // دریافت Trades
    const trades = await nobitexService.getTrades(symbol);
    if (trades && trades.length > 0) {
      await Trade.insertMany(trades.map(trade => ({
        symbol,
        price: trade.price,
        volume: trade.volume,
        type: trade.type,
        time: new Date(trade.time)
      })));
      console.log(`[${new Date().toISOString()}] Saved ${trades.length} trades for ${symbol}`);
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching data for ${symbol}:`, error.message);
  }
});

agenda.define('fetch market stats', async () => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching market stats...`);
    const stats = await nobitexService.getMarketStats();
    if (stats) {
      await MarketStat.create({
        ...stats,
        timestamp: new Date()
      });
      console.log(`[${new Date().toISOString()}] Saved market stats`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching market stats:`, error.message);
  }
});

// شروع Agenda
(async function() {
  await agenda.start();
  
  // زمان‌بندی وظایف
  SYMBOLS.forEach(symbol => {
    agenda.every(FETCH_INTERVAL, 'fetch market data', { symbol });
  });
  
  agenda.every(FETCH_INTERVAL, 'fetch market stats');
  
  console.log('Agenda started. Jobs scheduled:');
  console.log(`- Fetch market data every ${FETCH_INTERVAL} for symbols: ${SYMBOLS.join(', ')}`);
  console.log(`- Fetch market stats every ${FETCH_INTERVAL}`);
}); 