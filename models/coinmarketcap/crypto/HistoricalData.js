const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  open: { type: Number, required: true }, // Opening price
  high: { type: Number, required: true }, // Highest price
  low: { type: Number, required: true }, // Lowest price
  close: { type: Number, required: true }, // Closing price
  volume: { type: Number, required: true }, // Trading volume
  last_updated: { type: Date, required: true }, // Last updated timestamp
}, { _id: false });

const HistoricalDataSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Cryptocurrency ID
  name: { type: String, required: true }, // Name of the cryptocurrency
  symbol: { type: String, required: true }, // Symbol of the cryptocurrency
  last_updated: { type: Date, required: true }, // Last updated timestamp
  time_open: { type: Date, required: true }, // Time when the period opened
  time_close: { type: Date, default: null }, // Time when the period closed
  time_high: { type: Date, required: true }, // Time of the highest price
  time_low: { type: Date, required: true }, // Time of the lowest price
  quote: { type: Map, of: QuoteSchema, required: true }, // Quotes for different currencies
});

// Indexes for faster queries
HistoricalDataSchema.index({ id: 1 }); // Index for the unique ID
HistoricalDataSchema.index({ symbol: 1 });
HistoricalDataSchema.index({ time_open: 1 });
HistoricalDataSchema.index({ time_close: 1 });

// Method to format the response
HistoricalDataSchema.methods.toJSON = function () {
  const historicalData = this.toObject();
  delete historicalData._id;
  delete historicalData.__v;
  return historicalData;
};

module.exports = mongoose.model('HistoricalData', HistoricalDataSchema);