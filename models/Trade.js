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
  timestamps: true,
  _id: true
});

tradeSchema.index({ symbol: 1, time: 1, price: 1, volume: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Trade', tradeSchema);

