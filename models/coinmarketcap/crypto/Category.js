const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Unique ID of the category
  name: { type: String, required: true }, // Name of the category
  title: { type: String, required: true }, // Title of the category
  description: { type: String, required: true }, // Description of the category
  numTokens: { type: Number, required: true }, // Number of tokens in the category
  avgPriceChange: { type: Number, required: true }, // Average price change of tokens in the category
  marketCap: { type: Number, required: true }, // Market cap of the category
  marketCapChange: { type: Number, required: true }, // Market cap change percentage
  volume: { type: Number, required: true }, // Volume of the category
  volumeChange: { type: Number, required: true }, // Volume change percentage
  lastUpdated: { type: Date, required: true }, // Last updated timestamp
});

// Indexes for faster queries
CategorySchema.index({ id: 1 }); // Index for the unique ID
CategorySchema.index({ name: 1 });
CategorySchema.index({ title: 1 });
CategorySchema.index({ lastUpdated: 1 });

// Method to format the response
CategorySchema.methods.toJSON = function () {
  const category = this.toObject();
  delete category._id;
  delete category.__v;
  return category;
};

module.exports = mongoose.model('Category', CategorySchema);