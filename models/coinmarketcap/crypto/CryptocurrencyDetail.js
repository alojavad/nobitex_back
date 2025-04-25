const mongoose = require('mongoose');

const UrlsSchema = new mongoose.Schema({
  website: [{ type: String }],
  technical_doc: [{ type: String }],
  twitter: [{ type: String }],
  reddit: [{ type: String }],
  message_board: [{ type: String }],
  announcement: [{ type: String }],
  chat: [{ type: String }],
  explorer: [{ type: String }],
  source_code: [{ type: String }],
}, { _id: false });

const CryptocurrencyDetailSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Cryptocurrency ID
  name: { type: String, required: true }, // Name of the cryptocurrency
  symbol: { type: String, required: true }, // Symbol of the cryptocurrency
  slug: { type: String, required: true }, // Slug of the cryptocurrency
  description: { type: String }, // Description of the cryptocurrency
  dateAdded: { type: Date }, // Date the cryptocurrency was added
  dateLaunched: { type: Date }, // Date the cryptocurrency was launched
  tags: [{ type: String }], // Tags associated with the cryptocurrency
  platform: {
    id: { type: Number },
    name: { type: String },
    symbol: { type: String },
    slug: { type: String },
    tokenAddress: { type: String },
  }, // Platform details (if applicable)
  category: { type: String }, // Category of the cryptocurrency (e.g., coin or token)
  urls: { type: UrlsSchema }, // URLs related to the cryptocurrency
  logo: { type: String }, // Logo URL
  notice: { type: String }, // Notice or additional information
});

// Indexes for faster queries
CryptocurrencyDetailSchema.index({ id: 1 }); // Index for the unique ID
CryptocurrencyDetailSchema.index({ symbol: 1 });
CryptocurrencyDetailSchema.index({ slug: 1 });

// Method to format the response
CryptocurrencyDetailSchema.methods.toJSON = function () {
  const cryptocurrency = this.toObject();
  delete cryptocurrency._id;
  delete cryptocurrency.__v;
  return cryptocurrency;
};

module.exports = mongoose.model('CryptocurrencyDetail', CryptocurrencyDetailSchema);