const mongoose = require('mongoose');

const orderBookSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true
  },
  version: {
    type: String,
    default: 'v2'
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
orderBookSchema.index({ symbol: 1, lastUpdate: -1 });

module.exports = mongoose.model('OrderBook', orderBookSchema); 