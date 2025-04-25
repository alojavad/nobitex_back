const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  price: { type: Number, required: true }, // Current price
  volume_24h: { type: Number, required: true }, // 24-hour trading volume
  volume_change_24h: { type: Number, required: true }, // 24-hour volume change percentage
  percent_change_1h: { type: Number, required: true }, // Percentage change in the last 1 hour
  percent_change_24h: { type: Number, required: true }, // Percentage change in the last 24 hours
  percent_change_7d: { type: Number, required: true }, // Percentage change in the last 7 days
  percent_change_30d: { type: Number, required: true }, // Percentage change in the last 30 days
  market_cap: { type: Number, required: true }, // Market capitalization
  market_cap_dominance: { type: Number, required: true }, // Market cap dominance percentage
  fully_diluted_market_cap: { type: Number, required: true }, // Fully diluted market cap
  last_updated: { type: Date, required: true }, // Last updated timestamp
}, { _id: false });

const CryptoDetailsSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Cryptocurrency ID
  name: { type: String, required: true }, // Name of the cryptocurrency
  symbol: { type: String, required: true }, // Symbol of the cryptocurrency
  slug: { type: String, required: true }, // Slug of the cryptocurrency
  is_active: { type: Boolean, required: true }, // Whether the cryptocurrency is active
  is_fiat: { type: Boolean, required: true }, // Whether the cryptocurrency is fiat
  circulating_supply: { type: Number, required: true }, // Circulating supply
  total_supply: { type: Number, required: true }, // Total supply
  max_supply: { type: Number, default: null }, // Maximum supply
  date_added: { type: Date, required: true }, // Date the cryptocurrency was added
  num_market_pairs: { type: Number, required: true }, // Number of market pairs
  cmc_rank: { type: Number, required: true }, // CoinMarketCap rank
  last_updated: { type: Date, required: true }, // Last updated timestamp
  tags: { type: [String], default: [] }, // Tags associated with the cryptocurrency
  platform: { type: mongoose.Schema.Types.Mixed, default: null }, // Platform details (if applicable)
  self_reported_circulating_supply: { type: Number, default: null }, // Self-reported circulating supply
  self_reported_market_cap: { type: Number, default: null }, // Self-reported market cap
  quote: { type: Map, of: QuoteSchema, required: true }, // Quotes for different currencies
});

// Indexes for faster queries
CryptoDetailsSchema.index({ id: 1 }); // Index for the unique ID
CryptoDetailsSchema.index({ symbol: 1 });
CryptoDetailsSchema.index({ slug: 1 });
CryptoDetailsSchema.index({ last_updated: 1 });

// Method to format the response
CryptoDetailsSchema.methods.toJSON = function () {
  const cryptoDetails = this.toObject();
  delete cryptoDetails._id;
  delete cryptoDetails.__v;
  return cryptoDetails;
};

module.exports = mongoose.model('CryptoDetails', CryptoDetailsSchema);