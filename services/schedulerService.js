const Agenda = require('agenda');
const nobitexService = require('./nobitexService');
const OrderBook = require('../models/OrderBook');
const MarketStat = require('../models/MarketStat');
const Trade = require('../models/Trade');
const Depth = require('../models/Depth');
const UDFHistory = require('../models/UDFHistory');


// تنظیمات اولیه
const FETCH_INTERVAL = '30 seconds';
const SYMBOLS = [
'BTCIRT', 'ETHIRT', 'LTCIRT', 'USDTIRT', 'XRPIRT', 'BCHIRT', 'BNBIRT'];

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

    // Fetch OrderBook V3
    const orderBookV3 = await nobitexService.getOrderBook(symbol);
    await OrderBook.create({ symbol, type: 'v3', data: orderBookV3 });

    // Fetch Depth
    const depth = await nobitexService.getDepth(symbol);
    await OrderBook.create({ symbol, type: 'depth', data: depth });

    // Fetch Trades V2
    const trades = await nobitexService.getTrades(symbol);
    await Trade.create({ symbol, data: trades });

    // Fetch Market Stats
    const marketStats = await nobitexService.getMarketStats(symbol.split('IRT')[0].toLowerCase(), 'rls');
    await MarketStat.create({ symbol, data: marketStats });

    // Fetch Historical Data (example: last 24 hours)
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 24 * 60 * 60;
    const UDFHistoryData = await nobitexService.getUDFHistory(symbol, 'D', oneDayAgo, now);
    await UDFHistory.create({ symbol, data: UDFHistoryData });

    console.log(`[${new Date().toISOString()}] Data fetched and saved for ${symbol}.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching data for ${symbol}:`, error);
  }
});

// ایجاد وظایف برای هر نماد
SYMBOLS.forEach((symbol) => {
  agenda.define(`fetch data for ${symbol}`, async (job) => {
    await agenda.now('fetch market data', { symbol });
  });
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