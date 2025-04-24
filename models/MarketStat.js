const mongoose = require('mongoose');

const MarketStatSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  isClosed: { type: Boolean, required: true },
  bestSell: { type: String, required: true },
  bestBuy: { type: String, required: true },
  volumeSrc: { type: String, required: true },
  volumeDst: { type: String, required: true },
  latest: { type: String, required: true },
  mark: { type: String, required: true },
  dayLow: { type: String, required: true },
  dayHigh: { type: String, required: true },
  dayOpen: { type: String, required: true },
  dayClose: { type: String, required: true },
  dayChange: { type: String, required: true },
});

module.exports = mongoose.model('MarketStat', MarketStatSchema);