const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  price: { type: Number, required: true }, // Price of the cryptocurrency
  volume_24h: { type: Number, required: true }, // 24-hour trading volume
  market_cap: { type: Number, required: true }, // Market capitalization
  circulating_supply: { type: Number, required: true }, // Circulating supply
  total_supply: { type: Number, required: true }, // Total supply
  timestamp: { type: Date, required: true }, // Timestamp of the quote
}, { _id: false });

const IntervalQuoteSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true }, // Timestamp of the interval
  quote: { type: Map, of: QuoteSchema, required: true }, // Quotes for different currencies
}, { _id: false });

const IntervalQuotesSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Cryptocurrency ID
  name: { type: String, required: true }, // Name of the cryptocurrency
  symbol: { type: String, required: true }, // Symbol of the cryptocurrency
  is_active: { type: Boolean, required: true }, // Whether the cryptocurrency is active
  is_fiat: { type: Boolean, required: true }, // Whether the cryptocurrency is fiat
  quotes: { type: [IntervalQuoteSchema], required: true }, // Array of interval quotes
});

// Indexes for faster queries
IntervalQuotesSchema.index({ id: 1 }); // Index for the unique ID
IntervalQuotesSchema.index({ symbol: 1 });
IntervalQuotesSchema.index({ 'quotes.timestamp': 1 });

// Method to format the response
IntervalQuotesSchema.methods.toJSON = function () {
  const intervalQuotes = this.toObject();
  delete intervalQuotes._id;
  delete intervalQuotes.__v;
  return intervalQuotes;
};

module.exports = mongoose.model('IntervalQuotes', IntervalQuotesSchema);