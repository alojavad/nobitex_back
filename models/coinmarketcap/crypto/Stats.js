const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  open: { type: Number, required: true }, // Opening price
  open_timestamp: { type: Date, required: true }, // Timestamp of the opening price
  high: { type: Number, required: true }, // Highest price
  high_timestamp: { type: Date, required: true }, // Timestamp of the highest price
  low: { type: Number, required: true }, // Lowest price
  low_timestamp: { type: Date, required: true }, // Timestamp of the lowest price
  close: { type: Number, required: true }, // Closing price
  close_timestamp: { type: Date, required: true }, // Timestamp of the closing price
  percent_change: { type: Number, required: true }, // Percentage change
  price_change: { type: Number, required: true }, // Price change
}, { _id: false });

const PeriodSchema = new mongoose.Schema({
  open_timestamp: { type: Date, required: true }, // Timestamp of the opening period
  high_timestamp: { type: Date, required: true }, // Timestamp of the highest period
  low_timestamp: { type: Date, required: true }, // Timestamp of the lowest period
  close_timestamp: { type: Date, required: true }, // Timestamp of the closing period
  quote: { type: Map, of: QuoteSchema, required: true }, // Quotes for different currencies
}, { _id: false });

const StatsSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Cryptocurrency ID
  name: { type: String, required: true }, // Name of the cryptocurrency
  symbol: { type: String, required: true }, // Symbol of the cryptocurrency
  slug: { type: String, required: true }, // Slug of the cryptocurrency
  last_updated: { type: Date, required: true }, // Last updated timestamp
  periods: { type: Map, of: PeriodSchema, required: true }, // Periods data (e.g., all_time, 24h, 7d)
});

// Indexes for faster queries
StatsSchema.index({ id: 1 }); // Index for the unique ID
StatsSchema.index({ symbol: 1 });
StatsSchema.index({ slug: 1 });
StatsSchema.index({ last_updated: 1 });

// Method to format the response
StatsSchema.methods.toJSON = function () {
  const stats = this.toObject();
  delete stats._id;
  delete stats.__v;
  return stats;
};

module.exports = mongoose.model('Stats', StatsSchema);