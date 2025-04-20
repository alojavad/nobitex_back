// models/Trade.js
const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trade', tradeSchema);

