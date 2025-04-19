const nobitexService = require('../services/nobitexService');
const OrderBook = require('../models/OrderBook');
const MarketStats = require('../models/MarketStats');
const UDFHistory = require('../models/UDFHistory');

// Get order book
exports.getOrderBook = async (req, res) => {
  try {
    const { symbol, version } = req.query;
    const data = await nobitexService.getOrderBook(symbol, version);
    
    // Save to database
    await OrderBook.create({
      symbol,
      version,
      lastUpdate: data.lastUpdate,
      lastTradePrice: data.lastTradePrice,
      asks: data.asks,
      bids: data.bids
    });

    res.json(data);
  } catch (error) {
    console.error('Get order book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get market stats
exports.getMarketStats = async (req, res) => {
  try {
    const { srcCurrency, dstCurrency } = req.query;
    const data = await nobitexService.getMarketStats(srcCurrency, dstCurrency);
    
    // Save to database
    await MarketStats.create({
      symbol: `${srcCurrency}-${dstCurrency}`,
      isClosed: data.isClosed,
      bestSell: data.bestSell,
      bestBuy: data.bestBuy,
      volumeSrc: data.volumeSrc,
      volumeDst: data.volumeDst,
      latest: data.latest,
      mark: data.mark,
      dayLow: data.dayLow,
      dayHigh: data.dayHigh,
      dayOpen: data.dayOpen,
      dayClose: data.dayClose,
      dayChange: data.dayChange
    });

    res.json(data);
  } catch (error) {
    console.error('Get market stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get UDF history
exports.getUDFHistory = async (req, res) => {
  try {
    const { symbol, resolution, from, to } = req.query;
    const data = await nobitexService.getUDFHistory(symbol, resolution, from, to);
    
    // Save to database
    await UDFHistory.create({
      symbol,
      resolution,
      from: parseInt(from),
      to: parseInt(to),
      timestamps: data.t,
      open: data.o,
      high: data.h,
      low: data.l,
      close: data.c,
      volume: data.v
    });

    res.json(data);
  } catch (error) {
    console.error('Get UDF history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get global stats
exports.getGlobalStats = async (req, res) => {
  try {
    const data = await nobitexService.getGlobalStats();
    res.json(data);
  } catch (error) {
    console.error('Get global stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 