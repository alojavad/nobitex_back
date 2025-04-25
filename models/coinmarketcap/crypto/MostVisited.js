const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  price: { type: Number, required: true }, // Price of the cryptocurrency
  volume_24h: { type: Number, required: true }, // 24-hour trading volume
  percent_change_1h: { type: Number, required: true }, // Percentage change in the last 1 hour
  percent_change_24h: { type: Number, required: true }, // Percentage change in the last 24 hours
  percent_change_7d: { type: Number, required: true }, // Percentage change in the last 7 days
  market_cap: { type: Number, required: true }, // Market capitalization
  last_updated: { type: Date, required: true }, // Last updated timestamp
}, { _id: false });

const MostVisitedSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Cryptocurrency ID
  name: { type: String, required: true }, // Name of the cryptocurrency
  symbol: { type: String, required: true }, // Symbol of the cryptocurrency
  slug: { type: String, required: true }, // Slug of the cryptocurrency
  cmc_rank: { type: Number, required: true }, // CoinMarketCap rank
  num_market_pairs: { type: Number, required: true }, // Number of market pairs
  circulating_supply: { type: Number, required: true }, // Circulating supply
  total_supply: { type: Number, required: true }, // Total supply
  max_supply: { type: Number, default: null }, // Maximum supply
  last_updated: { type: Date, required: true }, // Last updated timestamp
  date_added: { type: Date, required: true }, // Date the cryptocurrency was added
  tags: { type: [String], default: [] }, // Tags associated with the cryptocurrency
  platform: { type: mongoose.Schema.Types.Mixed, default: null }, // Platform details (if applicable)
  quote: { type: Map, of: QuoteSchema, required: true }, // Quotes for different currencies
});

// Indexes for faster queries
MostVisitedSchema.index({ id: 1 }); // Index for the unique ID
MostVisitedSchema.index({ cmc_rank: 1 });
MostVisitedSchema.index({ symbol: 1 });
MostVisitedSchema.index({ slug: 1 });
MostVisitedSchema.index({ last_updated: 1 });

// Method to format the response
MostVisitedSchema.methods.toJSON = function () {
  const mostVisited = this.toObject();
  delete mostVisited._id;
  delete mostVisited.__v;
  return mostVisited;
};

module.exports = mongoose.model('MostVisited', MostVisitedSchema);