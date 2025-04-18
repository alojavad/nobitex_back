// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  unmatchedAmount: String,
  amount: String,
  srcCurrency: String,
  dstCurrency: String,
  matchedAmount: String,
  isMyOrder: Boolean,
  price: String,
  type: String,
  totalPrice: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);

