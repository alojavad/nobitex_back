const mongoose = require('mongoose');

const marketStatsSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true
  },
  isClosed: {
    type: Boolean,
    required: true
  },
  bestSell: {
    type: Number,
    required: true
  },
  bestBuy: {
    type: Number,
    required: true
  },
  volumeSrc: {
    type: Number,
    required: true
  },
  volumeDst: {
    type: Number,
    required: true
  },
  latest: {
    type: Number,
    required: true
  },
  mark: {
    type: Number,
    required: true
  },
  dayLow: {
    type: Number,
    required: true
  },
  dayHigh: {
    type: Number,
    required: true
  },
  dayOpen: {
    type: Number,
    required: true
  },
  dayClose: {
    type: Number,
    required: true
  },
  dayChange: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MarketStats', marketStatsSchema);