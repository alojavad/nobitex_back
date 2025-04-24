const OrderBook = require('../models/OrderBook');
const Trade = require('../models/Trade');
const MarketStat = require('../models/MarketStat');
const UDFHistory = require('../models/UDFHistory');
const Depth = require('../models/Depth');

// دریافت لیست سفارش‌ها
exports.getOrderBook = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { version = 'v3' } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const orderBook = await OrderBook.findOne({ symbol, version }).sort({ lastUpdate: -1 });

    if (!orderBook) {
      return res.status(404).json({ error: 'Order book not found' });
    }

    res.json(orderBook);
  } catch (error) {
    console.error('Error in getOrderBook:', error);
    res.status(500).json({ error: error.message });
  }
};

// دریافت نمودار عمق
exports.getDepth = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const depth = await Depth.findOne({ symbol }).sort({ createdAt: -1 });

    if (!depth) {
      return res.status(404).json({ error: 'Depth data not found' });
    }

    res.json(depth);
  } catch (error) {
    console.error('Error in getDepth:', error);
    res.status(500).json({ error: error.message });
  }
};

// دریافت لیست معاملات
exports.getTrades = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const trades = await Trade.find({ symbol }).sort({ time: -1 }).limit(100);

    if (!trades || trades.length === 0) {
      return res.status(404).json({ error: 'Trades not found' });
    }

    res.json(trades);
  } catch (error) {
    console.error('Error in getTrades:', error);
    res.status(500).json({ error: error.message });
  }
};

// دریافت آمار بازار
exports.getMarketStats = async (req, res) => {
  try {
    const { srcCurrency = 'btc', dstCurrency = 'rls' } = req.query;
    const symbol = `${srcCurrency}-${dstCurrency}`;

    const marketStat = await MarketStat.findOne({ symbol }).sort({ updatedAt: -1 });

    if (!marketStat) {
      return res.status(404).json({ error: `Market stats not found for symbol ${symbol}` });
    }

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

    if (!symbol || !resolution || !from || !to) {
      return res.status(400).json({ error: 'Symbol, resolution, from, and to are required' });
    }

    // Convert the from and to parameters to Date objects (milliseconds)
    // const fromDate = new Date(parseInt(from) * 1000);
    // const toDate = new Date(parseInt(to) * 1000);

    console.log('Request Parameters:', { symbol, resolution, from, to });

    // Query for the UDFHistory record where the timestamp is within the given range
    const history = await UDFHistory.findOne({
      symbol,
      resolution,
      from: { $lte: from },
      to: { $gte: to },
    });

    // If no history is found, send a 404 error
    if (!history) {
      return res.status(404).json({ error: 'UDF history not found' });
    }

    // Send the found history as a response
    res.json(history);
  } catch (error) {
    console.error('Error in getUDFHistory:', error);
    res.status(500).json({ error: error.message });
  }
};
