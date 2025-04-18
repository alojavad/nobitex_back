// models/MarketStats.js
const mongoose = require('mongoose');

const marketStatsSchema = new mongoose.Schema({
  pair: String,
  bestSell: String,
  isClosed: Boolean,
  dayOpen: String,
  dayHigh: String,
  bestBuy: String,
  volumeSrc: String,
  dayLow: String,
  latest: String,
  volumeDst: String,
  dayChange: String,
  dayClose: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketStats', marketStatsSchema);
