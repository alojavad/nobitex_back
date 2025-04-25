const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  price: { type: Number, required: true }, // Price of the cryptocurrency
  volume_24h: { type: Number, required: true }, // 24-hour trading volume
  last_updated: { type: Date, required: true }, // Last updated timestamp
}, { _id: false });

const ExchangeReportedSchema = new mongoose.Schema({
  price: { type: Number, required: true }, // Exchange-reported price
  volume_24h_base: { type: Number, required: true }, // 24-hour base volume
  volume_24h_quote: { type: Number, required: true }, // 24-hour quote volume
  last_updated: { type: Date, required: true }, // Last updated timestamp
}, { _id: false });

const MarketPairBaseSchema = new mongoose.Schema({
  currency_id: { type: Number, required: true }, // Base currency ID
  currency_symbol: { type: String, required: true }, // Base currency symbol
  exchange_symbol: { type: String, required: true }, // Exchange symbol for the base currency
  currency_type: { type: String, required: true }, // Type of the base currency (e.g., cryptocurrency)
}, { _id: false });

const MarketPairQuoteSchema = new mongoose.Schema({
  currency_id: { type: Number, required: true }, // Quote currency ID
  currency_symbol: { type: String, required: true }, // Quote currency symbol
  exchange_symbol: { type: String, required: true }, // Exchange symbol for the quote currency
  currency_type: { type: String, required: true }, // Type of the quote currency (e.g., fiat)
}, { _id: false });

const MarketPairSchema = new mongoose.Schema({
  exchange: {
    id: { type: Number, required: true }, // Exchange ID
    name: { type: String, required: true }, // Exchange name
    slug: { type: String, required: true }, // Exchange slug
  },
  market_id: { type: Number, required: true }, // Market ID
  market_pair: { type: String, required: true }, // Market pair (e.g., BTC/USD)
  category: { type: String, required: true }, // Market category (e.g., spot, derivatives)
  fee_type: { type: String, required: true }, // Fee type (e.g., percentage, no-fees)
  market_pair_base: { type: MarketPairBaseSchema, required: true }, // Base currency details
  market_pair_quote: { type: MarketPairQuoteSchema, required: true }, // Quote currency details
  quote: {
    exchange_reported: { type: ExchangeReportedSchema, required: true }, // Exchange-reported quote
    USD: { type: QuoteSchema, required: true }, // USD quote
  },
}, { _id: false });

const MarketPairsSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Cryptocurrency ID
  name: { type: String, required: true }, // Name of the cryptocurrency
  symbol: { type: String, required: true }, // Symbol of the cryptocurrency
  num_market_pairs: { type: Number, required: true }, // Number of market pairs
  market_pairs: { type: [MarketPairSchema], required: true }, // List of market pairs
});

// Indexes for faster queries
MarketPairsSchema.index({ id: 1 }); // Index for the unique ID
MarketPairsSchema.index({ symbol: 1 });
MarketPairsSchema.index({ 'market_pairs.market_id': 1 });
MarketPairsSchema.index({ 'market_pairs.market_pair': 1 });

// Method to format the response
MarketPairsSchema.methods.toJSON = function () {
  const marketPairs = this.toObject();
  delete marketPairs._id;
  delete marketPairs.__v;
  return marketPairs;
};

module.exports = mongoose.model('MarketPairs', MarketPairsSchema);