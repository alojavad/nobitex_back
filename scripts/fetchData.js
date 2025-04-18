// scripts/fetchData.js
const nobitexService = require('../services/nobitexService');
const Order = require('../models/Order');
const Trade = require('../models/Trade');
const MarketStats = require('../models/MarketStats');

async function fetchAndSaveData() {
  try {
    // Login first
    await nobitexService.login();

    // Fetch and save orders
    const orders = await nobitexService.getOrders();
    await Order.insertMany(orders.orders);

    // Fetch and save trades
    const trades = await nobitexService.getTrades();
    await Trade.insertMany(trades.trades);

    // Fetch and save market stats
    const stats = await nobitexService.getMarketStats();
    await MarketStats.create(stats.stats);

    console.log('Data fetched and saved successfully');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Run every 5 minutes
setInterval(fetchAndSaveData, 5 * 60 * 1000);
fetchAndSaveData(); // Initial run
