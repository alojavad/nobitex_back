const mongoose = require('mongoose');

const PlatformSchema = new mongoose.Schema({
  id: { type: Number, required: true }, // Platform ID
  name: { type: String, required: true }, // Platform name
  symbol: { type: String, required: true }, // Platform symbol
  slug: { type: String, required: true }, // Platform slug
  tokenAddress: { type: String, required: true }, // Token address on the platform
}, { _id: false });

const CryptocurrencySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Cryptocurrency ID
  rank: { type: Number, required: true }, // Rank of the cryptocurrency
  name: { type: String, required: true }, // Name of the cryptocurrency
  symbol: { type: String, required: true }, // Symbol of the cryptocurrency
  slug: { type: String, required: true }, // Slug of the cryptocurrency
  isActive: { type: Boolean, required: true }, // Whether the cryptocurrency is active
  firstHistoricalData: { type: Date, required: true }, // First historical data timestamp
  lastHistoricalData: { type: Date, required: true }, // Last historical data timestamp
  platform: { type: PlatformSchema, default: null }, // Platform details (if applicable)
});

// Indexes for faster queries
CryptocurrencySchema.index({ id: 1 }); // Index for the unique ID
CryptocurrencySchema.index({ rank: 1 });
CryptocurrencySchema.index({ symbol: 1 });
CryptocurrencySchema.index({ slug: 1 });
CryptocurrencySchema.index({ isActive: 1 });

// Method to format the response
CryptocurrencySchema.methods.toJSON = function () {
  const cryptocurrency = this.toObject();
  delete cryptocurrency._id;
  delete cryptocurrency.__v;
  return cryptocurrency;
};

module.exports = mongoose.model('Cryptocurrency', CryptocurrencySchema);