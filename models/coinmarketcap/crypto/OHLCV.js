const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  open: { type: Number, required: true }, // Opening price
  high: { type: Number, required: true }, // Highest price
  low: { type: Number, required: true }, // Lowest price
  close: { type: Number, required: true }, // Closing price
  volume: { type: Number, required: true }, // Trading volume
  market_cap: { type: Number, required: true }, // Market capitalization
  timestamp: { type: Date, required: true }, // Timestamp of the quote
}, { _id: false });

const OHLCVQuoteSchema = new mongoose.Schema({
  time_open: { type: Date, required: true }, // Time when the period opened
  time_close: { type: Date, required: true }, // Time when the period closed
  time_high: { type: Date, required: true }, // Time of the highest price
  time_low: { type: Date, required: true }, // Time of the lowest price
  quote: { type: Map, of: QuoteSchema, required: true }, // Quotes for different currencies
}, { _id: false });

const OHLCVSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Cryptocurrency ID
  name: { type: String, required: true }, // Name of the cryptocurrency
  symbol: { type: String, required: true }, // Symbol of the cryptocurrency
  quotes: { type: [OHLCVQuoteSchema], required: true }, // Array of OHLCV quotes
});

// Indexes for faster queries
OHLCVSchema.index({ id: 1 }); // Index for the unique ID
OHLCVSchema.index({ symbol: 1 });
OHLCVSchema.index({ 'quotes.time_open': 1 });
OHLCVSchema.index({ 'quotes.time_close': 1 });

// Method to format the response
OHLCVSchema.methods.toJSON = function () {
  const ohlcv = this.toObject();
  delete ohlcv._id;
  delete ohlcv.__v;
  return ohlcv;
};

module.exports = mongoose.model('OHLCV', OHLCVSchema);