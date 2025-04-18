// models/Trade.js
const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  market: String,
  total: String,
  price: String,
  amount: String,
  type: String,
  timestamp: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', tradeSchema);

