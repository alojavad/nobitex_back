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
  'BTCIRT', 'ETHIRT', 'LTCIRT', 'USDTIRT', 'XRPIRT', 'BCHIRT', 'BNBIRT'  
];  

// API request limits (requests per minute)  
const REQUEST_LIMITS = {  
  orderBook: 300, // 300 requests per minute  
  depth: 300,      // 300 requests per minute  
  trades: 60,      // 60 requests per minute  
  marketStats: 20, // 20 requests per minute  
  udfHistory: 10   // 10 requests per minute  
};  

// Queue to track requests made  
const requestCounters = {  
  orderBook: 0,  
  depth: 0,  
  trades: 0,  
  marketStats: 0,  
  udfHistory: 0,  
};  

// Reset counters every minute  
setInterval(() => {  
  Object.keys(requestCounters).forEach((key) => {  
    requestCounters[key] = 0; // Reset count every minute  
  });  
}, 60000);  

// تنظیمات Agenda  
const agenda = new Agenda({  
  db: {  
    address: process.env.MONGODB_URI,  
    collection: 'nobitexJobs',  
  },  
  processEvery: '10 seconds', // Jobs processed every 10 seconds  
});  

// تعریف وظایف  
agenda.define('fetch market data', async (job) => {  
  const { symbol } = job.attrs.data;  
  try {  
    console.log(`[${new Date().toISOString()}] Fetching data for ${symbol}...`);  

    // Fetch OrderBook V3  
    if (requestCounters.orderBook < REQUEST_LIMITS.orderBook) {  
      const orderBookV3 = await nobitexService.getOrderBook(symbol);  
      await OrderBook.create({
        symbol,
        version: 'v3',
        lastUpdate: new Date(parseInt(orderBookV3.lastUpdate)),
        lastTradePrice: parseFloat(orderBookV3.lastTradePrice),
        asks: orderBookV3.asks.map(([price, amount]) => ({
          price: parseFloat(price),
          amount: parseFloat(amount)
        })),
        bids: orderBookV3.bids.map(([price, amount]) => ({
          price: parseFloat(price),
          amount: parseFloat(amount)
        }))
      });  
      requestCounters.orderBook++;  
    }  

    // Fetch Depth  
    if (requestCounters.depth < REQUEST_LIMITS.depth) {  
      const depth = await nobitexService.getDepth(symbol);  
      await Depth.create({ symbol, data: depth });  
      requestCounters.depth++;  
    }  

    // Fetch Trades V2  
    if (requestCounters.trades < REQUEST_LIMITS.trades) {  
      const trades = await nobitexService.getTrades(symbol);
      if (trades && trades.trades && trades.trades.length > 0) {
        const validTrades = trades.trades.filter(trade => {
          const tradeTime = new Date(parseInt(trade.time));
          if (isNaN(tradeTime.valueOf())) {
            console.warn(`Invalid timestamp for trade: ${JSON.stringify(trade)}`);
            return false; // Skip invalid trades
          }
          return true;
        });

        await Trade.insertMany(
          validTrades.map(trade => ({
            symbol,
            time: new Date(parseInt(trade.time)),
            price: parseFloat(trade.price),
            volume: parseFloat(trade.volume),
            type: trade.type,
          }))
        );
      }
      requestCounters.trades++;  
    }  

    // Fetch Market Stats  
    if (requestCounters.marketStats < REQUEST_LIMITS.marketStats) {  
      const marketStats = await nobitexService.getMarketStats(symbol.split('IRT')[0].toLowerCase(), 'rls');  
      await MarketStat.create({ symbol, data: marketStats });  
      requestCounters.marketStats++;  
    }  

    // Fetch Historical Data (example: last 24 hours)  
    const now = Math.floor(Date.now() / 1000);  
    const oneDayAgo = now - 24 * 60 * 60;  
    if (requestCounters.udfHistory < REQUEST_LIMITS.udfHistory) {  
      const UDFHistoryData = await nobitexService.getUDFHistory(symbol, 'D', oneDayAgo, now);  
      await UDFHistory.create({ symbol, data: UDFHistoryData });  
      requestCounters.udfHistory++;  
    }  

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
  SYMBOLS.forEach((symbol) => {  
    agenda.every(FETCH_INTERVAL, 'fetch market data', { symbol });  
  });  

  console.log('Agenda started. Jobs scheduled:');  
  console.log(`- Fetch market data every ${FETCH_INTERVAL} for symbols: ${SYMBOLS.join(', ')}`);  
}  

// تابع توقف زمان‌بندی  
async function stopScheduler() {  
  await agenda.stop();  
  console.log('Agenda stopped');  
}  

module.exports = {  
  startScheduler,  
  stopScheduler,  
};