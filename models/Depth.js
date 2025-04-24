const mongoose = require('mongoose');

const depthSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  lastTradePrice: {
    type: Number
  },
  bids: [{
    price: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  asks: [{
    price: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

// ایندکس برای جستجوی سریع
depthSchema.index({ symbol: 1, lastUpdate: -1 });

module.exports = mongoose.model('Depth', depthSchema); 