const Agenda = require('agenda');  
const nobitexService = require('./nobitexService');  
const coinmarketcapService = require('./coinmarketcapService'); // Import CoinmarketcapService
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

// Define CoinMarketCap jobs
agenda.define('fetch cryptocurrency quotes', async (job) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching cryptocurrency quotes...`);
    await coinmarketcapService.fetchAndSaveCryptocurrencyQuotes({ id: '1', convert: 'USD' });
    console.log(`[${new Date().toISOString()}] Cryptocurrency quotes fetched and saved.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching cryptocurrency quotes:`, error);
  }
});

agenda.define('fetch OHLCV historical data', async (job) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching OHLCV historical data...`);
    await coinmarketcapService.fetchAndSaveOHLCVData({ id: '1', time_start: '2023-01-01', time_end: '2023-12-31', convert: 'USD' });
    console.log(`[${new Date().toISOString()}] OHLCV historical data fetched and saved.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching OHLCV historical data:`, error);
  }
});

agenda.define('fetch price performance stats', async (job) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching price performance stats...`);
    await coinmarketcapService.fetchAndSavePricePerformanceStats({ id: '1', time_period: 'all_time', convert: 'USD' });
    console.log(`[${new Date().toISOString()}] Price performance stats fetched and saved.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching price performance stats:`, error);
  }
});

agenda.define('fetch historical quotes (v3)', async (job) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching historical quotes (v3)...`);
    await coinmarketcapService.fetchAndSaveHistoricalQuotesV3({
      id: '1',
      time_start: '2023-01-01T00:00:00Z',
      time_end: '2023-12-31T23:59:59Z',
      interval: 'daily',
      convert: 'USD',
    });
    console.log(`[${new Date().toISOString()}] Historical quotes (v3) fetched and saved.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching historical quotes (v3):`, error);
  }
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
          const tradeTime = new Date(trade.time); // Directly use the ISO 8601 string
          if (isNaN(tradeTime.valueOf())) {
            console.warn(`Invalid timestamp for trade: ${JSON.stringify(trade)}`);
            return false; // Skip invalid trades
          }
          return true;
        });

        try {
          // Use bulkWrite to handle duplicates gracefully
          const bulkOps = validTrades.map(trade => ({
            updateOne: {
              filter: {
                symbol, // Ensure symbol is included
                time: new Date(trade.time),
                price: parseFloat(trade.price),
                volume: parseFloat(trade.volume),
                type: trade.type,
              },
              update: {
                $setOnInsert: {
                  symbol, // Ensure symbol is included
                  time: new Date(trade.time),
                  price: parseFloat(trade.price),
                  volume: parseFloat(trade.volume),
                  type: trade.type,
                },
              },
              upsert: true, // Insert if not exists
            },
          }));

          await Trade.bulkWrite(bulkOps);
        } catch (error) {
          console.error(`Error inserting trades for ${symbol}:`, error);
        }
      }
      requestCounters.trades++;
    }

    // Fetch Market Stats  
    if (requestCounters.marketStats < REQUEST_LIMITS.marketStats) {  
      try {
        const marketStats = await nobitexService.getMarketStats('btc', 'rls');

        // Use upsert to avoid duplicates
        await MarketStat.updateOne(
          { symbol: marketStats.symbol },
          { $set: marketStats },
          { upsert: true }
        );

        console.log(`Market stats updated for ${marketStats.symbol}`);
      } catch (error) {
        console.error(`Error fetching market stats:`, error);
      }

      requestCounters.marketStats++;
    }  

    // Fetch Historical Data (example: last 24 hours)  
    const now = Math.floor(Date.now() / 1000);  
    const oneDayAgo = now - 24 * 60 * 60;  
    if (requestCounters.udfHistory < REQUEST_LIMITS.udfHistory) {  
      try {
        const resolution = 'D'; // Daily resolution
        const UDFHistoryData = await nobitexService.getUDFHistory(symbol, resolution, oneDayAgo, now);

        await UDFHistory.create({
          symbol,
          resolution,
          from: oneDayAgo,
          to: now,
          timestamps: UDFHistoryData.timestamps,
          open: UDFHistoryData.open,
          high: UDFHistoryData.high,
          low: UDFHistoryData.low,
          close: UDFHistoryData.close,
          volume: UDFHistoryData.volume,
        });

        console.log(`UDF history saved for ${symbol}`);
        requestCounters.udfHistory++;
      } catch (error) {
        console.error(`Error fetching UDF history for ${symbol}:`, error);
      }
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

// Schedule CoinMarketCap jobs
async function scheduleCoinMarketCapJobs() {
  await agenda.every('1 hour', 'fetch cryptocurrency quotes');
  await agenda.every('1 day', 'fetch OHLCV historical data');
  await agenda.every('1 day', 'fetch price performance stats');
  await agenda.every('1 day', 'fetch historical quotes (v3)');
}

// تابع شروع زمان‌بندی  
async function startScheduler() {  
  await agenda.start();  

  // زمان‌بندی وظایف  
  SYMBOLS.forEach((symbol) => {  
    agenda.every(FETCH_INTERVAL, 'fetch market data', { symbol });  
  });  

  // Schedule CoinMarketCap jobs
  await scheduleCoinMarketCapJobs();

  console.log('Agenda started. Jobs scheduled:');  
  console.log(`- Fetch market data every ${FETCH_INTERVAL} for symbols: ${SYMBOLS.join(', ')}`);  
  console.log('- Fetch cryptocurrency quotes every 1 hour');
  console.log('- Fetch OHLCV historical data every 1 day');
  console.log('- Fetch price performance stats every 1 day');
  console.log('- Fetch historical quotes (v3) every 1 day');
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