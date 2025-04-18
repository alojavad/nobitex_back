// routes/nobitexRoutes.js
const express = require('express');
const router = express.Router();
const nobitexService = require('../services/nobitexService');
const Order = require('../models/Order');
const Trade = require('../models/Trade');
const MarketStats = require('../models/MarketStats');

// Get and save orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await nobitexService.getOrders();
    await Order.insertMany(orders.orders);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get and save trades
router.get('/trades', async (req, res) => {
  try {
    const trades = await nobitexService.getTrades();
    await Trade.insertMany(trades.trades);
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get and save market stats
router.get('/market-stats', async (req, res) => {
  try {
    const stats = await nobitexService.getMarketStats();
    await MarketStats.create(stats.stats);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
