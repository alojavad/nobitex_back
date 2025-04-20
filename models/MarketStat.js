const mongoose = require('mongoose');

const marketStatSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    index: true
  },
  isClosed: {
    type: Boolean,
    default: false
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
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ایندکس‌های مورد نیاز
marketStatSchema.index({ symbol: 1, lastUpdate: -1 });

const MarketStat = mongoose.model('MarketStat', marketStatSchema);

module.exports = MarketStat; 