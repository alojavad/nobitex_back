const nobitexService = require('../services/nobitexService');
const OrderBook = require('../models/OrderBook');
const Trade = require('../models/Trade');
const MarketStat = require('../models/MarketStat');
const UDFHistory = require('../models/UDFHistory');
const Depth =  require('../models/Depth');

// ===== API‌های عمومی بازار =====

// دریافت لیست سفارش‌ها
exports.getOrderBook = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { version = 'v3' } = req.query;

    // Validate required parameters
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    // Fetch order book data from the service
    const orderbook = await nobitexService.getOrderBook(symbol, version);

    // Validate the response
    if (!orderbook || !orderbook.asks || !orderbook.bids) {
      return res.status(500).json({ error: 'Invalid order book data received' });
    }

    // Save order book to the database
    await OrderBook.create({
      symbol,
      version,
      lastUpdate: new Date(parseInt(orderbook.lastUpdate)),
      lastTradePrice: parseFloat(orderbook.lastTradePrice),
      asks: orderbook.asks.map(([price, amount]) => ({
        price: parseFloat(price),
        amount: parseFloat(amount),
      })),
      bids: orderbook.bids.map(([price, amount]) => ({
        price: parseFloat(price),
        amount: parseFloat(amount),
      })),
    });

    res.json(orderbook);
  } catch (error) {
    console.error('Error in getOrderBook:', error);
    res.status(500).json({ error: error.message });
  }
};

// دریافت نمودار عمق
exports.getDepth = async (req, res) => {
  try {
    const { symbol } = req.params;
    const depth = await nobitexService.getDepth(symbol);
    res.json(depth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// دریافت لیست معاملات
exports.getTrades = async (req, res) => {
  try {
    const { symbol } = req.params;
    const trades = await nobitexService.getTrades(symbol);
    await Trade.insertMany(trades.trades.map(trade => ({
      symbol,
      time: new Date(parseInt(trade.timestamp)),
      price: parseFloat(trade.price),
      volume: parseFloat(trade.amount),
      type: trade.type
    })));
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// دریافت آمار بازار
exports.getMarketStats = async (req, res) => {
  try {
    const { srcCurrency = 'btc', dstCurrency = 'rls' } = req.query;
    const stats = await nobitexService.getMarketStats(srcCurrency, dstCurrency);
    
    // Validate required data
    if (!stats || !stats.stats) {
      return res.status(500).json({ error: 'Invalid market stats data received' });
    }

    const symbol = `${srcCurrency}${dstCurrency}`.toUpperCase();
    const marketStat = stats.stats[symbol];

    if (!marketStat) {
      return res.status(404).json({ error: `No stats found for symbol ${symbol}` });
    }

    // Save market stats to database
    await MarketStat.create({
      symbol,
      isClosed: marketStat.isClosed,
      bestSell: parseFloat(marketStat.bestSell),
      bestBuy: parseFloat(marketStat.bestBuy),
      volumeSrc: parseFloat(marketStat.volumeSrc),
      volumeDst: parseFloat(marketStat.volumeDst),
      latest: parseFloat(marketStat.latest),
      mark: parseFloat(marketStat.mark),
      dayLow: parseFloat(marketStat.dayLow),
      dayHigh: parseFloat(marketStat.dayHigh),
      dayOpen: parseFloat(marketStat.dayOpen),
      dayClose: parseFloat(marketStat.dayClose),
      dayChange: parseFloat(marketStat.dayChange),
      lastUpdate: new Date()
    });

    res.json(marketStat);
  } catch (error) {
    console.error('Error in getMarketStats:', error);
    res.status(500).json({ error: error.message });
  }
};

// دریافت آمار OHLC بازار
exports.getUDFHistory = async (req, res) => {
  try {
    const { symbol = 'BTCIRT', resolution = 'D', from, to } = req.query;
    const history = await nobitexService.getUDFHistory(symbol, resolution, from, to);
    if (history.s === 'ok') {
      await UDFHistory.create({
        symbol,
        resolution,
        from: new Date(parseInt(from) * 1000),
        to: new Date(parseInt(to) * 1000),
        timestamps: history.t.map(t => new Date(t * 1000)),
        open: history.o.map(parseFloat),
        high: history.h.map(parseFloat),
        low: history.l.map(parseFloat),
        close: history.c.map(parseFloat),
        volume: history.v.map(parseFloat)
      });
    }
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
