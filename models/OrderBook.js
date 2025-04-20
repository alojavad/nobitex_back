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
    required: true
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

module.exports = mongoose.model('OrderBook', orderBookSchema); 