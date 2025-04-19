const mongoose = require('mongoose');

const orderBookSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  bids: [{
    price: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    orderId: {
      type: String,
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
    },
    orderId: {
      type: String,
      required: true
    }
  }],
  lastUpdate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OrderBook', orderBookSchema); 