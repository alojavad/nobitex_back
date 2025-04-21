const Agenda = require('agenda');
const nobitexService = require('./nobitexService');
const OrderBook = require('../models/OrderBook');
const MarketStat = require('../models/MarketStat');
const Trade = require('../models/Trade');

// تنظیمات اولیه
const FETCH_INTERVAL = '30 seconds';
const SYMBOLS = ['BTCIRT', 'ETHIRT', 'LTCIRT', 'XRPIRT', 'DOGEIRT'];

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
    const orderBookData = await nobitexService.getOrderBook(symbol);
    if (orderBookData && orderBookData.status === 'ok') {
      await OrderBook.findOneAndUpdate(
        { symbol },
        {
          symbol,
          bids: orderBookData.bids,
          asks: orderBookData.asks,
          lastTradePrice: orderBookData.lastTradePrice,
          lastUpdate: new Date(orderBookData.lastUpdate)
        },
        { upsert: true, new: true }
      );
      console.log(`[${new Date().toISOString()}] Saved order book for ${symbol}`);
    }

    // دریافت Trades
    const tradesData = await nobitexService.getTrades(symbol);
    if (tradesData && tradesData.status === 'ok' && tradesData.trades && tradesData.trades.length > 0) {
      // ذخیره هر معامله به صورت جداگانه با استفاده از findOneAndUpdate
      for (const trade of tradesData.trades) {
        const tradeDoc = {
          symbol,
          price: parseFloat(trade.price),
          volume: parseFloat(trade.volume),
          type: trade.type,
          time: new Date(trade.time)
        };

        await Trade.findOneAndUpdate(
          {
            symbol: tradeDoc.symbol,
            time: tradeDoc.time,
            price: tradeDoc.price,
            volume: tradeDoc.volume,
            type: tradeDoc.type
          },
          tradeDoc,
          { upsert: true, new: true }
        );
      }
      console.log(`[${new Date().toISOString()}] Saved ${tradesData.trades.length} trades for ${symbol}`);
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching data for ${symbol}:`, error.message);
  }
});

agenda.define('fetch market stats', async () => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching market stats...`);
    const statsData = await nobitexService.getMarketStats();
    if (statsData && statsData.status === 'ok' && statsData.stats) {
      for (const [symbol, stats] of Object.entries(statsData.stats)) {
        await MarketStat.findOneAndUpdate(
          { symbol },
          {
            symbol,
            isClosed: stats.isClosed,
            bestSell: parseFloat(stats.bestSell),
            bestBuy: parseFloat(stats.bestBuy),
            volumeSrc: parseFloat(stats.volumeSrc),
            volumeDst: parseFloat(stats.volumeDst),
            latest: parseFloat(stats.latest),
            mark: parseFloat(stats.mark),
            dayLow: parseFloat(stats.dayLow),
            dayHigh: parseFloat(stats.dayHigh),
            dayOpen: parseFloat(stats.dayOpen),
            dayClose: parseFloat(stats.dayClose),
            dayChange: parseFloat(stats.dayChange)
          },
          { upsert: true, new: true }
        );
      }
      console.log(`[${new Date().toISOString()}] Saved market stats`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching market stats:`, error.message);
  }
});

// تابع شروع زمان‌بندی
async function startScheduler() {
  await agenda.start();
  
  // زمان‌بندی وظایف
  SYMBOLS.forEach(symbol => {
    agenda.every(FETCH_INTERVAL, 'fetch market data', { symbol });
  });
  
  agenda.every(FETCH_INTERVAL, 'fetch market stats');
  
  console.log('Agenda started. Jobs scheduled:');
  console.log(`- Fetch market data every ${FETCH_INTERVAL} for symbols: ${SYMBOLS.join(', ')}`);
  console.log(`- Fetch market stats every ${FETCH_INTERVAL}`);
}

// تابع توقف زمان‌بندی
async function stopScheduler() {
  await agenda.stop();
  console.log('Agenda stopped');
}

module.exports = {
  startScheduler,
  stopScheduler
}; 