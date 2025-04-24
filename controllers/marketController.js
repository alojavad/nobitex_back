const nobitexService = require('../services/nobitexService');
const OrderBook = require('../models/OrderBook');
const Trade = require('../models/Trade');
const MarketStat = require('../models/MarketStat');
const UDFHistory = require('../models/UDFHistory');

// ===== API‌های عمومی بازار =====

// دریافت لیست سفارش‌ها
exports.getOrderBook = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { version = 'v3' } = req.query;
    const orderbook = await nobitexService.getOrderBook(symbol, version);
    await OrderBook.create({
      symbol,
      version,
      lastUpdate: new Date(parseInt(orderbook.lastUpdate)),
      lastTradePrice: parseFloat(orderbook.lastTradePrice),
      asks: orderbook.asks.map(([price, amount]) => ({
        price: parseFloat(price),
        amount: parseFloat(amount)
      })),
      bids: orderbook.bids.map(([price, amount]) => ({
        price: parseFloat(price),
        amount: parseFloat(amount)
      }))
    });
    res.json(orderbook);
  } catch (error) {
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
      time: new Date(parseInt(trade.time)),
      price: parseFloat(trade.price),
      volume: parseFloat(trade.volume),
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
    const marketStat = stats.stats[`${srcCurrency}-${dstCurrency}`];
    await MarketStat.create({
      symbol: `${srcCurrency}${dstCurrency}`.toUpperCase(),
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
      dayChange: parseFloat(marketStat.dayChange)
    });
    res.json(stats);
  } catch (error) {
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

// دریافت آمار بازار جهانی
exports.getGlobalStats = async (req, res) => {
  try {
    const stats = await nobitexService.getGlobalStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};